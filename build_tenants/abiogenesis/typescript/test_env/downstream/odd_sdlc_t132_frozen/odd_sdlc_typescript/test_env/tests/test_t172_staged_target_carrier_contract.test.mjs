// Validates: T-172
// Validates: REQ-F-ODDSDLC-080

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { materializeGraphFunction } from "@abiogenesis/typescript-tenant";

import {
  constructWorkerInvocationPackage,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRows,
  deriveSdlcStagedConstructionAuditCarriers,
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  reconcileSdlcProductMaterializationAuthority,
  resolveSdlcEdgeGainClosureContract,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function makeWorkspace({ trivialProduct = false } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t172-staged-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-172 Fixture\n", "utf8");
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T172: Prove staged construction contracts.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    "# Requirements\n\nREQ-T172-001: Materialization consumes admitted topology.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t172_fixture",
      "active_tenant: typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: typescript",
      "    build_tool: npm",
      ...(trivialProduct
        ? [
            "    capability_contracts:",
            "      trivial_product: true"
          ]
        : [])
    ].join("\n"),
    "utf8"
  );
  mkdirSync(path.join(root, "build_tenants/typescript/spec"), {
    recursive: true
  });
  writeFileSync(
    path.join(root, "build_tenants/typescript/spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "TypeScript",
        buildTool: "npm",
        sourceTargets: ["build_tenants/typescript/src/index.ts"],
        testFiles: ["build_tenants/typescript/test/index.test.ts"]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function targetCarrierRow(edgeRef) {
  const module = constructSdlcGtlModule();
  const vectors = module.graphFunctions.flatMap((graphFunction) =>
    materializeGraphFunction(graphFunction).vectors
  );
  const rows = constructSdlcTargetCarrierRows({
    vectors,
    contracts: [resolveSdlcEdgeGainClosureContract(edgeRef)]
  });
  const row = rows.find((candidate) => candidate.edgeRef === edgeRef);
  assert(row, edgeRef);
  return row;
}

function writeJsonFile(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  writeFileSync(filePath, content, "utf8");
  return content;
}

function implementationDesignRegister(componentTopologyRows) {
  const fileTargetRows = [
    ...new Map(
      componentTopologyRows.map((row) => [
        row.relativePath,
        {
          kind: "sdlc_file_target_row",
          relativePath: row.relativePath,
          role: "source"
        }
      ])
    ).values()
  ];
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://node",
        language: "javascript",
        buildTool: "npm"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "app",
        moduleRef: "module://app"
      }
    ],
    aggregateDomainModelRows: [],
    moduleSchemaFragments: [],
    moduleStateDiagramFragments: [],
    aggregateDomainModel: null,
    sunnyDaySequenceRows: [],
    aggregateSunnyDaySequence: null,
    componentTopologyRows,
    componentRealizationRows: componentTopologyRows.map((row) => ({
      kind: "sdlc_component_realization_row",
      componentId: row.componentId,
      moduleName: row.moduleName,
      relativePath: row.relativePath,
      publicBoundary: row.publicBoundary,
      trancheId: null,
      firstProductFileToChange: row.relativePath,
      upstreamComponentIds: [],
      requirementIds: row.requirementIds,
      sourceAssetRefs: row.sourceAssetRefs
    })),
    fileTargetRows,
    designCompletenessVerdict: null
  };
}

function implementationDesignAdr(componentTopologyRows) {
  const fileTargets = [
    ...new Map(
      componentTopologyRows.map((row) => [
        row.relativePath,
        `| \`${row.relativePath}\` | source |`
      ])
    ).values()
  ];
  const lineageRows = componentTopologyRows.flatMap((row) =>
    row.requirementIds.map(
      (requirementId) =>
        `| ${requirementId} | ${row.componentId} | \`${row.relativePath}\` |`
    )
  );
  return [
    "# ADR-002 Implementation Design Surface",
    "",
    "## Decision",
    "",
    "The implementation uses the declared module and component boundaries.",
    "",
    "## Module Boundary",
    "",
    "- Module: `app`",
    "- Public boundary: `src/hello.js`",
    "- Component: `hello`",
    "",
    "## Product File Targets",
    "",
    "| Path | Role |",
    "| ---- | ---- |",
    ...fileTargets,
    "",
    "## Requirement Lineage",
    "",
    "| Requirement | Owning Component | Realization File |",
    "| ----------- | ---------------- | ---------------- |",
    ...lineageRows,
    ""
  ].join("\n");
}

function componentTopologyRow(overrides = {}) {
  return {
    kind: "sdlc_component_topology_row",
    componentId: "hello",
    moduleName: "app",
    relativePath: "src/hello.js",
    publicBoundary: "src/hello.js",
    concernRole: "other",
    requirementIds: ["REQ-T172-001"],
    sourceAssetRefs: ["asset://requirement/REQ-T172-001"],
    ...overrides
  };
}

function testDesignRegister(testcaseIds = ["TC-T172-001"]) {
  return {
    kind: "sdlc_test_design_register",
    registerVersion: "ts-test-design-v1",
    targetAssetType: "test_design_surface",
    designConsumptionRows: [
      {
        kind: "sdlc_design_consumption_contract",
        contractRef: "design-consumption://t172/test",
        sourceDesignObligationRefs: ["REQ-T172-001"],
        authorityBasisRefs: ["asset://implementation-design"],
        consumerGraphFunctionRefs: ["derive_component_test_surface"]
      }
    ],
    uatTestcaseRows: [
      {
        kind: "sdlc_test_case_row",
        testCaseRef: testcaseIds[0] ?? "TC-T172-001",
        caseKind: "uat",
        executionLane: "uat",
        sourceDesignObligationRefs: ["REQ-T172-001"],
        testcaseAuthorityRefs: ["REQ-T172-001"],
        expectedBehavior: "hello world is exact"
      }
    ],
    testcaseAuthorityRows: [
      {
        kind: "sdlc_test_case_row",
        testCaseRef: testcaseIds[0] ?? "TC-T172-001",
        caseKind: "positive",
        executionLane: "integration",
        sourceDesignObligationRefs: ["REQ-T172-001"],
        testcaseAuthorityRefs: ["REQ-T172-001"],
        expectedBehavior: "hello world is exact"
      }
    ],
    testStackProfileRows: [
      {
        kind: "sdlc_test_stack_profile_row",
        stackRef: "stack://node",
        frameworkRef: "framework://node-test",
        buildTool: "node"
      }
    ],
    testModuleRows: [
      {
        kind: "sdlc_test_module_row",
        moduleName: "app-tests",
        moduleRef: "module://app-tests",
        testRoot: "test"
      }
    ],
    testComponentTopologyRows: [
      {
        kind: "sdlc_test_component_topology_row",
        testClassId: "HelloWorldSpec",
        relativePath: "test/hello.test.js",
        testcaseIds,
        componentIds: ["hello"],
        requirementIds: ["REQ-T172-001"],
        shardId: "shard-hello"
      }
    ],
    testDataBindings: [
      {
        kind: "sdlc_test_data_binding",
        testDataRef: "test-data://t172/hello",
        testCaseRef: testcaseIds[0] ?? "TC-T172-001",
        inputFixtureRefs: ["fixture://t172/none"],
        generationPolicyRef: "generation-policy://t172/static",
        expectedResultRef: "expected://t172/hello",
        sourceDesignObligationRefs: ["REQ-T172-001"]
      }
    ],
    expectedResultBindings: [
      {
        kind: "sdlc_expected_result_binding",
        expectedResultRef: "expected://t172/hello",
        testCaseRef: testcaseIds[0] ?? "TC-T172-001",
        assertionRefs: ["assertion://t172/hello"],
        expectedResultSummary: "hello world is exact",
        verificationPolicyRef: "verification-policy://t172/hello"
      }
    ],
    uatIntegrationBindings: [
      {
        kind: "sdlc_uat_integration_binding",
        uatTestCaseRef: testcaseIds[0] ?? "TC-T172-001",
        integrationTestCaseRef: testcaseIds[0] ?? "TC-T172-001",
        executionLane: "integration"
      }
    ],
    testExecutionScheduleRows: [
      {
        kind: "sdlc_test_execution_schedule_row",
        scheduleRef: "schedule://t172/hello",
        testCaseRefs: testcaseIds,
        command: "node --test test/hello.test.js",
        frameworkRef: "framework://node-test",
        shardId: "shard-hello"
      }
    ]
  };
}

function manifestForEdge(workspaceRoot, edgeName, runId, options = {}) {
  const contract = hookContractByEdgeName(edgeName);
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: options.graphFunctionName ?? edgeName,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId,
    retryContext: options.retryContext
  });
}

function writeFpEvaluatorDesignRegister(manifest, register) {
  const contentRegisterPath = path.join(
    manifest.archiveRoot,
    "design_depth_fp_evaluator_content_register.json"
  );
  const registerPath = path.join(
    manifest.archiveRoot,
    "design_depth_fp_evaluator_register.json"
  );
  const contentRegisterRef = pathToFileURL(contentRegisterPath).href;
  const registerRef = pathToFileURL(registerPath).href;
  const composition = {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: "abg.fn_composition://t172/fp-evaluate",
    compositionDigest: "digest://t172/fp-evaluate",
    compositionSelectionRef: "abg.fn_composition_selection://t172/fp-evaluate",
    selectedRegimeBindingRef:
      "abg.fn_composition.regime_binding://t172/evaluate/fp",
    graphFunctionRef: "Fg_t172",
    graphVectorRef: manifest.edgeName,
    basisRef: "basis://t172"
  };
  writeJsonFile(contentRegisterPath, {
    kind: "sdlc_evaluate_content_register",
    registerVersion: "ts-evaluate-content-register-v1",
    stage: "evaluate.C",
    ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    authorityFunction: "synthesize_model",
    selectedCompositionRef: composition.compositionRef,
    selectedCompositionDigest: composition.compositionDigest,
    selectedCompositionSelectionRef: composition.compositionSelectionRef,
    selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
    compositionContributionRef: composition.selectedRegimeBindingRef,
    sourceBasisRefs: [pathToFileURL(manifest.outputFile).href],
    candidateArtifactRefs: [pathToFileURL(manifest.outputFile).href],
    evidenceRefs: [pathToFileURL(manifest.outputFile).href],
    contentRows: [
      {
        kind: "sdlc_evaluate_content_register_row",
        rowRef: "evaluate-content-row://t172/design-depth-register",
        authorityFunction: "synthesize_model",
        carrierFamily: "ProductAssetModel",
        contentKind: "sdlc_design_depth_register",
        payload: register,
        sourceBasisRefs: [pathToFileURL(manifest.outputFile).href],
        evidenceRefs: [pathToFileURL(manifest.outputFile).href]
      }
    ]
  });
  writeJsonFile(registerPath, register);
  writeJsonFile(path.join(manifest.archiveRoot, "fp_evaluate_result.json"), {
    kind: "sdlc_fp_evaluate_result",
    stage: "F_P.evaluate",
    computeNotationStage: "evaluate.C",
    stageAuthority: "typed_fp_stage_carriers",
    selectedComposition: composition,
    compositionRef: composition.compositionRef,
    compositionDigest: composition.compositionDigest,
    compositionSelectionRef: composition.compositionSelectionRef,
    selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
    evaluationRef: "evaluation://t172/fp",
    findings: [
      {
        findingRef: "finding://t172/evaluate/design-depth-register",
        compositionRef: composition.compositionRef,
        compositionDigest: composition.compositionDigest,
          authorityRefs: [contentRegisterRef, registerRef],
          evidenceRefs: [contentRegisterRef, registerRef]
      }
    ],
    evaluation: {
      evaluationRef: "evaluation://t172/fp",
      status: "passed",
      findingRefs: ["finding://t172/evaluate/design-depth-register"]
    },
    status: "passed",
    postflightStatus: "passed",
    blockingReasons: [],
    evidenceRefs: [contentRegisterRef, registerRef]
  });
  const outcomePath = path.join(
    manifest.archiveRoot,
    "design_depth_fp_evaluator_rule_outcome.json"
  );
  writeJsonFile(outcomePath, {
    kind: "evaluation_rule_outcome",
    status: "accepted",
    ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    producedRegisterRefs: [contentRegisterRef, registerRef],
    evidenceRefs: [contentRegisterRef, registerRef],
    findingRefs: ["finding://t172/evaluate/design-depth-register"],
    humanResponseRefs: [],
    residualPressureRefs: [],
    continuationRefs: [],
    diagnosticRefs: [],
    selectedCompositionRef: composition.compositionRef,
    selectedCompositionDigest: composition.compositionDigest,
    selectedCompositionSelectionRef: composition.compositionSelectionRef,
    selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
    compositionContributionRef: composition.selectedRegimeBindingRef,
    reason: null
  });
  return {
    registerPath,
    evidenceRefs: [
      pathToFileURL(outcomePath).href,
      contentRegisterRef,
      registerRef,
      "finding://t172/evaluate/design-depth-register"
    ]
  };
}

function evaluateFpImplementationDesignPostflight({ manifest, report, register }) {
  const { evidenceRefs } = writeFpEvaluatorDesignRegister(manifest, register);
  return evaluateSdlcComputeStage({
    manifest,
    report,
    fpEvaluatorAdmissionEvidenceRefs: evidenceRefs
  });
}

function componentCodeManifestWithImplementationRegister({
  workspaceRoot,
  runId,
  register
}) {
  const graphFunctionName = "derive_component_code_surface";
  const priorRunId = "20260523T000000000Z_pid17201";
  const prior = manifestForEdge(
    workspaceRoot,
    "derive_implementation_design_surface",
    priorRunId,
    { graphFunctionName }
  );
  writeHandoffFiles(prior);
  mkdirSync(path.dirname(prior.outputFile), { recursive: true });
  writeFileSync(
    prior.outputFile,
    "# ADR-002 Implementation Design Surface\n\nF_P register sidecar owns topology.\n",
    "utf8"
  );
  writeFpEvaluatorDesignRegister(prior, register);
  const priorArchiveRef = pathToFileURL(prior.archiveRoot).href;
  return manifestForEdge(
    workspaceRoot,
    "derive_component_code_surface",
    runId,
    {
      graphFunctionName,
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [
          {
            vectorIndex: 0,
            retryRunId: priorRunId,
            retryCallId: `retry://t172/${runId}/implementation-design`,
            manifestId: priorArchiveRef,
            priorAuthorityRef: `module://app:${priorArchiveRef}`,
            attemptIndex: 0,
            sourceProjectionRef: `module://app:${priorArchiveRef}`
          }
        ],
        priorGapDossiers: []
      }
    }
  );
}

function materializedReport({ manifest, role, relativePath }) {
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  const outputContent = `# ${manifest.targetAssetType}\n\nREQ-T172-001\n`;
  writeFileSync(manifest.outputFile, outputContent, "utf8");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    relativePath
  );
  mkdirSync(path.dirname(productFile), { recursive: true });
  const requirementIds = manifest.traversalObligationContext.obligations
    .filter((obligation) => obligation.obligationKind === "requirement")
    .map((obligation) => obligation.obligationId);
  const productContent = [
    "// T-172 materialized product file",
    "REQ-T172-001",
    ...requirementIds
  ].join("\n");
  writeFileSync(productFile, `${productContent}\n`, "utf8");
  const productFileRef = `file://${productFile}`;
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: "file:///tmp/t172/fp_evaluate_result.json",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(outputContent),
    summary: "T-172 staged materialization postflight fixture",
    unresolvedReasons: [],
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role,
        relativePath,
        absolutePath: productFile,
        digest: sha256Text(`${productContent}\n`),
        byteCount: Buffer.byteLength(`${productContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ],
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: manifest.traversalObligationContext.obligations.map(
      (obligation) => ({
        kind: "sdlc_worker_obligation_assessment",
        obligationId: obligation.obligationId,
        fulfillmentStatus: "fulfilled",
        evidenceRefs: [productFileRef],
        blockingReasons: []
      })
    ),
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: "file:///tmp/t172/fp_evaluate_result.json"
  };
}

function surfaceReport({ manifest, outputContent }) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: "file:///tmp/t172/fp_evaluate_result.json",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(outputContent),
    summary: "T-172 staged authority producer postflight fixture",
    unresolvedReasons: [],
    materializedFiles: [],
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: manifest.traversalObligationContext.obligations.map(
      (obligation) => ({
        kind: "sdlc_worker_obligation_assessment",
        obligationId: obligation.obligationId,
        fulfillmentStatus: "fulfilled",
        evidenceRefs: [`file://${manifest.outputFile}`],
        blockingReasons: []
      })
    ),
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: "file:///tmp/t172/fp_evaluate_result.json"
  };
}

test("T-172 implementation-design carrier declares staged implementation authority output", () => {
  const row = targetCarrierRow("derive_implementation_design_surface");

  assert.equal(row.constructionDepthRole, "staged_authority_producer");
  assert.deepEqual(row.producedStagedAuthorityRefs, [
    "surface://implementation-decomposition-summary",
    "surface://module-dependency-map"
  ]);
  assert.deepEqual(row.requiredStagedAuthorityRefs, []);
});

test("T-172 component-code materialization requires admitted code-builder authority", () => {
  const row = targetCarrierRow("derive_component_code_surface");

  assert.equal(row.constructionDepthRole, "staged_materialization_consumer");
  assert.deepEqual(row.producedStagedAuthorityRefs, []);
  assert.deepEqual(row.requiredStagedAuthorityRefs, [
    "surface://tenant-stack-authority",
    "surface://testcase-authority",
    "surface://implementation-decomposition-summary",
    "surface://module-dependency-map"
  ]);
});

test("T-181 lite design/code edges carry staged implementation authority", () => {
  const designRow = targetCarrierRow("derive_lite_design_adr_surface");
  const componentRow = targetCarrierRow("derive_lite_component_code_surface");

  assert.equal(designRow.constructionDepthRole, "staged_authority_producer");
  assert.deepEqual(designRow.producedStagedAuthorityRefs, [
    "surface://implementation-decomposition-summary",
    "surface://module-dependency-map"
  ]);
  assert.deepEqual(designRow.requiredStagedAuthorityRefs, []);

  assert.equal(componentRow.constructionDepthRole, "staged_materialization_consumer");
  assert.deepEqual(componentRow.producedStagedAuthorityRefs, []);
  assert.deepEqual(componentRow.requiredStagedAuthorityRefs, [
    "surface://tenant-stack-authority",
    "surface://implementation-decomposition-summary",
    "surface://module-dependency-map"
  ]);
});

test("T-181 markdown implementation design no longer derives component topology authority", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const tenantRoot = path.join(workspaceRoot, "build_tenants/typescript");
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t181-markdown-design-not-authority"
    );
    mkdirSync(path.join(tenantRoot, "design/adrs"), { recursive: true });
    const outputContent =
      [
        "# ADR-002: Implementation Design Surface",
        "",
        "## Module Boundary",
        "",
        "| Module | Responsibility | Relative path | Depends on | Requirement refs |",
        "| --- | --- | --- | --- | --- |",
        "| `hello_branch` | Return exactly `hello`. | `src/hello.js` | None | `REQ-T172-001` |",
        "| `world_branch` | Return exactly `world`. | `src/world.js` | None | `REQ-T172-001` |",
        "| `composition` | Compose hello and world. | `src/index.js` | `hello_branch`, `world_branch` | `REQ-T172-001` |",
        "| `hello_branch_test` | Verify hello. | `test/hello.test.js` | `hello_branch` | `REQ-T172-001` |",
        "",
        "## Product File Targets",
        "",
        "| File target | Role | Owning module | Realization decision | Requirement refs |",
        "| --- | --- | --- | --- | --- |",
        "| `build_tenants/typescript/package.json` | `build_config` | `package_contract` | Declared package target. | `REQ-T172-001` |",
        "",
        "Additional source and test realization pressure is carried by the module boundary."
      ].join("\n");
    writeFileSync(
      manifest.outputFile,
      outputContent,
      "utf8"
    );
    const postflight = evaluateSdlcComputeStage({
      manifest,
      report: surfaceReport({ manifest, outputContent })
    });
    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.equal(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 test-design carrier declares test topology and stack authority output", () => {
  const row = targetCarrierRow("derive_test_design_surface");

  assert.equal(row.constructionDepthRole, "staged_authority_producer");
  assert.deepEqual(row.producedStagedAuthorityRefs, [
    "surface://test-stack-profile",
    "surface://test-decomposition-summary",
    "surface://test-dependency-map"
  ]);
  assert.deepEqual(row.requiredStagedAuthorityRefs, []);
});

test("T-172 component-test materialization requires full UAT code-builder authority", () => {
  const row = targetCarrierRow("derive_component_test_surface");

  assert.equal(row.constructionDepthRole, "staged_materialization_consumer");
  assert.deepEqual(row.producedStagedAuthorityRefs, []);
  assert.deepEqual(row.requiredStagedAuthorityRefs, [
    "surface://tenant-stack-authority",
    "surface://testcase-authority",
    "surface://implementation-decomposition-summary",
    "surface://module-dependency-map",
    "surface://test-stack-profile",
    "surface://test-decomposition-summary",
    "surface://test-dependency-map"
  ]);
});

test("T-172 projection rollups do not claim staged construction authority", () => {
  const row = targetCarrierRow("derive_code_surface");

  assert.equal(row.constructionDepthRole, "none");
  assert.deepEqual(row.producedStagedAuthorityRefs, []);
  assert.deepEqual(row.requiredStagedAuthorityRefs, []);
});

test("T-172 handoff projection carries staged authority refs into the worker package", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const contract = hookContractByEdgeName("derive_component_code_surface");
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot,
      graphFunctionName: "derive_component_code_surface",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: "t172-staged-handoff"
    });
    const invocationPackage = constructWorkerInvocationPackage({ manifest });
    const outcomeDirectives = invocationPackage.outcomeDirectives.join("\n");

    assert.equal(
      manifest.targetCarrierProjection.constructionDepthRole,
      "staged_materialization_consumer"
    );
    assert.deepEqual(
      manifest.targetCarrierProjection.requiredStagedAuthorityRefs,
      [
        "surface://tenant-stack-authority",
        "surface://testcase-authority",
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map"
      ]
    );
    assert.equal(
      invocationPackage.targetCarrierProjection.kind,
      "sdlc_worker_target_carrier_prompt_projection"
    );
    assert.equal(
      "constructionTemplate" in invocationPackage.targetCarrierProjection,
      false
    );
    assert.deepEqual(
      invocationPackage.targetCarrierProjection.requiredStagedAuthorityRefs,
      manifest.targetCarrierProjection.requiredStagedAuthorityRefs
    );
    assert.match(
      outcomeDirectives,
      /Required staged authority refs: surface:\/\/tenant-stack-authority, surface:\/\/testcase-authority, surface:\/\/implementation-decomposition-summary, surface:\/\/module-dependency-map\./u
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design prompt preserves proportional topology capacity", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const contract = hookContractByEdgeName("derive_implementation_design_surface");
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot,
      graphFunctionName: "derive_implementation_design_surface",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: "t172-implementation-design-prompt"
    });
    const files = writeHandoffFiles(manifest);
    const prompt = readFileSync(files.promptPath, "utf8");

    assert.match(
      prompt,
      /The evaluate\.C\/F_P design-depth evaluator populates the design-depth register/u
    );
    assert.match(prompt, /no component should own more than 8 requirement refs/u);
    assert.match(prompt, /Product File Targets section/u);
    assert.match(prompt, /requirement-lineage table/u);
    assert.doesNotMatch(prompt, /Emit a fenced `json design_depth_register` carrier/u);
    assert.match(
      prompt,
      /componentTopologyRows\[\]\.componentId\/moduleName\/relativePath\/publicBoundary\/concernRole/u
    );
    assert.doesNotMatch(prompt, /8 componentTopologyRows, 12 componentRealizationRows/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 trivial implementation-design prompt keeps single-file topology collapsed to one owned component", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const contract = hookContractByEdgeName("derive_implementation_design_surface");
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot,
      graphFunctionName: "derive_implementation_design_surface",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: "t172-trivial-implementation-design-prompt"
    });
    const files = writeHandoffFiles(manifest);
    const prompt = readFileSync(files.promptPath, "utf8");

    assert.match(prompt, /Trivial product profile is active/u);
    assert.match(prompt, /one implementation component topology row/u);
    assert.match(prompt, /Map build-config, source, runtime, and proof-subject requirement refs/u);
    assert.match(prompt, /One source file remains one component row/u);
    assert.doesNotMatch(prompt, /Emit a fenced `json design_depth_register` carrier/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 test-design prompt names closed test-case row fields", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const contract = hookContractByEdgeName("derive_test_design_surface");
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot,
      graphFunctionName: "derive_test_design_surface",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: "t172-test-design-prompt"
    });
    const files = writeHandoffFiles(manifest);
    const prompt = readFileSync(files.promptPath, "utf8");

    assert.match(
      prompt,
      /testCaseRef\/caseKind\/executionLane\/sourceDesignObligationRefs\/testcaseAuthorityRefs\/expectedBehavior for every sdlc_test_case_row/u
    );
    assert.match(prompt, /uatTestcaseRows and testcaseAuthorityRows/u);
    assert.match(
      prompt,
      /Do not wrap the fenced register in a target-carrier envelope/u
    );
    assert.match(
      prompt,
      /Use caseKind only for test-case class: positive, negative, boundary, integration, uat, regression/u
    );
    assert.match(
      prompt,
      /Do not use unit as caseKind; use positive, negative, boundary, integration, uat, or regression for caseKind and put unit only in executionLane/u
    );
    assert.match(
      prompt,
      /do not add target-carrier envelope fields such as edgeRef, contractRef, contractDigest, payload, summary, or evidenceRefs/u
    );
    assert.match(
      prompt,
      /testClassId\/relativePath\/testcaseIds\/componentIds\/requirementIds\/shardId for test topology/u
    );
    assert.match(
      prompt,
      /testDataRef\/testCaseRef\/inputFixtureRefs\/generationPolicyRef\/expectedResultRef\/sourceDesignObligationRefs for test data/u
    );
    assert.match(
      prompt,
      /expectedResultRef\/testCaseRef\/assertionRefs\/expectedResultSummary\/verificationPolicyRef for expected results/u
    );
    assert.match(
      prompt,
      /For testDataBindings and expectedResultBindings, testCaseRef is a single string/u
    );
    assert.match(prompt, /Do not put arrays in testCaseRef/u);
    assert.match(
      prompt,
      /Do not use legacy aliases such as caseId, componentRef, requirementRefs, scnRef, bindingId, or testcaseIds/u
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design producer consumes F_P evaluator register topology, not ADR parser output", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-implementation-design-derived-from-adr"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = implementationDesignAdr([
      componentTopologyRow({
        componentId: "hello",
        requirementIds: ["REQ-T172-001"]
      })
    ]);
    writeFileSync(
      manifest.outputFile,
      outputContent,
      "utf8"
    );
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateFpImplementationDesignPostflight({
      manifest,
      report,
      register: implementationDesignRegister([
        componentTopologyRow({
          componentId: "hello",
          requirementIds: ["REQ-T172-001"]
        })
      ])
    });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-180 implementation-design markdown file target parser is not live authority", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t180-role-file-product-target-table"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = [
      "# ADR-002 Implementation Design Surface",
      "",
      "## Product File Targets",
      "",
      "| role | file | expected behavior |",
      "|---|---|---|",
      "| source | `build_tenants/typescript/src/index.ts` | generated entry source |",
      "| test | `build_tenants/typescript/test/index.test.ts` | generated proof test |",
      "",
      "## Component Topology",
      "",
      "| component | relativePath | publicBoundary | requirementIds |",
      "|---|---|---|---|",
      "| entry | `src/index.ts` | emits exact output | `REQ-T172-001` |",
      "",
      "## Requirement Lineage",
      "",
      "| requirement id | component | source file |",
      "|---|---|---|",
      "| `REQ-T172-001` | entry | `src/index.ts` |",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");

    const postflight = evaluateSdlcComputeStage({
      manifest,
      report: surfaceReport({ manifest, outputContent })
    });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.equal(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design evaluator no longer derives Rust topology from ADR tables", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-rust-tenant-topology-derived-from-adr"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = [
      "# ADR-002 Implementation Design Surface",
      "",
      "## Decision",
      "",
      "The implementation uses a single Rust binary service.",
      "",
      "## Stack Profile",
      "",
      "| field | value |",
      "| ----- | ----- |",
      "| language | Rust |",
      "| build tool | cargo |",
      "",
      "## Module Boundary",
      "",
      "| module | public boundary | owns |",
      "| ------ | --------------- | ---- |",
      "| hello_world_rust_service | `cargo run` entry point; `GET /` responder | fixed response |",
      "",
      "## Component Topology",
      "",
      "| component | kind | depends on | exposes |",
      "| --------- | ---- | ---------- | ------- |",
      "| hello_world_rust_service | binary entry point | std::net | local HTTP socket |",
      "",
      "## Product File Targets",
      "",
      "| file_target_id | path | role | owning_component |",
      "| -------------- | ---- | ---- | ---------------- |",
      "| ft_cargo_manifest | build_tenants/hello_world_rust_service/Cargo.toml | build_config | cmp_hello_world_rust_service |",
      "| ft_main_rs | build_tenants/hello_world_rust_service/src/main.rs | source | cmp_hello_world_rust_service |",
      "",
      "## Requirement Lineage",
      "",
      "| requirement_id | obligation | owning_component | realization_locus |",
      "| -------------- | ---------- | ---------------- | ----------------- |",
      "| req_t164_rust_svc_001 | Cargo manifest exists | cmp_hello_world_rust_service | ft_cargo_manifest |",
      "| req_t164_rust_svc_002 | Rust source exists | cmp_hello_world_rust_service | ft_main_rs |",
      "| req_t164_rust_svc_003 | HTTP bind exists | cmp_hello_world_rust_service | ft_main_rs |",
      "| req_t164_rust_svc_005 | Live smoke proof | residual: test_design_surface / live HTTP smoke | cargo run + curl |",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.equal(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design evaluator no longer infers components from lineage prose columns", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-rust-lineage-prose-does-not-split-components"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = [
      "# ADR-002 Implementation Design Surface",
      "",
      "## Decision",
      "",
      "Use one implementation module and one implementation component: `hello_world_rust_service.binary`.",
      "",
      "## Module Boundary",
      "",
      "| Module | Component | Boundary | Requirement refs |",
      "| --- | --- | --- | --- |",
      "| `hello_world_rust_service` | `hello_world_rust_service.binary` | Owns the complete one-binary product boundary. | `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_001`; `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_002`; `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_003`; `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_004`; `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_005` |",
      "",
      "## Product File Targets",
      "",
      "| File target | Role | Owning component | Source of declaration |",
      "| --- | --- | --- | --- |",
      "| `build_tenants/hello_world_rust_service/Cargo.toml` | build_config | `hello_world_rust_service.binary` | `TECH_STACK.json` |",
      "| `build_tenants/hello_world_rust_service/src/main.rs` | source | `hello_world_rust_service.binary` | `bootstrap.md` |",
      "",
      "## Requirement Lineage",
      "",
      "| Obligation id | Requirement pressure | Owning design decision | Residual pressure |",
      "| --- | --- | --- | --- |",
      "| `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_001` | Provide one Cargo manifest at `build_tenants/hello_world_rust_service/Cargo.toml`. | Treat `Cargo.toml` as build configuration for `hello_world_rust_service.binary`. | Materialization must create the manifest. |",
      "| `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_002` | Provide one Rust executable source at `build_tenants/hello_world_rust_service/src/main.rs`. | Treat `src/main.rs` as the only source realization for `hello_world_rust_service.binary`. | Materialization must create the source file. |",
      "| `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_003` | Start an HTTP server bound to `127.0.0.1` using `HELLO_SERVICE_PORT`. | Assign bind address and port lookup to `hello_world_rust_service.binary`. | Runtime proof must verify live binding. |",
      "| `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_004` | Respond to `GET /` with exactly `helloworld`. | Assign root route and response behavior to `hello_world_rust_service.binary`. | Runtime proof must verify exact body. |",
      "| `requirement:t164_rust_hello_service_lite.bootstrap.req_t164_rust_svc_005` | Prove the service by starting it through Cargo and verifying `GET /`. | Keep the proof subject on the same single component. | Test/proof edge must execute Cargo and `curl`. |",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.equal(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design evaluator does not admit combined topology-lineage markdown as authority", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-combined-topology-lineage-table"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = [
      "# ADR-002 Implementation Design Surface",
      "",
      "## Decision",
      "",
      "Use explicit component rows for bounded ownership.",
      "",
      "## Module Boundary",
      "",
      "| Module | Public Boundary | Depends On |",
      "| --- | --- | --- |",
      "| `compiler` | `Compiler.compile` | none |",
      "| `executor` | `Executor.run` | `compiler` |",
      "",
      "## Component Topology And Requirement Lineage",
      "",
      "| Component Ref | Module | Responsibility | Requirement Refs |",
      "| --- | --- | --- | --- |",
      "| `component://compiler.topology` | `compiler` | Compile topology and plans. | `REQ-T172-COMB-001`, `REQ-T172-COMB-002`, `REQ-T172-COMB-003`, `REQ-T172-COMB-004`, `REQ-T172-COMB-005` |",
      "| `component://executor.runtime` | `executor` | Execute admitted plans. | `REQ-T172-COMB-006`, `REQ-T172-COMB-007`, `REQ-T172-COMB-008`, `REQ-T172-COMB-009`, `REQ-T172-COMB-010` |",
      "",
      "## Component Realization Targets",
      "",
      "| Component Ref | Later Source Target | Realization Notes |",
      "| --- | --- | --- |",
      "| `component://compiler.topology` | `build_tenants/app/compiler/src/main.scala` | Compiler source package. |",
      "| `component://executor.runtime` | `build_tenants/app/executor/src/main.scala` | Executor source package. |",
      "",
      "## Product File Targets",
      "",
      "| Target | Role | Later Edge |",
      "| --- | --- | --- |",
      "| `build_tenants/app/build.sbt` | build_config | materialization |",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.deepEqual(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 implementation-design evaluator does not derive multi-component topology from ADR subsections", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-multi-component-adr-subsection-lineage"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const outputContent = [
      "# ADR-002 Implementation Design Surface",
      "",
      "## Decision",
      "",
      "The implementation keeps branch source and fan-in composition as separate components.",
      "",
      "## Module Boundary",
      "",
      "| Module ref | Public boundary | Owned responsibility |",
      "| ---------- | --------------- | -------------------- |",
      "| `package_manifest` | Node.js package descriptor | declare package identity |",
      "| `hello_branch` | exported hello function | return hello |",
      "| `world_branch` | exported world function | return world |",
      "| `composition` | exported composed phrase function | join branch outputs |",
      "",
      "## Component Topology",
      "",
      "| Edge (source → target) | Edge kind |",
      "| ---------------------- | --------- |",
      "| `hello_branch` → `composition` | import |",
      "| `world_branch` → `composition` | import |",
      "",
      "## Component Realization",
      "",
      "| Component ref | Realization kind | Output path | Public symbol shape | Imports |",
      "| ------------- | ---------------- | ----------- | ------------------- | ------- |",
      "| `package_manifest` | JSON manifest | `build_tenants/app/package.json` | package identity | none |",
      "| `hello_branch` | CommonJS source | `build_tenants/app/src/hello.js` | zero-arg hello function | none |",
      "| `world_branch` | CommonJS source | `build_tenants/app/src/world.js` | zero-arg world function | none |",
      "| `composition` | CommonJS source | `build_tenants/app/src/index.js` | composed phrase function | `./hello`, `./world` |",
      "",
      "## Product File Targets",
      "",
      "| File target ref | Role | Output path | Owning component |",
      "| --------------- | ---- | ----------- | ---------------- |",
      "| `file:pkg` | manifest | `build_tenants/app/package.json` | `package_manifest` |",
      "| `file:hello` | source | `build_tenants/app/src/hello.js` | `hello_branch` |",
      "| `file:world` | source | `build_tenants/app/src/world.js` | `world_branch` |",
      "| `file:composition` | source | `build_tenants/app/src/index.js` | `composition` |",
      "",
      "## Requirement Lineage",
      "",
      "### Requirement Lineage — `package_manifest`",
      "",
      "- Owned requirement refs:",
      "  - `REQ-T172-SUB-001`",
      "",
      "### Requirement Lineage — `hello_branch`",
      "",
      "- Owned requirement refs:",
      "  - `REQ-T172-SUB-002`",
      "",
      "### Requirement Lineage — `world_branch`",
      "",
      "- Owned requirement refs:",
      "  - `REQ-T172-SUB-003`",
      "",
      "### Requirement Lineage — `composition`",
      "",
      "- Owned requirement refs:",
      "  - `REQ-T172-SUB-004`",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });
    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
    assert.equal(
      existsSync(
        path.join(manifest.archiveRoot, "design_depth_evaluator_derived_register.json")
      ),
      false
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});
test("T-172 trivial implementation-design producer admits single-component topology with bounded requirements", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_implementation_design_surface",
      "t172-trivial-implementation-design-admitted"
    );
    const register = implementationDesignRegister([
        componentTopologyRow({
          componentId: "hello",
          requirementIds: ["REQ-T172-001", "REQ-T172-002"]
        })
      ]);
    const outputContent = writeJsonFile(manifest.outputFile, register);
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateFpImplementationDesignPostflight({
      manifest,
      report,
      register
    });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});
test("T-172 trivial test-design producer admits UAT/integration dual-hop over one requirement", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_test_design_surface",
      "t172-trivial-test-design-dual-hop-admitted"
    );
    const outputContent = writeJsonFile(
      manifest.outputFile,
      testDesignRegister(["TC-T172-UAT", "TC-T172-INTEGRATION"])
    );
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 trivial test-design producer admits explicit single-row topology", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_test_design_surface",
      "t172-trivial-test-design-admitted"
    );
    const outputContent = writeJsonFile(
      manifest.outputFile,
      testDesignRegister(["TC-T172-001"])
    );
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 test-design admission reads fenced markdown register", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_test_design_surface",
      "t172-test-design-fenced-markdown-admitted"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const register = testDesignRegister(["TC-T172-FENCED"]);
    const outputContent = [
      "# ADR-003 Test Design Surface",
      "",
      "```json test_design_register",
      JSON.stringify(register, null, 2),
      "```",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(
      postflight.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 test-design null typed string blocks postflight", () => {
  const workspaceRoot = makeWorkspace({ trivialProduct: true });
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_test_design_surface",
      "t172-test-design-null-string-blocks"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const register = testDesignRegister(["TC-T172-NULL-GENERATION-POLICY"]);
    register.testDataBindings[0].generationPolicyRef = null;
    const outputContent = [
      "# ADR-003 Test Design Surface",
      "",
      "```json test_design_register",
      JSON.stringify(register, null, 2),
      "```",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(postflight.status, "blocked");
    assert(
      postflight.blockingReasonCarriers.some(
        (reason) =>
          reason.code === "staged_authority_admission_invalid" &&
          reason.detail.includes("generationPolicyRef: expected string")
      ),
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 test-design admission rejects common semantic carrier aliases", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForEdge(
      workspaceRoot,
      "derive_test_design_surface",
      "t172-test-design-alias-normalization"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const registerPayload = {
      kind: "sdlc_test_design_register",
      registerVersion: "ts-test-design-v1",
      targetAssetType: "test_design_surface",
      tenantRoot: "build_tenants/app",
      designConsumptionRows: [
        {
          kind: "sdlc_design_consumption_contract",
          contractRef: "design-consumption://t172/test",
          sourceDesignObligationRefs: ["REQ-T172-ALIAS-001"],
          authorityBasisRefs: ["asset://implementation-design"],
          consumerGraphFunctionRefs: ["graph_function://odd_sdlc/derive_component_test_surface"]
        }
      ],
      uatTestcaseRows: [
        {
          kind: "sdlc_test_case_row",
          testCaseId: "testcase:t172.alias.uat",
          caseKind: "uat",
          executionLane: "terminal_fan_in",
          requirementIds: ["REQ-T172-ALIAS-001"],
          scenarioRefs: ["scenario:t172.alias.uat"],
          expectedBehavior: "the composed live proof passes"
        }
      ],
      testcaseAuthorityRows: [
        {
          kind: "sdlc_test_case_row",
          testCaseId: "testcase:t172.alias.unit",
          caseKind: "unit",
          executionLane: "branch_unit",
          requirementIds: ["REQ-T172-ALIAS-001"],
          scenarioRefs: ["scenario:t172.alias.unit"],
          expectedBehavior: "the branch unit proof passes"
        }
      ],
      testStackProfileRows: [
        {
          kind: "sdlc_test_stack_profile_row",
          stackProfileRef: "surface://test-stack-profile",
          runtime: "node",
          testRunner: "node:test"
        }
      ],
      testModuleRows: [
        {
          kind: "sdlc_test_module_row",
          testModuleKey: "hello_branch_test",
          relativePath: "test/hello.test.js"
        }
      ],
      testComponentTopologyRows: [
        {
          kind: "sdlc_test_component_topology_row",
          testClassId: "test_class:t172.alias.hello",
          relativePath: "test/hello.test.js",
          testcaseIds: ["testcase:t172.alias.unit"],
          componentIds: ["component:t172.alias.hello"]
        }
      ],
      testDataBindings: [
        {
          kind: "sdlc_test_data_binding",
          testCaseId: "testcase:t172.alias.unit",
          inputFixtureRefs: ["fixture://empty"],
          generationPolicyRef: "policy://odd-sdlc/test-data/literal-only"
        }
      ],
      expectedResultBindings: [
        {
          kind: "sdlc_expected_result_binding",
          testCaseId: "testcase:t172.alias.unit",
          assertionRefs: ["assertion://strict-equal"],
          expectedResultSummary: "unit result passes",
          verificationPolicyRef: "policy://odd-sdlc/expected-result/strict"
        }
      ],
      uatIntegrationBindings: [
        {
          kind: "sdlc_uat_integration_binding",
          uatTestCaseRef: "testcase:t172.alias.uat",
          integrationTestCaseRef: "testcase:t172.alias.unit"
        }
      ],
      testExecutionScheduleRows: [
        {
          kind: "sdlc_test_execution_schedule_row",
          scheduleRef: "schedule:t172.alias",
          testCaseRefs: ["testcase:t172.alias.unit", "testcase:t172.alias.uat"],
          command: "node --test test/hello.test.js",
          frameworkRef: "framework://node-test"
        }
      ]
    };
    const outputContent = [
      "# ADR-003 Test Design Surface",
      "",
      "```json test_design_register",
      JSON.stringify({
        kind: "sdlc_test_design_surface_target_carrier",
        payload: registerPayload
      }, null, 2),
      "```",
      ""
    ].join("\n");
    writeFileSync(manifest.outputFile, outputContent, "utf8");
    const report = surfaceReport({ manifest, outputContent });

    const postflight = evaluateSdlcComputeStage({ manifest, report });

    assert.equal(postflight.status, "blocked");
    assert(
      postflight.blockingReasonCarriers.some(
        (reason) =>
          reason.code === "staged_authority_admission_invalid" &&
          reason.detail.startsWith("test_design_register_invalid:")
      ),
      JSON.stringify(postflight.blockingReasonCarriers, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});
