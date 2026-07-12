# STATUS: 5.0 → 5.0.1 Progress Board (living)

**Type:** STATUS read-model (derived, non-authoritative; revised in place by
claude at each monitoring checkpoint). Authority: T-244 register, T-242, the
approved nine-phase plan.
**Last updated:** 2026-07-13 · after Consensus GTL design review (`00e74f5`)
· board fully green · T-254 verified; prerequisite chain CLEAR; 3c census next

**Estimates are a planning read model — re-based at each checkpoint, not
delivery commitments. The runtime bucket (item 5) re-bases materially at the
3c census.**

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
| 3a | Consensus GTL design | ✅ accepted by F_H | 74m actual |
| 3b | Typed HOF relation (T-253) | ✅ closed | 139m actual |
| 3b2 | Vector→C-program selection (T-254) | ✅ verified | 48m+74m actual |
| 3c | Body + compile census (T-252) | 🔄 in flight; census paused for declaration corrections; stdlib gate adopted | ~30–60m est |
| 4 | Invocation spine (4 leaves) | ⛔ 3–4 design reworks + accepts first (register: 6 blocked/4 candidate) | ~2.5–5h est + rework cycles |
| 5 | Runtime atoms: workflow.C/C.batch/C.retry + census-discovered HOF/recurse runtime leaves (count TBD) | ⛔ sized by 3c census | ~2–6h+; re-based at census |
| 6 | Atom-uplift proof: Consensus as first free construction (stdlib guarantee: public atoms only) | ⛔ after 4+5 | ~1–2h est |
| 7 | Retained surface (36 ops) | ⛔ after 3–6 | ~4–8h est |
| 8 | Compliance (T-247) | ⛔ after features | ~2.5–5h est |
| 9 | Release 5.0.0 (T-248) | ⛔ last 5.0 step | ~1.5–3h est |
| 10 | odd_glc 1.0 over 5.0 | ⛔ ticket chain stale (T-038 cites retired R5/I1); 0.2.0→1.0 naming decision needed | placeholder est, ungrounded |
| 11 | Dogfood scaffold + pilot (T-245) | ⛔ post-release | ~1–2h est |
| 12 | 5.0.1 as GLC project (T-246) | ⛔ dogfood proof | open (waves) |

**Projected totals (recalibrated after 2b actual 32m vs 1–2h est):** stable
5.0.0 ≈ 14–30 agent-hours; review/F_H gate pipeline adds ~8–15h wall (now the
dominant term; ~15 gated checkpoints remain) → ≈ 2.5–5 focused days. To
5.0.1-start ≈ +1 day. Calibration is continuous: each item records
est-vs-actual and remaining ranges re-scale each checkpoint. Deep-semantic
singletons (workflow.C, F_P G1–G5) keep wide high ends: n=0 evidence,
one-sided variance.

## Gates and evidence (short)

- Suite: **1,531/1,531 — fully green** (+8 T-254 tests).
- Expanded t193/t195 differentials: 13/13; rc.3 bytes untouched.
- Design gate green (pinned 11.3.0); lint lanes green; pack census clean.

## Design verdicts (gate Phase 3–7 entry)

- 3 `candidate` (+1 split) → need F_H accept before their code.
- 4 `blocked` → rework → accepted (spine, SDK/CLI, F_P, vertical).
- 1 `rejected` (consensus as-built; calibration case, stays rejected).

## Forward flags (pre-emptive, full detail in 20260713T170000Z_PREEMPTIVE)

- **F1 time-critical → Phase 2:** Consensus design must declare PER-PROFILE
  transport binding (F_H ruling: two different LLMs between worker and
  manager seats; today one agentContract serves all profiles).
- **F2 → Phases 2/4:** unrealized-gap census is a FRONTIER census (compiler
  doesn't recurse into unrealized terms); oracle must expect cascading gap
  emergence, not monotone decrease.
- **F3 → Phase 4:** `instruction_set` kind exists — verify publishability in
  the rework's first hour.
- **F5 → Phase 10:** odd_glc T-033/037/038/039 still target dropped R5/I1;
  pre-stage the retarget before RC week.

## T-253 Phase-B reconciliation criteria (pre-published; review runs these verbatim)

1. Scope fence: M01 typed witnesses + raw admission + serialization +
   compiler recognition ONLY. `gtl-hof-unrealized-fan-out` emitted as the
   honest gap. NO runtime interpreter (own leaf). NO partial-failure
   semantics (fenced by the Phase-A correction).
2. Zero consensus vocabulary in m01/m03 additions (declared watch item).
3. Requirement conformance, each with a negative test: Vector[T] joins an
   explicit member contract (spelling ≠ admission); cardinality + ordinal
   pairing preserved through authoring/serialization/admission/compilation;
   no inference from name/label/tag/node-identity/hidden cardinality.
4. Scenario-09 non-Consensus fixture present as a compiling test.
5. Design-diagram comparison: code entities ↔ domain stereotypes; admission
   states realized; focused mermaid gate green.
6. Gates: full suite green; focused t253 lane; lint lanes; no changes
   outside declared files.
7. Census effect: the typed fan-out becomes AUTHORABLE (compiles to the
   honest gap) instead of unrepresentable — the Current Defect closes.

## Next checkpoints claude verifies

1. T-250 lands → 7 differentials, rc.3 bytes untouched, suite fully green.
2. Phase-2 probe → three-view review + typed gap census.
3. Each C-atom → recompile oracle: expected gap vanishes, zero
   feature-specific code.
