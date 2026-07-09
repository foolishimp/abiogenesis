// T-217 Phase 1 S2 — REQ-R-ABG3-WITNESS-005/-006.
// Per-segment substrate stamps on resume (mixed-substrate decomposition;
// segment windows close the S1 review F3 seam) and operator lifecycle as
// actor-attributed F_H events behind admitted routes.
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructDeclarationRepriceAdmittedEvent,
  constructRunSegmentOpenedEvent,
  constructRunStoppedEvent,
  deriveFrozenLawPredicate,
  deriveGoverningDeclarationSet,
  deriveRunSegments,
  nextRunSegmentIndex
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  admitGtlLibraryEntryDeclaration
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js";
import {
  admitDeclarationReprice,
  admitRunResumed,
  admitRunStopped,
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig,
  runEngineStart
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

function segmentStamp(overrides = {}) {
  return constructRunSegmentOpenedEvent({
    basisId: "basis://t217/s2",
    runId: "run://t217/s2",
    workKey: "wk://t217/s2",
    segmentIndex: 1,
    workerId: "worker://t217",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node",
    declarationSetDigest: "digest://declaration-set/v1",
    declarationCount: 1,
    ...overrides
  });
}

function t217Declaration(contentMarker, graphFunctionRef) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t217/s2/witness-subject",
    entryRef: "registry-entry://t217/s2/witness-subject",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.s2",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef,
    interfaceRef: "interface://t217/s2/witness-subject",
    sourceContractRef: "contract://t217/s2/source",
    targetContractRef: "contract://t217/s2/target",
    contextRefs: ["context://t217/s2"],
    authorityRefs: ["authority://t217/s2/abg-runtime"],
    overlayRefs: ["overlay://t217/s2/witness-subject"],
    provenanceRefs: ["provenance://t217/s2"],
    readinessRefs: ["readiness://t217/s2"],
    proofRefs: [`proof://t217/s2/${contentMarker}`],
    policyRefs: ["policy://t217/s2"],
    declarationSourceRefs: ["gtl://module/t217/s2"]
  });
}

function t217StartupConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t217/s2",
    productNamespace: "t217.s2",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    enabledLibraryRefs: [
      "registry-entry://t217/s2/witness-subject",
      "gtl-declaration://t217/s2/witness-subject",
      "gtl://module/t217/s2"
    ],
    overlayRefs: ["overlay://t217/s2/witness-subject"],
    pluginRefs: ["plugin://t217/s2/fp-worker"],
    readinessRefs: ["readiness://t217/s2"],
    proofRefs: ["proof://t217/s2"],
    policyRefs: ["policy://t217/s2"],
    configSourceRefs: ["config://t217/s2"]
  });
}

function startRequest(input, context, runtimeEvents, sink, declaration, correlationId) {
  return {
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents,
    eventSink: sink,
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [declaration],
      correlationId
    }
  };
}

test("T-217 S2 c1: segment stamp admission — self-certified segmentRef, index law, substrate fields as authored", () => {
  const valid = segmentStamp();
  assertRuntimeEvent(valid);
  assert.match(valid.segmentRef, /^run-segment:/u);

  assert.throws(
    () => assertRuntimeEvent({ ...valid, segmentRef: "run-segment:forged" }),
    /segmentRef must be the content-derived identity/u
  );
  // identity binds the substrate content: silently changing the digest set
  // without re-minting the ref is inadmissible
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...valid,
        declarationSetDigest: "digest://declaration-set/other"
      }),
    /segmentRef must be the content-derived identity/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, buildId: "" }),
    /buildId/u
  );
  const forgedIndexZero = constructRunSegmentOpenedEvent({
    basisId: "basis://t217/s2",
    runId: null,
    workKey: null,
    segmentIndex: 0,
    workerId: "worker://t217",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node",
    declarationSetDigest: "digest://declaration-set/v1",
    declarationCount: 0
  });
  assert.throws(
    () => assertRuntimeEvent(forgedIndexZero),
    /segmentIndex must be >= 1/u
  );
});

test("T-217 S2 c2: lifecycle admission — actor attribution mandatory, stop reason is closed vocabulary", () => {
  const stopped = constructRunStoppedEvent({
    basisId: "basis://t217/s2",
    runId: null,
    workKey: null,
    operatorActorRef: "operator://jim",
    reasonKind: "operator_stop",
    reasonDetail: "campaign checkpoint"
  });
  assertRuntimeEvent(stopped);
  assert.throws(
    () => assertRuntimeEvent({ ...stopped, operatorActorRef: "" }),
    /operatorActorRef/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...stopped, reasonKind: "felt_like_it" }),
    /reasonKind/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...stopped, reasonDetail: "" }),
    /reasonDetail/u
  );
});

test("T-217 S2 c3: operator lifecycle routes admit canonical actor-attributed events", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const sunk = [];
  const resumed = admitRunResumed({
    basis,
    runtimeEvents: [],
    eventSink: (event) => sunk.push(event),
    operatorActorRef: "operator://jim",
    reasonKind: "operator_resume",
    reasonDetail: "continue campaign after fix"
  });
  assert.equal(resumed.kind, "run_resumed_admission_result");
  assert.equal(resumed.lifecycleEvent.reasonKind, "operator_resume");
  // S2 review P1: the typed-reason law covers resume, not just stop
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...resumed.lifecycleEvent,
        reasonKind: "felt_like_it"
      }),
    /reasonKind/u
  );
  const stopped = admitRunStopped({
    basis,
    runtimeEvents: resumed.replayEvents,
    eventSink: (event) => sunk.push(event),
    operatorActorRef: "operator://jim",
    reasonKind: "operator_stop",
    reasonDetail: "handing back to F_H seat"
  });
  assert.equal(stopped.kind, "run_stopped_admission_result");
  const kinds = sunk.map((event) => event.kind);
  assert.ok(kinds.includes("run_resumed"));
  assert.ok(kinds.includes("run_stopped"));
  for (const event of sunk) {
    assert.ok(event.eventId, "lifecycle acts are canonical replay truth");
  }
  const stopEvent = sunk.find((event) => event.kind === "run_stopped");
  assert.equal(stopEvent.operatorActorRef, "operator://jim");
  assert.equal(stopEvent.reasonKind, "operator_stop");
});

test("T-217 S2 c4: fresh start does not stamp; each resume stamps; a lawful substrate change decomposes per segment with per-segment frozen-law", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  // run 1: fresh start — no segment stamp (substrate witnessed by startup admission)
  const runOneEvents = [];
  runEngineStart(
    startRequest(
      input,
      context,
      [],
      (event) => runOneEvents.push(event),
      t217Declaration("content-v1", executive.id),
      "correlation://t217/s2/run1"
    )
  );
  assert.equal(
    runOneEvents.filter((event) => event.kind === "run_segment_opened").length,
    0,
    "a fresh start is not a resumed segment"
  );
  const admittedV1 = runOneEvents.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  assert.ok(admittedV1);

  // run 2: resume with the SAME substrate — stamps segment 1
  const runTwoEvents = [];
  runEngineStart(
    startRequest(
      input,
      context,
      [...runOneEvents],
      (event) => runTwoEvents.push(event),
      t217Declaration("content-v1", executive.id),
      "correlation://t217/s2/run2"
    )
  );
  const stampTwo = runTwoEvents.find(
    (event) => event.kind === "run_segment_opened"
  );
  assert.ok(stampTwo, "a resumed invocation stamps its segment");
  assert.equal(stampTwo.segmentIndex, 1);
  assert.equal(stampTwo.declarationCount, 1);
  assert.equal(stampTwo.buildId, "build://typescript");

  // reprice the declaration lawfully, then resume with the changed substrate
  const expectedV2 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v2", executive.id),
    correlationId: "correlation://t217/s2/expected-v2"
  });
  const basisAdmitted = runOneEvents.find(
    (event) => event.kind === "basis_admitted"
  );
  const [canonicalReprice] = emit(
    constructDeclarationRepriceAdmittedEvent({
      basisId: basisAdmitted.basisId,
      runId: basisAdmitted.runId,
      workKey: basisAdmitted.workKey,
      declarationRef: admittedV1.declarationRef,
      beforeDigest: admittedV1.declarationDigest,
      afterDigest: expectedV2.declarationDigest,
      changeClass: "requirement_reprice",
      owningTicketRef: "ticket://T-217",
      operatorActorRef: "operator://jim",
      reason: "ratified substrate change between segments"
    }),
    () => {}
  );
  assert.ok(canonicalReprice.eventId);
  const priorReplay = [...runOneEvents, ...runTwoEvents, canonicalReprice];

  const runThreeEvents = [];
  const resumed = runEngineStart(
    startRequest(
      input,
      context,
      priorReplay,
      (event) => runThreeEvents.push(event),
      t217Declaration("content-v2", executive.id),
      "correlation://t217/s2/run3"
    )
  );
  const blockedByGuard =
    resumed.transition.kind === "terminal" &&
    resumed.transition.terminalKind === "gap_stop" &&
    /declaration_reprice_required|declaration_identity_conflict/u.test(
      resumed.transition.reason ?? ""
    );
  assert.equal(blockedByGuard, false, "covered reprice must pass the guard");
  const stampThree = runThreeEvents.find(
    (event) => event.kind === "run_segment_opened"
  );
  assert.ok(stampThree);
  assert.equal(stampThree.segmentIndex, 2, "replay-global max+1 numbering");
  assert.notEqual(
    stampThree.declarationSetDigest,
    stampTwo.declarationSetDigest,
    "the mixed-substrate run decomposes per segment: the stamps differ"
  );

  // WITNESS-004 + F3 seam: per-segment frozen-law is mechanical
  const fullReplay = [...priorReplay, ...runThreeEvents];
  const segments = deriveRunSegments(fullReplay);
  assert.equal(segments.length, 2);
  const [segmentOne, segmentTwo] = segments;
  assert.equal(
    segmentOne.frozenLaw.frozenLaw,
    false,
    "the reprice falls in segment 1's window — that span is not frozen-law"
  );
  assert.deepEqual(segmentOne.frozenLaw.repriceRefs, [canonicalReprice.repriceRef]);
  assert.equal(
    segmentTwo.frozenLaw.frozenLaw,
    true,
    "the resumed proving span ran under stable law — mechanically frozen"
  );
  // whole-record predicate stays honest: the run as a whole is not frozen
  assert.equal(deriveFrozenLawPredicate(fullReplay).frozenLaw, false);
});

test("T-217 S2 c5: governing-set digest law and segment index law are one authority", () => {
  const admitted = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v1", "graph-function://t217/s2/unit"),
    correlationId: "correlation://t217/s2/c5"
  });
  const setOne = deriveGoverningDeclarationSet([admitted]);
  const setAgain = deriveGoverningDeclarationSet([admitted, admitted]);
  assert.equal(setOne.declarationCount, 1);
  assert.equal(
    setAgain.declarationCount,
    1,
    "duplicate same-digest rows collapse — the set law, not row count"
  );
  assert.equal(setOne.declarationSetDigest, setAgain.declarationSetDigest);
  const empty = deriveGoverningDeclarationSet([]);
  assert.equal(empty.declarationCount, 0);
  assert.notEqual(empty.declarationSetDigest, setOne.declarationSetDigest);

  const stamp = segmentStamp({ segmentIndex: 3 });
  assert.equal(nextRunSegmentIndex([stamp], "basis://t217/s2"), 4);
  assert.equal(nextRunSegmentIndex([stamp], "basis://other"), 1);
  assert.equal(nextRunSegmentIndex([], "basis://t217/s2"), 1);
});

test("T-217 S2 e1 (review P1): a startup-less resume stamps the replay-derived governing set, never an empty one", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart(
    startRequest(
      input,
      context,
      [],
      (event) => runOneEvents.push(event),
      t217Declaration("content-v1", executive.id),
      "correlation://t217/s2/e1/run1"
    )
  );
  const expectedGoverningSet = deriveGoverningDeclarationSet(runOneEvents);
  assert.equal(expectedGoverningSet.declarationCount, 1);

  // the probe: resume WITHOUT a fresh runtimeRegistryStartup batch
  const runTwoEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: (event) => runTwoEvents.push(event)
  });
  const stamp = runTwoEvents.find((event) => event.kind === "run_segment_opened");
  assert.ok(stamp, "the resume still stamps its segment");
  assert.equal(
    stamp.declarationCount,
    1,
    "the stamp carries the replay-derived governing truth, not an empty set"
  );
  assert.equal(stamp.declarationSetDigest, expectedGoverningSet.declarationSetDigest);
});

test("T-217 S2 e2 (review P1): governing set is latest-per-declarationRef — a superseded digest never rides the stamp", () => {
  const admittedV1 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v1", "graph-function://t217/s2/e2"),
    correlationId: "correlation://t217/s2/e2/v1"
  });
  const admittedV2 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v2", "graph-function://t217/s2/e2"),
    correlationId: "correlation://t217/s2/e2/v2"
  });
  const superseded = deriveGoverningDeclarationSet([admittedV1, admittedV2]);
  const direct = deriveGoverningDeclarationSet([admittedV2]);
  assert.equal(superseded.declarationCount, 1);
  assert.equal(
    superseded.declarationSetDigest,
    direct.declarationSetDigest,
    "latest digest per declarationRef wins; the superseded digest is gone"
  );
});

test("T-217 S2 e3 (review P2): segment windows derive from ordinal truth — shuffled replay cannot mint impossible windows; unorderable stamps fail closed", () => {
  const [stampOne] = emit(
    segmentStamp({ segmentIndex: 1 }),
    () => {}
  );
  const [stampTwo] = emit(
    segmentStamp({ segmentIndex: 2, declarationCount: 2 }),
    () => {}
  );
  // shuffled input order: later stamp first
  const segments = deriveRunSegments([stampTwo, stampOne]);
  assert.equal(segments.length, 2);
  assert.equal(segments[0].segmentIndex, 1);
  assert.equal(segments[1].segmentIndex, 2);
  assert.ok(
    segments[0].window.toOrdinal === null ||
      segments[0].window.fromOrdinal === null ||
      segments[0].window.fromOrdinal <= segments[0].window.toOrdinal,
    "no impossible window"
  );
  assert.equal(
    segments[0].window.toOrdinal,
    segments[1].window.fromOrdinal - 1,
    "windows tile the record in ordinal order"
  );
  // an unorderable (never-admitted) stamp fails closed
  assert.throws(
    () => deriveRunSegments([segmentStamp({ segmentIndex: 3 })]),
    /require admission ordinals/u
  );
});
