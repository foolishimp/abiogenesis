// Validates: REQ-F-ODDSDLC-032
// Validates: T-087

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

function makeUnderstructuredWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t087-"));
  mkdirSync(path.join(root, "specification/appendices"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# Data Mapper", "", "Build a Scala Spark data mapper from imported docs."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    [
      "# Intent",
      "",
      "**Project**: data_mapper",
      "",
      "INT-001: Produce a governed mapper from the source documents."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    [
      "# Requirements",
      "",
      "REQ-LDM-001: Preserve lineage between source and target mappings.",
      "REQ-ENG-007: Provide runnable test evidence."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/appendices/APPENDIX_A.md"),
    "# Appendix\n\nAdditional non-canonical project context.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: data_mapper",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - mapping-core",
      "      - lineage"
    ].join("\n"),
    "utf8"
  );
  return root;
}

test("T-087 routes understructured installed workspace through Fg_conform_project before downstream traversal", async () => {
  const workspace = makeUnderstructuredWorkspace();
  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t087"
  });
  assert.equal(install.kind, "installed");

  const firstGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(firstGaps.status, "ok");
  assert.equal(firstGaps.payload.start.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
  assert.equal(firstGaps.payload.projection.currentEdge, FG_CONFORM_PROJECT);
  assert.equal(firstGaps.payload.start.executionContract.basis.resolvedPolicy.defaultRegime, "F_D");
  assert.equal(firstGaps.payload.start.executionContract.workerAttachment.status, "unattached");

  const induction = await invokeOddSdlcSpecMethodCommand(["start", "--workspace", workspace]);
  assert.equal(induction.status, "ok");
  assert.equal(induction.payload.kind, "sdlc_installed_operator_start_outcome");
  assert.equal(induction.payload.summary.graphFunctionName, FG_CONFORM_PROJECT);
  assert.equal(induction.payload.summary.currentEdge, FG_CONFORM_PROJECT);
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
    "specification/INTENT.md",
    "specification/REQUIREMENTS.md",
    ".ai-workspace/context/project_bootstrap.md",
    ".ai-workspace/context/project_constraints.yml",
    "build_tenants/TENANT_REGISTRY.md"
  ]) {
    assert.equal(existsSync(path.join(workspace, relativePath)), true, relativePath);
  }
  for (const relativePath of [
    "specification/PRODUCT.md",
    "specification/GOALS.md",
    "specification/requirements/00-imported-sources.md",
    "specification/requirements/02-ldm-requirements.md"
  ]) {
    assert.equal(
      existsSync(path.join(workspace, relativePath)),
      false,
      `${relativePath} must be produced by graph traversal, not Fg_conform_project`
    );
  }
  const report = JSON.parse(
    readFileSync(path.join(induction.payload.archiveRoot, "conform_project_report.json"), "utf8")
  );
  assert.equal(report.status, "passed");
  assert.deepStrictEqual(report.conformanceGaps, []);
  assert.equal(report.materializedTopologyRefs.some((ref) => ref.includes("specification/requirements/")), false);
  assert(
    report.sourceRefs.some((ref) =>
      ref.endsWith("specification/REQUIREMENTS.md")
    )
  );
  const bootstrap = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );
  assert.match(bootstrap, /deterministic read model over imported project authority/u);
  assert.match(bootstrap, /## Source Titles/u);
  assert.match(bootstrap, /## Read Order/u);
  assert.doesNotMatch(bootstrap, /governing_graph_function: Fg_conform_project/u);
  assert.doesNotMatch(
    bootstrap,
    /\.ai-workspace\/runtime\/odd_sdlc\/operator-runs/u,
    "project bootstrap must not tell F_P workers to mine runtime operator archives"
  );
  assert.doesNotMatch(
    bootstrap,
    /odd-sdlc-ts (?:gaps|start)/u,
    "project bootstrap must not publish installed runtime control commands as project authority"
  );

  const secondGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(secondGaps.status, "ok", JSON.stringify(secondGaps.payload));
  assert.equal(
    secondGaps.payload.start.executionContract.targetGraphFunction,
    "derive_intent_surface"
  );
  assert.equal(secondGaps.payload.projection.currentEdge, "derive_intent_surface");
});
