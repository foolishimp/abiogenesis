// Validates: REQ-F-ODDSDLC-062
// Validates: T-101

import test from "node:test";
import assert from "node:assert/strict";
import {
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
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t101-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nBuild a retry-visible report rejection fixture.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    "# Product\n\nT-101 retry loop fixture.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    "# Goals\n\n- prove retry eligible report rejection continues\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-retry.md"),
    [
      "# Retry Requirements",
      "",
      "REQ-T101-001: Retry a report-admission failure when the operator emits retry repair truth.",
      "REQ-T101-002: Carry the prior gap dossier into the next worker handoff."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t101_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: TypeScript",
      "    build_tool: npm",
      "    test_runner: npm test",
      "    module_structure:",
      "      - retry-core"
    ].join("\n"),
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
          test: "node --test \"retry-core/test/*.test.ts\""
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  return root;
}

function writeRetryWorker(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t101_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const runtimeRoot = path.join(manifest.workspaceRoot, '.ai-workspace', 'runtime', 'odd_sdlc');",
      "mkdirSync(runtimeRoot, { recursive: true });",
      "const countsPath = path.join(runtimeRoot, 't101_attempt_counts.json');",
      "const counts = existsSync(countsPath) ? JSON.parse(readFileSync(countsPath, 'utf8')) : {};",
      "counts[manifest.edgeName] = (counts[manifest.edgeName] ?? 0) + 1;",
      "writeFileSync(countsPath, `${JSON.stringify(counts, null, 2)}\\n`, 'utf8');",
      "const priorGapCount = manifest.traversalObligationContext.deltaSummary.priorGapCount;",
      "const retryDossierCount = manifest.retryContext.priorGapDossiers.length;",
      "const retryReasons = manifest.retryContext.priorGapDossiers.flatMap((dossier) => dossier.reasons.map((reason) => reason.reason));",
      "const requirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const evaluateStage = process.env.ODD_SDLC_EVALUATE_STAGE || null;",
      "appendFileSync(path.join(runtimeRoot, 't101_edge_log.jsonl'), `${JSON.stringify({ edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, attempt: counts[manifest.edgeName], priorGapCount, retryDossierCount, retryReasons, evaluateStage, archiveRoot: manifest.archiveRoot })}\\n`, 'utf8');",
      "function digestText(content) { return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`; }",
      "function materializedFile(role, relativePath, content) { const absolutePath = path.join(manifest.productMaterialization.tenantRoot, relativePath); mkdirSync(dirname(absolutePath), { recursive: true }); writeFileSync(absolutePath, content, 'utf8'); return { kind: 'sdlc_materialized_product_file', role, relativePath, absolutePath, digest: digestText(content), byteCount: Buffer.byteLength(content, 'utf8') }; }",
      "const sourceRelative = 'retry-core/src/index.ts';",
      "const testRelative = 'retry-core/test/index.test.ts';",
      "function designCompletenessVerdict() {",
      "  const axis = (name) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis: name, status: 'satisfied', reasons: [], evidenceRefs: [manifest.outputFile] });",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:RetryCore.state', name: 'state', valueType: 'string', cardinality: 'one', invariantRefs: ['REQ-T101-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:RetryCore', moduleName: 'retry-core', ownership: 'owned', attributes: [attribute], invariants: ['retry state is explicit'], sourceAssetRefs: ['fixture://t101'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:retryCore', moduleName: 'retry-core', inputEntityIds: ['entity:RetryCore'], outputEntityIds: ['entity:RetryCore'], requiredAttributeIds: ['attr:RetryCore.state'] };",
      "  const aggregateEntity = { kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'retry-core', attributes: [attribute], sourceModuleNames: ['retry-core'] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [aggregateEntity], operations: [operation], crossModuleReferences: [], evidenceRefs: [manifest.outputFile] };",
      "  const aggregateSunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:retryCore', moduleName: 'retry-core', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:RetryCore.pending.closed'] }], evidenceRefs: [manifest.outputFile] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  if (manifest.targetAssetType === 'implementation_design_surface') return { ...base, stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://t101/typescript-node', language: 'typescript', buildTool: 'npm' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'retry-core', moduleRef: 'module://t101/retry-core' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://t101/aggregate' }], moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'retry-core', entities: [entity], operations: [operation], requirementIds: ['REQ-T101-001'], sourceAssetRefs: ['fixture://t101'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'retry-core', entityId: entity.entityId, stateless: false, states: ['pending', 'closed'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:RetryCore.pending.closed', fromState: 'pending', toState: 'closed', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-T101-001'], sourceAssetRefs: ['fixture://t101'] }], aggregateDomainModel, sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://t101/retry-core' }], aggregateSunnyDaySequence, componentTopologyRows: [{ kind: 'sdlc_component_topology_row', componentId: 'retry-core', moduleName: 'retry-core', relativePath: sourceRelative, publicBoundary: 'retryCore', concernRole: 'other', requirementIds: ['REQ-T101-001'], sourceAssetRefs: ['fixture://t101'] }], componentRealizationRows: [{ kind: 'sdlc_component_realization_row', componentId: 'retry-core', moduleName: 'retry-core', relativePath: sourceRelative, publicBoundary: 'retryCore', trancheId: 'tranche:retry-core', firstProductFileToChange: sourceRelative, upstreamComponentIds: [], requirementIds: ['REQ-T101-001'], sourceAssetRefs: ['fixture://t101'] }], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: sourceRelative, role: 'source' }], designCompletenessVerdict: designCompletenessVerdict() };",
      "  return null;",
      "}",
      "function testDesignRegister() {",
      "  if (manifest.targetAssetType !== 'test_design_surface') return null;",
      "  const sourceRefs = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const testCase = { kind: 'sdlc_test_case_row', testCaseRef: 'test-case://t101/retry-core', caseKind: 'integration', executionLane: 'integration', sourceDesignObligationRefs: sourceRefs, testcaseAuthorityRefs: ['requirement://REQ-T101-002'], expectedBehavior: 'retryCore returns retry-core after admitted worker repair' };",
      "  const expectedResultRef = 'expected-result://t101/retry-core';",
      "  const testTopologyRow = { kind: 'sdlc_test_component_topology_row', testClassId: 'RetryCoreSpec', relativePath: testRelative, testcaseIds: [testCase.testCaseRef], componentIds: ['retry-core'], requirementIds: ['REQ-T101-002'], shardId: 'test-shard-01-retry-core' };",
      "  return { kind: 'sdlc_test_design_register', registerVersion: 'ts-test-design-v1', targetAssetType: manifest.targetAssetType, designConsumptionRows: [{ kind: 'sdlc_design_consumption_contract', contractRef: 'design-consumption://t101/test-design', sourceDesignObligationRefs: sourceRefs, authorityBasisRefs: manifest.inputAssetTypes.map((assetType) => `asset-type://${assetType}`), consumerGraphFunctionRefs: ['derive_component_test_surface', 'prepare_test_execution_surface', 'derive_test_execution_result_surface', 'qualify_component_test_execution_surface'] }], uatTestcaseRows: [testCase], testcaseAuthorityRows: [testCase], testStackProfileRows: [{ kind: 'sdlc_test_stack_profile_row', stackRef: 'stack://t101/typescript-node-test', frameworkRef: 'framework://node-test', buildTool: 'npm' }], testModuleRows: [{ kind: 'sdlc_test_module_row', moduleName: 'retry-core-tests', moduleRef: 'module://t101/retry-core-tests', testRoot: 'retry-core/test' }], testComponentTopologyRows: [testTopologyRow], testDataBindings: [{ kind: 'sdlc_test_data_binding', testDataRef: 'test-data://t101/retry-core/default', testCaseRef: testCase.testCaseRef, inputFixtureRefs: ['fixture://t101/retry-core/default'], generationPolicyRef: 'generation-policy://t101/static-fixture', expectedResultRef, sourceDesignObligationRefs: sourceRefs }], expectedResultBindings: [{ kind: 'sdlc_expected_result_binding', expectedResultRef, testCaseRef: testCase.testCaseRef, assertionRefs: ['assertion://t101/retry-core'], expectedResultSummary: 'retryCore returns retry-core', verificationPolicyRef: 'verification-policy://t101/node-test-assertion' }], uatIntegrationBindings: [{ kind: 'sdlc_uat_integration_binding', uatTestCaseRef: testCase.testCaseRef, integrationTestCaseRef: testCase.testCaseRef, executionLane: 'integration' }], testExecutionScheduleRows: [{ kind: 'sdlc_test_execution_schedule_row', scheduleRef: 'test-schedule://t101/npm-test', testCaseRefs: [testCase.testCaseRef], command: 'npm test', frameworkRef: 'framework://node-test', shardId: testTopologyRow.shardId }] };",
      "}",
      "function testExecutionSurfaceRegister() {",
      "  if (manifest.targetAssetType !== 'test_execution_surface') return null;",
      "  const payload = { kind: 'sdlc_test_execution_surface_register', registerVersion: 'ts-test-execution-v1', targetAssetType: 'test_execution_surface', testExecutionPreparationRows: [{ kind: 'sdlc_test_execution_preparation_row', scheduleRef: 'test-schedule://t101/npm-test', moduleName: 'retry-core-tests', testClassId: 'RetryCoreSpec', testcaseIds: ['test-case://t101/retry-core'], command: 'npm test', workingDirectory: 'build_tenants/typescript', frameworkRef: 'framework://node-test', shardId: 'test-shard-01-retry-core', sourceTestFileRefs: [`workspace://${testRelative}`], requirementIds: ['REQ-T101-002'], status: 'prepared', evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`] }], evidenceRefs: [`file://${manifest.outputFile}`, `workspace://${testRelative}`], summary: 'prepared retry-core test execution surface' };",
      "  const projection = manifest.targetCarrierProjection;",
      "  if (projection === undefined || projection === null) return payload;",
      "  return { kind: projection.outputCarrierKind, targetAssetType: manifest.targetAssetType, edgeRef: manifest.edgeName, contractRef: projection.targetCarrierContractRef, contractDigest: projection.targetCarrierContractDigest, payload, evidenceRefs: payload.evidenceRefs };",
      "}",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'retry-core', moduleName: 'retry-core', relativePath: sourceRelative, publicBoundary: 'retryCore', requirementIds: ['REQ-T101-001'], sourceAssetRefs: ['fixture://t101'] };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'RetryCoreSpec', relativePath: testRelative, testcaseIds: ['TC-T101-001'], componentIds: ['retry-core'], requirementIds: ['REQ-T101-002'], shardId: 'test-shard-01-retry-core' };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'RetryCoreSpec', testcaseIds: ['TC-T101-001'], componentIds: ['retry-core'], requirementIds: ['REQ-T101-002'], status: 'passed', evidenceRefs: [manifest.outputFile] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [manifest.outputFile] };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'T-101 fixture parity met', blockingReasons: [], evidenceRefs: [manifest.outputFile] } };",
      "  return null;",
      "}",
      "const materializedFiles = [];",
      "const outputLines = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`, `attempt: ${counts[manifest.edgeName]}`, `prior_gap_count: ${priorGapCount}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', '## Requirement Trace', ...(requirementTags.length > 0 ? requirementTags.map((tag) => `// Validates: ${tag}`) : ['// no requirement obligations'])];",
      "if (manifest.targetAssetType === 'implementation_design_surface' && retryDossierCount === 0 && evaluateStage === null) { process.exit(0); }",
      "const designRegister = designDepthRegister();",
      "const testRegister = testDesignRegister();",
      "const testExecutionRegister = testExecutionSurfaceRegister();",
      "const componentRegister = componentDepthRegister();",
      "if (designRegister !== null) { outputLines.push('', '```design_depth_register', JSON.stringify(designRegister, null, 2), '```'); }",
      "if (testRegister !== null) { outputLines.push('', '```test_design_register', JSON.stringify(testRegister, null, 2), '```'); }",
      "if (testExecutionRegister !== null) { outputLines.push('', '```json test_execution_surface_register', JSON.stringify(testExecutionRegister, null, 2), '```'); }",
      "if (componentRegister !== null) { outputLines.push('', '```component_depth_register', JSON.stringify(componentRegister, null, 2), '```'); }",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'design_depth_register') {",
      "  if (designRegister === null) throw new Error(`design depth register not available for ${manifest.targetAssetType}`);",
      "  writeFileSync(path.join(manifest.archiveRoot, 'design_depth_fp_evaluator_register.json'), `${JSON.stringify(designRegister, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts retry graph materialization' }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade assessment passed' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "const outputContent = `${outputLines.join('\\n')}\\n`;",
      "writeFileSync(manifest.outputFile, outputContent, 'utf8');",
      "if (manifest.targetAssetType === 'component_code_surface') { materializedFiles.push(materializedFile('source', sourceRelative, ['// Implements: REQ-T101-001', 'export function retryCore(): string {', \"  return 'retry-core';\", '}', ''].join('\\n'))); }",
      "if (manifest.targetAssetType === 'component_test_surface') { materializedFiles.push(materializedFile('test', testRelative, ['// Validates: REQ-T101-001', '// Validates: REQ-T101-002', \"import test from 'node:test';\", \"import assert from 'node:assert/strict';\", \"test('retry core', () => {\", \"  assert.equal('retry-core', 'retry-core');\", '});', ''].join('\\n'))); }",
      "const evidenceRefs = [manifest.outputFile, ...materializedFiles.map((file) => file.absolutePath)];",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [...evidenceRefs, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "const declaredExecutionContract = typeof manifest.productMaterialization.testExecutionContract === 'string' && !['', 'undeclared', 'none', 'n/a', 'not_applicable'].includes(manifest.productMaterialization.testExecutionContract.trim().toLowerCase());",
      "const admitsExecutionEvidence = manifest.targetAssetType === 'test_execution_result_surface' || (manifest.targetAssetType === 'component_code_surface' && manifest.productMaterialization.required && declaredExecutionContract);",
      "const shardEvidence = admitsExecutionEvidence ? manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'succeeded', reportRefs: [manifest.outputFile], testsObserved: 1, passedCount: 1, failedCount: 0 })) : [];",
      "const executionEvidence = shardEvidence.length > 0 ? { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'succeeded', reportRefs: [manifest.outputFile], testsObserved: shardEvidence.length, passedCount: shardEvidence.length, failedCount: 0, shardEvidence } : null;",
      "const report = { kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: digestText(outputContent), summary: `generated ${manifest.targetAssetType}`, unresolvedReasons: [], materializedFiles, executionEvidence, obligationAssessments };",
      "writeFileSync(manifest.reportFile, `${JSON.stringify(report, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}