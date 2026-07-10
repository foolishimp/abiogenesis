// Validates: T-188 live closure gate
// Validates: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "../tests/support/m03-iteration-fixtures.mjs";
import * as publicRoot from "@abiogenesis/typescript-tenant";
import {
  runEngineIterate,
  constructEnginePluginContract,
  constructFpDispatchOutcome
} from "@abiogenesis/typescript-tenant";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitRequirementProofCarryThroughOutput,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructRequirementProofCandidateClassificationTable,
  constructRequirementProofCarryThroughContract,
  constructRequirementProofCarryThroughOutputEnvelope,
  projectRequirementProofCoverage,
  requirementAbgTruthRefFromRequirementProofCoverage
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  foldRequirementEvidence,
  requirementAbgTruthRefFromAssuranceClosureDecision
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";
import {
  constructGtlContractFulfillmentBinding
} from "../../build/semantic/code/src/gtl/m02/contracts/index.js";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  runTracedProcess
} from "../../build/semantic/code/src/shared/traced_process/index.js";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t188_requirement_proof_carry_through_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T188_REQUIREMENT_PROOF_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`T-188 live worker did not return JSON: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function runNode(command, args, cwd, archiveRoot, label) {
  return runTracedProcess({
    command,
    args,
    cwd,
    env: process.env,
    archiveRoot,
    label,
    timeoutMs: 120000
  });
}

function livePrompt() {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for T-188 requirement-proof carry-through.",
    "ABG owns admission, proof-coverage projection, assurance fold, and closure.",
    "Your output is candidate material only.",
    "",
    "Create a minimal JavaScript ESM subject program and a separate JavaScript ESM verifier.",
    "The subject shall print exactly `Hello, world!` followed by one newline to stdout and nothing to stderr.",
    "The verifier shall receive the subject path as process.argv[2], execute it with Node.js, and exit 0 only when stdout, stderr, and exit status match that requirement.",
    "",
    "Required JSON shape:",
    "{",
    "  \"source\": string,",
    "  \"verifierSource\": string,",
    "  \"expectedStdout\": \"Hello, world!\\n\",",
    "  \"proofDepthClasses\": string[],",
    "  \"reason\": string",
    "}",
    "",
    "proofDepthClasses must include positive and negative."
  ].join("\n");
}

function classificationTable() {
  return constructRequirementProofCandidateClassificationTable({
    tableRef: "classification-table://t188/live/plugin-output",
    sourceRef: "gtl-overlay://t188/live/software-build",
    rules: [
      {
        kind: "requirement_proof_candidate_classification_rule",
        ruleRef: "classification-rule://t188/live/transform/source-artifact",
        stageRole: "transform",
        outputCandidateKind: "candidate-kind://t188/live/source-artifact",
        admissionTargetKind: "admission-target://abg/payload",
        evidenceRoleRefs: ["evidence-role://t188/live/realization"]
      }
    ]
  });
}

function carryContract(input) {
  const table = classificationTable();
  return constructRequirementProofCarryThroughContract({
    contractRef: "plugin-proof-contract://t188/live/transform/source",
    pluginRef: "plugin://t188/live/transform/source",
    stageRole: "transform",
    resultInterfaceRef: "result-interface://t188/live/source",
    responseContractRefs: ["response-contract://t188/live/source"],
    selectedCompositionRef: "composition://t188/live/transform/source",
    selectedCompositionDigest: "sha256:t188-live-composition",
    fulfillmentBindings: [
      constructGtlContractFulfillmentBinding({
        bindingRef: "gtl-contract-fulfillment-binding://t188/live/r1-source",
        obligationRef: "requirement-obligation://t188/live/r1",
        requirementRef: "requirement://t188/live/r1",
        productRequirementRef: "product-requirement://t188/live/r1",
        designObligationRef: "design-obligation://t188/live/source",
        componentRef: "component://t188/live/source",
        productTargetRef: "target://t188/live/source",
        outputSurfaceRef: "output-surface://t188/live/source",
        functionOrEntrypointRef: "function://t188/live/transform/source",
        realizationEvidenceRefs: [input.realizationEvidenceRef],
        testOrExecutionEvidenceRefs: ["proof-obligation://t188/live/execution"],
        evaluatorFindingRef: input.evaluatorFindingRef,
        authorityRefs: ["authority://t188/live/fp-worker"],
        evidenceRefs: [input.realizationEvidenceRef, input.executionEvidenceRef]
      })
    ],
    proofPolicyRefs: ["proof-policy://t188/live/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/live/positive",
      "evidence-shape://t188/live/negative"
    ],
    proofStrengthRefs: ["proof-strength://t188/live/execution-plus-verifier"],
    depthPolicyRefs: ["proof-depth-policy://t188/live/software-build"],
    requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/live/execution-strength"],
    requiredAdversarialCheckRefs: [],
    evidenceRoleRefs: ["evidence-role://t188/live/realization"],
    outputCandidateKinds: ["candidate-kind://t188/live/source-artifact"],
    admissionTargetKinds: ["admission-target://abg/payload"],
    classificationTableRef: table.tableRef,
    classificationTableDigest: table.tableDigest
  });
}

function carryEnvelope(input) {
  return constructRequirementProofCarryThroughOutputEnvelope({
    envelopeRef: "plugin-output-envelope://t188/live/source/1",
    contractRef: "plugin-proof-contract://t188/live/transform/source",
    stageRole: "transform",
    taskRole: "task-role://t188/live/build-source",
    outputCandidateKind: "candidate-kind://t188/live/source-artifact",
    admissionTargetKind: "admission-target://abg/payload",
    sourceRequirementObligationRefs: ["requirement-obligation://t188/live/r1"],
    evidenceRoleRefs: ["evidence-role://t188/live/realization"],
    proofObligationRefs: ["proof-obligation://t188/live/execution"],
    proofPolicyRefs: ["proof-policy://t188/live/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/live/positive",
      "evidence-shape://t188/live/negative"
    ],
    positiveEvidenceShapeRefs: ["evidence-shape://t188/live/positive"],
    negativeEvidenceShapeRefs: ["evidence-shape://t188/live/negative"],
    proofStrengthRefs: ["proof-strength://t188/live/execution-plus-verifier"],
    depthPolicyRefs: ["proof-depth-policy://t188/live/software-build"],
    depthClassRefs: input.depthClassRefs,
    proofStrengthAdmissionRefs: ["proof-strength-admission://t188/live/source-test"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/live/execution-strength"],
    adversarialAttemptRefs: [],
    counterexampleRefs: [],
    responseContractRef: "response-contract://t188/live/source",
    resultInterfaceRef: "result-interface://t188/live/source",
    selectedCompositionRef: "composition://t188/live/transform/source",
    selectedCompositionDigest: "sha256:t188-live-composition",
    replayIdentity: "replay://t188/live/source/1",
    evidenceRefs: [input.realizationEvidenceRef, input.executionEvidenceRef]
  });
}

function dependencyTruth() {
  return constructDerivedDependencyInstructionTruth({
    truthRef: "dependency-instruction-truth://t188/live/source-to-test",
    workKind: "target_work",
    dependencyGraphRef: null,
    dependencyGraphDigest: null,
    targetRefs: ["target://t188/live/source"],
    prerequisiteNodeRefs: [],
    prerequisiteEdgeRefs: [],
    dependencyClosed: true,
    typedPrerequisiteGapRefs: [],
    noDependencyPolicyRef: "policy://t188/live/no-dependency-graph-required",
    sourceProjectionRefs: ["projection://t188/live/no-dependency-policy"]
  });
}

function proofDepthTruth(input) {
  return constructDerivedProofDepthInstructionTruth({
    truthRef: `proof-depth-instruction-truth://t188/live/${input.label}`,
    depthPolicyRef: "proof-depth-policy://t188/live/software-build",
    depthPolicyDigest: "sha256:t188-live-depth-policy",
    targetRefs: ["target://t188/live/source"],
    requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
    declaredDepthClassRefs: input.depthClassRefs,
    declaredDepthObligationRefs: input.depthClassRefs.map((ref) =>
      ref.replace("depth-class://", "proof-obligation://t188/live/depth/")
    ),
    notApplicableDepthClassRefs: [],
    typedDepthGapRefs: input.typedDepthGapRefs,
    proofStrengthAdmissionRefs: ["proof-strength-admission://t188/live/source-test"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/live/execution-strength"],
    adversarialVerificationRefs: [],
    adversarialCounterexampleRefs: [],
    sourceProjectionRefs: ["proof-coverage-projection://t188/live/source"]
  });
}

function foldFixture() {
  const requirementId = "requirement://t188/live/r1";
  const projectionRef = "requirement-projection://t188/live/r1/source";
  return {
    requirementId,
    environment: {
      kind: "edge_requirement_environment",
      environmentRef: "edge-requirement-environment://t188/live/source-to-test",
      edge: {
        graphFunctionRef: "graph-function://t188/live/software-build",
        graphVectorRef: "vector://t188/live/source-to-test",
        vectorIndex: 0,
        edge: "edge://t188/live/source-to-test"
      },
      activeTerms: [
        {
          kind: "requirement_term",
          requirementId,
          termKind: "requirement",
          stableId: "REQ-T188-LIVE-R1",
          sourceRef: "requirement-source://t188/live/r1",
          sourceDigest: "sha256:t188-live-r1",
          text: "Build source and proof for the selected live slice.",
          relationRefs: [],
          spanRefs: ["span://t188/live/source-to-test"],
          contextRefs: [],
          evidencePolicyRefs: ["proof-policy://t188/live/positive-negative"],
          projectionRefs: [projectionRef]
        }
      ],
      activeRelations: [],
      activeSpans: [
        {
          kind: "traversal_span",
          spanId: "span://t188/live/source-to-test",
          graphFunctionRef: "graph-function://t188/live/software-build",
          graphVectorRefs: ["vector://t188/live/source-to-test"],
          vectorIndexes: [0],
          sourceNodeRef: "node://t188/live/requirement",
          targetNodeRef: "node://t188/live/source",
          frameRefs: [],
          zoomRefs: [],
          foldbackRefs: [],
          aliasRefs: []
        }
      ],
      activeContextFragments: [],
      activeDestinationTopologies: [],
      activeTestRelations: [],
      priorFolds: [],
      carriedResiduals: []
    },
    projections: [
      {
        kind: "requirement_projection",
        projectionRef,
        requirementId,
        spanId: "span://t188/live/source-to-test",
        projectionRole: "obligation",
        authorityRole: "requirement",
        targetPath: null,
        command: null,
        fallbackCommand: null,
        evidenceRole: "asset",
        current: true,
        sourceRefs: ["requirement-source://t188/live/r1"],
        supersedesProjectionRefs: []
      }
    ],
    evidenceBindings: [
      {
        kind: "requirement_evidence_binding",
        evidenceRef: "evidence://t188/live/source/artifact",
        requirementId,
        projectionRef,
        evidenceRole: "asset",
        bindingStatus: "admitted",
        path: null,
        digest: "sha256:t188-live-source-artifact",
        current: true,
        supersedesEvidenceRefs: [],
        reason: "admitted live plugin output proof carry-through"
      }
    ]
  };
}

function assuranceCloseTruthRef() {
  return requirementAbgTruthRefFromAssuranceClosureDecision({
    kind: "assurance_closure_decision",
    decision: "close",
    projectionRef: "assurance-projection://t188/live/source-to-test"
  });
}

function foldWithCoverage(input) {
  return foldRequirementEvidence({
    environment: input.fixture.environment,
    projections: input.fixture.projections,
    evidenceBindings: input.fixture.evidenceBindings,
    sourceAbgTruthRefs: [],
    sourceAbgTruthRefsByRequirementId: {
      [input.fixture.requirementId]: [
        requirementAbgTruthRefFromRequirementProofCoverage(input.coverage),
        assuranceCloseTruthRef()
      ]
    }
  });
}

test("T-188 live F_P output closes only with admitted depth and preserves residual when depth is incomplete", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T188_REQUIREMENT_PROOF_LIVE=1 or CODEX_LIVE_FP=1 to run T-188 live proof");
    return;
  }
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const startedAt = Date.now();
  const transport = await runAgentTransport({
    contract: contractForKnownAgent(process.env.ABG_TS_LIVE_AGENT ?? "claude"),
    prompt: livePrompt(),
    cwd: runRoot,
    archiveRoot: runRoot,
    label: "t188-requirement-proof-carry-through-live",
    timeoutMs: Number.parseInt(process.env.ABG_TS_LIVE_TIMEOUT_MS ?? "600000", 10),
    outputPath: path.join(runRoot, "worker-output.txt"),
    promptPath: path.join(runRoot, "worker-prompt.txt"),
    stdoutPath: path.join(runRoot, "worker-stdout.log"),
    stderrPath: path.join(runRoot, "worker-stderr.log")
  });
  assert.equal(transport.status, 0, transport.stderr);
  const worker = extractJsonObject(transport.text);
  assert.equal(worker.expectedStdout, "Hello, world!\n");
  assert.equal(Array.isArray(worker.proofDepthClasses), true);
  assert.equal(worker.proofDepthClasses.includes("positive"), true);
  assert.equal(worker.proofDepthClasses.includes("negative"), true);

  const sourcePath = path.join(runRoot, "subject.mjs");
  const verifierPath = path.join(runRoot, "verifier.mjs");
  await writeFile(sourcePath, worker.source, "utf8");
  await writeFile(verifierPath, worker.verifierSource, "utf8");
  const subjectRun = await runNode(
    process.execPath,
    [sourcePath],
    runRoot,
    path.join(runRoot, "subject-run"),
    "t188-live-subject"
  );
  assert.equal(subjectRun.status, 0);
  assert.equal(subjectRun.stdout, "Hello, world!\n");
  assert.equal(subjectRun.stderr, "");
  const verifierRun = await runNode(
    process.execPath,
    [verifierPath, sourcePath],
    runRoot,
    path.join(runRoot, "verifier-run"),
    "t188-live-verifier"
  );
  assert.equal(verifierRun.status, 0, verifierRun.stderr);

  const realizationEvidenceRef = `file://${sourcePath}`;
  const executionEvidenceRef = `file://${verifierPath}`;
  const contract = carryContract({
    realizationEvidenceRef,
    executionEvidenceRef,
    evaluatorFindingRef: "evaluator-finding://t188/live/source-build"
  });
  // Engine-driven (B3): both scenarios run through runEngineIterate with the
  // REAL worker evidence — the verifier execution ref is the strength
  // evidence; nothing below hand-calls admission, coverage, or fold.
  const requirementId = "requirement://t188/live/r1";
  const table = classificationTable();
  const baseContract = carryContract({
    realizationEvidenceRef,
    executionEvidenceRef,
    evaluatorFindingRef: "evaluator-finding://t188/live/source-build"
  });
  const engineContract = constructRequirementProofCarryThroughContract({
    ...baseContract,
    fdStrengthCriterionRefs: [executionEvidenceRef]
  });
  const templateBase = carryEnvelope({
    realizationEvidenceRef,
    executionEvidenceRef,
    depthClassRefs: ["depth-class://positive", "depth-class://negative"]
  });
  const engineTemplate = (depthClassRefs) => {
    const { envelopeRef, evidenceRefs, replayIdentity, replayDigest, kind, ...rest } =
      templateBase;
    return {
      ...rest,
      depthClassRefs,
      proofStrengthAdmissionRefs: [executionEvidenceRef],
      fdStrengthCriterionRefs: [executionEvidenceRef]
    };
  };
  const engineRun = (depthClassRefs) => {
    const base = buildThreeStageBasis({ defaultRegime: "F_P" });
    const basis = Object.freeze({
      ...base,
      startIntent: Object.freeze({ ...base.startIntent, until: "first_traversal" })
    });
    const vector = basis.graph.vectors[0];
    const spanId = `span://t188/live/${vector.id}`;
    const bundle = publicGtlRequirements.declareBundle({
      requirements: [
        publicGtlRequirements.declareRequirement({
          requirementId,
          termKind: "atom",
          stableId: requirementId,
          sourceRef:
            "specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md#013",
          sourceDigest: "sha256:t188-live-requirement",
          relationRefs: [],
          spanRefs: [spanId],
          contextRefs: [],
          evidencePolicyRefs: ["policy://t188/live-evidence"]
        })
      ],
      spans: [
        publicGtlRequirements.declareTraversalSpan({
          spanId,
          graphFunctionRef: basis.graphFunction.id,
          graphVectorRefs: [vector.id],
          vectorIndexes: [0],
          sourceNodeRef: vector.source[0].id,
          targetNodeRef: vector.target.id
        })
      ]
    });
    const events = [];
    const result = runEngineIterate({
      basis,
      eventSink: (event) => events.push(event),
      ...m03InstructionAssemblyRequestFields(basis),
      requirementRouteDeclarationBundle: bundle,
      requirementProofCarryThroughStartup: {
        entries: [
          {
            contract: engineContract,
            classificationTable: table,
            requirementIds: [requirementId],
            envelopeTemplate: engineTemplate(depthClassRefs)
          }
        ]
      },
      plugins: {
        fpDispatch: Object.freeze({
          contract: constructEnginePluginContract({
            driverRequirement: "sync_compatible",
            ref: "plugin://t188/live/fp-dispatch",
            pluginKind: "fp_dispatch",
            authority: "effect_plugin",
            inputCarrier: "EnginePluginInput",
            outputCarrier: "FpDispatchOutcome"
          }),
          dispatch(input) {
            const assessmentIds =
              input.expectedAssessmentIds.length > 0
                ? input.expectedAssessmentIds
                : ["runtime_fulfilled"];
            return constructFpDispatchOutcome({
              status: "dispatched",
              resultRef: `result://t188/live/${input.vectorIndex}`,
              attachedResultArtifact: {
                edge: input.expectedEdge ?? input.edge,
                actor: "codex",
                fulfillment_assessments: assessmentIds.map((assessmentId) => ({
                  id: assessmentId,
                  evaluator: assessmentId,
                  fulfillment_status: "fulfilled",
                  fulfillment_detail: "live worker artifacts verified",
                  blocking_reasons: [],
                  evidence_refs: [executionEvidenceRef, realizationEvidenceRef]
                })),
                selected_worker_id: input.workerId,
                selected_backend: input.backendId,
                role_id: "role://runtime",
                assignment_source: "policy_resolution",
                resolved_runtime_ref: input.resolvedRuntimeRef
              },
              evidenceRefs: []
            });
          }
        }),
        fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
      }
    });
    const carry = result.replayEvents.find(
      (event) => event.kind === "requirement_proof_carry_through_admitted"
    );
    const fold = result.replayEvents.find(
      (event) =>
        event.kind === "requirement_route_fact_projected" &&
        event.routePayloadKind === "requirement_fold_projected"
    );
    return { carry, fold };
  };

  const full = engineRun(["depth-class://positive", "depth-class://negative"]);
  assert.ok(full.carry);
  assert.equal(full.carry.accepted, true);
  assert.deepEqual(full.carry.coverageStatuses, ["eligible"]);
  assert.equal(full.fold.requirementPayload.fold.state, "satisfied");

  const shallow = engineRun(["depth-class://positive"]);
  assert.ok(shallow.carry);
  assert.equal(shallow.carry.coverageStatuses[0], "residual");
  assert.equal(
    shallow.carry.coverageIssueKinds.includes("missing_depth_obligation_class"),
    true
  );
  assert.equal(shallow.fold.requirementPayload.fold.state, "no_close_preserved");


  const summary = {
    kind: "t188_requirement_proof_carry_through_live_summary",
    runRoot,
    durationMs: Date.now() - startedAt,
    workerOutputDigest: sha256Text(transport.text),
    sourceDigest: sha256Text(worker.source),
    verifierDigest: sha256Text(worker.verifierSource),
    fullCarry: {
      statuses: full.carry.coverageStatuses,
      truthRefs: full.carry.coverageTruthRefs
    },
    shallowCarry: {
      statuses: shallow.carry.coverageStatuses,
      issueKinds: shallow.carry.coverageIssueKinds
    },
    fullFold: { state: full.fold.requirementPayload.fold.state },
    shallowFold: { state: shallow.fold.requirementPayload.fold.state },
    subjectRun: {
      status: subjectRun.status,
      stdout: subjectRun.stdout,
      stderr: subjectRun.stderr
    },
    verifierRun: {
      status: verifierRun.status,
      stdout: verifierRun.stdout,
      stderr: verifierRun.stderr
    }
  };
  await writeJson(path.join(runRoot, "t188-requirement-proof-live-summary.json"), summary);
  const persisted = JSON.parse(
    await readFile(path.join(runRoot, "t188-requirement-proof-live-summary.json"), "utf8")
  );
  assert.equal(persisted.fullFold.state, "satisfied");
  assert.equal(persisted.shallowFold.state, "no_close_preserved");
});
