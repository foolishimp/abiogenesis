// Validates: T-162
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  deriveRuntimeAggregateProjection,
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitRequirementEventPayload,
  activeRequirements,
  bindRequirementEvidence,
  buildEdgeRequirementEnvironment,
  classifyRequirementAttenuation,
  constructAuthorityContextFragment,
  constructDestinationTopology,
  constructRequirementEvidenceBinding,
  constructRequirementFoldProjection,
  constructRequirementProjection,
  constructRequirementRelation,
  constructRequirementResidualProjection,
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
  requirementAbgTruthRefFromAssuranceClosureDecision,
  residualizeRequirementFolds,
  REQUIREMENT_FOLD_STATE_MAPPING,
  routeContextConstraint,
  wrapCompatibilityObligationRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";
import {
  constructGtlRequirementDeclaration,
  constructGtlRequirementRelationDeclaration,
  constructGtlRequirementsAlgebraDeclarationBundle,
  constructGtlTraversalSpanDeclaration
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

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
  ].map((payload) => admitRequirementEventPayload(payload));
}

function environment() {
  const ledger = projectRequirementLedger(payloads());
  const env = buildEdgeRequirementEnvironment({ ledger, edge });
  const projections = projectRequirements({ ledger, environment: env });
  return { ledger, env, projections };
}

function assuranceTruthRefForDecision(expectedDecision, input = {}) {
  const basis = buildThreeStageBasis();
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  const authoritySnapshot = constructAssuranceAuthoritySnapshot({
    scope,
    authorityRefs: input.authorityRefs ?? ["req://t162/assurance"],
    inputRefs: ["input://t162/current"],
    authorityDigest: "authority-digest-t162",
    inputDigest: "input-digest-t162",
    contradictoryAuthority: input.contradictoryAuthority,
    deferredAuthorityRefs: input.deferredAuthorityRefs,
    providerRefs: ["provider://t162/authority"],
    policyRefs: ["policy://t162/assurance"]
  });
  const evidenceRows = input.noEvidence === true
    ? []
    : [
        constructAssuranceEvidenceRow({
          scope,
          evidenceRef: input.evidenceRef ?? "evidence://t162/current",
          authorityRef: Object.hasOwn(input, "authorityRef")
            ? input.authorityRef
            : "req://t162/assurance",
          authorityDigest: "authority-digest-t162",
          inputDigest: "input-digest-t162",
          eventRefs: ["event://t162/evidence"],
          providerRefs: ["provider://t162/evidence"],
          policyRefs: ["policy://t162/assurance"],
          shallow: input.shallow,
          contradictsAuthority: input.contradictsAuthority
        })
      ];
  const projection = deriveAssuranceProjection({
    basis,
    runtimeProjection,
    authoritySnapshot,
    evidenceRows,
    eventLedgerValid: input.eventLedgerValid
  });
  const decision = deriveAssuranceClosureDecision(projection);

  assert.equal(decision.decision, expectedDecision);
  return requirementAbgTruthRefFromAssuranceClosureDecision(decision);
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
  assert.match(context.ledger.ledgerRef, /^requirement-ledger:sha256:/u);
});

test("T-162 raw admission covers every first-slice requirement event kind", () => {
  const fold = constructRequirementFoldProjection({
    foldRef: "fold://req-dm-001/partial",
    requirementId: "REQ-DM-001",
    projectionRefs: ["projection://req-dm-001/obligation"],
    state: "partial",
    sourceAbgTruthRefs: ["abg-truth://assurance_or_continuation_partial/current"],
    evidenceRefs: [],
    residualPressureRefs: ["requirement-residual:REQ-DM-001:partial"],
    reason: "partial assurance fold"
  });
  const residual = constructRequirementResidualProjection({
    residualRef: "requirement-residual:REQ-DM-001:partial",
    requirementId: "REQ-DM-001",
    spanId: "span://data-mapper/derive-validation",
    pressureClass: "missing_execution_evidence",
    ownerSurface: "runtime",
    sourceFoldRefs: [fold.foldRef],
    evidenceRefs: [],
    remainingProjectionRefs: ["projection://req-dm-001/obligation"],
    reason: "remaining execution pressure"
  });
  const admitted = [
    ...payloads(),
    admitRequirementEventPayload({
      kind: "requirement_fold_projected",
      eventRef: "event://fold",
      fold
    }),
    admitRequirementEventPayload({
      kind: "requirement_residual_projected",
      eventRef: "event://residual",
      residual
    })
  ];
  assert.deepEqual(
    admitted.map((payload) => payload.kind),
    [
      "requirement_term_admitted",
      "traversal_span_admitted",
      "authority_context_fragment_admitted",
      "destination_topology_admitted",
      "requirement_relation_admitted",
      "requirement_test_relation_admitted",
      "requirement_projection_admitted",
      "requirement_projection_admitted",
      "requirement_projection_admitted",
      "requirement_projection_admitted",
      "requirement_fold_projected",
      "requirement_residual_projected"
    ]
  );
});

test("T-162 traversal spans consume source and target identity when supplied", () => {
  const ledger = projectRequirementLedger(payloads());
  const matching = buildEdgeRequirementEnvironment({
    ledger,
    edge: {
      ...edge,
      sourceNodeRef: "node://design",
      targetNodeRef: "node://validation",
      frameRefs: ["frame-lineage://root"],
      zoomRefs: ["zoom://data-mapper/validation"],
      foldbackRefs: ["foldback://data-mapper/validation"],
      aliasRefs: ["alias://derive-validation"]
    }
  });
  const mismatched = buildEdgeRequirementEnvironment({
    ledger,
    edge: {
      ...edge,
      sourceNodeRef: "node://wrong",
      targetNodeRef: "node://validation"
    }
  });

  assert.equal(matching.activeSpans.length, 1);
  assert.equal(matching.activeTerms.length, 1);
  assert.equal(mismatched.activeSpans.length, 0);
  assert.equal(mismatched.activeTerms.length, 0);
});

test("T-162 broad traversal spans cover interior edges by declared vector index range", () => {
  const broadSpan = constructTraversalSpan({
    spanId: "span://data-mapper/broad-a-x",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [],
    vectorIndexes: [0, 4],
    sourceNodeRef: "node://A",
    targetNodeRef: "node://X",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
  });
  const broadTerm = constructRequirementTerm({
    requirementId: "REQ-DM-BROAD",
    termKind: "atom",
    stableId: "REQ-DM-BROAD",
    sourceRef: "specification/requirements/data-mapper.md#REQ-DM-BROAD",
    sourceDigest: "sha256:req-dm-broad",
    text: "Broad A to X requirement shall carry across interior edges.",
    relationRefs: [],
    spanRefs: [broadSpan.spanId],
    contextRefs: [],
    evidencePolicyRefs: ["evidence-policy://broad"],
    projectionRefs: []
  });
  const ledger = projectRequirementLedger([
    admitRequirementEventPayload({
      kind: "requirement_term_admitted",
      eventRef: "event://broad-term",
      term: broadTerm
    }),
    admitRequirementEventPayload({
      kind: "traversal_span_admitted",
      eventRef: "event://broad-span",
      span: broadSpan
    })
  ]);
  const interior = buildEdgeRequirementEnvironment({
    ledger,
    edge: {
      ...edge,
      graphVectorRef: "graph-vector://data-mapper/interior-b-c",
      vectorIndex: 2,
      sourceNodeRef: "node://B",
      targetNodeRef: "node://C"
    }
  });
  const outside = buildEdgeRequirementEnvironment({
    ledger,
    edge: {
      ...edge,
      graphVectorRef: "graph-vector://data-mapper/outside",
      vectorIndex: 6,
      sourceNodeRef: "node://Y",
      targetNodeRef: "node://Z"
    }
  });

  assert.equal(interior.activeSpans.length, 1);
  assert.equal(interior.activeTerms.length, 1);
  assert.equal(outside.activeSpans.length, 0);
  assert.equal(outside.activeTerms.length, 0);
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
    relations: [
      constructGtlRequirementRelationDeclaration({
        relationId: "relation://req-dm-001/test",
        relationKind: "test",
        fromRequirementId: "REQ-DM-001",
        toRequirementId: "REQ-DM-001"
      })
    ],
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
  const execution = projections.find((projection) =>
    projection.projectionRole === "execution_schedule"
  );
  assert.notEqual(execution, undefined);
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
  const executionEvidence = bindRequirementEvidence({
    environment: env,
    projection: execution,
    evidenceRef: "evidence://src/test/field_validation-execution",
    path: "src/test/field_validation.test.ts",
    digest: "sha256:test-execution",
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
  assert.equal(executionEvidence.evidenceRole, "test_execution");
  assert.equal(byproduct.evidenceRole, "byproduct");
  assert.equal(byproduct.bindingStatus, "non_closing");
});

test("T-162 path-bearing test-source evidence must match admitted test roots", () => {
  const { env, projections } = environment();
  const materialization = projectMaterializationTargets(projections)[0];
  const forgedTestSource = bindRequirementEvidence({
    environment: env,
    projection: materialization,
    evidenceRef: "evidence://src/main/field_validation",
    path: "src/main/field_validation.ts",
    digest: "sha256:main-source",
    admitted: true,
    byproduct: false,
    current: true
  });

  assert.equal(forgedTestSource.evidenceRole, "test_source");
  assert.equal(forgedTestSource.bindingStatus, "rejected");
  assert.match(forgedTestSource.reason, /test_source evidence path is outside admitted test roots/u);
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

test("T-162 current evidence excludes rejected and non-closing bindings", () => {
  const rejected = constructRequirementEvidenceBinding({
    evidenceRef: "evidence://rejected-current",
    requirementId: "REQ-DM-001",
    projectionRef: "projection://req-dm-001/materialize/tenant-stack",
    evidenceRole: "asset",
    bindingStatus: "rejected",
    path: null,
    digest: null,
    current: true,
    supersedesEvidenceRefs: [],
    reason: "rejected evidence must not support a fold"
  });
  const nonClosing = constructRequirementEvidenceBinding({
    evidenceRef: "evidence://non-closing-current",
    requirementId: "REQ-DM-001",
    projectionRef: "projection://req-dm-001/materialize/tenant-stack",
    evidenceRole: "asset",
    bindingStatus: "non_closing",
    path: null,
    digest: null,
    current: true,
    supersedesEvidenceRefs: [],
    reason: "non-closing evidence preserves pressure but does not support closure"
  });
  const admitted = constructRequirementEvidenceBinding({
    evidenceRef: "evidence://admitted-current",
    requirementId: "REQ-DM-001",
    projectionRef: "projection://req-dm-001/materialize/tenant-stack",
    evidenceRole: "asset",
    bindingStatus: "admitted",
    path: null,
    digest: "sha256:admitted",
    current: true,
    supersedesEvidenceRefs: [],
    reason: "admitted evidence supports a fold"
  });

  const active = currentEvidenceBindings([rejected, nonClosing, admitted]);

  assert.deepEqual(active.map((binding) => binding.evidenceRef), [
    "evidence://admitted-current"
  ]);
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
    sourceAbgTruthRefs: [assuranceTruthRefForDecision("retry", { shallow: true })]
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
  assert.deepEqual(folds[0].residualPressureRefs, residuals.map((residual) => residual.residualRef));
  assert.equal(query.evidenceRefs.includes("evidence://src/test/field_validation"), true);
  assert.equal(query.residualRefs.length, 1);
});

test("T-162 F_D is total and closed-world over admitted requirement states", () => {
  const { ledger } = environment();
  const staleLedger = {
    ...ledger,
    projections: ledger.projections.map((projection) =>
      projection.projectionRef === ledger.terms[0].projectionRefs[0]
        ? { ...projection, current: false }
        : projection
    )
  };
  const contradictoryLedger = {
    ...ledger,
    relations: [
      ...ledger.relations,
      constructRequirementRelation({
        relationId: "relation://req-dm-001/conflict",
        relationKind: "conflict",
        fromRequirementId: "REQ-DM-001",
        toRequirementId: "REQ-DM-001",
        sourceRef: "specification/requirements/data-mapper.md#conflict",
        evidenceRefs: []
      }),
      constructRequirementRelation({
        relationId: "relation://req-dm-001/contribution",
        relationKind: "contribution",
        fromRequirementId: "REQ-DM-001",
        toRequirementId: "REQ-DM-001",
        sourceRef: "specification/requirements/data-mapper.md#contribution",
        evidenceRefs: []
      })
    ]
  };
  const fpRequiredLedger = {
    ...ledger,
    contextFragments: [
      ...ledger.contextFragments,
      constructAuthorityContextFragment({
        fragmentRef: "context://semantic-assessment-required",
        stage: "requirements",
        constraintScope: "ambiguous requirement text",
        digest: "sha256:semantic-assessment",
        promotionPolicyRef: "promotion://fp-required",
        appliesToRefs: ["REQ-DM-001"],
        routingOutcome: "fp_required"
      })
    ]
  };
  const ledgerWithFoldResidual = (state, pressureClass) => {
    const residualRef = `requirement-residual:REQ-DM-001:${state}`;
    const fold = constructRequirementFoldProjection({
      foldRef: `fold://req-dm-001/${state}`,
      requirementId: "REQ-DM-001",
      projectionRefs: [ledger.terms[0].projectionRefs[0]],
      state,
      sourceAbgTruthRefs: [],
      evidenceRefs: [],
      residualPressureRefs: [residualRef],
      reason: `${state} fold`
    });
    const residual = constructRequirementResidualProjection({
      residualRef,
      requirementId: "REQ-DM-001",
      spanId: ledger.spans[0].spanId,
      pressureClass,
      ownerSurface: state === "repriced" ? "requirements" : "runtime",
      sourceFoldRefs: [fold.foldRef],
      evidenceRefs: [],
      remainingProjectionRefs: fold.projectionRefs,
      reason: `${pressureClass} residual`
    });
    return {
      ...ledger,
      folds: [fold],
      residuals: [residual]
    };
  };
  const malformedLedger = {
    ...ledger,
    terms: [
      {
        ...ledger.terms[0],
        spanRefs: ["span://missing"]
      }
    ]
  };

  assert.equal(evaluateRequirementStructuralState({ ledger }).outcome, "admitted_valid");
  assert.equal(evaluateRequirementStructuralState({ ledger: null }).outcome, "unknown_state_rejected");
  assert.equal(evaluateRequirementStructuralState({ ledger: projectRequirementLedger([]) }).outcome, "incomplete_structural_pressure");
  assert.equal(evaluateRequirementStructuralState({ ledger: malformedLedger }).outcome, "rejected_malformed");
  assert.equal(evaluateRequirementStructuralState({ ledger: staleLedger }).outcome, "stale_or_superseded");
  assert.equal(evaluateRequirementStructuralState({ ledger: contradictoryLedger }).outcome, "contradictory_authority");
  assert.equal(evaluateRequirementStructuralState({ ledger: fpRequiredLedger }).outcome, "semantic_assessment_required");
  assert.equal(
    evaluateRequirementStructuralState({
      ledger: ledgerWithFoldResidual("partial", "semantic_assessment_required")
    }).outcome,
    "semantic_residual_preserved"
  );
  assert.equal(
    evaluateRequirementStructuralState({
      ledger: ledgerWithFoldResidual("repriced", "human_decision_required")
    }).outcome,
    "human_decision_required"
  );
  assert.equal(
    evaluateRequirementStructuralState({
      ledger: ledgerWithFoldResidual("no_close_preserved", "non_closing_evidence")
    }).outcome,
    "non_closing_preserved"
  );
});

test("T-162 replay-derived ledger fails closed on duplicate and dangling structural refs", () => {
  const events = payloads();
  const duplicateStableTerm = constructRequirementTerm({
    requirementId: "REQ-DM-DUP-STABLE",
    termKind: "atom",
    stableId: "REQ-DM-001",
    sourceRef: "specification/requirements/duplicate.md#REQ-DM-DUP-STABLE",
    sourceDigest: "sha256:dup-stable",
    text: "Duplicate stable ids shall fail closed.",
    relationRefs: [],
    spanRefs: ["span://data-mapper/derive-validation"],
    contextRefs: [],
    evidencePolicyRefs: [],
    projectionRefs: []
  });
  assert.throws(
    () => projectRequirementLedger([...events, events[0]]),
    /duplicate ref event:\/\/term/u
  );
  assert.throws(
    () => projectRequirementLedger([
      ...events,
      admitRequirementEventPayload({
        kind: "requirement_term_admitted",
        eventRef: "event://term/duplicate-stable",
        term: duplicateStableTerm
      })
    ]),
    /stableId has duplicate ref REQ-DM-001/u
  );
  assert.throws(
    () => projectRequirementLedger([
      admitRequirementEventPayload({
        kind: "requirement_term_admitted",
        eventRef: "event://dangling-term",
        term: constructRequirementTerm({
          requirementId: "REQ-DANGLING",
          termKind: "atom",
          stableId: "REQ-DANGLING",
          sourceRef: "specification/requirements/dangling.md#REQ-DANGLING",
          sourceDigest: "sha256:dangling",
          text: "Dangling term shall fail closed.",
          relationRefs: [],
          spanRefs: ["span://missing"],
          contextRefs: [],
          evidencePolicyRefs: [],
          projectionRefs: []
        })
      })
    ]),
    /dangling ref span:\/\/missing/u
  );
});

test("T-162 carried residuals keep requirements active on their remaining span", () => {
  const remainingSpan = constructTraversalSpan({
    spanId: "span://data-mapper/residual-validation",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: ["graph-vector://data-mapper/residual-validation"],
    vectorIndexes: [3],
    sourceNodeRef: "node://validation",
    targetNodeRef: "node://repair",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
  });
  const residualRef = "requirement-residual:REQ-DM-001:partial";
  const fold = constructRequirementFoldProjection({
    foldRef: "fold://req-dm-001/partial-residual",
    requirementId: "REQ-DM-001",
    projectionRefs: ["projection://req-dm-001/obligation"],
    state: "partial",
    sourceAbgTruthRefs: [],
    evidenceRefs: [],
    residualPressureRefs: [residualRef],
    reason: "partial fold carries remaining residual pressure"
  });
  const residual = constructRequirementResidualProjection({
    residualRef,
    requirementId: "REQ-DM-001",
    spanId: remainingSpan.spanId,
    pressureClass: "missing_execution_evidence",
    ownerSurface: "runtime",
    sourceFoldRefs: [fold.foldRef],
    evidenceRefs: [],
    remainingProjectionRefs: ["projection://req-dm-001/obligation"],
    reason: "remaining pressure moves to residual validation"
  });
  const ledger = projectRequirementLedger([
    ...payloads(),
    admitRequirementEventPayload({
      kind: "traversal_span_admitted",
      eventRef: "event://span/residual-validation",
      span: remainingSpan
    }),
    admitRequirementEventPayload({
      kind: "requirement_fold_projected",
      eventRef: "event://fold/partial-residual",
      fold
    }),
    admitRequirementEventPayload({
      kind: "requirement_residual_projected",
      eventRef: "event://residual/partial-residual",
      residual
    })
  ]);
  const residualEdge = {
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRef: "graph-vector://data-mapper/residual-validation",
    vectorIndex: 3,
    edge: "residual_validation"
  };
  const env = buildEdgeRequirementEnvironment({ ledger, edge: residualEdge });

  assert.deepEqual(env.activeTerms.map((term) => term.requirementId), ["REQ-DM-001"]);
  assert.deepEqual(activeRequirements({ ledger, edge: residualEdge }).map((term) => term.requirementId), ["REQ-DM-001"]);
  assert.deepEqual(env.carriedResiduals.map((row) => row.residualRef), [residualRef]);
});

test("T-162 multi-span requirements project and residualize against the active span", () => {
  const inactiveSpan = constructTraversalSpan({
    spanId: "span://data-mapper/inactive",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: ["graph-vector://data-mapper/inactive"],
    vectorIndexes: [1],
    sourceNodeRef: "node://A",
    targetNodeRef: "node://B",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
  });
  const activeSpan = constructTraversalSpan({
    spanId: "span://data-mapper/active-second",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://design",
    targetNodeRef: "node://validation",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
  });
  const term = constructRequirementTerm({
    requirementId: "REQ-DM-MULTI",
    termKind: "atom",
    stableId: "REQ-DM-MULTI",
    sourceRef: "specification/requirements/data-mapper.md#REQ-DM-MULTI",
    sourceDigest: "sha256:req-dm-multi",
    text: "Multi-span requirements shall preserve the active span.",
    relationRefs: [],
    spanRefs: [inactiveSpan.spanId, activeSpan.spanId],
    contextRefs: [],
    evidencePolicyRefs: [],
    projectionRefs: []
  });
  const ledger = projectRequirementLedger([
    admitRequirementEventPayload({
      kind: "traversal_span_admitted",
      eventRef: "event://span/inactive",
      span: inactiveSpan
    }),
    admitRequirementEventPayload({
      kind: "traversal_span_admitted",
      eventRef: "event://span/active-second",
      span: activeSpan
    }),
    admitRequirementEventPayload({
      kind: "requirement_term_admitted",
      eventRef: "event://term/multi-span",
      term
    })
  ]);
  const env = buildEdgeRequirementEnvironment({ ledger, edge });
  const projections = projectRequirements({ ledger, environment: env });
  const folds = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: []
  });
  const residuals = residualizeRequirementFolds({ environment: env, folds });

  assert.equal(projections[0].spanId, activeSpan.spanId);
  assert.equal(residuals[0].spanId, activeSpan.spanId);
});

test("T-162 attenuation classifies by residual identity, not row position", () => {
  const residualA = {
    kind: "requirement_residual_projection",
    residualRef: "requirement-residual:REQ-A:partial",
    requirementId: "REQ-A",
    spanId: "span://a",
    pressureClass: "missing_execution_evidence",
    ownerSurface: "runtime",
    sourceFoldRefs: ["fold://a"],
    evidenceRefs: [],
    remainingProjectionRefs: ["projection://a"],
    reason: "a"
  };
  const residualB = {
    kind: "requirement_residual_projection",
    residualRef: "requirement-residual:REQ-B:partial",
    requirementId: "REQ-B",
    spanId: "span://b",
    pressureClass: "semantic_assessment_required",
    ownerSurface: "runtime",
    sourceFoldRefs: ["fold://b"],
    evidenceRefs: [],
    remainingProjectionRefs: ["projection://b"],
    reason: "b"
  };
  const reordered = classifyRequirementAttenuation({
    priorResiduals: [residualA, residualB],
    residuals: [residualB, residualA]
  });
  const moved = classifyRequirementAttenuation({
    priorResiduals: [residualA],
    residuals: [{
      ...residualA,
      residualRef: "requirement-residual:REQ-A:blocked",
      pressureClass: "blocked_prerequisite"
    }]
  });

  assert.equal(reordered.attenuation, "unchanged");
  assert.equal(moved.attenuation, "moved_to_prerequisite");
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
    sourceAbgTruthRefs: [assuranceTruthRefForDecision("retry", { shallow: true })]
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

  const missingTopologyReport = evaluateRequirementCompleteness({
    environment: {
      ...env,
      activeDestinationTopologies: []
    },
    projections,
    folds,
    residuals
  });
  const topologyGate = missingTopologyReport.rows.find((row) =>
    row.gate === "destination_topology_coverage"
  );
  assert.equal(missingTopologyReport.status, "failed");
  assert.deepEqual(topologyGate?.missingRefs, ["REQ-DM-001"]);
});

test("T-162 fold state is projected from existing ABG assurance closure decisions", () => {
  const { env, projections } = environment();
  const matrix = [
    {
      expectedDecision: "close",
      expectedState: "satisfied",
      input: {}
    },
    {
      expectedDecision: "retry",
      expectedState: "partial",
      input: { shallow: true }
    },
    {
      expectedDecision: "block",
      expectedState: "blocked",
      input: { authorityRef: null }
    },
    {
      expectedDecision: "qualified_defer",
      expectedState: "deferred",
      input: {
        noEvidence: true,
        deferredAuthorityRefs: ["req://t162/assurance"]
      }
    },
    {
      expectedDecision: "reprice",
      expectedState: "repriced",
      input: {
        noEvidence: true,
        contradictoryAuthority: true
      }
    }
  ];

  for (const row of matrix) {
    const folds = foldRequirementEvidence({
      environment: env,
      projections,
      evidenceBindings: [],
      sourceAbgTruthRefs: [
        assuranceTruthRefForDecision(row.expectedDecision, row.input)
      ]
    });
    assert.equal(folds[0].state, row.expectedState);
    assert.match(folds[0].sourceAbgTruthRefs[0], /^abg:\/\/assurance-closure-decision\//u);
  }

  const synthetic = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: ["abg-truth://assurance_fold_fulfilled/current"]
  });
  const forged = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: ["abg://assurance-closure-decision/close/sha256:anything"]
  });

  assert.equal(synthetic[0].state, "no_close_preserved");
  assert.equal(forged[0].state, "no_close_preserved");
  assert.equal(
    REQUIREMENT_FOLD_STATE_MAPPING.satisfied.sourceAbgTruth,
    "AssuranceClosureDecision.decision=close"
  );
});

test("T-162 fold source truth is scoped per requirement on multi-term edges", () => {
  const secondSpan = constructTraversalSpan({
    spanId: "span://data-mapper/derive-validation-second",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://design",
    targetNodeRef: "node://validation",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
  });
  const secondTerm = constructRequirementTerm({
    requirementId: "REQ-DM-002",
    termKind: "atom",
    stableId: "REQ-DM-002",
    sourceRef: "specification/requirements/data-mapper.md#REQ-DM-002",
    sourceDigest: "sha256:req-dm-002",
    text: "Data Mapper shall carry independent closure pressure for a second term.",
    relationRefs: [],
    spanRefs: [secondSpan.spanId],
    contextRefs: [],
    evidencePolicyRefs: ["evidence-policy://component-test"],
    projectionRefs: ["projection://req-dm-002/obligation"]
  });
  const secondProjection = constructRequirementProjection({
    projectionRef: "projection://req-dm-002/obligation",
    requirementId: "REQ-DM-002",
    spanId: secondSpan.spanId,
    projectionRole: "obligation",
    authorityRole: "requirement",
    targetPath: null,
    command: null,
    fallbackCommand: null,
    evidenceRole: null,
    current: true,
    sourceRefs: [secondTerm.sourceRef],
    supersedesProjectionRefs: []
  });
  const ledger = projectRequirementLedger([
    ...payloads(),
    admitRequirementEventPayload({
      kind: "traversal_span_admitted",
      eventRef: "event://span/second",
      span: secondSpan
    }),
    admitRequirementEventPayload({
      kind: "requirement_term_admitted",
      eventRef: "event://term/second",
      term: secondTerm
    }),
    admitRequirementEventPayload({
      kind: "requirement_projection_admitted",
      eventRef: "event://projection/second",
      projection: secondProjection
    })
  ]);
  const env = buildEdgeRequirementEnvironment({ ledger, edge });
  const projections = projectRequirements({ ledger, environment: env });
  const closeRef = assuranceTruthRefForDecision("close");
  const retryRef = assuranceTruthRefForDecision("retry", { shallow: true });
  const scoped = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: [],
    sourceAbgTruthRefsByRequirementId: {
      "REQ-DM-001": [closeRef],
      "REQ-DM-002": [retryRef]
    }
  });
  const unscoped = foldRequirementEvidence({
    environment: env,
    projections,
    evidenceBindings: [],
    sourceAbgTruthRefs: [closeRef]
  });

  assert.deepEqual(
    scoped.map((fold) => [fold.requirementId, fold.state]),
    [
      ["REQ-DM-001", "satisfied"],
      ["REQ-DM-002", "partial"]
    ]
  );
  assert.deepEqual(
    unscoped.map((fold) => [fold.requirementId, fold.state]),
    [
      ["REQ-DM-001", "no_close_preserved"],
      ["REQ-DM-002", "no_close_preserved"]
    ]
  );
});
