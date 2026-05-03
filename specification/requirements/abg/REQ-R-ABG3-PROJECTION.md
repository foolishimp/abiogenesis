# REQ-R-ABG3-PROJECTION — Replay And Projection

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

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

**REQ-R-ABG3-PROJECTION-007**: ABG shall provide replay-derived projection over actor/process supervision events when process-boundary dispatch is used. The projection shall expose process identity when available, stream evidence references, latest heartbeat or liveness observation, timeout state, signal sequence, exit status, exit signal, runtime error, and final observed actor result.

**REQ-R-ABG3-PROJECTION-008**: Process liveness, timeout, and stream-observation state shall be projected from admitted actor/process events. A downstream product shall not infer child-process state from terminal transcript text, polling side effects, or product-local mutable controller state.

**REQ-R-ABG3-PROJECTION-009**: Retry-frontier projection shall preserve the full retry attempt frontier for the active traversal boundary, including prior attempt identities, reason classes, owner surfaces, source event kinds, and attempt coverage. A latest-only dossier or product-local summary shall not satisfy full-frontier projection.

**REQ-R-ABG3-PROJECTION-010**: A structural assertion that a supplied projection is full shall validate row shape, deterministic identity, reason-class coverage, and retry-attempt coverage. Closure-critical consumers should prefer replay-derived projections or compare supplied projections against replay-derived truth.

**REQ-R-ABG3-PROJECTION-011**: Public runtime summaries, CLI surfaces, and downstream consumer projections that describe traversal non-progress shall render the same ABG-derived continuation action. A carrier may record process facts and a projection may decide the next action, but there shall be one authoritative action truth for a given event stream.

**REQ-R-ABG3-PROJECTION-012**: Traversal modulation projection shall be deterministic over GTL qualifier truth, current basis, admitted schedule refs, admitted progress rows, backend progress classification, forced-review gates, and existing non-progress/foldback/reentry projections. Public summaries and downstream consumers shall not publish a rival next action for the same event stream.
