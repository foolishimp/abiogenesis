// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-052
// Validates: REQ-F-ODDSDLC-053
// Validates: REQ-F-ODDSDLC-054
// Validates: REQ-F-ODDSDLC-055
// Validates: REQ-F-ODDSDLC-056
// Validates: T-064

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  admitWorkerResultReport,
  admitSdlcProjectConstraints,
  constructWorkerProcessFailurePostflight,
  constructSdlcGtlModule,
  constructorResultFromWorkerOutput,
  defaultOperationForTarget,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  executeInstalledOperatorStart,
  hookContractByEdgeName,
  installOddSdlcTypescript,
  minimalSdlcHookInvocationForContract,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  readWorkerResultReport,
  invokeOddSdlcSpecMethodCommand,
  runSdlcHookTurn,
  serializeOddSdlcSpecMethodResult,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const CLI_MAIN = resolve(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t064-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-064 Fixture", "", "Build a governed data-mapper style project."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    ["# Product", "", "T-064 fixture product."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    ["# Goals", "", "- exercise installed operator worker path"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Create a typed data mapping application from source requirements."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    ["# Imported Sources", "", "- fixture://t064"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-fixture.md"),
    ["# Requirements", "", "REQ-T064-001: Preserve installed operator replay truth."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    ["# Project Bootstrap", "", "project_slug: t064_fixture"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t064_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- tenant: typescript"].join("\n"),
    "utf8"
  );
  return root;
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
    "  const findings = reviewedObligationIds.map((obligationId) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts generated asset for installed-operator UX regression' }));",
    `  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: ${JSON.stringify(summary)} };`,
    "  writeFileSync(assessmentPath, `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
    "  process.stdout.write(`reviewStatus=passed reviewed=${reviewedObligationIds.length} blocked=0\\n`);",
    "  process.exit(0);",
    "}"
  ].join("\n");
}

function writeWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for T-064 worker"),
      "process.stdout.write('t064 stdout before report\\n');",
      "process.stderr.write('t064 stderr before report\\n');",
      "const obligationLines = manifest.traversalObligationContext.obligations.flatMap((obligation) => [`obligation: ${obligation.obligationId}`, ...obligation.evidenceRefs.map((ref) => `evidence: ${ref}`)]);",
      "const content = [`# ${manifest.targetAssetType}`, '', `graph_function: ${manifest.graphFunctionName}`, `edge: ${manifest.edgeName}`, '', 'This is a governed first-slice intent surface.', '', '## Obligations', ...obligationLines].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeEnvEchoWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_env_echo_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for T-064 env worker"),
      "process.stdout.write(`NODE_TEST_CONTEXT=${process.env.NODE_TEST_CONTEXT ?? ''}\\n`);",
      "const content = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`, '', 'REQ-T064-001'].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeSecondEdgeFailingWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_loop_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed before second-edge failure"),
      "if (manifest.edgeName === 'derive_product_surface') process.exit(7);",
      "const obligationLines = manifest.traversalObligationContext.obligations.flatMap((obligation) => [`obligation: ${obligation.obligationId}`, ...obligation.evidenceRefs.map((ref) => `evidence: ${ref}`)]);",
      "const content = [`# ${manifest.targetAssetType}`, '', `graph_function: ${manifest.graphFunctionName}`, `edge: ${manifest.edgeName}`, '', 'This is governed autonomous-loop output.', '', '## Obligations', ...obligationLines].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeTransformOnlyWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_transform_only_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch("synthetic review-grade assessment passed for transform-only worker"),
      "const content = [`# ${manifest.targetAssetType}`, '', `graph_function: ${manifest.graphFunctionName}`, `edge: ${manifest.edgeName}`, '', 'Implements: REQ-T064-001', '', 'This worker performs only F_P.transform and leaves evaluation to the framework.'].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function t102WorkerProjectionReport(manifest, overrides = {}) {
  const content = [
    `# ${manifest.targetAssetType}`,
    "",
    "T-102 projection admission fixture."
  ].join("\n");
  const artifact = `${content}\n`;
  mkdirSync(dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, artifact, "utf8");
  return {
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
    summary: "T-102 projection admission fixture",
    unresolvedReasons: [],
    materializedFiles: [],
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: [],
    fpTransformRequestRef: manifest.fpTransformRequest?.requestRef ?? null,
    fpTransformResultRef:
      manifest.fpTransformRequest === null
        ? null
        : pathToFileURL(manifest.fpTransformResultFile).href,
    fpTransformStatusSnapshot:
      manifest.fpTransformRequest === null ? null : "returned",
    fpEvaluateResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
    ...overrides
  };
}

function writeInvalidComponentTopologyWorkerScript(workspaceRoot) {
  const workerPath = path.join(
    workspaceRoot,
    "t064_invalid_component_topology_worker.mjs"
  );
  writeFileSync(
    workerPath,
    [
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const axis = (axis) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis, status: 'satisfied', reasons: ['fixture complete'], evidenceRefs: ['fixture://t064'] });",
      "const register = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: 'implementation_design_surface', stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://typescript', language: 'typescript', buildTool: 'node' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'typescript', moduleRef: 'module://typescript' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://typescript' }], moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'typescript', entities: [{ kind: 'sdlc_domain_entity', entityId: 'entity:entry', moduleName: 'typescript', ownership: 'owned', attributes: [{ kind: 'sdlc_domain_attribute', attributeId: 'attr:entry.stdout', name: 'stdout', valueType: 'string', cardinality: 'one', invariantRefs: ['REQ-T064-001'] }], invariants: [], sourceAssetRefs: ['fixture://t064'] }], operations: [{ kind: 'sdlc_domain_operation', operationId: 'operation:typescript.emit', moduleName: 'typescript', inputEntityIds: [], outputEntityIds: ['entity:entry'], requiredAttributeIds: ['attr:entry.stdout'] }], requirementIds: ['REQ-T064-001'], sourceAssetRefs: ['fixture://t064'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'typescript', entityId: 'entity:entry', stateless: true, states: [], transitions: [], requirementIds: ['REQ-T064-001'], sourceAssetRefs: ['fixture://t064'] }], aggregateDomainModel: { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [{ kind: 'sdlc_aggregate_domain_entity', entityId: 'entity:entry', ownerModuleName: 'typescript', attributes: [{ kind: 'sdlc_domain_attribute', attributeId: 'attr:entry.stdout', name: 'stdout', valueType: 'string', cardinality: 'one', invariantRefs: ['REQ-T064-001'] }], sourceModuleNames: ['typescript'] }], operations: [{ kind: 'sdlc_domain_operation', operationId: 'operation:typescript.emit', moduleName: 'typescript', inputEntityIds: [], outputEntityIds: ['entity:entry'], requiredAttributeIds: ['attr:entry.stdout'] }], crossModuleReferences: [], evidenceRefs: ['fixture://t064'] }, sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://typescript/hello' }], aggregateSunnyDaySequence: { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:emit', moduleName: 'typescript', operationId: 'operation:typescript.emit', inputEntityIds: [], outputEntityIds: ['entity:entry'], stateTransitionIds: [] }], evidenceRefs: ['fixture://t064'] }, componentTopologyRows: [{ kind: 'sdlc_component_topology_row', componentId: 'entry', moduleName: 'missing-module', relativePath: 'src/index.ts', publicBoundary: 'node-entry-script:src/index.ts', concernRole: 'entry_script_stdout_emitter', requirementIds: ['REQ-T064-001'], sourceAssetRefs: ['fixture://t064'] }], componentRealizationRows: [{ kind: 'sdlc_component_realization_row', componentId: 'entry', moduleName: 'missing-module', relativePath: 'src/index.ts', publicBoundary: 'node-entry-script:src/index.ts', trancheId: null, firstProductFileToChange: 'src/index.ts', upstreamComponentIds: [], requirementIds: ['REQ-T064-001'], sourceAssetRefs: ['fixture://t064'] }], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: 'src/index.ts', role: 'source' }], designCompletenessVerdict: { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') } };",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'design_depth_register') {",
      "  writeFileSync(path.join(manifest.archiveRoot, 'design_depth_fp_evaluator_register.json'), `${JSON.stringify(register, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const content = ['# implementation_design_surface', '', '```json design_depth_register', JSON.stringify(register, null, 2), '```', ''].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, content, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeSilentWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_silent_worker.mjs");
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

function writeFailingWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t064_failing_worker.mjs");
  writeFileSync(workerPath, "process.exit(7);\n", "utf8");
  return workerPath;
}

test("T-158 installed start JSON serialization emits compact CLI projection", () => {
  const archiveRoot = path.join(makeWorkspace(), ".ai-workspace/runtime/odd_sdlc/operator-runs/t158-cli-projection");
  const previous = process.env["ODD_SDLC_TS_OUTPUT"];
  process.env["ODD_SDLC_TS_OUTPUT"] = "json";
  try {
    const serialized = serializeOddSdlcSpecMethodResult({
      kind: "odd_sdlc_spec_method_result",
      command: "start",
      status: "ok",
      exitCode: 0,
      payload: {
        kind: "sdlc_installed_operator_start_outcome",
        status: "worker_invoked",
        archiveRoot,
        summary: {
          status: "worker_invoked",
          archiveRoot,
          graphFunctionName: "bootstrap_release_self_test",
          currentEdge: "derive_component_code_surface",
          blockingReason: null,
          nextLawfulAction: "close_or_reprice"
        },
        manifest: { kind: "large_manifest" },
        workerReport: { kind: "large_report" },
        postflight: { kind: "large_postflight" },
        gapDossier: null,
        traversalConsequence: { kind: "sdlc_installed_operator_traversal_consequence" },
        emittedRuntimeEventKinds: ["basis_admitted"]
      }
    });
    const result = JSON.parse(serialized);

    assert.equal(result.kind, "odd_sdlc_spec_method_result");
    assert.equal(result.payload.kind, "sdlc_installed_operator_start_cli_projection");
    assert.equal(result.payload.sourceOutcomeKind, "sdlc_installed_operator_start_outcome");
    assert.equal(result.payload.compacted, true);
    assert.match(result.payload.sourceOutcomeRef, /\/run\.json$/u);
    assert.equal(
      result.payload.omittedCarrierRefs.some((ref) => ref.endsWith("/handoff_manifest.json")),
      true
    );
  } finally {
    if (previous === undefined) {
      delete process.env["ODD_SDLC_TS_OUTPUT"];
    } else {
      process.env["ODD_SDLC_TS_OUTPUT"] = previous;
    }
  }
});
test("B-078 typed ABG hard timeout outranks legacy silent inactivity", async () => {
  const workspace = makeWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-b078"
  });
  assert.equal(install.kind, "installed");
  const workerScript = writeSilentWorkerScript(workspace);
  const previousTimeout = process.env["ODD_SDLC_WORKER_TIMEOUT_MS"];
  const previousInactivityTimeout =
    process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"];
  const previousHeartbeat = process.env["ODD_SDLC_WORKER_HEARTBEAT_MS"];
  const previousMinimumTimeout =
    process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"];
  process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"] = "1";
  process.env["ODD_SDLC_WORKER_TIMEOUT_MS"] = "120";
  process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"] = "10000";
  process.env["ODD_SDLC_WORKER_HEARTBEAT_MS"] = "20";
  try {
    const start = await invokeOddSdlcSpecMethodCommand([
      "start",
      "--workspace",
      workspace,
      "--target",
      "graph_function:bootstrap_release_self_test",
      "--until",
      "first_traversal",
      "--worker",
      `process://node?script=${encodeURIComponent(workerScript)}`
    ]);

    assert.equal(start.status, "ok", start.payload?.error ?? start.status);
    assert.equal(start.payload.status, "worker_failed");
    assert.equal(start.payload.workerRun.timedOut, true);
    assert.equal(start.payload.workerRun.stdoutByteCount, 0);
    assert.equal(start.payload.workerRun.stderrByteCount, 0);
    assert.equal(
      start.payload.postflight.blockingReasonCarriers[0].code,
      "worker_hard_timeout"
    );
    assert.equal(start.payload.manifest.retryContext.priorGapDossiers.length, 0);
    assert.equal(start.payload.gapDossier.retryEligible, false);
    assert.deepStrictEqual(
      start.payload.gapDossier.nextLawfulActions,
      ["triage_gap"]
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /sharpenedRetryAvailable=false/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /pid=\d+/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /outcome=hard_timeout/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /hardTimeoutMs=120/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /inactivityTimeoutMs=10000/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /heartbeatMs=20/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /lastHeartbeatElapsedMs=\d+/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /signalSequence=SIGTERM@\d+ms/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /runtimeLivenessAuthority=abiogenesis_runtime_liveness_observer_projection/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /runtimeLivenessProjectionRef=file:.*runtime_liveness_observer_projection\.json/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /runtimeLivenessLeaseState=externally_interrupted/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /runtimeLivenessDispositionAction=block/u
    );
    assert.match(
      start.payload.postflight.blockingReasonCarriers[0].detail,
      /processSummaryRef=file:.*worker_process_summary\.json/u
    );
    assert.deepStrictEqual(start.payload.gapDossier.nextLawfulActions, [
      "triage_gap"
    ]);
    assert.equal(start.payload.gapDossier.retryEligible, false);
    assert.match(
      readFileSync(
        path.join(start.payload.archiveRoot, "worker_process_events.jsonl"),
        "utf8"
      ),
      /actor_process_timeout/u
    );
    assert.equal(
      start.payload.postflight.evidenceRefs.some((ref) =>
        ref.includes("worker_process_events.jsonl")
      ),
      true
    );
    assert.equal(
      start.payload.postflight.evidenceRefs.some((ref) =>
        ref.includes("worker_process_started_context.json")
      ),
      true
    );
    assert.equal(
      start.payload.postflight.evidenceRefs.some((ref) =>
        ref.includes("worker_process_summary.json")
      ),
      true
    );
    const processSummary = JSON.parse(
      readFileSync(
        path.join(start.payload.archiveRoot, "worker_process_summary.json"),
        "utf8"
      )
    );
    assert.equal(processSummary.kind, "sdlc_worker_process_summary");
    assert.equal(processSummary.timeoutMs, 120);
    assert.equal(processSummary.inactivityTimeoutMs, 10000);
    assert.equal(processSummary.heartbeatMs, 20);
    assert.equal(
      processSummary.runtimeLivenessAuthority,
      "abiogenesis_runtime_liveness_observer_projection"
    );
    assert.equal(
      processSummary.runtimeLivenessLeaseState,
      "externally_interrupted"
    );
    assert.equal(processSummary.runtimeLivenessDispositionAction, "block");
    assert.equal(processSummary.pid > 0, true);
    assert.equal(processSummary.lastHeartbeatElapsedMs >= 0, true);
    assert.deepStrictEqual(
      processSummary.signalSequence.map((entry) => entry.signal),
      ["SIGTERM"]
    );
    assert.match(processSummary.manifestRef, /handoff_manifest\.json$/u);
    assert.match(processSummary.promptRef, /worker_prompt\.md$/u);
    assert.match(processSummary.reportRef, /worker_result_report\.json$/u);
    assert.match(processSummary.outputRef, /specification\/INTENT\.md$/u);
    const livenessProjection = JSON.parse(
      readFileSync(
        path.join(start.payload.archiveRoot, "runtime_liveness_observer_projection.json"),
        "utf8"
      )
    );
    assert.equal(livenessProjection.kind, "runtime_liveness_observer_projection");
    assert.equal(livenessProjection.leaseState, "externally_interrupted");
    assert.equal(livenessProjection.disposition.action, "block");
    assert.equal(
      livenessProjection.interruptionRows.some(
        (row) => row.source === "harness_safety_cap"
      ),
      true
    );
  } finally {
    if (previousTimeout === undefined) {
      delete process.env["ODD_SDLC_WORKER_TIMEOUT_MS"];
    } else {
      process.env["ODD_SDLC_WORKER_TIMEOUT_MS"] = previousTimeout;
    }
    if (previousInactivityTimeout === undefined) {
      delete process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"];
    } else {
      process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"] =
        previousInactivityTimeout;
    }
    if (previousHeartbeat === undefined) {
      delete process.env["ODD_SDLC_WORKER_HEARTBEAT_MS"];
    } else {
      process.env["ODD_SDLC_WORKER_HEARTBEAT_MS"] = previousHeartbeat;
    }
    if (previousMinimumTimeout === undefined) {
      delete process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"];
    } else {
      process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"] =
        previousMinimumTimeout;
    }
  }
});

test("T-128 installed start returns worker_failed envelope after process failure", async () => {
  const workspace = makeWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t128"
  });
  assert.equal(install.kind, "installed");
  const workerScript = writeFailingWorkerScript(workspace);

  const start = await invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    workspace,
    "--target",
    "graph_function:bootstrap_release_self_test",
    "--until",
    "first_traversal",
    "--worker",
    `process://node?script=${encodeURIComponent(workerScript)}`
  ]);

  assert.equal(start.status, "ok", start.payload?.error ?? JSON.stringify(start.payload));
  assert.equal(start.payload.kind, "sdlc_installed_operator_start_outcome");
  assert.equal(start.payload.status, "worker_failed");
  assert.equal("loop" in start.payload, false);
  assert.equal(start.payload.workerRun.status, 7);
  assert.equal(start.payload.postflight.status, "blocked");
  assert.equal(start.payload.gapDossier.status, "open");
  assert.equal(start.payload.gapDossier.retryEligible, false);
  assert.deepStrictEqual(start.payload.gapDossier.nextLawfulActions, [
    "triage_gap"
  ]);
  assert.equal(
    existsSync(
      path.join(
        start.payload.manifest.archiveRoot,
        "worker_process_failure_postflight.json"
      )
    ),
    true
  );
});

test("B-078 process-summary admission defects fail closed as typed evidence blockers", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "b078-process-summary-admission"
  });
  writeHandoffFiles(manifest);
  const stdoutPath = path.join(manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(manifest.archiveRoot, "worker_stderr.log");
  writeFileSync(stdoutPath, "", "utf8");
  writeFileSync(stderrPath, "", "utf8");
  const workerRun = {
    kind: "sdlc_worker_run_result",
    command: "node",
    args: [],
    cwd: workspace,
    status: 143,
    signal: null,
    elapsedMs: 120,
    timedOut: true,
    stdoutByteCount: 0,
    stderrByteCount: 0,
    stdoutPath,
    stderrPath,
    outputLastMessagePath: null,
    error: null
  };

  const missing = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun
  });
  assert.equal(
    missing.blockingReasonCarriers[0].code,
    "worker_process_summary_missing"
  );
  assert.equal(
    missing.blockingReasons.some((reason) =>
      reason.startsWith("silent_worker_inactivity")
    ),
    false
  );

  writeFileSync(
    path.join(manifest.archiveRoot, "worker_process_summary.json"),
    "{\"kind\":\"wrong\"}\n",
    "utf8"
  );
  const invalid = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun
  });
  assert.equal(
    invalid.blockingReasonCarriers[0].code,
    "worker_process_summary_invalid"
  );
  assert.match(
    invalid.blockingReasonCarriers[0].detail,
    /processSummaryRef=file:.*worker_process_summary\.json/u
  );
});

test("T-064 worker provider rate limits stop automatic retry as runtime backpressure", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("prepare_test_execution_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 25,
    contract,
    runId: "t064-worker-rate-limit"
  });
  writeHandoffFiles(manifest);
  const stdoutPath = path.join(manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(manifest.archiveRoot, "worker_stderr.log");
  const finalOutputPath = path.join(manifest.archiveRoot, "final_output.txt");
  writeFileSync(
    stdoutPath,
    [
      JSON.stringify({
        type: "rate_limit_event",
        rate_limit_info: { status: "rejected", rateLimitType: "five_hour" }
      }),
      JSON.stringify({ type: "result", is_error: true, api_error_status: 429 })
    ].join("\n"),
    "utf8"
  );
  writeFileSync(stderrPath, "", "utf8");
  writeFileSync(finalOutputPath, "You've hit your org's monthly usage limit\n", "utf8");
  const workerRun = {
    kind: "sdlc_worker_run_result",
    command: "claude",
    args: [],
    cwd: workspace,
    outcome: { kind: "exited", status: 1 },
    executorProfile: "pty-terminal",
    streamModel: "terminal-transcript",
    finalOutputRef: pathToFileURL(finalOutputPath).href,
    status: 1,
    signal: null,
    elapsedMs: 1866,
    timedOut: false,
    stdoutByteCount: 180,
    stderrByteCount: 0,
    stdoutPath,
    stderrPath,
    outputLastMessagePath: null,
    error: null
  };

  const postflight = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun
  });

  assert.equal(postflight.blockingReasonCarriers[0].code, "worker_rate_limited");
  assert.equal(
    postflight.blockingReasonCarriers[0].lawfulReentryPoint,
    "triage_gap"
  );
  assert.equal(postflight.blockingReasonCarriers[0].reasonClass, "worker_runtime");
  assert(postflight.evidenceRefs.includes(pathToFileURL(finalOutputPath).href));
});

test("T-171 allowed rate-limit telemetry does not mask socket failures", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 25,
    contract,
    runId: "t171-worker-socket-failure"
  });
  writeHandoffFiles(manifest);
  const stdoutPath = path.join(manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(manifest.archiveRoot, "worker_stderr.log");
  const finalOutputPath = path.join(manifest.archiveRoot, "final_output.txt");
  writeFileSync(
    stdoutPath,
    JSON.stringify({
      type: "rate_limit_event",
      rate_limit_info: { status: "allowed", rateLimitType: "five_hour" }
    }),
    "utf8"
  );
  writeFileSync(stderrPath, "", "utf8");
  writeFileSync(
    finalOutputPath,
    "API Error: The socket connection was closed unexpectedly.\n",
    "utf8"
  );
  const workerRun = {
    kind: "sdlc_worker_run_result",
    command: "claude",
    args: [],
    cwd: workspace,
    outcome: { kind: "exited", status: 1 },
    executorProfile: "pty-terminal",
    streamModel: "terminal-transcript",
    finalOutputRef: pathToFileURL(finalOutputPath).href,
    status: 1,
    signal: null,
    elapsedMs: 935425,
    timedOut: false,
    stdoutByteCount: 88,
    stderrByteCount: 0,
    stdoutPath,
    stderrPath,
    outputLastMessagePath: null,
    error: null
  };

  const postflight = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun
  });

  assert.equal(postflight.blockingReasonCarriers[0].code, "worker_connection_failed");
  assert.equal(
    postflight.blockingReasonCarriers[0].lawfulReentryPoint,
    "same_edge_retry"
  );
});

test("T-102 worker output limits stay inside same-edge retry law", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("prepare_test_execution_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 25,
    contract,
    runId: "t102-worker-output-limit"
  });
  writeHandoffFiles(manifest);
  const stdoutPath = path.join(manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(manifest.archiveRoot, "worker_stderr.log");
  const finalOutputPath = path.join(manifest.archiveRoot, "final_output.txt");
  writeFileSync(stdoutPath, "", "utf8");
  writeFileSync(
    stderrPath,
    "Error: response exceeded the 32000 output token maximum\n",
    "utf8"
  );
  writeFileSync(finalOutputPath, "max_output_tokens exceeded\n", "utf8");
  const workerRun = {
    kind: "sdlc_worker_run_result",
    command: "claude",
    args: [],
    cwd: workspace,
    outcome: { kind: "exited", status: 1 },
    executorProfile: "pty-terminal",
    streamModel: "terminal-transcript",
    finalOutputRef: pathToFileURL(finalOutputPath).href,
    status: 1,
    signal: null,
    elapsedMs: 1866,
    timedOut: false,
    stdoutByteCount: 0,
    stderrByteCount: 58,
    stdoutPath,
    stderrPath,
    outputLastMessagePath: null,
    error: null
  };

  const postflight = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun
  });

  assert.equal(
    postflight.blockingReasonCarriers[0].code,
    "worker_output_limit_exceeded"
  );
  assert.equal(
    postflight.blockingReasonCarriers[0].lawfulReentryPoint,
    "same_edge_retry"
  );
  assert(postflight.evidenceRefs.includes(pathToFileURL(finalOutputPath).href));
});
test("T-102 worker report projection admission fails closed without same-archive evaluate citation", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t102-worker-report-projection-admission"
  });
  writeHandoffFiles(manifest);
  const report = t102WorkerProjectionReport(manifest);

  assert.equal(
    admitWorkerResultReport(report, manifest).authoritativeStageResultRef,
    pathToFileURL(manifest.fpEvaluateResultFile).href
  );

  const missingRole = { ...report };
  delete missingRole.projectionRole;
  assert.throws(
    () => admitWorkerResultReport(missingRole, manifest),
    /projectionRole/u
  );

  const missingStageRef = { ...report };
  delete missingStageRef.authoritativeStageResultRef;
  assert.throws(
    () => admitWorkerResultReport(missingStageRef, manifest),
    /authoritativeStageResultRef/u
  );

  assert.throws(
    () =>
      admitWorkerResultReport(
        { ...report, projectionRole: "worker_owned_report" },
        manifest
      ),
    /typed_fp_stage_projection/u
  );
  assert.throws(
    () =>
      admitWorkerResultReport(
        {
          ...report,
          authoritativeStageResultRef:
            "file:///tmp/other-archive/fp_evaluate_result.json"
        },
        manifest
      ),
    /same-archive fp_evaluate_result\.json/u
  );
});

test("T-159 assurance rejection rewrites F_P evaluate result as blocked", async () => {
  const workspace = makeWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t159-fp-evaluate-effective"
  });
  assert.equal(install.kind, "installed");
  const workerScript = writeInvalidComponentTopologyWorkerScript(workspace);

  const start = await invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    workspace,
    "--target",
    "graph_function:derive_implementation_design_surface",
    "--until",
    "first_traversal",
    "--worker",
    `process://node?script=${encodeURIComponent(workerScript)}`
  ]);

  assert.equal(start.status, "ok", start.payload?.error ?? JSON.stringify(start.payload));
  assert.equal(start.payload.status, "blocked");
  assert.equal(
    existsSync(path.join(start.payload.archiveRoot, "postflight.json")),
    true
  );
  const evaluateResult = JSON.parse(
    readFileSync(path.join(start.payload.archiveRoot, "fp_evaluate_result.json"), "utf8")
  );
  const postflight = JSON.parse(
    readFileSync(path.join(start.payload.archiveRoot, "postflight.json"), "utf8")
  );
  const designDepthPostflight = JSON.parse(
    readFileSync(
      path.join(start.payload.archiveRoot, "design_depth_fp_evaluator_postflight.json"),
      "utf8"
    )
  );
  assert.equal(evaluateResult.kind, "sdlc_fp_evaluate_result");
  assert.equal(postflight.status, "passed");
  assert.equal(designDepthPostflight.status, "blocked");
  assert.equal(evaluateResult.status, "blocked");
  assert.equal(evaluateResult.postflightStatus, "blocked");
  assert.match(evaluateResult.postflightRef, /design_depth_fp_evaluator_postflight\.json$/u);
  assert.match(
    [
      start.payload.summary.blockingReason ?? "",
      ...evaluateResult.blockingReasons,
      ...designDepthPostflight.blockingReasonCarriers.map((reason) => reason.detail ?? "")
    ].join(","),
    /evaluation_set_incomplete|design-depth register payload|review_grade_assessment_missing/u
  );
});
test("T-106 installed operator uses admitted conformed profile after workspace drift", async () => {
  const workspace = makeWorkspace();
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspace}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t064_fixture",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: []
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject =
    deriveSdlcConformProjectProfileFromWorkspace(workspace);
  assert.equal(conformedProject.activeTenant, "typescript");
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot: workspace,
      target: {
        kind: "graph_function",
        handle: "bootstrap_release_self_test"
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

  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: drifted_fixture",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test"
    ].join("\n"),
    "utf8"
  );

  const workerScript = writeTransformOnlyWorkerScript(workspace);
  const result = await executeInstalledOperatorStart({
    workspaceRoot: workspace,
    start,
    workerTransport: `process://node?script=${encodeURIComponent(workerScript)}`,
    replayEvents: []
  });

  assert.notEqual(result.status, "worker_failed");
  assert.notEqual(result.manifest, null);
  assert.equal(result.manifest.conformedProject.activeTenant, "typescript");
  assert.notEqual(result.traversalConsequence, null);
  assert.equal(
    result.manifest.productMaterialization.tenantRoot.endsWith(
      "build_tenants/typescript"
    ),
    true
  );
  const archiveRoot = result.manifest.archiveRoot;
  const consequence = result.traversalConsequence;
  const archivedEdgeGain = JSON.parse(
    readFileSync(path.join(archiveRoot, "sdlc_edge_gain.json"), "utf8")
  );
  const archivedResidualPressure = JSON.parse(
    readFileSync(
      path.join(archiveRoot, "sdlc_edge_residual_pressure.json"),
      "utf8"
    )
  );
  const archivedLedger = JSON.parse(
    readFileSync(path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json"), "utf8")
  );
  const archivedClosureDecision = JSON.parse(
    readFileSync(path.join(archiveRoot, "sdlc_edge_closure_decision.json"), "utf8")
  );
  const archivedNextAction = JSON.parse(
    readFileSync(path.join(archiveRoot, "sdlc_next_action_projection.json"), "utf8")
  );

  assert.equal(archivedEdgeGain.gainRef, consequence.edgeGain.gainRef);
  assert.equal(archivedEdgeGain.contractRef, archivedLedger.edgeAssuranceContractRef);
  assert.equal(
    archivedEdgeGain.contractDigest,
    archivedLedger.edgeAssuranceContractDigest
  );
  assert.equal(archivedResidualPressure.contractRef, archivedEdgeGain.contractRef);
  assert.equal(
    archivedResidualPressure.contractDigest,
    archivedEdgeGain.contractDigest
  );
  assert.deepStrictEqual(
    archivedLedger.edgeResidualPressureRefs,
    archivedResidualPressure.requiredPressureRefs
  );
  assert.equal(archivedClosureDecision.edgeGainRef, archivedEdgeGain.gainRef);
  assert.equal(
    archivedClosureDecision.edgeAssuranceDecisionRef,
    consequence.edgeClosureDecision.edgeAssuranceDecisionRef
  );
  assert.equal(
    archivedNextAction.edgeAssuranceContractRef,
    archivedLedger.edgeAssuranceContractRef
  );
  assert.equal(archivedNextAction.edgeGainRef, archivedEdgeGain.gainRef);
  assert.deepStrictEqual(
    archivedNextAction.edgeResidualPressureRefs,
    archivedResidualPressure.requiredPressureRefs
  );
});
