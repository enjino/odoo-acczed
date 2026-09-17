# ACC-C02 — Make the dark bundle load by default

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started — **built 2026-09-15, reverted 2026-09-17** (see `../evidence/evidence.log`) |
| **Depends on** | ACC-C01 |
| **Estimated** | 30 min |
| **Touches** | `acczed-addons/acczed_theme/models/ir_http.py` (new), `models/__init__.py` |

## Goal

The dark CSS bundle is only served when the server says so — flip that switch in the single place responsible for it.

## Context (verified)

- `ir.http.color_scheme()` returns a hardcoded `"light"` and is the ONLY definition in the tree (`addons/web/models/ir_http.py:77-78`; consumed at `:73`).
- The template loads `web.assets_web_dark` only when `color_scheme == 'dark'` (`addons/web/views/webclient_templates.xml:300-305`).
- Nothing in community writes the `color_scheme` cookie — 17 places only read it.

## Steps

- [ ] **1. Add the model override**
  ```bash
  from odoo import models
  
  class IrHttp(models.AbstractModel):
      _inherit = 'ir.http'
  
      # base: addons/web/models/ir_http.py:77 returns "light"
      def color_scheme(self):
          return 'dark'   # TODO: per-user preference is a separate decision (ACC-A07)
  ```
  → expected: file imports cleanly
- [ ] **2. Update and restart**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed -u acczed_theme --stop-after-init
  bash run-odoo.sh stop && bash run-odoo.sh start
  ```
  → expected: no traceback
- [ ] **3. Prove the dark bundle is being served**
  ```bash
  # open the backend, devtools Network tab, filter 'assets_web_dark'
  # the dark CSS request must appear and return 200
  ```
  → expected: web.assets_web_dark requested

## Verification

- The webclient requests `web.assets_web_dark`.
- With CC-C03 applied the UI is visibly dark on first load (no toggle needed).
- Reverting the override restores the light bundle.

## Done when

- [ ] override committed in acczed_theme
- [ ] dark bundle confirmed in Network tab

---
← Phase C index: [../README.md](../README.md)
