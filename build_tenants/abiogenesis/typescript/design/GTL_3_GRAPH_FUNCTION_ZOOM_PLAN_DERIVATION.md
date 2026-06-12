# GTL 3 Graph-Function Zoom Plan Derivation

## 1. Purpose

Define the TypeScript M01/M02/M03 realization shape for first-class
graph-function zoom.

This closes the T-155 design gap without creating a new public path carrier.
`GraphFunction` remains the public callable workflow carrier. `GraphVector`
remains internal realized adjacency truth beneath a graph function.

## 2. Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOF.md`
- `specification/requirements/gtl/REQ-L-GTL3-SUBSTITUTE.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`
- `.ai-workspace/tickets/active/T-155-define-first-class-gtl-graph-function-zoom-plan.md`
- `.ai-workspace/comments/codex/20260612T174004Z_ABG_GTL_ZOOM_PRIME_FUNCTION_VECTOR_AUDIT.md`

## 3. Position

Zoom is typed graph-function refinement.

It is not:

- a downstream product cursor move
- a public bare-vector callable
- hidden consequence-plugin planning
- step injection into an already-running vector
- a new GTL topology object

The lawful operation is:

```text
GraphFunction<A, B>
  + admitted refinement authority
  + GraphFunction<X, Y>
  -> GraphFunction<A, B>
```

ABG/GTL may resolve an internal `GraphVector` during the operation, but callers
do not execute or start that vector directly.

## 4. IACS

| Carrier or surface | Owner | Classification | Closure signal | Non-closure signal |
| --- | --- | --- | --- | --- |
| `GraphFunction` | GTL M01 | prime, authoritative public callable | zoom returns or admits a graph-function-level result preserving the parent outer interface | any public start, job, or semantic work target names a bare vector |
| `GraphVector` | GTL M01 | prime language declaration, internal path boundary | resolved only from materialized parent graph and admitted zoom target authority | caller supplies a vector cursor or vector id as executable authority |
| `GraphFunctionZoomPlan` | GTL M01 algebra | subordinate plan/provenance carrier | records parent/refinement function refs, authority refs, resolved vector refs, and compatibility proof | plan becomes public path carrier or runtime event authority |
| `RefinementBoundary` / `CandidateFamily` | GTL M02 publication | authoritative selection/refinement surface | plan cites one or more published authority refs | consequence plugin invents target with no declared authority |
| `ConsequenceTraversalAction` | ABG M03 construction/continuation | runtime adjunct | may carry only admitted zoom/re-entry selection evidence into construction intent | plugin owns cursor movement, emits runtime events, or selects undeclared zoom |
| runtime graph-span re-entry | ABG M03 | runtime authorship route | applies replay-visible re-entry after admitted construction intent | downstream product directly calls re-entry as hidden controller |

## 5. Structural Derivation

The first TypeScript slice exposes a M01 algebra wrapper:

```text
constructGraphFunctionZoomPlan({
  parent,
  refinement,
  authority: {
    refinementBoundaryRef?,
    candidateFamilyRef?,
    publishedTraversalTargetRef?
  }
})
```

Plan construction:

1. materializes `parent`
2. materializes `refinement`
3. resolves exactly one target vector in the parent graph by matching GTL zoom
   declaration keys against the supplied authority refs
4. validates that `refinement.inputs` are a subset of the target vector source
5. validates that `refinement.outputs` include the target vector target
6. records the resolved vector identity as internal plan truth

Application:

```text
applyGraphFunctionZoomPlan({ parent, refinement, plan })
  -> substitute(parentGraph, plan.targetGraphVectorRef, refinementGraph)
  -> constructGraphFunction(...)
```

The resulting graph function:

- preserves parent inputs
- preserves parent outputs
- preserves parent environment
- carries the substituted inner graph structure in an inline graph template
- records zoom provenance in declarations
- remains the callable carrier

The convenience wrapper:

```text
zoomGraphFunction(input)
  -> { kind, plan, graphFunction }
```

does not add a runtime route. It composes the two deterministic algebra steps.

## 6. GTL Declaration Keys

Target vector resolution is declaration-driven. The implementation recognizes
these scalar or string-list declaration keys on the parent graph vector:

- `gtl.zoom.refinement_boundary_ref`
- `gtl.zoom.candidate_family_ref`
- `gtl.zoom.published_traversal_target_ref`

If no vector matches, the plan fails closed. If multiple vectors match, the plan
fails closed as ambiguous. If no authority ref is supplied, the plan fails
closed.

## 7. Consequence Boundary

The consequence plugin may point to an admitted zoom result or selected
authority evidence, but it must not decide a hidden target vector. Dynamic zoom
selection remains future work unless the plugin selects from already admitted
`CandidateFamily` / `RefinementBoundary` truth or ABG-admitted policy rows.

For the T-155 first proof, deterministic zoom selection is declared on the GTL
graph-vector declaration surface.

## 8. Proof Plan

Required focused tests:

- positive graph-function zoom replaces one parent vector with inner vectors and
  preserves the parent outer interface
- recursive zoom applies a second zoom to a vector inside the first zoom result
- missing authority fails closed
- unmatched authority fails closed
- ambiguous authority fails closed
- mismatched refinement interface fails closed
- forged plan application without declared authority or with retargeted vector
  identity fails closed
- package entrypoints expose the API through M01/root exports
- live-style engine proof runs a zoomed graph function through `runEngineIterate`
  and observes the refined vector sequence rather than the original coarse edge

## 9. Decommission Register

No existing carrier is decommissioned.

Guarded non-decommission:

- `substitute(...)` remains the graph-level primitive.
- `GraphFunctionZoomPlan` wraps and proves graph-function-level use of
  substitution. It does not replace `substitute(...)`.
- graph-span re-entry remains runtime continuation law. It does not become the
  graph-function zoom constructor.
