// Validates: T-168
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-014
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-015
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-045
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-046
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-047
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-048

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "../../build/semantic/code/src/index.js";
import * as publicAbgRequirements from "../../build/semantic/code/src/abg/requirements/index.js";
import * as publicGtlRequirements from "../../build/semantic/code/src/gtl/requirements/index.js";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";
import {
  REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
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
  "t168_requirement_graph_refinement"
);
const PARENT_REQUIREMENT_ID = "REQ-T168-PARENT";
const CHILD_ONE_REQUIREMENT_ID = "REQ-T168-CHILD-PROGRAM";
const CHILD_TWO_REQUIREMENT_ID = "REQ-T168-CHILD-PROOF";

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

async function writeRequirementSource(runRoot, requirementId, text) {
  const sourcePath = path.join(runRoot, `${requirementId}.txt`);
  await writeFile(sourcePath, text, "utf8");
  return Object.freeze({
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(text)
  });
}

async function writeRequirementSources(runRoot) {
  return Object.freeze({
    parent: await writeRequirementSource(
      runRoot,
      PARENT_REQUIREMENT_ID,
      "Deliver the minimal route-2 lifecycle capability as two child obligations."
    ),
    childOne: await writeRequirementSource(
      runRoot,
      CHILD_ONE_REQUIREMENT_ID,
      "Child obligation one carries the executable program pressure."
    ),
    childTwo: await writeRequirementSource(
      runRoot,
      CHILD_TWO_REQUIREMENT_ID,
      "Child obligation two carries the evidence and proof pressure."
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
    spanRef: `span://t168/${vector.id}`
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
    contextRefs: ["fragment://t168/route-2-refinement"],
    evidencePolicyRefs: ["policy://t168/refinement-evidence"]
  });
}

function t168RouteBundleForBasis(basis, vectorIndex, sources) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t168/${vector.id}`;
  const parentToProgram = "relation://t168/parent-to-program";
  const parentToProof = "relation://t168/parent-to-proof";
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
    "Route-2 proof must preserve parent-to-child refinement pressure.",
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
        fragmentRef: "fragment://t168/route-2-refinement",
        originStage: "requirements",
        constraintScope,
        digest: sha256(constraintScope),
        promotionPolicyRef: "policy://t168/refinement-evidence",
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

function fpDispatchPlugin() {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t168/refinement/fp-dispatch"),
    dispatch(input) {
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t168/refinement/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: input.edge,
          actor: "installed-proof",
          refinementCandidate: "two child obligations admitted for aggregate proof",
          fulfillment_assessments: input.expectedAssessmentIds.map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "synthetic candidate admitted before partial evaluator",
              blocking_reasons: [],
              evidence_refs: [`proof://t168/${id}`]
            })
          ),
          selected_worker_id: "worker://t168/installed",
          selected_backend: "backend://node",
          role_id: "role://t168",
          assignment_source: "installed_proof",
          resolved_runtime_ref: "runtime://typescript/node"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function partialFpEvaluatorPlugin() {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t168/refinement/fp-evaluator"),
    evaluate(input) {
      const findingForRequirement = (requirementId) =>
        publicRoot.constructFpEvaluationFinding({
          findingRef: `finding://t168/refinement/${input.vectorIndex}/${requirementId}`,
          evaluatorRef: input.contract.ref,
          gainReportRef: `gain://t168/refinement/${input.vectorIndex}/${requirementId}`,
          metricRefs: [`metric://t168/refinement/${input.vectorIndex}/${requirementId}`],
          closeDisposition: "no_close",
          residualPressureRefs: [`pressure://t168/refinement/${input.vectorIndex}/${requirementId}`],
          continuationRefs: [`continuation://t168/refinement/${input.vectorIndex}/${requirementId}`],
          evidenceRefs: [`evidence://t168/refinement/${input.vectorIndex}/${requirementId}`],
          authorityRefs: Object.freeze([requirementId]),
          compositionContributionRef:
            input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
          compositionRef: input.selectedCompositionRef,
          compositionDigest: input.selectedCompositionDigest,
          diagnosticRefs: [`diagnostic://t168/refinement/partial/${requirementId}`]
        });
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: "partial",
        findings: [
          findingForRequirement(CHILD_ONE_REQUIREMENT_ID),
          findingForRequirement(CHILD_TWO_REQUIREMENT_ID)
        ],
        evidenceRefs: [input.sourceProjectionRef],
        reason: "installed proof preserves child residual pressure for aggregate parent"
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

test("T-168 rejects dangling GTL graph declarations before ABG admission", () => {
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId: "span://t168/negative",
    graphFunctionRef: "graph-function://t168/negative",
    graphVectorRefs: ["graph-vector://t168/negative"],
    vectorIndexes: [0],
    sourceNodeRef: "node://t168/source",
    targetNodeRef: "node://t168/target"
  });
  const requirementWithDanglingRelation = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T168-NEGATIVE",
    termKind: "atom",
    stableId: "REQ-T168-NEGATIVE",
    sourceRef: "specification://t168/negative",
    sourceDigest: "sha256:t168-negative",
    relationRefs: ["relation://t168/missing"],
    spanRefs: [span.spanId],
    contextRefs: [],
    evidencePolicyRefs: []
  });
  assert.throws(
    () => publicGtlRequirements.declareBundle({
      requirements: [requirementWithDanglingRelation],
      spans: [span]
    }),
    /dangling ref relation:\/\/t168\/missing/u
  );

  const validRequirement = publicGtlRequirements.declareRequirement({
    ...requirementWithDanglingRelation,
    relationRefs: []
  });
  assert.throws(
    () => publicGtlRequirements.declareBundle({
      requirements: [validRequirement],
      relations: [
        publicGtlRequirements.declareRequirementRelation({
          relationId: "relation://t168/dangling-endpoint",
          relationKind: "refinement",
          fromRequirementId: validRequirement.requirementId,
          toRequirementId: "REQ-T168-MISSING"
        })
      ],
      spans: [span]
    }),
    /dangling ref REQ-T168-MISSING/u
  );
});

test("T-168 projects multi-requirement refinement and aggregate parent state", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const sources = await writeRequirementSources(runRoot);
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t168/refinement",
      runId: "run://t168/refinement"
    })
  );
  const edge = routeEdgeForBasisVector(basis, 0);
  const bundle = t168RouteBundleForBasis(basis, 0, sources);
  const expectedContext = expectedRouteContextForBasis(basis, 0, bundle);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedContext.ledger,
    edge
  });
  assert.deepEqual(
    environment.activeTerms.map((term) => term.requirementId).sort(),
    [
      CHILD_ONE_REQUIREMENT_ID,
      CHILD_TWO_REQUIREMENT_ID,
      PARENT_REQUIREMENT_ID
    ].sort()
  );
  assert.equal(environment.activeRelations.length, 2);

  const graph = publicAbgRequirements.projectRequirementGraph({
    ledger: expectedContext.ledger,
    environment
  });
  assert.deepEqual(graph.rootRequirementIds, [PARENT_REQUIREMENT_ID]);
  assert.deepEqual(
    [...graph.leafRequirementIds].sort(),
    [CHILD_ONE_REQUIREMENT_ID, CHILD_TWO_REQUIREMENT_ID].sort()
  );
  assert.equal(graph.parentChildPairs.length, 2);

  const obligations = publicAbgRequirements.projectEdgeObligations({
    ledger: expectedContext.ledger,
    environment
  });
  assert.deepEqual(
    obligations.map((projection) => projection.requirementId).sort(),
    [CHILD_ONE_REQUIREMENT_ID, CHILD_TWO_REQUIREMENT_ID].sort()
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

  const relationEvents = routeEventsByPayloadKind(
    routeEvents,
    "requirement_relation_admitted"
  );
  assert.equal(relationEvents.length, 2);
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
  assert.deepEqual(
    [...new Set(residuals.map((residual) => residual.requirementId))].sort(),
    [CHILD_ONE_REQUIREMENT_ID, CHILD_TWO_REQUIREMENT_ID].sort()
  );

  const aggregateStates = publicAbgRequirements.projectAggregateStates({
    ledger: expectedContext.ledger,
    environment,
    folds,
    residuals
  });
  assert.equal(aggregateStates.length, 1);
  assert.equal(aggregateStates[0].requirementId, PARENT_REQUIREMENT_ID);
  assert.equal(aggregateStates[0].state, "partial");
  assert.equal(aggregateStates[0].childFoldRefs.length >= 2, true);
  assert.equal(aggregateStates[0].residualRefs.length >= 2, true);

  const evidenceBindings = routeEventsByPayloadKind(
    routeEvents,
    "requirement_evidence_bound"
  ).map((event) => event.requirementPayload.binding);
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
      proofCommand: "npm run test:t168",
      sourceRunKind: "installed_requirement_graph_refinement",
      proofRunRoot: runRoot,
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
  assert.equal(replayArtifact.artifact.ticket, "T-168");
  assert.equal(
    replayArtifact.manifest.artifact.sha256,
    sha256Text(stableJson(replayArtifact.artifact))
  );
});
