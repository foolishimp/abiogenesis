# REQ-R-ABG3-CONTINUATION — Runtime Open Obligation Truth

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `Continuation` as run-local runtime obligation truth derived from prior
events.

## Acceptance Criteria

**REQ-R-ABG3-CONTINUATION-001**: `Continuation` shall represent an open governance obligation or unresolved runtime condition derived from event truth, not constitutional intent or hidden task-queue strategy.

**REQ-R-ABG3-CONTINUATION-002**: Continuation identity shall preserve at minimum `continuation_id`, `continuation_kind`, `caused_by_event_id`, and `run_id`.

**REQ-R-ABG3-CONTINUATION-003**: Continuation shall be strictly run-local. It shall not survive into a replacement run as the same aggregate.

**REQ-R-ABG3-CONTINUATION-004**: If unresolved work remains relevant after retry, correction, or supersession, ABG shall terminate the old continuation by authoritative event truth and open a new continuation in the new run with explicit causal linkage.

**REQ-R-ABG3-CONTINUATION-005**: Authoritative continuation lifecycle shall include at minimum open, resolved, superseded, and abandoned termination truth.
