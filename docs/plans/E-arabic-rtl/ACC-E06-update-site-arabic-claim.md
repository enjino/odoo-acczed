# ACC-E06 — Make the site's Arabic claim true (or stop making it)

| Field | Value |
|---|---|
| **Phase** | E — Arabic and RTL |
| **Status** | 🅿️ parked — **subsumed by ACC-F04** (ACC-A07 decision 4, 2026-09-14) |
| **Depends on** | ACC-E03 |
| **Estimated** | 1 hr |
| **Touches** | `acczed-site/app/page.tsx` |

> **Subsumed (2026-09-14).** Decision 4 chose "fix the copy now, install later", which moved ACC-F04
> ahead of ACC-G03 and detached it from this task. That leaves E06 with no unique work: its "stop
> making the claim" half is ACC-F04 step 1 (the Arabic row), and its "make it true" half is verified by
> ACC-E03 itself plus F04's flip-back note. **Do not execute E06** — applying both would edit the same
> two lines of `page.tsx:97-102,162-167` twice. Kept for history rather than deleted.

## Goal

Once RTL actually works end to end, the marketing claim stops being aspirational and becomes verifiable.

## Context (verified)

- The site marks "Arabic, right to left" as `live` (`acczed-site/app/page.tsx:97-102`) and states "2 languages, both directions" (`:165`) — both were false before this phase.
- Rule agreed in ACC-A06: a `live` badge requires a recorded verification step.

## Steps

- [ ] **1. Re-verify, then keep or downgrade the badge**
  ```bash
  # evidence: after-backend-ar-*.png + the ar_001 SQL output + rtlcss version
  ```
  → expected: claim backed by evidence
- [ ] **2. Update the stats block if the numbers changed**
  ```bash
  acczed-site/app/page.tsx:162-167   # languages, app count per ACC-F04
  ```
  → expected: numbers match reality

## Verification

- The `live` badge on the Arabic card is backed by stored evidence.
- Stats block matches the audited numbers from ACC-A06.
- Site deploy updated (deploy flow: acczed-site/docs/DEPLOY.md).

## Done when

- [ ] badge backed by evidence or downgraded
- [ ] site copy consistent with ACC-A06 audit

---
← Phase E index: [../README.md](../README.md)
