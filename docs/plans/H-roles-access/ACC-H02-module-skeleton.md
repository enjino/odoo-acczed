# ACC-H02 — Create the acczed_access module skeleton

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H01 |
| **Estimated** | 2 hrs |
| **Touches** | `acczed-addons/acczed_access/` (new module) |

## Goal

Stand up the console's module with its own group and a menu that is reachable **without developer mode** — the whole point of the feature.

## Context (verified)

- Today the Groups screen is hidden behind the technical group: `menuitem id="menu_action_res_groups" ... parent="base.menu_users" groups="base.group_no_one"` (`odoo/addons/base/views/res_groups_views.xml:154`), same for Privileges (`:50`), and the entire Technical menu (`odoo/addons/base/views/base_menus.xml:20`).
- Developer mode is what un-hides it: `ir.ui.menu._visible_menu_ids(debug)` discards `base.group_no_one` when `debug` is falsy (`odoo/addons/base/models/ir_ui_menu.py:74-79`).
- Verified in `acczed`: `admin` (uid 2) is **not** in `base.group_no_one` — so the Groups screen exists but he cannot reach it without dev mode.

## Steps

- [ ] **1. Create the module**
  ```bash
  acczed_access/__init__.py
  acczed_access/__manifest__.py   # name, version '19.0.0.1.0', depends: ['base','web','mail'], license LGPL-3, application: True
  acczed_access/models/__init__.py
  acczed_access/security/acczed_access_security.xml
  acczed_access/security/ir.model.access.csv
  ```
  → expected: module installs clean
- [ ] **2. Define the console's own group, deliberately NOT the technical one**
  ```bash
  <record id="group_access_manager" model="res.groups">
    <field name="name">Access Manager</field>
    <field name="comment">Can create roles and assign access rights.</field>
  </record>
  # granted to Settings/Administration (base.group_erp_manager) so admins get it by default
  ```
  → expected: a normal admin sees the menu without debug mode
- [ ] **3. Add a top-level menu + root action so the console has a home**
  ```bash
  menuitem id="menu_acczed_access" name="Access"  (visible to group_access_manager only)
  # also add a Settings shortcut: Settings -> Users & Companies -> Roles & Access
  ```
  → expected: menu appears for the group, hidden for others

## Verification

- `acczed_access` shows `installed` in SQL (`select name,state from ir_module_module where name='acczed_access';`).
- Log in as a user with only Administration rights (no dev mode): the Access menu is visible; a plain user does not see it.

## Done when

- [ ] module installed
- [ ] console menu reachable without developer mode
- [ ] ACL csv restricts the module's own models to group_access_manager

## Risks / notes

- Name collision: keep our group separate from Odoo's `base.group_system` so an accidental revoke cannot lock everyone out of settings.

---
← Phase table: [../README.md](../README.md)
