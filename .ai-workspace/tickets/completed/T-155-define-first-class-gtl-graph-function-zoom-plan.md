---
id: T-155
title: Define first-class GTL graph-function zoom plan over prime carriers
type: feature
ticket_category: graph_function_zoom_algebra
status: completed
review_status: accepted
proof_status: passed
goal: define and prove a first-class ABG/GTL graph-function zoom capability that preserves `GraphFunction` as the public callable carrier and resolves `GraphVector` only as internal ABG materialized structure
build_tenant: typescript
release_scope: post-rc18
change_intent: Close the ABG gap discovered during downstream depth traversal design: typed zoom must be a graph-function-level algebra/admission plan, not downstream product cursor movement, hidden consequence-plugin orchestration, or a bare-vector callable path.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
    - specification/requirements/gtl/REQ-L-GTL3-HOF.md
    - specification/requirements/gtl/REQ-L-GTL3-SUBSTITUTE.md
    - specification/requirements/abg/REQ-R-ABG3-BINDING.md
    - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  design:
    - build_tenants/abiogenesis/typescript/design/GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md
    - build_tenants/abiogenesis/typescript/design/GTL_3_M02_WORK_PUBLICATION_IACS.md
    - build_tenants/abiogenesis/typescript/design/GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/core.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/index.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/constructors.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consequence_traversal_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_catalog.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/package.json
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t155_graph_function_zoom_plan.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/support/t155-graph-function-zoom-fixtures.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t155_graph_function_zoom_plan_live.test.mjs
created_at: 2026-06-13
updated_at: 2026-06-13
completed_at: 2026-06-13
governance_scope: STDO Method
priority: high
dependencies:
  - T-070 zoom/fold algebra decision (completed)
  - T-100 zoomed workspace foldback building block (completed)
  - T-152 GTL program conformance gate and re-entry inventory (active)
  - T-154 runtime authorship routes for resume/span reentry (completed)
commentary_refs:
  - .ai-workspace/comments/codex/20260612T174004Z_ABG_GTL_ZOOM_PRIME_FUNCTION_VECTOR_AUDIT.md
target_truth: GTL/ABG exposes a typed graph-function zoom plan or constructor that takes a parent `GraphFunction`, an admitted refinement target, and a refinement `GraphFunction` or published candidate/refinement carrier. ABG materializes the parent, resolves the target `GraphVector` internally, proves interface compatibility, applies lawful substitution or equivalent graph-function refinement, preserves the parent outer contract, and returns an admitted graph-function-level result or replay-visible plan. Downstream products may select among admitted graph-function/refinement options but may not move vector cursors, execute bare vectors, or create hidden depth traversal runtimes.
superseded_truth: Zoom is implemented as downstream product cursor movement, a consequence-plugin hidden planner, a relative vector offset, an SDLC-owned depth traversal runtime, or ad hoc step injection outside GTL graph-function algebra.
closure_law: Close only when a design/IACS surface defines the zoom plan carriers and owners; the TypeScript realization exposes either a first-class graph-function zoom constructor or an explicit ABG-internal materialize/substitute/reconstruct plan; positive proof shows parent `GraphFunction<A,B>` zooms into a lawful refinement while preserving the outer interface; recursive zoom is demonstrated at least one level deep; negative proof rejects bare-vector public targets, relative cursors, mismatched inner interfaces, missing `RefinementBoundary` or `CandidateFamily` authority, and consequence-plugin selections not derived from admitted GTL/ABG declaration truth.
non_closure_conditions:
  - public API accepts `GraphVector` or `targetVectorIndex` without a parent `GraphFunction` and admitted refinement authority
  - downstream product code owns cursor movement or vector re-entry selection
  - a consequence plugin invents a zoom choice not derived from GTL declaration truth or ABG-admitted policy rows
  - zoom is represented as a product-local `DepthTraversalOutcome`, `SdlcDepthTraversalRuntime`, or hidden controller loop
  - the implementation only exposes graph-level `substitute(...)` while claiming a graph-function-level zoom API
  - substituted/refined graph functions do not preserve outer input/output contract truth
  - recursive zoom cannot be expressed without ad hoc orchestration
  - public starts, jobs, or semantic work targets can name bare graph vectors
---

# T-155: First-Class GTL Graph-Function Zoom Plan

## Intake Triage

Smallest lawful re-entry point: `design_reframe`.

The governing requirements already exist:

- `GraphFunction` is the sole public named callable workflow carrier.
- `GraphVector` is an internal adjacency and transition-governance declaration.
- Zoom terminology must resolve to lawful GTL higher-order operations or be
  repriced before implementation.
- Selection/refinement carriers such as `RefinementBoundary` and
  `CandidateFamily` are first-class language configuration surfaces.

The missing ABG capability is structural: the current TypeScript core has
graph-level `substitute(outer: Graph, contractVectorId: string, inner: Graph)`,
but not a first-class graph-function-level zoom operation that keeps vector
resolution internal to ABG.

## Required Shape

```text
external selection:
  parent: GraphFunction<A, B>
  target: RefinementBoundary | CandidateFamily | published traversal target
  refinement: GraphFunction<X, Y>
  policy: ZoomPolicy

ABG internal resolution:
  parentGraph = materializeGraphFunction(parent)
  targetVector = resolve target inside parentGraph
  innerGraph = materializeGraphFunction(refinement)
  zoomedGraph = substitute(parentGraph, targetVector.id, innerGraph)
  zoomedFunction = constructGraphFunction({
    inputs: parent.inputs,
    outputs: parent.outputs,
    environment: parent.environment plus lawful carried refinements,
    template: inline_graph(zoomedGraph),
    declarations: parent + zoom provenance
  })

result:
  GraphFunction<A, B> or admitted GraphFunctionZoomPlan result
```

The operator-facing word is `zoom`, but the implementation remains typed
graph-function algebra. It is not step injection and not vector cursor movement.

## Required Design Law

- `GraphFunctionZoomPlan` or equivalent carrier is subordinate to GTL/ABG; it is
  not a new public path carrier.
- The public callable remains the parent or resulting `GraphFunction`.
- Any `GraphVector` citation is internal to ABG resolution and must be paired
  with parent graph-function identity plus `RefinementBoundary`,
  `CandidateFamily`, or published traversal target authority.
- Recursive zoom is just another graph-function refinement over the same outer
  contract law. It must not require a hidden controller.
- Dynamic zoom selection is deferred unless expressed as selection among
  admitted candidates or refinement boundaries. Deterministic zoom may be
  declared on GTL graph-function/vector declarations for the first proof.

## Acceptance Checklist

- [x] Publish design/IACS for graph-function zoom plan carriers, owners, and
  non-closure signals.
- [x] Decide whether the public TypeScript API is a first-class
  `zoomGraphFunction(...)` constructor or an explicit admitted
  `GraphFunctionZoomPlan` plus application function.
- [x] Prove parent/refinement interface compatibility at admission.
- [x] Prove vector resolution is internal and cannot be supplied as an
  executable public target.
- [x] Prove resulting graph function preserves the parent outer interface.
- [x] Prove recursive zoom over a refinement graph function.
- [x] Prove `ConsequenceTraversalAction` can reference only an admitted zoom
  selection/result and cannot become a hidden planner.
- [x] Prove public start and job binding still reject bare graph-vector targets.
- [x] Run focused T-155 unit tests, semantic build, and relevant conformance
  regression pack.

## Implementation And Verification - 2026-06-13

Realization:

- `constructGraphFunctionZoomPlan(...)` admits the subordinate zoom plan from a
  parent `GraphFunction`, a refinement `GraphFunction`, and at least one declared
  refinement/candidate/published-traversal authority ref. It materializes both
  graph functions, resolves exactly one target vector internally from
  declaration truth, validates `substitute(...)`, and preserves the parent outer
  input/output contract.
- `applyGraphFunctionZoomPlan(...)` reapplies the admitted plan, revalidates the
  plan authority against parent graph declarations, rejects forged target-vector
  retargeting, and returns a `GraphFunction` with the parent public interface
  and an inline refined graph.
- `zoomGraphFunction(...)` is the convenience API over the same admitted plan and
  application path.
- The public M01 algebra entrypoint exports the zoom APIs. No public API accepts
  a bare `GraphVector`, `targetVectorIndex`, or relative cursor as executable
  zoom authority.

Proof:

- `npm run test:t155` passed: 14/14, including the live-style engine traversal
  of a zoomed graph function through `runEngineIterate`.
- `npm run test:semantic` passed: 806/806.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npx eslint --max-warnings=0 "test_env/tests/test_t155_graph_function_zoom_plan.test.mjs"` passed.
- `git diff --check` passed.

Release status: shipped in `@abiogenesis/typescript-tenant@4.0.0-rc.19`.
The release snapshot lives at
`release_snapshots/abiogenesis-typescript-tenant/4.0.0-rc.19/`, with `latest`
pointing to `4.0.0-rc.19`.

## Relationship To T-152

T-152 owns the static conformance gate and runtime re-entry inventory. It may
prove that supplied GTL program inventory contains the required graph-function,
candidate/refinement, and target-vector binding truth. It does not own the new
graph-function zoom operation itself.

This ticket owns the ABG/GTL zoom gap surfaced by T-152/T-165 downstream depth
work: the missing prime graph-function-level capability that prevents downstream
products from implementing depth traversal as product-local cursor movement.
