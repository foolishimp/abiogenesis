# ADR-031 — Runtime Identity and Configured Worker Resolution

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-30
**Implements**: REQ-R-ABG3-WORKER, REQ-R-ABG3-PROVENANCE
**Scope**: `genesis/identity.py`, `genesis/services.py`, `genesis/interpret.py`, `genesis/cli_adapter.py`, `gen-install.py`

## Context

Runtime identity must remain structured. A single `build` string is not sufficient runtime truth.

That created two related failures:

1. the CLI did not actually honour the configured `worker:` entry in the runtime contract, even though comments claimed it did;
2. `genesis gaps` reported `scope.build` values that did not match the surrounding control-plane worker/router/backend selection.

Product runtimes such as `gsdlc` resolve worker identity externally and need that truth preserved in ABG reporting and provenance.

## Decision

ABG now treats runtime identity as a first-class surface.

- `Worker` remains the concrete execution actor identity.
- runtime identity is a separate structured surface carrying:
  - `engine_id`
  - `build_id`
  - `worker_id`
  - `backend_id`
  - `authority_ref`
  - `assignment_source`
  - `resolved_runtime_ref`
- `build` remains a reporting projection only and mirrors explicit `build_id` when declared.
- `build` is not synthesized from `worker_id` or `engine_id`.
- when no explicit worker binding is supplied, default worker derivation uses
  canonical execution identity (`runtime_identity.worker_id` or `engine_id`)
  and does not consult reporting metadata.
- the CLI resolves the configured `worker:` symbol from the runtime contract and passes it explicitly into `Scope`.
- the CLI resolves structured runtime identity from the canonical `runtime_*`
  contract keys rather than from unprefixed flat aliases.
- `Scope` and `TraversalRuntime` bind structured runtime identity to the resolved worker before reporting or dispatch.
- worker id is no longer re-synthesized from a build fallback during traversal rewrites.

## Consequences

### Positive

- ABG now conforms to `REQ-R-ABG3-WORKER-003` and `REQ-R-ABG3-WORKER-005` more truthfully.
- runtime identity, worker identity, and backend identity can stay distinct in reporting and provenance.
- external control planes can supply worker truth without monkey-patching `Scope`.
- `genesis gaps` stops reporting a stale build default when no explicit build metadata was declared.

### Negative

- runtime contract authors now have one more explicit surface to understand.
- callers that need reporting metadata must declare `runtime_build` explicitly or consume canonical runtime identity directly.

## Non-Goals

- ABG still does not implement authentication or external authority resolution.
- ABG does not choose backend policy. It only preserves declared runtime identity when supplied.
