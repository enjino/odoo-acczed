# ACC-G01 — Decide the feature backlog and its order

| Field | Value |
|---|---|
| **Phase** | G — Features backlog (parked by user) |
| **Status** | ⏳ not started |
| **Depends on** | — |
| **Estimated** | user decision |
| **Touches** | `docs/plans/` (this file + README) |

## Goal

The functional/feature work is parked by the user's own choice; this task exists so the decision has a home and the structure is ready when it is taken.

## Context (verified)

- Source of options: `docs/enterprise-features-matrix.md` — 24 enterprise-only apps with effort estimates (S→XL), OCA availability and suggested priorities, plus Part C (path selection, phases, risks).
- Agreed rule from that document: if an app is revenue for acczed clients, build it custom (ownership, no per-user fees).

## Steps

- [ ] **1. Pick the first three features and write them here**
  ```bash
  # one line each: feature | module name | why now | effort (from the matrix)
  ```
  → expected: 3 named features
- [ ] **2. Open a task file per feature**
  ```bash
  # same template as this folder: ACC-<phase><NN>-<slug>.md with Goal / Context / Steps / Verification
  ```
  → expected: one file per feature, same shape as A–F

## Verification

- Three features chosen and written with effort estimates.
- Each has a task file following the ACC template.

## Done when

- [ ] backlog decided by the user
- [ ] task files created for the first three

---
← Phase G index: [../README.md](../README.md)
