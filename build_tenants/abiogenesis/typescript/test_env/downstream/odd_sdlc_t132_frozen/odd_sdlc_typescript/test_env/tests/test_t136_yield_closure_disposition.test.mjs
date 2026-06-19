// Validates: T-136

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructSdlcConstructionIntent,
  constructSdlcWorksiteEvidence,
  constructSdlcEdgeFulfillmentLedger,
  deriveSdlcEdgeClosureDecision,
  constructSdlcNextActionProjection
} from "../../build/semantic/code/src/index.js";

const INTENT_EVENT_REFS = ["event://t136/intent/source"];
const PRODUCT_ASSET_MODEL_REF = "product-asset-model://t136/current";
const GAP_PRESSURE_REFS = ["gap-pressure://t136/current"];
const TARGET_BINDING_REFS = ["target-binding://t136/current"];

function intentBasis() {
  return {
    intentEventRefs: INTENT_EVENT_REFS,
    productAssetModelRef: PRODUCT_ASSET_MODEL_REF
  };
}

function nextActionBasis() {
  return {
    ...intentBasis(),
    gapPressureRefs: GAP_PRESSURE_REFS,
    targetBindingRefs: TARGET_BINDING_REFS
  };
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t136/${caseId}`,
    compositionDigest: `digest://t136/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t136/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t136/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t136/${caseId}`,
    graphVectorRef: `graph-vector://t136/${caseId}`,
    basisRef: `basis://t136/${caseId}`
  });
}

function openLedger() {
  return constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("edge-1"),
    ledgerRef: "ledger://t136/edge-1",
    ledgerVersionRef: "ledger-version://t136/edge-1/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/1",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/worksite-1"],
    materializationRefs: ["file://workspace/.ai-workspace/assets/t136.md"],
    livenessProjectionRefs: ["liveness://t136/active"],
    admissionRefs: ["admission://t136/evidence-1"],
    counts: {
      expected: 2,
      fulfilled: 1,
      partial: 1,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
}

test("T-136 yield is a first-class closure disposition with replay-visible resume basis", () => {
  const ledger = openLedger();
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t136/yield-1",
    ledger,
    currentEdgeLawful: true,
    yieldResumeBasis: {
      yieldKind: "budget_checkpoint_with_admitted_progress",
      resumeBasisRef: "resume-basis://t136/edge-1/attempt-1",
      currentEdgeRef: ledger.edgeRef,
      admittedProgressRefs: ["progress://t136/materialized-partial-doc"],
      livenessProjectionRef: "liveness://t136/active",
      resumePolicyRef: "resume-policy://t136/same-edge"
    }
  });

  assert.equal(decision.disposition, "yield");
  assert.equal(
    decision.yieldResumeBasis?.yieldKind,
    "budget_checkpoint_with_admitted_progress"
  );
  assert.equal(
    decision.yieldResumeBasis?.resumeBasisRef,
    "resume-basis://t136/edge-1/attempt-1"
  );
  assert.deepEqual(decision.yieldResumeBasis?.admittedProgressRefs, [
    "progress://t136/materialized-partial-doc"
  ]);
  assert.equal(decision.predecessorRefs.includes(ledger.ledgerVersionRef), true);

  const projection = constructSdlcNextActionProjection({
    selectedComposition: ledger.selectedComposition,
    nextActionProjectionRef: "next-action://t136/yield-view",
    nextActionBasisKind: "post_yield_resume",
    ...nextActionBasis(),
    closureDecision: decision,
    observationRef: "observation://t136/post-evidence",
    policyRefs: ["policy://t136/default"],
    actionCatalogRefs: ["catalog://t136/actions"]
  });

  assert.equal(projection.choosesNextTraversal, false);
  assert.equal(projection.selectedActionRef, null);
  assert.equal(projection.nextActionBasisKind, "post_yield_resume");
  assert.throws(
    () =>
      constructSdlcNextActionProjection({
        selectedComposition: ledger.selectedComposition,
        nextActionProjectionRef: "next-action://t136/yield-with-action",
        nextActionBasisKind: "post_yield_resume",
        ...nextActionBasis(),
        closureDecision: decision,
        observationRef: "observation://t136/post-evidence",
        policyRefs: ["policy://t136/default"],
        actionCatalogRefs: ["catalog://t136/actions"],
        selectedActionRef: "action://t136/should-not-run"
      }),
    /post_yield_resume basis cannot select a next action/
  );
});

test("T-136 yield fails closed when the current edge is no longer lawful", () => {
  assert.throws(
    () =>
      deriveSdlcEdgeClosureDecision({
        decisionRef: "closure-decision://t136/yield-illegal-edge",
        ledger: openLedger(),
        currentEdgeLawful: false,
        yieldResumeBasis: {
          yieldKind: "operator_requested_bounded_stop",
          resumeBasisRef: "resume-basis://t136/illegal",
          currentEdgeRef: "edge://t136/current",
          admittedProgressRefs: ["progress://t136/some-work"],
          livenessProjectionRef: null,
          resumePolicyRef: "resume-policy://t136/same-edge"
        }
      }),
    /yield requires the current edge to remain lawful/
  );
});

test("T-136 yield fails closed without admitted progress or waiting evidence", () => {
  assert.throws(
    () =>
      deriveSdlcEdgeClosureDecision({
        decisionRef: "closure-decision://t136/yield-no-progress",
        ledger: openLedger(),
        currentEdgeLawful: true,
        yieldResumeBasis: {
          yieldKind: "process_active_under_liveness_observer",
          resumeBasisRef: "resume-basis://t136/no-progress",
          currentEdgeRef: "edge://t136/current",
          admittedProgressRefs: [],
          livenessProjectionRef: "liveness://t136/active",
          resumePolicyRef: "resume-policy://t136/same-edge"
        }
      }),
    /admittedProgressRefs must contain at least one ref/
  );
});

test("T-136 yield rejects liveness-only progress aliases", () => {
  assert.throws(
    () =>
      deriveSdlcEdgeClosureDecision({
        decisionRef: "closure-decision://t136/yield-liveness-only",
        ledger: openLedger(),
        currentEdgeLawful: true,
        yieldResumeBasis: {
          yieldKind: "process_active_under_liveness_observer",
          resumeBasisRef: "resume-basis://t136/liveness-only",
          currentEdgeRef: "edge://t136/current",
          admittedProgressRefs: ["liveness://t136/active"],
          livenessProjectionRef: "liveness://t136/active",
          resumePolicyRef: "resume-policy://t136/same-edge"
        }
      }),
    /yield requires admitted progress beyond liveness refs/
  );
});

test("T-136 liveness interruption alone does not close semantic truth", () => {
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("liveness-only"),
    ledgerRef: "ledger://t136/liveness-only",
    ledgerVersionRef: "ledger-version://t136/liveness-only/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/liveness-only",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/liveness-only"],
    livenessProjectionRefs: ["liveness://t136/interrupted"],
    counts: {
      expected: 1,
      fulfilled: 0,
      partial: 0,
      blocked: 0,
      unfulfilled: 1,
      missing: 0,
      extra: 0
    }
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t136/liveness-only",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: ["liveness://t136/interrupted"]
  });

  assert.equal(decision.disposition, "block");
  assert.notEqual(decision.disposition, "close");
  assert.equal(decision.yieldResumeBasis, null);
});

test("T-136 close can select graph continuation only through post-close evaluate_next basis", () => {
  const closedLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("closed"),
    ledgerRef: "ledger://t136/closed",
    ledgerVersionRef: "ledger-version://t136/closed/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/closed",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/closed"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t136/closed",
    ledger: closedLedger,
    currentEdgeLawful: true
  });

  assert.equal(decision.disposition, "close");
  assert.equal(closedLedger.carryConverged, true);
  assert.equal(closedLedger.fulfillmentConverged, true);
  assert.equal(closedLedger.admitted, true);
  assert.equal(closedLedger.targetCertificationPassed, true);
  assert.equal(closedLedger.fdRecheckPassed, true);
  const projection = constructSdlcNextActionProjection({
    selectedComposition: closedLedger.selectedComposition,
    nextActionProjectionRef: "next-action://t136/closed-with-action",
    nextActionBasisKind: "post_close_graph_continuation",
    ...nextActionBasis(),
    closureDecision: decision,
    observationRef: "observation://t136/post-close",
    policyRefs: ["policy://t136/default"],
    actionCatalogRefs: ["catalog://t136/actions"],
    selectedActionRef: "action://t136/next-graph-edge",
    nextGraphFunctionRef: "graph-function://t136/next",
    nextGraphVectorRef: "graph-vector://t136/next/0"
  });

  assert.equal(projection.nextActionBasisKind, "post_close_graph_continuation");
  assert.equal(projection.choosesNextTraversal, true);
  assert.equal(projection.selectedActionRef, "action://t136/next-graph-edge");
  assert.throws(
    () =>
      constructSdlcNextActionProjection({
        selectedComposition: closedLedger.selectedComposition,
        nextActionProjectionRef: "next-action://t136/closed-wrong-basis",
        nextActionBasisKind: "post_retry",
        ...nextActionBasis(),
        closureDecision: decision,
        observationRef: "observation://t136/post-close",
        policyRefs: ["policy://t136/default"],
        actionCatalogRefs: ["catalog://t136/actions"],
        selectedActionRef: "action://t136/next-graph-edge"
      }),
    /post_retry basis does not match close closure decision/
  );
});

test("T-136 close requires carry, admission, target certification, and F_D recheck gates", () => {
  const withExtra = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("extra"),
    ledgerRef: "ledger://t136/extra",
    ledgerVersionRef: "ledger-version://t136/extra/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/extra",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/extra"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 1
    }
  });
  assert.equal(withExtra.carryConverged, false);
  assert.equal(withExtra.fulfillmentConverged, true);
  assert.equal(withExtra.edgeConverged, false);

  const notAdmitted = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("not-admitted"),
    ledgerRef: "ledger://t136/not-admitted",
    ledgerVersionRef: "ledger-version://t136/not-admitted/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/not-admitted",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/not-admitted"],
    admitted: false,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  assert.equal(notAdmitted.carryConverged, true);
  assert.equal(notAdmitted.fulfillmentConverged, true);
  assert.equal(notAdmitted.edgeConverged, false);

  const noTargetCertification = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("no-target-certification"),
    ledgerRef: "ledger://t136/no-target-certification",
    ledgerVersionRef: "ledger-version://t136/no-target-certification/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/no-target-certification",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/no-target-certification"],
    targetCertificationPassed: false,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  assert.equal(noTargetCertification.edgeConverged, false);

  const noFdRecheck = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("no-fd-recheck"),
    ledgerRef: "ledger://t136/no-fd-recheck",
    ledgerVersionRef: "ledger-version://t136/no-fd-recheck/attempt-1",
    edgeRef: "edge://t136/current",
    attemptRef: "attempt://t136/no-fd-recheck",
    targetBindingRefs: ["target-binding://t136/current"],
    evidenceBundleRefs: ["evidence://t136/no-fd-recheck"],
    fdRecheckPassed: false,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  assert.equal(noFdRecheck.edgeConverged, false);
});

test("T-136 closure disposition precedence is explicit policy input", () => {
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t136/custom-policy",
    ledger: openLedger(),
    currentEdgeLawful: true,
    retryReasonRefs: ["retry://t136/same-edge"],
    repriceReasonRefs: ["reprice://t136/requirement"],
    closurePolicy: {
      kind: "sdlc_edge_closure_policy",
      policyRef: "closure-policy://t136/retry-before-reprice",
      dispositionPrecedence: [
        "close",
        "yield",
        "retry",
        "reprice",
        "repair",
        "re-enter",
        "block"
      ]
    }
  });

  assert.equal(decision.disposition, "retry");
  assert.equal(
    decision.predecessorRefs.includes(
      "closure-policy://t136/retry-before-reprice"
    ),
    true
  );
});

test("T-136 evidence is not admitted without intent and invocation causation refs", () => {
  const intent = constructSdlcConstructionIntent({
    intentRef: "intent://t136/selected",
    ...intentBasis(),
    selectedPriorityRowRef: "priority-row://t136/selected",
    nextActionProjectionRef: "next-action://t136/pre-invoke",
    selectedActionRef: "action://t136/run-current-edge",
    basisRefs: ["basis://t136"]
  });

  assert.equal(intent.predecessorRefs.includes("priority-row://t136/selected"), true);
  assert.throws(
    () =>
      constructSdlcWorksiteEvidence({
        evidenceBundleRef: "evidence://t136/orphan",
        intentRef: intent.intentRef,
        invocationRef: "",
        admittedProgressRefs: ["progress://t136/orphan"]
      }),
    /invocationRef must be non-empty/
  );
});
