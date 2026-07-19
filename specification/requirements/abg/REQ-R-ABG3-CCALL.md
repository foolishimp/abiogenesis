# REQ-R-ABG3-CCALL — The Uniform C-Call Envelope

**Status**: Candidate - T-283 constitutional transaction; not operative until F_H closure
**Realizes**: T-200 (design §2 as amended §8)
**Derives from**: REQ-R-ABG3-* dispatch census (T-190), REQ-L-GTL3-TEMPORAL-PROPERTIES (T-192), REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH (T-188), T-195 C3/C4 adjudications, T-030 emergence boundary law.

ONTOLOGY: C is COMPUTE. Traversal A→B carries compute C as a tuple over
fibres {F_D, F_P, F_H}; a "C call" is a COMPUTE CALL — one instantiation
of the tuple at one program stage. Descriptive language elsewhere
(e.g. the T-205 "category vs functor" plugin factoring) never redefines
C: the declared shape of compute is data, the handler realizes compute,
and C names the compute itself.
Each HoG traversal runs the C structure declared by the admitted GTL program
(-014). The envelope below is the one
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
  structural. A call reached in an admitted open GTL C program also carries
  `programLocusRef` and the complete `retryPath`, represented as a possibly
  empty sequence of positive integers. Those fields identify the authored
  structural locus and nested attempt path; they carry no fibre or handler
  truth. Every 5.0 standard-path call carries both fields; no flat
  compatibility path is release-authoritative.
- **-003 Fibre selection is admitted truth.** `c_call_fibre_selected`
  {cCallRef, regime, armId, compositionRef|null} is the first interior
  row. The (stageRole × fibre) arm census derives from the admitted GTL
  declaration and implementation bindings at the one resolution seam.
- **-004 Full replay identity.** cCallRef is a STABLE DIGEST over the
  typed identity tuple {basisId, graphCallId, frameId, vectorIndex,
  stageRole, taskOrdinal, attempt} — `c-call:sha256:<hex>` — injective
  by construction (delimiter encodings collide across ":"-bearing
  fields); the READABLE locus is retained on `c_call_opened` itself.
  Recursive frames, repeated graph calls, and composed tasks shall not
  collide. For an admitted open GTL C program, the typed tuple additionally
  includes {programLocusRef, retryPath}; serial same-role loci and nested
  attempts therefore cannot collapse onto the flat compatibility identity.
  The two fields appear together or not at all. (Absorbs the T-198
  frame-identity successor.)
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
  admitted program data (the census becomes (declared role × fibre)). A
  standard-library program may explicitly declare [transform, evaluate,
  consequence], but that shape is not a hidden runtime default.
  Every declared program names its RESULT-BEARING role (whose admitted
  payload feeds closure/carry law) and runs under the same judgment
  router and retry law. Spine admission accepts any non-empty role;
  program MEMBERSHIP is enforced at validation and runtime admission where the
  declared program is in scope — a role outside the admitted program is
  drift. ABG may project separate call-preparation, result-admission, and
  materialization bind rows around those stages. Such rows are runtime
  admission mechanics, not C stages: they never satisfy declared stage cardinality,
  result-bearing-role, program-order, or fibre-substitution law.

- **-015 Gate invariance under compression.** A cognitive stage (plan,
  critique, repair guidance) is reifiable as an explicit program stage
  OR inlinable as an instruction category, by declaration, calibrated
  to worker capability. Verification is NEVER inlinable: F_D admission,
  deterministic execution, and evaluate judgment are trust boundaries
  that remain explicit stages under every compression level. Capability
  is assessed from replay, never self-declared.

- **-016 Named GTL authority.** Programs and GraphFunctions are named admitted
  GTL declarations published through Module and catalog authority. HoG
  traverses those declarations directly. There is no `abg.hog_program`,
  `abg.hog_program_catalog`, `abg.hog_program_ref`, generated handler program,
  or interpreter-local configuration that can replace or select the GTL
  program.

- **-017 Declared adaptive traversal.** Retry, escalation, branching, and
  alternative compute paths shall be expressed in admitted GTL graph and C
  structure with explicit predicates, policy references, bounds, and terminal
  cases. HoG evaluates that declared structure against ABG-admitted replay
  facts. ABG records the selected locus, regime, implementation, judgment, and
  continuation as runtime truth. A private runtime ladder, adapter selector,
  hidden fallback, or generated program is prohibited.

## Non-closure

Weakened tests; any fibre name in spine code; any tool name in
substrate; free-floating fibre events on real replay; a
no_declared_check judgment satisfying a declared check; archives ≠
replay on any arm.
