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

async function reopenPrefix(installedPackageRoot, events, path) {
  const { canonicalJson } = await import(pathToFileURL(join(
    installedPackageRoot,
    "build/code/src/shared/canonical_json.js",
  )).href);
  const bytes = `${events.map((event) => canonicalJson(event)).join("\n")}\n`;
  await writeFile(path, bytes, "utf8");
  const identity = await stat(path);
  const [{ reopenEventStore, ROOT_EVENT_CONTRACT_DIGEST }, { sha256Canonical }] =
    await Promise.all([
      import(pathToFileURL(join(
        installedPackageRoot,
        "build/code/src/abg/event_store.js",
      )).href),
      import(pathToFileURL(join(
        installedPackageRoot,
        "build/code/src/shared/digests.js",
      )).href),
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

test("M5 installed C.retry re-enters one failed F_P edge with fresh ABG attempt truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, root, {
    candidateBasisSource: "packed_artifact",
  });
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
    harness.installedPackageRoot,
    durablePrefix,
    join(harness.scratch, "retry-completed-prefix.events.jsonl"),
  );
  assert.equal(reopened.kind, "reopened_event_store_context");
  const {
    projectDeclaredCRetryFrontier,
    projectExecutableRetryInput,
    projectRetryAttempt,
  } = await import(pathToFileURL(join(
    harness.installedPackageRoot,
    "build/code/src/abg/retry.js",
  )).href);
  const { selectValidatedRuntimeEventPrefix } = await import(pathToFileURL(join(
    harness.installedPackageRoot,
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

  const ownerStorePath = join(
    harness.scratch,
    "retry-owner-prefix.events.jsonl",
  );
  const ownerStore = await reopenPrefix(
    harness.installedPackageRoot,
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
    projectOpenedCCallCarrier,
    rehydrateAdmittedCCallState,
  } = await import(pathToFileURL(join(
    harness.installedPackageRoot,
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
    harness.installedPackageRoot,
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
  ownerStore.store.closeDurableLog();
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
    harness.installedPackageRoot,
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
    harness.installedPackageRoot,
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
  const closedReopen = await reopenPrefix(
    harness.installedPackageRoot,
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
    harness.installedPackageRoot,
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

test("M5 installed C.retry closes one canonical stationary stopped failure without a third dispatch", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const command = await installRetryWorker(harness);
  const { selectValidatedRuntimeEventPrefix } = await import(pathToFileURL(join(
    harness.installedPackageRoot,
    "build/code/src/abg/event_prefix.js",
  )).href);
  const eventCalculus = await import(pathToFileURL(join(
    harness.installedPackageRoot,
    "build/code/src/abg/event_calculus.js",
  )).href);
  const { deepFreeze } = await import(pathToFileURL(join(
    harness.installedPackageRoot,
    "build/code/src/shared/immutable.js",
  )).href);
  const row = {
    mode: "always_malformed",
    label: "stationary-contract-failure",
    failureClass: "contract_failure",
    sameSignal: true,
    diagnosticRef: null,
  };
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

      await context.test(
        "T-287 R1 final blocked suffix reconstructs consumed owner truth in PID 2",
        async () => {
          const calls = events.filter((event) =>
            event.kind === "c_call_opened");
          const childCall = calls.at(-1);
          const childJudgment = judgments.at(-1);
          const catalogEntry = run.outcomes[4].result.entries
            .find((entry) => entry.handle === GRAPH_FUNCTION_REF);

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

        },
      );
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
});
