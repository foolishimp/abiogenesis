// Minimum Rust hello-world induction scenario.
// This is the loose-input lane: Fg_conform_project materializes the bootstrap
// read model, canonical constraints, and tenant registry from input.md plus
// constraints.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FG_CONFORM_PROJECT } from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/hello_world_rust_minimum_induction");

export const HELLO_WORLD_RUST_MINIMUM_INDUCTION_FIXTURE_ROOT = FIXTURE_ROOT;
export const HELLO_WORLD_RUST_MINIMUM_INDUCTION_SOURCE_FILES = Object.freeze([
  "README.md",
  "input.md",
  ".ai-workspace/context/project_constraints.yml"
]);
export const HELLO_WORLD_RUST_MINIMUM_INDUCTION_REQUIREMENT_IDS = Object.freeze([
  "REQ-HWRUSTMIN-001",
  "REQ-HWRUSTMIN-002",
  "REQ-HWRUSTMIN-003",
  "REQ-HWRUSTMIN-004",
  "REQ-HWRUSTMIN-005"
]);

export const helloWorldRustMinimumInductionScenario = Object.freeze({
  scenarioId: "scenario_hello_world_rust_minimum_induction",
  installedPackageName: "odd-sdlc-scenario-hello-world-rust-minimum-induction",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: HELLO_WORLD_RUST_MINIMUM_INDUCTION_SOURCE_FILES
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
    requirementIds: HELLO_WORLD_RUST_MINIMUM_INDUCTION_REQUIREMENT_IDS,
    workspaceFiles: [
      ".ai-workspace/context/project_bootstrap.md",
      ".ai-workspace/context/project_constraints.yml",
      "build_tenants/TENANT_REGISTRY.md"
    ],
    archiveArtifacts: ["conform_project_report.json"]
  },
  maxAdvances: 1
});

export function helloWorldRustMinimumInductionLiveScenario({
  worker,
  maxAdvances = 16,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("helloWorldRustMinimumInductionLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...helloWorldRustMinimumInductionScenario,
    scenarioId: "scenario_hello_world_rust_minimum_induction_live",
    installedPackageName: "odd-sdlc-scenario-hello-world-rust-minimum-induction-live",
    expectations: {
      ...helloWorldRustMinimumInductionScenario.expectations,
      workspaceFiles: [
        ".ai-workspace/context/project_bootstrap.md",
        "specification/INTENT.md",
        "specification/PRODUCT.md",
        "specification/GOALS.md",
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
