# ACC-J03 — Environment for 20: a second venv, branch-aware run-odoo.sh

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
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

## Steps
- [ ] **1. Create the second venv (Python 3.12)**
  ```bash
  cd ~/Desktop/Projects && uv venv --python 3.12 odoo-acczed-venv20
  ```
- [ ] **2. Install 20.0's requirements into it**
  ```bash
  env -u PYTHONPATH uv pip install --python ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python \
      -r ~/Desktop/Projects/odoo-acczed/requirements.txt
  ```
  → expected: `psycopg2` builds from source against `libpq-dev`; no resolution conflict
- [ ] **3. Prove the version and the evented gate**
  ```bash
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv20/.venv/bin/python odoo-bin --version
  grep -n "gevent" odoo/_monkeypatches/site.py | head
  grep -n "gevent_port" odoo/tools/config.py
  ```
- [ ] **4. Make `run-odoo.sh` resolve the venv per branch**
  ```bash
  VENV="${ODOO_VENV:-$HOME/Desktop/Projects/odoo-acczed-venv/.venv}"
  ```
  → default stays 19; branch 20.0 is started with `ODOO_VENV=…venv20/.venv`

## Verification
- `odoo-bin --version` → `20.0`
- `bash run-odoo.sh status` under each venv → HTTP on 8069, longpolling on 8072, both confirmed by the
  script's own readiness grep

## Done when
- [ ] venv20 exists and `odoo-bin --version` prints 20.0
- [ ] both servers come up and `curl -s -o /dev/null -w '%{http_code}' localhost:8069/web/login` → 200
- [ ] `19.0` still starts with the original venv

## Risks / notes
- **Do not upgrade the existing venv in place** — it would break the 19.0 branch, which is the only
  local reference for what production runs.
- uv venvs ship no `pip`; always `uv pip install --python <venv>/bin/python`.
- Hermes exports `PYTHONPATH`; wrap every odoo-bin / pip call in `env -u PYTHONPATH`.
- If `psycopg2` fails to build, `libpq-dev` is missing — check `pg_config --version` first.
