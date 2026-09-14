# ACC-F05 — Verify sign-in parity between site and backend

| Field | Value |
|---|---|
| **Phase** | F — Single token source + site copy parity |
| **Status** | ⏳ not started |
| **Depends on** | ACC-D02 |
| **Estimated** | 1 hr |
| **Touches** | `acczed-site/app/page.tsx`, `acczed_theme` login view |

## Goal

The "Sign in" click is the one place where marketing and product touch; it must not feel like leaving the product.

## Context (verified)

- Site link: `acczed-site/app/page.tsx:142` → `https://backend.acczed.online`.

## Steps

- [ ] **1. Click through and compare styling**
  ```bash
  # site -> Sign in -> login page: same green, same logo mark, same radius
  ```
  → expected: no visual jump
- [ ] **2. Check the round trip**
  ```bash
  # logout from the backend -> where do you land? decide: site or login page
  ```
  → expected: deliberate choice documented

## Verification

- Click-through captured as a two-frame screenshot.
- Colour/logo/radius match between site and login page.
- Post-logout destination is a deliberate, documented choice.

## Done when

- [ ] parity verified with evidence
- [ ] post-logout destination decided

---
← Phase F index: [../README.md](../README.md)
