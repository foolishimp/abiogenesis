// Validates: REQ-F-ODDSDLC-030
// Validates: REQ-F-ODDSDLC-032
// Validates: REQ-F-ODDSDLC-053
// Validates: REQ-F-ODDSDLC-058
// Validates: REQ-F-ODDSDLC-061
// Validates: REQ-F-ODDSDLC-074
// Validates: REQ-F-ODDSDLC-075
// Validates: REQ-F-ODDSDLC-076
// Validates: REQ-F-ODDSDLC-077
// Validates: REQ-F-ODDSDLC-078
// Validates: REQ-F-ODDSDLC-079
// Validates: T-066

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  admitComponentDepthRegisterFromArtifact,
  admitSdlcProjectConstraints,
  buildPostTransformWorkerResultReport,
  constructWorkerInvocationPackage,
  constructPostflightGapDossier,
  constructSdlcFpEvaluateResult,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcHookContractCatalog,
  constructSdlcNextActionProjection,
  constructorResultFromWorkerOutput,
  declaredProductFileTargets,
  admitSdlcEdgeEvidence,
  deriveComponentDepthAssuranceLedger,
  deriveShallowRealizationAssuranceLedger,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeObligations,
  deriveSdlcOperatorAssuranceGate,
  deriveSdlcEdgeResidualPressure,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcPostCloseOverlayContinuationActionInput,
  deriveSdlcProductLineageYieldResumeBasis,
  deriveSdlcWorkspaceIngressReport,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcSelectedAbgFnCompositionIdentity,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcSourceInput,
  deriveWorkerHandoffManifest,
  executeInstalledOperatorStart,
  edgeAssuranceEvidenceCandidatesFor,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  evaluateSdlcComputeStage,
  FG_CONFORM_PROJECT,
  hookContractByEdgeName,
  installOddSdlcTypescript,
  materializeSdlcProjectConformance,
  makeSdlcBlockingReason,
  measureSdlcEdgeGain,
  evalSdlcGapFromReplay,
  normalizePostCloseContinuationVectorIndex,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  readOddSdlcRuntimeEvents,
  readWorkerResultReport,
  reconcileSdlcProductMaterializationAuthority,
  resolveSdlcEdgeGainClosureContract,
  sdlcAssessmentCarriesRequirementForDownstreamClosure,
  sdlcWorkerAssessmentCarriesRequirementTransformationSet,
  sha256Text,
  snapshotProductMaterializationRoot,
  sourceAssetAuthorityRefsFromAbgOutputAuthorityProjections,
  writeHandoffFiles,
  writeDeclaredEdgeProjectionOutput,
  writeProductMaterializationManifest
} from "../../build/semantic/code/src/index.js";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t066-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-066 Fixture", "", "Build a governed Scala product realization."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Create a typed downstream implementation."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-fixture.md"),
    ["# Requirements", "", "REQ-T066-001: Reject shallow product source realization."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t066_product_materialization",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  writeAdmittedStagedAuthoritySurfaces(root);
  return root;
}

function makeExecutionWorkspace() {
  const root = makeWorkspace();
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t066_execution_fixture",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    module_structure:",
      "      - full-suite"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  writeAdmittedStagedAuthoritySurfaces(root);
  return root;
}

function writeValidCodeBuilderFrontier(manifest) {
  mkdirSync(manifest.archiveRoot, { recursive: true });
  writeFileSync(
    path.join(
      manifest.archiveRoot,
      "sdlc_live_fp_parallel_materialization_frontier.json"
    ),
    `${JSON.stringify(
      {
        kind: "sdlc_live_fp_parallel_materialization_frontier",
        edgeName: "derive_component_code_surface",
        executionAuthority: "abg_evented_saga_frontier",
        parallelismControl: "abg_branch_execution_policy",
        graphTruthSource: "sdlc_feature_dependency_dag",
        selectedMethod: "parallel",
        dependencyMapRef: "dependency-map://t066/dev",
        testDependencyMapRef: "dependency-map://t066/component-test",
        uatTestDependencyMapRef: "dependency-map://t066/uat-test",
        dependencyMapRefs: [
          "dependency-map://t066/dev",
          "dependency-map://t066/component-test",
          "dependency-map://t066/uat-test"
        ],
        traversalSelectionRef: "traversal-selection://t066/dev",
        testTraversalSelectionRef: "traversal-selection://t066/component-test",
        uatTestTraversalSelectionRef: "traversal-selection://t066/uat-test",
        traversalSelectionRefs: [
          "traversal-selection://t066/dev",
          "traversal-selection://t066/component-test",
          "traversal-selection://t066/uat-test"
        ],
        dagRef: "dag://t066/code-builder",
        startNodes: ["node://t066/app"],
        frontierRef: "frontier://t066/code-builder",
        policyRef: "policy://t066/parallel-code-builder",
        laneCount: 3,
        devLaneCount: 1,
        componentTestLaneCount: 1,
        uatTestLaneCount: 1,
        testLaneCount: 2,
        fanInCount: 1,
        batchCount: 1,
        batchSizes: [3],
        maxActive: 3,
        readyBranchRefs: [
          "branch://t066/dev",
          "branch://t066/component-test",
          "branch://t066/uat-test"
        ],
        compiledReadyBranchRefs: [
          "branch://t066/dev",
          "branch://t066/component-test",
          "branch://t066/uat-test"
        ],
        completedBranchRefs: [
          "branch://t066/dev",
          "branch://t066/component-test",
          "branch://t066/uat-test"
        ],
        failedBranchRefs: [],
        writeTerritoryConflictRefs: [],
        outputAllocationConflictRefs: [],
        branchRows: [],
        fanInRows: [],
        emittedEventKinds: ["branch_started", "branch_completed"],
        emittedEventCount: 6,
        replayEventCount: 6
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function selectedCompositionForManifest(manifest) {
  return deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: manifest.graphFunctionName,
    graphVectorRef: manifest.edgeName,
    compositionSelectionScopeRef: `test://${manifest.runId ?? manifest.edgeName}`,
    carrierContextRefs: [manifest.reportFile],
    assuranceContextRefs: []
  });
}

function writeAdmittedImplementationDesignArchive({
  workspaceRoot,
  register,
  outputContent
}) {
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const prior = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 9,
    contract,
    runId: "20260524T000000000Z_pid66"
  });
  writeHandoffFiles(prior);
  mkdirSync(dirname(prior.outputFile), { recursive: true });
  writeFileSync(prior.outputFile, outputContent, "utf8");
  const registerPath = path.join(
    prior.archiveRoot,
    "design_depth_fp_evaluator_register.json"
  );
  const contentRegisterPath = path.join(
    prior.archiveRoot,
    "design_depth_fp_evaluator_content_register.json"
  );
  const registerRef = pathToFileURL(registerPath).href;
  const contentRegisterRef = pathToFileURL(contentRegisterPath).href;
  writeFileSync(registerPath, `${JSON.stringify(register, null, 2)}\n`, "utf8");
  const selectedComposition = selectedCompositionForManifest(prior);
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
        selectedCompositionRef: selectedComposition.compositionRef,
        selectedCompositionDigest: selectedComposition.compositionDigest,
        selectedCompositionSelectionRef: selectedComposition.compositionSelectionRef,
        selectedRegimeBindingRef: selectedComposition.selectedRegimeBindingRef,
        compositionContributionRef:
          selectedComposition.selectedRegimeBindingRef ??
          selectedComposition.compositionSelectionRef,
        sourceBasisRefs: [pathToFileURL(prior.outputFile).href],
        candidateArtifactRefs: [pathToFileURL(prior.outputFile).href],
        evidenceRefs: [pathToFileURL(prior.outputFile).href],
        contentRows: [
          {
            kind: "sdlc_evaluate_content_register_row",
            rowRef: "evaluate-content-row://t066/design-depth-register",
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register",
            payload: register,
            sourceBasisRefs: [pathToFileURL(prior.outputFile).href],
            evidenceRefs: [pathToFileURL(prior.outputFile).href]
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(prior.archiveRoot, "fp_evaluate_result.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_fp_evaluate_result",
        stage: "F_P.evaluate",
        computeNotationStage: "evaluate.C",
        stageAuthority: "typed_fp_stage_carriers",
        selectedComposition,
        compositionRef: selectedComposition.compositionRef,
        compositionDigest: selectedComposition.compositionDigest,
        compositionSelectionRef: selectedComposition.compositionSelectionRef,
        selectedRegimeBindingRef: selectedComposition.selectedRegimeBindingRef,
        evaluationRef: "evaluation://t066/design-depth",
        findings: [
          {
            findingRef: "finding://t066/evaluate/design-depth-register",
            compositionRef: selectedComposition.compositionRef,
            compositionDigest: selectedComposition.compositionDigest,
            authorityRefs: [contentRegisterRef, registerRef],
            evidenceRefs: [contentRegisterRef, registerRef]
          }
        ],
        evaluation: {
          evaluationRef: "evaluation://t066/design-depth",
          status: "passed",
          findingRefs: ["finding://t066/evaluate/design-depth-register"]
        },
        status: "passed",
        postflightStatus: "passed",
        blockingReasons: [],
        evidenceRefs: [contentRegisterRef, registerRef]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    prior.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          prior.fpEvaluateResultFile
        ).href,
        graphFunctionName: prior.graphFunctionName,
        edgeName: prior.edgeName,
        targetAssetType: prior.targetAssetType,
        outputFile: prior.outputFile,
        digest: sha256Text(outputContent),
        summary: "fixture admitted implementation design-depth authority",
        unresolvedReasons: [],
        materializedFiles: [],
        materializationDiagnostics: [],
        executionEvidence: null,
        executionEvidenceErrors: [],
        obligationAssessments: prior.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [contentRegisterRef, registerRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        ),
        fpTransformRequestRef: null,
        fpTransformResultRef: null,
        fpTransformStatusSnapshot: null,
        fpEvaluateResultRef: pathToFileURL(prior.fpEvaluateResultFile).href
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function writeAdmittedStagedAuthoritySurfaces(workspaceRoot) {
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot);
  const tenantRoot = path.join(workspaceRoot, constraints.selectedOutputRoot);
  writeTenantTechnologyStackSpec(workspaceRoot);
  const helloWorldJavascript =
    constraints.selectedOutputRoot.endsWith("hello_world_javascript");
  const helloWorldRust =
    constraints.selectedOutputRoot.includes("hello_world_rust");
  const sourceRelative = helloWorldJavascript
    ? "src/hello.js"
    : helloWorldRust
      ? "src/main.rs"
    : "src/main/scala/generated/DataMapper.scala";
  const testRelative = helloWorldJavascript
    ? "test/hello.test.js"
    : helloWorldRust
      ? "tests/main.test.rs"
    : "src/test/scala/generated/DataMapperSpec.scala";
  const stackLanguage = helloWorldJavascript
    ? "javascript"
    : helloWorldRust
      ? "rust"
      : "scala";
  const stackBuildTool = helloWorldJavascript
    ? "node"
    : helloWorldRust
      ? "cargo"
      : "sbt";
  const fileTargetRows = helloWorldRust
    ? [
        {
          kind: "sdlc_file_target_row",
          relativePath: "Cargo.toml",
          role: "build_config"
        },
        {
          kind: "sdlc_file_target_row",
          relativePath: sourceRelative,
          role: "source"
        }
      ]
    : [
        {
          kind: "sdlc_file_target_row",
          relativePath: sourceRelative,
          role: "source"
        },
        {
          kind: "sdlc_file_target_row",
          relativePath: testRelative,
          role: "test"
        }
      ];
  const implementationDesignFile = path.join(
    tenantRoot,
    "design/adrs/ADR-002-implementation-design-surface.md"
  );
  const testDesignFile = path.join(
    tenantRoot,
    "design/adrs/ADR-003-test-design-surface.md"
  );
  mkdirSync(dirname(implementationDesignFile), { recursive: true });
  const implementationDesignRequirementRefs = ["reqref://t066/default"];
  const implementationDesignSourceRefs = ["fixture://t066"];
  const implementationDesignRegister = {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t066/scala-sbt",
        language: stackLanguage,
        buildTool: stackBuildTool
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "generated",
        moduleRef: "module://t066/generated"
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
        componentId: "generated-data-mapper",
        moduleName: "generated",
        relativePath: sourceRelative,
        publicBoundary: "DataMapper",
        concernRole: "mapper",
        requirementIds: implementationDesignRequirementRefs,
        sourceAssetRefs: implementationDesignSourceRefs
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "generated-data-mapper",
        moduleName: "generated",
        relativePath: sourceRelative,
        publicBoundary: "DataMapper",
        trancheId: null,
        firstProductFileToChange: sourceRelative,
        upstreamComponentIds: [],
        requirementIds: implementationDesignRequirementRefs,
        sourceAssetRefs: implementationDesignSourceRefs
      }
    ],
    fileTargetRows,
    designCompletenessVerdict: null
  };
  writeFileSync(
    implementationDesignFile,
    `${JSON.stringify(implementationDesignRegister, null, 2)}\n`,
    "utf8"
  );
  writeAdmittedImplementationDesignArchive({
    workspaceRoot,
    register: implementationDesignRegister,
    outputContent: readFileSync(implementationDesignFile, "utf8")
  });
  mkdirSync(dirname(testDesignFile), { recursive: true });
  writeFileSync(
    testDesignFile,
    `${JSON.stringify(
      {
        kind: "sdlc_test_design_register",
        registerVersion: "ts-test-design-v1",
        targetAssetType: "test_design_surface",
        designConsumptionRows: [
          {
            kind: "sdlc_design_consumption_contract",
            contractRef: "design-consumption://t066/default",
            sourceDesignObligationRefs: ["reqref://t066/default"],
            authorityBasisRefs: ["file://specification/requirements/01-fixture.md"],
            consumerGraphFunctionRefs: ["derive_component_test_surface"]
          }
        ],
        uatTestcaseRows: [
          {
            kind: "sdlc_test_case_row",
            testCaseRef: "TC-T066-001",
            caseKind: "positive",
            executionLane: "unit",
            sourceDesignObligationRefs: ["reqref://t066/default"],
            testcaseAuthorityRefs: ["testcase-authority://t066/default"],
            expectedBehavior: "Generated mapper compiles and exposes a data value."
          }
        ],
        testcaseAuthorityRows: [
          {
            kind: "sdlc_test_case_row",
            testCaseRef: "TC-T066-001",
            caseKind: "positive",
            executionLane: "unit",
            sourceDesignObligationRefs: ["reqref://t066/default"],
            testcaseAuthorityRefs: ["testcase-authority://t066/default"],
            expectedBehavior: "Generated mapper compiles and exposes a data value."
          }
        ],
        testStackProfileRows: [
          {
            kind: "sdlc_test_stack_profile_row",
            stackRef: "stack://t066/scalatest",
            frameworkRef: "framework://scalatest",
            buildTool: "sbt"
          }
        ],
        testModuleRows: [
          {
            kind: "sdlc_test_module_row",
            moduleName: "generated-tests",
            moduleRef: "module://t066/generated-tests",
            testRoot: "src/test/scala"
          }
        ],
        testComponentTopologyRows: [
          {
            kind: "sdlc_test_component_topology_row",
            testClassId: "DataMapperSpec",
            relativePath: testRelative,
            testcaseIds: ["TC-T066-001"],
            componentIds: ["generated-data-mapper"],
            requirementIds: ["reqref://t066/default"],
            shardId: "test-shard-01-generated"
          }
        ],
        testDataBindings: [
          {
            kind: "sdlc_test_data_binding",
            testDataRef: "test-data://t066/default",
            testCaseRef: "TC-T066-001",
            inputFixtureRefs: ["fixture://t066/default"],
            generationPolicyRef: "generation-policy://t066/static",
            expectedResultRef: "expected-result://t066/default",
            sourceDesignObligationRefs: ["reqref://t066/default"]
          }
        ],
        expectedResultBindings: [
          {
            kind: "sdlc_expected_result_binding",
            expectedResultRef: "expected-result://t066/default",
            testCaseRef: "TC-T066-001",
            assertionRefs: ["assertion://t066/generated"],
            expectedResultSummary: "Generated mapper result is observable.",
            verificationPolicyRef: "verification-policy://t066/scalatest"
          }
        ],
        uatIntegrationBindings: [
          {
            kind: "sdlc_uat_integration_binding",
            uatTestCaseRef: "TC-T066-001",
            integrationTestCaseRef: "TC-T066-001",
            executionLane: "unit"
          }
        ],
        testExecutionScheduleRows: [
          {
            kind: "sdlc_test_execution_schedule_row",
            scheduleRef: "test-schedule://t066/default",
            testCaseRefs: ["TC-T066-001"],
            command: "sbt test",
            frameworkRef: "framework://scalatest",
            shardId: "test-shard-01-generated"
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function makeCapabilityWorkspace() {
  const root = makeWorkspace();
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t066_capability_materialization",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    capability_contracts:",
      "      spark_session: true",
      "      dataframe_reads: true"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  writeAdmittedStagedAuthoritySurfaces(root);
  return root;
}

function declareScalaSbtTestRunner(workspaceRoot) {
  writeFileSync(
    path.join(workspaceRoot, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t100_test_materialization",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot });
}

function writeTenantTechnologyStackSpec(
  workspaceRoot,
  options = { buildConfigTargets: [] }
) {
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot);
  const tenantRoot = path.join(workspaceRoot, constraints.selectedOutputRoot);
  const stackSpecFile = path.join(tenantRoot, "spec/TECH_STACK.json");
  const buildConfigTargets = options.buildConfigTargets ?? [];
  const byproductRules = options.byproductRules ?? [];
  if (
    buildConfigTargets.length === 0 &&
    byproductRules.length === 0 &&
    existsSync(stackSpecFile)
  ) {
    return;
  }
  const helloWorldJavascript =
    constraints.selectedOutputRoot.endsWith("hello_world_javascript");
  const helloWorldRust =
    constraints.selectedOutputRoot.includes("hello_world_rust");
  const language = helloWorldJavascript
    ? "JavaScript"
    : helloWorldRust
      ? "Rust"
      : "Scala";
  const buildTool = helloWorldJavascript
    ? "node"
    : helloWorldRust
      ? "cargo"
      : "sbt";
  const testRunner = helloWorldJavascript
    ? "node --test"
    : helloWorldRust
      ? "cargo test"
      : "sbt test";
  mkdirSync(dirname(stackSpecFile), { recursive: true });
  writeFileSync(
    stackSpecFile,
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language,
        buildTool,
        executionEnvironment: {
          hostCachePolicy: "prohibited",
          workspaceLocalDirectories: [
            ".ai-workspace/runtime/odd_sdlc/tool-cache/test-stack"
          ],
          environmentVariables: {
            TEST_STACK_HOME:
              "${workspaceRoot}/.ai-workspace/runtime/odd_sdlc/tool-cache/test-stack"
          },
          ...(byproductRules.length > 0 ? { byproductRules } : {})
        },
        ...(buildConfigTargets.length > 0 ? { buildConfigTargets } : {}),
        testingTechStack: {
          testRunner,
          testRoots: [
            helloWorldJavascript
              ? "test/"
              : helloWorldRust
                ? "tests/"
                : "src/test/scala/"
          ],
          proofCommands: [testRunner],
          evidenceFormat: "process-exit"
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function makeStart(workspaceRoot) {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t066",
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
        handle: "bootstrap_release_self_test"
      },
      until: "converged",
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

function assessedEventForVector(basis, vector, index) {
  return {
    kind: "assessed",
    assessmentKind: "fp",
    edge: vector.name,
    obligationId: `t066-preclosed-${index}`,
    publishedLedgerRef: `proof://t066/preclosed/${index}`,
    actor: "test",
    specHash: `sha256:t066preclosed${index}`,
    manifestId: `manifest:t066:preclosed:${index}`,
    workflowVersion: "t066-preclosed",
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
  return Object.freeze(
    basis.graph.vectors
      .slice(0, targetIndex)
      .flatMap((vector, index) => [
        assessedEventForVector(basis, vector, index),
        vectorClosedEventForVector(basis, vector, index)
      ])
  );
}

function reviewGradeEvaluatorBranch(summary) {
  return [
    "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
    "  const assessmentPath = process.env.ODD_SDLC_EVALUATOR_ASSESSMENT ?? path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json');",
    "  const reportPath = process.env.ODD_SDLC_EVALUATOR_WORKER_REPORT ?? manifest.reportFile;",
    "  const report = JSON.parse(readFileSync(reportPath, 'utf8'));",
    "  const reviewedObligationIds = report.obligationAssessments.map((assessment) => assessment.obligationId);",
    "  const outputRef = pathToFileURL(manifest.outputFile).href;",
    "  const reportRef = pathToFileURL(reportPath).href;",
    "  const findings = reviewedObligationIds.map((obligationId) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts generated asset for materialization regression' }));",
    `  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: ${JSON.stringify(summary)} };`,
    "  writeFileSync(assessmentPath, `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
    "  process.stdout.write(`reviewStatus=passed reviewed=${reviewedObligationIds.length} blocked=0\\n`);",
    "  process.exit(0);",
    "}"
  ].join("\n");
}

function writePlaceholderWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_placeholder_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for placeholder worker"),
      "const sourceRelative = 'src/main/scala/generated/DataMapper.scala';",
      "const testRelative = 'src/test/scala/generated/DataMapperSpec.scala';",
      "function designCompletenessVerdict() {",
      "  const axis = (name) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis: name, status: 'satisfied', reasons: [], evidenceRefs: [`file://${manifest.outputFile}`] });",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:Core.retryClosed', name: 'retryClosed', valueType: 'boolean', cardinality: 'one', invariantRefs: ['REQ-ENG-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:Core', moduleName: 'cdme-core', ownership: 'owned', attributes: [attribute], invariants: ['retry closure is explicit'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:Core.retryClosed', moduleName: 'cdme-core', inputEntityIds: ['entity:Core'], outputEntityIds: ['entity:Core'], requiredAttributeIds: ['attr:Core.retryClosed'] };",
      "  const aggregateEntity = { kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'cdme-core', attributes: [attribute], sourceModuleNames: ['cdme-core'] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [aggregateEntity], operations: [operation], crossModuleReferences: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const aggregateSunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:Core.retryClosed', moduleName: 'cdme-core', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:Core.open.closed'] }], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  if (manifest.targetAssetType === 'implementation_design_surface') return { ...base, stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://t066/scala-sbt', language: 'scala', buildTool: 'sbt' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'cdme-core', moduleRef: 'module://t066/cdme-core' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://t066/aggregate' }], moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'cdme-core', entities: [entity], operations: [operation], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'cdme-core', entityId: entity.entityId, stateless: false, states: ['open', 'closed'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:Core.open.closed', fromState: 'open', toState: 'closed', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], aggregateDomainModel, sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://t066/core-retry' }], aggregateSunnyDaySequence, componentTopologyRows: [{ kind: 'sdlc_component_topology_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', concernRole: 'mapper', requirementIds: ['REQ-DM-001'], sourceAssetRefs: ['fixture://data_mapper'] }], componentRealizationRows: [{ kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', trancheId: 'tranche:cdme-core', firstProductFileToChange: sourceRelative, upstreamComponentIds: [], requirementIds: ['REQ-DM-001'], sourceAssetRefs: ['fixture://data_mapper'] }], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: sourceRelative, role: 'source' }], designCompletenessVerdict: designCompletenessVerdict() };",
      "  return null;",
      "}",
      "function componentDepthRegister() {",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-DM-001'], sourceAssetRefs: ['fixture://data_mapper'] };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-DM-001'], shardId: null };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-DM-001'], status: 'passed', evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'component depth parity met for fixture worker', blockingReasons: [], evidenceRefs: [`file://${manifest.outputFile}`] } };",
      "  return null;",
      "}",
      "const designRegister = designDepthRegister();",
      "const componentRegister = componentDepthRegister();",
      "function currentRequirementTraceIds() {",
      "  try {",
      "    const invocation = JSON.parse(readFileSync(path.join(manifest.archiveRoot, 'worker_invocation_package.json'), 'utf8'));",
      "    if (Array.isArray(invocation.requirementTraceObligationIds) && invocation.requirementTraceObligationIds.length > 0) return invocation.requirementTraceObligationIds;",
      "  } catch {}",
      "  return manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "}",
      "const activeRequirementObligationIds = manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "const requirementObligationIds = [...new Set([...currentRequirementTraceIds(), ...activeRequirementObligationIds])];",
      "const requirementIds = requirementObligationIds.map((id) => id.replace(/^requirement:/, '')).filter((id) => id.startsWith('REQ-')).join(', ') || 'none';",
      "const activeRequirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const requirementTraceHeader = [...requirementObligationIds.map((id) => `// ${id}`), ...activeRequirementTags.map((tag) => `// Validates: ${tag}`)].join('\\n');",
      "function appendImplementationDesignAdr(lines) {",
      "  if (manifest.targetAssetType !== 'implementation_design_surface') return;",
      "  const requirementForTable = requirementIds === 'none' ? 'REQ-ENG-001' : requirementIds.split(', ')[0];",
      "  lines.push('', '## Context', '', 'Tenant-local implementation design must live under design/adrs and declare product file targets for evaluator admission.');",
      "  lines.push('', '## Decision', '', 'The implementation surface is a single cdme-core module with one source realization file for the current fixture pressure.');",
      "  lines.push('', '## Module Boundary', '', '- Module: `cdme-core`', '- Public boundary: `Core.retryClosed`', '- Component: `cdme-core`');",
      "  lines.push('', '## Product File Targets', '', '| Path | Role |', '| ---- | ---- |', `| ${sourceRelative} | source |`);",
      "  lines.push('', '## Requirement Lineage', '', '| Requirement | Owning Component | Realization File |', '| ----------- | ---------------- | ---------------- |', `| ${requirementForTable} | cdme-core | ${sourceRelative} |`);",
      "  lines.push('', '## Consequences', '', '- The evaluator derives design-depth register, decomposition summary, and dependency map from this ADR.', '- Test execution and proof evidence remain downstream pressure.');",
      "}",
      "const outputLines = [`# ${manifest.targetAssetType}`];",
      "if (manifest.outputFile.split(path.sep).join('/').includes('/design/adrs/')) outputLines.push('', '| Field | Value |', '|-------|-------|', '| `Status:` | `active` |', `| \\`Implements:\\` | ${requirementIds} |`, `| \\`Derives from:\\` | ${manifest.graphFunctionName} / ${manifest.edgeName} |`, '| `Supersedes:` | none |', '| `Superseded by:` | none |', '| `Retained special case:` | none |');",
      "outputLines.push('', `edge: ${manifest.edgeName}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', '## Requirement Trace', requirementTraceHeader);",
      "appendImplementationDesignAdr(outputLines);",
      "const output = componentRegister !== null ? `${JSON.stringify(componentRegister, null, 2)}\\n` : outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const tenantRelative = sourceRelative;",
      "const sourcePath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "mkdirSync(dirname(sourcePath), { recursive: true });",
      "const source = `${requirementTraceHeader}\\npackage generated\\n// TODO placeholder implementation\\nobject Placeholder { def run(input: String): String = input }\\n`; ",
      "writeFileSync(sourcePath, source, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "const materializedFiles = [{ kind: 'sdlc_materialized_product_file', role: 'source', relativePath: tenantRelative, absolutePath: sourcePath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8'), requirementTraceObligationIds: requirementObligationIds }];",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const materializedRequirementIdSet = new Set(requirementObligationIds);",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: materializedRequirementIdSet.has(obligation.obligationId) && materializedRefs.length > 0 ? materializedRefs : [outputRef, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated placeholder source that must be rejected by assurance gate', unresolvedReasons: [], materializedFiles, executionEvidence: null, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeCapabilityMissingWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_capability_missing_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for capability worker"),
      "const sourceRelative = 'src/main/scala/generated/DataMapper.scala';",
      "const testRelative = 'src/test/scala/generated/DataMapperSpec.scala';",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-DM-001'], sourceAssetRefs: ['fixture://data_mapper'] };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-DM-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-DM-001'], status: 'passed', evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'component depth parity met for fixture worker', blockingReasons: [], evidenceRefs: [`file://${manifest.outputFile}`] } };",
      "  return null;",
      "}",
      "function testDesignRegister() {",
      "  if (manifest.targetAssetType !== 'test_design_surface') return null;",
      "  const testCase = { kind: 'sdlc_test_case_row', testCaseRef: 'TC-DM-001', caseKind: 'uat', executionLane: 'integration', sourceDesignObligationRefs: requirementObligationIds, testcaseAuthorityRefs: ['testcase-authority://t066/TC-DM-001'], expectedBehavior: 'DataMapper generated source is exercised by DataMapperSpec' };",
      "  return { kind: 'sdlc_test_design_register', registerVersion: 'ts-test-design-v1', targetAssetType: 'test_design_surface', designConsumptionRows: [{ kind: 'sdlc_design_consumption_contract', contractRef: 'design-consumption://t066/capability-test-design', sourceDesignObligationRefs: requirementObligationIds, authorityBasisRefs: manifest.inputAssetTypes.map((assetType) => `asset-type://${assetType}`), consumerGraphFunctionRefs: ['derive_component_test_surface', 'prepare_test_execution_surface', 'derive_test_execution_result_surface'] }], uatTestcaseRows: [testCase], testcaseAuthorityRows: [testCase], testStackProfileRows: [{ kind: 'sdlc_test_stack_profile_row', stackRef: 'stack://t066/scala-sbt-test', frameworkRef: 'framework://scalatest', buildTool: 'sbt' }], testModuleRows: [{ kind: 'sdlc_test_module_row', moduleName: 'generated-tests', moduleRef: 'module://t066/generated-tests', testRoot: 'src/test/scala' }], testComponentTopologyRows: [{ kind: 'sdlc_test_component_topology_row', testClassId: 'DataMapperSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-DM-001'], shardId: 'test-shard-01-cdme-core' }], testDataBindings: [{ kind: 'sdlc_test_data_binding', testDataRef: 'test-data://t066/default', testCaseRef: 'TC-DM-001', inputFixtureRefs: ['fixture://t066/default'], generationPolicyRef: 'generation-policy://t066/static', expectedResultRef: 'expected-result://t066/TC-DM-001', sourceDesignObligationRefs: requirementObligationIds }], expectedResultBindings: [{ kind: 'sdlc_expected_result_binding', expectedResultRef: 'expected-result://t066/TC-DM-001', testCaseRef: 'TC-DM-001', assertionRefs: ['assertion://t066/DataMapperSpec'], expectedResultSummary: 'DataMapperSpec passes', verificationPolicyRef: 'verification-policy://t066/scalatest' }], uatIntegrationBindings: [{ kind: 'sdlc_uat_integration_binding', uatTestCaseRef: 'TC-DM-001', integrationTestCaseRef: 'TC-DM-001', executionLane: 'integration' }], testExecutionScheduleRows: [{ kind: 'sdlc_test_execution_schedule_row', scheduleRef: 'test-schedule://t066/capability', testCaseRefs: ['TC-DM-001'], command: 'sbt test', frameworkRef: 'framework://scalatest', shardId: 'test-shard-01-cdme-core' }] };",
      "}",
      "const register = componentDepthRegister();",
      "function currentRequirementTraceIds() {",
      "  try {",
      "    const invocation = JSON.parse(readFileSync(path.join(manifest.archiveRoot, 'worker_invocation_package.json'), 'utf8'));",
      "    if (Array.isArray(invocation.requirementTraceObligationIds) && invocation.requirementTraceObligationIds.length > 0) return invocation.requirementTraceObligationIds;",
      "  } catch {}",
      "  return manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "}",
      "const activeRequirementObligationIds = manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "const requirementObligationIds = [...new Set([...currentRequirementTraceIds(), ...activeRequirementObligationIds])];",
      "const requirementIds = requirementObligationIds.map((id) => id.replace(/^requirement:/, '')).filter((id) => id.startsWith('REQ-')).join(', ') || 'none';",
      "const activeRequirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const requirementTraceHeader = [...requirementObligationIds.map((id) => `// ${id}`), ...activeRequirementTags.map((tag) => `// Validates: ${tag}`)].join('\\n');",
      "const outputLines = [`# ${manifest.targetAssetType}`];",
      "if (manifest.outputFile.split(path.sep).join('/').includes('/design/adrs/')) outputLines.push('', '| Field | Value |', '|-------|-------|', '| `Status:` | `active` |', `| \\`Implements:\\` | ${requirementIds} |`, `| \\`Derives from:\\` | ${manifest.graphFunctionName} / ${manifest.edgeName} |`, '| `Supersedes:` | none |', '| `Superseded by:` | none |', '| `Retained special case:` | none |');",
      "outputLines.push('', `edge: ${manifest.edgeName}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', '## Requirement Trace', requirementTraceHeader);",
      "const testRegister = testDesignRegister();",
      "const exactOutputRegister = testRegister ?? register;",
      "const output = exactOutputRegister !== null ? `${JSON.stringify(exactOutputRegister, null, 2)}\\n` : outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const tenantRelative = sourceRelative;",
      "const sourcePath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "mkdirSync(dirname(sourcePath), { recursive: true });",
      "const source = `${requirementTraceHeader}\\n// edge: ${manifest.edgeName}\\npackage generated\\nobject Core { def run(value: String): String = value.reverse }\\n`; ",
      "writeFileSync(sourcePath, source, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "const materializedFiles = [{ kind: 'sdlc_materialized_product_file', role: 'source', relativePath: tenantRelative, absolutePath: sourcePath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8'), requirementTraceObligationIds: requirementObligationIds }];",
      "let executionEvidence = null;",
      "const declaredExecutionContract = typeof manifest.productMaterialization.testExecutionContract === 'string' && !['', 'undeclared', 'none', 'n/a', 'not_applicable'].includes(manifest.productMaterialization.testExecutionContract.trim().toLowerCase());",
      "const admitsExecutionEvidence = manifest.targetAssetType === 'test_execution_result_surface' || (manifest.targetAssetType === 'component_code_surface' && manifest.productMaterialization.required && declaredExecutionContract);",
      "if (admitsExecutionEvidence && manifest.productMaterialization.executionShards.length > 0) {",
      "  const reportPath = path.join(manifest.archiveRoot, 'component-code-execution-report.txt');",
      "  writeFileSync(reportPath, 'component code execution succeeded\\n', 'utf8');",
      "  const shardEvidence = manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'succeeded', reportRefs: [`file://${reportPath}`], testsObserved: 1, passedCount: 1, failedCount: 0 }));",
      "  executionEvidence = { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'succeeded', reportRefs: [`file://${reportPath}`], testsObserved: shardEvidence.length, passedCount: shardEvidence.length, failedCount: 0, shardEvidence };",
      "}",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const materializedRequirementIdSet = new Set(requirementObligationIds);",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: materializedRequirementIdSet.has(obligation.obligationId) && materializedRefs.length > 0 ? materializedRefs : [outputRef, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated source without required capability evidence', unresolvedReasons: [], materializedFiles, executionEvidence, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeUnassessedObligationWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_unassessed_obligation_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
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

function writeSilentWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_silent_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "setTimeout(() => {",
      "  process.exit(0);",
      "}, 10000);"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeNoopWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_noop_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { readFileSync, writeFileSync } from 'node:fs';",
      "import path from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = process.argv[2] === undefined ? null : JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "if (manifest !== null) {",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for noop worker"),
      "}",
      "process.exit(0);"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeRepairScheduleWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_repair_schedule_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for repair schedule worker"),
      "function findFile(root, basename) {",
      "  if (!existsSync(root)) return null;",
      "  for (const entry of readdirSync(root, { withFileTypes: true })) {",
      "    const candidate = path.join(root, entry.name);",
      "    if (entry.isFile() && entry.name === basename) return candidate;",
      "    if (entry.isDirectory()) {",
      "      const nested = findFile(candidate, basename);",
      "      if (nested !== null) return nested;",
      "    }",
      "  }",
      "  return null;",
      "}",
      "const operatorRunsRoot = path.join(manifest.workspaceRoot, '.ai-workspace/runtime/odd_sdlc/operator-runs');",
      "const compilerSummary = findFile(operatorRunsRoot, 'test-shard-01-cdme-compiler.summary.json');",
      "const engineSummary = findFile(operatorRunsRoot, 'test-shard-02-cdme-engine.summary.json');",
      "const evidenceRefs = [compilerSummary, engineSummary].filter((file) => file !== null).map((file) => pathToFileURL(file).href);",
      "function repairRow(input) {",
      "  return {",
      "    kind: 'sdlc_component_repair_schedule_row',",
      "    scheduleId: `repair:${input.componentId}:medium-confidence`,",
      "    failureId: `failure:${input.componentId}:execution`,",
      "    repairTarget: 'component_code',",
      "    lawfulReentryPoint: 'repair_component_realization',",
      "    attributionConfidence: 'medium',",
      "    testcaseIds: [`TC-${input.componentId}`],",
      "    componentIds: [input.componentId],",
      "    requirementIds: ['REQ-T066-001'],",
      "    sourceRefs: [`build_tenants/scala_spark/${input.componentId}/src/main/scala/Core.scala`],",
      "    testRefs: [`build_tenants/scala_spark/${input.componentId}/src/test/scala/CoreSpec.scala`],",
      "    evidenceRefs: input.evidenceRefs",
      "  };",
      "}",
      "const register = {",
      "  kind: 'sdlc_component_depth_register',",
      "  registerVersion: 'ts-component-depth-v1',",
      "  targetAssetType: 'component_repair_schedule_surface',",
      "  componentRepairSchedule: {",
      "    kind: 'sdlc_component_repair_schedule',",
      "    registerVersion: 'ts-component-depth-v1',",
      "    scheduleStatus: 'repair_required',",
      "    repairRows: [",
      "      repairRow({ componentId: 'cdme-compiler', evidenceRefs: compilerSummary === null ? evidenceRefs : [pathToFileURL(compilerSummary).href] }),",
      "      repairRow({ componentId: 'cdme-engine', evidenceRefs: engineSummary === null ? evidenceRefs : [pathToFileURL(engineSummary).href] })",
      "    ],",
      "    evidenceRefs",
      "  }",
      "};",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${JSON.stringify(register, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function freshDataMapperWorkspace() {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing data_mapper template: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  const parentRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t066-dm-"));
  const workspaceRoot = path.join(parentRoot, "data_mapper.test66.ts");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspaceRoot, { recursive: true });
  for (const relativePath of [
    ".ai-workspace/events",
    ".ai-workspace/runtime",
    ".abiogenesis",
    ".genesis",
    ".npm-cache",
    "node_modules"
  ]) {
    rmSync(path.join(workspaceRoot, relativePath), {
      recursive: true,
      force: true
    });
  }
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot);
  assert.equal(
    existsSync(
      path.join(workspaceRoot, constraints.selectedOutputRoot, "spec/TECH_STACK.json")
    ),
    true,
    "data_mapper template must provide tenant technology stack authority"
  );
  assert.equal(
    existsSync(
      path.join(
        workspaceRoot,
        constraints.selectedOutputRoot,
        "spec/TESTING_TECH_STACK.json"
      )
    ),
    true,
    "data_mapper template must provide testing technology stack authority"
  );
  return workspaceRoot;
}

function installedOddSdlcCommand(install) {
  const commandPath = install.commandPaths.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  assert(commandPath, "odd-sdlc-ts command path missing");
  return commandPath;
}

function runInstalledOddSdlc(commandPath, args, workspaceRoot) {
  const run = spawnSync(commandPath, args, {
    cwd: workspaceRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ODD_SDLC_TS_OUTPUT: "json"
    },
    maxBuffer: 1024 * 1024 * 10
  });
  assert.equal(
    run.status,
    0,
    JSON.stringify(
      {
        error: run.error instanceof Error ? run.error.message : null,
        signal: run.signal,
        stderr: run.stderr.slice(0, 2000),
        stdoutPrefix: run.stdout.slice(0, 2000),
        stdoutBytes: Buffer.byteLength(run.stdout, "utf8"),
        args
      },
      null,
      2
    )
  );
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.kind, "odd_sdlc_spec_method_result");
  assert.equal(parsed.status, "ok");
  if (
    parsed.payload?.kind === "sdlc_installed_operator_start_cli_projection" &&
    typeof parsed.payload.sourceOutcomeRef === "string"
  ) {
    return JSON.parse(readFileSync(fileURLToPath(parsed.payload.sourceOutcomeRef), "utf8"));
  }
  return parsed.payload;
}

function writeDataMapperInventoryWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t066_data_mapper_inventory_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const sourceRelative = 'cdme-core/src/main/scala/cdme/Core.scala';",
      "const testRelative = 'cdme-core/src/test/scala/cdme/CoreSpec.scala';",
      "function designCompletenessVerdict() {",
      "  const axis = (name) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis: name, status: 'satisfied', reasons: [], evidenceRefs: [`file://${manifest.outputFile}`] });",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:Compiler.mappingPlan', name: 'mappingPlan', valueType: 'string', cardinality: 'one', invariantRefs: ['REQ-ENG-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:MappingPlan', moduleName: 'cdme-compiler', ownership: 'owned', attributes: [attribute], invariants: ['mapping plan is explicit'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:compileMappingPlan', moduleName: 'cdme-compiler', inputEntityIds: ['entity:MappingPlan'], outputEntityIds: ['entity:MappingPlan'], requiredAttributeIds: ['attr:Compiler.mappingPlan'] };",
      "  const aggregateEntity = { kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'cdme-compiler', attributes: [attribute], sourceModuleNames: ['cdme-compiler'] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [aggregateEntity], operations: [operation], crossModuleReferences: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const aggregateSunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:compileMappingPlan', moduleName: 'cdme-compiler', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:MappingPlan.draft.compiled'] }], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const topologyRow = { kind: 'sdlc_component_topology_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', concernRole: 'mapper', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', trancheId: 'tranche:data-mapper/core', firstProductFileToChange: sourceRelative, upstreamComponentIds: [], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType, stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://scala-sbt', language: 'scala', buildTool: 'sbt' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'cdme-compiler', moduleRef: 'module://cdme-compiler' }, { kind: 'sdlc_implementation_module_row', moduleName: 'cdme-core', moduleRef: 'module://cdme-core' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://cdme-compiler/aggregate' }], sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://cdme-compiler/compileMappingPlan' }], componentTopologyRows: [topologyRow], componentRealizationRows: [componentRow], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: sourceRelative, role: 'source' }] };",
      "  if (manifest.targetAssetType === 'implementation_design_surface') return { ...base, moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'cdme-compiler', entities: [entity], operations: [operation], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'cdme-compiler', entityId: entity.entityId, stateless: false, states: ['draft', 'compiled'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:MappingPlan.draft.compiled', fromState: 'draft', toState: 'compiled', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], aggregateDomainModel, aggregateSunnyDaySequence, designCompletenessVerdict: designCompletenessVerdict() };",
      "  return null;",
      "}",
      "function testDesignRegister() {",
      "  if (manifest.targetAssetType !== 'test_design_surface') return null;",
      "  const sourceDesignObligationRefs = manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId).slice(0, 8);",
      "  const sourceRefs = sourceDesignObligationRefs.length > 0 ? sourceDesignObligationRefs : ['requirement:REQ-ENG-001'];",
      "  const testcaseAuthorityRef = 'testcase-authority://data-mapper/TC-DM-001';",
      "  const testCase = { kind: 'sdlc_test_case_row', testCaseRef: 'TC-DM-001', caseKind: 'uat', executionLane: 'integration', sourceDesignObligationRefs: sourceRefs, testcaseAuthorityRefs: [testcaseAuthorityRef], expectedBehavior: 'Core.retryClosed is true for the declared mapping plan fixture' };",
      "  const testComponentTopologyRow = { kind: 'sdlc_test_component_topology_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: [testCase.testCaseRef], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const expectedResultRef = 'expected-result://data-mapper/TC-DM-001/retry-closed';",
      "  return { kind: 'sdlc_test_design_register', registerVersion: 'ts-test-design-v1', targetAssetType: manifest.targetAssetType, designConsumptionRows: [{ kind: 'sdlc_design_consumption_contract', contractRef: 'design-consumption://data-mapper/test-design', sourceDesignObligationRefs: sourceRefs, authorityBasisRefs: manifest.inputAssetTypes.map((assetType) => `asset-type://${assetType}`), consumerGraphFunctionRefs: ['derive_component_test_surface', 'prepare_test_execution_surface', 'derive_test_execution_result_surface', 'qualify_component_test_execution_surface'] }], uatTestcaseRows: [testCase], testcaseAuthorityRows: [testCase], testStackProfileRows: [{ kind: 'sdlc_test_stack_profile_row', stackRef: 'stack://scala-sbt', frameworkRef: 'framework://scalatest', buildTool: 'sbt' }], testModuleRows: [{ kind: 'sdlc_test_module_row', moduleName: 'cdme-core-tests', moduleRef: 'module://cdme-core-tests', testRoot: 'cdme-core/src/test/scala' }], testComponentTopologyRows: [testComponentTopologyRow], testDataBindings: [{ kind: 'sdlc_test_data_binding', testDataRef: 'test-data://data-mapper/TC-DM-001/default-fixture', testCaseRef: testCase.testCaseRef, inputFixtureRefs: ['fixture://data-mapper/default-mapping-plan'], generationPolicyRef: 'generation-policy://data-mapper/static-fixture', expectedResultRef, sourceDesignObligationRefs: sourceRefs }], expectedResultBindings: [{ kind: 'sdlc_expected_result_binding', expectedResultRef, testCaseRef: testCase.testCaseRef, assertionRefs: ['assertion://data-mapper/Core.retryClosed'], expectedResultSummary: 'Core.retryClosed equals true', verificationPolicyRef: 'verification-policy://data-mapper/scalatest-assertion' }], uatIntegrationBindings: [{ kind: 'sdlc_uat_integration_binding', uatTestCaseRef: testCase.testCaseRef, integrationTestCaseRef: testCase.testCaseRef, executionLane: 'integration' }], testExecutionScheduleRows: [{ kind: 'sdlc_test_execution_schedule_row', scheduleRef: 'test-schedule://data-mapper/sbt-test', testCaseRefs: [testCase.testCaseRef], command: 'sbt test', frameworkRef: 'framework://scalatest', shardId: testComponentTopologyRow.shardId }] };",
      "}",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const topologyRow = { kind: 'sdlc_component_topology_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', concernRole: 'mapper', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const testTopologyRow = { kind: 'sdlc_test_component_topology_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], status: 'passed', evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'component depth parity met for data_mapper fixture worker', blockingReasons: [], evidenceRefs: [`file://${manifest.outputFile}`] } };",
      "  return null;",
      "}",
      "const designRegister = designDepthRegister();",
      "const testRegister = testDesignRegister();",
      "const componentRegister = componentDepthRegister();",
      "function currentRequirementTraceIds() {",
      "  try {",
      "    const invocation = JSON.parse(readFileSync(path.join(manifest.archiveRoot, 'worker_invocation_package.json'), 'utf8'));",
      "    if (Array.isArray(invocation.requirementTraceObligationIds) && invocation.requirementTraceObligationIds.length > 0) return invocation.requirementTraceObligationIds;",
      "  } catch {}",
      "  return manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "}",
      "const activeRequirementObligationIds = manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId);",
      "const requirementObligationIds = [...new Set([...currentRequirementTraceIds(), ...activeRequirementObligationIds])];",
      "const requirementIds = requirementObligationIds.map((id) => id.replace(/^requirement:/, '')).filter((id) => id.startsWith('REQ-')).join(', ') || 'none';",
      "const activeRequirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const requirementTraceHeader = [...requirementObligationIds.map((id) => `// ${id}`), ...activeRequirementTags.map((tag) => `// Validates: ${tag}`)].join('\\n');",
      "function appendImplementationDesignAdr(lines) {",
      "  if (manifest.targetAssetType !== 'implementation_design_surface') return;",
      "  const requirementForTable = requirementIds === 'none' ? 'REQ-ENG-001' : requirementIds.split(', ')[0];",
      "  lines.push('', '## Context', '', 'The data_mapper Scala/Spark tenant stack is declared by build_tenants/scala_spark/spec and this ADR declares the implementation decomposition that the evaluator admits.');",
      "  lines.push('', '## Decision', '', 'Use cdme-core as the first implementation module, with Core.retryClosed as the bounded public boundary and Core.scala as the source file target.');",
      "  lines.push('', '## Module Boundary', '', '- Module: `cdme-core`', '- Public boundary: `Core.retryClosed`', '- Component: `cdme-core`');",
      "  lines.push('', '## Product File Targets', '', '| Path | Role |', '| ---- | ---- |', `| ${sourceRelative} | source |`);",
      "  lines.push('', '## Requirement Lineage', '', '| Requirement | Owning Component | Realization File |', '| ----------- | ---------------- | ---------------- |', `| ${requirementForTable} | cdme-core | ${sourceRelative} |`);",
      "  lines.push('', '## Consequences', '', '- The evaluator derives the design-depth register, decomposition summary, and dependency map from this ADR and tenant stack authority.', '- Test design, component tests, execution evidence, and release rollup remain downstream surfaces.');",
      "}",
      "function testExecutionSurfaceRegister() {",
      "  if (manifest.targetAssetType !== 'test_execution_surface') return null;",
      "  const payload = { kind: 'sdlc_test_execution_surface_register', registerVersion: 'ts-test-execution-v1', targetAssetType: 'test_execution_surface', testExecutionPreparationRows: [{ kind: 'sdlc_test_execution_preparation_row', scheduleRef: 'test-schedule://data-mapper/sbt-test', moduleName: 'cdme-core-tests', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], command: 'sbt test', workingDirectory: manifest.productMaterialization.selectedOutputRoot, frameworkRef: 'framework://scalatest', shardId: 'test-shard-01-cdme-core', sourceTestFileRefs: [`workspace://${testRelative}`], requirementIds: requirementObligationIds, status: 'prepared', evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`] }], evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`], summary: 'prepared data_mapper ScalaTest execution surface' };",
      "  const projection = manifest.targetCarrierProjection;",
      "  if (projection === undefined || projection === null) return payload;",
      "  return { kind: projection.outputCarrierKind, targetAssetType: manifest.targetAssetType, edgeRef: manifest.edgeName, contractRef: projection.targetCarrierContractRef, contractDigest: projection.targetCarrierContractDigest, payload, evidenceRefs: payload.evidenceRefs };",
      "}",
      "const testExecutionRegister = testExecutionSurfaceRegister();",
      "const evaluateStage = process.env.ODD_SDLC_EVALUATE_STAGE || '';",
      "if (evaluateStage === 'design_depth_content_register') {",
      "  const register = designDepthRegister();",
      "  if (register === null) throw new Error(`design depth register not available for ${manifest.targetAssetType}`);",
      "  const contentRegisterPath = process.env.ODD_SDLC_EVALUATOR_CONTENT_REGISTER;",
      "  if (typeof contentRegisterPath !== 'string' || contentRegisterPath.length === 0) throw new Error('ODD_SDLC_EVALUATOR_CONTENT_REGISTER is required');",
      "  const selectedCompositionRef = process.env.ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_REF;",
      "  const selectedCompositionDigest = process.env.ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_DIGEST;",
      "  const selectedCompositionSelectionRef = process.env.ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_SELECTION_REF;",
      "  if (!selectedCompositionRef || !selectedCompositionDigest || !selectedCompositionSelectionRef) throw new Error('selected composition environment is required');",
      "  const selectedRegimeBindingRef = process.env.ODD_SDLC_EVALUATOR_SELECTED_REGIME_BINDING_REF || null;",
      "  const compositionContributionRef = process.env.ODD_SDLC_EVALUATOR_COMPOSITION_CONTRIBUTION_REF || selectedRegimeBindingRef || selectedCompositionRef;",
      "  const sourceRef = pathToFileURL(manifest.outputFile).href;",
      "  const ledger = { kind: 'sdlc_evaluate_content_register', registerVersion: 'ts-evaluate-content-register-v1', stage: 'evaluate.C', ruleRef: 'evaluation-rule://odd-sdlc/design-depth-register/fp', ruleRole: 'semantic_judgment', computeMeans: 'F_P', authorityFunction: 'synthesize_model', selectedCompositionRef, selectedCompositionDigest, selectedCompositionSelectionRef, selectedRegimeBindingRef, compositionContributionRef, sourceBasisRefs: [sourceRef], candidateArtifactRefs: [sourceRef], evidenceRefs: [sourceRef], contentRows: [{ kind: 'sdlc_evaluate_content_register_row', rowRef: 'evaluate-content-row://t066/data-mapper/design-depth-register', authorityFunction: 'synthesize_model', carrierFamily: 'ProductAssetModel', contentKind: 'sdlc_design_depth_register', payload: register, sourceBasisRefs: [sourceRef], evidenceRefs: [sourceRef] }] };",
      "  mkdirSync(dirname(contentRegisterPath), { recursive: true });",
      "  writeFileSync(contentRegisterPath, `${JSON.stringify(ledger, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "if (evaluateStage === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({",
      "    kind: 'sdlc_review_grade_obligation_finding',",
      "    obligationId: obligation.obligationId,",
      "    fulfillmentStatus: 'fulfilled',",
      "    failureClass: null,",
      "    requiredAction: null,",
      "    evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)],",
      "    acceptedAuthorityRefs: [outputRef, reportRef],",
      "    rationale: 'synthetic evaluator confirms generated artifact maps this obligation to accepted stage output'",
      "  }));",
      "  const assessment = {",
      "    kind: 'sdlc_review_grade_edge_fulfillment_assessment',",
      "    assessmentVersion: 'ts-review-grade-v1',",
      "    graphFunctionName: manifest.graphFunctionName,",
      "    edgeName: manifest.edgeName,",
      "    targetAssetType: manifest.targetAssetType,",
      "    status: 'passed',",
      "    reviewedObligationIds,",
      "    findings,",
      "    evidenceRefs: [outputRef, reportRef],",
      "    summary: 'synthetic evaluator admitted review-grade edge fulfillment for data_mapper inventory test'",
      "  };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const outputLines = [`# ${manifest.targetAssetType}`];",
      "if (manifest.outputFile.split(path.sep).join('/').includes('/design/adrs/')) outputLines.push('', '| Field | Value |', '|-------|-------|', '| `Status:` | `active` |', `| \\`Implements:\\` | ${requirementIds} |`, `| \\`Derives from:\\` | ${manifest.graphFunctionName} / ${manifest.edgeName} |`, '| `Supersedes:` | none |', '| `Superseded by:` | none |', '| `Retained special case:` | none |');",
      "outputLines.push('', `edge: ${manifest.edgeName}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', '## Requirement Trace', requirementTraceHeader);",
      "appendImplementationDesignAdr(outputLines);",
      "const exactOutputRegister = testRegister ?? testExecutionRegister ?? componentRegister;",
      "const output = exactOutputRegister !== null ? `${JSON.stringify(exactOutputRegister, null, 2)}\\n` : outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const materializedFiles = [];",
      "let executionEvidence = null;",
      "if (manifest.productMaterialization.required) {",
      "  const role = manifest.targetAssetType === 'component_test_surface' ? 'test' : 'source';",
      "  const tenantRelative = role === 'test' ? testRelative : sourceRelative;",
      "  const productPath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "  mkdirSync(dirname(productPath), { recursive: true });",
      "  const declaredCapabilityMarkers = manifest.conformedProject.capabilityContracts.map((contract) => `${contract.name} ${contract.value}`).join(' ');",
      "  const capabilityMarkers = declaredCapabilityMarkers.length > 0 ? declaredCapabilityMarkers : 'spark_session dataframe_reads';",
      "  const source = role === 'test' ? `${requirementTraceHeader}\\npackage cdme\\nimport org.scalatest.funsuite.AnyFunSuite\\nfinal class CoreSpec extends AnyFunSuite { test(\"core contract\") { assert(Core.retryClosed == true) } }\\n` : `${requirementTraceHeader}\\npackage cdme\\nobject Core { val retryClosed = true; val capabilityMarkers = ${JSON.stringify(capabilityMarkers)} }\\n`;",
      "  writeFileSync(productPath, source, 'utf8');",
      "  const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "  materializedFiles.push({ kind: 'sdlc_materialized_product_file', role, relativePath: tenantRelative, absolutePath: productPath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8'), requirementTraceObligationIds: requirementObligationIds });",
      "  const writesBuildConfig = role === 'test' || manifest.targetAssetType === 'component_code_surface';",
      "  if (writesBuildConfig) {",
      "    const buildPath = path.join(manifest.productMaterialization.tenantRoot, 'build.sbt');",
      "    const moduleNames = manifest.productMaterialization.declaredModuleNames.length > 0 ? manifest.productMaterialization.declaredModuleNames : ['cdme-compiler'];",
      "    const moduleProjects = moduleNames.map((moduleName) => `lazy val \\`${moduleName}\\` = project.in(file(\"${moduleName}\"))`).join('\\n');",
      "    const aggregateRefs = moduleNames.map((moduleName) => `\\`${moduleName}\\``).join(', ');",
      "    const buildConfig = `${requirementObligationIds.map((id) => `// ${id}`).join('\\n')}\\nThisBuild / scalaVersion := \"2.12.18\"\\nThisBuild / libraryDependencies += \"org.scalatest\" %% \"scalatest\" % \"3.2.19\" % Test\\n${moduleProjects}\\nlazy val root = project.in(file(\".\")).aggregate(${aggregateRefs})\\n`; ",
      "    writeFileSync(buildPath, buildConfig, 'utf8');",
      "    const buildDigest = `sha256:${createHash('sha256').update(buildConfig, 'utf8').digest('hex')}`;",
      "    materializedFiles.push({ kind: 'sdlc_materialized_product_file', role: 'build_config', relativePath: 'build.sbt', absolutePath: buildPath, digest: buildDigest, byteCount: Buffer.byteLength(buildConfig, 'utf8'), requirementTraceObligationIds: requirementObligationIds });",
      "    const projectBuildPropertiesPath = path.join(manifest.productMaterialization.tenantRoot, 'project/build.properties');",
      "    mkdirSync(dirname(projectBuildPropertiesPath), { recursive: true });",
      "    const projectBuildProperties = 'sbt.version=1.9.9\\n';",
      "    writeFileSync(projectBuildPropertiesPath, projectBuildProperties, 'utf8');",
      "    const projectBuildPropertiesDigest = `sha256:${createHash('sha256').update(projectBuildProperties, 'utf8').digest('hex')}`;",
      "    materializedFiles.push({ kind: 'sdlc_materialized_product_file', role: 'build_config', relativePath: 'project/build.properties', absolutePath: projectBuildPropertiesPath, digest: projectBuildPropertiesDigest, byteCount: Buffer.byteLength(projectBuildProperties, 'utf8'), requirementTraceObligationIds: requirementObligationIds });",
      "  }",
      "}",
      "const declaredExecutionContract = typeof manifest.productMaterialization.testExecutionContract === 'string' && !['', 'undeclared', 'none', 'n/a', 'not_applicable'].includes(manifest.productMaterialization.testExecutionContract.trim().toLowerCase());",
      "const admitsExecutionEvidence = manifest.targetAssetType === 'test_execution_result_surface' || (manifest.targetAssetType === 'component_code_surface' && manifest.productMaterialization.required && declaredExecutionContract);",
      "if (admitsExecutionEvidence && manifest.productMaterialization.executionShards.length > 0) {",
      "  const reportPath = path.join(manifest.archiveRoot, manifest.targetAssetType === 'test_execution_result_surface' ? 'junit-report.xml' : 'component-code-execution-report.txt');",
      "  const report = manifest.targetAssetType === 'test_execution_result_surface' ? '<testsuite tests=\"1\" failures=\"0\"><testcase classname=\"cdme.CoreSpec\" name=\"provesCore\"/></testsuite>\\n' : 'component code execution succeeded\\n';",
      "  writeFileSync(reportPath, report, 'utf8');",
      "  const shardEvidence = manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'succeeded', reportRefs: [`file://${reportPath}`], testsObserved: 1, passedCount: 1, failedCount: 0 }));",
      "  executionEvidence = { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'succeeded', reportRefs: [`file://${reportPath}`], testsObserved: shardEvidence.length, passedCount: shardEvidence.length, failedCount: 0, shardEvidence };",
      "}",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const executionRefs = executionEvidence === null ? [] : executionEvidence.reportRefs;",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const materializedRequirementIdSet = new Set(requirementObligationIds);",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...materializedRefs, ...executionRefs, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'installed data_mapper source/test inventory worker output', unresolvedReasons: [], materializedFiles, executionEvidence, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeOutputSurface(manifest, title) {
  const content = [`# ${title}`, "", `edge: ${manifest.edgeName}`].join("\n");
  const artifact = `${content}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  return {
    digest: sha256Text(artifact),
    byteCount: Buffer.byteLength(artifact, "utf8")
  };
}

function writeReport(input) {
  const evidenceRefs = input.materializedFiles.map((file) => `file://${file.absolutePath}`);
  const outputRef = `file://${input.manifest.outputFile}`;
  writeFileSync(
    input.manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          input.manifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: input.manifest.graphFunctionName,
        edgeName: input.manifest.edgeName,
        targetAssetType: input.manifest.targetAssetType,
        outputFile: input.manifest.outputFile,
        digest: input.digest,
        summary: input.summary,
        unresolvedReasons: [],
        materializedFiles: input.materializedFiles,
        ...(input.executionEvidence === undefined
          ? {}
          : { executionEvidence: input.executionEvidence }),
        obligationAssessments: input.manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: evidenceRefs.length > 0 ? evidenceRefs : [outputRef],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function requirementObligationIds(manifest) {
  return manifest.traversalObligationContext.obligations
    .filter((obligation) => obligation.obligationKind === "requirement")
    .map((obligation) => obligation.obligationId);
}

function requirementTraceLines(manifest, commentPrefix = "//") {
  return requirementObligationIds(manifest).map(
    (obligationId) => `${commentPrefix} ${obligationId}`
  );
}

function retryContextForModule(input = {}) {
  const edgeName = input.edgeName ?? "derive_test_execution_result_surface";
  const targetAssetType = input.targetAssetType ?? "test_execution_result_surface";
  return {
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: [],
    priorGapDossiers: [
      {
        kind: "sdlc_postflight_gap_dossier",
        dossierVersion: "ts-gap-dossier-v1",
        graphFunctionName: "bootstrap_release_self_test",
        edgeName,
        vectorIndex: input.vectorIndex ?? 17,
        targetAssetType,
        status: "open",
        reasons: [
          {
            kind: "sdlc_postflight_gap_reason",
            reason: "module-scoped retry for cdme-compiler",
            reasonClass: "assurance",
            blockingReason: {
              kind: "sdlc_blocking_reason",
              code: "source_asset_dependency_missing",
              reasonClass: "assurance",
              lawfulReentryPoint: "same_edge_retry",
              message: "Retry narrows current closure pressure to admitted shard scope.",
              detail: "module=cdme-compiler",
              evidenceRefs: []
            }
          }
        ],
        evidenceRefs: [],
        priorManifestId: "manifest://t066/retry",
        currentGapDossierRef: "gap://t066/cdme-compiler",
        retryEligible: true,
        nextLawfulActions: ["retry_same_edge"]
      }
    ]
  };
}

test("T-066 code-surface handoff admits tenant-root product source materialization", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  assert.equal(constraints.activeTenant, "scala_spark");
  assert.equal(constraints.selectedOutputRoot, "build_tenants/scala_spark");
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t066-product-source"
  });
  writeHandoffFiles(manifest);

  assert.equal(manifest.productMaterialization.required, true);
  assert.equal(manifest.productMaterialization.activeTenant, "scala_spark");
  assert.deepStrictEqual(manifest.productMaterialization.requiredRoles, ["source"]);
  assert.equal(
    manifest.traversalObligationContext.obligations.some(
      (obligation) =>
        obligation.obligationKind === "requirement" &&
        obligation.summary.includes("REQ-T066-001") &&
        obligation.obligationId !== "requirement:REQ-T066-001"
    ),
    true
  );
  assert.equal(
    manifest.traversalObligationContext.obligations.some(
      (obligation) => obligation.obligationId === "target_asset:component_code_surface"
    ),
    true
  );
  assert.equal(
    manifest.traversalObligationContext.deltaSummary.requirementCount,
    1
  );
  assert.equal(
    manifest.allowedWriteRoots.includes(manifest.productMaterialization.tenantRoot),
    true
  );
  assert.equal(
    path.relative(workspace, manifest.outputFile).split(path.sep).join("/"),
    "build_tenants/scala_spark/design/component_code_surface.md"
  );

  const output = writeOutputSurface(manifest, "component_code_surface");
  const sourceContent = [
    ...requirementTraceLines(manifest),
    "package generated",
    "",
    "final case class DataMapper(value: String)"
  ].join("\n");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${sourceContent}\n`, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "source",
      relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
      absolutePath: productFile,
      digest: sha256Text(`${sourceContent}\n`),
      byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
      requirementTraceObligationIds: requirementObligationIds(manifest)
    }
  ];
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated product source under tenant root",
    materializedFiles
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  const constructorResult = constructorResultFromWorkerOutput({
    manifest,
    report,
    operationType: "generate"
  });

  assert.equal(postflight.status, "passed");
  assert.equal(readFileSync(productFile, "utf8"), `${sourceContent}\n`);
  assert.equal(
    postflight.evidenceRefs.includes(`file://${productFile}`),
    true
  );
  assert.equal(
    constructorResult.evidenceRefs.some(
      (ref) => ref.evidenceType === "installed_operator_materialized_product_source"
    ),
    true
  );
  assert.deepStrictEqual(constructorResult.generatedAssetContract.diagnostics, [
    "materialized_product_file_count:1"
  ]);
});

test("T-164 component-code postflight does not use F_D source-semantic gates", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t164-data-mapper-shallow-code"
  });
  writeHandoffFiles(manifest);

  const output = writeOutputSurface(manifest, "component_code_surface");
  const shallowSource = [
    ...requirementTraceLines(manifest),
    "package cdme.executor",
    "",
    "import cdme.compiler.CompilePlan",
    "",
    "trait SparkDataFrameHandle {",
    "  def name: String",
    "  def rowCount: Long",
    "}",
    "",
    "final case class ExecutionContext(runId: String, inputs: Map[String, SparkDataFrameHandle], outputRoute: String)",
    "final case class ExecutionTelemetry(runId: String, rowsRead: Long, rowsWritten: Long, errors: Vector[String])",
    "final case class ExecutionResult(context: ExecutionContext, telemetry: ExecutionTelemetry)",
    "",
    "object SparkPlanExecutor {",
    "  def execute(plan: CompilePlan, context: ExecutionContext): ExecutionResult = {",
    "    val rowsRead = context.inputs.values.map(_.rowCount).sum",
    "    val rowsWritten = math.max(0L, rowsRead - plan.morphisms.count(_.cardinality.max.contains(0)).toLong)",
    "    ExecutionResult(context, ExecutionTelemetry(context.runId, rowsRead, rowsWritten, Vector.empty))",
    "  }",
    "}"
  ].join("\n");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "cdme-executor/src/main/scala/cdme/executor/SparkPlanExecutor.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${shallowSource}\n`, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "source",
      relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
      absolutePath: productFile,
      digest: sha256Text(`${shallowSource}\n`),
      byteCount: Buffer.byteLength(`${shallowSource}\n`, "utf8"),
      requirementTraceObligationIds: requirementObligationIds(manifest)
    }
  ];
  writeReport({
    manifest,
    digest: output.digest,
    summary: "component code source fixture",
    materializedFiles
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.some((reason) =>
      reason.code.includes("semantic") || reason.code.includes("semantics")
    ),
    false,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});

test("T-172 no-dispatch surface postflight admits replayed materialization lineage", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("qualify_component_realization_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "qualify_component_realization_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t172-no-dispatch-replay-lineage"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(
    manifest,
    "component_realization_qualification_surface"
  );
  const productContent = [
    "// requirement:REQ-T066-001",
    "package generated",
    "final case class DataMapper(value: String)"
  ].join("\n") + "\n";
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, productContent, "utf8");
  const outputRef = pathToFileURL(manifest.outputFile).href;
  const report = {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: output.digest,
    summary: "framework no-dispatch qualification over replayed materialization lineage",
    unresolvedReasons: [],
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
        absolutePath: productFile,
        digest: sha256Text(productContent),
        byteCount: Buffer.byteLength(productContent, "utf8"),
        materializationSource: "replay",
        sourceManifestRef: "file:///prior/product_materialization_manifest.json",
        sourceHandoffManifestRef: "file:///prior/handoff_manifest.json",
        sourceAttemptRef: "attempt://prior-component-code",
        rolePolicyRef: "target-role-policy://odd-sdlc/implementation-design/source"
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
        evidenceRefs: [outputRef],
        blockingReasons: []
      })
    ),
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
  };

  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes(
      "unexpected_product_materialization_for_surface_edge"
    ),
    false
  );
});

test("T-158 worker read-boundary ignores regex pattern strings that begin with slash", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_scenario_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_scenario_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t158-worker-read-boundary-regex-pattern"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "scenario_surface");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "scenario surface",
    materializedFiles: []
  });
  writeFileSync(
    path.join(manifest.archiveRoot, "worker_stdout.log"),
    JSON.stringify({
      type: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            id: "toolu_boundary_grep",
            name: "Grep",
            input: {
              pattern: "/ requirement:.*req_trv_005_a",
              path: path.join(workspace, "build_tenants/scala_spark")
            }
          }
        ]
      }
    }) + "\n",
    "utf8"
  );

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  const authorityReason = postflight.blockingReasons.find((reason) =>
    reason.startsWith("worker_authority_read_outside_workspace:")
  );

  assert.equal(authorityReason, undefined);
});

test("T-159 worker read-boundary ignores executor persisted output metadata", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_scenario_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_scenario_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t159-worker-read-boundary-runtime-metadata"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "scenario_surface");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "scenario surface",
    materializedFiles: []
  });
  writeFileSync(
    path.join(manifest.archiveRoot, "worker_stdout.log"),
    JSON.stringify({
      type: "user",
      tool_use_result: {
        type: "text",
        persistedOutputPath:
          "/Users/jim/.claude/projects/-Users-jim-src-apps-odd-sdlc/tool-results/toolu_false_positive.txt",
        file: {
          filePath: output.path
        }
      }
    }) + "\n",
    "utf8"
  );

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  const authorityReason = postflight.blockingReasons.find((reason) =>
    reason.startsWith("worker_authority_read_outside_workspace:")
  );

  assert.equal(postflight.status, "passed");
  assert.equal(authorityReason, undefined);
});

test("T-164 worker read-boundary ignores executor session tool-result metadata", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_scenario_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_scenario_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t164-worker-read-boundary-executor-session-metadata"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "scenario_surface");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "scenario surface",
    materializedFiles: []
  });
  const sessionId = "session-runtime-cache-001";
  const toolResultCachePath =
    `/Users/jim/.executor-runtime/projects/current/${sessionId}/tool-results/toolu_large_output.txt`;
  writeFileSync(
    path.join(manifest.archiveRoot, "worker_stdout.log"),
    [
      JSON.stringify({
        type: "system",
        subtype: "init",
        session_id: sessionId
      }),
      JSON.stringify({
        type: "assistant",
        message: {
          content: [
            {
              type: "tool_use",
              id: "toolu_boundary_read_tool_result",
              name: "Read",
              input: {
                file_path: toolResultCachePath
              }
            }
          ]
        }
      }),
      JSON.stringify({
        type: "user",
        tool_use_result: {
          type: "text",
          file: {
            filePath: toolResultCachePath
          }
        }
      })
    ].join("\n") + "\n",
    "utf8"
  );

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  const authorityReason = postflight.blockingReasons.find((reason) =>
    reason.startsWith("worker_authority_read_outside_workspace:")
  );

  assert.equal(postflight.status, "passed");
  assert.equal(authorityReason, undefined);
});

test("T-171 product materialization permits auxiliary build config without requirement lineage", () => {
  const workspace = makeWorkspace();
  declareScalaSbtTestRunner(workspace);
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["project/"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t171-aux-build-config-lineage-not-required"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const requirementIds = requirementObligationIds(manifest);
  assert(requirementIds.length > 0);
  const sourceContent = [
    ...requirementTraceLines(manifest),
    "package generated",
    "",
    "object DataMapper"
  ].join("\n");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${sourceContent}\n`, "utf8");
  const buildProperties = "sbt.version=1.9.8\n";
  const buildPropertiesFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "project/build.properties"
  );
  mkdirSync(dirname(buildPropertiesFile), { recursive: true });
  writeFileSync(buildPropertiesFile, buildProperties, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated source with untraced auxiliary build support",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(
          manifest.productMaterialization.tenantRoot,
          productFile
        ),
        absolutePath: productFile,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      },
      {
        kind: "sdlc_materialized_product_file",
        role: "build_config",
        relativePath: path.relative(
          manifest.productMaterialization.tenantRoot,
          buildPropertiesFile
        ),
        absolutePath: buildPropertiesFile,
        digest: sha256Text(buildProperties),
        byteCount: Buffer.byteLength(buildProperties, "utf8"),
        requirementTraceObligationIds: []
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.equal(
    postflight.blockingReasons.includes(
      "materialized_product_requirement_lineage_missing"
    ),
    false,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});

test("T-159 product materialization admits source with requirement lineage in file and row", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t159-product-source-lineage-present"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const requirementTags = [
    ...new Set(
      manifest.traversalObligationContext.obligations.flatMap((obligation) => {
        if (obligation.obligationKind !== "requirement") {
          return [];
        }
        const match = /^Fulfill ([^:]+):/u.exec(obligation.summary);
        return match?.[1] === undefined ? [] : [match[1]];
      })
    )
  ];
  assert(requirementTags.length > 0);
  const sourceContent = [
    ...requirementTags.map((tag) => `// Implements: ${tag}`),
    "package generated",
    "",
    "object DataMapper"
  ].join("\n");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${sourceContent}\n`, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated source carries requirement lineage",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
        absolutePath: productFile,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8")
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  writeProductMaterializationManifest({ manifest, report });
  const materializationManifest = JSON.parse(
    readFileSync(manifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.equal(materializationManifest.files.length, 1);
  assert(
    materializationManifest.files[0].requirementTraceObligationIds.length > 0
  );
  assert.equal(
    materializationManifest.files[0].materializationSource,
    "current_attempt"
  );
});

test("T-159 product materialization canonicalizes duplicate requirement authorities", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "REQ-T066-001: Bootstrap source for the same logical product requirement."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/00-imported-sources.md"),
    [
      "# Imported Sources",
      "",
      "## Source Refs",
      "",
      "- workspace://bootstrap.md",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T066-001"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/README.md"),
    [
      "# Requirements",
      "",
      "- `REQ-T066-001` - index row for the same logical requirement"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "- requirement authority preserves every keyed REQ-T066-00x identifier",
      "- declared source file: build_tenants/scala_spark/src/main/scala/generated/DataMapper.scala"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t159-product-lineage-canonical-authority"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const rawRequirementIds = requirementObligationIds(manifest);

  assert(rawRequirementIds.length > invocationPackage.requirementTraceObligationIds.length);
  assert.equal(
    rawRequirementIds.some((id) => id.endsWith(".product.req_t066")),
    false
  );
  assert.deepEqual(invocationPackage.requirementTraceObligationIds, [
    "requirement:t066_product_materialization.stage_01_fixture.req_t066_001"
  ]);

  const output = writeOutputSurface(manifest, "component_code_surface");
  const sourceContent = [
    ...invocationPackage.requirementTraceObligationIds.map((id) => `// ${id}`),
    "package generated",
    "",
    "object DataMapper"
  ].join("\n");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${sourceContent}\n`, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated source is assessed against duplicate authority refs",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
        absolutePath: productFile,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8")
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  writeProductMaterializationManifest({ manifest, report });
  const materializationManifest = JSON.parse(
    readFileSync(manifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.deepEqual(
    materializationManifest.files[0].requirementTraceObligationIds,
    invocationPackage.requirementTraceObligationIds
  );
});

test("T-164 post-transform closes duplicate requirement aliases from canonical trace", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "### REQ-T066-001 Source Contract",
      "",
      "The generated source shall satisfy the same logical requirement."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/00-imported-sources.md"),
    [
      "# Imported Sources",
      "",
      "## Source Refs",
      "",
      "- workspace://bootstrap.md",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T066-001"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t164-post-transform-duplicate-requirement-alias"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeOutputSurface(manifest, "component_code_surface");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  const source = [
    ...invocationPackage.requirementTraceObligationIds.map(
      (id) => `// requirement:${id}`
    ),
    "package generated",
    "object DataMapper"
  ].join("\n");
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${source}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const requirementAssessments = report.obligationAssessments.filter((assessment) =>
    assessment.obligationId.startsWith("requirement:")
  );
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(requirementAssessments.length > invocationPackage.requirementTraceObligationIds.length, true);
  assert.equal(
    requirementAssessments.every(
      (assessment) => assessment.fulfillmentStatus === "fulfilled"
    ),
    true,
    JSON.stringify(requirementAssessments, null, 2)
  );
  assert.deepEqual(
    report.materializedFiles[0].requirementTraceObligationIds,
    invocationPackage.requirementTraceObligationIds
  );
  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
});

test("T-164 post-transform observation excludes tenant stack authority specs from component product files", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t164-tenant-stack-authority-not-component-product"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_code_surface");
  const specRoot = path.join(manifest.productMaterialization.tenantRoot, "spec");
  mkdirSync(specRoot, { recursive: true });
  writeFileSync(
    path.join(specRoot, "TECH_STACK.json"),
    `${JSON.stringify(
      {
        language: "scala",
        buildTool: "sbt",
        cleanupRules: [".tool-cache/", "project/.sbtboot/"],
        toolEnvironment: {
          workspaceLocalDirectories: [".tool-cache/"]
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(specRoot, "TESTING_TECH_STACK.json"),
    `${JSON.stringify({ testRunner: "sbt test" }, null, 2)}\n`,
    "utf8"
  );
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(
    sourcePath,
    [
      "// requirement:requirement:REQ-T066-001",
      "package generated",
      "object DataMapper"
    ].join("\n") + "\n",
    "utf8"
  );
  const cachePath = path.join(
    manifest.productMaterialization.tenantRoot,
    ".tool-cache/cache.bin"
  );
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, "tool cache byproduct\n", "utf8");
  const fallbackBootPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "project/.sbtboot/java9-rt-ext/rt.jar"
  );
  mkdirSync(dirname(fallbackBootPath), { recursive: true });
  writeFileSync(fallbackBootPath, "fallback boot byproduct\n", "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const relativePaths = report.materializedFiles.map((file) => file.relativePath);

  assert.equal(relativePaths.includes("spec/TECH_STACK.json"), false);
  assert.equal(relativePaths.includes("spec/TESTING_TECH_STACK.json"), false);
  assert.equal(relativePaths.includes(".tool-cache/cache.bin"), false);
  assert.equal(
    relativePaths.includes("project/.sbtboot/java9-rt-ext/rt.jar"),
    false
  );
  assert.equal(
    relativePaths.includes("src/main/scala/generated/DataMapper.scala"),
    true
  );
});

test("T-164 execution shards project tenant-declared byproduct rules", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const specRoot = path.join(workspace, constraints.selectedOutputRoot, "spec");
  mkdirSync(specRoot, { recursive: true });
  writeFileSync(
    path.join(specRoot, "TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        cleanupRules: ["project/.sbtboot/", ".tool-cache/"],
        testingTechStack: {
          cleanupRules: ["project/.boot/"],
          toolEnvironment: {
            workspaceLocalDirectories: ["project/.ivy/"]
          }
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t164-tenant-byproduct-shards"
  });
  const shard = manifest.productMaterialization.executionShards[0];

  assert.notEqual(shard, undefined);
  assert.deepEqual(
    shard.allowedByproductGlobs.filter((glob) =>
      [
        ".tool-cache/**",
        "project/.boot/**",
        "project/.ivy/**",
        "project/.sbtboot/**"
      ].includes(glob)
    ),
    [
      ".tool-cache/**",
      "project/.boot/**",
      "project/.ivy/**",
      "project/.sbtboot/**"
    ]
  );
});

test("T-164 Rust service fixture declares Cargo byproducts in tenant stack authority", () => {
  const stackSpecFile = path.join(
    PACKAGE_ROOT,
    "test_env/fixtures/t164_rust_hello_service_lite/build_tenants/hello_world_rust_service/spec/TECH_STACK.json"
  );
  const stackSpec = JSON.parse(readFileSync(stackSpecFile, "utf8"));

  assert.deepStrictEqual(stackSpec.byproductRules, ["Cargo.lock", "target/"]);
  assert.deepStrictEqual(stackSpec.testingTechStack.byproductRules, [
    "Cargo.lock",
    "target/"
  ]);
});

test("T-164 product lineage admits full requirement set beyond prompt slice", () => {
  const workspace = makeWorkspace();
  const requirements = Array.from({ length: 90 }, (_, index) => {
    const n = `${index + 1}`.padStart(3, "0");
    return `REQ-T066-${n}: Generated source must carry full lineage marker ${n}.`;
  });
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    ["# Requirements", "", ...requirements].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t164-product-lineage-full-requirement-set"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const allRequirementIds = requirementObligationIds(manifest);
  const requirementIdOutsidePrompt = allRequirementIds.find(
    (id) => !invocationPackage.requirementTraceObligationIds.includes(id)
  );

  assert(allRequirementIds.length > invocationPackage.requirementTraceObligationIds.length);
  assert(requirementIdOutsidePrompt);

  const output = writeOutputSurface(manifest, "component_code_surface");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  const source = [
    ...allRequirementIds.map((id) => `// ${id}`),
    "package generated",
    "object DataMapper"
  ].join("\n");
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, `${source}\n`, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated source carries full requirement lineage beyond prompt slice",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
        absolutePath: productFile,
        digest: sha256Text(`${source}\n`),
        byteCount: Buffer.byteLength(`${source}\n`, "utf8")
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  writeProductMaterializationManifest({ manifest, report });
  const materializationManifest = JSON.parse(
    readFileSync(manifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert(
    materializationManifest.files[0].requirementTraceObligationIds.includes(
      requirementIdOutsidePrompt
    )
  );
});

test("T-159 placeholder requirement markers are not promoted into product lineage obligations", () => {
  const workspace = makeWorkspace();
  const placeholderContent = [
    "# Requirements",
    "",
    "- 01-t066-requirements.md - keyed REQ-T066-NNN requirements are projected during induction.",
    "- example placeholder REQ-XXX-001 must not become authority.",
    "- example placeholder REQ-TBD-001 must not become authority."
  ].join("\n");
  writeFileSync(
    path.join(workspace, "specification/requirements/README.md"),
    placeholderContent,
    "utf8"
  );
  const sourceInput = deriveSdlcSourceInput({
    uri: "workspace://specification/requirements/README.md",
    relativePath: "specification/requirements/README.md",
    content: placeholderContent
  });

  assert.deepEqual(
    sourceInput.authorityMarkers.filter((marker) => marker.startsWith("REQ-")),
    []
  );

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t159-placeholder-requirement-markers"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const rawRequirementIds = requirementObligationIds(manifest);

  assert(
    rawRequirementIds.some((id) => id.endsWith(".stage_01_fixture.req_t066_001")),
    rawRequirementIds.join("\n")
  );
  assert.equal(
    rawRequirementIds.some((id) => /(?:nnn|xxx|tbd)/u.test(id)),
    false,
    rawRequirementIds.join("\n")
  );
  assert.deepEqual(invocationPackage.requirementTraceObligationIds, [
    "requirement:t066_product_materialization.stage_01_fixture.req_t066_001"
  ]);
});

test("T-159 conformance assessments do not add raw display-id duplicates", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "REQ-T066-001: Bootstrap source for the same logical product requirement."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/00-imported-sources.md"),
    [
      "# Imported Sources",
      "",
      "## Source Refs",
      "",
      "- workspace://bootstrap.md",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T066-001"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName(FG_CONFORM_PROJECT_AUTHORITY);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: FG_CONFORM_PROJECT_AUTHORITY,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t159-conformance-no-raw-display-duplicates"
  });
  const requirementIds = requirementObligationIds(manifest);
  assert(
    requirementIds.some((id) => id.endsWith(".stage_01_fixture.req_t066_001")),
    requirementIds.join("\n")
  );
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# Project Authority",
      "",
      "## Requirement Trace Register",
      "",
      "- REQ-T066-001"
    ].join("\n"),
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const assessedRequirementIds = report.obligationAssessments
    .map((assessment) => assessment.obligationId)
    .filter((id) => id.startsWith("requirement:"));

  assert.equal(
    assessedRequirementIds.includes("requirement:REQ-T066-001"),
    false,
    assessedRequirementIds.join("\n")
  );
  assert(
    assessedRequirementIds.some((id) => id.endsWith(".stage_01_fixture.req_t066_001")),
    assessedRequirementIds.join("\n")
  );
});

test("T-159 authority conformance carries unobserved requirements instead of retrying same edge", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName(FG_CONFORM_PROJECT_AUTHORITY);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: FG_CONFORM_PROJECT_AUTHORITY,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t159-conformance-carries-requirements"
  });
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  writeOutputSurface(manifest, "Project Authority");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const requirementAssessment = report.obligationAssessments.find((assessment) =>
    assessment.obligationId.endsWith(".stage_01_fixture.req_t066_001")
  );
  assert(requirementAssessment);
  assert.equal(requirementAssessment.fulfillmentStatus, "partial");
  assert(
    requirementAssessment.blockingReasons.some((reason) =>
      reason.startsWith("requirement_carried_for_downstream_closure:")
    ),
    JSON.stringify(requirementAssessment.blockingReasons)
  );

  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");

  const gate = deriveSdlcOperatorAssuranceGate({ manifest, report, postflight });
  assert.equal(gate.satisfaction.status, "close_allowed");
  assert.equal(gate.blockingPostflight ?? null, null);

  const evaluation = constructSdlcFpEvaluateResult({
    manifest,
    selectedComposition: selectedCompositionForManifest(manifest),
    report,
    postflight
  });
  assert.equal(evaluation.postflightStatus, "passed");
  assert.equal(evaluation.status, "admitted_with_open_obligations");
  assert.equal(evaluation.obligationAssessmentCounts.blocked, 0);
  assert.equal(evaluation.obligationAssessmentCounts.partial > 0, true);
});

test("T-171 non-materialized F_P surfaces carry unobserved requirement pressure instead of retrying same edge", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T066-001: Intent surface must preserve the first requirement.",
      "REQ-T066-002: Intent surface must carry downstream pressure for later closure."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["Cargo.toml"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_intent_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t171-intent-carries-unobserved-requirements"
  });
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# Intent Surface",
      "",
      "## Requirement Trace Register",
      "",
      "- REQ-T066-001"
    ].join("\n") + "\n",
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const firstRequirement = report.obligationAssessments.find((assessment) =>
    assessment.obligationId.endsWith(".stage_01_fixture.req_t066_001")
  );
  const secondRequirement = report.obligationAssessments.find((assessment) =>
    assessment.obligationId.endsWith(".stage_01_fixture.req_t066_002")
  );
  assert(firstRequirement);
  assert(secondRequirement);
  assert.equal(firstRequirement.fulfillmentStatus, "fulfilled");
  assert.equal(secondRequirement.fulfillmentStatus, "partial");
  assert(
    secondRequirement.blockingReasons.some((reason) =>
      reason.startsWith("requirement_carried_for_downstream_closure:")
    ),
    JSON.stringify(secondRequirement.blockingReasons)
  );
  assert.equal(
    sdlcAssessmentCarriesRequirementForDownstreamClosure(secondRequirement),
    true
  );
  const edgeFulfillment = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      firstRequirement.obligationId,
      secondRequirement.obligationId
    ],
    assessments: [firstRequirement, secondRequirement].map((assessment) => ({
      obligationId: assessment.obligationId,
      fulfillmentStatus: assessment.fulfillmentStatus,
      evidenceRefs: assessment.evidenceRefs,
      ...(sdlcAssessmentCarriesRequirementForDownstreamClosure(assessment)
        ? {
            carryDirection: "downstream_transformation_set",
            downstreamGraphFunctionRefs: [
              "graph-function://odd-sdlc/materialize_declared_product_asset"
            ],
            targetBindingRefs: [
              "target-binding://odd-sdlc/materialized-product"
            ]
          }
        : {})
    }))
  });
  assert.deepEqual(edgeFulfillment.counts, {
    expected: 1,
    fulfilled: 1,
    partial: 0,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.equal(edgeFulfillment.downstreamTransformationSetRefs.length, 1);
  assert.equal(edgeFulfillment.nonConvergedReasonRefs.length, 0);

  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));

  const gate = deriveSdlcOperatorAssuranceGate({ manifest, report, postflight });
  assert.equal(gate.satisfaction.status, "close_allowed");
  assert.equal(gate.blockingPostflight ?? null, null);

  const evaluation = constructSdlcFpEvaluateResult({
    manifest,
    selectedComposition: selectedCompositionForManifest(manifest),
    report,
    postflight
  });
  assert.equal(evaluation.postflightStatus, "passed");
  assert.equal(evaluation.status, "admitted_with_open_obligations");
  assert.equal(evaluation.obligationAssessmentCounts.blocked, 0);
  assert.equal(evaluation.obligationAssessmentCounts.partial > 0, true);
});

test("T-159 workspace imported-source refs expand before downstream traversal", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "REQ-T066-001: Build the CLI source from bootstrap authority."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/00-imported-sources.md"),
    [
      "# Imported Sources",
      "",
      "## Source Refs",
      "",
      "- workspace://bootstrap.md",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T066-001"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_feature_decomp_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 1,
    contract,
    projectConstraints: constraints,
    runId: "t159-workspace-imported-source-refs"
  });

  assert.equal(
    manifest.traversalObligationContext.obligations.some(
      (obligation) =>
        obligation.obligationId.includes("stage_00_imported_sources")
    ),
    false,
    JSON.stringify(
      manifest.traversalObligationContext.obligations.map(
        (obligation) => obligation.obligationId
      ),
      null,
      2
    )
  );
  assert(
    manifest.traversalObligationContext.obligations.some(
      (obligation) => obligation.obligationId.includes(".bootstrap.")
    )
  );
  assert.doesNotThrow(() => writeHandoffFiles(manifest));
});

test("T-158 F_P.evaluate keeps report admission distinct from open obligation closure", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t158-fp-evaluate-open-obligation"
  });
  const output = writeOutputSurface(manifest, "component_code_surface");
  const report = {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: output.digest,
    summary: "valid report admission with an open obligation",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: null,
    obligationAssessments: [
      {
        kind: "sdlc_worker_obligation_assessment",
        obligationId:
          manifest.traversalObligationContext.obligations[0]?.obligationId ??
          "obligation://t158/open",
        fulfillmentStatus: "blocked",
        evidenceRefs: [`file://${manifest.outputFile}`],
        blockingReasons: ["requires follow-on repair"]
      }
    ]
  };
  const postflight = {
    kind: "sdlc_operator_postflight_result",
    status: "passed",
    blockingReasons: [],
    blockingReasonCarriers: [],
    evidenceRefs: [`file://${manifest.outputFile}`]
  };

  const result = constructSdlcFpEvaluateResult({
    manifest,
    selectedComposition: selectedCompositionForManifest(manifest),
    report,
    postflight
  });

  assert.equal(result.postflightStatus, "passed");
  assert.equal(result.status, "admitted_with_open_obligations");
  assert.equal(result.obligationAssessmentCounts.blocked, 1);
});

test("T-002 component-code materialization ignores tenant-declared build execution byproducts", () => {
  const workspace = makeWorkspace();
  declareScalaSbtTestRunner(workspace);
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["project/"],
    byproductRules: ["target/", ".bsp/"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t002-component-code-byproduct-filter"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_code_surface");
  const sourceRelativePath = "src/main/scala/generated/DataMapper.scala";
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    sourceRelativePath
  );
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(
    sourcePath,
    [
      ...requirementTraceLines(manifest),
      "package generated",
      "",
      "final case class Generated(value: String)"
    ].join("\n") + "\n",
    "utf8"
  );
	const byproductPaths = [
		".ai-workspace/runtime/odd_sdlc/operator-runs/t002-component-code-byproduct-filter/sbt-boot/sbt.boot.lock",
		".ai-workspace/runtime/odd_sdlc/operator-runs/t002-component-code-byproduct-filter/sbt-global/1.0/zinc/org.scala-sbt/rt.jar",
		"target/debug/.cargo-lock",
		"target/debug/incremental/generated.lock",
		".bsp/sbt.json"
	];
  for (const relativePath of byproductPaths) {
    const absolutePath = path.join(
      manifest.productMaterialization.tenantRoot,
      relativePath
    );
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(
      absolutePath,
      relativePath.endsWith(".lock") ? "" : "build-tool byproduct\n",
      "utf8"
    );
  }
  const sbtProjectRelativePath = "project/build.properties";
  const sbtProjectFile = path.join(
    manifest.productMaterialization.tenantRoot,
    sbtProjectRelativePath
  );
  mkdirSync(dirname(sbtProjectFile), { recursive: true });
  writeFileSync(
    sbtProjectFile,
    [...requirementTraceLines(manifest, "#"), "sbt.version=1.10.7"].join("\n") + "\n",
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });

  assert.deepStrictEqual(
    report.materializedFiles.map((file) => file.relativePath),
    [sbtProjectRelativePath, sourceRelativePath]
  );
  assert.equal(report.materializedFiles[0].role, "build_config");
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
});

test("T-159 post-transform assessments do not flatten every requirement onto every product file", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T066-001: Generate the main source file.",
      "REQ-T066-002: Generate the helper source file."
    ].join("\n"),
    "utf8"
  );
  rmSync(path.join(workspace, ".ai-workspace/runtime"), {
    recursive: true,
    force: true
  });
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const implementationDesignFile = path.join(
    workspace,
    constraints.selectedOutputRoot,
    "design/adrs/ADR-002-implementation-design-surface.md"
  );
  const implementationDesignRegister = JSON.parse(
    readFileSync(implementationDesignFile, "utf8")
  );
  implementationDesignRegister.fileTargetRows = [
    ...implementationDesignRegister.fileTargetRows,
    {
      kind: "sdlc_file_target_row",
      relativePath: "src/main/scala/generated/Helper.scala",
      role: "source"
    }
  ];
  implementationDesignRegister.componentTopologyRows = [
    ...implementationDesignRegister.componentTopologyRows,
    {
      kind: "sdlc_component_topology_row",
      componentId: "generated-helper",
      moduleName: "generated",
      relativePath: "src/main/scala/generated/Helper.scala",
      publicBoundary: "Helper",
      concernRole: "mapper",
      requirementIds: ["REQ-T066-002"],
      sourceAssetRefs: ["fixture://t066/helper"]
    }
  ];
  implementationDesignRegister.componentRealizationRows = [
    ...implementationDesignRegister.componentRealizationRows,
    {
      kind: "sdlc_component_realization_row",
      componentId: "generated-helper",
      moduleName: "generated",
      relativePath: "src/main/scala/generated/Helper.scala",
      publicBoundary: "Helper",
      trancheId: null,
      firstProductFileToChange: "src/main/scala/generated/Helper.scala",
      upstreamComponentIds: [],
      requirementIds: ["REQ-T066-002"],
      sourceAssetRefs: ["fixture://t066/helper"]
    }
  ];
  writeFileSync(
    implementationDesignFile,
    `${JSON.stringify(implementationDesignRegister, null, 2)}\n`,
    "utf8"
  );
  writeAdmittedImplementationDesignArchive({
    workspaceRoot: workspace,
    register: implementationDesignRegister,
    outputContent: `${JSON.stringify(implementationDesignRegister, null, 2)}\n`
  });
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t159-post-transform-lineage-not-flattened"
  });
  const requirementIds = requirementObligationIds(manifest);
  const mainRequirement = requirementIds.find((id) => id.endsWith("req_t066_001"));
  const helperRequirement = requirementIds.find((id) => id.endsWith("req_t066_002"));
  assert(mainRequirement);
  assert(helperRequirement);
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_code_surface");
  const mainRelativePath = "src/main/scala/generated/DataMapper.scala";
  const helperRelativePath = "src/main/scala/generated/Helper.scala";
  const mainPath = path.join(manifest.productMaterialization.tenantRoot, mainRelativePath);
  const helperPath = path.join(
    manifest.productMaterialization.tenantRoot,
    helperRelativePath
  );
  const mainContent = [`// ${mainRequirement}`, "package generated", "object DataMapper"].join("\n");
  const helperContent = [
    `// ${helperRequirement}`,
    "package generated",
    "object Helper"
  ].join("\n");
  mkdirSync(dirname(mainPath), { recursive: true });
  writeFileSync(mainPath, `${mainContent}\n`, "utf8");
  writeFileSync(helperPath, `${helperContent}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  writeProductMaterializationManifest({ manifest, report });
  const materializationManifest = JSON.parse(
    readFileSync(manifest.productMaterialization.manifestFile, "utf8")
  );
  const byPath = new Map(
    materializationManifest.files.map((file) => [
      file.relativePath,
      file.requirementTraceObligationIds
    ])
  );

  const mainPathRequirements = byPath.get(mainRelativePath) ?? [];
  const helperPathRequirements = byPath.get(helperRelativePath) ?? [];
  assert.equal(mainPathRequirements.length, 1);
  assert.equal(helperPathRequirements.length, 1);
  assert.equal(mainPathRequirements[0].endsWith("req_t066_001"), true);
  assert.equal(helperPathRequirements[0].endsWith("req_t066_002"), true);
  assert.notDeepEqual(mainPathRequirements, helperPathRequirements);
  assert.equal(
    report.obligationAssessments
      .find((assessment) => assessment.obligationId === mainPathRequirements[0])
      ?.evidenceRefs.includes(`file://${helperPath}`),
    false
  );
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
});

test("T-004 design edges write tenant-local design surfaces instead of runtime asset files", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 4,
    contract,
    projectConstraints: constraints,
    runId: "t004-design-surface-placement"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.equal(manifest.productMaterialization.required, false);
  assert.equal(
    path.relative(workspace, manifest.outputFile).split(path.sep).join("/"),
    "build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
  );
  assert.equal(
    manifest.allowedWriteRoots.includes(manifest.productMaterialization.tenantRoot),
    true
  );
  assert.match(prompt, /tenant-local SDLC surface/u);
  assert.match(prompt, /design\/adrs\/ADR-002-implementation-design-surface\.md/u);
  assert.match(prompt, /Status:, Implements:, Derives from:, Supersedes:, Superseded by:/u);
});

test("T-144 ADR field grammar is worker context, not a postflight FD gate", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 4,
    contract,
    projectConstraints: constraints,
    runId: "t004-adr-field-validation"
  });
  writeHandoffFiles(manifest);
  const incompleteContent = readFileSync(manifest.outputFile, "utf8");
  const incomplete = { digest: sha256Text(incompleteContent) };
  writeReport({
    manifest,
    digest: incomplete.digest,
    summary: "generated ADR path without ADR fields",
    materializedFiles: []
  });
  const advisory = evaluateSdlcComputeStage({
    manifest,
    report: readWorkerResultReport(manifest)
  });
  assert.equal(advisory.status, "passed", JSON.stringify(advisory.blockingReasons));
  assert.equal(
    advisory.blockingReasons.includes("adr_output_required_field_missing:Status"),
    false
  );

  const adr = [
    "# ADR-002 Implementation Design Surface",
    "",
    "| Field | Value |",
    "|-------|-------|",
    "| `Status:` | `active` |",
    "| `Implements:` | REQ-T066-001 |",
    "| `Derives from:` | bootstrap_release_self_test / derive_implementation_design_surface |",
    "| `Supersedes:` | none |",
    "| `Superseded by:` | none |",
    "| `Retained special case:` | none |",
    "",
    "## Context",
    "",
    "Tenant-local implementation design must live under design/adrs.",
    "",
    "## Decision",
    "",
    "Write the implementation design decision into the tenant ADR folder.",
    "",
    "## Module Boundary",
    "",
    "- Module: `scala_spark`",
    "- Public boundary: `src/main/scala/generated/App.scala`",
    "- Component: `scala_spark.app`",
    "",
    "## Product File Targets",
    "",
    "| Path | Role |",
    "| ---- | ---- |",
    "| `build_tenants/scala_spark/src/main/scala/generated/App.scala` | source |",
    "",
    "## Requirement Lineage",
    "",
    "| Requirement | Owning Component | Realization File |",
    "| ----------- | ---------------- | ---------------- |",
    "| REQ-T066-001 | scala_spark.app | `build_tenants/scala_spark/src/main/scala/generated/App.scala` |",
    "",
    `Prior skeleton digest: ${sha256Text(incompleteContent)}`
  ].join("\n");
  writeFileSync(manifest.outputFile, `${adr}\n`, "utf8");
  writeReport({
    manifest,
    digest: sha256Text(`${adr}\n`),
    summary: "generated ADR path with ADR fields",
    materializedFiles: []
  });
  const passed = evaluateSdlcComputeStage({
    manifest,
    report: readWorkerResultReport(manifest)
  });
  assert.equal(passed.status, "passed");
});

test("T-158 product materialization repair replays prior same-edge manifest", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000000000Z_pid158"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(firstManifest, "component_code_surface");
  const sourcePath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  const firstRequirementIds = requirementObligationIds(firstManifest);
  assert(firstRequirementIds.length > 0);
  const sourceContent = [
    ...firstRequirementIds.map((id) => `// Implements: ${id}`),
    "package example",
    "",
    "object Example {",
    "  def value: String = \"ok\"",
    "}"
  ].join("\n");
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "initial product source materialization",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main/scala/generated/DataMapper.scala",
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8")
      }
    ]
  });
  const firstReport = readWorkerResultReport(firstManifest);
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: firstReport
  });

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000100000Z_pid158"
  });
  writeHandoffFiles(repairManifest);
  const repairOutput = writeOutputSurface(
    repairManifest,
    "component_code_surface_trace_repair"
  );
  writeReport({
    manifest: repairManifest,
    digest: repairOutput.digest,
    summary: "trace-only repair with no product rewrite",
    materializedFiles: []
  });

  const repairReport = readWorkerResultReport(repairManifest);
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });
  writeProductMaterializationManifest({
    manifest: repairManifest,
    report: repairReport
  });
  const replayedManifest = JSON.parse(
    readFileSync(repairManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_files_missing"),
    false
  );
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_role_missing:source"),
    false
  );
  assert.equal(replayedManifest.files.length, 1);
  assert.equal(replayedManifest.files[0].materializationSource, "replay");
  assert.match(replayedManifest.files[0].rolePolicyRef, /^target-role-policy:\/\//u);
  assert.equal(
    replayedManifest.files[0].sourceManifestRef,
    `file://${firstManifest.productMaterialization.manifestFile}`
  );
  assert.equal(
    replayedManifest.replay.lineageRefs.includes(
      `file://${firstManifest.productMaterialization.manifestFile}`
    ),
    true
  );
});

test("T-171 product materialization repair admits current bytes over stale replay digest", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000000000Z_pid171"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(firstManifest, "component_code_surface");
  const sourcePath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  const requirementIds = requirementObligationIds(firstManifest);
  assert(requirementIds.length > 0);
  const firstSourceContent = [
    ...requirementIds.map((id) => `// Implements: ${id}`),
    "package example",
    "",
    "object Example {",
    "  def value: String = \"first\"",
    "}"
  ].join("\n") + "\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, firstSourceContent, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "initial product source materialization",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main/scala/generated/DataMapper.scala",
        absolutePath: sourcePath,
        digest: sha256Text(firstSourceContent),
        byteCount: Buffer.byteLength(firstSourceContent, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });

  const repairedSourceContent = [
    ...requirementIds.map((id) => `// Implements: ${id}`),
    "package example",
    "",
    "object Example {",
    "  def value: String = \"repaired\"",
    "}"
  ].join("\n") + "\n";
  writeFileSync(sourcePath, repairedSourceContent, "utf8");
  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000100000Z_pid171"
  });
  writeHandoffFiles(repairManifest);
  const before = snapshotProductMaterializationRoot(
    repairManifest.productMaterialization
  );
  writeOutputSurface(repairManifest, "component_code_surface_trace_repair");

  const repairReport = buildPostTransformWorkerResultReport({
    manifest: repairManifest,
    before
  });
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });
  writeProductMaterializationManifest({
    manifest: repairManifest,
    report: repairReport
  });
  const materializationManifest = JSON.parse(
    readFileSync(repairManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(repairReport.materializedFiles.length, 1);
  assert.equal(repairReport.materializedFiles[0].materializationSource, "current_attempt");
  assert.equal(repairReport.materializedFiles[0].digest, sha256Text(repairedSourceContent));
  assert.match(
    repairReport.materializedFiles[0].overwritesMaterializationRef,
    /^materialized-product-file:\/\/odd-sdlc\//u
  );
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_digest_mismatch"),
    false
  );
  assert.equal(materializationManifest.files[0].materializationSource, "current_attempt");
  assert.equal(materializationManifest.files[0].digest, sha256Text(repairedSourceContent));
  materializationManifest.files[0] = {
    ...materializationManifest.files[0],
    materializationSource: "replay"
  };
  writeFileSync(
    repairManifest.productMaterialization.manifestFile,
    `${JSON.stringify(materializationManifest, null, 2)}\n`,
    "utf8"
  );

  const followupManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000200000Z_pid171"
  });
  writeHandoffFiles(followupManifest);
  const followupBefore = snapshotProductMaterializationRoot(
    followupManifest.productMaterialization
  );
  writeOutputSurface(followupManifest, "component_code_surface_trace_repair_followup");
  const followupReport = buildPostTransformWorkerResultReport({
    manifest: followupManifest,
    before: followupBefore
  });
  const followupPostflight = evaluateSdlcComputeStage({
    manifest: followupManifest,
    report: followupReport
  });

  assert.equal(followupReport.materializedFiles.length, 1);
  assert.equal(followupReport.materializedFiles[0].materializationSource, "replay");
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      followupReport.materializedFiles[0],
      "overwritesMaterializationRef"
    ),
    false
  );
  assert.equal(followupPostflight.status, "passed");
});

test("T-158 replay completeness follows declared product targets, not role-only presence", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust",
      "- selected output root: build_tenants/hello_world_rust",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust/Cargo.toml`",
      "- `build_tenants/hello_world_rust/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t158_rust_declared_target_replay",
      "active_tenant: hello_world_rust",
      "selected_output_root: build_tenants/hello_world_rust",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["Cargo.toml"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T010000000Z_pid158"
  });
  writeHandoffFiles(firstManifest);
  assert.deepStrictEqual(declaredProductFileTargets(firstManifest), [
    "build_tenants/hello_world_rust/Cargo.toml",
    "build_tenants/hello_world_rust/src/main.rs"
  ]);
  assert.deepStrictEqual(firstManifest.productMaterialization.requiredRoles, [
    "source"
  ]);

  const firstOutput = writeOutputSurface(firstManifest, "component_code_surface");
  const requirementIds = requirementObligationIds(firstManifest);
  assert(requirementIds.length > 0);
  const cargoPath = path.join(firstManifest.productMaterialization.tenantRoot, "Cargo.toml");
  const sourcePath = path.join(firstManifest.productMaterialization.tenantRoot, "src/main.rs");
  const cargoContent = [
    ...requirementIds.slice(0, 3).map((id) => `# ${id}`),
    "",
    "[package]",
    'name = "hello_world_rust"',
    'version = "0.1.0"',
    'edition = "2021"'
  ].join("\n");
  const sourceContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "fn main() {",
    '    println!("Hello, world!");',
    "}"
  ].join("\n");
  mkdirSync(dirname(cargoPath), { recursive: true });
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(cargoPath, `${cargoContent}\n`, "utf8");
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "initial Rust product materialization",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "build_config",
        relativePath: "Cargo.toml",
        absolutePath: cargoPath,
        digest: sha256Text(`${cargoContent}\n`),
        byteCount: Buffer.byteLength(`${cargoContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds.slice(0, 3)
      },
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main.rs",
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T010100000Z_pid158"
  });
  writeHandoffFiles(repairManifest);
  const repairOutput = writeOutputSurface(
    repairManifest,
    "component_code_surface_trace_repair"
  );
  const repairedSourceContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "fn main() {",
    '    println!("Hello, world!");',
    "}"
  ].join("\n");
  writeFileSync(sourcePath, `${repairedSourceContent}\n`, "utf8");
  writeReport({
    manifest: repairManifest,
    digest: repairOutput.digest,
    summary: "repair reports only the source role",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main.rs",
        absolutePath: sourcePath,
        digest: sha256Text(`${repairedSourceContent}\n`),
        byteCount: Buffer.byteLength(`${repairedSourceContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });

  const repairReport = readWorkerResultReport(repairManifest);
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });
  writeProductMaterializationManifest({
    manifest: repairManifest,
    report: repairReport
  });
  const replayedManifest = JSON.parse(
    readFileSync(repairManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.deepStrictEqual(
    replayedManifest.files.map((file) => file.relativePath),
    ["Cargo.toml", "src/main.rs"]
  );
  const replayedCargo = replayedManifest.files.find(
    (file) => file.relativePath === "Cargo.toml"
  );
  const currentSource = replayedManifest.files.find(
    (file) => file.relativePath === "src/main.rs"
  );
  assert.equal(replayedCargo.materializationSource, "replay");
  assert.equal(replayedCargo.role, "build_config");
  assert.equal(currentSource.materializationSource, "current_attempt");
  assert.equal(currentSource.role, "source");
});

test("T-172 tenant stack spec owns build-config targets without ecosystem handoff branches", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "- active tenant: fake_service",
      "- selected output root: build_tenants/fake_service",
      "",
      "## Product Files",
      "",
      "- `build_tenants/fake_service/Stackfile.fake`",
      "- `build_tenants/fake_service/src/main.fake`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t172_fake_stack_spec",
      "active_tenant: fake_service",
      "selected_output_root: build_tenants/fake_service",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  fake_service:",
      "    output_dir: build_tenants/fake_service",
      "    language: FakeLang",
      "    build_tool: fakebuild",
      "    test_runner: fake-test",
      "    module_structure:",
      "      - fake_service"
    ].join("\n"),
    "utf8"
  );
  const stackSpecFile = path.join(
    workspace,
    "build_tenants/fake_service/spec/TECH_STACK.json"
  );
  mkdirSync(dirname(stackSpecFile), { recursive: true });
  writeFileSync(
    stackSpecFile,
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "FakeLang",
        buildTool: "fakebuild",
        buildConfigTargets: ["Stackfile.fake"],
        testingBuildConfigTargets: ["TopLevelTestHarness.fake"],
        testingTechStack: {
          testRunner: "fake-test",
          testRoots: ["test/"],
          proofCommands: ["fake-test --report json"],
          evidenceFormat: "json-report"
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const testingStackSpecFile = path.join(
    workspace,
    "build_tenants/fake_service/spec/TESTING_TECH_STACK.json"
  );
  writeFileSync(
    testingStackSpecFile,
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_testing_technology_stack_description",
        testRunner: "fake-test",
        testRoots: ["test/"],
        testingBuildConfigTargets: ["TestHarness.fake"],
        proofCommands: ["fake-test --report json"],
        evidenceFormat: "json-report"
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260520T103000000Z_pid172"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });
  const stackTarget =
    invocationPackage.outputContract.declaredProductTargetContracts.find(
      (target) => target.path === "build_tenants/fake_service/Stackfile.fake"
    );
  const testingStackTarget =
    invocationPackage.outputContract.declaredProductTargetContracts.find(
      (target) => target.path === "build_tenants/fake_service/TestHarness.fake"
    );
  const topLevelTestingStackTarget =
    invocationPackage.outputContract.declaredProductTargetContracts.find(
      (target) =>
        target.path === "build_tenants/fake_service/TopLevelTestHarness.fake"
    );
  const testingRootTarget =
    invocationPackage.outputContract.declaredProductTargetContracts.find(
      (target) => target.path === "build_tenants/fake_service/test"
    );
  const tenantStackAuthorityTargets =
    invocationPackage.productMaterializationAuthority
      .tenantStackAuthorityTargetContracts;
  const stackAuthorityTarget = tenantStackAuthorityTargets.find(
    (target) => target.path === "build_tenants/fake_service/Stackfile.fake"
  );
  const topLevelTestingStackAuthorityTarget = tenantStackAuthorityTargets.find(
    (target) =>
      target.path === "build_tenants/fake_service/TopLevelTestHarness.fake"
  );
  const testingStackAuthorityTarget = tenantStackAuthorityTargets.find(
    (target) => target.path === "build_tenants/fake_service/TestHarness.fake"
  );
  const testingRootAuthorityTarget = tenantStackAuthorityTargets.find(
    (target) => target.path === "build_tenants/fake_service/test"
  );
  assert.notEqual(stackTarget, undefined);
  assert.equal(testingStackTarget, undefined);
  assert.equal(topLevelTestingStackTarget, undefined);
  assert.equal(testingRootTarget, undefined);
  assert.notEqual(stackAuthorityTarget, undefined);
  assert.notEqual(topLevelTestingStackAuthorityTarget, undefined);
  assert.notEqual(testingStackAuthorityTarget, undefined);
  assert.notEqual(testingRootAuthorityTarget, undefined);
  assert.equal(stackTarget.requiredRole, "build_config");
  assert.equal(testingStackAuthorityTarget.requiredRole, "build_config");
  assert.equal(topLevelTestingStackAuthorityTarget.requiredRole, "build_config");
  assert.equal(testingRootAuthorityTarget.requiredRole, "test");
  assert.ok(stackAuthorityTarget.sourceRef.endsWith("/TECH_STACK.json"));
  assert.ok(
    topLevelTestingStackAuthorityTarget.sourceRef.endsWith("/TECH_STACK.json")
  );
  assert.ok(
    testingStackAuthorityTarget.sourceRef.endsWith("/TESTING_TECH_STACK.json")
  );
  assert.deepStrictEqual(
    invocationPackage.productMaterializationAuthority.tenantStackAuthorityTargets,
    [
      "build_tenants/fake_service/Stackfile.fake",
      "build_tenants/fake_service/TestHarness.fake",
      "build_tenants/fake_service/TopLevelTestHarness.fake",
      "build_tenants/fake_service/test"
    ].sort()
  );
  assert.ok(
    invocationPackage.productMaterializationAuthority.reasonRefs.includes(
      "tenant_stack_materialization_targets"
    )
  );
});

test("T-164 design manifest role normalizes to build_config product materialization", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust_service",
      "- selected output root: build_tenants/hello_world_rust_service",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust_service/Cargo.toml`",
      "- `build_tenants/hello_world_rust_service/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t164_rust_service_manifest_alias",
      "active_tenant: hello_world_rust_service",
      "selected_output_root: build_tenants/hello_world_rust_service",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust_service:",
      "    output_dir: build_tenants/hello_world_rust_service",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust_service"
    ].join("\n"),
    "utf8"
  );
  const curlRunnerStackSpecFile = path.join(
    workspace,
    "build_tenants/hello_world_rust_service/spec/TECH_STACK.json"
  );
  mkdirSync(dirname(curlRunnerStackSpecFile), { recursive: true });
  writeFileSync(
    curlRunnerStackSpecFile,
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "Rust",
        buildTool: "cargo",
        buildConfigTargets: ["Cargo.toml"],
        executionEnvironment: {
          hostCachePolicy: "prohibited",
          workspaceLocalDirectories: ["target/"],
          environmentVariables: {
            HELLO_SERVICE_PORT: "${HELLO_SERVICE_PORT:-18182}"
          },
          byproductRules: ["Cargo.lock", "target/"]
        },
        testingTechStack: {
          testRunner: "cargo test",
          testRoots: ["tests/"],
          proofCommands: ["cargo test"],
          evidenceFormat: "process-exit"
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const implementationDesignFile = path.join(
    workspace,
    "build_tenants/hello_world_rust_service/design/adrs/ADR-002-implementation-design-surface.md"
  );
  const implementationDesignRegister = JSON.parse(
    readFileSync(implementationDesignFile, "utf8")
  );
  implementationDesignRegister.fileTargetRows =
    implementationDesignRegister.fileTargetRows.map((row) =>
      row.relativePath === "Cargo.toml" ? { ...row, role: "manifest" } : row
    );
  writeFileSync(
    implementationDesignFile,
    `${JSON.stringify(implementationDesignRegister, null, 2)}\n`,
    "utf8"
  );

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260520T090500000Z_pid164"
  });
  writeHandoffFiles(manifest);
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeOutputSurface(manifest, "component_code_surface");
  assert.deepStrictEqual(declaredProductFileTargets(manifest), [
    "build_tenants/hello_world_rust_service/Cargo.toml",
    "build_tenants/hello_world_rust_service/src/main.rs"
  ]);
  assert.equal(
    reconcileSdlcProductMaterializationAuthority(manifest).status,
    "passed"
  );

  const requirementIds = requirementObligationIds(manifest);
  const cargoPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "Cargo.toml"
  );
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main.rs"
  );
  const cargoContent = [
    ...requirementIds.map((id) => `# ${id}`),
    "",
    "[package]",
    'name = "hello_world_rust_service"',
    'version = "0.1.0"',
    'edition = "2021"'
  ].join("\n");
  const sourceContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "fn main() {",
    '    println!("helloworld");',
    "}"
  ].join("\n");
  mkdirSync(dirname(cargoPath), { recursive: true });
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(cargoPath, `${cargoContent}\n`, "utf8");
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({
    manifest,
    before
  });
  const cargoRow = report.materializedFiles.find(
    (file) => file.relativePath === "Cargo.toml"
  );
  assert.notEqual(cargoRow, undefined);
  assert.equal(cargoRow.role, "build_config");
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
});

test("T-203 component-test targets derive from admitted test-design topology", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust_service",
      "- selected output root: build_tenants/hello_world_rust_service",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust_service/Cargo.toml`",
      "- `build_tenants/hello_world_rust_service/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t203_rust_component_test_targets",
      "active_tenant: hello_world_rust_service",
      "selected_output_root: build_tenants/hello_world_rust_service",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust_service:",
      "    output_dir: build_tenants/hello_world_rust_service",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: curl",
      "    test_execution_contract: curl",
      "    module_structure:",
      "      - hello_world_rust_service"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: contract.edgeName,
    vectorIndex: 11,
    contract,
    projectConstraints: constraints,
    runId: "20260520T091500000Z_pid203"
  });
  writeHandoffFiles(manifest);
  const invocationPackage = constructWorkerInvocationPackage({ manifest });

  assert(
    declaredProductFileTargets(manifest).includes(
      "build_tenants/hello_world_rust_service/tests/main.test.rs"
    )
  );
  assert(
    invocationPackage.outputContract.declaredProductFileTargets.includes(
      "build_tenants/hello_world_rust_service/tests/main.test.rs"
    )
  );
  assert.equal(
    invocationPackage.productMaterializationAuthority.declaredProductTargetContracts.find(
      (target) =>
        target.path ===
        "build_tenants/hello_world_rust_service/tests/main.test.rs"
    )?.requiredRole,
    "test"
  );
});

test("T-164 component-code rejects worker execution evidence even with concrete runner invocation", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust_service",
      "- selected output root: build_tenants/hello_world_rust_service",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust_service/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t164_rust_service_curl_runner",
      "active_tenant: hello_world_rust_service",
      "selected_output_root: build_tenants/hello_world_rust_service",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust_service:",
      "    output_dir: build_tenants/hello_world_rust_service",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: curl",
      "    test_execution_contract: curl",
      "    module_structure:",
      "      - hello_world_rust_service"
    ].join("\n"),
    "utf8"
  );
  const shardEvidenceStackSpecFile = path.join(
    workspace,
    "build_tenants/hello_world_rust_service/spec/TECH_STACK.json"
  );
  mkdirSync(dirname(shardEvidenceStackSpecFile), { recursive: true });
  writeFileSync(
    shardEvidenceStackSpecFile,
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "Rust",
        buildTool: "cargo",
        buildConfigTargets: ["Cargo.toml"],
        executionEnvironment: {
          hostCachePolicy: "prohibited",
          workspaceLocalDirectories: ["target/"],
          environmentVariables: {
            HELLO_SERVICE_PORT: "${HELLO_SERVICE_PORT:-18182}"
          },
          byproductRules: ["Cargo.lock", "target/"]
        },
        testingTechStack: {
          testRunner: "cargo test",
          testRoots: ["tests/"],
          proofCommands: ["cargo test"],
          evidenceFormat: "process-exit"
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const implementationDesignFile = path.join(
    workspace,
    "build_tenants/hello_world_rust_service/design/adrs/ADR-002-implementation-design-surface.md"
  );
  const implementationDesignRegister = JSON.parse(
    readFileSync(implementationDesignFile, "utf8")
  );
  implementationDesignRegister.fileTargetRows =
    implementationDesignRegister.fileTargetRows.filter(
      (row) => row.relativePath === "src/main.rs"
    );
  writeFileSync(
    implementationDesignFile,
    `${JSON.stringify(implementationDesignRegister, null, 2)}\n`,
    "utf8"
  );

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260520T091000000Z_pid164"
  });
  writeHandoffFiles(manifest);
  assert.equal(manifest.productMaterialization.executionShards.length, 1);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const requirementIds = requirementObligationIds(manifest);
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main.rs"
  );
  const cargoPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "Cargo.toml"
  );
  const cargoContent = [
    ...requirementIds.map((id) => `# ${id}`),
    "",
    "[package]",
    'name = "hello_world_rust_service"',
    'version = "0.1.0"',
    'edition = "2021"'
  ].join("\n");
  const sourceContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "fn main() {",
    '    println!("helloworld");',
    "}"
  ].join("\n");
  mkdirSync(dirname(cargoPath), { recursive: true });
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(cargoPath, `${cargoContent}\n`, "utf8");
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  const command =
    "HELLO_SERVICE_PORT=18182 cargo run --quiet & curl --fail --silent http://127.0.0.1:18182/";
  writeReport({
    manifest,
    digest: output.digest,
    summary: "curl proof uses concrete curl invocation",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "build_config",
        relativePath: "Cargo.toml",
        absolutePath: cargoPath,
        digest: sha256Text(`${cargoContent}\n`),
        byteCount: Buffer.byteLength(`${cargoContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      },
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main.rs",
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ],
    executionEvidence: {
      kind: "sdlc_worker_execution_evidence",
      lane: "test",
      command,
      status: "succeeded",
      reportRefs: [pathToFileURL(sourcePath).href],
      testsObserved: 1,
      passedCount: 1,
      failedCount: 0,
      shardEvidence: [
        {
          kind: "sdlc_worker_execution_shard_evidence",
          shardId: manifest.productMaterialization.executionShards[0].shardId,
          moduleName: manifest.productMaterialization.executionShards[0].moduleName,
          lane: "test",
          command,
          status: "succeeded",
          reportRefs: [pathToFileURL(sourcePath).href],
          testsObserved: 1,
          passedCount: 1,
          failedCount: 0
        }
      ]
    }
  });

  assert.throws(
    () => readWorkerResultReport(manifest),
    /target asset type does not admit execution evidence/u
  );
});

test("T-164 replay empty predecessor is superseded by later admitted product rows", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust_service",
      "- selected output root: build_tenants/hello_world_rust_service",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust_service/Cargo.toml`",
      "- `build_tenants/hello_world_rust_service/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t164_rust_service_replay",
      "active_tenant: hello_world_rust_service",
      "selected_output_root: build_tenants/hello_world_rust_service",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust_service:",
      "    output_dir: build_tenants/hello_world_rust_service",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust_service"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["Cargo.toml"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");

  const emptyManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260513T000100000Z_pid164"
  });
  writeHandoffFiles(emptyManifest);
  const emptyOutput = writeOutputSurface(
    emptyManifest,
    "component_code_surface_empty_attempt"
  );
  writeReport({
    manifest: emptyManifest,
    digest: emptyOutput.digest,
    summary: "failed materialization attempt with no product rows",
    materializedFiles: []
  });
  writeProductMaterializationManifest({
    manifest: emptyManifest,
    report: readWorkerResultReport(emptyManifest)
  });

  const validManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260513T000200000Z_pid164"
  });
  writeHandoffFiles(validManifest);
  const validOutput = writeOutputSurface(validManifest, "component_code_surface");
  const requirementIds = requirementObligationIds(validManifest);
  const cargoPath = path.join(
    validManifest.productMaterialization.tenantRoot,
    "Cargo.toml"
  );
  const sourcePath = path.join(
    validManifest.productMaterialization.tenantRoot,
    "src/main.rs"
  );
  const cargoContent = [
    ...requirementIds.slice(0, 2).map((id) => `# ${id}`),
    "",
    "[package]",
    'name = "hello_world_rust_service"',
    'version = "0.1.0"',
    'edition = "2021"'
  ].join("\n");
  const sourceContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "fn main() {",
    '    println!("helloworld");',
    "}"
  ].join("\n");
  mkdirSync(dirname(cargoPath), { recursive: true });
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(cargoPath, `${cargoContent}\n`, "utf8");
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  writeReport({
    manifest: validManifest,
    digest: validOutput.digest,
    summary: "valid Rust service product materialization",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "build_config",
        relativePath: "Cargo.toml",
        absolutePath: cargoPath,
        digest: sha256Text(`${cargoContent}\n`),
        byteCount: Buffer.byteLength(`${cargoContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds.slice(0, 2)
      },
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main.rs",
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: validManifest,
    report: readWorkerResultReport(validManifest)
  });

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260513T000300000Z_pid164"
  });
  writeHandoffFiles(repairManifest);
  const repairOutput = writeOutputSurface(
    repairManifest,
    "component_code_surface_trace_repair"
  );
  writeReport({
    manifest: repairManifest,
    digest: repairOutput.digest,
    summary: "trace-only repair after valid materialization",
    materializedFiles: []
  });

  const repairReport = readWorkerResultReport(repairManifest);
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });
  writeProductMaterializationManifest({
    manifest: repairManifest,
    report: repairReport
  });
  const replayedManifest = JSON.parse(
    readFileSync(repairManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_manifest_replay_empty"),
    false
  );
  assert.deepStrictEqual(
    replayedManifest.files.map((file) => file.relativePath),
    ["Cargo.toml", "src/main.rs"]
  );
  assert.equal(replayedManifest.files[0].materializationSource, "replay");
  assert.equal(replayedManifest.files[1].materializationSource, "replay");
});

test("T-171 current component-test materialization supersedes empty predecessor replay", () => {
  const workspace = makeWorkspace();
  declareScalaSbtTestRunner(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");

  const emptyManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 16,
    contract,
    projectConstraints: constraints,
    runId: "20260517T000100000Z_pid171"
  });
  writeHandoffFiles(emptyManifest);
  const emptyOutput = writeOutputSurface(
    emptyManifest,
    "component_test_surface_empty_attempt"
  );
  writeReport({
    manifest: emptyManifest,
    digest: emptyOutput.digest,
    summary: "failed component-test materialization attempt with no product rows",
    materializedFiles: []
  });
  writeProductMaterializationManifest({
    manifest: emptyManifest,
    report: readWorkerResultReport(emptyManifest)
  });

  const validManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 16,
    contract,
    projectConstraints: constraints,
    runId: "20260517T000200000Z_pid171"
  });
  writeHandoffFiles(validManifest);
  const validOutput = writeOutputSurface(validManifest, "component_test_surface");
  const requirementIds = requirementObligationIds(validManifest);
  const testPath = path.join(
    validManifest.productMaterialization.tenantRoot,
    "src/test/scala/HelloWorldSpec.scala"
  );
  const testContent = [
    ...requirementIds.map((id) => `// ${id}`),
    "class HelloWorldSpec {",
    "  def provesHelloWorld(): Boolean = true",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");
  writeReport({
    manifest: validManifest,
    digest: validOutput.digest,
    summary: "valid component-test materialization after empty predecessor",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "test",
        relativePath: "src/test/scala/HelloWorldSpec.scala",
        absolutePath: testPath,
        digest: sha256Text(`${testContent}\n`),
        byteCount: Buffer.byteLength(`${testContent}\n`, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });

  const report = readWorkerResultReport(validManifest);
  const postflight = evaluateSdlcComputeStage({
    manifest: validManifest,
    report
  });
  writeProductMaterializationManifest({
    manifest: validManifest,
    report
  });
  const replayedManifest = JSON.parse(
    readFileSync(validManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_manifest_replay_empty"),
    false
  );
  assert.deepStrictEqual(
    replayedManifest.files.map((file) => file.relativePath),
    ["src/test/scala/HelloWorldSpec.scala"]
  );
  assert.equal(replayedManifest.files[0].materializationSource, "current_attempt");
});

test("T-158 product materialization target contracts prefer requirement authority", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# HWRUSTMIN Requirements",
      "",
      "### REQ-HWRUSTMIN-003 Product Files",
      "",
      "The later product materialization writes `build_tenants/hello_world_rust/Cargo.toml`",
      "and `build_tenants/hello_world_rust/src/main.rs`."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust",
      "- selected output root: build_tenants/hello_world_rust",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust/Cargo.toml`",
      "- `build_tenants/hello_world_rust/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t158_requirement_target_authority",
      "active_tenant: hello_world_rust",
      "selected_output_root: build_tenants/hello_world_rust",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["Cargo.toml"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t158-requirement-target-authority"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });

  assert.deepEqual(declaredProductFileTargets(manifest), [
    "build_tenants/hello_world_rust/Cargo.toml",
    "build_tenants/hello_world_rust/src/main.rs"
  ]);
  assert.deepEqual(
    invocationPackage.productMaterializationAuthority.requirementAuthorityTargets,
    invocationPackage.productMaterializationAuthority.declaredProductFileTargets
  );
  assert.equal(
    invocationPackage.productMaterializationAuthority.declaredProductTargetContracts.every(
      (target) => target.source === "requirement_authority"
    ),
    true
  );
  assert.deepEqual(invocationPackage.outputContract.requiredRoles, [
    "source",
    "build_config"
  ]);
});

test("T-158 product materialization reports stale product targets but follows requirements", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# HWRUSTMIN Requirements",
      "",
      "### REQ-HWRUSTMIN-003 Product Files",
      "",
      "The later product materialization writes `build_tenants/hello_world_rust/Cargo.toml`",
      "and `build_tenants/hello_world_rust/src/main.rs`."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "Build Tool: cargo",
      "",
      "- active tenant: hello_world_rust",
      "- selected output root: build_tenants/hello_world_rust",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_rust/src/main.rs`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t158_requirement_product_target_mismatch",
      "active_tenant: hello_world_rust",
      "selected_output_root: build_tenants/hello_world_rust",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "t158-requirement-product-target-mismatch"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });

  assert.equal(
    invocationPackage.productMaterializationAuthority.status,
    "passed"
  );
  assert.equal(
    invocationPackage.productMaterializationAuthority.reasonRefs.includes(
      "requirement_product_target_mismatch"
    ),
    true
  );
  assert.deepEqual(
    invocationPackage.productMaterializationAuthority.declaredProductFileTargets,
    [
      "build_tenants/hello_world_rust/Cargo.toml",
      "build_tenants/hello_world_rust/src/main.rs"
    ]
  );
  assert.equal(
    invocationPackage.productMaterializationAuthority.declaredProductTargetContracts.every(
      (target) => target.source === "requirement_authority"
    ),
    true
  );
});

test("T-158 observed unchanged repair files keep prior admitted role policy before path heuristics", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000150000Z_pid158"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(firstManifest, "component_test_surface");
  const testRelativePath = "src/main/scala/generated/DataMapper.scala";
  const testPath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  const testContent = [
    ...requirementTraceLines(firstManifest),
    "package example",
    "",
    "object ExamplePriorTest {",
    "  val exercised = true",
    "}"
  ].join("\n") + "\n";
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, testContent, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "initial test materialization on a source-looking path",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "test",
        relativePath: testRelativePath,
        absolutePath: testPath,
        digest: sha256Text(testContent),
        byteCount: Buffer.byteLength(testContent, "utf8"),
        requirementTraceObligationIds: requirementObligationIds(firstManifest)
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "20260511T000151000Z_pid158"
  });
  const before = snapshotProductMaterializationRoot(
    repairManifest.productMaterialization
  );
  writeHandoffFiles(repairManifest);
  mkdirSync(dirname(repairManifest.outputFile), { recursive: true });
  const repairContent = "# component_test_surface\n\nTrace-only repair.\n";
  writeFileSync(repairManifest.outputFile, repairContent, "utf8");

  const repairReport = buildPostTransformWorkerResultReport({
    manifest: repairManifest,
    before
  });
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });

  assert.equal(repairReport.materializedFiles.length, 1);
  assert.equal(repairReport.materializedFiles[0].role, "test");
  assert.equal(repairReport.materializedFiles[0].materializationSource, "replay");
  assert.equal(
    repairReport.materializedFiles[0].rolePolicyRef,
    "target-role-policy://odd-sdlc/product-test-tree"
  );
  assert.equal(postflight.status, "passed");
});

test("T-158 non-materialization surface edges ignore empty product replay manifests", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 7,
    contract,
    projectConstraints: constraints,
    runId: "20260511T001050000Z_pid158"
  });
  assert.equal(firstManifest.productMaterialization.required, false);
  writeHandoffFiles(firstManifest);
  const firstOutputContent = readFileSync(firstManifest.outputFile, "utf8");
  const firstOutput = { digest: sha256Text(firstOutputContent) };
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "non-materialization surface attempt with no product files",
    materializedFiles: []
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });

  const unchangedSurfacePath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    "design/feature_decomp_surface.md"
  );
  mkdirSync(dirname(unchangedSurfacePath), { recursive: true });
  writeFileSync(
    unchangedSurfacePath,
    "# feature_decomp_surface\n\nPrior surface that remains unchanged.\n",
    "utf8"
  );

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 7,
    contract,
    projectConstraints: constraints,
    runId: "20260511T001060000Z_pid158"
  });
  writeHandoffFiles(repairManifest);
  const before = snapshotProductMaterializationRoot(
    repairManifest.productMaterialization
  );

  const repairReport = buildPostTransformWorkerResultReport({
    manifest: repairManifest,
    before
  });
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });

  assert.equal(repairReport.materializedFiles.length, 0);
  assert.equal(repairReport.materializationDiagnostics.length, 0);
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_manifest_replay_empty"),
    false
  );
});

test("T-171 materialization replay uses compact handoff identity instead of parsing full historical manifests", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T001070000Z_pid158"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(
    firstManifest,
    "component_code_surface_replay_source"
  );
  const sourceContent = [
    ...requirementTraceLines(firstManifest),
    "package generated",
    "",
    "final case class ReplayedMapper(value: String)"
  ].join("\n");
  const sourceFile = path.join(
    firstManifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/ReplayedMapper.scala"
  );
  mkdirSync(dirname(sourceFile), { recursive: true });
  writeFileSync(sourceFile, `${sourceContent}\n`, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "source",
      relativePath: path.relative(
        firstManifest.productMaterialization.tenantRoot,
        sourceFile
      ),
      absolutePath: sourceFile,
      digest: sha256Text(`${sourceContent}\n`),
      byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8"),
      requirementTraceObligationIds: requirementObligationIds(firstManifest)
    }
  ];
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "historical product source for compact replay",
    materializedFiles
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });

  const replayIndexPath = path.join(
    firstManifest.archiveRoot,
    "handoff_replay_index.json"
  );
  assert.equal(existsSync(replayIndexPath), true);
  rmSync(replayIndexPath);
  writeFileSync(
    path.join(firstManifest.archiveRoot, "handoff_manifest.json"),
    `${readFileSync(path.join(firstManifest.archiveRoot, "handoff_manifest.json"), "utf8")}\nnot-json`,
    "utf8"
  );

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T001080000Z_pid158"
  });
  writeHandoffFiles(repairManifest);
  const before = snapshotProductMaterializationRoot(
    repairManifest.productMaterialization
  );
  const repairOutput = writeOutputSurface(
    repairManifest,
    "component_code_surface_replay_repair"
  );
  const repairReport = buildPostTransformWorkerResultReport({
    manifest: repairManifest,
    before
  });

  assert.equal(repairReport.digest, repairOutput.digest);
  assert.equal(
    repairReport.materializedFiles.some(
      (file) =>
        file.relativePath === "src/main/scala/generated/ReplayedMapper.scala" &&
        file.materializationSource === "replay"
    ),
    true
  );
  assert.equal(repairReport.materializationDiagnostics.length, 0);
});

test("T-158 replay materialized file carrier requires predecessor lineage refs", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    projectConstraints: constraints,
    runId: "20260511T001100000Z_pid158"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  const sourceContent = "// Implements: REQ-T066-001\npackage example\nobject Example\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, sourceContent, "utf8");
  writeFileSync(
    manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
        graphFunctionName: manifest.graphFunctionName,
        edgeName: manifest.edgeName,
        targetAssetType: manifest.targetAssetType,
        outputFile: manifest.outputFile,
        digest: output.digest,
        summary: "malformed replay row without predecessor refs",
        unresolvedReasons: [],
        materializedFiles: [
          {
            kind: "sdlc_materialized_product_file",
            role: "source",
            relativePath: "src/main/scala/generated/DataMapper.scala",
            absolutePath: sourcePath,
            digest: sha256Text(sourceContent),
            byteCount: Buffer.byteLength(sourceContent, "utf8"),
            materializationSource: "replay"
          }
        ],
        executionEvidence: null,
        obligationAssessments: []
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  assert.throws(
    () => readWorkerResultReport(manifest),
    /replayed materialized files require source lineage refs/u
  );
});

test("T-131 shallow realization assurance admits bounded runtime error guards", () => {
  const closed = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: false,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://src/cli/parseArgs.ts",
        content: [
          "export function requireName(value: string | undefined): string {",
          "  if (value === undefined) {",
          "    throw new Error(\"missing required workspace name\");",
          "  }",
          "  return value;",
          "}"
        ].join("\n")
      }
    ]
  });
  const rejected = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: false,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://src/cli/parseArgs.ts",
        content: [
          "export function requireName(): never {",
          "  throw new Error(\"not implemented\");",
          "}"
        ].join("\n")
      }
    ]
  });

  assert.equal(closed.verdict, "satisfied");
  assert.equal(rejected.verdict, "open_gap");
  assert.deepStrictEqual(rejected.reasons.map((reason) => reason.code), [
    "placeholder_surface:file://src/cli/parseArgs.ts"
  ]);
});

test("T-131 component-depth assurance admits already-materialized declared product paths", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t131-incremental-component-code"
  });
  writeHandoffFiles(manifest);
  const sourcePath = path.join(manifest.productMaterialization.tenantRoot, "src/cli.ts");
  const domainPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "domains/document_to_requirements/domain.json"
  );
  const sourceContent = [
    "// Implements: REQ-T066-001",
    "export function run(): string {",
    "  return \"ok\";",
    "}"
  ].join("\n");
  const domainContent = JSON.stringify(
    {
      kind: "odd_chat_domain",
      graphFunctions: [
        {
          id: "graph_function:document_to_requirements",
          name: "document_to_requirements"
        }
      ]
    },
    null,
    2
  );
  mkdirSync(dirname(sourcePath), { recursive: true });
  mkdirSync(dirname(domainPath), { recursive: true });
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  writeFileSync(domainPath, `${domainContent}\n`, "utf8");
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "component:app-core.cli",
        moduleName: "app-core",
        relativePath: "src/cli.ts",
        publicBoundary: "exports the CLI command boundary",
        requirementIds: ["REQ-T066-001"],
        sourceAssetRefs: ["asset://t131/bootstrap"]
      },
      {
        kind: "sdlc_component_realization_row",
        componentId: "component:app-core.default-domain-fixture",
        moduleName: "app-core",
        relativePath: "domains/document_to_requirements/domain.json",
        publicBoundary: "provides the default deployed domain fixture",
        requirementIds: ["REQ-T066-001"],
        sourceAssetRefs: ["asset://t131/bootstrap"]
      }
    ]
  };
  const artifact = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  writeReport({
    manifest,
    digest: sha256Text(artifact),
    summary: "generated product source with unchanged default domain fixture",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/cli.ts",
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8")
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const ledger = deriveComponentDepthAssuranceLedger({ manifest, report });

  assert(ledger);
  assert.equal(
    ledger.reasons.some(
      (reason) =>
        reason.code ===
        "component_declared_path_not_materialized:domains/document_to_requirements/domain.json"
    ),
    false,
    JSON.stringify(ledger.reasons, null, 2)
  );
  assert.equal(ledger.verdict, "satisfied");
});

test("T-159 component-depth assurance admits workspace-relative declared product paths", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t159-workspace-relative-component-path"
  });
  writeHandoffFiles(manifest);
  const tenantRelativePath = "src/cli.ts";
  const workspaceRelativePath = path.posix.join(
    manifest.productMaterialization.selectedOutputRoot,
    tenantRelativePath
  );
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    tenantRelativePath
  );
  const requirementIds = requirementObligationIds(manifest);
  assert(requirementIds.length > 0);
  const sourceContent = [
    ...requirementIds.map((id) => `// Implements: ${id}`),
    "export function run(): string {",
    "  return \"ok\";",
    "}"
  ].join("\n");
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, `${sourceContent}\n`, "utf8");
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "component:app-core.cli",
        moduleName: "app-core",
        relativePath: workspaceRelativePath,
        publicBoundary: "exports the CLI command boundary",
        requirementIds: ["REQ-T066-001"],
        sourceAssetRefs: ["asset://t159/bootstrap"]
      }
    ]
  };
  const artifact = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  writeReport({
    manifest,
    digest: sha256Text(artifact),
    summary: "generated product source with workspace-relative realization path",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: tenantRelativePath,
        absolutePath: sourcePath,
        digest: sha256Text(`${sourceContent}\n`),
        byteCount: Buffer.byteLength(`${sourceContent}\n`, "utf8")
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  const ledger = deriveComponentDepthAssuranceLedger({ manifest, report });

  assert(ledger);
  assert.equal(
    ledger.reasons.some(
      (reason) =>
        reason.code ===
        `component_declared_path_not_materialized:${workspaceRelativePath}`
    ),
    false,
    JSON.stringify(ledger.reasons, null, 2)
  );
  assert.equal(ledger.verdict, "satisfied");
});

test("T-160 product materialization authority admits plain Product Files section", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "- active tenant: hello_world_javascript",
      "- selected output root: build_tenants/hello_world_javascript",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_javascript/src/hello.js` is generated by traversal."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t160_product_files_heading",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "tenant_test_execution_contract: node build_tenants/hello_world_javascript/src/hello.js",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T160-PF-001: Generate the hello_world_javascript executable source file.",
      "REQ-T160-PF-002: Running node build_tenants/hello_world_javascript/src/hello.js prints Hello, world!."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_lite_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: "derive_lite_component_code_surface",
    vectorIndex: 2,
    contract,
    projectConstraints: constraints,
    runId: "t160-product-files-heading"
  });

  assert.deepStrictEqual(declaredProductFileTargets(manifest), [
    "build_tenants/hello_world_javascript/src/hello.js"
  ]);
});

test("T-164 lite component-code edge keeps multi-module product targets full-breadth", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "- active tenant: scala_spark",
      "- selected output root: build_tenants/scala_spark",
      "",
      "## Product Files",
      "",
      "- `build_tenants/scala_spark/build.sbt` role=build_config",
      "- `build_tenants/scala_spark/project` role=build_config",
      "- `build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala` role=source",
      "- `build_tenants/scala_spark/cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala` role=source",
      "- `build_tenants/scala_spark/cdme-executor/src/main/scala/cdme/executor/Executor.scala` role=source"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const tenantRoot = path.join(workspace, constraints.selectedOutputRoot);
  const implementationDesignFile = path.join(
    tenantRoot,
    "design/adrs/ADR-002-implementation-design-surface.md"
  );
  const register = {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t164/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-compiler",
        moduleRef: "module://t164/cdme-compiler"
      },
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-assurance",
        moduleRef: "module://t164/cdme-assurance"
      },
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-executor",
        moduleRef: "module://t164/cdme-executor"
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
        componentId: "cmp.cdme.compiler",
        moduleName: "cdme-compiler",
        relativePath:
          "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        concernRole: "compiler",
        publicBoundary: "Compiler",
        requirementIds: ["REQ-T164-COMPILER"],
        sourceAssetRefs: ["fixture://t164/compiler"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "cmp.cdme.assurance",
        moduleName: "cdme-assurance",
        relativePath:
          "cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala",
        concernRole: "assurance",
        publicBoundary: "Assurance",
        requirementIds: ["REQ-T164-ASSURANCE"],
        sourceAssetRefs: ["fixture://t164/assurance"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "cmp.cdme.executor",
        moduleName: "cdme-executor",
        relativePath:
          "cdme-executor/src/main/scala/cdme/executor/Executor.scala",
        concernRole: "executor",
        publicBoundary: "Executor",
        requirementIds: ["REQ-T164-EXECUTOR"],
        sourceAssetRefs: ["fixture://t164/executor"]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "cmp.cdme.compiler",
        moduleName: "cdme-compiler",
        relativePath:
          "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        publicBoundary: "Compiler",
        trancheId: "tranche:compiler",
        firstProductFileToChange:
          "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        upstreamComponentIds: [],
        requirementIds: ["REQ-T164-COMPILER"],
        sourceAssetRefs: ["fixture://t164/compiler"]
      },
      {
        kind: "sdlc_component_realization_row",
        componentId: "cmp.cdme.assurance",
        moduleName: "cdme-assurance",
        relativePath:
          "cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala",
        publicBoundary: "Assurance",
        trancheId: "tranche:assurance",
        firstProductFileToChange:
          "cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala",
        upstreamComponentIds: ["cmp.cdme.compiler"],
        requirementIds: ["REQ-T164-ASSURANCE"],
        sourceAssetRefs: ["fixture://t164/assurance"]
      },
      {
        kind: "sdlc_component_realization_row",
        componentId: "cmp.cdme.executor",
        moduleName: "cdme-executor",
        relativePath:
          "cdme-executor/src/main/scala/cdme/executor/Executor.scala",
        publicBoundary: "Executor",
        trancheId: "tranche:executor",
        firstProductFileToChange:
          "cdme-executor/src/main/scala/cdme/executor/Executor.scala",
        upstreamComponentIds: ["cmp.cdme.compiler"],
        requirementIds: ["REQ-T164-EXECUTOR"],
        sourceAssetRefs: ["fixture://t164/executor"]
      }
    ],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: "build.sbt",
        role: "build_config"
      },
      {
        kind: "sdlc_file_target_row",
        relativePath:
          "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        role: "source"
      },
      {
        kind: "sdlc_file_target_row",
        relativePath:
          "cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala",
        role: "source"
      },
      {
        kind: "sdlc_file_target_row",
        relativePath:
          "cdme-executor/src/main/scala/cdme/executor/Executor.scala",
        role: "source"
      }
    ],
    designCompletenessVerdict: null
  };
  const outputContent = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(dirname(implementationDesignFile), { recursive: true });
  writeFileSync(implementationDesignFile, outputContent, "utf8");
  writeAdmittedImplementationDesignArchive({
    workspaceRoot: workspace,
    register,
    outputContent
  });

  const contract = hookContractByEdgeName(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: contract.edgeName,
    vectorIndex: 1,
    contract,
    projectConstraints: constraints,
    traversalAttemptEnvelope: {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t164-lite-component-code-full-design-targets",
      profileRef: "abg://profile/t164-lite-component-code-full-design-targets",
      basisId: "basis:t164-lite-component-code-full-design-targets",
      graphFunctionId: "graph:t164-lite-component-code-full-design-targets",
      graphCallId: "call:t164-lite-component-code-full-design-targets",
      frameId: "frame:t164-lite-component-code-full-design-targets",
      vectorIndex: 1,
      edge: contract.edgeName,
      strategyDirectiveRef:
        `strategy://odd_sdlc/${contract.edgeName}/full_breadth`,
      backendProfileRef: "backend:t164-lite-component-code-full-design-targets",
      actorInvocationId:
        "actor:t164-lite-component-code-full-design-targets",
      selectedScheduleItemRefs: [],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    runId: "t164-lite-component-code-full-design-targets"
  });

  assert.equal(manifest.traversalStrategyDecision.decisionSource, "abg_selected");
  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "full_breadth");
  assert.equal(manifest.featureScope.mode, "full_breadth");
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, []);
  assert.deepStrictEqual(declaredProductFileTargets(manifest), [
    "build_tenants/scala_spark/build.sbt",
    "build_tenants/scala_spark/cdme-assurance/src/main/scala/cdme/assurance/Assurance.scala",
    "build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
    "build_tenants/scala_spark/cdme-executor/src/main/scala/cdme/executor/Executor.scala",
    "build_tenants/scala_spark/project"
  ]);
});

test("T-187 component-code materialization excludes downstream test targets", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "- active tenant: hello_world_javascript",
      "- selected output root: build_tenants/hello_world_javascript",
      "",
      "## Product Files",
      "",
      "- `build_tenants/hello_world_javascript/src/hello.js` role=source",
      "- `build_tenants/hello_world_javascript/test/hello.test.js` role=test"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t187_declared_product_targets",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "tenant_test_execution_contract: node --test test/hello.test.js",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node --test",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T187-PM-001: Generate src/hello.js and test/hello.test.js."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const stackSpecFile = path.join(
    workspace,
    constraints.selectedOutputRoot,
    "spec/TECH_STACK.json"
  );
  const stackSpec = JSON.parse(readFileSync(stackSpecFile, "utf8"));
  stackSpec.executionEnvironment = {
    ...(stackSpec.executionEnvironment ?? {}),
    workspaceLocalDirectories: ["src", "test"],
    byproductRules: ["src", "test"]
  };
  writeFileSync(stackSpecFile, `${JSON.stringify(stackSpec, null, 2)}\n`, "utf8");
  const contract = hookContractByEdgeName(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t187-product-targets-outrank-tool-local-dirs"
  });
  assert.deepStrictEqual(declaredProductFileTargets(manifest), [
    "build_tenants/hello_world_javascript/src/hello.js"
  ]);
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_code_surface");
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/hello.js"
  );
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(
    sourcePath,
    [
      "// requirement:t187_declared_product_targets.requirements.req_t187_pm_001",
      "export function hello() { return 'Hello, world!'; }"
    ].join("\n") + "\n",
    "utf8"
  );
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "test/hello.test.js"
  );
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(
    testPath,
    [
      "// requirement:t187_declared_product_targets.requirements.req_t187_pm_001",
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { hello } from '../src/hello.js';",
      "test('hello', () => assert.equal(hello(), 'Hello, world!'));"
    ].join("\n") + "\n",
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });

  assert.deepStrictEqual(
    report.materializedFiles.map((file) => [file.relativePath, file.role]),
    [["src/hello.js", "source"]]
  );
  assert.deepStrictEqual(
    report.materializationDiagnostics.map((diagnostic) => diagnostic.code),
    ["materialized_product_role_policy_mismatch"]
  );
  assert.match(
    report.materializationDiagnostics[0].detail,
    /test\/hello\.test\.js/u
  );
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "blocked");
  assert(
    postflight.blockingReasons.includes("materialized_product_role_policy_mismatch"),
    JSON.stringify(postflight.blockingReasons)
  );
  assert.equal(
    report.obligationAssessments.find(
      (assessment) =>
        assessment.obligationId === "target_asset:component_code_surface"
    )?.fulfillmentStatus,
    "fulfilled"
  );
});

test("T-102 post-transform observation admits existing discoverable test files", () => {
  const workspace = makeWorkspace();
  const testRelativePath =
    "cdme-compiler/src/test/scala/cdme/compiler/ExistingSpec.scala";
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "## Expected Product Files",
      "",
      `- build_tenants/scala_spark/${testRelativePath} role=test`
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t102-existing-test-materialization"
  });
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(
    testPath,
    [
      "package cdme.compiler",
      "",
      "import org.scalatest.funsuite.AnyFunSuite",
      "",
      "// Validates: REQ-T066-001",
      "class ExistingSpec extends AnyFunSuite {",
      "  test(\"existing spec is admitted as materialization evidence\") {",
      "    assert(1 == 1)",
      "  }",
      "}"
    ].join("\n") + "\n",
    "utf8"
  );
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# component_test_surface",
      "",
      "edge: derive_component_test_surface",
      "",
      "This transform reclassifies existing tenant tests as current edge evidence.",
      "",
      "REQ-T066-001"
    ].join("\n") + "\n",
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });

  assert.equal(report.materializedFiles.length, 1);
  assert.equal(report.materializedFiles[0].role, "test");
  assert.equal(report.materializedFiles[0].relativePath, testRelativePath);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
});

test("T-102 post-transform observation ignores tenant-declared component-test build byproducts", () => {
  const workspace = makeWorkspace();
  writeTenantTechnologyStackSpec(workspace, {
    byproductRules: ["cdme-compiler/target/", ".bsp/"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t102-component-test-byproduct-filter"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  const testRelativePath =
    "cdme-compiler/src/test/scala/cdme/compiler/GeneratedSpec.scala";
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "GeneratedSpec",
        relativePath: testRelativePath,
        testcaseIds: ["TC-T066-001"],
        componentIds: ["cdme-compiler"],
        requirementIds: ["REQ-T066-001"],
        shardId: "test-shard-generated"
      }
    ]
  };
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    `${JSON.stringify(register, null, 2)}\n`,
    "utf8"
  );
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(
    testPath,
    [
      "package cdme.compiler",
      "",
      "import org.scalatest.funsuite.AnyFunSuite",
      "",
      "// Validates: REQ-T066-001",
      "class GeneratedSpec extends AnyFunSuite {",
      "  test(\"generated spec is admitted\") { assert(1 == 1) }",
      "}"
    ].join("\n") + "\n",
    "utf8"
  );
  const byproductPaths = [
    "cdme-compiler/target/scala-2.13/test-zinc/inc_compile_2.13.zip",
    "cdme-compiler/target/test-reports/TEST-cdme.compiler.GeneratedSpec.xml",
    ".bsp/sbt.json"
  ];
  for (const relativePath of byproductPaths) {
    const absolutePath = path.join(
      manifest.productMaterialization.tenantRoot,
      relativePath
    );
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, "build-tool byproduct\n", "utf8");
  }

  const report = buildPostTransformWorkerResultReport({ manifest, before });

  assert.deepStrictEqual(
    report.materializedFiles.map((file) => file.relativePath),
    [testRelativePath]
  );
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
});

test("T-168 component-test materialization binds tests to design-derived targets", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "## Product Files",
      "",
      "- build_tenants/scala_spark/src/main/scala/cdme/Core.scala role=source"
    ].join("\n"),
    "utf8"
  );
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t168-design-derived-test-targets"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  const testRelativePath = "test/generated_contract.test.js";
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTopologyRows: [],
    componentRealizationRows: [],
    testComponentTopologyRows: [],
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "GeneratedContractTest",
        relativePath: testRelativePath,
        testcaseIds: ["TC-T168-001"],
        componentIds: ["cdme-core"],
        requirementIds: ["REQ-T066-001"],
        shardId: "test-shard-01"
      }
    ],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
  const output = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, output, "utf8");
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(
    testPath,
    [
      "// Validates: REQ-T066-001",
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "",
      "test('generated contract target binds through design asset', () => {",
      "  assert.equal(1, 1);",
      "});"
    ].join("\n") + "\n",
    "utf8"
  );

  assert.deepStrictEqual(declaredProductFileTargets(manifest), [
    `build_tenants/scala_spark/${testRelativePath}`
  ]);
  const report = buildPostTransformWorkerResultReport({ manifest, before });
  assert.equal(report.materializedFiles.length, 1);
  assert.equal(report.materializedFiles[0].role, "test");
  assert.equal(report.materializedFiles[0].relativePath, testRelativePath);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
});

test("T-184 component-test observation classifies module src/test files as test materialization", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t184-component-test-src-test-role"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_test_surface");

  const testRelativePath = "cdme-core/src/test/scala/cdme/CoreSpec.scala";
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  const testContent = [
    "package cdme",
    "import org.scalatest.funsuite.AnyFunSuite",
    "final class CoreSpec extends AnyFunSuite {",
    "  test(\"core contract\") { assert(1 == 1) }",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  assert.equal(report.materializedFiles.length, 1);
  assert.equal(report.materializedFiles[0].role, "test");
  assert.equal(report.materializedFiles[0].relativePath, testRelativePath);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_role_missing:test"),
    false
  );
});

test("T-184 component-test retry reclassifies unchanged tests after stale replay role", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t184-stale-other-prior"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(firstManifest, "component_test_surface");
  const testRelativePath = "cdme-core/src/test/scala/cdme/CoreSpec.scala";
  const testPath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  const testContent = [
    "package cdme",
    "import org.scalatest.funsuite.AnyFunSuite",
    "final class CoreSpec extends AnyFunSuite {",
    "  test(\"core contract\") { assert(1 == 1) }",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "pre-fix component tests classified as other",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "other",
        relativePath: testRelativePath,
        absolutePath: testPath,
        digest: sha256Text(`${testContent}\n`),
        byteCount: Buffer.byteLength(`${testContent}\n`, "utf8")
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });
  writeFileSync(
    path.join(firstManifest.archiveRoot, "postflight.json"),
    `${JSON.stringify({ kind: "sdlc_postflight_result", status: "passed" }, null, 2)}\n`,
    "utf8"
  );

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t184-stale-other-repair"
  });
  writeHandoffFiles(repairManifest);
  const before = snapshotProductMaterializationRoot(
    repairManifest.productMaterialization
  );
  writeOutputSurface(repairManifest, "component_test_surface_repair");

  const repairReport = buildPostTransformWorkerResultReport({
    manifest: repairManifest,
    before
  });

  assert.equal(repairReport.materializedFiles.length, 1);
  assert.equal(repairReport.materializedFiles[0].role, "test");
  assert.equal(repairReport.materializedFiles[0].relativePath, testRelativePath);
  const postflight = evaluateSdlcComputeStage({
    manifest: repairManifest,
    report: repairReport
  });
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("materialized_product_role_missing:test"),
    false
  );
});

test("T-184 materialization replay honors required roles after declared targets are satisfied", () => {
  const workspace = makeWorkspace();
  writeTenantTechnologyStackSpec(workspace, {
    buildConfigTargets: ["project/"]
  });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const firstManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t184-replay-required-role-prior"
  });
  writeHandoffFiles(firstManifest);
  const firstOutput = writeOutputSurface(firstManifest, "component_test_surface");
  const testRelativePath = "cdme-core/src/test/scala/cdme/CoreSpec.scala";
  const testPath = path.join(
    firstManifest.productMaterialization.tenantRoot,
    testRelativePath
  );
  const testContent = [
    "package cdme",
    "import org.scalatest.funsuite.AnyFunSuite",
    "final class CoreSpec extends AnyFunSuite {",
    "  test(\"core contract\") { assert(1 == 1) }",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");
  writeReport({
    manifest: firstManifest,
    digest: firstOutput.digest,
    summary: "prior component test materialization",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "test",
        relativePath: testRelativePath,
        absolutePath: testPath,
        digest: sha256Text(`${testContent}\n`),
        byteCount: Buffer.byteLength(`${testContent}\n`, "utf8")
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: firstManifest,
    report: readWorkerResultReport(firstManifest)
  });
  writeFileSync(
    path.join(firstManifest.archiveRoot, "postflight.json"),
    `${JSON.stringify({ kind: "sdlc_postflight_result", status: "passed" }, null, 2)}\n`,
    "utf8"
  );

  const repairManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t184-replay-required-role-repair"
  });
  writeHandoffFiles(repairManifest);
  const repairOutput = writeOutputSurface(repairManifest, "component_test_surface");
  const buildConfigRelativePath = "project/build.properties";
  const buildConfigPath = path.join(
    repairManifest.productMaterialization.tenantRoot,
    buildConfigRelativePath
  );
  const buildConfigContent = "sbt.version=1.9.8\n";
  mkdirSync(dirname(buildConfigPath), { recursive: true });
  writeFileSync(buildConfigPath, buildConfigContent, "utf8");
  writeReport({
    manifest: repairManifest,
    digest: repairOutput.digest,
    summary: "repair only rewrote declared build config",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "build_config",
        relativePath: buildConfigRelativePath,
        absolutePath: buildConfigPath,
        digest: sha256Text(buildConfigContent),
        byteCount: Buffer.byteLength(buildConfigContent, "utf8")
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: repairManifest,
    report: readWorkerResultReport(repairManifest)
  });
  const manifestPayload = JSON.parse(
    readFileSync(repairManifest.productMaterialization.manifestFile, "utf8")
  );

  assert.equal(manifestPayload.replay.kind, "sdlc_product_materialization_manifest_replay");
  assert.equal(
    manifestPayload.files.some(
      (file) =>
        file.role === "test" &&
        file.relativePath === testRelativePath &&
        file.materializationSource === "replay"
    ),
    true
  );
});

test("T-168 component-test materialization admits exact live row and rejects asset archive substitution", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const productManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t168-live-component-test-row-alias"
  });
  const productRegister = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTopologyRows: [],
    componentRealizationRows: [],
    testComponentTopologyRows: [],
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "LiveAliasTest",
        relativePath: "test/live_alias.test.js",
        testcaseIds: ["TC-T168-ALIAS"],
        componentIds: ["cdme-core"],
        requirementIds: ["REQ-T066-001"],
        shardId: "test-shard-01"
      }
    ],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
  mkdirSync(dirname(productManifest.outputFile), { recursive: true });
  writeFileSync(
    productManifest.outputFile,
    `${JSON.stringify(productRegister, null, 2)}\n`,
    "utf8"
  );
  assert.deepStrictEqual(declaredProductFileTargets(productManifest), [
    "build_tenants/scala_spark/test/live_alias.test.js"
  ]);

  const assetManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    projectConstraints: constraints,
    runId: "t168-asset-archive-test-row-rejected"
  });
  const assetRegister = {
    ...productRegister,
    componentTestRows: [
      {
        ...productRegister.componentTestRows[0],
        relativePath:
          ".ai-workspace/runtime/odd_sdlc/assets/t168/test/live_alias.test.js"
      }
    ]
  };
  mkdirSync(dirname(assetManifest.outputFile), { recursive: true });
  writeFileSync(
    assetManifest.outputFile,
    `${JSON.stringify(assetRegister, null, 2)}\n`,
    "utf8"
  );
  assert.deepStrictEqual(declaredProductFileTargets(assetManifest), []);
});

test("T-170 lite component-code defers execution evidence to graph test-execution result", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t170_lite_execution",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    test_execution_contract: node build_tenants/hello_world_javascript/src/hello.js",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T170-LITE-001: Generate the hello_world_javascript executable source file.",
      "REQ-T170-LITE-002: Running node build_tenants/hello_world_javascript/src/hello.js prints Hello, world!."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const conformedProject = {
    ...deriveSdlcConformProjectProfileFromWorkspace(workspace),
    testExecutionContract:
      "node build_tenants/hello_world_javascript/src/hello.js"
  };
  const contract = hookContractByEdgeName(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: contract.edgeName,
    vectorIndex: 1,
    contract,
    conformedProject,
    projectConstraints: constraints,
    runId: "t170-lite-component-code-execution-required"
  });
  assert.equal(manifest.productMaterialization.executionShards.length, 1);
  assert.equal(
    manifest.productMaterialization.executionShards[0].command,
    "node build_tenants/hello_world_javascript/src/hello.js"
  );
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const requirementIds = requirementObligationIds(manifest);
  assert(requirementIds.length > 0);
  const sourcePath = path.join(
    workspace,
    "build_tenants/hello_world_javascript/src/hello.js"
  );
  const source = [
    ...requirementIds.map((id) => `// ${id}`),
    "console.log('Hello, world!');"
  ].join("\n") + "\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, source, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated executable source without governed execution evidence",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/hello.js",
        absolutePath: sourcePath,
        digest: sha256Text(source),
        byteCount: Buffer.byteLength(source, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed", JSON.stringify(postflight.blockingReasons));
  assert.equal(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "test_execution_evidence_missing"
    ),
    false
  );
});

test("T-171 full component-code defers execution evidence to graph test-execution result", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t170_full_execution",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    test_execution_contract: node build_tenants/hello_world_javascript/src/hello.js",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  writeAdmittedStagedAuthoritySurfaces(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const conformedProject = {
    ...deriveSdlcConformProjectProfileFromWorkspace(workspace),
    testExecutionContract:
      "node build_tenants/hello_world_javascript/src/hello.js"
  };
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_component_code_surface",
    edgeName: contract.edgeName,
    vectorIndex: 7,
    contract,
    conformedProject,
    projectConstraints: constraints,
    runId: "t171-full-component-code-execution-deferred"
  });
  assert.equal(manifest.productMaterialization.executionShards.length, 0);
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_code_surface");
  const requirementIds = requirementObligationIds(manifest);
  assert(requirementIds.length > 0);
  const sourcePath = path.join(
    workspace,
    "build_tenants/hello_world_javascript/src/hello.js"
  );
  const source = [
    ...requirementIds.map((id) => `// ${id}`),
    "console.log('Hello, world!');"
  ].join("\n") + "\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, source, "utf8");
  writeReport({
    manifest,
    digest: output.digest,
    summary:
      "generated full-lifecycle executable source without governed execution evidence",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/hello.js",
        absolutePath: sourcePath,
        digest: sha256Text(source),
        byteCount: Buffer.byteLength(source, "utf8"),
        requirementTraceObligationIds: requirementIds
      }
    ]
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  writeValidCodeBuilderFrontier(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "test_execution_evidence_missing"
    ),
    false
  );
});

test("T-171 test-execution result blocks when governed execution evidence is missing", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    projectConstraints: constraints,
    runId: "t171-test-execution-missing-evidence"
  });
  assert(manifest.productMaterialization.executionShards.length > 0);
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "test_execution_result_surface");
  writeReport({
    manifest,
    digest: output.digest,
    summary: "test execution result without governed execution evidence",
    materializedFiles: [],
    executionEvidence: null
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "blocked");
  assert(postflight.blockingReasons.includes("test_execution_evidence_missing"));
  const missingExecutionEvidence = postflight.blockingReasonCarriers.find(
    (reason) => reason.code === "test_execution_evidence_missing"
  );
  assert.equal(missingExecutionEvidence?.reasonClass, "code_to_test");
  assert.equal(missingExecutionEvidence?.lawfulReentryPoint, "same_edge_retry");
});

test("T-102 test-run archive validates execution evidence against source edge shards", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const executionContract = hookContractByEdgeName("derive_test_execution_result_surface");
  const baseExecutionManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: executionContract.edgeName,
    vectorIndex: 17,
    contract: executionContract,
    projectConstraints: constraints,
    runId: "t102-source-shard-schedule"
  });
  const baseShard = baseExecutionManifest.productMaterialization.executionShards[0];
  const preparedShard = Object.freeze({
    ...baseShard,
    shardId: `${baseShard.shardId}-tests`,
    moduleName: `${baseShard.moduleName}_tests`
  });
  const executionManifest = Object.freeze({
    ...baseExecutionManifest,
    productMaterialization: Object.freeze({
      ...baseExecutionManifest.productMaterialization,
      executionShards: Object.freeze([preparedShard])
    })
  });
  writeHandoffFiles(executionManifest);
  const executionOutput = writeOutputSurface(
    executionManifest,
    "test_execution_result_surface"
  );
  const executionReportPath = path.join(executionManifest.archiveRoot, "junit-report.xml");
  writeFileSync(
    executionReportPath,
    '<testsuite tests="1" failures="0"><testcase classname="HelloWorldTest" name="runs"/></testsuite>\n',
    "utf8"
  );
  writeFileSync(
    executionManifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          executionManifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: executionManifest.graphFunctionName,
        edgeName: executionManifest.edgeName,
        targetAssetType: executionManifest.targetAssetType,
        outputFile: executionManifest.outputFile,
        digest: executionOutput.digest,
        summary: "admitted execution-result dependency with source-edge shard schedule",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: executionManifest.productMaterialization.testExecutionContract,
          status: "succeeded",
          reportRefs: [`file://${executionReportPath}`],
          testsObserved: 1,
          passedCount: 1,
          failedCount: 0,
          shardEvidence: [
            {
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: preparedShard.shardId,
              moduleName: preparedShard.moduleName,
              lane: "test",
              command: preparedShard.command,
              status: "succeeded",
              reportRefs: [`file://${executionReportPath}`],
              testsObserved: 1,
              passedCount: 1,
              failedCount: 0
            }
          ]
        },
        obligationAssessments: executionManifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [`file://${executionManifest.outputFile}`, `file://${executionReportPath}`],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const executionReport = readWorkerResultReport(executionManifest);
  assert.equal(
    evaluateSdlcComputeStage({
      manifest: executionManifest,
      report: executionReport
    }).status,
    "passed"
  );

  const contract = hookContractByEdgeName("derive_test_run_archive_surface");
  const archiveManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 18,
    contract,
    projectConstraints: constraints,
    runId: "t102-archive-source-shard-schedule"
  });
  assert.notEqual(
    archiveManifest.productMaterialization.executionShards[0].shardId,
    preparedShard.shardId
  );
  writeHandoffFiles(archiveManifest);
  const content = [
    "# test_run_archive_surface",
    "",
    "Archived dependencies:",
    ...archiveManifest.inputAssetTypes.map((assetType) => `- ${assetType}`),
    "Requirement trace: REQ-T066-001"
  ].join("\n");
  const artifact = `${content}\n`;
  mkdirSync(dirname(archiveManifest.outputFile), { recursive: true });
  writeFileSync(archiveManifest.outputFile, artifact, "utf8");
  const outputRef = `file://${archiveManifest.outputFile}`;
  writeFileSync(
    archiveManifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          archiveManifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: archiveManifest.graphFunctionName,
        edgeName: archiveManifest.edgeName,
        targetAssetType: archiveManifest.targetAssetType,
        outputFile: archiveManifest.outputFile,
        digest: sha256Text(artifact),
        summary: "archive cites admitted execution-result dependency",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: null,
        obligationAssessments: archiveManifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: obligation.obligationId ===
              "source_asset:test_execution_result_surface"
              ? [outputRef, `file://${executionManifest.reportFile}`, ...obligation.evidenceRefs]
              : [outputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const archiveReport = readWorkerResultReport(archiveManifest);
  const archivePostflight = evaluateSdlcComputeStage({
    manifest: archiveManifest,
    report: archiveReport
  });

  assert.equal(archivePostflight.status, "passed");
});

test("T-102 post-close target-next same-vector projection falls through to overlay continuation", () => {
  assert.equal(
    normalizePostCloseContinuationVectorIndex({
      closureDecisionDisposition: "close",
      currentVectorIndex: 0,
      nextVectorIndex: 0
    }),
    null
  );
  assert.equal(
    normalizePostCloseContinuationVectorIndex({
      closureDecisionDisposition: "retry",
      currentVectorIndex: 0,
      nextVectorIndex: 0
    }),
    0
  );
  assert.equal(
    normalizePostCloseContinuationVectorIndex({
      closureDecisionDisposition: "close",
      currentVectorIndex: 0,
      nextVectorIndex: 1
    }),
    1
  );

  const continuation = deriveSdlcPostCloseOverlayContinuationActionInput({
    module: constructSdlcGtlModule(),
    overlayRef: "overlay://odd-sdlc/current-full-traversal",
    completedGraphFunctionRef: "prepare_test_execution_surface",
    runRef: "t102-post-close-target-next-same-vector"
  });

  assert(continuation);
  assert.equal(
    continuation.graphFunctionRef,
    "derive_test_execution_result_surface"
  );
  assert.equal(
    continuation.graphVectorRef,
    "derive_test_execution_result_surface"
  );
});

test("T-115 test-run archive admits structurally valid failed execution evidence", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const executionContract = hookContractByEdgeName("derive_test_execution_result_surface");
  const executionManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: executionContract.edgeName,
    vectorIndex: 17,
    contract: executionContract,
    projectConstraints: constraints,
    runId: "t115-archive-failed-execution-result"
  });
  writeHandoffFiles(executionManifest);
  const executionOutput = writeOutputSurface(
    executionManifest,
    "test_execution_result_surface"
  );
  const shard = executionManifest.productMaterialization.executionShards[0];
  writeFileSync(
    executionManifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          executionManifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: executionManifest.graphFunctionName,
        edgeName: executionManifest.edgeName,
        targetAssetType: executionManifest.targetAssetType,
        outputFile: executionManifest.outputFile,
        digest: executionOutput.digest,
        summary: "admitted failed execution-result dependency",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: shard.command,
          status: "failed",
          reportRefs: [`file://${executionManifest.outputFile}`],
          testsObserved: 0,
          passedCount: 0,
          failedCount: 0,
          shardEvidence: [
            {
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: shard.shardId,
              moduleName: shard.moduleName,
              lane: "test",
              command: shard.command,
              status: "failed",
              reportRefs: [`file://${executionManifest.outputFile}`],
              testsObserved: 0,
              passedCount: 0,
              failedCount: 0
            }
          ]
        },
        obligationAssessments: executionManifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [`file://${executionManifest.outputFile}`],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const executionReport = readWorkerResultReport(executionManifest);
  assert.equal(
    evaluateSdlcComputeStage({
      manifest: executionManifest,
      report: executionReport
    }).status,
    "passed"
  );

  const contract = hookContractByEdgeName("derive_test_run_archive_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 18,
    contract,
    projectConstraints: constraints,
    runId: "t115-archive-cites-failed-execution-result"
  });
  writeHandoffFiles(manifest);
  const content = [
    "# test_run_archive_surface",
    "",
    "Archived dependencies:",
    ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`),
    "Requirement trace: REQ-T066-001"
  ].join("\n");
  const artifact = `${content}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  const outputRef = `file://${manifest.outputFile}`;
  writeFileSync(
    manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
        graphFunctionName: manifest.graphFunctionName,
        edgeName: manifest.edgeName,
        targetAssetType: manifest.targetAssetType,
        outputFile: manifest.outputFile,
        digest: sha256Text(artifact),
        summary: "archive cites admitted failed execution-result dependency",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: null,
        obligationAssessments: manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: obligation.obligationId ===
              "source_asset:test_execution_result_surface"
              ? [outputRef, `file://${executionManifest.reportFile}`, ...obligation.evidenceRefs]
              : [outputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
});

test("T-104 test-run archive rejects legacy fresh execution evidence reports", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_run_archive_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 18,
    contract,
    projectConstraints: constraints,
    runId: "t104-archive-rejects-execution-evidence"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "test_run_archive_surface");
  const outputRef = `file://${manifest.outputFile}`;
  writeFileSync(
    manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
        graphFunctionName: manifest.graphFunctionName,
        edgeName: manifest.edgeName,
        targetAssetType: manifest.targetAssetType,
        outputFile: manifest.outputFile,
        digest: output.digest,
        summary: "legacy archive report tries to emit fresh execution evidence",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: manifest.productMaterialization.testExecutionContract,
          status: "succeeded",
          reportRefs: [outputRef],
          testsObserved: 1,
          passedCount: 1,
          failedCount: 0,
          shardEvidence: []
        },
        obligationAssessments: manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [outputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  assert.throws(
    () => readWorkerResultReport(manifest),
    /target asset type does not admit execution evidence/u
  );
});

test("T-094/T-095 test execution result rejects non-contract not-run status", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    projectConstraints: constraints,
    runId: "t094-not-run-execution-evidence"
  });
  const handoffFiles = writeHandoffFiles(manifest);
  const prompt = readFileSync(handoffFiles.promptPath, "utf8");

  assert.match(prompt, /Edge-policy projection output/u);
  assert.match(
    prompt,
    /The installed operator runs the declared execution shards and publishes the sdlc_worker_execution_evidence carrier/u
  );
  assert.doesNotMatch(prompt, /executionEvidence\.status MUST/u);
  assert.doesNotMatch(prompt, /not_run/u);

  const output = writeOutputSurface(manifest, "test_execution_result_surface");
  const outputRef = `file://${manifest.outputFile}`;
  writeFileSync(
    manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
        graphFunctionName: manifest.graphFunctionName,
        edgeName: manifest.edgeName,
        targetAssetType: manifest.targetAssetType,
        outputFile: manifest.outputFile,
        digest: output.digest,
        summary: "test execution result reports that execution did not run",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: manifest.productMaterialization.testExecutionContract,
          status: "not_run",
          reportRefs: [outputRef],
          testsObserved: 0,
          passedCount: 0,
          failedCount: 0,
          shardEvidence: manifest.productMaterialization.executionShards.map(
            (shard) => ({
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: shard.shardId,
              moduleName: shard.moduleName,
              lane: "test",
              command: shard.command,
              status: "not_run",
              reportRefs: [outputRef],
              testsObserved: 0,
              passedCount: 0,
              failedCount: 0
            })
          )
        },
        obligationAssessments: manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [outputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  assert.throws(() => readWorkerResultReport(manifest), /status/u);
});

test("B-072 post-transform test execution result admits embedded execution evidence", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    projectConstraints: constraints,
    runId: "b072-transform-execution-evidence"
  });
  writeHandoffFiles(manifest);
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  const content = [
    "# test_execution_result_surface",
    "",
    "The transform returns governed test execution evidence.",
    "",
    "```json",
    JSON.stringify(
      {
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: manifest.productMaterialization.testExecutionContract,
          status: "succeeded",
          reportRefs: [],
          testsObserved: 2,
          passedCount: 2,
          failedCount: 0,
          shardEvidence: manifest.productMaterialization.executionShards.map(
            (shard) => ({
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: shard.shardId,
              moduleName: shard.moduleName,
              lane: "test",
              command: shard.command,
              status: "succeeded",
              reportRefs: [],
              testsObserved: 2,
              passedCount: 2,
              failedCount: 0
            })
          )
        }
      },
      null,
      2
    ),
    "```"
  ].join("\n");
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, `${content}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  assert.equal(report.executionEvidence?.status, "succeeded");
  assert.equal(report.executionEvidence?.testsObserved, 2);
  assert.deepStrictEqual(report.executionEvidence?.reportRefs, [
    `file://${manifest.outputFile}`
  ]);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
});

test("T-115 failed execution evidence with zero observed tests is admitted for repair qualification", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    projectConstraints: constraints,
    runId: "t115-failed-zero-test-evidence"
  });
  writeHandoffFiles(manifest);
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  const shard = manifest.productMaterialization.executionShards[0];
  const content = [
    "# test_execution_result_surface",
    "",
    "```json",
    JSON.stringify(
      {
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: shard.command,
          status: "failed",
          testsObserved: 0,
          passedCount: 0,
          failedCount: 0,
          shardEvidence: [
            {
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: shard.shardId,
              moduleName: shard.moduleName,
              lane: "test",
              command: shard.command,
              status: "failed",
              testsObserved: 0,
              passedCount: 0,
              failedCount: 0
            }
          ]
        }
      },
      null,
      2
    ),
    "```"
  ].join("\n");
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, `${content}\n`, "utf8");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(report.executionEvidence?.status, "failed");
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "test_execution_zero_tests_observed"
    ),
    false
  );
});

test("T-083 failed execution-result evidence closes the execution source for downstream repair", () => {
  const workspace = makeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const hookContract = hookContractByEdgeName("derive_test_execution_result_surface");
  const edgeGainContract = resolveSdlcEdgeGainClosureContract(
    "derive_test_execution_result_surface"
  );
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: hookContract.edgeName,
    vectorIndex: 26,
    contract: hookContract,
    projectConstraints: constraints,
    runId: "t083-failed-execution-source-admitted"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "test_execution_result_surface");
  const outputRef = `file://${manifest.outputFile}`;
  const shard = manifest.productMaterialization.executionShards[0];
  const report = {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: output.digest,
    summary: "edge-policy execution evidence observed a failed shard",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: {
      kind: "sdlc_worker_execution_evidence",
      lane: "test",
      command: manifest.productMaterialization.testExecutionContract,
      status: "failed",
      reportRefs: [outputRef],
      testsObserved: 0,
      passedCount: 0,
      failedCount: 0,
      shardEvidence: [
        {
          kind: "sdlc_worker_execution_shard_evidence",
          shardId: shard.shardId,
          moduleName: shard.moduleName,
          lane: "test",
          command: shard.command,
          status: "failed",
          reportRefs: [outputRef],
          testsObserved: 0,
          passedCount: 0,
          failedCount: 0
        }
      ]
    },
    obligationAssessments: []
  };
  const executionResultObligation =
    manifest.traversalObligationContext.obligations[0];
  assert(executionResultObligation);
  const obligationIds = [executionResultObligation.obligationId];
  const candidates = edgeAssuranceEvidenceCandidatesFor({
    state: { manifest, workerReport: report },
    obligationIds
  });
  assert.equal(
    candidates.some((candidate) => candidate.sourceKind === "execution_result"),
    true
  );

  const obligations = deriveSdlcEdgeObligations({
    contract: edgeGainContract,
    obligationRefs: obligationIds
  });
  const admission = admitSdlcEdgeEvidence({
    contract: edgeGainContract,
    obligations,
    candidates
  });
  const gain = measureSdlcEdgeGain({
    contract: edgeGainContract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: edgeGainContract.ledgerInputKinds.map((ledgerInputKind) => ({
      kind: "sdlc_edge_ledger_input_ref",
      ledgerInputKind,
      ledgerRef: `ledger://t083/${ledgerInputKind}`
    })),
    requiredEvidenceSourceKinds: ["execution_result"]
  });
  const residualPressure = deriveSdlcEdgeResidualPressure(gain);
  const closeDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure
  });

  assert.equal(residualPressure.clear, true);
  assert.equal(closeDecision.disposition, "close");
});

test("T-083 component-code carries test-design requirements downstream", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const testDesignFile = path.join(
    workspace,
    constraints.selectedOutputRoot,
    "design/adrs/ADR-003-test-design-surface.md"
  );
  writeFileSync(
    testDesignFile,
    `${readFileSync(testDesignFile, "utf8")}\nREQ-ENGINE-002: Test design owns dry-run assurance behavior.\n`,
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 22,
    contract,
    projectConstraints: constraints,
    runId: "t083-test-design-requirement-downstream"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  writeHandoffFiles(manifest);
  writeOutputSurface(manifest, "component_code_surface");
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/DataMapper.scala"
  );
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(
    sourcePath,
    [
      "// Implements: reqref://t066/default",
      "package generated",
      "object DataMapper"
    ].join("\n") + "\n",
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const testRequirementAssessment = report.obligationAssessments.find(
    (assessment) =>
      assessment.obligationId.includes(
        "build_tenants_scala_spark_design_adrs_adr_003_test_design_surface.req_engine_002"
      )
  );
  assert(testRequirementAssessment);
  assert.equal(testRequirementAssessment.fulfillmentStatus, "partial");
  assert(
    sdlcAssessmentCarriesRequirementForDownstreamClosure(
      testRequirementAssessment
    )
  );
  assert(
    sdlcWorkerAssessmentCarriesRequirementTransformationSet({
      manifest,
      assessment: testRequirementAssessment
    })
  );
  const edgeFulfillment = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [testRequirementAssessment.obligationId],
    assessments: [
      {
        obligationId: testRequirementAssessment.obligationId,
        fulfillmentStatus: testRequirementAssessment.fulfillmentStatus,
        evidenceRefs: testRequirementAssessment.evidenceRefs,
        ...(sdlcWorkerAssessmentCarriesRequirementTransformationSet({
          manifest,
          assessment: testRequirementAssessment
        })
          ? {
              carryDirection: "downstream_transformation_set",
              downstreamGraphFunctionRefs: [
                "graph-function://odd-sdlc/materialize_declared_product_asset"
              ],
              targetBindingRefs: [
                "target-binding://odd-sdlc/materialized-product"
              ]
            }
          : {})
      }
    ]
  });
  assert.equal(
    edgeFulfillment.nonConvergedReasonRefs.includes(
      testRequirementAssessment.obligationId
    ),
    false,
    JSON.stringify(edgeFulfillment, null, 2)
  );
  assert.equal(edgeFulfillment.downstreamTransformationSetRefs.length, 1);
  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(
    postflight.blockingReasons.some((reason) =>
      reason.includes(testRequirementAssessment.obligationId)
    ),
    false,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});

test("T-115 execution-result prompt allows repair while delegating evidence to installed operator", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    conformedProject: {
      ...deriveSdlcConformProjectProfileFromWorkspace(workspace),
      testExecutionContract: "sbt test"
    },
    projectConstraints: constraints,
    runId: "t115-executed-compile-failure-prompt"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.equal(
    manifest.allowedWriteRoots.includes(manifest.productMaterialization.tenantRoot),
    true
  );
  assert.match(prompt, /Edge-policy projection output/u);
  assert.match(
    prompt,
    /The installed operator runs the declared execution shards and publishes the sdlc_worker_execution_evidence carrier/u
  );
  assert.match(prompt, /Product materialization is execution-repair scoped/u);
  assert.match(prompt, /may edit product source\/test\/build files/u);
  assert.doesNotMatch(prompt, /productMaterialization\.executionShards exactly/u);
  assert.doesNotMatch(prompt, /Do not emit failed execution evidence/u);
  assert.doesNotMatch(
    prompt,
    /exits non-zero during compile, discovery, or test phases, record failed, not pending/u
  );
  assert.doesNotMatch(
    prompt,
    /Do not write product source\/test files for this edge/u
  );
});

test("T-102 execution-result postflight admits scoped tenant repair edits", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    conformedProject: {
      ...deriveSdlcConformProjectProfileFromWorkspace(workspace),
      testExecutionContract: "sbt test"
    },
    projectConstraints: constraints,
    runId: "t102-execution-repair-materialization"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "test_execution_result_surface");
  const productFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/cdme/Repair.scala"
  );
  const productContent = "package cdme\nobject Repair { val compiled = true }\n";
  mkdirSync(dirname(productFile), { recursive: true });
  writeFileSync(productFile, productContent, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "source",
      relativePath: path.relative(manifest.productMaterialization.tenantRoot, productFile),
      absolutePath: productFile,
      digest: sha256Text(productContent),
      byteCount: Buffer.byteLength(productContent, "utf8")
    }
  ];
  const shardEvidence = manifest.productMaterialization.executionShards.map(
    (shard) => ({
      kind: "sdlc_worker_execution_shard_evidence",
      shardId: shard.shardId,
      moduleName: shard.moduleName,
      lane: "test",
      command: shard.command,
      status: "succeeded",
      reportRefs: [`file://${manifest.outputFile}`],
      testsObserved: 1,
      passedCount: 1,
      failedCount: 0
    })
  );
  writeReport({
    manifest,
    digest: output.digest,
    summary: "execution-result evaluator attempted a tenant product edit",
    materializedFiles,
    executionEvidence: {
      kind: "sdlc_worker_execution_evidence",
      lane: "test",
      command: manifest.productMaterialization.testExecutionContract,
      status: "succeeded",
      reportRefs: [`file://${manifest.outputFile}`],
      testsObserved: shardEvidence.length,
      passedCount: shardEvidence.length,
      failedCount: 0,
      shardEvidence
    }
  });

  const report = readWorkerResultReport(manifest);
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.includes("unexpected_product_materialization_for_surface_edge"),
    false,
    JSON.stringify(postflight.blockingReasons)
  );
});

test("T-102 cross-archive report discovery rejects unstamped projections", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const operatorRunsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  const unstampedRunRoot = path.join(operatorRunsRoot, "prior-unstamped");
  const stampedRunRoot = path.join(operatorRunsRoot, "prior-stamped");
  mkdirSync(unstampedRunRoot, { recursive: true });
  mkdirSync(stampedRunRoot, { recursive: true });
  const basePriorReport = {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: "derive_test_execution_result_surface",
    edgeName: "derive_test_execution_result_surface",
    targetAssetType: "test_execution_result_surface",
    outputFile: path.join(stampedRunRoot, "test_execution_result_surface.md"),
    digest: "sha256:prior",
    summary: "prior execution result",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: []
  };
  writeFileSync(basePriorReport.outputFile, "# test_execution_result_surface\n", "utf8");
  writeFileSync(
    path.join(unstampedRunRoot, "worker_result_report.json"),
    stableJsonForTest(basePriorReport),
    "utf8"
  );
  writeFileSync(
    path.join(stampedRunRoot, "worker_result_report.json"),
    stableJsonForTest({
      ...basePriorReport,
      projectionRole: "typed_fp_stage_projection",
      authoritativeStageResultRef: pathToFileURL(
        path.join(stampedRunRoot, "fp_evaluate_result.json")
      ).href
    }),
    "utf8"
  );

  const contract = hookContractByEdgeName("derive_test_run_archive_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 31,
    contract,
    projectConstraints: constraints,
    runId: "t102-cross-archive-projection-contract"
  });
  const sourceAsset = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationId === "source_asset:test_execution_result_surface"
  );

  assert(sourceAsset);
  const stampedReportRef = pathToFileURL(
    path.join(stampedRunRoot, "worker_result_report.json")
  ).href;
  const stampedOutputRef = pathToFileURL(basePriorReport.outputFile).href;
  assert(
    sourceAsset.evidenceRefs.includes(stampedReportRef)
  );
  assert(
    sourceAsset.evidenceRefs.includes(stampedOutputRef)
  );
  assert.equal(
    sourceAsset.evidenceRefs.some((ref) => ref.includes("prior-unstamped")),
    false
  );
  assert(manifest.traversalObligationContext.authorityRefs.includes(stampedReportRef));
  assert(manifest.traversalObligationContext.authorityRefs.includes(stampedOutputRef));
  assert(
    manifest.traversalObligationContext.authorityIndex.some(
      (entry) => entry.ref === stampedOutputRef && entry.category === "runtime"
    )
  );
});

test("T-188 component repair schedule receives admitted execution result authority", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const priorRunRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/prior-execution-result"
  );
  mkdirSync(priorRunRoot, { recursive: true });
  const executionOutput = path.join(priorRunRoot, "test_execution_result_surface.md");
  writeFileSync(executionOutput, "# test_execution_result_surface\n", "utf8");
  writeFileSync(
    path.join(priorRunRoot, "worker_result_report.json"),
    stableJsonForTest({
      kind: "odd_sdlc.worker_result_report",
      projectionRole: "typed_fp_stage_projection",
      authoritativeStageResultRef: pathToFileURL(
        path.join(priorRunRoot, "fp_evaluate_result.json")
      ).href,
      graphFunctionName: "derive_test_execution_result_surface",
      edgeName: "derive_test_execution_result_surface",
      targetAssetType: "test_execution_result_surface",
      outputFile: executionOutput,
      digest: "sha256:prior",
      summary: "prior execution result",
      unresolvedReasons: [],
      materializedFiles: [],
      executionEvidence: null,
      executionEvidenceErrors: [],
      obligationAssessments: []
    }),
    "utf8"
  );

  const contract = hookContractByEdgeName("derive_component_repair_schedule_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 32,
    contract,
    projectConstraints: constraints,
    runId: "t188-repair-schedule-source-authority"
  });
  const sourceAsset = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationId === "source_asset:test_execution_result_surface"
  );
  const reportRef = pathToFileURL(
    path.join(priorRunRoot, "worker_result_report.json")
  ).href;
  const outputRef = pathToFileURL(executionOutput).href;

  assert(sourceAsset);
  assert(sourceAsset.evidenceRefs.includes(reportRef));
  assert(sourceAsset.evidenceRefs.includes(outputRef));
  assert(manifest.traversalObligationContext.authorityRefs.includes(reportRef));
  assert(manifest.traversalObligationContext.authorityRefs.includes(outputRef));
});

test("T-189 source asset authority consumes ABG admitted output projections", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const oversizedRuntimeRef = `runtime_projection:execution_basis:${JSON.stringify({
    workspaceRoot: workspace,
    target: "test_execution_result_surface",
    replayBasis: "x".repeat(900)
  })}`;
  const oversizedDispatchRef = `result:fp_dispatch:${JSON.stringify({
    basisId: oversizedRuntimeRef,
    dispatchRef: "dispatch://odd-sdlc/public-start"
  })}`;
  const admittedProjection = {
    kind: "admitted_output_authority_projection",
    scope: {
      kind: "payload_ledger_scope",
      basisId: "basis://t189",
      graphFunctionId: "graph-function://t189",
      graphCallId: "graph-call://t189",
      frameId: "frame://t189",
      vectorIndex: 17,
      edge: "derive_test_execution_result_surface"
    },
    targetCarrierContractRef:
      "target-carrier://odd-sdlc/derive_test_execution_result_surface/test_execution_result_surface",
    targetCarrierContractDigest: "sha256:t189-target-carrier",
    status: "admitted",
    reason: null,
    payloadRef: "payload://odd-sdlc/t189/test_execution_result_surface",
    payloadClass: "test_execution_result_surface",
    payloadDigest: "sha256:t189-test-execution-result",
    payloadContractRef: "payload-contract://odd-sdlc/test_execution_result_surface",
    producerRef: "producer://odd-sdlc/derive_test_execution_result_surface",
    sourceEventRef: "event://abg/t189/payload_observed",
    authorityRef: "authority://abg/t189/output-admitted",
    inputDigest: "sha256:t189-input",
    validationRefs: ["validation://abg/t189/payload_validated"],
    evidenceRefs: ["evidence://abg/t189/execution-result", oversizedRuntimeRef],
    relatedPayloadRefs: [
      "payload://odd-sdlc/t189/related-execution-result",
      oversizedDispatchRef
    ],
    projectionRef: "projection://abg/t189/output-authority"
  };
  const rejectedProjection = {
    ...admittedProjection,
    status: "rejected",
    payloadRef: "payload://odd-sdlc/t189/rejected-test_execution_result_surface",
    projectionRef: "projection://abg/t189/rejected-output-authority"
  };
  const unrelatedProjection = {
    ...admittedProjection,
    targetCarrierContractRef:
      "target-carrier://odd-sdlc/derive_component_code_surface/component_code_surface",
    payloadClass: "component_code_surface",
    payloadRef: "payload://odd-sdlc/t189/component_code_surface",
    payloadContractRef: "payload-contract://odd-sdlc/component_code_surface",
    producerRef: "producer://odd-sdlc/derive_component_code_surface",
    sourceEventRef: "event://abg/t189/component-code-payload-observed",
    authorityRef: "authority://abg/t189/component-code-output-admitted",
    validationRefs: ["validation://abg/t189/component-code-payload-validated"],
    evidenceRefs: ["evidence://abg/t189/component-code"],
    relatedPayloadRefs: ["payload://odd-sdlc/t189/related-component-code"],
    projectionRef: "projection://abg/t189/component-code-output-authority"
  };

  const refs = sourceAssetAuthorityRefsFromAbgOutputAuthorityProjections({
    assetType: "test_execution_result_surface",
    projections: [admittedProjection, rejectedProjection, unrelatedProjection]
  });
  assert(refs.includes(admittedProjection.payloadRef));
  assert(refs.includes(admittedProjection.projectionRef));
  assert.equal(refs.includes(oversizedRuntimeRef), false);
  assert.equal(refs.includes(oversizedDispatchRef), false);
  assert.equal(refs.includes(admittedProjection.evidenceRefs[0]), false);
  assert.equal(refs.includes(admittedProjection.relatedPayloadRefs[0]), false);
  assert.equal(refs.some((ref) => ref.includes("execution_basis:{")), false);
  assert.equal(
    refs.every((ref) => ref.length <= 300),
    true
  );
  assert.equal(refs.includes(rejectedProjection.payloadRef), false);
  assert.equal(refs.includes(unrelatedProjection.payloadRef), false);

  const contract = hookContractByEdgeName("derive_component_repair_schedule_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 32,
    contract,
    projectConstraints: constraints,
    outputAuthorityProjections: [admittedProjection],
    runId: "t189-abg-output-authority-source-asset"
  });
  const sourceAsset = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationId === "source_asset:test_execution_result_surface"
  );

  assert(sourceAsset);
  assert(sourceAsset.evidenceRefs.includes(admittedProjection.payloadRef));
  assert(sourceAsset.evidenceRefs.includes(admittedProjection.projectionRef));
  assert.equal(sourceAsset.evidenceRefs.includes(oversizedRuntimeRef), false);
  assert.equal(sourceAsset.evidenceRefs.includes(oversizedDispatchRef), false);
  assert.equal(
    sourceAsset.evidenceRefs.some((ref) => ref.includes("execution_basis:{")),
    false
  );
  assert.equal(
    sourceAsset.evidenceRefs.every((ref) => ref.length <= 300),
    true
  );
  assert(
    manifest.traversalObligationContext.authorityRefs.includes(
      admittedProjection.payloadRef
    )
  );
  assert(
    manifest.traversalObligationContext.authorityRefs.includes(
      admittedProjection.projectionRef
    )
  );
});

test("T-189 empty ABG output authority does not satisfy source asset dependency", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_run_archive_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 33,
    contract,
    projectConstraints: constraints,
    outputAuthorityProjections: [],
    runId: "t189-empty-abg-output-authority"
  });
  const sourceAsset = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationId === "source_asset:test_execution_result_surface"
  );

  assert(sourceAsset);
  assert.deepEqual(sourceAsset.evidenceRefs, [
    "asset-type://test_execution_result_surface"
  ]);
  assert.equal(
    sourceAsset.evidenceRefs.some((ref) => ref.startsWith("payload://")),
    false
  );
  assert.equal(
    sourceAsset.evidenceRefs.some((ref) => ref.startsWith("projection://abg/")),
    false
  );

  writeHandoffFiles(manifest);
  const content = [
    "# test_run_archive_surface",
    "",
    "Archive mentions test_execution_result_surface without admitted ABG output authority."
  ].join("\n");
  const artifact = `${content}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  const outputRef = `file://${manifest.outputFile}`;
  writeFileSync(
    manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          manifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: manifest.graphFunctionName,
        edgeName: manifest.edgeName,
        targetAssetType: manifest.targetAssetType,
        outputFile: manifest.outputFile,
        digest: sha256Text(artifact),
        summary: "archive lacks admitted execution-result output authority",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: null,
        obligationAssessments: manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [outputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const postflight = evaluateSdlcComputeStage({
    manifest,
    report: readWorkerResultReport(manifest)
  });
  assert(
    postflight.blockingReasonCarriers.some(
      (reason) =>
        reason.code === "source_asset_dependency_missing" &&
        reason.detail?.includes("test_execution_result_surface")
    )
  );
});

test("B-081 test execution preparation carries admitted schedule commands", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: b081_admitted_schedule_command",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    module_structure:",
      "      - analytics-core",
      "      - streaming-runtime"
    ].join("\n"),
    "utf8"
  );
  const tenantRoot = path.join(workspace, "build_tenants/scala_spark");
  const testDesignFile = path.join(
    tenantRoot,
    "design/adrs/ADR-003-test-design-surface.md"
  );
  mkdirSync(dirname(testDesignFile), { recursive: true });
  writeFileSync(
    testDesignFile,
    stableJsonForTest({
      kind: "sdlc_test_design_register",
      registerVersion: "ts-test-design-v1",
      targetAssetType: "test_design_surface",
      designConsumptionRows: [
        {
          kind: "sdlc_design_consumption_contract",
          contractRef: "design-consumption://b081/schedule-authority",
          sourceDesignObligationRefs: ["REQ-B081-SCHEDULE"],
          authorityBasisRefs: ["asset-type://test_design_surface"],
          consumerGraphFunctionRefs: [
            "prepare_test_execution_surface",
            "derive_test_execution_result_surface"
          ]
        }
      ],
      uatTestcaseRows: [
        {
          kind: "sdlc_test_case_row",
          testCaseRef: "TC-B081-001",
          caseKind: "regression",
          executionLane: "unit",
          sourceDesignObligationRefs: ["REQ-B081-SCHEDULE"],
          testcaseAuthorityRefs: ["testcase-authority://b081/schedule"],
          expectedBehavior: "Prepared execution uses the admitted schedule command."
        }
      ],
      testcaseAuthorityRows: [
        {
          kind: "sdlc_test_case_row",
          testCaseRef: "TC-B081-001",
          caseKind: "regression",
          executionLane: "unit",
          sourceDesignObligationRefs: ["REQ-B081-SCHEDULE"],
          testcaseAuthorityRefs: ["testcase-authority://b081/schedule"],
          expectedBehavior: "Prepared execution uses the admitted schedule command."
        }
      ],
      testStackProfileRows: [
        {
          kind: "sdlc_test_stack_profile_row",
          stackRef: "stack://b081/sbt",
          frameworkRef: "framework://scalatest",
          buildTool: "sbt"
        }
      ],
      testModuleRows: [
        {
          kind: "sdlc_test_module_row",
          moduleName: "analytics-core",
          moduleRef: "module://b081/analytics-core",
          testRoot: "analytics-core/src/test/scala"
        }
      ],
      testComponentTopologyRows: [
        {
          kind: "sdlc_test_component_topology_row",
          testClassId: "AnalyticsCoreSpec",
          relativePath: "analytics-core/src/test/scala/AnalyticsCoreSpec.scala",
          testcaseIds: ["TC-B081-001"],
          componentIds: ["analytics-core"],
          requirementIds: ["REQ-B081-SCHEDULE"],
          shardId: "test-shard-01-analytics-core"
        }
      ],
      testDataBindings: [
        {
          kind: "sdlc_test_data_binding",
          testDataRef: "test-data://b081/default",
          testCaseRef: "TC-B081-001",
          inputFixtureRefs: ["fixture://b081/default"],
          generationPolicyRef: "generation-policy://b081/static",
          expectedResultRef: "expected-result://b081/TC-B081-001",
          sourceDesignObligationRefs: ["REQ-B081-SCHEDULE"]
        }
      ],
      expectedResultBindings: [
        {
          kind: "sdlc_expected_result_binding",
          expectedResultRef: "expected-result://b081/TC-B081-001",
          testCaseRef: "TC-B081-001",
          assertionRefs: ["assertion://b081/schedule-command"],
          expectedResultSummary: "The schedule command is preserved.",
          verificationPolicyRef: "verification-policy://b081/schedule"
        }
      ],
      uatIntegrationBindings: [
        {
          kind: "sdlc_uat_integration_binding",
          uatTestCaseRef: "TC-B081-001",
          integrationTestCaseRef: "TC-B081-001",
          executionLane: "unit"
        }
      ],
      testExecutionScheduleRows: [
        {
          kind: "sdlc_test_execution_schedule_row",
          scheduleRef: "test-schedule://b081/analytics-core",
          testCaseRefs: ["TC-B081-001"],
          command: 'sbt "coreModel/test"',
          frameworkRef: "framework://scalatest",
          shardId: "test-shard-01-analytics-core"
        }
      ]
    }),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("prepare_test_execution_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    projectConstraints: constraints,
    runId: "b081-admitted-schedule-command"
  });
  assert.equal(
    manifest.productMaterialization.executionShards[0]?.command,
    "sbt test"
  );
  assert.equal(writeDeclaredEdgeProjectionOutput({ manifest }), manifest.outputFile);
  const payload = JSON.parse(readFileSync(manifest.outputFile, "utf8"));
  assert.deepStrictEqual(
    payload.testExecutionPreparationRows.map((row) => row.command),
    ['sbt "coreModel/test"']
  );
});

test("B-085 archive retry preserves targeted execution shard scope", () => {
  const workspace = makeWorkspace();
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: b085_archive_targeted_scope",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    module_structure:",
      "      - cdme-compiler",
      "      - cdme-engine"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);

  const executionContract = hookContractByEdgeName(
    "derive_test_execution_result_surface"
  );
  const executionManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: executionContract.edgeName,
    vectorIndex: 17,
    contract: executionContract,
    projectConstraints: constraints,
    retryContext: retryContextForModule(),
    runId: "b085-targeted-execution-result"
  });
  assert.deepStrictEqual(
    executionManifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    ["cdme-compiler"]
  );
  writeHandoffFiles(executionManifest);
  const executionOutput = writeOutputSurface(
    executionManifest,
    "test_execution_result_surface"
  );
  const executionShard = executionManifest.productMaterialization.executionShards[0];
  writeFileSync(
    executionManifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          executionManifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: executionManifest.graphFunctionName,
        edgeName: executionManifest.edgeName,
        targetAssetType: executionManifest.targetAssetType,
        outputFile: executionManifest.outputFile,
        digest: executionOutput.digest,
        summary: "targeted execution-result dependency with one admitted shard",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: {
          kind: "sdlc_worker_execution_evidence",
          lane: "test",
          command: executionShard.command,
          status: "succeeded",
          reportRefs: [`file://${executionManifest.outputFile}`],
          testsObserved: 1,
          passedCount: 1,
          failedCount: 0,
          shardEvidence: [
            {
              kind: "sdlc_worker_execution_shard_evidence",
              shardId: executionShard.shardId,
              moduleName: executionShard.moduleName,
              lane: "test",
              command: executionShard.command,
              status: "succeeded",
              reportRefs: [`file://${executionManifest.outputFile}`],
              testsObserved: 1,
              passedCount: 1,
              failedCount: 0
            }
          ]
        },
        obligationAssessments: executionManifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [`file://${executionManifest.outputFile}`],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const executionReport = readWorkerResultReport(executionManifest);
  assert.equal(
    evaluateSdlcComputeStage({
      manifest: executionManifest,
      report: executionReport
    }).status,
    "passed"
  );

  const archiveContract = hookContractByEdgeName("derive_test_run_archive_surface");
  const archiveManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: archiveContract.edgeName,
    vectorIndex: 18,
    contract: archiveContract,
    projectConstraints: constraints,
    retryContext: retryContextForModule({
      edgeName: "derive_test_run_archive_surface",
      targetAssetType: "test_run_archive_surface",
      vectorIndex: 18
    }),
    runId: "b085-targeted-archive"
  });
  assert.equal(
    archiveManifest.traversalStrategyDecision.selectedStrategy,
    "targeted_repair"
  );
  assert.deepStrictEqual(
    archiveManifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    ["cdme-compiler"]
  );
  writeHandoffFiles(archiveManifest);
  const archiveContent = [
    "# test_run_archive_surface",
    "",
    "Archived dependencies:",
    ...archiveManifest.inputAssetTypes.map((assetType) => `- ${assetType}`),
    "Requirement trace: REQ-T066-001"
  ].join("\n");
  const archiveArtifact = `${archiveContent}\n`;
  mkdirSync(dirname(archiveManifest.outputFile), { recursive: true });
  writeFileSync(archiveManifest.outputFile, archiveArtifact, "utf8");
  const archiveOutputRef = `file://${archiveManifest.outputFile}`;
  writeFileSync(
    archiveManifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(archiveManifest.fpEvaluateResultFile).href,
        graphFunctionName: archiveManifest.graphFunctionName,
        edgeName: archiveManifest.edgeName,
        targetAssetType: archiveManifest.targetAssetType,
        outputFile: archiveManifest.outputFile,
        digest: sha256Text(archiveArtifact),
        summary: "archive cites targeted execution-result dependency",
        unresolvedReasons: [],
        materializedFiles: [],
        executionEvidence: null,
        obligationAssessments: archiveManifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs:
              obligation.obligationId === "source_asset:test_execution_result_surface"
                ? [
                    archiveOutputRef,
                    `file://${executionManifest.reportFile}`,
                    ...obligation.evidenceRefs
                  ]
                : [archiveOutputRef, ...obligation.evidenceRefs],
            blockingReasons: []
          })
        )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const archiveReport = readWorkerResultReport(archiveManifest);
  const archivePostflight = evaluateSdlcComputeStage({
    manifest: archiveManifest,
    report: archiveReport
  });
  assert.equal(archivePostflight.status, "passed");
});

test("T-159 component-depth prompts pin the top-level register envelope on first attempt", () => {
  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const cases = [
    {
      edgeName: "derive_implementation_design_surface",
      targetAssetType: "implementation_design_surface",
      registerKind: "design_depth_register",
      carrierKind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      envelopePattern:
        /The evaluate\.C\/F_P design-depth evaluator populates the design-depth register/u,
      rowDirective: /requirement-lineage table/u,
      extraDirectives: [
        /Product File Targets section/u,
        /Evaluator-owned outputs stay with the framework/u
      ]
    },
    {
      edgeName: "derive_component_code_surface",
      targetAssetType: "component_code_surface",
      registerKind: "component_depth_register",
      carrierKind: "sdlc_component_depth_register",
      registerVersion: "ts-component-depth-v1",
      rowDirective: /payload\.componentRealizationRows/u,
      extraDirectives: [
        /componentRealizationRows must contain only source\/implementation rows/u,
        /Role=test targets, test\/ paths, proof-test targets, and execution evidence belong to component_test_surface/u,
        /Do not emit payload\.componentRepairSchedule on component_code_surface/u,
        /source target set from admitted composite implementation design authority/u,
        /Exclude role=test fileTargetRows, validator\/proof-test component topology rows/u,
        /Build config files alone never satisfy required role source/u
      ]
    },
    {
      edgeName: "qualify_component_realization_surface",
      targetAssetType: "component_realization_qualification_surface",
      registerKind: "component_depth_register",
      carrierKind: "sdlc_component_depth_register",
      registerVersion: "ts-component-depth-v1",
      frameworkOwned: true,
      publisherDirective:
        /The installed operator publishes the component_realization_qualification_surface carrier/u,
      forbiddenDirectives: [/payload\.componentRealizationRows/u]
    },
    {
      edgeName: "qualify_component_test_execution_surface",
      targetAssetType: "component_test_qualification_surface",
      registerKind: "component_depth_register",
      carrierKind: "sdlc_component_depth_register",
      registerVersion: "ts-component-depth-v1",
      frameworkOwned: true,
      publisherDirective:
        /The installed operator publishes the component_test_qualification_surface carrier/u,
      forbiddenDirectives: [
        /payload\.componentTestQualificationRows/u,
        /literal field name status/u,
        /passed, failed, blocked, pending, or unproven/u
      ]
    },
    {
      edgeName: "derive_component_repair_schedule_surface",
      targetAssetType: "component_repair_schedule_surface",
      registerKind: "component_depth_register",
      carrierKind: "sdlc_component_depth_register",
      registerVersion: "ts-component-depth-v1",
      rowDirective: /payload\.componentRepairSchedule/u,
      extraDirectives: [
        /sdlc_component_repair_schedule_row/u,
        /attributionConfidence=high only when/u,
        /scheduleStatus=triage_gap/u,
        /generic repair depth/u
      ]
    },
	    {
	      edgeName: "prepare_test_execution_surface",
	      targetAssetType: "test_execution_surface",
	      registerKind: "test_execution_surface_register",
	      carrierKind: "sdlc_test_execution_surface_register",
	      registerVersion: "ts-test-execution-v1",
	      frameworkOwned: true,
	      publisherDirective:
	        /Test-execution-surface carrier protocol is evaluator-owned/u,
	      forbiddenDirectives: [/payload\.testExecutionPreparationRows/u]
	    }
	  ];

  for (const promptCase of cases) {
    const contract = hookContractByEdgeName(promptCase.edgeName);
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot: workspace,
      graphFunctionName: promptCase.edgeName,
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      projectConstraints: constraints,
      runId: `t159-component-depth-envelope-${promptCase.targetAssetType}`
    });
    const handoffFiles = writeHandoffFiles(manifest);
    const prompt = readFileSync(handoffFiles.promptPath, "utf8");
    const invocationPackage = JSON.parse(
      readFileSync(handoffFiles.invocationPackagePath, "utf8")
    );
    const defaultEnvelopePrefix =
      promptCase.registerKind === "component_depth_register"
        ? `Emit a raw JSON ${promptCase.registerKind} selected target-carrier envelope with `
        : `Emit a fenced \`json ${promptCase.registerKind}\` selected target-carrier envelope with `;
    const envelopePattern =
      promptCase.envelopePattern ??
      new RegExp(
        defaultEnvelopePrefix +
          String.raw`[\s\S]*` +
          `\`targetAssetType:"${promptCase.targetAssetType}"\`` +
          String.raw`[\s\S]*` +
          `\`payload.kind:"${promptCase.carrierKind}"\`` +
          String.raw`[\s\S]*` +
          `\`payload.registerVersion:"${promptCase.registerVersion}"\`` +
          String.raw`[\s\S]*` +
          `\`payload.targetAssetType:"${promptCase.targetAssetType}"\`\\.`,
        "u"
      );

    if (promptCase.frameworkOwned === true) {
      assert.match(prompt, promptCase.publisherDirective);
      assert.match(prompt, /Edge-policy projection output/u);
      for (const forbiddenDirective of promptCase.forbiddenDirectives ?? []) {
        assert.doesNotMatch(prompt, forbiddenDirective);
      }
      assert.equal(
        invocationPackage.outcomeDirectives.some((directive) =>
          /Edge-policy projection output/u.test(directive)
        ),
        true
      );
    } else {
      assert.match(prompt, envelopePattern);
    }
    assert.match(prompt, /Do not inspect odd_sdlc framework source code/u);
    if (promptCase.rowDirective !== undefined) {
      assert.match(prompt, promptCase.rowDirective);
    }
    for (const extraDirective of promptCase.extraDirectives ?? []) {
      assert.match(prompt, extraDirective);
    }
    if (promptCase.frameworkOwned !== true) {
      assert.equal(
        invocationPackage.outcomeDirectives.some((directive) =>
          envelopePattern.test(directive)
        ),
        true
      );
    }
    if (promptCase.targetAssetType === "test_execution_surface") {
      assert.notEqual(
        manifest.targetCarrierProjection.constructionTemplate
          .payloadTemplate,
        null
      );
      assert.equal(
        manifest.targetCarrierProjection.constructionTemplate
          .payloadTemplate.fieldTypes.testExecutionPreparationRows,
        "sdlc_test_execution_preparation_row[]"
      );
      assert.equal(
        manifest.targetCarrierProjection.constructionTemplate.rowTemplates
          .length,
        1
      );
    }
  }
});

test("T-100 component-test postflight admits materialized tests before execution discoverability proof", () => {
  const workspace = makeWorkspace();
  declareScalaSbtTestRunner(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const tenantRoot = path.join(workspace, "build_tenants/scala_spark");
  mkdirSync(tenantRoot, { recursive: true });
  writeFileSync(
    path.join(tenantRoot, "build.sbt"),
    [
      'ThisBuild / scalaVersion := "2.12.18"',
      'lazy val root = project.in(file(".")).settings(name := "t100")'
    ].join("\n"),
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    projectConstraints: constraints,
    runId: "t100-non-discoverable-component-test"
  });
  const handoffFiles = writeHandoffFiles(manifest);
  const prompt = readFileSync(handoffFiles.promptPath, "utf8");

  assert.match(prompt, /For component_test_surface, materialize developer test files/);
  assert.match(prompt, /payload\.componentTestRows/u);
  assert.match(prompt, /componentTestRows\[\]\.requirementIds is the carrier field/u);
  assert.match(prompt, /must be a string array/u);
  assert.match(prompt, /payload\.componentTestRows\[\]\.relativePath must name/);
  assert.match(prompt, /evidence archives, not product test files/);
  assert.match(prompt, /On schema-local re-entry, repair the rejected component_depth_register fields first/u);
  assert.match(prompt, /Materialized tests must preserve declared testClassId/);
  assert.match(prompt, /avoid local identifiers that collide with matcher words/u);
  assert.match(prompt, /prefer shouldEqual or parenthesized shouldBe RHS/u);

  const output = writeOutputSurface(manifest, "component_test_surface");
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "cdme-core/src/test/scala/cdme/CoreSpec.scala"
  );
  const testContent = [
    ...requirementTraceLines(manifest),
    "package cdme",
    "object CoreSpec {",
    "  def main(args: Array[String]): Unit = assert(true)",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "test",
      relativePath: path.relative(manifest.productMaterialization.tenantRoot, testPath),
      absolutePath: testPath,
      digest: sha256Text(`${testContent}\n`),
      byteCount: Buffer.byteLength(`${testContent}\n`, "utf8"),
      requirementTraceObligationIds: requirementObligationIds(manifest)
    }
  ];
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated standalone main-style test object",
    materializedFiles
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasons.some((reason) =>
      reason.startsWith("test_materialization_not_discoverable")
    ),
    false
  );
});

test("T-100 component-test postflight admits sbt-discoverable framework tests", () => {
  const workspace = makeWorkspace();
  declareScalaSbtTestRunner(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const tenantRoot = path.join(workspace, "build_tenants/scala_spark");
  mkdirSync(tenantRoot, { recursive: true });
  writeFileSync(
    path.join(tenantRoot, "build.sbt"),
    [
      'ThisBuild / scalaVersion := "2.12.18"',
      'libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.19" % Test',
      'lazy val root = project.in(file(".")).settings(name := "t100")'
    ].join("\n"),
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    projectConstraints: constraints,
    runId: "t100-discoverable-component-test"
  });
  writeHandoffFiles(manifest);
  const output = writeOutputSurface(manifest, "component_test_surface");
  const testPath = path.join(
    manifest.productMaterialization.tenantRoot,
    "cdme-core/src/test/scala/cdme/CoreSpec.scala"
  );
  const testContent = [
    "package cdme",
    "import org.scalatest.funsuite.AnyFunSuite",
    "final class CoreSpec extends AnyFunSuite {",
    "  test(\"core contract\") { assert(1 == 1) }",
    "}"
  ].join("\n");
  mkdirSync(dirname(testPath), { recursive: true });
  writeFileSync(testPath, `${testContent}\n`, "utf8");
  const materializedFiles = [
    {
      kind: "sdlc_materialized_product_file",
      role: "test",
      relativePath: path.relative(manifest.productMaterialization.tenantRoot, testPath),
      absolutePath: testPath,
      digest: sha256Text(`${testContent}\n`),
      byteCount: Buffer.byteLength(`${testContent}\n`, "utf8")
    }
  ];
  writeReport({
    manifest,
    digest: output.digest,
    summary: "generated sbt-discoverable ScalaTest module",
    materializedFiles
  });

  const report = readWorkerResultReport(manifest);
  writeProductMaterializationManifest({ manifest, report });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(
    postflight.blockingReasons.some((reason) =>
      reason.startsWith("test_materialization_not_discoverable")
    ),
    false
  );
});

test("T-066 non-materialization surface ignores prior admitted product lineage", () => {
  const workspace = makeWorkspace();
  const conformedProject = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  const priorManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_component_code_surface",
    edgeName: "derive_component_code_surface",
    vectorIndex: 0,
    contract: hookContractByEdgeName("derive_component_code_surface"),
    conformedProject,
    runId: "20260515T000000000Z_prior_code"
  });
  writeHandoffFiles(priorManifest);
  const sourcePath = path.join(
    priorManifest.productMaterialization.tenantRoot,
    "src/Main.scala"
  );
  const sourceContent = "object DataMapper extends App { println(\"Hello\") }\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, sourceContent, "utf8");
  const priorRegister = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "generated-data-mapper",
        moduleName: "src",
        relativePath: "src/Main.scala",
        publicBoundary: "DataMapper",
        concernRole: "mapper",
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://data_mapper"]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "generated-data-mapper",
        moduleName: "src",
        relativePath: "src/Main.scala",
        publicBoundary: "DataMapper",
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://data_mapper"]
      }
    ],
    testComponentTopologyRows: [],
    componentTestRows: [],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
  const priorOutputContent = `${JSON.stringify(priorRegister, null, 2)}\n`;
  mkdirSync(dirname(priorManifest.outputFile), { recursive: true });
  writeFileSync(priorManifest.outputFile, priorOutputContent, "utf8");
  writeReport({
    manifest: priorManifest,
    digest: sha256Text(priorOutputContent),
    summary: "materialized source once",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(
          priorManifest.productMaterialization.tenantRoot,
          sourcePath
        ),
        absolutePath: sourcePath,
        digest: sha256Text(sourceContent),
        byteCount: Buffer.byteLength(sourceContent, "utf8")
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: priorManifest,
    report: readWorkerResultReport(priorManifest)
  });
  const priorAdmission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: priorManifest.targetAssetType,
    outputFile: priorManifest.outputFile
  });
  assert.equal(
    priorAdmission.status,
    "admitted",
    priorAdmission.blockingReasons.join(",")
  );
  assert.ok(priorAdmission.register.componentRealizationRows.length > 0);

  const surfaceManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "qualify_component_realization_surface",
    edgeName: "qualify_component_realization_surface",
    vectorIndex: 0,
    contract: hookContractByEdgeName("qualify_component_realization_surface"),
    conformedProject,
    runId: "20260515T000100000Z_surface"
  });
  const surfaceOutput = writeOutputSurface(
    surfaceManifest,
    "component_realization_qualification_surface"
  );
  const report = buildPostTransformWorkerResultReport({
    manifest: surfaceManifest,
    before: snapshotProductMaterializationRoot(surfaceManifest.productMaterialization)
  });

  assert.equal(surfaceManifest.productMaterialization.required, false);
  assert.equal(report.digest, surfaceOutput.digest);
  assert.deepEqual(report.materializedFiles, []);
});

test("T-188 no-dispatch system projection writes component-depth output before closure checks", () => {
  const workspace = makeWorkspace();
  const conformedProject = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  const priorManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_component_code_surface",
    edgeName: "derive_component_code_surface",
    vectorIndex: 0,
    contract: hookContractByEdgeName("derive_component_code_surface"),
    conformedProject,
    runId: "20260515T000000000Z_prior_code"
  });
  writeHandoffFiles(priorManifest);
  const sourcePath = path.join(
    priorManifest.productMaterialization.tenantRoot,
    "src/Main.scala"
  );
  const sourceContent = "object DataMapper extends App { println(\"Hello\") }\n";
  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, sourceContent, "utf8");
  const priorOutput = writeOutputSurface(priorManifest, "component_code_surface");
  writeReport({
    manifest: priorManifest,
    digest: priorOutput.digest,
    summary: "materialized source once",
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: path.relative(
          priorManifest.productMaterialization.tenantRoot,
          sourcePath
        ),
        absolutePath: sourcePath,
        digest: sha256Text(sourceContent),
        byteCount: Buffer.byteLength(sourceContent, "utf8")
      }
    ]
  });
  writeProductMaterializationManifest({
    manifest: priorManifest,
    report: readWorkerResultReport(priorManifest)
  });

  const surfaceManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "qualify_component_realization_surface",
    edgeName: "qualify_component_realization_surface",
    vectorIndex: 0,
    contract: hookContractByEdgeName("qualify_component_realization_surface"),
    conformedProject,
    runId: "20260515T000100000Z_surface"
  });
  const before = snapshotProductMaterializationRoot(
    surfaceManifest.productMaterialization
  );
  assert.equal(
    priorManifest.outputFile,
    path.join(
      surfaceManifest.productMaterialization.tenantRoot,
      "design/component_code_surface.md"
    )
  );

  assert.equal(existsSync(surfaceManifest.outputFile), false);
  assert.equal(
    writeDeclaredEdgeProjectionOutput({ manifest: surfaceManifest }),
    surfaceManifest.outputFile
  );
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: surfaceManifest.targetAssetType,
    outputFile: surfaceManifest.outputFile
  });
  assert.notEqual(
    admission.blockingReasons.includes("component_depth_output_missing"),
    true
  );

  const report = buildPostTransformWorkerResultReport({
    manifest: surfaceManifest,
    before
  });
  assert.equal(
    report.digest,
    sha256Text(readFileSync(surfaceManifest.outputFile, "utf8"))
  );
  assert.deepEqual(report.materializedFiles, []);
});

test("T-159 lineage-only product materialization miss yields for operator iteration", () => {
  const lineageReason = makeSdlcBlockingReason({
    code: "materialized_product_requirement_lineage_missing",
    detail: "src/main.rs: requirementTraceObligationIds",
    evidenceRefs: ["file:///workspace/build_tenants/hello_world_rust/src/main.rs"]
  });
  const yieldResumeBasis = deriveSdlcProductLineageYieldResumeBasis({
    runRef: "file%3A%2F%2F%2Fworkspace%2F.ai-workspace%2Fruntime%2Frun-1",
    edgeRef: "edge://odd-sdlc/derive_component_code_surface/0",
    blockingReasonCarriers: [lineageReason],
    productEvidenceRefs: [
      "file:///workspace/build_tenants/hello_world_rust/src/main.rs"
    ],
    livenessProjectionRefs: ["liveness://odd-sdlc/run-1"]
  });

  assert(yieldResumeBasis);
  assert.equal(
    yieldResumeBasis.yieldKind,
    "partial_product_evidence_admitted_current_edge_should_resume"
  );
  assert.equal(
    yieldResumeBasis.resumePolicyRef,
    "resume-policy://odd-sdlc/materialized-product-lineage/operator-iterate"
  );
  assert.deepStrictEqual(yieldResumeBasis.admittedProgressRefs, [
    "file:///workspace/build_tenants/hello_world_rust/src/main.rs"
  ]);

  const competingRetryReason = makeSdlcBlockingReason({
    code: "test_execution_not_succeeded",
    evidenceRefs: ["file:///workspace/.ai-workspace/runtime/run-1/postflight.json"]
  });
  assert.equal(
    deriveSdlcProductLineageYieldResumeBasis({
      runRef: "file%3A%2F%2F%2Fworkspace%2F.ai-workspace%2Fruntime%2Frun-1",
      edgeRef: "edge://odd-sdlc/derive_component_code_surface/0",
      blockingReasonCarriers: [lineageReason, competingRetryReason],
      productEvidenceRefs: [
        "file:///workspace/build_tenants/hello_world_rust/src/main.rs"
      ],
      livenessProjectionRefs: ["liveness://odd-sdlc/run-1"]
    }),
    null
  );
});

const T102_OPEN_COUNTS = Object.freeze({
  expected: 1,
  fulfilled: 0,
  partial: 0,
  blocked: 1,
  unfulfilled: 0,
  missing: 0,
  extra: 0
});

const T102_CLOSE_COUNTS = Object.freeze({
  expected: 1,
  fulfilled: 1,
  partial: 0,
  blocked: 0,
  unfulfilled: 0,
  missing: 0,
  extra: 0
});

function t102SelectedComposition(id) {
  return deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: "graph-function://t102/axiomatic-construction-algebra",
    graphVectorRef: "edge://odd-sdlc/derive_test_execution_result_surface/26",
    compositionSelectionScopeRef: `test://t102/${id}`,
    carrierContextRefs: [`carrier://t102/${id}`],
    assuranceContextRefs: []
  });
}

function t102Ledger(id, options = {}) {
  const selectedComposition = t102SelectedComposition(id);
  return constructSdlcEdgeFulfillmentLedger({
    selectedComposition,
    ledgerRef: `ledger://t102/${id}`,
    ledgerVersionRef: `ledger-version://t102/${id}`,
    edgeRef: "edge://odd-sdlc/derive_test_execution_result_surface/26",
    attemptRef: `attempt://t102/${id}`,
    targetBindingRefs: [`target-binding://t102/${id}`],
    evidenceBundleRefs: [
      ...(options.evidenceBundleRefs ?? [`evidence://t102/${id}`])
    ],
    materializationRefs: options.materializationRefs ?? [],
    admissionRefs: options.admissionRefs ?? [],
    edgeResidualPressureRefs: options.edgeResidualPressureRefs ?? [],
    targetCarrierContractRef: options.targetCarrierContractRef ?? null,
    targetCarrierContractDigest: options.targetCarrierContractDigest ?? null,
    targetCarrierAdmissionStatus: options.targetCarrierAdmissionStatus ?? null,
    targetCarrierAdmissionRef: options.targetCarrierAdmissionRef ?? null,
    counts: options.converged === true ? T102_CLOSE_COUNTS : T102_OPEN_COUNTS,
    admitted: options.admitted ?? true,
    targetCertificationPassed: options.targetCertificationPassed ?? true,
    fdRecheckPassed: options.fdRecheckPassed ?? true
  });
}

function t102Closure(disposition) {
  const id = disposition.replaceAll(/[^a-z]+/gu, "-");
  const ledger = t102Ledger(id, { converged: disposition === "close" });
  const common = {
    decisionRef: `decision://t102/${id}`,
    ledger,
    currentEdgeLawful: disposition !== "block",
    blockReasonRefs: disposition === "block" ? [`reason://t102/${id}`] : []
  };
  if (disposition === "yield") {
    return deriveSdlcEdgeClosureDecision({
      ...common,
      yieldResumeBasis: {
        yieldKind: "partial_product_evidence_admitted_current_edge_should_resume",
        resumeBasisRef: `resume-basis://t102/${id}`,
        currentEdgeRef: ledger.edgeRef,
        admittedProgressRefs: [`progress://t102/${id}`],
        livenessProjectionRef: null,
        resumePolicyRef: `resume-policy://t102/${id}`
      }
    });
  }
  return deriveSdlcEdgeClosureDecision({
    ...common,
    retryReasonRefs: disposition === "retry" ? [`reason://t102/${id}`] : [],
    repairReasonRefs: disposition === "repair" ? [`reason://t102/${id}`] : [],
    reenterReasonRefs:
      disposition === "re-enter" ? [`reason://t102/${id}`] : [],
    repriceReasonRefs: disposition === "reprice" ? [`reason://t102/${id}`] : []
  });
}

function t102Projection(input) {
  const selected = input.selected ?? false;
  const selectedComposition =
    input.closureDecision?.selectedComposition ?? t102SelectedComposition(input.id);
  return constructSdlcNextActionProjection({
    selectedComposition,
    nextActionProjectionRef: `next-action://t102/${input.id}`,
    intentEventRefs: [`event://t102/${input.id}`],
    productAssetModelRef: `asset-model://t102/${input.id}`,
    gapPressureRefs: [`pressure://t102/${input.id}`],
    targetBindingRefs: [`target-binding://t102/${input.id}`],
    closureDecision: input.closureDecision ?? null,
    observationRef: `observation://t102/${input.id}`,
    policyRefs: [`policy://t102/${input.id}`],
    actionCatalogRefs: [`catalog://t102/${input.id}`],
    selectedActionRef: selected ? `action://t102/${input.id}` : null,
    nextGraphFunctionRef: selected ? `graph-function://t102/${input.id}` : null,
    nextGraphVectorRef: selected ? `graph-vector://t102/${input.id}` : null
  });
}

function makeT102PromptSweepWorkspace() {
  const root = makeWorkspace();
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t102_prompt_sweep",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    declared_modules:",
      "      - core"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function makeT102NodeExecutionWorkspace() {
  const root = makeWorkspace();
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t102_node_execution",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript/",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  const tenantRoot = path.join(root, "build_tenants/typescript");
  mkdirSync(path.join(tenantRoot, "test"), { recursive: true });
  writeFileSync(
    path.join(tenantRoot, "test/hello.test.js"),
    [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "test('hello world', () => {",
      "  assert.equal('hello'.toUpperCase(), 'HELLO');",
      "});"
    ].join("\n") + "\n",
    "utf8"
  );
  return root;
}

function t102FullBreadthTraversalAttemptEnvelope(edgeName) {
  return Object.freeze({
    strategyDirectiveRef: `strategy://t102/full-breadth/${edgeName}`,
    selectedScheduleItemRefs: Object.freeze([]),
    requiredProgressArtifactRefs: Object.freeze([])
  });
}

function stableJsonForTest(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}test("T-102 installed operator interface writes execution evidence carrier", () => {
  const workspace = makeT102NodeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: contract.edgeName,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t102-installed-operator-execution-evidence"
  });
  const before = snapshotProductMaterializationRoot(
    manifest.productMaterialization
  );
  const priorRunRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/t102-prepared-execution-surface"
  );
  const priorOutputFile = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/assets/t102-prepared/test_execution_surface.md"
  );
  const priorSurface = stableJsonForTest({
    kind: "sdlc_test_execution_surface_register",
    registerVersion: "ts-test-execution-v1",
    targetAssetType: "test_execution_surface",
    testExecutionPreparationRows: [
      {
        kind: "sdlc_test_execution_preparation_row",
        scheduleRef: "test-schedule://t102/hello",
        moduleName: "hello-tests",
        testClassId: "hello.test.js",
        testcaseIds: ["TC-HELLO-001"],
        command: "node --test test/hello.test.js",
        workingDirectory: "build_tenants/typescript",
        frameworkRef: "framework://node-test",
        shardId: "test-shard-hello",
        sourceTestFileRefs: ["workspace://build_tenants/typescript/test/hello.test.js"],
        requirementIds: ["REQ-T102-HELLO"],
        status: "prepared",
        evidenceRefs: ["workspace://build_tenants/typescript/test/hello.test.js"]
      }
    ],
    evidenceRefs: ["workspace://build_tenants/typescript/test/hello.test.js"],
    summary: "prepared T-102 node execution"
  });
  mkdirSync(dirname(priorOutputFile), { recursive: true });
  mkdirSync(priorRunRoot, { recursive: true });
  writeFileSync(priorOutputFile, priorSurface, "utf8");
  writeFileSync(
    path.join(priorRunRoot, "worker_result_report.json"),
    stableJsonForTest({
      kind: "odd_sdlc.worker_result_report",
      projectionRole: "typed_fp_stage_projection",
      authoritativeStageResultRef: pathToFileURL(
        path.join(priorRunRoot, "fp_evaluate_result.json")
      ).href,
      graphFunctionName: "prepare_test_execution_surface",
      edgeName: "prepare_test_execution_surface",
      targetAssetType: "test_execution_surface",
      outputFile: priorOutputFile,
      digest: sha256Text(priorSurface),
      summary: "prior prepared execution surface",
      unresolvedReasons: [],
      materializedFiles: [],
      obligationAssessments: []
    }),
    "utf8"
  );

  const previousNodeTestContext = process.env["NODE_TEST_CONTEXT"];
  process.env["NODE_TEST_CONTEXT"] = "1";
  try {
    assert.equal(
      writeDeclaredEdgeProjectionOutput({ manifest }),
      manifest.outputFile
    );
  } finally {
    if (previousNodeTestContext === undefined) {
      delete process.env["NODE_TEST_CONTEXT"];
    } else {
      process.env["NODE_TEST_CONTEXT"] = previousNodeTestContext;
    }
  }

  const payload = JSON.parse(readFileSync(manifest.outputFile, "utf8"));
  assert.equal(payload.kind, "sdlc_worker_execution_evidence");
  assert.equal(payload.lane, "test");
  assert.equal(payload.status, "succeeded");
  assert.equal(payload.testsObserved, 1);
  assert.equal(payload.passedCount, 1);
  assert.equal(payload.failedCount, 0);
  assert.equal(payload.shardEvidence.length, 1);
  assert.equal(payload.shardEvidence[0].shardId, "test-shard-hello");
  assert.equal(payload.shardEvidence[0].moduleName, "hello-tests");
  assert.equal(payload.shardEvidence[0].command, "node --test test/hello.test.js");

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  assert.equal(report.executionEvidence.status, "succeeded");
  assert.equal(report.executionEvidence.shardEvidence[0].status, "succeeded");
});

test("T-171 repair schedule carrier is F_P-owned and ledger-evaluated", () => {
  const workspace = makeT102NodeExecutionWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const contract = hookContractByEdgeName("derive_component_repair_schedule_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: contract.edgeName,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    projectConstraints: constraints,
    runId: "t102-installed-operator-repair-schedule"
  });

  assert.equal(writeDeclaredEdgeProjectionOutput({ manifest }), null);

  const handoffFiles = writeHandoffFiles(manifest);
  const prompt = readFileSync(handoffFiles.promptPath, "utf8");
  assert.doesNotMatch(prompt, /Edge-policy projection output/u);
  assert.match(prompt, /Emit payload\.componentRepairSchedule/u);
  assert.match(prompt, /payload\.componentTopologyRows=\[\]/u);
  assert.match(prompt, /payload\.componentExecutionFailureRegister=null/u);
  assert.match(prompt, /Do not copy topology, realization, test-topology/u);
  assert.match(prompt, /attributionConfidence=high only when/u);
  assert.match(prompt, /scheduleStatus=triage_gap/u);
  assert.match(prompt, /generic repair depth/u);
});

test("T-102 axiomatic construction algebra sweep maps fold dispositions to next-action law", () => {
  const expectations = [
    ["close", "post_close_graph_continuation", true],
    ["yield", "post_yield_resume", false],
    ["retry", "post_retry", true],
    ["repair", "post_repair", true],
    ["re-enter", "post_reenter", true],
    ["reprice", "post_reprice", false],
    ["block", "post_block", false]
  ];

  for (const [disposition, basisKind, selectsTraversal] of expectations) {
    const closureDecision = t102Closure(disposition);
    assert.equal(closureDecision.disposition, disposition);
    const projection = t102Projection({
      id: `disposition/${disposition}`,
      closureDecision,
      selected: selectsTraversal
    });
    assert.equal(projection.nextActionBasisKind, basisKind);
    assert.equal(projection.choosesNextTraversal, selectsTraversal);

    if (!selectsTraversal) {
      assert.throws(
        () =>
          t102Projection({
            id: `disposition/${disposition}/forbidden-selection`,
            closureDecision,
            selected: true
          }),
        /basis cannot select a next action/u
      );
    }
  }

  const initialNext = t102Projection({
    id: "target-kind/next",
    closureDecision: null,
    selected: true
  });
  assert.equal(initialNext.nextActionBasisKind, "initial_selection");
  assert.equal(initialNext.choosesNextTraversal, true);

  const closeDecision = t102Closure("close");
  for (const targetKind of [
    "explicit_graph_function",
    "overlay_continuation",
    "archive_crash_reentry"
  ]) {
    const projection = t102Projection({
      id: `target-kind/${targetKind}`,
      closureDecision: closeDecision,
      selected: true
    });
    assert.equal(projection.nextActionBasisKind, "post_close_graph_continuation");
    assert.equal(projection.choosesNextTraversal, true);
  }
});

test("T-102 axiomatic construction algebra sweep preserves vector relation law", () => {
  const currentVectorIndex = 7;
  const relations = [
    ["same_vector", currentVectorIndex],
    ["next_overlay_vector", currentVectorIndex + 1],
    ["no_vector", null]
  ];
  const dispositions = ["close", "repair", "retry", "yield", "block", "reprice"];

  for (const disposition of dispositions) {
    for (const [relation, nextVectorIndex] of relations) {
      const normalized = normalizePostCloseContinuationVectorIndex({
        closureDecisionDisposition: disposition,
        currentVectorIndex,
        nextVectorIndex
      });
      const expected =
        disposition === "close" && relation === "same_vector"
          ? null
          : nextVectorIndex;
      assert.equal(
        normalized,
        expected,
        `${disposition}/${relation} normalized vector relation`
      );
    }
  }
});

test("T-102 axiomatic construction algebra sweep separates evidence admission from edge permission", () => {
  const evidenceOnlyRows = [
    {
      id: "target-carrier",
      options: {
        targetCarrierContractRef: "target-carrier-contract://t102/edge",
        targetCarrierContractDigest: "sha256:t102-target-carrier",
        targetCarrierAdmissionStatus: "admitted",
        targetCarrierAdmissionRef: "target-carrier-admission://t102/edge",
        admissionRefs: ["target-carrier-admission://t102/edge"]
      }
    },
    {
      id: "materialization",
      options: {
        materializationRefs: ["materialized-product-file://t102/source"]
      }
    },
    {
      id: "execution-evidence",
      options: {
        evidenceBundleRefs: ["execution-evidence://t102/test-run"]
      }
    },
    {
      id: "assurance-gap",
      options: {
        converged: true,
        edgeResidualPressureRefs: ["pressure://t102/assurance-gap"]
      }
    }
  ];

  for (const row of evidenceOnlyRows) {
    const ledger = t102Ledger(row.id, row.options);
    const closureDecision = deriveSdlcEdgeClosureDecision({
      decisionRef: `decision://t102/evidence/${row.id}`,
      ledger,
      currentEdgeLawful: true
    });
    assert.notEqual(
      closureDecision.disposition,
      "close",
      `${row.id} evidence alone must not close`
    );
    const projection = t102Projection({
      id: `evidence/${row.id}`,
      closureDecision
    });
    assert.equal(projection.nextActionBasisKind, "post_block");
  }

  const workspace = makeWorkspace();
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const permissionRows = [
    {
      className: "surface-only",
      edgeName: "derive_requirement_surface",
      required: false,
      tenantWritable: false,
      executionShards: false
    },
    {
      className: "materialization-required",
      edgeName: "derive_component_code_surface",
      required: true,
      tenantWritable: true,
      executionShards: false
    },
    {
      className: "execution-repair scoped",
      edgeName: "derive_test_execution_result_surface",
      required: false,
      tenantWritable: true,
      executionShards: true
    }
  ];

  for (const row of permissionRows) {
    const contract = hookContractByEdgeName(row.edgeName);
    const conformedProject = deriveSdlcConformProjectProfileFromWorkspace(workspace);
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot: workspace,
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: contract.edgeName,
      vectorIndex: 26,
      contract,
      conformedProject:
        contract.targetAssetType === "test_execution_result_surface"
          ? { ...conformedProject, testExecutionContract: "sbt test" }
          : conformedProject,
      projectConstraints: constraints,
      runId: `t102-permission-${row.className.replaceAll(/[^a-z]+/gu, "-")}`
    });
    assert.equal(
      manifest.productMaterialization.required,
      row.required,
      row.className
    );
    assert.equal(
      manifest.allowedWriteRoots.includes(manifest.productMaterialization.tenantRoot),
      row.tenantWritable,
      row.className
    );
    assert.equal(
      manifest.productMaterialization.executionShards.length > 0,
      row.executionShards,
      row.className
    );
  }
});

test("T-171 installed-operator shard runner honors manifest timeout unless explicitly capped", () => {
  const edgeProjectionSource = readFileSync(
    resolve(PACKAGE_ROOT, "code/src/operator/plugins/consequence/edge_projection.ts"),
    "utf8"
  );
  const start = edgeProjectionSource.indexOf("function installedOperatorShardTimeoutMs");
  const end = edgeProjectionSource.indexOf("const INSTALLED_OPERATOR_SHARD_RUNNER_SOURCE", start);
  assert(start >= 0, "installedOperatorShardTimeoutMs must remain visible in consequence projection source");
  assert(end > start, "installedOperatorShardTimeoutMs source slice must be bounded");
  const timeoutPolicySource = edgeProjectionSource.slice(start, end);
  assert.match(timeoutPolicySource, /sdlcOperatorRuntimePolicy/u);
  assert.match(timeoutPolicySource, /minimumOperatorTimeoutMs/u);
  assert.match(timeoutPolicySource, /installedOperatorShardTimeoutCapMs/u);
  assert.match(timeoutPolicySource, /Math\.min\(declaredTimeoutMs, runtimePolicy\.installedOperatorShardTimeoutCapMs\)/);
  assert.match(timeoutPolicySource, /return declaredTimeoutMs;/);
  assert.doesNotMatch(timeoutPolicySource, /15000/);
});
