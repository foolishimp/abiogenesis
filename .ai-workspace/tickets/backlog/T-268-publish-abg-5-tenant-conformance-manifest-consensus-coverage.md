# T-268 - Design Replay-Grounded Observer And Tuner

> **Current disposition (2026-07-28):** Direct F_H repriced `A5-F12` and
> `ABG5-S04` from ABIogenesis 5.0 to planned 5.1. The exact frozen design at
> candidate `4897ead1` is preserved byte-for-byte as non-operative future
> input. This ticket has no 5.0 realization, qualification, or release
> authority.

- id: T-268
- title: Design replay-grounded observer and tuner
- type: feature
- ticket_category: implementation_migration
- status: backlog
- implementation_hold: active
- implementation_hold_ref: planned ABIogenesis 5.1 Product re-entry
- implementation_hold_effect: >-
    preserve the exact frozen design; prohibit design repair and runtime,
    contract, schema, event, operation, test, publication, package,
    qualification, or proof implementation until stable 5.0 exists and a
    5.1 Product/GOALS re-entry explicitly selects A5-F12/ABG5-S04
- phase_status: planned_5_1_design_candidate_preserved
- review_status: not_selected_for_5_0
- proof_status: design_mechanical_evidence_passed
- goal: planned ABIogenesis 5.1 A5-F12/ABG5-S04
- change_intent: >-
    Resolve observer and tuner as a complete GTL free construction over exact
    ABG replay, where the executive evaluates an evolving workspace against an
    exact applied overlay and the tuner derives immutable catalog declaration
    successors A -> A1 under one explicit objective. Resolve the generic CLI
    trigger, atomic functions, Prime contraction, module ownership, lifecycle,
    transitions, reads, and proof before any realization begins.
- delivery_phase: planned_5_1
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
- parent_owner: future 5.1 Product owner
- deferred_from_release: 5.0.0
- deferred_to_release: 5.1.0
- realization_predecessor: >-
    stable released ABIogenesis 5.0 plus an explicit 5.1 Product and GOALS
    selection
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
- candidate_commit: 4897ead13d4d43bdd7538f74e3ce83888b03f5c6
- candidate_tree: 11d0ef7ba40cfbd6efc31f447b27b21834c23d54
- frozen_candidate_ticket_sha256: 67ac610d92c1a0192c1bd17e067082f396cbab762d5392cad8d92466befc523a
- candidate_design_sha256: a84cf02bb428ff1f0fce2c2b203a2ad478fa9a81b0c1ed3405cf9ed09893d3a5
- candidate_adr_sha256: 92c469ac44f9ae1dd65054fc363a25023ca75f7f153d148166f1a137c676627e
- candidate_core_aggregate_sha256: c85541d57e465c8eee55dc63f976a441085f849a479d67db95247816bb5e87fa
- candidate_identity_scope: >-
    exact ticket, design, and ADR blobs at candidate_commit; the current
    backlog projection records later delivery disposition and is not relabeled
    as that frozen ticket blob
- handoff_ref: >-
    .ai-workspace/comments/codex/
    20260727T170342Z_HANDOFF_t268_s04_immutable_tuning_design.md

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

Implementation remains unselected until:

1. stable ABIogenesis 5.0 is released;
2. a 5.1 Product re-entry selects `A5-F12` and `ABG5-S04`;
3. 5.1 GOALS assigns one active realization owner; and
4. that owner revalidates this frozen design against the released 5.0
   substrate before coding.

T-247 and T-248 do not own S04 qualification or release. A future 5.1
qualification owner must qualify the selected observer/tuner Product against
its exact 5.1 candidate.

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
