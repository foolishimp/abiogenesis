// Validates: T-151

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { emit } from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  constructSdlcGtlModule,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcWorkspaceIngressReport,
  executeInstalledOperatorStart,
  materializeSdlcProjectConformance,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce
} from "../../build/semantic/code/src/index.js";

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function writeImplementationDesignAuthority(workspaceRoot) {
  const outputFile = path.join(
    workspaceRoot,
    "build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
  );
  const requirementIds = ["REQ-T151-001"];
  const sourceRelative = "src/main/scala/generated/Core.scala";
  const axis = (name) => ({
    kind: "sdlc_design_completeness_axis_verdict",
    axis: name,
    status: "satisfied",
    reasons: [],
    evidenceRefs: [`file://${outputFile}`]
  });
  const attribute = {
    kind: "sdlc_domain_attribute",
    attributeId: "attr:t151.core.value",
    name: "value",
    valueType: "string",
    cardinality: "one",
    invariantRefs: requirementIds
  };
  const entity = {
    kind: "sdlc_domain_entity",
    entityId: "entity:t151.core",
    moduleName: "generated",
    ownership: "owned",
    attributes: [attribute],
    invariants: ["core value is transformed"],
    sourceAssetRefs: ["fixture://t151"]
  };
  const operation = {
    kind: "sdlc_domain_operation",
    operationId: "operation:t151.transform",
    moduleName: "generated",
    inputEntityIds: [entity.entityId],
    outputEntityIds: [entity.entityId],
    requiredAttributeIds: [attribute.attributeId]
  };
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(
    outputFile,
    `${JSON.stringify(
      {
        kind: "sdlc_design_depth_register",
        registerVersion: "ts-design-depth-v1",
        targetAssetType: "implementation_design_surface",
        stackProfileRows: [
          {
            kind: "sdlc_stack_profile_row",
            stackRef: "stack://t151/scala-sbt",
            language: "scala",
            buildTool: "sbt"
          }
        ],
        implementationModuleRows: [
          {
            kind: "sdlc_implementation_module_row",
            moduleName: "generated",
            moduleRef: "module://t151/generated"
          }
        ],
        aggregateDomainModelRows: [
          {
            kind: "sdlc_aggregate_domain_model_row",
            modelRef: "model://t151/generated"
          }
        ],
        moduleSchemaFragments: [
          {
            kind: "sdlc_module_schema_fragment",
            moduleName: "generated",
            entities: [entity],
            operations: [operation],
            requirementIds,
            sourceAssetRefs: ["fixture://t151"]
          }
        ],
        moduleStateDiagramFragments: [],
        aggregateDomainModel: {
          kind: "sdlc_aggregate_domain_model",
          modelVersion: "ts-design-depth-v1",
          entities: [
            {
              kind: "sdlc_aggregate_domain_entity",
              entityId: entity.entityId,
              ownerModuleName: "generated",
              attributes: [attribute],
              sourceModuleNames: ["generated"]
            }
          ],
          operations: [operation],
          crossModuleReferences: [],
          evidenceRefs: [`file://${outputFile}`]
        },
        sunnyDaySequenceRows: [],
        aggregateSunnyDaySequence: null,
        componentTopologyRows: [
          {
            kind: "sdlc_component_topology_row",
            componentId: "generated-core",
            moduleName: "generated",
            relativePath: sourceRelative,
            publicBoundary: "generated.Core",
            concernRole: "other",
            requirementIds,
            sourceAssetRefs: ["fixture://t151"]
          }
        ],
        componentRealizationRows: [],
        fileTargetRows: [],
        designCompletenessVerdict: {
          kind: "sdlc_design_completeness_verdict",
          verdictVersion: "ts-design-depth-v1",
          entity: axis("entity"),
          attribute: axis("attribute"),
          flow: axis("flow")
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const archiveRoot = path.join(
    workspaceRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260512T000151000Z_pid151"
  );
  mkdirSync(archiveRoot, { recursive: true });
  const registerPath = path.join(archiveRoot, "design_depth_fp_evaluator_register.json");
  const contentRegisterPath = path.join(
    archiveRoot,
    "design_depth_fp_evaluator_content_register.json"
  );
  const ruleOutcomePath = path.join(
    archiveRoot,
    "design_depth_fp_evaluator_rule_outcome.json"
  );
  const registerRef = pathToFileURL(registerPath).href;
  const contentRegisterRef = pathToFileURL(contentRegisterPath).href;
  const ruleOutcomeRef = pathToFileURL(ruleOutcomePath).href;
  const fpEvaluateResultPath = path.join(archiveRoot, "fp_evaluate_result.json");
  const composition = {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: "abg.fn_composition://t151/implementation-design",
    compositionDigest: "digest://t151/implementation-design",
    compositionSelectionRef:
      "abg.fn_composition_selection://t151/implementation-design",
    selectedRegimeBindingRef:
      "abg.fn_composition.regime_binding://t151/implementation-design/evaluate/fp",
    graphFunctionRef: "derive_implementation_design_surface",
    graphVectorRef: "derive_implementation_design_surface",
    basisRef: "basis://t151/implementation-design"
  };
  const sidecarRegister = {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t151/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "generated",
        moduleRef: "module://t151/generated"
      }
    ],
    aggregateDomainModelRows: [],
    moduleSchemaFragments: [],
    moduleStateDiagramFragments: [],
    aggregateDomainModel: null,
    sunnyDaySequenceRows: [],
    aggregateSunnyDaySequence: null,
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "generated-core",
        moduleName: "generated",
        relativePath: sourceRelative,
        publicBoundary: "generated.Core",
        concernRole: "other",
        requirementIds,
        sourceAssetRefs: [registerRef]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "generated-core",
        moduleName: "generated",
        relativePath: sourceRelative,
        publicBoundary: "generated.Core",
        trancheId: null,
        firstProductFileToChange: sourceRelative,
        upstreamComponentIds: [],
        requirementIds,
        sourceAssetRefs: [registerRef]
      }
    ],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: sourceRelative,
        role: "source"
      }
    ],
    designCompletenessVerdict: null
  };
  writeFileSync(registerPath, `${JSON.stringify(sidecarRegister, null, 2)}\n`, "utf8");
  writeFileSync(
    contentRegisterPath,
    `${JSON.stringify(
      {
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
        sourceBasisRefs: [pathToFileURL(outputFile).href],
        candidateArtifactRefs: [pathToFileURL(outputFile).href],
        evidenceRefs: [pathToFileURL(outputFile).href],
        contentRows: [
          {
            kind: "sdlc_evaluate_content_register_row",
            rowRef: "evaluate-content-row://t151/design-depth-register",
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register",
            payload: sidecarRegister,
            sourceBasisRefs: [pathToFileURL(outputFile).href],
            evidenceRefs: [pathToFileURL(outputFile).href]
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    ruleOutcomePath,
    `${JSON.stringify(
      {
        kind: "evaluation_rule_outcome",
        status: "accepted",
        ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        producedRegisterRefs: [contentRegisterRef, registerRef],
        evidenceRefs: [contentRegisterRef, registerRef],
        findingRefs: ["finding://t151/implementation-design/depth-register"],
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
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "handoff_manifest.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_worker_handoff_manifest",
        contractVersion: "synthetic-v1",
        workspaceRoot,
        archiveRoot,
        graphFunctionName: "derive_implementation_design_surface",
        edgeName: "derive_implementation_design_surface",
        vectorIndex: 0,
        inputAssetTypes: ["scenario_surface"],
        targetAssetType: "implementation_design_surface",
        outputFile,
        reportFile: path.join(archiveRoot, "worker_result_report.json"),
        productMaterialization: {
          tenantRoot: path.join(workspaceRoot, "build_tenants/scala_spark")
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    fpEvaluateResultPath,
    `${JSON.stringify(
      {
        kind: "sdlc_fp_evaluate_result",
        stage: "F_P.evaluate",
        computeNotationStage: "evaluate.C",
        stageAuthority: "typed_fp_stage_carriers",
        selectedComposition: composition,
        compositionRef: composition.compositionRef,
        compositionDigest: composition.compositionDigest,
        compositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        evaluationRef: "evaluation://t151/implementation-design",
        findings: [
          {
            findingRef: "finding://t151/implementation-design/depth-register",
            compositionRef: composition.compositionRef,
            compositionDigest: composition.compositionDigest,
            authorityRefs: [contentRegisterRef, registerRef],
            evidenceRefs: [contentRegisterRef, registerRef]
          }
        ],
        evaluation: {
          evaluationRef: "evaluation://t151/implementation-design",
          status: "passed",
          findingRefs: ["finding://t151/implementation-design/depth-register"]
        },
        status: "passed",
        postflightStatus: "passed",
        blockingReasons: [],
        evidenceRefs: [contentRegisterRef, registerRef, ruleOutcomeRef]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "worker_result_report.json"),
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(fpEvaluateResultPath).href,
        graphFunctionName: "derive_implementation_design_surface",
        edgeName: "derive_implementation_design_surface",
        targetAssetType: "implementation_design_surface",
        outputFile,
        digest: "sha256:t151-implementation-design",
        summary: "admitted F_P design-depth predecessor",
        unresolvedReasons: [],
        materializedFiles: [],
        materializationDiagnostics: [],
        executionEvidence: null,
        executionEvidenceErrors: [],
        obligationAssessments: [],
        fpTransformRequestRef: null,
        fpTransformResultRef: null,
        fpTransformStatusSnapshot: null,
        fpEvaluateResultRef: pathToFileURL(fpEvaluateResultPath).href
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function writeTestDesignAuthority(workspaceRoot) {
  const outputFile = path.join(
    workspaceRoot,
    "build_tenants/scala_spark/design/adrs/ADR-003-test-design-surface.md"
  );
  const requirementRef =
    "requirement:t151_runner_sovereignty.stage_01_fixture.req_t151_001";
  const register = {
    kind: "sdlc_test_design_register",
    registerVersion: "ts-test-design-v1",
    targetAssetType: "test_design_surface",
    designConsumptionRows: [
      {
        kind: "sdlc_design_consumption_contract",
        contractRef: "design-consumption://t151/component-test",
        sourceDesignObligationRefs: [requirementRef],
        authorityBasisRefs: ["asset://implementation-design"],
        consumerGraphFunctionRefs: ["derive_component_test_surface"]
      }
    ],
    uatTestcaseRows: [
      {
        kind: "sdlc_test_case_row",
        testCaseRef: "UAT-T151-001",
        caseKind: "uat",
        executionLane: "uat",
        sourceDesignObligationRefs: [requirementRef],
        testcaseAuthorityRefs: [requirementRef],
        expectedBehavior: "user accepts transformed core value"
      }
    ],
    testcaseAuthorityRows: [
      {
        kind: "sdlc_test_case_row",
        testCaseRef: "TC-T151-001",
        caseKind: "positive",
        executionLane: "integration",
        sourceDesignObligationRefs: [requirementRef],
        testcaseAuthorityRefs: [requirementRef],
        expectedBehavior: "core value is transformed"
      }
    ],
    testStackProfileRows: [
      {
        kind: "sdlc_test_stack_profile_row",
        stackRef: "stack://t151/scala-sbt-test",
        frameworkRef: "framework://scala-test",
        buildTool: "sbt"
      }
    ],
    testModuleRows: [
      {
        kind: "sdlc_test_module_row",
        moduleName: "generated-tests",
        moduleRef: "module://t151/generated-tests",
        testRoot: "src/test/scala"
      }
    ],
    testComponentTopologyRows: [
      {
        kind: "sdlc_test_component_topology_row",
        testClassId: "CoreSpec",
        relativePath: "src/test/scala/generated/CoreSpec.scala",
        testcaseIds: ["TC-T151-001"],
        componentIds: ["generated-core"],
        requirementIds: [requirementRef],
        shardId: "unit"
      }
    ],
    testDataBindings: [
      {
        kind: "sdlc_test_data_binding",
        testDataRef: "test-data://t151/core",
        testCaseRef: "TC-T151-001",
        inputFixtureRefs: ["fixture://t151/none"],
        generationPolicyRef: "generation-policy://t151/static",
        expectedResultRef: "expected://t151/core",
        sourceDesignObligationRefs: [requirementRef]
      }
    ],
    expectedResultBindings: [
      {
        kind: "sdlc_expected_result_binding",
        expectedResultRef: "expected://t151/core",
        testCaseRef: "TC-T151-001",
        assertionRefs: ["assertion://t151/core"],
        expectedResultSummary: "core value is transformed",
        verificationPolicyRef: "verification-policy://t151/core"
      }
    ],
    uatIntegrationBindings: [
      {
        kind: "sdlc_uat_integration_binding",
        uatTestCaseRef: "UAT-T151-001",
        integrationTestCaseRef: "TC-T151-001",
        executionLane: "integration"
      }
    ],
    testExecutionScheduleRows: [
      {
        kind: "sdlc_test_execution_schedule_row",
        scheduleRef: "schedule://t151/core",
        testCaseRefs: ["TC-T151-001"],
        command: "sbt test",
        frameworkRef: "framework://scala-test",
        shardId: "unit"
      }
    ]
  };
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(
    outputFile,
    [
      "# ADR-003 Test Design Surface",
      "",
      "```json test_design_register",
      JSON.stringify(register, null, 2),
      "```",
      ""
    ].join("\n"),
    "utf8"
  );
}

function makeWorkspace(options = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t151-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-151 Fixture", "", "Build a governed Scala product realization."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Create a typed downstream implementation."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T151-001: Runner first-traversal returns admitted non-close truth."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t151_runner_sovereignty",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  mkdirSync(path.join(root, "build_tenants/scala_spark/spec"), {
    recursive: true
  });
  writeFileSync(
    path.join(root, "build_tenants/scala_spark/spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "Scala",
        buildTool: "sbt"
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  writeImplementationDesignAuthority(root);
  if (options.testDesignAuthority === true) {
    writeTestDesignAuthority(root);
  }
  return root;
}

function makeUnderstructuredConformWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t151-conform-"));
  mkdirSync(path.join(root, "specification/appendices"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-151 Conformance Fixture", "", "Build a governed product realization."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "INT-T151-001: Produce a governed realization."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    ["# Requirements", "", "REQ-T151-LOOP-001: Preserve loop event projection."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/appendices/APPENDIX_A.md"),
    "# Appendix\n\nAdditional project context.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t151_loop_projection",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt"
    ].join("\n"),
    "utf8"
  );
  return root;
}

function makeStart(workspaceRoot, targetHandle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t151",
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: []
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject =
    deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot);
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: {
        kind: "graph_function",
        handle: targetHandle
      },
      until: "first_traversal",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "process://node"
    })
  });
  assert.equal(start.kind, "sdlc_public_start_projected");
  return start;
}

function makeConformStart(workspaceRoot) {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t151",
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: []
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject =
    deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot);
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: {
        kind: "graph_function",
        handle: "Fg_conform_project"
      },
      until: "converged",
      defaultRegime: "F_D"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: null
    })
  });
  assert.equal(start.kind, "sdlc_public_start_projected");
  return start;
}

function assessedEventForVector(basis, vector, index) {
  return {
    kind: "assessed",
    assessmentKind: "fp",
    edge: vector.name,
    obligationId: `t151-preclosed-${index}`,
    publishedLedgerRef: `proof://t151/preclosed/${index}`,
    actor: "test",
    specHash: `sha256:t151preclosed${index}`,
    manifestId: `manifest:t151:preclosed:${index}`,
    workflowVersion: "t151-preclosed",
    runId: basis.runId,
    workKey: basis.workKey,
    selectedWorkerId: null,
    selectedBackend: null,
    roleId: null,
    authorityRef: null,
    assignmentSource: null,
    resolvedRuntimeRef: null
  };
}

function vectorClosedEventForVector(basis, vector, index) {
  return {
    kind: "vector_closed",
    basisId: basis.id,
    graphCallId: `graph-call:${basis.id}`,
    frameId: `frame:${basis.id}:root`,
    vectorIndex: index,
    edge: vector.name,
    closureKind: "advanced"
  };
}

function preclosedEventsBeforeEdge(basis, edgeName) {
  const targetIndex = basis.graph.vectors.findIndex(
    (vector) => vector.name === edgeName
  );
  assert.notEqual(targetIndex, -1, `${edgeName} vector must exist`);
  const preclosedEvents = basis.graph.vectors
    .slice(0, targetIndex)
    .flatMap((vector, index) => [
      assessedEventForVector(basis, vector, index),
      vectorClosedEventForVector(basis, vector, index)
    ]);
  const emitted = [];
  emit(preclosedEvents, (event) => {
    emitted.push(event);
  });
  return Object.freeze(emitted);
}

function writeUnassessedObligationWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t151_unassessed_obligation_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({",
      "    kind: 'sdlc_review_grade_obligation_finding',",
      "    obligationId: obligation.obligationId,",
      "    fulfillmentStatus: 'partial',",
      "    failureClass: 'semantic_not_realized',",
      "    requiredAction: 'retry the current edge with selected review-grade pressure',",
      "    evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)],",
      "    acceptedAuthorityRefs: [outputRef, reportRef],",
      "    fulfillmentBinding: null,",
      "    rationale: 'synthetic evaluator emits accepted review-grade pressure so the test isolates first non-close consequence return'",
      "  }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'blocked', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade assessment blocks for first non-close consequence test' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const output = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`].join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const tenantRelative = 'src/main/scala/generated/Core.scala';",
      "const sourcePath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "mkdirSync(dirname(sourcePath), { recursive: true });",
      "const source = 'package generated\\nobject Core { def transform(value: String): String = value.reverse + value.length.toString }\\n';",
      "writeFileSync(sourcePath, source, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "const materializedFiles = [{ kind: 'sdlc_materialized_product_file', role: 'source', relativePath: tenantRelative, absolutePath: sourcePath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8') }];",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated source without traversal obligation assessments', unresolvedReasons: [], materializedFiles, executionEvidence: null }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeTraceMissingComponentTestWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t151_component_test_trace_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({",
      "    kind: 'sdlc_review_grade_obligation_finding',",
      "    obligationId: obligation.obligationId,",
      "    fulfillmentStatus: 'blocked',",
      "    failureClass: 'trace_missing',",
      "    requiredAction: 'repair component_test_surface lineage before advancing',",
      "    evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)],",
      "    acceptedAuthorityRefs: [outputRef, reportRef],",
      "    fulfillmentBinding: null,",
      "    rationale: 'synthetic component-test evaluator reproduces trace_missing pressure from live data_mapper depth run'",
      "  }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'blocked', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade trace_missing pressure for component tests' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const testRelative = 'src/test/scala/generated/CoreSpec.scala';",
      "const testPath = path.join(manifest.productMaterialization.tenantRoot, testRelative);",
      "mkdirSync(dirname(testPath), { recursive: true });",
      "const testSource = '// requirement:REQ-T151-001\\npackage generated\\nclass CoreSpec\\n';",
      "writeFileSync(testPath, testSource, 'utf8');",
      "const register = {",
      "  kind: 'sdlc_component_depth_register',",
      "  registerVersion: 'ts-component-depth-v1',",
      "  targetAssetType: 'component_test_surface',",
      "  componentTopologyRows: [],",
      "  componentRealizationRows: [],",
      "  testComponentTopologyRows: [],",
      "  componentTestRows: [{ kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-T151-001'], componentIds: ['generated-core'], requirementIds: ['REQ-T151-001'], shardId: 'unit' }],",
      "  componentTestQualificationRows: [],",
      "  componentExecutionFailureRegister: null,",
      "  componentRepairSchedule: null,",
      "  releaseDepthParity: null",
      "};",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${JSON.stringify(register, null, 2)}\\n`, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(JSON.stringify(register), 'utf8').digest('hex')}`;",
      "const testDigest = `sha256:${createHash('sha256').update(testSource, 'utf8').digest('hex')}`;",
      "const outputRef = pathToFileURL(manifest.outputFile).href;",
      "const materializedFiles = [{ kind: 'sdlc_materialized_product_file', role: 'test', relativePath: testRelative, absolutePath: testPath, digest: testDigest, byteCount: Buffer.byteLength(testSource, 'utf8') }];",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...obligation.evidenceRefs.slice(0, 2)], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated component tests with insufficient review-grade trace bindings', unresolvedReasons: [], materializedFiles, materializationDiagnostics: [], executionEvidence: null, executionEvidenceErrors: [], obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeWrongStageTestDesignWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t151_test_design_wrong_stage_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const outputRef = pathToFileURL(manifest.outputFile).href;",
      "const reportRef = pathToFileURL(manifest.reportFile).href;",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId.startsWith('requirement:') ? ({",
      "    kind: 'sdlc_review_grade_obligation_finding',",
      "    obligationId: obligation.obligationId,",
      "    fulfillmentStatus: 'partial',",
      "    failureClass: 'wrong_stage',",
      "    requiredAction: 'Carry this requirement to component_test_surface downstream; test-design may only declare topology and schedule authority.',",
      "    evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)],",
      "    acceptedAuthorityRefs: [outputRef, reportRef],",
      "    fulfillmentBinding: null,",
      "    rationale: 'synthetic lawful downstream carryover for test-design planning surface'",
      "  }) : ({",
      "    kind: 'sdlc_review_grade_obligation_finding',",
      "    obligationId: obligation.obligationId,",
      "    fulfillmentStatus: 'fulfilled',",
      "    failureClass: null,",
      "    requiredAction: null,",
      "    evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)],",
      "    acceptedAuthorityRefs: [outputRef, reportRef],",
      "    fulfillmentBinding: { kind: 'gtl_contract_fulfillment_binding', obligationRef: obligation.obligationId, requirementRef: obligation.obligationId, productRequirementRef: obligation.obligationId, designObligationRef: 'authority://t151/test-design', componentRef: null, productTargetRef: outputRef, outputSurfaceRef: outputRef, functionOrEntrypointRef: null, realizationEvidenceRefs: [outputRef], testOrExecutionEvidenceRefs: [], evaluatorFindingRef: `finding://t151/${encodeURIComponent(obligation.obligationId)}`, authorityRefs: ['authority://t151/test-design'], evidenceRefs: [outputRef, reportRef] },",
      "    rationale: 'target/current-edge obligation fulfilled by emitted test design register'",
      "  }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic wrong_stage downstream carryover' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const register = {",
      "  kind: 'sdlc_test_design_register',",
      "  registerVersion: 'ts-test-design-v1',",
      "  targetAssetType: 'test_design_surface',",
      "  designConsumptionRows: [{ kind: 'sdlc_design_consumption_contract', contractRef: 'design-consumption://t151/test', sourceDesignObligationRefs: ['REQ-T151-001'], authorityBasisRefs: ['asset://implementation-design'], consumerGraphFunctionRefs: ['derive_component_test_surface'] }],",
      "  uatTestcaseRows: [{ kind: 'sdlc_test_case_row', testCaseRef: 'TC-T151-001', caseKind: 'uat', executionLane: 'uat', sourceDesignObligationRefs: ['REQ-T151-001'], testcaseAuthorityRefs: ['REQ-T151-001'], expectedBehavior: 'core value is transformed' }],",
      "  testcaseAuthorityRows: [{ kind: 'sdlc_test_case_row', testCaseRef: 'TC-T151-001', caseKind: 'positive', executionLane: 'integration', sourceDesignObligationRefs: ['REQ-T151-001'], testcaseAuthorityRefs: ['REQ-T151-001'], expectedBehavior: 'core value is transformed' }],",
      "  testStackProfileRows: [{ kind: 'sdlc_test_stack_profile_row', stackRef: 'stack://t151/node-test', frameworkRef: 'framework://node-test', buildTool: 'node' }],",
      "  testModuleRows: [{ kind: 'sdlc_test_module_row', moduleName: 'generated-tests', moduleRef: 'module://t151/generated-tests', testRoot: 'test' }],",
      "  testComponentTopologyRows: [{ kind: 'sdlc_test_component_topology_row', testClassId: 'CoreSpec', relativePath: 'test/core.test.js', testcaseIds: ['TC-T151-001'], componentIds: ['generated-core'], requirementIds: ['REQ-T151-001'], shardId: 'unit' }],",
      "  testDataBindings: [{ kind: 'sdlc_test_data_binding', testDataRef: 'test-data://t151/core', testCaseRef: 'TC-T151-001', inputFixtureRefs: ['fixture://t151/none'], generationPolicyRef: 'generation-policy://t151/static', expectedResultRef: 'expected://t151/core', sourceDesignObligationRefs: ['REQ-T151-001'] }],",
      "  expectedResultBindings: [{ kind: 'sdlc_expected_result_binding', expectedResultRef: 'expected://t151/core', testCaseRef: 'TC-T151-001', assertionRefs: ['assertion://t151/core'], expectedResultSummary: 'core value is transformed', verificationPolicyRef: 'verification-policy://t151/core' }],",
      "  uatIntegrationBindings: [{ kind: 'sdlc_uat_integration_binding', uatTestCaseRef: 'TC-T151-001', integrationTestCaseRef: 'TC-T151-001', executionLane: 'integration' }],",
      "  testExecutionScheduleRows: [{ kind: 'sdlc_test_execution_schedule_row', scheduleRef: 'schedule://t151/core', testCaseRefs: ['TC-T151-001'], command: 'node --test test/core.test.js', frameworkRef: 'framework://node-test', shardId: 'unit' }]",
      "};",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${JSON.stringify(register, null, 2)}\\n`, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(JSON.stringify(register), 'utf8').digest('hex')}`;",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...obligation.evidenceRefs.slice(0, 2)], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated synthetic test design register', unresolvedReasons: [], materializedFiles: [], materializationDiagnostics: [], executionEvidence: null, executionEvidenceErrors: [], obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

test("T-151 first_traversal returns the first admitted non-close consequence", async () => {
  const workspace = makeWorkspace();
  const start = makeStart(workspace);
  const basis = start.executionContract.basis;
  const workerScript = writeUnassessedObligationWorkerScript(workspace);

  const outcome = await executeInstalledOperatorStart({
    workspaceRoot: workspace,
    start,
    workerTransport: `process://node?script=${encodeURIComponent(workerScript)}`,
    replayEvents: preclosedEventsBeforeEdge(basis, "derive_component_code_surface")
  });

  assert.equal(Object.hasOwn(outcome, "loop"), false);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.summary.currentEdge, "derive_component_code_surface");
  assert.equal(outcome.postflight.status, "blocked");
  assert(outcome.traversalConsequence);
  assert.equal(outcome.traversalConsequence.edgeClosureDecision.disposition, "retry");
  assert.equal(
    outcome.traversalConsequence.nextActionProjection.choosesNextTraversal,
    true
  );
  assert.match(
    outcome.summary.nextLawfulAction,
    /post_retry\/derive_component_code_surface/u
  );
  assert.equal(
    outcome.traversalConsequence.nextActionProjection.predecessorRefs.includes(
      outcome.traversalConsequence.edgeClosureDecision.decisionRef
    ),
    true
  );
  assert.equal(
    existsSync(path.join(outcome.archiveRoot, "sdlc_edge_closure_decision.json")),
    true
  );
  assert.equal(
    existsSync(path.join(outcome.archiveRoot, "sdlc_next_action_projection.json")),
    true
  );
});

test("T-151 component-test trace_missing review pressure writes retry closure", async () => {
  const workspace = makeWorkspace({ testDesignAuthority: true });
  const start = makeStart(workspace, "derive_component_test_surface");
  const workerScript = writeTraceMissingComponentTestWorkerScript(workspace);

  const outcome = await executeInstalledOperatorStart({
    workspaceRoot: workspace,
    start,
    workerTransport: `process://node?script=${encodeURIComponent(workerScript)}`,
    replayEvents: []
  });

  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.summary.currentEdge, "derive_component_test_surface");
  assert.equal(outcome.postflight.status, "blocked");
  assert(outcome.traversalConsequence);
  assert.equal(outcome.traversalConsequence.edgeClosureDecision.disposition, "retry");
  assert.equal(
    outcome.traversalConsequence.nextActionProjection.nextGraphFunctionRef,
    "derive_component_test_surface"
  );
  assert.equal(
    existsSync(path.join(outcome.archiveRoot, "sdlc_edge_closure_decision.json")),
    true
  );
  assert.equal(
    existsSync(path.join(outcome.archiveRoot, "sdlc_next_action_projection.json")),
    true
  );
});

test("T-151 lawful wrong_stage review carryover is closure-visible evidence", async () => {
  const workspace = makeWorkspace();
  const start = makeStart(workspace, "derive_test_design_surface");
  const workerScript = writeWrongStageTestDesignWorkerScript(workspace);

  const outcome = await executeInstalledOperatorStart({
    workspaceRoot: workspace,
    start,
    workerTransport: `process://node?script=${encodeURIComponent(workerScript)}`,
    replayEvents: []
  });

  const reviewRuleOutcomeRef = pathToFileURL(
    path.join(outcome.archiveRoot, "review_grade_edge_fulfillment_rule_outcome.json")
  ).href;

  assert.equal(outcome.status, "worker_invoked");
  assert.notEqual(outcome.summary.currentEdge, "derive_test_design_surface");
  assert(outcome.traversalConsequence);
  assert.equal(outcome.traversalConsequence.edgeClosureDecision.disposition, "close");
  assert.equal(existsSync(path.join(outcome.archiveRoot, "review_grade_edge_fulfillment_rule_outcome.json")), true);
  assert.equal(
    outcome.traversalConsequence.edgeFulfillmentLedger.admissionRefs.includes(
      reviewRuleOutcomeRef
    ),
    true
  );
  assert.equal(
    outcome.traversalConsequence.edgeClosureDecision.predecessorRefs.includes(
      reviewRuleOutcomeRef
    ),
    true
  );
});

test("T-164 conform-project start stops at one admitted boundary before downstream graph work", async () => {
  const workspace = makeUnderstructuredConformWorkspace();
  const start = makeConformStart(workspace);

  const outcome = await executeInstalledOperatorStart({
    workspaceRoot: workspace,
    start,
    workerTransport: null,
    replayEvents: []
  });

  assert.equal(outcome.status, "converged");
  assert.equal(Object.hasOwn(outcome, "loop"), false);
  assert.equal(
    outcome.summary.nextLawfulAction,
    "rerun_start_for_downstream_graph"
  );
  assert.deepStrictEqual(outcome.emittedRuntimeEventKinds, [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "payload_observed",
    "payload_validated",
    "fd_authority_outcome_admitted",
    "vector_evaluated",
    "vector_closed",
    "fd_advance_ready",
    "payload_observed",
    "payload_validated"
  ]);
});

test("T-151 installed runner source exposes no local requested-until loop", () => {
  const source = readFileSync(
    new URL("../../code/src/operator/installed_operator.ts", import.meta.url),
    "utf8"
  );

  assert.equal(source.includes('latest.status === "worker_invoked"'), false);
  assert.equal(source.includes("latest.traversalConsequence !== null"), false);
  assert.deepStrictEqual(source.match(/requestedUntil/gu) ?? [], [
    "requestedUntil"
  ]);
  assert.match(
    source,
    /maxAttachedFpAttempts:\s*\n\s*input\.start\.executionContract\.requestedUntil === "first_traversal"/u
  );
  assert.equal(source.includes("refreshReplayState"), false);
  assert.equal(source.includes("sdlc_installed_operator_start_loop"), false);
  assert.equal(source.includes("completedDispatchState.nextLawfulAction"), false);
  assert.equal(source.includes("nextLawfulActions.includes"), false);
});

test("T-151 consequence bind blocks non-close no-action projections", () => {
  const source = readFileSync(
    new URL("../../code/src/operator/installed_operator.ts", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /input\.closureDisposition === "block"[\s\S]*?disposition:\s*"block"[\s\S]*?reason:\s*"typed_block"/u
  );
  assert.match(
    source,
    /consequence\.edgeClosureDecision\.disposition !== "close"[\s\S]*?consequence\.nextActionProjection\.choosesNextTraversal !== true[\s\S]*?status:\s*"blocked"/u
  );
  assert.match(
    source,
    /consequence bind blocked: \$\{consequence\.edgeClosureDecision\.disposition\} selected no next traversal/u
  );
});
