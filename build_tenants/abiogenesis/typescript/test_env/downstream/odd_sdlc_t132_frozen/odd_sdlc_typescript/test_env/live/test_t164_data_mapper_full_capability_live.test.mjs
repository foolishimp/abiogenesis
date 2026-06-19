// Validates: T-164
// Live proof placeholder: data_mapper full graph capability now requires an
// ABG-owned layered command/control lane, not an odd_sdlc local start loop.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
} from "../../build/semantic/code/src/index.js";
import { liveOperatorRuntimePolicy } from "./operator_runtime_policy.mjs";

const LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T164_DATA_MAPPER_FULL_CAPABILITY_LIVE"] === "1";
const RUNTIME_POLICY = liveOperatorRuntimePolicy();

const REQUIRED_FULL_GRAPH_EDGES = Object.freeze([
  ...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
]);

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assertExists(filePath, label) {
  assert.equal(existsSync(filePath), true, `missing ${label}: ${filePath}`);
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

function observedHandoffEdges(workspace) {
  return runtimeFilesNamed(workspace, "handoff_manifest.json").map((filePath) => {
    const manifest = readJsonFile(filePath);
    return {
      edgeName: manifest.edgeName,
      archiveRoot: manifest.archiveRoot,
      outputFile: manifest.outputFile
    };
  });
}

function latestArchiveWithEdge(workspace, edgeName) {
  return (
    observedHandoffEdges(workspace)
      .filter((entry) => entry.edgeName === edgeName)
      .map((entry) => entry.archiveRoot)
      .filter((archiveRoot) => typeof archiveRoot === "string")
      .sort()
      .at(-1) ?? null
  );
}

function latestHandoffWithEdge(workspace, edgeName) {
  return (
    observedHandoffEdges(workspace)
      .filter(
        (entry) =>
          entry.edgeName === edgeName && typeof entry.archiveRoot === "string"
      )
      .sort((left, right) => left.archiveRoot.localeCompare(right.archiveRoot))
      .at(-1) ?? null
  );
}

function assertNonEmptyArray(payload, fieldName) {
  assert(
    Array.isArray(payload?.[fieldName]) && payload[fieldName].length > 0,
    `${fieldName} must be a non-empty array`
  );
}

function parseFencedJson(text, fenceName) {
  const match = text.match(
    new RegExp("```(?:json\\s+)?" + fenceName + "\\s*\\n([\\s\\S]*?)```", "u")
  );
  assert(match, `missing fenced ${fenceName} JSON block`);
  return JSON.parse(match[1]);
}

function assertImplementationDesignCompositeProof(workspace) {
  const archiveRoot = latestArchiveWithEdge(
    workspace,
    "derive_implementation_design_surface"
  );
  assert.notEqual(
    archiveRoot,
    null,
    "missing archive for derive_implementation_design_surface"
  );
  const register = readJsonFile(
    path.join(archiveRoot, "design_depth_fp_evaluator_register.json")
  );
  assert.equal(register.kind, "sdlc_design_depth_register");
  assert.equal(register.registerVersion, "ts-design-depth-v1");
  assert.equal(register.targetAssetType, "implementation_design_surface");
  for (const fieldName of [
    "stackProfileRows",
    "implementationModuleRows",
    "aggregateDomainModelRows",
    "moduleSchemaFragments",
    "moduleStateDiagramFragments",
    "sunnyDaySequenceRows",
    "componentTopologyRows",
    "componentRealizationRows",
    "fileTargetRows"
  ]) {
    assertNonEmptyArray(register, fieldName);
  }
  assertNonEmptyArray(register.aggregateDomainModel, "entities");
  assertNonEmptyArray(register.aggregateSunnyDaySequence, "steps");
}

function assertTestDesignCompositeProof(workspace) {
  const handoff = latestHandoffWithEdge(workspace, "derive_test_design_surface");
  assert.notEqual(handoff, null, "missing handoff for derive_test_design_surface");
  assert.equal(typeof handoff.outputFile, "string", "missing test design output file");
  const outputFile = path.isAbsolute(handoff.outputFile)
    ? handoff.outputFile
    : path.join(workspace, handoff.outputFile);
  assertExists(outputFile, "derive_test_design_surface output file");
  const text = readFileSync(outputFile, "utf8");
  for (const heading of [
    "## Test Decomposition Summary",
    "## Test Stack Profile",
    "## Test Dependency Map",
    "## Test Design Register"
  ]) {
    assert.match(text, new RegExp(heading.replaceAll(" ", "\\s+"), "u"));
  }
  const register = parseFencedJson(text, "test_design_register");
  assert.equal(register.kind, "sdlc_test_design_register");
  assert.equal(register.registerVersion, "ts-test-design-v1");
  assert.equal(register.targetAssetType, "test_design_surface");
  for (const fieldName of [
    "designConsumptionRows",
    "uatTestcaseRows",
    "testcaseAuthorityRows",
    "testStackProfileRows",
    "testModuleRows",
    "testComponentTopologyRows",
    "testDataBindings",
    "expectedResultBindings",
    "uatIntegrationBindings",
    "testExecutionScheduleRows"
  ]) {
    assertNonEmptyArray(register, fieldName);
  }
}

function writeSyntheticHandoff(input) {
  const runRoot = path.join(
    input.workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs",
    input.runId
  );
  mkdirSync(runRoot, { recursive: true });
  writeJson(path.join(runRoot, "handoff_manifest.json"), {
    edgeName: input.edgeName,
    targetAssetType: input.targetAssetType,
    archiveRoot: input.archiveRoot,
    outputFile: input.outputFile
  });
}

test("T-164 full-capability proof derives required graph edges from current catalog truth", () => {
  assert.deepEqual(REQUIRED_FULL_GRAPH_EDGES, [
    ...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
  ]);
  assert.deepEqual(
    REQUIRED_FULL_GRAPH_EDGES.filter((edgeName) =>
      [
        "Fg_conform_project_authority",
        "select_implementation_stack_profile",
        "derive_implementation_module_surface",
        "derive_aggregate_domain_model_surface",
        "derive_implementation_component_topology_surface",
        "derive_aggregate_sunny_day_sequence_surface",
        "derive_component_realization_schedule_surface",
        "select_test_stack_profile",
        "derive_test_module_surface",
        "derive_test_component_topology_surface",
        "derive_test_schedule_surface",
        "qualify_testcase_authority"
      ].includes(edgeName)
    ),
    []
  );
});

test("T-164 full data_mapper live runner keeps SBT caches inside sandbox workspace", () => {
  const runner = readFileSync(
    path.join(dirname(fileURLToPath(import.meta.url)), "run_full_external_data_mapper_sandbox.mjs"),
    "utf8"
  );
  assert.match(runner, /sandboxToolCache/u);
  assert.match(runner, /\.ai-workspace\/runtime\/odd_sdlc\/tool-cache/u);
  assert.match(runner, /COURSIER_CACHE/u);
  assert.match(runner, /-Dsbt\.boot\.directory=/u);
  assert.match(runner, /-Dsbt\.global\.base=/u);
  assert.match(runner, /-Dsbt\.ivy\.home=/u);
  assert.match(runner, /SBT_OPTS/u);
  assert.match(runner, /ODD_SDLC_TS_DATA_MAPPER_START_TARGET/u);
  assert.match(runner, /`graph_function:\$\{TARGET_GRAPH_FUNCTION\}`/u);
  assert.match(runner, /isOverlayStartTarget\(startTarget\)/u);
  assert.match(runner, /sdlcStartArgs\(startTarget\)/u);
  assert.match(runner, /"first_traversal"/u);
  assert.match(runner, /odd-sdlc-start-first-traversal/u);
  assert.match(runner, /odd_sdlc_cli_overlay_start_first_traversal/u);
  assert.match(runner, /isSuccessfulSdlcTraversalStart/u);
  assert.match(runner, /status === "worker_invoked"/u);
  assert.match(runner, /closureDisposition === "close"/u);
  assert.match(runner, /ODD_SDLC_TS_DATA_MAPPER_MAX_ADVANCES/u);
  assert.match(runner, /DATA_MAPPER_DETAIL_ZOOM_EDGES/u);
  assert.match(runner, /overlayZoomGraphFunctionRefs/u);
  assert.match(runner, /detailZoomStopSatisfied\(workspace\)/u);
  assert.match(runner, /sdlcOverlayStartLoop/u);
  assert.match(runner, /args: abgStartArgs\(`graph_function:\$\{FG_CONFORM_PROJECT\}`\)/u);
  assert.match(runner, /args: startArgsForTarget\(START_TARGET\)/u);
  assert.match(runner, /command: startCommandForTarget\(\{ startTarget: START_TARGET, genesisCommand, installedCommand \}\)/u);
  const promptPolicy = readFileSync(
    path.join(
      path.resolve(dirname(fileURLToPath(import.meta.url)), "../.."),
      "code/src/operator/plugins/transform/prompt_edge_policy.ts"
    ),
    "utf8"
  );
  assert.match(
    promptPolicy,
    /Every admitted requirement obligation in workerInvocationPackage\.traversalObligationContext\.obligations/u
  );
  assert.match(promptPolicy, /For trace_missing repair, copy the exact admitted obligation ids/u);
});

test("T-164 composite design proofs preserve split-edge capability without stale graph edges", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t164-graph-proof-"));
  try {
    const implementationArchive = path.join(workspace, "archives/implementation");
    mkdirSync(implementationArchive, { recursive: true });
    writeSyntheticHandoff({
      workspace,
      runId: "implementation",
      edgeName: "derive_implementation_design_surface",
      targetAssetType: "implementation_design_surface",
      archiveRoot: implementationArchive,
      outputFile: null
    });
    writeJson(path.join(implementationArchive, "design_depth_fp_evaluator_register.json"), {
      kind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      targetAssetType: "implementation_design_surface",
      stackProfileRows: [{}],
      implementationModuleRows: [{}],
      aggregateDomainModelRows: [{}],
      moduleSchemaFragments: [{}],
      moduleStateDiagramFragments: [{}],
      sunnyDaySequenceRows: [{}],
      componentTopologyRows: [{}],
      componentRealizationRows: [{}],
      fileTargetRows: [{}],
      aggregateDomainModel: { entities: [{}] },
      aggregateSunnyDaySequence: { steps: [{}] }
    });

    const testArchive = path.join(workspace, "archives/test-design");
    const testOutputFile = path.join(workspace, "design/test-design.md");
    mkdirSync(testArchive, { recursive: true });
    mkdirSync(dirname(testOutputFile), { recursive: true });
    writeSyntheticHandoff({
      workspace,
      runId: "test-design",
      edgeName: "derive_test_design_surface",
      targetAssetType: "test_design_surface",
      archiveRoot: testArchive,
      outputFile: testOutputFile
    });
    writeFileSync(
      testOutputFile,
      [
        "## Test Decomposition Summary",
        "## Test Stack Profile",
        "## Test Dependency Map",
        "## Test Design Register",
        "```json test_design_register",
        JSON.stringify(
          {
            kind: "sdlc_test_design_register",
            registerVersion: "ts-test-design-v1",
            targetAssetType: "test_design_surface",
            designConsumptionRows: [{}],
            uatTestcaseRows: [{}],
            testcaseAuthorityRows: [{}],
            testStackProfileRows: [{}],
            testModuleRows: [{}],
            testComponentTopologyRows: [{}],
            testDataBindings: [{}],
            expectedResultBindings: [{}],
            uatIntegrationBindings: [{}],
            testExecutionScheduleRows: [{}]
          },
          null,
          2
        ),
        "```"
      ].join("\n"),
      "utf8"
    );

    assertImplementationDesignCompositeProof(workspace);
    assertTestDesignCompositeProof(workspace);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test(
  "T-164 data_mapper full capability live run hands convergence to ABG command binding",
  {
    skip: LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T164_DATA_MAPPER_FULL_CAPABILITY_LIVE=1 not set"
  },
  () => {
    const scriptPath = fileURLToPath(
      new URL("./run_full_external_data_mapper_sandbox.mjs", import.meta.url)
    );
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: path.resolve(dirname(scriptPath), "../.."),
      encoding: "utf8",
      env: {
        ...process.env,
        ODD_SDLC_TS_T164_DATA_MAPPER_FULL_CAPABILITY_LIVE: "1",
        ODD_SDLC_TS_DATA_MAPPER_WORKER:
          RUNTIME_POLICY.liveHarnessDataMapperWorkerTransport
      },
      maxBuffer: 1024 * 1024 * 100
    });
    assert.equal(
      result.status,
      0,
      `data_mapper live lane failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
    const summary = JSON.parse(result.stdout);
    assert.equal(summary.commandBinding, "abg_cli_start_until_converged");
    assert.equal(
      summary.targetGraphFunction,
      FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
    );
    assert.equal(
      summary.abgConformProject.resolved_target,
      `graph_function:${FG_CONFORM_PROJECT}`
    );
    assert.equal(summary.abgConformProject.status, "converged");
    assert.equal(
      summary.abgStart.resolved_target,
      `graph_function:${FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE}`
    );
    if (summary.abgStart.status === "converged") {
      assert.equal(summary.terminalReason, "abg_reported_converged");
    } else {
      assert.equal(summary.abgStart.status, "blocked");
      assert.equal(summary.abgStart.stopped_by, "blocked");
      assert.equal(summary.abgStart.control_outcome?.kind, "blocked");
      assert.equal(
        summary.abgStart.control_outcome?.stopDetail?.kind,
        "gap_stop"
      );
      assert.equal(summary.abgStart.live_status?.runStatus, "blocked");
      assert.equal(summary.abgStart.live_status?.reason, "gap_stop");
      assert.equal(summary.abgStart.stop_class?.kind, "blocked");
      assert.equal(summary.terminalReason, "abg_reported_lawful_gap_stop");
    }
    assert.equal(summary.steps.length, 2);
    assert.equal(summary.steps[0].phase, "abg-conform-project");
    assert.equal(summary.steps[1].phase, "abg-start");
    assertExists(summary.workspace, "data_mapper live workspace");
    assertExists(summary.abgRuntimeBindingPath, "installed ABG runtime binding");
  }
);
