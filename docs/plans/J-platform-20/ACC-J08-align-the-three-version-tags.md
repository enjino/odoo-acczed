# ACC-J08 — Align the three version tags

| Field | Value |
|---|---|
| **Phase** | J — Platform move: Odoo 19.0 → 20.0 |
| **Status** | ⏳ not started |
| **Depends on** | ACC-J04, ACC-J05, ACC-J06 |
| **Estimated** | 1 hr + upload |
| **Touches** | the fork (tag + push), `acczed-addons` manifest, README/site version lines |

## Goal
One version identity — Odoo 20.0 — is readable from all three layers that carry it, and no layer claims
20 while the thing behind it is still 19.

## Context (verified)
- The fork has **exactly one tag**, `5.0.0-2-addons`, inherited from the upstream mirror. Upstream tags
  nothing at all (releases are branches), so there is no upstream tag to track — the tag is ours.
- The manifest `version: '19.0.0.1.1'` (`acczed_theme/__manifest__.py:6`) is the string Odoo itself
  surfaces as `ir_module_module.latest_version`, i.e. the only layer the running system reads.
- The docs layer carries the version in prose and in README's baseline-facts table; the site repo
  (`~/Desktop/Projects/acczed-site`, branch `master`) carries product claims.
- The project's own rule: a `live` badge requires a recorded verification step — the same rule applies to
  a version tag.

## Steps
- [ ] **1. Tag the fork** (annotated, on the `20.0` branch)
  ```bash
  git tag -a odoo-20.0-acczed.1 -m "Odoo 20.0 + the acczed delta (docs, tools, run-odoo.sh)"
  ```
- [ ] **2. Push the branch and the tag** — this is the ~1–2 GB upload the fork has never done
  ```bash
  git push origin 20.0 && git push origin odoo-20.0-acczed.1
  ```
- [ ] **3. Set the manifest version** to `20.0.0.1.1` (ACC-J05) and CONVENTIONS §7.2 to `20.0.x.y.z`
- [ ] **4. Update the docs/site version line** and the README session-mode paragraph
- [ ] **5. Record the three-way check**

## Verification
- `git tag -n1 | grep odoo-20.0` → the tag with its message
- `git describe --tags 20.0` → `odoo-20.0-acczed.1`
- `docker exec odoo-postgres psql -U odoo -d acczed_p20 -Atc "select latest_version from ir_module_module where name='acczed_theme'"` → `20.0.0.1.1`
- `grep -rn "19\.0" docs/plans/README.md` → only historical references, each dated

## Done when
- [ ] all three layers say 20.0, in step
- [ ] the tag exists on the fork **and** on origin
- [ ] no document reads "we are on 20" while the local DB is still 19

## Risks / notes
- **Tag after ACC-J04–J06 pass, never before** — a tag is a claim, and this project's rule is that a
  claim needs a recorded verification behind it.
- The push can time out on a slow link; retry, or push in the background and verify with
  `git ls-remote origin | grep 20.0`.
- `acczed` (the real database) is still 19 until ACC-J09 — so the docs line must say *branch* 20, not
  *production* 20.
