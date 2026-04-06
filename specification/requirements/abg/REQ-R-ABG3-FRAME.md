# REQ-R-ABG3-FRAME — Recursive Invocation Aggregate

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `Frame` as the recursive invocation aggregate over graph-function
execution.

## Acceptance Criteria

**REQ-R-ABG3-FRAME-001**: ABG shall represent recursive invocation through explicit `Frame` aggregates rather than hidden controller stack state.

**REQ-R-ABG3-FRAME-002**: Frame identity shall preserve `frame_attempt_id`, `frame_lineage_id`, and `call_id`.

**REQ-R-ABG3-FRAME-003**: Frame reopen or retry shall mint a fresh `frame_attempt_id` while preserving lawful `frame_lineage_id`.

**REQ-R-ABG3-FRAME-004**: Recursive interpretation shall progress as tail-loop execution over explicit frame truth sufficient for suspend/resume, foldback, replay, and bounded control-state growth.

**REQ-R-ABG3-FRAME-005**: Checkpoints or snapshots may aid recovery, but authoritative recursive truth shall remain the event/history plus declared contracts.

**REQ-R-ABG3-FRAME-006**: In-memory frame objects may exist as caches or projections over event truth, but they shall not become rival control state.
