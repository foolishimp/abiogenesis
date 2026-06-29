// Validates: T-173 live closure gate
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-014
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  runTracedProcess
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";
import {
  assertRequirementRouteReplayArtifact,
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t173_generic_proof_evidence_live"
);

const REQUIREMENT_ID = "REQ-T173-GENERIC-PROOF-EVIDENCE-LIVE";
const SUBJECT_PROJECTION_REF = "projection://t173/live/subject-artifact";
const VERIFIER_SOURCE_PROJECTION_REF = "projection://t173/live/verifier-artifact";
const VERIFIER_EXECUTION_PROJECTION_REF = "projection://t173/live/verifier-execution";
const INTERPRETATION_PROJECTION_REF = "projection://t173/live/interpretation";
const PROOF_POLICY_REF = "policy://t173/plugin-owned/generic-proof-evidence";
const REQUIREMENT_SOURCE_TEXT = [
  "Construct a subject artifact and an independent verifier artifact.",
  "The subject artifact shall be a minimal JavaScript program.",
  "When executed with Node.js, the subject program shall write exactly one line to stdout.",
  "The stdout line shall contain exactly: Hello, world!",
  "The stdout line shall end with one newline.",
  "The subject program shall not write to stderr.",
  "The verifier artifact shall be executable JavaScript source.",
  "The verifier shall receive the subject program path as process.argv[2].",
  "The verifier shall execute the subject with Node.js and fail nonzero unless stdout, stderr, and exit status satisfy the requirement."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T173_GENERIC_PROOF_EVIDENCE_LIVE"] === "1" ||
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

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, "generic-proof-evidence-requirement.txt");
  await writeFile(sourcePath, REQUIREMENT_SOURCE_TEXT, "utf8");
  return Object.freeze({
    sourcePath,
    sourceRef: pathToFileURL(sourcePath).href,
    sourceDigest: sha256(REQUIREMENT_SOURCE_TEXT)
  });
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`live F_P worker did not return a JSON object: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
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
    spanRef: `span://t173-live/${vector.id}`
  });
}

function declarationBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t173-live/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t173/live/generic-proof-context"],
    evidencePolicyRefs: [PROOF_POLICY_REF]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRefs: [vector.id],
    vectorIndexes: [vectorIndex],
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id
  });
  const contextScope = [
    "F_P may choose JavaScript source in this live proof binding.",
    "ABI owns only generic subject-artifact, verifier-artifact, verifier-execution, and interpretation refs.",
    "The proof policy and command semantics are harness/plugin-owned."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t173/live/generic-proof-context",
        originStage: "requirements",
        constraintScope: contextScope,
        digest: sha256(contextScope),
        promotionPolicyRef: "policy://t173/fp-requirement-carry",
        appliesToRefs: [REQUIREMENT_ID, spanId]
      })
    ],
    testRelations: [
      Object.freeze({
        kind: "gtl_requirement_test_relation_declaration",
        relationRef: "proof-relation://t173/live/generic-proof-evidence",
        requirementId: requirement.requirementId,
        assetProjectionRef: SUBJECT_PROJECTION_REF,
        testSourceProjectionRef: VERIFIER_SOURCE_PROJECTION_REF,
        testExecutionProjectionRef: VERIFIER_EXECUTION_PROJECTION_REF,
        interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
        componentTestRootRefs: ["proof/verifier"],
        evidencePolicyRef: PROOF_POLICY_REF
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

async function resolveRequirementSourceText(term) {
  if (!term.sourceRef.startsWith("file://")) {
    throw new Error(`T-173 requirement sourceRef must be file://, got ${term.sourceRef}`);
  }
  const text = await readFile(fileURLToPath(term.sourceRef), "utf8");
  assert.equal(
    sha256(text),
    term.sourceDigest,
    `requirement source digest mismatch for ${term.requirementId}`
  );
  return text;
}

async function requirementPromptSection(input) {
  const { environment, ledger } = input;
  const termSections = [];
  for (const term of environment.activeTerms) {
    const sourceText = await resolveRequirementSourceText(term);
    termSections.push([
      `- requirementId: ${term.requirementId}`,
      `  stableId: ${term.stableId}`,
      `  sourceRef: ${term.sourceRef}`,
      `  sourceDigest: ${term.sourceDigest}`,
      "  sourceText:",
      ...sourceText.split("\n").map((line) => `    ${line}`)
    ].join("\n"));
  }
  const projectionSections = ledger.projections
    .map((projection) =>
      [
        `- projectionRef: ${projection.projectionRef}`,
        `  projectionRole: ${projection.projectionRole}`,
        `  evidenceRole: ${projection.evidenceRole ?? "none"}`,
        `  sourceRefs: ${projection.sourceRefs.join(", ")}`
      ].join("\n")
    );
  return [
    "Admitted ABG requirement terms:",
    ...termSections,
    "",
    "Admitted ABG proof-evidence projections:",
    ...projectionSections
  ].join("\n");
}

function liveWorkerPrompt(input, agentKey, admittedRequirementSection) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["generic_proof_evidence_ready"];
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for ABI T-173 generic proof-evidence replay proof.",
    "Construct the subject artifact and an independent verifier artifact from the admitted requirement pressure below.",
    "Do not assume implementation source was supplied. Do not include a precomputed pass/fail answer.",
    "Use JavaScript only as this proof binding's artifact format; ABI does not own JavaScript or test policy.",
    "",
    `Expected edge: ${input.edge}`,
    `Required fulfillment assessment ids: ${assessmentIds.join(", ")}`,
    "",
    admittedRequirementSection,
    "",
    "Copy the edge field exactly as given above, including the U+2192 arrow.",
    "",
    "Verifier interface:",
    "- The harness writes a package.json with {\"type\":\"commonjs\"} in the proof root.",
    "- verifierArtifact.source must be executable JavaScript.",
    "- verifierArtifact.source must read process.argv[2] as the subject program path.",
    "- verifierArtifact.source must run the subject with Node.js and exit nonzero on failure.",
    "",
    "Output contract. Fill every field with values derived from the admitted requirements:",
    "{",
    '  "edge": string,',
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "subjectArtifact": {',
    '    "language": "javascript",',
    '    "fileName": string ending in ".js",',
    '    "source": executable JavaScript source as a JSON string,',
    '    "expectedStdout": expected stdout as a JSON string',
    "  },",
    '  "verifierArtifact": {',
    '    "language": "javascript",',
    '    "fileName": string ending in ".js",',
    '    "source": executable JavaScript source as a JSON string',
    "  },",
    '  "fulfillment_assessments": [',
    "    {",
    "      \"id\": one required assessment id,",
    "      \"evaluator\": same assessment id,",
    "      \"fulfillment_status\": \"fulfilled\" only if both artifacts satisfy the admitted requirements,",
    "      \"fulfillment_detail\": short reason,",
    "      \"blocking_reasons\": [] when fulfilled,",
    "      \"evidence_refs\": evidence references",
    "    }",
    "  ],",
    '  "selected_worker_id": string,',
    '  "selected_backend": string,',
    '  "role_id": string,',
    '  "assignment_source": string,',
    '  "resolved_runtime_ref": string',
    "}"
  ].join("\n");
}

function normalizeLiveArtifact(value, edge) {
  const normalizedEdge =
    value.edge === edge
      ? value.edge
      : typeof value.edge === "string" && value.edge.replace(/->/gu, "→") === edge
        ? edge
        : value.edge;
  assert.equal(normalizedEdge, edge);
  const normalized = Object.freeze({
    ...value,
    rawLiveEdge: value.edge,
    edge: normalizedEdge
  });
  return normalized;
}

function assertLiveArtifact(value, edge) {
  assert.equal(value.edge, edge);
  assert.equal(value.subjectArtifact?.language, "javascript");
  assert.equal(value.verifierArtifact?.language, "javascript");
  for (const artifact of [value.subjectArtifact, value.verifierArtifact]) {
    assert.equal(typeof artifact?.fileName, "string");
    assert.equal(path.basename(artifact.fileName), artifact.fileName);
    assert.equal(artifact.fileName.endsWith(".js"), true);
    assert.equal(typeof artifact.source, "string");
    assert.equal(artifact.source.length > 0, true);
  }
  assert.equal(value.subjectArtifact.expectedStdout, "Hello, world!\n");
  assert.ok(Array.isArray(value.fulfillment_assessments));
  assert.ok(value.fulfillment_assessments.length > 0);
  for (const assessment of value.fulfillment_assessments) {
    assert.equal(assessment.fulfillment_status, "fulfilled");
    assert.deepEqual(assessment.blocking_reasons, []);
    assert.ok(Array.isArray(assessment.evidence_refs));
    assert.equal(assessment.evidence_refs.length > 0, true);
  }
}

async function materializeAndExecuteVerifier(artifact, runRoot) {
  const proofRoot = path.join(runRoot, "generic-proof-evidence");
  await mkdir(proofRoot, { recursive: true });
  await writeFile(
    path.join(proofRoot, "package.json"),
    `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
    "utf8"
  );
  const subjectPath = path.join(proofRoot, artifact.subjectArtifact.fileName);
  const verifierPath = path.join(proofRoot, artifact.verifierArtifact.fileName);
  await writeFile(subjectPath, artifact.subjectArtifact.source, "utf8");
  await writeFile(verifierPath, artifact.verifierArtifact.source, "utf8");
  const executed = await runTracedProcess({
    command: process.execPath,
    args: [verifierPath, subjectPath],
    cwd: proofRoot,
    env: process.env,
    archiveRoot: path.join(runRoot, "verifier-execution.trace"),
    label: "t173-generic-proof-evidence-verifier-execution",
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  assert.equal(executed.status, 0, executed.stderr);
  return Object.freeze({
    proofRoot,
    subjectPath,
    verifierPath,
    subjectDigest: sha256(artifact.subjectArtifact.source),
    verifierDigest: sha256(artifact.verifierArtifact.source),
    verifierExecution: Object.freeze({
      status: executed.status,
      stdout: executed.stdout,
      stderr: executed.stderr,
      traceResultPath: executed.paths.result
    })
  });
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

function proofFinding(input) {
  return publicRoot.constructFpEvaluationFinding({
    findingRef: `finding://t173/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    evaluatorRef: input.evaluationInput.contract.ref,
    gainReportRef: `gain://t173/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    metricRefs: [`metric://t173/live/${input.role}/${input.evaluationInput.vectorIndex}`],
    closeDisposition: "close",
    evidenceRefs: input.evidenceRefs,
    authorityRefs: [input.authorityRef],
    compositionContributionRef:
      input.evaluationInput.selectedRegimeBindingRef ??
      input.evaluationInput.selectedCompositionRef,
    compositionRef: input.evaluationInput.selectedCompositionRef,
    compositionDigest: input.evaluationInput.selectedCompositionDigest
  });
}

function proofEvaluatorPlugin() {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t173/live/generic-proof-evaluator"),
    evaluate(evaluationInput) {
      const candidate = evaluationInput.attachedResultArtifact;
      assert.equal(candidate?.genericProofEvidence?.verifierExecution?.status, 0);
      const proof = candidate.genericProofEvidence;
      const proofRoleRows = [
        Object.freeze({
          role: "subject-artifact",
          authorityRef: SUBJECT_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.subjectPath).href,
            `sha256://${proof.subjectDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "verifier-artifact",
          authorityRef: VERIFIER_SOURCE_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.verifierPath).href,
            `sha256://${proof.verifierDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "verifier-execution",
          authorityRef: VERIFIER_EXECUTION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.verifierExecution.traceResultPath).href,
            `exit-status://${proof.verifierExecution.status}`
          ]
        }),
        Object.freeze({
          role: "semantic-interpretation",
          authorityRef: INTERPRETATION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.verifierExecution.traceResultPath).href,
            "interpretation://t173/live/verifier-exit-zero"
          ]
        })
      ];
      const edgeAuthorityRows = evaluationInput.expectedAssessmentIds.map(
        (authorityRef, index) =>
          Object.freeze({
            role: `edge-authority-${index}`,
            authorityRef,
            evidenceRefs: [
              evaluationInput.sourceProjectionRef,
              pathToFileURL(proof.verifierExecution.traceResultPath).href
            ]
          })
      );
      const roleRows = Object.freeze([
        ...proofRoleRows,
        ...edgeAuthorityRows
      ]);
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        findings: roleRows.map((row) =>
          proofFinding({ ...row, evaluationInput })
        ),
        evidenceRefs: roleRows.flatMap((row) => row.evidenceRefs)
      });
    }
  });
}

function routeRuntimeEvents(result) {
  return result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

function evidenceBindingsByProjection(routeEvents) {
  const bindings = routeEvents
    .filter((event) => event.routePayloadKind === "requirement_evidence_bound")
    .map((event) => event.requirementPayload.binding);
  return new Map(bindings.map((binding) => [binding.projectionRef, binding]));
}

test("T-173 prompt carries generic proof-evidence projections without source or verdict", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `prompt_carry_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t173/generic-proof-evidence-live",
    runId: "run://t173/generic-proof-evidence-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const bundle = declarationBundleForBasis(basis, 0, requirementSource);
  const expectedRouteContext = expectedRouteContextForBasis(basis, 0, bundle);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  const prompt = liveWorkerPrompt(
    {
      edge: routeEdgeForBasisVector(basis, 0).edge,
      expectedAssessmentIds: ["requirements_ready"]
    },
    "claude",
    await requirementPromptSection({
      environment,
      ledger: expectedRouteContext.ledger
    })
  );
  assert.equal(prompt.includes(REQUIREMENT_ID), true);
  assert.equal(prompt.includes(SUBJECT_PROJECTION_REF), true);
  assert.equal(prompt.includes(VERIFIER_SOURCE_PROJECTION_REF), true);
  assert.equal(prompt.includes(VERIFIER_EXECUTION_PROJECTION_REF), true);
  assert.equal(prompt.includes("console.log(\\\"Hello, world!\\\");"), false);
  assert.equal(prompt.includes("console.log(\"Hello, world!\");"), false);
  assert.equal(prompt.includes('"fulfillment_status": "fulfilled",'), false);
  assert.equal(prompt.includes('"status": 0'), false);
});

test("T-173 live proof carries subject, verifier, and execution evidence through replay", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T173_GENERIC_PROOF_EVIDENCE_LIVE=1 or CODEX_LIVE_FP=1 to run T-173 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);

  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t173/generic-proof-evidence-live",
    runId: "run://t173/generic-proof-evidence-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const bundle = declarationBundleForBasis(basis, 0, requirementSource);
  const expectedRouteContext = expectedRouteContextForBasis(basis, 0, bundle);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  const admittedRequirementSection = await requirementPromptSection({
    environment,
    ledger: expectedRouteContext.ledger
  });
  const sinkEvents = [];
  const liveArtifacts = [];

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t173/live/generic-proof-dispatch"),
    dispatch: async (input) => {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(agentKey),
        prompt: liveWorkerPrompt(input, agentKey, admittedRequirementSection),
        cwd: runRoot,
        archiveRoot: runRoot,
        label: "t173-generic-proof-evidence-live-fp-dispatch",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(runRoot, "t173-live-output.txt"),
        promptPath: path.join(runRoot, "t173-live-prompt.txt"),
        stdoutPath: path.join(runRoot, "t173-live-stdout.log"),
        stderrPath: path.join(runRoot, "t173-live-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const artifact = normalizeLiveArtifact(
        extractJsonObject(transport.text),
        input.edge
      );
      assertLiveArtifact(artifact, input.edge);
      const genericProofEvidence = await materializeAndExecuteVerifier(
        artifact,
        runRoot
      );
      const attachedResultArtifact = Object.freeze({
        ...artifact,
        genericProofEvidence,
        liveTransport: Object.freeze({
          status: transport.status,
          traceResultPath: transport.traceResultPath,
          outputPath: transport.outputPath
        })
      });
      liveArtifacts.push(attachedResultArtifact);
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t173/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact,
        evidenceRefs: [
          "live://t173/generic-proof-evidence",
          pathToFileURL(genericProofEvidence.subjectPath).href,
          pathToFileURL(genericProofEvidence.verifierPath).href,
          pathToFileURL(genericProofEvidence.verifierExecution.traceResultPath).href
        ]
      });
    }
  });

  const result = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch,
      fpEvaluator: proofEvaluatorPlugin()
    },
    requirementRouteDeclarationBundle: bundle
  });

  assert.equal(liveArtifacts.length, 1);
  assert.equal(liveArtifacts[0].genericProofEvidence.verifierExecution.status, 0);
  assert.equal(result.transition.kind, "terminal");

  const events = routeRuntimeEvents(result);
  await writeFile(
    path.join(runRoot, "t173-live-route-debug.json"),
    `${JSON.stringify({
      transition: result.transition,
      routePayloadKinds: events.map((event) => event.routePayloadKind),
      routePayloadRefs: events.map((event) => event.routePayloadRef),
      evidenceBindings: events
        .filter((event) => event.routePayloadKind === "requirement_evidence_bound")
        .map((event) => event.requirementPayload.binding),
      folds: events
        .filter((event) => event.routePayloadKind === "requirement_fold_projected")
        .map((event) => event.requirementPayload.fold)
    }, null, 2)}\n`,
    "utf8"
  );
  assert.equal(
    result.transition.terminalKind,
    "traversal_applied",
    JSON.stringify(result.transition)
  );
  const bindingsByProjection = evidenceBindingsByProjection(events);
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.evidenceRole, "asset");
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(VERIFIER_SOURCE_PROJECTION_REF)?.evidenceRole, "test_source");
  assert.equal(bindingsByProjection.get(VERIFIER_SOURCE_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(VERIFIER_EXECUTION_PROJECTION_REF)?.evidenceRole, "test_execution");
  assert.equal(bindingsByProjection.get(VERIFIER_EXECUTION_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(INTERPRETATION_PROJECTION_REF)?.evidenceRole, "semantic_interpretation");
  assert.equal(bindingsByProjection.get(INTERPRETATION_PROJECTION_REF)?.bindingStatus, "admitted");

  const foldEvent = events.find((event) =>
    event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvent.requirementPayload.fold.state, "satisfied");
  for (const projectionRef of [
    INTERPRETATION_PROJECTION_REF,
    SUBJECT_PROJECTION_REF,
    VERIFIER_EXECUTION_PROJECTION_REF,
    VERIFIER_SOURCE_PROJECTION_REF
  ]) {
    assert.equal(
      foldEvent.requirementPayload.fold.projectionRefs.includes(projectionRef),
      true,
      `fold omitted generic proof projection ${projectionRef}`
    );
  }
  assert.equal(
    events.some((event) => event.routePayloadKind === "requirement_residual_projected"),
    false
  );
  const dispositionEvent = events.find((event) =>
    event.routePayloadKind === "requirement_lifecycle_disposition"
  );
  assert.equal(dispositionEvent.requirementPayload.disposition, "closed");
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

  const evidenceBindings = events
    .filter((event) => event.routePayloadKind === "requirement_evidence_bound")
    .map((event) => event.requirementPayload.binding);
  const folds = events
    .filter((event) => event.routePayloadKind === "requirement_fold_projected")
    .map((event) => event.requirementPayload.fold);
  const residuals = events
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

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    runRoot,
    artifactFileName: "generic-proof-evidence-replay-artifact.json",
    manifestFileName: "generic-proof-evidence-replay-manifest.json",
    ticket: "T-173",
    source: Object.freeze({
      proofTicket: "T-173",
      proofCommand: "npm run test:t173:live",
      sourceRunKind: "live_fp_generic_proof_evidence_route",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest,
      subjectProjectionRef: SUBJECT_PROJECTION_REF,
      verifierSourceProjectionRef: VERIFIER_SOURCE_PROJECTION_REF,
      verifierExecutionProjectionRef: VERIFIER_EXECUTION_PROJECTION_REF,
      interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
      genericProofEvidenceRoleMap: Object.freeze({
        asset: "subject_artifact",
        test_source: "verifier_artifact",
        test_execution: "verifier_execution",
        semantic_interpretation: "semantic_interpretation"
      }),
      closedRouteResidualPolicy:
        "closed proof has no requirement_residual_projected event; disposition residualRefs is empty"
    }),
    replayEvents: result.replayEvents,
    emittedEvents: result.emittedEvents,
    sinkEvents,
    lifecycleState: lifecycleState.value
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact);
  assert.deepEqual(
    replayArtifact.manifest.source.genericProofEvidenceRoleMap,
    {
      asset: "subject_artifact",
      test_source: "verifier_artifact",
      test_execution: "verifier_execution",
      semantic_interpretation: "semantic_interpretation"
    }
  );
  assert.equal(
    replayArtifact.manifest.artifact.requiredPayloadKindsSatisfied,
    true
  );
});
