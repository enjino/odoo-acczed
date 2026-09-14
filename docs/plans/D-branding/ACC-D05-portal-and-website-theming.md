# ACC-D05 — Theme the portal and in-Odoo website (parked)

| Field | Value |
|---|---|
| **Phase** | D — Branding (title, favicon, login, company, mail) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-D04 |
| **Estimated** | TBD |
| **Touches** | `acczed_theme` frontend assets (later) |

## Goal

Extend the identity to customer-facing portal pages once the modules that provide them are installed.

## Context (verified)

- `website` and `portal` are NOT installed in the `acczed` database (verified) — this task cannot be executed yet.
- Portal/frontend bundles are separate from the backend bundle (`web.assets_frontend`, `web.assets_frontend_lazy` in `addons/web/__manifest__.py`), so the dark backend bundle does not leak into them.

## Steps

- [ ] **1. Unpark when website/portal are installed**
  ```bash
  docker exec odoo-postgres psql -U odoo -d acczed -tAc "select name,state from ir_module_module where name in ('website','portal');"
  ```
  → expected: installed
- [ ] **2. Register frontend assets and inherit the portal layout**
  ```bash
  # 'web.assets_frontend': [...] with the token layer
  # inherit portal templates for header/footer identity
  ```
  → expected: portal pages match the site
- [ ] **3. Verify no dark-theme leakage**
  ```bash
  # portal stays light or adopts the site's dark scheme intentionally - decide in ACC-A07
  ```
  → expected: explicit decision honoured

## Verification

- Portal pages render with the acczed identity.
- No unintended dark styling from the backend bundle.

## Done when

- [ ] parked until website/portal exist

---
← Phase D index: [../README.md](../README.md)
