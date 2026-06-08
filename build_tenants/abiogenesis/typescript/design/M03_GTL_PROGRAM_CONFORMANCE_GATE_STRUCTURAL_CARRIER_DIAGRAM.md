# M03 GTL Program Conformance Gate Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-09
**Ticket**: T-152
**Derived from**: [M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md](./M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md)

## Purpose

Show the Design Module Method carrier boundary for the ABG-owned GTL program
conformance gate. The diagram distinguishes prime outcome/admission carriers
from subordinate inventory rows and the CLI render shell.

## Structural Carrier Diagram

```mermaid
classDiagram
  class RawInput {
    <<foreign ingress>>
    +unknown json
  }
  class GtlProgramConformanceInputAdmission {
    <<prime authoritative>>
    +kind
    +input
    +issues
  }
  class GtlProgramConformanceInput {
    <<prime authoritative>>
    +subjectRef
    +abiPackageVersion
    +expectedCoverage
    +featureCoverageManifest
    +graphFunctions
    +modules
  }
  class GtlProgramFeatureCoverageManifest {
    <<prime authoritative>>
    +manifestRef
    +t153RequirementRef
    +rows
  }
  class FeatureOwnerClassifications {
    <<prime static rule truth>>
    +featureKind
    +expectedOwner
  }
  class GtlProgramFeatureCoverageRow {
    <<subordinate row>>
    +featureKind
    +disposition
    +ownerClassification
    +requirementRefs
    +evidenceRefs
    +reasonRefs
  }
  class GtlProgramCoverageCounts {
    <<subordinate counts>>
    +catalogGraphFunctionCount
    +publishedGraphFunctionCount
    +graphVectorCount
    +targetCarrierContractCount
    +edgeClosureContractCount
    +overlayCount
    +publicStartTargetCount
    +promptAssetCount
    +pluginContractCount
    +sourceIdentitySurfaceCount
  }
  class ProgramInventoryRows {
    <<subordinate inventory rows>>
    +targetCarrierContracts
    +edgeClosureContracts
    +overlays
    +publicStartTargets
    +promptAssets
    +pluginContracts
    +sourceIdentitySurfaces
  }
  class GraphProgramSurfaces {
    <<GTL input surfaces>>
    +catalogGraphFunctionRefs
    +graphFunctions
    +modules
    +materializedVectors
  }
  class GtlProgramInventoryDigests {
    <<prime authoritative>>
    +featureCoverageManifest
    +graphFunctions
    +modules
    +materializedVectors
    +inventoryDigest
  }
  class GtlProgramConformanceIssue {
    <<prime diagnostic>>
    +severity
    +surfaceKind
    +surfaceRef
    +ruleRef
    +message
  }
  class GtlProgramConformanceReport {
    <<prime authoritative outcome>>
    +reportRef
    +subjectRef
    +abiPackageVersion
    +inventoryDigest
    +passed
    +issueCount
    +coverage
  }
  class TypecheckGtlProgram {
    <<pure admission function>>
    +typecheckGtlProgram(input)
  }
  class CliWrapper {
    <<effect shell>>
    +abiogenesis-ts typecheck-gtl-program
  }

  RawInput --> GtlProgramConformanceInputAdmission : admit once
  GtlProgramConformanceInputAdmission --> GtlProgramConformanceInput : admitted input
  GtlProgramConformanceInput *-- GtlProgramFeatureCoverageManifest : owns
  GtlProgramFeatureCoverageManifest *-- GtlProgramFeatureCoverageRow : rows
  FeatureOwnerClassifications --> GtlProgramFeatureCoverageRow : expected owner
  GtlProgramConformanceInput *-- GtlProgramCoverageCounts : expected counts
  GtlProgramConformanceInput *-- ProgramInventoryRows : supplied inventory
  GtlProgramConformanceInput *-- GraphProgramSurfaces : supplied GTL surfaces
  TypecheckGtlProgram --> GtlProgramConformanceInputAdmission : consumes
  TypecheckGtlProgram --> FeatureOwnerClassifications : consumes
  TypecheckGtlProgram --> GtlProgramInventoryDigests : derives
  TypecheckGtlProgram --> GtlProgramConformanceIssue : emits typed issues
  TypecheckGtlProgram --> GtlProgramConformanceReport : emits
  GtlProgramConformanceReport *-- GtlProgramInventoryDigests : binds identity
  GtlProgramConformanceReport *-- GtlProgramCoverageCounts : observed coverage
  GtlProgramConformanceReport *-- GtlProgramConformanceIssue : reports
  CliWrapper --> TypecheckGtlProgram : delegates
```

