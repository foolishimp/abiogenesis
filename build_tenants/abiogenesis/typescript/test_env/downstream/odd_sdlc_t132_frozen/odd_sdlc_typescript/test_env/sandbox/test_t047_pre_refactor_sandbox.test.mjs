// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-043
// Investigates: T-047

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import {
  admitSdlcConstructorResult,
  admitSdlcOperationalResult,
  admitSdlcProjectConstraints,
  admitSdlcRequirementProofClaim,
  advanceSdlcOperationalTransitionOnce,
  bindSdlcRoute,
  buildOddSdlcSandboxRunArchive,
  classifySdlcGapObservation,
  constructSdlcGtlModule,
  deriveSdlcGapDossier,
  deriveSdlcLineageLedger,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  observeSdlcGapPressure,
  observeSdlcRuntimeReturn,
  prepareSdlcOperationalTransition,
  projectSdlcQueryDomain,
  projectSdlcRepairFrontier,
  projectSdlcRequirementClosureRegister,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  renderOddSdlcSandboxPostmortem,
  routeSdlcTicketWorkItem,
  runSdlcHookTurn,
  summarizeOddSdlcSandboxRunArchive
} from "../../build/semantic/code/src/index.js";
import {
  assertAbgInstalledSandboxEvidence,
  provisionAbgInstalledSandbox
} from "./abg_installed_workspace.mjs";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(TEST_DIR, "../../../..");

const PORTABLE_INTENT_TEXT = [
  "# Intent",
  "",
  "**Project**: data_mapper",
  "",
  "INT-001: Governed data mapping exists as a typed project."
].join("\n");

const PORTABLE_REQUIREMENTS_TEXT = [
  "# Requirements",
  "",
  "REQ-LDM-001: The mapper preserves lineage.",
  "REQ-ENG-007: The implementation exposes runnable proof."
].join("\n");

const PORTABLE_CONSTRAINT_TEXT = [
  "name: data_mapper",
  "active_tenant: typescript"
].join("\n");

const DATA_MAPPER_REFERENCE_FILES = Object.freeze([
  "README.md",
  ".ai-workspace/context/project_constraints.yml",
  "specification/INTENT.md",
  "specification/REQUIREMENTS.md",
  "specification/mapper_requirements.md",
  "specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md"
]);

function stableJson(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function archiveTimestamp() {
  return new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");
}

function fixtureSnapshot(rootUri, relativePath, content) {
  return {
    uri: `${rootUri}/${relativePath}`,
    relativePath,
    content
  };
}

function resolveDataMapperFixtureRoot() {
  return canonicalDataMapperFixtureRoot();
}

function dataMapperFixture() {
  const fixtureRoot = resolveDataMapperFixtureRoot();
  if (fixtureRoot !== null) {
    const sourceInputs = DATA_MAPPER_REFERENCE_FILES.map((relativePath) => {
      const absolutePath = path.join(fixtureRoot, relativePath);
      assert.equal(
        existsSync(absolutePath),
        true,
        `data_mapper fixture missing ${relativePath}`
      );
      return deriveSdlcSourceInput(
        fixtureSnapshot(`file://${fixtureRoot}`, relativePath, readFileSync(absolutePath, "utf8"))
      );
    });
    return {
      fixtureMode: "data_mapper_reference_template",
      fixtureSource: fixtureRoot,
      workspaceRootUri: `file://${fixtureRoot}`,
      sourceInputs
    };
  }

  const portableInputs = [
    deriveSdlcSourceInput(
      fixtureSnapshot("fixture://data-mapper-minimal", "specification/INTENT.md", PORTABLE_INTENT_TEXT)
    ),
    deriveSdlcSourceInput(
      fixtureSnapshot(
        "fixture://data-mapper-minimal",
        "specification/REQUIREMENTS.md",
        PORTABLE_REQUIREMENTS_TEXT
      )
    ),
    deriveSdlcSourceInput(
      fixtureSnapshot(
        "fixture://data-mapper-minimal",
        ".ai-workspace/context/project_constraints.yml",
        PORTABLE_CONSTRAINT_TEXT
      )
    )
  ];
  return {
    fixtureMode: "portable_data_mapper_minimal_derivative",
    fixtureSource:
      "checked-in test literal derived from data_mapper.template requirements shape",
    workspaceRootUri: "fixture://data-mapper-minimal",
    sourceInputs: portableInputs
  };
}

function dataMapperIngressReport() {
  const fixture = dataMapperFixture();
  const constraints = admitSdlcProjectConstraints({
    projectSlug: "data_mapper",
    activeTenant: "typescript",
    selectedOutputRoot: "build_tenants/typescript",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["build_runner", "runtime_return_channel"]
  });

  return {
    fixture,
    ingress: deriveSdlcWorkspaceIngressReport({
      workspaceRootUri: fixture.workspaceRootUri,
      projectConstraints: constraints,
      sourceInputs: fixture.sourceInputs
    })
  };
}

function codeSurfaceConstructorResult(targetAssetId, requestedOperation) {
  return admitSdlcConstructorResult({
    operationType: requestedOperation,
    outputIdentity: {
      assetId: targetAssetId,
      uri: "file:///workspace/build_tenants/typescript/code/src/generated.ts",
      declaredType: "code_surface",
      digest: "sha256:t047-code-surface",
      byteCount: 128
    },
    evidenceRefs: [
      {
        ref: "test://t047/harnessed-worker-report",
        evidenceType: "harnessed_fp_work_report",
        digest: "sha256:t047-worker-report"
      }
    ],
    generatedAssetContract: {
      contractName: "generated-code-surface-contract",
      targetAssetId,
      satisfied: true,
      materialized: true,
      diagnostics: [],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
}

function recordEvent(events, event, carrierKind, graphFunctionName, evidenceRef) {
  events.push(
    Object.freeze({
      event,
      carrierKind,
      graphFunctionName,
      evidenceRef
    })
  );
}

function uniqueSorted(values) {
  return Object.freeze([...new Set(values)].sort());
}

function writeSandboxArchive(archive) {
  mkdirSync(archive.archiveRoot, { recursive: true });
  writeFileSync(path.join(archive.archiveRoot, "run.json"), stableJson(archive));
  writeFileSync(
    path.join(archive.archiveRoot, "summary.json"),
    stableJson(summarizeOddSdlcSandboxRunArchive(archive))
  );
  writeFileSync(
    path.join(archive.archiveRoot, "stdout.log"),
    [
      `verdict=${archive.verdict}`,
      `elapsed_ms=${archive.elapsedMs.toFixed(3)}`,
      `fixture_mode=${archive.fixtureMode}`,
      `fixture_authority=${archive.fixtureAuthority}`,
      `abg_installed_workspace=${archive.installedWorkspace.targetRoot}`,
      `expected_sequence=${archive.expectedEventSequence.join(" -> ")}`,
      `actual_sequence=${archive.actualEventSequence.join(" -> ")}`,
      ""
    ].join("\n")
  );
  writeFileSync(
    path.join(archive.archiveRoot, "stderr.log"),
    archive.diagnostics.length === 0 ? "" : `${archive.diagnostics.join("\n")}\n`
  );
  writeFileSync(
    path.join(archive.archiveRoot, "postmortem.md"),
    renderOddSdlcSandboxPostmortem(archive)
  );
}

function runComposedSdlcSandboxScenario() {
  const events = [];
  const startedAt = new Date().toISOString();
  const monotonicStart = performance.now();
  const { fixture, ingress } = dataMapperIngressReport();
  recordEvent(
    events,
    "ingress_report_derived",
    ingress.kind,
    null,
    fixture.fixtureSource
  );

  const module = constructSdlcGtlModule();
  recordEvent(
    events,
    "gtl_module_constructed",
    "abiogenesis_module",
    null,
    "build_tenants/typescript/code/src/graph/module.ts"
  );

  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: ingress,
    currentDossierRefs: ["test://t047/dossier"]
  });
  recordEvent(
    events,
    "query_domain_projected",
    queryDomain.kind,
    null,
    "build_tenants/typescript/code/src/projection/query_domain.ts"
  );

  const workerAttachment = projectSdlcWorkerAttachment({
    transportContract: "transport://t047/harnessed-fp"
  });
  recordEvent(
    events,
    "worker_attachment_admitted",
    workerAttachment.kind,
    null,
    "transport://t047/harnessed-fp"
  );

  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot: "/tmp/t047",
      target: {
        kind: "asset",
        handle: "release_surface"
      },
      until: "first_traversal",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    workerAttachment
  });
  recordEvent(
    events,
    "public_start_projected",
    start.kind,
    start.executionContract.targetGraphFunction,
    "build_tenants/typescript/code/src/start/public_start.ts"
  );

  const gapDossier = deriveSdlcGapDossier({
    basis: start.executionContract.basis,
    events: [],
    triageInput: "t047 pre-refactor sandbox",
    evidenceRefs: ["test://t047/start"]
  });
  recordEvent(
    events,
    "gap_dossier_derived",
    gapDossier.kind,
    null,
    "build_tenants/typescript/code/src/projection/query_domain.ts"
  );

  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://t047/code-surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "transport://t047/harnessed-fp"
  });
  const hookTurn = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: codeSurfaceConstructorResult(targetAssetId, invocation.requestedOperation)
  });
  recordEvent(
    events,
    "hook_turn_completed",
    hookTurn.kind,
    hookTurn.workReport.generatedAssetAuthority.graphFunctionName,
    "test://t047/harnessed-worker-report"
  );

  const proofClaim = admitSdlcRequirementProofClaim({
    kind: "sdlc_requirement_proof_claim",
    requirementId: "REQ-LDM-001",
    requirementAuthorityRef:
      ingress.importedRequirementAuthorities.find(
        (authority) => authority.requirementId === "REQ-LDM-001"
      )?.requirementAuthorityRef ?? "missing.requirement.authority",
    assetId: targetAssetId,
    proofKind: "behavioral_test",
    authorityVerb: "validates",
    evidenceRefs: ["test://t047/pre-refactor-sandbox"]
  });
  const lineage = deriveSdlcLineageLedger({
    ingressReport: ingress,
    workReports: [hookTurn.workReport],
    proofClaims: [proofClaim]
  });
  const closure = projectSdlcRequirementClosureRegister({
    ingressReport: ingress,
    lineageLedger: lineage
  });
  const repairFrontier = projectSdlcRepairFrontier({ closureRegister: closure });
  recordEvent(
    events,
    "requirement_closure_projected",
    closure.kind,
    null,
    "build_tenants/typescript/code/src/projection/requirement_closure.ts"
  );

  const observation = observeSdlcGapPressure({
    gapDossier,
    closureRegister: closure,
    analysisRef: "analysis://t047"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });
  recordEvent(
    events,
    "gap_route_bound",
    route.kind,
    route.lawfulStartTarget.handle,
    "build_tenants/typescript/code/src/triage/triage.ts"
  );

  const ticketRoute = routeSdlcTicketWorkItem({
    routeBinding: route,
    workItemRef: "ticket://T-047/sandbox-follow-up",
    lawfulReEntryPoint: "requirement_reprice"
  });
  recordEvent(
    events,
    "ticket_route_projected",
    ticketRoute.kind,
    "route_ticket_work_item",
    "build_tenants/typescript/code/src/triage/triage.ts"
  );

  const buildPlan = prepareSdlcOperationalTransition({
    projectConstraints: ingress.projectConstraints,
    lane: "build",
    commandId: "command://t047/build",
    capabilityContract: "build_runner",
    targetAssetIds: [targetAssetId]
  });
  assert.equal(buildPlan.status, "prepared");
  assert(buildPlan.command);
  const buildResult = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t047/build/1",
    commandId: buildPlan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://t047/build-log"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const buildAdvance = advanceSdlcOperationalTransitionOnce({
    command: buildPlan.command,
    result: buildResult,
    runtimeFactRefs: ["abg://t047/build-result"]
  });
  recordEvent(
    events,
    "operational_build_result_admitted",
    buildAdvance.kind,
    "derive_build_execution_result_surface",
    "abg://t047/build-result"
  );

  const runtimePlan = prepareSdlcOperationalTransition({
    projectConstraints: ingress.projectConstraints,
    lane: "runtime_return",
    commandId: "command://t047/runtime-return",
    capabilityContract: "runtime_return_channel",
    targetAssetIds: ["asset://t047/deployment-result"]
  });
  assert(runtimePlan.command);
  const runtimeResult = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t047/runtime-return/1",
    commandId: runtimePlan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://t047/runtime-observation"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const runtimeObservation = observeSdlcRuntimeReturn({
    command: runtimePlan.command,
    result: runtimeResult,
    runtimeFactRefs: ["abg://t047/runtime-return"]
  });
  recordEvent(
    events,
    "runtime_return_observed",
    runtimeObservation.kind,
    "derive_runtime_observation_surface",
    "abg://t047/runtime-return"
  );

  const endedAt = new Date().toISOString();
  const elapsedMs = performance.now() - monotonicStart;
  const archiveRoot = path.join(
    PACKAGE_ROOT,
    "test_env/test_runs/typescript_pre_refactor_sandbox",
    `${archiveTimestamp()}_pid${process.pid}`
  );
  const graphFunctionsExercised = uniqueSorted([
    start.executionContract.targetGraphFunction,
    hookTurn.workReport.generatedAssetAuthority.graphFunctionName,
    route.lawfulStartTarget.handle,
    "route_ticket_work_item",
    "derive_build_execution_result_surface",
    ...runtimeObservation.feedsGraphFunctions
  ]);
  const carriersAdmitted = uniqueSorted(events.map((entry) => entry.carrierKind));
  const residualGaps = Object.freeze([
    "T-041: live external F_P worker execution remains deferred",
    "T-041: full Python live archive comparison remains deferred"
  ]);

  const archive = buildOddSdlcSandboxRunArchive({
    scenarioId: "t047-data-mapper-composed-sdlc-traversal",
    scenarioAuthority: {
      ticket: "T-047",
      requirements: [
        "specification/requirements/04-verification.md",
        "specification/requirements/13-odd-sdlc-typescript-tenant.md"
      ],
      design: [
        "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md"
      ],
      testSurfaceMap: "build_tenants/typescript/test_env/test_surface_map.md"
    },
    command: "npm run test:sandbox",
    packageRoot: PACKAGE_ROOT,
    archiveRoot,
    fixtureMode: fixture.fixtureMode,
    fixtureSource: fixture.fixtureSource,
    startedAt,
    endedAt,
    elapsedMs,
    events,
    graphFunctionsExercised,
    carriersAdmitted,
    diagnostics: [],
    residualGaps
  });

  return {
    archive,
    start,
    hookTurn,
    closure,
    repairFrontier,
    route,
    ticketRoute,
    buildAdvance,
    runtimeObservation
  };
}

test("T-047 sandbox archives expected and actual composed traversal evidence", async () => {
  const result = runComposedSdlcSandboxScenario();
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot: result.archive.archiveRoot,
    scenarioId: result.archive.scenarioId
  });
  const archive = {
    ...result.archive,
    installedWorkspace
  };
  writeSandboxArchive(archive);

  assertAbgInstalledSandboxEvidence(installedWorkspace);
  assert.equal(archive.verdict, "passed");
  assert.equal(archive.sequenceMatches, true);
  assert.deepStrictEqual(
    archive.actualEventSequence,
    archive.expectedEventSequence
  );
  assert.equal(result.start.status, "dispatch_required");
  assert.equal(result.hookTurn.preflight.status, "passed");
  assert.equal(result.hookTurn.postflight?.status, "passed");
  assert.equal(result.hookTurn.emittedRuntimeEventKinds.length, 0);
  if (archive.fixtureMode === "portable_minimal") {
    assert(result.closure.fulfilledRequirementIds.includes("REQ-LDM-001"));
    assert(result.closure.unresolvedRequirementIds.includes("REQ-ENG-007"));
    assert(result.repairFrontier.unmetRequirementIds.includes("REQ-ENG-007"));
  } else {
    assert(result.closure.entries.length > 0);
  }
  assert.equal(result.route.lawfulStartTarget.handle, "derive_code_surface");
  assert.equal(result.ticketRoute.ticketAuthority, "TICKET_METHOD");
  assert.equal(result.ticketRoute.writesTicket, false);
  assert.equal(result.buildAdvance.stage, "result_admitted");
  assert.deepStrictEqual(result.runtimeObservation.feedsGraphFunctions, [
    "derive_runtime_observation_surface",
    "derive_retrofit_plan_surface"
  ]);

  for (const fileName of [
    "run.json",
    "summary.json",
    "stdout.log",
    "stderr.log",
    "postmortem.md"
  ]) {
    assert.equal(
      existsSync(path.join(result.archive.archiveRoot, fileName)),
      true,
      `missing sandbox archive file ${fileName}`
    );
  }

  const runJson = JSON.parse(
    readFileSync(path.join(result.archive.archiveRoot, "run.json"), "utf8")
  );
  assert.equal(
    runJson.kind,
    "odd_sdlc_typescript_pre_refactor_sandbox_run_archive"
  );
  assert.equal(runJson.ticketId, "T-047");
  assert.equal(runJson.scenarioAuthority.ticket, "T-047");
  assert.equal(runJson.command, "npm run test:sandbox");
  assert.equal(runJson.verdict, "passed");
  assert.equal(
    runJson.fixtureAuthority,
    runJson.fixtureMode === "portable_data_mapper_minimal_derivative"
      ? "portable_rc_lane"
      : "forensic_local_reference"
  );
  assert.equal(runJson.elapsedMs > 0, true);
  assert.equal(runJson.diagnostics.length, 0);
  assert(runJson.carriersAdmitted.every((carrier) => typeof carrier === "string"));
  assert(runJson.graphFunctionsExercised.includes("prepare_release_surface"));
  assert(runJson.graphFunctionsExercised.includes("derive_code_surface"));
  assert.equal(
    runJson.installedWorkspace.kind,
    "odd_sdlc_abg_installed_sandbox_evidence"
  );
  assert.equal(runJson.installedWorkspace.commandProbe.status, 0);
  assert(
    runJson.installedWorkspace.commandPaths.some((entry) =>
      entry.endsWith("/genesis-ts")
    )
  );
  assert(
    runJson.residualGaps.every(
      (gap) => !gap.includes("M05 sandbox/archive framework")
    )
  );
  assert.equal(
    existsSync(path.join(result.archive.archiveRoot, "abg_install", "install-manifest.json")),
    true
  );
  assert.equal(
    existsSync(path.join(result.archive.archiveRoot, "abg_install", "typescript-installer-manifest.json")),
    true
  );
  assert(
    runJson.archiveRoot.startsWith(
      path.join(PACKAGE_ROOT, "test_env/test_runs/typescript_pre_refactor_sandbox")
    )
  );
  assert.equal(
    existsSync(resolve(REPO_ROOT, ".ai-workspace/tickets/completed/T-047-realize-typescript-pre-refactor-sandbox-proof-lane.md")),
    true
  );
});
