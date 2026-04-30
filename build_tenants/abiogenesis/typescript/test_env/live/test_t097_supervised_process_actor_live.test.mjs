// Validates: REQ-R-ABG3-TRANSPORT-010
// Validates: REQ-R-ABG3-TRANSPORT-012
// Validates: REQ-R-ABG3-TRANSPORT-014
// Validates: T-097

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import {
  deriveRuntimeAggregateProjection,
  invokeSupervisedProcessActor
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  contractForKnownAgent
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildFpBasis } from "../tests/support/m03-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t097_supervised_process_actor_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T097_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "240000", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 240000;
}

function renderArgs(template, replacements) {
  return template.map((arg) =>
    arg
      .replaceAll("{prompt}", replacements.prompt)
      .replaceAll("{output_path}", replacements.outputPath)
  );
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced === null ? trimmed : fenced[1].trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) {
      throw new TypeError("transport response did not contain a JSON object");
    }
    return JSON.parse(candidate.slice(first, last + 1));
  }
}

function livePrompt() {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live worker for ABG T-097.",
    "Confirm that a real Claude subprocess can be observed by the ABG supervised process actor.",
    "The JSON shape must be:",
    "{",
    '  "artifact_kind": "supervised_process_actor_live_probe",',
    '  "artifact_ref": "live://t097/claude-process-actor",',
    '  "agent": "claude",',
    '  "result": "observed"',
    "}"
  ].join("\n");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, "utf8");
}

function invocationForBasis(basis) {
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: "actor-invocation://t097/live/claude",
    basisId: basis.id,
    graphCallId: "graph-call://t097/live",
    frameId: "frame://t097/live",
    vectorIndex: 0,
    edge: "design\u2192code:fp",
    attemptIndex: 1,
    dispatchRef: "dispatch://claude",
    workerId: "worker://claude",
    backendId: "backend://claude",
    resultRef: "result://t097/live/claude"
  });
}

test("T-097 live: Claude subprocess is observed through ABG supervised process actor", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T097_LIVE=1 or CODEX_LIVE_FP=1 to run T-097 live proof");
    return;
  }

  const archiveRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(archiveRoot, { recursive: true });
  const agentKey = liveAgentKey();
  assert.equal(agentKey, "claude", "T-097 live proof only permits Claude lanes");

  const { basis } = buildFpBasis({ dispatchRef: "dispatch://claude" });
  const contract = contractForKnownAgent("claude");
  const prompt = livePrompt();
  const outputPath = path.join(archiveRoot, "claude-output.txt");
  const stdoutPath = path.join(archiveRoot, "worker_stdout.log");
  const stderrPath = path.join(archiveRoot, "worker_stderr.log");
  const processStartedPath = path.join(archiveRoot, "worker_process_started.json");
  const processEventsPath = path.join(archiveRoot, "worker_process_events.jsonl");
  const invocation = invocationForBasis(basis);
  const observedEvents = [];

  await writeText(path.join(archiveRoot, "worker_prompt.txt"), prompt);
  await writeJson(path.join(archiveRoot, "live_config.json"), {
    agentKey,
    enforcedAgent: "claude",
    timeoutMs: transportTimeoutMs(),
    archiveRoot
  });

  try {
    const result = await invokeSupervisedProcessActor({
      invocation,
      command: contract.command,
      args: renderArgs(contract.argsTemplate, { prompt, outputPath }),
      cwd: archiveRoot,
      environment: process.env,
      environmentPolicy: contract.sanitizedEnvironmentPolicy,
      stdoutPath,
      stderrPath,
      stdoutRef: pathToFileURL(stdoutPath).href,
      stderrRef: pathToFileURL(stderrPath).href,
      processStartedPath,
      processEventsPath,
      timeoutMs: transportTimeoutMs(),
      terminationGraceMs: 5000,
      heartbeatMs: 250,
      eventSink: (event) => {
        observedEvents.push(event);
      }
    });
    const stdout = await readFile(stdoutPath, "utf8");
    const stderr = await readFile(stderrPath, "utf8");
    const artifact = extractJsonObject(stdout);
    const projection = deriveRuntimeAggregateProjection(basis, observedEvents);
    const eventKinds = observedEvents.map((event) => event.kind);
    const assertions = {
      statusZero: result.status === 0,
      signalNull: result.signal === null,
      timedOutFalse: result.timedOut === false,
      artifactObserved:
        artifact.artifact_kind === "supervised_process_actor_live_probe" &&
        artifact.agent === "claude" &&
        artifact.result === "observed",
      startObserved: eventKinds[0] === "actor_process_started",
      heartbeatObserved: eventKinds.includes("actor_process_heartbeat"),
      streamObserved: eventKinds.includes("actor_process_stream_observed"),
      exitObserved: eventKinds.includes("actor_process_exited"),
      streamChunkCount: projection.actorProcessStreamRefs.length,
      actorProcessRefCount: projection.actorProcessRefs.length,
      latestHeartbeatIndex:
        projection.actorProcessRefs[0]?.latestHeartbeatIndex ?? null
    };

    await writeJson(path.join(archiveRoot, "process_result.json"), result);
    await writeJson(path.join(archiveRoot, "result_artifact.json"), artifact);
    await writeJson(path.join(archiveRoot, "runtime_projection.json"), projection);
    await writeJson(path.join(archiveRoot, "event_log.json"), observedEvents);
    await writeJson(path.join(archiveRoot, "assertions.json"), assertions);
    await writeText(
      path.join(archiveRoot, "postmortem.md"),
      [
        "# T-097 Live Supervised Process Actor",
        "",
        `- archive: ${archiveRoot}`,
        `- agent: ${agentKey}`,
        `- status: ${String(result.status)}`,
        `- signal: ${String(result.signal)}`,
        `- timedOut: ${String(result.timedOut)}`,
        `- event count: ${String(observedEvents.length)}`,
        `- stdout bytes: ${String(stdout.length)}`,
        `- stderr bytes: ${String(stderr.length)}`,
        "",
        "## Event Kinds",
        "",
        eventKinds.map((kind) => `- ${kind}`).join("\n"),
        "",
        "## Archived Evidence",
        "",
        "- `worker_prompt.txt`",
        "- `worker_stdout.log`",
        "- `worker_stderr.log`",
        "- `worker_process_started.json`",
        "- `worker_process_events.jsonl`",
        "- `process_result.json`",
        "- `result_artifact.json`",
        "- `runtime_projection.json`",
        "- `event_log.json`",
        "- `assertions.json`",
        ""
      ].join("\n")
    );

    assert.equal(result.status, 0);
    assert.equal(result.signal, null);
    assert.equal(result.timedOut, false);
    assert.equal(artifact.artifact_kind, "supervised_process_actor_live_probe");
    assert.equal(artifact.agent, "claude");
    assert.equal(artifact.result, "observed");
    assert.equal(eventKinds[0], "actor_process_started");
    assert.equal(eventKinds.includes("actor_process_stream_observed"), true);
    assert.equal(eventKinds.includes("actor_process_exited"), true);
    assert.equal(
      eventKinds.includes("actor_process_heartbeat"),
      true,
      "live Claude lane should expose pre-exit heartbeat/liveness"
    );
    assert.equal(projection.actorProcessRefs.length, 1);
    assert.equal(projection.actorProcessRefs[0].actorInvocationId, invocation.actorInvocationId);
    assert.equal(projection.actorProcessRefs[0].running, false);
    assert.equal(projection.actorProcessRefs[0].status, 0);
    assert.notEqual(projection.actorProcessRefs[0].latestHeartbeatIndex, null);
    assert.equal(projection.actorProcessRefs[0].stdoutRef, pathToFileURL(stdoutPath).href);
    assert.equal(projection.actorProcessStreamRefs.length >= 1, true);
  } catch (error) {
    await writeJson(path.join(archiveRoot, "failure.json"), {
      message: error instanceof Error ? error.message : String(error),
      archiveRoot
    });
    assert.fail(
      `${error instanceof Error ? error.message : String(error)}\narchive: ${archiveRoot}`
    );
  }
});
