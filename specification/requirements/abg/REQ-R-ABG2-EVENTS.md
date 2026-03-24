# REQ-R-ABG2-EVENTS — Event Emission and Stream

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-EC (replaced), REQ-F-WKSP (replaced — event-stream portions), REQ-F-CORE (replaced — event portions)
**Wave**: 1

---

## Purpose

ABG owns event emission. The event stream is the truth substrate for replay and convergence.

## Acceptance Criteria

**REQ-R-ABG2-EVENTS-001**: `emit()` is the only write path. Event stream is append-only. `event_time` is system-assigned at append.

**REQ-R-ABG2-EVENTS-002**: F_P does not call the event logger. F_P produces artifacts; F_D reads them and emits events.

**REQ-R-ABG2-EVENTS-003**: The event stream shall carry sufficient structure for replay — any graph application truth must be reconstructable from events alone plus graph declarations.

**REQ-R-ABG2-EVENTS-004**: Events shall carry provenance: spec_hash, workflow_version, work_key, run_id, edge, evaluator, actor.
