# ACC-C01 — Map the site tokens onto Odoo SCSS variables

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
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

- [ ] **1. Write the variable file with the mapping**
  ```bash
  $o-community-color: #39d353;   $o-brand-primary: #39d353;   $o-action: #39d353;
  $o-webclient-background-color: #0d1117;   $o-view-background-color: #131a24;
  $o-main-text-color: #e6edf3;   $o-main-color-muted: #8b98a9;
  $o-border-radius: 14px;   $o-border-radius-lg: 14px;
  $o-theme-text-colors: ("info": #4ad3c9, "warning": #e3b341, "danger": #d23f3a, "success": #39d353);
  ```
  → expected: every site token has a named Odoo variable
- [ ] **2. Register it after primary_variables**
  ```bash
  'assets': {
      'web.assets_web': [
          ('after', 'web/static/src/scss/primary_variables.scss',
           'acczed_theme/static/src/scss/_acczed_variables.scss'),
      ],
  }
  ```
  → expected: manifest parses
- [ ] **3. Apply and check the log**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin -c odoo.conf -d acczed -u acczed_theme --stop-after-init
  bash run-odoo.sh stop && bash run-odoo.sh start
  bash run-odoo.sh logs | grep -iE "error|scss" | tail -5
  ```
  → expected: no SCSS error

## Verification

- Primary buttons and links render `#39d353`.
- Page background renders `#0d1117`, view/card background `#131a24`.
- No SCSS compilation error in `logs/odoo.log`.

## Done when

- [ ] variable layer in place and loaded after Odoo's own
- [ ] screenshot `after-c01-backend-home.png` captured

---
← Phase C index: [../README.md](../README.md)
