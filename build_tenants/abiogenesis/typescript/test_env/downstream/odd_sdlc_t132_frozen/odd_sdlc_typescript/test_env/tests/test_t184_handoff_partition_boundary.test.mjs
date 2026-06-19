// Validates: T-184

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorClosedEvent,
  constructVectorTraversalPlannedEvent
} from "@abiogenesis/typescript-tenant";

import {
  appendOddSdlcRuntimeEvents,
  constructPostflightGapDossier,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRegistry,
  constructWorkerProcessFailurePostflight,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  readOddSdlcRuntimeEventsSync,
  SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE,
  SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING,
  sdlcEdgeOutputPolicyForTargetAssetType
} from "../../build/semantic/code/src/index.js";
import {
  consequenceProjectionPluginContract,
  designDepthFpEvaluatorRuleContract,
  fpDispatchPluginContract,
  fpEvaluatorPluginContract,
  reviewGradeEdgeFulfillmentRuleContract
} from "../../build/semantic/code/src/operator/plugins/plugin_contracts.js";

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t184-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-184 fixture\n", "utf8");
  return root;
}

function moduleBasis(handle = "derive_intent_surface") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t184",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t184/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t184",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t184",
    workKey: "wk://odd-sdlc/t184",
    frameId: null,
    frameLineageId: null
  });
}

function walkTsFiles(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const absolutePath = path.join(root, entry);
    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      files.push(...walkTsFiles(absolutePath));
      continue;
    }
    if (absolutePath.endsWith(".ts")) {
      files.push(absolutePath);
    }
  }
  return files;
}

test("T-184 removes handoff.ts as a public operator surface", () => {
  assert.equal(
    existsSync(path.join(REPO_ROOT, "build_tenants/typescript/code/src/operator/handoff.ts")),
    false,
    "handoff.ts must not remain as an owning module"
  );

  const operatorSourceRoot = path.join(
    REPO_ROOT,
    "build_tenants/typescript/code/src/operator"
  );
  for (const filePath of walkTsFiles(operatorSourceRoot)) {
    const source = readFileSync(filePath, "utf8");
    assert.doesNotMatch(source, /from "\.\/handoff\.js"/u, filePath);
    assert.doesNotMatch(source, /from "\.\.\/handoff\.js"/u, filePath);
    assert.doesNotMatch(source, /writeOperatorArchiveFile/u, filePath);
    assert.doesNotMatch(source, /writeInstalledOperatorNoDispatchArtifact/u, filePath);
    assert.doesNotMatch(source, /ensureObservedTransformOutput/u, filePath);
    assert.doesNotMatch(source, /__handoff/u, filePath);
    assert.doesNotMatch(source, /target_asset_catalog_fallback/u, filePath);
    assert.doesNotMatch(source, /legacyReplayOnlyCompositionIdentityForInput/u, filePath);
    assert.doesNotMatch(source, /installedOperatorOwnsEvaluationOutput/u, filePath);
    assert.doesNotMatch(source, /\bwriteFileSync\b/u, filePath);
    assert.doesNotMatch(source, /\bappendFileSync\b/u, filePath);
    assert.doesNotMatch(source, /\bcreateWriteStream\b/u, filePath);
  }

  const operatorIndex = readRepoFile(
    "build_tenants/typescript/code/src/operator/index.ts"
  );
  assert.match(operatorIndex, /from "\.\/plugins\/transform\/launch_contract\.js"/u);
  assert.match(operatorIndex, /stableSdlcSystemArtifactJson/u);
  assert.match(operatorIndex, /writeSdlcSystemArtifact/u);
  assert.doesNotMatch(operatorIndex, /export \* from "\.\/system_artifacts\.js"/u);
  assert.doesNotMatch(operatorIndex, /handoff\.js/u);
});

test("T-184 runtime event persistence is an ABG append sink", () => {
  const eventStoreSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/event_store.ts"
  );

  assert.match(eventStoreSource, /\bemit\b/u);
  assert.match(eventStoreSource, /emit\(input\.events/u);
  assert.match(eventStoreSource, /\bappendFile\b/u);
  assert.doesNotMatch(eventStoreSource, /\bwriteFile\b/u);
  assert.doesNotMatch(eventStoreSource, /uniqueRuntimeEventsInReplayOrder/u);
  assert.doesNotMatch(eventStoreSource, /eventAdmissionOrdinal/u);
  assert.doesNotMatch(eventStoreSource, /replayOrderedEvents/u);
  assert.doesNotMatch(eventStoreSource, /readOddSdlcRuntimeEvents\(input\.workspaceRoot\)/u);
});

test("T-184 runtime event persistence appends and reads archive order", async () => {
  const workspaceRoot = makeWorkspace();
  const basis = moduleBasis();
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "advanced" })
  ].map((event, index) => {
    const eventTime = new Date(Date.UTC(2026, 4, 28, 0, 0, 0, index)).toISOString();
    return {
      ...event,
      eventId: `runtime-event:t184:${index}`,
      eventTime,
      eventTimeUnixMs: Date.parse(eventTime),
      eventAdmissionOrdinal: index
    };
  });
  await appendOddSdlcRuntimeEvents({
    workspaceRoot,
    events: [events[2], events[0]]
  });
  const eventLogPath = path.join(
    workspaceRoot,
    ".ai-workspace",
    "events",
    "events.jsonl"
  );
  const firstRawEventLog = readFileSync(eventLogPath, "utf8");
  assert.deepEqual(
    firstRawEventLog
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line).eventAdmissionOrdinal),
    [2, 0]
  );

  await appendOddSdlcRuntimeEvents({
    workspaceRoot,
    events: [events[3], events[1]]
  });
  const secondRawEventLog = readFileSync(eventLogPath, "utf8");
  assert.equal(
    secondRawEventLog.startsWith(firstRawEventLog),
    true,
    "runtime event persistence must append to the existing stream"
  );
  assert.deepEqual(
    secondRawEventLog
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line).eventAdmissionOrdinal),
    [2, 0, 3, 1]
  );

  const stored = readOddSdlcRuntimeEventsSync(workspaceRoot);
  assert.deepEqual(
    stored.map((event) => event.eventAdmissionOrdinal),
    [2, 0, 3, 1]
  );
  assert.deepEqual(
    stored.map((event) => event.eventId),
    [events[2], events[0], events[3], events[1]].map((event) => event.eventId)
  );
});

test("T-184 runtime event persistence never rewrites or de-dupes existing archive truth", async () => {
  const workspaceRoot = makeWorkspace();
  const basis = moduleBasis();
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 })
  ].map((event, index) => {
    const eventTime = new Date(Date.UTC(2026, 4, 28, 0, 0, 1, index)).toISOString();
    return {
      ...event,
      eventId: `runtime-event:t184-append-only:${index}`,
      eventTime,
      eventTimeUnixMs: Date.parse(eventTime),
      eventAdmissionOrdinal: 30 - index
    };
  });
  const eventLogPath = path.join(
    workspaceRoot,
    ".ai-workspace",
    "events",
    "events.jsonl"
  );
  mkdirSync(path.dirname(eventLogPath), { recursive: true });
  const existingArchiveTruth = `${JSON.stringify(events[0])}\n`;
  writeFileSync(eventLogPath, existingArchiveTruth, "utf8");

  await appendOddSdlcRuntimeEvents({
    workspaceRoot,
    events: [events[0], events[2], events[1]]
  });

  const rawEventLog = readFileSync(eventLogPath, "utf8");
  assert.equal(
    rawEventLog.startsWith(existingArchiveTruth),
    true,
    "event sink must preserve prior archive bytes exactly"
  );
  const rawEvents = rawEventLog
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    rawEvents.map((event) => event.eventId),
    [events[0], events[0], events[2], events[1]].map((event) => event.eventId)
  );
  assert.deepEqual(
    rawEvents.map((event) => event.eventAdmissionOrdinal),
    [30, 30, 28, 29]
  );
  assert.equal(
    rawEvents.filter((event) => event.eventId === events[0].eventId).length,
    2,
    "event sink must not perform cross-archive duplicate suppression"
  );
});

test("T-184 product materialization observation and replay live under product modules", () => {
  const launchContractSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts"
  );
  const operatorIndexSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/index.ts"
  );
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const resultProjectionSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/result_projection.ts"
  );
  const observationSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/product_materialization/observation.ts"
  );
  const replaySource = readRepoFile(
    "build_tenants/typescript/code/src/operator/product_materialization/replay.ts"
  );
  const manifestSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/product_materialization/manifest.ts"
  );

  assert.doesNotMatch(launchContractSource, /product_materialization\/observation\.js/u);
  assert.doesNotMatch(launchContractSource, /product_materialization\/replay\.js/u);
  assert.doesNotMatch(launchContractSource, /product_materialization\/manifest\.js/u);
  assert.match(operatorIndexSource, /product_materialization\/observation\.js/u);
  assert.match(operatorIndexSource, /product_materialization\/manifest\.js/u);
  assert.match(installedOperatorSource, /product_materialization\/observation\.js/u);
  assert.match(installedOperatorSource, /product_materialization\/manifest\.js/u);
  assert.match(resultProjectionSource, /product_materialization\/replay\.js/u);
  assert.match(observationSource, /function walkFiles/u);
  assert.match(observationSource, /observeProductMaterializationDeltaWithDiagnostics/u);
  assert.match(replaySource, /readProductMaterializationReplayManifest/u);
  assert.match(replaySource, /resolveProductMaterializationReplay/u);
  assert.match(manifestSource, /writeProductMaterializationManifest/u);

  assert.doesNotMatch(launchContractSource, /function walkFiles/u);
  assert.doesNotMatch(
    launchContractSource,
    /function readProductMaterializationReplayManifest/u
  );
  assert.doesNotMatch(launchContractSource, /function productMaterializationReplayArchives/u);
  assert.doesNotMatch(launchContractSource, /function replayArchivePostflightStatus/u);
  assert.doesNotMatch(launchContractSource, /function mergeMaterializedProductFiles/u);
});

test("T-184 ABG terminal truth controls non-close traversal", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const closureStateMachineSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/closure_state_machine.ts"
  );

  assert.match(installedOperatorSource, /function abgTerminalRetryReasonRefs/u);
  assert.match(installedOperatorSource, /terminalKind === "yielded"/u);
  assert.match(installedOperatorSource, /abg-terminal/u);
  assert.match(
    installedOperatorSource,
    /deriveSdlcClosureStateTransition\(\{\s*abgRuntimeTransitionContext:/u
  );
  assert.match(
    installedOperatorSource,
    /abgTerminalRetryRefs:\s*ledger\.edgeConverged && edgeAssuranceCloseDecision\.disposition === "close"\s*\?\s*Object\.freeze\(\[\]\)\s*:\s*abgTerminalRetryReasonRefs/u
  );
  assert.match(
    closureStateMachineSource,
    /deriveIterationOutcomeProjection\(\{/u
  );
  assert.match(
    closureStateMachineSource,
    /terminalFallbackRefs: input\.abgTerminalRetryRefs/u
  );
  assert.ok(
    closureStateMachineSource.indexOf("runtimeRows: Object.freeze") <
      closureStateMachineSource.indexOf(
        "terminalFallbackRefs: input.abgTerminalRetryRefs"
      ),
    "typed runtime rows must feed ABG before terminal retry fallback refs"
  );
  assert.match(
    installedOperatorSource,
    /function abgTerminalAllowsInstalledConvergence/u
  );
  assert.match(
    installedOperatorSource,
    /input\.terminalKind === "converged"/u
  );
  assert.match(
    installedOperatorSource,
    /if \(input\.terminalKind === "gap_stop"\) \{\s*return "blocked";\s*\}/u
  );
  assert.doesNotMatch(
    installedOperatorSource,
    /closureDisposition === "close"\s*\?\s*currentEdgeFromAcceptedClose\s*:\s*currentEdgeFromConsequence/u
  );
  assert.doesNotMatch(
    installedOperatorSource,
    /nextVector \?\? traversalConsequence\.nextActionProjection\.nextGraphVectorRef\s*:\s*completedDispatchState\.currentEdge/u
  );
});

test("T-184 selected evaluate.C residual pressure enters consequence closure", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const edgeGainClosureSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/edge_gain_closure.ts"
  );

  assert.match(
    edgeGainClosureSource,
    /function withAdditionalSdlcEdgeResidualPressureRefs/u
  );
  assert.match(
    installedOperatorSource,
    /const selectedEvaluationResidualPressureRefs =\s*fpEvaluationResidualPressureRefsForState\(input\.state\)/u
  );
  assert.match(
    installedOperatorSource,
    /withAdditionalSdlcEdgeResidualPressureRefs\(\{\s*residualPressure: measuredEdgeResidualPressure,\s*requiredPressureRefs: uniqueSorted\(\[\s*\.\.\.selectedEvaluationResidualPressureRefs,\s*\.\.\.testExecutionFailureResidualPressureRefs\s*\]\)\s*\}\)/u
  );
  assert.match(
    installedOperatorSource,
    /deriveSdlcEdgeAssuranceCloseDecision\(\{\s*gain: edgeGain,\s*residualPressure: edgeResidualPressure\s*\}\)/u
  );
  assert.match(
    installedOperatorSource,
    /edgeResidualPressureRefs: edgeResidualPressure\.requiredPressureRefs/u
  );
});

test("T-184 ticket carries the partition inventory and deletion gates", () => {
  const ticket = readRepoFile(
    ".ai-workspace/tickets/completed/T-184-partition-handoff-into-compute-stage-boundary-modules.md"
  );
  const successorTicket = readRepoFile(
    ".ai-workspace/tickets/completed/T-197-reconcile-product-boundary-and-remove-authority-leakage.md"
  );
  for (const row of ["H-001", "H-030", "H-060", "H-090", "H-100", "H-120", "H-130"]) {
    assert.match(ticket, new RegExp(`\\| ${row} \\|`, "u"), `${row} is tracked`);
  }
  assert.match(ticket, /operator\/plugins\/transform\/launch_contract\.ts/u);
  assert.match(ticket, /operator\/system_artifacts\.ts/u);
  assert.match(ticket, /No framework helper writes a transform output/u);
  assert.match(successorTicket, /T-197 became the sole cleanup authority/u);
  assert.match(successorTicket, /Proof Residuals Transferred From T-184/u);
});

test("T-153 outward contract-law audit is backed by GTL and ABG surfaces", () => {
  const module = constructSdlcGtlModule();
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({ module });
  assert.deepEqual(targetCarrierRegistry.diagnostics, []);

  const componentDepthTargetSet = new Set(
    SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE.targetAssetTypes
  );
  const componentDepthRows = targetCarrierRegistry.rows.filter((row) =>
    componentDepthTargetSet.has(row.targetAssetType)
  );
  assert.ok(
    componentDepthRows.length >=
      SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE.targetAssetTypes.length
  );
  for (const targetAssetType of SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE.targetAssetTypes) {
    assert(
      componentDepthRows.some((row) => row.targetAssetType === targetAssetType),
      `${targetAssetType} must have a GTL target-carrier row`
    );
  }
  for (const row of componentDepthRows) {
    assert.equal(
      row.outputCarrierFamilyRef,
      SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE.gtlTargetCarrierFamilyRef
    );
    assert.equal(
      row.binding.envelopeContractRef,
      SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE.gtlTargetCarrierEnvelopeRef
    );
    assert.match(row.targetCarrierContractRef, /^gtl:\/\/target-carrier-contract\/odd-sdlc\//u);
    assert.match(row.targetCarrierContractDigest, /^sha256:/u);
    assert.equal(row.binding.source, "graph_vector_declarations");
  }

  const promptAssetsSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/prompt_assets.ts"
  );
  assert.match(promptAssetsSource, /constructAssetSurface/u);
  assert.match(promptAssetsSource, /admitAssetSurface/u);
  assert.match(promptAssetsSource, /assetSurface: input\.assetSurface/u);
  assert.doesNotMatch(promptAssetsSource, /localPromptSchema|prompt_schema_clone/u);

  const pluginContracts = [
    fpDispatchPluginContract(),
    fpEvaluatorPluginContract(),
    designDepthFpEvaluatorRuleContract(),
    reviewGradeEdgeFulfillmentRuleContract(),
    consequenceProjectionPluginContract()
  ];
  assert.deepEqual(
    pluginContracts.map((contract) => contract.authority),
    ["effect_plugin", "effect_plugin", "effect_plugin", "effect_plugin", "effect_plugin"]
  );
  assert.deepEqual(
    pluginContracts.map((contract) => contract.computeStageRole),
    ["transform", "evaluate", "evaluate", "evaluate", "consequence"]
  );
});

test("T-184 legacy managed traversal ledger is deleted", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const projectProfileSource = readRepoFile(
    "build_tenants/typescript/code/src/workspace/project_profile.ts"
  );
  const workspaceCarriersSource = readRepoFile(
    "build_tenants/typescript/code/src/workspace/carriers.ts"
  );
  const artifactCatalogSource = readRepoFile(
    "build_tenants/typescript/code/src/contracts/operator_run_artifact_catalog.ts"
  );

  for (const source of [
    installedOperatorSource,
    projectProfileSource,
    workspaceCarriersSource,
    artifactCatalogSource
  ]) {
    assert.doesNotMatch(source, /SdlcManagedTraversalLedger/u);
    assert.doesNotMatch(source, /deriveConformProjectManagedTraversalLedger/u);
    assert.doesNotMatch(source, /sdlc_managed_traversal_ledger/u);
    assert.doesNotMatch(source, /managed_traversal_ledger\.json/u);
  }
});

test("T-184 operator timeout policy is tenant configuration, not handoff glue", () => {
  const runtimePolicy = JSON.parse(
    readRepoFile("build_tenants/typescript/config/operator-runtime-policy.json")
  );
  assert.equal(runtimePolicy.kind, "odd_sdlc_operator_runtime_policy");
  assert.equal(
    runtimePolicy.policyRef,
    "config://odd-sdlc/operator-runtime-policy/v1"
  );
  assert.equal(
    runtimePolicy.worker.inactivityTimeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.designDepthFpEvaluator.timeoutMs,
    600000
  );
  assert.ok(
    runtimePolicy.designDepthFpEvaluator.timeoutMs <
      runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.reviewGradeEdgeFulfillmentEvaluator.timeoutMs,
    runtimePolicy.worker.timeoutMs
  );
  assert.equal(
    typeof runtimePolicy.reviewGradeEdgeFulfillmentEvaluator.inactivityTimeoutMs,
    "number"
  );
  assert.ok(
    runtimePolicy.reviewGradeEdgeFulfillmentEvaluator.inactivityTimeoutMs <
      runtimePolicy.worker.inactivityTimeoutMs
  );
  assert.equal(
    runtimePolicy.executionShard.timeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );

  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const launchContractSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts"
  );
  const runtimePolicySource = readRepoFile(
    "build_tenants/typescript/code/src/operator/runtime_policy.ts"
  );
  assert.match(installedOperatorSource, /sdlcOperatorRuntimePolicy/u);
  assert.match(
    installedOperatorSource,
    /reviewGradeEdgeFulfillmentEvaluatorTimeoutMs/u
  );
  assert.match(
    installedOperatorSource,
    /reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs/u
  );
  assert.match(launchContractSource, /sdlcOperatorRuntimePolicy/u);
  assert.match(runtimePolicySource, /operator-runtime-policy\.json/u);
  assert.doesNotMatch(installedOperatorSource, /1000 \* 60 \* (15|30|60)/u);
  assert.doesNotMatch(launchContractSource, /1000 \* 60 \* (10|30|60)/u);
});

test("T-184 long process archives have durable started/interrupted lifecycle facts", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const t164LiveSource = readRepoFile(
    "build_tenants/typescript/test_env/live/test_t164_data_mapper_full_capability_live.test.mjs"
  );
  const resumeSource = readRepoFile(
    "build_tenants/typescript/test_env/live/resume_t164_data_mapper_full_capability_live.mjs"
  );
  const externalRunnerSource = readRepoFile(
    "build_tenants/typescript/test_env/live/run_full_external_data_mapper_sandbox.mjs"
  );

  assert.match(installedOperatorSource, /registerProcessInterruptionArtifact/u);
  assert.match(installedOperatorSource, /lifecycleStatus: "started"/u);
  assert.match(installedOperatorSource, /lifecycleStatus: "completed"/u);
  assert.match(installedOperatorSource, /lifecycleStatus: "interrupted"/u);
  assert.match(installedOperatorSource, /host_signal_before_process_result/u);
  for (const artifactPath of [
    "worker_run.json",
    "design_depth_fp_evaluator_run.json",
    "review_grade_edge_fulfillment_run.json"
  ]) {
    assert.match(installedOperatorSource, new RegExp(artifactPath, "u"));
  }

  assert.match(
    t164LiveSource,
    /ABG-owned layered command\/control lane, not an odd_sdlc local start loop/u
  );
  for (const source of [externalRunnerSource]) {
    assert.match(source, /lifecycleStatus: "started"/u);
    assert.match(source, /lifecycleStatus: "completed"/u);
    assert.match(source, /status: null/u);
    assert.match(source, /endedAt: null/u);
    assert.match(source, /hostPid: process\.pid/u);
  }
  assert.match(resumeSource, /Resume helper retired by T-197 A2/u);
  assert.match(
    resumeSource,
    /Use or implement the ABG-owned layered command\/control lane instead/u
  );
});

test("T-184 operator summary separates obligation review from semantic admission", () => {
  const carriersSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/carriers.ts"
  );
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );

  assert.match(carriersSource, /readonly obligationReview/u);
  assert.match(carriersSource, /readonly admittedSemantic/u);
  assert.match(installedOperatorSource, /targetCarrierAdmissionStatus/u);
  assert.match(installedOperatorSource, /ledger\.edgeConverged/u);
  assert.match(installedOperatorSource, /closureDecision\.disposition/u);
  assert.match(
    installedOperatorSource,
    /ledger\.targetCarrierAdmissionStatus === "admitted"[\s\S]*ledger\.targetCarrierAdmissionStatus === "not_required"/u
  );
});

test("T-184 F_P evaluator prompt uses incremental content register writes", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const evaluatorPromptSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );
  const contentRegisterSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/content_register.ts"
  );
  const blockingReasonSource = readRepoFile(
    "build_tenants/typescript/code/src/shared/blocking_reason.ts"
  );

  assert.match(
    evaluatorPromptSource,
    /After the first evaluator update exists, write a short plan/u
  );
  assert.match(evaluatorPromptSource, /Execute the plan incrementally/u);
  assert.match(evaluatorPromptSource, /First-update carrier helper contract/u);
  assert.match(evaluatorPromptSource, /same-path temp-then-rename publication/u);
  assert.match(evaluatorPromptSource, /named carrier-helper contract only/u);
  assert.match(contentRegisterSource, /writeDesignDepthDraftFragmentContentRegisterUpdate/u);
  assert.match(contentRegisterSource, /writeUtf8FileAtomically/u);
  assert.doesNotMatch(evaluatorPromptSource, /Exact first update command pattern/u);
  assert.doesNotMatch(evaluatorPromptSource, /Exact second update command pattern/u);
  assert.doesNotMatch(evaluatorPromptSource, /node --input-type=module/u);
  assert.match(evaluatorPromptSource, /There is no framework-authored recipe/u);
  assert.match(evaluatorPromptSource, /F_D does not construct semantic register rows/u);
  assert.match(installedOperatorSource, /writeDesignDepthFpEvaluatorDraftContentRegister/u);
  assert.match(installedOperatorSource, /writeDesignDepthFirstUpdateObservation/u);
  assert.match(installedOperatorSource, /design_depth_fp_evaluator_first_update\.json/u);
  assert.match(contentRegisterSource, /observeDesignDepthContentRegisterFirstUpdate/u);
  assert.match(
    installedOperatorSource,
    /function workerProcessTextLooksRetryableProviderFailure/u
  );
  assert.match(
    installedOperatorSource,
    /reason:\s*workerProcessTextLooksRetryableProviderFailure\(evaluatorProcessText\)[\s\S]*\?\s*"worker_connection_failed"[\s\S]*:\s*processResult\.timedOut[\s\S]*\?\s*"design_depth_fp_evaluator_progress_timeout"[\s\S]*:\s*"design_depth_fp_evaluator_process_failed"/u
  );
  assert.match(
    installedOperatorSource,
    /processResult\.timedOut && firstUpdateObservation\.status === "pending"[\s\S]*\?\s*"design_depth_fp_evaluator_first_update_timeout"/u
  );
  assert.match(
    installedOperatorSource,
    /outcome\.reason === "worker_connection_failed"[\s\S]*return "worker_connection_failed"/u
  );
  assert.match(
    installedOperatorSource,
    /outcome\.reason === "design_depth_fp_evaluator_first_update_timeout"[\s\S]*return "design_depth_fp_evaluator_first_update_timeout"/u
  );
  assert.match(
    installedOperatorSource,
    /outcome\.reason === "design_depth_fp_evaluator_progress_timeout"[\s\S]*return "design_depth_fp_evaluator_progress_timeout"/u
  );
  assert.match(
    blockingReasonSource,
    /code === "design_depth_fp_evaluator_first_update_timeout"[\s\S]*lawfulReentryPoint: "same_edge_retry"/u
  );
  assert.match(
    blockingReasonSource,
    /code === "design_depth_fp_evaluator_progress_timeout"[\s\S]*lawfulReentryPoint: "same_edge_retry"/u
  );
  assert.match(
    evaluatorPromptSource,
    /SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND/u
  );
  assert.match(contentRegisterSource, /sdlc_design_depth_register_fragment_draft/u);
  assert.match(evaluatorPromptSource, /content-register-row-draft:\/\//u);
  assert.match(evaluatorPromptSource, /sdlc_design_depth_register_fragment/u);
  assert.match(installedOperatorSource, /ODD_SDLC_EVALUATOR_INCREMENTAL_REGISTER/u);
  assert.doesNotMatch(installedOperatorSource, /ODD_SDLC_EVALUATOR_INCREMENTAL_LEDGER/u);
  assert.doesNotMatch(installedOperatorSource, /ODD_SDLC_EVALUATOR_CONTENT_LEDGER/u);
  assert.doesNotMatch(evaluatorPromptSource, /content-ledger/u);
  assert.doesNotMatch(contentRegisterSource, /sdlc_evaluate_content_ledger/u);
  assert.doesNotMatch(
    evaluatorPromptSource,
    /contentRows\[0\]\.payload must be the full design-depth register object/u
  );
  assert.match(contentRegisterSource, /designDepthRegisterPayloadFromFragments/u);
  assert.match(contentRegisterSource, /SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS/u);
});

test("T-184 installed operator consumes plugin-owned contracts and plugin set", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const pluginContractsSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_contracts.ts"
  );
  const pluginSetSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
  );
  const evaluatorPromptSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );

  assert.match(installedOperatorSource, /createSdlcAbgPluginSet/u);
  assert.match(pluginSetSource, /createSdlcAbgPluginSet/u);
  for (const ownedName of [
    "fpDispatchPluginContract",
    "fpEvaluatorPluginContract",
    "designDepthFpEvaluatorRuleContract",
    "reviewGradeEdgeFulfillmentRuleContract",
    "consequenceProjectionPluginContract"
  ]) {
    assert.doesNotMatch(
      installedOperatorSource,
      new RegExp(`function ${ownedName}`, "u"),
      `${ownedName} must be plugin-owned`
    );
    assert.match(pluginContractsSource, new RegExp(`function ${ownedName}`, "u"));
  }

  assert.doesNotMatch(
    installedOperatorSource,
    /function designDepthFpEvaluatorPrompt/u
  );
  assert.doesNotMatch(
    installedOperatorSource,
    /function reviewGradeEdgeFulfillmentPrompt/u
  );
  assert.match(evaluatorPromptSource, /function designDepthFpEvaluatorPrompt/u);
  assert.match(evaluatorPromptSource, /function reviewGradeEdgeFulfillmentPrompt/u);
  assert.doesNotMatch(installedOperatorSource, /evaluationRules: Object\.freeze/u);
  assert.doesNotMatch(installedOperatorSource, /requiredEvaluationRuleRefs/u);
  assert.match(pluginSetSource, /evaluationRules: Object\.freeze/u);
  assert.match(pluginSetSource, /requiredEvaluationRuleRefs/u);
});

test("T-184 declared edge-output projection is consequence-owned", () => {
  const launchContractSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts"
  );
  const edgeProjectionSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/consequence/edge_projection.ts"
  );
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const operatorIndexSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/index.ts"
  );
  const artifactCatalogSource = readRepoFile(
    "build_tenants/typescript/code/src/contracts/operator_run_artifact_catalog.ts"
  );

  assert.doesNotMatch(launchContractSource, /writeDeclaredEdgeProjectionOutput/u);
  for (const movedProjectionName of [
    "writeTestExecutionSurfaceProjection",
    "writeTestRunArchiveProjection",
    "writeTestExecutionResultProjection",
    "writeComponentDepthProjection"
  ]) {
    assert.match(
      edgeProjectionSource,
      new RegExp(`function ${movedProjectionName}`, "u")
    );
    assert.doesNotMatch(
      launchContractSource,
      new RegExp(`function ${movedProjectionName}`, "u")
    );
  }
  assert.match(
    edgeProjectionSource,
    /export function writeDeclaredEdgeProjectionOutput/u
  );
  assert.match(edgeProjectionSource, /sdlcInstalledOperatorProjectsOutput/u);
  assert.doesNotMatch(edgeProjectionSource, /launch_contract\.js/u);
  assert.match(
    installedOperatorSource,
    /from "\.\/plugins\/consequence\/edge_projection\.js"/u
  );
  assert.match(
    operatorIndexSource,
    /from "\.\/plugins\/consequence\/edge_projection\.js"/u
  );

  const dispatchSource = installedOperatorSource.slice(
    installedOperatorSource.indexOf("const dispatchThroughInstalledOperator"),
    installedOperatorSource.indexOf("const evaluateFpForInstalledOperatorState")
  );
  const consequenceSource = installedOperatorSource.slice(
    installedOperatorSource.indexOf("const projectConsequenceForInstalledOperatorState"),
    installedOperatorSource.indexOf("const evaluateDesignDepthForInstalledOperatorState")
  );
  const deferSource = installedOperatorSource.slice(
    installedOperatorSource.indexOf("function shouldDeferDispatchConsequenceToFpEvaluator"),
    installedOperatorSource.indexOf("function manifestRefSegment")
  );
  assert.doesNotMatch(dispatchSource, /writeDeclaredEdgeProjectionOutput\(/u);
  assert.doesNotMatch(dispatchSource, /declared_edge_projection_artifact/u);
  assert.match(consequenceSource, /writeDeclaredEdgeProjectionFromConsequence/u);
  assert.match(deferSource, /sdlcInstalledOperatorProjectsOutput/u);
  assert.doesNotMatch(installedOperatorSource, /installed_operator_evaluation_artifact/u);
  assert.doesNotMatch(
    installedOperatorSource,
    /sdlc_installed_operator_evaluation_artifact/u
  );
  assert.match(
    artifactCatalogSource,
    /artifactRef:\s*"operator-run-artifact:\/\/declared-edge-projection-artifact"/u
  );
  assert.match(artifactCatalogSource, /role:\s*"read_model"/u);
  assert.match(artifactCatalogSource, /sourceOwner:\s*"consequence_projection"/u);
  assert.doesNotMatch(
    artifactCatalogSource,
    /installed-operator-evaluation-artifact|installed_operator_evaluation_artifact|sdlc_installed_operator_evaluation_artifact/u
  );
});

test("T-184 no-dispatch projection defers output reads until consequence", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );

  const completionStart = installedOperatorSource.indexOf(
    "const completeReportDispatch = async"
  );
  const completionEnd = installedOperatorSource.indexOf(
    "const reportAdmissionDiagnosticReason",
    completionStart
  );
  const completionSource = installedOperatorSource.slice(
    completionStart,
    completionEnd
  );
  const noDispatchStart = installedOperatorSource.indexOf(
    "if (!workerDispatchAllowed)"
  );
  const noDispatchEnd = installedOperatorSource.indexOf(
    "if (transport === null)",
    noDispatchStart
  );
  const noDispatchSource = installedOperatorSource.slice(
    noDispatchStart,
    noDispatchEnd
  );

  assert.match(
    completionSource,
    /deferConstructorUntilConsequence\?: boolean \| undefined/u
  );
  assert.match(
    completionSource,
    /if \(input\.deferConstructorUntilConsequence !== true\)/u
  );
  assert.match(completionSource, /constructorResultFromWorkerOutput/u);
  assert.match(
    completionSource,
    /blockingReasonCarriers:\s*activePostflightBlockingReasonCarriers\(postflight\)/u
  );
  assert.doesNotMatch(
    completionSource,
    /blockingReasonCarriers:\s*postflight\.blockingReasonCarriers/u
  );
  assert.match(
    installedOperatorSource,
    /function activePostflightBlockingReasonCarriers/u
  );
  assert.match(
    installedOperatorSource,
    /postflight\.status === "passed"\s*\?\s*Object\.freeze\(\[\]\)/u
  );
  const reviewGradeStateStart = installedOperatorSource.indexOf(
    "function stateWithReviewGradePostflight"
  );
  const reviewGradeStateEnd = installedOperatorSource.indexOf(
    "export function deriveSdlcWorkerRetryContextFromTraversalConsequence",
    reviewGradeStateStart
  );
  const reviewGradeStateSource = installedOperatorSource.slice(
    reviewGradeStateStart,
    reviewGradeStateEnd
  );
  assert.match(reviewGradeStateSource, /postflight:\s*reviewGradePostflight/u);
  assert.match(
    reviewGradeStateSource,
    /\n\s*blockingReasonCarriers\s*\n\s*\}\);/u
  );
  assert.match(noDispatchSource, /buildDeclaredEdgeProjectionPendingReport/u);
  assert.match(noDispatchSource, /deferConstructorUntilConsequence: true/u);
  assert.doesNotMatch(noDispatchSource, /constructorResultFromWorkerOutput/u);
  assert.doesNotMatch(noDispatchSource, /runSdlcHookTurn/u);
});

test("T-184 report admission failures are diagnostic-only postflight", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const carriersSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/carriers.ts"
  );

  const workerPostflightStart = installedOperatorSource.indexOf(
    "function workerReportAdmissionPostflight"
  );
  const deterministicPostflightStart = installedOperatorSource.indexOf(
    "function deterministicReportAdmissionPostflight"
  );
  const workerPostflightSource = installedOperatorSource.slice(
    workerPostflightStart,
    deterministicPostflightStart
  );
  const deterministicPostflightSource = installedOperatorSource.slice(
    deterministicPostflightStart,
    installedOperatorSource.indexOf(
      "function workerProcessEvidenceRefs",
      deterministicPostflightStart
    )
  );
  for (const source of [workerPostflightSource, deterministicPostflightSource]) {
    assert.match(source, /status:\s*"diagnostic" as const/u);
    assert.match(source, /blockingReasons:\s*Object\.freeze\(\[\]\)/u);
    assert.match(source, /lawfulReentryPoint:\s*"operator_blocked"/u);
    assert.doesNotMatch(source, /status:\s*"blocked" as const/u);
  }

  const reportAdmissionFailureSource = installedOperatorSource.slice(
    installedOperatorSource.indexOf("const completeReportAdmissionFailure"),
    installedOperatorSource.indexOf("const edgeAccountingRow")
  );
  assert.match(reportAdmissionFailureSource, /gapDossier:\s*null/u);
  assert.match(
    reportAdmissionFailureSource,
    /resultRef:\s*consequence\.nextActionProjection\.nextActionProjectionRef/u
  );
  assert.doesNotMatch(reportAdmissionFailureSource, /constructPostflightGapDossier/u);
  assert.doesNotMatch(reportAdmissionFailureSource, /writePostflightGapDossier/u);
  assert.doesNotMatch(reportAdmissionFailureSource, /gapDossier\.currentGapDossierRef/u);
  assert.equal(
    (installedOperatorSource.match(/completeReportAdmissionFailure\(/gu) ?? [])
      .length,
    2
  );
  assert.match(
    carriersSource,
    /export type SdlcPostflightResultStatus = "passed" \| "blocked" \| "diagnostic"/u
  );
});

test("T-184 retryable provider connection failures remain same-edge retry", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t184-provider-connection"
  });
  mkdirSync(manifest.archiveRoot, { recursive: true });
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
    "API Error: Unable to connect to API (ECONNRESET)\n",
    "utf8"
  );

  const postflight = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun: {
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
      elapsedMs: 425253,
      timedOut: false,
      stdoutByteCount: 128,
      stderrByteCount: 0,
      stdoutPath,
      stderrPath,
      outputLastMessagePath: null,
      error: null
    }
  });
  const dossier = constructPostflightGapDossier({ manifest, postflight });

  assert.equal(postflight.blockingReasonCarriers[0].code, "worker_connection_failed");
  assert.equal(
    postflight.blockingReasonCarriers[0].lawfulReentryPoint,
    "same_edge_retry"
  );
  assert.equal(dossier.retryEligible, true);
  assert.deepEqual(dossier.nextLawfulActions, ["retry_same_edge"]);
});

test("T-184 retryable provider server errors remain same-edge retry", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t184-provider-server-error"
  });
  mkdirSync(manifest.archiveRoot, { recursive: true });
  const stdoutPath = path.join(manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(manifest.archiveRoot, "worker_stderr.log");
  const finalOutputPath = path.join(manifest.archiveRoot, "final_output.txt");
  writeFileSync(stdoutPath, "", "utf8");
  writeFileSync(stderrPath, "", "utf8");
  writeFileSync(
    finalOutputPath,
    "API Error: 500 Internal server error. This is a server-side issue, usually temporary — try again in a moment.\n",
    "utf8"
  );

  const postflight = constructWorkerProcessFailurePostflight({
    manifest,
    workerRun: {
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
      elapsedMs: 107423,
      timedOut: false,
      stdoutByteCount: 0,
      stderrByteCount: 0,
      stdoutPath,
      stderrPath,
      outputLastMessagePath: null,
      error: null
    }
  });
  const dossier = constructPostflightGapDossier({ manifest, postflight });

  assert.equal(postflight.blockingReasonCarriers[0].code, "worker_connection_failed");
  assert.equal(
    postflight.blockingReasonCarriers[0].lawfulReentryPoint,
    "same_edge_retry"
  );
  assert.equal(dossier.retryEligible, true);
  assert.deepEqual(dossier.nextLawfulActions, ["retry_same_edge"]);
});

test("T-184 projection surfaces are declared by edge-output policy", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("qualify_component_realization_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: contract.edgeName,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t184-workspace-target-surface"
  });
  const policy = sdlcEdgeOutputPolicyForTargetAssetType(manifest.targetAssetType);

  assert.equal(
    policy.outputProducer,
    "system_projection",
    "qualification surfaces are projection outputs declared by shared edge policy"
  );
  assert.equal(policy.reviewGradeAssessmentExempt, true);
  assert.equal(policy.workerAuthoredTargetCarrierProtocolRequired, false);
  assert.equal(existsSync(manifest.outputFile), false);
});

test("T-184 every no-dispatch edge uses system projection policy", () => {
  const workspace = makeWorkspace();
  for (const row of SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING.filter(
    (edgeAccountingRow) => !edgeAccountingRow.workerDispatchAllowed
  )) {
    const contract = hookContractByEdgeName(row.edgeName);
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot: workspace,
      graphFunctionName: contract.edgeName,
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: `t184-${row.edgeName}`
    });
    const policy = sdlcEdgeOutputPolicyForTargetAssetType(manifest.targetAssetType);
    assert.equal(
      policy.outputProducer,
      "system_projection",
      `${row.edgeName} (${manifest.targetAssetType}) must not fall back to a no-dispatch artifact writer`
    );
  }
});
