# ABG Schedule Runtime Derivation

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-119, T-122

## Runtime Law

ABG admits timer intent, timer outcome, and scheduled-continuation events. The
temporal projection derives eligibility by EC replay. Aggregate projection does
not close a vector because a timer fired.

## First Proof

`test_t119_temporal_algebra_unit.test.mjs`,
`test_t119_temporal_gtl_syntax.test.mjs`,
`test_t119_temporal_gtl_sandbox.test.mjs`, and
`test_t119_temporal_gtl_live.test.mjs` prove:

- `not_before` blocks eligibility before a fired timer outcome.
- `GraphVector.declarations["abg.temporal_constraint"]` resolves to
  `TemporalConstraint` and `SchedulePolicy`.
- provider-local payloads have no authority without ABG event admission.
- `timer_fired` opens replay-derived temporal eligibility.
- scheduled continuation is replay-derived.
- homeostatic drift is separate from traversal closure.

## Deadline Consequence Proof

`test_t122_temporal_deadline_policy.test.mjs` proves:

- optional `deadline_ref` resolves from the canonical temporal GTL declaration.
- `deadline_breach_admitted` projects deadline-breach pressure.
- provider-local deadline payloads have no authority without ABG admission.
- schedule-policy action feeds homeostatic observation without closing or
  advancing graph traversal.
