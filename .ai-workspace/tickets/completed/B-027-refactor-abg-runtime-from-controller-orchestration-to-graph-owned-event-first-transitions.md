# B-027 Refactor ABG runtime from controller orchestration to graph-owned event-first transitions

- id: B-027
- title: Refactor ABG runtime from controller orchestration to graph-owned event-first transitions
- type: bug
- ticket_category: implementation_migration
- status: completed
- goal: abg-declarative-runtime-refactor
- change_intent: Replace the remaining controller-owned ABG execution law with graph-owned, event-first, typed transition truth so the substrate stops carrying semantic authority in orchestration functions and runtime_config side channels.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - B-021 completed
  - B-022 completed
  - B-023 completed
  - B-024 completed
  - B-025 completed
  - B-026 completed
- intake_source: operator architecture review 2026-04-20; functional-programming review of ABG kernel 2026-04-20; comparison against odd_sdlc execution-contract migration 2026-04-20
- affected_boundary: ABG public operator execution path, start/iterate kernel, regime binding, event-emission authority, runtime-config policy carriage, bootstrap/install wrappers, projections over run and advancement truth
- triaged_at: 2026-04-20
- created_at: 2026-04-20
- activated_at: 2026-04-20
- updated_at: 2026-04-21
- completed_at: 2026-04-21
- release_line: 3.2.0-rc.1
- authoritative_contract: public `gen-start` and `gen-gaps` remain the ratified operator contract while runtime law migrates under one upstream typed carrier family
- old_path_classification: `gen_start()` / `gen_iterate()` / `_derive_state()` / `_close_completed_features()` / `_iterated_outcome()` / dispatch-runtime policy selection=`replace`; `runtime_config` semantic carriage=`demote to ingress`; live-status and proof-hold reconstruction=`reprice as projections`
- completed_prerequisites:
  - verified 2026-04-20 that B-021, B-022, B-023, B-024, B-025, and B-026 are present under .ai-workspace/tickets/completed/
- governing_design:
  - build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md
- constitutional_requirements:
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
- links:
  - INT-005
  - B-016
  - T-008
  - specification/PRODUCT.md
  - specification/INTENT.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md
- target_truth: ABG execution advances through the typed `ExecutionBasis` plus `AdvancementTransition` carrier family, with controller layers reduced to adapter binding only; `emit()` remains the one lawful write boundary and projections/read models derive from event truth rather than parallel controller state.
- superseded_truth: controller-owned `gen_start()` and `gen_iterate()` sequencing, `_derive_state()` and `_close_completed_features()` as hidden controller law, `_iterated_outcome()` and dispatch-runtime policy selection as imperative semantic centers, regime-specific binding functions used as semantic centers, and `runtime_config` as an engine-facing carrier for operator policy, asset targeting, proof-hold semantics, and admission semantics.
- closure_law: this ticket closes only when the public ABG advancement path no longer depends on controller-owned orchestration as the semantic center, the remaining operator/control policy is expressed through graph-owned carriers plus event-derived projections, and mixed controller-plus-graph proof no longer counts as closure evidence.
- evaluation_criteria:
  - a new authoritative source carrier or transition family is published for the migrated runtime path
  - that source carrier is explicitly named as `ExecutionBasis` plus `AdvancementTransition`, or an equivalent closed typed family that preserves the same law
  - public advancement/projection consumers read that source truth instead of reconstructing semantics locally
  - event truth is authoritative and projections are derived from it
  - `runtime_config` is reduced to adapter/bootstrap input, not semantic authority
  - deterministic gate dependencies no longer block lawful F_P dispatch when policy says unresolved constructive work should fall forward to F_P
  - proof shows one operator input changes deeper runtime effect through the new path
- non_closure_conditions:
  - `gen_start()` or `gen_iterate()` still serve as the semantic center for advancement policy in normal execution
  - `_iterated_outcome()` or dispatch-runtime policy selection still serve as the semantic center for advancement policy in normal execution
  - the upstream runtime carrier/algebra is still unnamed, implicit, or only reconstructible from controller code
  - `runtime_config` still carries authoritative operator, admission, or target semantics that are not first-class published carriers
  - old controller path and new graph/event path both pass in normal execution
  - regime binding still requires callers to reinterpret F_D/F_P/F_H truth procedurally instead of consuming one carrier/algebra
  - F_D gate dependencies can still block lawful F_P dispatch by structural dependency rather than resolved runtime policy
  - ticket wording, design wording, product wording, and proof wording still imply a more declarative runtime than the code actually provides
- proof_surface:
  - build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py
  - build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py
  - build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py
  - build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py
  - build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_structure.py

## Context

Abiogenesis is already closer to the desired graph-native shape than downstream
domains. The product and intent surfaces are explicit that:

- `GraphFunction` is the primary reusable workflow program
- `gen-start` and `gen-gaps` are the one public operator contract
- `StartIntent` is intentionally only `scope + target + until`
- `emit()` is the one lawful write boundary

But the runtime still keeps too much semantic authority in controller code and
runtime-config plumbing.

The practical result is a split runtime doctrine:

- GTL and product surfaces describe a declarative graph-first engine
- ABG execution still partly behaves like an orchestrator kernel

That split is already named by INT-005:

- run governance still has more than one semantic center
- event ownership is split between declared `emit()` law and traversal-local
  behavior

This ticket is the runtime refactor that closes that gap.

## Constitutional Anchors

The implementation under this ticket is constrained by these live
constitutional surfaces:

- [REQ-R-ABG3-INTERPRET](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-INTERPRET.md:19)
  - public execution enters through published graph-function carriers
  - graph vectors remain internal invariant-boundary truth
  - recursive and post-dispatch runtime truth must not fall back to hidden
    controller memory
- [REQ-R-ABG3-CONVERGENCE](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md:17)
  - convergence and closure are policy-driven, not interpreter-local strategy
  - deterministic-first, then fall forward to governed `F_P` when handling is
    absent or remains open
  - unresolved deterministic observer truth after constructive work stays
    downstream by default
- [REQ-R-ABG3-EVENTS](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-EVENTS.md:16)
  - `emit()` is the one lawful write boundary
- [REQ-R-ABG3-JOB-WORKER](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md:22)
  - runtime execution truth must not collapse into product-local imperative
    controller state
- [REQ-R-ABG3-RUN](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-RUN.md:26)
  - run terminalization must remain replay-visible rather than hidden
    controller cleanup
- [REQ-R-ABG3-TRANSPORT](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md:17)
  - post-dispatch runtime truth is engine-owned
- [REQ-R-ABG3-POLICY](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-POLICY.md:19)
  - ABG governs fallback law and admissible regimes rather than prompt-local
    strategy
- [ABG_3_CONSTITUTIONAL_DESIGN.md](/Users/jim/src/apps/abiogenesis/specification/ABG_3_CONSTITUTIONAL_DESIGN.md:419)
  - `emit()` is the only lawful write path
- [ADR-034](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md:1)
  - runtime execution law is carrier-and-event owned
- [ADR-035](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md:1)
  - deterministic handling must not structurally block lawful governed `F_P`
- [ADR-036](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md:1)
  - the upstream runtime carrier family is named as `ExecutionBasis` plus
    `AdvancementTransition`

If an implementation move can only be defended by local convenience and not by
one of these surfaces, it is drift.

## Functional Review Criteria

Review this ticket against ADR-034, ADR-035, and ADR-036 as implementation law,
not as style commentary.

Every code-review pass on `B-027` should ask:

1. Did this slice replace control-flow-owned meaning with carrier/algebra-owned
   meaning?
2. Did this slice reduce one semantic center, or only rename and relocate it?
3. Is the new runtime law expressed as a typed carrier or closed transition
   family rather than an open dict surface?
4. Is the main step readable as a pure transform over admitted runtime truth
   rather than an orchestration branch?
5. Are effects pushed to the edge:
   - `emit()`
   - manifest publication
   - file/output publication
   rather than mixed into the runtime-reading model?
6. Can downstream consumers pattern-match the carrier, or are they still
   reinterpreting payloads with `.get(...)`?
7. Is event truth authoritative, with projections/read models derived from it?
8. Does deterministic/F_D truth inform law without structurally blocking lawful
   governed `F_P`, per ADR-035?

Review findings should explicitly call out alignment or violation against:

- ADR-034 carrier-and-event-owned runtime law
- ADR-035 deterministic handling must not structurally block governed `F_P`
- ADR-036 `ExecutionBasis` plus `AdvancementTransition` as the named runtime
  carrier family

Passing tests do not satisfy this section by themselves. A slice that keeps the
same semantic center alive behind helpers, dict payloads, or adapter-local
policy still fails review even if behavior remains green.

## Problem Statement

ABG still carries its execution law in imperative controller seams that should
have been dissolved into graph-owned transitions, typed carriers, and
event-derived projections.

The main symptoms are:

1. `gen_start()` is still an imperative state machine over target resolution,
   state derivation, iterate invocation, and stop-predicate projection.
2. `gen_iterate()` is still a procedural kernel that plans and traverses rather
   than consuming one published runtime carrier/algebra.
3. `_iterated_outcome()` in `interpret.py` is still a deeper imperative kernel
   where policy is resolved, blocking is classified, pending dispatch is
   deduped, `bind_fp()` is called, and lifecycle events are emitted.
4. `dispatch_runtime.py` is still a semantic hook center where dispatch policy
   is dynamically imported and selected procedurally from manifest/runtime
   state.
5. `runtime_config` still acts as a semantic side channel for operator asset
   targeting, policy overlays, proof-hold policy, binding contracts, and
   bootstrap/runtime behavior.
6. F_D, F_P, and F_H are still bound through procedural helper functions that
   remain semantic centers for runtime truth.
7. Install/bootstrap/CLI wrappers still duplicate or thread runtime semantics
   instead of acting as thin delivery bindings over one substrate truth.

The issue is not that ABG lacks the right concepts. The issue is that the
runtime still cheats around them.

## Required Direction

ABG should keep its current public operator model and GTL law, but refactor the
runtime so:

- one explicit upstream runtime carrier/algebra is named and published first
- source carriers and graph-owned transitions become the semantic center
- controller layers are reduced to parsing, binding, and delivery
- events become authoritative runtime truth
- projections remain derived read models
- F_D, F_P, and F_H are expressed as one explicit runtime algebra instead of
  scattered procedural binding helpers
- deterministic gate dependencies inform residual truth and closure, but do not
  become a hard precondition that blocks lawful F_P dispatch when the contract
  still requires governed constructive work

This ticket is not asking for a new operator surface. It is asking ABG to make
the existing one truthful.

## Migration Declaration

### Old Truth Path

ABG advancement semantics are currently centered in controller/runtime
functions:

- `genesis.services.gen_start()`
- `genesis.services.gen_iterate()`
- procedural regime binders in `genesis.binding`
- `Scope.runtime_config` and downstream consumers of it
- bootstrap/install/CLI wrappers that thread the same semantic inputs through
  parallel delivery paths

### New Truth Path

ABG runtime semantics should be centered in graph-owned carriers and event-first
truth:

- published graph/callable carriers remain the unit of constructive compute
- one upstream runtime carrier/algebra is named explicitly and published first:
  `ExecutionBasis` plus `AdvancementTransition`
- advancement policy and control facts are represented through first-class
  runtime carriers and event transitions
- controller/adapters only normalize operator input and invoke the lawful
  runtime path
- projections and status surfaces derive from event truth plus admitted runtime
  carriers

### Carrier Shape Commitment

The replacement for controller-owned runtime law must not be another open dict
surface.

The upstream carrier/algebra introduced by this ticket is the `ExecutionBasis`
plus `AdvancementTransition` family from ADR-036.

It must remain a closed typed carrier family:

- tagged union / sealed-sum style at the design level
- explicit discriminants for category or regime
- consumers pattern-match on the carrier shape
- no `.get()`-driven fallback interpretation as the primary runtime-reading
  model

### Regime Algebra Commitment

F_D, F_P, and F_H must read as one runtime algebra over that same carrier
family.

That means:

- deterministic, probabilistic, and human-admission transitions are explicit
  regime-shaped variants or equivalent typed carriers
- an F_D transition cannot smuggle agent-call transport semantics
- an F_P transition cannot masquerade as deterministic closure
- F_D gate dependencies may contribute residual truth and closure law, but they
  must not block lawful F_P dispatch when resolved runtime policy says the
  boundary still requires constructive work

### Producer Set

- GTL `Module.graph_functions`
- published start target catalog and operator asset registry
- runtime event stream through `emit()`
- new or repriced runtime carriers introduced by this migration

### Consumer Set

- `gen-start`
- `gen-gaps`
- CLI/build/install bindings
- regime binding and runtime envelope evaluation
- live status and operator-facing projections
- installed non-live qualification and kernel integration proof

### Projection And Proof Surfaces

- stop-predicate projection
- gap projection
- live status projection
- manifest/provenance surfaces touched by runtime truth
- installed qualification and kernel integration tests
- structural proof that the old path can no longer advance once the new carrier
  is removed

### Closure Law

This migration closes only when the new runtime carriers and event-derived
projections are the real source of truth for public advancement behavior and
the old controller/runtime-config-centered path is removed or explicitly
demoted from authority.

## Interface Inventory

This is the current best-guess migration surface from a live code walkthrough.
It is not closure evidence.

### Primary legacy interfaces

- `build_tenants/abiogenesis/python/code/genesis/services.py`
  - `StartIntent`
  - `Scope`
  - `gen_start()`
  - `gen_iterate()`
  - `gen_gaps()`
  - `_resolve_start_jobs()`
  - `derive_operational_state(...)`
  - `_close_completed_features()`
  - `stop_predicate_from_transition(...)`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
  - `TraversalRuntime`
  - `_iterated_outcome()`
  - runtime-side policy resolution and lifecycle/event orchestration
- `build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
  - `auto_dispatch_from_result()`
  - dynamic dispatch policy import/selection
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
  - `bind_fd()`
  - `bind_fp()`
  - `bind_fh()`
  - `bind_fp_certified()`
  - asset-binding and runtime-config contract helpers
- `build_tenants/abiogenesis/python/code/genesis/policy.py`
  - `resolve_policy_bundle()`
- `build_tenants/abiogenesis/python/code/genesis/proof_hold.py`
  - `resolve_proof_hold_policy()`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
  - public adapter binding for `start` and `gaps`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
  - `project_live_run_status()`
  - proof-hold and live-status projection over runtime truth
- `build_tenants/abiogenesis/python/code/app_bootstrap.py`
- `build_tenants/abiogenesis/python/code/gen-install.py`

### Side-channel and duplicated authority surfaces

- `Scope.runtime_config`
- `runtime_config.operator_asset_contract`
- `runtime_config.asset_binding_contract`
- `runtime_config.proof_hold_policy`
- `runtime_config` policy precedence in `genesis/policy.py`
- policy/config threading through bootstrap/install wrappers
- stop/status projection that reconstructs semantics from controller outputs

### Adjacent design surfaces

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`

## Design-Law Review Readout

After `T-008` and `ADR-034`, the ticket is better grounded:

- the runtime-law source is now explicit
- the old bootstrap/orchestration reading is demoted
- controller-versus-carrier review now has one governing design surface

The remaining ticket defect is now sharper:

- the ticket now names the exact upstream runtime carrier/algebra that must
  replace controller ownership
- the remaining risk is scope accuracy: every surviving imperative semantic
  center has to be explicitly included in the break surface

## Proof Rule For Mixed-State Rejection

This ticket does not accept “both paths still pass” as progress evidence.

Closure requires proof that:

1. removing or disabling the new upstream runtime carrier makes advancement
   impossible rather than merely degraded
2. every regime transition that matters to closure is replay-visible in the
   event stream
3. downstream status/dossier/operator consumers can only pass through the new
   carrier/event path

## Legacy Interfaces To Break

This is the current numbered break list. The point is to force the old chain to
fail and then rebuild the lawful path over the new runtime carriers.

### Source-boundary breaks

1. `genesis.services.gen_start()` still owns advancement sequencing.
   - current role:
     - resolve jobs
     - derive state
     - special-case converged / nothing_to_do
     - call `gen_iterate()`
     - project stop predicates
   - break required:
     - stop treating `gen_start()` as the semantic center for public
       advancement behavior
     - keep `StartIntent` small and lawful, but move advancement semantics into
       graph-owned runtime carriers and event-first transitions

2. `genesis.services.gen_iterate()` still owns traversal planning and execution
   as a procedural kernel.
   - current role:
     - call `plan_next_traversal(...)`
     - call `traverse(...)`
     - return raw result dictionaries
   - break required:
     - remove the current controller-like kernel status where the runtime law
       is centered in one imperative function
     - make traversal policy and transition state readable from one runtime
       carrier/algebra

3. `genesis.services._derive_state()` still reconstructs operational truth in
   the controller layer.
   - break required:
     - stop treating controller-local derived state as the authoritative basis
       for advancement decisions
     - move the advancement basis into `ExecutionBasis`

4. `genesis.services._close_completed_features()` still mutates workspace files
   as converged controller closure logic.
   - break required:
     - stop performing terminalization as hidden controller mutation
     - make terminalization replay-visible and projection-derived

5. `genesis.services._project_start_stop_predicate()` still reconstructs
   public stop truth from controller result shape.
   - break required:
     - stop deriving operator stop truth from raw controller output fields
     - make stop truth a projection over event/runtime carrier truth

6. `genesis.interpret._iterated_outcome()` is still the deeper imperative
   semantic center.
   - current role:
     - resolve policy
     - classify blockers
     - dedupe pending dispatch
     - call `bind_fp()`
     - emit lifecycle events
   - break required:
     - stop treating `_iterated_outcome()` as the authority that assembles the
       runtime doctrine
     - re-express this boundary as interpretation over `ExecutionBasis` plus
       `AdvancementTransition`

7. `genesis.dispatch_runtime.auto_dispatch_from_result()` still resolves
   policy and dispatch selection procedurally from manifest/runtime state.
   - break required:
     - stop letting dispatch-runtime hook selection become a second semantic
       center
     - make dispatch authority readable from the same typed carrier family

### Regime and algebra breaks

8. `genesis.binding.bind_fd()` is still a semantic center for deterministic
   advancement readiness.
   - current role:
     - evaluate F_D
     - partially integrate F_H and F_P state through helper calls
     - build the precomputed manifest
   - break required:
     - stop making one procedural binder the point where runtime algebra is
       implicitly assembled

9. `genesis.binding.bind_fh()` still encodes F_H admission as a special helper
   call into ledger-backed truth.
   - break required:
     - keep the admitted truth source, but stop expressing F_H runtime law as a
       procedural side function instead of as part of one runtime algebra

10. `genesis.binding.bind_fp_certified()` still encodes F_P certification truth
   procedurally.
   - current role:
     - replay resets
     - resolve published fulfillment truth
     - decide certification closure
   - break required:
     - keep the fulfillment-ledger truth but stop requiring a dedicated helper
       as the semantic center for certification law

11. `genesis.binding.bind_fp()` still assembles the constructive boundary as an
   imperative procedure over precomputed material, workspace asset bindings,
   and runtime-config hooks.
   - break required:
     - reduce this function to assembly over admitted runtime carriers rather
       than allowing it to remain a second semantic center

### Side-channel breaks

12. `Scope.runtime_config` still carries semantic runtime authority.
   - current role:
     - operator asset registry contract
     - asset binding contract
     - policy/config overlays
     - bootstrap/runtime delivery hooks
   - break required:
     - demote `runtime_config` to adapter/bootstrap input where possible
     - keep it only where it does not damage algebraic composition
     - move authoritative semantics into first-class published carriers

13. `_operator_asset_contract(...)` and `_asset_binding_query_contract(...)`
   still make runtime semantics depend on ad hoc config-shaped carriers.
   - break required:
     - retain the hook surface, but stop letting these functions define runtime
       meaning through config dict interpretation

14. `genesis.policy.resolve_policy_bundle(...)` still gives `runtime_config`
    broad precedence in resolved policy interpretation.
    - break required:
      - keep ingress lawful
      - stop letting config precedence stand in for first-class runtime carrier
        truth

15. `genesis.proof_hold.resolve_proof_hold_policy(...)` still makes proof-hold
    semantics depend on `runtime_config` as authoritative input.
    - break required:
      - keep proof-hold projection replay-derived
      - move policy authority into first-class admitted/runtime-owned truth

### Delivery-binding breaks

16. `genesis.cli_adapter` still carries public control-plane behavior that
    reconstructs or overrides runtime meaning.
    - current role:
      - adapter-local control loops
      - proof-hold stopping
      - live-status projection carriage
    - break required:
      - keep delivery bindings thin
      - reduce adapter-local semantic ownership in favor of projection over
        canonical runtime truth

17. `app_bootstrap.py` and `gen-install.py` still duplicate start/gaps wiring
    through bootstrap/install wrapper code.
    - break required:
      - reduce these to delivery/install bindings over one substrate path
      - stop teaching a second runtime story at install/bootstrap level

18. `genesis.live_status.project_live_run_status(...)` is aligned with replayed
    proof-hold truth, but remains a downstream consumer that must be repriced
    once the upstream runtime carrier changes.
    - break required:
      - keep it as projection only
      - ensure it does not reconstruct semantics from old controller output

## Dependency Map

### Foundation already landed

These tickets are already completed and should be treated as prerequisites that
established the public operator surface this refactor must preserve:

- `B-021` public `gen-start` / `gen-gaps` contract repriced
- `B-022` `StartIntent(scope, target, until)` introduced
- `B-023` public graph-function targeting published
- `B-024` operator asset registry and ownership surface published
- `B-025` public control-mode families classified outside `StartIntent`
- `B-026` primary public execution-chain proof added

This means `B-027` must not re-open the public contract. It must make the
runtime truthful under that already-landed contract.

### Adjacent but not blocking

- `INT-005`
  - names the semantic-center and event-ownership split this ticket is closing
- `B-016`
  - related IoC-hook standardization work
  - useful design pressure, but not the direct source-carrier migration ticket

### Required break order for this ticket

This ticket is one migration wave, but the work inside it still has an
inside-out dependency chain:

1. name and publish the upstream runtime carrier/algebra
2. rebind `_iterated_outcome()` and dispatch-runtime policy selection to that
   source
3. rebind `_derive_state()` / `_close_completed_features()` / stop projection
   to that source
4. rebind F_D / F_P / F_H helpers to the same source
5. demote `runtime_config` from semantic authority
6. rebind `gen_iterate()` / `gen_start()` as downstream bindings over that
   source
7. reprice CLI/bootstrap/install/live-status consumers
8. reprice proof and projection surfaces

Downstream proof, status, and adapter cleanup are non-closure evidence until
the upstream runtime carrier is authoritative.

## Break-To-Closure Map

- Breaks 1–7 close the controller-owned source-boundary clause:
  - `gen_start()` / `gen_iterate()` / `_derive_state()` /
    `_close_completed_features()` / stop-predicate reconstruction /
    `_iterated_outcome()` / dispatch-runtime policy selection are no longer the
    semantic center
- Breaks 8–11 close the regime-algebra clause:
  - F_D / F_P / F_H no longer require procedural rebinding as the runtime
    doctrine
  - deterministic gate dependencies no longer block lawful F_P dispatch when
    policy requires constructive work
- Breaks 12–15 close the side-channel clause:
  - `runtime_config` and contract-reader helpers no longer serve as semantic
    authority
- Breaks 16–18 close the downstream delivery/projection clause:
  - CLI/bootstrap/install/live-status are repriced as downstream consumers only

Current state note:

- public `gen_start()` / `gen_iterate()` now bind over typed runtime carriers
  downstream of the kernel
- blocker, regime, and dispatch classification now flow through carrier-side
  runtime truth rather than `interpret.py`-local blocker logic
- Phase 4 regime law now publishes one typed binder surface
  (`RegimeBindingSet`) and the legacy binder names are adapters over that
  algebra rather than semantic centers
- `PrecomputedManifest` no longer stores independent
  `failing_evaluators` / `passing_evaluators` lists; those names are derived
  read models over `RegimeBindingSet`, and construction without the carrier
  fails closed
- `_iterated_outcome()` is now a thin effect shell over
  `IterationExecutionPlan` and existing typed subplans
- admitted operator-asset and asset-binding contracts are retained as lawful
  ingress only when admitted once at Scope/runtime/bootstrap boundaries and
  then consumed as typed carriers downstream

The structural migration and closure reconciliation are complete for the 3.2.0
release-candidate line.

## Review Defect Readout

This section records the review-derived defect set against the ticket's own
functional criteria and the final closure state for `B-027`.

### Fixed in the current slice

1. Runtime construction no longer invents policy as hidden object-init law.
   - previous defect:
     - `TraversalRuntime.__post_init__` resolved policy when callers omitted it
     - that made policy invention a hidden semantic center at runtime-object
       construction
   - current state:
     - direct `TraversalRuntime(...)` construction now fails closed without
       admitted `resolved_policy`
     - explicit runtime admission now goes through
       `admit_traversal_runtime(...)`

2. Missing admitted policy in result ingest no longer leaks as a raw Python
   exception on preserved-result or successful-dispatch ingest paths.
   - previous defect:
     - dispatch-runtime salvage/ingest could raise raw `ValueError` for missing
       `resolved_policy`
   - current state:
     - dispatch-runtime converts that defect into fail-closed runtime truth on
       the dispatch path

3. `IterationAdvanceDecision.resolved_policy` is no longer an open dict in the
   live runtime path.
   - previous defect:
     - the decision carrier held policy as `dict[str, Any]`
   - current state:
     - the in-memory runtime path now admits and carries typed `ResolvedPolicy`
       truth

4. `DispatchBindingRequest` no longer threads raw `runtime_config` into
   `bind_fp()`.
   - previous defect:
     - typed dispatch planning still carried the old side channel underneath
   - current state:
     - the effect shell now resolves admitted asset bindings first and passes
       those bindings into `bind_fp()`

5. Operator-asset and asset-binding query meaning no longer enters normal
   execution through raw config readers.
   - previous defect:
     - live call sites still depended on raw `runtime_config` readers for
       asset target and asset-binding meaning
   - current state:
     - the public, installed, and kernel paths now admit
       `OperatorAssetQueryContract` / `AssetBindingQueryContract` first and
       consume those admitted contracts downstream

6. `resolve_policy_bundle(...)` no longer treats `runtime_config` as a generic
   concern-override surface.
   - previous defect:
     - config could override dispatch/evaluation/escalation/proof/closure as a
       first-class semantic surface
   - current state:
     - config is restricted to `policy_bundle` /
       `default_policy_bundle` ingress only
     - direct concern overrides now fail closed

7. Normal proof-hold and live-status execution no longer use raw
   `runtime_config` fallback semantics.
   - previous defect:
     - start loops, live status, and gap projection could still stop or
       project through config-side proof-hold authority
   - current state:
     - start loops read carrier/manifest `resolved_policy`
     - live-status reads manifest `resolved_policy`
     - `gen-gaps` now projects proof-hold from per-edge admitted resolved
       policy instead of raw config

8. Phase 4 regime algebra is now published and consumed as one typed surface.
   - previous defect:
     - `bind_fd()`, `bind_fh()`, `bind_fp_certified()`, and `bind_fp()` still
       acted as separate doctrinal centers
   - current state:
     - `RegimeBindingSet` now publishes the admitted F_D / F_H / F_P binding
       surface
     - `bind_fh()` and `bind_fp_certified()` are wrappers over typed outcomes
     - `bind_fd()` now publishes that algebra on `PrecomputedManifest`
     - `PrecomputedManifest` no longer carries stored legacy evaluator
       partitions beside the algebra
     - convergence/runtime-carrier read the typed algebra instead of
       reconstructing regime truth from raw evaluator lists
     - a mixed-state proof mutates the carrier out of a fixture and verifies
       convergence fails closed rather than falling back to legacy lists

9. `_iterated_outcome()` no longer assembles runtime doctrine in one body.
   - previous defect:
     - runtime-open, binding entry, manifest publication, iteration-start, and
       completion planning were all assembled inline
   - current state:
     - `_iterated_outcome()` now delegates normal-path assembly through
       `IterationExecutionPlan`
     - the function remains an effect shell, but no longer acts as the
       semantic center for the runtime doctrine

10. Contract-ingress is now explicit rather than an unresolved code-path
    question.
    - previous defect:
      - operator-asset and asset-binding contracts were admitted from raw
        config in scattered live call sites, and break 13 had no explicit
        design/ticket resolution
    - current state:
      - `Scope` admits operator-asset and asset-binding contracts once at the
        boundary
      - `plan_next_traversal()` and `TraversalRuntime` now carry admitted
        asset-binding contract truth into the kernel
      - raw config readers are no longer part of normal runtime execution
      - config-backed admitted contracts are retained as lawful ingress for
        this line; raw config itself is not runtime authority

11. Helper-level proof-hold/live-status config compatibility is removed.
    - previous defect:
      - `proof_hold.py` and `live_status.py` still exposed raw config fallback
        signatures after the live path had moved to admitted policy truth
    - current state:
      - proof-hold and live-status now consume admitted `resolved_policy`
        surfaces only
      - the old helper compatibility no longer exceeds the carrier-first live
        path

### Closure Readout

1. Source-boundary breaks are closed.
   - `gen-start` and `gen-iterate` consume typed kernel carrier truth.
   - service/controller helpers no longer own advancement, completion, or stop
     semantics.

2. Regime-algebra breaks are closed.
   - `RegimeBindingSet` is the single `F_D` / `F_P` / `F_H` regime authority.
   - convergence and runtime publication derive from that algebra.
   - construction without the algebra fails closed.

3. Side-channel breaks are closed for normal execution.
   - `runtime_config` is retained only as adapter/bootstrap ingress.
   - admitted policy and contract carriers are consumed downstream.

4. Delivery/projection wording is reconciled.
   - root README, live docs under `docs/`, RC notes, and the installed
     bootloader now describe the 3.2.0 carrier/event-owned runtime boundary.
   - stale draft/rendition docs were moved under `docs/old/`.

5. Mixed-state closure evidence is present.
   - targeted proof covers carrier-only advancement and mixed-state rejection.
   - full Python tenant suite is green.
   - live F_P qualification passed from the authenticated Claude harness.

### Current Proof State

- focused `B-027` proof bundle is green:
  - `test_abg3_runtime_structure.py`
  - `test_abg3_runtime_envelope.py`
  - `test_cli_adapter_auto.py`
  - `test_m03_engine_kernel_integration.py`
  - current result: `206 passed`
- full Python tenant suite is green:
  - `build_tenants/abiogenesis/python/test_env/tests`
  - current result: `317 passed, 19 deselected`
- the proof surface named in this ticket was rerun explicitly:
  - `test_cli_adapter_auto.py`
  - `test_sandbox_install.py`
  - `test_m03_engine_kernel_integration.py`
  - `test_m02_work_publication_integration.py`
  - `test_abg3_runtime_envelope.py`
  - `test_abg3_runtime_structure.py`
  - current result: green
- live F_P qualification:
  - `test_sandbox_usecases_live.py`
  - current result: `5 passed` from authenticated Claude harness

## Why These Were Missed

The misses were structural review misses, not ticket-law misses.

1. Review focus stayed on `_iterated_outcome()` and dispatch-carrier
   decomposition, so constructor admission and preserved-result ingest paths
   were under-audited.
2. Focused proof stayed too close to the happy path:
   - it proved typed carrier flow through traversal and dispatch
   - it did not force direct runtime construction without admitted policy
   - it did not force preserved-result or successful-dispatch ingest through
     the missing-policy defect path
3. Typed wrappers around `runtime_config` looked like migration progress but
   still preserved named break-13 authority under a nicer shape until this
   slice moved `bind_fp()` entry onto admitted asset bindings.
4. `RegimeBindingSet` was initially added beside stored evaluator partitions,
   and happy-path tests kept those partitions synchronized. That hid the
   closure defect: convergence could still have trusted the old list if the
   algebra and legacy partition disagreed.

## Next Address Order

The next lawful order is now closure-focused:

1. perform one explicit code review against this ticket’s checklist,
   non-closure conditions, and break-to-closure map
2. reconcile ticket/design/product/proof wording with the live tree
3. decide ticket status from that review readout; do not flip by drift

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] mixed old/new tests are removed or repriced
- [x] ticket, design, product, and proof wording are reconciled before closure
