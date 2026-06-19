// Validates: T-171

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitWorkerTransport,
  processLaunchForWorker,
  selectedWorkerExecutorProfile
} from "../../build/semantic/code/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "../..");

function makeFixture(promptText) {
  const dir = mkdtempSync(join(tmpdir(), "t171-pty-"));
  const promptPath = join(dir, "worker_prompt.md");
  writeFileSync(promptPath, promptText, "utf8");
  return Object.freeze({
    promptPath,
    manifestPath: join(dir, "handoff_manifest.json"),
    outputLastMessagePath: join(dir, "worker_last_message.txt"),
    manifest: Object.freeze({ workspaceRoot: dir })
  });
}

test("T-171 default worker executor remains local-spawn unless explicitly configured", () => {
  assert.equal(selectedWorkerExecutorProfile({}), "local-spawn");
  assert.equal(
    selectedWorkerExecutorProfile({
      ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal"
    }),
    "pty-terminal"
  );
  assert.equal(
    selectedWorkerExecutorProfile({
      ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "local-spawn",
      ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal"
    }),
    "local-spawn"
  );
  assert.equal(
    selectedWorkerExecutorProfile({
      ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "unknown-profile"
    }),
    "local-spawn"
  );
});

test("T-171 PTY launch uses prompt-file redirection and terminal transcript mode input", () => {
  const fx = makeFixture("T171-PTY-PROMPT\n");
  const transport = admitWorkerTransport("process://claude");
  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fx.manifest,
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath,
    executorProfile: "pty-terminal"
  });

  assert.equal(launch.command, "/bin/sh");
  assert.equal(launch.stdin, null);
  assert.deepEqual(launch.args.slice(0, 4), [
    "-lc",
    'prompt_file=$1; shift; exec "$@" < "$prompt_file"',
    "odd-sdlc-worker-stdin",
    fx.promptPath
  ]);
  assert.equal(launch.args[4], "claude");
  assert.equal(launch.args.includes("T171-PTY-PROMPT\n"), false);
});

test("T-171 local-spawn launch keeps the faster stdio path as default", () => {
  const fx = makeFixture("T171-LOCAL-PROMPT\n");
  const transport = admitWorkerTransport("process://claude");
  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fx.manifest,
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath,
    executorProfile: selectedWorkerExecutorProfile({})
  });

  assert.equal(launch.command, "claude");
  assert.equal(launch.args[0], "-p");
  assert.equal(launch.stdin, "T171-LOCAL-PROMPT\n");
});

test("T-171 package scripts expose PTY as an explicit live lane, not the default", () => {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8")
  );
  const defaultLive =
    packageJson.scripts["test:scenario:t132-hello-world-js-live"];
  const ptyLive =
    packageJson.scripts["test:scenario:t132-hello-world-js-live:pty"];
  const t171DefaultLive =
    packageJson.scripts["test:t171:hello-world-lifecycle-live"];
  const t171PtyLive =
    packageJson.scripts["test:t171:hello-world-lifecycle-live:pty"];

  assert.equal(typeof defaultLive, "string");
  assert.equal(typeof ptyLive, "string");
  assert.equal(typeof t171DefaultLive, "string");
  assert.equal(typeof t171PtyLive, "string");
  assert.equal(defaultLive.includes("ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"), false);
  assert.equal(defaultLive.includes("ABG_TS_AGENT_EXECUTOR_PROFILE"), false);
  assert.equal(ptyLive.includes("ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE=pty-terminal"), true);
  assert.equal(ptyLive.includes("ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal"), true);
  assert.equal(t171DefaultLive, "npm run test:scenario:t132-hello-world-js-live");
  assert.equal(t171PtyLive, "npm run test:scenario:t132-hello-world-js-live:pty");
});
