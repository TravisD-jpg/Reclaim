# Reclaim — How the Codebase Works

A living description of the code as it is **right now**. Update this file in the same change as any code change: new endpoints, tables, pages, setup steps, deviations from the spec.

The requirements live in [project-spec.md](project-spec.md). AI-use disclosure is tracked in [ai-usage.md](ai-usage.md).

_Last updated: 2026-10-21_

---

## Repository layout

```
Reclaim/
├── backend/Reclaim.Api/        ASP.NET Core Web API (.NET 10)
├── database/
│   ├── tables/                 one CREATE TABLE script per table
│   ├── seed/                   numbered INSERT scripts (run in order)
│   └── data/                   raw source data (gitignored)
├── frontend/                   React 19 + Vite 8 single-page app
├── tools/Reclaim.DataImport/   console app for importing the Kaggle CSV
├── docs/                       spec, this file, AI-usage log
├── neon.ts                     Neon branch policy (applied with `neon deploy`)
├── package.json                Neon CLI config deps only (@neon/config, @neon/env)
└── Reclaim.slnx                .NET solution (Api + DataImport)
```

Local-only files (gitignored):
- `.neon`: links this folder to Neon project `falling-term-25296710`, branch `production`.
- `.env.local`: `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), and `NEON_BRANCH`, pulled by `neon deploy` or `neon env pull`.

## How the pieces connect

```
React (Vite dev server)  ──HTTP/JSON──▶  Reclaim.Api (ASP.NET Core)  ──Npgsql + Dapper──▶  PostgreSQL 18 on Neon
                                                                                                ▲
                                                 Reclaim.DataImport (CsvHelper + Dapper) ───────┘
```

- The API is the only component the browser talks to. All SQL is hand-written and run through Dapper.
- The app uses the **pooled** `DATABASE_URL`. Schema and seed loads use the **direct** `DATABASE_URL_UNPOOLED`, as Neon recommends for migrations.
- `ItemSecretDetails` must never be sent to non-staff users. The API, not the frontend, enforces this.

---

## Database (`database/`)

### Tables
There are 9 tables, one script each in `database/tables/`. Column for column they match the Stage 3 schema in [project-spec.md](project-spec.md#relational-schema-pks-listed-first).

The files are numbered `01_Users.sql` … `09_MatchCandidates.sql` in foreign-key order. Run them in filename order.

Table names are unquoted, so Postgres stores them in lowercase (`items`, `lostreports`, …). **Never double-quote identifiers in SQL or Dapper queries**: `"Items"` refers to a different, nonexistent table.

### Seed data (`database/seed/`)

| File | Fills | Rows | Source |
|---|---|---|---|
| `01_Categories.sql` | categories | 13 | Team-defined categories |
| `02_Locations.sql` | locations | 104 buildings (`room_or_area` NULL) | UA campus map |
| `03_Items.sql` | items | 400 | Cleaned rows from the Kaggle dataset, with stations mapped to UA buildings; all set to `status = 'stored'`. Dates span 2026-02-19 to 2026-03-21; 10 rows dated Feb 29 (invalid in 2026) were moved to Feb 28 |

How the seed scripts behave:
- They can be re-run safely: categories use `ON CONFLICT DO NOTHING`, and locations use a `WHERE NOT EXISTS` check.
- `03_Items.sql` looks up category and location ids by name. **It is not safe to re-run; it will insert duplicates.**

### Known issues
- No users, lost reports, claims or secret details are seeded yet.

The schema and seed scripts were tested on PGlite (Postgres 17 compiled to WASM), then loaded into Neon (`reclaimdb`, PostgreSQL 18.6) on 2026-10-21 in a single transaction. Every table, all 15 foreign keys, and all 400 items loaded. **The Neon database is already seeded; don't rerun `03_Items.sql` there.**

---

## Backend (`backend/Reclaim.Api`)

**Status:** connected to Neon. No feature endpoints yet.

| Concern | Current state |
|---|---|
| Packages | Dapper, Npgsql, BCrypt.Net-Next, FuzzySharp, Swashbuckle, Microsoft.AspNetCore.OpenApi |
| `Program.cs` | Loads `.env.local`, registers one `NpgsqlDataSource` singleton, controllers + OpenAPI. No CORS or auth yet |
| `EnvFile.cs` | Walks up from the working directory to the nearest `.env.local` and loads it into environment variables. Never overrides variables that are already set |
| `Data/DatabaseUrl.cs` | Converts Neon's `postgresql://` URL to an Npgsql connection string (SSL required, plus channel binding when the URL asks for it) |
| Connection string | `DATABASE_URL` from `.env.local` or the environment. The API won't start without it. Never put it in `appsettings.json` |
| Ports | http://localhost:5102, https://localhost:7209 |

**Data access pattern:** inject `NpgsqlDataSource`, then `await using var connection = await dataSource.OpenConnectionAsync();` and run Dapper queries on it.

### Endpoints

| Method | Route | Role | Description | Tables |
|---|---|---|---|---|
| GET | `/health/db` | any | Returns the Postgres version and item count to prove the API can reach Neon | items |

---

## Data import tool (`tools/Reclaim.DataImport`)

**Status:** `Console.WriteLine("Hello, World!")`. CsvHelper, Dapper and Npgsql are referenced. The raw CSV is expected under `database/data/`, which is gitignored.

---

## Frontend (`frontend/`)

**Status:** `App.jsx` renders only a placeholder heading. There's no routing and no API client. `index.css` contains minimal base styles.

- `frontend/README.md` is the unchanged Vite template README.

### Pages
_None yet._ List each page/route here as it's added.

---

## Local setup

1. **Neon CLI:** `npm i -g neon`, then `neon login`.
2. **Connection string:** from the repo root, run `neon link --project-id falling-term-25296710` (once per machine), then `neon env pull`. This writes `.env.local`.
3. **Database** (only for a fresh branch; `production` is already loaded): run `database/tables/*.sql`, then `database/seed/*.sql`, each in filename order, over `DATABASE_URL_UNPOOLED` (pgAdmin 4 or `psql`).
4. **API:** `dotnet run --project backend/Reclaim.Api --launch-profile http`, then open http://localhost:5102/health/db to check the connection. OpenAPI is at `/openapi/v1.json` in Development.
5. **Frontend:** `cd frontend && npm install && npm run dev`.

_These steps become the Stage 7 setup instructions, so keep them accurate._

---

## Feature status vs. spec

| Feature (from spec) | Status |
|---|---|
| Schema (9 tables) | Done; loaded on Neon |
| Real data: categories, locations, items | Loaded on Neon (13 / 104 / 400) |
| API ↔ Neon connection | Done (`/health/db`) |
| Test users / lost reports / claims / secret details | Not started |
| Insert/update/delete (users: lost reports; staff: everything) | Not started |
| Search by name / location / category | Not started |
| Item-history join (status, claim date, approving staff, found location) | Not started |
| Login (BCrypt) | Not started |
| Smart Search (FuzzySharp scoring → MatchCandidates) | Not started (due Nov 13) |
| Identity Verification (ItemSecretDetails, VerificationAttempts) | Not started (due Nov 27) |

## Deviations from spec
Report these in the next stage report.

| Spec says | Code does | Why / action |
|---|---|---|
| Items loaded by C# CsvHelper import tool (Stage 3 §3.1) | Items loaded from hand-written `03_Items.sql` | Finish the import tool, or explain the change in the Stage 4 report |
| ~10,000 Kaggle records | 400 items seeded | Explain in Stage 4 if it stays this way |
