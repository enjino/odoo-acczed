# ACC-B04 — Add the acczed-addons path to the local odoo.conf

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
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

---
← Phase B index: [../README.md](../README.md)
