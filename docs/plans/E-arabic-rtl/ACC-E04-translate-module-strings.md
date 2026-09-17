# ACC-E04 — Translate our own strings (i18n/ar.po)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ✅ done 2026-09-15 — **the mechanism, not a translation.** `acczed_theme` authors zero user-visible strings today (proved: a 0-byte POT), so there was nothing to translate. The check now exists and is wired into the harness; translating happens per-task under CONVENTIONS §8. |
| **Depends on** | ACC-E02 |
| **Estimated** | half a day |
| **Touches** | `acczed-addons/acczed_theme/i18n/ar.po` |

## Goal

Standard Odoo labels come with the Arabic translation; everything we invent has to be translated by us or it stays English inside an Arabic screen.

## Context (verified)

- Module translations live in `i18n/ar.po` inside each module.
- ⚠️ **This file originally said export/import use "the `--i18n-*` flags of odoo-bin". That is Odoo ≤18
  syntax and it does not work on this fork.** Measured 2026-09-15:
  `odoo-bin ... --i18n-export=… ` → `error: no such option: --i18n-export`. Odoo 19 moved i18n to a
  **subcommand** (`odoo/cli/i18n.py`):
  ```bash
  odoo-bin i18n export -c odoo.conf -d acczed -l pot -o /tmp/x.pot acczed_theme
  odoo-bin i18n export -c odoo.conf -d acczed -l ar  -o /tmp/x.po  acczed_theme
  odoo-bin i18n import -c odoo.conf -d acczed -l ar -w my.po
  ```
  `-l` takes a **locale, not an Odoo code**: for `ar_001` that is `ar` (`res_lang.iso_code`), because
  the CLI's own help directs you to `SELECT iso_code FROM res_lang`. The old `--i18n-overwrite` option
  still exists (`tools/config.py:409`) but errors unless combined with `-u`.

## Steps

- [x] **1. Generate the POT from the installed module** · **done 2026-09-15 — and it is empty**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python odoo-bin i18n export \
    -c odoo.conf -d acczed -l pot -o /tmp/acczed_theme.pot acczed_theme
  ```
  → expected: a POT file · **actual: `WARNING odoo.cli.i18n: No translatable terms were found in
  ['acczed_theme']` and a 0-byte file.** Confirmed independently by grep: no `_(`, `string=`, `t-out`,
  `title=`, `help=` or `placeholder=` anywhere in the module. `models/__init__.py` is empty and
  `brand_templates.xml` is a placeholder comment.
- [x] **2. Provide the check, rather than a translation** · **done 2026-09-15**
  ```bash
  bash tools/verify-rtl.sh --check 5     # seam 5
  python3 tools/i18n-coverage.py --selftest
  ```
  → `tools/i18n-coverage.py` compares the POT against the `ar` export and fails, naming the terms,
  when any authored string lacks a translation. Wired into the harness as seam 5.
- [ ] **3. Translate, when there is something to translate** · **deferred by design**
  ```bash
  # the first authored strings arrive with phase D (branding: title, login page, company, mail)
  odoo-bin i18n import -c odoo.conf -d acczed -l ar -w acczed_theme/i18n/ar.po
  ```
  → whoever adds the first user-visible string in `acczed_theme` owns translating it, per CONVENTIONS §8.

## Verification

- `i18n/ar.po` exists in the module and is loaded. **Not yet applicable — no file, because no terms.**
- No English text we authored appears in the Arabic UI. **Vacuously true today:** there is no text we
  authored. This becomes a real claim the moment phase D adds any.
- Arabic terminology is consistent (financial terms reviewed). **Not applicable yet.**
- **The check itself is proven able to fail** — the part that matters, since a check that has never
  been seen to fail is indistinguishable from one that cannot:
  ```bash
  python3 tools/i18n-coverage.py --selftest
  # 7 fixtures: empty(vacuous), translated, untranslated, partial, full, multi-line x2
  # → "all fixtures behaved as expected"
  ```
  Three of the seven expect exit 1 — an untranslated term, partial coverage, and an untranslated
  multi-line msgid. The harness also reports the real module as **VACUOUS, "not a pass"**, rather than
  letting an empty module read as a green tick.

## Done when

- [x] the mechanism exists, is wired into the harness, and is proven falsifiable
- [x] the stale `--i18n-*` commands are corrected to Odoo 19 syntax
- [ ] **`i18n/ar.po` committed — deferred; it would be an empty file today.** Re-open this box with
      phase D, which is the first task group to author user-visible strings.

## Correction (2026-09-15, found by ACC-C04)

**The check built here could not see a code-string translation.** ACC-C04 authored the module's first
user-visible strings (two JS labels) and supplied correct Arabic in `i18n/ar.po` — the module loaded it
(`loading translation file …/i18n/ar.po for language ar_001`) — and this guard still reported both as
untranslated. It would have done so **permanently**, whatever the `.po` said.

Why: the check compared the POT against `odoo-bin i18n export -l ar`, and that export reads a
**database cursor** (`odoo/tools/translate.py:1049`). Odoo 19 does not keep strings authored in JS or
QWeb in the database — it serves them from the module's `.po` at runtime
(`odoo/tools/translate.py:1858-1881`, `CodeTranslations`). Measured directly:

```
Display Name        → اسم العرض      exported fine (DB-backed)
HTTP Routing        → مسار HTTP      exported fine (DB-backed)
ID                  → المُعرف        exported fine (DB-backed)
Switch to dark mode → ""             ALWAYS empty (file-backed)
Switch to light mode → ""            ALWAYS empty (file-backed)
```

The guard only ever appeared to work because the module authored zero terms when it was written — and
then it *did* correctly catch the two new strings, which made it look healthy right up to the point
where no translation could satisfy it.

**Fixed 2026-09-15 — then removed 2026-09-17**, with the reverted phase-C implementation: the third
source (in `tools/i18n-coverage.py` and `verify-rtl.sh`) went with the `i18n/ar.po` it read. The module
authors no user-visible strings again — the harness reports `0 authored terms — nothing to translate yet
(vacuous, not a pass)` — so the two-source check is correct as it stands. The fix itself stays readable at
`8f8406bd` in this repo's history: **re-apply it the moment the module next authors a JS or QWeb string**,
which phase D is the first group expected to do. Before removal it was re-verified — the 7 self-test
fixtures behaved, the module reported `all 5 authored terms translated`, and a missing third source
failed again (2/5 untranslated).

**The lesson:** a check that has only ever been run against an empty input is not a working check, even
when it later reports the right answer once. This one had a self-test with three deliberately failing
fixtures — and still shipped a defect, because the fixtures exercised the *comparison* rather than the
*plumbing that feeds it*. ACC-C04 is what exercised the plumbing.

## Risks / notes

- ⚠️ **Do not tick this task as "Arabic translation done".** What closed is the *mechanism*. No string
  has been translated because none exists, and the module is still an empty skeleton (ACC-B06
  established it changes nothing visually). The status line says so deliberately.
- **Why the gap was invisible:** with no authored strings, "no English text we authored appears in the
  Arabic UI" is true for a reason that has nothing to do with translation quality. That is exactly the
  false-comfort pattern the ACC-A06 audit was written to catch, so it is recorded here rather than
  quietly passed.
- **`-l` takes a locale, not an Odoo language code.** `ar_001` is `ar` to the CLI. Using the Odoo code
  silently produces an empty export rather than an error.
- **Term extraction is Odoo's, not ours.** The check reads the POT from `i18n export` rather than
  grepping sources, so its definition of "translatable" cannot drift from Odoo's.

---
← Phase E index: [../README.md](../README.md)
