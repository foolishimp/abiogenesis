# M03 Instruction Assembly Structural Carrier Diagram

**Ticket**: T-183
**Status**: Active design
**Date**: 2026-07-01
**Derived from**: [M03_INSTRUCTION_ASSEMBLY_DERIVATION.md](./M03_INSTRUCTION_ASSEMBLY_DERIVATION.md), [M03_INSTRUCTION_ASSEMBLY_FIRST_SLICE_IACS.md](./M03_INSTRUCTION_ASSEMBLY_FIRST_SLICE_IACS.md), [M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md), [M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md), [T-183](../../../../.ai-workspace/tickets/active/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md)

## Structural Relationships

```mermaid
classDiagram
  class GraphFunction {
    <<existing>>
    <<GTL>>
    +ref
    +vectors
  }
  class GraphVector {
    <<existing>>
    <<GTL>>
    +name
    +source
    +target
    +operators
    +evaluators
  }
  class NodeType {
    <<existing>>
    <<GTL>>
    +typeRef
    +assetSurface
  }
  class AssetSurface {
    <<existing>>
    <<GTL>>
    +outputContractRefs
    +rendererRefs
    +authoritySlots
    +proofObligationRefs
  }
  class RuntimeRegistryProjection {
    <<existing>>
    <<ABG>>
    +entries
    +selectedEntryRefs
  }
  class SemanticReviewGate {
    <<reused>>
    <<subordinate>>
    +gateRef
    +producerGraphFunctionRef
    +status
    +findingCount
  }
  class PromptAssetRow {
    <<reused>>
    <<subordinate>>
    +surfaceRef
    +assetSurface
    +renderedViewDigest
  }
  class InstructionAssemblyRule {
    <<subordinate>>
    +appliesToGraphFunctionRefs
    +appliesToVectorRefs
    +sectionRules
    +relevanceRules
    +compressionPolicyRef
    +proportionalityPolicyRef
    +runtimeBindingSlotClasses
  }
  class CompiledPromptPlan {
    <<prime>>
    <<authoritative>>
    +planRef
    +planDigest
    +sourceTrace
    +compilerDiagnostics
    +runtimeBindingSlots
  }
  class RuntimeBindingSlot {
    <<subordinate>>
    +slotClass
    +required
    +sourceTruthKind
  }
  class InstructionEnvelope {
    <<prime>>
    <<runtime-payload>>
    +envelopeRef
    +planRef
    +boundRuntimeRefs
    +responseContractRefs
  }
  class GovernedRendererBinding {
    <<subordinate>>
    +rendererRef
    +authorityDenied
  }
  class PromptManifest {
    <<prime>>
    <<replay>>
    +manifestRef
    +promptDigest
    +includedCarrierRefs
    +omittedCarrierRefs
    +gapRefs
  }
  class FpDispatchRequest {
    <<existing>>
    <<transport>>
    +dispatchRef
    +basisId
    +graphFunctionId
  }
  class ResponseAdmission {
    <<existing>>
    <<ABG>>
    +resultRef
    +admissionStatus
  }

  GraphFunction --> GraphVector : contains
  GraphVector --> NodeType : source and target typeRefs
  NodeType --> AssetSurface : carries
  RuntimeRegistryProjection --> InstructionAssemblyRule : selects admitted rule
  InstructionAssemblyRule --> CompiledPromptPlan : F_D compiles
  GraphFunction --> CompiledPromptPlan : source trace
  GraphVector --> CompiledPromptPlan : source trace
  NodeType --> CompiledPromptPlan : type coverage
  AssetSurface --> CompiledPromptPlan : contract/authority/proof/renderer derivation
  SemanticReviewGate --> CompiledPromptPlan : admitted evidence only
  PromptAssetRow --> CompiledPromptPlan : reused prompt asset law
  CompiledPromptPlan *-- RuntimeBindingSlot : declares slots
  CompiledPromptPlan --> InstructionEnvelope : runtime materializes
  RuntimeBindingSlot --> InstructionEnvelope : binds admitted/replay refs
  GovernedRendererBinding --> PromptManifest : renders envelope
  InstructionEnvelope --> PromptManifest : replay identity
  PromptManifest --> FpDispatchRequest : only when not P0
  FpDispatchRequest --> ResponseAdmission : worker output candidate
```

## Carrier Flow

```text
GTL graph/module/product declarations
  + product/system registry startup config
  + instruction assembly rules
        |
        v
ABG startup admission and registry projection
        |
        v
semantic compiler F_D checks over known algebras
        |
        +--> optional existing semantic review gate evidence
        |
        v
CompiledPromptPlan admitted or rejected
        |
        v
runtime graph call / vector / frame / selected function / replay truth
        |
        v
InstructionEnvelope materialized from declared slots
        |
        v
ABG-owned renderer or authority-denied governed renderer
        |
        v
PromptManifest emitted or projected
        |
        +--> P0: no F_P dispatch
        |
        v
F_P dispatch and response admission
```

## Visibility Split

| Surface | Downstream public? | ABG runtime internal? | Notes |
| --- | --- | --- | --- |
| Instruction assembly declaration | yes, as data declaration/config | consumed by ABG | No runtime authority. |
| Compiler acceptance/rejection | query/proof only | yes | ABG emits/admit projections. |
| Compiled prompt plan | read-only ref/proof surface | yes | Downstream cannot mint. |
| Runtime binding slot | no direct mutation | yes | Slots are compiled from plan and resolved from replay. |
| Instruction envelope | no | yes | Immutable pre-render runtime payload. |
| Renderer binding | data-only declaration when downstream supplied | yes | Delegated renderer must be authority-denied. |
| Prompt manifest | read-only replay surface | yes | Reconstructs digest and carrier decisions. |
| F_P dispatch | no direct downstream call | yes | Transport remains ABG-owned. |

## DMM Reading Notes

- `CompiledPromptPlan`, `InstructionEnvelope`, and `PromptManifest` are the
  only new prime carriers in this slice.
- `InstructionAssemblyRule`, `RuntimeBindingSlot`, `PromptCompilerDiagnostic`,
  and `GovernedRendererBinding` stay subordinate.
- `SemanticReviewGate` and `PromptAssetRow` are reused existing surfaces.
- This diagram is not a runtime registry diagram. Registry lookup and selection
  remain governed by T-177 surfaces.
- This diagram is not a response-admission diagram. Worker response truth
  remains governed by transport and response-contract admission.

