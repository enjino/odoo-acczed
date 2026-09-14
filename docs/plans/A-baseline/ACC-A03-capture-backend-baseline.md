# ACC-A03 — Capture the backend baseline (home + list screens)

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`) |
| **Depends on** | ACC-A01 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/evidence/` only |

## Goal

Freeze the current community look (light theme, purple accents) as the reference ACC-C03 will be judged against.

## Context (verified)

- The default community accent is `$o-community-color: #71639e` (`addons/web/static/src/scss/primary_variables.scss:73`), which feeds `$o-brand-primary` and `$o-action` (`:77-83`).
- `$o-webclient-background-color` is `$o-gray-100` (`addons/web/static/src/scss/secondary_variables.scss:1`) and `$o-view-background-color` is white (`primary_variables.scss:136`).

## Steps

- [x] **1. Log in to http://localhost:8069 as admin and screenshot the apps/home screen**
  ```bash
  # login gate: .oe_login_form:not(.d-none)  (see ACC-A02); credential admin/admin
  # home screen URL in Odoo 19 is /odoo/apps  (the old /web#home no longer applies)
  ```
  → expected: light UI, purple primary buttons
  → **actual:** `docs/plans/evidence/before-backend-home.png`, 1600x1000, full page, 60 app cards,
  counter "1-54 / 54". Light UI, purple navbar and buttons. ✅
- [x] **2. Open any list view (e.g. Settings → Users) and screenshot**
  ```bash
  # /odoo/action-base.action_res_users
  ```
  → expected: light UI, standard Odoo list
  → **actual:** `docs/plans/evidence/before-backend-list.png`, 1600x1000, full page, 2 rows
  (Marc Demo/demo/User, Mitchell Admin/admin/Administrator). ✅
- [x] **3. Record the rendered accent colour**
  ```bash
  # read via getComputedStyle on a real .btn-primary, rather than eyeballing devtools
  ```
  → expected: #71639e
  → **actual: rgb(113, 99, 158) = #71639e** — exact match. Webclient ground is
  `rgb(248, 249, 250)` = `#f8f9fa` (= `$o-gray-100`).

## Verification

- Both screenshots exist with the `before-` prefix. ✅
- The rendered accent hex is written in `evidence.log`. ✅ `#71639e`
- `git status` in the repo shows no modification from this task. ✅ (evidence/ additions only)

## Done when

- [x] evidence/before-backend-home.png saved
- [x] evidence/before-backend-list.png saved
- [x] accent hex recorded

## Risks / notes

- **"Home" = `/odoo/apps`.** Odoo 19 has no `#home`; the app grid is the backend home and is the right
  thing to diff against for the theme work. The post-login landing page is `/odoo/discuss` instead —
  do not mistake that for the home screen.
- **Never use `waitUntil: 'networkidle'`** for authenticated Odoo pages: the webclient keeps the
  bus/longpolling connection open, so it never settles and the capture hangs. Use `domcontentloaded`
  plus an explicit `waitForSelector` on the view you expect.
- **The apps grid is not "installed apps".** It lists everything known to the module index, including
  apps that are enterprise-gated in Community (their cards show **Upgrade** rather than Activate).
  Baseline fact #11's "41 installed / 613 uninstalled" is the authoritative count — the 54 here is a
  different, UI-level number. Do not quote this screenshot as an app count (ACC-A06 / ACC-F04).

---
← Phase A index: [../README.md](../README.md)
