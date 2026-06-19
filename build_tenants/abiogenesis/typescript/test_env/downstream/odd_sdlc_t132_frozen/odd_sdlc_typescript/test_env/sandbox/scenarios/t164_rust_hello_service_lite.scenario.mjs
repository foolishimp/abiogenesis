// T-164 Rust hello service lite traversal scenario.
// Builds a minimal Rust HTTP service and verifies it through the SDLC
// test-execution-result edge.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
} from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t164_rust_hello_service_lite");

export const T164_RUST_HELLO_SERVICE_LITE_FIXTURE_ROOT = FIXTURE_ROOT;
export const T164_RUST_HELLO_SERVICE_LITE_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  "build_tenants/hello_world_rust_service/spec/TECH_STACK.json"
]);

export const T164_RUST_HELLO_SERVICE_REQUIREMENT_IDS = Object.freeze([
  "REQ-T164-RUST-SVC-001",
  "REQ-T164-RUST-SVC-002",
  "REQ-T164-RUST-SVC-003",
  "REQ-T164-RUST-SVC-004",
  "REQ-T164-RUST-SVC-005"
]);

export const t164RustHelloServiceLiteScenario = Object.freeze({
  scenarioId: "scenario_t164_rust_hello_service_lite",
  installedPackageName: "odd-sdlc-scenario-t164-rust-hello-service-lite",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T164_RUST_HELLO_SERVICE_LITE_SOURCE_FILES
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
    requirementIds: T164_RUST_HELLO_SERVICE_REQUIREMENT_IDS,
    archiveArtifacts: ["conform_project_report.json"]
  },
  startTarget: "overlay:bootstrap-requirements",
  startUntil: "first_traversal",
  maxAdvances: 1
});

export function t164RustHelloServiceLiteLiveScenario({
  worker,
  maxAdvances = 16,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t164RustHelloServiceLiteLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t164RustHelloServiceLiteScenario,
    scenarioId: "scenario_t164_rust_hello_service_lite_live",
    installedPackageName:
      "odd-sdlc-scenario-t164-rust-hello-service-lite-live",
    expectations: {
      workspaceFiles: [
        "build_tenants/hello_world_rust_service/Cargo.toml",
        "build_tenants/hello_world_rust_service/src/main.rs"
      ],
      materializationEvidenceWorkspaceFiles: [
        "build_tenants/hello_world_rust_service/Cargo.toml",
        "build_tenants/hello_world_rust_service/src/main.rs"
      ],
      handoffEdgeSequencePrefix: [
        "derive_intent_surface",
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
      edgeAssuranceArchiveSequencePrefix: [
        "derive_intent_surface",
        "derive_lite_design_adr_surface",
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
        stdoutIncludes: "helloworld"
      },
      latestArchiveArtifacts: [
        "worker_result_report.json",
        "declared_edge_projection_artifact.json"
      ]
    },
    liveWorker: worker,
    startTarget: "next",
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: false,
    stopAfterRequiredHandoffEdges: true
  });
}
