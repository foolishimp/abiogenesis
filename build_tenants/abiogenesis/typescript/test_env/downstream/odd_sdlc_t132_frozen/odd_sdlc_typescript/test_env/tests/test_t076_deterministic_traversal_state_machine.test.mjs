// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-014
// Validates: REQ-F-ODDSDLC-015
// Validates: REQ-F-ODDSDLC-039
// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-055
// Validates: T-076

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { emit } from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcSelectedAbgFnCompositionIdentity,
  deriveSdlcInstalledQualificationInitialState,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  executeInstalledOperatorStart,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_CONFORM_PROJECT,
  installOddSdlcTypescript,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  evalSdlcGapFromReplay,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  readOddSdlcRuntimeEvents,
  sha256Text,
  writeHandoffFiles
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
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t076-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-076 Fixture", "", "Build a governed Scala data mapper."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Create a typed data mapping application from source requirements."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-fixture.md"),
    [
      "# Requirements",
      "",
      "REQ-T076-001: Failed code-edge postflight must become retry truth."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t076_fixture",
      "  test_runner: sbt test",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  mkdirSync(path.join(root, "build_tenants/scala_spark/spec"), { recursive: true });
  writeFileSync(
    path.join(root, "build_tenants/scala_spark/spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "Scala",
        buildTool: "sbt",
        runtime: "JVM",
        proofCommands: ["sbt test"]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function writeAdmittedImplementationDesignSurface(workspaceRoot) {
  const sourceRelative = "cdme-core/src/main/scala/cdme/Core.scala";
  const outputFile = path.join(
    workspaceRoot,
    "build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
  );
  const register = {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t076/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-core",
        moduleRef: "module://t076/cdme-core"
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
        componentId: "cdme-core",
        moduleName: "cdme-core",
        relativePath: sourceRelative,
        publicBoundary: "Core.retryClosed",
        concernRole: "mapper",
        requirementIds: ["REQ-T076-001"],
        sourceAssetRefs: ["fixture://t076"]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "cdme-core",
        moduleName: "cdme-core",
        relativePath: sourceRelative,
        publicBoundary: "Core.retryClosed",
        trancheId: null,
        firstProductFileToChange: sourceRelative,
        upstreamComponentIds: [],
        requirementIds: ["REQ-T076-001"],
        sourceAssetRefs: ["fixture://t076"]
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
  const outputContent = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, outputContent, "utf8");

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot);
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const prior = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 9,
    contract,
    projectConstraints: constraints,
    runId: "20260524T000000000Z_pid76"
  });
  writeHandoffFiles(prior);
  mkdirSync(dirname(prior.outputFile), { recursive: true });
  writeFileSync(prior.outputFile, outputContent, "utf8");
  const registerPath = path.join(
    prior.archiveRoot,
    "design_depth_fp_evaluator_register.json"
  );
  const registerRef = pathToFileURL(registerPath).href;
  writeFileSync(registerPath, outputContent, "utf8");
  const selectedComposition = deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: prior.graphFunctionName,
    graphVectorRef: prior.edgeName,
    compositionSelectionScopeRef: `test://${prior.edgeName}`,
    carrierContextRefs: [prior.reportFile],
    assuranceContextRefs: []
  });
  writeFileSync(
    prior.fpEvaluateResultFile,
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
        evaluationRef: "evaluation://t076/design-depth",
        findings: [
          {
            findingRef: "finding://t076/design-depth",
            compositionRef: selectedComposition.compositionRef,
            compositionDigest: selectedComposition.compositionDigest,
            authorityRefs: [registerRef],
            evidenceRefs: [registerRef]
          }
        ],
        evaluation: {
          evaluationRef: "evaluation://t076/design-depth",
          status: "passed",
          findingRefs: ["finding://t076/design-depth"]
        },
        status: "passed",
        postflightStatus: "passed",
        blockingReasons: [],
        evidenceRefs: [registerRef]
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
            evidenceRefs: [registerRef, ...obligation.evidenceRefs],
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

function freshDataMapperWorkspace() {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing data_mapper template: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  const parentRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t076-dm-"));
  const workspaceRoot = path.join(parentRoot, "data_mapper.test76.ts");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspaceRoot, { recursive: true });
  return workspaceRoot;
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
  assert.equal(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.kind, "odd_sdlc_spec_method_result");
  assert.equal(parsed.status, "ok");
  return parsed.payload;
}

function installedOddSdlcCommand(install) {
  const commandPath = install.commandPaths.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  assert(commandPath, "odd-sdlc-ts command path missing");
  return commandPath;
}

function makeStart(workspaceRoot) {
  const module = constructSdlcGtlModule();
  const constraintsText = [
    "project:",
    "  name: t076",
    "  selected_output_root: build_tenants/scala_spark",
    "  ambiguity_risk_appetite: medium",
    "build_tenants:",
    "  scala_spark:",
    "    output_dir: build_tenants/scala_spark",
    "    capability_contracts:",
    "      - transport_contract"
  ].join("\n");
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t076",
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText
  });
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
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
  return start;
}

function assessedEventForVector(basis, vector, index) {
  return {
    kind: "assessed",
    assessmentKind: "fp",
    edge: vector.name,
    obligationId: `preclosed-${index}`,
    publishedLedgerRef: `proof://preclosed/${index}`,
    actor: "test",
    specHash: `sha256:preclosed${index}`,
    manifestId: `manifest:preclosed:${index}`,
    workflowVersion: "t076-preclosed",
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

function writeRetryAwareWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t076_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const hasPriorGap = manifest.retryContext.priorGapDossiers.length > 0;",
      "const sourceRelative = 'cdme-core/src/main/scala/cdme/Core.scala';",
      "function componentDepthRegister() {",
      "  if (manifest.targetAssetType !== 'component_code_surface') return null;",
      "  return { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType, componentRealizationRows: [{ kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-T076-001'], sourceAssetRefs: ['fixture://t076'] }] };",
      "}",
      "const register = componentDepthRegister();",
      "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
      "  const outputRef = pathToFileURL(manifest.outputFile).href;",
      "  const reportRef = pathToFileURL(manifest.reportFile).href;",
      "  const reviewedObligationIds = manifest.traversalObligationContext.obligations.map((obligation) => obligation.obligationId);",
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts retry-aware component materialization' }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade assessment passed' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const outputLines = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`, `retry_context: ${hasPriorGap}`];",
      "if (register !== null) outputLines.push('', '```component_depth_register', JSON.stringify(register, null, 2), '```');",
      "const output = outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const tenantRelative = sourceRelative;",
      "const sourcePath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "mkdirSync(dirname(sourcePath), { recursive: true });",
      "const requirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const traceLines = requirementTags.map((tag) => `// Implements: ${tag}`).join('\\n');",
      "const source = `${traceLines}\\n${hasPriorGap ? 'package cdme\\nobject Core { val retryClosed = true }\\n' : 'package cdme\\nobject Core { val retryClosed = false }\\n'}`;",
      "writeFileSync(sourcePath, source, 'utf8');",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "const relativePath = hasPriorGap ? tenantRelative : path.relative(manifest.workspaceRoot, sourcePath);",
      "const materializedFiles = [{ kind: 'sdlc_materialized_product_file', role: 'source', relativePath, absolutePath: sourcePath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8') }];",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...materializedRefs, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'generated code surface with retry-aware materialization path basis', unresolvedReasons: [], materializedFiles, executionEvidence: null, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function writeInstalledRetryWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t076_installed_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      "const hasPriorGap = manifest.retryContext.priorGapDossiers.length > 0;",
      "const sourceRelative = 'cdme-core/src/main/scala/cdme/Core.scala';",
      "const testRelative = 'cdme-core/src/test/scala/cdme/CoreSpec.scala';",
      "function designCompletenessVerdict() {",
      "  const axis = (name) => ({ kind: 'sdlc_design_completeness_axis_verdict', axis: name, status: 'satisfied', reasons: [], evidenceRefs: [manifest.outputFile] });",
      "  return { kind: 'sdlc_design_completeness_verdict', verdictVersion: 'ts-design-depth-v1', entity: axis('entity'), attribute: axis('attribute'), flow: axis('flow') };",
      "}",
      "function designDepthRegister() {",
      "  const attribute = { kind: 'sdlc_domain_attribute', attributeId: 'attr:Core.retryClosed', name: 'retryClosed', valueType: 'boolean', cardinality: 'one', invariantRefs: ['REQ-ENG-001'] };",
      "  const entity = { kind: 'sdlc_domain_entity', entityId: 'entity:Core', moduleName: 'cdme-compiler', ownership: 'owned', attributes: [attribute], invariants: ['retry closure is explicit'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const operation = { kind: 'sdlc_domain_operation', operationId: 'operation:Core.retryClosed', moduleName: 'cdme-compiler', inputEntityIds: ['entity:Core'], outputEntityIds: ['entity:Core'], requiredAttributeIds: ['attr:Core.retryClosed'] };",
      "  const aggregateEntity = { kind: 'sdlc_aggregate_domain_entity', entityId: entity.entityId, ownerModuleName: 'cdme-compiler', attributes: [attribute], sourceModuleNames: ['cdme-compiler'] };",
      "  const aggregateDomainModel = { kind: 'sdlc_aggregate_domain_model', modelVersion: 'ts-design-depth-v1', entities: [aggregateEntity], operations: [operation], crossModuleReferences: [], evidenceRefs: [manifest.outputFile] };",
      "  const aggregateSunnyDaySequence = { kind: 'sdlc_aggregate_sunny_day_sequence', sequenceVersion: 'ts-design-depth-v1', steps: [{ kind: 'sdlc_sunny_day_sequence_step', stepId: 'step:Core.retryClosed', moduleName: 'cdme-compiler', operationId: operation.operationId, inputEntityIds: [entity.entityId], outputEntityIds: [entity.entityId], stateTransitionIds: ['transition:Core.open.closed'] }], evidenceRefs: [manifest.outputFile] };",
      "  const base = { kind: 'sdlc_design_depth_register', registerVersion: 'ts-design-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  if (manifest.targetAssetType === 'implementation_design_surface') return { ...base, stackProfileRows: [{ kind: 'sdlc_stack_profile_row', stackRef: 'stack://t076/scala-sbt', language: 'scala', buildTool: 'sbt' }], implementationModuleRows: [{ kind: 'sdlc_implementation_module_row', moduleName: 'cdme-compiler', moduleRef: 'module://t076/cdme-compiler' }, { kind: 'sdlc_implementation_module_row', moduleName: 'cdme-core', moduleRef: 'module://t076/cdme-core' }], aggregateDomainModelRows: [{ kind: 'sdlc_aggregate_domain_model_row', modelRef: 'model://t076/aggregate' }], moduleSchemaFragments: [{ kind: 'sdlc_module_schema_fragment', moduleName: 'cdme-compiler', entities: [entity], operations: [operation], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], moduleStateDiagramFragments: [{ kind: 'sdlc_module_state_diagram_fragment', moduleName: 'cdme-compiler', entityId: entity.entityId, stateless: false, states: ['open', 'closed'], transitions: [{ kind: 'sdlc_entity_state_transition', transitionId: 'transition:Core.open.closed', fromState: 'open', toState: 'closed', operationId: operation.operationId, entityId: entity.entityId }], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], aggregateDomainModel, sunnyDaySequenceRows: [{ kind: 'sdlc_sunny_day_sequence_row', sequenceRef: 'sequence://t076/core-retry' }], aggregateSunnyDaySequence, componentTopologyRows: [{ kind: 'sdlc_component_topology_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', concernRole: 'mapper', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], componentRealizationRows: [{ kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', trancheId: 'tranche:core', firstProductFileToChange: sourceRelative, upstreamComponentIds: [], requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] }], fileTargetRows: [{ kind: 'sdlc_file_target_row', relativePath: sourceRelative, role: 'source' }], designCompletenessVerdict: designCompletenessVerdict() };",
      "  return null;",
      "}",
      "function componentDepthRegister() {",
      "  const base = { kind: 'sdlc_component_depth_register', registerVersion: 'ts-component-depth-v1', targetAssetType: manifest.targetAssetType };",
      "  const componentRow = { kind: 'sdlc_component_realization_row', componentId: 'cdme-core', moduleName: 'cdme-core', relativePath: sourceRelative, publicBoundary: 'Core.retryClosed', requirementIds: ['REQ-ENG-001'], sourceAssetRefs: ['template://data_mapper'] };",
      "  const testRow = { kind: 'sdlc_component_test_realization_row', testClassId: 'CoreSpec', relativePath: testRelative, testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], shardId: 'test-shard-01-cdme-core' };",
      "  const qualificationRow = { kind: 'sdlc_component_test_qualification_row', testClassId: 'CoreSpec', testcaseIds: ['TC-DM-001'], componentIds: ['cdme-core'], requirementIds: ['REQ-ENG-001'], status: 'passed', evidenceRefs: [manifest.outputFile] };",
      "  const repairSchedule = { kind: 'sdlc_component_repair_schedule', registerVersion: 'ts-component-depth-v1', scheduleStatus: 'no_repair_required', repairRows: [], evidenceRefs: [manifest.outputFile] };",
      "  if (manifest.targetAssetType === 'component_code_surface' || manifest.targetAssetType === 'component_realization_qualification_surface') return { ...base, componentRealizationRows: [componentRow] };",
      "  if (manifest.targetAssetType === 'component_test_surface') return { ...base, componentTestRows: [testRow] };",
      "  if (manifest.targetAssetType === 'component_test_qualification_surface') return { ...base, componentTestQualificationRows: [qualificationRow] };",
      "  if (manifest.targetAssetType === 'component_repair_schedule_surface') return { ...base, componentRepairSchedule: repairSchedule };",
      "  if (manifest.targetAssetType === 'release_depth_parity_surface') return { ...base, releaseDepthParity: { kind: 'sdlc_release_depth_parity_assessment', status: 'met', summary: 'component depth parity met for data_mapper retry fixture', blockingReasons: [], evidenceRefs: [manifest.outputFile] } };",
      "  return null;",
      "}",
      "const designRegister = designDepthRegister();",
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
      "  const findings = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef, ...obligation.evidenceRefs.slice(0, 2)], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts installed retry-aware materialization' }));",
      "  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: 'synthetic review-grade assessment passed' };",
      "  writeFileSync(path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json'), `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
      "  process.exit(0);",
      "}",
      "const requirementTags = [...new Set(manifest.traversalObligationContext.obligations.flatMap((obligation) => { if (obligation.obligationKind !== 'requirement') return []; const match = /^Fulfill ([^:]+):/u.exec(obligation.summary); return match?.[1] === undefined ? [] : [match[1]]; }))];",
      "const outputLines = [`# ${manifest.targetAssetType}`, '', `edge: ${manifest.edgeName}`, `retry_context: ${hasPriorGap}`, '', '## Requirement Trace', ...(requirementTags.length > 0 ? requirementTags.map((tag) => `// Implements: ${tag}`) : ['// no requirement obligations'])];",
      "if (designRegister !== null) outputLines.push('', '```design_depth_register', JSON.stringify(designRegister, null, 2), '```');",
      "if (componentRegister !== null) outputLines.push('', '```component_depth_register', JSON.stringify(componentRegister, null, 2), '```');",
      "const output = outputLines.join('\\n') + '\\n';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, output, 'utf8');",
      "const materializedFiles = [];",
      "if (manifest.productMaterialization.required) {",
      "  const role = manifest.targetAssetType === 'component_test_surface' ? 'test' : 'source';",
      "  const tenantRelative = role === 'test' ? 'cdme-core/src/test/scala/cdme/CoreSpec.scala' : 'cdme-core/src/main/scala/cdme/Core.scala';",
      "  const productPath = path.join(manifest.productMaterialization.tenantRoot, tenantRelative);",
      "  mkdirSync(dirname(productPath), { recursive: true });",
      "  const capabilityMarkers = manifest.conformedProject.capabilityContracts.map((contract) => `${contract.name} ${contract.value}`).join(' ');",
      "  const traceLines = requirementTags.map((tag) => `// Implements: ${tag}`).join('\\n');",
      "  const productTraceLines = manifest.targetAssetType === 'component_code_surface' && !hasPriorGap ? '' : traceLines;",
      "  const source = `${productTraceLines}\\n${role === 'test' ? 'package cdme\\nclass CoreSpec\\n' : `package cdme\\nobject Core { val retryClosed = ${hasPriorGap}; val capabilityMarkers = \"${capabilityMarkers}\" }\\n`}`;",
      "  writeFileSync(productPath, source, 'utf8');",
      "  const sourceDigest = `sha256:${createHash('sha256').update(source, 'utf8').digest('hex')}`;",
      "  const relativePath = manifest.targetAssetType === 'component_code_surface' && !hasPriorGap ? path.relative(manifest.workspaceRoot, productPath) : tenantRelative;",
      "  materializedFiles.push({ kind: 'sdlc_materialized_product_file', role, relativePath, absolutePath: productPath, digest: sourceDigest, byteCount: Buffer.byteLength(source, 'utf8') });",
      "  const buildPath = path.join(manifest.productMaterialization.tenantRoot, 'build.sbt');",
      "  const buildConfig = 'ThisBuild / scalaVersion := \"2.13.12\"\\n';",
      "  writeFileSync(buildPath, buildConfig, 'utf8');",
      "  const buildDigest = `sha256:${createHash('sha256').update(buildConfig, 'utf8').digest('hex')}`;",
      "  materializedFiles.push({ kind: 'sdlc_materialized_product_file', role: 'build_config', relativePath: 'build.sbt', absolutePath: buildPath, digest: buildDigest, byteCount: Buffer.byteLength(buildConfig, 'utf8') });",
      "}",
      "const outputDigest = `sha256:${createHash('sha256').update(output, 'utf8').digest('hex')}`;",
      "const materializedRefs = materializedFiles.map((file) => `file://${file.absolutePath}`);",
      "const outputRef = `file://${manifest.outputFile}`;",
      "const executionReportPath = path.join(manifest.archiveRoot, 't076_execution_report.txt');",
      "const shardEvidence = manifest.productMaterialization.executionShards.map((shard) => ({ kind: 'sdlc_worker_execution_shard_evidence', shardId: shard.shardId, moduleName: shard.moduleName, lane: 'test', command: shard.command, status: 'succeeded', reportRefs: [`file://${executionReportPath}`], testsObserved: 1, passedCount: 1, failedCount: 0 }));",
      "const executionEvidence = shardEvidence.length > 0 ? { kind: 'sdlc_worker_execution_evidence', lane: 'test', command: manifest.productMaterialization.testExecutionContract, status: 'succeeded', reportRefs: [`file://${executionReportPath}`], testsObserved: shardEvidence.length, passedCount: shardEvidence.length, failedCount: 0, shardEvidence } : null;",
      "if (executionEvidence !== null) writeFileSync(executionReportPath, 't076 execution evidence\\n', 'utf8');",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [outputRef, ...materializedRefs, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest: outputDigest, summary: 'installed data_mapper retry-aware worker output', unresolvedReasons: [], materializedFiles, executionEvidence, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}
