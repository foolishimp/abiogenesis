# M03 Supervised Actor Invocation First Slice IACS

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md](./M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md), [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md), [M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md](./M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md), [T-087](../../../../.ai-workspace/tickets/completed/T-087-restore-typescript-abg-supervised-actor-invocation-over-one-fp-dispatch.md)

## Purpose

Declare the first TypeScript `M03` supervised actor invocation carrier
inventory before implementation.

## Boundary

This slice is:

- `M03-engine-kernel`
- below public `M04` start compatibility
- over existing F_P dispatch, transport, result ingest, attached F_P loop,
  retry, and projection law
- generic over downstream domains
- bounded to one actor invocation for one F_P dispatch attempt

This slice is not:

- a downstream odd_sdlc runner
- a long-lived agent session model
- a public command grammar change
- a domain proof heuristic
- a replacement for `DispatchRequest`, `ResultArtifact`, or
  `ResultIngestOutcome`

## Upstream Authoritative Carriers Consumed

- `ExecutionBasis`
- `RuntimeAggregateProjection`
- `FpDispatchTransition`
- `DispatchRequest`
- `EnginePluginInput`
- `FpDispatchOutcome`
- `ResultArtifact`
- `ResultIngestOutcome`
- `RetryRepairDecision`

## Irreducible Architectural Carrier Set

This slice introduces one prime runtime carrier:

1. `ActorInvocation`

It introduces three runtime event variants:

1. `actor_invocation_started`
2. `actor_result_artifact_observed`
3. `actor_invocation_closed`

`ActorInvocation` is prime because it is the first explicit ABG-owned identity
for the supervised effect boundary around one probabilistic dispatch attempt.
The event variants are subordinate runtime event facts emitted from that prime
carrier.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `ActorInvocation` | `M03-engine-kernel` | bind one dispatch attempt to one supervised actor effect | derived from basis, projection, transition, and dispatch request | F_P dispatch plugin receives one invocation-scoped input | runtime events, projection, diagnostics |
| `ActorInvocationStartedEvent` | `M03-engine-kernel` | replay-visible actor start truth | `constructActorInvocationStartedEvent(...)` | event sink | projection, diagnostics |
| `ActorResultArtifactObservedEvent` | `M03-engine-kernel` | replay-visible candidate artifact observation | `constructActorResultArtifactObservedEvent(...)` | event sink | projection, retry/recovery diagnostics |
| `ActorInvocationClosedEvent` | `M03-engine-kernel` | replay-visible actor closure/failure classification | `constructActorInvocationClosedEvent(...)` | event sink | projection, live status, diagnostics |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| actor attempt index | subordinate | identity detail inside `ActorInvocation` | derived from replay retry attempts for the vector |
| observed artifact ref | subordinate | candidate observation detail, not acceptance | admitted later as `ResultArtifact` |
| actor closure status | subordinate | event classification over one invocation | derived from admitted F_P outcome and artifact availability |
| transport detail | subordinate | failure detail under actor closure | cannot become domain truth |

## One-To-One Law

- One `ActorInvocation` wraps one F_P dispatch attempt.
- Same-edge retry creates a fresh `ActorInvocation`.
- A prior `ActorInvocation` may appear only as replay evidence for later
  attempts.
- One actor invocation shall not contain multiple graph-vector traversals.

## Selection And Closure Rules

- ABG derives `ActorInvocation` after `DispatchRequest` and before F_P plugin
  dispatch.
- ABG emits `actor_invocation_started` before invoking the effect plugin.
- If the plugin returns a candidate artifact, ABG emits
  `actor_result_artifact_observed` before artifact admission.
- If the plugin reports blocked transport with a candidate artifact, ABG still
  admits the artifact against the original `DispatchRequest`.
- If the candidate artifact is valid and fulfilled, ABG may emit assessed
  truth and close the vector.
- If the candidate artifact is missing, malformed, wrong-boundary, runtime
  failed, or not fulfilled, ABG emits blocked evaluation and retry/stop truth
  through existing retry law.
- ABG emits `actor_invocation_closed` after artifact admission or after
  no-artifact transport block classification.

## Fail-Closed Rules

- F_P plugin output cannot provide `actorInvocationId`, runtime events, next
  vector, closure, retry, or projection authority.
- Actor invocation identity is derived by ABG, not supplied by the plugin.
- Actor stdout, stderr, and transport logs are evidence only.
- Candidate artifact observation does not equal result acceptance.
- A blocked transport outcome with no candidate artifact stops as a runtime gap
  or external dispatch-required truth according to the existing runner path.

## Module-Derived Test Map

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| one-to-one identity | one-to-one law | each F_P dispatch attempt emits one distinct actor invocation |
| blocked-with-artifact salvage | selection rules | blocked actor outcome with valid artifact can be admitted and close the vector |
| invalid artifact retry | fail-closed rules | wrong-boundary candidate becomes retry-visible gap/failure truth |
| authority rejection | fail-closed rules | plugin cannot supply actor/runtime authority |
| projection evidence | event variants | projection exposes actor invocation refs and observed artifact refs |

## Non-Closure Conditions

- actor supervision exists only in downstream product code
- actor invocation identity is an unprojected local variable
- candidate artifact salvage happens outside `ResultArtifact` admission
- retry is decided by the actor process or caller-local loop
- tests prove only an attempt counter without actor event/projection truth

