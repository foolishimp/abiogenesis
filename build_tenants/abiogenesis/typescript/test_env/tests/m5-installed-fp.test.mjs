import assert from "node:assert/strict";
import { appendFile, chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  applyInstalledTranscriptPrefix,
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_REF = "program://abiogenesis/conformance/fp-hello@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-hello@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const REFUSAL_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-refusal@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

function fpInput(subject, transportLane = "closed_prompt_proof") {
  return {
    kind: "fp_hello_instruction",
    schemaVersion: "5.0.0",
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    workerActorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    transportLane,
    subject,
    instruction: "Produce one concise greeting for the declared subject.",
  };
}

async function installWorkerFixture(harness) {
  const bin = join(harness.scratch, "fp-bin");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const subjectLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('Subject: '));",
    "  const subject = subjectLine === undefined ? 'Unknown' : JSON.parse(subjectLine.slice('Subject: '.length));",
    "  const responseMode = process.env.ABG_FP_TEST_RESPONSE;",
    "  const misattributed = responseMode === 'misattributed';",
    "  const missingAttribution = responseMode === 'missing_attribution';",
    "  const invalidJson = responseMode === 'invalid_json';",
    "  const contradictory = responseMode === 'contradictory';",
    "  const extraField = responseMode === 'extra_field';",
    "  const result = {",
    "    kind: 'fp_hello_output',",
    "    schemaVersion: '5.0.0',",
    `    resultContractRef: '${OUTPUT_CONTRACT_REF}',`,
    `    actorRef: misattributed ? 'actor://forged/wrong' : '${ACTOR_REF}',`,
    "    message: contradictory ? `Goodbye ${subject}` : `Hello ${subject}` ,",
    "  };",
    "  if (missingAttribution) delete result.actorRef;",
    "  if (extraField) result.undeclared = true;",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  if (process.env.ABG_FP_TEST_TOOL_EVENT === '1') console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Write', input: { path: 'artifact.txt' } }] } }));",
    "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'candidate ready' }] } }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: invalidJson ? '{not-json' : JSON.stringify(result) }));",
    "  if (process.env.ABG_FP_TEST_EXIT_NONZERO === '1') process.exitCode = 7;",
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

test("M5 installed CLI admits one subprocess-backed F_P leaf through ordinary GTL, HoG, and ABG", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-valid",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: { ABG_TS_CLAUDE_COMMAND: command },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 6, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[5];
  assert.equal(outcome.outputContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(outcome.admittedResultContractRef, OUTPUT_CONTRACT_REF);
  assert.deepEqual(outcome.result, {
    kind: "fp_hello_output",
    schemaVersion: "5.0.0",
    resultContractRef: OUTPUT_CONTRACT_REF,
    actorRef: ACTOR_REF,
    message: "Hello World",
  });
  assert.equal(outcome.replayAgreement, true);

  const events = await readEvents(scenario.eventLogPath);
  const fibre = events.find((event) => event.kind === "c_call_fibre_selected");
  const transportBinding = events.find(
    (event) => event.kind === "actor_transport_binding_admitted",
  );
  const actorOpened = events.find((event) => event.kind === "actor_invocation_started");
  const processStarted = events.find((event) => event.kind === "actor_process_started");
  const processExited = events.find((event) => event.kind === "actor_process_exited");
  const actorClosed = events.find((event) => event.kind === "actor_invocation_closed");
  const artifactObserved = events.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  const evidence = events.find((event) =>
    event.kind === "c_call_evidenced" &&
    event.payload.evidenceClass === "probabilistic_transport");
  const result = events.find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.contractRef === OUTPUT_CONTRACT_REF);
  assert.equal(fibre.payload.regime, "F_P");
  assert.equal(transportBinding.payload.workerBindingRef, WORKER_BINDING_REF);
  assert.equal(transportBinding.payload.implementationBindingRef,
    "implementation-binding://abiogenesis/conformance/fp-hello@5");
  assert.equal(transportBinding.payload.lane, "closed_prompt_proof");
  assert.equal(transportBinding.payload.parser, "claude_stream_json");
  assert.equal(transportBinding.payload.promptTransport, "stdin");
  assert.match(transportBinding.payload.transportContractDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.match(transportBinding.payload.transportBindingDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(actorOpened.causationEventRefs.includes(transportBinding.eventId), true);
  assert.equal(actorOpened.payload.cCallRef, fibre.payload.cCallRef);
  assert.equal(processStarted.payload.actorInvocationRef, actorOpened.payload.actorInvocationRef);
  assert.equal(processExited.payload.processRef, processStarted.payload.processRef);
  assert.equal(actorClosed.payload.disposition, "success");
  assert.equal(evidence.payload.actorRef, ACTOR_REF);
  assert.equal(evidence.payload.workerBindingRef, WORKER_BINDING_REF);
  assert.equal(evidence.payload.transportBindingRef,
    transportBinding.payload.transportBindingRef);
  assert.equal(evidence.payload.transportBindingDigest,
    transportBinding.payload.transportBindingDigest);
  assert.equal(evidence.payload.materializationPlanRef, PLAN_REF);
  assert.equal(evidence.payload.rendererRef, RENDERER_REF);
  assert.equal(evidence.payload.resultContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(evidence.payload.transportDisposition, "success");
  assert.equal(evidence.payload.toolCallCount, 0);
  assert.equal(evidence.payload.exitObserved, true);
  assert.equal(evidence.payload.terminationConfirmed, true);
  for (const field of [
    "actorRef",
    "workerBindingRef",
    "processRef",
    "transportBindingRef",
    "transportBindingDigest",
    "materializationPlanRef",
    "rendererRef",
    "instructionContractRef",
    "resultContractRef",
    "promptDigest",
    "transportDigest",
    "transportLane",
    "disposition",
    "failureClass",
    "processStatus",
    "processSignal",
    "timedOut",
    "exitObserved",
    "terminationConfirmed",
    "structuredEventCount",
    "progressEventCount",
    "toolCallCount",
    "apiRetryCount",
    "stdoutByteLength",
    "stderrByteLength",
  ]) {
    const evidenceField = field === "disposition"
      ? "transportDisposition"
      : field === "failureClass"
        ? "transportFailureClass"
        : field;
    assert.deepEqual(evidence.payload[evidenceField], artifactObserved.payload[field]);
  }
  assert.deepEqual(evidence.payload.signalSequence, artifactObserved.payload.signalSequence);
  assert.deepEqual(evidence.payload.artifactDigests, artifactObserved.payload.artifactDigests);
  assert.match(evidence.payload.promptDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.match(evidence.payload.transportDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(result.payload.value.actorRef, ACTOR_REF);
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  const installedLeaf = await readFile(
    join(scenario.installedRoot, "build/code/src/implementation/fp_hello.js"),
    "utf8",
  );
  assert.equal(installedLeaf.includes("probabilistic_transport_evidence_candidate"), false);
});

test("M5 installed worker_executes lane preserves B-001 capability through ABG admission", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-worker-executes",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World", "worker_executes"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_TEST_TOOL_EVENT: "1",
    },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  const events = await readEvents(scenario.eventLogPath);
  const binding = events.find(
    (event) => event.kind === "actor_transport_binding_admitted",
  );
  const evidence = events.find(
    (event) => event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "probabilistic_transport",
  );
  assert.equal(binding.payload.lane, "worker_executes");
  assert.equal(binding.payload.args.includes("--safe-mode"), false);
  assert.equal(binding.payload.args.includes("--tools"), false);
  assert.equal(evidence.payload.transportLane, "worker_executes");
  assert.equal(evidence.payload.toolCallCount, 1);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 admitted GTL lane overrides ambient process lane selection", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-admitted-lane",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World", "closed_prompt_proof"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_TS_FP_TRANSPORT_LANE: "worker_executes",
      ABG_FP_TEST_TOOL_EVENT: "1",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[5].disposition, "blocked");
  const events = await readEvents(scenario.eventLogPath);
  const binding = events.find(
    (event) => event.kind === "actor_transport_binding_admitted",
  );
  const artifact = events.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  assert.equal(binding.payload.lane, "closed_prompt_proof");
  assert.equal(binding.payload.args.includes("--safe-mode"), true);
  assert.equal(artifact.payload.failureClass, "contract_failure");
  assert.equal(events.some((event) =>
    event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "probabilistic_transport"), false);
  assert.equal(events.at(-1).kind, "run_stopped");
});

test("M5 deterministically salvages a valid result produced before nonzero exit", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-nonzero-salvage",
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
      ABG_FP_TEST_EXIT_NONZERO: "1",
    },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes[5].disposition, "succeeded");
  const events = await readEvents(scenario.eventLogPath);
  const evidence = events.find((event) =>
    event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "probabilistic_transport");
  assert.equal(evidence.payload.transportDisposition, "failure");
  assert.equal(evidence.payload.transportFailureClass, "transport_failure");
  assert.equal(evidence.payload.processStatus, 7);
  assert.equal(events.some((event) =>
    event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === OUTPUT_CONTRACT_REF), true);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 records unavailable worker commands as typed process failure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-command-unavailable",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: join(harness.scratch, "absent-claude-command"),
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[5].disposition, "blocked");
  const events = await readEvents(scenario.eventLogPath);
  assert.equal(events.some((event) => event.kind === "actor_process_spawn_failed"), true);
  assert.equal(events.some((event) => event.kind === "actor_invocation_failed"), true);
  assert.equal(events.at(-1).kind, "run_stopped");
});

test("M5 refuses post-install implementation substitution before HoG execution", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-install-tamper",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const prefix = await applyInstalledTranscriptPrefix(harness, scenario, 5);
  assert.equal(prefix.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  await appendFile(
    join(scenario.installedRoot, "build/code/src/implementation/fp_hello.js"),
    "\n// post-install mutation\n",
    "utf8",
  );

  const outcome = await prefix.publicApi.applyRootPublicInvocation(
    prefix.operationContext,
    scenario.transcript[5],
  );
  assert.notEqual(outcome.disposition, "succeeded");
  assert.equal(
    prefix.operationContext.store.readAll().some(
      (event) => event.kind === "actor_invocation_started",
    ),
    false,
  );
});

test("M5 rejects misattributed F_P output before success-result admission or closure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-misattributed",
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
      ABG_FP_TEST_RESPONSE: "misattributed",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.slice(0, 5).every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[5];
  assert.equal(outcome.disposition, "blocked");
  assert.equal(outcome.admittedResultContractRef, REFUSAL_CONTRACT_REF);
  assert.match(outcome.diagnosticRef, /result-contract-mismatch/u);

  const events = await readEvents(scenario.eventLogPath);
  assert.equal(events.some((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.contractRef === OUTPUT_CONTRACT_REF), false);
  assert.equal(events.some((event) => event.kind === "terminal_reached"), false);
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  const refusal = events.find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.contractRef === REFUSAL_CONTRACT_REF);
  assert.equal(refusal.payload.resultClass, "refusal");
  assert.equal(refusal.payload.value.rejectedStage, "result");
  assert.equal(events.at(-1).kind, "run_stopped");
  assert.equal(events.at(-1).payload.disposition, "blocked");
});

test("M5 rejects syntactically malformed F_P output before success-result admission or closure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-invalid-json",
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
      ABG_FP_TEST_RESPONSE: "invalid_json",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.slice(0, 5).every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[5];
  assert.equal(outcome.disposition, "blocked");
  assert.equal(outcome.admittedResultContractRef, REFUSAL_CONTRACT_REF);
  assert.match(outcome.diagnosticRef, /result-contract-mismatch/u);

  const events = await readEvents(scenario.eventLogPath);
  assert.equal(events.some((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.contractRef === OUTPUT_CONTRACT_REF), false);
  assert.equal(events.some((event) => event.kind === "terminal_reached"), false);
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  const evidence = events.find((event) =>
    event.kind === "c_call_evidenced" &&
    event.payload.evidenceClass === "probabilistic_transport");
  assert.equal(evidence.payload.transportDisposition, "success");
  const refusal = events.find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.contractRef === REFUSAL_CONTRACT_REF);
  assert.equal(refusal.payload.value.rejectedStage, "result");
  assert.equal(events.at(-1).kind, "run_stopped");
  assert.equal(events.at(-1).payload.disposition, "blocked");
});

for (const [responseMode, scenarioLabel] of [
  ["missing_attribution", "missing-attribution"],
  ["contradictory", "contradictory-result"],
  ["extra_field", "undeclared-result-field"],
]) {
  test(`M5 rejects ${scenarioLabel} before success-result admission`, async (context) => {
    const harness = await setupInstalledCliHarness(context, root);
    const command = await installWorkerFixture(harness);
    const scenario = await buildRootCliScenario(
      harness,
      `m5-fp-${scenarioLabel}`,
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
        ABG_FP_TEST_RESPONSE: responseMode,
      },
    });

    assert.equal(run.exitCode, 2, run.stdout);
    assert.equal(run.outcomes[5].disposition, "blocked");
    assert.equal(run.outcomes[5].admittedResultContractRef, REFUSAL_CONTRACT_REF);
    const events = await readEvents(scenario.eventLogPath);
    assert.equal(events.some((event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === OUTPUT_CONTRACT_REF), false);
    assert.equal(events.at(-1).kind, "run_stopped");
    assert.equal(events.at(-1).payload.disposition, "blocked");
  });
}
