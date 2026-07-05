// Validates: T-167

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "../../build/semantic/code/src/index.js";
import * as publicAbgRequirements from "../../build/semantic/code/src/abg/requirements/index.js";
import * as publicGtlRequirements from "../../build/semantic/code/src/gtl/requirements/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";
import {
  REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
  assertRequirementRouteReplayArtifact,
  sha256Text,
  stableJson,
  writeRequirementRouteReplayArtifact
} from "./support/requirements-route-replay-artifact.mjs";

const TEST_ENV_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t167_non_closed_requirements_route_replay_artifact"
);
const T167_REQUIREMENT_ID = "REQ-T167-NON-CLOSED-ROUTE";
const T167_REQUIREMENT_SOURCE_TEXT = [
  "Produce a lifecycle candidate with an explicitly unresolved verification gap.",
  "The candidate may be admitted as evidence, but it shall not close.",
  "The evaluator shall preserve residual pressure and require continuation."
].join("\n");

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, "non-closed-requirement.txt");
  await writeFile(sourcePath, T167_REQUIREMENT_SOURCE_TEXT, "utf8");
  return Object.freeze({
    sourcePath,
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(T167_REQUIREMENT_SOURCE_TEXT)
  });
}

function firstTraversalBasis(basis) {
  return Object.freeze({
    ...basis,
    startIntent: Object.freeze({
      ...basis.startIntent,
      until: "first_traversal"
    })
  });
}

function routeEdgeForBasisVector(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  return Object.freeze({
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex,
    edge: `${vector.source.map((node) => node.id).join("+")}->${vector.target.id}`
  });
}

function t167RouteBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t167/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: T167_REQUIREMENT_ID,
    termKind: "atom",
    stableId: T167_REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t167/non-closed-route"],
    evidencePolicyRefs: ["policy://t167/non-closed-evidence"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRefs: [vector.id],
    vectorIndexes: [vectorIndex],
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id
  });
  const constraintScope = [
    "The route must admit candidate evidence but preserve the unresolved gap.",
    "ABG must emit fold, residual, continuation, and disposition truth."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t167/non-closed-route",
        originStage: "requirements",
        constraintScope,
        digest: sha256(constraintScope),
        promotionPolicyRef: "policy://t167/non-closed-evidence",
        appliesToRefs: [T167_REQUIREMENT_ID, spanId]
      })
    ]
  });
}

function fpDispatchContract(ref) {
  return publicRoot.constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fpEvaluatorContract(ref) {
  return publicRoot.constructEnginePluginContract({
    ref,
    pluginKind: "fp_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpEvaluationOutcome"
  });
}

function fulfilledTransformArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["t167_candidate_admitted"];
  return Object.freeze({
    edge: input.edge,
    actor: "installed-proof",
    candidate: Object.freeze({
      kind: "non_closed_lifecycle_candidate",
      summary: "candidate admitted with unresolved verification gap"
    }),
    fulfillment_assessments: assessmentIds.map((assessmentId) =>
      Object.freeze({
        id: assessmentId,
        evaluator: assessmentId,
        fulfillment_status: "fulfilled",
        fulfillment_detail: "candidate artifact admitted for evaluation",
        blocking_reasons: [],
        evidence_refs: [`proof://t167/transform/${assessmentId}`]
      })
    ),
    selected_worker_id: "worker://t167/installed",
    selected_backend: "backend://node",
    role_id: "role://t167",
    assignment_source: "installed_proof",
    resolved_runtime_ref: "runtime://typescript/node"
  });
}

function fpDispatchPlugin() {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t167/non-closed/fp-dispatch"),
    dispatch(input) {
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t167/non-closed/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: fulfilledTransformArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function partialFpEvaluatorPlugin(options = {}) {
  const scenario = options.scenario ?? "continuation";
  const closeDisposition = options.closeDisposition ?? "no_close";
  const continuationRefs =
    options.continuationRefs ??
    [`continuation://t167/non-closed/${scenario}`];
  const diagnosticRefs =
    options.diagnosticRefs ?? [`diagnostic://t167/non-closed/${scenario}`];
  return Object.freeze({
    contract: fpEvaluatorContract(`plugin://t167/non-closed/fp-evaluator/${scenario}`),
    evaluate(input) {
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: "partial",
        findings: [
          publicRoot.constructFpEvaluationFinding({
            findingRef: `finding://t167/non-closed/${input.vectorIndex}`,
            evaluatorRef: input.contract.ref,
            gainReportRef: `gain://t167/non-closed/${input.vectorIndex}`,
            metricRefs: [`metric://t167/non-closed/${input.vectorIndex}`],
            closeDisposition,
            residualPressureRefs: [
              `pressure://t167/non-closed/${scenario}/${input.vectorIndex}`
            ],
            continuationRefs,
            evidenceRefs: [
              `evidence://t167/non-closed/${scenario}/fp-evaluation/${input.vectorIndex}`
            ],
            authorityRefs: Object.freeze([
              ...new Set([
                ...input.expectedAssessmentIds,
                `authority://t167/non-closed/${scenario}/${input.vectorIndex}`
              ])
            ]),
            compositionContributionRef:
              input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
            compositionRef: input.selectedCompositionRef,
            compositionDigest: input.selectedCompositionDigest,
            diagnosticRefs
          })
        ],
        evidenceRefs: [input.sourceProjectionRef],
        reason: "installed proof intentionally preserves residual pressure"
      });
    }
  });
}

function routeRuntimeEvents(result) {
  return result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

function routeEventsByPayloadKind(routeEvents, kind) {
  return routeEvents.filter((event) => event.routePayloadKind === kind);
}

function firstDispositionEvent(routeEvents) {
  const dispositionEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  )[0];
  assert.equal(typeof dispositionEvent, "object");
  return dispositionEvent;
}

async function runT167DispositionScenario(input) {
  const runRoot = path.join(TEST_RUNS_ROOT, `${input.scenario}_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: `dispatch://t167/non-closed/${input.scenario}`,
      runId: `run://t167/non-closed/${input.scenario}`
    })
  );
  const requirementRouteDeclarationBundle = t167RouteBundleForBasis(
    basis,
    0,
    requirementSource
  );
  const sinkEvents = [];
  const result = await publicRoot.runEngineIterateAsync({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fpEvaluator: partialFpEvaluatorPlugin({
        scenario: input.scenario,
        closeDisposition: input.closeDisposition,
        continuationRefs: input.continuationRefs ?? Object.freeze([]),
        diagnosticRefs: input.diagnosticRefs
      })
    },
    requirementRouteDeclarationBundle
  });
  const routeEvents = routeRuntimeEvents(result);
  const dispositionEvent = firstDispositionEvent(routeEvents);
  assert.equal(
    dispositionEvent.requirementPayload.disposition,
    input.expectedDisposition
  );
  assert.equal(
    sinkEvents.some((event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_lifecycle_disposition"
    ),
    true
  );
  return Object.freeze({
    runRoot,
    requirementSource,
    basis,
    sinkEvents,
    result,
    routeEvents,
    dispositionEvent
  });
}

function lifecycleStateFromRouteEvents(result, routeEvents, edgeRef) {
  const edge = routeEvents[0]?.edge;
  assert.equal(typeof edge, "string");
  const termEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_term_admitted"
  );
  const contextEvents = routeEventsByPayloadKind(
    routeEvents,
    "authority_context_fragment_admitted"
  );
  const projectionEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_projection_admitted"
  );
  const evidenceEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_evidence_bound"
  );
  const foldEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_fold_projected"
  );
  const residualEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  );
  const dispositionEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  );
  const firstEvent = routeEvents[0];
  const query = Object.freeze({
    kind: "requirement_query_read_model",
    edge: edgeRef,
    contextFragmentRefs: contextEvents.map((event) =>
      event.requirementPayload.fragment.fragmentRef
    ),
    requirementIds: termEvents.map((event) =>
      event.requirementPayload.term.requirementId
    ),
    obligationProjectionRefs: projectionEvents
      .map((event) => event.requirementPayload.projection)
      .filter((projection) => projection.projectionRole === "obligation")
      .map((projection) => projection.projectionRef),
    materializationTargetRefs: projectionEvents
      .map((event) => event.requirementPayload.projection)
      .filter((projection) =>
        projection.projectionRole === "materialization_target"
      )
      .map((projection) => projection.projectionRef),
    executionScheduleRefs: projectionEvents
      .map((event) => event.requirementPayload.projection)
      .filter((projection) =>
        projection.projectionRole === "execution_schedule"
      )
      .map((projection) => projection.projectionRef),
    evidenceRefs: evidenceEvents.map((event) =>
      event.requirementPayload.binding.evidenceRef
    ),
    foldRefs: foldEvents.map((event) =>
      event.requirementPayload.fold.foldRef
    ),
    residualRefs: residualEvents.map((event) =>
      event.requirementPayload.residual.residualRef
    ),
    attenuation: "escalated",
    assuranceClaimRefs: []
  });
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query,
    dispositionRefs: dispositionEvents.map((event) => event.routePayloadRef),
    runtimeEvents: result.replayEvents
  });
  assert.equal(lifecycleState.status, "accepted");
  return lifecycleState.value;
}

function minimalClosedRouteEvents() {
  const requirementId = "REQ-T167-CLOSED-ONLY-NEGATIVE";
  const projectionRef = "requirement-projection://t167/closed-only";
  const bindingRef = "requirement-evidence-binding://t167/closed-only";
  const foldRef = "requirement-fold://t167/closed-only";
  const dispositionRef = "requirement-lifecycle-disposition://t167/closed-only";
  const routeEvent = (routePayloadKind, routePayloadRef, requirementPayload) =>
    Object.freeze({
      kind: "requirement_route_fact_projected",
      eventRef: `runtime-event://t167/${routePayloadKind}`,
      routeEventRef: `runtime-event://t167/${routePayloadKind}`,
      routePayloadKind,
      routePayloadRef,
      requirementPayload
    });
  return Object.freeze([
    routeEvent(
      "requirement_term_admitted",
      requirementId,
      Object.freeze({
        kind: "requirement_term_admitted",
        eventRef: "requirement-event://t167/term",
        term: Object.freeze({
          requirementId,
          sourceRef: "specification://t167/closed-only",
          sourceDigest: "sha256:t167-closed-only"
        })
      })
    ),
    routeEvent(
      "requirement_projection_admitted",
      projectionRef,
      Object.freeze({
        kind: "requirement_projection_admitted",
        eventRef: "requirement-event://t167/projection",
        projection: Object.freeze({
          projectionRef,
          requirementId,
          projectionRole: "obligation"
        })
      })
    ),
    routeEvent(
      "requirement_evidence_bound",
      bindingRef,
      Object.freeze({
        kind: "requirement_evidence_bound",
        eventRef: "requirement-event://t167/evidence",
        binding: Object.freeze({
          bindingRef,
          evidenceRef: "evidence://t167/closed-only",
          requirementId,
          bindingStatus: "admitted"
        })
      })
    ),
    routeEvent(
      "requirement_fold_projected",
      foldRef,
      Object.freeze({
        kind: "requirement_fold_projected",
        eventRef: "requirement-event://t167/fold",
        fold: Object.freeze({
          foldRef,
          requirementId,
          state: "satisfied",
          residualPressureRefs: []
        })
      })
    ),
    routeEvent(
      "requirement_lifecycle_disposition",
      dispositionRef,
      Object.freeze({
        kind: "requirement_lifecycle_disposition",
        dispositionRef,
        disposition: "closed",
        residualRefs: [],
        continuationRefs: ["runtime-continuation-transition://t167/closed"],
        reentryRefs: [],
        policyRefs: []
      })
    )
  ]);
}

test("T-167 installed proof publishes non-closed route replay artifact", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t167/non-closed",
      runId: "run://t167/non-closed"
    })
  );
  const requirementRouteDeclarationBundle = t167RouteBundleForBasis(
    basis,
    0,
    requirementSource
  );
  const sinkEvents = [];

  const result = await publicRoot.runEngineIterateAsync({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fpEvaluator: partialFpEvaluatorPlugin()
    },
    requirementRouteDeclarationBundle
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");

  const routeEvents = routeRuntimeEvents(result);
  for (const kind of REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS) {
    assert.equal(
      routeEvents.some((event) => event.routePayloadKind === kind),
      true,
      `missing route event ${kind}`
    );
  }

  const foldEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_fold_projected"
  )[0];
  assert.equal(foldEvent.requirementPayload.fold.state, "partial");
  const residualEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  )[0];
  assert.equal(
    residualEvent.requirementPayload.residual.pressureClass,
    "missing_execution_evidence"
  );
  assert.equal(
    residualEvent.requirementPayload.residual.requirementId,
    T167_REQUIREMENT_ID
  );
  const dispositionEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  )[0];
  assert.equal(
    dispositionEvent.requirementPayload.disposition,
    "continuation_available"
  );
  assert.equal(dispositionEvent.requirementPayload.residualRefs.length, 1);
  assert.equal(
    dispositionEvent.requirementPayload.continuationRefs[0].startsWith(
      "runtime-continuation-transition:"
    ),
    true
  );
  assert.equal(
    result.emittedEvents.some((event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_residual_projected"
    ),
    true
  );
  assert.equal(
    sinkEvents.some((event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_lifecycle_disposition"
    ),
    true
  );

  const lifecycleState = lifecycleStateFromRouteEvents(
    result,
    routeEvents,
    routeEdgeForBasisVector(basis, 0)
  );
  assert.deepEqual(
    lifecycleState.dispositionRefs,
    routeEventsByPayloadKind(
      routeEvents,
      "requirement_lifecycle_disposition"
    ).map((event) => event.routePayloadRef)
  );
  assert.equal(
    lifecycleState.requirementQuery.residualRefs.includes(
      residualEvent.requirementPayload.residual.residualRef
    ),
    true
  );

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    ticket: "T-167",
    requiredPayloadKinds: REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
    runRoot,
    source: Object.freeze({
      proofTicket: "T-167",
      proofCommand: "npm run test:t167",
      sourceRunKind: "installed_non_closed_requirements_route",
      proofRunRoot: runRoot,
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest
    }),
    replayEvents: result.replayEvents,
    emittedEvents: result.emittedEvents,
    sinkEvents,
    lifecycleState
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact, {
    requiredPayloadKinds: REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS
  });
  assert.equal(replayArtifact.artifact.ticket, "T-167");
  assert.equal(replayArtifact.manifest.ticket, "T-167");
  assert.equal(
    replayArtifact.manifest.artifact.sha256,
    sha256Text(stableJson(replayArtifact.artifact))
  );
  assert.equal(
    replayArtifact.manifest.artifact.requiredPayloadKinds.includes(
      "requirement_residual_projected"
    ),
    true
  );

  const artifactOnDisk = JSON.parse(await readFile(replayArtifact.artifactPath, "utf8"));
  assert.equal(
    artifactOnDisk.routeEvents.some((event) =>
      event.routePayloadKind === "requirement_residual_projected"
    ),
    true
  );
});

test("T-167 runner emits blocked requirement disposition from terminal block truth", async () => {
  const { result, dispositionEvent } = await runT167DispositionScenario({
    scenario: "blocked",
    closeDisposition: "block",
    expectedDisposition: "blocked"
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepEqual(dispositionEvent.requirementPayload.continuationRefs, []);
  assert.deepEqual(dispositionEvent.requirementPayload.reentryRefs, []);
  assert.equal(dispositionEvent.requirementPayload.residualRefs.length, 1);
});

test("T-167 runner emits reentry_available from admitted requirements reprice truth", async () => {
  const { result, dispositionEvent } = await runT167DispositionScenario({
    scenario: "reentry",
    closeDisposition: "reprice",
    expectedDisposition: "reentry_available"
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepEqual(dispositionEvent.requirementPayload.continuationRefs, []);
  assert.deepEqual(dispositionEvent.requirementPayload.reentryRefs, [
    "graph-reentry-point:requirements"
  ]);
  assert.equal(dispositionEvent.requirementPayload.residualRefs.length, 1);
});

test("T-167 rejects closed-only route artifacts as non-closed proof", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `negative_${timestampId()}`);
  await assert.rejects(
    writeRequirementRouteReplayArtifact({
      ticket: "T-167",
      requiredPayloadKinds: REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
      runRoot,
      source: Object.freeze({
        proofTicket: "T-167",
        sourceRunKind: "negative_closed_only"
      }),
      replayEvents: minimalClosedRouteEvents(),
      emittedEvents: [],
      sinkEvents: [],
      lifecycleState: Object.freeze({
        kind: "requirement_lifecycle_state_read_model",
        dispositionRefs: ["requirement-lifecycle-disposition://t167/closed-only"]
      })
    }),
    /missing route payload kind requirement_residual_projected/u
  );
});
