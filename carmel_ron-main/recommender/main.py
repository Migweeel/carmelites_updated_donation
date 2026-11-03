import hmac
import logging
import os
import pickle
import re
import tempfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Literal
from uuid import uuid4

import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException
from lightfm import LightFM
from lightfm.data import Dataset
from pydantic import BaseModel, ConfigDict, Field
from scipy import sparse

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("carmelights-recommender")

MODEL_DIR = Path(os.getenv("MODEL_DIR", "/data"))
MODEL_PATH = MODEL_DIR / "lightfm-model.pkl"
API_TOKEN = os.getenv("RECOMMENDER_API_TOKEN", "")
COMPONENTS = max(8, min(128, int(os.getenv("LATENT_COMPONENTS", "30"))))
EPOCHS = max(5, min(100, int(os.getenv("TRAINING_EPOCHS", "25"))))
VIEW_WEIGHT = float(os.getenv("VIEW_WEIGHT", "1"))
BOOKMARK_WEIGHT = float(os.getenv("BOOKMARK_WEIGHT", "3"))
MODEL_LOCK = RLock()
STOP_WORDS = {
    "the", "and", "for", "with", "from", "that", "this", "into", "your", "you",
    "are", "was", "were", "our", "their", "have", "has", "will", "what", "when",
    "where", "which", "who", "how", "not", "but", "can", "all", "one", "more",
    "than", "through", "about", "carmel", "carmelite", "saint", "teaching",
}

if not API_TOKEN:
    raise RuntimeError("RECOMMENDER_API_TOKEN must be configured before starting the service.")
if VIEW_WEIGHT <= 0 or BOOKMARK_WEIGHT <= 0:
    raise RuntimeError("VIEW_WEIGHT and BOOKMARK_WEIGHT must be positive values.")

app = FastAPI(title="Carmels in Communion LightFM", version="1.0.0")


class Reading(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(min_length=1, max_length=100)
    title: str = Field(default="", max_length=200)
    author: str = Field(default="", max_length=200)
    body: str = Field(default="", max_length=100_000)
    published: bool = True
    popularity: int = Field(default=0, ge=0)


class Interaction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: str = Field(min_length=1, max_length=100)
    reading_id: str = Field(min_length=1, max_length=100)
    event_type: Literal["VIEW", "BOOKMARK", "UNBOOKMARK"]
    created_at: datetime


class TrainRequest(BaseModel):
    readings: list[Reading] = Field(max_length=1000)
    interactions: list[Interaction] = Field(max_length=500_000)


class RecommendRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    readings: list[Reading] = Field(max_length=1000)
    exclude_ids: list[str] = Field(default_factory=list, max_length=1000)
    history_ids: list[str] = Field(default_factory=list, max_length=1000)
    limit: int = Field(default=8, ge=1, le=20)


class Recommendation(BaseModel):
    reading_id: str
    score: float
    reason: str


class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]
    source: Literal["lightfm", "fallback"]
    model_version: str | None = None


class RelatedRequest(BaseModel):
    reading_id: str = Field(min_length=1, max_length=100)
    readings: list[Reading] = Field(max_length=1000)
    limit: int = Field(default=4, ge=1, le=10)


class TrainResponse(BaseModel):
    status: Literal["trained", "insufficient_data"]
    model_version: str | None = None
    trained_at: str | None = None
    users: int
    readings: int
    interactions: int
    configuration: dict[str, int | float | str]
    evaluation: dict[str, object]


def require_internal_token(authorization: str | None = Header(default=None)) -> None:
    provided = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not hmac.compare_digest(provided, API_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid internal service token.")


def metadata_features(reading: Reading) -> set[str]:
    words = [
        word for word in re.findall(r"[a-z0-9]{3,}", f"{reading.title} {reading.author} {reading.body[:5000]}".lower())
        if word not in STOP_WORDS
    ]
    author = reading.author.strip().lower()
    features = {f"topic:{word}" for word in words}
    if author:
        features.add(f"author:{author}")
    return features


def latest_user_reading_events(interactions: list[Interaction], published_ids: set[str]) -> dict[tuple[str, str], Interaction]:
    latest: dict[tuple[str, str], Interaction] = {}
    for interaction in interactions:
        if interaction.reading_id not in published_ids:
            continue
        key = (interaction.user_id, interaction.reading_id)
        current = latest.get(key)
        if current is None or interaction.created_at > current.created_at:
            latest[key] = interaction
    return latest


def aggregate_preferences(interactions: list[Interaction], published_ids: set[str]) -> tuple[dict[tuple[str, str], float], dict[str, set[str]]]:
    latest_views: dict[tuple[str, str], Interaction] = {}
    latest_bookmark_action: dict[tuple[str, str], Interaction] = {}
    preferences: dict[tuple[str, str], float] = defaultdict(float)
    seen_by_user: dict[str, set[str]] = defaultdict(set)
    for interaction in interactions:
        if interaction.reading_id not in published_ids:
            continue
        key = (interaction.user_id, interaction.reading_id)
        if interaction.event_type == "VIEW":
            current_view = latest_views.get(key)
            if current_view is None or interaction.created_at > current_view.created_at:
                latest_views[key] = interaction
        else:
            current_bookmark = latest_bookmark_action.get(key)
            if current_bookmark is None or interaction.created_at > current_bookmark.created_at:
                latest_bookmark_action[key] = interaction
    for user_id, reading_id in latest_views:
        preferences[(user_id, reading_id)] += VIEW_WEIGHT
        seen_by_user[user_id].add(reading_id)
    for key, interaction in latest_bookmark_action.items():
        if interaction.event_type == "BOOKMARK":
            preferences[key] += BOOKMARK_WEIGHT
            seen_by_user[key[0]].add(key[1])
    return preferences, seen_by_user


def build_training_dataset(
    readings: list[Reading], interactions: list[Interaction]
) -> tuple[Dataset, sparse.coo_matrix, sparse.coo_matrix, sparse.csr_matrix, dict[str, int], dict[str, int]]:
    item_features = {reading.id: metadata_features(reading) for reading in readings}
    dataset = Dataset()
    dataset.fit(
        users=sorted({interaction.user_id for interaction in interactions}),
        items=[reading.id for reading in readings],
        item_features=sorted({feature for features in item_features.values() for feature in features}),
    )
    aggregated, _ = aggregate_preferences(interactions, {reading.id for reading in readings})
    rows = [(user_id, reading_id, weight) for (user_id, reading_id), weight in aggregated.items()]
    matrix, weights = dataset.build_interactions(rows)
    feature_matrix = dataset.build_item_features(
        ((reading_id, sorted(features)) for reading_id, features in item_features.items()),
        normalize=False,
    )
    user_mapping, _, item_mapping, _ = dataset.mapping()
    return dataset, matrix, weights, feature_matrix, user_mapping, item_mapping


def ranking_metrics(
    readings: list[Reading], train_events: list[Interaction], test_events: list[tuple[str, str]]
) -> dict[str, object]:
    heldout = set(test_events)
    eligible_users = {user_id for user_id, _ in heldout}
    if len(eligible_users) < 2 or len(heldout) < 3 or len(train_events) < 4:
        return {"available": False, "reason": "Not enough distinct users and held-out interactions for a reliable ranking evaluation."}
    try:
        dataset, matrix, weights, features, user_mapping, item_mapping = build_training_dataset(readings, train_events)
        if not user_mapping or len(item_mapping) < 2:
            return {"available": False, "reason": "Not enough training history to evaluate ranking quality."}
        model = LightFM(no_components=COMPONENTS, loss="warp", random_state=42)
        model.fit(matrix, sample_weight=weights, item_features=features, epochs=max(5, EPOCHS // 2), num_threads=1, verbose=False)
        item_ids = list(item_mapping.keys())
        train_preferences, _ = aggregate_preferences(train_events, set(item_ids))
        popularity = Counter(reading_id for (_, reading_id), weight in train_preferences.items() if weight > 0)
        model_hits = 0
        baseline_hits = 0
        total = 0
        evaluated_users = 0
        for user_id in eligible_users:
            relevant = {reading_id for candidate_user, reading_id in heldout if candidate_user == user_id}
            if user_id not in user_mapping:
                continue
            known_positive = {
                reading_id for (candidate_user, reading_id), weight in train_preferences.items()
                if candidate_user == user_id and weight > 0
            }
            candidates = [reading_id for reading_id in item_ids if reading_id not in known_positive]
            if not candidates or not relevant:
                continue
            user_index = user_mapping[user_id]
            candidate_indices = np.asarray([item_mapping[reading_id] for reading_id in candidates])
            scores = model.predict(user_index, candidate_indices, item_features=features, num_threads=1)
            ranked_model = [candidates[index] for index in np.argsort(-scores)[:5]]
            ranked_popular = sorted(candidates, key=lambda reading_id: popularity[reading_id], reverse=True)[:5]
            model_hits += len(set(ranked_model) & relevant)
            baseline_hits += len(set(ranked_popular) & relevant)
            total += len(relevant)
            evaluated_users += 1
        if not total:
            return {"available": False, "reason": "No eligible held-out interactions remained after filtering known readings."}
        return {
            "available": True,
            "test_users": evaluated_users,
            "test_interactions": total,
            "k": 5,
            "lightfm_precision_at_k": round(model_hits / (evaluated_users * 5), 4),
            "lightfm_recall_at_k": round(model_hits / total, 4),
            "popularity_precision_at_k": round(baseline_hits / (evaluated_users * 5), 4),
            "popularity_recall_at_k": round(baseline_hits / total, 4),
        }
    except Exception:
        logger.exception("Offline ranking evaluation failed")
        return {"available": False, "reason": "Ranking evaluation failed; see recommendation service logs."}


def read_model() -> dict[str, object] | None:
    with MODEL_LOCK:
        if not MODEL_PATH.exists():
            return None
        try:
            with MODEL_PATH.open("rb") as model_file:
                return pickle.load(model_file)
        except (OSError, pickle.PickleError, EOFError):
            logger.exception("Unable to load persisted LightFM model")
            return None


def fallback_recommendations(
    readings: list[Reading], exclude_ids: set[str], limit: int, history_ids: set[str] | None = None
) -> list[Recommendation]:
    history_ids = history_ids or set()
    history_features = set().union(*(metadata_features(reading) for reading in readings if reading.id in history_ids))
    candidates = [
        reading for reading in readings if reading.published and reading.id not in exclude_ids
    ]
    candidates.sort(
        key=lambda reading: (
            len(metadata_features(reading) & history_features),
            reading.popularity,
        ),
        reverse=True,
    )
    seen_authors: set[str] = set()
    chosen: list[Reading] = []
    for reading in candidates:
        author = reading.author.strip().lower()
        if author and author in seen_authors and len(chosen) < limit // 2:
            continue
        chosen.append(reading)
        if author:
            seen_authors.add(author)
        if len(chosen) == limit:
            break
    return [
        Recommendation(
            reading_id=reading.id,
            score=float(reading.popularity),
            reason="Related to your reading interests" if metadata_features(reading) & history_features else "Popular Carmelights teaching",
        )
        for reading in chosen
    ]


@app.get("/health", dependencies=[Depends(require_internal_token)])
def health() -> dict[str, object]:
    model = read_model()
    return {
        "status": "ok",
        "model_available": model is not None,
        "model_version": model.get("version") if model else None,
        "trained_at": model.get("trained_at") if model else None,
        "configuration": model.get("config") if model else None,
        "evaluation": model.get("evaluation") if model else None,
    }


@app.post("/train", response_model=TrainResponse, dependencies=[Depends(require_internal_token)])
def train(request: TrainRequest) -> TrainResponse:
    readings = [reading for reading in request.readings if reading.published]
    published_ids = {reading.id for reading in readings}
    eligible = [event for event in request.interactions if event.reading_id in published_ids]
    preference_weights, _ = aggregate_preferences(eligible, published_ids)
    meaningful = list(preference_weights)
    users = {user_id for user_id, _ in meaningful}
    evaluation: dict[str, object] = {"available": False, "reason": "Not enough distinct users and history to evaluate."}
    trained_status: Literal["trained", "insufficient_data"] = "insufficient_data"
    model_version: str | None = None
    trained_at: str | None = None

    if len(users) >= 2 and len(readings) >= 3 and len(meaningful) >= 6:
        latest_events = latest_user_reading_events(eligible, published_ids)
        sorted_pairs = sorted(
            (key for key, weight in preference_weights.items() if weight > 0),
            key=lambda key: latest_events[key].created_at,
        )
        split_index = max(1, int(len(sorted_pairs) * 0.8))
        test = sorted_pairs[split_index:]
        test_keys = set(test)
        cutoff = latest_events[sorted_pairs[split_index]].created_at if split_index < len(sorted_pairs) else datetime.max.replace(tzinfo=timezone.utc)
        train_events = [
            event for event in eligible
            if event.created_at < cutoff and (event.user_id, event.reading_id) not in test_keys
        ]
        evaluation = ranking_metrics(readings, train_events, test)
        dataset, interactions_matrix, sample_weights, feature_matrix, user_mapping, item_mapping = build_training_dataset(readings, eligible)
        if interactions_matrix.nnz >= 4 and len(user_mapping) >= 2 and len(item_mapping) >= 3:
            model = LightFM(no_components=COMPONENTS, loss="warp", random_state=42)
            model.fit(
                interactions_matrix,
                sample_weight=sample_weights,
                item_features=feature_matrix,
                epochs=EPOCHS,
                num_threads=max(1, min(4, os.cpu_count() or 1)),
                verbose=False,
            )
            model_version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid4().hex[:8]
            _, seen_by_user = aggregate_preferences(eligible, published_ids)
            trained_at = datetime.now(timezone.utc).isoformat()
            bundle = {
                "version": model_version,
                "trained_at": trained_at,
                "model": model,
                "user_mapping": user_mapping,
                "item_mapping": item_mapping,
                "item_features": feature_matrix,
                "user_readings": {user_id: sorted(seen_by_user.get(user_id, set())) for user_id in user_mapping},
                "config": {
                    "algorithm": "LightFM",
                    "loss": "warp",
                    "components": COMPONENTS,
                    "epochs": EPOCHS,
                    "view_weight": VIEW_WEIGHT,
                    "bookmark_weight": BOOKMARK_WEIGHT,
                },
                "evaluation": evaluation,
            }
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            descriptor, temporary_name = tempfile.mkstemp(prefix="lightfm-model-", suffix=".tmp", dir=MODEL_DIR)
            try:
                with os.fdopen(descriptor, "wb") as temporary_file:
                    pickle.dump(bundle, temporary_file, protocol=pickle.HIGHEST_PROTOCOL)
                    temporary_file.flush()
                    os.fsync(temporary_file.fileno())
                with MODEL_LOCK:
                    os.replace(temporary_name, MODEL_PATH)
            finally:
                if os.path.exists(temporary_name):
                    os.unlink(temporary_name)
            trained_status = "trained"
    logger.info("Training finished status=%s users=%s readings=%s interactions=%s", trained_status, len(users), len(readings), len(meaningful))
    return TrainResponse(
        status=trained_status,
        model_version=model_version,
        trained_at=trained_at,
        users=len(users),
        readings=len(readings),
        interactions=len(meaningful),
        configuration={
            "algorithm": "LightFM",
            "loss": "warp",
            "components": COMPONENTS,
            "epochs": EPOCHS,
            "view_weight": VIEW_WEIGHT,
            "bookmark_weight": BOOKMARK_WEIGHT,
        },
        evaluation=evaluation,
    )


@app.post("/recommend", response_model=RecommendResponse, dependencies=[Depends(require_internal_token)])
def recommend(request: RecommendRequest) -> RecommendResponse:
    readings = [reading for reading in request.readings if reading.published]
    exclude_ids = set(request.exclude_ids)
    history_ids = set(request.history_ids)
    bundle = read_model()
    if bundle is None or request.user_id not in bundle["user_mapping"]:
        return RecommendResponse(recommendations=fallback_recommendations(readings, exclude_ids, request.limit, history_ids), source="fallback", model_version=bundle.get("version") if bundle else None)

    model = bundle["model"]
    user_index = bundle["user_mapping"][request.user_id]
    item_mapping = bundle["item_mapping"]
    item_features = bundle["item_features"]
    seen = set(bundle["user_readings"].get(request.user_id, []))
    candidates = [reading for reading in readings if reading.id in item_mapping and reading.id not in exclude_ids and reading.id not in seen]
    new_readings = [
        reading for reading in readings
        if reading.id not in item_mapping and reading.id not in exclude_ids and reading.id not in seen
    ]
    if not candidates:
        return RecommendResponse(recommendations=fallback_recommendations(readings, exclude_ids | seen, request.limit, history_ids | seen), source="fallback", model_version=bundle.get("version"))
    indices = np.asarray([item_mapping[reading.id] for reading in candidates])
    scores = model.predict(user_index, indices, item_features=item_features, num_threads=1)
    ranked = sorted(zip(candidates, scores.tolist()), key=lambda pair: pair[1], reverse=True)
    recommendations: list[Recommendation] = []
    seen_authors: set[str] = set()
    for reading, score in ranked:
        author = reading.author.strip().lower()
        if author and author in seen_authors and len(recommendations) < request.limit // 2:
            continue
        recommendations.append(Recommendation(reading_id=reading.id, score=float(score), reason="Based on your reading and saved teachings"))
        if author:
            seen_authors.add(author)
        if len(recommendations) == request.limit:
            break
    if len(recommendations) < request.limit:
        new_items = fallback_recommendations(new_readings, set(), request.limit - len(recommendations), history_ids | seen)
        recommendations.extend(new_items)
    return RecommendResponse(recommendations=recommendations, source="lightfm", model_version=bundle.get("version"))


@app.post("/related", response_model=RecommendResponse, dependencies=[Depends(require_internal_token)])
def related(request: RelatedRequest) -> RecommendResponse:
    bundle = read_model()
    readings = [reading for reading in request.readings if reading.published and reading.id != request.reading_id]
    if bundle is None or request.reading_id not in bundle["item_mapping"]:
        return RecommendResponse(recommendations=fallback_recommendations(readings, set(), request.limit), source="fallback", model_version=bundle.get("version") if bundle else None)
    embeddings = bundle["model"].get_item_representations(features=bundle["item_features"])[1]
    item_mapping = bundle["item_mapping"]
    target_index = item_mapping[request.reading_id]
    target = embeddings[target_index]
    norms = np.linalg.norm(embeddings, axis=1) * max(float(np.linalg.norm(target)), 1e-12)
    similarities = embeddings @ target / np.maximum(norms, 1e-12)
    ranked = sorted(
        (reading for reading in readings if reading.id in item_mapping),
        key=lambda reading: float(similarities[item_mapping[reading.id]]),
        reverse=True,
    )[: request.limit]
    return RecommendResponse(
        recommendations=[Recommendation(reading_id=reading.id, score=float(similarities[item_mapping[reading.id]]), reason="Related by learned teaching themes") for reading in ranked],
        source="lightfm",
        model_version=bundle.get("version"),
    )
