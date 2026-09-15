# ACC-E02 — Activate Arabic (ar_001)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ✅ done 2026-09-15 — ar_001 active with translations loaded; `arabic_test` user verified RTL in a browser |
| **Depends on** | ACC-E01 |
| **Estimated** | 15 min |
| **Touches** | DB `acczed` (res.lang) |

## Goal

Two of the site's `live` badges depend on this: "Arabic, right to left" and "2 languages, both directions".

## Context (verified)

- Direction is data-driven: `res.lang.direction` = ltr/rtl (`odoo/addons/base/models/res_lang.py:77`).
- Verified today: only `en_US` is active, and `admin` is an `en_US` user.

## Steps

- [x] **1. Activate the language**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin shell -c odoo.conf -d acczed --no-http
  ```
  → expected: ar_001 active · **done 2026-09-15**
- [x] **2. In the shell, activate *and install the translations***
  ```python
  env['res.lang']._activate_and_install_lang('ar_001')   # NOT _activate_lang — see Risks
  env.cr.commit()
  ```
  → expected: `loading translation file …/i18n/ar.po for language ar_001` in the log, once per module
- [x] **3. Switch the dedicated test user to Arabic**
  ```python
  env['res.users'].create({
      'name': 'Arabic Test', 'login': 'arabic_test', 'password': 'arabic_test',
      'lang': 'ar_001',
      'group_ids': [(6, 0, [env.ref('base.group_user').id])],   # Odoo 19: group_ids, not groups_id
  })
  ```
  → expected: user renders Arabic · **done:** id=7, lang=ar_001, group "Role / User"

## Verification

- `select code,active,direction from res_lang where code like 'ar%'` → **ar_001|t|rtl**, ar_SY|(null)|rtl,
  en_US|t|ltr.
- Logging in as the Arabic user renders Arabic labels. **✅** — the activation log shows
  `loading translation file …/i18n/ar.po for language ar_001` for every installed module.
- Behavioural proof: `bash tools/verify-rtl.sh` → **7 passed, 0 failed**, covering all four agreed
  seams with negative controls:
  - `/web/webclient/translations` → `direction = rtl` for ar_001, and `rtl` by default for `arabic_test`
  - browser: backend `body.o_rtl=true`; portal `<html dir="rtl">` + `#wrapwrap.o_rtl`
  - control: `admin` (en_US) stays `o_rtl=false` / `dir=ltr` — RTL is not forced on everyone

## Done when

- [x] ar_001 active and verified by SQL
- [x] one user operating in Arabic (`arabic_test`)

## Risks / notes

- ⚠️ **`_activate_lang` is the wrong call and fails silently.** It sets `active = True` directly,
  bypassing `action_unarchive`, which is the only thing that loads translations
  (`odoo/addons/base/models/res_lang.py:334-342`). The result is a UI that reports
  `direction = rtl` while every label stays English — it would pass a naive direction check and still
  fail this task's own verification. **Use `_activate_and_install_lang`.**
- ⚠️ **A separate process does not reach the running server.** `_get_active_by` is cached with
  `@tools.ormcache(cache='stable')` (`res_lang.py:315-316`). Measured 2026-09-15: after activation the
  SQL said `active=t` while the live server still answered `lang=null` for `?lang=ar_001`. A fresh
  process saw it immediately. **Restart the service after activating a language**, or the change looks
  like it did not apply.
- **Odoo 19 renamed `groups_id` → `group_ids`** (`res_users.py:257`). The old name does not error
  loudly.
- **The portal's `<html dir>` is not curl-checkable.** It comes from `request.env.lang`, and a curl
  session that never runs the webclient's `session_info` RPC keeps a stale `en_US` context — measured
  by curl as `dir=ltr` for a user a real browser renders as `dir=rtl`. Check the portal in a browser.

---
← Phase E index: [../README.md](../README.md)
