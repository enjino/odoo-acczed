# ACC-C05 — Fine-tune the identity details

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
| **Depends on** | ACC-C03 |
| **Estimated** | 3 hrs |
| **Touches** | `acczed.dark.scss`, `_acczed_variables.scss` |

## Goal

Close the visual gap between the marketing site and the application: the same green, the same greys, the same radius, the same soft glow.

## Context (verified)

- Site references: primary button gradient and glow `acczed-site/app/globals.css:107-112`, selection colour `rgba(57,211,83,.25)` (`:31`), card ring `rgba(57,211,83,.4)` (`:231`).

## Steps

- [ ] **1. Match the primary button treatment**
  ```bash
  background: linear-gradient(135deg, rgba(57,211,83,.18), rgba(57,211,83,.08));
  box-shadow: 0 0 24px rgba(57,211,83,.15);
  ```
  → expected: button reads like the site's .btn-primary
- [ ] **2. Match selection and focus rings**
  ```bash
  ::selection { background: rgba(57,211,83,.25); }
  ```
  → expected: selection colour identical to the site
- [ ] **3. Side-by-side review**
  ```bash
  docs/plans/evidence/after-c05-side-by-side.png   # site next to backend
  ```
  → expected: green, greys, radius visibly identical

## Verification

- Side-by-side screenshot shows matching palette and radius.
- No hardcoded colour left outside the token layer.

## Done when

- [ ] side-by-side evidence saved
- [ ] no stray colour literals

---
← Phase C index: [../README.md](../README.md)
