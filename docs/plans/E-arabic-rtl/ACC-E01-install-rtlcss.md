# ACC-E01 — Install rtlcss (required for any RTL stylesheet)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ✅ done 2026-09-15 — installed, and mirroring proved by comparing the served LTR/RTL bundles |
| **Depends on** | ACC-B04 |
| **Estimated** | 20 min |
| **Touches** | host toolchain + production systemd PATH |

## Goal

Odoo mirrors every stylesheet by shelling out to `rtlcss`; without it the Arabic interface is LTR-styled Arabic text.

## Context (verified)

- `assetsbundle.run_rtlcss()` spawns the external `rtlcss` binary with `base/data/rtlcss.json` (`odoo/addons/base/models/assetsbundle.py:653-664`). It spawns the **bare name** `rtlcss` — PATH is the only resolution mechanism (`:654`), and the call site is gated on `self.rtl` (`:589-592`), i.e. on the rendering language's direction.
- Verified on this machine: node v22.23.1 present, **no rtlcss** installed (2026-09-14). Since resolved — rtlcss 4.3.0 at `~/.local/bin/rtlcss` (2026-09-15).

## Steps

- [x] **1. Install without sudo**
  ```bash
  npm i -g --prefix ~/.local rtlcss
  rtlcss --version
  ```
  → expected: prints a version · **done 2026-09-15:** `rtlcss version: 4.3.0`, 7 packages, exit 0
- [x] **2. Make sure the Odoo process can see it**
  ```bash
  # the binary is spawned by the Python process, so PATH matters:
  # local: your shell already has ~/.local/bin
  # droplet: add Environment=PATH=... to odoo-http.service and odoo-gevent.service
  ```
  → expected: same binary resolvable by the service user · **done:** `~/.local/bin` is on PATH and
  `run-odoo.sh:23` launches Odoo from the invoking shell, so it inherits it. Droplet half is written
  into the runbook (step 3) but **not executed** — production is untouched.
- [x] **3. Prove it at runtime** — **by comparing bundle contents, not by grepping the log**
  ```bash
  # load the webclient as the Arabic user and as an English one, then diff the two CSS bundles:
  curl -s -c $AR -b $AR "$BASE/odoo" | grep -o '/web/assets/[^"]*web.assets_web.rtl.min.css' | head -1
  curl -s -c $EN -b $EN "$BASE/odoo" | grep -o '/web/assets/[^"]*web.assets_web\.min.css'     | head -1
  ```
  → expected: the URLs differ (`.rtl.` in the Arabic one) **and** the bodies differ, with directional
  properties swapped. **done 2026-09-15:**

  | bundle | `margin-left` | `margin-right` | `padding-left` | `padding-right` |
  |---|---|---|---|---|
  | LTR (`web.assets_web.min.css`) | 339 | 250 | 295 | 266 |
  | RTL (`web.assets_web.rtl.min.css`) | **250** | **339** | **267** | **294** |

  Identical counts would mean rtlcss never ran (the failure path returns the source unchanged).

> ⚠️ **The log check originally proposed here cannot work.** `grep -i rtlcss logs/odoo.log` returned **0**
> lines on a confirmed-working install, because Odoo logs rtlcss **only on failure** — success is silent
> (`assetsbundle.py:665-674`). Absence of a warning is not evidence the binary ran; only the bundle
> contents are. Kept here so the next person does not repeat it.

## Verification

- `rtlcss --version` succeeds on the host. **✅ 2026-09-15** — `rtlcss version: 4.3.0`.
- `rtlcss` is resolvable from the service PATH on production (documented in ACC-B07 runbook).
  **✅ documented** in `PRODUCTION-ROLLOUT.md` step 3, including the install; **not executed**.
- Runtime invocation confirmed. **✅ 2026-09-15** — the served RTL bundle is genuinely mirrored
  (table in step 3). This is the only sound proof; the log is silent on success.
- **Standalone equivalence (done instead):** Odoo's *exact* invocation
  (`assetsbundle.py:661` → `rtlcss -c base/data/rtlcss.json -`) was replayed by hand and mirrors
  correctly:
  ```bash
  printf '.a { margin-left: 10px; text-align: left; padding-right: 4px; }\n' \
    | rtlcss -c odoo/addons/base/data/rtlcss.json -
  # .a { margin-right: 10px; text-align: right; padding-left: 4px; }
  ```
  Same input, same config, same flags as the runtime path — so the binary and Odoo's config are known
  good before E02 switches the code path on.

## Done when

- [x] rtlcss installed locally
- [x] PATH requirement written into the runbook
- [x] runtime invocation confirmed (bundle comparison, 2026-09-15)

## Risks / notes

- **Failure is silent, not loud.** If rtlcss cannot be spawned, Odoo logs a *warning* and returns the
  un-mirrored LTR source (`assetsbundle.py:665-674`); the page still renders and nothing turns red.
  A missing rtlcss looks exactly like "Arabic works, but laid out left to right".
- **Mirrored CSS is cached** in `ir.attachment` (`assetsbundle.py:570-595`), so installing rtlcss after
  a bundle was compiled under RTL leaves stale un-mirrored CSS — invalidate assets after installing.
- **Local install is not reproducible by a re-clone.** `~/.local` lives outside both repos, so a fresh
  machine needs step 1 re-run; this is the one phase-E step that is not carried by git.
- **Production node is unverified.** rtlcss needs npm/node on the droplet; ACC-E01 checked only the host.

---
← Phase E index: [../README.md](../README.md)
