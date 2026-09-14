# ACC-A08 — Phase A acceptance check

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14) |
| **Depends on** | ACC-A01..ACC-A07 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/` |

## Goal

Close the baseline phase only when the evidence set is complete and the repo is untouched.

## Context (verified)

- Rule: no code writes while the workspace is in planning mode; this phase may only produce documentation and screenshots.

## Steps

- [x] **1. Count the evidence files**
  ```bash
  ls -1 docs/plans/evidence/
  ```
  → expected: before-login.png, before-login-prod.png, before-backend-home.png, before-backend-list.png, evidence.log, README.md
  → **actual: exactly those 6.** ✅
- [x] **2. Confirm the repo is clean of code changes**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed && git status --short
  cd ~/Desktop/Projects/acczed-site && git status --short
  ```
  → expected: same as before the phase (no modified source file)
  → **actual:** `acczed-site` is **completely clean**. `odoo-acczed` shows only `?? logs/` and
  `?? run-odoo.sh` — both pre-existing untracked files, neither modified by this phase.
  No file under `addons/`, `odoo/`, `odoo-bin`, `setup.py` or `requirements.txt` differs from `HEAD`. ✅
- [x] **3. Mark every A task done in README**
  ```bash
  # set status to done in the phase table and in each task header
  ```
  → expected: phase A row = done
  → **actual:** all 8 ACC-A task headers and all 8 README row statuses updated; a **Status** column
  added to the Phases table so the "phase A row = done" requirement is expressible at all.

## Verification

- Four screenshots + evidence.log + evidence/README.md present. ✅
- `git status` in both repos shows no source modification. ✅
- README status column updated for every A task. ✅ (8/8)

## Done when

- [x] phase A table row = done
- [x] every ACC-Axx header shows **Status** done

## Phase A gate

The phase gate is: *"4 screenshots + evidence.log, and no source file modified in either repo."*

- **4 screenshots + evidence.log** ✅ — `before-login.png`, `before-login-prod.png`,
  `before-backend-home.png`, `before-backend-list.png`, `evidence.log` (plus the pre-existing
  `evidence/README.md`).
- **No source file modified in either repo** ✅ — see step 2.
- **Every A task done** ✅ — A01–A07 all ✅ (A04 after an initially-blocked production read was
  approved and completed).

**Phase A is closed.**

## Risks / notes

- ⚠️ **One disclosed exception to "no code".** `tools/shot.js` + `tools/README.md` were added during
  this phase, with the user's explicit approval. They are **not** Odoo source and no file under the
  fork's `addons/` tree was touched, so both readings of the gate hold — but it is a new file in the
  repo during an "evidence only" phase, and it is recorded here rather than left implicit. The reason
  it was necessary: no browser tooling existed, and `google-chrome --headless --screenshot` silently
  records a blank login card, so **without it there would be no screenshots to accept**.
- ⚠️ **`run-odoo.sh` is still untracked.** Every Phase A and B task depends on it, it is not
  gitignored, and this is a shallow fork that loses untracked files on re-clone. It should be committed
  before Phase B starts, or Phase B's instructions break on a fresh clone.
- `logs/` is correctly untracked — runtime output, not evidence.
- Phase B's entry condition (ACC-B01 depends on ACC-A08) is now satisfied.

---
← Phase A index: [../README.md](../README.md)
