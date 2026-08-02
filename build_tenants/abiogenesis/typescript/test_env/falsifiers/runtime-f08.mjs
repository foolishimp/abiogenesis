import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { prepareDeveloperMiniProduct } from "../support/developer-mini-product.mjs";
import {
  buildRootCliScenario,
  importInstalledPackageExport,
} from "../support/root-cli-environment.mjs";
import {
  publicOperationBasis,
  rawProgramInput,
  requireRawAdmission,
} from "../support/root-installed-environment.mjs";

const HELLO_PROGRAM_REF =
  "program://abiogenesis/conformance/hello-world@5";
const HELLO_GRAPH_REF =
  "graph-function://abiogenesis/conformance/hello-world@5";
const RECURSION_PROGRAM_REF =
  "program://abiogenesis/conformance/bounded-recursion@5";
const RECURSION_GRAPH_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion@5";
const RECURSION_CHILD_GRAPH_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion-step@5";

const F08_ROWS = Object.freeze([
  "initial_cursor",
  "continuation_reconstruction",
  "fh_response",
  "fh_resume",
  "normal_closure",
  "interaction_closure",
  "child_closure",
  "refusal_causation",
]);

function runtimeBasis(label, causationEventRefs = []) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: `correlation://s06/ax-f08/${label}`,
    causationEventRefs,
  };
}

function passedControl(controlId, observed) {
  return { controlId, observed, passed: true };
}

function caseRecord(caseId, expected, observed, passed) {
  return { caseId, expected, observed, passed };
}

function publicInvocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://s06/ax-f08/mini",
    payload,
  };
}

function eventCandidate(event) {
  const candidate = structuredClone(event);
  delete candidate.eventId;
  delete candidate.admissionOrdinal;
  delete candidate.payloadDigest;
  return candidate;
}

function cloneStore(modules, events) {
  const store = new modules.abg.AbgEventStore();
  for (const expected of events) {
    const admitted = modules.eventStore.admitRuntimeEvent(
      store,
      eventCandidate(expected),
    );
    assert.deepEqual(
      admitted,
      expected,
      `cloned event ${expected.admissionOrdinal} must preserve exact identity`,
    );
  }
  return store;
}

function prefixThrough(events, event) {
  assert.ok(event);
  return events.slice(0, event.admissionOrdinal);
}

function prefixBefore(events, event) {
  assert.ok(event);
  return events.slice(0, event.admissionOrdinal - 1);
}

function eventById(store, eventId) {
  const event = store.readAll().find((candidate) => candidate.eventId === eventId);
  assert.ok(event, `missing event ${eventId}`);
  return event;
}

function oneEvent(store, predicate, label) {
  const rows = store.readAll().filter(predicate);
  assert.equal(rows.length, 1, `${label}: expected one event, observed ${rows.length}`);
  return rows[0];
}

function scopeForRun(modules, store, runId) {
  const run = oneEvent(
    store,
    (event) => event.kind === "run_segment_opened" && event.runId === runId,
    `${runId} open`,
  );
  const graphCall = oneEvent(
    store,
    (event) =>
      event.kind === "graph_call_opened" &&
      event.runId === runId &&
      event.parentAggregateId === runId &&
      event.payload.parentFrameId === undefined,
    `${runId} root GraphCall`,
  );
  const frame = oneEvent(
    store,
    (event) =>
      event.kind === "frame_opened" &&
      event.runId === runId &&
      event.graphCallId === graphCall.graphCallId &&
      event.payload.parentFrameId === null,
    `${runId} root frame`,
  );
  const body = {
    executionBasisRef: run.payload.executionBasisRef,
    executionBasisDigest: run.payload.executionBasisDigest,
    invocationAdmissionRef: run.payload.invocationAdmissionRef,
    invocationRef: run.payload.invocationRef,
    programRef: run.payload.programRef,
    graphFunctionRef: run.payload.graphFunctionRef,
    graphRef: run.payload.graphRef,
    runId,
    runDigest: run.payload.runDigest,
    runOpenEventRef: run.eventId,
    graphCallId: graphCall.graphCallId,
    graphCallDigest: graphCall.payload.graphCallDigest,
    graphCallOpenEventRef: graphCall.eventId,
    frameId: frame.frameId,
    frameDigest: frame.payload.frameDigest,
    frameLineageId: frame.frameLineageId,
    frameOpenEventRef: frame.eventId,
  };
  const scopeDigest = modules.product.sha256Canonical(body);
  const scope = modules.abg.rehydrateOpenedTraversalScope(store, {
    scopeRef:
      `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
    scopeDigest,
    ...body,
  });
  assert.ok(scope, `${runId}: root scope must rehydrate`);
  const executionBasis = modules.abg.rehydrateExecutionBasis(
    store,
    run.payload.executionBasisRef,
  );
  assert.ok(executionBasis, `${runId}: root ExecutionBasis must rehydrate`);
  return { executionBasis, frame, graphCall, run, scope };
}

function scopeForGraphCall(modules, store, graphCallId) {
  const graphCall = oneEvent(
    store,
    (event) =>
      event.kind === "graph_call_opened" && event.graphCallId === graphCallId,
    `${graphCallId} GraphCall`,
  );
  const run = oneEvent(
    store,
    (event) =>
      event.kind === "run_segment_opened" && event.runId === graphCall.runId,
    `${graphCall.runId} open`,
  );
  const frame = oneEvent(
    store,
    (event) =>
      event.kind === "frame_opened" && event.graphCallId === graphCallId,
    `${graphCallId} frame`,
  );
  const executionBasis = modules.abg.rehydrateExecutionBasis(
    store,
    graphCall.payload.executionBasisRef,
  );
  assert.ok(executionBasis, `${graphCallId}: ExecutionBasis must rehydrate`);
  const body = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    runId: graphCall.runId,
    runDigest: run.payload.runDigest,
    runOpenEventRef: run.eventId,
    graphCallId,
    graphCallDigest: graphCall.payload.graphCallDigest,
    graphCallOpenEventRef: graphCall.eventId,
    frameId: frame.frameId,
    frameDigest: frame.payload.frameDigest,
    frameLineageId: frame.frameLineageId,
    frameOpenEventRef: frame.eventId,
  };
  const scopeDigest = modules.product.sha256Canonical(body);
  const scope = modules.abg.rehydrateOpenedTraversalScope(store, {
    scopeRef:
      `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
    scopeDigest,
    ...body,
  });
  assert.ok(scope, `${graphCallId}: child scope must rehydrate`);
  return { executionBasis, frame, graphCall, run, scope };
}

function appendDisjointEvent(modules, store, runId, label) {
  const before = store.readAll().length;
  const { executionBasis, scope } = scopeForRun(modules, store, runId);
  const admitted = modules.abg.admitRuntimeFailure(
    store,
    executionBasis,
    scope,
    "operation_application",
    {
      kind: "ax_f08_disjoint_interleave",
      schemaVersion: "5.0.0",
      fixture: label,
    },
    `diagnostic://abiogenesis/s06/ax-f08/${label}@5`,
    runtimeBasis(`${label}/disjoint-s`, [scope.frameOpenEventRef]),
  );
  assert.equal(admitted.kind, "runtime_failure_admission");
  assert.equal(admitted.runId, runId);
  assert.equal(store.readAll().length, before + 1);
  const event = eventById(store, admitted.admissionEventRef);
  assert.equal(event.runId, runId);
  return { admitted, event };
}

function assertEqualRReplay(modules, control, interleaved, runId, label) {
  const controlReplay = modules.abg.replay(control, { runId });
  const interleavedReplay = modules.abg.replay(interleaved, { runId });
  assert.deepEqual(
    interleavedReplay,
    controlReplay,
    `${label}: the S event must not alter replay(R)`,
  );
  return controlReplay;
}

function newPair(modules, events, runR, runS, label) {
  const control = cloneStore(modules, events);
  const interleaved = cloneStore(modules, events);
  assert.deepEqual(interleaved.readAll(), control.readAll());
  const replayBefore = assertEqualRReplay(
    modules,
    control,
    interleaved,
    runR,
    `${label}/before`,
  );
  const s = appendDisjointEvent(modules, interleaved, runS, label);
  assert.equal(interleaved.readAll().at(-1).eventId, s.event.eventId);
  const replayAfter = assertEqualRReplay(
    modules,
    control,
    interleaved,
    runR,
    `${label}/after`,
  );
  assert.deepEqual(replayAfter, replayBefore);
  return { control, interleaved, replay: replayAfter, s };
}

function runEventsSince(store, runId, count) {
  return store.readAll().slice(count).filter((event) => event.runId === runId);
}

function assertNoSReferences(value, sEventRef, label) {
  const bytes = JSON.stringify(value);
  assert.equal(
    bytes.includes(sEventRef),
    false,
    `${label}: returned or emitted R truth must not cite S`,
  );
}

function pairedInputProof(modules, coordinates) {
  const control = structuredClone(coordinates);
  const interleaved = structuredClone(coordinates);
  assert.deepEqual(interleaved, control);
  const controlDigest = modules.product.sha256Canonical(control);
  const interleavedDigest = modules.product.sha256Canonical(interleaved);
  assert.equal(interleavedDigest, controlDigest);
  return { controlDigest, interleavedDigest, coordinates: control };
}

function disjointEventEvidence(pair) {
  return {
    sEventRef: pair.s.event.eventId,
    sEventKind: pair.s.event.kind,
    sRunId: pair.s.event.runId,
    sCausationEventRefs: [...pair.s.event.causationEventRefs],
  };
}

function graphBasis(modules, store, publication, executionBasis) {
  const program = publication.programs.find(
    (candidate) => candidate.programRef === executionBasis.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === executionBasis.graphFunctionRef,
  );
  assert.ok(program, `${executionBasis.programRef}: Program absent`);
  assert.ok(graphFunction, `${executionBasis.graphFunctionRef}: GraphFunction absent`);
  const graph = modules.gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    admittedInputRef: executionBasis.rawInputAdmissionRef,
    admittedInputDigest: executionBasis.rawInputDigest,
  });
  assert.equal(graph.materializationRef, executionBasis.graphRef);
  assert.equal(graph.materializationDigest, executionBasis.graphDigest);
  const publicationAdmission = requireRawAdmission(
    modules.validator,
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const programValidation = modules.validator.validateProgram(
    rawProgramInput(modules.validator, publicationAdmission, program),
  );
  assert.equal(programValidation.kind, "program_validation");
  assert.equal(programValidation.validationRef, executionBasis.programValidationRef);
  const graphValidation = modules.validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: executionBasis.invocationAdmissionRef,
      admittedInputRef: executionBasis.rawInputAdmissionRef,
      admittedInputDigest: executionBasis.rawInputDigest,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation");
  assert.equal(graphValidation.validationRef, executionBasis.graphValidationRef);
  return { graph, graphFunction, graphValidation, program, programValidation };
}

function cursorForSingleNodeGraph(modules, executionBasis, scope, graph, cursorEvent) {
  const body = {
    programRef: executionBasis.programRef,
    executionBasisRef: executionBasis.basisRef,
    traversalScopeRef: scope.scopeRef,
    runId: scope.runId,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    graphRef: graph.materializationRef,
    inputRef: executionBasis.rawInputAdmissionRef,
    inputDigest: executionBasis.rawInputDigest,
    currentNodeRef: graph.template.startNodeRef,
    position: "at_term",
    termPath: [...cursorEvent.payload.termPath],
    taskOrdinal: cursorEvent.payload.taskOrdinal,
    attempt: cursorEvent.payload.attempt,
    retryPath: [...cursorEvent.payload.retryPath],
  };
  const cursorDigest = modules.product.sha256Canonical(body);
  const cursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
  assert.equal(cursor.cursorRef, cursorEvent.payload.cursorRef);
  assert.equal(cursor.cursorDigest, cursorEvent.payload.cursorDigest);
  return cursor;
}

function rehydrateLeafState(
  modules,
  store,
  executionBasis,
  scope,
  graph,
  routeEvent,
) {
  const cCallRef = routeEvent.payload.cCallRef;
  const opened = oneEvent(
    store,
    (event) => event.kind === "c_call_opened" && event.aggregateId === cCallRef,
    `${cCallRef} opened`,
  );
  const fibre = oneEvent(
    store,
    (event) =>
      event.kind === "c_call_fibre_selected" && event.aggregateId === cCallRef,
    `${cCallRef} fibre`,
  );
  const resultEvent = oneEvent(
    store,
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === cCallRef,
    `${cCallRef} result`,
  );
  const judgmentEvent = oneEvent(
    store,
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === cCallRef &&
      event.payload.judgmentRef === routeEvent.payload.judgmentRef,
    `${cCallRef} judgment`,
  );
  const implementationSet = modules.abg.rehydrateAdmittedImplementationSet(
    store,
    executionBasis.implementationSetRef,
  );
  assert.ok(implementationSet, `${cCallRef}: implementation set must rehydrate`);
  const resolution = modules.abg.selectAdmittedImplementationResolution(
    implementationSet,
    {
      graphFunctionRef: executionBasis.graphFunctionRef,
      nodeRef: graph.template.startNodeRef,
      programLocusRef: opened.payload.programLocusRef,
      implementationBindingRef: fibre.payload.implementationBindingRef,
    },
  );
  assert.ok(resolution, `${cCallRef}: implementation row must resolve`);
  const cCall = {
    kind: "c_call",
    schemaVersion: "5.0.0",
    cCallRef: opened.payload.cCallRef,
    cCallDigest: opened.payload.cCallDigest,
    callClass: "leaf",
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: opened.payload.edgeRef,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: opened.payload.stageRole,
    batchRef: opened.payload.batchRef,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
    regime: fibre.payload.regime,
    armId: fibre.payload.armId,
    compositionRef: fibre.payload.compositionRef,
    implementationSetRef: fibre.payload.implementationSetRef,
    implementationRequirementKey: fibre.payload.implementationRequirementKey,
    implementationBindingRef: fibre.payload.implementationBindingRef,
    implementationRef: fibre.payload.implementationRef,
    interactionSetRef: executionBasis.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: null,
    inputContractRef: resolution.inputContractRef,
    outputContractRef: resolution.outputContractRef,
    failureContractRef: resolution.failureContractRef,
    refusalContractRef: resolution.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: executionBasis.evidenceContractRef,
    judgmentContractRef: executionBasis.judgmentContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: graph.template.nodes[0].term.judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  };
  const result = {
    kind: "admitted_c_call_result",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...resultEvent.payload,
    admissionEventRef: resultEvent.eventId,
  };
  const judgment = {
    kind: "admitted_c_call_judgment",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    ...judgmentEvent.payload,
    admissionEventRef: judgmentEvent.eventId,
  };
  const state = modules.abg.rehydrateAdmittedCCallState(
    store,
    cCall,
    result,
    judgment,
  );
  assert.ok(state, `${cCallRef}: admitted CCall state must rehydrate`);
  return state;
}

function routeCandidateFromEvent(routeEvent) {
  const { routeRef: _routeRef, routeDigest, ...body } = routeEvent.payload;
  return {
    kind: "traversal_route_candidate",
    schemaVersion: "5.0.0",
    candidateRef:
      `route-candidate://abiogenesis/${routeDigest.slice("sha256:".length)}`,
    candidateDigest: routeDigest,
    ...body,
  };
}

function prepareAdmittedLeafRoute(
  modules,
  sourceEvents,
  publication,
  runId,
  routeEvent,
) {
  const store = cloneStore(modules, prefixBefore(sourceEvents, routeEvent));
  const graphCallId = routeEvent.graphCallId;
  const scopeBasis = routeEvent.graphFunctionRef === RECURSION_CHILD_GRAPH_REF
    ? scopeForGraphCall(modules, store, graphCallId)
    : scopeForRun(modules, store, runId);
  const { executionBasis, scope } = scopeBasis;
  const { graph } = graphBasis(modules, store, publication, executionBasis);
  const cursorEvent = oneEvent(
    store,
    (event) =>
      event.kind === "traversal_cursor_entered" &&
      event.runId === runId &&
      event.graphCallId === scope.graphCallId &&
      event.frameId === scope.frameId,
    `${scope.frameId} cursor`,
  );
  const cursor = cursorForSingleNodeGraph(
    modules,
    executionBasis,
    scope,
    graph,
    cursorEvent,
  );
  const state = rehydrateLeafState(
    modules,
    store,
    executionBasis,
    scope,
    graph,
    routeEvent,
  );
  const beforeRoute = modules.abg.replay(store, { runId });
  const route = modules.abg.admitRoute(
    store,
    executionBasis,
    graph,
    cursor,
    null,
    beforeRoute,
    routeCandidateFromEvent(routeEvent),
    {
      eventTime: routeEvent.eventTime,
      correlationId: routeEvent.correlationId,
      causationEventRefs: routeEvent.causationEventRefs.filter(
        (ref) => ref !== state.judgment.admissionEventRef,
      ),
    },
    state,
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
  assert.deepEqual(eventById(store, route.admissionEventRef), routeEvent);
  return {
    closureContract: publication.closureContracts.find(
      (candidate) =>
        candidate.closureContractRef === executionBasis.closureContractRef,
    ),
    events: store.readAll(),
    executionBasis,
    graph,
    route,
    scope,
    ...state,
  };
}

async function installedModules(harness) {
  const nonce = `ax-f08=${Date.now()}`;
  const [abg, gtl, hog, product, publicApi, validator] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/gtl",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/hog",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/validator",
      nonce,
    ),
  ]);
  const eventStore = await import(
    pathToFileURL(
      join(harness.installedPackageRoot, "build/code/src/abg/event_store.js"),
    ).href
  );
  return { abg, eventStore, gtl, hog, product, publicApi, validator };
}

async function applyTranscript(publicApi, rows) {
  const context = publicApi.createRootOperationContext();
  const outcomes = [];
  try {
    for (const row of rows) {
      outcomes.push(await publicApi.applyRootPublicInvocation(context, row));
    }
    return {
      events: structuredClone(context.store.readAll()),
      outcomes,
    };
  } finally {
    publicApi.closeRootOperationContext(context);
  }
}

function recursionInput(remaining) {
  return {
    kind: "bounded_recursion_state",
    schemaVersion: "5.0.0",
    blockedChildRemaining: null,
    remaining,
    terminal: remaining === 0,
    trace: [],
  };
}

async function rootRunSource(harness, modules, packageRoot, label, target) {
  const miniScenario = await prepareMiniInteractionScenario(
    harness,
    packageRoot,
    label,
  );
  const scenario = await buildRootCliScenario(
    harness,
    label,
    (payload) => payload,
    {
      programRef: target.programRef,
      graphFunctionRef: target.graphFunctionRef,
      allowlist: [
        HELLO_GRAPH_REF,
        RECURSION_GRAPH_REF,
        RECURSION_CHILD_GRAPH_REF,
      ],
      input: target.input,
    },
  );
  const setup = structuredClone(scenario.transcript.slice(0, -1));
  const targetRun = structuredClone(scenario.transcript.at(-1));
  targetRun.invocationRef = `invocation://s06/ax-f08/${label}/run-r`;
  const binding = setup.find(
    (row) => row.operationId === "abg.operation.workspace.bind",
  );
  assert.ok(binding);
  binding.payload.canonicalRoot = harness.scratch;
  binding.payload.roots.eventLogRoot = miniScenario.eventLogRoot;
  targetRun.payload.eventLogPath = miniScenario.eventLogPath;
  const rows = [
    ...miniScenario.setup,
    miniScenario.run("s"),
    ...setup,
    targetRun,
  ];
  const applied = await applyTranscript(
    modules.publicApi,
    rows,
  );
  const s = applied.outcomes.at(miniScenario.setup.length);
  const r = applied.outcomes.at(-1);
  assert.equal(
    applied.outcomes.every(
      (outcome, index) =>
        index === miniScenario.setup.length
          ? outcome.disposition === "held"
          : outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(applied.outcomes),
  );
  assert.notEqual(s.runId, r.runId);
  const activePrefix = cloneStore(modules, applied.events);
  assert.equal(
    modules.abg.holdsAt(
      modules.abg.deriveRuntimeEventCalculusProjection(
        modules.abg.selectValidatedRuntimeEventPrefix(
          activePrefix.readAll(),
          { runId: s.runId },
        ),
      ),
      modules.abg.constructRunActiveFluent(s.runId),
    ),
    true,
  );
  return {
    events: applied.events,
    publication: harness.rootPublication,
    runR: r.runId,
    runS: s.runId,
  };
}

function terminalInteractionPublication(mini) {
  const publication = structuredClone(mini.publication);
  const graph = publication.graphFunctions.find(
    (candidate) => candidate.name === mini.ids.mixedGraphFunctionRef,
  );
  const closure = publication.closureContracts.find(
    (candidate) =>
      candidate.closureContractRef === mini.ids.mixedClosureContractRef,
  );
  assert.ok(graph);
  assert.ok(closure);
  const composition = graph.template.nodes[0].term;
  const deterministic = structuredClone(composition.terms[0]);
  const interaction = structuredClone(composition.terms[2]);
  interaction.vectorIndex = 1;
  interaction.resultBearing = true;
  composition.terms = [deterministic, interaction];
  composition.outputCarrierRef = interaction.outputCarrierRef;
  graph.outputs = [interaction.outputCarrierRef];
  graph.environment.provides = [interaction.outputCarrierRef];
  graph.declarations["abg.judgment_contract"] =
    mini.ids.continuationContractRef;
  graph.declarations["abg.evidence_contract"] =
    interaction.requirement.requestContractRef;
  closure.evidenceContractRef = interaction.requirement.requestContractRef;
  closure.resultContractRef = interaction.outputCarrierRef;
  closure.judgmentContractRef = mini.ids.continuationContractRef;
  return publication;
}

async function prepareMiniInteractionScenario(
  harness,
  packageRoot,
  sourceLabel,
) {
  const sourceScratch = join(harness.scratch, `ax-f08-${sourceLabel}`);
  await mkdir(sourceScratch, { recursive: true });
  const mini = await prepareDeveloperMiniProduct(packageRoot, sourceScratch);
  const publication = terminalInteractionPublication(mini);
  const installedMini = await mini.materializePublicationVariant(
    `s06-ax-f08-terminal-interaction-${sourceLabel}`,
    publication,
  );
  const label = `s06-ax-f08-terminal-interaction-${sourceLabel}`;
  const root = join(sourceScratch, label);
  const abiConsumer = join(root, "abiogenesis-product");
  const miniConsumer = join(root, "developer-product");
  const workspaceRoot = join(root, "workspace");
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(eventLogRoot, "terminal-interaction.events.jsonl");
  await mkdir(root, { recursive: true });
  const refs = {
    verifyAbi: `invocation://s06/ax-f08/mini/verify-abiogenesis`,
    verifyMini: `invocation://s06/ax-f08/mini/verify-product`,
    resolve: `invocation://s06/ax-f08/mini/resolve`,
    installAbi: `invocation://s06/ax-f08/mini/install-abiogenesis`,
    installMini: `invocation://s06/ax-f08/mini/install-product`,
    bind: `invocation://s06/ax-f08/mini/bind`,
    catalog: `invocation://s06/ax-f08/mini/catalog`,
    view: `invocation://s06/ax-f08/mini/view`,
  };
  const setup = [
    publicInvocation("abg.operation.product.verify", "artifact", refs.verifyAbi, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    publicInvocation("abg.operation.product.verify", "artifact", refs.verifyMini, {
      artifactPath: installedMini.artifactPath,
      artifactRef: installedMini.artifactRef,
      ...expectedVerificationIdentity(installedMini.basis),
    }),
    publicInvocation(
      "abg.operation.product.resolve",
      "verified_product_set",
      refs.resolve,
      { verifiedInvocationRefs: [refs.verifyAbi, refs.verifyMini] },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installAbi,
      {
        verifiedInvocationRef: refs.verifyAbi,
        resolvedLockInvocationRef: refs.resolve,
        artifactPath: harness.artifactPath,
        targetRoot: abiConsumer,
      },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installMini,
      {
        verifiedInvocationRef: refs.verifyMini,
        resolvedLockInvocationRef: refs.resolve,
        artifactPath: installedMini.artifactPath,
        targetRoot: miniConsumer,
      },
    ),
    publicInvocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRefs: [refs.installAbi, refs.installMini],
      workspaceId: "workspace://s06/ax-f08/mini",
      canonicalRoot: workspaceRoot,
      authorizedActorRef: "actor://developer.example/trusted-developer",
      authorityManifestRef: "manifest://s06/ax-f08/mini",
      roots: {
        toolchainRoot: join(
          abiConsumer,
          "node_modules/@abiogenesis/typescript-tenant",
        ),
        productRoot: join(
          miniConsumer,
          "node_modules/@abiogenesis-fixtures/developer-mini-product",
        ),
        eventLogRoot,
        runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
        projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
        archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
      },
    }),
    publicInvocation("abg.operation.catalog.admit", "module_publication", refs.catalog, {
      publication: installedMini.publication,
      verifiedInvocationRef: refs.verifyMini,
      workspaceBindingInvocationRef: refs.bind,
    }),
    publicInvocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: [mini.ids.mixedGraphFunctionRef],
    }),
  ];
  const run = (runLabel) => publicInvocation(
    "abg.operation.run.invoke",
    "direct",
    `invocation://s06/ax-f08/mini/run-${runLabel}`,
    {
      installInvocationRef: refs.installMini,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
      programRef: mini.ids.mixedProgramRef,
      graphFunctionRef: mini.ids.mixedGraphFunctionRef,
      actorRef: "actor://developer.example/trusted-developer",
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: runLabel === "s" ? "S" : "R",
      },
      eventLogPath,
    },
  );
  return {
    eventLogPath,
    eventLogRoot,
    installedMini,
    mini,
    run,
    setup,
  };
}

async function miniInteractionSource(harness, modules, packageRoot) {
  const scenario = await prepareMiniInteractionScenario(
    harness,
    packageRoot,
    "interaction",
  );
  const applied = await applyTranscript(
    modules.publicApi,
    [...scenario.setup, scenario.run("s"), scenario.run("r")],
  );
  assert.equal(
    applied.outcomes.slice(0, -2).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(applied.outcomes),
  );
  const s = applied.outcomes.at(-2);
  const r = applied.outcomes.at(-1);
  assert.equal(s.disposition, "held", JSON.stringify(s));
  assert.equal(r.disposition, "held", JSON.stringify(r));
  assert.notEqual(s.runId, r.runId);
  return {
    events: applied.events,
    mini: scenario.mini,
    publication: scenario.installedMini.publication,
    rAuthority: r.result.continuationAuthority,
    rContinuationRef: r.continuationRef,
    runR: r.runId,
    runS: s.runId,
    sContinuationRef: s.continuationRef,
  };
}

function operationBasis(modules, authority, operationId, invocationRef) {
  return publicOperationBasis(
    modules.product,
    operationId,
    authority.workspaceBinding.bindingId,
    authority.workspaceBinding.bindingDigest,
    invocationRef,
  );
}

async function validInteractionResponse(
  modules,
  store,
  source,
  operation,
  continuation,
) {
  const semanticBasis = modules.abg.projectFhInteractionSemanticBasis(
    store,
    continuation,
  );
  assert.ok(semanticBasis, "R interaction semantic basis must project");
  const semantics = await modules.product.loadInstalledProductSemantics({
    install: source.rAuthority.install,
    publication: source.rAuthority.catalog.modulePublication,
    verifyInstallAdmission: (install) =>
      modules.abg.hasAdmittedProductInstall(store, install),
  });
  const response = modules.product.evaluateInstalledInteractionResponse(
    semantics,
    {
      ...semanticBasis,
      actingActorRef: operation.actorRef,
    },
    {
      kind: "developer_greeting_output",
      schemaVersion: "5.0.0",
      message: "Hello R",
    },
  );
  assert.ok(response, "installed Product must admit the R response");
  return response;
}

async function prepareResponseOperation(modules, source, label) {
  const store = cloneStore(modules, source.events);
  const rootInvocation = modules.abg.rehydrateInvocationAdmission(
    store,
    source.rAuthority.invocationAdmissionRef,
  );
  assert.ok(rootInvocation, "R root invocation must rehydrate");
  const continuation = modules.abg.replay(store, {
    runId: source.runR,
  }).continuations.find(
    (candidate) => candidate.continuationRef === source.rContinuationRef,
  );
  assert.equal(continuation?.status, "open");
  const operation = modules.abg.admitContinuationPublicOperation(
    store,
    rootInvocation,
    "abg.operation.interaction.respond",
    continuation,
    "approve",
    rootInvocation.actorRef,
    continuation.actorCapabilityRef,
    operationBasis(
      modules,
      source.rAuthority,
      "abg.operation.interaction.respond",
      `invocation://s06/ax-f08/${label}/respond`,
    ),
  );
  const response = await validInteractionResponse(
    modules,
    store,
    source,
    operation,
    continuation,
  );
  return { continuation, operation, response, rootInvocation, store };
}

async function prepareRespondedPrefix(modules, source, label) {
  const prepared = await prepareResponseOperation(modules, source, label);
  const admitted = modules.abg.admitFhInteractionResponse(
    prepared.store,
    prepared.continuation,
    prepared.operation,
    prepared.continuation.responseContractRef,
    prepared.response,
    runtimeBasis(`${label}/response`),
  );
  assert.equal(admitted.kind, "fh_interaction_response_admission");
  const respondedContinuation = modules.abg.replay(prepared.store, {
    runId: source.runR,
  }).continuations.find(
    (candidate) => candidate.continuationRef === source.rContinuationRef,
  );
  assert.equal(respondedContinuation?.status, "responded");
  return { ...prepared, respondedContinuation, responseAdmission: admitted };
}

async function prepareContinueOperation(modules, source, label) {
  const prepared = await prepareRespondedPrefix(modules, source, label);
  const operation = modules.abg.admitContinuationPublicOperation(
    prepared.store,
    prepared.rootInvocation,
    "abg.operation.run.continue",
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    operationBasis(
      modules,
      source.rAuthority,
      "abg.operation.run.continue",
      `invocation://s06/ax-f08/${label}/continue`,
    ),
  );
  return { ...prepared, continueOperation: operation };
}

function expectedContinuationBasis(source) {
  return {
    install: source.rAuthority.install,
    workspaceBinding: source.rAuthority.workspaceBinding,
    catalogView: source.rAuthority.catalogView,
    program: source.rAuthority.program,
    graph: source.rAuthority.heldGraph,
    closureContract: source.rAuthority.heldClosureContract,
  };
}

function prepareResumeInputs(modules, source, prepared) {
  const rehydrated = modules.abg.rehydrateFhContinuation(
    prepared.store,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    prepared.continueOperation,
  );
  assert.ok(rehydrated, "R continuation must rehydrate before S interleaving");
  const heldCursor = modules.hog.rehydrateHeldInteractionCursor(
    prepared.store,
    rehydrated.heldInteraction.cursor,
  );
  assert.ok(heldCursor, "R held cursor must rehydrate");
  const successorInput = modules.abg.deriveFhResumeSuccessorInput(
    prepared.store,
    prepared.respondedContinuation,
    prepared.continueOperation,
    rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
  );
  const successorCursor = modules.hog.deriveInteractionResumeCursor(
    heldCursor,
    {
      inputRef: successorInput.inputRef,
      inputDigest: successorInput.inputDigest,
    },
  );
  assert.equal(successorCursor.kind, "traversal_cursor", JSON.stringify(successorCursor));
  return { heldCursor, rehydrated, successorCursor, successorInput };
}

function admitResume(modules, source, prepared, inputs, label) {
  const resume = modules.abg.admitFhInteractionResume(
    prepared.store,
    prepared.respondedContinuation,
    prepared.continueOperation,
    inputs.rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    inputs.successorInput,
    inputs.successorCursor,
    prepared.store.digest(),
    runtimeBasis(`${label}/resume`),
  );
  assert.equal(resume.kind, "fh_interaction_resume_admission");
  return resume;
}

function initialCursorFixture(modules, source) {
  const fullStore = cloneStore(modules, source.events);
  const scopeBasis = scopeForRun(modules, fullStore, source.runR);
  const frame = scopeBasis.frame;
  const events = source.events.slice(0, frame.admissionOrdinal);
  const controlBasis = scopeForRun(
    modules,
    cloneStore(modules, events),
    source.runR,
  );
  const graph = graphBasis(
    modules,
    cloneStore(modules, events),
    source.publication,
    controlBasis.executionBasis,
  );
  const traversalStop = modules.hog.traverse({
    program: graph.program,
    graph: graph.graph,
    graphValidation: graph.graphValidation,
    executionBasis: controlBasis.executionBasis,
    openedTraversalScope: controlBasis.scope,
  });
  assert.equal(traversalStop.kind, "traversal_stop_ref", JSON.stringify(traversalStop));
  const pair = newPair(
    modules,
    events,
    source.runR,
    source.runS,
    "initial-cursor",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = runtimeBasis("initial-cursor/target");
  const control = modules.abg.admitInitialTraversalCursor(
    pair.control,
    controlBasis.executionBasis,
    controlBasis.scope,
    graph.graph,
    graph.graphValidation,
    traversalStop.cursor,
    targetBasis,
  );
  const interleaved = modules.abg.admitInitialTraversalCursor(
    pair.interleaved,
    controlBasis.executionBasis,
    controlBasis.scope,
    graph.graph,
    graph.graphValidation,
    traversalStop.cursor,
    targetBasis,
  );
  assert.equal(control.kind, "traversal_cursor_admission");
  assert.deepEqual(interleaved, {
    kind: "traversal_cursor_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code: "scope_mismatch",
    message: "initial cursor must immediately extend the opened frame truth",
  });
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  assertNoSReferences(interleaved, pair.s.event.eventId, "initial cursor result");
  return {
    caseId: "initial_cursor",
    control: control.kind,
    interleaved: `${interleaved.kind}:${interleaved.code}:${interleaved.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length,
    inputProof: pairedInputProof(modules, {
      executionBasisRef: controlBasis.executionBasis.basisRef,
      executionBasisDigest: controlBasis.executionBasis.basisDigest,
      scopeRef: controlBasis.scope.scopeRef,
      scopeDigest: controlBasis.scope.scopeDigest,
      graphRef: graph.graph.materializationRef,
      graphDigest: graph.graph.materializationDigest,
      graphValidationRef: graph.graphValidation.validationRef,
      graphValidationDigest: graph.graphValidation.validationDigest,
      cursorRef: traversalStop.cursor.cursorRef,
      cursorDigest: traversalStop.cursor.cursorDigest,
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

function normalClosureFixture(modules, source, mutation = false) {
  const routeEvent = source.events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === source.runR &&
      event.graphFunctionRef === HELLO_GRAPH_REF &&
      event.payload.routeKind === "terminal",
  );
  assert.ok(routeEvent, "normal R terminal route absent");
  const prepared = prepareAdmittedLeafRoute(
    modules,
    source.events,
    source.publication,
    source.runR,
    routeEvent,
  );
  assert.ok(prepared.closureContract);
  const pair = newPair(
    modules,
    prepared.events,
    source.runR,
    source.runS,
    mutation ? "refusal-causation" : "normal-closure",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const route = mutation ? structuredClone(prepared.route) : prepared.route;
  let control;
  let interleaved;
  let interleavedError = null;
  const targetBasis = runtimeBasis(
    `${mutation ? "refusal-causation" : "normal-closure"}/target`,
  );
  const targetReplay = modules.abg.replay(pair.control, { runId: source.runR });
  assert.deepEqual(
    modules.abg.replay(pair.interleaved, { runId: source.runR }),
    targetReplay,
  );
  control = modules.abg.admitClosure(
    pair.control,
    prepared.cCall,
    prepared.result,
    prepared.judgment,
    route,
    targetReplay,
    prepared.closureContract,
    targetBasis,
  );
  try {
    interleaved = modules.abg.admitClosure(
      pair.interleaved,
      prepared.cCall,
      prepared.result,
      prepared.judgment,
      route,
      targetReplay,
      prepared.closureContract,
      targetBasis,
    );
  } catch (error) {
    interleavedError = error;
  }
  if (mutation) {
    assert.equal(control.kind, "closure_admission_refusal");
    assert.equal(control.code, "runtime_basis_mismatch");
    assert.ok(control.failureEventRef);
  } else {
    assert.equal(control.kind, "closure_admission");
  }
  assert.equal(interleaved, undefined);
  assert.equal(interleavedError?.constructor, TypeError);
  assert.equal(
    interleavedError?.message,
    "runtime event causation cannot cross a run scope",
  );
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  const interleavedR = runEventsSince(
    pair.interleaved,
    source.runR,
    beforeInterleaved,
  );
  assert.deepEqual(interleavedR, []);
  assertNoSReferences(
    { interleaved: interleaved ?? null, interleavedR },
    pair.s.event.eventId,
    mutation ? "refusal causation" : "normal closure",
  );
  return {
    caseId: mutation ? "refusal_causation" : "normal_closure",
    control: mutation
      ? `${control.kind}:${control.code}:failure=${control.failureEventRef !== null}`
      : control.kind,
    interleaved: `TypeError:${interleavedError.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: interleavedR.length,
    inputProof: pairedInputProof(modules, {
      cCallRef: prepared.cCall.cCallRef,
      resultRef: prepared.result.resultRef,
      judgmentRef: prepared.judgment.judgmentRef,
      routeRef: route.routeRef,
      routeDigest: route.routeDigest,
      replayDigest: targetReplay.replayDigest,
      closureContractRef: prepared.closureContract.closureContractRef,
      closureContractDigest: modules.product.sha256Canonical(
        prepared.closureContract,
      ),
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

function childClosureFixture(modules, source) {
  const routeEvent = source.events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === source.runR &&
      event.graphFunctionRef === RECURSION_CHILD_GRAPH_REF &&
      event.payload.routeKind === "terminal",
  );
  assert.ok(routeEvent, "child R terminal route absent");
  const prepared = prepareAdmittedLeafRoute(
    modules,
    source.events,
    source.publication,
    source.runR,
    routeEvent,
  );
  assert.ok(prepared.closureContract);
  assert.equal(prepared.closureContract.closureScope, "graph_call");
  const pair = newPair(
    modules,
    prepared.events,
    source.runR,
    source.runS,
    "child-closure",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = runtimeBasis("child-closure/target");
  const targetReplay = modules.abg.replay(pair.control, { runId: source.runR });
  assert.deepEqual(
    modules.abg.replay(pair.interleaved, { runId: source.runR }),
    targetReplay,
  );
  const control = modules.abg.admitChildClosure(
    pair.control,
    prepared.scope,
    prepared.cCall,
    prepared.result,
    prepared.judgment,
    prepared.route,
    targetReplay,
    prepared.closureContract,
    targetBasis,
  );
  const interleaved = modules.abg.admitChildClosure(
    pair.interleaved,
    prepared.scope,
    prepared.cCall,
    prepared.result,
    prepared.judgment,
    prepared.route,
    targetReplay,
    prepared.closureContract,
    targetBasis,
  );
  assert.equal(control.kind, "child_closure_admission");
  assert.deepEqual(interleaved, {
    kind: "child_closure_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code: "replay_mismatch",
    message: "child closure basis is not current replay truth",
  });
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  assertNoSReferences(interleaved, pair.s.event.eventId, "child closure result");
  return {
    caseId: "child_closure",
    control: control.kind,
    interleaved: `${interleaved.kind}:${interleaved.code}:${interleaved.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length,
    inputProof: pairedInputProof(modules, {
      scopeRef: prepared.scope.scopeRef,
      scopeDigest: prepared.scope.scopeDigest,
      cCallRef: prepared.cCall.cCallRef,
      resultRef: prepared.result.resultRef,
      judgmentRef: prepared.judgment.judgmentRef,
      routeRef: prepared.route.routeRef,
      routeDigest: prepared.route.routeDigest,
      replayDigest: targetReplay.replayDigest,
      closureContractRef: prepared.closureContract.closureContractRef,
      closureContractDigest: modules.product.sha256Canonical(
        prepared.closureContract,
      ),
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

async function responseFixture(modules, source) {
  const prepared = await prepareResponseOperation(modules, source, "fh-response");
  const pair = newPair(
    modules,
    prepared.store.readAll(),
    source.runR,
    source.runS,
    "fh-response",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = runtimeBasis("fh-response/target");
  const control = modules.abg.admitFhInteractionResponse(
    pair.control,
    prepared.continuation,
    prepared.operation,
    prepared.continuation.responseContractRef,
    prepared.response,
    targetBasis,
  );
  let interleaved;
  let error = null;
  try {
    interleaved = modules.abg.admitFhInteractionResponse(
      pair.interleaved,
      prepared.continuation,
      prepared.operation,
      prepared.continuation.responseContractRef,
      prepared.response,
      targetBasis,
    );
  } catch (caught) {
    error = caught;
  }
  assert.equal(control.kind, "fh_interaction_response_admission");
  assert.equal(interleaved, undefined);
  assert.equal(error?.constructor, TypeError);
  assert.equal(
    error?.message,
    "F_H response requires one exact open continuation and admitted response operation",
  );
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  assertNoSReferences(
    { interleaved: interleaved ?? null },
    pair.s.event.eventId,
    "F_H response result",
  );
  return {
    caseId: "fh_response",
    control: control.kind,
    interleaved: `TypeError:${error.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length,
    inputProof: pairedInputProof(modules, {
      continuationRef: source.rContinuationRef,
      operationEventRef: prepared.operation.admissionEventRef,
      responseContractRef: prepared.continuation.responseContractRef,
      responseDigest: modules.product.sha256Canonical(prepared.response),
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

async function continuationReconstructionFixture(modules, source) {
  const prepared = await prepareContinueOperation(
    modules,
    source,
    "continuation-reconstruction",
  );
  const pair = newPair(
    modules,
    prepared.store.readAll(),
    source.runR,
    source.runS,
    "continuation-reconstruction",
  );
  const control = modules.abg.rehydrateFhContinuation(
    pair.control,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    prepared.continueOperation,
  );
  const interleaved = modules.abg.rehydrateFhContinuation(
    pair.interleaved,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    prepared.continueOperation,
  );
  assert.ok(control);
  assert.equal(interleaved, null);
  assertNoSReferences(interleaved, pair.s.event.eventId, "continuation result");
  return {
    caseId: "continuation_reconstruction",
    control: "rehydrated",
    interleaved: "null",
    controlREventDelta: 0,
    interleavedREventDelta: 0,
    inputProof: pairedInputProof(modules, {
      continuationRef: source.rContinuationRef,
      operationEventRef: prepared.continueOperation.admissionEventRef,
      expectedInstallId: source.rAuthority.install.installId,
      expectedWorkspaceBindingId: source.rAuthority.workspaceBinding.bindingId,
      expectedWorkspaceBindingDigest:
        source.rAuthority.workspaceBinding.bindingDigest,
      expectedCatalogViewId: source.rAuthority.catalogView.viewId,
      expectedCatalogViewDigest: source.rAuthority.catalogView.viewDigest,
      expectedGraphRef: source.rAuthority.heldGraph.materializationRef,
      expectedGraphDigest: source.rAuthority.heldGraph.materializationDigest,
      expectedClosureContractDigest: modules.product.sha256Canonical(
        source.rAuthority.heldClosureContract,
      ),
    }),
    ...disjointEventEvidence(pair),
  };
}

async function resumeFixture(modules, source) {
  const prepared = await prepareContinueOperation(modules, source, "fh-resume");
  const inputs = prepareResumeInputs(modules, source, prepared);
  const pair = newPair(
    modules,
    prepared.store.readAll(),
    source.runR,
    source.runS,
    "fh-resume",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = runtimeBasis("fh-resume/target");
  const durablePrefixDigest = pair.control.digest({ runId: source.runR });
  assert.equal(
    pair.interleaved.digest({ runId: source.runR }),
    durablePrefixDigest,
  );
  const control = modules.abg.admitFhInteractionResume(
    pair.control,
    prepared.respondedContinuation,
    prepared.continueOperation,
    inputs.rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    inputs.successorInput,
    inputs.successorCursor,
    durablePrefixDigest,
    targetBasis,
  );
  let interleaved;
  let error = null;
  try {
    interleaved = modules.abg.admitFhInteractionResume(
      pair.interleaved,
      prepared.respondedContinuation,
      prepared.continueOperation,
      inputs.rehydrated.executionBasis,
      source.rAuthority.heldClosureContract,
      inputs.successorInput,
      inputs.successorCursor,
      durablePrefixDigest,
      targetBasis,
    );
  } catch (caught) {
    error = caught;
  }
  assert.equal(control.kind, "fh_interaction_resume_admission");
  assert.equal(interleaved, undefined);
  assert.equal(error?.constructor, TypeError);
  assert.equal(
    error?.message,
    "F_H resume requires one exact responded continuation and successor cursor",
  );
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  assertNoSReferences(
    { interleaved: interleaved ?? null },
    pair.s.event.eventId,
    "F_H resume result",
  );
  return {
    caseId: "fh_resume",
    control: control.kind,
    interleaved: `TypeError:${error.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length,
    inputProof: pairedInputProof(modules, {
      continuationRef: source.rContinuationRef,
      operationEventRef: prepared.continueOperation.admissionEventRef,
      executionBasisRef: inputs.rehydrated.executionBasis.basisRef,
      executionBasisDigest: inputs.rehydrated.executionBasis.basisDigest,
      closureContractDigest: modules.product.sha256Canonical(
        source.rAuthority.heldClosureContract,
      ),
      successorInputRef: inputs.successorInput.inputRef,
      successorInputDigest: inputs.successorInput.inputDigest,
      successorCursorRef: inputs.successorCursor.cursorRef,
      successorCursorDigest: inputs.successorCursor.cursorDigest,
      durablePrefixDigest,
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

async function interactionClosureFixture(modules, source) {
  const prepared = await prepareContinueOperation(
    modules,
    source,
    "interaction-closure",
  );
  const inputs = prepareResumeInputs(modules, source, prepared);
  const resume = admitResume(
    modules,
    source,
    prepared,
    inputs,
    "interaction-closure",
  );
  const interactionGraph = graphBasis(
    modules,
    prepared.store,
    source.publication,
    inputs.rehydrated.executionBasis,
  ).graph;
  const beforeRoute = modules.abg.replay(prepared.store, { runId: source.runR });
  const step = modules.hog.deriveCompletedTraversalStep(
    interactionGraph,
    inputs.successorCursor,
    {
      inputRef: resume.successorInputRef,
      inputDigest: resume.successorInputDigest,
    },
  );
  assert.equal(step.kind, "traversal_step", JSON.stringify(step));
  assert.equal(step.targetCursor, null, "terminal F_H fixture must have no target cursor");
  const candidate = modules.hog.proposeInteractionResumeTerminalRoute(
    interactionGraph,
    inputs.successorCursor,
    inputs.rehydrated.heldInteraction.cCall,
    inputs.rehydrated.heldInteraction.judgment,
    resume,
    beforeRoute,
    inputs.rehydrated.heldInteraction.cCall.transitionContractRef,
  );
  assert.equal(candidate.kind, "traversal_route_candidate", JSON.stringify(candidate));
  const route = modules.abg.admitRoute(
    prepared.store,
    inputs.rehydrated.executionBasis,
    interactionGraph,
    inputs.successorCursor,
    null,
    beforeRoute,
    candidate,
    runtimeBasis("interaction-closure/route"),
    {
      cCall: inputs.rehydrated.heldInteraction.cCall,
      result: inputs.rehydrated.heldInteraction.result,
      judgment: inputs.rehydrated.heldInteraction.judgment,
      resume,
    },
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
  const pair = newPair(
    modules,
    prepared.store.readAll(),
    source.runR,
    source.runS,
    "interaction-closure",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = runtimeBasis("interaction-closure/target");
  const targetReplay = modules.abg.replay(pair.control, { runId: source.runR });
  assert.deepEqual(
    modules.abg.replay(pair.interleaved, { runId: source.runR }),
    targetReplay,
  );
  const control = modules.abg.admitInteractionClosure(
    pair.control,
    inputs.rehydrated.heldInteraction.cCall,
    inputs.rehydrated.heldInteraction.result,
    inputs.rehydrated.heldInteraction.judgment,
    resume,
    route,
    targetReplay,
    source.rAuthority.heldClosureContract,
    targetBasis,
  );
  let interleaved;
  let error = null;
  try {
    interleaved = modules.abg.admitInteractionClosure(
      pair.interleaved,
      inputs.rehydrated.heldInteraction.cCall,
      inputs.rehydrated.heldInteraction.result,
      inputs.rehydrated.heldInteraction.judgment,
      resume,
      route,
      targetReplay,
      source.rAuthority.heldClosureContract,
      targetBasis,
    );
  } catch (caught) {
    error = caught;
  }
  assert.equal(control.kind, "closure_admission", JSON.stringify(control));
  assert.equal(interleaved, undefined);
  assert.equal(error?.constructor, TypeError);
  assert.equal(
    error?.message,
    "runtime event causation cannot cross a run scope",
  );
  assert.equal(pair.interleaved.readAll().length, beforeInterleaved);
  assertNoSReferences(
    { interleaved: interleaved ?? null },
    pair.s.event.eventId,
    "interaction closure result",
  );
  return {
    caseId: "interaction_closure",
    control: control.kind,
    interleaved: `TypeError:${error.message}`,
    controlREventDelta: runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length,
    interleavedREventDelta: runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length,
    inputProof: pairedInputProof(modules, {
      cCallRef: inputs.rehydrated.heldInteraction.cCall.cCallRef,
      resultRef: inputs.rehydrated.heldInteraction.result.resultRef,
      judgmentRef: inputs.rehydrated.heldInteraction.judgment.judgmentRef,
      resumeEventRef: resume.admissionEventRef,
      routeRef: route.routeRef,
      routeDigest: route.routeDigest,
      replayDigest: targetReplay.replayDigest,
      closureContractRef: source.rAuthority.heldClosureContract.closureContractRef,
      closureContractDigest: modules.product.sha256Canonical(
        source.rAuthority.heldClosureContract,
      ),
      targetBasis,
    }),
    ...disjointEventEvidence(pair),
  };
}

function observedSignature(cases) {
  return Object.fromEntries(
    cases.map((entry) => [entry.caseId, {
      control: entry.control,
      interleaved: entry.interleaved,
      controlREventDelta: entry.controlREventDelta,
      interleavedREventDelta: entry.interleavedREventDelta,
    }]),
  );
}

export async function runAxF08({ packageRoot, harness }) {
  const modules = await installedModules(harness);
  const [helloSource, childSource, interactionSource] = await Promise.all([
    rootRunSource(harness, modules, packageRoot, "s06-ax-f08-hello", {
      programRef: HELLO_PROGRAM_REF,
      graphFunctionRef: HELLO_GRAPH_REF,
      input: {
        kind: "hello_world_input",
        schemaVersion: "5.0.0",
        subject: "R",
      },
    }),
    rootRunSource(harness, modules, packageRoot, "s06-ax-f08-child", {
      programRef: RECURSION_PROGRAM_REF,
      graphFunctionRef: RECURSION_GRAPH_REF,
      input: recursionInput(3),
    }),
    miniInteractionSource(harness, modules, packageRoot),
  ]);

  const cases = [
    initialCursorFixture(modules, helloSource),
    await continuationReconstructionFixture(modules, interactionSource),
    await responseFixture(modules, interactionSource),
    await resumeFixture(modules, interactionSource),
    normalClosureFixture(modules, helloSource),
    await interactionClosureFixture(modules, interactionSource),
    childClosureFixture(modules, childSource),
    normalClosureFixture(modules, helloSource, true),
  ];
  assert.deepEqual(cases.map((entry) => entry.caseId), F08_ROWS);

  const observed = observedSignature(cases);
  const expected = {
    initial_cursor:
      "traversal_cursor_admission_refusal:scope_mismatch:initial cursor must immediately extend the opened frame truth",
    continuation_reconstruction: "null",
    fh_response:
      "TypeError:F_H response requires one exact open continuation and admitted response operation",
    fh_resume:
      "TypeError:F_H resume requires one exact responded continuation and successor cursor",
    normal_closure:
      "TypeError:runtime event causation cannot cross a run scope",
    interaction_closure:
      "TypeError:runtime event causation cannot cross a run scope",
    child_closure:
      "child_closure_admission_refusal:replay_mismatch:child closure basis is not current replay truth",
    refusal_causation:
      "TypeError:runtime event causation cannot cross a run scope",
  };
  for (const entry of cases) {
    assert.equal(entry.interleaved, expected[entry.caseId]);
    assert.equal(entry.interleavedREventDelta, 0);
  }
  assert.equal(cases[7].control.startsWith(
    "closure_admission_refusal:runtime_basis_mismatch:failure=true",
  ), true);

  return {
    relationId: "AX-F08",
    disposition: "confirmed_red",
    claim:
      "a valid event for disjoint run S must not alter admission, reconstruction, closure, or refusal truth for run R",
    ingress:
      "installed ABG traversal cursor, continuation, closure, Event Calculus, replay, and owner admission ports",
    fixtureSource: {
      kind: "eight_owner_admitted_paired_runtime_prefixes",
      control: "exact valid R prefix",
      mutation:
        "one owner-admitted runtime_failure_observed event causally scoped to disjoint run S immediately before the target",
      terminalInteraction:
        "installed developer mini-Product with its declared deterministic lead-in, terminal F_H contract, and Product response semantics",
    },
    processBoundary:
      "one installed package instance; independent in-memory ABG stores reconstructed from exact owner-admitted prefixes",
    mutation: {
      kind: "single_disjoint_run_event_interleave",
      pairedFixtureCount: 8,
      targetRun: "R",
      disjointRun: "S",
      eventKind: "runtime_failure_observed",
    },
    oracle: {
      exactRunRDispositionEquality: true,
      exactRunREventBodyAndReferenceEquality: true,
      exactRunRReplayEquality: true,
      noRunRCausalReferenceMayNameS: true,
      invalidEnvelopeOrPrerequisiteFailureIsFixtureFailure: true,
    },
    expectedBaselineSignature: expected,
    observedSignature: observed,
    cases: cases.map((entry) => caseRecord(
      entry.caseId,
      expected[entry.caseId],
      entry.interleaved,
      entry.interleaved === expected[entry.caseId] &&
        entry.interleavedREventDelta === 0,
    )),
    maskControls: [
      passedControl("exact_eight_fixture_set", cases.map((entry) => entry.caseId)),
      passedControl(
        "control_prefixes_reach_target_success_or_declared_r_local_refusal",
        cases.map((entry) => ({ caseId: entry.caseId, control: entry.control })),
      ),
      passedControl(
        "one_valid_s_event_is_only_mutation",
        cases.map((entry) => ({
          caseId: entry.caseId,
          sEventKind: entry.sEventKind,
          eventAdmitted: entry.sEventRef.startsWith("event://"),
          disjointRunPresent:
            typeof entry.sRunId === "string" && entry.sRunId.length > 0,
          causationRefCount: entry.sCausationEventRefs.length,
        })),
      ),
      passedControl(
        "run_r_replay_equal_before_every_target",
        cases.map((entry) => entry.caseId),
      ),
      passedControl(
        "run_r_target_inputs_and_admission_bases_are_exactly_equal",
        cases.map((entry) => ({
          caseId: entry.caseId,
          canonicalInputsEqual:
            entry.inputProof.controlDigest ===
              entry.inputProof.interleavedDigest,
          coordinateFieldCount:
            Object.keys(entry.inputProof.coordinates).length,
        })),
      ),
      passedControl(
        "no_interleaved_target_appends_run_r_truth",
        cases.map((entry) => ({
          caseId: entry.caseId,
          delta: entry.interleavedREventDelta,
        })),
      ),
    ],
  };
}
