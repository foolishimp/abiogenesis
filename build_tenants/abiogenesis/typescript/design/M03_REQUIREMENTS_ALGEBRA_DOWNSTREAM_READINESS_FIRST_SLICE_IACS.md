# M03 Requirements Algebra Downstream Readiness First-Slice IACS

**Status**: Draft For T-164
**Date**: 2026-06-28
**Purpose**: Declare the irreducible carrier and interface set for route-1
downstream readiness.

## Source Authority

- `specification/GOALS.md` `GOAL-011`
- `REQ-L-GTL3-REQUIREMENTS-ALGEBRA`
- `REQ-R-ABG3-REQUIREMENTS-ALGEBRA`
- `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`
- `M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md`
- `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`

## IACS Position

The T-162 prime carrier set remains the requirements-algebra carrier
authority. T-164 adds route-readiness carriers and interface boundaries only
where T-162 did not need downstream-public consumption.

Do not promote a carrier merely because the route needs an API shape.

## Existing Prime Carriers Retained

| Carrier | T-164 status |
| --- | --- |
| `RequirementEventPayload` | retained; only write-side input to replay |
| `RequirementTerm` | retained |
| `RequirementRelation` | retained |
| `TraversalSpan` | retained |
| `EdgeRequirementEnvironment` | retained |
| `RequirementProjection` | retained |
| `RequirementEvidenceBinding` | retained; route input must be admitted evidence event refs |
| `RequirementFoldProjection` | retained; emitted on traversal path from assurance closure truth |
| `RequirementResidualProjection` | retained; emitted on traversal path from fold truth |
| `RequirementTestRelation` | retained as a compatibility-named generic proof-evidence relation, not as software-test policy |
| `RequirementAssuranceClaim` | retained; empty source is `no_evidence` |

## Route-1 Additions

| Carrier or interface | Classification | Reason |
| --- | --- | --- |
| `GtlRequirementsLifecycleComposition` | GTL declaration carrier | It binds published route refs without importing ABG runtime modules. |
| `PublishedRequirementRouteRef` | subordinate GTL declaration ref | It carries namespace, route, version, and contract ref. It is not runtime authority. |
| `AdmittedRef<Kind>` | route interface ref | It is nominal and resolved against replay before command use. It prevents structural forged refs. |
| `RuntimeScopeRef` | route interface ref | It is nominal runtime context provided by ABG, not caller-assembled strings. |
| `RequirementLifecycleDisposition` | named query projection | It joins residual/fold truth with existing continuation/re-entry truth. It is not writable. |
| `RequirementLifecycleStateReadModel` | joined read model | It is the downstream-public query result over replay-derived route truth. |
| `RouteResult<T>` | command/query result union | It makes typed rejection explicit and prevents implicit success. |

## Subordinate Or Non-Prime Interfaces

| Interface | Disposition |
| --- | --- |
| `RouteReplayFact` | subordinate replay fixture row; it is proof/query input and not an event store |
| `RequirementRouteRuntimeContext` | ABG-runtime-internal activation context; downstream callers do not supply it |
| `RequirementLifecycleStateReadModel` | downstream query output over replay; it does not emit or admit truth |
| `FpFindingRef` | subordinate admitted semantic ref; F_P owns meaning |
| `FhDecisionRef` | subordinate admitted decision ref; F_H owns decision |
| `FdProjectionContext` | subordinate context for deterministic projection |
| `PublishedRequirementRouteRef` | subordinate to GTL lifecycle composition |
| route guard helpers | proof-only; not route truth |

## Module Boundary Prime Tests

| Module boundary | Prime only if | Non-closure if |
| --- | --- | --- |
| `abg.requirements.events` | owns admitted event payload variants and event constructors | duplicates the event store or admits open payloads |
| `abg.requirements.admission` | owns ingress collapse, nominal ref minting, and typed rejection | wraps constructors without replay/digest enforcement |
| `abg.requirements.projection` | owns ABG-runtime-internal event-emitting projection commands | exposes downstream-public fold/residual/disposition emitters |
| `abg.requirements.queries` | owns read-only replay joins | invents fold/residual/disposition truth |
| `abg.requirements.proof` | owns negative guards and non-forgeability fixtures | emits production truth |
| `gtl.requirements` | owns declaration constructors and route refs only | imports `abg/m03` runtime code |

## Visibility Classification

| Surface | Visibility |
| --- | --- |
| GTL requirement declarations | downstream-public authoring |
| GTL lifecycle composition | downstream-public authoring |
| ABG context/environment/obligation/materialization/schedule/lifecycle queries | downstream-public read-only |
| declaration admission | ABG-runtime-internal |
| evidence binding | ABG-runtime-internal |
| fold projection | ABG-runtime-internal |
| residual projection | ABG-runtime-internal |
| disposition projection | ABG-runtime-internal |
| forged-ref/import/query-lazy guards | proof-only |

## Promotion Tests

A route interface may become a prime carrier only when:

- it owns identity not already carried by T-162 prime carriers;
- removing it causes fail-closed behavior rather than ergonomic inconvenience;
- it does not duplicate event, ledger, fold, residual, continuation, or re-entry
  authority;
- it has negative proof for structural forgery or shadow-carrier drift;
- it preserves the downstream-public vs ABG-runtime-internal visibility split.

## Non-Closure Conditions

- T-164 introduces a second `RequirementLedger`.
- T-164 promotes `RequirementLifecycleDisposition` to writable state or a
  controller.
- Downstream-public APIs can emit fold, residual, or disposition truth.
- Route refs are structurally forgeable or are trusted without replay/digest
  resolution.
- `gtl.requirements` imports `abg/m03` runtime code.
- A new module directory exists only as a convenience split.
- Query code is the first producer of fold, residual, or disposition truth.
