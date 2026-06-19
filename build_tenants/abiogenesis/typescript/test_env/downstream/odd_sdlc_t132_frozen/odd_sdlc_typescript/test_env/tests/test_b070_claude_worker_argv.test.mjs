// Validates: REQ-F-ODDSDLC-052
// Validates: REQ-F-ODDSDLC-053
// Investigates: B-070

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  admitWorkerTransport,
  argsForWorker,
  constrainClaudeProcessLaunchTools,
  parserForWorkerTransport,
  processLaunchForWorker,
  selectedWorkerExecutorProfile,
  stdinForWorker
} from "../../build/semantic/code/src/index.js";

function makeFixture(promptText) {
  const dir = mkdtempSync(join(tmpdir(), "b070-"));
  const promptPath = join(dir, "worker_prompt.md");
  writeFileSync(promptPath, promptText, "utf8");
  return {
    dir,
    promptPath,
    manifestPath: join(dir, "handoff_manifest.json"),
    outputLastMessagePath: join(dir, "worker_last_message.txt"),
    workspaceRoot: dir
  };
}

function fakeManifest(workspaceRoot) {
  return Object.freeze({ workspaceRoot });
}

test("B-070 process://claude lowers to stream-json print argv with prompt on stdin", () => {
  const fx = makeFixture("CLAUDE-PROMPT-CONTENT-MARKER\nbody.\n");
  const transport = admitWorkerTransport("process://claude");
  assert.equal(transport.agentKey, "claude");
  assert.equal(parserForWorkerTransport(transport), "claude-stream-json");
  assert.equal(
    selectedWorkerExecutorProfile({
      ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal"
    }),
    "pty-terminal"
  );

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "-p", "first arg should be the headless print flag");
  assert.ok(
    !args.includes("--bare"),
    "Claude headless workers must keep normal auth available; bare mode drops keychain auth"
  );
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CLAUDE-PROMPT-CONTENT-MARKER\nbody.\n",
    "Claude reads prompt content from stdin instead of argv"
  );
  assert.ok(
    args.includes("--output-format"),
    "ABG Claude argv should include --output-format for stable stdout shape"
  );
  const outputFormatIndex = args.indexOf("--output-format");
  assert.equal(
    args[outputFormatIndex + 1],
    "stream-json",
    "ABG Claude argv must use realtime stream-json"
  );
  assert.ok(
    !args.includes("--include-partial-messages"),
    "partial-message handling is not odd_sdlc transport law"
  );
  assert.ok(
    args.includes("--verbose"),
    "ABG Claude stream-json output requires --verbose in print mode"
  );
  assert.ok(
    args.includes("--disable-slash-commands"),
    "Claude headless workers must not inherit ambient skills or slash-command surfaces"
  );
  assert.ok(
    args.includes("--no-session-persistence"),
    "Claude headless workers must not persist or resume ambient sessions"
  );
  assert.ok(
    args.includes("--strict-mcp-config"),
    "Claude headless workers must use only the declared MCP config"
  );
  assert.ok(args.includes("--mcp-config"));
  const mcpConfigIndex = args.indexOf("--mcp-config");
  assert.equal(args[mcpConfigIndex + 1], "{\"mcpServers\":{}}");
  assert.ok(args.includes("--setting-sources"));
  const settingSourcesIndex = args.indexOf("--setting-sources");
  assert.equal(args[settingSourcesIndex + 1], "project,local");
  assert.ok(
    args.includes("--permission-mode"),
    "argv must declare permission mode so the worker can use Write/Read tools without interactive approval"
  );
  const pmIndex = args.indexOf("--permission-mode");
  assert.equal(args[pmIndex + 1], "bypassPermissions");
  assert.ok(
    !args.includes("--disallowedTools"),
    "Claude headless workers must not pass stale unsupported tool-deny entries"
  );
  assert.ok(
    !args.includes("advisor"),
    "advisor is not a known Claude worker tool and can leave headless live runs pending"
  );

  assert.ok(
    !args.includes(fx.manifestPath),
    "argv must not be the bare manifest path fallthrough"
  );
  assert.equal(
    args.includes("CLAUDE-PROMPT-CONTENT-MARKER\nbody.\n"),
    false,
    "argv must not record the worker prompt payload"
  );
});

test("T-002 process://claude PTY launch redirects prompt file to stdin without prompt argv", () => {
  const fx = makeFixture("CLAUDE-PTY-PROMPT\n");
  const transport = admitWorkerTransport("process://claude");

  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
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
  assert(launch.args.includes("-p"));
  assert.equal(launch.args.includes("CLAUDE-PTY-PROMPT\n"), false);
});

test("T-188 Claude tool constraints are appended inside PTY worker argv", () => {
  const fx = makeFixture("CLAUDE-PLANNING-PROMPT\n");
  const transport = admitWorkerTransport("process://claude");
  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath,
    executorProfile: "pty-terminal"
  });

  const constrained = constrainClaudeProcessLaunchTools({
    transport,
    processLaunch: launch,
    allowedTools: "Read,Write,Edit,Glob"
  });

  const toolsIndex = constrained.args.indexOf("--tools");
  assert.notEqual(toolsIndex, -1);
  assert.equal(constrained.args[toolsIndex + 1], "Read,Write,Edit,Glob");
  assert.equal(constrained.args.includes("Bash"), false);
  assert.equal(constrained.args.includes("Grep"), false);
  assert.equal(constrained.args[toolsIndex + 1].includes("Glob"), true);
});

test("T-002 process://claude local-spawn launch uses stdin pipe", () => {
  const fx = makeFixture("CLAUDE-LOCAL-PROMPT\n");
  const transport = admitWorkerTransport("process://claude");

  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath,
    executorProfile: "local-spawn"
  });

  assert.equal(launch.command, "claude");
  assert.equal(launch.args[0], "-p");
  assert.equal(launch.args.includes("CLAUDE-LOCAL-PROMPT\n"), false);
  assert.equal(launch.stdin, "CLAUDE-LOCAL-PROMPT\n");
});

test("B-070 process://codex argv shape is preserved (regression guard)", () => {
  const fx = makeFixture("CODEX-PROMPT\n");
  const transport = admitWorkerTransport("process://codex");
  assert.equal(transport.agentKey, "codex");
  assert.equal(transport.model, null);

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "exec");
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--skip-git-repo-check"));
  assert.ok(args.includes("--ephemeral"));
  assert.ok(args.includes("--sandbox"));
  const sandboxIndex = args.indexOf("--sandbox");
  assert.equal(args[sandboxIndex + 1], "workspace-write");
  assert.ok(args.includes("features.memories=false"));
  assert.ok(args.includes("memories.use_memories=false"));
  assert.ok(args.includes("memories.generate_memories=false"));
  assert.ok(args.includes("--cd"));
  const cdIndex = args.indexOf("--cd");
  assert.equal(args[cdIndex + 1], fx.workspaceRoot);
  assert.ok(args.includes("--output-last-message"));
  const olmIndex = args.indexOf("--output-last-message");
  assert.equal(args[olmIndex + 1], fx.outputLastMessagePath);
  assert.equal(
    args[args.length - 1],
    "-",
    "codex reads prompt content from stdin instead of argv"
  );
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CODEX-PROMPT\n"
  );
});

test("B-070 process://codex PTY launch redirects prompt file to stdin without prompt argv", () => {
  const fx = makeFixture("CODEX-PTY-PROMPT\n");
  const transport = admitWorkerTransport("process://codex");

  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
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
  assert.equal(launch.args[4], "codex");
  assert(launch.args.includes("exec"));
  assert(launch.args.includes("--ignore-user-config"));
  assert.equal(launch.args[launch.args.length - 1], "-");
  assert(!launch.args.includes("CODEX-PTY-PROMPT\n"));
});

test("B-070 process://codex local-spawn launch uses stdin pipe", () => {
  const fx = makeFixture("CODEX-LOCAL-PROMPT\n");
  const transport = admitWorkerTransport("process://codex");

  const launch = processLaunchForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath,
    executorProfile: "local-spawn"
  });

  assert.equal(launch.command, "codex");
  assert.equal(launch.args[0], "exec");
  assert(launch.args.includes("--ignore-user-config"));
  assert.equal(launch.args[launch.args.length - 1], "-");
  assert.equal(launch.stdin, "CODEX-LOCAL-PROMPT\n");
});

test("B-070 process://codex?model=... lowers to codex exec --model", () => {
  const fx = makeFixture("CODEX-SPARK-PROMPT\n");
  const transport = admitWorkerTransport(
    "process://codex?model=gpt-5.3-codex-spark"
  );
  assert.equal(transport.agentKey, "codex");
  assert.equal(transport.model, "gpt-5.3-codex-spark");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "exec");
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--disable"));
  const disabledFeatureIndex = args.indexOf("--disable");
  assert.equal(args[disabledFeatureIndex + 1], "image_generation");
  assert.ok(args.includes("--model"));
  const modelIndex = args.indexOf("--model");
  assert.equal(args[modelIndex + 1], "gpt-5.3-codex-spark");
  assert.equal(
    args[args.length - 1],
    "-",
    "codex model lane reads prompt content from stdin instead of argv"
  );
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CODEX-SPARK-PROMPT\n"
  );
});

test("B-070 process://codex?model=...&effort=... lowers Codex reasoning effort config", () => {
  const fx = makeFixture("CODEX-GPT55-PROMPT\n");
  const transport = admitWorkerTransport(
    "process://codex?model=gpt-5.5&effort=medium"
  );
  assert.equal(transport.agentKey, "codex");
  assert.equal(transport.model, "gpt-5.5");
  assert.equal(transport.effort, "medium");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "exec");
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--model"));
  const modelIndex = args.indexOf("--model");
  assert.equal(args[modelIndex + 1], "gpt-5.5");
  assert.ok(args.includes("-c"));
  assert(args.includes('model_reasoning_effort="medium"'));
  assert(args.includes("features.memories=false"));
  assert.equal(
    args[args.length - 1],
    "-",
    "codex effort lane reads prompt content from stdin instead of argv"
  );
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CODEX-GPT55-PROMPT\n"
  );
});

test("B-070 process://codex?sandbox=... lowers explicit Codex sandbox mode", () => {
  const fx = makeFixture("CODEX-FULL-BUILD-PROMPT\n");
  const transport = admitWorkerTransport(
    "process://codex?model=gpt-5.5&effort=high&sandbox=danger-full-access"
  );
  assert.equal(transport.agentKey, "codex");
  assert.equal(transport.codexSandboxMode, "danger-full-access");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  const sandboxIndex = args.indexOf("--sandbox");
  assert.notEqual(sandboxIndex, -1);
  assert.equal(args[sandboxIndex + 1], "danger-full-access");
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CODEX-FULL-BUILD-PROMPT\n"
  );
});

test("B-070 process://codex?sandbox=... rejects unsupported sandbox mode", () => {
  assert.throws(
    () => admitWorkerTransport("process://codex?sandbox=networked-build"),
    /codexSandboxMode/u
  );
});

test("T-125 process://claude?model=... lowers to claude --model", () => {
  const fx = makeFixture("CLAUDE-MODEL-PROMPT\n");
  const transport = admitWorkerTransport(
    "process://claude?model=claude-test-model"
  );
  assert.equal(transport.agentKey, "claude");
  assert.equal(transport.model, "claude-test-model");
  assert.equal(parserForWorkerTransport(transport), "claude-stream-json");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "-p");
  assert.ok(args.includes("--model"));
  const modelIndex = args.indexOf("--model");
  assert.equal(args[modelIndex + 1], "claude-test-model");
  assert.ok(args.includes("--output-format"));
  assert.equal(args[args.indexOf("--output-format") + 1], "stream-json");
  assert.equal(args.includes("CLAUDE-MODEL-PROMPT\n"), false);
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CLAUDE-MODEL-PROMPT\n"
  );
});

test("T-126 process://claude?model=...&effort=max lowers both Claude controls", () => {
  const fx = makeFixture("CLAUDE-MAX-EFFORT-PROMPT\n");
  const transport = admitWorkerTransport(
    "process://claude?model=claude-sonnet-4-7&effort=max"
  );
  assert.equal(transport.agentKey, "claude");
  assert.equal(transport.model, "claude-sonnet-4-7");
  assert.equal(transport.effort, "max");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[0], "-p");
  assert.equal(args[args.indexOf("--model") + 1], "claude-sonnet-4-7");
  assert.equal(args[args.indexOf("--effort") + 1], "max");
  assert.equal(args[args.indexOf("--output-format") + 1], "stream-json");
  assert.equal(args.includes("CLAUDE-MAX-EFFORT-PROMPT\n"), false);
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CLAUDE-MAX-EFFORT-PROMPT\n"
  );
});

test("T-126 invalid Claude effort is rejected at transport admission", () => {
  assert.throws(
    () => admitWorkerTransport("process://claude?effort=extreme"),
    /SdlcWorkerTransportContract\.effort/u
  );
});

test("T-127 bare Claude worker alias admits as process transport", () => {
  const fx = makeFixture("CLAUDE-ALIAS-PROMPT\n");
  const transport = admitWorkerTransport(
    "claude?model=claude-sonnet-4-7&effort=max"
  );
  assert.equal(transport.raw, "claude?model=claude-sonnet-4-7&effort=max");
  assert.equal(transport.scheme, "process");
  assert.equal(transport.command, "claude");
  assert.equal(transport.agentKey, "claude");
  assert.equal(transport.model, "claude-sonnet-4-7");
  assert.equal(transport.effort, "max");

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.equal(args[args.indexOf("--model") + 1], "claude-sonnet-4-7");
  assert.equal(args[args.indexOf("--effort") + 1], "max");
  assert.equal(args.includes("CLAUDE-ALIAS-PROMPT\n"), false);
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    "CLAUDE-ALIAS-PROMPT\n"
  );
});

test("T-127 bare non-Claude worker aliases admit as process transports", () => {
  for (const alias of ["codex", "gemini", "node"]) {
    const transport = admitWorkerTransport(alias);
    assert.equal(transport.raw, alias);
    assert.equal(transport.scheme, "process");
    assert.equal(transport.command, alias);
    assert.equal(transport.agentKey, alias);
  }
});

test("T-127 malformed bare worker alias fails through typed transport admission", () => {
  assert.throws(
    () => admitWorkerTransport("claude local"),
    /SdlcWorkerTransportContract\.url/u
  );
});

test("B-070 process://node?script=... falls through to manifest-path argv (regression guard)", () => {
  const fx = makeFixture("ignored prompt for node lane\n");
  const transport = admitWorkerTransport(
    `process://node?script=${encodeURIComponent("/tmp/worker.mjs")}`
  );
  assert.equal(transport.agentKey, "node");
  assert.deepEqual(transport.args, ["/tmp/worker.mjs"]);

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.deepEqual(args, ["/tmp/worker.mjs", fx.manifestPath]);
  assert.equal(
    stdinForWorker({
      transport,
      promptPath: fx.promptPath
    }),
    null
  );
});

test("B-070 process://claude with explicit ?script= override skips claudeArgs and uses fallthrough", () => {
  const fx = makeFixture("ignored\n");
  const transport = admitWorkerTransport(
    `process://claude?script=${encodeURIComponent("/tmp/wrap.mjs")}`
  );
  assert.equal(transport.agentKey, "claude");
  assert.deepEqual(transport.args, ["/tmp/wrap.mjs"]);

  const args = argsForWorker({
    transport,
    manifestPath: fx.manifestPath,
    manifest: fakeManifest(fx.workspaceRoot),
    promptPath: fx.promptPath,
    outputLastMessagePath: fx.outputLastMessagePath
  });

  assert.deepEqual(args, ["/tmp/wrap.mjs", fx.manifestPath]);
});
