# B-007 Replace Wall-Clock F_P Timeout With Progress Lease

- id: B-007
- title: Replace wall-clock F_P timeout with progress lease
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Reprice ABG timeout semantics so long-running but productive F_P work is not killed purely on elapsed time.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: critical
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`
- affected_boundary: ABG transport timeout semantics and runtime liveness model
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

ABG currently uses a fixed dispatch timeout. In the `odd_sdlc` proving lane,
that value is currently `1800` seconds.

This model cannot distinguish:

- active long-running construction
- stalled no-progress construction
- completed construction waiting on transport completion

## Root Defect

Timeout is based on wall-clock expiration rather than progress/inactivity.

That is too weak for long constructive edges such as:

- code generation
- release synthesis
- retrofit plan generation

## Acceptance

- ABG supports a progress-lease or inactivity-based timeout model for F_P
  dispatch.
- Progress sources are explicit and auditable, for example:
  - validated result artifact updates
  - declared heartbeat events
  - bounded output/progress channels
- Productive long-running work is not killed only because it crossed a fixed
  wall-clock.
- Truly inactive work still times out and produces diagnosable failure truth.

## Links

- runtime: `/Users/jim/src/apps/odd_sdlc/build_tenants/python/code/odd_sdlc/gtl_module.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/events/events.jsonl`
