import assert from "node:assert/strict";
import { appendFile, chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  applyInstalledTranscriptPrefix,
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";

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

function immutableSnapshot(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) immutableSnapshot(nested);
    Object.freeze(value);
  }
  return value;
}

test("M5 installed CLI admits one subprocess-backed F_P leaf through ordinary GTL, HoG, and ABG", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-valid",
    (payload) => payload,
    {
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: { ABG_TS_CLAUDE_COMMAND: command },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 7, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[6];
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
  const installedAbg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `fp-terminal=${Date.now()}`,
  );
  const prefix = installedAbg.selectValidatedRuntimeEventPrefix(
    immutableSnapshot(events),
    { runId: outcome.runId },
  );
  const quiescence = installedAbg.projectRunQuiescence(prefix);
  assert.equal(quiescence.disposition, "quiescent_for_close");
  assert.deepEqual(quiescence.blockingFluents, []);
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
  const finalHandoff = run.transportResults.at(-1)?.closeHandoff;
  assert.notEqual(finalHandoff, undefined);
  const reopened = installedAbg.reopenEventStore(
    finalHandoff.reopenAuthority,
  );
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `fp-fresh-product=${Date.now()}`,
  );
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: installedAbg,
    product: installedProduct,
    installedPackageRoot: scenario.installedRoot,
    requests: [{
      rowId: "f04_probabilistic_runtime_replay",
      exportName: "replay",
      args: [{ runId: outcome.runId }],
    }],
    store: reopened.store,
  });
  assert.equal(freshProof.retainedRows.length, 1);
  assert.equal(
    freshProof.retainedRows[0].projection.replayDigest,
    outcome.replayDigest,
  );
  assert.equal(
    freshProof.retainedRows[0].projection.runtimeStatus,
    "closed",
  );
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.equal(run.outcomes[6].disposition, "blocked");
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.equal(run.outcomes[6].disposition, "succeeded");
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: join(harness.scratch, "absent-claude-command"),
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[6].disposition, "failed");
  const events = await readEvents(scenario.eventLogPath);
  const spawnFailures = events.filter(
    (event) => event.kind === "actor_process_spawn_failed",
  );
  assert.equal(spawnFailures.length, 1);
  const actorFailures = events.filter(
    (event) =>
      event.kind === "actor_invocation_failed" &&
      event.payload.actorInvocationRef ===
        spawnFailures[0].payload.actorInvocationRef &&
      event.payload.processRef === spawnFailures[0].payload.processRef,
  );
  assert.equal(actorFailures.length, 1);
  const unavailableCCallRef = actorFailures[0].payload.cCallRef;
  const unavailableCCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.payload.cCallRef === unavailableCCallRef,
  );
  assert.equal(unavailableCCalls.length, 1);
  const unavailableFibres = events.filter(
    (event) =>
      event.kind === "c_call_fibre_selected" &&
      event.payload.cCallRef === unavailableCCallRef &&
      event.payload.regime === "F_P",
  );
  assert.equal(unavailableFibres.length, 1);

  const runStops = events.filter((event) => event.kind === "run_stopped");
  assert.equal(runStops.length, 1);
  const runStopped = runStops[0];
  assert.equal(runStopped.payload.disposition, "failed");
  const failedRoutes = events.filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "failed",
  );
  assert.equal(failedRoutes.length, 1);
  const terminalFailedRoutes = failedRoutes.filter(
    (event) => runStopped.causationEventRefs.includes(event.eventId),
  );
  assert.equal(terminalFailedRoutes.length, 1);
  const terminalFailedRoute = terminalFailedRoutes[0];
  assert.deepEqual(runStopped.causationEventRefs, [terminalFailedRoute.eventId]);
  assert.equal(terminalFailedRoute.payload.cCallRef, unavailableCCallRef);

  const failureJudgments = events.filter(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === unavailableCCallRef &&
      event.payload.cCallRef === unavailableCCallRef &&
      event.payload.judgmentRef === terminalFailedRoute.payload.judgmentRef,
  );
  assert.equal(failureJudgments.length, 1);
  const failureJudgment = failureJudgments[0];
  assert.equal(failureJudgment.payload.judgment, "blocked");
  assert.deepEqual(
    terminalFailedRoute.causationEventRefs,
    [failureJudgment.eventId],
  );
  const failureResults = events.filter(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === unavailableCCallRef &&
      event.payload.cCallRef === unavailableCCallRef &&
      event.payload.resultRef === failureJudgment.payload.resultRef,
  );
  assert.equal(failureResults.length, 1);
  const failureResult = failureResults[0];
  assert.equal(failureResult.payload.resultClass, "failure");
  assert.deepEqual(failureJudgment.causationEventRefs, [failureResult.eventId]);
  assert.equal(
    events.some((event) => event.kind === "runtime_failure_observed"),
    false,
  );
});

test("M5 refuses post-install implementation substitution before HoG execution", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-install-tamper",
    (payload) => payload,
    {
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const prefix = await applyInstalledTranscriptPrefix(harness, scenario, 6);
  assert.equal(prefix.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  await appendFile(
    join(scenario.installedRoot, "build/code/src/implementation/fp_hello.js"),
    "\n// post-install mutation\n",
    "utf8",
  );

  const outcome = await prefix.publicApi.applyRootPublicInvocation(
    prefix.operationContext,
    scenario.transcript[6],
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.equal(run.outcomes.slice(0, 6).every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[6];
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.equal(run.outcomes.slice(0, 6).every((outcome) => outcome.disposition === "succeeded"), true);
  const outcome = run.outcomes[6];
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
  assert.equal(
    evidence,
    undefined,
    "a syntactically invalid raw output has no accepted F04-A carrier to evidence",
  );
  const observedArtifact = events.find((event) =>
    event.kind === "actor_result_artifact_observed");
  assert.equal(observedArtifact.payload.disposition, "success");
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
        catalogApplications: [],
        programRef: PROGRAM_REF,
        catalogHandle: GRAPH_FUNCTION_REF,
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
    assert.equal(run.outcomes[6].disposition, "blocked");
    assert.equal(run.outcomes[6].admittedResultContractRef, REFUSAL_CONTRACT_REF);
    const events = await readEvents(scenario.eventLogPath);
    assert.equal(events.some((event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === OUTPUT_CONTRACT_REF), false);
    assert.equal(events.at(-1).kind, "run_stopped");
    assert.equal(events.at(-1).payload.disposition, "blocked");
  });
}
