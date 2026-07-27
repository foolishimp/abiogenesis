# T-268 - Design Replay-Grounded Observer And Tuner

> **Current disposition (2026-07-28):** active for one S04 design-only
> reframe. Implementation remains held until independent design review, direct
> acceptance, S06 closure, and later GOALS selection.

- id: T-268
- title: Design replay-grounded observer and tuner
- type: feature
- ticket_category: implementation_migration
- status: active
- implementation_hold: active
- implementation_hold_ref: GOAL-035 current S04 design-only gate
- implementation_hold_effect: >-
    authorize design, ADR, mechanical validation, exact freeze, and handoff
    only; prohibit runtime, contract, schema, event, operation, test,
    publication, package, or proof implementation
- phase_status: m5_s04_design_selected_realization_unselected
- review_status: candidate_design_pending_independent_review
- proof_status: design_mechanical_evidence_pending
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Resolve observer and tuner as a complete GTL free construction over exact
    ABG replay, where the executive evaluates an evolving workspace against an
    exact applied overlay and the tuner derives immutable catalog declaration
    successors A -> A1 under one explicit objective. Resolve the generic CLI
    trigger, atomic functions, Prime contraction, module ownership, lifecycle,
    transitions, reads, and proof before any realization begins.
- delivery_phase: M5_design_before_s04_realization
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md
- triaged_at: 2026-07-28
- created_at: 2026-07-13
- updated_at: 2026-07-28
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- parent_owner: T-270
- realization_predecessor: T-281/S06 must close before GOALS selects S04 code
- authority_refs:
  - specification/PRODUCT.md Observer And Tuner
  - specification/PRODUCT.md A5-F12
  - specification/PRODUCT.md ABG5-S04
  - specification/requirements/product/REQ-P-SCENARIOS.md REQ-P-SCENARIOS-011
  - specification/requirements/abg/REQ-R-ABG3-TUNER.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md FPC-018..021
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md FN-COMP-025
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md PROJECTION-021..023
  - specification/requirements/product/REQ-P-POLICY.md POLICY-036..037
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
- accepted_design_inputs:
  - build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Sections 1..12
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md
- candidate_design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md
- candidate_adr_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-047-reflective-optimization-is-gtl-over-replay.md

## Selected Design Outcome

Resolve one exact design relation:

```text
immutable catalog declarations A
  + existing admitted graph Run(s) and replay
  + exact applied EvaluationOverlay
  -> ABG-derived ObservationBasis vector
  -> Product overlay-fulfillment projection
  -> generic run.invoke through installed CLI
  -> executive observer GraphFunction and admitted evaluation
  -> exact TuningObjective and immutable TuningTargetSet
  -> tuner GraphFunction and grounded immutable A1 draft or no-proposal
  -> tuning.transition propose -> ratify | reject
  -> later ordinary Product/catalog registration may make exact A1 available
  -> pure observer/tuning reads
```

The observer and tuner are Product-owned GTL content using the existing
catalog, validator, HoG traversal, ABG events/replay, public operation family,
SDK, and CLI. The CLI is a shell. It adds no observer/tuner selection,
sequencing, replay, transition, retry, or result semantics.

## Design Scope

The candidate must resolve before implementation:

1. exact target WorkspaceBinding, Program, GraphFunction, materialization, Run,
   event-prefix, replay, result/evidence, executed immutable declaration set,
   applied evaluation overlay, policy, and lineage identity;
2. a complete Product-owned OverlayFulfillmentVector, ObserverReport,
   TuningSignalVector, TuningObjective, TuningTargetSet, and total criterion
   comparison algebra;
3. the exact meaning of tuning: ordinary GTL evolves workspace state, the
   executive evaluates that state against an immutable applied overlay, and
   the tuner proposes immutable declaration successors for future execution;
4. separate observer and tuner F_P judgments with an ABG-admitted result
   boundary;
5. a closed no-proposal/declaration-draft result family whose catalog target
   kinds are existing `graph_function`, `node_type`, and `overlay`
   declarations; policy changes remain subordinate content of a complete
   successor overlay/Program declaration;
6. complete immutable `A -> A1` content/digest/lineage, fixed
   EvaluationOverlay versus TargetOverlay authority, and exact existing-catalog
   hierarchical URI registration without latest aliases or a hierarchy engine;
7. one propose/ratify/reject lifecycle with exact Event Calculus effects and a
   later ordinary Product publication/catalog boundary;
8. read-only observer-report, observer-drafts, and tuning-report projections;
9. the exact generic CLI elimination relation;
10. the affected Ontology, function derivation, whole-family Prime contraction,
   IACS, module/interface mapping, three views, lifecycle, axioms, and
   module-owned proof; and
11. explicit exclusion of workspace solving by the tuner, target/declaration
   mutation, runner, controller, second catalog, hierarchy resolver, second
   event/replay authority, draft ledger, and automatic application.

## Design Acceptance

Independent reviewers must determine whether:

- every global decision has one local projection and falsification condition;
- no graph without admitted replay can be represented as a reflective target;
- every tuning episode has one exact applied evaluation overlay, objective,
  immutable target set, ordered criterion law, and baseline;
- no target overlay can evaluate itself and no proposal or ratification can
  claim realized improvement;
- every successor is a complete immutable A1 with a new exact URI/digest and
  explicit A lineage, while A and prior Runs remain unchanged;
- observer, tuner, transition, projection, and later change-reentry authorities
  are singular;
- existing GTL/HoG/ABG/Public atoms construct the complete function without
  hidden orchestration;
- the CLI can trigger the function through `run.invoke` without alternate
  functionality;
- no implementation choice remains over Product meaning, topology, identity,
  authority, event effects, failure, lifecycle, or public semantics; and
- the proposed module proof is derived from the design rather than from one
  installed happy path.

The worker runs mechanical checks only, freezes one exact design subject,
produces one handoff, and stops. It does not issue a semantic verdict.

## Realization Hold

Even after design acceptance, implementation remains unselected until:

1. S05 receives direct acceptance;
2. S06 closes;
3. GOALS explicitly selects Order 4 realization; and
4. T-268 records the accepted design identity and exact implementation
   boundary.

M5 realization will make S04 runnable over a bounded installed replay fixture.
M6/T-247 owns exact pre-RC self-conformance and the final S04 qualification
verdict.

## Non-Closure

This ticket does not close through:

- a design document without complete Ontology/Prime/IACS/three-view agreement;
- a CLI command that owns semantics;
- a direct worker or fixture invocation;
- a graph declaration without admitted replay;
- tuning without an explicit objective or against an unapplied/self-evaluating
  overlay;
- an in-place declaration patch, mutable latest alias, URI-prefix fallback, or
  automatic A-to-A1 rebinding;
- an observer or tuner controller, runner, registry, catalog, event store,
  draft ledger, or replay fold;
- a draft that mutates or applies itself;
- a report, test count, package row, or manifest substituting for installed
  behavior; or
- worker self-review or delegated acceptance.
