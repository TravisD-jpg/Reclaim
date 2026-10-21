# AI Usage Log

**Assistant used:** Claude Code (Claude Opus 5.5), October–December 2026.

We used the assistant to read the course documents, check our repo against the proposal, and draft project documentation and code. We read and reviewed every change before it went into the repo.

| # | Date | Prompt Used | What It Did | Inaccuracies / Corrections | What We Learned |
|---|---|---|---|---|---|
| 1 | Oct 21 | "read all project files to gain context" | Read every file in the repo and summarized where the project stands. Found the SQL table-name case bug and the broken `<title>` in `index.html`. | Gave approximate seed counts ("about 108 buildings"); the actual count is 104. | |
| 2 | Oct 21 | "look at Downloads for term project rubric and term project" | Read the assignment and rubric PDFs and summarized grading weights and Stage 4 demo requirements. | None. | |
| 3 | Oct 21 | "there should also be 7010607_stage1, stage2, and stage3 read those for context as well" | Read the Stage 1–3 reports and compared them to the repo. Flagged that items are seeded by SQL instead of the planned import tool, and the 575 three-function rule. | The reports weren't in Downloads; it found them in the OneDrive course folder. | |
| 4 | Oct 21 | "use this as the source of truth and throw it into a doc for context, I want to also create a doc for how our codebase works, so as we add features and made updates, update the doc in parralell." + [pasted AI policy] "here is the ai policy for the class, make a md for this too and track everything it needs going forward" | Created `docs/project-spec.md`, `docs/codebase.md`, this log, and `CLAUDE.md`. | The first draft of `codebase.md` claimed a trailing-comma problem in `Items.sql` that didn't exist. It was removed. | |
| 5 | Oct 21 | "change the ai usage log format, it needs to be a table like entry where each prompt gets it's own what it did, inaccuracies, and what we learned sections, similar to the format of my AI class, I don't want to give the graders a wall of text to read, it shouldn't be overly convuluted with information" | Reformatted this log into one table row per prompt. | None. | |
| 6 | Oct 21 | "Set up this app on Neon." + [pasted 6-step Neon CLI setup: install `neon`, `neon init`, `neon deploy`, wire env vars, build and test, report] | Verified the `neon` npm package is Neon's official CLI and installed it. `neon init` was blocked by the assistant's permission check, so setup paused for user approval. | None. | |
| 7 | Oct 21 | "ok lets fix the db bugs then we'll continue with the neon installation" | Removed the quoted table names that broke the foreign keys, numbered the table scripts in load order, fixed the `Catagories` typo, and gitignored `.env.local`. Tested every script on a local Postgres engine. | Testing found 10 items dated Feb 29, 2026, which doesn't exist. They were moved to Feb 28. | |
