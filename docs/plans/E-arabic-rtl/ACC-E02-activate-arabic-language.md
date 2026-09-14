# ACC-E02 — Activate Arabic (ar_001)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ⏳ not started |
| **Depends on** | ACC-E01 |
| **Estimated** | 15 min |
| **Touches** | DB `acczed` (res.lang) |

## Goal

Two of the site's `live` badges depend on this: "Arabic, right to left" and "2 languages, both directions".

## Context (verified)

- Direction is data-driven: `res.lang.direction` = ltr/rtl (`odoo/addons/base/models/res_lang.py:77`).
- Verified today: only `en_US` is active, and `admin` is an `en_US` user.

## Steps

- [ ] **1. Activate the language**
  ```bash
  # UI: Settings -> Translations -> Languages -> activate Arabic (Saudi Arabia)
  # or shell:
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin shell -c odoo.conf -d acczed
  ```
  → expected: ar_001 active
- [ ] **2. In the shell, persist it**
  ```bash
  >>> env['res.lang']._activate_lang('ar_001')
  >>> env.cr.commit()
  ```
  → expected: no error
- [ ] **3. Switch one user to Arabic**
  ```bash
  # set admin (or a dedicated arabic test user) language to ar_001 in Preferences
  ```
  → expected: interface renders Arabic

## Verification

- `select code,active from res_lang where code like 'ar%'` shows ar_001 active.
- Logging in as the Arabic user renders Arabic labels.
- No missing-translation fallback noise on core screens.

## Done when

- [ ] ar_001 active and verified by SQL
- [ ] one user operating in Arabic

---
← Phase E index: [../README.md](../README.md)
