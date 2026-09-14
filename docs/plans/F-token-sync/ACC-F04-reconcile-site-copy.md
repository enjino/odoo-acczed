# ACC-F04 — Reconcile the marketing copy with the audited reality

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started — **pulled forward, runs ahead of ACC-G03** (decision 4, 2026-09-14) |
| **Depends on** | ACC-A06 |
| **Estimated** | 3 hrs |
| **Touches** | `acczed-site/app/page.tsx` |

> **Sequencing (changed 2026-09-14 by ACC-A07 decision 4):** this task originally depended on ACC-E06
> and sat last in the execution order. The user chose "fix the copy now, install later", so it now runs
> as soon as ACC-A06 is done — the three false `live` badges are public *today*, and waiting for the
> whole theming track keeps them up for the duration. ACC-E06 is **subsumed**: it was "make the site's
> Arabic claim true (or stop making it)", which is now just the Arabic row of step 1 here.

## Goal

The site currently sells 44 connected apps, ZATCA filing and a Saudi chart of accounts as `live`; the audit says otherwise. Every claim either becomes true or becomes honest.

## Context (verified)

- Claims: 44 apps (`:163`), "2 languages, both directions" (`:165`), Arabic RTL `live` (`:97-102`), ZATCA `live` (`:92-96`), Saudi chart of accounts `live` (`:103-108`), Saudi payroll `in the works` (`:110-114`).
- DB reality (ACC-A06): 41 installed modules, `account`/`l10n_sa`/`l10n_sa_edi` uninstalled. 'core' tags sit on Accounting/Payroll/Documents/Sign (`:8-13`).

## Steps

- [ ] **1. Apply the decision from ACC-A07 to every claim**
  ```bash
  # decision 4 = soften now, install later. Move these three badges from live -> "in the works"
  # (the wording page.tsx:110-114 already uses for payroll), leaving the copy honest until each lands:
  #   :95   ZATCA e-invoicing          -> needs account + l10n_sa_edi (ACC-G03)
  #   :101  Arabic, right to left      -> needs rtlcss + ar_001      (ACC-E01..E03)
  #   :107  Saudi chart of accounts    -> needs l10n_sa              (ACC-G03)
  # unchanged: :119 "Your data, your servers" is TRUE and stays live
  ```
  → expected: no unverifiable live badge
- [ ] **2. Fix the numbers**
  ```bash
  acczed-site/app/page.tsx:162-167
  ```
  → expected: app count matches ir_module_module
- [ ] **3. Redeploy the site**
  ```bash
  cd ~/Desktop/Projects/acczed-site
  # deploy per docs/DEPLOY.md (Vercel REST flow)
  ```
  → expected: app.acczed.online serves the corrected copy

## Verification

- Every `live` badge has an evidence entry; every other claim says "in the works".
- App count and language count match the audited numbers.
- Production site redeployed and re-read.

## Done when

- [ ] copy reconciled with evidence
- [ ] site redeployed
- [ ] no unsupported claim left

---
← Phase F index: [../README.md](../README.md)
