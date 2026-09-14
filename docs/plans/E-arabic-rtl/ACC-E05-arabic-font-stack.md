# ACC-E05 — Font stack for Arabic and Latin together

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ⏳ not started |
| **Depends on** | ACC-E03 |
| **Estimated** | 3 hrs |
| **Touches** | `_acczed_variables.scss`, font assets |

## Goal

Inter covers the Latin half of the brand; Arabic needs a face that matches its weight and does not fall back to something heavy and generic.

## Context (verified)

- Odoo composes the font stack through `o-add-unicode-support-font()` (`addons/web/static/src/scss/primary_variables.scss:114`), which appends a Unicode-support font to the sans-serif stack.

## Steps

- [ ] **1. Add an Arabic face and keep the composition macro**
  ```bash
  $o-font-family-sans-serif: o-add-unicode-support-font(("Inter", "Noto Sans Arabic", <odoo defaults>));
  ```
  → expected: both scripts render with intent
- [ ] **2. Self-host the fonts (no external CDN)**
  ```bash
  # put woff2 files under acczed_theme/static/src/fonts/ and declare @font-face
  # reason: the product is sold as self-hosted / data-sovereign
  ```
  → expected: no network font request
- [ ] **3. Check numerals and dates**
  ```bash
  # Arabic-Indic vs Latin digits must be a deliberate choice, consistent in lists and reports
  ```
  → expected: documented choice, no tofu boxes

## Verification

- Arabic text renders in the chosen family at the right weight.
- Zero webfont requests to third-party origins.
- Number/date formatting is deliberate and consistent.

## Done when

- [ ] Arabic font family in place
- [ ] self-hosted fonts, no CDN
- [ ] Arabic/Latin screenshots captured

---
← Phase E index: [../README.md](../README.md)
