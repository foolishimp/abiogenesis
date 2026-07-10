// Validates: T-168 live closure gate

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
  REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
  assertRequirementRouteReplayArtifact,
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t168_requirement_graph_refinement_live"
);
const PARENT_REQUIREMENT_ID = "REQ-T168-LIVE-PARENT";
const CHILD_ONE_REQUIREMENT_ID = "REQ-T168-LIVE-CHILD-PROGRAM";
const CHILD_TWO_REQUIREMENT_ID = "REQ-T168-LIVE-CHILD-PROOF";

function liveEnabled() {
  return process.env["ABG_TS_T168_REFINEMENT_LIVE"] === "1" ||
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

async function writeRequirementSource(runRoot, requirementId, text) {
  const sourcePath = path.join(runRoot, `${requirementId}.txt`);
  await writeFile(sourcePath, text, "utf8");
  return Object.freeze({
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(text),
    text
  });
}

async function writeRequirementSources(runRoot) {
  return Object.freeze({
    parent: await writeRequirementSource(
      runRoot,
      PARENT_REQUIREMENT_ID,
      "Parent capability closes only when both child obligations are satisfied."
    ),
    childOne: await writeRequirementSource(
      runRoot,
      CHILD_ONE_REQUIREMENT_ID,
      "Child obligation one: provide a minimal JavaScript program candidate."
    ),
    childTwo: await writeRequirementSource(
      runRoot,
      CHILD_TWO_REQUIREMENT_ID,
      "Child obligation two: provide independent proof evidence for the candidate."
    )
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
    spanRef: `span://t168-live/${vector.id}`
  });
}

function requirement(input) {
  return publicGtlRequirements.declareRequirement({
    requirementId: input.requirementId,
    termKind: input.termKind,
    stableId: input.requirementId,
    sourceRef: input.source.sourceRef,
    sourceDigest: input.source.sourceDigest,
    relationRefs: input.relationRefs,
    spanRefs: [input.spanId],
    contextRefs: ["fragment://t168/live-refinement"],
    evidencePolicyRefs: ["policy://t168/live-refinement"]
  });
}

function t168LiveRouteBundleForBasis(basis, vectorIndex, sources) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t168-live/${vector.id}`;
  const parentToProgram = "relation://t168/live-parent-to-program";
  const parentToProof = "relation://t168/live-parent-to-proof";
  const parent = requirement({
    requirementId: PARENT_REQUIREMENT_ID,
    termKind: "composition",
    source: sources.parent,
    relationRefs: [parentToProgram, parentToProof],
    spanId
  });
  const childProgram = requirement({
    requirementId: CHILD_ONE_REQUIREMENT_ID,
    termKind: "atom",
    source: sources.childOne,
    relationRefs: [],
    spanId
  });
  const childProof = requirement({
    requirementId: CHILD_TWO_REQUIREMENT_ID,
    termKind: "atom",
    source: sources.childTwo,
    relationRefs: [],
    spanId
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
    "The live evaluator must preserve residual pressure when a child proof obligation is missing.",
    "The parent is an aggregate read model over child fold and residual truth."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [parent, childProgram, childProof],
    relations: [
      publicGtlRequirements.declareRequirementRelation({
        relationId: parentToProgram,
        relationKind: "refinement",
        fromRequirementId: PARENT_REQUIREMENT_ID,
        toRequirementId: CHILD_ONE_REQUIREMENT_ID
      }),
      publicGtlRequirements.declareRequirementRelation({
        relationId: parentToProof,
        relationKind: "refinement",
        fromRequirementId: PARENT_REQUIREMENT_ID,
        toRequirementId: CHILD_TWO_REQUIREMENT_ID
      })
    ],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t168/live-refinement",
        originStage: "requirements",
        constraintScope,
        digest: sha256(constraintScope),
        promotionPolicyRef: "policy://t168/live-refinement",
        appliesToRefs: [
          PARENT_REQUIREMENT_ID,
          CHILD_ONE_REQUIREMENT_ID,
          CHILD_TWO_REQUIREMENT_ID,
          spanId
        ]
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

function syntheticDispatchPlugin() {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t168/live/fp-dispatch"),
    dispatch(input) {
      const assessmentIds =
        input.expectedAssessmentIds.length > 0
          ? input.expectedAssessmentIds
          : ["t168_live_candidate_admitted"];
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t168/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: input.edge,
          actor: "installed-fixture",
          programCandidate: Object.freeze({
            language: "javascript",
            fileName: "hello.js",
            source: "console.log('hello');\n"
          }),
          proofEvidence: null,
          candidateNote: "Program candidate is present; independent proof evidence is intentionally absent.",
          fulfillment_assessments: assessmentIds.map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "candidate admitted for live F_P evaluator assessment",
              blocking_reasons: [],
              evidence_refs: [`proof://t168/live/${id}`]
            })
          ),
          selected_worker_id: "worker://t168/live-dispatch-fixture",
          selected_backend: "backend://node",
          role_id: "role://t168/live",
          assignment_source: "installed_fixture",
          resolved_runtime_ref: "runtime://typescript/node"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function evaluatorPrompt(input, sources, candidate) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P evaluator for ABI T-168 requirement graph refinement.",
    "Assess whether the candidate satisfies the admitted parent and child requirements.",
    "Close only when both child obligations are satisfied by evidence. Preserve residual pressure when proof evidence is missing.",
    "",
    "Admitted requirement graph:",
    `- parent ${PARENT_REQUIREMENT_ID}: ${sources.parent.text}`,
    `- child ${CHILD_ONE_REQUIREMENT_ID}: ${sources.childOne.text}`,
    `- child ${CHILD_TWO_REQUIREMENT_ID}: ${sources.childTwo.text}`,
    `- relations: ${PARENT_REQUIREMENT_ID} refines ${CHILD_ONE_REQUIREMENT_ID}; ${PARENT_REQUIREMENT_ID} refines ${CHILD_TWO_REQUIREMENT_ID}`,
    "",
    "Candidate artifact:",
    JSON.stringify(candidate, null, 2),
    "",
    "Output contract:",
    "{",
    '  "ambiguityStatus": "partial" | "resolved",',
    '  "closeDisposition": "no_close" | "close",',
    '  "residualPressureRefs": string[],',
    '  "continuationRefs": string[],',
    '  "evidenceRefs": string[],',
    '  "reason": string',
    "}",
    "",
    `Evaluation edge: ${input.edge}`
  ].join("\n");
}

function liveEvaluatorPlugin(input) {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t168/live/fp-evaluator"),
    async evaluate(evaluationInput) {
      const candidate = evaluationInput.attachedResultArtifact;
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(input.agentKey),
        prompt: evaluatorPrompt(evaluationInput, input.sources, candidate),
        cwd: input.runRoot,
        archiveRoot: input.runRoot,
        label: "t168-requirement-graph-refinement-live-fp-evaluator",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(input.runRoot, "t168-live-evaluator-output.txt"),
        promptPath: path.join(input.runRoot, "t168-live-evaluator-prompt.txt"),
        stdoutPath: path.join(input.runRoot, "t168-live-evaluator-stdout.log"),
        stderrPath: path.join(input.runRoot, "t168-live-evaluator-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const assessment = extractJsonObject(transport.text);
      assert.equal(assessment.closeDisposition, "no_close");
      assert.equal(assessment.ambiguityStatus, "partial");
      assert.equal(Array.isArray(assessment.residualPressureRefs), true);
      assert.equal(assessment.residualPressureRefs.length > 0, true);
      assert.equal(Array.isArray(assessment.continuationRefs), true);
      assert.equal(assessment.continuationRefs.length > 0, true);
      const evidenceRefs =
        Array.isArray(assessment.evidenceRefs) &&
        assessment.evidenceRefs.length > 0
          ? assessment.evidenceRefs
          : [`evidence://t168/live/${evaluationInput.vectorIndex}`];
      const findingForRequirement = (requirementId) =>
        publicRoot.constructFpEvaluationFinding({
          findingRef: `finding://t168/live/${evaluationInput.vectorIndex}/${requirementId}`,
          evaluatorRef: evaluationInput.contract.ref,
          gainReportRef: `gain://t168/live/${evaluationInput.vectorIndex}/${requirementId}`,
          metricRefs: [`metric://t168/live/${evaluationInput.vectorIndex}/${requirementId}`],
          closeDisposition: "no_close",
          residualPressureRefs: assessment.residualPressureRefs.map((ref) =>
            `${ref}/${requirementId}`
          ),
          continuationRefs: assessment.continuationRefs.map((ref) =>
            `${ref}/${requirementId}`
          ),
          evidenceRefs: evidenceRefs.map((ref) => `${ref}/${requirementId}`),
          authorityRefs: Object.freeze([requirementId]),
          compositionContributionRef:
            evaluationInput.selectedRegimeBindingRef ??
            evaluationInput.selectedCompositionRef,
          compositionRef: evaluationInput.selectedCompositionRef,
          compositionDigest: evaluationInput.selectedCompositionDigest,
          diagnosticRefs: [
            `diagnostic://t168/live/proof-child-missing/${requirementId}`
          ]
        });
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: "partial",
        findings: [
          findingForRequirement(CHILD_ONE_REQUIREMENT_ID),
          findingForRequirement(CHILD_TWO_REQUIREMENT_ID)
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

test("T-168 live F_P evaluator preserves child residual pressure", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T168_REFINEMENT_LIVE=1 or CODEX_LIVE_FP=1 to run T-168 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const sources = await writeRequirementSources(runRoot);
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t168/live-refinement",
      runId: "run://t168/live-refinement"
    })
  );
  const edge = routeEdgeForBasisVector(basis, 0);
  const bundle = t168LiveRouteBundleForBasis(basis, 0, sources);
  const expectedContext = expectedRouteContextForBasis(basis, 0, bundle);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedContext.ledger,
    edge
  });
  const graph = publicAbgRequirements.projectRequirementGraph({
    ledger: expectedContext.ledger,
    environment
  });
  assert.equal(graph.parentChildPairs.length, 2);

  const sinkEvents = [];
  const result = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: syntheticDispatchPlugin(),
      fpEvaluator: liveEvaluatorPlugin({ agentKey, runRoot, sources })
    },
    requirementRouteDeclarationBundle: bundle
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  const routeEvents = routeRuntimeEvents(result);
  for (const kind of REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS) {
    assert.equal(
      routeEvents.some((event) => event.routePayloadKind === kind),
      true,
      `missing route event ${kind}`
    );
  }

  const folds = routeEventsByPayloadKind(
    routeEvents,
    "requirement_fold_projected"
  ).map((event) => event.requirementPayload.fold);
  assert.deepEqual(
    [...new Set(folds.map((fold) => fold.requirementId))].sort(),
    [CHILD_ONE_REQUIREMENT_ID, CHILD_TWO_REQUIREMENT_ID].sort()
  );
  assert.equal(
    folds.some((fold) => fold.requirementId === PARENT_REQUIREMENT_ID),
    false
  );
  assert.equal(folds.every((fold) => fold.state === "partial"), true);

  const residuals = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  ).map((event) => event.requirementPayload.residual);
  assert.equal(residuals.length > 0, true);
  const aggregateStates = publicAbgRequirements.projectAggregateStates({
    ledger: expectedContext.ledger,
    environment,
    folds,
    residuals
  });
  assert.equal(aggregateStates.length, 1);
  assert.equal(aggregateStates[0].requirementId, PARENT_REQUIREMENT_ID);
  assert.equal(aggregateStates[0].state, "partial");

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
  const dispositionRefs = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  ).map((event) => event.routePayloadRef);
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query: requirementQuery,
    dispositionRefs,
    runtimeEvents: result.replayEvents
  });
  assert.equal(lifecycleState.status, "accepted");

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    ticket: "T-168",
    requiredPayloadKinds: REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
    runRoot,
    source: Object.freeze({
      proofTicket: "T-168",
      proofCommand: "npm run test:t168:live",
      sourceRunKind: "live_fp_requirement_graph_refinement",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      parentRequirementId: PARENT_REQUIREMENT_ID,
      childRequirementIds: [
        CHILD_ONE_REQUIREMENT_ID,
        CHILD_TWO_REQUIREMENT_ID
      ]
    }),
    replayEvents: result.replayEvents,
    emittedEvents: result.emittedEvents,
    sinkEvents,
    lifecycleState: Object.freeze({
      ...lifecycleState.value,
      requirementGraph: graph,
      aggregateStates
    })
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact, {
    requiredPayloadKinds: REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS
  });
});
