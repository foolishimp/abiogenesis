// Validates: T-135

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  buildPostTransformWorkerResultReport,
  conformProjectProfileFromConstraintsText,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  snapshotProductMaterializationRoot
} from "../../build/semantic/code/src/index.js";

function context(activeTenant = "typescript") {
  const module = constructSdlcGtlModule();
  const workspaceRoot = `/workspace/t135/${activeTenant}`;
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t135",
      activeTenant,
      selectedOutputRoot: `build_tenants/${activeTenant}`,
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t135",
      `  selected_output_root: build_tenants/${activeTenant}`,
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      `  ${activeTenant}:`,
      `    output_dir: build_tenants/${activeTenant}`,
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject, workspaceRoot };
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t135/${caseId}`,
    compositionDigest: `digest://t135/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t135/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t135/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t135/${caseId}`,
    graphVectorRef: `graph-vector://t135/${caseId}`,
    basisRef: `basis://t135/${caseId}`
  });
}

function writeRequirementWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t135-req-"));
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t135_requirement_spine",
      "active_tenant: typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T135: Prove requirement obligation closure is not marker echo.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    [
      "# Requirements",
      "",
      "REQ-T135-001: The requirement edge must not close a product requirement by merely recording its identifier."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function requirementSurfaceManifest(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_requirement_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 3,
    contract,
    runId: "t135-requirement-obligation-spine"
  });
}

function featureDecompManifest(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_feature_decomp_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "derive_feature_decomp_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t135-feature-exact-obligation-trace"
  });
}

test("T-135 public start admits initial evaluate_next projection and construction intent", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = context();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "fp_worker_unattached");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.nextActionProjection.evaluationFunction,
    "evaluate_next"
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.nextActionBasisKind,
    "initial_selection"
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.choosesNextTraversal,
    false
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.nextGraphFunctionRef,
    "bootstrap_release_self_test"
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.nextGraphVectorRef,
    null
  );
  assert.equal(
    outcome.executionContract.constructionIntent.selectedActionRef,
    outcome.executionContract.nextActionProjection.selectedActionRef
  );
  assert.equal(
    outcome.executionContract.constructionIntent.nextActionProjectionRef,
    outcome.executionContract.nextActionProjection.nextActionProjectionRef
  );
  assert.equal(
    outcome.executionContract.basis.startIntent.target.handle,
    outcome.executionContract.targetGraphFunction
  );
});

test("T-135 asset start target dispatches from admitted construction intent", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = context();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: { kind: "asset", handle: "release_surface" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_projected");
  assert.equal(outcome.executionContract.targetGraphFunction, "prepare_release_surface");
  assert.match(
    outcome.executionContract.constructionIntent.selectedActionRef,
    /prepare_release_surface/u
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.readOnly,
    false
  );
});

test("T-135 unpublished target cannot fabricate an executable construction intent", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } =
    context("hello_world_rust");
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: { kind: "asset", handle: "rust_hello_world_product_files" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "target_unavailable");
  assert.equal(outcome.executionContract, null);
});

test("T-135 installed operator no longer exposes local reentry loop predicates", () => {
  const source = readFileSync(
    new URL("../../code/src/operator/installed_operator.ts", import.meta.url),
    "utf8"
  );

  assert.equal(source.includes("installedStartHasEvaluateNextTraversalTruth"), false);
  assert.equal(source.includes("installedStartShouldContinueForRequestedUntil"), false);
  assert.equal(source.includes("installedStartRequestsYieldResume"), false);
  assert.equal(source.includes("installedStartHasSameEdgeRetryTruth"), false);
  assert.equal(source.includes("retry_same_edge_with_gap_dossier"), false);
  assert.equal(source.includes("plan_repair_reentry_with_gap_dossier"), false);
  assert.equal(source.includes("rerun_gaps_or_start_next_edge"), false);
  assert.equal(source.includes("inspect_worker_archive"), false);
});

test("T-135 evaluate_action ledger counts admitted obligation assessments, not worker invocation", () => {
  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      "target_asset:requirement_surface",
      "requirement:REQ-T135-001"
    ],
    assessments: [
      {
        obligationId: "target_asset:requirement_surface",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/.ai-workspace/runtime/requirement_surface.md"]
      },
      {
        obligationId: "requirement:REQ-T135-001",
        fulfillmentStatus: "partial",
        evidenceRefs: ["file:///workspace/.ai-workspace/runtime/requirement_surface.md"]
      }
    ]
  });

  assert.deepEqual(projection.counts, {
    expected: 2,
    fulfilled: 1,
    partial: 1,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("requirement-edge"),
    ledgerRef: "ledger://t135/requirement-edge",
    ledgerVersionRef: "ledger-version://t135/requirement-edge/1",
    edgeRef: "edge://t135/derive_requirement_surface",
    attemptRef: "attempt://t135/derive_requirement_surface/1",
    targetBindingRefs: ["target-binding://t135/requirement-surface"],
    evidenceBundleRefs: ["evidence://t135/requirement-edge"],
    materializationRefs: ["file:///workspace/.ai-workspace/runtime/requirement_surface.md"],
    livenessProjectionRefs: ["liveness://t135/active"],
    admissionRefs: ["admission://t135/worker-report"],
    counts: projection.counts,
    assessmentCount: projection.assessmentCount,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    predecessorRefs: [
      "intent://t135/1",
      "evidence://t135/requirement-edge",
      "target-binding://t135/requirement-surface"
    ]
  });

  assert.equal(ledger.edgeConverged, false);
  assert.equal(ledger.fulfillmentConverged, false);

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t135/requirement-edge/1",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: projection.nonConvergedReasonRefs
  });

  assert.equal(decision.disposition, "block");
  assert(
    decision.reasonRefs.some((ref) =>
      ref.includes("requirement%3AREQ-T135-001")
    )
  );
});

test("T-135 evaluate_action fails closed without declared obligations", () => {
  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [],
    assessments: [
      {
        obligationId: "worker_invocation:completed",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["event://t135/worker-invoked"]
      }
    ]
  });

  assert.deepEqual(projection.counts, {
    expected: 1,
    fulfilled: 0,
    partial: 0,
    blocked: 1,
    unfulfilled: 0,
    missing: 0,
    extra: 1
  });
  assert(
    projection.nonConvergedReasonRefs.some((ref) =>
      ref.includes("no_declared_obligations")
    )
  );

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("no-declared-obligations"),
    ledgerRef: "ledger://t135/no-declared-obligations",
    ledgerVersionRef: "ledger-version://t135/no-declared-obligations/1",
    edgeRef: "edge://t135/no-declared-obligations",
    attemptRef: "attempt://t135/no-declared-obligations/1",
    targetBindingRefs: ["target-binding://t135/no-declared-obligations"],
    evidenceBundleRefs: ["evidence://t135/worker-invoked"],
    counts: projection.counts,
    assessmentCount: projection.assessmentCount,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    predecessorRefs: [
      "target-binding://t135/no-declared-obligations",
      "evidence://t135/worker-invoked"
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t135/no-declared-obligations/1",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: projection.nonConvergedReasonRefs
  });

  assert.equal(ledger.edgeConverged, false);
  assert.equal(decision.disposition, "block");
});

test("T-135 requirement surface records requirement obligations as future pressure, not fulfilled closure", () => {
  const manifest = requirementSurfaceManifest(writeRequirementWorkspace());
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# Requirement Surface",
      "",
      "REQ-T135-001: The requirement edge must not close a product requirement by merely recording its identifier."
    ].join("\n"),
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const requirementAssessment = report.obligationAssessments.find(
    (assessment) =>
      manifest.traversalObligationContext.obligations.some(
        (obligation) =>
          obligation.obligationId === assessment.obligationId &&
          obligation.obligationKind === "requirement" &&
          obligation.summary.includes("REQ-T135-001")
      )
  );

  assert(requirementAssessment);
  assert.equal(requirementAssessment.fulfillmentStatus, "partial");
  assert.deepEqual(requirementAssessment.blockingReasons, [
    `requirement_recorded_for_future_closure:${requirementAssessment.obligationId.slice("requirement:".length)}`
  ]);

  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: manifest.traversalObligationContext.obligations.map(
      (obligation) => obligation.obligationId
    ),
    assessments: report.obligationAssessments
  });

  assert.equal(projection.counts.partial > 0, true);
  assert.equal(projection.counts.fulfilled < projection.counts.expected, true);
});

test("T-135 post-transform report recognizes exact requirement obligation ids as observed traces", () => {
  const manifest = featureDecompManifest(writeRequirementWorkspace());
  const requirementObligation = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationKind === "requirement" &&
      obligation.summary.includes("REQ-T135-001")
  );
  assert(requirementObligation);
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# Feature Decomposition Surface",
      "",
      "## Requirement Trace Register",
      "",
      `- \`${requirementObligation.obligationId}\``
    ].join("\n"),
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const requirementAssessment = report.obligationAssessments.find(
    (assessment) => assessment.obligationId === requirementObligation.obligationId
  );

  assert(requirementAssessment);
  assert.equal(requirementAssessment.fulfillmentStatus, "fulfilled");
  assert.deepEqual(requirementAssessment.blockingReasons, []);
});
