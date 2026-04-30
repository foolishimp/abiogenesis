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
    graphCallId: "graph-call://t097",
    frameId: "frame://t097",
    vectorIndex: 0,
    edge: "prompt→artifact",
    attemptIndex: 1,
    dispatchRef: "dispatch://test",
    workerId: "worker://node",
    backendId: "backend://node",
    resultRef: "result://t097",
    ...overrides
  });
}

function invocationForBasis(basis) {
  return invocation({
    basisId: basis.id,
    graphCallId: "graph-call://t097",
    frameId: "frame://t097",
    vectorIndex: 0,
    edge: "design→code:fp"
  });
}

async function tempWorkspace() {
  return await mkdtemp(path.join(tmpdir(), "abg-t097-"));
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
  assert.equal(result.timedOut, false);
  assert.equal(await readFile(stdoutPath, "utf8"), "stdout-before-exit\n");
  assert.equal(await readFile(stderrPath, "utf8"), "stderr-before-exit\n");
  assert.ok(result.pid !== null);
  assert.deepStrictEqual(
    observed.map((event) => event.kind).filter((kind) => kind !== "actor_process_heartbeat"),
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
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    [
      "actor_process_started",
      "actor_process_timeout",
      "actor_process_signal_sent",
      "actor_process_exited"
    ]
  );
  assert.equal(observed[2].signal, "SIGTERM");
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
  assert.match(result.error ?? "", /ENOENT/u);
  assert.deepStrictEqual(
    observed.map((event) => event.kind),
    ["actor_process_started", "actor_process_exited"]
  );
  assert.equal(observed[1].status, null);
  assert.match(observed[1].error ?? "", /ENOENT/u);
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
    timeoutMs: 30,
    terminationGraceMs: 30,
    heartbeatMs: 0,
    eventSink: (event) => {
      observed.push(event);
    }
  });

  assert.equal(result.timedOut, true);
  assert.equal(result.signal, "SIGKILL");
  assert.deepStrictEqual(
    observed
      .filter((event) => event.kind === "actor_process_signal_sent")
      .map((event) => event.signal),
    ["SIGTERM", "SIGKILL"]
  );
});

test("T-097 runtime projection exposes process liveness, heartbeat, timeout, and signal sequence", () => {
  const { basis } = buildFpBasis();
  const actor = invocationForBasis(basis);
  const common = {
    basisId: actor.basisId,
    graphCallId: actor.graphCallId,
    frameId: actor.frameId,
    vectorIndex: actor.vectorIndex,
    edge: actor.edge,
    actorInvocationId: actor.actorInvocationId
  };
  const projection = deriveRuntimeAggregateProjection(basis, [
    {
      kind: "actor_process_started",
      ...common,
      command: "node",
      args: ["worker.mjs"],
      cwd: "/workspace/demo",
      pid: 123,
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
      pid: 123,
      stdoutRef: "file:///tmp/stdout.log",
      stderrRef: "file:///tmp/stderr.log",
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
