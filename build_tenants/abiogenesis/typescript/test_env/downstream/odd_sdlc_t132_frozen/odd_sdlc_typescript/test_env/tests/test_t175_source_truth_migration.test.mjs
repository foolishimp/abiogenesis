// Validates: T-175

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  SDLC_PRODUCT_GRAPH_EDGE_POLICY_ROWS,
  operatorRunArtifactRows,
  operatorRunArtifactRowForArtifactRef,
  operatorRunArtifactRowForRelativePath,
  assertSdlcProductGraphContractCatalog,
  constructSdlcLiveFpParallelMaterializationFrontier,
  admitDesignDepthRegisterFromArtifact,
  constructSdlcGtlModule,
  constructSdlcProductGraphContractCatalog,
  constructSdlcTenantTechnologyStackAuthority,
  constructSdlcWriteTextFilePlan,
  constructSdlcTargetCarrierRegistry,
  constructSdlcTraversalOverlayCatalog,
  deriveSdlcPostflightGapActions,
  deriveSdlcFeatureDependencyDagFromMaps,
  deriveSdlcStagedImplementationTopologyAuthority,
  makeSdlcBlockingReason,
  requireSdlcProductGraphContractRow,
  resolveSdlcTraversalOutcomeClass,
  selectSdlcDependencyMapTraversal,
  sdlcPostflightGapRetryEligible,
  writeSdlcSystemArtifact,
  SDLC_DEPENDENCY_TRAVERSAL_METHODS,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS,
  SDLC_TRAVERSAL_HOP_CLASSES,
  SDLC_TRAVERSAL_OUTCOME_CLASSES,
  SDLC_ZOOM_ADMISSION_DISPOSITIONS
} from "../../build/semantic/code/src/index.js";
import { analyzeSdlcFdRunArchive } from "../../build/semantic/code/src/analysis/analyze.js";
import { readOperatorRunCarriers } from "../../build/semantic/code/src/analysis/carrier_loaders.js";
import { renderSdlcFdRunAnalysisMarkdown } from "../../build/semantic/code/src/analysis/render_markdown.js";
import { deriveRuntimeArtifactGaps } from "../../build/semantic/code/src/analysis/runtime_gaps.js";

function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function writeClosedComponentCodeBaselineArtifacts(archiveRoot) {
  const compositionRef = "abg.fn_composition://t175/product-manifest-gap";
  const compositionDigest = "digest://t175/product-manifest-gap";
  const compositionSelectionRef =
    "abg.fn_composition_selection://t175/product-manifest-gap";
  const selectedRegimeBindingRef =
    "abg.fn_composition.regime_binding://t175/evaluate/fp";
  writeJson(path.join(archiveRoot, "worker_run.json"), {
    kind: "sdlc_worker_run_result",
    status: 0,
    timedOut: false
  });
  writeJson(path.join(archiveRoot, "worker_invocation_package.json"), {
    kind: "sdlc_worker_invocation_package"
  });
  writeJson(path.join(archiveRoot, "fp_evaluate_result.json"), {
    kind: "sdlc_fp_evaluate_result",
    computeNotationStage: "evaluate.C",
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    status: "passed"
  });
  writeJson(path.join(archiveRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    disposition: "close"
  });
  writeJson(path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json"), {
    kind: "sdlc_edge_fulfillment_ledger",
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    targetCarrierAdmissionStatus: "admitted"
  });
  writeJson(path.join(archiveRoot, "sdlc_next_action_projection.json"), {
    kind: "sdlc_next_action_projection",
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    choosesNextTraversal: true
  });
  writeJson(path.join(archiveRoot, "gtl_admitted_state_ref.json"), {
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    graphCallRef: "graph-call://t175/product-manifest-gap",
    frameRef: "frame://t175/product-manifest-gap",
    eventRefs: [],
    ledgerRefs: [],
    projectionRefs: []
  });
  writeJson(path.join(archiveRoot, "gtl_consequence_projection_ref.json"), {
    consequenceRef: "consequence://t175/product-manifest-gap",
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    assuranceDecisionRef: "assurance://t175/product-manifest-gap",
    traversalTransitionRef: "transition://t175/product-manifest-gap",
    domainReadModelRefs: []
  });
}

function frontierPayload() {
  return constructSdlcLiveFpParallelMaterializationFrontier({
    edgeName: "derive_component_code_surface",
    executionAuthority: "abg_evented_saga_frontier",
    parallelismControl: "abg_branch_execution_policy",
    graphTruthSource: "sdlc_feature_dependency_dag",
    selectedMethod: "parallel",
    dependencyMapRef: "dependency-map://odd-sdlc/t175/modules",
    testDependencyMapRef: "dependency-map://odd-sdlc/t175/tests",
    uatTestDependencyMapRef: null,
    dependencyMapRefs: [
      "dependency-map://odd-sdlc/t175/modules",
      "dependency-map://odd-sdlc/t175/tests"
    ],
    traversalSelectionRef: "selection://odd-sdlc/t175/modules",
    testTraversalSelectionRef: "selection://odd-sdlc/t175/tests",
    uatTestTraversalSelectionRef: null,
    traversalSelectionRefs: [
      "selection://odd-sdlc/t175/modules",
      "selection://odd-sdlc/t175/tests"
    ],
    dagRef: "dag://odd-sdlc/t175/live-frontier",
    startNodes: [
      "sdlc-dag-node://module/hello",
      "sdlc-dag-node://test/hello"
    ],
    frontierRef: "frontier://odd-sdlc/t175/live-frontier",
    policyRef: "policy://odd-sdlc/t175/live-frontier",
    laneCount: 2,
    devLaneCount: 1,
    componentTestLaneCount: 1,
    uatTestLaneCount: 0,
    testLaneCount: 1,
    fanInCount: 1,
    batchCount: 2,
    batchSizes: [2, 1],
    maxActive: 2,
    readyBranchRefs: [
      "branch://odd-sdlc/t175/live-frontier/module-hello",
      "branch://odd-sdlc/t175/live-frontier/test-hello"
    ],
    compiledReadyBranchRefs: [
      "branch://odd-sdlc/t175/live-frontier/module-hello",
      "branch://odd-sdlc/t175/live-frontier/test-hello"
    ],
    completedBranchRefs: [
      "branch://odd-sdlc/t175/live-frontier/module-hello",
      "branch://odd-sdlc/t175/live-frontier/test-hello",
      "branch://odd-sdlc/t175/live-frontier/fan-in"
    ],
    failedBranchRefs: [],
    writeTerritoryConflictRefs: [],
    outputAllocationConflictRefs: [],
    branchRows: [
      {
        branchRef: "branch://odd-sdlc/t175/live-frontier/module-hello",
        branchKey: "module-hello",
        nodeId: "sdlc-dag-node://module/hello",
        laneKind: "dev",
        workerProcessRef: "abg-native-branch-task://odd-sdlc/t175/module-hello",
        materializationTargetRefs: ["src/hello.js"],
        readRefs: ["requirement://REQ-T175-HELLO"],
        writeTerritoryRefs: ["workspace://src/hello.js"],
        outputAllocationRefs: ["artifact://src/hello.js"]
      },
      {
        branchRef: "branch://odd-sdlc/t175/live-frontier/test-hello",
        branchKey: "test-hello",
        nodeId: "sdlc-dag-node://test/hello",
        laneKind: "test",
        workerProcessRef: "abg-native-branch-task://odd-sdlc/t175/test-hello",
        materializationTargetRefs: ["test/hello.test.js"],
        readRefs: ["testcase://TESTCASE-T175-HELLO"],
        writeTerritoryRefs: ["workspace://test/hello.test.js"],
        outputAllocationRefs: ["artifact://test/hello.test.js"]
      }
    ],
    fanInRows: [
      {
        branchRef: "branch://odd-sdlc/t175/live-frontier/fan-in",
        nodeId: "sdlc-dag-node://fan-in/t175",
        predecessorBranchRefs: [
          "branch://odd-sdlc/t175/live-frontier/module-hello",
          "branch://odd-sdlc/t175/live-frontier/test-hello"
        ],
        materializationTargetRefs: ["reports/t175-frontier.json"],
        payloadDigest: "payload://odd-sdlc/t175/fan-in"
      }
    ],
    emittedEventKinds: [
      "branch_fan_in_projected",
      "branch_lease_acquired",
      "branch_payload_admitted"
    ],
    emittedEventCount: 9,
    replayEventCount: 9
  });
}

function minimalModuleDependencyMap() {
  return Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t175/modules",
    summaryRef: "decomposition-summary://odd-sdlc/t175/modules",
    nodes: [
      {
        nodeId: "module://hello",
        predecessorNodeIds: [],
        successorNodeIds: [],
        ownedRequirementRefs: ["REQ-T175-HELLO"],
        materializationTargetRefs: ["src/hello.js"]
      }
    ],
    steelThreadCandidateNodeIds: ["module://hello"],
    parallelPartitionRefs: ["partition://module/hello"],
    cycleRefs: []
  });
}

function minimalModuleTraversalSelection() {
  return Object.freeze({
    kind: "sdlc_dependency_traversal_selection",
    selectionRef: "selection://odd-sdlc/t175/modules",
    dependencyMapRef: "dependency-map://odd-sdlc/t175/modules",
    dependencyMapKind: "sdlc_module_dependency_map",
    selectedMethod: "parallel",
    selectedNodeIds: ["module://hello"],
    parallelGroupRefs: ["partition://module/hello"],
    blockingReasons: [],
    basisRefs: ["dependency-map://odd-sdlc/t175/modules"]
  });
}

function minimalTestDependencyMap() {
  return Object.freeze({
    kind: "sdlc_test_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t175/tests",
    summaryRef: "decomposition-summary://odd-sdlc/t175/tests",
    nodes: [
      {
        nodeId: "test-class://hello",
        predecessorNodeIds: [],
        successorNodeIds: [],
        ownedRequirementRefs: ["REQ-T175-HELLO-TEST"],
        materializationTargetRefs: ["test/hello.test.js"]
      }
    ],
    steelThreadCandidateNodeIds: ["test-class://hello"],
    parallelShardRefs: ["shard://test/hello"],
    cycleRefs: []
  });
}

function minimalTestTraversalSelection() {
  return Object.freeze({
    kind: "sdlc_dependency_traversal_selection",
    selectionRef: "selection://odd-sdlc/t175/tests",
    dependencyMapRef: "dependency-map://odd-sdlc/t175/tests",
    dependencyMapKind: "sdlc_test_dependency_map",
    selectedMethod: "parallel",
    selectedNodeIds: ["test-class://hello"],
    parallelGroupRefs: ["shard://test/hello"],
    blockingReasons: [],
    basisRefs: ["dependency-map://odd-sdlc/t175/tests"]
  });
}

test("T-175 traversal value domains are catalog-owned", () => {
  assert.deepEqual([...SDLC_TRAVERSAL_OUTCOME_CLASSES], [
    "domain_product",
    "framework_smoke",
    "tutorial_example"
  ]);
  assert.deepEqual([...SDLC_TRAVERSAL_HOP_CLASSES], [
    "single_hop",
    "dual_hop",
    "staged",
    "zoom_required",
    "blocked"
  ]);
  assert.deepEqual([...SDLC_ZOOM_ADMISSION_DISPOSITIONS], [
    "continue",
    "zoom_required",
    "blocked"
  ]);
  assert.deepEqual([...SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS], [
    "none",
    "typed_template",
    "replay_visible_projection",
    "bundled_fp_output",
    "outcome_class_graph_variant"
  ]);
  assert.deepEqual([...SDLC_DEPENDENCY_TRAVERSAL_METHODS], [
    "steel_thread",
    "parallel",
    "serial",
    "blocked"
  ]);

  assert.equal(
    existsSync("code/src/analysis/json_shape.ts"),
    false,
    "analysis-local JSON admission helpers must not remain as a live truth path"
  );
});

test("T-175 outcome class resolution is one semantic function", () => {
  assert.equal(
    resolveSdlcTraversalOutcomeClass({
      explicitValue: "tutorial_example",
      trivialProduct: false
    }).outcomeClass,
    "tutorial_example"
  );
  assert.equal(
    resolveSdlcTraversalOutcomeClass({
      explicitValue: "not-a-class",
      trivialProduct: true
    }).outcomeClass,
    "framework_smoke"
  );
  assert.deepEqual(
    resolveSdlcTraversalOutcomeClass({
      explicitValue: "not-a-class",
      trivialProduct: false
    }).blockingReasons,
    ["invalid_traversal_outcome_class:not-a-class"]
  );
});

test("T-175 operator-run artifact catalog owns T-174 frontier admission", () => {
  const row = operatorRunArtifactRowForRelativePath(
    "sdlc_live_fp_parallel_materialization_frontier.json"
  );
  assert(row);
  assert.equal(row.role, "runtime_fact");
  assert.equal(row.sourceOwner, "abg_runtime");
  assert.equal(row.requiredWhen, "parallel_dependency_traversal_selected");
  assert.equal(row.malformedGapTracked, true);

  const malformedTracked = operatorRunArtifactRows({
    malformedGapTracked: true
  }).map((artifact) => artifact.relativePath);
  assert(malformedTracked.includes("sdlc_live_fp_parallel_materialization_frontier.json"));
  assert(malformedTracked.includes("sdlc_module_dependency_map.json"));
});

test("T-175 operator-run loader is catalog-indexed", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-catalog-loader-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    const artifact = operatorRunArtifactRowForArtifactRef(
      "operator-run-artifact://live-fp-parallel-materialization-frontier"
    );
    assert(artifact);
    writeJson(path.join(archiveRoot, artifact.relativePath), frontierPayload());

    const carriers = readOperatorRunCarriers(archiveRoot);
    assert.equal(
      carriers.artifactStateByRef[artifact.artifactRef]?.status,
      "present"
    );
    assert.equal(
      carriers.liveFpParallelMaterializationFrontier.status,
      "present"
    );
    assert.equal(
      carriers.fileSizeByArtifactRef[artifact.artifactRef],
      carriers.fileSizes.sdlcLiveFpParallelMaterializationFrontier
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 archive writes are catalog-enforced for authoritative artifacts", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-archive-write-"));
  try {
    assert.throws(
      () =>
        writeSdlcSystemArtifact({
          archiveRoot: root,
          relativePath: "uncataloged_authority.json",
          payload: {
            kind: "sdlc_uncataloged_authority"
          }
        }),
      /authoritative operator archive payload has no catalog row/u
    );

    assert.throws(
      () =>
        writeSdlcSystemArtifact({
          archiveRoot: root,
          artifactRef: "operator-run-artifact://live-fp-parallel-materialization-frontier",
          payload: {
            kind: "sdlc_wrong_frontier_kind"
          }
        }),
      /does not match catalog carrier kind/u
    );

    const gapDossierRow = operatorRunArtifactRowForRelativePath("gap_dossier.json");
    assert.equal(
      gapDossierRow?.artifactRef,
      "operator-run-artifact://postflight-gap-dossier"
    );
    const gapDossierPath = writeSdlcSystemArtifact({
      archiveRoot: root,
      relativePath: "gap_dossier.json",
      payload: {
        kind: "sdlc_postflight_gap_dossier",
        status: "open",
        graphFunctionName: "fixture_graph",
        edgeName: "fixture_edge",
        vectorIndex: 0,
        targetAssetType: "fixture_surface",
        reasons: [],
        evidenceRefs: [],
        priorManifestId: "file:///fixture/handoff_manifest.json",
        currentGapDossierRef: "file:///fixture/gap_dossier.json",
        retryEligible: false,
        nextLawfulActions: []
      }
    });
    assert.equal(existsSync(gapDossierPath), true);

    const written = writeSdlcSystemArtifact({
      archiveRoot: root,
      artifactRef: "operator-run-artifact://live-fp-parallel-materialization-frontier",
      payload: frontierPayload()
    });
    assert.equal(
      written.endsWith("sdlc_live_fp_parallel_materialization_frontier.json"),
      true
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 product graph catalog carries current T-174 graph truth", () => {
  const module = constructSdlcGtlModule();
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({ module });
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  const productGraph = constructSdlcProductGraphContractCatalog({
    module,
    edgeContracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
    targetCarrierRows: targetCarrierRegistry.rows,
    overlays: overlayCatalog.overlays
  });
  assertSdlcProductGraphContractCatalog(productGraph);

  const componentCode = requireSdlcProductGraphContractRow({
    catalog: productGraph,
    edgeRef: "derive_component_code_surface"
  });
  assert.equal(componentCode.workerDispatchPolicy, "abg_frontier_eligible");
  assert(componentCode.requiredArtifactRefs.includes(
    "operator-run-artifact://module-dependency-map"
  ));
  assert(componentCode.requiredArtifactRefs.includes(
    "operator-run-artifact://module-dependency-traversal-selection"
  ));
  assert(componentCode.requiredArtifactRefs.includes(
    "operator-run-artifact://live-fp-parallel-materialization-frontier"
  ));
  assert.equal(
    componentCode.requiredArtifactRefs.includes(
      "operator-run-artifact://test-dependency-map"
    ),
    false
  );

  const componentTest = requireSdlcProductGraphContractRow({
    catalog: productGraph,
    edgeRef: "derive_component_test_surface"
  });
  assert.equal(componentTest.workerDispatchPolicy, "abg_frontier_eligible");
  assert(componentTest.requiredArtifactRefs.includes(
    "operator-run-artifact://test-dependency-map"
  ));
  assert(componentTest.requiredArtifactRefs.includes(
    "operator-run-artifact://live-fp-parallel-materialization-frontier"
  ));
  assert.equal(
    componentTest.requiredArtifactRefs.includes(
      "operator-run-artifact://module-dependency-map"
    ),
    true
  );
  const uatTest = requireSdlcProductGraphContractRow({
    catalog: productGraph,
    edgeRef: "derive_uat_test_source_surface"
  });
  assert.equal(uatTest.workerDispatchPolicy, "abg_frontier_eligible");
  assert(uatTest.requiredArtifactRefs.includes(
    "operator-run-artifact://test-dependency-map"
  ));
  assert(uatTest.requiredArtifactRefs.includes(
    "operator-run-artifact://live-fp-parallel-materialization-frontier"
  ));
  assert.equal(
    uatTest.requiredArtifactRefs.includes(
      "operator-run-artifact://module-dependency-map"
    ),
    false
  );
  const featureDecomp = requireSdlcProductGraphContractRow({
    catalog: productGraph,
    edgeRef: "derive_feature_decomp_surface"
  });
  assert.equal(
    featureDecomp.requiredArtifactRefs.includes(
      "operator-run-artifact://product-materialization-manifest"
    ),
    false
  );
  assert(componentCode.requiredArtifactRefs.includes(
    "operator-run-artifact://product-materialization-manifest"
  ));
});

test("T-175 graph frontier policy is row data, not hidden edge-name helpers", () => {
  const source = readFileSync(
    path.resolve("code/src/contracts/product_graph_contract_catalog.ts"),
    "utf8"
  );
  assert.doesNotMatch(source, /function t174RequiredArtifactsForEdge/u);
  assert.doesNotMatch(source, /function workerDispatchPolicyFor/u);
  assert(
    SDLC_PRODUCT_GRAPH_EDGE_POLICY_ROWS.some(
      (row) =>
        row.edgeRef === "derive_component_code_surface" &&
        row.workerDispatchPolicy === "abg_frontier_eligible" &&
        row.requiredArtifactRefs.includes(
          "operator-run-artifact://live-fp-parallel-materialization-frontier"
        )
    )
  );
});

test("T-175 tenant stack and postflight decisions are carrier-owned", () => {
  const missing = constructSdlcTenantTechnologyStackAuthority({
    required: true,
    buildConfigTargets: [],
    sourceRefs: [],
    reasonRefs: []
  });
  assert.equal(missing.statusDecision.status, "missing");

  const invalid = constructSdlcTenantTechnologyStackAuthority({
    required: true,
    buildConfigTargets: [],
    sourceRefs: ["file:///tenant/spec/TECH_STACK.json"],
    reasonRefs: [
      "tenant_stack_invalid_target:file:///tenant/spec/TECH_STACK.json:/tmp/package.json"
    ]
  });
  assert.equal(invalid.statusDecision.status, "invalid");
  assert.deepEqual(invalid.statusDecision.invalidReasonRefs, [
    "tenant_stack_invalid_target:file:///tenant/spec/TECH_STACK.json:/tmp/package.json"
  ]);

  const reasons = [
    makeSdlcBlockingReason({ code: "output_file_missing" }),
    makeSdlcBlockingReason({ code: "tenant_stack_authority_missing" })
  ];
  assert.equal(sdlcPostflightGapRetryEligible(reasons), true);
  assert.deepEqual(deriveSdlcPostflightGapActions(reasons), [
    "repair_worker_output",
    "reprice_requirement_or_design"
  ]);

  const writePlan = constructSdlcWriteTextFilePlan({
    absolutePath: "/tmp/odd-sdlc-t175-proof.txt",
    content: "ok"
  });
  assert.equal(writePlan.effectKind, "write_text_file");
  assert.equal(writePlan.createParentDirectories, true);
});

test("T-175 runtime gaps fail closed on malformed T-174 frontier artifact", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-artifacts-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    writeJson(
      path.join(archiveRoot, "sdlc_live_fp_parallel_materialization_frontier.json"),
      {
        kind: "sdlc_live_fp_parallel_materialization_frontier",
        edgeName: "derive_component_code_surface"
      }
    );
    const carriers = readOperatorRunCarriers(archiveRoot);
    const result = deriveRuntimeArtifactGaps({ carriers: [carriers] });
    assert(
      result.gaps.some(
        (gap) =>
          gap.artifact === "sdlc_live_fp_parallel_materialization_frontier.json" &&
          gap.status === "malformed"
      ),
      JSON.stringify(result.gaps, null, 2)
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 analyzer admission requires T-174 graph-truth frontier fields", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-frontier-guard-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    const incomplete = { ...frontierPayload() };
    delete incomplete.dagRef;
    delete incomplete.branchRows;
    writeJson(
      path.join(archiveRoot, "sdlc_live_fp_parallel_materialization_frontier.json"),
      incomplete
    );
    const carriers = readOperatorRunCarriers(archiveRoot);
    assert.equal(carriers.liveFpParallelMaterializationFrontier.status, "malformed");
    const result = deriveRuntimeArtifactGaps({ carriers: [carriers] });
    assert(
      result.gaps.some(
        (gap) =>
          gap.artifact === "sdlc_live_fp_parallel_materialization_frontier.json" &&
          gap.status === "malformed"
      ),
      JSON.stringify(result.gaps, null, 2)
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 runtime gaps require T-174 frontier artifact when parallel traversal is selected", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-frontier-missing-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    writeJson(path.join(archiveRoot, "operator_summary.json"), {
      kind: "sdlc_operator_summary",
      currentEdge: "derive_component_code_surface"
    });
    writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
      kind: "sdlc_worker_handoff_manifest",
      edgeName: "derive_component_code_surface"
    });
    writeJson(
      path.join(archiveRoot, "sdlc_module_dependency_map.json"),
      minimalModuleDependencyMap()
    );
    writeJson(
      path.join(archiveRoot, "sdlc_module_dependency_traversal_selection.json"),
      minimalModuleTraversalSelection()
    );
    const carriers = readOperatorRunCarriers(archiveRoot);
    const result = deriveRuntimeArtifactGaps({ carriers: [carriers] });
    assert(
      result.gaps.some(
        (gap) =>
          gap.artifact === "sdlc_live_fp_parallel_materialization_frontier.json" &&
          gap.status === "missing" &&
          gap.detail?.includes("parallel_dependency_traversal_selected")
      ),
      JSON.stringify(result.gaps, null, 2)
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 runtime gaps require T-174 frontier for parallel component-test graph truth", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-frontier-scoped-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    writeJson(path.join(archiveRoot, "operator_summary.json"), {
      kind: "sdlc_operator_summary",
      currentEdge: "derive_component_test_surface"
    });
    writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
      kind: "sdlc_worker_handoff_manifest",
      edgeName: "derive_component_test_surface",
      targetAssetType: "component_test_surface"
    });
    writeJson(
      path.join(archiveRoot, "sdlc_test_dependency_map.json"),
      minimalTestDependencyMap()
    );
    writeJson(
      path.join(archiveRoot, "sdlc_test_dependency_traversal_selection.json"),
      minimalTestTraversalSelection()
    );
    const carriers = readOperatorRunCarriers(archiveRoot);
    const result = deriveRuntimeArtifactGaps({ carriers: [carriers] });
    assert(
      result.gaps.some(
        (gap) =>
          gap.artifact === "sdlc_live_fp_parallel_materialization_frontier.json" &&
          gap.status === "missing" &&
          gap.detail?.includes("parallel_dependency_traversal_selected")
      ),
      JSON.stringify(result.gaps, null, 2)
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 runtime gaps require product materialization from catalog and graph policy", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-product-manifest-gap-"));
  try {
    const archiveRoot = path.join(root, "operator-run");
    mkdirSync(archiveRoot, { recursive: true });
    writeJson(path.join(archiveRoot, "operator_summary.json"), {
      kind: "sdlc_operator_summary",
      currentEdge: "derive_component_code_surface"
    });
    writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
      kind: "sdlc_worker_handoff_manifest",
      edgeName: "derive_component_code_surface",
      targetAssetType: "component_code_surface"
    });
    writeClosedComponentCodeBaselineArtifacts(archiveRoot);

    const carriers = readOperatorRunCarriers(archiveRoot);
    const result = deriveRuntimeArtifactGaps({ carriers: [carriers] });
    assert(
      result.gaps.some(
        (gap) =>
          gap.artifact === "product_materialization_manifest.json" &&
          gap.status === "missing" &&
          gap.detail?.includes(
            "closed_product_edge_requires_materialization_manifest"
          )
      ),
      JSON.stringify(result.gaps, null, 2)
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-175 DAG migration fails closed on unknown dependency-map node refs", () => {
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t175/unknown-dependency-ref",
    graphFunctionName: "t175_unknown_dependency_ref",
    moduleDependencyMap: {
      ...minimalModuleDependencyMap(),
      nodes: [
        {
          nodeId: "module://hello",
          predecessorNodeIds: ["module://missing"],
          successorNodeIds: [],
          ownedRequirementRefs: ["REQ-T175-HELLO"],
          materializationTargetRefs: ["src/hello.js"]
        }
      ]
    },
    includeFanIn: false
  });
  assert.equal(dag.startNodes.length, 0);
  assert(
    dag.blockingReasons.some((reason) =>
      reason.includes("unknown_dag_node_ref:sdlc-dag-node://module/module-hello<-unknown-sdlc-dag-node://module/module-missing")
    ),
    JSON.stringify(dag.blockingReasons, null, 2)
  );
});

test("T-175 analyzer reports T-174 frontier graph truth as reviewable output", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-frontier-analysis-"));
  try {
    const archiveRoot = path.join(root, "20260522T010101001Z_pid1");
    mkdirSync(archiveRoot, { recursive: true });
    writeJson(path.join(archiveRoot, "operator_summary.json"), {
      kind: "sdlc_operator_summary",
      graphFunctionName: "derive_component_code_surface",
      currentEdge: "derive_component_code_surface"
    });
    writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
      kind: "sdlc_worker_handoff_manifest",
      graphFunctionName: "derive_component_code_surface",
      edgeName: "derive_component_code_surface",
      targetAssetType: "code_surface"
    });
    writeJson(
      path.join(archiveRoot, "sdlc_live_fp_parallel_materialization_frontier.json"),
      frontierPayload()
    );

    const result = analyzeSdlcFdRunArchive({ inspectedRoot: archiveRoot });
    assert.equal(result.edgeTraversal.length, 1);
    assert.equal(
      result.edgeTraversal[0]?.frontierSummary?.graphTruthSource,
      "sdlc_feature_dependency_dag"
    );
    assert.equal(result.edgeTraversal[0]?.frontierSummary?.branchRows.length, 2);
    assert.equal(result.edgeTraversal[0]?.frontierSummary?.fanInRows.length, 1);
    assert.deepEqual(
      result.edgeTraversal[0]?.frontierSummary?.compiledReadyBranchRefs,
      frontierPayload().compiledReadyBranchRefs
    );

    const markdown = renderSdlcFdRunAnalysisMarkdown(result);
    assert(markdown.includes("## Frontier Graph Truth"));
    assert(markdown.includes("dag://odd-sdlc/t175/live-frontier"));
    assert(markdown.includes("1 dev / 1 test"));
    assert(markdown.includes("abg-native-branch-task://odd-sdlc/t175/test-hello"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-181 design admission rejects T-174 ADR markdown as implementation-register authority", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-live-adr-"));
  try {
    const adrPath = path.join(
      root,
      "build_tenants/parallel_hello_world/design/adrs/ADR-002-implementation-design-surface.md"
    );
    mkdirSync(path.dirname(adrPath), { recursive: true });
    writeFileSync(
      adrPath,
      [
        "# ADR-002: Parallel Hello World Implementation Design Surface",
        "",
        "## Module Boundary",
        "",
        "| Component | Kind | Product target | Owns | Depends on |",
        "| --- | --- | --- | --- | --- |",
        "| `package_metadata` | build config | `package.json` | Package identity. | None |",
        "| `hello_branch` | source | `src/hello.js` | `hello()` returns `hello`. | None |",
        "| `world_branch` | source | `src/world.js` | `world()` returns `world`. | None |",
        "| `composition_export` | source | `src/index.js` | Export `helloWorld()`. | `hello_branch`; `world_branch` |",
        "| `direct_node_entry` | source invocation | `src/index.js` | Direct execution proof. | `composition_export`; `package_metadata` |",
        "| `hello_branch_test` | test | `test/hello.test.js` | Assert hello. | `hello_branch` |",
        "| `world_branch_test` | test | `test/world.test.js` | Assert world. | `world_branch` |",
        "| `branch_test_command` | proof contract | tenant root | Run branch tests. | `hello_branch_test`; `world_branch_test`; `package_metadata` |",
        "",
        "## Product File Targets",
        "",
        "| Role | Path | Owning component | Implementation note |",
        "| --- | --- | --- | --- |",
        "| build_config | `build_tenants/parallel_hello_world/package.json` | `package_metadata` | Package metadata. |",
        "| source | `build_tenants/parallel_hello_world/src/hello.js` | `hello_branch` | Hello branch. |",
        "| source | `build_tenants/parallel_hello_world/src/world.js` | `world_branch` | World branch. |",
        "| source | `build_tenants/parallel_hello_world/src/index.js` | `composition_export`; `direct_node_entry` | Fan-in and direct entry. |",
        "| test | `build_tenants/parallel_hello_world/test/hello.test.js` | `hello_branch_test` | Hello test. |",
        "| test | `build_tenants/parallel_hello_world/test/world.test.js` | `world_branch_test` | World test. |",
        "",
        "## Requirement Lineage",
        "",
        "| Obligation | Owning component | Downstream target | Source refs |",
        "| --- | --- | --- | --- |",
        "| `REQ-T174-001` | `package_metadata` | `package.json` | bootstrap |",
        "| `REQ-T174-002` | `hello_branch` | `src/hello.js` | bootstrap |",
        "| `REQ-T174-003` | `world_branch` | `src/world.js` | bootstrap |",
        "| `REQ-T174-004` | `composition_export` | `src/index.js` | bootstrap |",
        "| `REQ-T174-005` | `hello_branch_test` | `test/hello.test.js` | bootstrap |",
        "| `REQ-T174-006` | `world_branch_test` | `test/world.test.js` | bootstrap |",
        "| `REQ-T174-007` | `direct_node_entry` | public import/direct execution proof | bootstrap |",
        "| `REQ-T174-008` | `branch_test_command` | `node --test test/hello.test.js test/world.test.js` | bootstrap |"
      ].join("\n"),
      "utf8"
    );
    const admission = admitDesignDepthRegisterFromArtifact({
      targetAssetType: "implementation_design_surface",
      outputFile: adrPath,
      archiveRoot: path.join(root, "archive")
    });
    assert.equal(admission.status, "rejected");
    assert.deepEqual(admission.blockingReasons, [
      "design_depth_register_missing"
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-181 design admission rejects data-mapper ADR markdown as implementation-register authority", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t175-data-mapper-"));
  try {
    const adrPath = path.join(
      root,
      "build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
    );
    mkdirSync(path.dirname(adrPath), { recursive: true });
    writeFileSync(
      adrPath,
      [
        "# ADR-002: CDME Implementation Design Surface",
        "",
        "## Module Boundary",
        "",
        "| Module | Public responsibility | Primary implementation surfaces |",
        "| --- | --- | --- |",
        "| `cdme-compiler` | Admit topology and binding context. | Compiler model. |",
        "| `cdme-assurance` | Run dry-run assurance. | Assurance report. |",
        "| `cdme-executor` | Execute admitted Spark plans. | Spark executor. |",
        "| `cdme-adjoint` | Represent reverse metadata and adjoint queries. | Adjoint contracts. |",
        "| `cdme-accounting` | Enforce zero-loss accounting. | Ledger writer. |",
        "| `cdme-fidelity` | Govern fidelity and DQ. | Certificate chain. |",
        "| `cdme-engine` | Provide facade and CLI runner. | Engine API. |",
        "",
        "## Product File Targets",
        "",
        "| File target | Role | Downstream realization direction |",
        "| --- | --- | --- |",
        "| `build_tenants/scala_spark/build.sbt` | `build_config` | Multi-module SBT build. |",
        "| `build_tenants/scala_spark/project` | `build_config` | SBT metadata. |",
        "| `build_tenants/scala_spark/cdme-compiler/src/main/scala` | `source` | Compiler source. |",
        "| `build_tenants/scala_spark/cdme-assurance/src/main/scala` | `source` | Assurance source. |",
        "| `build_tenants/scala_spark/cdme-executor/src/main/scala` | `source` | Executor source. |",
        "| `build_tenants/scala_spark/cdme-adjoint/src/main/scala` | `source` | Adjoint source. |",
        "| `build_tenants/scala_spark/cdme-accounting/src/main/scala` | `source` | Accounting source. |",
        "| `build_tenants/scala_spark/cdme-fidelity/src/main/scala` | `source` | Fidelity source. |",
        "| `build_tenants/scala_spark/cdme-engine/src/main/scala` | `source` | Engine source. |",
        "| `build_tenants/scala_spark/*/src/test/scala` | `test` | Test design owns generated tests. |",
        "",
        "## Requirement Lineage",
        "",
        "| Component | Requirement refs |",
        "| --- | --- |",
        "| `cdme-compiler/topology` | `req_ldm_001`, `req_ldm_002` |",
        "| `cdme-compiler/binding-context` | `req_pdm_001`, `req_pdm_002` |",
        "| `cdme-assurance` | `req_ai_002`, `req_int_003` |",
        "| `cdme-executor` | `req_trv_001`, `req_int_001` |",
        "| `cdme-executor/error-dq-entry` | `req_error_001`, `req_dq_001` |",
        "| `cdme-adjoint/contracts` | `req_adj_001`, `req_adj_002` |",
        "| `cdme-adjoint/queries` | `req_adj_008`, `req_adj_009` |",
        "| `cdme-accounting` | `req_acc_001`, `req_acc_002` |",
        "| `cdme-fidelity` | `req_cov_001`, `req_cov_002` |",
        "| `cdme-fidelity/dq` | `req_dq_002`, `req_dq_003` |",
        "| `cdme-engine` | `req_eng_001`, `req_eng_002` |"
      ].join("\n"),
      "utf8"
    );
    const admission = admitDesignDepthRegisterFromArtifact({
      targetAssetType: "implementation_design_surface",
      outputFile: adrPath,
      archiveRoot: path.join(root, "archive")
    });
    assert.equal(admission.status, "rejected");
    assert.deepEqual(admission.blockingReasons, [
      "design_depth_register_missing"
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
