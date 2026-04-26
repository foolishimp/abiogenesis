# M03/M04 Plugin Contract Model Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md](./M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md), [M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md](./M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md), [T-072](../../.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md)

## Purpose

Render the TypeScript ABG plugin boundary as one module-bounded carrier topology.

The diagram keeps ABG engine authority separate from plugin implementation scope.

## Diagram

```mermaid
classDiagram

class ExecutionBasis {
  <<existing prime>>
  <<authoritative>>
}

class RuntimeAggregateProjection {
  <<existing prime>>
  <<replay-derived>>
}

class IterationAdvanceDecision {
  <<existing prime>>
  <<authoritative>>
}

class EnginePluginContract {
  <<prime>>
  <<authoritative>>
  +ref
  +kind
  +authority
  +maySelectNextVector=false
  +mayEmitRuntimeEvents=false
  +mayCloseTraversal=false
}

class EnginePluginInventoryEntry {
  <<read-model>>
  +runtimeBindingStatus
  +proofScope
}

class EnginePluginInput {
  <<prime>>
  <<authoritative>>
  +basisId
  +vectorIndex
  +edge
  +projectionRef
}

class EnginePluginOutcome {
  <<prime>>
  <<authoritative>>
  +kind
  +status
}

class FdEvaluationOutcome {
  <<outcome variant>>
  +status
}

class FpDispatchOutcome {
  <<outcome variant>>
  +status
  +resultRef
}

class FhAdmissionOutcome {
  <<outcome variant>>
  +status
  +approvalSubjectRef
}

class RuntimeEventSinkPlugin {
  <<sink>>
  <<effect-edge>>
}

class ProviderPlugin {
  <<provider>>
  <<effect-edge>>
}

class ResolverPlugin {
  <<resolver>>
  <<effect-edge>>
}

class ProjectionConsumer {
  <<downstream>>
  <<projection>>
}

class HookRef {
  <<declaration-ref>>
  <<downstream>>
}

class PluginForbiddenAuthorityFields {
  <<subordinate>>
  -runtimeEvents
  -nextVectorIndex
  -closedVectorIndexes
  -transition
}

class AbgIterateRunner {
  <<authoritative>>
  +selects next vector
  +admits plugin output
  +emits runtime events
  +projects public outcome
}

EnginePluginContract *-- EnginePluginInput
EnginePluginInput --> ExecutionBasis : derived from
EnginePluginInput --> RuntimeAggregateProjection : derived from
EnginePluginInput --> IterationAdvanceDecision : derived from

EnginePluginOutcome <|-- FdEvaluationOutcome
EnginePluginOutcome <|-- FpDispatchOutcome
EnginePluginOutcome <|-- FhAdmissionOutcome
EnginePluginOutcome *-- PluginForbiddenAuthorityFields : rejects

RuntimeEventSinkPlugin --|> EnginePluginContract
ProviderPlugin --|> EnginePluginContract
ResolverPlugin --|> EnginePluginContract
ProjectionConsumer --|> EnginePluginContract
HookRef --|> EnginePluginContract

AbgIterateRunner --> EnginePluginContract : admits
AbgIterateRunner --> EnginePluginInput : constructs
AbgIterateRunner --> EnginePluginOutcome : admits
AbgIterateRunner --> IterationAdvanceDecision : owns
EnginePluginInventoryEntry --> EnginePluginContract : classifies

EnginePluginOutcome ..> AbgIterateRunner : cannot select or emit
```

## Boundary Review

- `EnginePluginContract`, `EnginePluginInput`, and `EnginePluginOutcome` are the
  only new prime families.
- seam-specific details stay as outcome variants or subordinate payloads.
- sink/provider/resolver/projection/declaration roles are classifications inside
  one contract model, not separate framework authority surfaces.
- `EnginePluginInventoryEntry` distinguishes runner-consumed seams from
  classified-only hook families so classification does not overclaim runtime
  migration.
- `AbgIterateRunner` owns selection, event emission, closure, retry,
  continuation, and terminal projection.
