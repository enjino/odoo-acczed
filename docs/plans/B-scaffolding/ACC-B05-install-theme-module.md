# ACC-B05 — Install acczed_theme in the acczed database

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`)|
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

## Result (2026-09-14)

```
P=select name,state,latest_version from ir_module_module where name='acczed_theme'
-> acczed_theme|installed|19.0.0.1.0
P=select count(*) filter (where state='installed') from ir_module_module   -> 42   (was 41)
```

Install exit code 0. Log: `Loading module acczed_theme (42/42)`, `loading
acczed_theme/views/brand_templates.xml`, `Module acczed_theme loaded in 0.14s, 10 queries`. Stack
restarted (pids 180687/180688), serving 200 after 2s, **zero** new ERROR/CRITICAL lines.

**Deviation from the documented step order, and why:** the task installs against the running stack and
restarts afterwards. I stopped the stack *before* installing instead, to avoid two processes writing
the same registry concurrently. The end state is identical — installed, then a fresh server — and the
restart the task already prescribes would have cleared any staleness anyway.

## Bonus finding

The install log confirms ACC-A01's root cause **verbatim**, which had only been inferred before:

```
WARNING odoo.tools.config: option db_name reads 'False' in the config file at .../odoo.conf
but isn't a boolean option, skip
```

So `db_name = False` is a warning-producing **no-op**, not a setting. That is precisely why an
unqualified `/web/login` cannot resolve a database and redirects to the selector.

---
← Phase B index: [../README.md](../README.md)
