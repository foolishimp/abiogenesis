// Validates: REQ-F-ODDSDLC-010
// Validates: REQ-F-ODDSDLC-011
// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-014
// Validates: REQ-F-ODDSDLC-015
// Validates: REQ-F-ODDSDLC-063
// Validates: REQ-F-ODDSDLC-064
// Validates: REQ-F-ODDSDLC-065
// Investigates: T-168

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { materializeGraphFunction } from "@abiogenesis/typescript-tenant";

import {
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  assertSdlcTestPipelineGraphCorrelation,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGraphFunctionCatalog,
  constructSdlcGtlModule,
  constructSdlcOverlaySegmentCompletion,
  constructSdlcTestPipelineCoAffirmationLedger,
  constructSdlcTraversalOverlayCatalog,
  deriveSdlcPostCloseNextEligibleOverlayActionInput,
  deriveSdlcPostCloseOverlayContinuationActionInput,
  deriveSdlcEdgeClosureDecision,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_GRAPH_CODE_BUILDER,
  constructWorkerInvocationPackage,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  sdlcTraversalOverlayAllowsProductConvergence,
  sdlcTraversalOverlayNextGraphContinuation
} from "../../build/semantic/code/src/index.js";

function catalogEntry(catalog, name) {
  const entry = catalog.functions.find((candidate) => candidate.name === name);
  assert(entry, name);
  return entry;
}

function overlayByRef(catalog, ref) {
  const overlay = catalog.overlays.find((candidate) => candidate.overlayRef === ref);
  assert(overlay, ref);
  return overlay;
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t168/${caseId}`,
    compositionDigest: `digest://t168/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t168/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t168/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t168/${caseId}`,
    graphVectorRef: `graph-vector://t168/${caseId}`,
    basisRef: `basis://t168/${caseId}`
  });
}

function fullGraphVectorNames() {
  const module = constructSdlcGtlModule();
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === "bootstrap_release_self_test"
  );
  assert(graphFunction);
  return materializeGraphFunction(graphFunction).vectors.map((vector) => vector.name);
}

function row(ref, caseKind, executionLane = "integration") {
  return {
    kind: "sdlc_test_case_row",
    testCaseRef: ref,
    caseKind,
    executionLane,
    sourceDesignObligationRefs: [`requirement://t168/${caseKind}`],
    testcaseAuthorityRefs: [`testcase-authority://t168/${caseKind}`],
    expectedBehavior: `${caseKind} behavior is observable`
  };
}

function dataBinding(testCaseRef) {
  return {
    kind: "sdlc_test_data_binding",
    testDataRef: `test-data://t168/${encodeURIComponent(testCaseRef)}`,
    testCaseRef,
    inputFixtureRefs: [`fixture://t168/${encodeURIComponent(testCaseRef)}`],
    generationPolicyRef: "policy://odd-sdlc/t168/test-data",
    expectedResultRef: `expected-result://t168/${encodeURIComponent(testCaseRef)}`,
    sourceDesignObligationRefs: [`requirement://t168/${testCaseRef.split("/").at(-1)}`]
  };
}

function expectedBinding(testCaseRef) {
  return {
    kind: "sdlc_expected_result_binding",
    expectedResultRef: `expected-result://t168/${encodeURIComponent(testCaseRef)}`,
    testCaseRef,
    assertionRefs: [`assertion://t168/${encodeURIComponent(testCaseRef)}`],
    expectedResultSummary: "observed result matches the design obligation",
    verificationPolicyRef: "policy://odd-sdlc/t168/verify-results"
  };
}

function verificationRow(testCaseRef) {
  return {
    kind: "sdlc_test_result_verification_row",
    verificationRef: `verification://t168/${encodeURIComponent(testCaseRef)}`,
    testCaseRef,
    expectedResultRef: `expected-result://t168/${encodeURIComponent(testCaseRef)}`,
    observedResultRef: "observed-result://t168/sbt-test",
    status: "passed",
    evidenceRefs: [`evidence://t168/${encodeURIComponent(testCaseRef)}`]
  };
}

function executionEvidence(overrides = {}) {
  return {
    kind: "sdlc_test_execution_evidence_admission",
    admissionRef: "test-execution-admission://t168/sbt-test",
    testExecutionSurfaceRef: "test-execution-surface://t168/sbt-test",
    declaredFrameworkRef: "framework://scala/sbt-test",
    declaredCommand: "sbt test",
    observedResultRef: "observed-result://t168/sbt-test",
    status: "succeeded",
    testsObserved: 3,
    reportRefs: ["report://t168/sbt-test"],
    evidenceRefs: ["evidence://t168/sbt-test"],
    ...overrides
  };
}

function validLedger(overrides = {}) {
  const testCases = [
    row("testcase://t168/positive", "positive"),
    row("testcase://t168/integration", "integration"),
    row("testcase://t168/uat", "uat", "uat")
  ];
  return constructSdlcTestPipelineCoAffirmationLedger({
    ledgerRef: "coaffirmation-ledger://t168",
    ledgerVersionRef: "coaffirmation-ledger-version://t168/1",
    implementationEvidenceRefs: ["component-code://t168/impl"],
    testEvidenceRefs: ["component-test://t168/tests"],
    testCases,
    testDataBindings: testCases.map((testCase) => dataBinding(testCase.testCaseRef)),
    expectedResultBindings: testCases.map((testCase) =>
      expectedBinding(testCase.testCaseRef)
    ),
    executionEvidence: executionEvidence(),
    verificationRows: testCases.map((testCase) => verificationRow(testCase.testCaseRef)),
    requiredCaseKinds: ["positive", "integration", "uat"],
    ...overrides
  });
}

test("T-168 design module declares graph-node test execution law", () => {
  const design = readFileSync(
    new URL(
      "../../design/ODD_SDLC_TYPESCRIPT_TEST_PIPELINE.md",
      import.meta.url
    ),
    "utf8"
  );

  assert.match(design, /SdlcDesignConsumptionContract/);
  assert.match(design, /SdlcTestDataBinding/);
  assert.match(design, /SdlcExpectedResultBinding/);
  assert.match(design, /SdlcCoAffirmationLedger/);
  assert.match(design, /Graph Node And Edge Correlation/);
  assert.match(design, /harness may act as the operator/);
  assert.match(design, /may not push the graph to a downstream edge/);
});

test("T-168 graph catalog correlates test execution phases to nodes and edges", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  assertSdlcTestPipelineGraphCorrelation({ catalog });

  assert.match(catalogEntry(catalog, "derive_test_design_surface").intent, /test data/);
  assert.match(catalogEntry(catalog, "derive_test_design_surface").intent, /expected-result/);
  assert.match(catalogEntry(catalog, "prepare_test_execution_surface").intent, /declared framework/);
  assert.match(catalogEntry(catalog, "derive_test_execution_result_surface").intent, /observed test results/);
  assert.match(catalogEntry(catalog, "qualify_component_test_execution_surface").intent, /expected results/);
  assert.match(catalogEntry(catalog, "derive_release_depth_parity_surface").intent, /co-affirmation/);
  assert.equal(catalogEntry(catalog, "derive_test_design_surface").outputs[0], "test_design_surface");
  assert.equal(catalogEntry(catalog, "derive_component_test_surface").outputs[0], "component_test_surface");
  assert.equal(catalogEntry(catalog, "prepare_test_execution_surface").outputs[0], "test_execution_surface");
});

test("T-203 code-builder graph function owns source unit-test and UAT-test materialization", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  const componentCode = catalogEntry(catalog, "derive_component_code_surface");
  const componentTest = catalogEntry(catalog, "derive_component_test_surface");
  const uatTest = catalogEntry(catalog, "derive_uat_test_source_surface");

  assert.equal(componentCode.specializesGraphFunction, FG_GRAPH_CODE_BUILDER);
  assert.equal(componentTest.specializesGraphFunction, FG_GRAPH_CODE_BUILDER);
  assert.equal(uatTest.specializesGraphFunction, FG_GRAPH_CODE_BUILDER);
  assert.deepEqual(componentCode.inputs, ["implementation_design_surface"]);
  assert.deepEqual(componentTest.inputs, [
    "requirement_surface",
    "testcase_authority_surface",
    "selected_tenant_surface",
    "test_design_surface",
    "implementation_design_surface"
  ]);
  assert.deepEqual(uatTest.inputs, [
    "requirement_surface",
    "uat_testcases_surface",
    "testcase_authority_surface",
    "selected_tenant_surface",
    "test_design_surface"
  ]);
});

test("T-203 code-builder paths are explicit profiles without confused fallback routes", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  const builderEdges = catalog.functions.filter(
    (entry) => entry.specializesGraphFunction === FG_GRAPH_CODE_BUILDER
  );
  const builderNames = builderEdges.map((entry) => entry.name).sort();

  assert.deepEqual(builderNames, [
    "derive_component_code_surface",
    "derive_component_test_surface",
    "derive_uat_test_source_surface",
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE
  ].sort());

  for (const liteBuilderName of [
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE
  ]) {
    assert.equal(
      catalogEntry(catalog, liteBuilderName).graphTrackPublication,
      "overlay_only"
    );
  }
  assert.equal(
    catalogEntry(catalog, "derive_component_code_surface").graphTrackPublication,
    "default"
  );
  assert.equal(
    catalogEntry(catalog, "derive_component_test_surface").graphTrackPublication,
    "default"
  );
  assert.equal(
    builderEdges.filter((entry) =>
      entry.outputs.includes("component_test_surface") &&
      entry.graphTrackPublication === "default"
    ).length,
    1
  );
  assert.equal(
    builderEdges.filter((entry) =>
      entry.outputs.includes("uat_test_source_surface") &&
      entry.graphTrackPublication === "default"
    ).length,
    1
  );
  assert.equal(
    builderEdges.filter((entry) =>
      entry.outputs.includes("component_test_surface") &&
      entry.graphTrackPublication === "overlay_only"
    ).length,
    1
  );
  assert.equal(
    builderEdges.filter((entry) =>
      entry.outputs.includes("uat_test_source_surface") &&
      entry.graphTrackPublication === "overlay_only"
    ).length,
    1
  );
  assert.equal(
    catalogEntry(catalog, "derive_component_test_surface").inputs.includes(
      "component_code_surface"
    ),
    false
  );
});

test("T-168 full traversal preserves test and release edges after component code", () => {
  const vectorNames = fullGraphVectorNames();
  const componentCode = vectorNames.indexOf("derive_component_code_surface");
  const testDesign = vectorNames.indexOf("derive_test_design_surface");
  const testExecution = vectorNames.indexOf("derive_test_execution_result_surface");
  const testArchive = vectorNames.indexOf("derive_test_run_archive_surface");
  const releaseParity = vectorNames.indexOf("derive_release_depth_parity_surface");
  const release = vectorNames.indexOf("prepare_release_surface");

  assert(componentCode >= 0);
  for (const index of [
    testDesign,
    testExecution,
    testArchive,
    releaseParity,
    release
  ]) {
    assert(index > componentCode);
  }
});

test("T-168 co-affirmation requires test data, expected results, execution, and verification", () => {
  const ledger = validLedger();

  assert.equal(ledger.status, "coaffirmed");
  assert.deepEqual(ledger.testcaseRefs, [
    "testcase://t168/integration",
    "testcase://t168/positive",
    "testcase://t168/uat"
  ]);
  assert(ledger.executionEvidenceRefs.includes("test-execution-admission://t168/sbt-test"));
  assert(ledger.verificationRefs.length, 3);
  assert.equal(ledger.residualPressureRefs.length, 0);
});

test("T-168 co-affirmation blocks missing data, zero tests, bypassed framework, and missing case range", () => {
  const missingData = validLedger({ testDataBindings: [] });
  assert.equal(missingData.status, "blocked");
  assert(
    missingData.residualPressureRefs.some((ref) => ref.endsWith("test-data-missing"))
  );

  const zeroTests = validLedger({
    executionEvidence: executionEvidence({ testsObserved: 0 })
  });
  assert.equal(zeroTests.status, "blocked");
  assert(
    zeroTests.residualPressureRefs.includes(
      "pressure://odd-sdlc/test-pipeline/zero-tests-observed"
    )
  );

  const harnessBypass = validLedger({
    executionEvidence: executionEvidence({
      declaredFrameworkRef: "harness://assertion-only",
      declaredCommand: "harness_assertion"
    })
  });
  assert.equal(harnessBypass.status, "blocked");
  assert(
    harnessBypass.residualPressureRefs.includes(
      "pressure://odd-sdlc/test-pipeline/framework-bypassed"
    )
  );

  const missingBoundaryCase = validLedger({
    requiredCaseKinds: ["positive", "boundary", "integration", "uat"]
  });
  assert.equal(missingBoundaryCase.status, "blocked");
  assert(
    missingBoundaryCase.residualPressureRefs.includes(
      "pressure://odd-sdlc/test-pipeline/case-range/boundary"
    )
  );
});

test("T-168 overlay convergence cannot collapse component code into product closure", () => {
  const module = constructSdlcGtlModule();
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  const fullOverlay = overlayByRef(
    overlayCatalog,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );

  assert.equal(
    sdlcTraversalOverlayAllowsProductConvergence({
      overlay: fullOverlay,
      completedGraphFunctionRef: "derive_component_code_surface"
    }),
    false
  );
  assert.equal(
    sdlcTraversalOverlayAllowsProductConvergence({
      overlay: fullOverlay,
      completedGraphFunctionRef: "bootstrap_release_self_test",
      module
    }),
    true
  );
  assert.equal(
    sdlcTraversalOverlayAllowsProductConvergence({
      overlay: fullOverlay,
      completedGraphFunctionRef: "prepare_release_surface",
      module
    }),
    true
  );

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("full-overlay"),
    ledgerRef: "ledger://odd-sdlc/t168/full",
    ledgerVersionRef: "ledger-version://odd-sdlc/t168/full/1",
    overlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
    overlayBindingRef: "overlay-binding://odd-sdlc/t168/full",
    graphCatalogDigestRef: fullOverlay.graphCatalogDigestRef,
    edgeRef: "edge://odd-sdlc/t168/full",
    attemptRef: "attempt://odd-sdlc/t168/full",
    targetBindingRefs: ["target-binding://odd-sdlc/t168/release"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t168/full"],
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
    decisionRef: "closure-decision://odd-sdlc/t168/full",
    ledger,
    currentEdgeLawful: true
  });

  assert.throws(
    () =>
      constructSdlcOverlaySegmentCompletion({
        completionRef: "overlay-segment-completion://odd-sdlc/t168/full",
        closureDecision,
        stopDisposition: "product_converged",
        terminalAssetTypes: ["release_surface"],
        terminalGraphFunctionRefs: ["bootstrap_release_self_test"],
        remainingGraphPressureRefs: ["pressure://odd-sdlc/t168/test-execution"]
      }),
    /product convergence cannot carry remaining overlay pressure/
  );

  const segmentCompletion = constructSdlcOverlaySegmentCompletion({
    completionRef:
      "overlay-segment-completion://odd-sdlc/t168/full/pressure-preserved",
    closureDecision,
    stopDisposition: "overlay_segment_complete",
    terminalAssetTypes: fullOverlay.termination.terminalAssetTypes,
    terminalGraphFunctionRefs: fullOverlay.termination.terminalGraphFunctionRefs,
    remainingGraphPressureRefs: fullOverlay.termination.remainingGraphPressureRefs,
    remainingRequirementPressureRefs:
      fullOverlay.termination.remainingRequirementPressureRefs,
    remainingAssetPressureRefs: fullOverlay.termination.remainingAssetPressureRefs,
    nextEligibleOverlayRefs: fullOverlay.termination.nextEligibleOverlayRefs
  });

  assert.equal(segmentCompletion.productConverged, false);
  assert(segmentCompletion.remainingGraphPressureRefs.length > 0);
  assert(segmentCompletion.remainingRequirementPressureRefs.length > 0);
  assert(segmentCompletion.remainingAssetPressureRefs.length > 0);
});

test("T-168 post-close overlay continuation carries full traversal into test lifecycle", () => {
  const module = constructSdlcGtlModule();
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  const fullOverlay = overlayByRef(
    overlayCatalog,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  const componentContinuation = sdlcTraversalOverlayNextGraphContinuation({
    module,
    overlay: fullOverlay,
    completedGraphFunctionRef: "derive_component_code_surface"
  });
  assert(componentContinuation);
  assert.equal(
    componentContinuation.nextGraphFunctionRef,
    "qualify_component_realization_surface"
  );

  const testDesignAction = deriveSdlcPostCloseOverlayContinuationActionInput({
    module,
    overlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
    completedGraphFunctionRef: "derive_code_surface",
    runRef: "file:///t168"
  });
  assert(testDesignAction);
  assert.equal(testDesignAction.actionKind, "invoke_graph_function");
  assert.equal(testDesignAction.graphFunctionRef, "derive_test_design_surface");
  assert.equal(testDesignAction.graphVectorRef, "derive_test_design_surface");
  assert.equal(
    testDesignAction.publishedTraversalTargetRef,
    "published-traversal-target://odd-sdlc/derive_test_design_surface/derive_test_design_surface"
  );
});

test("T-168 lite segment close selects next eligible current-full overlay", () => {
  const action = deriveSdlcPostCloseNextEligibleOverlayActionInput({
    module: constructSdlcGtlModule(),
    overlayRef: "overlay://odd-sdlc/lite-design-module-implementation",
    completedGraphFunctionRef: "derive_test_execution_result_surface",
    runRef: "file:///t168-lite-segment-complete"
  });

  assert(action);
  assert.equal(action.actionKind, "invoke_graph_function");
  assert.equal(action.graphFunctionRef, "derive_intent_surface");
  assert(action.graphVectorRef);
  assert(action.requiredAuthorityRefs.includes(
    "overlay://odd-sdlc/current-full-traversal"
  ));
  assert(action.eligibleReasonRefs.includes(
    "evaluate_next_post_close_next_eligible_overlay"
  ));
  assert(action.eligibleReasonRefs.includes(
    "next_overlay:overlay://odd-sdlc/current-full-traversal"
  ));
  assert.match(
    action.actionRef,
    /post_close_next_eligible_overlay/u
  );
});

test("T-168 node execution shard runs materialized test files", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t168-node-tests-"));
  mkdirSync(path.join(workspace, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(workspace, "specification"), { recursive: true });
  mkdirSync(
    path.join(workspace, "build_tenants/hello_world_javascript/test"),
    { recursive: true }
  );
  writeFileSync(path.join(workspace, "README.md"), "# T-168 Node Test Fixture\n");
  writeFileSync(
    path.join(workspace, "specification/INTENT.md"),
    "# Intent\n\nINT-T168: Execute materialized tests.\n"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t168_node_test_fixture",
      "active_tenant: hello_world_javascript",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    runtime: node",
      "    test_runner: node",
      "    test_execution_contract: node --test test/HelloWorldProofBindingTests.test.js"
    ].join("\n")
  );
  writeFileSync(
    path.join(
      workspace,
      "build_tenants/hello_world_javascript/test/HelloWorldProofBindingTests.test.js"
    ),
    "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('proof', () => assert.equal(1, 1));\n"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });

  const contract = hookContractByEdgeName("prepare_test_execution_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "prepare_test_execution_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t168-node-test-execution"
  });

  assert.equal(manifest.productMaterialization.executionShards.length, 1);
  assert.equal(
    manifest.productMaterialization.executionShards[0].command,
    "node --test test/HelloWorldProofBindingTests.test.js"
  );
});

test("T-168 component-test handoff declares shard cwd and workspace-only logs", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t168-test-cwd-"));
  mkdirSync(path.join(workspace, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(workspace, "specification"), { recursive: true });
  writeFileSync(path.join(workspace, "README.md"), "# T-168 Component Test Fixture\n");
  writeFileSync(
    path.join(workspace, "specification/INTENT.md"),
    "# Intent\n\nINT-T168: Generate tests against the shard working directory.\n"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t168_test_cwd_fixture",
      "active_tenant: hello_world_javascript",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    runtime: node",
      "    test_runner: node",
      "    test_execution_contract: node --test"
    ].join("\n")
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });

  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_component_test_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t168-component-test-cwd"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });
  const directives = invocationPackage.outcomeDirectives.join("\n");
  const axioms = invocationPackage.transformAxioms.join("\n");

  assert.equal(manifest.productMaterialization.executionShards.length, 1);
  assert.match(
    manifest.productMaterialization.executionShards[0].workingDirectory,
    /build_tenants\/hello_world_javascript$/
  );
  assert.match(directives, /authored for the matching workerInvocationPackage\.productMaterialization\.executionShards\[\]\.workingDirectory/);
  assert.match(directives, /installed operator executes the declared shard command after this transform returns/);
  assert.doesNotMatch(directives, /proof-binding checks may execute/);
  assert.doesNotMatch(directives, /Generated tests must execute/);
  assert.match(directives, /Do not use \/tmp/);
  assert.match(directives, /resolve allowed write roots to workspace-root absolute paths/);
  assert.match(axioms, /outside-workspace temporary files such as \/tmp/);
  assert.match(axioms, /Allowed write roots are workspace-root-relative/);
});
