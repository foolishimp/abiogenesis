# M03 Requirements Algebra Refinement Derivation

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-168

## Source Authority

- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`
- `.ai-workspace/tickets/active/T-168-ratify-gtl-requirement-graph-and-abg-refinement-route.md`
- `.ai-workspace/tickets/active/T-169-ratify-requirement-span-identity-across-recursion.md`

## Design Claim

T-168 realizes route-2 requirement graph/refinement without introducing a
parallel requirement graph ontology.

GTL declares requirement graph structure as existing requirement terms plus
typed requirement relations. ABG admits those declarations into the existing
requirement event stream, projects active parent/child pressure into the edge
environment, and exposes read-only graph and aggregate-state queries.

ABG does not infer semantic satisfaction from graph shape. Child folds remain
the emitted fold truth. Parent state is a deterministic read projection over
admitted child folds and residuals.

## Slice Boundary

This slice is same-frame and same-graph-function.

Cross-frame, zoomed, recursive, or foldback span identity remains governed by
T-169. T-168 may preserve existing span refs and relation refs, but it shall not
claim recursive span identity closure.

## Existing Carrier Reuse

The route reuses these existing carriers:

- `GtlRequirementDeclaration`
- `GtlRequirementRelationDeclaration`
- `GtlTraversalSpanDeclaration`
- `RequirementTerm`
- `RequirementRelation`
- `RequirementLedger`
- `EdgeRequirementEnvironment`
- `RequirementProjection`
- `RequirementFoldProjection`
- `RequirementResidualProjection`

The only new shapes are read-only projections over those carriers:

- `RequirementGraphProjection`
- `RequirementAggregateStateProjection`

They are not admitted event payloads, writable ledgers, fold emitters,
residual emitters, continuation controllers, or graph-function catalogs.

## Function Placement

| Surface | Function | Authority | Visibility |
| --- | --- | --- | --- |
| GTL requirements facade | declare requirement relation | declaration-only | downstream-public |
| GTL bundle constructor | validate graph refs | declaration conformance | downstream-public |
| ABG requirements query | project requirement graph | replay-derived query | downstream-public |
| ABG requirements query | project aggregate state | replay-derived query | downstream-public |
| ABG runtime route | fold leaf requirements | runtime-internal projection command | internal |

## Aggregate Rule

A requirement with outgoing active `refinement` relations to other active
requirements is an aggregate parent for this slice.

For aggregate parents:

- leaf obligations are projected for the child requirements;
- emitted fold/residual truth is produced for the child requirements;
- aggregate parent state is projected from child folds and child residuals;
- no parent fold event or parent residual event is emitted by a second writer.

Aggregate precedence is deterministic: `blocked`, then `repriced`, then
`partial`, then `deferred`, then `no_close_preserved`, then `satisfied`.
An aggregate with no child fold truth projects `no_evidence`.

## Non-Goals

- No KAOS/ReqIF/GSN/GRL carrier kernel.
- No product-local compiler from downstream requirement syntax.
- No recursive span identity claim before T-169.
- No downstream-public admission, evidence binding, fold, residual, or
  disposition emitters.
