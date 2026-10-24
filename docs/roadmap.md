# Reclaim — Roadmap

The ordered plan from now to final submission. Each checkbox is roughly one block of work and one commit. Check items off as they land, and keep [codebase.md](codebase.md) in sync.

Requirements come from [project-spec.md](project-spec.md).

_Last updated: 2026-10-21_

---

## Phase 0 — Setup ✅
- [x] Repo, solution, API, import tool, and React scaffolds
- [x] Schema (9 tables) and seed data (13 categories, 104 locations, 400 items)
- [x] Neon project linked; schema and seed loaded
- [x] API connected to Neon (`/health/db`)
- [x] Project docs (spec, codebase, AI log)

## Phase 1 — Basic functions (due **Oct 23**)
Goal: everything Stage 4 asks us to demo.

**Data**
- [x] Seed test users: one per role (`dev`, `staff`, `user`), base64 passwords for now
- [x] Seed secret details for 40 items (used later by Identity Verification)
- [ ] Seed a handful of lost reports and claims so the history join returns real rows

**API**
- [ ] CORS for the Vite dev server
- [ ] `GET /categories`, `GET /locations` (for form dropdowns)
- [ ] Items CRUD: `GET /items`, `GET /items/{id}`, `POST`, `PUT`, `DELETE`
- [ ] Item search: name (partial match), location, category, and status filters on `GET /items`
- [ ] Item history join: `GET /items/{id}/history`, joining item, category, found location, logged-by staff, claim, claimant, and approving staff
- [ ] Lost reports CRUD
- [ ] Claims CRUD (staff)

**Frontend**
- [ ] Routing and an API client
- [ ] Catalog page with search and filters
- [ ] Item detail page with history
- [ ] Add/edit item form (staff)
- [ ] Lost report form

## Phase 2 — Stage 4 demo and report (due **Oct 26**)
- [ ] Demo script, 5–8 minutes:
  - show real data;
  - insert, update and delete an item;
  - run a search;
  - show the history join;
  - explain the advanced-function plan.
- [ ] Rehearse the demo against the time limit
- [ ] Stage 4 report: title, summary, database and platforms, real data source, function descriptions, advanced-function plan
- [ ] AI appendix from [ai-usage.md](ai-usage.md)

## Phase 3 — Login and roles (early Nov)
Needed before Identity Verification, because it depends on staff-only permissions.
- [ ] `POST /auth/login` with BCrypt password check
- [ ] Session or token; the API enforces user vs. staff on every endpoint
- [ ] Login page; UI hides staff-only actions from regular users

## Phase 4 — Advanced Function 1: Smart Search (due **Nov 13**)
- [ ] Write ~100 lost reports that describe known seeded items in the owner's own words (gives a test set with known answers)
- [ ] Scoring algorithm (0–100) that combines:
  - FuzzySharp text similarity on name and description;
  - category match;
  - location match;
  - how close the lost date is to the found date
- [ ] Save top matches to `MatchCandidates` when a report is filed
- [ ] `GET /lostreports/{id}/matches` and a matches view in the UI
- [ ] Measure accuracy against the test set (for the Stage 5 report and the demo)

## Phase 5 — Stage 5 progress report (due **Nov 25**)
- [ ] Current status, real data summary, and how Smart Search is implemented
- [ ] AI appendix

## Phase 6 — Advanced Function 2: Identity Verification (due **Nov 27**)
- [ ] Staff add or edit secret details when logging an item; never returned to non-staff users
- [ ] Claim flow: the claimant answers questions and the server checks the answers
- [ ] Log every attempt in `VerificationAttempts`, and lock out after repeated failures
- [ ] Staff view of failed attempts per item and per user
- [ ] On pass: staff approves, `Claims` row created, item status set to `claimed`

## Phase 7 — Polish and final demo (due **Nov 30**)
- [ ] Bug fixes, UI cleanup, readability pass on all code
- [ ] _If time:_ replace base64 passwords with BCrypt hashes (seed and login)
- [ ] Slides and a 10–15 minute demo script covering basic functions and both advanced functions
- [ ] Rehearse against the time limit

## Phase 8 — Final submission (due **Dec 6**)
- [ ] Final report: implementation details, screenshots, contributions, lessons learned, future work
- [ ] Setup instructions (from [codebase.md](codebase.md#local-setup))
- [ ] List of changes made since the demo
- [ ] AI appendix
- [ ] `Stage7_7010607.zip`: report, source, setup instructions, slides

---

## Open decisions
| Question | Why it matters | Decide by |
|---|---|---|
| Finish the CSV import tool, or keep the SQL seed? | Stage 3 promised a C# import tool and ~10,000 records | Oct 26 (explain in the Stage 4 report) |
| What does the Oct 26 demo do without login? | Login is in Phase 3. Options: a temporary role switch in the UI, or move login into Phase 1 | Oct 23 |