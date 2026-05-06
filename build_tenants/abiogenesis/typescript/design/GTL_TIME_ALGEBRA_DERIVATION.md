# GTL Time Algebra Derivation

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-119, T-122

## Central Law

Time changes eligibility. ABG remains the iterator.

## Algebra

The first GTL temporal operator is `not_before` attached to a
`GraphVector`. It derives a `TemporalConstraint` and a `TimerIntent`. A timer
provider may arm work, but only an admitted `timer_outcome_admitted` event can
change replay truth.

## Executable GTL Syntax

The first slice has one canonical graph-vector declaration surface:

```text
GraphVector.declarations["abg.temporal_constraint"]
```

The declaration value is a `hook_ref`. Its config must carry:

```text
constraint_ref
operator = "not_before"
not_before_ref
deadline_ref (optional)
schedule_policy_ref
timer_provider_ref
deadline_breach_action
```

`deriveTemporalConstraintFromGtl()` resolves that declaration into a
`TemporalConstraint` plus `SchedulePolicy`. It fails closed for absent,
duplicate, malformed, detached, or unsupported declarations. Provider receipts
remain payload evidence until ABG admits a temporal runtime event.

T-122 adds optional `deadline_ref` to the same declaration surface. A
`deadline_breach_admitted` event may then project deadline-breach pressure and
the policy-selected `deadline_breach_action`. That pressure is homeostatic
truth, not traversal closure.

## Attachment Decision

- `GraphVector`: primary surface for per-edge eligibility.
- `GraphFunction`: default or contract-level temporal policy.
- `Job`: outcome-level deadlines and recurrence policy.
- `Context`: temporal context only, not graph-attached constraints.
- `Rule`: reserved for later if a distinct local constraint law is required.
