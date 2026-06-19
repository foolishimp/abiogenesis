// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-043
// Investigates: B-068

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ENTERPRISE_CORE_COMPONENTS,
  evaluateEnterpriseCoreInventory
} from "../../build/semantic/code/src/qualification/enterprise_core_inventory.js";
import {
  renderEnterpriseCoreOutcomeIterationPostmortem,
  runEnterpriseCoreOutcomeIterationSandbox
} from "../../build/semantic/code/src/qualification/enterprise_core_iteration_sandbox.js";
import {
  assertAbgInstalledSandboxEvidence,
  provisionAbgInstalledSandbox
} from "./abg_installed_workspace.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");

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

function enterpriseCoreArchiveRoot() {
  return path.join(
    PACKAGE_ROOT,
    "test_env/test_runs/b068_enterprise_core_outcome_iteration",
    `${archiveTimestamp()}_pid${process.pid}`
  );
}

function writeEnterpriseCoreArchive(archive, archiveRoot) {
  mkdirSync(archiveRoot, { recursive: true });
  writeFileSync(path.join(archiveRoot, "run.json"), stableJson(archive));
  writeFileSync(
    path.join(archiveRoot, "postmortem.md"),
    renderEnterpriseCoreOutcomeIterationPostmortem(archive)
  );
  writeFileSync(
    path.join(archiveRoot, "stdout.log"),
    [
      `verdict=${archive.verdict}`,
      `lane_verdict=${archive.laneVerdict}`,
      `capability_verdict=${archive.capabilityVerdict}`,
      `success_mode=${archive.successMode}`,
      `reentry_count=${archive.reentryCount}`,
      `abg_installed_workspace=${archive.installedWorkspace.targetRoot}`,
      `actual_sequence=${archive.actualEventSequence.join(" -> ")}`,
      ""
    ].join("\n")
  );
  writeFileSync(
    path.join(archiveRoot, "stderr.log"),
    archive.diagnostics.length === 0 ? "" : `${archive.diagnostics.join("\n")}\n`
  );
  return archiveRoot;
}

test("B-068 deterministic inventory evaluator rejects shallow enterprise-core output", () => {
  const evaluation = evaluateEnterpriseCoreInventory({
    state: {
      sourceComponents: ["ProbeParser"],
      testComponents: [],
      buildEvidence: "missing",
      testEvidence: "missing",
      evidenceRefs: []
    }
  });

  assert.equal(evaluation.kind, "enterprise_core_inventory_evaluation");
  assert.equal(evaluation.status, "blocked");
  assert.deepStrictEqual(evaluation.requiredComponents, ENTERPRISE_CORE_COMPONENTS);
  assert(evaluation.requiredCapabilityIds.includes("b068_plan_probe"));
  assert(evaluation.requiredCapabilityIds.includes("b068_invariant_probe"));
  assert(evaluation.missingSourceComponents.includes("ProbePlanner"));
  assert(evaluation.missingSourceComponents.includes("ProbeRunner"));
  assert(evaluation.missingSourceComponents.includes("ProbeInvariantCheck"));
  assert.deepStrictEqual(evaluation.missingTestComponents, ENTERPRISE_CORE_COMPONENTS);
  assert(evaluation.blockingReasons.includes("missing_governed_build_evidence"));
  assert(evaluation.blockingReasons.includes("missing_governed_test_evidence"));
});

test("B-068 deterministic inventory evaluator rejects ungoverned execution evidence", () => {
  const evaluation = evaluateEnterpriseCoreInventory({
    state: {
      sourceComponents: ENTERPRISE_CORE_COMPONENTS,
      testComponents: ENTERPRISE_CORE_COMPONENTS,
      buildEvidence: "present",
      testEvidence: "present",
      evidenceRefs: ["build-log://ungoverned", "test-output://ungoverned"]
    }
  });

  assert.equal(evaluation.status, "blocked");
  assert.deepStrictEqual(evaluation.missingSourceComponents, []);
  assert.deepStrictEqual(evaluation.missingTestComponents, []);
  assert(evaluation.blockingReasons.includes("ungoverned_build_evidence"));
  assert(evaluation.blockingReasons.includes("ungoverned_test_evidence"));
});

test("B-068 live plugin sandbox proves enterprise-core outcome iteration through ABG retry repair", async () => {
  const baseArchive = runEnterpriseCoreOutcomeIterationSandbox();
  const archiveRoot = enterpriseCoreArchiveRoot();
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot,
    scenarioId: baseArchive.scenarioId
  });
  const archive = {
    ...baseArchive,
    installedWorkspace
  };
  writeEnterpriseCoreArchive(archive, archiveRoot);
  assertAbgInstalledSandboxEvidence(installedWorkspace);

  assert.equal(archive.verdict, "passed");
  assert.equal(archive.laneVerdict, "passed");
  assert.equal(archive.capabilityVerdict, "proved");
  assert.equal(archive.successMode, "iteration_proven");
  assert.equal(archive.outcomeCriteria, "outcome_iteration");
  assert.equal(archive.graphFunctionName, "derive_enterprise_core_code_surface");
  assert.equal(archive.constructorPluginRef.startsWith("plugin://"), true);
  assert.equal(archive.evaluatorPluginRef.startsWith("plugin://"), true);
  assert.equal(archive.reentryCount, 2);
  assert.equal(archive.retryBudgetMaxAttempts, 2);
  assert.equal(archive.attempts.length, 3);
  assert.equal(archive.abgGap, null);
  assert.deepStrictEqual(
    archive.finalArtifact?.sourceComponents,
    ENTERPRISE_CORE_COMPONENTS
  );
  assert.deepStrictEqual(
    archive.finalArtifact?.testComponents,
    ENTERPRISE_CORE_COMPONENTS
  );
  assert.equal(archive.finalArtifact?.buildEvidence, "governed");
  assert.equal(archive.finalArtifact?.testEvidence, "governed");
  assert(archive.finalArtifact?.evidenceRefs.includes("build://odd-sdlc/b068/governed-build"));
  assert(archive.finalArtifact?.evidenceRefs.includes("test-report://odd-sdlc/b068/enterprise-core"));
  assert.equal(archive.diagnostics.length, 0);

  assert(archive.actualEventSequence.includes("closure_denied"));
  assert.equal(
    archive.actualEventSequence.filter(
      (event) => event === "abg_continuation_reopened"
    ).length,
    2
  );
  assert(archive.runtimeEventKinds.includes("retry_repair_planned"));
  assert.deepStrictEqual(archive.runtimeEventKinds, [
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "retry_repair_planned",
    "retry_attempt_opened",
    "continuation_terminated",
    "continuation_reopened",
    "retry_progress_recorded",
    "vector_evaluated",
    "retry_repair_planned",
    "retry_attempt_opened",
    "continuation_terminated",
    "continuation_reopened",
    "retry_progress_recorded",
    "vector_evaluated",
    "vector_closed",
    "terminal_reached"
  ]);

  const firstAttempt = archive.attempts[0];
  const secondAttempt = archive.attempts[1];
  const thirdAttempt = archive.attempts[2];
  assert(firstAttempt);
  assert(secondAttempt);
  assert(thirdAttempt);
  assert.equal(firstAttempt.evaluationStatus, "blocked");
  assert.equal(firstAttempt.handoffEvidence.currentStateAttemptIndex, null);
  assert.deepStrictEqual(firstAttempt.handoffEvidence.unresolvedReasons, []);
  assert(firstAttempt.blockingReasons.includes("missing_source_component:ProbePlanner"));
  assert.equal(secondAttempt.evaluationStatus, "blocked");
  assert.equal(secondAttempt.handoffEvidence.currentStateAttemptIndex, 1);
  assert.deepStrictEqual(secondAttempt.handoffEvidence.currentStateSourceComponents, [
    "ProbeParser"
  ]);
  assert(secondAttempt.handoffEvidence.unresolvedReasons.includes("missing_governed_test_evidence"));
  assert(secondAttempt.blockingReasons.includes("missing_governed_test_evidence"));
  assert(secondAttempt.sourceComponents.includes("ProbeSynthesizer"));
  assert(!secondAttempt.sourceComponents.includes("ProbeInvariantCheck"));
  assert.deepStrictEqual(secondAttempt.testComponents, [
    "ProbeParser",
    "ProbePlanner"
  ]);
  assert.equal(thirdAttempt.evaluationStatus, "accepted");
  assert.equal(thirdAttempt.handoffEvidence.currentStateAttemptIndex, 2);
  assert(thirdAttempt.handoffEvidence.currentStateSourceComponents.includes("ProbeSynthesizer"));
  assert(!thirdAttempt.handoffEvidence.currentStateSourceComponents.includes("ProbeInvariantCheck"));
  assert(thirdAttempt.handoffEvidence.unresolvedReasons.includes("missing_governed_build_evidence"));
  assert.deepStrictEqual(thirdAttempt.blockingReasons, []);
  assert.deepStrictEqual(thirdAttempt.sourceComponents, ENTERPRISE_CORE_COMPONENTS);

  for (const fileName of ["run.json", "postmortem.md", "stdout.log", "stderr.log"]) {
    assert.equal(
      existsSync(path.join(archiveRoot, fileName)),
      true,
      `missing B-068 sandbox archive file ${fileName}`
    );
  }

  const runJson = JSON.parse(readFileSync(path.join(archiveRoot, "run.json"), "utf8"));
  assert.equal(
    runJson.kind,
    "odd_sdlc_enterprise_core_outcome_iteration_sandbox_archive"
  );
  assert.equal(runJson.ticketId, "B-068");
  assert.equal(runJson.laneVerdict, "passed");
  assert.equal(runJson.capabilityVerdict, "proved");
  assert.equal(runJson.successMode, "iteration_proven");
  assert.equal(runJson.attempts[1].handoffEvidence.currentStateAttemptIndex, 1);
  assert.equal(
    runJson.installedWorkspace.kind,
    "odd_sdlc_abg_installed_sandbox_evidence"
  );
  assert.equal(runJson.installedWorkspace.commandProbe.status, 0);
  assert.equal(
    existsSync(path.join(archiveRoot, "abg_install", "install-manifest.json")),
    true
  );
});

test("B-069 non-convergent enterprise-core sandbox archives ABG retry-stop gap", async () => {
  const baseArchive = runEnterpriseCoreOutcomeIterationSandbox({ maxAttempts: 2 });
  const archiveRoot = enterpriseCoreArchiveRoot();
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot,
    scenarioId: `${baseArchive.scenarioId}_retry_stop`
  });
  const archive = {
    ...baseArchive,
    installedWorkspace
  };
  writeEnterpriseCoreArchive(archive, archiveRoot);
  assertAbgInstalledSandboxEvidence(installedWorkspace);

  assert.equal(archive.laneVerdict, "passed");
  assert.equal(archive.capabilityVerdict, "not_proved");
  assert.equal(archive.verdict, "failed");
  assert.equal(archive.successMode, "abg_gap_detected");
  assert.equal(archive.retryBudgetMaxAttempts, 1);
  assert.equal(archive.abgGap?.gap, "abg_retry_repair_stopped:retry_budget_exhausted");
  assert(archive.abgGap?.evidenceRefs.includes("missing_governed_test_evidence"));
  assert(archive.runtimeEventKinds.includes("retry_attempt_stopped"));
  assert(archive.actualEventSequence.includes("abg_retry_attempt_stopped"));

  const runJson = JSON.parse(readFileSync(path.join(archiveRoot, "run.json"), "utf8"));
  assert.equal(runJson.successMode, "abg_gap_detected");
  assert.equal(runJson.abgGap.gap, "abg_retry_repair_stopped:retry_budget_exhausted");
  assert.equal(runJson.capabilityVerdict, "not_proved");
  assert.equal(runJson.verdict, "failed");
  assert.equal(runJson.attempts[1].handoffEvidence.currentStateAttemptIndex, 1);
  assert.equal(runJson.installedWorkspace.commandProbe.status, 0);
  assert.equal(
    existsSync(path.join(archiveRoot, "abg_install", "typescript-installer-manifest.json")),
    true
  );
});
