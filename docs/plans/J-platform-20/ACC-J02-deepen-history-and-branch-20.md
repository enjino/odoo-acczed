# ACC-J02 — Deepen the history and create the `20.0` branch

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | 🚧 in progress |
| **Depends on** | ACC-J01 |
| **Estimated** | 1–2 hrs (mostly bandwidth) |
| **Touches** | the fork's `.git`, the `upstream` remote, new branch `20.0`; `19.0` stays untouched |

## Goal
The fork holds upstream Odoo 20.0 with our 21-commit delta replayed on top, on a `20.0` branch, while
`19.0` — the branch production still runs — is byte-identical to before.

## Context (verified)
- Upstream `20.0` head is `65028bb24ba4a85d80cfdf0b983f7cc583743ec1`; upstream `19.0` head is
  `f25474a65d6155d860a75de065236b9fd3639960`.
- **Merge base of `19.0` and `20.0` is `101027acc286596c956839deccab6a1b26e33e9d`, dated
  2025-08-04T05:47:25Z** (GitHub compare API) — the stable branch was cut from master that day. Any
  merge needs history back to it on **both** sides.
- Our clone is shallow: `.git/shallow` contains `b4da2f44`, and neither side currently reaches that
  ancestor. `git fetch --unshallow` would pull the full ~17 GB pack; `--shallow-since=2025-07-01`
  reaches the ancestor with roughly a year of history instead.
- Our base `b4da2f44` is **726 commits behind** upstream `19.0` head (`compare b4da2f44...19.0` →
  ahead_by 726, behind_by 0), i.e. it is a clean ancestor — our fork diverged by adding commits, not
  by rewriting any.
- Our delta is `docs/**`, `tools/**`, `run-odoo.sh`, `.gitignore`, `logs/.gitkeep` — **zero files under
  `addons/` or `odoo/`**: `git diff --name-only b4da2f44 HEAD | grep -E '^(addons|odoo|setup)/'` →
  empty. `.gitignore` is the one file both sides edit, so it is the only expected conflict.
- `odoo.conf` is **not tracked** (`.gitignore` keeps it local), so it neither conflicts nor survives a
  re-clone — it is in the ACC-J01 backup.
- Measured bandwidth from GitHub on this machine: **1.7 MB/s**, so this task is a wait, not a click.

## Steps
- [ ] **1. Add the upstream remote and fetch both sides with a shared history window**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  git remote add upstream https://github.com/odoo/odoo.git   # if absent
  git fetch --progress --no-tags --shallow-since=2025-07-01 upstream \
      'refs/heads/19.0:refs/remotes/upstream/19.0' \
      'refs/heads/20.0:refs/remotes/upstream/20.0'
  ```
  → expected: one pack, and `.git/shallow` no longer names `b4da2f44`
- [ ] **2. Prove the common ancestor exists**
  ```bash
  git merge-base upstream/20.0 19.0        # → 101027ac286596c956839deccab6a1b26e33e9d
  ```
- [ ] **3. Create the branch at upstream 20.0**
  ```bash
  git switch -c 20.0 upstream/20.0
  ```
- [ ] **4. Replay our delta onto it**
  ```bash
  git merge 19.0 --no-ff -m "ACC-J02: carry the acczed delta (docs, tools, run-odoo.sh) onto Odoo 20.0"
  ```
  → expected: clean except `.gitignore`; resolve by keeping both sides' rules
- [ ] **5. Prove the delta arrived intact and 19.0 is untouched**

## Verification
- `git merge-base --is-ancestor 19.0 20.0 && echo ok` → `ok`
- `git diff 19.0 20.0 -- docs tools run-odoo.sh logs` → **empty** (our content, byte-identical)
- `git diff 19.0 20.0 --stat -- addons odoo setup` → the 19→20 upstream diff only
- `git log --oneline upstream/20.0..20.0 | wc -l` → 22 (our 21 + the merge commit)
- `git rev-parse 19.0` → `e388db061d4c19440a0f00ed4e6580b3336a22ad` (unchanged)

## Done when
- [ ] branch `20.0` exists, contains upstream 20.0 and our delta
- [ ] `19.0` is still at `e388db06` and still runs
- [ ] the empty-diff proof above is recorded in `evidence/evidence.log`

## Risks / notes
- **Do not push yet.** Pushing `20.0` to `origin` uploads the whole 20.0 history the fork does not
  have (~1–2 GB at 1.7 MB/s) and can hit a server-side timeout; that is its own step in ACC-J08.
- **Never `git reset` or force `19.0`.** It is the branch production runs.
- If `--shallow-since` is refused on an already-shallow repo, fall back to a scratch clone
  (`git clone --depth 20000 --single-branch --branch 20.0 <url> /tmp/odoo20`) and then
  `git fetch /tmp/odoo20 20.0:refs/remotes/upstream/20.0` — the objects come from local disk, so it
  downloads once.
- Merging 20.0 *into* 19.0 instead would produce a branch that claims 19 and contains 20 — reject that
  shape; the platform identity is the branch name.
