# ACC-D03 — Set the company record and the base URL

| Field | Value |
|---|---|
| **Phase** | D — Branding (title, favicon, login, company, mail) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B05 |
| **Estimated** | 30 min |
| **Touches** | DB `acczed` (res.company, ir.config_parameter) |

## Goal

Kill the last defaults: the company is literally called `YourCompany` and the base URL is still localhost, which leaks into mails and links.

## Context (verified)

- Verified locally: `res_company.name = YourCompany`; `web.base.url = http://localhost:8069`; production has its own values to be aligned.

## Steps

- [ ] **1. Update the company record**
  ```bash
  # Settings -> Companies -> update: name, logo, address, VAT, currency
  # or: docker exec odoo-postgres psql -U odoo -d acczed -tAc "select id,name from res_company;"  # then update via UI
  ```
  → expected: name = acczed
- [ ] **2. Set and freeze the base URL on production**
  ```bash
  # ir.config_parameter: web.base.url = https://backend.acczed.online
  # web.base.url.freeze = True   (stops the cron from overwriting it)
  ```
  → expected: links in mails point at the domain
- [ ] **3. Verify**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select name from res_company;"
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select key,value from ir_config_parameter where key like 'web.base.url%';"
  ```
  → expected: acczed + the production domain

## Verification

- Company name = acczed in local and production.
- `web.base.url` = the public domain on production, with `.freeze` set.
- Logo appears in reports/invoices headers (screenshot).

## Done when

- [ ] company identity set
- [ ] base url frozen on production
- [ ] report header screenshot saved

---
← Phase D index: [../README.md](../README.md)
