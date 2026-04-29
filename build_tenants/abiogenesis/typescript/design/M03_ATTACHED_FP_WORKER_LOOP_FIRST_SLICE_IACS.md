# M03 Attached F_P Worker Loop First Slice IACS

**Status**: Active
**Date**: 2026-04-27
**Derived from**: [M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md](./M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md](./M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md), [M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md](./M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md), [T-084](../../../../.ai-workspace/tickets/backlog/T-084-realize-abg-owned-fp-result-ingest-retry-and-continue-loop-for-attached-workers.md)

## Purpose

Declare the first TypeScript attached F_P worker loop carrier inventory before
implementation.

## Boundary

This slice is:

- `M03-engine-kernel`
- below public `M04` start compatibility
- over existing F_P dispatch, result-ingest, retry-repair, continuation, and
  projection law
- generic over downstream domains
- bounded to one graph-function execution path

This slice is not:

- a downstream odd_sdlc runner
- a live worker implementation
- a public command grammar change
- a domain proof heuristic
- a replacement for existing external dispatch/yield behavior

## Upstream Authoritative Carriers Consumed

- `ExecutionBasis`
- `AdvancementTransition`
- `RuntimeEvent`
- `RuntimeAggregateProjection`
- `EnginePluginInput`
- `FpDispatchOutcome`
- `DispatchRequest`
- `ResultArtifact`
- `ResultIngestOutcome`
- `RetryRepairDecision`

## Irreducible Architectural Carrier Set

This slice introduces one prime runner-local decision family:

1. `AttachedFpResultDecision`

The decision is prime because it is the first carrier that binds an attached
F_P result to ABG-owned closure, retry, continuation, and re-entry law.

The slice extends existing carriers but does not create another runtime truth
surface:

- `FpDispatchOutcome.attachedResultArtifact`
- `RuntimeAggregateProjection.retryProgressRefs`
- `EnginePluginInput.retryAttemptRefs`
- `EnginePluginInput.retryProgressRefs`

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `AttachedFpResultDecision` | `M03-engine-kernel` | classify an attached result as accepted, retry-planned, stopped, or escalated | runner-owned result ingest and fulfillment evaluation | runtime event emission | runner, public start projection |
| `FpDispatchOutcome.attachedResultArtifact` | `M03-engine-kernel` plugin outcome variant | optional raw worker result returned by an attached worker | `admitFpDispatchOutcome` then `admitResultArtifact` | none | attached F_P loop |
| `RuntimeAggregateProjection.retryProgressRefs` | `M03-engine-kernel` | replay-visible blocked-attempt evidence | replay of `retry_progress_recorded` | none | next plugin input, diagnostics |
| `EnginePluginInput.retryAttemptRefs` | `M03-engine-kernel` | current retry state handed to worker effect plugin | projection-derived | plugin call | F_P dispatch plugin |
| `EnginePluginInput.retryProgressRefs` | `M03-engine-kernel` | current blocked evidence handed to worker effect plugin | projection-derived | plugin call | F_P dispatch plugin |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| attached raw artifact | subordinate | plugin effect output candidate only | admitted as `ResultArtifact` before use |
| fulfillment block reason | subordinate | evidence detail inside admitted artifact | converted to progress-signal refs |
| attached manifest id | subordinate | retry/provenance identity inside event payloads | deterministic from dispatch/result/retry truth |
| attached ledger ref | subordinate | assessed-event provenance ref | deterministic from dispatch/result truth |

## Selection And Closure Rules

- If F_P dispatch returns no attached artifact, the runner stops with
  dispatch-required truth exactly as before.
- If F_P dispatch returns an attached artifact, only ABG may admit it.
- Identity mismatch, runtime failure, missing payload, or non-fulfilled
  fulfillment status blocks the vector.
- A blocked vector emits blocked evaluation truth and then retry-repair truth.
- Planned retry events are replayed before the same vector is re-entered.
- The next F_P plugin input carries retry attempts and retry progress from
  replay.
- A fulfilled attached artifact emits `assessed` truth.
- `assessed` truth closes the vector by replay projection.
- When `until = converged`, the runner continues to the replay-selected next
  vector.

## Fail-Closed Rules

- Plugin output with runtime events, closure fields, transition fields, or
  next-vector fields is rejected before it can affect runtime truth.
- A plugin may provide an artifact candidate but cannot make it accepted.
- A blocked artifact cannot emit `assessed`.
- A retry cannot reuse a stale manifest id.
- A caller-local loop counter cannot decide retry budget.
- A downstream product cannot close a vector by owning postflight status.

## Module-Derived Test Map

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| attached positive loop | selection rules | one blocked attached result plans retry, next call receives retry state, later accepted result closes and continues |
| public start proof | boundary | `start(...)` can converge an attached F_P graph without caller loop |
| external dispatch preservation | boundary | no attached artifact still stops as dispatch-required |
| forbidden authority negative | fail-closed rules | F_P plugin output with event/vector authority is rejected |
| rejected artifact negative | fail-closed rules | wrong-edge attached artifact cannot close a vector |

## Non-Closure Conditions

- proof requires a caller-local `while` loop around public start
- retry facts are emitted by downstream product code
- plugin output can select a vector or close traversal
- stateful retry is simulated only by an attempt counter hidden in the test
- accepted attached F_P result stops at dispatch instead of continuing under
  `until = converged`

