# ACC-E03 — Verify RTL actually renders right

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ⏳ not started |
| **Depends on** | ACC-E02 |
| **Estimated** | 2 hrs |
| **Touches** | `docs/plans/evidence/` |

## Goal

An Arabic interface is not finished when the words change — it is finished when the layout mirrors correctly and nothing is upside down.

## Context (verified)

- The webclient adds the `o_rtl` class at startup based on the user's direction (`addons/web/static/src/start.js:46`; also `main_components_container.js:18`) and FontAwesome is patched for it (`addons/web/static/scss/fontawesome_overridden.scss:77`).
- Odoo compiles RTL CSS with rtlcss directives: `/*rtl:ignore*/`, `/* rtl:raw:` (see `addons/web/static/src/scss/bootstrap_review.scss:80,87`, `ui.scss:125,129`).
- Binding rule for every stylesheet we write (ACC-B02 rule 6): no hardcoded left/right.

## Steps

- [ ] **1. Check the document root**
  ```bash
  # devtools: <html dir="rtl"> and .o_rtl present on the webclient root
  ```
  → expected: dir=rtl + o_rtl
- [ ] **2. Tour and screenshot the Arabic UI**
  ```bash
  docs/plans/evidence/after-backend-ar-list.png
  docs/plans/evidence/after-backend-ar-form.png
  ```
  → expected: sidebar right, fields mirrored, no flipped arrows
- [ ] **3. Audit our own stylesheets for direction bugs**
  ```bash
  cd ~/Desktop/Projects/acczed-addons && grep -rn "left:\|right:\|margin-left\|margin-right\|padding-left\|padding-right" acczed_theme/static/src/scss/ | grep -v "rtl:ignore"
  ```
  → expected: no hits outside rtl:ignore cases

## Verification

- Two Arabic screenshots captured and reviewed against the LTR versions.
- No directional property in our SCSS without an rtl:ignore justification.
- Dropdowns, chatter, kanban and the statusbar all mirror correctly.

## Done when

- [ ] RTL verified on list + form + one kanban
- [ ] direction audit of our SCSS clean

---
← Phase E index: [../README.md](../README.md)
