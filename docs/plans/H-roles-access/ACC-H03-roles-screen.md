# ACC-H03 — Build the Roles screen (create, edit, archive roles)

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H02 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/views/*.xml`, `models/*.py` |

## Goal

Let an admin create and manage roles as first-class objects: name, what it is for, who is in it, what it implies — without touching the Technical menu.

## Context (verified)

- Everything the screen needs already exists on `res.groups` (`res_groups.py:16-78`), including `privilege_id` for grouping roles under an app (`res_groups_privilege.py`), `implied_ids` for role inheritance and `disjoint_ids` for mutually exclusive roles.
- Odoo's own group form (`odoo/addons/base/views/res_groups_views.xml:80`) is developer-facing: users lists, ACL lines, record rules and menu/view access are all dumped on one form.

## Steps

- [ ] **1. Inherit the group form for the console: friendly first screen**
  ```bash
  # tab 1 "Role": name, privilege, description, sequence, users (avatar widget), implied roles
  # hide the technical relations behind a second tab "Details" (shown to group_access_manager only)
  ```
  → expected: a plain admin can create a role in under a minute
- [ ] **2. Guardrails on write/unlink**
  ```bash
  # - system groups (base.group_user/portal/public/system/...) may not be deleted or renamed
  # - a role that grants access to this console may not be emptied of its own manager
  # - deleting a role = archive by default, with an explicit "really delete" path for custom roles
  ```
  → expected: attempts raise a clean user error, not a traceback
- [ ] **3. Role duplication + template roles**
  ```bash
  # copy an existing custom role (res.groups.model_access has copy=True, so ACL lines carry over)
  # ship 2-3 starting templates: Auditor (read-only + export), Reviewer (read + comment + approve), Contributor
  ```
  → expected: templates installable as data
- [ ] **4. Show effective membership**
  ```bash
  # "Users" (explicit) vs "Users and implied users" (all_user_ids) side by side
  ```
  → expected: admin sees the real footprint of a role

## Verification

- Create a role "Auditor (test)", add one user, confirm both `res_groups` and `res_groups_users_rel` rows exist.
- A system group cannot be deleted (clean `UserError`).
- An archive/restore round-trip leaves no orphan membership.

## Done when

- [ ] roles can be created, edited, searched, duplicated, archived
- [ ] guardrails verified with negative tests

## Risks / notes

- `implied_ids` is a graph — reject cycles at write time (`ValidationError`) or Odoo will error later at ACL computation.

---
← Phase table: [../README.md](../README.md)
