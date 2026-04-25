// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Investigates: T-059

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

function genericNode(id, name) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: "" },
    markov: [],
    assetSurface: {},
    tags: []
  });
}

function genericSingleHopGraphFunction() {
  const source = genericNode("node-t059-a", "A");
  const target = genericNode("node-t059-b", "B");
  const vector = edge([source], target, {
    id: "graph-t059-fg1",
    name: "A->B",
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: { entries: [] },
    tags: ["t059", "generic_single_hop"]
  }).vectors[0];

  return graphFunctionForVector(vector, {
    id: "graph-function-t059-fg1",
    name: "Fg_1",
    declarations: { entries: [] },
    tags: ["t059", "generic_single_hop"]
  });
}

function moduleFor(graphFunction) {
  return admitModule({
    name: "t059_generic_single_hop_module",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-t059-fg1",
        name: "Fg_1_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t059"]
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
    workerId: "worker://t059",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function startIntent() {
  return admitStartIntent({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/t059-generic-single-hop",
      moduleName: "t059_generic_single_hop_module"
    },
    target: {
      kind: "graph_function",
      handle: "Fg_1"
    },
    until: "converged"
  });
}

function policyFor(regime) {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: `policy://t059/${regime}`,
    defaultRegime: regime,
    dispatchRef: regime === "F_P" ? "dispatch://t059" : null,
    approvalSubjectRef: regime === "F_H" ? "approval://t059" : null
  });
}

function basisFor(regime) {
  const graphFunction = genericSingleHopGraphFunction();
  return admitExecutionBasis({
    startIntent: startIntent(),
    module: moduleFor(graphFunction),
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: policyFor(regime),
    runId: `run://t059/${regime}`,
    workKey: `wk://t059/${regime}`,
    frameId: null,
    frameLineageId: null
  });
}

test("T-059 investigation: generic single-hop Fg_1 exposes one open structural edge", () => {
  const basis = basisFor("F_D");
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const decision = deriveIterationAdvanceDecision(basis, projection);
  const iterationEvents = runtimeEventsForIterationDecision(decision);
  const vector = basis.graph.vectors[0];

  assert.equal(basis.graphFunction.name, "Fg_1");
  assert.equal(basis.graph.vectors.length, 1);
  assert.equal(vector.name, "A->B");
  assert.equal(vector.source[0].schema.ref, "");
  assert.equal(vector.target.schema.ref, "");
  assert.equal(vector.source[0].assetSurface.kind, "");
  assert.equal(vector.target.assetSurface.kind, "");
  assert.deepStrictEqual(vector.operators, []);
  assert.deepStrictEqual(vector.evaluators, []);
  assert.equal(vector.rule, null);

  assert.equal(projection.nextVectorIndex, 0);
  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.edge, "A->B");
  assert.equal(decision.regime, "F_D");
  assert.deepStrictEqual(
    iterationEvents.map((event) => event.kind),
    ["graph_call_opened", "frame_opened", "vector_traversal_planned"]
  );
});

test("T-059 investigation: policy basis selects F_D, F_P, or F_H transition over the same Fg_1 carrier", () => {
  const fdTransition = deriveAdvancementTransition(basisFor("F_D"));
  const fpTransition = deriveAdvancementTransition(basisFor("F_P"));
  const fhTransition = deriveAdvancementTransition(basisFor("F_H"));

  assert.equal(fdTransition.kind, "fd_advance");
  assert.equal(fdTransition.edge, "A->B");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fdTransition.basis, fdTransition).map((event) => event.kind),
    ["basis_admitted", "fd_advance_ready"]
  );

  assert.equal(fpTransition.kind, "fp_dispatch");
  assert.equal(fpTransition.edge, "A->B");
  assert.equal(fpTransition.dispatchRef, "dispatch://t059");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fpTransition.basis, fpTransition).map((event) => event.kind),
    ["basis_admitted", "fp_dispatch_requested"]
  );

  assert.equal(fhTransition.kind, "fh_escalation");
  assert.equal(fhTransition.edge, "A->B");
  assert.equal(fhTransition.approvalSubjectRef, "approval://t059");
  assert.deepStrictEqual(
    runtimeEventsForTransition(fhTransition.basis, fhTransition).map((event) => event.kind),
    ["basis_admitted", "fh_escalated"]
  );
});

test("T-059 investigation: absent policy basis fails closed before execution-basis admission", () => {
  assert.throws(
    () =>
      admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://t059/no-basis"
      }),
    /defaultRegime/
  );
});
