# REQ-R-ABG3-GRAPHCALL — Callable Runtime Aggregate

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

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
