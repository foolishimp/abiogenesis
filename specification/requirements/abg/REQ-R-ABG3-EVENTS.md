# REQ-R-ABG3-EVENTS — Event Truth And Emission

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

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

**REQ-R-ABG3-EVENTS-009**: Long-running supervised dispatch shall emit enough progress, artifact-observation, stall, salvage, and terminal facts that operator-grade live status can be replay-projected without hidden controller memory.

**REQ-R-ABG3-EVENTS-010**: The canonical event envelope shall preserve at minimum event identity, event time, event type, aggregate type, aggregate identity, parent aggregate identity when present, causation identity, correlation identity, workflow version, work key, run identity, semantic job identity, graph-function identity, materialization identity, frame attempt identity, frame lineage identity, vector identity when present, and closed event data.

**REQ-R-ABG3-EVENTS-011**: Authoritative event truth shall cover at minimum run lifecycle, graph-call lifecycle, frame lifecycle, vector-local traversal and dispatch facts, proof and closure facts, continuation lifecycle, correction, and supersession.
