// Validates: T-152

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  deriveOddSdlcEvaluateNextReport,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcPostProductMaterializationActionInput,
  deriveSdlcPublishedProductMaterializationAction,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
} from "../../build/semantic/code/src/index.js";

const DATA_MAPPER_TARGET_BINDING =
  "target-binding://odd-sdlc/component_code_surface";
const COMPONENT_CODE_PREREQUISITES = Object.freeze([
  "implementation_design_surface"
]);

function graphTrackRefs(module, graphFunctionName) {
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === graphFunctionName
  );
  assert(graphFunction);
  const vector = materializeGraphFunction(graphFunction).vectors[0];
  assert(vector);
  return {
    graphFunctionRef: graphFunction.name,
    graphVectorRef: vector.name,
    publishedTraversalTargetRef: [
      "published-traversal-target://odd-sdlc",
      graphFunction.name,
      vector.name
    ].join("/")
  };
}

function moduleBasis() {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/data_mapper.t152",
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
      resolvedPolicyBundleRef: "policy://odd-sdlc/t152/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t152",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t152",
    workKey: "wk://odd-sdlc/t152",
    frameId: null,
    frameLineageId: null
  });
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t152/${caseId}`,
    compositionDigest: `digest://t152/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t152/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t152/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t152/${caseId}`,
    graphVectorRef: `graph-vector://t152/${caseId}`,
    basisRef: `basis://t152/${caseId}`
  });
}

function downstreamPressureRef(obligationId) {
  return [
    "obligation://odd-sdlc",
    encodeURIComponent(obligationId),
    "downstream_transformation_set"
  ].join("/");
}

function dataMapperAssessments(materializationGraphFunctionRef) {
  return [
    {
      obligationId: "requirement:REQ-DM-LINEAGE",
      fulfillmentStatus: "partial",
      carryDirection: "downstream_transformation_set",
      evidenceRefs: [
        "requirement-authority://data_mapper/REQ-DM-LINEAGE",
        "source-file://data_mapper/src/main/scala/Mapper.scala"
      ],
      downstreamGraphFunctionRefs: [materializationGraphFunctionRef],
      targetBindingRefs: [DATA_MAPPER_TARGET_BINDING]
    },
    {
      obligationId: "requirement:REQ-DM-VALIDATION",
      fulfillmentStatus: "partial",
      carryDirection: "downstream_transformation_set",
      evidenceRefs: [
        "requirement-authority://data_mapper/REQ-DM-VALIDATION",
        "test-file://data_mapper/src/test/scala/MapperSpec.scala",
        "build-file://data_mapper/build.sbt"
      ],
      downstreamGraphFunctionRefs: [materializationGraphFunctionRef],
      targetBindingRefs: [DATA_MAPPER_TARGET_BINDING]
    },
    {
      obligationId: "design:data_mapper-topology",
      fulfillmentStatus: "fulfilled",
      carryDirection: "edge_local",
      evidenceRefs: ["design://data_mapper/module-topology"]
    },
    {
      obligationId: "schedule:data_mapper-component-realization",
      fulfillmentStatus: "fulfilled",
      carryDirection: "edge_local",
      evidenceRefs: ["schedule://data_mapper/component-realization"]
    }
  ];
}

test("T-152 data_mapper-scale downstream obligations do not block local edge closure", () => {
  const module = constructSdlcGtlModule();
  const materializationAction = deriveSdlcPublishedProductMaterializationAction({
    module,
    downstreamTargetBindingRefs: [DATA_MAPPER_TARGET_BINDING]
  });
  assert.equal(materializationAction.status, "eligible");
  assert(materializationAction.graphFunctionRef);

  const declaredObligationIds = [
    "requirement:REQ-DM-LINEAGE",
    "requirement:REQ-DM-VALIDATION",
    "design:data_mapper-topology",
    "schedule:data_mapper-component-realization"
  ];
  const counts = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds,
    assessments: dataMapperAssessments(materializationAction.graphFunctionRef)
  });

  assert.deepEqual(counts.edgeLocalObligationIds, [
    "design:data_mapper-topology",
    "schedule:data_mapper-component-realization"
  ]);
  assert.deepEqual(counts.counts, {
    expected: 2,
    fulfilled: 2,
    partial: 0,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.equal(counts.downstreamTransformationSetRefs.length, 2);
  assert(counts.downstreamPressureRefs.includes(downstreamPressureRef("requirement:REQ-DM-LINEAGE")));
  assert(counts.downstreamPressureRefs.includes(downstreamPressureRef("requirement:REQ-DM-VALIDATION")));
  assert(counts.downstreamPressureRefs.includes("source-file://data_mapper/src/main/scala/Mapper.scala"));
  assert(counts.downstreamPressureRefs.includes("test-file://data_mapper/src/test/scala/MapperSpec.scala"));
  assert(counts.downstreamPressureRefs.includes("build-file://data_mapper/build.sbt"));
  assert.deepEqual(counts.downstreamTargetBindingRefs, [DATA_MAPPER_TARGET_BINDING]);

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("data-mapper"),
    ledgerRef: "ledger://t152/data-mapper/edge",
    ledgerVersionRef: "ledger-version://t152/data-mapper/edge/1",
    edgeRef: "edge://t152/data-mapper/requirements-design",
    attemptRef: "attempt://t152/data-mapper/1",
    targetBindingRefs: ["target-binding://odd-sdlc/requirement_surface"],
    evidenceBundleRefs: ["evidence://t152/data-mapper/local-edge"],
    admissionRefs: ["admission://t152/data-mapper/assessments"],
    downstreamTransformationSetRefs: counts.downstreamTransformationSetRefs,
    downstreamPressureRefs: counts.downstreamPressureRefs,
    downstreamTargetBindingRefs: counts.downstreamTargetBindingRefs,
    counts: counts.counts,
    assessmentCount: counts.assessmentCount
  });
  assert.equal(ledger.edgeConverged, true);
  assert.equal(ledger.edgeConverged && ledger.downstreamPressureRefs.length > 0, true);

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t152/data-mapper/close",
    ledger,
    currentEdgeLawful: true
  });
  assert.equal(decision.disposition, "close");
});

test("T-152 product materialization action is selected from downstream pressure and target binding", () => {
  const module = constructSdlcGtlModule();
  const componentCodeTrack = graphTrackRefs(module, "derive_component_code_surface");
  const materializationAction = deriveSdlcPublishedProductMaterializationAction({
    module,
    downstreamTargetBindingRefs: [DATA_MAPPER_TARGET_BINDING]
  });
  assert(materializationAction.graphFunctionRef);
  const counts = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      "requirement:REQ-DM-LINEAGE",
      "requirement:REQ-DM-VALIDATION",
      "design:data_mapper-topology",
      "schedule:data_mapper-component-realization"
    ],
    assessments: dataMapperAssessments(materializationAction.graphFunctionRef)
  });
  const action = deriveSdlcPostProductMaterializationActionInput({
    module,
    runRef: "run://odd-sdlc/t152/data-mapper",
    downstreamPressureRefs: counts.downstreamPressureRefs,
    downstreamTargetBindingRefs: counts.downstreamTargetBindingRefs,
    admittedAssetTypes: COMPONENT_CODE_PREREQUISITES
  });
  assert(action);
  assert.equal(action.actionRef.includes(FG_MATERIALIZE_DECLARED_PRODUCT_ASSET), true);
  assert.equal(action.graphFunctionRef, componentCodeTrack.graphFunctionRef);
  assert.equal(action.graphVectorRef, componentCodeTrack.graphVectorRef);
  assert.equal(
    action.publishedTraversalTargetRef,
    componentCodeTrack.publishedTraversalTargetRef
  );
  assert(action.eligibleReasonRefs.includes(
    `target_binding:${DATA_MAPPER_TARGET_BINDING}`
  ));
  for (const pressureRef of counts.downstreamPressureRefs) {
    assert(action.eligibleReasonRefs.includes(`downstream_pressure:${pressureRef}`));
  }

  const basis = moduleBasis();
  const report = deriveOddSdlcEvaluateNextReport({
    basis,
    events: [],
    nextActionBasisKind: "post_close_graph_continuation",
    episodeId: "construction-episode://t152/data-mapper",
    observationId: "construction-observation://t152/data-mapper",
    pressures: [
      {
        pressureRef: "pressure://t152/data-mapper/downstream-transform-set",
        pressureKind: "gap_row",
        sourceRef: "closure-decision://t152/data-mapper/close",
        targetOutcomeRefs: [action.targetOutcomeRef],
        evidenceRefs: counts.downstreamPressureRefs,
        severity: 1
      }
    ],
    actions: [action]
  });

  assert.equal(report.bestGraphFunctionRef, componentCodeTrack.graphFunctionRef);
  assert.deepEqual(report.nextLawfulActionRefs, [action.actionRef]);
  assert.equal(report.gapPressureRefs[0], "pressure://t152/data-mapper/downstream-transform-set");
  assert.equal(report.actionCatalog.rows[0].requiredAuthorityRefs[0], materializationAction.publishedActionRef);
});

test("T-152 unmatched downstream target binding does not select broad materialization fallback", () => {
  const module = constructSdlcGtlModule();
  const action = deriveSdlcPostProductMaterializationActionInput({
    module,
    runRef: "run://odd-sdlc/t152/unmatched",
    downstreamPressureRefs: ["downstream-transformation-set://odd-sdlc/REQ-DM-HARNESS"],
    admittedAssetTypes: [],
    downstreamTargetBindingRefs: [
      "target-binding://odd-sdlc/unpublished_harness_target"
    ]
  });

  assert.equal(action, null);
});
