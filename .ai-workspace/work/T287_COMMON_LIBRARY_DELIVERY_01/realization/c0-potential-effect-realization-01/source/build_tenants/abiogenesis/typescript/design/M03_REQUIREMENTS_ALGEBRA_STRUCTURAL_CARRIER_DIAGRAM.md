# M03 Requirements Algebra Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-26
**Purpose**: Preserve carrier roles, containment, and projection flow for T-162.

```text
GTL Module / GraphFunction / GraphVector / Context declarations
  -> RequirementEventPayload
       - requirement_term_admitted
       - requirement_relation_admitted
       - traversal_span_admitted
       - context_fragment_admitted
       - destination_topology_admitted
       - requirement_projection_admitted
       - requirement_evidence_bound
       - requirement_fold_projected
       - requirement_residual_projected
  -> replay
  -> RequirementLedger (projection)
       contains RequirementTerm[*]
       contains RequirementRelation[*]
       contains TraversalSpan[*]
       contains subordinate context/topology/test/schedule rows
  -> EdgeRequirementEnvironment
       activeTerms[*]
       activeSpans[*]
       activeContextFragments[*]
       priorFoldProjections[*]
       carriedResidualProjections[*]
  -> RequirementProjection[*]
       obligation | materialization_target | execution_schedule | evidence_expectation
  -> RequirementEvidenceBinding[*]
       admitted | rejected | non_closing
  -> RequirementFoldProjection[*]
       satisfied | partial | blocked | deferred | repriced | no_close_preserved
  -> RequirementResidualProjection[*]
       remainingSpan + pressureClass + ownerSurface
  -> RequirementAssuranceClaim[*]
  -> RequirementQueryReadModel
```

## Authority Roles

| Shape | Authority role |
| --- | --- |
| `RequirementEventPayload` | admitted input to event truth |
| `RequirementLedger` | replay-derived read model |
| `RequirementProjection` | deterministic read model over active environment |
| `RequirementEvidenceBinding` | evidence classification, not closure |
| `RequirementFoldProjection` | projection over ABG assurance/continuation truth |
| `RequirementResidualProjection` | queryable pressure, not retry/re-entry authority |
| `RequirementAssuranceClaim` | read-model claim surface, not assurance truth |

## Effect Edges

The first slice has no direct workspace, runner, or plugin effect edge. Runtime
event emission remains existing ABG event authority. The requirements algebra
module receives admitted payloads or already-admitted runtime facts and returns
immutable projections.

## Fail-Closed Edges

- Unknown event payload kind fails admission.
- Unknown relation, stage, evidence role, fold state, residual pressure class,
  or attenuation class fails admission or F_D totality.
- A projection with dangling term/span/relation refs fails structural
  evaluation.
- A byproduct not admitted for the active projection binds as non-closing.
- A fallback schedule command cannot outrank an admitted schedule command.

