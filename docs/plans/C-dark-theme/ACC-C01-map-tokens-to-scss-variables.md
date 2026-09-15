# ACC-C01 — Map the site tokens onto Odoo SCSS variables

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ✅ done 2026-09-15 — surfaces, text and buttons repaint from the token layer; guard falsified |
| **Depends on** | ACC-B05 |
| **Estimated** | 45 min |
| **Touches** | `acczed-addons/acczed_theme/static/src/scss/_acczed_variables.scss` (new), `__manifest__.py` |

## Goal

Repaint the whole backend from one variable layer instead of styling component by component, using the Dark Space Botanical palette as the source of truth.

## Context (verified)

- Site palette: `--bg #0d1117`, `--bg-soft #101720`, `--bg-card #131a24`, `--border #1f2a37`, `--border-soft #1a2330`, `--text #e6edf3`, `--text-dim #8b98a9`, `--glow #39d353`, `--glow-soft #7ee787`, `--teal #4ad3c9`, `--gold #e3b341`, `--radius 14px` (`acczed-site/app/globals.css:2-17`).
- Odoo entry points: `$o-community-color` → `$o-brand-primary` → `$o-action` (`addons/web/static/src/scss/primary_variables.scss:73-83`), `$o-webclient-background-color` (`secondary_variables.scss:1`), `$o-view-background-color` (`primary_variables.scss:136`), `$o-main-text-color` (`:120`), `$o-border-radius` (`:218`).
- Asset directive syntax in Odoo 19 is `('after', '<file>', '<file>')` — see `addons/html_editor/__manifest__.py:23` and `addons/onboarding/__manifest__.py:27`.

## Steps

- [x] **1. Write the variable file with the mapping** · **done** —
      `acczed_theme/static/src/scss/_acczed_variables.scss`
  ```scss
  $o-community-color: #39d353;   $o-brand-primary: #39d353;   $o-action: #39d353;
  $o-webclient-background-color: #0d1117;   $o-view-background-color: #131a24;
  $o-main-text-color: #e6edf3;   $o-main-color-muted: #8b98a9;
  $o-border-radius: 14px;   $o-border-radius-lg: 14px;
  $o-navbar-background: #101720;            // NOT in the task's list; see below
  $o-theme-text-colors: ("info": #4ad3c9, "warning": #e3b341, "danger": #e3b341, "success": #39d353);
  ```
  Two deviations from the task's text, both forced:
  - `$o-navbar-background` was added. The navbar derives from the brand colour
    (`navbar.variables.scss:7`), so without this the navbar turns **bright green** — not the site's
    look, where the green is a glow rather than a surface.
  - `danger` is `#e3b341` (the site's gold), not the `#d23f3a` this task originally proposed. The
    site palette has no red; see the decision recorded in the file.
- [x] **2. Register it after primary_variables** · **done** — `('after', …)` in `web.assets_web`
- [x] **3. Apply and check the log** · **done** — no SCSS error, verified in the *served bundle*
      rather than only in `logs/odoo.log`

## The button problem (the substance of this task)

Step 1's mapping repainted the surfaces and text but left every button **Odoo purple**. Three
explanations were tried and measured before the right one was found; the first two are recorded in the
file so nobody repeats them:

| Attempt | Result |
|---|---|
| Set `$o-brand-primary` / `$primary` | Surfaces repaint, `$primary` compiles to `#39d353`, buttons stay `#71639e` |
| Merge `$theme-colors` | **Hard SCSS error** — `Undefined variable: $theme-colors`. `pre_variables.scss`, which builds it, loads **after** module variable files despite its name. Odoo renders the error *into* the bundle, and every later line in the file silently stops applying |
| Merge `$o-btns-bs-override` | ✅ This is the lever |

Why: Odoo deliberately stops Bootstrap generating button variants — `import_bootstrap.scss:29-35`
empties `$theme-colors` right before `@import "buttons"` — and emits them itself from
`$o-btns-bs-override` (`bootstrap_review_backend.scss:15-31`). That map is built in
`primary_variables.scss:231-245` reading `$o-brand-primary` at a point where it is still purple.

**Contrast fix.** The first working version had white on `#39d353` — roughly **1.75:1**, far below
WCAG's 4.5:1. Button text is now `#0d1117`, about **12:1**. Note the site's own `.btn-primary` is not
a solid green button at all: it is a translucent green gradient on the dark card with *light* text
(`globals.css:107-112`). Reproducing that is **ACC-C05's** job, and this interim solid treatment is
expected to be replaced there.

## Verification

- **`node tools/theme-check.js` → 6/6 ok.** The seam for phase C: computed colours in a real browser,
  compared against literals taken from `acczed-site/app/globals.css:2-17` — not recomputed from the
  SCSS, so the check can disagree with the code.

  | | expected | |
  |---|---|---|
  | body background | `rgb(13, 17, 23)` | #0d1117 --bg |
  | body text | `rgb(230, 237, 243)` | #e6edf3 --text |
  | navbar background | `rgb(16, 23, 32)` | #101720 --bg-soft |
  | primary button bg | `rgb(57, 211, 83)` | #39d353 --glow |
  | primary button fg | `rgb(13, 17, 23)` | 12:1 contrast |
  | SCSS error in bundle | none | catches the silent failure above |

- **Falsified.** With the token layer removed from the bundle and the module upgraded, the guard
  fails **all five** colour assertions and exits 1 — so it is not passing by construction. Restored
  and re-verified green.
- No SCSS compilation error in `logs/odoo.log`.

## Done when

- [x] variable layer in place and loaded after Odoo's own
- [x] screenshot `after-c01-backend-home.png` captured
- [x] **direction audit clean** — inherited from ACC-E03:
  ```bash
  cd ~/Desktop/Projects/acczed-addons && grep -rn "left:\|right:\|margin-left\|margin-right\|padding-left\|padding-right" acczed_theme/static/src/scss/ | grep -v "rtl:ignore"
  ```
  → **clean.** The variable layer contains no directional properties, so `rtlcss` has nothing to
  mirror into the wrong place. This matters because `rtlcss` flips physical properties but cannot
  guess intent (ACC-E01).

## Risks / notes

- ⚠️ **`pre_variables.scss` loads AFTER module variable files.** A module file inserted "after
  primary_variables" cannot see `$theme-colors`, `$primary` or anything else pre_variables defines.
  Referencing one is a hard error that Odoo renders *into the served CSS* — the page still mostly
  paints, so it presents as "my variable was ignored" rather than as a failure.
- **A green navbar is the default trap.** Anything that sets the brand colour also sets the navbar
  background unless `$o-navbar-background` is pinned separately.
- **Border colours are not covered.** The list view's row borders still compile to Bootstrap's
  `rgb(222, 226, 230)` — a light grey on a dark surface. Not in this task's mapping; expected to be
  handled in ACC-C03 ("style what variables cannot reach"), and it is the most visible remaining
  light-theme artifact.

---
← Phase C index: [../README.md](../README.md)
