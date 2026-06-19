# odd_sdlc TypeScript Reusable Graph-Function Library

**Status**: Active
**Date**: 2026-04-27
**Owner Ticket**: `.ai-workspace/tickets/completed/T-049-design-typescript-reusable-odd-sdlc-graph-function-library.md`
**Implements**: REQ-F-GFUNC-001, REQ-F-GFUNC-002, REQ-F-GFUNC-003, REQ-F-GFUNC-004, REQ-F-GFUNC-005, REQ-F-ODDSDLC-013, REQ-F-ODDSDLC-014, REQ-F-ODDSDLC-015, REQ-F-ODDSDLC-032, REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-041, REQ-F-ODDSDLC-042, REQ-F-ODDSDLC-043
**Derives From**: `specification/requirements/02-graph-functions.md`, `specification/requirements/10-odd-sdlc-software-domain-buildout.md`, `specification/requirements/13-odd-sdlc-typescript-tenant.md`, `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`

## Purpose

Define the first reusable graph-function library for the TypeScript tenant.

The library moves repeated SDLC workflow shapes into GTL graph-function program
truth. It does not authorize a Python-shaped controller port, a tenant-local
iteration engine, or a widened full operational RC claim.

## Position

The TypeScript tenant already publishes product-specific leaf graph functions.
Those functions remain valid current program truth, but they are too specific
to be the long-term framework shape.

The reusable library introduces stable graph-function forms that product
functions can specialize:

- `Fg_single_typed_traversal`
- `Fg_ingress_project`
- `Fg_conform_project`
- `Fg_materialization_assurance_ledger`
- `Fg_semantic_convergence_assurance_ledger`
- `Fg_obligation_carry_assurance_ledger`
- `Fg_requirement_fulfillment_assurance_ledger`
- `Fg_ambiguity_assurance_ledger`
- `Fg_capability_assurance_ledger`
- `Fg_shallow_realization_assurance_ledger`
- `Fg_traversal_assurance_fold`

The target runtime shape is:

```text
operator or scenario
  -> public SDLC adapter
  -> reusable or specialized SDLC graph function
  -> ABG execution basis and traversal
  -> SDLC F_D/F_P/F_H hook for one selected edge
  -> ABG events and projection
  -> SDLC proof, query, triage, or follow-up admission
```

The unlawful shape is:

```text
TypeScript service method
  -> inspect current state
  -> choose next step
  -> call another local method
  -> retry until happy
  -> present result as graph execution
```

That second shape is a tenant-local control loop.

## Authority Split

| Surface | Owns | Does Not Own |
| --- | --- | --- |
| Reusable graph-function library | Stable outer contracts, reusable traversal forms, composition declarations, typed input/output surfaces | Runtime frames, hidden retry loops, prompt-only behavior |
| ABG | Graph-call truth, frames, continuation, iteration, event facts, replay projection | SDLC domain meaning, project policy, domain proof interpretation |
| SDLC domain | Asset types, edge meaning, transform and evaluation contracts, closure interpretation, ambiguity policy | ABG traversal mechanics or next-vector selection |
| TypeScript adapters and proof code | Carrier admission, serialization, deterministic checks, catalog publication, query projection, CLI/API binding | Constructive program truth or recursive realization control |

## Shared Carriers

The implementation slice shall publish these carrier families as data, not as
private branch logic:

| Carrier | Purpose |
| --- | --- |
| `TypeSurfaceRef` | Names a typed domain surface, schema reference, asset kind, and authority refs. |
| `TypedAssetRef<T>` | Binds one concrete source or target asset to its `TypeSurfaceRef`, identity, digest, and provenance. |
| `TraversalTransformContract<A, B>` | Declares the transform profile for `A -> B`, including deterministic transform refs, configured `F_P` refs, output contract refs, and capability refs. |
| `TraversalEvaluationContract<A, B>` | Declares preflight `F_D`, capability `F_D`, postflight `F_D`, operational `F_D`, and optional `F_H` escalation policy. |
| `TypedTraversalProgramSpec<A, B>` | Names one reusable or specialized graph-function program over source type `A`, target type `B`, transform contract, evaluation contract, closure contract, and retry/continuation policy ref. |
| `IngressSourceSet` | Admits unstructured, loosely structured, or structured bootstrap inputs with source refs, digests, structure grade, and authority markers. |
| `ProjectIngressContract` | Declares how broad bootstrap input becomes a conformant `Project` typed entity with topology, ambiguity, lineage, and imported-authority policy. |
| `ConformProjectProfile` | Canonicalizes raw project documents and constraints into selected tenant, output root, module inventory, capability contracts, execution contracts, and realization mode. |
| `AssuranceLedger` | Records one deterministic assurance dimension over a traversal result. |
| `TraversalRequirementSatisfaction` | Folds assurance ledgers into close, retry, blocked, or reprice truth for the total transition function. |
| `GraphFunctionLibraryEntry` | Distinguishes reusable library graph functions from product-specific leaf functions and executive compositions. |
| `GraphProgramComposition` | Records lawful composition of library and specialized graph functions into one outer executable contract. |

## `Fg_single_typed_traversal`

`Fg_single_typed_traversal` is the reusable form for one governed edge
traversal:

```text
Fg_single_typed_traversal(
  source: TypedAssetRef<A>,
  target_type: TypeSurfaceRef<B>,
  transform: TraversalTransformContract<A, B>,
  evaluation: TraversalEvaluationContract<A, B>
) -> {
  target: TypedAssetRef<B>,
  work_report: WorkReport,
  closure_facts: ClosureFactSet,
  unresolved_reasons: GapReasonSet
}
```

It is lawful only when `A`, `B`, transform, evaluation, work-report, and closure
surfaces are explicit.

### `F_D`

`F_D` owns deterministic guard and proof work:

- preflight admission of source identity, target binding, contract shape,
  provenance, and required evidence refs
- deterministic transform execution where the transform ref is sufficient
- capability checks such as parser, compiler, linter, fixture, or schema checks
- postflight validation of target identity, work-report shape, digest or
  lineage, generated-asset authority, and closure facts
- rejection of trace-only, scaffold-only, or prompt-only proof

### `F_P`

`F_P` owns constructive traversal where deterministic authority is not enough:

- construct or modify the governed target asset under the declared output
  contract
- return machine-readable work-report evidence
- carry unresolved reasons when the requested target cannot lawfully close
- preserve prompt, manifest, source context, target binding, and evidence refs
  as replayable runtime facts

### `F_H`

`F_H` is optional and policy-gated. It is used when ambiguity, authority import,
risk, or release scope requires a human decision before the traversal can close
or continue.

### ABG Ownership

ABG owns graph-call, frames, continuation, iteration, retry, event facts,
projection, and stop/continue decisions for this graph function.

SDLC may declare closure expectations and unresolved reasons. SDLC must not own
the loop that repeatedly re-enters the same edge.

## `Fg_ingress_project`

`Fg_ingress_project` is the reusable bootstrap form for broad project ingress:

```text
Fg_ingress_project(
  sources: IngressSourceSet,
  project_type: TypeSurfaceRef<Project>,
  ingress_contract: ProjectIngressContract
) -> {
  project: TypedAssetRef<Project>,
  source_input_ledger: SourceInputLedger,
  lineage_map: LineageMap,
  ambiguity_register: AmbiguityRegister,
  bootstrap_gap_set: GapReasonSet
}
```

It converts unstructured, loosely structured, or structured input into a
conformant project entity. This is the governed version of the bootstrap case:

```text
{ unstructured data, loosely structured data, structured data } -> Project
```

### `F_D`

`F_D` owns deterministic source and topology checks:

- source enumeration, digesting, and identity binding
- structure-grade detection
- existing spec-method topology checks
- `.abiogenesis/` and installed-substrate boundary checks
- proof that project-owned `WHAT` remains under `specification/`
- proof that project-owned `HOW` lands under `build_tenants/<tenant>/`

### `F_P`

`F_P` owns ambiguous project interpretation:

- infer project intent, product shape, likely requirement families, and tenant
  candidates from broad inputs
- propose conformant topology and lineage from source material to generated
  surfaces
- preserve uncertainty as ambiguity or gap surfaces instead of pretending the
  bootstrap input is complete

### `F_H`

`F_H` resolves imported authority, destructive normalization risk, project
scope, and ambiguity that policy marks as human-owned.

### ABG Ownership

ABG owns iteration and retry when project ingress cannot close on the first
attempt. `Fg_ingress_project` may publish unresolved reasons and next admissible
follow-up targets; it does not run its own realization loop.

## `Fg_conform_project`

`Fg_conform_project` is the deterministic bootstrap-conformance form that sits
between broad document ingress and downstream graph-program execution:

```text
Fg_conform_project(
  sources: IngressSourceSet,
  source_input_ledger: SourceInputLedger,
  constraints: ProjectConstraintsSource,
  topology_policy: ProjectTopologyPolicy
) -> {
  profile: ConformProjectProfile,
  selected_tenant: SelectedTenant,
  module_inventory: ModuleInventory,
  capability_contracts: CapabilityContractSurface,
  execution_contracts: ExecutionContractSurface,
  conformance_gaps: GapReasonSet
}
```

This is the explicit form of:

```text
{ documents } -> conform project -> graph program execution
```

It prevents installed operator execution from treating shallow scalar defaults
as project truth.

### `F_D`

`F_D` owns canonicalization:

- active tenant selection
- tenant output-root normalization under `build_tenants/<tenant>`
- module-structure extraction
- capability-contract extraction
- build/test/deploy/runtime execution-contract inference from selected tenant
  truth
- realization-mode classification
- source constraint digest and conformance-gap publication

### `F_P`

`F_P` may carry unresolved ambiguity about project identity, missing tenant
declarations, or incomplete imported authority. It does not invent executable
capabilities when the selected tenant does not declare enough truth.

### ABG Ownership

ABG owns the runtime traversal facts. `Fg_conform_project` publishes the
profile and gaps consumed by later graph functions; it does not become a
product-local controller.

## Assurance Ledger Functions

The assurance ledger functions are deterministic reusable graph functions that
evaluate a candidate traversal result along explicit dimensions. They ratify
the evolved Python-era multi-ledger solution as explicit ODD carriers instead
of leaving it captured only in imperative code.

Each ledger function has this outer shape:

```text
Fg_<dimension>_assurance_ledger(
  declared_contracts_or_registers,
  candidate_result_dossier,
  prior_gap_or_evidence_state
) -> AssuranceLedger
```

The first ledger set is:

| Graph Function | Inputs | Output | Closure Meaning |
| --- | --- | --- | --- |
| `Fg_materialization_assurance_ledger` | `WorkerHandoffManifest`, `WorkerResultReport`, `OperatorPostflightResult` | `MaterializationAssuranceLedger` | Product file realization obeys the materialization contract. |
| `Fg_semantic_convergence_assurance_ledger` | `TargetSemanticContract`, `CandidateResultDossier`, `SemanticClaimSet` | `SemanticConvergenceAssuranceLedger` | Candidate evidence covers target meaning, not only restates it. |
| `Fg_obligation_carry_assurance_ledger` | `PriorGapDossierSet`, `CurrentGapDossier`, `WorkerHandoffManifest` | `ObligationCarryAssuranceLedger` | Prior retry obligations were closed, carried, or repriced. |
| `Fg_requirement_fulfillment_assurance_ledger` | `RequirementClosureRegister`, `LineageLedger`, `CandidateResultDossier` | `RequirementFulfillmentAssuranceLedger` | Candidate evidence satisfies admitted requirement authority. |
| `Fg_ambiguity_assurance_ledger` | `StartIntentSurface`, `EdgeTraversalContract`, `AmbiguityFindingSet` | `AmbiguityAssuranceLedger` | Ambiguity becomes typed state and lawful re-entry pressure. |
| `Fg_capability_assurance_ledger` | `CapabilityInventory`, `GeneratedSourceInventory`, `CandidateResultDossier` | `CapabilityAssuranceLedger` | Generated product evidence covers required capability inventory. |
| `Fg_shallow_realization_assurance_ledger` | `GeneratedSourceInventory`, `GeneratedTestInventory`, `CandidateResultDossier` | `ShallowRealizationAssuranceLedger` | Placeholder, constant-success, identity-only, or trace-only output cannot close. |

All assurance ledger functions are `F_D` graph functions. They do not perform
worker dispatch, select next work, or append ABG events. They publish typed
domain truth consumed by the total transition function.

`Fg_requirement_fulfillment_assurance_ledger` and
`Fg_obligation_carry_assurance_ledger` are mandatory for cumulative realization
depth whenever the traversal handoff declares requirement obligations or retry
gap dossiers. They ensure the evaluator looks at the sum of prior edge
obligations and the current result, rather than only the latest artifact.

## Traversal Assurance Fold

`Fg_traversal_assurance_fold` folds the assurance ledger set into the
deterministic input consumed by the total transition function:

```text
Fg_traversal_assurance_fold(
  ledgers: AssuranceLedgerSet
) -> TraversalRequirementSatisfaction
```

The fold preserves every ledger verdict and applies deterministic precedence:

1. missing required ledger or `blocked` ledger -> `blocked`
2. `reprice_required` ledger -> `reprice_required`
3. `open_gap` ledger -> `retry_same_edge`
4. all required ledgers `satisfied` or `not_applicable` -> `close_allowed`

The fold is not an ABG runner. ABG remains the owner of traversal, retry, and
event truth. The fold gives ABG-compatible runtime code a typed SDLC-domain
answer to whether the candidate result may close or must re-enter.

## Composition With Current Product Functions

Existing product functions remain current catalog truth until implementation
tickets migrate them.

The reusable mapping is:

| Current Function Family | Library Relationship |
| --- | --- |
| `derive_intent_surface`, `derive_product_surface`, `derive_requirement_surface`, `derive_design_surface` | Specializations of `Fg_single_typed_traversal` over typed source and target assets. |
| `admit_source_project`, workspace normalization, source profile construction | Compositions under `Fg_ingress_project` and `Fg_conform_project`; raw documents are ingressed first, then conformed before downstream construction. |
| `construct_code_surface`, `derive_code_surface`, `construct_test_surface`, `execute_test_surface` | Specializations of `Fg_single_typed_traversal` with stronger capability `F_D` and operational `F_D`. |
| materialization, semantic, obligation, requirement, ambiguity, capability, and shallow-realization checks | Assurance ledger functions folded by `Fg_traversal_assurance_fold`. |
| `observe_gap_pressure`, `classify_gap_pressure`, `bind_gap_route`, `propose_reprice`, `propose_ticket_route`, `retire_gap_after_loopback` | Later library candidates for route binding and closure; not part of the first T-049 implementation slice. |
| `bootstrap_release_self_test`, `release_operational_cycle` | Executive graph-function compositions over reusable library entries and product specializations. |

The catalog must distinguish:

- reusable library graph functions
- product-specific graph-function specializations
- executive graph-function compositions

## Implementation Tickets

T-049 is a design ticket. It closes by publishing this design and the
implementation backlog, not by claiming runtime parity.

The first implementation tickets are:

- `T-055-realize-typescript-reusable-single-typed-traversal-library-slice.md` is complete.
- `T-056-realize-typescript-ingress-project-library-slice.md` is complete.
- `T-068-realize-typescript-conform-project-profile-before-product-materialization.md` adds the first conform-project carrier/function slice.

`T-050`, `T-051`, and `T-057` consume the same module-method direction by
splitting hooks and extracting policy mappings into declared surfaces. `T-053`
uses the resulting surfaces for live `data_mapper` proof.

## Non-Widening Rule

This design does not widen the RC claim.

Bounded TypeScript package RC remains a package-level claim over semantic,
sandbox, installed-sandbox, and one live external `F_P` proof. Full operational
Python replacement remains blocked until install/normalize command flow,
release-cut evidence, and Python comparison evidence close under `T-041`.

## Non-Closure Signals

The library is not complete if:

- reusable graph functions exist only as comments
- graph-function metadata is hidden inside TypeScript branches
- `F_D`, `F_P`, or `F_H` roles are unnamed at the edge contract
- SDLC owns retry, continuation, or next-vector selection locally
- a TypeScript helper method becomes the real executor
- product-specific leaf functions are duplicated without a library/specialized
  relationship
