# ODD SDLC TypeScript Depth Traversal Function

**Status**: Active
**Date**: 2026-06-13
**Owner Ticket**: `.ai-workspace/tickets/active/T-200-implement-depth-traversal-function-and-decomposition-trace-foldback.md`
**Implements**: REQ-F-GFUNC-003, REQ-F-GFUNC-004, REQ-F-GFUNC-005, REQ-F-ODDSDLC-013, REQ-F-ODDSDLC-016, REQ-F-ODDSDLC-074, REQ-F-ODDSDLC-086
**Derives From**: `specification/PRODUCT.md`, `specification/requirements/02-graph-functions.md`, `specification/requirements/07-asset-typing-and-binding.md`, `specification/requirements/16-edge-gain-closure-contract.md`, `specification/requirements/18-typed-construction-algebra.md`, `ODD_SDLC_TYPESCRIPT_OPTIMISING_OVERLAY.md`, `ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`, `ODD_SDLC_TYPESCRIPT_STAGED_COMPUTE_BOUNDARY.md`

## Purpose

Residual feature-depth pressure is resolved by zooming into a typed graph
function over existing graph nodes. It is not resolved by consequence prose,
prompt-only obligation lists, or an SDLC-owned recursive controller.

The published graph function is:

```text
Fg_decompose_depth_between_nodes(
  sourceNodeRef,
  targetNodeRef,
  parentObligationRef,
  graphCatalogDigestRef,
  edgeContractRefs,
  depthPolicyRef,
  evidencePolicyRef
) -> DepthTraversalOutcome
```

The external contract is the named graph function. Its graph vector is an
internal ABG/GTL execution detail. Product code may cite the graph function and
typed output carrier; it must not move a vector cursor locally.

T-203 applies this depth mechanism to the reusable code-builder graph
function. `derive_component_code_surface`, `derive_component_test_surface`,
and `derive_uat_test_source_surface` are full-traversal
`Fg_graph_code_builder` specializations, and
`derive_lite_component_code_surface` is the overlay-scoped lite/smoke source
profile. Depth traversal may zoom into the full source-code, unit/component
test, and UAT-test specializations when source, unit/component-test, or UAT-test
obligations are underdecomposed. Unit/component tests are requirement + design
and module specific; UAT tests are requirement / UAT-testcase specific and become
framework-discoverable source through the UAT-test profile. Test-run and
qualification nodes fan in the generated code and generated tests; failures
become ticket triage pressure for same-edge code-builder iteration, deeper
code/test zoom, or upstream design re-entry.

## IACS

Inputs:

- `sourceNodeRef`
- `targetNodeRef`
- `parentObligationRef`
- `graphCatalogDigestRef`
- `edgeContractRefs`
- `depthPolicyRef`
- `evidencePolicyRef`

Admitted carriers:

- `sdlc_decomposition_trace_register`
- `sdlc_depth_traversal_outcome`
- `sdlc_decomposition_trace_closure`

Controls:

- ABG owns graph calls, graph-vector execution, runtime events, replay,
  continuation, re-entry, and closure foldback.
- `odd_sdlc` owns product graph-function publication, domain policy, child
  obligation meaning, review-pressure interpretation, closure criteria, and
  proof interpretation over admitted evidence refs.
- `F_D` may admit, reject, route, validate, digest, and project refs. It does
  not construct runtime truth or execute a traversal.
- `F_P` may construct domain assets and review findings. It does not close
  parent feature-depth pressure without admitted child evidence.

States:

- `admitted`: a decomposition trace register exists with at least one child
  obligation row and a consolidation ref.
- `blocked`: child rows exist but closure criteria, admitted evidence refs,
  source test refs, execution shard refs, or consolidation refs are still open.
- `rejected`: the depth request lacks lawful parent, child, graph-function,
  policy, evidence, or consolidation refs.

## Structural Derivation

```text
simple traversal residual pressure
  -> SdlcTraversalStrategyDecision(depth-scoped)
  -> Fg_decompose_depth_between_nodes
  -> sdlc_decomposition_trace_register
  -> child graph-function starts/resumes owned by ABG
  -> child closure evidence rows
  -> sdlc_decomposition_trace_closure
  -> parent consolidation
```

Each register row binds:

- `childObligationRef`
- `parentObligationRef`
- `ownerEdgeRef`
- `graphFunctionRef`
- `graphVectorRef`
- `closureCriteriaRefs`
- `evidenceRefs`
- `sourceTestRefs`
- `executionShardRefs`
- `consolidationRefs`

Downstream-deferred review findings are not closure evidence by themselves.
They become register pressure by deriving child obligation rows that carry the
finding ref, owning edge, target graph function, closure criteria, and evidence
policy refs.

## Non-Closure Signals

Parent depth closure is blocked when any of these conditions hold:

- a downstream-deferred finding remains prose and is not persisted into the
  decomposition trace register
- a child obligation row is missing, open, blocked, or rejected
- a child row lacks an owning edge, graph function ref, graph vector ref,
  closure criteria, evidence ref, or consolidation ref
- a requirement-bound child row lacks source test refs or execution shard refs
- command evidence such as `sbt test` exists without requirement-bound source
  test and admitted execution-shard evidence
- component-test closure is claimed without generated, framework-discoverable
  source tests from the `Fg_graph_code_builder` generated-test specialization
- SDLC product code attempts graph cursor movement, retry, recursion, runtime
  event emission, or closure fold locally

## Decommission Register

Rejected implementation paths:

- SDLC-local recursive depth controller
- consequence plugin performing cursor movement
- command-success-only parent closure
- prompt-only downstream obligation list
- mutation of `overlay://odd-sdlc/current-full-traversal` to carry depth policy
- separate legacy test-generation path that bypasses `Fg_graph_code_builder`
