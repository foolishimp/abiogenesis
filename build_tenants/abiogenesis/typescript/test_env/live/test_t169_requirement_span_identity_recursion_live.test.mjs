// Validates: T-169 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicAbgRequirements from "@abiogenesis/typescript-tenant/abg/requirements";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  REQUIRED_SPAN_LINEAGE_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
  assertRequirementRouteReplayArtifact,
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import {
  assessmentFor,
  buildSchedule,
  constitutionalGapRow,
  constitutionalReentry,
  fulfilledRow,
  materializeEvents,
  spanBySource
} from "../tests/support/t103-graph-span-fixtures.mjs";
import { canonicalRuntimeEvents } from "../tests/support/canonical-runtime-events.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t169_requirement_span_identity_recursion_live"
);

const REQUIREMENT_ID = "REQ-T169-LIVE-SPAN-LINEAGE";
const REQUIREMENT_SOURCE_TEXT = [
  "Preserve requirement span identity across parent frame, child frame, zoom, foldback, and re-entry.",
  "Residual pressure shall keep the original span ref and foldback lineage.",
  "Downstream products shall consume replay-derived span lineage instead of local span maps."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T169_SPAN_LINEAGE_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000;
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`live F_P span evaluator did not return JSON: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, "span-lineage-requirement.txt");
  await writeFile(sourcePath, REQUIREMENT_SOURCE_TEXT, "utf8");
  return Object.freeze({
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(REQUIREMENT_SOURCE_TEXT),
    text: REQUIREMENT_SOURCE_TEXT
  });
}

function routeEdgeForBasisVector(basis, vectorIndex, runtimeEvents = []) {
  const vector = basis.graph.vectors[vectorIndex];
  const edge = vector.name;
  const frameRefs = [
    basis.frameId ?? `frame:${basis.id}:root`,
    ...runtimeEvents
      .filter((event) => event.kind === "frame_opened" && event.basisId === basis.id)
      .map((event) => event.frameId)
  ];
  const zoomRefs = runtimeEvents.flatMap((event) =>
    event.basisId === basis.id &&
    (event.kind === "zoom_frame_opened" || event.kind === "zoom_foldback_evaluated") &&
    event.vectorIndex === vectorIndex
      ? [event.zoomFrameId]
      : []
  );
  const foldbackRefs = runtimeEvents.flatMap((event) => {
    if (
      event.basisId === basis.id &&
      event.kind === "graph_span_foldback_evaluated" &&
      event.terminalVectorIndex >= vectorIndex
    ) {
      return [
        event.foldbackRef,
        ...event.edgeFoldbackRefs,
        ...event.causingEdgeFoldbackRefs
      ];
    }
    if (
      event.basisId === basis.id &&
      event.kind === "zoom_foldback_evaluated" &&
      event.vectorIndex === vectorIndex
    ) {
      return [event.foldbackRef];
    }
    return [];
  });
  return Object.freeze({
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex,
    edge,
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id,
    frameRefs: [...new Set(frameRefs)],
    zoomRefs: [...new Set(zoomRefs)],
    foldbackRefs: [...new Set(foldbackRefs)],
    aliasRefs: [edge]
  });
}

function runtimeScopeForBasisVector(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  return mintRuntimeScopeRef({
    runRef: basis.id,
    graphCallRef: `graph-call:${basis.id}`,
    frameRef: basis.frameId ?? `frame:${basis.id}:root`,
    continuationRef: null,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    spanRef: vector.id
  });
}

function routeContextForBundle(basis, bundle, runtimeEvents = []) {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle,
    runtimeScope: runtimeScopeForBasisVector(basis, 0),
    edges: basis.graph.vectors.map((_, vectorIndex) =>
      routeEdgeForBasisVector(basis, vectorIndex, runtimeEvents)
    )
  });
  assert.equal(context.status, "accepted");
  return context.value;
}

function buildGraphSpanReentryProof(basis) {
  const schedule = publicRoot.deriveEndpointSpanSchedule({
    basis,
    terminalVectorIndex: 2,
    closedVectorIndexes: [0, 1, 2],
    generation: 0
  });
  const reentry = constitutionalReentry({
    changeClass: "requirement_reprice",
    reEntryPoint: "requirements",
    routeContractRefs: ["route-contract://t169/live/span-lineage"],
    authorityRefs: ["ticket://T-169", REQUIREMENT_ID],
    rationale: "child-frame foldback shows the original span remains active at requirement re-entry"
  });
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t169/live/child-terminal-fulfilled",
      rows: [fulfilledRow("T169-CHILD-TERMINAL")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t169/live/child-frame-fulfilled",
      rows: [fulfilledRow("T169-CHILD-FRAME")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t169/live/parent-requirement-reentry",
      rows: [constitutionalGapRow(REQUIREMENT_ID)],
      constitutionalReentry: reentry
    })
  ];
  const foldback = publicRoot.foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = publicRoot.deriveGraphReentryFrontierProjection({
    basis,
    events
  });
  const plan = publicRoot.deriveGraphReentryPlan({
    basis,
    runtimeProjection: publicRoot.deriveRuntimeAggregateProjection(basis, events),
    frontier
  });
  assert.ok(plan);
  const reentryAppliedEvents = Object.freeze([
    publicRoot.constructGraphReentryPlannedEvent({ basis, plan }),
    publicRoot.constructGraphReentryAppliedEvent({ basis, plan })
  ]);
  const childFrameBasis = Object.freeze({
    ...basis,
    frameId: `frame:${basis.id}:child`,
    frameLineageId: `frame-lineage:${basis.id}:child`
  });
  const childFrameEvent = publicRoot.constructFrameOpenedEvent(childFrameBasis);
  const zoomFrame = Object.freeze({
    kind: "zoom_frame",
    zoomFrameId: `zoom:${basis.id}:child-detail`,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    vectorIndex: 0,
    edge: routeEdgeForBasisVector(basis, 0).edge,
    inputAssetRef: "asset://t169/live/parent",
    outputAssetRef: "asset://t169/live/child",
    ledgerRef: "ledger://t169/live/zoom",
    scheduleRef: "schedule://t169/live/zoom"
  });
  const zoomFrameEvent = publicRoot.constructZoomFrameOpenedEvent({
    basis,
    zoomFrame
  });
  const runtimeEvents = Object.freeze([
    childFrameEvent,
    zoomFrameEvent,
    ...events,
    ...reentryAppliedEvents
  ]);
  assert.equal(foldback.decision, "constitutional_reentry");
  assert.equal(frontier.activeReEntryPoint, "requirements");
  assert.equal(
    publicRoot.deriveGraphReentryFrontierProjection({
      basis,
      events: runtimeEvents
    }).activeReEntryPoint,
    null
  );
  return Object.freeze({
    schedule,
    assessments,
    foldback,
    events,
    runtimeEvents,
    frontier,
    childFrameEvent,
    zoomFrameEvent
  });
}

function t169LiveBundle(input) {
  const spanId = "span://t169/live/parent-child-foldback";
  const vectors = input.basis.graph.vectors;
  const firstVector = vectors[0];
  const terminalVector = vectors[2];
  const emittedEdgeLineage = routeEdgeForBasisVector(
    input.basis,
    0,
    input.graphSpanRuntimeEvents
  );
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: input.requirementSource.sourceRef,
    sourceDigest: input.requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t169/live-span-lineage"],
    evidencePolicyRefs: ["policy://t169/live-span-lineage"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: input.basis.graphFunction.id,
    graphVectorRefs: vectors.map((vector) => vector.id),
    vectorIndexes: [0, 1, 2],
    sourceNodeRef: firstVector.source[0].id,
    targetNodeRef: terminalVector.target.id,
    frameRefs: emittedEdgeLineage.frameRefs,
    zoomRefs: emittedEdgeLineage.zoomRefs,
    foldbackRefs: emittedEdgeLineage.foldbackRefs,
    aliasRefs: [
      emittedEdgeLineage.edge,
      ...vectors.flatMap((vector) => [
        ...vector.source.map((node) => node.id),
        vector.target.id
      ])
    ]
  });
  const constraintScope = [
    "The live evaluator must preserve requirement span identity across child frame and foldback.",
    "The re-entry frontier is ABG replay truth and downstream products must not create local span maps."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t169/live-span-lineage",
        originStage: "requirements",
        constraintScope,
        digest: sha256(constraintScope),
        promotionPolicyRef: "policy://t169/live-span-lineage",
        appliesToRefs: [REQUIREMENT_ID, spanId, input.graphSpanProof.foldback.foldbackRef]
      })
    ]
  });
}

function fpDispatchContract(ref) {
  return publicRoot.constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fpEvaluatorContract(ref) {
  return publicRoot.constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpEvaluationOutcome"
  });
}

function dispatchPlugin(graphSpanProof) {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t169/live/fp-dispatch"),
    dispatch(input) {
      const assessmentIds =
        input.expectedAssessmentIds.length > 0
          ? input.expectedAssessmentIds
          : ["t169_span_lineage_candidate"];
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t169/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: input.edge,
          actor: "installed-fixture",
          spanLineageCandidate: Object.freeze({
            parentFrameRef: "frame://t169/live/parent",
            childFrameRef: "frame://t169/live/child",
            foldbackRef: graphSpanProof.foldback.foldbackRef,
            reEntryPoint: graphSpanProof.frontier.activeReEntryPoint
          }),
          fulfillment_assessments: assessmentIds.map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "span-lineage candidate admitted for live evaluator assessment",
              blocking_reasons: [],
              evidence_refs: [`proof://t169/live/${id}`]
            })
          ),
          selected_worker_id: "worker://t169/live-dispatch-fixture",
          selected_backend: "backend://node",
          role_id: "role://t169/live",
          assignment_source: "installed_fixture",
          resolved_runtime_ref: "runtime://typescript/node"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function evaluatorPrompt(input) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P evaluator for ABI T-169 span identity across recursion.",
    "Assess whether the admitted candidate preserves the requirement span through parent frame, child frame, foldback, and re-entry.",
    "Do not close the requirement; preserve residual pressure for requirement re-entry.",
    "",
    "Requirement source:",
    input.requirementSource.text,
    "",
    "Admitted graph-span frontier:",
    JSON.stringify(input.graphSpanFrontier, null, 2),
    "",
    "Candidate artifact:",
    JSON.stringify(input.candidate, null, 2),
    "",
    "Output contract:",
    "{",
    '  "closeDisposition": "no_close",',
    '  "residualPressureRefs": string[],',
    '  "continuationRefs": string[],',
    '  "evidenceRefs": string[],',
    '  "spanPreserved": true,',
    '  "reason": string',
    "}"
  ].join("\n");
}

function liveEvaluatorPlugin(input) {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t169/live/fp-evaluator"),
    async evaluate(evaluationInput) {
      const candidate = evaluationInput.attachedResultArtifact;
      assert.notEqual(
        candidate,
        null,
        "T-169 live proof requires an admitted dispatch candidate artifact"
      );
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(input.agentKey),
        prompt: evaluatorPrompt({
          requirementSource: input.requirementSource,
          graphSpanFrontier: input.graphSpanProof.frontier,
          candidate
        }),
        cwd: input.runRoot,
        archiveRoot: input.runRoot,
        label: "t169-requirement-span-lineage-live-fp-evaluator",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(input.runRoot, "t169-live-evaluator-output.txt"),
        promptPath: path.join(input.runRoot, "t169-live-evaluator-prompt.txt"),
        stdoutPath: path.join(input.runRoot, "t169-live-evaluator-stdout.log"),
        stderrPath: path.join(input.runRoot, "t169-live-evaluator-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const assessment = extractJsonObject(transport.text);
      assert.equal(assessment.closeDisposition, "no_close");
      assert.equal(assessment.spanPreserved, true);
      assert.equal(Array.isArray(assessment.residualPressureRefs), true);
      assert.equal(assessment.residualPressureRefs.length > 0, true);
      const evidenceRefs =
        Array.isArray(assessment.evidenceRefs) &&
        assessment.evidenceRefs.length > 0
          ? assessment.evidenceRefs
          : [`evidence://t169/live/${evaluationInput.vectorIndex}`];
      const continuationRefs =
        Array.isArray(assessment.continuationRefs) &&
        assessment.continuationRefs.length > 0
          ? assessment.continuationRefs
          : [`continuation://t169/live/${evaluationInput.vectorIndex}`];
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: "partial",
        findings: [
          publicRoot.constructFpEvaluationFinding({
            findingRef: `finding://t169/live/${evaluationInput.vectorIndex}`,
            evaluatorRef: evaluationInput.contract.ref,
            gainReportRef: `gain://t169/live/${evaluationInput.vectorIndex}`,
            metricRefs: [`metric://t169/live/${evaluationInput.vectorIndex}`],
            closeDisposition: "no_close",
            residualPressureRefs: assessment.residualPressureRefs,
            continuationRefs,
            evidenceRefs,
            authorityRefs: Object.freeze([
              REQUIREMENT_ID,
              input.graphSpanProof.foldback.foldbackRef,
              input.graphSpanProof.frontier.activeReEntryPoint
            ]),
            compositionContributionRef:
              evaluationInput.selectedRegimeBindingRef ??
              evaluationInput.selectedCompositionRef,
            compositionRef: evaluationInput.selectedCompositionRef,
            compositionDigest: evaluationInput.selectedCompositionDigest,
            diagnosticRefs: ["diagnostic://t169/live/span-lineage-preserved"]
          })
        ],
        evidenceRefs: [evaluationInput.sourceProjectionRef],
        reason: assessment.reason
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

test("T-169 live F_P worker preserves recursive span lineage into replay artifact", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T169_SPAN_LINEAGE_LIVE=1 or CODEX_LIVE_FP=1 to run T-169 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const { basis: scheduledBasis } = buildSchedule({
    runId: "run://t169/live-span-lineage",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t169/live-span-lineage"
  });
  const graphSpanProof = buildGraphSpanReentryProof(scheduledBasis);
  const graphSpanRuntimeEvents = canonicalRuntimeEvents(graphSpanProof.runtimeEvents);
  const basis = scheduledBasis;
  const bundle = t169LiveBundle({
    basis,
    requirementSource,
    graphSpanProof,
    graphSpanRuntimeEvents
  });
  const routeContext = routeContextForBundle(
    basis,
    bundle,
    graphSpanRuntimeEvents
  );
  const sinkEvents = [];
  const result = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: dispatchPlugin(graphSpanProof),
      fpEvaluator: liveEvaluatorPlugin({
        agentKey,
        runRoot,
        requirementSource,
        graphSpanProof
      })
    },
    runtimeEvents: graphSpanRuntimeEvents,
    requirementRouteDeclarationBundle: bundle
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  const routeEvents = routeRuntimeEvents(result);
  const routePayloadKinds = routeEvents.map((event) => event.routePayloadKind);
  for (const kind of REQUIRED_SPAN_LINEAGE_REQUIREMENT_ROUTE_PAYLOAD_KINDS) {
    assert.equal(
      routeEvents.some((event) => event.routePayloadKind === kind),
      true,
      `missing route event ${kind}; saw ${routePayloadKinds.join(", ")}`
    );
  }

  const traversalSpan = routeEventsByPayloadKind(
    routeEvents,
    "traversal_span_admitted"
  )[0].requirementPayload.span;
  assert.equal(traversalSpan.spanId, "span://t169/live/parent-child-foldback");
  assert.equal(
    traversalSpan.foldbackRefs.includes(graphSpanProof.foldback.foldbackRef),
    true
  );
  assert.equal(
    traversalSpan.frameRefs.includes(graphSpanProof.childFrameEvent.frameId),
    true
  );
  assert.equal(
    traversalSpan.zoomRefs.includes(graphSpanProof.zoomFrameEvent.zoomFrameId),
    true
  );

  const edge = routeEdgeForBasisVector(basis, 0, graphSpanRuntimeEvents);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: routeContext.ledger,
    edge
  });
  const spanLineage = publicAbgRequirements.projectSpanLineage({
    ledger: routeContext.ledger,
    environment
  });
  assert.equal(spanLineage.length > 0, true);
  assert.equal(spanLineage[0].spanId, traversalSpan.spanId);
  assert.equal(
    spanLineage[0].foldbackRefs.includes(graphSpanProof.foldback.foldbackRef),
    true
  );

  const residualEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  )[0];
  assert.equal(residualEvent.requirementPayload.residual.spanId, traversalSpan.spanId);
  const dispositionEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  )[0];
  assert.equal(dispositionEvent.requirementPayload.residualRefs.length > 0, true);
  assert.equal(
    dispositionEvent.requirementPayload.disposition,
    "continuation_available"
  );

  const contextEvents = routeEventsByPayloadKind(
    routeEvents,
    "authority_context_fragment_admitted"
  );
  const termEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_term_admitted"
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
  const requirementQuery = Object.freeze({
    kind: "requirement_query_read_model",
    edge: edge.edge,
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
    query: requirementQuery,
    dispositionRefs: [dispositionEvent.routePayloadRef],
    runtimeEvents: result.replayEvents
  });
  assert.equal(lifecycleState.status, "accepted");

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    ticket: "T-169",
    requiredPayloadKinds: REQUIRED_SPAN_LINEAGE_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
    runRoot,
    source: Object.freeze({
      proofTicket: "T-169",
      proofCommand: "npm run test:t169:live",
      sourceRunKind: "live_fp_requirement_span_lineage_recursion",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      requirementId: REQUIREMENT_ID,
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest,
      graphSpanFoldbackRef: graphSpanProof.foldback.foldbackRef,
      graphSpanReEntryPoint: graphSpanProof.frontier.activeReEntryPoint
    }),
    replayEvents: result.replayEvents,
    emittedEvents: result.emittedEvents,
    sinkEvents,
    lifecycleState: Object.freeze({
      ...lifecycleState.value,
      spanLineage,
      graphSpanReplay: Object.freeze({
        events: graphSpanProof.events,
        foldback: graphSpanProof.foldback,
        frontier: graphSpanProof.frontier
      })
    })
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact, {
    requiredPayloadKinds: REQUIRED_SPAN_LINEAGE_REQUIREMENT_ROUTE_PAYLOAD_KINDS
  });
});
