# M03 ABG.Fn Composition Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Derived from**: [M03_ABG_FN_COMPOSITION_DERIVATION.md](./M03_ABG_FN_COMPOSITION_DERIVATION.md), [M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md](./M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md)

## Purpose

Show the design-method carrier boundary for ABG.Fn composition: host-bound
composition contracts, selected regime authority, context identity,
carrier/assurance binding, deterministic closure, deferred optimization, and
downstream replay projection.

## Structural Carrier Diagram

```mermaid
classDiagram
  class GraphVector {
    <<M01 authoritative declaration carrier>>
    +declarations
    +id
  }
  class GraphFunction {
    <<M01 default declaration carrier>>
    +declarations
    +id
  }
  class Job {
    <<M02 policy default carrier>>
    +policyHooks
    +id
  }
  class Role {
    <<M02 policy default carrier>>
    +policyHooks
    +id
  }
  class Module {
    <<M02 policy default carrier>>
    +policyHooks
    +name
  }
  class ABGFnCompositionContract {
    <<prime authoritative>>
    +contractRef
    +contractDigest
    +kind
    +version
  }
  class ABGFnCompositionSelection {
    <<prime authoritative>>
    +selectionRef
    +sourceKind
    +sourceRef
    +contractRef
    +contractDigest
  }
  class ABGFnHostBinding {
    <<prime authoritative>>
    +graphFunctionRef
    +graphVectorRef
    +evaluatorRef
    +ruleRef
    +operatorRef
    +sourceNodeRefs
    +targetNodeRef
    +targetSchemaRef
  }
  class ABGFnRegimeBinding {
    <<prime authoritative>>
    +regime
    +role
    +authority
    +order
    +inputCarrierRefs
    +outputCarrierRefs
    +evidenceRefs
    +consumedFieldRefs
  }
  class ABGFnContextBinding {
    <<prime authoritative>>
    +standardsRefs
    +requirementRefs
    +designRefs
    +policyRefs
    +replayPolicyRef
  }
  class ABGFnCarrierBinding {
    <<prime authoritative>>
    +sourceCarrierRefs
    +targetCarrierRef
    +targetCarrierContractRef
    +targetCarrierContractDigest
    +payloadLedgerProjectionRef
    +closurePreconditionRefs
  }
  class ABGFnAssuranceBinding {
    <<prime authoritative>>
    +edgeAssuranceContractRef
    +edgeAssuranceContractDigest
    +requiredEvidenceRefs
    +assuranceProjectionRef
    +assuranceClosureDecisionRef
  }
  class ABGFnClosureContract {
    <<prime authoritative>>
    +closureFunctionRef
    +closureRegime
    +requiredEvidenceRefs
    +rejectionEvidenceRefs
    +replayProjectionRef
    +closureEventKindRef
  }
  class ABGFnOptimizationContract {
    <<prime deferred>>
    +sourceCompositionRef
    +sourceCompositionDigest
    +deterministicReplacementRef
    +positiveEquivalenceCaseRefs
    +negativeEquivalenceCaseRefs
    +equivalenceProjectionRef
    +invalidationPolicyRef
  }
  class ABGFnCompositionProjection {
    <<downstream projection>>
    +projectionRef
    +selectionRef
    +contractRef
    +contractDigest
    +regimeStatus
    +carrierStatus
    +assuranceStatus
    +closureStatus
  }
  class ABGFnCompositionReadModel {
    <<downstream-only read model>>
    +projectionRef
    +contractRef
    +status
    +diagnosticRefs
  }

  GraphVector --> ABGFnCompositionSelection : highest precedence declaration
  GraphFunction --> ABGFnCompositionSelection : lower precedence default
  Job --> ABGFnCompositionSelection : lower precedence default
  Role --> ABGFnCompositionSelection : lower precedence default
  Module --> ABGFnCompositionSelection : lower precedence default
  ABGFnCompositionSelection *-- ABGFnCompositionContract : selected contract
  ABGFnCompositionContract *-- ABGFnHostBinding : owns
  ABGFnCompositionContract *-- ABGFnRegimeBinding : ordered regime bindings
  ABGFnCompositionContract *-- ABGFnContextBinding : standards and policy
  ABGFnCompositionContract *-- ABGFnCarrierBinding : payload and target carrier
  ABGFnCompositionContract *-- ABGFnAssuranceBinding : assurance context
  ABGFnCompositionContract *-- ABGFnClosureContract : F_D closure predicate
  ABGFnCompositionContract *-- ABGFnOptimizationContract : deferred optimization
  ABGFnCompositionSelection --> ABGFnCompositionProjection : replay input
  ABGFnRegimeBinding --> ABGFnCompositionProjection : regime status
  ABGFnCarrierBinding --> ABGFnCompositionProjection : carrier status
  ABGFnAssuranceBinding --> ABGFnCompositionProjection : assurance status
  ABGFnClosureContract --> ABGFnCompositionProjection : closure status
  ABGFnCompositionProjection --> ABGFnCompositionReadModel : report projection
```

## Functional Reading

- Declaration carriers are immutable GTL inputs to composition selection.
- `ABGFnCompositionSelection` is replay-visible precedence truth.
- `ABGFnCompositionContract` is the identity-bearing carrier. Removing it must
  make closure fail closed rather than silently reconstructing regime law.
- Host, regime, context, carrier, assurance, and closure bindings are owned
  subordinate composition of the prime contract, but they remain prime carrier
  families because dependent tickets consume them independently.
- `ABGFnOptimizationContract` is deferred but remains a prime boundary for
  lawful F_P-to-F_D replacement.
- `ABGFnCompositionProjection` is a read-side projection over admitted contract,
  event, carrier, assurance, and closure truth. It is not worker output.
- `ABGFnCompositionReadModel` is report/query shape only.

## Sign-Off Claim

This design is lawful only if implementation preserves the selected
composition identity through parser admission, host binding, payload ledger
projection, assurance projection, runner routing, and closure. F_P and F_H
outputs may supply evidence, but only an F_D closure predicate under the
selected composition identity may close.
