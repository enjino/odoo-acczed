# ACC-E05 — Arabic font stack: self-host it, and get reports off Odoo's CDN

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ✅ done 2026-09-15 — **re-scoped.** The task as written described a problem that did not exist and missed the one that did; see *Re-scope* below. |
| **Depends on** | ACC-E03 |
| **Estimated** | 3 hrs (actual: ~2 hrs, most of it reconnaissance) |
| **Touches** | `acczed_theme/static/src/scss/_acczed_fonts.scss` (new), `acczed_theme/static/src/fonts/*.ttf` (new), `acczed_theme/__manifest__.py` |

## Goal

Arabic text in a generated report must render from a font this instance serves itself. The product is
sold as self-hosted and data-sovereign; a report that reaches out to a third-party font CDN, or that
renders broken Arabic when that CDN is unreachable, contradicts both.

## Re-scope (2026-09-15)

Two independent premises in the original task were wrong, and correcting them moved the work.

| Original claim | Measured |
|---|---|
| Arabic "falls back to something heavy and generic" | The backend ships `…Arial, "Odoo Unicode Support Noto", sans-serif…` and Arabic resolves to the system's Noto Sans Arabic. **No third-party request** in the backend — verified, 0 of them. |
| Step 1: install `("Inter", "Noto Sans Arabic", …)` | The backend has **never used Inter**. Inter is the *marketing site's* face (baseline fact #1) and is not installed on this machine. Adding it is branding (phase D), not an Arabic fix — and would have repainted the backend, invalidating phase A's visual baseline. |

What the reconnaissance did find: **`web.report_assets_common` includes `web/static/fonts/fonts.scss`,
which declares the Arabic face at `https://fonts.odoocdn.com/fonts/noto/…`**
(`addons/web/static/fonts/fonts.scss:27-36`). Reported PDFs are rendered **server-side**, so an
unreachable CDN means broken Arabic in a generated document — a functional failure, not just a
sovereignty one. Measured on the served report bundle: **1 occurrence of `fonts.odoocdn.com`**;
the backend bundle has **0**.

**Side effect:** the fix lands in a new file scoped to the report bundle, so E05 no longer touches
`_acczed_variables.scss` — which **dissolves the E05/ACC-C01 ordering conflict** recorded in
`../README.md`. No decision on that was needed after all.

## Context (verified)

- `addons/web/static/fonts/fonts.scss:27-36` — the CDN Arabic `@font-face`, unicode-range
  `U+0600-06FF, U+0750-077F, U+08A0-08FF`. Same block also covers Cyrillic, Hebrew and Telugu.
- `…/reports/bootstrap_overridden_report.scss:17` — the report font stack, assigned with `!default`,
  so a value set earlier in the bundle wins. It calls `o-add-unicode-support-font(…, 1)`, and that
  helper hardcodes `'Odoo Unicode Support Noto'` (`addons/web/static/src/scss/utils.scss:216`).
- `…/reports/report.scss:16` — `font-family: $o-default-report-font`, i.e. `'Lato'`, which is why
  `fonts.scss` cannot simply be removed from the bundle: Lato is used by report bodies.
- `fonts.scss` sits in the `web.report_assets_common` bundle (`addons/web/__manifest__.py:256→309`),
  **not** in `web.assets_web` — which is why the backend is clean and reports are not.

## Steps

- [x] **1. Establish the red** · **done**
  ```bash
  # fetch a report page, take the bundle URL it links, and count third-party origins
  curl -s -b $J "http://localhost:8069/report/html/base.report_ir_model_overview/1" \
    | grep -o '/web/assets/[^"]*web.report_assets_common.autoprefixed.min.css'
  ```
  → **1 occurrence of `fonts.odoocdn.com`**; the backend bundle has 0.
- [x] **2. Rule out the obvious fix — by measurement, not assumption** · **done**
  Declaring a second `@font-face` with the same family, weight and unicode-range *later* in the bundle
  does **not** suppress the first. Measured in Chromium three times; the last two with a font that
  genuinely covers Arabic (the first two were invalid — a 404, then Lato, which has no Arabic glyphs).
  **The browser fetches both sources.** Odoo's declaration cannot be out-voted.
- [x] **3. Self-host the Arabic face and re-point the report stack** · **done**
  ```scss
  $acczed-arabic-font: 'acczed Arabic' !default;
  @font-face { font-family: $acczed-arabic-font; font-weight: 400;
               src: url('/acczed_theme/static/src/fonts/NotoSansArabic-Regular.ttf') format('truetype'); }
  @font-face { font-family: $acczed-arabic-font; font-weight: 700;
               src: url('/acczed_theme/static/src/fonts/NotoSansArabic-Bold.ttf') format('truetype'); }
  // set BEFORE bootstrap_overridden_report.scss, whose own value is `!default`
  $font-family-sans-serif: ($acczed-arabic-font, "Lucida Grande", Helvetica, Verdana, Arial, sans-serif) !default;
  ```
  Wired in `__manifest__.py` as
  `('before', 'web/static/src/webclient/actions/reports/bootstrap_overridden_report.scss', 'acczed_theme/static/src/scss/_acczed_fonts.scss')`.

  Fonts are the system's **Noto Sans Arabic** (SIL OFL, redistributable), copied into the module.

- [x] **4. Prove it, and prove the proof can fail** · **done** — see Verification.

## Verification

- **The report stack now resolves to our family, and nothing leaves the instance.**
  ```
  stack: "acczed Arabic", "Lucida Grande", Helvetica, Verdana, Arial, sans-serif
  resolves to our family: true   references Odoo Noto: false
  our arabic face loaded:  true
  off-instance requests:   0
  ```
- **Falsified against the unfixed state** — the fix was temporarily reverted, the module upgraded, and
  the guard re-run. It failed, and it failed on the real thing:
  ```
  stack: "Odoo Unicode Support Noto", "Lucida Grande", …, "Odoo Unicode Support Noto", sans-serif
  off-instance requests:   1
     font https://fonts.odoocdn.com/fonts/noto/NotoSansArabic-Reg.woff2
  MISMATCH … exit=1
  ```
  So this is a genuine red→green: **1 CDN request → 0**, with the request observed rather than inferred.
- `bash tools/verify-rtl.sh` → **11 passed, 0 failed** (seam 6 is this task).
- Screenshot: `docs/plans/evidence/after-e05-report.png`.

## Done when

- [x] Arabic font family in place — self-hosted `acczed Arabic`, Regular + Bold
- [x] self-hosted fonts, no CDN — 0 off-instance requests, measured in a browser
- [x] screenshots captured — `after-e05-report.png`; Arabic backend evidence is E03's
      `after-backend-ar-{list,form,kanban}.png` and the Latin side is `before-backend-home.png`

## Risks / notes

- ⚠️ **The guarantee is by non-reference, not by construction.** Odoo's CDN `@font-face` is still
  *declared* in the report bundle; it is simply never fetched because nothing references that family
  any more. If a future Odoo version references `'Odoo Unicode Support Noto'` from somewhere else in
  this bundle, **the leak returns silently**. That is precisely why seam 6 checks the browser rather
  than grepping the CSS for the URL — presence is expected, *use* is the failure.
- **Do not "fix" this by deleting `fonts.scss` from the bundle.** Report bodies use `'Lato'`
  (`report.scss:16`), so removing the file drops Lato from reports too — a visible regression.
- **Do not try appending an override.** Measured: the browser fetches both. This will look like it
  should work and will not.
- **Only Regular (400) and Bold (700) are self-hosted.** Odoo's CDN block covers five weights; a
  report asking for 100/300/900 Arabic will fall back to the system face. Acceptable for now —
  worth revisiting if a report style ever uses a light or black weight in Arabic.
- **Cyrillic, Hebrew and Telugu have the same CDN exposure** and were left alone. They are unreachable
  from this product today (only `en_US` and `ar_001` are active), but a future language activation
  re-opens exactly this issue for those scripts.
- **Font files are binary and committed.** 497 KB across two TTFs. Noto is SIL OFL, so
  redistribution is fine, but the licence text is not vendored alongside them.

---
← Phase E index: [../README.md](../README.md)
