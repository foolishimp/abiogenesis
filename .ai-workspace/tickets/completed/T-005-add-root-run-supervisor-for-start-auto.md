# T-005 Add Root Run Supervisor For Start Auto

- id: T-005
- title: Add root run supervisor for `start --auto`
- type: feature
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Add a top-level supervisory capability around `genesis start --auto` for run-wide liveness, salvage, and recovery.
- change_class: design_reframe
- re_entry_point: design
- priority: high
- intake_source: ABG control-plane review after `data_mapper.test33`
- affected_boundary: ABG CLI/runtime control plane and top-level run supervision
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

Even before edge-local supervised dispatch exists, ABG would benefit from a
root-level supervisor that wraps `start --auto` and observes the whole run.

That root supervisor can provide:

- live run observation
- inactivity detection
- timeout salvage
- safe restart / resume

without changing every edge contract at once.

## Capability

This feature adds a first-class top-level run supervisor for:

- whole-run observation
- whole-run recovery
- safe resumption after transport failures

It is complementary to supervised per-edge dispatch, not a replacement.

## Acceptance

- ABG can run `start --auto` under a first-class supervised root control mode.
- The supervisor can detect stalled vs active runs.
- The supervisor can salvage valid result artifacts after worker transport
  failures.
- The supervisor can restart/resume lawfully without losing provenance.

## Links

- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/continuation.py`
