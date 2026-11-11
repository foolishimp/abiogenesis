// The agent CLI's own status rows are its heartbeat/status stream
// (TRANSPORT-025/027, design §2 and §4.1): admitted stdout activity that renews
// the inactivity lease of the active invocation. They are not model progress,
// a retry, a result or a turn boundary. Retry rows keep their meaning, a silent
// actor is still contained, and nothing written after the direct process exits
// is captured or renews. Mechanical local processes; no provider or tool call.
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createWorkerTransportOutputObserver, observeWorkerTransportOutput, runWorkerTransport } from "../../build/code/src/abg/worker_transport.js";
import { constructKnownWorkerTransportContract } from "../../build/code/src/abg/transport_contracts.js";

const row = value => JSON.stringify(value) + "\n";
const SESSION = "00000000-0000-4000-8000-000000000001", UUID = "00000000-0000-4000-8000-000000000002";
// The recorded CLI status row shape: `requesting` at each request start,
// `compacting` every 30 s during a compaction, then a null status.
const STATUS = status => row({ type: "system", subtype: "status", status, session_id: SESSION, uuid: UUID });
const INIT = row({ type: "system", subtype: "init", session_id: SESSION });
const RETRY = row({ type: "system", subtype: "api_retry", attempt: 1, max_retries: 10, retry_delay_ms: 604, error_status: null,
  error: "unknown", session_id: SESSION, uuid: UUID });
const RATE = row({ type: "rate_limit_event", rate_limit_info: { status: "allowed" }, session_id: SESSION, uuid: UUID });
const COMPACT = row({ type: "system", subtype: "compact_boundary", compact_metadata: { trigger: "auto", pre_tokens: 9 }, session_id: SESSION, uuid: UUID });
const ZERO_THINKING = row({ type: "system", subtype: "thinking_tokens", estimated_tokens: 0, estimated_tokens_delta: 0, session_id: SESSION, uuid: UUID });
const DELTA = row({ type: "stream_event", event: { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "a" } } });
const ASSISTANT = row({ type: "assistant", message: { content: [{ type: "text", text: "a" }] } });
const USER = row({ type: "user", message: { content: [{ type: "text", text: "compacted summary" }] } });
const RESULT = row({ type: "result", subtype: "success", is_error: false, result: "done" });

// One capture's class as the native actor owner forms it from the shared decoder.
function chunkClass(decoder, chunk, elapsedMs) {
  const segments = decoder.classifyChunk(chunk);
  return { elapsedMs, progress: segments.some(s => s.progress), heartbeat: segments.some(s => s.heartbeat),
    result: segments.some(s => s.result), turnBoundary: segments.some(s => s.turnBoundary), segments };
}

test("a CLI status row is a heartbeat: not progress, retry, result or turn boundary; other bookkeeping rows stay ignored", () => {
  const bookkeeping = createWorkerTransportOutputObserver(false).classifyChunk([INIT, RETRY, RETRY, RATE, COMPACT, ZERO_THINKING].join(""));
  assert.deepEqual(bookkeeping.map(s => ({ ...s })), [{ end: [INIT, RETRY, RETRY, RATE, COMPACT, ZERO_THINKING].join("").length,
    progress: false, heartbeat: false, result: false, turnBoundary: false }], "init, retry, rate-limit, compact-boundary and zero thinking rows renew nothing");
  const heartbeats = [STATUS("requesting"), STATUS("compacting"), STATUS(null)].join("");
  assert.deepEqual(createWorkerTransportOutputObserver(false).classifyChunk(heartbeats).map(s => ({ ...s })),
    [{ end: heartbeats.length, progress: false, heartbeat: true, result: false, turnBoundary: false }], "status rows are a heartbeat only");

  // The same activity standing per turn whatever the capture widths.
  const rows = [INIT, STATUS("requesting"), RETRY, DELTA, ASSISTANT, STATUS("compacting"), STATUS("compacting"), STATUS(null), COMPACT, USER,
    RATE, ZERO_THINKING, RETRY, STATUS("requesting"), RESULT, STATUS("compacting"), RETRY];
  const text = rows.join("");
  const turns = width => {
    const decoder = createWorkerTransportOutputObserver(false), standing = [];
    let open = { progress: false, heartbeat: false, result: false };
    for (let offset = 0; offset < text.length; offset += width) {
      for (const segment of decoder.classifyChunk(text.slice(offset, offset + width))) {
        for (const key of Object.keys(open)) open[key] ||= segment[key];
        if (segment.turnBoundary) { standing.push(open); open = { progress: false, heartbeat: false, result: false }; }
      }
    }
    return [...standing, open];
  };
  const expected = [{ progress: true, heartbeat: true, result: false }, { progress: true, heartbeat: true, result: false },
    { progress: false, heartbeat: true, result: true }, { progress: false, heartbeat: true, result: false }];
  for (const width of [1, 7, 103, text.length]) assert.deepEqual(turns(width), expected, `capture width ${width}`);

  // Status rows change no progress, retry, tool or result accounting.
  const withStatus = observeWorkerTransportOutput("claude_stream_json", text, false);
  const withoutStatus = observeWorkerTransportOutput("claude_stream_json", rows.filter(r => !r.includes('"subtype":"status"')).join(""), false);
  assert.deepEqual({ ...withStatus, structuredEventCount: null }, { ...withoutStatus, structuredEventCount: null });
  assert.equal(withStatus.structuredEventCount - withoutStatus.structuredEventCount, 6, "each status row stays one structured row");
  assert.deepEqual([withStatus.progressEventCount, withStatus.apiRetryCount], [3, 3]);
});

// A local actor process: writes rows on a plan, then exits, stays silent, or
// leaves a same-group writer behind after its own exit.
const WORKER = `
import { spawn } from "node:child_process";
const rows = JSON.parse(process.env.T287_HEARTBEAT_PLAN), then = process.env.T287_HEARTBEAT_THEN;
const write = text => new Promise(done => process.stdout.write(text, done));
const pause = ms => new Promise(done => setTimeout(done, ms));
process.stdin.resume();
process.stdin.on("end", async () => {
  for (const [delayMs, text] of rows) { await pause(delayMs); await write(text); }
  if (then === "silent") setInterval(() => {}, 1000);
  else if (then === "repeat_last") for (;;) { await pause(100); await write(rows.at(-1)[1]); }
  else if (then === "orphan") {
    spawn(process.execPath, ["-e", process.env.T287_HEARTBEAT_ORPHAN], { stdio: ["ignore", "inherit", "ignore"] });
    process.exit(0);
  } else process.exit(0);
});
`;

async function runActor(context, label, { plan, then, timeoutMs, absoluteTimeoutMs = 20_000, orphan = "" }) {
  const scratch = await mkdtemp(join(tmpdir(), `t287-heartbeat-${label}-`));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const worker = join(scratch, "heartbeat-worker.mjs");
  await writeFile(worker, WORKER, { flag: "wx" });
  const started = performance.now(), decoder = createWorkerTransportOutputObserver(false);
  const captures = [], windows = [];
  let timeoutAt = null;
  const result = await runWorkerTransport({ contract: constructKnownWorkerTransportContract("claude", {
    command: process.execPath, prefixArgs: [worker], environment: {},
  }), prompt: "no model", lane: "closed_prompt_proof", cwd: scratch, archiveRoot: scratch, label,
  timeoutMs, absoluteTimeoutMs, terminationGraceMs: 200,
  environment: { T287_HEARTBEAT_PLAN: JSON.stringify(plan), T287_HEARTBEAT_THEN: then, T287_HEARTBEAT_ORPHAN: orphan },
  observer: {
    classifyStdoutChunk: chunk => {
      const value = chunkClass(decoder, chunk, performance.now() - started);
      captures.push({ chunk, ...value });
      return value;
    },
    onStdoutObserved: (text, window) => { windows.push({ text, window }); return true; },
    onTimeoutObserved: () => { timeoutAt = performance.now() - started; },
  } });
  return { result, captures, windows, timeoutAt, elapsedMs: performance.now() - started,
    archived: await readFile(result.artifacts.stdout.path, "utf8") };
}
const capturesOf = (run, text) => run.captures.filter(c => c.chunk.includes(text));

test("status heartbeats renew the lease of a working actor across an interval longer than its inactivity", { timeout: 30_000 }, async context => {
  const plan = [[0, INIT], [0, STATUS("requesting")], ...Array.from({ length: 8 }, () => [200, STATUS("compacting")]), [200, USER], [0, RESULT]];
  const run = await runActor(context, "renewed", { plan, then: "exit", timeoutMs: 1000 });
  assert.deepEqual([run.result.disposition, run.result.timedOut, run.result.timeoutClass, run.result.status], ["success", false, null, 0],
    "a compaction-shaped heartbeat interval is not contained");
  assert.equal(capturesOf(run, '"status":"compacting"').length, 8);
  assert.equal(run.result.finalOutput, "done");
  assert.deepEqual([run.result.progressEventCount, run.result.apiRetryCount], [1, 0], "only the user row is progress");
});

test("after its last heartbeat a silent actor is contained at its inactivity, and the window carries the heartbeat instant", { timeout: 30_000 }, async context => {
  const plan = [[0, INIT], [0, STATUS("requesting")], ...Array.from({ length: 8 }, () => [200, STATUS("compacting")])];
  const run = await runActor(context, "contained", { plan, then: "silent", timeoutMs: 1000 });
  assert.deepEqual([run.result.disposition, run.result.timedOut, run.result.timeoutClass, run.result.failureClass],
    ["failure", true, "inactivity", "transport_failure"]);
  const heartbeats = capturesOf(run, '"status":"compacting"');
  assert.equal(heartbeats.length, 8, "every heartbeat arrived inside the renewed lease");
  for (const capture of heartbeats) assert.deepEqual(capture.segments.map(s => [s.progress, s.heartbeat, s.result, s.turnBoundary]),
    [[false, true, false, false]]);
  const lastHeartbeat = Math.max(...heartbeats.map(c => c.elapsedMs));
  assert.ok(run.timeoutAt - lastHeartbeat >= 999, `the lease ran from the last heartbeat (${run.timeoutAt} after ${lastHeartbeat})`);
  // The native owner stages this window's last qualifying instant as the stdout activity probe.
  const drained = run.windows.at(-1).window;
  assert.deepEqual([drained.closure, drained.lastQualifyingElapsedMs, drained.resultElapsedMs], ["drain", lastHeartbeat, null]);
  assert.deepEqual([run.result.progressEventCount, run.result.apiRetryCount], [0, 0], "heartbeats are neither progress nor retries");
});

test("retry rows after the request's status row renew nothing: the lease runs from the status row", { timeout: 30_000 }, async context => {
  const run = await runActor(context, "retries", { plan: [[0, INIT], [0, STATUS("requesting")], [100, RETRY]], then: "repeat_last", timeoutMs: 600 });
  assert.deepEqual([run.result.timedOut, run.result.timeoutClass, run.result.failureClass], [true, "inactivity", "transport_failure"],
    "a retry loop does not keep the actor alive until its hard cap");
  const [status] = capturesOf(run, '"status":"requesting"'), retries = capturesOf(run, '"api_retry"');
  assert.ok(retries.length > 1 && retries.every(c => c.elapsedMs > status.elapsedMs));
  for (const capture of retries) assert.equal(capture.segments.some(s => s.progress || s.heartbeat || s.result), false, "a retry row is not activity");
  assert.equal(run.windows.at(-1).window.lastQualifyingElapsedMs, status.elapsedMs, "the last activity is the status row, not a retry");
  assert.ok(run.result.apiRetryCount === retries.length && run.result.progressEventCount === 0, "retries stay retries; none is progress");
});

test("an actor that emits neither progress nor a heartbeat is contained at its declared inactivity", { timeout: 30_000 }, async context => {
  const run = await runActor(context, "silent", { plan: [[0, INIT]], then: "silent", timeoutMs: 400 });
  assert.deepEqual([run.result.timedOut, run.result.timeoutClass, run.result.progressEventCount], [true, "inactivity", 0]);
  assert.ok(run.timeoutAt >= 399 && run.timeoutAt < 10_000);
  assert.equal(run.windows.at(-1).window.lastQualifyingElapsedMs, null, "no admitted activity");
});

test("a heartbeat written after the direct process exits is not captured and renews nothing", { timeout: 30_000 }, async context => {
  const orphan = `const row = ${JSON.stringify(STATUS("orphaned"))};
    setTimeout(() => { const timer = setInterval(() => process.stdout.write(row), 50); setTimeout(() => clearInterval(timer), 1500); }, 300);`;
  const run = await runActor(context, "exited", { plan: [[0, INIT], [0, STATUS("requesting")]], then: "orphan", timeoutMs: 400, orphan });
  assert.deepEqual([run.result.exitObserved, run.result.status, run.result.timedOut, run.result.timeoutClass], [true, 0, false, null]);
  assert.equal(capturesOf(run, '"status":"orphaned"').length, 0, "capture closes at the direct exit");
  assert.equal(run.archived.includes('"status":"orphaned"'), false);
  assert.equal(run.archived, INIT + STATUS("requesting"));
});
