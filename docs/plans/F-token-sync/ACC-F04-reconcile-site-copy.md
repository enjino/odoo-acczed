# ACC-F04 — Reconcile the marketing copy with the audited reality

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ✅ done (2026-09-14 — deployed to production, `evidence/evidence.log`) |
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

## Result (2026-09-14) — deployed

Three false `live` badges now read "in the works": ZATCA e-invoicing, Arabic/right-to-left, and the
Saudi chart of accounts. Payroll was already honest and "Your data, your servers" stays `live` (true).
Committed in `acczed-site` as `a75a356`.

**The task's claim list was incomplete, and so was ACC-A06's.** Both enumerated only *badged and
numeric* claims. Reading the rendered page found three more false present-tense assertions in **prose**:

| Location | Before | After |
|---|---|---|
| hero lede `:154-156` | "…accounting wired to ZATCA, payroll that understands the Kingdom, and an interface that reads right-to-left…" | "…**rolling out Saudi-first**: accounting wired to ZATCA, …" |
| feature list `:203` | "Arabic and English, RTL and LTR, side by side." | same, "— **rolling out**." |
| hero stats `:163,165` | "**44** business apps" · "**2** languages, both directions" | "**Odoo 19** / one platform" · "**EN + AR** / rolling out (2 langs)" |

The lede is the most prominent copy on the page and would have left the whole exercise half-done.

## Verification

- Site rebuilt (`next build`, static) and the rendered `#saudi` checked: **4 × "in the works", 1 × "live"**.
- Deployed: `dpl_GwotHPLJNNAYQSoGwpxhrFz6QTs3`, target `production`, `READY`.
- Live `https://app.acczed.online` re-read: `tag-live` 8 → **2**, `tag-wip` 2 → **8**, `>44<` 2 → **0**,
  "2 languages" → **0**. (Counts double because Next emits each string in both the SSR HTML and the
  serialised props — 1 real `live`, 4 real "in the works".)
- Screenshot: `evidence/after-f04-site-live.png`.

## Risks / notes (added)

- **Left deliberately unchanged, needs a human call:** `page.tsx:213` — *"Every app your business needs.
  Already connected."* Softer than the badges (it describes the platform's shape, not a specific
  installed capability) but still present-tense. Not edited unilaterally.
- The `#why` section poses ZATCA/Arabic questions and says "acczed is our answer to those questions"
  (`:177-191`). Positioning rather than a factual claim, so left alone — but it sits close to the line
  while ZATCA and Arabic do not work.
- **Flipping these back to `live` is per-claim**, as decision 4 says: ZATCA + chart of accounts after
  ACC-G03, Arabic after ACC-E03. Do not re-run F04 as one pass.

---
← Phase F index: [../README.md](../README.md)
