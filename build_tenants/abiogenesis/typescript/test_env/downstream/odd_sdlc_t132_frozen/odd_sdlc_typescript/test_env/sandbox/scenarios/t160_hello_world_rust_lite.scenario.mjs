// T-160 Rust hello-world lite traversal scenario.
// Starts from loaded project authority and selects the bounded lite overlay
// instead of the current full traversal.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t160_hello_world_rust_lite");

export const T160_HELLO_WORLD_RUST_LITE_FIXTURE_ROOT = FIXTURE_ROOT;
export const T160_HELLO_WORLD_RUST_LITE_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  ".ai-workspace/context/project_bootstrap.md",
  "build_tenants/TENANT_REGISTRY.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/GOALS.md",
  "specification/requirements/00-imported-sources.md",
  "specification/requirements/01-hello-world-rust.md"
]);

export const t160HelloWorldRustLiteScenario = Object.freeze({
  scenarioId: "scenario_t160_hello_world_rust_lite",
  installedPackageName: "odd-sdlc-scenario-t160-hello-world-rust-lite",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T160_HELLO_WORLD_RUST_LITE_SOURCE_FILES
  },
  expectations: {
    terminalStatus: "blocked"
  },
  startTarget: "overlay:lite-design-module-implementation",
  startUntil: "first_traversal",
  maxAdvances: 1
});

export function t160HelloWorldRustLiteLiveScenario({
  worker,
  maxAdvances = 4,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t160HelloWorldRustLiteLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t160HelloWorldRustLiteScenario,
    scenarioId: "scenario_t160_hello_world_rust_lite_live",
    installedPackageName: "odd-sdlc-scenario-t160-hello-world-rust-lite-live",
    expectations: {
      workspaceFiles: [
        "build_tenants/hello_world_rust/Cargo.toml",
        "build_tenants/hello_world_rust/src/main.rs"
      ],
      handoffEdgeSequencePrefix: [
        "derive_lite_design_adr_surface",
        "derive_lite_component_code_surface",
        "derive_lite_test_design_surface",
        "derive_lite_component_test_surface",
        "derive_lite_uat_test_source_surface",
        "prepare_test_execution_surface",
        "derive_test_execution_result_surface"
      ],
      requiredHandoffEdges: [
        "derive_lite_component_code_surface",
        "derive_lite_test_design_surface",
        "derive_lite_component_test_surface",
        "derive_lite_uat_test_source_surface",
        "prepare_test_execution_surface",
        "derive_test_execution_result_surface"
      ],
      executionEvidence: {
        edgeName: "derive_test_execution_result_surface",
        status: "succeeded",
        commandIncludes: "cargo run",
        stdoutIncludes: "Hello, world!"
      },
      latestArchiveArtifacts: [
        "worker_result_report.json",
        "declared_edge_projection_artifact.json"
      ]
    },
    liveWorker: worker,
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: false,
    stopAfterRequiredHandoffEdges: true
  });
}
