# ACC-E04 — Translate our own strings (i18n/ar.po)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ⏳ not started |
| **Depends on** | ACC-E02 |
| **Estimated** | half a day |
| **Touches** | `acczed-addons/acczed_theme/i18n/ar.po` |

## Goal

Standard Odoo labels come with the Arabic translation; everything we invent has to be translated by us or it stays English inside an Arabic screen.

## Context (verified)

- Module translations live in `i18n/ar.po` inside each module; export/import is done with the `--i18n-*` flags of odoo-bin.

## Steps

- [ ] **1. Generate the PO skeleton from the installed module**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed --i18n-export=/tmp/acczed_theme.pot --modules=acczed_theme --stop-after-init
  ```
  → expected: POT file produced
- [ ] **2. Translate and load back**
  ```bash
  cp /tmp/acczed_theme.pot ~/Desktop/Projects/acczed-addons/acczed_theme/i18n/ar.po
  # translate msgstr entries, then:
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed --i18n-overwrite --modules=acczed_theme --stop-after-init
  ```
  → expected: Arabic strings loaded
- [ ] **3. Review untranslated leftovers**
  ```bash
  # Settings -> Translations -> Translated Terms, filter language ar_001 and module acczed_theme
  ```
  → expected: no untranslated entry we authored

## Verification

- `i18n/ar.po` exists in the module and is loaded.
- No English text we authored appears in the Arabic UI.
- Arabic terminology is consistent (financial terms reviewed).

## Done when

- [ ] ar.po committed
- [ ] Arabic UI free of our own untranslated strings

---
← Phase E index: [../README.md](../README.md)
