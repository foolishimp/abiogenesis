# REQ-R-ABG3-GRAPHCALL — Callable Runtime Aggregate

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `GraphCall` as the runtime aggregate corresponding to one public
graph-function execution boundary.

## Acceptance Criteria

**REQ-R-ABG3-GRAPHCALL-001**: ABG shall open `GraphCall` truth for one realized execution of one published `GraphFunction`.

**REQ-R-ABG3-GRAPHCALL-002**: `GraphCall` identity shall preserve at minimum `call_id`, `run_id`, `graph_function_id`, and `materialization_id`.

**REQ-R-ABG3-GRAPHCALL-003**: Each retry, reopen, or replacement callable attempt shall mint a fresh `call_id`.

**REQ-R-ABG3-GRAPHCALL-004**: Cross-call relation shall be represented by event causation/correlation identity rather than hidden mutable controller state.

**REQ-R-ABG3-GRAPHCALL-005**: In-memory call objects may exist as caches or projections over event truth, but they shall not become rival control state.

**REQ-R-ABG3-GRAPHCALL-006**: Repeated execution of the same published
`GraphFunction` may create multiple graph-call instances over the same
materialized graph. Instance identity shall be scoped by replay-visible run,
work-key, frame, materialization, and causation truth rather than by mutable
workspace paths or hidden controller state.
