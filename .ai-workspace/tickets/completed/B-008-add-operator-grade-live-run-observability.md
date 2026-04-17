# B-008 Add Operator-Grade Live Run Observability

- id: B-008
- title: Add operator-grade live run observability
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Close the observability gap between raw event emission and operator-trustworthy live runtime state.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: high
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`
- affected_boundary: ABG control-plane observability, live status projection, and operator trust
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

During `data_mapper.test33`, the truthful live state was available in
`events.jsonl`, but operators could not see it through the quiet CLI output or
through stale published runtime snapshots.

This creates uncertainty around:

- whether the run is alive
- which edge is active
- whether tokens are still being consumed
- whether the system is stalled, yielded, failed, or simply quiet

## Root Defect

ABG emits low-level events but does not project them into a live operator-grade
run-state surface.

## Acceptance

- ABG provides a live run-state projection over the event stream.
- The projection exposes at least:
  - active edge
  - active call/run ids
  - last progress timestamp
  - last result artifact status
  - stalled / active / yielded / failed / completed state
- The projection is available without tailing raw `events.jsonl`.
- The projection stays consistent during long-running F_P turns.

## Links

- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/events/events.jsonl`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
