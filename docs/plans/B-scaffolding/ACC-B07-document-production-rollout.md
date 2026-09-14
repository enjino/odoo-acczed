# ACC-B07 — Document the production rollout (documentation only)

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ✅ done (2026-09-14)|
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

## Result (2026-09-14)

Runbook written to **[PRODUCTION-ROLLOUT.md](PRODUCTION-ROLLOUT.md)** — the six numbered steps, each
with its own verification, plus rollback and the Phase A/B gotchas that apply in production.

**Nothing in it has been executed against production**, as this task requires (documentation only).

Three things the runbook adds beyond the brief's step list:

- **`-u` not `-i`.** On a re-run `-i` is a silent no-op that deploys nothing; only `-u` upgrades. The
  brief's step 4 used `-u`, but the reason is worth stating because the failure is invisible.
- **`addons_path` must have no spaces.** A space after a comma silently breaks discovery rather than
  erroring, so the runbook includes a one-line check for it.
- **rtlcss must be on the *service* PATH**, not root's — systemd does not inherit a login shell, so
  Arabic mirroring would fail at runtime while every other step looked green.

It also flags that four of the paths in the task's context table (`/opt/odoo-acczed`,
`/opt/odoo-acczed-venv`, the config, the service names) are **not independently verified** — they came
from the brief. The runbook tells the operator to confirm them before step 1 rather than trusting the
table. Only the droplet host, TLS termination and the DB read are verified (ACC-A04).

## Risks / notes (added)

- The rollback that matters is the cheap one: remove the path from `addons_path` and restart. The
  module stays `installed` but is not loaded, which is harmless and keeps its version so a later
  re-add upgrades cleanly instead of reinstalling. Uninstalling is documented as the heavier fallback.
- **ACC-B04's local `odoo.conf` change is not in git** (`odoo.conf` is gitignored). This runbook
  documents the production equivalent, but the *local* config still has to be re-applied by hand after
  a fresh clone. That gap is real and this task does not close it.

---
← Phase B index: [../README.md](../README.md)
