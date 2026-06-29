// Validates: T-171 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
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
  "t171_non_js_toolchain_execution_live"
);

const REQUIREMENT_ID = "REQ-T171-RUST-CLI-LIVE";
const SUBJECT_PROJECTION_REF = "projection://t171/live/rust-cli-source";
const COMMAND_MANIFEST_PROJECTION_REF = "projection://t171/live/toolchain-command-manifest";
const TOOLCHAIN_EXECUTION_PROJECTION_REF = "projection://t171/live/toolchain-execution";
const INTERPRETATION_PROJECTION_REF = "projection://t171/live/rust-cli-interpretation";
const PROOF_POLICY_REF = "policy://t171/plugin-owned/non-js-toolchain";
const REQUIREMENT_SOURCE_TEXT = [
  "Construct a Rust CLI source artifact.",
  "The source artifact shall compile with the declared rustc toolchain.",
  "When the compiled CLI is executed, it shall write exactly one line to stdout.",
  "The stdout line shall contain exactly: Hello, world!",
  "The stdout line shall end with one newline.",
  "The compiled CLI shall not write to stderr."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T171_NON_JS_TOOLCHAIN_LIVE"] === "1" ||
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

async function executableOnPath(command) {
  for (const dir of (process.env["PATH"] ?? "").split(path.delimiter)) {
    if (dir.length === 0) {
      continue;
    }
    const candidate = path.join(dir, command);
    try {
      await access(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      // Keep searching. Missing local executables are proof inputs, not errors.
    }
  }
  return "";
}

function missingCommandResult(command, args) {
  return Object.freeze({
    command,
    args,
    status: null,
    stdout: "",
    stderr: "",
    error: `${command} was not found on PATH`
  });
}

async function tracedCommandOk(input) {
  const result = await runTracedProcess({
    command: input.command,
    args: input.args,
    cwd: input.runRoot,
    env: Object.freeze({
      ...process.env,
      ABG_T171_TOOLCHAIN_AUDIT: "1"
    }),
    archiveRoot: path.join(input.runRoot, `${input.label}.trace`),
    label: input.label,
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  return Object.freeze({
    command: input.command,
    args: input.args,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error
  });
}

async function rustToolchain(runRoot) {
  const rustcPath = await executableOnPath("rustc");
  const cargoPath = await executableOnPath("cargo");
  const rustcVersion = rustcPath.length === 0
    ? missingCommandResult("rustc", ["--version"])
    : await tracedCommandOk({
      command: rustcPath,
      args: ["--version"],
      runRoot,
      label: "t171-rustc-version"
    });
  const cargoVersion = cargoPath.length === 0
    ? missingCommandResult("cargo", ["--version"])
    : await tracedCommandOk({
      command: cargoPath,
      args: ["--version"],
      runRoot,
      label: "t171-cargo-version"
    });
  return Object.freeze({
    rustcPath,
    cargoPath,
    rustcVersion,
    cargoVersion,
    ready: rustcPath.length > 0 && rustcVersion.status === 0
  });
}

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, "rust-cli-requirement.txt");
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
    spanRef: `span://t171-live/${vector.id}`
  });
}

function declarationBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t171-live/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t171/live/non-js-toolchain-context"],
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
    "F_P may choose Rust source in this live proof binding.",
    "ABI owns only generic command/cwd/env/evidence admission and route replay.",
    "Rust and rustc meaning remain harness/plugin-owned policy."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t171/live/non-js-toolchain-context",
        originStage: "requirements",
        constraintScope: contextScope,
        digest: sha256(contextScope),
        promotionPolicyRef: "policy://t171/fp-requirement-carry",
        appliesToRefs: [REQUIREMENT_ID, spanId]
      })
    ],
    testRelations: [
      Object.freeze({
        kind: "gtl_requirement_test_relation_declaration",
        relationRef: "proof-relation://t171/live/non-js-toolchain",
        requirementId: requirement.requirementId,
        assetProjectionRef: SUBJECT_PROJECTION_REF,
        testSourceProjectionRef: COMMAND_MANIFEST_PROJECTION_REF,
        testExecutionProjectionRef: TOOLCHAIN_EXECUTION_PROJECTION_REF,
        interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
        componentTestRootRefs: ["proof/toolchain"],
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
    throw new Error(`T-171 requirement sourceRef must be file://, got ${term.sourceRef}`);
  }
  const text = await readFile(fileURLToPath(term.sourceRef), "utf8");
  assert.equal(sha256(text), term.sourceDigest);
  return text;
}

async function requirementPromptSection(input) {
  const { environment, ledger } = input;
  const termSections = [];
  for (const term of environment.activeTerms) {
    const sourceText = await resolveRequirementSourceText(term);
    termSections.push([
      `- requirementId: ${term.requirementId}`,
      `  sourceRef: ${term.sourceRef}`,
      `  sourceDigest: ${term.sourceDigest}`,
      "  sourceText:",
      ...sourceText.split("\n").map((line) => `    ${line}`)
    ].join("\n"));
  }
  const projectionSections = ledger.projections.map((projection) =>
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
    "Admitted ABG proof projections:",
    ...projectionSections
  ].join("\n");
}

function liveWorkerPrompt(input, agentKey, admittedRequirementSection, toolchain) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["rust_cli_ready"];
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for ABI T-171 non-JS toolchain proof.",
    "Construct a minimal Rust CLI source artifact from the admitted requirements below.",
    "Do not assume implementation source was supplied. Do not include a precomputed pass/fail answer.",
    "Rust is only this proof binding's artifact format; ABI does not own Rust or compiler policy.",
    "",
    `Expected edge: ${input.edge}`,
    `Required fulfillment assessment ids: ${assessmentIds.join(", ")}`,
    `Declared rustc: ${toolchain.rustcPath}`,
    `rustc version: ${toolchain.rustcVersion.stdout.trim()}`,
    "",
    admittedRequirementSection,
    "",
    "Copy the edge field exactly as given above, including the U+2192 arrow.",
    "",
    "Output contract:",
    "{",
    '  "edge": string,',
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "rustCliArtifact": {',
    '    "language": "rust",',
    '    "fileName": string ending in ".rs",',
    '    "source": compilable Rust source as a JSON string,',
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

function normalizeLiveArtifact(value, edge) {
  const normalizedEdge =
    value.edge === edge
      ? value.edge
      : typeof value.edge === "string" && value.edge.replace(/->/gu, "→") === edge
        ? edge
        : value.edge;
  assert.equal(normalizedEdge, edge);
  return Object.freeze({ ...value, rawLiveEdge: value.edge, edge: normalizedEdge });
}

function assertRustArtifact(value, edge) {
  assert.equal(value.edge, edge);
  assert.equal(value.rustCliArtifact?.language, "rust");
  assert.equal(typeof value.rustCliArtifact?.fileName, "string");
  assert.equal(path.basename(value.rustCliArtifact.fileName), value.rustCliArtifact.fileName);
  assert.equal(value.rustCliArtifact.fileName.endsWith(".rs"), true);
  assert.equal(typeof value.rustCliArtifact.source, "string");
  assert.equal(value.rustCliArtifact.source.length > 0, true);
  assert.equal(value.rustCliArtifact.expectedStdout, "Hello, world!\n");
  assert.ok(Array.isArray(value.fulfillment_assessments));
  assert.ok(value.fulfillment_assessments.length > 0);
  for (const assessment of value.fulfillment_assessments) {
    assert.equal(assessment.fulfillment_status, "fulfilled");
    assert.deepEqual(assessment.blocking_reasons, []);
    assert.ok(Array.isArray(assessment.evidence_refs));
    assert.equal(assessment.evidence_refs.length > 0, true);
  }
}

async function materializeCompileAndRun(input) {
  const proofRoot = path.join(input.runRoot, "rust-cli-proof");
  const sourceRoot = path.join(proofRoot, "src");
  const targetRoot = path.join(proofRoot, "target");
  await mkdir(sourceRoot, { recursive: true });
  await mkdir(targetRoot, { recursive: true });
  const sourcePath = path.join(sourceRoot, input.artifact.rustCliArtifact.fileName);
  const binaryPath = path.join(targetRoot, "t171-hello-world");
  await writeFile(sourcePath, input.artifact.rustCliArtifact.source, "utf8");
  const env = Object.freeze({
    ...process.env,
    ABG_T171_NON_JS_TOOLCHAIN_PROOF: "1"
  });
  const compile = await runTracedProcess({
    command: input.toolchain.rustcPath,
    args: [sourcePath, "-o", binaryPath],
    cwd: proofRoot,
    env,
    archiveRoot: path.join(input.runRoot, "rustc-compile.trace"),
    label: "t171-rustc-compile",
    timeoutMs: 60000,
    executorProfile: "local-spawn"
  });
  assert.equal(compile.status, 0, compile.stderr);
  const run = await runTracedProcess({
    command: binaryPath,
    args: [],
    cwd: proofRoot,
    env,
    archiveRoot: path.join(input.runRoot, "rust-cli-run.trace"),
    label: "t171-rust-cli-run",
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, input.artifact.rustCliArtifact.expectedStdout);
  assert.equal(run.stderr, "");
  const manifest = Object.freeze({
    kind: "t171_non_js_toolchain_command_manifest",
    rustcPath: input.toolchain.rustcPath,
    rustcVersion: input.toolchain.rustcVersion.stdout.trim(),
    cargoPath: input.toolchain.cargoPath,
    cargoVersion: input.toolchain.cargoVersion.stdout.trim(),
    cwd: proofRoot,
    envKeys: ["ABG_T171_NON_JS_TOOLCHAIN_PROOF"],
    sourcePath,
    binaryPath,
    compileCommand: [input.toolchain.rustcPath, sourcePath, "-o", binaryPath],
    runCommand: [binaryPath],
    compileTraceResultPath: compile.paths.result,
    runTraceResultPath: run.paths.result
  });
  const commandManifestPath = path.join(input.runRoot, "rust-toolchain-command-manifest.json");
  await writeFile(commandManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return Object.freeze({
    proofRoot,
    sourcePath,
    binaryPath,
    sourceDigest: sha256(input.artifact.rustCliArtifact.source),
    commandManifestPath,
    commandManifestDigest: sha256(JSON.stringify(manifest, null, 2) + "\n"),
    compile,
    run
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
    findingRef: `finding://t171/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    evaluatorRef: input.evaluationInput.contract.ref,
    gainReportRef: `gain://t171/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    metricRefs: [`metric://t171/live/${input.role}/${input.evaluationInput.vectorIndex}`],
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
    contract: fpEvaluatorContract("plugin://t171/live/non-js-toolchain-evaluator"),
    evaluate(evaluationInput) {
      const proof = evaluationInput.attachedResultArtifact?.nonJsToolchainProof;
      assert.equal(proof?.compile?.status, 0);
      assert.equal(proof?.run?.status, 0);
      const proofRoleRows = [
        Object.freeze({
          role: "rust-cli-source",
          authorityRef: SUBJECT_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.sourcePath).href,
            `sha256://${proof.sourceDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "toolchain-command-manifest",
          authorityRef: COMMAND_MANIFEST_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.commandManifestPath).href,
            `sha256://${proof.commandManifestDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "toolchain-execution",
          authorityRef: TOOLCHAIN_EXECUTION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.compile.paths.result).href,
            pathToFileURL(proof.run.paths.result).href,
            `exit-status://${proof.run.status}`
          ]
        }),
        Object.freeze({
          role: "rust-cli-interpretation",
          authorityRef: INTERPRETATION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.run.paths.result).href,
            "interpretation://t171/live/rust-cli-exit-zero"
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
              pathToFileURL(proof.run.paths.result).href
            ]
          })
      );
      const roleRows = Object.freeze([...proofRoleRows, ...edgeAuthorityRows]);
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        findings: roleRows.map((row) => proofFinding({ ...row, evaluationInput })),
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

test("T-171 audit: generic traced command substrate and local rustc are available", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `toolchain_audit_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const toolchain = await rustToolchain(runRoot);
  assert.equal(typeof runTracedProcess, "function");
  assert.equal(toolchain.ready, true, JSON.stringify(toolchain));
  assert.match(toolchain.rustcVersion.stdout, /^rustc /u);
});

test("T-171 prompt carries Rust pressure without source or pass answer", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `prompt_carry_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const toolchain = await rustToolchain(runRoot);
  assert.equal(toolchain.ready, true, JSON.stringify(toolchain));
  const requirementSource = await writeRequirementSource(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t171/non-js-toolchain-live",
    runId: "run://t171/non-js-toolchain-live"
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
    }),
    toolchain
  );
  assert.equal(prompt.includes(REQUIREMENT_ID), true);
  assert.equal(prompt.includes(SUBJECT_PROJECTION_REF), true);
  assert.equal(prompt.includes(TOOLCHAIN_EXECUTION_PROJECTION_REF), true);
  assert.equal(prompt.includes("fn main()"), false);
  assert.equal(prompt.includes("println!(\"Hello, world!\")"), false);
  assert.equal(prompt.includes('"fulfillment_status": "fulfilled",'), false);
  assert.equal(prompt.includes('"status": 0'), false);
});

test("T-171 live proof runs Rust CLI through generic command evidence", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T171_NON_JS_TOOLCHAIN_LIVE=1 or CODEX_LIVE_FP=1 to run T-171 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const toolchain = await rustToolchain(runRoot);
  assert.equal(toolchain.ready, true, JSON.stringify(toolchain));
  const requirementSource = await writeRequirementSource(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t171/non-js-toolchain-live",
    runId: "run://t171/non-js-toolchain-live"
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
    contract: fpDispatchContract("plugin://t171/live/non-js-toolchain-dispatch"),
    dispatch: async (input) => {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(agentKey),
        prompt: liveWorkerPrompt(input, agentKey, admittedRequirementSection, toolchain),
        cwd: runRoot,
        archiveRoot: runRoot,
        label: "t171-non-js-toolchain-live-fp-dispatch",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(runRoot, "t171-live-output.txt"),
        promptPath: path.join(runRoot, "t171-live-prompt.txt"),
        stdoutPath: path.join(runRoot, "t171-live-stdout.log"),
        stderrPath: path.join(runRoot, "t171-live-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const artifact = normalizeLiveArtifact(extractJsonObject(transport.text), input.edge);
      assertRustArtifact(artifact, input.edge);
      const nonJsToolchainProof = await materializeCompileAndRun({
        artifact,
        runRoot,
        toolchain
      });
      const attachedResultArtifact = Object.freeze({
        ...artifact,
        nonJsToolchainProof,
        liveTransport: Object.freeze({
          status: transport.status,
          traceResultPath: transport.traceResultPath,
          outputPath: transport.outputPath
        })
      });
      liveArtifacts.push(attachedResultArtifact);
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t171/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact,
        evidenceRefs: [
          "live://t171/non-js-toolchain",
          pathToFileURL(nonJsToolchainProof.sourcePath).href,
          pathToFileURL(nonJsToolchainProof.commandManifestPath).href,
          pathToFileURL(nonJsToolchainProof.compile.paths.result).href,
          pathToFileURL(nonJsToolchainProof.run.paths.result).href
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
  assert.equal(liveArtifacts[0].nonJsToolchainProof.run.stdout, "Hello, world!\n");
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "traversal_applied", JSON.stringify(result.transition));

  const events = routeRuntimeEvents(result);
  const bindingsByProjection = evidenceBindingsByProjection(events);
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.evidenceRole, "asset");
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(COMMAND_MANIFEST_PROJECTION_REF)?.evidenceRole, "test_source");
  assert.equal(bindingsByProjection.get(COMMAND_MANIFEST_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(TOOLCHAIN_EXECUTION_PROJECTION_REF)?.evidenceRole, "test_execution");
  assert.equal(bindingsByProjection.get(TOOLCHAIN_EXECUTION_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(INTERPRETATION_PROJECTION_REF)?.evidenceRole, "semantic_interpretation");
  assert.equal(bindingsByProjection.get(INTERPRETATION_PROJECTION_REF)?.bindingStatus, "admitted");
  const foldEvent = events.find((event) =>
    event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvent.requirementPayload.fold.state, "satisfied");
  const dispositionEvent = events.find((event) =>
    event.routePayloadKind === "requirement_lifecycle_disposition"
  );
  assert.equal(dispositionEvent.requirementPayload.disposition, "closed");
  assert.equal(
    result.emittedEvents.some((event) => event.kind === "requirement_route_fact_projected"),
    true
  );
  assert.equal(
    sinkEvents.some((event) => event.kind === "requirement_route_fact_projected"),
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
    artifactFileName: "non-js-toolchain-replay-artifact.json",
    manifestFileName: "non-js-toolchain-replay-manifest.json",
    ticket: "T-171",
    source: Object.freeze({
      proofTicket: "T-171",
      proofCommand: "npm run test:t171:live",
      sourceRunKind: "live_fp_non_js_toolchain_route",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      rustcPath: toolchain.rustcPath,
      rustcVersion: toolchain.rustcVersion.stdout.trim(),
      cargoPath: toolchain.cargoPath,
      cargoVersion: toolchain.cargoVersion.stdout.trim(),
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest,
      subjectProjectionRef: SUBJECT_PROJECTION_REF,
      commandManifestProjectionRef: COMMAND_MANIFEST_PROJECTION_REF,
      toolchainExecutionProjectionRef: TOOLCHAIN_EXECUTION_PROJECTION_REF,
      interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
      genericProofEvidenceRoleMap: Object.freeze({
        asset: "rust_cli_source_artifact",
        test_source: "toolchain_command_manifest",
        test_execution: "rustc_compile_and_cli_run_execution",
        semantic_interpretation: "rust_cli_execution_interpretation"
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
  assert.equal(replayArtifact.manifest.artifact.requiredPayloadKindsSatisfied, true);
});
