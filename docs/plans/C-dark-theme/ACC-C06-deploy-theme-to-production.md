# ACC-C06 — Deploy the theme to production

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
| **Depends on** | ACC-C05, ACC-B07 |
| **Estimated** | 1 hr |
| **Touches** | droplet: `/opt/acczed-addons`, `/opt/odoo-acczed/odoo.conf`, systemd units |

## Goal

Put the identity on the surface customers actually see, using the runbook written in ACC-B07.

## Context (verified)

- Rollout runbook: ACC-B07. Services: `odoo-http` (:8069) + `odoo-gevent` (:8072) as user `odoo`; Caddy terminates TLS for backend.acczed.online.

## Steps

- [ ] **1. Ship the repo to the droplet**
  ```bash
  ssh odoo-acczed
  # clone or pull into /opt/acczed-addons, then chown -R odoo:odoo
  ```
  → expected: path exists, owned by odoo
- [ ] **2. Prepend the path and upgrade the module**
  ```bash
  # /opt/odoo-acczed/odoo.conf -> prepend /opt/acczed-addons to addons_path
  cd /opt/odoo-acczed
  env -u PYTHONPATH /opt/odoo-acczed-venv/bin/python odoo-bin -c odoo.conf -d acczed -u acczed_theme --stop-after-init
  systemctl restart odoo-http odoo-gevent
  ```
  → expected: services active
- [ ] **3. Verify from outside**
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://backend.acczed.online/web/login
  curl -s https://backend.acczed.online/web/login | grep -o "<title>[^<]*</title>"
  ```
  → expected: 200, title per ACC-D01 (or still Odoo if D is not deployed yet)

## Verification

- Production serves 200 and the dark theme on first load.
- `systemctl status odoo-http odoo-gevent` = active (running).
- Screenshot `after-c06-login-prod.png` stored in evidence/.

## Done when

- [ ] production deployed
- [ ] prod screenshot + status captured
- [ ] rollback (remove path + restart) recorded as tested-or-not

## Risks / notes

- Rollback = remove the path from addons_path and restart; the module stays installed but inert.
- Deploy C and D together if possible — a dark backend with an Odoo-branded login looks worse than either alone.

---
← Phase C index: [../README.md](../README.md)
