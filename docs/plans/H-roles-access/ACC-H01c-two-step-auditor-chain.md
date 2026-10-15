# ACC-H01c — The two-step auditor chain (review → pass → approve)

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H01b |
| **Estimated** | 1–2 days |
| **Touches** | `acczed-addons/acczed_project_audit/` (new), `acczed-addons/acczed_recommendations/` (the tab it drives) |

## Goal

A task carries a two-step audit: **auditor 1 reviews and passes it on; auditor 2 approves/closes** — and
only the person holding that role *on that task's project* can advance it, enforced server-side.

## Context (verified)

- The chain is a workflow on `project.task`, which already has `state` (selection) and `stage_id`; the
  group-gated-element pattern is `groups="<module>.<group>"` on a page or button —
  `addons/project/views/project_task_views.xml:518` (Blocked By),
  `addons/hr_timesheet/views/project_task_views.xml:43` (Timesheets).
- **The Recommendations tab shipped 2026-10-14** in `acczed_recommendations` (field
  `acczed_recommendation` on `project.task`, page `page_recommendations`, module `20.0.0.1.0`) — the
  natural carrier for what the auditors read and write.
- The To-Do card has **no notebook** (`addons/project_todo/views/project_task_views.xml:79-133`), so the
  chain lives on the project task form (view 620 `project.view_task_form2`).
- Who may write a task today: `task_edition_rule_internal` (employees: only their own project-less tasks)
  and `task_visibility_rule` (followers read-only, assignees read/write) —
  `addons/project/security/project_security.xml:80-99`. Assigning an auditor as an *assignee* silently
  grants write, which is why the chain must not lean on assignees.
- Field-level write cannot be expressed by `ir.model.access` or record rules (model- and row-level only).

## Steps

- [ ] **1. The chain fields** on `project.task`:
  ```bash
  acczed_audit_state      # none | with_auditor1 | with_auditor2 | approved
  acczed_passed_by_id     # + acczed_passed_date   (auditor 1's hand-off)
  acczed_approved_by_id   # + acczed_approved_date (auditor 2's close)
  ```
  → expected: columns exist; defaults `none`
- [ ] **2. The buttons, gated per project** — "Pass to auditor 2" (visible to auditor 1) and
  "Approve" (visible to auditor 2), each with `groups=` **and** a Python guard in `write()` that checks
  the caller holds that role on `task.project_id` (the UI gate is not enforcement).
  ```bash
  acczed_project_audit/models/project_task.py
  ```
  → expected: auditor 1 cannot approve, auditor 2 cannot pass backwards, the owner cannot skip a step
- [ ] **3. Chatter on each transition** (project depends on mail): who passed/approved, when.
- [ ] **4. The auditor's read surface** — the Recommendations page behind the per-project gate, and a
  record rule so the records behind it are refused server-side without the grant.

## Verification

- `select id, acczed_audit_state from project_task where acczed_audit_state != 'none';` → only tasks that
  were actually moved.
- Three users (owner, auditor 1, auditor 2): each transition attempted by each user — allowed only for the
  one holding the right role on that project. Recorded in `evidence.log`.
- A direct ORM write to `acczed_audit_state` by the wrong user is refused (not just hidden).

## Done when

- [ ] the chain is enforced in Python, not only in the view
- [ ] the same task cannot be approved without being passed first
- [ ] the auditor's content is refused server-side without the grant
- [ ] `bash tools/verify-rtl.sh --check 5` passes for new strings (CONVENTIONS §8)
- [ ] zero modifications under the fork's `addons/` tree

## Risks / notes

- **The chain's gate has to survive the project's Visibility.** On a `portal`/`employees` project every
  internal user can already write tasks (see ACC-H01b's visibility note, measured live), so "only auditor 1
  may pass, only auditor 2 may approve" cannot rest on visibility — it must be the Python guard in step 2.
  Decide explicitly whether a `portal`-visibility project is allowed to carry the chain at all.
- **Do not implement the chain as assignees.** `task_visibility_rule` gives assignees read/write
  (`project_security.xml:80-99`), so "auditor = assignee" would hand them edit rights on the whole task.
- The auditor must be able to *read* a task they are not a follower of — that needs the grant rule from
  ACC-H01b, and it is the one place where per-project scoping can leak (see ACC-H01b's additive trap).
- If the owner must also be able to force-close, that is a fourth transition — decide it here rather than
  leaving a silent gap.
