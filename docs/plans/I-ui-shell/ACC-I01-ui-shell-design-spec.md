# ACC-I01 — Write the UI shell design spec

| Field | Value |
|---|---|
| **Phase** | I — UI shell redesign |
| **Status** | 🚧 in progress (written 2026-09-15; **D1 and D5 resolved** — frozen when D2/D3/D4 close at ACC-I04) |
| **Depends on** | — (records the 2026-09-15 decisions) |
| **Estimated** | 2 hrs |
| **Touches** | this file, `docs/plans/README.md` |

## Goal

Fix the shape of the redesign in writing — navigation paradigm, layout contract, surfaces owned, identity — so implementation tasks can be written from it and no renderer is built on an unstated assumption.

## Context (verified)

**What the redesign is not.** ACC-C01…C04 recolour: one SCSS file of 46 hex literals re-pointed Odoo's colour variables at the site palette (`acczed-addons/acczed_theme/static/src/scss/_acczed_variables.scss` — **reverted 2026-09-17**, so the file no longer exists and phase C is ⏳ again). No layout, no structure, no components. Phase C's gate never mentions layout (`docs/plans/README.md:42`). This phase is **re-layout**: OWL templates, own components, a different navigation paradigm.

**The shell is three components, and that is the seam:**

```xml
<t t-name="web.WebClient">
    <t t-if="!state.fullscreen"><NavBar/></t>
    <ActionContainer/>
    <MainComponentsContainer/>
</t>
```
`addons/web/static/src/webclient/webclient.xml:4-9`

**Replacing framework surfaces is an established pattern, not a hack** — 188 primary-mode `t-inherit` overrides exist in-tree, including `web.ListRenderer`, `web.KanbanRenderer`, `web.FormView`, `web.GraphRenderer`, `web.SearchPanel`, `web.CalendarCommonRendererHeader`.

**Cost, measured 2026-09-15:**

| Layer | Size |
|---|---|
| 8 view renderers | 34,050 LOC JS — list 3,907 · calendar 3,363 · kanban 3,121 · pivot 2,194 · form 2,043 · graph 1,697 |
| Field layer all renderers instantiate | 13,487 LOC, 98 files, 70 of them Components |
| Test net currently guarding it | 227,808 LOC in `addons/web/static/tests` — it tests *Odoo's* renderers; owning ours means rebuilding the net (6.7 × the code it protects) |

**Four constraints this codebase imposes:**

1. **Horizontal budget.** Form views carry a right-hand chatter (~30% width); list views run 20+ columns. A 280px sidebar on a 1366px laptop — narrowing to 172px with chatter open — leaves a work area of roughly 700–800px.
2. **Menus scale 4×.** 143 menu rows with only **42 of 655 installable modules** installed. `account`/`stock`/`sale`/`crm` push past 600. A tree that works at 143 and fails at 600 fails in the real product.
3. **Notion's best bits have no data behind them.** Favourites, recents and a ⌘K palette are why Notion's sidebar works. Odoo has **no pinned/recents concept for menus** — `menu_service.js` is a read-only fetch of `/web/webclient/load_menus` (`addons/web/static/src/webclient/menus/menu_service.js:5,70-71`).
4. **Every view renders its own control panel.** `addons/web/static/src/search/control_panel/control_panel.js:90`, `addons/web/static/src/search/breadcrumbs/breadcrumbs.js:6`. "Own the shell" and "own the views" are not separable — which is why owning all renderers is coherent.

**Decisions taken by the user, 2026-09-15 (this session's round):**

| # | Decision |
|---|---|
| 1 | **Full UI redesign**, not a recolour — new navigation model, own components, departs from Odoo's layout paradigm |
| 2 | **Own all renderers** — no Odoo view is left un-owned |
| 3 | **Navigation paradigm: a persistent left side menu, Figma/Notion-style** — refined twice the same day: first a rail + panel, then **one sidebar, no rail** (D1) |
| 4 | **Marketing site keeps its layout** — only its tokens follow the theme |
| 5 | **Design spec + mockups before any code** — matches the DAC+S methodology |
| 6 | **Reference design language: VS Code's workbench** — sidebar + command centre, compact density, CSS-var-driven geometry (metrics read from the VS Code source, §7) |
| 7 | **Sections group apps, admin-authored, company-wide, visual only** — no permission semantics; the sidebar stays menus-only, no business records in it (**D5**) |
| 8 | **Shape (D1): ONE sidebar** — collapsible section headings → apps (icon + label) → each app's menu tree expanding inline. **No separate icon rail**: removed 2026-09-15 because it cost 48px of permanent width and one extra click (section → app → entry) for a benefit the sidebar already provides |

## The design

### 1. Navigation paradigm — one sidebar, sections as headings

**Resolved 2026-09-15, revised the same day (D1 + D5).** A single left sidebar and nothing to its left:

| Layer | What it shows | Source of truth |
|---|---|---|
| **Section headings** | the sections — 5–6 of them, as collapsible uppercase headings (`FINANCE`, `SALES & MARKETING`, …) | new data: admin-authored sections (§4) |
| **Apps** | one row per app under its heading — icon **+ label**, with its menu-item count; recent apps pinned at the top | `getApps()` (`menu_service.js:71`) + `web_icon`/`web_icon_data` (`ir_ui_menu.py:34,41`) |
| **Menu trees** | each app's tree **expands inline** under its own row | `getMenu(id).children` — hierarchical via `parent_id`, **143 rows today** |

- **Click depth stays 2** (app → entry), the same as Odoo today: a section is a heading, not a place you enter, so it costs no click.
- **Why there is no icon rail** (recorded, because it was designed and then removed on 2026-09-15): a second navigation column cost 48px of permanent width *and* one extra click (section → app → entry) for a benefit the sidebar already provides. The rail's one real job was surviving a collapsed sidebar — and a rail-less sidebar covers that by **narrowing instead of disappearing** (§2). It would also have needed 5–6 section icons designed from scratch, since it could not borrow the apps' own artwork.
- **Labels do the work, not icons:** icon-only navigation stops being legible past roughly 8–10 items, and Odoo's app icons are inconsistent module artwork (`mail/icon.png`, `project/icon.png`, `project_todo/icon.png` — and `base` ships **no** icon files at all, verified 2026-09-15). With 20+ apps, labels are load-bearing, and labels live in the sidebar.

**What the sidebar is for, and what its headings are not:**

- **It is the whole navigation.** One column answers both *"which app?"* and *"which screen?"* — 280px default, 236 compact, **172 at the squeeze** (§2), and hidable by the user through the ☰ toggle.
- **Headings group; they do not gate.** A section heading is a collapsible label over its apps: it costs a fold, nothing else, and no permission rides on it (D5 — grouping and order only).
- **Not per-user.** Sections are company-wide and admin-authored; only the **Recent** group at the top is personal (D3).
- **Not the systray or the user menu** — those stay in the top bar.
- **Not icons.** Sections carry no icon of their own (the rail that would have needed them is gone); apps keep their own artwork beside their label.

**What the left menu actually holds today** (verified 2026-09-15 against the `acczed` DB — this is the data the mockups must render, not an abstraction):

| Root app | Menus below | Gated? |
|---|---|---|
| Settings | **102** (71% of the whole forest — mostly `Settings ▸ Technical`) | partly |
| Project | 19 | yes (3 roles) |
| Discuss | 11 | — |
| Apps | 9 | — |
| To-do | 1 (leaf root) | — |
| Tests | 1 (leaf root) | — |

- **143 menus total**: 6 roots, then 20 / 44 / 73 at depths 1 / 2 / 3 — every root has an icon (`mail`, `project_todo`, `project`, `base/…`) and **Arabic labels already exist** (`المناقشة`, `المشروع`, `الإعدادات`), so stages 2 and 3 render RTL today.
- **38 of 143 are group-restricted** (largest gate: *Technical Features* → 27 menus, i.e. developer mode); **105 are unrestricted**. The client already receives a per-user filtered tree from `load_menus`, so "what's on the left" differs by role.
- **34 of 143 entries are containers** — no action, they only open a submenu. 103 point at a window action, 4 at a client action, 2 at a URL.
- **15 labels are duplicated** — `Projects` ×4, `Discuss` ×3, `Settings` ×2, `Apps` ×2, `Technical` ×2, `Configuration` ×2 … ⇒ **the sidebar cannot key on the label**; identity is `id` + path, and the panel will show visually identical siblings.
- **The sidebar is nearly empty of business apps today** — `account`, `sale`, `stock`, `crm` are all uninstalled, so Accounting/Sales/Inventory have no menus at all. 6 apps now; ~20+ and 600+ menus once the business modules land (the ACC-I04 stress state).

### 2. Layout contract

The shell owns four regions:

- **Sidebar** — the section headings, their apps and the menu trees in one column, inside the existing fullscreen escape, beside `NavBar` (`webclient.xml:4-5`).
- **Top bar** — breadcrumb home. ⚠️ Today breadcrumbs are rendered per-view inside `ControlPanel`; moving them into the shell is a re-architecture of every view's top strip, not styling.
- **Action area** — Odoo's `ActionContainer` continues to host views, or is replaced as part of owning the renderers (decision at ACC-I04/I05).
- **Fullscreen** — unchanged escape hatch; the sidebar lane must not render in fullscreen states.

**Expansion is inline:** clicking an app expands its menu tree under its own row; sections fold and apps expand, so the sidebar is one scrollable accordion. At 172px the app labels ellipsise but the counts survive, which keeps a squeezed sidebar navigable.

### 3. Surfaces owned

All 8 renderers (list, form, kanban, pivot, graph, calendar, activity, hierarchy) plus the shell and the field layer they instantiate. **Ship in measured demand order**, not alphabetically — from the live DB (`ir_act_window.view_mode`):

| `view_mode` | Actions |
|---|---|
| `list,form` | 79 |
| `form` | 44 |
| `list,kanban,form` | 19 |
| `kanban,list,form` | 6 |
| `list` / others | 3 each |
| `...calendar,pivot,graph,activity` (widest) | 3 |

List + form cover ~95% of real screens; the tail (pivot, graph, calendar, hierarchy) serves 3–6 actions each and can stay Odoo's for a long time without a user noticing.

### 4. Sections — the data behind them (resolved as D5)

Sections are **new data, authored by the admin for the whole company, affecting grouping and order only.** They are not derived from module categories (`ir_module_category` — 87 categories, module-level and full of non-user-facing buckets) and not from menu `sequence`: **sequence cannot carry sections** because ties are the norm — `sequence 10` is claimed by up to 10 menus at one level, `5` and `3` by two each. Today's six roots look spaced (5, 10, 70, 500, 550, 1000) only because the business apps are absent.

Implementation shape (phase H authors, phase I renders): a small section model (name, sequence) plus a section field on menus, inherited in the product module — **zero modifications under the fork's `addons/`**. The shell ships with **seeded defaults** so sections render before any authoring UI exists.

`res_groups_privilege` (Odoo's only existing "section" concept — a named container of *groups*, rendered as headings on the user form) is the precedent for the shape: authored data, not derived.

Navigation extras — pinned favourites, recents and ⌘K search — remain **open (D3)**: new data, a `res.users` field or a model, plus a server endpoint.

### 5. Identity

Palette source remains the site tokens (`acczed-site/app/globals.css:2-17`) **unless the user replaces it (D4)** — a palette change means repairing the token layer first (ACC-F01/F02 move ahead of the repaint; see ACC-I03's sequencing note and `docs/plans/README.md`).

The **atmosphere layer is now in scope**: "Dark Space Botanical" is half-ported today — the backend received the colours, none of the ambient identity (the site's `.aurora`, `globals.css:37+`). A layout redesign is the right moment to land it.

`tools/theme-check.js` (10/10 assertions, expected values written as literals by design) **was removed with the reverted phase-C implementation on 2026-09-17** — the tripwire *pattern* survives, the file does not: whichever palette the shell ships must get its own guard before any repaint lands.

### 6. RTL

Phase E is complete: `ar_001` active, `dir=rtl` verified, `rtlcss` installed. The sidebar must mirror to the right edge — and every SCSS file obeys CONVENTIONS §7.6: logical properties or `/*rtl:ignore*/`, never hardcoded `left`/`right`. Arabic is a **required mockup state**, not a later pass.

### 7. Reference design language — VS Code chrome (recorded 2026-09-15)

The chosen reference is **VS Code's workbench** (user, 2026-09-15: *"I'm into the design of VS Code"*). Its current chrome — the "Modern UI" refresh from 1.129 (`workbench.experimental.modernUI`) plus the Dark 2026 default theme — supplies the concrete language. All values below were read from the VS Code source, not from memory:

| Element | VS Code value | Source |
|---|---|---|
| Width states — VS Code's contract, applied to our sidebar | ours: **280** default · **236** compact · **172** narrow (the squeeze) · inset card when floating. VS Code's own activity bar uses 48 / 36 / 36 / 28, and its panel minimum is what our floor is named after | `activitybarPart.ts:50-56`, `sidebarPart.ts:48` |
| Side panel minimum | **170px** | `sidebarPart.ts:48` |
| Status bar height | **22px** | `statusbarPart.ts:124` |
| Title bar height | **35px** (includes command-centre space) | `window.ts:334` |
| Geometry driver | CSS custom properties (`--activity-bar-width: 48px`) | `activitybarpart.css:7` |
| Shadows | 4-step scale (`sm/md/lg/xl`) + `depth-x`/`depth-y`, **all zeroed in the flat mode** | `style.css:58-87` |
| Chrome surface | **one** flat colour across activity bar, side bar and title bar (`#191A1B`) | `themes/2026-dark.json` |
| Selection | translucent white — `#FFFFFF22` active, `#FFFFFF14` hover | `themes/2026-dark.json` |
| Accent | desaturated steel blue — button `#297AA0`, badge `#307E9F`, link `#48A0C7`, focus `#3994BCB3` | `themes/2026-dark.json` |
| Density modes | Default vs **Compact**; Compact "removes the spacing between panels and reduces inner panel spacing" | release notes 1.136 |
| Panels | floating / inset — a gap, not edge-to-edge | release notes 1.133 |

**Mapping onto our shell** — VS Code's activity bar is the one part with **no counterpart** after the rail was removed; its side bar is what we took:

| VS Code | acczed shell |
|---|---|
| Activity bar | *no counterpart* — the rail was designed, then removed 2026-09-15 (§1) |
| Side bar | **the whole sidebar**: section headings → apps → menu trees (§1) |
| Command centre / quick open | the ⌘K palette (open decision D3) |
| Editor tabs | open actions/records — **Odoo has no tab model today**, so this is a new concept |
| Status bar | no direct counterpart — Odoo's `statusbar` is a *field widget*, not chrome |

**Where the analogy breaks — recorded, not discovered later:**

- VS Code is **document-centric** (one file per tab); Odoo is **record-centric**, and a view replaces the entire action area. Tab-like navigation would be a new model, not a restyle.
- VS Code's right lane is an empty panel; Odoo's form chatter already occupies it.
- Width states are a **contract**, not a number: VS Code names four (its activity bar 48 → 36 → 28, its panel floor 170). Ours are 280 → 236 → 172, and D2's answer must be one of those states — never an ad-hoc pixel value in a single stylesheet.

**Effect on the remaining decisions:** D2 gains a precedent to adopt or consciously reject (density states rather than a pixel compromise); D4 sharpens — our accent is a saturated green glow (`#39d353`), VS Code's is a deliberately desaturated steel blue. Keep the green, or adopt the desaturation philosophy? Recorded as part of D4 rather than assumed.

### 8. Non-goals

- No server concept changes: models, ACLs (205 models), record rules (111), actions, menus stay as they are (sections add a model and a field — additive, no rewrites).
- No new ORM endpoints: spec-shaped reads (`web_search_read`/`web_read`/`formatted_read_group`, `addons/web/models/models.py:66,109,802`) are kept.
- **No business records in the sidebar** — it stays menus + sections (D5). A Projects area listing live `project.project` rows was explicitly rejected on 2026-09-15.
- Marketing site layout untouched (decision 4); tokens only, via ACC-F01…F03.
- Print/PDF stays light (recorded decision #3 of the seven answered questions, `README.md`).
- Zero modifications under the fork's `addons/` tree — CONVENTIONS §7.3, §8.

## Open decisions (closed by ACC-I04, recorded back into this file)

| # | Question | Options | Resolved |
|---|---|---|---|
| D1 | Sidebar shape | **RE-RESOLVED 2026-09-15 (same day, after review): ONE sidebar, no icon rail.** Sections are collapsible headings → apps → inline menu trees; at the squeeze the sidebar narrows to 172px instead of collapsing. The first resolution (rail + panel) was removed by the user — recorded so it is not reintroduced silently | ✅ |
| D2 | What gives at 1366px with chatter open | **narrows to 172px (current behaviour in the mockup)** / chatter becomes a drawer / sidebar hides entirely / decide from the mockups | ⏳ |
| D3 | Nav extras | pin + recents + ⌘K / pin only / palette only / none | ⏳ |
| D4 | Palette | keep Dark Space Botanical / new palette (repairs token layer first) — now also "keep the saturated green accent, or adopt VS Code's desaturated philosophy" | ⏳ |
| D5 | **Menu sections — RESOLVED 2026-09-15.** Sections group **apps**, **admin-authored, company-wide, grouping and order only** (no permission semantics); the sidebar stays menus-only. *Consequence:* sections render as **collapsible headings inside the sidebar**, the only place they can live now that no separate navigation column exists | ✅ |

## Steps

- [ ] **1. Produce the mockups** — ACC-I04, at 1366×768 and 1920×1080, in both `dir=ltr` and `dir=rtl`, rendering the D1 shape (one sidebar: headings → apps → inline trees)
  ```bash
  ls docs/plans/I-ui-shell/mockups/
  ```
  → expected: three variants, each rendering sections folded/expanded, an app's tree open inline, the 172px squeeze with chatter, form+chatter, fullscreen, and a 600-menu stress tree
- [ ] **2. Record the remaining decisions** (D2, D3, D4) back into the table above with the date
  ```bash
  grep -n "| D2 \| D3 \| D4 " docs/plans/I-ui-shell/ACC-I01-ui-shell-design-spec.md
  ```
  → expected: three rows carrying ✅ and a date
- [ ] **3. Freeze the spec** — set Status to ✅ and flip this file's `Depends on` consumers on in `README.md`

## Verification

- Every number in this file reproduces from the repo or the DB (commands inline in ACC-I02 / ACC-I03).
- The decisions are dated and attributed, and no implementation task exists that rests on a ⏳ row.

## Done when

- [x] D1 and D5 recorded, not assumed (2026-09-15)
- [ ] D2, D3, D4 recorded
- [ ] the layout contract (§2) names all four regions, the fullscreen rule and the stage transitions
- [ ] the non-goals list is accepted by the user
- [ ] `README.md` phase I row and task index match this folder

## Risks / notes

- **The spec is not a licence to start coding.** ACC-I04's mockups must be approved first — the user's own condition (decision 5).
- **Scope creep risk is large** (34k LOC of renderers is already promised). The demand table in §3 is the scope fence: anything not in the top three shapes is deferred, not dropped.
- **The sidebar is now the only navigation, and its floor is 172px.** Below that — chatter open on a 1280px screen — something must give: the documented next step is the chatter becoming a drawer, **not** resurrecting an icon rail.
- If D4 resolves to a new palette, ACC-F01/F02 move ahead of every repaint task, otherwise both surfaces get painted twice.

---

← Phase I index: [../README.md](../README.md)
