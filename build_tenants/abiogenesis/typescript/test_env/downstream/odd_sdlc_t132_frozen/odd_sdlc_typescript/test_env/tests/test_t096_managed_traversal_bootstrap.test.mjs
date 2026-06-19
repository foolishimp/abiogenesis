// Validates: REQ-F-ODDSDLC-032
// Validates: T-096

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

function makeUnorderedSourceWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t096-"));
  mkdirSync(path.join(root, "incoming/context"), { recursive: true });
  mkdirSync(path.join(root, "incoming/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });

  writeFileSync(
    path.join(root, "incoming/requirements/source-b.md"),
    [
      "# Late Requirement Notes",
      "",
      "REQ-ENG-096: The inducted project must preserve engineering execution constraints."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "incoming/context/source-a.md"),
    [
      "# Product Notes",
      "",
      "This workspace starts as an unordered source set.",
      "REQ-BOOT-096: Bootstrap must produce intent, product, and requirement-family surfaces."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "README.md"),
    "# Unordered Bootstrap Fixture\n\nLoose notes only; no constitutional surfaces exist yet.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: managed_bootstrap_fixture",
      "  kind: data-pipeline",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - bootstrap-core"
    ].join("\n"),
    "utf8"
  );
  return root;
}

test("T-096 proves Fg_conform_project as managed traversal from unordered source set to runtime bootstrap read model", async () => {
  const workspace = makeUnorderedSourceWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t096"
  });
  assert.equal(install.kind, "installed");

  const firstGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(firstGaps.status, "ok");
  assert.equal(firstGaps.payload.start.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
  assert.equal(firstGaps.payload.projection.currentEdge, FG_CONFORM_PROJECT);

  const induction = await invokeOddSdlcSpecMethodCommand(["start", "--workspace", workspace]);
  assert.equal(induction.status, "ok");
  assert.equal(induction.payload.summary.graphFunctionName, FG_CONFORM_PROJECT);
  assert.equal(induction.payload.status, "converged");
  assert.deepStrictEqual(induction.payload.emittedRuntimeEventKinds, [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "payload_observed",
    "payload_validated",
    "fd_authority_outcome_admitted",
    "vector_evaluated",
    "vector_closed",
    "fd_advance_ready",
    "payload_observed",
    "payload_validated"
  ]);

  for (const relativePath of [
    ".ai-workspace/context/project_bootstrap.md",
    ".ai-workspace/context/project_constraints.yml",
    "build_tenants/TENANT_REGISTRY.md"
  ]) {
    assert.equal(existsSync(path.join(workspace, relativePath)), true, relativePath);
  }

  for (const relativePath of [
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/requirements/00-imported-sources.md",
    "specification/requirements/01-eng-requirements.md"
  ]) {
    assert.equal(
      existsSync(path.join(workspace, relativePath)),
      false,
      `${relativePath} must be graph-traversal output, not conformance output`
    );
  }

  const bootstrap = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );
  assert.match(bootstrap, /deterministic read model over imported project authority/u);
  assert.match(bootstrap, /It is not a replacement for project-owned specification truth/u);
  assert.match(bootstrap, /incoming\/context\/source-a\.md/u);
  assert.match(bootstrap, /incoming\/requirements\/source-b\.md/u);

  const report = JSON.parse(
    readFileSync(path.join(induction.payload.archiveRoot, "conform_project_report.json"), "utf8")
  );
  assert.equal(report.status, "passed");
  assert.deepStrictEqual(report.conformanceGaps, []);
  assert(report.sourceRefs.some((ref) => ref.endsWith("incoming/context/source-a.md")));
  assert(report.sourceRefs.some((ref) => ref.endsWith("incoming/requirements/source-b.md")));
  assert(report.materializedTopologyRefs.some((ref) => ref.endsWith(".ai-workspace/context/project_bootstrap.md")));
  assert(report.materializedTopologyRefs.some((ref) => ref.endsWith(".ai-workspace/context/project_constraints.yml")));
  assert(report.materializedTopologyRefs.some((ref) => ref.endsWith("build_tenants/TENANT_REGISTRY.md")));
  assert.equal(report.materializedTopologyRefs.some((ref) => ref.includes("specification/")), false);

  const secondGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(secondGaps.status, "ok");
  assert.equal(
    secondGaps.payload.start.executionContract.targetGraphFunction,
    "derive_intent_surface"
  );
  assert.equal(secondGaps.payload.projection.currentEdge, "derive_intent_surface");
});
