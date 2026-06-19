// T-160 JavaScript hello-world lite traversal scenario.
// Starts from loaded project authority and selects the bounded lite overlay
// instead of the current full traversal.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t160_hello_world_js_lite");

export const T160_HELLO_WORLD_JS_LITE_FIXTURE_ROOT = FIXTURE_ROOT;
export const T160_HELLO_WORLD_JS_LITE_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  ".ai-workspace/context/project_bootstrap.md",
  "build_tenants/TENANT_REGISTRY.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/GOALS.md",
  "specification/requirements/00-imported-sources.md",
  "specification/requirements/01-hello-world.md"
]);

export const t160HelloWorldJsLiteScenario = Object.freeze({
  scenarioId: "scenario_t160_hello_world_js_lite",
  installedPackageName: "odd-sdlc-scenario-t160-hello-world-js-lite",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T160_HELLO_WORLD_JS_LITE_SOURCE_FILES
  },
  expectations: {
    terminalStatus: "blocked"
  },
  startTarget: "overlay:lite-design-module-implementation",
  startUntil: "first_traversal",
  maxAdvances: 1
});

const T160_HELLO_WORLD_OVERLAY_MATRIX = Object.freeze([
  Object.freeze({
    id: "current_full_traversal",
    overlayHandle: "current-full-traversal",
    overlayRef: "overlay://odd-sdlc/current-full-traversal",
    targetGraphFunction: "derive_intent_surface"
  }),
  Object.freeze({
    id: "bootstrap_requirements",
    overlayHandle: "bootstrap-requirements",
    overlayRef: "overlay://odd-sdlc/bootstrap-requirements",
    targetGraphFunction: "bootstrap_requirements"
  }),
  Object.freeze({
    id: "solution_architecture",
    overlayHandle: "solution-architecture",
    overlayRef: "overlay://odd-sdlc/solution-architecture",
    targetGraphFunction: "solution_architecture"
  }),
  Object.freeze({
    id: "lite_design_module_implementation",
    overlayHandle: "lite-design-module-implementation",
    overlayRef: "overlay://odd-sdlc/lite-design-module-implementation",
    targetGraphFunction: "lite_design_module_implementation"
  })
]);

export const t160HelloWorldJsOverlayScenarios = Object.freeze(
  T160_HELLO_WORLD_OVERLAY_MATRIX.map((row) =>
    Object.freeze({
      ...t160HelloWorldJsLiteScenario,
      scenarioId: `scenario_t160_hello_world_js_overlay_${row.id}`,
      installedPackageName: `odd-sdlc-scenario-t160-hello-world-js-overlay-${row.id.replaceAll("_", "-")}`,
      expectations: {
        terminalStatus: "blocked",
        firstStartStatus: "blocked",
        firstStartOverlayRef: row.overlayRef,
        firstStartTargetGraphFunction: row.targetGraphFunction
      },
      startTarget: `overlay:${row.overlayHandle}`,
      maxAdvances: 1
    })
  )
);

export function t160HelloWorldJsLiteLiveScenario({
  worker,
  maxAdvances = 8,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t160HelloWorldJsLiteLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t160HelloWorldJsLiteScenario,
    scenarioId: "scenario_t160_hello_world_js_lite_live",
    installedPackageName: "odd-sdlc-scenario-t160-hello-world-js-lite-live",
    expectations: {
      workspaceFiles: [
        "build_tenants/hello_world_javascript/src/hello.js"
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
        commandIncludes: "node",
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
