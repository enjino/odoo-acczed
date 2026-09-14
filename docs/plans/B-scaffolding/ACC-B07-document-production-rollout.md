# ACC-B07 — Document the production rollout (documentation only)

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B05 |
| **Estimated** | 15 min |
| **Touches** | `docs/plans/` (runbook text) |

## Goal

Write the exact droplet steps now so the first real deployment (ACC-C06) is mechanical, not improvised.

## Context (verified)

- Production: repo `/opt/odoo-acczed`, venv `/opt/odoo-acczed-venv`, config `/opt/odoo-acczed/odoo.conf`, services `odoo-http` + `odoo-gevent` as user `odoo`, Caddy terminates TLS for backend.acczed.online.

## Steps

- [ ] **1. Write the runbook steps**
  ```bash
  1. clone/pull acczed-addons into /opt/acczed-addons (as root, then chown odoo)
  2. prepend /opt/acczed-addons to addons_path in /opt/odoo-acczed/odoo.conf
  3. ensure rtlcss is on PATH for both systemd units (phase E)
  4. run: env -u PYTHONPATH /opt/odoo-acczed-venv/bin/python odoo-bin -c odoo.conf -d acczed -u acczed_theme --stop-after-init
  5. systemctl restart odoo-http odoo-gevent
  6. verify: curl -s -o /dev/null -w "%{http_code}" https://backend.acczed.online/web/login
  ```
  → expected: 6 numbered steps, each with its verification
- [ ] **2. Note the rollback**
  ```bash
  rollback = remove the path from addons_path + restart services (module stays installed but inert)
  ```
  → expected: rollback path documented

## Verification

- Runbook exists with commands and a rollback.
- No command in it has been executed yet (documentation only this phase).

## Done when

- [ ] rollout runbook written
- [ ] rollback documented

---
← Phase B index: [../README.md](../README.md)
