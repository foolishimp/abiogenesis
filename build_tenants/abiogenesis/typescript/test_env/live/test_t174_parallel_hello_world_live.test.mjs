// Validates: T-174 live closure gate
// Validates: REQ-R-ABG3-SAGA-FRONTIER
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicAbgRequirements from "@abiogenesis/typescript-tenant/abg/requirements";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchIdempotencyKey,
  runEventedNativeSagaFrontier
} from "../../build/semantic/code/src/index.js";
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
  sha256Text,
  writeRequirementRouteReplayArtifact
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t174_parallel_hello_world_live"
);

const PARENT_REQUIREMENT_ID = "REQ-T174-PARALLEL-HELLO-WORLD-LIVE";
const HELLO_REQUIREMENT_ID = "REQ-T174-HELLO-BRANCH-LIVE";
const WORLD_REQUIREMENT_ID = "REQ-T174-WORLD-BRANCH-LIVE";
const FAN_IN_REQUIREMENT_ID = "REQ-T174-FAN-IN-LIVE";

const PROOF_POLICY_REF = "policy://t174/plugin-owned/parallel-hello-world";
const CONTEXT_REF = "fragment://t174/live/parallel-hello-world";

const PROJECTIONS = Object.freeze({
  hello: Object.freeze({
    asset: "projection://t174/live/hello-branch-artifact",
    verifier: "projection://t174/live/hello-branch-verifier-artifact",
    execution: "projection://t174/live/hello-branch-execution",
    interpretation: "projection://t174/live/hello-branch-interpretation"
  }),
  world: Object.freeze({
    asset: "projection://t174/live/world-branch-artifact",
    verifier: "projection://t174/live/world-branch-verifier-artifact",
    execution: "projection://t174/live/world-branch-execution",
    interpretation: "projection://t174/live/world-branch-interpretation"
  }),
  fanIn: Object.freeze({
    asset: "projection://t174/live/fan-in-artifact",
    verifier: "projection://t174/live/fan-in-verifier-artifact",
    execution: "projection://t174/live/fan-in-execution",
    interpretation: "projection://t174/live/fan-in-interpretation"
  })
});

const REQUIRED_PARALLEL_ROUTE_PAYLOAD_KINDS = Object.freeze([
  "requirement_term_admitted",
  "requirement_relation_admitted",
  "traversal_span_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_lifecycle_disposition"
]);

const REQUIREMENT_TEXTS = Object.freeze({
  [PARENT_REQUIREMENT_ID]: [
    "Construct a parallel Hello World proof over generic dependency-frontier truth.",
    "The work shall decompose into a hello branch, a world branch, and a fan-in composition.",
    "The fan-in composition shall execute and produce exactly: Hello, world!",
    "Branch scheduling, fan-in acceptability, JavaScript meaning, and release meaning are proof binding policy, not ABI policy."
  ].join("\n"),
  [HELLO_REQUIREMENT_ID]: [
    "Produce one branch artifact for the hello segment.",
    "The branch artifact shall be executable CommonJS source.",
    "When imported by the verifier, the branch artifact shall yield exactly: Hello"
  ].join("\n"),
  [WORLD_REQUIREMENT_ID]: [
    "Produce one branch artifact for the world segment.",
    "The branch artifact shall be executable CommonJS source.",
    "When imported by the verifier, the branch artifact shall yield exactly: world"
  ].join("\n"),
  [FAN_IN_REQUIREMENT_ID]: [
    "Compose the admitted hello and world branch artifacts through fan-in.",
    "The fan-in artifact shall execute through Node.js.",
    "The final stdout shall equal exactly: Hello, world! followed by one newline."
  ].join("\n")
});

function liveEnabled() {
  return process.env["ABG_TS_T174_PARALLEL_HELLO_WORLD_LIVE"] === "1" ||
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

async function writeRequirementSources(runRoot) {
  const sources = {};
  for (const [requirementId, sourceText] of Object.entries(REQUIREMENT_TEXTS)) {
    const sourcePath = path.join(
      runRoot,
      `${requirementId.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}.txt`
    );
    await writeFile(sourcePath, sourceText, "utf8");
    sources[requirementId] = Object.freeze({
      sourcePath,
      sourceRef: pathToFileURL(sourcePath).href,
      sourceDigest: sha256Text(sourceText)
    });
  }
  return Object.freeze(sources);
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
    spanRef: `span://t174-live/${vector.id}`
  });
}

function requirement(input) {
  return publicGtlRequirements.declareRequirement({
    requirementId: input.requirementId,
    termKind: input.termKind,
    stableId: input.requirementId,
    sourceRef: input.source.sourceRef,
    sourceDigest: input.source.sourceDigest,
    relationRefs: input.relationRefs,
    spanRefs: [input.spanId],
    contextRefs: [CONTEXT_REF],
    evidencePolicyRefs: [PROOF_POLICY_REF]
  });
}

function testRelation(input) {
  const projection = input.projection;
  return Object.freeze({
    kind: "gtl_requirement_test_relation_declaration",
    relationRef: `proof-relation://t174/live/${input.branchKey}`,
    requirementId: input.requirementId,
    assetProjectionRef: projection.asset,
    testSourceProjectionRef: projection.verifier,
    testExecutionProjectionRef: projection.execution,
    interpretationProjectionRef: projection.interpretation,
    componentTestRootRefs: [`proof/${input.branchKey}`],
    evidencePolicyRef: PROOF_POLICY_REF
  });
}

function declarationBundleForBasis(basis, vectorIndex, sources) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t174-live/${vector.id}`;
  const parentToHello = "relation://t174/live-parent-to-hello";
  const parentToWorld = "relation://t174/live-parent-to-world";
  const parentToFanIn = "relation://t174/live-parent-to-fan-in";
  const parent = requirement({
    requirementId: PARENT_REQUIREMENT_ID,
    termKind: "composition",
    source: sources[PARENT_REQUIREMENT_ID],
    relationRefs: [parentToHello, parentToWorld, parentToFanIn],
    spanId
  });
  const hello = requirement({
    requirementId: HELLO_REQUIREMENT_ID,
    termKind: "atom",
    source: sources[HELLO_REQUIREMENT_ID],
    relationRefs: [],
    spanId
  });
  const world = requirement({
    requirementId: WORLD_REQUIREMENT_ID,
    termKind: "atom",
    source: sources[WORLD_REQUIREMENT_ID],
    relationRefs: [],
    spanId
  });
  const fanIn = requirement({
    requirementId: FAN_IN_REQUIREMENT_ID,
    termKind: "atom",
    source: sources[FAN_IN_REQUIREMENT_ID],
    relationRefs: [],
    spanId
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRefs: [vector.id],
    vectorIndexes: [vectorIndex],
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id
  });
  const constraintScope = [
    "Parallel branch content and fan-in acceptability are proof binding policy.",
    "ABI owns dependency-frontier event truth, evidence admission, requirement folds, and replay.",
    "Downstream lifecycle interpretation remains outside ABI."
  ].join(" ");
  return publicGtlRequirements.declareBundle({
    requirements: [parent, hello, world, fanIn],
    relations: [
      publicGtlRequirements.declareRequirementRelation({
        relationId: parentToHello,
        relationKind: "refinement",
        fromRequirementId: PARENT_REQUIREMENT_ID,
        toRequirementId: HELLO_REQUIREMENT_ID
      }),
      publicGtlRequirements.declareRequirementRelation({
        relationId: parentToWorld,
        relationKind: "refinement",
        fromRequirementId: PARENT_REQUIREMENT_ID,
        toRequirementId: WORLD_REQUIREMENT_ID
      }),
      publicGtlRequirements.declareRequirementRelation({
        relationId: parentToFanIn,
        relationKind: "refinement",
        fromRequirementId: PARENT_REQUIREMENT_ID,
        toRequirementId: FAN_IN_REQUIREMENT_ID
      })
    ],
    spans: [span],
    contextFragments: [
      Object.freeze({
        kind: "gtl_authority_context_fragment_declaration",
        fragmentRef: CONTEXT_REF,
        originStage: "requirements",
        constraintScope,
        digest: sha256Text(constraintScope),
        promotionPolicyRef: PROOF_POLICY_REF,
        appliesToRefs: [
          PARENT_REQUIREMENT_ID,
          HELLO_REQUIREMENT_ID,
          WORLD_REQUIREMENT_ID,
          FAN_IN_REQUIREMENT_ID,
          spanId
        ]
      })
    ],
    testRelations: [
      testRelation({
        branchKey: "hello",
        requirementId: HELLO_REQUIREMENT_ID,
        projection: PROJECTIONS.hello
      }),
      testRelation({
        branchKey: "world",
        requirementId: WORLD_REQUIREMENT_ID,
        projection: PROJECTIONS.world
      }),
      testRelation({
        branchKey: "fan-in",
        requirementId: FAN_IN_REQUIREMENT_ID,
        projection: PROJECTIONS.fanIn
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
    throw new Error(`T-174 requirement sourceRef must be file://, got ${term.sourceRef}`);
  }
  const text = await readFile(fileURLToPath(term.sourceRef), "utf8");
  assert.equal(
    sha256Text(text),
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
    "Admitted ABG proof-evidence projections:",
    ...projectionSections
  ].join("\n");
}

function branchPrompt(input) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are executing one ABI T-174 live F_P branch for a generic dependency-frontier proof.",
    "Produce a small CommonJS branch artifact from the admitted requirement pressure.",
    "Do not assume implementation source was supplied. Do not include a precomputed pass/fail answer.",
    "JavaScript is only this proof binding's artifact format; ABI does not own JavaScript, test, fan-in, release, or acceptability policy.",
    "",
    `Branch key: ${input.branchKey}`,
    `Branch requirement id: ${input.requirementId}`,
    `Required segment value: ${input.expectedSegment}`,
    "",
    input.admittedRequirementSection,
    "",
    "Artifact interface:",
    "- source must be executable CommonJS.",
    "- source must export either a string, an object with a segment string, or a function returning the segment string.",
    "- fileName must be a basename ending in .cjs.",
    "",
    "Output contract:",
    "{",
    '  "branchKey": string,',
    `  "actor": ${JSON.stringify(input.agentKey)},`,
    '  "artifact": {',
    '    "language": "javascript-commonjs",',
    '    "fileName": string ending in ".cjs",',
    '    "source": executable CommonJS source as a JSON string,',
    '    "expectedSegment": expected segment as a JSON string',
    "  },",
    '  "fulfillment_assessments": [',
    "    {",
    "      \"id\": \"branch_artifact_ready\",",
    "      \"evaluator\": \"branch_artifact_ready\",",
    "      \"fulfillment_status\": \"fulfilled\" only if the artifact satisfies the admitted branch requirement,",
    "      \"fulfillment_detail\": short reason,",
    "      \"blocking_reasons\": [],",
    "      \"evidence_refs\": evidence references",
    "    }",
    "  ]",
    "}"
  ].join("\n");
}

function assertBranchWorkerArtifact(value, input) {
  assert.equal(value.branchKey, input.branchKey);
  assert.equal(value.actor, input.agentKey);
  assert.equal(value.artifact?.language, "javascript-commonjs");
  assert.equal(path.basename(value.artifact.fileName), value.artifact.fileName);
  assert.equal(value.artifact.fileName.endsWith(".cjs"), true);
  assert.equal(typeof value.artifact.source, "string");
  assert.equal(value.artifact.source.length > 0, true);
  assert.equal(value.artifact.expectedSegment, input.expectedSegment);
  assert.ok(Array.isArray(value.fulfillment_assessments));
  assert.ok(value.fulfillment_assessments.length > 0);
  for (const assessment of value.fulfillment_assessments) {
    assert.equal(assessment.fulfillment_status, "fulfilled");
    assert.deepEqual(assessment.blocking_reasons, []);
  }
}

function branchRef(branchKey, input = {}) {
  return constructBranchRef({
    graphCallId: "graph-call://t174/live/parallel-hello-world",
    frameId: "frame://t174/live/root",
    vectorIndex: 0,
    branchKey,
    fanInScopeRef: "fan-in://t174/live/parallel-hello-world",
    ...input
  });
}

function frontierDeclaration(branch, input = {}) {
  const observedStateRefs =
    input.observedStateRefs ?? ["observed://t174/live/parallel-hello-world"];
  const writeTerritoryRefs =
    input.writeTerritoryRefs ?? [`write://t174/live/${branch.branchKey}`];
  const outputAllocationRefs =
    input.outputAllocationRefs ?? [`output://t174/live/${branch.branchKey}`];
  const idempotencyKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: branch,
    observedStateRefs,
    writeTerritoryRefs,
    outputAllocationRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef: branch,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs,
    readRefs: input.readRefs ?? ["read://t174/live/shared-requirements"],
    writeTerritoryRefs,
    outputAllocationRefs,
    idempotencyKey,
    declaredPriority: input.declaredPriority ?? 0,
    criticalPathCost: input.criticalPathCost ?? 0
  });
}

function counters() {
  return {
    active: 0,
    maxActive: 0,
    started: [],
    completed: []
  };
}

function branchVerifierSource(expectedSegment) {
  return [
    "const assert = require('node:assert/strict');",
    "const artifactPath = process.argv[2];",
    "const loaded = require(artifactPath);",
    "const value = typeof loaded === 'function' ? loaded() :",
    "  (typeof loaded?.segment === 'function' ? loaded.segment() :",
    "  (loaded?.segment ?? loaded?.default ?? loaded));",
    `assert.equal(value, ${JSON.stringify(expectedSegment)});`,
    "process.stdout.write(String(value));"
  ].join("\n");
}

async function executeVerifier(input) {
  await writeFile(input.verifierPath, input.verifierSource, "utf8");
  const executed = await runTracedProcess({
    command: process.execPath,
    args: [input.verifierPath, input.artifactPath],
    cwd: input.cwd,
    env: process.env,
    archiveRoot: input.archiveRoot,
    label: input.label,
    timeoutMs: 30000,
    executorProfile: "local-spawn"
  });
  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stdout, input.expectedStdout);
  assert.equal(executed.stderr, "");
  return executed;
}

function liveBranchTask(input) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: input.branch.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(
        input.counters.maxActive,
        input.counters.active
      );
      input.counters.started.push(input.branch.branchRef);
      let transport;
      try {
        transport = await runAgentTransport({
          contract: input.contract,
          prompt: branchPrompt(input),
          cwd: input.root,
          archiveRoot: input.root,
          label: `t174.parallel.${input.branch.branchKey}.fp`,
          timeoutMs: transportTimeoutMs(),
          ...executorProfileFields(),
          outputPath: path.join(input.root, `${input.branch.branchKey}-worker-output.txt`),
          promptPath: path.join(input.root, `${input.branch.branchKey}-worker-prompt.txt`),
          stdoutPath: path.join(input.root, `${input.branch.branchKey}-worker-stdout.log`),
          stderrPath: path.join(input.root, `${input.branch.branchKey}-worker-stderr.log`)
        });
      } finally {
        input.counters.active -= 1;
      }
      input.counters.completed.push(input.branch.branchRef);
      assert.equal(transport.status, 0, transport.stderr);
      const artifact = extractJsonObject(transport.text);
      assertBranchWorkerArtifact(artifact, input);

      const proofRoot = path.join(input.root, "parallel-branches", input.branch.branchKey);
      await mkdir(proofRoot, { recursive: true });
      await writeFile(
        path.join(proofRoot, "package.json"),
        `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
        "utf8"
      );
      const artifactPath = path.join(proofRoot, artifact.artifact.fileName);
      const verifierPath = path.join(
        proofRoot,
        `${input.branch.branchKey}-verifier.cjs`
      );
      const verifierSource = branchVerifierSource(input.expectedSegment);
      await writeFile(artifactPath, artifact.artifact.source, "utf8");
      const execution = await executeVerifier({
        verifierPath,
        verifierSource,
        artifactPath,
        cwd: proofRoot,
        archiveRoot: path.join(input.root, `${input.branch.branchKey}-execution.trace`),
        label: `t174-parallel-${input.branch.branchKey}-verifier-execution`,
        expectedStdout: input.expectedSegment
      });
      const record = Object.freeze({
        branchKey: input.branch.branchKey,
        requirementId: input.requirementId,
        branchRef: input.branch.branchRef,
        artifactPath,
        artifactDigest: sha256Text(artifact.artifact.source),
        verifierPath,
        verifierDigest: sha256Text(verifierSource),
        executionStatus: execution.status,
        executionStdout: execution.stdout,
        executionTraceResultPath: execution.paths.result,
        liveTransportTraceResultPath: transport.traceResultPath,
        liveTransportOutputPath: transport.outputPath,
        projectionRefs: input.projection
      });
      input.branchRecords.set(input.branch.branchKey, record);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: input.branch.branchRef,
        payloadDigest: record.artifactDigest,
        evidenceRefs: [
          pathToFileURL(record.artifactPath).href,
          pathToFileURL(record.verifierPath).href,
          pathToFileURL(record.executionTraceResultPath).href,
          ...(record.liveTransportTraceResultPath === null
            ? []
            : [pathToFileURL(record.liveTransportTraceResultPath).href])
        ]
      });
    }
  });
}

function fanInSourceFor(input) {
  const helloRelative = `./${path.relative(input.fanInRoot, input.hello.artifactPath).replace(/\\/gu, "/")}`;
  const worldRelative = `./${path.relative(input.fanInRoot, input.world.artifactPath).replace(/\\/gu, "/")}`;
  return [
    `const helloModule = require(${JSON.stringify(helloRelative)});`,
    `const worldModule = require(${JSON.stringify(worldRelative)});`,
    "function valueOf(loaded) {",
    "  if (typeof loaded === 'function') return loaded();",
    "  if (typeof loaded?.segment === 'function') return loaded.segment();",
    "  return loaded?.segment ?? loaded?.default ?? loaded;",
    "}",
    "function composed() {",
    "  return `${valueOf(helloModule)}, ${valueOf(worldModule)}!\\n`;",
    "}",
    "if (require.main === module) {",
    "  process.stdout.write(composed());",
    "}",
    "module.exports = composed;"
  ].join("\n");
}

function fanInVerifierSource() {
  return [
    "const assert = require('node:assert/strict');",
    "const mainPath = process.argv[2];",
    "const loaded = require(mainPath);",
    "const value = typeof loaded === 'function' ? loaded() : loaded;",
    "assert.equal(value, 'Hello, world!\\n');",
    "process.stdout.write(value);"
  ].join("\n");
}

function fanInTask(input) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: input.branch.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(
        input.counters.maxActive,
        input.counters.active
      );
      input.counters.started.push(input.branch.branchRef);
      try {
        const hello = input.branchRecords.get("hello");
        const world = input.branchRecords.get("world");
        assert.ok(hello);
        assert.ok(world);
        const fanInRoot = path.join(input.root, "parallel-branches", "fan-in");
        await mkdir(fanInRoot, { recursive: true });
        await writeFile(
          path.join(fanInRoot, "package.json"),
          `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
          "utf8"
        );
        const fanInSource = fanInSourceFor({ fanInRoot, hello, world });
        const fanInPath = path.join(fanInRoot, "fan-in.cjs");
        const verifierSource = fanInVerifierSource();
        const verifierPath = path.join(fanInRoot, "fan-in-verifier.cjs");
        await writeFile(fanInPath, fanInSource, "utf8");
        const execution = await executeVerifier({
          verifierPath,
          verifierSource,
          artifactPath: fanInPath,
          cwd: fanInRoot,
          archiveRoot: path.join(input.root, "fan-in-execution.trace"),
          label: "t174-parallel-fan-in-verifier-execution",
          expectedStdout: "Hello, world!\n"
        });
        const record = Object.freeze({
          branchKey: "fan-in",
          requirementId: FAN_IN_REQUIREMENT_ID,
          branchRef: input.branch.branchRef,
          artifactPath: fanInPath,
          artifactDigest: sha256Text(fanInSource),
          verifierPath,
          verifierDigest: sha256Text(verifierSource),
          executionStatus: execution.status,
          executionStdout: execution.stdout,
          executionTraceResultPath: execution.paths.result,
          projectionRefs: PROJECTIONS.fanIn,
          inputBranchRefs: [hello.branchRef, world.branchRef]
        });
        input.branchRecords.set("fan-in", record);
        return Object.freeze({
          kind: "native_branch_task_result",
          branchRef: input.branch.branchRef,
          payloadDigest: record.artifactDigest,
          evidenceRefs: [
            pathToFileURL(record.artifactPath).href,
            pathToFileURL(record.verifierPath).href,
            pathToFileURL(record.executionTraceResultPath).href
          ]
        });
      } finally {
        input.counters.active -= 1;
        input.counters.completed.push(input.branch.branchRef);
      }
    }
  });
}

async function runParallelFrontierProof(input) {
  const hello = branchRef("hello");
  const world = branchRef("world");
  const fanIn = branchRef("fan-in");
  const countersForRun = counters();
  const branchRecords = new Map();
  const frontierSinkEvents = [];
  const result = await runEventedNativeSagaFrontier({
    basis: input.basis,
    frontierRef: "frontier://t174/live/parallel-hello-world",
    declarations: [
      frontierDeclaration(hello, {
        declaredPriority: 30,
        outputAllocationRefs: ["output://t174/live/hello-branch"]
      }),
      frontierDeclaration(world, {
        declaredPriority: 20,
        outputAllocationRefs: ["output://t174/live/world-branch"]
      }),
      frontierDeclaration(fanIn, {
        declaredPriority: 10,
        parentBranchRefs: [hello.branchRef, world.branchRef],
        readRefs: [
          "output://t174/live/hello-branch",
          "output://t174/live/world-branch"
        ],
        outputAllocationRefs: ["output://t174/live/fan-in"]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t174/live/parallel-hello-world",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/live/max-concurrency/two"
      ]
    }),
    tasks: [
      liveBranchTask({
        branch: hello,
        branchKey: "hello",
        requirementId: HELLO_REQUIREMENT_ID,
        expectedSegment: "Hello",
        projection: PROJECTIONS.hello,
        admittedRequirementSection: input.admittedRequirementSection,
        agentKey: input.agentKey,
        contract: input.contract,
        root: input.runRoot,
        counters: countersForRun,
        branchRecords
      }),
      liveBranchTask({
        branch: world,
        branchKey: "world",
        requirementId: WORLD_REQUIREMENT_ID,
        expectedSegment: "world",
        projection: PROJECTIONS.world,
        admittedRequirementSection: input.admittedRequirementSection,
        agentKey: input.agentKey,
        contract: input.contract,
        root: input.runRoot,
        counters: countersForRun,
        branchRecords
      }),
      fanInTask({
        branch: fanIn,
        root: input.runRoot,
        counters: countersForRun,
        branchRecords
      })
    ],
    eventSink: (event) => {
      frontierSinkEvents.push(event);
    },
    correlationId: "correlation://t174/live/parallel-hello-world"
  });
  const fanInProjection = deriveBranchFanInProjectionFromEvents({
    fanInRef: hello.fanInScopeRef,
    events: result.replayEvents,
    declaredOrderBranchRefs: [hello.branchRef, world.branchRef, fanIn.branchRef]
  });
  assert.equal(countersForRun.maxActive, 2);
  assert.equal(result.batchCount, 2);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [
    hello.branchRef,
    world.branchRef
  ]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [
    fanIn.branchRef
  ]);
  assert.equal(
    result.replayEvents.some((event) => event.kind === "branch_fan_in_projected"),
    true
  );
  assert.deepEqual(result.failedBranchRefs, []);
  assert.equal(fanInProjection.orderedBranchRefs.length, 3);
  assert.equal(fanInProjection.payloadDigests.length, 3);
  assert.equal(branchRecords.get("fan-in")?.executionStdout, "Hello, world!\n");
  return Object.freeze({
    result,
    frontierSinkEvents,
    fanInProjection,
    counters: Object.freeze({
      maxActive: countersForRun.maxActive,
      started: Array.from(countersForRun.started),
      completed: Array.from(countersForRun.completed)
    }),
    branchRecords: Object.freeze(Object.fromEntries(branchRecords))
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
    findingRef: `finding://t174/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    evaluatorRef: input.evaluationInput.contract.ref,
    gainReportRef: `gain://t174/live/${input.role}/${input.evaluationInput.vectorIndex}`,
    metricRefs: [`metric://t174/live/${input.role}/${input.evaluationInput.vectorIndex}`],
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

function evidenceRowsForRecord(input) {
  const record = input.record;
  const projection = record.projectionRefs;
  return [
    Object.freeze({
      role: `${input.key}-artifact`,
      authorityRef: projection.asset,
      evidenceRefs: [
        pathToFileURL(record.artifactPath).href,
        `sha256://${record.artifactDigest.slice("sha256:".length)}`
      ]
    }),
    Object.freeze({
      role: `${input.key}-verifier-artifact`,
      authorityRef: projection.verifier,
      evidenceRefs: [
        pathToFileURL(record.verifierPath).href,
        `sha256://${record.verifierDigest.slice("sha256:".length)}`
      ]
    }),
    Object.freeze({
      role: `${input.key}-execution`,
      authorityRef: projection.execution,
      evidenceRefs: [
        pathToFileURL(record.executionTraceResultPath).href,
        `exit-status://${record.executionStatus}`
      ]
    }),
    Object.freeze({
      role: `${input.key}-interpretation`,
      authorityRef: projection.interpretation,
      evidenceRefs: [
        pathToFileURL(record.executionTraceResultPath).href,
        `stdout://${encodeURIComponent(record.executionStdout)}`
      ]
    })
  ];
}

function parallelProofEvaluatorPlugin() {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t174/live/parallel-proof-evaluator"),
    evaluate(evaluationInput) {
      const proof = evaluationInput.attachedResultArtifact?.parallelProof;
      assert.ok(proof);
      assert.equal(proof.branchRecords.hello.executionStdout, "Hello");
      assert.equal(proof.branchRecords.world.executionStdout, "world");
      assert.equal(proof.branchRecords["fan-in"].executionStdout, "Hello, world!\n");
      assert.equal(proof.frontierEventKinds.includes("branch_fan_in_projected"), true);
      const proofRoleRows = [
        ...evidenceRowsForRecord({
          key: "hello",
          record: proof.branchRecords.hello
        }),
        ...evidenceRowsForRecord({
          key: "world",
          record: proof.branchRecords.world
        }),
        ...evidenceRowsForRecord({
          key: "fan-in",
          record: proof.branchRecords["fan-in"]
        })
      ];
      const edgeAuthorityRows = evaluationInput.expectedAssessmentIds.map(
        (authorityRef, index) =>
          Object.freeze({
            role: `edge-authority-${index}`,
            authorityRef,
            evidenceRefs: [
              evaluationInput.sourceProjectionRef,
              pathToFileURL(proof.branchRecords["fan-in"].executionTraceResultPath).href
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

function parallelDispatchPlugin(parallelProof) {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t174/live/parallel-proof-dispatch"),
    dispatch(input) {
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t174/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: input.edge,
          actor: "abi-t174-parallel-frontier-proof",
          fulfillment_assessments: Object.freeze(
            input.expectedAssessmentIds.map((assessmentId) => Object.freeze({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: "fulfilled",
              fulfillment_detail:
                "dependency-frontier branch work, fan-in execution, and evidence refs are present",
              blocking_reasons: Object.freeze([]),
              evidence_refs: Object.freeze(parallelProof.frontierEvidenceRefs)
            }))
          ),
          parallelProof
        }),
        evidenceRefs: [
          "frontier://t174/live/parallel-hello-world",
          ...parallelProof.frontierEvidenceRefs
        ]
      });
    }
  });
}

function routeRuntimeEvents(result) {
  return result.replayEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

function routeEventsByPayloadKind(routeEvents, payloadKind) {
  return routeEvents.filter((event) =>
    event.routePayloadKind === payloadKind
  );
}

function evidenceBindingsByProjection(routeEvents) {
  const bindings = routeEventsByPayloadKind(
    routeEvents,
    "requirement_evidence_bound"
  ).map((event) => event.requirementPayload.binding);
  return new Map(bindings.map((binding) => [binding.projectionRef, binding]));
}

test("T-174 prompt carries branch requirements without source or verdict", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, `prompt_carry_${timestampId()}`);
  await mkdir(runRoot, { recursive: true });
  const sources = await writeRequirementSources(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t174/parallel-hello-world-live",
    runId: "run://t174/parallel-hello-world-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const bundle = declarationBundleForBasis(basis, 0, sources);
  const expectedRouteContext = expectedRouteContextForBasis(basis, 0, bundle);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge: routeEdgeForBasisVector(basis, 0)
  });
  const prompt = branchPrompt({
    branchKey: "hello",
    requirementId: HELLO_REQUIREMENT_ID,
    expectedSegment: "Hello",
    agentKey: "claude",
    admittedRequirementSection: await requirementPromptSection({
      environment,
      ledger: expectedRouteContext.ledger
    })
  });
  assert.equal(prompt.includes(HELLO_REQUIREMENT_ID), true);
  assert.equal(prompt.includes(PROJECTIONS.hello.asset), true);
  assert.equal(prompt.includes("module.exports ="), false);
  assert.equal(prompt.includes("process.stdout.write('Hello, world!"), false);
  assert.equal(prompt.includes('"fulfillment_status": "fulfilled",'), false);
  assert.equal(prompt.includes('"status": 0'), false);
});

test("T-174 live proof publishes parallel frontier plus requirements replay", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T174_PARALLEL_HELLO_WORLD_LIVE=1 or CODEX_LIVE_FP=1 to run T-174 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const sources = await writeRequirementSources(runRoot);
  const baseBasis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t174/parallel-hello-world-live",
    runId: "run://t174/parallel-hello-world-live"
  });
  const basis = firstTraversalBasis(baseBasis);
  const bundle = declarationBundleForBasis(basis, 0, sources);
  const expectedRouteContext = expectedRouteContextForBasis(basis, 0, bundle);
  const edge = routeEdgeForBasisVector(basis, 0);
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: expectedRouteContext.ledger,
    edge
  });
  const graph = publicAbgRequirements.projectRequirementGraph({
    ledger: expectedRouteContext.ledger,
    environment
  });
  assert.equal(graph.parentChildPairs.length, 3);
  const admittedRequirementSection = await requirementPromptSection({
    environment,
    ledger: expectedRouteContext.ledger
  });

  const frontierProof = await runParallelFrontierProof({
    basis,
    runRoot,
    agentKey,
    contract: contractForKnownAgent(agentKey),
    admittedRequirementSection
  });
  const parallelProof = Object.freeze({
    sourceRunKind: "live_fp_parallel_hello_world_frontier",
    frontierRef: "frontier://t174/live/parallel-hello-world",
    fanInRef: "fan-in://t174/live/parallel-hello-world",
    branchRecords: frontierProof.branchRecords,
    frontierEventKinds: frontierProof.result.replayEvents.map((event) => event.kind),
    frontierEventRefs: frontierProof.result.replayEvents
      .map((event) => event.eventRef ?? event.branchRef ?? event.frontierRef)
      .filter((ref) => typeof ref === "string"),
    frontierEvidenceRefs: frontierProof.fanInProjection.evidenceRefs,
    fanInProjection: frontierProof.fanInProjection,
    counters: frontierProof.counters
  });

  const routeSinkEvents = [];
  const routeResult = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      routeSinkEvents.push(event);
    },
    plugins: {
      fpDispatch: parallelDispatchPlugin(parallelProof),
      fpEvaluator: parallelProofEvaluatorPlugin()
    },
    requirementRouteDeclarationBundle: bundle
  });
  assert.equal(routeResult.transition.kind, "terminal");
  assert.equal(
    routeResult.transition.terminalKind,
    "traversal_applied",
    JSON.stringify(routeResult.transition)
  );

  const routeEvents = routeRuntimeEvents(routeResult);
  for (const kind of REQUIRED_PARALLEL_ROUTE_PAYLOAD_KINDS) {
    assert.equal(
      routeEvents.some((event) => event.routePayloadKind === kind),
      true,
      `missing route event ${kind}`
    );
  }
  assert.equal(
    routeEvents.some((event) =>
      event.routePayloadKind === "requirement_residual_projected"
    ),
    false
  );

  const bindingsByProjection = evidenceBindingsByProjection(routeEvents);
  for (const projection of [
    PROJECTIONS.hello,
    PROJECTIONS.world,
    PROJECTIONS.fanIn
  ]) {
    assert.equal(bindingsByProjection.get(projection.asset)?.bindingStatus, "admitted");
    assert.equal(bindingsByProjection.get(projection.verifier)?.bindingStatus, "admitted");
    assert.equal(bindingsByProjection.get(projection.execution)?.bindingStatus, "admitted");
    assert.equal(bindingsByProjection.get(projection.interpretation)?.bindingStatus, "admitted");
  }

  const folds = routeEventsByPayloadKind(
    routeEvents,
    "requirement_fold_projected"
  ).map((event) => event.requirementPayload.fold);
  assert.deepEqual(
    [...new Set(folds.map((fold) => fold.requirementId))].sort(),
    [
      FAN_IN_REQUIREMENT_ID,
      HELLO_REQUIREMENT_ID,
      WORLD_REQUIREMENT_ID
    ].sort()
  );
  assert.equal(folds.every((fold) => fold.state === "satisfied"), true);
  assert.equal(
    folds.some((fold) => fold.requirementId === PARENT_REQUIREMENT_ID),
    false
  );
  const residuals = routeEventsByPayloadKind(
    routeEvents,
    "requirement_residual_projected"
  ).map((event) => event.requirementPayload.residual);
  assert.equal(residuals.length, 0);
  const aggregateStates = publicAbgRequirements.projectAggregateStates({
    ledger: expectedRouteContext.ledger,
    environment,
    folds,
    residuals
  });
  assert.equal(aggregateStates.length, 1);
  assert.equal(aggregateStates[0].requirementId, PARENT_REQUIREMENT_ID);
  assert.equal(aggregateStates[0].state, "satisfied");

  const evidenceBindings = routeEventsByPayloadKind(
    routeEvents,
    "requirement_evidence_bound"
  ).map((event) => event.requirementPayload.binding);
  const obligations = publicAbgRequirements.projectEdgeObligations({
    ledger: expectedRouteContext.ledger,
    environment
  });
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
    projections: obligations,
    evidenceBindings,
    folds,
    residuals,
    attenuation,
    assuranceClaims
  });
  const dispositionRefs = routeEventsByPayloadKind(
    routeEvents,
    "requirement_lifecycle_disposition"
  ).map((event) => event.routePayloadRef);
  const combinedReplayEvents = Object.freeze([
    ...frontierProof.result.replayEvents,
    ...routeResult.replayEvents
  ]);
  const combinedEmittedEvents = Object.freeze([
    ...frontierProof.result.emittedEvents,
    ...routeResult.emittedEvents
  ]);
  const combinedSinkEvents = Object.freeze([
    ...frontierProof.frontierSinkEvents,
    ...routeSinkEvents
  ]);
  const lifecycleState = publicAbgRequirements.projectLifecycleState({
    query: requirementQuery,
    dispositionRefs,
    runtimeEvents: combinedReplayEvents
  });
  assert.equal(lifecycleState.status, "accepted");
  assert.equal(
    combinedReplayEvents.some((event) => event.kind === "branch_fan_in_projected"),
    true
  );
  assert.equal(
    combinedReplayEvents.some((event) =>
      event.kind === "requirement_route_fact_projected"
    ),
    true
  );

  const replayArtifact = await writeRequirementRouteReplayArtifact({
    ticket: "T-174",
    requiredPayloadKinds: REQUIRED_PARALLEL_ROUTE_PAYLOAD_KINDS,
    runRoot,
    artifactFileName: "parallel-hello-world-replay-artifact.json",
    manifestFileName: "parallel-hello-world-replay-manifest.json",
    source: Object.freeze({
      proofTicket: "T-174",
      proofCommand: "npm run test:t174:live",
      sourceRunKind: "live_fp_parallel_hello_world_frontier_and_route",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      parentRequirementId: PARENT_REQUIREMENT_ID,
      childRequirementIds: [
        HELLO_REQUIREMENT_ID,
        WORLD_REQUIREMENT_ID,
        FAN_IN_REQUIREMENT_ID
      ],
      frontierRef: parallelProof.frontierRef,
      fanInRef: parallelProof.fanInRef,
      branchRecords: parallelProof.branchRecords,
      branchEventKinds: parallelProof.frontierEventKinds,
      branchEvidenceRefs: parallelProof.frontierEvidenceRefs,
      proofBindingPolicy:
        "JavaScript branch artifacts and Hello World fan-in are scenario bindings; ABI owns generic frontier and requirements truth only."
    }),
    replayEvents: combinedReplayEvents,
    emittedEvents: combinedEmittedEvents,
    sinkEvents: combinedSinkEvents,
    lifecycleState: Object.freeze({
      ...lifecycleState.value,
      requirementGraph: graph,
      aggregateStates,
      frontierProjection: parallelProof.fanInProjection
    })
  });
  assertRequirementRouteReplayArtifact(replayArtifact.artifact, {
    requiredPayloadKinds: REQUIRED_PARALLEL_ROUTE_PAYLOAD_KINDS
  });
  assert.equal(
    replayArtifact.artifact.replayEvents.some((event) =>
      event.kind === "branch_fan_in_projected"
    ),
    true
  );
  assert.equal(replayArtifact.manifest.artifact.requiredPayloadKindsSatisfied, true);
});
