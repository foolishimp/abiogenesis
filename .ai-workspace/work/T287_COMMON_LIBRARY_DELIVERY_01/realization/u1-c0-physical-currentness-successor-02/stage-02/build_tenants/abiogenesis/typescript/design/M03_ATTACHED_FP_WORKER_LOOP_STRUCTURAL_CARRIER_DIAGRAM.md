# M03 Attached F_P Worker Loop Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-27
**Derived from**: [M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md](./M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md), [M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md](./M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md), [T-084](../../../../.ai-workspace/tickets/backlog/T-084-realize-abg-owned-fp-result-ingest-retry-and-continue-loop-for-attached-workers.md)

## Purpose

Render the attached F_P worker loop as one M03 carrier topology.

## Diagram

```mermaid
classDiagram

class ExecutionBasis {
  <<existing prime>>
}

class RuntimeEvent {
  <<existing prime>>
  <<authoritative>>
}

class RuntimeAggregateProjection {
  <<existing prime>>
  <<replay-derived>>
}

class AdvancementTransition {
  <<existing prime>>
}

class EnginePluginInput {
  <<existing prime>>
  +retryAttemptRefs
  +retryProgressRefs
}

class FpDispatchOutcome {
  <<existing outcome variant>>
  +attachedResultArtifact
}

class DispatchRequest {
  <<existing prime>>
}

class ResultArtifact {
  <<existing prime>>
}

class ResultIngestOutcome {
  <<existing prime>>
}

class AttachedFpResultDecision {
  <<new prime>>
}

class RetryRepairDecision {
  <<existing prime>>
}

class AssessedRuntimeEvent {
  <<RuntimeEvent variant>>
}

class RetryRepairEvent {
  <<RuntimeEvent variant>>
}

class RetryProgressRecordedEvent {
  <<RuntimeEvent variant>>
}

RuntimeAggregateProjection --> EnginePluginInput : derives retry state
ExecutionBasis --> AdvancementTransition : scopes
AdvancementTransition --> DispatchRequest : derives
EnginePluginInput --> FpDispatchOutcome : plugin effect
FpDispatchOutcome --> ResultArtifact : attached candidate
DispatchRequest --> ResultArtifact : admits against
ResultArtifact --> ResultIngestOutcome : ingests
ResultIngestOutcome --> AttachedFpResultDecision : classifies
AttachedFpResultDecision --> AssessedRuntimeEvent : accepted
AttachedFpResultDecision --> RetryRepairDecision : blocked
RetryRepairDecision --> RetryRepairEvent : emits
RetryRepairDecision --> RetryProgressRecordedEvent : records evidence
RuntimeEvent --> RuntimeAggregateProjection : replay
RuntimeAggregateProjection --> AdvancementTransition : next selection
```

## Reading Rules

- `AttachedFpResultDecision` is the only new prime carrier.
- It is runner-local engine law, not a plugin callback surface.
- `FpDispatchOutcome.attachedResultArtifact` is only a candidate payload.
- Retry and assessed facts remain members of `RuntimeEvent`.
- Re-entry is replay-derived through `RuntimeAggregateProjection`; it is not a
  controller-local attempt loop.

