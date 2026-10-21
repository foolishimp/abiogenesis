# Timer Provider Contract Sketch

**Status**: Active
**Date**: 2026-05-06
**Ticket**: T-119

## Contract

```text
TimerIntent -> provider arm request
provider receipt -> TimerOutcome payload
TimerOutcome payload -> ABG admission -> timer_outcome_admitted
```

A provider may deliver receipts, missed-fire notices, cancellation receipts,
or fired notices. None are semantic runtime truth until ABG admits a
`timer_outcome_admitted` event.

Cloud providers such as Step Functions or EventBridge may trigger compute.
They cannot authorize graph transition, vector closure, or scheduled
continuation truth.
