# STATUS: 5.0 → 5.0.1 Progress Board (living)

**Type:** STATUS read-model (derived, non-authoritative; revised in place by
claude at each monitoring checkpoint). Authority: T-244 register, T-242, the
approved nine-phase plan.
**Last updated:** 2026-07-13 · after T-250 PASS (`66e2441`) · **board fully
green: 1,512/1,512** · watching Phase-2 probe

## Velocity basis (observed, commit-stamped)

Designed-and-gated items land in 25–70 min each: 9 retro designs = 70m;
constitutional rewrite = 48m; 2 forward designs = 39m; T-251 execution = 25m.
The one UNDESIGNED item (945b5a2) took ~1.5h to build wrong and ~7h to unwind.
Review adds ~15–40m per checkpoint. Estimate ranges below widen with semantic
depth; variance drivers: F_H latency, design-rework loops, workflow.C kernel
depth, live lanes.

## Board

| # | Item | Status | Time |
|---|---|---|---|
| 0 | Design back-fill (9 designs) | ✅ done | 70m actual |
| 1 | Stable-first authority (T-249) | ✅ done, closed | 48m actual |
| 2a | Lint + render gate (T-251) | ✅ done, verified | 25m actual |
| 2b | Version-basis fix (T-250) | ✅ done, verified | 32m actual |
| 3 | Consensus GTL design probe | ⏳ next | ~1–2h est |
| 4 | Invocation spine (4 leaves) | ⛔ design rework first | ~4–8h est |
| 5 | 3 C-atoms (recompile oracle) | ⛔ after probe | ~4–8h est |
| 6 | Consensus as GTL function | ⛔ after 4+5 | ~2–4h est |
| 7 | Retained surface (36 ops) | ⛔ after 3–6 | ~8–16h est |
| 8 | Compliance (T-247) | ⛔ after features | ~4–8h est |
| 9 | Release 5.0.0 (T-248) | ⛔ last 5.0 step | ~2–4h est |
| 10 | odd_glc 1.0 over 5.0 | ⛔ post-release | ~4–8h est |
| 11 | Dogfood scaffold + pilot (T-245) | ⛔ post-release | ~2–4h est |
| 12 | 5.0.1 as GLC project (T-246) | ⛔ dogfood proof | open (waves) |

**Projected totals at current cadence:** to stable 5.0.0 ≈ 25–50 agent-hours
(≈ 3–7 focused days with review gates); to 5.0.1-start ≈ +1–2 days; 5.0.1
itself is campaign-paced.

## Gates and evidence (short)

- Suite: **1,512/1,512 — fully green** (first time on the 5.0 line).
- Expanded t193/t195 differentials: 13/13; rc.3 bytes untouched.
- Design gate green (pinned 11.3.0); lint lanes green; pack census clean.

## Design verdicts (gate Phase 3–7 entry)

- 3 `candidate` (+1 split) → need F_H accept before their code.
- 4 `blocked` → rework → accepted (spine, SDK/CLI, F_P, vertical).
- 1 `rejected` (consensus as-built; calibration case, stays rejected).

## Next checkpoints claude verifies

1. T-250 lands → 7 differentials, rc.3 bytes untouched, suite fully green.
2. Phase-2 probe → three-view review + typed gap census.
3. Each C-atom → recompile oracle: expected gap vanishes, zero
   feature-specific code.
