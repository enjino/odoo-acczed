# ACC-F01 — Define tokens.json as the single source of truth

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ✅ done 2026-09-17 — `tokens.json` lives in `acczed-addons/` and the site's token block is now generated from it (ACC-F02) |
| **Depends on** | ACC-C01 |
| **Estimated** | 1 hr |
| **Touches** | `acczed-addons/tokens.json` |

## Goal

The two surfaces already drifted once (the site has a full dark palette, the backend had purple). One file, two generated outputs, no manual colour picking.

## Context (verified)

- Current palette lives only in `acczed-site/app/globals.css:2-17` (14 named values).
- The Odoo side needs the same values expressed as SCSS variables (ACC-C01 mapping table).

## Steps

- [x] **1. Create tokens.json with the 14 site values** — plus `fontStack`; see *Built*
  ```bash
  {
    "bg": "#0d1117", "bgSoft": "#101720", "bgCard": "#131a24",
    "border": "#1f2a37", "borderSoft": "#1a2330",
    "text": "#e6edf3", "textDim": "#8b98a9", "textFaint": "#5c6a7a",
    "glow": "#39d353", "glowSoft": "#7ee787", "teal": "#4ad3c9", "gold": "#e3b341",
    "radius": "14px", "font": "Inter"
  }
  ```
  → expected: valid JSON
- [x] **2. Document the mapping to both targets** — the table stays in ACC-C01's Steps (it is the design's, and C01 is ⏳)
  ```bash
  # keep the site-token -> Odoo-variable table in ACC-C01 in sync with this file
  ```
  → expected: one table, one source

## Verification

- tokens.json contains every value currently hardcoded in globals.css.
- The mapping table in ACC-C01 lists each token's Odoo variable.

## Done when

- [x] tokens.json committed (2026-09-17, `acczed-addons`)
- [x] mapping table consistent — ACC-C01's table names the Odoo variable for each token

## Built (2026-09-17)

`acczed-addons/tokens.json` carries the 15 keys the site hardcodes: the 12 colours, `radius`, and
**two font keys** — `font` (the family an Odoo variable will consume) and `fontStack` (the full CSS
stack the site consumes). The plan showed a single `"font": "Inter"`; splitting it is what the first
generated run demanded, because `globals.css` hardcodes the whole stack and re-inventing the
fallbacks inside a generator would hide a design decision in code.

The mapping table stays where the plan put it — ACC-C01's Steps. Nothing consumes it yet, because
ACC-C01 is ⏳ (reverted 2026-09-17) and the Odoo half of the generator is parked as ACC-F02b.

---

← Phase F index: [../README.md](../README.md)
