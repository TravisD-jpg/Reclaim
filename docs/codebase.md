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

`00_Timezone.sql` runs first and sets the database's time zone to `America/New_York`, so timestamps are Akron time. Neon's pooled connections can keep UTC, so **API inserts that default to "now" use `CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York'` explicitly** (see `POST /api/claims`). Applied to Neon on 2026-10-24.

Table names are unquoted, so Postgres stores them in lowercase (`items`, `lostreports`, …). **Never double-quote identifiers in SQL or Dapper queries**: `"Items"` refers to a different, nonexistent table.

### Seed data (`database/seed/`)

| File | Fills | Rows | Source |
|---|---|---|---|
| `01_Categories.sql` | categories | 13 | Team-defined categories |
| `02_Locations.sql` | locations | 104 buildings (`room_or_area` NULL) | UA campus map |
| `03_Items.sql` | items | 400 | Cleaned rows from the Kaggle dataset, with stations mapped to UA buildings; all set to `status = 'stored'`. Dates span 2026-02-19 to 2026-03-21; 10 rows dated Feb 29 (invalid in 2026) were moved to Feb 28 |
| `04_Users.sql` | users | 20 | Team-entered accounts: 2 `dev` (Travis, Davonte), 3 `staff` (one per lost-and-found desk), 15 `user` students. UANet-style emails and 7-digit UA IDs. Every demo password is `reclaim`, base64-encoded (see deviations) |
| `05_ItemSecretDetails.sql` | itemsecretdetails | 40 | Hidden details on seeded items (e.g. "Broken zipper"), matched by item name, building and date found |
| `06_LostReports.sql` | lostreports | 6 | Filed by 6 different students: 3 `closed` (item returned), 3 `open`. "Navy blue jacket" describes a real stored item, a known answer for Smart Search |
| `07_Claims.sql` | claims | 4 | Each approved by a staff member: 3 linked to a lost report, 1 walk-in (`report_id` NULL). Sets those items to `claimed` |

How the seed scripts behave:
- Seeds look up related rows by natural keys (category name, building, user email, item name + building + date found), never by hard-coded IDs.
- **Safe to rerun:** `01`, `02`, `04`, `06`, `07` (they skip rows that already exist).
- **Not safe to rerun:** `03` and `05` insert duplicates.

### Known issues
- `Users.role` allows `user`, `staff` and `dev`.

The schema and seed scripts were tested on PGlite (Postgres 17 compiled to WASM), then loaded into Neon (`reclaimdb`, PostgreSQL 18.6). `01`–`03` were loaded on 2026-10-21 and `05` by Davonte. On 2026-10-24 the original placeholder users were replaced with `04`'s realistic users, and `06`–`07` were loaded. **Neon is fully seeded; don't rerun the unsafe seeds there.**

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

**Data access pattern:**
- Inject `NpgsqlDataSource`, then `await using var connection = await dataSource.OpenConnectionAsync();` and run Dapper queries on it.
- Each controller holds its own SQL as plain strings, using C# raw strings (`"""`) for multi-line queries.
- `DefaultTypeMap.MatchNamesWithUnderscores = true` (set in `Program.cs`) maps snake_case columns like `category_id` to PascalCase properties like `CategoryId`, so queries select real column names without aliases.
- Response shapes live in `Models/` as records. JSON output is camelCase (`categoryId`).
- Feature routes are prefixed with `api/`.
- Writes that touch several tables (claims) run in one transaction (`BeginTransactionAsync`), so they all succeed or none do. Rules the schema can't express (approver must be staff) are checked inside that transaction.

### Endpoints

| Method | Route | Role | Description | Tables |
|---|---|---|---|---|
| GET | `/health/db` | any | Returns the Postgres version and item count to prove the API can reach Neon | items |
| GET | `/api/categories` | any | All categories, sorted by name (for dropdowns) | categories |
| GET | `/api/locations` | any | All locations, sorted by building (for dropdowns) | locations |
| GET | `/api/items` | any | Search items. Optional `search` (partial match on name or description), `categoryId`, `locationId`, `status`. Newest first | items, categories, locations |
| GET | `/api/items/{id}` | any | One item with its category and building names; 404 if missing | items, categories, locations |
| GET | `/api/items/{id}/history` | staff* | **The multi-table join.** Item details, category, location, the staff who logged it, its claim (date, claimant, approving staff), the lost report behind the claim, and the failed verification count. All `LEFT JOIN`s, so unclaimed items still return; 404 if missing | items, categories, locations, users (×3), claims, lostreports, verificationattempts |
| POST | `/api/items` | staff* | Create an item; returns 201 with the new item. 400 on validation errors or a nonexistent category/location | items |
| PUT | `/api/items/{id}` | staff* | Replace an item's fields; 404 if missing | items |
| DELETE | `/api/items/{id}` | staff* | Delete an item (its secret details cascade); 204, 404 if missing, 409 if it has claims or verification attempts | items |

| GET | `/api/users` | any | All accounts (id, name, email, role), devs then staff then students. Never returns `password_hash`. Feeds the demo's account switch | users |
| GET | `/api/lost-reports` | any | Search lost reports. Optional `search` (name or description), `userId`, `status`. Newest first | lostreports, users, categories, locations |
| GET | `/api/lost-reports/{id}` | any | One report with reporter, category and building names; 404 if missing | lostreports, users, categories, locations |
| POST | `/api/lost-reports` | any | File a report; `userId` required, status defaults to `open`. 201, or 400 on validation errors or a nonexistent user/category/location | lostreports |
| PUT | `/api/lost-reports/{id}` | owner/staff* | Replace a report's fields; 404 if missing | lostreports |
| DELETE | `/api/lost-reports/{id}` | owner/staff* | Delete a report; 204, 404 if missing, 409 if a claim or match links to it (close it instead) | lostreports |

| GET | `/api/claims` | staff* | List claims with item, claimant, approver and report names. Optional `itemId`, `userId`, `approvedBy`. Newest first | claims, items, users (×2), lostreports |
| GET | `/api/claims/{id}` | staff* | One claim; 404 if missing | same |
| POST | `/api/claims` | staff* | Approve a claim. **One transaction:** insert the claim, set the item to `claimed`, close the linked report. 400 if the approver isn't staff/dev, the report isn't the claimant's, or the item/claimant doesn't exist; 409 if the item isn't `stored` | claims, items, lostreports |
| PUT | `/api/claims/{id}` | staff* | Change claimant, report, approver or date (not the item). If the report changes, the old one reopens and the new one closes | claims, lostreports |
| DELETE | `/api/claims/{id}` | staff* | Undo a claim. **One transaction:** delete it, set the item back to `stored`, reopen the linked report | claims, items, lostreports |

\* Roles aren't enforced yet; the frontend's user/staff switch hides staff actions until login lands (roadmap Phase 3). `logged_by` is left NULL until then.

`Reclaim.Api.http` has a ready-to-send request for every endpoint.

---

## Data import tool (`tools/Reclaim.DataImport`)

**Status:** `Console.WriteLine("Hello, World!")`. CsvHelper, Dapper and Npgsql are referenced. The raw CSV is expected under `database/data/`, which is gitignored.

---

## Frontend (`frontend/`)

React 19 + Vite 8, with **Mantine 9** (components), **React Router 8** (pages), and **Tabler icons**. Plain JavaScript, no TypeScript.

| File / folder | Purpose |
|---|---|
| `vite.config.js` | Dev server proxies `/api` to http://localhost:5102, so the browser only talks to one origin and the API needs no CORS setup |
| `src/main.jsx` | Wraps the app in `MantineProvider` (theme), `Notifications` (toasts), `BrowserRouter`, and `AccountProvider` |
| `src/App.jsx` | Route table; every page renders inside `AppLayout` |
| `src/theme.js` | UA navy (`akronBlue`, #041E42) and gold (`akronGold`, #A89968) as Mantine colors; navy is the primary color |
| `src/api.js` | `api.get/post/put/delete(path, body)`. Prefixes `/api`, sends JSON, and throws an `Error` with a readable message from the API's validation or plain-text errors |
| `src/account/` | The demo's "Acting as" switch. `AccountProvider` loads `/api/users` and remembers the choice in localStorage; `useAccount()` returns `{ users, account, isStaff, setUserId }`; `AccountSwitch` is the grouped dropdown in the header. Defaults to the first staff member. **Replaced by login in Phase 3** |
| `src/layout/AppLayout.jsx` | Navy header with gold underline: logo, nav links (Claims shows only for staff/dev), account switch. Pages render in a gray content area |
| `src/layout/PageHeader.jsx` | Shared page title, description, and action buttons |
| `src/pages/` | One component per route |

**Conventions:**
- Use Mantine components and theme colors (`akronBlue`, `akronGold`) instead of custom CSS. Custom CSS goes in a `*.module.css` next to its component.
- Pages call the API through `api.js`, never `fetch` directly.
- Hide staff-only actions with `isStaff` from `useAccount()`.
- Show failures with `notifications.show({ color: 'red', ... })`.

- `frontend/README.md` is the unchanged Vite template README.

### Pages
| Route | Page | Who | Status |
|---|---|---|---|
| `/` | `CatalogPage` | everyone | Placeholder (shows the item count) |
| `/lost-reports` | `LostReportsPage` | everyone | Placeholder |
| `/claims` | `ClaimsPage` | staff/dev (nav link hidden otherwise) | Placeholder |

---

## Local setup

1. **Neon CLI:** `npm i -g neon`, then `neon login`.
2. **Connection string:** from the repo root, run `neon link --project-id falling-term-25296710` (once per machine), then `neon env pull`. This writes `.env.local`.
3. **Database** (only for a fresh branch; `production` is already loaded): run `database/tables/*.sql`, then `database/seed/*.sql`, each in filename order, over `DATABASE_URL_UNPOOLED` (pgAdmin 4 or `psql`).
4. **API:** `dotnet run --project backend/Reclaim.Api --launch-profile http`, then open http://localhost:5102/health/db to check the connection. OpenAPI is at `/openapi/v1.json` in Development.
5. **Frontend:** `cd frontend && npm install && npm run dev`, then open http://localhost:5173. The API must be running too, since Vite forwards `/api` calls to it.

_These steps become the Stage 7 setup instructions, so keep them accurate._

### New teammate checklist
1. Accept the Neon organization invite.
2. Install Node.js 24 and the .NET 10 SDK, then `npm i -g neon` and `neon login`.
3. Pull the `dev` branch, then run from the repo root:
   `neon link --org-id org-cold-lab-38223341 --project-id falling-term-25296710 --branch production -y`
   and then `neon env pull`.
4. Start the API from the repo root with `dotnet run --project backend/Reclaim.Api --launch-profile http`, then open http://localhost:5102/health/db. It should return `itemCount: 400`.

Everyone shares the `production` database, so writes are visible to the whole team. Never rerun the seed scripts against it.

---

## Feature status vs. spec

| Feature (from spec) | Status |
|---|---|
| Schema (9 tables) | Done; loaded on Neon |
| Real data: categories, locations, items | Loaded on Neon (13 / 104 / 400) |
| API ↔ Neon connection | Done (`/health/db`) |
| Test users / secret details | Seeded (20 users, 40 details) |
| Test lost reports / claims | Seeded (6 reports, 4 claims) |
| Insert/update/delete (users: lost reports; staff: everything) | Done for items, lost reports and claims (API) |
| Search by name / location / category | Done (`GET /api/items`) |
| Item-history join (status, claim date, approving staff, found location) | Done (`GET /api/items/{id}/history`) |
| Login (BCrypt) | Not started |
| Smart Search (FuzzySharp scoring → MatchCandidates) | Not started (due Nov 13) |
| Identity Verification (ItemSecretDetails, VerificationAttempts) | Not started (due Nov 27) |

## Deviations from spec
Report these in the next stage report.

| Spec says | Code does | Why / action |
|---|---|---|
| Items loaded by C# CsvHelper import tool (Stage 3 §3.1) | Items loaded from hand-written `03_Items.sql` | Finish the import tool, or explain the change in the Stage 4 report |
| ~10,000 Kaggle records | 400 items seeded | Explain in Stage 4 if it stays this way |
| `Users.role` is `user` or `staff` (Stage 3 schema) | Adds a third role, `dev` | A real deployment needs an admin role above staff to manage staff accounts and the system |
| Passwords hashed with BCrypt.Net-Next (Stage 3 stack) | Seed passwords are base64-encoded, which is reversible | Acceptable for a demo with test accounts only; switch to BCrypt if time allows (roadmap Phase 7) |
