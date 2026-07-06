# REQ-R-ABG3-CCALL — The Uniform C-Call Envelope

**Status**: Active
**Realizes**: T-200 (design §2 as amended §8)
**Derives from**: REQ-R-ABG3-* dispatch census (T-190), REQ-L-GTL3-TEMPORAL-PROPERTIES (T-192), REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH (T-188), T-195 C3/C4 adjudications, T-030 emergence boundary law.

Traversal A→B carries compute C as a tuple over fibres {F_D, F_P, F_H}.
Each edge traversal makes three C calls (transform, evaluate,
consequence). The envelope below is the one truth shape for every C
call; the fibre is data inside it, never structure around it.

## Clauses

- **-001 Uniformity.** Every C call emits exactly one spine:
  `c_call_opened` → `c_call_fibre_selected` → `c_call_evidenced`(0..n) →
  `c_call_result_admitted` → `c_call_judged`. No arm, fibre, stage role,
  or plugin path is exempt.
- **-002 Locus-only spine.** `c_call_opened` carries call-locus identity
  only: cCallRef, basisId, graphFunctionId, graphCallId, frameId, edge,
  vectorIndex, stageRole, taskOrdinal|null, attempt, manifestRef|null.
  No spine event carries a fibre name; fibre-freedom is structural.
- **-003 Fibre selection is admitted truth.** `c_call_fibre_selected`
  {cCallRef, regime, armId, compositionRef|null} is the first interior
  row. The (stageRole × fibre) arm census is registry data asserted at
  the one resolver entry.
- **-004 Full replay identity.** cCallRef =
  `c-call:{basisId}:{graphCallId}:{frameId}:{vectorIndex}:{stageRole}:{taskOrdinal|-}:{attempt}`.
  Recursive frames, repeated graph calls, and composed tasks shall not
  collide. (Absorbs the T-198 frame-identity successor.)
- **-005 Spine per invoking task.** Any stage-task that can invoke a
  worker or plugin gets its own spine; a composed batch is a parent
  grouping ref (batchRef), never the counted call.
- **-006 Enclosure.** Fibre evidence events (dispatch, invocation,
  payload, response-contract, execution, escalation rows) are lawful
  only inside an open spine, referenced from `c_call_evidenced`.
  Free-floating fibre events are drift.
- **-007 Shape preservation.** Fibre substitution changes the
  fibre-selection payload and evidence class only — never spine kinds,
  order, or count. All-F_D degenerates to a workflow engine, all-F_H to
  a human process, with identical spine replay.
- **-008 Judgment vocabulary.** `c_call_judged.judgment` ∈ {advance,
  retry, pending, blocked, escalated, no_declared_check}.
  `no_declared_check` is never gate-satisfying and never satisfies an
  edge that declares required checks; it advances only where nothing
  demanded the check. `pending` is the fibre-independent
  awaiting-external-actor state; public dispatch_required is its m04
  projection.
- **-009 One retry law.** The retryable-failure allowlist judges spine
  outcomes; no per-arm classification detours.
- **-010 Antecedent law.** Dispatch-point temporal properties bind to
  `c_call_opened` joined with its fibre-selection row (e.g. regime=F_P
  via where-guards). Gates are non-vacuous on every arm that ran.
- **-011 Replay compatibility.** Pre-envelope ledgers project a derived
  spine at read time (projection adapter); synthetic events never enter
  truth.
- **-012 Audit equality.** For every completed run: external work
  sessions in archives equal spine invocations in replay, per arm and
  per fibre. The standing gate measures this.

## Non-closure

Weakened tests; any fibre name in spine code; any tool name in
substrate; free-floating fibre events on real replay; a
no_declared_check judgment satisfying a declared check; archives ≠
replay on any arm.
