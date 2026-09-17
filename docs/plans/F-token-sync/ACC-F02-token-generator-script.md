# ACC-F02 — Generate both outputs from tokens.json

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ✅ done 2026-09-17 — **the site target**. The generator is live, guarded and proved; the Odoo target is ACC-F02b (parked behind ACC-C01 — phase C is ⏳) |
| **Depends on** | ACC-F01 |
| **Estimated** | 3 hrs |
| **Touches** | `acczed-addons/scripts/gen-tokens.mjs` |

## Goal

Make the drift impossible by machine: the site CSS block and the Odoo SCSS block are both generated.

## Context (verified)

- Constraint: `globals.css` is 285 lines of hand-written design with a `:root` block at the top — the generator must touch only the marked token region.
- The Odoo side is a variable file loaded after `primary_variables.scss` (ACC-C01).

## Steps

- [x] **1. Write the generator with marked regions**
  ```bash
  /* acczed:tokens:start */  ... generated ...  /* acczed:tokens:end */
  ```
  → expected: idempotent: running twice changes nothing
- [x] **2. Generate the targets** — site ✅ / Odoo ⏳ (ACC-F02b)
  ```bash
  node scripts/gen-tokens.mjs
  # writes: acczed-site/app/globals.css (:root region)
  #         acczed_theme/static/src/scss/_acczed_variables.scss   (ACC-C01's file — reverted 2026-09-17; recreated when phase C restarts)
  ```
  → expected: both files updated
- [x] **3. Guard against overwriting hand-written CSS**
  ```bash
  # the script must fail loudly if the markers are missing
  ```
  → expected: exit code 1 with a clear message

## Verification

- Running the generator twice produces no diff.
- Markers missing → script fails instead of clobbering the file.
- Both surfaces reflect a one-line change in tokens.json (see ACC-F03).

## Done when

- [x] generator committed and idempotent (`node scripts/gen-tokens.mjs` twice → `already in sync`)
- [x] marker safety verified by a deliberate failure test (markers stripped → `FAIL`, exit 1)

## Built (2026-09-17)

`acczed-addons/scripts/gen-tokens.mjs`, plus the marker pair wrapped around `globals.css`'s `:root`
block — **values untouched**: the generated region came out byte-identical to the hand-written block,
so the whole diff is the two marker lines.

| # | Run | Result |
|---|---|---|
| a | `node scripts/gen-tokens.mjs` (real target) | `ok — already in sync` — the hand-written block equals what `tokens.json` generates |
| b | drifted copy (`--css /tmp/…`, `--glow` hand-edited to `#ff00aa`) | `WRITE` — value restored to `#39d353` |
| b2 | same file, second run | `ok — already in sync` → **idempotent** |
| c | copy with the markers stripped | `FAIL — marker contract broken … found 0/0`, **exit 1** — it will not clobber a file it does not recognise |
| d | `--check` against a drifted file | `DRIFT … is not in sync with tokens.json`, **exit 1** — CI-usable |

**The Odoo target is deliberately not built here.** Which Odoo variable receives which token — and
what `danger`/`warning` resolve to, given the site palette has no red (ACC-C01's design says
`#d23f3a`; the reverted build used gold) — is a phase-C decision. A generator that answered it
silently would be making that call from phase F. Parked as **ACC-F02b**.

---

← Phase F index: [../README.md](../README.md)
