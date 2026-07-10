// Validates: T-172 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicAbgRequirements from "@abiogenesis/typescript-tenant/abg/requirements";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  invokeSupervisedProcessActor
} from "../../build/semantic/code/src/abg/m03/index.js";
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
  "t172_service_process_request_live"
);

const REQUIREMENT_ID = "REQ-T172-SERVICE-REQUEST-LIVE";
const SUBJECT_PROJECTION_REF = "projection://t172/live/service-source";
const SERVICE_MANIFEST_PROJECTION_REF = "projection://t172/live/process-request-manifest";
const SERVICE_EXECUTION_PROJECTION_REF = "projection://t172/live/service-request-execution";
const INTERPRETATION_PROJECTION_REF = "projection://t172/live/service-response-interpretation";
const PROOF_POLICY_REF = "policy://t172/plugin-owned/service-request";
const REQUEST_PATH = "/hello";
const EXPECTED_BODY = "Hello, world!\n";
const REQUIREMENT_SOURCE_TEXT = [
  "Construct a service source artifact.",
  "The source artifact shall compile with the declared rustc toolchain.",
  "When the compiled service starts, it shall bind a loopback TCP listener.",
  "The service shall publish its chosen port to the declared port-file env binding.",
  "A client request to /hello shall receive HTTP status 200.",
  "The response body shall be exactly: Hello, world! followed by one newline.",
  "The service shall close after the request so cleanup is replay-visible."
].join("\n");

function liveEnabled() {
  return process.env["ABG_TS_T172_SERVICE_REQUEST_LIVE"] === "1" ||
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
      // Keep searching. Missing executables are proof inputs, not ABI policy.
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
      ABG_T172_TOOLCHAIN_AUDIT: "1"
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
  const rustcVersion = rustcPath.length === 0
    ? missingCommandResult("rustc", ["--version"])
    : await tracedCommandOk({
      command: rustcPath,
      args: ["--version"],
      runRoot,
      label: "t172-rustc-version"
    });
  return Object.freeze({
    rustcPath,
    rustcVersion,
    ready: rustcPath.length > 0 && rustcVersion.status === 0
  });
}

async function writeRequirementSource(runRoot) {
  const sourcePath = path.join(runRoot, "service-request-requirement.txt");
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
  const start = candidate.search(/\{\s*"edge"\s*:/u);
  if (start < 0) {
    throw new Error(`live F_P worker did not return a JSON object: ${text}`);
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < candidate.length; index += 1) {
    const char = candidate[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, index + 1));
      }
    }
  }
  throw new Error(`live F_P worker returned an unterminated JSON object: ${text}`);
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
    spanRef: `span://t172-live/${vector.id}`
  });
}

function declarationBundleForBasis(basis, vectorIndex, requirementSource) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t172-live/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: requirementSource.sourceRef,
    sourceDigest: requirementSource.sourceDigest,
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: ["fragment://t172/live/service-request-context"],
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
    "ABI owns only generic process, request, evidence admission, and route replay.",
    "Service readiness, HTTP semantics, and response acceptability remain harness/plugin-owned policy."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: "fragment://t172/live/service-request-context",
        originStage: "requirements",
        constraintScope: contextScope,
        digest: sha256(contextScope),
        promotionPolicyRef: "policy://t172/fp-requirement-carry",
        appliesToRefs: [REQUIREMENT_ID, spanId]
      })
    ],
    testRelations: [
      Object.freeze({
        kind: "gtl_requirement_test_relation_declaration",
        relationRef: "proof-relation://t172/live/service-request",
        requirementId: requirement.requirementId,
        assetProjectionRef: SUBJECT_PROJECTION_REF,
        testSourceProjectionRef: SERVICE_MANIFEST_PROJECTION_REF,
        testExecutionProjectionRef: SERVICE_EXECUTION_PROJECTION_REF,
        interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
        componentTestRootRefs: ["proof/service-request"],
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
    throw new Error(`T-172 requirement sourceRef must be file://, got ${term.sourceRef}`);
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
      : ["service_request_ready"];
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for ABI T-172 generic service process/request proof.",
    "Construct a minimal single-file Rust service source artifact from the admitted requirements below.",
    "Use only the Rust standard library; no Cargo manifest or external crates.",
    "Do not assume implementation source was supplied. Do not include a precomputed pass/fail answer.",
    "Rust and HTTP are only this proof binding's artifact/protocol choices; ABI does not own language, service, or protocol policy.",
    "",
    `Expected edge: ${input.edge}`,
    `Required fulfillment assessment ids: ${assessmentIds.join(", ")}`,
    `Declared rustc: ${toolchain.rustcPath}`,
    `rustc version: ${toolchain.rustcVersion.stdout.trim()}`,
    "",
    "Service contract for this proof binding:",
    "- bind to 127.0.0.1:0;",
    "- read env ABG_T172_PORT_FILE and write a JSON object containing the chosen port;",
    "- accept one client connection;",
    "- respond to GET /hello with status 200 and body exactly Hello, world! followed by one newline;",
    "- close the listener and exit with status 0 after the request.",
    "",
    admittedRequirementSection,
    "",
    "Copy the edge field exactly as given above, including the U+2192 arrow.",
    "",
    "Output contract:",
    "{",
    '  "edge": string,',
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "serviceArtifact": {',
    '    "language": "rust",',
    '    "fileName": string ending in ".rs",',
    '    "source": compilable single-file Rust source as a JSON string,',
    `    "expectedPath": ${JSON.stringify(REQUEST_PATH)},`,
    '    "expectedStatus": 200,',
    `    "expectedBody": ${JSON.stringify(EXPECTED_BODY)}`,
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

function assertServiceArtifact(value, edge) {
  assert.equal(value.edge, edge);
  assert.equal(value.serviceArtifact?.language, "rust");
  assert.equal(typeof value.serviceArtifact?.fileName, "string");
  assert.equal(path.basename(value.serviceArtifact.fileName), value.serviceArtifact.fileName);
  assert.equal(value.serviceArtifact.fileName.endsWith(".rs"), true);
  assert.equal(typeof value.serviceArtifact.source, "string");
  assert.equal(value.serviceArtifact.source.length > 0, true);
  assert.equal(value.serviceArtifact.expectedPath, REQUEST_PATH);
  assert.equal(value.serviceArtifact.expectedStatus, 200);
  assert.equal(value.serviceArtifact.expectedBody, EXPECTED_BODY);
  assert.ok(Array.isArray(value.fulfillment_assessments));
  assert.ok(value.fulfillment_assessments.length > 0);
  for (const assessment of value.fulfillment_assessments) {
    assert.equal(assessment.fulfillment_status, "fulfilled");
    assert.deepEqual(assessment.blocking_reasons, []);
    assert.ok(Array.isArray(assessment.evidence_refs));
    assert.equal(assessment.evidence_refs.length > 0, true);
  }
}

function invocationForBasis(input) {
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: `actor-invocation://t172/live/service/${input.vectorIndex}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: `graph-call:${input.basis.id}`,
    frameId: input.basis.frameId ?? `frame:${input.basis.id}:root`,
    vectorIndex: input.vectorIndex,
    edge: routeEdgeForBasisVector(input.basis, input.vectorIndex).edge,
    attemptIndex: 1,
    dispatchRef: "dispatch://t172/service-request-live",
    workerId: "worker://t172/service-process",
    backendId: "backend://t172/local-process",
    resultRef: "result://t172/service-request-live",
    causationEventRefs: ["dispatch://t172/service-request-live"],
    correlationId: "correlation://t172/service-request-live"
  });
}

async function waitForPortFile(input) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < input.timeoutMs) {
    try {
      const raw = await readFile(input.portFile, "utf8");
      const parsed = JSON.parse(raw);
      if (Number.isInteger(parsed.port) && parsed.port > 0) {
        return Object.freeze({
          ...parsed,
          port: parsed.port,
          raw
        });
      }
    } catch {
      // The service has not published readiness yet.
    }
    await delay(25);
  }
  throw new Error(`service did not publish port file within ${input.timeoutMs}ms`);
}

async function materializeServiceAndRequest(input) {
  const proofRoot = path.join(input.runRoot, "service-request-proof");
  const sourceRoot = path.join(proofRoot, "src");
  const targetRoot = path.join(proofRoot, "target");
  await mkdir(sourceRoot, { recursive: true });
  await mkdir(targetRoot, { recursive: true });
  const sourcePath = path.join(sourceRoot, input.artifact.serviceArtifact.fileName);
  const binaryPath = path.join(targetRoot, "t172-service");
  const portFile = path.join(proofRoot, "service-port.json");
  const responsePath = path.join(proofRoot, "client-response.json");
  const clientPath = path.join(proofRoot, "client-request.mjs");
  const serviceStdoutPath = path.join(proofRoot, "service-stdout.log");
  const serviceStderrPath = path.join(proofRoot, "service-stderr.log");
  const processEventsPath = path.join(proofRoot, "service-process-events.jsonl");
  const processStartedPath = path.join(proofRoot, "service-process-started.json");
  await writeFile(sourcePath, input.artifact.serviceArtifact.source, "utf8");
  await writeFile(
    clientPath,
    [
      "import http from 'node:http';",
      "import { writeFile } from 'node:fs/promises';",
      "const port = Number(process.argv[2]);",
      "const outputPath = process.argv[3];",
      `const expectedBody = ${JSON.stringify(EXPECTED_BODY)};`,
      "const response = await new Promise((resolve, reject) => {",
      "  const req = http.request({ hostname: '127.0.0.1', port, path: '/hello', method: 'GET' }, (res) => {",
      "    let body = '';",
      "    res.setEncoding('utf8');",
      "    res.on('data', (chunk) => { body += chunk; });",
      "    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));",
      "  });",
      "  req.on('error', reject);",
      "  req.end();",
      "});",
      "const result = { kind: 't172_client_response', request: { method: 'GET', path: '/hello', port }, response };",
      "await writeFile(outputPath, JSON.stringify(result, null, 2) + '\\n', 'utf8');",
      "if (response.status !== 200 || response.body !== expectedBody) {",
      "  console.error(JSON.stringify(result));",
      "  process.exit(2);",
      "}",
      "console.log(JSON.stringify(result));"
    ].join("\n"),
    "utf8"
  );
  const env = Object.freeze({
    ...process.env,
    ABG_T172_SERVICE_REQUEST_PROOF: "1",
    ABG_T172_PORT_FILE: portFile
  });
  const compile = await runTracedProcess({
    command: input.toolchain.rustcPath,
    args: [sourcePath, "-o", binaryPath],
    cwd: proofRoot,
    env,
    archiveRoot: path.join(input.runRoot, "service-rustc-compile.trace"),
    label: "t172-rustc-service-compile",
    timeoutMs: 60000,
    executorProfile: "local-spawn"
  });
  assert.equal(compile.status, 0, compile.stderr);

  const actorEvents = [];
  const servicePromise = invokeSupervisedProcessActor({
    invocation: invocationForBasis({
      basis: input.basis,
      vectorIndex: input.vectorIndex
    }),
    command: binaryPath,
    args: [],
    cwd: proofRoot,
    environment: env,
    stdoutPath: serviceStdoutPath,
    stderrPath: serviceStderrPath,
    stdoutRef: pathToFileURL(serviceStdoutPath).href,
    stderrRef: pathToFileURL(serviceStderrPath).href,
    processStartedPath,
    processEventsPath,
    timeoutMs: 10000,
    inactivityTimeoutMs: 5000,
    terminationGraceMs: 500,
    heartbeatMs: 50,
    eventSink: (event) => {
      actorEvents.push(event);
    }
  });
  const portInfo = await waitForPortFile({
    portFile,
    timeoutMs: 5000
  });
  const client = await runTracedProcess({
    command: process.execPath,
    args: [clientPath, String(portInfo.port), responsePath],
    cwd: proofRoot,
    env,
    archiveRoot: path.join(input.runRoot, "service-client-request.trace"),
    label: "t172-service-client-request",
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  assert.equal(client.status, 0, client.stderr);
  const service = await servicePromise;
  assert.equal(service.status, 0, JSON.stringify(service.outcome));
  assert.equal(service.outcome.kind, "exited");
  const responseRaw = await readFile(responsePath, "utf8");
  const response = JSON.parse(responseRaw);
  assert.equal(response.response.status, input.artifact.serviceArtifact.expectedStatus);
  assert.equal(response.response.body, input.artifact.serviceArtifact.expectedBody);
  assert.equal(
    service.events.some((event) => event.kind === "actor_process_started"),
    true
  );
  assert.equal(
    service.events.some((event) => event.kind === "actor_process_exited"),
    true
  );
  const manifest = Object.freeze({
    kind: "t172_service_process_request_manifest",
    rustcPath: input.toolchain.rustcPath,
    rustcVersion: input.toolchain.rustcVersion.stdout.trim(),
    cwd: proofRoot,
    envKeys: ["ABG_T172_SERVICE_REQUEST_PROOF", "ABG_T172_PORT_FILE"],
    sourcePath,
    binaryPath,
    portFile,
    port: portInfo.port,
    request: Object.freeze({
      method: "GET",
      path: REQUEST_PATH,
      target: `http://127.0.0.1:${portInfo.port}${REQUEST_PATH}`
    }),
    responsePath,
    compileCommand: [input.toolchain.rustcPath, sourcePath, "-o", binaryPath],
    serviceCommand: [binaryPath],
    clientCommand: [process.execPath, clientPath, String(portInfo.port), responsePath],
    compileTraceResultPath: compile.paths.result,
    clientTraceResultPath: client.paths.result,
    serviceStdoutPath,
    serviceStderrPath,
    processStartedPath,
    processEventsPath,
    cleanup: Object.freeze({
      actorStatus: service.status,
      signal: service.signal,
      outcome: service.outcome.kind
    })
  });
  const manifestPath = path.join(input.runRoot, "service-process-request-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return Object.freeze({
    proofRoot,
    sourcePath,
    binaryPath,
    sourceDigest: sha256(input.artifact.serviceArtifact.source),
    manifestPath,
    manifestDigest: sha256(JSON.stringify(manifest, null, 2) + "\n"),
    portFile,
    responsePath,
    responseDigest: sha256(responseRaw),
    processStartedPath,
    processEventsPath,
    compile,
    client,
    service,
    actorEvents
  });
}

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

function fpEvaluatorContract(ref) {
  return publicRoot.constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpEvaluationOutcome"
  });
}

function proofFinding(input) {
  return publicRoot.constructFpEvaluationFinding({
    findingRef: `finding://t172/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    evaluatorRef: input.evaluationInput.contract.ref,
    gainReportRef: `gain://t172/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    metricRefs: [`metric://t172/live/${input.role}/${input.evaluationInput.vectorIndex}`],
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
    contract: fpEvaluatorContract("plugin://t172/live/service-request-evaluator"),
    evaluate(evaluationInput) {
      const proof = evaluationInput.attachedResultArtifact?.serviceRequestProof;
      assert.equal(proof?.compile?.status, 0);
      assert.equal(proof?.client?.status, 0);
      assert.equal(proof?.service?.status, 0);
      const proofRoleRows = [
        Object.freeze({
          role: "service-source",
          authorityRef: SUBJECT_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.sourcePath).href,
            `sha256://${proof.sourceDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "process-request-manifest",
          authorityRef: SERVICE_MANIFEST_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.manifestPath).href,
            `sha256://${proof.manifestDigest.slice("sha256:".length)}`
          ]
        }),
        Object.freeze({
          role: "service-request-execution",
          authorityRef: SERVICE_EXECUTION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.compile.paths.result).href,
            pathToFileURL(proof.service.stdoutPath).href,
            pathToFileURL(proof.service.stderrPath).href,
            pathToFileURL(proof.processStartedPath).href,
            pathToFileURL(proof.processEventsPath).href,
            pathToFileURL(proof.client.paths.result).href,
            `exit-status://${proof.service.status}`,
            `client-exit-status://${proof.client.status}`
          ]
        }),
        Object.freeze({
          role: "service-response-interpretation",
          authorityRef: INTERPRETATION_PROJECTION_REF,
          evidenceRefs: [
            pathToFileURL(proof.responsePath).href,
            `sha256://${proof.responseDigest.slice("sha256:".length)}`,
            "interpretation://t172/live/service-response-accepted"
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
              pathToFileURL(proof.responsePath).href
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

test("T-172 audit: generic supervised process and traced client command substrate are available", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `process_request_audit_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const toolchain = await rustToolchain(runRoot);
  assert.equal(typeof invokeSupervisedProcessActor, "function");
  assert.equal(typeof runTracedProcess, "function");
  assert.equal(toolchain.ready, true, JSON.stringify(toolchain));
  assert.match(toolchain.rustcVersion.stdout, /^rustc /u);
});

test("T-172 prompt carries service pressure without source or pass answer", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `prompt_carry_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const toolchain = await rustToolchain(runRoot);
  assert.equal(toolchain.ready, true, JSON.stringify(toolchain));
  const requirementSource = await writeRequirementSource(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t172/service-request-live",
    runId: "run://t172/service-request-live"
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
  assert.equal(prompt.includes(SERVICE_EXECUTION_PROJECTION_REF), true);
  assert.equal(prompt.includes("TcpListener::bind"), false);
  assert.equal(prompt.includes("fn main()"), false);
  assert.equal(prompt.includes('"fulfillment_status": "fulfilled",'), false);
  assert.equal(prompt.includes('"status": 0'), false);
});

test("T-172 live proof runs service process and client request through generic evidence", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T172_SERVICE_REQUEST_LIVE=1 or CODEX_LIVE_FP=1 to run T-172 live proof");
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
    dispatchRef: "dispatch://t172/service-request-live",
    runId: "run://t172/service-request-live"
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
    contract: fpDispatchContract("plugin://t172/live/service-request-dispatch"),
    dispatch: async (input) => {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(agentKey),
        prompt: liveWorkerPrompt(input, agentKey, admittedRequirementSection, toolchain),
        cwd: runRoot,
        archiveRoot: runRoot,
        label: "t172-service-request-live-fp-dispatch",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(runRoot, "t172-live-output.txt"),
        promptPath: path.join(runRoot, "t172-live-prompt.txt"),
        stdoutPath: path.join(runRoot, "t172-live-stdout.log"),
        stderrPath: path.join(runRoot, "t172-live-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const artifact = normalizeLiveArtifact(extractJsonObject(transport.text), input.edge);
      assertServiceArtifact(artifact, input.edge);
      const serviceRequestProof = await materializeServiceAndRequest({
        artifact,
        runRoot,
        toolchain,
        basis,
        vectorIndex: input.vectorIndex
      });
      const attachedResultArtifact = Object.freeze({
        ...artifact,
        serviceRequestProof,
        liveTransport: Object.freeze({
          status: transport.status,
          traceResultPath: transport.traceResultPath,
          outputPath: transport.outputPath
        })
      });
      liveArtifacts.push(attachedResultArtifact);
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t172/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact,
        evidenceRefs: [
          "live://t172/service-request",
          pathToFileURL(serviceRequestProof.sourcePath).href,
          pathToFileURL(serviceRequestProof.manifestPath).href,
          pathToFileURL(serviceRequestProof.responsePath).href,
          pathToFileURL(serviceRequestProof.client.paths.result).href
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
  assert.equal(liveArtifacts[0].serviceRequestProof.service.status, 0);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "traversal_applied", JSON.stringify(result.transition));

  const events = routeRuntimeEvents(result);
  const bindingsByProjection = evidenceBindingsByProjection(events);
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.evidenceRole, "asset");
  assert.equal(bindingsByProjection.get(SUBJECT_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(SERVICE_MANIFEST_PROJECTION_REF)?.evidenceRole, "test_source");
  assert.equal(bindingsByProjection.get(SERVICE_MANIFEST_PROJECTION_REF)?.bindingStatus, "admitted");
  assert.equal(bindingsByProjection.get(SERVICE_EXECUTION_PROJECTION_REF)?.evidenceRole, "test_execution");
  assert.equal(bindingsByProjection.get(SERVICE_EXECUTION_PROJECTION_REF)?.bindingStatus, "admitted");
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
    artifactFileName: "service-process-request-replay-artifact.json",
    manifestFileName: "service-process-request-replay-manifest.json",
    ticket: "T-172",
    source: Object.freeze({
      proofTicket: "T-172",
      proofCommand: "npm run test:t172:live",
      sourceRunKind: "live_fp_service_process_request_route",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      rustcPath: toolchain.rustcPath,
      rustcVersion: toolchain.rustcVersion.stdout.trim(),
      requirementSourceRef: requirementSource.sourceRef,
      requirementSourceDigest: requirementSource.sourceDigest,
      subjectProjectionRef: SUBJECT_PROJECTION_REF,
      serviceManifestProjectionRef: SERVICE_MANIFEST_PROJECTION_REF,
      serviceExecutionProjectionRef: SERVICE_EXECUTION_PROJECTION_REF,
      interpretationProjectionRef: INTERPRETATION_PROJECTION_REF,
      genericProofEvidenceRoleMap: Object.freeze({
        asset: "service_source_artifact",
        test_source: "process_request_manifest",
        test_execution: "service_process_and_client_request_execution",
        semantic_interpretation: "service_response_interpretation"
      }),
      processTruthRefs: Object.freeze({
        serviceStdoutPath: liveArtifacts[0].serviceRequestProof.service.stdoutPath,
        serviceStderrPath: liveArtifacts[0].serviceRequestProof.service.stderrPath,
        processEventCount: liveArtifacts[0].serviceRequestProof.service.events.length,
        actorEventCount: liveArtifacts[0].serviceRequestProof.actorEvents.length,
        clientTraceResultPath: liveArtifacts[0].serviceRequestProof.client.paths.result,
        responsePath: liveArtifacts[0].serviceRequestProof.responsePath
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
