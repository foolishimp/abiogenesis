// Validates: T-087
// Validates: T-091
// Validates: T-096

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  FG_CONFORM_PROJECT,
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand,
  normalizeSdlcRequirementDisplayId
} from "../../build/semantic/code/src/index.js";
import {
  copyInternalDataMapperFixture,
  INTERNAL_DATA_MAPPER_FIXTURE_ROOT,
  INTERNAL_DATA_MAPPER_SOURCE_FILES,
  internalDataMapperSourceSnapshot
} from "../fixtures/internal_data_mapper_fixture.mjs";
import {
  assertAbgInstalledSandboxEvidence,
  provisionAbgInstalledSandbox
} from "./abg_installed_workspace.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const RUN_ROOT = resolve(
  PACKAGE_ROOT,
  "test_env/test_runs/t087_t091_t096_internal_data_mapper_induction"
);

function runId() {
  return `${new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")}_pid${process.pid}`;
}

function markdownFilesUnder(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .sort()
    .flatMap((entry) => {
      const absolutePath = path.join(root, entry);
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        return markdownFilesUnder(absolutePath);
      }
      return stat.isFile() && /\.(?:md|markdown)$/iu.test(entry)
        ? [absolutePath]
        : [];
    });
}

function requirementIdsFromMarkdownFiles(files) {
  return [
    ...new Set(
      files.flatMap((file) => {
        const content = readFileSync(file, "utf8");
        return [...content.matchAll(/\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/gmu)]
          .map((match) => normalizeSdlcRequirementDisplayId(match[0]));
      })
    )
  ].sort();
}

function requirementIds(workspaceRoot) {
  return requirementIdsFromMarkdownFiles(
    markdownFilesUnder(path.join(workspaceRoot, "specification"))
  );
}

function requirementIdsFromSourceRefs(sourceRefs) {
  return requirementIdsFromMarkdownFiles(
    sourceRefs.flatMap((ref) => {
      if (!ref.startsWith("file://")) return [];
      const filePath = fileURLToPath(ref);
      return existsSync(filePath) && /\.(?:md|markdown)$/iu.test(filePath)
        ? [filePath]
        : [];
    })
  );
}

test("T-087/T-091/T-096 internal data_mapper fixture is local-only and current-shaped", () => {
  assert.equal(INTERNAL_DATA_MAPPER_FIXTURE_ROOT.startsWith(PACKAGE_ROOT), true);

  for (const relativePath of INTERNAL_DATA_MAPPER_SOURCE_FILES) {
    assert.equal(
      existsSync(path.join(INTERNAL_DATA_MAPPER_FIXTURE_ROOT, relativePath)),
      true,
      relativePath
    );
  }

  const constraintText = readFileSync(
    path.join(INTERNAL_DATA_MAPPER_FIXTURE_ROOT, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(constraintText, /design_tenants:/u);
  assert.match(constraintText, /output_dir: "build_tenants\/scala_spark\/"/u);
  assert.match(constraintText, /selected_output_root: "build_tenants\/scala_spark"/u);
});

test("T-087/T-091/T-096 live sandbox inducts internal data_mapper before downstream traversal", async () => {
  mkdirSync(RUN_ROOT, { recursive: true });
  const runRoot = path.join(RUN_ROOT, runId());
  const workspace = path.join(runRoot, "workspace");
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot: runRoot,
    scenarioId: "t087-t091-t096-internal-data-mapper-induction"
  });
  assertAbgInstalledSandboxEvidence(installedWorkspace);
  copyInternalDataMapperFixture(workspace);

  const preProfile = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  assert.equal(preProfile.activeTenant, "scala_spark");
  assert.equal(preProfile.selectedOutputRoot, "build_tenants/scala_spark");
  assert.equal(preProfile.declaredOutputRoot, "build_tenants/scala_spark");

  const sourceInputs = INTERNAL_DATA_MAPPER_SOURCE_FILES.map((relativePath) =>
    deriveSdlcSourceInput(internalDataMapperSourceSnapshot(relativePath))
  );
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(workspace).href,
    projectConstraints: deriveSdlcProjectConstraintsFromWorkspace(workspace),
    sourceInputs
  });
  assert(ingressReport.importedRequirementAuthorities.length > 80);
  assert(
    ingressReport.importedRequirementAuthorities.some(
      (authority) => authority.requirementId === "REQ-LDM-001"
    )
  );
  assert(
    ingressReport.importedRequirementAuthorities.some(
      (authority) => authority.requirementId === "REQ-COV-008"
    )
  );

  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-internal-data-mapper-induction"
  });
  assert.equal(install.kind, "installed");

  const firstGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(firstGaps.status, "ok");
  assert.equal(firstGaps.payload.start.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
  assert.equal(firstGaps.payload.projection.currentEdge, FG_CONFORM_PROJECT);

  const induction = await invokeOddSdlcSpecMethodCommand(["start", "--workspace", workspace]);
  assert.equal(induction.status, "ok");
  assert.equal(induction.payload.summary.graphFunctionName, FG_CONFORM_PROJECT);
  assert.equal(induction.payload.summary.currentEdge, FG_CONFORM_PROJECT);
  assert.equal(induction.payload.status, "converged");
  assert.deepStrictEqual(induction.payload.emittedRuntimeEventKinds, [
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed"
  ]);

  const reportPath = path.join(induction.payload.archiveRoot, "conform_project_report.json");
  assert.equal(existsSync(reportPath), true);
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  assert.equal(report.status, "passed");
  assert.deepStrictEqual(report.conformanceGaps, []);
  assert.equal(report.profile.activeTenant, "scala_spark");
  assert.equal(report.profile.selectedOutputRoot, "build_tenants/scala_spark");
  assert.equal(report.profile.declaredOutputRoot, "build_tenants/scala_spark");
  assert(report.sourceRefs.length >= INTERNAL_DATA_MAPPER_SOURCE_FILES.length);
  assert(report.sourceRefs.some((ref) => ref.endsWith("specification/mapper_requirements.md")));
  assert(
    report.sourceRefs.some((ref) =>
      ref.endsWith("specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md")
    )
  );

  const canonicalConstraints = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(canonicalConstraints, /selected_output_root: build_tenants\/scala_spark/u);
  assert.match(canonicalConstraints, /output_dir: build_tenants\/scala_spark/u);
  assert.equal(canonicalConstraints.includes("imp_scala_spark"), false);

  const normalizedSourceIds = requirementIdsFromSourceRefs(report.sourceRefs);
  assert(normalizedSourceIds.includes("REQ-LDM-001"));
  assert(normalizedSourceIds.includes("REQ-COV-008"));
  assert.equal(
    existsSync(path.join(workspace, "specification/requirements/00-imported-sources.md")),
    true
  );
  const bootstrapReadModel = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );
  assert.match(bootstrapReadModel, /specification\/REQUIREMENTS\.md/u);
  assert.match(bootstrapReadModel, /specification\/mapper_requirements\.md/u);
  assert.match(bootstrapReadModel, /REQ-LDM-01/u);

  const secondGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
  assert.equal(secondGaps.status, "ok");
  assert.notEqual(
    secondGaps.payload.start.executionContract.targetGraphFunction,
    FG_CONFORM_PROJECT
  );
});

test("T-087/T-091/T-096 induction can write a separate output workspace for comparison", async () => {
  mkdirSync(RUN_ROOT, { recursive: true });
  const runRoot = path.join(RUN_ROOT, `${runId()}_cross_workspace`);
  const inputWorkspace = path.join(runRoot, "input_workspace");
  const outputWorkspace = path.join(runRoot, "output_workspace");
  const controlWorkspace = path.join(runRoot, "control_same_workspace");
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot: runRoot,
    scenarioId: "t087-t091-t096-cross-workspace-induction"
  });
  assertAbgInstalledSandboxEvidence(installedWorkspace);
  copyInternalDataMapperFixture(inputWorkspace);
  copyInternalDataMapperFixture(controlWorkspace);

  const outputInstall = await installOddSdlcTypescript({
    targetRoot: outputWorkspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-internal-data-mapper-cross-output"
  });
  assert.equal(outputInstall.kind, "installed");

  const controlInstall = await installOddSdlcTypescript({
    targetRoot: controlWorkspace,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-internal-data-mapper-control"
  });
  assert.equal(controlInstall.kind, "installed");

  const firstGaps = await invokeOddSdlcSpecMethodCommand([
    "gaps",
    "--workspace",
    inputWorkspace,
    "--output-workspace",
    outputWorkspace
  ]);
  assert.equal(firstGaps.status, "ok");
  assert.equal(firstGaps.payload.start.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
  assert.equal(firstGaps.payload.start.executionContract.basis.workspaceRoot, inputWorkspace);
  assert.equal(
    firstGaps.payload.start.executionContract.basis.startIntent.requestedOutputs[0]
      .outputWorkspace.workspaceRoot,
    outputWorkspace
  );

  const induction = await invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    inputWorkspace,
    "--output-workspace",
    outputWorkspace
  ]);
  assert.equal(induction.status, "ok");
  assert.equal(induction.payload.status, "converged");
  assert.equal(induction.payload.summary.workspaceRoot, outputWorkspace);
  assert.equal(induction.payload.summary.currentEdge, FG_CONFORM_PROJECT);
  assert.equal(induction.payload.eventLogPath.startsWith(outputWorkspace), true);
  assert.equal(induction.payload.start.executionContract.basis.workspaceRoot, inputWorkspace);

  const controlInduction = await invokeOddSdlcSpecMethodCommand(["start", "--workspace", controlWorkspace]);
  assert.equal(controlInduction.status, "ok");
  assert.equal(controlInduction.payload.status, "converged");

  const inputConstraints = readFileSync(
    path.join(inputWorkspace, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(inputConstraints, /output_dir: "build_tenants\/scala_spark\/"/u);
  assert.match(inputConstraints, /selected_output_root: "build_tenants\/scala_spark"/u);
  assert.equal(
    existsSync(path.join(inputWorkspace, "specification/requirements/00-imported-sources.md")),
    true
  );

  const outputConstraints = readFileSync(
    path.join(outputWorkspace, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(outputConstraints, /selected_output_root: build_tenants\/scala_spark/u);
  assert.match(outputConstraints, /output_dir: build_tenants\/scala_spark/u);
  assert.equal(outputConstraints.includes("imp_scala_spark"), false);

  const reportPath = path.join(induction.payload.archiveRoot, "conform_project_report.json");
  const controlReportPath = path.join(
    controlInduction.payload.archiveRoot,
    "conform_project_report.json"
  );
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const controlReport = JSON.parse(readFileSync(controlReportPath, "utf8"));
  assert.equal(report.status, "passed");
  assert.equal(report.workspaceRootUri, pathToFileURL(outputWorkspace).href);
  assert(report.sourceRefs.some((ref) => ref.startsWith(pathToFileURL(inputWorkspace).href)));
  assert(
    report.materializedTopologyRefs.every((ref) =>
      ref.startsWith(pathToFileURL(outputWorkspace).href)
    )
  );

  assert.equal(existsSync(path.join(outputWorkspace, "specification/requirements")), false);
  const outputBootstrap = readFileSync(
    path.join(outputWorkspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );
  assert.match(outputBootstrap, /specification\/REQUIREMENTS\.md/u);
  assert.match(outputBootstrap, /specification\/mapper_requirements\.md/u);
  assert.match(outputBootstrap, new RegExp(path.basename(inputWorkspace), "u"));

  const outputIds = requirementIdsFromSourceRefs(report.sourceRefs);
  const controlIds = requirementIdsFromSourceRefs(controlReport.sourceRefs);
  assert.deepStrictEqual(outputIds, controlIds);
  assert(outputIds.includes("REQ-LDM-001"));
  assert(outputIds.includes("REQ-COV-008"));

  const nextGaps = await invokeOddSdlcSpecMethodCommand([
    "gaps",
    "--workspace",
    inputWorkspace,
    "--output-workspace",
    outputWorkspace
  ]);
  assert.equal(nextGaps.status, "ok");
  assert.notEqual(
    nextGaps.payload.start.executionContract.targetGraphFunction,
    FG_CONFORM_PROJECT
  );

  const outputOnlyGaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", outputWorkspace]);
  assert.equal(outputOnlyGaps.status, "ok");
  assert.notEqual(
    outputOnlyGaps.payload.start.executionContract.targetGraphFunction,
    FG_CONFORM_PROJECT
  );
});

test("T-087/T-091/T-096 induction can fan out one input into multiple output workspaces", async () => {
  mkdirSync(RUN_ROOT, { recursive: true });
  const runRoot = path.join(RUN_ROOT, `${runId()}_multiple_output_workspaces`);
  const inputWorkspace = path.join(runRoot, "input_workspace");
  const outputA = path.join(runRoot, "output_workspace_a");
  const outputB = path.join(runRoot, "output_workspace_b");
  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot: runRoot,
    scenarioId: "t087-t091-t096-multiple-output-induction"
  });
  assertAbgInstalledSandboxEvidence(installedWorkspace);
  copyInternalDataMapperFixture(inputWorkspace);

  for (const [label, outputWorkspace] of [
    ["a", outputA],
    ["b", outputB]
  ]) {
    const install = await installOddSdlcTypescript({
      targetRoot: outputWorkspace,
      packageSourceRoot: PACKAGE_ROOT,
      abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
      installedPackageName: `odd-sdlc-internal-data-mapper-output-${label}`
    });
    assert.equal(install.kind, "installed");
  }

  const runInduction = async (outputWorkspace) => {
    const gaps = await invokeOddSdlcSpecMethodCommand([
      "gaps",
      "--workspace",
      inputWorkspace,
      "--output-workspace",
      outputWorkspace
    ]);
    assert.equal(gaps.status, "ok");
    assert.equal(gaps.payload.start.executionContract.targetGraphFunction, FG_CONFORM_PROJECT);
    assert.equal(gaps.payload.start.executionContract.basis.workspaceRoot, inputWorkspace);
    assert.equal(
      gaps.payload.start.executionContract.basis.startIntent.requestedOutputs[0]
        .outputWorkspace.workspaceRoot,
      outputWorkspace
    );

    const induction = await invokeOddSdlcSpecMethodCommand([
      "start",
      "--workspace",
      inputWorkspace,
      "--output-workspace",
      outputWorkspace
    ]);
    assert.equal(induction.status, "ok");
    assert.equal(induction.payload.status, "converged");
    assert.equal(induction.payload.summary.workspaceRoot, outputWorkspace);
    assert.equal(induction.payload.eventLogPath.startsWith(outputWorkspace), true);
    assert.equal(induction.payload.archiveRoot.startsWith(outputWorkspace), true);

    const report = JSON.parse(
      readFileSync(
        path.join(induction.payload.archiveRoot, "conform_project_report.json"),
        "utf8"
      )
    );
    const inputRootRef = pathToFileURL(inputWorkspace).href;
    const outputRootRef = pathToFileURL(outputWorkspace).href;
    assert.equal(report.status, "passed");
    assert.equal(report.workspaceRootUri, outputRootRef);
    assert(report.sourceRefs.length > 0);
    assert(report.sourceRefs.every((ref) => ref.startsWith(inputRootRef)));
    assert(report.materializedTopologyRefs.length > 0);
    assert(
      report.materializedTopologyRefs.every((ref) => ref.startsWith(outputRootRef))
    );
    return {
      outputWorkspace,
      induction,
      report,
      requirementIds: requirementIdsFromSourceRefs(report.sourceRefs)
    };
  };

  const resultA = await runInduction(outputA);
  const gapsBeforeB = await invokeOddSdlcSpecMethodCommand([
    "gaps",
    "--workspace",
    inputWorkspace,
    "--output-workspace",
    outputB
  ]);
  assert.equal(gapsBeforeB.status, "ok");
  assert.equal(
    gapsBeforeB.payload.start.executionContract.targetGraphFunction,
    FG_CONFORM_PROJECT
  );

  const resultB = await runInduction(outputB);
  assert.notEqual(resultA.induction.payload.archiveRoot, resultB.induction.payload.archiveRoot);
  assert.notEqual(resultA.induction.payload.eventLogPath, resultB.induction.payload.eventLogPath);
  assert.deepStrictEqual(resultA.requirementIds, resultB.requirementIds);
  assert(resultA.requirementIds.includes("REQ-LDM-001"));
  assert(resultA.requirementIds.includes("REQ-COV-008"));
  assert(
    resultA.report.materializedTopologyRefs.every(
      (ref) => !ref.startsWith(pathToFileURL(outputB).href)
    )
  );
  assert(
    resultB.report.materializedTopologyRefs.every(
      (ref) => !ref.startsWith(pathToFileURL(outputA).href)
    )
  );

  const inputConstraints = readFileSync(
    path.join(inputWorkspace, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(inputConstraints, /output_dir: "build_tenants\/scala_spark\/"/u);
  assert.match(inputConstraints, /selected_output_root: "build_tenants\/scala_spark"/u);
  assert.equal(
    existsSync(path.join(inputWorkspace, "specification/requirements/00-imported-sources.md")),
    true
  );
});
