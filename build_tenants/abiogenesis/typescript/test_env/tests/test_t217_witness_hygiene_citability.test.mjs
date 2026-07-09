// T-217 Phase 1 S3 — REQ-R-ABG3-WITNESS-007/-008.
// Workspace hygiene: kernel-joined digests, internally-consistent
// classification by admission law, the mechanical copy-out rule, taint
// resolved only by clean re-measurement; citability = converged AND
// zero reprices AND hygiene clean, failing conjunct exposed.
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructDeclarationRepriceAdmittedEvent,
  constructWorkspaceHygieneStampedEvent,
  deriveCitabilityPredicate,
  deriveWorkspaceHygienePredicate,
  deriveWorkspaceHygieneRows,
  latestAdmittedArtifactDigests
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  admitWorkspaceHygieneStamp
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";

function artifactObserved(artifactRef, digest, basisId = "basis://t217/s3") {
  // synthetic replay row: the derivations read kind + artifactRef +
  // artifactContentDigest; basisId keeps route-side filtering honest
  return {
    kind: "actor_result_artifact_observed",
    basisId,
    graphFunctionId: "graph-function://t217/s3",
    runId: "run://t217/s3",
    workKey: "wk://t217/s3",
    graphCallId: "graph-call://t217/s3",
    frameId: "frame://t217/s3",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/s3",
    workerId: "worker://t217",
    backendId: "backend://node",
    causationEventRefs: [],
    correlationId: "correlation://t217/s3/artifact",
    resultRef: `result://t217/s3/${encodeURIComponent(artifactRef)}`,
    artifactRef,
    artifactContentDigest: digest,
    artifactContentExcerpt: null
  };
}

function hygieneStamp(rows, overrides = {}) {
  return constructWorkspaceHygieneStampedEvent({
    basisId: "basis://t217/s3",
    runId: "run://t217/s3",
    workKey: "wk://t217/s3",
    segmentRef: null,
    observedBy: "operator://jim/digest-instrument",
    rows,
    ...overrides
  });
}

function cleanRow(artifactRef, digest) {
  return {
    artifactRef,
    observedDigest: digest,
    admittedDigest: digest,
    classification: "clean",
    copyOutRef: null
  };
}

function foreignRow(artifactRef, observed, admitted, copyOutRef) {
  return {
    artifactRef,
    observedDigest: observed,
    admittedDigest: admitted,
    classification: "foreign_write",
    copyOutRef
  };
}

test("T-217 S3 d1: hygiene row admission — classification is digest-pair law, copy-out mandatory for foreign writes, hygieneRef self-certified", () => {
  const valid = hygieneStamp([
    cleanRow("artifact://a", "digest-1"),
    foreignRow("artifact://b", "digest-x", "digest-y", "copyout://b/1"),
    {
      artifactRef: "artifact://c",
      observedDigest: null,
      admittedDigest: "digest-c",
      classification: "missing",
      copyOutRef: null
    },
    {
      artifactRef: "artifact://d",
      observedDigest: "digest-d",
      admittedDigest: null,
      classification: "untracked",
      copyOutRef: null
    }
  ]);
  assertRuntimeEvent(valid);
  assert.match(valid.hygieneRef, /^workspace-hygiene:/u);

  // a mislabeled pair is inadmissible — classification is derived law
  const mislabeled = hygieneStamp([
    {
      artifactRef: "artifact://b",
      observedDigest: "digest-x",
      admittedDigest: "digest-y",
      classification: "clean",
      copyOutRef: null
    }
  ]);
  assert.throws(
    () => assertRuntimeEvent(mislabeled),
    /classification must equal the digest-pair-derived class foreign_write/u
  );
  // foreign-write truth without the preserved copy is inadmissible
  const noCopyOut = hygieneStamp([
    foreignRow("artifact://b", "digest-x", "digest-y", null)
  ]);
  assert.throws(
    () => assertRuntimeEvent(noCopyOut),
    /copyOutRef is required for foreign_write/u
  );
  // a row witnessing nothing is inadmissible
  const emptyRow = hygieneStamp([
    {
      artifactRef: "artifact://e",
      observedDigest: null,
      admittedDigest: null,
      classification: "missing",
      copyOutRef: null
    }
  ]);
  assert.throws(
    () => assertRuntimeEvent(emptyRow),
    /requires an observed or admitted digest/u
  );
  // forged identity is inadmissible
  assert.throws(
    () =>
      assertRuntimeEvent({ ...valid, hygieneRef: "workspace-hygiene:forged" }),
    /hygieneRef must be the content-derived identity/u
  );
});

test("T-217 S3 d2: the kernel join — observations x latest admitted digests -> classified rows", () => {
  const replay = [
    artifactObserved("artifact://report", "digest-v1"),
    artifactObserved("artifact://report", "digest-v2"),
    artifactObserved("artifact://log", "digest-log"),
    artifactObserved("artifact://gone", "digest-gone")
  ].map((event) => emit(event, () => {})[0]);
  assert.equal(
    latestAdmittedArtifactDigests(replay).get("artifact://report"),
    "digest-v2",
    "the LATEST admitted digest is the re-measurement baseline"
  );
  // codex P1: ordinal truth, not array order — shuffled replay is stable
  assert.equal(
    latestAdmittedArtifactDigests([...replay].reverse()).get("artifact://report"),
    "digest-v2"
  );
  // disagreeing unorderable candidates fail closed
  assert.throws(
    () =>
      latestAdmittedArtifactDigests([
        artifactObserved("artifact://raw", "digest-a"),
        artifactObserved("artifact://raw", "digest-b")
      ]),
    /requires admission ordinals/u
  );
  // agreeing duplicates need no ordinals
  assert.equal(
    latestAdmittedArtifactDigests([
      artifactObserved("artifact://dup", "digest-same"),
      artifactObserved("artifact://dup", "digest-same")
    ]).get("artifact://dup"),
    "digest-same"
  );
  const rows = deriveWorkspaceHygieneRows({
    observations: [
      { artifactRef: "artifact://report", observedDigest: "digest-v2" },
      {
        artifactRef: "artifact://log",
        observedDigest: "digest-tampered",
        copyOutRef: "copyout://log/1"
      },
      { artifactRef: "artifact://gone", observedDigest: null },
      { artifactRef: "artifact://new", observedDigest: "digest-new" }
    ],
    replayEvents: replay
  });
  const byRef = new Map(rows.map((row) => [row.artifactRef, row]));
  assert.equal(byRef.get("artifact://report").classification, "clean");
  assert.equal(byRef.get("artifact://log").classification, "foreign_write");
  assert.equal(byRef.get("artifact://log").copyOutRef, "copyout://log/1");
  assert.throws(
    () =>
      deriveWorkspaceHygieneRows({
        observations: [{ artifactRef: "artifact://gone", observedDigest: null }],
        replayEvents: []
      }),
    /requires an observed or admitted digest/u,
    "a missing observation for a never-admitted artifact witnesses nothing"
  );
  assert.equal(byRef.get("artifact://gone").classification, "missing");
  assert.equal(byRef.get("artifact://new").classification, "untracked");
});

test("T-217 S3 d3: taint resolves ONLY by clean re-measurement, in ORDINAL order — array shuffles cannot flip cleanliness", () => {
  const [tainted] = emit(
    hygieneStamp([
      foreignRow("artifact://report", "digest-x", "digest-v2", "copyout://r/1"),
      {
        artifactRef: "artifact://new",
        observedDigest: "digest-new",
        admittedDigest: null,
        classification: "untracked",
        copyOutRef: null
      }
    ]),
    () => {}
  );
  const afterTaint = deriveWorkspaceHygienePredicate([tainted]);
  assert.equal(afterTaint.hygieneClean, false);
  assert.deepEqual(afterTaint.taintedArtifactRefs, ["artifact://report"]);

  // a later clean re-measurement resolves the taint
  const [remeasured] = emit(
    hygieneStamp([cleanRow("artifact://report", "digest-v2")]),
    () => {}
  );
  const afterRemeasure = deriveWorkspaceHygienePredicate([tainted, remeasured]);
  assert.equal(afterRemeasure.hygieneClean, true);
  assert.equal(afterRemeasure.stampCount, 2);

  // codex P1: ORDINAL truth decides — the shuffled array stays clean
  const shuffled = deriveWorkspaceHygienePredicate([remeasured, tainted]);
  assert.equal(shuffled.hygieneClean, true);

  // a taint stamped LATER (higher ordinal) taints, in any array order
  const [taintedAgain] = emit(
    hygieneStamp([
      foreignRow("artifact://report", "digest-y", "digest-v2", "copyout://r/2")
    ]),
    () => {}
  );
  assert.equal(
    deriveWorkspaceHygienePredicate([taintedAgain, tainted, remeasured]).hygieneClean,
    false
  );
  // multiple unorderable stamps fail closed
  assert.throws(
    () =>
      deriveWorkspaceHygienePredicate([
        hygieneStamp([cleanRow("artifact://a", "digest-1")]),
        hygieneStamp([cleanRow("artifact://b", "digest-2")])
      ]),
    /requires admission ordinals/u
  );
});

test("T-217 S3 d4: citability = converged AND frozen-law AND hygiene clean, with the failing conjunct exposed", () => {
  const converged = {
    kind: "terminal_reached",
    basisId: "basis://t217/s3",
    terminalKind: "converged",
    reason: null
  };
  const reprice = constructDeclarationRepriceAdmittedEvent({
    basisId: "basis://t217/s3",
    runId: "run://t217/s3",
    workKey: "wk://t217/s3",
    declarationRef: "gtl-declaration://t217/s3/subject",
    beforeDigest: "digest-a",
    afterDigest: "digest-b",
    changeClass: "requirement_reprice",
    owningTicketRef: "ticket://T-217",
    operatorActorRef: "operator://jim",
    reason: "s3 citability fixture"
  });
  const taint = hygieneStamp([
    foreignRow("artifact://report", "digest-x", "digest-v2", "copyout://r/1")
  ]);
  const cleanStamp = hygieneStamp([cleanRow("artifact://report", "digest-v2")]);

  const citable = deriveCitabilityPredicate([converged, cleanStamp]);
  assert.equal(citable.citable, true);
  assert.deepEqual(citable.failingConjuncts, []);
  assert.equal(citable.hygieneStampCount, 1);

  const notConverged = deriveCitabilityPredicate([cleanStamp]);
  assert.equal(notConverged.citable, false);
  assert.deepEqual(notConverged.failingConjuncts, ["converged"]);

  const repriced = deriveCitabilityPredicate([converged, reprice, cleanStamp]);
  assert.equal(repriced.citable, false);
  assert.deepEqual(repriced.failingConjuncts, ["frozen_law"]);
  assert.deepEqual(repriced.repriceRefs, [reprice.repriceRef]);

  const taintedRun = deriveCitabilityPredicate([converged, taint]);
  assert.equal(taintedRun.citable, false);
  assert.deepEqual(taintedRun.failingConjuncts, ["hygiene_clean"]);
  assert.deepEqual(taintedRun.taintedArtifactRefs, ["artifact://report"]);

  const everythingWrong = deriveCitabilityPredicate([reprice, taint]);
  assert.deepEqual(everythingWrong.failingConjuncts, [
    "converged",
    "frozen_law",
    "hygiene_clean"
  ]);
});

test("T-217 S3 d5: the measurement route joins, mints, admits canonically, and returns post-stamp predicates", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const priorReplay = [
    artifactObserved("artifact://report", "digest-v2", basis.id)
  ];
  const sunk = [];
  const result = admitWorkspaceHygieneStamp({
    basis,
    runtimeEvents: priorReplay,
    eventSink: (event) => sunk.push(event),
    observedBy: "operator://jim/digest-instrument",
    observations: [
      {
        artifactRef: "artifact://report",
        observedDigest: "digest-tampered",
        copyOutRef: "copyout://report/1"
      }
    ]
  });
  assert.equal(result.kind, "workspace_hygiene_stamp_result");
  const stamped = sunk.find((event) => event.kind === "workspace_hygiene_stamped");
  assert.ok(stamped);
  assert.ok(stamped.eventId, "the stamp is canonical replay truth");
  assert.equal(stamped.rows.length, 1);
  assert.equal(stamped.rows[0].classification, "foreign_write");
  assert.equal(
    stamped.rows[0].admittedDigest,
    "digest-v2",
    "the kernel joined the admitted digest — the instrument never supplies it"
  );
  assert.equal(result.hygiene.hygieneClean, false);
  assert.deepEqual(result.hygiene.taintedArtifactRefs, ["artifact://report"]);
  assert.equal(result.citability.citable, false);
  assert.ok(result.citability.failingConjuncts.includes("hygiene_clean"));
});

test("T-217 S3 h1 (self-review SR-1): materialized outputs are re-measurable surfaces — tampering taints instead of hiding as untracked", () => {
  const materialized = {
    kind: "output_materialization_observed",
    basisId: "basis://t217/s3",
    graphCallId: "graph-call://t217/s3",
    frameId: "frame://t217/s3",
    vectorIndex: 2,
    edge: "design→code",
    allocationId: "allocation://t217/s3/1",
    assetRef: "asset://t217/s3/code-module",
    materializedRef: "materialized://t217/s3/code-module/1",
    materializedPath: "/workspace/out/code-module.ts",
    digest: "digest-materialized-v1",
    observerRef: "observer://abg/output-allocation",
    artifactRefs: []
  };
  const baseline = latestAdmittedArtifactDigests([materialized]);
  assert.equal(
    baseline.get("materialized://t217/s3/code-module/1"),
    "digest-materialized-v1"
  );
  assert.equal(
    baseline.get("asset://t217/s3/code-module"),
    "digest-materialized-v1",
    "both handles carry the materialization digest"
  );
  // the exact pre-fix hole: this classified untracked (never taints)
  const rows = deriveWorkspaceHygieneRows({
    observations: [
      {
        artifactRef: "asset://t217/s3/code-module",
        observedDigest: "digest-tampered",
        copyOutRef: "copyout://code-module/1"
      }
    ],
    replayEvents: [materialized]
  });
  assert.equal(rows[0].classification, "foreign_write");
  assert.equal(rows[0].admittedDigest, "digest-materialized-v1");
  // matching re-measurement stays clean; re-materialization moves the baseline
  const [materializedCanonical] = emit({ ...materialized }, () => {});
  const [rematerialized] = emit(
    { ...materialized, digest: "digest-materialized-v2" },
    () => {}
  );
  const moved = deriveWorkspaceHygieneRows({
    observations: [
      {
        artifactRef: "materialized://t217/s3/code-module/1",
        observedDigest: "digest-materialized-v2"
      }
    ],
    replayEvents: [materializedCanonical, rematerialized]
  });
  assert.equal(moved[0].classification, "clean");
  // ordinal truth: shuffled replay keeps the moved baseline
  const movedShuffled = deriveWorkspaceHygieneRows({
    observations: [
      {
        artifactRef: "materialized://t217/s3/code-module/1",
        observedDigest: "digest-materialized-v2"
      }
    ],
    replayEvents: [rematerialized, materializedCanonical]
  });
  assert.equal(movedShuffled[0].classification, "clean");
});
