# ACC-H08 — Audit trail for permission changes

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H03, ACC-H05, ACC-H06 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/models/` |

## Goal

Record who changed which permission, when, and what it was before — this product's customers are audit firms, so "who gave themselves access?" has to be answerable.

## Context (verified)

- Odoo tracks field changes only on models inheriting `mail.thread`; `ir.model.access` and `ir.rule` are plain models with no history.
- The console is the only clean place to capture the before → after pair, because it is the writer.

## Steps

- [ ] **1. Add `acczed.access.log`**
  ```bash
  fields: date, user_id, role_id, entity (menu|action|model|rule|role), entity_ref,
          action (grant|revoke|create|archive), before, after, reason, source (console|xml)
  ```
  → expected: one immutable row per change
- [ ] **2. Log from the single write path**
  ```bash
  # every console write goes through one helper and that helper logs — never log from the UI layer
  # include refused changes (the wizard preview payload) so attempts are recorded too
  ```
  → expected: no unlogged path exists
- [ ] **3. Surface it where it matters**
  ```bash
  # Role form: 'History' tab; User form: 'Access history' tab; report: 'Permission changes in period'
  ```
  → expected: an auditor can pull the list without dev mode
- [ ] **4. Make it tamper-evident**
  ```bash
  # insert-only: no write/unlink ACL for anyone, not even the Access Manager
  # hash chain (prev_hash + payload) so a missing row is detectable
  ```
  → expected: audit-grade but deliberately simple

## Verification

- Grant a menu to a role → exactly one log row with before/after populated.
- Editing or deleting a log row as the Access Manager raises `AccessError`.
- The chain verifies clean after ten changes.

## Done when

- [ ] log model + single write path
- [ ] history views on role and user
- [ ] insert-only enforced, chain verification works

## Risks / notes

- Insert-only means a wrong entry cannot be corrected — adopt a 'correction' convention (a new row referencing the old) instead of allowing edits.

---
← Phase table: [../README.md](../README.md)
