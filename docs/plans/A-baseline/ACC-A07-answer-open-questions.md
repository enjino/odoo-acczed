# ACC-A07 — Answer the seven open questions

| Field | Value |
|---|---|
| **Phase** | A — Baseline (evidence only, no code) |
| **Status** | ✅ done (2026-09-14 — all seven answered in `README.md` under each question) |
| **Depends on** | ACC-A06 |
| **Estimated** | 15 min |
| **Touches** | `docs/plans/README.md` |

## Goal

Convert the open decisions into written answers, because four of them change the implementation order or the deliverable itself.

## Context (verified)

- Open: logo source (SVG vs text), default colour scheme (always dark vs follow system), print/PDF appearance, whether to fix site copy or install accounting first, whether the marketing site itself becomes Arabic, single token source, first implementation scope.

## Steps

- [x] **1. Put each question to the user and write the answer under it**
  ```bash
  # keep the question text, add: >> DECISION (2026-..-..): <answer>
  ```
  → expected: 7 answers, no question left open
  → **actual: 7/7 answered in `README.md`** under their question text, each dated 2026-09-14.
- [x] **2. Re-order phases if the answers require it**
  ```bash
  # e.g. if 'follow system' wins, ACC-C02 changes shape
  # if 'site copy first' wins, ACC-F04 moves before ACC-G03
  ```
  → expected: phase table updated consistently

## The seven answers

| # | Question | Decision |
|---|---|---|
| 1 | Logo | **Text mark** "acczed" + 🌿, matching the site |
| 2 | Default scheme | **Always dark**, ACC-C04 toggle as the opt-out |
| 3 | Print/PDF | **Light** — screen dark, paper white |
| 4 | Site copy | **Fix now, install later** — soften the 3 false badges to "in the works" |
| 5 | Arabic marketing site | **Yes, build it bilingual** (en + ar) |
| 6 | Token source | **`tokens.json` + generator** |
| 7 | First implementation scope | **B → E → C → D locally**, production after approval |

## Verification

- Seven decisions recorded in README with dates. ✅
- Phase table and dependencies match the decisions. ✅ — see the two consequential changes below.

## What the answers changed

Only **two** of the seven moved anything. The other five confirmed the plan as written.

1. **Decision 4 pulled ACC-F04 out of the tail of the execution order.** It no longer depends on
   ACC-E06 and now runs right after ACC-A06 — the three false badges are public today, and leaving
   them up for the whole theming track is the more expensive choice. Revised fragment:
   `A → B → F04 → E → C → D → F (rest) → G`. Rejected: "install first" (keeps false badges up for the
   duration) and "both" (the user took the narrower option).
   - **Knock-on: ACC-E06 is subsumed.** Its scope was "make the site's Arabic claim true (or stop
     making it)" — the "stop making it" half is now F04 step 1, and the "make it true" half is verified
     by ACC-E03 itself. E06 is parked with that reason rather than left to duplicate F04.
2. **Decision 5 added ACC-F06** (bilingual marketing site, depends on F04). It depends on F04
   deliberately: translating copy that is currently false would double the work *and* publish the same
   overclaims in a second language.

Decision 1 unblocks ACC-D01/D02 immediately (no asset needed). Decision 2 left ACC-C02's shape intact —
the "follow the system" branch would have forced a rescope of C02, and it did not win. Decision 6
confirmed ACC-F01–F03 as written. Decision 7 left the execution order alone. Decision 3 keeps the
report templates out of ACC-C03's override list entirely.

## Done when

- [x] all seven questions answered in writing
- [x] phase table reflects the answers

## Risks / notes

- **Decision 5 is new scope.** The bilingual site was not in the original plan; it is roughly 1–2 days
  on top of phase F, and it needs a human to review the Arabic copy. It also creates a shared
  dependency with **ACC-E05** — one Arabic/Latin font pairing should serve both the site and the
  backend, not two independently chosen ones.
- Decision 7 says production only after approval. Nothing in B → E → C → D touches
  `backend.acczed.online`; ACC-C06 is the first task that would, and it needs an explicit go.
- The user is editing this plan in parallel (Phase H was added mid-session). Re-read `README.md`
  before making further structural changes to it.

---
← Phase A index: [../README.md](../README.md)
