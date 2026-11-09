import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { chmod, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SourceTextModule, SyntheticModule } from "node:vm";
import process from "node:process";
import test from "node:test";

import {
  admitTransportAppendArgs,
  composeWorkerTransportArgs,
  constructKnownWorkerTransportContract,
  prepareWorkerTransport,
  runPreparedWorkerTransport,
  runWorkerTransport,
  validateActorProcessCarrierPair,
} from "../../build/code/src/abg/index.js";
import { canonicalJson } from "../../build/code/src/shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../../build/code/src/shared/digests.js";
import {
  configuredActorIdentityCorresponds,
  deriveConfiguredActorIdentity,
  isConfiguredActorIdentity,
  isNativeWorkerResultAssessment,
} from "../../build/code/src/abg/transport_contracts.js";
import { nativeWorkspaceWorkReportSchema } from "../../build/code/src/product/native_workspace_work.js";
import { parseNativeWorkspaceAssessmentResult } from "../../build/code/src/product/native_workspace_assessment.js";
import { createWorkerTransportOutputObserver } from "../../build/code/src/abg/worker_transport.js";
import { deepFreeze, isDeeplyFrozen } from "../../build/code/src/shared/immutable.js";
import { admitIJsonText } from "../../build/code/src/shared/i_json.js";
import { isRecord } from "../../build/code/src/shared/admit/index.js";
import { LEGACY_ROOT_EVENT_CONTRACT_DIGEST, ROOT_EVENT_CONTRACT_DIGEST } from "../../build/code/src/abg/event_store.js";
import { actorRuntimeProbeSources, constructRuntimeWatchdogPolicy } from "../../build/code/src/abg/runtime_liveness_contracts.js";
import { privateOwner } from "../support/r10-private-owner-harness.mjs";
import { failureFact, retainEvidence } from "../support/t287-publication-observer.mjs";
import { hasConfirmedOwnedProcessBoundary } from "../../build/code/src/shared/process/index.js";
import { closeSync as hs03CloseSync, fsyncSync as hs03FsyncSync, openSync as hs03OpenSync, readSync as hs03ReadSync,
  truncateSync as hs03TruncateSync, unlinkSync as hs03UnlinkSync, writeSync as hs03WriteSync } from "node:fs";

// D5: the archive omits the three lifecycle copies the live result carries;
// its own timeoutClass and encoded processFacts determine each of them.
async function assertArchiveDeterminesLifecycleCopies(result) {
  const archive = JSON.parse(await readFile(result.artifacts.transport.path, "utf8"));
  for (const key of ["timedOut", "exitObserved", "terminationConfirmed"]) {
    assert.equal(Object.hasOwn(archive, key), false, `the archive omits ${key}`);
  }
  const { timedOut: _timedOut, exitObserved: _exitObserved, terminationConfirmed: _terminationConfirmed,
    artifacts: { transport: _transport, ...artifacts }, ...body } = result;
  assert.deepEqual(archive, JSON.parse(JSON.stringify({ ...body, artifacts })), "every other archive member is unchanged");
  assert.equal(result.timedOut, archive.timeoutClass !== null);
  assert.equal(result.exitObserved, archive.processFacts.directExit !== null);
  assert.equal(result.terminationConfirmed, hasConfirmedOwnedProcessBoundary(archive.processFacts));
}

function assertClaudeProtocol(args) {
  for (const [flag, value] of [
    ["--output-format", "stream-json"],
    ["--permission-mode", "bypassPermissions"],
  ]) {
    const index = args.indexOf(flag);
    assert.notEqual(index, -1, `missing ${flag}`);
    assert.equal(args[index + 1], value);
  }
  for (const flag of ["-p", "--disable-slash-commands", "--no-session-persistence", "--include-partial-messages", "--verbose"]) {
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

test("M5 native report keeps its original host schema presentation", () => {
  const args = composeWorkerTransportArgs({
    contract: constructKnownWorkerTransportContract("claude", { environment: {} }),
    prompt: "return the ordinary work report", outputPath: "/tmp/report-output",
    lane: "worker_executes", responseJsonSchema: nativeWorkspaceWorkReportSchema, environment: {},
  });
  assert.equal(args[args.indexOf("--json-schema") + 1], JSON.stringify(nativeWorkspaceWorkReportSchema));
  assertClaudeProtocol(args);
});

test("M5 schema literal placeholders remain opaque while ordinary templates and append positions expand", () => {
  const schema = { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object",
    required: ["template"], additionalProperties: false,
    properties: { template: { type: "string", const: "{prompt}|{output_path}" } } };
  const serialized = JSON.stringify(schema);
  const prompt = 'actual "quoted" task\nnext line';
  const outputPath = "/retained/output.json";
  const expand = value => value.replaceAll("{prompt}", prompt).replaceAll("{output_path}", outputPath);
  const contract = constructKnownWorkerTransportContract("claude", {
    // Even an ordinary template identical to schema bytes retains its meaning.
    prefixArgs: [serialized, "--input", "{prompt}", "--destination", "{output_path}"], environment: {},
  });
  const args = composeWorkerTransportArgs({ contract, prompt, outputPath, lane: "worker_executes",
    responseJsonSchema: schema, explicitAppendArgs: ["--localized", "fixture"], environment: {} });
  assert.deepEqual(args, [expand(serialized), "--localized", "fixture", "--input", prompt,
    "--destination", outputPath, ...contract.argsTemplate, "--json-schema", serialized]);
  assert.deepEqual(JSON.parse(args[args.indexOf("--json-schema") + 1]), schema);
  const ordinary = composeWorkerTransportArgs({ contract, prompt, outputPath, lane: "worker_executes",
    responseJsonSchema: schema, responsePresentation: "result_text",
    explicitAppendArgs: ["--localized", "fixture"], environment: {} });
  assert.deepEqual(ordinary, args.slice(0, -2));
});

test("M5 requested structured output uses only the final carrier and preserves raw/schema refusal", () => {
  const schema = { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", additionalProperties: false,
    required: ["kind", "count"], properties: { kind: { const: "bounded_verdict" }, count: { type: "integer", minimum: 0 } } };
  const expected = { kind: "bounded_verdict", count: 1 };
  const observe = (line, requested = true) => {
    const observer = createWorkerTransportOutputObserver(requested);
    const intermediate = JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", name: "StructuredOutput", input: expected }] } });
    assert.equal(observer.observe(intermediate + "\n").finalOutput, "", "tool arguments are never a final result");
    observer.observe(line.slice(0, 11)); observer.observe(line.slice(11) + "\n");
    return observer.finish();
  };
  const final = { type: "result", subtype: "success", is_error: false, structured_output: expected };
  assert.deepEqual(parseNativeWorkspaceAssessmentResult(schema, observe(JSON.stringify(final)).finalOutput), expected);
  assert.deepEqual(parseNativeWorkspaceAssessmentResult(schema, observe(JSON.stringify({ ...final, result: "unstructured commentary" })).finalOutput), expected);
  for (const line of [
    JSON.stringify({ type: "result", subtype: "success", is_error: false, result: JSON.stringify(expected) }),
    JSON.stringify({ ...final, is_error: true }),
    '{"type":"result","subtype":"success","is_error":false,"structured_output":',
    '{"type":"result","subtype":"success","is_error":false,"structured_output":{"kind":"wrong","kind":"bounded_verdict","count":1}}',
    '{"type":"result","subtype":"success","is_error":false,"structured_output":{"kind":"bounded_verdict","count":9007199254740993}}',
  ]) assert.equal(observe(line).finalOutput, "", "missing/malformed/non-I-JSON final cannot fall back to text or tool arguments");
  const wrong = observe(JSON.stringify({ ...final, structured_output: { ...expected, count: -1 } })).finalOutput;
  assert.deepEqual(JSON.parse(wrong), { ...expected, count: -1 });
  assert.equal(parseNativeWorkspaceAssessmentResult(schema, wrong), null, "host structure cannot replace full schema validation");
  const ordinary = observe(JSON.stringify({ ...final, result: "ordinary result text" }), false);
  assert.equal(ordinary.finalOutput, "ordinary result text"); assert.equal(ordinary.toolCallCount, 1);
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
      agentKey: "claude",
      environment: { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--include-partial-messages"]) },
    }),
    /protocol-owned flag --include-partial-messages/u,
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
  assert.equal(result.progressEventCount, 2);
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
  await assertArchiveDeterminesLifecycleCopies(result);
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
  const actorValidation = (result, label, requestFields = {}) => {
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
      ...requestFields,
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
  assert.equal(actorValidation(commandOnly, "selected-result-text", {responsePresentation:"result_text"}).disposition, "valid");
  for (const value of ["structured_output", null, undefined, true]) {
    assert.equal(actorValidation(commandOnly, "invalid-presentation", {responsePresentation:value}).code, "invalid_actor_process_request");
  }
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
    "import {writeFileSync} from 'node:fs';",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  const result = {kind:'structured_result', schemaVersion:'5.0.0'};",
    "  console.log(JSON.stringify({type:'assistant', message:{content:[{type:'tool_use', name:'StructuredOutput', input:result}]}}));",
    "  console.log(JSON.stringify({type:'user', message:{content:[{type:'tool_result', content:'Structured output provided successfully'}]}}));",
    "  const missing = process.argv.includes('--fixture-missing-final');",
    `  if (missing) writeFileSync(${JSON.stringify(join(scratch, "archive", "missing-final-output.txt"))}, JSON.stringify(result));`,
    "  console.log(JSON.stringify({type:'result', subtype:'success', is_error:false, result:JSON.stringify(result), ...(missing?{}:{structured_output:result})}));",
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

  const missingFinal = await runWorkerTransport({
    contract, prompt: "return the requested structured final", lane: "closed_prompt_proof",
    cwd: scratch, archiveRoot: join(scratch, "archive"), label: "missing-final", timeoutMs: 10_000,
    responseJsonSchema: { type: "object" }, explicitAppendArgs: ["--fixture-missing-final"], environment: {},
    observer: { assessNativeResultArtifact: output => {
      assert.equal(output, "", "a result file cannot replace a missing requested structured final");
      return { kind: "native_worker_result_assessment", schemaVersion: "5.0.0", disposition: "rejected",
        inputDigest: sha256Bytes(Buffer.from("component premise")), rawOutputDigest: sha256Bytes(Buffer.from(output)),
        resultContractRef: "contract://component/structured-result", verification: null };
    } },
  });
  assert.equal(missingFinal.disposition, "failure");
  assert.equal(missingFinal.nativeResultAssessment.disposition, "rejected");
  assert.equal(missingFinal.finalOutput, "");

  const resultText = await runWorkerTransport({
    contract, prompt: "return ordinary JSON result text", lane: "closed_prompt_proof",
    cwd: scratch, archiveRoot: join(scratch, "archive"), label: "result-text",
    timeoutMs: 10_000, responseJsonSchema: { type: "object" }, responsePresentation: "result_text", environment: {},
  });
  assert.equal(resultText.args.includes("--json-schema"), false);
  assert.equal(resultText.toolCallCount, 1, "unrequested StructuredOutput is a tool call even when the authoritative schema is retained");
  assert.equal(resultText.disposition, "failure");
  assert.equal(resultText.failureClass, "contract_failure");
  assert.deepEqual(JSON.parse(resultText.finalOutput), JSON.parse(result.finalOutput), "ordinary result text remains extractable");

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

test("M5 selected result text cannot admit a valid file without its final carrier", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-selected-result-carrier-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const schema = { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", additionalProperties: false,
    required: ["kind", "count"], properties: { kind: { const: "bounded_verdict" }, count: { type: "integer", minimum: 0 } } };
  const verdict = { kind: "bounded_verdict", count: 1 }, text = JSON.stringify(verdict);
  const workerPath = join(scratch, "result-carrier-fixture.mjs");
  await writeFile(workerPath, [
    "import {writeFileSync} from 'node:fs';",
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  const [outputPath, finalText, fileText] = process.argv.slice(2, 5);",
    "  writeFileSync(outputPath, fileText);",
    "  console.log(JSON.stringify({type:'result', subtype:'success', is_error:false, result:finalText}));",
    "});",
  ].join("\n"), "utf8");
  const inputDigest = sha256Bytes("component native input"), resultContractRef = "contract://component/bounded-verdict";
  const assess = output => {
    const parsed = parseNativeWorkspaceAssessmentResult(schema, output);
    const disposition = output.trim().length === 0 ? "absent" : parsed === null ? "rejected" : "admitted";
    // Resolution/capability authority is a supplied lower component premise;
    // the process, carrier observer and strict native schema parser execute.
    let verification = null;
    if (disposition === "admitted") {
      const digest = sha256Bytes("component authority");
      const body = { contractCapabilityBasis: { installId: "component-install", implementationSetRef: "component-set",
        implementationSetDigest: digest, publicationDigest: digest }, implementationResolutionDigest: digest,
        implementationRef: "component-native-owner", inputContractRef: "contract://component/input",
        targetOutputContractRef: "contract://component/observation", instructionContractRef: "contract://component/instruction",
        rawResultContractRef: resultContractRef, inputDigest, rawResultDigest: sha256Canonical(parsed) };
      const verificationDigest = sha256Canonical(body);
      verification = { kind: "verified_probabilistic_result_contract_preimage", schemaVersion: "5.0.0",
        verificationRef: `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice(7)}`,
        verificationDigest, ...body };
    }
    const assessment = { kind: "native_worker_result_assessment", schemaVersion: "5.0.0", resultContractRef, inputDigest,
      rawOutputDigest: sha256Bytes(output), disposition, verification };
    assert.equal(isNativeWorkerResultAssessment(assessment, output, resultContractRef, inputDigest), true);
    return assessment;
  };
  for (const c of [
    { label: "selected-absent", presentation: "result_text", schema, finalText: "", disposition: "absent", failure: "no_output" },
    { label: "selected-present", presentation: "result_text", schema, finalText: text, disposition: "admitted", failure: null },
    { label: "omitted-file", finalText: "", disposition: "admitted", failure: null },
    { label: "structured-absent", schema, finalText: text, disposition: "absent", failure: "no_output" },
  ]) {
    const outputPath = join(scratch, "archive", `${c.label}-output.txt`);
    const contract = constructKnownWorkerTransportContract("claude", {
      command: process.execPath, prefixArgs: [workerPath, "{output_path}", c.finalText, text], environment: {},
    });
    let assessedOutput = null;
    const result = await runWorkerTransport({ contract, prompt: "assess the exact supplied candidate", lane: "worker_executes",
      cwd: scratch, archiveRoot: join(scratch, "archive"), label: c.label, timeoutMs: 10_000, environment: {},
      ...(c.schema === undefined ? {} : { responseJsonSchema: c.schema }),
      ...(c.presentation === undefined ? {} : { responsePresentation: c.presentation }),
      observer: { assessNativeResultArtifact: output => { assessedOutput = output; return assess(output); } } });
    const expectedOutput = c.disposition === "absent" ? "" : text;
    assert.equal(result.args.includes("--json-schema"), c.schema !== undefined && c.presentation === undefined, c.label);
    assert.equal(assessedOutput, expectedOutput, c.label);
    assert.equal(result.nativeResultAssessment.disposition, c.disposition, c.label);
    assert.equal(result.disposition, c.failure === null ? "success" : "failure", c.label);
    assert.equal(result.failureClass, c.failure, c.label);
    assert.equal(result.finalOutput, expectedOutput, c.label);
    assert.equal((await readFile(outputPath)).toString("utf8"), expectedOutput, c.label);
  }
  const conflict = constructKnownWorkerTransportContract("claude", { command: process.execPath,
    prefixArgs: [workerPath, "{output_path}", text, JSON.stringify({ ...verdict, count: 2 })], environment: {} });
  await assert.rejects(runWorkerTransport({ contract: conflict, prompt: "preserve conflicting output refusal", lane: "worker_executes",
    cwd: scratch, archiveRoot: join(scratch, "archive"), label: "selected-conflict", timeoutMs: 10_000,
    responseJsonSchema: schema, responsePresentation: "result_text", environment: {},
    observer: { assessNativeResultArtifact: () => assert.fail("conflicting carriers must refuse before native assessment") } }),
  /distinct worker output channels disagree/);
});

// Physical m5 fixtures declare one prospective finite setup allowance per cold
// Node through its first fixture statement (the owned-process lifetime file's
// SETUP_MS precedent), not an observed startup bound. Owner clocks still start
// at spawn; nothing is rebased, renewed, retried or skipped, and no extra
// acknowledgement is supplied. A missing fixture premise is a failed
// prerequisite, never a pass. Exact lease, acknowledgement and cutoff law is
// proved separately on the actual owner with a controlled clock below.
const M5_SETUP_MS = 5_000, M5_GROUP_SETUP_MS = 2 * M5_SETUP_MS + 5, M5_ADMINISTRATIVE_MS = 5_000;
const m5CleanupMs = grace => 2 * grace + Math.min(grace, 250);
const m5Cap = ownerCeilingMs => Math.ceil((M5_ADMINISTRATIVE_MS + ownerCeilingMs) / 1000) * 1000;
const m5Alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw error; } };
const m5Optional = path => readFile(path, "utf8").then(text => text, error => error.code === "ENOENT" ? null : { readError: error.code ?? error.message });
const m5Events = text => typeof text === "string" ? text.split("\n").filter(line => line.length > 0).map(line => JSON.parse(line)) : text;
// Ordered complete records of one byte sequence, independent of capture chunking.
const m5CompleteRecords = text => { assert.equal(text.endsWith("\n"), true, "no partial trailing record"); return text.slice(0, -1).split("\n"); };
// Progress timing over ordered captures { chunk, at } on one millisecond clock.
// Completion is the capture at which the ordered bytes first hold the whole
// "complete" record, however callbacks split or coalesce it; null when no
// capture completes it. No owner duration or default time stands in for it.
function m5ProgressTiming(captures, spawnedAt) {
  let text = "", completeAt = null;
  for (const { chunk, at } of captures) {
    const open = text.lastIndexOf("\n") + 1;
    text += chunk;
    const end = text.lastIndexOf("\n");
    if (end >= open && text.slice(open, end).split("\n").includes("complete")) { completeAt = at; break; }
  }
  const gaps = captures.slice(1).map((row, index) => row.at - captures[index].at);
  return { spawnToCompleteCaptureMs: spawnedAt === null || completeAt === null ? null : completeAt - spawnedAt,
    maxAcknowledgedGapMs: gaps.length === 0 ? null : Math.max(...gaps), callbacks: captures.length };
}
// The owner's settle instant and its original result or thrown value.
async function m5Settle(call) {
  const startedAt = performance.now();
  try { const result = await call(); return { result, failure: null, threw: false, settledMs: performance.now() - startedAt }; }
  catch (failure) { return { result: null, failure, threw: true, settledMs: performance.now() - startedAt }; }
}
async function m5Artifacts(archiveRoot, label) {
  return Object.fromEntries(await Promise.all(["prompt.txt", "stdout.log", "stderr.log", "output.txt", "transport.json"].map(async name =>
    [name, await m5Optional(join(archiveRoot, `${label}-${name}`))])));
}

class M5ControlledChild extends EventEmitter {
  constructor(pid = 4242) {
    super(); this.pid = pid; this.stdinWrites = [];
    for (const name of ["stdin", "stdout", "stderr"]) {
      const stream = new EventEmitter();
      Object.assign(stream, { closed: false, destroyed: false, destroy: () => { stream.destroyed = true; },
        setEncoding: () => stream, end: data => { this.stdinWrites.push(data ?? null); } });
      this[name] = stream;
    }
  }
}
const m5Ns = ms => BigInt(ms) * 1_000_000n;
// The emitted worker transport with only spawn and the owned-lifetime host
// replaced: the actual createMonotonicDeadline and createOwnedProcessLifetime
// run on one controlled bigint clock through their declared host seam.
async function m5ControlledTransport() {
  const actual = await import("../../build/code/src/shared/owned_process_lifetime.js");
  let now = 0n, next = 0;
  const timers = new Map(), world = { child: null, signals: [], group: "present", spawned: null };
  const clock = {
    nowNs: () => now,
    arm: (callback, delayMs) => { const id = ++next; timers.set(id, { callback, due: now + m5Ns(delayMs) }); return id; },
    cancel: id => { timers.delete(id); },
  };
  const host = { clock, platform: "posix", probeGroup: () => world.group,
    signal: (_child, value) => { world.signals.push({ value, atNs: now }); } };
  const advanceTo = target => {
    for (let count = 0; ; count++) {
      assert.equal(count < 100_000, true, "controlled callback population bounded");
      const row = [...timers].filter(([, timer]) => timer.due <= target)
        .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] - b[0])[0];
      if (row === undefined) break;
      timers.delete(row[0]); now = row[1].due; row[1].callback();
    }
    now = target;
  };
  let spawned;
  const spawnedChild = new Promise(resolveSpawn => { spawned = resolveSpawn; });
  const owner = await privateOwner("abg/worker_transport.js", [], {
    "node:child_process": { spawn: (command, args, options) => {
      world.spawned = { command, args, options }; world.child = new M5ControlledChild(); spawned(world.child); return world.child;
    } },
    "../shared/owned_process_lifetime.js": {
      createMonotonicDeadline: () => actual.createMonotonicDeadline(clock),
      createOwnedProcessLifetime: (child, bounds, observations) => actual.createOwnedProcessLifetime(child, { ...bounds, host }, observations),
    },
  });
  return { owner, world, spawnedChild, advanceTo, now: () => now };
}
// One controlled run: drive(child, control) schedules captures and process facts.
async function m5ControlledRun(context, label, bounds, ack, drive) {
  const scratch = await mkdtemp(join(tmpdir(), `abi5-m5-controlled-${label}-`));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const control = await m5ControlledTransport(), acknowledged = [], timeouts = [], log = [];
  const running = m5Settle(() => control.owner.runWorkerTransport({
    contract: constructKnownWorkerTransportContract("generic", { command: process.execPath, prefixArgs: [], environment: {} }),
    prompt: "controlled", lane: "worker_executes", cwd: scratch, archiveRoot: join(scratch, "archive"), label,
    timeoutMs: bounds.timeoutMs, absoluteTimeoutMs: bounds.absoluteTimeoutMs, terminationGraceMs: bounds.graceMs, environment: {},
    observer: {
      onStdoutObserved: chunk => { acknowledged.push({ chunk, atNs: control.now() }); return ack(chunk); },
      onTimeoutObserved: timeoutClass => { timeouts.push({ timeoutClass, atNs: control.now() }); log.push(`timeout:${timeoutClass}`); },
      onSignalRequested: signal => log.push(`signal:${signal}`),
    },
  }));
  const child = await control.spawnedChild;
  child.emit("spawn");
  const emit = (atMs, chunk) => { control.advanceTo(m5Ns(atMs)); log.push(`data:${chunk}`); child.stdout.emit("data", chunk); };
  const exit = (atMs, status, signal) => {
    control.advanceTo(m5Ns(atMs)); control.world.group = "absent"; log.push(`exit:${status}:${signal}`);
    child.emit("exit", status, signal); child.emit("close", status, signal);
  };
  try { await drive({ child, control, emit, exit, timeouts, log }); }
  catch (failure) {
    // A rejected schedule may never let the owner finish: retain the facts
    // available now, owner pending or settled, then rethrow the original.
    const pending = Symbol("pending"), owner = await Promise.race([running, pending]);
    try {
      retainEvidence(context, "m5-worker-transport", `controlled-${label}`, { bounds, log, timeouts, acknowledged,
        signals: control.world.signals, driveFailure: failureFact(failure), owner: owner === pending ? { state: "pending" }
          : { state: "settled", settledMs: owner.settledMs, failure: failureFact(owner.failure), result: owner.result } });
    } catch (retention) { context.diagnostic(`controlled-${label} evidence retention failed: ${retention?.message ?? String(retention)}`); }
    throw failure;
  }
  const settled = await running;
  retainEvidence(context, "m5-worker-transport", `controlled-${label}`, { bounds, log, timeouts, acknowledged,
    signals: control.world.signals, failure: failureFact(settled.failure), result: settled.result });
  if (settled.threw) throw settled.failure;
  return { result: settled.result, acknowledged, timeouts, signals: control.world.signals, log };
}

test("M5 actual owner, controlled clock: a true acknowledgement renews inactivity and the timeout cutoff excludes later semantic bytes", async (context) => {
  const run = await m5ControlledRun(context, "true-ack", { timeoutMs: 100, absoluteTimeoutMs: 1_000, graceMs: 50 }, () => true,
    async ({ control, emit, exit, timeouts }) => {
      emit(60, "renewing\n");
      control.advanceTo(m5Ns(100)); assert.deepEqual(timeouts, [], "the initial lease at 100 was renewed by the acknowledged capture at 60");
      control.advanceTo(m5Ns(160) - 1n); assert.deepEqual(timeouts, []);
      control.advanceTo(m5Ns(160)); assert.deepEqual(timeouts, [{ timeoutClass: "inactivity", atNs: m5Ns(160) }]);
      emit(170, "after-cutoff\n");
      exit(180, null, "SIGTERM");
    });
  assert.deepEqual(run.signals, [{ value: "SIGTERM", atNs: m5Ns(160) }]);
  assert.deepEqual([run.result.timedOut, run.result.timeoutClass, run.result.disposition], [true, "inactivity", "failure"]);
  assert.equal(run.result.stdout, "renewing\nafter-cutoff\n", "raw capture remains open until direct exit");
  assert.equal(run.result.finalOutput, "renewing\n", "semantic output is the stdout prefix at the timeout cutoff");
  assert.equal(run.timeouts.length, 1, "an acknowledgement after the cutoff renews nothing");
});

test("M5 actual owner, controlled clock: a false acknowledgement never renews inactivity", async (context) => {
  const run = await m5ControlledRun(context, "false-ack", { timeoutMs: 100, absoluteTimeoutMs: 1_000, graceMs: 50 }, () => false,
    async ({ control, emit, exit, timeouts }) => {
      emit(30, "unadmitted-0\n"); emit(60, "unadmitted-1\n"); emit(90, "unadmitted-2\n");
      control.advanceTo(m5Ns(100) - 1n); assert.deepEqual(timeouts, []);
      control.advanceTo(m5Ns(100)); assert.deepEqual(timeouts, [{ timeoutClass: "inactivity", atNs: m5Ns(100) }], "the original lease expires unrenewed");
      exit(110, null, "SIGTERM");
    });
  assert.equal(run.acknowledged.length, 3, "three captured chunks were offered and refused acknowledgement");
  assert.deepEqual([run.result.timeoutClass, run.result.finalOutput], ["inactivity", "unadmitted-0\nunadmitted-1\nunadmitted-2\n"]);
});

test("M5 actual owner, controlled clock: continuous true acknowledgements never renew the absolute deadline", async (context) => {
  const run = await m5ControlledRun(context, "absolute", { timeoutMs: 100, absoluteTimeoutMs: 250, graceMs: 50 }, () => true,
    async ({ control, emit, exit, timeouts }) => {
      for (const at of [50, 100, 150, 200]) emit(at, `progress-${at}\n`);
      control.advanceTo(m5Ns(250) - 1n); assert.deepEqual(timeouts, []);
      control.advanceTo(m5Ns(250)); assert.deepEqual(timeouts, [{ timeoutClass: "absolute", atNs: m5Ns(250) }]);
      exit(260, null, "SIGTERM");
    });
  assert.deepEqual([run.result.timeoutClass, run.result.finalOutput], ["absolute", "progress-50\nprogress-100\nprogress-150\nprogress-200\n"]);
});

test("M5 actual owner, controlled clock: descendant bytes after direct exit reach the closed-capture branch and stay outside raw and semantic output", async (context) => {
  const run = await m5ControlledRun(context, "post-exit", { timeoutMs: 100, absoluteTimeoutMs: 1_000, graceMs: 50 }, () => true,
    async ({ control, child, emit, log }) => {
      emit(10, "before-exit\n");
      control.advanceTo(m5Ns(20)); log.push("exit:47:null"); child.emit("exit", 47, null);
      assert.equal(child.stdout.destroyed, true, "the owner closed its capture at direct exit");
      // The owner still listens; this exercises its late-data branch.
      assert.equal(child.stdout.listenerCount("data") > 0, true);
      emit(25, "late-after-exit\n");
      control.advanceTo(m5Ns(30)); control.world.group = "absent"; control.advanceTo(m5Ns(45));
      child.emit("close", 47, null);
    });
  assert.deepEqual(run.signals.map(row => row.value), ["SIGTERM"], "post-exit group cleanup only");
  assert.deepEqual(run.acknowledged.map(row => row.chunk), ["before-exit\n"], "no observation of the late bytes");
  assert.deepEqual([run.result.status, run.result.timedOut, run.result.stdout, run.result.finalOutput], [47, false, "before-exit\n", "before-exit\n"]);
});

test("M5 actual owner, controlled clock: identical ordered progress gives one outcome under split and coalesced capture", async (context) => {
  const records = [...Array.from({ length: 7 }, (_, index) => `progress-${index}`), "complete"], bytes = records.map(row => `${row}\n`).join("");
  const partitions = { recordByRecord: records.map(row => `${row}\n`), oneCoalesced: [bytes],
    fourScheduled: [records[0], records.slice(1, 3).join("\n"), records.slice(3, 5).join("\n"), records.slice(5).join("\n")].map(row => `${row}\n`),
    splitEachByte: [...bytes] };
  const outcomes = [];
  for (const [name, chunks] of Object.entries(partitions)) {
    assert.equal(chunks.join(""), bytes);
    const run = await m5ControlledRun(context, `partition-${name}`, { timeoutMs: 100, absoluteTimeoutMs: 10_000, graceMs: 50 }, () => true,
      async ({ emit, exit }) => { chunks.forEach((chunk, index) => emit(10 * (index + 1), chunk)); exit(10 * (chunks.length + 1), 0, null); });
    const acknowledged = run.acknowledged.map(row => row.chunk).join("");
    outcomes.push({ name, callbacks: run.acknowledged.length, acknowledged, records: m5CompleteRecords(acknowledged),
      disposition: run.result.disposition, timeoutClass: run.result.timeoutClass, stdout: run.result.stdout, finalOutput: run.result.finalOutput });
  }
  for (const outcome of outcomes) {
    assert.deepEqual({ ...outcome, name: undefined, callbacks: undefined }, { name: undefined, callbacks: undefined, acknowledged: bytes,
      records, disposition: "success", timeoutClass: null, stdout: bytes, finalOutput: bytes }, outcome.name);
  }
  assert.deepEqual(outcomes.map(row => row.callbacks), [8, 1, 4, Buffer.byteLength(bytes)], "callback counts differ; the oracle does not");
});

test("M5 actual owner, controlled clock: the progress completion instant is the capture that completes the ordered record under every split, and incomplete completion has none", async (context) => {
  const lease = 100, last = "complete\n", records = ["progress-0", "progress-1", "progress-2", "progress-3", "complete"];
  const bytes = records.map(row => `${row}\n`).join(""), head = [[40, "progress-0\n"], [80, "progress-1\n"], [120, "progress-2\n"]];
  // Each completing schedule makes the final record whole at 200, after the
  // initial lease at 100; only intact and coalesced give it one callback.
  const completing = { intact: [[160, "progress-3\n"], [200, last]], coalesced: [[200, `progress-3\n${last}`]],
    coalescedSplit: [[160, "progress-3\ncomple"], [200, "te\n"]],
    ...Object.fromEntries(Array.from({ length: last.length - 1 }, (_, index) =>
      [`split${index + 1}`, [[160, "progress-3\n"], [180, last.slice(0, index + 1)], [200, last.slice(index + 1)]]])),
    eachByte: [[160, "progress-3\n"], ...[...last].map((byte, index) => [200 - 2 * (last.length - 1 - index), byte])] };
  const incomplete = { missing: [[160, "progress-3\n"]], unterminated: [[160, "progress-3\n"], [200, "complete"]] };
  const observe = async (name, schedule) => {
    let spawnedAt = null;
    const run = await m5ControlledRun(context, `completion-${name}`, { timeoutMs: lease, absoluteTimeoutMs: 1_000, graceMs: 50 }, () => true,
      async ({ control, emit, exit }) => {
        spawnedAt = Number(control.now()) / 1e6;
        for (const [at, chunk] of [...head, ...schedule]) emit(at, chunk);
        exit(220, 0, null);
      });
    const captures = run.acknowledged.map(({ chunk, atNs }) => ({ chunk, at: Number(atNs) / 1e6 }));
    return { run, captures, acknowledged: captures.map(row => row.chunk).join(""), timing: m5ProgressTiming(captures, spawnedAt) };
  };
  for (const [name, schedule] of Object.entries(completing)) {
    const { run, captures, acknowledged, timing } = await observe(name, schedule);
    assert.equal(acknowledged, bytes, name);
    assert.deepEqual(m5CompleteRecords(acknowledged), records, name);
    assert.deepEqual([run.timeouts, run.result.disposition, run.result.timeoutClass, run.result.finalOutput], [[], "success", null, bytes], name);
    assert.equal(captures.some(row => row.chunk.includes(last)), name === "intact" || name === "coalesced", `${name}: partition premise`);
    assert.equal(timing.spawnToCompleteCaptureMs, 200, `${name}: the capture that completed the ordered record`);
    assert.equal(timing.spawnToCompleteCaptureMs > lease, true, `${name}: completion outlasted the initial lease`);
  }
  for (const [name, schedule] of Object.entries(incomplete)) {
    const { run, acknowledged, timing } = await observe(name, schedule);
    assert.equal(run.timeouts.length, 0, name);
    assert.equal(acknowledged.includes(last), false, name);
    assert.equal(timing.spawnToCompleteCaptureMs, null, `${name}: no completion witness`);
  }
});

test("M5 actual owner, controlled clock: a rejected drive retains its available trace without awaiting the pending owner and rethrows the identical failure", async (context) => {
  const retained = [];
  const observed = { after: hook => context.after(hook), diagnostic: text => { retained.push(text); context.diagnostic(text); } };
  let thrown = null, handback;
  const unreturned = new Promise(resolve => { handback = resolve; });
  const running = m5ControlledRun(observed, "drive-rejected", { timeoutMs: 100, absoluteTimeoutMs: 1_000, graceMs: 50 }, () => true,
    async ({ control, emit, timeouts }) => {
      emit(60, "renewing\n"); control.advanceTo(m5Ns(160));
      // The owner now awaits an exit this schedule never supplies. One
      // event-loop turn bounds the handback; the rethrow needs none.
      setImmediate(() => handback({ unreturned: true }));
      try { assert.deepEqual(timeouts, [], "a contrary expectation after the actual inactivity expiry"); }
      catch (failure) { thrown = failure; throw failure; }
    });
  const outcome = await Promise.race([running.then(result => ({ result }), failure => ({ failure })), unreturned]);
  assert.equal(thrown instanceof assert.AssertionError, true, "the driver's own assertion rejected");
  assert.equal(outcome.failure, thrown, "the identical original failure, handed back without awaiting the owner");
  assert.equal(retained.length, 1, "one evidence record precedes the rethrow");
  const record = JSON.parse(retained[0].slice("evidence ".length));
  assert.deepEqual([record.caseId, record.acknowledged, record.timeouts, record.signals, record.owner],
    ["controlled-drive-rejected", [{ chunk: "renewing\n", atNs: String(m5Ns(60)) }], [{ timeoutClass: "inactivity", atNs: String(m5Ns(160)) }],
      [{ value: "SIGTERM", atNs: String(m5Ns(160)) }], { state: "pending" }]);
  assert.deepEqual([record.driveFailure.name, record.driveFailure.message], [thrown.name, thrown.message]);
  assert.equal(record.log.some(entry => entry.startsWith("exit:")), false, "no exit or close was supplied or claimed");
  assert.equal(Object.hasOwn(record, "result"), false, "no owner result is fabricated");
});

test("M5 ABG transport force-terminates a worker that ignores SIGTERM", { timeout: m5Cap(M5_SETUP_MS + 350 + m5CleanupMs(75)) }, async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-bounded-timeout-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "resistant-worker.mjs"), readyPath = join(scratch, "ready.json"), evidencePath = join(scratch, "fixture.jsonl");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "import { appendFileSync, writeFileSync } from 'node:fs';",
    `process.on('SIGTERM', () => appendFileSync(${JSON.stringify(evidencePath)}, JSON.stringify({ event: 'term-ignored' }) + '\\n'));`,
    `writeFileSync(${JSON.stringify(readyPath)}, JSON.stringify({ pid: process.pid, handler: 'SIGTERM' }));`,
    "process.stdout.write('started\\n');",
    "setInterval(() => process.stdout.write('still-running\\n'), 20);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  // Inactivity covers one cold start; acknowledged output then renews it until
  // the absolute deadline, also anchored at spawn.
  const bounds = { timeoutMs: M5_SETUP_MS, absoluteTimeoutMs: M5_SETUP_MS + 350, terminationGraceMs: 75 };
  let processId = null;
  const observedExits = [];
  let unconfirmedTerminations = 0;
  const settled = await m5Settle(() => runWorkerTransport({
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
    ...bounds,
    environment: {},
    observer: {
      onProcessStarted: (pid) => { processId = pid; },
      onStdoutObserved: () => true,
      onProcessFinalized: facts => {
        if (facts.directExit !== null) observedExits.push(facts.directExit);
        if (facts.scopeAbsence !== "absent") unconfirmedTerminations += 1;
      },
    },
  }));
  const { result } = settled;
  const fixture = { ready: await m5Optional(readyPath), events: m5Events(await m5Optional(evidencePath)) };
  retainEvidence(context, "m5-worker-transport", "resistant-worker", { bounds, settledMs: settled.settledMs, processId,
    processAbsent: processId === null ? null : !m5Alive(processId), observedExits, unconfirmedTerminations, fixture,
    failure: failureFact(settled.failure), result, artifacts: await m5Artifacts(join(scratch, "archive"), "resistant-worker") });
  if (settled.threw) throw settled.failure;
  // Premise chain: the handler precedes the ready record and 'started'; that
  // capture precedes the cutoff, which precedes the owner's SIGTERM.
  assert.equal(JSON.parse(fixture.ready ?? "null")?.pid, processId, "fixture body installed its TERM handler");
  assert.match(result.finalOutput, /^started\n/u, "acknowledged fixture output was captured before the cutoff");
  assert.equal(result.disposition, "failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "absolute");
  assert.equal(result.exitObserved, true);
  assert.equal(result.terminationConfirmed, true);
  await assertArchiveDeterminesLifecycleCopies(result);
  assert.deepEqual(observedExits, [{ status: null, signal: "SIGKILL" }]);
  assert.equal(unconfirmedTerminations, 0);
  assert.notEqual(processId, null);
  assert.throws(
    () => process.kill(processId, 0),
    (error) => error?.code === "ESRCH",
  );
  assert.equal(settled.settledMs < bounds.absoluteTimeoutMs + m5CleanupMs(bounds.terminationGraceMs) + M5_ADMINISTRATIVE_MS, true);
});

const M5_PROGRESS = { leaseMs: M5_SETUP_MS, intervalMs: 50, records: Math.ceil((M5_SETUP_MS + 500) / 50) + 1 };
M5_PROGRESS.absoluteMs = 2 * M5_SETUP_MS + M5_PROGRESS.records * M5_PROGRESS.intervalMs;
test("M5 ABG transport renews its inactivity lease only from observed progress", { timeout: m5Cap(M5_PROGRESS.absoluteMs + m5CleanupMs(75)) }, async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-progress-lease-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "progress-worker.mjs");
  // The workload alone (records x interval) outlasts the initial lease, so
  // only acknowledged renewal can keep it live to completion.
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "let ordinal = 0;",
    "process.stdout.write('progress-0\\n');",
    "const progress = setInterval(() => {",
    "  ordinal += 1;",
    `  if (ordinal < ${M5_PROGRESS.records}) { process.stdout.write(\`progress-\${ordinal}\\n\`); return; }`,
    "  clearInterval(progress);",
    "  process.stdout.write('complete\\n', () => process.exit(0));",
    `}, ${M5_PROGRESS.intervalMs});`,
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const records = [...Array.from({ length: M5_PROGRESS.records }, (_, index) => `progress-${index}`), "complete"];
  const expected = records.map(row => `${row}\n`).join("");
  const captures = [];
  let spawnedAt = null;
  const settled = await m5Settle(() => runWorkerTransport({
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
    timeoutMs: M5_PROGRESS.leaseMs,
    absoluteTimeoutMs: M5_PROGRESS.absoluteMs,
    terminationGraceMs: 75,
    environment: {},
    observer: {
      onProcessStarted: () => { spawnedAt = performance.now(); },
      onStdoutObserved: (chunk) => {
        captures.push({ chunk, at: performance.now() });
        return true;
      },
    },
  }));
  const { result } = settled;
  const acknowledged = captures.map(row => row.chunk).join("");
  const timing = m5ProgressTiming(captures, spawnedAt);
  retainEvidence(context, "m5-worker-transport", "progress-lease", { bounds: M5_PROGRESS, settledMs: settled.settledMs, timing,
    acknowledged, failure: failureFact(settled.failure), result, artifacts: await m5Artifacts(join(scratch, "archive"), "progress-worker") });
  if (settled.threw) throw settled.failure;
  // Ordered complete bytes and records, independent of chunk boundaries.
  assert.equal(acknowledged, expected, "every acknowledged byte in order");
  assert.deepEqual(m5CompleteRecords(acknowledged), records);
  assert.equal(result.disposition, "success");
  assert.equal(result.timedOut, false);
  assert.equal(result.timeoutClass, null);
  assert.equal(result.stdout, expected);
  assert.equal(result.finalOutput, expected);
  // The spawn notification follows the lease arm, so this lower-bounds the
  // lease's age at the completing capture.
  assert.equal(timing.spawnToCompleteCaptureMs > M5_PROGRESS.leaseMs, true, "the workload outlasted its initial inactivity lease");
});

test("M5 ABG transport does not renew from unacknowledged output", { timeout: m5Cap(2 * M5_SETUP_MS + m5CleanupMs(75)) }, async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-unadmitted-progress-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "unadmitted-progress-worker.mjs");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "setInterval(() => process.stdout.write('unadmitted\\n'), 20);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const bounds = { timeoutMs: M5_SETUP_MS, absoluteTimeoutMs: 2 * M5_SETUP_MS, terminationGraceMs: 75 };
  const captures = [];
  let timeoutAt = null;
  const settled = await m5Settle(() => runWorkerTransport({
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
    ...bounds,
    environment: {},
    observer: {
      onStdoutObserved: (chunk) => {
        captures.push({ chunk, at: performance.now(), beforeTimeout: timeoutAt === null });
        return false;
      },
      onTimeoutObserved: () => { timeoutAt = performance.now(); },
    },
  }));
  const { result } = settled;
  const beforeCutoff = captures.filter(row => row.beforeTimeout).map(row => row.chunk);
  retainEvidence(context, "m5-worker-transport", "unacknowledged-output", { bounds, settledMs: settled.settledMs,
    captures: captures.map(({ at, beforeTimeout, chunk }) => ({ at, beforeTimeout, bytes: Buffer.byteLength(chunk) })), timeoutAt,
    failure: failureFact(settled.failure), result, artifacts: await m5Artifacts(join(scratch, "archive"), "unadmitted-progress-worker") });
  if (settled.threw) throw settled.failure;
  assert.equal(beforeCutoff.length >= 2, true, "refused acknowledgements were offered before the timeout");
  assert.equal(result.disposition, "failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "inactivity");
  assert.equal(result.finalOutput, beforeCutoff.join(""), "semantic output is exactly the captured prefix at the cutoff");
  assert.equal(result.finalOutput.length > 0, true);
});

test("M5 ABG transport excludes semantic output emitted after its timeout boundary", { timeout: m5Cap(2 * M5_SETUP_MS + m5CleanupMs(250)) }, async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-post-timeout-output-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const workerPath = join(scratch, "post-timeout-worker.mjs"), readyPath = join(scratch, "ready.json"), evidencePath = join(scratch, "fixture.jsonl");
  const transcript = JSON.stringify({ type: "result", subtype: "success", result: JSON.stringify({ kind: "late_worker_output", schemaVersion: "5.0.0" }) });
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "import { appendFileSync, writeFileSync } from 'node:fs';",
    `const evidence = (event, extra = {}) => appendFileSync(${JSON.stringify(evidencePath)}, JSON.stringify({ event, ...extra }) + '\\n');`,
    "process.on('SIGTERM', () => {",
    "  evidence('term-received');",
    `  const transcript = ${JSON.stringify(transcript)};`,
    "  evidence('write-attempt', { bytes: Buffer.byteLength(transcript) + 1 });",
    "  process.stdout.write(`${transcript}\\n`, error => { evidence('write-callback', { code: error?.code ?? null }); process.exit(0); });",
    "});",
    `writeFileSync(${JSON.stringify(readyPath)}, JSON.stringify({ pid: process.pid, handler: 'SIGTERM' }));`,
    "setInterval(() => {}, 1_000);",
    "",
  ].join("\n"), "utf8");
  await chmod(workerPath, 0o755);
  const bounds = { timeoutMs: M5_SETUP_MS, absoluteTimeoutMs: 2 * M5_SETUP_MS, terminationGraceMs: 250 };
  let processId = null;
  const settled = await m5Settle(() => runWorkerTransport({
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
    ...bounds,
    environment: {},
    observer: { onProcessStarted: pid => { processId = pid; } },
  }));
  const { result } = settled;
  const fixture = { ready: await m5Optional(readyPath), events: m5Events(await m5Optional(evidencePath)) };
  retainEvidence(context, "m5-worker-transport", "post-timeout-output", { bounds, settledMs: settled.settledMs, processId, fixture,
    failure: failureFact(settled.failure), result, artifacts: await m5Artifacts(join(scratch, "archive"), "post-timeout-output") });
  if (settled.threw) throw settled.failure;
  // Premise: the handler ran on the owner's SIGTERM and completed its write.
  assert.equal(JSON.parse(fixture.ready ?? "null")?.pid, processId, "fixture body installed its TERM handler");
  assert.deepEqual(fixture.events?.map(row => row.event), ["term-received", "write-attempt", "write-callback"]);
  assert.equal(fixture.events[2].code, null, "the late write completed");
  assert.equal(result.disposition, "failure");
  assert.equal(result.failureClass, "transport_failure");
  assert.equal(result.timedOut, true);
  assert.equal(result.timeoutClass, "inactivity");
  assert.equal(result.finalOutput, "");
  assert.equal(result.structuredEventCount, 0);
  assert.equal(result.stdout, `${transcript}\n`, "raw capture holds the complete late bytes");
  assert.equal(result.artifacts.output.byteLength, 0);
});

// Leader plus descendant: two cold Nodes and the leader's 5ms readiness poll,
// then the original 700ms launch/inactivity, 1500ms absolute and 500ms request
// margins. Normal leaders exit after readiness; TERM leaders wait for the
// owner's timeout, which must follow that readiness.
const M5_GROUP = { timeoutMs: M5_GROUP_SETUP_MS + 700, absoluteTimeoutMs: M5_GROUP_SETUP_MS + 1500,
  requestMs: M5_GROUP_SETUP_MS + 500, graceMs: 150 };
test('owned process groups retain descendant cleanup after normal and TERM leader exits', {
  skip: process.platform === 'win32' && 'win32 platform: owned POSIX process groups and TERM leader exits are unavailable',
  timeout: m5Cap(6 * (M5_GROUP.absoluteTimeoutMs + m5CleanupMs(M5_GROUP.graceMs))),
}, async t => {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-owned-group-')));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  // Expose only the compiled private command/HTTP owners in this component test VM.
  // Its function body and imported owners are unchanged; helper main is not run.
  const modulePath = resolve(import.meta.dirname, '../../build/code/src/implementation/worksite_command_helper.js');
  const source = (await readFile(modulePath, 'utf8')).replace(/await main\(\);\s*$/u, 'export { runCommand, runHttpProbe };');
  assert.match(source, /export \{ runCommand, runHttpProbe \};$/u);
  const priorSignals = new Map(['SIGTERM', 'SIGINT'].map(signal => [signal, process.listeners(signal)]));
  const module = new SourceTextModule(source, { identifier: modulePath });
  await module.link(async specifier => {
    const imported = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(modulePath), specifier)).href);
    return new SyntheticModule(Object.keys(imported), function () {
      for (const [name, value] of Object.entries(imported)) this.setExport(name, value);
    });
  });
  await module.evaluate();
  t.after(() => { for (const [signal, prior] of priorSignals) for (const listener of process.listeners(signal))
    if (!prior.includes(listener)) process.removeListener(signal, listener); });
  const alive = m5Alive;
  for (const owner of ['worker', 'command', 'http']) for (const mode of ['normal', 'TERM']) {
    const label = `${owner}-${mode}`, ready = join(scratch, `${label}-descendant.json`), leaderFile = join(scratch, `${label}-leader.json`);
    const descendant = join(scratch, `${label}-descendant.mjs`), leader = join(scratch, `${label}-leader.mjs`);
    await writeFile(descendant, `import {writeFileSync} from 'node:fs';\nprocess.on('SIGTERM',()=>{});\nwriteFileSync(${JSON.stringify(ready)},JSON.stringify({pid:process.pid,ppid:process.ppid}));\nsetInterval(()=>{},1000);\n`);
    await writeFile(leader, `import {spawn} from 'node:child_process';\nimport {existsSync,writeFileSync} from 'node:fs';\nwriteFileSync(${JSON.stringify(leaderFile)},JSON.stringify({pid:process.pid}));\nconst child=spawn(process.execPath,[${JSON.stringify(descendant)}],{stdio:'ignore'});child.unref();\nconst wait=setInterval(()=>{if(!existsSync(${JSON.stringify(ready)}))return;clearInterval(wait);process.stdout.write('ready\\n');${owner === 'http' ? `writeFileSync(${JSON.stringify(join(scratch, `${label}.port`))},'1');` : ''}${mode === 'normal' ? 'process.exit(0);' : 'setInterval(()=>{},1000);'}},5);\n`);
    let leaderPid = null, startedPid = null;
    const workerSignals = [];
    t.after(async () => { if (leaderPid === null) {
      try { leaderPid = JSON.parse(await readFile(leaderFile, 'utf8')).pid; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
      if (leaderPid !== null) { try { process.kill(-leaderPid, 'SIGKILL'); }
        catch (error) { if (error.code !== 'ESRCH') throw error; } } });
    const { WORKSITE_COMMAND_EXECUTION_IDS } = await import('../../build/code/src/product/worksite_command_execution.js');
    const settled = await m5Settle(async () => {
      if (owner === 'worker') return runWorkerTransport({ contract: constructKnownWorkerTransportContract('generic', {
        command: process.execPath, prefixArgs: [leader], environment: {} }), prompt: 'owned group test', lane: 'worker_executes',
        cwd: scratch, archiveRoot: join(scratch, 'archives'), label, timeoutMs: M5_GROUP.timeoutMs, absoluteTimeoutMs: M5_GROUP.absoluteTimeoutMs,
        terminationGraceMs: M5_GROUP.graceMs, environment: {}, observer: { onProcessStarted: pid => { startedPid = pid; },
          onSignalRequested: signal => workerSignals.push(signal) } });
      if (owner === 'command') return module.namespace.runCommand({ taskRef: `task://fixture/${label}`, taskDigest: 'sha256:' + '4'.repeat(64),
        commands: [{ commandId: `command://fixture/${label}`, executable: process.execPath, args: [leader],
        relativeCwd: '.', environment: [], timeoutMs: M5_GROUP.timeoutMs, terminationGraceMs: M5_GROUP.graceMs, expectedReports: [] }] }, scratch, 0);
      return module.namespace.runHttpProbe({ taskRef: `task://fixture/${label}`, taskDigest: 'sha256:' + '4'.repeat(64) }, scratch, {
        launch: { executable: process.execPath, args: [leader, WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],
          relativeCwd: '.', environment: [], timeoutMs: M5_GROUP.timeoutMs, terminationGraceMs: M5_GROUP.graceMs, portFile: { relativePath: `${label}.port` } },
        request: { hostname: '127.0.0.1', method: 'GET', path: '/', timeoutMs: M5_GROUP.requestMs },
      });
    });
    // Retain owner, fixture and physical facts before any assertion can stop the case.
    const leaderRecord = await m5Optional(leaderFile), readyRecord = await m5Optional(ready);
    const publishedLeader = typeof leaderRecord === 'string' ? JSON.parse(leaderRecord).pid : null;
    leaderPid = startedPid ?? publishedLeader;
    const child = typeof readyRecord === 'string' ? JSON.parse(readyRecord) : null;
    const result = owner === 'http' ? settled.result?.process ?? null : settled.result;
    const signals = owner === 'worker' ? workerSignals : result?.signalSequence ?? null;
    const groupPresent = leaderPid === null ? null : alive(-leaderPid), descendantPresent = child === null ? null : alive(child.pid);
    retainEvidence(t, 'm5-worker-transport', `owned-group-${label}`, { bounds: M5_GROUP, settledMs: settled.settledMs, startedPid,
      leaderRecord, readyRecord, signals, groupPresent, descendantPresent, failure: failureFact(settled.failure), observation: settled.result,
      artifacts: owner === 'worker' ? await m5Artifacts(join(scratch, 'archives'), label) : null });
    if (settled.threw) throw settled.failure;
    assert.notEqual(publishedLeader, null, `${label}: leader body ran`);
    if (owner === 'worker') assert.equal(publishedLeader, startedPid, `${label}: published leader is the spawned owned child`);
    assert.notEqual(child, null, `${label}: descendant body ran before leader readiness`);
    if (owner === 'worker') {
      assert.equal(result.exitObserved, true);
      assert.equal(result.status, mode === 'normal' ? 0 : null);
      assert.equal(result.signal, mode === 'normal' ? null : 'SIGTERM');
    } else {
      if (owner === 'http') assert.equal(settled.result.portFile.state, 'observed', `${label}: port published within the request window`);
      assert.equal(result.exitStatus, mode === 'normal' ? 0 : 124);
      assert.equal(result.processSignal, mode === 'normal' ? null : 'SIGTERM');
    }
    assert.equal(child.ppid, leaderPid, 'actual redirected-stdio descendant belongs to this leader');
    assert.equal(result.timedOut, mode === 'TERM');
    assert.deepEqual(signals, ['SIGTERM', 'SIGKILL']);
    // A surviving zombie/group probe is residue, not a false group-gone claim.
    assert.equal(result.terminationConfirmed, !groupPresent);
    if (descendantPresent) { try { process.kill(-leaderPid, 'SIGKILL'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
      assert.fail(`${label}: owned group remains probe-visible; stop dependent process cases with the unconfirmed residue retained`); }
  }
});

test("M5 ABG transport excludes descendant output emitted after direct-process exit", {
  skip: process.platform === 'win32' && 'win32 platform: owned POSIX process groups are unavailable',
  timeout: m5Cap(M5_GROUP_SETUP_MS + 1000 + m5CleanupMs(500)),
}, async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-post-exit-output-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const descendantPath = join(scratch, "post-exit-descendant.mjs");
  const workerPath = join(scratch, "post-exit-worker.mjs");
  const readyPath = join(scratch, "descendant-ready.json"), evidencePath = join(scratch, "fixture.jsonl");
  const evidence = `const evidence = (event, extra = {}) => appendFileSync(${JSON.stringify(evidencePath)}, JSON.stringify({ event, ...extra }) + '\\n');`;
  // The descendant's late emission is triggered by the owner's group SIGTERM,
  // which the owner requests only after observing the leader's direct exit and
  // closing its capture; the attempt and its outcome are recorded here.
  await writeFile(descendantPath, [
    "#!/usr/bin/env node",
    "import { appendFileSync, writeFileSync } from 'node:fs';",
    evidence,
    "process.on('SIGTERM', () => {",
    "  evidence('term-received');",
    "  const result = JSON.stringify({kind:'late_exit_output',schemaVersion:'5.0.0'});",
    "  const transcript = JSON.stringify({type:'result',subtype:'success',result});",
    "  process.stdout.on('error', error => evidence('stdout-error', { code: error.code ?? null }));",
    "  evidence('write-attempt', { bytes: Buffer.byteLength(transcript) + 1 });",
    "  process.stdout.write(`${transcript}\\n`, error => { evidence('write-callback', { code: error?.code ?? null }); process.exit(0); });",
    "  setTimeout(() => { evidence('fallback-exit'); process.exit(0); }, 100);",
    "});",
    `writeFileSync(${JSON.stringify(readyPath)}, JSON.stringify({ pid: process.pid, ppid: process.ppid }));`,
    "setInterval(() => {}, 1_000);",
    "",
  ].join("\n"), "utf8");
  await writeFile(workerPath, [
    "#!/usr/bin/env node",
    "import { spawn } from 'node:child_process';",
    "import { appendFileSync, existsSync } from 'node:fs';",
    evidence,
    `const descendant = spawn(process.execPath, [${
      JSON.stringify(descendantPath)
    }], {stdio:['ignore','inherit','inherit']});`,
    "descendant.unref();",
    `const wait = setInterval(() => { if (!existsSync(${JSON.stringify(readyPath)})) return; clearInterval(wait); evidence('leader-exit-intent', { status: 47 }); process.exit(47); }, 5);`,
    "",
  ].join("\n"), "utf8");
  await chmod(descendantPath, 0o755);
  await chmod(workerPath, 0o755);
  const bounds = { timeoutMs: M5_GROUP_SETUP_MS, absoluteTimeoutMs: M5_GROUP_SETUP_MS + 1000, terminationGraceMs: 500 };
  let timeoutObservations = 0, processId = null;
  const requestedSignals = [];
  const observedExits = [];
  context.after(() => { if (processId !== null && m5Alive(-processId)) { try { process.kill(-processId, "SIGKILL"); }
    catch (error) { if (error.code !== "ESRCH") throw error; } } });
  const settled = await m5Settle(() => runWorkerTransport({
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
    ...bounds,
    environment: {},
    observer: {
      onProcessStarted: (pid) => { processId = pid; },
      onTimeoutObserved: () => { timeoutObservations += 1; },
      onSignalRequested: (signal) => requestedSignals.push(signal),
      onProcessFinalized: facts => { if (facts.directExit !== null) observedExits.push(facts.directExit); },
    },
  }));
  const { result } = settled;
  const ready = await m5Optional(readyPath), fixture = { ready, events: m5Events(await m5Optional(evidencePath)) };
  const descendant = typeof ready === "string" ? JSON.parse(ready) : null;
  retainEvidence(context, "m5-worker-transport", "post-exit-output", { bounds, settledMs: settled.settledMs, processId, requestedSignals,
    observedExits, timeoutObservations, fixture, groupPresent: processId === null ? null : m5Alive(-processId),
    descendantPresent: descendant === null ? null : m5Alive(descendant.pid), failure: failureFact(settled.failure), result,
    artifacts: await m5Artifacts(join(scratch, "archive"), "post-exit-output") });
  if (settled.threw) throw settled.failure;
  const events = fixture.events ?? [];
  // Premises: the descendant belonged to the leader and was ready before its
  // exit, the leader intended exit 47, and the late emission was attempted.
  assert.equal(descendant?.ppid, processId, "descendant body ran under the owned leader");
  assert.deepEqual(events.slice(0, 3).map(row => row.event), ["leader-exit-intent", "term-received", "write-attempt"]);
  assert.equal(events.some(row => ["write-callback", "stdout-error", "fallback-exit"].includes(row.event)), true, "the late write attempt reached an outcome");
  assert.equal(result.disposition, "failure");
  assert.equal(result.failureClass, "transport_failure");
  assert.equal(result.status, 47);
  assert.equal(result.timedOut, false);
  assert.equal(result.exitObserved, true);
  assert.deepEqual(observedExits, [{ status: 47, signal: null }]);
  assert.equal(timeoutObservations, 0);
  assert.deepEqual(requestedSignals, ["SIGTERM"]);
  assert.equal(result.finalOutput, "");
  assert.equal(result.structuredEventCount, 0);
  assert.doesNotMatch(result.stdout, /late_exit_output/u);
  assert.equal(result.artifacts.output.byteLength, 0);
  assert.equal(m5Alive(-processId), false, "owned group absent before the next case");
});

test('M5 admitted long inactivity, absolute and grace values do not become one-millisecond timeouts', async t => {
  const scratch = await mkdtemp(join(tmpdir(), 'abi5-long-process-bounds-'));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const script = join(scratch, 'worker.mjs');
  await writeFile(script, 'setTimeout(() => process.stdout.write("ordinary-result"), 40);\n');
  let timeouts = 0;
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract('generic', { command: process.execPath, prefixArgs: [script], environment: {} }),
    prompt: 'long bounds', lane: 'worker_executes', cwd: scratch, archiveRoot: join(scratch, 'archive'), label: 'long',
    timeoutMs: 2_147_483_648, absoluteTimeoutMs: Number.MAX_SAFE_INTEGER, terminationGraceMs: 2_147_483_648,
    environment: {}, observer: { onTimeoutObserved: () => { timeouts++; } },
  });
  assert.equal(result.timedOut, false); assert.equal(timeouts, 0); assert.equal(result.exitObserved, true);
  assert.equal(result.terminationConfirmed, true); assert.equal(result.finalOutput, 'ordinary-result');
});

test('M5 a finite native wakeup above the host timer domain does not fire before its owner deadline', async t => {
  const scratch = await mkdtemp(join(tmpdir(), 'abi5-long-native-wakeup-'));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const script = join(scratch, 'worker.mjs');
  await writeFile(script, 'setTimeout(() => process.stdout.write("ordinary-result"), 100);\n');
  let wakeups = 0;
  const result = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract('generic', { command: process.execPath, prefixArgs: [script], environment: {} }),
    prompt: 'controlled wakeup projection', lane: 'worker_executes', cwd: scratch, archiveRoot: join(scratch, 'archive'), label: 'wakeup',
    timeoutMs: 30, absoluteTimeoutMs: 1000, terminationGraceMs: 100, environment: {},
    observer: { onNativeSupervisionWakeup: () => { wakeups++; return {
      projection: { disposition: { disposition: 'continue' } }, admittedThresholdEventRef: null,
      timeoutClass: null, nextWakeDelayMs: Number.MAX_VALUE,
    }; } },
  });
  assert.equal(wakeups, 1); assert.equal(result.timedOut, false); assert.equal(result.terminationConfirmed, true);
  t.diagnostic('Controlled owner wakeup value with a real local process; no native provider or admitted native threshold claim.');
});

test('M5 an actual early stdin close rejects EPIPE after cleanup and leaves the isolated host alive', {
  skip: process.platform === 'win32' && 'win32 platform: owned POSIX process groups and /bin/ps are unavailable', timeout: 10000,
}, async t => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'abi5-owned-stdin-error-')));
  const childFile = join(root, 'finite-child.mjs'), hostFile = join(root, 'host.mjs');
  const workerModule = new URL('../../build/code/src/abg/worker_transport.js', import.meta.url).href;
  const contractModule = new URL('../../build/code/src/abg/transport_contracts.js', import.meta.url).href;
  await writeFile(childFile, `import {closeSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
    writeFileSync(${JSON.stringify(join(root, 'child.json'))},JSON.stringify({pid:process.pid,pgid:Number(execFileSync('/bin/ps',['-o','pgid=','-p',String(process.pid)],{encoding:'utf8'}).trim())}));
    closeSync(0);setTimeout(()=>process.exit(0),300);`);
  await writeFile(hostFile, `import {writeFileSync} from 'node:fs';
    import {runWorkerTransport} from ${JSON.stringify(workerModule)};
    import {constructKnownWorkerTransportContract} from ${JSON.stringify(contractModule)};
    const record=value=>writeFileSync(${JSON.stringify(join(root, 'owner.json'))},JSON.stringify(value));
    try {const result=await runWorkerTransport({contract:constructKnownWorkerTransportContract('claude',{command:process.execPath,prefixArgs:[${JSON.stringify(childFile)}],environment:{}}),
      prompt:'x'.repeat(8388608),lane:'worker_executes',cwd:${JSON.stringify(root)},archiveRoot:${JSON.stringify(join(root, 'archive'))},label:'stdin-error',
      timeoutMs:1000,absoluteTimeoutMs:2000,terminationGraceMs:100,environment:{},observer:{
      onProcessStarted:pid=>writeFileSync(${JSON.stringify(join(root, 'started.json'))},JSON.stringify({pid})),
      onProcessFinalized:facts=>writeFileSync(${JSON.stringify(join(root, 'finalized.json'))},JSON.stringify({...facts,
        firstError:facts.firstError===null?null:{name:facts.firstError.name,code:facts.firstError.code,message:facts.firstError.message}},
        (_key,value)=>typeof value==='bigint'?value.toString():value))}});
      record({kind:'returned',result});process.exitCode=21;
    } catch(error) {record({kind:'rejected',name:error.name,code:error.code,errno:error.errno,syscall:error.syscall,message:error.message,stack:error.stack});}
    writeFileSync(${JSON.stringify(join(root, 'survived.json'))},JSON.stringify({survived:true,pid:process.pid}));`);
  const host = spawn(process.execPath, [hostFile], { detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !['NODE_OPTIONS', 'NODE_COMPILE_CACHE'].includes(key))) });
  const scopeState = pid => { try { process.kill(pid, 0); return 'present'; } catch (error) {
    if (error.code === 'ESRCH') return 'absent'; return 'unknown';
  } };
  const killScope = pid => { try { process.kill(-pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; } };
  let stdout = '', stderr = '', deadlineExpired = false, identity = null;
  const cleanupSignals = [];
  t.after(async () => {
    for (const pid of [host.pid, identity?.pgid]) if (pid !== undefined && scopeState(-pid) === 'present') {
      killScope(pid);
    }
    await rm(root, { recursive: true, force: true });
  });
  host.stdout.on('data', bytes => { stdout += bytes; }); host.stderr.on('data', bytes => { stderr += bytes; });
  const exit = await new Promise((resolveExit, reject) => {
    const timer = setTimeout(() => { deadlineExpired = true; killScope(host.pid); }, 5000);
    host.once('error', error => { clearTimeout(timer); reject(error); });
    host.once('close', (code, signal) => { clearTimeout(timer); resolveExit({ code, signal }); });
  });
  const optionalJson = file => readFile(join(root, file), 'utf8').then(JSON.parse, error => {
    if (error.code === 'ENOENT') return null; throw error;
  });
  identity = await optionalJson('child.json');
  const started = await optionalJson('started.json');
  if (identity === null && started !== null) identity = { pid: started.pid, pgid: started.pid };
  const samples = [];
  for (let i = 0; identity !== null && i < 120; i++) {
    const sample = { group: scopeState(-identity.pgid), pid: scopeState(identity.pid) }; samples.push(sample);
    if (sample.group !== 'present') break;
    await new Promise(resolveWait => setTimeout(resolveWait, 25));
  }
  const observed = { exit, deadlineExpired, hostPid: host.pid, identity, stdout, stderr,
    owner: await optionalJson('owner.json'), finalized: await optionalJson('finalized.json'), survived: await optionalJson('survived.json'), samples };
  // Capture the actual failure/owner/physical facts before assertions or cleanup.
  t.diagnostic(JSON.stringify(observed));
  if (identity !== null && samples.at(-1)?.group === 'present') {
    killScope(identity.pgid); cleanupSignals.push('SIGKILL');
    for (let i = 0; i < 40 && scopeState(-identity.pgid) === 'present'; i++)
      await new Promise(resolveWait => setTimeout(resolveWait, 25));
    t.diagnostic(JSON.stringify({ cleanupSignals, groupAfterCleanup: scopeState(-identity.pgid) }));
  }
  assert.equal(samples.at(-1)?.group, 'absent', 'known worker group is absent before dependent test work');
  assert.deepEqual(cleanupSignals, []); assert.equal(deadlineExpired, false);
  assert.equal(exit.code, 0); assert.equal(exit.signal, null); assert.equal(observed.survived?.survived, true);
  assert.equal(observed.owner?.kind, 'rejected'); assert.equal(observed.owner.code, 'EPIPE');
  assert.equal(observed.owner.syscall, 'write'); assert.equal(observed.owner.message, 'write EPIPE');
  assert.equal(observed.finalized.scopeAbsence, 'absent'); assert.notEqual(observed.finalized.directExit, null);
  assert.equal(observed.finalized.firstError.code, 'EPIPE'); assert.equal(observed.finalized.noChildEstablished, false);
  assert.doesNotMatch(stderr, /Unhandled 'error' event/u);
  assert.equal(await optionalJson('archive/stdin-error-transport.json'), null, 'no fabricated transport result');
});

// TD-11: the head observer, transcribed from code/src/abg/worker_transport.ts
// at d826dd0fc (:154-210, :239-352). It is the reference for the incremental
// tool projection: every cut rebuilds the unique rows from all raw rows, with
// one `find` over the unique rows so far for each raw row.
function headToolUseIdentityInput(toolName, input) {
  if (toolName !== "Bash") return input;
  if (!isRecord(input)) throw new TypeError("Bash tool input must be one object");
  const record = input;
  if (!Object.hasOwn(record, "command") || typeof record.command !== "string") {
    throw new TypeError("Bash tool input must carry one exact command string");
  }
  if (Object.hasOwn(record, "description") && typeof record.description !== "string") {
    throw new TypeError("Bash tool input description must be a string when present");
  }
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== "description"));
}
function headCollectToolUses(value, structuredOutputExpected, rows) {
  if (Array.isArray(value)) {
    for (const entry of value) headCollectToolUses(entry, structuredOutputExpected, rows);
    return;
  }
  if (!isRecord(value)) return;
  const record = value;
  const protocolStructuredOutput = structuredOutputExpected &&
    record.type === "tool_use" && record.name === "StructuredOutput";
  if (record.type === "tool_use" && !protocolStructuredOutput &&
    typeof record.id === "string" && record.id.length > 0 &&
    typeof record.name === "string" && record.name.length > 0 &&
    Object.hasOwn(record, "input") && record.input !== undefined) {
    try {
      const inputBytes = Buffer.from(canonicalJson(headToolUseIdentityInput(record.name, record.input)), "utf8");
      rows.push(deepFreeze({
        kind: "worker_tool_invocation_evidence", schemaVersion: "5.0.0", ordinal: rows.length,
        toolUseRef: record.id, toolName: record.name, inputDigest: sha256Bytes(inputBytes), inputByteLength: inputBytes.byteLength,
      }));
    } catch { /* counted, not evidenced */ }
  }
  for (const entry of Object.values(record)) headCollectToolUses(entry, structuredOutputExpected, rows);
}
function headCountToolUses(value, structuredOutputExpected) {
  if (Array.isArray(value)) return value.reduce((count, entry) => count + headCountToolUses(entry, structuredOutputExpected), 0);
  if (typeof value !== "object" || value === null) return 0;
  const record = value;
  const protocolStructuredOutput = structuredOutputExpected && record.type === "tool_use" && record.name === "StructuredOutput";
  const current = record.type === "tool_use" && !protocolStructuredOutput ? 1 : 0;
  return Object.values(record).reduce((count, entry) => count + headCountToolUses(entry, structuredOutputExpected), current);
}
function headWorkerTransportOutputObserver(structuredOutputExpected) {
  let pending = "";
  let structuredEventCount = 0;
  let finalOutput = "";
  let progressEventCount = 0;
  let rawToolCallCount = 0;
  const rawToolInvocations = [];
  let apiRetryCount = 0;
  const observeLine = (line) => {
    if (line.trim().length === 0) return;
    let value;
    try { value = JSON.parse(line); } catch { return; }
    structuredEventCount += 1;
    if (typeof value !== "object" || value === null || Array.isArray(value)) return;
    const record = value;
    const retry = record.type === "api_retry" || record.type === "system" && record.subtype === "api_retry";
    if (retry) { apiRetryCount += 1; return; }
    const streamEvent = record.type === "stream_event" && typeof record.event === "object" && record.event !== null
      ? record.event : null;
    const reportedThinking = record.type === "system" && record.subtype === "thinking_tokens" &&
      typeof record.estimated_tokens_delta === "number" && record.estimated_tokens_delta > 0;
    if (record.type === "assistant" || record.type === "user" || record.type === "tool_progress" || reportedThinking ||
        streamEvent !== null && ["message_start", "content_block_start", "content_block_delta",
          "content_block_stop", "message_delta", "message_stop"].includes(String(streamEvent.type))) progressEventCount += 1;
    if (record.type !== "stream_event") {
      rawToolCallCount += headCountToolUses(record, structuredOutputExpected);
      headCollectToolUses(value, structuredOutputExpected, rawToolInvocations);
    }
    if (record.type === "result") {
      if (structuredOutputExpected) {
        finalOutput = "";
        if (record.subtype !== "success" || record.is_error !== false) return;
        try {
          const admitted = admitIJsonText(line, "worker structured result");
          if (isRecord(admitted) && Object.hasOwn(admitted, "structured_output")) {
            finalOutput = canonicalJson(admitted.structured_output);
          }
        } catch { /* raw stream retained */ }
      } else if (typeof record.result === "string") {
        finalOutput = record.result;
      }
    }
  };
  const snapshot = () => {
    const toolInvocations = [];
    let conflictingToolUseRef = false;
    for (const row of rawToolInvocations) {
      const prior = toolInvocations.find((candidate) => candidate.toolUseRef === row.toolUseRef);
      if (prior === undefined) {
        toolInvocations.push(deepFreeze({ ...row, ordinal: toolInvocations.length }));
      } else if (prior.toolName !== row.toolName || prior.inputDigest !== row.inputDigest ||
        prior.inputByteLength !== row.inputByteLength) {
        conflictingToolUseRef = true;
      }
    }
    const unevidencedToolUse = rawToolCallCount > rawToolInvocations.length;
    return {
      structuredEventCount,
      progressEventCount,
      toolCallCount: conflictingToolUseRef || unevidencedToolUse ? toolInvocations.length + 1 : toolInvocations.length,
      toolInvocations: deepFreeze(toolInvocations),
      apiRetryCount,
      finalOutput,
    };
  };
  return {
    observe(chunk) {
      pending += chunk;
      let newline;
      while ((newline = pending.indexOf("\n")) !== -1) {
        observeLine(pending.slice(0, newline));
        pending = pending.slice(newline + 1);
      }
      return snapshot();
    },
    finish() { observeLine(pending); pending = ""; return snapshot(); },
  };
}

const td11Tool = (id, name, input) => ({ type: "tool_use", ...(id === undefined ? {} : { id }), name,
  ...(input === undefined ? {} : { input }) });
const td11Assistant = (...content) => JSON.stringify({ type: "assistant", message: { content } });
// Rows every TD-11 stream shares: retries (one carrying a nested tool_use),
// thinking progress, partial stream tool blocks, two tool_use blocks in one
// line, a non-BMP character, an equal duplicate, a Bash duplicate differing
// only in description, StructuredOutput, malformed, blank and non-object rows,
// a failed result carrying a nested tool_use, and a successful result with
// structured_output.
const TD11_COMMON = [
  JSON.stringify({ type: "system", subtype: "init" }),
  JSON.stringify({ type: "system", subtype: "api_retry", attempt: 1, nested: td11Tool("toolu_retry", "Read", { path: "r" }) }),
  JSON.stringify({ type: "api_retry" }),
  JSON.stringify({ type: "system", subtype: "thinking_tokens", estimated_tokens: 9, estimated_tokens_delta: 5 }),
  JSON.stringify({ type: "stream_event", event: { type: "content_block_start", content_block: td11Tool("toolu_a", "Read", {}) } }),
  JSON.stringify({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: '{"path":"α' } } }),
  td11Assistant(td11Tool("toolu_a", "Read", { path: "α.txt" }), td11Tool("toolu_b", "Bash", { command: "ls", description: "list" })),
  JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: "toolu_a", content: [{ type: "text", text: "ok 😀" }] }] } }),
  td11Assistant(td11Tool("toolu_a", "Read", { path: "α.txt" })),
  td11Assistant(td11Tool("toolu_b", "Bash", { description: "other words", command: "ls" })),
  td11Assistant(td11Tool("toolu_so", "StructuredOutput", { kind: "bounded_verdict", count: 0 })),
  "not json {",
  "",
  "   ",
  JSON.stringify([1, 2]),
  JSON.stringify("text"),
  JSON.stringify({ type: "result", subtype: "error_max_turns", is_error: true, nested: [td11Tool("toolu_failed", "Read", { path: "f" })] }),
  JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "interim", structured_output: { kind: "bounded_verdict", count: 1 } }),
];
const TD11_STREAMS = {
  // Equal and differing duplicates: a differing input, then a differing name.
  conflict: [...TD11_COMMON,
    td11Assistant(td11Tool("toolu_c", "Edit", { path: "c", text: "one" })),
    td11Assistant(td11Tool("toolu_c", "Edit", { path: "c", text: "two" })),
    td11Assistant(td11Tool("toolu_d", "Read", { path: "d" }), td11Tool("toolu_d", "Write", { path: "d" })),
    JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "final α" }),
  ].join("\n") + "\n",
  // A tool_use without an id, Bash without a command, a tool_use without input;
  // the final successful result is a partial line that only `finish` drains.
  unevidenced: [...TD11_COMMON,
    td11Assistant(td11Tool(undefined, "Read", { path: "x" })),
    td11Assistant(td11Tool("toolu_e", "Bash", { description: "no command" })),
    td11Assistant(td11Tool("toolu_f", "Read")),
    td11Assistant(td11Tool("toolu_g", "Glob", { pattern: "*" })),
    JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "final β", structured_output: { kind: "bounded_verdict", count: 2 } }),
  ].join("\n"),
  // Neither rule: only first-seen rows and equal duplicates; final partial line.
  plain: [...TD11_COMMON, td11Assistant(td11Tool("toolu_h", "Read", { path: "h" })),
    JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "final γ" })].join("\n"),
};
function td11SameCut(actual, expected, where) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), where);
  assert.deepStrictEqual(actual, expected, where);
  assert.equal(Object.isFrozen(actual), Object.isFrozen(expected), where);
  assert.equal(isDeeplyFrozen(actual.toolInvocations), true, where);
  assert.equal(isDeeplyFrozen(expected.toolInvocations), true, where);
}
function td11Splits(text) {
  const splits = [];
  for (let width = 1; width <= text.length; width += 1) {
    const chunks = [];
    for (let index = 0; index < text.length; index += width) chunks.push(text.slice(index, index + width));
    splits.push([`width ${width}`, chunks]);
  }
  for (let seed = 1; seed <= 16; seed += 1) {
    let state = seed * 2654435761 >>> 0;
    const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0);
    const chunks = [];
    for (let index = 0; index < text.length;) {
      const width = 1 + next() % (next() % 2 === 0 ? 7 : 300);
      chunks.push(text.slice(index, index + width)); index += width;
    }
    splits.push([`seed ${seed}`, chunks]);
  }
  return splits;
}

test("TD-11: the incremental tool projection equals the head projection at every cut", () => {
  for (const [name, text] of Object.entries(TD11_STREAMS)) {
    for (const requested of [true, false]) {
      const head = headWorkerTransportOutputObserver(requested);
      head.observe(text);
      const expectedFinal = head.finish();
      for (const [split, chunks] of td11Splits(text)) {
        const where = `${name} requested=${requested} ${split}`;
        const reference = headWorkerTransportOutputObserver(requested);
        const observer = createWorkerTransportOutputObserver(requested);
        const retained = [];
        chunks.forEach((chunk, index) => {
          const pair = [observer.observe(chunk), reference.observe(chunk)];
          td11SameCut(...pair, `${where} chunk ${index}`);
          retained.push(pair);
        });
        const pair = [observer.finish(), reference.finish()];
        td11SameCut(...pair, `${where} finish`);
        td11SameCut(pair[0], expectedFinal, `${where} finish against one whole chunk`);
        retained.push(pair);
        // A snapshot read later is the value it had at its cut.
        retained.forEach(([actual, expected], index) => td11SameCut(actual, expected, `${where} retained ${index}`));
      }
      const refs = expectedFinal.toolInvocations.map(row => row.toolUseRef);
      assert.deepEqual(expectedFinal.toolInvocations.map(row => row.ordinal), refs.map((_, ordinal) => ordinal));
      assert.equal(refs.includes("toolu_retry"), false, "a retry row admits no tool evidence");
      assert.equal(refs.includes("toolu_so"), !requested, "StructuredOutput is protocol only when structured output is expected");
      assert.equal(refs.includes("toolu_failed"), true, "a failed result row still carries its complete tool_use");
      assert.equal(expectedFinal.apiRetryCount, 2);
      assert.equal(expectedFinal.toolCallCount, expectedFinal.toolInvocations.length + (name === "plain" ? 0 : 1), `${name} +1 rule`);
    }
  }
  const finalOf = (text, requested) => { const observer = createWorkerTransportOutputObserver(requested); observer.observe(text); return observer.finish(); };
  assert.deepEqual(finalOf(TD11_STREAMS.conflict, true).toolInvocations.map(row => row.toolUseRef),
    ["toolu_a", "toolu_b", "toolu_failed", "toolu_c", "toolu_d"]);
  assert.equal(finalOf(TD11_STREAMS.conflict, false).finalOutput, "final α");
  assert.equal(finalOf(TD11_STREAMS.unevidenced, true).finalOutput, canonicalJson({ kind: "bounded_verdict", count: 2 }));
  assert.equal(finalOf(TD11_STREAMS.plain, true).finalOutput, "", "a final success without structured_output selects nothing");
  assert.equal(finalOf(TD11_STREAMS.plain, false).finalOutput, "final γ");
});

// TD-11 counter. Old-row visits during one `observe`: each callback call of
// an Array search over tool evidence rows (the head `find` comparison), and
// each Map lookup of a TD-11 tool ref (the incremental first-seen check).
test("TD-11: old tool rows are not revisited per chunk; visits per observe are independent of N", t => {
  const PREFIX = "toolu_td11_";
  let visits = 0;
  const spied = [];
  const arm = () => {
    for (const name of ["find", "findIndex", "findLast", "findLastIndex", "some", "every", "filter"]) {
      const original = Array.prototype[name];
      spied.push([Array.prototype, name, original]);
      Array.prototype[name] = function (callback, self) {
        return original.call(this, function (element, ...rest) {
          if (element !== null && typeof element === "object" && element.kind === "worker_tool_invocation_evidence") visits += 1;
          return callback.call(self, element, ...rest);
        });
      };
    }
    for (const name of ["get", "has"]) {
      const original = Map.prototype[name];
      spied.push([Map.prototype, name, original]);
      Map.prototype[name] = function (key) {
        if (typeof key === "string" && key.startsWith(PREFIX)) visits += 1;
        return original.call(this, key);
      };
    }
  };
  const disarm = () => { for (const [owner, name, original] of spied.splice(0)) owner[name] = original; };
  const line = index => td11Assistant(td11Tool(`${PREFIX}${index}`, "Read", { path: `f${index}` })) + "\n";
  const run = (observer, n) => {
    const perObserve = [];
    let last;
    for (let index = 0; index < n; index += 1) {
      visits = 0; arm();
      try { last = observer.observe(line(index)); } finally { disarm(); }
      perObserve.push(visits);
    }
    return { perObserve, total: perObserve.reduce((sum, count) => sum + count, 0), last };
  };
  const counts = {};
  for (const n of [1, 64, 512]) {
    const head = run(headWorkerTransportOutputObserver(false), n);
    const after = run(createWorkerTransportOutputObserver(false), n);
    td11SameCut(after.last, head.last, `N = ${n}`);
    assert.equal(after.last.toolInvocations.length, n);
    // Head: the k-th observe compares k(k-1)/2 pairs; (N-1)N(N+1)/6 in all.
    assert.equal(head.total, (n - 1) * n * (n + 1) / 6, `head total at N = ${n}`);
    assert.equal(head.perObserve.at(-1), n * (n - 1) / 2, `head last observe at N = ${n}`);
    // After: one first-seen lookup for the one new row, whatever N is.
    assert.deepEqual([...new Set(after.perObserve)], [1], `after per observe at N = ${n}`);
    counts[n] = { headTotal: head.total, headLast: head.perObserve.at(-1), afterTotal: after.total, afterMax: Math.max(...after.perObserve) };
  }
  // A chunk that adds no tool row reads no tool state at all.
  const observer = createWorkerTransportOutputObserver(false);
  for (let index = 0; index < 64; index += 1) observer.observe(line(index));
  visits = 0; arm();
  let progress;
  try { progress = observer.observe(JSON.stringify({ type: "stream_event", event: { type: "content_block_delta" } }) + "\n"); }
  finally { disarm(); }
  assert.equal(visits, 0); assert.equal(progress.toolInvocations.length, 64);
  t.diagnostic(`TD-11 visit counts ${JSON.stringify(counts)}`);
});

// Q23 configured actor identity. The transport owner derives it from one exact
// prepared selection; it is configured selection under the trusted desktop,
// never remote provider attestation.
function q23Selection(agentKey, environment = {}, explicitAppendArgs, prompt = "assess") {
  const contract = constructKnownWorkerTransportContract(agentKey, { environment });
  const args = composeWorkerTransportArgs({ contract, prompt, outputPath: "/synthetic/output", lane: "worker_executes", environment,
    ...(explicitAppendArgs === undefined ? {} : { explicitAppendArgs }) });
  return { contract, args, binding: { agentKey, promptTransport: contract.promptTransport, args },
    identity: deriveConfiguredActorIdentity(contract, args, environment) };
}
const q23Unknown = identity => [identity.disposition, identity.reason];

test("M5 Q23 configured identity is the one exact model selection of the final arguments and captured environment; anything else stays unknown", () => {
  const opus = q23Selection("claude", { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", "claude-opus-5-5", "--effort", "xhigh"]) });
  assertClaudeProtocol(opus.args);
  const index = opus.args.indexOf("--model") + 1;
  assert.deepEqual(opus.identity, { kind: "configured_actor_identity", schemaVersion: "5.0.0", disposition: "established",
    model: "claude-opus-5-5", source: { kind: "transport_argument", argumentIndex: index } });
  assert.equal(opus.args[index], "claude-opus-5-5", "the source coordinate names the final argument itself");
  assert.equal(isDeeplyFrozen(opus.identity), true);
  const inline = q23Selection("claude", {}, ["--model=claude-opus-5-5"]);
  assert.equal(inline.identity.model, "claude-opus-5-5");
  assert.equal(inline.args[inline.identity.source.argumentIndex], "--model=claude-opus-5-5");
  // Codex selects through its own protocol template; an argv prompt is data, never an option.
  const astra = q23Selection("codex", { ABG_TS_CODEX_MODEL: "gpt-6-astra" }, undefined, "--model=claude-opus-5-5");
  assert.equal(astra.identity.model, "gpt-6-astra");
  assert.equal(astra.args[astra.identity.source.argumentIndex], "gpt-6-astra");
  assert.equal(astra.args.at(-1), "--model=claude-opus-5-5");
  // The same captured value agrees; an empty value is no selection.
  const plain = q23Selection("claude", {}, ["--model", "claude-opus-5-5"]).identity;
  assert.equal(plain.disposition, "established");
  for (const ANTHROPIC_MODEL of ["claude-opus-5-5", ""])
    assert.deepEqual(q23Selection("claude", { ANTHROPIC_MODEL }, ["--model", "claude-opus-5-5"]).identity, plain, `captured ANTHROPIC_MODEL=${JSON.stringify(ANTHROPIC_MODEL)}`);
  for (const [name, selection, expected] of [
    ["no selector leaves the provider default unresolved", q23Selection("claude"), "model_selection_absent"],
    ["two selectors", q23Selection("claude", { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", "claude-opus-5-5"]) }, ["--model", "claude-opus-5-5"]), "model_selection_ambiguous"],
    ["a selector without a value", q23Selection("claude", {}, ["--model"]), "model_selection_ambiguous"],
    ["a selector whose value is an option", q23Selection("claude", {}, ["--model", "--verbose"]), "model_selection_ambiguous"],
    ["a fallback model can replace it", q23Selection("claude", {}, ["--model", "claude-opus-5-5", "--fallback-model", "claude-sonnet-5-5"]), "model_selection_ambiguous"],
    ["settings can remap it", q23Selection("claude", {}, ["--model", "claude-opus-5-5", "--settings", "/synthetic/settings.json"]), "model_selection_ambiguous"],
    ["an agent can replace it", q23Selection("claude", {}, ["--model", "claude-opus-5-5", "--agent", "reviewer"]), "model_selection_ambiguous"],
    ["a differing captured environment", q23Selection("claude", { ANTHROPIC_MODEL: "claude-sonnet-5-5" }, ["--model", "claude-opus-5-5"]), "model_environment_conflict"],
    ["a second codex selector", q23Selection("codex", { ABG_TS_CODEX_MODEL: "gpt-6-astra", ABG_TS_CODEX_APPEND_ARGS: JSON.stringify(["-m", "gpt-6-astra"]) }), "model_selection_ambiguous"],
    ["a codex profile", q23Selection("codex", { ABG_TS_CODEX_MODEL: "gpt-6-astra", ABG_TS_CODEX_APPEND_ARGS: JSON.stringify(["--profile", "other"]) }), "model_selection_ambiguous"],
    ["a codex configuration override", q23Selection("codex", { ABG_TS_CODEX_MODEL: "gpt-6-astra", ABG_TS_CODEX_APPEND_ARGS: JSON.stringify(["-c", "model=other"]) }), "model_selection_ambiguous"],
    ["gemini has no declared selection grammar", q23Selection("gemini"), "agent_model_selection_unsupported"],
    ["generic has no declared selection grammar", q23Selection("generic"), "agent_model_selection_unsupported"],
  ]) {
    assert.deepEqual(q23Unknown(selection.identity), ["unknown", expected], name);
    assert.equal(isConfiguredActorIdentity(selection.identity), true, name);
    assert.equal(configuredActorIdentityCorresponds(selection.identity, selection.binding), true, `${name}: corresponds to its own binding`);
  }
  // The closed guard: no extra member, empty model or non-index coordinate.
  for (const forged of [{ ...opus.identity, provider: "anthropic" }, { ...opus.identity, model: "" },
    { ...opus.identity, source: { kind: "transport_argument", argumentIndex: -1 } }, { ...opus.identity, source: { kind: "transport_argument", argumentIndex: 1.5 } },
    { ...opus.identity, source: { kind: "environment", argumentIndex: index } }, { kind: "configured_actor_identity", schemaVersion: "5.0.0", disposition: "unknown", reason: "renamed_role" },
    { kind: "configured_actor_identity", schemaVersion: "5.0.0", disposition: "established", reason: "model_selection_absent" }])
    assert.equal(isConfiguredActorIdentity(forged), false, JSON.stringify(forged));
  // Correspondence re-derives from the binding's own agent, delivery and final arguments.
  assert.equal(configuredActorIdentityCorresponds(opus.identity, opus.binding), true);
  for (const [name, identity, binding] of [
    ["a renamed model", { ...opus.identity, model: "claude-fable-5-1" }, opus.binding],
    ["a moved coordinate", { ...opus.identity, source: { kind: "transport_argument", argumentIndex: index - 1 } }, opus.binding],
    ["another agent's arguments", opus.identity, { ...opus.binding, agentKey: "codex" }],
    // Relabelling argv delivery as stdin turns the prompt "--model=..." into a second selector.
    ["another prompt delivery", astra.identity, { ...astra.binding, promptTransport: "stdin" }],
    ["changed final arguments", opus.identity, { ...opus.binding, args: [...opus.args, "--model", "claude-opus-5-5"] }],
    ["an unknown identity over a selecting binding", q23Selection("claude").identity, opus.binding],
    ["an established identity over a non-selecting binding", opus.identity, q23Selection("claude").binding],
    ["an environment conflict over a non-selecting binding", { kind: "configured_actor_identity", schemaVersion: "5.0.0", disposition: "unknown", reason: "model_environment_conflict" }, q23Selection("claude").binding],
    ["non-string arguments", opus.identity, { ...opus.binding, args: [...opus.args.slice(0, -1), 7] }],
  ]) assert.equal(configuredActorIdentityCorresponds(identity, binding), false, name);
  // Only the captured environment is not replayable from a binding: a
  // recorded conflict corresponds wherever the arguments themselves select.
  assert.equal(configuredActorIdentityCorresponds(q23Selection("claude", { ANTHROPIC_MODEL: "claude-sonnet-5-5" }, ["--model", "claude-opus-5-5"]).identity,
    q23Selection("claude", {}, ["--model", "claude-opus-5-5"]).binding), true);
});

test("M5 Q23 selector-shaped data in a declared option operand selects no model; an option of unknown arity leaves the selection unknown", () => {
  // Closed review Q23-SR-02: the only selector-shaped argument is the operand of
  // --append-system-prompt, the option actor_process itself uses for prompt data.
  for (const [name, append] of [
    ["inline selector text as the prompt operand", ["--append-system-prompt", "--model=claude-opus-5-5"]],
    ["separate selector text as the prompt operand", ["--append-system-prompt", "--model", "claude-opus-5-5"]],
  ]) {
    const selection = q23Selection("claude", {}, append);
    assert.deepEqual(q23Unknown(selection.identity), ["unknown", "model_selection_absent"], name);
    assert.equal(configuredActorIdentityCorresponds(selection.identity, selection.binding), true, `${name}: corresponds to its own binding`);
    // The identity read from the operand no longer corresponds to these arguments.
    const fromOperand = { kind: "configured_actor_identity", schemaVersion: "5.0.0", disposition: "established", model: "claude-opus-5-5",
      source: { kind: "transport_argument", argumentIndex: selection.args.lastIndexOf(append.at(-1)) } };
    assert.equal(isConfiguredActorIdentity(fromOperand), true);
    assert.equal(configuredActorIdentityCorresponds(fromOperand, selection.binding), false, `${name}: an identity read from the operand`);
  }
  // The actor owner's own composition: prompt data that looks like a selector, then one real selector.
  const environment = { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", "claude-opus-5-5"]) };
  const base = constructKnownWorkerTransportContract("claude", { environment });
  const contract = { ...base, argsTemplate: [...base.argsTemplate, "--tools", "Read,Edit,Write,Glob,Grep,Bash", "--append-system-prompt", "--model=claude-fable-5-1"] };
  const args = composeWorkerTransportArgs({ contract, prompt: "assess", outputPath: "/synthetic/output", lane: "worker_executes", environment,
    responseJsonSchema: { type: "object" } });
  const owned = deriveConfiguredActorIdentity(contract, args, environment);
  assert.deepEqual([owned.disposition, owned.model], ["established", "claude-opus-5-5"], "the operand is data; the real selector selects");
  assert.deepEqual(args.slice(owned.source.argumentIndex - 1, owned.source.argumentIndex + 1), ["--model", "claude-opus-5-5"]);
  assert.equal(configuredActorIdentityCorresponds(owned, { agentKey: "claude", promptTransport: contract.promptTransport, args }), true);
  // Ordinary unknown options keep an established selection when their role is clear.
  for (const [name, append] of [
    ["an unknown option with its value before the selector", ["--effort", "xhigh", "--model", "claude-opus-5-5"]],
    ["an unknown option with an inline value before the selector", ["--effort=xhigh", "--model", "claude-opus-5-5"]],
    ["a declared operand given inline before the selector", ["--append-system-prompt=--model=claude-fable-5-1", "--model", "claude-opus-5-5"]],
  ]) assert.equal(q23Selection("claude", {}, append).identity.model, "claude-opus-5-5", name);
  // Unsupported grammar: a selector-shaped argument whose role the closed grammar cannot decide.
  for (const [name, selection] of [
    ["an option outside the grammar directly before inline selector text", q23Selection("claude", {}, ["--system-prompt", "--model=claude-opus-5-5"])],
    ["an option outside the grammar directly before a selector", q23Selection("claude", {}, ["--effort", "--model", "claude-opus-5-5"])],
    ["selector text after the end of options", q23Selection("claude", {}, ["--", "assess", "--model", "claude-opus-5-5"])],
  ]) {
    assert.deepEqual(q23Unknown(selection.identity), ["unknown", "model_selection_ambiguous"], name);
    assert.equal(configuredActorIdentityCorresponds(selection.identity, selection.binding), true, `${name}: corresponds to its own binding`);
  }
});

test("M5 Q23 a prepared plan executes its own bound selection; later caller or ambient changes cannot change it", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-q23-owned-plan-"));
  const ambient = process.env.ANTHROPIC_MODEL;
  context.after(async () => {
    if (ambient === undefined) delete process.env.ANTHROPIC_MODEL; else process.env.ANTHROPIC_MODEL = ambient;
    await rm(scratch, { force: true, recursive: true });
  });
  const workerPath = join(scratch, "claude-selection-fixture.mjs");
  await writeFile(workerPath, [
    "process.stdin.resume();",
    "process.stdin.on('end', () => {",
    "  console.log(JSON.stringify({type:'system', subtype:'init'}));",
    "  console.log(JSON.stringify({type:'result', subtype:'success', result:JSON.stringify({argv:process.argv.slice(2), anthropicModel:process.env.ANTHROPIC_MODEL ?? null})}));",
    "});",
    "",
  ].join("\n"), "utf8");
  const environment = { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", "claude-opus-5-5"]) };
  // Mutable caller copies: the plan must own frozen ones.
  const contract = structuredClone(constructKnownWorkerTransportContract("claude", { command: process.execPath, prefixArgs: [workerPath], environment }));
  const explicitAppendArgs = ["--effort", "xhigh"];
  const request = { contract, prompt: "assess", lane: "worker_executes", cwd: scratch, archiveRoot: join(scratch, "archive"),
    label: "q23-owned-plan", timeoutMs: 10_000, environment, explicitAppendArgs };
  const plan = await prepareWorkerTransport(request);
  const bound = structuredClone(plan.configuredIdentity);
  assert.equal(bound.disposition, "established");
  assert.equal(bound.model, "claude-opus-5-5");
  assert.equal(plan.args[bound.source.argumentIndex], "claude-opus-5-5");
  assert.equal(configuredActorIdentityCorresponds(plan.configuredIdentity, plan), true, "the plan's own agent, delivery and arguments");
  // Every caller-held input and the ambient process environment now change.
  contract.argsTemplate.push("--model", "claude-fable-5-1");
  explicitAppendArgs.push("--fallback-model", "claude-sonnet-5-5");
  environment.ABG_TS_CLAUDE_APPEND_ARGS = JSON.stringify(["--model", "claude-fable-5-1"]);
  environment.ANTHROPIC_MODEL = "claude-sonnet-5-5";
  process.env.ANTHROPIC_MODEL = "claude-sonnet-5-5";
  const result = await runPreparedWorkerTransport(plan);
  assert.equal(result.disposition, "success");
  assert.deepEqual(result.args, plan.args);
  const observed = JSON.parse(result.finalOutput);
  assert.deepEqual(observed.argv, plan.args.slice(1), "the process received exactly the bound arguments");
  assert.equal(observed.anthropicModel, null, "the process received the captured environment, not the changed one");
  assert.deepEqual(plan.configuredIdentity, bound);
  // The same changed caller inputs prepared now select differently; the bound plan did not.
  const again = await prepareWorkerTransport({ ...request, label: "q23-owned-plan-again" });
  assert.notEqual(again.planDigest, plan.planDigest);
  assert.deepEqual(q23Unknown(again.configuredIdentity), ["unknown", "model_selection_ambiguous"]);
});

test("M5 Q23 the current binding contract records one corresponding identity; a mismatch is refused and the legacy profile cannot carry it", async () => {
  // The exact emitted private contract guard of the event store; no store is opened.
  const { assertRuntimeEventContract } = await privateOwner("abg/event_store.js", ["assertRuntimeEventContract"]);
  const digest = sha256Canonical("q23 synthetic binding member");
  const opus = q23Selection("claude", { ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", "claude-opus-5-5"]) });
  const body = (overrides = {}) => ({
    livenessBinding: { kind: "runtime_liveness_binding", schemaVersion: "5.0.0", clockOriginRef: "runtime-clock://abiogenesis/q23", clockKind: "native_monotonic_elapsed",
      policy: constructRuntimeWatchdogPolicy({ startupMs: 1_000, inactivityMs: 1_000, hardCapMs: 4_000, terminationGraceMs: 1_000 }), sources: actorRuntimeProbeSources("claude_stream_json") },
    cCallRef: "c-call://q23", actorRef: "actor://q23", workerBindingRef: "worker-binding://q23", implementationBindingRef: "implementation-binding://q23",
    implementationRef: "implementation://q23", inputDigest: digest, transportPlanDigest: digest, transportContractDigest: digest, agentKey: "claude",
    parser: "claude_stream_json", promptTransport: "stdin", lane: "worker_executes", dispatchOrdinal: 1, command: "claude", args: opus.args,
    cwd: "/synthetic", archiveRoot: "/synthetic/archive", timeoutMs: 1_000, absoluteTimeoutMs: 4_000, terminationGraceMs: 1_000, promptDigest: digest,
    responseJsonSchemaDigest: null, environmentPolicyDigest: digest, environmentDigest: digest,
    paths: { prompt: "/p", output: "/o", stdout: "/s", stderr: "/e", transport: "/t" }, ...overrides });
  const candidate = payloadBody => {
    const transportBindingDigest = sha256Canonical(payloadBody);
    return { kind: "actor_transport_binding_admitted", eventTime: "2026-11-06T00:00:00.000Z", aggregateType: "transport_binding",
      aggregateId: `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`, parentAggregateId: "c-call://q23", causationEventRefs: [],
      correlationId: "correlation://q23", workflowVersion: "5.0.0", scopeClass: "run", basisId: "basis://q23", runId: "run://q23",
      graphCallId: "graph-call://q23", frameId: "frame://q23",
      payload: { transportBindingRef: `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`, transportBindingDigest, ...payloadBody } };
  };
  // Positive: the derived identity of its own arguments, and a binding without one.
  assert.doesNotThrow(() => assertRuntimeEventContract(candidate(body({ configuredIdentity: opus.identity })), ROOT_EVENT_CONTRACT_DIGEST));
  assert.doesNotThrow(() => assertRuntimeEventContract(candidate(body()), ROOT_EVENT_CONTRACT_DIGEST), "absence is admitted and reads as unknown");
  assert.doesNotThrow(() => assertRuntimeEventContract(candidate(body({ configuredIdentity: q23Selection("claude", { ANTHROPIC_MODEL: "claude-sonnet-5-5" }, ["--model", "claude-opus-5-5"]).identity })),
    ROOT_EVENT_CONTRACT_DIGEST), "a recorded environment conflict over selecting arguments");
  for (const [name, identity] of [
    ["another model", { ...opus.identity, model: "claude-fable-5-1" }],
    ["another argument coordinate", { ...opus.identity, source: { kind: "transport_argument", argumentIndex: 0 } }],
    ["an unknown reason the arguments do not give", q23Selection("claude").identity],
    ["an unclosed identity", { ...opus.identity, family: "Anthropic Claude" }],
  ]) assert.throws(() => assertRuntimeEventContract(candidate(body({ configuredIdentity: identity })), ROOT_EVENT_CONTRACT_DIGEST),
    /current actor binding identity differs from its own agent and final arguments/u, name);
  assert.throws(() => assertRuntimeEventContract(candidate(body({ configuredIdentity: opus.identity, args: [...opus.args, "--model", "claude-opus-5-5"] })), ROOT_EVENT_CONTRACT_DIGEST),
    /current actor binding identity differs/u, "arguments changed under an unchanged identity");
  // Selector-shaped prompt-option data: its own unknown identity is admitted; one read from the operand is refused.
  const operand = q23Selection("claude", {}, ["--append-system-prompt", "--model=claude-opus-5-5"]);
  assert.doesNotThrow(() => assertRuntimeEventContract(candidate(body({ args: operand.args, configuredIdentity: operand.identity })), ROOT_EVENT_CONTRACT_DIGEST));
  assert.throws(() => assertRuntimeEventContract(candidate(body({ args: operand.args,
    configuredIdentity: { ...opus.identity, source: { kind: "transport_argument", argumentIndex: operand.args.length - 1 } } })), ROOT_EVENT_CONTRACT_DIGEST),
  /current actor binding identity differs from its own agent and final arguments/u, "an identity read from prompt-option data");
  // The historical profile keeps its exact contract: no identity member, and absence remains unknown.
  const { livenessBinding: _liveness, ...legacyBody } = body();
  assert.doesNotThrow(() => assertRuntimeEventContract(candidate(legacyBody), LEGACY_ROOT_EVENT_CONTRACT_DIGEST));
  assert.throws(() => assertRuntimeEventContract(candidate({ ...legacyBody, configuredIdentity: opus.identity }), LEGACY_ROOT_EVENT_CONTRACT_DIGEST),
    /matches no admitted event-contract variant/u);
});

// RC7 HS03 (design §10.10): the real transport over controlled structured
// captures. Noise rows complete no turn and are not progress.
const HS03_ASSISTANT = `${JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "a" }] } })}\n`;
const HS03_USER = `${JSON.stringify({ type: "user", message: { content: [{ type: "text", text: "u" }] } })}\n`;
const HS03_RESULT = `${JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "done" })}\n`;
const HS03_DELTA = `${JSON.stringify({ type: "stream_event", event: { type: "content_block_delta" } })}\n`;
const hs03Noise = n => `${JSON.stringify({ type: "system", subtype: "status", n })}\n`;
// One atomic pipe write (below PIPE_BUF) holding two complete turn records
// and a noise-only tail, then a result turn, then a noise-only final tail.
const HS03_PARTS = Object.freeze([HS03_ASSISTANT + hs03Noise(1) + HS03_USER + hs03Noise(2), HS03_RESULT, hs03Noise(3)]);
const hs03Bytes = text => Buffer.byteLength(text, "utf8");

function hs03ReadRange(path, offset, length) {
  const descriptor = hs03OpenSync(path, "r");
  try {
    const bytes = Buffer.alloc(length);
    assert.equal(hs03ReadSync(descriptor, bytes, 0, length, offset), length, "the referenced archive range is complete");
    return bytes.toString("utf8");
  } finally { hs03CloseSync(descriptor); }
}

// A worker that writes each planned part once, waiting for its write callback
// and a short pause; with `forever` it then repeats the last part until killed.
async function hs03Worker(scratch, parts, { pauseMs = 40, forever = false } = {}) {
  const planPath = join(scratch, "plan.json"), workerPath = join(scratch, "hs03-worker.mjs");
  await writeFile(planPath, JSON.stringify(parts), "utf8");
  await writeFile(workerPath, [
    "import { readFileSync } from 'node:fs';",
    "const parts = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
    "const write = part => new Promise(done => process.stdout.write(part, done));",
    `const pause = () => new Promise(done => setTimeout(done, ${pauseMs}));`,
    "for (const part of parts) { await write(part); await pause(); }",
    `if (${forever}) for (;;) { await write(parts.at(-1)); await pause(); }`,
    "",
  ].join("\n"), "utf8");
  return constructKnownWorkerTransportContract("generic", { command: process.execPath, prefixArgs: [workerPath, planPath], environment: {} });
}

// The window-mode observer as the actor declares it: the shared incremental
// decoder partitions each capture at its completed turn boundaries.
function hs03WindowObserver(archivePath, log) {
  const started = performance.now(), decoder = createWorkerTransportOutputObserver(false);
  const captures = [], windows = [], flushes = [];
  const observer = {
    classifyStdoutChunk: chunk => {
      const elapsedMs = Math.floor(performance.now() - started);
      const segments = decoder.classifyChunk(chunk);
      captures.push({ chunk, elapsedMs, segments });
      return { elapsedMs, progress: segments.some(s => s.progress), result: segments.some(s => s.result),
        turnBoundary: segments.some(s => s.turnBoundary), segments };
    },
    bindStdoutWindow: flush => { flushes.push(flush); },
    onStdoutObserved: (text, window) => {
      assert.notEqual(window, undefined, "window mode references closed windows only");
      log.push("ref");
      windows.push({ text, window, archived: hs03ReadRange(archivePath, window.archiveOffset, window.byteLength) });
      return true;
    },
    onTimeoutObserved: timeoutClass => { log.push(`timeout:${timeoutClass}`); },
    onProcessFinalized: () => { log.push("finalized"); },
  };
  const captureOf = text => {
    const found = captures.find(c => c.chunk.includes(text));
    assert.notEqual(found, undefined, "the planned text was captured");
    return found.elapsedMs;
  };
  return { observer, captures, windows, flushes, captureOf };
}

// The emitted transport module with its archive descriptor operations logged
// or failed in place; every other import is the actual module.
async function hs03Transport(log, { failWrite = null, failFsync = null } = {}) {
  return privateOwner("abg/worker_transport.js", [], { "node:fs": {
    writeSync: (descriptor, buffer, ...rest) => {
      if (failWrite !== null && Buffer.isBuffer(buffer) && buffer.includes(failWrite.marker)) throw failWrite.error;
      log.push("write"); return hs03WriteSync(descriptor, buffer, ...rest);
    },
    fsyncSync: descriptor => {
      if (failFsync !== null) throw failFsync;
      log.push("fsync"); return hs03FsyncSync(descriptor);
    },
  } });
}

const hs03Request = (contract, scratch, label, observer, timeouts = {}) => ({
  contract, prompt: "hs03", lane: "worker_executes", cwd: scratch, archiveRoot: join(scratch, "archive"), label,
  timeoutMs: timeouts.timeoutMs ?? 10_000, absoluteTimeoutMs: timeouts.absoluteTimeoutMs ?? 20_000,
  terminationGraceMs: timeouts.terminationGraceMs ?? 500, environment: {}, observer,
});

test("RC7 HS03 archive: one coalesced capture closes a window at each completed turn boundary, each exact range is written and fsynced before its one reference, and a noise-only tail is not activity", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-hs03-archive-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const log = [], archivePath = join(scratch, "archive", "hs03-archive-stdout.log");
  const { runWorkerTransport: run } = await hs03Transport(log);
  const live = hs03WindowObserver(archivePath, log);
  const result = await run(hs03Request(await hs03Worker(scratch, HS03_PARTS), scratch, "hs03-archive", live.observer));
  assert.equal(result.disposition, "success");
  // The first capture coalesces two complete turn records and a noise tail;
  // the shared decoder keeps each boundary position and segment class.
  const [first] = HS03_PARTS;
  assert.equal(live.captures[0].chunk, first, "one atomic write is one captured string");
  assert.deepEqual(live.captures[0].segments.map(s => ({ ...s })), [
    { end: HS03_ASSISTANT.length, progress: true, result: false, turnBoundary: true },
    { end: HS03_ASSISTANT.length + hs03Noise(1).length + HS03_USER.length, progress: true, result: false, turnBoundary: true },
    { end: first.length, progress: false, result: false, turnBoundary: false },
  ]);
  const c0 = live.captures[0].elapsedMs, cResult = live.captureOf(HS03_RESULT), cTail = live.captureOf(hs03Noise(3));
  const texts = [HS03_ASSISTANT, hs03Noise(1) + HS03_USER, hs03Noise(2) + HS03_RESULT, hs03Noise(3)];
  const expected = [
    { firstCaptureElapsedMs: c0, lastCaptureElapsedMs: c0, lastQualifyingElapsedMs: c0, resultElapsedMs: null, closure: "turn_boundary" },
    { firstCaptureElapsedMs: c0, lastCaptureElapsedMs: c0, lastQualifyingElapsedMs: c0, resultElapsedMs: null, closure: "turn_boundary" },
    { firstCaptureElapsedMs: c0, lastCaptureElapsedMs: cResult, lastQualifyingElapsedMs: cResult, resultElapsedMs: cResult, closure: "turn_boundary" },
    { firstCaptureElapsedMs: cTail, lastCaptureElapsedMs: cTail, lastQualifyingElapsedMs: null, resultElapsedMs: null, closure: "drain" },
  ];
  // Before this repair the first capture closed one window holding all four
  // rows, and its noise tail inherited the capture's qualifying class.
  assert.equal(live.windows.length, 4, "one reference per completed turn plus the final partial window");
  let offset = 0;
  for (const [index, observed] of live.windows.entries()) {
    assert.deepEqual(observed.window, { archiveOffset: offset, byteLength: hs03Bytes(texts[index]), ...expected[index] }, `window ${index + 1}`);
    assert.equal(observed.text, texts[index], `window ${index + 1} carries its exact segment text`);
    assert.equal(observed.archived, texts[index], `window ${index + 1}: its archive range holds its bytes at its reference`);
    assert.equal(sha256Canonical(observed.archived), sha256Canonical(texts[index]), `window ${index + 1}: its range digest is the reference digest`);
    offset += observed.window.byteLength;
  }
  // Every reference follows the fsync of its range; one fsync per window and
  // one write per capture; the final partial window drains before finalization.
  for (const [index, entry] of log.entries()) if (entry === "ref") assert.equal(log[index - 1], "fsync", `reference at log ${index} follows its fsync`);
  assert.deepEqual([log.filter(e => e === "ref").length, log.filter(e => e === "fsync").length, log.filter(e => e === "write").length],
    [4, 4, live.captures.length]);
  assert.equal(log.indexOf("finalized") > log.lastIndexOf("ref"), true, "the drained window precedes finalization");
  assert.equal(live.flushes.length, 1);
  assert.equal(live.flushes[0](), null, "after the drain nothing is pending");
  // A restarted reader recovers each referenced range from the closed archive.
  const archived = await readFile(archivePath, "utf8");
  assert.equal(archived, HS03_PARTS.join(""));
  assert.equal(archived, result.stdout);
  assert.equal(offset, hs03Bytes(archived), "the windows partition the archive");
  assert.deepEqual(live.windows.map(w => hs03ReadRange(archivePath, w.window.archiveOffset, w.window.byteLength)), texts);
});

test("RC7 HS03 archive: a failed archive write or fsync fails the transport with its original error and no unavailable window is referenced", async (context) => {
  for (const failing of ["fsync", "write"]) {
    const scratch = await mkdtemp(join(tmpdir(), `abi5-hs03-${failing}-`));
    context.after(async () => rm(scratch, { force: true, recursive: true }));
    const log = [], archivePath = join(scratch, "archive", `hs03-${failing}-stdout.log`);
    const injected = Object.assign(new Error(`injected archive ${failing} failure`), { code: "EIO" });
    const { runWorkerTransport: run } = await hs03Transport(log, failing === "fsync"
      ? { failFsync: injected } : { failWrite: { marker: '"type":"result"', error: injected } });
    const live = hs03WindowObserver(archivePath, log);
    let processId = null;
    const observer = { ...live.observer, onProcessStarted: pid => { processId = pid; } };
    await assert.rejects(run(hs03Request(await hs03Worker(scratch, HS03_PARTS), scratch, `hs03-${failing}`, observer)),
      error => error === injected, `the ${failing} failure is the transport failure`);
    if (failing === "fsync") {
      assert.deepEqual(live.windows, [], "no window is referenced without its fsync");
      assert.equal(log.includes("fsync"), false);
    } else {
      // The windows closed before the failed write were durable; the pending
      // noise tail and the unwritten result are never referenced.
      assert.deepEqual(live.windows.map(w => w.text), [HS03_ASSISTANT, hs03Noise(1) + HS03_USER]);
      assert.deepEqual(live.windows.map(w => w.archived), [HS03_ASSISTANT, hs03Noise(1) + HS03_USER]);
      assert.equal(log.filter(e => e === "ref").length, 2);
      assert.equal((await readFile(archivePath, "utf8")), HS03_PARTS[0], "the archive holds only the written capture");
    }
    assert.equal(log.includes("finalized"), true, "finalization still runs");
    assert.notEqual(processId, null);
    assert.throws(() => process.kill(processId, 0), error => error?.code === "ESRCH", "the failed owner leaves no live worker");
  }
});

test("RC7 HS03 archive: missing, changed or truncated archive bytes after the window references are refused by the existing archive comparison", async (context) => {
  for (const damage of ["missing", "changed", "truncated"]) {
    const scratch = await mkdtemp(join(tmpdir(), `abi5-hs03-${damage}-`));
    context.after(async () => rm(scratch, { force: true, recursive: true }));
    const log = [], archivePath = join(scratch, "archive", `hs03-${damage}-stdout.log`);
    const live = hs03WindowObserver(archivePath, log);
    const observer = { ...live.observer, onProcessFinalized: () => {
      log.push("finalized");
      if (damage === "missing") hs03UnlinkSync(archivePath);
      else if (damage === "truncated") hs03TruncateSync(archivePath, hs03Bytes(HS03_PARTS.join("")) - 1);
      else {
        const descriptor = hs03OpenSync(archivePath, "r+");
        try { hs03WriteSync(descriptor, Buffer.from("X"), 0, 1, 0); } finally { hs03CloseSync(descriptor); }
      }
    } };
    await assert.rejects(runWorkerTransport(hs03Request(await hs03Worker(scratch, HS03_PARTS), scratch, `hs03-${damage}`, observer)),
      damage === "missing" ? error => error?.code === "ENOENT" : /worker stream archive differs from observed bytes/u, `${damage} archive bytes refuse`);
    assert.deepEqual(live.windows.map(w => w.archived), [HS03_ASSISTANT, hs03Noise(1) + HS03_USER, hs03Noise(2) + HS03_RESULT, hs03Noise(3)],
      `${damage}: every window was exact at its reference`);
  }
});

test("RC7 HS03 timeout: an inactivity timeout drains the pending partial window before finalization with its last qualifying capture, and noise renews no lease", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-hs03-inactivity-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const log = [], archivePath = join(scratch, "archive", "hs03-inactivity-stdout.log");
  const live = hs03WindowObserver(archivePath, log);
  const started = Date.now();
  const result = await runWorkerTransport(hs03Request(await hs03Worker(scratch, [HS03_ASSISTANT, HS03_DELTA, hs03Noise(1)], { forever: true }),
    scratch, "hs03-inactivity", live.observer, { timeoutMs: 400, absoluteTimeoutMs: 15_000, terminationGraceMs: 200 }));
  assert.equal(Date.now() - started < 8_000, true, "repeated noise did not renew the inactivity lease");
  assert.deepEqual([result.disposition, result.timedOut, result.timeoutClass], ["failure", true, "inactivity"]);
  const cAssistant = live.captureOf(HS03_ASSISTANT), cDelta = live.captureOf(HS03_DELTA);
  const noiseCaptures = live.captures.filter(c => !c.chunk.includes(HS03_DELTA) && !c.chunk.includes(HS03_ASSISTANT));
  assert.equal(noiseCaptures.length > 0, true, "noise arrived after the last qualifying row");
  assert.equal(noiseCaptures.every(c => c.segments.every(s => !s.progress && !s.result && !s.turnBoundary)), true, "noise is not activity");
  assert.equal(live.windows.length, 2, "the completed turn and one drained partial window");
  const [turn, partial] = live.windows;
  assert.deepEqual({ ...turn.window }, { archiveOffset: 0, byteLength: hs03Bytes(HS03_ASSISTANT), firstCaptureElapsedMs: cAssistant,
    lastCaptureElapsedMs: cAssistant, lastQualifyingElapsedMs: cAssistant, resultElapsedMs: null, closure: "turn_boundary" });
  assert.deepEqual([partial.window.archiveOffset, partial.window.closure, partial.window.firstCaptureElapsedMs, partial.window.lastQualifyingElapsedMs,
    partial.window.resultElapsedMs], [hs03Bytes(HS03_ASSISTANT), "drain", cDelta, cDelta, null],
    "the partial window keeps its last qualifying capture, not its last noise capture");
  assert.equal(partial.window.lastCaptureElapsedMs, Math.max(...live.captures.map(c => c.elapsedMs)));
  assert.equal(partial.window.lastCaptureElapsedMs > cDelta, true);
  assert.equal(partial.text.startsWith(HS03_DELTA), true);
  assert.equal(partial.archived, partial.text, "the drained range is durable at its reference");
  assert.equal(turn.text + partial.text, result.stdout, "the two windows partition the captured stdout");
  assert.deepEqual(log, ["ref", "timeout:inactivity", "ref", "finalized"], "the partial window drains after the timeout and before finalization");
  assert.equal(live.flushes[0](), null);
});

test("RC7 HS03 timeout: an absolute interruption under steady qualifying progress drains its open window once after the timeout and before finalization", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-hs03-absolute-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const log = [], archivePath = join(scratch, "archive", "hs03-absolute-stdout.log");
  const live = hs03WindowObserver(archivePath, log);
  // The transport admits only an absolute bound above the inactivity bound.
  // The S2 fixture supplied inactivity 5000 ms with absolute 500 ms and was
  // refused before transport; that receipt stays historical. Qualifying
  // content records every 30 ms keep renewing a 400 ms lease until the
  // 1500 ms absolute bound interrupts.
  const started = Date.now();
  const result = await runWorkerTransport(hs03Request(await hs03Worker(scratch, [HS03_DELTA], { pauseMs: 30, forever: true }),
    scratch, "hs03-absolute", live.observer, { timeoutMs: 400, absoluteTimeoutMs: 1_500, terminationGraceMs: 200 }));
  assert.deepEqual([result.disposition, result.timedOut, result.timeoutClass], ["failure", true, "absolute"]);
  assert.equal(Date.now() - started >= 1_500, true, "steady qualifying progress outlived several inactivity leases");
  assert.equal(live.captures.length > 1, true);
  const qualifying = live.captures.filter(c => c.segments.some(s => s.progress || s.result));
  assert.equal(live.windows.length, 1, "no turn boundary and no 30000 ms bound: one window");
  assert.deepEqual({ ...live.windows[0].window }, { archiveOffset: 0, byteLength: hs03Bytes(result.stdout),
    firstCaptureElapsedMs: live.captures[0].elapsedMs, lastCaptureElapsedMs: live.captures.at(-1).elapsedMs,
    lastQualifyingElapsedMs: qualifying.at(-1).elapsedMs, resultElapsedMs: null, closure: "drain" });
  assert.equal(live.windows[0].archived, result.stdout);
  assert.equal(live.captures.at(-1).elapsedMs - qualifying.at(-1).elapsedMs < 400, true, "progress was steady up to the interruption");
  assert.deepEqual(log, ["timeout:absolute", "ref", "finalized"], "the open window drains exactly once, after the timeout and before finalization");
  assert.equal(live.flushes[0](), null);
});
