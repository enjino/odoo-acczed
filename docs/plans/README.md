# acczed — plans and tasks

All planning for this product lives in this folder. One file per task, one folder per phase, and the
identifier scheme is `ACC-<phase><NN>` (see [CONVENTIONS.md](CONVENTIONS.md)).

**Session mode:** execution. Phases **A (baseline)** and **B (scaffolding)** are complete, **ACC-F04**
has been pulled forward and shipped (the site no longer overclaims), and **phase E is complete** —
rtlcss installed and proved mirroring, `ar_001` active with translations loaded, the layout verified as
genuinely mirrored across four measured seams, the translation-coverage check built, and reports taken
off Odoo's font CDN. Every fact quoted in these tasks was verified from the live code and the running
database on 2026-09-14, with a `file:line` reference so it can be re-checked.

**Phase E's gate is met:** `ar_001` active, `dir=rtl` verified, rtlcss installed and on the PATH — the
last of those still holds **locally only**; the production half is written into the ACC-B07 runbook and
not yet executed.

**Three E tasks closed on something other than what their titles imply — read the status lines before
citing them as done:**
- **ACC-E03's SCSS direction audit moved to ACC-C01**, which is where the first SCSS actually exists.
- **ACC-E04 translated nothing.** `acczed_theme` authors zero user-visible strings (a 0-byte POT), so
  what closed is the *check*; translating is now a per-task duty under CONVENTIONS §8.
- **ACC-E05 was re-scoped.** Its stated job (backend Inter stack) described a problem that did not
  exist; the real one was reports fetching Arabic glyphs from `fonts.odoocdn.com`.

**Next up: phase I (UI shell redesign)** — a new track opened 2026-09-15. The redesign is a **re-layout**,
not a recolour, and it starts from **stock Odoo colours**: the whole phase-C implementation was
**reverted on 2026-09-17** (dated block below), so ACC-C01…C04 are ⏳ again and phase C restarts from
ACC-C01 if and when it resumes — against the new shell, not the old one.
**ACC-H (roles console) should land on the new shell**, or its screens get written twice.

### ✅ Recorded 2026-09-15 — the UI redesign round

| # | Decision (user, 2026-09-15) |
|---|---|
| 1 | **The redesign is a re-layout**, not a recolour — new navigation model, own components, departs from Odoo's layout paradigm |
| 2 | **Own all renderers** — no Odoo view is left un-owned. Budget: 34,050 LOC JS of renderers + 13,487 LOC of field layer + a 227,808-LOC test net that only guards Odoo's originals |
| 3 | **Navigation paradigm: a persistent left side menu, Figma/Notion-style** — resolved as D1 into a **single sidebar**: section headings → apps → menu trees. A separate icon rail was designed and then **removed the same day** |
| 4 | **The marketing site keeps its layout**; only its tokens follow the theme (ACC-F01…F03 stay the token pipe) |
| 5 | **Design spec and mockups before any code** — matches the DAC+S methodology |
| 6 | **Reference design language: VS Code's workbench** (2026-09-15) — sidebar + command centre, compact density, floating inset panels, geometry driven by CSS custom properties. Metrics read from the VS Code source, not from memory: named width states (our sidebar 280 → 236 → 172), panel minimum 170px, status bar 22px, title bar 35px |
| 7 | **Menu sections: apps are grouped into admin-authored, company-wide sections — grouping and order only** (no permission semantics). The sidebar stays menus-only; live business records (e.g. project rows) do **not** appear in it |
| 8 | **Shape (D1): ONE sidebar** — collapsible section headings → apps (icon + label) → each app's menu tree expanding inline. Click depth stays 2, the same as Odoo today; at the 1366px squeeze the sidebar **narrows to 172px** rather than disappearing |

Open at ACC-I04: whether the 172px squeeze is enough at 1366px with chatter open, or the chatter must become
a drawer (D2) · pinned/recents/⌘K extras (D3) · the palette — keep Dark Space Botanical's saturated green
glow, or adopt VS Code's desaturated-accent philosophy (D4). Sections need no icon set of their own: they
are headings inside the sidebar.

Written up in [I-ui-shell/ACC-I01](I-ui-shell/ACC-I01-ui-shell-design-spec.md), with the parity
checklist in [ACC-I02](I-ui-shell/ACC-I02-arch-parity-checklist.md) and the compatibility policy in
[ACC-I03](I-ui-shell/ACC-I03-compatibility-policy.md).

### ✅ Recorded 2026-09-17 — the phase-C implementation was reverted

**Decision (user, 2026-09-17):** return the module to the code it had **before** phase C was implemented;
the 2026-09-15 build is removed and phase C restarts from ACC-C01 when it resumes.

| Surface | What happened |
|---|---|
| `acczed-addons` | four `git revert` commits on top of `eff8beb` (`ab954da` C03 · `d0e92bf` C04 · `205094a` C02 · `bbdcfe8` C01). `git diff 13b729d HEAD --stat` → **empty**: the module is byte-identical to its pre-C state. Deleted: `_acczed_variables.scss`, `models/ir_http.py`, the systray toggle, `i18n/ar.po`. Kept: the B03 skeleton and ACC-E05's self-hosted report fonts |
| `odoo-acczed` | the four C task files are back to their as-designed text, each with a built→reverted status line; `tools/theme-check.js` deleted; the C04 third-source hunks in `tools/i18n-coverage.py` / `tools/verify-rtl.sh` reverted (their third source was the deleted `i18n/ar.po`) |
| Runtime | `-u acczed_theme` → `ir_module_module.latest_version` **19.0.0.1.4 → 19.0.0.1.1**; `grep -c assets_web_dark` on `/web/login` → **0** (was 1); no `.o_acczed_scheme_toggle` in the page; `verify-rtl.sh` → 11 passed, 0 failed |
| Evidence | the themed shots are kept and relabelled **withdrawn**; `after-c-revert-backend-home.png` is the stock-Odoo frame; the record is in `evidence/evidence.log` |
| Still intact | the phase-C **design** — issues #16–#21 carry the pre-implementation task text, and the decisions above (always dark + toggle, print stays light) stay as decisions, now unbuilt |

> ⚠️ This is a shallow Odoo fork: a re-clone deletes anything not tracked by git. `docs/` is now
> committed (commit `4016a0cd`), so the plan and its evidence survive — but anything added under
> `docs/` from here on must be committed too, or it is one re-clone away from gone.

**Status legend:** ⏳ not started · 🚧 in progress · ✅ done · 🅿️ parked · ⛔ blocked

---

## Phases

| Phase | Folder | Purpose | Gate (phase is done when) | Status |
|---|---|---|---|---|
| **A** | [A-baseline/](A-baseline/) | Baseline (evidence only, no code) — Freeze today's reality with reproducible evidence, including production and the language/RTL facts. | 4 screenshots + evidence.log, and no source file modified in either repo | ✅ done |
| **B** | [B-scaffolding/](B-scaffolding/) | Scaffolding (module repo + addons path) — A separate acczed-addons repo, a third addons path, and an empty module that installs green. | acczed_theme shows installed in SQL, with zero visual change | ✅ done |
| **C** | [C-dark-theme/](C-dark-theme/) | Dark Space Botanical backend theme — Repaint the backend from one variable layer, make dark the default, cover what variables miss. | dark on first load, zero SCSS errors, explicit list of uncovered screens | ⏳ |
| **D** | [D-branding/](D-branding/) | Branding (title, favicon, login, company, mail) — Remove every customer-visible trace of the upstream brand. | no odoo.com or Manage Databases on the login page, company renamed | ⏳ |
| **E** | [E-arabic-rtl/](E-arabic-rtl/) | Arabic and RTL — Make the site's Arabic/RTL badges true: rtlcss, ar_001, verified mirror layout. | ar_001 active, dir=rtl verified, rtlcss installed and on the service PATH | 🚧 |
| **F** | [F-token-sync/](F-token-sync/) | Single token source + site copy parity — One tokens.json generating both surfaces, and marketing copy audited against reality. | one token change reaches both surfaces, no unsupported live badge | ⏳ |
| **G** | [G-features-backlog/](G-features-backlog/) | Features backlog (parked by user) — Home for the functional/feature decisions when the user opens that track. | decisions recorded by the user; nothing implemented | 🅿️ |
| **H** | [H-roles-access/](H-roles-access/) | Roles & access console — admin-created roles, then per-role access to actions (menus, window/server actions), models and view features, with an audit trail. | a user without a role is refused server-side; a role can be created, granted and revoked without developer mode | ⏳ |
| **I** | [I-ui-shell/](I-ui-shell/) | UI shell redesign — persistent Figma/Notion-style side navigation, our own shell and view renderers, an interface no other Odoo has. | design approved from mockups; every app installs and renders through the new UI or falls back explicitly (never silently) | 🚧 |

Execution order: A → B → **E** → C → **I** → D → F (E before C because an Arabic tour of a theme is
cheaper than a theme tour twice; **I before C's remaining waves and before D** because the shell decides
what the views look like; F last because it locks what C, D and E produced). G is parked by the user.
**H** is the first feature track, and it builds UI screens (ACC-H03, H05, H06, H07) — it should start
from the new shell or its screens get written twice: ACC-H01–H09 build the roles & access console,
ACC-H10 applies it to the auditor-restricted task tab that started it.
H01 → H02 → {H03, H04} → {H05, H06, H07} → H08 → H09 → H10.

**Phase I changes one inherited assumption:** the earlier order deferred the interface to the end, with C
recolouring and D branding in place of a redesign. Phase I replaces "restyle component by component" with
"own the shell and the renderers" — which is why the phase-C implementation was **reverted on
2026-09-17**: ACC-C01…C04 are ⏳ again and the guard went with them, so phase C, when it resumes, styles
the new shell once instead of the old one twice.

**ACC-F04 is pulled out of that chain** (decision 4, 2026-09-14): the site currently ships three false
`live` badges in public, so the copy fix runs as soon as ACC-A06 is done rather than waiting behind the
whole theming track. It no longer depends on ACC-E06. Revised order for that one task:

```
A → B → F04 (soften the false badges) → E → C → D → F (F01–F03, F05, F06) → G
```

ACC-F04's remaining trigger is decision 4's second half — flipping the badges *back* to `live` — which
happens per-claim as ACC-G03 / ACC-E03 land, not in one pass.

### ✅ Resolved: ACC-E05 vs ACC-C01 (raised and closed 2026-09-15)

**Was:** the documented order could not be executed — ACC-E05 *touched* `_acczed_variables.scss`, which
ACC-C01 **creates**, and the order runs E before C.

**Resolved by re-scoping E05, not by reordering.** Reconnaissance showed E05's real problem was
elsewhere entirely (reports fetching Arabic glyphs from `fonts.odoocdn.com`, see ACC-E05), and the fix
landed in a **new file** scoped to `web.report_assets_common`. E05 no longer touches
`_acczed_variables.scss` at all, so the conflict disappeared rather than needing a decision.

**The lesson worth keeping:** the conflict was a symptom. Two tasks were fighting over a file because
one of them was doing the wrong work. Chasing the symptom — picking option 1 or 2 above — would have
resolved the ordering and left the actual CDN leak in place. When two tasks contend for the same
artifact, check whether either should be there at all before reordering them.

**Still open for ACC-C01:** its `Depends on` and `Done when` are unchanged and correct; it owns
`_acczed_variables.scss` outright, and carries E03's re-homed direction audit.

---

## Task index

### Phase A — Baseline (evidence only, no code)

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-A01](A-baseline/ACC-A01-start-local-stack.md) | Start the local stack and confirm it serves | — | 5 min | ✅ |
| [ACC-A02](A-baseline/ACC-A02-capture-login-baseline.md) | Capture the login page baseline (text + screenshot) | ACC-A01 | 10 min | ✅ |
| [ACC-A03](A-baseline/ACC-A03-capture-backend-baseline.md) | Capture the backend baseline (home + list screens) | ACC-A01 | 10 min | ✅ |
| [ACC-A04](A-baseline/ACC-A04-capture-production-baseline.md) | Capture the production baseline (backend.acczed.online) | ACC-A01 | 10 min | ✅ |
| [ACC-A05](A-baseline/ACC-A05-capture-language-rtl-baseline.md) | Capture language + RTL baseline | ACC-A01 | 10 min | ✅ |
| [ACC-A06](A-baseline/ACC-A06-promises-vs-reality-table.md) | Complete the promises-vs-reality table | ACC-A02, ACC-A03, ACC-A04, ACC-A05 | 20 min | ✅ |
| [ACC-A07](A-baseline/ACC-A07-answer-open-questions.md) | Answer the seven open questions | ACC-A06 | 15 min | ✅ |
| [ACC-A08](A-baseline/ACC-A08-phase-a-acceptance.md) | Phase A acceptance check | ACC-A01..ACC-A07 | 10 min | ✅ |

### Phase B — Scaffolding (module repo + addons path)

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-B01](B-scaffolding/ACC-B01-create-addons-repo.md) | Create the acczed-addons repository | ACC-A08 | 10 min | ✅ |
| [ACC-B02](B-scaffolding/ACC-B02-write-conventions-doc.md) | Write docs/CONVENTIONS.md for module work | ACC-B01 | 15 min | ✅ |
| [ACC-B03](B-scaffolding/ACC-B03-create-theme-module-skeleton.md) | Create the acczed_theme module skeleton | ACC-B02 | 15 min | ✅ |
| [ACC-B04](B-scaffolding/ACC-B04-add-addons-path-local.md) | Add the acczed-addons path to the local odoo.conf | ACC-B03 | 10 min | ✅ |
| [ACC-B05](B-scaffolding/ACC-B05-install-theme-module.md) | Install acczed_theme in the acczed database | ACC-B04 | 10 min | ✅ |
| [ACC-B06](B-scaffolding/ACC-B06-verify-no-visual-change.md) | Verify the skeleton changed nothing visually | ACC-B05 | 10 min | ✅ |
| [ACC-B07](B-scaffolding/ACC-B07-document-production-rollout.md) | Document the production rollout (documentation only) | ACC-B05 | 15 min | ✅ |

### Phase C — Dark Space Botanical backend theme

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-C01](C-dark-theme/ACC-C01-map-tokens-to-scss-variables.md) | Map the site tokens onto Odoo SCSS variables | ACC-B05 | 45 min | ⏳ |
| [ACC-C02](C-dark-theme/ACC-C02-force-dark-color-scheme.md) | Make the dark bundle load by default | ACC-C01 | 30 min | ⏳ |
| [ACC-C03](C-dark-theme/ACC-C03-dark-scss-overrides.md) | Style what variables cannot reach | ACC-C02 | 1–2 days | ⏳ |
| [ACC-C04](C-dark-theme/ACC-C04-systray-color-scheme-toggle.md) | Add the colour-scheme toggle in the systray | ACC-C02 | 4 hrs | ⏳ |
| [ACC-C05](C-dark-theme/ACC-C05-identity-fine-tuning.md) | Fine-tune the identity details | ACC-C03 | 3 hrs | ⏳ |
| [ACC-C06](C-dark-theme/ACC-C06-deploy-theme-to-production.md) | Deploy the theme to production | ACC-C05, ACC-B07 | 1 hr | ⏳ |

### Phase D — Branding (title, favicon, login, company, mail)

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-D01](D-branding/ACC-D01-title-and-favicon.md) | Set the document title and favicon to acczed | ACC-B05 | 30 min | ⏳ |
| [ACC-D02](D-branding/ACC-D02-login-page-branding.md) | Rebrand the login page | ACC-D01 | 2 hrs | ⏳ |
| [ACC-D03](D-branding/ACC-D03-company-identity.md) | Set the company record and the base URL | ACC-B05 | 30 min | ⏳ |
| [ACC-D04](D-branding/ACC-D04-mail-and-notification-branding.md) | Brand outgoing mail and notifications | ACC-D03 | 2 hrs | ⏳ |
| [ACC-D05](D-branding/ACC-D05-portal-and-website-theming.md) | Theme the portal and in-Odoo website (parked) | ACC-D04 | TBD | ⏳ |

### Phase E — Arabic and RTL

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-E01](E-arabic-rtl/ACC-E01-install-rtlcss.md) | Install rtlcss (required for any RTL stylesheet) | ACC-B04 | 20 min | ✅ |
| [ACC-E02](E-arabic-rtl/ACC-E02-activate-arabic-language.md) | Activate Arabic (ar_001) | ACC-E01 | 15 min | ✅ |
| [ACC-E03](E-arabic-rtl/ACC-E03-verify-rtl-visuals.md) | Verify RTL actually renders right | ACC-E02 | 2 hrs | ✅ |
| [ACC-E04](E-arabic-rtl/ACC-E04-translate-module-strings.md) | Translate our own strings (i18n/ar.po) | ACC-E02 | half a day | ✅ |
| [ACC-E05](E-arabic-rtl/ACC-E05-arabic-font-stack.md) | Font stack for Arabic and Latin together (**re-scoped**: self-host the report font) | ACC-E03 | 3 hrs | ✅ |
| [ACC-E06](E-arabic-rtl/ACC-E06-update-site-arabic-claim.md) | Make the site's Arabic claim true (or stop making it) — **subsumed by ACC-F04, do not execute** | ACC-E03 | 1 hr | 🅿️ |

### Phase F — Single token source + site copy parity

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-F01](F-token-sync/ACC-F01-define-tokens-json.md) | Define tokens.json as the single source of truth | ACC-C01 | 1 hr | ⏳ |
| [ACC-F02](F-token-sync/ACC-F02-token-generator-script.md) | Generate both outputs from tokens.json | ACC-F01 | 3 hrs | ⏳ |
| [ACC-F03](F-token-sync/ACC-F03-verify-token-propagation.md) | Verify one token change reaches both surfaces | ACC-F02 | 30 min | ⏳ |
| [ACC-F04](F-token-sync/ACC-F04-reconcile-site-copy.md) | Reconcile the marketing copy with the audited reality (**pulled forward — runs ahead of ACC-G03**) | ACC-A06 | 3 hrs | ✅ |
| [ACC-F05](F-token-sync/ACC-F05-verify-signin-parity.md) | Verify sign-in parity between site and backend | ACC-D02 | 1 hr | ⏳ |
| [ACC-F06](F-token-sync/ACC-F06-bilingual-marketing-site.md) | Build the marketing site bilingual (en + ar) | ACC-F04 | 1–2 days | ⏳ |

### Phase G — Features backlog (parked by user)

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-G01](G-features-backlog/ACC-G01-decide-feature-priorities.md) | Decide the feature backlog and its order | — | user decision | ⏳ |
| [ACC-G02](G-features-backlog/ACC-G02-choose-build-vs-subscribe-path.md) | Choose build vs OCA vs subscription per app | ACC-G01 | user decision | ⏳ |
| [ACC-G03](G-features-backlog/ACC-G03-decide-accounting-foundation.md) | Decide the accounting foundation | ACC-G01 | user decision | ⏳ |
| [ACC-G04](G-features-backlog/ACC-G04-scope-saudi-payroll-ip.md) | Scope the Saudi payroll module (product IP) | ACC-G03 | user decision | ⏳ |
| [ACC-G05](G-features-backlog/ACC-G05-define-feature-task-template.md) | Lock the per-feature task template | ACC-G02 | 1 hr | ⏳ |

### Phase H — Roles & access console

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-H01](H-roles-access/ACC-H01-fix-the-permission-model.md) | Fix the permission model and scope before building | — | 2 hrs | ⏳ |
| [ACC-H02](H-roles-access/ACC-H02-module-skeleton.md) | Create the acczed_access module skeleton | ACC-H01 | 2 hrs | ⏳ |
| [ACC-H03](H-roles-access/ACC-H03-roles-screen.md) | Build the Roles screen (create, edit, archive roles) | ACC-H02 | 1 day | ⏳ |
| [ACC-H04](H-roles-access/ACC-H04-permission-registry.md) | Add the permission registry (features declare their own points) | ACC-H02 | 1 day | ⏳ |
| [ACC-H05](H-roles-access/ACC-H05-action-and-menu-access.md) | Action & menu access editor (grant per role, impact preview) | ACC-H03, ACC-H04 | 1–2 days | ⏳ |
| [ACC-H06](H-roles-access/ACC-H06-data-access-editor.md) | Data access editor (model CRUD matrix + record rules) | ACC-H03, ACC-H04 | 2 days | ⏳ |
| [ACC-H07](H-roles-access/ACC-H07-assignment-and-effective-permissions.md) | Role assignment + effective-permissions inspector | ACC-H03 | 1 day | ⏳ |
| [ACC-H08](H-roles-access/ACC-H08-permission-change-log.md) | Audit trail for permission changes | ACC-H03, ACC-H05, ACC-H06 | 1 day | ⏳ |
| [ACC-H09](H-roles-access/ACC-H09-acceptance-and-escalation-tests.md) | Acceptance & escalation tests | ACC-H05, ACC-H06, ACC-H07 | 1 day | ⏳ |
| [ACC-H10](H-roles-access/ACC-H10-first-consumer-auditor-tab.md) | First consumer: the auditor-restricted task tab | ACC-H04, ACC-H05 | 1 day | ⏳ |

### Phase I — UI shell redesign

| Task | Title | Depends on | Est. | Status |
|---|---|---|---|---|
| [ACC-I01](I-ui-shell/ACC-I01-ui-shell-design-spec.md) | Write the UI shell design spec (nav paradigm, layout contract, surfaces, identity) | — | 2 hrs | 🚧 |
| [ACC-I02](I-ui-shell/ACC-I02-arch-parity-checklist.md) | Build the arch-parity checklist from the live corpus | ACC-I01 | 1.5 hrs | ✅ |
| [ACC-I03](I-ui-shell/ACC-I03-compatibility-policy.md) | Lock the compatibility policy (what a new app inherits, what it can break) | ACC-I01 | 2 hrs | ✅ |
| [ACC-I04](I-ui-shell/ACC-I04-shell-mockups.md) | Produce the shell mockups of the fixed D1 shape and close D2–D4 (density, extras, palette) | ACC-I01, ACC-I02, ACC-I03 | half a day | ⏳ |
| [ACC-I05](I-ui-shell/ACC-I05-compat-spike.md) | Prove the compatibility policy with a probe (R1/R2/R4 against installed modules) | ACC-I03 | 2–3 hrs | ⏳ |

**ACC-I06 and beyond (the implementation) are deliberately not written yet** — they are written from an
approved ACC-I04, so that no renderer task rests on an unapproved look. The scope fence is ACC-I02 §3's
demand table (list + form cover ~95% of the 186 window actions; pivot/graph/calendar/hierarchy serve 3–6
actions each and may stay Odoo's for a long time).


---

## Baseline facts (verified 2026-09-14)

| # | Fact | Reference / verification command |
|---|---|---|
| 1 | Site palette: 14 named values — `#0d1117` bg, `#101720` bg-soft, `#131a24` card, `#1f2a37` border, `#1a2330` border-soft, `#e6edf3` text, `#8b98a9` text-dim, `#5c6a7a` text-faint, `#39d353` glow, `#7ee787` glow-soft, `#4ad3c9` teal, `#e3b341` gold, 14px radius, Inter | `acczed-site/app/globals.css:2-17` |
| 2 | Odoo's default accent is purple `#71639e`, feeding `$o-brand-primary` and `$o-action` (buttons, links, headings) | `addons/web/static/src/scss/primary_variables.scss:73-83` |
| 3 | Odoo 19 asset directive syntax is `('after', '<file>', '<file>')` | `addons/html_editor/__manifest__.py:23`, `addons/onboarding/__manifest__.py:27` |
| 4 | The dark bundle is `web.assets_web_dark` = `include web.assets_web` + `web/static/src/**/*.dark.scss`; that glob is scoped to `web`, so an external module must list its files explicitly | `addons/web/__manifest__.py:346-349` |
| 5 | The dark bundle is chosen server-side by `color_scheme`, which comes from `ir.http.color_scheme()` — the only definition in the tree, returning a hardcoded `"light"` | `addons/web/views/webclient_templates.xml:300-305`, `addons/web/models/ir_http.py:73,77-78` |
| 6 | Community has no colour-scheme toggle and nothing writes the `color_scheme` cookie (17 places only read it) | `color_picker.js:124`, `views/view.js:349`, `graph_renderer.js:29` |
| 7 | Community dark styling covers 3 files only (calendar, emoji_picker, file_viewer); the full dark theme lives in the absent `web_enterprise` | `find addons/web/static/src -name "*dark*"` |
| 8 | Login page shows the company logo, a "Manage Databases" link and a "Powered by Odoo" link to odoo.com; title defaults to `Odoo`, icon to `/web/static/img/favicon.ico` | `addons/web/views/webclient_templates.xml:110-134` (121, 126, 128), `:22-23` |
| 9 | RTL is data-driven (`res.lang.direction`) and every stylesheet is mirrored by spawning the external `rtlcss` binary during asset compilation | `odoo/addons/base/models/res_lang.py:77`, `odoo/addons/base/models/assetsbundle.py:653-664` |
| 10 | **`rtlcss` is not installed** (node 22 is), so RTL CSS cannot be produced | `which rtlcss` (empty), `npm ls -g --depth=0` |
| 11 | Database `acczed`: 41 installed modules (platform plumbing only), 613 uninstalled, 23 uninstallable, company still `YourCompany`, only `en_US` active | `select count(*) filter (where state='installed') from ir_module_module` |
| 12 | `account`, `l10n_sa`, `l10n_sa_edi`, `website`, `contacts` are all `uninstalled` (accounting exists only in the test DB `mcp_test`) | `select name,state from ir_module_module where name in (...)` |
| 13 | `addons_path` holds two paths and no product-module path | `odoo-acczed/odoo.conf` |
| 14 | The site claims 44 apps and "2 languages, both directions", with `live` badges on ZATCA, Arabic RTL and the Saudi chart of accounts; Finance marks Accounting/Payroll/Documents/Sign as "core" | `acczed-site/app/page.tsx:8-13, 90-121, 162-167, 254` |

---

## Promises vs reality (audit — see ACC-A06)

| # | Site claim | Badge today | Reality (verified 2026-09-14) | Evidence command → result | Options | Owning task |
|---|---|---|---|---|---|---|
| 1 | **44** business apps, one platform | — | 41 modules installed, all platform plumbing. `account`, `crm`, `sale`, `stock` are **all uninstalled** | `P=select count(*) filter (where state='installed') from ir_module_module` → **41** | fix the copy / install in stages / label each card | ACC-F04, ACC-G03 |
| 2 | **2** languages, both directions | — | 93 languages known, **exactly 1 active** (`en_US`). `ar_001` + `ar_SY` carry `direction='rtl'` but are inactive | `P=select count(*) filter (where active), count(*) from res_lang` → **1, 93** | install rtlcss + activate ar_001 | ACC-E01…ACC-E06 |
| 3 | Arabic, right to left | **live** | Same fact as #2, plus `rtlcss` is absent so Odoo cannot mirror any stylesheet | `P=…res_lang` → 1, 93 · `which rtlcss` → **MISSING** | same | ACC-E01…ACC-E06 |
| 4 | ZATCA e-invoicing | **live** | `l10n_sa_edi` and `account` both uninstalled | `P=select name,state from ir_module_module where name in ('account','l10n_sa_edi')` → **both uninstalled** | install, or relabel "in the works" | ACC-G03, ACC-F04 |
| 5 | Saudi chart of accounts | **live** | `l10n_sa` uninstalled | `P=… where name='l10n_sa'` → **uninstalled** | same | ACC-G03, ACC-F04 |
| 6 | Saudi payroll rules | in the works | **Correctly not live** — no payroll module exists at all. The one honest badge | `P=select count(*) from ir_module_module where name like '%payroll%'` → **0** | none needed | ACC-G04 |
| 7 | Your data, your servers | **live** | **True** — self-hosted droplet behind Caddy, `web.base.url` already correct | `ssh odoo-acczed "…select value from ir_config_parameter where key='web.base.url'"` → **https://backend.acczed.online** | none | — (A04) |
| 8 | **100%** open-source core | — | **True** — LGPLv3 Community fork | `grep -m1 -i "GNU LESSER" LICENSE` → LGPLv3 | none | — |
| 9 | **0** spreadsheets required | — | Not falsifiable — a marketing statement, not a property of the system | — | none | — |
| 10 | "Sign in" → backend.acczed.online | — | Link works (HTTP 200) but lands on a stock Odoo login: "Your logo", "Powered by Odoo" | `curl -s -o /dev/null -w "%{http_code}" https://backend.acczed.online/web/login` → **200** | brand it | ACC-D01…ACC-D03 |

`P=` is shorthand for `docker exec odoo-postgres psql -U odoo -d acczed -tAc "…"`. The local `acczed`
database is the same fork as production; the four claims that fail here also fail there — the deployed
site at app.acczed.online carries the identical badges (8 `tag-live` spans, checked 2026-09-14).

**Verdict:** of 5 `live` badges, **3 are false** (ZATCA, Arabic RTL, Saudi chart of accounts), 1 is true
(your-servers), and the one deliberately non-live badge is honest. Of the 4 hero stats, the "44 apps"
and "2 languages" figures are false, "100% open-source core" is true, and "0 spreadsheets" is
unfalsifiable. **No claim is unlinked** — each maps to the task that makes it true or changes it.

**Rule:** no copy changes before the thing it promises works on `backend.acczed.online`, and a `live` badge
requires a recorded verification step (command output + screenshot in `evidence/`). Per this table, rows
1–5 and 10 are the ones that currently break that rule.

---

## Open questions (answers change the implementation)

1. **Logo:** final SVG, or the text mark ("acczed" + 🌿) used on the site?
   >> DECISION (2026-09-14): **Text mark** ("acczed" + 🌿), matching the site. No new asset to produce, so ACC-D01/D02 are unblocked immediately; if a final SVG appears later it replaces the text mark in one place.
2. **Default scheme:** always dark, or dark + follow the system/user preference?
   >> DECISION (2026-09-14): **Always dark**, with the ACC-C04 systray toggle as the opt-out. ACC-C02 keeps its documented shape — override `ir.http.color_scheme()` (baseline fact #5) outright rather than making it preference-aware. The "follow the system" variant is rejected.
3. **Print/PDF:** light (proposed) or dark as well?
   >> DECISION (2026-09-14): **Light.** Screen is dark, paper stays white. Keeps the report templates out of ACC-C03's override list entirely.
4. **Site copy:** fix it to match reality now, or install `account` + `l10n_sa` first and flip "in the works" to "live"?
   >> DECISION (2026-09-14): **Fix the copy now, install later.** The three false `live` badges (ZATCA, Arabic RTL, Saudi chart of accounts) move to payroll's existing "in the works" wording and flip back as each capability actually lands. **Consequence: ACC-F04 moves ahead of ACC-G03 and no longer waits on ACC-E06** — see the re-sequenced execution order below.
5. **Arabic marketing site?** currently `<html lang="en">` (`acczed-site/app/layout.tsx:21`).
   >> DECISION (2026-09-14): **Yes — build the site bilingual (en + ar).** Added as **ACC-F06**. This is marketing-site scope; it is independent of the product's Arabic *interface* claim, which ACC-E01…E04 own.
6. **Token source:** adopt `tokens.json` + generator (DRY), or a documented manual copy?
   >> DECISION (2026-09-14): **`tokens.json` + generator.** ACC-F01–F03 proceed as written. The manual-copy option is rejected: only the generator makes Phase F's gate ("one token change reaches both surfaces") actually verifiable rather than asserted.
7. **First implementation scope:** C + D locally first, production after approval?
   >> DECISION (2026-09-14): **Follow the documented order — B → E → C → D, locally, production only after approval.** Phase H starts after D, or in parallel; it shares no files with the theming work.

All seven answered (task ACC-A07). Two of them changed the plan: #4 moved ACC-F04 ahead of ACC-G03, and #5 added ACC-F06.
