# GTL Time Algebra Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-07
**Tickets**: T-119, T-122

```mermaid
classDiagram
  class TemporalContext {
    <<prime>>
    <<authoritative>>
    +contextRef
    +clockRef
    +calendarRef
    +timezoneId
  }

  class TemporalConstraintGtlResolution {
    <<prime>>
    <<authoritative>>
    +source
    +sourceRef
    +attrKey
    +hookRef
  }

  class TemporalConstraint {
    <<prime>>
    <<authoritative>>
    +constraintRef
    +operator
    +attachment
    +graphFunctionId
    +vectorIndex
    +edge
    +notBeforeRef
    +deadlineRef
    +schedulePolicyRef
  }

  class SchedulePolicy {
    <<prime>>
    <<authoritative>>
    +schedulePolicyRef
    +deadlineBreachAction
    +timerProviderRef
  }

  class TimerIntent {
    <<prime>>
    <<effect-edge>>
    +timerIntentRef
    +constraintRef
    +basisId
    +graphFunctionId
    +graphCallId
    +frameId
    +vectorIndex
    +edge
    +providerRef
    +notBeforeRef
    +schedulePolicyRef
  }

  class TimerOutcome {
    <<prime>>
    <<effect-edge>>
    +timerOutcomeRef
    +timerIntentRef
    +constraintRef
    +schedulePolicyRef
    +outcome
    +providerRef
    +providerReceiptRef
  }

  class DeadlineBreach {
    <<prime>>
    <<effect-edge>>
    +deadlineBreachRef
    +constraintRef
    +schedulePolicyRef
    +deadlineRef
    +deadlineBreachAction
    +providerRef
    +providerReceiptRef
  }

  class ScheduledContinuation {
    <<prime>>
    <<authoritative>>
    +scheduledContinuationRef
    +constraintRef
    +timerIntentRef
    +timerOutcomeRef
    +basisId
    +graphFunctionId
    +graphCallId
    +frameId
    +vectorIndex
    +edge
    +schedulePolicyRef
    +providerRef
  }

  class TemporalProjection {
    <<prime>>
    <<downstream>>
    +basisId
    +eligibleVectorIndexes
    +pendingTimerIntentRefs
    +firedTimerOutcomeRefs
    +deadlineBreachedVectorIndexes
    +deadlineBreachRefs
    +scheduledContinuationRefs
  }

  class TemporalEligibilityProjectionRow {
    <<subordinate>>
    <<downstream>>
    +vectorIndex
    +edge
    +constraintRef
    +timerIntentRef
    +schedulePolicyRef
  }

  class DeadlineBreachProjectionRow {
    <<subordinate>>
    <<downstream>>
    +vectorIndex
    +edge
    +deadlineBreachRef
    +constraintRef
    +schedulePolicyRef
    +deadlineRef
    +deadlineBreachAction
    +providerRef
    +providerReceiptRef
  }

  class TemporalHomeostaticProjection {
    <<prime>>
    <<downstream>>
    +basisId
    +traversalComplete
    +observations
  }

  class TemporalDriftObservation {
    <<subordinate>>
    <<downstream>>
    +observationRef
    +schedulePolicyRef
    +vectorIndex
    +edge
    +reason
    +deadlineBreachAction
    +requiredRegime
  }

  class InstantRef {
    <<subordinate>>
    -ref
  }

  class CalendarRef {
    <<subordinate>>
    -ref
  }

  class ProviderReceiptRef {
    <<subordinate>>
    <<effect-edge>>
    -ref
  }

  class RecurrenceRule {
    <<deferred>>
  }

  class WindowPolicy {
    <<deferred>>
  }

  TemporalConstraintGtlResolution *-- TemporalConstraint
  TemporalConstraintGtlResolution *-- SchedulePolicy
  TemporalConstraint --> InstantRef : notBeforeRef/deadlineRef
  TemporalContext --> CalendarRef
  TemporalConstraint --> SchedulePolicy
  SchedulePolicy --> TimerIntent
  SchedulePolicy --> DeadlineBreach
  TemporalConstraint --> TimerIntent
  TimerIntent --> TimerOutcome
  TimerOutcome --> ScheduledContinuation
  TemporalConstraint --> DeadlineBreach
  DeadlineBreach --> ProviderReceiptRef
  TimerOutcome --> ProviderReceiptRef
  TemporalProjection *-- TemporalEligibilityProjectionRow
  TemporalProjection *-- DeadlineBreachProjectionRow
  TemporalProjection --> ScheduledContinuation
  TemporalHomeostaticProjection *-- TemporalDriftObservation
  TemporalHomeostaticProjection --> TemporalProjection
```

## Boundary Notes

`TemporalEligibilityProjectionRow`, `DeadlineBreachProjectionRow`, and
`TemporalDriftObservation` are downstream row shapes. They are public because
the projection exposes them, but they remain subordinate to
`TemporalProjection` and `TemporalHomeostaticProjection`.

`RecurrenceRule` and `WindowPolicy` are explicitly deferred from the active
slice. They do not become prime carriers until a later ticket proves the
promotion.
