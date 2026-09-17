# ACC-F02 — Generate both outputs from tokens.json

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started |
| **Depends on** | ACC-F01 |
| **Estimated** | 3 hrs |
| **Touches** | `acczed-addons/scripts/gen-tokens.mjs` |

## Goal

Make the drift impossible by machine: the site CSS block and the Odoo SCSS block are both generated.

## Context (verified)

- Constraint: `globals.css` is 285 lines of hand-written design with a `:root` block at the top — the generator must touch only the marked token region.
- The Odoo side is a variable file loaded after `primary_variables.scss` (ACC-C01).

## Steps

- [ ] **1. Write the generator with marked regions**
  ```bash
  /* acczed:tokens:start */  ... generated ...  /* acczed:tokens:end */
  ```
  → expected: idempotent: running twice changes nothing
- [ ] **2. Generate the two targets**
  ```bash
  node scripts/gen-tokens.mjs
  # writes: acczed-site/app/globals.css (:root region)
  #         acczed_theme/static/src/scss/_acczed_variables.scss   (ACC-C01's file — reverted 2026-09-17; recreated when phase C restarts)
  ```
  → expected: both files updated
- [ ] **3. Guard against overwriting hand-written CSS**
  ```bash
  # the script must fail loudly if the markers are missing
  ```
  → expected: exit code 1 with a clear message

## Verification

- Running the generator twice produces no diff.
- Markers missing → script fails instead of clobbering the file.
- Both surfaces reflect a one-line change in tokens.json (see ACC-F03).

## Done when

- [ ] generator committed and idempotent
- [ ] marker safety verified by a deliberate failure test

---
← Phase F index: [../README.md](../README.md)
