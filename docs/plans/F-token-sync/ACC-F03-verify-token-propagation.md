# ACC-F03 — Verify one token change reaches both surfaces

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started — **blocked**: the Odoo surface needs ACC-F02b, which waits for ACC-C01 (phase C ⏳ since 2026-09-17). The site half alone would prove nothing — the point is both surfaces at once |
| **Depends on** | ACC-F02, ACC-F02b |
| **Estimated** | 30 min |
| **Touches** | `docs/plans/evidence/` |

## Goal

The acceptance test for ACC-F02: change one value, regenerate, and see it in the marketing site and in the Odoo backend.

## Context (verified)

- This is the whole point of the phase — drift prevention has to be demonstrated, not assumed.

## Steps

- [ ] **1. Change glow to a test value, regenerate, screenshot both**
  ```bash
  # tokens.json: "glow": "#ff00aa"
  node scripts/gen-tokens.mjs
  # restart odoo with -u acczed_theme and reload both surfaces
  ```
  → expected: both show the test colour
- [ ] **2. Capture the pair**
  ```bash
  docs/plans/evidence/after-token-sync-site.png
  docs/plans/evidence/after-token-sync-odoo.png
  ```
  → expected: same colour in both images
- [ ] **3. Revert and regenerate**
  ```bash
  git diff   # in both repos: one coherent change each, then revert
  ```
  → expected: working tree clean again

## Verification

- Both screenshots show the test colour simultaneously.
- `git diff` shows exactly one generated region changed per repo.
- Revert leaves both repos clean.

## Done when

- [ ] propagation demonstrated with screenshots
- [ ] revert verified clean

---
← Phase F index: [../README.md](../README.md)
