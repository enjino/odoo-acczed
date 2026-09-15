# Conventions — acczed plans, tasks and modules

Two conventions live here: how **tasks** are named and written, and how **modules** are named and written.
Both are binding; if a file breaks one, fix the file.

## 1. Task identifiers

```
ACC-<phase letter><two-digit number>
```

- `ACC-A01`, `ACC-B07`, `ACC-C03`, `ACC-E06` …
- The letter is the phase (A–G), the number is the order inside that phase (starting at 01, zero-padded).
- Identifiers are **never reused and never renumbered**: insert a new task in between as `ACC-C03b` and move
  on (renumbering breaks every commit message and cross-reference).

## 2. Task files

```
docs/plans/<PhaseLetter>-<phase-slug>/ACC-<phase><NN>-<kebab-slug>.md
docs/plans/C-dark-theme/ACC-C01-map-tokens-to-scss-variables.md
```

- One folder per phase, one file per task — never one big file with everything.
- Slug: lowercase, kebab-case, English, describes the action (`install-rtlcss`, not `rtl`).
- Every task file uses exactly this shape, in this order:

```markdown
# ACC-C01 — Map the site tokens onto Odoo SCSS variables

| Field | Value |
|---|---|
| **Phase** | C — Dark Space Botanical backend theme |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B05 |
| **Estimated** | 45 min |
| **Touches** | <files or systems this task may modify> |

## Goal
One sentence: what is true after this task that was not true before.

## Context (verified)
- Facts quoted from live code or the database, each with a `file:line` reference.

## Steps
- [ ] **1. Imperative step title**
  ```bash
  exact command
  ```
  → expected: the observable output

## Verification
- The commands that prove it, and the value they must return.

## Done when
- [ ] A checklist a reviewer can walk through cold.

## Risks / notes
- Failure modes, caching traps, reversibility.
```

## 3. Status values

| Symbol | Meaning |
|---|---|
| ⏳ | not started |
| 🚧 | in progress (someone is on it) |
| ✅ | done — evidence exists in `evidence/` |
| 🅿️ | parked — deliberately deferred, with the reason in the file |
| ⛔ | blocked — name the blocker and what unblocks it |

Update the status **in the phase table of `README.md` and in the task header** — both, or neither.

## 4. Dependencies

- `Depends on` lists task IDs, never prose (`ACC-B05, ACC-C01`).
- `—` means no dependency.
- A task may only be started when every task it depends on is ✅ (or explicitly waived in writing).

## 5. Git conventions (when the time comes)

- Branch: `acczed/ACC-C01-map-tokens-to-scss-variables`
- Commit subject: `ACC-C01: map site tokens to Odoo SCSS variables` (imperative, ≤ 72 chars, ID first).
- One task = one commit where practical; a commit touching several tasks names the primary one and lists the
  rest in the body.

## 6. Evidence

- Screenshots and command output go in `evidence/`, named `before-*` / `after-*` with the screen or purpose
  in the name (`after-backend-ar-list.png`), never `screenshot1.png`.
- `evidence.log`: one line per verification — date, command, short output.

## 7. Module conventions (acczed-addons repo)

1. Module names: `acczed_<domain>` (`acczed_theme`, `acczed_sa_payroll`).
2. Manifest version: `19.0.x.y.z`.
3. Never edit fork files directly — inherit views, extend models.
4. Every override cites a `file:line` reference in a comment and is re-checked after a fork upgrade.
5. Every visual change ships with before/after screenshots.
6. No hardcoded `left`/`right` in SCSS — logical properties or `/*rtl:ignore*/`.
7. No secrets in the repo — `odoo.conf` locally, server-side `.env` in production.

## 8. Done-gate for any feature task (phase G onwards)

A task is not done until all four hold:

- [ ] Behaviour verified by a command (SQL query, HTTP route, or a test) whose output is recorded.
- [ ] Arabic check: new strings in `i18n/ar.po`, new SCSS respects RTL. **Mechanised by
      `bash tools/verify-rtl.sh --check 5`** (added by ACC-E04, 2026-09-15) — it exports the module's
      terms with Odoo's own extractor and fails, naming each string, when one has no Arabic
      translation. It reports **VACUOUS, not PASS**, when a module authors no strings at all, so an
      empty module cannot read as a green tick. The SCSS half of this check is the directional-property
      grep in ACC-C01's Done-when.
- [ ] Screenshot in `evidence/` if anything visible changed.
- [ ] Zero modifications under the fork's `addons/` tree.
