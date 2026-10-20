import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { prepareDeveloperMiniProduct } from "../support/developer-mini-product.mjs";
import {
  constructClosedCatalogReadinessBasis,
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

function runJsonWorker(workerPath, cwd, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      [workerPath],
      {
        cwd,
        env: { ...process.env, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        timeout: 120_000,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(new Error(
            `runtime F10 worker failed (${String(error.code)}): ${stderr}\n${stdout}`,
          ));
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(new Error(
            `runtime F10 worker returned invalid JSON: ${String(parseError)}\n${stdout}\n${stderr}`,
          ));
        }
      },
    );
    child.stdin.end(JSON.stringify(input));
  });
}

function runtimeBasis(label, causationEventRefs = []) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: `correlation://s06/ax-f08/${label}`,
    causationEventRefs,
  };
}

function continuationOwnerBasis(operationBasis) {
  return {
    eventTime: operationBasis.eventTime,
    correlationId: operationBasis.correlationId,
    causationEventRefs: [],
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

function outcomeDispositionSummary(outcomes) {
  return outcomes.map((outcome) => ({
    operationId: outcome.operationId,
    invocationRef: outcome.invocationRef,
    disposition: outcome.disposition,
    kind: outcome.kind,
    diagnosticRef: outcome.diagnosticRef ?? null,
    runId: outcome.runId ?? null,
    refusalCode:
      outcome.result?.kind === "public_operation_refusal"
        ? outcome.result.code
        : outcome.code ?? null,
    refusalMessage:
      outcome.result?.kind === "public_operation_refusal"
        ? outcome.result.message
        : outcome.message ?? null,
  }));
}

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function durablePrefixSnapshot(modules, store) {
  const eventLogPath = store.configuredDurableLogPath();
  assert.equal(typeof eventLogPath, "string");
  const bytes = readFileSync(eventLogPath);
  const status = statSync(eventLogPath);
  const prefixBody = {
    kind: "durable_prefix_coordinate",
    schemaVersion: "5.0.0",
    eventLogRef: pathToFileURL(eventLogPath).href,
    prefixLength: bytes.byteLength,
    prefixDigest: sha256Bytes(bytes),
    storeIdentity: {
      device: status.dev,
      inode: status.ino,
      eventContractDigest: modules.eventStore.ROOT_EVENT_CONTRACT_DIGEST,
    },
  };
  return {
    eventCount: store.readAll().length,
    eventStoreDigest: store.digest(),
    prefix: {
      ...prefixBody,
      coordinateDigest: modules.product.sha256Canonical(prefixBody),
    },
  };
}

function snapshotsEqual(modules, left, right) {
  return modules.product.canonicalJson(left) ===
    modules.product.canonicalJson(right);
}

function closePhysicalSource(store) {
  const events = structuredClone(store.readAll());
  const handoff = store.projectReopenAuthorityAndClose();
  return { events, handoff };
}

function cloneStore(modules, source, events = source.events) {
  assert.deepEqual(
    source.events.slice(0, events.length),
    events,
    "physical clone selection must be one exact source prefix",
  );
  assert.deepEqual(
    modules.abg.readRuntimeEventsAtDurablePrefix(source.handoff.prefix),
    source.events,
    "physical clone source must equal its closed authentic durable prefix",
  );
  const sourceBytes = readFileSync(source.handoff.reopenAuthority.eventLogPath);
  assert.equal(
    sha256Bytes(sourceBytes),
    source.handoff.reopenAuthority.eventLogDigest,
  );
  let prefixLength = 0;
  let rowCount = 0;
  while (rowCount < events.length) {
    const newline = sourceBytes.indexOf(0x0a, prefixLength);
    assert.notEqual(newline, -1, "source prefix ended before selected ordinal");
    prefixLength = newline + 1;
    rowCount += 1;
  }
  const exactBytes = sourceBytes.subarray(0, prefixLength);
  const eventLogPath = join(
    "/tmp",
    `runtime-f08-clone-${process.pid}-${Date.now()}-${Math.random()}.events.jsonl`,
  );
  writeFileSync(eventLogPath, exactBytes, { flag: "wx" });
  const status = statSync(eventLogPath);
  const prefixBody = {
    kind: "durable_prefix_coordinate",
    schemaVersion: "5.0.0",
    eventLogRef: pathToFileURL(eventLogPath).href,
    prefixLength: exactBytes.byteLength,
    prefixDigest: sha256Bytes(exactBytes),
    storeIdentity: {
      device: status.dev,
      inode: status.ino,
      eventContractDigest: modules.eventStore.ROOT_EVENT_CONTRACT_DIGEST,
    },
  };
  const prefix = {
    ...prefixBody,
    coordinateDigest: modules.product.sha256Canonical(prefixBody),
  };
  const authorityBody = {
    kind: "event_store_reopen_authority",
    schemaVersion: "5.0.0",
    eventLogPath,
    device: status.dev,
    inode: status.ino,
    eventLogDigest: prefix.prefixDigest,
    durableByteLength: exactBytes.byteLength,
    eventContractDigest: modules.eventStore.ROOT_EVENT_CONTRACT_DIGEST,
  };
  const reopenAuthority = {
    ...authorityBody,
    authorityDigest: modules.product.sha256Canonical(authorityBody),
  };
  const handoff = { prefix, reopenAuthority };
  assert.equal(modules.eventStore.validateDurablePrefixCoordinate(prefix), true);
  assert.equal(modules.eventStore.validateEventStoreCloseHandoff(handoff), true);
  assert.deepEqual(
    modules.abg.readRuntimeEventsAtDurablePrefix(prefix),
    events,
    "physical clone bytes must parse as the exact selected source prefix",
  );
  const reopened = modules.abg.reopenEventStore(reopenAuthority, prefix);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  modules.ephemeralStores.push({ eventLogPath, store: reopened.store });
  return reopened.store;
}

function reopenCurrentPrefix(modules, store) {
  const handoff = store.projectReopenAuthorityAndClose();
  const reopened = modules.abg.reopenEventStore(
    handoff.reopenAuthority,
    handoff.prefix,
  );
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  const registration = modules.ephemeralStores.find((entry) => entry.store === store);
  assert.ok(registration, "cloned durable store must be registered");
  registration.store = reopened.store;
  return { prefix: handoff.prefix, store: reopened.store };
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

function runtimeEventCandidate(event) {
  const {
    eventId: _eventId,
    admissionOrdinal: _admissionOrdinal,
    payloadDigest: _payloadDigest,
    ...candidate
  } = structuredClone(event);
  return candidate;
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

function newPair(modules, source, runR, runS, label, events = source.events) {
  const control = cloneStore(modules, source, events);
  const interleaved = cloneStore(modules, source, events);
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

function withoutAdmissionEventRef(admission) {
  const { admissionEventRef, ...body } = admission;
  void admissionEventRef;
  return body;
}

function assertExactDuplicateFhInvocationTruth(
  modules,
  prefix,
  invocationRef,
  operationId,
  publicOperationEventRef,
  ownerEventRef,
) {
  const truth = modules.abg.projectEffectfulPublicInvocationTruthAtPrefix(
    prefix,
    invocationRef,
  );
  assert.equal(truth.disposition, "duplicate", JSON.stringify(truth));
  assert.equal(truth.priorAdmission.operationId, operationId);
  assert.equal(
    truth.priorAdmission.publicOperationEventRef,
    publicOperationEventRef,
  );
  assert.equal(truth.priorAdmission.admissionEventRef, ownerEventRef);
}

function withoutClosureEventRefs(admission) {
  const {
    terminalReachedEventRef,
    frameClosedEventRef,
    graphCallClosedEventRef,
    runClosedEventRef,
    failureEventRef,
    ...body
  } = admission;
  void terminalReachedEventRef;
  void frameClosedEventRef;
  void graphCallClosedEventRef;
  void runClosedEventRef;
  void failureEventRef;
  return body;
}

function semanticProjectionBody(projection) {
  const { physicalCoordinates, ...semantic } = projection;
  void physicalCoordinates;
  return semantic;
}

function semanticRelationDigestBody(projection) {
  const {
    kind,
    schemaVersion,
    viewRef,
    viewDigest,
    physicalCoordinates,
    ...semantic
  } = projection;
  void kind;
  void schemaVersion;
  void viewRef;
  void viewDigest;
  void physicalCoordinates;
  return semantic;
}

function assertPairedRunSemanticEquality(
  modules,
  pair,
  runId,
  beforeControl,
  beforeInterleaved,
  label,
  expectScopedPhysicalShift = true,
) {
  const control = modules.abg.projectRunSemanticReplayProjection(
    modules.abg.selectValidatedRuntimeEventPrefix(pair.control.readAll()),
    runId,
  );
  const interleaved = modules.abg.projectRunSemanticReplayProjection(
    modules.abg.selectValidatedRuntimeEventPrefix(pair.interleaved.readAll()),
    runId,
  );
  assert.equal(
    modules.product.sha256Canonical(semanticRelationDigestBody(control)),
    control.viewDigest,
    `${label}: Run R relation view must self-hash its semantic body`,
  );
  assert.equal(Object.hasOwn(control, "events"), false);
  const atomRefs = new Set(control.eventAtoms.map((atom) => atom.atomRef));
  assert.equal(atomRefs.size, control.eventAtoms.length);
  assert.ok(control.relations.every((edge) =>
    Object.keys(edge).join(",") === "sourceAtom,relation,targetAtom" &&
    atomRefs.has(edge.sourceAtom) &&
    atomRefs.has(edge.targetAtom)
  ), `${label}: relation edges must use only exact Run R event atoms`);
  assert.deepEqual(
    semanticProjectionBody(interleaved),
    semanticProjectionBody(control),
    `${label}: Run R semantic projection must be equal under its declared event correspondence`,
  );
  assert.equal(interleaved.viewDigest, control.viewDigest);
  assert.equal(interleaved.viewRef, control.viewRef);
  assert.notEqual(
    interleaved.physicalCoordinates.fullEventHistoryDigest,
    control.physicalCoordinates.fullEventHistoryDigest,
    `${label}: the physical prefixes must retain the admitted S distinction`,
  );
  assert.equal(
    interleaved.physicalCoordinates.scopedEventStoreDigest ===
      control.physicalCoordinates.scopedEventStoreDigest,
    !expectScopedPhysicalShift,
    `${label}: scoped physical event-store digest shift must match the target append law`,
  );
  assert.equal(
    interleaved.physicalCoordinates.scopedReplayDigest ===
      control.physicalCoordinates.scopedReplayDigest,
    !expectScopedPhysicalShift,
    `${label}: scoped physical replay digest shift must match the target append law`,
  );

  const controlCoordinates = control.physicalCoordinates.events;
  const interleavedCoordinates = interleaved.physicalCoordinates.events;
  assert.equal(interleavedCoordinates.length, controlCoordinates.length);
  const sOrdinal = pair.s.event.admissionOrdinal;
  for (const [index, coordinate] of interleavedCoordinates.entries()) {
    const controlCoordinate = controlCoordinates[index];
    assert.equal(coordinate.eventRef, controlCoordinate.eventRef);
    if (controlCoordinate.admissionOrdinal < sOrdinal) {
      assert.equal(coordinate.admissionOrdinal, controlCoordinate.admissionOrdinal);
      assert.equal(coordinate.eventId, controlCoordinate.eventId);
    } else {
      assert.equal(
        coordinate.admissionOrdinal,
        controlCoordinate.admissionOrdinal + 1,
      );
      assert.notEqual(coordinate.eventId, controlCoordinate.eventId);
    }
  }
  assertNoSReferences(
    interleaved,
    pair.s.event.eventId,
    `${label} semantic projection`,
  );

  const controlTargetEvents = pair.control.readAll().slice(beforeControl);
  const interleavedTargetEvents = pair.interleaved.readAll().slice(
    beforeInterleaved,
  );
  assert.equal(interleavedTargetEvents.length, controlTargetEvents.length);
  const controlRunEvents = controlTargetEvents.filter(
    (event) => event.runId === runId,
  );
  const interleavedRunEvents = interleavedTargetEvents.filter(
    (event) => event.runId === runId,
  );
  assert.equal(interleavedRunEvents.length, controlRunEvents.length);
  const resumeCoordinatePair = (() => {
    const controlResume = controlTargetEvents.find(
      (event) => event.kind === "fh_interaction_resume_admitted",
    );
    const interleavedResume = interleavedTargetEvents.find(
      (event) => event.kind === "fh_interaction_resume_admitted",
    );
    if (controlResume === undefined || interleavedResume === undefined) {
      return null;
    }
    return {
      control: controlResume.payload.durablePrefixDigest,
      interleaved: interleavedResume.payload.durablePrefixDigest,
    };
  })();
  if (resumeCoordinatePair !== null) {
    assert.notEqual(
      resumeCoordinatePair.interleaved,
      resumeCoordinatePair.control,
    );
  }
  return {
    equalSemanticProjection: true,
    projectionRef: control.viewRef,
    projectionDigest: control.viewDigest,
    semanticEventCount: control.eventCount,
    targetEventCount: controlTargetEvents.length,
    runEventCount: controlRunEvents.length,
    globalOrdinalShift: expectScopedPhysicalShift ? 1 : 0,
    physicalPrefixDigestsDistinct: true,
    physicalScopedReplayDigestsDistinct: expectScopedPhysicalShift,
    ownerCoordinatePair: resumeCoordinatePair,
  };
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
  source,
  publication,
  runId,
  routeEvent,
) {
  const store = cloneStore(
    modules,
    source,
    prefixBefore(source.events, routeEvent),
  );
  const graphCallId = routeEvent.graphCallId;
  const scopeBasis = routeEvent.graphFunctionRef === RECURSION_CHILD_GRAPH_REF
    ? scopeForGraphCall(modules, store, graphCallId)
    : scopeForRun(modules, store, runId);
  const { executionBasis, scope } = scopeBasis;
  const { graph, graphFunction } = graphBasis(
    modules,
    store,
    publication,
    executionBasis,
  );
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
    {
      cCall: state.cCall,
      graphFunction,
      result: structuredClone(state.result),
      judgment: structuredClone(state.judgment),
    },
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
    store,
    ...state,
  };
}

async function freshProcessOutcomeEquality(
  modules,
  source,
  packageRoot,
  harness,
) {
  const routeEvent = source.events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === source.runR &&
      event.graphFunctionRef === HELLO_GRAPH_REF &&
      event.payload.routeKind === "terminal",
  );
  assert.ok(routeEvent);
  const prepared = prepareAdmittedLeafRoute(
    modules,
    source,
    source.publication,
    source.runR,
    routeEvent,
  );
  const workerPath = join(
    packageRoot,
    "test_env/falsifiers/runtime-f10-worker.mjs",
  );
  const handoff = prepared.store.projectReopenAuthorityAndClose();
  const preparedSource = { events: prepared.events, handoff };
  const input = {
    installedPackageRoot: harness.installedPackageRoot,
    prefix: handoff.prefix,
    reopenAuthority: handoff.reopenAuthority,
    cCall: prepared.cCall,
    result: prepared.result,
    judgment: prepared.judgment,
  };
  const first = await runJsonWorker(workerPath, packageRoot, input);
  const second = await runJsonWorker(workerPath, packageRoot, input);
  assert.notEqual(first.processId, process.pid);
  assert.notEqual(second.processId, process.pid);
  assert.notEqual(first.processId, second.processId);
  const { processId: _firstProcessId, ...firstTruth } = first;
  const { processId: _secondProcessId, ...secondTruth } = second;
  assert.deepEqual(secondTruth, firstTruth);
  assert.equal(first.historicalCCallBranded, true);
  assert.equal(first.historicalResultBranded, true);
  assert.equal(first.historicalJudgmentBranded, true);
  assert.equal(first.accepted, true);
  assert.equal(first.substitutedAccepted, false);
  assert.equal(
    first.replayDigest,
    modules.abg.replay(cloneStore(modules, preparedSource), {
      runId: source.runR,
    }).replayDigest,
  );
  return {
    firstProcessId: first.processId,
    secondProcessId: second.processId,
    exactProjectionEquality: true,
    accepted: first.accepted,
    substitutedAccepted: first.substitutedAccepted,
    replayDigest: first.replayDigest,
    cCallRef: first.cCallProjection.cCallRef,
    routeRef: first.routeProjection.routeRef,
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
  return {
    abg,
    eventStore,
    ephemeralStores: [],
    gtl,
    hog,
    product,
    publicApi,
    validator,
  };
}

async function applyTranscript(
  publicApi,
  rows,
  initialHandoff = null,
  initialEventLogPath = null,
) {
  const runRow = rows.find((row) => row.operationId === "abg.operation.run.invoke");
  let context = initialHandoff === null
    ? publicApi.createRootOperationContext(
        initialEventLogPath ?? runRow?.payload?.eventLogPath ??
          join("/tmp", `runtime-f08-${process.pid}-${Date.now()}-${Math.random()}.events.jsonl`),
      )
    : publicApi.reopenRootOperationContext(initialHandoff);
  const outcomes = [];
  let pendingHandoff = null;
  let contextOwnsOpenStore = true;
  try {
    for (const sourceRow of rows) {
      let row = sourceRow;
      let currentPrefixAuthority = null;
      if (pendingHandoff !== null) {
        currentPrefixAuthority = pendingHandoff;
        context = publicApi.reopenRootOperationContext(pendingHandoff);
        contextOwnsOpenStore = true;
        pendingHandoff = null;
      }
      if (sourceRow.operationId === "abg.operation.run.invoke") {
        if (currentPrefixAuthority === null) {
          currentPrefixAuthority =
            publicApi.projectRootOperationContextAuthority(context);
          contextOwnsOpenStore = false;
          context = publicApi.reopenRootOperationContext(currentPrefixAuthority);
          contextOwnsOpenStore = true;
        }
        row = {
          ...sourceRow,
          payload: {
            ...sourceRow.payload,
            runtimePrefixAuthority: currentPrefixAuthority,
          },
        };
      }
      const outcome = await publicApi.applyRootPublicInvocation(context, row);
      outcomes.push(outcome);
      const authority = outcome.disposition === "held"
        ? outcome.result?.continuationAuthority
        : outcome.projectionAuthority ?? outcome.result?.gapAuthority;
      if (
        sourceRow.operationId === "abg.operation.run.invoke" &&
        authority?.prefix !== undefined &&
        authority?.reopenAuthority !== undefined
      ) {
        pendingHandoff = {
          prefix: authority.prefix,
          reopenAuthority: authority.reopenAuthority,
        };
        contextOwnsOpenStore = false;
      }
    }
    const events = structuredClone(context.store.readAll());
    const finalHandoff = pendingHandoff ??
      publicApi.projectRootOperationContextAuthority(context);
    if (pendingHandoff === null) contextOwnsOpenStore = false;
    assert.ok(
      finalHandoff?.prefix !== undefined &&
        finalHandoff?.reopenAuthority !== undefined,
      "the authentic Public transcript must end at one closed durable handoff",
    );
    return {
      events,
      handoff: finalHandoff,
      outcomes,
    };
  } finally {
    if (contextOwnsOpenStore) {
      publicApi.closeRootOperationContext(context);
    }
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

async function prepareRootInterleaveScenario(
  harness,
  modules,
  label,
  target,
  terminalMini,
) {
  const root = join(harness.scratch, `ax-f08-${label}-root-product`);
  const abiConsumer = join(root, "abiogenesis-product");
  const miniConsumer = join(root, "developer-product");
  const workspaceRoot = join(root, "workspace");
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(eventLogRoot, "root-interleave.events.jsonl");
  await mkdir(root, { recursive: true });
  const installedAbiRoot = join(
    abiConsumer,
    "node_modules/@abiogenesis/typescript-tenant",
  );
  const installedMiniRoot = join(
    miniConsumer,
    "node_modules/@abiogenesis-fixtures/developer-mini-product",
  );
  const verifiedAbi = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  const verifiedMini = await harness.product.verifyProduct({
    artifactPath: terminalMini.installedMini.artifactPath,
    artifactRef: terminalMini.installedMini.artifactRef,
    ...expectedVerificationIdentity(terminalMini.installedMini.basis),
  });
  assert.equal(verifiedAbi.kind, "verified_product_artifact");
  assert.equal(verifiedMini.kind, "verified_product_artifact");
  const resolvedLock = harness.product.constructResolvedProductLock([
    verifiedAbi,
    verifiedMini,
  ]);
  assert.equal(resolvedLock.kind, "resolved_product_lock");
  const durableRoots = {
    eventLogRoot,
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  };
  const actorRef = "actor://developer.example/trusted-developer";
  const exactEnvironment = (
    environmentLabel,
    productRoot,
    publications,
    allowlist,
  ) => {
    const workspaceId = `workspace://s06/ax-f08/${label}/${environmentLabel}`;
    const authorityManifestRef =
      `manifest://s06/ax-f08/${label}/${environmentLabel}`;
    const roots = {
      toolchainRoot: installedAbiRoot,
      productRoot,
      ...durableRoots,
    };
    return {
      authorityManifestRef,
      allowlist,
      publications,
      roots,
      workspaceId,
    };
  };
  const sEnvironment = exactEnvironment(
    "run-s",
    installedMiniRoot,
    [terminalMini.installedMini.publication],
    [terminalMini.mini.ids.mixedGraphFunctionRef],
  );
  const rEnvironment = exactEnvironment(
    "run-r",
    installedAbiRoot,
    [harness.rootPublication],
    [HELLO_GRAPH_REF, RECURSION_GRAPH_REF, RECURSION_CHILD_GRAPH_REF],
  );
  const refs = {
    verifyAbi: `invocation://s06/ax-f08/${label}/verify-abiogenesis`,
    verifyMini: `invocation://s06/ax-f08/${label}/verify-developer-product`,
    resolve: `invocation://s06/ax-f08/${label}/resolve`,
    installAbi: `invocation://s06/ax-f08/${label}/install-abiogenesis`,
    installMini: `invocation://s06/ax-f08/${label}/install-developer-product`,
    bindS: `invocation://s06/ax-f08/${label}/bind-s`,
    catalogS: `invocation://s06/ax-f08/${label}/catalog-s`,
    viewS: `invocation://s06/ax-f08/${label}/view-s`,
    bindR: `invocation://s06/ax-f08/${label}/bind-r`,
    catalogR: `invocation://s06/ax-f08/${label}/catalog-r`,
    viewR: `invocation://s06/ax-f08/${label}/view-r`,
  };
  const environmentBinding = (environment, bindRef) =>
    publicInvocation("abg.operation.workspace.bind", "exact_product_set", bindRef, {
      installInvocationRefs: [refs.installAbi, refs.installMini],
      workspaceId: environment.workspaceId,
      canonicalRoot: workspaceRoot,
      authorizedActorRef: actorRef,
      authorityManifestRef: environment.authorityManifestRef,
      roots: environment.roots,
    });
  const setup = [
    publicInvocation("abg.operation.product.verify", "artifact", refs.verifyAbi, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    publicInvocation("abg.operation.product.verify", "artifact", refs.verifyMini, {
      artifactPath: terminalMini.installedMini.artifactPath,
      artifactRef: terminalMini.installedMini.artifactRef,
      ...expectedVerificationIdentity(terminalMini.installedMini.basis),
    }),
    publicInvocation(
      "abg.operation.product.resolve",
      "verified_product_set",
      refs.resolve,
      {
        verifiedProductInputs: [
          { artifactPath: harness.artifactPath, verifiedProduct: verifiedAbi },
          {
            artifactPath: terminalMini.installedMini.artifactPath,
            verifiedProduct: verifiedMini,
          },
        ],
      },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installAbi,
      {
        artifactPath: harness.artifactPath,
        verifiedProduct: verifiedAbi,
        resolvedLock,
        targetRoot: abiConsumer,
      },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installMini,
      {
        artifactPath: terminalMini.installedMini.artifactPath,
        verifiedProduct: verifiedMini,
        resolvedLock,
        targetRoot: miniConsumer,
      },
    ),
    environmentBinding(sEnvironment, refs.bindS),
    environmentBinding(rEnvironment, refs.bindR),
  ];
  const runPayload = (
    installInvocationRef,
    workspaceBindingInvocationRef,
    catalog,
    catalogView,
    applications,
    programRef,
    catalogHandle,
    input,
    eventLogPath,
  ) => ({
    installInvocationRef,
    workspaceBindingInvocationRef,
    catalog,
    catalogView,
    applications,
    programRef,
    catalogHandle,
    actorRef,
    input,
    eventLogPath,
  });
  return {
    actorRef,
    eventLogPath,
    refs,
    resolvedLock,
    rEnvironment,
    sEnvironment,
    setup,
    target,
    terminalMini,
    runPayload,
    verifiedProducts: [verifiedAbi, verifiedMini],
  };
}

async function rootRunSource(harness, modules, label, target, terminalMini) {
  const scenario = await prepareRootInterleaveScenario(
    harness,
    modules,
    label,
    target,
    terminalMini,
  );
  const setupApplied = await applyTranscript(
    modules.publicApi,
    scenario.setup,
    null,
    scenario.eventLogPath,
  );
  assert.equal(
    setupApplied.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomeDispositionSummary(setupApplied.outcomes)),
  );
  const artifactTruth = modules.abg.projectExactPrefixArtifactTruth(
    setupApplied.handoff.prefix,
  );
  assert.equal(artifactTruth.kind, "exact_prefix_artifact_truth_projection");
  const catalogReadinessFor = (environment, bindingInvocationRef) => ({
    readinessBasis: constructClosedCatalogReadinessBasis({
      abg: modules.abg,
      artifactTruth,
      verifiedProducts: scenario.verifiedProducts,
      resolvedLock: scenario.resolvedLock,
      installInvocationRefs: [scenario.refs.installAbi, scenario.refs.installMini],
      workspaceBindingInvocationRef: bindingInvocationRef,
      publications: environment.publications,
    }),
    allowlist: environment.allowlist,
  });
  const sCatalogReadiness = catalogReadinessFor(
    scenario.sEnvironment,
    scenario.refs.bindS,
  );
  const rCatalogReadiness = catalogReadinessFor(
    scenario.rEnvironment,
    scenario.refs.bindR,
  );
  const sCatalogApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.admit",
      "module_publication",
      scenario.refs.catalogS,
      { readinessBasis: sCatalogReadiness.readinessBasis },
    )],
    setupApplied.handoff,
  );
  const sCatalog = sCatalogApplied.outcomes.at(-1).result;
  const sViewApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.view",
      "allowlist",
      scenario.refs.viewS,
      { catalog: sCatalog, allowlist: sCatalogReadiness.allowlist },
    )],
    sCatalogApplied.handoff,
  );
  const sCatalogView = sViewApplied.outcomes.at(-1).result;
  const rCatalogApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.admit",
      "module_publication",
      scenario.refs.catalogR,
      { readinessBasis: rCatalogReadiness.readinessBasis },
    )],
    sViewApplied.handoff,
  );
  const rCatalog = rCatalogApplied.outcomes.at(-1).result;
  const rViewApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.view",
      "allowlist",
      scenario.refs.viewR,
      { catalog: rCatalog, allowlist: rCatalogReadiness.allowlist },
    )],
    rCatalogApplied.handoff,
  );
  const rCatalogView = rViewApplied.outcomes.at(-1).result;
  const applied = await applyTranscript(
    modules.publicApi,
    [
    publicInvocation(
      "abg.operation.run.invoke",
      "direct",
      `invocation://s06/ax-f08/${label}/run-s`,
      scenario.runPayload(
        scenario.refs.installMini,
        scenario.refs.bindS,
        sCatalog,
        sCatalogView,
        [],
        scenario.terminalMini.mini.ids.mixedProgramRef,
        scenario.terminalMini.mini.ids.mixedGraphFunctionRef,
        {
          kind: "developer_greeting_input",
          schemaVersion: "5.0.0",
          name: "S",
        },
        rViewApplied.handoff.reopenAuthority.eventLogPath,
      ),
    ),
    publicInvocation(
      "abg.operation.run.invoke",
      "direct",
      `invocation://s06/ax-f08/${label}/run-r`,
      scenario.runPayload(
        scenario.refs.installAbi,
        scenario.refs.bindR,
        rCatalog,
        rCatalogView,
        [],
        scenario.target.programRef,
        scenario.target.catalogHandle,
        scenario.target.input,
        rViewApplied.handoff.reopenAuthority.eventLogPath,
      ),
    ),
    ],
    rViewApplied.handoff,
  );
  const s = applied.outcomes.at(-2);
  const r = applied.outcomes.at(-1);
  const allOutcomes = [
    ...setupApplied.outcomes,
    ...sCatalogApplied.outcomes,
    ...sViewApplied.outcomes,
    ...rCatalogApplied.outcomes,
    ...rViewApplied.outcomes,
    ...applied.outcomes,
  ];
  assert.equal(
    allOutcomes.every(
      (outcome) => outcome === s
        ? outcome.disposition === "held"
        : outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify({
      outcomes: outcomeDispositionSummary(allOutcomes),
      runtimeFailures: applied.events
        .filter((event) =>
          event.kind === "runtime_failure_observed" ||
          event.kind === "invocation_refused"
        )
        .map((event) => ({
          kind: event.kind,
          runId: event.runId,
          diagnosticRef: event.payload.diagnosticRef,
          failureClass: event.payload.failureClass,
          failureSubject: event.payload.failureSubject,
          stage: event.payload.stage,
        })),
    }),
  );
  assert.notEqual(s.runId, r.runId);
  const activePrefix = cloneStore(modules, applied);
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
    handoff: applied.handoff,
    publication: harness.rootPublication,
    runR: r.runId,
    runS: s.runId,
  };
}

function terminalInteractionPublication(mini) {
  const publication = structuredClone(mini.publication);
  const exactRow = (rows, predicate, label) => {
    const matches = rows.filter(predicate);
    assert.equal(matches.length, 1, `${label} must resolve exactly once`);
    return matches[0];
  };
  const program = exactRow(
    publication.programs,
    (candidate) => candidate.programRef === mini.ids.mixedProgramRef,
    "mixed Program",
  );
  const graph = exactRow(
    publication.graphFunctions,
    (candidate) => candidate.name === mini.ids.mixedGraphFunctionRef,
    "mixed GraphFunction",
  );
  const contribution = exactRow(
    publication.contributions,
    (candidate) => candidate.handle === mini.ids.mixedGraphFunctionRef,
    "mixed contribution",
  );
  const closure = exactRow(
    publication.closureContracts,
    (candidate) =>
      candidate.closureContractRef === mini.ids.mixedClosureContractRef,
    "mixed closure contract",
  );
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
  const selectReferencedRows = (rows, refField, retainedValues) => {
    const refs = new Set(rows.map((row) => row[refField]));
    const selectedRefs = new Set();
    const visit = (value) => {
      if (typeof value === "string") {
        if (refs.has(value)) selectedRefs.add(value);
        return;
      }
      if (Array.isArray(value)) {
        for (const entry of value) visit(entry);
        return;
      }
      if (value !== null && typeof value === "object") {
        for (const entry of Object.values(value)) visit(entry);
      }
    };
    for (const value of retainedValues) visit(value);
    const selected = rows.filter((row) => selectedRefs.has(row[refField]));
    assert.equal(selected.length, selectedRefs.size);
    return selected;
  };
  const implementationBindings = selectReferencedRows(
    publication.implementationBindings,
    "bindingRef",
    [graph],
  );
  const contracts = selectReferencedRows(
    publication.contracts,
    "contractRef",
    [program, graph, contribution, closure, ...implementationBindings],
  );
  publication.contracts = contracts;
  publication.implementationBindings = implementationBindings;
  publication.closureContracts = [closure];
  publication.programs = [program];
  publication.graphFunctions = [graph];
  publication.contributions = [contribution];
  return publication;
}

async function prepareTerminalInteractionMini(harness, packageRoot) {
  const sourceScratch = join(
    harness.scratch,
    "ax-f08-terminal-interaction-product",
  );
  await mkdir(sourceScratch, { recursive: true });
  const mini = await prepareDeveloperMiniProduct(packageRoot, sourceScratch);
  const publication = terminalInteractionPublication(mini);
  const installedMini = await mini.materializePublicationVariant(
    "s06-ax-f08-terminal-interaction",
    publication,
  );
  return { installedMini, mini };
}

async function prepareMiniInteractionScenario(
  harness,
  terminalMini,
  sourceLabel,
) {
  const sourceScratch = join(harness.scratch, `ax-f08-${sourceLabel}`);
  await mkdir(sourceScratch, { recursive: true });
  const { installedMini, mini } = terminalMini;
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
  const verifiedAbi = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  const verifiedMini = await harness.product.verifyProduct({
    artifactPath: installedMini.artifactPath,
    artifactRef: installedMini.artifactRef,
    ...expectedVerificationIdentity(installedMini.basis),
  });
  assert.equal(verifiedAbi.kind, "verified_product_artifact");
  assert.equal(verifiedMini.kind, "verified_product_artifact");
  const resolvedLock = harness.product.constructResolvedProductLock([
    verifiedAbi,
    verifiedMini,
  ]);
  assert.equal(resolvedLock.kind, "resolved_product_lock");
  const roots = {
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
  };
  const allowlist = [mini.ids.mixedGraphFunctionRef];
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
      {
        verifiedProductInputs: [
          { artifactPath: harness.artifactPath, verifiedProduct: verifiedAbi },
          { artifactPath: installedMini.artifactPath, verifiedProduct: verifiedMini },
        ],
      },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installAbi,
      {
        artifactPath: harness.artifactPath,
        verifiedProduct: verifiedAbi,
        resolvedLock,
        targetRoot: abiConsumer,
      },
    ),
    publicInvocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installMini,
      {
        artifactPath: installedMini.artifactPath,
        verifiedProduct: verifiedMini,
        resolvedLock,
        targetRoot: miniConsumer,
      },
    ),
    publicInvocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRefs: [refs.installAbi, refs.installMini],
      workspaceId: "workspace://s06/ax-f08/mini",
      canonicalRoot: workspaceRoot,
      authorizedActorRef: "actor://developer.example/trusted-developer",
      authorityManifestRef: "manifest://s06/ax-f08/mini",
      roots,
    }),
  ];
  const run = (
    runLabel,
    catalog,
    catalogView,
    applications,
    acquiredEventLogPath,
  ) => publicInvocation(
    "abg.operation.run.invoke",
    "direct",
    `invocation://s06/ax-f08/mini/run-${runLabel}`,
    {
      installInvocationRef: refs.installMini,
      workspaceBindingInvocationRef: refs.bind,
      catalog,
      catalogView,
      applications,
      programRef: mini.ids.mixedProgramRef,
      catalogHandle: mini.ids.mixedGraphFunctionRef,
      actorRef: "actor://developer.example/trusted-developer",
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: runLabel === "s" ? "S" : "R",
      },
      eventLogPath: acquiredEventLogPath,
    },
  );
  return {
    allowlist,
    eventLogPath,
    eventLogRoot,
    installedMini,
    mini,
    refs,
    resolvedLock,
    run,
    setup,
    verifiedProducts: [verifiedAbi, verifiedMini],
  };
}

async function miniInteractionSource(harness, modules, terminalMini) {
  const scenario = await prepareMiniInteractionScenario(
    harness,
    terminalMini,
    "interaction",
  );
  const setupApplied = await applyTranscript(
    modules.publicApi,
    scenario.setup,
    null,
    scenario.eventLogPath,
  );
  assert.equal(
    setupApplied.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomeDispositionSummary(setupApplied.outcomes)),
  );
  const artifactTruth = modules.abg.projectExactPrefixArtifactTruth(
    setupApplied.handoff.prefix,
  );
  assert.equal(artifactTruth.kind, "exact_prefix_artifact_truth_projection");
  const readinessBasis = constructClosedCatalogReadinessBasis({
    abg: modules.abg,
    artifactTruth,
    verifiedProducts: scenario.verifiedProducts,
    resolvedLock: scenario.resolvedLock,
    installInvocationRefs: [scenario.refs.installAbi, scenario.refs.installMini],
    workspaceBindingInvocationRef: scenario.refs.bind,
    publications: [scenario.installedMini.publication],
  });
  const catalogApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.admit",
      "module_publication",
      scenario.refs.catalog,
      { readinessBasis },
    )],
    setupApplied.handoff,
  );
  const catalog = catalogApplied.outcomes.at(-1).result;
  const viewApplied = await applyTranscript(
    modules.publicApi,
    [publicInvocation(
      "abg.operation.catalog.view",
      "allowlist",
      scenario.refs.view,
      { catalog, allowlist: scenario.allowlist },
    )],
    catalogApplied.handoff,
  );
  const catalogView = viewApplied.outcomes.at(-1).result;
  const applied = await applyTranscript(
    modules.publicApi,
    [
      scenario.run(
        "s",
        catalog,
        catalogView,
        [],
        viewApplied.handoff.reopenAuthority.eventLogPath,
      ),
      scenario.run(
        "r",
        catalog,
        catalogView,
        [],
        viewApplied.handoff.reopenAuthority.eventLogPath,
      ),
    ],
    viewApplied.handoff,
  );
  assert.equal(
    [
      ...setupApplied.outcomes,
      ...catalogApplied.outcomes,
      ...viewApplied.outcomes,
    ].every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(outcomeDispositionSummary(applied.outcomes)),
  );
  const s = applied.outcomes.at(-2);
  const r = applied.outcomes.at(-1);
  assert.equal(s.disposition, "held", JSON.stringify(s));
  assert.equal(r.disposition, "held", JSON.stringify(r));
  assert.notEqual(s.runId, r.runId);
  return {
    events: applied.events,
    handoff: applied.handoff,
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
  prefix,
  source,
  operation,
  continuation,
) {
  const semanticBasis = modules.abg.projectFhInteractionSemanticBasisAtPrefix(
    prefix,
    continuation,
  );
  assert.ok(semanticBasis, "R interaction semantic basis must project");
  const artifactTruth = modules.abg.projectExactPrefixArtifactTruth(
    source.rAuthority.prefix,
  );
  assert.equal(
    artifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(artifactTruth),
  );
  const semantics = await modules.product.loadInstalledProductSemantics({
    install: source.rAuthority.install,
    publication: source.publication,
    verifyInstallAdmission: (install) =>
      modules.abg.hasAdmittedProductInstall(artifactTruth, install),
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
  const store = cloneStore(modules, source);
  const prefix = modules.abg.selectValidatedRuntimeEventPrefix(store.readAll());
  const rootInvocation = modules.abg.rehydrateInvocationAdmissionAtPrefix(
    prefix,
    source.rAuthority.invocationAdmissionRef,
  );
  assert.ok(rootInvocation, "R root invocation must rehydrate");
  const continuation = modules.abg.replayValidatedRuntimeEventPrefix(prefix)
    .continuations.find(
    (candidate) => candidate.continuationRef === source.rContinuationRef,
  );
  assert.equal(continuation?.status, "open");
  const beforeStaleAdmission = store.readAll().length;
  assert.throws(
    () => modules.abg.prepareContinuationPublicOperation(
      prefix,
      rootInvocation,
      "abg.operation.interaction.respond",
      { ...continuation, status: "responded" },
      "approve",
      rootInvocation.actorRef,
      continuation.actorCapabilityRef,
      operationBasis(
        modules,
        source.rAuthority,
        "abg.operation.interaction.respond",
        `invocation://s06/ax-f08/${label}/stale-respond`,
      ),
    ),
    /exact current durable continuation lifecycle/,
  );
  assert.equal(store.readAll().length, beforeStaleAdmission);
  const operationAdmissionBasis = operationBasis(
    modules,
    source.rAuthority,
    "abg.operation.interaction.respond",
    `invocation://s06/ax-f08/${label}/respond`,
  );
  const operationPlan = modules.abg.prepareContinuationPublicOperation(
    prefix,
    rootInvocation,
    "abg.operation.interaction.respond",
    continuation,
    "approve",
    rootInvocation.actorRef,
    continuation.actorCapabilityRef,
    operationAdmissionBasis,
  );
  assert.equal(
    operationPlan.kind,
    "prepared_continuation_public_operation",
    JSON.stringify(operationPlan),
  );
  const operation = operationPlan.operation;
  const response = await validInteractionResponse(
    modules,
    prefix,
    source,
    operation,
    continuation,
  );
  return {
    continuation,
    operation,
    operationAdmissionBasis,
    operationPlan,
    prefix,
    response,
    rootInvocation,
    store,
  };
}

async function prepareRespondedPrefix(modules, source, label) {
  const prepared = await prepareResponseOperation(modules, source, label);
  const responseBasis = continuationOwnerBasis(
    prepared.operationAdmissionBasis,
  );
  const responsePlan = modules.abg.prepareFhInteractionResponse(
    prepared.operationPlan,
    prepared.continuation,
    prepared.continuation.responseContractRef,
    prepared.response,
    responseBasis,
  );
  assert.equal(
    responsePlan.response.kind,
    "fh_interaction_response_admission",
  );
  const owned = reopenCurrentPrefix(modules, prepared.store);
  const committed = modules.abg.commitFhInteractionResponseAtExpectedPrefix(
    owned.store,
    owned.prefix,
    prepared.rootInvocation,
    prepared.continuation,
    "approve",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.operationAdmissionBasis,
    prepared.continuation.responseContractRef,
    prepared.response,
    responseBasis,
  );
  const admitted = committed.response;
  const respondedContinuation = modules.abg.replayValidatedRuntimeEventPrefix(
    modules.abg.selectValidatedRuntimeEventPrefix(owned.store.readAll()),
    {
      runId: source.runR,
    },
  ).continuations.find(
    (candidate) => candidate.continuationRef === source.rContinuationRef,
  );
  assert.equal(respondedContinuation?.status, "responded");
  return {
    ...prepared,
    responseAdmission: admitted,
    responseBasis,
    responsePlan,
    responsePrefix: committed.successorPrefix,
    respondedContinuation,
    store: owned.store,
  };
}

async function prepareContinueOperation(modules, source, label) {
  const prepared = await prepareRespondedPrefix(modules, source, label);
  const prefix = modules.abg.selectValidatedRuntimeEventPrefix(
    prepared.store.readAll(),
  );
  const continueOperationBasis = operationBasis(
    modules,
    source.rAuthority,
    "abg.operation.run.continue",
    `invocation://s06/ax-f08/${label}/continue`,
  );
  const continuePlan = modules.abg.prepareContinuationPublicOperation(
    prefix,
    prepared.rootInvocation,
    "abg.operation.run.continue",
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    continueOperationBasis,
  );
  assert.equal(
    continuePlan.kind,
    "prepared_continuation_public_operation",
    JSON.stringify(continuePlan),
  );
  return {
    ...prepared,
    continueOperation: continuePlan.operation,
    continueOperationBasis,
    continuePlan,
  };
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
  const rehydrated = modules.abg.rehydrateFhContinuationAtPrefix(
    prepared.continuePlan.projectedPrefix,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    prepared.continueOperation,
  );
  assert.ok(rehydrated, "R continuation must rehydrate before S interleaving");
  const heldCursor = modules.hog.rehydrateHeldInteractionCursor(
    prepared.continuePlan.projectedPrefix,
    rehydrated.heldInteraction.cursor,
  );
  assert.ok(heldCursor, "R held cursor must rehydrate");
  const heldGraph = graphBasis(
    modules,
    prepared.store,
    source.publication,
    rehydrated.executionBasis,
  ).graph;
  assert.equal(
    heldGraph.materializationRef,
    source.rAuthority.heldGraph.materializationRef,
  );
  assert.equal(
    heldGraph.materializationDigest,
    source.rAuthority.heldGraph.materializationDigest,
  );
  const terminalStep =
    modules.hog.deriveDirectCContinuationStepFromGraph(
      heldGraph.template,
      {
        nodeRef: heldCursor.currentNodeRef,
        termPath: heldCursor.termPath,
        taskOrdinal: heldCursor.taskOrdinal,
        attempt: heldCursor.attempt,
        retryPath: heldCursor.retryPath,
      },
    );
  assert.equal(terminalStep.stepKind, "complete_term");
  const successorInputContractRef =
    modules.hog.deriveInteractionSuccessorInputCarrierRef(
      heldGraph,
      heldCursor,
    );
  assert.equal(successorInputContractRef, null);
  const successorContracts = source.publication.contracts.filter(
    (contract) => contract.contractRef === successorInputContractRef,
  );
  assert.equal(successorContracts.length, 0);
  const successorInputValueKind = null;
  const responseContracts = source.publication.contracts.filter(
    (contract) =>
      contract.contractRef ===
        prepared.respondedContinuation.responseContractRef,
  );
  assert.equal(responseContracts.length, 1);
  const beforeHalfNullControls = durablePrefixSnapshot(
    modules,
    prepared.store,
  );
  for (const successorCarrier of [
    {
      inputContractRef: null,
      inputValueKind: responseContracts[0].valueKind,
    },
    {
      inputContractRef: responseContracts[0].contractRef,
      inputValueKind: null,
    },
  ]) {
    assert.throws(
      () => modules.abg.deriveFhResumeSuccessorInputAtPrefix(
        prepared.continuePlan.projectedPrefix,
        prepared.respondedContinuation,
        prepared.continueOperation,
        rehydrated.executionBasis,
        source.rAuthority.heldClosureContract,
        successorCarrier,
      ),
      /contract and value kind must be jointly null or present/,
    );
  }
  const afterHalfNullControls = durablePrefixSnapshot(
    modules,
    prepared.store,
  );
  assert.equal(
    snapshotsEqual(modules, afterHalfNullControls, beforeHalfNullControls),
    true,
  );
  const successorInput = modules.abg.deriveFhResumeSuccessorInputAtPrefix(
    prepared.continuePlan.projectedPrefix,
    prepared.respondedContinuation,
    prepared.continueOperation,
    rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    {
      inputContractRef: successorInputContractRef,
      inputValueKind: successorInputValueKind,
    },
  );
  assert.equal(successorInput.inputContractRef, null);
  assert.equal(successorInput.inputValueKind, null);
  assert.equal(
    successorInput.inputRef,
    prepared.respondedContinuation.responseRef,
  );
  assert.equal(
    successorInput.inputDigest,
    prepared.respondedContinuation.responseDigest,
  );
  assert.deepEqual(
    successorInput.inputValue,
    prepared.respondedContinuation.responseValue,
  );
  const successorCursor = modules.hog.deriveInteractionResumeCursor(
    heldCursor,
    {
      inputRef: successorInput.inputRef,
      inputDigest: successorInput.inputDigest,
    },
  );
  assert.equal(successorCursor.kind, "traversal_cursor", JSON.stringify(successorCursor));
  return {
    heldCursor,
    heldGraph,
    rehydrated,
    successorCursor,
    successorInput,
    terminalCarrierControl: {
      terminalStepKind: terminalStep.stepKind,
      successorInputContractRef,
      successorInputValueKind,
      responseInputIdentityExact: true,
      halfNullPermutationsRefusedBeforeEffects: true,
    },
  };
}

function admitResume(modules, source, prepared, inputs, label) {
  const resumeBasis = continuationOwnerBasis(
    prepared.continueOperationBasis,
  );
  const resumePlan = modules.abg.prepareFhInteractionResume(
    prepared.continuePlan,
    prepared.respondedContinuation,
    inputs.rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    inputs.successorInput,
    inputs.successorCursor,
    prepared.responsePrefix.prefixDigest,
    resumeBasis,
  );
  assert.equal(resumePlan.resume.kind, "fh_interaction_resume_admission");
  const committed = modules.abg.commitFhInteractionResumeAtExpectedPrefix(
    prepared.store,
    prepared.responsePrefix,
    prepared.rootInvocation,
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.continueOperationBasis,
    inputs.rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    inputs.successorInput,
    inputs.successorCursor,
    resumeBasis,
  );
  const resume = committed.resume;
  prepared.responsePrefix = committed.successorPrefix;
  assert.equal(resume.kind, "fh_interaction_resume_admission");
  return resume;
}

function initialCursorFixture(modules, source) {
  const fullStore = cloneStore(modules, source);
  const scopeBasis = scopeForRun(modules, fullStore, source.runR);
  const frame = scopeBasis.frame;
  const events = source.events.slice(0, frame.admissionOrdinal);
  const controlBasis = scopeForRun(
    modules,
    cloneStore(modules, source, events),
    source.runR,
  );
  const graph = graphBasis(
    modules,
    cloneStore(modules, source, events),
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
    source,
    source.runR,
    source.runS,
    "initial-cursor",
    events,
  );
  const sameRunIntervened = cloneStore(modules, source, events);
  const sameRunEvent = appendDisjointEvent(
    modules,
    sameRunIntervened,
    source.runR,
    "initial-cursor-same-run-control",
  );
  const sameRunPrefixBefore = durablePrefixSnapshot(
    modules,
    sameRunIntervened,
  );
  const sameRunResult = modules.abg.admitInitialTraversalCursor(
    sameRunIntervened,
    controlBasis.executionBasis,
    controlBasis.scope,
    graph.graph,
    graph.graphValidation,
    traversalStop.cursor,
    runtimeBasis("initial-cursor/same-run-control"),
  );
  const sameRunPrefixAfter = durablePrefixSnapshot(
    modules,
    sameRunIntervened,
  );
  assert.deepEqual(sameRunResult, {
    kind: "traversal_cursor_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code: "scope_mismatch",
    message: "initial cursor must immediately extend the opened frame truth",
  });
  assert.equal(
    snapshotsEqual(modules, sameRunPrefixAfter, sameRunPrefixBefore),
    true,
  );
  assertNoSReferences(
    sameRunResult,
    sameRunEvent.event.eventId,
    "same-Run initial cursor control",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const interleavedPrefixBefore = durablePrefixSnapshot(
    modules,
    pair.interleaved,
  );
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
  const interleavedPrefixAfter = durablePrefixSnapshot(
    modules,
    pair.interleaved,
  );
  const interleavedPrefixUnchanged = snapshotsEqual(
    modules,
    interleavedPrefixAfter,
    interleavedPrefixBefore,
  );
  const desiredGreen =
    interleaved.kind === "traversal_cursor_admission" &&
    runEventsSince(pair.control, source.runR, beforeControl).length === 1 &&
    runEventsSince(pair.interleaved, source.runR, beforeInterleaved).length ===
      1;
  const characterizedCurrentRed =
    interleaved.kind === "traversal_cursor_admission_refusal" &&
    interleaved.disposition === "refused" &&
    interleaved.code === "scope_mismatch" &&
    interleaved.message ===
      "initial cursor must immediately extend the opened frame truth" &&
    runEventsSince(pair.control, source.runR, beforeControl).length === 1 &&
    runEventsSince(pair.interleaved, source.runR, beforeInterleaved).length ===
      0 &&
    interleavedPrefixUnchanged;
  assert.notEqual(desiredGreen, characterizedCurrentRed);
  assert.equal(desiredGreen || characterizedCurrentRed, true);
  const pairedTargetEquality = desiredGreen
    ? assertPairedRunSemanticEquality(
      modules,
      pair,
      source.runR,
      beforeControl,
      beforeInterleaved,
      "initial cursor",
    )
    : null;
  if (desiredGreen) {
    assert.deepEqual(
      withoutAdmissionEventRef(interleaved),
      withoutAdmissionEventRef(control),
    );
  }
  assertNoSReferences(interleaved, pair.s.event.eventId, "initial cursor result");
  return {
    caseId: "initial_cursor",
    control: control.kind,
    interleaved: interleaved.kind === "traversal_cursor_admission"
      ? interleaved.kind
      : `${interleaved.kind}:${interleaved.code}:${interleaved.message}`,
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
    pairedTargetEquality,
    decision: {
      desiredGreen,
      characterizedCurrentRed,
    },
    prefixAudit: {
      interleavedPrefixUnchanged,
      before: interleavedPrefixBefore,
      after: interleavedPrefixAfter,
    },
    sameRunControl: {
      eventKind: sameRunEvent.event.kind,
      eventRunId: sameRunEvent.event.runId,
      eventAdmitted: sameRunEvent.event.eventId.startsWith("event://"),
      result:
        `${sameRunResult.kind}:${sameRunResult.code}:${sameRunResult.message}`,
      prefixUnchanged: true,
    },
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
    source,
    source.publication,
    source.runR,
    routeEvent,
  );
  assert.ok(prepared.closureContract);
  const preparedSource = closePhysicalSource(prepared.store);
  assert.deepEqual(preparedSource.events, prepared.events);
  const pair = newPair(
    modules,
    preparedSource,
    source.runR,
    source.runS,
    mutation ? "refusal-causation" : "normal-closure",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const result = structuredClone(prepared.result);
  const judgment = structuredClone(prepared.judgment);
  const route = structuredClone(prepared.route);
  if (mutation) route.cCallRef = "c-call://s06/ax-f08/substituted";
  if (!mutation) {
    const staleStore = cloneStore(modules, preparedSource);
    const staleCoordinate = modules.eventStore.selectHeldEventStoreDurablePrefix(
      staleStore,
    );
    appendDisjointEvent(
      modules,
      staleStore,
      source.runS,
      "normal-closure/stale-prefix",
    );
    const postInterleave = durablePrefixSnapshot(modules, staleStore);
    const stale = modules.abg.admitClosure(
      staleStore,
      staleCoordinate,
      prepared.cCall,
      result,
      judgment,
      route,
      prepared.closureContract,
      runtimeBasis("normal-closure/stale-prefix/target"),
    );
    assert.equal(stale.kind, "closure_admission_refusal");
    assert.equal(stale.code, "stale_prefix");
    assert.equal(stale.failureEventRef, null);
    assert.equal(
      snapshotsEqual(
        modules,
        durablePrefixSnapshot(modules, staleStore),
        postInterleave,
      ),
      true,
      "stale root closure must append zero events and zero bytes",
    );
  }
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
  const controlPrefixBefore = durablePrefixSnapshot(modules, pair.control);
  const interleavedPrefixBefore = durablePrefixSnapshot(
    modules,
    pair.interleaved,
  );
  control = modules.abg.admitClosure(
    pair.control,
    modules.eventStore.selectHeldEventStoreDurablePrefix(pair.control),
    prepared.cCall,
    result,
    judgment,
    route,
    prepared.closureContract,
    targetBasis,
  );
  try {
    interleaved = modules.abg.admitClosure(
      pair.interleaved,
      modules.eventStore.selectHeldEventStoreDurablePrefix(pair.interleaved),
      prepared.cCall,
      result,
      judgment,
      route,
      prepared.closureContract,
      targetBasis,
    );
  } catch (error) {
    interleavedError = error;
  }
  const controlPrefixAfter = durablePrefixSnapshot(modules, pair.control);
  const interleavedPrefixAfter = durablePrefixSnapshot(
    modules,
    pair.interleaved,
  );
  const controlPrefixUnchanged = snapshotsEqual(
    modules,
    controlPrefixAfter,
    controlPrefixBefore,
  );
  const interleavedPrefixUnchanged = snapshotsEqual(
    modules,
    interleavedPrefixAfter,
    interleavedPrefixBefore,
  );
  let decision = null;
  if (mutation) {
    assert.equal(control.kind, "closure_admission_refusal");
    assert.equal(control.code, "runtime_basis_mismatch");
    assert.equal(interleaved?.kind, "closure_admission_refusal");
    assert.equal(interleaved?.code, "runtime_basis_mismatch");
    const controlDelta = runEventsSince(
      pair.control,
      source.runR,
      beforeControl,
    ).length;
    const interleavedDelta = runEventsSince(
      pair.interleaved,
      source.runR,
      beforeInterleaved,
    ).length;
    const desiredGreen =
      control.failureEventRef === null &&
      interleaved.failureEventRef === null &&
      controlDelta === 0 &&
      interleavedDelta === 0 &&
      controlPrefixUnchanged &&
      interleavedPrefixUnchanged &&
      modules.product.canonicalJson(control) ===
        modules.product.canonicalJson(interleaved);
    const characterizedCurrentRed =
      typeof control.failureEventRef === "string" &&
      typeof interleaved.failureEventRef === "string" &&
      controlDelta === 1 &&
      interleavedDelta === 1 &&
      !controlPrefixUnchanged &&
      !interleavedPrefixUnchanged;
    assert.notEqual(desiredGreen, characterizedCurrentRed);
    assert.equal(desiredGreen || characterizedCurrentRed, true);
    decision = { desiredGreen, characterizedCurrentRed };
  } else {
    assert.equal(control.kind, "closure_admission");
  }
  assert.equal(interleavedError, null);
  const pairedTargetEquality = assertPairedRunSemanticEquality(
    modules,
    pair,
    source.runR,
    beforeControl,
    beforeInterleaved,
    mutation ? "refusal causation" : "normal closure",
    !(mutation && decision.desiredGreen),
  );
  assert.deepEqual(
    withoutClosureEventRefs(interleaved),
    withoutClosureEventRefs(control),
  );
  const interleavedR = runEventsSince(
    pair.interleaved,
    source.runR,
    beforeInterleaved,
  );
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
    interleaved: mutation
      ? `${interleaved.kind}:${interleaved.code}:failure=${interleaved.failureEventRef !== null}`
      : interleaved.kind,
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
    pairedTargetEquality,
    decision,
    prefixAudit: mutation
      ? {
        controlPrefixUnchanged,
        interleavedPrefixUnchanged,
        controlBefore: controlPrefixBefore,
        controlAfter: controlPrefixAfter,
        interleavedBefore: interleavedPrefixBefore,
        interleavedAfter: interleavedPrefixAfter,
      }
      : null,
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
    source,
    source.publication,
    source.runR,
    routeEvent,
  );
  assert.ok(prepared.closureContract);
  assert.equal(prepared.closureContract.closureScope, "graph_call");
  const preparedSource = closePhysicalSource(prepared.store);
  assert.deepEqual(preparedSource.events, prepared.events);
  const pair = newPair(
    modules,
    preparedSource,
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
  const result = structuredClone(prepared.result);
  const judgment = structuredClone(prepared.judgment);
  const route = structuredClone(prepared.route);
  const staleStore = cloneStore(modules, preparedSource);
  const staleCoordinate = modules.eventStore.selectHeldEventStoreDurablePrefix(
    staleStore,
  );
  appendDisjointEvent(
    modules,
    staleStore,
    source.runS,
    "child-closure/stale-prefix",
  );
  const stalePostInterleave = durablePrefixSnapshot(modules, staleStore);
  const stale = modules.abg.admitChildClosure(
    staleStore,
    staleCoordinate,
    prepared.scope,
    prepared.cCall,
    result,
    judgment,
    route,
    prepared.closureContract,
    runtimeBasis("child-closure/stale-prefix/target"),
  );
  assert.equal(stale.kind, "child_closure_admission_refusal");
  assert.equal(stale.code, "stale_prefix");
  assert.equal(
    snapshotsEqual(
      modules,
      durablePrefixSnapshot(modules, staleStore),
      stalePostInterleave,
    ),
    true,
    "stale child closure must append zero events and zero bytes",
  );
  const control = modules.abg.admitChildClosure(
    pair.control,
    modules.eventStore.selectHeldEventStoreDurablePrefix(pair.control),
    prepared.scope,
    prepared.cCall,
    result,
    judgment,
    route,
    prepared.closureContract,
    targetBasis,
  );
  const interleaved = modules.abg.admitChildClosure(
    pair.interleaved,
    modules.eventStore.selectHeldEventStoreDurablePrefix(pair.interleaved),
    prepared.scope,
    prepared.cCall,
    result,
    judgment,
    route,
    prepared.closureContract,
    targetBasis,
  );
  assert.equal(control.kind, "child_closure_admission");
  const pairedTargetEquality = assertPairedRunSemanticEquality(
    modules,
    pair,
    source.runR,
    beforeControl,
    beforeInterleaved,
    "child closure",
  );
  assert.deepEqual(
    withoutClosureEventRefs(interleaved),
    withoutClosureEventRefs(control),
  );
  assertNoSReferences(interleaved, pair.s.event.eventId, "child closure result");
  return {
    caseId: "child_closure",
    control: control.kind,
    interleaved: interleaved.kind,
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
    pairedTargetEquality,
    ...disjointEventEvidence(pair),
  };
}

async function responseFixture(modules, source) {
  const prepared = await prepareResponseOperation(modules, source, "fh-response");
  const preparedSource = closePhysicalSource(prepared.store);
  const pair = newPair(
    modules,
    preparedSource,
    source.runR,
    source.runS,
    "fh-response",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = continuationOwnerBasis(
    prepared.operationAdmissionBasis,
  );
  const controlOwner = reopenCurrentPrefix(modules, pair.control);
  const interleavedOwner = reopenCurrentPrefix(modules, pair.interleaved);
  pair.control = controlOwner.store;
  pair.interleaved = interleavedOwner.store;
  const controlCommitted = modules.abg.commitFhInteractionResponseAtExpectedPrefix(
    pair.control,
    controlOwner.prefix,
    prepared.rootInvocation,
    prepared.continuation,
    "approve",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.operationAdmissionBasis,
    prepared.continuation.responseContractRef,
    prepared.response,
    targetBasis,
  );
  const interleavedCommitted =
    modules.abg.commitFhInteractionResponseAtExpectedPrefix(
      pair.interleaved,
      interleavedOwner.prefix,
      prepared.rootInvocation,
      prepared.continuation,
      "approve",
      prepared.rootInvocation.actorRef,
      prepared.continuation.actorCapabilityRef,
      prepared.operationAdmissionBasis,
      prepared.continuation.responseContractRef,
      prepared.response,
      targetBasis,
    );
  const control = controlCommitted.response;
  const interleaved = interleavedCommitted.response;
  assert.equal(control.kind, "fh_interaction_response_admission");
  assert.equal(interleaved.kind, control.kind);
  const pairedTargetEquality = assertPairedRunSemanticEquality(
    modules,
    pair,
    source.runR,
    beforeControl,
    beforeInterleaved,
    "F_H response",
  );
  assert.deepEqual(
    withoutAdmissionEventRef(interleaved),
    withoutAdmissionEventRef(control),
  );
  assertNoSReferences(
    interleaved,
    pair.s.event.eventId,
    "F_H response result",
  );
  assertExactDuplicateFhInvocationTruth(
    modules,
    modules.abg.selectValidatedRuntimeEventPrefix(
      pair.interleaved.readAll(),
    ),
    prepared.operation.invocationRef,
    "abg.operation.interaction.respond",
    interleavedCommitted.operation.admissionEventRef,
    interleaved.admissionEventRef,
  );
  const responsePairEvents = pair.control.readAll();
  const laterS = modules.eventStore.projectRuntimeEventFromValidatedHistory(
    responsePairEvents,
    runtimeEventCandidate(pair.s.event),
  );
  const laterSPrefix = modules.abg.selectValidatedRuntimeEventPrefix(
    Object.freeze([...responsePairEvents, laterS]),
  );
  assertExactDuplicateFhInvocationTruth(
    modules,
    laterSPrefix,
    prepared.operation.invocationRef,
    "abg.operation.interaction.respond",
    controlCommitted.operation.admissionEventRef,
    control.admissionEventRef,
  );

  const responsePublicEvent = responsePairEvents.find((event) =>
    event.eventId === controlCommitted.operation.admissionEventRef
  );
  const responseOwnerEvent = responsePairEvents.find((event) =>
    event.eventId === control.admissionEventRef
  );
  assert.ok(responsePublicEvent);
  assert.ok(responseOwnerEvent);
  const beforeResponsePublic = Object.freeze(responsePairEvents.slice(
    0,
    responsePublicEvent.admissionOrdinal - 1,
  ));
  const rebuiltResponsePublic =
    modules.eventStore.projectRuntimeEventFromValidatedHistory(
      beforeResponsePublic,
      runtimeEventCandidate(responsePublicEvent),
    );
  assert.equal(rebuiltResponsePublic.eventId, responsePublicEvent.eventId);
  const interposedS = modules.eventStore.projectRuntimeEventFromValidatedHistory(
    Object.freeze([...beforeResponsePublic, rebuiltResponsePublic]),
    runtimeEventCandidate(pair.s.event),
  );
  const interposedResponseOwner =
    modules.eventStore.projectRuntimeEventFromValidatedHistory(
      Object.freeze([
        ...beforeResponsePublic,
        rebuiltResponsePublic,
        interposedS,
      ]),
      runtimeEventCandidate(responseOwnerEvent),
    );
  const interposedTruth =
    modules.abg.projectEffectfulPublicInvocationTruthAtPrefix(
      modules.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
        ...beforeResponsePublic,
        rebuiltResponsePublic,
        interposedS,
        interposedResponseOwner,
      ])),
      prepared.operation.invocationRef,
    );
  assert.equal(interposedTruth.disposition, "invalid_history");
  assert.equal(interposedTruth.code, "invocation_pair_invalid");

  const forgedOwnerCandidate = runtimeEventCandidate(responseOwnerEvent);
  forgedOwnerCandidate.payload.publicOperationEventRef =
    "event://s06/ax-f08/forged-response-operation";
  const forgedOwner = modules.eventStore.projectRuntimeEventFromValidatedHistory(
    Object.freeze([...responsePairEvents, laterS]),
    forgedOwnerCandidate,
  );
  const forgedTruth = modules.abg.projectEffectfulPublicInvocationTruthAtPrefix(
    modules.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
      ...responsePairEvents,
      laterS,
      forgedOwner,
    ])),
    "invocation://s06/ax-f08/forged-response-query",
  );
  assert.equal(forgedTruth.disposition, "invalid_history");
  assert.equal(forgedTruth.code, "invocation_pair_invalid");
  return {
    caseId: "fh_response",
    control: control.kind,
    interleaved: interleaved.kind,
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
      operationInvocationRef: prepared.operation.invocationRef,
      responseContractRef: prepared.continuation.responseContractRef,
      responseDigest: modules.product.sha256Canonical(prepared.response),
      targetBasis,
    }),
    pairedTargetEquality,
    ...disjointEventEvidence(pair),
  };
}

async function continuationReconstructionFixture(modules, source) {
  const prepared = await prepareContinueOperation(
    modules,
    source,
    "continuation-reconstruction",
  );
  const preparedSource = closePhysicalSource(prepared.store);
  const pair = newPair(
    modules,
    preparedSource,
    source.runR,
    source.runS,
    "continuation-reconstruction",
  );
  const controlOperation = modules.abg.prepareContinuationPublicOperation(
    modules.abg.selectValidatedRuntimeEventPrefix(pair.control.readAll()),
    prepared.rootInvocation,
    "abg.operation.run.continue",
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.continueOperationBasis,
  );
  const interleavedOperation = modules.abg.prepareContinuationPublicOperation(
    modules.abg.selectValidatedRuntimeEventPrefix(pair.interleaved.readAll()),
    prepared.rootInvocation,
    "abg.operation.run.continue",
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.continueOperationBasis,
  );
  assert.equal(
    controlOperation.kind,
    "prepared_continuation_public_operation",
    JSON.stringify(controlOperation),
  );
  assert.equal(
    interleavedOperation.kind,
    "prepared_continuation_public_operation",
    JSON.stringify(interleavedOperation),
  );
  const control = modules.abg.rehydrateFhContinuationAtPrefix(
    controlOperation.projectedPrefix,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    controlOperation.operation,
  );
  const interleaved = modules.abg.rehydrateFhContinuationAtPrefix(
    interleavedOperation.projectedPrefix,
    prepared.respondedContinuation,
    expectedContinuationBasis(source),
    interleavedOperation.operation,
  );
  assert.ok(control);
  assert.deepEqual(interleaved, control);
  assertNoSReferences(interleaved, pair.s.event.eventId, "continuation result");
  return {
    caseId: "continuation_reconstruction",
    control: "rehydrated",
    interleaved: "rehydrated",
    controlREventDelta: 0,
    interleavedREventDelta: 0,
    inputProof: pairedInputProof(modules, {
      continuationRef: source.rContinuationRef,
      operationInvocationRef: prepared.continueOperation.invocationRef,
      expectedInstallId: source.rAuthority.install.installId,
      expectedWorkspaceBindingId: source.rAuthority.workspaceBinding.bindingId,
      expectedWorkspaceBindingDigest:
        source.rAuthority.workspaceBinding.bindingDigest,
      expectedCatalogViewId: prepared.rootInvocation.catalogViewId,
      expectedCatalogViewDigest: source.rAuthority.catalogView.viewDigest,
      expectedGraphRef: source.rAuthority.heldGraph.materializationRef,
      expectedGraphDigest: source.rAuthority.heldGraph.materializationDigest,
      expectedClosureContractDigest: modules.product.sha256Canonical(
        source.rAuthority.heldClosureContract,
      ),
    }),
    pairedTargetEquality: {
      equalRehydration: true,
    },
    ...disjointEventEvidence(pair),
  };
}

async function resumeFixture(modules, source) {
  const prepared = await prepareContinueOperation(modules, source, "fh-resume");
  const inputs = prepareResumeInputs(modules, source, prepared);
  const preparedSource = closePhysicalSource(prepared.store);
  const pair = newPair(
    modules,
    preparedSource,
    source.runR,
    source.runS,
    "fh-resume",
  );
  const beforeControl = pair.control.readAll().length;
  const beforeInterleaved = pair.interleaved.readAll().length;
  const targetBasis = continuationOwnerBasis(
    prepared.continueOperationBasis,
  );
  const controlOwner = reopenCurrentPrefix(modules, pair.control);
  const interleavedOwner = reopenCurrentPrefix(modules, pair.interleaved);
  pair.control = controlOwner.store;
  pair.interleaved = interleavedOwner.store;
  const controlCommitted = modules.abg.commitFhInteractionResumeAtExpectedPrefix(
    pair.control,
    controlOwner.prefix,
    prepared.rootInvocation,
    prepared.respondedContinuation,
    "current_intent",
    prepared.rootInvocation.actorRef,
    prepared.continuation.actorCapabilityRef,
    prepared.continueOperationBasis,
    inputs.rehydrated.executionBasis,
    source.rAuthority.heldClosureContract,
    inputs.successorInput,
    inputs.successorCursor,
    targetBasis,
  );
  const interleavedCommitted =
    modules.abg.commitFhInteractionResumeAtExpectedPrefix(
      pair.interleaved,
      interleavedOwner.prefix,
      prepared.rootInvocation,
      prepared.respondedContinuation,
      "current_intent",
      prepared.rootInvocation.actorRef,
      prepared.continuation.actorCapabilityRef,
      prepared.continueOperationBasis,
      inputs.rehydrated.executionBasis,
      source.rAuthority.heldClosureContract,
      inputs.successorInput,
      inputs.successorCursor,
      targetBasis,
    );
  const control = controlCommitted.resume;
  const interleaved = interleavedCommitted.resume;
  assert.equal(control.kind, "fh_interaction_resume_admission");
  assert.equal(interleaved.kind, control.kind);
  const pairedTargetEquality = assertPairedRunSemanticEquality(
    modules,
    pair,
    source.runR,
    beforeControl,
    beforeInterleaved,
    "F_H resume",
  );
  assert.deepEqual(
    withoutAdmissionEventRef(interleaved),
    withoutAdmissionEventRef(control),
  );
  assertNoSReferences(
    interleaved,
    pair.s.event.eventId,
    "F_H resume result",
  );
  assertExactDuplicateFhInvocationTruth(
    modules,
    modules.abg.selectValidatedRuntimeEventPrefix(
      pair.interleaved.readAll(),
    ),
    prepared.continueOperation.invocationRef,
    "abg.operation.run.continue",
    interleavedCommitted.operation.admissionEventRef,
    interleaved.admissionEventRef,
  );
  const resumePairEvents = pair.control.readAll();
  const laterS = modules.eventStore.projectRuntimeEventFromValidatedHistory(
    resumePairEvents,
    runtimeEventCandidate(pair.s.event),
  );
  assertExactDuplicateFhInvocationTruth(
    modules,
    modules.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
      ...resumePairEvents,
      laterS,
    ])),
    prepared.continueOperation.invocationRef,
    "abg.operation.run.continue",
    controlCommitted.operation.admissionEventRef,
    control.admissionEventRef,
  );
  return {
    caseId: "fh_resume",
    control: control.kind,
    interleaved: interleaved.kind,
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
      operationInvocationRef: prepared.continueOperation.invocationRef,
      executionBasisRef: inputs.rehydrated.executionBasis.basisRef,
      executionBasisDigest: inputs.rehydrated.executionBasis.basisDigest,
      closureContractDigest: modules.product.sha256Canonical(
        source.rAuthority.heldClosureContract,
      ),
      successorInputRef: inputs.successorInput.inputRef,
      successorInputDigest: inputs.successorInput.inputDigest,
      successorCursorRef: inputs.successorCursor.cursorRef,
      successorCursorDigest: inputs.successorCursor.cursorDigest,
      controlDurablePrefixDigest: controlOwner.prefix.prefixDigest,
      interleavedDurablePrefixDigest: interleavedOwner.prefix.prefixDigest,
      targetBasis,
    }),
    pairedTargetEquality,
    terminalCarrierControl: inputs.terminalCarrierControl,
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
  const {
    graph: interactionGraph,
    graphFunction,
  } = graphBasis(
    modules,
    prepared.store,
    source.publication,
    inputs.rehydrated.executionBasis,
  );
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
      graphFunction,
      result: inputs.rehydrated.heldInteraction.result,
      judgment: inputs.rehydrated.heldInteraction.judgment,
      resume,
    },
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
  const preparedSource = closePhysicalSource(prepared.store);
  const pair = newPair(
    modules,
    preparedSource,
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
  const controlOpened = oneEvent(
    pair.control,
    (event) =>
      event.kind === "fh_interaction_opened" &&
      event.aggregateId === source.rContinuationRef,
    "interaction closure control opening",
  );
  const interleavedOpened = oneEvent(
    pair.interleaved,
    (event) =>
      event.kind === "fh_interaction_opened" &&
      event.aggregateId === source.rContinuationRef,
    "interaction closure interleaved opening",
  );
  const controlInteraction = modules.abg.rehydrateAdmittedCCallState(
    pair.control,
    controlOpened.payload.cCall,
    controlOpened.payload.pendingResult,
    controlOpened.payload.pendingJudgment,
  );
  const interleavedInteraction = modules.abg.rehydrateAdmittedCCallState(
    pair.interleaved,
    interleavedOpened.payload.cCall,
    interleavedOpened.payload.pendingResult,
    interleavedOpened.payload.pendingJudgment,
  );
  assert.ok(
    controlInteraction,
    "control interaction closure must owner-rehydrate admitted CCall state",
  );
  assert.ok(
    interleavedInteraction,
    "interleaved interaction closure must owner-rehydrate admitted CCall state",
  );
  assert.notStrictEqual(
    interleavedInteraction.cCall,
    controlInteraction.cCall,
    "paired stores must not share one retained branded CCall",
  );
  assert.deepEqual(interleavedInteraction, controlInteraction);
  const controlRoute = structuredClone(route);
  const interleavedRoute = structuredClone(route);
  const staleStore = cloneStore(modules, preparedSource);
  const staleCoordinate = modules.eventStore.selectHeldEventStoreDurablePrefix(
    staleStore,
  );
  appendDisjointEvent(
    modules,
    staleStore,
    source.runS,
    "interaction-closure/stale-prefix",
  );
  const stalePostInterleave = durablePrefixSnapshot(modules, staleStore);
  const staleOpened = oneEvent(
    staleStore,
    (event) =>
      event.kind === "fh_interaction_opened" &&
      event.aggregateId === source.rContinuationRef,
    "interaction closure stale opening",
  );
  const staleInteraction = modules.abg.rehydrateAdmittedCCallState(
    staleStore,
    staleOpened.payload.cCall,
    staleOpened.payload.pendingResult,
    staleOpened.payload.pendingJudgment,
  );
  assert.ok(staleInteraction);
  const stale = modules.abg.admitInteractionClosure(
    staleStore,
    staleCoordinate,
    staleInteraction.cCall,
    staleInteraction.result,
    staleInteraction.judgment,
    resume,
    structuredClone(route),
    source.rAuthority.heldClosureContract,
    runtimeBasis("interaction-closure/stale-prefix/target"),
  );
  assert.equal(stale.kind, "closure_admission_refusal");
  assert.equal(stale.code, "stale_prefix");
  assert.equal(stale.failureEventRef, null);
  assert.equal(
    snapshotsEqual(
      modules,
      durablePrefixSnapshot(modules, staleStore),
      stalePostInterleave,
    ),
    true,
    "stale interaction closure must append zero events and zero bytes",
  );
  const control = modules.abg.admitInteractionClosure(
    pair.control,
    modules.eventStore.selectHeldEventStoreDurablePrefix(pair.control),
    controlInteraction.cCall,
    controlInteraction.result,
    controlInteraction.judgment,
    resume,
    controlRoute,
    source.rAuthority.heldClosureContract,
    targetBasis,
  );
  let interleaved;
  let error = null;
  try {
    interleaved = modules.abg.admitInteractionClosure(
      pair.interleaved,
      modules.eventStore.selectHeldEventStoreDurablePrefix(pair.interleaved),
      interleavedInteraction.cCall,
      interleavedInteraction.result,
      interleavedInteraction.judgment,
      resume,
      interleavedRoute,
      source.rAuthority.heldClosureContract,
      targetBasis,
    );
  } catch (caught) {
    error = caught;
  }
  assert.equal(control.kind, "closure_admission", JSON.stringify(control));
  assert.equal(error, null);
  const pairedTargetEquality = assertPairedRunSemanticEquality(
    modules,
    pair,
    source.runR,
    beforeControl,
    beforeInterleaved,
    "interaction closure",
  );
  assert.deepEqual(
    withoutClosureEventRefs(interleaved),
    withoutClosureEventRefs(control),
  );
  assertNoSReferences(
    { interleaved: interleaved ?? null },
    pair.s.event.eventId,
    "interaction closure result",
  );
  return {
    caseId: "interaction_closure",
    control: control.kind,
    interleaved: interleaved.kind,
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
      cCallRef: controlInteraction.cCall.cCallRef,
      resultRef: controlInteraction.result.resultRef,
      judgmentRef: controlInteraction.judgment.judgmentRef,
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
    pairedTargetEquality,
    terminalCarrierControl: inputs.terminalCarrierControl,
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
      pairedTargetEquality: entry.pairedTargetEquality ?? null,
      terminalCarrierControl: entry.terminalCarrierControl ?? null,
      decision: entry.decision ?? null,
      prefixAudit: entry.prefixAudit === undefined || entry.prefixAudit === null
        ? null
        : {
          controlPrefixUnchanged:
            entry.prefixAudit.controlPrefixUnchanged ?? null,
          interleavedPrefixUnchanged:
            entry.prefixAudit.interleavedPrefixUnchanged,
        },
    }]),
  );
}

export async function runAxF08({ packageRoot, harness }) {
  const modules = await installedModules(harness);
  const terminalMini = await prepareTerminalInteractionMini(harness, packageRoot);
  const [helloSource, childSource, interactionSource] = await Promise.all([
    rootRunSource(harness, modules, "s06-ax-f08-hello", {
      programRef: HELLO_PROGRAM_REF,
      catalogHandle: HELLO_GRAPH_REF,
      input: {
        kind: "hello_world_input",
        schemaVersion: "5.0.0",
        subject: "R",
      },
    }, terminalMini),
    rootRunSource(harness, modules, "s06-ax-f08-child", {
      programRef: RECURSION_PROGRAM_REF,
      catalogHandle: RECURSION_GRAPH_REF,
      input: recursionInput(3),
    }, terminalMini),
    miniInteractionSource(harness, modules, terminalMini),
  ]);
  const freshProcessOutcome = await freshProcessOutcomeEquality(
    modules,
    helloSource,
    packageRoot,
    harness,
  );

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
  const stableExpected = {
    continuation_reconstruction: "rehydrated",
    fh_response: "fh_interaction_response_admission",
    fh_resume: "fh_interaction_resume_admission",
    normal_closure: "closure_admission",
    interaction_closure: "closure_admission",
    child_closure: "child_closure_admission",
  };
  const stableREventDeltas = {
    continuation_reconstruction: 0,
    fh_response: 1,
    fh_resume: 1,
    normal_closure: 4,
    interaction_closure: 4,
    child_closure: 3,
  };
  const desiredTargetSignature = {
    initial_cursor: {
      control: "traversal_cursor_admission",
      interleaved: "traversal_cursor_admission",
      controlREventDelta: 1,
      interleavedREventDelta: 1,
      equalRunRSemanticsWithOnlyPhysicalShift: true,
    },
    refusal_causation: {
      control:
        "closure_admission_refusal:runtime_basis_mismatch:failure=false",
      interleaved:
        "closure_admission_refusal:runtime_basis_mismatch:failure=false",
      controlREventDelta: 0,
      interleavedREventDelta: 0,
      bytesAndPrefixUnchanged: true,
    },
  };
  const characterizedCurrentRedSignature = {
    initial_cursor: {
      control: "traversal_cursor_admission",
      interleaved:
        "traversal_cursor_admission_refusal:scope_mismatch:initial cursor must immediately extend the opened frame truth",
      controlREventDelta: 1,
      interleavedREventDelta: 0,
    },
    refusal_causation: {
      control:
        "closure_admission_refusal:runtime_basis_mismatch:failure=true",
      interleaved:
        "closure_admission_refusal:runtime_basis_mismatch:failure=true",
      controlREventDelta: 1,
      interleavedREventDelta: 1,
    },
  };
  const stableCases = cases.filter((entry) =>
    Object.hasOwn(stableExpected, entry.caseId)
  );
  assert.equal(stableCases.length, 6);
  for (const entry of stableCases) {
    assert.equal(entry.interleaved, stableExpected[entry.caseId]);
    assert.equal(
      entry.interleavedREventDelta,
      stableREventDeltas[entry.caseId],
    );
  }
  const initialCursor = cases[0];
  const refusalCausation = cases[7];
  const preservedGreen =
    initialCursor.decision.desiredGreen === true &&
    refusalCausation.decision.desiredGreen === true;
  const confirmedRed =
    initialCursor.decision.characterizedCurrentRed === true &&
    refusalCausation.decision.characterizedCurrentRed === true;
  assert.notEqual(preservedGreen, confirmedRed);
  assert.equal(preservedGreen || confirmedRed, true);
  const terminalCarrierControls = cases
    .map((entry) => entry.terminalCarrierControl)
    .filter((entry) => entry !== undefined);
  assert.equal(terminalCarrierControls.length, 2);
  for (const control of terminalCarrierControls) {
    assert.deepEqual(control, {
      terminalStepKind: "complete_term",
      successorInputContractRef: null,
      successorInputValueKind: null,
      responseInputIdentityExact: true,
      halfNullPermutationsRefusedBeforeEffects: true,
    });
  }
  const expected = {
    stable: stableExpected,
    desired: desiredTargetSignature,
    characterizedCurrentRed: characterizedCurrentRedSignature,
  };

  const result = {
    relationId: "AX-F08",
    disposition: confirmedRed ? "confirmed_red" : "preserved_green",
    claim:
      "a valid event for disjoint run S does not alter admission, reconstruction, closure, or refusal truth for run R",
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
      "independent exact durable stores plus two fresh installed Node processes reconstruct the exact owner-admitted prefix and derive equal CCall and route projections",
    mutation: {
      kind: "single_disjoint_run_event_interleave",
      pairedFixtureCount: 8,
      targetRun: "R",
      disjointRun: "S",
      eventKind: "runtime_failure_observed",
    },
    oracle: {
      exactRunRDispositionEquality: true,
      exactRunRApplicableEventBodyEquality: true,
      globalAdmissionCoordinateShiftIsExplicit: true,
      exactRunRReplayEquality: true,
      noRunRCausalReferenceMayNameS: true,
      invalidEnvelopeOrPrerequisiteFailureIsFixtureFailure: true,
      terminalCompleteSuccessorCarrierIsJointlyNull: true,
      halfNullSuccessorCarrierIsRefusedBeforeEffects: true,
    },
    expectedBaselineSignature: expected,
    observedSignature: observed,
    cases: cases.map((entry) => {
      const targetExpected = entry.caseId === "initial_cursor"
        ? {
          desired: desiredTargetSignature.initial_cursor,
          characterizedCurrentRed:
            characterizedCurrentRedSignature.initial_cursor,
        }
        : entry.caseId === "refusal_causation"
        ? {
          desired: desiredTargetSignature.refusal_causation,
          characterizedCurrentRed:
            characterizedCurrentRedSignature.refusal_causation,
        }
        : null;
      return caseRecord(
        entry.caseId,
        targetExpected ?? stableExpected[entry.caseId],
        observed[entry.caseId],
        targetExpected === null
          ? entry.interleaved === stableExpected[entry.caseId] &&
            entry.interleavedREventDelta ===
              stableREventDeltas[entry.caseId]
          : entry.decision.desiredGreen !==
            entry.decision.characterizedCurrentRed,
      );
    }),
    maskControls: [
      passedControl("exact_eight_fixture_set", cases.map((entry) => entry.caseId)),
      passedControl("historical_red_and_green_oracles_are_distinct", {
        preservedGreen,
        confirmedRed,
        decisionExact: preservedGreen !== confirmedRed,
      }),
      passedControl(
        "same_run_intervening_truth_is_not_ignored",
        initialCursor.sameRunControl,
      ),
      passedControl(
        "terminal_complete_pair_is_exact_and_half_null_is_fail_closed",
        terminalCarrierControls,
      ),
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
        "interleaved_target_matches_control_at_its_applicable_coordinate",
        cases.map((entry) => ({
          caseId: entry.caseId,
          delta: entry.interleavedREventDelta,
          pairedTargetEquality: entry.pairedTargetEquality ?? null,
        })),
      ),
      passedControl(
        "fresh_process_result_judgment_route_projection_equality",
        freshProcessOutcome,
      ),
    ],
  };
  for (const entry of modules.ephemeralStores) {
    entry.store.closeDurableLog();
    await rm(entry.eventLogPath, { force: true });
  }
  return result;
}
