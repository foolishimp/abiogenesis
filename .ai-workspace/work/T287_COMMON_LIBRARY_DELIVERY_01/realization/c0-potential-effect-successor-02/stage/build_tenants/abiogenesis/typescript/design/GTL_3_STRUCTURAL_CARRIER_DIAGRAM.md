# GTL 3 Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](./GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_FIRST_SLICE_IACS.md](./GTL_3_FIRST_SLICE_IACS.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](./GTL_3_M02_WORK_PUBLICATION_IACS.md), [T-009](../../.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md), [T-010](../../.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md)
**Purpose**: Module-bounded structural carrier sign-off asset for the completed
TypeScript `M01-gtl-core` and `M02-work-publication` waves.

## Scope

This diagram covers the active TypeScript GTL structural boundary:

- completed `M01-gtl-core`
- completed `M02-work-publication`

It does **not** claim to show:

- ABG runtime carriers
- package/bootstrap carriers
- qualification harness carriers
- deferred GTL families outside the completed `M01` and `M02` waves

## Mermaid UML View

```mermaid
classDiagram
class Context {
  <<prime>>
  <<authoritative>>
  +name
  +locator
  +digest
}

class Node {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +markov
  +tags
  -schema
  -assetSurface
}

class Graph {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +effects
  +tags
}

class GraphVector {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +allowsSubwork
  +tags
  -declarations
}

class GraphFunction {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +effects
  +tags
  -environment
  -template
  -declarations
}

class Role {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +tags
  -policyHooks
}

class Job {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +tags
  -contracts
}

class RefinementBoundary {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +tags
  -hints
}

class CandidateFamily {
  <<prime>>
  <<authoritative>>
  +id
  +name
  +tags
  -policyHints
}

class Module {
  <<prime>>
  <<authoritative>>
  +name
  -imports
  -metadata
}

class SchemaRef {
  <<subordinate>>
  -ref
}

class AssetSurface {
  <<subordinate>>
  -kind
  -requiredContexts
  -standardsRefs
  -outputContractRefs
  -constructorRefs
  -constructorInputAssetKinds
  -rendererRefs
  -renderedViewDigestPolicyRef
  -sectionKindRefs
  -clauseKindRefs
  -authoritySlots
  -proofObligationRefs
}

class AssetSurfaceAuthoritySlot {
  <<subordinate>>
  -authorityKindRef
  -disposition
  -fallbackPreconditionRefs
}

class SerializedAttrs {
  <<subordinate>>
}

class SerializedAttrEntry {
  <<subordinate>>
  -key
}

class HookRef {
  <<subordinate>>
  -ref
  -config
}

class Operator {
  <<subordinate>>
  -name
  -regime
  -binding
}

class Evaluator {
  <<subordinate>>
  -name
  -regime
  -binding
}

class Rule {
  <<subordinate>>
  -name
  -kind
  -config
}

class EnvRef {
  <<subordinate>>
  -requires
  -provides
  -carries
}

class TemplateRef {
  <<subordinate>>
  -kind
  -ref
  -version
}

class ContractRef {
  <<subordinate>>
  -kind
  -targetId
}

class ModuleImport {
  <<subordinate>>
  -source
  -names
  -version
}

class StartIntent {
  <<deferred>>
}

class ExecutionBasis {
  <<deferred>>
}

Node *-- SchemaRef
Node *-- AssetSurface
AssetSurface *-- AssetSurfaceAuthoritySlot
GraphVector *-- SerializedAttrs
SerializedAttrs *-- SerializedAttrEntry
SerializedAttrEntry *-- HookRef
GraphVector *-- Operator
GraphVector *-- Evaluator
GraphVector *-- Rule
GraphVector --> Context
GraphVector --> Node : source/target
Graph *-- GraphVector
Graph --> Node
Graph --> Context
Graph --> Rule
GraphFunction *-- EnvRef
GraphFunction *-- TemplateRef
GraphFunction *-- SerializedAttrs
GraphFunction --> Node : inputs/outputs
TemplateRef --> Graph : inline_graph
Role *-- SerializedAttrs : policyHooks
Job *-- ContractRef
Job --> Role
RefinementBoundary *-- SerializedAttrs : hints
RefinementBoundary --> Node : inputs/outputs
CandidateFamily *-- SerializedAttrs : policyHints
CandidateFamily --> Node : inputs/outputs
CandidateFamily --> GraphFunction : candidates
Module *-- ModuleImport
Module *-- SerializedAttrs : metadata
Module --> Graph
Module --> GraphFunction
Module --> RefinementBoundary
Module --> CandidateFamily
Module --> Job
Module --> Role
Module --> Operator
Module --> Evaluator
Module --> Rule
Module ..> StartIntent : consumed later by ABG
Module ..> ExecutionBasis : consumed later by ABG
```

## Reading Rules

- `<<prime>>` means top-level carrier admitted by the active GTL waves.
- `<<subordinate>>` means nested payload detail that does not acquire
  independent publication authority in the active GTL waves.
- `<<deferred>>` means out-of-scope family that is shown only to make the
  GTL-to-ABG boundary visible.
- `+` fields are public/exported carrier truth.
- `-` fields are module-bounded subordinate detail inside the active carrier
  family.

## Sign-Off Consequence

This asset is the visual check that:

- the active GTL TypeScript line has one prime carrier set rather than many
  peer payload wrappers
- `GraphFunction` remains the sole public named callable carrier
- `Operator`, `Evaluator`, and `Rule` remain subordinate to the GTL outer
  carriers in the completed TypeScript waves
- `Module` is the publication boundary rather than package metadata or npm
  export glue
