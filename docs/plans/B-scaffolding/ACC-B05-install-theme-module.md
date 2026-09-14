# ACC-B05 — Install acczed_theme in the acczed database

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B04 |
| **Estimated** | 10 min |
| **Touches** | DB `acczed` |

## Goal

Get a green install of the empty module: the proof that the third addons path is functional.

## Context (verified)

- Odoo 19 install command: `odoo-bin -c odoo.conf -d acczed -i acczed_theme --stop-after-init` with `env -u PYTHONPATH`.

## Steps

- [ ] **1. Install**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed -i acczed_theme --stop-after-init
  ```
  → expected: log ends with the module marked installed
- [ ] **2. Confirm in the database**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select name,state from ir_module_module where name='acczed_theme';"
  ```
  → expected: acczed_theme|installed
- [ ] **3. Restart the running stack**
  ```bash
  bash run-odoo.sh stop && bash run-odoo.sh start
  ```
  → expected: ready, 200 on /web/login

## Verification

- SQL shows `acczed_theme|installed`.
- No ERROR in `logs/odoo.log` from the install.
- Stack restarts cleanly.

## Done when

- [ ] module installed in acczed
- [ ] log clean

---
← Phase B index: [../README.md](../README.md)
