# ACC-D02 — Rebrand the login page

| Field | Value |
|---|---|
| **Phase** | D — Branding (title, favicon, login, company, mail) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-D01 |
| **Estimated** | 2 hrs |
| **Touches** | `acczed_theme/views/brand_templates.xml` |

## Goal

The login page is the first thing a customer sees after clicking "Sign in" on the site; it must look like the same product.

## Context (verified)

- `web.login_layout` (`addons/web/views/webclient_templates.xml:110-134`) renders the company logo (`:121`), a "Manage Databases" link (`:126`) and a "Powered by Odoo" link to odoo.com (`:128`).
- Site CTA/button styling reference: `acczed-site/app/globals.css:93-112`.

## Steps

- [ ] **1. Replace the logo block**
  ```bash
  <xpath expr="//img[contains(@src,'company_logo')]" position="replace">
    <img src="/acczed_theme/static/src/img/logo.svg" alt="acczed"/>
  </xpath>
  ```
  → expected: logo renders on the login card
- [ ] **2. Hide the database manager link in production**
  ```bash
  # hide when 'list_db' is disabled (production uses list_db=False)
  # keep it visible locally for developer convenience
  ```
  → expected: no 'Manage Databases' on production login
- [ ] **3. Replace or remove 'Powered by Odoo'**
  ```bash
  # decision from ACC-A07; if kept, link to an About page instead of odoo.com
  ```
  → expected: grep for odoo.com on the login page returns 0
- [ ] **4. Restyle the card to the site language**
  ```bash
  # dark card, 14px radius, green primary button - reuse the ACC-C01 variables
  ```
  → expected: visually consistent with app.acczed.online

## Verification

- `curl -s http://localhost:8069/web/login | grep -c "odoo.com"` = 0.
- `grep -c "Manage Databases"` = 0 on production.
- Screenshot `after-login.png` compared side by side with `before-login.png`.

## Done when

- [ ] login page rebranded locally and on production
- [ ] before/after pair stored
- [ ] no odoo.com reference on the login page

## Risks / notes

- Keep a discreet "built on Odoo" mention on an About page rather than erasing the upstream project entirely.

---
← Phase D index: [../README.md](../README.md)
