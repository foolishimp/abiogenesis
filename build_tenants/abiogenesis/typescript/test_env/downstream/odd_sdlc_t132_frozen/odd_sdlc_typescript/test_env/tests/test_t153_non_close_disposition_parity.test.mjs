// Validates: T-153

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "@abiogenesis/typescript-tenant";

import {
  assertSdlcTraversalConsequenceReplayable,
  constructSdlcConstructionIntent,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  constructSdlcWorksiteEvidence,
  deriveOddSdlcEvaluateNextReport,
  deriveSdlcEdgeClosureDecision,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
} from "../../build/semantic/code/src/index.js";

function moduleBasis(caseId = "non-close") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/t153/${caseId}`,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: "bootstrap_release_self_test"
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://odd-sdlc/t153/${caseId}/F_P`,
      defaultRegime: "F_P",
      dispatchRef: `dispatch://odd-sdlc/t153/${caseId}`,
      approvalSubjectRef: null
    }),
    runId: `run://odd-sdlc/t153/${caseId}`,
    workKey: `wk://odd-sdlc/t153/${caseId}`,
    frameId: null,
    frameLineageId: null
  });
}

function graphFunctionRefFor(caseId) {
  const module = constructSdlcGtlModule();
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert(graphFunction, `${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET} must be published`);
  return graphFunction.name;
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t153/${caseId}`,
    compositionDigest: `digest://t153/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t153/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t153/${caseId}/evaluate/fp`,
    graphFunctionRef: graphFunctionRefFor(caseId),
    graphVectorRef: `graph-vector://t153/${caseId}/current`,
    basisRef: `basis://t153/${caseId}`
  });
}

function context(caseId, counts) {
  const intentEventRefs = [`event://t153/${caseId}/intent`];
  const productAssetModelRef = `product-asset-model://t153/${caseId}`;
  const targetBindingRefs = [`target-binding://t153/${caseId}/current-edge`];
  const selected = selectedComposition(caseId);
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef: `intent://t153/${caseId}/selected`,
    intentEventRefs,
    productAssetModelRef,
    selectedPriorityRowRef: `priority-row://t153/${caseId}/selected`,
    nextActionProjectionRef: `next-action://t153/${caseId}/pre-invoke`,
    selectedActionRef: `action://t153/${caseId}/initial`,
    basisRefs: [`basis://t153/${caseId}/initial`]
  });
  const admittedProgressRefs = [`progress://t153/${caseId}/worker-report-admitted`];
  const livenessProjectionRefs = [`liveness://t153/${caseId}/active`];
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: `evidence://t153/${caseId}/worksite`,
    intentRef: constructionIntent.intentRef,
    invocationRef: `invocation://t153/${caseId}/worker`,
    processEventRefs: [
      `process-event://t153/${caseId}/worker-started`,
      `process-event://t153/${caseId}/worker-reported`
    ],
    productEvidenceRefs: [`asset://t153/${caseId}/worker-output`],
    admittedProgressRefs,
    livenessProjectionRefs,
    predecessorRefs: [constructionIntent.nextActionProjectionRef]
  });
  const edgeFulfillmentLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selected,
    ledgerRef: `ledger://t153/${caseId}/edge`,
    ledgerVersionRef: `ledger-version://t153/${caseId}/edge/1`,
    edgeRef: `edge://t153/${caseId}/current`,
    attemptRef: `attempt://t153/${caseId}/1`,
    targetBindingRefs,
    evidenceBundleRefs: [worksiteEvidence.evidenceBundleRef],
    materializationRefs: worksiteEvidence.productEvidenceRefs,
    livenessProjectionRefs,
    admissionRefs: admittedProgressRefs,
    counts,
    predecessorRefs: [
      constructionIntent.intentRef,
      worksiteEvidence.evidenceBundleRef,
      ...targetBindingRefs
    ]
  });

  return Object.freeze({
    caseId,
    intentEventRefs,
    productAssetModelRef,
    targetBindingRefs,
    constructionIntent,
    worksiteEvidence,
    edgeFulfillmentLedger
  });
}

function openCounts() {
  return {
    expected: 2,
    fulfilled: 1,
    partial: 1,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  };
}

function blockedCounts() {
  return {
    expected: 2,
    fulfilled: 0,
    partial: 0,
    blocked: 1,
    unfulfilled: 1,
    missing: 0,
    extra: 0
  };
}

function noActionProjection(rows, decision) {
  return constructSdlcNextActionProjection({
    selectedComposition: rows.edgeFulfillmentLedger.selectedComposition,
    nextActionProjectionRef: `next-action://t153/${rows.caseId}/${decision.disposition}/no-action`,
    intentEventRefs: rows.intentEventRefs,
    productAssetModelRef: rows.productAssetModelRef,
    gapPressureRefs: [`pressure://t153/${rows.caseId}/${decision.disposition}`],
    targetBindingRefs: rows.targetBindingRefs,
    closureDecision: decision,
    observationRef: `observation://t153/${rows.caseId}/${decision.disposition}`,
    policyRefs: [`policy://t153/${rows.caseId}/no-action`],
    actionCatalogRefs: [`catalog://t153/${rows.caseId}/empty`]
  });
}

function evaluatorProjection(rows, decision, actionKind) {
  const targetOutcomeRef = `target-outcome://t153/${rows.caseId}/${decision.disposition}`;
  const action = {
    actionRef: `action://t153/${rows.caseId}/${actionKind}`,
    actionKind,
    graphFunctionRef: graphFunctionRefFor(rows.caseId),
    graphVectorRef: `vector://t153/${rows.caseId}/${actionKind}`,
    publishedTraversalTargetRef: `published-traversal-target://t153/${rows.caseId}/${actionKind}`,
    targetOutcomeRef,
    expectedOutputAssetRefs: [`asset://t153/${rows.caseId}/${actionKind}/output`],
    requiredAuthorityRefs: [decision.decisionRef],
    eligibleReasonRefs: decision.reasonRefs
  };
  const evaluator = deriveOddSdlcEvaluateNextReport({
    basis: moduleBasis(rows.caseId),
    events: [],
    nextActionBasisKind: {
      retry: "post_retry",
      repair: "post_repair",
      "re-enter": "post_reenter"
    }[decision.disposition],
    intentEventRefs: rows.intentEventRefs,
    productAssetModelRef: rows.productAssetModelRef,
    episodeId: `construction-episode://t153/${rows.caseId}/${decision.disposition}`,
    observationId: `construction-observation://t153/${rows.caseId}/${decision.disposition}`,
    pressures: [
      {
        pressureRef: `pressure://t153/${rows.caseId}/${decision.disposition}`,
        pressureKind: "gap_row",
        sourceRef: decision.decisionRef,
        affectedAssetRefs: action.expectedOutputAssetRefs,
        targetOutcomeRefs: [targetOutcomeRef],
        evidenceRefs: decision.reasonRefs,
        severity: 1
      }
    ],
    actions: [action]
  });

  assert(evaluator.selectedPriorityRow);
  assert.equal(evaluator.selectedPriorityRow.actionRef, action.actionRef);
  assert.equal(evaluator.bestGraphFunctionRef, action.graphFunctionRef);
  assert.notDeepEqual(evaluator.targetBindingRefs, rows.targetBindingRefs);

  const projection = constructSdlcNextActionProjection({
    selectedComposition: rows.edgeFulfillmentLedger.selectedComposition,
    nextActionProjectionRef: evaluator.priorityProjection.projectionRef,
    nextActionBasisKind: evaluator.nextActionBasisKind,
    intentEventRefs: evaluator.intentEventRefs,
    productAssetModelRef: evaluator.productAssetModelRef,
    gapPressureRefs: evaluator.gapPressureRefs,
    targetBindingRefs: rows.targetBindingRefs,
    closureDecision: decision,
    observationRef: evaluator.observation.observationId,
    policyRefs: [
      evaluator.policyCarrierRef,
      evaluator.priorityProjection.prioritySchemeRef
    ],
    actionCatalogRefs: evaluator.actionCatalogRefs,
    selectedActionRef: evaluator.selectedPriorityRow.actionRef,
    nextGraphFunctionRef: evaluator.bestGraphFunctionRef,
    nextGraphVectorRef: evaluator.bestGraphVectorRef
  });

  assert.equal(projection.selectedActionRef, evaluator.selectedPriorityRow.actionRef);
  assert.deepEqual(projection.targetBindingRefs, rows.targetBindingRefs);
  return projection;
}

function replay(rows, decision, projection) {
  const result = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [rows.constructionIntent],
    worksiteEvidence: [rows.worksiteEvidence],
    edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
    edgeClosureDecisions: [decision],
    nextActionProjections: [projection],
    finalNextActionProjectionRef: projection.nextActionProjectionRef,
    abgTraversalTransitionRef:
      `abg-runtime-transition://t153/${encodeURIComponent(projection.nextActionProjectionRef)}`
  });

  assert.equal(
    result.edgeFulfillmentLedger.ledgerVersionRef,
    rows.edgeFulfillmentLedger.ledgerVersionRef
  );
  assert.equal(result.edgeClosureDecision.decisionRef, decision.decisionRef);
  assert.equal(
    result.nextActionProjection.nextActionBasisKind,
    projection.nextActionBasisKind
  );
  return result;
}

test("T-153 yield returns replay-visible resume basis without dispatching a new action", () => {
  const rows = context("yield", openCounts());
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/yield",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: true,
    yieldResumeBasis: {
      yieldKind: "live_worker_partial_progress_admitted",
      resumeBasisRef: "resume-basis://t153/yield/current-edge",
      currentEdgeRef: rows.edgeFulfillmentLedger.edgeRef,
      admittedProgressRefs: ["progress://t153/yield/worker-report-admitted"],
      livenessProjectionRef: "liveness://t153/yield/active",
      resumePolicyRef: "resume-policy://t153/yield/same-edge"
    }
  });
  const projection = noActionProjection(rows, decision);
  const result = replay(rows, decision, projection);

  assert.equal(decision.disposition, "yield");
  assert.equal(projection.nextActionBasisKind, "post_yield_resume");
  assert.equal(projection.choosesNextTraversal, false);
  assert.equal(projection.selectedActionRef, null);
  assert.deepEqual(result.edgeClosureDecision.yieldResumeBasis?.admittedProgressRefs, [
    "progress://t153/yield/worker-report-admitted"
  ]);
});

for (const scenario of [
  {
    caseId: "retry",
    actionKind: "continue_graph_call",
    reasonInput: "retryReasonRefs",
    reasonRef: "assurance-reentry://t153/retry/same-edge"
  },
  {
    caseId: "repair",
    actionKind: "repair_same_edge",
    reasonInput: "repairReasonRefs",
    reasonRef: "assurance-reentry://t153/repair/worker-output"
  },
  {
    caseId: "re-enter",
    actionKind: "reenter_graph_span",
    reasonInput: "reenterReasonRefs",
    reasonRef: "assurance-reentry://t153/re-enter/graph-span"
  }
]) {
  test(`T-153 ${scenario.caseId} selects continuation through evaluator truth`, () => {
    const rows = context(scenario.caseId, blockedCounts());
    const decision = deriveSdlcEdgeClosureDecision({
      decisionRef: `closure-decision://t153/${scenario.caseId}`,
      ledger: rows.edgeFulfillmentLedger,
      currentEdgeLawful: true,
      [scenario.reasonInput]: [scenario.reasonRef]
    });
    const projection = evaluatorProjection(rows, decision, scenario.actionKind);
    const result = replay(rows, decision, projection);

    assert.equal(decision.disposition, scenario.caseId);
    assert.equal(result.nextActionProjection.choosesNextTraversal, true);
    assert.equal(
      result.nextActionProjection.selectedActionRef,
      `action://t153/${scenario.caseId}/${scenario.actionKind}`
    );
    assert.equal(
      result.nextActionProjection.predecessorRefs.includes(decision.decisionRef),
      true
    );
  });
}

test("T-153 explicit retry pressure outranks diagnostic assurance block", () => {
  const rows = context("retry-over-assurance-block", blockedCounts());
  const retryReasonRef =
    "blocking-reason://t153/retry-over-assurance-block/worker_output_limit_exceeded";
  const assuranceBlockReasonRef =
    "pressure://t153/retry-over-assurance-block/target-carrier/missing_admission";
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/retry-over-assurance-block",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: true,
    edgeAssuranceCloseDecision: {
      kind: "sdlc_edge_assurance_close_decision",
      decisionRef:
        "edge-assurance-close://t153/retry-over-assurance-block/target-carrier",
      contractRef: "contract://t153/retry-over-assurance-block",
      contractDigest: "sha256:t153-retry-over-assurance-block",
      edgeRef: rows.edgeFulfillmentLedger.edgeRef,
      disposition: "block",
      targetCarrierContractRef: null,
      targetCarrierContractDigest: null,
      targetCarrierAdmissionStatus:
        rows.edgeFulfillmentLedger.targetCarrierAdmissionStatus,
      gainRef: "edge-gain://t153/retry-over-assurance-block",
      residualPressureRef:
        "edge-residual-pressure://t153/retry-over-assurance-block",
      basisRefs: ["basis://t153/retry-over-assurance-block/assurance"],
      reasonRefs: [assuranceBlockReasonRef]
    },
    retryReasonRefs: [retryReasonRef]
  });
  const projection = evaluatorProjection(rows, decision, "continue_graph_call");
  const result = replay(rows, decision, projection);

  assert.equal(decision.disposition, "retry");
  assert.equal(decision.reasonRefs.includes(retryReasonRef), true);
  assert.equal(decision.reasonRefs.includes(assuranceBlockReasonRef), true);
  assert.equal(result.nextActionProjection.choosesNextTraversal, true);
});

test("T-153 repair pressure can repair target-carrier assurance block", () => {
  const rows = context("repair-over-target-carrier-block", blockedCounts());
  const repairReasonRef =
    "blocking-reason://t153/repair-over-target-carrier-block/staged_authority_admission_invalid";
  const assuranceBlockReasonRef =
    "pressure://t153/repair-over-target-carrier-block/target-carrier/rejected_admission";
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/repair-over-target-carrier-block",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: true,
    edgeAssuranceCloseDecision: {
      kind: "sdlc_edge_assurance_close_decision",
      decisionRef:
        "edge-assurance-close://t153/repair-over-target-carrier-block/target-carrier",
      contractRef: "contract://t153/repair-over-target-carrier-block",
      contractDigest: "sha256:t153-repair-over-target-carrier-block",
      edgeRef: rows.edgeFulfillmentLedger.edgeRef,
      disposition: "block",
      targetCarrierContractRef: null,
      targetCarrierContractDigest: null,
      targetCarrierAdmissionStatus:
        rows.edgeFulfillmentLedger.targetCarrierAdmissionStatus,
      gainRef: "edge-gain://t153/repair-over-target-carrier-block",
      residualPressureRef:
        "edge-residual-pressure://t153/repair-over-target-carrier-block",
      basisRefs: ["basis://t153/repair-over-target-carrier-block/assurance"],
      reasonRefs: [assuranceBlockReasonRef]
    },
    repairReasonRefs: [repairReasonRef]
  });
  const projection = evaluatorProjection(rows, decision, "repair_same_edge");
  const result = replay(rows, decision, projection);

  assert.equal(decision.disposition, "repair");
  assert.equal(decision.reasonRefs.includes(repairReasonRef), true);
  assert.equal(decision.reasonRefs.includes(assuranceBlockReasonRef), true);
  assert.equal(result.nextActionProjection.choosesNextTraversal, true);
});

test("T-153 reprice is replay-visible and cannot dispatch a repair action", () => {
  const rows = context("reprice", blockedCounts());
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/reprice",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: false,
    repriceReasonRefs: ["reprice://t153/requirement-authority"],
    blockReasonRefs: ["worker-prose://t153/reprice/summary"]
  });
  const projection = noActionProjection(rows, decision);
  const result = replay(rows, decision, projection);

  assert.equal(decision.disposition, "reprice");
  assert.equal(projection.nextActionBasisKind, "post_reprice");
  assert.equal(result.nextActionProjection.choosesNextTraversal, false);
  assert.equal(result.nextActionProjection.selectedActionRef, null);
});

test("T-153 worker prose and liveness alone remain block/no-action truth", () => {
  const rows = context("block", blockedCounts());
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/block",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: true,
    blockReasonRefs: [
      "worker-prose://t153/block/unresolved-summary",
      "liveness://t153/block/active"
    ]
  });
  const projection = noActionProjection(rows, decision);
  const result = replay(rows, decision, projection);

  assert.equal(decision.disposition, "block");
  assert.equal(decision.yieldResumeBasis, null);
  assert.equal(projection.nextActionBasisKind, "post_block");
  assert.equal(result.nextActionProjection.choosesNextTraversal, false);
  assert.equal(result.nextActionProjection.selectedActionRef, null);
});

test("T-153 liveness-only progress cannot create yield or semantic failure reasons", () => {
  const rows = context("liveness-only", openCounts());

  assert.throws(
    () =>
      deriveSdlcEdgeClosureDecision({
        decisionRef: "closure-decision://t153/liveness-only-yield",
        ledger: rows.edgeFulfillmentLedger,
        currentEdgeLawful: true,
        yieldResumeBasis: {
          yieldKind: "process_active_under_liveness_observer",
          resumeBasisRef: "resume-basis://t153/liveness-only",
          currentEdgeRef: rows.edgeFulfillmentLedger.edgeRef,
          admittedProgressRefs: ["liveness://t153/liveness-only/active"],
          livenessProjectionRef: "liveness://t153/liveness-only/active",
          resumePolicyRef: "resume-policy://t153/liveness-only"
        }
      }),
    /yield requires admitted progress beyond liveness refs/
  );

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t153/liveness-only-block",
    ledger: rows.edgeFulfillmentLedger,
    currentEdgeLawful: true
  });
  const projection = noActionProjection(rows, decision);
  replay(rows, decision, projection);

  assert.equal(decision.disposition, "block");
  assert.deepEqual(decision.reasonRefs, []);
  assert.equal(projection.choosesNextTraversal, false);
});
