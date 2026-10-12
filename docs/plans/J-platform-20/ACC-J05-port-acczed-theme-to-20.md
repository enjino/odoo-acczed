# ACC-J05 — Port `acczed_theme` to 20

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
| **Depends on** | ACC-J04 |
| **Estimated** | half a day |
| **Touches** | `~/Desktop/Projects/acczed-addons` (sibling repo, branch `main`) |

## Goal
`acczed_theme` installs and upgrades cleanly on Odoo 20 with every override re-checked against the 20
tree, and its version string says 20.

## Context (verified)
- Module lives in the sibling repo `~/Desktop/Projects/acczed-addons` (remote `enjino/acczed-addons`,
  branch `main` @ `57e6809`), placed first in `addons_path` (`odoo.conf:19`) so it cannot be shadowed.
- Manifest `version: '19.0.0.1.1'` (`acczed_theme/__manifest__.py:6`); CONVENTIONS §7.2 fixes the
  pattern as `19.0.x.y.z`, which this task has to change to `20.0.x.y.z`.
- The module carries one live asset directive (`web.report_assets_common`, `('before',
  'web/static/src/webclient/actions/reports/bootstrap_overridden_report.scss', …)` — ACC-E05's font fix)
  and one commented-out, flag-gated `web.assets_web` entry (ACC-F02b).
- **Uncommitted work in flight**: `acczed_theme/__init__.py` (+10), `__manifest__.py` (+12),
  `scripts/gen-tokens.mjs` (+217). It must be committed before the version bump, or the bump lands on
  top of unreviewed changes.
- CONVENTIONS §7.4: every override cites a `file:line` reference **and is re-checked after a fork
  upgrade** — this task is that re-check.

## Steps
- [ ] **1. Commit the in-flight ACC-F02b work on `main`** (it is a prerequisite, not this task's content)
- [ ] **2. Bump the manifest version and the convention**
  `version: '20.0.0.1.1'` in `acczed_theme/__manifest__.py`, CONVENTIONS §7.2 → `20.0.x.y.z`
- [ ] **3. Re-check every cited path exists in the 20 tree**
  ```bash
  ls addons/web/static/src/webclient/actions/reports/bootstrap_overridden_report.scss
  grep -n "primary_variables" addons/web/__manifest__.py
  ```
- [ ] **4. Install/upgrade against the migrated copy**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python odoo-bin \
      -c odoo.conf -d acczed_p20 -u acczed_theme --stop-after-init
  ```
- [ ] **5. Re-run the module's own guards**
  ```bash
  bash tools/verify-rtl.sh
  python3 tools/i18n-coverage.py
  node scripts/gen-tokens.mjs --check   # in acczed-addons
  ```

## Verification
- `select latest_version from ir_module_module where name='acczed_theme'` → `20.0.0.1.1`
- the upgrade log has no `ERROR` and no missing-asset warning
- `verify-rtl.sh` → 11 passed, 0 failed (ACC-E03's recorded count)
- the report font still loads locally: `node tools/report-font-check.js` → no `fonts.odoocdn.com` fetch

## Done when
- [ ] module installs and upgrades on 20 with zero errors
- [ ] every `file:line` citation in the module re-checked against the 20 tree
- [ ] version string is `20.0.0.1.1` and CONVENTIONS §7.2 says `20.0.x.y.z`

## Risks / notes
- A module whose manifest version series disagrees with the server's is still installable but reports a
  misleading `latest_version`; the string is the tag layer ACC-J08 depends on.
- The ACC-F02b flag (`ACCZED_LOAD_THEME_LAYER`) is deliberately `False` — phase C is deferred. Do not
  flip it as part of this task; ACC-C01 owns that.
- Never edit files under the fork's `addons/` to make an override fit (CONVENTIONS §7.3).
