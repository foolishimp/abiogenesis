// Validates: T-175

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
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";
import {
  REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
  assertRequirementRouteReplayArtifact,
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t175_live_non_closed_requirements_route"
);
const REQUIREMENT_ID = "REQ-T175-LIVE-NON-CLOSED-ROUTE";
const REQUIREMENT_SOURCE_TEXT = [
  "Provide a lifecycle readiness packet for one admitted work item.",
  "The packet must contain an implementation artifact description.",
  "The packet must contain independent verification evidence for the same artifact.",
  "The verification evidence must identify the checked artifact and the observed result."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T175_NON_CLOSED_LIVE"] === "1" ||
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
    throw new Error(`live F_P evaluator did not return a JSON object: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, `${REQUIREMENT_ID}.txt`);
  await writeFile(sourcePath, REQUIREMENT_SOURCE_TEXT, "utf8");
  return Object.freeze({
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(REQUIREMENT_SOURCE_TEXT),
    text: REQUIREMENT_SOURCE_TEXT
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

function runtimeScopeForBasisVector(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  return mintRuntimeScopeRef({
    runRef: basis.id,
    graphCallRef: `graph-call:${basis.id}`,
    frameRef: basis.frameId ?? `frame:${basis.id}:root`,
    continuationRef: null,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    spanRef: `span://t175/${vector.id}`
  });
}

function routeBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t175/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t175/live-readiness-packet"],
    evidencePolicyRefs: ["policy://t175/live-readiness-evidence"]
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
    "The evaluator must decide whether the admitted packet satisfies the requirement.",
    "Missing independent verification evidence preserves residual pressure."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t175/live-readiness-packet",
        originStage: "requirements",
        constraintScope,
        digest: sha256(constraintScope),
        promotionPolicyRef: "policy://t175/live-readiness-evidence",
        appliesToRefs: [REQUIREMENT_ID, spanId]
      })
    ]
  });
}

function expectedRouteContextForBasis(basis, vectorIndex, bundle) {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle,
    runtimeScope: runtimeScopeForBasisVector(basis, vectorIndex),
    edges: [routeEdgeForBasisVector(basis, vectorIndex)]
  });
  assert.equal(context.status, "accepted");
  return context.value;
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

function readinessPacketForScenario(scenario) {
  const base = Object.freeze({
    kind: "lifecycle_readiness_packet",
    implementationArtifact: Object.freeze({
      artifactRef: `artifact://t175/${scenario}/implementation`,
      description: "A deterministic subject artifact exists for the admitted work item."
    })
  });
  if (scenario === "closeable") {
    return Object.freeze({
      ...base,
      verificationEvidence: Object.freeze({
        evidenceRef: "evidence://t175/closeable/verification",
        checkedArtifactRef: "artifact://t175/closeable/implementation",
        verifierRef: "verifier://t175/independent-readiness-check",
        verifierIndependence: "declared separate verifier over the implementation artifact ref",
        method: "digest-and-field-presence-check",
        observedResult: "checkedArtifactRef matched artifact://t175/closeable/implementation and required verification fields were present",
        observedDigest: "sha256:8c7f3cbad4c6e4f65ad094cedcf4fa86c35a1f7c79ad78ec8f1f4454fb0b5f54"
      })
    });
  }
  return Object.freeze({
    ...base,
    verificationEvidence: null,
    gapNote: "The packet identifies an implementation artifact but carries no independent verification evidence."
  });
}

function dispatchPlugin(input) {
  return Object.freeze({
    contract: fpDispatchContract(`plugin://t175/${input.scenario}/fp-dispatch`),
    dispatch(dispatchInput) {
      const assessmentIds =
        dispatchInput.expectedAssessmentIds.length > 0
          ? dispatchInput.expectedAssessmentIds
          : ["readiness_packet_present"];
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t175/${input.scenario}/${encodeURIComponent(dispatchInput.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: dispatchInput.edge,
          actor: "t175-live-proof-subject",
          scenario: input.scenario,
          readinessPacket: input.packet,
          fulfillment_assessments: assessmentIds.map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "readiness packet admitted for live F_P evaluation",
              blocking_reasons: [],
              evidence_refs: [`proof://t175/${input.scenario}/${id}`]
            })
          ),
          selected_worker_id: `worker://t175/${input.scenario}`,
          selected_backend: "backend://node",
          role_id: "role://t175",
          assignment_source: "live_proof_subject",
          resolved_runtime_ref: "runtime://typescript/node"
        }),
        evidenceRefs: [dispatchInput.sourceProjectionRef]
      });
    }
  });
}

function evaluatorPrompt(input) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P evaluator for an ABI requirements-route proof.",
    "Assess the admitted candidate packet against the admitted requirement text.",
    "Select close only when every requirement clause is satisfied by the packet.",
    "Select no_close when a required clause lacks evidence in the packet.",
    "",
    "Admitted requirement:",
    `- requirementId: ${REQUIREMENT_ID}`,
    `- sourceDigest: ${input.requirementSource.sourceDigest}`,
    "  sourceText:",
    ...input.requirementSource.text.split("\n").map((line) => `    ${line}`),
    "",
    "Candidate packet:",
    JSON.stringify(input.packet, null, 2),
    "",
    "Output contract:",
    "{",
    '  "ambiguityStatus": "fulfilled" | "partial",',
    '  "closeDisposition": "close" | "no_close",',
    '  "residualPressureRefs": string[],',
    '  "continuationRefs": string[],',
    '  "evidenceRefs": string[],',
    '  "reason": string',
    "}"
  ].join("\n");
}

function liveEvaluatorPlugin(input) {
  return Object.freeze({
    contract: fpEvaluatorContract(`plugin://t175/${input.scenario}/fp-evaluator`),
    async evaluate(evaluationInput) {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(input.agentKey),
        prompt: evaluatorPrompt(input),
        cwd: input.runRoot,
        archiveRoot: input.runRoot,
        label: `t175-${input.scenario}-live-fp-evaluator`,
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(input.runRoot, `t175-${input.scenario}-evaluator-output.txt`),
        promptPath: path.join(input.runRoot, `t175-${input.scenario}-evaluator-prompt.txt`),
        stdoutPath: path.join(input.runRoot, `t175-${input.scenario}-evaluator-stdout.log`),
        stderrPath: path.join(input.runRoot, `t175-${input.scenario}-evaluator-stderr.log`)
      });
      assert.equal(transport.status, 0, transport.stderr);
      const assessment = extractJsonObject(transport.text);
      input.assessments.push(assessment);
      assert.equal(assessment.closeDisposition, input.expectedCloseDisposition);
      assert.equal(assessment.ambiguityStatus, input.expectedAmbiguityStatus);
      assert.equal(Array.isArray(assessment.evidenceRefs), true);
      const residualPressureRefs =
        input.expectedCloseDisposition === "no_close"
          ? assertNonEmptyRefs(assessment.residualPressureRefs, "residualPressureRefs")
          : [];
      const continuationRefs =
        input.expectedCloseDisposition === "no_close"
          ? assertNonEmptyRefs(assessment.continuationRefs, "continuationRefs")
          : [];
      const evidenceRefs =
        assessment.evidenceRefs.length > 0
          ? assessment.evidenceRefs
          : [`evidence://t175/${input.scenario}/live-evaluation`];
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: input.expectedAmbiguityStatus,
        findings: [
          publicRoot.constructFpEvaluationFinding({
            findingRef: `finding://t175/${input.scenario}/${evaluationInput.vectorIndex}`,
            evaluatorRef: evaluationInput.contract.ref,
            gainReportRef: `gain://t175/${input.scenario}/${evaluationInput.vectorIndex}`,
            metricRefs: [`metric://t175/${input.scenario}/${evaluationInput.vectorIndex}`],
            closeDisposition: input.expectedCloseDisposition,
            residualPressureRefs,
            continuationRefs,
            evidenceRefs,
            authorityRefs: Object.freeze([REQUIREMENT_ID]),
            compositionContributionRef:
              evaluationInput.selectedRegimeBindingRef ??
              evaluationInput.selectedCompositionRef,
            compositionRef: evaluationInput.selectedCompositionRef,
            compositionDigest: evaluationInput.selectedCompositionDigest,
            diagnosticRefs: [`diagnostic://t175/${input.scenario}/live-evaluator`]
          })
        ],
        evidenceRefs: [evaluationInput.sourceProjectionRef],
        reason: assessment.reason
      });
    }
  });
}

function assertNonEmptyRefs(value, fieldName) {
  assert.equal(Array.isArray(value), true, `${fieldName} must be an array`);
  assert.equal(value.length > 0, true, `${fieldName} must be non-empty`);
  for (const ref of value) {
    assert.equal(typeof ref, "string", `${fieldName} entries must be strings`);
  }
  return value;
}

function routeRuntimeEvents(result) {
  return result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

function routeEventsByPayloadKind(routeEvents, kind) {
  return routeEvents.filter((event) => event.routePayloadKind === kind);
}

async function runScenario(input) {
  const runRoot = path.join(TEST_RUNS_ROOT, `${input.scenario}_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: `dispatch://t175/${input.scenario}`,
      runId: `run://t175/${input.scenario}`
    })
  );
  const bundle = routeBundleForBasis(basis, 0, requirementSource);
  const expectedContext = expectedRouteContextForBasis(basis, 0, bundle);
  const edge = routeEdgeForBasisVector(basis, 0);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedContext.ledger,
    edge
  });
  const packet = readinessPacketForScenario(input.scenario);
  const sinkEvents = [];
  const assessments = [];
  const result = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: dispatchPlugin({ scenario: input.scenario, packet }),
      fpEvaluator: liveEvaluatorPlugin({
        agentKey: input.agentKey,
        runRoot,
        scenario: input.scenario,
        packet,
        requirementSource,
        assessments,
        expectedCloseDisposition: input.expectedCloseDisposition,
        expectedAmbiguityStatus: input.expectedAmbiguityStatus
      })
    },
    requirementRouteDeclarationBundle: bundle
  });
  const routeEvents = routeRuntimeEvents(result);
  const folds = routeEventsByPayloadKind(
    routeEvents,
    "requirement_fold_projected"
  ).map((event) => event.requirementPayload.fold);
  assert.equal(folds.length > 0, true);
  assert.equal(folds.every((fold) => fold.requirementId === REQUIREMENT_ID), true);
  if (input.expectedFoldState !== null) {
    assert.equal(folds.every((fold) => fold.state === input.expectedFoldState), true);
  }

  const residuals = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  ).map((event) => event.requirementPayload.residual);
  if (input.expectedResidualCount !== null) {
    assert.equal(residuals.length, input.expectedResidualCount);
  }

  const dispositionEvent = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  )[0];
  assert.equal(typeof dispositionEvent, "object");
  if (input.expectedDisposition !== null) {
    assert.equal(
      dispositionEvent.requirementPayload.disposition,
      input.expectedDisposition
    );
  }

  const evidenceBindings = routeEventsByPayloadKind(
    routeEvents,
    "requirement_evidence_bound"
  ).map((event) => event.requirementPayload.binding);
  const obligations = publicAbgRequirements.projectEdgeObligations({
    ledger: expectedContext.ledger,
    environment
  });
  const attenuation = publicAbgRequirements.classifyAttenuation({
    priorResiduals: [],
    residuals
  });
  const assuranceClaims = publicAbgRequirements.projectAssuranceCase({
    environment,
    folds,
    residuals
  });
  const requirementQuery = publicAbgRequirements.queryRequirementReadModel({
    environment,
    projections: obligations,
    evidenceBindings,
    folds,
    residuals,
    attenuation,
    assuranceClaims
  });
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query: requirementQuery,
    dispositionRefs: routeEventsByPayloadKind(
      routeEvents,
      "requirement_lifecycle_disposition"
    ).map((event) => event.routePayloadRef),
    runtimeEvents: result.replayEvents
  });
  assert.equal(lifecycleState.status, "accepted");
  return Object.freeze({
    runRoot,
    result,
    sinkEvents,
    assessments,
    routeEvents,
    disposition: dispositionEvent.requirementPayload.disposition,
    lifecycleState: lifecycleState.value
  });
}

test("T-175 live route discriminates closed and non-closed requirement evidence", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T175_NON_CLOSED_LIVE=1 or CODEX_LIVE_FP=1 to run T-175 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const closed = await runScenario({
    agentKey,
    scenario: "closeable",
    expectedCloseDisposition: "close",
    expectedAmbiguityStatus: "fulfilled",
    expectedFoldState: null,
    expectedResidualCount: null,
    expectedDisposition: null
  });
  const nonClosed = await runScenario({
    agentKey,
    scenario: "missing_verification",
    expectedCloseDisposition: "no_close",
    expectedAmbiguityStatus: "partial",
    expectedFoldState: "partial",
    expectedResidualCount: 1,
    expectedDisposition: "continuation_available"
  });

  assert.notEqual(
    closed.assessments[0].closeDisposition,
    nonClosed.assessments[0].closeDisposition
  );
  assert.equal(closed.assessments[0].closeDisposition, "close");
  assert.equal(nonClosed.assessments[0].closeDisposition, "no_close");

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    ticket: "T-175",
    requiredPayloadKinds: REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
    runRoot: nonClosed.runRoot,
    source: Object.freeze({
      proofTicket: "T-175",
      supersedesProofTicket: "T-167",
      proofCommand: "npm run test:t175:live",
      sourceRunKind: "live_fp_non_closed_requirements_route",
      proofRunRoot: nonClosed.runRoot,
      liveAgent: agentKey,
      controlCloseDisposition: closed.assessments[0].closeDisposition,
      nonClosedDisposition: nonClosed.disposition,
      requirementId: REQUIREMENT_ID
    }),
    replayEvents: nonClosed.result.replayEvents,
    emittedEvents: nonClosed.result.emittedEvents,
    sinkEvents: nonClosed.sinkEvents,
    lifecycleState: nonClosed.lifecycleState
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact, {
    requiredPayloadKinds: REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS
  });
  assert.equal(
    replayArtifact.manifest.source.sourceRunKind,
    "live_fp_non_closed_requirements_route"
  );
});
