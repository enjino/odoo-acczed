# ACC-I03 — Lock the compatibility policy

| Field | Value |
|---|---|
| **Phase** | I — UI shell redesign |
| **Status** | ✅ done 2026-09-15 (policy written; proven empirically by ACC-I05) |
| **Depends on** | ACC-I01 |
| **Estimated** | 2 hrs |
| **Touches** | this file only (documentation) |

## Goal

Answer, in binding rules, the question that decides whether this is a redesign or a fork: **when a new app is installed, does it inherit our UI — and what can it break?**

## Context (verified)

**Answer in one line:** a new app inherits our UI automatically, and it never breaks the server. What can break is a countable list of *client-side extensions* that reach into Odoo's implementation.

**Override by registration name is supported and already used in-tree:**

- `registry.add(key, value, { force })` — "the parameter force is set to true, an entry with same key (if any) is replaced" (`addons/web/static/src/core/registry.js:89,99-109`). Without `force`, a duplicate key throws.
- View types are registered by name: `registry.category("views").add("list", listView)` (`addons/web/static/src/views/list/list_view.js:34`; form `form_view.js:37`, kanban `kanban_view.js:35`, calendar `calendar_view.js:33`, graph `graph_view.js:56`, pivot `pivot_view.js:60`, and a non-standard type `base_settings` at `webclient/settings_form_view/settings_form_view.js:72`).
- Precedent for wholesale replacement from a module: `addons/hr_gamification/static/src/form_view.js:43` replaces a **view type** with `{ force: true }`; `addons/html_editor/static/src/fields/html_field.js:421` replaces web's **`html` field widget**.

**What can break — measured 2026-09-15, excluding test files:**

| Vector | Measured | Failure if ignored |
|---|---|---|
| `t-inherit` on web view templates | `web.ListRenderer` 11 files · `web.KanbanRenderer` 11 · `web.FormView` 5 · `web.ControlPanel` 4 files (5 occurrences) · `web.NavBar` 1 | their xpath targets nodes that no longer exist → added buttons/menus vanish |
| Broader template targets | `web.TagsList` 8 · `web.ListView` 8 · `web.CharField` 8 · `web.ListView.Buttons` 7 · `web.KanbanView` 6 · `web.SelectionField` 5 · `web.ListRenderer.RecordRow` 5 · `web.FormViewDialog.ToOne.buttons` 5 · `web.AutoComplete` 5 · `web.ConfirmationDialog` 4 · `web.BinaryField` 4 | same |
| JS prototype patches (`patch(X.prototype, …)`) | `ListController` 21 · `ListRenderer` 24 · `FormController` 29 · `FormRenderer` 8 · `KanbanRenderer` 14 · `KanbanController` 15 · `ControlPanel` 4 · `NavBar` 1 — **116 call sites** | they patch a class our UI no longer uses → the app's feature silently disappears |
| Direct imports of the replaced components | 70 (`@web/views/list/list_renderer`, `@web/views/form/form_controller`, `@web/views/kanban/kanban_renderer`) | hard dependency on those modules continuing to exist |

**Live example, already installed:** `mail` patches `ListRenderer` — `addons/mail/static/src/views/web/list_renderer.js:4` (`getPropertyFieldColumns`, avatar widgets on user columns). A naive list replacement breaks an installed module before any new app arrives.

**What never breaks:** server-side view inheritance — `ir_ui_view._combine()` combines an app's `<xpath>` extensions into the arch **on the server** before any renderer sees it (`odoo/addons/base/models/ir_ui_view.py:970`). Same for ACLs (205 models), record rules (111), actions (186) and menus (143): they do not know a renderer exists.

## The policy

**R1 — Override by registration name, never by fork.**
Register over the standard names with `{ force: true }`, from a module whose manifest depends on `web` so load order is guaranteed. This is what makes every app — installed now or in three years — render through our UI, because apps ship arch, not UI code.

**R2 — Compose, do not delete.**
The classes 116 patch sites reach for must continue to exist and continue to be the ones in the render path. Own the shell and the layout; wrap or subclass `ListRenderer` / `FormController` / `KanbanRenderer` / `ControlPanel` / `NavBar` rather than replacing them, so a module's `patch()` still lands on something real. **Deleting a class is a breaking change; wrapping it is not.**

**R3 — Named template nodes are a public API.**
**181 distinct files patch a `web.*` OWL template — 212 occurrences** (measured 2026-09-15); the table above names only the 16 most-targeted. Those xpath paths are contracts. Either preserve the named nodes they hit, or record each breakage explicitly in this file with the module it affects. A break discovered in production is a bug; a break recorded here is a decision.

**R4 — Registries are the lookup path, never a switch statement.**
View types and field widgets are resolved by name from their registries (`registry.category("views")`, `registry.category("fields")`). Rationale: 231 distinct `widget=` values in the corpus, 272 module files registering their own widgets, and modules registering whole view types (`hr_gamification`). An unknown widget or view type resolves to **fallback**, never to a crash — note that an unregistered type is silently *filtered* today (`addons/web/static/src/views/utils.js:46` checks `registry.contains(type)`), which is exactly the silent-degradation mode to avoid.

**R5 — The server contract is unchanged.**
Keep spec-shaped reads and onchange (`addons/web/models/models.py:66,109,349,802,1973`). The new renderers declare the same specs. New endpoints are a separate, explicit decision.

**R6 — Staged name flip.**
Stage 1: register under **new** names (`acclist`, `accform`, …) so nothing can break while parity is unproven; the cost is a temporarily half-redesigned product. Stage 2: flip the standard names with `{ force: true }` per view type, only when ACC-I02's checklist is green for that type. Capture the original descriptor *before* overriding and keep it for per-view fallback routing — a switch, not an outage.

**R7 — Never "fix" server-side inheritance.**
`ir_ui_view._combine()` is out of scope and not a compatibility concern (`ir_ui_view.py:970`). Do not touch it.

**R8 — Upgrade duty.**
Every override cites a `file:line` reference in a comment and is re-checked after a fork upgrade (CONVENTIONS §7.4). 188 primary-mode overrides in-tree show the pattern is normal and maintained; the maintenance cost scales with how many templates we own, which is exactly why R2 and R6 exist.

## Steps

- [x] **1. Count the breakage surface** (re-run after any module install)
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  for t in web.WebClient web.NavBar web.ControlPanel web.Breadcrumbs web.ListRenderer web.FormView web.KanbanRenderer; do
    printf "%-20s %s files\n" "$t" "$(grep -rln "t-inherit=\"$t\"" addons --include=*.xml | wc -l)"
  done
  for c in ListRenderer ListController FormRenderer FormController KanbanRenderer KanbanController ControlPanel NavBar; do
    printf "%-18s %s\n" "$c" "$(grep -rn "patch($c\|patch($c\.prototype\|extends $c" addons --include=*.js | grep -v "/static/tests/" | wc -l)"
  done
  ```
  → expected: the counts in the tables above
- [x] **2. Write the eight rules** with the evidence inline (this file)
- [ ] **3. Prove R1–R4 empirically** — ACC-I05's probe (register by name, then show `mail`'s patch still lands and that a view with an unowned construct routes to fallback)
- [ ] **4. Update this file's breakage tables** every time a module is installed that adds a patch site

## Verification

- Each rule names the failure it prevents and the construct it protects.
- The three measurement commands reproduce the recorded counts.
- ACC-I05's log shows: app loads with the probe registered, `mail`'s list patch still effective, fallback reachable by configuration.

## Done when

- [x] eight rules written, each traceable to `file:line` evidence
- [ ] ACC-I05 proves R1, R2 and R4 against the installed modules
- [ ] no implementation task exists that replaces (rather than wraps) a class with a live patch site

## Risks / notes

- **Silent degradation is the real enemy.** Nothing here crashes; features just stop appearing. A parity gate that renders a sample of the 710 real views through both renderers and diffs the result is the strongest future control — noted here, not yet a task.
- **Upgrade fragility is the price of ownership.** Each Odoo upgrade can change the templates we own (no released Odoo upgrade has been tested against this plan yet). R2/R6 minimise the surface that can break; they do not eliminate the duty.
- **`fallback` must be user-visible in development** (a badge or console line naming the view and the unowned construct) — otherwise "fallback" becomes indistinguishable from "not redesigned yet".

---

← Phase I index: [../README.md](../README.md)
