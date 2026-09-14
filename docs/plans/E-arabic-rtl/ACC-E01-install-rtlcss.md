# ACC-E01 — Install rtlcss (required for any RTL stylesheet)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B04 |
| **Estimated** | 20 min |
| **Touches** | host toolchain + production systemd PATH |

## Goal

Odoo mirrors every stylesheet by shelling out to `rtlcss`; without it the Arabic interface is LTR-styled Arabic text.

## Context (verified)

- `assetsbundle.run_rtlcss()` spawns the external `rtlcss` binary with `base/data/rtlcss.json` (`odoo/addons/base/models/assetsbundle.py:653-664`).
- Verified on this machine: node v22 present, **no rtlcss** installed.

## Steps

- [ ] **1. Install without sudo**
  ```bash
  npm i -g --prefix ~/.local rtlcss
  rtlcss --version
  ```
  → expected: prints a version
- [ ] **2. Make sure the Odoo process can see it**
  ```bash
  # the binary is spawned by the Python process, so PATH matters:
  # local: your shell already has ~/.local/bin
  # droplet: add Environment=PATH=... to odoo-http.service and odoo-gevent.service
  ```
  → expected: same binary resolvable by the service user
- [ ] **3. Prove it at runtime**
  ```bash
  # recompile assets with an RTL language active (after ACC-E02) and grep the log:
  bash run-odoo.sh logs | grep -i rtlcss | tail
  ```
  → expected: rtlcss invoked, no 'file not found'

## Verification

- `rtlcss --version` succeeds on the host.
- `rtlcss` is resolvable from the service PATH on production (documented in ACC-B07 runbook).
- Asset recompilation logs no rtlcss error.

## Done when

- [ ] rtlcss installed locally
- [ ] PATH requirement written into the runbook
- [ ] runtime invocation confirmed

---
← Phase E index: [../README.md](../README.md)
