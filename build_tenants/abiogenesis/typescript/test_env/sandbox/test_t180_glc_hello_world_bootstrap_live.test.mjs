// Validates: T-180
// Validates: T-182
// Validates: T-183
// Validates: T-184
// Validates: T-177
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-NODE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  symlink,
  writeFile
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeBindingSource } from "./support/glc-binding-source.mjs";

import {
  installAbiogenesisTypescript
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  createReleaseSnapshotBundle
} from "../../build/semantic/code/src/qualification/m05/index.js";

const SANDBOX_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(SANDBOX_DIR, "..");
const TENANT_ROOT = path.resolve(SANDBOX_DIR, "..", "..");
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, "..");
const STANDARDS_ROOT = path.join(
  WORKSPACE_ROOT,
  "specification_methodology",
  "specification",
  "standards"
);
const DOCS_ROOT = path.join(REPO_ROOT, "docs");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "canonical_hello_world_full_stack_live"
);

function liveEnabled() {
  return process.env["ABG_TS_HELLO_WORLD_FULL_STACK_LIVE"] === "1" ||
    process.env["ABG_TS_T184_CANONICAL_HELLO_WORLD_LIVE"] === "1" ||
    process.env["ABG_TS_T182_CAUSAL_CARRY_LIVE"] === "1" ||
    process.env["ABG_TS_T180_GLC_BOOTSTRAP_LIVE"] === "1" ||
    process.env["ABG_TS_T183_INSTRUCTION_ASSEMBLY_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? TENANT_ROOT,
    encoding: "utf8",
    env: options.env ?? process.env
  });
  if (result.status !== 0) {
    throw new Error(
      `${options.label ?? command} failed with ${result.status ?? "null"}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
  return result;
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: TENANT_ROOT,
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function extractSnapshotPackage(input) {
  const extractRoot = path.join(input.runRoot, "snapshot-extract");
  await mkdir(extractRoot, { recursive: true });
  run("tar", ["-xzf", input.tarballPath, "-C", extractRoot], {
    cwd: input.runRoot,
    label: "extract release snapshot tarball"
  });
  await symlink(
    path.join(TENANT_ROOT, "node_modules"),
    path.join(extractRoot, "node_modules"),
    "dir"
  );
  return path.join(extractRoot, "package");
}

async function writeGlcRuntimeBinding(input) {
  const { workspaceRoot, ...sourceOptions } = input;
  const runtimeBindingPath = path.join(
    workspaceRoot,
    ".abiogenesis",
    "typescript-runtime.mjs"
  );
  await writeText(runtimeBindingPath, runtimeBindingSource(sourceOptions));
  return runtimeBindingPath;
}

function parseJsonLines(text) {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

test("T-180 GLC Hello World live bootstrap runs from a snapshot-installed sandbox instance", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_HELLO_WORLD_FULL_STACK_LIVE=1 or CODEX_LIVE_FP=1 to run the canonical Hello World live proof");
    return;
  }

  const packageJson = await readJson(path.join(TENANT_ROOT, "package.json"));
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const workspaceRoot = path.join(runRoot, "instance");
  const toolchainRoot = path.join(runRoot, "toolchain");
  const snapshotRoot = path.join(runRoot, "snapshot", packageJson.version);
  const releaseNotePath = path.join(runRoot, "release-note.md");
  await mkdir(runRoot, { recursive: true });
  await writeText(
    releaseNotePath,
    [
      "# T-180 GLC Hello World Bootstrap Snapshot",
      "",
      "Per-run dirty-source proof snapshot for installed sandbox validation.",
      ""
    ].join("\n")
  );

  const sourceCommit = gitOutput(["rev-parse", "HEAD"]) || "unknown";
  const sourceDirty = gitOutput(["status", "--porcelain", "--untracked-files=normal"]).length > 0;
  const snapshot = await createReleaseSnapshotBundle({
    releaseIdentity: packageJson.version,
    packageSourceRoot: TENANT_ROOT,
    snapshotRoot,
    sourceRef: "t180-glc-bootstrap-live-local",
    sourceCommit,
    sourceDirty,
    allowDirtySource: true,
    rcBranch: "t180/glc-bootstrap-live",
    releaseNotePath,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
    runBuild: false,
    npmCacheRoot: path.join(runRoot, ".npm-cache"),
    createdAt: new Date().toISOString()
  });
  assert.equal(snapshot.kind, "created");
  assert.equal(snapshot.manifest.package.packageName, packageJson.name);
  assert.equal(snapshot.manifest.package.packageVersion, packageJson.version);

  const snapshotPackageRoot = await extractSnapshotPackage({
    runRoot,
    tarballPath: snapshot.manifest.tarball.path
  });
  const install = await installAbiogenesisTypescript({
    targetRoot: { rootPath: workspaceRoot },
    packageSourceRoot: snapshotPackageRoot,
    standardsSourceRoot: STANDARDS_ROOT,
    docsSourceRoot: DOCS_ROOT,
    installedPackageName: packageJson.name,
    toolchainRoot
  });
  assert.equal(install.kind, "installed");
  assert.equal(install.packageName, packageJson.name);
  assert.equal(install.packageVersion, packageJson.version);
  assert.equal(install.packageSourceRoot, snapshotPackageRoot);

  const runtimeBindingPath = await writeGlcRuntimeBinding({
    workspaceRoot,
    packageRoot: install.packageRoot,
    packageVersion: packageJson.version
  });

  const genesisCommand = install.commandPaths.find((commandPath) =>
    path.basename(commandPath) === "genesis-ts"
  );
  assert.equal(typeof genesisCommand, "string");
  const startedAt = Date.now();
  const start = run(
    genesisCommand,
    [
      "start",
      "--workspace",
      workspaceRoot,
      "--scope",
      "workspace",
      "--target",
      "next",
      "--until",
      "converged"
    ],
    {
      cwd: workspaceRoot,
      label: "installed genesis-ts start",
      env: {
        ...process.env,
        CODEX_LIVE_FP: "1",
        ABG_TS_HELLO_WORLD_FULL_STACK_LIVE: "1",
        ABG_TS_LIVE_AGENT: process.env["ABG_TS_LIVE_AGENT"] ?? "claude",
        ABG_TS_LIVE_TIMEOUT_MS: process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000"
      }
    }
  );
  const durationMs = Date.now() - startedAt;
  const startOutput = JSON.parse(start.stdout.trim());
  assert.equal(startOutput.command, "start");
  assert.equal(startOutput.stopped_by, "converged");
  assert.equal(startOutput.resolved_target.includes("odd_glc"), true);
  assert.equal(startOutput.event_kinds.includes("graph_function_selected"), true);
  assert.equal(startOutput.event_kinds.includes("graph_call_opened"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_prompt_manifest_projected"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_response_contract_admitted"), true);

  const events = parseJsonLines(await readFile(startOutput.events_path, "utf8"));
  const registryEvents = events.filter((event) =>
    event.kind === "registry_entry_admitted"
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "node_type").length,
    5
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "graph_function").length,
    1
  );
  const selections = events.filter((event) =>
    event.kind === "graph_function_selected"
  );
  assert.equal(selections.length, 2);
  assert.equal(
    selections.every((event) => event.selectedEntryKind === "graph_function"),
    true
  );
  assert.equal(
    selections.every((event) => event.selectedGraphFunctionRef === startOutput.graph_function_id),
    true
  );
  assert.equal(
    events.some((event) =>
      event.kind === "graph_function_selected" &&
      event.selectedEntryKind === "node_type"
    ),
    false
  );
  const firstSelectionIndex = events.findIndex((event) =>
    event.kind === "graph_function_selected"
  );
  const firstGraphCallIndex = events.findIndex((event) =>
    event.kind === "graph_call_opened"
  );
  assert.ok(firstSelectionIndex >= 0);
  assert.ok(firstGraphCallIndex > firstSelectionIndex);
  const promptManifestEvents = events.filter((event) =>
    event.kind === "instruction_prompt_manifest_projected"
  );
  const responseAdmissionEvents = events.filter((event) =>
    event.kind === "instruction_response_contract_admitted"
  );
  const actorArtifactEvents = events.filter((event) =>
    event.kind === "actor_result_artifact_observed"
  );
  // transform + evaluate stage manifests per vector (T-189 all-arms binding)
  assert.equal(promptManifestEvents.length, 4);
  assert.equal(responseAdmissionEvents.length, 2);
  assert.equal(actorArtifactEvents.length, 2);
  for (const responseEvent of responseAdmissionEvents) {
    const manifestIndex = events.findIndex((event) =>
      event.kind === "instruction_prompt_manifest_projected" &&
      event.manifestRef === responseEvent.manifestRef
    );
    const responseIndex = events.findIndex((event) => event === responseEvent);
    assert.ok(manifestIndex >= 0);
    assert.ok(responseIndex > manifestIndex);
    assert.equal(responseEvent.outputContractRefs.length, 1);
  }
  const causalEvents = events.filter((event) =>
    event.kind === "instruction_causal_context_bound"
  );
  const secondVectorCausalEvent = causalEvents.find((event) =>
    event.vectorIndex === 1
  );
  assert.ok(secondVectorCausalEvent);
  assert.equal(secondVectorCausalEvent.status, "bound");
  assert.deepEqual(secondVectorCausalEvent.contentModes, ["excerpt"]);
  assert.equal(secondVectorCausalEvent.payloadRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.payloadDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentExcerpts.length > 0, true);
  assert.match(secondVectorCausalEvent.contentExcerpts[0], /Hello, world!/u);
  assert.deepEqual(secondVectorCausalEvent.missingInputRefs, []);
  assert.equal(
    secondVectorCausalEvent.requiredInputRefs.some((ref) =>
      ref.includes("asset_kind=glc_lifecycle_artifact")
    ),
    true
  );

  const programSource = await readFile(
    path.join(workspaceRoot, "generated", "hello-world.mjs"),
    "utf8"
  );
  assert.equal(programSource.includes("Hello, world!"), true);
  const liveRoot = path.join(workspaceRoot, ".ai-workspace", "glc-hello-world-live");
  const firstArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-0-artifact.json")
  );
  const secondArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-1-artifact.json")
  );
  assert.equal(firstArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(secondArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(firstArtifact.transport.status, 0);
  assert.equal(secondArtifact.transport.status, 0);
  assert.equal(firstArtifact.causalCarry.instructionCausalStatus, "empty");
  assert.equal(secondArtifact.causalCarry.instructionCausalStatus, "bound");
  assert.equal(
    secondArtifact.causalCarry.causalInputContentExcerpts.length > 0,
    true
  );
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondArtifact.assessment.causalInputPayloadRefsSeen
  );
  assert.equal(
    secondArtifact.causalCarry.causalInputContentDigests[0],
    secondArtifact.assessment.causalInputContentDigestSeen
  );
  assert.match(secondArtifact.assessment.causalInputContentSummary, /Hello, world/u);
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondVectorCausalEvent.payloadRefs
  );

  const eventCounts = events.reduce((accumulator, event) => {
    accumulator[event.kind] = (accumulator[event.kind] ?? 0) + 1;
    return accumulator;
  }, {});
  const proof = {
    kind: "canonical_hello_world_full_stack_live_proof",
    sourceCommit,
    sourceDirty,
    durationMs,
    installedPackage: {
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      packageRoot: install.packageRoot
    },
    snapshotRoot,
    snapshotTarball: snapshot.manifest.tarball.path,
    snapshotTarballSha256: snapshot.manifest.tarball.sha256,
    workspaceRoot,
    toolchainRoot,
    installedPackageRoot: install.packageRoot,
    runtimeBindingPath,
    genesisCommand,
    startOutput,
    eventDigest: sha256Text(JSON.stringify(events)),
    eventCounts,
    promptManifestCount: promptManifestEvents.length,
    responseAdmissionCount: responseAdmissionEvents.length,
    actorResultArtifactCount: actorArtifactEvents.length,
    registryAdmissionCount: registryEvents.length,
    graphFunctionSelectionCount: selections.length,
    causalCarry: {
      contextRef: secondVectorCausalEvent.contextRef,
      payloadRefs: secondVectorCausalEvent.payloadRefs,
      payloadDigests: secondVectorCausalEvent.payloadDigests,
      contentRefs: secondVectorCausalEvent.contentRefs,
      contentDigests: secondVectorCausalEvent.contentDigests,
      requiredInputRefs: secondVectorCausalEvent.requiredInputRefs
    },
    liveArtifacts: [
      firstArtifact.transport.outputPath,
      secondArtifact.transport.outputPath
    ],
    executionStdout: secondArtifact.execution.stdout
  };
  await writeText(
    path.join(runRoot, "canonical-hello-world-full-stack-live-proof.json"),
    `${JSON.stringify(proof, null, 2)}\n`
  );
});
