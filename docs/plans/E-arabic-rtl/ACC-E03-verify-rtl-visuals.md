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

- [ ] **1. Check the document root**  ⚠️ *corrected 2026-09-15 — the original expectation was wrong*
  ```bash
  # Backend webclient: o_rtl lands on <body>, added by JS after mount. <html> has NO dir attribute.
  node tools/rtl-browser-check.js --expect rtl     # asserts exactly this, plus the portal
  ```
  → expected: backend `body.o_rtl=true` **and `<html dir>` = null**; portal `<html dir="rtl">` and
  `#wrapwrap.o_rtl`. Measured 2026-09-15 on a confirmed-working install:
  `backend dir=null body.o_rtl=true | portal dir=rtl #wrapwrap.o_rtl=true`

> ⚠️ **Two corrections to what this task originally said.** (1) `<html>` never carries `dir` in the
> backend webclient — `webclient_templates.xml:18` is `<html t-att="html_data or {}">` and every
> `html_data` in that file sets only `style`. Checking for `<html dir="rtl">` there fails on a
> perfectly good RTL install. The portal *does* set it, via `portal_templates.xml:5`. (2) `o_rtl` is
> added **client-side** to `document.body` (`start.js:46`), so it is in no server response — it cannot
> be curl'd or grepped, only observed in a browser.

> ℹ️ **The portal's `<html dir>` is not curl-checkable either**, despite being server-rendered: it
> comes from `request.env.lang`, and a curl session that never runs the webclient's `session_info` RPC
> keeps a stale `en_US` context. Measured: curl reported `dir=ltr` for the same user a real browser
> rendered as `dir=rtl`. Use the browser.
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

  > ⚠️ **This passes vacuously today.** `acczed_theme` has no `static/` directory yet (it holds only
  > `__manifest__.py`, `__init__.py`, `models/`, `views/`), and `static/src/scss/` is created by
  > **ACC-C01**. Until C01 has run there is nothing to audit and a green result means nothing. Run this
  > check after C01/C03, not before.

## Verification

- Two Arabic screenshots captured and reviewed against the LTR versions.
- No directional property in our SCSS without an rtl:ignore justification.
- Dropdowns, chatter, kanban and the statusbar all mirror correctly.

## Done when

- [ ] RTL verified on list + form + one kanban
- [ ] direction audit of our SCSS clean

---
← Phase E index: [../README.md](../README.md)
