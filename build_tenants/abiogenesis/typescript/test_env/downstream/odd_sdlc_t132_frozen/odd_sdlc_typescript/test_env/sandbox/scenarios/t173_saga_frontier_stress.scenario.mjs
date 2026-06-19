// T-173 saga frontier stress scenario.
// Replays ABG's 50-way, three-deep synthetic frontier through an installed
// odd_sdlc sandbox and installed package imports.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF
} from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t173_saga_frontier_stress");

export const T173_SAGA_FRONTIER_STRESS_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  "build_tenants/saga_frontier_stress/spec/TECH_STACK.json",
  "tools/run_t141_saga_frontier_stress.mjs"
]);

export const t173SagaFrontierStressScenario = Object.freeze({
  scenarioId: "scenario_t173_saga_frontier_stress",
  installedPackageName: "odd-sdlc-scenario-t173-saga-frontier-stress",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T173_SAGA_FRONTIER_STRESS_SOURCE_FILES
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
    archiveArtifacts: ["conform_project_report.json"],
    processChecks: [
      {
        command: "node",
        args: ["tools/run_t141_saga_frontier_stress.mjs"],
        cwd: ".",
        exitCode: 0,
        stdoutJson: {
          equals: {
            scenario: "t173_saga_frontier_stress",
            selectedMethod: "parallel",
            rootCount: 50,
            reducerCount: 10,
            leafCount: 5,
            declarationCount: 65,
            dependencyMapNodeCount: 65,
            parallelGroupCount: 50,
            maxActive: 50,
            batchCount: 3,
            completedCount: 65,
            failedCount: 0,
            leaseAcquiredCount: 65,
            payloadAdmittedCount: 65,
            leaseReleasedCount: 65,
            fanInProjectedCount: 3,
            activeLeaseCount: 0,
            releasedLeaseCount: 65
          },
          arrayEquals: {
            batchSizes: [50, 10, 5]
          }
        }
      }
    ]
  },
  startTarget: "overlay:bootstrap-requirements",
  startUntil: "first_traversal",
  maxAdvances: 1
});
