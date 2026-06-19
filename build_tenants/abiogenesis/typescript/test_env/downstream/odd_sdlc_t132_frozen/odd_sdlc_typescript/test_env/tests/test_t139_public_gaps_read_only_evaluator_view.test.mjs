// Validates: T-139

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorClosedEvent,
  constructVectorTraversalPlannedEvent
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcGapDossier,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  invokeOddSdlcSpecMethodCommandSync,
  publicRequirementStatusToClosureRegisterStatus,
  projectSdlcRequirementFulfillmentPublicViewFromAssessments,
  projectSdlcRequirementFulfillmentPublicViewFromPriorProjection,
  serializeOddSdlcSpecMethodResult,
  projectSdlcQueryDomain
} from "../../build/semantic/code/src/index.js";

function moduleBasis(handle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t139",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
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
      resolvedPolicyBundleRef: "policy://odd-sdlc/t139/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t139",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t139",
    workKey: "wk://odd-sdlc/t139",
    frameId: null,
    frameLineageId: null
  });
}

function ingressReport() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t139",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t139",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["query-domain"]
    }),
    sourceInputs: [
      deriveSdlcSourceInput({
        uri: "file:///workspace/t139/specification/requirements/01-t139.md",
        relativePath: "specification/requirements/01-t139.md",
        content:
          "REQ-T139-001: Public gaps must measure requirement fulfillment.\n" +
          "REQ-T139-002: Requirement marker echo must not satisfy closure."
      })
    ]
  });
}

function queryDomain() {
  return projectSdlcQueryDomain({
    module: constructSdlcGtlModule(),
    ingressReport: ingressReport()
  });
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t139/${caseId}`,
    compositionDigest: `digest://t139/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t139/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t139/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t139/${caseId}`,
    graphVectorRef: `graph-vector://t139/${caseId}`,
    basisRef: `basis://t139/${caseId}`
  });
}

function rowByDisplayId(projection, requirementDisplayId) {
  const row = projection.rows.find(
    (candidate) => candidate.requirementDisplayId === requirementDisplayId
  );
  assert(row);
  return row;
}

function conformantWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t139-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t139_public_gaps",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(path.join(root, "specification/GOALS.md"), "# Goals\n", "utf8");
  writeFileSync(path.join(root, "specification/PRODUCT.md"), "# Product\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/01-t139.md"),
    [
      "# Requirements",
      "",
      "REQ-T139-001: Public gaps must measure requirement fulfillment.",
      "REQ-T139-002: Requirement marker echo must not satisfy closure."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    "# Imported Sources\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    "# Project Bootstrap\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    "# Tenant Registry\n\n- typescript: build_tenants/typescript\n",
    "utf8"
  );
  return root;
}

test("T-139 query-domain publishes read-only requirement fulfillment measurement", () => {
  const projection = queryDomain().requirementFulfillment;

  assert.equal(projection.kind, "sdlc_requirement_fulfillment_public_projection");
  assert.equal(projection.readOnly, true);
  assert.equal(projection.choosesNextTraversal, false);
  assert.equal(projection.gapEvaluationFunction, null);
  assert.equal(projection.nextActionEvaluationFunction, null);
  assert.equal(projection.actionClosureEvaluationFunction, "evaluate_action");
  assert.equal(projection.archiveRehydration.status, "not_attempted");
  assert.equal(projection.edgeFulfillmentCounts, null);
  assert.equal(projection.edgeClosureDisposition, null);
  assert.equal(projection.counts.total, 2);
  assert.equal(projection.counts.missing, 2);
  assert.equal(projection.counts.unresolved, 2);
  assert.deepEqual(projection.fulfilledRequirementIds, []);
  assert.deepEqual(projection.carriedForwardRequirementIds, [
    "REQ-T139-001",
    "REQ-T139-002"
  ]);

  const row = rowByDisplayId(projection, "REQ-T139-001");
  assert.equal(row.obligationRef, `requirement:${row.requirementAuthorityRef}`);
  assert.equal(row.fulfillmentStatus, "missing");
  assert.equal(row.carryStatus, "carried_forward");
  assert.equal(row.openReasons.includes("no_generated_asset_lineage"), true);
  assert.equal(row.openReasonRefs.length, 1);
  assert.equal(row.readOnly, true);
  assert.equal(row.choosesNextTraversal, false);
});

test("T-139 gap dossier carries requirement fulfillment measurement before candidate action display", () => {
  const basis = moduleBasis();
  const domain = queryDomain();
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "advanced" })
  ];
  const dossier = deriveSdlcGapDossier({
    basis,
    events,
    triageInput: "operator-review",
    evidenceRefs: ["event://vector-0-closed"],
    requirementFulfillment: domain.requirementFulfillment
  });

  assert.equal(dossier.readOnly, true);
  assert.equal(dossier.choosesNextTraversal, false);
  assert.equal(dossier.requirementFulfillment.counts.total, 2);
  assert.equal(dossier.requirementFulfillment.counts.unresolved, 2);
  assert.equal(
    dossier.requirementFulfillment.rows.every(
      (row) => row.choosesNextTraversal === false
    ),
    true
  );
  assert(dossier.nextLawfulActions.length > 0);
  assert.equal(dossier.bestActionRef, dossier.nextLawfulActions[0]);
});

test("T-139 public rows can project T-135 ledger, closure, and evaluator refs", () => {
  const domain = queryDomain();
  const closureRegister = {
    kind: "sdlc_requirement_closure_register",
    entries: domain.requirementFulfillment.rows.map((row) => ({
      kind: "sdlc_requirement_closure_entry",
      requirementId: row.requirementId,
      requirementDisplayId: row.requirementDisplayId,
      requirementAuthorityRef: row.requirementAuthorityRef,
      authorityDerivationRefs: row.authorityDerivationRefs,
      sourceInputUris: row.sourceInputUris,
      assetIds: [],
      producedByGraphFunctions: [],
      proofKinds: [],
      authorityVerbs: [],
      evidenceRefs: row.evidenceRefs,
      traceabilityStatus: "absent",
      fulfillmentStatus: publicRequirementStatusToClosureRegisterStatus(
        row.fulfillmentStatus
      ),
      carryStatus: row.carryStatus,
      openReasons: row.openReasons
    })),
    fulfilledRequirementIds: [],
    carriedForwardRequirementIds:
      domain.requirementFulfillment.carriedForwardRequirementIds,
    unresolvedRequirementIds:
      domain.requirementFulfillment.unresolvedRequirementIds,
    fulfilledRequirementAuthorityRefs: [],
    carriedForwardRequirementAuthorityRefs:
      domain.requirementFulfillment.carriedForwardRequirementAuthorityRefs,
    unresolvedRequirementAuthorityRefs:
      domain.requirementFulfillment.unresolvedRequirementAuthorityRefs,
    emittedRuntimeEventKinds: []
  };
  const req001 = rowByDisplayId(domain.requirementFulfillment, "REQ-T139-001");
  const req002 = rowByDisplayId(domain.requirementFulfillment, "REQ-T139-002");
  const composition = selectedComposition("edge");
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t139/edge",
    ledgerVersionRef: "ledger-version://t139/edge/1",
    edgeRef: "edge://t139/derive_requirement_surface",
    attemptRef: "attempt://t139/derive_requirement_surface/1",
    targetBindingRefs: ["target-binding://t139/requirement-surface"],
    evidenceBundleRefs: ["evidence://t139/worksite"],
    materializationRefs: ["file:///workspace/t139/requirement_surface.md"],
    admissionRefs: ["admission://t139/worker-report"],
    counts: {
      expected: 2,
      fulfilled: 1,
      partial: 1,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    assessmentCount: 2,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t139/edge/1",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: ["requirement-open://t139/REQ-T139-002/partial"]
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t139/edge/block",
    intentEventRefs: ["event://t139/intent"],
    productAssetModelRef: "product-asset-model://t139",
    gapPressureRefs: ["pressure://t139/requirements"],
    targetBindingRefs: ["target-binding://t139/requirement-surface"],
    closureDecision,
    observationRef: "observation://t139/post-action",
    policyRefs: ["policy://t139/evaluate-next"],
    actionCatalogRefs: ["catalog://t139/actions"],
    readOnly: true
  });
  const publicView = projectSdlcRequirementFulfillmentPublicViewFromAssessments({
    closureRegister,
    assessments: [
      {
        obligationId: req001.obligationRef,
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/t139/product-evidence.md"]
      },
      {
        obligationId: req002.obligationRef,
        fulfillmentStatus: "partial",
        evidenceRefs: ["file:///workspace/t139/requirement_surface.md"],
        blockingReasons: [
          `requirement_recorded_for_future_closure:${req002.requirementAuthorityRef}`
        ]
      }
    ],
    edgeFulfillmentLedger: ledger,
    edgeClosureDecision: closureDecision,
    nextActionProjection
  });

  assert.equal(publicView.counts.fulfilled, 1);
  assert.equal(publicView.counts.partial, 1);
  assert.equal(publicView.counts.unresolved, 1);
  assert.equal(publicView.nextActionEvaluationFunction, "evaluate_next");
  assert.deepEqual(publicView.edgeFulfillmentCounts, ledger.counts);
  assert.equal(publicView.edgeClosureDisposition, closureDecision.disposition);
  const partial = rowByDisplayId(publicView, "REQ-T139-002");
  assert.equal(partial.fulfillmentStatus, "partial");
  assert.equal(partial.carryStatus, "carried_forward");
  assert.deepEqual(partial.ledgerRefs, [
    ledger.ledgerRef,
    ledger.ledgerVersionRef
  ]);
  assert.deepEqual(partial.closureDecisionRefs, [closureDecision.decisionRef]);
  assert(partial.evaluatorSourceRefs.includes(nextActionProjection.nextActionProjectionRef));
  assert.equal(
    partial.openReasons.includes(
      `requirement_recorded_for_future_closure:${req002.requirementAuthorityRef}`
    ),
    true
  );
});

test("T-139 public projection constructors converge on the same logical state", () => {
  const domain = queryDomain();
  const projection = projectSdlcRequirementFulfillmentPublicViewFromPriorProjection({
    sourceProjection: domain.requirementFulfillment,
    assessments: domain.requirementFulfillment.rows.map((row) => ({
      obligationId: row.obligationRef,
      fulfillmentStatus: row.fulfillmentStatus === "fulfilled"
        ? "fulfilled"
        : row.fulfillmentStatus === "partial"
          ? "partial"
          : row.fulfillmentStatus === "blocked"
            ? "blocked"
            : "unassessed",
      evidenceRefs: row.evidenceRefs,
      blockingReasons: row.openReasons
    })),
    edgeFulfillmentLedger: constructSdlcEdgeFulfillmentLedger({
      selectedComposition: selectedComposition("convergence"),
      ledgerRef: "ledger://t139/convergence",
      ledgerVersionRef: "ledger-version://t139/convergence/1",
      edgeRef: "edge://t139/convergence",
      attemptRef: "attempt://t139/convergence/1",
      targetBindingRefs: ["target-binding://t139/convergence"],
      evidenceBundleRefs: ["evidence://t139/convergence"],
      counts: {
        expected: 2,
        fulfilled: 0,
        partial: 0,
        blocked: 0,
        unfulfilled: 2,
        missing: 0,
        extra: 0
      },
      assessmentCount: 2,
      admitted: true,
      targetCertificationPassed: true,
      fdRecheckPassed: true
    }),
    edgeClosureDecision: deriveSdlcEdgeClosureDecision({
      decisionRef: "closure-decision://t139/convergence",
      ledger: constructSdlcEdgeFulfillmentLedger({
        selectedComposition: selectedComposition("convergence"),
        ledgerRef: "ledger://t139/convergence",
        ledgerVersionRef: "ledger-version://t139/convergence/1",
        edgeRef: "edge://t139/convergence",
        attemptRef: "attempt://t139/convergence/1",
        targetBindingRefs: ["target-binding://t139/convergence"],
        evidenceBundleRefs: ["evidence://t139/convergence"],
        counts: {
          expected: 2,
          fulfilled: 0,
          partial: 0,
          blocked: 0,
          unfulfilled: 2,
          missing: 0,
          extra: 0
        },
        assessmentCount: 2,
        admitted: true,
        targetCertificationPassed: true,
        fdRecheckPassed: true
      }),
      currentEdgeLawful: true,
      blockReasonRefs: ["requirement-open://t139/convergence"]
    }),
    nextActionProjection: constructSdlcNextActionProjection({
      selectedComposition: selectedComposition("convergence"),
      nextActionProjectionRef: "next-action://t139/convergence",
      intentEventRefs: ["event://t139/intent"],
      productAssetModelRef: "product-asset-model://t139",
      gapPressureRefs: ["pressure://t139/convergence"],
      targetBindingRefs: ["target-binding://t139/convergence"],
      closureDecision: deriveSdlcEdgeClosureDecision({
        decisionRef: "closure-decision://t139/convergence",
        ledger: constructSdlcEdgeFulfillmentLedger({
          selectedComposition: selectedComposition("convergence"),
          ledgerRef: "ledger://t139/convergence",
          ledgerVersionRef: "ledger-version://t139/convergence/1",
          edgeRef: "edge://t139/convergence",
          attemptRef: "attempt://t139/convergence/1",
          targetBindingRefs: ["target-binding://t139/convergence"],
          evidenceBundleRefs: ["evidence://t139/convergence"],
          counts: {
            expected: 2,
            fulfilled: 0,
            partial: 0,
            blocked: 0,
            unfulfilled: 2,
            missing: 0,
            extra: 0
          },
          assessmentCount: 2,
          admitted: true,
          targetCertificationPassed: true,
          fdRecheckPassed: true
        }),
        currentEdgeLawful: true,
        blockReasonRefs: ["requirement-open://t139/convergence"]
      }),
      observationRef: "observation://t139/convergence",
      policyRefs: ["policy://t139/convergence"],
      actionCatalogRefs: ["catalog://t139/convergence"],
      readOnly: true
    })
  });

  assert.equal(projection.counts.total, domain.requirementFulfillment.counts.total);
  assert.equal(
    projection.counts.unresolved,
    domain.requirementFulfillment.counts.unresolved
  );
  assert.deepEqual(
    projection.unresolvedRequirementIds,
    domain.requirementFulfillment.unresolvedRequirementIds
  );
});

test("T-139 Spec Method gaps rehydrates installed traversal consequence archives", () => {
  const workspace = conformantWorkspace();
  const operatorRunRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/t139-archived-run"
  );
  mkdirSync(operatorRunRoot, { recursive: true });
  const composition = selectedComposition("archive");
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t139/archive",
    ledgerVersionRef: "ledger-version://t139/archive/1",
    edgeRef: "edge://t139/archive",
    attemptRef: "attempt://t139/archive/1",
    targetBindingRefs: ["target-binding://t139/archive"],
    evidenceBundleRefs: ["evidence://t139/archive"],
    materializationRefs: ["file:///workspace/t139/archive.md"],
    admissionRefs: ["admission://t139/archive"],
    counts: {
      expected: 2,
      fulfilled: 1,
      partial: 1,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    assessmentCount: 2,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t139/archive",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: ["requirement-open://t139/REQ-T139-002/partial"]
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t139/archive",
    intentEventRefs: ["event://t139/intent"],
    productAssetModelRef: "product-asset-model://t139",
    gapPressureRefs: ["pressure://t139/archive"],
    targetBindingRefs: ["target-binding://t139/archive"],
    closureDecision,
    observationRef: "observation://t139/archive",
    policyRefs: ["policy://t139/archive"],
    actionCatalogRefs: ["catalog://t139/archive"],
    readOnly: true
  });
  const req001AuthorityRef =
    "t139_public_gaps.stage_01_t139.req_t139_001";
  const req002AuthorityRef =
    "t139_public_gaps.stage_01_t139.req_t139_002";
  writeFileSync(
    path.join(operatorRunRoot, "sdlc_edge_fulfillment_ledger.json"),
    JSON.stringify(ledger, null, 2),
    "utf8"
  );
  writeFileSync(
    path.join(operatorRunRoot, "sdlc_edge_closure_decision.json"),
    JSON.stringify(closureDecision, null, 2),
    "utf8"
  );
  writeFileSync(
    path.join(operatorRunRoot, "sdlc_next_action_projection.json"),
    JSON.stringify(nextActionProjection, null, 2),
    "utf8"
  );
  writeFileSync(
    path.join(operatorRunRoot, "worker_result_report.json"),
    JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        obligationAssessments: [
          {
            obligationId: `requirement:${req001AuthorityRef}`,
            fulfillmentStatus: "fulfilled",
            evidenceRefs: ["file:///workspace/t139/archive.md"]
          },
          {
            obligationId: `requirement:${req002AuthorityRef}`,
            fulfillmentStatus: "partial",
            evidenceRefs: ["file:///workspace/t139/archive.md"],
            blockingReasons: [
              `requirement_recorded_for_future_closure:${req002AuthorityRef}`
            ]
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const result = invokeOddSdlcSpecMethodCommandSync(["gaps", "--workspace", workspace]);

  assert.equal(result.status, "ok");
  assert.equal(result.payload.requirementFulfillment.counts.fulfilled, 1);
  assert.equal(result.payload.requirementFulfillment.counts.partial, 1);
  assert.deepEqual(
    result.payload.requirementFulfillment.edgeFulfillmentCounts,
    ledger.counts
  );
  assert.equal(
    result.payload.requirementFulfillment.edgeClosureDisposition,
    closureDecision.disposition
  );
  assert.deepEqual(
    result.payload.dossier.requirementFulfillment.edgeFulfillmentCounts,
    ledger.counts
  );
  assert.equal(
    result.payload.requirementFulfillment.archiveRehydration.status,
    "rehydrated"
  );
  assert.match(
    result.payload.requirementFulfillment.archiveRehydration.archiveRef,
    /t139-archived-run/
  );
  assert.deepEqual(
    result.payload.requirementFulfillment.archiveRehydration.missingArtifactRefs,
    []
  );
});

test("T-139 Spec Method gaps reports incomplete consequence archive rehydration", () => {
  const workspace = conformantWorkspace();
  const operatorRunRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/t139-incomplete-run"
  );
  mkdirSync(operatorRunRoot, { recursive: true });
  writeFileSync(
    path.join(operatorRunRoot, "sdlc_edge_fulfillment_ledger.json"),
    JSON.stringify(
      {
        kind: "sdlc_edge_fulfillment_ledger",
        ledgerRef: "ledger://t139/incomplete",
        ledgerVersionRef: "ledger-version://t139/incomplete/1",
        counts: {
          expected: 2,
          fulfilled: 0,
          partial: 0,
          blocked: 0,
          unfulfilled: 2,
          missing: 0,
          extra: 0
        }
      },
      null,
      2
    ),
    "utf8"
  );

  const result = invokeOddSdlcSpecMethodCommandSync(["gaps", "--workspace", workspace]);

  assert.equal(result.status, "ok");
  assert.equal(
    result.payload.requirementFulfillment.archiveRehydration.status,
    "no_archive_with_consequence_triple"
  );
  assert(
    result.payload.requirementFulfillment.archiveRehydration.missingArtifactRefs.some(
      (ref) => ref.endsWith("sdlc_edge_closure_decision.json")
    )
  );
  assert(
    result.payload.requirementFulfillment.archiveRehydration.missingArtifactRefs.some(
      (ref) => ref.endsWith("sdlc_next_action_projection.json")
    )
  );
});

test("T-139 Spec Method gaps exposes unresolved requirement pressure without executable authority", () => {
  const workspace = conformantWorkspace();
  const result = invokeOddSdlcSpecMethodCommandSync(["gaps", "--workspace", workspace]);

  assert.equal(result.status, "ok");
  assert.equal(result.payload.dossier.readOnly, true);
  assert.equal(result.payload.dossier.choosesNextTraversal, false);
  assert.equal(result.payload.dossier.requirementFulfillment.counts.total, 2);
  assert.equal(result.payload.dossier.requirementFulfillment.counts.unresolved, 2);
  assert.equal(
    result.payload.dossier.requirementFulfillment.archiveRehydration.status,
    "no_operator_runs"
  );
  assert.equal(
    result.payload.dossier.requirementFulfillment.rows[0].readOnly,
    true
  );
  assert.deepEqual(
    result.payload.dossier.requirementFulfillment.fulfilledRequirementIds,
    []
  );
  const compact = serializeOddSdlcSpecMethodResult(result);
  assert.match(compact, /read_only: true/u);
  assert.match(compact, /chooses_next_traversal: false/u);
});
