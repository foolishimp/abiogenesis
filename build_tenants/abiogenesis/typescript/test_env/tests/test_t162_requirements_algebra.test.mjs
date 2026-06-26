// Validates: T-162
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitRequirementEventPayload,
  activeRequirements,
  bindRequirementEvidence,
  buildEdgeRequirementEnvironment,
  classifyRequirementAttenuation,
  constructAuthorityContextFragment,
  constructDestinationTopology,
  constructRequirementEvidenceBinding,
  constructRequirementProjection,
  constructRequirementRelation,
  constructRequirementTestRelation,
  constructRequirementTerm,
  constructTraversalSpan,
  currentEvidenceBindings,
  evaluateRequirementCompleteness,
  evaluateRequirementStructuralState,
  foldRequirementEvidence,
  projectAssuranceCase,
  projectExecutionSchedules,
  projectMaterializationTargets,
  projectRequirementLedger,
  projectRequirements,
  queryRequirements,
  residualizeRequirementFolds,
  REQUIREMENT_FOLD_STATE_MAPPING,
  routeContextConstraint,
  wrapCompatibilityObligationRef
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  constructGtlRequirementDeclaration,
  constructGtlRequirementsAlgebraDeclarationBundle,
  constructGtlTraversalSpanDeclaration
} from "../../build/semantic/code/src/index.js";

const edge = Object.freeze({
  graphFunctionRef: "graph-function://data-mapper/build",
  graphVectorRef: "graph-vector://data-mapper/derive-validation",
  vectorIndex: 2,
  edge: "derive_validation"
});

function payloads() {
  const term = constructRequirementTerm({
    requirementId: "REQ-DM-001",
    termKind: "atom",
    stableId: "REQ-DM-001",
    sourceRef: "specification/requirements/data-mapper.md#REQ-DM-001",
    sourceDigest: "sha256:req-dm-001",
    text: "Data Mapper shall expose a component test for field validation.",
    relationRefs: ["relation://req-dm-001/test"],
    spanRefs: ["span://data-mapper/derive-validation"],
    contextRefs: ["context://product/data-mapper"],
    evidencePolicyRefs: ["evidence-policy://component-test"],
    projectionRefs: ["projection://req-dm-001/obligation"]
  });
  const span = constructTraversalSpan({
    spanId: "span://data-mapper/derive-validation",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://design",
    targetNodeRef: "node://validation",
    frameRefs: ["frame-lineage://root"],
    zoomRefs: ["zoom://data-mapper/validation"],
    foldbackRefs: ["foldback://data-mapper/validation"],
    aliasRefs: ["alias://derive-validation"]
  });
  const context = constructAuthorityContextFragment({
    fragmentRef: "context://product/data-mapper",
    stage: "product",
    constraintScope: "component validation",
    digest: "sha256:context-dm",
    promotionPolicyRef: "promotion://context-remains-constraint",
    appliesToRefs: ["REQ-DM-001", span.spanId, edge.edge],
    routingOutcome: "constraint_only"
  });
  const topology = constructDestinationTopology({
    topologyRef: "destination-topology://typescript-node",
    frameworkRef: "tenant://typescript-node",
    constraintRefs: ["runtime://node", "test-runner://node-test"],
    appliesToRefs: ["REQ-DM-001", span.spanId]
  });
  const relation = constructRequirementRelation({
    relationId: "relation://req-dm-001/test",
    relationKind: "test",
    fromRequirementId: "REQ-DM-001",
    toRequirementId: "REQ-DM-001",
    sourceRef: "specification/requirements/data-mapper.md#tests",
    evidenceRefs: []
  });
  const testRelation = constructRequirementTestRelation({
    relationRef: "test-relation://req-dm-001/component",
    requirementId: "REQ-DM-001",
    assetProjectionRef: "projection://req-dm-001/asset",
    testSourceProjectionRef: "projection://req-dm-001/test-source",
    testExecutionProjectionRef: "projection://req-dm-001/test-execution",
    interpretationProjectionRef: "projection://req-dm-001/interpretation",
    componentTestRootRefs: ["src/test"],
    evidencePolicyRef: "evidence-policy://component-test"
  });
  const projections = [
    constructRequirementProjection({
      projectionRef: "projection://req-dm-001/obligation",
      requirementId: "REQ-DM-001",
      spanId: span.spanId,
      projectionRole: "obligation",
      authorityRole: "requirement",
      targetPath: null,
      command: null,
      fallbackCommand: null,
      evidenceRole: null,
      current: true,
      sourceRefs: [term.sourceRef],
      supersedesProjectionRefs: []
    }),
    constructRequirementProjection({
      projectionRef: "projection://req-dm-001/materialize/design",
      requirementId: "REQ-DM-001",
      spanId: span.spanId,
      projectionRole: "materialization_target",
      authorityRole: "design_materialization",
      targetPath: "src/test/field_validation.test.ts",
      command: null,
      fallbackCommand: null,
      evidenceRole: "test_source",
      current: true,
      sourceRefs: ["design://materialization-target"],
      supersedesProjectionRefs: []
    }),
    constructRequirementProjection({
      projectionRef: "projection://req-dm-001/materialize/tenant-stack",
      requirementId: "REQ-DM-001",
      spanId: span.spanId,
      projectionRole: "materialization_target",
      authorityRole: "tenant_stack",
      targetPath: "src/test/field_validation.test.ts",
      command: null,
      fallbackCommand: null,
      evidenceRole: "test_source",
      current: true,
      sourceRefs: ["tenant-stack://typescript-node/test-root-policy"],
      supersedesProjectionRefs: ["projection://req-dm-001/materialize/design"]
    }),
    constructRequirementProjection({
      projectionRef: "projection://req-dm-001/execution",
      requirementId: "REQ-DM-001",
      spanId: span.spanId,
      projectionRole: "execution_schedule",
      authorityRole: "tenant_stack",
      targetPath: null,
      command: "npm run test -- --component field_validation",
      fallbackCommand: "npm test",
      evidenceRole: "test_execution",
      current: true,
      sourceRefs: ["schedule://admitted/component"],
      supersedesProjectionRefs: []
    })
  ];

  return [
    { kind: "requirement_term_admitted", eventRef: "event://term", term },
    { kind: "traversal_span_admitted", eventRef: "event://span", span },
    { kind: "authority_context_fragment_admitted", eventRef: "event://context", fragment: context },
    { kind: "destination_topology_admitted", eventRef: "event://topology", topology },
    { kind: "requirement_relation_admitted", eventRef: "event://relation", relation },
    { kind: "requirement_test_relation_admitted", eventRef: "event://test-relation", testRelation },
    ...projections.map((projection, index) => ({
      kind: "requirement_projection_admitted",
      eventRef: `event://projection/${index}`,
      projection
    }))
  ];
}

function environment() {
  const ledger = projectRequirementLedger(payloads());
  const env = buildEdgeRequirementEnvironment({ ledger, edge });
  const projections = projectRequirements({ ledger, environment: env });
  return { ledger, env, projections };
}

test("T-162 worked trace projects requirements from replay-derived ledger", () => {
  const context = environment();

  assert.equal(context.ledger.kind, "requirement_ledger_projection");
  assert.equal(activeRequirements({ ledger: context.ledger, edge }).length, 1);
  assert.equal(context.env.activeTerms.length, 1);
  assert.equal(context.env.activeContextFragments.length, 1);
  assert.equal(context.env.activeDestinationTopologies.length, 1);
  assert.equal(context.env.activeTestRelations.length, 1);
  assert.equal(
    context.projections.some((projection) => projection.projectionRole === "obligation"),
    true
  );
});

test("T-162 context routing stays structural and routes F_P-required fragments", () => {
  const fragment = constructAuthorityContextFragment({
    fragmentRef: "context://ambiguous/obstacle",
    stage: "requirements",
    constraintScope: "ambiguous obstacle",
    digest: "sha256:ambiguous",
    promotionPolicyRef: "promotion://fp-required",
    appliesToRefs: ["REQ-DM-001"],
    routingOutcome: "fp_required"
  });
  const route = routeContextConstraint({
    fragment,
    activeRefs: ["REQ-DM-001"]
  });

  assert.equal(route.applies, true);
  assert.equal(route.route, "semantic_assessment_required");
});

test("T-162 GTL declarations are wrapper declarations, not runtime truth", () => {
  const requirement = constructGtlRequirementDeclaration({
    requirementId: "REQ-DM-001",
    termKind: "atom",
    stableId: "REQ-DM-001",
    sourceRef: "specification/requirements/data-mapper.md#REQ-DM-001",
    sourceDigest: "sha256:req-dm-001",
    relationRefs: ["relation://req-dm-001/test"],
    spanRefs: ["span://data-mapper/derive-validation"],
    contextRefs: ["context://product/data-mapper"],
    evidencePolicyRefs: ["evidence-policy://component-test"]
  });
  const span = constructGtlTraversalSpanDeclaration({
    spanId: "span://data-mapper/derive-validation",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://design",
    targetNodeRef: "node://validation"
  });
  const bundle = constructGtlRequirementsAlgebraDeclarationBundle({
    requirements: [requirement],
    spans: [span]
  });

  assert.equal(bundle.declarationKey, "gtl.requirements_algebra");
  assert.equal("runtimeEvents" in bundle, false);
  assert.equal("closureDecision" in bundle, false);
});

test("T-162 projection precedence: tenant-stack role policy overrides matching design target", () => {
  const { projections } = environment();
  const targets = projectMaterializationTargets(projections);

  assert.equal(targets.length, 1);
  assert.equal(targets[0].projectionRef, "projection://req-dm-001/materialize/tenant-stack");
  assert.equal(targets[0].targetPath, "src/test/field_validation.test.ts");
});

test("T-162 execution prep carries admitted schedule command, not fallback", () => {
  const { projections } = environment();
  const schedules = projectExecutionSchedules(projections);

  assert.equal(schedules.length, 1);
  assert.equal(schedules[0].source, "admitted_schedule");
  assert.equal(schedules[0].command, "npm run test -- --component field_validation");
});

test("T-162 evidence binding separates byproducts and component-test materialization", () => {
  const { env, projections } = environment();
  const materialization = projectMaterializationTargets(projections)[0];
  const testSource = bindRequirementEvidence({
    environment: env,
    projection: materialization,
    evidenceRef: "evidence://src/test/field_validation",
    path: "src/test/field_validation.test.ts",
    digest: "sha256:test-source",
    admitted: true,
    byproduct: false,
    current: true
  });
  const byproduct = bindRequirementEvidence({
    environment: env,
    projection: materialization,
    evidenceRef: "evidence://dist/field_validation",
    path: "dist/field_validation.test.js",
    digest: "sha256:byproduct",
    admitted: false,
    byproduct: true,
    current: true
  });

  assert.equal(testSource.evidenceRole, "test_source");
  assert.equal(testSource.bindingStatus, "admitted");
  assert.equal(byproduct.evidenceRole, "byproduct");
  assert.equal(byproduct.bindingStatus, "non_closing");
});

test("T-162 current admitted evidence supersedes empty predecessor replay", () => {
  const oldEmpty = constructRequirementEvidenceBinding({
    evidenceRef: "evidence://empty-predecessor",
    requirementId: "REQ-DM-001",
    projectionRef: "projection://req-dm-001/materialize/tenant-stack",
    evidenceRole: "test_source",
    bindingStatus: "non_closing",
    path: null,
    digest: null,
    current: true,
    supersedesEvidenceRefs: [],
    reason: "empty predecessor replay"
  });
  const current = constructRequirementEvidenceBinding({
    evidenceRef: "evidence://current-valid",
    requirementId: "REQ-DM-001",
    projectionRef: "projection://req-dm-001/materialize/tenant-stack",
    evidenceRole: "test_source",
    bindingStatus: "admitted",
    path: "src/test/field_validation.test.ts",
    digest: "sha256:test-source",
    current: true,
    supersedesEvidenceRefs: [oldEmpty.evidenceRef],
    reason: "current admitted evidence"
  });

  const active = currentEvidenceBindings([oldEmpty, current]);

  assert.deepEqual(active.map((binding) => binding.evidenceRef), ["evidence://current-valid"]);
});

test("T-162 component-test postflight admits materialized tests before execution proof", () => {
  const { env, projections } = environment();
  const materialization = projectMaterializationTargets(projections)[0];
  const testSource = bindRequirementEvidence({
    environment: env,
    projection: materialization,
    evidenceRef: "evidence://src/test/field_validation",
    path: "src/test/field_validation.test.ts",
    digest: "sha256:test-source",
    admitted: true,
    byproduct: false,
    current: true
  });

  const folds = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [testSource],
    sourceAbgTruthRefs: ["assurance://current"]
  });
  const residuals = residualizeRequirementFolds({ environment: env, folds });
  const attenuation = classifyRequirementAttenuation({
    priorResiduals: [],
    residuals
  });
  const claims = projectAssuranceCase({ environment: env, folds, residuals });
  const query = queryRequirements({
    environment: env,
    projections,
    evidenceBindings: [testSource],
    folds,
    residuals,
    attenuation,
    assuranceClaims: claims
  });

  assert.equal(folds[0].state, "partial");
  assert.equal(residuals.length, 1);
  assert.equal(query.evidenceRefs.includes("evidence://src/test/field_validation"), true);
  assert.equal(query.residualRefs.length, 1);
});

test("T-162 F_D is total and closed-world over admitted requirement states", () => {
  const { ledger } = environment();

  assert.equal(evaluateRequirementStructuralState({ ledger }).outcome, "admitted_valid");
  assert.equal(evaluateRequirementStructuralState({ ledger: null }).outcome, "unknown_state_rejected");
  assert.equal(evaluateRequirementStructuralState({ ledger, malformed: true }).outcome, "rejected_malformed");
  assert.equal(evaluateRequirementStructuralState({ ledger, staleOrSuperseded: true }).outcome, "stale_or_superseded");
  assert.equal(evaluateRequirementStructuralState({ ledger, contradictoryAuthority: true }).outcome, "contradictory_authority");
  assert.equal(evaluateRequirementStructuralState({ ledger, semanticAssessmentRequired: true }).outcome, "semantic_assessment_required");
  assert.equal(evaluateRequirementStructuralState({ ledger, semanticResidualPreserved: true }).outcome, "semantic_residual_preserved");
  assert.equal(evaluateRequirementStructuralState({ ledger, humanDecisionRequired: true }).outcome, "human_decision_required");
  assert.equal(evaluateRequirementStructuralState({ ledger, nonClosingPreserved: true }).outcome, "non_closing_preserved");
});

test("T-162 admission rejects unknown fields and side-door runtime authority", () => {
  assert.throws(
    () => admitRequirementEventPayload({
      kind: "requirement_term_admitted",
      eventRef: "event://bad",
      term: {
        kind: "requirement_term",
        requirementId: "REQ-BAD",
        termKind: "atom",
        stableId: "REQ-BAD",
        sourceRef: "spec://bad",
        sourceDigest: "sha256:bad",
        text: "Bad term",
        relationRefs: [],
        spanRefs: ["span://bad"],
        contextRefs: [],
        evidencePolicyRefs: [],
        projectionRefs: [],
        closureDecision: "close"
      }
    }),
    /unknown field/
  );
  assert.throws(
    () => admitRequirementEventPayload({
      kind: "requirement_projection_admitted",
      eventRef: "event://bad-projection",
      maySelectTraversal: true,
      projection: {}
    }),
    /runtime authority fields/
  );
});

test("T-162 completeness gates fail closed and compatibility refs do not own closure", () => {
  const { ledger, env, projections } = environment();
  const folds = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: ["assurance://current"]
  });
  const residuals = residualizeRequirementFolds({ environment: env, folds });
  const report = evaluateRequirementCompleteness({
    environment: env,
    projections,
    folds,
    residuals
  });
  const compat = wrapCompatibilityObligationRef({
    obligationRef: "odd-sdlc://legacy-obligation/1",
    requirementId: ledger.terms[0].requirementId,
    spanId: ledger.spans[0].spanId
  });

  assert.equal(report.status, "passed");
  assert.equal(compat.authorityRole, "fallback");
  assert.equal(compat.projectionRole, "obligation");
});

test("T-162 fold-state mapping is projection-only over existing ABG truth", () => {
  assert.equal(
    REQUIREMENT_FOLD_STATE_MAPPING.satisfied.closureAuthority,
    "existing_abg_assurance_fold"
  );
  assert.equal(
    REQUIREMENT_FOLD_STATE_MAPPING.partial.closureAuthority,
    "non_closing_residual_required"
  );
  assert.equal(
    REQUIREMENT_FOLD_STATE_MAPPING.deferred.closureAuthority,
    "existing_abg_continuation"
  );
});
