# ABG Event Calculus Projection Refactor Plan

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-120, T-121

## First Refactor

`deriveRuntimeAggregateProjection` consumes the EC layer for `graph_call_opened`,
`frame_opened`, and `vector_closed`.

The projection rejects those lifecycle facts unless the declared EC effect for
the event initiates the matching `graph_call_open`, `frame_open`, or
`vector_closed` fluent.

## T-121 Refactor

`deriveRuntimeAggregateProjection` also consumes declared EC law for the bounded
retry/continuation family:

- `retry_repair_planned` must initiate the replay-visible
  `retry_repair_planned` vector fluent before retry projection may record the
  retry attempt.
- `continuation_terminated` must initiate `continuation_terminated` and
  terminate the matching `continuation_open` fluent before continuation repair
  projection may record the termination.
- `continuation_reopened` must initiate the matching `continuation_open` fluent
  before continuation repair projection may record the reopened continuation.

This closes the next private-switch gap without moving retry choice into EC.
Retry selection, ordering checks, duplicate prevention, and graph advancement
remain ABG projection/iteration law.

## Next Refactors

1. Move remaining retry attempt open/stop/escalation and progress read-model
   derivation over EC fluents.
2. Add derived-fluent rules where projection rows are ramifications over core
   lifecycle fluents.
3. Keep ordering, duplicate-closure, and range checks in projection modules
   where they are read-model integrity checks rather than event/fluent law.

## Constraint

Projection refactoring must not make the EC layer a second iterator. It stays a
replay interpreter over admitted events.
