# ACC-J06 — Re-verify phases B, E and F on 20

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
| **Depends on** | ACC-J05 |
| **Estimated** | half a day |
| **Touches** | `docs/plans/evidence/`, the three phases' status lines |

## Goal
The three phases that were *complete* on 19 are proved complete on 20 — or the regression is named and
given a task of its own.

## Context (verified)
- **B (scaffolding)** closed on: `acczed_theme` installed in SQL, zero visual change.
- **E (Arabic/RTL)** closed on: `rtlcss` installed and on the PATH, `ar_001` active, `dir=rtl` verified
  across four measured seams, `tools/verify-rtl.sh` → 11 passed / 0 failed, and reports taken off
  `fonts.odoocdn.com` (ACC-E05).
- **F (tokens)** closed on: `tokens.json` as the single source, the site target generated from it, and
  ACC-F04's copy audit (3 false `live` badges corrected).
- All three were measured on the **19.0** tree, and README's 14 baseline facts carry 19.0 `file:line`
  references — the fork has since moved 726 commits on 19.0 and 18,643 on 20.0.
- `rtlcss` is invoked by Odoo during asset compilation (`odoo/addons/base/models/assetsbundle.py`), so
  whether 20 still shells out to it is a fact to re-check, not assume.

## Steps
- [ ] **1. Re-prove B**: install `acczed_theme` on a clean 20 database, capture the login page, diff
      against the stock frame
- [ ] **2. Re-prove E**: `ar_001` active, `dir=rtl` in the served HTML, `rtlcss --version` on PATH,
      `bash tools/verify-rtl.sh` → 11/0
- [ ] **3. Re-prove F**: one token change in `tokens.json`, regenerate, confirm it reaches both surfaces
- [ ] **4. Re-prove ACC-E05**: `node tools/report-font-check.js` → no request to `fonts.odoocdn.com`
- [ ] **5. Record every count in `evidence/evidence.log`** and update the three phases' status lines

## Verification
- the same commands each phase's task file records, run against 20, with their outputs captured
- `bash tools/verify-rtl.sh` → `11 passed, 0 failed`
- `grep -c "fonts.odoocdn.com" logs/odoo.log` after a report render → 0

## Done when
- [ ] B, E and F each have a recorded 20-era verification, or a named regression with its own task ID
- [ ] README's phase table reflects what actually holds on 20
- [ ] no phase reads ✅ on the strength of a 19.0 measurement alone

## Risks / notes
- A phase that "passes" because the check now reports **VACUOUS** (see CONVENTIONS §8) is not a pass —
  `verify-rtl.sh` reports vacuous, not green, when a module authors no strings.
- Asset caches are per-database; a stale cache can hide a regression. Restart both processes
  (`run-odoo.sh stop && start`) before capturing evidence.
