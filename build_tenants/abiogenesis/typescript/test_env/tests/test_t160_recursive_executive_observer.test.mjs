// Validates: T-160

import test from "node:test";
import assert from "node:assert/strict";

import * as publicRoot from "../../build/semantic/code/src/index.js";
import * as publicExecutive from "../../build/semantic/code/src/abg/executive/index.js";

const OBSERVATION_INPUT = Object.freeze({
  observerGraphFunctionRef: "graph-function://abg/executive/default-observer",
  targetWorkspaceContextRef: "context://t160/workspace",
  targetWorkspaceLocator: "workspace://t160/target",
  targetWorkspaceDigest: "sha256:t160-workspace",
  targetWorkRef: "work://t160/target-gap",
  selectedCompositionRef: "abg.fn-composition://t160/evaluate",
  selectedCompositionDigest: "sha256:t160-composition",
  graphFunctionRef: "graph-function://t160/target",
  graphVectorRef: "graph-vector://t160/target/repair",
  frameRefs: ["frame://t160/target", "frame://t160/executive"],
  replayEventRefs: ["runtime-event://t160/replay/1"],
  payloadLedgerRefs: ["payload-ledger://t160/target"],
  evidenceRefs: ["evidence://t160/current"],
  residualPressureRefs: ["pressure://t160/original-gap"],
  continuationRefs: ["continuation://t160/original-gap"],
  requirementIds: ["REQ-T160-PRESSURE"],
  spanLineage: [
    Object.freeze({
      kind: "requirement_span_lineage_projection",
      lineageRef: "requirement-span-lineage://t160/target",
      spanId: "span://t160/target",
      graphFunctionRef: "graph-function://t160/target",
      graphVectorRefs: ["graph-vector://t160/target/repair"],
      vectorIndexes: [0],
      sourceNodeRef: "node://t160/source",
      targetNodeRef: "node://t160/target",
      frameRefs: ["frame://t160/target"],
      zoomRefs: ["zoom://t160/detail"],
      foldbackRefs: ["foldback://t160/target"],
      aliasRefs: ["edge://t160/target"],
      active: true,
      sourceRefs: ["specification://t160"]
    })
  ],
  policyRefs: ["policy://t160/executive-default"],
  hookRefs: ["hook://abg/fp-consciousness/default"]
});

function finding(input = {}) {
  return publicRoot.constructFpEvaluationFinding({
    findingRef: input.findingRef ?? "finding://t160/pressure",
    evaluatorRef: "plugin://t160/executive-fp",
    gainReportRef: "gain://t160/executive",
    metricRefs: ["metric://t160/attenuation"],
    closeDisposition: input.closeDisposition ?? "no_close",
    residualPressureRefs:
      input.residualPressureRefs ?? ["pressure://t160/original-gap"],
    continuationRefs:
      input.continuationRefs ?? ["continuation://t160/repair/current-edge"],
    evidenceRefs: input.evidenceRefs ?? ["evidence://t160/fp-finding"],
    authorityRefs: input.authorityRefs ?? ["REQ-T160-PRESSURE"],
    compositionContributionRef: "abg.fn-regime://t160/fp",
    compositionRef: OBSERVATION_INPUT.selectedCompositionRef,
    compositionDigest: OBSERVATION_INPUT.selectedCompositionDigest,
    diagnosticRefs: input.diagnosticRefs ?? []
  });
}

function outcome(findings) {
  return publicRoot.constructFpEvaluationOutcome({
    status: "evaluated",
    ambiguityStatus: "partial",
    findings,
    evidenceRefs: ["evidence://t160/evaluation-outcome"],
    reason: "executive observer pressure projection"
  });
}

test("T-160 projects immutable executive observation view over existing refs", () => {
  const observation = publicExecutive.projectExecutiveObservationView(
    OBSERVATION_INPUT
  );
  assert.equal(observation.kind, "abg_executive_observation_view");
  assert.equal(
    observation.observerGraphFunctionRef,
    "graph-function://abg/executive/default-observer"
  );
  assert.equal(observation.spanLineage[0].spanId, "span://t160/target");
  assert.equal(Object.isFrozen(observation), true);
  assert.equal(Object.isFrozen(observation.frameRefs), true);
});

test("T-160 projects local repair pressure facts without owning continuation", () => {
  const observation = publicExecutive.projectExecutiveObservationView(
    OBSERVATION_INPUT
  );
  const facts = publicExecutive.projectExecutivePressureFacts({
    observation,
    outcome: outcome([
      finding({
        residualPressureRefs: ["pressure://t160/narrowed-gap"],
        continuationRefs: ["continuation://t160/repair/current-edge"]
      })
    ])
  });
  assert.equal(facts.length, 1);
  assert.equal(facts[0].attenuation, "escalated");
  assert.equal(facts[0].disposition, "local_repair");
  assert.deepEqual(facts[0].spanRefs, ["span://t160/target"]);

  const continuationInput = publicExecutive.projectExecutiveContinuationInput({
    observation,
    pressureFacts: facts
  });
  assert.equal(continuationInput.decision, "retry_or_repair");
  assert.deepEqual(continuationInput.continuationRefs, [
    "continuation://t160/repair/current-edge"
  ]);
});

test("T-160 detects non-attenuating same-pressure retry", () => {
  const observation = publicExecutive.projectExecutiveObservationView(
    OBSERVATION_INPUT
  );
  const facts = publicExecutive.projectExecutivePressureFacts({
    observation,
    outcome: outcome([finding()])
  });
  assert.equal(facts[0].attenuation, "unchanged");
  assert.equal(facts[0].disposition, "non_attenuating_retry");
});

test("T-160 routes nonlocal executive pressure to reentry projection input", () => {
  const observation = publicExecutive.projectExecutiveObservationView(
    OBSERVATION_INPUT
  );
  const facts = publicExecutive.projectExecutivePressureFacts({
    observation,
    outcome: outcome([
      finding({
        findingRef: "finding://t160/reentry",
        residualPressureRefs: ["pressure://t160/nonlocal"],
        continuationRefs: ["continuation://t160/reentry/requirements"],
        diagnosticRefs: ["diagnostic://t160/reentry-required"]
      })
    ])
  });
  assert.equal(facts[0].disposition, "nonlocal_reentry");
  const continuationInput = publicExecutive.projectExecutiveContinuationInput({
    observation,
    pressureFacts: facts
  });
  assert.equal(continuationInput.decision, "yield_reentry");
  assert.deepEqual(continuationInput.reentryRefs, [facts[0].pressureFactRef]);
});

test("T-160 runner wrapper composes observation, pressure, and continuation projections", () => {
  const result = publicRoot.runExecutiveObserverProjection({
    observation: OBSERVATION_INPUT,
    fpEvaluationOutcome: outcome([
      finding({
        findingRef: "finding://t160/runner-reentry",
        residualPressureRefs: ["pressure://t160/nonlocal"],
        continuationRefs: ["continuation://t160/reentry/requirements"],
        diagnosticRefs: ["diagnostic://t160/reentry-required"]
      })
    ])
  });
  assert.equal(result.kind, "abg_executive_observer_runner_result");
  assert.equal(result.observation.kind, "abg_executive_observation_view");
  assert.equal(result.pressureFacts.length, 1);
  assert.equal(result.pressureFacts[0].disposition, "nonlocal_reentry");
  assert.equal(result.continuationInput.decision, "yield_reentry");
  assert.equal(result.continuationInput.reentryRefs.length, 1);
});

test("T-160 rejects executive findings carrying runtime authority fields", () => {
  assert.throws(
    () =>
      publicRoot.assertExecutiveFindingHasNoRuntimeAuthority(
        Object.freeze({
          findingRef: "finding://t160/bad",
          emitRuntimeEvent: "runtime-event://forbidden"
        })
      ),
    /forbidden runtime authority/u
  );
});

test("T-160 public executive facade exposes projections only", () => {
  assert.equal(typeof publicExecutive.projectExecutiveObservationView, "function");
  assert.equal(typeof publicExecutive.projectExecutivePressureFacts, "function");
  assert.equal(typeof publicExecutive.projectExecutiveContinuationInput, "function");
  for (const forbidden of [
    "emitExecutivePressure",
    "runExecutiveWorker",
    "writeExecutiveLedger",
    "mintExecutiveAdmittedRef"
  ]) {
    assert.equal(Object.hasOwn(publicExecutive, forbidden), false);
  }
});
