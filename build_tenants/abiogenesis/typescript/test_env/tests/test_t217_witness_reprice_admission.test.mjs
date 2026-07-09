// T-217 Phase 1 S1 — REQ-R-ABG3-WITNESS-003/-004.
// Reprice admission law, exact digest-pair coverage, the frozen-law replay
// predicate, and the runner's fail-closed block on resumed declaration
// drift (blocked BEFORE the drifted digests reach the store — emitting
// first would launder the drift on the next resume).
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructDeclarationRepriceAdmittedEvent,
  deriveAdmittedDeclarationRepriceEvents,
  deriveDeclarationRepriceObligations,
  deriveFrozenLawPredicate
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  admitGtlLibraryEntryDeclaration
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js";
import {
  admitDeclarationReprice,
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig,
  runEngineStart
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";

function repriceEvent(overrides = {}) {
  return constructDeclarationRepriceAdmittedEvent({
    basisId: "basis://t217/s1",
    runId: "run://t217/s1",
    workKey: "wk://t217/s1",
    declarationRef: "gtl-declaration://t217/subject",
    beforeDigest: "digest-before",
    afterDigest: "digest-after",
    changeClass: "requirement_reprice",
    owningTicketRef: "ticket://T-217",
    operatorActorRef: "operator://jim",
    reason: "declared substrate change across resume",
    ...overrides
  });
}

// C-8: fixtures hoisted to support/t217-witness-fixtures.mjs; these
// adapters keep the call sites and ref universe stable.
import {
  t217Declaration as sharedDeclaration,
  t217StartupConfig as sharedStartupConfig
} from "./support/t217-witness-fixtures.mjs";

function t217Declaration(contentMarker, graphFunctionRef = "graph-function://t217/witness-subject") {
  return sharedDeclaration({
    namespace: "t217/start",
    contentMarker,
    graphFunctionRef
  });
}

function t217StartupConfig() {
  return sharedStartupConfig({ namespace: "t217/start" });
}

test("T-217 S1 a1: reprice admission accepts full authority and rejects each missing/invalid field AS AUTHORED", () => {
  const valid = repriceEvent();
  assertRuntimeEvent(valid);
  assert.equal(valid.kind, "declaration_reprice_admitted");
  assert.match(valid.repriceRef, /^declaration-reprice:/u);

  // change class is the closed constitutional vocabulary, not prose
  assert.throws(
    () => assertRuntimeEvent({ ...valid, changeClass: "vibe_shift" }),
    /changeClass/u
  );
  // a reprice without its owning ticket is an unlogged supervisor act
  assert.throws(
    () => assertRuntimeEvent({ ...valid, owningTicketRef: "" }),
    /owningTicketRef/u
  );
  // actor attribution is not optional
  assert.throws(
    () => assertRuntimeEvent({ ...valid, operatorActorRef: "" }),
    /operatorActorRef/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, beforeDigest: "" }),
    /beforeDigest/u
  );
  // identical digests witness no change — not a reprice
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...valid,
        beforeDigest: "digest-same",
        afterDigest: "digest-same"
      }),
    /beforeDigest !== afterDigest/u
  );
});

test("T-217 S1 a2: frozen-law is a replay predicate — zero reprice events true, any reprice false with refs exposed", () => {
  const clean = deriveFrozenLawPredicate([]);
  assert.equal(clean.frozenLaw, true);
  assert.deepEqual(clean.repriceRefs, []);

  const reprice = repriceEvent();
  const stamped = deriveFrozenLawPredicate([reprice]);
  assert.equal(stamped.frozenLaw, false);
  assert.deepEqual(stamped.repriceRefs, [reprice.repriceRef]);
  assert.deepEqual(
    deriveAdmittedDeclarationRepriceEvents([reprice]).map((event) => event.repriceRef),
    [reprice.repriceRef]
  );
});

test("T-217 S1 a3: drift coverage is the exact digest pair — near-miss reprices stamp nothing", () => {
  const declarationV1 = t217Declaration("content-v1");
  const declarationV2 = t217Declaration("content-v2");
  const admittedV1 = admitGtlLibraryEntryDeclaration({
    declaration: declarationV1,
    correlationId: "correlation://t217/drift/v1"
  });
  const admittedV2 = admitGtlLibraryEntryDeclaration({
    declaration: declarationV2,
    correlationId: "correlation://t217/drift/v2"
  });
  assert.equal(admittedV1.kind, "registry_entry_admitted");
  assert.equal(admittedV2.kind, "registry_entry_admitted");
  assert.notEqual(admittedV1.declarationDigest, admittedV2.declarationDigest);

  // drift with no covering reprice -> uncovered
  const uncovered = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1],
    startupAdmissionEvents: [admittedV2]
  });
  assert.equal(uncovered.driftRows.length, 1);
  assert.equal(uncovered.uncoveredDriftRows.length, 1);
  assert.equal(uncovered.driftRows[0].priorDigest, admittedV1.declarationDigest);
  assert.equal(uncovered.driftRows[0].currentDigest, admittedV2.declarationDigest);

  // exact-pair covering reprice -> covered
  const covering = repriceEvent({
    declarationRef: declarationV1.declarationRef,
    beforeDigest: admittedV1.declarationDigest,
    afterDigest: admittedV2.declarationDigest
  });
  const covered = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1, covering],
    startupAdmissionEvents: [admittedV2]
  });
  assert.equal(covered.driftRows.length, 1);
  assert.equal(covered.uncoveredDriftRows.length, 0);
  assert.deepEqual(covered.driftRows[0].coveringRepriceRefs, [covering.repriceRef]);

  // wrong-pair reprice (right declaration, wrong after digest) covers nothing
  const nearMiss = repriceEvent({
    declarationRef: declarationV1.declarationRef,
    beforeDigest: admittedV1.declarationDigest,
    afterDigest: "digest://somewhere-else"
  });
  const stillUncovered = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1, nearMiss],
    startupAdmissionEvents: [admittedV2]
  });
  assert.equal(stillUncovered.uncoveredDriftRows.length, 1);

  // unchanged digest -> no drift row; unseen declaration -> no drift row
  const unchanged = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1],
    startupAdmissionEvents: [admittedV1]
  });
  assert.equal(unchanged.driftRows.length, 0);
  const fresh = deriveDeclarationRepriceObligations({
    priorEvents: [],
    startupAdmissionEvents: [admittedV2]
  });
  assert.equal(fresh.driftRows.length, 0);
});

test("T-217 S1 b1 (review F1): duplicate declarationRef with distinct digests is a typed identity conflict, never a first-wins dedupe", () => {
  const admittedV1 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v1"),
    correlationId: "correlation://t217/b1/v1"
  });
  const admittedV2 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v2"),
    correlationId: "correlation://t217/b1/v2"
  });
  // the exact bypass: first current row carries the OLD digest (masks),
  // second carries the drifted one — must surface as conflict, not dedupe
  const conflicted = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1],
    startupAdmissionEvents: [admittedV1, admittedV2]
  });
  assert.equal(conflicted.driftRows.length, 0);
  assert.equal(conflicted.identityConflictRows.length, 1);
  assert.equal(
    conflicted.identityConflictRows[0].declarationRef,
    admittedV1.declarationRef
  );
  assert.deepEqual(
    [...conflicted.identityConflictRows[0].currentDigests].sort(),
    [admittedV1.declarationDigest, admittedV2.declarationDigest].sort()
  );
  // duplicate rows with the SAME digest are benign idempotence, not conflict
  const benign = deriveDeclarationRepriceObligations({
    priorEvents: [admittedV1],
    startupAdmissionEvents: [admittedV1, admittedV1]
  });
  assert.equal(benign.identityConflictRows.length, 0);
  assert.equal(benign.driftRows.length, 0);
  // conflict with no prior at all is still ambiguous identity
  const freshConflict = deriveDeclarationRepriceObligations({
    priorEvents: [],
    startupAdmissionEvents: [admittedV1, admittedV2]
  });
  assert.equal(freshConflict.identityConflictRows.length, 1);
  assert.equal(freshConflict.identityConflictRows[0].priorDigest, null);
});

test("T-217 S1 b2 (review F2): repriceRef is self-certified — a forged witness identity is inadmissible", () => {
  const valid = repriceEvent();
  assertRuntimeEvent(valid);
  assert.throws(
    () =>
      assertRuntimeEvent({ ...valid, repriceRef: "declaration-reprice:forged" }),
    /repriceRef must be the content-derived identity/u
  );
  // identity is bound to content: changing a covered field without
  // re-minting the ref is equally inadmissible
  assert.throws(
    () => assertRuntimeEvent({ ...valid, owningTicketRef: "ticket://T-999" }),
    /repriceRef must be the content-derived identity/u
  );
});

test("T-217 S1 b3 (review F3): frozen-law takes an explicit ordinal window; unplaceable reprices poison the window fail-closed", () => {
  const sunk = [];
  const [canonicalReprice] = emit(repriceEvent(), (event) => sunk.push(event));
  const ordinal = canonicalReprice.eventAdmissionOrdinal;
  // window strictly after the reprice -> frozen
  const after = deriveFrozenLawPredicate([canonicalReprice], {
    fromOrdinal: ordinal + 1,
    toOrdinal: null
  });
  assert.equal(after.frozenLaw, true);
  assert.deepEqual(after.window, { fromOrdinal: ordinal + 1, toOrdinal: null });
  // window covering the reprice -> not frozen
  const covering = deriveFrozenLawPredicate([canonicalReprice], {
    fromOrdinal: ordinal,
    toOrdinal: ordinal
  });
  assert.equal(covering.frozenLaw, false);
  assert.deepEqual(covering.repriceRefs, [canonicalReprice.repriceRef]);
  // an UNSTAMPED reprice cannot be placed: any window query stays non-frozen
  const unplaceable = deriveFrozenLawPredicate([repriceEvent()], {
    fromOrdinal: 1000,
    toOrdinal: 2000
  });
  assert.equal(unplaceable.frozenLaw, false);
  // whole-record default is unchanged and carries a null window
  const whole = deriveFrozenLawPredicate([canonicalReprice]);
  assert.equal(whole.frozenLaw, false);
  assert.equal(whole.window, null);
});

test("T-217 S1 b1-runner (review F1): a startup carrying old+new digests for one declarationRef blocks as identity conflict and emits neither", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [t217Declaration("content-v1", executive.id)],
      correlationId: "correlation://t217/b1r/run1"
    }
  });
  const admittedV1 = runOneEvents.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  assert.ok(admittedV1);

  const runTwoEvents = [];
  const blocked = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: (event) => runTwoEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [
        t217Declaration("content-v1", executive.id),
        t217Declaration("content-v2", executive.id)
      ],
      correlationId: "correlation://t217/b1r/run2"
    }
  });
  assert.equal(blocked.transition.kind, "terminal");
  assert.equal(blocked.transition.terminalKind, "gap_stop");
  assert.match(
    blocked.transition.reason ?? "",
    /declaration_identity_conflict: gtl-declaration:\/\/t217\/start\/witness-subject/u
  );
  const emittedRegistryRow = runTwoEvents.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  assert.equal(
    emittedRegistryRow,
    undefined,
    "conflicted startup must emit no registry digest at all"
  );
});

test("T-217 S1 a4: the operator route admits the reprice and returns the post-admission frozen-law truth", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const sunk = [];
  const result = admitDeclarationReprice({
    basis,
    runtimeEvents: [],
    eventSink: (event) => sunk.push(event),
    declarationRef: "gtl-declaration://t217/route/subject",
    beforeDigest: "digest-v1",
    afterDigest: "digest-v2",
    changeClass: "requirement_reprice",
    owningTicketRef: "ticket://T-217",
    operatorActorRef: "operator://jim",
    reason: "route-admitted reprice ahead of resume"
  });
  assert.equal(result.kind, "declaration_reprice_admission_result");
  assert.equal(result.frozenLaw.frozenLaw, false);
  assert.deepEqual(result.frozenLaw.repriceRefs, [result.repriceRef]);
  // the act is replay truth through the sole write path, actor-attributed
  const sunkReprice = sunk.find(
    (event) => event.kind === "declaration_reprice_admitted"
  );
  assert.ok(sunkReprice);
  assert.equal(sunkReprice.operatorActorRef, "operator://jim");
  assert.equal(sunkReprice.owningTicketRef, "ticket://T-217");
  assert.ok(sunkReprice.eventId);
  assert.equal(
    deriveFrozenLawPredicate(result.replayEvents).frozenLaw,
    false
  );
});

test("T-217 S1 a5: runner blocks resumed declaration drift fail-closed before the drifted digest reaches the store; exact covering reprice unblocks", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [t217Declaration("content-v1", executive.id)],
      correlationId: "correlation://t217/run1/registry"
    }
  });
  const admittedV1 = runOneEvents.find(
    (event) =>
      event.kind === "registry_entry_admitted" &&
      event.declarationRef === "gtl-declaration://t217/start/witness-subject"
  );
  assert.ok(admittedV1, "run 1 must admit the v1 declaration digest");
  const basisAdmitted = runOneEvents.find(
    (event) => event.kind === "basis_admitted"
  );
  assert.ok(basisAdmitted);

  // resume with silently changed declaration -> typed gap_stop, and the
  // drifted digest must NOT have been emitted (no laundering)
  const runTwoEvents = [];
  const blocked = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: (event) => runTwoEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [t217Declaration("content-v2", executive.id)],
      correlationId: "correlation://t217/run2/registry"
    }
  });
  assert.equal(blocked.transition.kind, "terminal");
  assert.equal(blocked.transition.terminalKind, "gap_stop");
  assert.match(
    blocked.transition.reason ?? "",
    /declaration_reprice_required: gtl-declaration:\/\/t217\/start\/witness-subject/u
  );
  const laundered = runTwoEvents.find(
    (event) =>
      event.kind === "registry_entry_admitted" &&
      event.declarationDigest !== admittedV1.declarationDigest
  );
  assert.equal(laundered, undefined, "drifted digest must not reach the store");

  // admit the exact covering reprice through the sole write path (emit
  // canonicalizes and continues the admission ordinal), attributed to the
  // RUN's own basis identity captured from replay, then resume: the guard
  // passes
  const expectedV2 = admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration("content-v2", executive.id),
    correlationId: "correlation://t217/expected/v2"
  });
  const [coveringReprice] = emit(
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
      reason: "ratified declaration change for resume"
    }),
    () => {}
  );
  assert.ok(coveringReprice.eventId, "reprice must be canonical replay truth");
  const runThreeEvents = [];
  const resumed = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...runOneEvents, coveringReprice],
    eventSink: (event) => runThreeEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: t217StartupConfig(),
      productDeclarations: [t217Declaration("content-v2", executive.id)],
      correlationId: "correlation://t217/run3/registry"
    }
  });
  const blockedAgain =
    resumed.transition.kind === "terminal" &&
    resumed.transition.terminalKind === "gap_stop" &&
    /declaration_reprice_required/u.test(resumed.transition.reason ?? "");
  assert.equal(blockedAgain, false, "covered drift must pass the reprice guard");
  const admittedV2 = runThreeEvents.find(
    (event) =>
      event.kind === "registry_entry_admitted" &&
      event.declarationDigest === expectedV2.declarationDigest
  );
  assert.ok(admittedV2, "run 3 must admit the repriced v2 digest");
  // and the resumed span is mechanically NOT frozen-law
  assert.equal(
    deriveFrozenLawPredicate([...runOneEvents, coveringReprice, ...runThreeEvents]).frozenLaw,
    false
  );
});

test("T-217 S1 h2 (self-review SR-4): an idempotently re-admitted reprice does not duplicate refs in the frozen-law predicate", () => {
  const reprice = repriceEvent();
  const predicate = deriveFrozenLawPredicate([reprice, { ...reprice }]);
  assert.equal(predicate.frozenLaw, false);
  assert.deepEqual(predicate.repriceRefs, [reprice.repriceRef]);
});
