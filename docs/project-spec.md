# Reclaim — Project Spec (Source of Truth)

This file collects the course requirements and everything our team has committed to in the stage reports. **When code and this doc disagree, this doc wins** — or the difference gets logged under "Deviations from spec" in [codebase.md](codebase.md) so the next stage report can explain it.

Sources:
- *475/575 Database Management — Term Project* (assignment PDF)
- *475/575 Term Project Rubrics* (PDF)
- `Stage1_7010607.docx`, `Stage2_7010607.docx`, `Stage3_7010607.docx` (our submitted reports)
- Course AI policy, see [ai-usage.md](ai-usage.md)

---

## 1. Team (Stage 1)

| | |
|---|---|
| Team name | Data Dudes |
| Captain | Travis Dumire — trd61@uakron.edu (UANet ID 7010607) |
| Member | Davonte Martin — dm538@uakron.edu |
| Repo | https://github.com/TravisD-jpg/Reclaim |

The captain submits every stage report, named `StageN_7010607.doc(x)`, and tracks project progress.

---

## 2. Assignment requirements

Build a **database-driven web application**: model the data, design and normalize the schema, write the SQL to create and populate it with **real data**, define the app's functions, and write the programs that use the database.

### Required functions
**Basic functions**
1. Insert, update and delete records.
2. Search records and return results, using a few different interesting queries. **At least one query must join multiple tables.**

**Advanced functions**
- At least **2** for 475. **575 (graduate) students need at least 3.**
- Each one must be:
  1. useful to users,
  2. *much* more technically challenging than the basic functions,
  3. creative or new compared with similar apps.
- Each one must solve a technically challenging problem and involve real programming.
- At the demo, the team must define the hard problem and explain the solution in detail.
- Example the assignment gives: automatically parsing or extracting data from existing websites, written generally enough to survive format changes.

### Real data
- Must come from real sources (Kaggle, OpenDataSoft, CKAN, Data.gov, the web, …).
- If the data depends on users entering it, the system must be fully running **at least one week before the presentation**, and the team must email the instructor. Data typed in the night before does not earn full credit.

### Stages

| Stage | Deliverable | Contents |
|---|---|---|
| 1 | Group formation | Team name, members and their UA emails, captain |
| 2 | Proposal (`Stage2_7010607`) | Title; summary; domain; usefulness (similar apps and how ours differs); realness (data source); basic and advanced functions |
| 3 | Development plan (`Stage3_7010607`) | Database and platforms; relational schema with every PK and constraint; real data source; task division; timeline |
| 4 | Initial demo (**5–8 min**) + report `Stage4_7010607` | **Demo:** real data in the DB; insert/update/delete; at least one search query; plan for the advanced functions. **Report:** title; summary; databases and platforms; how the real data was obtained; detailed description of each function built; planned advanced functions |
| 5 | Progress report `Stage5_7010607` | Title; current status (functions, real data); how the advanced functions are implemented |
| 6 | Final demo (**10–15 min**) | Basic functions (insert/update/delete plus a search query); **at least 2 advanced functions (3 for 575)** |
| 7 | Final submission `Stage7_7010607.zip` to Brightspace | Complete final report (implementation details for each function, screenshots, each member's contributions, lessons learned, future work); source code; setup instructions (platform, language, configuration, URLs for external libraries); presentation slides; list of changes made since the demo |

### Grading

| Component | Weight |
|---|---|
| Proposal | 15% |
| Development plan | 10% |
| Initial presentation/demo | 15% |
| Progress report | 15% |
| Final presentation/demo | 25% |
| Final project submission | 15% |
| Individual grade | 5% |

The grade depends on **how well the project meets the expectations set by the proposal**, how well the system works, how usable it is, and **how readable the code is**.

### Rubric (each scored 0–4)
**Project quality**
- 4 = completely specified, designed and implemented, with no deficiencies.
- 3 = almost complete, with a few minor deficiencies.
- 2 = largely complete, with several minor deficiencies.
- Writing quality is scored the same way (4 = writes well independently).

**Presentation**
- 4 = well practiced and **within the time limit**.
- Oral communication: 4 = answers questions and takes part in a rigorous discussion with reviewers.
- Coherence: 4 = completely understandable.

---

## 3. Proposal (Stage 2)

**Title:** Reclaim

**Summary:** Reclaim is a public-service system to help students and staff alike. It helps everyone find lost items and reduces theft by getting lost items to the proper owner more quickly.

### Domain
A system where users and staff find and store items lost around campus. It stores:
- current items: date found, description, possibly a photo, and where it was found;
- past items: when each was checked out, by whom, and that person's student ID.

Users log in, browse a catalog of lost items, and search by **name, location and type**. Picking up an item requires a **verification process** with staff.

### Usefulness
**Users:** any student, faculty or staff member who loses something on campus, plus the staff who manage lost property by hand today.

**Similar systems:**
- UA's current process is spread across Bierce Library, the Student Union and UAPD. It's reachable only by phone or email, weekdays 9–4, and has no searchable catalog.
- Commercial platforms: RepoApp, vFound and FoundFastApp. Some already match reports to items automatically.
- NYC MTA Lost & Found.

**How ours differs:**
- One searchable catalog covering every drop-off point, available at any hour.
- Ownership verification is built into the data model: staff record distinguishing details that the claimant must confirm.

### Basic functions (as promised)
- **Insert/update/delete:**
  - Users can insert lost-item entries.
  - Staff can insert, update and delete any record: lost-item entries, found-item entries and claim records. This keeps the catalog accurate and lets staff remove stale or duplicate reports.
- **Search:** by item name (e.g. "iPhone") and by last-seen location (e.g. "Olin Hall"), among others.
- **Multi-table join:**
  - Staff can view an item's details and history: status, when it was claimed, **which staff member signed off on the claim**, where it was found, and more.
  - Tables involved: Items, Locations, Categories, Users (staff) and Claims.

### Advanced Function 1 — Smart Search
- **What it does:** When a user reports an item lost, the system automatically compares the report against stored items and returns possible matches. The user reviews them by hand.
- **Why it's useful:** Users and staff describe the same item differently, so close matching is needed.
- **Why it's hard:** It has to compare several properties across reports and needs a **scoring algorithm**.
- **Why it's new:** The app actively finds likely matches instead of making users search manually.

### Advanced Function 2 — Identity Verification
- **What it does:**
  - When logging an item, staff also store small details that only the owner would know (e.g. the keychain on a backpack, specific contents).
  - These details are hidden from users.
  - Claimants must identify them to claim the item.
- **Why it's useful:** It reduces theft through the system.
- **Why it's hard:**
  - Staff and users need different permissions.
  - The details must stay private.
  - **Failed check-out attempts are recorded, along with who made them.**
- **Why it's new:** Verification happens in the database itself, not just as a listing website.

---

## 4. Development plan (Stage 3)

### Stack

| Layer | Choice |
|---|---|
| DBMS | PostgreSQL 18 (18.6) hosted on **Neon** (free tier) |
| Back end | C# 14, ASP.NET Core Web API, **.NET 10** |
| Front end | **React 19** (19.2) with **Vite 8**, Node.js 24 LTS |
| Data access | **Dapper 2.1** + **Npgsql 10** (hand-written SQL, including the joins) |
| Hosting | Runs on localhost and is demoed over screen share; the live DB stays on Neon |
| Tools | pgAdmin 4; CsvHelper (CSV import); FuzzySharp 2.0 (Smart Search scoring); BCrypt.Net-Next 4.0 (password hashing); Swagger UI / Swashbuckle (API testing) |

### Relational schema (PKs listed first)
```
Users(user_id, name, email, uakron_id, role, password_hash, created_at)
Categories(category_id, name)
Locations(location_id, building, room_or_area, is_dropoff_point)
Items(item_id, name, description, category_id, found_location_id, date_found, status, photo_url, logged_by)
ItemSecretDetails(detail_id, item_id, detail_text)
LostReports(report_id, user_id, name, description, category_id, last_seen_location_id, date_lost, status)
Claims(claim_id, item_id, user_id, report_id, approved_by, claim_date)
VerificationAttempts(attempt_id, item_id, user_id, attempt_time, passed)
MatchCandidates(report_id, item_id, score, generated_at)      -- PK (report_id, item_id)
```

Key constraints:
- **Every single-column PK:** `INT GENERATED ALWAYS AS IDENTITY`.
- **Users**
  - `email` and `uakron_id` are UNIQUE NOT NULL.
  - `role` CHECK IN ('user','staff').
  - `created_at` DEFAULT CURRENT_TIMESTAMP.
- **Categories:** `name` VARCHAR(50) UNIQUE NOT NULL.
- **Locations:** `is_dropoff_point` DEFAULT FALSE.
- **Items**
  - `date_found` is NOT NULL.
  - `status` CHECK IN ('stored','claimed','disposed').
  - FKs to Categories, Locations, and Users (`logged_by`).
- **ItemSecretDetails**
  - `item_id` FK → Items **ON DELETE CASCADE**.
  - `detail_text` VARCHAR(255) NOT NULL.
  - **Never returned to non-staff users.**
- **LostReports**
  - `user_id` is NOT NULL.
  - `status` CHECK IN ('open','matched','closed').
- **Claims**
  - `item_id` is NOT NULL **UNIQUE**, so an item can be claimed only once.
  - `report_id` is nullable.
  - `approved_by` is NOT NULL and references a staff user.
  - `claim_date` is NOT NULL.
- **VerificationAttempts:** `passed` BOOLEAN NOT NULL; `attempt_time` DEFAULT now.
- **MatchCandidates:** `score` DECIMAL(5,2) CHECK BETWEEN 0 AND 100; `generated_at` DEFAULT now.

### Real data plan

| Source | Format | Est. records | Tables |
|---|---|---|---|
| Kaggle "Lost Found" — https://www.kaggle.com/datasets/drishyatomar/lostfound | CSV | ~10,000 | Items, Categories |
| UA Campus Map — https://www.uakron.edu/maps/ | JSON (`console.log(buildings)`) | number of buildings | Locations |
| Team-entered test data | manual / web forms | ~100 lost reports, ~20 users | Users, LostReports, ItemSecretDetails, Claims, VerificationAttempts |
| Generated by the app | — | varies | MatchCandidates (Smart Search) |

Steps:
1. **Collect:** download the Kaggle CSV; extract the building list from the campus map page.
2. **Clean:**
   - Drop rows with no item name.
   - Fill an empty description with the item name.
   - Convert ALL CAPS to normal case.
   - Remove duplicate rows.
3. **Map:**
   - `item_name` → Items.name, grouped into about 10–15 Categories.
   - `description` → Items.description.
   - `receiving_date` → Items.date_found.
   - `item_quantity` and `receiving_time` are not used.
   - Each Delhi Metro `station_name` is assigned to a UA building.
4. **Load:** a **C# import tool (CsvHelper + Dapper)** inserts the data into Neon in FK order: Categories and Locations, then Items.
5. **Supplement:**
   - About 100 team-written lost reports that describe sample found items in the owner's own words. These give Smart Search matches with known correct answers.
   - Hidden detail records for those sample items.
   - Test users.

### Task division
| Member | Role | Responsibilities |
|---|---|---|
| Travis Dumire | Captain | Submits stage reports, checks milestones, tracks progress |
| Davonte Martin | Member | Helps with stage reports, gives status feedback, discusses plans |
| Shared | All | Schema, frontend, backend, SQL queries, features |

### Timeline (2026)
| Date | Milestone | Deliverable |
|---|---|---|
| Oct 9 | Dev environment set up | Repo, DBMS, framework skeleton running |
| Oct 16 | Database built and populated | CREATE TABLE scripts; real data loaded |
| **Oct 23** | Basic functions complete | Insert/update/delete; search queries including a multi-table join |
| **Oct 26** | Stage 4 initial demo | Working demo + Stage 4 report |
| Nov 13 | Advanced Function 1: Smart Search | Match scoring between lost reports and found items |
| Nov 25 | Stage 5 progress report | Status of functions and advanced features |
| Nov 27 | Advanced Function 2: Identity Verification | Staff-only details, claim checks, attempt logging |
| Nov 27 | Testing and polish | Bug fixes, UI cleanup |
| Nov 30 | Stage 6 final demo | Slides + live demo |
| Dec 6 | Stage 7 final submission | Final report, source, setup instructions, slides |
