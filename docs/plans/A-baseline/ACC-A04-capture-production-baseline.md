# ACC-A04 — Capture the production baseline (backend.acczed.online)

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`) |
| **Depends on** | ACC-A01 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/evidence/` only |

## Goal

Record what the marketing site's "Sign in" button actually leads to, since the site sells a product experience the backend does not ship yet.

## Context (verified)

- The site links to `https://backend.acczed.online` (`acczed-site/app/page.tsx:142`).
- Production runs the same fork behind Caddy with a Let's Encrypt certificate (droplet `odoo-acczed`, DB `acczed`).

## Steps

- [x] **1. Capture status and title**
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://backend.acczed.online/web/login
  curl -s https://backend.acczed.online/web/login | grep -o "<title>[^<]*</title>"
  ```
  → expected: 200 and <title>Odoo</title>
  → **actual: both exactly as expected.** HTTP 200 on the *unqualified* URL, `<title>Odoo</title>`.
  Headers: `server: Werkzeug/3.0.1 Python/3.12.3`, `via: 1.1 Caddy`, `alt-svc: h3`, CSP
  `frame-ancestors 'self'`. Note the *unqualified* URL works here but 303s locally — production has a
  database configured (see ACC-A01).
- [x] **2. Screenshot the production login page**
  ```bash
  NODE_PATH=~/.hermes/hermes-agent/node_modules node /tmp/shot.js \
    "https://backend.acczed.online/web/login" \
    docs/plans/evidence/before-login-prod.png ".oe_login_form:not(.d-none)"
  ```
  → expected: file exists → **actual:** `before-login-prod.png`, 1600x1000, full page. ✅
- [x] **3. Record the effective web.base.url**
  ```bash
  # on the droplet (read-only SELECTs):
  ssh odoo-acczed "docker exec odoo-postgres psql -U odoo -d acczed -tAc \"select value from ir_config_parameter where key='web.base.url';\""
  ssh odoo-acczed "docker exec odoo-postgres psql -U odoo -d acczed -tAc \"select id, name from res_company;\""
  ```
  → expected: base url = https://backend.acczed.online, company name recorded
  → **actual:** `https://backend.acczed.online` (exact match) and `1|YourCompany`.
  So the base URL is **already correct in production** (D03's base-URL half is a no-op there; only the
  local instance differs), but the company name is still the stock **`YourCompany`** — D03's rename is
  outstanding in *both* environments.

## Verification

- Production login screenshot and title recorded. ✅
- `res_company.name` on production recorded (needed for ACC-D03). ✅ `YourCompany`

## Done when

- [x] evidence/before-login-prod.png saved
- [x] production title + company name in evidence.log — `<title>Odoo</title>`, `YourCompany`

## Risks / notes

- ⚠️ **Production reads need explicit consent.** Step 3 was initially refused by the permission layer;
  it ran only after the user approved it. The droplet is reachable (`~/.ssh/config` → `odoo-acczed`,
  46.101.146.87, root). Any future production query should be requested, not assumed — and kept
  read-only, since Phase A must not modify either environment.
- If the droplet is down, record that as a baseline fact instead of skipping the task. It is **up**.
- **Production and local differ on the login page**, which matters for ACC-D02's acceptance gate:
  production shows no Database field and no "Manage Databases" link (it runs with `list_db` off).
  D02's "no Manage Databases" criterion is therefore *already satisfied in production* and only fails
  locally. Verify D02 against the local instance, not against production, or the gate will look
  pre-passed. Still present in both: "Your logo" placeholder and "Powered by Odoo" → odoo.com.

---
← Phase A index: [../README.md](../README.md)
