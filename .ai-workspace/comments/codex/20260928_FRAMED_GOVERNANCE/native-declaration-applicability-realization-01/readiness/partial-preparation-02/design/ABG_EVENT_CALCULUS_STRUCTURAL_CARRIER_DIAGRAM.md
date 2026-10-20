# ABG Event Calculus Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-07
**Tickets**: T-120, T-121, T-122

```mermaid
classDiagram
  class RuntimeEvent {
    <<prime>>
    <<authoritative>>
    +kind
    +basisId
    +graphFunctionId
    +runId
    +workKey
    +causationEventRefs
    +correlationId
  }

  class RuntimeEventCalculusAxiom {
    <<prime>>
    <<authoritative>>
    +eventKind
    +deriveEffects()
  }

  class RuntimeEventCalculusEffect {
    <<prime>>
    <<authoritative>>
    +initiates
    +terminates
    +clips
    +declips
  }

  class RuntimeFluent {
    <<prime>>
    <<authoritative>>
    +name
    +scope
    +basisId
    +graphFunctionId
    +graphCallId
    +frameId
    +runId
    +workKey
    +vectorIndex
    +edge
    +continuationId
    +constraintRef
    +timerIntentRef
    +timerOutcomeRef
    +schedulePolicyRef
    +ref
  }

  class RuntimeFluentPattern {
    <<prime>>
    <<authoritative>>
    +name
    +scope
    +basisId
    +graphFunctionId
    +graphCallId
    +frameId
    +runId
    +workKey
    +vectorIndex
    +edge
    +continuationId
    +constraintRef
    +timerIntentRef
    +timerOutcomeRef
    +schedulePolicyRef
    +ref
  }

  class RuntimeDerivedFluentRule {
    <<prime>>
    <<authoritative>>
    +ruleRef
    +derive()
  }

  class RuntimeEventCalculusProjection {
    <<prime>>
    <<downstream>>
    +basisId
    +holds
    +effectRows
    +clippedFluentRefs
    +declippedPatternRefs
  }

  class RuntimeEventCalculusEffectRow {
    <<subordinate>>
    <<downstream>>
    +eventKind
    +initiates
    +terminates
    +clips
    +declips
  }

  class RuntimeAggregateProjection {
    <<downstream>>
    +closedVectorIndexes
    +nextVectorIndex
    +retryAttemptRefs
  }

  class TemporalProjection {
    <<downstream>>
    +eligibleRows
    +deadlineBreachRows
  }

  class ProviderReceipt {
    <<effect-edge>>
    <<subordinate>>
    -providerReceiptRef
  }

  class ProductPolicy {
    <<subordinate>>
    -policyRef
  }

  RuntimeEvent --> RuntimeEventCalculusAxiom : event kind
  RuntimeEventCalculusAxiom --> RuntimeEventCalculusEffect : derives
  RuntimeEventCalculusEffect *-- RuntimeFluent : initiates/terminates
  RuntimeEventCalculusEffect *-- RuntimeFluentPattern : clips/declips
  RuntimeDerivedFluentRule --> RuntimeFluent : derives
  RuntimeEventCalculusProjection *-- RuntimeEventCalculusEffectRow
  RuntimeEventCalculusProjection *-- RuntimeFluent : HoldsAt
  RuntimeAggregateProjection --> RuntimeEventCalculusProjection
  TemporalProjection --> RuntimeEventCalculusProjection
  RuntimeEvent --> ProviderReceipt : admitted payload only
  RuntimeEvent --> ProductPolicy : admitted ref only
```

## Boundary Notes

`RuntimeEvent` is the admitted happened-fact carrier. `RuntimeEventCalculusAxiom`
declares event-kind effects, and `RuntimeEventCalculusProjection` derives
`HoldsAt` read-model truth. Downstream projections consume that truth; they do
not become event emitters or graph iterators.

Provider receipts and product policy are subordinate payload refs on admitted
events or projection inputs. They do not authorize runtime truth without ABG
event admission.
