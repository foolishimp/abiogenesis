// T-217 Phase 2 S2.2 — the WITNESS-007 ENFORCEMENT half, unit law:
// closure consumes hygiene taint. The blocking set is basis-scoped
// (another run's tainted evidence never blocks this basis), the gate
// demotes ONLY minted "close" decisions, and clean re-measurement
// resolves the block. Plus the D1.4 measurable-surface derivation the
// kernel-witnessed instrument stands on.
import test from "node:test";
import assert from "node:assert/strict";

import {
  applyClosureTaintGate,
  constructWorkspaceHygieneStampedEvent,
  deriveClosureBlockingTaintedRefs,
  deriveKernelMeasurableSurfaces,
  deriveWorkspaceHygieneRows
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";

function artifactEvent({ basisId, artifactRef, digest }) {
  return {
    kind: "actor_result_artifact_observed",
    basisId,
    graphFunctionId: "graph-function://t217/s22",
    runId: "run://t217/s22",
    workKey: "wk://t217/s22",
    graphCallId: "graph-call://t217/s22",
    frameId: "frame://t217/s22",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: `actor-invocation://t217/s22/${artifactRef}`,
    workerId: "worker://t217",
    backendId: "backend://node",
    causationEventRefs: [],
    correlationId: `correlation://t217/s22/${artifactRef}`,
    resultRef: `result://t217/s22/${artifactRef}`,
    artifactRef,
    artifactContentDigest: digest,
    artifactContentExcerpt: null
  };
}

function stampFor({ basisId, artifactRef, observedDigest, replayEvents, copyOutRef = null }) {
  const rows = deriveWorkspaceHygieneRows({
    observations: [{ artifactRef, observedDigest, copyOutRef }],
    replayEvents
  });
  return constructWorkspaceHygieneStampedEvent({
    basisId,
    runId: "run://t217/s22",
    workKey: "wk://t217/s22",
    segmentRef: null,
    observedBy: "kernel://workspace-digest-instrument",
    rows
  });
}

test("T-217 S2.2 (WITNESS-007): the closure-blocking set is basis-scoped — own tainted evidence blocks, another basis's does not, clean re-measure resolves", () => {
  const mine = artifactEvent({
    basisId: "basis://t217/s22/mine",
    artifactRef: "artifact://t217/s22/mine-report",
    digest: "sha256:mine-admitted"
  });
  const theirs = artifactEvent({
    basisId: "basis://t217/s22/theirs",
    artifactRef: "artifact://t217/s22/their-report",
    digest: "sha256:their-admitted"
  });
  const events = [];
  const push = (batch) => events.push(...emit(batch, () => {}));
  push([mine, theirs]);
  // BOTH artifacts are hand-edited: workspace-global taint on two bases
  push([
    stampFor({
      basisId: "basis://t217/s22/mine",
      artifactRef: mine.artifactRef,
      observedDigest: "sha256:hand-edited",
      replayEvents: events,
      copyOutRef: "copyout://t217/s22/mine-report/1"
    }),
    stampFor({
      basisId: "basis://t217/s22/theirs",
      artifactRef: theirs.artifactRef,
      observedDigest: "sha256:hand-edited",
      replayEvents: events,
      copyOutRef: "copyout://t217/s22/their-report/1"
    })
  ]);

  assert.deepEqual(
    deriveClosureBlockingTaintedRefs({
      basisId: "basis://t217/s22/mine",
      events
    }),
    [mine.artifactRef],
    "only THIS basis's tainted evidence blocks its closure"
  );

  // clean re-measurement resolves the taint for closure purposes
  push([
    stampFor({
      basisId: "basis://t217/s22/mine",
      artifactRef: mine.artifactRef,
      observedDigest: "sha256:mine-admitted",
      replayEvents: events
    })
  ]);
  assert.deepEqual(
    deriveClosureBlockingTaintedRefs({
      basisId: "basis://t217/s22/mine",
      events
    }),
    []
  );
});

test("T-217 S2.2 (WITNESS-007): the gate demotes ONLY a minted close — block reason names the taint; non-close decisions and clean bases pass through untouched", () => {
  const artifact = artifactEvent({
    basisId: "basis://t217/s22/gate",
    artifactRef: "artifact://t217/s22/gate-report",
    digest: "sha256:admitted"
  });
  const events = [];
  events.push(...emit([artifact], () => {}));
  events.push(
    ...emit(
      [
        stampFor({
          basisId: "basis://t217/s22/gate",
          artifactRef: artifact.artifactRef,
          observedDigest: "sha256:hand-edited",
          replayEvents: events,
          copyOutRef: "copyout://t217/s22/gate-report/1"
        })
      ],
      () => {}
    )
  );
  const scope = Object.freeze({
    kind: "assurance_scope_ref",
    basisId: "basis://t217/s22/gate",
    graphFunctionId: "graph-function://t217/s22",
    vectorIndex: 0,
    edge: "input_set→requirements"
  });
  const close = Object.freeze({
    kind: "assurance_closure_decision",
    decision: "close",
    scope,
    projectionRef: "projection://t217/s22",
    blockingStatuses: Object.freeze([]),
    rowIds: Object.freeze([]),
    reason: "all rows fulfilled"
  });

  const demoted = applyClosureTaintGate({
    decision: close,
    basisId: "basis://t217/s22/gate",
    events
  });
  assert.equal(demoted.decision, "block");
  assert.deepEqual(demoted.blockingStatuses, ["contradictory_evidence"]);
  assert.deepEqual(demoted.rowIds, [artifact.artifactRef]);
  assert.match(demoted.reason, /workspace_hygiene_taint/u);
  assert.match(demoted.reason, /inadmissible for closure until re-measured/u);

  // a non-close decision passes through — retry is not closure
  const retry = Object.freeze({ ...close, decision: "retry", reason: "row open" });
  assert.equal(applyClosureTaintGate({
    decision: retry,
    basisId: "basis://t217/s22/gate",
    events
  }), retry);

  // a different basis closes over the same workspace taint
  assert.equal(
    applyClosureTaintGate({
      decision: close,
      basisId: "basis://t217/s22/other",
      events
    }),
    close
  );
});

test("T-217 S2.2 (D1.4): kernel-measurable surfaces derive from admitted materializations — decisive (path, digest) pair by the D-ordinal law, deterministically ordered", () => {
  const materialization = (materializedRef, materializedPath, digest) => ({
    kind: "output_materialization_observed",
    basisId: "basis://t217/s22/measure",
    graphCallId: "graph-call://t217/s22/measure",
    frameId: "frame://t217/s22/measure",
    vectorIndex: 0,
    edge: "input_set→requirements",
    allocationId: "allocation://t217/s22/measure",
    assetRef: "workspace://t217/s22/report",
    materializedRef,
    materializedPath,
    digest,
    observerRef: "observer://t217/s22",
    artifactRefs: []
  });
  const events = emit(
    [
      materialization("materialized://t217/b", "runs/1/b.md", "sha256:b1"),
      materialization("materialized://t217/a", "runs/1/a.md", "sha256:a1"),
      // re-materialization moves BOTH path and digest — the later pair wins
      materialization("materialized://t217/a", "runs/2/a.md", "sha256:a2"),
      artifactEvent({
        basisId: "basis://t217/s22/measure",
        artifactRef: "artifact://not-a-materialization",
        digest: "sha256:ignored"
      })
    ],
    () => {}
  );
  assert.deepEqual(deriveKernelMeasurableSurfaces(events), [
    {
      artifactRef: "materialized://t217/a",
      materializedPath: "runs/2/a.md",
      admittedDigest: "sha256:a2"
    },
    {
      artifactRef: "materialized://t217/b",
      materializedPath: "runs/1/b.md",
      admittedDigest: "sha256:b1"
    }
  ]);
});

test("T-217 S2.4 (C-1, EVENTS-025): the basis filter consumes the declared scope classes — declared run-independent kinds pass, undeclared no-scope kinds fail closed", async () => {
  const { RUN_INDEPENDENT_EVENT_SCOPE_CLASSES, runtimeEventsForBasis } =
    await import(
      "../../build/semantic/code/src/abg/m03/contracts/index.js"
    );
  // the declaration is the law's surface: workspace/run/perimeter classes
  assert.equal(
    RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.registry_entry_admitted,
    "workspace"
  );
  assert.equal(RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.approved, "run");
  assert.equal(
    RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.runtime_failure_observed,
    "perimeter"
  );
  const basis = { id: "basis://t217/s24" };
  const mine = { kind: "terminal_reached", basisId: "basis://t217/s24", terminalKind: "converged", reason: null };
  const theirs = { kind: "terminal_reached", basisId: "basis://other", terminalKind: "converged", reason: null };
  const workspaceTruth = { kind: "registry_entry_admitted", entryRef: "registry-entry://t217/s24" };
  const filtered = runtimeEventsForBasis(basis, [mine, theirs, workspaceTruth]);
  assert.deepEqual(filtered, [mine, workspaceTruth]);
  // an event with NO basis scope whose kind is undeclared is a carrier
  // defect — it fails closed instead of silently blending across runs
  assert.throws(
    () =>
      runtimeEventsForBasis(basis, [
        { kind: "future_unscoped_kind", payload: 1 }
      ]),
    /not declared run-independent/u
  );
});

test("T-217 S2.4 (EVENTS-026): hostile issue rows fail admission typed — smuggled keys and empty fields are carrier defects", async () => {
  const { assertRuntimeEvent } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const rejected = (issues) => ({
    kind: "payload_rejected",
    basisId: "basis://t217/s24",
    graphCallId: "graph-call://t217/s24",
    frameId: "frame://t217/s24",
    vectorIndex: 0,
    edge: "input_set→requirements",
    payloadRef: "payload://t217/s24",
    rejectionClass: "schema_invalid",
    schemaRef: "schema://t217/s24",
    contractRef: null,
    contractDigest: null,
    digest: null,
    reason: "row_missing_field:depthProofMap.rows[0]",
    issues,
    policyRefs: []
  });
  // lawful structured rows admit
  assertRuntimeEvent(
    rejected([{ issueKind: "row_missing_field", path: "depthProofMap.rows[0]" }])
  );
  // a smuggled row key is a carrier defect
  assert.throws(
    () =>
      assertRuntimeEvent(
        rejected([
          { issueKind: "row_missing_field", path: "p", smuggled: true }
        ])
      ),
    /not a lawful issue-row key/u
  );
  // an empty field is a carrier defect
  assert.throws(
    () => assertRuntimeEvent(rejected([{ issueKind: "", path: "p" }])),
    /issueKind must be a non-empty string/u
  );
  // a missing/malformed issues array and a non-object row fail typed
  assert.throws(
    () => assertRuntimeEvent(rejected("not-an-array")),
    /issues must be an array/u
  );
  assert.throws(
    () => assertRuntimeEvent(rejected(["not-a-row"])),
    /issues\[0\] must be an object/u
  );
});

test("T-217 S2.4 (C-4): emitter contexts are store-scoped — independent counters, and a live store rejects forged pre-stamps while replay tolerance admits them", async () => {
  const { createRuntimeEventEmitterContext, emitWithContext } = await import(
    "../../build/semantic/code/src/abg/m03/events/index.js"
  );
  const failure = (message) => ({
    kind: "runtime_failure_observed",
    basisId: null,
    surface: "test://t217/s24/c4",
    failureClass: "runtime_failure",
    message,
    stackExcerpt: null
  });

  // two stores in one process: ordinals never interleave
  const storeA = createRuntimeEventEmitterContext();
  const storeB = createRuntimeEventEmitterContext();
  const [a1] = emitWithContext(storeA, failure("a1"), () => {});
  const [b1] = emitWithContext(storeB, failure("b1"), () => {});
  const [a2] = emitWithContext(storeA, failure("a2"), () => {});
  assert.equal(a1.eventAdmissionOrdinal, 0);
  assert.equal(b1.eventAdmissionOrdinal, 0);
  assert.equal(a2.eventAdmissionOrdinal, 1);

  // T-195 caller-context flag: a LIVE store fails closed on a
  // pre-stamped canonical envelope (forged pre-stamp)...
  assert.throws(
    () => emitWithContext(storeA, a1, () => {}),
    /live emitter context rejects pre-stamped canonical envelopes/u
  );
  // ...while a replay-tolerant store admits replayed truth and its
  // counter only moves forward past the stamped ordinal
  const replayStore = createRuntimeEventEmitterContext({
    source: "replay_tolerant",
    startOrdinal: 0
  });
  const [replayed] = emitWithContext(replayStore, a2, () => {});
  assert.equal(replayed, a2);
  const [minted] = emitWithContext(replayStore, failure("fresh"), () => {});
  assert.equal(minted.eventAdmissionOrdinal, a2.eventAdmissionOrdinal + 1);
});

test("T-217 S2.4 (C-3): the canonical string laws — assert narrows unknown, admit returns the narrowed value, both fail typed", async () => {
  const { admitNonEmptyString, assertNonEmptyString } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  assert.equal(admitNonEmptyString("ref://a", "label"), "ref://a");
  assertNonEmptyString("ok", "label");
  assert.throws(() => admitNonEmptyString("", "label"), /label must be non-empty/u);
  assert.throws(() => assertNonEmptyString(42, "label"), /label must be non-empty/u);
});
