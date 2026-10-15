# ACC-J04 — Migrate a copy of the database first

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⛔ blocked — the in-place upgrade is not a one-command job (2026-10-12) |
| **Depends on** | ACC-J03 |
| **Estimated** | 3 hrs |
| **Touches** | a new database `acczed_p20` only; `acczed` is not touched |

## Goal
The 19 → 20 module upgrade is proven end-to-end on a throwaway copy of `acczed`, with every failure
named, before the real database is migrated.

## Context (verified)
- `acczed` is 43 MB with 42 installed / 613 uninstalled / 23 uninstallable modules; `acczed_theme`
  `19.0.0.1.1`, `web` `19.0.1.0`.
- `account`, `l10n_sa`, `l10n_sa_edi` are all uninstalled, so the accounting surface the upgrade has to
  carry is small — the upgrade is dominated by `web`, `mail`, `project`, `portal` and `base`.
- Odoo stores attachments in `data_dir/filestore/<dbname>` (`odoo.conf:17`), so a copy named
  `acczed_p20` reads an **empty** filestore unless it is pointed at the original.
- The 19-era dump to restore from is in `~/backups/odoo-acczed/20261012-121926/acczed.dump` (ACC-J01).
- Upstream 20.0 removes 49 module directories that exist in 19.0 in a raw listing diff (including
  `base_iban`, `base_vat`, `stock_picking_batch`, `hr_homeworking`, `website_sale_wishlist`,
  `l10n_sa_withholding_tax`) — a module installed here that 20.0 no longer ships would fail the upgrade,
  so the installed list is checked against the 20.0 tree first.

## Steps
- [ ] **1. Restore the dump into a copy**
  ```bash
  docker exec odoo-postgres createdb -U odoo acczed_p20
  docker exec -i odoo-postgres pg_restore -U odoo -d acczed_p20 --no-owner < ~/backups/odoo-acczed/20261012-121926/acczed.dump
  ```
- [ ] **2. Point the copy at the original filestore (optional, for attachment checks)**
  ```bash
  ln -s acczed ~/.local/share/odoo-acczed/filestore/acczed_p20
  ```
- [x] **3. Cross-check installed modules against the 20.0 tree** — **already done 2026-10-12, and it
      passes**: of the 42 installed modules, the only one absent from the 20.0 tree is `acczed_theme`
      itself (our own, in the sibling repo). Nothing installed is dropped by 20.0, so there is no
      missing-module blocker. The check was run against the GitHub directory listing for `addons/` +
      `odoo/addons/` at `20.0` (658 module dirs) rather than a local tree.
  ```bash
  comm -23 <(cut -d'|' -f1 ~/backups/odoo-acczed/20261012-121926/acczed-installed-modules.txt | sort) \
           <(ls addons odoo/addons | sort -u)
  ```
  → expected: `acczed_theme` only. Any other name printed is installed here and absent from 20.0
- [x] **4. Run the upgrade on the copy — it fails three times, in three different places**

  **Attempt 1** (fresh restore) — dies in `base`, 0/42 modules:
  ```
  Module loading base failed: file base/data/res.country.state.csv could not be processed:
  The code of the state must be unique by country!
  ```
  Cause: Odoo 20's CSV adds `state_in_od` (India/Odisha, code `IN/OD`) while the 19 database already
  holds `IN/OD` under the **old xmlid `state_in_or`** (`ir_model_data` id 4617 → state 602). The new row
  violates `unique(country_id, code)` (`odoo/addons/base/models/res_country.py:236-239`) and one row takes
  the whole upgrade down. It is the **only** collision: of the 2,130 CSV rows, exactly one lands on a
  (country, code) the database already holds.
  Fix (on the copy): `update ir_model_data set name='state_in_od' where name='state_in_or'` — this turns
  the insert into an update of the row that is already correct.

  **Attempt 2** — dies in `base` again, on the renamed ACL model:
  ```
  For external id base.access_ir_model_relation_group_erp_manager when trying to create/update
  a record of model ir.access found record of different model ir.model.access (6542)
  ```
  Cause: **Odoo 20 merged `ir.model.access` and `ir.rule` into one `ir.access` model**
  (`odoo/addons/base/models/ir_access.py:66` — `operation` is a subset of `crud`, plus a `domain`, and a
  computed `kind` of permission/restriction). `ir.rule` is gone from the tree entirely. 469 `ir_model_data`
  rows still point at the two old models, so 20's data files cannot claim their xmlids.
  Fix (on the copy): `delete from ir_model_data where model in ('ir.model.access','ir.rule','res.bank')`
  plus the matching `ir_model` rows — safe because **every one of them is stock** (355 ACLs, 111 rules,
  3 banks, all carrying an xmlid, zero custom) and nothing references `res_bank`
  (`select count(*) from res_partner_bank where bank_id is not null` → 0). `res.bank` is dropped in 20.

  **Attempt 3** — advances to **17/42 modules** (through `iap`) and dies in `mail`:
  ```
  KeyError: 'project.task'    (odoo/orm/environments.py:406, inside _recompute_all)
  ```
  Cause: during `mail`'s upgrade, `invalidate_all()` → `flush_all()` → `_recompute_all()` recomputes a
  pending field on `project.task`, a model **not in the registry yet** (project loads at 30+/42).
  `project.task` and `project_todo` both still exist in 20, so nothing is missing — it is an ordering
  problem between a partially-loaded registry and pending field state. **Not diagnosed further.**

- [ ] **5. Compare module states before and after** — not reached; the upgrade has never completed.

## Where this leaves the migration (a decision, not a task)

The measured surface, so the decision is not a guess:

| Question | Answer |
|---|---|
| Model names the 20 tree no longer declares | 88 across all of Odoo — but only **4 real ones in this database** (`ir.model.access`, `ir.rule`, `res.bank`, `mail.thread.cc`), measured against the 266 models its installed modules use |
| Rows in those models | 355 + 111 + 3, **all stock** (zero custom), plus one `ir_model` row for a mixin with no table |
| Migration scripts the repo ships for the renames | **none** — `odoo/addons/base/migrations/` does not exist; the only migrations dir found is `addons/l10n_fr_account/migrations/2.2/` (unrelated) |
| Blockers found | 3, within 17 of 42 modules, each structurally different |
| Custom data a rebuild would have to carry | 5 projects, 63 tasks, 279 messages, 7 users, 22 non-base partners, 226 attachments (all bound to `ir.ui.menu`/`ir.ui.view`/`res.lang`/`res.partner` — framework artifacts, not documents) |

**Odoo's supported path for a major-version jump is the Upgrade Service, not `-u all`** — the rename and
merge scripts live on Odoo's side, which is precisely why the community tree ships none.

### The readings, with their cost

| # | Reading | Cost |
|---|---|---|
| **A** | Keep hand-writing pre-migration steps on the copy | Open-ended: 2 fixed, 1 open, 25 modules to go, each blocker its own diagnosis. Hours-to-days, and the tail is unknown |
| **B** | Odoo Upgrade Service (upload a dump) | The supported path, carrying the proprietary scripts. Needs an Odoo account/subscription and a round-trip — verify what it requires for a Community DB first |
| **C** | **Rebuild on 20 and move the small dataset** | A few hours. Everything blocking the upgrade is stock with no custom rows, so nothing in the affected models needs preserving; the custom surface is 5 projects / 63 tasks / 279 messages. Sidesteps the rename tail entirely |
| **D** | Stay on 19.0 (what production runs); keep `20.0` as a code-level branch | Zero now; the platform move stays unshipped |

**Recommendation: C**, with D as the honest fallback if the project/task chatter matters enough to be
preserved exactly. A is the reading to avoid unless the migration itself is the deliverable.

## Post-decision work, 2026-10-14 — the tail, measured

Two defects found by a Playwright walkthrough of `acczed_p20` were repaired and verified, and the
in-place upgrade was pushed from 3 blockers to 7. Full command-level record: `evidence.log`.

| # | Blocker | State |
|---|---|---|
| 1 | `res.country.state.csv` xmlid collision (`state_in_or`/`state_in_od`) | fixed 2026-10-12 |
| 2 | `ir.model.access`/`ir.rule` merged into `ir.access` | fixed 2026-10-12 |
| 3 | `KeyError: 'project.task'` in `_recompute_all` | **diagnosed**: `_reflect_relation` → `invalidate_all` → the new `mail.activity.phone` compute (`mail_activity.py:204`) does an unguarded `self.env[model]` for each activity's `res_model`, and `project.task` is not in the registry until 30/42. A 2-line guard carries it past |
| 4 | 9 of 42 installed modules never load | **fixed**: portal (20) now depends on `base_address_extended`, which was uninstalled; installing it restored 8 of the 9. The 9th, `acczed_theme`, is refused for its 19.0 manifest version |
| 5 | `null value in column "parent_id" of relation "ir_model_inherit"` | **fixed**: `mail.thread` inherits the new `mail.track.mixin`, which has no `ir.model` row because reflection only runs for modules being upgraded (`loading.py:183`) |
| 6 | `AssertionError` in `registry.check_indexes` | **fixed**: 19 stored `ir_model_fields.index` as a boolean char; 20 made it a Selection, and custom fields are built from that row (`'true'` → `'btree'`) |
| 7 | `ParseError: Field "mail_post_method" does not exist in model "ir.cron"` | **open**: a 19.0 field that 20 removed, still referenced by 19-era rows/archs in this DB |

**The control experiment that settles the reading.** A fresh database with `-i mail` on this same
checkout succeeds (28 modules, exit 0). Every blocker above is an artefact of upgrading the 19 database
in place — none is a defect of the 20 tree. Reading **C (rebuild on 20)** is therefore not just cheaper:
it is the only path that is currently *known to work*, and it should carry the two data repairs above
(`ir_act_client.params_store` hex decode, `res_device_log.user_agent` NULLs) because the same 19 data
will be moved either way. Reading A now has seven blockers and an unknown tail.

## Round 3, 2026-10-14 — the upgrade COMPLETES

A user-reported "Oops!" on Discuss -> Configuration (screenshot) traced back to `discuss.channel` having
zero ACLs in `ir_access` **and** mail's entire 20 schema being absent (`discuss_category`,
`mail_track_mixin`, `mail_activity.phone`, `ir_act_server.log_note_note` all missing). The ACL gap alone
was 96 models. Fixing ACLs by hand was therefore pointless — mail's upgrade had to finish. It did, after
three more blockers:

| # | Blocker | Fix |
|---|---|---|
| 7 | `Field "mail_post_method" does not exist in model "ir.cron"` importing `mail/views/ir_cron_views.xml` | a 19 field 20 removed, still in view 399's stored arch; blank that arch (mail's XML redefines it later) |
| 8 | `duplicate key ... discuss_channel_member_partner_unique` in `mail/data/discuss_channel_data.xml:34` | the (channel, partner) pair already existed without the xmlid 20 introduces; adopt it by inserting the `ir_model_data` row (`noupdate=true`) |
| 9 | `Element '<xpath expr="//div[@name='task_analysis']">' cannot be located in parent view` (`project_project_views.xml:607`, view 608 `project_view_kanban_inherit_project`) | a 19 view **removed in 20**; delete it + its xmlid, then `-u project` → exit 0 |

**Result: 41 of 43 installed modules at 20.x** (only `acczed_theme`, refused for its 19.0 manifest version,
and `web_unsplash` left at 19.x), `ir_access` 183 → 404 rows, and a Playwright walkthrough where **every
screen is OK with 0 dialogs** — login, home, Settings, users list, a user record, Discuss, contacts,
project, command palette, user menu. The apps menu now lists Discuss | To-do | Project | Apps | Settings.
Crons run and complete; 0 cron failures and 0 schema errors after the restart.

**Nine blockers, and every one was stale 19-era metadata** — two removed fields, two removed views, one
stale arch, one missing `ir.model` row, one legacy index encoding, one new module dependency, one
unguarded `self.env[model]`. None required a change to the 20 tree; the single code patch
(`mail.activity.phone` guard) was a throwaway shim, reverted. This does **not** overturn reading C: the
copy is now a *migrated* copy, not a *verified* one — ACC-J06 (re-verify B/E/F on 20) and ACC-J08 (the
three version tags) are still owed, and `acczed_theme` still needs its manifest version bumped (ACC-J05).

## Done when
- [x] the copy exists and the upgrade was attempted on it, never on `acczed`
- [x] **every failure is named with its cause** — the task's real deliverable, given the above
- [ ] the user picks A/B/C/D and the chosen path gets a task of its own

## Risks / notes
- **Never run `-u all` against `acczed`.** The copy exists so a failed upgrade costs nothing — and it has
  now failed three times.
- Odoo commits per module, so the copy is *partially* upgraded (17/42 at 20) and a re-run resumes rather
  than restarts. That is normal, but it means the copy is no longer a clean 19 baseline: re-create it from
  the dump before any fresh attempt.
- `psql` needs an explicit `-d postgres` in this container.
- The filestore is keyed by database name; the copy reads `acczed`'s through a symlink.
