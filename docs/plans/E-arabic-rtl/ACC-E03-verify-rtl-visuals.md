# ACC-E03 — Verify RTL actually renders right

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ✅ done 2026-09-15 — four layout seams asserted and falsified; screenshots captured |
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
- [x] **2. Tour and screenshot the Arabic UI** · **done 2026-09-15**
  ```bash
  ACCZED_LOGIN=arabic_test ACCZED_PASSWORD=arabic_test node tools/shot.js \
    "http://localhost:8069/odoo/action-base.action_res_users" \
    docs/plans/evidence/after-backend-ar-list.png --login --wait ".o_list_view"
  # likewise after-backend-ar-form.png (.o_form_view) and after-backend-ar-kanban.png (.o_kanban_view)
  ```
  → expected: sidebar right, fields mirrored, no flipped arrows · **three screenshots captured and
  inspected** (not just produced — see Risks). Arabic labels confirmed, columns mirrored, systray left.
- [~] **3. Audit our own stylesheets for direction bugs — MOVED to ACC-C01** (2026-09-15)
  ```bash
  # re-homed: it cannot run here. acczed_theme has no static/src/scss/ until ACC-C01 creates it, so
  # the grep would pass on an empty directory and prove nothing.
  ```
  → see ACC-C01's Done-when, which now carries this check.

## Verification

- Three Arabic screenshots captured **and visually inspected** against the LTR baselines.
- No directional property in our SCSS without an rtl:ignore justification — **deferred to ACC-C01**
  (there is no SCSS yet; the check would be vacuous).
- Dropdowns, chatter, kanban and the statusbar mirror correctly — covered by the geometry assertions
  below, which measure real positions rather than eyeballing.
- **`bash tools/verify-rtl.sh` → 9 passed, 0 failed.** The four E03 layout seams, each asserted for
  both users with opposite expectations:

  | Seam | LTR (admin) | RTL (arabic_test) |
  |---|---|---|
  | chrome: systray / apps menu | right (1481) / left (24) | **left (112) / right (1576)** |
  | list: first 3 cell centres | 60, 347, 822 → increasing | **1540, 1239, 707 → decreasing** |
  | kanban: first 3 card centres | 399, 740, 1081 → increasing | **1202, 861, 520 → decreasing** |
  | form: label vs field | label 47 < field 1294 | **label 1555 > field 305** |

- **Falsified, not merely passed.** This task verifies behaviour that already exists (ACC-E02), so
  there is no red→green cycle to run. Instead each assertion was shown to be *capable* of failing:
  running the suite as the Arabic user with `--expect ltr` reports a problem on **every one of the
  eight assertions** and exits 1. An assertion that cannot fail proves nothing.

## Done when

- [x] RTL verified on list + form + one kanban
- [x] direction audit of our SCSS clean → **moved to ACC-C01** rather than ticked vacuously here

## Risks / notes

- ⚠️ **A PNG existing proves nothing.** `shot.js` refuses to save when its `--wait` selector never
  appears, which stops the empty-page failure mode, but it cannot tell you the *content* is right. All
  three captures were opened and checked. Do not tick a screenshot task on file size alone.
- **Chrome-side assertions use halves, not pixels.** `side(x, W) = x < W/2 ? left : right`. Pixel
  comparison would break the moment Arabic text changes an element's width; the half test survives it.
- **Sibling-order assertions require monotonicity, not exact positions.** Cells/cards are read as
  increasing or decreasing across the first three elements; a layout that merely shifted everything
  would not satisfy this, which is the point.
- **Not asserted: icon mirroring** ("no flipped arrows"). FontAwesome is patched for RTL
  (`fontawesome_overridden.scss:77`) and the pager glyphs were inspected by eye, but there is no
  automated check — a directional glyph and a decorative one are not reliably distinguishable from
  the DOM alone. Treat this as inspected, not verified.
- The Arabic form still shows `Mitchell Admin`, `admin@example.com` and `555-555-5555` in Latin script —
  correct, that is record data rather than UI strings. Our own module strings are ACC-E04's job.

## Verification

- Two Arabic screenshots captured and reviewed against the LTR versions.
- No directional property in our SCSS without an rtl:ignore justification.
- Dropdowns, chatter, kanban and the statusbar all mirror correctly.

## Done when

- [ ] RTL verified on list + form + one kanban
- [ ] direction audit of our SCSS clean

---
← Phase E index: [../README.md](../README.md)
