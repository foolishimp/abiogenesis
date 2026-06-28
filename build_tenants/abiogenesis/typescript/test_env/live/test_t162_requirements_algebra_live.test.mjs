// Validates: T-162
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF,
  ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF,
  abgSemanticCompilerFpReviewGraphFunctionDigest,
  abgSemanticCompilerFpReviewPackageDigest,
  admitAbgSemanticCompilerFpReviewResult,
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  constructAbgSemanticCompilerFpReviewGraphFunction,
  constructAbgSemanticCompilerFpReviewPackageIdentity,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  deriveRuntimeAggregateProjection,
  materializeGraphFunction,
} from "../../build/semantic/code/src/index.js";
import {
  admitRequirementEventPayload,
  bindRequirementEvidence,
  buildEdgeRequirementEnvironment,
  classifyRequirementAttenuation,
  constructAuthorityContextFragment,
  constructDestinationTopology,
  constructRequirementProjection,
  constructRequirementRelation,
  constructRequirementTerm,
  constructRequirementTestRelation,
  constructTraversalSpan,
  evaluateRequirementCompleteness,
  foldRequirementEvidence,
  projectAssuranceCase,
  projectRequirementLedger,
  projectRequirements,
  queryRequirements,
  requirementAbgTruthRefFromAssuranceClosureDecision,
  residualizeRequirementFolds,
  routeContextConstraint
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t162_requirements_algebra_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T162_LIVE"] === "1" ||
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
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/u);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`live F_P worker did not return a JSON object: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function reviewPackage() {
  const deterministicReport = {
    ticket: "T-162",
    project: "abiogenesis",
    subject:
      "ABI requirements algebra live proof over semantic compiler review graph",
    closedSurfaces: [
      "worker_control_contract",
      "fd_package_grammar",
      "fd_result_grammar",
      "fd_progress_metric",
      "fd_admission_fsm",
      "fd_output_state_enum",
      "fd_derivation_rule",
      "fd_forbidden_interpretation"
    ],
    forbiddenClosureSources: [
      "downstream product suite",
      "framework authored semantic rows",
      "deterministic semantic reconstruction"
    ]
  };
  return constructAbgSemanticCompilerFpReviewPackageIdentity({
    kind: "abg_t162_requirements_algebra_live_review_package",
    packageVersion: "abg-t162-requirements-algebra-live-v1",
    subjectRef: "requirement://abiogenesis/T-162/live-project-scope",
    deterministicReportDigest: sha256(JSON.stringify(deterministicReport)),
    authorityPacketRef:
      "authority-packet://abiogenesis/t162/live-project-scope",
    objectiveRef:
      "objective://abiogenesis/t162/prove-requirements-algebra-live",
    targetArtifactRef:
      "artifact://abiogenesis/t162/live-semantic-review/result-json",
    toolBoundaryRefs: [
      "tool-boundary://abiogenesis/t162/read-authority-packet",
      "tool-boundary://abiogenesis/t162/write-review-result-json"
    ],
    stopConditionRef:
      "stop-condition://abiogenesis/t162/result-json-or-residual-pressure"
  });
}

function expectedResultFields(pkg, evidenceRefs) {
  return Object.freeze({
    kind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND,
    reviewVersion: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION,
    subjectRef: pkg.subjectRef,
    deterministicReportDigest: pkg.deterministicReportDigest,
    sourcePackageKind: pkg.kind,
    sourcePackageVersion: pkg.packageVersion,
    sourcePackageDigest: abgSemanticCompilerFpReviewPackageDigest(pkg),
    workerControlContractRef: pkg.workerControlContractRef,
    authorityPacketRef: pkg.authorityPacketRef,
    objectiveRef: pkg.objectiveRef,
    targetArtifactRef: pkg.targetArtifactRef,
    toolBoundaryRefs: pkg.toolBoundaryRefs,
    requiredArtifactDeltaKind: pkg.requiredArtifactDeltaKind,
    stopConditionRef: pkg.stopConditionRef,
    fdPackageGrammarRef: pkg.fdPackageGrammarRef,
    fdResultGrammarRef: pkg.fdResultGrammarRef,
    fdProgressTelemetryGrammarRef: pkg.fdProgressTelemetryGrammarRef,
    fdProgressMetricRef: pkg.fdProgressMetricRef,
    fdAdmissionFsmRef: pkg.fdAdmissionFsmRef,
    fdOutputStateEnumRef: pkg.fdOutputStateEnumRef,
    fdDerivationRuleRef: pkg.fdDerivationRuleRef,
    fdForbiddenInterpretation: pkg.fdForbiddenInterpretation,
    producerGraphFunctionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    producerGraphFunctionDigest: abgSemanticCompilerFpReviewGraphFunctionDigest(),
    producerRuntimeKind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND,
    producerRuntimeRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF,
    admissionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
    evidenceRefs
  });
}

function livePrompt(pkg, fields) {
  return [
    "You are the F_P worker for ABI T-162 requirements algebra live proof.",
    "Return only one JSON object. Do not wrap it in markdown.",
    "",
    "Scope:",
    "- Project: abiogenesis only.",
    "- No downstream product suite is part of this proof.",
    "- Review the ABI semantic compiler review package boundary.",
    "",
    "Acceptance:",
    "- The package declares the T-162 worker-control contract.",
    "- The package declares all F_D finite surfaces.",
    "- F_D only admits carrier shape, package identity, progress telemetry,",
    "  admission FSM, output state enum, derivation rule, and forbidden",
    "  interpretation boundary.",
    "- The semantic status is authored here by the F_P worker.",
    "- If the package satisfies the above, set status to passed and",
    "  findingCount to 0. Otherwise set status to failed and findingCount",
    "  to a positive integer.",
    "",
    "Package identity:",
    JSON.stringify(pkg, null, 2),
    "",
    "Required immutable result fields:",
    JSON.stringify(fields, null, 2),
    "",
    "Required JSON result shape:",
    JSON.stringify(
      {
        ...fields,
        status: "passed",
        findingCount: 0,
        reviewerProfileRef:
          "reviewer-profile://abiogenesis/t162/live-fp-worker",
        reviewedAt: "2026-06-27T00:00:00.000Z"
      },
      null,
      2
    )
  ].join("\n");
}

function abiRequirementEvents({ graphVectorRef, graphVectorName }) {
  const requirementId = "REQ-ABG-T162-LIVE";
  const spanId = "span://abiogenesis/t162/live-semantic-review";
  const contextRef = "context://abiogenesis/t162/live-project-scope";
  const topologyRef = "destination-topology://abiogenesis/typescript-live";
  const obligationProjectionRef = "projection://t162/live/obligation";
  const materializationProjectionRef =
    "projection://t162/live/review-result-materialization";
  const executionProjectionRef = "projection://t162/live/review-execution";
  const semanticProjectionRef =
    "projection://t162/live/semantic-interpretation";
  const testRelationRef = "test-relation://t162/live/semantic-review";
  const relationRef = "relation://t162/live/assurance";
  const edge = Object.freeze({
    graphFunctionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    graphVectorRef,
    vectorIndex: 0,
    edge: graphVectorName
  });
  const term = constructRequirementTerm({
    requirementId,
    termKind: "atom",
    stableId: requirementId,
    sourceRef:
      ".ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md",
    sourceDigest: "sha256:t162-live-ticket-scope",
    text:
      "ABI-owned requirements algebra live proof shall admit a constrained F_P review result and fold it through ABG assurance without downstream product dependency.",
    relationRefs: [relationRef],
    spanRefs: [spanId],
    contextRefs: [contextRef],
    evidencePolicyRefs: ["evidence-policy://t162/live-semantic-review"],
    projectionRefs: [
      obligationProjectionRef,
      materializationProjectionRef,
      executionProjectionRef,
      semanticProjectionRef
    ]
  });
  const span = constructTraversalSpan({
    spanId,
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://abiogenesis/t162/live-review-package",
    targetNodeRef: "node://abiogenesis/t162/live-review-result",
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: [edge.edge]
  });
  const context = constructAuthorityContextFragment({
    fragmentRef: contextRef,
    stage: "requirements",
    constraintScope: "T-162 ABI-only live proof closure",
    digest: "sha256:t162-live-context",
    promotionPolicyRef: "promotion://t162/live/remains-requirement-context",
    appliesToRefs: [requirementId, spanId, edge.edge],
    routingOutcome: "constraint_only"
  });
  const topology = constructDestinationTopology({
    topologyRef,
    frameworkRef: "tenant://abiogenesis/typescript",
    constraintRefs: ["runtime://node", "agent://claude-live-fp"],
    appliesToRefs: [requirementId, spanId]
  });
  const relation = constructRequirementRelation({
    relationId: relationRef,
    relationKind: "assurance",
    fromRequirementId: requirementId,
    toRequirementId: requirementId,
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md",
    evidenceRefs: []
  });
  const testRelation = constructRequirementTestRelation({
    relationRef: testRelationRef,
    requirementId,
    assetProjectionRef: materializationProjectionRef,
    testSourceProjectionRef: materializationProjectionRef,
    testExecutionProjectionRef: executionProjectionRef,
    interpretationProjectionRef: semanticProjectionRef,
    componentTestRootRefs: ["test_env/live"],
    evidencePolicyRef: "evidence-policy://t162/live-semantic-review"
  });
  const projections = [
    constructRequirementProjection({
      projectionRef: obligationProjectionRef,
      requirementId,
      spanId,
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
      projectionRef: materializationProjectionRef,
      requirementId,
      spanId,
      projectionRole: "materialization_target",
      authorityRole: "tenant_stack",
      targetPath: "test_env/test_runs/t162_requirements_algebra_live/result.json",
      command: null,
      fallbackCommand: null,
      evidenceRole: "asset",
      current: true,
      sourceRefs: ["target://t162/live-review-result-json"],
      supersedesProjectionRefs: []
    }),
    constructRequirementProjection({
      projectionRef: executionProjectionRef,
      requirementId,
      spanId,
      projectionRole: "execution_schedule",
      authorityRole: "tenant_stack",
      targetPath: null,
      command: "npm run test:t162:live",
      fallbackCommand: null,
      evidenceRole: "test_execution",
      current: true,
      sourceRefs: ["schedule://t162/live"],
      supersedesProjectionRefs: []
    }),
    constructRequirementProjection({
      projectionRef: semanticProjectionRef,
      requirementId,
      spanId,
      projectionRole: "evidence_expectation",
      authorityRole: "requirement",
      targetPath: null,
      command: null,
      fallbackCommand: null,
      evidenceRole: "semantic_interpretation",
      current: true,
      sourceRefs: ["semantic-review://t162/live"],
      supersedesProjectionRefs: []
    })
  ];
  const events = [
    { kind: "requirement_term_admitted", eventRef: "event://t162/live/term", term },
    { kind: "traversal_span_admitted", eventRef: "event://t162/live/span", span },
    {
      kind: "authority_context_fragment_admitted",
      eventRef: "event://t162/live/context",
      fragment: context
    },
    {
      kind: "destination_topology_admitted",
      eventRef: "event://t162/live/topology",
      topology
    },
    {
      kind: "requirement_relation_admitted",
      eventRef: "event://t162/live/relation",
      relation
    },
    {
      kind: "requirement_test_relation_admitted",
      eventRef: "event://t162/live/test-relation",
      testRelation
    },
    ...projections.map((projection, index) => ({
      kind: "requirement_projection_admitted",
      eventRef: `event://t162/live/projection/${index}`,
      projection
    }))
  ].map((payload) => admitRequirementEventPayload(payload));
  return Object.freeze({
    edge,
    requirementId,
    semanticProjectionRef,
    events
  });
}

function assuranceTruthRefForLiveReview({ result, evidenceRef }) {
  const basis = buildThreeStageBasis({ runId: "run://t162/live-review" });
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  const authorityRef = "requirement://abiogenesis/T-162/live-project-scope";
  const authoritySnapshot = constructAssuranceAuthoritySnapshot({
    scope,
    authorityRefs: [authorityRef],
    inputRefs: [result.subjectRef],
    authorityDigest: result.deterministicReportDigest,
    inputDigest: result.sourcePackageDigest,
    providerRefs: [result.reviewerProfileRef],
    policyRefs: ["policy://t162/live-fp-review-admission"]
  });
  const evidenceRow = constructAssuranceEvidenceRow({
    scope,
    evidenceRef,
    authorityRef,
    authorityDigest: result.deterministicReportDigest,
    inputDigest: result.sourcePackageDigest,
    eventRefs: [result.targetArtifactRef],
    providerRefs: [result.reviewerProfileRef],
    policyRefs: ["policy://t162/live-fp-review-admission"],
    boundToScope: true,
    complete: result.status === "passed" && result.findingCount === 0,
    shallow: false,
    contradictsAuthority: result.status !== "passed",
    deferred: false,
    lifecycle: "active"
  });
  const projection = deriveAssuranceProjection({
    basis,
    runtimeProjection,
    authoritySnapshot,
    evidenceRows: [evidenceRow]
  });
  const decision = deriveAssuranceClosureDecision(projection);
  assert.equal(decision.decision, "close");
  return requirementAbgTruthRefFromAssuranceClosureDecision(decision);
}

test("T-162 ABI live proof folds a constrained F_P review through requirements algebra", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T162_LIVE=1 or CODEX_LIVE_FP=1 to run T-162 live proof");
    return;
  }
  assert.equal(liveAgentKey(), "claude", "T-162 live proof currently uses Claude");

  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const pkg = reviewPackage();
  const evidenceRefs = [
    `file://${path.join(runRoot, "live-review-result.json")}`,
    "test://abiogenesis/t162/live-requirements-algebra"
  ];
  const fields = expectedResultFields(pkg, evidenceRefs);
  const transport = await runAgentTransport({
    contract: contractForKnownAgent("claude"),
    prompt: livePrompt(pkg, fields),
    cwd: runRoot,
    archiveRoot: runRoot,
    label: "t162-live-fp-review",
    timeoutMs: transportTimeoutMs(),
    ...executorProfileFields(),
    outputPath: path.join(runRoot, "live-review-output.txt"),
    promptPath: path.join(runRoot, "live-review-prompt.txt"),
    stdoutPath: path.join(runRoot, "live-review-stdout.log"),
    stderrPath: path.join(runRoot, "live-review-stderr.log")
  });
  assert.equal(transport.status, 0, transport.stderr);

  const candidate = extractJsonObject(transport.text);
  await writeFile(
    path.join(runRoot, "live-review-result.json"),
    `${JSON.stringify(candidate, null, 2)}\n`,
    "utf8"
  );
  const admission = admitAbgSemanticCompilerFpReviewResult({
    value: candidate,
    expectedPackage: pkg
  });
  assert.equal(admission.admitted, true, admission.reason);
  assert.equal(admission.passed, true, admission.reason);
  assert.deepEqual(admission.issues, []);
  const result = admission.result;
  assert.notEqual(result, null);
  assert.equal(result.status, "passed");
  assert.equal(result.findingCount, 0);
  assert.equal(
    result.workerControlContractRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF
  );
  assert.equal(
    result.fdForbiddenInterpretation,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION
  );
  assert.equal(
    result.requiredArtifactDeltaKind,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND
  );
  assert.equal(
    result.fdPackageGrammarRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF
  );
  assert.equal(
    result.fdResultGrammarRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF
  );
  assert.equal(
    result.fdProgressTelemetryGrammarRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF
  );
  assert.equal(
    result.fdProgressMetricRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF
  );
  assert.equal(
    result.fdAdmissionFsmRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF
  );
  assert.equal(
    result.fdOutputStateEnumRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF
  );
  assert.equal(
    result.fdDerivationRuleRef,
    ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF
  );

  const graph = materializeGraphFunction(
    constructAbgSemanticCompilerFpReviewGraphFunction()
  );
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const abiEvents = abiRequirementEvents({
    graphVectorRef: vector.id,
    graphVectorName: vector.name
  });
  const baseLedger = projectRequirementLedger(abiEvents.events);
  const environment = buildEdgeRequirementEnvironment({
    ledger: baseLedger,
    edge: abiEvents.edge
  });
  assert.deepEqual(
    environment.activeTerms.map((term) => term.requirementId),
    [abiEvents.requirementId]
  );
  const contextRoute = routeContextConstraint({
    fragment: environment.activeContextFragments[0],
    activeRefs: [abiEvents.requirementId, abiEvents.edge.edge]
  });
  assert.equal(contextRoute.applies, true);
  assert.equal(contextRoute.route, "constraint_only");

  const projections = projectRequirements({
    ledger: baseLedger,
    environment
  });
  const semanticProjection = projections.find(
    (projection) => projection.projectionRef === abiEvents.semanticProjectionRef
  );
  assert.notEqual(semanticProjection, undefined);
  const evidenceRef = result.evidenceRefs[0];
  assert.notEqual(evidenceRef, undefined);
  const evidenceBinding = bindRequirementEvidence({
    environment,
    projection: semanticProjection,
    evidenceRef,
    path: null,
    digest: sha256(JSON.stringify(result)),
    admitted: true,
    byproduct: false,
    current: true
  });
  assert.equal(evidenceBinding.evidenceRole, "semantic_interpretation");
  assert.equal(evidenceBinding.bindingStatus, "admitted");

  const sourceTruthRef = assuranceTruthRefForLiveReview({
    result,
    evidenceRef
  });
  const folds = foldRequirementEvidence({
    environment,
    projections,
    evidenceBindings: [evidenceBinding],
    sourceAbgTruthRefs: [sourceTruthRef],
    sourceAbgTruthRefsByRequirementId: {
      [abiEvents.requirementId]: [sourceTruthRef]
    }
  });
  assert.equal(folds.length, 1);
  assert.equal(folds[0].state, "satisfied");
  const residuals = residualizeRequirementFolds({ environment, folds });
  assert.deepEqual(residuals, []);
  const attenuation = classifyRequirementAttenuation({
    priorResiduals: [],
    residuals
  });
  const assuranceClaims = projectAssuranceCase({
    environment,
    folds,
    residuals
  });
  assert.deepEqual(
    assuranceClaims.map((claim) => claim.status),
    ["supported"]
  );
  const completeness = evaluateRequirementCompleteness({
    environment,
    projections,
    folds,
    residuals
  });
  assert.equal(completeness.status, "passed");

  const finalLedger = projectRequirementLedger([
    ...abiEvents.events,
    admitRequirementEventPayload({
      kind: "requirement_evidence_bound",
      eventRef: "event://t162/live/evidence",
      binding: evidenceBinding
    }),
    admitRequirementEventPayload({
      kind: "requirement_fold_projected",
      eventRef: "event://t162/live/fold",
      fold: folds[0]
    })
  ]);
  assert.equal(finalLedger.evidenceBindings.length, 1);
  assert.equal(finalLedger.folds.length, 1);

  const readModel = queryRequirements({
    environment,
    projections,
    evidenceBindings: [evidenceBinding],
    folds,
    residuals,
    attenuation,
    assuranceClaims
  });
  assert.deepEqual(readModel.requirementIds, [abiEvents.requirementId]);
  assert.deepEqual(readModel.evidenceRefs, [evidenceRef]);
  assert.deepEqual(readModel.residualRefs, []);
  assert.deepEqual(readModel.assuranceClaimRefs, [
    `requirement-assurance-claim:${abiEvents.requirementId}`
  ]);
});
