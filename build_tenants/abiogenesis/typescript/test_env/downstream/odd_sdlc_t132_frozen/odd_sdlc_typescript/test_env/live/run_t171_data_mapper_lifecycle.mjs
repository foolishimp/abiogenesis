#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";

import {
  analyzeSdlcFdRunArchive,
  renderSdlcFdRunAnalysisMarkdown
} from "../../build/semantic/code/src/analysis/index.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "../..");
const RUNNER = resolve(SCRIPT_DIR, "run_full_external_data_mapper_sandbox.mjs");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();

const REQUIRED_EDGE_ORDER = Object.freeze([
  "derive_intent_surface",
  "derive_product_surface",
  "derive_goal_surface",
  "derive_requirement_surface",
  "derive_uat_testcases_surface",
  "derive_testcase_authority_surface",
  "derive_feature_decomp_surface",
  "derive_design_surface",
  "derive_scenario_surface",
  "derive_implementation_design_surface",
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "derive_test_design_surface",
  "derive_component_test_surface",
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface",
  "derive_release_depth_parity_surface",
  "prepare_release_surface"
]);

function fail(message, details = null) {
  const suffix = details === null ? "" : `\n${JSON.stringify(details, null, 2)}`;
  throw new Error(`${message}${suffix}`);
}

function parseSummary(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    fail("T-171 data_mapper runner did not emit parseable JSON summary", {
      error: error instanceof Error ? error.message : String(error),
      stdoutPreview: stdout.slice(-4000)
    });
  }
}

function orderedIndexes(edgeSequence, requiredEdges) {
  let searchFrom = 0;
  return requiredEdges.map((edgeName) => {
    const found = edgeSequence.indexOf(edgeName, searchFrom);
    if (found >= 0) {
      searchFrom = found + 1;
    }
    return found;
  });
}

function assertLifecycleAnalysis(summary) {
  const analysis = analyzeSdlcFdRunArchive({
    inspectedRoot: summary.archiveRoot,
    profile: "data_mapper"
  });
  const analysisMarkdown = renderSdlcFdRunAnalysisMarkdown(analysis);
  const reportPath = path.join(summary.archiveRoot, "t171_lifecycle_analysis.md");
  writeFileSync(reportPath, analysisMarkdown, "utf8");

  const edgeSequence = analysis.currentStateTelemetrySummary.graphEdgeSequence;
  const edgeIndexes = orderedIndexes(edgeSequence, REQUIRED_EDGE_ORDER);
  const missing = REQUIRED_EDGE_ORDER.filter((_, index) => edgeIndexes[index] < 0);
  if (missing.length > 0) {
    fail("T-171 lifecycle run did not traverse the required edge order", {
      missing,
      edgeSequence,
      analysisReport: reportPath
    });
  }

  const executionAttempt = analysis.edgeTraversal.find(
    (attempt) => attempt.graphFunctionName === "derive_test_execution_result_surface"
  );
  if (executionAttempt === undefined) {
    fail("T-171 lifecycle run did not admit a test execution result edge", {
      analysisReport: reportPath
    });
  }
  if (executionAttempt.executionEvidenceSource !== "graph_test_execution_result") {
    fail("T-171 execution evidence was not graph-generated test execution evidence", {
      executionEvidenceSource: executionAttempt.executionEvidenceSource,
      analysisReport: reportPath
    });
  }
  if (executionAttempt.executionEvidenceStatus !== "succeeded") {
    fail("T-171 execution evidence did not succeed", {
      executionEvidenceStatus: executionAttempt.executionEvidenceStatus,
      blockingReasonCodes: executionAttempt.blockingReasonCodes,
      analysisReport: reportPath
    });
  }
  if (
    executionAttempt.executionEvidenceReportCount <= 0 ||
    (executionAttempt.executionEvidenceTestsObserved ?? 0) <= 0
  ) {
    fail("T-171 execution evidence lacks concrete report/test counts", {
      executionEvidenceReportCount: executionAttempt.executionEvidenceReportCount,
      executionEvidenceTestsObserved: executionAttempt.executionEvidenceTestsObserved,
      analysisReport: reportPath
    });
  }

  const executionIndex = edgeSequence.indexOf("derive_test_execution_result_surface");
  const releaseIndex = edgeSequence.indexOf("prepare_release_surface");
  if (releaseIndex <= executionIndex) {
    fail("T-171 release did not occur after admitted execution evidence", {
      executionIndex,
      releaseIndex,
      edgeSequence,
      analysisReport: reportPath
    });
  }

  if (analysis.currentStateTelemetrySummary.finalClosureDisposition !== "close") {
    fail("T-171 lifecycle run did not close from execution-backed evidence", {
      finalClosureDisposition:
        analysis.currentStateTelemetrySummary.finalClosureDisposition,
      analysisReport: reportPath
    });
  }

  const assertion = {
    kind: "t171_data_mapper_lifecycle_assertion",
    archiveRoot: summary.archiveRoot,
    analysisReport: reportPath,
    requiredEdges: REQUIRED_EDGE_ORDER,
    executionEvidenceAttemptRef: executionAttempt.operatorRunRef,
    executionEvidenceStatus: executionAttempt.executionEvidenceStatus,
    executionEvidenceCommand: executionAttempt.executionEvidenceCommand,
    executionEvidenceTestsObserved: executionAttempt.executionEvidenceTestsObserved,
    executionEvidencePassedCount: executionAttempt.executionEvidencePassedCount,
    executionEvidenceFailedCount: executionAttempt.executionEvidenceFailedCount,
    finalClosureDisposition:
      analysis.currentStateTelemetrySummary.finalClosureDisposition
  };
  writeFileSync(
    path.join(summary.archiveRoot, "t171_lifecycle_assertion.json"),
    `${JSON.stringify(assertion, null, 2)}\n`,
    "utf8"
  );
  return assertion;
}

function main() {
  const env = {
    ...process.env,
    ODD_SDLC_TS_DATA_MAPPER_LANE_NAME:
      process.env["ODD_SDLC_TS_DATA_MAPPER_LANE_NAME"] ??
      "t171_data_mapper_lifecycle_live",
    ODD_SDLC_TS_DATA_MAPPER_MAX_STEPS:
      process.env["ODD_SDLC_TS_DATA_MAPPER_MAX_STEPS"] ?? "96"
  };
  mkdirSync(path.join(PACKAGE_ROOT, "test_env/test_runs"), { recursive: true });
  const result = spawnSync(process.execPath, [RUNNER], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
    env,
    maxBuffer: 1024 * 1024 * 200,
    timeout: configuredLiveTimeoutMs(
      "ODD_SDLC_TS_T171_LIFECYCLE_TIMEOUT_MS",
      RUNTIME_POLICY.liveHarnessLifecycleCommandTimeoutMs
    )
  });
  writeFileSync(
    path.join(PACKAGE_ROOT, "test_env/test_runs/t171_last_runner_stdout.json"),
    result.stdout ?? "",
    "utf8"
  );
  writeFileSync(
    path.join(PACKAGE_ROOT, "test_env/test_runs/t171_last_runner_stderr.log"),
    result.stderr ?? "",
    "utf8"
  );
  if (result.status !== 0) {
    fail("T-171 data_mapper lifecycle runner failed", {
      status: result.status,
      signal: result.signal,
      stderr: result.stderr?.slice(-4000) ?? ""
    });
  }
  const summary = parseSummary(result.stdout ?? "");
  const assertion = assertLifecycleAnalysis(summary);
  process.stdout.write(`${JSON.stringify(assertion, null, 2)}\n`);
}

main();
