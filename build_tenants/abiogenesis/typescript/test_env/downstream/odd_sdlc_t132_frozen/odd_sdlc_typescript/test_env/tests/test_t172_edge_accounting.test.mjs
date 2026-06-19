// Validates: T-172
// Validates: REQ-F-ODDSDLC-081

// Hard-coded full-graph edge counts and projection names are intentional. A
// lawful graph change must update this test and the T-172 edge register together.
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
import path from "node:path";
import { pathToFileURL } from "node:url";

import { emit } from "@abiogenesis/typescript-tenant";

import {
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
  SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING,
  admitSdlcProjectConstraints,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  deriveSdlcExecutiveEdgeAccountingAudit,
  executeInstalledOperatorStart,
  hookContractByEdgeName,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";
import {
  analyzeSdlcFdRunArchive
} from "../../build/semantic/code/src/analysis/index.js";

function makeRuntimeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t172-runtime-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-172 Runtime Fixture\n", "utf8");
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Exercise no-dispatch edge accounting."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-fixture.md"),
    ["# Requirements", "", "REQ-T172-RUNTIME-001: Build a runtime fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t172_runtime",
      "  active_tenant: typescript",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: TypeScript",
      "    build_tool: npm",
      "    test_runner: node --test",
      "    test_execution_contract: node --test",
      "    module_structure:",
      "      - runtime",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n"),
    "utf8"
  );
  return root;
}

function runtimeStart(workspaceRoot) {
  const module = constructSdlcGtlModule();
  const constraintsText = readFileSync(
    path.join(workspaceRoot, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(workspaceRoot).href,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t172_runtime",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
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

function writePriorSucceededExecutionResult(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 15,
    contract,
    runId: "t172-prior-execution-result"
  });
  writeHandoffFiles(manifest);
  const shard = manifest.productMaterialization.executionShards[0];
  assert.ok(shard, "prior execution result fixture requires a declared shard");
  const summaryPath = path.join(
    manifest.archiveRoot,
    "installed_operator_execution/prior.summary.json"
  );
  mkdirSync(path.dirname(summaryPath), { recursive: true });
  writeFileSync(
    summaryPath,
    `${JSON.stringify(
      {
        kind: "sdlc_installed_operator_execution_shard_summary",
        shardId: shard.shardId,
        command: shard.command,
        workingDirectory: shard.workingDirectory,
        status: 0,
        signal: null,
        error: null,
        timedOut: false
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const reportRefs = [pathToFileURL(summaryPath).href];
  const executionEvidence = {
    kind: "sdlc_worker_execution_evidence",
    lane: "test",
    command: manifest.productMaterialization.testExecutionContract,
    status: "succeeded",
    reportRefs,
    testsObserved: 1,
    passedCount: 1,
    failedCount: 0,
    shardEvidence: [
      {
        kind: "sdlc_worker_execution_shard_evidence",
        shardId: shard.shardId,
        moduleName: shard.moduleName,
        lane: "test",
        command: shard.command,
        status: "succeeded",
        reportRefs,
        testsObserved: 1,
        passedCount: 1,
        failedCount: 0
      }
    ]
  };
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    `${JSON.stringify(executionEvidence, null, 2)}\n`,
    "utf8"
  );
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
        digest: "sha256:t172-prior-execution-result",
        summary: "prior admitted execution result for T-172 archive projection",
        unresolvedReasons: [],
        materializedFiles: [],
        materializationDiagnostics: [],
        executionEvidence,
        executionEvidenceErrors: [],
        obligationAssessments: manifest.traversalObligationContext.obligations.map(
          (obligation) => ({
            kind: "sdlc_worker_obligation_assessment",
            obligationId: obligation.obligationId,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: [pathToFileURL(manifest.outputFile).href, ...reportRefs],
            blockingReasons: []
          })
        ),
        fpTransformRequestRef: null,
        fpTransformResultRef: null,
        fpTransformStatusSnapshot: null,
        fpEvaluateResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
      },
      null,
      2
    )}\n`,
    "utf8"
  );
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
    workflowVersion: "t172-preclosed",
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

test("T-172 accounts for every selected full traversal edge", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit();

  assert.equal(audit.kind, "sdlc_executive_edge_accounting_audit");
  assert.equal(audit.admissionDecision, "admit");
  assert.deepEqual(audit.missingEdgeNames, []);
  assert.deepEqual(audit.extraEdgeNames, []);
  assert.deepEqual(audit.selectedEdgeNames, [
    ...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
  ].sort());
  assert.deepEqual(audit.accountedEdgeNames, audit.selectedEdgeNames);
});

test("T-172 rejects a selected edge with no accounting row", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit({
    accountingRows: SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING.filter(
      (row) => row.edgeName !== "derive_component_code_surface"
    )
  });

  assert.equal(audit.admissionDecision, "reject");
  assert.deepEqual(audit.missingEdgeNames, ["derive_component_code_surface"]);
  assert.ok(
    audit.blockingReasons.includes(
      "missing_edge_accounting:derive_component_code_surface"
    )
  );
});

test("T-172 keeps projection-only graph edges out of F_P transform dispatch", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit();

  assert.deepEqual(audit.projectionNoCloseEdgeNames, [
    "derive_code_surface",
    "derive_test_run_archive_surface",
    "prepare_test_execution_surface"
  ]);
  assert.deepEqual(audit.workerDispatchViolationEdgeNames, []);

  for (const row of SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING) {
    if (row.disposition === "projection_no_close") {
      assert.equal(row.workerDispatchAllowed, false, row.edgeName);
      assert.deepEqual(row.closureEvidenceRefs, [], row.edgeName);
    }
  }
});

test("T-172 accounts conditional repair pressure without treating it as always-on construction", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit();

  assert.deepEqual(audit.conditionalEdgeNames, [
    "derive_component_repair_schedule_surface"
  ]);
  const repairRow = SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING.find(
    (row) => row.edgeName === "derive_component_repair_schedule_surface"
  );

  assert.ok(repairRow);
  assert.equal(repairRow.disposition, "conditional");
  assert.equal(repairRow.workerDispatchAllowed, true);
  assert.deepEqual(repairRow.ownedPressureRefs, [
    "pressure://component-failure/repair-schedule"
  ]);
});

test("T-172 has no selected full-graph delete or merge candidates after accounting", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit();

  assert.deepEqual(audit.deleteRequiredEdgeNames, []);
  assert.deepEqual(audit.mergeRequiredEdgeNames, []);
  assert.deepEqual(audit.replaceRequiredEdgeNames, []);
});

test("T-172 rejects projection or deletion rows that try to dispatch F_P transform", () => {
  const badRows = SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING.map((row) =>
    row.edgeName === "derive_code_surface"
      ? { ...row, workerDispatchAllowed: true }
      : row
  );
  const audit = deriveSdlcExecutiveEdgeAccountingAudit({
    accountingRows: badRows
  });

  assert.equal(audit.admissionDecision, "reject");
  assert.deepEqual(audit.workerDispatchViolationEdgeNames, [
    "derive_code_surface"
  ]);
});

test("T-172 rejects observed worker dispatch on no-dispatch accounting rows", () => {
  const audit = deriveSdlcExecutiveEdgeAccountingAudit({
    observedDispatchedEdgeNames: [
      "derive_component_code_surface",
      "derive_test_execution_result_surface",
      "prepare_release_surface"
    ]
  });

  assert.equal(audit.admissionDecision, "reject");
  assert.deepEqual(audit.observedWorkerDispatchViolationEdgeNames, [
    "derive_test_execution_result_surface",
    "prepare_release_surface"
  ]);
  assert.ok(
    audit.blockingReasons.includes(
      "observed_worker_dispatch_disallowed:prepare_release_surface"
    )
  );
});

test("T-172 F_D failure rows do not embed stack-specific build-tool classifiers", () => {
  const source = readFileSync(
    path.join(process.cwd(), "code/src/operator/plugins/transform/launch_contract.ts"),
    "utf8"
  );
  assert.doesNotMatch(source, /sharedSbtBuildConfigurationFailureRow/u);
  assert.doesNotMatch(source, /failure:sbt-build-definition/u);
});

test("T-172 installed operator executes no-dispatch edges without worker_run", async () => {
  const noDispatchEdgeNames = SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING
    .filter((row) => !row.workerDispatchAllowed)
    .map((row) => row.edgeName);

  assert.deepEqual(noDispatchEdgeNames, [
    "qualify_component_realization_surface",
    "derive_code_surface",
    "prepare_test_execution_surface",
    "derive_test_execution_result_surface",
    "qualify_component_test_execution_surface",
    "derive_test_run_archive_surface",
    "derive_release_depth_parity_surface",
    "prepare_release_surface"
  ]);

  for (const edgeName of noDispatchEdgeNames) {
    const workspaceRoot = makeRuntimeWorkspace();
    if (edgeName === "derive_test_run_archive_surface") {
      writePriorSucceededExecutionResult(workspaceRoot);
    }
    const start = runtimeStart(workspaceRoot);
    const basis = start.executionContract.basis;
    const outcome = await executeInstalledOperatorStart({
      workspaceRoot,
      start,
      workerTransport: null,
      replayEvents: preclosedEventsBeforeEdge(basis, edgeName)
    });

    assert.equal(outcome.manifest.edgeName, edgeName);
    assert.equal(outcome.workerRun, null, edgeName);
    const structuralPostflight = JSON.parse(
      readFileSync(path.join(outcome.archiveRoot, "postflight.json"), "utf8")
    );
    assert.equal(structuralPostflight.status, "passed", edgeName);
    assert.equal(
      existsSync(path.join(outcome.archiveRoot, "worker_run.json")),
      false,
      edgeName
    );
    assert.equal(
      existsSync(path.join(outcome.archiveRoot, "worker_result_report.json")),
      true,
      edgeName
    );

    const report = JSON.parse(
      readFileSync(path.join(outcome.archiveRoot, "worker_result_report.json"), "utf8")
    );
    assert.equal(report.fpTransformRequestRef, null, edgeName);
    assert.equal(report.fpTransformResultRef, null, edgeName);
    assert.equal(report.fpTransformStatusSnapshot, null, edgeName);
    if (edgeName === "qualify_component_realization_surface") {
      assert.equal(existsSync(outcome.manifest.outputFile), true, edgeName);
      const declaredProjectionArtifact = JSON.parse(
        readFileSync(
          path.join(outcome.archiveRoot, "declared_edge_projection_artifact.json"),
          "utf8"
        )
      );
      assert.equal(
        declaredProjectionArtifact.sourceFunction,
        "consequence.edge_projection.writeDeclaredEdgeProjectionOutput",
        edgeName
      );
    }
    if (edgeName === "derive_test_execution_result_surface") {
      const projectedEvidence = JSON.parse(
        readFileSync(outcome.manifest.outputFile, "utf8")
      );
      assert.equal(
        projectedEvidence.kind,
        "sdlc_worker_execution_evidence",
        edgeName
      );
      assert.deepEqual(report.executionEvidence, projectedEvidence, edgeName);
      assert.notEqual(projectedEvidence.status, "pending", edgeName);
      assert.equal(report.executionEvidenceErrors?.length ?? 0, 0, edgeName);
      const declaredProjectionArtifact = JSON.parse(
        readFileSync(
          path.join(outcome.archiveRoot, "declared_edge_projection_artifact.json"),
          "utf8"
        )
      );
      assert.equal(
        declaredProjectionArtifact.sourceFunction,
        "consequence.edge_projection.writeDeclaredEdgeProjectionOutput",
        edgeName
      );
    }

    const closureDecision = JSON.parse(
      readFileSync(path.join(outcome.archiveRoot, "sdlc_edge_closure_decision.json"), "utf8")
    );
    assert.equal(
      closureDecision.targetCarrierAdmissionStatus,
      "admitted",
      edgeName
    );
    if (edgeName === "qualify_component_realization_surface") {
      assert.equal(
        closureDecision.edgeResidualPressureRefs.some((ref) =>
          ref.includes("component_depth_output_missing")
        ),
        false,
        edgeName
      );
    }
    if (edgeName === "derive_test_execution_result_surface") {
      assert.notEqual(closureDecision.disposition, "retry", edgeName);
    }

    const analysis = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "generic",
      nowMs: Date.parse("2026-05-19T00:00:00.000Z")
    });
    assert.equal(analysis.edgeAccounting.admissionDecision, "admit", edgeName);
    assert.deepEqual(
      analysis.edgeAccounting.observedWorkerDispatchViolationEdgeNames,
      [],
      edgeName
    );
  }
});

test("T-172 no-dispatch test execution projection writes an admitted target carrier", async () => {
  const workspaceRoot = makeRuntimeWorkspace();
  writeFileSync(
    path.join(workspaceRoot, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t172_runtime",
      "  active_tenant: typescript",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: TypeScript",
      "    build_tool: npm",
      "    test_runner: node --test",
      "    test_execution_contract: node --test",
      "    module_structure:",
      "      - runtime"
    ].join("\n"),
    "utf8"
  );
  const start = runtimeStart(workspaceRoot);
  const basis = start.executionContract.basis;
  const outcome = await executeInstalledOperatorStart({
    workspaceRoot,
    start,
    workerTransport: null,
    replayEvents: preclosedEventsBeforeEdge(basis, "prepare_test_execution_surface")
  });

  assert.equal(outcome.status, "worker_invoked");
  assert.equal(outcome.manifest.edgeName, "prepare_test_execution_surface");
  assert.equal(outcome.workerRun, null);
  assert.equal(outcome.postflight.status, "passed");

  const payload = JSON.parse(readFileSync(outcome.manifest.outputFile, "utf8"));
  assert.equal(payload.kind, "sdlc_test_execution_surface_register");
  assert.equal(payload.targetAssetType, "test_execution_surface");
  assert.ok(payload.testExecutionPreparationRows.length > 0);

  const closureDecision = JSON.parse(
    readFileSync(path.join(outcome.archiveRoot, "sdlc_edge_closure_decision.json"), "utf8")
  );
  assert.equal(closureDecision.targetCarrierAdmissionStatus, "admitted");
});
