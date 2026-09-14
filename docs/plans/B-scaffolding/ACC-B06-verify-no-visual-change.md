# ACC-B06 — Verify the skeleton changed nothing visually

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`)|
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

## Result (2026-09-14) — negative control PASSES

Captured `after-b05-backend-home.png` (210155 B) and `after-b05-backend-list.png` (35558 B).

**A file-hash comparison says they differ** (210110 vs 210155 bytes). That comparison is wrong here —
see the method note below. The pixel diff says:

| Pair | Differing pixels | Bounding box |
|---|---|---|
| home | 72 / 1,600,000 (0.0045%) | `(1387,13)–(1584,87)` |
| list | 64 / 1,600,000 (0.0040%) | `(1387,13)–(1395,22)` |

Cropping that region shows the **only** difference is the unread-message badge in the systray going
**7 → 8**. Navbar, "YourCompany", avatar, "1-54 / 54" and the view switcher are pixel-identical.

- Accent re-read via `getComputedStyle`: **`rgb(113, 99, 158)` = `#71639e`** — unchanged, as required.
- `git status --short addons/web/` is **empty** — the fork tree is untouched.

## Risks / notes (added)

- ⚠️ **Do not use file hashes or byte counts for this control.** The systray carries live counters
  (unread messages, activities) that change between runs, so two captures of a *visually identical*
  UI legitimately differ by tens of bytes. A hash check reports a false failure every time.
  The real criterion is **"no differing pixel outside the dynamic systray"** — diff the pixels and
  inspect the bounding box.
- The negative control is only meaningful because ACC-A03's `before-*` pair was captured before any
  module existed. Do not recapture those.

---
← Phase B index: [../README.md](../README.md)
