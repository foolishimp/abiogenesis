// Validates: T-142

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "@abiogenesis/typescript-tenant";

import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  constructSdlcConstructionIntent,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  deriveComponentDepthAssuranceLedger,
  deriveOddSdlcEvaluateNextReport,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments
} from "../../build/semantic/code/src/index.js";

function executionBasis() {
  const module = constructSdlcGtlModule();
  const basis = admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t142",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: FG_CONFORM_PROJECT_AUTHORITY
      },
      until: "first_traversal"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t142/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t142",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t142",
    workKey: "wk://odd-sdlc/t142",
    frameId: null,
    frameLineageId: null
  });
  return { basis, module };
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t142/${caseId}`,
    compositionDigest: `digest://t142/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t142/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t142/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t142/${caseId}`,
    graphVectorRef: `graph-vector://t142/${caseId}`,
    basisRef: `basis://t142/${caseId}`
  });
}

test("T-142 authority conformance can close while requirements carry product materialization pressure", () => {
  const { basis, module } = executionBasis();
  const materializeGraphFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert(materializeGraphFunction);

  const fulfillment = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      "target_asset:project_bootstrap_surface",
      "project_authority:bootstrap.md",
      "requirement:REQ-T142-001",
      "requirement:REQ-T142-002"
    ],
    assessments: [
      {
        obligationId: "target_asset:project_bootstrap_surface",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/.ai-workspace/context/project_bootstrap.md"]
      },
      {
        obligationId: "project_authority:bootstrap.md",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/bootstrap.md"]
      },
      {
        obligationId: "requirement:REQ-T142-001",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/specification/requirements/01-product.md"],
        carryDirection: "downstream_transformation_set",
        downstreamGraphFunctionRefs: [materializeGraphFunction.name],
        targetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"]
      },
      {
        obligationId: "requirement:REQ-T142-002",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/specification/requirements/01-product.md"],
        carryDirection: "downstream_transformation_set",
        downstreamGraphFunctionRefs: [materializeGraphFunction.name],
        targetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"]
      }
    ]
  });

  assert.deepEqual(fulfillment.counts, {
    expected: 2,
    fulfilled: 2,
    partial: 0,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.deepEqual(fulfillment.edgeLocalObligationIds, [
    "project_authority:bootstrap.md",
    "target_asset:project_bootstrap_surface"
  ]);
  assert.equal(fulfillment.downstreamTransformationSetRefs.length, 2);
  assert.equal(
    fulfillment.downstreamTargetBindingRefs.includes(
      "target-binding://odd-sdlc/component_code_surface"
    ),
    true
  );

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("authority-conformance"),
    ledgerRef: "ledger://t142/authority-conformance",
    ledgerVersionRef: "ledger-version://t142/authority-conformance/1",
    edgeRef: `edge://t142/${FG_CONFORM_PROJECT_AUTHORITY}`,
    attemptRef: "attempt://t142/authority-conformance/1",
    targetBindingRefs: ["target-binding://t142/project_bootstrap_surface"],
    evidenceBundleRefs: ["evidence://t142/authority-conformance"],
    materializationRefs: ["file:///workspace/.ai-workspace/context/project_bootstrap.md"],
    admissionRefs: ["admission://t142/worker-report"],
    downstreamTransformationSetRefs: fulfillment.downstreamTransformationSetRefs,
    downstreamPressureRefs: fulfillment.downstreamPressureRefs,
    downstreamTargetBindingRefs: fulfillment.downstreamTargetBindingRefs,
    counts: fulfillment.counts,
    assessmentCount: fulfillment.assessmentCount,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    predecessorRefs: [
      "target-binding://t142/project_bootstrap_surface",
      "evidence://t142/authority-conformance",
      ...fulfillment.downstreamTransformationSetRefs,
      ...fulfillment.downstreamPressureRefs,
      ...fulfillment.downstreamTargetBindingRefs
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t142/authority-conformance",
    ledger,
    currentEdgeLawful: true
  });

  assert.equal(ledger.edgeConverged, true);
  assert.equal(decision.disposition, "close");

  const targetOutcomeRef = "target-outcome://t142/component-code";
  const evaluator = deriveOddSdlcEvaluateNextReport({
    basis,
    events: [],
    intentEventRefs: ["event://t142/start-intent"],
    productAssetModelRef: "product-asset-model://t142/current",
    episodeId: "construction-episode://t142/post-authority",
    observationId: "construction-observation://t142/post-authority",
    pressures: [
      {
        pressureRef: "pressure://t142/downstream-product-materialization",
        pressureKind: "gap_row",
        sourceRef: decision.decisionRef,
        affectedAssetRefs: ["asset-type://odd-sdlc/component_code_surface"],
        targetOutcomeRefs: [targetOutcomeRef],
        evidenceRefs: ledger.downstreamPressureRefs,
        severity: 1
      }
    ],
    actions: [
      {
        actionRef: "construction-action://t142/materialize-declared-product",
        actionKind: "invoke_graph_function",
        graphFunctionRef: materializeGraphFunction.name,
        graphVectorRef: "vector:odd_sdlc:Fg_materialize_declared_product_asset",
        publishedTraversalTargetRef:
          `published-action://odd-sdlc/graph-function/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`,
        targetOutcomeRef,
        expectedOutputAssetRefs: [
          "asset-type://odd-sdlc/component_code_surface",
          targetOutcomeRef
        ],
        requiredAuthorityRefs: [
          `published-action://odd-sdlc/graph-function/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
        ],
        eligibleReasonRefs: ledger.downstreamPressureRefs
      }
    ]
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: ledger.selectedComposition,
    nextActionProjectionRef: evaluator.priorityProjection.projectionRef,
    nextActionBasisKind: "post_close_graph_continuation",
    intentEventRefs: evaluator.intentEventRefs,
    productAssetModelRef: evaluator.productAssetModelRef,
    gapPressureRefs: evaluator.gapPressureRefs,
    targetBindingRefs: ledger.downstreamTargetBindingRefs,
    closureDecision: decision,
    observationRef: evaluator.observation.observationId,
    policyRefs: [
      evaluator.policyCarrierRef,
      evaluator.priorityProjection.prioritySchemeRef
    ],
    actionCatalogRefs: evaluator.actionCatalogRefs,
    selectedActionRef: evaluator.selectedPriorityRow?.actionRef ?? null,
    nextGraphFunctionRef: evaluator.bestGraphFunctionRef,
    nextGraphVectorRef: evaluator.bestGraphVectorRef
  });

  assert.equal(nextActionProjection.choosesNextTraversal, true);
  assert.equal(nextActionProjection.nextGraphFunctionRef, materializeGraphFunction.name);
  assert.equal(nextActionProjection.closureDecisionRef, decision.decisionRef);
  assert.equal(nextActionProjection.readOnly, false);

  const intent = constructSdlcConstructionIntent({
    intentRef: "construction-intent://t142/materialize-declared-product",
    intentEventRefs: evaluator.intentEventRefs,
    productAssetModelRef: evaluator.productAssetModelRef,
    selectedPriorityRowRef: evaluator.selectedPriorityRow?.rankInputRef ?? "priority-row://t142/0",
    nextActionProjectionRef: nextActionProjection.nextActionProjectionRef,
    selectedActionRef: nextActionProjection.selectedActionRef ?? "",
    basisRefs: [
      ledger.ledgerRef,
      decision.decisionRef,
      nextActionProjection.nextActionProjectionRef
    ]
  });

  assert.equal(intent.selectedActionRef, nextActionProjection.selectedActionRef);
  assert.equal(
    intent.predecessorRefs.includes(nextActionProjection.nextActionProjectionRef),
    true
  );
});

test("T-142 declared product materialization is not blocked by absent component-depth topology", () => {
  const ledger = deriveComponentDepthAssuranceLedger({
    manifest: {
      graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      targetAssetType: "component_code_surface"
    },
    report: {}
  });

  assert.equal(ledger, null);
});
