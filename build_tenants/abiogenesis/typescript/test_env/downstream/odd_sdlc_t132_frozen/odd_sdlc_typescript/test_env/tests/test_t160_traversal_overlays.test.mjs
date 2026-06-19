// Investigates: T-160

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { materializeGraphFunction } from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  constructSdlcOverlayBinding,
  conformProjectProfileFromConstraintsText,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcNextActionProjection,
  constructSdlcOverlaySegmentCompletion,
  constructSdlcTraversalOverlayCatalog,
  deriveWorkerHandoffManifest,
  deriveSdlcPostActionOverlayReentryActionInput,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcWorkspaceIngressReport,
  FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
  FG_CONFORM_PROJECT,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  FG_PREPARE_TEST_EXECUTION_SURFACE,
  FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
  hookContractByEdgeName,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicSdlcOverlayStartTargets,
  publicStartOnce,
  sdlcTraversalOverlayFailureReentryRoute,
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF,
  withSdlcOverlayBindingPostActionEvidence
} from "../../build/semantic/code/src/index.js";

function startContext(workspaceRoot = "/workspace/t160") {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t160",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
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
      "  name: t160",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject, workspaceRoot };
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t160/${caseId}`,
    compositionDigest: `digest://t160/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t160/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t160/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t160/${caseId}`,
    graphVectorRef: `graph-vector://t160/${caseId}`,
    basisRef: `basis://t160/${caseId}`
  });
}

test("T-160 publishes governed traversal overlays with boundary refs", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlays = new Map(catalog.overlays.map((overlay) => [overlay.overlayRef, overlay]));

  assert.deepStrictEqual(
    catalog.overlays.map((overlay) => overlay.overlayRef),
    [
      SDLC_TICKET_WORKFLOW_OVERLAY_REF,
      SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
      SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
      SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
      SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
      SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
      SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
    ]
  );
  assert.equal(overlays.has("overlay://odd-sdlc/hello-world-light"), false);
  assert(
    overlays
      .get(SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF)
      .aliases.includes("overlay://odd-sdlc/bootstrap-heavy")
  );
  const currentFull = overlays.get(SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  const deepSdlc = overlays.get(SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF);
  assert(currentFull);
  assert(deepSdlc);
  assert.deepStrictEqual(
    currentFull.annotations.map((annotation) => annotation.annotationKind),
    ["baseline_full_sdlc_traversal"]
  );
  assert.equal(currentFull.annotations[0].depthTraversalEligible, false);
  assert.equal(currentFull.annotations[0].decompositionTraceRequired, false);
  assert.equal(currentFull.annotations[0].zoomGraphFunctionRef, null);
  assert.deepStrictEqual(currentFull.annotations[0].zoomTargetGraphFunctionRefs, []);
  assert.equal(deepSdlc.annotations.length, 1);
  assert.equal(
    deepSdlc.annotations[0].annotationKind,
    "deep_sdlc_traversal_candidate"
  );
  assert.equal(
    deepSdlc.annotations[0].parentOverlayRef,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  assert.equal(deepSdlc.annotations[0].depthTraversalEligible, true);
  assert.equal(deepSdlc.annotations[0].decompositionTraceRequired, true);
  assert.equal(deepSdlc.annotations[0].abgRuntimeAuthorityOnly, true);
  assert.equal(
    deepSdlc.annotations[0].zoomGraphFunctionRef,
    "Fg_decompose_depth_between_nodes"
  );
  assert.deepStrictEqual(deepSdlc.annotations[0].zoomTargetGraphFunctionRefs, [
    "derive_component_code_surface",
    "qualify_component_realization_surface",
    "derive_code_surface",
    "derive_test_design_surface",
    "derive_component_test_surface",
    "derive_uat_test_source_surface",
    "prepare_test_execution_surface",
    "derive_test_execution_result_surface",
    "qualify_component_test_execution_surface",
    "derive_component_repair_schedule_surface",
    "derive_test_run_archive_surface"
  ]);
  assert(deepSdlc.aliases.includes("overlay://odd-sdlc/deep-sdlc"));
  assert.deepStrictEqual(deepSdlc.graphFunctionRefs, currentFull.graphFunctionRefs);
  assert.deepStrictEqual(deepSdlc.graphVectorRefs, currentFull.graphVectorRefs);
  assert.deepStrictEqual(deepSdlc.publicStartTargets, currentFull.publicStartTargets);
  assert.equal(deepSdlc.defaultStartTarget, currentFull.defaultStartTarget);
  assert.deepStrictEqual(
    deepSdlc.termination.terminalAssetTypes,
    currentFull.termination.terminalAssetTypes
  );
  assert.deepStrictEqual(
    deepSdlc.termination.terminalGraphFunctionRefs,
    currentFull.termination.terminalGraphFunctionRefs
  );
  assert.deepStrictEqual(
    deepSdlc.termination.lawfulStopDispositions,
    currentFull.termination.lawfulStopDispositions
  );
  const comparableTemplates = (overlay) =>
    overlay.assetTemplates.map((template) => ({
      assetType: template.assetType,
      defaultPath: template.defaultPath,
      producerGraphFunctionRef: template.producerGraphFunctionRef,
      terminalRole: template.terminalRole
    }));
  assert.deepStrictEqual(
    comparableTemplates(deepSdlc),
    comparableTemplates(currentFull)
  );
  for (const overlay of catalog.overlays) {
    assert.match(overlay.graphCatalogDigestRef, /^graph-catalog-digest:\/\/odd-sdlc\//);
    assert(overlay.graphFunctionRefs.length > 0, overlay.overlayRef);
    assert(overlay.graphVectorRefs.length > 0, overlay.overlayRef);
    assert(overlay.assetTemplates.length > 0, overlay.overlayRef);
    for (const template of overlay.assetTemplates) {
      assert.equal(template.kind, "sdlc_overlay_asset_template");
      assert.match(template.templateRef, /^overlay:\/\/odd-sdlc\//);
      assert.doesNotMatch(
        template.defaultPath,
        /hello_world_javascript/u,
        `${overlay.overlayRef} ${template.assetType}`
      );
      assert(
        ["terminal_asset", "supporting_asset"].includes(template.terminalRole)
      );
      assert(overlay.graphFunctionRefs.includes(template.producerGraphFunctionRef));
    }
    assert(
      overlay.assetTemplates.some(
        (template) => template.terminalRole === "terminal_asset"
      ),
      overlay.overlayRef
    );
    assert.equal(
      overlay.graphFunctionRefs.some((ref) => ref.startsWith("graph-function:")),
      false,
      overlay.overlayRef
    );
    assert.equal(
      overlay.graphVectorRefs.some(
        (ref) => ref.startsWith("graph-vector:") || ref.startsWith("vector:")
      ),
      false,
      overlay.overlayRef
    );
  }
  assert.deepStrictEqual(
    overlays.get(SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF).publicStartTargets,
    [FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE]
  );
  assert.deepStrictEqual(
    overlays.get(SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF).publicStartTargets,
    [FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE]
  );
  assert.deepStrictEqual(
    overlays.get(SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF).publicStartTargets,
    [FG_SOLUTION_ARCHITECTURE_EXECUTIVE]
  );
  assert.deepStrictEqual(
    overlays.get(SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF).publicStartTargets,
    [FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE]
  );
});

test("T-160 lite overlay terminates on a bounded implementation edge", () => {
  const module = constructSdlcGtlModule();
  const liteExecutive = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
  assert(liteExecutive);
  const graph = materializeGraphFunction(liteExecutive);
  const finalVector = graph.vectors.at(-1);
  assert(finalVector);

  assert.deepStrictEqual(
    graph.vectors.map((vector) => vector.name),
    [
      FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
      FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
      FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
      FG_PREPARE_TEST_EXECUTION_SURFACE,
      FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
    ]
  );
  assert.equal(finalVector.name, FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE);
  assert.equal(finalVector.target.name, "test_execution_result_surface");
  assert.deepStrictEqual(
    graph.vectors[1].source.map((node) => node.name),
    ["implementation_design_surface"]
  );
  assert.equal(
    graph.vectors[1].source.some((node) =>
      node.name !== "implementation_design_surface"
    ),
    false
  );
});

test("T-160 reduced implementation overlays publish tenant-neutral code and test assets", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  for (const overlayRef of [
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
    SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
  ]) {
    const overlay = catalog.overlays.find(
      (candidate) => candidate.overlayRef === overlayRef
    );
    assert(overlay, overlayRef);
    const templates = new Map(
      overlay.assetTemplates.map((template) => [template.assetType, template])
    );

    assert.deepStrictEqual(
      [...templates.keys()].sort(),
      [
        "component_code_surface",
        "component_test_surface",
        "implementation_design_surface",
        "test_design_surface",
        "test_execution_result_surface",
        "test_execution_surface",
        "uat_test_source_surface"
      ].sort(),
      overlayRef
    );
    assert.equal(
      templates.get("component_code_surface")?.defaultPath,
      "design/component_code_surface.md",
      overlayRef
    );
    assert.equal(
      templates.get("implementation_design_surface")?.producerGraphFunctionRef,
      FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("test_design_surface")?.producerGraphFunctionRef,
      FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("component_test_surface")?.producerGraphFunctionRef,
      FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("uat_test_source_surface")?.producerGraphFunctionRef,
      FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("test_execution_surface")?.producerGraphFunctionRef,
      FG_PREPARE_TEST_EXECUTION_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("test_execution_result_surface")?.producerGraphFunctionRef,
      FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
      overlayRef
    );
    assert.equal(
      templates.get("test_execution_result_surface")?.terminalRole,
      "terminal_asset",
      overlayRef
    );
  }
});

test("T-160 lite overlay routes failed test execution back to component code", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlay = catalog.overlays.find(
    (candidate) =>
      candidate.overlayRef === SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert(overlay);

  const route = sdlcTraversalOverlayFailureReentryRoute({
    overlay,
    completedGraphVectorRef: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
    closureDisposition: "repair"
  });

  assert(route);
  assert.equal(route.sourceGraphVectorName, FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE);
  assert.equal(route.targetGraphVectorName, FG_DERIVE_LITE_COMPONENT_CODE_SURFACE);
  assert.deepEqual(route.closureDispositions, ["repair"]);
  assert(
    route.reasonRefs.some((ref) => ref.includes("test-execution-failed")),
    route.reasonRefs.join("\n")
  );
});

test("T-160 framework-smoke Min(F_P) overlay terminates on test execution proof", () => {
  const module = constructSdlcGtlModule();
  const frameworkSmokeExecutive = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
  );
  assert(frameworkSmokeExecutive);
  const graph = materializeGraphFunction(frameworkSmokeExecutive);
  const finalVector = graph.vectors.at(-1);
  assert(finalVector);

  assert.deepStrictEqual(
    graph.vectors.map((vector) => vector.name),
    [
      FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
      FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
      FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
      FG_PREPARE_TEST_EXECUTION_SURFACE,
      FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
    ]
  );
  assert.equal(finalVector.name, FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE);
  assert.equal(finalVector.target.name, "test_execution_result_surface");
  assert(
    graph.vectors.findIndex((vector) => vector.name === FG_DERIVE_LITE_COMPONENT_TEST_SURFACE) <
      graph.vectors.findIndex((vector) => vector.name === FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE)
  );
  assert(
    graph.vectors.findIndex((vector) => vector.name === FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE) <
      graph.vectors.findIndex((vector) => vector.name === FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE)
  );

  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlay = catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
  );
  assert(overlay);
  assert.deepStrictEqual(
    overlay.termination.terminalGraphFunctionRefs,
    [FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE]
  );
  const terminalTemplate = overlay.assetTemplates.find(
    (template) => template.terminalRole === "terminal_asset"
  );
  assert.equal(
    terminalTemplate?.producerGraphFunctionRef,
    FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
  );
});

test("T-160 overlay binding distinguishes material assets from planned templates", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlay = catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert(overlay);
  const planned = constructSdlcOverlayBinding({
    catalog,
    overlay,
    workspaceRootUri: "file:///workspace/t160",
    workspaceIdentityRef: "workspace://t160",
    preActionWorkspaceObservationRef: "observation://t160/pre",
    preActionWorkspaceFingerprintRef: "fingerprint://t160/pre",
    selectedGraphFunctionRef: overlay.graphFunctionRefs[0],
    selectedStartTargetRef: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
    requestedBy: "public_start"
  });
  assert.equal(planned.assetBindings[0].mode, "planned_from_template");
  assert.equal(planned.assetBindings[0].templateRef, overlay.assetTemplates[0].templateRef);

  const material = constructSdlcOverlayBinding({
    catalog,
    overlay,
    workspaceRootUri: "file:///workspace/t160",
    workspaceIdentityRef: "workspace://t160",
    preActionWorkspaceObservationRef: "observation://t160/pre",
    preActionWorkspaceFingerprintRef: "fingerprint://t160/pre",
    selectedGraphFunctionRef: overlay.graphFunctionRefs[0],
    selectedStartTargetRef: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
    requestedBy: "public_start",
    materialAssetRefs: [
      {
        assetType: "component_code_surface",
        assetRef: "workspace://build_tenants/hello_world_javascript/src/hello.js",
        relativePath: "build_tenants/hello_world_javascript/src/hello.js",
        evidenceRefs: ["evidence://t160/material"]
      }
    ]
  });
  assert.equal(material.assetBindings[0].mode, "material");
  assert.equal(material.assetBindings[0].templateRef, null);
  assert.deepEqual(material.assetBindings[0].evidenceRefs, ["evidence://t160/material"]);

  const deepOverlay = catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  );
  assert(deepOverlay);
  const deepBinding = constructSdlcOverlayBinding({
    catalog,
    overlay: deepOverlay,
    workspaceRootUri: "file:///workspace/t160",
    workspaceIdentityRef: "workspace://t160",
    preActionWorkspaceObservationRef: "observation://t160/pre-deep",
    preActionWorkspaceFingerprintRef: "fingerprint://t160/pre-deep",
    selectedGraphFunctionRef: deepOverlay.graphFunctionRefs[0],
    selectedStartTargetRef: "derive_intent_surface",
    requestedBy: "public_start"
  });
  assert.deepEqual(
    deepBinding.annotationRefs,
    deepOverlay.annotations.map((annotation) => annotation.annotationRef)
  );
  assert.deepEqual(deepBinding.zoomGraphFunctionRefs, [
    FG_DECOMPOSE_DEPTH_BETWEEN_NODES
  ]);
  assert(deepBinding.zoomTargetGraphFunctionRefs.includes("derive_component_code_surface"));
  assert(deepBinding.zoomTargetGraphFunctionRefs.includes("derive_component_test_surface"));
  assert(deepBinding.predecessorRefs.includes(FG_DECOMPOSE_DEPTH_BETWEEN_NODES));
  assert(deepBinding.predecessorRefs.includes("derive_component_code_surface"));
  const deepManifest = deriveWorkerHandoffManifest({
    workspaceRoot: mkdtempSync(path.join(tmpdir(), "odd-sdlc-t160-zoom-")),
    overlayRef: deepBinding.overlayRef,
    overlayBindingRef: deepBinding.bindingRef,
    graphCatalogDigestRef: deepBinding.graphCatalogDigestRef,
    overlayAnnotationRefs: deepBinding.annotationRefs,
    overlayZoomGraphFunctionRefs: deepBinding.zoomGraphFunctionRefs,
    overlayZoomTargetGraphFunctionRefs: deepBinding.zoomTargetGraphFunctionRefs,
    graphFunctionName: "derive_component_code_surface",
    edgeName: "derive_component_code_surface",
    vectorIndex: 0,
    contract: hookContractByEdgeName("derive_component_code_surface")
  });
  assert.deepEqual(deepManifest.overlayAnnotationRefs, deepBinding.annotationRefs);
  assert.deepEqual(
    deepManifest.overlayZoomGraphFunctionRefs,
    deepBinding.zoomGraphFunctionRefs
  );
  assert.deepEqual(
    deepManifest.overlayZoomTargetGraphFunctionRefs,
    deepBinding.zoomTargetGraphFunctionRefs
  );

  assert.throws(
    () =>
      constructSdlcOverlayBinding({
        catalog,
        overlay,
        workspaceRootUri: "file:///workspace/t160",
        workspaceIdentityRef: "workspace://t160",
        preActionWorkspaceObservationRef: "observation://t160/pre",
        preActionWorkspaceFingerprintRef: "fingerprint://t160/pre",
        selectedGraphFunctionRef: overlay.graphFunctionRefs[0],
        selectedStartTargetRef: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
        requestedBy: "public_start",
        materialAssetRefs: [
          {
            assetType: "undeclared_asset",
            assetRef: "workspace://bad",
            relativePath: "bad",
            evidenceRefs: []
          }
        ]
      }),
    /not declared by the selected overlay template/
  );
});

test("T-160 overlay binding admits post-action workspace evidence as refinement", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlay = catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert(overlay);
  const binding = constructSdlcOverlayBinding({
    catalog,
    overlay,
    workspaceRootUri: "file:///workspace/t160",
    workspaceIdentityRef: "workspace://t160",
    preActionWorkspaceObservationRef: "observation://t160/pre",
    preActionWorkspaceFingerprintRef: "fingerprint://t160/pre",
    selectedGraphFunctionRef: overlay.graphFunctionRefs[0],
    selectedStartTargetRef: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
    requestedBy: "public_start"
  });
  const refined = withSdlcOverlayBindingPostActionEvidence({
    binding,
    postActionWorkspaceObservationRef: "observation://t160/post",
    postActionWorkspaceFingerprintRef: "fingerprint://t160/post",
    workspaceDeltaRef: "workspace-delta://t160/post"
  });

  assert.equal(refined.bindingRef, binding.bindingRef);
  assert.equal(
    refined.workspaceBasis.postActionWorkspaceObservationRef,
    "observation://t160/post"
  );
  assert(refined.predecessorRefs.includes("workspace-delta://t160/post"));
});

test("T-160 query-domain renders overlay-governed start targets as read model", () => {
  const { queryDomain } = startContext();

  assert.equal(queryDomain.readOnly, true);
  assert.equal(queryDomain.traversalOverlays.kind, "sdlc_traversal_overlay_catalog");
  assert(
    queryDomain.startTargets.some(
      (target) =>
        target.name === FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE &&
        target.overlayRefs.includes(SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF)
    )
  );
  assert(
    queryDomain.startTargets.some(
      (target) =>
        target.name === FG_SOLUTION_ARCHITECTURE_EXECUTIVE &&
        target.defaultForOverlayRefs.includes(SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF)
    )
  );
});

test("T-164 bootstrap overlay owns initial conformance when the project is underconformed", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const blockedQueryDomain = Object.freeze({
    ...queryDomain,
    projectConformance: Object.freeze({
      ...(queryDomain.projectConformance ?? {}),
      status: "blocked"
    })
  });
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const blockedTargets = publicSdlcOverlayStartTargets({
    module,
    catalog,
    projectConformanceStatus: "blocked"
  });
  const conformTarget = blockedTargets.find(
    (target) => target.name === FG_CONFORM_PROJECT
  );
  assert(conformTarget);
  assert(
    conformTarget.overlayRefs.includes(SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF)
  );
  assert(
    conformTarget.defaultForOverlayRefs.includes(
      SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
    )
  );

  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "bootstrap-requirements"
      },
      until: "first_traversal",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain: blockedQueryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_projected");
  assert(outcome.executionContract);
  assert.equal(outcome.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
  );
});

test("T-160 public start admits overlay binding directly for lite traversal", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "lite-design-module-implementation"
      },
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
    outcome.executionContract.targetGraphFunction,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.match(
    outcome.executionContract.overlayBindingRef,
    /^overlay-binding:\/\/odd-sdlc\//
  );
  assert.equal(
    outcome.executionContract.nextActionProjection.overlayBindingRef,
    outcome.executionContract.overlayBindingRef
  );
  assert(
    outcome.executionContract.constructionIntent.basisRefs.includes(
      outcome.executionContract.overlayBindingRef
    )
  );
});

test("T-200 explicit deep overlay selection preserves current full traversal shape", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "deep-sdlc-traversal"
      },
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
    outcome.executionContract.targetGraphFunction,
    "derive_intent_surface"
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  );
  assert.equal(
    outcome.executionContract.overlayBinding.overlayRef,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  );
  assert(
    outcome.executionContract.overlayBinding.remainingGraphPressureRefs.every(
      (ref) => ref.includes("deep-sdlc-traversal")
    )
  );
  assert(
    outcome.executionContract.constructionIntent.basisRefs.includes(
      outcome.executionContract.overlayBindingRef
    )
  );
});

test("T-160 post-action overlay repair selects the lite component-code vector", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "lite-design-module-implementation"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });
  assert(outcome.executionContract);
  const graph = materializeGraphFunction(outcome.executionContract.basis.graphFunction);
  const testExecutionIndex = graph.vectors.findIndex(
    (vector) => vector.name === FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
  );
  assert(testExecutionIndex > 0);

  const action = deriveSdlcPostActionOverlayReentryActionInput({
    basis: outcome.executionContract.basis,
    module,
    overlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
    completedGraphVectorRef: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
    closureDecisionDisposition: "repair",
    currentVectorIndex: testExecutionIndex
  });

  assert(action);
  assert.equal(action.actionKind, "reenter_graph_span");
  assert.equal(action.graphFunctionRef, outcome.executionContract.targetGraphFunction);
  assert.match(action.graphVectorRef, /derive_lite_component_code_surface/u);
  assert(
    action.eligibleReasonRefs.some((ref) => ref.includes("test-execution-failed")),
    action.eligibleReasonRefs.join("\n")
  );
});

test("T-170 hello-world profile selects thread overlay for next start", () => {
  const { module, queryDomain, workspaceRoot } = startContext();
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t132_hello_world_single_tenant",
      "  kind: imported_workspace",
      "  overlay_strategy: thread",
      "  overlay_ref: overlay://odd-sdlc/lite-design-module-implementation",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n")
  });
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "next",
        handle: "auto"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
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
    outcome.executionContract.overlayBinding.selection.selectedStartTargetRef,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
});

test("T-170 data-mapper profile selects full lifecycle and preserves broad pressure", () => {
  const { module, queryDomain, workspaceRoot } = startContext();
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: data_mapper.test35",
      "  kind: data-pipeline",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    module_structure:",
      "      - cdme-compiler",
      "      - cdme-assurance",
      "      - cdme-executor"
    ].join("\n")
  });
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "next",
        handle: "auto"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(conformedProject.overlayStrategy, "full_lifecycle");
  assert.equal(conformedProject.overlayRef, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.targetGraphFunction,
    "derive_intent_surface"
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  assert(outcome.executionContract.overlayBinding.remainingGraphPressureRefs.length > 0);
  assert(outcome.executionContract.overlayBinding.remainingRequirementPressureRefs.length > 0);
  assert(outcome.executionContract.overlayBinding.remainingAssetPressureRefs.length > 0);
  assert(
    outcome.executionContract.overlayBinding.remainingGraphPressureRefs.every((ref) =>
      ref.includes("current-full-traversal")
    )
  );
});

test("T-170 explicit operator overlay selection admits strategy handles", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "thread"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
});

test("T-160 public start binds existing overlay assets as material workspace truth", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t160-material-"));
  const materialPath = path.join(
    workspaceRoot,
    "design/component_code_surface.md"
  );
  mkdirSync(path.dirname(materialPath), { recursive: true });
  writeFileSync(materialPath, "# Component Code Surface\n", "utf8");
  const { module, queryDomain, conformedProject } = startContext(workspaceRoot);
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "lite-design-module-implementation"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert(outcome.executionContract);
  const binding = outcome.executionContract.overlayBinding.assetBindings.find(
    (candidate) => candidate.assetType === "component_code_surface"
  );
  assert(binding);
  assert.equal(binding.mode, "material");
  assert.equal(
    binding.relativePath,
    "design/component_code_surface.md"
  );
  assert(binding.assetRef.endsWith("/design/component_code_surface.md"));
  assert(
    binding.evidenceRefs.includes(
      outcome.executionContract.overlayBinding.workspaceBasis.preActionWorkspaceObservationRef
    )
  );
});

test("T-160 public start carries prior admitted overlay ledger and event refs", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t160-prior-"));
  const archiveRoot = path.join(
    workspaceRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260512T000000000Z_pid160"
  );
  mkdirSync(archiveRoot, { recursive: true });
  writeFileSync(
    path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json"),
    `${JSON.stringify({
      kind: "sdlc_edge_fulfillment_ledger",
      overlayRef: SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
      ledgerRef: "ledger://odd-sdlc/t160/bootstrap",
      ledgerVersionRef: "ledger-version://odd-sdlc/t160/bootstrap/1"
    }, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json"),
    `${JSON.stringify({
      kind: "sdlc_edge_closure_decision",
      overlayRef: SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
      decisionRef: "closure-decision://odd-sdlc/t160/bootstrap",
      disposition: "close"
    }, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "runtime_events.json"),
    `${JSON.stringify({
      kind: "sdlc_runtime_event_archive_projection",
      eventCount: 1,
      eventKinds: ["vector_closed"],
      events: []
    }, null, 2)}\n`,
    "utf8"
  );
  const { module, queryDomain, conformedProject } = startContext(workspaceRoot);
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "lite-design-module-implementation"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert(outcome.executionContract);
  assert(
    outcome.executionContract.overlayBinding.priorLedgerRefs.includes(
      "ledger-version://odd-sdlc/t160/bootstrap/1"
    )
  );
  assert.equal(outcome.executionContract.overlayBinding.priorEventRefs.length, 1);
  assert(outcome.executionContract.overlayBinding.priorEventRefs[0].endsWith("/runtime_events.json"));
});

test("T-160 overlay replay keeps stable traversal identity while selecting next vector", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const baseRequest = {
    workspaceRoot,
    target: {
      kind: "overlay",
      handle: "lite-design-module-implementation"
    },
    until: "first_traversal",
    defaultRegime: "F_P"
  };
  const first = publicStartOnce({
    request: admitSdlcPublicStartRequest(baseRequest),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });
  const replay = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      ...baseRequest,
      replayNextActionProjectionRef: "next-action://odd-sdlc/t160/derive-design",
      replaySelectedActionRef: "construction-action://odd-sdlc/t160/derive-design",
      replayNextGraphVectorRef: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      replayClosureDecisionRef: "closure-decision://odd-sdlc/t160/derive-design",
      replayOverlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert(first.executionContract);
  assert(replay.executionContract);
  assert.equal(
    replay.executionContract.overlayBinding.selection.selectedGraphVectorRef,
    FG_DERIVE_LITE_DESIGN_ADR_SURFACE
  );
  assert.equal(
    replay.executionContract.overlayBindingRef,
    first.executionContract.overlayBindingRef
  );
  assert.equal(replay.executionContract.basis.id, first.executionContract.basis.id);
});

test("T-170 profile next replay keeps public-start identity while selecting next vector", () => {
  const { module, queryDomain, workspaceRoot } = startContext();
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t132_hello_world_single_tenant",
      "  overlay_strategy: thread",
      "  overlay_ref: overlay://odd-sdlc/lite-design-module-implementation",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    module_structure:",
      "      - hello_world_javascript"
    ].join("\n")
  });
  const baseRequest = {
    workspaceRoot,
    target: {
      kind: "next",
      handle: "auto"
    },
    until: "first_traversal",
    defaultRegime: "F_P"
  };
  const first = publicStartOnce({
    request: admitSdlcPublicStartRequest(baseRequest),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });
  const replay = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      ...baseRequest,
      replayNextActionProjectionRef: "next-action://odd-sdlc/t170/code",
      replaySelectedActionRef: "construction-action://odd-sdlc/t170/code",
      replayNextGraphFunctionRef: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
      replayNextGraphVectorRef: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      replayClosureDecisionRef: "closure-decision://odd-sdlc/t170/design",
      replayOverlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert(first.executionContract);
  assert(replay.executionContract);
  assert.equal(
    replay.executionContract.nextActionProjection.nextGraphFunctionRef,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
  assert.equal(
    replay.executionContract.nextActionProjection.nextGraphVectorRef,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  assert.equal(
    replay.executionContract.overlayBinding.selection.selectedGraphVectorRef,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  assert.equal(
    replay.executionContract.overlayBindingRef,
    first.executionContract.overlayBindingRef
  );
  assert.equal(replay.executionContract.basis.id, first.executionContract.basis.id);
});

test("T-160 stale overlay binding replay fails closed", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: "lite-design-module-implementation"
      },
      until: "first_traversal",
      defaultRegime: "F_P",
      replayNextActionProjectionRef: "next-action://odd-sdlc/t160/stale",
      replaySelectedActionRef: "construction-action://odd-sdlc/t160/stale",
      replayNextGraphVectorRef: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      replayClosureDecisionRef: "closure-decision://odd-sdlc/t160/stale",
      replayOverlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
      replayOverlayBindingRef: "overlay-binding://odd-sdlc/wrong"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "stale_query_domain");
  assert.equal(outcome.executionContract, null);
});

test("T-160 consequence carriers preserve overlay binding identity", () => {
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("lite"),
    ledgerRef: "ledger://odd-sdlc/t160",
    ledgerVersionRef: "ledger-version://odd-sdlc/t160/1",
    overlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
    overlayBindingRef: "overlay-binding://odd-sdlc/t160",
    graphCatalogDigestRef: "graph-catalog-digest://odd-sdlc/t160",
    edgeRef: "edge://odd-sdlc/t160/lite",
    attemptRef: "attempt://odd-sdlc/t160/lite",
    targetBindingRefs: ["target-binding://odd-sdlc/test_execution_result_surface"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t160/lite"],
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
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t160",
    ledger,
    currentEdgeLawful: true
  });
  const projection = constructSdlcNextActionProjection({
    selectedComposition: ledger.selectedComposition,
    nextActionProjectionRef: "next-action://odd-sdlc/t160",
    intentEventRefs: ["event://odd-sdlc/t160"],
    productAssetModelRef: "product-asset-model://odd-sdlc/t160",
    gapPressureRefs: ["pressure://odd-sdlc/t160"],
    targetBindingRefs: ledger.targetBindingRefs,
    closureDecision,
    observationRef: "observation://odd-sdlc/t160",
    policyRefs: ["policy://odd-sdlc/t160"],
    actionCatalogRefs: ["catalog://odd-sdlc/t160"]
  });

  assert.equal(ledger.overlayBindingRef, "overlay-binding://odd-sdlc/t160");
  assert.equal(closureDecision.overlayBindingRef, ledger.overlayBindingRef);
  assert.equal(projection.overlayBindingRef, ledger.overlayBindingRef);
  assert(projection.predecessorRefs.includes("overlay-binding://odd-sdlc/t160"));
});

test("T-160 overlay segment completion is separate from product convergence", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  for (const overlayRef of [
    SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
    SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  ]) {
    const overlay = catalog.overlays.find((candidate) => candidate.overlayRef === overlayRef);
    assert(overlay);
    const ledger = constructSdlcEdgeFulfillmentLedger({
      selectedComposition: selectedComposition(`segment/${overlay.name}`),
      ledgerRef: `ledger://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      ledgerVersionRef: `ledger-version://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}/1`,
      overlayRef: overlay.overlayRef,
      overlayBindingRef: `overlay-binding://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      graphCatalogDigestRef: overlay.graphCatalogDigestRef,
      edgeRef: `edge://odd-sdlc/t160/${encodeURIComponent(overlay.name)}`,
      attemptRef: `attempt://odd-sdlc/t160/${encodeURIComponent(overlay.name)}`,
      targetBindingRefs: [`target-binding://odd-sdlc/${overlay.termination.terminalAssetTypes[0]}`],
      evidenceBundleRefs: [`evidence://odd-sdlc/t160/${encodeURIComponent(overlay.name)}`],
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
    const closureDecision = deriveSdlcEdgeClosureDecision({
      decisionRef: `closure-decision://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      ledger,
      currentEdgeLawful: true
    });
    const segmentCompletion = constructSdlcOverlaySegmentCompletion({
      completionRef: `overlay-segment-completion://odd-sdlc/t160/${encodeURIComponent(overlay.name)}`,
      closureDecision,
      stopDisposition: "overlay_segment_complete",
      terminalAssetTypes: overlay.termination.terminalAssetTypes,
      terminalGraphFunctionRefs: overlay.termination.terminalGraphFunctionRefs,
      remainingGraphPressureRefs: overlay.termination.remainingGraphPressureRefs,
      remainingRequirementPressureRefs: overlay.termination.remainingRequirementPressureRefs,
      remainingAssetPressureRefs: overlay.termination.remainingAssetPressureRefs,
      nextEligibleOverlayRefs: overlay.termination.nextEligibleOverlayRefs
    });
    const projection = constructSdlcNextActionProjection({
      selectedComposition: ledger.selectedComposition,
      nextActionProjectionRef: `next-action://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      intentEventRefs: [`event://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`],
      productAssetModelRef: `product-asset-model://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      gapPressureRefs: [`pressure://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`],
      targetBindingRefs: ledger.targetBindingRefs,
      closureDecision,
      overlaySegmentCompletion: segmentCompletion,
      observationRef: `observation://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`,
      policyRefs: [`policy://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`],
      actionCatalogRefs: [`catalog://odd-sdlc/t160/segment/${encodeURIComponent(overlay.name)}`]
    });

    assert.equal(segmentCompletion.stopDisposition, "overlay_segment_complete");
    assert.equal(segmentCompletion.productConverged, false);
    assert.equal(projection.overlaySegmentCompletionRef, segmentCompletion.completionRef);
    assert.equal(projection.overlayStopDisposition, "overlay_segment_complete");
    assert(projection.remainingGraphPressureRefs.length > 0);
    assert(projection.nextEligibleOverlayRefs.length > 0);
  }
});

test("T-160 current full overlay can refine prior lite ledger and event truth", () => {
  const module = constructSdlcGtlModule();
  const catalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlay = catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  assert(overlay);
  const binding = constructSdlcOverlayBinding({
    catalog,
    overlay,
    workspaceRootUri: "file:///workspace/t160",
    workspaceIdentityRef: "workspace://t160",
    preActionWorkspaceObservationRef: "observation://t160/pre-current-full",
    preActionWorkspaceFingerprintRef: "fingerprint://t160/pre-current-full",
    selectedGraphFunctionRef: overlay.graphFunctionRefs[0],
    selectedStartTargetRef: "derive_intent_surface",
    requestedBy: "public_start",
    priorLedgerRefs: ["ledger://odd-sdlc/t160/lite"],
    priorEventRefs: ["event://odd-sdlc/t160/lite-vector-closed"]
  });

  assert(binding.priorLedgerRefs.includes("ledger://odd-sdlc/t160/lite"));
  assert(binding.priorEventRefs.includes("event://odd-sdlc/t160/lite-vector-closed"));
  assert(binding.predecessorRefs.includes("ledger://odd-sdlc/t160/lite"));
  assert(binding.predecessorRefs.includes("event://odd-sdlc/t160/lite-vector-closed"));
});

test("T-160 public start consumes overlay catalog rather than query-domain start target authority", () => {
  const source = readFileSync(
    new URL("../../code/src/start/public_start.ts", import.meta.url),
    "utf8"
  );
  const evaluateBody = source.slice(
    source.indexOf("function evaluateInitialPublicStartAction"),
    source.indexOf("function constructExecutionContract")
  );

  assert.match(evaluateBody, /constructSdlcTraversalOverlayCatalog/);
  assert.match(evaluateBody, /publicSdlcOverlayStartTargets/);
  assert.equal(evaluateBody.includes("input.queryDomain.startTargets"), false);
});

test("T-160 spec-method replay preserves overlay target identity", () => {
  const source = readFileSync(
    new URL("../../code/src/spec_method/entry.ts", import.meta.url),
    "utf8"
  );
  const startOutcomeBody = source.slice(
    source.indexOf("function startOutcomeFor("),
    source.indexOf("function selectedActionRequiresFreshTargetTraversal")
  );
  const replayBody = source.slice(
    source.indexOf("function startOutcomeForObservedReplay"),
    source.indexOf("function replayEventsForBasis")
  );

  assert.match(startOutcomeBody, /request\.target\.kind === "graph_function"/);
  assert.match(startOutcomeBody, /handle: replayNextAction\.nextGraphFunctionRef/);
  assert.doesNotMatch(
    startOutcomeBody,
    /request\.target\.kind === "graph_function"\s*\|\|\s*request\.target\.kind === "overlay"/
  );
  assert.match(replayBody, /input\.request\.target\.kind === "overlay"/);
  assert.match(
    replayBody,
    /overlayRef: selectedNextGraphFunction\.overlayRef/
  );
});

test("T-160 cross-graph repair reentry does not replay already-closed target basis", () => {
  const source = readFileSync(
    new URL("../../code/src/spec_method/entry.ts", import.meta.url),
    "utf8"
  );
  const operatorSource = readFileSync(
    new URL("../../code/src/operator/installed_operator.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /function selectedActionRequiresFreshTargetTraversal/);
  assert.match(source, /function startOutcomeRequiresFreshTargetTraversal/);
  assert.match(source, /decision\.disposition !== "repair"/);
  assert.match(source, /selectedActionRef\?\.includes\("\/post_repair_reentry\/"\)/);
  assert.match(source, /selectedActionRef\?\.includes\("\/post_repair\/"\)/);
  assert.match(source, /selectedActionRef\?\.includes\("\/post_close_overlay_continuation\/"\)/);
  assert.match(source, /completedGraphFunctionName/);
  assert.match(source, /startOutcomeRequiresFreshTargetTraversal\(start\)/);
  assert.match(source, /EMPTY_RUNTIME_EVENTS/);
  assert.match(operatorSource, /function postActionArchiveRefFromSelectedActionRef/);
  assert.match(operatorSource, /function decodedArchiveRefForScope/);
  assert.match(operatorSource, /function replayEventsWithoutDuplicateVectorClosures/);
  assert.match(operatorSource, /replayEventVectorClosureKey/);
  assert.match(operatorSource, /projected\.priorGapDossiers\.some/);
});
