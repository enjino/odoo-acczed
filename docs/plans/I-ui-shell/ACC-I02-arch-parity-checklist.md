# ACC-I02 — Build the arch-parity checklist

| Field | Value |
|---|---|
| **Phase** | I — UI shell redesign |
| **Status** | ✅ done 2026-09-15 (checklist built from the live corpus; re-run the extraction after any module install) |
| **Depends on** | ACC-I01 |
| **Estimated** | 1.5 hrs |
| **Touches** | this file only (documentation) |

## Goal

Turn "our renderers must have feature parity with Odoo's" into a checklist with counts from the real corpus, so parity is measurable instead of asserted — and so an unsupported construct fails loudly instead of rendering plausibly and behaving wrong.

## Context (verified)

The UI is an interpreter of a grammar that is functionality. Apps write screens in that grammar: this DB
holds **655 installable modules — 42 installed, 613 uninstalled** (573 excluding the `test%` fixtures).
Measured on 2026-09-15 across `addons/*/views/*.xml` (`addons/*/wizard`, `addons/*/data` included for the
widget scan):

- **34,030 `<field>` nodes**, **231 distinct `widget=` values**, 2,982 `widget=` uses.
- Modifiers are **direct attributes** in Odoo 19: `invisible=` 7,011 · `readonly=` 1,600 · `required=` 662. **`attrs=` and `modifiers=` are both 0** — a renderer that only speaks the old `attrs` dict is speaking Odoo 16.
- Behavioural attributes: `domain=` 1,808 · `context=` 1,328 · `groups=` 2,519 · `optional=` 1,390 · `decoration-*` 746 · `editable=` 286 · `sum=` 156 · `default_order=` 87.
- Structure: `<group>` 1,883 · `<button>` 1,706 · `<list>` 588 · `<form>` 526 · `<sheet>` 356 · `<page>` 323 · `<header>` 178 · `<kanban>` 167 · `<notebook>` 124 · `<footer>` 91 · `<graph>` 65 · `<pivot>` 54 · `<calendar>` 24 · `<hierarchy>` 3.

> The counts come from a **raw-text scan**, not an XML parser: fast, reproducible, and a lower bound. They exist to size each construct and to catch regressions when modules install — they are not a parse of Odoo's schema.

## The checklist

Every row is a behaviour, not a style. **v1 policy is one of: `own` (we implement it), `fallback` (route this view to Odoo's renderer), `loud` (refuse the view and say so).** Silent degradation is never a policy.

### A. Modifiers and conditions — the silent-failure zone

| Construct | Count | What it is | v1 policy |
|---|---|---|---|
| `invisible=` | 7,011 | field hidden by condition | own |
| `readonly=` | 1,600 | field locked in this state | own |
| `required=` | 662 | field mandatory in this state | own |
| `groups=` | 2,519 | role gating, surfaced in UI | own (server already enforces) |
| `decoration-*` | 746 | row/card colour by condition | own |
| `editable=` (list inline) | 286 | list becomes a typeable grid | own |
| `domain=` | 1,808 | which records a many2one may offer | own |
| `context=` | 1,328 | how a related record opens | own |
| `optional=` | 1,390 | user-toggleable columns | own |
| `sum=` / `default_order=` | 156 / 87 | column aggregation, ordering | own |
| `attrs=` / `modifiers=` | **0** | legacy dict form | loud (out of scope; say so) |

### B. Structural tags

| Tag | Count | Notes | v1 policy |
|---|---|---|---|
| `field` | 34,030 | the vocabulary | own |
| `button` | 1,706 | actions, object/workflow calls | own |
| `group` | 1,883 | label/value layout | own |
| `list` | 588 | list arch | own |
| `form` | 526 | form arch | own |
| `sheet` | 356 | form paper area | own |
| `page` / `notebook` | 323 / 124 | form tabs | own |
| `header` / `footer` | 178 / 91 | statusbar row, action buttons | own |
| `kanban` | 167 | kanban arch | own (demand tier 3) |
| `graph` / `pivot` / `calendar` | 65 / 54 / 24 | analysis + scheduling | fallback in v1 |
| `hierarchy` | 3 | niche | fallback in v1 |

### C. Widget vocabulary — top values (broad scan: views + wizard + data)

| Widget | Uses | | Widget | Uses |
|---|---|---|---|---|
| `many2many_tags` | 389 | | `timesheet_uom` | 71 |
| `monetary` | 171 | | `many2one_uom` | 69 |
| `statinfo` | 157 | | `statusbar` | 67 |
| `handle` | 156 | | `boolean_toggle` | 66 |
| `many2one_avatar_user` | 152 | | `many2one_avatar_employee` | 56 |
| `radio` | 151 | | `color_picker` | 54 |
| `float_time` | 140 | | `upgrade_boolean` | 45 |
| `badge` | 99 | | `priority` | 40 |
| `image` | 91 | | `many2many_tax_tags` | 35 |
| `percentage` | 31 | | (`statinfo` also appears under a second spelling in the raw scan) | — |

`web` registers **101 field widgets** (`grep -rn 'registry.category("fields")\.add(' addons/web/static/src --include=*.js`); **272 files outside `web`** register their own. The widget list is therefore **open-ended**: a renderer must resolve widgets from the registry by name and treat an unknown one as `fallback`, never as a crash.

### D. The three surfaces that ARE the feature

| Surface | Why it is functional | v1 policy |
|---|---|---|
| Chatter (`mail.thread`) | the record's history, messages, activities — 15 `<chatter>` plus the mail field widgets | own |
| x2many inline editing | a nested engine with onchange round-trips to the server | own |
| Search/domain builder | constructs the `domain` the server evaluates | own |

### E. Server contract kept unchanged

`web_search_read(domain, specification, …)` (`addons/web/models/models.py:66`), `web_read(specification)` (`:109`), `web_read_group` (`:349`), `formatted_read_group` (`:802`), `onchange(values, field_names, fields_spec)` (`:1973`) — the client declares the shape of the screen and the server answers in it (`orm_service.js:336`). The new renderers declare the **same** specs. New server endpoints are a separate decision, not a side effect.

## Steps

- [x] **1. Extract the arch corpus** (re-run after installing modules; the numbers must move, the *policies* must not silently change)
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  for a in invisible= readonly= required= domain= context= groups= optional= decoration- editable= sum= default_order= attrs= modifiers= widget=; do
    printf "%-16s %s\n" "$a" "$(find addons/*/views -name '*.xml' -print0 | xargs -0 grep -hoE "$a" | wc -l)"
  done
  for t in list form kanban pivot graph calendar hierarchy group notebook page header sheet footer field button; do
    printf "%-10s %s\n" "$t" "$(find addons/*/views -name '*.xml' -print0 | xargs -0 grep -hoE "<$t[ >]" | wc -l)"
  done
  find addons/*/views addons/*/wizard addons/*/data -name '*.xml' -print0 \
    | xargs -0 grep -hoE 'widget="[a-zA-Z_0-9]+"' | sort | uniq -c | sort -rn | head -20
  ```
  → expected: the numbers in section A–C above
- [x] **2. Extract the widget registry corpus**
  ```bash
  grep -rn 'registry.category("fields")\.add(' addons/web/static/src --include=*.js | wc -l  # 101
  grep -rln 'registry.category("fields").add' addons/*/static/src | wc -l                    # 272
  ```
  → expected: 101 `.add()` registrations in web's src (102 raw matches of the looser pattern), 272 files elsewhere — proof the vocabulary is open-ended
- [ ] **3. Add a row for every construct an install introduces** that is not already listed (the checklist is append-only; a new construct gets a policy before its module is installed)

## Verification

- The section-A and section-B commands reproduce the recorded counts.
- Every row carries a policy of `own` / `fallback` / `loud` — grep-able, and the word "silent" appears nowhere as a policy.
- A reviewer can point at any installed app and say which of its arch constructs are `fallback` in v1.

## Done when

- [x] every construct with count > 0 in the corpus has a row and a policy
- [ ] the three `fallback` groups (graph/pivot/calendar/hierarchy, `attrs=`/`modifiers=`, unknown widgets) are reachable by a *switch*, proven in ACC-I05
- [ ] re-run after `account`/`stock`/`sale` are installed → policies unchanged or updated in writing

## Risks / notes

- **The corpus grows.** 573 non-test modules are off (613 uninstalled in total); installing `account` alone adds hundreds of views. The checklist is the reason a new construct is a written decision instead of a surprise in review.
- **Raw-text scan limitations:** counts are a lower bound (inherited views re-declare constructs; `addons/*/static/src/**/*.xml` OWL templates are not arch and are excluded on purpose). Do not quote these numbers as an XML parse.
- **`attrs=`/`modifiers=` = 0** is a fact about *this* corpus, not a promise about third-party modules on PyPI. Treat a third-party module speaking the legacy dict as `fallback`.

---

← Phase I index: [../README.md](../README.md)
