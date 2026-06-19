// Validates: T-161, T-188

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  analyzeSdlcFdRunArchive,
  renderSdlcFdRunAnalysisMarkdown,
  resolveSdlcFdRunAnalysisProfile,
  SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_CODE_VALUES,
  SDLC_FD_RUN_ANALYSIS_KIND,
  SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES
} from "../../build/semantic/code/src/analysis/index.js";
import {
  invokeOddSdlcSpecMethodCommandSync,
  serializeOddSdlcSpecMethodResult,
  typecheckCurrentSdlcGtlProgram
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const TEST_RUNS_ROOT = resolve(PACKAGE_ROOT, "test_env/test_runs");

const CLEAN_T132_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "scenario_t132_hello_world_js_live/20260512T050346719Z_pid65805"
);
const RETRY_HEAVY_T132_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "scenario_t132_hello_world_js_live/20260512T034912177Z_pid64074"
);
const ABORTED_T132_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "scenario_t132_hello_world_js_live/20260512T044815391Z_pid44464"
);
const FRESH_T133_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "scenario_t133_hello_world_rust_live/20260512T055755078Z_pid33268"
);
const DATA_MAPPER_SCALE_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "full_external_data_mapper_sandbox/20260511T172019616Z_pid87986"
);
const DATA_MAPPER_REPAIR_TIMEOUT_ARCHIVE = resolve(
  TEST_RUNS_ROOT,
  "full_external_data_mapper_sandbox/20260511T112004427Z_pid37576"
);
const CLI_MAIN = resolve(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");

const T132_EDGE_ORDER = Object.freeze([
  { name: "Fg_conform_project_authority", target: "project_bootstrap_surface" },
  { name: "derive_feature_decomp_surface", target: "feature_decomp_surface" },
  { name: "derive_design_surface", target: "design_surface" },
  { name: "derive_scenario_surface", target: "scenario_surface" },
  { name: "derive_implementation_design_surface", target: "implementation_design_surface" },
  { name: "derive_component_code_surface", target: "component_code_surface" },
  { name: "qualify_component_realization_surface", target: "component_realization_qualification_surface" },
  { name: "derive_code_surface", target: "code_surface" },
  { name: "derive_test_design_surface", target: "test_design_surface" },
  { name: "derive_component_test_surface", target: "component_test_surface" },
  { name: "prepare_test_execution_surface", target: "test_execution_surface" },
  { name: "derive_test_execution_result_surface", target: "test_execution_result_surface" }
]);

const T132_FULL_LIFECYCLE_EDGE_ORDER = Object.freeze([
  { name: "Fg_conform_project_authority", target: "project_bootstrap_surface" },
  { name: "derive_intent_surface", target: "intent_surface" },
  { name: "derive_product_surface", target: "product_surface" },
  { name: "derive_goal_surface", target: "goal_surface" },
  { name: "derive_requirement_surface", target: "requirement_surface" },
  { name: "derive_uat_testcases_surface", target: "uat_testcases_surface" },
  { name: "derive_testcase_authority_surface", target: "testcase_authority_surface" },
  { name: "derive_feature_decomp_surface", target: "feature_decomp_surface" },
  { name: "derive_design_surface", target: "design_surface" },
  { name: "derive_scenario_surface", target: "scenario_surface" },
  { name: "derive_implementation_design_surface", target: "implementation_design_surface" },
  { name: "derive_component_code_surface", target: "component_code_surface" },
  { name: "qualify_component_realization_surface", target: "component_realization_qualification_surface" },
  { name: "derive_code_surface", target: "code_surface" },
  { name: "derive_test_design_surface", target: "test_design_surface" },
  { name: "derive_component_test_surface", target: "component_test_surface" },
  { name: "prepare_test_execution_surface", target: "test_execution_surface" },
  { name: "derive_test_execution_result_surface", target: "test_execution_result_surface" },
  { name: "qualify_component_test_execution_surface", target: "component_test_execution_qualification_surface" },
  { name: "derive_component_repair_schedule_surface", target: "component_repair_schedule_surface" },
  { name: "derive_test_run_archive_surface", target: "test_run_archive_surface" },
  { name: "derive_release_depth_parity_surface", target: "release_depth_parity_surface" },
  { name: "prepare_release_surface", target: "release_surface" }
]);

const T132_LINEAGE_REFS = Object.freeze([
  "requirement:t132_hello_world_single_tenant.stage_01_t132_requirements.req_t132_001",
  "requirement:t132_hello_world_single_tenant.stage_01_t132_requirements.req_t132_002",
  "requirement:t132_hello_world_single_tenant.stage_01_t132_requirements.req_t132_003",
  "requirement:t132_hello_world_single_tenant.stage_01_t132_requirements.req_t132_004",
  "requirement:t132_hello_world_single_tenant.stage_01_t132_requirements.req_t132_005"
]);

function designDepthGtlSelectedComposition() {
  const resultInterface = typecheckCurrentSdlcGtlProgram()
    .pluginResultInterfaceCatalog.interfaces.find(
      (contract) =>
        contract.compositionRef ===
          "abg.fn_composition://odd-sdlc/derive_implementation_design_surface" &&
        contract.stageRole === "evaluate" &&
        contract.computeMeans === "F_P" &&
        contract.outputCarrierRefs.includes("SdlcDesignDepthRegister")
    );
  assert.ok(resultInterface, "admitted design-depth GTL result interface exists");
  return {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: resultInterface.compositionRef,
    compositionDigest: resultInterface.compositionDigest,
    resultInterfaceRef: resultInterface.resultInterfaceRef,
    resultEnvelopeContractRef: resultInterface.resultEnvelopeContractRef,
    resultInterfaceContractDigest:
      resultInterface.resultInterfaceContractDigest,
    compositionSelectionRef:
      "abg.fn_composition_selection://odd-sdlc/derive_implementation_design_surface/t161",
    selectedRegimeBindingRef:
      "abg.fn_composition.regime_binding://odd-sdlc/derive_implementation_design_surface/evaluate/F_P",
    graphFunctionRef: "derive_implementation_design_surface",
    graphVectorRef: "derive_implementation_design_surface",
    basisRef: "basis://t161/design-depth-gtl"
  };
}

function archiveExists(archiveRoot) {
  return existsSync(archiveRoot);
}

function walkFiles(rootDir) {
  const out = [];
  const visit = (dir, base) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const child = path.join(dir, entry.name);
      const rel = base.length === 0 ? entry.name : `${base}/${entry.name}`;
      if (entry.isDirectory()) {
        visit(child, rel);
      } else if (entry.isFile()) {
        out.push({ path: child, relative: rel, mtimeMs: statSync(child).mtimeMs });
      }
    }
  };
  visit(rootDir, "");
  return out;
}

function snapshotInspectedRoot(inspectedRoot) {
  return walkFiles(inspectedRoot).map((entry) => `${entry.relative}:${entry.mtimeMs}`).sort();
}

function makeTempDir(prefix = "odd-sdlc-ts-t161-") {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

function isoFromMs(ms) {
  const d = new Date(ms);
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");
  return [
    d.getUTCFullYear(),
    pad2(d.getUTCMonth() + 1),
    pad2(d.getUTCDate()),
    "T",
    pad2(d.getUTCHours()),
    pad2(d.getUTCMinutes()),
    pad2(d.getUTCSeconds()),
    pad3(d.getUTCMilliseconds()),
    "Z"
  ].join("");
}

function writeJson(filePath, body, fileMtimeMs) {
  writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
  if (typeof fileMtimeMs === "number") {
    const seconds = fileMtimeMs / 1000;
    utimesSync(filePath, seconds, seconds);
  }
}

function writeText(filePath, body, fileMtimeMs) {
  writeFileSync(filePath, body, "utf8");
  if (typeof fileMtimeMs === "number") {
    const seconds = fileMtimeMs / 1000;
    utimesSync(filePath, seconds, seconds);
  }
}

function buildSyntheticT132Archive(opts) {
  const {
    rootDir,
    pid = 11000,
    startMs,
    edgeStepMs = 65_000,
    workerElapsedMsPerEdge = 60_000,
    edges = T132_EDGE_ORDER,
    finalProductLineageRefs = T132_LINEAGE_REFS,
    overrides = {}
  } = opts;
  const start = typeof startMs === "number"
    ? startMs
    : Date.parse("2026-05-12T05:03:46.719Z");
  const archiveRoot = rootDir;
  const workspaceRoot = path.join(archiveRoot, "workspace");
  const operatorRunsRoot = path.join(
    workspaceRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  mkdirSync(operatorRunsRoot, { recursive: true });
  writeJson(path.join(archiveRoot, "run_summary.json"), {
    kind: "scenario_run_summary",
    name: "synthetic_t132"
  });
  const tenantRoot = path.join(workspaceRoot, "build_tenants/hello_world_javascript");
  const operatorRunRoots = [];
  for (let index = 0; index < edges.length; index += 1) {
    const edge = edges[index];
    const override = overrides[index] ?? {};
    const dirStartMs = start + index * edgeStepMs;
    const dirMtimeMs = dirStartMs + workerElapsedMsPerEdge;
    const dirName = `${isoFromMs(dirStartMs)}_pid${pid + index}`;
    const operatorRunRoot = path.join(operatorRunsRoot, dirName);
    mkdirSync(operatorRunRoot, { recursive: true });
    const isProductEdge = edge.name === "derive_component_code_surface";
    const closureDisposition = override.closureDisposition ?? "close";
    const postflightStatus = override.postflightStatus ?? "passed";
    const blockingReasonCodes = override.blockingReasonCodes ?? [];
    const residualPressureRefs = override.residualPressureRefs ?? [];
    const isImplementationDesignEdge =
      edge.target === "implementation_design_surface";
    const selectedComposition = isImplementationDesignEdge
      ? designDepthGtlSelectedComposition()
      : {
          kind: "sdlc_selected_abg_fn_composition_identity",
          compositionRef: `abg.fn_composition://synthetic/${edge.name}/${index}`,
          compositionDigest: `digest://synthetic/${edge.name}/${index}`,
          compositionSelectionRef:
            `abg.fn_composition_selection://synthetic/${edge.name}/${index}`,
          selectedRegimeBindingRef:
            `abg.fn_composition.regime_binding://synthetic/${edge.name}/${index}/evaluate/fp`,
          graphFunctionRef: `graph-function://synthetic/${edge.name}`,
          graphVectorRef: edge.name,
          basisRef: "basis://synthetic/t161"
        };
    const compositionRef = selectedComposition.compositionRef;
    const compositionDigest = selectedComposition.compositionDigest;
    const compositionSelectionRef = selectedComposition.compositionSelectionRef;
    const selectedRegimeBindingRef = selectedComposition.selectedRegimeBindingRef;
    const designDepthRegisterPath = path.join(
      operatorRunRoot,
      "design_depth_fp_evaluator_register.json"
    );
    const designDepthContentRegisterPath = path.join(
      operatorRunRoot,
      "design_depth_fp_evaluator_content_register.json"
    );
    const designDepthRuleOutcomePath = path.join(
      operatorRunRoot,
      "design_depth_fp_evaluator_rule_outcome.json"
    );
    const designDepthRegisterRef = pathToFileURL(designDepthRegisterPath).href;
    const designDepthContentRegisterRef =
      pathToFileURL(designDepthContentRegisterPath).href;
    const designDepthRuleOutcomeRef =
      pathToFileURL(designDepthRuleOutcomePath).href;
    const defaultExecutionCommand = edge.target === "test_execution_result_surface"
      ? "node --test test/hello.test.js"
      : "node build_tenants/hello_world_javascript/src/hello.js";
    const defaultExecutionReportRef = `file://${path.join(
      operatorRunRoot,
      edge.target === "test_execution_result_surface"
        ? "test-shard-01-graph-test.stdout.log"
        : "test-shard-01-hello-world-javascript.stdout.log"
    )}`;
    const executionEvidence = override.executionEvidence ??
      (
        edge.target === "component_code_surface" ||
        edge.target === "test_execution_result_surface"
          ? {
              kind: "sdlc_worker_execution_evidence",
              lane: "test",
              command: defaultExecutionCommand,
              status: "succeeded",
              reportRefs: [defaultExecutionReportRef],
              shardEvidence: [
                {
                  shardId: "test-shard-01",
                  command: defaultExecutionCommand,
                  status: "succeeded",
                  reportRef: defaultExecutionReportRef
                }
              ],
              testsObserved: 1,
              passedCount: 1,
              failedCount: 0
            }
          : null
      );
    const blockingReasonCarriers = blockingReasonCodes.map((code) => ({
      kind: "sdlc_blocking_reason",
      code,
      reasonClass: "missing_evidence",
      lawfulReentryPoint: "same_edge_retry",
      message: "synthetic blocking reason",
      detail: null,
      evidenceRefs: []
    }));
    const isAbortShape = override.isAbortShape === true;
    if (!isAbortShape) {
      writeJson(
        path.join(operatorRunRoot, "operator_summary.json"),
        {
          kind: "sdlc_operator_summary",
          graphFunctionName: edge.name,
          currentEdge: edge.name,
          status: postflightStatus === "passed" ? "worker_invoked" : "blocked",
          blockingReason: blockingReasonCodes[0] ?? null,
          blockingReasons: blockingReasonCodes,
          nextLawfulAction: `next://synthetic/${edge.name}`,
          archiveRoot: operatorRunRoot
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "worker_run.json"),
        {
          kind: "sdlc_worker_run_result",
          command: "synthetic",
          args: [],
          cwd: workspaceRoot,
          executorProfile: "synthetic",
          terminalSessionId: null,
          streamModel: "stdio",
          outcome: { kind: "exited", status: 0 },
          structuredEventCount: 1,
          structuredParseFailureCount: 0,
          apiRetryCount: 0,
          toolCallCount: 1,
          status: 0,
          signal: null,
          elapsedMs: workerElapsedMsPerEdge,
          timedOut: false,
          stdoutByteCount: 64,
          stderrByteCount: 0,
          stdoutPath: path.join(operatorRunRoot, "worker_stdout.log"),
          stderrPath: path.join(operatorRunRoot, "worker_stderr.log"),
          outputLastMessagePath: null,
          error: null
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "postflight.json"),
        {
          kind: "sdlc_operator_postflight_result",
          status: postflightStatus,
          blockingReasons: blockingReasonCodes,
          blockingReasonCarriers,
          evidenceRefs: []
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "sdlc_edge_closure_decision.json"),
        {
          kind: "sdlc_edge_closure_decision",
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          selectedRegimeBindingRef,
          decisionRef: `closure-decision://synthetic/${edge.name}/${index}`,
          ledgerRef: `ledger://synthetic/${edge.name}`,
          ledgerVersionRef: `ledger-version://synthetic/${edge.name}/${index}`,
          disposition: closureDisposition,
          basisRefs: []
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "sdlc_edge_fulfillment_ledger.json"),
        {
          kind: "sdlc_edge_fulfillment_ledger",
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          selectedRegimeBindingRef,
          ledgerRef: `ledger://synthetic/${edge.name}`,
          ledgerVersionRef: `ledger-version://synthetic/${edge.name}/${index}`,
          edgeRef: `edge://synthetic/${edge.name}/${index}`,
          attemptRef: `attempt://synthetic/${edge.name}/${index}`,
          targetBindingRefs: [],
          evidenceBundleRefs: [],
          counts: {
            expected: 1,
            fulfilled: closureDisposition === "close" ? 1 : 0,
            partial: 0,
            blocked: closureDisposition === "block" ? 1 : 0,
            unfulfilled: 0,
            missing: 0,
            extra: 0
          },
          edgeResidualPressureRefs: residualPressureRefs,
          targetCarrierAdmissionStatus:
            override.targetCarrierAdmissionStatus ?? "admitted",
          targetCarrierAdmissionRef:
            override.targetCarrierAdmissionRef ?? null
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "sdlc_edge_gain.json"),
        {
          kind: "sdlc_edge_gain",
          edgeRef: edge.name,
          fulfilledCount: closureDisposition === "close" ? 1 : 0,
          expectedCount: 1,
          residualPressureRefs,
          evidenceRefs: executionEvidence === null ? [] : executionEvidence.reportRefs
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "sdlc_next_action_projection.json"),
        {
          kind: "sdlc_next_action_projection",
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          selectedRegimeBindingRef,
          choosesNextTraversal: index < edges.length - 1,
          nextActionProjectionRef: `next-action://synthetic/${edge.name}/${index}`,
          selectedActionRef: `construction-action://synthetic/${edge.name}`,
          nextGraphFunctionRef:
            index < edges.length - 1
              ? `graph-function://synthetic/${edges[index + 1].name}`
              : null,
          nextGraphVectorRef:
            index < edges.length - 1 ? edges[index + 1].name : null,
          predecessorRefs: [`closure-decision://synthetic/${edge.name}/${index}`],
          overlayRef: null
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "handoff_manifest.json"),
        {
          kind: "sdlc_worker_handoff_manifest",
          contractVersion: "synthetic-v1",
          workspaceRoot,
          archiveRoot: operatorRunRoot,
          graphFunctionName: edge.name,
          edgeName: edge.name,
          vectorIndex: 0,
          inputAssetTypes: [],
          targetAssetType: edge.target,
          outputFile: path.join(tenantRoot, `design/${edge.target}.md`),
          reportFile: path.join(operatorRunRoot, "worker_result_report.json")
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "fp_evaluate_result.json"),
        {
          kind: "sdlc_fp_evaluate_result",
          stage: "F_P.evaluate",
          computeNotationStage: "evaluate.C",
          stageAuthority: "typed_fp_stage_carriers",
          selectedComposition,
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          selectedRegimeBindingRef,
          evaluationRef: `evaluation://synthetic/${edge.name}/${index}`,
          findings: isImplementationDesignEdge
            ? [
                {
                  findingRef:
                    `finding://synthetic/${edge.name}/${index}/design-depth-register`,
                  compositionRef,
                  compositionDigest,
                  authorityRefs: [
                    designDepthContentRegisterRef,
                    designDepthRegisterRef
                  ],
                  evidenceRefs: [
                    designDepthContentRegisterRef,
                    designDepthRegisterRef
                  ]
                }
              ]
            : [],
          evaluation: {
            evaluationRef: `evaluation://synthetic/${edge.name}/${index}`,
            status: postflightStatus,
              findingRefs: isImplementationDesignEdge
              ? [
                  `finding://synthetic/${edge.name}/${index}/design-depth-register`
                ]
              : []
          },
          status: postflightStatus,
          postflightStatus,
          blockingReasons: blockingReasonCodes,
          evidenceRefs: isImplementationDesignEdge
            ? [
                designDepthRuleOutcomeRef,
                designDepthContentRegisterRef,
                designDepthRegisterRef
              ]
            : []
        },
        dirMtimeMs
      );
      const obligationIds = Array.from(
        { length: 22 },
        (_, i) => `target_asset:${edge.target}/${i}`
      );
      if (isImplementationDesignEdge) {
        const designDepthRegisterPayload = {
            kind: "sdlc_design_depth_register",
            registerVersion: "ts-design-depth-v1",
            targetAssetType: "implementation_design_surface",
            stackProfileRows: [
              {
                kind: "sdlc_stack_profile_row",
                stackRef: "stack://synthetic/node",
                language: "javascript",
                buildTool: "npm"
              }
            ],
            implementationModuleRows: [
              {
                kind: "sdlc_implementation_module_row",
                moduleName: "hello_world_javascript",
                moduleRef: "module://synthetic/hello_world_javascript"
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
                componentId: "hello-world-entrypoint",
                moduleName: "hello_world_javascript",
                relativePath: "src/hello.js",
                publicBoundary: "Prints the required greeting.",
                concernRole: "other",
                requirementIds: [...finalProductLineageRefs],
                sourceAssetRefs: [designDepthRegisterRef]
              }
            ],
            componentRealizationRows: [
              {
                kind: "sdlc_component_realization_row",
                componentId: "hello-world-entrypoint",
                moduleName: "hello_world_javascript",
                relativePath: "src/hello.js",
                publicBoundary: "Prints the required greeting.",
                trancheId: null,
                firstProductFileToChange: "src/hello.js",
                upstreamComponentIds: [],
                requirementIds: [...finalProductLineageRefs],
                sourceAssetRefs: [designDepthRegisterRef]
              }
            ],
            fileTargetRows: [
              {
                kind: "sdlc_file_target_row",
                relativePath: "src/hello.js",
                role: "source"
              }
            ],
            designCompletenessVerdict: null
          };
        writeJson(
          designDepthContentRegisterPath,
          {
            kind: "sdlc_evaluate_content_register",
            registerVersion: "ts-evaluate-content-register-v1",
            stage: "evaluate.C",
            ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
            ruleRole: "semantic_judgment",
            computeMeans: "F_P",
            authorityFunction: "synthesize_model",
            selectedCompositionRef: compositionRef,
            selectedCompositionDigest: compositionDigest,
            selectedCompositionSelectionRef: compositionSelectionRef,
            selectedRegimeBindingRef,
            compositionContributionRef: selectedRegimeBindingRef,
            sourceBasisRefs: [pathToFileURL(operatorRunRoot).href],
            candidateArtifactRefs: [pathToFileURL(operatorRunRoot).href],
            evidenceRefs: [pathToFileURL(operatorRunRoot).href],
            contentRows: [
              {
                kind: "sdlc_evaluate_content_register_row",
                rowRef: `evaluate-content-row://synthetic/${edge.name}/${index}/design-depth-register`,
                authorityFunction: "synthesize_model",
                carrierFamily: "ProductAssetModel",
                contentKind: "sdlc_design_depth_register",
                payload: designDepthRegisterPayload,
                sourceBasisRefs: [pathToFileURL(operatorRunRoot).href],
                evidenceRefs: [pathToFileURL(operatorRunRoot).href]
              }
            ]
          },
          dirMtimeMs
        );
        writeJson(
          designDepthRegisterPath,
          designDepthRegisterPayload,
          dirMtimeMs
        );
        writeJson(
          designDepthRuleOutcomePath,
          {
            kind: "evaluation_rule_outcome",
            status: "accepted",
            ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
            ruleRole: "semantic_judgment",
            computeMeans: "F_P",
            producedRegisterRefs: [
              designDepthContentRegisterRef,
              designDepthRegisterRef
            ],
            evidenceRefs: [
              designDepthContentRegisterRef,
              designDepthRegisterRef
            ],
            findingRefs: [
              `finding://synthetic/${edge.name}/${index}/design-depth-register`
            ],
            humanResponseRefs: [],
            residualPressureRefs: [],
            continuationRefs: [],
            diagnosticRefs: [],
            selectedCompositionRef: compositionRef,
            selectedCompositionDigest: compositionDigest,
            selectedCompositionSelectionRef: compositionSelectionRef,
            selectedRegimeBindingRef,
            compositionContributionRef: selectedRegimeBindingRef,
            reason: null
          },
          dirMtimeMs
        );
      }
      const assessmentPath = path.join(
        operatorRunRoot,
        "review_grade_edge_fulfillment_assessment.json"
      );
      const assessmentRef = pathToFileURL(assessmentPath).href;
      const reviewRunPath = path.join(
        operatorRunRoot,
        "review_grade_edge_fulfillment_run.json"
      );
      const reviewPromptPath = path.join(
        operatorRunRoot,
        "review_grade_edge_fulfillment_prompt.md"
      );
      const reviewEventsPath = path.join(
        operatorRunRoot,
        "review_grade_edge_fulfillment_process_events.jsonl"
      );
      writeText(
        reviewPromptPath,
        `synthetic review-grade evaluator prompt for ${edge.name}\n`,
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "review_grade_edge_fulfillment_stdout.log"),
        `reviewStatus=passed reviewed=${obligationIds.length} blocked=0\n`,
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "review_grade_edge_fulfillment_stderr.log"),
        "",
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "review_grade_edge_fulfillment_process_started.json"),
        {
          kind: "actor_process_started",
          pid: pid + index + 10_000,
          observedAtMs: dirStartMs + 1
        },
        dirMtimeMs
      );
      writeText(
        reviewEventsPath,
        [
          JSON.stringify({
            kind: "actor_process_started",
            pid: pid + index + 10_000,
            observedAtMs: dirStartMs + 1
          }),
          JSON.stringify({
            kind: "actor_process_exited",
            pid: pid + index + 10_000,
            status: 0,
            elapsedMs: 120,
            observedAtMs: dirMtimeMs
          })
        ].join("\n") + "\n",
        dirMtimeMs
      );
      writeJson(
        reviewRunPath,
        {
          kind: "sdlc_review_grade_edge_fulfillment_run",
          status: 0,
          signal: null,
          elapsedMs: 120,
          timedOut: false,
          promptRef: pathToFileURL(reviewPromptPath).href,
          assessmentRef,
          processEventsRef: pathToFileURL(reviewEventsPath).href
        },
        dirMtimeMs
      );
      writeJson(
        assessmentPath,
        {
          kind: "sdlc_review_grade_edge_fulfillment_assessment",
          assessmentVersion: "ts-review-grade-v1",
          graphFunctionName: edge.name,
          edgeName: edge.name,
          targetAssetType: edge.target,
          status: "passed",
          reviewedObligationIds: obligationIds,
          findings: obligationIds.map((obligationId) => ({
            kind: "sdlc_review_grade_obligation_finding",
            obligationId,
            fulfillmentStatus: "fulfilled",
            failureClass: null,
            requiredAction: null,
            evidenceRefs: [assessmentRef],
            acceptedAuthorityRefs: [assessmentRef],
            rationale:
              "Synthetic clean archive carries admitted review-grade stage truth."
          })),
          evidenceRefs: [assessmentRef],
          summary: "Synthetic review-grade assessment passed."
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "gtl_admitted_state_ref.json"),
        {
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          graphCallRef: `graph-call://synthetic/${edge.name}/${index}`,
          frameRef: `frame://synthetic/${edge.name}/${index}`,
          eventRefs: [`event://synthetic/${edge.name}/${index}/evaluate`],
          ledgerRefs: [`ledger://synthetic/${edge.name}`],
          projectionRefs: [`projection://synthetic/${edge.name}/${index}`]
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "gtl_consequence_projection_ref.json"),
        {
          consequenceRef: `consequence://synthetic/${edge.name}/${index}`,
          compositionRef,
          compositionDigest,
          compositionSelectionRef,
          assuranceDecisionRef: `assurance://synthetic/${edge.name}/${index}`,
          traversalTransitionRef: `transition://synthetic/${edge.name}/${index}`,
          domainReadModelRefs: [
            `next-action://synthetic/${edge.name}/${index}`
          ]
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "worker_result_report.json"),
        {
          kind: "odd_sdlc.worker_result_report",
          graphFunctionName: edge.name,
          edgeName: edge.name,
          targetAssetType: edge.target,
          outputFile: path.join(tenantRoot, `design/${edge.target}.md`),
          digest: "sha256:synthetic",
          summary: "synthetic",
          unresolvedReasons: [],
          materializedFiles: [],
          materializationDiagnostics: [],
          executionEvidence,
          executionEvidenceErrors: [],
          obligationAssessments: obligationIds.map((obligationId) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [],
            blockingReasons: []
          }))
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "worker_construction_brief.json"),
        {
          kind: "sdlc_worker_construction_brief",
          briefVersion: "ts-worker-construction-brief-v1",
          graphFunctionName: edge.name,
          edgeName: edge.name,
          vectorIndex: 0,
          sourceAssetTypes: [],
          targetAssetType: edge.target,
          canonicalPromptCarrierPath:
            path.join(operatorRunRoot, "worker_construction_brief.json"),
          promptSourcePolicyRef:
            "policy://odd-sdlc/worker-prompt-source/worker-construction-brief/v1",
          packageDispositions: [
            {
              kind: "sdlc_worker_construction_brief_package_disposition",
              packageName: "worker_construction_brief.json",
              path: path.join(operatorRunRoot, "worker_construction_brief.json"),
              digest: "sha256:synthetic-construction-brief",
              disposition: "canonical",
              role: "single prompt source carrier"
            },
            {
              kind: "sdlc_worker_construction_brief_package_disposition",
              packageName: "worker_invocation_package.json",
              path: path.join(operatorRunRoot, "worker_invocation_package.json"),
              digest: "sha256:synthetic-invocation-package",
              disposition: "derive",
              role: "structured invocation projection"
            }
          ],
          packageDigest: "sha256:synthetic-construction-brief"
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "worker_invocation_package.json"),
        {
          kind: "sdlc_worker_invocation_package",
          packageVersion: "synthetic-v1",
          graphFunctionName: edge.name,
          edgeName: edge.name,
          vectorIndex: 0,
          sourceAssetTypes: [],
          targetAssetType: edge.target,
          manifestPath: path.join(operatorRunRoot, "handoff_manifest.json")
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "traversal_intent_package.json"),
        {
          kind: "sdlc_traversal_intent_package",
          packageVersion: "synthetic-v1",
          graphFunctionName: edge.name,
          edgeName: edge.name,
          vectorIndex: 0,
          sourceAssetTypes: [],
          targetAssetType: edge.target,
          methodRefs: [],
          authorityRefs: []
        },
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "worker_prompt.md"),
        `synthetic prompt for ${edge.name}\n`,
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "worker_stdout.log"),
        `synthetic stdout for ${edge.name}\n`,
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "worker_stderr.log"),
        "",
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "worker_process_started.json"),
        {
          kind: "actor_process_started",
          pid: pid + index,
          observedAtMs: dirStartMs
        },
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "worker_process_events.jsonl"),
        [
          JSON.stringify({
            kind: "actor_process_started",
            pid: pid + index,
            observedAtMs: dirStartMs
          }),
          JSON.stringify({
            kind: "actor_process_exited",
            pid: pid + index,
            status: 0,
            elapsedMs: workerElapsedMsPerEdge,
            observedAtMs: dirMtimeMs
          })
        ].join("\n") + "\n",
        dirMtimeMs
      );
      const runtimeEvents = [
        { index: 0, kind: "actor_process_started" },
        { index: 1, kind: "actor_process_exited" }
      ];
      if (isImplementationDesignEdge) {
        const envelopeRef = `plugin-result-envelope:t161:${edge.name}:${index}`;
        runtimeEvents.push(
          {
            kind: "payload_observed",
            payloadClass: "admitted_plugin_result_envelope",
            payloadRef: envelopeRef,
            authorityRef: selectedComposition.resultInterfaceRef,
            contractRef: selectedComposition.resultEnvelopeContractRef
          },
          {
            kind: "payload_validated",
            payloadRef: envelopeRef,
            contractRef: selectedComposition.resultEnvelopeContractRef,
            contractDigest: selectedComposition.resultInterfaceContractDigest
          },
          {
            kind: "evidence_admitted",
            payloadRef: envelopeRef,
            evidenceRef: designDepthContentRegisterRef
          },
          {
            kind: "evidence_admitted",
            payloadRef: envelopeRef,
            evidenceRef: designDepthRegisterRef
          },
          {
            kind: "evidence_admitted",
            payloadRef: envelopeRef,
            evidenceRef: designDepthRuleOutcomeRef
          }
        );
      }
      writeJson(
        path.join(operatorRunRoot, "runtime_events.json"),
        {
          kind: "sdlc_runtime_event_archive_projection",
          archiveVersion: "synthetic-v1",
          eventCount: runtimeEvents.length,
          eventKinds: [...new Set(runtimeEvents.map((event) => event.kind))],
          events: runtimeEvents
        },
        dirMtimeMs
      );
      if (isProductEdge) {
        const productRel = "src/hello.js";
        const productAbs = path.join(tenantRoot, productRel);
        mkdirSync(dirname(productAbs), { recursive: true });
        const productSourceLines = [
          ...finalProductLineageRefs.map((ref) => `// ${ref}`),
          `console.log("Hello, world!");`
        ];
        writeText(productAbs, productSourceLines.join("\n") + "\n", dirMtimeMs);
        writeJson(
          path.join(operatorRunRoot, "product_materialization_manifest.json"),
          {
            kind: "sdlc_product_materialization_manifest",
            contract: {
              kind: "sdlc_product_materialization_contract",
              required: true,
              activeTenant: "hello_world_javascript",
              selectedOutputRoot: "build_tenants/hello_world_javascript",
              tenantRoot,
              relativePathBasis: "tenant_root",
              declaredModuleNames: ["hello_world_javascript"],
              buildExecutionContract: "undeclared",
              testExecutionContract: "node",
              manifestFile: path.join(operatorRunRoot, "product_materialization_manifest.json"),
              requiredRoles: ["source"],
              executionShards: []
            },
            files: [
              {
                kind: "sdlc_materialized_product_file",
                role: "source",
                relativePath: productRel,
                absolutePath: productAbs,
                digest: "sha256:synthetic",
                byteCount: statSync(productAbs).size,
                materializationSource: "current_attempt",
                requirementTraceObligationIds: [...finalProductLineageRefs],
                sourceManifestRef: `file://${path.join(operatorRunRoot, "product_materialization_manifest.json")}`,
                sourceHandoffManifestRef: `file://${path.join(operatorRunRoot, "handoff_manifest.json")}`,
                sourceAttemptRef: `file://${operatorRunRoot}`,
                rolePolicyRef: "target-role-policy://synthetic/product-source-tree"
              }
            ]
          },
          dirMtimeMs
        );
      } else {
        writeJson(
          path.join(operatorRunRoot, "product_materialization_manifest.json"),
          {
            kind: "sdlc_product_materialization_manifest",
            contract: {
              kind: "sdlc_product_materialization_contract",
              required: false,
              activeTenant: "hello_world_javascript",
              selectedOutputRoot: "build_tenants/hello_world_javascript",
              tenantRoot,
              relativePathBasis: "tenant_root",
              declaredModuleNames: ["hello_world_javascript"],
              buildExecutionContract: "undeclared",
              testExecutionContract: "node",
              manifestFile: path.join(operatorRunRoot, "product_materialization_manifest.json"),
              requiredRoles: [],
              executionShards: []
            },
            files: []
          },
          dirMtimeMs
        );
      }
    } else {
      // Aborted shape: minimal stub files, no postflight/worker_run
      writeJson(
        path.join(operatorRunRoot, "worker_process_started.json"),
        {
          kind: "actor_process_started",
          pid: pid + index,
          observedAtMs: dirStartMs
        },
        dirMtimeMs
      );
      writeJson(
        path.join(operatorRunRoot, "handoff_manifest.json"),
        {
          kind: "sdlc_worker_handoff_manifest",
          contractVersion: "synthetic-v1",
          workspaceRoot,
          archiveRoot: operatorRunRoot,
          graphFunctionName: edge.name,
          edgeName: edge.name,
          vectorIndex: 0,
          inputAssetTypes: [],
          targetAssetType: edge.target,
          outputFile: path.join(tenantRoot, `design/${edge.target}.md`),
          reportFile: path.join(operatorRunRoot, "worker_result_report.json")
        },
        dirMtimeMs
      );
      writeText(
        path.join(operatorRunRoot, "worker_stdout.log"),
        `aborted partial stdout for ${edge.name}\n`,
        dirMtimeMs
      );
    }
    utimesSync(operatorRunRoot, dirMtimeMs / 1000, dirMtimeMs / 1000);
    operatorRunRoots.push(operatorRunRoot);
  }
  utimesSync(operatorRunsRoot, Date.now() / 1000, (start + edges.length * edgeStepMs) / 1000);
  return Object.freeze({ archiveRoot, workspaceRoot, operatorRunRoots, start });
}

test("T-161 clean synthetic T-132 archive: 12 attempts, zero retries, hello.js with five canonical lineage refs", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-clean-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const telemetry = result.currentStateTelemetrySummary;
    assert.equal(telemetry.operatorRunCount, 12, "exactly twelve edge attempts");
    assert.equal(telemetry.sameEdgeRetryCount, 0);
    assert.equal(telemetry.repairAttemptCount, 0);
    assert.equal(telemetry.blockedAttemptCount, 0);
    assert.equal(telemetry.finalClosureDisposition, "close");
    assert.deepEqual(
      telemetry.graphEdgeSequence,
      T132_EDGE_ORDER.map((edge) => edge.name)
    );
    assert.ok(
      telemetry.totalWorkerElapsedMs > 0,
      "summed worker elapsed must be > 0"
    );
    if (telemetry.totalWallClockMs !== null) {
      assert.ok(
        telemetry.totalWorkerElapsedMs >= telemetry.totalWallClockMs * 0.5,
        `worker time should dominate; worker=${telemetry.totalWorkerElapsedMs} wall=${telemetry.totalWallClockMs}`
      );
    }
    const componentEdge = result.edgeTraversal.find(
      (attempt) => attempt.graphFunctionName === "derive_component_code_surface"
    );
    assert.ok(componentEdge !== undefined);
    assert.equal(
      componentEdge.productLineageCount,
      T132_LINEAGE_REFS.length,
      "five canonical lineage refs on hello.js"
    );
    assert.deepEqual(componentEdge.productFilesWritten, ["src/hello.js"]);
    assert.equal(
      result.bloatAndSlopeAnalysis.canonicalRequirementIdCount,
      T132_LINEAGE_REFS.length
    );
    assert.equal(telemetry.productFileCount, 1);
    assert.equal(
      telemetry.productFileLineageCount,
      T132_LINEAGE_REFS.length
    );
    assert.equal(result.runtimeArtifactGaps.length, 0, "no runtime artifact gaps on clean run");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-171 analyzer exposes prompt carrier, execution evidence, residual pressure, and conceptual stage coverage", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t171-analysis-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      overrides: {
        5: {
          residualPressureRefs: []
        }
      }
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });

    const componentEdge = result.edgeTraversal.find(
      (attempt) => attempt.targetAssetType === "component_code_surface"
    );
    assert.ok(componentEdge !== undefined);
    assert.equal(componentEdge.traversalClass, "constructive");
    assert.equal(componentEdge.executionEvidenceStatus, "succeeded");
    assert.equal(componentEdge.executionEvidenceSource, "component_smoke");
    assert.equal(
      componentEdge.executionEvidenceCommand,
      "node build_tenants/hello_world_javascript/src/hello.js"
    );
    assert.equal(componentEdge.executionEvidenceReportCount, 1);
    assert.equal(componentEdge.executionEvidenceShardCount, 1);
    assert.equal(componentEdge.executionEvidenceTestsObserved, 1);
    assert.equal(componentEdge.executionEvidencePassedCount, 1);
    assert.equal(componentEdge.executionEvidenceFailedCount, 0);
    assert.equal(componentEdge.residualPressureTransition, "cleared");
    assert.equal(componentEdge.residualPressureRefCount, 0);
    assert.match(
      componentEdge.promptSourceCarrierRef ?? "",
      /worker_construction_brief\.json/u
    );
    assert.equal(
      componentEdge.promptSourceCarrierDigest,
      "sha256:synthetic-construction-brief"
    );
    assert.match(componentEdge.promptRenderingRef ?? "", /worker_prompt\.md/u);
    assert.equal(
      componentEdge.promptSourcePolicyRef,
      "policy://odd-sdlc/worker-prompt-source/worker-construction-brief/v1"
    );

    const executionResultStage = result.conceptualStageCoverage.find(
      (row) => row.expectedEdgeName === "derive_test_execution_result_surface"
    );
    assert.ok(executionResultStage !== undefined);
    assert.equal(executionResultStage.stageClass, "constructive");
    assert.equal(executionResultStage.operatorRunRefs.length, 1);
    const executionResultEdge = result.edgeTraversal.find(
      (attempt) => attempt.targetAssetType === "test_execution_result_surface"
    );
    assert.ok(executionResultEdge !== undefined);
    assert.equal(
      executionResultEdge.executionEvidenceSource,
      "graph_test_execution_result"
    );
    assert.equal(
      executionResultEdge.executionEvidenceCommand,
      "node --test test/hello.test.js"
    );
    assert.equal(executionResultEdge.executionEvidenceReportCount, 1);

    const missingRunArchiveStage = result.conceptualStageCoverage.find(
      (row) => row.expectedEdgeName === "derive_test_run_archive_surface"
    );
    assert.ok(missingRunArchiveStage !== undefined);
    assert.equal(missingRunArchiveStage.stageClass, "missing");
    assert.equal(missingRunArchiveStage.operatorRunRefs.length, 0);

    const markdown = renderSdlcFdRunAnalysisMarkdown(result);
    assert.match(markdown, /## Prompt And Evidence Sources/u);
    assert.match(markdown, /worker_construction_brief\.json/u);
    assert.match(markdown, /component_smoke/u);
    assert.match(markdown, /graph_test_execution_result/u);
    assert.match(markdown, /## Conceptual Stage Coverage/u);
    assert.doesNotMatch(markdown, /Test35 Conceptual Stage Coverage/u);
    assert.match(markdown, /sdlc:\/\/stage\/test-run-archive/u);
    assert.match(markdown, /derive_test_run_archive_surface/u);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-188 analyzer reads declared execution output when worker report mirror is stale", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t188-execution-fallback-");
  try {
    const synthetic = buildSyntheticT132Archive({ rootDir: archiveRoot });
    const executionIndex = T132_EDGE_ORDER.findIndex(
      (edge) => edge.target === "test_execution_result_surface"
    );
    assert.ok(executionIndex >= 0);
    const operatorRunRoot = synthetic.operatorRunRoots[executionIndex];
    const declaredOutputFile = path.join(
      operatorRunRoot,
      "declared_test_execution_result_surface.json"
    );
    writeJson(declaredOutputFile, {
      kind: "sdlc_worker_execution_evidence",
      lane: "test",
      command: "npm test",
      status: "succeeded",
      reportRefs: [
        `file://${path.join(operatorRunRoot, "test-execution.stdout.log")}`
      ],
      testsObserved: 3,
      passedCount: 3,
      failedCount: 0,
      shardEvidence: [
        {
          kind: "sdlc_worker_execution_shard_evidence",
          shardId: "node-test:topology",
          lane: "test",
          command: "npm test",
          status: "succeeded",
          reportRefs: [
            `file://${path.join(operatorRunRoot, "test-execution.stdout.log")}`
          ],
          testsObserved: 3,
          passedCount: 3,
          failedCount: 0
        }
      ]
    });
    writeJson(path.join(operatorRunRoot, "worker_result_report.json"), {
      kind: "odd_sdlc.worker_result_report",
      graphFunctionName: "derive_test_execution_result_surface",
      edgeName: "derive_test_execution_result_surface",
      targetAssetType: "test_execution_result_surface",
      outputFile: declaredOutputFile,
      digest: "sha256:synthetic",
      summary: "synthetic stale report mirror",
      unresolvedReasons: [],
      materializedFiles: [],
      materializationDiagnostics: [],
      executionEvidence: null,
      executionEvidenceErrors: [],
      obligationAssessments: []
    });

    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const executionResultEdge = result.edgeTraversal.find(
      (attempt) => attempt.targetAssetType === "test_execution_result_surface"
    );
    assert.ok(executionResultEdge !== undefined);
    assert.equal(
      executionResultEdge.executionEvidenceSource,
      "graph_test_execution_result"
    );
    assert.equal(executionResultEdge.executionEvidenceStatus, "succeeded");
    assert.equal(executionResultEdge.executionEvidenceCommand, "npm test");
    assert.equal(executionResultEdge.executionEvidenceReportCount, 1);
    assert.equal(executionResultEdge.executionEvidenceShardCount, 1);
    assert.equal(executionResultEdge.executionEvidenceTestsObserved, 3);
    assert.equal(executionResultEdge.executionEvidencePassedCount, 3);
    assert.equal(executionResultEdge.executionEvidenceFailedCount, 0);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-171 full lifecycle synthetic archive reaches graph-generated test execution before release", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t171-full-lifecycle-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      edges: T132_FULL_LIFECYCLE_EDGE_ORDER
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    assert.equal(
      result.currentStateTelemetrySummary.operatorRunCount,
      T132_FULL_LIFECYCLE_EDGE_ORDER.length
    );
    assert.deepEqual(
      result.currentStateTelemetrySummary.graphEdgeSequence,
      T132_FULL_LIFECYCLE_EDGE_ORDER.map((edge) => edge.name)
    );

    const executionResultIndex = result.edgeTraversal.findIndex(
      (attempt) => attempt.graphFunctionName === "derive_test_execution_result_surface"
    );
    const releaseIndex = result.edgeTraversal.findIndex(
      (attempt) => attempt.graphFunctionName === "prepare_release_surface"
    );
    assert.ok(executionResultIndex >= 0, "test execution result edge present");
    assert.ok(releaseIndex > executionResultIndex, "release follows execution result");

    const executionResultEdge = result.edgeTraversal[executionResultIndex];
    assert.equal(
      executionResultEdge.executionEvidenceSource,
      "graph_test_execution_result"
    );
    assert.equal(executionResultEdge.executionEvidenceStatus, "succeeded");
    assert.equal(executionResultEdge.executionEvidenceReportCount, 1);
    assert.equal(executionResultEdge.executionEvidenceShardCount, 1);
    assert.equal(executionResultEdge.executionEvidenceTestsObserved, 1);
    assert.equal(executionResultEdge.executionEvidenceFailedCount, 0);

    const missingStages = result.conceptualStageCoverage.filter(
      (row) => row.stageClass === "missing"
    );
    assert.deepEqual(missingStages, []);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 retry-heavy synthetic archive emits retry/repair/block diagnostics with wasted worker seconds", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-retry-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      overrides: {
        2: { closureDisposition: "retry", postflightStatus: "blocked", blockingReasonCodes: ["obligation_payload_insufficient"] },
        5: { closureDisposition: "repair", postflightStatus: "passed" },
        9: { closureDisposition: "block", postflightStatus: "blocked", blockingReasonCodes: ["worker_authority_read_outside_workspace"] }
      }
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const totals = result.currentStateTelemetrySummary;
    assert.equal(totals.sameEdgeRetryCount, 1, "retry count");
    assert.equal(totals.repairAttemptCount, 1, "repair count");
    assert.equal(totals.blockedAttemptCount, 2, "two blocked attempts");
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(codes.has("retry_observed"), "retry_observed emitted");
    assert.ok(codes.has("repair_observed"), "repair_observed emitted");
    assert.ok(codes.has("blocked_attempt_observed"), "blocked_attempt_observed emitted");
    assert.ok(
      codes.has("worker_authority_read_outside_workspace_observed"),
      "outside-workspace read observed"
    );
    const retryRow = result.retryForensics.find((r) => r.edgeName === "derive_design_surface");
    assert.ok(retryRow !== undefined);
    assert.ok(retryRow.workerSecondsBefore !== null && retryRow.workerSecondsBefore > 0);
    assert.equal(retryRow.likelyCauseClass, "deterministic_evaluator_bug");
    const outsideRow = result.retryForensics.find(
      (r) => r.edgeName === "derive_component_test_surface"
    );
    assert.ok(outsideRow !== undefined);
    assert.equal(outsideRow.likelyCauseClass, "worker_policy_violation");
    assert.equal(outsideRow.outsideWorkspaceReadCount, 1);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-171 framework carrier/parser drift is classified as framework drift", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t171-framework-drift-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      overrides: {
        5: {
          closureDisposition: "repair",
          postflightStatus: "blocked",
          blockingReasonCodes: [
            "component_depth_register_invalid:component_depth_register.payload: unexpected field"
          ]
        }
      }
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const driftRow = result.retryForensics.find(
      (row) => row.likelyCauseClass === "framework_carrier_parser_drift"
    );
    assert.ok(driftRow !== undefined);
    assert.equal(driftRow.edgeName, "derive_component_code_surface");
    assert.equal(driftRow.schemaViolationCount, 1);
    assert.equal(driftRow.outsideWorkspaceReadCount, 0);
    assert.ok(
      result.diagnostics.some((diagnostic) => diagnostic.code === "repair_observed"),
      "repair is still reported as a failure signal"
    );
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 target-carrier-admission-missing block (postflight passed, ledger says missing) classifies correctly", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-target-carrier-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      overrides: {
        // Block disposition + postflight passed + no blocking codes +
        // ledger.targetCarrierAdmissionStatus="missing" → T-133 admission gate
        2: {
          closureDisposition: "block",
          postflightStatus: "passed",
          blockingReasonCodes: [],
          targetCarrierAdmissionStatus: "missing"
        }
      }
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const row = result.retryForensics.find(
      (r) => r.likelyCauseClass === "target_carrier_admission_missing"
    );
    assert.ok(row !== undefined, "target_carrier_admission_missing row present");
    assert.equal(row.outsideWorkspaceReadCount, 0);
    assert.equal(row.schemaViolationCount, 0);
    // Sanity: previously this would have been deterministic_evaluator_bug
    // via the catch-all. The catch-all is now `unknown`; a clean block
    // with neither admission-missing nor any postflight rejection falls
    // through to `unknown`, not `deterministic_evaluator_bug`.
    const unknownCatchAll = result.retryForensics.find(
      (r) => r.likelyCauseClass === "deterministic_evaluator_bug"
    );
    assert.equal(
      unknownCatchAll,
      undefined,
      "no spurious deterministic_evaluator_bug from the catch-all"
    );
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 aborted synthetic archive is reported as incomplete, not closure failure", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-aborted-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      overrides: {
        11: { isAbortShape: true }
      }
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const finalAttempt = result.edgeTraversal[result.edgeTraversal.length - 1];
    assert.equal(finalAttempt.closureDisposition, null);
    assert.equal(finalAttempt.postflightStatus, null);
    assert.notEqual(result.currentStateTelemetrySummary.finalClosureDisposition, "fail");
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(
      codes.has("aborted_run_observed") || codes.has("edge_sequence_incomplete"),
      `expected aborted/incomplete diagnostic, got: ${[...codes].join(",")}`
    );
    assert.ok(
      result.runtimeArtifactGaps.length > 0,
      "aborted run produces runtime artifact gaps"
    );
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 JSON output carries all required sections (using synthetic archive)", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-sections-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    assert.ok("currentStateTelemetrySummary" in result);
    assert.ok("edgeTraversal" in result);
    assert.ok("activeRunLiveness" in result);
    assert.ok("runtimeArtifactGaps" in result);
    assert.ok("diagnostics" in result);
    assert.ok("bloatAndSlopeAnalysis" in result);
    assert.ok("retryForensics" in result);
    assert.ok("summaryDrift" in result);
    assert.ok("evidenceIndex" in result);
    assert.equal("gapAnalysis" in result, false, "must not publish gapAnalysis (renamed to runtimeArtifactGaps)");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 markdown renderer outputs each required section header", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-markdown-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const md = renderSdlcFdRunAnalysisMarkdown(result);
    assert.ok(md.includes("## Current State Telemetry"));
    assert.ok(md.includes("## Edge Traversal"));
    assert.ok(md.includes("## Active-Run Liveness"));
    assert.ok(md.includes("## Runtime Artifact Gaps"));
    assert.ok(md.includes("## Diagnostics"));
    assert.ok(md.includes("## Bloat And Slope"));
    assert.ok(md.includes("## Retry Forensics"));
    assert.ok(md.includes("## Summary Drift"));
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 markdown renderer bounds high-volume run tables by default", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-markdown-bounded-");
  try {
    buildSyntheticT132Archive({
      rootDir: archiveRoot,
      edges: Array.from({ length: 75 }, (_, index) => ({
        name: `derive_synthetic_edge_${String(index).padStart(2, "0")}`,
        target: "component_code_surface"
      }))
    });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const md = renderSdlcFdRunAnalysisMarkdown(result);
    assert.match(md, /bounded projection: showing first 30 and last 30; omitted 15\./u);
    assert.match(md, /derive_synthetic_edge_00/u);
    assert.match(md, /derive_synthetic_edge_74/u);
    assert.doesNotMatch(md, /derive_synthetic_edge_37/u);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 performs no writes to the inspected archive", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-readonly-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const before = snapshotInspectedRoot(archiveRoot);
    analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const after = snapshotInspectedRoot(archiveRoot);
    assert.deepEqual(after, before, "analyzer must not modify the inspected archive");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 emits typed runtime_artifact_missing/malformed diagnostics", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-malformed-");
  try {
    const operatorRunRoot = path.join(
      archiveRoot,
      "workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/20260512T123456789Z_pid77777"
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "synthetic_edge", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(path.join(operatorRunRoot, "postflight.json"), "not-json", "utf8");
    writeFileSync(
      path.join(archiveRoot, "run_summary.json"),
      JSON.stringify({ kind: "scenario_run_summary" }),
      "utf8"
    );
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "generic"
    });
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(codes.has("runtime_artifact_missing"), "expected runtime_artifact_missing");
    assert.ok(codes.has("runtime_artifact_malformed"), "expected runtime_artifact_malformed");
    const malformedGap = result.runtimeArtifactGaps.find(
      (g) => g.artifact === "postflight.json" && g.status === "malformed"
    );
    assert.ok(malformedGap !== undefined, "expected malformed postflight.json gap");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 emits product_lineage_missing diagnostic when a product file has no canonical refs", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-lineage-");
  try {
    const operatorRunRoot = path.join(
      archiveRoot,
      "workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/20260512T000000000Z_pid11111"
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    const productDir = path.join(archiveRoot, "workspace/build_tenants/synth/src");
    mkdirSync(productDir, { recursive: true });
    const productPath = path.join(productDir, "main.js");
    writeFileSync(productPath, "console.log('no lineage at all');\n", "utf8");
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "synth", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "product_materialization_manifest.json"),
      JSON.stringify({
        kind: "sdlc_product_materialization_manifest",
        contract: { required: true, tenantRoot: path.join(archiveRoot, "workspace/build_tenants/synth"), requiredRoles: ["source"] },
        files: [
          {
            kind: "sdlc_materialized_product_file",
            role: "source",
            relativePath: "src/main.js",
            absolutePath: productPath,
            digest: "sha256:0",
            byteCount: 35,
            materializationSource: "current_attempt",
            requirementTraceObligationIds: []
          }
        ]
      }),
      "utf8"
    );
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(codes.has("product_lineage_missing"), `expected product_lineage_missing, got ${[...codes].join(",")}`);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 lineage scan: stale absolutePath falls back to workspace-relative resolution", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-portable-");
  try {
    const workspaceRoot = path.join(archiveRoot, "workspace");
    const tenantRoot = path.join(workspaceRoot, "build_tenants/synth_tenant");
    const operatorRunRoot = path.join(
      workspaceRoot,
      ".ai-workspace/runtime/odd_sdlc/operator-runs/20260512T010101010Z_pid22222"
    );
    mkdirSync(path.join(tenantRoot, "src"), { recursive: true });
    mkdirSync(operatorRunRoot, { recursive: true });
    const productAbs = path.join(tenantRoot, "src/main.js");
    writeFileSync(
      productAbs,
      "// requirement:synth.stage_01.req_synth_001\nconsole.log('hi');\n",
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "synth", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "product_materialization_manifest.json"),
      JSON.stringify({
        kind: "sdlc_product_materialization_manifest",
        contract: {
          required: true,
          tenantRoot: "/totally/elsewhere/build_tenants/synth_tenant",
          requiredRoles: ["source"]
        },
        files: [
          {
            kind: "sdlc_materialized_product_file",
            role: "source",
            relativePath: "src/main.js",
            absolutePath: "/totally/elsewhere/build_tenants/synth_tenant/src/main.js",
            digest: "sha256:0",
            byteCount: 99,
            materializationSource: "current_attempt",
            requirementTraceObligationIds: []
          }
        ]
      }),
      "utf8"
    );
    writeFileSync(
      path.join(archiveRoot, "run_summary.json"),
      JSON.stringify({ kind: "scenario_run_summary" }),
      "utf8"
    );
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    assert.equal(
      result.bloatAndSlopeAnalysis.canonicalRequirementIdCount,
      1,
      "scan must resolve stale absolutePath via workspace-relative fallback"
    );
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.equal(codes.has("product_lineage_missing"), false);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 lineage scan: unreadable product with no manifest lineage emits product_lineage_missing", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-unreadable-");
  try {
    const operatorRunRoot = path.join(
      archiveRoot,
      "workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/20260512T020202020Z_pid33333"
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "synth", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "product_materialization_manifest.json"),
      JSON.stringify({
        kind: "sdlc_product_materialization_manifest",
        contract: {
          required: true,
          tenantRoot: "/totally/elsewhere/build_tenants/synth_tenant",
          requiredRoles: ["source"]
        },
        files: [
          {
            kind: "sdlc_materialized_product_file",
            role: "source",
            relativePath: "src/gone.js",
            absolutePath: "/totally/elsewhere/build_tenants/synth_tenant/src/gone.js",
            digest: "sha256:0",
            byteCount: 0,
            materializationSource: "current_attempt",
            requirementTraceObligationIds: []
          }
        ]
      }),
      "utf8"
    );
    writeFileSync(
      path.join(archiveRoot, "run_summary.json"),
      JSON.stringify({ kind: "scenario_run_summary" }),
      "utf8"
    );
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const codes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(codes.has("product_lineage_missing"), "must emit product_lineage_missing for unreadable+empty-lineage");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 accounts prompt/context bytes across prompt md, invocation pkg, traversal pkg, stdout, and events", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-bytes-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    const { archiveBytes } = result.currentStateTelemetrySummary;
    assert.ok(archiveBytes.promptContextBytes > 0, "prompt/context bytes should be non-zero");
    assert.ok(
      archiveBytes.runtimeEventBytes > 0 || archiveBytes.workerProcessEventBytes > 0,
      "event bytes should be non-zero"
    );
    assert.ok(archiveBytes.stdoutBytes > 0, "stdout bytes should be non-zero");
    assert.ok(archiveBytes.handoffBytes > 0, "handoff bytes should be non-zero");
    assert.ok(archiveBytes.consequenceCarrierBytes > 0, "consequence carrier bytes should be non-zero");
    assert.ok(
      archiveBytes.totalBytes >=
        archiveBytes.promptContextBytes +
          archiveBytes.runtimeEventBytes +
          archiveBytes.stdoutBytes +
          archiveBytes.handoffBytes,
      "total bytes >= sum of categorized bytes"
    );
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 active-run liveness classifies a progressing run with live pid and recent heartbeat", () => {
  const workspaceRoot = makeTempDir("odd-sdlc-ts-t161-progressing-");
  try {
    const nowMs = Date.now();
    const dirNameTs = isoFromMs(nowMs);
    const operatorRunRoot = path.join(
      workspaceRoot,
      `.ai-workspace/runtime/odd_sdlc/operator-runs/${dirNameTs}_pid${process.pid}`
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "progressing_edge", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "handoff_manifest.json"),
      JSON.stringify({
        kind: "sdlc_worker_handoff_manifest",
        graphFunctionName: "progressing_edge",
        edgeName: "progressing_edge",
        vectorIndex: 0,
        targetAssetType: "synth"
      }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "worker_process_started.json"),
      JSON.stringify({ kind: "actor_process_started", pid: process.pid, observedAtMs: nowMs - 10_000 }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "worker_process_events.jsonl"),
      `${JSON.stringify({ kind: "actor_process_heartbeat", observedAtMs: nowMs - 5_000, pid: process.pid })}\n`,
      "utf8"
    );
    writeFileSync(path.join(operatorRunRoot, "worker_stdout.log"), "still working\n", "utf8");
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs
    });
    const live = result.activeRunLiveness;
    assert.equal(live.processAlive, true, "current test pid should be alive");
    assert.equal(live.productiveSignal, "progressing", "fresh writes + live pid + recent heartbeat = progressing");
    assert.ok(live.archiveGrowthBytesPerMinute !== null && live.archiveGrowthBytesPerMinute > 0);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-161 active-run liveness classifies a stalled_no_io run", () => {
  const workspaceRoot = makeTempDir("odd-sdlc-ts-t161-stalled-noio-");
  try {
    const nowMs = Date.now();
    const dirNameTs = isoFromMs(nowMs - 600_000);
    const operatorRunRoot = path.join(
      workspaceRoot,
      `.ai-workspace/runtime/odd_sdlc/operator-runs/${dirNameTs}_pid${process.pid}`
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "stalled_edge", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "handoff_manifest.json"),
      JSON.stringify({
        kind: "sdlc_worker_handoff_manifest",
        graphFunctionName: "stalled_edge",
        edgeName: "stalled_edge",
        vectorIndex: 0,
        targetAssetType: "synth"
      }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "worker_process_started.json"),
      JSON.stringify({ kind: "actor_process_started", pid: process.pid, observedAtMs: nowMs - 600_000 }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "worker_process_events.jsonl"),
      `${JSON.stringify({ kind: "actor_process_heartbeat", observedAtMs: nowMs - 500_000, pid: process.pid })}\n`,
      "utf8"
    );
    const stdoutPath = path.join(operatorRunRoot, "worker_stdout.log");
    writeFileSync(stdoutPath, "old log\n", "utf8");
    const oldSeconds = (nowMs - 500_000) / 1000;
    utimesSync(stdoutPath, oldSeconds, oldSeconds);
    utimesSync(path.join(operatorRunRoot, "worker_process_started.json"), oldSeconds, oldSeconds);
    utimesSync(path.join(operatorRunRoot, "worker_process_events.jsonl"), oldSeconds, oldSeconds);
    utimesSync(path.join(operatorRunRoot, "handoff_manifest.json"), oldSeconds, oldSeconds);
    utimesSync(path.join(operatorRunRoot, "operator_summary.json"), oldSeconds, oldSeconds);
    utimesSync(operatorRunRoot, oldSeconds, oldSeconds);
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs
    });
    const live = result.activeRunLiveness;
    assert.equal(live.productiveSignal, "stalled_no_io", "old archive with stale heartbeat = stalled_no_io");
    assert.equal(live.archiveGrowthBytesPerMinute, 0, "rolling growth must be zero on stale archive");
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-161 active-run liveness classifies a completed run as completed", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-completed-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "hello_world"
    });
    assert.equal(result.activeRunLiveness.productiveSignal, "completed");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 active-run liveness flags an aborted/killed run shape", () => {
  const workspaceRoot = makeTempDir("odd-sdlc-ts-t161-aborted-shape-");
  try {
    const nowMs = Date.now();
    const oldSeconds = (nowMs - 600_000) / 1000;
    const dirNameTs = isoFromMs(nowMs - 600_000);
    const operatorRunRoot = path.join(
      workspaceRoot,
      `.ai-workspace/runtime/odd_sdlc/operator-runs/${dirNameTs}_pid99999998`
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "worker_process_started.json"),
      JSON.stringify({ kind: "actor_process_started", pid: 99999998, observedAtMs: nowMs - 600_000 }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "handoff_manifest.json"),
      JSON.stringify({
        kind: "sdlc_worker_handoff_manifest",
        graphFunctionName: "aborted_edge",
        edgeName: "aborted_edge",
        vectorIndex: 0,
        targetAssetType: "synthetic"
      }),
      "utf8"
    );
    utimesSync(path.join(operatorRunRoot, "worker_process_started.json"), oldSeconds, oldSeconds);
    utimesSync(path.join(operatorRunRoot, "handoff_manifest.json"), oldSeconds, oldSeconds);
    utimesSync(operatorRunRoot, oldSeconds, oldSeconds);
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs
    });
    assert.equal(
      result.activeRunLiveness.productiveSignal,
      "aborted_or_killed",
      "dead pid + stale archive + no postflight = aborted_or_killed"
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-161 emits summary_source_drift when edge_performance_summary disagrees with raw carriers", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-drift-");
  try {
    const operatorRunRoot = path.join(
      archiveRoot,
      "workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/20260512T120000000Z_pid44444"
    );
    mkdirSync(operatorRunRoot, { recursive: true });
    writeFileSync(
      path.join(operatorRunRoot, "operator_summary.json"),
      JSON.stringify({ kind: "sdlc_operator_summary", graphFunctionName: "edge_x", status: "worker_invoked" }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "worker_run.json"),
      JSON.stringify({
        kind: "sdlc_worker_run_result",
        elapsedMs: 1000,
        stdoutByteCount: 0,
        stderrByteCount: 0,
        status: 0,
        signal: null,
        timedOut: false
      }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "postflight.json"),
      JSON.stringify({
        kind: "sdlc_operator_postflight_result",
        status: "passed",
        blockingReasons: [],
        blockingReasonCarriers: [],
        evidenceRefs: []
      }),
      "utf8"
    );
    writeFileSync(
      path.join(operatorRunRoot, "edge_performance_summary.json"),
      JSON.stringify({
        kind: "sdlc_edge_performance_summary",
        fields: {
          workerElapsedMs: 9999999,
          postflightStatus: "blocked",
          stdoutBytes: 0,
          handoffBytes: 0,
          blockingReasonCount: 17
        }
      }),
      "utf8"
    );
    writeFileSync(
      path.join(archiveRoot, "run_summary.json"),
      JSON.stringify({ kind: "scenario_run_summary" }),
      "utf8"
    );
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: archiveRoot,
      profile: "generic"
    });
    assert.equal(result.summaryDrift.summaryPresent, true);
    assert.ok(result.summaryDrift.drifts.length > 0, "expected at least one drift");
    const driftCodes = new Set(result.diagnostics.map((d) => d.code));
    assert.ok(driftCodes.has("summary_source_drift"), "expected summary_source_drift diagnostic");
    const driftedAttempt = result.edgeTraversal[0];
    assert.equal(driftedAttempt.workerElapsedMs, 1000, "recomputed value wins over summary value");
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 leaves analysis untouched by start/dispatch/closure flows", () => {
  const before = new Set(SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_CODE_VALUES);
  assert.ok(before.has("retry_observed"));
  assert.ok(before.has("summary_source_drift"));
  assert.equal(SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES.length, 1);
  assert.ok(SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES.includes("generic"));
  assert.equal(SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES.includes("hello_world"), false);
  assert.equal(SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES.includes("data_mapper"), false);
});

test("T-197 H2 analysis profile behavior is capability-driven, not product-name-driven", () => {
  const spec = resolveSdlcFdRunAnalysisProfile({
    profile: "tenant.small",
    capabilityContracts: [
      {
        kind: "sdlc_fd_run_analysis_profile_capability",
        name: "trivial_product",
        value: "true"
      }
    ]
  });
  assert.equal(spec.policy.policyStatus, "informational");
  assert.equal(spec.policy.profilePolicyRef, "policy://odd-sdlc/analysis/profile/tenant.small/v1");
  assert.equal(spec.policy.thresholdPolicyRef, "policy://odd-sdlc/analysis/threshold/trivial_product/v1");
  assert.equal(spec.forbidRawDisplayIdRequirementTagsInProductFiles, true);
});

test("T-161 CLI dispatch returns JSON envelope and exit code 0 on clean synthetic archive", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-json-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world",
      "--format",
      "json"
    ]);
    assert.equal(result.status, "ok");
    assert.equal(result.exitCode, 0);
    assert.equal(result.command, "analyze-run");
    const serialized = serializeOddSdlcSpecMethodResult(result);
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.kind, SDLC_FD_RUN_ANALYSIS_KIND);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 CLI dispatch defaults to markdown when neither --format nor --raw is given", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-default-md-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world"
    ]);
    assert.equal(result.status, "ok");
    const serialized = serializeOddSdlcSpecMethodResult(result);
    assert.ok(serialized.startsWith("# F_D Run Analysis"));
    assert.ok(serialized.includes("## Current State Telemetry"));
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 CLI dispatch --raw emits JSON envelope", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-raw-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world",
      "--raw"
    ]);
    assert.equal(result.status, "ok");
    const serialized = serializeOddSdlcSpecMethodResult(result);
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.kind, SDLC_FD_RUN_ANALYSIS_KIND);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 CLI dispatch markdown format emits markdown text", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-md-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world",
      "--format",
      "markdown"
    ]);
    assert.equal(result.status, "ok");
    const serialized = serializeOddSdlcSpecMethodResult(result);
    assert.ok(serialized.startsWith("# F_D Run Analysis"));
    assert.ok(serialized.includes("## Current State Telemetry"));
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 CLI dispatch --output writes outside inspected root", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-out-");
  const outDir = makeTempDir("odd-sdlc-ts-t161-cli-outdest-");
  const outputPath = path.join(outDir, "analysis.json");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world",
      "--format",
      "json",
      "--output",
      outputPath
    ]);
    assert.equal(result.status, "ok");
    assert.ok(existsSync(outputPath));
    const written = readFileSync(outputPath, "utf8");
    const parsed = JSON.parse(written);
    assert.equal(parsed.kind, SDLC_FD_RUN_ANALYSIS_KIND);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("T-161 CLI dispatch rejects --output inside the inspected root", () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-rej-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const result = invokeOddSdlcSpecMethodCommandSync([
      "analyze-run",
      "--run-archive",
      archiveRoot,
      "--profile",
      "hello_world",
      "--format",
      "json",
      "--output",
      path.join(archiveRoot, "analysis.json")
    ]);
    assert.equal(result.status, "error");
    assert.equal(result.exitCode, 2);
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

test("T-161 CLI binary prints markdown output via stdout", { skip: !existsSync(CLI_MAIN) }, () => {
  const archiveRoot = makeTempDir("odd-sdlc-ts-t161-cli-bin-");
  try {
    buildSyntheticT132Archive({ rootDir: archiveRoot });
    const spawned = spawnSync(
      process.execPath,
      [
        CLI_MAIN,
        "analyze-run",
        "--run-archive",
        archiveRoot,
        "--profile",
        "hello_world",
        "--format",
        "markdown"
      ],
      { encoding: "utf8", timeout: 30_000 }
    );
    assert.equal(spawned.status, 0, `cli stderr: ${spawned.stderr}`);
    assert.ok(spawned.stdout.startsWith("# F_D Run Analysis"));
  } finally {
    rmSync(archiveRoot, { recursive: true, force: true });
  }
});

// AC-14 evidence-based tests against the live archive set. These archives live
// under test_runs/ which is gitignored, so the tests skip when the archives
// are absent. The synthetic-fixture tests above are the authoritative AC
// proof; these provide additional evidence against real run shapes when the
// archives are present.

test("T-161 analyzes the clean T-132 live archive when present", { skip: !archiveExists(CLEAN_T132_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: CLEAN_T132_ARCHIVE,
    profile: "hello_world"
  });
  assert.equal(result.kind, SDLC_FD_RUN_ANALYSIS_KIND);
  assert.equal(result.currentStateTelemetrySummary.operatorRunCount, 12);
  assert.equal(result.currentStateTelemetrySummary.sameEdgeRetryCount, 0);
  assert.equal(result.currentStateTelemetrySummary.blockedAttemptCount, 0);
  const componentEdge = result.edgeTraversal.find(
    (attempt) => attempt.graphFunctionName === "derive_component_code_surface"
  );
  assert.ok(componentEdge !== undefined);
  assert.equal(
    componentEdge.productLineageCount,
    T132_LINEAGE_REFS.length,
    "five canonical lineage refs on hello.js"
  );
  assert.deepEqual(componentEdge.productFilesWritten, ["src/hello.js"]);
});

test("T-161 analyzes the retry-heavy T-132 live archive when present", { skip: !archiveExists(RETRY_HEAVY_T132_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: RETRY_HEAVY_T132_ARCHIVE,
    profile: "hello_world"
  });
  const codes = new Set(result.diagnostics.map((d) => d.code));
  assert.ok(
    codes.has("retry_observed") || codes.has("repair_observed") || codes.has("blocked_attempt_observed"),
    `expected retry/repair/block diagnostic, got: ${[...codes].join(",")}`
  );
});

test("T-161 analyzes the aborted T-132 live archive when present", { skip: !archiveExists(ABORTED_T132_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: ABORTED_T132_ARCHIVE,
    profile: "hello_world"
  });
  assert.ok(
    result.runtimeArtifactGaps.length > 0 ||
      result.diagnostics.some(
        (d) => d.code === "aborted_run_observed" || d.code === "edge_sequence_incomplete"
      )
  );
});

test("T-161 runs against the fresh T-133 Rust live archive when present", { skip: !archiveExists(FRESH_T133_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: FRESH_T133_ARCHIVE,
    profile: "hello_world"
  });
  assert.equal(result.kind, SDLC_FD_RUN_ANALYSIS_KIND);
  assert.ok(result.currentStateTelemetrySummary.operatorRunCount > 0);
});

test("T-161 runs against the data_mapper scale sandbox archive when present", { skip: !archiveExists(DATA_MAPPER_SCALE_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: DATA_MAPPER_SCALE_ARCHIVE,
    profile: "data_mapper"
  });
  assert.equal(result.kind, SDLC_FD_RUN_ANALYSIS_KIND);
});

test("T-161 reports the data_mapper repair/timeout archive as incomplete when present", { skip: !archiveExists(DATA_MAPPER_REPAIR_TIMEOUT_ARCHIVE) }, () => {
  const result = analyzeSdlcFdRunArchive({
    inspectedRoot: DATA_MAPPER_REPAIR_TIMEOUT_ARCHIVE,
    profile: "data_mapper"
  });
  const hasAbortedOrIncomplete =
    result.diagnostics.some(
      (d) => d.code === "aborted_run_observed" || d.code === "edge_sequence_incomplete"
    ) || result.runtimeArtifactGaps.length > 0;
  assert.ok(hasAbortedOrIncomplete);
});
