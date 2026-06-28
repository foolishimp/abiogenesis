# M03 Requirements Algebra Refinement First Slice IACS

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-168

## Intended

Ratify and prove same-frame multi-requirement refinement:

- GTL declares a parent requirement and two child requirements.
- GTL declares parent-to-child `refinement` relations.
- ABG admits the terms and relations as existing requirement event payloads.
- ABG projects an active edge environment that carries parent, child, and
  relation pressure.
- ABG emits child/leaf fold and residual truth on the traversal route.
- ABG projects aggregate parent state from child folds/residuals.

## Actual

Before this slice, route-1 admitted atomic requirements and relations but had
no ratified aggregate graph projection. Tests also hand-built relation
declarations where the GTL requirements facade should expose declaration
constructors.

## Comparison

The required change is not a new ontology. The existing carriers already hold
the graph:

| Need | Existing carrier |
| --- | --- |
| requirement node | `RequirementTerm` |
| parent/child edge | `RequirementRelation` |
| active route locus | `TraversalSpan` |
| replay graph | `RequirementLedger` |
| active edge view | `EdgeRequirementEnvironment` |
| leaf fold truth | `RequirementFoldProjection` |
| leaf residual truth | `RequirementResidualProjection` |

The gap is projection behavior and public declaration ergonomics, not carrier
identity.

## Sufficient

This slice is sufficient when:

- GTL exposes `declareRequirementRelation` with no ABG import.
- GTL bundle construction rejects dangling relation/span graph refs.
- ABG public queries expose requirement graph and aggregate state as read-only
  projections.
- A proof shows parent aggregate state is derived from child fold/residual
  truth.
- A negative proof shows the parent fold/residual is not emitted by a second
  writer.

## Carrier Promotion Test

No new prime carrier is promoted.

`RequirementGraphProjection` and `RequirementAggregateStateProjection` are
derived read models. They fail the promotion test as carrier authority because
they do not own admission, event truth, closure truth, continuation truth, or
runtime selection. Their role is query shape only.

Any future carrier for recursive span identity is out of scope for this slice
and belongs to T-169.

## Boundary Conditions

- F_D validates and projects graph structure. It does not infer semantic
  satisfaction.
- F_P and F_H decisions may enter only as admitted refs.
- Downstream consumers may declare and query. They may not emit or mint route
  truth.
- Same-frame span identity is used here; recursive span identity is deferred.
