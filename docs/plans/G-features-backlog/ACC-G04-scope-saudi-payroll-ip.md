# ACC-G04 — Scope the Saudi payroll module (product IP)

| Field | Value |
|---|---|
| **Phase** | G — Features backlog (parked by user) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-G03 |
| **Estimated** | user decision |
| **Touches** | `acczed-addons/acczed_sa_payroll/` (future) |

## Goal

No public module implements GOSI, end-of-service benefits and Saudization rules — that absence is the product's defensible asset, so it deserves a deliberate scope.

## Context (verified)

- Verified 2026-08-29: OCA has a payroll module for 19.0, but no public Saudi rules module.
- Site already lists Saudi payroll as `in the works` (`acczed-site/app/page.tsx:110-114`).

## Steps

- [ ] **1. List the rules in scope**
  ```bash
  # GOSI (employee/employer shares, caps), end-of-service accrual (years of service, resignation vs termination),
  # Saudization/Nitaqat ratios, wage protection (WPS) file, vacation/holiday rules
  ```
  → expected: explicit rule list with sources
- [ ] **2. Decide OCA-payroll base vs from scratch**
  ```bash
  # OCA payroll gives contracts/payslips; our module adds the KSA rule engine
  ```
  → expected: base chosen and documented
- [ ] **3. Write the module task files**
  ```bash
  # one ACC- task per rule group, same template, with golden-case tests
  ```
  → expected: testable tasks, not a wish list

## Verification

- Rule list documented with the legal basis for each.
- Base module chosen (OCA payroll vs custom) with rationale.
- Task files exist with concrete test cases.

## Done when

- [ ] payroll scope documented
- [ ] test cases identified per rule group

---
← Phase G index: [../README.md](../README.md)
