# ACC-I04 — Produce the shell mockups and close the open decisions

| Field | Value |
|---|---|
| **Phase** | I — UI shell redesign |
| **Status** | 🚧 mockups rendered 2026-09-15 (`mockups/acczed-shell-mockup.html`, 9 states in `evidence/`) — **awaiting the D2/D3/D4 decisions** |
| **Depends on** | ACC-I01, ACC-I02, ACC-I03 |
| **Estimated** | half a day |
| **Touches** | `docs/plans/I-ui-shell/mockups/*.html` (new, artifacts only — **no product code**), `docs/plans/evidence/`, ACC-I01's decision table |

## Goal

Three mockups of the **already-decided shape** (ACC-I01 §1: one sidebar — section headings → apps →
menu trees expanding inline), rendered at real widths in both directions, that close the three remaining
decisions — D2 (density behaviour at 1366px), D3 (nav extras), D4 (palette). **No code until the user approves a variant.**

**Deviation from the original plan, recorded:** the three variants (A/B/C) are implemented as **switchable
states inside one artifact** — `mockups/acczed-shell-mockup.html` — instead of three files. Reason: they are
variations of one fixed shape, and a single artifact makes them comparable side by side (and screenshot-able
from the command line) with no duplicated CSS. Variant *A* = default density, *B* = compact/floating,
*C* = extras on (pinned recents + ⌘K); the switches also cover D4 (palette) and the RTL/1920 states.
Shareable state via query string: `?dataset=full&app=account&density=compact&chatter=on&dir=rtl&view=form&palette=desaturated`
(the rail is gone, so `section=` no longer exists; `app=` also expands that app's menu for the screenshot).

## Context (verified)

**The shape is no longer a question.** D1 and D5 were resolved 2026-09-15 (`ACC-I01-ui-shell-design-spec.md`,
decisions table): sections group apps, admin-authored, visual only, and render as **collapsible headings inside
one sidebar**; each app expands its menu tree inline. These mockups therefore explore **behaviour, extras and palette
inside a fixed shape** — they are not three competing layouts.

The decisions still open:

| # | Question | Options |
|---|---|---|
| **D2** | What gives at 1366px with chatter open | sidebar narrows to 172px (what the mockup does) / chatter becomes a drawer / sidebar hides entirely / decide from the mockups |
| **D3** | Nav extras | pinned recents + ⌘K palette / pin only / palette only / none |
| **D4** | Palette and accent | keep Dark Space Botanical greens / adopt VS Code's desaturated-accent philosophy / hybrid (green for glow + focus, desaturated structure) |

States every variant must render, because each one is a constraint from the codebase:

| State | Why it is required |
|---|---|
| **Sections folded / apps expanded** | headings fold, apps expand their trees inline — the accordion has to stay legible when both are on screen at once |
| List view + chatter open, 1366×768 | the horizontal-budget constraint: a 280px sidebar (172 squeezed) plus ~30% chatter leaves ~700px of work area |
| Form view with a notebook | `notebook` 124 · `page` 323 in the corpus — tabs are common and eat vertical space |
| Width states: 236 compact · 172 narrow · floating inset | VS Code's contract of *named* width states (`activitybarPart.ts:50-56`) — D2's answer must be one of them, not an ad-hoc pixel value |
| Fullscreen escape | the shell already hides `NavBar` in fullscreen (`webclient.xml:4-5`); the sidebar must obey the same rule |
| **600-menu stress tree** | 143 menu rows today, 613 modules uninstalled (573 excluding test fixtures) — Settings alone holds 102, and the tree must stay usable 4× bigger |
| **`dir=rtl` mirror** | phase E is complete: `ar_001` active, `rtlcss` installed. The sidebar mirrors to the right edge — a first-class state, not a later pass |
| App rows with real icons | `ir_ui_menu.web_icon` / `web_icon_data` (`ir_ui_menu.py:34,41`) — the app rows draw from real icon data. Sections carry **no** icon: they are headings (no rail to feed) |

## Steps

- [x] **1. Build the variants as standalone HTML** (2026-09-15 — one artifact, four density states: `?density=default|compact|narrow|floating`, `?extras=on|off`, `?palette=botanical|desaturated`) (artifacts in the repo, opened through the desktop preview — no framework, no build step)
  ```bash
  ls docs/plans/I-ui-shell/mockups/
  ```
  → expected: `acczed-shell-mockup.html` (one artifact; variants are switchable states)
  - **A — the shape at default density:** 280px sidebar, VS Code's metrics by the numbers (§7 of ACC-I01) — the baseline to judge the others against
  - **B — compact (236) / narrow (172) / floating inset:** the density states, including the chatter squeeze — this is the candidate that answers D2 by design
  - **C — the extras drawn:** pinned recent apps at the top of the sidebar and the ⌘K palette affordance — this is the candidate that answers D3
- [x] **2. Render every state, both directions** (2026-09-15 — headless Chrome; `i04-01`…`i04-09` in `evidence/`)
  ```bash
  ls docs/plans/evidence/ | grep i04
  ```
  → expected: one screenshot per variant × state, named `i04-<variant>-<state>-<ltr|rtl>.png`
- [x] **3. RTL rendered under the same rule the SCSS must obey** (2026-09-15 — the mockup contains **zero** hardcoded `left`/`right`: the whole shell mirrors from `dir="rtl"` alone) — logical properties only, no hardcoded direction (CONVENTIONS §7.6); the mockup's `[dir=rtl]` block is the design half of that rule
  ```bash
  grep -n "left:\|right:" docs/plans/I-ui-shell/mockups/*.html
  ```
  → expected: hits only inside `[dir=rtl]` blocks or explicitly marked exceptions
- [ ] **4. Present the variants and record D2, D3, D4 in ACC-I01's table, dated**
  ```bash
  grep -n "| D2 \| D3 \| D4 " docs/plans/I-ui-shell/ACC-I01-ui-shell-design-spec.md
  ```
  → expected: three rows carrying ✅ and the date
- [x] **5. Section icons — dropped 2026-09-15.** The rail they existed for was removed, and sections are now headings inside the sidebar: they carry no icon of their own. (The six monoline glyphs are still in the artifact's source, unused.)
  ```bash
  ls docs/plans/I-ui-shell/mockups/icons/ 2>/dev/null || echo "to produce"
  ```
  → retired: no section icons are required (see step 5)

## Verification

- User approves one variant (or names a mix) — recorded in ACC-I01, attributed, dated.
- Every state in the table above exists as a screenshot in `evidence/`, in both directions.
- No file under `acczed-addons/` or the fork's `addons/` was touched by this task (`git status` clean in both repos).

## Done when

- [ ] three variants rendered across all states, LTR and RTL
- [ ] D2–D4 recorded in ACC-I01 with the date
- [ ] the approved variant's density behaviour (sidebar width states, the 172px squeeze rule) written into ACC-I01 §2
- [ ] implementation tasks (ACC-I06+) are now writable from an approved look

## Risks / notes

- **Mockups are artifacts, not a codebase.** If a variant needs JS to demo a collapse, keep it inline and throwaway; the real implementation starts at ACC-I06 under CONVENTIONS §7.
- **Chatter width is the trap.** Drawing a beautiful sidebar at 1920px is easy and misleading; the 1366px + chatter state is the one that decides D2 — and the sidebar is now the *only* navigation, so that state is the whole question.
- **Icon honesty:** draw the app rows from `web_icon_data` where possible; invented glyphs hide that most installed apps have no icon yet.
- **The sidebar's floor is 172px** (ACC-I01 §1): below that, the chatter becoming a drawer is the documented next step — not resurrecting an icon rail.
- **The 600-menu stress state is not optional** — it is the only state that shows whether the paradigm survives the modules the product is actually for.

---

← Phase I index: [../README.md](../README.md)
