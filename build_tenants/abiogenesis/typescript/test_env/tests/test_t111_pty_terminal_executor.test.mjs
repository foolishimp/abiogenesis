import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  runAgentActorWorkerCallout
} from "../../build/semantic/code/src/shared/traced_process/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t111_pty_terminal_executor"
);

async function screenAvailable() {
  const out = spawnSync("screen", ["-ls"], { encoding: "utf8" });
  if (out.error !== undefined && out.error !== null) {
    return false;
  }
  const probeRoot = await mkdtemp(path.join(os.tmpdir(), "abg-t111-screen-probe-"));
  const probeId = `abg-t111-probe-${process.pid}-${Date.now()}`;
  try {
    const markerPath = path.join(probeRoot, "marker.txt");
    const probe = spawnSync(
      "screen",
      [
        "-dmS",
        probeId,
        "/bin/sh",
        "-lc",
        "printf ok > \"$1\"",
        "abg-t111-probe",
        markerPath
      ],
      { cwd: probeRoot, encoding: "utf8" }
    );
    if (probe.status !== 0) {
      return false;
    }
    spawnSync("/bin/sh", ["-c", "sleep 0.2"], { encoding: "utf8" });
    try {
      const marker = await readFile(markerPath, "utf8");
      return marker === "ok";
    } catch {
      return false;
    }
  } finally {
    spawnSync("screen", ["-S", probeId, "-X", "quit"], { encoding: "utf8" });
    await rm(probeRoot, { recursive: true, force: true });
  }
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

async function runRoot(label) {
  const root = path.join(TEST_RUNS_ROOT, `${timestampId()}-${label}`);
  await mkdir(root, { recursive: true });
  return root;
}

function nodePrintJsonLinesScript(events) {
  return [
    "const events = ",
    JSON.stringify(events),
    ";",
    "for (const event of events) console.log(JSON.stringify(event));"
  ].join("");
}

const SCREEN_AVAILABLE = await screenAvailable();

test(
  "T-111 pty-terminal executor preserves the traced call-out result and archive contract",
  { skip: !SCREEN_AVAILABLE },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-stream-json");
    const result = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_worker",
      workerRef: "worker://fixture-pty-terminal",
      executorProfile: "pty-terminal",
      terminalSessionKey: `abg-t111-${process.pid}-${Date.now()}`,
      command: process.execPath,
      args: [
        "-e",
        nodePrintJsonLinesScript([
          {
            type: "system",
            subtype: "init",
            session_id: "fixture-pty-session"
          },
          {
            type: "result",
            subtype: "success",
            result: "pty fixture final"
          }
        ])
      ],
      cwd: archiveRoot,
      env: process.env,
      archiveRoot,
      label: "fixture-pty-terminal",
      parser: "claude-stream-json",
      timeoutMs: 30000
    });

    assert.equal(result.executorProfile, "pty-terminal");
    assert.equal(result.streamModel, "terminal-transcript");
    assert.equal(result.outcome.kind, "exited");
    assert.equal(result.status, 0);
    assert.equal(result.finalOutput, "pty fixture final");
    assert.equal(result.structuredEventCount, 2);
    assert.notEqual(result.paths.terminalTranscript, undefined);

    const traceEvents = await readFile(result.paths.events, "utf8");
    assert.match(traceEvents, /terminal_session_started/u);
    assert.match(traceEvents, /terminal_turn_started/u);
    assert.match(traceEvents, /terminal_exit_sentinel_observed/u);
    assert.match(traceEvents, /terminal_turn_completed/u);
    assert.match(traceEvents, /terminal_session_closed/u);

    const terminalTranscript = await readFile(result.paths.terminalTranscript, "utf8");
    assert.match(terminalTranscript, /__ABG_PTY_EXIT_/u);

    const stdout = await readFile(result.paths.stdout, "utf8");
    assert.doesNotMatch(stdout, /__ABG_PTY_EXIT_/u);
  }
);

test(
  "T-111 pty-terminal executor records hard timeout as terminal-session evidence",
  { skip: !SCREEN_AVAILABLE },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-timeout");
    const result = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_worker",
      workerRef: "worker://fixture-pty-timeout",
      executorProfile: "pty-terminal",
      terminalSessionKey: `abg-t111-timeout-${process.pid}-${Date.now()}`,
      command: process.execPath,
      args: ["-e", "setTimeout(() => {}, 10000);"],
      cwd: archiveRoot,
      env: process.env,
      archiveRoot,
      label: "fixture-pty-timeout",
      parser: "generic-text",
      timeoutMs: 300
    });

    assert.equal(result.executorProfile, "pty-terminal");
    assert.equal(result.status, null);
    assert.equal(result.signal, "SIGTERM");
    assert.equal(result.timedOut, true);
    assert.equal(result.outcome.kind, "hard_timeout");

    const traceEvents = await readFile(result.paths.events, "utf8");
    assert.match(traceEvents, /timeout_escalated/u);
    assert.match(traceEvents, /terminal_turn_completed/u);
  }
);

test(
  "T-111 pty-terminal executor preserves long stream-json lines without parser loss",
  { skip: !SCREEN_AVAILABLE },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-long-stream-json");
    const longText = `pty-long-${"x".repeat(2048)}`;
    const result = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_worker",
      workerRef: "worker://fixture-pty-long-json",
      executorProfile: "pty-terminal",
      terminalSessionKey: `abg-t111-long-${process.pid}-${Date.now()}`,
      command: process.execPath,
      args: [
        "-e",
        nodePrintJsonLinesScript([
          {
            type: "system",
            subtype: "init",
            session_id: "fixture-pty-long-session"
          },
          {
            type: "result",
            subtype: "success",
            result: longText
          }
        ])
      ],
      cwd: archiveRoot,
      env: process.env,
      archiveRoot,
      label: "fixture-pty-long-json",
      parser: "claude-stream-json",
      timeoutMs: 30000
    });

    assert.equal(result.status, 0);
    assert.equal(result.outcome.kind, "exited");
    assert.equal(result.finalOutput, longText);
    assert.equal(result.structuredEventCount, 2);
  }
);

test(
  "T-111 pty-terminal executor records inactivity timeout separately from hard timeout",
  { skip: !SCREEN_AVAILABLE },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-inactivity");
    const result = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_worker",
      workerRef: "worker://fixture-pty-inactivity",
      executorProfile: "pty-terminal",
      terminalSessionKey: `abg-t111-inactivity-${process.pid}-${Date.now()}`,
      command: process.execPath,
      args: ["-e", "setTimeout(() => {}, 10000);"],
      cwd: archiveRoot,
      env: process.env,
      archiveRoot,
      label: "fixture-pty-inactivity",
      parser: "generic-text",
      timeoutMs: 10000,
      inactivityTimeoutMs: 300
    });

    assert.equal(result.executorProfile, "pty-terminal");
    assert.equal(result.status, null);
    assert.equal(result.signal, "SIGTERM");
    assert.equal(result.timedOut, false);
    assert.equal(result.inactivityTimedOut, true);
    assert.equal(result.outcome.kind, "inactivity_timeout");

    const traceEvents = await readFile(result.paths.events, "utf8");
    assert.match(traceEvents, /inactivity_timeout_escalated/u);
    assert.match(traceEvents, /terminal_turn_completed/u);
  }
);
