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
└── Reclaim.slnx                .NET solution (Api + DataImport)
```

## How the pieces connect

```
React (Vite dev server)  ──HTTP/JSON──▶  Reclaim.Api (ASP.NET Core)  ──Npgsql + Dapper──▶  PostgreSQL 18 on Neon
                                                                                                ▲
                                                 Reclaim.DataImport (CsvHelper + Dapper) ───────┘
```

- The API is the only component the browser talks to. All SQL is hand-written and run through Dapper.
- `ItemSecretDetails` must never be sent to non-staff users. The API, not the frontend, enforces this.

---

## Database (`database/`)

### Tables
There are 9 tables, one script each in `database/tables/`. Column for column they match the Stage 3 schema in [project-spec.md](project-spec.md#relational-schema-pks-listed-first).

**Run order** (dictated by foreign keys):
1. `Users.sql`
2. `Categories.sql`
3. `Locations.sql`
4. `Items.sql`
5. `ItemSecretDetails.sql`
6. `LostReports.sql`
7. `Claims.sql`
8. `VerificationAttempts.sql`
9. `MatchCandidates.sql`

### Seed data (`database/seed/`)

| File | Fills | Rows | Source |
|---|---|---|---|
| `01_Catagories.sql` | categories | 13 | Team-defined categories |
| `02_Locations.sql` | locations | 104 buildings (`room_or_area` NULL) | UA campus map |
| `03_Items.sql` | items | 400 | Cleaned rows from the Kaggle dataset, with stations mapped to UA buildings; all set to `status = 'stored'` |

How the seed scripts behave:
- They can be re-run safely: categories use `ON CONFLICT DO NOTHING`, and locations use a `WHERE NOT EXISTS` check.
- `03_Items.sql` looks up category and location ids by name. **It is not safe to re-run; it will insert duplicates.**

### Known issues
- **Identifier case mismatch (will fail):**
  - `CREATE TABLE Items` (unquoted) creates a table named `items`.
  - But the FK clauses (`REFERENCES "Items"`, `"Users"`, …) and `03_Items.sql` (`"Locations"`, `"Categories"`, `"Items"`) use quoted mixed-case names, which Postgres treats as different relations.
  - `01`/`02` use lowercase.
  - Fix: remove the quotes everywhere.
- `01_Catagories.sql` is misspelled.
- No users, lost reports, claims or secret details are seeded yet.

---

## Backend (`backend/Reclaim.Api`)

**Status:** template only. `WeatherForecastController` and `WeatherForecast.cs` are scaffold leftovers and should be deleted.

| Concern | Current state |
|---|---|
| Packages | Dapper, Npgsql, BCrypt.Net-Next, FuzzySharp, Swashbuckle, Microsoft.AspNetCore.OpenApi |
| `Program.cs` | Controllers + OpenAPI only. No DB connection, no CORS, no auth |
| Connection string | Not configured. Plan: keep it in user-secrets or `.env` (gitignored), never in `appsettings.json` |
| Ports | http://localhost:5102, https://localhost:7209 |

### Endpoints
_None yet._ List each endpoint here when it's added:

| Method | Route | Role | Description | Tables |
|---|---|---|---|---|

---

## Data import tool (`tools/Reclaim.DataImport`)

**Status:** `Console.WriteLine("Hello, World!")`. CsvHelper, Dapper and Npgsql are referenced. The raw CSV is expected under `database/data/`, which is gitignored.

---

## Frontend (`frontend/`)

**Status:** `App.jsx` renders only a placeholder heading. There's no routing and no API client. `index.css` contains minimal base styles.

- Known bug: `index.html` has a malformed `<title>frontend<title>Reclaim</title>`.
- `frontend/README.md` is the unchanged Vite template README.

### Pages
_None yet._ List each page/route here as it's added.

---

## Local setup

1. **Database:** create the Neon database, run `database/tables/*.sql` in the order above, then `database/seed/*.sql` in numeric order (pgAdmin 4 or `psql`).
2. **API:** `dotnet run --project backend/Reclaim.Api`. Swagger/OpenAPI is served in Development.
3. **Frontend:** `cd frontend && npm install && npm run dev`.

_These steps become the Stage 7 setup instructions, so keep them accurate._

---

## Feature status vs. spec

| Feature (from spec) | Status |
|---|---|
| Schema (9 tables) | Written; identifier-case bug blocks loading |
| Real data: categories, locations, items | Seed SQL written (400 items) |
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
