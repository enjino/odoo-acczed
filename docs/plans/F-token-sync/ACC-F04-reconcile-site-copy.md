# ACC-F04 — Reconcile the marketing copy with the audited reality

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started |
| **Depends on** | ACC-A06, ACC-E06 |
| **Estimated** | 3 hrs |
| **Touches** | `acczed-site/app/page.tsx` |

## Goal

The site currently sells 44 connected apps, ZATCA filing and a Saudi chart of accounts as `live`; the audit says otherwise. Every claim either becomes true or becomes honest.

## Context (verified)

- Claims: 44 apps (`:163`), "2 languages, both directions" (`:165`), Arabic RTL `live` (`:97-102`), ZATCA `live` (`:92-96`), Saudi chart of accounts `live` (`:103-108`), Saudi payroll `in the works` (`:110-114`).
- DB reality (ACC-A06): 41 installed modules, `account`/`l10n_sa`/`l10n_sa_edi` uninstalled. 'core' tags sit on Accounting/Payroll/Documents/Sign (`:8-13`).

## Steps

- [ ] **1. Apply the decision from ACC-A07 to every claim**
  ```bash
  # either install the modules (ACC-G03) or relabel: live -> in the works
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
