// Validates: T-127
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS
// Validates: REQ-R-ABG3-PROJECTION

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitConstructionRuntimeEvents,
  admitConstructionIntentCandidate,
  assertRuntimeEvent,
  assertConstructionProjectionSummaryAgreement,
  constructAffectPriorityPolicy,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRow,
  constructConstructionGraphActionInvokedEvent,
  constructConstructionIntentCandidate,
  constructConstructionObservationSnapshot,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructObservationPressureRow,
  constructRuntimeFluent,
  deriveConstructionEventCalculusProjection,
  deriveConstructionObservationAssetRefsFromRuntimeTruth,
  deriveConstructionPriorityProjection,
  deriveConstructionProgressLedgerFromDeltaEvents,
  deriveConstructionProgressLedger,
  deriveConstructionProjection,
  deriveConstructionProjectionSummary,
  deriveObservationToActionBindingProjection,
  eventCalculusEffectsForEvent,
  holdsAt,
  CONSTRUCTION_HOOK_KEY,
  resolveConstructionHookDeclaration,
  resolveConstructionHookDeclarationFromGtl
} from "../../build/semantic/code/src/abg/m03/index.js";

const EPISODE_ID = "construction-episode://t127/1";
const OBSERVATION_ID = "construction-observation://t127/1";
const CATALOG_REF = "construction-catalog://t127/1";
const BASIS_ID = "basis://t127";
const GRAPH_FUNCTION_ID = "graph-function://build-site";
const RUN_ID = "run://t127";
const WORK_KEY = "work-key://t127";
const BASIS_PROJECTION_REF = "basis-projection://t127/0";
const CORRELATION_ID = "correlation://t127/root";

function constructionEvent(kind, input = {}) {
  return Object.freeze({
    kind,
    constructionEventRef: input.constructionEventRef ?? `event://${kind}`,
    basisId: input.basisId ?? BASIS_ID,
    graphFunctionId: input.graphFunctionId ?? GRAPH_FUNCTION_ID,
    runId: input.runId ?? RUN_ID,
    workKey: input.workKey ?? WORK_KEY,
    episodeId: input.episodeId ?? EPISODE_ID,
    iterationOrdinal: input.iterationOrdinal ?? 0,
    eventSequence: input.eventSequence ?? 0,
    basisProjectionRef: input.basisProjectionRef ?? BASIS_PROJECTION_REF,
    priorIntentId: input.priorIntentId ?? null,
    causationEventRefs: input.causationEventRefs ?? ["event://root"],
    correlationId: input.correlationId ?? CORRELATION_ID,
    ...input
  });
}

function evaluatorInvoked(input = {}) {
  return constructionEvent("construction_evaluator_invoked", {
    constructionEventRef: "event://construction/evaluator-invoked",
    eventSequence: 3,
    observationId: OBSERVATION_ID,
    catalogRef: CATALOG_REF,
    evaluatorPluginRef: "evaluator-plugin://fp-consciousness/default",
    inputDigest: "sha256:evaluator-input",
    ...input
  });
}

function candidateReturned(input = {}) {
  return constructionEvent("construction_intent_candidate_returned", {
    constructionEventRef: "event://construction/candidate-returned",
    eventSequence: 4,
    evaluatorPluginRef: "evaluator-plugin://fp-consciousness/default",
    evaluatorOutcomeRef: "evaluator-outcome://t127/1",
    candidateSetDigest: "sha256:candidates",
    candidateRefs: ["candidate://t127/1"],
    ...input
  });
}

function graphActionInvoked(input = {}) {
  return constructionEvent("construction_graph_action_invoked", {
    constructionEventRef: "event://construction/graph-action-invoked",
    eventSequence: 7,
    intentId: "construction-intent://t127/1",
    selectedActionRef: "action://repair/site",
    runtimeInvocationPlanRef: "runtime-invocation-plan://t127/1",
    graphCallId: "graph-call://t127/1",
    frameId: "frame://t127/1",
    continuationId: "continuation://t127/1",
    selectedGraphFunctionRef: GRAPH_FUNCTION_ID,
    selectedVectorRef: "graph-vector://build-site/repair",
    ...input
  });
}

function deltaObserved(input = {}) {
  return constructionEvent("construction_delta_observed", {
    constructionEventRef: "event://construction/delta-observed",
    eventSequence: 8,
    intentId: "construction-intent://t127/1",
    attemptOrdinal: 0,
    graphCallId: "graph-call://t127/1",
    frameId: "frame://t127/1",
    continuationId: "continuation://t127/1",
    deltaRef: "delta://t127/1",
    assetDeltaRefs: ["delta://asset/site"],
    runtimeEventRefs: ["runtime-event://actor/result"],
    beforeProjectionRef: "projection://before/1",
    afterProjectionRef: "projection://after/1",
    artifactDigestBefore: "sha256:before",
    artifactDigestAfter: "sha256:after",
    blockerBefore: "blocker://compile",
    blockerAfter: "blocker://compile",
    fulfilledObligationRefs: [],
    remainingObligationRefs: ["obligation://site"],
    newEvidenceRefs: [],
    fhDecisionAccepted: false,
    reentryMoved: false,
    closed: false,
    ...input
  });
}

function terminalDispositionEvent(input = {}) {
  return constructionEvent("construction_terminal_disposition_projected", {
    constructionEventRef: "event://construction/terminal-disposition",
    eventSequence: 9,
    terminalProjectionRef: "construction-projection://terminal/review",
    publicState: "construction_review_required",
    selectedActionRef: "action://review/required",
    selectedIntentId: null,
    terminalRouteRefs: ["route://review/site"],
    reviewReasonRefs: ["reason://review/site"],
    ...input
  });
}

function fallbackHook() {
  return Object.freeze({
    hookRef: "hook://installed/fp-consciousness/default",
    sourceRef: "installed-fallback://abg/fp-consciousness",
    concerns: Object.freeze(["priority_scheme", "intent_renderer"]),
    config: Object.freeze({
      fallback: true,
      version: "t127"
    })
  });
}

function hook(sourceRef, hookRef) {
  return Object.freeze({
    hookRef,
    sourceRef,
    concerns: Object.freeze(["priority_scheme"]),
    config: Object.freeze({
      sourceRef,
      hookRef
    })
  });
}

function attrs(entries = []) {
  return Object.freeze({
    entries: Object.freeze(entries)
  });
}

function hookRefAttr(hookRef, concerns = ["priority_scheme"], extraConfig = []) {
  return Object.freeze({
    key: CONSTRUCTION_HOOK_KEY,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: hookRef,
        config: attrs([
          Object.freeze({
            key: "concerns",
            value: Object.freeze({
              kind: "string_list",
              value: Object.freeze(concerns)
            })
          }),
          ...extraConfig
        ])
      })
    })
  });
}

function constructionHookAttrs(hookRef, concerns, extraConfig) {
  return attrs([hookRefAttr(hookRef, concerns, extraConfig)]);
}

function graphAction(input = {}) {
  return constructConstructionActionRow({
    actionRef: input.actionRef ?? "action://repair/site",
    actionKind: input.actionKind ?? "repair_same_edge",
    graphFunctionRef: input.graphFunctionRef ?? "graph-function://build-site",
    graphVectorRef: input.graphVectorRef ?? "graph-vector://build-site/repair",
    refinementBoundaryRef:
      input.refinementBoundaryRef ?? "refinement-boundary://build-site/repair",
    targetOutcomeRef: input.targetOutcomeRef ?? "outcome://site-built",
    inputAssetRefs: input.inputAssetRefs ?? ["asset://requirements/site"],
    expectedOutputAssetRefs: input.expectedOutputAssetRefs ?? [
      "asset://implementation/site"
    ],
    requiredAuthorityRefs: input.requiredAuthorityRefs ?? ["authority://req/site"],
    eligibleReasonRefs: input.eligibleReasonRefs ?? ["eligible://t127"],
    ineligibleReasonRefs: input.ineligibleReasonRefs ?? []
  });
}

function terminalAction(input = {}) {
  return constructConstructionActionRow({
    actionRef: input.actionRef ?? "action://review/required",
    actionKind: input.actionKind ?? "block_episode",
    targetOutcomeRef: input.targetOutcomeRef ?? "outcome://site-built",
    expectedOutputAssetRefs: input.expectedOutputAssetRefs ?? [
      "route://review/site"
    ],
    eligibleReasonRefs: input.eligibleReasonRefs ?? ["eligible://review"]
  });
}

function pressure(input = {}) {
  return constructObservationPressureRow({
    pressureRef: input.pressureRef ?? "pressure://obligation/site",
    pressureKind: input.pressureKind ?? "open_obligation",
    sourceRef: input.sourceRef ?? "ledger://obligation/site",
    affectedAssetRefs: input.affectedAssetRefs ?? ["asset://requirements/site"],
    targetOutcomeRefs: input.targetOutcomeRefs ?? ["outcome://site-built"],
    evidenceRefs: input.evidenceRefs ?? ["evidence://ledger/site"],
    severity: input.severity ?? 2,
    ambiguityClass: input.ambiguityClass ?? "none",
    authorityRefs: input.authorityRefs ?? ["authority://req/site"],
    affectSignalKind: input.affectSignalKind ?? null
  });
}

function affectPressure(input = {}) {
  return pressure({
    pressureRef: input.pressureRef ?? "pressure://affect/fear",
    pressureKind: "affect_signal",
    sourceRef: input.sourceRef ?? "affect://operator/fear",
    affectedAssetRefs: input.affectedAssetRefs ?? [],
    targetOutcomeRefs: input.targetOutcomeRefs ?? ["outcome://site-built"],
    evidenceRefs: input.evidenceRefs ?? ["evidence://operator/fear"],
    severity: input.severity ?? 5,
    ambiguityClass: "requires_fp_judgment",
    authorityRefs: input.authorityRefs ?? ["authority://affect/policy"],
    affectSignalKind: input.affectSignalKind ?? "fear"
  });
}

function buildWorld(input = {}) {
  const actions = input.actions ?? [graphAction()];
  const pressures = input.pressures ?? [pressure()];
  const hookResolution = resolveConstructionHookDeclaration({
    installedFallback: fallbackHook()
  });
  const catalog = constructConstructionActionCatalogProjection({
    catalogRef: CATALOG_REF,
    episodeId: EPISODE_ID,
    hookResolutionRef: hookResolution.resolutionRef,
    fallbackConfigDigest: hookResolution.configDigest,
    rows: actions
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId: EPISODE_ID,
    observationId: OBSERVATION_ID,
    basisRef: "basis://t127",
    currentProjectionRef: "runtime-projection://t127/0",
    iterationOrdinal: input.iterationOrdinal ?? 0,
    basisProjectionRef: input.basisProjectionRef ?? "basis-projection://t127/0",
    priorIntentId: input.priorIntentId ?? null,
    causationRef: input.causationRef ?? "causation://t127/root",
    correlationId: input.correlationId ?? "correlation://t127/root",
    linkedAssetRefs: input.linkedAssetRefs ?? ["asset://requirements/site"],
    passedInputRefs: input.passedInputRefs ?? [],
    actionCatalogRef: catalog.catalogRef,
    authorityDigest: "sha256:t127-authority",
    pressureRows: pressures
  });
  const binding = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog: catalog,
    availableInputRefs: input.availableInputRefs ?? []
  });
  const priorityScheme =
    input.priorityScheme ??
    constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://t127/default",
      sourcePolicyRef: "policy://t127/default",
      rules: Object.freeze([])
    });
  const priority = deriveConstructionPriorityProjection({
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityScheme,
    affectPolicies: input.affectPolicies ?? []
  });
  return Object.freeze({
    hookResolution,
    catalog,
    observation,
    binding,
    priority
  });
}

function candidateFor(world, input = {}) {
  const row = input.priorityRow ?? world.priority.rows[0];
  assert.ok(row);
  const action = world.catalog.rows.find((candidate) => candidate.actionRef === row.actionRef);
  assert.ok(action);
  return constructConstructionIntentCandidate({
    candidateId: input.candidateId ?? "candidate://t127/1",
    episodeId: EPISODE_ID,
    rank: input.rank ?? row.rankOrdinal,
    valueScore: input.valueScore ?? 10,
    priorityScore: input.priorityScore ?? row.finalScore,
    affectAdjustmentRefs: input.affectAdjustmentRefs ?? row.affectAdjustmentRefs,
    selectedActionRef: input.selectedActionRef ?? row.actionRef,
    selectedBindingRef: input.selectedBindingRef ?? row.bindingRef,
    selectedOutcomeRef: input.selectedOutcomeRef ?? row.targetOutcomeRef,
    targetGraphFunctionRef:
      input.targetGraphFunctionRef === undefined
        ? action.graphFunctionRef
        : input.targetGraphFunctionRef,
    targetVectorRef:
      input.targetVectorRef === undefined ? action.graphVectorRef : input.targetVectorRef,
    targetReentryRef: input.targetReentryRef ?? null,
    inputAssetRefs: input.inputAssetRefs ?? action.inputAssetRefs,
    expectedOutputAssetRefs:
      input.expectedOutputAssetRefs ?? action.expectedOutputAssetRefs,
    gapRefs: input.gapRefs ?? ["gap://t127/site"],
    obligationRefs: input.obligationRefs ?? ["obligation://t127/site"],
    lawfulBasisRefs: input.lawfulBasisRefs ?? ["law://t127/action"],
    hiddenConfigRefs: input.hiddenConfigRefs ?? [],
    runtimeEventPayloadRefs: input.runtimeEventPayloadRefs ?? [],
    fdSemanticCanonicalizationRequired:
      input.fdSemanticCanonicalizationRequired ?? false
  });
}

test("T-127 binds obligation pressure to a lawful graph action and admits the selected intent", () => {
  const world = buildWorld();

  assert.equal(world.binding.rows.length, 1);
  assert.deepEqual(world.binding.rows[0].missingInputRefs, []);
  assert.equal(world.priority.rows[0].actionRef, "action://repair/site");

  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });

  assert.equal(admission.decision, "admitted");
  assert.ok(admission.admittedIntent);
  assert.equal(
    admission.admittedIntent.runtimeInvocationPlanRef,
    "runtime-invocation-plan:construction-episode://t127/1:candidate://t127/1"
  );
  assert.equal(admission.iterationOrdinal, 0);
  assert.equal(admission.basisProjectionRef, "basis-projection://t127/0");
  assert.equal(admission.causationRef, "causation://t127/root");
  assert.equal(admission.correlationId, "correlation://t127/root");
  assert.equal(admission.admittedIntent.iterationOrdinal, 0);
  assert.equal(
    admission.admittedIntent.basisProjectionRef,
    "basis-projection://t127/0"
  );
  assert.equal(admission.admittedIntent.correlationId, "correlation://t127/root");

  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    admissions: [admission],
    actionCatalog: world.catalog
  });
  assert.equal(projection.publicState, "construction_progressing_yield");
  assert.equal(projection.nextActionRef, "action://repair/site");
  assertConstructionProjectionSummaryAgreement({
    projection,
    summary: deriveConstructionProjectionSummary(projection)
  });
});

test("T-127 graph-action invocation events derive only from admitted construction intent", () => {
  const world = buildWorld();
  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  assert.ok(admission.admittedIntent);

  const invoked = constructConstructionGraphActionInvokedEvent({
    constructionEventRef: "event://construction/admitted-invocation",
    admittedIntent: admission.admittedIntent,
    basisId: BASIS_ID,
    graphFunctionId: GRAPH_FUNCTION_ID,
    runId: RUN_ID,
    workKey: WORK_KEY,
    eventSequence: 7,
    graphCallId: "graph-call://t127/admitted",
    frameId: "frame://t127/admitted",
    continuationId: "continuation://t127/admitted"
  });

  assert.equal(invoked.intentId, admission.admittedIntent.intentId);
  assert.equal(invoked.selectedActionRef, "action://repair/site");
  assert.equal(invoked.selectedGraphFunctionRef, "graph-function://build-site");
  assert.deepEqual(invoked.causationEventRefs, [admission.admissionRef]);
  assert.doesNotThrow(() =>
    admitConstructionRuntimeEvents({
      episodeId: EPISODE_ID,
      events: [
        constructionEvent("construction_episode_started", {
          constructionEventRef: "event://construction/episode-started",
          eventSequence: 0,
          startProjectionRef: "construction-projection://start"
        }),
        evaluatorInvoked(),
        candidateReturned(),
        constructionEvent("construction_intent_candidate_admitted", {
          constructionEventRef: "event://construction/candidate-admitted",
          eventSequence: 5,
          candidateId: admission.candidateId,
          admissionRef: admission.admissionRef,
          intentId: admission.admittedIntent.intentId,
          authorityRefs: admission.admittedIntent.authorityRefs
        }),
        constructionEvent("construction_intent_selected", {
          constructionEventRef: "event://construction/intent-selected",
          eventSequence: 6,
          intentId: admission.admittedIntent.intentId,
          selectedActionRef: admission.admittedIntent.selectedActionRef,
          selectedBindingRef: admission.admittedIntent.selectedBindingRef,
          selectionPolicyRef: "policy://priority/default"
        }),
        invoked
      ]
    })
  );

  const terminalWorld = buildWorld({
    actions: [
      terminalAction({
        actionKind: "open_fh_gate",
        actionRef: "action://fh/input"
      })
    ]
  });
  const terminalAdmission = admitConstructionIntentCandidate({
    candidate: candidateFor(terminalWorld),
    observation: terminalWorld.observation,
    actionCatalog: terminalWorld.catalog,
    bindingProjection: terminalWorld.binding,
    priorityProjection: terminalWorld.priority
  });
  assert.ok(terminalAdmission.admittedIntent);
  assert.equal(terminalAdmission.admittedIntent.runtimeInvocationPlanRef, null);
  assert.throws(
    () =>
      constructConstructionGraphActionInvokedEvent({
        constructionEventRef: "event://construction/terminal-not-invokable",
        admittedIntent: terminalAdmission.admittedIntent,
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        runId: RUN_ID,
        workKey: WORK_KEY,
        eventSequence: 7,
        graphCallId: "graph-call://t127/terminal",
        frameId: "frame://t127/terminal"
      }),
    /not invokable through graph action/
  );
});

test("T-127 observation asset refs include every independent graph root", () => {
  const basis = {
    startIntent: {
      inputBindings: [
        {
          assetRef: "asset://runtime/passed",
          assetType: "runtime_input",
          uri: "memory://runtime/passed"
        }
      ]
    },
    graph: {
      inputs: [{ id: "asset://root/a" }, { id: "asset://root/b" }],
      vectors: [
        {
          source: [{ id: "asset://root/a" }],
          target: { id: "asset://mid/a" }
        },
        {
          source: [{ id: "asset://root/b" }],
          target: { id: "asset://mid/b" }
        },
        {
          source: [{ id: "asset://mid/a" }, { id: "asset://mid/b" }],
          target: { id: "asset://joined" }
        }
      ]
    }
  };
  const refs = deriveConstructionObservationAssetRefsFromRuntimeTruth({
    basis,
    projection: {
      closedVectorIndexes: [0]
    }
  });

  assert.deepEqual(refs.passedInputRefs, ["asset://runtime/passed"]);
  assert.deepEqual(refs.linkedAssetRefs, [
    "asset://mid/a",
    "asset://root/a",
    "asset://root/b"
  ]);
});

test("T-127 rejects internal vector action rows without published traversal target authority", () => {
  assert.throws(
    () =>
      constructConstructionActionRow({
        actionRef: "action://bad/internal-vector",
        actionKind: "repair_same_edge",
        graphFunctionRef: "graph-function://build-site",
        graphVectorRef: "graph-vector://build-site/internal",
        targetOutcomeRef: "outcome://site-built"
      }),
    /requires RefinementBoundary, CandidateFamily, or published traversal target/
  );
});

test("T-127 affect-only pressure does not bind constructive graph actions", () => {
  const world = buildWorld({
    actions: [graphAction(), terminalAction()],
    pressures: [affectPressure()]
  });

  assert.deepEqual(
    world.binding.rows.map((row) => row.actionRef),
    ["action://review/required"]
  );
});

test("T-127 terminal affect projection maps force_review to construction_review_required and blocks invocation", () => {
  const reviewPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://review",
    signalKind: "fear",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    forceReviewThreshold: 3,
    terminalRouteRefs: ["route://review/site"],
    sourcePolicyRef: "policy://affect/review"
  });
  const world = buildWorld({
    actions: [graphAction()],
    pressures: [pressure(), affectPressure({ severity: 5 })],
    affectPolicies: [reviewPolicy]
  });

  assert.equal(world.priority.rows[0].terminalDisposition, "force_review");
  assert.equal(world.priority.rows[0].forcedReview, true);

  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  assert.equal(admission.decision, "rejected");
  assert.ok(
    admission.rejectionReasonRefs.includes(
      "terminal_priority_projection_blocks_invocation"
    )
  );

  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    admissions: [admission],
    actionCatalog: world.catalog
  });
  assert.equal(projection.publicState, "construction_review_required");
  assert.deepEqual(projection.terminalRouteRefs, ["route://review/site"]);
});

test("T-127 overlapping terminal affect policies keep the route for the selected disposition", () => {
  const reviewPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://review-overlap",
    signalKind: "fear",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    forceReviewThreshold: 3,
    terminalRouteRefs: ["route://review/site"],
    sourcePolicyRef: "policy://affect/review"
  });
  const escalationPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://escalate-overlap",
    signalKind: "fear",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    escalationThreshold: 7,
    terminalRouteRefs: ["route://escalate/site"],
    sourcePolicyRef: "policy://affect/escalate"
  });
  const world = buildWorld({
    actions: [graphAction()],
    pressures: [pressure(), affectPressure({ severity: 9 })],
    affectPolicies: [reviewPolicy, escalationPolicy]
  });

  assert.equal(world.priority.rows[0].terminalDisposition, "escalate");
  assert.equal(world.priority.rows[0].terminalRouteRef, "route://escalate/site");

  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority
  });
  assert.equal(projection.publicState, "construction_escalated");
  assert.deepEqual(projection.terminalRouteRefs, ["route://escalate/site"]);
});

test("T-127 affect policy can request F_H input or escalation as public terminal projection", () => {
  const fhPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://fh",
    signalKind: "danger",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    fhInputThreshold: 2,
    terminalRouteRefs: ["route://fh/site"],
    sourcePolicyRef: "policy://affect/fh"
  });
  const escalationPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://escalate",
    signalKind: "danger",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    escalationThreshold: 7,
    terminalRouteRefs: ["route://escalate/site"],
    sourcePolicyRef: "policy://affect/escalate"
  });

  const fhWorld = buildWorld({
    pressures: [pressure(), affectPressure({ affectSignalKind: "danger", severity: 3 })],
    affectPolicies: [fhPolicy]
  });
  const fhProjection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: fhWorld.priority
  });
  assert.equal(fhProjection.publicState, "fh_input_required");
  assert.deepEqual(fhProjection.terminalRouteRefs, ["route://fh/site"]);

  const escalationWorld = buildWorld({
    pressures: [pressure(), affectPressure({ affectSignalKind: "danger", severity: 9 })],
    affectPolicies: [escalationPolicy]
  });
  const escalationProjection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: escalationWorld.priority
  });
  assert.equal(escalationProjection.publicState, "construction_escalated");
  assert.deepEqual(escalationProjection.terminalRouteRefs, [
    "route://escalate/site"
  ]);
});

test("T-127 boost and confidence attenuation affect rank score without creating bindings", () => {
  const boostPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://boost",
    signalKind: "urgency",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    boostWeight: 4,
    sourcePolicyRef: "policy://affect/boost"
  });
  const boosted = buildWorld({
    pressures: [
      pressure(),
      affectPressure({ affectSignalKind: "urgency", severity: 1 })
    ],
    affectPolicies: [boostPolicy]
  });
  assert.equal(boosted.binding.rows.length, 1);
  assert.equal(boosted.priority.affectAdjustments[0].adjustment, "boost");
  assert.equal(boosted.priority.affectAdjustments[0].weightDelta, 4);
  assert.equal(
    boosted.priority.rows[0].finalScore,
    boosted.priority.rows[0].baseScore + 4
  );

  const attenuationPolicy = constructAffectPriorityPolicy({
    policyRef: "affect-policy://attenuate",
    signalKind: "confidence",
    appliesToOutcomeRefs: ["outcome://site-built"],
    appliesToActionKinds: ["repair_same_edge"],
    attenuationWeight: 2,
    sourcePolicyRef: "policy://affect/attenuate"
  });
  const attenuated = buildWorld({
    pressures: [
      pressure(),
      affectPressure({ affectSignalKind: "confidence", severity: 1 })
    ],
    affectPolicies: [attenuationPolicy]
  });
  assert.equal(attenuated.binding.rows.length, 1);
  assert.equal(attenuated.priority.affectAdjustments[0].adjustment, "attenuate");
  assert.equal(attenuated.priority.affectAdjustments[0].weightDelta, -2);
  assert.equal(
    attenuated.priority.rows[0].finalScore,
    attenuated.priority.rows[0].baseScore - 2
  );
});

test("T-127 priority policy ranks configured steel-thread work and uses stable tie law", () => {
  const scheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t127/steel-thread",
    sourcePolicyRef: "policy://priority/default",
    rules: [
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://steel-thread",
        axis: "steel_thread",
        weight: 5,
        appliesToActionKinds: ["repair_same_edge"],
        appliesToOutcomeRefs: ["outcome://vertical-slice"],
        sourcePolicyRef: "policy://priority/steel-thread",
        strategyLabel: "steel-thread"
      })
    ]
  });
  const vertical = graphAction({
    actionRef: "action://b-vertical",
    targetOutcomeRef: "outcome://vertical-slice",
    expectedOutputAssetRefs: ["asset://implementation/vertical"]
  });
  const fullBreadth = graphAction({
    actionRef: "action://a-full",
    targetOutcomeRef: "outcome://full-breadth",
    expectedOutputAssetRefs: ["asset://implementation/full"]
  });
  const world = buildWorld({
    actions: [fullBreadth, vertical],
    pressures: [
      pressure({
        pressureRef: "pressure://vertical",
        targetOutcomeRefs: ["outcome://vertical-slice"]
      }),
      pressure({
        pressureRef: "pressure://full",
        targetOutcomeRefs: ["outcome://full-breadth"]
      })
    ],
    priorityScheme: scheme
  });

  assert.equal(world.priority.rows[0].actionRef, "action://b-vertical");
  assert.equal(world.priority.rows[0].rankOrdinal, 0);

  const tieWorld = buildWorld({
    actions: [
      graphAction({ actionRef: "action://b" }),
      graphAction({ actionRef: "action://a" })
    ],
    pressures: [pressure()]
  });
  assert.deepEqual(
    tieWorld.priority.rows.map((row) => [row.rankOrdinal, row.actionRef]),
    [
      [0, "action://a"],
      [1, "action://b"]
    ]
  );
});

test("T-127 projection selects admitted intent by priority rank, not caller order", () => {
  const scheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t127/selection",
    sourcePolicyRef: "policy://priority/default",
    rules: [
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://release-blocking-selection",
        axis: "release_blocking",
        weight: 10,
        appliesToActionKinds: ["repair_same_edge"],
        appliesToOutcomeRefs: ["outcome://release-blocker"],
        sourcePolicyRef: "policy://priority/release",
        strategyLabel: "release-blocking"
      })
    ]
  });
  const highAction = graphAction({
    actionRef: "action://release-blocker",
    targetOutcomeRef: "outcome://release-blocker",
    expectedOutputAssetRefs: ["asset://implementation/release-blocker"]
  });
  const lowAction = graphAction({
    actionRef: "action://background-progress",
    targetOutcomeRef: "outcome://background-progress",
    expectedOutputAssetRefs: ["asset://implementation/background"]
  });
  const world = buildWorld({
    actions: [lowAction, highAction],
    pressures: [
      pressure({
        pressureRef: "pressure://release-blocker",
        targetOutcomeRefs: ["outcome://release-blocker"]
      }),
      pressure({
        pressureRef: "pressure://background-progress",
        targetOutcomeRefs: ["outcome://background-progress"]
      })
    ],
    priorityScheme: scheme
  });

  const highRow = world.priority.rows.find(
    (row) => row.actionRef === "action://release-blocker"
  );
  const lowRow = world.priority.rows.find(
    (row) => row.actionRef === "action://background-progress"
  );
  assert.ok(highRow);
  assert.ok(lowRow);
  assert.equal(highRow.rankOrdinal, 0);

  const highAdmission = admitConstructionIntentCandidate({
    candidate: candidateFor(world, {
      candidateId: "candidate://release-blocker",
      priorityRow: highRow
    }),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  const lowAdmission = admitConstructionIntentCandidate({
    candidate: candidateFor(world, {
      candidateId: "candidate://background-progress",
      priorityRow: lowRow
    }),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });

  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    admissions: [lowAdmission, highAdmission],
    actionCatalog: world.catalog
  });
  assert.equal(projection.nextActionRef, "action://release-blocker");
  assert.equal(
    projection.selectedIntentId,
    "construction-intent:construction-episode://t127/1:candidate://release-blocker"
  );
});

test("T-127 priority cannot override missing input bindings", () => {
  const scheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t127/release-blocking",
    sourcePolicyRef: "policy://priority/default",
    rules: [
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://release-blocking",
        axis: "release_blocking",
        weight: 99,
        appliesToActionKinds: ["repair_same_edge"],
        appliesToOutcomeRefs: ["outcome://site-built"],
        sourcePolicyRef: "policy://priority/release",
        strategyLabel: "release-blocking"
      })
    ]
  });
  const world = buildWorld({
    linkedAssetRefs: [],
    actions: [graphAction({ inputAssetRefs: ["asset://missing"] })],
    priorityScheme: scheme
  });

  assert.deepEqual(world.binding.rows[0].missingInputRefs, ["asset://missing"]);
  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world, { inputAssetRefs: [] }),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  assert.equal(admission.decision, "rejected");
  assert.ok(admission.rejectionReasonRefs.includes("binding_has_missing_inputs"));
});

test("T-127 admitted errors bind repair only when affected asset identity matches", () => {
  const matching = buildWorld({
    pressures: [
      pressure({
        pressureRef: "pressure://scalac/site",
        pressureKind: "admitted_error",
        affectedAssetRefs: ["asset://implementation/site"]
      })
    ]
  });
  assert.equal(matching.binding.rows.length, 1);

  const nonMatching = buildWorld({
    pressures: [
      pressure({
        pressureRef: "pressure://scalac/other",
        pressureKind: "admitted_error",
        affectedAssetRefs: ["asset://implementation/other"]
      })
    ]
  });
  assert.equal(nonMatching.binding.rows.length, 0);
});

test("T-127 typed asset gap binding rejects actions that do not provide the missing asset", () => {
  const world = buildWorld({
    pressures: [
      pressure({
        pressureRef: "pressure://gap/site-implementation",
        pressureKind: "gap_row",
        affectedAssetRefs: ["asset://implementation/site"],
        targetOutcomeRefs: ["outcome://site-built"]
      })
    ],
    actions: [
      graphAction({
        expectedOutputAssetRefs: ["asset://implementation/other"]
      })
    ]
  });

  assert.equal(world.binding.rows.length, 0);
});

test("T-127 internal traversal action rows require published traversal authority", () => {
  assert.throws(
    () =>
      constructConstructionActionRow({
        actionRef: "action://unpublished/internal-vector",
        actionKind: "repair_same_edge",
        graphFunctionRef: "graph-function://build-site",
        graphVectorRef: "graph-vector://private/repair",
        targetOutcomeRef: "outcome://site-built",
        inputAssetRefs: ["asset://requirements/site"],
        expectedOutputAssetRefs: ["asset://implementation/site"],
        eligibleReasonRefs: ["eligible://shape-only"]
      }),
    /requires RefinementBoundary, CandidateFamily, or published traversal target authority/
  );
});

test("T-127 candidate admission rejects hidden config, event payloads, and F_D canonical semantic demands", () => {
  const world = buildWorld();
  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world, {
      hiddenConfigRefs: ["hidden://priority"],
      runtimeEventPayloadRefs: ["event://synthetic"],
      fdSemanticCanonicalizationRequired: true
    }),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });

  assert.equal(admission.decision, "rejected");
  assert.deepEqual(admission.rejectionReasonRefs, [
    "hidden_runtime_config",
    "direct_runtime_event_payload",
    "fd_semantic_canonicalization_without_source_authority"
  ]);
});

test("T-127 progress ledger distinguishes material progress from stagnation", () => {
  const world = buildWorld();
  const ledger = deriveConstructionProgressLedger({
    episodeId: EPISODE_ID,
    rows: [
      {
        iterationOrdinal: 1,
        attemptOrdinal: 1,
        eventSequence: 2,
        intentId: "intent://2",
        attemptRef: "attempt://2",
        basisProjectionRef: "basis-projection://t127/2",
        priorIntentId: "intent://1",
        causationRef: "causation://t127/2",
        correlationId: "correlation://t127/root",
        beforeProjectionRef: "projection://before/2",
        afterProjectionRef: "projection://after/2",
        assetDeltaRefs: [],
        artifactDigestBefore: "sha256:same",
        artifactDigestAfter: "sha256:same",
        blockerBefore: "blocker://compile",
        blockerAfter: "blocker://compile",
        fulfilledObligationRefs: [],
        remainingObligationRefs: ["obligation://site"],
        newEvidenceRefs: [],
        fhDecisionAccepted: false,
        reentryMoved: false,
        closed: false
      },
      {
        iterationOrdinal: 0,
        attemptOrdinal: 0,
        eventSequence: 1,
        intentId: "intent://1",
        attemptRef: "attempt://1",
        basisProjectionRef: "basis-projection://t127/1",
        priorIntentId: null,
        causationRef: "causation://t127/1",
        correlationId: "correlation://t127/root",
        beforeProjectionRef: "projection://before/1",
        afterProjectionRef: "projection://after/1",
        assetDeltaRefs: ["delta://site/1"],
        artifactDigestBefore: "sha256:old",
        artifactDigestAfter: "sha256:new",
        blockerBefore: "blocker://compile",
        blockerAfter: "blocker://compile",
        fulfilledObligationRefs: [],
        remainingObligationRefs: ["obligation://site"],
        newEvidenceRefs: [],
        fhDecisionAccepted: false,
        reentryMoved: false,
        closed: false
      }
    ]
  });

  assert.deepEqual(
    ledger.rows.map((row) => row.eventSequence),
    [1, 2]
  );
  assert.equal(ledger.rows[0].progressKind, "new_artifact_digest");
  assert.equal(ledger.rows[1].progressKind, "no_material_progress");
  assert.equal(ledger.rows[1].stagnationReason, "same_blocker_and_same_digest");

  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    progressLedger: ledger
  });
  assert.equal(projection.publicState, "construction_stalled");

  assert.throws(
    () =>
      deriveConstructionProgressLedger({
        episodeId: EPISODE_ID,
        rows: [
          {
            intentId: "intent://missing-metadata",
            attemptRef: "attempt://missing-metadata",
            beforeProjectionRef: "projection://before/missing",
            afterProjectionRef: "projection://after/missing",
            assetDeltaRefs: [],
            artifactDigestBefore: "sha256:same",
            artifactDigestAfter: "sha256:same",
            blockerBefore: "blocker://compile",
            blockerAfter: "blocker://compile",
            fulfilledObligationRefs: [],
            remainingObligationRefs: ["obligation://site"],
            newEvidenceRefs: [],
            fhDecisionAccepted: false,
            reentryMoved: false,
            closed: false
          }
        ]
      }),
    /iterationOrdinal must be a non-negative integer/
  );
});

test("T-127 public summary agreement includes selected intent and trace fields", () => {
  const world = buildWorld();
  const admission = admitConstructionIntentCandidate({
    candidate: candidateFor(world),
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  const projection = deriveConstructionProjection({
    episodeId: EPISODE_ID,
    priorityProjection: world.priority,
    admissions: [admission],
    actionCatalog: world.catalog,
    sourceProjectionRefs: ["projection://source/a"]
  });
  const summary = deriveConstructionProjectionSummary(projection);
  assertConstructionProjectionSummaryAgreement({ projection, summary });

  assert.throws(
    () =>
      assertConstructionProjectionSummaryAgreement({
        projection,
        summary: {
          ...summary,
          selectedIntentId: "construction-intent://wrong"
        }
      }),
    /selectedIntentId mismatch/
  );
  assert.throws(
    () =>
      assertConstructionProjectionSummaryAgreement({
        projection,
        summary: {
          ...summary,
          sourceProjectionRefs: ["projection://source/b"]
        }
      }),
    /sourceProjectionRefs mismatch/
  );
});

test("T-127 hook resolution preserves precedence, visible fallback, and duplicate rejection", () => {
  const fallback = fallbackHook();
  const fallbackOnly = resolveConstructionHookDeclaration({
    installedFallback: fallback
  });
  assert.equal(fallbackOnly.source, "installed_fallback");
  assert.equal(fallbackOnly.fallbackUsed, true);
  assert.match(fallbackOnly.configDigest, /^[a-f0-9]{64}$/);

  const resolved = resolveConstructionHookDeclaration({
    graphVectorDeclarations: [
      hook("graph-vector://site/repair", "hook://vector/fp-consciousness")
    ],
    graphFunctionDeclarations: [
      hook("graph-function://site", "hook://function/fp-consciousness")
    ],
    jobPolicyDeclarations: [hook("job://site", "hook://job/fp-consciousness")],
    rolePolicyDeclarations: [hook("role://constructor", "hook://role/fp-consciousness")],
    modulePolicyDeclarations: [hook("module://site", "hook://module/fp-consciousness")],
    installedFallback: fallback
  });
  assert.equal(resolved.source, "graph_vector");
  assert.equal(resolved.hookRef, "hook://vector/fp-consciousness");

  assert.throws(
    () =>
      resolveConstructionHookDeclaration({
        graphVectorDeclarations: [
          hook("graph-vector://site/1", "hook://vector/1"),
          hook("graph-vector://site/2", "hook://vector/2")
        ],
        installedFallback: fallback
      }),
    /Duplicate graph_vector construction hook declarations/
  );
});

test("T-127 resolves abg.fp_consciousness hooks from live GTL carrier surfaces", () => {
  const fallback = fallbackHook();
  const resolved = resolveConstructionHookDeclarationFromGtl({
    graphVector: {
      id: "graph-vector://site/repair",
      declarations: constructionHookAttrs("hook://vector/fp-consciousness", [
        "priority_scheme",
        "progress_policy"
      ])
    },
    graphFunction: {
      id: "graph-function://site/build",
      declarations: constructionHookAttrs("hook://function/fp-consciousness")
    },
    job: {
      id: "job://site/build",
      policyHooks: constructionHookAttrs("hook://job/fp-consciousness")
    },
    role: {
      id: "role://constructor",
      policyHooks: constructionHookAttrs("hook://role/fp-consciousness")
    },
    module: {
      name: "site",
      policyHooks: constructionHookAttrs("hook://module/fp-consciousness")
    },
    installedFallback: fallback
  });

  assert.equal(resolved.source, "graph_vector");
  assert.equal(resolved.sourceRef, "graph-vector://site/repair");
  assert.equal(resolved.hookRef, "hook://vector/fp-consciousness");
  assert.deepEqual(resolved.concerns, ["priority_scheme", "progress_policy"]);
  assert.equal(resolved.fallbackUsed, false);

  const jobWinsOverRole = resolveConstructionHookDeclarationFromGtl({
    job: {
      id: "job://site/build",
      policyHooks: constructionHookAttrs("hook://job/fp-consciousness")
    },
    role: {
      id: "role://constructor",
      policyHooks: constructionHookAttrs("hook://role/fp-consciousness")
    },
    module: {
      name: "site",
      policyHooks: constructionHookAttrs("hook://module/fp-consciousness")
    },
    installedFallback: fallback
  });
  assert.equal(jobWinsOverRole.source, "job_policy");
  assert.equal(jobWinsOverRole.hookRef, "hook://job/fp-consciousness");

  const moduleOnly = resolveConstructionHookDeclarationFromGtl({
    module: {
      name: "site",
      policyHooks: constructionHookAttrs("hook://module/fp-consciousness")
    },
    installedFallback: fallback
  });
  assert.equal(moduleOnly.source, "module_policy");
  assert.equal(moduleOnly.sourceRef, "module:site");

  assert.throws(
    () =>
      resolveConstructionHookDeclarationFromGtl({
        graphVector: {
          id: "graph-vector://site/repair",
          declarations: attrs([
            hookRefAttr("hook://vector/1"),
            hookRefAttr("hook://vector/2")
          ])
        },
        installedFallback: fallback
      }),
    /duplicate abg\.fp_consciousness hook declarations/
  );

  assert.throws(
    () =>
      resolveConstructionHookDeclarationFromGtl({
        graphVector: {
          id: "graph-vector://site/repair",
          declarations: attrs([
            Object.freeze({
              key: CONSTRUCTION_HOOK_KEY,
              value: Object.freeze({
                kind: "scalar",
                value: "hook://not-a-hook-ref"
              })
            })
          ])
        },
        installedFallback: fallback
      }),
    /must be a hook_ref attr/
  );
});

test("T-127 admits construction runtime events and rejects missing lineage metadata", () => {
  const event = constructionEvent("construction_episode_started", {
    constructionEventRef: "event://construction/episode-started",
    startProjectionRef: "construction-projection://start"
  });

  assert.doesNotThrow(() => assertRuntimeEvent(event));
  assert.equal(admitConstructionRuntimeEvents({
    episodeId: EPISODE_ID,
    events: [event]
  })[0].constructionEventRef, "event://construction/episode-started");

  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        correlationId: ""
      }),
    /correlationId must be a non-empty string/
  );
  assert.throws(
    () =>
      admitConstructionRuntimeEvents({
        episodeId: "construction-episode://other",
        events: [event]
      }),
    /belongs to/
  );
});

test("T-127 construction Event Calculus replay uses canonical event order and declared effects", () => {
  const episodeStarted = constructionEvent("construction_episode_started", {
    constructionEventRef: "event://construction/episode-started",
    eventSequence: 0,
    startProjectionRef: "construction-projection://start"
  });
  const observationMaterialized = constructionEvent(
    "construction_observation_snapshot_materialized",
    {
      constructionEventRef: "event://construction/observation",
      eventSequence: 1,
      observationId: OBSERVATION_ID,
      currentProjectionRef: "runtime-projection://t127/0",
      observedStateRefs: [],
      linkedAssetRefs: ["asset://requirements/site"],
      authorityDigest: "sha256:t127-authority"
    }
  );
  const actionCatalogProjected = constructionEvent(
    "construction_action_catalog_projected",
    {
      constructionEventRef: "event://construction/catalog",
      eventSequence: 2,
      catalogRef: CATALOG_REF,
      hookResolutionRef: "construction-hook-resolution://t127/default",
      fallbackConfigDigest: "sha256:fallback",
      traversalPublicationRefs: ["refinement-boundary://build-site/repair"]
    }
  );
  const candidateAdmitted = constructionEvent(
    "construction_intent_candidate_admitted",
    {
      constructionEventRef: "event://construction/candidate-admitted",
      eventSequence: 5,
      candidateId: "candidate://t127/1",
      admissionRef: "construction-admission://t127/1",
      intentId: "construction-intent://t127/1",
      authorityRefs: ["authority://req/site"]
    }
  );
  const intentSelected = constructionEvent("construction_intent_selected", {
    constructionEventRef: "event://construction/intent-selected",
    eventSequence: 6,
    intentId: "construction-intent://t127/1",
    selectedActionRef: "action://repair/site",
    selectedBindingRef: "construction-binding://t127/1",
    selectionPolicyRef: "policy://priority/default"
  });
  const invoked = graphActionInvoked();
  const delta = deltaObserved();

  const projection = deriveConstructionEventCalculusProjection({
    episodeId: EPISODE_ID,
    events: [
      delta,
      invoked,
      candidateReturned(),
      episodeStarted,
      candidateAdmitted,
      intentSelected,
      observationMaterialized,
      actionCatalogProjected,
      evaluatorInvoked()
    ]
  });

  assert.deepEqual(
    projection.effectRows.map((row) => row.eventKind),
    [
      "construction_episode_started",
      "construction_observation_snapshot_materialized",
      "construction_action_catalog_projected",
      "construction_evaluator_invoked",
      "construction_intent_candidate_returned",
      "construction_intent_candidate_admitted",
      "construction_intent_selected",
      "construction_graph_action_invoked",
      "construction_delta_observed"
    ]
  );
  assert.deepEqual(projection.effectRows[1].initiates, []);
  assert.deepEqual(projection.effectRows[2].terminates, []);

  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_evaluator_awaiting_outcome",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        runId: RUN_ID,
        workKey: WORK_KEY,
        constraintRef: "evaluator-plugin://fp-consciousness/default",
        ref: `${EPISODE_ID}:0`
      })
    ),
    false
  );
  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_graph_action_in_flight",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        graphCallId: "graph-call://t127/1",
        frameId: "frame://t127/1",
        runId: RUN_ID,
        workKey: WORK_KEY,
        continuationId: "continuation://t127/1",
        ref: "construction-intent://t127/1"
      })
    ),
    false
  );
  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_progress_observed",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        graphCallId: "graph-call://t127/1",
        frameId: "frame://t127/1",
        runId: RUN_ID,
        workKey: WORK_KEY,
        continuationId: "continuation://t127/1",
        constraintRef: "delta://t127/1",
        ref: "construction-intent://t127/1"
      })
    ),
    true
  );

  const rejectedEffect = eventCalculusEffectsForEvent({
    event: constructionEvent("construction_intent_candidate_rejected", {
      constructionEventRef: "event://construction/candidate-rejected",
      eventSequence: 5,
      candidateId: "candidate://t127/rejected",
      admissionRef: "construction-admission://t127/rejected",
      rejectionReasonRefs: ["reason://hidden-config"],
      authorityRefs: ["authority://req/site"]
    })
  });
  assert.deepEqual(rejectedEffect.initiates, []);
  assert.deepEqual(rejectedEffect.terminates, []);
});

test("T-127 construction delta events derive progress ledger rows without primary stagnation events", () => {
  const candidate1Admitted = constructionEvent(
    "construction_intent_candidate_admitted",
    {
      constructionEventRef: "event://construction/candidate-1-admitted",
      eventSequence: 5,
      candidateId: "candidate://t127/1",
      admissionRef: "construction-admission://t127/1",
      intentId: "construction-intent://t127/1",
      authorityRefs: ["authority://req/site"]
    }
  );
  const intent1Selected = constructionEvent("construction_intent_selected", {
    constructionEventRef: "event://construction/intent-1-selected",
    eventSequence: 6,
    intentId: "construction-intent://t127/1",
    selectedActionRef: "action://repair/site",
    selectedBindingRef: "construction-binding://t127/1",
    selectionPolicyRef: "policy://priority/default"
  });
  const candidate2Admitted = constructionEvent(
    "construction_intent_candidate_admitted",
    {
      constructionEventRef: "event://construction/candidate-2-admitted",
      eventSequence: 9,
      iterationOrdinal: 1,
      candidateId: "candidate://t127/2",
      admissionRef: "construction-admission://t127/2",
      intentId: "construction-intent://t127/2",
      authorityRefs: ["authority://req/site"]
    }
  );
  const intent2Selected = constructionEvent("construction_intent_selected", {
    constructionEventRef: "event://construction/intent-2-selected",
    eventSequence: 10,
    iterationOrdinal: 1,
    intentId: "construction-intent://t127/2",
    selectedActionRef: "action://repair/site",
    selectedBindingRef: "construction-binding://t127/2",
    selectionPolicyRef: "policy://priority/default"
  });
  const invoked2 = graphActionInvoked({
    constructionEventRef: "event://construction/graph-action-2-invoked",
    eventSequence: 11,
    iterationOrdinal: 1,
    intentId: "construction-intent://t127/2"
  });
  const stalledDelta = deltaObserved({
    constructionEventRef: "event://construction/delta-stalled",
    eventSequence: 12,
    iterationOrdinal: 1,
    attemptOrdinal: 1,
    priorIntentId: "construction-intent://t127/1",
    intentId: "construction-intent://t127/2",
    deltaRef: "delta://t127/2",
    artifactDigestBefore: "sha256:same",
    artifactDigestAfter: "sha256:same",
    blockerBefore: "blocker://compile",
    blockerAfter: "blocker://compile",
    assetDeltaRefs: [],
    runtimeEventRefs: [],
    newEvidenceRefs: []
  });
  const events = [
    constructionEvent("construction_episode_started", {
      constructionEventRef: "event://construction/episode-started",
      eventSequence: 0,
      startProjectionRef: "construction-projection://start"
    }),
    evaluatorInvoked(),
    candidateReturned({
      candidateRefs: ["candidate://t127/1", "candidate://t127/2"]
    }),
    candidate1Admitted,
    intent1Selected,
    graphActionInvoked(),
    deltaObserved(),
    candidate2Admitted,
    intent2Selected,
    invoked2,
    stalledDelta
  ];
  const ledger = deriveConstructionProgressLedgerFromDeltaEvents({
    episodeId: EPISODE_ID,
    events
  });

  assert.deepEqual(
    ledger.rows.map((row) => row.progressKind),
    ["new_artifact_digest", "no_material_progress"]
  );
  assert.equal(ledger.rows[1].stagnationReason, "same_blocker_and_same_digest");

  const projection = deriveConstructionEventCalculusProjection({
    episodeId: EPISODE_ID,
    events
  });
  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_progress_observed",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        graphCallId: "graph-call://t127/1",
        frameId: "frame://t127/1",
        runId: RUN_ID,
        workKey: WORK_KEY,
        continuationId: "continuation://t127/1",
        constraintRef: "delta://t127/2",
        ref: "construction-intent://t127/2"
      })
    ),
    false
  );
});

test("T-127 orphan construction deltas cannot create EC or progress-ledger truth", () => {
  assert.throws(
    () =>
      deriveConstructionEventCalculusProjection({
        episodeId: EPISODE_ID,
        events: [deltaObserved()]
      }),
    /requires prior in-flight graph action invocation/
  );
  assert.throws(
    () =>
      deriveConstructionProgressLedgerFromDeltaEvents({
        episodeId: EPISODE_ID,
        events: [deltaObserved()]
      }),
    /requires prior in-flight graph action invocation/
  );
});

test("T-127 closed construction delta terminates episode-open EC truth", () => {
  const closedDelta = deltaObserved({
    constructionEventRef: "event://construction/delta-closed",
    closed: true,
    fulfilledObligationRefs: ["obligation://site"],
    remainingObligationRefs: [],
    deltaRef: "delta://t127/closed"
  });
  const projection = deriveConstructionEventCalculusProjection({
    episodeId: EPISODE_ID,
    events: [
      constructionEvent("construction_episode_started", {
        constructionEventRef: "event://construction/episode-started",
        eventSequence: 0,
        startProjectionRef: "construction-projection://start"
      }),
      evaluatorInvoked(),
      candidateReturned(),
      constructionEvent("construction_intent_candidate_admitted", {
        constructionEventRef: "event://construction/candidate-admitted",
        eventSequence: 5,
        candidateId: "candidate://t127/1",
        admissionRef: "construction-admission://t127/1",
        intentId: "construction-intent://t127/1",
        authorityRefs: ["authority://req/site"]
      }),
      constructionEvent("construction_intent_selected", {
        constructionEventRef: "event://construction/intent-selected",
        eventSequence: 6,
        intentId: "construction-intent://t127/1",
        selectedActionRef: "action://repair/site",
        selectedBindingRef: "construction-binding://t127/1",
        selectionPolicyRef: "policy://priority/default"
      }),
      graphActionInvoked(),
      closedDelta
    ]
  });

  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_episode_open",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        runId: RUN_ID,
        workKey: WORK_KEY,
        ref: EPISODE_ID
      })
    ),
    false
  );
  assert.equal(
    holdsAt(
      projection,
      constructRuntimeFluent({
        name: "construction_episode_closed",
        scope: "construction",
        basisId: BASIS_ID,
        graphFunctionId: GRAPH_FUNCTION_ID,
        runId: RUN_ID,
        workKey: WORK_KEY,
        constraintRef: "delta://t127/closed",
        ref: EPISODE_ID
      })
    ),
    true
  );
});

test("T-127 terminal construction dispositions are replay-visible public states", () => {
  const terminalCases = [
    {
      publicState: "construction_review_required",
      terminalProjectionRef: "construction-projection://terminal/review",
      selectedActionRef: "action://review/required",
      terminalRouteRefs: ["route://review/site"],
      reviewReasonRefs: ["reason://review/site"]
    },
    {
      publicState: "fh_input_required",
      terminalProjectionRef: "construction-projection://terminal/fh",
      selectedActionRef: "action://fh/input",
      terminalRouteRefs: ["route://fh/site"],
      reviewReasonRefs: ["reason://fh/site"]
    },
    {
      publicState: "construction_escalated",
      terminalProjectionRef: "construction-projection://terminal/escalate",
      selectedActionRef: "action://escalate/site",
      terminalRouteRefs: ["route://escalate/site"],
      reviewReasonRefs: ["reason://danger/site"]
    },
    {
      publicState: "ticket_created",
      terminalProjectionRef: "construction-projection://terminal/ticket",
      selectedActionRef: "action://ticket/site",
      terminalRouteRefs: ["ticket://site/1"],
      reviewReasonRefs: ["reason://ticket/site"]
    },
    {
      publicState: "reprice_required",
      terminalProjectionRef: "construction-projection://terminal/reprice",
      selectedActionRef: "action://reprice/site",
      terminalRouteRefs: ["reprice://site/1"],
      reviewReasonRefs: ["reason://reprice/site"]
    },
    {
      publicState: "construction_closed",
      terminalProjectionRef: "construction-projection://terminal/closed",
      selectedActionRef: "action://close/site",
      terminalRouteRefs: [],
      reviewReasonRefs: []
    }
  ];

  for (const [index, terminalCase] of terminalCases.entries()) {
    const episodeStarted = constructionEvent("construction_episode_started", {
      constructionEventRef: `event://construction/episode-started/${index}`,
      eventSequence: 0,
      startProjectionRef: "construction-projection://start"
    });
    const terminal = terminalDispositionEvent({
      constructionEventRef: `event://construction/terminal/${index}`,
      eventSequence: 1,
      ...terminalCase
    });

    assert.doesNotThrow(() => assertRuntimeEvent(terminal));
    const projection = deriveConstructionEventCalculusProjection({
      episodeId: EPISODE_ID,
      events: [episodeStarted, terminal]
    });
    assert.equal(
      holdsAt(
        projection,
        constructRuntimeFluent({
          name: terminalCase.publicState,
          scope: "construction",
          basisId: BASIS_ID,
          graphFunctionId: GRAPH_FUNCTION_ID,
          runId: RUN_ID,
          workKey: WORK_KEY,
          constraintRef:
            terminalCase.terminalRouteRefs[0] ??
            terminalCase.selectedActionRef ??
            terminalCase.terminalProjectionRef,
          ref: terminalCase.terminalProjectionRef
        })
      ),
      true
    );
    if (terminalCase.publicState === "construction_closed") {
      assert.equal(
        holdsAt(
          projection,
          constructRuntimeFluent({
            name: "construction_episode_open",
            scope: "construction",
            basisId: BASIS_ID,
            graphFunctionId: GRAPH_FUNCTION_ID,
            runId: RUN_ID,
            workKey: WORK_KEY,
            ref: EPISODE_ID
          })
        ),
        false
      );
      assert.equal(
        holdsAt(
          projection,
          constructRuntimeFluent({
            name: "construction_episode_closed",
            scope: "construction",
            basisId: BASIS_ID,
            graphFunctionId: GRAPH_FUNCTION_ID,
            runId: RUN_ID,
            workKey: WORK_KEY,
            constraintRef: terminalCase.terminalProjectionRef,
            ref: EPISODE_ID
          })
        ),
        true
      );
    }
  }
});

test("T-127 terminal construction disposition events reject invalid or orphan authority", () => {
  assert.throws(
    () =>
      assertRuntimeEvent(
        terminalDispositionEvent({
          publicState: "construction_progressing_yield"
        })
      ),
    /publicState/
  );
  assert.throws(
    () =>
      admitConstructionRuntimeEvents({
        episodeId: EPISODE_ID,
        events: [
          terminalDispositionEvent({
            eventSequence: 1
          })
        ]
      }),
    /requires prior construction_episode_started/
  );
  assert.throws(
    () =>
      admitConstructionRuntimeEvents({
        episodeId: EPISODE_ID,
        events: [
          constructionEvent("construction_episode_started", {
            constructionEventRef: "event://construction/episode-started",
            eventSequence: 0,
            startProjectionRef: "construction-projection://start"
          }),
          terminalDispositionEvent({
            eventSequence: 1,
            selectedIntentId: "construction-intent://missing"
          })
        ]
      }),
    /selected intent was not admitted and selected/
  );
  assert.throws(
    () =>
      admitConstructionRuntimeEvents({
        episodeId: EPISODE_ID,
        events: [
          constructionEvent("construction_episode_started", {
            constructionEventRef: "event://construction/episode-started",
            eventSequence: 0,
            startProjectionRef: "construction-projection://start"
          }),
          evaluatorInvoked(),
          candidateReturned(),
          constructionEvent("construction_intent_candidate_admitted", {
            constructionEventRef: "event://construction/candidate-admitted",
            eventSequence: 5,
            candidateId: "candidate://t127/1",
            admissionRef: "admission://t127/1",
            intentId: "construction-intent://t127/1",
            authorityRefs: ["authority://t127"]
          }),
          constructionEvent("construction_intent_selected", {
            constructionEventRef: "event://construction/intent-selected",
            eventSequence: 6,
            intentId: "construction-intent://t127/1",
            selectedActionRef: "action://repair/site",
            selectedBindingRef: "binding://t127/1",
            selectionPolicyRef: "policy://priority/default"
          }),
          terminalDispositionEvent({
            eventSequence: 7,
            selectedIntentId: "construction-intent://t127/1",
            selectedActionRef: "action://review/required"
          })
        ]
      }),
    /selected action contradicts selected intent/
  );
});
