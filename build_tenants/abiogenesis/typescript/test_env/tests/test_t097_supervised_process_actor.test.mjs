import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  deriveRuntimeAggregateProjection,
  invokeSupervisedProcessActor
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";

function invocation(overrides = {}) {
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: "actor-invocation://t097",
    basisId: "basis://t097",
    graphFunctionId: "graph-function://t097",
    runId: "run://t097",
    workKey: "wk://t097",
    graphCallId: "graph-call://t097",
    frameId: "frame://t097",
    vectorIndex: 0,
    edge: "prompt→artifact",
    attemptIndex: 1,
    dispatchRef: "dispatch://test",
    workerId: "worker://node",
    backendId: "backend://node",
    resultRef: "result://t097",
    causationEventRefs: ["dispatch://test"],
    correlationId: "correlation://t097",
    ...overrides
  });
}

function invocationForBasis(basis) {
  return invocation({
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: "graph-call://t097",
    frameId: "frame://t097",
    vectorIndex: 0,
    edge: "design→code:fp"
  });
}

function assertActorProcessIdentity(event, actor = invocation()) {
  assert.equal(event.graphFunctionId, actor.graphFunctionId);
  assert.equal(event.runId, actor.runId);
  assert.equal(event.workKey, actor.workKey);
  assert.equal(event.workerId, actor.workerId);
  assert.equal(event.backendId, actor.backendId);
  assert.deepStrictEqual(event.causationEventRefs, actor.causationEventRefs);
  assert.equal(event.correlationId, actor.correlationId);
}

async function tempWorkspace() {
  return await mkdtemp(path.join(tmpdir(), "abg-t097-"));
}

function actorProcessKinds(events, { includeHeartbeat = false } = {}) {
  return events
    .map((event) => event.kind)
    .filter((kind) =>
      kind.startsWith("actor_process_") &&
      (includeHeartbeat || kind !== "actor_process_heartbeat")
    );
}

function runtimeProbeSources(events) {
  return new Set(
    events
      .filter((event) => event.kind === "runtime_activity_probe_observed")
      .map((event) => event.probeSource)
  );
}

function runtimeInterruptionEvents(events) {
  return events.filter(
    (event) => event.kind === "runtime_external_interruption_observed"
  );
}

test("T-097 supervised process actor streams stdout/stderr and records lifecycle before exit", async () => {
  const root = await tempWorkspace();
  const script = path.join(root, "worker.mjs");
  await writeFile(
    script,
    [
      "process.stdout.write('stdout-before-exit\\n');",
      "setTimeout(() => {",
      "  process.stderr.write('stderr-before-exit\\n');",
      "  process.exit(0);",
      "}, 80);"
    ].join("\n"),
    "utf8"
  );

  const stdoutPath = path.join(root, "worker_stdout.log");
  const stderrPath = path.join(root, "worker_stderr.log");
  const eventPath = path.join(root, "worker_process_events.jsonl");
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation: invocation(),
    command: process.execPath,
    args: [script],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processEventsPath: eventPath,
    timeoutMs: 5000,
    heartbeatMs: 20,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.status, 0);
  assert.equal(result.outcome.kind, "exited");
  assert.equal(result.timedOut, false);
  assert.equal(await readFile(stdoutPath, "utf8"), "stdout-before-exit\n");
  assert.equal(await readFile(stderrPath, "utf8"), "stderr-before-exit\n");
  assert.ok(result.pid !== null);
  assert.deepStrictEqual(
    actorProcessKinds(observed),
    [
      "actor_process_started",
      "actor_process_stream_observed",
      "actor_process_stream_observed",
      "actor_process_exited"
    ]
  );
  assert.ok(
    observed.some((event) => event.kind === "actor_process_heartbeat"),
    "long-running process should record heartbeat before exit"
  );
  const probeSources = runtimeProbeSources(observed);
  assert.equal(probeSources.has("actor_process_lifecycle"), true);
  assert.equal(probeSources.has("local_spawn_stdout"), true);
  assert.equal(probeSources.has("local_spawn_stderr"), true);
  assert.equal(probeSources.has("actor_process_heartbeat"), true);
  assert.equal(result.probeContracts.length >= 4, true);
  for (const event of observed) {
    assertActorProcessIdentity(event);
  }
  assert.ok(
    (await readFile(eventPath, "utf8")).includes("actor_process_stream_observed")
  );
});

test("T-097 supervised process actor times out with governed signal events", async () => {
  const root = await tempWorkspace();
  const script = path.join(root, "worker.mjs");
  await writeFile(
    script,
    "setTimeout(() => process.stdout.write('too-late\\n'), 5000);\n",
    "utf8"
  );

  const stdoutPath = path.join(root, "worker_stdout.log");
  const stderrPath = path.join(root, "worker_stderr.log");
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation: invocation(),
    command: process.execPath,
    args: [script],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    timeoutMs: 30,
    terminationGraceMs: 20,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.timedOut, true);
  assert.equal(result.outcome.kind, "hard_timeout");
  assert.deepStrictEqual(
    actorProcessKinds(observed, { includeHeartbeat: true }),
    [
      "actor_process_started",
      "actor_process_timeout",
      "actor_process_signal_sent",
      "actor_process_exited"
    ]
  );
  const signalEvent = observed.find((event) => event.kind === "actor_process_signal_sent");
  assert.equal(signalEvent?.signal, "SIGTERM");
  assert.equal(runtimeProbeSources(observed).has("actor_process_lifecycle"), true);
  const interruptions = runtimeInterruptionEvents(observed);
  assert.equal(interruptions.length >= 2, true);
  assert.equal(
    interruptions.some(
      (event) =>
        event.interruptionSource === "harness_safety_cap" &&
        event.signal === null
    ),
    true
  );
  assert.equal(
    interruptions.some(
      (event) =>
        event.interruptionSource === "harness_safety_cap" &&
        event.signal === "SIGTERM"
    ),
    true
  );
  for (const event of observed) {
    assertActorProcessIdentity(event);
  }
  assert.notEqual(result.signal, null);
});

test("T-097 supervised process actor records missing command as typed runtime failure evidence", async () => {
  const root = await tempWorkspace();
  const stdoutPath = path.join(root, "worker_stdout.log");
  const stderrPath = path.join(root, "worker_stderr.log");
  const eventPath = path.join(root, "worker_process_events.jsonl");
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation: invocation(),
    command: path.join(root, "missing-command"),
    args: [],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processEventsPath: eventPath,
    timeoutMs: 500,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.status, null);
  assert.equal(result.signal, null);
  assert.equal(result.outcome.kind, "process_error");
  assert.match(result.error ?? "", /ENOENT/u);
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    ["actor_process_start_failed", "actor_process_exited"]
  );
  assert.equal(observed[0].failureKind, "process_error");
  assert.match(observed[0].detail, /ENOENT/u);
  assert.equal(observed[0].command, path.join(root, "missing-command"));
  assert.equal(observed[1].status, null);
  assert.match(observed[1].error ?? "", /ENOENT/u);
  for (const event of observed) {
    assertActorProcessIdentity(event);
  }
  assert.match(await readFile(eventPath, "utf8"), /actor_process_exited/u);
});

test("T-097 supervised process actor escalates timeout from SIGTERM to SIGKILL when needed", async () => {
  const root = await tempWorkspace();
  const script = path.join(root, "worker.mjs");
  await writeFile(
    script,
    [
      "process.on('SIGTERM', () => {",
      "  process.stderr.write('ignored SIGTERM\\n');",
      "});",
      "setInterval(() => {}, 1000);"
    ].join("\n"),
    "utf8"
  );

  const stdoutPath = path.join(root, "worker_stdout.log");
  const stderrPath = path.join(root, "worker_stderr.log");
  const observed = [];
  const result = await invokeSupervisedProcessActor({
    invocation: invocation(),
    command: process.execPath,
    args: [script],
    cwd: root,
    environment: process.env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    timeoutMs: 250,
    terminationGraceMs: 30,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.timedOut, true);
  assert.equal(result.outcome.kind, "hard_timeout");
  assert.equal(result.signal, "SIGKILL");
  assert.deepStrictEqual(
    observed
      .filter((event) => event.kind === "actor_process_signal_sent")
      .map((event) => event.signal),
    ["SIGTERM", "SIGKILL"]
  );
  assert.deepStrictEqual(
    runtimeInterruptionEvents(observed)
      .filter((event) => event.signal !== null)
      .map((event) => event.signal),
    ["SIGTERM", "SIGKILL"]
  );
});

test("T-097 runtime projection exposes process liveness, heartbeat, timeout, and signal sequence", () => {
  const { basis } = buildFpBasis();
  const actor = invocationForBasis(basis);
  const common = {
    basisId: actor.basisId,
    graphFunctionId: actor.graphFunctionId,
    runId: actor.runId,
    workKey: actor.workKey,
    graphCallId: actor.graphCallId,
    frameId: actor.frameId,
    vectorIndex: actor.vectorIndex,
    edge: actor.edge,
    actorInvocationId: actor.actorInvocationId,
    workerId: actor.workerId,
    backendId: actor.backendId,
    causationEventRefs: actor.causationEventRefs,
    correlationId: actor.correlationId
  };
  const projection = deriveRuntimeAggregateProjection(basis, [
    {
      kind: "actor_process_started",
      ...common,
      command: "node",
      args: ["worker.mjs"],
      cwd: "/workspace/demo",
      pid: 123,
      terminalSessionId: "terminal://t097/success",
      timeoutMs: 70,
      stdoutRef: "file:///tmp/stdout.log",
      stderrRef: "file:///tmp/stderr.log"
    },
    {
      kind: "actor_process_heartbeat",
      ...common,
      heartbeatIndex: 0,
      elapsedMs: 25
    },
    {
      kind: "actor_process_heartbeat",
      ...common,
      heartbeatIndex: 1,
      elapsedMs: 55
    },
    {
      kind: "actor_process_timeout",
      ...common,
      timeoutMs: 70,
      elapsedMs: 71
    },
    {
      kind: "actor_process_signal_sent",
      ...common,
      signal: "SIGTERM",
      elapsedMs: 72
    },
    {
      kind: "actor_process_signal_sent",
      ...common,
      signal: "SIGKILL",
      elapsedMs: 104
    },
    {
      kind: "actor_process_exited",
      ...common,
      status: null,
      signal: "SIGKILL",
      elapsedMs: 110,
      timedOut: true,
      error: null
    }
  ]);

  assert.deepStrictEqual(projection.actorProcessRefs, [
    {
      vectorIndex: 0,
      actorInvocationId: actor.actorInvocationId,
      graphFunctionId: actor.graphFunctionId,
      graphCallId: actor.graphCallId,
      frameId: actor.frameId,
      edge: actor.edge,
      runId: actor.runId,
      workKey: actor.workKey,
      workerId: actor.workerId,
      backendId: actor.backendId,
      causationEventRefs: actor.causationEventRefs,
      correlationId: actor.correlationId,
      pid: 123,
      stdoutRef: "file:///tmp/stdout.log",
      stderrRef: "file:///tmp/stderr.log",
      startFailed: false,
      startFailureKind: null,
      startFailureDetail: null,
      terminalSessionId: "terminal://t097/success",
      running: false,
      latestHeartbeatIndex: 1,
      latestHeartbeatElapsedMs: 55,
      timeoutObserved: true,
      timeoutMs: 70,
      timeoutElapsedMs: 71,
      signalSequence: [
        { signal: "SIGTERM", elapsedMs: 72 },
        { signal: "SIGKILL", elapsedMs: 104 }
      ],
      status: null,
      signal: "SIGKILL",
      timedOut: true,
      error: null
    }
  ]);
});
