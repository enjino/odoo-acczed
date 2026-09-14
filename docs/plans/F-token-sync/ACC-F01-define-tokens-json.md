# ACC-F01 — Define tokens.json as the single source of truth

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started |
| **Depends on** | ACC-C01 |
| **Estimated** | 1 hr |
| **Touches** | `acczed-addons/tokens.json` |

## Goal

The two surfaces already drifted once (the site has a full dark palette, the backend had purple). One file, two generated outputs, no manual colour picking.

## Context (verified)

- Current palette lives only in `acczed-site/app/globals.css:2-17` (14 named values).
- The Odoo side needs the same values expressed as SCSS variables (ACC-C01 mapping table).

## Steps

- [ ] **1. Create tokens.json with the 14 values**
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
- [ ] **2. Document the mapping to both targets**
  ```bash
  # keep the site-token -> Odoo-variable table in ACC-C01 in sync with this file
  ```
  → expected: one table, one source

## Verification

- tokens.json contains every value currently hardcoded in globals.css.
- The mapping table in ACC-C01 lists each token's Odoo variable.

## Done when

- [ ] tokens.json committed
- [ ] mapping table consistent

---
← Phase F index: [../README.md](../README.md)
