# ACC-B02 — Write docs/CONVENTIONS.md for module work

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
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

---
← Phase B index: [../README.md](../README.md)
