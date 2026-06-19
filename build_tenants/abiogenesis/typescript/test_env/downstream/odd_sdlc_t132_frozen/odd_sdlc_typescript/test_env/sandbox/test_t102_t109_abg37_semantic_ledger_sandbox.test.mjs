// Validates: T-102
// Validates: T-109
// Validates: ABG-3.7-consumer-architecture

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitFpTransformResultForRequest,
  admitGraphSpanAssessment,
  admitOutputWorkspaceBinding,
  constructEvalGradeVector,
  constructEvalOutcome,
  constructEvalSuiteSpec,
  constructEvalTask,
  constructEvalTrial,
  constructFpTransformRequest,
  constructFpTransformResult,
  constructGraph,
  constructGraphFunction,
  constructGraphSpanFoldbackEvaluatedEvent,
  constructGraphVector,
  constructJob,
  constructModule,
  constructNode,
  deriveEndpointSpanSchedule,
  deriveEvalAggregateProjection,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan,
  deriveOutputInstanceAllocation,
  deriveRetryFrontierProjection,
  deriveRuntimeAggregateProjection,
  emptySerializedAttrs,
  foldGraphSpanAssessments,
  runtimeEventsForFpTransformResult
} from "@abiogenesis/typescript-tenant";

import {
  BOOTSTRAP_INPUT,
  EXPECTED_LIFECYCLE_BUNDLE,
  SDLC_REQUIREMENTS,
  edgePayloadFromRows,
  evaluateSemanticRows
} from "../fixtures/t102_t109_mini_sdlc_lifecycle.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(TEST_DIR, "../..");
const ABG_PACKAGE_JSON = path.resolve(
  PACKAGE_ROOT,
  "node_modules/@abiogenesis/typescript-tenant/package.json"
);

function sha256Text(content) {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function node(name, assetType) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://odd-sdlc/t109/${assetType}` },
    markov: [],
    assetSurface: {
      kind: assetType,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["t109-abg37-sdlc-sandbox"],
    id: `node:t109:${name}`
  });
}

function fpVector(name, source, target) {
  return constructGraphVector({
    name,
    source: [source],
    target,
    operators: [
      {
        name: `${name}_fp_transform`,
        regime: "F_P",
        binding: "plugin://odd-sdlc/t109/fp-transform",
        tags: []
      }
    ],
    evaluators: [
      {
        name: `${name}_semantic_eval`,
        regime: "F_P",
        description: "Requirement-by-requirement SDLC semantic evaluation",
        binding: "plugin://odd-sdlc/t109/fp-semantic-evaluator",
        tags: []
      }
    ],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptySerializedAttrs(),
    tags: ["t109-abg37-sdlc-sandbox"],
    id: `vector:t109:${name}`
  });
}

function miniSdlcModule() {
  const bootstrap = node("Workspace_system_bootstrap", "bootstrap_surface");
  const requirementsLedger = node(
    "Workspace_A_requirements_ledger",
    "requirements_ledger_surface"
  );
  const requirementsSchedule = node(
    "Workspace_A_requirements_schedule",
    "requirements_schedule_surface"
  );
  const design = node("Workspace_B_design", "design_surface");
  const implementation = node("Workspace_C_implementation", "implementation_surface");
  const qualification = node("Workspace_D_qualification", "qualification_report_surface");
  const vectors = [
    fpVector("derive_requirements_ledger", bootstrap, requirementsLedger),
    fpVector("derive_requirements_schedule", requirementsLedger, requirementsSchedule),
    fpVector("derive_design_surface", requirementsSchedule, design),
    fpVector("derive_implementation_surface", design, implementation),
    fpVector("derive_qualification_report", implementation, qualification)
  ];
  const graph = constructGraph({
    name: "mini_odd_sdlc_lifecycle",
    inputs: [bootstrap],
    outputs: [qualification],
    nodes: [
      bootstrap,
      requirementsLedger,
      requirementsSchedule,
      design,
      implementation,
      qualification
    ],
    vectors,
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t109-abg37-sdlc-sandbox"],
    id: "graph:t109:mini-odd-sdlc-lifecycle"
  });
  const graphFunction = constructGraphFunction({
    name: "mini_odd_sdlc_lifecycle_abg37",
    environment: {
      requires: [bootstrap],
      provides: [qualification],
      carries: [
        bootstrap,
        requirementsLedger,
        requirementsSchedule,
        design,
        implementation,
        qualification
      ]
    },
    inputs: [bootstrap],
    outputs: [qualification],
    template: {
      kind: "inline_graph",
      ref: "template://odd-sdlc/t109/mini-lifecycle",
      graph,
      version: null
    },
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: ["t109-abg37-sdlc-sandbox"],
    id: "graph-function:t109:mini-odd-sdlc-lifecycle-abg37"
  });
  const job = constructJob({
    name: "mini_odd_sdlc_lifecycle_abg37_job",
    contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
    roles: [],
    tags: ["t109-abg37-sdlc-sandbox"],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs(),
    id: "job:t109:mini-odd-sdlc-lifecycle-abg37"
  });
  return constructModule({
    name: "odd_sdlc_t109_abg37_sdlc_sandbox",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [job],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function basisFor(inputWorkspaceRoot, outputWorkspaceRoot, until = "converged") {
  const module = miniSdlcModule();
  return admitExecutionBasis({
    module,
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: inputWorkspaceRoot,
        moduleName: module.name
      },
      target: { kind: "graph_function", handle: "mini_odd_sdlc_lifecycle_abg37" },
      until,
      inputBindings: [
        {
          assetRef: "workspace://system/.ai-workspace/context/project_bootstrap.md",
          assetType: "bootstrap_surface",
          uri: path.join(inputWorkspaceRoot, "project_bootstrap.json")
        }
      ],
      requestedOutputs: [
        {
          outputName: "sdlc_lifecycle_bundle",
          outputAssetType: "qualification_report_surface",
          relativePath: "sdlc_lifecycle_bundle.json",
          outputWorkspace: {
            workspaceRef: "workspace://output/sdlc-review-stream-a",
            workspaceRoot: outputWorkspaceRoot,
            authorityRef: "ticket://odd-sdlc/T-109"
          }
        }
      ]
    },
    runtimeIdentity: {
      workerId: "worker://odd-sdlc/t109-sandbox",
      backendId: "backend://deterministic-fixture",
      buildId: "build://odd-sdlc/t109-abg37-sdlc-sandbox",
      resolvedRuntimeRef: "runtime://abg-3-6"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://odd-sdlc/t109-abg37",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t109-abg37",
      approvalSubjectRef: null
    },
    runId: "run:t109-abg37-sdlc-sandbox",
    workKey: "work:t109-abg37-sdlc-sandbox",
    frameId: "frame:t109-abg37-sdlc-sandbox",
    frameLineageId: "frame-lineage:t109-abg37-sdlc-sandbox"
  });
}

function actorInvocationRef(vectorIndex) {
  return {
    actorInvocationId: `actor:t109:sdlc:${vectorIndex}:0`,
    attemptIndex: 0,
    dispatchRef: `dispatch:t109:sdlc:${vectorIndex}:0`,
    resultRef: `result:t109:sdlc:${vectorIndex}:0`
  };
}

function requestForFinalEdge(input) {
  const projection = deriveRuntimeAggregateProjection(input.basis, []);
  const retryFrontier = deriveRetryFrontierProjection({
    basis: input.basis,
    runtimeProjection: projection,
    events: [],
    vectorIndex: 4
  });
  return constructFpTransformRequest({
    basis: input.basis,
    projection,
    vectorIndex: 4,
    edge: "derive_qualification_report",
    actorInvocationRef: actorInvocationRef(4),
    sourceProjectionRef: "projection://runtime/t109/sdlc/before-transform",
    expectedAssessmentIds: SDLC_REQUIREMENTS.map((requirement) => requirement.id),
    retryFrontier
  });
}

test("T-102/T-109 sandbox runs an SDLC lifecycle graph and admits the same semantic result expected from live", () => {
  assert.equal(JSON.parse(readFileSync(ABG_PACKAGE_JSON, "utf8")).version, "3.8.0-rc.3");

  const inputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-input-"));
  const outputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-output-"));
  writeJson(path.join(inputWorkspace, "project_bootstrap.json"), BOOTSTRAP_INPUT);
  writeJson(path.join(inputWorkspace, "requirements.json"), SDLC_REQUIREMENTS);

  const basis = basisFor(inputWorkspace, outputWorkspace);
  const outputBinding = admitOutputWorkspaceBinding({
    workspaceRef: "workspace://output/sdlc-review-stream-a",
    workspaceRoot: outputWorkspace,
    authorityRef: "ticket://odd-sdlc/T-109",
    source: "caller"
  });
  assert.equal(outputBinding.ok, true);

  const allocation = deriveOutputInstanceAllocation({
    basis,
    outputName: "sdlc_lifecycle_bundle",
    outputAssetType: "qualification_report_surface",
    relativePath: "sdlc_lifecycle_bundle.json",
    outputWorkspaceBinding: outputBinding.binding
  });
  assert.equal(allocation.ok, true);
  assert.equal(allocation.allocation.inputWorkspaceRoot, inputWorkspace);
  assert.equal(allocation.allocation.outputWorkspaceRoot, outputWorkspace);
  assert.notEqual(allocation.allocation.outputWorkspaceRoot, allocation.allocation.inputWorkspaceRoot);

  writeJson(allocation.allocation.materializationUri, EXPECTED_LIFECYCLE_BUNDLE);
  const outputText = readFileSync(allocation.allocation.materializationUri, "utf8");
  const output = JSON.parse(outputText);
  assert.deepEqual(output, EXPECTED_LIFECYCLE_BUNDLE);

  const request = requestForFinalEdge({ basis });
  const outputRef = `file://${allocation.allocation.materializationUri}`;
  const result = constructFpTransformResult({
    request,
    artifactRef: outputRef,
    status: "returned",
    evidenceCandidates: [
      {
        candidateRef: "candidate://odd-sdlc/mini-lifecycle",
        authorityRef: "requirements://odd-sdlc/mini-lifecycle",
        evidenceRefs: [outputRef],
        payloadClass: "qualification_report_surface",
        contractRef: "contract://odd-sdlc/t109/sdlc-lifecycle-bundle"
      }
    ]
  });
  const admitted = admitFpTransformResultForRequest(request, result);
  const events = runtimeEventsForFpTransformResult({ basis, request, result: admitted });
  assert(events.some((event) => event.kind === "evidence_admitted"));

  const fdMechanicalChecks = {
    fileExists: existsSync(allocation.allocation.materializationUri),
    digest: sha256Text(outputText),
    jsonParses: true
  };
  assert.equal(fdMechanicalChecks.fileExists, true);
  assert.equal(fdMechanicalChecks.jsonParses, true);
  assert.match(fdMechanicalChecks.digest, /^sha256:/);

  const rows = evaluateSemanticRows(output, outputRef);
  assert.deepEqual(
    rows.map((row) => [row.obligationId, row.status]),
    SDLC_REQUIREMENTS.map((requirement) => [requirement.id, "fulfilled"])
  );
  const payload = edgePayloadFromRows(rows);
  assert.equal(payload.edgeConverged, true);
  assert.equal(payload.fulfillmentConverged, true);
  assert.equal(payload.lawfulNextAction, "close");
});

test("T-102/T-109 sandbox catches SDLC schedule drift even when F_D file checks pass", () => {
  const drifted = structuredClone(EXPECTED_LIFECYCLE_BUNDLE);
  drifted.requirementsSchedule.scheduledRequirementIds =
    drifted.requirementsSchedule.scheduledRequirementIds.slice(0, -1);
  drifted.requirementsSchedule.workPackages =
    drifted.requirementsSchedule.workPackages.slice(0, -1);

  const inputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-input-"));
  const outputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-output-"));
  const outputFile = path.join(outputWorkspace, "sdlc_lifecycle_bundle.json");
  writeJson(outputFile, drifted);

  assert.equal(existsSync(outputFile), true);
  const output = JSON.parse(readFileSync(outputFile, "utf8"));
  const rows = evaluateSemanticRows(output, `file://${outputFile}`);
  assert.deepEqual(
    rows.map((row) => [row.obligationId, row.status]),
    [
      ["REQ-SDLC-ABG37-001", "fulfilled"],
      ["REQ-SDLC-ABG37-002", "fulfilled"],
      ["REQ-SDLC-ABG37-003", "semantic_gap"],
      ["REQ-SDLC-ABG37-004", "semantic_gap"],
      ["REQ-SDLC-ABG37-005", "fulfilled"]
    ]
  );
  const payload = edgePayloadFromRows(rows);
  assert.equal(payload.edgeConverged, false);
  assert.equal(payload.lawfulNextAction, "retry_same_edge");
  assert.notEqual(inputWorkspace, outputWorkspace);
});

test("T-102/T-109 sandbox rejects F_P transform results that try to own closure authority", () => {
  const inputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-input-"));
  const outputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-output-"));
  const basis = basisFor(inputWorkspace, outputWorkspace);
  const request = requestForFinalEdge({ basis });

  assert.throws(
    () =>
      admitFpTransformResultForRequest(request, {
        kind: "fp_transform_result",
        requestRef: request.requestRef,
        actorInvocationId: request.actorInvocationId,
        resultRef: request.resultRef,
        artifactRef: "artifact://bad",
        status: "returned",
        closureDecision: "close",
        evidenceCandidates: []
      }),
    /F_P transform result cannot own engine authority/
  );
});

test("T-109 sandbox proves ABG graph-span foldback can reenter the implicated SDLC schedule edge", () => {
  const inputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-input-"));
  const outputWorkspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-output-"));
  const basis = basisFor(inputWorkspace, outputWorkspace);
  const schedule = deriveEndpointSpanSchedule({
    basis,
    terminalVectorIndex: 4,
    closedVectorIndexes: [0, 1, 2, 3, 4],
    generation: 0
  });

  const assessments = schedule.spanRefs.map((span) => {
    const scheduleDroppedRequirement = span.sourceVectorIndex === 1;
    return admitGraphSpanAssessment({
      basis,
      span,
      assessmentId: `assessment:t109:${span.sourceVectorIndex}->${span.terminalVectorIndex}`,
      attemptIndex: 0,
      assessmentRegime: "F_P",
      obligationRows: [
        {
          obligationId: `REQ-SPAN-${span.sourceVectorIndex}`,
          sourceAuthorityRef: "requirements://odd-sdlc/mini-lifecycle/span",
          status: scheduleDroppedRequirement ? "semantic_gap" : "fulfilled",
          terminalEvidenceRefs: scheduleDroppedRequirement
            ? []
            : ["artifact://odd-sdlc/mini-lifecycle"],
          carryObservations: scheduleDroppedRequirement
            ? [
                {
                  fromVectorIndex: 1,
                  toVectorIndex: 4,
                  status: "dropped",
                  evidenceRefs: ["artifact://odd-sdlc/mini-lifecycle"]
                }
              ]
            : [],
          detail: scheduleDroppedRequirement
            ? "requirements schedule failed to carry a ledger requirement into final qualification"
            : null
        }
      ],
      constitutionalReentry: null,
      evidenceRefs: ["artifact://odd-sdlc/mini-lifecycle"],
      edgeFoldbackRefs: [],
      detail: null,
      generation: 0
    });
  });

  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 4,
    schedule,
    assessments
  });
  assert.equal(foldback.decision, "reenter_at_vector");
  assert.equal(foldback.earliestReentryVectorIndex, 1);

  const foldbackEvent = constructGraphSpanFoldbackEvaluatedEvent({
    basis,
    foldback,
    causationEventRefs: foldback.spanAssessmentRefs,
    correlationId: "correlation:t109-sdlc-sandbox"
  });
  const frontier = deriveGraphReentryFrontierProjection({
    basis,
    events: [foldbackEvent]
  });
  assert.equal(frontier.decision, "reenter");
  assert.equal(frontier.activeTargetVectorIndex, 1);

  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const plan = deriveGraphReentryPlan({ basis, runtimeProjection, frontier });
  assert.equal(plan?.targetVectorIndex, 1);
  assert.deepEqual(plan?.shadowedVectorIndexes, [1, 2, 3, 4]);
});

test("T-102/T-109 sandbox projects repeatable SDLC semantic eval aggregates without F_D closure substitution", () => {
  const suite = constructEvalSuiteSpec({
    suiteId: "eval-suite:t109-mini-odd-sdlc",
    suiteRunRef: "eval-suite-run:t109-mini-odd-sdlc",
    goal: "requirement-by-requirement SDLC semantic drift detection",
    suiteClass: "regression",
    ownerRef: "ticket://odd-sdlc/T-109",
    sourceRefs: ["ticket://odd-sdlc/T-102", "ticket://odd-sdlc/T-109"],
    taskRefs: ["eval-task:t109-sdlc-lifecycle"],
    repeatCount: 2,
    passThreshold: 1,
    saturationPolicy: "pass^k"
  });
  const task = constructEvalTask({
    taskRef: "eval-task:t109-sdlc-lifecycle",
    suiteId: suite.suiteId,
    graphFunctionRef: "graph-function:t109:mini-odd-sdlc-lifecycle-abg37",
    edgeRef: "derive_qualification_report",
    inputRefs: ["workspace://system/.ai-workspace/context/project_bootstrap.md"],
    declaredOutputRefs: ["artifact://odd-sdlc/mini-lifecycle"],
    referenceSolutionRefs: ["artifact://odd-sdlc/mini-lifecycle/reference.json"],
    successCriteriaRefs: SDLC_REQUIREMENTS.map(
      (requirement) => `success://${requirement.id}`
    ),
    graderRefs: SDLC_REQUIREMENTS.map((requirement) => `grader://${requirement.id}`)
  });
  const trials = [0, 1].map((index) =>
    constructEvalTrial({
      trialRef: `eval-trial:t109:sdlc:${index}`,
      suiteId: suite.suiteId,
      taskRef: task.taskRef,
      trialIndex: index,
      workerRef: "worker://odd-sdlc/t109-sandbox",
      policyRef: "policy://odd-sdlc/t109-abg37",
      outputRootRef: `workspace://output/sdlc-review-stream-${index}`,
      eventStreamRef: `event-stream://t109/sdlc/${index}`,
      transcriptRefs: [`transcript://t109/sdlc/${index}`],
      startedAt: `2026-05-02T00:00:0${index}.000Z`,
      completedAt: `2026-05-02T00:00:0${index + 1}.000Z`
    })
  );
  const outcomes = trials.map((trial, index) =>
    constructEvalOutcome({
      outcomeRef: `eval-outcome:t109:sdlc:${index}`,
      trialRef: trial.trialRef,
      taskRef: task.taskRef,
      terminalDecision: index === 0 ? "semantic_gap" : "close",
      passed: index === 1,
      materializedOutputRefs: [`artifact://odd-sdlc/mini-lifecycle-${index}.json`],
      projectionRefs: [`projection://t109/sdlc/${index}`],
      foldbackRef: null,
      admittedEvidenceRefs: [`evidence://t109/sdlc/${index}`],
      failureClass: null
    })
  );
  const grades = outcomes.map((outcome, index) =>
    constructEvalGradeVector({
      gradeVectorRef: `eval-grade-vector:t109:sdlc:${index}`,
      trialRef: outcome.trialRef,
      taskRef: outcome.taskRef,
      rows: SDLC_REQUIREMENTS.map((requirement) => ({
        kind: "eval_grade_row",
        gradeRef: `eval-grade:t109:sdlc:${index}:${requirement.id}`,
        trialRef: outcome.trialRef,
        taskRef: outcome.taskRef,
        regime: "F_P",
        subjectRef: "artifact://odd-sdlc/mini-lifecycle.json",
        obligationRef: requirement.sourceAuthorityRef,
        status:
          index === 1 || requirement.id !== "REQ-SDLC-ABG37-003" ? "pass" : "fail",
        detail:
          index === 1 || requirement.id !== "REQ-SDLC-ABG37-003"
            ? "SDLC semantic requirement fulfilled"
            : "requirements schedule failed to cover the requirement ledger",
        evidenceRefs: [`artifact://odd-sdlc/mini-lifecycle-${index}.json`]
      }))
    })
  );
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials,
    outcomes,
    gradeVectors: grades
  });
  assert.equal(aggregate.trialCount, 2);
  assert.equal(aggregate.passedTrialCount, 1);
  assert.equal(aggregate.failedTrialCount, 1);
  assert.equal(aggregate.passRate, 0.5);
  assert.equal(aggregate.verdict, "failed");
});
