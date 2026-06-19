// Validates: T-199

import assert from "node:assert/strict";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "../..");
const DEFAULT_SEED_ARCHIVE_ROOT = path.join(
  PACKAGE_ROOT,
  "test_env/test_runs/full_external_data_mapper_sandbox/20260610T202608490Z_pid46762"
);

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function runtimeFilesNamed(workspace, fileName) {
  const runsRoot = path.join(workspace, ".ai-workspace/runtime/odd_sdlc/operator-runs");
  if (!existsSync(runsRoot)) {
    return [];
  }
  const files = [];
  const stack = [runsRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (entry.isFile() && entry.name === fileName) {
        files.push(child);
      }
    }
  }
  return files.sort();
}

function latestHandoffWithEdge(workspace, edgeName) {
  return (
    runtimeFilesNamed(workspace, "handoff_manifest.json")
      .map((filePath) => ({
        filePath,
        manifest: readJsonFile(filePath)
      }))
      .filter((entry) => entry.manifest.edgeName === edgeName)
      .sort((left, right) => left.filePath.localeCompare(right.filePath))
      .at(-1) ?? null
  );
}

function latestWorkerPackageWithEdge(workspace, edgeName) {
  return (
    runtimeFilesNamed(workspace, "worker_invocation_package.json")
      .map((filePath) => ({
        filePath,
        package: readJsonFile(filePath)
      }))
      .filter((entry) => entry.package.edgeName === edgeName)
      .sort((left, right) => left.filePath.localeCompare(right.filePath))
      .at(-1) ?? null
  );
}

function workspacePath(workspace, maybePath) {
  return path.isAbsolute(maybePath) ? maybePath : path.join(workspace, maybePath);
}

function assertNonEmptyArray(payload, fieldName) {
  assert(
    Array.isArray(payload?.[fieldName]) && payload[fieldName].length > 0,
    `${fieldName} must be a non-empty array`
  );
}

test("T-199 code-depth resume runner uses copied prior graph state and direct codegen", () => {
  const runner = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_t199_data_mapper_code_depth_resume.mjs"),
    "utf8"
  );
  assert.match(runner, /ODD_SDLC_TS_T199_DATA_MAPPER_SEED_ARCHIVE_ROOT/u);
  assert.match(runner, /20260610T202608490Z_pid46762/u);
  assert.match(runner, /copySeedWorkspace/u);
  assert.match(runner, /collectWorkspacePreconditions/u);
  assert.match(runner, /copiedWorkspaceInstalledPackageName/u);
  assert.match(runner, /installedSpecPayload/u);
  assert.match(runner, /pruneSandboxNoise/u);
  assert.match(runner, /SANDBOX_NOISE_DIR_NAMES/u);
  assert.match(runner, /pruneCodegenOutputs/u);
  assert.match(runner, /sandboxToolCache/u);
  assert.match(runner, /COURSIER_CACHE/u);
  assert.match(runner, /-Dsbt\.global\.base=/u);
  assert.match(runner, /FG_DERIVE_LITE_COMPONENT_CODE_SURFACE/u);
  assert.match(runner, /beforeWorkerInvocationPackagePaths/u);
  assert.match(runner, /admitComponentDepthRegisterFromArtifact/u);
  assert.match(
    runner,
    /abg_cli_direct_code_depth_start_until_first_fresh_codegen_result/u
  );
  assert.match(runner, /runCommandUntilFirstFreshCodegenResult/u);
  assert.match(runner, /abg-start-code-depth-until-first-fresh-codegen-result/u);
  assert.match(
    runner,
    /abgStartArgs\(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE, "first_traversal"\)/u
  );
  assert.match(runner, /harness_stopped_after_first_fresh_codegen_result/u);
  assert.match(runner, /first_fresh_codegen_review_grade_result/u);
  assert.match(runner, /collectFreshCodegenPackages/u);
  assert.match(runner, /freshCodegenRunRoot: start\.freshCodegenRunRoot/u);
  assert.match(runner, /\.ai-workspace\/runtime\/odd_sdlc\/tool-cache/u);
  assert.match(runner, /materializedProductFileTargets/u);
  assert.match(runner, /missingProductFileTargets/u);
  assert.match(runner, /reviewGradeBlockingReasons/u);
  assert.match(runner, /gapDossierNextLawfulActions/u);
  assert.match(runner, /t199_data_mapper_code_depth_resume_assertion\.json/u);
  assert.match(runner, /summary\.assertion = assertFreshCodegenRun/u);
  assert.match(
    runner,
    /Emit a raw JSON component_depth_register selected target-carrier envelope/u
  );
  assert.match(runner, /Emit a fenced `json component_depth_register`/u);
  assert.doesNotMatch(runner, /canonicalDataMapperFixtureRoot/u);
});

test("T-199 live script remains data_mapper-boundary guarded", () => {
  const packageJson = readJsonFile(path.join(PACKAGE_ROOT, "package.json"));
  assert.match(
    packageJson.scripts["test:t199:data-mapper-code-depth-resume-live"],
    /guard:data-mapper-boundary/u
  );
  assert.match(
    packageJson.scripts["test:t199:data-mapper-code-depth-resume-live"],
    /run_t199_data_mapper_code_depth_resume\.mjs/u
  );
});

test(
  "T-199 default seed archive carries substantive upstream state",
  {
    skip: !existsSync(DEFAULT_SEED_ARCHIVE_ROOT)
      ? "default T-199 seed archive is not present in this checkout"
      : false
  },
  () => {
    const runSummary = readJsonFile(
      path.join(DEFAULT_SEED_ARCHIVE_ROOT, "run_summary.json")
    );
    const workspace = path.join(DEFAULT_SEED_ARCHIVE_ROOT, "workspace");
    assert.equal(runSummary.terminalReason, "abg_reported_converged");
    assert.equal(runSummary.targetGraphFunction, "lite_design_module_implementation");
    assert.equal(existsSync(workspace), true);

    const eventsPath = path.join(workspace, ".ai-workspace/events/events.jsonl");
    assert.equal(existsSync(eventsPath), true);
    assert(statSync(eventsPath).size > 0, "seed event ledger must be non-empty");

    const designHandoff = latestHandoffWithEdge(
      workspace,
      "derive_lite_design_adr_surface"
    );
    assert.notEqual(designHandoff, null, "seed must include design handoff");
    const designArchiveRoot = workspacePath(
      workspace,
      designHandoff.manifest.archiveRoot
    );
    const designOutputFile = workspacePath(workspace, designHandoff.manifest.outputFile);
    assert.equal(existsSync(designArchiveRoot), true);
    assert.equal(existsSync(designOutputFile), true);
    const designRegister = readJsonFile(
      path.join(designArchiveRoot, "design_depth_fp_evaluator_register.json")
    );
    assert.equal(designRegister.kind, "sdlc_design_depth_register");
    assert.equal(designRegister.targetAssetType, "implementation_design_surface");
    for (const fieldName of [
      "componentTopologyRows",
      "componentRealizationRows",
      "fileTargetRows"
    ]) {
      assertNonEmptyArray(designRegister, fieldName);
    }
    for (const relativePath of [
      "sdlc_edge_fulfillment_ledger.json",
      "sdlc_edge_closure_decision.json"
    ]) {
      assert.equal(existsSync(path.join(designArchiveRoot, relativePath)), true);
    }

    const codegenPackage = latestWorkerPackageWithEdge(
      workspace,
      "derive_lite_component_code_surface"
    );
    assert.notEqual(codegenPackage, null, "seed must include codegen package");
    assert.equal(codegenPackage.package.targetAssetType, "component_code_surface");
    assert.equal(codegenPackage.package.outputContract.materializationRequired, true);
    assert(
      codegenPackage.package.outputContract.declaredProductFileTargets.length > 0,
      "seed codegen package must carry declared product targets"
    );
    const codegenArchiveRoot = path.dirname(codegenPackage.filePath);
    for (const relativePath of [
      "sdlc_edge_fulfillment_ledger.json",
      "sdlc_edge_closure_decision.json",
      "product_materialization_manifest.json"
    ]) {
      assert.equal(existsSync(path.join(codegenArchiveRoot, relativePath)), true);
    }
  }
);
