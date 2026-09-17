# ACC-I05 — Prove the compatibility policy with a probe

| Field | Value |
|---|---|
| **Phase** | I — UI shell redesign |
| **Status** | ⏳ not started |
| **Depends on** | ACC-I03 |
| **Estimated** | 2–3 hrs |
| **Touches** | `acczed-addons/` — a throwaway probe module (never merged as product code), `docs/plans/evidence/` |

## Goal

Turn ACC-I03's policy from a written argument into observed behaviour: register a probe renderer by name, load the real app, and record exactly what survives, what degrades and what breaks — **before** 34,050 LOC of renderers are written on top of assumptions.

## Context (verified)

The policy predicts three outcomes (`ACC-I03-compatibility-policy.md`): new apps inherit the UI (R1), modules that patch web's classes keep working if we wrap rather than delete (R2), and unknown constructs route to fallback instead of degrading silently (R4).

The live test material already exists:

| Test subject | What it exercises | Source |
|---|---|---|
| `mail` (installed) | patches `ListRenderer.prototype` — avatars/property columns on every list | `addons/mail/static/src/views/web/list_renderer.js:4` |
| `project` (installed) | task views + `<notebook>` tabs, `groups=` gating | DB: `project` state=installed |
| `portal` (installed) | the customer-facing surface phase D will brand | DB: `portal` state=installed |
| 710 real views | the corpus the checklist is built from | `select count(*) from ir_ui_view` |

## Steps

- [ ] **1. Create the probe module** (throwaway: `acczed_ui_probe`, marked in its manifest description as a spike — **not** a product module, not a phase deliverable)
  ```bash
  ls ~/Desktop/Projects/acczed-addons/acczed_ui_probe/
  ```
  → expected: `__manifest__.py` (depends `['web']`), a JS file registering `views.add(..., { force: true })`, and nothing else
- [ ] **2. Probe A — override by name (R1)**
  ```bash
  # probe registers a list view type that renders a banner and delegates to the original
  ```
  → expected: every list view in the app shows the probe banner (proves a new name-registration reaches existing apps)
  → record: which screens changed, and whether any view *failed* to render
- [ ] **3. Probe B — compose, don't delete (R2)**
  ```bash
  # keep the original descriptor; assert mail's patch is still effective
  ```
  → expected: `mail`'s `getPropertyFieldColumns` still runs — user avatar columns still appear in a list of `res.users`-related records
  → record: the assertion output in `evidence.log`
- [ ] **4. Probe C — unknown construct routes to fallback (R4)**
  ```bash
  # register a list descriptor that deliberately refuses `editable=` and one unknown widget
  ```
  → expected: the affected view renders through Odoo's renderer with a **visible** notice naming the construct — not a silently degraded list
- [ ] **5. Record the breakage actually observed** and update ACC-I03's tables with anything the written counts missed
  ```bash
  tail -20 docs/plans/evidence/evidence.log
  ```
  → expected: probe results with dates, one line per check

## Verification

- Browser console captured for each probe (no uncaught errors; the probe's own notices visible).
- `git status` in `acczed-addons` shows the probe is the only addition; the fork's `addons/` tree is untouched (CONVENTIONS §8).
- Each of R1, R2, R4 has an observed outcome recorded — pass, or a corrected rule in ACC-I03.

## Done when

- [ ] three probes run against the installed modules with recorded output
- [ ] ACC-I03's tables updated where reality disagreed with the counts
- [ ] the probe module is deleted or explicitly parked (never shipped as product code)
- [ ] a decision recorded on whether stage-1 new names or an immediate standard-name flip is safer, given what the probe showed

## Risks / notes

- **Asset caching will lie to you.** After JS manifest changes use `-u acczed_ui_probe` or run with `--dev=assets`; otherwise the browser serves the old bundle and the probe looks like it "did nothing".
- **The probe must not become the product.** It exists to falsify assumptions; ACC-I06+ start clean.
- **A probe that passes proves the mechanism, not parity.** Parity is ACC-I02's checklist, tested view type by view type as each renderer lands.

---

← Phase I index: [../README.md](../README.md)
