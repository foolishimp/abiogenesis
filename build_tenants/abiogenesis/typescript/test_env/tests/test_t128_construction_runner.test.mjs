// Validates: T-128
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitConstructionIntentCandidate,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRow,
  constructConstructionIntentCandidate,
  constructConstructionObservationSnapshot,
  constructConstructionPriorityScheme,
  constructConstructionRepairSurfaceTriageRow,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFdEvaluationOutcome,
  constructVectorClosedEvent,
  defaultFpEvaluatorPlugin,
  constructObservationPressureRow,
  deriveConstructionPriorityProjection,
  deriveObservationToActionBindingProjection,
  publicGaps,
  resolveConstructionHookDeclaration,
  runConstructionIntentStep
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";

const EPISODE_ID = "construction-episode://t128/1";
const OBSERVATION_ID = "construction-observation://t128/1";
const CATALOG_REF = "construction-catalog://t128/1";

function constructionEvent(kind, input = {}) {
  return Object.freeze({
    kind,
    constructionEventRef: input.constructionEventRef ?? `event://t128/${kind}`,
    basisId: input.basisId ?? "basis://t128",
    graphFunctionId: input.graphFunctionId ?? "graph-function://t128",
    runId: input.runId ?? "run://t128",
    workKey: input.workKey ?? "work-key://t128",
    episodeId: input.episodeId ?? EPISODE_ID,
    iterationOrdinal: input.iterationOrdinal ?? 0,
    eventSequence: input.eventSequence ?? 0,
    basisProjectionRef: input.basisProjectionRef ?? "basis-projection://t128/0",
    priorIntentId: input.priorIntentId ?? null,
    causationEventRefs: input.causationEventRefs ?? ["event://t128/root"],
    correlationId: input.correlationId ?? "correlation://t128/root",
    ...input
  });
}

function attachedArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "T-128 synthetic construction runner result accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://t128/${assessmentId}`]
    })),
    selected_worker_id: "worker://t128",
    selected_backend: "backend://node",
    role_id: "role://t128",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

function buildConstructionWorld(basis) {
  const hookResolution = resolveConstructionHookDeclaration({
    installedFallback: {
      hookRef: "hook://t128/construction/default",
      sourceRef: "installed-fallback://t128",
      concerns: ["runner"],
      config: {}
    }
  });
  const action = constructConstructionActionRow({
    actionRef: "action://t128/invoke-mixed-graph",
    actionKind: "invoke_graph_function",
    graphFunctionRef: basis.graphFunction.id,
    targetOutcomeRef: "outcome://t128/mixed-graph-closed",
    inputAssetRefs: ["asset://t128/source"],
    expectedOutputAssetRefs: ["asset://t128/output"],
    requiredAuthorityRefs: ["authority://t128/source"],
    eligibleReasonRefs: ["eligible://t128/action"]
  });
  const catalog = constructConstructionActionCatalogProjection({
    catalogRef: CATALOG_REF,
    episodeId: EPISODE_ID,
    hookResolutionRef: hookResolution.resolutionRef,
    fallbackConfigDigest: hookResolution.configDigest,
    rows: [action]
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId: EPISODE_ID,
    observationId: OBSERVATION_ID,
    basisRef: basis.id,
    currentProjectionRef: "runtime-projection://t128/0",
    iterationOrdinal: 0,
    basisProjectionRef: "basis-projection://t128/0",
    priorIntentId: null,
    causationRef: "event://t128/root",
    correlationId: "correlation://t128/root",
    observedStateRefs: ["observed-state://t128/gap-snapshot"],
    linkedAssetRefs: ["asset://t128/source"],
    actionCatalogRef: catalog.catalogRef,
    authorityDigest: "sha256:t128-authority",
    pressureRows: [
      constructObservationPressureRow({
        pressureRef: "pressure://t128/open-obligation",
        pressureKind: "open_obligation",
        sourceRef: "ledger://t128/obligation",
        affectedAssetRefs: ["asset://t128/source"],
        targetOutcomeRefs: ["outcome://t128/mixed-graph-closed"],
        evidenceRefs: ["evidence://t128/obligation"],
        severity: 3,
        ambiguityClass: "requires_fp_judgment",
        authorityRefs: ["authority://t128/source"]
      })
    ]
  });
  const binding = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog: catalog,
    availableInputRefs: []
  });
  const priority = deriveConstructionPriorityProjection({
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://t128/default",
      sourcePolicyRef: "policy://t128/default",
      rules: []
    }),
    affectPolicies: []
  });
  const priorityRow = priority.rows[0];
  assert.ok(priorityRow);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t128/1",
    episodeId: EPISODE_ID,
    rank: priorityRow.rankOrdinal,
    valueScore: 10,
    priorityScore: priorityRow.finalScore,
    selectedActionRef: priorityRow.actionRef,
    selectedBindingRef: priorityRow.bindingRef,
    selectedOutcomeRef: priorityRow.targetOutcomeRef,
    targetGraphFunctionRef: basis.graphFunction.id,
    inputAssetRefs: action.inputAssetRefs,
    expectedOutputAssetRefs: action.expectedOutputAssetRefs,
    gapRefs: ["gap://t128/source"],
    obligationRefs: ["obligation://t128/source"],
    lawfulBasisRefs: ["law://t128/source"]
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityProjection: priority
  });
  assert.ok(admission.admittedIntent);
  return Object.freeze({ catalog, observation, binding, priority, admission });
}

function buildReentryConstructionWorld(basis, targetVectorIndex) {
  const targetVector = basis.graph.vectors[targetVectorIndex];
  assert.ok(targetVector);
  const hookResolution = resolveConstructionHookDeclaration({
    installedFallback: {
      hookRef: "hook://t128/construction/reentry",
      sourceRef: "installed-fallback://t128/reentry",
      concerns: ["runner"],
      config: {}
    }
  });
  const action = constructConstructionActionRow({
    actionRef: "action://t152/reenter-design",
    actionKind: "reenter_graph_span",
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: targetVector.id,
    refinementBoundaryRef: "refinement-boundary://t152/reenter-design",
    targetOutcomeRef: "outcome://t152/reentry-complete",
    inputAssetRefs: ["asset://t152/source"],
    expectedOutputAssetRefs: ["asset://t152/output"],
    requiredAuthorityRefs: [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ],
    eligibleReasonRefs: ["eligible://t152/reentry"]
  });
  const catalog = constructConstructionActionCatalogProjection({
    catalogRef: "construction-catalog://t152/reentry",
    episodeId: EPISODE_ID,
    hookResolutionRef: hookResolution.resolutionRef,
    fallbackConfigDigest: hookResolution.configDigest,
    rows: [action]
  });
  const pressure = constructObservationPressureRow({
    pressureRef: "pressure://t152/upstream-reentry",
    pressureKind: "reentry_frontier",
    sourceRef: "repair-surface-triage://t152/upstream-reentry",
    affectedAssetRefs: ["asset://t152/output"],
    targetOutcomeRefs: ["outcome://t152/reentry-complete"],
    evidenceRefs: ["evidence://t152/upstream-reentry"],
    severity: 4,
    ambiguityClass: "none",
    authorityRefs: [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ]
  });
  const triage = constructConstructionRepairSurfaceTriageRow({
    triageRef: "repair-surface-triage://t152/upstream-reentry",
    pressureRef: pressure.pressureRef,
    repairSurfaceDisposition: "upstream_reentry",
    graphReentryPoint: "realization",
    repairGraphFunctionRef: basis.graphFunction.id,
    repairGraphVectorRef: targetVector.id,
    reentryTargetVectorIndex: targetVectorIndex,
    repairAssetRef: "asset://t152/output",
    targetOutcomeRef: "outcome://t152/reentry-complete",
    evidenceRefs: ["evidence://t152/triage"],
    authorityRefs: [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ]
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId: EPISODE_ID,
    observationId: "construction-observation://t152/reentry",
    basisRef: basis.id,
    currentProjectionRef: "runtime-projection://t152/reentry/0",
    iterationOrdinal: 0,
    basisProjectionRef: "basis-projection://t152/reentry/0",
    priorIntentId: null,
    causationRef: "event://t152/reentry/root",
    correlationId: "correlation://t152/reentry/root",
    observedStateRefs: ["observed-state://t152/reentry"],
    linkedAssetRefs: ["asset://t152/source"],
    actionCatalogRef: catalog.catalogRef,
    authorityDigest: "sha256:t152-reentry-authority",
    pressureRows: [pressure],
    repairSurfaceTriageRows: [triage]
  });
  const binding = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog: catalog,
    availableInputRefs: []
  });
  const priority = deriveConstructionPriorityProjection({
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://t152/reentry",
      sourcePolicyRef: "policy://t152/reentry",
      rules: []
    }),
    affectPolicies: []
  });
  const priorityRow = priority.rows[0];
  assert.ok(priorityRow);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t152/reentry",
    episodeId: EPISODE_ID,
    rank: priorityRow.rankOrdinal,
    valueScore: 10,
    priorityScore: priorityRow.finalScore,
    selectedActionRef: priorityRow.actionRef,
    selectedBindingRef: priorityRow.bindingRef,
    selectedOutcomeRef: priorityRow.targetOutcomeRef,
    targetGraphFunctionRef: basis.graphFunction.id,
    targetVectorRef: targetVector.id,
    targetReentryRef: `graph-reentry-point://realization/${targetVectorIndex}`,
    inputAssetRefs: action.inputAssetRefs,
    expectedOutputAssetRefs: action.expectedOutputAssetRefs,
    gapRefs: ["gap://t152/reentry"],
    obligationRefs: ["obligation://t152/reentry"],
    lawfulBasisRefs: triage.authorityRefs
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityProjection: priority
  });
  assert.ok(admission.admittedIntent);
  return Object.freeze({ catalog, observation, binding, priority, admission });
}

function admittedConstructionEvents(world, basis) {
  return [
    constructionEvent("construction_episode_started", {
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      constructionEventRef: "event://t128/episode-started",
      eventSequence: 0,
      startProjectionRef: "construction-projection://t128/start"
    }),
    constructionEvent("construction_evaluator_invoked", {
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      constructionEventRef: "event://t128/evaluator-invoked",
      eventSequence: 1,
      observationId: world.observation.observationId,
      catalogRef: world.catalog.catalogRef,
      evaluatorPluginRef: "evaluator-plugin://t128/default",
      inputDigest: "sha256:t128-evaluator-input"
    }),
    constructionEvent("construction_intent_candidate_returned", {
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      constructionEventRef: "event://t128/candidate-returned",
      eventSequence: 2,
      evaluatorPluginRef: "evaluator-plugin://t128/default",
      evaluatorOutcomeRef: "evaluator-outcome://t128/1",
      candidateSetDigest: "sha256:t128-candidate-set",
      candidateRefs: [world.admission.candidateId]
    }),
    constructionEvent("construction_intent_candidate_admitted", {
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      constructionEventRef: "event://t128/candidate-admitted",
      eventSequence: 3,
      candidateId: world.admission.candidateId,
      admissionRef: world.admission.admissionRef,
      intentId: world.admission.admittedIntent.intentId,
      authorityRefs: world.admission.admittedIntent.authorityRefs
    }),
    constructionEvent("construction_intent_selected", {
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      constructionEventRef: "event://t128/intent-selected",
      eventSequence: 4,
      intentId: world.admission.admittedIntent.intentId,
      selectedActionRef: world.admission.admittedIntent.selectedActionRef,
      selectedBindingRef: world.admission.admittedIntent.selectedBindingRef,
      selectionPolicyRef: "policy://t128/priority"
    })
  ];
}

function canonicalRuntimeEvents(events) {
  return emit(events, () => {});
}

test("T-128 construction runner consumes admitted intent and closes mixed F_P/F_D graph work from replay", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t128/mixed",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    runId: "run://t128",
    workKey: "work-key://t128"
  });
  const graphFunction = context.module.graphFunctions[0];
  assert.ok(graphFunction);
  const basis = admitExecutionBasis({
    startIntent: {
      ...input,
      target: {
        kind: "graph_function",
        handle: graphFunction.id
      }
    },
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId,
    workKey: context.workKey,
    frameId: context.frameId,
    frameLineageId: context.frameLineageId
  });
  const world = buildConstructionWorld(basis);
  const emittedEvents = [];
  const fpEdges = [];
  const fdEdges = [];
  const pressurePackageRefs = [];
  const outcome = runConstructionIntentStep({
    basis,
    graphActionBasis: basis,
    observation: world.observation,
    admittedIntent: world.admission.admittedIntent,
    admissions: [world.admission],
    priorityProjection: world.priority,
    actionCatalog: world.catalog,
    constructionEvents: admittedConstructionEvents(world, basis),
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    graphRunnerPlugins: {
      fpDispatch: Object.freeze({
        contract: fpDispatchContract("plugin://t128/fp"),
        dispatch: (input) => {
          fpEdges.push(input.edge);
          pressurePackageRefs.push(input.constructionPressurePackageRef);
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t128/${encodeURIComponent(input.edge)}`,
            attachedResultArtifact: attachedArtifact(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t128/fd"),
        evaluate: (input) => {
          fdEdges.push(input.edge);
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });

  assert.equal(outcome.status, "closed");
  assert.equal(outcome.graphActionResult.transition.kind, "terminal");
  assert.equal(outcome.graphActionResult.transition.terminalKind, "converged");
  assert.equal(outcome.constructionProjection.publicState, "construction_closed");
  assert.equal(outcome.pressureProjection.openPressureRefs.length, 0);
  assert.deepEqual(outcome.pressureProjection.clearedPressureRefs, [
    "pressure://t128/open-obligation"
  ]);
  assert.deepEqual(pressurePackageRefs, [outcome.pressurePackage.packageRef]);
  assert.equal(outcome.invokedEvent.kind, "construction_graph_action_invoked");
  assert.equal(outcome.deltaEvent.kind, "construction_delta_observed");
  assert.equal(outcome.deltaEvent.closed, true);
  assert.deepEqual(
    [
      outcome.pressurePackageEvent.eventSequence,
      outcome.invokedEvent.eventSequence,
      outcome.deltaEvent.eventSequence
    ],
    [5, 6, 7]
  );
  assert.deepEqual(
    outcome.constructionReplayEvents.slice(-3).map((event) => event.kind),
    [
      "construction_pressure_package_materialized",
      "construction_graph_action_invoked",
      "construction_delta_observed"
    ]
  );
  assert.deepEqual(fpEdges, ["input_set→requirements"]);
  assert.deepEqual(fdEdges, ["requirements→design", "design→code"]);
  const gaps = publicGaps(
    { scope: input.scope },
    {
      ...context,
      runtimeEvents: outcome.graphActionResult.replayEvents
    }
  );
  assert.equal(gaps.status, "converged");
  assert.equal(gaps.gaps[0].status, "converged");
  assert.equal(gaps.eventCount, outcome.graphActionResult.replayEvents.length);
  const composedStageOutcomeEvents = ["payload_observed", "payload_validated"];
  assert.deepEqual(
    emittedEvents.map((event) => event.kind),
    [
      "construction_pressure_package_materialized",
      "construction_graph_action_invoked",
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      ...composedStageOutcomeEvents,
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "authority_snapshot_admitted",
      "payload_observed",
      "payload_validated",
      "evidence_admitted",
      "payload_observed",
      "payload_validated",
      "payload_observed",
      "payload_validated",
      "authority_snapshot_admitted",
      "payload_observed",
      "payload_validated",
      "evidence_admitted",
      "evidence_admitted",
      "ambiguity_observation_admitted",
      "executive_pressure_fact_projected",
      "closure_input_published",
      "vector_evaluated",
      ...composedStageOutcomeEvents,
      "vector_closed",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      ...composedStageOutcomeEvents,
      "vector_closed",
      "fd_advance_ready",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      ...composedStageOutcomeEvents,
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached",
      "construction_delta_observed"
    ]
  );
  assert.deepEqual(
    outcome.emittedEvents.map((event) => event.kind),
    emittedEvents.map((event) => event.kind)
  );
});

test("T-152 construction runner applies admitted graph-vector re-entry before default traversal", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t152/reentry-runner",
    workKey: "work-key://t152/reentry-runner"
  });
  const targetVectorIndex = 2;
  const world = buildReentryConstructionWorld(basis, targetVectorIndex);
  const emittedEvents = [];
  const fdEdges = [];

  const outcome = runConstructionIntentStep({
    basis,
    graphActionBasis: basis,
    observation: world.observation,
    admittedIntent: world.admission.admittedIntent,
    admissions: [world.admission],
    priorityProjection: world.priority,
    actionCatalog: world.catalog,
    constructionEvents: admittedConstructionEvents(world, basis),
    graphRuntimeEvents: canonicalRuntimeEvents([
      constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
      constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
      constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" })
    ]),
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    graphRunnerPlugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t152/fd"),
        evaluate: (input) => {
          fdEdges.push(input.edge);
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });

  assert.equal(outcome.reentryAppliedEvent?.targetVectorIndex, targetVectorIndex);
  assert.deepEqual(outcome.reentryAppliedEvent?.shadowedVectorIndexes, [2]);
  assert.equal(outcome.deltaEvent.reentryMoved, true);
  assert.equal(outcome.status, "closed");
  assert.equal(outcome.graphActionResult.transition.kind, "terminal");
  assert.equal(outcome.graphActionResult.transition.terminalKind, "converged");
  assert.deepEqual(fdEdges, ["design→code"]);
  assert.deepEqual(
    emittedEvents.slice(0, 5).map((event) => event.kind),
    [
      "construction_pressure_package_materialized",
      "construction_graph_action_invoked",
      "basis_admitted",
      "graph_reentry_planned",
      "graph_reentry_applied"
    ]
  );
  assert.equal(
    outcome.graphActionResult.replayEvents.some(
      (event) => event.kind === "graph_reentry_applied"
    ),
    true
  );
  assert.ok(
    outcome.deltaEvent.runtimeEventRefs.some((ref) =>
      ref.includes("graph_reentry_applied")
    )
  );
});

test("T-128 construction runner rejects unselected admitted intent", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t128/mismatch",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    runId: "run://t128/mismatch",
    workKey: "work-key://t128/mismatch"
  });
  const world = buildConstructionWorld(basis);
  const unselectedIntent = Object.freeze({
    ...world.admission.admittedIntent,
    intentId: "construction-intent://t128/unselected"
  });

  assert.throws(
    () =>
      runConstructionIntentStep({
        basis,
        graphActionBasis: basis,
        observation: world.observation,
        admittedIntent: unselectedIntent,
        admissions: [world.admission],
        priorityProjection: world.priority,
        actionCatalog: world.catalog,
        constructionEvents: admittedConstructionEvents(world, basis),
        eventSink: () => {}
      }),
    /selected admitted construction intent/
  );
});
