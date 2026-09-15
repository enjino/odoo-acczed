# ACC-C03 — Style what variables cannot reach

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | 🚧 wave 1 of 3 done 2026-09-15 (chrome/nav) — **awaiting review before wave 2**. Not complete: `acczed.dark.scss` does not exist yet because wave 1 found its targets were all variable-reachable. |
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

## Wave 1 — chrome / nav (done 2026-09-15, awaiting review)

Planned as 2–3 reviewable waves (agreed in the phase-C upfront round). Wave 1 covered the chrome: the
control panel, the list table and the navbar.

**All three targets turned out to be variable-reachable**, so none of them went into
`acczed.dark.scss` — which is why that file still does not exist. C03's brief is *"style what variables
cannot reach"*, and putting a variable fix there would have mislabelled it. Both fixes went into
`_acczed_variables.scss` instead:

| artifact | measured | fixed by |
|---|---|---|
| list row + table borders | `rgb(222,226,230)` | `$border-color` (`bootstrap_overridden.scss:97`) |
| control panel bottom border | `rgb(222,226,230)` | `$o-control-panel-border-bottom` |

**They are two different variables, which is the point.** `$border-color` fixed the list immediately;
the control panel stayed light because it does not use it — it hardcodes the grey ramp step
(`control_panel.variables.scss:2`: `1px solid $o-gray-300`). Setting only `$border-color` would have
looked like a partial success and been easy to stop at.

After both: **no light surface remains in the chrome** — verified by a probe that flags any computed
colour above brightness 190 across the navbar, control panel, search view, breadcrumb, pager and list
table, then locked into `tools/theme-check.js` as two more assertions (guard now **10/10**).

### Open question for wave 2: the `$o-gray-300` ramp

`$o-gray-300` is Bootstrap's `#dee2e6` and is almost certainly behind the remaining artifacts in
kanban, chatter, dropdowns and modals. Redefining the ramp itself is the tempting one-liner and is
**deliberately not done here**: it is used well beyond borders (muted text, disabled states), and
inverting it wholesale is a decision to make against a rendered page rather than blind. If wave 2 keeps
hitting `$o-gray-300` component by component, the ramp is probably the right single lever and that
choice should be made explicitly.

## Risks / notes

- This is the largest single item of the whole plan — sequence it after ACC-E03 so the tour is done in Arabic too.
- Asset caching: after SCSS edits use `-u acczed_theme` or run with `--dev=assets`, otherwise stale CSS confuses the review.

---
← Phase C index: [../README.md](../README.md)
