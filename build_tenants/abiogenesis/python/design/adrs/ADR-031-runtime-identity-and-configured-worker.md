# ADR-031 — Runtime Identity and Configured Worker Resolution

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-30
**Implements**: REQ-R-ABG2-WORKER, REQ-R-ABG2-PROVENANCE
**Scope**: `genesis/identity.py`, `genesis/services.py`, `genesis/interpret.py`, `genesis/cli_adapter.py`, `gen-install.py`

## Context

`ABG 1.0` collapsed runtime identity onto one legacy `build` string.

That created two related failures:

1. the CLI did not actually honour the configured `worker:` entry in the runtime contract, even though comments claimed it did;
2. `genesis gaps` reported stale `scope.build` identity such as `claude_code` even when the surrounding control plane had already selected a different worker/router/backend.

This was tolerable while ABG only served one local build style. It is not tolerable once product runtimes such as `gsdlc` resolve worker identity externally and need that truth preserved in ABG reporting and provenance.

## Decision

ABG now treats runtime identity as a first-class surface.

- `Worker` remains the concrete execution actor identity.
- runtime identity is a separate structured surface carrying:
  - `engine_id`
  - `build_id`
  - `worker_id`
  - `backend_id`
  - `authority_ref`
- `build` remains a reporting projection only; canonical runtime identity stays in the structured fields above.
- the CLI resolves the configured `worker:` symbol from the runtime contract and passes it explicitly into `Scope`.
- `Scope` and `TraversalRuntime` bind structured runtime identity to the resolved worker before reporting or dispatch.
- worker id is no longer re-synthesized from the legacy build string during traversal rewrites.

## Consequences

### Positive

- ABG now conforms to `REQ-R-ABG2-WORKER-003` and `REQ-R-ABG2-WORKER-005` more truthfully.
- runtime identity, worker identity, and backend identity can stay distinct in reporting and provenance.
- external control planes can supply worker truth without monkey-patching `Scope`.
- `genesis gaps` stops reporting a stale build default when a configured worker/router is present.

### Negative

- runtime contract authors now have one more explicit surface to understand.
- legacy callers that only inspect `scope.build` still receive a compatibility projection rather than the full runtime story.

## Non-Goals

- ABG still does not implement authentication or external authority resolution.
- ABG does not choose backend policy. It only preserves declared runtime identity when supplied.
