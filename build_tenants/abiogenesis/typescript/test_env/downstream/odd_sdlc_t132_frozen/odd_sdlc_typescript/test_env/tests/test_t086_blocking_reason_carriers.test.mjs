// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-053
// Validates: T-086
// Validates: T-114
// Validates: B-086

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitSdlcBlockingReason,
  canonicalSdlcPriorGapReasonCode,
  classifySdlcFdFailure,
  constructPostflightGapDossier,
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  installOddSdlcTypescript,
  legacyBlockingReasonCode,
  makeSdlcBlockingReason,
  invokeOddSdlcSpecMethodCommand,
  sha256Text,
  sdlcBlockingReasonFromLegacy
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t086-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-086 Fixture", "", "REQ-T086-001: Carry typed blocking reasons."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "Preserve deterministic failure truth."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    ["# Goals", "", "GOAL-T086-001: Close stringly blocking reason drift."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    ["# Product", "", "PRODUCT-T086-001: Typed failure carrier fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    ["# Imported Sources", "", "- README.md"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-t086.md"),
    ["# Requirements", "", "REQ-T086-002: Blocked postflight has a closed carrier."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    ["# Bootstrap", "", "T-086 fixture bootstrap."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t086_blocking_reason",
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
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- scala_spark: build_tenants/scala_spark"].join("\n"),
    "utf8"
  );
  return root;
}

function materializedSource(root, manifest) {
  const sourcePath = path.join(
    manifest.productMaterialization.tenantRoot,
    "src/main/scala/generated/App.scala"
  );
  const source = "package generated\nobject App { def run(input: String): String = input }\n";
  mkdirSync(path.dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, source, "utf8");
  return {
    kind: "sdlc_materialized_product_file",
    role: "source",
    relativePath: "build_tenants/scala_spark/src/main/scala/generated/App.scala",
    absolutePath: sourcePath,
    digest: sha256Text(source),
    byteCount: Buffer.byteLength(source, "utf8")
  };
}

test("T-086 blocking reason carrier admits closed typed legacy projection", () => {
  const reason = makeSdlcBlockingReason({
    code: "materialized_product_role_missing",
    detail: "source",
    evidenceRefs: ["proof://role"]
  });

  assert.equal(reason.kind, "sdlc_blocking_reason");
  assert.equal(reason.code, "materialized_product_role_missing");
  assert.equal(reason.reasonClass, "missing_evidence");
  assert.equal(reason.lawfulReentryPoint, "same_edge_retry");
  assert.equal(legacyBlockingReasonCode(reason), "materialized_product_role_missing:source");

  const admitted = admitSdlcBlockingReason(JSON.parse(JSON.stringify(reason)));
  assert.deepEqual(admitted, reason);

  const legacy = sdlcBlockingReasonFromLegacy({
    reason: "unsupported_transition:fh_escalation"
  });
  assert.equal(legacy.code, "unsupported_transition");
  assert.equal(legacy.detail, "fh_escalation");
  assert.equal(legacy.reasonClass, "runtime_policy");
});

test("T-188 evaluator process failures do not route to product F_P repair", () => {
  for (const code of [
    "review_grade_assessment_missing",
    "review_grade_assessment_invalid",
    "design_depth_fp_evaluator_process_failed",
    "design_depth_fp_evaluator_rule_blocked",
    "review_grade_evaluator_process_failed",
    "review_grade_evaluator_process_timeout",
    "review_grade_evaluator_mutated_input"
  ]) {
    const reason = makeSdlcBlockingReason({
      code,
      evidenceRefs: [`evidence://${code}`]
    });
    assert.equal(reason.reasonClass, "assurance");
    assert.equal(reason.lawfulReentryPoint, "triage_gap");
  }

  const semanticFinding = makeSdlcBlockingReason({
    code: "review_grade_edge_fulfillment_blocked",
    evidenceRefs: ["evidence://semantic-finding"]
  });
  assert.equal(semanticFinding.reasonClass, "assurance");
  assert.equal(semanticFinding.lawfulReentryPoint, "same_edge_retry");
});

test("T-170 F_D failure severity separates protocol context diagnostics and content", () => {
  const carrierMissing = makeSdlcBlockingReason({
    code: "target_carrier_admission_missing",
    evidenceRefs: ["carrier://missing"]
  });
  const staleTarget = makeSdlcBlockingReason({
    code: "stale_query_domain",
    evidenceRefs: ["query://stale"]
  });
  const failedExecution = makeSdlcBlockingReason({
    code: "test_execution_not_succeeded",
    evidenceRefs: ["execution://failed"]
  });
  const unconsumedShape = makeSdlcBlockingReason({
    code: "worker_report_admission_failed",
    detail: "optional_notes.unexpected",
    evidenceRefs: ["register://diagnostic"]
  });

  assert.deepEqual(classifySdlcFdFailure({ reason: carrierMissing }), {
    kind: "sdlc_fd_failure_classification",
    severityClass: "protocol_invalid",
    downstreamReadStatus: "not_applicable",
    blocksAdmission: true,
    blocksConstruction: false,
    recordsResidualPressure: true,
    routesToFpOrExecution: false
  });
  assert.deepEqual(classifySdlcFdFailure({ reason: staleTarget }), {
    kind: "sdlc_fd_failure_classification",
    severityClass: "construction_context_invalid",
    downstreamReadStatus: "not_applicable",
    blocksAdmission: false,
    blocksConstruction: true,
    recordsResidualPressure: true,
    routesToFpOrExecution: false
  });
  assert.deepEqual(classifySdlcFdFailure({ reason: failedExecution }), {
    kind: "sdlc_fd_failure_classification",
    severityClass: "content_unproven",
    downstreamReadStatus: "not_applicable",
    blocksAdmission: false,
    blocksConstruction: false,
    recordsResidualPressure: true,
    routesToFpOrExecution: true
  });
  assert.deepEqual(
    classifySdlcFdFailure({
      reason: unconsumedShape,
      downstreamRead: false
    }),
    {
      kind: "sdlc_fd_failure_classification",
      severityClass: "diagnostic_shape_invalid",
      downstreamReadStatus: "not_consumed_by_downstream",
      blocksAdmission: false,
      blocksConstruction: false,
      recordsResidualPressure: true,
      routesToFpOrExecution: false
    }
  );
});

test("T-086 legacy retry-frontier keys preserve execution shard detail", () => {
  const first = makeSdlcBlockingReason({
    code: "test_execution_shard_evidence_missing",
    detail: "test-shard-01-api",
    evidenceRefs: ["proof://api"]
  });
  const second = makeSdlcBlockingReason({
    code: "test_execution_shard_evidence_missing",
    detail: "test-shard-02-worker",
    evidenceRefs: ["proof://worker"]
  });

  assert.equal(
    legacyBlockingReasonCode(first),
    "test_execution_shard_evidence_missing:test-shard-01-api"
  );
  assert.equal(
    legacyBlockingReasonCode(second),
    "test_execution_shard_evidence_missing:test-shard-02-worker"
  );
  assert.notEqual(
    canonicalSdlcPriorGapReasonCode(legacyBlockingReasonCode(first)),
    canonicalSdlcPriorGapReasonCode(legacyBlockingReasonCode(second))
  );

  const admitted = sdlcBlockingReasonFromLegacy({
    reason: legacyBlockingReasonCode(first)
  });
  assert.equal(admitted.code, first.code);
  assert.equal(admitted.detail, first.detail);
});

test("T-086/T-114 postflight classifies typed truth without report-prose blockers", () => {
  const root = makeWorkspace();
  const contract = hookContractByEdgeName("derive_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_code_surface",
    vectorIndex: 0,
    contract
  });
  const output = "# Code Surface\n\nSubstantive generated surface.\n";
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, output, "utf8");
  const materialized = materializedSource(root, manifest);
  const report = {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(output),
    summary: "Generated code surface with deliberately invalid materialization basis.",
    unresolvedReasons: ["needs schema derivation"],
    materializedFiles: [materialized],
    executionEvidence: null,
    obligationAssessments: []
  };

  const postflight = evaluateSdlcComputeStage({ manifest, report });
  assert.equal(postflight.status, "passed");
  assert(
    !postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "worker_report_unresolved_reasons_present"
    )
  );
  assert(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "unexpected_product_materialization_for_surface_edge"
    )
  );
  assert(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "obligation_unassessed"
    )
  );
  assert.deepEqual(postflight.blockingReasons, []);
});

test("B-086 postflight gap dossier preserves F_P escalation as lawful reentry", () => {
  const root = makeWorkspace();
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_implementation_design_surface",
    vectorIndex: 0,
    contract
  });
  const blockingReason = makeSdlcBlockingReason({
    code: "edge_closure_residual_pressure",
    detail: "design_completeness_attribute_partial",
    evidenceRefs: ["proof://fd-ambiguity"],
    lawfulReentryPoint: "escalate_to_fp",
    message:
      "F_D observed semantic incompleteness without hard source disambiguation.",
    reasonClass: "assurance"
  });
  const postflight = {
    kind: "sdlc_operator_postflight_result",
    status: "blocked",
    blockingReasons: [legacyBlockingReasonCode(blockingReason)],
    blockingReasonCarriers: [blockingReason],
    evidenceRefs: ["proof://fd-ambiguity"]
  };

  const dossier = constructPostflightGapDossier({ manifest, postflight });

  assert.equal(dossier.retryEligible, true);
  assert.deepEqual(dossier.nextLawfulActions, ["escalate_to_fp"]);
  assert.equal(
    dossier.reasons[0].blockingReason.lawfulReentryPoint,
    "escalate_to_fp"
  );
});

test("T-086 rejected install exposes typed blocking reason", async () => {
  const root = makeWorkspace();
  const outcome = await installOddSdlcTypescript({
    kind: "odd_sdlc_typescript_install_request",
    targetRoot: root,
    packageSourceRoot: path.join(root, "missing-package-source"),
    abgPackageSourceRoot: path.join(root, "missing-abg-source"),
    installedPackageName: "odd-sdlc-t086"
  });

  assert.equal(outcome.kind, "rejected");
  assert.equal(outcome.blockingReason.kind, "sdlc_blocking_reason");
  assert.equal(outcome.blockingReason.code, "install_failed");
  assert.equal(outcome.blockingReason.reasonClass, "install");
  assert.equal(outcome.reason, legacyBlockingReasonCode(outcome.blockingReason));
  assert(readFileSync(path.join(root, "README.md"), "utf8").includes("T-086"));
});

test("T-086 CLI JSON preserves typed summary blocking reasons", async () => {
  const root = makeWorkspace();
  const result = await invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    root,
    "--target",
    "graph_function:bootstrap_release_self_test",
    "--until",
    "blocked",
    "--worker",
    "process://node"
  ]);

  assert.equal(result.status, "ok");
  assert.equal(result.payload.kind, "sdlc_installed_operator_start_outcome");
  assert.equal(result.payload.status, "blocked");
  assert.equal(result.payload.summary.blockingReason, "installed_topology_invalid");
  assert.equal(
    result.payload.summary.blockingReasons[0].kind,
    "sdlc_blocking_reason"
  );
  assert.equal(
    result.payload.summary.blockingReasons[0].code,
    "installed_topology_invalid"
  );
});
