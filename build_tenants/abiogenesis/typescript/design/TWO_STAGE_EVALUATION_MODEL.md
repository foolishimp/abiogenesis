# Two Stage Evaluation Model

**Status**: Active
**Date**: 2026-05-06
**Ticket**: T-119

## Stage 1

ABG traversal evaluation decides whether graph work is complete, blocked,
retryable, or eligible for next traversal.

## Stage 2

Homeostatic evaluation decides whether schedule envelope drift or SLA pressure
requires follow-up action.

These stages are separate. A graph function can be locally complete while still
creating schedule drift. A graph function can also be temporally eligible while
not yet closed by ABG.
