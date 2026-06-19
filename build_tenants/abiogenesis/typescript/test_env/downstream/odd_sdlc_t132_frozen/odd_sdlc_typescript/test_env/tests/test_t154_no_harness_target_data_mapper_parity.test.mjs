// Validates: T-154

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  assertSdlcTraversalConsequenceReplayable,
  constructSdlcConstructionIntent,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  constructSdlcWorksiteEvidence,
  deriveOddSdlcEvaluateNextReport,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcPostProductMaterializationActionInput,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcPublishedProductMaterializationAction,
  deriveSdlcSourceInput,
  deriveSdlcTargetObligationBinding,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  sha256Text
} from "../../build/semantic/code/src/index.js";
import {
  copyInternalDataMapperFixture,
  INTERNAL_DATA_MAPPER_SOURCE_FILES
} from "../fixtures/internal_data_mapper_fixture.mjs";

function dataMapperWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t154-data-mapper-"));
  copyInternalDataMapperFixture(root);
  return root;
}

function sourceSnapshot(workspaceRoot, relativePath) {
  const absolutePath = path.join(workspaceRoot, relativePath);
  return {
    uri: pathToFileURL(absolutePath).href,
    relativePath,
    content: readFileSync(absolutePath, "utf8")
  };
}

function moduleBasis(workspaceRoot, caseId) {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot,
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
      resolvedPolicyBundleRef: `policy://odd-sdlc/t154/${caseId}/F_P`,
      defaultRegime: "F_P",
      dispatchRef: `dispatch://odd-sdlc/t154/${caseId}`,
      approvalSubjectRef: null
    }),
    runId: `run://odd-sdlc/t154/${caseId}`,
    workKey: `wk://odd-sdlc/t154/${caseId}`,
    frameId: null,
    frameLineageId: null
  });
}

function selectedComposition(caseId, graphFunctionRef = FG_CONFORM_PROJECT_AUTHORITY) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t154/${caseId}`,
    compositionDigest: `digest://t154/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t154/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t154/${caseId}/evaluate/fp`,
    graphFunctionRef,
    graphVectorRef: `graph-vector://t154/${caseId}`,
    basisRef: `basis://t154/${caseId}`
  });
}

function uniqueRequirementAuthorities(authorities) {
  return [
    ...new Map(
      authorities.map((authority) => [
        authority.requirementAuthorityRef,
        authority
      ])
    ).values()
  ].sort((left, right) =>
    left.requirementAuthorityRef.localeCompare(right.requirementAuthorityRef)
  );
}

function sourceSpecContext() {
  const workspaceRoot = dataMapperWorkspace();
  const module = constructSdlcGtlModule();
  const componentCodeGraphFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === "derive_component_code_surface"
  );
  assert(componentCodeGraphFunction);
  const componentCodeVector =
    materializeGraphFunction(componentCodeGraphFunction).vectors[0];
  assert(componentCodeVector);
  const sourceInputs = INTERNAL_DATA_MAPPER_SOURCE_FILES.map((relativePath) =>
    deriveSdlcSourceInput(sourceSnapshot(workspaceRoot, relativePath))
  );
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(workspaceRoot).href,
    projectConstraints: deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot),
    sourceInputs
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject =
    deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot);
  const requirementAuthorities = uniqueRequirementAuthorities(
    ingressReport.importedRequirementAuthorities
  );
  const targetEvidenceRefs = requirementAuthorities
    .slice(0, 12)
    .flatMap((authority) => [
      authority.requirementAuthorityRef,
      authority.sourceUri,
      authority.authorityMarkerRef
    ]);
  const targetBinding = deriveSdlcTargetObligationBinding({
    queryDomain,
    targetAssetType: "component_code_surface",
    evidenceRefs: targetEvidenceRefs
  });
  const materializationAction =
    deriveSdlcPublishedProductMaterializationAction({
      module,
      downstreamTargetBindingRefs: [targetBinding.bindingRef]
    });

  assert.equal(conformedProject.activeTenant, "scala_spark");
  assert.equal(conformedProject.selectedOutputRoot, "build_tenants/scala_spark");
  assert.equal(
    existsSync(path.join(workspaceRoot, "build_tenants/scala_spark")),
    false
  );
  assert(ingressReport.importedRequirementAuthorities.length > 80);
  assert(requirementAuthorities.length > 70);
  assert.equal(targetBinding.status, "eligible");
  assert.equal(targetBinding.bindingRef, "target-binding://odd-sdlc/component_code_surface");
  assert.equal(targetBinding.evidenceRefs.length > 20, true);
  assert.equal(materializationAction.status, "eligible");
  assert.equal(
    materializationAction.publishedActionRef,
    `published-action://odd-sdlc/graph-function/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
  );

  return Object.freeze({
    workspaceRoot,
    module,
    ingressReport,
    requirementAuthorities,
    targetBinding,
    componentCodeGraphFunction,
    componentCodeVector,
    materializationAction
  });
}

function requirementAssessments(context) {
  const materializationGraphFunctionRef =
    context.materializationAction.graphFunctionRef;
  assert(materializationGraphFunctionRef);
  return context.requirementAuthorities.map((authority) =>
    Object.freeze({
      obligationId: `requirement:${authority.requirementAuthorityRef}`,
      fulfillmentStatus: "fulfilled",
      carryDirection: "downstream_transformation_set",
      downstreamGraphFunctionRefs: [materializationGraphFunctionRef],
      targetBindingRefs: [context.targetBinding.bindingRef],
      evidenceRefs: [
        authority.requirementAuthorityRef,
        authority.sourceUri,
        authority.authorityMarkerRef,
        `source-digest://odd-sdlc/${encodeURIComponent(authority.sourceDigest)}`
      ]
    })
  );
}

function authorityConsequence(context) {
  const intentEventRefs = ["event://t154/source-spec/intent"];
  const productAssetModelRef = "product-asset-model://t154/source-spec";
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef: "construction-intent://t154/source-spec-authority",
    intentEventRefs,
    productAssetModelRef,
    selectedPriorityRowRef: "priority-row://t154/source-spec-authority",
    nextActionProjectionRef: "next-action://t154/source-spec/pre-invoke",
    selectedActionRef: `action://t154/${FG_CONFORM_PROJECT_AUTHORITY}`,
    basisRefs: ["basis://t154/source-spec"]
  });
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t154/source-spec/worksite",
    intentRef: constructionIntent.intentRef,
    invocationRef: "invocation://t154/source-spec/authority-worker",
    processEventRefs: [
      "process-event://t154/source-spec/source-observed",
      "process-event://t154/source-spec/authority-conformed"
    ],
    productEvidenceRefs: [
      "file://t154/specification/requirements/00-imported-sources.md"
    ],
    admittedProgressRefs: [
      "admission://t154/source-spec/imported-requirement-authorities"
    ],
    predecessorRefs: [constructionIntent.nextActionProjectionRef]
  });
  const fulfillment = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      "target_asset:project_authority_conformance",
      ...context.requirementAuthorities.map(
        (authority) => `requirement:${authority.requirementAuthorityRef}`
      )
    ],
    assessments: [
      {
        obligationId: "target_asset:project_authority_conformance",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: [
          "file://t154/.ai-workspace/context/project_authority_conformance.md"
        ]
      },
      ...requirementAssessments(context)
    ]
  });
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("source-spec-authority"),
    ledgerRef: "ledger://t154/source-spec-authority",
    ledgerVersionRef: "ledger-version://t154/source-spec-authority/1",
    edgeRef: `edge://t154/${FG_CONFORM_PROJECT_AUTHORITY}`,
    attemptRef: "attempt://t154/source-spec-authority/1",
    targetBindingRefs: ["target-binding://t154/project_authority_conformance"],
    evidenceBundleRefs: [worksiteEvidence.evidenceBundleRef],
    materializationRefs: worksiteEvidence.productEvidenceRefs,
    admissionRefs: worksiteEvidence.admittedProgressRefs,
    downstreamTransformationSetRefs: fulfillment.downstreamTransformationSetRefs,
    downstreamPressureRefs: fulfillment.downstreamPressureRefs,
    downstreamTargetBindingRefs: fulfillment.downstreamTargetBindingRefs,
    counts: fulfillment.counts,
    assessmentCount: fulfillment.assessmentCount,
    predecessorRefs: [
      "target-binding://t154/project_authority_conformance",
      worksiteEvidence.evidenceBundleRef,
      ...fulfillment.downstreamTransformationSetRefs,
      ...fulfillment.downstreamPressureRefs,
      ...fulfillment.downstreamTargetBindingRefs
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t154/source-spec-authority",
    ledger,
    currentEdgeLawful: true
  });
  const action = deriveSdlcPostProductMaterializationActionInput({
    module: context.module,
    runRef: "run://odd-sdlc/t154/source-spec/no-harness",
    downstreamPressureRefs: ledger.downstreamPressureRefs,
    downstreamTargetBindingRefs: ledger.downstreamTargetBindingRefs,
    admittedAssetTypes: ["implementation_design_surface"]
  });
  assert(action);
  const evaluator = deriveOddSdlcEvaluateNextReport({
    basis: moduleBasis(context.workspaceRoot, "source-spec"),
    events: [],
    nextActionBasisKind: "post_close_graph_continuation",
    intentEventRefs,
    productAssetModelRef,
    episodeId: "construction-episode://t154/source-spec/post-authority",
    observationId: "construction-observation://t154/source-spec/post-authority",
    pressures: [
      {
        pressureRef: "pressure://t154/source-spec/downstream-product-materialization",
        pressureKind: "gap_row",
        sourceRef: decision.decisionRef,
        affectedAssetRefs: action.expectedOutputAssetRefs,
        targetOutcomeRefs: [action.targetOutcomeRef],
        evidenceRefs: ledger.downstreamPressureRefs,
        severity: 1
      }
    ],
    actions: [action]
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: ledger.selectedComposition,
    nextActionProjectionRef: evaluator.priorityProjection.projectionRef,
    nextActionBasisKind: evaluator.nextActionBasisKind,
    intentEventRefs: evaluator.intentEventRefs,
    productAssetModelRef: evaluator.productAssetModelRef,
    gapPressureRefs: evaluator.gapPressureRefs,
    targetBindingRefs: ledger.targetBindingRefs,
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

  return Object.freeze({
    constructionIntent,
    worksiteEvidence,
    ledger,
    decision,
    action,
    evaluator,
    nextActionProjection
  });
}

function writeProductFile(workspaceRoot, relativePath, content) {
  const absolutePath = path.join(workspaceRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${content}\n`, "utf8");
  return {
    ref: pathToFileURL(absolutePath).href,
    digest: sha256Text(`${content}\n`)
  };
}

function materializationConsequence(context, authority) {
  const selectedPriorityRowRef =
    authority.evaluator.selectedPriorityRow?.rankInputRef;
  assert(selectedPriorityRowRef);
  assert(authority.nextActionProjection.selectedActionRef);
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef: "construction-intent://t154/materialize-data-mapper",
    intentEventRefs: authority.nextActionProjection.intentEventRefs,
    productAssetModelRef: authority.nextActionProjection.productAssetModelRef,
    selectedPriorityRowRef,
    nextActionProjectionRef: authority.nextActionProjection.nextActionProjectionRef,
    selectedActionRef: authority.nextActionProjection.selectedActionRef,
    basisRefs: [
      authority.ledger.ledgerVersionRef,
      authority.decision.decisionRef,
      authority.nextActionProjection.nextActionProjectionRef
    ]
  });
  const source = writeProductFile(
    context.workspaceRoot,
    "build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/Mapper.scala",
    "package cdme.compiler\nobject Mapper { def map(value: String): String = value.trim.toUpperCase }"
  );
  const testFile = writeProductFile(
    context.workspaceRoot,
    "build_tenants/scala_spark/cdme-compiler/src/test/scala/cdme/compiler/MapperSpec.scala",
    "package cdme.compiler\nclass MapperSpec"
  );
  const buildFile = writeProductFile(
    context.workspaceRoot,
    "build_tenants/scala_spark/build.sbt",
    "ThisBuild / scalaVersion := \"2.13.14\""
  );
  const productEvidenceRefs = [source.ref, testFile.ref, buildFile.ref];
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t154/materialize/worksite",
    intentRef: constructionIntent.intentRef,
    invocationRef: "invocation://t154/materialize/fp-worker",
    processEventRefs: [
      "process-event://t154/materialize/worker-started",
      "process-event://t154/materialize/worker-report-admitted"
    ],
    productEvidenceRefs,
    admittedProgressRefs: [
      "admission://t154/materialize/source",
      "admission://t154/materialize/test",
      "admission://t154/materialize/build"
    ],
    predecessorRefs: [authority.nextActionProjection.nextActionProjectionRef]
  });
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition(
      "materialize-data-mapper",
      FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
    ),
    ledgerRef: "ledger://t154/materialize-data-mapper",
    ledgerVersionRef: "ledger-version://t154/materialize-data-mapper/1",
    edgeRef: `edge://t154/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`,
    attemptRef: "attempt://t154/materialize-data-mapper/1",
    targetBindingRefs: [context.targetBinding.bindingRef],
    evidenceBundleRefs: [worksiteEvidence.evidenceBundleRef],
    materializationRefs: productEvidenceRefs,
    admissionRefs: worksiteEvidence.admittedProgressRefs,
    counts: {
      expected: 3,
      fulfilled: 3,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    predecessorRefs: [
      context.targetBinding.bindingRef,
      worksiteEvidence.evidenceBundleRef,
      ...productEvidenceRefs
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t154/materialize-data-mapper",
    ledger,
    currentEdgeLawful: true
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: ledger.selectedComposition,
    nextActionProjectionRef: "next-action://t154/materialize-data-mapper/post-close",
    nextActionBasisKind: "post_close_graph_continuation",
    intentEventRefs: constructionIntent.intentEventRefs,
    productAssetModelRef: constructionIntent.productAssetModelRef,
    gapPressureRefs: ["pressure://t154/materialize-data-mapper/post-close"],
    targetBindingRefs: ledger.targetBindingRefs,
    closureDecision: decision,
    observationRef: "observation://t154/materialize-data-mapper/post-close",
    policyRefs: ["policy://t154/materialize-data-mapper/no-followup"],
    actionCatalogRefs: ["catalog://t154/materialize-data-mapper/empty"]
  });

  return Object.freeze({
    constructionIntent,
    worksiteEvidence,
    ledger,
    decision,
    nextActionProjection,
    productEvidenceRefs
  });
}

function assertReplay(rows) {
  const replay = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [rows.constructionIntent],
    worksiteEvidence: [rows.worksiteEvidence],
    edgeFulfillmentLedgers: [rows.ledger],
    edgeClosureDecisions: [rows.decision],
    nextActionProjections: [rows.nextActionProjection],
    finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    abgTraversalTransitionRef:
      `abg-runtime-transition://t154/${encodeURIComponent(rows.nextActionProjection.nextActionProjectionRef)}`
  });
  assert.equal(replay.edgeClosureDecision.decisionRef, rows.decision.decisionRef);
  assert.equal(
    replay.nextActionProjection.nextActionProjectionRef,
    rows.nextActionProjection.nextActionProjectionRef
  );
  return replay;
}

function assertNoHarnessAuthority(...values) {
  const inspected = JSON.stringify(values);
  assert.doesNotMatch(inspected, /asset:component_code_surface/u);
  assert.doesNotMatch(inspected, /harness[_:/-]?target/iu);
  assert.doesNotMatch(inspected, /gap[_:/-]?dossier/iu);
  assert.doesNotMatch(inspected, /compact[_:/-]?output/iu);
  assert.doesNotMatch(inspected, /postflight[_:/-]?report/iu);
  assert.doesNotMatch(inspected, /run[_:/-]?summary/iu);
}

test("T-154 source/spec data_mapper pressure selects and replays product materialization without a harness target", () => {
  const context = sourceSpecContext();
  const authority = authorityConsequence(context);
  const materialization = materializationConsequence(context, authority);

  assert.equal(authority.ledger.edgeConverged, true);
  assert.equal(authority.decision.disposition, "close");
  assert.equal(authority.ledger.downstreamPressureRefs.length > 80, true);
  assert.equal(
    authority.ledger.downstreamTargetBindingRefs.includes(
      context.targetBinding.bindingRef
    ),
    true
  );
  assert.equal(
    authority.action.graphFunctionRef,
    context.componentCodeGraphFunction.name
  );
  assert.equal(
    authority.action.graphVectorRef,
    context.componentCodeVector.name
  );
  assert.equal(
    authority.action.publishedTraversalTargetRef,
    [
      "published-traversal-target://odd-sdlc",
      context.componentCodeGraphFunction.name,
      context.componentCodeVector.name
    ].join("/")
  );
  assert(
    authority.action.eligibleReasonRefs.some((ref) =>
      ref.startsWith("downstream_pressure:")
    )
  );
  assert(
    authority.action.eligibleReasonRefs.includes(
      `target_binding:${context.targetBinding.bindingRef}`
    )
  );
  assert.equal(authority.evaluator.gapEvaluationAuthority, false);
  assert.equal(authority.evaluator.actionClosureEvaluationAuthority, false);
  assert.equal(authority.evaluator.localRankingAuthority, false);
  assert.equal(
    authority.nextActionProjection.selectedActionRef,
    authority.evaluator.selectedPriorityRow?.actionRef
  );
  assert.equal(
    authority.nextActionProjection.nextGraphFunctionRef,
    context.componentCodeGraphFunction.name
  );
  assert.equal(
    authority.nextActionProjection.nextGraphVectorRef,
    context.componentCodeVector.name
  );
  assert.equal(
    authority.constructionIntent.selectedActionRef,
    `action://t154/${FG_CONFORM_PROJECT_AUTHORITY}`
  );

  const authorityReplay = assertReplay(authority);
  assert.equal(
    authorityReplay.nextActionProjection.selectedActionRef,
    authority.nextActionProjection.selectedActionRef
  );

  assert.equal(materialization.ledger.edgeConverged, true);
  assert.equal(materialization.decision.disposition, "close");
  assert.deepEqual(materialization.ledger.targetBindingRefs, [
    context.targetBinding.bindingRef
  ]);
  assert.deepEqual(materialization.ledger.materializationRefs, [
    ...materialization.productEvidenceRefs
  ].sort());
  const materializationReplay = assertReplay(materialization);
  assert.equal(
    materializationReplay.constructionIntent.selectedActionRef,
    authority.nextActionProjection.selectedActionRef
  );

  assertNoHarnessAuthority(
    authority.action,
    authority.evaluator.selectedPriorityRow,
    authority.nextActionProjection,
    materialization.constructionIntent
  );
});

test("T-154 post-product materialization candidate requires source/spec pressure and target binding", () => {
  const context = sourceSpecContext();
  const pressureOnly = deriveSdlcPostProductMaterializationActionInput({
    module: context.module,
    runRef: "run://odd-sdlc/t154/pressure-only",
    downstreamPressureRefs: ["requirement-authority://t154/source-spec"],
    downstreamTargetBindingRefs: [],
    admittedAssetTypes: []
  });
  const bindingOnly = deriveSdlcPostProductMaterializationActionInput({
    module: context.module,
    runRef: "run://odd-sdlc/t154/binding-only",
    downstreamPressureRefs: [],
    downstreamTargetBindingRefs: [context.targetBinding.bindingRef],
    admittedAssetTypes: []
  });

  assert.equal(pressureOnly, null);
  assert.equal(bindingOnly, null);
});
