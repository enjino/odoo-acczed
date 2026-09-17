# ACC-F02b — Generate the Odoo variable layer from tokens.json

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ parked 2026-09-17 — **blocked on ACC-C01** (phase C is ⏳ again after the 2026-09-17 revert) |
| **Depends on** | ACC-C01 |
| **Estimated** | 1 hr |
| **Touches** | `scripts/gen-tokens.mjs`, `acczed_theme/static/src/scss/_acczed_variables.scss` |

## Goal

Close ACC-F02's second half: `_acczed_variables.scss` stops being hand-written and becomes the
generated second target, so one token change reaches the backend the same way it already reaches the
site.

## Why it is not part of ACC-F02

The generator's machinery is built and proved (ACC-F02: markers, idempotency, the fail-loud guard,
`--check`). What is missing is a **decision**, not machinery — the token → Odoo-variable mapping and
the values behind `$o-theme-text-colors`. `danger` is the live example: ACC-C01's design text proposes
`#d23f3a`, the reverted 2026-09-15 build used gold `#e3b341` because the site palette has no red, and
that deviation is recorded in `evidence/evidence.log`. Answering it inside a phase-F generator would
take a phase-C decision by accident.

## Steps

- [ ] **1. ACC-C01 lands first, and its file carries the markers.** C01 writes
      `_acczed_variables.scss` with the same contract the site uses:
      `/* acczed:tokens:start */ … /* acczed:tokens:end */` around the token-derived assignments.
      Everything outside the markers stays hand-owned — the file header comment, and the pinned
      `$o-navbar-background` if that decision survives C01's redo.
- [ ] **2. Add the second target to the generator.** A `TARGETS` entry emitting the SCSS mapping from
      the same `tokens.json`; the emit function is the only new code — the marker guard, the `--check`
      mode and the failure behaviour are reused unchanged.
- [ ] **3. Prove it the way ACC-F02 proved the first target.**
  ```bash
  # drift one value in the copy, regenerate, read it back
  node scripts/gen-tokens.mjs            # expect: WRITE, both targets
  node scripts/gen-tokens.mjs            # expect: already in sync (idempotent)
  # strip the markers on a copy -> expect FAIL + exit 1, same message shape as the CSS target
  ```
  → expected: the SCSS region follows `tokens.json`, and a marker-less file is refused, not clobbered
- [ ] **4. Hand ACC-F03 its second surface.** With both targets generated, the propagation test
      (one token → two screenshots) runs end to end.

## Verification

- `node scripts/gen-tokens.mjs` rewrites both targets and is idempotent on both.
- A missing or malformed marker pair in the SCSS target exits 1 with the `FAIL — marker contract
  broken` message, exactly as the CSS target does.
- ACC-C01's own checks still pass afterwards: no SCSS error in `logs/odoo.log`, and the inherited
  direction audit (`grep` for hardcoded `left`/`right`) stays clean.

## Done when

- [ ] the SCSS target is generated, its markers are in place, and the guard is proved by a deliberate failure test
- [ ] ACC-F03 runs end to end on both surfaces

---

← Phase F index: [../README.md](../README.md)
