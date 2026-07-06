# REQ-R-ABG3-CCALL — The Uniform C-Call Envelope

**Status**: Active
**Realizes**: T-200 (design §2 as amended §8)
**Derives from**: REQ-R-ABG3-* dispatch census (T-190), REQ-L-GTL3-TEMPORAL-PROPERTIES (T-192), REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH (T-188), T-195 C3/C4 adjudications, T-030 emergence boundary law.

Traversal A→B carries compute C as a tuple over fibres {F_D, F_P, F_H}.
Each edge traversal runs its DECLARED program of C calls (-014); the
canonical default program is the triple [transform, evaluate,
consequence], baked only as bootstrap P0. The envelope below is the one
truth shape for every C call; the fibre is data inside it, never
structure around it.

## Clauses

- **-001 Uniformity.** Every C call emits exactly one spine:
  `c_call_opened` → `c_call_fibre_selected` → `c_call_evidenced`(0..n) →
  `c_call_result_admitted` → `c_call_judged`. No arm, fibre, stage role,
  or plugin path is exempt.
- **-002 Locus-only spine.** `c_call_opened` carries call-locus identity
  only: cCallRef, basisId, graphFunctionId, graphCallId, frameId, edge,
  vectorIndex, stageRole, taskOrdinal|null, attempt. No spine event
  carries a fibre name OR fibre-dependent material (instruction
  manifests are fibre evidence, not locus identity); fibre-freedom is
  structural.
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
  `c_call_fibre_selected` with single-event where-guards (e.g.
  regime=F_P) — the selection row IS the antecedent; the temporal
  algebra needs no cross-event join. Gates are non-vacuous on every arm
  that ran.
- **-011 Replay compatibility.** Pre-envelope ledgers project a derived
  spine at read time (projection adapter); synthetic events never enter
  truth.
- **-012 Audit equality.** For every completed run: external work
  sessions in archives equal EXTERNAL-WORK-BEARING spine invocations in
  replay, per arm (F_P and external F_H). F_D C calls require
  deterministic evidence artifacts in place of sessions. The standing
  gate measures both.

- **-013 Recursive enclosure.** A C call may resolve as a CHILD
  traversal: the fibre interior carries `evidenceClass:
  "sub_traversal"` with the child basis/run refs, and the child is the
  same monad at its own boundary — spines all the way down. The monad
  boundary (atomic session vs transparent sub-traversal) is a DECLARED
  placement per call, not architecture. Audit equality (-012) composes:
  each level's archives reconcile against its own spine invocations;
  cCallRef identity (-004: graphCallId + frameId) makes recursion
  collision-free.

- **-014 Open edge programs.** The edge program is a DECLARED
  composition in the C algebra, not a fixed triple: stage roles are
  admitted program data (the census becomes (declared role × fibre));
  the canonical default program is [transform, evaluate, consequence].
  Every declared program names its RESULT-BEARING role (whose admitted
  payload feeds closure/carry law) and runs under the same judgment
  router and retry law. Spine admission accepts any non-empty role;
  program MEMBERSHIP is enforced at enclosure/conformance where the
  declared program is in scope — a role outside the admitted program is
  drift.

- **-015 Gate invariance under compression.** A cognitive stage (plan,
  critique, repair guidance) is reifiable as an explicit program stage
  OR inlinable as an instruction category, by declaration, calibrated
  to worker capability. Verification is NEVER inlinable: F_D admission,
  deterministic execution, and evaluate judgment are trust boundaries
  that remain explicit stages under every compression level. Capability
  is assessed from replay, never self-declared.

## Realization State (typed strangler window — reviewed at each T-200 checkpoint)

-001's universality is realized INCREMENTALLY under the ratified
two-step strangler. ENCLOSED at this revision: transform.F_P (all
exits), evaluate.F_P, evaluate.F_D (live substitution), consequence
scalar (both paired sites), composed transform/consequence batch tasks
(spine per invoking task), construction sub_traversal (-013). PENDING,
with retirement points: evaluation-rule batch arms and fh_admit (P3,
with their gate antecedents); F_D mechanical transform (program
interpretation, P5); gate antecedent rebind from fp_dispatch_requested
to the selection row (P3 — until then the old antecedent remains the
operative gate point on new runs); resolveCCall delegation replacing
the site brackets (pre-P5; the brackets are the delegation's parity
oracle); GTL catalog publication of program declarations (P2g/P3).
This clause retires when -001 holds unconditionally; a release note may
not claim envelope universality while it stands.

## Non-closure

Weakened tests; any fibre name in spine code; any tool name in
substrate; free-floating fibre events on real replay; a
no_declared_check judgment satisfying a declared check; archives ≠
replay on any arm.
