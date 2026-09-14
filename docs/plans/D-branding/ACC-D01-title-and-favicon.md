# ACC-D01 — Set the document title and favicon to acczed

| Field | Value |
|---|---|
| **Phase** | D — Branding (title, favicon, login, company, mail) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B05 |
| **Estimated** | 30 min |
| **Touches** | `acczed_theme/views/brand_templates.xml` |

## Goal

Remove the two most visible Odoo brands: the browser tab title and the tab icon.

## Context (verified)

- `web.layout` hardcodes the fallback title `title or 'Odoo'` (`addons/web/views/webclient_templates.xml:22`) and the icon `/web/static/img/favicon.ico` (`:23`).

## Steps

- [ ] **1. Inherit web.layout and replace title + icon**
  ```bash
  <xpath expr="//title" position="replace"><title>acczed</title></xpath>
  <xpath expr="//link[@rel='shortcut icon']" position="replace">
    <link rel="shortcut icon" t-att-href="'/acczed_theme/static/src/img/favicon.png'"/>
  </xpath>
  ```
  → expected: view inherits cleanly
- [ ] **2. Add the icon asset**
  ```bash
  acczed_theme/static/src/img/favicon.png   # from the acczed logo (see ACC-A07 for the logo decision)
  ```
  → expected: file exists
- [ ] **3. Update and verify**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed -u acczed_theme --stop-after-init
  curl -s http://localhost:8069/web/login | grep -o "<title>[^<]*</title>"
  ```
  → expected: <title>acczed</title>

## Verification

- `curl` reports `<title>acczed</title>` on /web/login.
- The favicon request returns 200 and is not the Odoo icon.
- Title is also correct after login (backend pages).

## Done when

- [ ] title replaced and verified with curl
- [ ] favicon served from the module

---
← Phase D index: [../README.md](../README.md)
