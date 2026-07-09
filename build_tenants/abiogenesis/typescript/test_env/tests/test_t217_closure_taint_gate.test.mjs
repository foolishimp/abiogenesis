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
