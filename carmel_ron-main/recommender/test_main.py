import os
import unittest
from datetime import datetime, timedelta, timezone

os.environ.setdefault("RECOMMENDER_API_TOKEN", "test-token")

from main import (
    Interaction,
    Reading,
    aggregate_preferences,
    build_training_dataset,
    fallback_recommendations,
    metadata_features,
)


class RecommendationHelpersTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = datetime.now(timezone.utc)

    def interaction(self, user_id: str, reading_id: str, event_type: str, minutes_ago: int) -> Interaction:
        return Interaction(
            user_id=user_id,
            reading_id=reading_id,
            event_type=event_type,
            created_at=self.now - timedelta(minutes=minutes_ago),
        )

    def test_views_and_current_bookmarks_have_separate_weights(self) -> None:
        interactions = [
            self.interaction("u1", "r1", "VIEW", 30),
            self.interaction("u1", "r1", "BOOKMARK", 20),
            self.interaction("u1", "r2", "VIEW", 10),
            self.interaction("u1", "r2", "UNBOOKMARK", 5),
        ]
        weights, seen = aggregate_preferences(interactions, {"r1", "r2"})
        self.assertEqual(weights[("u1", "r1")], 4)
        self.assertEqual(weights[("u1", "r2")], 1)
        self.assertEqual(seen["u1"], {"r1", "r2"})

    def test_unbookmarked_without_a_view_is_not_a_positive_preference(self) -> None:
        weights, seen = aggregate_preferences(
            [self.interaction("u1", "r1", "UNBOOKMARK", 1)],
            {"r1"},
        )
        self.assertEqual(weights, {})
        self.assertEqual(dict(seen), {})

    def test_fallback_uses_reading_interests_and_excludes_seen_items(self) -> None:
        readings = [
            Reading(id="prayer", title="Prayer as friendship", popularity=1),
            Reading(id="discernment", title="Prayer and discernment", popularity=0),
            Reading(id="unrelated", title="The freedom of love", popularity=20),
        ]
        results = fallback_recommendations(
            readings,
            exclude_ids={"prayer"},
            history_ids={"prayer"},
            limit=2,
        )
        self.assertEqual(results[0].reading_id, "discernment")
        self.assertEqual(results[0].reason, "Related to your reading interests")

    def test_item_features_include_author_and_content_terms(self) -> None:
        features = metadata_features(Reading(id="r1", title="Prayer in silence", author="St Teresa"))
        self.assertIn("author:st teresa", features)
        self.assertIn("topic:prayer", features)
        self.assertIn("topic:silence", features)

    def test_training_dataset_preserves_bookmark_weight(self) -> None:
        readings = [Reading(id=f"r{index}", title=f"Prayer {index}") for index in range(1, 4)]
        events = [
            self.interaction("u1", "r1", "VIEW", 30),
            self.interaction("u1", "r1", "BOOKMARK", 20),
            self.interaction("u1", "r2", "VIEW", 15),
            self.interaction("u2", "r2", "VIEW", 10),
            self.interaction("u2", "r3", "BOOKMARK", 5),
        ]
        _, interactions, weights, item_features, users, items = build_training_dataset(readings, events)
        self.assertEqual(interactions.nnz, 4)
        self.assertEqual(weights.tocsr()[users["u1"], items["r1"]], 4)
        self.assertEqual(item_features.shape[0], len(readings))


if __name__ == "__main__":
    unittest.main()
