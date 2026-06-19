// Validates: T-123

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructAgenticBackendProgressProfile,
  deriveTraversalModulationProfileFromGtl,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN,
  ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN,
  SDLC_ABG_ATTACHED_FP_MAX_RETRY_ATTEMPTS,
  constructSdlcGtlModule,
  constructSdlcHookContractCatalog,
  deriveSdlcTraversalStrategyDecision,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  promptForHandoff
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t123-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nBuild a typed data mapper.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    "# Product\n\nData mapper fixture.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    "# Goals\n\n- prove per-edge strategy selection\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    "# Imported Sources\n\n- fixture://t123\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-t123.md"),
    "REQ-T123-001: Preserve broad induction before scoped construction.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    "# Bootstrap\n\nproject_slug: t123_fixture\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t123_fixture",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark"
    ].join("\n"),
    "utf8"
  );
  return root;
}

const conformedProject = Object.freeze({
  activeTenant: "scala_spark",
  selectedOutputRoot: "build_tenants/scala_spark",
  declaredModuleNames: Object.freeze(["cdme-compiler", "cdme-accounting"]),
  buildExecutionContract: "sbt package",
  testExecutionContract: "sbt test"
});

test("T-123 default steel-thread scope refs are product-neutral", () => {
  const refs =
    ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN.edgeScopeRefs?.[
      FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
    ] ?? [];

  assert.deepStrictEqual(refs, [
    `schedule://odd_sdlc/${FG_DERIVE_LITE_COMPONENT_CODE_SURFACE}/primary`
  ]);
  assert.equal(
    Object.values(ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN.edgeScopeRefs ?? {})
      .flat()
      .some((ref) => ref.includes("cdme-compiler")),
    false
  );
});

function retryContext() {
  return {
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: [],
    priorGapDossiers: [
      {
        kind: "sdlc_postflight_gap_dossier",
        dossierVersion: "ts-gap-dossier-v1",
        graphFunctionName: "bootstrap_release_self_test",
        edgeName: "derive_test_execution_result_surface",
        vectorIndex: 17,
        targetAssetType: "test_execution_result_surface",
        status: "open",
        reasons: [
          {
            kind: "sdlc_postflight_gap_reason",
            reason: "test execution failed for cdme-compiler",
            reasonClass: "code_to_test",
            blockingReason: {
              kind: "sdlc_blocking_reason",
              code: "test_execution_not_succeeded",
              reasonClass: "code_to_test",
              lawfulReentryPoint: "repair_worker_output",
              message: "Test execution did not succeed.",
              detail: "module=cdme-compiler",
              evidenceRefs: []
            }
          }
        ],
        evidenceRefs: [],
        priorManifestId: "manifest://t123/prior",
        currentGapDossierRef: "gap://t123/prior",
        retryEligible: true,
        nextLawfulActions: ["repair_worker_output"]
      }
    ]
  };
}

function consequenceRetryContextFor(sourceProjectionRef) {
  return {
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: [
      {
        vectorIndex: 0,
        retryRunId: `retry-run://t123/${encodeURIComponent(sourceProjectionRef)}`,
        retryCallId: `retry-call://t123/${encodeURIComponent(sourceProjectionRef)}`,
        manifestId: "file:///tmp/t123/handoff_manifest.json",
        priorAuthorityRef: "closure-decision://t123/prior-close",
        attemptIndex: 1,
        sourceProjectionRef
      }
    ],
    priorGapDossiers: []
  };
}

function retryContextForAccountingPlaceholderWithCompilerEvidence() {
  return {
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: [
      {
        vectorIndex: 0,
        retryRunId: "retry-run://t123/cdme-accounting",
        retryCallId: "retry-call://t123/cdme-accounting",
        manifestId: "file:///tmp/t123/accounting/handoff_manifest.json",
        priorAuthorityRef: "file:///tmp/t123/accounting/gap_dossier.json",
        attemptIndex: 1,
        sourceProjectionRef:
          "construction-priority-projection://odd-sdlc/post-action/module/cdme-accounting/Fg_materialize_declared_product_asset"
      }
    ],
    priorGapDossiers: [
      {
        kind: "sdlc_postflight_gap_dossier",
        dossierVersion: "ts-gap-dossier-v1",
        graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
        edgeName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
        vectorIndex: 0,
        targetAssetType: "component_code_surface",
        status: "open",
        reasons: [
          {
            kind: "sdlc_postflight_gap_reason",
            reason:
              "placeholder_surface:file:///tmp/t123/build_tenants/scala_spark/cdme-accounting/src/main/scala/cdme/accounting/AccountingLedger.scala",
            reasonClass: "assurance",
            blockingReason: {
              kind: "sdlc_blocking_reason",
              code: "accounting_ledger_reason",
              reasonClass: "assurance",
              lawfulReentryPoint: "same_edge_retry",
              message: "Accounting file contains placeholder implementation text.",
              detail:
                "placeholder_surface:file:///tmp/t123/build_tenants/scala_spark/cdme-accounting/src/main/scala/cdme/accounting/AccountingLedger.scala",
              evidenceRefs: [
                "file:///tmp/t123/build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/TopologicalCompiler.scala"
              ]
            }
          }
        ],
        evidenceRefs: [
          "file:///tmp/t123/build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/TopologicalCompiler.scala",
          "file:///tmp/t123/build_tenants/scala_spark/cdme-accounting/src/main/scala/cdme/accounting/AccountingLedger.scala"
        ],
        priorManifestId: "file:///tmp/t123/accounting/handoff_manifest.json",
        currentGapDossierRef: "file:///tmp/t123/accounting/gap_dossier.json",
        retryEligible: true,
        nextLawfulActions: ["retry_same_edge"]
      }
    ]
  };
}

function frameworkSmokeSingleHopSelection() {
  return {
    kind: "sdlc_traversal_hop_selection",
    selectionRef: "selection://odd-sdlc/t123/framework-smoke-single-hop",
    outcomeClass: "framework_smoke",
    hopClass: "single_hop",
    selectedGraphVariantRef:
      "graph-variant://odd-sdlc/framework_smoke/single_hop/outcome_class_graph_variant",
    complexityAssessment: {
      kind: "sdlc_traversal_complexity_assessment",
      assessmentRef: "assessment://odd-sdlc/t123/framework-smoke-single-hop",
      outcomeClass: "framework_smoke",
      thresholdProfileRef: "threshold://odd-sdlc/t123/framework-smoke",
      decompositionSummaryRef: "summary://odd-sdlc/t123/framework-smoke",
      inputObligationCount: 1,
      outputRowCount: 1,
      upstreamPerDownstreamRatio: 1,
      downstreamPerUpstreamRatio: 1,
      maxOwnedInputsPerOutput: 1,
      residualRefCount: 0,
      residualOutsideSubsurfaceRefCount: 0,
      publicBoundaryCount: 1,
      substantiveDownstreamResponsibilityCount: 1,
      blockingReasons: [],
      evidenceRefs: ["evidence://odd-sdlc/t123/framework-smoke"]
    },
    zoomAdmission: {
      kind: "sdlc_zoom_admission_decision",
      disposition: "admitted",
      reasonRefs: ["reason://odd-sdlc/t123/framework-smoke"],
      selectedZoomStageRef: null
    },
    pressurePreservation: {
      kind: "sdlc_min_fp_pressure_preservation_decision",
      mechanism: "outcome_class_graph_variant",
      preservedPressureRefs: ["pressure://odd-sdlc/t123/framework-smoke"],
      skippedEdgeRefs: [],
      evidenceRefs: ["evidence://odd-sdlc/t123/framework-smoke"],
      admissionDecision: "admitted",
      blockingReasons: []
    },
    rejectedAlternativeRefs: [],
    blockingReasons: [],
    evidenceRefs: ["evidence://odd-sdlc/t123/framework-smoke"]
  };
}

function manifestFor(
  edgeName,
  traversalAttemptEnvelope = null,
  retry = null,
  graphFunctionName = "graph_function:bootstrap_release_self_test",
  traversalHopSelection = null
) {
  const contract = hookContractByEdgeName(edgeName);
  return deriveWorkerHandoffManifest({
    workspaceRoot: makeWorkspace(),
    graphFunctionName,
    edgeName,
    vectorIndex: 0,
    contract,
    traversalAttemptEnvelope,
    traversalHopSelection,
    ...(retry === null ? {} : { retryContext: retry }),
    conformedProject,
    runId: `t123-${edgeName}`
  });
}

function traversalStrategyRefForVector(vector) {
  return traversalStrategyHookForVector(vector).ref;
}

function traversalStrategyHookForVector(vector) {
  const declaration = vector.declarations.entries.find(
    (entry) => entry.key === "abg.traversal_strategy"
  );
  assert(declaration, `${vector.name}: missing traversal strategy declaration`);
  assert.equal(declaration.value.kind, "hook_ref");
  return declaration.value.value;
}

function hookConfigValue(hook, key) {
  const entry = hook.config.entries.find((candidate) => candidate.key === key);
  return entry?.value;
}

function basisFor(module, handle) {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/odd-sdlc-t123",
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
      workerId: "worker://odd-sdlc/t123",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/t123",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t123",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t123",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t123",
    workKey: "wk://odd-sdlc/t123",
    frameId: null,
    frameLineageId: null
  });
}

test("T-123 fallback plan derives one strategy decision for every catalog edge", () => {
  for (const contract of constructSdlcHookContractCatalog()) {
    const decision = deriveSdlcTraversalStrategyDecision({
      edgeName: contract.edgeName,
      targetAssetType: contract.targetAssetType
    });
    assert.equal(decision.kind, "sdlc_traversal_strategy_decision");
    assert.equal(decision.decisionSource, "odd_sdlc_fallback_plan");
    assert(decision.strategyPlanRef.startsWith("strategy-plan://odd_sdlc/"));
  }
});

test("T-123 graph vectors and operator handoff consume one shared strategy plan", () => {
  const packageRoot = process.cwd();
  const graphModule = readFileSync(
    path.join(packageRoot, "code/src/graph/module.ts"),
    "utf8"
  );
  const sharedPlan = readFileSync(
    path.join(packageRoot, "code/src/shared/traversal_strategy_plan.ts"),
    "utf8"
  );

  assert(!graphModule.includes("FULL_BREADTH_TRAVERSAL_NAMES"));
  assert.match(graphModule, /defaultSdlcTraversalStrategyForName/u);
  assert.match(sharedPlan, /ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN/u);
});

test("T-123 steel-thread-after-requirements is a GTL strategy profile", () => {
  const module = constructSdlcGtlModule({
    traversalStrategyPlan:
      ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN
  });
  const bootstrap = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === "bootstrap_release_self_test"
  );
  assert(bootstrap);
  const graph = materializeGraphFunction(bootstrap);
  const strategyByVector = new Map(
    graph.vectors.map((vector) => [
      vector.name,
      traversalStrategyRefForVector(vector)
    ])
  );

  for (const edgeName of [
    "derive_intent_surface",
    "derive_product_surface",
    "derive_goal_surface",
    "derive_requirement_surface"
  ]) {
    assert.equal(
      strategyByVector.get(edgeName),
      `strategy://odd_sdlc/${edgeName}/full_breadth`
    );
  }
  for (const edgeName of [
    "derive_feature_decomp_surface",
    "derive_design_surface",
    "derive_implementation_design_surface",
    "derive_component_code_surface"
  ]) {
    assert.equal(
      strategyByVector.get(edgeName),
      `strategy://odd_sdlc/${edgeName}/steel_thread`
    );
  }

  const materializer = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert(materializer);
  const materializerVector = materializeGraphFunction(materializer).vectors[0];
  assert(materializerVector);
  assert.equal(
    traversalStrategyRefForVector(materializerVector),
    `strategy://odd_sdlc/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}/steel_thread`
  );

  const requirementDecision = deriveSdlcTraversalStrategyDecision({
    edgeName: "derive_requirement_surface",
    targetAssetType: "requirement_surface",
    fallbackPlan:
      ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN
  });
  assert.equal(requirementDecision.selectedStrategy, "full_breadth");

  const designDecision = deriveSdlcTraversalStrategyDecision({
    edgeName: "derive_design_surface",
    targetAssetType: "design_surface",
    fallbackPlan:
      ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN
  });
  assert.equal(designDecision.selectedStrategy, "steel_thread");
});

test("T-123 code-builder edges declare ABG ten-attempt retry/yield tuning", () => {
  const module = constructSdlcGtlModule();
  const liteCodeFunction = module.graphFunctions.find(
    (graphFunction) =>
      graphFunction.name === FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  assert(liteCodeFunction);
  const liteCodeVector = materializeGraphFunction(liteCodeFunction).vectors[0];
  assert(liteCodeVector);
  const liteCodeHook = traversalStrategyHookForVector(liteCodeVector);
  assert.equal(
    liteCodeHook.ref,
    `strategy://odd_sdlc/${FG_DERIVE_LITE_COMPONENT_CODE_SURFACE}/steel_thread`
  );
  assert.deepStrictEqual(hookConfigValue(liteCodeHook, "same_edge_until"), {
    kind: "scalar",
    value: "foldback_closed"
  });
  assert.deepStrictEqual(
    hookConfigValue(liteCodeHook, "max_attempts_without_new_signal"),
    {
      kind: "scalar",
      value: 10
    }
  );
  assert.deepStrictEqual(hookConfigValue(liteCodeHook, "max_total_attempts"), {
    kind: "scalar",
    value: 64
  });

  const materializer = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert(materializer);
  const materializerVector = materializeGraphFunction(materializer).vectors[0];
  assert(materializerVector);
  const materializerHook = traversalStrategyHookForVector(materializerVector);
  assert.equal(
    materializerHook.ref,
    `strategy://odd_sdlc/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}/full_breadth`
  );
  assert.deepStrictEqual(hookConfigValue(materializerHook, "max_total_attempts"), {
    kind: "scalar",
    value: 64
  });

  const profile = deriveTraversalModulationProfileFromGtl({
    basis: basisFor(module, FG_DERIVE_LITE_COMPONENT_CODE_SURFACE),
    vector: liteCodeVector,
    graphFunction: liteCodeFunction,
    vectorIndex: 0,
    backendProfile: constructAgenticBackendProgressProfile({
      backendKind: "generic_process",
      profileRef: "backend-profile://odd-sdlc/t123/deep-code",
      finalOutputMayBeBuffered: false,
      progressSignalRequiredBeforeInactivityMs: 1000
    })
  });
  assert.equal(profile.continuation.sameEdgeUntil, "foldback_closed");
  assert.equal(profile.continuation.maxAttemptsWithoutNewSignal, 10);
  assert.equal(profile.continuation.maxTotalAttempts, 64);

  const testRunFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === "derive_test_execution_result_surface"
  );
  assert(testRunFunction);
  const testRunVector = materializeGraphFunction(testRunFunction).vectors[0];
  assert(testRunVector);
  const testRunHook = traversalStrategyHookForVector(testRunVector);
  assert.deepStrictEqual(
    hookConfigValue(testRunHook, "max_attempts_without_new_signal"),
    {
      kind: "scalar",
      value: 10
    }
  );
  assert.equal(SDLC_ABG_ATTACHED_FP_MAX_RETRY_ATTEMPTS, 10);
});

test("T-123 proportionality selection narrows lite code prompts before breadth defaults", () => {
  const traversalHopSelection = frameworkSmokeSingleHopSelection();
  const decision = deriveSdlcTraversalStrategyDecision({
    edgeName: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    targetAssetType: "component_code_surface",
    strategyDirectiveRef:
      `strategy://odd_sdlc/${FG_DERIVE_LITE_COMPONENT_CODE_SURFACE}/full_breadth`,
    traversalHopSelection
  });

  assert.equal(decision.decisionSource, "proportionality_selection");
  assert.equal(decision.selectedStrategy, "steel_thread");
  assert(decision.basisRefs.includes(traversalHopSelection.selectionRef));
  assert(decision.basisRefs.includes(traversalHopSelection.selectedGraphVariantRef));

  const manifest = manifestFor(
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t123-framework-smoke",
      profileRef: "abg://profile/t123-framework-smoke",
      basisId: "basis:t123-framework-smoke",
      graphFunctionId: "graph:t123-framework-smoke",
      graphCallId: "call:t123-framework-smoke",
      frameId: "frame:t123-framework-smoke",
      vectorIndex: 0,
      edge: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      strategyDirectiveRef:
        `strategy://odd_sdlc/${FG_DERIVE_LITE_COMPONENT_CODE_SURFACE}/full_breadth`,
      backendProfileRef: "backend:t123-framework-smoke",
      actorInvocationId: "actor:t123-framework-smoke",
      selectedScheduleItemRefs: [
        `schedule://odd_sdlc/${FG_DERIVE_LITE_COMPONENT_CODE_SURFACE}/cdme-compiler`
      ],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    null,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    traversalHopSelection
  );

  assert.equal(
    manifest.traversalStrategyDecision.decisionSource,
    "proportionality_selection"
  );
  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "steel_thread");
  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.equal(manifest.proportionalityProfile.profileClass, "degenerate");
  assert.equal(manifest.proportionalityProfile.maxComponents, 1);
});

test("T-123 component-code prompt uses UAT build-test loops as depth pressure", () => {
  const manifest = manifestFor(
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    null,
    null,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  const prompt = promptForHandoff(manifest);

  assert.match(
    prompt,
    /SDLC code-depth rule: admitted UAT\/scenario authority plus build\/test execution is the primary repair signal/u
  );
  assert.match(
    prompt,
    /force depth by iterating between the smallest admitted UAT\/scenario probe, the declared build\/test command or execution shard, and source repair/u
  );
  assert.match(
    prompt,
    /Do not report a requirement as behavior-fulfilled merely because it is mapped to a component_depth_register row/u
  );
  assert.match(
    prompt,
    /do not publish release, component-test, or test-execution carriers from this edge; use admitted UAT\/scenario and build\/test contracts only as repair probes/u
  );
});

test("T-123 steel-thread profile does not widen deep-code continuation budget", () => {
  const module = constructSdlcGtlModule({
    traversalStrategyPlan:
      ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN
  });
  const bootstrap = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === "bootstrap_release_self_test"
  );
  assert(bootstrap);
  const graph = materializeGraphFunction(bootstrap);
  const componentCodeVector = graph.vectors.find(
    (vector) => vector.name === "derive_component_code_surface"
  );
  assert(componentCodeVector);
  const componentCodeHook = traversalStrategyHookForVector(componentCodeVector);

  assert.equal(
    componentCodeHook.ref,
    "strategy://odd_sdlc/derive_component_code_surface/steel_thread"
  );
  assert.equal(
    hookConfigValue(componentCodeHook, "max_total_attempts"),
    undefined
  );
});

test("T-123 induction and requirement edges remain full-breadth", () => {
  for (const edgeName of [
    "derive_intent_surface",
    "derive_product_surface",
    "derive_goal_surface",
    "derive_requirement_surface"
  ]) {
    const manifest = manifestFor(edgeName);
    assert.equal(
      manifest.traversalStrategyDecision.selectedStrategy,
      "full_breadth"
    );
    assert.equal(manifest.traversalStrategyDecision.featureScopeRequired, false);
    assert.equal(manifest.traversalStrategyDecision.featureScopeDerived, false);
    assert.equal(manifest.featureScope.mode, "full_breadth");
    assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, []);
    assert(
      promptForHandoff(manifest).includes(
        "do not narrow induction, product, goal, or requirement pressure"
      )
    );
  }
});

test("T-123 unqualified post-induction construction edges default to full wave", () => {
  const manifest = manifestFor("derive_implementation_design_surface");
  assert.equal(
    manifest.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );
  assert.equal(manifest.traversalStrategyDecision.featureScopeRequired, false);
  assert.equal(manifest.traversalStrategyDecision.featureScopeDerived, false);
  assert.equal(manifest.featureScope.mode, "full_breadth");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-compiler",
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, []);
  assert.equal(
    manifest.traversalIntentPackage.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );
});

test("T-123 unqualified declared product materialization uses full-wave scope", () => {
  const manifest = manifestFor(
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    null,
    null,
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );

  assert.equal(
    manifest.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );
  assert.equal(manifest.traversalStrategyDecision.featureScopeRequired, false);
  assert.equal(manifest.traversalStrategyDecision.featureScopeDerived, false);
  assert.equal(manifest.featureScope.mode, "full_breadth");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-compiler",
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, []);
  assert.doesNotMatch(
    promptForHandoff(manifest),
    /Steel thread \/ targeted repair: close only included scope/u
  );
});

test("T-123 targeted repair is distinct from steel-thread strategy", () => {
  const manifest = manifestFor("derive_code_surface");
  assert.equal(
    manifest.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );
  assert.equal(manifest.featureScope.mode, "full_breadth");
  assert.equal(
    manifest.traversalIntentPackage.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );

  const executionManifest = manifestFor("derive_test_execution_result_surface");
  assert.equal(
    executionManifest.traversalStrategyDecision.selectedStrategy,
    "full_breadth"
  );
  assert.equal(executionManifest.featureScope.mode, "full_breadth");
  assert.deepStrictEqual(
    executionManifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    ["cdme-compiler", "cdme-accounting"]
  );

  const retryManifest = manifestFor(
    "derive_test_execution_result_surface",
    null,
    retryContext()
  );
  assert.equal(
    retryManifest.traversalStrategyDecision.selectedStrategy,
    "targeted_repair"
  );
  assert.equal(retryManifest.featureScope.mode, "targeted_repair");
  assert.deepStrictEqual(retryManifest.featureScope.includedModuleNames, [
    "cdme-compiler"
  ]);
  assert.deepStrictEqual(retryManifest.featureScope.deferredModuleNames, [
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(
    retryManifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    retryManifest.featureScope.includedModuleNames
  );

  const archiveRetryManifest = manifestFor(
    "derive_test_run_archive_surface",
    null,
    retryContext()
  );
  assert.equal(
    archiveRetryManifest.traversalStrategyDecision.selectedStrategy,
    "targeted_repair"
  );
  assert.equal(archiveRetryManifest.featureScope.mode, "targeted_repair");
  assert.deepStrictEqual(
    archiveRetryManifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    archiveRetryManifest.featureScope.includedModuleNames
  );
});

test("T-123 ABG-selected strategy overrides the fallback plan", () => {
  const manifest = manifestFor("derive_requirement_surface", {
    kind: "traversal_attempt_envelope",
    envelopeRef: "abg://envelope/t123",
    profileRef: "abg://profile/t123",
    basisId: "basis:t123",
    graphFunctionId: "graph:t123",
    graphCallId: "call:t123",
    frameId: "frame:t123",
    vectorIndex: 0,
    edge: "derive_requirement_surface",
    strategyDirectiveRef:
      "strategy://abg/selected/single_vertical_slice",
    backendProfileRef: "backend:t123",
    actorInvocationId: "actor:t123",
    selectedScheduleItemRefs: ["schedule://cdme-compiler/requirements"],
    orderingConstraintRefs: [],
    phaseGateRefs: [],
    requiredProgressArtifactRefs: [],
    gapPressureRefs: [],
    affectRefs: [],
    retryBudgetRemaining: 1,
    mustExitAfterBoundedAttempt: true
  });
  assert.equal(manifest.traversalStrategyDecision.decisionSource, "abg_selected");
  assert.equal(
    manifest.traversalStrategyDecision.selectedStrategy,
    "steel_thread"
  );
  assert.equal(manifest.featureScope.mode, "steel_thread");
});

test("T-123 consequence reentry scope advances steel thread beyond static first slice", () => {
  const manifest = manifestFor(
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t123-materialize",
      profileRef: "abg://profile/t123-materialize",
      basisId: "basis:t123-materialize",
      graphFunctionId: "graph:t123-materialize",
      graphCallId: "call:t123-materialize",
      frameId: "frame:t123-materialize",
      vectorIndex: 0,
      edge: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      strategyDirectiveRef:
        "strategy://abg/selected/single_vertical_slice",
      backendProfileRef: "backend:t123-materialize",
      actorInvocationId: "actor:t123-materialize",
      selectedScheduleItemRefs: [
        `schedule://odd_sdlc/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}/cdme-compiler`
      ],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    consequenceRetryContextFor(
      `construction-priority-projection://odd-sdlc/post-action/module/cdme-accounting/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
    ),
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );

  assert.equal(manifest.traversalStrategyDecision.decisionSource, "abg_selected");
  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "steel_thread");
  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, [
    "cdme-compiler"
  ]);
  assert(
    manifest.traversalStrategyDecision.basisRefs.some((ref) =>
      ref.includes("cdme-accounting")
    )
  );
});

test("T-123 unscoped post-action lineage does not broaden first materialization slice", () => {
  const manifest = manifestFor(
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t123-materialize-general",
      profileRef: "abg://profile/t123-materialize-general",
      basisId: "basis:t123-materialize-general",
      graphFunctionId: "graph:t123-materialize-general",
      graphCallId: "call:t123-materialize-general",
      frameId: "frame:t123-materialize-general",
      vectorIndex: 0,
      edge: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      strategyDirectiveRef:
        "strategy://abg/selected/single_vertical_slice",
      backendProfileRef: "backend:t123-materialize-general",
      actorInvocationId: "actor:t123-materialize-general",
      selectedScheduleItemRefs: [
        `schedule://odd_sdlc/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}/cdme-compiler`
      ],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    consequenceRetryContextFor(
      `construction-priority-projection://odd-sdlc/post-action/general/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
    ),
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );

  assert.equal(manifest.traversalStrategyDecision.decisionSource, "abg_selected");
  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "steel_thread");
  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-compiler"
  ]);
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, [
    "cdme-accounting"
  ]);
});

test("T-123 same-edge retry scope does not widen from evidence refs", () => {
  const manifest = manifestFor(
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t123-materialize-retry-accounting",
      profileRef: "abg://profile/t123-materialize-retry-accounting",
      basisId: "basis:t123-materialize-retry-accounting",
      graphFunctionId: "graph:t123-materialize-retry-accounting",
      graphCallId: "call:t123-materialize-retry-accounting",
      frameId: "frame:t123-materialize-retry-accounting",
      vectorIndex: 0,
      edge: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      strategyDirectiveRef: "strategy://odd_sdlc/Fg_materialize_declared_product_asset/steel_thread",
      backendProfileRef: "backend:t123-materialize-retry-accounting",
      actorInvocationId: "actor:t123-materialize-retry-accounting",
      selectedScheduleItemRefs: [
        `schedule://odd_sdlc/${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}/cdme-accounting`
      ],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    retryContextForAccountingPlaceholderWithCompilerEvidence(),
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );

  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "steel_thread");
  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(manifest.featureScope.deferredModuleNames, [
    "cdme-compiler"
  ]);
  assert(
    manifest.retryContext.priorGapDossiers[0].evidenceRefs.some((ref) =>
      ref.includes("cdme-compiler")
    )
  );
  const prompt = promptForHandoff(manifest);
  assert.match(prompt, /This is a retry\/re-entry attempt/u);
  assert.match(prompt, /Evaluated residual pressure: same_edge_retry/u);
  assert.match(prompt, /Accounting file contains placeholder implementation text/u);
});

test("T-123 retry backoff narrows ABG-selected full breadth before ticket triage", () => {
  const manifest = manifestFor(
    "derive_test_execution_result_surface",
    {
      kind: "traversal_attempt_envelope",
      envelopeRef: "abg://envelope/t123-full",
      profileRef: "abg://profile/t123-full",
      basisId: "basis:t123-full",
      graphFunctionId: "graph:t123-full",
      graphCallId: "call:t123-full",
      frameId: "frame:t123-full",
      vectorIndex: 0,
      edge: "derive_test_execution_result_surface",
      strategyDirectiveRef:
        "strategy://abg/selected/full_breadth",
      backendProfileRef: "backend:t123-full",
      actorInvocationId: "actor:t123-full",
      selectedScheduleItemRefs: ["schedule://cdme-compiler/test-execution"],
      orderingConstraintRefs: [],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      gapPressureRefs: [],
      affectRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    },
    retryContext()
  );
  assert.equal(manifest.traversalStrategyDecision.decisionSource, "retry_backoff");
  assert.equal(
    manifest.traversalStrategyDecision.selectedStrategy,
    "targeted_repair"
  );
  assert.equal(manifest.featureScope.mode, "targeted_repair");
  assert.deepStrictEqual(
    manifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    ["cdme-compiler"]
  );
});
