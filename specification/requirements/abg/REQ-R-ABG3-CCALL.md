# REQ-R-ABG3-CCALL — The Uniform C-Call Envelope

**Status**: Active
**Realizes**: T-200 (design §2 as amended §8)
**Derives from**: REQ-R-ABG3-* dispatch census (T-190), REQ-L-GTL3-TEMPORAL-PROPERTIES (T-192), REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH (T-188), REQ-R-ABG3-INSTRUCTION-ASSEMBLY, REQ-R-ABG3-TRANSPORT, REQ-R-ABG3-PAYLOAD, T-195 C3/C4 adjudications, T-030 emergence boundary law.

ONTOLOGY: C is COMPUTE. Traversal A→B carries compute C as a tuple over
fibres {F_D, F_P, F_H}; a "C call" is a COMPUTE CALL — one instantiation
of the tuple at one program stage. Descriptive language elsewhere
(e.g. the T-205 "category vs functor" plugin factoring) never redefines
C: the declared shape of compute is data, the handler realizes compute,
and C names the compute itself.
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
- **-004 Full replay identity.** cCallRef is a STABLE DIGEST over the
  typed identity tuple {basisId, graphCallId, frameId, vectorIndex,
  stageRole, taskOrdinal, attempt} — `c-call:sha256:<hex>` — injective
  by construction (delimiter encodings collide across ":"-bearing
  fields); the READABLE locus is retained on `c_call_opened` itself.
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

- **-016 Labelled configurations.** HoG programs are NAMED
  configurations, never a singleton: a declared catalog
  (`abg.hog_program_catalog`) carries coexisting programs keyed by
  programRef; edges select by label (`abg.hog_program_ref`); duplicate
  labels fail closed. Tuning is addressable at BOTH declared levels:
  workflow shape (the program) and prompt level (per-stage
  `instructionCategoryRefs` — the inlined form of cognitive stages
  under -015, consumed by the instruction section machinery at render).

- **-017 Adaptive selection.** Program selection is a RUNTIME decision
  over DECLARED terms: an edge-class declares a selection LADDER —
  ordered labelled configurations with predicates over replay-observed
  signals (attempt number, prior judgments, proportionality
  declared-vs-observed, worker-capability indicators) — and the judgment
  router walks it live: retry may ESCALATE the program (lean → hardened
  → human-gated) instead of re-running the same shape blindly. Different
  C calls in the SAME workflow may run different configurations. The
  solve/optimize boundary holds: the ladder and its predicates are
  declarations (the optimize loop re-authors them offline from replay);
  the router only selects among them (candidates, never terms).
  VISIBILITY: the governing programRef is recorded on
  `c_call_fibre_selected` so every call's configuration is replay
  truth and -012 cost reports per configuration. Capability is assessed
  from replay, never self-declared (-015).

- **-018 Handler binding ontology.** A C-call handler is the effectful
  realization of one selected declared arm. The declared program,
  catalog, ladder, contracts, response shapes, evidence classes, budgets,
  and calibration are CATEGORY truth. The handler is the FUNCTOR from
  that admitted category row to world effects. Handler binding is
  admitted configuration data: `{programRef, stageRole, armId, regime,
  handlerRef, handlerClass, handlerConfigRef}`. The handler does not
  define the program, select the next call, own closure, or mint spine
  truth.

- **-019 Handler interpretation is ABG-owned.** The ABG interpreter
  resolves `programRef -> stage -> arm -> handler binding -> declared
  configuration` through the same admitted catalog/ladder path as the
  C-call selection row. Missing, duplicate, ambiguous, unadmitted, or
  program-mismatched handler bindings fail closed before the handler
  runs. A product-local handler scanner, prompt shell, file loader,
  registry, or ad hoc effect router is not a lawful interpretation path.

- **-020 Standard pipeline handlers.** ABG may ship standard pipeline
  handlers for common effect signatures: F_P agent transport, F_D
  materialization, F_D process execution, and F_H human gate. A pipeline
  handler realizes the constructed interior over already admitted
  declarations, such as rendered instruction manifests, transport
  contracts, response contracts, materialization specs, execution plans,
  and budget envelopes. The handler returns only an interior result:
  evidence refs, outcome status, payload refs, response-contract refs,
  and typed failure; it never returns spine events.

- **-021 Capability handlers.** A declared arm may bind to a capability
  handler that replaces the constructed interior with one opaque
  capability outcall to an installed product, local service, library, or
  in-process engine. The category position is unchanged: the same spine,
  selection row, budget envelope, judgment vocabulary, evidence honesty,
  and audit equality rules apply. A capability handler may omit prompt
  and agent-transport evidence only when its admitted handler class
  declares that prompt/transport are not part of that capability's
  effect signature.

- **-022 Arm fidelity and interiors-only.** A handler realizes exactly
  the selected `{programRef, stageRole, armId, regime}` and no other arm.
  It may not change programRef, stageRole, armId, regime, graph-call
  identity, vector identity, retry policy, closure state, or traversal
  selection. Its output is candidate interior material that ABG admits
  or rejects; handler output is not runtime truth until admitted by the
  ABG event path.

- **-023 Evidence honesty.** A handler's outcome status and evidence refs
  must correspond to real effects that occurred under the selected
  configuration. Archive paths, payload refs, execution refs,
  capability-invocation refs, human-response refs, and validation refs
  are replay-auditable and reconcile with -012 for the handler class.
  A handler may not assert success, execution, materialization,
  transport, human approval, or capability completion without admitted
  evidence for that effect.

- **-024 Declared configuration only.** Handler parameters come from
  admitted declarations: handler binding, transport contract, environment
  ingress, manifest/materialization/execution plan, response contract,
  budget envelope, and calibration or latitude rows. Ambient process
  environment, local path scans, default shell behavior, product-local
  prompt assembly, or hidden service discovery are not configuration
  authority. Tool knowledge stays inside declared handler configuration
  under the T-030 emergence boundary.

- **-025 Typed failure and budget respect.** Handler throw, timeout,
  refusal, overrun, malformed output, missing evidence, and contract
  breach are typed blocked or retryable outcomes under the one judgment
  router. They do not escape as host exceptions that bypass the spine,
  do not hang the traversal, and do not become product-local controller
  state. Timeout, attempt, concurrency, and escalation envelopes derive
  from the selected configuration or ladder; overrun is admitted failure
  truth.

- **-026 Idempotent evidence and resume.** Handler evidence is keyed by
  cCallRef plus declared handler binding identity. Re-entry and resume
  must either reuse matching admitted evidence or emit a new attempt under
  the retry law; duplicate archives, duplicate payload claims, and
  mismatched replay digests fail closed. A handler may not complete a
  resumed C call by reading unbound files or previous session state that
  is not linked through admitted evidence refs.

- **-027 Interpretation family.** Program interpretation, ladder
  selection, handler binding, handler execution, evidence admission,
  judgment routing, retry, and audit are one family of ABG-owned runtime
  mechanics. Downstream products may declare catalogs, labelled programs,
  ladder rows, handler selections, contracts, materialization specs,
  response schemas, calibration, and domain policy; they do not implement
  a parallel worker loop for the standard path. Custom handlers remain
  lawful only at the handler seam and remain subject to -018..-026.

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
substrate outside declared handler configuration; free-floating fibre
events on real replay; a no_declared_check judgment satisfying a
declared check; archives ≠ replay on any arm; handler output minting
spine truth; product-local standard-path worker loops; hidden handler
configuration from ambient scans or shells.
