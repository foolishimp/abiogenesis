# M03 Edge Assurance Contract Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-13
**Derived from**: [M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md](./M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md), [M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md](./M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md)

## Purpose

Show the carrier boundary for declared GTL edge assurance, recorded F_P hook
actions, admitted findings, and downstream assurance projection.

## Structural Carrier Diagram

```mermaid
classDiagram
  class GraphVector {
    <<M01 authoritative declaration carrier>>
    declarations
    id
  }
  class GraphFunction {
    <<M01 default declaration carrier>>
    declarations
    id
  }
  class Job {
    <<M02 policy default carrier>>
    policyHooks
    id
  }
  class Role {
    <<M02 policy default carrier>>
    policyHooks
    id
  }
  class Module {
    <<M02 policy default carrier>>
    policyHooks
    name
  }
  class EdgeAssuranceContract {
    <<M03 authoritative contract>>
    hookRef
    targetOutcomeRef
    authoritySurfaceRefs
    targetObligationBindingRefs
    transformFpContractRef
    evalFpContractRef
    gainReportSchemaRef
    metricFunctionRef
    closeDecisionSchemaRef
    residualPressureSchemaRef
    continuationSchemaRef
    compositionLawRef
    configDigest
  }
  class EdgeAssuranceContractSelection {
    <<M03 authoritative selection>>
    selectionRef
    source
    sourceRef
    attrKey
    defaultKey
  }
  class EdgeAssuranceAbsentiaResolution {
    <<M03 authoritative absentia resolution>>
    disposition
    reason
    edgeRef
    requiredHumanActionRefs
    replayVisibilityRef
  }
  class HookActionRecord {
    <<M03 authoritative hook action record>>
    hookActionRef
    hookClass
    pluginRef
    inputBasisRefs
    policyRefs
    configRefs
    returnedFindingRefs
    admissionRefs
    predecessorRefs
    outputSurfaceRef
  }
  class FpEdgeAssuranceEvalFinding {
    <<F_P returned/admitted finding>>
    findingRef
    hookActionRef
    edgeAssuranceSelectionRef
    evalFpContractRef
    gainReportRef
    metricRefs
    closeDisposition
    residualPressureRefs
    continuationRefs
    evidenceRefs
    authorityRefs
    compositionContributionRef
  }
  class HookFindingAdmission {
    <<M03 authoritative admission>>
    admissionRef
    hookActionRef
    findingRef
    status
    owningSurfaceRef
    evidenceRefs
    policyRefs
    predecessorRefs
  }
  class EdgeAssuranceEvaluationProjection {
    <<M03 downstream projection>>
    projectionRef
    gainReportRef
    metricRefs
    proposedCloseDisposition
    assuranceClosureDecision
    residualPressureRefs
    continuationRefs
    nextActionBasisRefs
  }
  class EdgeAssuranceEvaluationReadModel {
    <<M03 downstream-only read model>>
    projectionRef
    proposedCloseDisposition
    assuranceClosureDecision
    nextActionBasisRefs
  }
  class AssuranceProjection {
    <<M03 downstream projection>>
    projectionRef
    ambiguityRows
  }
  class AssuranceClosureDecision {
    <<M03 downstream fold>>
    decisionRef
    decision
  }

  GraphVector --> EdgeAssuranceContractSelection : highest precedence declaration
  GraphFunction --> EdgeAssuranceContractSelection : lower precedence default
  Job --> EdgeAssuranceContractSelection : lower precedence default
  Role --> EdgeAssuranceContractSelection : lower precedence default
  Module --> EdgeAssuranceContractSelection : lower precedence default
  EdgeAssuranceContractSelection *-- EdgeAssuranceContract : selected contract
  EdgeAssuranceContractSelection --> HookActionRecord : constrains eval call
  EdgeAssuranceAbsentiaResolution --> HookActionRecord : F_H judgment or transform path
  HookActionRecord --> FpEdgeAssuranceEvalFinding : returned finding refs
  FpEdgeAssuranceEvalFinding --> HookFindingAdmission : admitted or rejected by ABG
  HookFindingAdmission --> AssuranceProjection : admitted projection input
  AssuranceProjection --> AssuranceClosureDecision : closure fold
  HookFindingAdmission --> EdgeAssuranceEvaluationProjection : admitted finding input
  FpEdgeAssuranceEvalFinding --> EdgeAssuranceEvaluationProjection : gain/residual input
  AssuranceProjection --> EdgeAssuranceEvaluationProjection : evidence/authority projection
  AssuranceClosureDecision --> EdgeAssuranceEvaluationProjection : actual close fold
  EdgeAssuranceEvaluationProjection --> EdgeAssuranceEvaluationReadModel : report projection
```

## Functional Reading

- Declaration carriers are immutable inputs to contract resolution.
- `EdgeAssuranceContractSelection` is the replay-visible result of precedence
  resolution.
- `EdgeAssuranceAbsentiaResolution` is the replay-visible result when no
  contract exists.
- `HookActionRecord` records the effect-shell boundary before returned findings
  can influence assurance.
- `FpEdgeAssuranceEvalFinding` is a returned/admitted value carrier, not runtime
  truth.
- `HookFindingAdmission` is the ABG-owned value that allows a finding to feed
  projection.
- `EdgeAssuranceEvaluationProjection` renders gain, proposed close disposition,
  residual pressure, continuation, and next-action basis from an admitted
  finding and assurance fold.
- `EdgeAssuranceEvaluationReadModel` is report/read-model shape. It is not
  closure authority.
- `AssuranceClosureDecision` remains the only closure fold.

## Sign-Off Claim

This design is lawful only if implementation preserves these carrier roles as
pure construction, resolution, and admission functions, with plugin invocation
and event emission kept at the effect shell.
