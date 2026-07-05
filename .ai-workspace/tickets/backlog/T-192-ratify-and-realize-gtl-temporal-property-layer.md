---
id: T-192
title: Ratify and realize the GTL temporal-property layer over event-calculus fluents
type: requirements_realization
ticket_category: gtl_temporal_property_law
status: backlog
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
