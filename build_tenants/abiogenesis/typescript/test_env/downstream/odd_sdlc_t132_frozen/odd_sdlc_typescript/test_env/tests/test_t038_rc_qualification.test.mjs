// Validates: REQ-F-ODDSDLC-024
// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-041
// Validates: REQ-F-ODDSDLC-043
// Investigates: T-038
// Investigates: T-046

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitSdlcConstructorResult,
  admitSdlcOperationalResult,
  admitSdlcProjectConstraints,
  admitSdlcRequirementProofClaim,
  classifySdlcGapObservation,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcLineageLedger,
  deriveSdlcSourceInput,
  deriveSdlcGapDossier,
  deriveSdlcWorkspaceIngressReport,
  describeOddSdlcTypescriptRcQualification,
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
  remainingOddSdlcTypescriptRcGaps,
  routeSdlcTicketWorkItem,
  runSdlcHookTurn,
  bindSdlcRoute,
  advanceSdlcOperationalTransitionOnce
} from "../../build/semantic/code/src/index.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const PORTABLE_REQUIREMENTS_TEXT = [
  "# Requirements",
  "",
  "REQ-LDM-001: The mapper preserves lineage.",
  "REQ-ENG-007: The implementation exposes runnable proof."
].join("\n");

function fixtureSnapshot(relativePath, content) {
  return {
    uri: `fixture://portable-t038/${relativePath}`,
    relativePath,
    content
  };
}

function ingressReport() {
  const constraints = admitSdlcProjectConstraints({
    projectSlug: "data_mapper",
    activeTenant: "typescript",
    selectedOutputRoot: "build_tenants/typescript",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["build_runner", "runtime_return_channel"]
  });
  const sourceInputs = [
    deriveSdlcSourceInput(
      fixtureSnapshot(
        "specification/INTENT.md",
        ["# Intent", "", "**Project**: data_mapper", "", "INT-001: Govern mapping."].join("\n")
      )
    ),
    deriveSdlcSourceInput(
      fixtureSnapshot("specification/requirements/01-core.md", PORTABLE_REQUIREMENTS_TEXT)
    ),
    deriveSdlcSourceInput(
      fixtureSnapshot(
        ".ai-workspace/context/project_constraints.yml",
        ["name: data_mapper", "active_tenant: typescript"].join("\n")
      )
    )
  ];
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://portable-t038",
    projectConstraints: constraints,
    sourceInputs
  });
}

function codeSurfaceConstructorResult(targetAssetId, requestedOperation) {
  return admitSdlcConstructorResult({
    operationType: requestedOperation,
    outputIdentity: {
      assetId: targetAssetId,
      uri: "file:///workspace/build_tenants/typescript/code/src/generated.ts",
      declaredType: "code_surface",
      digest: "sha256:t038-code-surface",
      byteCount: 128
    },
    evidenceRefs: [
      {
        ref: "test://t038/harnessed-worker-report",
        evidenceType: "harnessed_fp_work_report",
        digest: "sha256:t038-worker-report"
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

test("T-038 qualification report scopes RC claim and tickets remaining gaps", () => {
  const report = describeOddSdlcTypescriptRcQualification();

  assert.equal(report.kind, "odd_sdlc_typescript_rc_qualification_report");
  assert.equal(report.verdict, "retired_superseded_by_test35_uplift_wave");
  assert(!report.nonClaimedScope.includes("live probabilistic data_mapper generation with an external F_P worker"));
  assert(!report.nonClaimedScope.includes("side-effecting installed-workspace CLI replacement for the Python tenant"));
  assert(report.gates.some((gate) => gate.name === "T-038 composed harnessed sandbox" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "T-052 ABG-populated installed sandbox contract" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "T-058/T-120 Spec Method entrypoint" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "T-139 public requirements-fulfillment gaps view" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "T-140 no local forced-iteration authority" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "T-059 install and release-cut adapter" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "live F_P worker traversal" && gate.status === "passed"));
  assert(report.gates.some((gate) => gate.name === "B-085 current live data_mapper release-depth parity" && gate.status === "completed_retired"));
  assert(report.gates.some((gate) => gate.name === "T-060 TypeScript/Python archive comparison" && gate.status === "passed"));

  for (const gap of remainingOddSdlcTypescriptRcGaps()) {
    assert(gap.gapTicket);
    assert(existsSync(resolve(REPO_ROOT, gap.gapTicket)));
  }
});

test("T-046 qualification report points at completed T-038 authority", () => {
  const reportText = readFileSync(
    resolve(
      REPO_ROOT,
      "build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT.md"
    ),
    "utf8"
  );

  assert(reportText.includes(".ai-workspace/tickets/completed/T-038-qualify-odd-sdlc-typescript-rc-against-python-functionality-and-odd-scenarios.md"));
  assert(!reportText.includes(".ai-workspace/tickets/backlog/T-038-qualify"));
});

test("T-054 Python parity blocker map is the full operational RC control surface", () => {
  const mapPath = resolve(
    REPO_ROOT,
    "build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_PYTHON_PARITY_RC_BLOCKER_MAP.md"
  );
  const reportPath = resolve(
    REPO_ROOT,
    "build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT.md"
  );
  const t041Path = resolve(
    REPO_ROOT,
    ".ai-workspace/tickets/completed/T-041-realize-typescript-full-operational-python-replacement-rc-lane.md"
  );
  const comparisonPath = resolve(
    REPO_ROOT,
    "build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md"
  );

  assert(existsSync(mapPath));
  assert(existsSync(comparisonPath));
  const mapText = readFileSync(mapPath, "utf8");
  const reportText = readFileSync(reportPath, "utf8");
  const t041Text = readFileSync(t041Path, "utf8");
  const comparisonText = readFileSync(comparisonPath, "utf8");

  assert(reportText.includes("ODD_SDLC_TYPESCRIPT_PYTHON_PARITY_RC_BLOCKER_MAP.md"));
  assert(t041Text.includes("ODD_SDLC_TYPESCRIPT_PYTHON_PARITY_RC_BLOCKER_MAP.md"));
  assert(mapText.includes("Full operational Python-replacement RC"));
  assert(mapText.includes("Live External F_P data_mapper Traversal"));
  assert(mapText.includes("Owning ticket: `T-053`"));
  assert(mapText.includes("Status class: `closed`"));
  assert(mapText.includes("ABG-Installed Sandbox Population"));
  assert(mapText.includes("T-059"));
  assert(mapText.includes("T-060"));
  assert(mapText.includes("Sandbox proof is treated as live external `F_P` proof"));
  assert(!mapText.includes("Python live tests are TypeScript proof"));
  assert(comparisonText.includes("Current TypeScript Live data_mapper"));
  assert(comparisonText.includes("Python Historical Live Code Edge"));
  assert(comparisonText.includes("Python data_mapper Yield-Chain Baseline"));
  assert(comparisonText.includes("not yet evidence-equivalent"));
});

test("T-038 composed harnessed sandbox walks ingress to operational return", () => {
  const ingress = ingressReport();
  const module = constructSdlcGtlModule();
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: ingress,
    currentDossierRefs: ["test://t038/dossier"]
  });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot: "/tmp/t038",
    constraintsText: [
      "project:",
      "  name: data_mapper",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - build_runner",
      "      - runtime_return_channel"
    ].join("\n")
  });

  const workerAttachment = projectSdlcWorkerAttachment({
    transportContract: "transport://t038/harnessed-fp"
  });
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot: "/tmp/t038",
      target: {
        kind: "asset",
        handle: "release_surface"
      },
      until: "first_traversal",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment
  });

  assert.equal(start.kind, "sdlc_public_start_projected");
  assert.equal(start.status, "dispatch_required");
  assert.equal(start.executionContract.targetGraphFunction, "prepare_release_surface");

  const gapDossier = deriveSdlcGapDossier({
    basis: start.executionContract.basis,
    events: [],
    triageInput: "t038 harnessed sandbox",
    evidenceRefs: ["test://t038/start"]
  });
  assert.equal(gapDossier.choosesNextTraversal, false);

  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://t038/code-surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "transport://t038/harnessed-fp"
  });
  const hookTurn = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: codeSurfaceConstructorResult(targetAssetId, invocation.requestedOperation)
  });

  assert.equal(hookTurn.preflight.status, "passed");
  assert(hookTurn.workReport);
  assert.equal(hookTurn.postflight?.status, "passed");
  assert.equal(hookTurn.workReport.generatedAssetAuthority.graphFunctionName, "derive_code_surface");
  assert.deepStrictEqual(hookTurn.emittedRuntimeEventKinds, []);

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
    evidenceRefs: ["test://t038/harnessed-sandbox"]
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

  assert.deepStrictEqual(closure.fulfilledRequirementIds, ["REQ-LDM-001"]);
  assert.deepStrictEqual(closure.unresolvedRequirementIds, ["REQ-ENG-007"]);
  assert.deepStrictEqual(repairFrontier.unmetRequirementIds, ["REQ-ENG-007"]);

  const observation = observeSdlcGapPressure({
    gapDossier,
    closureRegister: closure,
    analysisRef: "analysis://t038"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });
  const ticketRoute = routeSdlcTicketWorkItem({
    routeBinding: route,
    workItemRef: "ticket://T-038/harnessed-follow-up",
    lawfulReEntryPoint: "requirement_reprice"
  });

  assert.equal(classification.frameworkLayer, "code");
  assert.equal(route.lawfulStartTarget.handle, "derive_code_surface");
  assert.equal(ticketRoute.ticketAuthority, "TICKET_METHOD");
  assert.equal(ticketRoute.writesTicket, false);

  const buildPlan = prepareSdlcOperationalTransition({
    projectConstraints: ingress.projectConstraints,
    lane: "build",
    commandId: "command://t038/build",
    capabilityContract: "build_runner",
    targetAssetIds: [targetAssetId]
  });
  assert.equal(buildPlan.status, "prepared");
  assert(buildPlan.command);
  const buildResult = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t038/build/1",
    commandId: buildPlan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://t038/build-log"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const buildAdvance = advanceSdlcOperationalTransitionOnce({
    command: buildPlan.command,
    result: buildResult,
    runtimeFactRefs: ["abg://t038/build-result"]
  });
  assert.equal(buildAdvance.stage, "result_admitted");
  assert.equal(buildAdvance.projection.state, "succeeded");
  assert.equal(buildAdvance.nextControlOwner, "abg_public_start");

  const runtimePlan = prepareSdlcOperationalTransition({
    projectConstraints: ingress.projectConstraints,
    lane: "runtime_return",
    commandId: "command://t038/runtime-return",
    capabilityContract: "runtime_return_channel",
    targetAssetIds: ["asset://t038/deployment-result"]
  });
  assert(runtimePlan.command);
  const runtimeResult = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t038/runtime-return/1",
    commandId: runtimePlan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://t038/runtime-observation"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const runtimeObservation = observeSdlcRuntimeReturn({
    command: runtimePlan.command,
    result: runtimeResult,
    runtimeFactRefs: ["abg://t038/runtime-return"]
  });

  assert.deepStrictEqual(runtimeObservation.feedsGraphFunctions, [
    "derive_runtime_observation_surface",
    "derive_retrofit_plan_surface"
  ]);
  assert.deepStrictEqual(runtimeObservation.emittedRuntimeEventKinds, []);
});
