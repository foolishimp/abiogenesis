# B-018 `gen-start` Needs Persisted Proof-Hold Policy Over Proof-Failed Identities

- id: B-018
- title: Publish product-layer proof-hold truth for repeated proof failure on one work identity so `gen-start`, `gen-gaps`, and live run status stop telling different stories
- type: bug
- status: completed
- goal: scheduler-operability
- change_intent: Treat repeated proof failure as a replay-derived product-layer control-plane projection over canonical `proof_failed` and explicit control events, governed by one resolved hold-policy source, so one work identity can enter a held state that survives process restart and is consumed consistently by `gen-start`, `gen-gaps`, and live run status without becoming a rival ABG run lifecycle.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: high
- intake_source: `data_mapper.test35` forensic run 2026-04-19; `derive_test_run_archive_surface` reached 7 proof failures under repeated advancement control with no held state or operator-visible stop truth
- dependencies: none
- affected_boundary: product policy requirements, `gen-start` control modes in `cli_adapter.py`, run/control-plane projections, operator override semantics
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-19
- authoritative_contract: replay-derived product-layer `proof_hold` projection keyed by `edge + work_key + spec_hash + workflow_version`, consumed consistently by `gen-start`, `gen-gaps`, and live run status
- superseded_surface: loop-local retry behavior, controller-local proof-failure memory, and pending-work stories that lack durable held-state truth
- closure_law: one work identity becomes held only by replay over canonical `proof_failed` / `proof_passed` / scoped `reset` events under one resolved hold policy, and every consumer reports that same held truth
- producer_set: `result_ingest.py`, `fulfillment_followups.py`, `events.py` scoped `reset`, `proof_hold.py`
- consumer_set: `cli_adapter.py`, `interpret.py`, `live_status.py`
- derived_projections: CLI held-stop payloads, `gen-gaps` held explanations, live run-status held projection
- old_path_classification: loop-local retry counters=`remove`; controller-local hold memory=`remove`; scoped `reset` clear path=`re-authorize`

## Context

`gen-start` control modes are product-layer control-plane behavior, not ABG
interpreter law.

The current convergence control already has a global iteration ceiling, but it has no
authoritative hold policy for repeated proof failure on one work identity.

In `data_mapper.test35`, `derive_test_run_archive_surface` produced 7
`proof_failed` events with `policy_reason: proof_incomplete`. The loop kept
returning to the same work identity because no held state existed. `gaps` and
later operator inspection likewise had no single truth saying “this identity is
held pending intervention.”

The root cause of the proof failure was downstream domain truth, not transport.
The ABG/product bug is that repeated proof failure remained an unaccumulated
control-plane story instead of becoming one operator-facing state.

## Problem Statement

`gen-start` convergence control currently treats repeated `proof_failed`
lifecycle on one work identity as ordinary pending work. That is too weak.

The missing truth is not a new interpreter lifecycle. It is a product-layer
control-plane projection derived from canonical ABG events plus explicit
control acts such as operator clear or override.

Without that state:

- the same identity can be redispatched repeatedly
- `gaps` has no held explanation to project
- restart or later inspection loses the fact that the identity already crossed
  a retry threshold

## Required Direction

1. Publish `proof_hold` as replay-derived product-layer control-plane truth,
   not as a new ABG run lifecycle
2. Publish one resolved proof-hold policy source for each identity. That
   resolved policy must govern at minimum:
   - failure threshold
   - whether hold is enabled
   The source of truth is product policy. If runtime config or per-edge policy
   later specialize it, they must resolve into that one product-consumed policy
   surface rather than becoming CLI-local or controller-local truth. The
   threshold `N` is therefore read from one resolved product-policy surface,
   not inferred ad hoc by the control loop
3. Key the held identity on the same current-truth dimensions already used for
   published fulfillment state:
   - `edge`
   - `work_key`
   - `spec_hash`
   - `workflow_version`
4. Make hold survive process restart by rooting it in durable event/projection
   truth rather than CLI-local counters or hidden controller memory
5. Define lawful hold-clear paths explicitly:
   - the identity reaches `proof_passed`
   - the identity is superseded by a new `spec_hash` or `workflow_version`
   - an explicit operator clear act is emitted as authoritative event truth
6. The explicit operator clear path for this ticket should use the existing
   `reset` event family over the held scope, not ad hoc local memory. If a
   narrower non-reset override is later required, that must be a separate
   ticket with its own event law. The clear event contract for this ticket is:
   - `event_type = reset`
   - `scope = workspace | work_key | edge`
   - `actor`
   - `reason`
   - `work_key` when scope is `work_key` or `edge`
   - `edge` when scope is `edge`
7. Keep canonical run truth unchanged. Live run status may report hold, but
   `proof_hold` must project alongside run truth rather than overwrite the ABG
   run algebra
8. Make `gen-start`, `gen-gaps`, and live run status consume that same held truth
9. Keep yielded handoff separate. `yielded` remains runtime-owned handoff truth,
   not proof-hold

## Acceptance

- after N repeated proof failures on one identity, that identity enters a held
  state that survives process restart
- N is read from one resolved product-layer hold policy, not guessed by the
  CLI loop
- `gen-start` does not redispatch a held identity unless a lawful clear or
  override path occurs
- `gen-gaps` and live run status project the same held truth
- the held truth is replay-derived from canonical events and does not become a
  rival mutable run-state store
- the held state is cleared only by proof success, identity supersession, or
  an explicit scoped `reset` event over the held boundary
- `data_mapper.test35`-class runs do not spend 7 proof cycles on the same
  identity without an authoritative held state appearing
