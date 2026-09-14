# ACC-H07 — Role assignment + effective-permissions inspector

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H03 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/` (views, wizards) |

## Goal

Close the loop: put users into roles, and answer the question audit clients actually ask — "what exactly can this person do right now?" — before and after a change.

## Context (verified)

- `res.groups.user_ids` is explicit membership; `all_user_ids` also counts users who inherit the role through `implied_ids` (`odoo/addons/base/models/res_groups.py:17-21`).
- Roles also arrive implicitly (`base.group_user` and friends imply others), so explicit membership is never the whole answer; `disjoint_ids` marks roles that must not be held together.

## Steps

- [ ] **1. Users ↔ roles screen**
  ```bash
  # from a user: tick roles; inherited ones shown greyed with their source
  # from a role: add/remove users (writes res_groups_users_rel)
  ```
  → expected: assignment works in both directions
- [ ] **2. Effective-permissions inspector**
  ```bash
  # input: user -> per-model read/write/create/unlink (union of all groups)
  # plus menu/action list, plus the record rules that apply, plus the source of every right
  ```
  → expected: one screen answers 'why can this user do this?'
- [ ] **3. Respect disjoint_ids and keep share groups out**
  ```bash
  # refuse assigning two disjoint roles; hide portal/public share groups from the console's role list
  ```
  → expected: no contradictory role combinations
- [ ] **4. Snapshot + compare**
  ```bash
  # before/after diff of a user's effective rights when a role changes (feeds the ACC-H05 preview)
  # CSV export so the diff can go into an audit file
  ```
  → expected: a permission change can be evidenced, not just made

## Verification

- Assign a role to a test user → the inspector shows the new rights with their source.
- A role inherited through `implied_ids` is not double-counted in the union.
- A disjoint pair raises a clean error instead of saving.

## Done when

- [ ] assignment both ways
- [ ] effective-permissions view with sources
- [ ] before/after diff + CSV export

## Risks / notes

- Effective rights must be computed through the same paths Odoo uses at request time (`has_group`, `ir.model.access.check`) — a hand-rolled approximation will disagree with reality on edge cases.

---
← Phase table: [../README.md](../README.md)
