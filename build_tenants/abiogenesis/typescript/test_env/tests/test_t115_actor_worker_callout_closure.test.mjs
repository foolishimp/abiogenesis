import test from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertRuntimeEvent,
  constructActorInvocationClosedEvent,
  constructActorInvocationStartedEvent,
  constructActorResultArtifactObservedEvent,
  deriveRuntimeAggregateProjection,
  invokeSupervisedProcessActor
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  runAgentActorWorkerCallout
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";

async function tempWorkspace(label) {
  return await mkdtemp(path.join(tmpdir(), `abg-t115-${label}-`));
}

function invocationForBasis(basis, overrides = {}) {
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: "actor://t115",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: `graph-call:${basis.id}`,
    frameId: basis.frameId ?? `frame:${basis.id}:root`,
    vectorIndex: 0,
    edge: "design→code:fp",
    attemptIndex: 1,
    dispatchRef: "dispatch://t115",
    workerId: basis.runtimeIdentity.workerId,
    backendId: basis.runtimeIdentity.backendId,
    resultRef: "result://t115",
    causationEventRefs: ["dispatch://t115"],
    correlationId: "correlation://t115",
    ...overrides
  });
}

function assertProcessIdentity(event, invocation) {
  assert.equal(event.basisId, invocation.basisId);
  assert.equal(event.graphFunctionId, invocation.graphFunctionId);
  assert.equal(event.runId, invocation.runId);
  assert.equal(event.workKey, invocation.workKey);
  assert.equal(event.graphCallId, invocation.graphCallId);
  assert.equal(event.frameId, invocation.frameId);
  assert.equal(event.vectorIndex, invocation.vectorIndex);
  assert.equal(event.edge, invocation.edge);
  assert.equal(event.actorInvocationId, invocation.actorInvocationId);
  assert.equal(event.workerId, invocation.workerId);
  assert.equal(event.backendId, invocation.backendId);
  assert.deepStrictEqual(event.causationEventRefs, invocation.causationEventRefs);
  assert.equal(event.correlationId, invocation.correlationId);
}

function assertProjectionRuntimeScope(ref, invocation) {
  assert.equal(ref.graphFunctionId, invocation.graphFunctionId);
  assert.equal(ref.graphCallId, invocation.graphCallId);
  assert.equal(ref.frameId, invocation.frameId);
  assert.equal(ref.edge, invocation.edge);
  assert.equal(ref.runId, invocation.runId);
  assert.equal(ref.workKey, invocation.workKey);
  assert.equal(ref.workerId, invocation.workerId);
  assert.equal(ref.backendId, invocation.backendId);
  assert.deepStrictEqual(ref.causationEventRefs, invocation.causationEventRefs);
  assert.equal(ref.correlationId, invocation.correlationId);
}

async function readJson(pathname) {
  return JSON.parse(await readFile(pathname, "utf8"));
}

async function runPtyStartFailureActor({ label, terminalScreenCommand }) {
  const { basis } = buildFpBasis();
  const invocation = invocationForBasis(basis, {
    actorInvocationId: `actor://t115/${label}`,
    correlationId: `correlation://t115/${label}`
  });
  const root = await tempWorkspace(label);
  const stdoutPath = path.join(root, `${label}.stdout.log`);
  const stderrPath = path.join(root, `${label}.stderr.log`);
  const eventsPath = path.join(root, `${label}.events.jsonl`);
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation,
    command: process.execPath,
    args: ["-e", "console.log('should-not-run')"],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processEventsPath: eventsPath,
    executorProfile: "pty-terminal",
    terminalScreenCommand,
    terminalSessionKey: `t115-${label}-${process.pid}-${Date.now()}`,
    timeoutMs: 1000,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });
  return { basis, invocation, root, stdoutPath, stderrPath, eventsPath, observed, result };
}

async function writeFakeScreenThatLaunchFails(root) {
  const fakeScreen = path.join(root, "fake-screen.cjs");
  await writeFile(
    fakeScreen,
    [
      "#!/usr/bin/env node",
      "const fs = require('node:fs');",
      "const args = process.argv.slice(2);",
      "if (args[0] === '-ls') process.exit(0);",
      "if (args[0] === '-S') process.exit(0);",
      "if (args.includes('abg-terminal-probe')) {",
      "  fs.writeFileSync(args.at(-1), 'ok');",
      "  process.exit(0);",
      "}",
      "if (args.includes('abg-pty-terminal')) {",
      "  console.error('fake screen launch denied');",
      "  process.exit(23);",
      "}",
      "console.error('unexpected fake screen args: ' + JSON.stringify(args));",
      "process.exit(24);"
    ].join("\n"),
    "utf8"
  );
  await chmod(fakeScreen, 0o755);
  return fakeScreen;
}

test("T-115 direct actor/worker call-outs persist typed trace metadata", async () => {
  const root = await tempWorkspace("metadata");
  const worker = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker://t115/direct",
    command: process.execPath,
    args: ["-e", "console.log('worker metadata ok')"],
    cwd: root,
    env: {},
    archiveRoot: path.join(root, "worker.trace"),
    label: "worker-metadata",
    timeoutMs: 30000
  });
  assert.equal(worker.agentCalloutKind, "agent_worker");
  assert.equal(worker.workerRef, "worker://t115/direct");
  assert.equal(worker.actorRef, null);
  const workerMeta = await readJson(worker.paths.meta);
  const workerResult = await readJson(worker.paths.result);
  assert.equal(workerMeta.agentCalloutKind, "agent_worker");
  assert.equal(workerMeta.workerRef, "worker://t115/direct");
  assert.equal(workerResult.workerRef, "worker://t115/direct");

  const actor = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_actor",
    actorRef: "actor://t115/direct",
    workerRef: "worker://t115/direct",
    command: process.execPath,
    args: ["-e", "console.log('actor metadata ok')"],
    cwd: root,
    env: {},
    archiveRoot: path.join(root, "actor.trace"),
    label: "actor-metadata",
    timeoutMs: 30000
  });
  const actorMeta = await readJson(actor.paths.meta);
  const actorResult = await readJson(actor.paths.result);
  assert.equal(actor.agentCalloutKind, "agent_actor");
  assert.equal(actor.actorRef, "actor://t115/direct");
  assert.equal(actor.workerRef, "worker://t115/direct");
  assert.equal(actorMeta.agentCalloutKind, "agent_actor");
  assert.equal(actorMeta.actorRef, "actor://t115/direct");
  assert.equal(actorMeta.workerRef, "worker://t115/direct");
  assert.equal(actorResult.actorRef, "actor://t115/direct");
  assert.equal(actorResult.workerRef, "worker://t115/direct");
});

test("T-115 agent transport preserves runtime worker binding in traced evidence", async () => {
  const root = await tempWorkspace("transport-worker-ref");
  const result = await runAgentTransport({
    contract: {
      agentKey: "codex",
      command: process.execPath,
      argsTemplate: ["-e", "console.log('transport worker binding ok')"],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    },
    workerRef: "worker://t115/runtime-binding",
    prompt: "unused",
    cwd: root,
    archiveRoot: root,
    label: "transport-worker-binding",
    timeoutMs: 30000
  });

  assert.equal(result.agentKey, "codex");
  assert.equal(result.workerRef, "worker://t115/runtime-binding");
  assert.equal(result.status, 0);
  const traceResult = await readJson(result.traceResultPath);
  const traceMeta = await readJson(traceResult.paths.meta);
  assert.equal(traceResult.agentCalloutKind, "agent_worker");
  assert.equal(traceResult.workerRef, "worker://t115/runtime-binding");
  assert.equal(traceMeta.workerRef, "worker://t115/runtime-binding");
});

test("T-115 actor lifecycle events preserve the same runtime scope into projection", () => {
  const { basis } = buildFpBasis();
  const invocation = invocationForBasis(basis, {
    actorInvocationId: "actor://t115/lifecycle",
    resultRef: "result://t115/lifecycle",
    correlationId: "correlation://t115/lifecycle"
  });
  const started = constructActorInvocationStartedEvent(invocation);
  const artifactObserved = constructActorResultArtifactObservedEvent({
    invocation,
    artifactRef: "artifact://t115/lifecycle"
  });
  const closed = constructActorInvocationClosedEvent({
    invocation,
    closureStatus: "completed",
    resultRef: invocation.resultRef,
    detail: null
  });

  for (const event of [started, artifactObserved, closed]) {
    assertRuntimeEvent(event);
    assertProcessIdentity(event, invocation);
  }

  const projection = deriveRuntimeAggregateProjection(basis, [
    started,
    artifactObserved,
    closed
  ]);
  assert.equal(projection.actorInvocationRefs.length, 1);
  assert.equal(projection.observedActorArtifactRefs.length, 1);
  assertProjectionRuntimeScope(projection.actorInvocationRefs[0], invocation);
  assertProjectionRuntimeScope(
    projection.observedActorArtifactRefs[0],
    invocation
  );
  assert.equal(
    projection.actorInvocationRefs[0].actorInvocationId,
    invocation.actorInvocationId
  );
  assert.equal(
    projection.observedActorArtifactRefs[0].artifactRef,
    "artifact://t115/lifecycle"
  );
});

test("T-115 local-spawn missing command is a start failure event boundary", async () => {
  const { basis } = buildFpBasis();
  const invocation = invocationForBasis(basis, {
    actorInvocationId: "actor://t115/local-spawn-missing",
    correlationId: "correlation://t115/local-spawn-missing"
  });
  const root = await tempWorkspace("local-spawn-missing");
  const stdoutPath = path.join(root, "missing.stdout.log");
  const stderrPath = path.join(root, "missing.stderr.log");
  const eventsPath = path.join(root, "missing.events.jsonl");
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation,
    command: path.join(root, "missing-command"),
    args: [],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processEventsPath: eventsPath,
    timeoutMs: 500,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.outcome.kind, "process_error");
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    ["actor_process_start_failed", "actor_process_exited"]
  );
  for (const event of observed) {
    assertProcessIdentity(event, invocation);
  }
  assert.equal(observed[0].failureKind, "process_error");
  assert.match(observed[0].detail, /ENOENT/u);
  assert.equal(observed[1].status, null);
  assert.match(observed[1].error ?? "", /ENOENT/u);

  const projection = deriveRuntimeAggregateProjection(basis, observed);
  assert.equal(projection.actorProcessRefs.length, 1);
  const processRef = projection.actorProcessRefs[0];
  assertProjectionRuntimeScope(processRef, invocation);
  assert.equal(processRef.actorInvocationId, invocation.actorInvocationId);
  assert.equal(processRef.startFailed, true);
  assert.equal(processRef.startFailureKind, "process_error");
  assert.match(processRef.startFailureDetail ?? "", /ENOENT/u);
  assert.equal(processRef.running, false);
  assert.equal(processRef.pid, null);
  assert.match(await readFile(eventsPath, "utf8"), /actor_process_start_failed/u);
});

test("T-115 PTY executor-unavailable actor failure is admitted and projected without process_started", async () => {
  const missingScreen = path.join(await tempWorkspace("missing-screen-bin"), "missing-screen");
  const { basis, invocation, observed, result } = await runPtyStartFailureActor({
    label: "executor-unavailable",
    terminalScreenCommand: missingScreen
  });

  assert.equal(result.outcome.kind, "executor_unavailable");
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    ["actor_process_start_failed", "actor_process_exited"]
  );
  for (const event of observed) {
    assertProcessIdentity(event, invocation);
  }
  assert.equal(observed[0].failureKind, "executor_unavailable");
  assert.equal(observed[0].terminalSessionId?.length > 0, true);

  const projection = deriveRuntimeAggregateProjection(basis, observed);
  assert.equal(projection.actorProcessRefs.length, 1);
  const processRef = projection.actorProcessRefs[0];
  assert.equal(processRef.actorInvocationId, invocation.actorInvocationId);
  assert.equal(processRef.workerId, invocation.workerId);
  assert.equal(processRef.backendId, invocation.backendId);
  assert.equal(processRef.startFailed, true);
  assert.equal(processRef.startFailureKind, "executor_unavailable");
  assert.match(processRef.startFailureDetail ?? "", /screen_missing/u);
  assert.equal(processRef.running, false);
  assert.equal(processRef.error, observed[1].error);
});

test("T-115 PTY launch-failed actor failure is admitted and projected without process_started", async () => {
  const fakeScreenRoot = await tempWorkspace("fake-screen");
  const fakeScreen = await writeFakeScreenThatLaunchFails(fakeScreenRoot);
  const { basis, invocation, observed, result } = await runPtyStartFailureActor({
    label: "launch-failed",
    terminalScreenCommand: fakeScreen
  });

  assert.equal(result.outcome.kind, "launch_failed");
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    ["actor_process_start_failed", "actor_process_exited"]
  );
  for (const event of observed) {
    assertProcessIdentity(event, invocation);
  }
  assert.equal(observed[0].failureKind, "launch_failed");
  assert.match(observed[0].detail, /fake screen launch denied/u);

  const projection = deriveRuntimeAggregateProjection(basis, observed);
  assert.equal(projection.actorProcessRefs.length, 1);
  const processRef = projection.actorProcessRefs[0];
  assert.equal(processRef.actorInvocationId, invocation.actorInvocationId);
  assert.equal(processRef.startFailed, true);
  assert.equal(processRef.startFailureKind, "launch_failed");
  assert.match(processRef.startFailureDetail ?? "", /fake screen launch denied/u);
  assert.equal(processRef.running, false);
  assert.equal(processRef.pid, null);
});
