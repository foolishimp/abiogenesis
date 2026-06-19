// Validates: REQ-F-ODDSDLC-063
// Validates: REQ-F-ODDSDLC-064
// Validates: REQ-F-ODDSDLC-065
// Validates: REQ-F-ODDSDLC-066
// Validates: REQ-F-ODDSDLC-067
// Validates: REQ-F-ODDSDLC-068
// Investigates: T-164

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  admitSdlcEdgeEvidence,
  assertSdlcEdgeGainClosureContractsRegistered,
  assertSdlcOverlayEdgeGainClosureContracts,
  assertTraversalIntentPackagePressure,
  composeSdlcPathGain,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  constructSdlcTraversalOverlayCatalog,
  constructWorkerBrief,
  constructWorkerInvocationPackage,
  deriveSdlcGapDossier,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcEdgeObligations,
  deriveSdlcEdgeResidualPressure,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  digestSdlcEdgeGainClosureContract,
  evalSdlcGapFromReplay,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  hookContractByEdgeName,
  indexSdlcEdgeGainClosureContracts,
  materializeSdlcProjectConformance,
  measureSdlcEdgeGain,
  projectSdlcEdgeAssuranceReadModel,
  projectSdlcQueryDomain,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_EDGE_GAIN_CLOSURE_CATEGORY_TEMPLATES,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF,
  sdlcEdgeAssuranceContractRef,
  withAdditionalSdlcEdgeResidualPressureRefs
} from "../../build/semantic/code/src/index.js";

function overlayByRef(catalog, overlayRef) {
  const overlay = catalog.overlays.find((candidate) => candidate.overlayRef === overlayRef);
  assert(overlay, overlayRef);
  return overlay;
}

function unique(values) {
  return [...new Set(values)];
}

const T164_SELECTED_COMPOSITION = Object.freeze({
  compositionRef: "composition://odd-sdlc/t164/test",
  compositionDigest: "sha256:t164-test-composition",
  compositionSelectionRef: "composition-selection://odd-sdlc/t164/test",
  selectedRegimeBindingRef: null
});

function moduleGraphFunctionByName(module, name) {
  const graphFunction = module.graphFunctions.find((candidate) => candidate.name === name);
  assert(graphFunction, name);
  return graphFunction;
}

function contractByEdge(edgeRef) {
  const contract = SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.find(
    (candidate) => candidate.edgeRef === edgeRef
  );
  assert(contract, edgeRef);
  return contract;
}

function allLedgerInputsFor(contract, prefix = "ledger://t164") {
  return contract.ledgerInputKinds.map((ledgerInputKind) => ({
    kind: "sdlc_edge_ledger_input_ref",
    ledgerInputKind,
    ledgerRef: `${prefix}/${contract.edgeRef}/${ledgerInputKind}`
  }));
}

function measuredGain(edgeRef, closeReady) {
  const contract = contractByEdge(edgeRef);
  const obligationRef = `obligation://${edgeRef}/primary`;
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: closeReady
      ? [
          {
            kind: "sdlc_edge_evidence_candidate",
            evidenceRef: `evidence://${edgeRef}/behavior`,
            sourceKind: "worker_assessment",
            obligationRefs: [obligationRef],
            supportsBehavioralFulfillment: true
          }
        ]
      : []
  });
  return measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });
}

function edgeAssuranceClosureContext(edgeRef, closeReady) {
  const gain = measuredGain(edgeRef, closeReady);
  const residualPressure = deriveSdlcEdgeResidualPressure(gain);
  const edgeAssuranceCloseDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure
  });
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: T164_SELECTED_COMPOSITION,
    ledgerRef: `ledger://odd-sdlc/t164/${edgeRef}/edge-fulfillment`,
    ledgerVersionRef: `ledger-version://odd-sdlc/t164/${edgeRef}/edge-fulfillment/1`,
    edgeAssuranceContractRef: gain.contractRef,
    edgeAssuranceContractDigest: gain.contractDigest,
    targetCarrierAdmissionStatus: gain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: gain.targetCarrierAdmissionRef,
    edgeGainRef: gain.gainRef,
    edgeResidualPressureRefs: residualPressure.requiredPressureRefs,
    edgeRef: `edge://odd-sdlc/t164/${edgeRef}`,
    attemptRef: `attempt://odd-sdlc/t164/${edgeRef}/1`,
    targetBindingRefs: [`target-binding://odd-sdlc/t164/${edgeRef}`],
    evidenceBundleRefs: [`evidence://odd-sdlc/t164/${edgeRef}`],
    counts: closeReady
      ? {
          expected: 1,
          fulfilled: 1,
          partial: 0,
          blocked: 0,
          unfulfilled: 0,
          missing: 0,
          extra: 0
        }
      : {
          expected: 1,
          fulfilled: 0,
          partial: 0,
          blocked: 1,
          unfulfilled: 0,
          missing: 0,
          extra: 0
        },
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  return { gain, residualPressure, edgeAssuranceCloseDecision, ledger };
}

function materializedVectorsForOverlay(module, overlay) {
  const byVector = new Map();
  for (const graphFunctionRef of overlay.graphFunctionRefs) {
    const graphFunction = moduleGraphFunctionByName(module, graphFunctionRef);
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!byVector.has(vector.name)) {
        byVector.set(vector.name, vector);
      }
    }
  }
  return byVector;
}

function materializedVectorsForModule(module) {
  const byVector = new Map();
  for (const graphFunction of module.graphFunctions) {
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!byVector.has(vector.name)) {
        byVector.set(vector.name, vector);
      }
    }
  }
  return byVector;
}

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t164-edge-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    "# T-164 Edge Fixture\n\nRust hello service fixture workspace.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T164: Build a small HTTP service from graph traversal contracts.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "A Rust HTTP service exposing GET /hello and returning hello world."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    [
      "# Requirements",
      "",
      "REQ-T164-001: The service must expose a GET /hello endpoint.",
      "REQ-T164-002: The endpoint must return hello world as the response body."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t164_edge_fixture",
      "active_tenant: rust_service",
      "build_tenants:",
      "  rust_service:",
      "    output_dir: build_tenants/rust_service",
      "    language: rust",
      "    build_tool: cargo",
      "    module_structure:",
      "      - service"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function moduleBasis(handle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t164",
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
      resolvedPolicyBundleRef: "policy://odd-sdlc/t164/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t164",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t164",
    workKey: "wk://odd-sdlc/t164",
    frameId: null,
    frameLineageId: null
  });
}

function ingressReport() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t164",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t164",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["edge-gain-closure-contracts"]
    }),
    sourceInputs: []
  });
}

test("T-164 current-full overlay vectors all have gain and closure contract rows", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const currentFull = overlayByRef(catalog, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  const byEdge = indexSdlcEdgeGainClosureContracts({
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });
  const uniqueCurrentFullVectorRefs = unique(currentFull.graphVectorRefs);

  assert.equal(uniqueCurrentFullVectorRefs.length, 36);
  assert.deepStrictEqual(
    uniqueCurrentFullVectorRefs.filter((graphVectorRef) =>
      graphVectorRef.startsWith("Fg_conform_project__")
    ).sort(),
    [
      "Fg_conform_project__capability_contract_surface",
      "Fg_conform_project__conformance_gap_set",
      "Fg_conform_project__execution_contract_surface",
      "Fg_conform_project__module_inventory_surface",
      "Fg_conform_project__selected_tenant_surface"
    ]
  );

  const categoryCounts = {};
  for (const graphVectorRef of uniqueCurrentFullVectorRefs) {
    const contract = byEdge.get(graphVectorRef);
    assert(contract, graphVectorRef);
    assert.equal(contract.closureClassification, "close_capable");
    assert.equal(contract.sourceAssetPolicy, "strict");
    assert.equal(contract.ledgerInputKinds.includes("sdlc_edge_fulfillment_ledger"), true);
    assert.equal(contract.ledgerInputKinds.includes("sdlc_edge_closure_decision"), true);
    assert.match(
      contract.metricFunctionRef,
      new RegExp(`^function://odd-sdlc/edge-gain/${contract.category}/`)
    );
    assert.match(
      contract.closureFunctionRef,
      new RegExp(`^function://odd-sdlc/edge-gain/${contract.category}/`)
    );
    assert(contract.residualPressureRefs.length > 0, graphVectorRef);
    categoryCounts[contract.category] = (categoryCounts[contract.category] ?? 0) + 1;
  }

  assert.deepStrictEqual(categoryCounts, {
    conformance: 6,
    authority_synthesis: 4,
    test_formalisation_and_planning: 3,
    solution_formalisation: 4,
    implementation_encoding: 2,
    implementation_qualification: 1,
    test_encoding_and_execution: 5,
    repair_archive_release_qualification: 4,
    operational_transition_and_return: 7
  });
});

test("T-164 published graph vector inventory is fully classified", () => {
  const module = constructSdlcGtlModule();
  const materializedVectors = materializedVectorsForModule(module);
  const publishedGraphVectorRefs = [...materializedVectors.keys()].sort();
  const byEdge = indexSdlcEdgeGainClosureContracts({
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });

  assert.equal(publishedGraphVectorRefs.length, 71);
  assert.equal(SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.length, 71);
  assert.deepStrictEqual(
    publishedGraphVectorRefs.filter((graphVectorRef) =>
      graphVectorRef.startsWith("Fg_ingress_project__") ||
      graphVectorRef.startsWith("Fg_conform_project__") ||
      graphVectorRef.startsWith("Fg_conform_project_authority__")
    ),
    [
      "Fg_conform_project__capability_contract_surface",
      "Fg_conform_project__conformance_gap_set",
      "Fg_conform_project__execution_contract_surface",
      "Fg_conform_project__module_inventory_surface",
      "Fg_conform_project__selected_tenant_surface",
      "Fg_conform_project_authority__goal_surface",
      "Fg_conform_project_authority__intent_surface",
      "Fg_conform_project_authority__product_surface",
      "Fg_conform_project_authority__project_authority_conformance_projection",
      "Fg_conform_project_authority__project_authority_next_action_projection",
      "Fg_ingress_project__ambiguity_register",
      "Fg_ingress_project__bootstrap_gap_set",
      "Fg_ingress_project__lineage_map",
      "Fg_ingress_project__source_input_ledger"
    ]
  );

  assertSdlcEdgeGainClosureContractsRegistered({
    publishedGraphVectorRefs,
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });

  const classificationCounts = {};
  const sourcePolicyCounts = {};
  for (const graphVectorRef of publishedGraphVectorRefs) {
    const contract = byEdge.get(graphVectorRef);
    const vector = materializedVectors.get(graphVectorRef);
    assert(contract, graphVectorRef);
    assert(vector, graphVectorRef);
    assert.deepStrictEqual(
      contract.sourceAssetTypes,
      vector.source.map((node) => node.name),
      graphVectorRef
    );
    assert.equal(contract.targetAssetType, vector.target.name, graphVectorRef);
    classificationCounts[contract.closureClassification] =
      (classificationCounts[contract.closureClassification] ?? 0) + 1;
    sourcePolicyCounts[contract.sourceAssetPolicy] =
      (sourcePolicyCounts[contract.sourceAssetPolicy] ?? 0) + 1;
  }

  assert.deepStrictEqual(classificationCounts, {
    library_only: 10,
    close_capable: 55,
    projection_only: 6
  });
  assert.deepStrictEqual(sourcePolicyCounts, {
    strict: 70,
    subset_allowed: 1
  });
});

test("T-164 query domain and gaps expose edge assurance as a read-only view", () => {
  const module = constructSdlcGtlModule();
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: ingressReport()
  });
  const intentContract = contractByEdge("derive_intent_surface");
  const intentContractRef = sdlcEdgeAssuranceContractRef(intentContract);
  const intentContractDigest = digestSdlcEdgeGainClosureContract(intentContract);
  const intentRow = queryDomain.edgeAssurance.rows.find(
    (row) => row.edgeRef === intentContract.edgeRef
  );
  assert(intentRow);

  assert.equal(queryDomain.edgeAssurance.readOnly, true);
  assert.equal(queryDomain.edgeAssurance.choosesNextTraversal, false);
  assert.equal(
    queryDomain.edgeAssurance.actionClosureEvaluationFunction,
    "evaluate_action"
  );
  assert.equal(queryDomain.edgeAssurance.rows.length, 71);
  assert.deepStrictEqual(queryDomain.edgeAssurance.diagnostics, []);
  assert.equal(intentRow.edgeAssuranceContractRef, intentContractRef);
  assert.equal(intentRow.edgeAssuranceContractDigest, intentContractDigest);
  assert.equal(intentRow.closureClassification, "close_capable");
  assert(intentRow.proofLaneRefs.length > 0);
  assert(intentRow.residualPressureRefs.length > 0);

  const missingIntentModel = projectSdlcEdgeAssuranceReadModel({
    module,
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.filter(
      (contract) => contract.edgeRef !== intentContract.edgeRef
    )
  });
  assert.deepStrictEqual(missingIntentModel.missingContractRefs, [
    "derive_intent_surface"
  ]);
  assert.equal(
    missingIntentModel.diagnostics[0]?.code,
    "missing_edge_gain_closure_contract"
  );

  const basis = moduleBasis();
  const gap = evalSdlcGapFromReplay({ basis, events: [] });
  const dossier = deriveSdlcGapDossier({
    basis,
    events: [],
    triageInput: "t164-edge-assurance-read-model",
    evidenceRefs: ["evidence://odd-sdlc/t164/query-gap"]
  });

  assert.equal(gap.currentEdge, "derive_intent_surface");
  assert.equal(gap.evaluatesActionClosure, false);
  assert.equal(gap.edgeAssuranceContractRef, intentContractRef);
  assert.equal(gap.edgeAssuranceContractDigest, intentContractDigest);
  assert.deepStrictEqual(gap.edgeAssuranceDiagnostics, []);
  assert.deepStrictEqual(gap.edgeAssuranceProofLaneRefs, intentRow.proofLaneRefs);
  assert.deepStrictEqual(
    gap.edgeAssuranceResidualPressureRefs,
    intentRow.residualPressureRefs
  );
  assert.equal(dossier.actionClosureEvaluationFunction, null);
  assert.equal(dossier.edgeAssuranceContractRef, gap.edgeAssuranceContractRef);
  assert.deepStrictEqual(
    dossier.edgeAssuranceResidualPressureRefs,
    gap.edgeAssuranceResidualPressureRefs
  );
});

test("T-164 contract rows match current-full materialized graph vector boundaries", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const currentFull = overlayByRef(catalog, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  const materializedVectors = materializedVectorsForOverlay(module, currentFull);
  const byEdge = indexSdlcEdgeGainClosureContracts({
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });

  for (const graphVectorRef of unique(currentFull.graphVectorRefs)) {
    const vector = materializedVectors.get(graphVectorRef);
    const contract = byEdge.get(graphVectorRef);
    assert(vector, graphVectorRef);
    assert(contract, graphVectorRef);
    assert.deepStrictEqual(
      contract.sourceAssetTypes,
      vector.source.map((node) => node.name),
      graphVectorRef
    );
    assert.equal(contract.targetAssetType, vector.target.name, graphVectorRef);
  }
});

test("T-164 overlay matrix covers every current overlay-selected vector", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlayVectorUnion = unique(
    catalog.overlays.flatMap((overlay) => overlay.graphVectorRefs)
  );

  assert(
    catalog.overlays.some(
      (overlay) => overlay.overlayRef === SDLC_TICKET_WORKFLOW_OVERLAY_REF
    )
  );
  assert.equal(catalog.overlays.length, 7);
  assert.equal(overlayVectorUnion.length, 42);

  for (const overlay of catalog.overlays) {
    assertSdlcOverlayEdgeGainClosureContracts({
      overlayRef: overlay.overlayRef,
      graphVectorRefs: overlay.graphVectorRefs,
      contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
    });
  }
});

test("T-164 lite direct implementation vector carries downstream execution pressure", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const lite = overlayByRef(catalog, SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF);
  const vectors = materializedVectorsForOverlay(module, lite);
  const liteDirectVector = vectors.get(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  assert(liteDirectVector);

  assert.deepStrictEqual(
    liteDirectVector.source.map((node) => node.name),
    ["implementation_design_surface"]
  );
  assert.equal(liteDirectVector.target.name, "component_code_surface");

  const contract = indexSdlcEdgeGainClosureContracts({
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  }).get(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  assert(contract);
  assert.equal(contract.category, "implementation_encoding");
  assert.equal(contract.compositionRole, "intermediate");
  assert.equal(contract.sourceAssetPolicy, "subset_allowed");
  assert(
    contract.residualPressureRefs.includes(
      "pressure://odd-sdlc/current-full-traversal-refinement"
    )
  );
});

test("T-164 lite overlay terminal vector is test execution result proof", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const lite = overlayByRef(catalog, SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF);

  assert.deepEqual(lite.termination.terminalAssetTypes, [
    "test_execution_result_surface"
  ]);
  assert.deepEqual(lite.termination.terminalGraphFunctionRefs, [
    "lite_design_module_implementation"
  ]);
  assert(
    lite.graphVectorRefs.includes("prepare_test_execution_surface")
  );
  assert(
    lite.graphVectorRefs.includes("derive_test_execution_result_surface")
  );
  const templates = new Map(
    lite.assetTemplates.map((template) => [template.assetType, template])
  );
  assert.equal(
    templates.get("test_execution_surface")?.producerGraphFunctionRef,
    "prepare_test_execution_surface"
  );
  assert.equal(
    templates.get("test_execution_surface")?.terminalRole,
    "supporting_asset"
  );
  assert.equal(
    templates.get("test_execution_result_surface")?.producerGraphFunctionRef,
    "derive_test_execution_result_surface"
  );
  assert.equal(
    templates.get("test_execution_result_surface")?.terminalRole,
    "terminal_asset"
  );
});

test("T-164 matrix validation fails closed for missing duplicate ambiguous and unregistered rows", () => {
  const contract = SDLC_EDGE_GAIN_CLOSURE_CONTRACTS[0];
  assert(contract);

  assert.throws(
    () =>
      assertSdlcOverlayEdgeGainClosureContracts({
        overlayRef: "overlay://odd-sdlc/test",
        graphVectorRefs: [contract.edgeRef, "missing_edge"],
        contracts: [contract]
      }),
    (error) => error?.code === "missing_edge_gain_closure_contract"
  );

  assert.throws(
    () =>
      indexSdlcEdgeGainClosureContracts({
        contracts: [contract, contract]
      }),
    (error) => error?.code === "duplicate_edge_gain_closure_contract"
  );

  assert.throws(
    () =>
      indexSdlcEdgeGainClosureContracts({
        contracts: [{ ...contract, sourceAssetTypes: [] }]
      }),
    (error) => error?.code === "ambiguous_edge_gain_closure_contract"
  );

  assert.throws(
    () =>
      indexSdlcEdgeGainClosureContracts({
        contracts: [{ ...contract, closureClassification: "" }]
      }),
    (error) => error?.code === "ambiguous_edge_gain_closure_contract"
  );

  assert.throws(
    () =>
      indexSdlcEdgeGainClosureContracts({
        contracts: [{ ...contract, sourceAssetPolicy: "implicit" }]
      }),
    (error) => error?.code === "ambiguous_edge_gain_closure_contract"
  );

  assert.throws(
    () =>
      assertSdlcEdgeGainClosureContractsRegistered({
        publishedGraphVectorRefs: [],
        contracts: [contract]
      }),
    (error) => error?.code === "unregistered_edge_gain_closure_contract"
  );
});

test("T-164 category templates declare the common function pack shape", () => {
  assert.equal(SDLC_EDGE_GAIN_CLOSURE_CATEGORY_TEMPLATES.length, 13);
  for (const template of SDLC_EDGE_GAIN_CLOSURE_CATEGORY_TEMPLATES) {
    assert.match(
      template.functionPack.deriveObligationsRef,
      new RegExp(`/${template.category}/derive-obligations$`)
    );
    assert.match(
      template.functionPack.admitEvidenceRef,
      new RegExp(`/${template.category}/admit-evidence$`)
    );
    assert.match(
      template.functionPack.measureGainRef,
      new RegExp(`/${template.category}/measure-gain$`)
    );
    assert.match(
      template.functionPack.closeEdgeRef,
      new RegExp(`/${template.category}/close-edge$`)
    );
    assert.match(
      template.functionPack.deriveResidualPressureRef,
      new RegExp(`/${template.category}/derive-residual-pressure$`)
    );
    assert.match(
      template.functionPack.composePathGainRef,
      new RegExp(`/${template.category}/compose-path-gain$`)
    );
    assert(template.defaultLedgerInputKinds.length > 0, template.category);
    assert(template.deterministicOptimizationRefs.length > 0, template.category);
  }
});

test("T-164 edge gain is measured by admitted obligation evidence not worker percentages", () => {
  const contract = contractByEdge("derive_requirement_surface");
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [
      "RequirementAuthority(current_surface,REQ-X)",
      "BehavioralFulfillment(REQ-X)"
    ]
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://req-x/authority-ledger-row",
        sourceKind: "worker_assessment",
        obligationRefs: ["RequirementAuthority(current_surface,REQ-X)"],
        supportsBehavioralFulfillment: true
      },
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "metric://worker/req-x/100-percent-complete",
        sourceKind: "worker_percent_complete",
        obligationRefs: ["BehavioralFulfillment(REQ-X)"],
        supportsBehavioralFulfillment: true
      }
    ]
  });

  assert.equal(admission.admittedEvidence.length, 1);
  assert.equal(admission.rejectedEvidence.length, 1);
  assert.match(
    admission.rejectedEvidence[0].reasonRef,
    /worker_percent_complete_is_not_metric_authority/
  );

  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });
  const residual = deriveSdlcEdgeResidualPressure(gain);
  const decision = deriveSdlcEdgeAssuranceCloseDecision({ gain, residualPressure: residual });

  assert.equal(gain.expectedCount, 2);
  assert.equal(gain.fulfilledCount, 1);
  assert.equal(gain.missingCount, 1);
  assert.equal(gain.obligationsAndLedgersComplete, false);
  assert.equal(residual.clear, false);
  assert.equal(decision.disposition, "retry");

  const closeAdmission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      ...admission.admittedEvidence.map((evidence) => ({
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: evidence.evidenceRef,
        sourceKind: evidence.sourceKind,
        obligationRefs: evidence.obligationRefs,
        supportsBehavioralFulfillment: true
      })),
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://req-x/behavioral-proof",
        sourceKind: "runtime_event",
        obligationRefs: ["BehavioralFulfillment(REQ-X)"],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const closeGain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: closeAdmission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });
  const closeResidual = deriveSdlcEdgeResidualPressure(closeGain);
  const closeDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain: closeGain,
    residualPressure: closeResidual
  });

  assert.equal(closeGain.missingCount, 0);
  assert.equal(closeResidual.clear, true);
  assert.equal(closeDecision.disposition, "close");
});

test("T-184 selected F_P residual pressure prevents consequence edge close", () => {
  const contract = contractByEdge("derive_product_surface");
  const obligationRef = "requirement://t184/selected-fp-pressure";
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t184/review-grade/fulfilled-row",
        sourceKind: "review_grade_assessment",
        obligationRefs: [obligationRef],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });
  const measuredResidual = deriveSdlcEdgeResidualPressure(gain);
  const selectedFpPressureRefs = [
    "pressure://odd-sdlc/review-grade/t184-live/requirement%3A%2F%2Ft184%2Fselected-fp-pressure"
  ];
  const residual = withAdditionalSdlcEdgeResidualPressureRefs({
    residualPressure: measuredResidual,
    requiredPressureRefs: selectedFpPressureRefs
  });
  const edgeAssuranceCloseDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure: residual
  });
  const selectedComposition = {
    compositionRef: "composition://odd-sdlc/t184/selected-fp-pressure",
    compositionDigest: "sha256:t184-selected-fp-pressure",
    compositionSelectionRef: "composition-selection://odd-sdlc/t184/selected-fp-pressure",
    selectedRegimeBindingRef: null
  };
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition,
    ledgerRef: "ledger://odd-sdlc/t184/selected-fp-pressure",
    ledgerVersionRef: "ledger-version://odd-sdlc/t184/selected-fp-pressure/1",
    edgeAssuranceContractRef: gain.contractRef,
    edgeAssuranceContractDigest: gain.contractDigest,
    targetCarrierAdmissionStatus: gain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: gain.targetCarrierAdmissionRef,
    edgeGainRef: gain.gainRef,
    edgeResidualPressureRefs: residual.requiredPressureRefs,
    edgeRef: "edge://odd-sdlc/t184/selected-fp-pressure",
    attemptRef: "attempt://odd-sdlc/t184/selected-fp-pressure/1",
    targetBindingRefs: ["target-binding://odd-sdlc/t184/selected-fp-pressure"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t184/selected-fp-pressure"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t184/selected-fp-pressure",
    ledger,
    edgeClosureFunctionRef: gain.closureFunctionRef,
    edgeAssuranceCloseDecision,
    currentEdgeLawful: true
  });

  assert.equal(gain.obligationsAndLedgersComplete, true);
  assert.equal(measuredResidual.clear, true);
  assert.equal(residual.clear, false);
  assert.deepEqual(residual.requiredPressureRefs, selectedFpPressureRefs);
  assert.equal(edgeAssuranceCloseDecision.disposition, "retry");
  assert.equal(ledger.edgeConverged, false);
  assert.equal(closureDecision.disposition, "retry");
  assert.deepEqual(closureDecision.edgeResidualPressureRefs, selectedFpPressureRefs);
});

test("T-164 obligation derivation fails closed when traversal obligations are absent", () => {
  const contract = contractByEdge("derive_requirement_surface");
  assert.throws(
    () =>
      deriveSdlcEdgeObligations({
        contract,
        obligationRefs: []
      }),
    /edge obligation derivation requires explicit obligation refs/
  );
});

test("T-164 artifact presence alone is rejected as behavioral closure evidence", () => {
  const contract = contractByEdge("derive_component_code_surface");
  const obligationRef = "BehavioralFulfillment(component-code)";
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "file://build_tenants/rust_service/src/main.rs",
        sourceKind: "artifact_presence",
        obligationRefs: [obligationRef]
      }
    ]
  });
  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });

  assert.equal(admission.admittedEvidence.length, 0);
  assert.equal(admission.rejectedEvidence.length, 1);
  assert.match(
    admission.rejectedEvidence[0].reasonRef,
    /artifact_presence_without_behavioral_fulfillment/
  );
  assert.equal(gain.obligationsAndLedgersComplete, false);
});

test("T-171 execution-required edge cannot close without admitted execution result evidence", () => {
  const contract = contractByEdge("derive_test_execution_result_surface");
  const obligationRef = "BehavioralFulfillment(test-execution-result)";
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const workerOnlyAdmission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t171/worker-assertion",
        sourceKind: "worker_assessment",
        obligationRefs: [obligationRef],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const workerOnlyGain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: workerOnlyAdmission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract),
    requiredEvidenceSourceKinds: ["execution_result"]
  });
  const workerOnlyResidual = deriveSdlcEdgeResidualPressure(workerOnlyGain);
  const workerOnlyDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain: workerOnlyGain,
    residualPressure: workerOnlyResidual
  });

  assert.equal(workerOnlyGain.missingCount, 0);
  assert.equal(workerOnlyGain.obligationsAndLedgersComplete, true);
  assert.equal(workerOnlyResidual.clear, false);
  assert(
    workerOnlyResidual.requiredPressureRefs.some((ref) =>
      ref.includes("missing-evidence-source")
    )
  );
  assert.equal(workerOnlyDecision.disposition, "retry");

  const executionAdmission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t171/test-run-report",
        sourceKind: "execution_result",
        obligationRefs: [obligationRef],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const executionGain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: executionAdmission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract),
    requiredEvidenceSourceKinds: ["execution_result"]
  });
  const executionResidual = deriveSdlcEdgeResidualPressure(executionGain);
  const executionDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain: executionGain,
    residualPressure: executionResidual
  });

  assert.equal(executionResidual.clear, true);
  assert.equal(executionDecision.disposition, "close");
});

test("T-164 compound traversal gain exposes the open edge in a three-vector chain", () => {
  const chain = composeSdlcPathGain({
    pathRef: "path://odd-sdlc/t164/a-b-c-d",
    edgeGains: [
      measuredGain("derive_intent_surface", true),
      measuredGain("derive_requirement_surface", false),
      measuredGain("derive_design_surface", true)
    ]
  });

  assert.equal(chain.edgeGainRefs.length, 3);
  assert.equal(chain.closeReady, false);
  assert.deepStrictEqual(chain.openEdgeRefs, ["derive_requirement_surface"]);
  assert.deepStrictEqual(chain.bottleneckEdgeRefs, ["derive_requirement_surface"]);
  assert(chain.residualPressureRefs.length > 0);
});

test("T-164 deterministic requirement-to-design chain closes by per-edge gain", () => {
  const edgeRefs = [
    "derive_requirement_surface",
    "derive_feature_decomp_surface",
    "derive_design_surface"
  ];
  const gains = edgeRefs.map((edgeRef) => measuredGain(edgeRef, true));
  const decisions = gains.map((gain) =>
    deriveSdlcEdgeAssuranceCloseDecision({
      gain,
      residualPressure: deriveSdlcEdgeResidualPressure(gain)
    })
  );
  const chain = composeSdlcPathGain({
    pathRef: "path://odd-sdlc/t164/requirement-formalisation-design",
    edgeGains: gains
  });

  assert.deepStrictEqual(
    edgeRefs.map((edgeRef) => contractByEdge(edgeRef).category),
    [
      "authority_synthesis",
      "solution_formalisation",
      "solution_formalisation"
    ]
  );
  assert.deepStrictEqual(
    gains.map((gain) => gain.obligationsAndLedgersComplete),
    [true, true, true]
  );
  assert.deepStrictEqual(
    decisions.map((decision) => decision.disposition),
    ["close", "close", "close"]
  );
  assert.equal(chain.closeReady, true);
  assert.deepStrictEqual(chain.closedEdgeRefs, [...edgeRefs].sort());
  assert.deepStrictEqual(chain.openEdgeRefs, []);
  assert.deepStrictEqual(chain.bottleneckEdgeRefs, []);
  assert.deepStrictEqual(chain.residualPressureRefs, []);
});

test("T-164 edge assurance measures edge-local obligations, not downstream carried requirements", () => {
  const contract = contractByEdge("Fg_conform_project_authority");
  const edgeLocalIds = [
    "target_asset:project_bootstrap_surface",
    "evaluator:bootstrap-specification-postflight-consistency"
  ];
  const downstreamRequirementIds = [
    "requirement:workspace.mapper_requirements.req_dq_004",
    "requirement:workspace.stage_15_trv_requirements.req_trv_005_a"
  ];
  const fulfillment = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [...edgeLocalIds, ...downstreamRequirementIds],
    assessments: [
      ...edgeLocalIds.map((obligationId) => ({
        obligationId,
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/.ai-workspace/context/project_bootstrap.md"]
      })),
      ...downstreamRequirementIds.map((obligationId) => ({
        obligationId,
        fulfillmentStatus: "partial",
        evidenceRefs: [`source://${obligationId}`],
        carryDirection: "downstream_transformation_set",
        downstreamGraphFunctionRefs: ["Fg_materialize_declared_product_asset"],
        targetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"]
      }))
    ]
  });
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: fulfillment.edgeLocalObligationIds
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: edgeLocalIds.map((obligationId) => ({
      kind: "sdlc_edge_evidence_candidate",
      evidenceRef: `evidence://${encodeURIComponent(obligationId)}`,
      sourceKind: "worker_assessment",
      obligationRefs: [obligationId],
      supportsBehavioralFulfillment: true
    }))
  });
  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract)
  });
  const residual = deriveSdlcEdgeResidualPressure(gain);
  const decision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure: residual
  });

  assert.deepStrictEqual(fulfillment.edgeLocalObligationIds, [...edgeLocalIds].sort());
  assert.equal(fulfillment.downstreamTransformationSetRefs.length, 2);
  assert.equal(fulfillment.counts.expected, 2);
  assert.equal(fulfillment.counts.fulfilled, 2);
  assert.equal(gain.expectedCount, 2);
  assert.equal(gain.missingCount, 0);
  assert.equal(residual.clear, true);
  assert.equal(decision.disposition, "close");
});

test("T-164 generic edge assurance blocks when measuring ledgers are missing", () => {
  const contract = contractByEdge("derive_design_surface");
  const obligationRef = "DesignFormalisation(REQ-T164)";
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t164/design/formalisation",
        sourceKind: "runtime_event",
        obligationRefs: [obligationRef],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: []
  });
  const residualPressure = deriveSdlcEdgeResidualPressure(gain);
  const edgeAssuranceCloseDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure
  });

  assert.deepStrictEqual(
    gain.missingLedgerInputKinds,
    [...contract.ledgerInputKinds].sort()
  );
  assert.equal(edgeAssuranceCloseDecision.disposition, "block");
  assert(
    edgeAssuranceCloseDecision.reasonRefs.some((ref) =>
      ref.includes("missing-ledger-input")
    )
  );
});

test("T-164 installed closure dispositions are governed by edge assurance close state", () => {
  const closed = edgeAssuranceClosureContext("derive_intent_surface", true);
  const closeDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/close",
    ledger: closed.ledger,
    edgeClosureFunctionRef: closed.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: closed.edgeAssuranceCloseDecision,
    currentEdgeLawful: true
  });
  assert.equal(closed.edgeAssuranceCloseDecision.disposition, "close");
  assert.equal(closeDecision.disposition, "close");
  assert.equal(
    closeDecision.edgeAssuranceDecisionRef,
    closed.edgeAssuranceCloseDecision.decisionRef
  );
  const abgRetryPressureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/abg-evaluation-set-retry",
    ledger: closed.ledger,
    edgeClosureFunctionRef: closed.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: closed.edgeAssuranceCloseDecision,
    currentEdgeLawful: false,
    retryReasonRefs: [
      "retry://odd-sdlc/t164/abg-evaluation-set/evaluation_set_incomplete"
    ]
  });
  assert.equal(abgRetryPressureDecision.disposition, "retry");

  const open = edgeAssuranceClosureContext("derive_requirement_surface", false);
  assert.equal(open.edgeAssuranceCloseDecision.disposition, "retry");

  const retryDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/retry",
    ledger: open.ledger,
    edgeClosureFunctionRef: open.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: open.edgeAssuranceCloseDecision,
    currentEdgeLawful: true
  });
  assert.equal(retryDecision.disposition, "retry");

  const yieldDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/yield",
    ledger: open.ledger,
    edgeClosureFunctionRef: open.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: open.edgeAssuranceCloseDecision,
    currentEdgeLawful: true,
    yieldResumeBasis: {
      yieldKind: "budget_checkpoint_with_admitted_progress",
      resumeBasisRef: "resume-basis://odd-sdlc/t164/yield",
      currentEdgeRef: open.ledger.edgeRef,
      admittedProgressRefs: ["progress://odd-sdlc/t164/materialized-partial"],
      livenessProjectionRef: null,
      resumePolicyRef: "resume-policy://odd-sdlc/t164/same-edge"
    }
  });
  assert.equal(yieldDecision.disposition, "yield");

  const repairDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/repair",
    ledger: open.ledger,
    edgeClosureFunctionRef: open.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: open.edgeAssuranceCloseDecision,
    currentEdgeLawful: true,
    repairReasonRefs: ["repair://odd-sdlc/t164/worker-output"]
  });
  assert.equal(repairDecision.disposition, "repair");

  const reenterDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/re-enter",
    ledger: open.ledger,
    edgeClosureFunctionRef: open.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: open.edgeAssuranceCloseDecision,
    currentEdgeLawful: true,
    reenterReasonRefs: ["reenter://odd-sdlc/t164/graph-span"]
  });
  assert.equal(reenterDecision.disposition, "re-enter");

  const repriceDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/reprice",
    ledger: open.ledger,
    edgeClosureFunctionRef: open.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: open.edgeAssuranceCloseDecision,
    currentEdgeLawful: false,
    repriceReasonRefs: ["reprice://odd-sdlc/t164/requirement"]
  });
  assert.equal(repriceDecision.disposition, "reprice");

  const blockedContract = contractByEdge("derive_design_surface");
  const blockedObligations = deriveSdlcEdgeObligations({
    contract: blockedContract,
    obligationRefs: ["DesignFormalisation(REQ-T164)"]
  });
  const blockedAdmission = admitSdlcEdgeEvidence({
    contract: blockedContract,
    obligations: blockedObligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://odd-sdlc/t164/design",
        sourceKind: "runtime_event",
        obligationRefs: ["DesignFormalisation(REQ-T164)"],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const blockedGain = measureSdlcEdgeGain({
    contract: blockedContract,
    obligations: blockedObligations,
    admittedEvidence: blockedAdmission.admittedEvidence,
    ledgerInputs: []
  });
  const blockedResidualPressure = deriveSdlcEdgeResidualPressure(blockedGain);
  const blockedEdgeDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain: blockedGain,
    residualPressure: blockedResidualPressure
  });
  const blockedLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: T164_SELECTED_COMPOSITION,
    ledgerRef: "ledger://odd-sdlc/t164/block/edge-fulfillment",
    ledgerVersionRef: "ledger-version://odd-sdlc/t164/block/edge-fulfillment/1",
    edgeAssuranceContractRef: blockedGain.contractRef,
    edgeAssuranceContractDigest: blockedGain.contractDigest,
    targetCarrierAdmissionStatus: blockedGain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: blockedGain.targetCarrierAdmissionRef,
    edgeGainRef: blockedGain.gainRef,
    edgeResidualPressureRefs: blockedResidualPressure.requiredPressureRefs,
    edgeRef: "edge://odd-sdlc/t164/block",
    attemptRef: "attempt://odd-sdlc/t164/block/1",
    targetBindingRefs: ["target-binding://odd-sdlc/t164/block"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t164/block"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  const blockDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/block",
    ledger: blockedLedger,
    edgeClosureFunctionRef: blockedGain.closureFunctionRef,
    edgeAssuranceCloseDecision: blockedEdgeDecision,
    currentEdgeLawful: true,
    repairReasonRefs: ["repair://odd-sdlc/t164/ignored-by-hard-block"]
  });
  assert.equal(blockedEdgeDecision.disposition, "block");
  assert.equal(blockDecision.disposition, "block");
});

test("T-164 consequence carriers retain gain close and residual pressure identity", () => {
  const contract = contractByEdge("derive_design_surface");
  const contractRef = sdlcEdgeAssuranceContractRef(contract);
  const contractDigest = digestSdlcEdgeGainClosureContract(contract);
  const edgeGainRef = "edge-gain://odd-sdlc/t164/design";
  const residualPressureRefs = ["pressure://odd-sdlc/t164/design/missing-proof"];
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: T164_SELECTED_COMPOSITION,
    ledgerRef: "ledger://odd-sdlc/t164/edge-fulfillment",
    ledgerVersionRef: "ledger-version://odd-sdlc/t164/edge-fulfillment/1",
    overlayRef: "overlay://odd-sdlc/t164",
    overlayBindingRef: "overlay-binding://odd-sdlc/t164",
    graphCatalogDigestRef: "sha256:t164-catalog",
    edgeAssuranceContractRef: contractRef,
    edgeAssuranceContractDigest: contractDigest,
    targetCarrierAdmissionStatus: "not_required",
    edgeGainRef,
    edgeResidualPressureRefs: residualPressureRefs,
    edgeRef: "edge://odd-sdlc/t164/derive-design",
    attemptRef: "attempt://odd-sdlc/t164/derive-design/1",
    targetBindingRefs: ["target-binding://odd-sdlc/t164/design"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t164/worksite"],
    counts: {
      expected: 1,
      fulfilled: 0,
      partial: 0,
      blocked: 1,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t164/edge-fulfillment/1",
    ledger,
    edgeClosureFunctionRef: contract.closureFunctionRef,
    currentEdgeLawful: true,
    blockReasonRefs: residualPressureRefs
  });
  const projection = constructSdlcNextActionProjection({
    selectedComposition: T164_SELECTED_COMPOSITION,
    nextActionProjectionRef: "next-action://odd-sdlc/t164/block",
    intentEventRefs: ["intent-event://odd-sdlc/t164/1"],
    productAssetModelRef: "product-asset-model://odd-sdlc/t164",
    gapPressureRefs: residualPressureRefs,
    targetBindingRefs: ledger.targetBindingRefs,
    closureDecision: decision,
    observationRef: "observation://odd-sdlc/t164/post-action",
    policyRefs: ["policy://odd-sdlc/t164/no-action"],
    actionCatalogRefs: ["catalog://odd-sdlc/t164/empty"]
  });

  assert.equal(ledger.edgeAssuranceContractRef, contractRef);
  assert.equal(ledger.edgeAssuranceContractDigest, contractDigest);
  assert.equal(ledger.edgeGainRef, edgeGainRef);
  assert.deepStrictEqual(ledger.edgeResidualPressureRefs, residualPressureRefs);
  assert.equal(decision.edgeClosureFunctionRef, contract.closureFunctionRef);
  assert.equal(decision.edgeGainRef, edgeGainRef);
  assert.equal(projection.edgeAssuranceContractRef, contractRef);
  assert.equal(projection.edgeGainRef, edgeGainRef);
  assert.deepStrictEqual(projection.edgeResidualPressureRefs, residualPressureRefs);
});

test("T-164 handoff invocation and brief carry the edge assurance contract", () => {
  const workspace = makeWorkspace();
  const hookContract = hookContractByEdgeName("derive_code_surface");
  const edgeContract = contractByEdge("derive_code_surface");
  const contractRef = sdlcEdgeAssuranceContractRef(edgeContract);
  const contractDigest = digestSdlcEdgeGainClosureContract(edgeContract);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: hookContract.edgeName,
    vectorIndex: 12,
    contract: hookContract,
    runId: "t164-edge-assurance-carrier"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });
  const brief = constructWorkerBrief({
    manifest,
    manifestPath: path.join(manifest.archiveRoot, "handoff_manifest.json"),
    workerInvocationPackagePath: path.join(
      manifest.archiveRoot,
      "worker_invocation_package.json"
    ),
    traversalIntentPath: path.join(manifest.archiveRoot, "traversal_intent_package.json"),
    conformedProjectPath: path.join(manifest.archiveRoot, "conformed_project.json"),
    invocationPackage
  });

  assert.doesNotThrow(() => assertTraversalIntentPackagePressure(manifest));
  assert.equal(manifest.edgeAssuranceContractRef, contractRef);
  assert.equal(manifest.edgeAssuranceContractDigest, contractDigest);
  assert.equal(manifest.traversalObligationContext.edgeAssuranceContractRef, contractRef);
  assert.equal(manifest.traversalIntentPackage.edgeAssuranceContractRef, contractRef);
  assert.equal(invocationPackage.edgeAssuranceContractRef, contractRef);
  assert.equal(brief.edgeAssuranceContractRef, contractRef);
  assert.equal(brief.edgeAssuranceContractDigest, contractDigest);
});

test("T-164 handoff source-set assurance is declared by the edge contract row", () => {
  const strictWorkspace = makeWorkspace();
  const strictHookContract = hookContractByEdgeName("derive_code_surface");
  assert.equal(contractByEdge(strictHookContract.edgeName).sourceAssetPolicy, "strict");

  assert.throws(
    () =>
      deriveWorkerHandoffManifest({
        workspaceRoot: strictWorkspace,
        graphFunctionName: "bootstrap_release_self_test",
        edgeName: strictHookContract.edgeName,
        vectorIndex: 12,
        contract: {
          ...strictHookContract,
          sourceAssetTypes: [
            ...strictHookContract.sourceAssetTypes,
            "legacy_worker_context_surface"
          ]
        },
        runId: "t164-strict-source-policy"
      }),
    /edge assurance contract source set does not match hook contract/
  );

  const subsetWorkspace = makeWorkspace();
  const subsetHookContract = hookContractByEdgeName(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  const subsetEdgeContract = contractByEdge(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  assert.equal(subsetEdgeContract.sourceAssetPolicy, "subset_allowed");

  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: subsetWorkspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: subsetHookContract.edgeName,
    vectorIndex: 2,
    contract: {
      ...subsetHookContract,
      sourceAssetTypes: [
        ...subsetHookContract.sourceAssetTypes,
        "legacy_worker_context_surface"
      ]
    },
    runId: "t164-subset-source-policy"
  });

  assert.equal(
    manifest.edgeAssuranceContractRef,
    sdlcEdgeAssuranceContractRef(subsetEdgeContract)
  );
});
