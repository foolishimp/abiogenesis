// T-217 Phase 1 S5 — the basis-fork witness (WITNESS-003 "binding, or
// policy truth"; self-review SR-2). A policy/binding change on the same
// declared work mints a new content-derived basis identity; without this
// witness it enters the fresh-start path silently and spines coexist
// unratified. Coverage reuses the reprice event verbatim:
// declarationRef = spineRef, digests = the basisId pair.
import test from "node:test";
import assert from "node:assert/strict";

import {
  constructDeclarationRepriceAdmittedEvent,
  deriveBasisForkObligations,
  mintExecutionBasisSpineRef
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { admitRunResumed, runEngineStart } from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

const SPINE = Object.freeze({
  graphFunctionId: "graph-function://t217/s5/subject",
  jobId: "job://t217/s5/subject",
  runId: "run://t217/s5",
  workKey: "wk://t217/s5"
});

function basisAdmitted(basisId, overrides = {}) {
  return {
    kind: "basis_admitted",
    basisId,
    graphFunctionId: SPINE.graphFunctionId,
    jobId: SPINE.jobId,
    resolvedRuntimeRef: "runtime://typescript/node",
    resolvedPolicyBundleRef: "policy://t217/s5/p1",
    runId: SPINE.runId,
    workKey: SPINE.workKey,
    ...overrides
  };
}

function coveringReprice(priorBasisId, enteringBasisId) {
  // coverage authority requires canonical replay truth (codex P1)
  const [canonical] = emit(rawCoveringReprice(priorBasisId, enteringBasisId), () => {});
  return canonical;
}

function rawCoveringReprice(priorBasisId, enteringBasisId) {
  return constructDeclarationRepriceAdmittedEvent({
    basisId: priorBasisId,
    runId: SPINE.runId,
    workKey: SPINE.workKey,
    declarationRef: mintExecutionBasisSpineRef(SPINE),
    beforeDigest: priorBasisId,
    afterDigest: enteringBasisId,
    changeClass: "realization_refactor",
    owningTicketRef: "ticket://T-217",
    operatorActorRef: "operator://jim",
    reason: "ratified policy change on the spine"
  });
}

test("T-217 S5 i1: fork detection — same spine + different basisId requires the exact spine/basisId-pair reprice", () => {
  const entering = { basisId: "basis://B", ...SPINE };

  // uncovered fork
  const uncovered = deriveBasisForkObligations({
    priorEvents: [basisAdmitted("basis://A")],
    enteringBasis: entering
  });
  assert.equal(uncovered.forkRows.length, 1);
  assert.equal(uncovered.uncoveredForkRows.length, 1);
  assert.equal(uncovered.forkRows[0].priorBasisId, "basis://A");
  assert.equal(uncovered.forkRows[0].enteringBasisId, "basis://B");
  assert.equal(uncovered.forkRows[0].spineRef, mintExecutionBasisSpineRef(SPINE));

  // exact-pair coverage unlocks
  const covered = deriveBasisForkObligations({
    priorEvents: [
      basisAdmitted("basis://A"),
      coveringReprice("basis://A", "basis://B")
    ],
    enteringBasis: entering
  });
  assert.equal(covered.uncoveredForkRows.length, 0);
  assert.equal(covered.forkRows[0].coveringRepriceRefs.length, 1);

  // wrong-pair reprice covers nothing
  const wrongPair = deriveBasisForkObligations({
    priorEvents: [
      basisAdmitted("basis://A"),
      coveringReprice("basis://A", "basis://ELSEWHERE")
    ],
    enteringBasis: entering
  });
  assert.equal(wrongPair.uncoveredForkRows.length, 1);

  // a different graph function is a different spine — no fork
  const otherSpine = deriveBasisForkObligations({
    priorEvents: [
      basisAdmitted("basis://A", {
        graphFunctionId: "graph-function://t217/s5/other"
      })
    ],
    enteringBasis: entering
  });
  assert.equal(otherSpine.forkRows.length, 0);

  // entering basis already admitted on the spine = resume, not fork
  const resume = deriveBasisForkObligations({
    priorEvents: [basisAdmitted("basis://A"), basisAdmitted("basis://B")],
    enteringBasis: entering
  });
  assert.equal(resume.forkRows.length, 0);

  // k1 (codex P1): a RAW constructed reprice is a self-reported operator
  // act, not replay truth — it covers nothing
  const rawCover = deriveBasisForkObligations({
    priorEvents: [
      basisAdmitted("basis://A"),
      rawCoveringReprice("basis://A", "basis://B")
    ],
    enteringBasis: entering
  });
  assert.equal(rawCover.uncoveredForkRows.length, 1);
});

test("T-217 S5 i2: chain of custody — the decisive prior is ordinal-latest; unorderable multiples fail closed", () => {
  const entering = { basisId: "basis://C", ...SPINE };
  const [admittedA] = emit(basisAdmitted("basis://A"), () => {});
  const [admittedAPrime] = emit(basisAdmitted("basis://A2"), () => {});

  // the covering pair must be A2 -> C (latest prior), not A -> C
  const staleCover = deriveBasisForkObligations({
    priorEvents: [admittedA, admittedAPrime, coveringReprice("basis://A", "basis://C")],
    enteringBasis: entering
  });
  assert.equal(staleCover.uncoveredForkRows.length, 1);
  assert.equal(staleCover.forkRows[0].priorBasisId, "basis://A2");

  const chained = deriveBasisForkObligations({
    priorEvents: [admittedA, admittedAPrime, coveringReprice("basis://A2", "basis://C")],
    enteringBasis: entering
  });
  assert.equal(chained.uncoveredForkRows.length, 0);
  // shuffled order: ordinal truth still picks A2
  const shuffled = deriveBasisForkObligations({
    priorEvents: [admittedAPrime, admittedA, coveringReprice("basis://A2", "basis://C")],
    enteringBasis: entering
  });
  assert.equal(shuffled.uncoveredForkRows.length, 0);

  // multiple unorderable priors fail closed
  assert.throws(
    () =>
      deriveBasisForkObligations({
        priorEvents: [basisAdmitted("basis://A"), basisAdmitted("basis://A2")],
        enteringBasis: entering
      }),
    /requires admission ordinals to order multiple candidates/u
  );
});

test("T-217 S5 i3: runner blocks a live policy fork before the new basis is admitted; the covering reprice ratifies it", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event)
  });
  const basisA = runOneEvents.find((event) => event.kind === "basis_admitted");
  assert.ok(basisA);

  // the silent fork: same work, changed policy bundle
  const forkedPolicy = Object.freeze({
    ...context.resolvedPolicy,
    resolvedPolicyBundleRef: "policy://m03-iteration/v2"
  });
  const runTwoEvents = [];
  const blocked = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: forkedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: (event) => runTwoEvents.push(event)
  });
  assert.equal(blocked.transition.kind, "terminal");
  assert.equal(blocked.transition.terminalKind, "gap_stop");
  assert.match(blocked.transition.reason ?? "", /basis_fork_detected/u);
  assert.notEqual(blocked.basis.id, basisA.basisId, "the fork is real");
  const launderedBasis = runTwoEvents.find(
    (event) => event.kind === "basis_admitted"
  );
  assert.equal(
    launderedBasis,
    undefined,
    "the forked basis must not be admitted before ratification"
  );

  // ratify: the covering reprice names the spine and the exact basisId pair
  const spineRef = mintExecutionBasisSpineRef({
    graphFunctionId: basisA.graphFunctionId,
    jobId: basisA.jobId,
    runId: basisA.runId,
    workKey: basisA.workKey
  });
  const [ratified] = emit(
    constructDeclarationRepriceAdmittedEvent({
      basisId: basisA.basisId,
      runId: basisA.runId,
      workKey: basisA.workKey,
      declarationRef: spineRef,
      beforeDigest: basisA.basisId,
      afterDigest: blocked.basis.id,
      changeClass: "realization_refactor",
      owningTicketRef: "ticket://T-217",
      operatorActorRef: "operator://jim",
      reason: "ratified policy bundle change on the spine"
    }),
    () => {}
  );
  const runThreeEvents = [];
  const resumed = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: forkedPolicy,
    runtimeEvents: [...runOneEvents, ratified],
    eventSink: (event) => runThreeEvents.push(event)
  });
  const forkBlockedAgain =
    resumed.transition.kind === "terminal" &&
    resumed.transition.terminalKind === "gap_stop" &&
    /basis_fork_detected/u.test(resumed.transition.reason ?? "");
  assert.equal(forkBlockedAgain, false, "the covered fork must pass");
  const admittedB = runThreeEvents.find(
    (event) =>
      event.kind === "basis_admitted" && event.basisId === blocked.basis.id
  );
  assert.ok(admittedB, "the ratified basis is admitted");
});

test("T-217 S5 j1 (self-review F1): routes cannot launder a fork — the convenience basis admission enforces the same witness", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event)
  });
  const basisA = runOneEvents.find((event) => event.kind === "basis_admitted");
  assert.ok(basisA);
  // a forked basis object over the same spine (test-side reconstruction:
  // same work identity, different basis id as a policy change would mint)
  const fixture = buildThreeStageBasis({ defaultRegime: "F_P" });
  const forkedBasis = Object.freeze({
    ...fixture,
    id: "execution_basis:forked-for-j1",
    runId: basisA.runId,
    workKey: basisA.workKey
  });
  assert.equal(forkedBasis.graphFunction.id, basisA.graphFunctionId);
  assert.equal(forkedBasis.job.id, basisA.jobId);

  // the laundering probe: any route with the forked basis over the store
  assert.throws(
    () =>
      admitRunResumed({
        basis: forkedBasis,
        runtimeEvents: [...runOneEvents],
        eventSink: () => {},
        operatorActorRef: "operator://jim",
        reasonKind: "operator_resume",
        reasonDetail: "laundering probe"
      }),
    /basis_fork_detected/u
  );

  // the covering reprice ratifies; the route then admits the forked basis
  const [ratified] = emit(
    constructDeclarationRepriceAdmittedEvent({
      basisId: basisA.basisId,
      runId: basisA.runId,
      workKey: basisA.workKey,
      declarationRef: mintExecutionBasisSpineRef({
        graphFunctionId: basisA.graphFunctionId,
        jobId: basisA.jobId,
        runId: basisA.runId,
        workKey: basisA.workKey
      }),
      beforeDigest: basisA.basisId,
      afterDigest: forkedBasis.id,
      changeClass: "realization_refactor",
      owningTicketRef: "ticket://T-217",
      operatorActorRef: "operator://jim",
      reason: "ratified fork for the route path"
    }),
    () => {}
  );
  const sunk = [];
  const resumed = admitRunResumed({
    basis: forkedBasis,
    runtimeEvents: [...runOneEvents, ratified],
    eventSink: (event) => sunk.push(event),
    operatorActorRef: "operator://jim",
    reasonKind: "operator_resume",
    reasonDetail: "ratified fork continues"
  });
  assert.equal(resumed.kind, "run_resumed_admission_result");
  const admittedFork = sunk.find(
    (event) =>
      event.kind === "basis_admitted" && event.basisId === forkedBasis.id
  );
  assert.ok(admittedFork, "the ratified fork is admitted through the route");
});

test("T-217 S5 k1 (codex P1): the runner rejects raw-reprice fork coverage — canonical admitted truth or the fork stays blocked", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event)
  });
  const basisA = runOneEvents.find((event) => event.kind === "basis_admitted");
  const forkedPolicy = Object.freeze({
    ...context.resolvedPolicy,
    resolvedPolicyBundleRef: "policy://m03-iteration/v3"
  });
  const probe = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: forkedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: () => {}
  });
  assert.match(probe.transition.reason ?? "", /basis_fork_detected/u);
  // the exact codex probe: a RAW constructed reprice smuggled into the
  // request events — no eventId, no ordinal, never admitted
  const rawReprice = constructDeclarationRepriceAdmittedEvent({
    basisId: basisA.basisId,
    runId: basisA.runId,
    workKey: basisA.workKey,
    declarationRef: mintExecutionBasisSpineRef({
      graphFunctionId: basisA.graphFunctionId,
      jobId: basisA.jobId,
      runId: basisA.runId,
      workKey: basisA.workKey
    }),
    beforeDigest: basisA.basisId,
    afterDigest: probe.basis.id,
    changeClass: "realization_refactor",
    owningTicketRef: "ticket://T-217",
    operatorActorRef: "operator://forger",
    reason: "self-reported coverage probe"
  });
  const stillBlocked = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: forkedPolicy,
    runtimeEvents: [...runOneEvents, rawReprice],
    eventSink: () => {}
  });
  assert.equal(stillBlocked.transition.terminalKind, "gap_stop");
  assert.match(
    stillBlocked.transition.reason ?? "",
    /basis_fork_detected/u,
    "a self-reported reprice must not ratify a fork"
  );
});
