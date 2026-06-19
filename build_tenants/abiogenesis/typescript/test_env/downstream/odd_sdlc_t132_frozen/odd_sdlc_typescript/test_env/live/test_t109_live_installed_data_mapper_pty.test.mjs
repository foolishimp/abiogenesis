// Validates: T-109
// Validates: T-041
// Validates: T-120
// Validates: B-085
// Validates: live-installed-data-mapper-pty-traversal

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
  installOddSdlcTypescript
} from "../../build/semantic/code/src/index.js";
import { liveTestArchiveRoot } from "./archive_root.mjs";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const LIVE_ENABLED = process.env["ODD_SDLC_TS_T109_DATA_MAPPER_LIVE"] === "1";
const WORKER_TRANSPORT =
  process.env["ODD_SDLC_TS_T109_DATA_MAPPER_WORKER"] ??
  RUNTIME_POLICY.liveHarnessDataMapperWorkerTransport;
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();
const MAX_STEPS = Number.parseInt(
  process.env["ODD_SDLC_TS_T109_DATA_MAPPER_MAX_STEPS"] ?? "56",
  10
);
const COMMAND_TIMEOUT_MS = configuredLiveTimeoutMs(
  "ODD_SDLC_TS_T109_DATA_MAPPER_COMMAND_TIMEOUT_MS",
  RUNTIME_POLICY.liveHarnessCommandTimeoutMs
);

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

const SOURCE_ROOT_FIXED_LEAK_PATHS = [
  ".abiogenesis",
  ".bloop",
  ".genesis",
  ".scala-build",
  "build_tenants/scala_spark",
  "target"
];
const SOURCE_ROOT_EXTERNAL_TOOLING_PATHS = [".metals"];

function sourceRootLeakPaths() {
  const paths = new Set(SOURCE_ROOT_FIXED_LEAK_PATHS);
  if (existsSync(REPO_ROOT)) {
    for (const entry of readdirSync(REPO_ROOT, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("cdme-")) {
        paths.add(entry.name);
      }
    }
  }
  return [...paths].sort();
}

function latestMtimeMs(candidatePath) {
  if (!existsSync(candidatePath)) {
    return null;
  }
  let latest = statSync(candidatePath).mtimeMs;
  const stack = [candidatePath];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      const childStat = statSync(child);
      latest = Math.max(latest, childStat.mtimeMs);
      if (entry.isDirectory()) {
        stack.push(child);
      }
    }
  }
  return latest;
}

function listFilesRecursively(root) {
  if (!existsSync(root)) {
    return [];
  }
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (entry.isFile()) {
        files.push(child);
      }
    }
  }
  return files.sort();
}

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function runtimeRoot(workspace) {
  return path.join(workspace, ".ai-workspace/runtime/odd_sdlc");
}

function runtimeFilesNamed(workspace, fileName) {
  return listFilesRecursively(runtimeRoot(workspace)).filter(
    (candidate) => path.basename(candidate) === fileName
  );
}

function markdownJsonBlocks(filePath) {
  const text = readFileSync(filePath, "utf8");
  const blocks = [];
  const blockPattern = /```(?:json(?:\s+[^\n`]+)?)?\n([\s\S]*?)```/gu;
  for (const match of text.matchAll(blockPattern)) {
    const raw = match[1]?.trim() ?? "";
    if (raw.length === 0) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        blocks.push(parsed);
      }
    } catch {
      // Non-JSON diagnostic fences are valid markdown evidence, not carrier blocks.
    }
  }
  return blocks;
}

function markdownCarrierRecords(workspace, fileName, select) {
  return runtimeFilesNamed(workspace, fileName)
    .flatMap((filePath) =>
      markdownJsonBlocks(filePath)
        .map((record) => select(record))
        .filter((record) => record !== null)
        .map((record) => ({
          filePath,
          mtimeMs: statSync(filePath).mtimeMs,
          record
        }))
    )
    .sort((left, right) => left.mtimeMs - right.mtimeMs || left.filePath.localeCompare(right.filePath));
}

function latestRuntimeRecord(records) {
  return records[records.length - 1] ?? null;
}

function invocationPackages(workspace) {
  return runtimeFilesNamed(workspace, "worker_invocation_package.json").map((filePath) => ({
    filePath,
    mtimeMs: statSync(filePath).mtimeMs,
    package: readJsonFile(filePath)
  }));
}

function workerPrompts(workspace) {
  return runtimeFilesNamed(workspace, "worker_prompt.md").map((filePath) => ({
    filePath,
    text: readFileSync(filePath, "utf8")
  }));
}

function releaseDepthRecords(workspace) {
  return markdownCarrierRecords(workspace, "release_depth_parity_surface.md", (record) => {
    if (
      record.kind === "sdlc_release_depth_parity" ||
      record.targetAssetType === "release_depth_parity_surface" ||
      record.releaseDepthParity !== undefined
    ) {
      return record;
    }
    return null;
  });
}

function componentRepairScheduleRecords(workspace) {
  return markdownCarrierRecords(workspace, "component_repair_schedule_surface.md", (record) => {
    if (record.componentRepairSchedule !== undefined) {
      return record.componentRepairSchedule;
    }
    if (record.kind === "sdlc_component_repair_schedule") {
      return record;
    }
    return null;
  });
}

function testExecutionEvidenceRecords(workspace) {
  return markdownCarrierRecords(workspace, "test_execution_result_surface.md", (record) =>
    record.kind === "sdlc_worker_execution_evidence" ? record : null
  );
}

function isB085RepairPlan(plan) {
  return (
    plan?.kind === "sdlc_component_repair_reentry_plan" &&
    plan.targetEdgeName === "derive_component_test_surface" &&
    plan.targetAssetType === "component_test_surface" &&
    plan.repairTarget === "component_test" &&
    plan.noBroadRegeneration === true &&
    Array.isArray(plan.testRefs) &&
    plan.testRefs.some((ref) => ref.endsWith("DiagnosticsFinalizeSpec.scala")) &&
    /type mismatch/u.test(plan.diagnosticExcerpt ?? "") &&
    /Cannot prove that Int <:< AnyRef/u.test(plan.diagnosticExcerpt ?? "")
  );
}

function rcProofState(workspace) {
  const packages = invocationPackages(workspace);
  const repairPlanPackages = packages.filter((entry) =>
    (entry.package.repairReentryPlans ?? []).some(isB085RepairPlan)
  );
  const consumedRepairPlanPackages = repairPlanPackages.filter(
    (entry) => entry.package.edgeName === "derive_component_test_surface"
  );
  const prompts = workerPrompts(workspace);
  const repairPromptObserved = prompts.some(
    (entry) =>
      /repairReentryPlans is non-empty/u.test(entry.text) &&
      /diagnosticEvidenceRefs/u.test(entry.text)
  );
  const schedules = componentRepairScheduleRecords(workspace);
  const latestSchedule = latestRuntimeRecord(schedules);
  const repairRequiredObserved = schedules.some(
    (entry) =>
      entry.record.scheduleStatus === "repair_required" &&
      Array.isArray(entry.record.repairRows) &&
      entry.record.repairRows.length > 0
  );
  const executionEvidence = testExecutionEvidenceRecords(workspace);
  const cdmeCompilerPassEvidence = executionEvidence.some((entry) => {
    const evidence = entry.record;
    const shardEvidence = Array.isArray(evidence.shardEvidence)
      ? evidence.shardEvidence
      : [];
    return (
      evidence.status === "succeeded" &&
      /sbt\s+"cdme-compiler\/test"/u.test(evidence.command ?? "") &&
      shardEvidence.some(
        (shard) =>
          shard.moduleName === "cdme-compiler" &&
          shard.status === "succeeded" &&
          /sbt\s+"cdme-compiler\/test"/u.test(shard.command ?? "") &&
          Number(shard.passedCount ?? 0) > 0
      )
    );
  });
  const releaseDepth = releaseDepthRecords(workspace);
  const latestReleaseDepth = latestRuntimeRecord(releaseDepth);
  const releaseDepthParityMet =
    latestReleaseDepth?.record?.releaseDepthParity?.status === "met";
  return {
    repairRequiredObserved,
    b085RepairPlanObserved: repairPlanPackages.length > 0,
    b085RepairPlanConsumed: consumedRepairPlanPackages.length > 0,
    repairPromptObserved,
    latestRepairScheduleStatus: latestSchedule?.record?.scheduleStatus ?? null,
    cdmeCompilerPassEvidence,
    releaseDepthParityMet,
    latestReleaseDepthRef:
      latestReleaseDepth === null ? null : path.relative(workspace, latestReleaseDepth.filePath),
    latestRepairScheduleRef:
      latestSchedule === null ? null : path.relative(workspace, latestSchedule.filePath),
    repairPlanPackageRefs: repairPlanPackages.map((entry) =>
      path.relative(workspace, entry.filePath)
    ),
    consumedRepairPlanPackageRefs: consumedRepairPlanPackages.map((entry) =>
      path.relative(workspace, entry.filePath)
    ),
    executionEvidenceRefs: executionEvidence.map((entry) =>
      path.relative(workspace, entry.filePath)
    )
  };
}

function assertTicketedRcProof(workspace, archiveRoot) {
  const proof = rcProofState(workspace);
  writeJson(path.join(archiveRoot, "ticketed_rc_proof_state.json"), proof);
  if (proof.repairRequiredObserved) {
    assert.equal(
      proof.b085RepairPlanObserved,
      true,
      `B-085 repair schedule was observed but no typed repairReentryPlans package was found: ${JSON.stringify(proof, null, 2)}`
    );
    assert.equal(
      proof.b085RepairPlanConsumed,
      true,
      `B-085 repair plan was not consumed by derive_component_test_surface: ${JSON.stringify(proof, null, 2)}`
    );
    assert.equal(
      proof.repairPromptObserved,
      true,
      `B-085 repair prompt did not name repairReentryPlans/diagnosticEvidenceRefs: ${JSON.stringify(proof, null, 2)}`
    );
  }
  assert.notEqual(
    proof.latestRepairScheduleStatus,
    "repair_required",
    `latest component repair schedule remains open: ${JSON.stringify(proof, null, 2)}`
  );
  assert.equal(
    proof.cdmeCompilerPassEvidence,
    true,
    `missing admitted pass evidence for sbt "cdme-compiler/test": ${JSON.stringify(proof, null, 2)}`
  );
  assert.equal(
    proof.releaseDepthParityMet,
    true,
    `releaseDepthParity.status is not met: ${JSON.stringify(proof, null, 2)}`
  );
  return proof;
}

function snapshotSourceRootHygiene() {
  const snapshot = {};
  for (const relativePath of sourceRootLeakPaths()) {
    snapshot[relativePath] = latestMtimeMs(path.join(REPO_ROOT, relativePath));
  }
  return snapshot;
}

function snapshotSourceRootExternalTooling() {
  const snapshot = {};
  for (const relativePath of SOURCE_ROOT_EXTERNAL_TOOLING_PATHS) {
    snapshot[relativePath] = latestMtimeMs(path.join(REPO_ROOT, relativePath));
  }
  return snapshot;
}

function assertSourceRootHygieneUnchanged(baseline, archiveRoot, label) {
  const current = snapshotSourceRootHygiene();
  const offenders = [];
  for (const [relativePath, after] of Object.entries(current)) {
    const before = Object.hasOwn(baseline, relativePath) ? baseline[relativePath] : null;
    if (before === null && after !== null) {
      offenders.push({ relativePath, reason: "created", before, after });
    } else if (before !== null && after !== null && after > before + 1000) {
      offenders.push({ relativePath, reason: "updated", before, after });
    }
  }
  writeJson(path.join(archiveRoot, `${label}.source-root-hygiene.json`), {
    kind: "odd_sdlc_source_root_hygiene_check",
    label,
    repoRoot: REPO_ROOT,
    baseline,
    current,
    externalToolingExceptions: snapshotSourceRootExternalTooling(),
    offenders
  });
  assert.deepEqual(
    offenders,
    [],
    `source-root sandbox leak detected after ${label}: ${JSON.stringify(offenders, null, 2)}`
  );
}

function freshDataMapperWorkspace(archiveRoot) {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing data_mapper template: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  const workspace = path.join(archiveRoot, "workspace");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspace, { recursive: true });
  for (const relativePath of [
    ".ai-workspace/events",
    ".ai-workspace/runtime",
    ".abiogenesis",
    ".genesis",
    ".npm-cache",
    "node_modules"
  ]) {
    rmSync(path.join(workspace, relativePath), { recursive: true, force: true });
  }
  return workspace;
}

function installedOddSdlcCommand(install) {
  const commandPath = install.commandPaths.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  assert(commandPath, "odd-sdlc-ts command path missing");
  return commandPath;
}

function runInstalled(commandPath, args, workspace, archiveRoot, label, sourceRootHygieneBaseline) {
  const run = spawnSync(commandPath, args, {
    cwd: workspace,
    encoding: "utf8",
    env: {
      ...process.env,
      ODD_SDLC_TS_OUTPUT: "json",
      ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
      ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal"
    },
    maxBuffer: 1024 * 1024 * 50,
    timeout: COMMAND_TIMEOUT_MS
  });
  const record = {
    label,
    commandPath,
    args,
    cwd: workspace,
    status: run.status,
    signal: run.signal,
    error: run.error?.message ?? null,
    stdoutBytes: Buffer.byteLength(run.stdout ?? "", "utf8"),
    stderr: run.stderr
  };
  writeJson(path.join(archiveRoot, `${label}.process.json`), record);
  writeFileSync(path.join(archiveRoot, `${label}.stdout.json`), run.stdout ?? "", "utf8");
  writeFileSync(path.join(archiveRoot, `${label}.stderr.log`), run.stderr ?? "", "utf8");
  assertSourceRootHygieneUnchanged(sourceRootHygieneBaseline, archiveRoot, label);
  assert.equal(run.status, 0, run.stderr || JSON.stringify(record, null, 2));
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.kind, "odd_sdlc_spec_method_result");
  assert.equal(parsed.status, "ok", JSON.stringify(parsed, null, 2));
  return parsed.payload;
}

function edgeSummary(payload) {
  return {
    status: payload.status,
    currentEdge: payload.projection?.currentEdge ?? payload.summary?.currentEdge ?? null,
    summaryEdge: payload.summary?.currentEdge ?? null,
    graphFunction: payload.summary?.graphFunctionName ?? null,
    postflight: payload.postflight?.status ?? null,
    assurance: payload.assuranceSatisfaction?.status ?? null,
    blockingReason: payload.summary?.blockingReason ?? payload.blockingReason ?? null,
    archiveRoot: payload.archiveRoot ?? payload.summary?.archiveRoot ?? null
  };
}

test(
  "T-109/T-041 live installed data_mapper traverses through Claude PTY on the production operator path",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_T109_DATA_MAPPER_LIVE=1 not set" },
  async () => {
    const archiveRoot = liveTestArchiveRoot(
      "full_external_data_mapper_sandbox",
      archiveTimestamp(),
      process.pid
    );
    mkdirSync(archiveRoot, { recursive: true });
    const workspace = freshDataMapperWorkspace(archiveRoot);
    const install = await installOddSdlcTypescript({
      targetRoot: workspace,
      packageSourceRoot: PACKAGE_ROOT,
      abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
      installedPackageName: "odd-sdlc-t109-live-data-mapper"
    });
    assert.equal(install.kind, "installed");
    const commandPath = installedOddSdlcCommand(install);
    const sourceRootHygieneBaseline = snapshotSourceRootHygiene();
    const target = "graph_function:bootstrap_release_self_test";
    const requiredEdges = new Set([
      "derive_code_surface",
      "derive_test_design_surface",
      "derive_component_test_surface",
      "derive_test_execution_result_surface",
      "derive_component_repair_schedule_surface",
      "derive_release_depth_parity_surface",
      "derive_test_run_archive_surface"
    ]);
    for (const edge of requiredEdges) {
      assert(
        OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS.includes(edge),
        `required live edge must be in optimized graph catalog: ${edge}`
      );
    }
    const reachedEdges = new Set();
    const steps = [];
    let terminalProof = null;

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const gaps = runInstalled(
        commandPath,
        ["gaps", "--workspace", workspace],
        workspace,
        archiveRoot,
        `step-${String(step).padStart(2, "0")}-gaps`,
        sourceRootHygieneBaseline
      );
      const currentEdge = gaps.projection.currentEdge;
      steps.push({ step, phase: "gaps", ...edgeSummary(gaps) });
      if (currentEdge === null) {
        break;
      }
      if (currentEdge === FG_CONFORM_PROJECT) {
        const induction = runInstalled(
          commandPath,
          ["start", "--workspace", workspace, "--until", "blocked"],
          workspace,
          archiveRoot,
          `step-${String(step).padStart(2, "0")}-induction`,
          sourceRootHygieneBaseline
        );
        steps.push({ step, phase: "induction", ...edgeSummary(induction) });
        assert.equal(induction.status, "converged", JSON.stringify(induction, null, 2));
        continue;
      }
      const start = runInstalled(
        commandPath,
        [
          "start",
          "--workspace",
          workspace,
          "--target",
          target,
          "--until",
          "first_traversal",
          "--worker",
          WORKER_TRANSPORT
        ],
        workspace,
        archiveRoot,
        `step-${String(step).padStart(2, "0")}-start-${currentEdge}`,
        sourceRootHygieneBaseline
      );
      steps.push({ step, phase: "start", requestedEdge: currentEdge, ...edgeSummary(start) });
      writeJson(path.join(archiveRoot, "steps.json"), steps);
      assert(
        start.status === "worker_invoked" || start.status === "converged",
        JSON.stringify(start, null, 2)
      );
      if (start.workerRun !== null) {
        assert.equal(start.workerRun.executorProfile, "pty-terminal");
        assert.equal(start.workerRun.streamModel, "terminal-transcript");
        assert.equal(start.workerRun.outcome.kind, "exited");
        assert.equal(start.workerRun.outcome.status, 0);
      }
      if (start.postflight !== null) {
        assert.equal(start.postflight.status, "passed", JSON.stringify(start, null, 2));
      }
      if (Array.isArray(start.loop?.attempts)) {
        assert(
          start.loop.attempts.every((attempt) =>
            [
              "worker_invoked",
              "postflight_failed",
              "converged",
              "blocked"
            ].includes(attempt.status)
          ),
          JSON.stringify(start.loop, null, 2)
        );
      }
      reachedEdges.add(start.manifest?.edgeName ?? currentEdge);
      const proof = rcProofState(workspace);
      writeJson(path.join(archiveRoot, `step-${String(step).padStart(2, "0")}-proof.json`), proof);
      if (
        proof.cdmeCompilerPassEvidence &&
        proof.releaseDepthParityMet &&
        proof.latestRepairScheduleStatus !== "repair_required"
      ) {
        terminalProof = proof;
        break;
      }
    }

    writeJson(path.join(archiveRoot, "steps.json"), steps);
    writeJson(path.join(archiveRoot, "reached_edges.json"), [...reachedEdges].sort());
    for (const edge of requiredEdges) {
      assert.equal(reachedEdges.has(edge), true, `required live edge not reached: ${edge}`);
    }
    const cdmeCompilerSourceFiles = listFilesRecursively(
      path.join(workspace, "build_tenants/scala_spark/cdme-compiler/src/main/scala")
    ).filter((candidate) => candidate.endsWith(".scala"));
    const cdmeCompilerTestFiles = listFilesRecursively(
      path.join(workspace, "build_tenants/scala_spark/cdme-compiler/src/test/scala")
    ).filter((candidate) => candidate.endsWith(".scala"));
    assert(
      cdmeCompilerSourceFiles.length > 0,
      "expected cdme-compiler Scala source materialization"
    );
    assert(
      cdmeCompilerTestFiles.length > 0,
      "expected cdme-compiler Scala test materialization"
    );
    const proof = terminalProof ?? assertTicketedRcProof(workspace, archiveRoot);
    if (terminalProof !== null) {
      assertTicketedRcProof(workspace, archiveRoot);
    }
    writeJson(path.join(archiveRoot, "run_summary.json"), {
      verdict: "passed",
      workspace,
      reachedEdges: [...reachedEdges].sort(),
      cdmeCompilerSourceFiles: cdmeCompilerSourceFiles.map((candidate) =>
        path.relative(workspace, candidate)
      ),
      cdmeCompilerTestFiles: cdmeCompilerTestFiles.map((candidate) =>
        path.relative(workspace, candidate)
      ),
      ticketedRcProof: proof,
      maxSteps: MAX_STEPS
    });
  }
);
