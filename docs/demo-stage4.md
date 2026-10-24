# Stage 4 Demo — Talking Points

5–8 minutes. Start with the app open on the Catalog, acting as a staff member.

## 1. Intro (~30 s)
- Reclaim: one searchable lost-and-found catalog for every UA drop-off point.
- Stack: React + Mantine front end, ASP.NET Core API with Dapper (hand-written SQL), PostgreSQL on Neon.
- The "Acting as" switch in the header stands in for login until Phase 3.

## 2. Real data (~1 min)
- 400 found items from the Kaggle "Lost Found" dataset, mapped to 104 real UA buildings and 13 categories.
- The Kaggle names were generic (114 rows were just "Bag"), so we wrote distinct names and descriptions and kept Kaggle's category, location and date.
- Also seeded: 20 users (students, staff, devs), lost reports, claims, and 40 hidden secret details.

## 3. Search (~1 min)
- Type `jansport` in the search box: partial match on name and description (`ILIKE`).
- Add a category or building filter, then switch status to **All**.
- Every filter goes into one SQL `WHERE` clause on the server.

## 4. Insert, update, delete (~2 min)
- **Insert:** click **Log item** and fill in the form. Saving opens the new item.
- **Update:** click **Edit** and change the description or set the status to Disposed.
- **Delete:** click **Delete** and confirm. The item disappears from the catalog.
- Bonus: try to delete a claimed item. The foreign key blocks it and the API returns a clear error.
- Switch to a student and file a lost report. It shows up in their list; staff see everyone's.

## 5. Multi-table join (~1 min)
- Open **Gray Galaxy Buds2** (claimed).
- One query joins items, categories, locations, claims, users three times (logger, claimant, approving staff), and lost reports.
- Point out who approved the claim and the lost report it was linked to.

## 6. Advanced-function plan (~1.5 min)
- **Smart Search (Nov 13):** when a report is filed, score every stored item 0–100 using fuzzy text similarity, category, location, and how close the dates are; save the top matches.
  - Example: the open "Navy blue jacket" report should find the **Navy blue Columbia jacket** found at Alpha Phi.
  - We'll measure accuracy with ~100 reports written to match known items.
- **Identity Verification (Nov 27):** staff store details only the owner knows; claimants have to answer them, every attempt is logged, and repeated failures lock the claimant out.
  - The 40 secret details are already seeded. They are never sent to regular users.
