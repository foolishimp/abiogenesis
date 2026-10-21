# GTL Time Algebra First Proof Plan

**Status**: Active
**Date**: 2026-05-06
**Ticket**: T-119

## Slice

1. Build one graph-function basis.
2. Attach one `not_before` temporal declaration through
   `GraphVector.declarations["abg.temporal_constraint"]`.
3. Derive one `TemporalConstraint` and `SchedulePolicy` from GTL syntax.
4. Derive one `TimerIntent`.
5. Admit `timer_intent_admitted`.
6. Admit `timer_outcome_admitted(timer_fired)`.
7. Derive `TemporalProjection` from EC replay.
8. Admit `scheduled_continuation_reopened`.
9. Prove aggregate projection still has no vector closure.
10. Derive homeostatic `eligible_not_closed` observation.
11. Prove a live provider receipt has no eligibility effect before ABG admission.

## Commands

```bash
npm run test:t119
npm run test:t119:sandbox
npm run test:t119:live
npm run test:t120
```
