# ACC-H09 — Acceptance & escalation tests

| Field | Value |
|---|---|
| **Phase** | H — Roles & access console |
| **Status** | ⏳ not started |
| **Depends on** | ACC-H05, ACC-H06, ACC-H07 |
| **Estimated** | 1 day |
| **Touches** | `acczed-addons/acczed_access/tests/` |

## Goal

Prove the point of the console: a user without a role cannot reach the action — server-side, not because a menu was hidden.

## Context (verified)

- Hidden UI is not access control (settled in ACC-H05), so tests must act as the target user and call the model/route.
- Helpers: `new_test_user(env, login, groups=...)`, `with_user(user)`, `assertRaises(AccessError)`.
- Menu visibility is ormcached on `(group_ids, debug)` (`odoo/addons/base/models/ir_ui_menu.py:74`), so caches must be invalidated between grant and revoke.

## Steps

- [ ] **1. One positive/negative pair per enforcement point**
  ```bash
  # menu:   without role -> absent from load_menus; with role -> present
  # action: act_window reachable and the model behind it readable
  # model:  create/write/unlink as the unauthorized user -> AccessError
  # rows:   a group rule keeps records out of search, not merely out of the form
  ```
  → expected: all five enforcement points covered
- [ ] **2. Grant -> see -> revoke -> denied loop**
  ```bash
  grant the role, assert access, revoke, invalidate caches, assert denial again
  ```
  → expected: no stale rights survive a revoke
- [ ] **3. Lockout test**
  ```bash
  # attempt to strip the last Access-Manager role -> save refused, console still reachable
  ```
  → expected: the guardrail is proven by test, not by claim
- [ ] **4. Run it as the deliverable's gate**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed_test -i acczed_access --test-enable --stop-after-init
  ```
  → expected: green on a scratch database

## Verification

- `--test-enable` run passes on `acczed_test`.
- Removing one guardrail makes at least one test fail (mutation check).

## Done when

- [ ] tests merged for the five enforcement points
- [ ] grant/revoke loop proven
- [ ] lockout test proven

## Risks / notes

- Never run these tests against the live `acczed` DB — they write ACL rows. Use a scratch DB, the same discipline used before touching accounting.

---
← Phase table: [../README.md](../README.md)
