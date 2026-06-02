import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

async function wait(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function processIsLive(pid) {
  const out = spawnSync("ps", ["-p", String(pid), "-o", "stat="], {
    encoding: "utf8"
  });
  if (out.status !== 0) {
    return false;
  }
  const state = out.stdout.trim();
  return state.length > 0 && !state.startsWith("Z");
}

async function hiddenListingScreenCommand(root) {
  const commandPath = path.join(root, "hidden-listing-screen.sh");
  await writeFile(
    commandPath,
    [
      "#!/bin/sh",
      "set -eu",
      "if [ \"${1:-}\" = \"-ls\" ]; then",
      "  exit 0",
      "fi",
      "if [ \"${1:-}\" = \"-S\" ]; then",
      "  exit 0",
      "fi",
      "if [ \"${1:-}\" = \"-dmS\" ]; then",
      "  shift 2",
      "  ( \"$@\" >> screenlog.0 2>&1 ) &",
      "  exit 0",
      "fi",
      "if [ \"${1:-}\" = \"-L\" ] && [ \"${2:-}\" = \"-dmS\" ]; then",
      "  shift 3",
      "  ( \"$@\" >> screenlog.0 2>&1 ) &",
      "  exit 0",
      "fi",
      "echo \"unsupported fake screen args: $*\" >&2",
      "exit 2",
      ""
    ].join("\n"),
    "utf8"
  );
  await chmod(commandPath, 0o755);
  return commandPath;
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
        [
          "console.log(JSON.stringify({",
          "  type: 'system',",
          "  subtype: 'init',",
          "  session_id: 'fixture-pty-session'",
          "}));",
          "console.log(JSON.stringify({",
          "  type: 'result',",
          "  subtype: 'success',",
          "  result: process.env.ABG_T111_SUPERVISOR_ENV_SENTINEL ?? 'missing'",
          "}));"
        ].join("\n")
      ],
      cwd: archiveRoot,
      env: {
        ...process.env,
        ABG_T111_SUPERVISOR_ENV_SENTINEL: "pty fixture final"
      },
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
    assert.match(traceEvents, /terminal_agent_supervisor_configured/u);
    assert.match(
      traceEvents,
      /pty_terminal_agent_supervisor_local_spawn_worker/u
    );
    assert.match(traceEvents, /terminal_turn_started/u);
    assert.match(traceEvents, /terminal_exit_sentinel_observed/u);
    assert.match(traceEvents, /terminal_turn_completed/u);
    assert.match(traceEvents, /terminal_session_closed/u);

    const terminalTranscript = await readFile(result.paths.terminalTranscript, "utf8");
    assert.match(terminalTranscript, /__ABG_PTY_EXIT_/u);

    const stdout = await readFile(result.paths.stdout, "utf8");
    assert.doesNotMatch(stdout, /__ABG_PTY_EXIT_/u);

    const supervisorConfig = JSON.parse(
      await readFile(
        path.join(archiveRoot, "terminal_session", "agent_supervisor_request.json"),
        "utf8"
      )
    );
    assert.equal(Object.hasOwn(supervisorConfig, "env"), false);
  }
);

test(
  "T-111 pty-terminal executor does not mark a live terminal lost on transient hidden screen listings",
  { skip: process.platform === "win32" },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-hidden-screen-listing");
    const fakeScreenRoot = await mkdtemp(path.join(os.tmpdir(), "abg-t111-fake-screen-"));
    try {
      const terminalScreenCommand = await hiddenListingScreenCommand(fakeScreenRoot);
      const result = await runAgentActorWorkerCallout({
        agentCalloutKind: "agent_worker",
        workerRef: "worker://fixture-pty-hidden-listing",
        executorProfile: "pty-terminal",
        terminalScreenCommand,
        terminalSessionKey: `abg-t111-hidden-${process.pid}-${Date.now()}`,
        command: process.execPath,
        args: [
          "-e",
          [
            "setTimeout(() => {",
            "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: 'hidden listing final' }));",
            "}, 6500);"
          ].join("\n")
        ],
        cwd: archiveRoot,
        env: process.env,
        archiveRoot,
        label: "fixture-pty-hidden-listing",
        parser: "claude-stream-json",
        timeoutMs: 15000,
        terminalPollMs: 50
      });

      assert.equal(result.executorProfile, "pty-terminal");
      assert.equal(result.outcome.kind, "exited");
      assert.equal(result.status, 0);
      assert.equal(result.error, null);
      assert.equal(result.finalOutput, "hidden listing final");

      const traceEvents = await readFile(result.paths.events, "utf8");
      assert.doesNotMatch(traceEvents, /lost_terminal/u);
      assert.match(traceEvents, /terminal_exit_sentinel_observed/u);
    } finally {
      await rm(fakeScreenRoot, { recursive: true, force: true });
    }
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
    assert.match(traceEvents, /terminal_agent_supervisor_configured/u);
    assert.match(traceEvents, /terminal_agent_supervisor_hard_timeout/u);
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
    assert.match(traceEvents, /terminal_agent_supervisor_configured/u);
    assert.match(traceEvents, /terminal_agent_supervisor_inactivity_timeout/u);
    assert.match(traceEvents, /inactivity_timeout_escalated/u);
    assert.match(traceEvents, /terminal_turn_completed/u);
  }
);

test(
  "T-188 pty-terminal supervisor kills a non-cooperative worker child",
  { skip: !SCREEN_AVAILABLE },
  async () => {
    const archiveRoot = await runRoot("pty-terminal-supervisor-kills-child");
    const pidPath = path.join(archiveRoot, "worker.pid");
    const result = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_worker",
      workerRef: "worker://fixture-pty-supervisor-kill-child",
      executorProfile: "pty-terminal",
      terminalSessionKey: `abg-t188-supervisor-kill-${process.pid}-${Date.now()}`,
      command: process.execPath,
      args: [
        "-e",
        [
          "const { writeFileSync } = require('node:fs');",
          "writeFileSync(process.argv[1], String(process.pid));",
          "process.on('SIGTERM', () => {});",
          "setInterval(() => {}, 1000);"
        ].join("\n"),
        pidPath
      ],
      cwd: archiveRoot,
      env: process.env,
      archiveRoot,
      label: "fixture-pty-supervisor-kill-child",
      parser: "generic-text",
      timeoutMs: 5000,
      inactivityTimeoutMs: 250,
      terminationGraceMs: 100
    });

    assert.equal(result.outcome.kind, "inactivity_timeout");
    const childPid = Number.parseInt(await readFile(pidPath, "utf8"), 10);
    assert.equal(Number.isInteger(childPid), true);
    await wait(250);
    assert.equal(processIsLive(childPid), false);

    const traceEvents = await readFile(result.paths.events, "utf8");
    assert.match(traceEvents, /terminal_agent_supervisor_inactivity_timeout/u);
  }
);
