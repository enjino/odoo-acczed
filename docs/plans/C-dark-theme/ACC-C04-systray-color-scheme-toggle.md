# ACC-C04 — Add the colour-scheme toggle in the systray

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ✅ done 2026-09-15 — toggle in the systray, round-trip verified against the served bundle |
| **Depends on** | ACC-C02 |
| **Estimated** | 4 hrs |
| **Touches** | `acczed-addons/acczed_theme/static/src/js/color_scheme_toggle.js` (new), `web.assets_web` |

## Goal

Community has no way to switch schemes; users need a reversible switch next to the ones they already expect.

## Context (verified)

- Verified: no component in community writes the `color_scheme` cookie; consumers only read it (e.g. `addons/web/static/src/core/color_picker/color_picker.js:124`, `views/view.js:349`).
- The server reads its own preference independently, so the toggle must persist to both the cookie and (if enabled) the user preference.

## Steps

- [x] **1. Register an OWL component in the systray** · **done** —
      `static/src/js/color_scheme_toggle.js` + `static/src/xml/color_scheme_toggle.xml`
  ```js
  registry.category("systray").add("acczed.color_scheme_toggle", { Component: ColorSchemeToggle }, { sequence: 50 });
  ```
- [x] **2. Write the cookie and reload** · **done**
  ```js
  cookie.set("color_scheme", this.isDark ? "light" : "dark");
  window.location.reload();
  ```
- [x] **3. Keep server and client consistent** · **already satisfied, differently than written**

  The step said "if 'follow user preference' wins in ACC-A07, also store the value on `res.users`".
  It did not win — decision 2 chose *always dark with this toggle as the opt-out*. So there is no
  `res.users` field to write, and consistency comes from the cookie instead: **ACC-C02's
  `color_scheme()` reads exactly the cookie this writes.** Server and client agree because they share
  one source, not because they are kept in sync.

  This is why the reload is not a convenience. The bundle is chosen server-side, so the cookie has to
  reach the server before the right stylesheet can be served. Swapping the stylesheet in the client
  would avoid the reload but leave the server's view stale and flash the wrong theme on the next
  navigation.

## Verification

- **Toggling dark → light → dark works**, asserted end to end by `tools/theme-check.js`:
  ```
  ok   toggle round-trip        dark -> light -> dark
  ```
  The guard clicks the control, waits for the reload, and reads **which bundle the browser actually
  received** — not the cookie. A toggle that wrote the cookie and changed nothing would pass a
  cookie-based check and fail this one.
- **RED before the component:** `no .o_acczed_scheme_toggle found in the systray`, exit 1, with all
  seven pre-existing assertions still green — so the new assertion is specific to this task.
- **Guard now 8/8**; `bash tools/verify-rtl.sh` 11 passed, 0 failed.
- PDF/report previews stay light — **ACC-E05's work, and unaffected**: reports are a separate bundle
  (`web.report_assets_common`) and `color_scheme` is not consulted for them (`ir_actions.py:495` and
  `ir_ui_view.py:2715` read the cookie only for code-diff rendering).
- Portal pages are unaffected — the portal's `<html dir>`/theming comes from the frontend bundle,
  which this does not touch.

## Done when

- [x] toggle in systray
- [x] dark/light/dark round-trip verified — asserted in the guard rather than by screenshots, which
      is stronger: screenshots would show it *looked* different, the guard proves the *served bundle*
      changed. Arabic screenshots for phase C remain ACC-C03's and ACC-C05's deliverable.

## First strings in the module (consequence)

The toggle's `title`/`aria-label` are the **first user-visible strings `acczed_theme` authors**, so
CONVENTIONS §8's Arabic check now has something to apply to. They are wrapped in `_t()` and translated
in `acczed_theme/i18n/ar.po`. Doing so **exposed a defect in the ACC-E04 check** — it could never see a
code-string translation, because `odoo-bin i18n export` reads a database cursor and Odoo serves JS
strings from the `.po` file at runtime. Fixed in `tools/i18n-coverage.py`; see ACC-E04's Correction.

## Risks / notes

- **The control is unstyled.** `o_acczed_scheme_toggle` is currently little more than an icon in the
  navbar; making it look like the rest of the systray is ACC-C03/C05's work. The class name is also
  the selector `tools/theme-check.js` uses — renaming it breaks that guard.
- **Until this task, nothing wrote the cookie**, so C02's light branch was unreachable in normal use.
  It is now reachable, and the round-trip proves it.
- **The icon is FontAwesome** (`fa-sun-o` / `fa-moon-o`), matching the FA 4.7 Odoo ships. Note ACC-E03
  recorded icon mirroring as *inspected, not verified* — these are non-directional, so RTL is not a
  concern here, but the phase-C tour should still eyeball them under `ar_001`.

---
← Phase C index: [../README.md](../README.md)
