# ACC-D04 — Brand outgoing mail and notifications

| Field | Value |
|---|---|
| **Phase** | D — Branding (title, favicon, login, company, mail) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-D03 |
| **Estimated** | 2 hrs |
| **Touches** | `acczed_theme/views/brand_templates.xml` |

## Goal

Mail is the surface customers forward to their own clients; an Odoo-branded footer there undoes the whole identity.

## Context (verified)

- Notification layout lives in the `mail` module templates (`mail.mail_notification_layout`); the mail module is installed in `acczed`.

## Steps

- [ ] **1. Inherit the notification layout**
  ```bash
  # sender name, header logo, button colour from the token layer
  # footer: acczed instead of Odoo
  ```
  → expected: template inherits
- [ ] **2. Set the outgoing sender identity**
  ```bash
  # Settings -> Technical -> Outgoing mail servers: alias/from name = acczed
  # or set the company alias on res.company
  ```
  → expected: From shows acczed
- [ ] **3. Send a test**
  ```bash
  # send a test notification and inspect the rendered HTML + From header
  ```
  → expected: no Odoo branding, colour matches the theme

## Verification

- Test mail shows the acczed logo, colour and footer.
- `From` header carries the acczed name.
- Links inside the mail resolve to the production domain.

## Done when

- [ ] mail templates branded
- [ ] test mail inspected

---
← Phase D index: [../README.md](../README.md)
