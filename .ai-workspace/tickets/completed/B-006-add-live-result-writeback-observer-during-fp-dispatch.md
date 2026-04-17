# B-006 Add Live Result Writeback Observer During F_P Dispatch

- id: B-006
- title: Add live result writeback observer during F_P dispatch
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Make ABG observe the authoritative `result_path` during a live F_P turn instead of waiting until the subprocess exits successfully.
- change_class: design_reframe
- re_entry_point: design
- priority: high
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`
- affected_boundary: ABG F_P dispatch observability and result-ingest trigger model
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

The current dispatch path waits on the worker subprocess, then ingests
`result_path` only after a successful return.

There is no runtime observer watching:

- result-file creation
- result-file replacement
- valid JSON becoming available
- progress toward a closeable artifact

## Root Defect

ABG treats `result_path` as an end-of-turn artifact, not a live writeback
surface.

That means the runtime cannot:

- detect that a valid result already exists while the worker is still running
- close a graph call early when artifact truth is already available
- distinguish "worker silent but progressing" from "worker dead and no artifact"

## Acceptance

- F_P dispatch can observe `result_path` while the worker subprocess is live.
- The runtime can detect a valid result artifact before subprocess termination.
- Artifact detection is integrated with graph-call closure and failure
  classification.
- The observer is bounded and deterministic; it does not invent truth beyond
  the validated result artifact.

## Links

- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
