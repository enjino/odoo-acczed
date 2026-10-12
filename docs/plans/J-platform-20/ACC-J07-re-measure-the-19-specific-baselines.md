# ACC-J07 — Re-measure the 19-specific baselines

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
| **Depends on** | ACC-J02 |
| **Estimated** | 3 hrs |
| **Touches** | `docs/plans/README.md`, `docs/enterprise-features-matrix.md`, phase I/II references |

## Goal
Every number the plan quotes is either re-measured on 20 or explicitly marked as a 19.0 measurement, so
no document claims a 20-era fact it never measured.

## Context (verified)
- README's **14 baseline facts** are dated 2026-09-14 and cite 19.0 `file:line` paths
  (`addons/web/static/src/scss/primary_variables.scss:73-83`, `addons/web/models/ir_http.py:73,77-78`,
  `odoo/addons/base/models/assetsbundle.py:653-664`, …).
- Phase I's mechanics are 19.0 counts: ~181 files `t-inherit` a `web.*` template (212 occurrences),
  24 `patch(ListRenderer.prototype, …)` sites, 186 window actions, 101 widget registrations in `web`.
- The addons directory listing moved too: **638 entries in 19.0 → 642 in 20.0**, a raw GitHub API diff
  showing **53 added / 49 removed** directories — including `base_iban`, `base_vat`,
  `stock_picking_batch`, `hr_homeworking`, `website_sale_wishlist` removed and `l10n_sa_withholding_tax`
  removed with no new `l10n_sa_*` added. Semantics are **unverified** — a directory disappearing may mean
  merged into a parent module rather than dropped.
- `grep -l` (files) and `grep -o` (occurrences) disagree; a partial-list sum was once 5× off the real
  surface. Counts must be labelled as raw-text lower bounds, not parses.

## Steps
- [ ] **1. Re-run every count in README §"Baseline facts"** against the `20.0` tree
- [ ] **2. Re-run the phase-I mechanics counts** (t-inherit files/occurrences, `patch()` sites, window
      actions, widget registrations) and diff against the recorded numbers
- [ ] **3. Re-derive the enterprise/community matrix** for 20: which of the 23 `uninstallable` modules
      still exist upstream, and which apps moved edition
- [ ] **4. Produce one diff table: fact → 19.0 value → 20.0 value → action** and apply it
- [ ] **5. Re-check the removed-module list** (49 names) against the 20 tree to say *merged* vs *dropped*

## Verification
- every re-measured number is recorded with the exact command beside it
- `git diff --stat docs/` → the doc edits, and no number changed without a command in the same commit
- the KSA row (`l10n_sa*`) is answered explicitly, since the product's ZATCA claim depends on it

## Done when
- [ ] no 19.0 measurement is presented as current fact
- [ ] the phase-I demand table and the enterprise matrix are correct for 20, or marked stale with a task
- [ ] the 49 removed directories are each classified

## Risks / notes
- This task does **not** rewrite phase I's design; it re-measures its inputs. A changed count that
  invalidates a design decision goes back to ACC-I04, not into a silent edit.
- Label raw scans as lower bounds and say which command produced them.
