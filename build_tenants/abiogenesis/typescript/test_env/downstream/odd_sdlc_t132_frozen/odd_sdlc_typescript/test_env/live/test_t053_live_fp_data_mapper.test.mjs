// Validates: REQ-F-ODDSDLC-024
// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-043
// Validates: T-053

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import path, { dirname } from "node:path";
import { performance } from "node:perf_hooks";

import {
  admitSdlcConstructorResult,
  admitSdlcProjectConstraints,
  constructSdlcGtlModule,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  runSdlcHookTurn
} from "../../build/semantic/code/src/index.js";
import {
  assertAbgInstalledSandboxEvidence,
  provisionAbgInstalledSandbox
} from "../sandbox/abg_installed_workspace.mjs";
import { liveTestArchiveRoot } from "./archive_root.mjs";
import { liveOperatorRuntimePolicy } from "./operator_runtime_policy.mjs";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const LIVE_ENABLED = process.env["ODD_SDLC_TS_LIVE_FP"] === "1";
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();
const WORKER_COMMAND = process.env["ODD_SDLC_TS_LIVE_WORKER_COMMAND"] ?? "codex";
const CANONICAL_WORKER_REPORT_KIND = "odd_sdlc.fp_worker.work_report";
const CANONICAL_WORKER_REPORT_TARGET_ASSET_TYPE = "code_surface";
const ACCEPTED_WORKER_REPORT_KINDS = Object.freeze([
  CANONICAL_WORKER_REPORT_KIND,
  "odd_sdlc.live_worker_report"
]);
const ACCEPTED_WORKER_REPORT_TARGET_ASSET_TYPES = Object.freeze([
  CANONICAL_WORKER_REPORT_TARGET_ASSET_TYPE,
  "typescript_code_surface",
  "typescript.code_surface"
]);
const DATA_MAPPER_FILES = Object.freeze([
  "README.md",
  ".ai-workspace/context/project_constraints.yml",
  "specification/INTENT.md",
  "specification/REQUIREMENTS.md",
  "specification/mapper_requirements.md",
  "specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md"
]);

function stableJson(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function sha256(content) {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

function archiveTimestamp() {
  return new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");
}

function fixtureSnapshot(rootUri, relativePath, content) {
  return {
    uri: `${rootUri}/${relativePath}`,
    relativePath,
    content
  };
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, stableJson(payload), "utf8");
}

function readDataMapperSources() {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing internal data_mapper.template fixture root: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  return DATA_MAPPER_FILES.map((relativePath) => {
    const absolutePath = path.join(DATA_MAPPER_TEMPLATE_ROOT, relativePath);
    assert.equal(
      existsSync(absolutePath),
      true,
      `missing data_mapper source file ${relativePath}`
    );
    return {
      relativePath,
      absolutePath,
      content: readFileSync(absolutePath, "utf8")
    };
  });
}

function deriveIngress(sources) {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${DATA_MAPPER_TEMPLATE_ROOT}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "data_mapper",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["live_fp_worker", "build_runner", "runtime_return_channel"]
    }),
    sourceInputs: sources.map((source) =>
      deriveSdlcSourceInput(
        fixtureSnapshot(
          `file://${DATA_MAPPER_TEMPLATE_ROOT}`,
          source.relativePath,
          source.content
        )
      )
    )
  });
}

function promptFor(input) {
  const manifest = {
    scenario: "T-053 live F_P data_mapper",
    targetGraphFunction: "derive_code_surface",
    expectedReportKind: CANONICAL_WORKER_REPORT_KIND,
    expectedTargetAssetType: CANONICAL_WORKER_REPORT_TARGET_ASSET_TYPE,
    outputFile: input.outputFile,
    reportFile: input.reportFile,
    sources: input.sources.map((source) => ({
      relativePath: source.relativePath,
      digest: sha256(source.content),
      excerpt: source.content.slice(0, 2000)
    }))
  };
  return [
    "You are the live F_P worker for odd_sdlc.TS T-053.",
    "Create the requested governed code surface artifact.",
    "Do not modify files outside the current working directory.",
    `Write a TypeScript file at ${input.outputFile}.`,
    `Write a JSON report at ${input.reportFile} with keys: kind, graphFunctionName, targetAssetType, generatedFile, summary.`,
    `Use kind "${CANONICAL_WORKER_REPORT_KIND}", graphFunctionName "derive_code_surface", and targetAssetType "${CANONICAL_WORKER_REPORT_TARGET_ASSET_TYPE}".`,
    "The generated file should be concrete code or typed pseudocode derived from the data_mapper inputs, not commentary only.",
    "",
    "Manifest:",
    JSON.stringify(manifest, null, 2)
  ].join("\n");
}

function runLiveWorker(input) {
  const outputLastMessage = path.join(input.archiveRoot, "worker_last_message.txt");
  const prompt = promptFor(input);
  writeFileSync(path.join(input.archiveRoot, "worker_prompt.md"), prompt, "utf8");
  writeJson(path.join(input.archiveRoot, "worker_manifest.json"), {
    command: WORKER_COMMAND,
    cwd: input.workspaceRoot,
    outputFile: input.outputFile,
    reportFile: input.reportFile,
    outputLastMessage
  });
  const args =
    WORKER_COMMAND === "codex"
      ? [
          "exec",
          "--skip-git-repo-check",
          "--ephemeral",
          "--sandbox",
          "workspace-write",
          "--cd",
          input.workspaceRoot,
          "--output-last-message",
          outputLastMessage,
          prompt
        ]
      : [prompt];
  const startedAt = performance.now();
  const run = spawnSync(WORKER_COMMAND, args, {
    cwd: input.workspaceRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    timeout: RUNTIME_POLICY.liveHarnessCommandTimeoutMs
  });
  const elapsedMs = performance.now() - startedAt;
  const payload = {
    command: WORKER_COMMAND,
    args,
    cwd: input.workspaceRoot,
    status: run.status,
    signal: run.signal,
    elapsedMs,
    stdout: run.stdout,
    stderr: run.stderr,
    error: run.error?.message ?? null,
    outputLastMessage
  };
  writeJson(path.join(input.archiveRoot, "worker_run.json"), payload);
  writeFileSync(path.join(input.archiveRoot, "worker_stdout.log"), run.stdout, "utf8");
  writeFileSync(path.join(input.archiveRoot, "worker_stderr.log"), run.stderr, "utf8");
  return payload;
}

function admitGeneratedResult(input) {
  assert.equal(existsSync(input.outputFile), true, "live worker did not create output file");
  const content = readFileSync(input.outputFile, "utf8");
  assert(content.trim().length > 0, "live worker output file is empty");
  const digest = sha256(content);
  return admitSdlcConstructorResult({
    operationType: "generate",
    outputIdentity: {
      assetId: "asset://data_mapper/live/code_surface",
      uri: `file://${input.outputFile}`,
      declaredType: "code_surface",
      digest,
      byteCount: Buffer.byteLength(content, "utf8")
    },
    evidenceRefs: [
      {
        ref: `file://${input.outputFile}`,
        evidenceType: "live_fp_worker_generated_asset",
        digest
      }
    ],
    generatedAssetContract: {
      contractName: "live-fp-data-mapper-code-surface-contract",
      targetAssetId: "asset://data_mapper/live/code_surface",
      satisfied: true,
      materialized: true,
      diagnostics: [],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
}

function readGeneratedWorkReport(reportFile, outputFile) {
  assert.equal(existsSync(reportFile), true, "live worker did not create report file");
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  assert(
    ACCEPTED_WORKER_REPORT_KINDS.includes(report.kind),
    `unexpected live worker report kind: ${report.kind}`
  );
  assert.equal(report.graphFunctionName, "derive_code_surface");
  assert(
    ACCEPTED_WORKER_REPORT_TARGET_ASSET_TYPES.includes(report.targetAssetType),
    `unexpected live worker report target asset type: ${report.targetAssetType}`
  );
  assert.equal(report.generatedFile, outputFile);
  assert.equal(typeof report.summary, "string");
  assert(report.summary.trim().length > 0, "live worker report summary is empty");
  return report;
}

test(
  "T-053 live external F_P data_mapper traversal archives worker dispatch and admitted result",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_LIVE_FP=1 not set" },
  async () => {
    const archiveRoot = liveTestArchiveRoot(
      "t053_live_data_mapper",
      archiveTimestamp(),
      process.pid
    );
    const workspaceRoot = path.join(archiveRoot, "live_worker_workspace");
    const outputFile = path.join(workspaceRoot, "generated/code_surface.ts");
    const reportFile = path.join(workspaceRoot, "generated/work_report.json");
    mkdirSync(workspaceRoot, { recursive: true });

    const startedAt = performance.now();
    const sources = readDataMapperSources();
    const installedWorkspace = await provisionAbgInstalledSandbox({
      scenarioId: "t053-live-data-mapper",
      archiveRoot
    });
    assertAbgInstalledSandboxEvidence(installedWorkspace);

    const ingress = deriveIngress(sources);
    const module = constructSdlcGtlModule();
    const queryDomain = projectSdlcQueryDomain({ module, ingressReport: ingress });
    const start = publicStartOnce({
      request: {
        kind: "sdlc_public_start_request",
        workspaceRoot,
        target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
        until: "blocked",
        defaultRegime: "F_P"
      },
      module,
      queryDomain,
      workerAttachment: projectSdlcWorkerAttachment({
        transportContract: `process://${WORKER_COMMAND}`
      })
    });
    assert.equal(start.kind, "sdlc_public_start_projected");
    assert.equal(start.status, "dispatch_required");

    const workerRun = runLiveWorker({
      archiveRoot,
      workspaceRoot,
      outputFile,
      reportFile,
      sources
    });
    assert.equal(workerRun.status, 0, "live worker command failed");
    const workerReport = readGeneratedWorkReport(reportFile, outputFile);

    const contract = hookContractByEdgeName("derive_code_surface");
    const invocation = minimalSdlcHookInvocationForContract({
      contract,
      targetAssetId: "asset://data_mapper/live/code_surface",
      fpWorkerContractRef: `process://${WORKER_COMMAND}`
    });
    const constructorResult = admitGeneratedResult({ outputFile });
    const hookOutcome = runSdlcHookTurn({
      contract,
      invocation,
      constructorResult
    });
    assert.equal(hookOutcome.preflight.status, "passed");
    assert.equal(hookOutcome.postflight?.status, "passed");

    const elapsedMs = performance.now() - startedAt;
    const eventSequence = [
      "abg_installed_workspace",
      "public_start_projected",
      "external_fp_worker_dispatched",
      "worker_result_file_observed",
      "constructor_result_admitted",
      "hook_turn_closed"
    ];
    const archive = {
      kind: "odd_sdlc_t053_live_fp_data_mapper_archive",
      verdict: "passed",
      elapsedMs,
      dataMapperTemplateRoot: DATA_MAPPER_TEMPLATE_ROOT,
      installedWorkspace,
      targetGraphFunction: "bootstrap_release_self_test",
      selectedEdgeGraphFunction: "derive_code_surface",
      worker: {
        command: WORKER_COMMAND,
        status: workerRun.status,
        elapsedMs: workerRun.elapsedMs
      },
      eventSequence,
      ingressSummary: {
        sourceInputs: ingress.sourceInputs.length,
        importedRequirementAuthorities: ingress.importedRequirementAuthorities.length,
        ambiguityRegister: ingress.ambiguityRegister
      },
      startStatus: start.status,
      resultDigest: constructorResult.outputIdentity.digest,
      hookPostflightStatus: hookOutcome.postflight?.status ?? null
    };
    writeJson(path.join(archiveRoot, "run.json"), archive);
    writeJson(path.join(archiveRoot, "worker_report.json"), workerReport);
    writeJson(path.join(archiveRoot, "hook_outcome.json"), hookOutcome);
    writeJson(path.join(archiveRoot, "constructor_result.json"), constructorResult);
    writeFileSync(
      path.join(archiveRoot, "postmortem.md"),
      [
        "# T-053 Live F_P data_mapper Postmortem",
        "",
        `verdict: ${archive.verdict}`,
        `elapsed_ms: ${elapsedMs.toFixed(3)}`,
        `worker_command: ${WORKER_COMMAND}`,
        `worker_status: ${workerRun.status}`,
        `target_graph_function: ${archive.targetGraphFunction}`,
        `event_sequence: ${eventSequence.join(" -> ")}`,
        `result_digest: ${constructorResult.outputIdentity.digest}`,
        ""
      ].join("\n"),
      "utf8"
    );
  }
);
