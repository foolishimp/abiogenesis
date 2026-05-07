// Validates: T-127
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS
// Validates: REQ-R-ABG3-PROJECTION

import test from "node:test";

import {
  runBootstrapInductionScenario,
  runConfiguredPriorityScenario,
  runDownstreamDesignDepthRepairScenario,
  runHookPriorityScenario,
  runMissingInputAdmissionScenario,
  runRecursiveReplayScenario
} from "./t127_fp_consciousness/scenarios.mjs";

test("T-127 sandbox scenario 1: configured priority ranks the release-blocking graph function", async () => {
  await runConfiguredPriorityScenario({ mode: "sandbox" });
});

test("T-127 sandbox scenario 2: GTL hook policy derives the priority scheme", async () => {
  await runHookPriorityScenario({ mode: "sandbox" });
});

test("T-127 sandbox scenario 3: missing typed input blocks an otherwise highest-value action", async () => {
  await runMissingInputAdmissionScenario({ mode: "sandbox" });
});

test("T-127 sandbox scenario 4: bootstrap induction admits a typed-asset construction intent", async () => {
  await runBootstrapInductionScenario({ mode: "sandbox" });
});

test("T-127 sandbox scenario 5: recursive construction replay projects progress then stagnation", async () => {
  await runRecursiveReplayScenario({ mode: "sandbox" });
});

test("T-127 sandbox scenario 6: downstream design-depth repair projects typed construction progress", async () => {
  await runDownstreamDesignDepthRepairScenario({ mode: "sandbox" });
});
