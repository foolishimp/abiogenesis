import assert from "node:assert/strict";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FP_PROGRAM_REF = "program://abiogenesis/conformance/fp-hello@5";
const FP_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-hello@5";
const FD_PROGRAM_REF = "program://abiogenesis/conformance/fd-fp-hello@5";
const FD_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fd-fp-hello@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";
const SHARED_LOCUS_REF =
  "node://abiogenesis/conformance/fp-hello/fp-leaf@5";

function instruction(subject) {
  return {
    kind: "fp_hello_instruction",
    schemaVersion: "5.0.0",
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    workerActorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    transportLane: "closed_prompt_proof",
    subject,
    instruction: "Produce one concise greeting for the declared subject.",
  };
}

async function installWorkerFixture(harness) {
  const bin = join(harness.scratch, "fibre-bin");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const line = prompt.split(/\\r?\\n/).find((value) => value.startsWith('Subject: '));",
    "  const subject = line === undefined ? 'Unknown' : JSON.parse(line.slice('Subject: '.length));",
    "  const result = { kind: 'fp_hello_output', schemaVersion: '5.0.0',",
    `    resultContractRef: '${OUTPUT_CONTRACT_REF}', actorRef: '${ACTOR_REF}',`,
    "    message: `Hello ${subject}` };",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) }));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function readEvents(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

function cCallSpine(events) {
  const opened = events.find((event) => event.kind === "c_call_opened");
  assert.notEqual(opened, undefined);
  const kinds = new Set([
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  return events.filter(
    (event) => event.aggregateId === opened.aggregateId && kinds.has(event.kind),
  );
}

function locusShape(opened) {
  return {
    callClass: opened.payload.callClass,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: opened.payload.stageRole,
    batchRef: opened.payload.batchRef,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
  };
}

test("M5 installed fibre substitution changes the interior but preserves the C-call spine", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const input = instruction("World");
  const fdScenario = await buildRootCliScenario(
    harness,
    "m5-fibre-fd",
    (payload) => payload,
    {
      programRef: FD_PROGRAM_REF,
      graphFunctionRef: FD_GRAPH_FUNCTION_REF,
      input,
    },
  );
  const fpScenario = await buildRootCliScenario(
    harness,
    "m5-fibre-fp",
    (payload) => payload,
    {
      programRef: FP_PROGRAM_REF,
      graphFunctionRef: FP_GRAPH_FUNCTION_REF,
      input,
    },
  );

  const fdRun = await runInstalledCli(harness, fdScenario);
  const fpRun = await runInstalledCli(harness, fpScenario, {
    environment: { ABG_TS_CLAUDE_COMMAND: command },
  });
  assert.equal(fdRun.exitCode, 0, fdRun.stdout);
  assert.equal(fpRun.exitCode, 0, fpRun.stdout);
  assert.deepEqual(fdRun.outcomes[6].result, fpRun.outcomes[6].result);
  assert.equal(fdRun.outcomes[6].outputContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(fpRun.outcomes[6].outputContractRef, OUTPUT_CONTRACT_REF);

  const fdEvents = await readEvents(fdScenario.eventLogPath);
  const fpEvents = await readEvents(fpScenario.eventLogPath);
  const fdSpine = cCallSpine(fdEvents);
  const fpSpine = cCallSpine(fpEvents);
  assert.deepEqual(
    fdSpine.map((event) => event.kind),
    [
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
    ],
  );
  assert.deepEqual(
    fpSpine.map((event) => event.kind),
    fdSpine.map((event) => event.kind),
  );
  assert.deepEqual(locusShape(fdSpine[0]), locusShape(fpSpine[0]));
  assert.equal(fdSpine[0].payload.programLocusRef, SHARED_LOCUS_REF);
  assert.equal(fdSpine[1].payload.regime, "F_D");
  assert.equal(fpSpine[1].payload.regime, "F_P");
  assert.equal(fdSpine[2].payload.evidenceClass, "deterministic");
  assert.equal(fpSpine[2].payload.evidenceClass, "probabilistic_transport");
  assert.equal(
    fdEvents.some((event) => event.kind === "actor_invocation_started"),
    false,
  );
  assert.equal(
    fpEvents.some((event) => event.kind === "actor_invocation_started"),
    true,
  );
  assert.deepEqual(
    fdEvents.filter((event) => event.kind === "traversal_route_admitted")
      .map((event) => event.payload.routeKind),
    fpEvents.filter((event) => event.kind === "traversal_route_admitted")
      .map((event) => event.payload.routeKind),
  );
  assert.equal(fdEvents.at(-1).kind, "run_closed");
  assert.equal(fpEvents.at(-1).kind, "run_closed");
});

test("M5 fibre-equivalent contracts cannot substitute an unowned GraphFunction", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fibre-cross-wire",
    (payload) => payload,
    {
      programRef: FD_PROGRAM_REF,
      graphFunctionRef: FP_GRAPH_FUNCTION_REF,
      allowlist: [FP_GRAPH_FUNCTION_REF],
      input: instruction("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.slice(0, 6).every(
    (outcome) => outcome.disposition === "succeeded",
  ), true);
  assert.equal(run.outcomes[6].disposition, "refused");
  assert.equal(run.outcomes[6].runId, null);
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.deepEqual(
    events.map((event) => event.kind),
    ["public_operation_artifact_admitted", "public_operation_artifact_admitted"],
  );
});
