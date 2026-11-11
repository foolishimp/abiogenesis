# M03 Overlay Frame Contract Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-137

```text
GTL / ABG anchors
  GraphFunction | GraphVector | GraphSpan | Job | Module | Rule
      |
      v
OverlayFrameScopeEventRow[]
      |
      v
OverlayFrameContract
  - overlayFrameRef
  - contractRef
  - scopeRefs
  - fireWhen: OverlayFramePredicateEventRow
  - terminateWhen: OverlayFramePredicateEventRow
  - pressureRefs
  - foldbackTargetRef
  - reentryTargetVectorIndex
  - noClosePolicyRef
      |
      +-----------------------------+
      |                             |
      v                             v
ObservedStateProjection       Clearing Evidence Refs
  observedStateRefs                |
      |                             |
      +-------------+---------------+
                    v
        OverlayFrameFoldbackOutcome
          - predicateEvaluations
          - pressureDecision
          - carriedPressureRefs
          - clearedPressureRefs
          - diagnosticRefs
                    |
                    v
Runtime Events
  overlay_frame_declared
  overlay_frame_evaluated
                    |
                    v
OverlayFrameProjection
  - activeRows
  - activeOverlayFrameRefs
  - carriedPressureRefs
  - clearedPressureRefs
                    |
                    v
RuntimeAggregateProjection.overlayFrame
```

## Closure Pressure Law

```text
fire missing              -> carry_pressure
fire satisfied, terminate missing -> carry_pressure
terminate satisfied, no clearing evidence, no no-close policy -> carry_pressure
terminate satisfied, no-close policy -> no_close + carried pressure
terminate satisfied, clearing evidence -> clear_pressure
```

`OverlayFrameProjection` rejects an evaluated event when the predicate
evaluation's `satisfied` and `missingObservedStateRefs` fields do not replay from
the admitted observed-state projection.
