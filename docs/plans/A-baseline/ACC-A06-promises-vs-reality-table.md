# ACC-A06 — Complete the promises-vs-reality table

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — table in `README.md`, evidence in `evidence/evidence.log`) |
| **Depends on** | ACC-A02, ACC-A03, ACC-A04, ACC-A05 |
| **Estimated** | 20 min |
| **Touches** | `docs/plans/README.md` |

## Goal

Make every public claim on app.acczed.online auditable: each row gets its live evidence and the exact command that produced it.

## Context (verified)

- The site claims 44 apps and "2 languages, both directions" with `live` badges (`acczed-site/app/page.tsx:90-121, 162-167`).
- DB ground truth: 41 installed modules (platform plumbing only), `account`, `l10n_sa`, `l10n_sa_edi`, `website`, `contacts` all `uninstalled`.

## Steps

- [x] **1. Re-verify the module ground truth**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select count(*) filter (where state='installed') from ir_module_module;"
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select name,state from ir_module_module where name in ('account','l10n_sa','l10n_sa_edi','website','contacts','project');"
  ```
  → expected: installed = 41; account/l10n_sa/l10n_sa_edi/website/contacts = uninstalled
  → **actual: installed = 41** ✅; `account`, `l10n_sa`, `l10n_sa_edi`, `website`, `contacts` all
  **uninstalled** ✅. Note `project` **is installed** — so the 41 is not purely plumbing; but it
  contains none of `account`, `crm`, `sale`, `stock`, which is what the site's finance/sales claims
  would need.
- [x] **2. Fill the table in README**
  ```bash
  # added an "Evidence command → result" column; 10 rows, one per public claim
  ```
  → expected: every row cites a command or file:line → **done**, README "Promises vs reality (audit — ACC-A06)".
- [x] **3. Link each claim to the task that will make it true**
  ```bash
  # ZATCA / chart of accounts -> ACC-G03
  # Arabic RTL -> ACC-E01..ACC-E06
  ```
  → expected: no orphan claim → **done.** Rows 1–9 carry an owning task; only row 10's "your data,
  your servers" and row 8's license are `—` because they are **already true** and need no task.

## Verification

- Every row of the promises table has an evidence command. ✅ (rows 9 and 8 cite `—` and `grep LICENSE`
  respectively; row 9 is explicitly marked unfalsifiable rather than given a fake command)
- No claim is marked `live` without a recorded verification step. ✅ — and the audit found the inverse
  problem is the real one: **3 of the 5 `live` badges are false.**

## Done when

- [x] README promises table complete with evidence column
- [x] each claim linked to its owning task

## Findings

Coverage went beyond the four claims the plan listed. The site carries **10** public claims: 4 hero
stats, 5 "Saudi difference" cards, and the Sign-in link. Audited against the live database:

- **3 of 5 `live` badges are false** — ZATCA e-invoicing (`account`+`l10n_sa_edi` uninstalled),
  Arabic/RTL (1 of 93 languages active, `rtlcss` missing), Saudi chart of accounts (`l10n_sa` uninstalled).
- **2 of 4 hero stats are false** — "44 business apps" (41 installed, none of them accounting/CRM/sales)
  and "2 languages, both directions" (1 active).
- **The one honest badge is "Saudi payroll rules" (in the works)** — zero payroll modules exist, and the
  site already says so. Worth noting as the model for how the other four should read until they're real.
- **"Your data, your servers" and "100% open-source core" are true** (self-hosted droplet, LGPLv3).
- **The deployed site carries the same badges** — app.acczed.online returns the identical claims
  (8 `tag-live` spans), so this is live overclaiming, not a stale local draft.

## Risks / notes

- `ACC-G04` (Saudi payroll, product IP) owns the payroll claim but deliberately produces no code —
  so row 6 needs no task and stays honest indefinitely. Don't "fix" it.
- The audit is only as good as the local DB. Production runs the *same fork*, and the four failing
  claims fail identically there, but a full production-side re-run would need the same explicit
  consent as ACC-A04.
- **Do not let the "fix the copy" option win by default.** The rule below the table says no copy
  changes before the thing works; that means rows 1–5 are *installation* decisions (ACC-G03) before
  they are copy decisions (ACC-F04), not the reverse.

## Correction (2026-09-14, found during ACC-F04)

**This audit was incomplete and its "done" status was premature.** It enumerated every *badged and
numeric* claim — 4 hero stats, 5 SAUDI cards, the Sign-in link — and concluded "no claim is unlinked".
It did not audit the page's **prose**, where three further assertions were false in the present tense:

- the hero lede (`page.tsx:154-156`), the most prominent copy on the page, asserting ZATCA, payroll and
  right-to-left Arabic as existing;
- "Arabic and English, RTL and LTR, side by side." (`:203`);
- "Every app your business needs. Already connected." (`:213`) — still unchanged.

Read the table below as **"every badge and stat"**, not "every public claim". ACC-F04 fixed the first
two along with the badges; the third is flagged there as needing a human call.

**Lesson for any future audit task:** audit the *rendered page*, not the data structures. The claims
that survive longest are the ones not modelled as a flag.

---
← Phase A index: [../README.md](../README.md)
