# REQ-R-ABG2-EVENTS — Event Emission and Stream

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Wave**: 1

---

## Purpose

ABG owns canonical event emission. The event stream is the truth substrate for replay and convergence.

## Acceptance Criteria

**REQ-R-ABG2-EVENTS-001**: `emit()` is the only lawful write path. Event stream is append-only. `event_time` is system-assigned at append. `EventStream.append()` is storage substrate internal to the event module, not a second public emission contract.

**REQ-R-ABG2-EVENTS-002**: All events shall enter through the canonical ABG emission contract. No operator or external actor may bypass the engine's event surface to write directly to the event stream.

**REQ-R-ABG2-EVENTS-003**: The event stream shall carry sufficient structure for replay — any graph application truth must be reconstructable from events alone plus graph declarations.

**REQ-R-ABG2-EVENTS-004**: All events shall carry common provenance fields: work_key, run_id. Event-specific provenance (spec_hash, workflow_version, edge, evaluator, actor) shall be required only on the event types where they are meaningful.

**REQ-R-ABG2-EVENTS-005**: Traversal, services, CLI, recursive helpers, and other runtime modules may construct event requests, but they shall emit only by calling the canonical ABG emission surface or its typed helpers. No runtime module may own an alternate event-write boundary.
