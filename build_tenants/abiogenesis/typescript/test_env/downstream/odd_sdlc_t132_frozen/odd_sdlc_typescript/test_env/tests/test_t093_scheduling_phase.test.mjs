// Validates: REQ-F-ODDSDLC-057
// Validates: T-093

import test from "node:test";
import assert from "node:assert/strict";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand,
  SDLC_HOOK_TARGET_POLICY
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t093-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    [
      "# Intent",
      "",
      "Build a governed product through a schedule-constrained realization edge."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    "# Product\n\nT-093 scheduling fixture.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    "# Goals\n\n- prove schedule surfaces constrain realization materialization\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    "# Imported Sources\n\n- fixture://t093\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-schedule.md"),
    [
      "# Scheduling Requirements",
      "",
      "REQ-T093-001: Produce implementation work from an admitted realization schedule.",
      "REQ-T093-002: Produce test archive evidence from an admitted test schedule."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    "# Project Bootstrap\n\nproject_slug: t093_fixture\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t093_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript/",
      "    language: TypeScript",
      "    build_tool: npm",
      "    test_runner: npm test",
      "    test_execution_contract: npm test",
      "    module_structure:",
      "      - api",
      "      - worker"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    "# Tenant Registry\n\n- tenant: typescript\n",
    "utf8"
  );
  mkdirSync(path.join(root, "build_tenants/typescript"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants/typescript/spec"), { recursive: true });
  writeFileSync(
    path.join(root, "build_tenants/typescript/spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "TypeScript",
        buildTool: "npm",
        runtime: "node",
        testRunner: "node --test"
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/typescript/package.json"),
    `${JSON.stringify(
      {
        type: "module",
        scripts: {
          test: "node --test \"api/test/*.test.ts\""
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  return root;
}

function writeWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t093_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const edgeLog = path.join(manifest.workspaceRoot, '.ai-workspace', 'runtime', 'odd_sdlc', 't093_edge_log.jsonl');",
      "mkdirSync(dirname(edgeLog), { recursive: true });",
      "appendFileSync(edgeLog, `${JSON.stringify({ edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, inputAssetTypes: manifest.inputAssetTypes, outputFile: manifest.outputFile, archiveRoot: manifest.archiveRoot })}\\n`, 'utf8');",
      "const sourceRelative = 'api/src/main.ts';",
      "const testRelative = 'api/test/main.test.ts';",
      "function designCompletenessVerdict() {",
      "  const axis = (name) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis: name, status: 'satisfied', reasons: [], evidenceRefs: [manifest.outputFile] });",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:ScheduledValue.seed', name: 'seed', valueType: 'number', cardinality: 'one', invariantRefs: ['REQ-T093-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:ScheduledValue', moduleName: 'api', ownership: 'owned', attributes: [attribute], invariants: ['seed is numeric'], sourceAssetRefs: ['fixture://t093'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:scheduledValue', moduleName: 'api', inputEntityIds: ['entity:ScheduledValue'], outputEntityIds: ['entity:ScheduledValue'], requiredAttributeIds: ['attr:ScheduledValue.seed'] };",
      "  const aggregateEntity = { kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'api', attributes: [attribute], sourceModuleNames: ['api'] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [aggregateEntity], operations: [operation], crossModuleReferences: [], evidenceRefs: [manifest.outputFile] };",
      "  const aggregateSunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:scheduledValue', moduleName: 'api', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:ScheduledValue.uncomputed.computed'] }], evidenceRefs: [manifest.outputFile] };",
      "  const topologyRow = { kind: 'sdlc_component_topology_row', componentId: 'api', moduleName: 'api', relativePath: sourceRelative, publicBoundary: 'scheduledValue', concernRole: 'other', requirementIds: ['REQ-T093-001'], sourceAssetRefs: ['fixture://t093'] };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'api', moduleName: 'api', relativePath: sourceRelative, publicBoundary: 'scheduledValue', trancheId: 'tranche:t093/api', firstProductFileToChange: sourceRelative, upstreamComponentIds: [], requirementIds: ['REQ-T093-001'], sourceAssetRefs: ['fixture://t093'] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType, stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://typescript-npm', language: 'typescript', buildTool: 'npm' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'api', moduleRef: 'module://api' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://t093/aggregate' }], sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://t093/scheduledValue' }], componentTopologyRows: [topologyRow], componentRealizationRows: [componentRow], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: sourceRelative, role: 'source' }] };",
      "  if (manifest.targetAssetType === 'implementation_design_surface') return { ...base, moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'api', entities: [entity], operations: [operation], requirementIds: ['REQ-T093-001'], sourceAssetRefs: ['fixture://t093'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'api', entityId: entity.entityId, stateless: false, states: ['uncomputed', 'computed'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:ScheduledValue.uncomputed.computed', fromState: 'uncomputed', toState: 'computed', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-T093-001'], sourceAssetRefs: ['fixture://t093'] }], aggregateDomainModel, aggregateSunnyDaySequence, designCompletenessVerdict: designCompletenessVerdict() };",
      "  return null;",
      "}",
      "function testDesignRegister() {",
      "  if (manifest.targetAssetType !== 'test_design_surface') return null;",
      "  const sourceRefs = manifest.traversalObligationContext.obligations.filter((obligation) => obligation.obligationKind === 'requirement').map((obligation) => obligation.obligationId).slice(0, 8);",
      "  const obligationRefs = sourceRefs.length > 0 ? sourceRefs : ['requirement:REQ-T093-002'];",
      "  const testcaseAuthorityRef = 'testcase-authority://t093/TC-T093-001';",
      "  const testCase = { kind: 'sdlc_test_case_row', testCaseRef: 'TC-T093-001', caseKind: 'integration', executionLane: 'integration', sourceDesignObligationRefs: obligationRefs, testcaseAuthorityRefs: [testcaseAuthorityRef], expectedBehavior: 'scheduledValue returns the planned value under the declared fixture' };",
      "  const expectedResultRef = 'expected-result://t093/TC-T093-001/scheduled-value';",
      "  return { kind: 'sdlc_test_design_register', registerVersion: 'ts-test-design-v1', targetAssetType: manifest.targetAssetType, designConsumptionRows: [{ kind: 'sdlc_design_consumption_contract', contractRef: 'design-consumption://t093/test-design', sourceDesignObligationRefs: obligationRefs, authorityBasisRefs: manifest.inputAssetTypes.map((assetType) => `asset-type://${assetType}`), consumerGraphFunctionRefs: ['derive_component_test_surface', 'prepare_test_execution_surface', 'derive_test_execution_result_surface', 'qualify_component_test_execution_surface'] }], uatTestcaseRows: [testCase], testcaseAuthorityRows: [testCase], testStackProfileRows: [{ kind: 'sdlc_test_stack_profile_row', stackRef: 'stack://typescript-npm', frameworkRef: 'framework://node-test', buildTool: 'npm' }], testModuleRows: [{ kind: 'sdlc_test_module_row', moduleName: 'api-tests', moduleRef: 'module://api-tests', testRoot: 'api/test' }], testComponentTopologyRows: [{ kind: 'sdlc_test_component_topology_row', testClassId: 'ScheduledValueSpec', relativePath: testRelative, testcaseIds: [testCase.testCaseRef], componentIds: ['api'], requirementIds: ['REQ-T093-002'], shardId: 'test-shard-01-api' }], testDataBindings: [{ kind: 'sdlc_test_data_binding', testDataRef: 'test-data://t093/default-seed', testCaseRef: testCase.testCaseRef, inputFixtureRefs: ['fixture://t093/default-seed'], generationPolicyRef: 'generation-policy://t093/static-fixture', expectedResultRef, sourceDesignObligationRefs: obligationRefs }], expectedResultBindings: [{ kind: 'sdlc_expected_result_binding', expectedResultRef, testCaseRef: testCase.testCaseRef, assertionRefs: ['assertion://t093/scheduledValue'], expectedResultSummary: 'scheduledValue returns 4 for the test fixture', verificationPolicyRef: 'verification-policy://t093/node-test-assertion' }], uatIntegrationBindings: [{ kind: 'sdlc_uat_integration_binding', uatTestCaseRef: testCase.testCaseRef, integrationTestCaseRef: testCase.testCaseRef, executionLane: 'integration' }], testExecutionScheduleRows: [{ kind: 'sdlc_test_execution_schedule_row', scheduleRef: 'test-schedule://t093/npm-test', testCaseRefs: [testCase.testCaseRef], command: 'npm test', frameworkRef: 'framework://node-test', shardId: 'test-shard-01-api' }] };",
      "}",
      "function testExecutionSurfaceRegister() {",
      "  if (manifest.targetAssetType !== 'test_execution_surface') return null;",
      "  const payload = { kind: 'sdlc_test_execution_surface_register', registerVersion: 'ts-test-execution-v1', targetAssetType: 'test_execution_surface', testExecutionPreparationRows: [{ kind: 'sdlc_test_execution_preparation_row', scheduleRef: 'test-schedule://t093/npm-test', moduleName: 'api-tests', testClassId: 'ScheduledValueSpec', testcaseIds: ['TC-T093-001'], command: 'npm test', workingDirectory: 'build_tenants/typescript', frameworkRef: 'framework://node-test', shardId: 'test-shard-01-api', sourceTestFileRefs: [`workspace://${testRelative}`], requirementIds: ['REQ-T093-002'], status: 'prepared', evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`] }], evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`], summary: 'prepared node test execution surface' };",
      "  const projection = manifest.targetCarrierProjection;",
      "  if (projection === undefined || projection === null) return payload;",
      "  return { kind: projection.outputCarrierKind, targetAssetType: manifest.targetAssetType, edgeRef: manifest.edgeName, contractRef: projection.targetCarrierContractRef, contractDigest: projection.targetCarrierContractDigest, payload, evidenceRefs: payload.evidenceRefs };",
      "}",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'api', moduleName: 'api', relativePath: sourceRelative, publicBoundary: 'scheduledValue', requirementIds: ['REQ-T093-001'], sourceAssetRefs: ['fixture://t093'] };",
      "  const testTopologyRow = { kind: 'sdlc_test_component_topology_row', testClassId: 'ScheduledValueSpec', relativePath: testRelative, testcaseIds: ['TC-T093-001'], componentIds: ['api'], requirementIds: ['REQ-T093-002'], shardId: 'test-shard-01-api' };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'ScheduledValueSpec', relativePath: testRelative, testcaseIds: ['TC-T093-001'], componentIds: ['api'], requirementIds: ['REQ-T093-002'], shardId: 'test-shard-01-api' };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'ScheduledValueSpec', testcaseIds: ['TC-T093-001'], componentIds: ['api'], requirementIds: ['REQ-T093-002'], status: 'passed', evidenceRefs: [manifest.outputFile] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [manifest.outputFile] };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'T-093 fixture parity met', blockingReasons: [], evidenceRefs: [manifest.outputFile] } };",
      "  return null;",
      "}",
      "const scheduleLines = manifest.targetAssetType === 'implementation_design_surface' || manifest.targetAssetType === 'test_design_surface' ? ['## Work Packages', '- status: open | package: synthesize target surface | dependency: admitted composite design rows', '- status: done | package: preserve source authority | checkpoint: obligation assessment', '- status: blocked | package: re-enter same edge | condition: unresolved gap dossier', '## Re-entry Conditions', '- retry_same_edge when postflight or assurance returns open gap'] : [];",
      "const obligationLines = manifest.traversalObligationContext.obligations.flatMap((obligation) => [`- ${obligation.obligationId}: ${obligation.summary}`, ...obligation.payload.sourceSnippets.map((snippet) => `  - ${snippet}`)]);",
      "const designRegister = designDepthRegister();",
      "const testRegister = testDesignRegister();",
      "const testExecutionRegister = testExecutionSurfaceRegister();",
      "const componentRegister = componentDepthRegister();",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'design_depth_register') {",
      "  if (designRegister === null) throw new Error(`design depth register not available for ${manifest.targetAssetType}`);",
      "  writeFileSync(path.join(manifest.archiveRoot, 'design_depth_fp_evaluator_register.json'), `${JSON.stringify(designRegister, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts scheduled graph materialization' }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade assessment passed' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const designRegisterLines = designRegister === null ? [] : ['', '```design_depth_register', JSON.stringify(designRegister, null, 2), '```'];",
      "const testRegisterLines = testRegister === null ? [] : ['', '```test_design_register', JSON.stringify(testRegister, null, 2), '```'];",
      "const testExecutionRegisterLines = testExecutionRegister === null ? [] : ['', '```json test_execution_surface_register', JSON.stringify(testExecutionRegister, null, 2), '```'];",
      "const componentRegisterLines = componentRegister === null ? [] : ['', '```component_depth_register', JSON.stringify(componentRegister, null, 2), '```'];",
      "const registerLines = [...designRegisterLines, ...testRegisterLines, ...testExecutionRegisterLines, ...componentRegisterLines];",
      "const outputContent = [`# ${manifest.targetAssetType}`, '', `graph_function: ${manifest.graphFunctionName}`, `edge: ${manifest.edgeName}`, `target: ${manifest.targetAssetType}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', ...scheduleLines, '', '## Obligations', ...(obligationLines.length > 0 ? obligationLines : ['- none']), '', '## Result', `Generated ${manifest.targetAssetType} under the current graph-owned schedule contract.`, ...registerLines].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${outputContent}\\n`, 'utf8');",
      "function digestText(content) { return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`; }",
      "function materializedFile(role, relativePath, content) { const absolutePath = path.join(manifest.productMaterialization.tenantRoot, relativePath); mkdirSync(dirname(absolutePath), { recursive: true }); writeFileSync(absolutePath, content, 'utf8'); return { kind: 'sdlc_materialized_product_file', role, relativePath, absolutePath, digest: digestText(content), byteCount: Buffer.byteLength(content, 'utf8') }; }",
      "const materializedFiles = [];",
      "if (manifest.targetAssetType === 'component_code_surface') { materializedFiles.push(materializedFile('source', sourceRelative, ['// Implements: REQ-T093-001', 'export function scheduledValue(seed: number): number {', '  const planned = seed + 1;', '  if (planned > 1) {', '    return planned;', '  }', '  return 1;', '}', ''].join('\\n'))); }",
      "if (manifest.targetAssetType === 'component_test_surface') { materializedFiles.push(materializedFile('test', testRelative, ['// Validates: REQ-T093-002', \"import test from 'node:test';\", \"import assert from 'node:assert/strict';\", \"test('scheduled value proof', () => {\", '  const actual = 2 + 2;', '  assert.equal(actual, 4);', '});', ''].join('\\n'))); }",
      "const evidenceRefs = [manifest.outputFile, ...materializedFiles.map((file) => file.absolutePath)];",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [...evidenceRefs, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "const declaredExecutionContract = typeof manifest.productMaterialization.testExecutionContract === 'string' && !['', 'undeclared', 'none', 'n/a', 'not_applicable'].includes(manifest.productMaterialization.testExecutionContract.trim().toLowerCase());",
      "const admitsExecutionEvidence = manifest.targetAssetType === 'test_execution_result_surface' || (manifest.targetAssetType === 'component_code_surface' && manifest.productMaterialization.required && declaredExecutionContract);",
      "const shardEvidence = admitsExecutionEvidence ? manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'succeeded', reportRefs: [manifest.outputFile], testsObserved: 1, passedCount: 1, failedCount: 0 })) : [];",
      "const executionEvidence = shardEvidence.length > 0 ? { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'succeeded', reportRefs: [manifest.outputFile], testsObserved: shardEvidence.length, passedCount: shardEvidence.length, failedCount: 0, shardEvidence } : null;",
      "const report = { kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: digestText(`${outputContent}\\n`), summary: `generated ${manifest.targetAssetType}`, unresolvedReasons: [], materializedFiles, executionEvidence, obligationAssessments };",
      "writeFileSync(manifest.reportFile, `${JSON.stringify(report, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

test("T-093 publishes schedule graph assets before materialization edges", () => {
  const names = BOOTSTRAP_RELEASE_FUNCTION_CATALOG.map((entry) => entry.name);
  assert(
    names.indexOf("derive_implementation_design_surface") <
      names.indexOf("derive_component_code_surface")
  );
  assert(
    names.indexOf("derive_component_code_surface") <
      names.indexOf("derive_code_surface")
  );
  assert(
    names.indexOf("derive_test_design_surface") <
      names.indexOf("prepare_test_execution_surface")
  );
  assert(
    names.indexOf("prepare_test_execution_surface") <
      names.indexOf("derive_test_execution_result_surface")
  );
  assert(
    names.indexOf("derive_test_execution_result_surface") <
      names.indexOf("derive_test_run_archive_surface")
  );

  assert.deepStrictEqual(
    hookContractByEdgeName("derive_code_surface").sourceAssetTypes,
    [
      "implementation_design_surface",
      "component_code_surface",
      "component_realization_qualification_surface"
    ]
  );
  assert.deepStrictEqual(
    hookContractByEdgeName("derive_test_run_archive_surface").sourceAssetTypes,
    [
      "test_design_surface",
      "test_execution_result_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface"
    ]
  );
  assert.deepStrictEqual(
    hookContractByEdgeName("derive_test_execution_result_surface").sourceAssetTypes,
    [
      "test_execution_surface",
      "test_design_surface",
      "component_code_surface",
      "component_test_surface",
      "uat_test_source_surface"
    ]
  );
  assert(
    SDLC_HOOK_TARGET_POLICY.some(
      (entry) => entry.targetAssetType === "test_design_surface"
    )
  );
});

test("B-079 test execution schedule exposes a bounded shard register", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    runId: "b079-shard-register"
  });

  assert.deepStrictEqual(manifest.productMaterialization.declaredModuleNames, [
    "api",
    "worker"
  ]);
  assert.deepStrictEqual(
    manifest.productMaterialization.executionShards.map((shard) => shard.moduleName),
    ["api", "worker"]
  );
  assert.deepStrictEqual(
    manifest.productMaterialization.executionShards.map((shard) => shard.shardId),
    ["test-shard-01-api", "test-shard-02-worker"]
  );
  assert.deepStrictEqual(
    manifest.productMaterialization.executionShards.map((shard) => shard.command),
    ["npm test", "npm test"]
  );
  assert(
    manifest.traversalObligationContext.trancheKeys.includes(
      "execution_shard:test-shard-01-api"
    )
  );
  assert.equal(
    manifest.productMaterialization.executionShards.every(
      (shard) =>
        shard.requiredEvidenceKind === "sdlc_worker_execution_evidence" &&
        shard.retryPolicy === "same_shard_then_triage"
    ),
    true
  );
});
