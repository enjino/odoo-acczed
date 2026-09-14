# ACC-A01 — Start the local stack and confirm it serves

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`) |
| **Depends on** | — |
| **Estimated** | 5 min |
| **Touches** | nothing (read-only) |

## Goal

Get the Odoo 19 local stack running so every later measurement and screenshot has a definition of "before".

## Context (verified)

- Odoo 19 runs TWO processes: `odoo-bin` on :8069 and `odoo-bin gevent` on :8072 (`run-odoo.sh` owns both PID files).
- Log file is `logs/odoo.log`; the config is `odoo.conf` (postgres on 127.0.0.1:5433, DB `acczed`).

## Steps

- [x] **1. Check status, then start**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  bash run-odoo.sh status
  bash run-odoo.sh start
  ```
  → expected: "Ready after Ns." and both PID files present
  → **actual:** pre-start both "not running"; after start "Ready after 1s.", HTTP pid 109289, gevent pid 109291.
  Both processes are genuinely up (readiness markers at `logs/odoo.log:1899-1900` carry the new PIDs).
  ⚠️ The "Ready after Ns." figure is **not trustworthy** — see Risks below.
- [x] **2. Confirm HTTP response**
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8069/web/login
  ```
  → expected: 200
  → **actual: 303**, `Location: /web/database/selector`. The task's expectation is wrong, not the stack:
  `odoo.conf` sets `db_name = False` with `list_db = True`, so an unqualified URL cannot resolve a
  database. The serving URL is `?db=acczed` **plus a cookie jar**:
  ```bash
  curl -sL -c /tmp/cj -b /tmp/cj -o /dev/null -w "%{http_code}\n" \
    "http://localhost:8069/web/login?db=acczed"        # -> 200
  curl -sL -c /tmp/cj -b /tmp/cj "http://localhost:8069/web/login?db=acczed" \
    | grep -o "<title>[^<]*</title>"                   # -> <title>Odoo</title>
  ```
- [x] **3. Confirm both processes are alive**
  ```bash
  cat logs/odoo-http.pid logs/odoo-gevent.pid
  bash run-odoo.sh status
  ```
  → expected: both processes reported running → **actual:** both alive; `status` prints
  "HTTP: running (pid 109289) http://localhost:8069" and "Longpolling: running (pid 109291) :8072".

## Verification

- `bash run-odoo.sh status` lists both services as running. ✅
- `curl http://localhost:8069/web/login` returns HTTP 200. ⚠️ **Only when qualified as
  `?db=acczed` with a cookie jar** (unqualified returns 303 to the database selector — see Steps 2).
- `logs/odoo.log` shows no ERROR lines introduced by this task. ✅ 0 `ERROR`/`CRITICAL` lines in the
  116 lines this start appended (the 22 pre-existing ERROR lines in the file are from 2026-08-29/09-05).

Also confirmed while here: Postgres listens on `127.0.0.1:5433`, and the database selector lists
**two** databases — `acczed` and `mcp_test`. `mcp_test` is a second registry the server also loads
and runs crons for; it is not the product database.

## Done when

- [x] Stack is serving on :8069 and :8072.
- [x] No file in the repo was modified.

## Risks / notes

- PYTHONPATH is exported by Hermes — never launch odoo-bin without `env -u PYTHONPATH` (the script already does this).
- ⚠️ **`run-odoo.sh` readiness check is unsound.** `start()` does
  `grep -q "HTTP service (werkzeug) running" "$LOGFILE"` against the whole **append-only** log, so
  historical lines satisfy it: the same marker exists at lines 117 (2026-08-29) and 1292 (2026-09-05).
  "Ready after 1s." will print even if the new processes never bind. The check needs to look only at
  output appended after the start (e.g. record the line count first and `tail -n +$((n+1))`), or test
  the ports. Until then, trust `run-odoo.sh status` / `curl`, never the "Ready after" line.
- ⚠️ **Baseline URLs need `?db=acczed` + a cookie jar.** ACC-A02…A05 curl `/web/login` unqualified and
  will collect a 303 stub (`<title>Redirecting...</title>`, 0 `odoo.com` hits) instead of the real page.
  Those steps are corrected when each is executed; consider fixing the task text.

---
← Phase A index: [../README.md](../README.md)
