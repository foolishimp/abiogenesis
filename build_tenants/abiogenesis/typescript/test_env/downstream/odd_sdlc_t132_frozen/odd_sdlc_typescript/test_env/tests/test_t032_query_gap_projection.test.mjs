// Validates: REQ-F-ODDSDLC-020
// Validates: REQ-F-ODDSDLC-035
// Investigates: T-032

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorClosedEvent,
  constructVectorTraversalPlannedEvent
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  constructSdlcGtlModule,
  deriveSdlcGapDossier,
  deriveSdlcWorkspaceIngressReport,
  evalSdlcGapFromReplay,
  projectSdlcQueryDomain,
  projectSdlcSpanAnalysis
} from "../../build/semantic/code/src/index.js";

function moduleBasis(handle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t032",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t032/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t032",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t032",
    workKey: "wk://odd-sdlc/t032",
    frameId: null,
    frameLineageId: null
  });
}

function ingressReport() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t032",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t032",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["query-domain"]
    }),
    sourceInputs: []
  });
}

test("T-032 query-domain is a read-only projection over catalogs and module publication", () => {
  const module = constructSdlcGtlModule();
  const projection = projectSdlcQueryDomain({
    module,
    ingressReport: ingressReport(),
    currentDossierRefs: ["dossier://derive_intent_surface"]
  });

  assert.equal(projection.kind, "sdlc_query_domain_projection");
  assert.equal(projection.runtimeModel, "abg-native");
  assert.equal(projection.readOnly, true);
  assert.deepStrictEqual(projection.emittedRuntimeEventKinds, []);
  assert(projection.graphFunctions.some((entry) => entry.name === "bootstrap_release_self_test"));
  assert(projection.graphFunctions.some((entry) => entry.name === "Fg_conform_project_authority"));
  assert(projection.functions.some((entry) => entry.name === "derive_code_surface"));
  assert(projection.programs.some((entry) => entry.name === "release_operational_cycle"));
  assert(projection.startTargets.some((entry) => entry.name === "derive_intent_surface"));
  assert(
    projection.assetOwnership.some(
      (entry) =>
        entry.assetType === "release_surface" &&
        entry.producerGraphFunctions.includes("prepare_release_surface")
    )
  );
  assert(
    projection.targetBindings.some(
      (entry) =>
        entry.declaredTargetAssetType === "intent_surface" &&
        entry.admissibleGraphFunctionNames.includes("derive_intent_surface")
    )
  );
});

test("T-032 query-domain fails closed when admitted module drifts from catalog truth", () => {
  const module = constructSdlcGtlModule();
  const staleModule = {
    ...module,
    graphFunctions: module.graphFunctions.filter(
      (graphFunction) => graphFunction.name !== "prepare_release_surface"
    )
  };

  assert.throws(
    () =>
      projectSdlcQueryDomain({
        module: staleModule,
        ingressReport: ingressReport()
      }),
    /missing graph functions/
  );
});

test("T-032 gaps and dossiers read ABI replay truth without emitting events", () => {
  const basis = moduleBasis();
  const open = evalSdlcGapFromReplay({ basis, events: [] });
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "advanced" })
  ];
  const partial = evalSdlcGapFromReplay({ basis, events });
  const dossier = deriveSdlcGapDossier({
    basis,
    events,
    triageInput: "operator-review",
    evidenceRefs: ["event://vector-0-closed"]
  });

  assert.equal(open.status, "open");
  assert.equal(open.evaluationFunction, "eval_gap");
  assert.match(open.productAssetModelRef, /^product-asset-model:\/\/odd-sdlc\//);
  assert.equal(open.choosesNextTraversal, false);
  assert.equal(open.evaluatesActionClosure, false);
  assert.equal(open.currentEdge, "derive_intent_surface");
  assert.deepStrictEqual(open.emittedRuntimeEventKinds, []);
  assert.equal(partial.status, "partial");
  assert.equal(partial.currentEdge, "derive_product_surface");
  assert.equal(dossier.edge, "derive_product_surface");
  assert.equal(dossier.gapEvaluationFunction, "eval_gap");
  assert.equal(dossier.nextActionEvaluationFunction, "evaluate_next");
  assert.equal(dossier.actionClosureEvaluationFunction, null);
  assert.equal(dossier.nextActionBasisKind, "initial_selection");
  assert.deepStrictEqual(dossier.intentEventRefs, [
    "event://odd-sdlc/intent/operator-review"
  ]);
  assert.equal(dossier.productAssetModelRef, partial.productAssetModelRef);
  assert(dossier.gapPressureRefs.length > 0);
  assert(dossier.targetBindingRefs.length > 0);
  assert(dossier.actionCatalogRefs.length > 0);
  assert.equal(dossier.choosesNextTraversal, false);
  assert.equal(
    dossier.rankingAuthority,
    "abiogenesis_construction_priority_projection"
  );
  assert.equal(dossier.localRankingAuthority, false);
  assert.match(
    dossier.nextActionProjectionRef,
    /^construction-priority-projection:/
  );
  assert.equal(dossier.bestGraphFunctionRef, basis.graphFunction.name);
  assert.equal(
    dossier.bestGraphVectorRef,
    basis.graph.vectors[1].name
  );
  assert.deepStrictEqual(dossier.nextLawfulActions, [dossier.bestActionRef]);
  assert(
    dossier.rankingReasonRefs.some((ref) =>
      ref.includes("domain-defaults://odd-sdlc/ts-domain-defaults-v1")
    )
  );
  assert(
    dossier.rankingReasonRefs.some((ref) =>
      ref.includes("/policy/default-follow-graph/rule/")
    )
  );
});

test("T-032 span analysis supports bounded edge selectors and rejects invalid spans", () => {
  const basis = moduleBasis();
  const span = projectSdlcSpanAnalysis({
    basis,
    fromEdge: "derive_feature_decomp_surface",
    toEdge: "derive_design_surface",
    zoom: "span"
  });

  assert.equal(span.readOnly, true);
  assert.deepStrictEqual(span.edges, [
    "derive_feature_decomp_surface",
    "derive_design_surface"
  ]);
  assert.throws(
    () =>
      projectSdlcSpanAnalysis({
        basis,
        fromEdge: "derive_design_surface",
        toEdge: "derive_feature_decomp_surface",
        zoom: "span"
      }),
    /ordered bounded edge span/
  );
});
