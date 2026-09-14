# ACC-A05 — Capture language + RTL baseline

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — see `evidence/evidence.log`) |
| **Depends on** | ACC-A01 |
| **Estimated** | 10 min |
| **Touches** | `docs/plans/evidence/` only |

## Goal

Prove on record that the site's "Arabic, right to left — live" claim is not yet true, which is the whole point of phase E.

## Context (verified)

- Direction comes from `res.lang.direction` (`odoo/addons/base/models/res_lang.py:77`); RTL CSS is produced by spawning the external `rtlcss` binary during asset compilation (`odoo/addons/base/models/assetsbundle.py:653-664`, config `base/data/rtlcss.json`).
- Verified: `rtlcss` is NOT installed on this machine (node 22 exists, no global rtlcss).

## Steps

- [x] **1. Query active languages**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select code, direction, active from res_lang where active or code like 'ar%';"
  ```
  → expected: only en_US active
  → **actual:** `en_US|ltr|t` active; `ar_001|rtl|` and `ar_SY|rtl|` present but **not active**.
  Whole table: **93 languages, exactly 1 active.**
- [x] **2. Prove rtlcss is missing**
  ```bash
  which rtlcss || echo "rtlcss: MISSING"
  npm ls -g --depth=0 | head
  ```
  → expected: rtlcss: MISSING → **actual: `rtlcss: MISSING`** ✅
- [x] **3. Record the user language of admin**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select u.login, p.lang from res_users u join res_partner p on p.id=u.partner_id order by u.id;"
  ```
  → expected: admin = en_US → **actual:** every user on `en_US`
  (`__system__`, `admin`, `public`, `portaltemplate`, `demo`, `portal`).

## Verification

- Language query output stored in `evidence.log`. ✅
- `rtlcss: MISSING` stored in `evidence.log`. ✅

## Done when

- [x] evidence/evidence.log contains language + rtlcss findings
- [x] phase E's premise is recorded as a verified fact, not an assumption

## Risks / notes

- ⚠️ **`res_lang.active` is a NULLABLE boolean, and the Arabic rows hold `NULL` — not `false`.**
  The ORM is fine with that (`active_test` matches `active = true`, so NULL reads as inactive), but a
  raw SQL check written as `where active = false` or `where not active` **silently misses these rows**,
  since NULL fails both comparisons. ACC-E02's activation and its verification must use
  `coalesce(active, false)` or `active is true`. This is the kind of query that would otherwise
  "prove" Arabic was already handled.
- The Arabic records already exist in `res_lang` with the correct `direction = 'rtl'`. ACC-E02 is
  therefore an *activation*, not an installation — cheaper than the estimate implies, and the
  direction data does not need to be created.
- `rtlcss` absence is the harder half of phase E: without it Odoo cannot mirror stylesheets at all,
  and it must be on the PATH of the *Odoo service user* in production, not just in an interactive
  shell (see ACC-E01 step 2).

---
← Phase A index: [../README.md](../README.md)
