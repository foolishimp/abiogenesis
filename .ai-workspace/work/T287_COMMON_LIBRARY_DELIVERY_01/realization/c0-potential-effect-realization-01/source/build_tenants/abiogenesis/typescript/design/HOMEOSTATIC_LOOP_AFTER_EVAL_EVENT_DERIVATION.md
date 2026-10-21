# Homeostatic Loop After Eval Event Derivation

**Status**: Active
**Date**: 2026-05-06
**Ticket**: T-119

Traversal evaluation closes or blocks graph work under existing F_D/F_P/F_H
law. Homeostatic evaluation runs after replay to observe schedule drift,
deadline pressure, recurrence debt, or SLA pressure.

The loop is:

```text
ABG aggregate projection
-> TemporalProjection
-> TemporalHomeostaticProjection
-> policy-selected review/retry/reprice pressure
```
