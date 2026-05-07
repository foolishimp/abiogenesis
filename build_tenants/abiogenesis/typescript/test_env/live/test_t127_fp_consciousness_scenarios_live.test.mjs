// Validates: T-127
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS
// Validates: REQ-R-ABG3-PROJECTION

import test from "node:test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import {
  runBootstrapInductionScenario,
  runConfiguredPriorityScenario,
  runDownstreamDesignDepthRepairScenario,
  runHookPriorityScenario,
  runMissingInputAdmissionScenario,
  runRecursiveReplayScenario
} from "../sandbox/t127_fp_consciousness/scenarios.mjs";

const LIVE_ARCHIVE_ROOT = path.join(
  process.cwd(),
  "test_env",
  "test_runs",
  "t127_fp_consciousness_live",
  new Date().toISOString().replace(/[:.]/gu, "-")
);

async function liveOptions(scenarioName) {
  const archiveRoot = path.join(LIVE_ARCHIVE_ROOT, scenarioName);
  await mkdir(archiveRoot, { recursive: true });
  return {
    mode: "live",
    archiveRoot
  };
}

test("T-127 live scenario 1: installed CLI consumes configured priority strategy", async () => {
  await runConfiguredPriorityScenario(await liveOptions("01-configured-priority"));
});

test("T-127 live scenario 2: installed CLI consumes GTL hook-derived priority strategy", async () => {
  await runHookPriorityScenario(await liveOptions("02-hook-priority"));
});

test("T-127 live scenario 3: installed CLI reports missing typed input blockers", async () => {
  await runMissingInputAdmissionScenario(await liveOptions("03-missing-input"));
});

test("T-127 live scenario 4: semantic build admits bootstrap typed-asset induction", async () => {
  await runBootstrapInductionScenario(await liveOptions("04-bootstrap-induction"));
});

test("T-127 live scenario 5: semantic build replays recursive construction progress", async () => {
  await runRecursiveReplayScenario(await liveOptions("05-recursive-replay"));
});

test("T-127 live scenario 6: live-equivalent downstream design-depth repair projects typed construction progress", async () => {
  await runDownstreamDesignDepthRepairScenario(
    await liveOptions("06-downstream-design-depth-repair")
  );
});
