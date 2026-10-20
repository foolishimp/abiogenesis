# M03 Supervised Actor Invocation Derivation

**Status**: Active
**Date**: 2026-04-29
**Purpose**: Derive the TypeScript `M03` actor-invocation runtime slice from
ABG transport law so the actor supervising one probabilistic dispatch is a
governed ABG surface, not hidden downstream orchestration.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-WORKER.md`
- `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md`
- [T-087](../../../../.ai-workspace/tickets/completed/T-087-restore-typescript-abg-supervised-actor-invocation-over-one-fp-dispatch.md)

## Position

ABG owns the boundary around one probabilistic traversal. That boundary
includes the effect that invokes an agentic worker.

The actor invocation is not the worker's hidden reasoning path. It is the
runtime wrapper that binds one admitted `DispatchRequest` to one F_P attempt,
supervises progress and result-artifact observation, and returns only
admissible candidate result truth to ABG.

## Historical Capability Retained

The Python reference line made this behavior visible through supervised
subprocess transport, result writeback observation, progress lease behavior,
and result ingest. The TypeScript line keeps the capability but makes the
carrier boundary explicit:

- one `ActorInvocation` per F_P dispatch attempt
- actor start is runtime event truth
- result-artifact observation is runtime event truth
- actor closure or failure is runtime event truth
- result admission remains through `ResultArtifact` and `ResultIngestOutcome`
- retry and re-entry remain ABG event calculus

## TypeScript Target

The `M03` runner derives an `ActorInvocation` from:

- `ExecutionBasis`
- current replay projection
- `FpDispatchTransition`
- `DispatchRequest`

The runner emits actor invocation start before it calls the F_P effect plugin.
If the plugin returns a candidate artifact, the runner emits observation truth
and admits that artifact against the original dispatch request. If the plugin
reports blocked transport but still provides a candidate artifact, ABG still
attempts deterministic artifact admission. Valid artifact truth may close the
vector; invalid artifact truth becomes retry-visible failure/gap truth.

## Non-Goals

- No downstream product-specific runner.
- No long-lived agent session model.
- No actor-owned graph retry or next-vector selection.
- No actor-emitted runtime events.
- No semantic authority from stdout, stderr, or transport logs.
- No change to GTL graph-function semantics.

