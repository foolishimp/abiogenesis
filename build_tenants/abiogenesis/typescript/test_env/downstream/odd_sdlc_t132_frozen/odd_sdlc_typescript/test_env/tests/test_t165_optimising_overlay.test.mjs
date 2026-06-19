// Validates: T-165

import test from "node:test";
import assert from "node:assert/strict";
import { materializeGraphFunction } from "@abiogenesis/typescript-tenant";

import {
  admitSdlcBootstrapPreStartExecutionContract,
  admitSdlcBootstrapTraversalOutcome,
  admitSdlcOptimizedEdgeSpecialization,
  admitSdlcOptimizedOverlayBinding,
  admitSdlcProjectConstraints,
  assertSdlcOptimisingOverlayReadModelOnly,
  assertSdlcOptimizedBindingDoesNotClose,
  conformProjectProfileFromConstraintsText,
  constructSdlcBootstrapPublicStartOptimization,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  FG_BOOTSTRAP_SDLC_ENTRY,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";

function projectContext(input = {}) {
  const workspaceRoot = input.workspaceRoot ?? "/workspace/t165";
  const projectSlug = input.projectSlug ?? "t165_hello_world";
  const activeTenant = input.activeTenant ?? "hello_world_javascript";
  const selectedOutputRoot =
    input.selectedOutputRoot ?? `build_tenants/${activeTenant}`;
  const capabilityLines = input.capabilityLines ?? [
    "      trivial_product: true"
  ];
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug,
    activeTenant,
    selectedOutputRoot,
    ambiguityRiskAppetite: "low",
    capabilityContracts: capabilityLines.map((line) =>
      line.trim().split(":")[0].trim()
    )
  });
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints,
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      `  name: ${projectSlug}`,
      "  kind: imported_workspace",
      input.overlayStrategy === undefined
        ? ""
        : `  overlay_strategy: ${input.overlayStrategy}`,
      "active_tenant: " + activeTenant,
      "selected_output_root: " + selectedOutputRoot,
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      `  ${activeTenant}:`,
      "    output_dir: " + selectedOutputRoot,
      "    capability_contracts:",
      ...capabilityLines
    ].filter((line) => line.length > 0).join("\n")
  });
  return { module, queryDomain, conformedProject, workspaceRoot };
}

test("T-165 publishes bootstrap-entry graph function and contract rows", () => {
  const module = constructSdlcGtlModule();
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === FG_BOOTSTRAP_SDLC_ENTRY
  );
  assert(graphFunction);
  const graph = materializeGraphFunction(graphFunction);
  assert.equal(graph.vectors.length, 1);
  assert.equal(graph.vectors[0].name, FG_BOOTSTRAP_SDLC_ENTRY);
  assert.deepStrictEqual(
    graph.vectors[0].source.map((node) => node.name),
    ["type.unstructured"]
  );
  assert.equal(graph.vectors[0].target.name, "sdlc_bootstrap_traversal_outcome");

  const contract = SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.find(
    (candidate) => candidate.edgeRef === FG_BOOTSTRAP_SDLC_ENTRY
  );
  assert(contract);
  assert.equal(contract.closureClassification, "close_capable");
  assert.equal(contract.targetAssetType, "sdlc_bootstrap_traversal_outcome");
  assert(contract.proofLaneRefs.some((ref) => ref.includes("t165")));
});

test("T-165 public start carries optimized bootstrap outcome for framework-smoke work", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = projectContext();
  const outcome = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: { kind: "next", handle: "auto" },
      until: "blocked",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert(outcome.executionContract);
  const optimization = outcome.executionContract.bootstrapOptimization;
  assert.equal(optimization.outcome.status, "entry_admitted");
  assert.equal(optimization.outcome.optimizationStatus, "optimized");
  assert.equal(optimization.entryNonAdmission, null);
  assert.equal(optimization.entryNode.outcomeClass, "framework_smoke");
  assert.equal(
    optimization.outcome.selectedChildOverlayRef,
    SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
  );
  assert.equal(
    outcome.executionContract.targetGraphFunction,
    FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
  );
  assert.equal(
    optimization.optimizedOverlayBinding.closureAuthorityRef,
    "edge-assurance-contracts"
  );
  assertSdlcOptimizedBindingDoesNotClose(optimization.optimizedOverlayBinding);
  assert.equal(
    admitSdlcBootstrapTraversalOutcome(optimization.outcome).outcomeRef,
    optimization.outcome.outcomeRef
  );
  const preStartContract = admitSdlcBootstrapPreStartExecutionContract(
    optimization.preStartExecutionContract
  );
  assert.equal(preStartContract.graphFunctionName, FG_BOOTSTRAP_SDLC_ENTRY);
  assert.equal(preStartContract.sourceTypeName, "type.unstructured");
  assert.equal(
    preStartContract.targetTypeName,
    "sdlc_bootstrap_traversal_outcome"
  );
  assert.equal(preStartContract.outcomeRef, optimization.outcome.outcomeRef);
  assert(
    preStartContract.replayIdentityRefs.includes(
      optimization.proportionalityReport.reportRef
    )
  );
  assert(
    preStartContract.replayIdentityRefs.includes(
      optimization.entryNode.entryNodeRef
    )
  );
});

test("T-203 public start triages thread profile into lite proportional entry", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = projectContext({
    overlayStrategy: "thread"
  });
  const outcome = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: { kind: "next", handle: "auto" },
      until: "blocked",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(conformedProject.overlayStrategy, "thread");
  assert.equal(
    conformedProject.overlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.targetGraphFunction,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.equal(
    outcome.executionContract.traversalDecompositionSummary?.stageId,
    "public_start_lite_design_module_implementation"
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.hopClass,
    "single_hop"
  );

  const optimization = outcome.executionContract.bootstrapOptimization;
  assert.equal(optimization.outcome.status, "entry_admitted");
  assert.equal(optimization.outcome.optimizationStatus, "optimized");
  assert.equal(
    optimization.outcome.selectedChildOverlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.equal(
    optimization.proportionalityReport.selectedChildOverlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.equal(
    optimization.proportionalityReport.selectedStartTargetRef,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
});

test("T-165 domain products fall back to generic F_P with explicit non-admission", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = projectContext({
    projectSlug: "data_mapper_test35",
    activeTenant: "scala_spark",
    selectedOutputRoot: "build_tenants/scala_spark",
    capabilityLines: [
      "      trivial_product: false",
      "      sdlc_outcome_class: domain_product"
    ]
  });
  const outcome = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: { kind: "next", handle: "auto" },
      until: "blocked",
      defaultRegime: "F_P"
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert(outcome.executionContract);
  const optimization = outcome.executionContract.bootstrapOptimization;
  assert.equal(optimization.outcome.status, "entry_rejected");
  assert.equal(optimization.outcome.optimizationStatus, "generic_fallback");
  assert.equal(optimization.entryNode, null);
  assert(optimization.entryNonAdmission);
  assert.equal(
    optimization.entryNonAdmission.fallbackOverlayRef,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  assert.equal(optimization.entryNonAdmission.genericFpRequired, true);
  assert(
    optimization.outcome.optimizationNonAdmissionReasonRefs.some((ref) =>
      ref.includes("domain-product")
    )
  );
  assert.equal(optimization.optimizedEdgeSpecialization.status, "not_admitted");
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  const preStartContract = admitSdlcBootstrapPreStartExecutionContract(
    optimization.preStartExecutionContract
  );
  assert.equal(preStartContract.graphFunctionName, FG_BOOTSTRAP_SDLC_ENTRY);
  assert.equal(preStartContract.outcomeRef, optimization.outcome.outcomeRef);
  assert.equal(
    preStartContract.fallbackOverlayRef,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  assert(
    preStartContract.replayIdentityRefs.includes(
      optimization.entryNonAdmission.nonAdmissionRef
    )
  );
});

test("T-165 query-domain exposes optimising overlay as read-only projection", () => {
  const { queryDomain } = projectContext();
  assert.equal(queryDomain.optimisingOverlays.length, 1);
  const overlay = queryDomain.optimisingOverlays[0];
  assert.equal(overlay.overlayRef, SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF);
  assert.equal(overlay.overlayRole, "optimising_parent_overlay");
  assert.equal(overlay.createsRuntimeTruth, false);
  assert.equal(overlay.ownsClosureAuthority, false);
  assert.equal(overlay.queryDomainReadModelOnly, true);
  assert(overlay.childOverlayRefs.includes(SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF));
  assert(overlay.childOverlayRefs.includes(SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF));
  assert.equal(overlay.genericFallbackOverlayRef, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  assertSdlcOptimisingOverlayReadModelOnly(overlay);
});

test("T-165 carrier admission rejects mixed entry and non-admission outcome", () => {
  const optimization = constructSdlcBootstrapPublicStartOptimization({
    workspaceIdentityRef: "workspace://odd-sdlc/t165",
    projectSlug: "t165",
    selectedOutputRoot: "build_tenants/typescript",
    outcomeClass: "framework_smoke",
    selectedChildOverlayRef: SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
    selectedGraphFunctionRef: "graph-function://odd-sdlc/framework-smoke",
    selectedStartTargetRef: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
    fallbackOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
    fallbackGraphFunctionRef: "graph-function://odd-sdlc/derive_intent_surface",
    optimizationAdmitted: true,
    landscapeFactRefs: ["landscape://odd-sdlc/framework-smoke"],
    capabilityRefs: ["capability://odd-sdlc/trivial_product/true"],
    sourceRefs: ["source://odd-sdlc/t165"],
    applicabilityEnvelopeRefs: ["applicability://odd-sdlc/framework-smoke"],
    nonAdmissionReasonRefs: []
  });
  assert.equal(
    admitSdlcOptimizedOverlayBinding(optimization.optimizedOverlayBinding).bindingRef,
    optimization.optimizedOverlayBinding.bindingRef
  );
  assert.equal(
    admitSdlcOptimizedEdgeSpecialization(
      optimization.optimizedEdgeSpecialization
    ).specializationRef,
    optimization.optimizedEdgeSpecialization.specializationRef
  );
  assert.equal(
    admitSdlcBootstrapPreStartExecutionContract(
      optimization.preStartExecutionContract
    ).contractRef,
    optimization.preStartExecutionContract.contractRef
  );
  assert.throws(
    () =>
      admitSdlcBootstrapTraversalOutcome({
        ...optimization.outcome,
        entryNonAdmissionRef: "entry-non-admission://odd-sdlc/invalid"
    }),
    /exactly one entryNodeRef or entryNonAdmissionRef/u
  );
  assert.throws(
    () =>
      admitSdlcBootstrapPreStartExecutionContract({
        ...optimization.preStartExecutionContract,
        graphFunctionName: "Fg_hidden_local_start_branch"
      }),
    /graphFunctionName/u
  );
});
