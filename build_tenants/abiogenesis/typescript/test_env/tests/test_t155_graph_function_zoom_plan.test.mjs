// Validates: T-155
// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-HOF
// Validates: REQ-L-GTL3-SUBSTITUTE

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitConsequenceTraversalAction,
  admitModule,
  applyGraphFunctionZoomPlan,
  compose,
  constructGraphFunctionZoomPlan,
  edge,
  graphFunctionForVector,
  GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
  materializeGraphFunction,
  zoomGraphFunction
} from "../../build/semantic/code/src/index.js";
import {
  attrs,
  buildT155ZoomedGraphFunction,
  buildT155ZoomFixture,
  emptyAttrs,
  scalarEntry,
  T155_CANDIDATE_FAMILY_REF,
  T155_REFINEMENT_BOUNDARY_REF
} from "./support/t155-graph-function-zoom-fixtures.mjs";

function declarationKeys(graphFunction) {
  return graphFunction.declarations.entries.map((entry) => entry.key);
}

function zoomDeclarationKeys(graphFunction) {
  return declarationKeys(graphFunction).filter((key) =>
    key.startsWith("graph_function_zoom:")
  );
}

test("T-155 graph-function zoom replaces a declared vector and preserves outer contract", () => {
  const fixture = buildT155ZoomFixture();
  const result = zoomGraphFunction({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF,
    name: "fn:t155/requirements-code/zoomed"
  });
  const zoomedGraph = materializeGraphFunction(result.graphFunction);

  assert.equal(result.kind, "graph_function_zoom_result");
  assert.equal(result.plan.kind, "graph_function_zoom_plan");
  assert.equal(result.plan.parentGraphFunctionRef, fixture.parent.id);
  assert.equal(result.plan.refinementGraphFunctionRef, fixture.refinement.id);
  assert.equal(result.plan.refinementBoundaryRef, T155_REFINEMENT_BOUNDARY_REF);
  assert.deepEqual(
    result.graphFunction.inputs.map((node) => node.id),
    fixture.parent.inputs.map((node) => node.id)
  );
  assert.deepEqual(
    result.graphFunction.outputs.map((node) => node.id),
    fixture.parent.outputs.map((node) => node.id)
  );
  assert.deepEqual(
    zoomedGraph.vectors.map((vector) => vector.name),
    ["requirements→design", "design→code"]
  );
  assert.equal(
    zoomedGraph.vectors.some((vector) => vector.name === "requirements→code"),
    false
  );
  assert.deepEqual(zoomDeclarationKeys(result.graphFunction), [
    `graph_function_zoom:${result.plan.planRef}`
  ]);
});

test("T-155 graph-function zoom can be constructed and applied as separate admitted steps", () => {
  const fixture = buildT155ZoomFixture();
  const plan = constructGraphFunctionZoomPlan({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF,
    planRef: "graph-function-zoom-plan://t155/separate-apply"
  });
  const graphFunction = applyGraphFunctionZoomPlan({
    parent: fixture.parent,
    refinement: fixture.refinement,
    plan,
    name: "fn:t155/separate-apply"
  });

  assert.equal(plan.planRef, "graph-function-zoom-plan://t155/separate-apply");
  assert.deepEqual(
    materializeGraphFunction(graphFunction).vectors.map((vector) => vector.name),
    ["requirements→design", "design→code"]
  );
});

test("T-155 graph-function zoom rejects forged apply plans without admitted authority", () => {
  const fixture = buildT155ZoomFixture();
  const plan = constructGraphFunctionZoomPlan({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF
  });
  const forgedPlan = Object.freeze({
    ...plan,
    refinementBoundaryRef: null,
    authorityRefs: Object.freeze([])
  });

  assert.throws(
    () =>
      applyGraphFunctionZoomPlan({
        parent: fixture.parent,
        refinement: fixture.refinement,
        plan: forgedPlan
      }),
    /requires RefinementBoundary, CandidateFamily, or published traversal target authority/u
  );
});

test("T-155 graph-function zoom rejects forged apply plans that retarget vectors", () => {
  const fixture = buildT155ZoomFixture();
  const first = zoomGraphFunction({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF,
    name: "fn:t155/first-zoom/forged-apply"
  });
  const plan = constructGraphFunctionZoomPlan({
    parent: first.graphFunction,
    refinement: fixture.recursiveRefinement,
    candidateFamilyRef: T155_CANDIDATE_FAMILY_REF
  });
  const graph = materializeGraphFunction(first.graphFunction);
  const wrongVector = graph.vectors.find(
    (vector) => vector.name === "requirements→design"
  );
  assert.ok(wrongVector);

  const forgedPlan = Object.freeze({
    ...plan,
    targetGraphVectorRef: wrongVector.id,
    targetGraphVectorName: wrongVector.name,
    targetSourceNodeRefs: Object.freeze(
      wrongVector.source.map((node) => node.id)
    ),
    targetNodeRef: wrongVector.target.id
  });

  assert.throws(
    () =>
      applyGraphFunctionZoomPlan({
        parent: first.graphFunction,
        refinement: fixture.recursiveRefinement,
        plan: forgedPlan
      }),
    /target vector authority mismatch/u
  );
});

test("T-155 graph-function zoom supports recursive typed refinement", () => {
  const fixture = buildT155ZoomFixture();
  const first = zoomGraphFunction({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF,
    name: "fn:t155/first-zoom"
  });
  const second = zoomGraphFunction({
    parent: first.graphFunction,
    refinement: fixture.recursiveRefinement,
    candidateFamilyRef: T155_CANDIDATE_FAMILY_REF,
    name: "fn:t155/second-zoom"
  });
  const graph = materializeGraphFunction(second.graphFunction);

  assert.deepEqual(
    graph.vectors.map((vector) => vector.name),
    ["requirements→design", "design→tests", "tests→code"]
  );
  assert.deepEqual(
    second.graphFunction.inputs.map((node) => node.id),
    fixture.parent.inputs.map((node) => node.id)
  );
  assert.deepEqual(
    second.graphFunction.outputs.map((node) => node.id),
    fixture.parent.outputs.map((node) => node.id)
  );
  assert.equal(zoomDeclarationKeys(second.graphFunction).length, 2);
});

test("T-155 graph-function zoom fails closed without declared authority", () => {
  const fixture = buildT155ZoomFixture();

  assert.throws(
    () =>
      constructGraphFunctionZoomPlan({
        parent: fixture.parent,
        refinement: fixture.refinement
      }),
    /requires RefinementBoundary, CandidateFamily, or published traversal target authority/u
  );
});

test("T-155 graph-function zoom ignores product-local cursor fields without admitted authority", () => {
  const fixture = buildT155ZoomFixture();

  assert.throws(
    () =>
      constructGraphFunctionZoomPlan({
        parent: fixture.parent,
        refinement: fixture.refinement,
        targetVectorIndex: 0
      }),
    /requires RefinementBoundary, CandidateFamily, or published traversal target authority/u
  );
});

test("T-155 graph-function zoom fails closed when authority does not resolve", () => {
  const fixture = buildT155ZoomFixture();

  assert.throws(
    () =>
      constructGraphFunctionZoomPlan({
        parent: fixture.parent,
        refinement: fixture.refinement,
        refinementBoundaryRef: "refinement-boundary://t155/missing"
      }),
    /target did not resolve/u
  );
});

test("T-155 graph-function zoom fails closed when authority is ambiguous", () => {
  const fixture = buildT155ZoomFixture();
  const duplicate = compose(
    graphFunctionForVector(
      edge([fixture.nodes.requirements], fixture.nodes.design, {
        name: "requirements→design:a",
        declarations: attrs([
          scalarEntry(
            GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
            T155_REFINEMENT_BOUNDARY_REF
          )
        ])
      }).vectors[0],
      { name: "fn:requirements-design-a", declarations: emptyAttrs() }
    ),
    graphFunctionForVector(
      edge([fixture.nodes.design], fixture.nodes.code, {
        name: "design→code:a",
        declarations: attrs([
          scalarEntry(
            GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
            T155_REFINEMENT_BOUNDARY_REF
          )
        ])
      }).vectors[0],
      { name: "fn:design-code-a", declarations: emptyAttrs() }
    )
  );

  assert.throws(
    () =>
      constructGraphFunctionZoomPlan({
        parent: duplicate,
        refinement: fixture.refinement,
        refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF
      }),
    /target is ambiguous/u
  );
});

test("T-155 module publication still rejects a job that targets the resolved vector", () => {
  const { first } = buildT155ZoomedGraphFunction();
  const graph = materializeGraphFunction(first.graphFunction);
  const vector = graph.vectors[0];
  assert.ok(vector);

  assert.throws(
    () =>
      admitModule({
        name: "t155_vector_target_rejected",
        graphs: [graph],
        graphFunctions: [first.graphFunction],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job://t155/vector-target",
            name: "t155_vector_target",
            contracts: [{ kind: "graph_function", targetId: vector.id }],
            roles: [],
            tags: ["t155"],
            policyHooks: emptyAttrs()
          }
        ],
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        policyHooks: emptyAttrs(),
        metadata: emptyAttrs()
      }),
    /targets unpublished graph function id/u
  );
});

test("T-155 consequence traversal action cannot turn a zoom-internal vector into authority", () => {
  const { first } = buildT155ZoomedGraphFunction();
  const graph = materializeGraphFunction(first.graphFunction);
  const vector = graph.vectors[0];
  assert.ok(vector);

  assert.throws(
    () =>
      admitConsequenceTraversalAction({
        kind: "consequence_traversal_action",
        actionRef: "action://t155/no-vector-authority",
        consequenceRef: "consequence://t155/no-vector-authority",
        strategyDecisionRef: "strategy://t155/no-vector-authority",
        parentObligationRef: "obligation://t155/no-vector-authority",
        actionKind: "reenter_graph_span",
        selectedGraphFunctionRef: first.graphFunction.id,
        selectedOverlayRef: null,
        selectedCandidateFamilyRef: null,
        selectedRefinementBoundaryRef: null,
        selectedTraversalTargetRef: null,
        sourceNodeRef: vector.source[0].id,
        targetNodeRef: vector.target.id,
        graphVectorRef: vector.id,
        graphSpanRef: "graph-span://t155/no-vector-authority",
        reentryTargetRef: "graph-reentry-point://realization/0",
        targetOutcomeRef: "outcome://t155/no-vector-authority",
        inputAssetRefs: vector.source.map((node) => node.id),
        expectedOutputAssetRefs: [vector.target.id],
        requiredAuthorityRefs: ["REQ-L-GTL3-GRAPHFUNCTION"],
        proportionalityBasisRefs: ["proof://t155/no-vector-authority"],
        evidencePolicyRef: "evidence-policy://t155",
        foldbackPolicyRef: "foldback-policy://t155",
        nonAdmissionReasonRefs: []
      }),
    /targeting an internal graph vector requires refinement boundary, candidate family, or published traversal target authority/u
  );
});

test("T-155 graph-function zoom rejects incompatible refinement interfaces", () => {
  const fixture = buildT155ZoomFixture();
  const badRefinement = graphFunctionForVector(
    edge([fixture.nodes.design], fixture.nodes.tests, {
      name: "design→tests:bad",
      declarations: emptyAttrs()
    }).vectors[0],
    { name: "fn:bad-refinement", declarations: emptyAttrs() }
  );

  assert.throws(
    () =>
      constructGraphFunctionZoomPlan({
        parent: fixture.parent,
        refinement: badRefinement,
        refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF
      }),
    /inner.inputs .* not subset of vector source/u
  );
});

test("T-155 package entrypoints expose graph-function zoom through the bounded M01 surface", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m01 = await import("@abiogenesis/typescript-tenant/gtl/m01");

  assert.equal(typeof root.zoomGraphFunction, "function");
  assert.equal(typeof root.constructGraphFunctionZoomPlan, "function");
  assert.equal(root.zoomGraphFunction, m01.zoomGraphFunction);
  assert.equal(
    root.GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
    "gtl.zoom.refinement_boundary_ref"
  );
});
