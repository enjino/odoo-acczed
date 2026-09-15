# ACC-C02 — Make the dark bundle load by default

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ✅ done 2026-09-15 — dark bundle served by default, with the cookie opt-out proven in all four branches |
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

- [x] **1. Add the model override** · **done** — `acczed_theme/models/ir_http.py`
  ```python
  from odoo import models
  from odoo.http import request

  class IrHttp(models.AbstractModel):
      _inherit = 'ir.http'

      def color_scheme(self):
          if request and request.cookies.get('color_scheme') == 'light':
              return 'light'
          return 'dark'
  ```
  **Not the bare `return 'dark'` this task originally specified** — see *Why it reads the cookie*.
- [x] **2. Update and restart** · **done** — no traceback
- [x] **3. Prove the dark bundle is being served** · **done** — asserted by `tools/theme-check.js`
      via resource timing, not by the Network tab, so it runs unattended

## Why it reads the cookie (decision, upfront round 2026-09-15)

The task said to return `'dark'` outright, with a `TODO: per-user preference is a separate decision`.
That would have made **ACC-C04's toggle impossible**, and the failure would have been silent:

| | |
|---|---|
| C02 as written | server always returns `'dark'` |
| C04 as written | writes a `color_scheme` cookie, then reloads |
| Result | the reload asks the same server, which says `'dark'` again — **the UI stays dark and the toggle appears to do nothing** |

The bundle is chosen **server-side** and the cookie is read for the bundle *nowhere* in community —
it is only read at `color_picker.js:124`, `views/view.js:349` and two diff renderers. So for the
opt-out ACC-A07 decision 2 deliberately kept, the server has to consult it.

This is **not** the "follow the system preference" variant that decision 2 rejected: nothing reads
`prefers-color-scheme`. It honours only our own cookie.

## Verification

- **`node tools/theme-check.js` → OK, 7/7**, including `dark bundle served
  /web/assets/67f00f4/web.assets_web_dark.min.css`.
- **RED before the override:** the guard failed with `web.assets_web_dark was not requested` and exit
  1, while C01's colour assertions stayed green — so the new assertion is specific to this task and
  did not pass by accident.
- **All four cookie branches behave as designed** (`curl -b "color_scheme=…" /odoo`, counting
  `assets_web_dark` references):

  | cookie | dark bundle | |
  |---|---|---|
  | absent | **1** | default is dark ✅ |
  | `light` | **0** | the opt-out genuinely switches the bundle ✅ |
  | `dark` | **1** | explicit dark ✅ |
  | `chartreuse` | **1** | unrecognised value fails safe to dark, not light ✅ |

- With ACC-C03 applied the UI is visibly dark on first load (no toggle needed) — **ACC-C03's job**;
  today the surfaces are already dark from C01, but the dark bundle's component overrides are not yet
  written.

## Done when

- [x] override committed in acczed_theme
- [x] dark bundle confirmed — asserted in the guard rather than by eye in a Network tab
- [x] cookie opt-out verified in all four branches (the reason this task is shaped this way)

## Risks / notes

- ⚠️ **Until ACC-C04 lands, nothing writes the cookie**, so the light branch is unreachable in normal
  use. That is the intended default, not a gap — but it does mean the `light` branch is currently
  exercised only by the curl check above. C04 is what makes it reachable by a user.
- **A stale or corrupted cookie fails safe.** Only the exact string `light` opts out; any other value
  is dark, so a bad cookie cannot silently drop someone back to a light backend.
- **`if request` is deliberate.** This method is reachable outside a request context (cron, CLI) where
  the proxy is falsey — the same idiom the fork uses at `ir_actions.py:495`. A bare
  `request.cookies` would raise there.

---
← Phase C index: [../README.md](../README.md)
