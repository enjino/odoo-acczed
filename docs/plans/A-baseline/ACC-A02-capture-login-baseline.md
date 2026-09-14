# ACC-A02 — Capture the login page baseline (text + screenshot)

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`) |
| **Depends on** | ACC-A01 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/evidence/` only |

## Goal

Record exactly what a visitor sees on the login page today, so ACC-D02 can be verified against it.

## Context (verified)

- The login layout is `web.login_layout` in `addons/web/views/webclient_templates.xml:110-134`.
- It hardcodes the company logo (`:121`), a "Manage Databases" link (`:126`) and a "Powered by Odoo" link to odoo.com (`:128`).
- The document title defaults to `Odoo` and the icon to `/web/static/img/favicon.ico` (`:22-23`).

## Steps

- [x] **1. Capture the text markers**
  ```bash
  # NOTE: the task text's unqualified URL 303s to the database selector (see ACC-A01).
  # Use ?db=acczed with a cookie jar, or -L does not settle on the login page.
  U="http://localhost:8069/web/login?db=acczed"
  curl -sL -c /tmp/cj -b /tmp/cj "$U" | grep -o "<title>[^<]*</title>"
  curl -sL -c /tmp/cj -b /tmp/cj "$U" | grep -c "odoo.com"
  curl -sL -c /tmp/cj -b /tmp/cj "$U" | grep -o 'rel="shortcut icon"[^>]*' | head -1
  ```
  → expected: <title>Odoo</title>, odoo.com count > 0, favicon.ico present
  → **actual, all three match:** `<title>Odoo</title>`; `odoo.com` count **1**; favicon
  `rel="shortcut icon" href="/web/static/img/favicon.ico"`. "Manage Databases" is also present.
- [x] **2. Capture the screenshot**
  ```bash
  # google-chrome --headless --screenshot does NOT work here: the form is `.oe_login_form.d-none`
  # and is revealed by <owl-component name="web.user_switch">. Wait for it to become visible.
  NODE_PATH=~/.hermes/hermes-agent/node_modules node /tmp/shot.js \
    "http://localhost:8069/web/login?db=acczed" \
    docs/plans/evidence/before-login.png ".oe_login_form:not(.d-none)"
  ```
  → expected: file exists, full page, default purple UI → **actual:** `before-login.png`, 1600x1000,
  full page. Purple `#71639e` accent confirmed (baseline fact #2).
- [x] **3. Log the evidence** → appended to `docs/plans/evidence/evidence.log`.

## Verification

- `docs/plans/evidence/before-login.png` exists. ✅ 35212 bytes, 1600x1000 PNG.
- `grep -c odoo.com` result is recorded in `evidence.log` (expected > 0 today). ✅ **1**
- Title and favicon values are recorded verbatim. ✅ `<title>Odoo</title>`, `/web/static/img/favicon.ico`

## What the baseline actually shows

Logo placeholder "Your logo" · Database field pinned to `acczed` + Select button · Email · Password
(with "Reset Password") · purple **Log in** button · "Don't have an account?" · "Use a Passkey" ·
footer "Manage Databases | Powered by Odoo". Company logo is still Odoo's stock placeholder — the
company record is untouched (baseline fact #11: company still `YourCompany`).

## Done when

- [x] evidence/before-login.png saved
- [x] evidence/evidence.log contains the three command outputs

## Risks / notes

- ⚠️ **Screenshot capture needs a waiting browser driver.** There is no browser tooling configured in
  this repo, and `--headless --screenshot` silently produces a *blank login card* (the form is
  `d-none` until OWL runs). Any screenshot step must assert the expected content is visible before
  saving, or it records nothing. A durable home for this helper belongs in Phase B (scaffolding), not
  here — Phase A is evidence-only.
- The Database field being pinned to `acczed` is a **local-config artefact** (`?db=acczed` in the URL),
  not something production shows. Do not treat it as part of the branding to remove in ACC-D02.

---
← Phase A index: [../README.md](../README.md)
