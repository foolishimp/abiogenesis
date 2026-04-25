// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Investigates: T-062

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitEvaluator,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitOperator,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  deriveTraversalStructureProbe,
  edge,
  graphFunctionForVector
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
    tags: [`type:${typeName}`]
  });
}

function definedOperators() {
  return [
    admitOperator({
      name: "T_001_FD",
      regime: "F_D",
      binding: "operator://GF_001/T_001/F_D",
      tags: ["transform", "A_1->A_2"]
    }),
    admitOperator({
      name: "T_001_FP",
      regime: "F_P",
      binding: "operator://GF_001/T_001/F_P",
      tags: ["transform", "A_1->A_2"]
    })
  ];
}

function definedEvaluators() {
  return [
    admitEvaluator({
      name: "E_001_FD",
      regime: "F_D",
      description: "Deterministically evaluates A_2 against A_1.",
      binding: "evaluator://GF_001/E_001/F_D",
      tags: ["evaluate", "A_1->A_2"]
    }),
    admitEvaluator({
      name: "E_001_FP",
      regime: "F_P",
      description: "Probabilistically evaluates A_2 against A_1.",
      binding: "evaluator://GF_001/E_001/F_P",
      tags: ["evaluate", "A_1->A_2"]
    })
  ];
}

function graphFunctionForScenario(scenario) {
  const source =
    scenario === "undefined"
      ? genericNode("node-t062-a", "A")
      : typedNode(`node-t062-${scenario}-a1`, "A_1", "A_1");
  const target =
    scenario === "undefined"
      ? genericNode("node-t062-b", "B")
      : typedNode(`node-t062-${scenario}-a2`, "A_2", "A_2");
  const vector = edge([source], target, {
    id: `graph-t062-${scenario}`,
    name: scenario === "undefined" ? "A->B" : "A_1->A_2",
    operators: scenario === "defined" ? definedOperators() : [],
    evaluators: scenario === "defined" ? definedEvaluators() : [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: { entries: [] },
    tags: ["t062", scenario]
  }).vectors[0];

  return graphFunctionForVector(vector, {
    id: `graph-function-t062-${scenario}`,
    name:
      scenario === "undefined"
        ? "Fg_1"
        : scenario === "typed"
          ? "GF_TYPED_001"
          : "GF_001",
    declarations: { entries: [] },
    tags: ["t062", scenario]
  });
}

function moduleFor(graphFunction, scenario) {
  return admitModule({
    name: `t062_${scenario}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job-t062-${scenario}`,
        name: `${graphFunction.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t062", scenario]
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
    workerId: "worker://t062",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function policyFor(regime) {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: `policy://t062/${regime}`,
    defaultRegime: regime,
    dispatchRef: regime === "F_P" ? "dispatch://t062" : null,
    approvalSubjectRef: regime === "F_H" ? "approval://t062" : null
  });
}

function basisFor(scenario, regime = "F_D") {
  const graphFunction = graphFunctionForScenario(scenario);
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/t062-${scenario}`,
        moduleName: `t062_${scenario}_module`
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    }),
    module: moduleFor(graphFunction, scenario),
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: policyFor(regime),
    runId: `run://t062/${scenario}/${regime}`,
    workKey: `wk://t062/${scenario}/${regime}`,
    frameId: null,
    frameLineageId: null
  });
}

test("T-062 probe: undefined traversal reports structural morphism and forbidden overclaims", () => {
  const probe = deriveTraversalStructureProbe(basisFor("undefined"));

  assert.equal(probe.kind, "traversal_structure_probe");
  assert.equal(probe.graphFunctionName, "Fg_1");
  assert.equal(probe.structureKind, "undefined_structural_morphism");
  assert.equal(probe.edge, "A->B");
  assert.equal(probe.hasTypedInterface, false);
  assert.equal(probe.hasDeclaredComputeCarriers, false);
  assert.deepStrictEqual(probe.sourceNodes.map((node) => node.schemaRef), [""]);
  assert.equal(probe.targetNode.schemaRef, "");
  assert.deepStrictEqual(probe.operators, []);
  assert.deepStrictEqual(probe.evaluators, []);
  assert.equal(probe.transitionKind, "fd_advance");
  assert.deepStrictEqual(probe.iterationEventKinds, [
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned"
  ]);
  assert.deepStrictEqual(probe.transitionEventKinds, [
    "basis_admitted",
    "fd_advance_ready"
  ]);
  assert(probe.allowedClaims.includes("edge_shape_visible"));
  assert(probe.notAllowedClaims.includes("typed_interface_not_implied"));
  assert(probe.notAllowedClaims.includes("domain_transform_not_implied"));
  assert(probe.notAllowedClaims.includes("domain_evaluation_not_implied"));
  assert(probe.notAllowedClaims.includes("declared_compute_not_implied"));
  assert(probe.notAllowedClaims.includes("runtime_regime_fallback_not_implied"));
});

test("T-062 probe: minimum typed traversal reports typed interface without compute authority", () => {
  const probe = deriveTraversalStructureProbe(basisFor("typed"));

  assert.equal(probe.graphFunctionName, "GF_TYPED_001");
  assert.equal(probe.structureKind, "typed_structural_morphism");
  assert.equal(probe.edge, "A_1->A_2");
  assert.equal(probe.hasTypedInterface, true);
  assert.equal(probe.hasDeclaredComputeCarriers, false);
  assert.deepStrictEqual(probe.sourceNodes.map((node) => node.schemaRef), [
    "schema://A_1"
  ]);
  assert.equal(probe.targetNode.schemaRef, "schema://A_2");
  assert.deepStrictEqual(probe.operators, []);
  assert.deepStrictEqual(probe.evaluators, []);
  assert(probe.allowedClaims.includes("typed_interface_visible"));
  assert(probe.notAllowedClaims.includes("domain_transform_not_implied"));
  assert(probe.notAllowedClaims.includes("domain_evaluation_not_implied"));
  assert(probe.notAllowedClaims.includes("declared_compute_not_implied"));
});

test("T-062 probe: minimum defined traversal reports declared transform and evaluator surfaces", () => {
  const probe = deriveTraversalStructureProbe(basisFor("defined", "F_P"));

  assert.equal(probe.graphFunctionName, "GF_001");
  assert.equal(probe.structureKind, "defined_constructive_morphism");
  assert.equal(probe.edge, "A_1->A_2");
  assert.equal(probe.hasTypedInterface, true);
  assert.equal(probe.hasDeclaredComputeCarriers, true);
  assert.deepStrictEqual(probe.declaredOperatorRegimes, ["F_D", "F_P"]);
  assert.deepStrictEqual(probe.declaredEvaluatorRegimes, ["F_D", "F_P"]);
  assert.deepStrictEqual(
    probe.operators.map((operator) => operator.name),
    ["T_001_FD", "T_001_FP"]
  );
  assert.deepStrictEqual(
    probe.evaluators.map((evaluator) => evaluator.name),
    ["E_001_FD", "E_001_FP"]
  );
  assert.equal(probe.policyRegime, "F_P");
  assert.equal(probe.transitionKind, "fp_dispatch");
  assert(probe.allowedClaims.includes("operator_surface_visible"));
  assert(probe.allowedClaims.includes("evaluator_surface_visible"));
  assert(probe.allowedClaims.includes("declared_compute_surface_visible"));
  assert(!probe.notAllowedClaims.includes("domain_transform_not_implied"));
  assert(!probe.notAllowedClaims.includes("domain_evaluation_not_implied"));
  assert(probe.notAllowedClaims.includes("identity_not_implied"));
  assert(probe.notAllowedClaims.includes("domain_completion_not_implied"));
});
