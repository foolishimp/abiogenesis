# M03 Supervised Actor Invocation Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md](./M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md), [M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md](./M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md), [T-087](../../../../.ai-workspace/tickets/completed/T-087-restore-typescript-abg-supervised-actor-invocation-over-one-fp-dispatch.md)

## Purpose

Render the supervised actor invocation as one explicit `M03` runtime carrier
topology.

## Diagram

```mermaid
classDiagram

class ExecutionBasis {
  <<existing prime>>
}

class RuntimeAggregateProjection {
  <<existing prime>>
  <<replay-derived>>
}

class FpDispatchTransition {
  <<existing transition>>
}

class DispatchRequest {
  <<existing prime>>
}

class ActorInvocation {
  <<new prime>>
  +actorInvocationId
  +attemptIndex
  +dispatchRef
  +workerId
  +backendId
  +resultRef
}

class EnginePluginInput {
  <<existing prime>>
  +actorInvocationRef
}

class FpDispatchOutcome {
  <<existing outcome variant>>
  +attachedResultArtifact
}

class ActorInvocationStartedEvent {
  <<RuntimeEvent variant>>
}

class ActorResultArtifactObservedEvent {
  <<RuntimeEvent variant>>
}

class ActorInvocationClosedEvent {
  <<RuntimeEvent variant>>
}

class ResultArtifact {
  <<existing prime>>
}

class ResultIngestOutcome {
  <<existing prime>>
}

class AttachedFpResultDecision {
  <<existing prime>>
}

class RuntimeEvent {
  <<existing prime>>
  <<authoritative>>
}

ExecutionBasis --> FpDispatchTransition : scopes
RuntimeAggregateProjection --> ActorInvocation : derives attempt index
FpDispatchTransition --> DispatchRequest : derives
DispatchRequest --> ActorInvocation : binds
ActorInvocation --> ActorInvocationStartedEvent : emits start
ActorInvocation --> EnginePluginInput : invocation ref
EnginePluginInput --> FpDispatchOutcome : plugin effect
FpDispatchOutcome --> ActorResultArtifactObservedEvent : candidate observed
FpDispatchOutcome --> ActorInvocationClosedEvent : classified closure
FpDispatchOutcome --> ResultArtifact : candidate payload
DispatchRequest --> ResultArtifact : admits against
ResultArtifact --> ResultIngestOutcome : ingests
ResultIngestOutcome --> AttachedFpResultDecision : classifies
ActorInvocationStartedEvent --> RuntimeEvent : member
ActorResultArtifactObservedEvent --> RuntimeEvent : member
ActorInvocationClosedEvent --> RuntimeEvent : member
RuntimeEvent --> RuntimeAggregateProjection : replay
```

## Reading Rules

- `ActorInvocation` is the only new prime carrier in this slice.
- Actor events are runtime facts derived from that carrier.
- `ActorInvocation` binds the effect boundary. It does not own domain meaning.
- `ActorResultArtifactObservedEvent` records observation, not acceptance.
- Acceptance still requires `ResultArtifact` admission and ingest.
- Retry remains replay-derived through existing retry and projection carriers.

