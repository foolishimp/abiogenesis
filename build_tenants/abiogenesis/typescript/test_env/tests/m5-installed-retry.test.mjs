import assert from "node:assert/strict";
import { chmod, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
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
    "  const malformed = mode === 'always_malformed' || (mode !== 'contradictory' && attempt === 1);",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: `attempt ${attempt}` }] } }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: malformed ? '{not-json' : JSON.stringify(result) }));",
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

  assert.deepEqual(attempts.map((event) => event.payload.attempt), [1, 2]);
  assert.deepEqual(attempts.map((event) => event.payload.retryPath), [[1], [2]]);
  assert.deepEqual(progress.map((event) => event.payload.progressClass), [
    "retry",
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
  assert.deepEqual(
    judgments.map((event) => event.payload.retryAttemptRef),
    attempts.map((event) => event.payload.attemptRef),
  );
  assert.equal(progress[0].payload.attemptRef, attempts[0].payload.attemptRef);
  assert.equal(progress[1].payload.attemptRef, attempts[1].payload.attemptRef);
  assert.equal(progress[1].payload.completedRetryDepth, 1);
  assert.equal(progress[1].payload.judgmentRef, judgments[1].payload.judgmentRef);
  assert.deepEqual(routes.map((event) => event.payload.routeKind), [
    "retry",
    "retry",
    "terminal",
  ]);
  assert.ok(routes[2].payload.consumedAvailabilityRefs.includes(
    progress[1].payload.progressRef,
  ));
  assert.equal(Object.hasOwn(progress[1].payload, "targetCursorRef"), false);
  assert.equal(Object.hasOwn(progress[1].payload, "targetCursorDigest"), false);
  assert.equal(progress[1].payload.predecessorProgressRef, null);
  assert.deepEqual(progress[1].causationEventRefs, [
    attempts[1].eventId,
    judgments[1].eventId,
  ]);
  assert.equal(routes[2].causationEventRefs.includes(progress[1].eventId), true);

  const completedIndex = events.findIndex((event) =>
    event.eventId === progress[1].eventId);
  const durablePrefix = events.slice(0, completedIndex + 1);
  const reopened = await reopenPrefix(
    durablePrefix,
    join(harness.scratch, "retry-completed-prefix.events.jsonl"),
  );
  assert.equal(reopened.kind, "reopened_event_store_context");
  const { hasAdmittedRetryProgress } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry.js",
  )).href);
  const completedAdmission = {
    kind: "retry_progress_admission",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...progress[1].payload,
    targetCursorRef: null,
    targetCursorDigest: null,
    admissionEventRef: progress[1].eventId,
  };
  assert.equal(hasAdmittedRetryProgress(reopened.store, completedAdmission), true);
  reopened.store.closeDurableLog();

  const beforeCompleted = await reopenPrefix(
    events.slice(0, completedIndex),
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
      const { attemptRef: _attemptRef, ...malformedPayload } = progress[1].payload;
      return eventCandidate(progress[1], {
        causationEventRefs: [attempts[0].eventId, admitted[0].eventId],
        correlationId: `${progress[1].correlationId}/outer-malformed`,
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
  beforeCompleted.store.closeDurableLog();

  const ownerStore = await reopenPrefix(
    events.slice(0, completedIndex),
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
    termPath: [...entered.payload.termPath, "term"],
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
  const graph = {
    graphFunctionRef: GRAPH_FUNCTION_REF,
    graphFunctionDigest: entered.payload.graphFunctionDigest,
    materializationRef: entered.payload.materializationRef,
    materializationDigest: entered.payload.materializationDigest,
    template: catalogEntry.definition.template,
  };
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
    { retryPath: [7] },
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
  assert.equal(admittedCompletion.length, 1);
  assert.equal(ownerStore.store.readAll().length, ownerBefore + 1);
  ownerStore.store.closeDurableLog();

  const { sha256Canonical } = await import(pathToFileURL(join(
    root,
    "build/code/src/shared/digests.js",
  )).href);
  const originalRetryTerm = catalogEntry.definition.template.nodes[0].term;
  const nestedTemplate = {
    ...graph.template,
    nodes: [{
      ...graph.template.nodes[0],
      term: {
        ...originalRetryTerm,
        term: { ...originalRetryTerm },
      },
    }],
  };
  const nestedMaterializationDigest = sha256Canonical(nestedTemplate);
  const nestedGraph = {
    ...graph,
    materializationRef:
      `graph-materialization://abiogenesis/${nestedMaterializationDigest.slice("sha256:".length)}`,
    materializationDigest: nestedMaterializationDigest,
    template: nestedTemplate,
  };
  const firstAttemptEvent = attempts[0];
  async function prepareNestedOwner(label, mutateOuter = false) {
    const context = await reopenPrefix(
      events.slice(0, completedIndex),
      join(harness.scratch, `${label}.events.jsonl`),
    );
    assert.equal(context.kind, "reopened_event_store_context");
    const nestedCursorBody = {
      programRef: entered.payload.programRef,
      executionBasisRef: entered.payload.executionBasisRef,
      traversalScopeRef: entered.payload.traversalScopeRef,
      runId: secondCall.runId,
      graphCallId: secondCall.graphCallId,
      frameId: secondCall.frameId,
      graphRef: nestedGraph.materializationRef,
      inputRef: entered.payload.inputRef,
      inputDigest: entered.payload.inputDigest,
      currentNodeRef: "node://abiogenesis/conformance/fp-retry-hello@5",
      position: "at_term",
      termPath: [...entered.payload.termPath, "term", "term"],
      taskOrdinal: null,
      attempt: 1,
      retryPath: [1, 1],
    };
    const nestedCursorDigest = sha256Canonical(nestedCursorBody);
    const nestedCursorRef =
      `traversal-cursor://abiogenesis/${nestedCursorDigest.slice("sha256:".length)}`;
    const nestedCursor = {
      kind: "traversal_cursor",
      schemaVersion: "5.0.0",
      cursorRef: nestedCursorRef,
      cursorDigest: nestedCursorDigest,
      ...nestedCursorBody,
    };
    const boundary = (retryTermPath) => {
      const digest = sha256Canonical({
        graphRef: nestedGraph.materializationRef,
        frameId: nestedCursor.frameId,
        nodeRef: nestedCursor.currentNodeRef,
        retryTermPath,
      });
      return `retry-boundary://abiogenesis/${digest.slice("sha256:".length)}`;
    };
    const attemptIdentity = (retryTermPath, wrappedTermPath, retryPath) => {
      const body = {
        retryBoundaryRef: boundary(retryTermPath),
        retryTermPath,
        wrappedTermPath,
        taskOrdinal: null,
        attempt: 1,
        retryPath,
        budget: 2,
        retryableFailureClasses: firstAttemptEvent.payload.retryableFailureClasses,
        priorJudgmentRef: null,
        priorRouteRef: firstAttemptEvent.payload.priorRouteRef,
        inputRef: nestedCursor.inputRef,
        inputDigest: nestedCursor.inputDigest,
        inputContractRef: firstAttemptEvent.payload.inputContractRef,
      };
      const attemptDigest = sha256Canonical(body);
      return {
        body,
        attemptDigest,
        attemptRef:
          `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`,
      };
    };
    const outer = attemptIdentity(
      entered.payload.termPath,
      [...entered.payload.termPath, "term"],
      [1],
    );
    if (mutateOuter) {
      outer.body.retryBoundaryRef = "retry-boundary://abiogenesis/forged-outer";
      outer.attemptDigest = sha256Canonical(outer.body);
      outer.attemptRef =
        `retry-attempt://abiogenesis/${outer.attemptDigest.slice("sha256:".length)}`;
    }
    const inner = attemptIdentity(
      [...entered.payload.termPath, "term"],
      [...entered.payload.termPath, "term", "term"],
      [1, 1],
    );
    const cCallIdentity = {
      basisId: secondCall.basisId,
      graphCallId: secondCall.graphCallId,
      frameId: secondCall.frameId,
      vectorIndex: secondCall.payload.vectorIndex,
      stageRole: secondCall.payload.stageRole,
      taskOrdinal: null,
      attempt: 1,
      programLocusRef: secondCall.payload.programLocusRef,
      retryPath: [1, 1],
    };
    const cCallDigest = sha256Canonical(cCallIdentity);
    const cCallRef = `c-call:${cCallDigest}`;
    const { resultRef: _oldResultRef, resultDigest: _oldResultDigest,
      ...resultBodyBase } = secondResult.payload;
    const resultBody = { ...resultBodyBase, cCallRef };
    const resultDigest = sha256Canonical(resultBody);
    const resultRef =
      `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
    const { judgmentRef: _oldJudgmentRef, judgmentDigest: _oldJudgmentDigest,
      ...judgmentBodyBase } = secondJudgment.payload;
    const judgmentBody = {
      ...judgmentBodyBase,
      cCallRef,
      resultRef,
      resultDigest,
      judgment: "advance",
      retryAttemptRef: inner.attemptRef,
    };
    const judgmentDigest = sha256Canonical(judgmentBody);
    const judgmentRef =
      `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
    const appended = admitRuntimeEventBatch(context.store, [
      () => eventCandidate(entered, {
        materializationRef: nestedGraph.materializationRef,
        causationEventRefs: [secondJudgment.eventId],
        correlationId: `${entered.correlationId}/${label}/cursor`,
        payload: {
          ...entered.payload,
          materializationRef: nestedGraph.materializationRef,
          materializationDigest: nestedGraph.materializationDigest,
          cursorRef: nestedCursorRef,
          cursorDigest: nestedCursorDigest,
          attempt: 1,
          retryPath: [1, 1],
          termPath: nestedCursor.termPath,
        },
      }),
      (prior) => eventCandidate(firstAttemptEvent, {
        materializationRef: nestedGraph.materializationRef,
        causationEventRefs: [prior[0].eventId],
        correlationId: `${firstAttemptEvent.correlationId}/${label}/outer`,
        payload: { attemptRef: outer.attemptRef, attemptDigest: outer.attemptDigest, ...outer.body },
      }),
      (prior) => eventCandidate(firstAttemptEvent, {
        materializationRef: nestedGraph.materializationRef,
        causationEventRefs: [prior[1].eventId],
        correlationId: `${firstAttemptEvent.correlationId}/${label}/inner`,
        payload: { attemptRef: inner.attemptRef, attemptDigest: inner.attemptDigest, ...inner.body },
      }),
      (prior) => eventCandidate(secondCall, {
        materializationRef: nestedGraph.materializationRef,
        aggregateId: cCallRef,
        causationEventRefs: [prior[2].eventId],
        correlationId: `${secondCall.correlationId}/${label}`,
        payload: {
          ...secondCall.payload,
          cCallRef,
          cCallDigest,
          cursorRef: nestedCursorRef,
          cursorDigest: nestedCursorDigest,
          attempt: 1,
          retryPath: [1, 1],
        },
      }),
      (prior) => eventCandidate(secondFibre, {
        materializationRef: nestedGraph.materializationRef,
        aggregateId: cCallRef,
        causationEventRefs: [prior[3].eventId],
        correlationId: `${secondFibre.correlationId}/${label}`,
        payload: { ...secondFibre.payload, cCallRef },
      }),
      (prior) => eventCandidate(secondResult, {
        materializationRef: nestedGraph.materializationRef,
        aggregateId: cCallRef,
        causationEventRefs: [prior[4].eventId],
        correlationId: `${secondResult.correlationId}/${label}`,
        payload: { resultRef, resultDigest, ...resultBody },
      }),
      (prior) => eventCandidate(secondJudgment, {
        materializationRef: nestedGraph.materializationRef,
        aggregateId: cCallRef,
        causationEventRefs: [prior[5].eventId],
        correlationId: `${secondJudgment.correlationId}/${label}`,
        payload: { judgmentRef, judgmentDigest, ...judgmentBody },
      }),
    ]);
    const nestedCCallValue = {
      kind: "c_call",
      schemaVersion: "5.0.0",
      ...appended[3].payload,
      basisId: appended[3].basisId,
      runId: appended[3].runId,
      graphFunctionRef: appended[3].graphFunctionRef,
      graphCallId: appended[3].graphCallId,
      frameId: appended[3].frameId,
      childGraphFunctionRef: null,
      openedEventRef: appended[3].eventId,
      fibreSelectedEventRef: appended[4].eventId,
    };
    const nestedResultValue = {
      kind: "admitted_c_call_result",
      schemaVersion: "5.0.0",
      disposition: "admitted",
      ...appended[5].payload,
      admissionEventRef: appended[5].eventId,
    };
    const nestedJudgmentValue = {
      kind: "admitted_c_call_judgment",
      schemaVersion: "5.0.0",
      disposition: "admitted",
      ...appended[6].payload,
      admissionEventRef: appended[6].eventId,
    };
    const outcome = rehydrateAdmittedCCallState(
      context.store,
      nestedCCallValue,
      nestedResultValue,
      nestedJudgmentValue,
    );
    assert.ok(outcome);
    return { context, nestedCursor, outcome, inner, outer, appended };
  }

  const nested = await prepareNestedOwner("nested-honest");
  const nestedBefore = nested.context.store.readAll().length;
  const nestedCompletion = admitCompletedRetryProgress(
    nested.context.store,
    nestedGraph,
    nested.nestedCursor,
    null,
    nested.outcome.cCall,
    nested.outcome.result,
    nested.outcome.judgment,
    { eventTime: progress[1].eventTime, correlationId: "test://nested-completed", causationEventRefs: [] },
  );
  assert.equal(Array.isArray(nestedCompletion), true, JSON.stringify(nestedCompletion));
  assert.deepEqual(nestedCompletion.map((row) => row.completedRetryDepth), [2, 1]);
  assert.equal(nestedCompletion[1].predecessorProgressRef,
    nestedCompletion[0].progressRef);
  const nestedRows = nested.context.store.readAll().slice(nestedBefore);
  assert.equal(nestedRows.length, 2);
  assert.deepEqual(nestedRows[0].causationEventRefs, [
    nested.appended[2].eventId,
    nested.outcome.judgment.admissionEventRef,
  ]);
  assert.deepEqual(nestedRows[1].causationEventRefs, [
    nested.appended[1].eventId,
    nestedRows[0].eventId,
  ]);
  nested.context.store.closeDurableLog();

  const nestedMutation = await prepareNestedOwner("nested-outer-mutation", true);
  const mutationBefore = nestedMutation.context.store.readAll().length;
  const nestedRefusal = admitCompletedRetryProgress(
    nestedMutation.context.store,
    nestedGraph,
    nestedMutation.nestedCursor,
    null,
    nestedMutation.outcome.cCall,
    nestedMutation.outcome.result,
    nestedMutation.outcome.judgment,
    { eventTime: progress[1].eventTime, correlationId: "test://nested-refusal", causationEventRefs: [] },
  );
  assert.equal(nestedRefusal.kind, "retry_admission_refusal");
  assert.equal(nestedMutation.context.store.readAll().length, mutationBefore,
    "outer owner mutation appends zero inner or outer completion rows");
  nestedMutation.context.store.closeDurableLog();

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
      event.eventId === progress[1].eventId ? mutate(event) : event);
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
  assert.equal(hasAdmittedRetryProgress(closedReopen.store, completedAdmission), false,
    "terminal route consumption is reconstructed as unavailable after durable reopen");
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
  assert.equal(events.filter((event) => event.kind === "retry_attempt_opened").length, 1);
  assert.equal(events.some((event) => event.kind === "retry_progress_recorded"), false);
  assert.equal(events.filter((event) => event.kind === "actor_invocation_started").length, 1);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "traversal_route_admitted")
      .map((event) => event.payload.routeKind),
    ["retry", "blocked"],
  );
  assert.equal(events.at(-1).kind, "run_stopped");
});

test("M5 installed C.retry exhausts its declared budget without a third dispatch", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const counterPath = join(harness.scratch, "retry-exhausted.count");
  const scenario = await buildRootCliScenario(
    harness,
    "m5-fp-retry-exhausted",
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
      ABG_FP_RETRY_MODE: "always_malformed",
    },
  });

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[6].disposition, "blocked");
  assert.equal(await readFile(counterPath, "utf8"), "2");
  const events = await readEvents(scenario.eventLogPath);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "retry_attempt_opened")
      .map((event) => event.payload.attempt),
    [1, 2],
  );
  assert.equal(events.filter((event) =>
    event.kind === "retry_progress_recorded").length, 1);
  assert.equal(events.filter((event) =>
    event.kind === "actor_invocation_started").length, 2);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "c_call_judged")
      .map((event) => event.payload.judgment),
    ["retry", "blocked"],
  );
  assert.equal(events.at(-1).kind, "run_stopped");
});
