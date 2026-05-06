# ABG Event Calculus T119 Temporal Extension Contract

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-120, T-119, T-122

## Contract

T-119 temporal carriers extend the same EC axiom surface:

- `timer_intent_admitted` initiates `temporal_timer_pending`.
- `timer_outcome_admitted(timer_fired)` terminates pending timer truth and
  initiates `temporal_timer_fired` plus `temporal_eligible`.
- `timer_outcome_admitted(timer_cancelled|timer_missed)` terminates pending
  timer truth without eligibility.
- `deadline_breach_admitted` initiates `temporal_deadline_breached`.
- `scheduled_continuation_reopened` initiates
  `scheduled_continuation_open`.

## Control Law

Temporal eligibility is not graph advancement. It changes which graph boundary
is eligible under replay. ABG aggregate projection and iteration still decide
closure, advancement, retry, and convergence.
