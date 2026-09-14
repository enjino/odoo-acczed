# ACC-G05 — Lock the per-feature task template

| Field | Value |
|---|---|
| **Phase** | G — Features backlog (parked by user) |
| **Status** | ⏳ not started |
| **Depends on** | ACC-G02 |
| **Estimated** | 1 hr |
| **Touches** | `docs/plans/CONVENTIONS.md` |

## Goal

Keep every future feature task in the same shape as phases A–F, so any future session (or subagent) can pick one up cold.

## Context (verified)

- Current shape: header table (Phase / Status / Depends on / Estimated / Touches), Goal, Context (verified), Steps with commands and expected output, Verification, Done when, Risks.

## Steps

- [ ] **1. Add a template section to CONVENTIONS.md**
  ```bash
  # front matter table + Goal + Context (verified) + Steps (command -> expected) + Verification + Done when + Risks
  # Arabic-first rule: every new string goes through i18n/ar.po, every new SCSS respects RTL
  ```
  → expected: template written once, referenced by every feature task
- [ ] **2. Add the quality gate**
  ```bash
  # a feature task is not done until: SQL/route verification + Arabic check + screenshot + no fork file touched
  ```
  → expected: gate stated as a checklist

## Verification

- CONVENTIONS.md contains the feature-task template and the done-gate.
- The template matches the files actually present in this folder.

## Done when

- [ ] template locked in CONVENTIONS.md
- [ ] done-gate checklist written

---
← Phase G index: [../README.md](../README.md)
