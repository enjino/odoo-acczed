# ACC-H01b — Per-project role grants

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H01, ACC-H02 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/` (new model, rules, a page on the project form) |

## Goal

A role can be granted to a person **on one project** — auditor on *this* project, not auditor
company-wide — and the grant is enforced server-side, not merely hidden in the UI.

## Context (verified)

- Roles are `res.groups` (ACC-H01 decision 1), and group membership is company-wide
  (`res_groups_users_rel (gid, uid)`) — there is no project in that relation.
- **No (project, role) table exists anywhere.** `project.project`'s only people surfaces are `user_id`
  (Project Manager), `collaborator_ids` (→ `project.collaborator`), `allowed_internal_user_ids`
  ("Team Members") and `favorite_user_ids` ("Members") — measured in `acczed_p20`.
- The pattern to copy is `project.collaborator`: `project_id`, `partner_id`, `access_mode`
  (view/edit/advanced_edit) with `UNIQUE(project_id, partner_id)`
  (`addons/project/models/project_collaborator.py:13-19`) — and it is *enforced*, not decorative:
  `addons/project/security/project_security.xml:54-56` reads
  `('project_id.collaborator_ids', 'any', [('partner_id', '=', user.partner_id.id),
  ('access_mode', 'in', ['edit', 'advanced_edit'])])`. 23 restrictions in `ir_access` mention `project_id`.
- **Project Owner needs no new role** — the user decided to reuse the existing Project Manager field
  (`project.project.user_id`), which is already per-project and already enforced. Live: 7 projects, all
  with a manager (Mitchell Admin ×5, Marc Demo ×2).
- **Measured 2026-10-14 — membership is the only way into a `followers` project.** Reading projects 9
  (`portal`) and 11 (`followers`, R&D) as three accounts: `internal_only` (base.group_user only) and
  `auditor1` both see **only** ACC Zed; `admin` (Administrator, rule `('project_id','!=',False)`) sees
  both. `project_allowed_internal_users_rel` holds 1 row, on project 11. So on a `followers` project a
  normal internal user gets nothing automatically and the grant is what lets them in.
- The project form is view 593 `project.edit_project`; its notebook is at
  `addons/project/views/project_project_views.xml:136` with pages `map` (:137), `description` (:140),
  `settings` (:143).
- Additive-only (ACC-H01 decision 3): a grant can only add access.

## Steps

- [ ] **1. The grant model** — `acczed.role.grant` with `project_id`, `role_id` (→ `res.groups`,
  domain-limited to the product's roles), `user_id` (→ `res.users`), `granted_by_id`, `date`,
  and `UNIQUE(project_id, role_id, user_id)`.
  **The role vocabulary is three values, and `member` is one of them:** `member` (a normal participant —
  the grant that lets someone into a `followers` project), `auditor_1`, `auditor_2`. No fourth "normal
  user" *role* is created: the existing `project.group_project_user` already IS the normal-user role
  (it carries the task write rights), and a new role could only ADD access, never restrict — see the
  additive trap below and ACC-H01 decision 3. It is a first-class role in 20 already: the `Project`
  privilege (`project.res_groups_privilege_project`) holds **`Project / Administrator`**
  (`project.group_project_manager`) and **`Project / User`** (`project.group_project_user`) — measured in
  `acczed_p20`. The console therefore *surfaces* it instead of cloning it: a clone would need every ACL
  and rule duplicated for the new group and still could not restrict anything.
  ```bash
  acczed_access/models/acczed_role_grant.py
  acczed_access/security/ir.model.access.csv   # CRUD for group_access_manager only
  ```
  → expected: the model installs; a non-manager is refused server-side on create
- [ ] **2. Enforcement, not decoration** — a group rule on `project.task` for the auditor role reading
  the grant (`('project_id.acczed_role_grant_ids', 'any', [('role_id', '=', <auditor group>),
  ('user_id', '=', user.id)])`), plus the same shape on `project.project`.
  ```bash
  acczed_access/security/acczed_access_rules.xml
  ```
  → expected: the granted user passes, an ungranted user on the same project is refused
- [ ] **3. Assignment UI** — a **Roles** page on the project form, inserted after `settings`:
  ```xml
  <xpath expr="//notebook/page[@name='settings']" position="after">
    <page string="Roles" name="page_acczed_roles">
      <field name="acczed_role_grant_ids" readonly="1"/>   <!-- written through the console -->
    </page>
  </xpath>
  ```
  → expected: a page listing "who holds which role on this project"
- [ ] **4. Prove the scope** — two users, one grant on one project, one project without a grant.

## Verification

- `select project_id, role_id, user_id from acczed_role_grant;` → the grant rows.
- As the granted user: reading the granted project's tasks returns rows; as a non-granted user on the
  same project the read is refused (or returns nothing) — recorded in `evidence.log`.
- Without the role: no Roles page content, and the ORM call is refused (UI-only gates do not count).

## Done when

- [ ] the grant model is installed and protected by its own ACL (a user cannot self-grant)
- [ ] a grant changes a **real** access outcome for a real user, recorded
- [ ] `bash tools/verify-rtl.sh --check 5` passes for new strings (CONVENTIONS §8)
- [ ] zero modifications under the fork's `addons/` tree

## Risks / notes

- **Visibility already grants every internal user access — check it before promising a per-project role.**
  Measured live 2026-10-14: `base.group_user` ("Role / User") holds read on `project.project`, and the rule
  is `['|', ('privacy_visibility','in',['employees','portal']), ('allowed_internal_user_ids','in',user.id)]`.
  So on a project whose Visibility is `employees` ("All internal users") or `portal` ("All internal users
  and invited portal users"), **every internal user can read the project and read+write its tasks with no
  membership at all** — verified by RPC as a plain internal user (`auditor1`): read all 8 projects, read
  tasks, write a task → OK; create a project → refused. `followers` ("Team members only") and
  `invited_users` are the only values where access comes from membership. A per-project auditor grant is
  therefore **only meaningful on a `followers`/`invited_users` project**; on a `portal`/`employees` project
  the grant adds nothing and "only the granted auditor" is not enforceable by visibility.
- **The additive trap.** Adding a user to the auditor group applies that group's *model* ACLs everywhere;
  only record rules are row-level. A per-project grant therefore scopes **rows, not model rights**. Keep
  the auditor role's ACLs minimal (read + the chain fields) or the "per project" promise leaks.
- **The grant table is itself a privilege surface** — it is product data, so it needs its own ACL and
  rule, or any user can write their own grant.
- No deny exists (ACC-H01 decision 3): you can promise "granted here", never "refused there" for anything
  the user's other groups already allow.
- Reversibility: dropping the grants leaves the roles inert; no fork file is touched.
