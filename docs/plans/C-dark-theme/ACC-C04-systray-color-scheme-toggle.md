# ACC-C04 — Add the colour-scheme toggle in the systray

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
| **Depends on** | ACC-C02 |
| **Estimated** | 4 hrs |
| **Touches** | `acczed-addons/acczed_theme/static/src/js/color_scheme_toggle.js` (new), `web.assets_web` |

## Goal

Community has no way to switch schemes; users need a reversible switch next to the ones they already expect.

## Context (verified)

- Verified: no component in community writes the `color_scheme` cookie; consumers only read it (e.g. `addons/web/static/src/core/color_picker/color_picker.js:124`, `views/view.js:349`).
- The server reads its own preference independently, so the toggle must persist to both the cookie and (if enabled) the user preference.

## Steps

- [ ] **1. Register an OWL component in the systray**
  ```bash
  registry.category('systray').add('acczed.color_scheme_toggle', {...})
  ```
  → expected: icon appears in the systray
- [ ] **2. Write the cookie and reload**
  ```bash
  cookie.set('color_scheme', next);   // 'dark' | 'light'
  window.location.reload();
  ```
  → expected: page reloads in the chosen scheme
- [ ] **3. Keep server and client consistent**
  ```bash
  # if 'follow user preference' wins in ACC-A07, also store the value on res.users
  # and read it in ir_http.color_scheme()
  ```
  → expected: no mismatch between cookie and server choice

## Verification

- Toggling dark → light → dark works without a logout.
- PDF/report previews stay light.
- Portal pages are unaffected.

## Done when

- [ ] toggle in systray
- [ ] dark/light/dark round-trip verified with screenshots

---
← Phase C index: [../README.md](../README.md)
