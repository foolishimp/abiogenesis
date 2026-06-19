// T-133 Rust hello-world scenario.
// Shares the generic scenario sandbox harness used by data_mapper and T-131.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FG_CONFORM_PROJECT } from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t133_rust_hello_world_minimal");

export const T133_HELLO_WORLD_RUST_FIXTURE_ROOT = FIXTURE_ROOT;
export const T133_HELLO_WORLD_RUST_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml"
]);
export const T133_HELLO_WORLD_RUST_REQUIREMENT_IDS = Object.freeze([
  "REQ-T133-001",
  "REQ-T133-002",
  "REQ-T133-003",
  "REQ-T133-004",
  "REQ-T133-005"
]);

export const t133HelloWorldRustScenario = Object.freeze({
  scenarioId: "scenario_t133_hello_world_rust",
  installedPackageName: "odd-sdlc-scenario-t133-hello-world-rust",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T133_HELLO_WORLD_RUST_SOURCE_FILES
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
    requirementIds: T133_HELLO_WORLD_RUST_REQUIREMENT_IDS,
    archiveArtifacts: ["conform_project_report.json"]
  },
  maxAdvances: 1
});

export function t133HelloWorldRustLiveScenario({
  worker,
  maxAdvances = 16,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t133HelloWorldRustLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t133HelloWorldRustScenario,
    scenarioId: "scenario_t133_hello_world_rust_live",
    installedPackageName: "odd-sdlc-scenario-t133-hello-world-rust-live",
    expectations: {
      ...t133HelloWorldRustScenario.expectations,
      workspaceFiles: [
        "build_tenants/hello_world_rust/Cargo.toml",
        "build_tenants/hello_world_rust/src/main.rs"
      ],
      processChecks: [
        {
          command: "cargo",
          args: ["run", "--quiet"],
          cwd: "build_tenants/hello_world_rust",
          stdout: "Hello, world!"
        }
      ]
    },
    liveWorker: worker,
    startTarget: "next",
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: true
  });
}
