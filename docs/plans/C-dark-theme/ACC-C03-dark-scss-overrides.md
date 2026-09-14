# ACC-C03 — Style what variables cannot reach

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
| **Depends on** | ACC-C02 |
| **Estimated** | 1–2 days |
| **Touches** | `acczed-addons/acczed_theme/static/src/scss/acczed.dark.scss` (new), `__manifest__.py` |

## Goal

Cover the surfaces the variable layer misses (chatter, kanban, tables, dropdowns, modals, statusbar, systray, calendar) and publish an explicit list of what is NOT covered yet.

## Context (verified)

- Community ships dark styling for only 3 files: calendar_renderer.dark.scss, emoji_picker.dark.scss, file_viewer.dark.scss — the full dark theme lives in the non-existent `web_enterprise`.
- The dark bundle is `web.assets_web_dark` = `include web.assets_web` + `web/static/src/**/*.dark.scss` (`addons/web/__manifest__.py:346-349`); that glob is scoped to `web`, so our files must be listed explicitly.

## Steps

- [ ] **1. Register the file in the dark bundle**
  ```bash
  'web.assets_web_dark': ['acczed_theme/static/src/scss/acczed.dark.scss'],
  ```
  → expected: manifest parses
- [ ] **2. Style component by component following the community pattern**
  ```bash
  # reference: addons/web/static/src/core/emoji_picker/emoji_picker.dark.scss
  # chatter, kanban, list, form sheet, dropdown, modal, statusbar, systray, calendar
  ```
  → expected: each block targets a named component
- [ ] **3. Enforce the RTL rule while writing**
  ```bash
  # no hardcoded left/right - logical properties or /*rtl:ignore*/ (see bootstrap_review.scss:80,87)
  ```
  → expected: no `left:` / `right:` except rtl:ignore cases

## Verification

- Five screens toured with before/after screenshots: Contacts, Sales, Settings, Discuss, a List view.
- No flash of light theme on first paint.
- The uncovered list is written in this file (do not claim "fully dark").

## Done when

- [ ] acczed.dark.scss registered and loaded
- [ ] 5 before/after screenshot pairs in evidence/
- [ ] explicit gap list published in this task file

## Risks / notes

- This is the largest single item of the whole plan — sequence it after ACC-E03 so the tour is done in Arabic too.
- Asset caching: after SCSS edits use `-u acczed_theme` or run with `--dev=assets`, otherwise stale CSS confuses the review.

---
← Phase C index: [../README.md](../README.md)
