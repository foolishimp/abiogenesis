// Validates: T-165

import test from "node:test";
import assert from "node:assert/strict";

import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  compose,
  constructConsequenceProjectionOutcome,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  edge,
  graphFunctionForVector,
  runEngineIterate
} from "@abiogenesis/typescript-tenant";

import {
  assertSdlcTraversalConsequenceReplayable,
  constructSdlcConsequenceTraversalActionBinding,
  constructSdlcConstructionIntent,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcNextActionProjection,
  constructSdlcWorksiteEvidence,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcTraversalStrategyDecision
} from "../../build/semantic/code/src/index.js";

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze([...value])
    })
  });
}

function jsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.map(jsonValue))
    });
  }
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(value).map(([key, entryValue]) =>
        Object.freeze({ key, value: jsonValue(entryValue) })
      )
    )
  });
}

function jsonEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "json_blob", value: jsonValue(value) })
  });
}

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function compositionDeclarations() {
  const regimeBindings = Object.freeze([
    {
      bindingRef: "regime-binding://t165/transform/fd",
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ComposedStageTaskOutcome"],
      evidenceRefs: ["evidence://t165/fd-transform"]
    },
    {
      bindingRef: "regime-binding://t165/evaluate/fd",
      stageRole: "evaluate",
      regime: "F_D",
      role: "validate",
      order: 1,
      authority: "closure",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FdEvaluationOutcome"],
      evidenceRefs: ["evidence://t165/fd-evaluate"]
    },
    {
      bindingRef: "regime-binding://t165/consequence/fd",
      stageRole: "consequence",
      regime: "F_D",
      role: "observe",
      order: 2,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ConsequenceProjectionOutcome"],
      evidenceRefs: ["evidence://t165/consequence"]
    }
  ]);
  return attrs([
    {
      key: ABG_FN_COMPOSITION_DECLARATION_KEY,
      value: Object.freeze({
        kind: "hook_ref",
        value: Object.freeze({
          ref: "hook://t165/abg-fn-composition",
          config: attrs([
            scalarEntry("contract_ref", "abg.fn_composition://t165/default"),
            stringListEntry("standards_context_refs", ["standard://t165"]),
            stringListEntry("policy_context_refs", ["policy://t165"]),
            stringListEntry("carrier_context_refs", ["carrier://t165"]),
            stringListEntry("assurance_context_refs", ["assurance://t165"]),
            scalarEntry("closure_contract_ref", "closure://t165/fd-evaluate"),
            jsonEntry("regime_bindings", regimeBindings)
          ])
        })
      })
    }
  ]);
}

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://t165/${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`standard://t165/${kind}`],
      outputContractRefs: [`contract://t165/${kind}`]
    },
    tags: ["t165", kind]
  });
}

function stageGraphFunction(name, source, target, edgeName) {
  const vectorDeclarations = edgeName === "design_to_code"
    ? attrs([
        stringListEntry(
          ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
          ["depth_traversal"]
        ),
        jsonEntry(ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY, [
          {
            traversalFamily: "depth_traversal",
            allowedActionKinds: ["reenter_graph_span"],
            requiredAuthorityRefs: ["REQ-F-ODDSDLC-165"],
            proportionalityBasisRefs: [
              "proportionality://t165/simple-then-depth"
            ]
          }
        ])
      ])
    : attrs();
  const vector = edge([source], target, {
    id: `graph-vector://t165/${name}`,
    name: edgeName,
    evaluators: [
      {
        name: `${name}_ready`,
        regime: "F_D",
        description: `${edgeName} accepted`,
        binding: `binding://t165/${name}`,
        tags: ["t165"]
      }
    ],
    declarations: vectorDeclarations,
    tags: ["t165"]
  }).vectors[0];
  assert.ok(vector);
  return graphFunctionForVector(vector, {
    name,
    declarations: compositionDeclarations(),
    tags: ["t165"]
  });
}

function buildThreeStageBasis() {
  const input = node("node://t165/input", "input_asset", "input_asset", "declared");
  const requirements = node(
    "node://t165/requirements",
    "requirements_asset",
    "requirements_asset",
    "captured"
  );
  const design = node("node://t165/design", "design_asset", "design_asset", "derived");
  const code = node("node://t165/code", "code_asset", "code_asset", "implemented");
  const executive = compose(
    stageGraphFunction("capture_requirements", input, requirements, "input_to_requirements"),
    stageGraphFunction("synthesize_design", requirements, design, "requirements_to_design"),
    stageGraphFunction("implement_code", design, code, "design_to_code")
  );
  const module = admitModule({
    name: "t165_consequence_bridge_module",
    graphs: [],
    graphFunctions: [executive],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job://t165/consequence-bridge",
        name: "t165_consequence_bridge_job",
        contracts: [{ kind: "graph_function", targetId: executive.id }],
        roles: [],
        tags: ["t165"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: attrs()
  });
  return admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t165/consequence-bridge",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: executive.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t165",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/t165",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t165/fd",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    runId: "run://t165/consequence-bridge",
    workKey: "work-key://t165/consequence-bridge",
    frameId: null,
    frameLineageId: null
  });
}

function selectedComposition(basis) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t165/${basis.graphFunction.name}`,
    compositionDigest: "digest://t165/consequence-bridge",
    compositionSelectionRef: "abg.fn_composition_selection://t165/consequence-bridge",
    selectedRegimeBindingRef: "regime-binding://t165/consequence/fd",
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: basis.graph.vectors[2].id,
    basisRef: basis.id
  });
}

function sdlcConsequenceRows(basis) {
  const composition = selectedComposition(basis);
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef: "intent://t165/current-edge",
    intentEventRefs: ["event://t165/current-edge/selected"],
    productAssetModelRef: "product-asset-model://t165/current",
    selectedPriorityRowRef: "priority-row://t165/current-edge",
    nextActionProjectionRef: "next-action://t165/current-edge/pre",
    selectedActionRef: "action://t165/current-edge",
    basisRefs: ["basis://t165/current-edge"]
  });
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: "evidence://t165/current-edge/worksite",
    intentRef: constructionIntent.intentRef,
    invocationRef: "invocation://t165/current-edge",
    processEventRefs: ["process-event://t165/current-edge/exited"],
    productEvidenceRefs: ["asset://t165/current-edge/design"],
    admittedProgressRefs: ["progress://t165/current-edge/design"]
  });
  const edgeFulfillmentLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: composition,
    ledgerRef: "ledger://t165/current-edge",
    ledgerVersionRef: "ledger-version://t165/current-edge/attempt-1",
    edgeRef: "derive_code_surface",
    attemptRef: "attempt://t165/current-edge/1",
    targetBindingRefs: ["code_surface"],
    evidenceBundleRefs: [worksiteEvidence.evidenceBundleRef],
    counts: {
      expected: 2,
      fulfilled: 1,
      partial: 1,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  const edgeClosureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t165/upstream-reentry",
    ledger: edgeFulfillmentLedger,
    currentEdgeLawful: true,
    reenterReasonRefs: ["pressure://t165/depth/requirements-to-design"]
  });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition: composition,
    nextActionProjectionRef: "next-action://t165/reenter-requirements-to-design",
    intentEventRefs: ["event://t165/current-edge/selected"],
    productAssetModelRef: "product-asset-model://t165/current",
    gapPressureRefs: ["pressure://t165/depth/requirements-to-design"],
    targetBindingRefs: ["code_surface"],
    closureDecision: edgeClosureDecision,
    observationRef: "observation://t165/reentry-selected",
    policyRefs: ["policy://t165/depth-reentry"],
    actionCatalogRefs: ["action-catalog://t165/depth"],
    selectedActionRef: "action://t165/reenter-graph-span",
    nextGraphFunctionRef: basis.graphFunction.id,
    nextGraphVectorRef: basis.graph.vectors[1].id
  });
  return Object.freeze({
    constructionIntent,
    worksiteEvidence,
    edgeFulfillmentLedger,
    edgeClosureDecision,
    nextActionProjection
  });
}

function buildSdlcTraversalActionBinding(basis, reentryTargetRef = "graph-reentry-point://realization/1") {
  const rows = sdlcConsequenceRows(basis);
  const replay = assertSdlcTraversalConsequenceReplayable({
    constructionIntents: [rows.constructionIntent],
    worksiteEvidence: [rows.worksiteEvidence],
    edgeFulfillmentLedgers: [rows.edgeFulfillmentLedger],
    edgeClosureDecisions: [rows.edgeClosureDecision],
    nextActionProjections: [rows.nextActionProjection],
    finalNextActionProjectionRef: rows.nextActionProjection.nextActionProjectionRef,
    abgTraversalTransitionRef:
      "abg-runtime-transition://t165/reenter-requirements-to-design"
  });
  const strategyDecision = deriveSdlcTraversalStrategyDecision({
    edgeName: "derive_code_surface",
    targetAssetType: "code_surface",
    strategyDirectiveRef: "strategy://odd-sdlc/t165/targeted-repair",
    selectedScheduleItemRefs: ["schedule://t165/current-edge"],
    requiredProgressArtifactRefs: ["progress://t165/current-edge/design"]
  });
  const targetVector = basis.graph.vectors[1];
  assert.ok(targetVector);
  const sourceNode = targetVector.source[0];
  assert.ok(sourceNode);
  return constructSdlcConsequenceTraversalActionBinding({
    replay,
    traversalStrategyDecision: strategyDecision,
    sourceNodeRef: sourceNode.id,
    targetNodeRef: targetVector.target.id,
    graphSpanRef: "graph-span://t165/requirements-to-design",
    reentryTargetRef,
    targetOutcomeRef: "outcome://t165/depth-reentry-complete",
    selectedRefinementBoundaryRef: "refinement-boundary://t165/depth-reentry",
    inputAssetRefs: ["asset://t165/source"],
    expectedOutputAssetRefs: ["asset://t165/code-depth"],
    requiredAuthorityRefs: ["REQ-F-ODDSDLC-165", "REQ-R-ABG3-FPC-004B"],
    proportionalityBasisRefs: ["proportionality://t165/simple-then-depth"]
  });
}

test("T-165 SDLC consequence bridge emits an ABG traversal action that the runner consumes", () => {
  const basis = buildThreeStageBasis();
  const binding = buildSdlcTraversalActionBinding(basis);

  assert.equal(binding.kind, "sdlc_consequence_traversal_action_binding");
  assert.equal(binding.traversalAction.kind, "consequence_traversal_action");
  assert.equal(binding.traversalAction.actionKind, "reenter_graph_span");
  assert.equal(binding.traversalAction.selectedGraphFunctionRef, basis.graphFunction.id);
  assert.equal(binding.traversalAction.graphVectorRef, basis.graph.vectors[1].id);
  assert.equal(binding.traversalAction.reentryTargetRef, "graph-reentry-point://realization/1");
  assert.match(binding.strategyDecisionRef, /^strategy-decision:\/\/odd-sdlc\//u);

  const emittedEvents = [];
  const fdEdges = [];
  let traversalActionIssued = false;
  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t165/fd-evaluator",
          pluginKind: "fd_evaluator",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FdEvaluationOutcome"
        }),
        evaluate: (input) => {
          fdEdges.push(input.edge);
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t165/consequence-projection",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: (input) => {
          if (input.vectorIndex === 2 && !traversalActionIssued) {
            traversalActionIssued = true;
            return constructConsequenceProjectionOutcome({
              status: "projected",
              consequenceRef: binding.consequenceProjectionRef,
              domainReadModelRefs: [binding.bindingRef],
              traversalAction: binding.traversalAction,
              evidenceRefs: ["evidence://t165/consequence-action"]
            });
          }
          return constructConsequenceProjectionOutcome({
            status: "projected",
            consequenceRef: `consequence://t165/no-reentry/${input.vectorIndex}`,
            domainReadModelRefs: [],
            traversalAction: null,
            evidenceRefs: [`evidence://t165/no-reentry/${input.vectorIndex}`]
          });
        }
      })
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.deepEqual(fdEdges, [
    "input_to_requirements",
    "requirements_to_design",
    "design_to_code",
    "requirements_to_design",
    "design_to_code"
  ]);
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_intent_selected")
  );
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_graph_action_invoked")
  );
  assert.ok(
    emittedEvents.some(
      (event) => event.kind === "graph_reentry_applied" && event.targetVectorIndex === 1
    )
  );
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "construction_delta_observed" &&
        event.reentryMoved === true
    )
  );
});

test("T-165 SDLC consequence bridge rejects relative cursor movement", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () => buildSdlcTraversalActionBinding(basis, "graph-reentry-point://realization/-2"),
    /absolute graph-reentry-point URI with a numeric vector index/u
  );
});
