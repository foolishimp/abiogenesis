# M03 Requirements Algebra Refinement Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-168

```text
GTL declaration bundle
  -> GtlRequirementDeclaration[*]
  -> GtlRequirementRelationDeclaration[*]
  -> GtlTraversalSpanDeclaration[*]

ABG admission
  -> requirement_term_admitted
  -> requirement_relation_admitted
  -> traversal_span_admitted

Replay
  -> RequirementLedger
       terms[*]
       relations[*]
       spans[*]
       folds[*]
       residuals[*]

Edge query
  -> EdgeRequirementEnvironment
       activeTerms[*]
       activeRelations[*]
       activeSpans[*]
       priorFolds[*]
       carriedResiduals[*]

Leaf route
  -> RequirementProjection[*]
  -> RequirementFoldProjection[*]
  -> RequirementResidualProjection[*]

Read-only graph queries
  -> RequirementGraphProjection
       parentChildPairs[*] -> RequirementGraphPairProjection[*] <<subordinate row>>
  -> RequirementAggregateStateProjection[*]
```

## Authority Boundaries

| Shape | Authority |
| --- | --- |
| `GtlRequirementRelationDeclaration` | declaration-only GTL graph relation |
| `RequirementRelation` | admitted ABG relation truth |
| `EdgeRequirementEnvironment.activeRelations` | active query pressure |
| `RequirementGraphProjection` | replay-derived graph view |
| `RequirementGraphPairProjection` | subordinate row inside the graph view |
| `RequirementAggregateStateProjection` | aggregate read model over child truth |

## Forbidden Shapes

- `GoalNode`
- `DecompositionNode`
- `ObstacleNode`
- `RequirementGraphLedger`
- `ParentFoldEvent`
- `AggregateResidualEvent`
- downstream `glc.*` graph-function catalog equivalents

## Event Rule

Only leaf requirement fold/residual truth is emitted by the route in this
slice. Parent aggregate state is query-derived from emitted child truth.
