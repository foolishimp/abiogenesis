# M03 Iteration Outcome Algebra Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-05
**Derived from**:
[M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md](./M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md),
[M03_ITERATION_STATE_ACTION_ALGEBRA_FIRST_SLICE_IACS.md](./M03_ITERATION_STATE_ACTION_ALGEBRA_FIRST_SLICE_IACS.md)

## Diagram

```mermaid
classDiagram
  class RuntimeEvent {
    <<upstream>>
    +kind
    +basisId
    +eventRef
  }

  class RuntimeAggregateProjection {
    <<upstream>>
    +basisId
    +graphFunctionId
    +nextVectorIndex
    +retryAttemptRefs
  }

  class AssuranceProjection {
    <<upstream>>
    +authoritySnapshot
    +evidenceRows
    +ambiguityRows
  }

  class TraversalContinuationActionProjection {
    <<upstream>>
    +action
    +reasonRefs
    +evidenceRefs
  }

  class GraphReentryFrontierProjection {
    <<upstream>>
    +decision
    +targetVectorIndex
    +reEntryPoint
  }

  class GtlEvaluationScopeRef {
    <<subordinate>>
    +scopeRef
    +graphCallRef
    +frameRef
    +graphFunctionRef
    +graphVectorRef
    +vectorIndex
    +compositionRef
    +scopeTopologyRef
    +scopeKind
    +segmentRef
    +dimensionRef
    +relationRef
  }

  class IterationRowProjection {
    <<row-set>>
    +satisfactionRows
    +runtimeRows
    +bindingGuardRows
    +lifecycleRows
  }

  class IterationSatisfactionRow {
    <<row>>
    +authorityRef
    +status
    +reason
    +lifecycle
    +evidenceRefs
    +evaluationScopeRef
  }

  class IterationRuntimeRow {
    <<row>>
    +boundary
    +status
    +reason
    +retryable
    +evaluationScopeRef
  }

  class IterationBindingGuardRow {
    <<row>>
    +status
    +authorityRef
    +evidenceRef
    +failedCondition
    +evaluationScopeRef
  }

  class IterationOutcomeProjection {
    <<prime>>
    +projectionRef
    +outcome
    +reason
    +reEntryPoint
    +targetVectorIndex
    +evaluationScopeRef
    +diagnosticRefs
  }

  class TerminalTransition {
    <<downstream>>
    +terminalKind
    +reason
  }

  class RetryRepairDecision {
    <<downstream>>
    +kind
    +retryRunId
  }

  RuntimeEvent --> RuntimeAggregateProjection : replay
  RuntimeAggregateProjection --> IterationRowProjection : scope and retry facts
  AssuranceProjection --> IterationRowProjection : satisfaction/binding facts
  TraversalContinuationActionProjection --> IterationRowProjection : runtime facts
  GraphReentryFrontierProjection --> IterationRowProjection : redispatch target facts
  GtlEvaluationScopeRef --> IterationSatisfactionRow : optional scope metadata
  GtlEvaluationScopeRef --> IterationRuntimeRow : optional scope metadata
  GtlEvaluationScopeRef --> IterationBindingGuardRow : optional scope metadata
  GtlEvaluationScopeRef --> IterationOutcomeProjection : redispatch target metadata
  IterationRowProjection --> IterationSatisfactionRow : owns rows
  IterationRowProjection --> IterationRuntimeRow : owns rows
  IterationRowProjection --> IterationBindingGuardRow : owns rows
  IterationRowProjection --> IterationOutcomeProjection : total fold
  IterationOutcomeProjection --> TerminalTransition : terminate only
  IterationOutcomeProjection --> RetryRepairDecision : redispatch realization only
```

## Program Flow

```mermaid
flowchart TD
  A[Admitted runtime events] --> B[Replay projections]
  B --> C[Source row projections]
  C --> D[Lifecycle normalization]
  D --> E[Priority fold]
  E --> F[IterationOutcomeProjection]
  F --> G{Outcome}
  G -->|terminate| H[terminal event materialization]
  G -->|redispatch| I[retry/re-entry/proof materialization]
  G -->|suspend| J[continuation/yield materialization]
  F --> K[diagnostic/read models]
```

## State Diagram

```mermaid
stateDiagram-v2
  [*] --> SourceRows
  SourceRows --> LifecycleNormalized
  LifecycleNormalized --> TerminateBlocked: hard guard or constitutional blocker
  LifecycleNormalized --> Redispatch: runtime-local repair/proof/re-entry
  LifecycleNormalized --> Suspend: progressing/observer/handoff
  LifecycleNormalized --> TerminateDeferred: deferred only
  LifecycleNormalized --> TerminateConverged: all current rows satisfied
  TerminateBlocked --> [*]
  Redispatch --> [*]
  Suspend --> [*]
  TerminateDeferred --> [*]
  TerminateConverged --> [*]
```

## Carrier Notes

- `IterationOutcomeProjection` is the only prime carrier in this slice.
- Row projections are source facts. They are not transition authority.
- `GraphReentryPoint` names redispatch or constitutional re-entry surface.
- `GraphChangeClass` is provenance and never a parallel transition
  discriminator.
- `GtlEvaluationScopeRef` is optional subordinate row/target metadata for
  scoped evaluator facts inside one graph-vector boundary.
- Scoped redispatch remains the `redispatch` outcome constructor with scope
  metadata on the target, not a new outcome.
- Superseded evidence remains replay-visible but is removed before satisfaction
  or blocking.
- Orphan evidence is exposed as a binding guard failure.
