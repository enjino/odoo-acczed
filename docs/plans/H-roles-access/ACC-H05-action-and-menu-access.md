# ACC-H05 — Action & menu access editor (grant per role, with impact preview)

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H03, ACC-H04 |
| **Estimated** | 1-2 days |
| **Touches** | `acczed-addons/acczed_access/` (wizards, views) |

## Goal

The second half of the request: instead of "a role", the admin edits **what a role may do** — starting with menus and actions — and sees who is affected before saving.

## Context (verified)

- Menu visibility: `ir.ui.menu.group_ids` (`odoo/addons/base/models/ir_ui_menu.py:29-31`; rel table `ir_ui_menu_group_rel`).
- Window actions: `ir.actions.act_window.group_ids` (`odoo/addons/base/models/ir_actions.py:329`); server actions: `ir.actions.server.group_ids` (`:661`).
- 38 menus in `acczed` already carry group restrictions — the editor must show existing gates, not fight them.

## Steps

- [ ] **1. Role → actions screen: search, filter by app/privilege, tick what the role may open**
  ```bash
  # columns: Menu / Action name / Path (/odoo/<path>) / currently allowed for: <role list>
  # toggling adds/removes the role from ir_ui_menu.group_ids / act_window.group_ids
  ```
  → expected: tick = the menu appears for that role
- [ ] **2. Impact preview wizard (before writing)**
  ```bash
  # "Granting 'Reports' to Auditor affects 4 users; 2 of them gain 7 new menus."
  # "Revoking 'Sales' from Contributor removes access for 11 users."
  ```
  → expected: admin sees the blast radius first
- [ ] **3. No-lockout guardrail**
  ```bash
  # refuse a save that would remove every role able to reach the Access console itself,
  # and refuse changes that would strip base.group_system of Settings access
  ```
  → expected: a clear UserError, nothing written
- [ ] **4. Server-side proof, not just hidden menus**
  ```bash
  # every grant/revoke is verified by calling the action's model with a test user (read access),
  # because a hidden menu is not access control
  ```
  → expected: test in ACC-H09 fails before the ACL change, passes after

## Verification

- Grant a menu to a test role → the test user sees it after re-login; revoke → gone.
- The preview lists the correct affected users (compare against `res_groups_users_rel` + `all_implied_ids`).
- The no-lockout rule blocks a self-strip attempt.

## Done when

- [ ] menu/action grants editable per role
- [ ] impact preview shipped
- [ ] lockout guardrail tested

## Risks / notes

- Menu visibility is cached (`_visible_menu_ids` is ormcached on `(group_ids, debug)` — `ir_ui_menu.py:74`), so changes need cache invalidation to show immediately; verify across both Odoo processes (http + gevent).

---
← Phase table: [../README.md](../README.md)
