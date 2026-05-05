// Validates: T-113
// Validates: T-116
// Validates: T-117
// Validates: REQ-R-ABG3-TRANSPORT

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import {
  constructPluginTraversalPromptMaterializedEvent,
  deriveRuntimeAggregateProjection,
  invokeSupervisedProcessActor,
  loadAbgFallbackBundleFromFile,
  resolvePluginTraversalObserverBinding
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  claudeStreamJsonArgs,
  contractForKnownAgent,
  runAgentTransport,
  sanitizeAgentTransportEnvironment
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  runAgentActorWorkerCallout
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import { buildFpBasis } from "../tests/support/m03-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TYPESCRIPT_ROOT = path.dirname(TEST_ENV_ROOT);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t113_live_pty_claude_actor_worker"
);
const WORKER_TOKEN = "ABG_T113_WORKER_CLAUDE_READY";
const ADAPTER_TOKEN = "ABG_T113_ADAPTER_WORKER_CLAUDE_READY";
const ACTOR_TOKEN = "ABG_T113_ACTOR_CLAUDE_READY";
const WORKER_OBSERVATION_PREFIX = "ABG_T113_WORKER_OBSERVATION";
const ACTOR_OBSERVED_PREFIX = "ABG_T113_ACTOR_OBSERVED";
const ACTOR_DISABLED_PREFIX = "ABG_T113_ACTOR_DISABLED";

function liveEnabled() {
  return process.env["ABG_TS_T113_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000;
}

function requirePtyExecutorProfile() {
  const raw = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] ?? "pty-terminal";
  const normalized = raw.trim();
  assert.equal(
    normalized,
    "pty-terminal",
    "T-113 live lane must run the requested PTY executor, not local-spawn"
  );
  return normalized;
}

async function runRoot() {
  const root = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(root, { recursive: true });
  return root;
}

function actorInvocation(basis, overrides = {}) {
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: "actor.claude",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: `graph-call:${basis.id}`,
    frameId: basis.frameId ?? `frame:${basis.id}:root`,
    vectorIndex: 0,
    edge: "actor.claude->worker.claude",
    attemptIndex: 1,
    dispatchRef: "dispatch://claude",
    workerId: "worker.claude",
    backendId: "backend://claude",
    resultRef: "result://t113/live-pty/actor",
    causationEventRefs: ["dispatch://claude"],
    correlationId: "correlation://t113/live-pty/actor",
    ...overrides
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function extractTokenByPrefix(text, prefix) {
  const match = text.match(
    new RegExp(`${escapeRegExp(prefix)}_[A-Z0-9_]+`, "u")
  );
  assert.notEqual(match, null, `expected output to include ${prefix} token`);
  return match[0];
}

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function observerHookDeclaration(input) {
  return Object.freeze({
    key: "abg.plugin_traversal_observer.transform",
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.hookRef,
        config: attrs([
          scalarEntry("traversal_kind", "transform"),
          scalarEntry("observer_prompt_ref", input.observerPromptRef),
          scalarEntry("prompt_template_ref", input.promptTemplateRef),
          scalarEntry(
            "prompt_input_contract_ref",
            "contract://t113/live/declared-transform-input"
          ),
          scalarEntry(
            "expected_output_contract_ref",
            "contract://t113/live/declared-transform-output"
          ),
          stringListEntry("progress_signal_refs", [
            "progress://t113/live/worker-trace-observed"
          ]),
          stringListEntry("continuation_request_refs", [
            "continuation://t113/live/drive-transform-forward"
          ]),
          stringListEntry("policy_refs", [
            "policy://t113/live/declared-observer"
          ])
        ])
      })
    })
  });
}

function withVectorDeclarations(basis, declarations, vectorIndex = 0) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  const vectors = basis.graph.vectors.map((candidate, index) =>
    index === vectorIndex
      ? Object.freeze({
          ...candidate,
          declarations
        })
      : candidate
  );
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

async function assertPtyTrace(traceResultPath, expectedToken, label, expectedCallout) {
  const result = JSON.parse(await readFile(traceResultPath, "utf8"));
  assert.equal(result.executorProfile, "pty-terminal", `${label} used PTY`);
  assert.equal(
    result.streamModel,
    "terminal-transcript",
    `${label} used terminal transcript stream model`
  );
  assert.equal(result.outcome.kind, "exited", `${label} exited normally`);
  assert.equal(result.status, 0, `${label} status`);
  assert.equal(typeof result.terminalSessionId, "string");
  assert.ok(result.terminalSessionId.length > 0, `${label} terminal session id`);
  assert.match(result.finalOutput, new RegExp(expectedToken, "u"));
  assert.notEqual(result.paths.terminalTranscript, undefined);
  assert.equal(result.agentCalloutKind, expectedCallout.agentCalloutKind);
  assert.equal(result.actorRef, expectedCallout.actorRef ?? null);
  assert.equal(result.workerRef, expectedCallout.workerRef ?? null);

  const meta = JSON.parse(await readFile(result.paths.meta, "utf8"));
  assert.equal(meta.agentCalloutKind, expectedCallout.agentCalloutKind);
  assert.equal(meta.actorRef, expectedCallout.actorRef ?? null);
  assert.equal(meta.workerRef, expectedCallout.workerRef ?? null);

  const events = await readFile(result.paths.events, "utf8");
  assert.match(events, /terminal_session_started/u);
  assert.match(events, /process_started/u);
  assert.match(events, /terminal_exit_sentinel_observed/u);
  assert.match(events, /terminal_session_closed/u);

  const transcript = await readFile(result.paths.terminalTranscript, "utf8");
  assert.match(transcript, /__ABG_PTY_EXIT_/u);
  assert.match(transcript, new RegExp(expectedToken, "u"));
}

async function runObservedWorkerToken(input) {
  const result = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude",
    command: input.contract.command,
    args: claudeStreamJsonArgs(
      `Return exactly this token and nothing else: ${input.token}`
    ),
    cwd: input.root,
    env: input.env,
    archiveRoot: path.join(input.root, input.traceDirectoryName),
    label: input.label,
    parser: "claude-stream-json",
    executorProfile: input.executorProfile,
    terminalSessionKey:
      `${input.label.replace(/[^A-Za-z0-9_.-]/gu, "-")}-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs()
  });
  assert.equal(result.executorProfile, "pty-terminal");
  assert.equal(result.outcome.kind, "exited");
  assert.equal(result.status, 0);
  assert.match(result.finalOutput, new RegExp(escapeRegExp(input.token), "u"));
  await assertPtyTrace(result.paths.result, input.token, input.label, {
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude"
  });
  return result;
}

test("T-113/T-116/T-117 live PTY actor matrix covers enabled/disabled actors with default/custom plugin bindings", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T113_LIVE=1 or CODEX_LIVE_FP=1 to run T-113 live PTY Claude proof");
  }
  const executorProfile = requirePtyExecutorProfile();
  const root = await runRoot();
  const { basis } = buildFpBasis({ dispatchRef: "dispatch://claude" });
  const fallbackBundle = loadAbgFallbackBundleFromFile(
    path.join(TYPESCRIPT_ROOT, "config", "abg.reference-fallbacks.json")
  );
  const observerSelection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: basis.graph.vectors[0],
    graphFunction: basis.graphFunction,
    roles: basis.job.roles,
    defaultsBundle: fallbackBundle,
    fallbackEnabled: true
  });
  assert.equal(observerSelection.source, "abg_defaults");
  assert.equal(
    observerSelection.binding.observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
  const declaredBasis = withVectorDeclarations(
    basis,
    attrs([
      observerHookDeclaration({
        hookRef: "hook://t113/live/declared-transform-observer",
        observerPromptRef: "prompt://t113/live/declared-transform-observer",
        promptTemplateRef: "template://t113/live/declared-transform-observer"
      })
    ])
  );
  const declaredObserverSelection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: declaredBasis.graph.vectors[0],
    graphFunction: declaredBasis.graphFunction,
    roles: declaredBasis.job.roles,
    defaultsBundle: fallbackBundle,
    fallbackEnabled: false
  });
  assert.equal(declaredObserverSelection.source, "graph_vector_declarations");
  assert.equal(declaredObserverSelection.fallbackBundleRef, null);
  assert.equal(
    declaredObserverSelection.binding.observerPromptRef,
    "prompt://t113/live/declared-transform-observer"
  );
  const contract = contractForKnownAgent("claude");
  const env = {
    ...sanitizeAgentTransportEnvironment(contract),
    TERM: "xterm-256color"
  };

  const availability = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude",
    command: contract.command,
    args: ["--version"],
    cwd: root,
    env,
    archiveRoot: path.join(root, "claude.version.trace"),
    label: "claude.version",
    parser: "generic-text",
    executorProfile,
    terminalSessionKey: `t113-claude-version-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs()
  });
  assert.equal(
    availability.status,
    0,
    `claude binary must be available through the traced PTY call-out: ${availability.error ?? availability.stderr}`
  );
  assert.equal(availability.agentCalloutKind, "agent_worker");
  assert.equal(availability.workerRef, "worker.claude");

  const adapterResult = await runAgentTransport({
    contract,
    workerRef: "worker.claude",
    prompt: `Return exactly this token and nothing else: ${ADAPTER_TOKEN}`,
    cwd: root,
    archiveRoot: root,
    label: "adapter.worker.claude",
    executorProfile,
    terminalSessionKey: `t113-adapter-worker-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs(),
    traceRoot: path.join(root, "adapter.worker.claude.trace")
  });
  assert.equal(adapterResult.executorProfile, "pty-terminal");
  assert.equal(adapterResult.workerRef, "worker.claude");
  assert.equal(adapterResult.agentKey, "claude");
  assert.equal(adapterResult.outcome.kind, "exited");
  assert.equal(adapterResult.status, 0);
  assert.match(adapterResult.finalOutput, new RegExp(ADAPTER_TOKEN, "u"));
  await assertPtyTrace(
    adapterResult.traceResultPath,
    ADAPTER_TOKEN,
    "adapter.worker.claude",
    {
      agentCalloutKind: "agent_worker",
      workerRef: "worker.claude"
    }
  );

  const workerTraceRoot = path.join(root, "worker.claude.trace");
  const workerResult = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude",
    command: contract.command,
    args: claudeStreamJsonArgs(
      `Return exactly this token and nothing else: ${WORKER_TOKEN}`
    ),
    cwd: root,
    env,
    archiveRoot: workerTraceRoot,
    label: "worker.claude",
    parser: "claude-stream-json",
    executorProfile,
    terminalSessionKey: `t113-worker-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs()
  });
  assert.equal(workerResult.executorProfile, "pty-terminal");
  assert.equal(workerResult.streamModel, "terminal-transcript");
  assert.equal(workerResult.outcome.kind, "exited");
  assert.equal(workerResult.status, 0);
  assert.match(workerResult.finalOutput, new RegExp(WORKER_TOKEN, "u"));
  await assertPtyTrace(workerResult.paths.result, WORKER_TOKEN, "worker.claude", {
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude"
  });

  const stdoutPath = path.join(root, "actor.claude.stdout.log");
  const stderrPath = path.join(root, "actor.claude.stderr.log");
  const eventsPath = path.join(root, "actor.claude.events.jsonl");
  const processStartedPath = path.join(root, "actor.claude.started.json");
  const invocation = actorInvocation(basis);
  const actorResult = await invokeSupervisedProcessActor({
    invocation,
    command: contract.command,
    args: claudeStreamJsonArgs(
      `Return exactly this token and nothing else: ${ACTOR_TOKEN}`
    ),
    cwd: root,
    environment: env,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processStartedPath,
    processEventsPath: eventsPath,
    parser: "claude-stream-json",
    executorProfile,
    terminalSessionKey: `t113-actor-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs(),
    heartbeatMs: 0
  });
  assert.equal(actorResult.outcome.kind, "exited");
  assert.equal(actorResult.status, 0);
  assert.equal(actorResult.timedOut, false);
  await assertPtyTrace(`${eventsPath}.trace/result.json`, ACTOR_TOKEN, "actor.claude", {
    agentCalloutKind: "agent_actor",
    actorRef: "actor.claude",
    workerRef: "worker.claude"
  });

  const actorEventsText = await readFile(eventsPath, "utf8");
  assert.match(actorEventsText, /actor_process_started/u);
  assert.match(actorEventsText, /actor_process_stream_observed/u);
  assert.match(actorEventsText, /actor_process_exited/u);
  const actorEvents = actorEventsText
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
  for (const event of actorEvents) {
    assert.equal(event.graphFunctionId, invocation.graphFunctionId);
    assert.equal(event.runId, invocation.runId);
    assert.equal(event.workKey, invocation.workKey);
    assert.equal(event.workerId, "worker.claude");
    assert.equal(event.backendId, "backend://claude");
    assert.deepStrictEqual(event.causationEventRefs, ["dispatch://claude"]);
    assert.equal(event.correlationId, invocation.correlationId);
  }
  const projection = deriveRuntimeAggregateProjection(basis, actorEvents);
  assert.equal(projection.actorProcessRefs.length, 1);
  assert.equal(projection.actorProcessRefs[0].actorInvocationId, "actor.claude");
  assert.equal(projection.actorProcessRefs[0].workerId, "worker.claude");
  assert.equal(projection.actorProcessRefs[0].backendId, "backend://claude");
  assert.equal(
    typeof projection.actorProcessRefs[0].terminalSessionId,
    "string"
  );
  assert.ok(projection.actorProcessRefs[0].terminalSessionId.length > 0);
  assert.equal(projection.actorProcessRefs[0].startFailed, false);
  assert.equal(projection.actorProcessRefs[0].running, false);
  assert.equal(projection.actorProcessRefs[0].status, 0);

  const workerObservationToken = `${WORKER_OBSERVATION_PREFIX}_${timestampId()}`;
  const workerObservationTraceRoot = path.join(root, "worker.observation.claude.trace");
  const workerObservationResult = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker.claude",
    command: contract.command,
    args: claudeStreamJsonArgs(
      `Return exactly this token and nothing else: ${workerObservationToken}`
    ),
    cwd: root,
    env,
    archiveRoot: workerObservationTraceRoot,
    label: "worker.claude.observation",
    parser: "claude-stream-json",
    executorProfile,
    terminalSessionKey: `t113-worker-observation-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs()
  });
  assert.equal(workerObservationResult.executorProfile, "pty-terminal");
  assert.equal(workerObservationResult.outcome.kind, "exited");
  assert.equal(workerObservationResult.status, 0);
  const observedWorkerToken = extractTokenByPrefix(
    workerObservationResult.finalOutput,
    WORKER_OBSERVATION_PREFIX
  );
  assert.equal(observedWorkerToken, workerObservationToken);
  await assertPtyTrace(
    workerObservationResult.paths.result,
    observedWorkerToken,
    "worker.claude.observation",
    {
      agentCalloutKind: "agent_worker",
      workerRef: "worker.claude"
    }
  );

  const workerObservationRef = pathToFileURL(workerObservationResult.paths.result).href;
  const observedActorResponseToken = `${ACTOR_OBSERVED_PREFIX}_${observedWorkerToken}`;
  const observedActorStdoutPath = path.join(root, "actor.claude.observed-worker.stdout.log");
  const observedActorStderrPath = path.join(root, "actor.claude.observed-worker.stderr.log");
  const observedActorEventsPath = path.join(root, "actor.claude.observed-worker.events.jsonl");
  const observedActorStartedPath = path.join(root, "actor.claude.observed-worker.started.json");
  const observedInvocation = actorInvocation(basis, {
    actorInvocationId: "actor.claude.observed-worker",
    edge: "worker.claude->actor.claude:observed-response",
    resultRef: "result://t113/live-pty/actor-observed-worker",
    causationEventRefs: ["dispatch://claude", workerObservationRef],
    correlationId: `correlation://t113/live-pty/actor-observed-worker/${observedWorkerToken}`
  });
  const observedActorResult = await invokeSupervisedProcessActor({
    invocation: observedInvocation,
    command: contract.command,
    args: claudeStreamJsonArgs(
      [
        "You are actor.claude.",
        `Observer prompt ref: ${observerSelection.binding.observerPromptRef}`,
        `Observer prompt template ref: ${observerSelection.binding.promptTemplateRef}`,
        "You are observing a completed worker.claude trace result.",
        `Worker trace result ref: ${workerObservationRef}`,
        `Observed worker final token: ${observedWorkerToken}`,
        `Return exactly this token and nothing else: ${observedActorResponseToken}`
      ].join("\n")
    ),
    cwd: root,
    environment: env,
    stdoutPath: observedActorStdoutPath,
    stderrPath: observedActorStderrPath,
    stdoutRef: pathToFileURL(observedActorStdoutPath).href,
    stderrRef: pathToFileURL(observedActorStderrPath).href,
    processStartedPath: observedActorStartedPath,
    processEventsPath: observedActorEventsPath,
    parser: "claude-stream-json",
    executorProfile,
    terminalSessionKey: `t113-actor-observed-worker-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs(),
    heartbeatMs: 0
  });
  assert.equal(observedActorResult.outcome.kind, "exited");
  assert.equal(observedActorResult.status, 0);
  assert.equal(observedActorResult.timedOut, false);
  await assertPtyTrace(
    `${observedActorEventsPath}.trace/result.json`,
    observedActorResponseToken,
    "actor.claude.observed-worker",
    {
      agentCalloutKind: "agent_actor",
      actorRef: "actor.claude.observed-worker",
      workerRef: "worker.claude"
    }
  );
  const observedActorTrace = JSON.parse(
    await readFile(`${observedActorEventsPath}.trace/result.json`, "utf8")
  );
  assert.match(
    observedActorTrace.finalOutput,
    new RegExp(escapeRegExp(observedWorkerToken), "u"),
    "actor response must include the observed worker token"
  );
  const observedActorEventsText = await readFile(observedActorEventsPath, "utf8");
  const promptMaterializedEvent = constructPluginTraversalPromptMaterializedEvent({
    basis,
    vectorIndex: 0,
    selection: observerSelection,
    invocation: observedInvocation,
    causationEventRefs: ["dispatch://claude", workerObservationRef],
    correlationId: observedInvocation.correlationId
  });
  assert.equal(promptMaterializedEvent.traversalKind, "transform");
  assert.equal(promptMaterializedEvent.selectionSource, "abg_defaults");
  assert.equal(promptMaterializedEvent.defaultsBundleDigest, fallbackBundle.bundleDigest);

  const declaredActorResponseToken =
    `${ACTOR_OBSERVED_PREFIX}_DECLARED_${observedWorkerToken}`;
  const declaredActorStdoutPath = path.join(
    root,
    "actor.claude.declared-observed-worker.stdout.log"
  );
  const declaredActorStderrPath = path.join(
    root,
    "actor.claude.declared-observed-worker.stderr.log"
  );
  const declaredActorEventsPath = path.join(
    root,
    "actor.claude.declared-observed-worker.events.jsonl"
  );
  const declaredActorStartedPath = path.join(
    root,
    "actor.claude.declared-observed-worker.started.json"
  );
  const declaredObservedInvocation = actorInvocation(basis, {
    actorInvocationId: "actor.claude.declared-observed-worker",
    edge: "worker.claude->actor.claude:declared-observed-response",
    resultRef: "result://t113/live-pty/actor-declared-observed-worker",
    causationEventRefs: ["dispatch://claude", workerObservationRef],
    correlationId:
      `correlation://t113/live-pty/actor-declared-observed-worker/${observedWorkerToken}`
  });
  const declaredActorResult = await invokeSupervisedProcessActor({
    invocation: declaredObservedInvocation,
    command: contract.command,
    args: claudeStreamJsonArgs(
      [
        "You are actor.claude.",
        `Declared observer prompt ref: ${declaredObserverSelection.binding.observerPromptRef}`,
        `Declared observer prompt template ref: ${declaredObserverSelection.binding.promptTemplateRef}`,
        "You are observing a completed worker.claude trace result through an explicit GraphVector observer qualifier.",
        `Worker trace result ref: ${workerObservationRef}`,
        `Observed worker final token: ${observedWorkerToken}`,
        `Return exactly this token and nothing else: ${declaredActorResponseToken}`
      ].join("\n")
    ),
    cwd: root,
    environment: env,
    stdoutPath: declaredActorStdoutPath,
    stderrPath: declaredActorStderrPath,
    stdoutRef: pathToFileURL(declaredActorStdoutPath).href,
    stderrRef: pathToFileURL(declaredActorStderrPath).href,
    processStartedPath: declaredActorStartedPath,
    processEventsPath: declaredActorEventsPath,
    parser: "claude-stream-json",
    executorProfile,
    terminalSessionKey: `t113-actor-declared-observed-worker-claude-${process.pid}-${Date.now()}`,
    timeoutMs: transportTimeoutMs(),
    heartbeatMs: 0
  });
  assert.equal(declaredActorResult.outcome.kind, "exited");
  assert.equal(declaredActorResult.status, 0);
  assert.equal(declaredActorResult.timedOut, false);
  await assertPtyTrace(
    `${declaredActorEventsPath}.trace/result.json`,
    declaredActorResponseToken,
    "actor.claude.declared-observed-worker",
    {
      agentCalloutKind: "agent_actor",
      actorRef: "actor.claude.declared-observed-worker",
      workerRef: "worker.claude"
    }
  );
  const declaredActorTrace = JSON.parse(
    await readFile(`${declaredActorEventsPath}.trace/result.json`, "utf8")
  );
  assert.match(
    declaredActorTrace.finalOutput,
    new RegExp(escapeRegExp(observedWorkerToken), "u"),
    "declared actor response must include the observed worker token"
  );
  const declaredActorEventsText = await readFile(declaredActorEventsPath, "utf8");
  const declaredPromptMaterializedEvent =
    constructPluginTraversalPromptMaterializedEvent({
      basis: declaredBasis,
      vectorIndex: 0,
      selection: declaredObserverSelection,
      invocation: declaredObservedInvocation,
      causationEventRefs: ["dispatch://claude", workerObservationRef],
      correlationId: declaredObservedInvocation.correlationId
    });
  assert.equal(declaredPromptMaterializedEvent.traversalKind, "transform");
  assert.equal(
    declaredPromptMaterializedEvent.selectionSource,
    "graph_vector_declarations"
  );
  assert.equal(declaredPromptMaterializedEvent.defaultsBundleDigest, null);

  const defaultDisabledWorkerToken =
    `${ACTOR_DISABLED_PREFIX}_DEFAULT_${timestampId()}`;
  const defaultDisabledWorkerResult = await runObservedWorkerToken({
    root,
    contract,
    env,
    executorProfile,
    token: defaultDisabledWorkerToken,
    label: "worker.claude.default-plugin.actor-disabled",
    traceDirectoryName: "worker.default-plugin.actor-disabled.trace"
  });
  const defaultDisabledWorkerRef = pathToFileURL(
    defaultDisabledWorkerResult.paths.result
  ).href;
  const defaultDisabledPromptMaterializedEvent =
    constructPluginTraversalPromptMaterializedEvent({
      basis,
      vectorIndex: 0,
      selection: observerSelection,
      causationEventRefs: ["dispatch://claude", defaultDisabledWorkerRef],
      correlationId:
        `correlation://t113/live-pty/default-plugin-actor-disabled/${defaultDisabledWorkerToken}`
    });
  assert.equal(defaultDisabledPromptMaterializedEvent.selectionSource, "abg_defaults");
  assert.equal(defaultDisabledPromptMaterializedEvent.actorInvocationId, null);
  assert.equal(defaultDisabledPromptMaterializedEvent.workerId, null);
  assert.equal(
    defaultDisabledPromptMaterializedEvent.defaultsBundleDigest,
    fallbackBundle.bundleDigest
  );

  const customDisabledWorkerToken =
    `${ACTOR_DISABLED_PREFIX}_CUSTOM_${timestampId()}`;
  const customDisabledWorkerResult = await runObservedWorkerToken({
    root,
    contract,
    env,
    executorProfile,
    token: customDisabledWorkerToken,
    label: "worker.claude.custom-plugin.actor-disabled",
    traceDirectoryName: "worker.custom-plugin.actor-disabled.trace"
  });
  const customDisabledWorkerRef = pathToFileURL(
    customDisabledWorkerResult.paths.result
  ).href;
  const customDisabledPromptMaterializedEvent =
    constructPluginTraversalPromptMaterializedEvent({
      basis: declaredBasis,
      vectorIndex: 0,
      selection: declaredObserverSelection,
      causationEventRefs: ["dispatch://claude", customDisabledWorkerRef],
      correlationId:
        `correlation://t113/live-pty/custom-plugin-actor-disabled/${customDisabledWorkerToken}`
    });
  assert.equal(
    customDisabledPromptMaterializedEvent.selectionSource,
    "graph_vector_declarations"
  );
  assert.equal(customDisabledPromptMaterializedEvent.actorInvocationId, null);
  assert.equal(customDisabledPromptMaterializedEvent.workerId, null);
  assert.equal(customDisabledPromptMaterializedEvent.defaultsBundleDigest, null);

  const observedActorEvents = observedActorEventsText
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
  assert.deepStrictEqual(
    observedActorEvents
      .map((event) => event.kind)
      .filter((kind) => kind !== "actor_process_stream_observed"),
    ["actor_process_started", "actor_process_exited"]
  );
  for (const event of observedActorEvents) {
    assert.equal(event.actorInvocationId, observedInvocation.actorInvocationId);
    assert.equal(event.workerId, "worker.claude");
    assert.equal(event.backendId, "backend://claude");
    assert.deepStrictEqual(
      event.causationEventRefs,
      ["dispatch://claude", workerObservationRef]
    );
    assert.equal(event.correlationId, observedInvocation.correlationId);
  }
  const declaredActorEvents = declaredActorEventsText
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
  assert.deepStrictEqual(
    declaredActorEvents
      .map((event) => event.kind)
      .filter((kind) => kind !== "actor_process_stream_observed"),
    ["actor_process_started", "actor_process_exited"]
  );
  for (const event of declaredActorEvents) {
    assert.equal(
      event.actorInvocationId,
      declaredObservedInvocation.actorInvocationId
    );
    assert.equal(event.workerId, "worker.claude");
    assert.equal(event.backendId, "backend://claude");
    assert.deepStrictEqual(
      event.causationEventRefs,
      ["dispatch://claude", workerObservationRef]
    );
    assert.equal(event.correlationId, declaredObservedInvocation.correlationId);
  }
  const observedProjection = deriveRuntimeAggregateProjection(
    basis,
    [
      promptMaterializedEvent,
      declaredPromptMaterializedEvent,
      defaultDisabledPromptMaterializedEvent,
      customDisabledPromptMaterializedEvent,
      ...observedActorEvents,
      ...declaredActorEvents
    ]
  );
  assert.equal(
    observedProjection.pluginTraversalPromptMaterializationRefs.length,
    4
  );
  assert.equal(
    new Set(
      observedProjection.pluginTraversalPromptMaterializationRefs.map(
        (ref) => ref.materializationRef
      )
    ).size,
    4,
    "each plugin traversal prompt materialization must have a unique replay ref"
  );
  assert.equal(
    new Set(
      observedProjection.pluginTraversalPromptMaterializationRefs.map(
        (ref) => ref.promptInputDigest
      )
    ).size,
    4,
    "each plugin traversal prompt materialization must carry a unique prompt-input digest"
  );
  const fallbackMaterialization =
    observedProjection.pluginTraversalPromptMaterializationRefs.find(
      (ref) => ref.selectionSource === "abg_defaults"
    );
  assert.notEqual(fallbackMaterialization, undefined);
  assert.equal(
    fallbackMaterialization.observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
  const declaredMaterialization =
    observedProjection.pluginTraversalPromptMaterializationRefs.find(
      (ref) => ref.selectionSource === "graph_vector_declarations"
    );
  assert.notEqual(declaredMaterialization, undefined);
  assert.equal(
    declaredMaterialization.observerPromptRef,
    "prompt://t113/live/declared-transform-observer"
  );
  const actorDisabledMaterializations =
    observedProjection.pluginTraversalPromptMaterializationRefs.filter(
      (ref) => ref.actorInvocationId === null
    );
  assert.equal(actorDisabledMaterializations.length, 2);
  assert.notEqual(
    actorDisabledMaterializations.find(
      (ref) => ref.selectionSource === "abg_defaults"
    ),
    undefined
  );
  assert.notEqual(
    actorDisabledMaterializations.find(
      (ref) => ref.selectionSource === "graph_vector_declarations"
    ),
    undefined
  );
  assert.equal(observedProjection.actorProcessRefs.length, 2);
  const fallbackActorRef = observedProjection.actorProcessRefs.find(
    (ref) => ref.actorInvocationId === "actor.claude.observed-worker"
  );
  assert.notEqual(fallbackActorRef, undefined);
  assert.equal(
    fallbackActorRef.actorInvocationId,
    "actor.claude.observed-worker"
  );
  assert.deepStrictEqual(
    fallbackActorRef.causationEventRefs,
    ["dispatch://claude", workerObservationRef]
  );
  assert.equal(fallbackActorRef.workerId, "worker.claude");
  assert.equal(typeof fallbackActorRef.terminalSessionId, "string");
  assert.ok(fallbackActorRef.terminalSessionId.length > 0);
  assert.equal(fallbackActorRef.startFailed, false);
  assert.equal(fallbackActorRef.running, false);
  assert.equal(fallbackActorRef.status, 0);
  const declaredActorRef = observedProjection.actorProcessRefs.find(
    (ref) => ref.actorInvocationId === "actor.claude.declared-observed-worker"
  );
  assert.notEqual(declaredActorRef, undefined);
  assert.deepStrictEqual(
    declaredActorRef.causationEventRefs,
    ["dispatch://claude", workerObservationRef]
  );
  assert.equal(declaredActorRef.workerId, "worker.claude");
  assert.equal(typeof declaredActorRef.terminalSessionId, "string");
  assert.ok(declaredActorRef.terminalSessionId.length > 0);
  assert.equal(declaredActorRef.startFailed, false);
  assert.equal(declaredActorRef.running, false);
  assert.equal(declaredActorRef.status, 0);

  await writeFile(
    path.join(root, "summary.json"),
    `${JSON.stringify(
      {
        status: "passed",
        executorProfile,
        term: env.TERM,
        adapter: {
          ref: "adapter.worker.claude",
          workerRef: adapterResult.workerRef,
          traceResultPath: adapterResult.traceResultPath,
          terminalSessionId: adapterResult.terminalSessionId
        },
        worker: {
          ref: "worker.claude",
          traceResultPath: workerResult.paths.result,
          terminalSessionId: workerResult.terminalSessionId
        },
        actor: {
          ref: "actor.claude",
          workerRef: "worker.claude",
          traceResultPath: `${eventsPath}.trace/result.json`
        },
        observedResponse: {
          workerRef: "worker.claude",
          workerObservationRef,
          observedWorkerToken,
          actorRef: "actor.claude.observed-worker",
          actorResponseToken: observedActorResponseToken,
          traceResultPath: `${observedActorEventsPath}.trace/result.json`,
          observerFallbackEnabledFor: ["transform"],
          observerPromptRef: observerSelection.binding.observerPromptRef,
          promptMaterializationRef: promptMaterializedEvent.materializationRef,
          renderedPromptRef: promptMaterializedEvent.renderedPromptRef,
          promptInputDigest: promptMaterializedEvent.promptInputDigest,
          fallbackBundleRef: fallbackBundle.bundleRef,
          fallbackBundleDigest: fallbackBundle.bundleDigest
        },
        declaredObservedResponse: {
          workerRef: "worker.claude",
          workerObservationRef,
          observedWorkerToken,
          actorRef: "actor.claude.declared-observed-worker",
          actorResponseToken: declaredActorResponseToken,
          traceResultPath: `${declaredActorEventsPath}.trace/result.json`,
          observerPromptRef:
            declaredObserverSelection.binding.observerPromptRef,
          promptMaterializationRef:
            declaredPromptMaterializedEvent.materializationRef,
          renderedPromptRef: declaredPromptMaterializedEvent.renderedPromptRef,
          promptInputDigest: declaredPromptMaterializedEvent.promptInputDigest,
          selectionSource: declaredObserverSelection.source,
          hookRef: declaredObserverSelection.hookRef
        },
        actorMatrix: {
          defaultPluginActorEnabled: {
            actorEnabled: true,
            selectionSource: observerSelection.source,
            observerPromptRef: observerSelection.binding.observerPromptRef,
            traceResultPath: `${observedActorEventsPath}.trace/result.json`,
            actorInvocationId: observedInvocation.actorInvocationId
          },
          defaultPluginActorDisabled: {
            actorEnabled: false,
            selectionSource: observerSelection.source,
            observerPromptRef: observerSelection.binding.observerPromptRef,
            workerTraceResultPath: defaultDisabledWorkerResult.paths.result,
            actorInvocationId:
              defaultDisabledPromptMaterializedEvent.actorInvocationId,
            promptMaterializationRef:
              defaultDisabledPromptMaterializedEvent.materializationRef,
            defaultsBundleRef:
              defaultDisabledPromptMaterializedEvent.defaultsBundleRef,
            defaultsBundleDigest:
              defaultDisabledPromptMaterializedEvent.defaultsBundleDigest
          },
          customPluginActorEnabled: {
            actorEnabled: true,
            selectionSource: declaredObserverSelection.source,
            observerPromptRef:
              declaredObserverSelection.binding.observerPromptRef,
            traceResultPath: `${declaredActorEventsPath}.trace/result.json`,
            actorInvocationId: declaredObservedInvocation.actorInvocationId
          },
          customPluginActorDisabled: {
            actorEnabled: false,
            selectionSource: declaredObserverSelection.source,
            observerPromptRef:
              declaredObserverSelection.binding.observerPromptRef,
            workerTraceResultPath: customDisabledWorkerResult.paths.result,
            actorInvocationId:
              customDisabledPromptMaterializedEvent.actorInvocationId,
            promptMaterializationRef:
              customDisabledPromptMaterializedEvent.materializationRef,
            defaultsBundleRef:
              customDisabledPromptMaterializedEvent.defaultsBundleRef,
            defaultsBundleDigest:
              customDisabledPromptMaterializedEvent.defaultsBundleDigest
          }
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
});
