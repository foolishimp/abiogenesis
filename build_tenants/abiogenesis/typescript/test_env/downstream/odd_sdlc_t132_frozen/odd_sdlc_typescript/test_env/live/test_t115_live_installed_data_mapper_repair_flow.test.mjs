// Validates: T-114
// Validates: T-115
// Validates: live-installed-data-mapper-repair-flow

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  installOddSdlcTypescript
} from "../../build/semantic/code/src/index.js";
import { liveTestArchiveRoot } from "./archive_root.mjs";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const LIVE_ENABLED = process.env["ODD_SDLC_TS_T115_DATA_MAPPER_LIVE"] === "1";
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();
const MAX_STEPS = Number.parseInt(
  process.env["ODD_SDLC_TS_T115_DATA_MAPPER_MAX_STEPS"] ?? "36",
  10
);
const COMMAND_TIMEOUT_MS = configuredLiveTimeoutMs(
  "ODD_SDLC_TS_T115_DATA_MAPPER_COMMAND_TIMEOUT_MS",
  RUNTIME_POLICY.liveHarnessCommandTimeoutMs
);

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function assertTemplateCarriesTest35ParityAuthority(workspace) {
  const requirementsPath = path.join(workspace, "specification/mapper_requirements.md");
  assert.equal(
    existsSync(requirementsPath),
    true,
    "data_mapper template requirements must be present"
  );
  const text = readFileSync(requirementsPath, "utf8");
  for (const id of [
    "REQ-ENG-001",
    "REQ-ENG-002",
    "REQ-ENG-003",
    "REQ-ENG-004",
    "REQ-ENG-005",
    "REQ-ENG-006",
    "REQ-ENG-007",
    "REQ-BT-001",
    "REQ-BT-002",
    "REQ-BT-003",
    "REQ-BT-004"
  ]) {
    assert.match(text, new RegExp(`\\b${id}\\b`, "u"), `missing parity requirement ${id}`);
  }
}

function freshDataMapperWorkspace(archiveRoot) {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing data_mapper template: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  const workspace = path.join(archiveRoot, "workspace");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspace, { recursive: true });
  for (const relativePath of [
    ".ai-workspace/events",
    ".ai-workspace/runtime",
    ".abiogenesis",
    ".genesis",
    ".npm-cache",
    "node_modules"
  ]) {
    rmSync(path.join(workspace, relativePath), { recursive: true, force: true });
  }
  assertTemplateCarriesTest35ParityAuthority(workspace);
  return workspace;
}

function installedOddSdlcCommand(install) {
  const commandPath = install.commandPaths.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  assert(commandPath, "odd-sdlc-ts command path missing");
  return commandPath;
}

function runInstalled(commandPath, args, workspace, archiveRoot, label) {
  const run = spawnSync(commandPath, args, {
    cwd: workspace,
    encoding: "utf8",
    env: {
      ...process.env,
      ODD_SDLC_TS_OUTPUT: "json"
    },
    maxBuffer: 1024 * 1024 * 50,
    timeout: COMMAND_TIMEOUT_MS
  });
  const record = {
    label,
    commandPath,
    args,
    cwd: workspace,
    status: run.status,
    signal: run.signal,
    error: run.error?.message ?? null,
    stdoutBytes: Buffer.byteLength(run.stdout ?? "", "utf8"),
    stderr: run.stderr
  };
  writeJson(path.join(archiveRoot, `${label}.process.json`), record);
  writeFileSync(path.join(archiveRoot, `${label}.stdout.json`), run.stdout ?? "", "utf8");
  writeFileSync(path.join(archiveRoot, `${label}.stderr.log`), run.stderr ?? "", "utf8");
  assert.equal(run.status, 0, run.stderr || JSON.stringify(record, null, 2));
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.kind, "odd_sdlc_spec_method_result");
  assert.equal(parsed.status, "ok", JSON.stringify(parsed, null, 2));
  return parsed.payload;
}

function edgeSummary(payload) {
  return {
    status: payload.status,
    currentEdge: payload.projection?.currentEdge ?? payload.summary?.currentEdge ?? null,
    postflight: payload.postflight?.status ?? null,
    assurance: payload.assuranceSatisfaction?.status ?? null,
    blockingReason: payload.summary?.blockingReason ?? payload.blockingReason ?? null,
    archiveRoot: payload.archiveRoot ?? payload.summary?.archiveRoot ?? null
  };
}

function writeRepairFlowWorkerScript(workspace) {
  const workerPath = path.join(workspace, "t115_repair_flow_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const sourceRelative = 'cdme-core/src/main/scala/cdme/Core.scala';",
      "const testRelative = 'cdme-core/src/test/scala/cdme/CoreSpec.scala';",
      "const runtimeDir = path.join(process.cwd(), '.ai-workspace/runtime');",
      "mkdirSync(runtimeDir, { recursive: true });",
      "const observationPath = path.join(runtimeDir, 't115_repair_flow_observations.jsonl');",
      "const failedQualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], status: 'failed', evidenceRefs: [`file://${manifest.outputFile}`] };",
      "const failureRow = { kind: 'sdlc_component_execution_failure_row', failureId: 'failure://cdme-core/CoreSpec/TC-DM-001', shardId: 'test-shard-01-cdme-core', moduleName: 'cdme-core', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], failureKind: 'assertion_failure', repairTarget: 'component_code', lawfulReentryPoint: 'repair_component_realization', attributionConfidence: 'high', sourceRefs: [`build_tenants/scala_spark/${sourceRelative}`], testRefs: [`build_tenants/scala_spark/${testRelative}`], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'repair_required', repairRows: [{ kind: 'sdlc_component_repair_schedule_row', scheduleId: 'repair://cdme-core/CoreSpec/TC-DM-001', failureId: failureRow.failureId, repairTarget: 'component_code', lawfulReentryPoint: 'repair_component_realization', attributionConfidence: 'high', testcaseIds: failureRow.testcaseIds, componentIds: failureRow.componentIds, requirementIds: failureRow.requirementIds, sourceRefs: failureRow.sourceRefs, testRefs: failureRow.testRefs, evidenceRefs: failureRow.evidenceRefs }], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const topologyRow = { kind: 'sdlc_component_topology_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', concernRole: 'mapper', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const testTopologyRow = { kind: 'sdlc_test_component_topology_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  if (manifest.targetAssetType === 'implementation_component_topology_surface') return { ...base, componentTopologyRows: [topologyRow] };",
      "  if (manifest.targetAssetType === 'component_realization_schedule_surface' || manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'test_component_topology_surface') return { ...base, testComponentTopologyRows: [testTopologyRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [failedQualificationRow], componentExecutionFailureRegister: { kind: 'component_execution_failure_register', registerVersion: 'ts-component-depth-v1', failureRows: [failureRow] } };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, componentRepairSchedule: repairSchedule, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'worker attempted to close parity over open repair row', blockingReasons: [], evidenceRefs: [`file://${manifest.outputFile}`] } };",
      "  return null;",
      "}",
      "function designAxis(axis) {",
      "  return { kind: 'sdlc_design_completeness_axis_verdict', axis, status: 'satisfied', reasons: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "}",
      "function designVerdict() {",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: designAxis('entity'), attribute: designAxis('attribute'), flow: designAxis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:MappingPlan.planId', name: 'planId', valueType: 'String', cardinality: 'one', invariantRefs: ['REQ-ENG-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:MappingPlan', moduleName: 'cdme-compiler', ownership: 'owned', attributes: [attribute], invariants: ['planId is stable across compilation'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:compileMappingPlan', moduleName: 'cdme-compiler', inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], requiredAttributeIds: [attribute.attributeId] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [{ kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'cdme-compiler', attributes: [attribute], sourceModuleNames: ['cdme-compiler'] }], operations: [operation], crossModuleReferences: [], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const sunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:compileMappingPlan', moduleName: 'cdme-compiler', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:MappingPlan.draft.compiled'] }], evidenceRefs: [`file://${manifest.outputFile}`] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  if (manifest.targetAssetType === 'implementation_module_surface') return { ...base, moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'cdme-compiler', entities: [entity], operations: [operation], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'cdme-compiler', entityId: entity.entityId, stateless: false, states: ['draft', 'compiled'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:MappingPlan.draft.compiled', fromState: 'draft', toState: 'compiled', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], aggregateDomainModel: null, aggregateSunnyDaySequence: null, designCompletenessVerdict: null };",
      "  if (manifest.targetAssetType === 'aggregate_domain_model_surface') return { ...base, moduleSchemaFragments: [], moduleStateDiagramFragments: [], aggregateDomainModel, aggregateSunnyDaySequence: null, designCompletenessVerdict: designVerdict() };",
      "  if (manifest.targetAssetType === 'aggregate_sunny_day_sequence_surface') return { ...base, moduleSchemaFragments: [], moduleStateDiagramFragments: [], aggregateDomainModel, aggregateSunnyDaySequence: sunnyDaySequence, designCompletenessVerdict: designVerdict() };",
      "  return null;",
      "}",
      "const componentRegister = componentDepthRegister();",
      "const designRegister = designDepthRegister();",
      "const outputLines = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`)];",
      "if (componentRegister !== null) outputLines.push('', '```component_depth_register', JSON.stringify(componentRegister, null, 2), '```');",
      "if (designRegister !== null) outputLines.push('', '```design_depth_register', JSON.stringify(designRegister, null, 2), '```');",
      "const output = outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const materializedFiles = [];",
      "let executionEvidence = null;",
      "if (manifest.productMaterialization.required) {",
      "  const role = manifest.targetAssetType === 'component_test_surface' ? 'test' : 'source';",
      "  const relativePath = role === 'test' ? testRelative : sourceRelative;",
      "  const productPath = path.join(manifest.productMaterialization.tenantRoot, relativePath);",
      "  mkdirSync(dirname(productPath), { recursive: true });",
      "  const product = role === 'test' ? 'package cdme\\nimport org.scalatest.funsuite.AnyFunSuite\\nfinal class CoreSpec extends AnyFunSuite { test(\"core contract\") { assert(Core.retryClosed == true) } }\\n' : 'package cdme\\nobject Core { val retryClosed = false }\\n';",
      "  writeFileSync(productPath, product, 'utf8');",
      "  materializedFiles.push({ kind: 'sdlc_materialized_product_file', role, relativePath, absolutePath: productPath, digest: `sha256:${createHash('sha256').update(product, 'utf8').digest('hex')}`, byteCount: Buffer.byteLength(product, 'utf8') });",
      "}",
      "if (manifest.targetAssetType === 'test_execution_result_surface') {",
      "  const reportPath = path.join(manifest.archiveRoot, 'junit-report.xml');",
      "  const report = '<testsuite tests=\"1\" failures=\"1\"><testcase classname=\"cdme.CoreSpec\" name=\"core contract\"><failure message=\"expected retryClosed true\"/></testcase></testsuite>\\n';",
      "  writeFileSync(reportPath, report, 'utf8');",
      "  const shardEvidence = manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'failed', reportRefs: [`file://${reportPath}`], testsObserved: 1, passedCount: 0, failedCount: 1 }));",
      "  executionEvidence = { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'failed', reportRefs: [`file://${reportPath}`], testsObserved: shardEvidence.length, passedCount: 0, failedCount: shardEvidence.length, shardEvidence };",
      "}",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const executionRefs = executionEvidence === null ? [] : executionEvidence.reportRefs;",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "appendFileSync(observationPath, `${JSON.stringify({ edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, hasFailureRegister: componentRegister?.componentExecutionFailureRegister?.failureRows?.length > 0, repairScheduleStatus: componentRegister?.componentRepairSchedule?.scheduleStatus ?? null, executionStatus: executionEvidence?.status ?? null, reportUnresolvedReasonsAdvisory: true })}\\n`, 'utf8');",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'T-115 live installed repair-flow worker output', unresolvedReasons: ['advisory report prose must not decide closure'], materializedFiles, executionEvidence, executionEvidenceErrors: [], obligationAssessments: manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...materializedRefs, ...executionRefs, ...obligation.evidenceRefs], blockingReasons: [] })) }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function readObservations(workspace) {
  const observationPath = path.join(
    workspace,
    ".ai-workspace/runtime/t115_repair_flow_observations.jsonl"
  );
  assert.equal(existsSync(observationPath), true, "missing T-115 worker observations");
  return readFileSync(observationPath, "utf8")
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

test(
  "T-114/T-115 live installed data_mapper admits failed execution as repair schedule truth",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_T115_DATA_MAPPER_LIVE=1 not set" },
  async () => {
    const archiveRoot = liveTestArchiveRoot(
      "t115_live_installed_data_mapper_repair_flow",
      archiveTimestamp(),
      process.pid
    );
    mkdirSync(archiveRoot, { recursive: true });
    const workspace = freshDataMapperWorkspace(archiveRoot);
    const workerScript = writeRepairFlowWorkerScript(workspace);
    const install = await installOddSdlcTypescript({
      targetRoot: workspace,
      packageSourceRoot: PACKAGE_ROOT,
      abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
      installedPackageName: "odd-sdlc-t115-live-data-mapper"
    });
    assert.equal(install.kind, "installed");
    const commandPath = installedOddSdlcCommand(install);
    const target = "graph_function:bootstrap_release_self_test";
    const workerTransport = `process://node?script=${encodeURIComponent(workerScript)}`;
    const requiredEdges = new Set([
      "derive_test_execution_result_surface",
      "qualify_component_test_execution_surface",
      "derive_component_repair_schedule_surface"
    ]);
    const reachedEdges = new Set();
    const steps = [];

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const gaps = runInstalled(
        commandPath,
        ["gaps", "--workspace", workspace],
        workspace,
        archiveRoot,
        `step-${String(step).padStart(2, "0")}-gaps`
      );
      const currentEdge = gaps.projection.currentEdge;
      steps.push({ step, phase: "gaps", ...edgeSummary(gaps) });
      if (currentEdge === null) {
        break;
      }
      if (currentEdge === FG_CONFORM_PROJECT) {
        const induction = runInstalled(
          commandPath,
          ["start", "--workspace", workspace, "--until", "blocked"],
          workspace,
          archiveRoot,
          `step-${String(step).padStart(2, "0")}-induction`
        );
        steps.push({ step, phase: "induction", ...edgeSummary(induction) });
        assert.equal(induction.status, "converged", JSON.stringify(induction, null, 2));
        continue;
      }
      const start = runInstalled(
        commandPath,
        [
          "start",
          "--workspace",
          workspace,
          "--target",
          target,
          "--until",
          "first_traversal",
          "--worker",
          workerTransport
        ],
        workspace,
        archiveRoot,
        `step-${String(step).padStart(2, "0")}-start-${currentEdge}`
      );
      steps.push({ step, phase: "start", requestedEdge: currentEdge, ...edgeSummary(start) });
      writeJson(path.join(archiveRoot, "steps.json"), steps);
      assert.equal(start.status, "worker_invoked", JSON.stringify(start, null, 2));
      assert.equal(
        JSON.stringify(start).includes("worker_report_unresolved_reasons_present"),
        false,
        "T-114 report prose must not reappear as closure authority"
      );
      reachedEdges.add(currentEdge);
      if ([...requiredEdges].every((edge) => reachedEdges.has(edge))) {
        break;
      }
    }

    const observations = readObservations(workspace);
    writeJson(path.join(archiveRoot, "steps.json"), steps);
    writeJson(path.join(archiveRoot, "worker_observations.json"), observations);
    writeJson(path.join(archiveRoot, "reached_edges.json"), [...reachedEdges].sort());
    for (const edge of requiredEdges) {
      assert.equal(reachedEdges.has(edge), true, `required T-115 live edge not reached: ${edge}`);
    }
    assert.equal(
      observations.some((row) =>
        row.targetAssetType === "test_execution_result_surface" &&
        row.executionStatus === "failed"
      ),
      true,
      "live lane must inject failed governed execution evidence"
    );
    assert.equal(
      observations.some((row) =>
        row.targetAssetType === "component_test_qualification_surface" &&
        row.hasFailureRegister === true
      ),
      true,
      "live lane must emit typed component execution failure attribution"
    );
    assert.equal(
      observations.some((row) =>
        row.targetAssetType === "component_repair_schedule_surface" &&
        row.repairScheduleStatus === "repair_required"
      ),
      true,
      "live lane must emit bounded component repair schedule truth"
    );
    writeJson(path.join(archiveRoot, "run_summary.json"), {
      verdict: "passed",
      workspace,
      reachedEdges: [...reachedEdges].sort(),
      observations,
      maxSteps: MAX_STEPS
    });
  }
);
