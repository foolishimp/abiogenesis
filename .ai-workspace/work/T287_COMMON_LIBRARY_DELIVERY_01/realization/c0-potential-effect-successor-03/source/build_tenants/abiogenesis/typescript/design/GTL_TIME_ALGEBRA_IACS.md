# GTL Time Algebra IACS

**Status**: Active
**Date**: 2026-05-07
**Tickets**: T-119, T-122

| Carrier | Owner | Role |
|---|---|---|
| `TemporalContext` | GTL/ABG boundary | clock, calendar, timezone refs |
| `TemporalConstraintGtlResolution` | GTL/ABG boundary | canonical `abg.temporal_constraint` syntax resolved to runtime temporal carriers |
| `TemporalConstraint` | GTL | temporal law attached to vector/function/job |
| `SchedulePolicy` | product policy | deadline and provider policy refs |
| `TimerIntent` | ABG | admitted timer obligation intent |
| `TimerOutcome` | ABG | admitted provider outcome payload |
| `DeadlineBreach` | ABG | admitted deadline breach and policy consequence payload |
| `ScheduledContinuation` | ABG | replay-owned continuation after temporal eligibility |
| `TemporalProjection` | ABG | replay-derived eligibility read model |
| `TemporalHomeostaticProjection` | ABG | replay-derived drift and schedule-pressure read model separate from traversal completeness |

Subordinate payloads such as instants, calendars, provider receipts, and
timezone identifiers remain refs or payload fields. They are not peer authority
carriers.

Downstream rows such as `TemporalEligibilityProjectionRow`,
`DeadlineBreachProjectionRow`, and `TemporalDriftObservation` are subordinate to
their owning projection carriers. They preserve replay-derived details for
consumers without becoming new authority surfaces.
