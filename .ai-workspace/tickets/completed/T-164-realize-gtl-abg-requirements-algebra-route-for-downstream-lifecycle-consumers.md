---
id: T-164
title: Wire and pin GTL/ABG requirements-algebra route for downstream lifecycle consumers
type: feature
ticket_category: downstream_substrate_gap
status: completed
goal: >-
  Wire and pin the existing T-162 requirements-algebra carriers and functions
  into a public, runtime-emitted, replay/query-visible GTL/ABG system route,
  adding only the missing bridge/query/composition pieces required for the
  first downstream lifecycle route. Downstream ODD products must consume this
  route directly instead of rebuilding requirement compilation, evidence
  binding, assurance folds, residuals, continuation, re-entry, or
  graph-function catalogs locally.
change_intent: >-
  The odd_glc T-002/T-003 discovery proved that T-162 already supplied the core
  requirements-algebra carriers and functions, but downstream close-capable
  lifecycle use still sees them as test-only, unwired, unpinned, or missing at
  specific bridge points. This ticket absorbs that upstream gap into
  ABIogenesis as wiring and pinning, not a greenfield carrier redesign. GTL
  owns requirement declarations and the optional lifecycle composition
  declaration. ABG owns requirement admission, replay, environment projection,
  obligation projection, evidence binding, assurance fold projection,
  residual/attenuation projection, continuation/re-entry disposition, and
  read-only lifecycle query truth. Downstream products may label, interpret,
  and specialize admitted truth; they may not publish generic system functions
  under product-local names or mint peer ledgers that rival ABG.
change_class: requirement_reprice
re_entry_point: requirements
downstream_reentry_sequence:
  - design_reframe
  - realization_refactor
owner: abiogenesis
priority: critical
triaged_at: 2026-06-28
created_at: 2026-06-28
updated_at: 2026-06-28
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Downstream ODD Consumers
build_tenant: typescript
source_identity:
  abiogenesis_path: /Users/jim/src/apps/abiogenesis
  abiogenesis_git_rev: 271a6d4
  abiogenesis_package_version: 4.1.0-rc.11
  odd_glc_path: /Users/jim/src/apps/odd_glc
  odd_glc_git_rev: b12bc3e
  odd_sdlc_path: /Users/jim/src/apps/odd_sdlc
  odd_sdlc_git_rev: 52d1962
source_documents:
  - CLAUDE.md
  - specification/GOALS.md
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/requirements_algebra.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/requirements_algebra.ts
  - docs/USER_GUIDE.md
  - docs/LLM_GTL_APP_BUILDER_GUIDE.md
  - .ai-workspace/comments/codex/20260628T124437Z_T164_odd_sdlc_requirements_route_migration_guidance.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/T-002_gtl_abg_substrate_gap_report.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/T-002_odd_sdlc_feature_readiness_comparison.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/T-003_gtl_abg_gap_work_backlog.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/T-003_gtl_abg_requirements_algebra_system_design.md
related_tickets:
  - .ai-workspace/tickets/completed/T-145-realize-evaluate-c-as-evaluation-set-phase-over-read-only-ledgers.md
  - .ai-workspace/tickets/completed/T-148-realize-runtime-continuation-transition-projection.md
  - .ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md
  - .ai-workspace/tickets/backlog/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
  - .ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md
  - .ai-workspace/tickets/completed/T-163-make-shared-product-toolchain-the-only-install-resolution-model.md
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-003-define-gtl-abg-gap-work-and-upstream-design.md
affected_boundary:
  goals:
    - specification/GOALS.md
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
    - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_FIRST_SLICE_IACS.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/projection/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/queries/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t162_requirements_algebra.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t164_requirements_route_facade.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t162_requirements_algebra_live.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t164_requirements_algebra_downstream_readiness_live.test.mjs
target_truth: >-
  ABIogenesis publishes a stable GTL/ABG requirements-algebra route consumable
  by downstream ODD products. Requirement declarations enter through existing
  GTL declaration carriers and ABG admission. Existing T-162 symbols remain the
  source of the route: they are exported through stable public paths, called by
  non-test runtime/query code, and pinned to an explicit consumed source or RC
  identity for dependent design. ABG emits fold, residual, and disposition truth
  on the real traversal path when edges close; downstream queries replay those
  admitted events rather than computing closure lazily from fixture inputs.
  Downstream products consume the route directly, then add domain labels and
  policy overlays without republishing generic ABG functions or minting shadow
  carriers.
superseded_truth: >-
  T-162 pure functions, compatibility wrappers, and synthetic tests are treated
  as sufficient downstream substrate even when there is no public requirements
  route, no runtime/query caller, no admitted evidence bridge, no assurance
  closure bridge, manually supplied truth refs, no explicit consumed source or
  RC identity, or product-local peer ledgers filling the requirement middle.
closure_law: >-
  Close only when requirements audit, design, TypeScript realization,
  synthetic proof, non-forgeability proof, non-test runtime/query caller proof,
  live or installed proof, public export proof, and explicit source/RC pinning
  prove the downstream-consumable GTL/ABG requirements-algebra route. Closure
  must prove that evidence binding consumes admitted runtime evidence events
  rather than booleans; requirement folds consume ABG assurance closure truth
  rather than manual strings; fold, residual, and disposition events are emitted
  on the real traversal path when an edge closes; residuals and dispositions
  carry source refs; lifecycle state is projected through ABG replay/query over
  admitted events; and no downstream-specific `glc.*`, SDLC, or product-local
  route becomes the generic system function owner. A later stable product
  release may replace the accepted RC/source pin, but stable-release publication
  is not required before the dependent design can treat the pinned RC/source
  identity as explicit substrate identity.
---

# T-164: Wire And Pin GTL/ABG Requirements-Algebra Route For Downstream Lifecycle Consumers

## STDO Triage

### Intake Finding

T-162 closed the first requirements-algebra slice, but odd_glc T-002/T-003
found that downstream close-capable lifecycle use still cannot consume it as a
complete GTL/ABG substrate.

The ready adjacent ABG endpoints are not the main gap:

- process actor invocation;
- runtime payload and evidence admission;
- assurance closure decision truth;
- continuation transition and graph-span re-entry truth;
- public start and runtime traversal selection;
- result-envelope ingress.

The main gap is the requirements-algebra middle:

```text
GTL requirement declarations
-> ABG requirement admission and replay ledger
-> context route
-> edge requirement environment
-> obligations / materialization / execution schedule
-> ABG execution and evidence admission
-> requirement evidence binding
-> assurance closure to requirement fold
-> residual and attenuation
-> requirement-specific continuation/re-entry disposition
-> read-only lifecycle projection
```

### First Missing Layer

`requirements`.

The product boundary is stable: ABIogenesis is the GTL/ABG product line and
downstream products are consumers. The missing work starts with a requirement
audit because the existing T-162 law names most of the substrate, but the
downstream readiness gate now requires explicit public-route, non-test-caller,
non-forgeability, release-pinning, and no-republish guarantees. Any uncovered
slot must be added to the GTL/ABG requirement surface before design or code
claims closure.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

This ticket does not reprice product identity. It reprices the requirements
surface only where the public downstream-consumption contract is not explicit,
then reframes M03 requirements-algebra design and realizes the TypeScript route.

### Boundary Rule

A function or carrier is GTL/ABG-owned when multiple ODD domains need it
identically. Requirement declaration, admission, projection, evidence binding,
fold, residual, attenuation, continuation, re-entry, and lifecycle read models
meet that test. They shall not be republished under `glc.*`, `sdlc.*`, or any
other downstream namespace as generic constructive carriers.

GTL must not depend on ABG runtime modules. The `gtl.requirements` facade and
`GtlRequirementsLifecycleComposition` may carry published refs, contract refs,
or symbolic bindings to `abg.requirements.*`; they shall not import
`abg/m03` runtime code from `gtl/m01`.

### Resolved Decisions

The first downstream route is scoped to the minimal steel-thread substrate. It
does not include multi-requirement decomposition or KAOS-style refinement.

| Decision | Resolution |
| --- | --- |
| `RequirementLifecycleDisposition` | Named query projection over existing ABG continuation/re-entry carriers, not a writable carrier. |
| requirement derivation/refinement | Deferred from route 1; `derive_requirement_graph` and `refine_goal` are not on the first-route critical path. |
| public route names | Use `abg.requirements.*` and `gtl.requirements.*` as public facades over existing symbols, with a 1:1 reconciliation table. |
| pinning | The current consumed source/RC identity is explicit enough for dependent design: abiogenesis git `271a6d4`, package `4.1.0-rc.11`. Stable release publication is a successor hardening gate. |
| empty assurance case | Use `no_evidence`, distinct from `blocked`. |

## Required Work

### A. Wire And Pin Existing T-162 Symbols

Do not rename, redeclare, or mint replacement carriers for these rows. Each row
must reconcile to the existing exported TypeScript symbol and then add a public
route, a non-test runtime/query caller, and proof.

| ID | Existing symbol(s) | Work | Closure gate |
| --- | --- | --- | --- |
| T164-A-001 | `GtlRequirementDeclaration`, `GtlRequirementRelationDeclaration`, `GtlRequirementTestRelationDeclaration`, `GtlRequirementsAlgebraDeclarationBundle`, `constructGtlRequirementsAlgebraDeclarationBundle` | Expose stable `gtl.requirements.*` public facade and pin the consumed source/RC identity. | Public API test proves downstream import path; dependent design records git `271a6d4`, package `4.1.0-rc.11`. |
| T164-A-002 | `RequirementLedger`, `projectRequirementLedger` | Keep `RequirementLedger` replay-derived and wire declaration admission into its event stream. | Non-test caller admits declaration events; replay reconstructs ledger without writable ledger API. |
| T164-A-003 | `routeContextConstraint` | Wire staged context routing to a public `abg.requirements.*` query path. | Runtime/query caller routes context for a real frame/span. |
| T164-A-004 | `buildEdgeRequirementEnvironment` | Wire edge environment projection to a public query path. | Query returns active terms, context, topology, prior folds, and residual pressure for a real run/frame/vector/span. |
| T164-A-005 | `projectRequirements`, `projectMaterializationTargets`, `projectExecutionSchedules` | Wire obligation, materialization-target, execution-schedule, and evidence-expectation projections. | Query returns obligations, targets, schedule rows, command/capability refs, and expected evidence roles from admitted inputs. |
| T164-A-006 | `bindRequirementEvidence`, `RequirementEvidenceBinding` | Remove/guard boolean-only admission and consume admitted runtime evidence event refs. | Tests reject `admitted: true` without an admitted evidence event ref; non-test caller emits a binding. |
| T164-A-007 | `foldRequirementEvidence`, `RequirementFoldProjection` | Wire fold to real ABG assurance closure decision refs produced on the traversal path. | Fold event is emitted when a real edge closes; forged/manual truth refs fail. |
| T164-A-008 | `projectAssuranceCase`, `RequirementAssuranceClaim` | Wire assurance-case projection and fix empty fold semantics. | Empty fold projects `no_evidence`, distinct from `blocked`. |
| T164-A-009 | `residualizeRequirementFolds`, `classifyRequirementAttenuation`, `RequirementResidualProjection` | Wire residual and attenuation to replay/query over runtime-emitted fold/residual events. | Residual carries source fold refs; attenuation is keyed by residual identity. |
| T164-A-010 | existing ABG process actor, payload/evidence admission, assurance closure, continuation, graph-span re-entry, public start, result envelope | Reuse existing generic ABG endpoints as route inputs; do not redesign them. | Integration proof links requirements route refs to existing endpoint refs without downstream wrappers. |

### B. Build New First-Route Gaps

These are the genuine new pieces for route 1.

| ID | New capability | Work | Closure gate |
| --- | --- | --- | --- |
| T164-B-001 | `admit_declarations` | Admit `GtlRequirementsAlgebraDeclarationBundle` into ABG requirement event payloads and replay ledger truth. | Non-test caller turns GTL declarations into admitted requirement terms, relations, spans, context refs, topology refs, and evidence-policy refs. |
| T164-B-002 | evidence event to requirement binding bridge | Consume `EvidenceAdmittedRuntimeEvent` or equivalent admitted runtime evidence into `RequirementEvidenceBinding`. | Binding cannot be constructed from booleans, path shape, or local strings. |
| T164-B-003 | assurance closure to requirement fold bridge | Emit requirement-fold event from the real runtime `AssuranceClosureDecision` as edges close. | Fold/residual downstream proof is event-sourced on the traversal path, not query-lazy. |
| T164-B-004 | `RequirementLifecycleDisposition` query projection | Join `RequirementResidualProjection` and existing ABG continuation/re-entry carriers into a named disposition projection. | Disposition is read-only replay/query truth and does not introduce a second controller or closure enum. |
| T164-B-005 | `project_lifecycle_state` | Publish the joined downstream read model over environment, obligations, evidence binding, fold, residual, attenuation, disposition, and source refs. | Public query is read-only, replay-derived, and sufficient for odd_glc view/query assets. |
| T164-B-006 | `GtlRequirementsLifecycleComposition` | Publish the optional GTL composition declaration over the public `abg.requirements.*` route. | `typecheckGtlProgram` or equivalent accepts the composition without product-local function republishing. |

### C. Defer From Route 1

| Deferred item | Reason |
| --- | --- |
| `derive_requirement_graph` | Multi-requirement decomposition and KAOS-style derivation are not required by the first steel-thread route. |
| `refine_goal` | Goal refinement is valuable follow-on substrate, but it is not needed for a single-requirement downstream lifecycle trace. |

Deferred items must be marked non-ready for route 1. They shall not block
T-164 closure unless later design reprices the first route to depend on them.

## Public Route Shape

The public route is a facade over existing T-162 symbols plus the six route-1
gaps. It is not a new carrier catalog and not a second function catalog.

| Namespace | Purpose |
| --- | --- |
| `gtl.requirements` | Public facade for existing GTL requirement declaration symbols and the route-1 lifecycle composition declaration. |
| `abg.requirements` | Public facade for existing ABG requirement symbols and route-1 bridge/query functions. |
| `abg.requirements.events` | Requirement event payloads and event constructors, including the new route-1 admission/fold/residual/disposition events. |
| `abg.requirements.queries` | Read-only query entry points for context, environment, evidence, fold, residual, disposition, and joined lifecycle state. |
| `abg.requirements.proof` | Non-forgeability guards and proof helpers. |

Exact package spellings may be refined by design, but downstream products must
not import deep internal files such as `contracts/requirements_algebra.ts`.
Route names must reconcile to existing symbols unless the row is one of the six
new route-1 gaps.

## Existing Symbol Reconciliation

The design must include this 1:1 reconciliation and may only change a public
name when it records the exact existing symbol it wraps.

| Public facade | Existing symbol or route-1 status | Classification |
| --- | --- | --- |
| `gtl.requirements.declare` | `GtlRequirementDeclaration`, `constructGtlRequirementDeclaration`, `GtlRequirementsAlgebraDeclarationBundle` | wire existing |
| `gtl.requirements.lifecycle_composition` | `GtlRequirementsLifecycleComposition` | build new |
| `abg.requirements.admit_declarations` | admission from GTL bundle to `RequirementEventPayload` / `projectRequirementLedger` | build new |
| `abg.requirements.route_context_constraint` | `routeContextConstraint` | wire existing |
| `abg.requirements.compile_edge_environment` | `buildEdgeRequirementEnvironment` | wire existing |
| `abg.requirements.project_edge_obligations` | `projectRequirements` | wire existing |
| `abg.requirements.project_materialization_targets` | `projectMaterializationTargets` | wire existing |
| `abg.requirements.project_execution_schedules` | `projectExecutionSchedules` | wire existing |
| `abg.requirements.bind_execution_evidence` | bridge from admitted runtime evidence to binding input | build new |
| `abg.requirements.bind_evidence` | `bindRequirementEvidence` | wire existing |
| `abg.requirements.fold_requirement_state` | `foldRequirementEvidence` plus runtime assurance bridge | wire existing plus bridge |
| `abg.requirements.project_assurance_case` | `projectAssuranceCase` | wire existing |
| `abg.requirements.project_residuals` | `residualizeRequirementFolds` | wire existing |
| `abg.requirements.classify_attenuation` | `classifyRequirementAttenuation` | wire existing |
| `abg.requirements.resolve_reentry_disposition` | `RequirementLifecycleDisposition` query projection over existing continuation/re-entry truth | build new |
| `abg.requirements.project_lifecycle_state` | joined lifecycle read model | build new |
| `abg.requirements.derive_requirement_graph` | no route-1 symbol | deferred |
| `abg.requirements.refine_goal` | no route-1 symbol | deferred |

No function may be classified `ready` if it is placeholder-only, test-only,
unwired from runtime/replay/query, query-lazy for emitted truth, forgeable, or
unpinned.

## Runtime Event Gate

Route readiness requires event emission on the real traversal path.

The following must be admitted event/projection truth produced during real
execution or real edge closure:

- requirement declarations admitted;
- runtime evidence admitted;
- requirement evidence bound;
- requirement fold projected from assurance closure truth;
- requirement residual projected from fold truth;
- requirement disposition projected from residual plus continuation/re-entry
  truth.

Queries may render and join these facts. Queries may not be the first place
where fold, residual, or disposition truth is invented.

## Carrier And Event Contract Set

The design must disambiguate these carriers and event roles:

| Surface | Contract |
| --- | --- |
| `GtlRequirementDeclaration` | Authoring declaration; preserves ids, term kind, source refs, evidence policy refs, destination refs, and graph/vector/span refs. |
| `GtlRequirementsLifecycleComposition` | Optional GTL composition declaration over ABG system functions; not a product-native graph-function catalog. |
| `RequirementLedger` | Replay-derived read model over admitted requirement events; never writable peer ledger. |
| `EdgeRequirementEnvironment` | Active pressure package for an edge/frame/span. |
| `RequirementProjection` | Obligation/materialization/execution/evidence expectation projection. |
| `RequirementEvidenceBinding` | Binding over admitted runtime evidence events; never boolean-only evidence. |
| `RequirementFoldProjection` | Requirement-scoped fold projection over ABG assurance closure truth; not a closure enum. |
| `RequirementResidualProjection` | Preserved pressure read model with source fold refs; not a retry/re-entry controller. |
| `RequirementAssuranceClaim` | Query/read model over fold/residual/assurance truth. |
| `RequirementLifecycleDisposition` | Named joined query projection over residual/fold and existing ABG continuation/re-entry truth; not a writable carrier. |

Required event/query roles:

- requirement declaration admitted;
- requirement context fragment admitted;
- destination topology admitted;
- edge requirement environment projected;
- requirement obligation projected;
- requirement evidence bound;
- requirement fold projected;
- requirement residual projected;
- requirement disposition projected.

## Slice Plan

1. Requirements audit and public-route law.
2. Design reframe for downstream readiness, including IACS update and no-shadow
   carrier review.
3. Public exports and route skeleton.
4. GTL declaration admission and replay ledger wiring.
5. Environment, topology, obligation, materialization, and schedule queries.
6. Runtime evidence bridge and requirement evidence binding.
7. Assurance closure bridge, fold, assurance case, residual, and attenuation.
8. Residual-to-continuation/re-entry disposition and joined lifecycle read
   model.
9. Non-forgeability and negative regression proof.
10. Live or installed end-to-end proof and explicit source/RC pinning.
11. Downstream migration guidance for odd_sdlc-style local carriers.

## Execution Plan

1. Open the T-164 active GOALS wave and confirm route-1 scope: wire/pin
   existing T-162 symbols, build the six route-1 gaps, and defer
   `derive_requirement_graph` / `refine_goal`.
2. Audit GTL/ABG requirement authority for every T-164 A/B/C work item. Add
   missing requirement law for public route readiness, runtime-event emission,
   downstream-public visibility, branded admitted refs, replay-ledger
   resolution, no GTL-to-ABG runtime import, and F_P/F_D/F_H authority split.
3. Lock the route interface design around
   `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`: downstream-public
   declaration/query surfaces, ABG-runtime-internal admission/projection
   commands, proof-only guards, nominal refs, and mandatory digest resolution.
4. Reframe the M03 design and IACS for T-164: existing-symbol reconciliation,
   no rename/redeclare, no-shadow carrier review, event topology for
   fold/residual/disposition on the traversal path, and prime-law justification
   for any new module directories.
5. Add stable public facades: `gtl.requirements.*` for declarations and
   composition refs only; `abg.requirements.*` for read-only downstream queries
   and internal runtime commands. Preserve the rule that `gtl/m01` must not
   import `abg/m03`.
6. Wire non-test runtime/query callers for existing symbols:
   `routeContextConstraint`, `buildEdgeRequirementEnvironment`,
   `projectRequirements`, `projectMaterializationTargets`,
   `projectExecutionSchedules`, `bindRequirementEvidence`,
   `foldRequirementEvidence`, `projectAssuranceCase`,
   `residualizeRequirementFolds`, and `classifyRequirementAttenuation`.
7. Build the six route-1 gaps: `admit_declarations`, evidence-event to
   requirement-binding bridge, assurance-closure to requirement-fold bridge,
   `RequirementLifecycleDisposition` query projection,
   `project_lifecycle_state`, and `GtlRequirementsLifecycleComposition`.
8. Wire the runtime event path so the runner/admission path emits requirement
   declaration admitted, runtime evidence admitted, requirement evidence bound,
   requirement fold projected, requirement residual projected, and requirement
   disposition projected truth. Queries only replay and join these facts.
9. Add proof for no downstream-public emitters, forged structural refs, digest
   mismatch, boolean evidence admission, manual truth refs, query-lazy
   fold/residual/disposition, F_D semantic inference, installed non-live route
   proof, and live proof or explicit STDO live defer.
10. Publish public API docs and odd_sdlc migration guidance: no peer ledgers, no
    `glc.*` generic function republishing, and odd_sdlc local carriers map to
    GTL/ABG route capabilities rather than odd_glc copies.

## Acceptance Checklist

- [x] Requirements audit maps every T164 work item to existing AC, new AC, or
      intentionally deferred scope.
- [x] GOALS.md is repriced or this ticket records why implementation proceeds
      under an already-open active work wave.
- [x] Design includes the existing-symbol reconciliation table and does not
      rename/redeclare existing T-162 symbols as new carriers or functions.
- [x] Route interface design defines one consistent library-style pattern for
      declaration, admission command, projection command, query, and guard
      APIs.
- [x] Route interface design enforces visibility: downstream-public surfaces
      are GTL declarations and read-only queries; admission and projection
      commands are ABG-runtime-internal.
- [x] `AdmittedRef` or equivalent admitted refs are nominally branded and every
      command boundary resolves them against the replay event/projection ledger
      with digest recomputation.
- [x] Design names prime, subordinate, and deferred carriers and passes Design
      Module Method review.
- [x] Design justifies any new `abg/m03/projection/` or `abg/m03/queries/`
      module directory as a structurally-prime boundary, not a convenience
      split.
- [x] Design states `RequirementLifecycleDisposition` as a named query
      projection over existing ABG continuation/re-entry carriers, not a
      writable carrier.
- [x] `gtl.requirements` and `GtlRequirementsLifecycleComposition` introduce no
      GTL-to-ABG runtime code dependency; they carry only published refs,
      contract refs, or symbolic route bindings.
- [x] Design marks `derive_requirement_graph` and `refine_goal` deferred for
      route 1 unless a later requirement reprice makes them critical path.
- [x] Public `gtl.requirements` and `abg.requirements` route names are ratified
      or explicitly replaced with stable equivalent names.
- [x] Current consumed substrate identity is explicit: abiogenesis git
      `271a6d4`, package `4.1.0-rc.11`, or a later recorded replacement.
- [x] Every ready route has a non-test runtime/query caller.
- [x] Evidence binding consumes admitted runtime evidence event refs.
- [x] Requirement fold consumes real ABG assurance closure decision refs.
- [x] Requirement fold, residual, and disposition truth is emitted on the real
      traversal path when edges close; queries only replay/join it.
- [x] No downstream-public API can construct requirement fold, residual, or
      disposition truth.
- [x] Residuals and dispositions are replay/query visible and carry source
      fold/residual/continuation refs.
- [x] Disposition-affecting policy inputs are admitted refs or F_H decision
      refs, not free strings.
- [x] Empty assurance-case projection returns `no_evidence`, distinct from
      `blocked`.
- [x] Negative tests reject forged refs, boolean-only admission, manual
      truth-ref injection, stale predecessor-only closure, and compatibility
      aliases.
- [x] Live or installed proof runs the full route without downstream local
      ledgers.
- [x] Public docs state the genericity test, no peer-ledger rule, and no
      downstream republishing of generic system functions.
- [x] odd_sdlc local carrier replacement guidance is posted.
- [x] `git diff --check` passes.

### Implementation Progress

- 2026-06-28: First code slice added the package facades
  `./gtl/requirements` and `./abg/requirements`; removed the
  `requirements_algebra` `export *` side-door from the public M03 barrel; added
  internal `AdmittedRef`, `RuntimeScopeRef`, replay/digest resolution, and
  `admitDeclarations`; added `GtlRequirementsLifecycleComposition`; changed
  empty assurance-case status to `no_evidence`; and added T-164 negative proof
  for public visibility and forged refs.
- 2026-06-28: Added package-subpath export regression proof for `.`,
  `./abg/m03`, `./abg/requirements`, and `./gtl/requirements`. Added internal
  `bindExecutionEvidence` and `projectRequirementFoldFromAssuranceClosure`
  bridges. They consume admitted runtime evidence refs and real
  `AssuranceClosureDecision` refs through replay/digest resolution and emit
  requirement evidence/fold payloads. At this point the runner edge-close hook
  still remained open because the runner did not yet carry requirement
  ledger/environment input needed to emit route facts on the traversal path.
- 2026-06-28: Added runner edge-close emission for requirement evidence,
  requirement fold, residual projection, and lifecycle disposition projection
  facts from the real traversal path. Added `RequirementLifecycleDisposition`
  as an internal read-only replay projection over admitted residual,
  continuation/re-entry, and policy refs; exposed only the public
  `abg.requirements.projectLifecycleState` read query. Added tests proving no
  public package surface exposes route emitters or the disposition resolver,
  structural policy refs are rejected, lifecycle state replays admitted
  disposition refs, and runner output carries a closed disposition replay fact.
  A later review found this was not yet sufficient: the route facts were
  returned through a result side-channel, not emitted into the append-only
  runtime event stream, and the runner proof still injected a prebuilt
  `RequirementRouteRuntimeContext`.
- 2026-06-28: Updated `docs/USER_GUIDE.md` and
  `docs/LLM_GTL_APP_BUILDER_GUIDE.md` with the requirements-route genericity
  test, public `gtl.requirements` / `abg.requirements` split, no peer-ledger
  rule, and no downstream republishing of generic system functions. Posted
  `.ai-workspace/comments/codex/20260628T124437Z_T164_odd_sdlc_requirements_route_migration_guidance.md`
  as the odd_sdlc local-carrier replacement handoff.
- 2026-06-28: Confirmed the design pack names retained T-162 prime carriers,
  T-164 route additions, subordinate/proof-only refs, deferred
  `derive_requirement_graph` / `refine_goal`, and module-boundary prime tests.
  Negative proof is covered by T-162/T-164 tests for forged/digest refs,
  structural admitted refs, manual assurance truth, public boolean evidence
  emission side doors, stale predecessor pressure, and compatibility aliases.
- 2026-06-28: Converted the focused T-164 proof to consume public downstream
  APIs through package exports (`@abiogenesis/typescript-tenant`,
  `@abiogenesis/typescript-tenant/abg/m03`,
  `@abiogenesis/typescript-tenant/abg/requirements`, and
  `@abiogenesis/typescript-tenant/gtl/requirements`). `npm run test:t164`
  now serves as the installed non-live route proof: it drives GTL declaration,
  ABG public query facades, internal admission/projection commands, the real
  runner edge-close hook, requirement evidence/fold/residual/disposition replay
  facts, and negative public-export checks without downstream local ledgers.
  T-164 has no separate live script in `package.json`; live proof remains
  deferred to a future operator-enabled route proof rather than blocking this
  installed non-live proof.
- 2026-06-28: Closed the runtime-event-gate review gap. Added
  `RequirementRouteFactProjectedRuntimeEvent` and admission validation, routed
  declaration/projection/evidence/fold/residual/disposition requirement facts
  through the runner `emit()` path into `emittedEvents`, `replayEvents`, and
  the configured sink, and removed the public iterate-result side-channel for
  requirement route facts. Removed the public runner request path for
  caller-supplied `RequirementRouteRuntimeContext`. Added declaration-bundle
  activation on `EngineIterateRequest`: a normal traversal now accepts authored
  GTL requirements declarations, ABG admits them, derives requirement
  projection refs, emits startup admission route facts, and then emits
  edge-close route facts. Disposition now joins an admitted ABG
  `RuntimeContinuationTransitionProjection` ref from the real close path
  instead of collapsing over empty continuation/re-entry inputs.

## Non-Closure Conditions

- The route closes by wrappers around pure functions without runtime/query
  callers.
- Existing T-162 symbols are renamed or redeclared as new carriers/functions
  instead of wired and exported.
- A downstream-public API exposes admission/projection commands that can emit
  requirement fold, residual, or disposition truth.
- Admitted refs are structurally forgeable by downstream code, or command
  boundaries trust carried ref/digest fields without replay-ledger resolution
  and digest recomputation.
- `gtl/m01` imports `abg/m03` runtime code, or the `gtl.requirements` facade /
  `GtlRequirementsLifecycleComposition` depends on ABG implementation modules
  instead of published refs, contract refs, or symbolic route bindings.
- New `abg/m03/projection/` or `abg/m03/queries/` module directories are added
  as convenience splits without Design Module Method / IACS prime-law
  justification.
- Synthetic tests are the only proof of readiness.
- A function is marked ready while placeholder-only, test-only, unwired,
  query-lazy for emitted truth, forgeable, or unpinned.
- Evidence binding accepts `admitted: true` without admitted runtime evidence
  event refs.
- Requirement folds accept manual `sourceAbgTruthRefs` or local strings as
  assurance truth.
- Fold, residual, or disposition truth is first invented by a query instead of
  emitted as admitted runtime/projection events on the traversal path.
- Disposition-affecting policy refs are accepted as free strings.
- Residuals are computed without source fold refs.
- Requirement disposition selects next action through a product-local router.
- `RequirementLifecycleDisposition` is implemented as a writable carrier or
  controller instead of a named query projection.
- `derive_requirement_graph` or `refine_goal` blocks route-1 closure without a
  later requirement reprice.
- A downstream-specific `glc.*`, `sdlc.*`, or other product namespace becomes
  the generic function owner.
- A native downstream carrier shadows an existing GTL/ABG carrier.
- odd_glc or odd_sdlc tests are used as ABIogenesis closure proof without ABG
  runtime/query proof.
- Release pinning remains only implicit source checkout discovery.
- Compatibility with old local peer ledgers is used as a reason to keep them as
  closure authority.

## Proof Commands

Required proof commands are refined to the installed non-live route proof
because T-164 publishes no separate `test:t164:live` script. Closure must
include at least:

```bash
cd build_tenants/abiogenesis/typescript && npm run build:semantic
cd build_tenants/abiogenesis/typescript && npm run test:t162
cd build_tenants/abiogenesis/typescript && npm run test:t164
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
git diff --check
```

`npm run test:t164` is the installed non-live proof for this slice. It imports
the downstream-public package surfaces, uses internal commands only from the
test harness, drives the runner edge-close hook, and proves no downstream local
ledger or public emitter is required. Live proof is deferred to a future
operator-enabled route proof because there is no T-164 live script in this
package cut.

## odd_sdlc Migration Map

The audited odd_sdlc source at git `52d1962` proves that the middle is real
work, not an odd_glc invention. Its local carriers map to upstream ABIogenesis
capabilities:

| odd_sdlc local surface | Upstream replacement target |
| --- | --- |
| `SdlcRequirementClosureRegister` | `RequirementLedger`, `EdgeRequirementEnvironment`, fold/residual read models |
| `SdlcRequirementFulfillmentPublicProjection` | `abg.requirements.project_lifecycle_state` |
| `SdlcEdgeEvidenceAdmission` | `RequirementEvidenceBinding` over admitted runtime evidence events |
| `SdlcEdgeGain` / `SdlcEdgeObligationGain` | requirement obligation, materialization, schedule, and evidence-expectation projections |
| `SdlcEdgeResidualPressure` | `RequirementResidualProjection` and attenuation classification |
| `SdlcEdgeAssuranceCloseDecision` | requirement fold over ABG assurance closure truth |
| `SdlcEdgeFulfillmentLedger` | replay-derived requirement ledger and projection events |
| `SdlcEdgeClosureDecision` | ABG assurance/continuation transition plus requirement fold disposition |
| `SdlcNextActionProjection` | requirement lifecycle disposition joined with ABG continuation/re-entry truth |
| `observe_gap_pressure`, `classify_gap_triage`, `bind_gap_route` | ABG context routing, residual classification, and lawful re-entry projection with product policy overlays |

This map is not authorization to port SDLC carriers into ABIogenesis or
odd_glc. It is a deletion and replacement target for future downstream rebuild
work once T-164 is ready.

## Closure Evidence

Closed on 2026-06-28 under installed non-live proof.

Public route names:

- `gtl.requirements`
- `abg.requirements`

Changed authority/design surfaces:

- `specification/GOALS.md`
- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_FIRST_SLICE_IACS.md`

Proof run:

```bash
cd build_tenants/abiogenesis/typescript && npm run build:semantic
cd build_tenants/abiogenesis/typescript && npm run test:t162
cd build_tenants/abiogenesis/typescript && npm run test:t164
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
git diff --check
```

The runtime-event gate review gap was corrected before closure. The T-164
runner proof starts from a GTL requirement declaration bundle, derives ABG
route context internally, emits declaration/projection route facts at traversal
start, emits evidence/fold/residual/disposition route facts at edge close
through `emit()`, joins disposition over an ABG continuation transition
projection, and projects lifecycle state from `replayEvents`.

Downstream readiness classification for odd_glc: ready for route-1
requirements-algebra consumption through GTL declarations and ABG read-only
queries. `derive_requirement_graph` and `refine_goal` remain explicitly
non-ready/deferred for route 1.
