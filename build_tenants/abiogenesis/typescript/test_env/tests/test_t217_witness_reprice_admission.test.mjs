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

// content marker varies the declaration DIGEST while the version stays
// coupled to the startup config — a reprice witnesses content change
function t217Declaration(contentMarker, graphFunctionRef = "graph-function://t217/witness-subject") {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t217/start/witness-subject",
    entryRef: "registry-entry://t217/start/witness-subject",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.start",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef,
    interfaceRef: "interface://t217/start/witness-subject",
    sourceContractRef: "contract://t217/start/source",
    targetContractRef: "contract://t217/start/target",
    contextRefs: ["context://t217/start"],
    authorityRefs: ["authority://t217/start/abg-runtime"],
    overlayRefs: ["overlay://t217/start/witness-subject"],
    provenanceRefs: ["provenance://t217/start"],
    readinessRefs: ["readiness://t217/start"],
    proofRefs: [`proof://t217/start/${contentMarker}`],
    policyRefs: ["policy://t217/start"],
    declarationSourceRefs: ["gtl://module/t217/start"]
  });
}

function t217StartupConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t217/start",
    productNamespace: "t217.start",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    enabledLibraryRefs: [
      "registry-entry://t217/start/witness-subject",
      "gtl-declaration://t217/start/witness-subject",
      "gtl://module/t217/start"
    ],
    overlayRefs: ["overlay://t217/start/witness-subject"],
    pluginRefs: ["plugin://t217/start/fp-worker"],
    readinessRefs: ["readiness://t217/start"],
    proofRefs: ["proof://t217/start"],
    policyRefs: ["policy://t217/start"],
    configSourceRefs: ["config://t217/start"]
  });
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
