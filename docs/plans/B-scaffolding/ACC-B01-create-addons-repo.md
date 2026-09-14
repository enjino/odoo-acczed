# ACC-B01 — Create the acczed-addons repository

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-A08 |
| **Estimated** | 10 min |
| **Touches** | `~/Desktop/Projects/acczed-addons/` (new repo) |

## Goal

Give every acczed Odoo module its own repository, separate from the Odoo fork, so a fork re-clone can never wipe product code.

## Context (verified)

- The odoo-acczed checkout is a shallow fork (`--depth 1`); a re-clone deletes untracked files — a lesson already recorded for this project.
- The user asked for all task files to live in a dedicated folder inside the project; the same reasoning applies to modules.

## Steps

- [ ] **1. Create and initialise**
  ```bash
  mkdir -p ~/Desktop/Projects/acczed-addons && cd ~/Desktop/Projects/acczed-addons
  git init
  ```
  → expected: empty git repo
- [ ] **2. Add README.md and .gitignore**
  ```bash
  README.md: one line — "acczed product modules for Odoo 19 (identity first, then Saudi functionality)"
  .gitignore: *.pyc, __pycache__/, .venv/, *.log
  ```
  → expected: both files exist
- [ ] **3. First commit**
  ```bash
  git add -A && git commit -m "chore(repo): init acczed-addons"
  ```
  → expected: 1 commit

## Verification

- `git log --oneline` shows the init commit.
- No module code exists yet (that is ACC-B03).

## Done when

- [ ] repo exists with README + .gitignore + init commit

## Risks / notes

- Do not put this repo inside the odoo-acczed working tree.

---
← Phase B index: [../README.md](../README.md)
