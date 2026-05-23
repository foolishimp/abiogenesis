// Validates: T-139
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS
// Validates: REQ-R-ABG3-PROJECTION

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitConstructionIntentCandidate,
  admitConstructionPressurePackage,
  assertConstructionPressurePackageAdmitted,
  assertRuntimeEvent,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRow,
  constructConstructionDeltaObservedEvent,
  constructConstructionGraphActionInvokedEvent,
  constructConstructionIntentCandidate,
  constructConstructionObservationSnapshot,
  constructConstructionPressurePackageMaterializedEvent,
  constructConstructionPriorityScheme,
  constructEnginePluginContract,
  constructFdAuthorityOutcomeAdmittedEvent,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructObservationPressureRow,
  constructObservedStateAdmittedEvent,
  constructOverlayFrameContract,
  constructOverlayFrameDeclaredEvent,
  constructOverlayFrameEvaluatedEvent,
  constructOverlayFramePredicateBinding,
  constructOverlayFrameScopeRef,
  defaultFpEvaluatorPlugin,
  deriveConstructionPressurePackage,
  deriveConstructionPressureProjection,
  deriveConstructionPriorityProjection,
  deriveConstructionProgressLedgerFromDeltaEvents,
  deriveConstructionProjection,
  deriveObservationToActionBindingProjection,
  deriveObservedStateProjection,
  deriveRuntimeAggregateProjection,
  evaluateOverlayFrameContract,
  resolveConstructionHookDeclaration,
  runConstructionIntentStep
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const EPISODE_ID = "construction-episode://t139/1";
const OBSERVATION_ID = "construction-observation://t139/1";
const CATALOG_REF = "construction-catalog://t139/1";

function constructionEvent(kind, basis, input = {}) {
  return Object.freeze({
    kind,
    constructionEventRef: input.constructionEventRef ?? `event://t139/${kind}`,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    episodeId: input.episodeId ?? EPISODE_ID,
    iterationOrdinal: input.iterationOrdinal ?? 0,
    eventSequence: input.eventSequence ?? 0,
    basisProjectionRef: input.basisProjectionRef ?? "basis-projection://t139/0",
    priorIntentId: input.priorIntentId ?? null,
    causationEventRefs: input.causationEventRefs ?? ["event://t139/root"],
    correlationId: input.correlationId ?? "correlation://t139/root",
    ...input
  });
}

function observedStateEvent(basis, observedStateRef, eventWatermark) {
  return constructObservedStateAdmittedEvent({
    basis,
    observedStateRef,
    sourceKind: "register_json",
    scopeRef: "scope://t139/construction",
    sourceRef: `register://t139/${eventWatermark}`,
    digest: `sha256:t139:${eventWatermark}`,
    version: `version://${eventWatermark}`,
    eventWatermark,
    freshnessPolicyRef: "freshness-policy://t139/current",
    derivationBasisRef: "basis://t139/runtime",
    basisProjectionRef: `runtime-projection://t139/${eventWatermark}`,
    derivedFromRefs: [`runtime-event://t139/${eventWatermark}`],
    causationEventRefs: ["runtime-event://t139/root"],
    correlationId: `correlation://t139/${eventWatermark}`
  });
}

function fdOutcomeEvent(basis) {
  return constructFdAuthorityOutcomeAdmittedEvent({
    basis,
    vectorIndex: 1,
    status: "blocked",
    severityClass: "content_unproven",
    routingDecision: "route_to_fp",
    pressureRefs: ["pressure://t139/open-obligation"],
    evidenceRefs: ["evidence://t139/fd/content-unproven"],
    diagnosticRefs: ["diagnostic://t139/content-unproven"]
  });
}

function overlayEvents(basis, fireEvent, doneEvent) {
  const contract = constructOverlayFrameContract({
    basis,
    overlayFrameRef: "overlay-frame://t139/thread",
    contractRef: "overlay-frame-contract://t139/thread",
    scopeRefs: [
      constructOverlayFrameScopeRef({ basis, scopeKind: "graph_function" }),
      constructOverlayFrameScopeRef({
        basis,
        scopeKind: "graph_vector",
        vectorIndex: 0
      })
    ],
    fireWhen: constructOverlayFramePredicateBinding({
      predicateRef: "overlay-predicate://t139/fire",
      role: "fire_when",
      expressionRef: "predicate-expression://all-observed-state-present",
      observedStateRefs: [fireEvent.observedStateRef]
    }),
    terminateWhen: constructOverlayFramePredicateBinding({
      predicateRef: "overlay-predicate://t139/terminate",
      role: "terminate_when",
      expressionRef: "predicate-expression://all-observed-state-present",
      observedStateRefs: [doneEvent.observedStateRef]
    }),
    pressureRefs: ["pressure://t139/open-obligation"],
    foldbackTargetRef: "overlay-parent://t139/root",
    reentryTargetVectorIndex: 0
  });
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const outcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent])
  });
  return [declared, constructOverlayFrameEvaluatedEvent({ basis, outcome })];
}

function buildWorld(basis) {
  const hookResolution = resolveConstructionHookDeclaration({
    installedFallback: {
      hookRef: "hook://t139/construction/default",
      sourceRef: "installed-fallback://t139",
      concerns: ["runner"],
      config: {}
    }
  });
  const action = constructConstructionActionRow({
    actionRef: "action://t139/invoke-mixed-graph",
    actionKind: "invoke_graph_function",
    graphFunctionRef: basis.graphFunction.id,
    targetOutcomeRef: "outcome://t139/mixed-graph-closed",
    inputAssetRefs: ["asset://t139/source"],
    expectedOutputAssetRefs: ["asset://t139/output"],
    requiredAuthorityRefs: ["authority://t139/source"],
    eligibleReasonRefs: ["eligible://t139/action"]
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
    currentProjectionRef: "runtime-projection://t139/current",
    iterationOrdinal: 0,
    basisProjectionRef: "basis-projection://t139/0",
    priorIntentId: null,
    causationRef: "event://t139/root",
    correlationId: "correlation://t139/root",
    observedStateRefs: ["observed-state://t139/fire"],
    linkedAssetRefs: ["asset://t139/source"],
    actionCatalogRef: catalog.catalogRef,
    authorityDigest: "sha256:t139-authority",
    pressureRows: [
      constructObservationPressureRow({
        pressureRef: "pressure://t139/open-obligation",
        pressureKind: "open_obligation",
        sourceRef: "ledger://t139/obligation",
        affectedAssetRefs: ["asset://t139/source"],
        targetOutcomeRefs: ["outcome://t139/mixed-graph-closed"],
        evidenceRefs: ["evidence://t139/obligation"],
        severity: 4,
        ambiguityClass: "requires_fp_judgment",
        authorityRefs: ["authority://t139/source"]
      })
    ]
  });
  const binding = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog: catalog
  });
  const priority = deriveConstructionPriorityProjection({
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://t139/default",
      sourcePolicyRef: "policy://t139/default",
      rules: []
    }),
    affectPolicies: []
  });
  const priorityRow = priority.rows[0];
  assert.ok(priorityRow);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t139/1",
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
    gapRefs: ["gap://t139/source"],
    obligationRefs: ["obligation://t139/source"],
    lawfulBasisRefs: ["law://t139/source"]
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityProjection: priority
  });
  assert.ok(admission.admittedIntent);
  return Object.freeze({ action, catalog, observation, priority, admission });
}

function admittedConstructionEvents(world, basis) {
  return [
    constructionEvent("construction_episode_started", basis, {
      constructionEventRef: "event://t139/episode-started",
      eventSequence: 0,
      startProjectionRef: "construction-projection://t139/start"
    }),
    constructionEvent("construction_evaluator_invoked", basis, {
      constructionEventRef: "event://t139/evaluator-invoked",
      eventSequence: 1,
      observationId: world.observation.observationId,
      catalogRef: world.catalog.catalogRef,
      evaluatorPluginRef: "evaluator-plugin://t139/default",
      inputDigest: "sha256:t139-evaluator-input"
    }),
    constructionEvent("construction_intent_candidate_returned", basis, {
      constructionEventRef: "event://t139/candidate-returned",
      eventSequence: 2,
      evaluatorPluginRef: "evaluator-plugin://t139/default",
      evaluatorOutcomeRef: "evaluator-outcome://t139/1",
      candidateSetDigest: "sha256:t139-candidate-set",
      candidateRefs: [world.admission.candidateId]
    }),
    constructionEvent("construction_intent_candidate_admitted", basis, {
      constructionEventRef: "event://t139/candidate-admitted",
      eventSequence: 3,
      candidateId: world.admission.candidateId,
      admissionRef: world.admission.admissionRef,
      intentId: world.admission.admittedIntent.intentId,
      authorityRefs: world.admission.admittedIntent.authorityRefs
    }),
    constructionEvent("construction_intent_selected", basis, {
      constructionEventRef: "event://t139/intent-selected",
      eventSequence: 4,
      intentId: world.admission.admittedIntent.intentId,
      selectedActionRef: world.admission.admittedIntent.selectedActionRef,
      selectedBindingRef: world.admission.admittedIntent.selectedBindingRef,
      selectionPolicyRef: "policy://t139/priority"
    })
  ];
}

test("T-139 pressure package admits observed state, F_D outcome, overlay, and prior evidence", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    dispatchRef: "dispatch://t139/mixed",
    runId: "run://t139",
    workKey: "work-key://t139"
  });
  const world = buildWorld(basis);
  const fireEvent = observedStateEvent(basis, "observed-state://t139/fire", 1);
  const doneEvent = observedStateEvent(basis, "observed-state://t139/done", 2);
  const runtimeEvents = [
    fireEvent,
    fdOutcomeEvent(basis),
    ...overlayEvents(basis, fireEvent, doneEvent),
    doneEvent
  ];
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, runtimeEvents);
  const constructionProjection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    admissions: [world.admission],
    actionCatalog: world.catalog,
    progressLedger: deriveConstructionProgressLedgerFromDeltaEvents({
      episodeId: EPISODE_ID,
      events: []
    })
  });
  const pressurePackage = deriveConstructionPressurePackage({
    basis,
    observation: world.observation,
    admittedIntent: world.admission.admittedIntent,
    actionCatalog: world.catalog,
    constructionProjection,
    runtimeProjection,
    runtimeProjectionRef: "runtime-projection://t139/current",
    runtimeEvents
  });
  const admission = admitConstructionPressurePackage({ pressurePackage });
  assertConstructionPressurePackageAdmitted(admission);

  assert.deepEqual(pressurePackage.inputBasis.observedStateRefs, [
    "observed-state://t139/done",
    "observed-state://t139/fire"
  ]);
  assert.equal(pressurePackage.inputBasis.fdOutcomeRefs.length, 1);
  assert.match(
    pressurePackage.inputBasis.fdOutcomeRefs[0],
    /^fd-authority-outcome:/
  );
  assert.deepEqual(pressurePackage.inputBasis.overlayFrameRefs, [
    "overlay-frame://t139/thread"
  ]);
  assert.deepEqual(pressurePackage.pressureRefs.map((row) => row.pressureRef), [
    "pressure://t139/open-obligation"
  ]);

  const packageEvent = constructConstructionPressurePackageMaterializedEvent({
    constructionEventRef: "construction-event://t139/pressure-package/0",
    admittedIntent: world.admission.admittedIntent,
    pressurePackage,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    eventSequence: 3
  });
  assertRuntimeEvent(packageEvent);
  const invoked = constructConstructionGraphActionInvokedEvent({
    constructionEventRef: "construction-event://t139/invoked/0",
    admittedIntent: world.admission.admittedIntent,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    eventSequence: 4,
    graphCallId: "graph-call://t139",
    frameId: "frame://t139",
    causationEventRefs: [packageEvent.constructionEventRef]
  });
  const openProjection = deriveConstructionPressureProjection({
    episodeId: EPISODE_ID,
    events: [packageEvent]
  });
  assert.deepEqual(openProjection.openPressureRefs, [
    "pressure://t139/open-obligation"
  ]);
  const delta = constructConstructionDeltaObservedEvent({
    constructionEventRef: "construction-event://t139/delta/0",
    invokedEvent: invoked,
    eventSequence: 5,
    attemptOrdinal: 0,
    deltaRef: "construction-delta://t139/0",
    beforeProjectionRef: "construction-projection://t139/before",
    afterProjectionRef: "runtime-projection://t139/after",
    newEvidenceRefs: ["evidence://t139/execution-pass"],
    closed: true
  });
  const clearedProjection = deriveConstructionPressureProjection({
    episodeId: EPISODE_ID,
    events: [packageEvent, delta]
  });
  assert.deepEqual(clearedProjection.openPressureRefs, []);
  assert.deepEqual(clearedProjection.clearedPressureRefs, [
    "pressure://t139/open-obligation"
  ]);
});

test("T-139 runner passes pressure package through the F_P plugin boundary", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    dispatchRef: "dispatch://t139/runner",
    runId: "run://t139/runner",
    workKey: "work-key://t139/runner"
  });
  const world = buildWorld(basis);
  const seenPackages = [];
  const outcome = runConstructionIntentStep({
    basis,
    graphActionBasis: basis,
    observation: world.observation,
    admittedIntent: world.admission.admittedIntent,
    admissions: [world.admission],
    priorityProjection: world.priority,
    actionCatalog: world.catalog,
    constructionEvents: admittedConstructionEvents(world, basis),
    eventSink: () => {},
    graphRunnerPlugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t139/fp",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch: (input) => {
          seenPackages.push(input.constructionPressurePackage);
          const assessmentIds =
            input.expectedAssessmentIds.length > 0
              ? input.expectedAssessmentIds
              : ["runtime_fulfilled"];
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: "result://t139/fp",
            attachedResultArtifact: {
              edge: input.edge,
              actor: "codex",
              fulfillment_assessments: assessmentIds.map((assessmentId) => ({
                  id: assessmentId,
                  evaluator: assessmentId,
                  fulfillment_status: "fulfilled",
                  fulfillment_detail: "T-139 pressure package reached F_P",
                  blocking_reasons: [],
                  evidence_refs: ["proof://t139/fp"]
                })),
              selected_worker_id: "worker://t139",
              selected_backend: "backend://node",
              role_id: "role://t139",
              assignment_source: "policy_resolution",
              resolved_runtime_ref: "runtime://typescript/node"
            },
            evidenceRefs: [input.constructionPressurePackageRef]
          });
        }
      }),
      fdEvaluator: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t139/fd",
          pluginKind: "fd_evaluator",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FdEvaluationOutcome"
        }),
        evaluate: () =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: ["proof://t139/fd"]
          })
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });

  assert.equal(outcome.status, "closed");
  assert.equal(outcome.pressurePackageEvent.kind, "construction_pressure_package_materialized");
  assert.equal(seenPackages.length, 1);
  assert.equal(seenPackages[0].packageRef, outcome.pressurePackage.packageRef);
  assert.deepEqual(outcome.pressureProjection.clearedPressureRefs, [
    "pressure://t139/open-obligation"
  ]);
});
