# REQ-R-ABG3-EVENTS — Event Truth And Emission

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define the ABG 3 event substrate as the only written runtime truth surface.

## Acceptance Criteria

**REQ-R-ABG3-EVENTS-001**: `emit()` shall remain the only lawful write path. The event stream shall be append-only.

**REQ-R-ABG3-EVENTS-002**: Event truth shall be rich enough that runtime truth is reconstructable by replay from events plus declared GTL surfaces alone.

**REQ-R-ABG3-EVENTS-003**: The canonical event envelope shall carry immutable engine-assigned `event_id`, immutable system-assigned `event_time`, aggregate identity, causal/correlation identity, and explicit runtime references sufficient for replay.

**REQ-R-ABG3-EVENTS-004**: Canonical aggregate types shall include at minimum `run`, `graph_call`, `frame`, and `continuation`.

**REQ-R-ABG3-EVENTS-005**: Vector-local traversal facts shall attach to the nearest enclosing runtime aggregate. Vector shall never be its own runtime aggregate.

**REQ-R-ABG3-EVENTS-006**: Lifecycle open/close/fail/rebound events shall remain authoritative truth. Snapshot or checkpoint events may assist replay but shall not replace authoritative lifecycle facts.

**REQ-R-ABG3-EVENTS-007**: ABG shall observe process-boundary runtime facts only. It shall not constitutionalize internal chain-of-thought, hidden tactic steps, or private decomposition inside probabilistic workers.

**REQ-R-ABG3-EVENTS-008**: When ABG yields on unresolved non-blocking post-transform observer truth, the yielded handoff and its causing observer facts shall be emitted as authoritative event truth rather than inferred from absence of terminal failure.
