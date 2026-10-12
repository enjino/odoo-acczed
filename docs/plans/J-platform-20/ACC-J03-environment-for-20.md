# ACC-J03 — Environment for 20: a second venv, branch-aware run-odoo.sh

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ✅ done (2026-10-12) |
| **Depends on** | ACC-J02 |
| **Estimated** | 1 hr |
| **Touches** | new `~/Desktop/Projects/odoo-acczed-venv20/`, `run-odoo.sh` on branch `20.0` |

## Goal
Odoo 20 runs from its own virtualenv with its own dependencies, and `run-odoo.sh` picks the venv for
the branch it is serving, so 19.0 stays runnable for production parity.

## Context (verified)
- Odoo 20 accepts Python **3.12 ≤ v ≤ 3.14** (`odoo/release.py:39-40` @20.0: `MIN_PY_VERSION = (3, 12)`,
  `MAX_PY_VERSION = (3, 14)`). Our venv is **Python 3.12.13** — in range.
- 20.0's `requirements.txt` drops every `python_version < '3.12'` pin (Werkzeug 2.2.2, psycopg2 2.9.5,
  lxml 4.9.3, Pillow 9.4.0, …) and adds `h11==0.16.0`; `tzdata` is win32-only. So the two branches do
  **not** want the same package set.
- `run-odoo.sh:10` hardcodes `VENV="$HOME/Desktop/Projects/odoo-acczed-venv/.venv"`, and the script is
  tracked, so branch `20.0` can carry a branch-aware version without touching `19.0`.
- The two-process model **survives** on 20 — re-checked 2026-10-12 against the 20.0 tree:
  `odoo/_monkeypatches/site.py` still gates on `if odoo.evented or not (len(sys.argv) > 1 and
  sys.argv[1] == 'gevent')`, and `odoo/tools/config.py` still defines `gevent_port` with no
  `longpolling_port` (1 vs 0 occurrences, same as 19.0).
- **`run-odoo.sh`'s readiness check is broken by 20, and this is the fix.** Lines 37-38 wait for two log
  strings that no longer exist:
  - 19.0 `odoo/service/server.py:283` `'HTTP service (werkzeug) running on %s:%s'` → 20.0
    `odoo/service/server.py:485` **`"HTTP service running on %s:%s"`** (the `(werkzeug)` is dropped)
  - 19.0 `:868` `'Evented Service (longpolling) running on %s:%s'` → **gone in 20.0**. The
    `GeventServer` class survives and still reads `config['gevent_port']`, but the only longpolling log
    line left is a `_logger.critical` error path.
  So on 20 the loop would spin all 45 seconds and print "Not confirmed ready yet" with both servers
  actually up — a false negative, not a failure to start. Replace the grep with a wait on
  `"HTTP service running on"` plus a direct probe of :8072.

## Steps (all run 2026-10-12)
- [x] **1. Create the second venv (Python 3.12)**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed-venv20 && uv venv --python 3.12
  ```
  → `uv venv <dir>` puts `bin/` in `<dir>`, while the 19 venv lives at `<dir>/.venv`; creating it from
  **inside** the directory matches the existing layout, so `run-odoo.sh` needs only the variable swap
- [x] **2. Install 20.0's requirements into it**
  ```bash
  env -u PYTHONPATH uv pip install --python ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python \
      -r ~/Desktop/Projects/odoo-acczed/requirements.txt
  ```
  → 62 requirement lines, all installed, no resolution conflict. The system-lib imports verified:
  `psycopg2 2.9.9` (source build against libpq-dev), `lxml 5.2.1`, `Pillow 10.2.0`,
  `reportlab 4.1.0`, `werkzeug 3.0.1`, `ldap 3.4.4`, `python-magic` ok. The tree's `requirements.txt`
  is byte-identical to the file that was installed
- [x] **3. Prove the version and the evented gate**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python odoo-bin --version
  grep -n "gevent" odoo/_monkeypatches/site.py | head
  grep -n "gevent_port" odoo/tools/config.py
  ```
  → **`Odoo Server 20.0`**; the `argv[1] == 'gevent'` gate and `gevent_port` both intact
- [x] **4. Make `run-odoo.sh` resolve the venv per branch, and fix the readiness check**
  ```bash
  VENV="${ODOO_VENV:-$HOME/Desktop/Projects/odoo-acczed-venv/.venv}"
  ```
  → default stays 19; branch 20.0 starts with `ODOO_VENV=…venv20/.venv`. The readiness block became a
  `wait_ready()` that accepts **both** log spellings and then probes the ports:
  `tail -n 200 "$LOGFILE" | grep -qE "HTTP service (\(werkzeug\) )?running on"` for :8069, and for
  :8072 either the old longpolling line **or** `port_open 8072` (`/dev/tcp` probe), because 20 never
  logs one.
- [x] **5. Smoke the merged tree end to end on a throwaway DB**
  ```bash
  env -u PYTHONPATH …/venv20/.venv/bin/python odoo-bin -c odoo.conf -d p20_smoke -i web --stop-after-init
  ODOO_VENV=…/venv20/.venv bash run-odoo.sh start
  ```
  → 16 modules loaded in 4.9 s, zero errors; both servers up and **ready in 3 s**

## Verification (all run 2026-10-12)
- `odoo-bin --version` → **`Odoo Server 20.0`**
- `bash run-odoo.sh start` → `Ready after 3s (http :8069, longpolling :8072)`; `ss -ltn` shows
  `127.0.0.1:8069` (pid 506388) and `127.0.0.1:8072` (pid 506389), both owned by
  `odoo-acczed-venv20/.venv/bin/python`
- `curl -L localhost:8069/web/login` → **200** (it 303s to `/web/database/selector` because `odoo.conf`
  sets `db_name = False` with `list_db = True` — expected, not a failure), and the selector lists
  `p20_smoke`
- **The log proves the fix was necessary in both directions:** the file contains the fresh
  `HTTP service running on 127.0.0.1:8069` *and* a stale 19-era
  `HTTP service (werkzeug) running on ahmed-karmy-HP-ProDesk:8069` from an earlier run — so the original
  whole-file grep would have matched the **stale** line and reported ready before the 20 server was up.
  Hence the `tail -n 200` window as well as the second spelling.

## Done when
- [x] venv20 exists and `odoo-bin --version` prints 20.0
- [x] both servers come up and the login route answers 200
- [x] `19.0` still runs with the original venv (its `run-odoo.sh` is untouched — the fix lives on
      branch `20.0` only, and accepts the 19 spelling too)

## Risks / notes
- **Do not upgrade the existing venv in place** — it would break the 19.0 branch, which is the only
  local reference for what production runs.
- uv venvs ship no `pip`; always `uv pip install --python <venv>/bin/python`.
- Hermes exports `PYTHONPATH`; wrap every odoo-bin / pip call in `env -u PYTHONPATH`.
- If `psycopg2` fails to build, `libpq-dev` is missing — check `pg_config --version` first.
- **The log is appended across runs, so a readiness grep over the whole file can be satisfied by a
  previous run's line.** That is a false *positive* (ready before the server is up), the mirror image of
  the false negative this task fixed. Read the tail only.
- `p20_smoke` is a throwaway (16 modules, `web` only) created to prove the platform boots; drop it when
  ACC-J04's migrated copy supersedes it:
  `docker exec odoo-postgres dropdb -U odoo p20_smoke`.
