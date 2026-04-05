# REQ-R-ABG3-PROJECTION — Replay And Projection

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define replay-derived fluents and projections as the sole lawful current-state
surface over ABG runtime truth.

## Acceptance Criteria

**REQ-R-ABG3-PROJECTION-001**: Projection shall be deterministic. The same event stream and declared inputs shall always yield the same projection result.

**REQ-R-ABG3-PROJECTION-002**: Durable runtime truth shall be derived by replay. ABG shall not write fluent state as a rival authority surface.

**REQ-R-ABG3-PROJECTION-003**: ABG shall provide explicit projections for at minimum `run`, `graph_call`, `frame`, and `continuation`.

**REQ-R-ABG3-PROJECTION-004**: If replay cannot determine what currently holds from event truth alone, the event/projection model is constitutionally incomplete.

**REQ-R-ABG3-PROJECTION-005**: Snapshot, checkpoint, or state-summary surfaces may exist as replay aids, but they shall not override replay-derived truth.

**REQ-R-ABG3-PROJECTION-006**: Callable truth, frame truth, and continuation truth shall not be hidden as implicit side effects inside run projection alone.
