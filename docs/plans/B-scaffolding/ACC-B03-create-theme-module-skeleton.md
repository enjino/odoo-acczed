# ACC-B03 — Create the acczed_theme module skeleton

| Field | Value |
|---|---|
| **Phase** | B — Scaffolding (module repo + addons path) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-B02 |
| **Estimated** | 15 min |
| **Touches** | `acczed-addons/acczed_theme/` |

## Goal

Prove the module pipeline (discovery → install) works before any styling exists, so failures later are styling failures, not plumbing failures.

## Context (verified)

- Manifest style reference: `depends: ['web']`, `license: 'LGPL-3'`, version `19.0.x.y.z`.
- Views file is created empty here and filled in phase D.

## Steps

- [ ] **1. Create the structure**
  ```bash
  acczed_theme/__init__.py            -> from . import models
  acczed_theme/models/__init__.py     -> (empty for now)
  acczed_theme/__manifest__.py        -> name, version '19.0.0.1.0', depends ['web'], license 'LGPL-3'
  acczed_theme/views/brand_templates.xml -> empty <odoo/> stub
  ```
  → expected: 4 files exist
- [ ] **2. Sanity check the manifest**
  ```bash
  cd ~/Desktop/Projects/odoo-acczed
  env -u PYTHONPATH ~/Desktop/Projects/odoo-acczed-venv/.venv/bin/python -c "import ast,sys;ast.parse(open('/home/ahmed-karmy/Desktop/Projects/acczed-addons/acczed_theme/__manifest__.py').read())"
  ```
  → expected: no SyntaxError

## Verification

- Files exist exactly as listed.
- Manifest parses and declares only `web` as dependency.
- No styling file exists yet.

## Done when

- [ ] module skeleton present
- [ ] manifest valid

---
← Phase B index: [../README.md](../README.md)
