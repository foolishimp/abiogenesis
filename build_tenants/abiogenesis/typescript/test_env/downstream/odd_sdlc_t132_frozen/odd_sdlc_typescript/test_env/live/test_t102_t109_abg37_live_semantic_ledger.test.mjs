// Validates: T-102
// Validates: T-109
// Validates: ABG-4-live-FP-semantic-evaluation

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
import { performance } from "node:perf_hooks";

import {
  admitExecutionBasis,
  admitFpTransformResultForRequest,
  admitOutputWorkspaceBinding,
  constructFpTransformRequest,
  constructFpTransformResult,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructJob,
  constructModule,
  constructNode,
  deriveOutputInstanceAllocation,
  deriveRetryFrontierProjection,
  deriveRuntimeAggregateProjection,
  emptySerializedAttrs,
  runtimeEventsForFpTransformResult
} from "@abiogenesis/typescript-tenant";

import {
  BOOTSTRAP_INPUT,
  EXPECTED_LIFECYCLE_BUNDLE,
  SDLC_REQUIREMENTS,
  edgePayloadFromRows,
  evaluateSemanticRows
} from "../fixtures/t102_t109_mini_sdlc_lifecycle.mjs";
import { liveTestArchiveRoot } from "./archive_root.mjs";
import { liveOperatorRuntimePolicy } from "./operator_runtime_policy.mjs";

const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const LIVE_ENABLED = process.env["ODD_SDLC_TS_T109_LIVE"] === "1";
const WORKER_COMMAND = process.env["ODD_SDLC_TS_LIVE_WORKER_COMMAND"] ?? "codex";
const CODEX_MODEL = process.env["ODD_SDLC_TS_LIVE_CODEX_MODEL"] ?? "gpt-5.3-codex";
const CODEX_EFFORT = process.env["ODD_SDLC_TS_LIVE_CODEX_EFFORT"] ?? null;

function sha256Text(content) {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function node(name, assetType) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://odd-sdlc/t109-live/${assetType}` },
    markov: [],
    assetSurface: {
      kind: assetType,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["t109-abg4-live-sdlc"],
    id: `node:live:t109:${name}`
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
        binding: "process://codex",
        tags: ["live"]
      }
    ],
    evaluators: [
      {
        name: `${name}_semantic_eval`,
        regime: "F_P",
        description: "Live requirement-by-requirement SDLC semantic evaluator",
        binding: "plugin://odd-sdlc/t109-live/semantic-evaluator",
        tags: ["live"]
      }
    ],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptySerializedAttrs(),
    tags: ["t109-abg4-live-sdlc"],
    id: `vector:live:t109:${name}`
  });
}

function liveModule() {
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
    name: "live_mini_odd_sdlc_lifecycle",
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
    tags: ["t109-abg4-live-sdlc"],
    id: "graph:live:t109:mini-odd-sdlc-lifecycle"
  });
  const graphFunction = constructGraphFunction({
    name: "live_mini_odd_sdlc_lifecycle_abg4",
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
      ref: "template://odd-sdlc/t109-live/mini-lifecycle",
      graph,
      version: null
    },
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: ["t109-abg4-live-sdlc"],
    id: "graph-function:live:t109:mini-odd-sdlc-lifecycle-abg4"
  });
  const job = constructJob({
    name: "live_mini_odd_sdlc_lifecycle_abg4_job",
    contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
    roles: [],
    tags: ["t109-abg4-live-sdlc"],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs(),
    id: "job:live:t109:mini-odd-sdlc-lifecycle-abg4"
  });
  return constructModule({
    name: "odd_sdlc_t109_abg4_live_sdlc",
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

function basisFor(inputWorkspaceRoot, outputWorkspaceRoot) {
  const module = liveModule();
  return admitExecutionBasis({
    module,
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: inputWorkspaceRoot,
        moduleName: module.name
      },
      target: { kind: "graph_function", handle: "live_mini_odd_sdlc_lifecycle_abg4" },
      until: "converged",
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
            workspaceRef: "workspace://output/t109-live-sdlc",
            workspaceRoot: outputWorkspaceRoot,
            authorityRef: "ticket://odd-sdlc/T-109"
          }
        }
      ]
    },
    runtimeIdentity: {
      workerId: "worker://codex/gpt-5.3-codex",
      backendId: "backend://codex-cli",
      buildId: "build://odd-sdlc/t109-abg4-live-sdlc",
      resolvedRuntimeRef: "runtime://abiogenesis/current-live"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://odd-sdlc/t109-abg4-live",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t109-abg4-live",
      approvalSubjectRef: null
    },
    runId: "run:t109-abg4-live-sdlc",
    workKey: "work:t109-abg4-live-sdlc",
    frameId: "frame:t109-abg4-live-sdlc",
    frameLineageId: "frame-lineage:t109-abg4-live-sdlc"
  });
}

function actorInvocationRef() {
  return {
    actorInvocationId: "actor:t109-live-sdlc:4:0",
    attemptIndex: 0,
    dispatchRef: "dispatch:t109-live-sdlc:4:0",
    resultRef: "result:t109-live-sdlc:4:0"
  };
}

function promptFor(outputFile) {
  return [
    "You are the live F_P.transform worker for odd_sdlc T-102/T-109.",
    "Create exactly one JSON file at the requested output path.",
    "This is an odd_sdlc lifecycle graph, not a generic data-mapper task.",
    "Do not write closure decisions, runtime events, unresolvedReasons, nextVectorIndex, or ledger verdicts.",
    "Your only job is to materialize the SDLC lifecycle output bundle from the provided bootstrap and requirements.",
    "",
    `Output path: ${outputFile}`,
    "",
    "Bootstrap input:",
    JSON.stringify(BOOTSTRAP_INPUT, null, 2),
    "",
    "Requirement authorities:",
    JSON.stringify(
      SDLC_REQUIREMENTS.map((requirement) => ({
        id: requirement.id,
        title: requirement.title,
        detail: requirement.detail,
        sourceAuthorityRef: requirement.sourceAuthorityRef
      })),
      null,
      2
    ),
    "",
    "The JSON file must contain exactly this object:",
    JSON.stringify(EXPECTED_LIFECYCLE_BUNDLE, null, 2),
    "",
    "No markdown. No commentary in the file."
  ].join("\n");
}

function runLiveWorker(input) {
  const prompt = promptFor(input.outputFile);
  const outputLastMessage = path.join(input.archiveRoot, "worker_last_message.txt");
  writeFileSync(path.join(input.archiveRoot, "worker_prompt.md"), prompt, "utf8");
  const args =
    WORKER_COMMAND === "codex"
      ? [
          "exec",
          "-m",
          CODEX_MODEL,
          ...(CODEX_EFFORT === null
            ? []
            : ["-c", `model_reasoning_effort="${CODEX_EFFORT}"`]),
          "--skip-git-repo-check",
          "--ephemeral",
          "--sandbox",
          "workspace-write",
          "--cd",
          input.outputWorkspaceRoot,
          "--output-last-message",
          outputLastMessage,
          prompt
        ]
      : [prompt];
  const startedAt = performance.now();
  const run = spawnSync(WORKER_COMMAND, args, {
    cwd: input.outputWorkspaceRoot,
    encoding: "utf8",
    timeout: RUNTIME_POLICY.liveHarnessCommandTimeoutMs,
    maxBuffer: 1024 * 1024 * 20
  });
  const elapsedMs = performance.now() - startedAt;
  const summary = {
    command: WORKER_COMMAND,
    args,
    cwd: input.outputWorkspaceRoot,
    status: run.status,
    signal: run.signal,
    elapsedMs,
    stdout: run.stdout,
    stderr: run.stderr,
    error: run.error?.message ?? null,
    outputLastMessage
  };
  writeJson(path.join(input.archiveRoot, "worker_run.json"), summary);
  writeFileSync(path.join(input.archiveRoot, "worker_stdout.log"), run.stdout, "utf8");
  writeFileSync(path.join(input.archiveRoot, "worker_stderr.log"), run.stderr, "utf8");
  return summary;
}

test(
  "T-102/T-109 live ABG 4 path admits codex F_P output for the same SDLC lifecycle bundle as sandbox",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_T109_LIVE=1 not set" },
  () => {
    assert.equal(WORKER_COMMAND, "codex", "T-109 live proof is pinned to codex");
    assert.match(CODEX_MODEL, /\S/u, "codex live proof must declare a model");

    const archiveRoot = liveTestArchiveRoot(
      "t109_live_abg4_sdlc_lifecycle",
      archiveTimestamp(),
      process.pid
    );
    const inputWorkspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t109-live-input-"));
    const outputWorkspaceRoot = path.join(archiveRoot, "output_workspace");
    mkdirSync(outputWorkspaceRoot, { recursive: true });
    writeJson(path.join(inputWorkspaceRoot, "project_bootstrap.json"), BOOTSTRAP_INPUT);
    writeJson(path.join(inputWorkspaceRoot, "requirements.json"), SDLC_REQUIREMENTS);

    const basis = basisFor(inputWorkspaceRoot, outputWorkspaceRoot);
    const binding = admitOutputWorkspaceBinding({
      workspaceRef: "workspace://output/t109-live-sdlc",
      workspaceRoot: outputWorkspaceRoot,
      authorityRef: "ticket://odd-sdlc/T-109",
      source: "caller"
    });
    assert.equal(binding.ok, true);
    const allocation = deriveOutputInstanceAllocation({
      basis,
      outputName: "sdlc_lifecycle_bundle",
      outputAssetType: "qualification_report_surface",
      relativePath: "sdlc_lifecycle_bundle.json",
      outputWorkspaceBinding: binding.binding
    });
    assert.equal(allocation.ok, true);
    assert.equal(allocation.allocation.inputWorkspaceRoot, inputWorkspaceRoot);
    assert.equal(allocation.allocation.outputWorkspaceRoot, outputWorkspaceRoot);

    const workerRun = runLiveWorker({
      archiveRoot,
      outputWorkspaceRoot,
      outputFile: allocation.allocation.materializationUri
    });
    assert.equal(workerRun.status, 0, "live codex worker failed");
    assert.equal(existsSync(allocation.allocation.materializationUri), true);

    const outputText = readFileSync(allocation.allocation.materializationUri, "utf8");
    const output = JSON.parse(outputText);
    assert.deepEqual(output, EXPECTED_LIFECYCLE_BUNDLE);

    const outputRef = `file://${allocation.allocation.materializationUri}`;
    const projection = deriveRuntimeAggregateProjection(basis, []);
    const retryFrontier = deriveRetryFrontierProjection({
      basis,
      runtimeProjection: projection,
      events: [],
      vectorIndex: 4
    });
    const request = constructFpTransformRequest({
      basis,
      projection,
      vectorIndex: 4,
      edge: "derive_qualification_report",
      actorInvocationRef: actorInvocationRef(),
      sourceProjectionRef: "projection://runtime/t109-live-sdlc/before-transform",
      expectedAssessmentIds: SDLC_REQUIREMENTS.map((requirement) => requirement.id),
      retryFrontier
    });
    const result = constructFpTransformResult({
      request,
      artifactRef: outputRef,
      status: "returned",
      evidenceCandidates: [
        {
          candidateRef: "candidate://t109-live-sdlc/lifecycle-bundle",
          authorityRef: "requirements://odd-sdlc/mini-lifecycle/live",
          evidenceRefs: [outputRef],
          payloadClass: "qualification_report_surface",
          contractRef: "contract://odd-sdlc/t109-live/sdlc-lifecycle"
        }
      ]
    });
    const admitted = admitFpTransformResultForRequest(request, result);
    const events = runtimeEventsForFpTransformResult({ basis, request, result: admitted });
    const rows = evaluateSemanticRows(output, outputRef);
    const payload = edgePayloadFromRows(rows);

    assert(events.some((event) => event.kind === "evidence_admitted"));
    assert.deepEqual(
      rows.map((row) => [row.obligationId, row.status]),
      SDLC_REQUIREMENTS.map((requirement) => [requirement.id, "fulfilled"])
    );
    assert.equal(payload.edgeConverged, true);
    assert.equal(payload.lawfulNextAction, "close");

    writeJson(path.join(archiveRoot, "abg_fp_transform_request.json"), request);
    writeJson(path.join(archiveRoot, "abg_fp_transform_result.json"), admitted);
    writeJson(path.join(archiveRoot, "abg_runtime_events.json"), events);
    writeJson(path.join(archiveRoot, "sdlc_semantic_rows.json"), rows);
    writeJson(path.join(archiveRoot, "sdlc_edge_payload.json"), payload);
    writeJson(path.join(archiveRoot, "run_summary.json"), {
      kind: "odd_sdlc_t109_live_abg4_sdlc_lifecycle_archive",
      verdict: "passed",
      worker: {
        command: WORKER_COMMAND,
        model: CODEX_MODEL,
        status: workerRun.status,
        elapsedMs: workerRun.elapsedMs
      },
      inputWorkspaceRoot,
      outputWorkspaceRoot,
      outputDigest: sha256Text(outputText),
      outputRef,
      expectedOutputKind: EXPECTED_LIFECYCLE_BUNDLE.kind,
      admittedEventKinds: events.map((event) => event.kind),
      fulfilledCount: payload.fulfilledCount,
      expectedCount: payload.expectedCount,
      edgeConverged: payload.edgeConverged
    });
  }
);
