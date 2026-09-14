# ACC-B06 — Verify the skeleton changed nothing visually

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B05 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/evidence/` |

## Goal

Establish the negative control: after installing an empty module the UI must look identical to the ACC-A03 screenshots.

## Context (verified)

- Any pixel difference here means a structural mistake, not a styling choice.

## Steps

- [ ] **1. Re-screenshot the two backend screens**
  ```bash
  docs/plans/evidence/after-b05-backend-home.png
  docs/plans/evidence/after-b05-backend-list.png
  ```
  → expected: visually identical to the before-* pair
- [ ] **2. Diff the rendered accent colour**
  ```bash
  # devtools: primary button background
  # expected: still rgb(113,99,158)
  ```
  → expected: #71639e

## Verification

- Screenshots match the ACC-A03 pair.
- Accent hex unchanged.
- `git status` under `addons/web/` shows no modification.

## Done when

- [ ] negative control recorded
- [ ] no visual diff

---
← Phase B index: [../README.md](../README.md)
