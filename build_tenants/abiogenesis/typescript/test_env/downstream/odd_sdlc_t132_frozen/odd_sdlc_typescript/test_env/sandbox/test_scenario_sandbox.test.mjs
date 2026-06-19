// Drives the generic scenario sandbox harness against registered descriptors.
//
// One test per scenario. Each test rebuilds the candidate app from its fixture
// into a fresh archive, exercising the same six-step recipe proven by the
// internal data_mapper induction lane:
//   provision ABG sandbox -> copy fixture -> install odd_sdlc -> gaps -> start
//
// Live multi-advance variants are opt-in through env vars.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  assertScenarioExpectations,
  runScenarioSandbox,
  scenarioGraphCloseStopSatisfied,
  scenarioStartTargetForStep,
  scenarioWorkspaceFileStopSatisfied
} from "./scenario_sandbox.mjs";
import { dataMapperInternalScenario } from "./scenarios/data_mapper_internal.scenario.mjs";
import {
  helloWorldRustMinimumInductionLiveScenario,
  helloWorldRustMinimumInductionScenario
} from "./scenarios/hello_world_rust_minimum_induction.scenario.mjs";
import {
  t131OddChatLiveScenario,
  t131OddChatScenario
} from "./scenarios/t131_odd_chat.scenario.mjs";
import {
  T132_HELLO_WORLD_JS_DEEP_CODE_TEST_EDGES,
  T132_HELLO_WORLD_JS_MIN_FP_EDGES,
  t132HelloWorldJsDeepSdlcZoomLiveScenario,
  t132HelloWorldJsLiveScenario,
  t132HelloWorldJsScenario
} from "./scenarios/t132_hello_world_js.scenario.mjs";
import {
  t133HelloWorldRustLiveScenario,
  t133HelloWorldRustScenario
} from "./scenarios/t133_hello_world_rust.scenario.mjs";
import {
  t160HelloWorldJsLiteLiveScenario,
  t160HelloWorldJsLiteScenario,
  t160HelloWorldJsOverlayScenarios
} from "./scenarios/t160_hello_world_js_lite.scenario.mjs";
import {
  t160HelloWorldRustLiteLiveScenario,
  t160HelloWorldRustLiteScenario
} from "./scenarios/t160_hello_world_rust_lite.scenario.mjs";
import {
  t164RustHelloServiceLiteLiveScenario,
  t164RustHelloServiceLiteScenario
} from "./scenarios/t164_rust_hello_service_lite.scenario.mjs";
import {
  T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES,
  T174_PARALLEL_HELLO_WORLD_LITE_EDGES,
  t174ParallelHelloWorldJsFourLaneFrontierScenario,
  t174ParallelHelloWorldJsFourLaneLiveScenario,
  t174ParallelHelloWorldJsLiveScenario,
  t174ParallelHelloWorldJsScenario
} from "./scenarios/t174_parallel_hello_world_js.scenario.mjs";
import {
  t173SagaFrontierStressScenario
} from "./scenarios/t173_saga_frontier_stress.scenario.mjs";
import {
  mindforgeAiAssistantBaselineScenario,
  mindforgeAiAssistantLiveScenario,
  mindforgeAiAssistantScenarioFamily,
  mindforgeAiAssistantVariantScenarios
} from "./scenarios/mindforge_ai_assistant.scenario.mjs";

function assertWorkspaceWasInstalled(result) {
  if (!existsSync(result.workspace) || !statSync(result.workspace).isDirectory()) {
    throw new Error(`workspace missing at ${result.workspace}`);
  }
  if (result.install.kind !== "installed") {
    throw new Error(`install did not complete: ${JSON.stringify(result.install)}`);
  }
}

function assertNoMindforgePrebuiltImplementation(scenario) {
  const forbidden = [
    "build_tenants/mindforge_ai_assistant/package.json",
    "build_tenants/mindforge_ai_assistant/src/index.js",
    "build_tenants/mindforge_ai_assistant/examples/use_case.json"
  ];
  for (const rel of forbidden) {
    assert.equal(
      existsSync(path.join(scenario.fixture.root, rel)),
      false,
      `${scenario.scenarioId} fixture includes generated product output ${rel}`
    );
  }
}

function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(payload), "utf8");
}

function writeEdgeAssuranceArchive(runRoot, edgeName, suffix = "") {
  const contractRef = `contract:${edgeName}`;
  const contractDigest = `digest:${edgeName}`;
  const gainRef = `gain:${edgeName}${suffix}`;
  const residualPressureRefs = [`pressure:${edgeName}${suffix}`];
  writeJson(path.join(runRoot, "handoff_manifest.json"), {
    edgeName,
    edgeAssuranceContractRef: contractRef,
    edgeAssuranceContractDigest: contractDigest
  });
  writeJson(path.join(runRoot, "worker_construction_brief.json"), {
    kind: "sdlc_worker_construction_brief",
    edgeName,
    canonicalPromptCarrierPath: "worker_construction_brief.json"
  });
  writeJson(path.join(runRoot, "sdlc_edge_gain.json"), {
    gainRef,
    contractRef,
    contractDigest
  });
  writeJson(path.join(runRoot, "sdlc_edge_residual_pressure.json"), {
    contractRef,
    contractDigest,
    requiredPressureRefs: residualPressureRefs
  });
  writeJson(path.join(runRoot, "sdlc_edge_fulfillment_ledger.json"), {
    edgeAssuranceContractRef: contractRef,
    edgeAssuranceContractDigest: contractDigest,
    edgeGainRef: gainRef,
    edgeResidualPressureRefs: residualPressureRefs
  });
  writeJson(path.join(runRoot, "sdlc_edge_closure_decision.json"), {
    disposition: "close",
    edgeGainRef: gainRef,
    edgeAssuranceDecisionRef: `decision:${edgeName}${suffix}`
  });
  writeJson(path.join(runRoot, "sdlc_next_action_projection.json"), {
    edgeAssuranceContractRef: contractRef,
    edgeGainRef: gainRef,
    edgeResidualPressureRefs: residualPressureRefs
  });
}

test("scenario sandbox: data_mapper internal induction", async () => {
  const result = await runScenarioSandbox(dataMapperInternalScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, dataMapperInternalScenario);
});

test("scenario sandbox: T-131 odd_chat bootstrap induction", async () => {
  const result = await runScenarioSandbox(t131OddChatScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t131OddChatScenario);
});

test("scenario sandbox: minimum Rust hello-world induction", async () => {
  const result = await runScenarioSandbox(helloWorldRustMinimumInductionScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, helloWorldRustMinimumInductionScenario);
});

test("scenario sandbox: T-132 JavaScript hello-world bootstrap induction", async () => {
  const result = await runScenarioSandbox(t132HelloWorldJsScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t132HelloWorldJsScenario);
});

test("scenario sandbox: T-133 Rust hello-world bootstrap induction", async () => {
  const result = await runScenarioSandbox(t133HelloWorldRustScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t133HelloWorldRustScenario);
});

test("scenario sandbox: T-160 JavaScript hello-world lite traversal", async () => {
  const result = await runScenarioSandbox(t160HelloWorldJsLiteScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t160HelloWorldJsLiteScenario);
});

test("scenario sandbox: T-160 Rust hello-world lite traversal", async () => {
  const result = await runScenarioSandbox(t160HelloWorldRustLiteScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t160HelloWorldRustLiteScenario);
});

test("scenario sandbox: T-164 Rust hello service conformance bootstrap", async () => {
  const result = await runScenarioSandbox(t164RustHelloServiceLiteScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t164RustHelloServiceLiteScenario);
});

test("scenario sandbox: T-174 parallel hello-world JS conformance bootstrap", async () => {
  const result = await runScenarioSandbox(t174ParallelHelloWorldJsScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t174ParallelHelloWorldJsScenario);
});

test("scenario sandbox: T-174 parallel hello-world JS four-lane frontier", async () => {
  const result = await runScenarioSandbox(
    t174ParallelHelloWorldJsFourLaneFrontierScenario
  );
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t174ParallelHelloWorldJsFourLaneFrontierScenario);
});

test("scenario sandbox: T-173 ABG saga frontier 50-way stress", async () => {
  const result = await runScenarioSandbox(t173SagaFrontierStressScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, t173SagaFrontierStressScenario);
});

for (const scenario of t160HelloWorldJsOverlayScenarios) {
  test(`scenario sandbox: T-160 JavaScript hello-world overlay matrix ${scenario.startTarget}`, async () => {
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  });
}

test("scenario sandbox: T-163 MindForge fixtures contain no prebuilt implementation output", () => {
  for (const scenario of mindforgeAiAssistantScenarioFamily) {
    assertNoMindforgePrebuiltImplementation(scenario);
  }
});

test("scenario sandbox: T-163 MindForge baseline induction", async () => {
  assertNoMindforgePrebuiltImplementation(mindforgeAiAssistantBaselineScenario);
  const result = await runScenarioSandbox(mindforgeAiAssistantBaselineScenario);
  assertWorkspaceWasInstalled(result);
  assertScenarioExpectations(result, mindforgeAiAssistantBaselineScenario);
});

for (const scenario of mindforgeAiAssistantVariantScenarios) {
  test(`scenario sandbox: T-163 MindForge variant induction ${scenario.scenarioId}`, async () => {
    assertNoMindforgePrebuiltImplementation(scenario);
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  });
}

test("scenario sandbox: hello-world live descriptors bind profile overlay scope", () => {
  const worker = "process://claude";
  assert(
    helloWorldRustMinimumInductionLiveScenario({ worker }).maxAdvances >= 16
  );
  const jsLive = t132HelloWorldJsLiveScenario({ worker });
  assert.equal(jsLive.maxAdvances, 8);
  assert.deepEqual(jsLive.startTarget, "next");
  assert.deepEqual(jsLive.startUntil, "converged");
  assert.equal(Array.isArray(jsLive.startTargetSequence), false);
  assert.equal(jsLive.continueOnEdgeConverge, true);
  assert.equal(jsLive.stopAfterGraphClose, true);
  assert.ok(
    jsLive.fixture.sourceFiles.includes(
      "build_tenants/hello_world_javascript/spec/TECH_STACK.json"
    )
  );
  assert.deepEqual(jsLive.expectations.exactHandoffEdgeSequence, [
    ...T132_HELLO_WORLD_JS_MIN_FP_EDGES
  ]);
  assert.deepEqual(jsLive.expectations.latestArchiveArtifacts, [
    "worker_result_report.json",
    "declared_edge_projection_artifact.json"
  ]);
  assert.deepEqual(jsLive.expectations.handoffEdgeSequencePrefix, [
    ...T132_HELLO_WORLD_JS_MIN_FP_EDGES
  ]);
  assert.equal(jsLive.stopAfterWorkspaceFilesExist, false);
  assert.deepEqual(
    jsLive.expectations.firstHandoffOverlayRef,
    "overlay://odd-sdlc/framework-smoke-min-fp"
  );
  const jsZoom = t132HelloWorldJsDeepSdlcZoomLiveScenario({ worker });
  assert.equal(
    jsZoom.scenarioId,
    "scenario_t200_hello_world_js_deep_sdlc_zoom_live"
  );
  assert.deepEqual(jsZoom.startTarget, "overlay:deep-sdlc-traversal");
  assert.deepEqual(
    jsZoom.expectations.firstStartOverlayRef,
    "overlay://odd-sdlc/deep-sdlc-traversal"
  );
  assert.deepEqual(
    jsZoom.expectations.firstHandoffOverlayRef,
    "overlay://odd-sdlc/framework-smoke-min-fp"
  );
  assert.deepEqual(jsZoom.expectations.handoffEdgeSequencePrefix, [
    ...T132_HELLO_WORLD_JS_MIN_FP_EDGES
  ]);
  assert.deepEqual(
    jsZoom.expectations.latestArchiveJsonAssertions[0].equals
      .overlayZoomGraphFunctionRefs,
    []
  );
  assert.deepEqual(
    jsZoom.expectations.latestArchiveJsonAssertions[0].equals
      .overlayZoomTargetGraphFunctionRefs,
    []
  );
  assert(t133HelloWorldRustLiveScenario({ worker }).maxAdvances >= 16);
  const jsLite = t160HelloWorldJsLiteLiveScenario({ worker });
  assert.deepEqual(jsLite.startTarget, "overlay:lite-design-module-implementation");
  assert(jsLite.maxAdvances >= 7);
  assert.deepEqual(jsLite.expectations.requiredHandoffEdges, [
    "derive_lite_component_code_surface",
    "derive_lite_test_design_surface",
    "derive_lite_component_test_surface",
    "derive_lite_uat_test_source_surface",
    "prepare_test_execution_surface",
    "derive_test_execution_result_surface"
  ]);
  assert.equal(jsLite.stopAfterWorkspaceFilesExist, false);
  assert.equal(jsLite.stopAfterRequiredHandoffEdges, true);
  const rustServiceLive = t164RustHelloServiceLiteLiveScenario({ worker });
  assert.deepEqual(rustServiceLive.startTarget, "next");
  assert.equal(Array.isArray(rustServiceLive.startTargetSequence), false);
  assert.deepEqual(scenarioStartTargetForStep(rustServiceLive, 0), "next");
  assert.deepEqual(scenarioStartTargetForStep(rustServiceLive, 1), "next");
  assert.deepEqual(scenarioStartTargetForStep(rustServiceLive, 2), "next");
  assert(rustServiceLive.maxAdvances >= 16);
  assert.deepEqual(
    rustServiceLive.expectations.handoffEdgeSequencePrefix[0],
    "derive_intent_surface"
  );
  assert.deepEqual(rustServiceLive.expectations.requiredHandoffEdges, [
    "derive_lite_component_code_surface",
    "derive_lite_test_design_surface",
    "derive_lite_component_test_surface",
    "derive_lite_uat_test_source_surface",
    "prepare_test_execution_surface",
    "derive_test_execution_result_surface"
  ]);
  assert.deepEqual(scenarioStartTargetForStep(rustServiceLive, 4), "next");
  assert.deepEqual(scenarioStartTargetForStep(rustServiceLive, 5), "next");
  assert.deepEqual(
    rustServiceLive.expectations.edgeAssuranceArchiveSequencePrefix,
    rustServiceLive.expectations.handoffEdgeSequencePrefix
  );
  assert.equal(rustServiceLive.expectations.processChecks, undefined);
  assert.deepEqual(rustServiceLive.expectations.executionEvidence, {
    edgeName: "derive_test_execution_result_surface",
    status: "succeeded",
    commandIncludes: "cargo run",
    stdoutIncludes: "helloworld"
  });
  const parallelHelloLive = t174ParallelHelloWorldJsLiveScenario({ worker });
  assert.deepEqual(
    scenarioStartTargetForStep(parallelHelloLive, 0),
    "overlay:bootstrap-requirements"
  );
  assert.deepEqual(
    scenarioStartTargetForStep(parallelHelloLive, 1),
    "overlay:bootstrap-requirements"
  );
  assert.deepEqual(
    scenarioStartTargetForStep(parallelHelloLive, 2),
    "next"
  );
  assert(parallelHelloLive.maxAdvances >= 16);
  assert.deepEqual(
    parallelHelloLive.expectations.handoffEdgeSequencePrefix,
    [...T174_PARALLEL_HELLO_WORLD_LITE_EDGES]
  );
  assert.deepEqual(
    parallelHelloLive.expectations.edgeAssuranceArchiveSequencePrefix,
    parallelHelloLive.expectations.handoffEdgeSequencePrefix
  );
  assert.deepEqual(
    parallelHelloLive.expectations.workspaceFiles,
    [...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES]
  );
  const fourLaneLive = t174ParallelHelloWorldJsFourLaneLiveScenario({ worker });
  assert.equal(
    fourLaneLive.scenarioId,
    "scenario_t174_parallel_hello_world_js_four_lane_live"
  );
  assert.deepEqual(
    fourLaneLive.expectations.workspaceFiles,
    [...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES]
  );
  assert.equal(fourLaneLive.expectations.processChecks.length, 3);
  assert.deepEqual(
    fourLaneLive.expectations.liveFpParallelMaterializationFrontier.edgeName,
    "derive_component_code_surface"
  );
  assert.deepEqual(
    fourLaneLive.expectations.liveFpParallelMaterializationFrontier.equals
      .executionAuthority,
    "abg_evented_saga_frontier"
  );
  assert.equal(
    fourLaneLive.expectations.liveFpParallelMaterializationFrontier
      .requiredBranchRefs.length,
    4
  );
  const mindforgeLive = mindforgeAiAssistantLiveScenario({
    worker,
    variant: "third_party_model_variant"
  });
  assert.deepEqual(mindforgeLive.startTarget, "overlay:lite-design-module-implementation");
  assert(mindforgeLive.maxAdvances >= 7);
  assert.deepEqual(
    mindforgeLive.expectations.handoffEdgeSequencePrefix,
    [
      "derive_lite_design_adr_surface",
      "derive_lite_component_code_surface",
      "derive_lite_test_design_surface",
      "derive_lite_component_test_surface",
      "derive_lite_uat_test_source_surface",
      "prepare_test_execution_surface",
      "derive_test_execution_result_surface"
    ]
  );
  assert.deepEqual(mindforgeLive.expectations.requiredHandoffEdges, [
    "derive_lite_component_code_surface",
    "derive_lite_test_design_surface",
    "derive_lite_component_test_surface",
    "derive_lite_uat_test_source_surface",
    "prepare_test_execution_surface",
    "derive_test_execution_result_surface"
  ]);
  assert.equal(mindforgeLive.stopAfterWorkspaceFilesExist, false);
  assert.equal(mindforgeLive.stopAfterRequiredHandoffEdges, true);
  assert.deepEqual(
    mindforgeLive.expectations.processChecks[0].stdoutJson.equals.controlPath,
    mindforgeLive.expectedGovernanceOutput.controlPath
  );
  assert.deepEqual(
    mindforgeLive.expectations.processChecks[0].stdoutJson.equals.recertification,
    mindforgeLive.expectedGovernanceOutput.recertification
  );
  assert.deepEqual(
    mindforgeLive.expectations.processChecks[0].stdoutJson.arrayMembers.monitoring,
    mindforgeLive.expectedGovernanceOutput.monitoring
  );
  assert.notDeepEqual(
    mindforgeAiAssistantBaselineScenario.expectedGovernanceOutput,
    mindforgeLive.expectedGovernanceOutput
  );
});

test("scenario sandbox: live four-lane proof requires ABG-owned F_P branch frontier archive", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-live-frontier-"));
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260521T000000000Z_pid1"
  );
  mkdirSync(archiveRoot, { recursive: true });
  writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
    edgeName: "derive_component_code_surface"
  });
  writeJson(
    path.join(archiveRoot, "sdlc_live_fp_parallel_materialization_frontier.json"),
    {
      kind: "sdlc_live_fp_parallel_materialization_frontier",
      edgeName: "derive_component_code_surface",
      executionAuthority: "abg_evented_saga_frontier",
      parallelismControl: "abg_branch_execution_policy",
      selectedMethod: "parallel",
      laneCount: 4,
      devLaneCount: 2,
      testLaneCount: 2,
      fanInCount: 1,
      maxActive: 4,
      emittedEventKinds: [
        "branch_lease_acquired",
        "branch_payload_admitted",
        "branch_fan_in_projected"
      ],
      branchRows: [
        {
          branchRef: "branch://odd-sdlc/live/derive-component-code-surface/dev-src-hello-js",
          workerProcessRef: "worker-process://dev-hello",
          writeTerritoryRefs: ["workspace://build_tenants/app/src/hello.js"]
        },
        {
          branchRef: "branch://odd-sdlc/live/derive-component-code-surface/dev-src-world-js",
          workerProcessRef: "worker-process://dev-world",
          writeTerritoryRefs: ["workspace://build_tenants/app/src/world.js"]
        },
        {
          branchRef: "branch://odd-sdlc/live/derive-component-code-surface/test-test-hello-test-js",
          workerProcessRef: "worker-process://test-hello",
          writeTerritoryRefs: ["workspace://build_tenants/app/test/hello.test.js"]
        },
        {
          branchRef: "branch://odd-sdlc/live/derive-component-code-surface/test-test-world-test-js",
          workerProcessRef: "worker-process://test-world",
          writeTerritoryRefs: ["workspace://build_tenants/app/test/world.test.js"]
        }
      ],
      fanInRows: [
        {
          branchRef: "branch://odd-sdlc/t174/four-lane/fan-in",
          payloadDigest:
            "payload://odd-sdlc/live/derive-component-code-surface/fan-in"
        }
      ]
    }
  );
  const scenario = t174ParallelHelloWorldJsFourLaneLiveScenario({
    worker: "process://codex?model=gpt-5.5&effort=high"
  });

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        scenarioId: scenario.scenarioId,
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: scenario.scenarioId,
        expectations: {
          liveFpParallelMaterializationFrontier:
            scenario.expectations.liveFpParallelMaterializationFrontier
        }
      }
    )
  );
});

test("scenario sandbox: standalone ABG process proof does not satisfy live F_P branch frontier", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-live-frontier-missing-"));
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260521T000000000Z_pid1"
  );
  mkdirSync(archiveRoot, { recursive: true });
  writeJson(path.join(archiveRoot, "handoff_manifest.json"), {
    edgeName: "derive_component_code_surface"
  });
  const scenario = t174ParallelHelloWorldJsFourLaneLiveScenario({
    worker: "process://codex?model=gpt-5.5&effort=high"
  });

  assert.throws(
    () =>
      assertScenarioExpectations(
        {
          scenarioId: scenario.scenarioId,
          workspace,
          advances: [
            {
              gaps: { payload: {} },
              start: { payload: {} }
            }
          ]
        },
        {
          scenarioId: scenario.scenarioId,
          expectations: {
            liveFpParallelMaterializationFrontier:
              scenario.expectations.liveFpParallelMaterializationFrontier
          }
        }
      ),
    /standalone ABG process checks or single-worker materialization do not satisfy this proof/
  );
});

test("scenario sandbox: handoff sequence assertion tolerates same-edge retries", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-sequence-retry-"));
  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  mkdirSync(runsRoot, { recursive: true });
  [
    ["20260512T000000000Z_pid1", "first_edge"],
    ["20260512T000001000Z_pid1", "retry_edge"],
    ["20260512T000002000Z_pid1", "retry_edge"],
    ["20260512T000003000Z_pid1", "next_edge"]
  ].forEach(([runId, edgeName]) => {
    const runRoot = path.join(runsRoot, runId);
    mkdirSync(runRoot, { recursive: true });
    writeFileSync(
      path.join(runRoot, "handoff_manifest.json"),
      JSON.stringify({ edgeName }),
      "utf8"
    );
  });

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
          scenarioId: "retry-sequence-regression",
          expectations: {
            handoffEdgeSequencePrefix: ["first_edge", "retry_edge", "next_edge"],
            exactHandoffEdgeSequence: ["first_edge", "retry_edge", "next_edge"]
          }
        }
      )
    );
});

test("scenario sandbox: exact handoff sequence rejects post-close re-entry", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-exact-sequence-"));
  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  mkdirSync(runsRoot, { recursive: true });
  [
    ["20260512T000000000Z_pid1", "derive_intent_surface"],
    ["20260512T000001000Z_pid1", "derive_product_surface"],
    ["20260512T000002000Z_pid1", "prepare_release_surface"],
    ["20260512T000003000Z_pid1", "derive_product_surface"]
  ].forEach(([runId, edgeName]) => {
    const runRoot = path.join(runsRoot, runId);
    mkdirSync(runRoot, { recursive: true });
    writeFileSync(
      path.join(runRoot, "handoff_manifest.json"),
      JSON.stringify({ edgeName }),
      "utf8"
    );
  });

  assert.throws(
    () =>
      assertScenarioExpectations(
        {
          workspace,
          advances: [
            {
              gaps: { payload: {} },
              start: { payload: {} }
            }
          ]
        },
        {
          scenarioId: "exact-sequence-regression",
          expectations: {
            exactHandoffEdgeSequence: [
              "derive_intent_surface",
              "derive_product_surface",
              "prepare_release_surface"
            ]
          }
        }
      ),
    /exact handoff edge sequence mismatch/
  );
});

test("scenario sandbox: edge assurance archive sequence requires closed carriers", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-edge-archive-"));
  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  [
    ["20260512T000000000Z_pid1", "first_edge"],
    ["20260512T000001000Z_pid1", "retry_edge"],
    ["20260512T000002000Z_pid1", "retry_edge"],
    ["20260512T000003000Z_pid1", "next_edge"]
  ].forEach(([runId, edgeName]) => {
    writeEdgeAssuranceArchive(path.join(runsRoot, runId), edgeName, runId);
  });

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        scenarioId: "edge-assurance-archive-regression",
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: "edge-assurance-archive-regression",
        expectations: {
          edgeAssuranceArchiveSequencePrefix: [
            "first_edge",
            "retry_edge",
            "next_edge"
          ]
        }
      }
    )
  );

  writeJson(
    path.join(runsRoot, "20260512T000003000Z_pid1", "sdlc_edge_closure_decision.json"),
    {
      disposition: "retry",
      edgeGainRef: "gain:next_edge20260512T000003000Z_pid1",
      edgeAssuranceDecisionRef: "decision:next_edge20260512T000003000Z_pid1"
    }
  );
  assert.throws(
    () =>
      assertScenarioExpectations(
        {
          scenarioId: "edge-assurance-archive-negative-regression",
          workspace,
          advances: [
            {
              gaps: { payload: {} },
              start: { payload: {} }
            }
          ]
        },
        {
          scenarioId: "edge-assurance-archive-negative-regression",
          expectations: {
            edgeAssuranceArchiveSequencePrefix: [
              "first_edge",
              "retry_edge",
              "next_edge"
            ]
          }
        }
      ),
    /closure disposition retry, expected close/
  );
});

test("scenario sandbox: workspace file stop requires clean closure", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-file-stop-"));
  const archiveRoot = path.join(workspace, ".ai-workspace/runtime/odd_sdlc/operator-runs/run");
  mkdirSync(path.join(workspace, "build_tenants/app/src"), { recursive: true });
  mkdirSync(archiveRoot, { recursive: true });
  writeFileSync(path.join(workspace, "build_tenants/app/src/hello.js"), "", "utf8");
  writeFileSync(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json"),
    JSON.stringify({ disposition: "retry" }),
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "fp_evaluate_result.json"),
    JSON.stringify({ status: "blocked", postflightStatus: "blocked" }),
    "utf8"
  );

  assert.equal(
    scenarioWorkspaceFileStopSatisfied({
      workspace,
      files: ["build_tenants/app/src/hello.js"],
      archiveRoot
    }),
    false
  );

  writeFileSync(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json"),
    JSON.stringify({ disposition: "close" }),
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "fp_evaluate_result.json"),
    JSON.stringify({ status: "passed", postflightStatus: "passed" }),
    "utf8"
  );

  assert.equal(
    scenarioWorkspaceFileStopSatisfied({
      workspace,
      files: ["build_tenants/app/src/hello.js"],
      archiveRoot
    }),
    true
  );
});

test("scenario sandbox: graph close stop requires no selected next action", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-graph-close-stop-"));
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260512T000000000Z_pid1"
  );
  mkdirSync(archiveRoot, { recursive: true });
  writeJson(path.join(archiveRoot, "operator_summary.json"), {
    currentEdge: null,
    nextLawfulAction: "disposition://close"
  });
  writeJson(path.join(archiveRoot, "sdlc_edge_closure_decision.json"), {
    disposition: "close"
  });
  writeJson(path.join(archiveRoot, "sdlc_next_action_projection.json"), {
    selectedActionRef: "construction-action://odd-sdlc/post-close/derive_goal_surface",
    choosesNextTraversal: true
  });

  assert.equal(scenarioGraphCloseStopSatisfied(workspace), false);

  writeJson(path.join(archiveRoot, "sdlc_next_action_projection.json"), {
    selectedActionRef: null,
    choosesNextTraversal: false
  });

  assert.equal(scenarioGraphCloseStopSatisfied(workspace), true);
});

test("scenario sandbox: overlay continuation uses admitted next target after public start", () => {
  const scenario = {
    startTarget: "overlay:deep-sdlc-traversal",
    continueOnEdgeConverge: true
  };

  assert.equal(
    scenarioStartTargetForStep(scenario, 0),
    "overlay:deep-sdlc-traversal"
  );
  assert.equal(scenarioStartTargetForStep(scenario, 1), "next");
  assert.equal(scenarioStartTargetForStep(scenario, 2), "next");
  assert.equal(
    scenarioStartTargetForStep(
      {
        ...scenario,
        startTargetSequence: ["overlay:deep-sdlc-traversal", "graph_function:manual"]
      },
      1
    ),
    "graph_function:manual"
  );
});

test("scenario sandbox: latest archive JSON assertions audit runtime decisions", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-latest-json-"));
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260512T000000000Z_pid1"
  );
  mkdirSync(archiveRoot, { recursive: true });
  writeJson(path.join(archiveRoot, "sdlc_traversal_hop_selection.json"), {
    kind: "sdlc_traversal_hop_selection",
    hopClass: "single_hop",
    complexityAssessment: {
      inputObligationCount: 1,
      outputRowCount: 1
    },
    pressurePreservation: {
      admissionDecision: "admit"
    }
  });

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: "latest-json-regression",
        expectations: {
          latestArchiveJsonAssertions: [
            {
              file: "sdlc_traversal_hop_selection.json",
              equals: {
                kind: "sdlc_traversal_hop_selection",
                hopClass: "single_hop",
                "complexityAssessment.inputObligationCount": 1,
                "complexityAssessment.outputRowCount": 1,
                "pressurePreservation.admissionDecision": "admit"
              }
            }
          ]
        }
      }
    )
  );

  assert.throws(
    () =>
      assertScenarioExpectations(
        {
          workspace,
          advances: [
            {
              gaps: { payload: {} },
              start: { payload: {} }
            }
          ]
        },
        {
          scenarioId: "latest-json-negative-regression",
          expectations: {
            latestArchiveJsonAssertions: [
              {
                file: "sdlc_traversal_hop_selection.json",
                equals: {
                  hopClass: "dual_hop"
                }
              }
            ]
          }
        }
      ),
    /hopClass mismatch/
  );
});

test("scenario sandbox: workspace file evidence can span repair attempts", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-file-evidence-"));
  mkdirSync(path.join(workspace, "build_tenants/app/src"), { recursive: true });
  mkdirSync(path.join(workspace, "build_tenants/app/examples"), { recursive: true });
  writeFileSync(path.join(workspace, "build_tenants/app/package.json"), "{}", "utf8");
  writeFileSync(path.join(workspace, "build_tenants/app/src/index.js"), "", "utf8");
  writeFileSync(path.join(workspace, "build_tenants/app/examples/use_case.json"), "{}", "utf8");

  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  const firstRun = path.join(runsRoot, "20260512T000000000Z_pid1");
  const secondRun = path.join(runsRoot, "20260512T000001000Z_pid1");
  mkdirSync(firstRun, { recursive: true });
  mkdirSync(secondRun, { recursive: true });
  writeFileSync(
    path.join(firstRun, "product_materialization_manifest.json"),
    JSON.stringify({
      contract: { selectedOutputRoot: "build_tenants/app" },
      files: [
        { relativePath: "package.json" },
        { relativePath: "examples/use_case.json" }
      ]
    }),
    "utf8"
  );
  writeFileSync(
    path.join(secondRun, "product_materialization_manifest.json"),
    JSON.stringify({
      contract: { selectedOutputRoot: "build_tenants/app" },
      files: [{ relativePath: "src/index.js" }]
    }),
    "utf8"
  );

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: "materialization-evidence-regression",
        expectations: {
          workspaceFiles: [
            "build_tenants/app/package.json",
            "build_tenants/app/src/index.js",
            "build_tenants/app/examples/use_case.json"
          ],
          materializationEvidenceWorkspaceFiles: [
            "build_tenants/app/package.json",
            "build_tenants/app/src/index.js",
            "build_tenants/app/examples/use_case.json"
          ]
        }
      }
    )
  );

  assert.throws(
    () =>
      assertScenarioExpectations(
        {
          workspace,
          advances: [
            {
              gaps: { payload: {} },
              start: { payload: {} }
            }
          ]
        },
        {
          scenarioId: "materialization-evidence-negative-regression",
          expectations: {
            workspaceFiles: ["build_tenants/app/src/index.js"],
            materializationEvidenceWorkspaceFiles: [
              "build_tenants/app/src/missing-ledgered-file.js"
            ]
          }
        }
      ),
    /has no materialization ledger evidence/
  );
});

test("scenario sandbox: process checks can assert JSON stdout fields", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-process-json-"));
  writeFileSync(
    path.join(workspace, "emit-json.mjs"),
    "console.log(JSON.stringify({status:'ok', monitoring:['model_change']}));\n",
    "utf8"
  );

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: "process-json-regression",
        expectations: {
          processChecks: [
            {
              command: "node",
              args: ["emit-json.mjs"],
              stdoutJson: {
                hasKeys: ["status", "monitoring"],
                equals: { status: "ok" },
                arrayMembers: { monitoring: ["model_change"] }
              }
            }
          ]
        }
      }
    )
  );
});

test("scenario sandbox: execution evidence expectation is graph-edge owned", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-execution-evidence-"));
  const runRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260608T000000000Z_pid1"
  );
  mkdirSync(runRoot, { recursive: true });
  writeEdgeAssuranceArchive(runRoot, "derive_test_execution_result_surface");
  const stdoutPath = path.join(runRoot, "installed_operator_execution/rust.stdout.log");
  const evidencePath = path.join(runRoot, "test_execution_result_surface.json");
  mkdirSync(path.dirname(stdoutPath), { recursive: true });
  writeFileSync(stdoutPath, "helloworld\n", "utf8");
  writeJson(path.join(runRoot, "worker_result_report.json"), {
    kind: "sdlc_worker_result_report",
    targetAssetType: "test_execution_result_surface",
    outputFile: evidencePath
  });
  writeJson(evidencePath, {
    kind: "sdlc_worker_execution_evidence",
    lane: "test",
    command: "cargo run --quiet && curl http://127.0.0.1:18182/",
    status: "succeeded",
    reportRefs: [stdoutPath],
    testsObserved: 1,
    passedCount: 1,
    failedCount: 0,
    shardEvidence: [
      {
        kind: "sdlc_worker_execution_shard_evidence",
        shardId: "test-shard-01-rust",
        moduleName: "hello_world_rust_service",
        lane: "test",
        command: "cargo run --quiet && curl http://127.0.0.1:18182/",
        status: "succeeded",
        reportRefs: [stdoutPath],
        testsObserved: 1,
        passedCount: 1,
        failedCount: 0
      }
    ]
  });

  assert.doesNotThrow(() =>
    assertScenarioExpectations(
      {
        workspace,
        advances: [
          {
            gaps: { payload: {} },
            start: { payload: {} }
          }
        ]
      },
      {
        scenarioId: "execution-evidence-regression",
        expectations: {
          requiredHandoffEdges: ["derive_test_execution_result_surface"],
          executionEvidence: {
            edgeName: "derive_test_execution_result_surface",
            status: "succeeded",
            commandIncludes: "cargo run",
            stdoutIncludes: "helloworld"
          }
        }
      }
    )
  );
});

const T131_LIVE_ENABLED = process.env["ODD_SDLC_TS_T131_ODD_CHAT_SCENARIO_LIVE"] === "1";
const T131_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T131_ODD_CHAT_SCENARIO_WORKER"] ?? "process://claude";
const T131_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T131_ODD_CHAT_SCENARIO_MAX_ADVANCES"] ?? "12",
  10
);

test(
  "scenario sandbox: T-131 odd_chat live build loop (opt-in)",
  { skip: T131_LIVE_ENABLED ? false : "ODD_SDLC_TS_T131_ODD_CHAT_SCENARIO_LIVE=1 not set" },
  async () => {
    const scenario = t131OddChatLiveScenario({
      worker: T131_LIVE_WORKER,
      maxAdvances: T131_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const RUST_MIN_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_HELLO_WORLD_RUST_MINIMUM_INDUCTION_SCENARIO_LIVE"] === "1";
const RUST_MIN_LIVE_WORKER =
  process.env["ODD_SDLC_TS_HELLO_WORLD_RUST_MINIMUM_INDUCTION_SCENARIO_WORKER"] ??
  "process://claude";
const RUST_MIN_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_HELLO_WORLD_RUST_MINIMUM_INDUCTION_SCENARIO_MAX_ADVANCES"] ?? "16",
  10
);

test(
  "scenario sandbox: minimum Rust hello-world live build loop (opt-in)",
  {
    skip: RUST_MIN_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_HELLO_WORLD_RUST_MINIMUM_INDUCTION_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = helloWorldRustMinimumInductionLiveScenario({
      worker: RUST_MIN_LIVE_WORKER,
      maxAdvances: RUST_MIN_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T132_LIVE_ENABLED = process.env["ODD_SDLC_TS_T132_HELLO_WORLD_JS_SCENARIO_LIVE"] === "1";
const T132_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T132_HELLO_WORLD_JS_SCENARIO_WORKER"] ?? "process://claude";

test(
  "scenario sandbox: T-132 JavaScript hello-world live build loop (opt-in)",
  { skip: T132_LIVE_ENABLED ? false : "ODD_SDLC_TS_T132_HELLO_WORLD_JS_SCENARIO_LIVE=1 not set" },
  async () => {
    const scenario = t132HelloWorldJsLiveScenario({
      worker: T132_LIVE_WORKER
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T200_JS_ZOOM_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T200_HELLO_WORLD_JS_ZOOM_SCENARIO_LIVE"] === "1";
const T200_JS_ZOOM_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T200_HELLO_WORLD_JS_ZOOM_SCENARIO_WORKER"] ??
  "process://claude";
const T200_JS_ZOOM_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T200_HELLO_WORLD_JS_ZOOM_SCENARIO_MAX_ADVANCES"] ?? "24",
  10
);

test(
  "scenario sandbox: T-200 JavaScript hello-world deep SDLC zoom live build loop (opt-in)",
  {
    skip: T200_JS_ZOOM_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T200_HELLO_WORLD_JS_ZOOM_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t132HelloWorldJsDeepSdlcZoomLiveScenario({
      worker: T200_JS_ZOOM_LIVE_WORKER,
      maxAdvances: T200_JS_ZOOM_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T133_LIVE_ENABLED = process.env["ODD_SDLC_TS_T133_HELLO_WORLD_RUST_SCENARIO_LIVE"] === "1";
const T133_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T133_HELLO_WORLD_RUST_SCENARIO_WORKER"] ?? "process://claude";
const T133_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T133_HELLO_WORLD_RUST_SCENARIO_MAX_ADVANCES"] ?? "16",
  10
);

test(
  "scenario sandbox: T-133 Rust hello-world live build loop (opt-in)",
  { skip: T133_LIVE_ENABLED ? false : "ODD_SDLC_TS_T133_HELLO_WORLD_RUST_SCENARIO_LIVE=1 not set" },
  async () => {
    const scenario = t133HelloWorldRustLiveScenario({
      worker: T133_LIVE_WORKER,
      maxAdvances: T133_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T160_LITE_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_JS_LITE_SCENARIO_LIVE"] === "1";
const T160_LITE_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_JS_LITE_SCENARIO_WORKER"] ??
  "process://claude";
const T160_LITE_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_JS_LITE_SCENARIO_MAX_ADVANCES"] ?? "4",
  10
);

test(
  "scenario sandbox: T-160 JavaScript hello-world lite live build loop (opt-in)",
  {
    skip: T160_LITE_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T160_HELLO_WORLD_JS_LITE_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t160HelloWorldJsLiteLiveScenario({
      worker: T160_LITE_LIVE_WORKER,
      maxAdvances: T160_LITE_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T160_RUST_LITE_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_RUST_LITE_SCENARIO_LIVE"] === "1";
const T160_RUST_LITE_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_RUST_LITE_SCENARIO_WORKER"] ??
  "process://claude";
const T160_RUST_LITE_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T160_HELLO_WORLD_RUST_LITE_SCENARIO_MAX_ADVANCES"] ?? "4",
  10
);

test(
  "scenario sandbox: T-160 Rust hello-world lite live build loop (opt-in)",
  {
    skip: T160_RUST_LITE_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T160_HELLO_WORLD_RUST_LITE_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t160HelloWorldRustLiteLiveScenario({
      worker: T160_RUST_LITE_LIVE_WORKER,
      maxAdvances: T160_RUST_LITE_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T164_RUST_SERVICE_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T164_RUST_HELLO_SERVICE_SCENARIO_LIVE"] === "1";
const T164_RUST_SERVICE_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T164_RUST_HELLO_SERVICE_SCENARIO_WORKER"] ??
  "process://claude";
const T164_RUST_SERVICE_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T164_RUST_HELLO_SERVICE_SCENARIO_MAX_ADVANCES"] ?? "16",
  10
);

test(
  "scenario sandbox: T-164 Rust hello service live build loop (opt-in)",
  {
    skip: T164_RUST_SERVICE_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T164_RUST_HELLO_SERVICE_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t164RustHelloServiceLiteLiveScenario({
      worker: T164_RUST_SERVICE_LIVE_WORKER,
      maxAdvances: T164_RUST_SERVICE_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T174_PARALLEL_HELLO_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T174_PARALLEL_HELLO_WORLD_JS_SCENARIO_LIVE"] === "1";
const T174_PARALLEL_HELLO_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T174_PARALLEL_HELLO_WORLD_JS_SCENARIO_WORKER"] ??
  "process://claude";
const T174_PARALLEL_HELLO_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T174_PARALLEL_HELLO_WORLD_JS_SCENARIO_MAX_ADVANCES"] ??
    "16",
  10
);

test(
  "scenario sandbox: T-174 parallel hello-world JS live build loop (opt-in)",
  {
    skip: T174_PARALLEL_HELLO_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T174_PARALLEL_HELLO_WORLD_JS_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t174ParallelHelloWorldJsLiveScenario({
      worker: T174_PARALLEL_HELLO_LIVE_WORKER,
      maxAdvances: T174_PARALLEL_HELLO_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const T174_FOUR_LANE_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_T174_FOUR_LANE_HELLO_WORLD_JS_SCENARIO_LIVE"] ===
  "1";
const T174_FOUR_LANE_LIVE_WORKER =
  process.env["ODD_SDLC_TS_T174_FOUR_LANE_HELLO_WORLD_JS_SCENARIO_WORKER"] ??
  "process://claude";
const T174_FOUR_LANE_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_T174_FOUR_LANE_HELLO_WORLD_JS_SCENARIO_MAX_ADVANCES"] ??
    "16",
  10
);

test(
  "scenario sandbox: T-174 parallel hello-world JS four-lane live build loop (opt-in)",
  {
    skip: T174_FOUR_LANE_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_T174_FOUR_LANE_HELLO_WORLD_JS_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = t174ParallelHelloWorldJsFourLaneLiveScenario({
      worker: T174_FOUR_LANE_LIVE_WORKER,
      maxAdvances: T174_FOUR_LANE_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);

const MINDFORGE_LIVE_ENABLED =
  process.env["ODD_SDLC_TS_MINDFORGE_AI_ASSISTANT_SCENARIO_LIVE"] === "1";
const MINDFORGE_LIVE_WORKER =
  process.env["ODD_SDLC_TS_MINDFORGE_AI_ASSISTANT_SCENARIO_WORKER"] ??
  "process://claude";
const MINDFORGE_LIVE_VARIANT =
  process.env["ODD_SDLC_TS_MINDFORGE_AI_ASSISTANT_SCENARIO_VARIANT"] ??
  "third_party_model_variant";
const MINDFORGE_LIVE_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_MINDFORGE_AI_ASSISTANT_SCENARIO_MAX_ADVANCES"] ?? "3",
  10
);

test(
  "scenario sandbox: T-163 MindForge AI assistant live build loop (opt-in)",
  {
    skip: MINDFORGE_LIVE_ENABLED
      ? false
      : "ODD_SDLC_TS_MINDFORGE_AI_ASSISTANT_SCENARIO_LIVE=1 not set"
  },
  async () => {
    const scenario = mindforgeAiAssistantLiveScenario({
      worker: MINDFORGE_LIVE_WORKER,
      variant: MINDFORGE_LIVE_VARIANT,
      maxAdvances: MINDFORGE_LIVE_MAX_ADVANCES
    });
    const result = await runScenarioSandbox(scenario);
    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
  }
);
