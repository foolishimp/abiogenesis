# M03 Traversal Non-Progress Continuation Derivation

**Status**: Active
**Date**: 2026-05-03
**Purpose**: Ratify T-106 as an ABG-owned derivation for a supervised `F_P`
actor attempt that produces no assessable output, and for the single
authoritative continuation action projected from that fact.

Retired sections: [history/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION__RETIRED_SECTIONS.md](history/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION__RETIRED_SECTIONS.md).

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `history/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md`
- `history/M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md`
- `history/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md`
- `history/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`
- [T-106](../../../../.ai-workspace/tickets/completed/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md)

## Timeout And Retry Mapping

The T-106 timeout class is narrower than the runtime failure taxonomy. It maps
before retry eligibility is computed:

| T-106 timeout class | Runtime failure class | Retry allowlist result |
|---|---|---|
| `inactivity_timeout` | `transport_failure`, carrying the inactivity timeout class | retryable by default |
| `hard_timeout` | `transport_failure` | retryable by default |
| `transport_exit` | `transport_failure` | retryable by default |
| deterministic payload/report rejection | `contract_failure` | retryable by default |

No timeout class maps to `no_output`. It classifies a worker process that ended
normally, without a timeout, with empty final output.

`runtime_unavailable`, `capability_missing`, `runtime_failure`, and
`payload_contract_failure` are not introduced by traversal no-progress. If they
appear from another runtime path, T-106 shall not silently coerce them into the
retry allowlist.

## Artifact Salvage Rule

Artifact and report admission happens before no-progress classification.

If a result artifact, admitted report, or declared progress signal exists for
the actor invocation, ABG must not assert traversal non-progress. The caller may
still later fail semantic closure, but that is an `F_P` result-evaluation or
domain proof question, not a no-output retry fact.

## Composition With T-129 Runtime Liveness

T-106 is not the global liveness loop. It classifies one supervised actor
attempt after ABG has already derived liveness, interruption, and artifact
salvage truth.

T-129 adds the broader observer surface:

```text
declared runtime system probes
  -> runtime_activity_probe_observed / runtime_external_interruption_observed
  -> RuntimeLivenessObserverProjection
  -> RuntimeInvocationDisposition
  -> T-106 non-progress only when no artifact/report/progress remains admissible
```

Probe adapters are effect boundaries. They observe stdout, stderr, PTY
transcript deltas, structured stream activity, heartbeats, event-sink appends,
archive writes, graph-call/frame movement, result artifacts, evaluator folds,
and scheduler state. They do not choose retry, continuation, traversal
movement, or closure.

The observer projection is replay-derived and substrate-neutral. It may later
feed or be fed by OpenTelemetry adapters, but the ABG law is the carrier
surface, not a telemetry backend.

If any declared probe reports activity inside the inactivity lease, the
disposition is `continue_waiting` unless artifact salvage, external
interruption, hard safety cap, or retry-budget exhaustion takes precedence. If
no alternate disposition applies, execution continues through replay-derived
graph progression.
