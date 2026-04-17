# B-005 Preserve Valid F_P Results When Transport Times Out

- id: B-005
- title: Preserve valid F_P results when transport times out
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Ensure ABG treats a valid result artifact as authoritative completion evidence even when the worker subprocess crosses the transport timeout boundary.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: critical
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`
- affected_boundary: ABG F_P transport classification, result authority, and graph-call closure semantics
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

In `data_mapper.test33`, the `derive_code_surface` worker wrote a valid passing
result file at:

- `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/fp_results/derive_code_surface_20260416T175334920230Z.json`

That artifact records `pass` for both:

- `code_traceability_present`
- `code_surface_semantically_converged`

But ABG still emitted:

- `worker_turn_failed`
- `graph_call_failed`
- `run_failed`

with `failure_class = transport_failure` after the fixed 30-minute timeout.

## Root Defect

Transport timeout currently outranks manifest/result truth.

`genesis.transport.classify_failure(...)` returns `transport_failure` as soon as
`result.timed_out` is true, before consulting `result_path`.

That means:

- a valid F_P artifact can exist
- the runtime can already have enough evidence to close the call
- but the run still fail-closes on transport timing alone

## Why This Bug Matters

This is not just a convenience issue.

For governed long-running work, timeout must not erase already-produced valid
attestation truth. Otherwise ABG becomes unable to distinguish:

- "the worker never finished"
- "the worker finished but the transport contract expired"

That uncertainty is unacceptable for high-assurance workflows.

## Policy Boundary

This ticket does **not** authorize `F_D` to replace missing probabilistic
attestation.

The lawful correction is:

- `F_P` remains the source of constructive probabilistic attestation
- `F_D` may validate that an already-written result artifact is structurally
  admissible for ingest
- ABG may then ingest the preserved `F_P` attestation instead of treating the
  timeout as final truth

The unlawful version would be:

- `F_D` re-derives semantic success by itself
- or ABG closes an edge without preserved `F_P` attestation

## Acceptance

- A valid, schema-conformant `result_path` artifact can rescue a timed-out F_P
  dispatch.
- Rescue requires deterministic validation of the preserved artifact,
  including:
  - schema-valid payload
  - manifest/spec compatibility
  - all declared evaluators resolved in the result
- `transport_failure` is not emitted when a valid result artifact is already
  present and ingestible.
- Graph-call and run closure use the preserved `F_P` artifact truth if it is
  present and valid.
- The runtime does not allow `F_D` to substitute for missing `F_P`
  attestation.
- The runtime still fail-closes when timeout occurs and no valid artifact exists.

## Links

- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/events/events.jsonl`
- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/fp_results/derive_code_surface_20260416T175334920230Z.json`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
