# ACC-B04 — Add the acczed-addons path to the local odoo.conf

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`)|
| **Depends on** | ACC-B03 |
| **Estimated** | 10 min |
| **Touches** | `odoo-acczed/odoo.conf` |

## Goal

Make Odoo discover the product modules while keeping the fork's own addons available.

## Context (verified)

- Current value: `addons_path = /home/ahmed-karmy/Desktop/Projects/odoo-acczed/addons,/home/ahmed-karmy/Desktop/Projects/odoo-acczed/odoo/addons`.
- Our path goes FIRST so a same-named module in the fork cannot shadow ours.

## Steps

- [ ] **1. Prepend the new path**
  ```bash
  addons_path = /home/ahmed-karmy/Desktop/Projects/acczed-addons,/home/ahmed-karmy/Desktop/Projects/odoo-acczed/addons,/home/ahmed-karmy/Desktop/Projects/odoo-acczed/odoo/addons
  ```
  → expected: single line, comma separated, no spaces
- [ ] **2. Restart and confirm the path was read**
  ```bash
  bash run-odoo.sh stop && bash run-odoo.sh start
  bash run-odoo.sh logs | grep -i "acczed-addons" | tail -3
  ```
  → expected: path appears in the module loading output

## Verification

- Odoo starts without an `addons_path` warning.
- `acczed-addons` appears in the log's addons search.
- Both fork paths are still present.

## Done when

- [ ] odoo.conf updated
- [ ] stack restarted and still serving 200

## Result (2026-09-14)

`addons_path` now reads, with our path **first** so the fork cannot shadow a product module:

```
addons_path = /home/ahmed-karmy/Desktop/Projects/acczed-addons,/home/ahmed-karmy/Desktop/Projects/odoo-acczed/addons,/home/ahmed-karmy/Desktop/Projects/odoo-acczed/odoo/addons
```

Confirmed read by the running server — `logs/odoo.log` after restart:

```
addons paths: _NamespacePath(['.../odoo/addons', '~/.local/share/odoo-acczed/addons/19.0',
                              '/home/ahmed-karmy/Desktop/Projects/acczed-addons', '.../odoo-acczed/addons'])
```

Both fork paths remain. Restarted cleanly (pids 179645/179646), login page returns 200, zero new
ERROR lines.

## Risks / notes (added)

- ⚠️ **`odoo.conf` is gitignored** (`.gitignore:26` → `/odoo.conf`), so this change is machine-local
  and **is not in git**. A fresh clone would not discover `acczed-addons` at all. Backed up at
  `/tmp/odoo.conf.bak.*` before editing. The edit needs documenting somewhere tracked — ACC-B07 is
  the natural home.
- ⚠️ `run-odoo.sh status` prints `login page: HTTP 303`. That is **not** a failure: its internal curl
  sends no cookie jar, so it sees the first-request redirect discovered in ACC-A01. Verify with
  `curl -sL -c cj -b cj "…?db=acczed"` instead.

---
← Phase B index: [../README.md](../README.md)
