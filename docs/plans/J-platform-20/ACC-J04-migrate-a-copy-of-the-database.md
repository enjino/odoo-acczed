# ACC-J04 — Migrate a copy of the database first

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
| **Depends on** | ACC-J03 |
| **Estimated** | 3 hrs |
| **Touches** | a new database `acczed_p20` only; `acczed` is not touched |

## Goal
The 19 → 20 module upgrade is proven end-to-end on a throwaway copy of `acczed`, with every failure
named, before the real database is migrated.

## Context (verified)
- `acczed` is 43 MB with 42 installed / 613 uninstalled / 23 uninstallable modules; `acczed_theme`
  `19.0.0.1.1`, `web` `19.0.1.0`.
- `account`, `l10n_sa`, `l10n_sa_edi` are all uninstalled, so the accounting surface the upgrade has to
  carry is small — the upgrade is dominated by `web`, `mail`, `project`, `portal` and `base`.
- Odoo stores attachments in `data_dir/filestore/<dbname>` (`odoo.conf:17`), so a copy named
  `acczed_p20` reads an **empty** filestore unless it is pointed at the original.
- The 19-era dump to restore from is in `~/backups/odoo-acczed/20261012-121926/acczed.dump` (ACC-J01).
- Upstream 20.0 removes 49 module directories that exist in 19.0 in a raw listing diff (including
  `base_iban`, `base_vat`, `stock_picking_batch`, `hr_homeworking`, `website_sale_wishlist`,
  `l10n_sa_withholding_tax`) — a module installed here that 20.0 no longer ships would fail the upgrade,
  so the installed list is checked against the 20.0 tree first.

## Steps
- [ ] **1. Restore the dump into a copy**
  ```bash
  docker exec odoo-postgres createdb -U odoo acczed_p20
  docker exec -i odoo-postgres pg_restore -U odoo -d acczed_p20 --no-owner < ~/backups/odoo-acczed/20261012-121926/acczed.dump
  ```
- [ ] **2. Point the copy at the original filestore (optional, for attachment checks)**
  ```bash
  ln -s acczed ~/.local/share/odoo-acczed/filestore/acczed_p20
  ```
- [ ] **3. Cross-check installed modules against the 20.0 tree**
  ```bash
  comm -23 <(cut -d'|' -f1 ~/backups/odoo-acczed/20261012-121926/acczed-installed-modules.txt | sort) \
           <(ls addons odoo/addons | sort -u)
  ```
  → expected: empty. Any name printed is installed here and absent from 20.0
- [ ] **4. Run the upgrade on the copy**
  ```bash
  bash run-odoo.sh stop
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python odoo-bin \
      -c odoo.conf -d acczed_p20 -u all --stop-after-init 2>&1 | tee /tmp/j04-upgrade.log
  ```
- [ ] **5. Compare module states before and after**

## Verification
- `grep -ciE "error|traceback|failed" /tmp/j04-upgrade.log` → 0
- `select state, count(*) from ir_module_module group by state` on `acczed_p20` vs the 19 baseline
  (`acczed-module-states.txt`) → same 42/613/23 split, or every difference explained
- `select count(*) from res_users, ir_model_fields` before/after → unchanged
- `select name, latest_version from ir_module_module where state='installed' order by name` → the
  installed set carries `20.0.*` versions

## Done when
- [ ] `acczed_p20` upgraded with zero unexplained errors
- [ ] the module-state diff is recorded in `evidence/evidence.log`
- [ ] any module that cannot survive 20 is named, with what replaces it

## Risks / notes
- **Never run `-u all` against `acczed` first.** The copy exists precisely so a failed upgrade costs
  nothing.
- The upgrade is not reversible in place: after `-u all` the copy's schema is 20-shaped. Re-create it
  from the dump if a second attempt is needed.
- Assets are rebuilt on first request, so the first page load after the upgrade is slow — that is not
  a failure.
