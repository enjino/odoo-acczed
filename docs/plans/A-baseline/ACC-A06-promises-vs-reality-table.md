# ACC-A06 — Complete the promises-vs-reality table

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-A02, ACC-A03, ACC-A04, ACC-A05 |
| **Estimated** | 20 min |
| **Touches** | `docs/plans/README.md` |

## Goal

Make every public claim on app.acczed.online auditable: each row gets its live evidence and the exact command that produced it.

## Context (verified)

- The site claims 44 apps and "2 languages, both directions" with `live` badges (`acczed-site/app/page.tsx:90-121, 162-167`).
- DB ground truth: 41 installed modules (platform plumbing only), `account`, `l10n_sa`, `l10n_sa_edi`, `website`, `contacts` all `uninstalled`.

## Steps

- [ ] **1. Re-verify the module ground truth**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select count(*) filter (where state='installed') from ir_module_module;"
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select name,state from ir_module_module where name in ('account','l10n_sa','l10n_sa_edi','website','contacts','project');"
  ```
  → expected: installed = 41; account/l10n_sa/l10n_sa_edi/website/contacts = uninstalled
- [ ] **2. Fill the table in README**
  ```bash
  # add one column: 'evidence command' to the promises table
  # one row per claim: claim | reality | evidence command | decision
  ```
  → expected: every row cites a command or file:line
- [ ] **3. Link each claim to the task that will make it true**
  ```bash
  # ZATCA / chart of accounts -> ACC-G03
  # Arabic RTL -> ACC-E01..ACC-E03
  ```
  → expected: no orphan claim

## Verification

- Every row of the promises table has an evidence command.
- No claim is marked `live` without a recorded verification step.

## Done when

- [ ] README promises table complete with evidence column
- [ ] each claim linked to its owning task

---
← Phase A index: [../README.md](../README.md)
