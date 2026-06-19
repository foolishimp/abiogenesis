// Validates: T-141

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
  admitModule,
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "@abiogenesis/typescript-tenant";

import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  buildPostTransformWorkerResultReport,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  deriveOddSdlcEvaluateNextReport,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcPublishedProductMaterializationAction,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcOperatorAssuranceGate,
  deriveSdlcTargetObligationBinding,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  executeInstalledOperatorStart,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  snapshotProductMaterializationRoot
} from "../../build/semantic/code/src/index.js";

function moduleBasis(moduleOverride = constructSdlcGtlModule()) {
  const module = moduleOverride;
  const basis = admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t141",
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
      resolvedPolicyBundleRef: "policy://odd-sdlc/t141/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t141",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t141",
    workKey: "wk://odd-sdlc/t141",
    frameId: null,
    frameLineageId: null
  });
  return { basis, module };
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t141/${caseId}`,
    compositionDigest: `digest://t141/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t141/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t141/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t141/${caseId}`,
    graphVectorRef: `graph-vector://t141/${caseId}`,
    basisRef: `basis://t141/${caseId}`
  });
}

function moduleWithoutMaterializer() {
  const module = constructSdlcGtlModule();
  const removedGraphFunctionIds = new Set(
    module.graphFunctions
      .filter(
        (graphFunction) =>
          graphFunction.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
      )
      .map((graphFunction) => graphFunction.id)
  );
  return admitModule({
    ...module,
    graphFunctions: module.graphFunctions.filter(
      (graphFunction) => !removedGraphFunctionIds.has(graphFunction.id)
    ),
    jobs: module.jobs.filter((job) =>
      job.contracts.every(
        (contract) => !removedGraphFunctionIds.has(contract.targetId)
      )
    )
  });
}

function writeRequirementWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t141-req-"));
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t141_requirement_carry",
      "active_tenant: hello_world_rust",
      "selected_output_root: build_tenants/hello_world_rust",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    language: Rust",
      "    test_runner: cargo"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nBuild a Rust hello-world tenant.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-rust-hello-world.md"),
    "REQ-T141-001: Generate a Rust Cargo tenant that prints Hello, world!.\n",
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function reviewGradeEvaluatorBranch(summary) {
  return [
    "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
    "  const assessmentPath = process.env.ODD_SDLC_EVALUATOR_ASSESSMENT ?? path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json');",
    "  const reportPath = process.env.ODD_SDLC_EVALUATOR_WORKER_REPORT ?? manifest.reportFile;",
    "  const report = JSON.parse(readFileSync(reportPath, 'utf8'));",
    "  const reviewedObligationIds = report.obligationAssessments.map((assessment) => assessment.obligationId);",
    "  const outputRef = pathToFileURL(manifest.outputFile).href;",
    "  const reportRef = pathToFileURL(reportPath).href;",
    "  const findings = reviewedObligationIds.map((obligationId) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts generated authority conformance asset for GTL transform-boundary regression' }));",
    `  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: ${JSON.stringify(summary)} };`,
    "  writeFileSync(assessmentPath, `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
    "  process.stdout.write(`reviewStatus=passed reviewed=${reviewedObligationIds.length} blocked=0\\n`);",
    "  process.exit(0);",
    "}"
  ].join("\n");
}

function writeAuthorityConformanceWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t141_authority_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname, join } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch(
        "synthetic review-grade evaluator accepted authority conformance output"
      ),
      "const requirementId = 'REQ-T141-001';",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "mkdirSync(join(manifest.workspaceRoot, 'specification/requirements'), { recursive: true });",
      "writeFileSync(join(manifest.workspaceRoot, 'specification/INTENT.md'), '# Intent\\n\\nBuild a Rust hello-world tenant.\\n', 'utf8');",
      "writeFileSync(join(manifest.workspaceRoot, 'specification/PRODUCT.md'), '# Product\\n\\nhello_world_rust under build_tenants/hello_world_rust.\\n', 'utf8');",
      "writeFileSync(join(manifest.workspaceRoot, 'specification/GOALS.md'), '# Goals\\n\\n- Produce the declared product tenant.\\n', 'utf8');",
      "writeFileSync(join(manifest.workspaceRoot, 'specification/requirements/01-rust-hello-world.md'), `${requirementId}: Generate a Rust Cargo tenant that prints Hello, world!.\\n`, 'utf8');",
      "const content = ['# Project Authority Conformance', '', `graph_function: ${manifest.graphFunctionName}`, `target_asset: ${manifest.targetAssetType}`, '', `${requirementId}: Generate a Rust Cargo tenant that prints Hello, world!.`].join('\\n');",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');",
      "const digest = `sha256:${createHash('sha256').update(`${content}\\n`, 'utf8').digest('hex')}`;",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => {",
      "  if (obligation.obligationId.startsWith('requirement:')) {",
      "    return { kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'partial', evidenceRefs: [manifest.outputFile, ...obligation.evidenceRefs], blockingReasons: [`requirement_recorded_for_future_closure:${obligation.obligationId.slice('requirement:'.length)}`] };",
      "  }",
      "  return { kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [manifest.outputFile, ...obligation.evidenceRefs], blockingReasons: [] };",
      "});",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest, summary: 'conformed authority and carried requirements to product materialization', unresolvedReasons: [], materializedFiles: [], obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

function t141QueryContext(workspaceRoot) {
  const module = constructSdlcGtlModule();
  const constraints = admitSdlcProjectConstraints({
    projectSlug: "t141_requirement_carry",
    activeTenant: "hello_world_rust",
    selectedOutputRoot: "build_tenants/hello_world_rust",
    ambiguityRiskAppetite: "low",
    capabilityContracts: ["transport_contract"]
  });
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: deriveSdlcWorkspaceIngressReport({
      workspaceRootUri: pathToFileURL(workspaceRoot).href,
      projectConstraints: constraints,
      sourceInputs: []
    })
  });
  return { module, queryDomain };
}

function requirementSurfaceManifest(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_requirement_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 3,
    contract,
    runId: "t141-requirement-carry"
  });
}

test("T-141 requirement obligations can carry downstream without blocking the requirement edge", () => {
  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: [
      "target_asset:requirement_surface",
      "requirement:REQ-T141-001"
    ],
    assessments: [
      {
        obligationId: "target_asset:requirement_surface",
        fulfillmentStatus: "fulfilled",
        evidenceRefs: ["file:///workspace/.ai-workspace/runtime/requirement_surface.md"]
      },
      {
        obligationId: "requirement:REQ-T141-001",
        fulfillmentStatus: "partial",
        evidenceRefs: ["file:///workspace/specification/requirements/01-t141.md"],
        carryDirection: "downstream_transformation_set",
        downstreamGraphFunctionRefs: [
          FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
        ],
        targetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"]
      }
    ]
  });

  assert.deepEqual(projection.counts, {
    expected: 1,
    fulfilled: 1,
    partial: 0,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.deepEqual(projection.edgeLocalObligationIds, [
    "target_asset:requirement_surface"
  ]);
  assert.equal(projection.nonConvergedReasonRefs.length, 0);
  assert.equal(projection.downstreamTransformationSetRefs.length, 1);
  assert.equal(
    projection.downstreamTargetBindingRefs.includes(
      "target-binding://odd-sdlc/component_code_surface"
    ),
    true
  );

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("requirement-edge"),
    ledgerRef: "ledger://t141/requirement-edge",
    ledgerVersionRef: "ledger-version://t141/requirement-edge/1",
    edgeRef: "edge://t141/derive_requirement_surface",
    attemptRef: "attempt://t141/derive_requirement_surface/1",
    targetBindingRefs: ["target-binding://t141/requirement-surface"],
    evidenceBundleRefs: ["evidence://t141/requirement-edge"],
    materializationRefs: ["file:///workspace/.ai-workspace/runtime/requirement_surface.md"],
    admissionRefs: ["admission://t141/worker-report"],
    downstreamTransformationSetRefs: projection.downstreamTransformationSetRefs,
    downstreamPressureRefs: projection.downstreamPressureRefs,
    downstreamTargetBindingRefs: projection.downstreamTargetBindingRefs,
    counts: projection.counts,
    assessmentCount: projection.assessmentCount,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    predecessorRefs: [
      "target-binding://t141/requirement-surface",
      "evidence://t141/requirement-edge",
      ...projection.downstreamTransformationSetRefs,
      ...projection.downstreamPressureRefs,
      ...projection.downstreamTargetBindingRefs
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t141/requirement-edge/1",
    ledger,
    currentEdgeLawful: true,
    blockReasonRefs: projection.nonConvergedReasonRefs
  });

  assert.equal(ledger.edgeConverged, true);
  assert.equal(decision.disposition, "close");
});

test("T-141 assurance gate does not retry requirement rows carried to product materialization", () => {
  const manifest = requirementSurfaceManifest(writeRequirementWorkspace());
  const requirementAuthorityRef =
    "t141_requirement_carry.stage_01_rust_hello_world.req_t141_001";
  const before = snapshotProductMaterializationRoot(manifest.productMaterialization);
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(
    manifest.outputFile,
    [
      "# Requirement Surface",
      "",
      "REQ-T141-001: Generate a Rust Cargo tenant that prints Hello, world!."
    ].join("\n"),
    "utf8"
  );

  const report = buildPostTransformWorkerResultReport({ manifest, before });
  const requirementAssessment = report.obligationAssessments.find(
    (assessment) =>
      assessment.obligationId === `requirement:${requirementAuthorityRef}`
  );
  assert(requirementAssessment);
  assert.equal(requirementAssessment.fulfillmentStatus, "partial");
  assert.deepEqual(requirementAssessment.blockingReasons, [
    `requirement_recorded_for_future_closure:${requirementAuthorityRef}`
  ]);

  const gate = deriveSdlcOperatorAssuranceGate({
    manifest,
    report,
    postflight: {
      kind: "sdlc_operator_postflight_result",
      status: "passed",
      blockingReasons: [],
      blockingReasonCarriers: [],
      evidenceRefs: [`file://${manifest.outputFile}`]
    }
  });
  assert.equal(gate.blockingPostflight ?? null, null);
  assert.equal(gate.satisfaction.status, "close_allowed");
  assert.deepEqual(gate.satisfaction.gapReasons, []);
});

test("T-141 evaluate_next selects materialization action from carried requirement pressure", () => {
  const { basis, module } = moduleBasis();
  const materializeGraphFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert(materializeGraphFunction);

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("downstream-pressure"),
    ledgerRef: "ledger://t141/downstream-pressure",
    ledgerVersionRef: "ledger-version://t141/downstream-pressure/1",
    edgeRef: "edge://t141/derive_requirement_surface",
    attemptRef: "attempt://t141/derive_requirement_surface/1",
    targetBindingRefs: ["target-binding://t141/requirement-surface"],
    evidenceBundleRefs: ["evidence://t141/requirement-edge"],
    downstreamTransformationSetRefs: [
      "obligation://odd-sdlc/requirement%3AREQ-T141-001/downstream_transformation_set"
    ],
    downstreamPressureRefs: [
      "obligation://odd-sdlc/requirement%3AREQ-T141-001/downstream_transformation_set",
      "file:///workspace/specification/requirements/01-t141.md"
    ],
    downstreamTargetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true,
    predecessorRefs: [
      "target-binding://t141/requirement-surface",
      "evidence://t141/requirement-edge",
      "target-binding://odd-sdlc/component_code_surface",
      "obligation://odd-sdlc/requirement%3AREQ-T141-001/downstream_transformation_set"
    ]
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t141/downstream-pressure",
    ledger,
    currentEdgeLawful: true
  });
  const targetOutcomeRef = "target-outcome://t141/component-code";
  const evaluator = deriveOddSdlcEvaluateNextReport({
    basis,
    events: [],
    intentEventRefs: ["event://t141/intent"],
    productAssetModelRef: "product-asset-model://t141/current",
    episodeId: "construction-episode://t141/post-action",
    observationId: "construction-observation://t141/post-action",
    pressures: [
      {
        pressureRef: "pressure://t141/downstream-product-materialization",
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
        actionRef: "construction-action://t141/materialize-declared-product",
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
      },
      {
        actionRef: "construction-action://t141/broad-bootstrap-fallback",
        actionKind: "invoke_graph_function",
        graphFunctionRef: "bootstrap_release_self_test",
        graphVectorRef: null,
        publishedTraversalTargetRef:
          "published-action://odd-sdlc/graph-function/bootstrap_release_self_test",
        targetOutcomeRef: "target-outcome://t141/broad-bootstrap",
        expectedOutputAssetRefs: ["asset-type://odd-sdlc/release_surface"],
        requiredAuthorityRefs: [
          "published-action://odd-sdlc/graph-function/bootstrap_release_self_test"
        ]
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
  assert.match(
    nextActionProjection.selectedActionRef ?? "",
    /materialize-declared-product/u
  );
  assert.doesNotMatch(
    nextActionProjection.selectedActionRef ?? "",
    /broad-bootstrap-fallback/u
  );
});

test("T-141 materialization candidate is derived from the published graph catalog", () => {
  const { module } = moduleBasis();
  const action = deriveSdlcPublishedProductMaterializationAction({
    module,
    downstreamTargetBindingRefs: [
      "target-binding://odd-sdlc/component_code_surface"
    ]
  });

  assert.equal(action.status, "eligible");
  assert.equal(
    action.graphFunctionRef,
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert.deepEqual(action.outputAssetTypes, ["component_code_surface"]);
  assert.deepEqual(action.targetBindingRefs, [
    "target-binding://odd-sdlc/component_code_surface"
  ]);
  assert.deepEqual(action.eligibleTargetBindingRefs, [
    "target-binding://odd-sdlc/component_code_surface"
  ]);
});

test("T-141 unpublished or mismatched materialization action fails closed before selection", () => {
  const unpublished = deriveSdlcPublishedProductMaterializationAction({
    module: moduleWithoutMaterializer(),
    downstreamTargetBindingRefs: [
      "target-binding://odd-sdlc/component_code_surface"
    ]
  });
  assert.equal(unpublished.status, "unpublished");
  assert.equal(unpublished.graphFunctionRef, null);
  assert.equal(
    unpublished.reasonRefs.includes(
      "product_materialization_graph_function_unpublished"
    ),
    true
  );

  const mismatch = deriveSdlcPublishedProductMaterializationAction({
    module: moduleBasis().module,
    downstreamTargetBindingRefs: [
      "target-binding://odd-sdlc/tenant_release_surface"
    ]
  });
  assert.equal(mismatch.status, "target_binding_mismatch");
  assert.equal(mismatch.eligibleTargetBindingRefs.length, 0);
  assert.equal(
    mismatch.reasonRefs.includes(
      "downstream_target_binding_not_admitted_for_published_materializer"
    ),
    true
  );
});

test("T-141 target binding reuses the existing target-obligation surface for product code", () => {
  const module = constructSdlcGtlModule();
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: deriveSdlcWorkspaceIngressReport({
      workspaceRootUri: "file:///workspace/t141",
      projectConstraints: admitSdlcProjectConstraints({
        projectSlug: "t141",
        activeTenant: "hello_world_rust",
        selectedOutputRoot: "build_tenants/hello_world_rust",
        ambiguityRiskAppetite: "low",
        capabilityContracts: ["transport_contract"]
      }),
      sourceInputs: []
    })
  });
  const binding = deriveSdlcTargetObligationBinding({
    queryDomain,
    targetAssetType: "component_code_surface"
  });

  assert.equal(binding.kind, "sdlc_target_obligation_binding");
  assert.equal(binding.status, "eligible");
  assert.equal(
    binding.admissibleGraphFunctionNames.includes(
      FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
    ),
    true
  );
  assert.equal(
    binding.publishedActionRefs.includes(
      `published-action://odd-sdlc/graph-function/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
    ),
    true
  );
});
