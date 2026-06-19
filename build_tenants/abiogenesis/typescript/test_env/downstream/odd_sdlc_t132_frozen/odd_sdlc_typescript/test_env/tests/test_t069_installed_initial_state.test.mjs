// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-053
// Validates: REQ-F-ODDSDLC-056
// Validates: T-069

import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  deriveSdlcInstalledQualificationInitialState,
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand,
  writeSdlcInstalledQualificationInitialStateArchive
} from "../../build/semantic/code/src/index.js";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function freshDataMapperWorkspace() {
  assert.equal(
    existsSync(DATA_MAPPER_TEMPLATE_ROOT),
    true,
    `missing data_mapper template: ${DATA_MAPPER_TEMPLATE_ROOT}`
  );
  const parentRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t069-"));
  const workspaceRoot = path.join(parentRoot, "data_mapper.test69.ts");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspaceRoot, { recursive: true });
  return workspaceRoot;
}

test("T-069 validates installed data_mapper initial state before traversal", async () => {
  const workspaceRoot = freshDataMapperWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspaceRoot,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t069"
  });
  assert.equal(install.kind, "installed");

  const validation = deriveSdlcInstalledQualificationInitialState({
    workspaceRoot
  });
  const archive = writeSdlcInstalledQualificationInitialStateArchive({
    archiveRoot: path.join(
      workspaceRoot,
      ".ai-workspace/runtime/odd_sdlc/t069_initial_state"
    ),
    validation
  });

  assert.equal(validation.validationPhase, "before_graph_traversal");
  assert.equal(validation.status, "valid");
  assert.deepStrictEqual(validation.missingPaths, []);
  assert.deepStrictEqual(validation.missingCommands, []);
  assert.equal(validation.conformedProject.projectSlug, "data_mapper");
  assert.equal(validation.conformedProject.activeTenant, "scala_spark");
  assert.equal(
    validation.conformedProject.selectedOutputRoot,
    "build_tenants/scala_spark"
  );
  assert.equal(validation.conformedProject.buildExecutionContract, "undeclared");
  assert.equal(validation.conformedProject.testExecutionContract, "sbt test");
  assert(validation.oddSdlcRuntimeRef);
  assert(validation.abgRuntimeRef);
  assert.equal(existsSync(archive.validationPath), true);
  assert.equal(existsSync(archive.conformedProjectPath), true);
  assert.equal(readJson(archive.validationPath).status, "valid");
  assert.equal(
    readJson(archive.conformedProjectPath).selectedOutputRoot,
    "build_tenants/scala_spark"
  );

  const eventLog = path.join(workspaceRoot, ".ai-workspace/events/events.jsonl");
  assert.equal(existsSync(eventLog), true);
  const eventLines = readFileSync(eventLog, "utf8").trim().split(/\r?\n/u);
  assert.equal(eventLines.length, 1);
  assert.equal(JSON.parse(eventLines[0]).kind, "workspace_installation_admitted");
});

test("T-069 initial-state validation fails closed without installed topology", () => {
  const workspaceRoot = freshDataMapperWorkspace();
  const validation = deriveSdlcInstalledQualificationInitialState({
    workspaceRoot
  });

  assert.equal(validation.validationPhase, "before_graph_traversal");
  assert.equal(validation.status, "invalid");
  assert(validation.missingPaths.length > 0);
  assert.deepStrictEqual(validation.missingCommands, [
    "odd-sdlc-ts",
    "abiogenesis-ts",
    "genesis-ts"
  ]);
});

test("T-069 CLI worker start blocks before graph execution when install topology is absent", async () => {
  const workspaceRoot = freshDataMapperWorkspace();
  const started = await invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    workspaceRoot,
    "--target",
    "graph_function:bootstrap_release_self_test",
    "--until",
    "blocked",
    "--worker",
    "process://node"
  ]);

  assert.equal(started.status, "ok");
  assert.equal(started.payload.status, "blocked");
  assert.equal(started.payload.summary.blockingReason, "installed_topology_invalid");
  assert.equal(started.payload.replayEventCountAfter, 0);
  assert.equal(
    existsSync(path.join(started.payload.archiveRoot, "initial_state_validation.json")),
    true
  );
});
