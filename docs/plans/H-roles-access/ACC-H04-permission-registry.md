# ACC-H04 — Add the permission registry (features declare their own permission points)

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H02 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/models/`, other acczed modules |

## Goal

Give every feature a way to say "I have a permission point" once, so the console can list and grant it without knowing the feature — this is what makes the auditor tab (and the next ten features) tickable per role.

## Context (verified)

- View features are gated by the `groups=` attribute in the arch (e.g. the Blocked By tab, `addons/project/views/project_task_views.xml:518`) — there is no registry, so today a feature's gate is discoverable only by reading the XML.
- Actions carry a `path` used for `/odoo/<path>` URLs (`odoo/addons/base/models/ir_actions.py:70`), which gives a natural stable key for action-level permission points.

## Steps

- [ ] **1. Define the permission model**
  ```bash
  acczed.permission:
    key        (unique, e.g. 'project.task.tab.audit')
    name       (admin-facing label)
    description
    module     (who declared it)
    scope      (menu | action | model | view_feature)
    target     (xmlid or model name or view feature selector)
    role_ids   (m2m res.groups — which roles may use it)
    default_role_ids
  ```
  → expected: one row per feature permission
- [ ] **2. Provide the declaration API for other modules**
  ```bash
  class ProjectTaskAudit(models.Model):
      _inherit = 'project.task'
      _acczed_permissions = [
          {'key': 'project.task.tab.audit', 'name': 'Auditor tab', 'scope': 'view_feature',
           'target': 'acczed_project_audit.view_task_form_audit_page'},
      ]
  ```
  → expected: modules register at import; console lists them automatically
- [ ] **3. Wire the registry to enforcement**
  ```bash
  # view_feature -> the declared view element gets groups = union(role_ids) applied/re-applied
  # action/menu   -> group_ids written on the action/menu record
  # model         -> ir.model.access lines per role
  ```
  → expected: registry is the single source of truth; no hand-edited XML gates
- [ ] **4. Backfill the two existing examples**
  ```bash
  # 1. the Blocked By tab (project.group_project_task_dependencies)
  # 2. the Timesheets tab (hr_timesheet.group_hr_timesheet_user)  -- when that module is installed
  ```
  → expected: the console can show and explain Odoo's own feature tabs too

## Verification

- Registering a permission in a test module makes it appear in the console with no other change.
- Toggling it for a role changes the produced `groups=` value on the target view.
- `select count(*) from acczed_permission;` grows with declared features only.

## Done when

- [ ] registry model + declaration API in place
- [ ] two real features backfilled
- [ ] documented in CONVENTIONS.md as the way to gate a new feature

## Risks / notes

- Re-writing a view's `groups` attribute from data means the view is no longer 'pure XML' — record the original in the DB and make the operation reversible (an 'reset to module default' button).

---
← Phase table: [../README.md](../README.md)
