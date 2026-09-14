# ACC-H06 — Data access editor (model CRUD matrix + record rules)

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H03, ACC-H04 |
| **Estimated** | 2 days |
| **Touches** | `acczed-addons/acczed_access/` (models, wizards, views) |

## Goal

Let the admin say "this role may read contacts but not delete them" and "this role only sees its own records" without opening Technical → Access Rights — while stating the additive rule that shapes Odoo's whole permission model.

## Context (verified)

- Model CRUD lives in `ir.model.access` (one row per group x model, fields read/write/create/unlink); `res.groups.model_access` is a One2many onto it and is `copy=True`, so duplicating a role carries its ACLs — `odoo/addons/base/models/res_groups.py:24`.
- Row-level access lives in `ir.rule`; rules attached to groups are a **union**, only a global rule (no group) subtracts — `_compute_global` sets `global = not rule.groups` (`odoo/addons/base/models/ir_rule.py:53-56`).
- Live in `acczed`: 355 `ir.model.access` rows and 111 `ir.rule` rows already exist — the editor is a layer on top, never a replacement.

## Steps

- [ ] **1. Role → data screen: one row per model, four ticks (read/write/create/unlink)**
  ```bash
  # writes/updates/deletes ir.model.access rows for the role's group
  # un-ticking every box deletes the row rather than writing zeros
  ```
  → expected: the ACL row is the single source of truth
- [ ] **2. Show the effective grant, not just this role**
  ```bash
  # computed column: '+ inherited from Role X', '+ from Odoo group_user', plus the union
  # because ACLs are cumulative, the effective column is what actually matters
  ```
  → expected: the admin never mistakes a tick for a denial
- [ ] **3. Record-rule editor with the additive warning**
  ```bash
  # per role: 'only records where ...' (validated domain)
  # banner: rules of different roles are combined with OR; to restrict EVERYONE use a global rule
  ```
  → expected: no surprise when two roles' rules widen access
- [ ] **4. Guardrails**
  ```bash
  # never allow removing read access to ir.model / ir.ui.menu / ir.rule for the console's own role
  # warn when a role gets write on project.task without read on project.project (a real trap)
  # validate domains with Domain(...).validate() before saving
  ```
  → expected: errors surface at save time with a readable message

## Verification

- Grant read-only on `project.task` to a test role, then confirm the user can list tasks and gets `AccessError` on write (test lands in ACC-H09).
- Add a group rule scoping the role to its own records, add a second role with a wider rule, confirm the union — documented behaviour, not a bug.
- `select count(*) from ir_model_access where group_id = <test role group>` matches what the screen shows.

## Done when

- [ ] CRUD matrix editable per role
- [ ] record rules editable with the additive warning
- [ ] guardrails + domain validation in place

## Risks / notes

- ACLs and rules clear caches on write; with two Odoo processes (http + gevent) verify the change lands in both, or a user can keep stale rights until restart.

---
← Phase table: [../README.md](../README.md)
