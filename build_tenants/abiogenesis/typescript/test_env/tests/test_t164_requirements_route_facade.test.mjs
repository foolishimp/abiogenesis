// Validates: T-164
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-031
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-033
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-034
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-037
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-039
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-043
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-011

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicM03 from "@abiogenesis/typescript-tenant/abg/m03";
import * as publicAbgRequirements from "@abiogenesis/typescript-tenant/abg/requirements";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import {
  AdmittedRef,
  admitDeclarations,
  bindExecutionEvidence,
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintAdmittedRef,
  mintRuntimeScopeRef,
  projectRequirementFoldFromAssuranceClosure,
  projectRequirementResidualsFromFolds,
  resolveRequirementLifecycleDisposition,
  resolveAdmittedRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  admitRequirementEventPayload,
  constructRequirementProjection,
  projectRequirementLedger
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";
import {
  stableJson
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields,
  readmitThreeStageBasis
} from "./support/m03-iteration-fixtures.mjs";

const FORBIDDEN_PUBLIC_EMITTERS = Object.freeze([
  "admitRequirementEventPayload",
  "bindRequirementEvidence",
  "foldRequirementEvidence",
  "residualizeRequirementFolds",
  "requirementAbgTruthRefFromAssuranceClosureDecision",
  "admitDeclarations",
  "mintAdmittedRef",
  "mintRuntimeScopeRef",
  "AdmittedRef",
  "RuntimeScopeRef",
  "buildRequirementRouteRuntimeContextFromDeclarations",
  "bindExecutionEvidence",
  "projectRequirementFoldFromAssuranceClosure",
  "projectRequirementResidualsFromFolds",
  "resolveRequirementLifecycleDisposition",
  "emitRequirementRouteFactsForEdgeClose"
]);

const edge = Object.freeze({
  graphFunctionRef: "graph-function://t164/route",
  graphVectorRef: "graph-vector://t164/edge",
  vectorIndex: 0,
  edge: "edge://t164/edge"
});

function assertNoPublicEmitters(namespace, label) {
  for (const name of FORBIDDEN_PUBLIC_EMITTERS) {
    assert.equal(namespace[name], undefined, `${label} must not expose ${name}`);
  }
}

function t164Bundle() {
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T164-001",
    termKind: "atom",
    stableId: "REQ-T164-001",
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md#031",
    sourceDigest: "sha256:t164-requirement",
    relationRefs: ["relation://t164/self-test"],
    spanRefs: ["span://t164/edge"],
    contextRefs: ["context://t164/product"],
    evidencePolicyRefs: ["policy://t164/evidence"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId: "span://t164/edge",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://t164/source",
    targetNodeRef: "node://t164/target"
  });

  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    relations: [
      Object.freeze({
        kind: "gtl_requirement_relation_declaration",
        relationId: "relation://t164/self-test",
        relationKind: "test",
        fromRequirementId: requirement.requirementId,
        toRequirementId: requirement.requirementId
      })
    ],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "context://t164/product",
        originStage: "product",
        constraintScope: "requirements route public facade",
        digest: "sha256:t164-context",
        promotionPolicyRef: "policy://t164/context",
        appliesToRefs: [requirement.requirementId, span.spanId, edge.edge]
      })
    ],
    destinationTopologies: [
      Object.freeze({
        kind: "gtl_destination_topology_declaration",
        topologyRef: "topology://t164/typescript",
        frameworkRef: "tenant://abiogenesis/typescript",
        constraintRefs: ["runtime://node"],
        appliesToRefs: [requirement.requirementId, span.spanId]
      })
    ],
    testRelations: [
      Object.freeze({
        kind: "gtl_requirement_test_relation_declaration",
        relationRef: "test-relation://t164/facade",
        requirementId: requirement.requirementId,
        assetProjectionRef: "projection://t164/asset",
        testSourceProjectionRef: "projection://t164/test-source",
        testExecutionProjectionRef: "projection://t164/test-execution",
        interpretationProjectionRef: "projection://t164/interpretation",
        componentTestRootRefs: ["test_env/tests"],
        evidencePolicyRef: "policy://t164/evidence"
      })
    ]
  });
}

function runtimeScope() {
  return mintRuntimeScopeRef({
    runRef: "run://t164/public-facade-proof",
    graphCallRef: "graph-call://t164/public-facade-proof",
    frameRef: "frame://t164/public-facade-proof",
    continuationRef: null,
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRef: edge.graphVectorRef,
    spanRef: "span://t164/edge"
  });
}

function runtimeScopeForBasis(basis) {
  return runtimeScopeForBasisVector(basis, 0);
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
    spanRef: `span://t164/${vector.id}`
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

function replayFact(kind, ref, sourceEventRef, payload) {
  return Object.freeze({ kind, ref, sourceEventRef, payload });
}

function t164RouteFixtureWithProjection() {
  const admitted = admitDeclarations({
    bundle: t164Bundle(),
    runtimeScope: runtimeScope(),
    authorityRefs: []
  });
  assert.equal(admitted.status, "accepted");

  const projection = constructRequirementProjection({
    projectionRef: "projection://t164/execution",
    requirementId: "REQ-T164-001",
    spanId: "span://t164/edge",
    projectionRole: "execution_schedule",
    authorityRole: "tenant_stack",
    targetPath: null,
    command: "node --test test_env/tests/test_t164_requirements_route_facade.test.mjs",
    fallbackCommand: null,
    evidenceRole: "test_execution",
    current: true,
    sourceRefs: ["schedule://t164/test"],
    supersedesProjectionRefs: []
  });
  const projectionEvent = admitRequirementEventPayload({
    kind: "requirement_projection_admitted",
    eventRef: "requirement-event:t164:projection:execution",
    projection
  });
  const ledger = projectRequirementLedger([
    ...admitted.value.admittedRequirementEvents,
    projectionEvent
  ]);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger,
    edge
  });
  const projectionRef = mintAdmittedRef({
    kind: "requirement_projection",
    ref: projection.projectionRef,
    sourceEventRef: projectionEvent.eventRef,
    payload: projection
  });
  const replayFacts = Object.freeze([
    ...admitted.value.replayFacts,
    replayFact("requirement_event", projectionEvent.eventRef, projectionEvent.eventRef, projectionEvent),
    replayFact("requirement_projection", projection.projectionRef, projectionEvent.eventRef, projection)
  ]);

  return { environment, projectionRef, replayFacts };
}

function t164RouteBundleForBasis(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t164/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T164-RUNNER-001",
    termKind: "atom",
    stableId: "REQ-T164-RUNNER-001",
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md#037",
    sourceDigest: "sha256:t164-runner-requirement",
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: [],
    evidencePolicyRefs: ["policy://t164/runner-evidence"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRefs: [vector.id],
    vectorIndexes: [vectorIndex],
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id
  });
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span]
  });
}

function t164RouteContextForBasis(basis, vectorIndex) {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle: t164RouteBundleForBasis(basis, vectorIndex),
    runtimeScope: runtimeScopeForBasisVector(basis, vectorIndex),
    edges: [routeEdgeForBasisVector(basis, vectorIndex)]
  });
  assert.equal(context.status, "accepted");
  return context.value;
}

function firstTraversalBasis(basis) {
  return readmitThreeStageBasis(
    Object.freeze({
      ...basis,
      startIntent: Object.freeze({
        ...basis.startIntent,
        until: "first_traversal"
      })
    })
  );
}

function attachedArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return Object.freeze({
    edge: input.edge,
    actor: "codex",
    fulfillment_assessments: Object.freeze(
      assessmentIds.map((assessmentId) => Object.freeze({
        id: assessmentId,
        evaluator: assessmentId,
        fulfillment_status: "fulfilled",
        fulfillment_detail: "actor result accepted",
        blocking_reasons: Object.freeze([]),
        evidence_refs: Object.freeze(["proof://t164/runner"])
      }))
    ),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  });
}

test("T-164 admitted ref digest canonicalization is environment invariant", () => {
  assert.throws(
    () => stableJson({ b: 2, a: undefined, Z: 1 }),
    /expected an I-JSON value/u
  );
  assert.throws(
    () => stableJson({ nested: { keep: true, drop: undefined } }),
    /expected an I-JSON value/u
  );
  assert.equal(stableJson({ b: 2, Z: 1 }), "{\"Z\":1,\"b\":2}");
  assert.equal(stableJson({ nested: { keep: true } }), "{\"nested\":{\"keep\":true}}");
});

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

function runtimeEvidenceFixture(basis) {
  const event = publicM03.constructEvidenceAdmittedEvent({
    basis,
    vectorIndex: 0,
    evidenceRef: "evidence://t164/runtime-execution",
    payloadRef: "payload://t164/runtime-execution",
    authorityRef: "authority-snapshot://t164/runtime",
    authorityDigest: "sha256:t164-authority",
    inputDigest: "sha256:t164-input",
    providerRefs: ["provider://t164/runtime"],
    policyRefs: ["policy://t164/evidence"],
    complete: true,
    shallow: false,
    contradictsAuthority: false,
    deferred: false
  });
  const sourceEventRef = `runtime-event:evidence_admitted:${event.evidenceRef}`;
  const eventRef = mintAdmittedRef({
    kind: "runtime_evidence_event",
    ref: event.evidenceRef,
    sourceEventRef,
    payload: event
  });
  const replayFacts = Object.freeze([
    replayFact("runtime_evidence_event", event.evidenceRef, sourceEventRef, event)
  ]);
  return { event, eventRef, replayFacts };
}

function assuranceClosureDecisionFixture(basis, runtimeEvidenceEvent) {
  const runtimeProjection = publicM03.deriveRuntimeAggregateProjection(basis, []);
  const scope = publicM03.deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  const authoritySnapshot = publicM03.constructAssuranceAuthoritySnapshot({
    authoritySnapshotRef: "authority-snapshot://t164/runtime",
    scope,
    authorityRefs: ["authority://t164/runtime"],
    inputRefs: ["input://t164/runtime"],
    authorityDigest: "sha256:t164-authority",
    inputDigest: "sha256:t164-input",
    closureCapable: true,
    providerRefs: ["provider://t164/runtime"],
    policyRefs: ["policy://t164/evidence"]
  });
  const evidenceRow = publicM03.constructAssuranceEvidenceRow({
    scope,
    evidenceRef: runtimeEvidenceEvent.evidenceRef,
    authorityRef: runtimeEvidenceEvent.authorityRef,
    authorityDigest: runtimeEvidenceEvent.authorityDigest,
    inputDigest: runtimeEvidenceEvent.inputDigest,
    eventRefs: [`runtime-event:evidence_admitted:${runtimeEvidenceEvent.evidenceRef}`],
    providerRefs: runtimeEvidenceEvent.providerRefs,
    policyRefs: runtimeEvidenceEvent.policyRefs,
    boundToScope: true,
    complete: true,
    shallow: false,
    contradictsAuthority: false,
    deferred: false,
    lifecycle: "active"
  });
  const assuranceProjection = publicM03.deriveAssuranceProjection({
    basis,
    runtimeProjection,
    authoritySnapshot,
    evidenceRows: [evidenceRow]
  });
  const decision = publicM03.deriveAssuranceClosureDecision(assuranceProjection);
  const sourceEventRef = `runtime-projection:assurance_closure_decision:${decision.projectionRef}`;
  const decisionRef = mintAdmittedRef({
    kind: "assurance_closure_decision",
    ref: decision.projectionRef,
    sourceEventRef,
    payload: decision
  });
  const replayFacts = Object.freeze([
    replayFact("assurance_closure_decision", decision.projectionRef, sourceEventRef, decision)
  ]);
  return { decision, decisionRef, replayFacts };
}

test("T-164 public requirements facades expose queries only, not emitters", () => {
  assertNoPublicEmitters(publicRoot, "package root");
  assertNoPublicEmitters(publicM03, "abg/m03");
  assertNoPublicEmitters(publicAbgRequirements, "abg/requirements");

  assert.equal(typeof publicAbgRequirements.compileEdgeRequirementEnvironment, "function");
  assert.equal(typeof publicAbgRequirements.projectEdgeObligations, "function");
  assert.equal(typeof publicAbgRequirements.projectLifecycleState, "function");
});

test("T-164 package export subpaths do not expose runtime emitters", async () => {
  const packageRoot = await import("@abiogenesis/typescript-tenant");
  const packageM03 = await import("@abiogenesis/typescript-tenant/abg/m03");
  const packageAbgRequirements = await import("@abiogenesis/typescript-tenant/abg/requirements");
  const packageGtlRequirements = await import("@abiogenesis/typescript-tenant/gtl/requirements");

  assertNoPublicEmitters(packageRoot, "package export .");
  assertNoPublicEmitters(packageM03, "package export ./abg/m03");
  assertNoPublicEmitters(packageAbgRequirements, "package export ./abg/requirements");
  assertNoPublicEmitters(packageGtlRequirements, "package export ./gtl/requirements");
});

test("T-164 GTL requirements facade declares refs without ABG runtime imports", () => {
  const composition = publicGtlRequirements.declareLifecycleComposition({
    compositionRef: "gtl.requirements.lifecycle:t164-route-1",
    routeRefs: [
      Object.freeze({
        namespace: "abg.requirements",
        routeName: "compile_edge_environment",
        routeVersion: "4.1.0-rc.11",
        contractRef: "REQ-R-ABG3-REQUIREMENTS-ALGEBRA-031"
      })
    ],
    sourceDigest: "sha256:t164-composition"
  });
  assert.equal(composition.routeRefs[0].namespace, "abg.requirements");
  assert.equal(publicGtlRequirements.admitDeclarations, undefined);

  const gtlSources = [
    "code/src/gtl/m01/contracts/requirements_algebra.ts",
    "code/src/gtl/requirements/index.ts"
  ].map((sourcePath) => readFileSync(sourcePath, "utf8"));
  for (const source of gtlSources) {
    assert.doesNotMatch(source, /from\s+["'][^"']*abg\/m03/u);
    assert.doesNotMatch(source, /from\s+["'][^"']*abg\/requirements/u);
  }
});

test("T-164 internal declaration admission mints replay-resolved refs", () => {
  const result = admitDeclarations({
    bundle: t164Bundle(),
    runtimeScope: runtimeScope(),
    authorityRefs: []
  });

  assert.equal(result.status, "accepted");
  assert.equal(result.value.ledger.terms.length, 1);
  assert.equal(result.value.admittedRequirementEventRefs.length, 6);
  assert.equal(result.value.ledgerRef.kind, "requirement_ledger_projection");

  const resolved = resolveAdmittedRef({
    admittedRef: result.value.ledgerRef,
    replayFacts: result.value.replayFacts,
    expectedKind: "requirement_ledger_projection"
  });
  assert.equal(resolved.status, "accepted");

  const structuralForgery = {
    kind: result.value.ledgerRef.kind,
    ref: result.value.ledgerRef.ref,
    sourceEventRef: result.value.ledgerRef.sourceEventRef,
    digest: result.value.ledgerRef.digest
  };
  const structuralRejected = resolveAdmittedRef({
    admittedRef: structuralForgery,
    replayFacts: result.value.replayFacts,
    expectedKind: "requirement_ledger_projection"
  });
  assert.equal(structuralRejected.status, "rejected");
  assert.equal(structuralRejected.reason, "malformed_input");

  const forgedDigestRef = new AdmittedRef({
    kind: "requirement_ledger_projection",
    ref: result.value.ledgerRef.ref,
    sourceEventRef: result.value.ledgerRef.sourceEventRef,
    digest: "sha256:forged"
  });
  const forgedRejected = resolveAdmittedRef({
    admittedRef: forgedDigestRef,
    replayFacts: result.value.replayFacts,
    expectedKind: "requirement_ledger_projection"
  });
  assert.equal(forgedRejected.status, "rejected");
  assert.equal(forgedRejected.reason, "forged_ref");
});

test("T-164 downstream query surfaces report no_evidence without emitting folds", () => {
  const result = admitDeclarations({
    bundle: t164Bundle(),
    runtimeScope: runtimeScope(),
    authorityRefs: []
  });
  assert.equal(result.status, "accepted");

  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: result.value.ledger,
    edge
  });
  const claims = publicAbgRequirements.projectAssuranceCase({
    environment,
    folds: [],
    residuals: []
  });

  assert.equal(claims.length, 1);
  assert.equal(claims[0].status, "no_evidence");
  assert.equal(publicAbgRequirements.foldRequirementEvidence, undefined);
  assert.equal(publicAbgRequirements.residualizeRequirementFolds, undefined);
});

test("T-164 internal evidence and fold bridges consume admitted runtime refs", () => {
  const basis = buildThreeStageBasis();
  const route = t164RouteFixtureWithProjection();
  const runtimeEvidence = runtimeEvidenceFixture(basis);
  const scope = runtimeScopeForBasis(basis);

  const binding = bindExecutionEvidence({
    runtimeScope: scope,
    environment: route.environment,
    requirementProjectionRefs: [route.projectionRef],
    runtimeEvidenceEventRef: runtimeEvidence.eventRef,
    replayFacts: Object.freeze([
      ...route.replayFacts,
      ...runtimeEvidence.replayFacts
    ])
  });
  assert.equal(binding.status, "accepted");
  assert.equal(binding.value.evidenceBindings.length, 1);
  assert.equal(binding.value.evidenceBindings[0].bindingStatus, "admitted");
  assert.equal(binding.value.emittedRequirementEvents[0].kind, "requirement_evidence_bound");

  const assurance = assuranceClosureDecisionFixture(basis, runtimeEvidence.event);
  assert.equal(assurance.decision.decision, "close");
  const fold = projectRequirementFoldFromAssuranceClosure({
    runtimeScope: scope,
    environment: route.environment,
    requirementProjectionRefs: [route.projectionRef],
    evidenceBindingRefs: binding.value.evidenceBindingRefs,
    assuranceClosureDecisionRef: assurance.decisionRef,
    replayFacts: Object.freeze([
      ...binding.value.replayFacts,
      ...assurance.replayFacts
    ])
  });

  assert.equal(fold.status, "accepted");
  assert.equal(fold.value.folds.length, 1);
  assert.equal(fold.value.folds[0].state, "satisfied");
  assert.equal(fold.value.folds[0].sourceAbgTruthRefs.length, 1);
  assert.equal(fold.value.emittedRequirementEvents[0].kind, "requirement_fold_projected");

  const structuralAssuranceRef = {
    kind: assurance.decisionRef.kind,
    ref: assurance.decisionRef.ref,
    sourceEventRef: assurance.decisionRef.sourceEventRef,
    digest: assurance.decisionRef.digest
  };
  const rejected = projectRequirementFoldFromAssuranceClosure({
    runtimeScope: scope,
    environment: route.environment,
    requirementProjectionRefs: [route.projectionRef],
    evidenceBindingRefs: binding.value.evidenceBindingRefs,
    assuranceClosureDecisionRef: structuralAssuranceRef,
    replayFacts: Object.freeze([
      ...binding.value.replayFacts,
      ...assurance.replayFacts
    ])
  });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "malformed_input");
});

test("T-164 lifecycle state is a read-only replay query over admitted disposition refs", () => {
  const basis = buildThreeStageBasis();
  const route = t164RouteFixtureWithProjection();
  const runtimeEvidence = runtimeEvidenceFixture(basis);
  const scope = runtimeScopeForBasis(basis);

  const binding = bindExecutionEvidence({
    runtimeScope: scope,
    environment: route.environment,
    requirementProjectionRefs: [route.projectionRef],
    runtimeEvidenceEventRef: runtimeEvidence.eventRef,
    replayFacts: Object.freeze([
      ...route.replayFacts,
      ...runtimeEvidence.replayFacts
    ])
  });
  assert.equal(binding.status, "accepted");

  const assurance = assuranceClosureDecisionFixture(basis, runtimeEvidence.event);
  const retryDecision = Object.freeze({
    ...assurance.decision,
    decision: "retry",
    blockingStatuses: Object.freeze(["missing"]),
    rowIds: Object.freeze(["assurance-row://t164/retry"]),
    reason: "retry preserves residual pressure for disposition projection"
  });
  const retrySourceEventRef = `runtime-projection:assurance_closure_decision:${retryDecision.projectionRef}:retry`;
  const retryDecisionRef = mintAdmittedRef({
    kind: "assurance_closure_decision",
    ref: retryDecision.projectionRef,
    sourceEventRef: retrySourceEventRef,
    payload: retryDecision
  });
  const fold = projectRequirementFoldFromAssuranceClosure({
    runtimeScope: scope,
    environment: route.environment,
    requirementProjectionRefs: [route.projectionRef],
    evidenceBindingRefs: binding.value.evidenceBindingRefs,
    assuranceClosureDecisionRef: retryDecisionRef,
    replayFacts: Object.freeze([
      ...binding.value.replayFacts,
      replayFact(
        "assurance_closure_decision",
        retryDecision.projectionRef,
        retrySourceEventRef,
        retryDecision
      )
    ])
  });
  assert.equal(fold.status, "accepted");
  assert.equal(fold.value.folds[0].state, "partial");

  const residual = projectRequirementResidualsFromFolds({
    runtimeScope: scope,
    environment: route.environment,
    foldRefs: fold.value.foldRefs,
    replayFacts: fold.value.replayFacts
  });
  assert.equal(residual.status, "accepted");
  assert.equal(residual.value.residuals.length, 1);

  const continuationPayload = Object.freeze({
    kind: "continuation_transition",
    transitionRef: "continuation://t164/retry",
    residualRefs: residual.value.residuals.map((item) => item.residualRef)
  });
  const continuationRef = mintAdmittedRef({
    kind: "continuation_transition",
    ref: continuationPayload.transitionRef,
    sourceEventRef: "runtime-event:continuation_transition:t164",
    payload: continuationPayload
  });
  const policyPayload = Object.freeze({
    kind: "runtime_policy",
    policyRef: "policy://t164/fh-disposition",
    authorityRegime: "F_H"
  });
  const policyRef = mintAdmittedRef({
    kind: "runtime_policy",
    ref: policyPayload.policyRef,
    sourceEventRef: "runtime-event:runtime_policy:t164",
    payload: policyPayload
  });
  const replayFacts = Object.freeze([
    ...residual.value.replayFacts,
    replayFact(
      "continuation_transition",
      continuationRef.ref,
      continuationRef.sourceEventRef,
      continuationPayload
    ),
    replayFact("runtime_policy", policyRef.ref, policyRef.sourceEventRef, policyPayload)
  ]);

  const disposition = resolveRequirementLifecycleDisposition({
    runtimeScope: scope,
    residualRefs: residual.value.residualRefs,
    continuationRefs: [continuationRef],
    reentryRefs: [],
    policyRefs: [policyRef],
    replayFacts
  });
  assert.equal(disposition.status, "accepted");
  assert.equal(disposition.value.disposition.disposition, "continuation_available");
  assert.deepEqual(disposition.value.disposition.policyRefs, [policyRef.ref]);

  const structuralPolicyRef = {
    kind: policyRef.kind,
    ref: policyRef.ref,
    sourceEventRef: policyRef.sourceEventRef,
    digest: policyRef.digest
  };
  const rejected = resolveRequirementLifecycleDisposition({
    runtimeScope: scope,
    residualRefs: residual.value.residualRefs,
    continuationRefs: [continuationRef],
    reentryRefs: [],
    policyRefs: [structuralPolicyRef],
    replayFacts
  });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "malformed_input");

  const wrongSlotRef = mintAdmittedRef({
    kind: "requirement_fold_projection",
    ref: fold.value.folds[0].foldRef,
    sourceEventRef: fold.value.foldRefs[0].sourceEventRef,
    payload: fold.value.folds[0]
  });
  const wrongSlotDisposition = resolveRequirementLifecycleDisposition({
    runtimeScope: scope,
    residualRefs: residual.value.residualRefs,
    continuationRefs: [],
    reentryRefs: [wrongSlotRef],
    policyRefs: [],
    replayFacts: fold.value.replayFacts
  });
  assert.equal(wrongSlotDisposition.status, "rejected");
  assert.equal(wrongSlotDisposition.reason, "unknown_ref");

  const attenuation = publicAbgRequirements.classifyAttenuation({
    priorResiduals: [],
    residuals: residual.value.residuals
  });
  const assuranceClaims = publicAbgRequirements.projectAssuranceCase({
    environment: route.environment,
    folds: fold.value.folds,
    residuals: residual.value.residuals
  });
  const requirementQuery = publicAbgRequirements.queryRequirementReadModel({
    environment: route.environment,
    projections: [],
    evidenceBindings: binding.value.evidenceBindings,
    folds: fold.value.folds,
    residuals: residual.value.residuals,
    attenuation,
    assuranceClaims
  });
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query: requirementQuery,
    dispositionRefs: [disposition.value.dispositionRef],
    replayFacts: disposition.value.replayFacts
  });
  assert.equal(lifecycleState.status, "accepted");
  assert.equal(lifecycleState.value.kind, "requirement_lifecycle_state_read_model");
  assert.deepEqual(lifecycleState.value.requirementQuery.residualRefs, [
    residual.value.residuals[0].residualRef
  ]);
  assert.deepEqual(lifecycleState.value.dispositionRefs, [
    disposition.value.dispositionRef.ref
  ]);
  assert.equal(publicAbgRequirements.resolveRequirementLifecycleDisposition, undefined);
});

test("T-164 runner emits requirement route facts on the traversal path", () => {
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t164/runner"
  });
  const basis = firstTraversalBasis(baseBasis);
  const requirementRouteDeclarationBundle = t164RouteBundleForBasis(basis, 0);
  const expectedRouteContext = t164RouteContextForBasis(basis, 0);
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t164/runner/fp-dispatch"),
    dispatch: (input) =>
      publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t164/runner/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });
  const sinkEvents = [];

  const result = publicRoot.runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch,
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    },
    requirementRouteDeclarationBundle
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "traversal_applied");
  const routeRuntimeEvents = result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
  assert.equal(
    routeRuntimeEvents.some((event) =>
      event.routePayloadKind === "requirement_term_admitted"
    ),
    true
  );
  assert.equal(
    routeRuntimeEvents.some((event) =>
      event.routePayloadKind === "requirement_projection_admitted"
    ),
    true
  );
  assert.equal(
    routeRuntimeEvents.some((event) =>
      event.routePayloadKind === "requirement_evidence_bound"
    ),
    true
  );
  const foldEvent = routeRuntimeEvents.find((event) =>
    event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvent.requirementPayload.fold.state, "satisfied");
  assert.equal(
    routeRuntimeEvents.some((event) =>
      event.routePayloadKind === "requirement_residual_projected"
    ),
    false
  );
  const dispositionEvent = routeRuntimeEvents.find((event) =>
    event.routePayloadKind === "requirement_lifecycle_disposition"
  );
  assert.equal(dispositionEvent.requirementPayload.disposition, "closed");
  assert.equal(
    dispositionEvent.requirementPayload.continuationRefs.length,
    1
  );
  assert.equal(
    dispositionEvent.requirementPayload.continuationRefs[0].startsWith(
      "runtime-continuation-transition:"
    ),
    true
  );
  assert.equal(
    result.emittedEvents.some((event) =>
      event.kind === "requirement_route_fact_projected"
    ),
    true
  );
  assert.equal(
    sinkEvents.some((event) =>
      event.kind === "requirement_route_fact_projected"
    ),
    true
  );

  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  const evidenceBindings = routeRuntimeEvents
    .filter((event) => event.routePayloadKind === "requirement_evidence_bound")
    .map((event) => event.requirementPayload.binding);
  const folds = routeRuntimeEvents
    .filter((event) => event.routePayloadKind === "requirement_fold_projected")
    .map((event) => event.requirementPayload.fold);
  const residuals = routeRuntimeEvents
    .filter((event) => event.routePayloadKind === "requirement_residual_projected")
    .map((event) => event.requirementPayload.residual);
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
    projections: [],
    evidenceBindings,
    folds,
    residuals,
    attenuation,
    assuranceClaims
  });
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query: requirementQuery,
    dispositionRefs: [dispositionEvent.routePayloadRef],
    runtimeEvents: result.replayEvents
  });
  assert.equal(lifecycleState.status, "accepted");
  assert.deepEqual(lifecycleState.value.dispositionRefs, [
    dispositionEvent.routePayloadRef
  ]);
});

test("T-164 runner no-ops uncovered route edges instead of crashing", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t164/runner-uncovered-edge"
  });
  const requirementRouteDeclarationBundle = t164RouteBundleForBasis(basis, 0);
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t164/runner-uncovered/fp-dispatch"),
    dispatch: (input) =>
      publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t164/runner-uncovered/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const result = publicRoot.runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => {},
    plugins: {
      fpDispatch,
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    },
    requirementRouteDeclarationBundle
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  const routeRuntimeEvents = result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
  assert.equal(
    routeRuntimeEvents.every((event) => event.vectorIndex === 0),
    true
  );
});
