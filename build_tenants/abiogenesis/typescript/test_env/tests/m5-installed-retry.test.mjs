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
  const { canonicalJson } = await import(pathToFileURL(join(
    root,
    "build/code/src/shared/canonical_json.js",
  )).href);
  const bytes = `${events.map((event) => canonicalJson(event)).join("\n")}\n`;
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.ok(attempts.every((event) =>
    typeof event.payload.attemptManifestRef === "string" &&
    event.payload.attemptManifestRef.startsWith(
      "retry-attempt-manifest://abiogenesis/",
    )), "every declared retry ordinal carries its owner-local fresh manifest");
  assert.equal(
    new Set(attempts.map((event) => event.payload.attemptManifestRef)).size,
    attempts.length,
    "nested and repeated retry ordinals never reuse an attempt manifest",
  );
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
    projectDeclaredCRetryFrontier,
    projectExecutableRetryInput,
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

  const ownerStorePath = join(
    harness.scratch,
    "retry-owner-prefix.events.jsonl",
  );
  const ownerStore = await reopenPrefix(
    events.slice(0, firstCompletedIndex),
    ownerStorePath,
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
  const retrySourceCall = calls[0];
  assert.ok(retrySourceCall);
  const retrySourceCursor = {
    ...sourceCursor,
    cursorRef: retrySourceCall.payload.cursorRef,
    cursorDigest: retrySourceCall.payload.cursorDigest,
    runId: retrySourceCall.runId,
    graphCallId: retrySourceCall.graphCallId,
    frameId: retrySourceCall.frameId,
    taskOrdinal: retrySourceCall.payload.taskOrdinal,
    attempt: retrySourceCall.payload.attempt,
    retryPath: retrySourceCall.payload.retryPath,
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
  const {
    projectAdmittedCCallOutcomeAtPrefix,
    projectCCallCarrierPhaseAtPrefix,
    projectOpenedCCallCarrier,
    rehydrateAdmittedCCallState,
  } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/c_call.js",
  )).href);
  const incompleteOpenedOnlyOutcome = rehydrateAdmittedCCallState(
    ownerStore.store,
    cCallValue,
    resultValue,
    judgmentValue,
  );
  assert.equal(incompleteOpenedOnlyOutcome, null,
    "opened-only caller assembly cannot rehydrate an admitted CCall outcome");
  const catalogEntry = run.outcomes[4].result.entries.find((entry) =>
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
  const completedOwnerCases = [
    {
      depth: 2,
      event: progress[1],
      admission: completedAdmissions[0],
      rowKind: "declared_c_retry_c_call_completed_progress",
    },
    {
      depth: 1,
      event: progress[2],
      admission: completedAdmissions[1],
      rowKind: "declared_c_retry_propagated_completed_progress",
    },
  ];
  const completedOwners = completedOwnerCases.map((ownerCase) => {
    const owner = projectDeclaredCRetryFrontier(
      completedPrefix,
      graph,
      sourceCursor,
      catalogEntry.definition,
      ownerCase.depth,
    );
    assert.equal(owner?.state, "progress_available",
      `completed retry depth ${ownerCase.depth} is the available declared frontier`);
    assert.equal(owner.available.kind, ownerCase.rowKind);
    assert.equal(owner.available.progressEventRef, ownerCase.event.eventId);
    assert.deepEqual(owner.available.progress, ownerCase.admission,
      "historical progress is read from the matching exact owner row");
    assert.equal(owner.rows.filter((row) =>
      row.progress?.progressRef === ownerCase.admission.progressRef &&
      row.progressEventRef === ownerCase.event.eventId
    ).length, 1);
    return owner;
  });
  assert.equal(
    completedOwners[1].available.predecessor.progress.progressRef,
    completedOwners[0].available.progress.progressRef,
    "the outer completed owner binds its exact inner predecessor",
  );
  assert.equal(
    completedOwners[1].available.predecessor.progressEventRef,
    completedOwners[0].available.progressEventRef,
  );
  const ownerPrefix = selectValidatedRuntimeEventPrefix(
    ownerStore.store.readAll(),
  );
  const projectedOwnerCCall = projectOpenedCCallCarrier(
    ownerStore.store,
    ownerPrefix,
    graph,
    secondCall.aggregateId,
  );
  assert.ok(projectedOwnerCCall,
    "the complete CCall carrier is projected from open, fibre, graph, and basis truth");
  const rehydratedOutcome = rehydrateAdmittedCCallState(
    ownerStore.store,
    projectedOwnerCCall,
    resultValue,
    judgmentValue,
  );
  assert.ok(rehydratedOutcome,
    "the exact projected carrier rehydrates its admitted result and judgment");
  const program = harness.rootPublication.programs.find((candidate) =>
    candidate.programRef === PROGRAM_REF);
  assert.ok(program);
  const retrySelector = {
    kind: "retry_frontier_selector",
    schemaVersion: "5.0.0",
    runId: progress[0].runId,
    graphCallId: progress[0].graphCallId,
    frameId: progress[0].frameId,
    retryBoundaryRef: progress[0].payload.retryBoundaryRef,
    retryProgressRef: progress[0].payload.progressRef,
  };
  const selectedProgressIndex = events.findIndex((event) =>
    event.eventId === progress[0].eventId);
  const noOutgoingRoute = await reopenPrefix(
    events.slice(0, selectedProgressIndex + 1),
    join(harness.scratch, "retry-d17-no-outgoing-route.events.jsonl"),
  );
  assert.equal(noOutgoingRoute.kind, "reopened_event_store_context");
  const currentD17 = projectExecutableRetryInput({
    prefix: noOutgoingRoute.prefix,
    selector: retrySelector,
    program,
    graphFunction: catalogEntry.definition,
    graph,
  });
  assert.equal(currentD17.kind, "executable_retry_input",
    JSON.stringify(currentD17));
  const isolatedProgressPrefix = selectValidatedRuntimeEventPrefix(
    noOutgoingRoute.store.readAll(),
  );
  const isolatedProgressOwner = projectDeclaredCRetryFrontier(
    isolatedProgressPrefix,
    graph,
    currentD17.sourceCursor,
    catalogEntry.definition,
  );
  assert.equal(isolatedProgressOwner?.state, "progress_available");
  assert.equal(
    isolatedProgressOwner.available.progressEventRef,
    progress[0].eventId,
    "the isolated progress row is the exact available owner frontier",
  );
  assert.equal(
    isolatedProgressOwner.available.progress.progressRef,
    progress[0].payload.progressRef,
  );
  assert.equal(
    isolatedProgressOwner.rows.filter((row) =>
      row.progressEventRef === progress[0].eventId &&
      row.progress?.progressRef === progress[0].payload.progressRef
    ).length,
    1,
    "the exact owner retains one matching historical retry row",
  );
  noOutgoingRoute.store.closeDurableLog();
  const actualOutgoingRoute = routes.find((event) =>
    event.payload.routeKind === "retry" &&
    event.payload.sourceCursorRef === currentD17.sourceCursor.cursorRef &&
    event.payload.sourceCursorDigest === currentD17.sourceCursor.cursorDigest &&
    event.payload.consumedAvailabilityRefs.includes(
      progress[0].payload.progressRef,
    ));
  assert.ok(actualOutgoingRoute);
  const actualOutgoingRouteIndex = events.findIndex((event) =>
    event.eventId === actualOutgoingRoute.eventId);
  assert.notEqual(actualOutgoingRouteIndex, -1);
  const spentSource = await reopenPrefix(
    events.slice(0, actualOutgoingRouteIndex + 1),
    join(harness.scratch, "retry-d17-spent-source.events.jsonl"),
  );
  assert.equal(
    spentSource.kind,
    "reopened_event_store_context",
    JSON.stringify(spentSource),
  );
  const staleD17 = projectExecutableRetryInput({
    prefix: spentSource.prefix,
    selector: retrySelector,
    program,
    graphFunction: catalogEntry.definition,
    graph,
  });
  assert.equal(staleD17.kind, "executable_retry_input_refusal");
  assert.equal(staleD17.code, "frontier_stale");
  assert.deepEqual(staleD17.citedSourceEventRefs, [
    actualOutgoingRoute.eventId,
  ]);
  spentSource.store.closeDurableLog();
  const eventStoreProjectorApi = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_store.js",
  )).href);
  const preProgressSource = events.slice(0, selectedProgressIndex);
  const preProgressRouteEvents = [];
  const preProgressRefMap = new Map();
  const mapPreProgressRefs = (value) => {
    if (typeof value === "string") {
      return preProgressRefMap.get(value) ?? value;
    }
    if (Array.isArray(value)) return value.map(mapPreProgressRefs);
    if (value === null || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      mapPreProgressRefs(child),
    ]));
  };
  for (const original of preProgressSource) {
    const admitted = eventStoreProjectorApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...preProgressRouteEvents]),
      eventCandidate(original, {
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          preProgressRefMap.get(eventRef) ?? eventRef),
        payload: mapPreProgressRefs(original.payload),
      }),
    );
    preProgressRouteEvents.push(admitted);
    preProgressRefMap.set(original.eventId, admitted.eventId);
  }
  const duplicateAttemptSource = attempts[1];
  const duplicateAttempt =
    eventStoreProjectorApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...preProgressRouteEvents]),
      eventCandidate(duplicateAttemptSource, {
        causationEventRefs: duplicateAttemptSource.causationEventRefs.map(
          (eventRef) => preProgressRefMap.get(eventRef) ?? eventRef,
        ),
        correlationId: `${duplicateAttemptSource.correlationId}/frontier-gap`,
        payload: mapPreProgressRefs(duplicateAttemptSource.payload),
      }),
    );
  const duplicateAttemptHistory = [
    ...preProgressRouteEvents,
    duplicateAttempt,
  ];
  const duplicateAttemptProgress =
    eventStoreProjectorApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...duplicateAttemptHistory]),
      eventCandidate(progress[0], {
        causationEventRefs: progress[0].causationEventRefs.map((eventRef) =>
          preProgressRefMap.get(eventRef) ?? eventRef),
        payload: mapPreProgressRefs(progress[0].payload),
      }),
    );
  const duplicateAttemptPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...duplicateAttemptHistory, duplicateAttemptProgress]),
  );
  assert.equal(projectDeclaredCRetryFrontier(
    duplicateAttemptPrefix,
    graph,
    currentD17.sourceCursor,
    catalogEntry.definition,
  ), null, "the declared retry owner refuses a duplicate attempt ordinal");
  const { sha256Canonical: hashCanonical } = await import(pathToFileURL(join(
    root,
    "build/code/src/shared/digests.js",
  )).href);
  const manifestReuseEvents = [];
  const manifestReuseRefMap = new Map();
  const mapManifestReuseRefs = (value) => {
    if (typeof value === "string") {
      return manifestReuseRefMap.get(value) ?? value;
    }
    if (Array.isArray(value)) return value.map(mapManifestReuseRefs);
    if (value === null || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      mapManifestReuseRefs(child),
    ]));
  };
  let reusedManifestAttempt;
  for (const original of [...preProgressSource, progress[0]]) {
    let payload = mapManifestReuseRefs(original.payload);
    if (original.eventId === duplicateAttemptSource.eventId) {
      const {
        attemptRef: _attemptRef,
        attemptDigest: _attemptDigest,
        ...attemptBody
      } = payload;
      const reusedBody = {
        ...attemptBody,
        attemptManifestRef: attempts[0].payload.attemptManifestRef,
      };
      const attemptDigest = hashCanonical(reusedBody);
      const attemptRef =
        `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
      payload = { attemptRef, attemptDigest, ...reusedBody };
      manifestReuseRefMap.set(original.payload.attemptRef, attemptRef);
    }
    const admitted = eventStoreProjectorApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...manifestReuseEvents]),
      eventCandidate(original, {
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          manifestReuseRefMap.get(eventRef) ?? eventRef),
        payload,
      }),
    );
    manifestReuseEvents.push(admitted);
    manifestReuseRefMap.set(original.eventId, admitted.eventId);
    if (original.eventId === duplicateAttemptSource.eventId) {
      reusedManifestAttempt = admitted;
    }
  }
  assert.ok(reusedManifestAttempt);
  const manifestReusePrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze(manifestReuseEvents),
  );
  assert.equal(
    projectRetryAttempt(
      manifestReusePrefix,
      graph,
      reusedManifestAttempt.eventId,
    ),
    null,
    "a recomputed attempt identity cannot reuse another boundary manifest",
  );
  assert.equal(projectDeclaredCRetryFrontier(
    manifestReusePrefix,
    graph,
    currentD17.sourceCursor,
    catalogEntry.definition,
  ), null, "the declared retry owner refuses a reused attempt manifest");
  const thirdAttemptIndex = events.findIndex((event) =>
    event.eventId === attempts[2].eventId);
  const projectedAttempt = projectRetryAttempt(
    completedPrefix,
    graph,
    attempts[2].eventId,
  );
  assert.equal(projectedAttempt?.attemptRef, attempts[2].payload.attemptRef,
    "T-287 R5 reconstructs the attempt cursor from its admitted retry route");
  assert.deepEqual(projectedAttempt?.retryPath, [1, 2]);
  assert.equal(projectRetryAttempt(
    completedPrefix,
    graph,
    attempts[2].payload.attemptRef,
  ), null, "a bare retry-attempt ref is not a projection query alias");
  assert.equal(projectRetryAttempt(
    completedPrefix,
    graph,
    sourceCursor.cursorRef,
  ), null, "a traversal cursor ref is not an attempt identity");
  const eventStoreApi = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_store.js",
  )).href);
  const completedProgressRefusalRollback = Symbol(
    "completed-progress-refusal-rollback",
  );
  const invokeCompletedRetryProgressForProof = (store, action) => {
    let refusal;
    try {
      return eventStoreApi.admitRuntimeEventTransactionAtExpectedPrefix(
        store,
        store.digest(),
        () => {
          const result = action();
          if (!Array.isArray(result)) {
            refusal = result;
            throw completedProgressRefusalRollback;
          }
          return result;
        },
      ).value;
    } catch (error) {
      if (
        error === completedProgressRefusalRollback &&
        refusal !== undefined
      ) return refusal;
      throw error;
    }
  };
  const eventRefMap = new Map();
  const mapEventRefs = (value) => {
    if (typeof value === "string") return eventRefMap.get(value) ?? value;
    if (Array.isArray(value)) return value.map(mapEventRefs);
    if (value === null || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, mapEventRefs(child)]),
    );
  };
  const forgedOriginEvents = [];
  let forgedLaterAttempt = null;
  for (const original of events.slice(0, thirdAttemptIndex + 1)) {
    const causationEventRefs = original.eventId === attempts[1].eventId
      ? [
          eventRefMap.get(routes[1].eventId) ?? routes[1].eventId,
          eventRefMap.get(routes[0].eventId) ?? routes[0].eventId,
        ]
      : original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef
        );
    const admitted = eventStoreApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...forgedOriginEvents]),
      eventCandidate(original, {
        causationEventRefs,
        payload: mapEventRefs(original.payload),
      }),
    );
    forgedOriginEvents.push(admitted);
    eventRefMap.set(original.eventId, admitted.eventId);
    if (original.eventId === attempts[2].eventId) {
      forgedLaterAttempt = admitted;
    }
  }
  assert.ok(forgedLaterAttempt);
  const forgedOriginPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...forgedOriginEvents]),
  );
  assert.equal(
    projectRetryAttempt(
      forgedOriginPrefix,
      graph,
      forgedLaterAttempt.eventId,
    ),
    null,
    "a later attempt cannot bootstrap authority through a schema-valid but C1-invalid origin attempt",
  );
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
  const thirdAttemptRouteEventRef = attempts[2].causationEventRefs[0];
  assert.equal(typeof thirdAttemptRouteEventRef, "string");
  attemptStore.store.digest = () => `sha256:${"0".repeat(64)}`;
  const staleAttempt = admitRetryAttempt(
    attemptStore.store,
    attemptBasis,
    graph,
    catalogEntry.definition,
    sourceCursor,
    attempts[2].payload.inputValue,
    thirdAttemptRouteEventRef,
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
    catalogEntry.definition,
    sourceCursor,
    attempts[2].payload.inputValue,
    thirdAttemptRouteEventRef,
    { eventTime: attempts[2].eventTime, correlationId: "test://retry-attempt-nonempty-basis", causationEventRefs: [routes[0].eventId] },
  );
  assert.equal(
    admittedAttempt.kind,
    "retry_attempt_admission",
    JSON.stringify(admittedAttempt),
  );
  assert.equal(admittedAttempt.attemptRef, attempts[2].payload.attemptRef);
  assert.deepEqual(attemptStore.store.readAll().at(-1).causationEventRefs, [
    thirdAttemptRouteEventRef,
  ], "retry-attempt authority is caused only by its admitted retry route");
  assert.equal(Object.hasOwn(attempts[2].payload, "inputSourceEventRef"), false);
  assert.equal(Object.hasOwn(attempts[2].payload, "inputValueKind"), false);
  attemptStore.store.closeDurableLog();

  const ownerBefore = ownerStore.store.readAll().length;
  const judgedSuccess = (cCall, result, judgment) => ({
    completionClass: "judged_success",
    cCall,
    result,
    judgment,
  });
  const fabricatedTarget = invokeCompletedRetryProgressForProof(
    ownerStore.store,
    () => admitCompletedRetryProgress(
      ownerStore.store,
      graph,
      catalogEntry.definition,
      sourceCursor,
      sourceCursor,
      judgedSuccess(
        rehydratedOutcome.cCall,
        rehydratedOutcome.result,
        rehydratedOutcome.judgment,
      ),
      { eventTime: progress[1].eventTime, correlationId: "test://retry-forged-target", causationEventRefs: [] },
    ),
  );
  assert.equal(fabricatedTarget.kind, "retry_admission_refusal");
  assert.equal(ownerStore.store.readAll().length, ownerBefore);
  const cursorWithCoordinates = (coordinates) => {
    const body = {
      programRef: coordinates.programRef,
      executionBasisRef: coordinates.executionBasisRef,
      traversalScopeRef: coordinates.traversalScopeRef,
      runId: coordinates.runId,
      graphCallId: coordinates.graphCallId,
      frameId: coordinates.frameId,
      graphRef: coordinates.graphRef,
      inputRef: coordinates.inputRef,
      inputDigest: coordinates.inputDigest,
      currentNodeRef: coordinates.currentNodeRef,
      position: coordinates.position,
      termPath: coordinates.termPath,
      taskOrdinal: coordinates.taskOrdinal,
      attempt: coordinates.attempt,
      retryPath: coordinates.retryPath,
    };
    const cursorDigest = hashCanonical(body);
    return Object.freeze({
      kind: "traversal_cursor",
      schemaVersion: "5.0.0",
      cursorRef:
        `traversal-cursor://abiogenesis/${
          cursorDigest.slice("sha256:".length)
        }`,
      cursorDigest,
      ...body,
    });
  };
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
    const mutatedSourceCursor = cursorWithCoordinates({
      ...sourceCursor,
      ...mutation,
    });
    assert.equal(
      cursorApi.isTraversalCursorCandidate(mutatedSourceCursor),
      true,
      JSON.stringify(mutation),
    );
    assert.equal(
      cursorApi.hasAdmittedTraversalCursor(
        ownerStore.store,
        mutatedSourceCursor,
      ),
      false,
      JSON.stringify(mutation),
    );
    const mutationBeforeEvents = ownerStore.store.readAll();
    const mutationBeforeDigest = ownerStore.store.digest();
    const mutationBeforeBytes = await readFile(ownerStorePath, "utf8");
    const refused = invokeCompletedRetryProgressForProof(
      ownerStore.store,
      () => admitCompletedRetryProgress(
        ownerStore.store,
        graph,
        catalogEntry.definition,
        mutatedSourceCursor,
        null,
        judgedSuccess(
          rehydratedOutcome.cCall,
          rehydratedOutcome.result,
          rehydratedOutcome.judgment,
        ),
        { eventTime: progress[1].eventTime, correlationId: "test://retry-coordinate-mutation", causationEventRefs: [] },
      ),
    );
    assert.equal(refused.kind, "retry_admission_refusal");
    assert.deepEqual(ownerStore.store.readAll(), mutationBeforeEvents);
    assert.equal(ownerStore.store.readAll().length, ownerBefore);
    assert.equal(ownerStore.store.digest(), mutationBeforeDigest);
    assert.equal(await readFile(ownerStorePath, "utf8"), mutationBeforeBytes);
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
    const refused = invokeCompletedRetryProgressForProof(
      ownerStore.store,
      () => admitCompletedRetryProgress(
        ownerStore.store,
        graphValue,
        catalogEntry.definition,
        sourceCursor,
        null,
        judgedSuccess(cCall, result, judgment),
        { eventTime: progress[1].eventTime, correlationId: `test://retry-${label}`, causationEventRefs: [] },
      ),
    );
    assert.equal(refused.kind, "retry_admission_refusal", label);
    assert.equal(ownerStore.store.readAll().length, ownerBefore, label);
  }
  const originalDigest = ownerStore.store.digest;
  ownerStore.store.digest = () => `sha256:${"0".repeat(64)}`;
  const staleCompletion = invokeCompletedRetryProgressForProof(
    ownerStore.store,
    () => admitCompletedRetryProgress(
      ownerStore.store,
      graph,
      catalogEntry.definition,
      sourceCursor,
      null,
      judgedSuccess(
        rehydratedOutcome.cCall,
        rehydratedOutcome.result,
        rehydratedOutcome.judgment,
      ),
      { eventTime: progress[1].eventTime, correlationId: "test://retry-stale-prefix", causationEventRefs: [] },
    ),
  );
  ownerStore.store.digest = originalDigest;
  assert.equal(staleCompletion.kind, "retry_admission_refusal");
  assert.equal(staleCompletion.code, "progress_mismatch");
  assert.equal(ownerStore.store.readAll().length, ownerBefore,
    "stale expected prefix appends neither nested completion row");
  const admittedCompletion = invokeCompletedRetryProgressForProof(
    ownerStore.store,
    () => admitCompletedRetryProgress(
      ownerStore.store,
      graph,
      catalogEntry.definition,
      sourceCursor,
      null,
      judgedSuccess(
        rehydratedOutcome.cCall,
        rehydratedOutcome.result,
        rehydratedOutcome.judgment,
      ),
      { eventTime: progress[1].eventTime, correlationId: "test://retry-owner", causationEventRefs: [] },
    ),
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
  const [{ replay }, routeApi, { sha256Canonical }] = await Promise.all([
    import(pathToFileURL(join(root, "build/code/src/abg/replay.js")).href),
    import(pathToFileURL(join(
      root,
      "build/code/src/abg/traversal_route.js",
    )).href),
    import(pathToFileURL(join(root, "build/code/src/shared/digests.js")).href),
  ]);
  const ownerExecutionBasis = rehydrateExecutionBasis(
    ownerStore.store,
    secondCall.basisId,
  );
  assert.ok(ownerExecutionBasis);
  const completedOwnerPrefix = selectValidatedRuntimeEventPrefix(
    ownerStore.store.readAll(),
  );
  const routeCCall = projectOpenedCCallCarrier(
    ownerStore.store,
    completedOwnerPrefix,
    graph,
    rehydratedOutcome.cCall.cCallRef,
  );
  assert.ok(routeCCall);
  const routeOutcome = rehydrateAdmittedCCallState(
    ownerStore.store,
    routeCCall,
    rehydratedOutcome.result,
    rehydratedOutcome.judgment,
  );
  assert.ok(routeOutcome);
  assert.equal(
    terminalRoute.payload.contractRef,
    routeOutcome.cCall.transitionContractRef,
  );
  assert.ok(projectCCallCarrierPhaseAtPrefix(
    completedOwnerPrefix,
    routeOutcome.cCall,
  ));
  assert.ok(projectAdmittedCCallOutcomeAtPrefix(
    completedOwnerPrefix,
    routeOutcome.cCall,
    routeOutcome.result,
    routeOutcome.judgment,
  ));
  const admittedCompletionOwners = [2, 1].map((depth, index) => {
    const owner = projectDeclaredCRetryFrontier(
      completedOwnerPrefix,
      graph,
      sourceCursor,
      catalogEntry.definition,
      depth,
    );
    assert.equal(owner?.state, "progress_available",
      `owner-built completed depth ${depth} is available`);
    assert.deepEqual(owner.available.progress, admittedCompletion[index]);
    assert.equal(owner.available.progressEventRef,
      admittedCompletion[index].admissionEventRef);
    return owner;
  });
  assert.equal(
    admittedCompletionOwners[1].available.predecessor.progress.progressRef,
    admittedCompletionOwners[0].available.progress.progressRef,
  );
  const directRouteCandidate = (completedProgresses) => {
    const replayState = replay(ownerStore.store, { runId: sourceCursor.runId });
    const body = {
      routeKind: "terminal",
      declarationRef: graph.materializationRef,
      declarationDigest: graph.materializationDigest,
      sourceCursorRef: sourceCursor.cursorRef,
      sourceCursorDigest: sourceCursor.cursorDigest,
      targetCursorRef: null,
      targetCursorDigest: null,
      cCallRef: routeOutcome.cCall.cCallRef,
      judgmentRef: routeOutcome.judgment.judgmentRef,
      consumedAvailabilityRefs: [
        routeOutcome.judgment.judgmentRef,
        ...completedProgresses.map((row) => row.progressRef),
      ],
      contractRef: routeOutcome.cCall.transitionContractRef,
      replayStateDigest: replayState.replayDigest,
    };
    const candidateDigest = sha256Canonical(body);
    return {
      kind: "traversal_route_candidate",
      schemaVersion: "5.0.0",
      candidateRef:
        `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
      candidateDigest,
      ...body,
    };
  };
  const admitDirectRoute = (completedProgresses, suffix) => routeApi.admitRoute(
    ownerStore.store,
    ownerExecutionBasis,
    graph,
    sourceCursor,
    null,
    replay(ownerStore.store, { runId: sourceCursor.runId }),
    directRouteCandidate(completedProgresses),
    {
      eventTime: progress[2].eventTime,
      correlationId: `test://retry-owner/direct-route/${suffix}`,
      causationEventRefs: [],
    },
    {
      graphFunction: catalogEntry.definition,
      cCall: routeOutcome.cCall,
      result: routeOutcome.result,
      judgment: routeOutcome.judgment,
      completedProgresses,
    },
    { terminalizeRun: false },
  );
  const beforeDirectRoute = ownerStore.store.readAll().length;
  for (const [label, completedProgresses] of [
    ["reordered", admittedCompletion.toReversed()],
    ["duplicate", [admittedCompletion[0], admittedCompletion[0]]],
    ["incomplete", admittedCompletion.slice(1)],
  ]) {
    const refusal = admitDirectRoute(completedProgresses, label);
    assert.equal(refusal.kind, "traversal_route_admission_refusal", label);
    assert.equal(refusal.code, "judgment_mismatch", label);
    assert.equal(ownerStore.store.readAll().length, beforeDirectRoute, label);
  }
  const directRoute = admitDirectRoute(admittedCompletion, "complete");
  assert.equal(directRoute.kind, "admitted_traversal_route",
    JSON.stringify(directRoute));
  const directRouteEvent = ownerStore.store.readAll().at(-1);
  assert.equal(directRouteEvent.eventId, directRoute.admissionEventRef);
  assert.deepEqual(
    directRouteEvent.causationEventRefs,
    admittedCompletion.toReversed().map((row) => row.admissionEventRef),
    "direct ABG route admission derives the complete outer-to-inner cause set",
  );
  const directPrefix = selectValidatedRuntimeEventPrefix(
    ownerStore.store.readAll(),
  );
  const directEventCalculus = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/event_calculus.js",
  )).href);
  const directCalculus = directEventCalculus
    .deriveRuntimeEventCalculusProjection(directPrefix);
  for (const [index, row] of admittedCompletion.entries()) {
    assert.equal(directEventCalculus.holdsAt(
      directCalculus,
      directEventCalculus.constructScopedRetryFluent(
        "retry_progress_available",
        {
          runId: sourceCursor.runId,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          retryBoundaryRef: row.retryBoundaryRef,
          authorityRef: row.progressRef,
        },
      ),
    ), false, `direct route terminates completed depth ${row.completedRetryDepth}`);
    const depth = index === 0 ? 2 : 1;
    const consumedOwner = projectDeclaredCRetryFrontier(
      directPrefix,
      graph,
      sourceCursor,
      catalogEntry.definition,
      depth,
    );
    assert.equal(consumedOwner?.state, "progress_consumed");
    assert.equal(consumedOwner.consumed.progress.progressRef, row.progressRef);
    assert.equal(consumedOwner.consumed.progressEventRef, row.admissionEventRef);
    assert.equal(consumedOwner.consumed.consumption.kind,
      "progress_consumed_by_exit");
    assert.equal(
      consumedOwner.consumed.consumption.route.admissionEventRef,
      directRoute.admissionEventRef,
    );
  }
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
  const closedOwners = completedOwnerCases.map((ownerCase, index) => {
    const owner = projectDeclaredCRetryFrontier(
      closedPrefix,
      graph,
      sourceCursor,
      catalogEntry.definition,
      ownerCase.depth,
    );
    assert.equal(owner?.state, "progress_consumed",
      "terminal route consumption is reconstructed by the declared owner");
    assert.equal(owner.consumed.kind, ownerCase.rowKind);
    assert.deepEqual(
      owner.consumed.progress,
      completedOwners[index].available.progress,
      "lawful later suffix does not reprice the matching historical owner row",
    );
    assert.equal(owner.consumed.progressEventRef, ownerCase.event.eventId);
    assert.equal(owner.consumed.consumption.kind,
      "progress_consumed_by_exit");
    assert.equal(
      owner.consumed.consumption.route.admissionEventRef,
      terminalRoute.eventId,
    );
    assert.notEqual(owner.selectedPrefixDigest,
      completedOwners[index].selectedPrefixDigest,
      "frontier currentness is rebound to the fresh closed prefix");
    return owner;
  });
  assert.equal(
    closedOwners[1].consumed.predecessor.progress.progressRef,
    closedOwners[0].consumed.progress.progressRef,
  );
  assert.equal(
    closedOwners[1].consumed.predecessor.progressEventRef,
    closedOwners[0].consumed.progressEventRef,
  );
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
      eventCalculus.constructScopedRetryFluent("retry_attempt_active", {
        runId: attempt.runId,
        graphCallId: attempt.graphCallId,
        frameId: attempt.frameId,
        retryBoundaryRef: attempt.payload.retryBoundaryRef,
        authorityRef: attempt.payload.attemptRef,
      }),
    ), false);
  }
  for (const row of progress) {
    assert.equal(eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructScopedRetryFluent("retry_progress_available", {
        runId: row.runId,
        graphCallId: row.graphCallId,
        frameId: row.frameId,
        retryBoundaryRef: row.payload.retryBoundaryRef,
        authorityRef: row.payload.progressRef,
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
        catalogApplications: [],
        programRef: PROGRAM_REF,
        catalogHandle: GRAPH_FUNCTION_REF,
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
    const finalCloseIndex = events.findIndex((event) =>
      event.eventId === results.at(-1).eventId);
    assert.ok(finalCloseIndex >= 0, row.label);
    assert.deepEqual(
      events.slice(finalCloseIndex).map((event) => event.kind),
      [
        "c_call_result_admitted",
        "c_call_judged",
        "retry_progress_recorded",
        "retry_progress_recorded",
        "traversal_route_admitted",
        "run_stopped",
      ],
      `${row.label}: close, stopped suffix, route, and run stop are one complete final batch`,
    );

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
      eventCalculus.constructScopedRetryFluent("retry_attempt_active", {
        runId: attempts[2].runId,
        graphCallId: attempts[2].graphCallId,
        frameId: attempts[2].frameId,
        retryBoundaryRef: attempts[2].payload.retryBoundaryRef,
        authorityRef: attempts[2].payload.attemptRef,
      }),
    ), false, row.label);
    for (const stopped of progress.slice(1)) {
      assert.equal(eventCalculus.holdsAt(
        routeCalculus,
        eventCalculus.constructScopedRetryFluent("retry_progress_available", {
          runId: stopped.runId,
          graphCallId: stopped.graphCallId,
          frameId: stopped.frameId,
          retryBoundaryRef: stopped.payload.retryBoundaryRef,
          authorityRef: stopped.payload.progressRef,
        }),
      ), false, row.label);
    }

    if (row.label === "stationary-contract-failure") {
      await context.test(
        "T-287 R1 final blocked suffix reconstructs consumed and closes split late admission",
        async () => {
          const calls = events.filter((event) =>
            event.kind === "c_call_opened");
          const childCall = calls.at(-1);
          const childResult = results.at(-1);
          const childJudgment = judgments.at(-1);
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
            currentNodeRef:
              "node://abiogenesis/conformance/fp-retry-hello@5",
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
          const catalogEntry = run.outcomes[4].result.entries
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

          const immutableFinalPrefixText =
            `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
          const workerEventLogPath = join(
            harness.scratch,
            "retry-r3-final-prefix.events.jsonl",
          );
          const handoffPath = join(
            harness.scratch,
            "retry-r3-final-handoff.json",
          );
          await writeFile(
            workerEventLogPath,
            immutableFinalPrefixText,
            "utf8",
          );
          await writeFile(handoffPath, JSON.stringify({
            packageRoot: harness.installedPackageRoot,
            eventLogPath: workerEventLogPath,
            graphFunction: catalogEntry.definition,
            cCallRef: childCall.aggregateId,
          }), "utf8");
          const workerPath = join(
            root,
            "test_env/falsifiers/t287-r3-reopen-route-worker.mjs",
          );
          const freshWorker = await execFileAsync(
            process.execPath,
            [workerPath, handoffPath],
            { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
          );
          const freshProjection = JSON.parse(freshWorker.stdout);
          assert.notEqual(freshProjection.pid, process.pid,
            "T-287 R3 final-prefix reconstruction executes in PID 2");
          assert.equal(
            freshProjection.reconstructionKind,
            "owner_internal_consumed_retry_frontier",
          );
          assert.equal(freshProjection.ownerInternalProjectionEqual, true);
          assert.deepEqual(freshProjection.consumedAvailabilityRefs, [
            childJudgment.payload.judgmentRef,
            ...progress.slice(1).map((event) => event.payload.progressRef),
          ]);
          assert.deepEqual(
            freshProjection.causationEventRefs,
            progress.slice(1).toReversed().map((event) => event.eventId),
          );
          assert.equal(
            freshProjection.routeAdmissionEventRef,
            blockedRoute.eventId,
          );
          assert.equal(
            freshProjection.runStoppedEventRef,
            events.at(-1).eventId,
          );
          assert.equal(
            await readFile(workerEventLogPath, "utf8"),
            immutableFinalPrefixText,
            "fresh-process reconstruction changes no final-prefix byte",
          );

          const lateStorePath = join(
            harness.scratch,
            "retry-split-late-route-prefix.events.jsonl",
          );
          const lateStore = await reopenPrefix(
            events.slice(0, blockedRouteIndex),
            lateStorePath,
          );
          assert.equal(lateStore.kind, "reopened_event_store_context");
          const latePrefix = selectValidatedRuntimeEventPrefix(
            lateStore.store.readAll(),
          );
          const executionBasis = rehydrateExecutionBasis(
            lateStore.store,
            childCall.basisId,
          );
          assert.ok(executionBasis);
          const eventDerivedCCall = projectOpenedCCallCarrier(
            lateStore.store,
            latePrefix,
            graph,
            childCall.aggregateId,
          );
          assert.ok(eventDerivedCCall);
          const outcome = rehydrateAdmittedCCallState(
            lateStore.store,
            eventDerivedCCall,
            resultValue,
            judgmentValue,
          );
          assert.ok(outcome);
          const stoppedOwnerCases = [
            { depth: 2, event: progress[1] },
            { depth: 1, event: progress[2] },
          ];
          const stoppedOwners = stoppedOwnerCases.map((ownerCase) => {
            const owner = retryApi.projectDeclaredCRetryFrontier(
              latePrefix,
              graph,
              childCursor,
              catalogEntry.definition,
              ownerCase.depth,
            );
            assert.equal(owner?.state, "progress_available");
            assert.equal(
              owner.available.progressEventRef,
              ownerCase.event.eventId,
            );
            return owner;
          });
          const stoppedProgresses = stoppedOwners.map((owner) =>
            owner.available.progress
          );
          const eventDerivedAttempt = retryApi.projectRetryAttempt(
            latePrefix,
            graph,
            attempts[2].eventId,
          );
          assert.ok(eventDerivedAttempt);
          assert.deepEqual(freshProjection.ownerInternalProjection, {
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
          }, "fresh final-prefix projection equals the source-process owner");
          const lateReplay = replayApi.replay(lateStore.store, {
            runId: childCall.runId,
          });
          const proposal = hogRouteApi.proposeBlockedRoute(
            graph,
            {
              cursor: childCursor,
              programLocusRef: childCall.payload.programLocusRef,
            },
            eventDerivedCCall,
            outcome.judgment.judgmentRef,
            lateReplay,
            eventDerivedCCall.transitionContractRef,
            stoppedProgresses.map((stopped) => stopped.progressRef),
          );
          assert.equal(proposal.kind, "traversal_route_candidate",
            JSON.stringify(proposal));
          const beforeLateEvents = lateStore.store.readAll();
          const beforeLateDigest = lateStore.store.digest();
          const beforeLateBytes = await readFile(lateStorePath, "utf8");
          assert.throws(
            () => routeApi.admitRoute(
              lateStore.store,
              executionBasis,
              graph,
              childCursor,
              null,
              lateReplay,
              proposal,
              {
                eventTime: blockedRoute.eventTime,
                correlationId: "test://retry-split-late/blocked-route",
                causationEventRefs: [],
              },
              {
                graphFunction: catalogEntry.definition,
                cCall: eventDerivedCCall,
                resultRef: outcome.result.resultRef,
                judgmentRef: outcome.judgment.judgmentRef,
                judgmentEventRef: outcome.judgment.admissionEventRef,
                reasonRef: outcome.judgment.reasonRef,
                stoppedProgresses: structuredClone(stoppedProgresses),
              },
              { terminalizeRun: false },
            ),
            /planned event admission requires one active outer transaction/u,
            "a valid stopped suffix cannot enter the split late route path",
          );
          assert.deepEqual(lateStore.store.readAll(), beforeLateEvents,
            "the closed split path appends no in-memory event");
          assert.equal(lateStore.store.digest(), beforeLateDigest,
            "the closed split path preserves the event-store digest");
          assert.equal(await readFile(lateStorePath, "utf8"), beforeLateBytes,
            "the closed split path appends no durable byte");
          lateStore.store.closeDurableLog();
        },
      );
    }

    const closedPrefix = selectValidatedRuntimeEventPrefix(deepFreeze(events));
    const closedCalculus = eventCalculus.deriveRuntimeEventCalculusProjection(
      closedPrefix,
    );
    assert.equal(attempts.every((attempt) => !eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructScopedRetryFluent("retry_attempt_active", {
        runId: attempt.runId,
        graphCallId: attempt.graphCallId,
        frameId: attempt.frameId,
        retryBoundaryRef: attempt.payload.retryBoundaryRef,
        authorityRef: attempt.payload.attemptRef,
      }),
    )), true, row.label);
    assert.equal(progress.every((entry) => !eventCalculus.holdsAt(
      closedCalculus,
      eventCalculus.constructScopedRetryFluent("retry_progress_available", {
        runId: entry.runId,
        graphCallId: entry.graphCallId,
        frameId: entry.frameId,
        retryBoundaryRef: entry.payload.retryBoundaryRef,
        authorityRef: entry.payload.progressRef,
      }),
    )), true, row.label);
  }
});
