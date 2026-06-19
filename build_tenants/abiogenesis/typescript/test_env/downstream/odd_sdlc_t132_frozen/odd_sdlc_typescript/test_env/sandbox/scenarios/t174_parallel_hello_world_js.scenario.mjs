// T-174 parallel hello-world JavaScript scenario.
// Minimal behavior, non-trivial topology: hello branch + world branch + fan-in.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
} from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t174_parallel_hello_world_js");

export const T174_PARALLEL_HELLO_WORLD_JS_FIXTURE_ROOT = FIXTURE_ROOT;
export const T174_PARALLEL_HELLO_WORLD_JS_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  "build_tenants/parallel_hello_world/spec/TECH_STACK.json",
  "tools/run_t174_four_lane_frontier.mjs"
]);

export const T174_PARALLEL_HELLO_WORLD_JS_FOCUSED_SOURCE_FILES = Object.freeze([
  ...T174_PARALLEL_HELLO_WORLD_JS_SOURCE_FILES,
  ".ai-workspace/context/project_bootstrap.md",
  "build_tenants/TENANT_REGISTRY.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/GOALS.md",
  "specification/requirements/README.md",
  "specification/requirements/01-parallel-hello-world.md",
  "build_tenants/parallel_hello_world/design/adrs/ADR-002-implementation-design-surface.md",
  "build_tenants/parallel_hello_world/design/adrs/ADR-003-test-design-surface.md"
]);

export const T174_PARALLEL_HELLO_WORLD_REQUIREMENT_IDS = Object.freeze([
  "REQ-T174-PARALLEL-HELLO-001",
  "REQ-T174-PARALLEL-HELLO-002",
  "REQ-T174-PARALLEL-HELLO-003",
  "REQ-T174-PARALLEL-HELLO-004",
  "REQ-T174-PARALLEL-HELLO-005",
  "REQ-T174-PARALLEL-HELLO-006",
  "REQ-T174-PARALLEL-HELLO-007"
]);

export const T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES = Object.freeze([
  "build_tenants/parallel_hello_world/package.json",
  "build_tenants/parallel_hello_world/src/hello.js",
  "build_tenants/parallel_hello_world/src/world.js",
  "build_tenants/parallel_hello_world/test/hello.test.js",
  "build_tenants/parallel_hello_world/test/world.test.js",
  "build_tenants/parallel_hello_world/src/index.js"
]);

export const T174_PARALLEL_HELLO_WORLD_LITE_EDGES = Object.freeze([
  "derive_intent_surface",
  "derive_lite_design_adr_surface",
  "derive_lite_component_code_surface",
  "derive_lite_test_design_surface",
  "derive_lite_component_test_surface",
  "derive_lite_uat_test_source_surface"
]);

export const t174ParallelHelloWorldJsScenario = Object.freeze({
  scenarioId: "scenario_t174_parallel_hello_world_js",
  installedPackageName: "odd-sdlc-scenario-t174-parallel-hello-world-js",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T174_PARALLEL_HELLO_WORLD_JS_SOURCE_FILES,
    copySourceFilesOnly: true
  },
  expectations: {
    firstEdge: FG_CONFORM_PROJECT,
    firstStartStatus: "converged",
    firstEventKinds: [
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "vector_evaluated",
      "vector_closed"
    ],
    firstStartTargetGraphFunction: FG_CONFORM_PROJECT,
    firstStartOverlayRef: SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
    archiveArtifacts: ["conform_project_report.json"]
  },
  startTarget: "overlay:bootstrap-requirements",
  startUntil: "first_traversal",
  maxAdvances: 1
});

export const t174ParallelHelloWorldJsFourLaneFrontierScenario = Object.freeze({
  ...t174ParallelHelloWorldJsScenario,
  scenarioId: "scenario_t174_parallel_hello_world_js_four_lane_frontier",
  installedPackageName:
    "odd-sdlc-scenario-t174-parallel-hello-world-js-four-lane",
  expectations: {
    ...t174ParallelHelloWorldJsScenario.expectations,
    processChecks: [
      {
        command: "node",
        args: ["tools/run_t174_four_lane_frontier.mjs"],
        cwd: ".",
        exitCode: 0,
        stdoutJson: {
          hasKeys: ["oddSdlcVersion", "abgVersion"],
          equals: {
            scenario: "t174_four_lane_hello_world_frontier",
            sdlcAuthority: "topology_and_proportionality_declaration",
            executionAuthority: "abg_evented_saga_frontier",
            parallelismControl: "abg_branch_execution_policy",
            selectedMethod: "parallel",
            abgPolicyMaxConcurrency: 4,
            parallelGroupCount: 4,
            declarationCount: 5,
            laneCount: 4,
            devLaneCount: 2,
            testLaneCount: 2,
            fanInCount: 1,
            batchCount: 2,
            abgSelectedFirstBatchLaneCount: 4,
            completedCount: 5,
            failedCount: 0,
            maxActive: 4,
            leaseAcquiredCount: 5,
            payloadAdmittedCount: 5,
            leaseReleasedCount: 5,
            fanInProjectedCount: 2
          },
          arrayEquals: {
            batchSizes: [4, 1],
            replayPayloadDigests: [
              "payload://dev/hello",
              "payload://dev/world",
              "payload://test/hello",
              "payload://test/world",
              "payload://four-lane/hello-world"
            ]
          },
          arrayMembers: {
            firstBatchLaneRefs: [
              "branch://odd-sdlc/t174/four-lane/dev-hello",
              "branch://odd-sdlc/t174/four-lane/dev-world",
              "branch://odd-sdlc/t174/four-lane/test-hello",
              "branch://odd-sdlc/t174/four-lane/test-world"
            ]
          }
        }
      }
    ]
  }
});

export function t174ParallelHelloWorldJsLiveScenario({
  worker,
  maxAdvances = 16,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t174ParallelHelloWorldJsLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t174ParallelHelloWorldJsScenario,
    scenarioId: "scenario_t174_parallel_hello_world_js_live",
    installedPackageName:
      "odd-sdlc-scenario-t174-parallel-hello-world-js-live",
    fixture: {
      root: FIXTURE_ROOT,
      sourceFiles: T174_PARALLEL_HELLO_WORLD_JS_FOCUSED_SOURCE_FILES,
      copySourceFilesOnly: true
    },
    expectations: {
      workspaceFiles: [
        ...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES
      ],
      materializationEvidenceWorkspaceFiles: [
        ...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES
      ],
      handoffEdgeSequencePrefix: T174_PARALLEL_HELLO_WORLD_LITE_EDGES,
      edgeAssuranceArchiveSequencePrefix: T174_PARALLEL_HELLO_WORLD_LITE_EDGES,
      processChecks: [
        {
          command: "node",
          args: [
            "--input-type=module",
            "-e",
            "const m = await import('./src/index.js'); console.log(await m.helloWorld());"
          ],
          cwd: "build_tenants/parallel_hello_world",
          stdout: "hello world",
          exitCode: 0
        },
        {
          command: "node",
          args: [
            "--test",
            "test/hello.test.js",
            "test/world.test.js"
          ],
          cwd: "build_tenants/parallel_hello_world",
          exitCode: 0
        }
      ],
      latestArchiveArtifacts: [
        "sdlc_overlay_segment_completion.json"
      ]
    },
    liveWorker: worker,
    startTarget: "overlay:lite-design-module-implementation",
    startTargetSequence: Object.freeze([
      "overlay:bootstrap-requirements",
      "overlay:bootstrap-requirements"
    ]),
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: true
  });
}

export function t174ParallelHelloWorldJsFourLaneLiveScenario(input) {
  const scenario = t174ParallelHelloWorldJsLiveScenario(input);
  return Object.freeze({
    ...scenario,
    scenarioId: "scenario_t174_parallel_hello_world_js_four_lane_live",
    installedPackageName:
      "odd-sdlc-scenario-t174-parallel-hello-world-js-four-lane-live",
    expectations: {
      workspaceFiles: [...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES],
      materializationEvidenceWorkspaceFiles: [
        ...T174_PARALLEL_HELLO_WORLD_FOUR_LANE_FILES
      ],
      handoffEdgeSequencePrefix: [
        "derive_component_code_surface",
        "derive_component_test_surface"
      ],
      edgeAssuranceArchiveSequencePrefix: [
        "derive_component_code_surface",
        "derive_component_test_surface"
      ],
      liveFpParallelMaterializationFrontier: {
        edgeName: "derive_component_code_surface",
        artifact: "sdlc_live_fp_parallel_materialization_frontier.json",
        equals: {
          kind: "sdlc_live_fp_parallel_materialization_frontier",
          edgeName: "derive_component_code_surface",
          executionAuthority: "abg_evented_saga_frontier",
          parallelismControl: "abg_branch_execution_policy",
          selectedMethod: "parallel",
          laneCount: 4,
          devLaneCount: 2,
          testLaneCount: 2,
          fanInCount: 1
        },
        atLeast: {
          maxActive: 4
        },
        requiredBranchRefs: [
          "branch://odd-sdlc/live/derive-component-code-surface/dev-src-hello-js",
          "branch://odd-sdlc/live/derive-component-code-surface/dev-src-world-js",
          "branch://odd-sdlc/live/derive-component-code-surface/test-test-hello-test-js",
          "branch://odd-sdlc/live/derive-component-code-surface/test-test-world-test-js"
        ],
        requireBranchWorkerProcessRefs: true,
        requireDisjointWriteTerritories: true,
        requiredEventKinds: [
          "branch_lease_acquired",
          "branch_payload_admitted",
          "branch_fan_in_projected"
        ],
        requiredFanInPayloadDigest:
          "payload://odd-sdlc/live/derive-component-code-surface/fan-in"
      },
      processChecks: [
        ...t174ParallelHelloWorldJsFourLaneFrontierScenario.expectations
          .processChecks,
        ...scenario.expectations.processChecks
      ]
    },
    startTarget: "graph_function:derive_component_test_surface",
    startTargetSequence: Object.freeze([
      "graph_function:derive_component_code_surface",
      "graph_function:derive_component_test_surface"
    ]),
    startUntil: "first_traversal",
    maxAdvances: input.maxAdvances ?? 4,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: true
  });
}
