# M03 Requirements Algebra Route Requirements Audit

**Status**: Draft For T-164
**Date**: 2026-06-28
**Purpose**: Map the T-164 route work to live GTL/ABG requirement authority
before implementation.

## Source Authority

- `specification/GOALS.md` `GOAL-011`
- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`
- `.ai-workspace/tickets/active/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md`

## Audit Position

T-164 does not need a new requirements ontology. It needs explicit downstream
route readiness law over the existing T-162 requirements-algebra substrate.

The missing law is about:

- public route visibility,
- existing-symbol reconciliation,
- GTL declaration refs without ABG runtime imports,
- ABG-runtime-internal event-emitting commands,
- downstream-public query-only consumption,
- nominal admitted refs and replay digest resolution,
- F_D/F_P/F_H authority separation,
- event emission on the traversal path.

## Requirement Additions Required

| Area | Current authority | Gap | Required addition |
| --- | --- | --- | --- |
| GTL declaration wrappers | `REQ-L-GTL3-REQUIREMENTS-ALGEBRA-001` through `009` | GTL route refs and lifecycle composition are not explicit enough to prevent `gtl/m01` importing `abg/m03`. | Add GTL ACs requiring published refs/contract refs only, no ABG runtime import, and pure declaration-only facades. |
| ABG event/replay substrate | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-001` through `002` | Downstream route visibility and runtime-command ownership are not explicit. | Add ABG ACs splitting downstream-public declaration/query surfaces from ABG-runtime-internal admission/projection commands. |
| Existing-symbol reconciliation | T-162 design and code, not explicit requirement law | A facade could rename/redeclare T-162 carriers into a shadow catalog. | Add ABG AC requiring 1:1 reconciliation to existing symbols or route-1 new gaps. |
| Admitted refs | Existing event/projection law and T-162 non-forgeability tests | Public interface could accept structurally forged refs. | Add ABG AC requiring nominal admitted refs plus replay-ledger resolution and digest recomputation. |
| Evidence binding | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-014` through `016` | Boolean admission and path-shape evidence must be explicitly rejected at public route boundaries. | Add ABG AC requiring admitted runtime evidence event refs and rejecting booleans/path-shape closure. |
| Fold/residual/disposition | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-019` through `022` | Query-only fold/residual/disposition would still be possible unless event emission is required on the traversal path. | Add ABG AC requiring runner/admission path emission and query-only replay/join. |
| F_D/F_P/F_H boundary | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-023` through `026` | Existing F_D totality does not name the route API authority split. | Add ABG ACs stating F_D may only validate/project admitted refs and F_P/F_H semantic findings must be admitted refs. |
| Lifecycle disposition | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-020` and continuation requirements | `RequirementLifecycleDisposition` could become a writable controller. | Add ABG AC requiring a named query projection over existing continuation/re-entry truth. |
| Empty assurance case | `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-022` | Empty fold can be misread as `blocked`. | Add ABG AC requiring `no_evidence`, distinct from `blocked`. |

## T-164 Work Item Mapping

### A. Wire And Pin Existing Symbols

| Work item | Existing authority | New authority needed |
| --- | --- | --- |
| T164-A-001 GTL declaration facade | GTL AC `001` through `009` | New GTL ACs for ref-only route composition and no ABG runtime import. |
| T164-A-002 `RequirementLedger` / `projectRequirementLedger` | ABG AC `001`, `002`, `003` | New ABG public route visibility and admitted-ref resolution ACs. |
| T164-A-003 `routeContextConstraint` | ABG AC `005`, `009`, `028` | New downstream query-only visibility AC. |
| T164-A-004 `buildEdgeRequirementEnvironment` | ABG AC `009`, `010`, `028` | New downstream query-only visibility AC. |
| T164-A-005 projections | ABG AC `011`, `012`, `013`, `028` | New existing-symbol reconciliation and non-test caller readiness AC. |
| T164-A-006 `bindRequirementEvidence` | ABG AC `014`, `015`, `016`, `017`, `018` | New admitted runtime evidence event ref and no boolean/path-shape closure AC. |
| T164-A-007 `foldRequirementEvidence` | ABG AC `019`, `023`, `024` | New assurance closure ref, event-emitted fold, and no manual truth-ref AC. |
| T164-A-008 `projectAssuranceCase` | ABG AC `022` | New `no_evidence` empty-fold AC. |
| T164-A-009 residual/attenuation | ABG AC `020`, `021`, `028` | New runtime-emitted residual and query replay AC. |
| T164-A-010 existing ABG endpoints | Assurance, payload, continuation, projection requirements | New route-bridge ACs only; do not redesign endpoints. |

### B. Build New Route-1 Gaps

| Work item | Existing authority | New authority needed |
| --- | --- | --- |
| T164-B-001 `admit_declarations` | GTL AC `001` through `009`; ABG AC `001` through `003` | New GTL ref-only facade ACs and ABG route admission/visibility ACs. |
| T164-B-002 evidence-event bridge | ABG AC `014` through `018`; payload/evidence requirements | New admitted runtime evidence event ref AC. |
| T164-B-003 assurance-closure bridge | ABG AC `019`; assurance requirements | New event-emitted fold and assurance closure ref AC. |
| T164-B-004 `RequirementLifecycleDisposition` | ABG AC `020`, `021`; continuation requirements | New named query projection AC, not writable carrier/controller. |
| T164-B-005 `project_lifecycle_state` | ABG AC `028` | New downstream-public read-only joined query AC. |
| T164-B-006 `GtlRequirementsLifecycleComposition` | GTL AC `001`, `003`, `009` | New pure ref-based lifecycle composition AC. |

### C. Deferred Route-1 Items

| Deferred item | Existing authority | Required status |
| --- | --- | --- |
| `derive_requirement_graph` | ABG subordinate/deferred KAOS and relation law | Mark non-ready/deferred for route 1 unless later requirement reprice promotes it. |
| `refine_goal` | GTL/ABG refinement relation law | Mark non-ready/deferred for route 1 unless later requirement reprice promotes it. |

## Audit Outcome

T-164 may proceed to requirements edits. The edits should be narrow:

- add GTL route-composition/ref-only ACs after
  `REQ-L-GTL3-REQUIREMENTS-ALGEBRA-009`;
- add ABG downstream-route readiness ACs after
  `REQ-R-ABG3-REQUIREMENTS-ALGEBRA-030`;
- leave T-162 carrier ontology intact.
