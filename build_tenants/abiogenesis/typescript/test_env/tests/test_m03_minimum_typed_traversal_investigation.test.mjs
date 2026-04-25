// Validates: REQ-L-GTL3-NODE
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Investigates: T-061

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  edge,
  graphFunctionForVector,
  runtimeEventsForIterationDecision,
  runtimeEventsForTransition
} from "../../build/semantic/code/src/index.js";

function typedNode(id, name, typeName) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://${typeName}` },
    markov: [],
    assetSurface: {
      kind: typeName,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: [`type:${typeName}`, "minimum_typed_traversal"]
  });
}

function minimumTypedTraversalGraphFunction() {
  const source = typedNode("node-t061-a1", "A_1", "A_1");
  const target = typedNode("node-t061-a2", "A_2", "A_2");
  const vector = edge([source], target, {
    id: "graph-t061-typed-a1-a2",
    name: "A_1->A_2",
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: { entries: [] },
    tags: ["t061", "minimum_typed_traversal"]
  }).vectors[0];

  return graphFunctionForVector(vector, {
    id: "graph-function-t061-gf-typed-001",
    name: "GF_TYPED_001",
    declarations: { entries: [] },
    tags: ["t061", "minimum_typed_traversal"]
  });
}

function moduleFor(graphFunction) {
  return admitModule({
    name: "t061_minimum_typed_traversal_module",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-t061-gf-typed-001",
        name: "GF_TYPED_001_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t061"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://t061",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function startIntent() {
  return admitStartIntent({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/t061-minimum-typed-traversal",
      moduleName: "t061_minimum_typed_traversal_module"
    },
    target: {
      kind: "graph_function",
      handle: "GF_TYPED_001"
    },
    until: "converged"
  });
}

function policyFor(regime) {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: `policy://t061/${regime}`,
    defaultRegime: regime,
    dispatchRef: regime === "F_P" ? "dispatch://t061" : null,
    approvalSubjectRef: regime === "F_H" ? "approval://t061" : null
  });
}

function basisFor(regime) {
  const graphFunction = minimumTypedTraversalGraphFunction();
  return admitExecutionBasis({
    startIntent: startIntent(),
    module: moduleFor(graphFunction),
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: policyFor(regime),
    runId: `run://t061/${regime}`,
    workKey: `wk://t061/${regime}`,
    frameId: null,
    frameLineageId: null
  });
}

test("T-061 investigation: minimum typed GF_TYPED_001 exposes typed interface without edge-local compute carriers", () => {
  const basis = basisFor("F_D");
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const decision = deriveIterationAdvanceDecision(basis, projection);
  const iterationEvents = runtimeEventsForIterationDecision(decision);
  const vector = basis.graph.vectors[0];

  assert.equal(basis.graphFunction.name, "GF_TYPED_001");
  assert.equal(basis.graph.vectors.length, 1);
  assert.equal(vector.name, "A_1->A_2");
  assert.equal(vector.source[0].name, "A_1");
  assert.equal(vector.target.name, "A_2");
  assert.equal(vector.source[0].schema.ref, "schema://A_1");
  assert.equal(vector.target.schema.ref, "schema://A_2");
  assert.equal(vector.source[0].assetSurface.kind, "A_1");
  assert.equal(vector.target.assetSurface.kind, "A_2");
  assert.deepStrictEqual(vector.operators, []);
  assert.deepStrictEqual(vector.evaluators, []);
  assert.equal(vector.rule, null);

  assert.deepStrictEqual(
    basis.graphFunction.inputs.map((node) => node.name),
    ["A_1"]
  );
  assert.deepStrictEqual(
    basis.graphFunction.outputs.map((node) => node.name),
    ["A_2"]
  );

  assert.equal(projection.nextVectorIndex, 0);
  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.edge, "A_1->A_2");
  assert.equal(decision.regime, "F_D");
  assert.deepStrictEqual(
    iterationEvents.map((event) => event.kind),
    ["graph_call_opened", "frame_opened", "vector_traversal_planned"]
  );
});

test("T-061 investigation: type/interface authority does not choose F_D, F_P, or F_H", () => {
  const fdTransition = deriveAdvancementTransition(basisFor("F_D"));
  const fpTransition = deriveAdvancementTransition(basisFor("F_P"));
  const fhTransition = deriveAdvancementTransition(basisFor("F_H"));

  assert.equal(fdTransition.kind, "fd_advance");
  assert.equal(fdTransition.edge, "A_1->A_2");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fdTransition.basis, fdTransition).map((event) => event.kind),
    ["basis_admitted", "fd_advance_ready"]
  );

  assert.equal(fpTransition.kind, "fp_dispatch");
  assert.equal(fpTransition.edge, "A_1->A_2");
  assert.equal(fpTransition.dispatchRef, "dispatch://t061");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fpTransition.basis, fpTransition).map((event) => event.kind),
    ["basis_admitted", "fp_dispatch_requested"]
  );

  assert.equal(fhTransition.kind, "fh_escalation");
  assert.equal(fhTransition.edge, "A_1->A_2");
  assert.equal(fhTransition.approvalSubjectRef, "approval://t061");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fhTransition.basis, fhTransition).map((event) => event.kind),
    ["basis_admitted", "fh_escalated"]
  );
});

test("T-061 investigation: absent policy basis still fails closed for typed traversal", () => {
  assert.throws(
    () =>
      admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://t061/no-basis"
      }),
    /defaultRegime/
  );
});
