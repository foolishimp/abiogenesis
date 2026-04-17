# T-006 Add Live Run Status Projection

- id: T-006
- title: Add live run status projection
- type: feature
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Add a first-class readable live status surface over ABG run and graph-call events.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: medium
- intake_source: ABG observability review during `data_mapper.test33`
- affected_boundary: ABG query/projection surface for live runtime state
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

Operators currently need to tail raw event logs to understand live runtime
state. That is too low-level for trustworthy operation of long-running governed
work.

## Capability

This feature adds a live run status projection that is safer and more readable
than direct event-log inspection.

It should project:

- current active edge
- active graph call / run
- last progress time
- current continuation state
- current failure / yield / completion state
- whether valid result artifacts are already present

## Acceptance

- ABG publishes a live run status projection over current run truth.
- Operators can inspect active/stalled/yielded/failed/completed state without
  tailing `events.jsonl`.
- The projection is consistent with event truth and continuation truth.

## Links

- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py`
- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/events/events.jsonl`
