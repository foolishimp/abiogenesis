// Validates: REQ-F-ODDSDLC-020
// Validates: REQ-F-ODDSDLC-035
// Investigates: T-039

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcProjectConstraints,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain
} from "../../build/semantic/code/src/index.js";

function ingressReport() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t039",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t039",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["query-domain"]
    }),
    sourceInputs: []
  });
}

function graphFunctionByName(module, name) {
  const graphFunction = module.graphFunctions.find((candidate) => candidate.name === name);
  assert.notEqual(graphFunction, undefined);
  return graphFunction;
}

function replaceGraphFunction(module, name, replacement) {
  return {
    ...module,
    graphFunctions: module.graphFunctions.map((graphFunction) =>
      graphFunction.name === name ? replacement : graphFunction
    )
  };
}

test("T-039 query-domain rejects same-name output drift before publishing ownership truth", () => {
  const module = constructSdlcGtlModule();
  const codeGraphFunction = graphFunctionByName(module, "derive_code_surface");
  const wrongOutput = graphFunctionByName(module, "derive_intent_surface").outputs[0];
  const staleModule = replaceGraphFunction(module, "derive_code_surface", {
    ...codeGraphFunction,
    outputs: [wrongOutput]
  });

  assert.throws(
    () =>
      projectSdlcQueryDomain({
        module: staleModule,
        ingressReport: ingressReport()
      }),
    /structural drift[\s\S]*derive_code_surface\.materialize[\s\S]*outputs/
  );
});

test("T-039 query-domain rejects same-name vector drift before publishing graph truth", () => {
  const module = constructSdlcGtlModule();
  const productGraphFunction = graphFunctionByName(module, "derive_product_surface");
  assert.equal(productGraphFunction.template.kind, "inline_graph");
  const graph = productGraphFunction.template.graph;
  const staleGraphFunction = {
    ...productGraphFunction,
    template: {
      ...productGraphFunction.template,
      graph: {
        ...graph,
        vectors: graph.vectors.map((vector, index) =>
          index === 0 ? { ...vector, name: "derive_product_surface_drifted" } : vector
        )
      }
    }
  };
  const staleModule = replaceGraphFunction(module, "derive_product_surface", staleGraphFunction);

  assert.throws(
    () =>
      projectSdlcQueryDomain({
        module: staleModule,
        ingressReport: ingressReport()
      }),
    /structural drift[\s\S]*derive_product_surface\.vectorSignatures/
  );
});

test("T-039 query-domain rejects stale start-target structure before public target use", () => {
  const module = constructSdlcGtlModule();
  const staleModule = {
    ...module,
    jobs: []
  };

  assert.throws(
    () =>
      projectSdlcQueryDomain({
        module: staleModule,
        ingressReport: ingressReport()
      }),
    /structural drift[\s\S]*startTargets/
  );
});
