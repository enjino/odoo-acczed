# ACC-J09 — Upgrade production to 20 (gated, separate window)

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | 🅿️ parked |
| **Depends on** | ACC-J08 |
| **Estimated** | 1 day + a maintenance window |
| **Touches** | droplet `odoo-acczed` (46.101.146.87): `/opt/odoo-acczed`, `/opt/odoo-acczed-venv`, `acczed` prod DB, systemd units |

## Goal
`backend.acczed.online` serves Odoo 20 on the same data, after a snapshot exists and with a tested
rollback.

## Context (verified)
- Production is droplet `odoo-acczed` (id 598020007, fra1), repo `/opt/odoo-acczed` (shallow clone),
  venv `/opt/odoo-acczed-venv` (py3.12), postgres:16 container on 127.0.0.1:5433, systemd
  `odoo-http.service` (:8069) + `odoo-gevent.service` (:8072), Caddy in front.
- **The 2026-08-30 droplet was destroyed with no snapshot in existence** and had to be rebuilt by hand
  from a local dump. A snapshot is therefore a precondition, not a nicety.
- Prod runs 19.0 today, and the Vercel frontend depends on it staying up.

## Steps (not to be started without an explicit go)
- [ ] **1. Snapshot the droplet** and verify the snapshot exists in the DO API
- [ ] **2. Dump the prod `acczed` DB and copy the filestore off the droplet**
- [ ] **3. Fetch the `20.0` branch on the droplet, build a second venv, install 20's requirements**
- [ ] **4. Run `-u all --stop-after-init` against the prod DB during the window**
- [ ] **5. Restart both units, verify the two-process model, then verify Caddy + TLS + websocket routing**

## Verification
- `systemctl is-active odoo-http odoo-gevent` → active
- `curl -s -o /dev/null -w '%{http_code}' https://backend.acczed.online/web/login` → 200
- `select state, count(*) from ir_module_module group by state` on prod → matches the migrated copy
- websocket route: `/websocket*` still proxied to :8072

## Done when
- [ ] a snapshot exists and is restorable
- [ ] prod serves 20, both units active, TLS valid, rollback path written down

## Risks / notes
- Rollback is: restore the snapshot, or re-point the units at the 19 venv + 19 tree — decide which
  **before** starting.
- The prod DB has no `account` module either, so the upgrade surface resembles the local copy's.
- Do not bundle this with any theming/branding deploy; one change per window.
