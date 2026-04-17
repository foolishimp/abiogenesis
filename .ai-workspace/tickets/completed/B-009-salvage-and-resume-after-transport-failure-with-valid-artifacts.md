# B-009 Salvage And Resume After Transport Failure With Valid Artifacts

- id: B-009
- title: Salvage and resume after transport failure with valid artifacts
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Allow ABG to salvage valid artifacts and resume lawfully after transport-level failure instead of always fail-closing the run.
- change_class: design_reframe
- re_entry_point: design
- priority: critical
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`
- affected_boundary: ABG continuation handling, transport failure recovery, and run resumption semantics
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

When `derive_code_surface` timed out in `data_mapper.test33`, ABG opened a
retry continuation but still emitted `run_failed` even though a valid result
artifact was already present.

The current continuation path is too weak for self-healing:

- continuation exists
- but salvage is not attempted
- and the run still terminalizes as failed

## Root Defect

ABG does not currently combine:

- transport failure classification
- artifact presence
- result validation
- lawful continuation/resumption

into one recovery path.

## Policy Boundary

This ticket is about lawful recovery from preserved probabilistic truth.

It is **not** a license for `F_D` to close probabilistic edges on its own.

The intended semantics are:

- a prior `F_P` attestation may be preserved
- `F_D` may verify whether that attestation is still ingestible
- ABG may re-ingest or resume from that already-attested result

The intended semantics are **not**:

- `F_D` infers a new probabilistic pass
- or ABG closes a probabilistic edge without preserved `F_P` result truth

## Acceptance

- On transport failure, ABG checks for salvageable valid artifacts before
  terminalizing the run.
- If a valid artifact exists, ABG can deterministically validate and ingest the
  preserved `F_P` result, then continue or complete.
- On a fresh `start --auto` re-entry, if a valid current already-attested `F_P`
  result exists for the edge, ABG must not redispatch `F_P`; it must validate
  and ingest that preserved result.
- If partial materialization exists without a valid artifact, ABG opens a
  recoverable continuation with explicit recovery state.
- Retry/resume preserves run and call provenance rather than creating
  misleadingly unrelated truth.
- Recovery never treats `F_D` as a substitute for missing probabilistic
  attestation.

## Dependencies

- related bug: B-005
- related bug: B-006
- related bug: B-007

## Links

- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test33/.ai-workspace/events/events.jsonl`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/continuation.py`
