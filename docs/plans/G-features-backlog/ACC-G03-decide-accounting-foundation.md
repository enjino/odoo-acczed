# ACC-G03 — Decide the accounting foundation

| Field | Value |
|---|---|
| **Phase** | G — Features backlog (parked by user) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-G01 |
| **Estimated** | user decision |
| **Touches** | DB `acczed` + `docs/plans/` |

## Goal

The site's ZATCA and Saudi-chart-of-accounts claims hinge on this single decision, and the deployed database has no accounting module at all.

## Context (verified)

- Verified: `account`, `l10n_sa`, `l10n_sa_edi` are all `uninstalled` in `acczed`; the test database `mcp_test` does have `account` (so invoice RPC tools work there, not in acczed).
- Options: install community `account` + `l10n_sa` (+ ZATCA EDI) and build on it, or build a custom accounting layer, or subscribe to Enterprise accounting.

## Steps

- [ ] **1. Decide and record**
  ```bash
  # option A: install account + l10n_sa + l10n_sa_edi  -> ZATCA/chart claims become true
  # option B: custom accounting layer -> product IP, longer
  # option C: Enterprise accounting -> licensing + branding collision
  ```
  → expected: decision with rationale
- [ ] **2. If option A: install on a copy first and verify ZATCA readiness**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed_test -i account,l10n_sa,l10n_sa_edi --stop-after-init
  ```
  → expected: install clean on a scratch DB before touching acczed

## Verification

- Decision recorded with its consequence on the site copy (ACC-F04).
- If installing: verified on a scratch database first, never directly on `acczed`.

## Done when

- [ ] accounting foundation decided
- [ ] install rehearsed on a scratch DB if applicable

---
← Phase G index: [../README.md](../README.md)
