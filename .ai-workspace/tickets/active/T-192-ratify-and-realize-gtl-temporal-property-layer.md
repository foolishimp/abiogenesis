---
id: T-192
title: Ratify and realize the GTL temporal-property layer over event-calculus fluents
type: requirements_realization
ticket_category: gtl_temporal_property_law
status: active
goal: >-
  Add temporal-logic properties to GTL as a Rule kind over event-calculus
  fluents, checked F_D over finite replay traces (LTLf, three-valued), with
  past-time online gating for safety properties and residual-pressure routing
  for undetermined liveness — turning the standing audit gates into declared
  constitutional law the runtime enforces per run.
change_class: requirement_reprice
re_entry_point: gtl_temporal_property_layer
owner: abiogenesis
priority: high
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: STDO Method, SPEC_METHOD, GTL Rule law, ABG Runtime, Event Calculus, Projection, Assurance/Residual
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/backlog/T-191-ratify-gtl-authoring-loop-meta-law.md
source_documents:
  - .ai-workspace/comments/claude/20260705T030432Z_STRATEGY_gtl_llm_first_language_gaps.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
review_status: pending
proof_status: pending
target_truth: >-
  GTL declares temporal properties as a Rule kind over fluent formulas; ABG
  checks them as total F_D functions over finite replay traces with
  three-valued verdicts; safety/past-time properties gate online (block
  before dispatch/closure); undetermined liveness verdicts route to residual
  pressure, never runtime blockage; vacuous satisfaction is rejected by
  witness-count law; and the five standing audit gates are declared as the
  first property set and enforced on the live runner path.
non_closure_conditions:
  - Any new ontology beyond a Rule kind (no rival property carrier, no second
    fluent vocabulary — properties read existing event-calculus fluents).
  - A liveness property with an undetermined verdict blocks traversal, or an
    eventually-property silently passes on an unfinished trace
    (three-valued verdicts are mandatory; satisfied-by-default is masquerade).
  - A property passes vacuously without witnesses and still counts as
    satisfied for any gate.
  - Property verdicts re-derive residual/continuation truth instead of
    reading it, or properties quantify over node state rather than the event
    trace (two-truth / markov violations).
  - The property checker is proven only over constructed traces — the first
    property set must be enforced and differentially proven on the live
    runner path (wiring-proof gate).
  - Phase 0's temporal-algebra census is skipped: new temporal law shall not
    land on unverified T-119 scheduling law.
required_work:
  - "Phase 0 - T-119 census: answer precisely whether not_before/deadline truth gates runner eligibility/dispatch or is admitted-and-projected but never enforced (events ARE projected — projection.ts handles timer_intent_admitted etc.; the algebra's eligibility surface has zero runner references). Wire it, or record a typed exemption with a successor."
  - "Phase 1 - Ratify: temporal_property Rule kind over fluent formulas; LTLf finite-trace semantics; three-valued verdict law (satisfied/violated/undetermined); vacuity/witness-count law; enforcement-consequence split (safety may block online; undetermined liveness routes to residual pressure); properties read residual/continuation truth and range over the event trace only."
  - "Phase 2 - Realize the F_D checker: total function over the finite replay trace with event-calculus fluents as atomic propositions; past-time operators evaluated stepwise for online gating; verdict + witness + vacuity report as typed carriers emitted through the canonical event path."
  - "Phase 3 - First property set: declare the five standing audit gates as temporal properties (dispatch implies previously manifest_projected; close implies previously coverage_eligible; not_configured implies blocked; no worker invocation without admitted startup; census-derived arm binding). Differential proofs: trace mutation flips satisfied to violated; witness removal flips to vacuous-rejected; an undetermined liveness produces residual pressure and no block."
  - "Phase 4 - Live proof and record: enforce the property set on the live runner path (hello-world route), record per-property verdicts in the execution record, reconcile the design pack carrier diagram, and reprice PRODUCT/CONTRACT-LAW-API in the same wave."
acceptance_criteria:
  - The Rule kind, LTLf semantics, verdict law, vacuity law, and consequence
    split are ratified clauses.
  - The checker is a total F_D function over replay; verdicts are typed,
    replay-visible carriers.
  - All five standing gates run as declared properties on the live path with
    differential proofs (mutation, vacuity, undetermined-routing).
  - No property blocks on undetermined; no property passes vacuously; no
    second fluent or residual representation exists.
  - Phase 0's census answer is recorded (wired, or typed exemption + successor).
notes:
  - Split boundary - this is the DYNAMIC enforcement half; the static
    authoring-law half is T-191 (dependency is soft: the property Rule kind
    benefits from T-191 diagnostics but only Phase 1 ratification ordering
    genuinely depends on it).
  - Strategy anchor - post section 9 (three temporalities, five pinned
    decisions, precondition finding, consequence split) is the design brief;
    section 11 ranks this #2 on both bang-for-buck and foundational axes.
---

# T-192: GTL Temporal-Property Layer

Dynamic half of the LLM-first gap map: the constitution starts enforcing
itself per run. Fluents already exist and are wired; the property layer is a
Rule kind + a total F_D checker + the standing audit gates as the first
declared property set. Runtime verification, not model checking — the
census/all-paths obligations remain where they are.

## Phase 0 Census Record (2026-07-05, pre-activation)

VERDICT: T-119 scheduling law is DECLARED-BUT-UNWIRED IN FULL.
- Zero temporal-algebra function consumers outside the module + re-exports.
- Zero reads of the `abg.temporal_constraint` graph-vector declaration key
  anywhere (runner, iteration, conformance).
- Zero emissions of the three temporal event kinds (constructors never
  called).
- Proven in isolation only: test_t119_temporal_algebra_unit,
  test_t119_temporal_gtl_syntax, test_t122_temporal_deadline_policy,
  test_t126_temporal_runtime_scope_consolidation.

TYPED EXEMPTION (per this ticket's Phase 0 "wire it, or record a typed
exemption with a successor"): the wiring is exempted from Phase 0 because
it has a genuine design dependency the census surfaced — enforcement
requires a TIMER-PROVIDER seam (governed effect plugin admitting
TimerOutcome events against `clockRef`/`timerProviderRef`; the algebra is
already replay-honest — time enters as admitted outcomes, never wall-clock
reads). NAMED SUCCESSOR: "wire T-119 scheduling enforcement" = timer
provider plugin contract + runner eligibility gate reading
deriveTemporalConstraintFromGtl at vector planning + deadline-breach
emission + differential (not_before in the future -> vector not eligible;
timer outcome admitted -> eligible; breach -> pressure). The property
layer (this ticket's Phases 1-4) does NOT depend on scheduling
enforcement — LTLf properties quantify over traces, not clocks — so
activation is UNBLOCKED by this record.

## Activation (2026-07-06)

Activated as the next constitutional wave: Phase 0 census complete (typed
exemption + timer-provider successor recorded); Phases 1-4 open. The
T-188/T-190/T-191 closures supply the property layer's first targets (the
five standing gates as declared properties), and the R2-F1 consolidation
means the temporal carriers will be built next to ONE carrier home, not
three. Carrier pin applies to every slice.

## Phase 1 COMPLETE (2026-07-06) — ratification

CARRIER PIN (pre-slice, per convention): Rule {kind, config} (gtl m01) is
the property carrier — no new ontology; RUNTIME_FLUENT_NAME_VALUES +
deriveRuntimeEventCalculusProjection (event_calculus.ts, WIRED via
projection.ts) is the one fluent vocabulary/calculus; module.rules (m02)
is the authoring home; ExecutionBasis does NOT carry module rules — runtime
ingress rides the engine-start passthrough family (F1 one-authority),
basis-carried rules = named successor; residual routing consumes existing
residual carriers; verdict events follow the T-188 event-carrier pattern.

RATIFIED: specification/requirements/gtl/REQ-L-GTL3-TEMPORAL-PROPERTIES.md
-001..-012 (Rule kind; trace-only atoms = event-occurrence + fluent-hold
from the one vocabulary; closed operator grammar, fail-closed admission;
three-valued finite-trace semantics; first-class vacuity/witness law;
consequence split safety_gate/liveness_residual; declared gate points
dispatch|closure with replay-visible blocking; verdict carrier law reading
not re-deriving truth; ingress law; the five standing gates as the first
property set with enforcement-after-proof differentials; total checker;
T-119 exemption unchanged).

## Phase 2 COMPLETE (2026-07-06) — checker realized

contracts/temporal_properties.ts: fail-closed admitTemporalPropertyRule
(unknown operator/fluent/enums/kind + safety-requires-past-time, 5 axes
differentially proven), three-valued LTL3/LTLf checker (open prefix =>
undetermined futures; completed trace decides), first-class vacuity with
witness counts (zero-witness satisfied => vacuous), fluent atoms folded
from the ONE event calculus (basis-threaded axioms), where-guarded event
atoms, evaluateSafetyGateAtStep for online gating. 8/8 differentials incl.
mutation-flip and prefix/completed liveness routing.

GÖDEL CHECKPOINT 1 (post-P2 review-react): the checker's verdict-position
convention (past-rooted at final step, future-rooted at first) was code
truth not law — a one-step-historically checker would have been green
against the old wording. REACTED: REQ -004 amended in-wave to carry the
convention. NAMED (not fixed): effect-row identity mapping assumes the
calculus preserves event object identity (proven by test today; brittle if
calculus clones — successor: ref-keyed rows); per-dispatch gate evaluation
rebuilds trace context (O(trace) per gate — acceptable now, perf successor
for hot paths).

## Phase 3 + Phase 4 COMPLETE (2026-07-06)

P3: STANDING_GATE_TEMPORAL_PROPERTY_RULES — the five standing audit gates
as declared GTL Rules (data): dispatch-requires-manifest,
coverage-requires-payload-admission (the T-188 ordering law),
invocation-requires-dispatch, selection-requires-registry-admission
(safety_gate/dispatch|closure), dispatch-eventually-closes
(liveness_residual). Every gate proven before gating: lawful + mutation
+ vacuity differentials per safety gate; undetermined-open /
satisfied-completed / violated-never differentials for the liveness gate.

P4 (engine): temporal_property_verdict_projected carrier + factory +
admission (witnessCount nullable = no witness formula);
temporalPropertyStartup rides the ONE passthrough authority (every public
seam forwards it for free); startup admission fails closed (unlawful set
=> gap_stop before any traversal); ONE choke point (the local
emitRunnerEvents closure) derives full-set verdicts immediately before
EVERY terminal event — 47 terminal sites covered by a single
interception; completed terminals (traversal_applied/converged) decide
future obligations, all others leave liveness undetermined (LTL3); the
scalar dispatch arm gates candidates BEFORE they enter truth (violated
safety => replay-visible violated verdict + gap_stop, and the candidate
fp_dispatch_requested never appears in replay — proven differentially).

CARRIER NOTE (§5E-style): Rule(config: formula json) --admit-->
TemporalProperty --evaluate over (events x calculus fluents)-->
TemporalPropertyVerdict --construct--> verdict event --emit choke point-->
replay. One fluent vocabulary; one verdict carrier; verdicts read truth,
never write it.

NAMED SUCCESSORS: per-vector parameterized gate formulas (v1 is
kind-level); composed-arm dispatch gating (v1 gates the scalar arm — the
composed arms emit stage-task events, not fp_dispatch_requested);
closure-point online blocking (verdicts carry the pressure; fold
consumption is the successor); run-identity on verdicts richer than
basis-level; checker perf (per-gate trace rebuild).

## Phase 4 LIVE + Gödel Checkpoint 2 (2026-07-06)

LIVE EARNED: the standing gates rode the installed toy binding through
the CLI public path (temporalPropertyStartup on the one passthrough
authority) — test:t194:sandbox-live 1/1 with per-gate verdict asserts:
all five satisfied on the converged run, G1 witnessed non-vacuous, G5
liveness decided by completion; exactly 5 verdict events in the
instance's events.jsonl (no batch inflation on this shape).

CHECKPOINT 2 (review-react): (a) verdict-noise on multi-yield runs —
yields emit terminal_reached, so long runs would batch verdicts per
pause; REACTED: yield-kind terminals skip verdict derivation (pauses are
not judgments; every non-yield terminal judges). (b) refuted concern:
live batch count exactly 5. (c) carried: composed-arm gate,
per-vector formulas, closure-point fold consumption, run-identity depth,
checker perf — all named successors, none closure-blocking (the ticket's
non_closure list is satisfied by the scalar online gate + terminal
verdicts + live proof).
