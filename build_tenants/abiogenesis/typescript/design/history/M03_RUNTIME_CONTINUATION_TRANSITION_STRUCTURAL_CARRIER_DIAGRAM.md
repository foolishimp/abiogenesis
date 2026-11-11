# M03 Runtime Continuation Transition Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-04
**Derived from**:
[M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md](./M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md),
[M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md](./M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md)

## Diagram

```mermaid
classDiagram
  class RuntimeEvent {
    <<upstream>>
    +kind
    +basisId
  }

  class RuntimeAggregateProjection {
    <<upstream>>
    +basisId
    +graphFunctionId
    +graphCallId
    +frameId
    +nextVectorIndex
    +retryAttemptRefs
  }

  class TraversalContinuationActionProjection {
    <<upstream>>
    +projectionRef
    +action
    +retryEligible
    +terminal
    +reasonRefs
    +evidenceRefs
  }

  class AssuranceClosureDecision {
    <<upstream>>
    +decision
    +projectionRef
    +blockingStatuses
    +rowIds
    +reason
  }

  class RuntimeContinuationTransitionProjection {
    <<prime>>
    +projectionRef
    +disposition
    +terminalKind
    +retryEligible
    +terminal
    +reason
    +reasonRefs
    +evidenceRefs
    +sourceProjectionRefs
  }

  class RetryRepairDecision {
    <<downstream>>
    +kind
    +retryRunId
    +manifestId
  }

  class TerminalTransition {
    <<downstream>>
    +terminalKind
    +reason
  }

  RuntimeEvent --> RuntimeAggregateProjection : replay
  RuntimeAggregateProjection --> RuntimeContinuationTransitionProjection : input
  TraversalContinuationActionProjection --> RuntimeContinuationTransitionProjection : typed continuation action
  AssuranceClosureDecision --> RuntimeContinuationTransitionProjection : closure fold input
  RuntimeContinuationTransitionProjection --> RetryRepairDecision : retry disposition only
  RuntimeContinuationTransitionProjection --> TerminalTransition : non-retry disposition
```

## Carrier Notes

- `RuntimeContinuationTransitionProjection` is the only prime carrier in this
  slice.
- `RetryRepairDecision` and `TerminalTransition` are downstream effects of the
  projection, not rival transition classifiers.
- Terminal retry refs are evidence refs inside the projection. They are not a
  separate carrier.
