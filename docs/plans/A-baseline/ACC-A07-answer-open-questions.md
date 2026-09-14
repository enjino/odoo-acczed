# ACC-A07 — Answer the seven open questions

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-A06 |
| **Estimated** | 15 min |
| **Touches** | `docs/plans/README.md` |

## Goal

Convert the open decisions into written answers, because four of them change the implementation order or the deliverable itself.

## Context (verified)

- Open: logo source (SVG vs text), default colour scheme (always dark vs follow system), print/PDF appearance, whether to fix site copy or install accounting first, whether the marketing site itself becomes Arabic, single token source, first implementation scope.

## Steps

- [ ] **1. Put each question to the user and write the answer under it**
  ```bash
  # keep the question text, add: >> DECISION (2026-..-..): <answer>
  ```
  → expected: 7 answers, no question left open
- [ ] **2. Re-order phases if the answers require it**
  ```bash
  # e.g. if 'follow system' wins, ACC-C02 changes shape
  # if 'site copy first' wins, ACC-F04 moves before ACC-G03
  ```
  → expected: phase table updated consistently

## Verification

- Seven decisions recorded in README with dates.
- Phase table and dependencies match the decisions.

## Done when

- [ ] all seven questions answered in writing
- [ ] phase table reflects the answers

---
← Phase A index: [../README.md](../README.md)
