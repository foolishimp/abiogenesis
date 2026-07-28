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
const PROGRAM_REF =
  "program://abiogenesis/conformance/fp-fd-compose@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-fd-compose@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

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
  const bin = join(harness.scratch, "fp-fd-compose-bin");
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

test("M5 installed GTL composes F_P then F_D without changing execution authority", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-fd-compose",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: instruction("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: { ABG_TS_CLAUDE_COMMAND: command },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 7, run.stdout);
  assert.equal(
    run.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
  );
  assert.deepEqual(run.outcomes[6].result, {
    kind: "fp_hello_output",
    schemaVersion: "5.0.0",
    resultContractRef: OUTPUT_CONTRACT_REF,
    actorRef: ACTOR_REF,
    message: "Hello World",
  });
  assert.equal(run.outcomes[6].outputContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(run.outcomes[6].replayAgreement, true);

  const events = await readEvents(scenario.eventLogPath);
  const opened = events.filter((event) => event.kind === "c_call_opened");
  const fibres = events.filter(
    (event) => event.kind === "c_call_fibre_selected",
  );
  const evidence = events.filter((event) => event.kind === "c_call_evidenced");
  const results = events.filter(
    (event) => event.kind === "c_call_result_admitted",
  );
  const judgments = events.filter((event) => event.kind === "c_call_judged");

  assert.equal(opened.length, 2);
  assert.equal(fibres.length, 2);
  assert.equal(evidence.length, 2);
  assert.equal(results.length, 2);
  assert.equal(judgments.length, 2);
  assert.deepEqual(fibres.map((event) => event.payload.regime), ["F_P", "F_D"]);
  assert.deepEqual(
    evidence.map((event) => event.payload.evidenceClass),
    ["probabilistic_transport", "deterministic"],
  );
  assert.equal(
    new Set(fibres.map((event) => event.payload.compositionRef)).size,
    1,
  );
  assert.match(
    fibres[0].payload.compositionRef,
    /^graph-function-application:\/\/abiogenesis\//u,
  );
  assert.deepEqual(results[0].payload.value, results[1].payload.value);
  assert.equal(
    events.filter((event) => event.kind === "actor_invocation_started").length,
    1,
  );
  assert.equal(events.filter((event) => event.kind === "terminal_reached").length, 1);
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  assert.equal(
    events.some((event) =>
      JSON.stringify(event).includes("CompiledCProgramPlan") ||
      JSON.stringify(event).includes("publicControlLoop")),
    false,
  );
});
