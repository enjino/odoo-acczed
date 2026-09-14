# ACC-B02 — Write docs/CONVENTIONS.md for module work

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`)|
| **Depends on** | ACC-B01 |
| **Estimated** | 15 min |
| **Touches** | `acczed-addons/docs/CONVENTIONS.md` |

## Goal

Fix the rules once, so every future module (and every subagent) inherits the same naming, licensing and RTL habits.

## Context (verified)

- Naming was just unified for tasks too: `ACC-<phase><NN>`; modules follow `acczed_<domain>`.

## Steps

- [ ] **1. Write the seven binding rules**
  ```bash
  1. module names: acczed_<domain>  (acczed_theme, acczed_sa_payroll)
  2. manifest version: '19.0.x.y.z'
  3. never edit fork files directly - inherit views, extend models
  4. every override cites a file:line reference in a comment
  5. every visual change ships with before/after screenshots in docs/plans/evidence
  6. no hardcoded left/right in SCSS - logical properties or /*rtl:ignore*/
  7. no secrets in the repo - odoo.conf / server-side .env only
  ```
  → expected: 7 rules, each with a one-line reason
- [ ] **2. Add the task-file convention**
  ```bash
  task id: ACC-<phase><NN>
  task file: docs/plans/<Phase>-<slug>/ACC-<phase><NN>-<slug>.md
  commit: "ACC-<phase><NN>: <imperative summary>"
  ```
  → expected: matches the plan folder already in place

## Verification

- CONVENTIONS.md exists and covers naming, versioning, inheritance, RTL, secrets.
- The task-file convention in it matches the actual docs/plans layout.

## Done when

- [ ] CONVENTIONS.md committed
- [ ] task + commit naming rules stated

## Result (2026-09-14)

`acczed-addons/docs/CONVENTIONS.md` written and committed (`3ada833`). All seven rules are present
with a one-line reason each, plus the task/branch/commit naming table.

Two rules carry lessons from Phase A rather than being generic advice:

- **Rule 5** records that plain `google-chrome --headless --screenshot` silently captures a *blank*
  Odoo page (the login form is `d-none` until OWL reveals it), so the rule points at `tools/shot.js`
  in the odoo-acczed repo instead of at "take a screenshot".
- **Rule 6** records that rtlcss mirroring turns a hardcoded `left` into a wrong-side element with no
  error raised — the failure is invisible unless someone reads Arabic.

The task-file convention matches the actual `docs/plans/` layout, as the verification requires.

---
← Phase B index: [../README.md](../README.md)
