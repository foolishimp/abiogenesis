// Validates: T-203

import test from "node:test";
import assert from "node:assert/strict";
import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  runEngineIterateAsync
} from "@abiogenesis/typescript-tenant";

import {
  admitOddSdlcSpecMethodRequest,
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  conformProjectProfileFromConstraintsText,
  constructRuntimeSteelThreadSelectionFromDependencyWindow,
  constructSdlcGtlModule,
  deriveSdlcFeatureScope,
  deriveSdlcWorkspaceIngressReport,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  sdlcTraversalObligationInFeatureScope
} from "../../build/semantic/code/src/index.js";

function runtimeSteelThreadSelection(overrides = {}) {
  return Object.freeze({
    kind: "start_runtime_traversal_strategy_selection",
    selectionRef: "selection://odd-sdlc/t203/runtime-steel-thread",
    strategyOwnerRef: "policy://odd-sdlc/runtime/steel-thread",
    strategyLabel: "steel_thread",
    enforcementPrimitives: Object.freeze([
      "bounded_batch",
      "ordered_schedule_prefix"
    ]),
    selectedScheduleItemRefs: Object.freeze([
      "requirement://data-mapper/REQ-LDM-01",
      "requirement://data-mapper/REQ-LDM-02",
      "requirement://data-mapper/REQ-TYP-06"
    ]),
    edgeRefs: Object.freeze(["derive_intent_surface"]),
    basisRefs: Object.freeze(["ticket://odd-sdlc/T-203"]),
    batch: Object.freeze({
      targetItemCount: 3,
      maxItemCount: 3
    }),
    continuation: Object.freeze({
      sameEdgeUntil: "foldback_closed",
      maxAttemptsWithoutNewSignal: 10,
      maxTotalAttempts: 64
    }),
    ...overrides
  });
}

function publicStartContext(workspaceRoot = "/workspace/t203-data-mapper") {
  const module = constructSdlcGtlModule();
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug: "t203_data_mapper",
    activeTenant: "scala_spark",
    selectedOutputRoot: "build_tenants/scala_spark",
    ambiguityRiskAppetite: "low",
    capabilityContracts: []
  });
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
      "  name: t203_data_mapper",
      "  kind: imported_workspace",
      "  overlay_strategy: full_lifecycle",
      "  overlay_ref: overlay://odd-sdlc/current-full-traversal",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark"
    ].join("\n")
  });
  return Object.freeze({ module, queryDomain, conformedProject, workspaceRoot });
}

test("T-203 CLI admits runtime steel-thread traversal selection", () => {
  const selection = runtimeSteelThreadSelection();
  const request = admitOddSdlcSpecMethodRequest([
    "start",
    "--workspace",
    ".",
    "--target",
    "graph_function:bootstrap_release_self_test",
    "--until",
    "first_traversal",
    "--runtime-traversal-selection",
    JSON.stringify(selection)
  ]);

  assert.equal(request.kind, "odd_sdlc_spec_method_request");
  assert.deepStrictEqual(
    request.runtimeTraversalSelections?.[0]?.selectedScheduleItemRefs,
    selection.selectedScheduleItemRefs
  );
});

test("T-203 CLI preserves full overlay URI targets for runtime continuation", () => {
  const request = admitOddSdlcSpecMethodRequest([
    "start",
    "--workspace",
    ".",
    "--target",
    "overlay://odd-sdlc/current-full-traversal",
    "--until",
    "first_traversal"
  ]);

  assert.equal(request.target.kind, "overlay");
  assert.equal(request.target.handle, "overlay://odd-sdlc/current-full-traversal");
});

test("T-203 runtime steel-thread dependency window closes over prerequisite requirements", () => {
  const moduleDependencyMap = Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t203/modules",
    summaryRef: "decomposition-summary://odd-sdlc/t203/modules",
    nodes: Object.freeze([
      Object.freeze({
        nodeId: "module://foundation",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://payments"]),
        ownedRequirementRefs: Object.freeze(["REQ-01"]),
        materializationTargetRefs: Object.freeze(["src/foundation.ts"])
      }),
      Object.freeze({
        nodeId: "module://payments",
        predecessorNodeIds: Object.freeze(["module://foundation"]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-04"]),
        materializationTargetRefs: Object.freeze(["src/payments.ts"])
      }),
      Object.freeze({
        nodeId: "module://admin",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-99"]),
        materializationTargetRefs: Object.freeze(["src/admin.ts"])
      })
    ]),
    steelThreadCandidateNodeIds: Object.freeze(["module://foundation"]),
    parallelPartitionRefs: Object.freeze([
      "partition://module/foundation",
      "partition://module/payments",
      "partition://module/admin"
    ]),
    cycleRefs: Object.freeze([])
  });

  const selection = constructRuntimeSteelThreadSelectionFromDependencyWindow({
    selectionRef: "selection://odd-sdlc/t203/req-04-steel-thread",
    dependencyMaps: [moduleDependencyMap],
    startingRequirementRefs: ["requirement://demo/REQ-04"],
    requirementRefNamespace: "demo",
    edgeRefs: ["derive_component_code_surface"],
    basisRefs: ["ticket://odd-sdlc/T-203"]
  });

  assert.equal(selection.strategyLabel, "steel_thread");
  assert.deepStrictEqual(selection.selectedScheduleItemRefs, [
    "module://foundation",
    "module://payments",
    "requirement://demo/REQ-01",
    "requirement://demo/REQ-04"
  ]);
  assert.deepStrictEqual(selection.requiredProgressArtifactRefs, [
    "src/foundation.ts",
    "src/payments.ts"
  ]);
  assert.equal(
    selection.selectedScheduleItemRefs.includes("requirement://demo/REQ-99"),
    false
  );
  assert.equal(selection.batch?.targetItemCount, 4);
  assert.equal(selection.continuation?.maxAttemptsWithoutNewSignal, 10);
});

function requirementObligation(obligationId, summary) {
  return Object.freeze({
    obligationId,
    obligationKind: "requirement",
    summary,
    evidenceRefs: Object.freeze([
      "file:///workspace/specification/requirements/requirements.md"
    ]),
    payload: Object.freeze({
      status: "concrete",
      sourceRefs: Object.freeze([
        "file:///workspace/specification/requirements/requirements.md"
      ]),
      sourceSnippets: Object.freeze([summary]),
      coverageExpectation: summary
    })
  });
}

test("T-203 steel-thread feature scope matches selected requirements exactly", () => {
  const scope = deriveSdlcFeatureScope({
    targetAssetType: "component_code_surface",
    selectedStrategy: "steel_thread",
    strategyDirectiveRef:
      "selection://odd-sdlc/data-mapper/runtime-steel-thread",
    selectedScheduleItemRefs: Object.freeze([
      "requirement://data-mapper/REQ-LDM-01",
      "requirement://data-mapper/REQ-LDM-02",
      "requirement://data-mapper/REQ-LDM-03",
      "requirement://data-mapper/REQ-TYP-06"
    ]),
    requiredProgressArtifactRefs: Object.freeze([]),
    declaredModuleNames: Object.freeze([
      "cdme-compiler",
      "cdme-executor"
    ]),
    materializedEntityIds: Object.freeze([]),
    materializedOperationIds: Object.freeze([])
  });

  assert.equal(scope.mode, "steel_thread");
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: requirementObligation(
        "requirement:data_mapper.requirements.req_ldm_001",
        "Fulfill REQ-LDM-001: Graph topology foundation."
      )
    }),
    true
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: requirementObligation(
        "requirement:data_mapper.requirements.req_typ_006",
        "Fulfill REQ-TYP-006: Typed external morphism registration."
      )
    }),
    true
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: requirementObligation(
        "requirement:data_mapper.requirements.req_int_001",
        "Fulfill REQ-INT-001: Traces To: INT-001, REQ-TYP-02, REQ-INT-01."
      )
    }),
    false
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: requirementObligation(
        "requirement:data_mapper.requirements.req_pdm_002",
        "Fulfill REQ-PDM-002: Physical model binding for topology mappings."
      )
    }),
    false
  );
});

test("T-203 runtime steel-thread start reaches ABG envelope and SDLC feature scope", async () => {
  const { module, queryDomain, conformedProject, workspaceRoot } =
    publicStartContext();
  const selection = runtimeSteelThreadSelection();
  const start = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "graph_function",
        handle: "bootstrap_release_self_test"
      },
      until: "first_traversal",
      defaultRegime: "F_P",
      runtimeTraversalSelections: [selection]
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert(start.executionContract);
  assert.deepStrictEqual(
    start.executionContract.basis.startIntent.runtimeTraversalSelections?.[0]
      ?.selectedScheduleItemRefs,
    selection.selectedScheduleItemRefs
  );

  const pluginInputs = [];
  await runEngineIterateAsync({
    basis: start.executionContract.basis,
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://odd-sdlc/t203/runtime-steel-thread/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch: async (input) => {
          pluginInputs.push(input);
          return constructFpDispatchOutcome({
            status: "blocked",
            resultRef: "result://odd-sdlc/t203/runtime-steel-thread",
            reason: "test captures runtime start envelope"
          });
        }
      })
    },
    maxAttachedFpAttempts: 1,
    eventSink: () => undefined
  });

  assert.equal(pluginInputs.length, 1);
  const envelope = pluginInputs[0].traversalAttemptEnvelope;
  assert(envelope);
  assert.equal(envelope.strategySelectionSource, "runtime_start");
  assert.equal(envelope.strategyDirectiveRef, selection.selectionRef);
  assert.deepStrictEqual(
    envelope.selectedScheduleItemRefs,
    selection.selectedScheduleItemRefs
  );

  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: envelope.edge,
    vectorIndex: envelope.vectorIndex,
    contract: hookContractByEdgeName(envelope.edge),
    traversalAttemptEnvelope: envelope,
    conformedProject: {
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      declaredModuleNames: Object.freeze(["cdme-compiler", "cdme-accounting"]),
      buildExecutionContract: "sbt package",
      testExecutionContract: "sbt test"
    },
    runId: "t203-runtime-steel-thread"
  });

  assert.equal(manifest.traversalStrategyDecision.selectedStrategy, "steel_thread");
  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.deepStrictEqual(
    manifest.featureScope.includedRequirementRefs,
    selection.selectedScheduleItemRefs
  );
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, []);
});
