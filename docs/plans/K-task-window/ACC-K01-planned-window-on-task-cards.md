# ACC-K01 — A planned window (start → end) on the task and to-do cards

| Field | Value |
|---|---|
| **Phase** | K — Planned task window |
| **Status** | ✅ done |
| **Depends on** | ACC-J04 (the migrated `acczed_p20` copy) |
| **Estimated** | 3 h |
| **Touches** | `acczed-addons/acczed_task_window/` (new), `acczed-addons/acczed_{access,recommendations,theme}/__manifest__.py` (version), `docs/plans/{README,CONVENTIONS}.md` |

## Goal

A task carries a **planned** start and end, entered by hand on the Project task card and on
the To-Do card; while the task is In Progress its deadline *is* the end in force, and the
planned end is kept but not editable.

## Context (verified)

- **The card has one date today, not a range.** `project.task` in `acczed_p20` holds
  `date_deadline`, `date_assign`, `date_end`, `date_last_stage_update` — no start date and no
  planned pair (`select name from ir_model_fields where model='project.task' and name like '%date%'`).
  `planned_date_begin` / `planned_date_end` **do not exist in the 20 tree at all**
  (`grep -rn "planned_date_begin = fields" addons/` → nothing); they are Odoo Enterprise's
  Gantt/Planning fields, and `planning` + `industry_fsm` are `uninstallable` in this DB.
- **`date_end` is an actual, not a planned, timestamp** — written by
  `update_date_end()` (`addons/project/models/project_task.py:1482-1486`) when the task enters
  a folded stage, cleared on reopen. Reusing it as a planned end would fight the ORM.
- **The state the user calls "active" is `01_in_progress`** (`addons/project/models/project_task.py:169-176`),
  and its **default is `01_in_progress`** — which is why the lock below also requires a deadline
  to exist, or a brand-new task could never get a window.
- **Anchors.** Project card: the header block at
  `addons/project/views/project_task_views.xml:457-477` (Deadline label + `date_deadline_and_recurring_task`
  div + hidden `allocated_hours`), view **620** `project.view_task_form2` in `acczed_p20`.
  To-Do card: `project_todo.project_task_view_todo_form` (`addons/project_todo/views/project_task_views.xml:79-133`),
  **no notebook at all** — sheet → one `<group>` → description → `todo_chatter_panel`, so a
  second `<group>` is the only place the pair can go.
- **A field on an existing model needs no ACL row.** The window rides on the ACLs `project.task`
  already has; no `ir.access` row was added.
- **Finding, 2026-10-27 — the acczed modules were refused on 20.** After any restart the log read
  `The module acczed_{access,recommendations,theme} has an incompatible version, setting
  installable=False`, so their views were not loaded and `project.task.form.recommendations`
  referenced a field that no longer existed → opening **any** task raised "Oops!" (measured by
  clicking a row in `/odoo/all-tasks`). Cause: manifests still said `19.0.x`. Bumping them to
  `20.0.x` and `-u` made the card open again. This is why ACC-K01 carries the version bump.

## Steps

- [x] **1. Fields + the one-end-in-force rule** — `acczed_task_window/models/project_task.py`
  ```bash
  planned_date_begin / planned_date_end : Datetime, store, copy=False, tracking
  acczed_window_locked                  : state == '01_in_progress' and bool(date_deadline)
  acczed_effective_date_end             : date_deadline if locked else planned_date_end
  write()                               : refuse a planned end != deadline while locked
  _check_acczed_planned_window()        : ValidationError when end < start
  ```
  → expected: the rule holds over RPC too, not just in the view

- [x] **2. Project card** — inherit `project.view_task_form2`, insert under
  `//div[@id='date_deadline_and_recurring_task']`. One end is visible at a time:
  `planned_date_end` when free, `acczed_effective_date_end` (read-only) when locked.

- [x] **3. To-Do card** — inherit `project_todo.project_task_view_todo_form`, insert **one**
  `Planned Window` row into the same column as Tags/Deadline (`<label for> + <div>` after
  `date_deadline`), plus `static/src/task_window.scss` because that column forces every
  `.o_field_widget` to `width:100%`. Three shapes were shipped and rejected before this one:
  one `<field>` per row (two stacked inputs, 2026-10-27); a full-width block before the
  description (aligned to the left edge, under Assignees); and a `width:auto` rule that also
  hit the project card and clipped its end date to "Oct 15, 11:00 A" (2026-10-28, reverted by
  scoping the CSS to `#acczed_todo_planned_window`).

- [x] **4. Unblock the platform first** — bump the three manifests `19.0.x → 20.0.x`, then
  ```bash
  bash run-odoo.sh stop
  env -u PYTHONPATH ../odoo-acczed-venv20/.venv/bin/python odoo-bin -c odoo.conf -d acczed_p20 \
      -i acczed_task_window -u acczed_access,acczed_recommendations,acczed_theme --stop-after-init
  ```
  → expected: `Module acczed_task_window loaded`, `Modules loaded.`, no `incompatible version`

- [x] **5. Tests** — `tests/test_task_window.py`, 7 cases: free without a deadline, deadline
  locks the end, a different value is refused, the deadline remains editable, leaving In
  Progress restores the planned end, end-before-start is refused, the same rule on a to-do.

## Verification

```bash
# module + views installed
select name, state, latest_version from ir_module_module where name='acczed_task_window';  # installed 20.0.0.1.0
# the rule over RPC (not just the view)
task.write({'state':'01_in_progress','date_deadline':...,'planned_date_end':...})  # UserError
# the card opens and renders the window
MODE=task OUT=... node ~/.hermes/scripts/acczed-card-shot.js   # form=1, modals=0
```

Recorded in `evidence/evidence.log` (2026-10-27) with `before-k01-*.png` / `after-k01-*.png`:
before = no window on either card; after = Planned Start + End on the project card under the
Deadline, and on the to-do card under Deadline.

## Done when

- [x] Both cards show the planned pair; nothing under the fork's `addons/` tree changed.
- [x] In Progress + deadline ⇒ the deadline is the end in force and the card shows it read-only.
- [x] The typed planned end survives a round trip through In Progress (test 04/05).
- [x] `end < start` refused with a message naming both dates.
- [x] Arabic strings exported and translated (see `i18n/`).
- [x] Tests green on `acczed_p20`.

## Deployment (2026-10-28)

The LAN box `DESKTOP-V8TPQ3U` now runs **Odoo 20.0 on a restored copy of `acczed_p20`** and serves this
feature: `http://192.168.1.17:8069/web/login?db=acczed_p20` (the box is on DHCP and moved from `.22`;
address it as `DESKTOP-V8TPQ3U.local`). The 19 tree and the 19 database are kept as
`C:\odoo-acczed-19` / `C:\acczed-addons-19` and DB `acczed` — a rollback, not an in-place migration.
Verified from this machine over HTTP, not from a shell on the box. Details and the four traps
(BOM in `odoo.conf`, `http_interface` now 127.0.0.1 by default in 20, a stray postmaster blocking the
service, services holding the code dir) are in `evidence/evidence.log`, and the deploy script now
takes `ACCZED_HOST` / `ACCZED_BRANCH` / `ACCZED_LAN_DB`.

## Risks / notes

- **The 19 stack is untouched on this machine.** `acczed` (19.0, production parity) still exists here;
  on the LAN box the 19 tree and DB are kept as the rollback described above.
- **A brand-new task is In Progress by default** (`state` default). The lock therefore keys on
  state *and* a deadline; a task without a deadline keeps its window editable — and that is
  also the answer for the 71-of-92 tasks that carried no deadline before the demo wipe.
- **The deadline is never blocked by the window.** Only `planned_date_end < planned_date_begin`
  is a hard error; a deadline earlier than the start renders in red instead of refusing the edit,
  because a deadline is a commitment the product should not veto.
- **`readonly` is presentation only.** The guard is `write()`; a view-only fix would be
  bypassed by any RPC write, which is the whole reason the rule lives in the model.
- **Measure the rendered box, not the screenshot.** Three of the four to-do layouts looked
  plausible in a screenshot and failed in the DOM: two widgets at `y=298` vs `y=358` in one
  "row" (wrapped), each 539px wide (`width:100%` from the to-do value column). The check that
  settles it is `~/.hermes/scripts/acczed-todo-window-geometry.js`: it compares the label x of
  Tags / Deadline / Planned Window, the row's right edge against its column, the y-span of the
  visible widgets, and document `scrollWidth - clientWidth` at 1280 / 1440 / 1920.
- **A field per grid cell is not a row.** Inside a `<group>`, each `<field>` becomes its own
  label/value cell; two of them read as two stacked inputs. A single line needs one wrapping
  `<div>` with `nolabel="1"` fields inside it — that is the shape both cards use.
- **Not in this task:** a calendar/Gantt view over the window (`<calendar date_start=…
  date_stop=…>` is Community-capable, `calendar_arch_parser.js:6,122-123`), and a kanban chip.
  Both are presentation on top of the same two fields — a later task can add them without a
  schema change.
