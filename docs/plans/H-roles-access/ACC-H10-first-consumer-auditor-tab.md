# ACC-H10 — First consumer: the auditor-restricted task tab

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H04, ACC-H05, ACC-H01b |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_project_audit/` (new) |

## Goal

Apply the console to the feature that started this thread: a tab that only the auditor role — and any other roles the admin allows — can see on a task card.

## Context (verified)
- **The tab is currently gated to the auditor roles** (`views/project_task_views.xml` in
  `acczed_recommendations`: `groups="acczed_access.group_auditor_1,acczed_access.group_auditor_2,project.group_project_manager"`,
  applied 2026-10-15). It was first gated to `project.group_project_manager` alone, which hid it from the
  auditors it exists for — the roles had to exist before the gate could mean anything. Measured with
  `~/.hermes/scripts/odoo-tab-visibility.js`: admin ✅, auditor1 ✅, auditor2 ✅ (all see
  `["Description","Recommendations","Sub-tasks"]`), `normal1` and `internal_only` ❌
  (`["Description","Sub-tasks"]`). H10 replaces this hard-coded attribute with per-role visibility driven
  from the roles console, so there is one source of truth instead of a `groups=` list to keep in sync.

- The project task form already carries group-gated tabs; the pattern to copy is `addons/project/views/project_task_views.xml:518` (`groups="project.group_project_task_dependencies"`), and a third-party module doing the same is `addons/hr_timesheet/views/project_task_views.xml:43`.
- The To-do card has **no notebook at all** (`addons/project_todo/views/project_task_views.xml:79-133`) — it is form fields plus the chatter panel widget at `:130`.
- To-dos are private: `project_todo/security/project_todo_security.xml` gives an employee access only to their own project-less tasks, and `task_visibility_rule` (`addons/project/security/project_security.xml:80-99`) grants read-only to followers, read/write to assignees.
- **Carried open question:** which card gets the tab — the project task form (already has tabs) or the to-do card (has none)? And which existing tab is the model for "the same functionality"?

## Steps

- [x] **1. Record the two decisions before any code** — recorded 2026-10-14
  ```bash
  # (a) target card: the PROJECT TASK FORM (view 620 project.view_task_form2). The to-do card is out:
  #     it has no notebook at all (addons/project_todo/views/project_task_views.xml:79-133).
  # (b) the surface it mirrors: the Recommendations tab shipped 2026-10-14 in acczed_recommendations
  #     (page_recommendations on the same form) — same records, auditor audience. The gate is per project
  #     (ACC-H01b), not one global group.
  ```
  → expected: both answered in this file
- [ ] **2. Create the consumer module and declare its permission**
  ```bash
  acczed_project_audit, depends: ['project', 'project_todo', 'acczed_access']
  _acczed_permissions = [{'key': 'project.task.tab.audit', 'name': 'Auditor tab',
                          'scope': 'view_feature', 'target': '<page xmlid>'}]
  
  duplicate this module instead of extending the console
  ```
  → expected: the tab becomes tickable per role in the console
- [ ] **3. Add the page with the gate driven by the registry**
  ```bash
  <xpath expr="//notebook" position="inside">
    <page name="auditor" string="Audit" groups="acczed_project_audit.group_auditor"/>
  </xpath>
  ```
  → expected: visible only to roles the admin granted
- [ ] **4. Make the data match the gate**
  ```bash
  # if the tab exposes records, give those records their own ACL/rule for the same group
  # document how an auditor reaches someone else's to-do: follower = read-only, assignee = write
  ```
  → expected: the restriction survives a direct URL or ORM call

## Verification

- With the role: the tab renders and its content loads.
- Without the role: no tab, and the records behind it are refused server-side.
- Toggling the permission in the console changes the rendered tab with no XML edit.

## Done when

- [ ] both decisions recorded
- [ ] tab shipped through the registry rather than a hardcoded gate
- [ ] server-side verification for the records behind it

## Risks / notes

- If the target is the to-do card, an auditor cannot open someone else's to-do unless they are a follower (read-only) or an assignee (which silently grants write) — decide which, and say so on the card.

---
← Phase table: [../README.md](../README.md)