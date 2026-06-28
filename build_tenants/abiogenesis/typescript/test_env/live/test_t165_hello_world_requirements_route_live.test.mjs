// Validates: T-165
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-037
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-011

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
import {
  runTracedProcess
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";
import {
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t165_hello_world_requirements_route_live"
);
const T165_REQUIREMENT_ID = "REQ-T165-HELLO-WORLD-LIVE";
const T165_REQUIREMENT_SOURCE_TEXT = [
  "Construct a minimal JavaScript program artifact.",
  "When executed with Node.js, the program shall write exactly one line to stdout.",
  "The stdout line shall contain exactly: Hello, world!",
  "The stdout line shall end with one newline.",
  "The program shall not write to stderr."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T165_HELLO_WORLD_LIVE"] === "1" ||
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
  const sourcePath = path.join(runRoot, "hello-world-requirement.txt");
  await writeFile(sourcePath, T165_REQUIREMENT_SOURCE_TEXT, "utf8");
  return Object.freeze({
    sourcePath,
    sourceRef: new URL(`file://${sourcePath}`).href,
    sourceDigest: sha256(T165_REQUIREMENT_SOURCE_TEXT)
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
    spanRef: `span://t165/${vector.id}`
  });
}

function t165RouteBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t165/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: T165_REQUIREMENT_ID,
    termKind: "atom",
    stableId: T165_REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t165/live-requirement-carry"],
    evidencePolicyRefs: ["policy://t165/live-hello-world-evidence"]
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
    "F_P must construct the program from admitted requirement pressure.",
    "The harness may provide an output contract, but not the exact implementation source."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t165/live-requirement-carry",
        originStage: "requirements",
        constraintScope: contextScope,
        digest: sha256(contextScope),
        promotionPolicyRef: "policy://t165/fp-requirement-carry",
        appliesToRefs: [T165_REQUIREMENT_ID, spanId]
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

function requiredAssessmentIds(input) {
  return input.expectedAssessmentIds.length > 0
    ? input.expectedAssessmentIds
    : ["hello_world_program_runs"];
}

async function resolveRequirementSourceText(term) {
  if (!term.sourceRef.startsWith("file://")) {
    throw new Error(`T-165 requirement sourceRef must be file://, got ${term.sourceRef}`);
  }
  const text = await readFile(fileURLToPath(term.sourceRef), "utf8");
  assert.equal(
    sha256(text),
    term.sourceDigest,
    `requirement source digest mismatch for ${term.requirementId}`
  );
  return text;
}

async function requirementPromptSection(environment) {
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
  const contextSections = environment.activeContextFragments.map((fragment) =>
    [
      `- fragmentRef: ${fragment.fragmentRef}`,
      `  stage: ${fragment.stage}`,
      `  digest: ${fragment.digest}`,
      `  constraintScope: ${fragment.constraintScope}`
    ].join("\n")
  );
  return [
    "Admitted ABG requirement terms:",
    ...termSections,
    "",
    "Admitted ABG requirement context:",
    ...(contextSections.length === 0 ? ["- none"] : contextSections)
  ].join("\n");
}

function helloWorldPrompt(input, agentKey, admittedRequirementSection) {
  const assessmentIds = requiredAssessmentIds(input);
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for ABI T-165 Hello World requirements-route proof.",
    "Construct a minimal JavaScript program artifact from the admitted requirements below.",
    "Do not assume any implementation source was supplied; derive the source from the requirements.",
    "",
    `Expected edge: ${input.edge}`,
    `Required fulfillment assessment ids: ${assessmentIds.join(", ")}`,
    "",
    admittedRequirementSection,
    "",
    "Output contract. Fill every field with values derived from the admitted requirements:",
    "{",
    '  "edge": string,',
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "helloWorldProgram": {',
    '    "language": "javascript",',
    '    "fileName": string ending in ".js",',
    '    "source": executable JavaScript source as a JSON string,',
    '    "expectedStdout": expected stdout as a JSON string',
    "  },",
    '  "fulfillment_assessments": [',
    "    {",
    "      \"id\": one required assessment id,",
    "      \"evaluator\": same assessment id,",
    "      \"fulfillment_status\": \"fulfilled\" only if the artifact satisfies the admitted requirements,",
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

function assertHelloWorldArtifact(value, edge) {
  assert.equal(value.edge, edge);
  assert.equal(value.helloWorldProgram?.language, "javascript");
  assert.equal(typeof value.helloWorldProgram?.fileName, "string");
  assert.equal(path.basename(value.helloWorldProgram.fileName), value.helloWorldProgram.fileName);
  assert.equal(value.helloWorldProgram.fileName.endsWith(".js"), true);
  assert.equal(typeof value.helloWorldProgram?.source, "string");
  assert.equal(value.helloWorldProgram?.expectedStdout, "Hello, world!\n");
  assert.ok(Array.isArray(value.fulfillment_assessments));
  assert.ok(value.fulfillment_assessments.length > 0);
  for (const assessment of value.fulfillment_assessments) {
    assert.equal(assessment.fulfillment_status, "fulfilled");
    assert.deepEqual(assessment.blocking_reasons, []);
  }
}

async function executeHelloWorldArtifact(artifact, runRoot) {
  const programRoot = path.join(runRoot, "hello-world-program");
  await mkdir(programRoot, { recursive: true });
  const programPath = path.join(programRoot, artifact.helloWorldProgram.fileName);
  await writeFile(programPath, artifact.helloWorldProgram.source, "utf8");
  const executed = await runTracedProcess({
    command: process.execPath,
    args: [programPath],
    cwd: programRoot,
    env: process.env,
    archiveRoot: path.join(runRoot, "hello-world-execution.trace"),
    label: "t165-hello-world-program-execution",
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stdout, artifact.helloWorldProgram.expectedStdout);
  return Object.freeze({
    programPath,
    stdout: executed.stdout,
    sourceDigest: sha256(artifact.helloWorldProgram.source),
    traceResultPath: executed.paths.result
  });
}

function routeRuntimeEvents(result) {
  return result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

test("T-165 prompt carries admitted requirements without preconstructed source", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `prompt_carry_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t165/hello-world-live",
    runId: "run://t165/hello-world-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const requirementRouteDeclarationBundle = t165RouteBundleForBasis(
    basis,
    0,
    requirementSource
  );
  const expectedRouteContext = expectedRouteContextForBasis(
    basis,
    0,
    requirementRouteDeclarationBundle
  );
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  assert.equal(environment.activeTerms[0].requirementId, T165_REQUIREMENT_ID);
  assert.equal(environment.activeTerms[0].sourceRef, requirementSource.sourceRef);
  assert.equal(environment.activeTerms[0].sourceDigest, requirementSource.sourceDigest);
  assert.equal(environment.activeContextFragments.length, 1);

  const prompt = helloWorldPrompt(
    {
      edge: routeEdgeForBasisVector(basis, 0).edge,
      expectedAssessmentIds: ["requirements_ready"]
    },
    "claude",
    await requirementPromptSection(environment)
  );

  assert.equal(prompt.includes(T165_REQUIREMENT_ID), true);
  for (const requirementLine of T165_REQUIREMENT_SOURCE_TEXT.split("\n")) {
    assert.equal(prompt.includes(requirementLine), true);
  }
  assert.equal(prompt.includes(requirementSource.sourceDigest), true);
  assert.equal(prompt.includes("console.log(\\\"Hello, world!\\\");"), false);
  assert.equal(prompt.includes("console.log(\"Hello, world!\");"), false);
  assert.equal(prompt.includes('"expectedStdout": "Hello, world!\\n"'), false);
  assert.equal(prompt.includes('"fulfillment_status": "fulfilled",'), false);
});

test("T-165 live Hello World proof closes through the GTL/ABG requirements route", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T165_HELLO_WORLD_LIVE=1 or CODEX_LIVE_FP=1 to run T-165 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const requirementSource = await writeRequirementSource(runRoot);

  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t165/hello-world-live",
    runId: "run://t165/hello-world-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const requirementRouteDeclarationBundle = t165RouteBundleForBasis(
    basis,
    0,
    requirementSource
  );
  const expectedRouteContext = expectedRouteContextForBasis(
    basis,
    0,
    requirementRouteDeclarationBundle
  );
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  const admittedRequirementSection = await requirementPromptSection(environment);
  const sinkEvents = [];
  const liveArtifacts = [];

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t165/hello-world-live/fp-dispatch"),
    dispatch: async (input) => {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(agentKey),
        prompt: helloWorldPrompt(input, agentKey, admittedRequirementSection),
        cwd: runRoot,
        archiveRoot: runRoot,
        label: "t165-hello-world-live-fp-dispatch",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(runRoot, "hello-world-output.txt"),
        promptPath: path.join(runRoot, "hello-world-prompt.txt"),
        stdoutPath: path.join(runRoot, "hello-world-stdout.log"),
        stderrPath: path.join(runRoot, "hello-world-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const artifact = extractJsonObject(transport.text);
      assertHelloWorldArtifact(artifact, input.edge);
      const execution = await executeHelloWorldArtifact(artifact, runRoot);
      const attachedResultArtifact = Object.freeze({
        ...artifact,
        helloWorldExecution: execution,
        liveTransport: Object.freeze({
          status: transport.status,
          traceResultPath: transport.traceResultPath,
          outputPath: transport.outputPath
        })
      });
      liveArtifacts.push(attachedResultArtifact);
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t165/hello-world-live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact,
        evidenceRefs: [
          "live://t165/hello-world",
          `file://${execution.programPath}`,
          `sha256://${execution.sourceDigest.slice("sha256:".length)}`
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
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    },
    requirementRouteDeclarationBundle
  });

  assert.equal(liveArtifacts.length, 1);
  assert.equal(
    liveArtifacts[0].helloWorldExecution.stdout,
    "Hello, world!\n"
  );
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "traversal_applied");

  const events = routeRuntimeEvents(result);
  assert.equal(
    events.some((event) => event.routePayloadKind === "requirement_term_admitted"),
    true
  );
  assert.equal(
    events.some((event) => event.routePayloadKind === "requirement_projection_admitted"),
    true
  );
  assert.equal(
    events.some((event) => event.routePayloadKind === "requirement_evidence_bound"),
    true
  );
  const foldEvent = events.find((event) =>
    event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvent.requirementPayload.fold.state, "satisfied");
  assert.equal(
    events.some((event) => event.routePayloadKind === "requirement_residual_projected"),
    false
  );
  const dispositionEvent = events.find((event) =>
    event.routePayloadKind === "requirement_lifecycle_disposition"
  );
  assert.equal(dispositionEvent.requirementPayload.disposition, "closed");
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
  assert.deepEqual(lifecycleState.value.dispositionRefs, [
    dispositionEvent.routePayloadRef
  ]);

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    runRoot,
    source: Object.freeze({
      proofTicket: "T-165",
      publicationTicket: "T-166",
      proofCommand: "npm run test:t165:hello-world-live",
      sourceRunKind: "live_fp_hello_world_requirements_route",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest
    }),
    replayEvents: result.replayEvents,
    emittedEvents: result.emittedEvents,
    sinkEvents,
    lifecycleState: lifecycleState.value
  });
  assert.equal(
    replayArtifact.manifest.artifact.requiredPayloadKindsSatisfied,
    true
  );
});
