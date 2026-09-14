# ACC-G02 — Choose build vs OCA vs subscription per app

| Field | Value |
|---|---|
| **Phase** | G — Features backlog (parked by user) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-G01 |
| **Estimated** | user decision |
| **Touches** | `docs/plans/` |

## Goal

Each missing app has three legal paths with very different costs; the choice must be written per app, not decided by accident.

## Context (verified)

- Paths: `SUBSCRIPTION` (Odoo Enterprise), `OCA` (free module, 19.0 branches verified for payroll/field-service/helpdesk/social/iot/knowledge/hr/web on 2026-08-29), `CUSTOM` (build in acczed-addons), `PARTIAL`.
- Constraint: an Enterprise subscription would bring back Odoo branding and its own `color_scheme()` override, colliding with ACC-C02.

## Steps

- [ ] **1. Write the chosen path next to each app in the matrix**
  ```bash
  # docs/enterprise-features-matrix.md: add a 'decision' column
  ```
  → expected: no app without a path
- [ ] **2. Record the licensing consequence of each choice**
  ```bash
  # OCA modules: review licence + quality before install
  # if OCA is used: add a fourth addons path (e.g. /opt/oca-addons) and pin per branch
  ```
  → expected: licence note per path

## Verification

- Every app in the matrix has a chosen path and a one-line justification.
- If OCA is chosen anywhere, the fourth addons path is documented in the runbook.

## Done when

- [ ] paths chosen for all apps in scope
- [ ] OCA path documented if used

---
← Phase G index: [../README.md](../README.md)
