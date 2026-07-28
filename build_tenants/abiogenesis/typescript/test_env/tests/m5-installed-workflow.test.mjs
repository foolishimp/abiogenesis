import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_REF = "program://abiogenesis/conformance/hello-workflow@5";
const WORKFLOW_REF =
  "graph-function://abiogenesis/conformance/hello-workflow@5";
const CHILD_REF =
  "graph-function://abiogenesis/conformance/hello-world@5";

async function readEvents(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

test("M5 installed workflow.C opens one transparent parent and folds one child result back", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-workflow-c",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: WORKFLOW_REF,
      allowlist: [WORKFLOW_REF, CHILD_REF],
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.length, 7);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[6].result, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });
  assert.equal(run.outcomes[6].replayAgreement, true);

  const events = await readEvents(scenario.eventLogPath);
  const cCalls = events.filter((event) => event.kind === "c_call_opened");
  const foldbacks = events.filter((event) => event.kind === "child_foldback_admitted");
  const subTraversalEvidence = events.filter(
    (event) =>
      event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "sub_traversal",
  );
  assert.equal(events.filter((event) => event.kind === "run_segment_opened").length, 1);
  assert.equal(events.filter((event) => event.kind === "graph_call_opened").length, 2);
  assert.equal(events.filter((event) => event.kind === "frame_opened").length, 2);
  assert.equal(cCalls.length, 2);
  assert.equal(foldbacks.length, 1);
  assert.equal(subTraversalEvidence.length, 1);
  assert.equal(
    foldbacks[0].payload.parentCCallRef,
    subTraversalEvidence[0].payload.cCallRef,
  );
  assert.equal(
    foldbacks[0].causationEventRefs.includes(
      foldbacks[0].payload.childTerminalEventRef,
    ),
    true,
  );
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  assert.equal(events.at(-1).kind, "run_closed");
  assert.equal(JSON.stringify(events).includes("CompiledCProgramPlan"), false);
  assert.equal(JSON.stringify(events).includes("compiled_execution"), false);
});

test("M5 installed workflow.C refuses a CatalogView that omits its declared child", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-workflow-child-omitted",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: WORKFLOW_REF,
      allowlist: [WORKFLOW_REF],
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.slice(0, 6).every((outcome) => outcome.disposition === "succeeded"), true);
  assert.notEqual(run.outcomes[6].disposition, "succeeded");
  const events = await readEvents(scenario.eventLogPath);
  assert.equal(events.some((event) => event.kind === "run_segment_opened"), false);
  assert.equal(events.some((event) => event.kind === "c_call_opened"), false);
  assert.equal(events.some((event) => event.kind === "child_foldback_admitted"), false);
});
