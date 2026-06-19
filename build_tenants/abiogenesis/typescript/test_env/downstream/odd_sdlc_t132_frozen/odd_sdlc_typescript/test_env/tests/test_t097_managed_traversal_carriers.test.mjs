// Validates: REQ-F-ODDSDLC-032
// Validates: T-097

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  deriveConformProjectManagedTraversalManifest,
  FG_CONFORM_PROJECT,
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t097-"));
  mkdirSync(path.join(root, "incoming/notes"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "incoming/notes/source.md"),
    [
      "# Bootstrap Notes",
      "",
      "REQ-MANAGED-097: Bootstrap must expose manifest and ledger carriers."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: managed_traversal_carrier_fixture",
      "active_tenant: typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: typescript",
      "    build_tool: npm",
      "    module_structure:",
      "      - bootstrap"
    ].join("\n"),
    "utf8"
  );
  return root;
}

test("T-097 archives bootstrap manifest without legacy managed traversal ledger", async () => {
  const workspace = makeWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t097"
  });
  assert.equal(install.kind, "installed");

  const manifestBefore = deriveConformProjectManagedTraversalManifest({
    workspaceRoot: workspace
  });
  assert.equal(manifestBefore.kind, "sdlc_managed_traversal_manifest");
  assert.equal(manifestBefore.graphFunctionName, FG_CONFORM_PROJECT);
  assert.equal(manifestBefore.sourceType, "unordered_source_set");
  assert.equal(manifestBefore.targetType, "constitutional_bootstrap");
  assert.deepStrictEqual(
    manifestBefore.phaseContracts.map((contract) => contract.phase),
    ["prestep", "execute", "postprocess"]
  );

  const induction = await invokeOddSdlcSpecMethodCommand(["start", "--workspace", workspace]);
  assert.equal(induction.status, "ok");
  assert.equal(induction.payload.status, "converged");
  assert.equal(induction.payload.summary.graphFunctionName, FG_CONFORM_PROJECT);

  const manifestPath = path.join(
    induction.payload.archiveRoot,
    "managed_traversal_manifest.json"
  );
  assert.equal(existsSync(manifestPath), true);
  assert.equal(
    existsSync(path.join(induction.payload.archiveRoot, "managed_traversal_ledger.json")),
    false
  );

  const archivedManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(archivedManifest.kind, "sdlc_managed_traversal_manifest");
  assert.equal(archivedManifest.graphFunctionName, FG_CONFORM_PROJECT);
  assert.deepStrictEqual(archivedManifest.expectedOutputRelativePaths, [
    ".ai-workspace/context/project_bootstrap.md",
    ".ai-workspace/context/project_constraints.yml",
    "build_tenants/TENANT_REGISTRY.md"
  ]);
  assert(
    archivedManifest.sourceRefs.some((ref) =>
      ref.endsWith("incoming/notes/source.md")
    )
  );
});
