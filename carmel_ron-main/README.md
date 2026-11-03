# Carmels in Communion

A React and Express prototype for the Philippine Federation of Discalced Carmelite Nuns. The client contains the public website and administration dashboard; the server provides API routes backed by PostgreSQL and Prisma.

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop for the local PostgreSQL database

## Run locally

Start PostgreSQL in Docker from the project root:

```powershell
docker compose up -d postgres
```

Install dependencies from the project root:

```powershell
npm install
npm --prefix client install
npm --prefix server install
```

Copy `server/.env.example` to `server/.env`. Its database URL is configured for the local PostgreSQL container; replace the placeholder secrets before using anything beyond local development. Then prepare the database and start the client and API:

```powershell
Copy-Item .\server\.env.example .\server\.env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

The website runs at http://localhost:5173 and the API runs at http://localhost:4000. PostgreSQL runs in Docker and is available to the local app at `localhost:5433` (mapped to port 5432 inside the container); its data persists in the `postgres-data` Docker volume when the container is stopped. Stop the database with `docker compose down` (this keeps the data).

Discerner registrations, discernment conversations and replies, contact inquiries, and Admin-managed website content are stored by the API in PostgreSQL, not in the visitor's browser. Discerning users can message the Federation from their account; the public floating chat also creates a saved conversation, with a signed HttpOnly visitor cookie allowing the visitor to receive and reply to staff messages without signing in. Admins and Formators can read and reply from the dashboard inbox, which refreshes automatically. The dashboard Messages badge and notification bell refresh from the API; the badge counts unread incoming messages, and the notification list includes recent messages, account registrations, donations, dashboard audit activity, published updates, and managed website-content changes. Opening an unread message marks its incoming messages as read for the staff inbox. The homepage image, monastery details, Carmelife/Carmelights stories, and published Carmelinks updates use the `PageContent` table. Existing browser-managed monastery, story, and update data is copied to PostgreSQL the first time an Admin opens the relevant content section, if no database record exists yet. Content changes report an error if the API or database is unavailable; they are not treated as successfully saved to local storage alone.

Admin account management, including User and Formator counts, contact details, account status, Formator creation, and Formator permissions, is backed by PostgreSQL. Formator accounts use hashed passwords and share the same database-backed sign-in as other accounts. Some prototype dashboard features and member preferences remain browser-local and are not shared between browsers. For production, point `DATABASE_URL` at a managed PostgreSQL database with persistent storage and backups. Keep that database independent from the website host so removing or redeploying the website does not remove records. Database retention and backups depend on the database provider and its configuration.

The Carmelights content-admin section includes 30-day teaching-view and current-member-bookmark analytics. Opening a published teaching records a view; repeated views from the same browser or consented member are deduplicated per UTC day. Member-linked activity is recorded only for active accounts with recorded privacy consent; anonymous views store no user ID. To add the `ContentInteraction` table to an existing database, run `npm run db:generate` followed by `npm run db:push`. These analytics are engagement reporting only; a LightFM recommendation model and personalized reading recommendations are not currently implemented.

Admins can manually record donations from **Donations → Record Donation** and review them under **Transactions**. Transactions combines public-form submissions with manual entries and labels each record by source. A manual entry can include donor details, payment method and reference, and an optional JPG, PNG, WebP, or PDF proof (up to 5 MB). In offline demo mode, public-form submissions and manual records stay together in that browser; proof files for manual entries are limited to 1.5 MB. After pulling schema changes, run `npm run db:push` to update the local database before using database-backed donations.

The public donation form can use Xendit-hosted test checkout. Set `XENDIT_SECRET_KEY` in `server/.env` to the **test-mode secret key** (the server also accepts `XENDIT_TEST_SECRET_KEY`), and set `XENDIT_CALLBACK_TOKEN` to the callback token configured in Xendit's Dashboard. In **Settings → Developers → Webhooks**, configure the invoice webhook to `https://<your-public-https-host>/api/donations/xendit-webhook`; a local app needs an HTTPS tunnel so Xendit can reach the callback. Apply the new database columns with `npm run db:generate` and `npm run db:push`, then restart the API. Checkout is enabled only when both server settings exist. Each payment channel must also be activated for the Xendit account: open **Payment Channels → Activate Payment Channels** in the Dashboard and request activation for channels such as Bank Transfer. An API key with Write permission does not by itself activate a payment channel; some channels require account verification. Xendit redirects the donor back to the donation page, but the donation is marked paid only after the server validates Xendit's callback token and invoice amount. Test payments do not move real funds; verify the test-mode dashboard and selected payment channels before live use.

The **Audit Logs** section is available to Admins and Formators. It lists staff sign-ins/sign-outs and recorded administrative changes with the actor and timestamp. Public donation submissions and donation status changes are also recorded, but donation audit entries and donation notifications are visible to Admins only. Database-backed activity is stored in PostgreSQL; offline demo activity is stored in that browser. Public donation-form submissions do not require proof files; proof upload is only an optional field when staff record a donation manually.

Admins can use **System Backup** to export or merge application database records, including content, accounts, donations and their proof files, messages, reading interactions, and audit history. Exports are downloaded as AES-256-encrypted ZIP archives with an export timestamp; no password is requested during export. To open or extract an archive outside the website, use a ZIP application that supports AES-encrypted archives (for example, 7-Zip) and the configured fixed backup password, `carmelites`. The Admin must enter that password in the masked field when importing an archive. The browser saves the ZIP in its configured download folder; the archive file itself remains visible there, but its contents are encrypted. Successful exports and imports are recorded in the Admin audit log with timestamps. Imports add missing records and update matching IDs without deleting existing data; rows that conflict with an existing unique value and their dependent rows are skipped and reported. Since `carmelites` is a shared, easy-to-guess password, this is not suitable for protecting sensitive production backups. Exports are limited to 45 MB of unencrypted data. Earlier `.carmelbackup` exports remain importable.

## Carmelights LightFM recommendations

The optional Python service in `recommender/` trains a hybrid LightFM/WARP model using consented member teaching views and current bookmarks. It uses existing teaching titles, author names, and body text as item metadata features; the current content schema has no separate category or tag fields. Anonymous views remain available for popularity analytics and are never sent to LightFM training. Until the service has sufficient member interaction data, signed-in members receive a clearly labeled popularity fallback.

On Windows, install and start Docker Desktop first. Apply the `ContentInteraction` Prisma schema update using `npm run db:generate` and `npm run db:push`, then create a random internal API token in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Copy-Item .\recommender\.env.example .\recommender\.env
```

Set the generated token as `RECOMMENDER_API_TOKEN` in `recommender/.env` and as `LIGHTFM_API_TOKEN` in `server/.env`. Set `LIGHTFM_SERVICE_URL=http://127.0.0.1:8001` in `server/.env`. Keep both `.env` files private; do not commit them. Build and start the model service from the project root:

```powershell
docker compose -f .\recommender\compose.yaml run --build --rm lightfm python -m unittest test_main
docker compose -f .\recommender\compose.yaml up --build -d
npm run dev
```

The API is exposed only on local loopback port 8001 and the model artifact persists in the `lightfm-models` Docker volume. After signing in as an Admin, open **Manage Details → Carmelight** and choose **Train model**. Training requires at least two members, three published teachings, and six member-reading pairs; until then the model stays untrained and the site continues to use popularity fallback. The training result includes a timestamp-based offline ranking evaluation against a popularity baseline when there is enough test data; otherwise it explicitly reports that evaluation is unavailable. Latent components, epochs, view weight, and bookmark weight can be configured through `LATENT_COMPONENTS`, `TRAINING_EPOCHS`, `VIEW_WEIGHT`, and `BOOKMARK_WEIGHT` in the recommender environment.

Signed-in members can find **Recommended for You** in their account navigation. Recommendations show reading cards and never expose other members' identities, histories, model scores, or private account data. Docker's Linux container avoids compiling LightFM directly on Windows. For production, deploy the API and recommender on a private network, set a unique shared secret, retain the model volume, use HTTPS at the public edge, and use a managed persistent database. Retrain periodically from the protected Admin action as interaction data grows; do not rely on demo accounts or fabricated interactions to evaluate the model.

To build both applications, run `npm run build`.

## Prototype access

For local demonstrations, set `DEMO_AUTH_ENABLED=true` and `NODE_ENV=development` in `server/.env`, then run the client and API using the commands above. Use these credentials:

| Role | Sign-in page | Email | Password |
|---|---|---|---|
| Admin | `/staff/login` (select Admin) | `admin@offline` | `12345678` |
| Formator | `/staff/login` (select Formator) | `staff@offline` | `12345678` |
| Community user | `/account/login` | `user@offline` | `12345678` |

These are virtual demo identities for local previews; they are not PostgreSQL account records. The community user's dashboard profile is kept in that browser's local storage. Demo sign-ins are disabled whenever `NODE_ENV=production` or `DEMO_AUTH_ENABLED` is not `true`. Never use these credentials for production. Some prototype dashboard data remains unsuitable for production security or persistence. Website content, regular user accounts, Formator accounts, and uploaded images are stored in PostgreSQL; URL-based images remain dependent on their external host. Discerner registration and contact inquiries also use the PostgreSQL-backed API described above.

Never commit `server/.env` or production secrets; only the `.env.example` template belongs in Git.
