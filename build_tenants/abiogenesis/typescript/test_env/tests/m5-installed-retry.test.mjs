import assert from "node:assert/strict";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_REF = "program://abiogenesis/conformance/fp-retry-hello@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-retry-hello@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

function fpInput(subject) {
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

async function installRetryWorker(harness) {
  const bin = join(harness.scratch, "retry-bin");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "const { existsSync, readFileSync, writeFileSync } = require('node:fs');",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const counterPath = process.env.ABG_FP_RETRY_COUNTER;",
    "  const prior = counterPath && existsSync(counterPath) ? Number(readFileSync(counterPath, 'utf8')) : 0;",
    "  const attempt = prior + 1;",
    "  if (counterPath) writeFileSync(counterPath, String(attempt));",
    "  const subjectLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('Subject: '));",
    "  const subject = subjectLine === undefined ? 'Unknown' : JSON.parse(subjectLine.slice('Subject: '.length));",
    "  const mode = process.env.ABG_FP_RETRY_MODE;",
    "  const result = {",
    "    kind: 'fp_hello_output',",
    "    schemaVersion: '5.0.0',",
    `    resultContractRef: '${OUTPUT_CONTRACT_REF}',`,
    `    actorRef: '${ACTOR_REF}',`,
    "    message: mode === 'contradictory' ? `Goodbye ${subject}` : `Hello ${subject}`,",
    "  };",
    "  const malformed = mode === 'always_malformed' || (mode !== 'contradictory' && attempt === 1);",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: `attempt ${attempt}` }] } }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: malformed ? '{not-json' : JSON.stringify(result) }));",
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

test("M5 installed C.retry re-enters one failed F_P edge with fresh ABG attempt truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-success.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-success",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_RETRY_COUNTER: counterPath,
    },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes[6].disposition, "succeeded");
  assert.equal(await readFile(counterPath, "utf8"), "2");

  const events = await readEvents(scenario.eventLogPath);
  const attempts = events.filter((event) => event.kind === "retry_attempt_opened");
  const progress = events.filter((event) => event.kind === "retry_progress_recorded");
  const calls = events.filter((event) => event.kind === "c_call_opened");
  const judgments = events.filter((event) => event.kind === "c_call_judged");
  const routes = events.filter((event) => event.kind === "traversal_route_admitted");

  assert.deepEqual(attempts.map((event) => event.payload.attempt), [1, 2]);
  assert.deepEqual(attempts.map((event) => event.payload.retryPath), [[1], [2]]);
  assert.equal(progress.length, 1);
  assert.equal(progress[0].payload.failureClass, "contract_failure");
  assert.deepEqual(progress[0].payload.completedAttempts, [1]);
  assert.equal(progress[0].payload.remainingBudget, 1);
  assert.deepEqual(calls.map((event) => event.payload.attempt), [1, 2]);
  assert.notEqual(calls[0].aggregateId, calls[1].aggregateId);
  assert.deepEqual(judgments.map((event) => event.payload.judgment), [
    "retry",
    "advance",
  ]);
  assert.deepEqual(routes.map((event) => event.payload.routeKind), [
    "retry",
    "retry",
    "terminal",
  ]);
  assert.equal(events.filter((event) => event.kind === "actor_invocation_started").length, 2);
  assert.equal(events.some((event) => event.kind === "run_stopped"), false);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 installed C.retry does not reinterpret a semantic contradiction as retryable failure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-contradiction.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-contradiction",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_RETRY_COUNTER: counterPath,
      ABG_FP_RETRY_MODE: "contradictory",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[6].disposition, "blocked");
  assert.equal(await readFile(counterPath, "utf8"), "1");
  const events = await readEvents(scenario.eventLogPath);
  assert.equal(events.filter((event) => event.kind === "retry_attempt_opened").length, 1);
  assert.equal(events.some((event) => event.kind === "retry_progress_recorded"), false);
  assert.equal(events.filter((event) => event.kind === "actor_invocation_started").length, 1);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "traversal_route_admitted")
      .map((event) => event.payload.routeKind),
    ["retry", "blocked"],
  );
  assert.equal(events.at(-1).kind, "run_stopped");
});

test("M5 installed C.retry exhausts its declared budget without a third dispatch", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-exhausted.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-exhausted",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_RETRY_COUNTER: counterPath,
      ABG_FP_RETRY_MODE: "always_malformed",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[6].disposition, "blocked");
  assert.equal(await readFile(counterPath, "utf8"), "2");
  const events = await readEvents(scenario.eventLogPath);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "retry_attempt_opened")
      .map((event) => event.payload.attempt),
    [1, 2],
  );
  assert.equal(events.filter((event) =>
    event.kind === "retry_progress_recorded").length, 1);
  assert.equal(events.filter((event) =>
    event.kind === "actor_invocation_started").length, 2);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "c_call_judged")
      .map((event) => event.payload.judgment),
    ["retry", "blocked"],
  );
  assert.equal(events.at(-1).kind, "run_stopped");
});
