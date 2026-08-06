import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const execFileAsync = promisify(execFile);
const PROGRAM_REF = "program://abiogenesis/conformance/fp-retry-hello@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-retry-hello@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

function fpInput(subject) {
  return {
    kind: "fp_hello_instruction",
    schemaVersion: "5.0.0",
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    workerActorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    transportLane: "closed_prompt_proof",
    subject,
    instruction: "Produce one concise greeting for the declared subject.",
  };
}

async function installRetryWorker(harness) {
  const bin = join(harness.scratch, "retry-bin");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "const { existsSync, readFileSync, writeFileSync } = require('node:fs');",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const counterPath = process.env.ABG_FP_RETRY_COUNTER;",
    "  const prior = counterPath && existsSync(counterPath) ? Number(readFileSync(counterPath, 'utf8')) : 0;",
    "  const attempt = prior + 1;",
    "  if (counterPath) writeFileSync(counterPath, String(attempt));",
    "  const subjectLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('Subject: '));",
    "  const subject = subjectLine === undefined ? 'Unknown' : JSON.parse(subjectLine.slice('Subject: '.length));",
    "  const mode = process.env.ABG_FP_RETRY_MODE;",
    "  const result = {",
    "    kind: 'fp_hello_output',",
    "    schemaVersion: '5.0.0',",
    `    resultContractRef: '${OUTPUT_CONTRACT_REF}',`,
    `    actorRef: '${ACTOR_REF}',`,
    "    message: mode === 'contradictory' ? `Goodbye ${subject}` : `Hello ${subject}`,",
    "  };",
    "  const malformed = mode === 'always_malformed' || mode === 'changed_malformed' || mode === 'transport_failure' || mode === 'changed_transport_failure' || (mode === 'aba_malformed' && attempt <= 3) || (mode === undefined && attempt === 1);",
    "  const stableFailure = mode !== undefined && mode !== 'contradictory';",
    "  const resultText = mode === 'no_output' ? '' : malformed ? (mode === 'changed_malformed' ? `{not-json-${attempt}` : mode === 'aba_malformed' ? (attempt === 2 ? '{not-json-b' : '{not-json-a') : '{not-json') : JSON.stringify(result);",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: stableFailure ? 'stable failure' : `attempt ${attempt}` }] } }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: resultText }));",
    "  if (mode === 'transport_failure') process.exitCode = 17;",
    "  if (mode === 'changed_transport_failure') process.exitCode = 16 + attempt;",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function readEvents(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

async function reopenPrefix(events, path) {
  const bytes = `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
  await writeFile(path, bytes, "utf8");
  const identity = await stat(path);
  const [{ reopenEventStore, ROOT_EVENT_CONTRACT_DIGEST }, { sha256Canonical }] =
    await Promise.all([
      import(pathToFileURL(join(root, "build/code/src/abg/event_store.js")).href),
      import(pathToFileURL(join(root, "build/code/src/shared/digests.js")).href),
    ]);
  const body = {
    kind: "event_store_reopen_authority",
    schemaVersion: "5.0.0",
    eventLogPath: path,
    device: identity.dev,
    inode: identity.ino,
    eventLogDigest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    durableByteLength: Buffer.byteLength(bytes),
    eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
  };
  return reopenEventStore({ ...body, authorityDigest: sha256Canonical(body) });
}

function eventCandidate(event, overrides = {}) {
  const {
    eventId: _eventId,
    admissionOrdinal: _admissionOrdinal,
    payloadDigest: _payloadDigest,
    ...candidate
  } = event;
  return { ...candidate, ...overrides };
}

test("M5 installed C.retry re-enters one failed F_P edge with fresh ABG attempt truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const installedAbg = await import(pathToFileURL(join(
    harness.installedPackageRoot,
    "build/code/src/abg/index.js",
  )).href);
  assert.equal(Object.hasOwn(installedAbg, "admitRetryProgress"), false,
    "the installed ABG surface has no split retry-progress writer");
  assert.equal(
    Object.hasOwn(installedAbg, "admitRetryRuntimeFailureTransition"),
    false,
    "the atomic retry close/progress primitive is owned by installed HoG",
  );
  assert.equal(
    Object.hasOwn(installedAbg, "admitCompletedRetryProgress"),
    false,
    "successful retry progress cannot be split from the installed HoG route owner",
  );
  const installedCCallDeclaration = await readFile(join(
    harness.installedPackageRoot,
    "build/code/src/abg/c_call.d.ts",
  ), "utf8");
  const rejectedCompletionDeclaration = installedCCallDeclaration.match(
    /export interface RejectedCCallCompletion\s*\{[^}]*\}/u,
  )?.[0] ?? "";
  assert.doesNotMatch(
    installedCCallDeclaration,
    /completeRejectedCCall[^;]*disposition/u,
    "the installed direct rejection close has no caller-selected retry disposition",
  );
  assert.doesNotMatch(
    rejectedCompletionDeclaration,
    /disposition:\s*(?:"blocked"\s*\|\s*"retry"|"retry"\s*\|\s*"blocked")/u,
    "the installed direct rejection completion cannot represent retry",
  );
  assert.doesNotMatch(
    String(installedAbg.completeRejectedCCall),
    /disposition\s*=/u,
    "the installed callable has no rival retry-close argument",
  );
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-success.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-success",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_RETRY_COUNTER: counterPath,
    },
  });

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes[6].disposition, "succeeded");
  assert.equal(await readFile(counterPath, "utf8"), "2");

  const events = await readEvents(scenario.eventLogPath);
  const attempts = events.filter((event) => event.kind === "retry_attempt_opened");
  const progress = events.filter((event) => event.kind === "retry_progress_recorded");
  const calls = events.filter((event) => event.kind === "c_call_opened");
  const judgments = events.filter((event) => event.kind === "c_call_judged");
  const routes = events.filter((event) => event.kind === "traversal_route_admitted");

  assert.deepEqual(attempts.map((event) => event.payload.attempt), [1, 1, 2]);
  assert.deepEqual(attempts.map((event) => event.payload.retryPath), [
    [1],
    [1, 1],
    [1, 2],
  ]);
  assert.deepEqual(progress.map((event) => event.payload.progressClass), [
    "retry",
    "completed",
    "completed",
  ]);
  assert.equal(progress[0].payload.failureClass, "contract_failure");
  assert.deepEqual(progress[0].payload.completedAttempts, [1]);
  assert.equal(progress[0].payload.remainingBudget, 1);
  assert.deepEqual(calls.map((event) => event.payload.attempt), [1, 2]);
  assert.notEqual(calls[0].aggregateId, calls[1].aggregateId);
  assert.deepEqual(judgments.map((event) => event.payload.judgment), [
    "retry",
    "advance",
  ]);
  assert.deepEqual(judgments.map((event) => event.payload.retryAttemptRef), [
    attempts[1].payload.attemptRef,
    attempts[2].payload.attemptRef,
  ]);
  assert.equal(progress[0].payload.attemptRef, attempts[1].payload.attemptRef);
  assert.equal(progress[1].payload.attemptRef, attempts[2].payload.attemptRef);
  assert.equal(progress[2].payload.attemptRef, attempts[0].payload.attemptRef);
  assert.deepEqual(
    progress.slice(1).map((event) => event.payload.completedRetryDepth),
    [2, 1],
  );
  assert.equal(progress[1].payload.judgmentRef, judgments[1].payload.judgmentRef);
  assert.equal(progress[2].payload.judgmentRef, judgments[1].payload.judgmentRef);
  assert.deepEqual(routes.map((event) => event.payload.routeKind), [
    "retry",
    "retry",
    "retry",
    "terminal",
  ]);
  const terminalRoute = routes.at(-1);
  for (const completed of progress.slice(1)) {
    assert.ok(terminalRoute.payload.consumedAvailabilityRefs.includes(
      completed.payload.progressRef,
    ));
    assert.equal(Object.hasOwn(completed.payload, "targetCursorRef"), false);
    assert.equal(Object.hasOwn(completed.payload, "targetCursorDigest"), false);
  }
  assert.equal(progress[1].payload.predecessorProgressRef, null);
  assert.equal(progress[2].payload.predecessorProgressRef,
    progress[1].payload.progressRef);
  assert.deepEqual(progress[1].causationEventRefs, [
    attempts[2].eventId,
    judgments[1].eventId,
  ]);
  assert.deepEqual(progress[2].causationEventRefs, [
    attempts[0].eventId,
    progress[1].eventId,
  ]);
  assert.deepEqual(terminalRoute.causationEventRefs, [
    progress[2].eventId,
    progress[1].eventId,
  ], "the outermost completion is the primary terminal-route cause");

  const firstCompletedIndex = events.findIndex((event) =>
    event.eventId === progress[1].eventId);
  const completedIndex = events.findIndex((event) =>
    event.eventId === progress[2].eventId);
  const durablePrefix = events.slice(0, completedIndex + 1);
  const reopened = await reopenPrefix(
    durablePrefix,
    join(harness.scratch, "retry-completed-prefix.events.jsonl"),
  );
  assert.equal(reopened.kind, "reopened_event_store_context");
  const {
    admitRetryAttempt,
    hasAdmittedRetryProgress,
    projectAdmittedRetryProgress,
    projectRetryAttempt,
  } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry.js",
  )).href);
  const { selectValidatedRuntimeEventPrefix } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_prefix.js",
  )).href);
  const completedAdmissions = progress.slice(1).map((event) => ({
    kind: "retry_progress_admission",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...event.payload,
    targetCursorRef: null,
    targetCursorDigest: null,
    admissionEventRef: event.eventId,
  }));
  const completedPrefix = selectValidatedRuntimeEventPrefix(reopened.store.readAll());
  for (const admission of completedAdmissions) {
    assert.deepEqual(
      projectAdmittedRetryProgress(completedPrefix, admission.admissionEventRef),
      admission,
    );
    assert.equal(hasAdmittedRetryProgress(completedPrefix, admission), true);
  }
  reopened.store.closeDurableLog();

  const beforeCompleted = await reopenPrefix(
    events.slice(0, firstCompletedIndex),
    join(harness.scratch, "retry-before-completed.events.jsonl"),
  );
  assert.equal(beforeCompleted.kind, "reopened_event_store_context");
  const { admitRuntimeEventBatch } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_store.js",
  )).href);
  const beforeCount = beforeCompleted.store.readAll().length;
  assert.throws(() => admitRuntimeEventBatch(beforeCompleted.store, [
    () => eventCandidate(progress[1]),
    (admitted) => {
      const { attemptRef: _attemptRef, ...malformedPayload } = progress[2].payload;
      return eventCandidate(progress[2], {
        causationEventRefs: [attempts[0].eventId, admitted[0].eventId],
        correlationId: `${progress[2].correlationId}/outer-malformed`,
        payload: {
          ...malformedPayload,
          completedRetryDepth: 0,
          predecessorProgressRef: progress[1].payload.progressRef,
        },
      });
    },
  ]), /payload matches no admitted event-contract variant/u);
  assert.equal(beforeCompleted.store.readAll().length, beforeCount,
    "a malformed planned outer completion appends no partial inner event");
  for (const [label, payload] of [
    ["empty completed attempts", { ...progress[0].payload, completedAttempts: [] }],
    ["zero completed attempt", { ...progress[0].payload, completedAttempts: [0] }],
    ["unknown failure class", { ...progress[0].payload, failureClass: "unknown_failure" }],
    ["attempt/path mismatch", { ...progress[0].payload, attempt: 2 }],
  ]) {
    assert.throws(
      () => admitRuntimeEventBatch(beforeCompleted.store, [
        () => eventCandidate(progress[0], {
          correlationId: `${progress[0].correlationId}/${label.replaceAll(" ", "-")}`,
          payload,
        }),
      ]),
      /retry progress payload carries invalid required value types/u,
      label,
    );
    assert.equal(beforeCompleted.store.readAll().length, beforeCount, label);
  }
  beforeCompleted.store.closeDurableLog();

  const ownerStore = await reopenPrefix(
    events.slice(0, firstCompletedIndex),
    join(harness.scratch, "retry-owner-prefix.events.jsonl"),
  );
  assert.equal(ownerStore.kind, "reopened_event_store_context");
  const entered = events.find((event) => event.kind === "traversal_cursor_entered");
  const secondCall = calls[1];
  const secondFibre = events.find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === secondCall.aggregateId);
  const secondResult = events.find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.aggregateId === secondCall.aggregateId);
  const secondJudgment = judgments[1];
  const sourceCursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef: secondCall.payload.cursorRef,
    cursorDigest: secondCall.payload.cursorDigest,
    programRef: entered.payload.programRef,
    executionBasisRef: entered.payload.executionBasisRef,
    traversalScopeRef: entered.payload.traversalScopeRef,
    runId: secondCall.runId,
    graphCallId: secondCall.graphCallId,
    frameId: secondCall.frameId,
    graphRef: entered.payload.materializationRef,
    inputRef: entered.payload.inputRef,
    inputDigest: entered.payload.inputDigest,
    currentNodeRef: "node://abiogenesis/conformance/fp-retry-hello@5",
    position: "at_term",
    termPath: [...entered.payload.termPath, "term", "term"],
    taskOrdinal: secondCall.payload.taskOrdinal,
    attempt: secondCall.payload.attempt,
    retryPath: secondCall.payload.retryPath,
  };
  const cCallValue = {
    kind: "c_call",
    schemaVersion: "5.0.0",
    ...secondCall.payload,
    basisId: secondCall.basisId,
    runId: secondCall.runId,
    graphFunctionRef: secondCall.graphFunctionRef,
    graphCallId: secondCall.graphCallId,
    frameId: secondCall.frameId,
    childGraphFunctionRef: null,
    openedEventRef: secondCall.eventId,
    fibreSelectedEventRef: secondFibre.eventId,
  };
  const resultValue = {
    kind: "admitted_c_call_result",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...secondResult.payload,
    admissionEventRef: secondResult.eventId,
  };
  const judgmentValue = {
    kind: "admitted_c_call_judgment",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...secondJudgment.payload,
    admissionEventRef: secondJudgment.eventId,
  };
  const { rehydrateAdmittedCCallState } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/c_call.js",
  )).href);
  const rehydratedOutcome = rehydrateAdmittedCCallState(
    ownerStore.store,
    cCallValue,
    resultValue,
    judgmentValue,
  );
  assert.ok(rehydratedOutcome);
  const catalogEntry = run.outcomes[4].result.graphFunctionEntries.find((entry) =>
    entry.handle === GRAPH_FUNCTION_REF);
  const basisEvent = events.find((event) =>
    event.kind === "basis_admitted" && event.basisId === secondCall.basisId);
  const { materializeGraph } = await import(pathToFileURL(join(
    root,
    "build/code/src/gtl/materialize.js",
  )).href);
  const graph = materializeGraph(catalogEntry.definition, {
    invocationAdmissionRef: basisEvent.payload.invocationAdmissionRef,
    admittedInputRef: basisEvent.payload.rawInputAdmissionRef,
    admittedInputDigest: basisEvent.payload.rawInputDigest,
    admittedInput: fpInput("World"),
  });
  assert.equal(graph.materializationRef, entered.payload.materializationRef);
  assert.equal(graph.materializationDigest, entered.payload.materializationDigest);
  const projectedAttempt = projectRetryAttempt(
    completedPrefix,
    graph,
    attempts[2].payload.attemptRef,
  );
  assert.equal(projectedAttempt?.attemptRef, attempts[2].payload.attemptRef,
    "T-287 R5 reconstructs the attempt cursor from its admitted retry route");
  assert.deepEqual(projectedAttempt?.retryPath, [1, 2]);
  assert.equal(projectRetryAttempt(
    completedPrefix,
    graph,
    sourceCursor.cursorRef,
  ), null, "a traversal cursor ref is not an attempt identity");
  const { rehydrateExecutionBasis } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/execution_basis.js",
  )).href);
  const { admitCompletedRetryProgress } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry.js",
  )).href);
  const cursorApi = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/traversal_cursor.js",
  )).href);
  assert.equal(cursorApi.isTraversalCursorCandidate(sourceCursor), true,
    JSON.stringify(sourceCursor));
  assert.equal(cursorApi.hasAdmittedTraversalCursor(ownerStore.store, sourceCursor), true);

  const thirdAttemptIndex = events.findIndex((event) =>
    event.eventId === attempts[2].eventId);
  const attemptStore = await reopenPrefix(
    events.slice(0, thirdAttemptIndex),
    join(harness.scratch, "retry-attempt-owner-prefix.events.jsonl"),
  );
  assert.equal(attemptStore.kind, "reopened_event_store_context");
  const attemptBasis = rehydrateExecutionBasis(
    attemptStore.store,
    secondCall.basisId,
  );
  assert.ok(attemptBasis);
  const attemptBefore = attemptStore.store.readAll().length;
  const attemptDigestMethod = attemptStore.store.digest;
  attemptStore.store.digest = () => `sha256:${"0".repeat(64)}`;
  const staleAttempt = admitRetryAttempt(
    attemptStore.store,
    attemptBasis,
    graph,
    sourceCursor,
    attempts[2].payload.inputValue,
    routes[2].eventId,
    { eventTime: attempts[2].eventTime, correlationId: "test://retry-attempt-stale", causationEventRefs: [routes[0].eventId] },
  );
  attemptStore.store.digest = attemptDigestMethod;
  assert.equal(staleAttempt.kind, "retry_admission_refusal");
  assert.equal(staleAttempt.code, "attempt_mismatch");
  assert.equal(attemptStore.store.readAll().length, attemptBefore);
  const admittedAttempt = admitRetryAttempt(
    attemptStore.store,
    attemptBasis,
    graph,
    sourceCursor,
    attempts[2].payload.inputValue,
    routes[2].eventId,
    { eventTime: attempts[2].eventTime, correlationId: "test://retry-attempt-nonempty-basis", causationEventRefs: [routes[0].eventId] },
  );
  assert.equal(admittedAttempt.kind, "retry_attempt_admission");
  assert.equal(admittedAttempt.attemptRef, attempts[2].payload.attemptRef);
  assert.deepEqual(attemptStore.store.readAll().at(-1).causationEventRefs, [
    routes[2].eventId,
  ], "caller basis causes cannot enter retry-attempt authority");
  attemptStore.store.closeDurableLog();

  const ownerBefore = ownerStore.store.readAll().length;
  const fabricatedTarget = admitCompletedRetryProgress(
    ownerStore.store,
    graph,
    sourceCursor,
    sourceCursor,
    rehydratedOutcome.cCall,
    rehydratedOutcome.result,
    rehydratedOutcome.judgment,
    { eventTime: progress[1].eventTime, correlationId: "test://retry-forged-target", causationEventRefs: [] },
  );
  assert.equal(fabricatedTarget.kind, "retry_admission_refusal");
  assert.equal(ownerStore.store.readAll().length, ownerBefore);
  for (const mutation of [
    { runId: "run://forged" },
    { graphCallId: "graph-call://forged" },
    { frameId: "frame://forged" },
    { taskOrdinal: 7 },
    { attempt: 7 },
    { retryPath: [1, 7] },
    { currentNodeRef: "node://forged" },
    { termPath: [...sourceCursor.termPath, "forged"] },
  ]) {
    const refused = admitCompletedRetryProgress(
      ownerStore.store,
      graph,
      { ...sourceCursor, ...mutation },
      null,
      rehydratedOutcome.cCall,
      rehydratedOutcome.result,
      rehydratedOutcome.judgment,
      { eventTime: progress[1].eventTime, correlationId: "test://retry-coordinate-mutation", causationEventRefs: [] },
    );
    assert.equal(refused.kind, "retry_admission_refusal");
    assert.equal(ownerStore.store.readAll().length, ownerBefore);
  }
  for (const [label, graphValue, cCall, result, judgment] of [
    [
      "forged-graph",
      { ...graph, materializationRef: "graph-materialization://abiogenesis/forged" },
      rehydratedOutcome.cCall,
      rehydratedOutcome.result,
      rehydratedOutcome.judgment,
    ],
    [
      "stale-attempt",
      graph,
      { ...rehydratedOutcome.cCall, attempt: 1 },
      rehydratedOutcome.result,
      rehydratedOutcome.judgment,
    ],
    [
      "forged-result",
      graph,
      rehydratedOutcome.cCall,
      { ...rehydratedOutcome.result, valueDigest: `sha256:${"1".repeat(64)}` },
      rehydratedOutcome.judgment,
    ],
    [
      "forged-judgment",
      graph,
      rehydratedOutcome.cCall,
      rehydratedOutcome.result,
      { ...rehydratedOutcome.judgment, judgmentRef: "judgment://abiogenesis/forged" },
    ],
  ]) {
    const refused = admitCompletedRetryProgress(
      ownerStore.store,
      graphValue,
      sourceCursor,
      null,
      cCall,
      result,
      judgment,
      { eventTime: progress[1].eventTime, correlationId: `test://retry-${label}`, causationEventRefs: [] },
    );
    assert.equal(refused.kind, "retry_admission_refusal", label);
    assert.equal(ownerStore.store.readAll().length, ownerBefore, label);
  }
  const originalDigest = ownerStore.store.digest;
  ownerStore.store.digest = () => `sha256:${"0".repeat(64)}`;
  const staleCompletion = admitCompletedRetryProgress(
    ownerStore.store,
    graph,
    sourceCursor,
    null,
    rehydratedOutcome.cCall,
    rehydratedOutcome.result,
    rehydratedOutcome.judgment,
    { eventTime: progress[1].eventTime, correlationId: "test://retry-stale-prefix", causationEventRefs: [] },
  );
  ownerStore.store.digest = originalDigest;
  assert.equal(staleCompletion.kind, "retry_admission_refusal");
  assert.equal(staleCompletion.code, "progress_mismatch");
  assert.equal(ownerStore.store.readAll().length, ownerBefore,
    "stale expected prefix appends neither nested completion row");
  const admittedCompletion = admitCompletedRetryProgress(
    ownerStore.store,
    graph,
    sourceCursor,
    null,
    rehydratedOutcome.cCall,
    rehydratedOutcome.result,
    rehydratedOutcome.judgment,
    { eventTime: progress[1].eventTime, correlationId: "test://retry-owner", causationEventRefs: [] },
  );
  assert.equal(Array.isArray(admittedCompletion), true,
    JSON.stringify(admittedCompletion));
  assert.deepEqual(
    admittedCompletion.map((row) => row.completedRetryDepth),
    [2, 1],
  );
  assert.equal(admittedCompletion[1].predecessorProgressRef,
    admittedCompletion[0].progressRef);
  assert.deepEqual(
    admittedCompletion.map((row) => [row.progressRef, row.progressDigest]),
    progress.slice(1).map((event) => [
      event.payload.progressRef,
      event.payload.progressDigest,
    ]),
  );
  assert.equal(ownerStore.store.readAll().length, ownerBefore + 2);
  ownerStore.store.closeDurableLog();

  for (const [label, mutate] of [
    ["malformed-terminal-pair", (event) => ({
      ...event,
      payload: { ...event.payload, targetCursorRef: "cursor://forged" },
    })],
    ["forged-progress-identity", (event) => ({
      ...event,
      payload: { ...event.payload, progressRef: "retry-progress://abiogenesis/forged" },
    })],
    ["forged-progress-causation", (event) => ({
      ...event,
      causationEventRefs: [event.causationEventRefs[0]],
    })],
  ]) {
    const forged = durablePrefix.map((event) =>
      event.eventId === progress[2].eventId ? mutate(event) : event);
    const refusal = await reopenPrefix(
      forged,
      join(harness.scratch, `${label}.events.jsonl`),
    );
    assert.equal(refusal.kind, "event_store_reopen_refusal");
    assert.equal(refusal.code, "invalid_event_history");
  }
  const closedReopen = await reopenPrefix(
    events,
    join(harness.scratch, "retry-closed-prefix.events.jsonl"),
  );
  assert.equal(closedReopen.kind, "reopened_event_store_context");
  const closedPrefix = selectValidatedRuntimeEventPrefix(
    closedReopen.store.readAll(),
  );
  for (const admission of completedAdmissions) {
    assert.deepEqual(
      projectAdmittedRetryProgress(closedPrefix, admission.admissionEventRef),
      projectAdmittedRetryProgress(completedPrefix, admission.admissionEventRef),
      "lawful later suffix does not reprice a historical retry-progress carrier",
    );
    assert.equal(hasAdmittedRetryProgress(closedPrefix, admission), false,
      "terminal route consumption is reconstructed as unavailable after durable reopen");
  }
  const eventCalculus = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_calculus.js",
  )).href);
  const closedCalculus = eventCalculus.deriveRuntimeEventCalculusProjection(
    closedPrefix,
  );
  for (const attempt of attempts) {
    assert.equal(eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructRuntimeFluent({
        name: "retry_attempt_active",
        identity: attempt.payload.attemptRef,
      }),
    ), false);
  }
  for (const row of progress) {
    assert.equal(eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructRuntimeFluent({
        name: "retry_progress_available",
        identity: row.payload.progressRef,
      }),
    ), false);
  }
  closedReopen.store.closeDurableLog();
  assert.equal(events.filter((event) => event.kind === "actor_invocation_started").length, 2);
  assert.equal(events.some((event) => event.kind === "run_stopped"), false);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 installed C.retry does not reinterpret a semantic contradiction as retryable failure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-contradiction.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-contradiction",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_FP_RETRY_COUNTER: counterPath,
      ABG_FP_RETRY_MODE: "contradictory",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[6].disposition, "blocked");
  assert.equal(await readFile(counterPath, "utf8"), "1");
  const events = await readEvents(scenario.eventLogPath);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "retry_attempt_opened")
      .map((event) => event.payload.retryPath),
    [[1], [1, 1]],
  );
  assert.equal(events.some((event) => event.kind === "retry_progress_recorded"), false);
  assert.equal(events.filter((event) => event.kind === "actor_invocation_started").length, 1);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "traversal_route_admitted")
      .map((event) => event.payload.routeKind),
    ["retry", "retry", "blocked"],
  );
  assert.equal(events.at(-1).kind, "run_stopped");
});

test("M5 installed C.retry closes stationary and budget-stopped runtime failures without a third dispatch", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const { selectValidatedRuntimeEventPrefix } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_prefix.js",
  )).href);
  const eventCalculus = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_calculus.js",
  )).href);
  const { deepFreeze } = await import(pathToFileURL(join(
    root,
    "build/code/src/shared/immutable.js",
  )).href);
  for (const row of [
    {
      mode: "always_malformed",
      label: "stationary-contract-failure",
      failureClass: "contract_failure",
      sameSignal: true,
      diagnosticRef: null,
    },
    {
      mode: "changed_malformed",
      label: "budget-contract-failure",
      failureClass: "contract_failure",
      sameSignal: false,
      diagnosticRef: null,
    },
    {
      mode: "no_output",
      label: "stationary-no-output",
      failureClass: "no_output",
      sameSignal: true,
      diagnosticRef: "diagnostic://abiogenesis/transport/no-output@5",
    },
    {
      mode: "transport_failure",
      label: "stationary-transport-failure",
      failureClass: "transport_failure",
      sameSignal: true,
      diagnosticRef: "diagnostic://abiogenesis/transport/transport-failure@5",
    },
    {
      mode: "changed_transport_failure",
      label: "budget-transport-failure",
      failureClass: "transport_failure",
      sameSignal: false,
      diagnosticRef: "diagnostic://abiogenesis/transport/transport-failure@5",
    },
  ]) {
    const counterPath = join(harness.scratch, `${row.label}.count`);
    const scenario = await buildRootCliScenario(
      harness,
      `m5-fp-retry-${row.label}`,
      (payload) => payload,
      {
        programRef: PROGRAM_REF,
        graphFunctionRef: GRAPH_FUNCTION_REF,
        input: fpInput("World"),
      },
    );
    const run = await runInstalledCli(harness, scenario, {
      environment: {
        ABG_TS_CLAUDE_COMMAND: command,
        ABG_FP_RETRY_COUNTER: counterPath,
        ABG_FP_RETRY_MODE: row.mode,
      },
    });

    assert.equal(run.exitCode, 2, `${row.label}: ${run.stdout}`);
    assert.equal(run.outcomes[6].disposition, "blocked", row.label);
    assert.equal(await readFile(counterPath, "utf8"), "2", row.label);
    const events = await readEvents(scenario.eventLogPath);
    const attempts = events.filter((event) =>
      event.kind === "retry_attempt_opened");
    const progress = events.filter((event) =>
      event.kind === "retry_progress_recorded");
    const judgments = events.filter((event) => event.kind === "c_call_judged");
    const results = events.filter((event) =>
      event.kind === "c_call_result_admitted");
    const routes = events.filter((event) =>
      event.kind === "traversal_route_admitted");
    const blockedRoute = routes.at(-1);

    assert.deepEqual(attempts.map((event) => event.payload.retryPath),
      [[1], [1, 1], [1, 2]], row.label);
    assert.deepEqual(progress.map((event) => event.payload.progressClass),
      ["retry", "stopped", "stopped"], row.label);
    assert.deepEqual(progress.map((event) => event.payload.failureClass),
      [row.failureClass, row.failureClass, row.failureClass], row.label);
    assert.deepEqual(progress.map((event) => event.payload.remainingBudget),
      [1, 0, 1], row.label);
    assert.equal(
      progress[0].payload.failureSignalRef ===
        progress[1].payload.failureSignalRef,
      row.sameSignal,
      row.label,
    );
    assert.equal(progress[2].payload.failureSignalRef,
      progress[1].payload.failureSignalRef, row.label);
    assert.deepEqual(progress.slice(1).map((event) => event.payload.stopReason),
      ["boundary_terminal", "propagated_inner_stop"], row.label);
    assert.equal(progress[1].payload.predecessorProgressRef, null, row.label);
    assert.equal(progress[2].payload.predecessorProgressRef,
      progress[1].payload.progressRef, row.label);
    assert.deepEqual(judgments.map((event) => event.payload.judgment),
      ["retry", "blocked"], row.label);
    assert.deepEqual(results.map((event) => event.payload.resultClass),
      ["failure", "failure"], row.label);
    assert.equal(events.filter((event) =>
      event.kind === "actor_invocation_started").length, 2, row.label);
    assert.equal(attempts.some((event) =>
      event.payload.retryPath.at(-1) === 3), false, row.label);
    assert.equal(blockedRoute.payload.routeKind, "blocked", row.label);
    assert.deepEqual(blockedRoute.payload.consumedAvailabilityRefs, [
      judgments[1].payload.judgmentRef,
      progress[1].payload.progressRef,
      progress[2].payload.progressRef,
    ], row.label);
    assert.deepEqual(blockedRoute.causationEventRefs, [
      progress[2].eventId,
      progress[1].eventId,
    ], row.label);
    assert.equal(events.at(-1).kind, "run_stopped", row.label);

    for (const [index, result] of results.entries()) {
      assert.equal(result.payload.value.failureSignalRef,
        progress[index].payload.failureSignalRef, row.label);
      assert.equal(judgments[index].payload.reasonRef,
        result.payload.value.failureSignalRef, row.label);
      assert.notEqual(result.payload.value.diagnosticRef,
        result.payload.value.failureSignalRef, row.label);
      if (row.diagnosticRef !== null) {
        assert.equal(result.payload.value.diagnosticRef, row.diagnosticRef,
          row.label);
      }
    }

    const blockedRouteIndex = events.findIndex((event) =>
      event.eventId === blockedRoute.eventId);
    const routePrefix = selectValidatedRuntimeEventPrefix(
      deepFreeze(events.slice(0, blockedRouteIndex + 1)),
    );
    const routeCalculus = eventCalculus.deriveRuntimeEventCalculusProjection(
      routePrefix,
    );
    assert.equal(eventCalculus.holdsAt(
      routeCalculus,
      eventCalculus.constructRuntimeFluent({
        name: "retry_attempt_active",
        identity: attempts[2].payload.attemptRef,
      }),
    ), false, row.label);
    for (const stopped of progress.slice(1)) {
      assert.equal(eventCalculus.holdsAt(
        routeCalculus,
        eventCalculus.constructRuntimeFluent({
          name: "retry_progress_available",
          identity: stopped.payload.progressRef,
        }),
      ), false, row.label);
    }

    if (row.label === "stationary-contract-failure") {
      await context.test(
        "T-287 R1 nested blocked return_to_parent consumes the full stopped suffix",
        async () => {
          const childStore = await reopenPrefix(
            events.slice(0, blockedRouteIndex),
            join(harness.scratch, "retry-return-to-parent-prefix.events.jsonl"),
          );
          assert.equal(childStore.kind, "reopened_event_store_context");
          const childPrefix = selectValidatedRuntimeEventPrefix(
            childStore.store.readAll(),
          );
          const calls = events.filter((event) => event.kind === "c_call_opened");
          const childCall = calls.at(-1);
          const childResult = results.at(-1);
          const childJudgment = judgments.at(-1);
          const childFibre = events.find((event) =>
            event.kind === "c_call_fibre_selected" &&
            event.aggregateId === childCall.aggregateId);
          const entered = events.find((event) =>
            event.kind === "traversal_cursor_entered");
          const childCursor = {
            kind: "traversal_cursor",
            schemaVersion: "5.0.0",
            cursorRef: childCall.payload.cursorRef,
            cursorDigest: childCall.payload.cursorDigest,
            programRef: entered.payload.programRef,
            executionBasisRef: entered.payload.executionBasisRef,
            traversalScopeRef: entered.payload.traversalScopeRef,
            runId: childCall.runId,
            graphCallId: childCall.graphCallId,
            frameId: childCall.frameId,
            graphRef: entered.payload.materializationRef,
            inputRef: entered.payload.inputRef,
            inputDigest: entered.payload.inputDigest,
            currentNodeRef: "node://abiogenesis/conformance/fp-retry-hello@5",
            position: "at_term",
            termPath: [...entered.payload.termPath, "term", "term"],
            taskOrdinal: childCall.payload.taskOrdinal,
            attempt: childCall.payload.attempt,
            retryPath: childCall.payload.retryPath,
          };
          const resultValue = {
            kind: "admitted_c_call_result",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            ...childResult.payload,
            admissionEventRef: childResult.eventId,
          };
          const judgmentValue = {
            kind: "admitted_c_call_judgment",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            ...childJudgment.payload,
            admissionEventRef: childJudgment.eventId,
          };
          const [{ rehydrateAdmittedCCallState, projectOpenedCCallCarrier },
            { rehydrateExecutionBasis },
            { materializeGraph }, retryApi, routeApi, replayApi, hogRouteApi] =
            await Promise.all([
              import(pathToFileURL(join(root,
                "build/code/src/abg/c_call.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/abg/execution_basis.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/gtl/materialize.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/abg/retry.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/abg/traversal_route.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/abg/replay.js")).href),
              import(pathToFileURL(join(root,
                "build/code/src/hog/traversal_route.js")).href),
            ]);
          const executionBasis = rehydrateExecutionBasis(
            childStore.store,
            childCall.basisId,
          );
          assert.ok(executionBasis);
          const cCallValue = {
            kind: "c_call",
            schemaVersion: "5.0.0",
            ...childCall.payload,
            basisId: childCall.basisId,
            runId: childCall.runId,
            graphFunctionRef: childCall.graphFunctionRef,
            graphCallId: childCall.graphCallId,
            frameId: childCall.frameId,
            childGraphFunctionRef: null,
            transitionContractRef: executionBasis.transitionContractRef,
            openedEventRef: childCall.eventId,
            fibreSelectedEventRef: childFibre.eventId,
          };
          const outcome = rehydrateAdmittedCCallState(
            childStore.store,
            cCallValue,
            resultValue,
            judgmentValue,
          );
          assert.ok(outcome);
          const catalogEntry = run.outcomes[4].result.graphFunctionEntries
            .find((entry) => entry.handle === GRAPH_FUNCTION_REF);
          const basisEvent = events.find((event) =>
            event.kind === "basis_admitted" &&
            event.basisId === childCall.basisId);
          const graph = materializeGraph(catalogEntry.definition, {
            invocationAdmissionRef: basisEvent.payload.invocationAdmissionRef,
            admittedInputRef: basisEvent.payload.rawInputAdmissionRef,
            admittedInputDigest: basisEvent.payload.rawInputDigest,
            admittedInput: fpInput("World"),
          });
          const immutablePrefixText =
            `${events.slice(0, blockedRouteIndex).map((event) =>
              JSON.stringify(event)).join("\n")}\n`;
          const workerPath = join(root,
            "test_env/falsifiers/t287-r3-reopen-route-worker.mjs");
          const runOwnerInternalWorker = async (label, cCallRef) => {
            const eventLogPath = join(
              harness.scratch,
              `retry-r3-${label}-prefix.events.jsonl`,
            );
            const handoffPath = join(
              harness.scratch,
              `retry-r3-${label}-handoff.json`,
            );
            await writeFile(eventLogPath, immutablePrefixText, "utf8");
            await writeFile(handoffPath, JSON.stringify({
              packageRoot: harness.installedPackageRoot,
              eventLogPath,
              graphFunction: catalogEntry.definition,
              cCallRef,
              eventTime: blockedRoute.eventTime,
            }), "utf8");
            return execFileAsync(
              process.execPath,
              [workerPath, handoffPath],
              { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
            );
          };
          const freshWorker = await runOwnerInternalWorker(
            "owner-internal",
            childCall.aggregateId,
          );
          const freshRoute = JSON.parse(freshWorker.stdout);
          assert.notEqual(freshRoute.pid, process.pid,
            "T-287 R3 owner-internal reconstruction executes in PID 2");
          assert.equal(freshRoute.reconstructionKind,
            "owner_internal_retry_frontier");
          assert.equal(freshRoute.ownerInternalProjectionEqual, true);
          assert.deepEqual(freshRoute.consumedAvailabilityRefs, [
            outcome.judgment.judgmentRef,
            ...progress.slice(1).map((event) => event.payload.progressRef),
          ]);
          assert.deepEqual(freshRoute.causationEventRefs,
            progress.slice(1).toReversed().map((event) => event.eventId));
          await assert.rejects(
            () => runOwnerInternalWorker(
              "forged-selector",
              `${childCall.aggregateId}/forged`,
            ),
            (error) => {
              assert.match(error.stderr,
                /owner-internal selector resolves one exact CCall/u);
              return true;
            },
            "a forged CCall selector is refused before reconstruction",
          );
          assert.equal(await readFile(join(
            harness.scratch,
            "retry-r3-forged-selector-prefix.events.jsonl",
          ), "utf8"), immutablePrefixText);
          const staleCall = calls.at(-2);
          assert.ok(staleCall);
          await assert.rejects(
            () => runOwnerInternalWorker(
              "stale-selector",
              staleCall.aggregateId,
            ),
            (error) => {
              assert.match(error.stderr,
                /stopped suffix cardinality equals the selected nested retry depth/u);
              return true;
            },
            "a stale CCall selector cannot select the current stopped suffix",
          );
          assert.equal(await readFile(join(
            harness.scratch,
            "retry-r3-stale-selector-prefix.events.jsonl",
          ), "utf8"), immutablePrefixText);
          const stoppedProgresses = progress.slice(1).map((event) =>
            retryApi.projectAdmittedRetryProgress(childPrefix, event.eventId)
          );
          assert.deepEqual(
            stoppedProgresses.map((stopped) => stopped?.progressClass),
            ["stopped", "stopped"],
          );
          for (const stopped of stoppedProgresses) {
            assert.equal(retryApi.hasAdmittedRetryProgress(
              childPrefix,
              stopped,
            ), true);
          }
          const childReplay = replayApi.replay(childStore.store, {
            runId: childCall.runId,
          });
          const eventDerivedCCall = projectOpenedCCallCarrier(
            childStore.store,
            childPrefix,
            graph,
            childCall.aggregateId,
          );
          assert.ok(eventDerivedCCall);
          const eventDerivedAttempt = retryApi.projectRetryAttempt(
            childPrefix,
            graph,
            attempts[2].eventId,
          );
          assert.ok(eventDerivedAttempt);
          assert.deepEqual(freshRoute.ownerInternalProjection, {
            cCallRef: eventDerivedCCall.cCallRef,
            attemptRef: eventDerivedAttempt.attemptRef,
            attemptDigest: eventDerivedAttempt.attemptDigest,
            inputRef: eventDerivedAttempt.inputRef,
            inputDigest: eventDerivedAttempt.inputDigest,
            inputContractRef: eventDerivedAttempt.inputContractRef,
            stoppedProgressRefs: stoppedProgresses.map((stopped) =>
              stopped.progressRef),
            stoppedProgressDigests: stoppedProgresses.map((stopped) =>
              stopped.progressDigest),
          }, "PID-2 owner projection equals the source-process projection");
          const clonedCCall = structuredClone(eventDerivedCCall);
          const proposal = hogRouteApi.proposeBlockedRoute(
            graph,
            {
              cursor: childCursor,
              programLocusRef: childCall.payload.programLocusRef,
            },
            clonedCCall,
            outcome.judgment.judgmentRef,
            childReplay,
            clonedCCall.transitionContractRef,
            stoppedProgresses.map((stopped) => stopped.progressRef),
          );
          assert.equal(proposal.kind, "traversal_route_candidate",
            JSON.stringify(proposal));
          const forgedStore = await reopenPrefix(
            events.slice(0, blockedRouteIndex),
            join(harness.scratch, "retry-forged-c-call-prefix.events.jsonl"),
          );
          assert.equal(forgedStore.kind, "reopened_event_store_context");
          const forgedBasis = rehydrateExecutionBasis(
            forgedStore.store,
            childCall.basisId,
          );
          assert.ok(forgedBasis);
          const forgedCCall = {
            ...structuredClone(clonedCCall),
            implementationRef: `${clonedCCall.implementationRef}/forged`,
          };
          const forgedBefore = forgedStore.store.readAll().length;
          const forgedRoute = routeApi.admitRoute(
            forgedStore.store,
            forgedBasis,
            graph,
            childCursor,
            null,
            replayApi.replay(forgedStore.store, { runId: childCall.runId }),
            proposal,
            {
              eventTime: blockedRoute.eventTime,
              correlationId: "test://retry-forged-c-call/blocked-route",
              causationEventRefs: [],
            },
            {
              cCall: forgedCCall,
              resultRef: outcome.result.resultRef,
              judgmentRef: outcome.judgment.judgmentRef,
              judgmentEventRef: outcome.judgment.admissionEventRef,
              reasonRef: outcome.judgment.reasonRef,
              stoppedProgresses: structuredClone(stoppedProgresses),
            },
            { terminalizeRun: false },
          );
          assert.equal(forgedRoute.kind, "traversal_route_admission_refusal",
            "T-287 R3 rejects a shaped carrier that differs from event-derived CCall truth");
          assert.equal(forgedStore.store.readAll().length, forgedBefore);
          forgedStore.store.closeDurableLog();
          const route = routeApi.admitRoute(
            childStore.store,
            executionBasis,
            graph,
            childCursor,
            null,
            childReplay,
            proposal,
            {
              eventTime: blockedRoute.eventTime,
              correlationId: "test://retry-return-to-parent/blocked-route",
              causationEventRefs: [],
            },
            {
              cCall: clonedCCall,
              resultRef: outcome.result.resultRef,
              judgmentRef: outcome.judgment.judgmentRef,
              judgmentEventRef: outcome.judgment.admissionEventRef,
              reasonRef: outcome.judgment.reasonRef,
              stoppedProgresses: structuredClone(stoppedProgresses),
            },
            { terminalizeRun: false },
          );
          assert.equal(route.kind, "admitted_traversal_route",
            JSON.stringify(route));
          assert.equal(route.runStoppedEventRef, null);
          assert.deepEqual(route.consumedAvailabilityRefs, [
            outcome.judgment.judgmentRef,
            ...stoppedProgresses.map((stopped) => stopped.progressRef),
          ]);
          assert.deepEqual(
            childStore.store.readAll().at(-1).causationEventRefs,
            stoppedProgresses.toReversed().map((stopped) =>
              stopped.admissionEventRef
            ),
          );
          assert.equal(childStore.store.readAll().some((event) =>
            event.kind === "run_stopped"), false);
          const routedPrefix = selectValidatedRuntimeEventPrefix(
            childStore.store.readAll(),
          );
          for (const stopped of stoppedProgresses) {
            assert.equal(retryApi.hasAdmittedRetryProgress(
              routedPrefix,
              stopped,
            ), false);
          }
          childStore.store.closeDurableLog();
        },
      );
    }

    const closedPrefix = selectValidatedRuntimeEventPrefix(deepFreeze(events));
    const closedCalculus = eventCalculus.deriveRuntimeEventCalculusProjection(
      closedPrefix,
    );
    assert.equal(attempts.every((attempt) => !eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructRuntimeFluent({
        name: "retry_attempt_active",
        identity: attempt.payload.attemptRef,
      }),
    )), true, row.label);
    assert.equal(progress.every((entry) => !eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructRuntimeFluent({
        name: "retry_progress_available",
        identity: entry.payload.progressRef,
      }),
    )), true, row.label);
  }
});
