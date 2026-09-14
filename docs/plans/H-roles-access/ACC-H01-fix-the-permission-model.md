# ACC-H01 — Fix the permission model and scope before building

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | — |
| **Estimated** | 2 hrs (decisions, no code) |
| **Touches** | `docs/plans/H-roles-access/` only |

## Goal

Write down what a "role" is, what an "action" is, and where each permission is enforced — so the console is built over Odoo's existing machinery instead of a parallel system that would have to re-enforce itself everywhere.

## Context (verified)

- `res.groups` is already a full role model: `name`, `user_ids`/`all_user_ids`, `model_access` (One2many `ir.model.access`, `copy=True`), `rule_groups` (`ir.rule`), `menu_access` (`ir.ui.menu`), `view_access` (`ir.ui.view`), `implied_ids`/`all_implied_ids`, `disjoint_ids`, `privilege_id`, `sequence`, `share` — `odoo/addons/base/models/res_groups.py:16-78`.
- `res.groups.privilege` groups roles under an app category (`name`, `description`, `placeholder`, `sequence`, `category_id`, `group_ids`) — `odoo/addons/base/models/res_groups_privilege.py:5-14`.
- Enforcement points that already exist: menus (`ir.ui.menu.group_ids`, `ir_ui_menu.py:29-31`), window actions (`ir.actions.act_window.group_ids`, `ir_actions.py:329`), server actions (`ir.actions.server.group_ids`, `ir_actions.py:661`), model CRUD (`ir.model.access`), row-level (`ir.rule`, groups field at `ir_rule.py:25`), and view features via the `groups=` attribute (the Blocked By tab is the living example, `addons/project/views/project_task_views.xml:518`).
- Live numbers in `acczed`: 24 groups, 355 `ir.model.access` rows, 111 `ir.rule` rows, 38 group-gated menus, 4 privileges.
- **Hard constraint:** permissions in Odoo are additive — ACLs and group record rules are a union across the user's groups, and only a *global* rule (no group) can subtract (`_compute_global`: `rule['global'] = not rule.groups`, `ir_rule.py:53-56`). There is no deny rule. A matrix UI must say so out loud.

## Steps

- [ ] **1. Decide and record: role = `res.groups` (optionally nested under a `res.groups.privilege`)**
  ```bash
  # rejected alternative: a parallel `acczed.role` model
  # why: every enforcement point (menus, actions, ACLs, rules, view groups) already speaks res.groups;
  a parallel model means re-implementing enforcement in every app
  ```
  → expected: one-line decision + the rejected alternative
- [ ] **2. Decide and record: "access right to a specific action" = which of the five enforcement points**
  ```bash
  1. menu visibility          -> ir.ui.menu.group_ids
  2. window action visibility -> ir.actions.act_window.group_ids
  3. server action visibility -> ir.actions.server.group_ids
  4. model CRUD              -> ir.model.access
  5. rows                    -> ir.rule  (+ view-level groups= for tabs/buttons)
  ```
  → expected: the console exposes exactly these five, nothing invented
- [ ] **3. Decide the additive-only policy**
  ```bash
  # the console may only GRANT (add group to menu/action/ACL) or REVOKE what it granted
  # it must never present a "deny" tick, because Odoo cannot express it
  ```
  → expected: stated in the UI copy and in ACC-H05/H06
- [ ] **4. Decide the no-lockout policy**
  ```bash
  # rules: you cannot remove the last role that grants access to the console itself;
  # you cannot revoke your own admin capability; every destructive change shows a "who loses what" preview
  ```
  → expected: guardrail list written down

## Verification

- All four decisions are written in this file with a one-line justification each.
- Each of the five enforcement points is traceable to a real field in the fork (`file:line` above).

## Done when

- [ ] Permission model recorded
- [ ] additive-only + no-lockout policies recorded
- [ ] open questions listed in README

## Risks / notes

- If a "deny" model is ever truly needed, the only Odoo-native way is a global rule, which affects *everyone* including admins — call it out before promising per-role denial.

---
← Phase table: [../README.md](../README.md)
