# ACC-A08 — Phase A acceptance check

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-A01..ACC-A07 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/` |

## Goal

Close the baseline phase only when the evidence set is complete and the repo is untouched.

## Context (verified)

- Rule: no code writes while the workspace is in planning mode; this phase may only produce documentation and screenshots.

## Steps

- [ ] **1. Count the evidence files**
  ```bash
  ls -1 docs/plans/evidence/
  ```
  → expected: before-login.png, before-login-prod.png, before-backend-home.png, before-backend-list.png, evidence.log, README.md
- [ ] **2. Confirm the repo is clean of code changes**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed && git status --short
  cd ~/Desktop/Projects/acczed-site && git status --short
  ```
  → expected: same as before the phase (no modified source file)
- [ ] **3. Mark every A task done in README**
  ```bash
  # set status to done in the phase table and in each task header
  ```
  → expected: phase A row = done

## Verification

- Four screenshots + evidence.log + evidence/README.md present.
- `git status` in both repos shows no source modification.
- README status column updated for every A task.

## Done when

- [ ] phase A table row = done
- [ ] every ACC-Axx header shows **Status** done

---
← Phase A index: [../README.md](../README.md)
