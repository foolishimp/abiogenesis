# ABG/GTL Zoom Prime Function/Vector Audit

## Scope

Audit request: confirm whether the current ABG/GTL implementation has only prime
functionality for graph traversal shape, and whether `GraphFunction` /
`GraphVector` remain the sole lawful path implementations for the proposed zoom
capability.

This is commentary, not ratified law. It is written under STDO, using live
requirements, design, and TypeScript realization in `abiogenesis`.

## Verdict

Pass with one design gap.

The current ABG/GTL law and most of the TypeScript realization are aligned:

- `GraphFunction` is the sole public named callable workflow carrier.
- `GraphVector` is the internal adjacency and transition-governance carrier.
- Public starts, job bindings, runtime re-entry rows, construction action rows,
  consequence traversal actions, and gap projections keep vector identity
  subordinate to a graph function or an ABG-admitted construction/re-entry route.
- I did not find a public bare-vector execution path.

The gap is not an authority leak. The gap is that generic typed zoom is not yet a
single first-class graph-function-level API. Existing law says zoom-in maps to
refinement/substitution, and the code has `substitute(outer: Graph,
contractVectorId: string, inner: Graph): Graph`; however, the public typed
operation the SDLC design wants should be a graph-function operation whose vector
resolution stays internal to ABG.

Required shape for the new design:

```text
external selection:
  GraphFunction<A, B>
  + CandidateFamily<A, B> or RefinementBoundary<A, B>
  + declared zoom policy

internal ABG resolution:
  materialize parent GraphFunction
  resolve the target GraphVector inside the materialized graph
  materialize refinement GraphFunction
  apply lawful substitution / recursion / foldback

execution:
  ABG admits and emits events
  ABG applies graph-span re-entry or substituted graph-function traversal
  downstream products receive replay/projection truth only
```

Do not expose a downstream product API that selects a vector cursor or executes a
vector directly.

## Prime Surfaces Audited

### Requirements

- `REQ-L-GTL3-GRAPHFUNCTION-002` makes `GraphFunction` the reference contract
  boundary and sole public named callable workflow carrier.
- `REQ-L-GTL3-GRAPHFUNCTION-007` makes `GraphFunction` the unit of lawful
  composition, substitution, recursion, and higher-order graph application.
- `REQ-L-GTL3-GRAPHFUNCTION-014` states public work entry points use published
  graph functions; bare internal graph vectors are not public callable carriers.
- `REQ-L-GTL3-GRAPHFUNCTION-015` allows graph functions to realize internal
  vectors, but keeps those vectors under the graph-function carrier.
- `REQ-L-GTL3-GRAPHVECTOR-002` makes `GraphVector` a first-class declaration
  type but not a public ontology, callable carrier, or semantic job target.
- `REQ-L-GTL3-GRAPHVECTOR-008` bans public execution and semantic work contracts
  from targeting bare graph vectors.
- `REQ-L-GTL3-GRAPHVECTOR-010` puts per-edge traversal strategy on
  `GraphVector.declarations["abg.traversal_strategy"]`, with ABG carrying the
  selected runtime truth.
- `REQ-L-GTL3-HOF-008` requires zoom/fold vocabulary to resolve to lawful GTL
  HOF operations or be repriced before implementation.
- `REQ-L-GTL3-CONTRACT-LAW-API-004` says selection/refinement/synthesis are
  first-class language configuration surfaces, not hidden orchestration.
- `REQ-L-GTL3-CONTRACT-LAW-API-006` says recursion is declared through a
  `GraphFunction`; ABG interprets it and must not invent a hidden recursive
  controller.
- `REQ-L-GTL3-CONTRACT-LAW-API-009` and `-012` make ABG the owner of program
  admission and forbid downstream products from creating second contract-law
  surfaces.

### Design

- `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` marks `Graph`, `GraphVector`, and
  `GraphFunction` as `<<prime>> <<authoritative>>`.
- The same diagram's sign-off says the TypeScript line has one prime carrier
  set, `GraphFunction` remains the sole public named callable carrier, and
  module publication is the boundary.
- `GTL_3_MODULE_DESIGN.md` identifies M01 as GTL core, M02 as
  graph-function-first callable publication, and M03 as the ABG runtime kernel.
- `GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md` resolves zoom-in as refinement or
  substitution of one outer edge by an inner graph function while preserving
  outer contract.

### Code

- `GraphVector`, `Graph`, and `GraphFunction` are distinct carrier interfaces in
  `code/src/gtl/m01/contracts/carriers.ts`.
- `materializeGraphFunction(...)` verifies the inline graph preserves the graph
  function outer input/output contract.
- `constructGraphFunction(...)` verifies inputs match environment requirements,
  outputs are provided by the environment, and an inline graph preserves the
  outer contract.
- `compose(...)` returns a `GraphFunction`.
- `recurse(...)` returns a `GraphFunction` and preserves the outer interface.
- `substitute(...)` currently works at the `Graph` level by replacing an
  internal vector with an inner graph after checking input/output compatibility.

## Findings

### F1. No public bare-vector path found

Status: pass.

Public start and job binding conformance resolves callable work to published
`GraphFunction` refs:

- overlay public start targets resolve against the graph-function set
- public start rows require `target.graphFunctionRef`
- job bindings validate `contractTargetRefs` and
  `publicCallableGraphFunctionRefs` against published graph functions

Vector refs can be named in overlays and target-carrier rows, but they are
resolution and internal boundary refs. They are not accepted as public start
targets.

### F2. Runtime vector routes are subordinate ABG routes

Status: pass/watch.

ABG has runtime routes that target vector indexes:

- explicit graph-vector resume cursor
- graph-span re-entry
- construction `reenter_graph_span`

Those routes are lawful only because they are ABG runtime/authorship routes over
an execution basis, not public GTL callables. The current construction path also
checks that consequence traversal actions target the current graph-function
basis before ABG invokes construction/re-entry.

Watch condition for the zoom design: downstream code must not call these routes
as a product-level vector cursor API. The only acceptable external selection is
by graph function plus declared candidate/refinement/zoom policy; ABG may then
resolve the internal vector.

### F3. Generic graph-function zoom wrapper is missing

Status: gap.

Existing pieces are sufficient for the algebra:

- graph-function materialization
- graph-level `substitute(...)`
- graph-function-level `compose(...)`
- graph-function-level `recurse(...)`
- runtime graph-span re-entry and foldback

But there is no current first-class operation with this shape:

```text
zoom(parent: GraphFunction<A, B>,
     target: declared edge/refinement boundary,
     refinement: GraphFunction<X, Y>,
     policy: ZoomPolicy): GraphFunction<A, B>
```

The design should either:

1. add an ABG/GTL graph-function-level zoom constructor that wraps
   materialization, target-vector resolution, substitution, and reconstructed
   graph-function admission; or
2. explicitly prove that the accepted API is `materializeGraphFunction(...)` +
   `substitute(...)` + `constructGraphFunction(...)`, all inside ABG, and not a
   downstream product path.

Option 1 is cleaner for the SDLC use case because it preserves the operator's
intention: zoom is typed graph-function composition, not injection of arbitrary
steps into a cursor.

### F4. Consequence traversal action is an adjunct, not a prime path

Status: pass with condition.

`ConsequenceTraversalAction` is not a rival GTL path carrier when used as
currently implemented:

- executable actions require `selectedGraphFunctionRef`
- vector-targeting actions require refinement boundary, candidate family, or
  published traversal target authority
- `reenter_graph_span` requires `graphVectorRef` and `reentryTargetRef`
- the action projects into the existing construction action catalog and
  construction intent machinery
- the engine consumes it only by building an ABG construction world and invoking
  `runConstructionIntentStep`

Condition: for deterministic zoom, the consequence plugin should not invent the
zoom choice. It may carry an admitted outcome derived from GTL declaration truth,
but the selection surface belongs in graph-function/vector declarations,
candidate families, refinement boundaries, or ABG-admitted policy rows.

### F5. Public gaps exposes vector refs only as read-only projection

Status: pass/watch.

The public gaps projection exposes `bestGraphFunctionRef` and
`bestGraphVectorRef`, but it is a read-only observation/evaluator surface:

- action rows include `publishedTraversalTargetRef` equal to the graph-function
  id when they name a vector
- `readOnlyEvaluator.mutationAllowed` is `false`
- the design says `gen-gaps` must not start traversal, emit runtime events,
  append replay facts, delegate to Python, or rebuild controller-local state
- the FP-consciousness requirement says public gap projection shall not append
  construction events, admit intent, dispatch graph work, or own a retry loop

This is not a prime path implementation. It is a watch item because future work
must not promote `bestGraphVectorRef` into a callable target.

## Required Guard For The Zoom Ticket

The zoom ticket should carry this guard before realization:

```text
1. The public path carrier is always GraphFunction.
2. GraphVector is an internal realized edge boundary, never a public callable.
3. A zoom selection may cite a vector only inside an ABG-admitted graph-function
   refinement/substitution/re-entry plan.
4. Any external selection must cite GraphFunction plus CandidateFamily,
   RefinementBoundary, published traversal target, or an equivalent GTL carrier.
5. Consequence plugins may report pressure or select among admitted declared
   options, but must not create a hidden planner, hidden cursor move, or second
   traversal law.
6. F_D/F_P/F_H composition can choose compute regime for an edge; it is not a
   scaffold for a separate depth traversal runtime.
7. The proof must include a negative case: a bare vector target, relative cursor,
   or product-local depth traversal carrier is rejected.
```

Concrete no-go names/shapes for downstream SDLC:

- no `SdlcDepthTraversalRuntime`
- no `DepthTraversalOutcome` as an executable path carrier
- no product-owned `targetVectorIndex` cursor movement
- no consequence plugin arbitrary zoom choice that is not derived from GTL/ABG
  admitted declaration truth

Acceptable shapes:

- `GraphFunctionZoomPlan`
- `GraphFunctionRefinementPlan`
- `CandidateFamily` / `RefinementBoundary` based selection
- `ConsequenceTraversalAction` only as an admitted bridge into ABG construction
  intent and graph-span re-entry

## Evidence Index

- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`: lines 17-45,
  53-56.
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`: lines 17-37,
  49-53.
- `specification/requirements/gtl/REQ-L-GTL3-HOF.md`: lines 24-34.
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`: lines
  84-106, 119-153.
- `build_tenants/abiogenesis/typescript/design/GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`:
  lines 46-75, 274-284.
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts`:
  lines 141-198, 220-244.
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/core.ts`:
  lines 489-607, 720-769.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts`:
  lines 4716-4809, 5978-6061, 6144-6166.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consequence_traversal_action.ts`:
  lines 39-64, 81-117, 329-420.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_catalog.ts`:
  lines 35-52, 123-132, 230-264.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_intent.ts`:
  lines 38-66, 86-106, 294-312, 452-470.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`:
  lines 2479-2506, 2520-2569, 2643-2749.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/construction_runner.ts`:
  lines 269-352, 448-458, 619-644.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/runtime_authoring_routes.ts`:
  lines 48-67, 268-299.
- `build_tenants/abiogenesis/typescript/code/src/app/m04/gaps/projection.ts`:
  lines 404-411, 584-607, 990-1064.
- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`:
  lines 25-35.
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`: lines
  24-36.

