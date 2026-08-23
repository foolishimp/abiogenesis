# M02/M04 Self-Build Program Structural Carrier Diagram

**Derived from**: `M02_M04_SELF_BUILD_PROGRAM_DERIVATION.md`

```mermaid
classDiagram
  class Module {
    +name
    +graphs
    +graphFunctions
    +jobs
    +metadata
  }

  class SelfBuildManifestMetadataV1 {
    +kind
    +schemaVersion
    +manifestId
    +manifestVersion
    +manifestDigest
    +graphFunctionRef
    +graphFunctionDigest
    +compatibilityProfiles
    +sourceInputContract
    +resultContract
    +equivalenceContract
  }

  class GraphFunction {
    +id
    +name
    +graph
    +declarations
  }

  class Job {
    +id
    +contracts
    +roles
  }

  class ExactPredecessorProfile {
    +packageName
    +packageVersion
    +tarballDigest
    +installedManifestDigest
    +requiredPublicExports
  }

  class CandidateLineProfile {
    +packageName
    +versionRange
    +requiredContractRefs
    +requiredCapabilityRefs
  }

  class SelfBuildSourceInputV1 {
    +sourceId
    +sourceInventoryDigest
    +sourceRootUri
    +packageRootRelativePath
    +workRoot
    +outputRoot
  }

  class SelfBuildProgramResultV1 {
    +stage
    +terminalDisposition
    +builderCompatibility
    +b5Identity
    +s5Identity
    +candidateInventoryDigest
    +resultRefs
    +replayRefs
    +sourceIsolationResult
  }

  class SelfBuildEquivalenceContractV1 {
    +byteComparators
    +semanticComparators
    +resultComparators
    +nondeterministicFields
  }

  Module *-- SelfBuildManifestMetadataV1 : specialized metadata
  Module *-- GraphFunction : exactly one callable B5 function
  Module *-- Job : binds selected function
  SelfBuildManifestMetadataV1 *-- ExactPredecessorProfile
  SelfBuildManifestMetadataV1 *-- CandidateLineProfile
  SelfBuildManifestMetadataV1 --> SelfBuildSourceInputV1 : declares
  SelfBuildManifestMetadataV1 --> SelfBuildProgramResultV1 : declares
  SelfBuildManifestMetadataV1 --> SelfBuildEquivalenceContractV1 : declares
  GraphFunction --> SelfBuildSourceInputV1 : consumes
  GraphFunction --> SelfBuildProgramResultV1 : produces through ABG
```

## Cross-Line Flow

```mermaid
flowchart LR
  B5[Frozen B5 Module bytes]

  subgraph P4[Exact I4 predecessor profile]
    I4ID[Package plus tarball plus installed manifest]
    M02[Public admitModule]
    LIST[Module graphFunctions]
    START[Public start async]
  end

  subgraph P5[Installed 5.0 candidate profile]
    I1ID[Resolved product lock]
    VERIFY[Specialized schema and digest]
    CATALOG[Catalog admit list invoke]
    RUNTIME[ABG runtime]
  end

  S5[Immutable S5 input]
  OUT[Job-bound candidate output]

  B5 --> M02
  I4ID --> M02
  M02 --> LIST
  LIST --> START
  S5 --> START
  START --> OUT

  B5 --> VERIFY
  I1ID --> VERIFY
  VERIFY --> CATALOG
  CATALOG --> RUNTIME
  S5 --> RUNTIME
  RUNTIME --> OUT
```

## Authority Notes

- Both flows consume the same B5 bytes and GraphFunction identity.
- I4 Module listing is not a 5.0 catalog projection.
- The 5.0 catalog does not create GraphFunction or runtime authority.
- Only ABG runtime produces events, result, continuation, and closure truth.
- S5 supplies source input only. It supplies no builder runtime or controller.
- Output existence without converged result/replay truth is not stage closure.
