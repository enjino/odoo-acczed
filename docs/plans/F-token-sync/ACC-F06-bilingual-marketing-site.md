# ACC-F06 — Build the marketing site bilingual (en + ar)

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started |
| **Depends on** | ACC-F04 |
| **Estimated** | 1–2 days |
| **Touches** | `acczed-site/` (app router, layout, copy, font stack) |

## Goal

The site is served in Arabic and English, with a correct `dir="rtl"` document for Arabic, so a Saudi
buyer reads the pitch in the language the product is sold on.

## Context (verified)

- Created 2026-09-14 by ACC-A07 decision 5. The user chose "build it bilingual now".
- The site is small: `app/layout.tsx` (25 lines), `app/page.tsx` (284 lines, **all copy inline**),
  `app/globals.css`. No i18n library present — `grep -rl "next-intl|i18next|useTranslation"` finds nothing.
- Next 16 / React 19, App Router, deployed to Vercel as `app.acczed.online` (deploy flow in `acczed-site/docs/DEPLOY.md`).
- The document is `<html lang="en">` (`app/layout.tsx:21`) with no `dir` attribute.
- Font is Inter (`app/globals.css:2-17`) — a **Latin-only** stack, so Arabic needs a real font decision,
  which is the same problem ACC-E05 solves for the backend. **Coordinate: both surfaces should end up
  with one Arabic/Latin pairing, not two.**
- This is marketing-site scope only. The product's Arabic *interface* claim is owned by ACC-E01…E04.

## Steps

- [ ] **1. Pick the routing approach and record the reason**
  ```bash
  # option A: next-intl   -> matcher middleware, message catalogs, useTranslations()
  # option B: built-in App Router i18n -> app/[locale]/..., a dictionary module, no dependency
  # decide by size: 284 lines of copy, one page, no CMS. Option B is probably enough — but say why.
  ```
  → expected: a chosen approach, written down here, not chosen by default
- [ ] **2. Restructure `app/` to be locale-aware**
  ```bash
  # app/[locale]/page.tsx + app/[locale]/layout.tsx ; keep a root redirect en -> /en
  ```
  → expected: `/en` and `/ar` both serve the page; `/` redirects to `/en`
- [ ] **3. Extract every string out of `page.tsx` into catalogs**
  ```bash
  # en.json + ar.json ; the four hero stats (:163-166), the SAUDI cards (:90-121),
  # the FAQ block (:179-181), the apps list (:8-88)
  ```
  → expected: zero user-visible literals left in the TSX
- [ ] **4. Set `lang` and `dir` per locale**
  ```bash
  # <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
  ```
  → expected: `/ar` renders `dir="rtl"`, `/en` renders `dir="ltr"`
- [ ] **5. Resolve the Arabic font stack (shared with ACC-E05)**
  ```bash
  # Inter has no Arabic coverage; pair it with an Arabic face of matching weight/x-height
  ```
  → expected: Arabic text renders in a chosen face, not a system fallback
- [ ] **6. Audit the layout in RTL, then deploy**
  ```bash
  # check the aurora orbs, the stats grid, the FAQ, and any directional icon (.arrow) under rtl
  cd ~/Desktop/Projects/acczed-site && # deploy per docs/DEPLOY.md
  ```
  → expected: no clipped, mirrored-wrong or LTR-locked element on /ar

## Verification

- `/en` and `/ar` both return 200 on the deployed site, with the correct `lang` and `dir` each.
- Arabic copy is real Arabic, not machine output pasted unreviewed.
- `grep -c '"[A-Z]' app/[locale]/page.tsx` finds no untranslated visible string.
- Both locales look correct at ~400px width (the site is responsive today; keep it that way).

## Done when

- [ ] `/ar` serves real Arabic with `dir="rtl"` in production
- [ ] every visible string lives in a catalog, not in TSX
- [ ] one font pairing, shared with the backend (ACC-E05)
- [ ] before/after screenshots in `evidence/` (CONVENTIONS §7.5)

## Risks / notes

- **Do this after ACC-F04, not before.** Translating copy that is currently false would double the
  work *and* publish the same overclaims in a second language. That is the whole reason this depends
  on F04.
- Arabic copy needs a human read. Machine translation into a market the product is sold to is a
  credibility risk of the same kind as the false `live` badges.
- The `dir="rtl"` switch is page-wide; the `.aurora` orbs (`page.tsx:126-128`) are positioned with
  absolute `left`/`right` and will mirror. That may be fine, or may look wrong — check, do not assume.
- If the chosen approach adds middleware, confirm it does not break the Vercel deploy flow in
  `acczed-site/docs/DEPLOY.md`, which uses the Vercel REST API.

---
← Phase F index: [../README.md](../README.md)
