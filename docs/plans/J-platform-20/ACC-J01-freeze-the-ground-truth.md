# ACC-J01 — Freeze the pre-move ground truth

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ✅ done (2026-10-12) |
| **Depends on** | — |
| **Estimated** | 30 min |
| **Touches** | `~/backups/odoo-acczed/` (new), nothing tracked in either repo |

## Goal
A restorable copy of every database, the filestore, the config and both repos' in-flight work exists
outside the repos, so the 19 → 20 move is reversible.

## Context (verified)
- Databases and sizes, measured before the dump: `acczed` 43 MB, `acczed_theme_check` 43 MB,
  `mcp_test` 54 MB (`docker exec odoo-postgres psql -U odoo -d postgres -Atc "select datname||'|'||pg_size_pretty(pg_database_size(datname)) from pg_database"`).
- `acczed` holds 42 installed / 613 uninstalled / 23 uninstallable modules; `acczed_theme` is at
  `19.0.0.1.1`, `web` at `19.0.1.0`.
- The filestore is `data_dir/filestore` under `/home/ahmed-karmy/.local/share/odoo-acczed` (`odoo.conf:17`).
- **This project had no backup of any kind before this task** — `~/backups/` did not exist.
- `acczed-addons` carries uncommitted work in flight (ACC-F02b: `acczed_theme/__init__.py` +10,
  `acczed_theme/__manifest__.py` +12, `scripts/gen-tokens.mjs` +217), so a HEAD record alone would
  lose it. `acczed-site` carries `next-env.d.ts` + an untracked `AGENTS.md`.

## Steps
- [x] **1. Run the backup script**
  ```bash
  bash ~/.hermes/scripts/odoo-acczed-backup.sh
  ```
  → expected: three `*.dump`, `filestore.tar.gz`, `SHA256SUMS`, `BACKUP_DIR=…`

## Verification
- `ls ~/backups/odoo-acczed/20261012-121926` → 31 files
- `cd ~/backups/odoo-acczed/20261012-121926 && sha256sum -c SHA256SUMS` → all OK
- `pg_restore -l acczed.dump | head` → valid archive listing

## Done when
- [x] dumps + filestore + `odoo.conf` + all four repos' HEAD/status/diff written and hashed
- [x] `BACKUP_DIR` recorded in `evidence/evidence.log`

## Risks / notes
- The dump was taken with the stack **stopped** (`run-odoo.sh status` → both processes not running),
  so it is consistent without quiescing anything.
- `psql` in this container needs an explicit `-d postgres`: the `odoo` role has no database of its own,
  so the default database lookup fails (`FATAL: database "odoo" does not exist`). Cost one aborted run.
- The script is re-runnable and writes a fresh timestamped directory each time — keep the newest
  pre-move one, it is the rollback source.
