# M03 Requirements Algebra Downstream Readiness Derivation

**Status**: Draft For T-164
**Date**: 2026-06-28
**Purpose**: Derive the route-1 downstream-consumable requirements-algebra
design from T-164 requirement law and interface design.

## Source Authority

- `specification/GOALS.md` `GOAL-011`
- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md`
- `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`
- `M03_REQUIREMENTS_ALGEBRA_DERIVATION.md`
- `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/active/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md`

## Re-Entry Decision

T-164 proceeds as `requirement_reprice -> design_reframe ->
realization_refactor`.

The product identity remains stable. ABIogenesis is the GTL/ABG product line.
T-164 changes the downstream-consumable route contract for the existing
requirements-algebra substrate.

## Position

T-164 is not a second requirements algebra.

The design reuses T-162 carriers and functions, then adds route readiness:

- stable declaration and query facades,
- ABG-runtime-internal admission/projection commands,
- nominal admitted refs and runtime scope refs,
- replay-ledger digest resolution,
- event emission on the real traversal path,
- downstream query-only consumption,
- explicit F_D/F_P/F_H authority separation.

## Existing-Symbol Reconciliation

| Route role | Existing symbol or route-1 gap | Decision |
| --- | --- | --- |
| GTL declaration | `GtlRequirementDeclaration`, `constructGtlRequirementDeclaration` | wire existing |
| GTL declaration bundle | `GtlRequirementsAlgebraDeclarationBundle`, `constructGtlRequirementsAlgebraDeclarationBundle` | wire existing |
| GTL lifecycle composition | `GtlRequirementsLifecycleComposition` | build route-1 declaration carrier |
| declaration admission | `RequirementEventPayload`, `projectRequirementLedger` | build route-1 admission command |
| context route | `routeContextConstraint` | wire existing query |
| edge environment | `buildEdgeRequirementEnvironment` | wire existing query |
| obligations | `projectRequirements` | wire existing query/projection facade |
| materialization targets | `projectMaterializationTargets` | wire existing query/projection facade |
| execution schedules | `projectExecutionSchedules` | wire existing query/projection facade |
| evidence event bridge | admitted runtime evidence event -> `RequirementEvidenceBinding` | build route-1 admission bridge |
| evidence binding | `bindRequirementEvidence` | wire existing internal command |
| requirement fold | `foldRequirementEvidence` + admitted `AssuranceClosureDecision` | wire existing transform behind internal projection command |
| assurance case | `projectAssuranceCase` | wire existing query and fix empty fold as `no_evidence` |
| residuals | `residualizeRequirementFolds` | wire existing internal projection command |
| attenuation | `classifyRequirementAttenuation` | wire existing query |
| disposition | `RequirementLifecycleDisposition` query projection | build route-1 projection over existing continuation/re-entry truth |
| lifecycle state | `project_lifecycle_state` | build route-1 joined read model |
| requirement graph derivation | none for route 1 | deferred |
| goal refinement | none for route 1 | deferred |

## Visibility Model

| Visibility | Includes | Excludes |
| --- | --- | --- |
| downstream-public authoring | `gtl.requirements` declaration constructors and lifecycle composition refs | ABG runtime modules, event emission, evidence binding, folds, residuals |
| downstream-public read-only | `abg.requirements` queries and joined lifecycle state | admission/projection commands, fold/residual/disposition emitters |
| ABG-runtime-internal | declaration admission, evidence binding, fold projection, residual projection, disposition projection | direct downstream calls |
| proof-only | guards for forged refs, import seams, query-lazy construction, boolean evidence | production truth emission |

## Runtime Event Topology

The route is ready only when these facts are emitted on the real runtime path:

```text
GTL declarations
  -> requirement_declaration_admitted
  -> replay RequirementLedger
  -> EdgeRequirementEnvironment query
  -> RequirementProjection query/projection rows
  -> runtime evidence admitted by existing ABG payload/evidence path
  -> requirement_evidence_bound
  -> assurance closure decision from existing ABG assurance path
  -> requirement_fold_projected
  -> requirement_residual_projected
  -> requirement_disposition_projected
  -> project_lifecycle_state query
```

Queries may join and render those facts. Queries may not create fold,
residual, or disposition truth.

## F_D / F_P / F_H Boundary

F_D owns:

- schema/ref/span/duplicate/dangling validation,
- event envelope admission and typed rejection,
- replay-ledger projection,
- deterministic joins over admitted refs,
- digest verification,
- fail-closed guards.

F_P owns:

- semantic requirement interpretation,
- semantic evidence satisfaction,
- ambiguous residual meaning,
- semantic next-action recommendations.

F_H owns:

- product-owner decisions,
- explicit reprice or risk decisions,
- policy decisions that are admitted as F_H decision refs.

F_D may consume admitted F_P/F_H refs. It shall not reconstruct their semantic
judgment.

## Module Boundary Decisions

T-164 may introduce internal module directories only if the IACS proves their
prime boundary:

- `admission` owns ingress collapse and typed rejection.
- `projection` owns deterministic event-emitting projection commands.
- `queries` owns read-only replay joins.
- `proof` owns negative guards.

No new module directory is justified by file organization alone.

## Downstream Consumer Contract

Downstream consumers may:

- declare requirement inputs through GTL;
- declare a lifecycle composition by published refs;
- query lifecycle state;
- label, rank, and interpret read models as downstream policy overlays.

Downstream consumers shall not:

- emit requirement events,
- bind requirement evidence,
- project requirement folds,
- project residuals,
- project lifecycle disposition,
- own a second closure enum,
- own a next-action controller,
- republish generic system functions under product-local names.

## Route-1 Deferred Scope

The first route excludes:

- `derive_requirement_graph`,
- `refine_goal`,
- KAOS/ReqIF/GSN/GRL editor/import surfaces,
- odd_sdlc local ledger deletion,
- odd_glc implementation.

These may be successor work after route-1 readiness.
