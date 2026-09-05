import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import test from "node:test";

import {
  admitTransportAppendArgs,
  composeWorkerTransportArgs,
  constructKnownWorkerTransportContract,
  prepareWorkerTransport,
  runWorkerTransport,
  validateActorProcessCarrierPair,
} from "../../build/code/src/abg/index.js";
import { canonicalJson } from "../../build/code/src/shared/canonical_json.js";
import { sha256Bytes } from "../../build/code/src/shared/digests.js";

function assertClaudeProtocol(args) {
  for (const [flag, value] of [
    ["--output-format", "stream-json"],
    ["--permission-mode", "bypassPermissions"],
  ]) {
    const index = args.indexOf(flag);
    assert.notEqual(index, -1, `missing ${flag}`);
    assert.equal(args[index + 1], value);
  }
  for (const flag of ["-p", "--disable-slash-commands", "--no-session-persistence", "--verbose"]) {
    assert.equal(args.includes(flag), true, `missing ${flag}`);
  }
}

test("M5 B-001 preserves lane-owned Claude execution posture", () => {
  const contract = constructKnownWorkerTransportContract("claude", { environment: {} });
  const closed = composeWorkerTransportArgs({
    contract,
    prompt: "prove",
    outputPath: "/tmp/closed-output",
    lane: "closed_prompt_proof",
    environment: {},
  });
  const worker = composeWorkerTransportArgs({
    contract,
    prompt: "execute",
    outputPath: "/tmp/worker-output",
    lane: "worker_executes",
    environment: {},
  });

  assertClaudeProtocol(closed);
  assertClaudeProtocol(worker);
  assert.equal(closed.includes("--safe-mode"), true);
  assert.equal(closed[closed.indexOf("--tools") + 1], "");
  assert.equal(worker.includes("--safe-mode"), false);
  assert.equal(worker.includes("--tools"), false);
  assert.equal(closed.includes("prove"), false);
  assert.equal(worker.includes("execute"), false);
});

test("M5 B-001 bounds append arguments for all four transport contracts", () => {
  for (const agentKey of ["claude", "codex", "gemini", "generic"]) {
    const environmentKey = `ABG_TS_${agentKey.toUpperCase()}_APPEND_ARGS`;
    assert.deepEqual(
      admitTransportAppendArgs({
        agentKey,
        environment: { [environmentKey]: JSON.stringify(["--localized", agentKey]) },
      }),
      ["--localized", agentKey],
    );
  }
  assert.throws(
    () => admitTransportAppendArgs({
      agentKey: "claude",
      environment: { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--tools", "Bash"]) },
    }),
    /protocol-owned flag --tools/u,
  );
  assert.throws(
    () => admitTransportAppendArgs({
      agentKey: "codex",
      environment: { ABG_TS_CODEX_APPEND_ARGS: JSON.stringify(["{prompt}"]) },
    }),
    /template placeholders/u,
  );
});

test("M5 B-001 gives agent-specific sandbox binding precedence", () => {
  const external = constructKnownWorkerTransportContract("codex", {
    environment: { ABG_TS_WORKER_SANDBOX: "external" },
  });
  assert.deepEqual(
    external.argsTemplate.slice(external.argsTemplate.indexOf("--sandbox"), external.argsTemplate.indexOf("--sandbox") + 2),
    ["--sandbox", "danger-full-access"],
  );
  const specific = constructKnownWorkerTransportContract("codex", {
    environment: {
      ABG_TS_WORKER_SANDBOX: "external",
      ABG_TS_CODEX_SANDBOX: "workspace-write",
    },
  });
  assert.equal(specific.argsTemplate.includes("workspace-write"), true);
  assert.equal(specific.argsTemplate.includes("danger-full-access"), false);
  assert.throws(
    () => constructKnownWorkerTransportContract("codex", {
      environment: { ABG_TS_WORKER_SANDBOX: "off" },
    }),
    /agent_default.*external/u,
  );
});

test("M5 transport identity changes with parser and prompt-delivery semantics", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-transport-identity-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const archiveRoot = join(scratch, "archive");
  const base = constructKnownWorkerTransportContract("generic", {
    command: process.execPath,
    environment: {},
  });
  const request = {
    prompt: "identity",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot,
    label: "identity",
    timeoutMs: 1_000,
    environment: {},
  };
  const baseline = await prepareWorkerTransport({ contract: base, ...request });
  const parserChanged = await prepareWorkerTransport({
    contract: { ...base, parser: "claude_stream_json" },
    ...request,
  });
  const promptTransportChanged = await prepareWorkerTransport({
    contract: { ...base, promptTransport: "stdin" },
    ...request,
  });

  assert.notEqual(baseline.contractDigest, parserChanged.contractDigest);
  assert.notEqual(baseline.planDigest, parserChanged.planDigest);
  assert.notEqual(baseline.contractDigest, promptTransportChanged.contractDigest);
  assert.notEqual(baseline.planDigest, promptTransportChanged.planDigest);
  assert.equal(baseline.absoluteTimeoutMs, 4_000);
  await assert.rejects(
    prepareWorkerTransport({
      contract: base,
      ...request,
      absoluteTimeoutMs: request.timeoutMs,
    }),
    /absolute timeout.*greater than.*inactivity timeout/u,
  );
});

test("M5 B-001 crosses a real worker process, parser, tool event, and archive", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-b001-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "claude-worker-fixture.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  console.log(JSON.stringify({type:'system', subtype:'init'}));",
    "  console.log(JSON.stringify({type:'assistant', message:{content:[{type:'tool_use', id:'toolu_write', name:'Write', input:{path:'artifact.txt'}},{type:'tool_use', id:'toolu_read', name:'Read', input:{path:'artifact.txt'}}]}}));",
    "  console.log(JSON.stringify({type:'user', message:{content:[{type:'tool_result', content:'artifact written'}]}}));",
    "  console.log(JSON.stringify({type:'result', subtype:'success', result:JSON.stringify({kind:'fp_worker_output',schemaVersion:'5.0.0',message:'worker execution observed'})}));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const contract = constructKnownWorkerTransportContract("claude", {
    command: process.execPath,
    prefixArgs: [workerPath],
    environment: {},
  });
  const result = await runWorkerTransport({
    contract,
    prompt: "run the declared command",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "worker-executes",
    timeoutMs: 10_000,
    environment: {},
  });

  assert.equal(result.disposition, "success");
  assert.equal(result.failureClass, null);
  assert.equal(result.status, 0);
  assert.equal(result.structuredEventCount, 4);
  assert.equal(result.progressEventCount, 3);
  assert.equal(result.toolCallCount, 2);
  assert.deepEqual(result.toolInvocations.map((row) => [
    row.ordinal,
    row.toolUseRef,
    row.toolName,
  ]), [
    [0, "toolu_write", "Write"],
    [1, "toolu_read", "Read"],
  ]);
  assert.equal(result.args.includes("--safe-mode"), false);
  assert.equal(result.args.includes("--tools"), false);
  assert.deepEqual(JSON.parse(result.finalOutput), {
    kind: "fp_worker_output",
    schemaVersion: "5.0.0",
    message: "worker execution observed",
  });
  for (const row of Object.values(result.artifacts)) {
    assert.match(row.digest, /^sha256:[a-f0-9]{64}$/u);
    assert.equal((await readFile(row.path)).byteLength, row.byteLength);
  }
});

test("M5 Bash tool identity ignores only optional string description metadata", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-bash-tool-identity-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "claude-bash-tool-fixture.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "const toolUses = JSON.parse(process.env.FIXTURE_TOOL_USES_JSON ?? '[]');",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  console.log(JSON.stringify({type:'system', subtype:'init'}));",
    "  console.log(JSON.stringify({type:'assistant', message:{content:toolUses}}));",
    "  console.log(JSON.stringify({type:'result', subtype:'success', result:'{}'}));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const contract = constructKnownWorkerTransportContract("claude", {
    command: process.execPath,
    prefixArgs: [workerPath],
    environment: {},
  });
  const runCase = (label, toolUses) => runWorkerTransport({
    contract,
    prompt: "capture exact Bash tool identity",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label,
    timeoutMs: 10_000,
    environment: { FIXTURE_TOOL_USES_JSON: JSON.stringify(toolUses) },
  });
  const toolUse = (id, name, input, includeInput = true) => ({
    type: "tool_use",
    id,
    name,
    ...(includeInput ? { input } : {}),
  });
  const actorValidation = (result, label) => {
    const request = {
      actorRef: "actor://abiogenesis/test/bash-tool-identity@5",
      workerBindingRef: "worker-binding://abiogenesis/test/bash-tool-identity@5",
      implementationRef: "implementation://abiogenesis/test/bash-tool-identity@5",
      inputDigest: `sha256:${"a".repeat(64)}`,
      materializationPlanRef: "materialization-plan://abiogenesis/test/bash-tool-identity@5",
      rendererRef: "renderer://abiogenesis/test/bash-tool-identity@5",
      instructionContractRef: "contract://abiogenesis/test/bash-tool-instruction@5",
      resultContractRef: "contract://abiogenesis/test/bash-tool-result@5",
      transportLane: "worker_executes",
      prompt: "capture exact Bash tool identity",
      responseJsonSchema: { type: "object" },
    };
    return validateActorProcessCarrierPair(request, {
      actorInvocationRef: `actor-invocation://abiogenesis/test/${label}`,
      actorRef: request.actorRef,
      workerBindingRef: request.workerBindingRef,
      implementationRef: request.implementationRef,
      inputDigest: request.inputDigest,
      materializationPlanRef: request.materializationPlanRef,
      rendererRef: request.rendererRef,
      instructionContractRef: request.instructionContractRef,
      resultContractRef: request.resultContractRef,
      processRef: `process://abiogenesis/test/${label}`,
      transportBindingRef: `transport-binding://abiogenesis/test/${label}`,
      transportBindingDigest: `sha256:${"b".repeat(64)}`,
      disposition: result.disposition,
      failureClass: result.failureClass,
      finalOutput: result.finalOutput,
      observedOutputDigest: result.artifacts.output.digest,
      promptDigest: result.artifacts.prompt.digest,
      transportDigest: result.artifacts.transport.digest,
      transportLane: result.lane,
      processStatus: result.status,
      processSignal: result.signal,
      timeoutClass: result.timeoutClass,
      timedOut: result.timedOut,
      exitObserved: result.exitObserved,
      terminationConfirmed: result.terminationConfirmed,
      signalSequence: [],
      structuredEventCount: result.structuredEventCount,
      progressEventCount: result.progressEventCount,
      toolCallCount: result.toolCallCount,
      toolInvocations: result.toolInvocations,
      apiRetryCount: result.apiRetryCount,
      stdoutByteLength: result.artifacts.stdout.byteLength,
      stderrByteLength: result.artifacts.stderr.byteLength,
      artifactDigests: {
        output: result.artifacts.output.digest,
        prompt: result.artifacts.prompt.digest,
        stderr: result.artifacts.stderr.digest,
        stdout: result.artifacts.stdout.digest,
        transport: result.artifacts.transport.digest,
      },
    });
  };

  const helperCommand = "node /installed/helper.js --task /archive/task.json";
  const canonicalInputBytes = Buffer.from(
    canonicalJson({ command: helperCommand }),
    "utf8",
  );
  const expectedDigest = sha256Bytes(canonicalInputBytes);
  const commandOnly = await runCase("bash-command-only", [
    toolUse("toolu_command", "Bash", { command: helperCommand }),
  ]);
  const description = "Run the exact ABI helper once";
  const described = await runCase("bash-command-description", [
    toolUse("toolu_description", "Bash", { command: helperCommand, description }),
  ]);
  for (const result of [commandOnly, described]) {
    assert.equal(result.toolCallCount, 1);
    assert.equal(result.toolInvocations.length, 1);
    assert.equal(result.toolInvocations[0].inputDigest, expectedDigest);
    assert.equal(result.toolInvocations[0].inputByteLength, canonicalInputBytes.byteLength);
    assert.equal(Object.hasOwn(result.toolInvocations[0], "input"), false);
  }
  assert.equal(actorValidation(commandOnly, "command-only").disposition, "valid");
  assert.equal(actorValidation(described, "description").disposition, "valid");
  assert.match(await readFile(described.artifacts.stdout.path, "utf8"), new RegExp(description, "u"));
  assert.match(await readFile(described.artifacts.transport.path, "utf8"), new RegExp(description, "u"));

  for (const [label, input] of [
    ["wrong-command", { command: `${helperCommand} --wrong` }],
    ["timeout", { command: helperCommand, timeout: 1_000 }],
    ["background", { command: helperCommand, background: true }],
    ["sandbox", { command: helperCommand, sandbox: "alternate" }],
    ["unknown", { command: helperCommand, unknownField: "retained" }],
  ]) {
    const result = await runCase(`bash-${label}`, [
      toolUse(`toolu_${label}`, "Bash", input),
    ]);
    assert.equal(result.toolCallCount, 1);
    assert.equal(result.toolInvocations.length, 1);
    assert.notEqual(result.toolInvocations[0].inputDigest, expectedDigest);
    assert.notEqual(result.toolInvocations[0].inputByteLength, canonicalInputBytes.byteLength);
    assert.equal(actorValidation(result, label).disposition, "valid");
  }

  for (const [label, event] of [
    ["non-string-description", toolUse("toolu_bad_description", "Bash", {
      command: helperCommand,
      description: 7,
    })],
    ["malformed-input", toolUse("toolu_malformed", "Bash", helperCommand)],
    ["missing-input", toolUse("toolu_missing", "Bash", null, false)],
    ["missing-command", toolUse("toolu_missing_command", "Bash", {
      description: "missing exact command",
    })],
  ]) {
    const result = await runCase(`bash-${label}`, [event]);
    assert.equal(result.toolCallCount, 1);
    assert.deepEqual(result.toolInvocations, []);
    assert.equal(actorValidation(result, label).disposition, "refused");
  }

  const second = await runCase("bash-second-tool", [
    toolUse("toolu_first", "Bash", { command: helperCommand }),
    toolUse("toolu_second", "Read", { file_path: "/archive/result.json" }),
  ]);
  assert.equal(second.toolCallCount, 2);
  assert.equal(second.toolInvocations.length, 2);
  assert.equal(actorValidation(second, "second-tool").disposition, "valid");

  const repeated = await runCase("bash-repeated-stream-record", [
    toolUse("toolu_repeated", "Bash", { command: helperCommand, description }),
    toolUse("toolu_repeated", "Bash", { command: helperCommand }),
  ]);
  assert.equal(repeated.toolCallCount, 1);
  assert.equal(repeated.toolInvocations.length, 1);
  assert.equal(repeated.toolInvocations[0].inputDigest, expectedDigest);
  assert.equal(actorValidation(repeated, "repeated-stream-record").disposition, "valid");

  const conflictingDuplicate = await runCase("bash-conflicting-duplicate", [
    toolUse("toolu_duplicate", "Bash", { command: helperCommand }),
    toolUse("toolu_duplicate", "Bash", { command: `${helperCommand} --wrong` }),
  ]);
  assert.equal(conflictingDuplicate.toolCallCount, 2);
  assert.equal(conflictingDuplicate.toolInvocations.length, 1);
  assert.equal(
    actorValidation(conflictingDuplicate, "conflicting-duplicate").disposition,
    "refused",
  );
});

test("M5 B-001 rejects tool activity only in the closed-prompt lane", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-b001-closed-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "claude-closed-fixture.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  console.log(JSON.stringify({type:'assistant', message:{content:[{type:'tool_use', name:'Write'}]}}));",
    "  console.log(JSON.stringify({type:'result', result:'not admissible'}));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const contract = constructKnownWorkerTransportContract("claude", {
    command: process.execPath,
    prefixArgs: [workerPath],
    environment: {},
  });
  const result = await runWorkerTransport({
    contract,
    prompt: "prove without tools",
    lane: "closed_prompt_proof",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "closed-prompt",
    timeoutMs: 10_000,
    environment: {},
  });
  assert.equal(result.disposition, "failure");
  assert.equal(result.failureClass, "contract_failure");
  assert.equal(result.toolCallCount, 1);
  assert.equal(result.args.includes("--safe-mode"), true);
  assert.equal(result.args[result.args.indexOf("--tools") + 1], "");
});

test("M5 closed-prompt proof does not misclassify declared StructuredOutput as a capability tool", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-structured-output-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "claude-structured-output-fixture.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  const result = {kind:'structured_result', schemaVersion:'5.0.0'};",
    "  console.log(JSON.stringify({type:'assistant', message:{content:[{type:'tool_use', name:'StructuredOutput', input:result}]}}));",
    "  console.log(JSON.stringify({type:'user', message:{content:[{type:'tool_result', content:'Structured output provided successfully'}]}}));",
    "  console.log(JSON.stringify({type:'result', subtype:'success', result:JSON.stringify(result)}));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const contract = constructKnownWorkerTransportContract("claude", {
    command: process.execPath,
    prefixArgs: [workerPath],
    environment: {},
  });
  const result = await runWorkerTransport({
    contract,
    prompt: "return the declared structured output",
    lane: "closed_prompt_proof",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "structured-output",
    timeoutMs: 10_000,
    responseJsonSchema: { type: "object" },
    environment: {},
  });

  assert.equal(result.disposition, "success");
  assert.equal(result.failureClass, null);
  assert.equal(result.toolCallCount, 0);
  assert.deepEqual(JSON.parse(result.finalOutput), {
    kind: "structured_result",
    schemaVersion: "5.0.0",
  });

  const undeclared = await runWorkerTransport({
    contract,
    prompt: "attempt undeclared structured output",
    lane: "closed_prompt_proof",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "undeclared-structured-output",
    timeoutMs: 10_000,
    environment: {},
  });
  assert.equal(undeclared.disposition, "failure");
  assert.equal(undeclared.failureClass, "contract_failure");
  assert.equal(undeclared.toolCallCount, 1);
});

test("M5 ABG transport force-terminates a worker that ignores SIGTERM", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-bounded-timeout-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "resistant-worker.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "process.on('SIGTERM', () => {});",
    "process.stdout.write('started\\n');",
    "setInterval(() => process.stdout.write('still-running\\n'), 20);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  let processId = null;
  const observedExits = [];
  let unconfirmedTerminations = 0;
  const startedAt = Date.now();
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("generic", {
      command: process.execPath,
      prefixArgs: [workerPath],
      environment: {},
    }),
    prompt: "bounded",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "resistant-worker",
    timeoutMs: 200,
    absoluteTimeoutMs: 350,
    terminationGraceMs: 75,
    environment: {},
    observer: {
      onProcessStarted: (pid) => { processId = pid; },
      onStdoutObserved: () => true,
      onProcessExited: (status, signal) => observedExits.push({ status, signal }),
      onTerminationUnconfirmed: () => { unconfirmedTerminations += 1; },
    },
  });
  assert.equal(result.disposition, "failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "absolute");
  assert.equal(result.exitObserved, true);
  assert.equal(result.terminationConfirmed, true);
  assert.deepEqual(observedExits, [{ status: null, signal: "SIGKILL" }]);
  assert.equal(unconfirmedTerminations, 0);
  assert.notEqual(processId, null);
  assert.throws(
    () => process.kill(processId, 0),
    (error) => error?.code === "ESRCH",
  );
  assert.equal(Date.now() - startedAt < 2_000, true);
});

test("M5 ABG transport renews its inactivity lease only from observed progress", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-progress-lease-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "progress-worker.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "let ordinal = 0;",
    "process.stdout.write('progress-0\\n');",
    "const progress = setInterval(() => {",
    "  ordinal += 1;",
    "  process.stdout.write(`progress-${ordinal}\\n`);",
    "  if (ordinal === 6) {",
    "    clearInterval(progress);",
    "    process.stdout.write('complete\\n', () => process.exit(0));",
    "  }",
    "}, 40);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  let progressObservations = 0;
  const startedAt = Date.now();
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("generic", {
      command: process.execPath,
      prefixArgs: [workerPath],
      environment: {},
    }),
    prompt: "remain live while observed progress continues",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "progress-worker",
    timeoutMs: 120,
    absoluteTimeoutMs: 600,
    terminationGraceMs: 75,
    environment: {},
    observer: {
      onStdoutObserved: () => {
        progressObservations += 1;
        return true;
      },
    },
  });

  assert.equal(Date.now() - startedAt > 120, true);
  assert.equal(progressObservations >= 7, true);
  assert.equal(result.disposition, "success");
  assert.equal(result.timedOut, false);
  assert.equal(result.timeoutClass, null);
  assert.match(result.finalOutput, /complete/u);
});

test("M5 ABG transport does not renew from unacknowledged output", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-unadmitted-progress-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "unadmitted-progress-worker.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "setInterval(() => process.stdout.write('unadmitted\\n'), 20);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  let rawObservations = 0;
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("generic", {
      command: process.execPath,
      prefixArgs: [workerPath],
      environment: {},
    }),
    prompt: "do not renew without admission acknowledgement",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "unadmitted-progress-worker",
    timeoutMs: 150,
    absoluteTimeoutMs: 600,
    terminationGraceMs: 75,
    environment: {},
    observer: {
      onStdoutObserved: () => {
        rawObservations += 1;
        return false;
      },
    },
  });

  assert.equal(rawObservations > 0, true);
  assert.equal(result.disposition, "failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "inactivity");
  assert.equal(result.finalOutput.length > 0, true);
});

test("M5 ABG transport excludes semantic output emitted after its timeout boundary", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-post-timeout-output-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "post-timeout-worker.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "process.on('SIGTERM', () => {",
    "  const result = JSON.stringify({kind:'late_worker_output',schemaVersion:'5.0.0'});",
    "  const transcript = JSON.stringify({type:'result',subtype:'success',result});",
    "  process.stdout.write(`${transcript}\\n`, () => process.exit(0));",
    "});",
    "setInterval(() => {}, 1_000);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("claude", {
      command: process.execPath,
      prefixArgs: [workerPath],
      environment: {},
    }),
    prompt: "do not admit output after the deadline",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "post-timeout-output",
    timeoutMs: 150,
    absoluteTimeoutMs: 600,
    terminationGraceMs: 250,
    environment: {},
  });

  assert.equal(result.disposition, "failure");
  assert.equal(result.failureClass, "transport_failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "inactivity");
  assert.equal(result.finalOutput, "");
  assert.equal(result.structuredEventCount, 0);
  assert.match(result.stdout, /late_worker_output/u);
  assert.equal(result.artifacts.output.byteLength, 0);
});

test("M5 ABG transport excludes descendant output emitted after direct-process exit", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-post-exit-output-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const descendantPath = join(scratch, "post-exit-descendant.mjs");
  const workerPath = join(scratch, "post-exit-worker.mjs");
  await writeFile(descendantPath, [
    "#!/usr/bin/env node",
    "setTimeout(() => {",
    "  const result = JSON.stringify({kind:'late_exit_output',schemaVersion:'5.0.0'});",
    "  const transcript = JSON.stringify({type:'result',subtype:'success',result});",
    "  process.stdout.write(`${transcript}\\n`, () => process.exit(0));",
    "}, 225);",
    "",
  ].join("\n"), "utf8");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "import { spawn } from 'node:child_process';",
    `const descendant = spawn(process.execPath, [${
      JSON.stringify(descendantPath)
    }], {stdio:['ignore','inherit','inherit']});`,
    "descendant.unref();",
    "setTimeout(() => process.exit(47), 50);",
    "",
  ].join("\n"), "utf8");
  await chmod(descendantPath, 0o755);
  await chmod(workerPath, 0o755);
  let timeoutObservations = 0;
  const requestedSignals = [];
  const observedExits = [];
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("claude", {
      command: process.execPath,
      prefixArgs: [workerPath],
      environment: {},
    }),
    prompt: "do not admit output after the direct worker exits",
    lane: "worker_executes",
    cwd: scratch,
    archiveRoot: join(scratch, "archive"),
    label: "post-exit-output",
    timeoutMs: 150,
    terminationGraceMs: 500,
    environment: {},
    observer: {
      onTimeoutObserved: () => { timeoutObservations += 1; },
      onSignalRequested: (signal) => requestedSignals.push(signal),
      onProcessExited: (status, signal) => observedExits.push({ status, signal }),
    },
  });

  assert.equal(result.disposition, "failure");
  assert.equal(result.failureClass, "transport_failure");
  assert.equal(result.status, 47);
  assert.equal(result.timedOut, false);
  assert.equal(result.exitObserved, true);
  assert.deepEqual(observedExits, [{ status: 47, signal: null }]);
  assert.equal(timeoutObservations, 0);
  assert.deepEqual(requestedSignals, []);
  assert.equal(result.finalOutput, "");
  assert.equal(result.structuredEventCount, 0);
  assert.match(result.stdout, /late_exit_output/u);
  assert.equal(result.artifacts.output.byteLength, 0);
});
