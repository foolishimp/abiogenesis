# ADR-005: Event Stream — Append-Only, System-Assigned Time

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T040000_STRATEGY_gtl-genesis-engine-closure.md (Part 1, §3)

## Decision

The event stream is the foundational medium. All state is derived from it.

Rules:
1. `emit(event_type, data)` is the ONLY write path to `events.jsonl`
2. `event_time` is assigned from the system clock at append — no caller can pass it
3. Business times live in payload: `effective_at`, `completed_at`, `observed_at`
4. Corrupted lines fail visibly — no silent skipping
5. Replay is deterministic: `project(S, T, I) = project(S, T, I)` always

Event format (V1 — simple, not OpenLineage):
```json
{"event_time": "ISO8601", "event_type": "edge_started", "data": {...}}
```

The `emit()` module-level function requires `workspace_bootstrap()` to be called first.
This is structural, not a convention — calling `emit()` before bootstrap raises RuntimeError.

## Consequences

- No mutable status files for asset state — `project()` derives state from events
- Feature YAML files (written by bootstrap compiler) are trace surface, not control surface
- `EventStream.all_events()` raises on corrupted JSON, not silently skips
- V1 writes simple JSON events; OpenLineage events from the bootstrap compiler are ignored
  by `project()` (they use a different schema)
- Future: add build field to events for multi-tenant projection filtering
