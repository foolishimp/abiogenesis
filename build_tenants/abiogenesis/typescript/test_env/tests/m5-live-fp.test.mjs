import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
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
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

function sha256Bytes(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

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

async function readEvents(path) {
  const bytes = await readFile(path);
  return {
    bytes,
    events: bytes.toString("utf8").trim().split(/\r?\n/u)
      .map((line) => JSON.parse(line)),
  };
}

test("M5 installed CLI admits one genuinely live Claude F_P result", {
  timeout: 180_000,
}, async (context) => {
  const liveCommand = process.env.ABG_TS_LIVE_CLAUDE_COMMAND;
  assert.equal(
    typeof liveCommand === "string" && liveCommand.length > 0,
    true,
    "ABG_TS_LIVE_CLAUDE_COMMAND must name the real Claude executable",
  );

  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-live",
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
      ABG_TS_CLAUDE_COMMAND: liveCommand,
      ABG_TS_FP_TIMEOUT_MS: process.env.ABG_TS_FP_TIMEOUT_MS ?? "120000",
    },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 7, run.stdout);
  assert.equal(
    run.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    run.stdout,
  );
  const outcome = run.outcomes[6];
  assert.deepEqual(outcome.result, {
    kind: "fp_hello_output",
    schemaVersion: "5.0.0",
    resultContractRef: OUTPUT_CONTRACT_REF,
    actorRef: ACTOR_REF,
    message: "Hello World",
  });
  assert.equal(outcome.outputContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(outcome.replayAgreement, true);

  const { bytes: eventBytes, events } = await readEvents(scenario.eventLogPath);
  const binding = events.find(
    (event) => event.kind === "actor_transport_binding_admitted",
  );
  const actorResult = events.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  const processExit = events.find(
    (event) => event.kind === "actor_process_exited",
  );
  assert.notEqual(binding, undefined);
  assert.notEqual(actorResult, undefined);
  assert.notEqual(processExit, undefined);
  assert.equal(binding.payload.command, liveCommand);
  assert.equal(binding.payload.lane, "closed_prompt_proof");
  assert.equal(processExit.payload.status, 0);
  assert.equal(processExit.payload.signal, null);
  assert.equal(actorResult.payload.disposition, "success");
  assert.equal(actorResult.payload.toolCallCount, 0);
  assert.deepEqual(JSON.parse(actorResult.payload.finalOutput), outcome.result);

  const stdoutBytes = await readFile(binding.payload.paths.stdout);
  assert.equal(
    sha256Bytes(stdoutBytes),
    actorResult.payload.artifactDigests.stdout,
  );
  const stream = stdoutBytes.toString("utf8").trim().split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  const init = stream.find(
    (event) => event.type === "system" && event.subtype === "init",
  );
  assert.equal(typeof init?.model === "string" && init.model.length > 0, true);

  const proof = {
    kind: "abi5_m5_live_fp_proof",
    schemaVersion: "5.0.0",
    candidateBasis: harness.candidateBasis,
    programRef: PROGRAM_REF,
    graphFunctionRef: GRAPH_FUNCTION_REF,
    command: liveCommand,
    model: init.model,
    transportBindingRef: binding.payload.transportBindingRef,
    transportBindingDigest: binding.payload.transportBindingDigest,
    actorInvocationRef: actorResult.payload.actorInvocationRef,
    processRef: actorResult.payload.processRef,
    eventCount: events.length,
    eventKinds: events.map((event) => event.kind),
    eventLogDigest: sha256Bytes(eventBytes),
    artifactDigests: actorResult.payload.artifactDigests,
    result: outcome.result,
    publicOutcomeDigest: outcome.outcomeDigest,
    replayDigest: outcome.replayDigest,
    replayAgreement: outcome.replayAgreement,
  };
  const proofDirectory = join(root, "test_env/proof");
  await mkdir(proofDirectory, { recursive: true });
  await writeFile(
    join(proofDirectory, "abi5-m5-live-fp.json"),
    `${JSON.stringify(proof, null, 2)}\n`,
    "utf8",
  );
});
