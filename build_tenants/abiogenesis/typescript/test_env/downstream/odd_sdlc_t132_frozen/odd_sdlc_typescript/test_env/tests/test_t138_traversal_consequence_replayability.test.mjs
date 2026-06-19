// Validates: T-138

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructSdlcConstructionIntent,
  constructSdlcWorksiteEvidence,
  constructSdlcEdgeFulfillmentLedger,
  deriveSdlcEdgeClosureDecision,
  constructSdlcNextActionProjection,
  assertSdlcTraversalConsequenceReplayable
} from "../../build/semantic/code/src/index.js";

const INTENT_EVENT_REFS = ["event://t138/intent/source"];
const PRODUCT_ASSET_MODEL_REF = "product-asset-model://t138/current";
const GAP_PRESSURE_REFS = ["gap-pressure://t138/current"];
const TARGET_BINDING_REFS = ["target-binding://t138/current"];

function abgTraversalTransitionRef(caseId) {
  return `abg-runtime-transition://t138/${encodeURIComponent(caseId)}`;
}

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
    compositionRef: `abg.fn_composition://t138/${caseId}`,
    compositionDigest: `digest://t138/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t138/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t138/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t138/${caseId}`,
    graphVectorRef: `graph-vector://t138/${caseId}`,
    basisRef: `basis://t138/${caseId}`
  });
}

function consequence() {
  const composition = selectedComposition("current-edge");
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef: "intent://t138/selected",
    ...intentBasis(),
    selectedPriorityRowRef: "priority-row://t138/selected",
    nextActionProjectionRef: "next-action://t138/pre-invoke",
    selectedActionRef: "action://t138/current-edge",
    basisRefs: ["basis://t138/current"]
  });
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t138/worksite",
    intentRef: constructionIntent.intentRef,
    invocationRef: "invocation://t138/graph-call",
    processEventRefs: ["process-event://t138/exited-zero"],
    productEvidenceRefs: ["asset://t138/generated"],
    admittedProgressRefs: ["progress://t138/generated"],
    livenessProjectionRefs: ["liveness://t138/active"]
  });
  const edgeFulfillmentLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t138/current-edge",
    ledgerVersionRef: "ledger-version://t138/current-edge/attempt-1",
    edgeRef: "edge://t138/current",
    attemptRef: "attempt://t138/1",
    targetBindingRefs: ["target-binding://t138/current"],
    evidenceBundleRefs: [worksiteEvidence.evidenceBundleRef],
    materializationRefs: ["asset://t138/generated"],
    livenessProjectionRefs: ["liveness://t138/active"],
    admissionRefs: ["admission://t138/worksite"],
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
  const edgeClosureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t138/yield",
    ledger: edgeFulfillmentLedger,
    currentEdgeLawful: true,
    yieldResumeBasis: {
      yieldKind: "partial_product_evidence_admitted_current_edge_should_resume",
      resumeBasisRef: "resume-basis://t138/current-edge",
      currentEdgeRef: edgeFulfillmentLedger.edgeRef,
      admittedProgressRefs: worksiteEvidence.admittedProgressRefs,
      livenessProjectionRef: "liveness://t138/active",
      resumePolicyRef: "resume-policy://t138/same-edge"
    }
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t138/post-evidence",
    ...nextActionBasis(),
    closureDecision: edgeClosureDecision,
    observationRef: "observation://t138/post-evidence",
    policyRefs: ["policy://t138/default"],
    actionCatalogRefs: ["catalog://t138/actions"]
  });

  return Object.freeze({
    constructionIntent,
    worksiteEvidence,
    edgeFulfillmentLedger,
    edgeClosureDecision,
    nextActionProjection
  });
}

function secondEvidenceFor(intentRef) {
  return constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t138/worksite-2",
    intentRef,
    invocationRef: "invocation://t138/graph-call-2",
    processEventRefs: ["process-event://t138/exited-zero-2"],
    productEvidenceRefs: ["asset://t138/generated-2"],
    admittedProgressRefs: ["progress://t138/generated-2"]
  });
}

test("T-138 replay reconstructs the full causal chain from predecessor refs", () => {
  const rows = consequence();
  const replay = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [rows.constructionIntent],
    worksiteEvidence: [rows.worksiteEvidence],
    edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
    edgeClosureDecisions: [rows.edgeClosureDecision],
    nextActionProjections: [rows.nextActionProjection],
    finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    abgTraversalTransitionRef: abgTraversalTransitionRef("post-evidence")
  });

  assert.deepEqual(replay.refs, {
    kind: "sdlc_traversal_consequence_refs",
    compositionRef: rows.nextActionProjection.compositionRef,
    compositionDigest: rows.nextActionProjection.compositionDigest,
    compositionSelectionRef: rows.nextActionProjection.compositionSelectionRef,
    selectedRegimeBindingRef: rows.nextActionProjection.selectedRegimeBindingRef,
    constructionIntentRef: rows.constructionIntent.intentRef,
    worksiteEvidenceRef: rows.worksiteEvidence.evidenceBundleRef,
    edgeFulfillmentLedgerRef: rows.edgeFulfillmentLedger.ledgerVersionRef,
    edgeClosureDecisionRef: rows.edgeClosureDecision.decisionRef,
    nextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    admittedStateRef: replay.admittedStateRef.frameRef,
    consequenceProjectionRef: replay.consequenceProjection.consequenceRef
  });
  assert.equal(
    replay.consequenceProjection.traversalTransitionRef,
    abgTraversalTransitionRef("post-evidence")
  );
  assert.notEqual(
    replay.consequenceProjection.traversalTransitionRef,
    rows.nextActionProjection.nextActionProjectionRef
  );
});

test("T-138 initial next-action selection has no synthetic closure decision", () => {
  const projection = constructSdlcNextActionProjection({
    selectedComposition: selectedComposition("initial"),
    nextActionProjectionRef: "next-action://t138/initial",
    nextActionBasisKind: "initial_selection",
    ...nextActionBasis(),
    observationRef: "observation://t138/initial",
    policyRefs: ["policy://t138/default"],
    actionCatalogRefs: ["catalog://t138/actions"],
    selectedActionRef: "action://t138/first-edge",
    nextGraphFunctionRef: "graph-function://t138/root",
    nextGraphVectorRef: "graph-vector://t138/root/0"
  });

  assert.equal(projection.nextActionBasisKind, "initial_selection");
  assert.equal(projection.closureDecisionRef, null);
  assert.equal(projection.choosesNextTraversal, true);
  assert.equal(projection.predecessorRefs.includes(PRODUCT_ASSET_MODEL_REF), true);
  assert.deepEqual(projection.intentEventRefs, INTENT_EVENT_REFS);
  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [],
        worksiteEvidence: [],
        edgeFulfillmentLedgers: [],
        edgeClosureDecisions: [],
        nextActionProjections: [projection],
        finalNextActionProjectionRef: projection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("initial")
      }),
    /initial next-action projection and cannot replay an action consequence/
  );
});

test("T-138 broken ledger predecessor refs fail replayability", () => {
  const rows = consequence();
  const brokenLedger = Object.freeze({
    ...rows.edgeFulfillmentLedger,
    predecessorRefs: Object.freeze([rows.worksiteEvidence.evidenceBundleRef])
  });

  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [rows.constructionIntent],
        worksiteEvidence: [rows.worksiteEvidence],
        edgeFulfillmentLedgers: [brokenLedger],
        edgeClosureDecisions: [rows.edgeClosureDecision],
        nextActionProjections: [rows.nextActionProjection],
        finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("broken-ledger")
      }),
    /ledger:\/\/t138\/current-edge missing predecessor refs: target-binding:\/\/t138\/current/
  );
});

test("T-138 replay validates every evidence bundle referenced by the ledger", () => {
  const rows = consequence();
  const extraEvidence = secondEvidenceFor(rows.constructionIntent.intentRef);
  const composition = selectedComposition("multi-evidence");
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t138/multi-evidence",
    ledgerVersionRef: "ledger-version://t138/multi-evidence/attempt-1",
    edgeRef: "edge://t138/current",
    attemptRef: "attempt://t138/multi-evidence",
    targetBindingRefs: ["target-binding://t138/current"],
    evidenceBundleRefs: [
      rows.worksiteEvidence.evidenceBundleRef,
      extraEvidence.evidenceBundleRef
    ],
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
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t138/multi-evidence",
    ledger,
    currentEdgeLawful: true,
    retryReasonRefs: ["retry://t138/multi-evidence"]
  });
  const projection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t138/multi-evidence",
    ...nextActionBasis(),
    closureDecision: decision,
    observationRef: "observation://t138/multi-evidence",
    policyRefs: ["policy://t138/default"],
    actionCatalogRefs: ["catalog://t138/actions"],
    selectedActionRef: "action://t138/retry-current-edge"
  });
  const brokenExtraEvidence = Object.freeze({
    ...extraEvidence,
    predecessorRefs: Object.freeze([extraEvidence.intentRef])
  });

  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [rows.constructionIntent],
        worksiteEvidence: [rows.worksiteEvidence, brokenExtraEvidence],
        edgeFulfillmentLedgers: [ledger],
        edgeClosureDecisions: [decision],
        nextActionProjections: [projection],
        finalNextActionProjectionRef: projection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("multi-evidence")
      }),
    /evidence:\/\/t138\/worksite-2 missing predecessor refs: invocation:\/\/t138\/graph-call-2/
  );
});

test("T-138 replay rejects multi-evidence ledgers that mix intents", () => {
  const rows = consequence();
  const composition = selectedComposition("mixed-intents");
  const unrelatedIntent = constructSdlcConstructionIntent({
    intentRef: "intent://t138/other",
    ...intentBasis(),
    selectedPriorityRowRef: "priority-row://t138/other",
    nextActionProjectionRef: "next-action://t138/other",
    selectedActionRef: "action://t138/other",
    basisRefs: ["basis://t138/other"]
  });
  const unrelatedEvidence = secondEvidenceFor(unrelatedIntent.intentRef);
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t138/mixed-intents",
    ledgerVersionRef: "ledger-version://t138/mixed-intents/attempt-1",
    edgeRef: "edge://t138/current",
    attemptRef: "attempt://t138/mixed-intents",
    targetBindingRefs: ["target-binding://t138/current"],
    evidenceBundleRefs: [
      rows.worksiteEvidence.evidenceBundleRef,
      unrelatedEvidence.evidenceBundleRef
    ],
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
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t138/mixed-intents",
    ledger,
    currentEdgeLawful: true,
    retryReasonRefs: ["retry://t138/mixed-intents"]
  });
  const projection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t138/mixed-intents",
    ...nextActionBasis(),
    closureDecision: decision,
    observationRef: "observation://t138/mixed-intents",
    policyRefs: ["policy://t138/default"],
    actionCatalogRefs: ["catalog://t138/actions"],
    selectedActionRef: "action://t138/retry-current-edge"
  });

  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [rows.constructionIntent, unrelatedIntent],
        worksiteEvidence: [rows.worksiteEvidence, unrelatedEvidence],
        edgeFulfillmentLedgers: [ledger],
        edgeClosureDecisions: [decision],
        nextActionProjections: [projection],
        finalNextActionProjectionRef: projection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("mixed-intents")
      }),
    /ledger:\/\/t138\/mixed-intents references evidence from multiple intents/
  );
});

test("T-138 orphan closure decision fails replayability", () => {
  const rows = consequence();
  const brokenDecision = Object.freeze({
    ...rows.edgeClosureDecision,
    predecessorRefs: Object.freeze([])
  });

  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [rows.constructionIntent],
        worksiteEvidence: [rows.worksiteEvidence],
        edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
        edgeClosureDecisions: [brokenDecision],
        nextActionProjections: [rows.nextActionProjection],
        finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("orphan-closure")
      }),
    /closure-decision:\/\/t138\/yield missing predecessor refs/
  );
});

test("T-138 replay is deterministic when caller arrays are shuffled", () => {
  const rows = consequence();
  const unrelatedIntent = constructSdlcConstructionIntent({
    intentRef: "intent://t138/unrelated",
    ...intentBasis(),
    selectedPriorityRowRef: "priority-row://t138/unrelated",
    nextActionProjectionRef: "next-action://t138/unrelated",
    selectedActionRef: "action://t138/unrelated",
    basisRefs: ["basis://t138/unrelated"]
  });
  const unrelatedEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t138/unrelated",
    intentRef: unrelatedIntent.intentRef,
    invocationRef: "invocation://t138/unrelated",
    admittedProgressRefs: ["progress://t138/unrelated"]
  });
  const first = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [unrelatedIntent, rows.constructionIntent],
    worksiteEvidence: [rows.worksiteEvidence, unrelatedEvidence],
    edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
    edgeClosureDecisions: [rows.edgeClosureDecision],
    nextActionProjections: [rows.nextActionProjection],
    finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    abgTraversalTransitionRef: abgTraversalTransitionRef("deterministic")
  });
  const second = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [rows.constructionIntent, unrelatedIntent],
    worksiteEvidence: [unrelatedEvidence, rows.worksiteEvidence],
    edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
    edgeClosureDecisions: [rows.edgeClosureDecision],
    nextActionProjections: [rows.nextActionProjection],
    finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    abgTraversalTransitionRef: abgTraversalTransitionRef("deterministic")
  });

  assert.deepEqual(first.refs, second.refs);
  assert.deepEqual(first.edgeClosureDecision, second.edgeClosureDecision);
});

test("T-138 post-action projections must cite model, gap, binding, closure, observation, policy, and catalog predecessors", () => {
  const rows = consequence();
  const brokenProjection = Object.freeze({
    ...rows.nextActionProjection,
    predecessorRefs: Object.freeze([rows.edgeClosureDecision.decisionRef])
  });

  assert.throws(
    () =>
      assertSdlcTraversalConsequenceReplayable({
        constructionIntents: [rows.constructionIntent],
        worksiteEvidence: [rows.worksiteEvidence],
        edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
        edgeClosureDecisions: [rows.edgeClosureDecision],
        nextActionProjections: [brokenProjection],
        finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
        abgTraversalTransitionRef: abgTraversalTransitionRef("broken-projection")
      }),
    /next-action:\/\/t138\/post-evidence missing predecessor refs/
  );
});
