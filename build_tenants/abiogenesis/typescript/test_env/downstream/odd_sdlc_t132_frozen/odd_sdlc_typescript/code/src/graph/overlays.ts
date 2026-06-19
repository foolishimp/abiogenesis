import {
  deriveAllowedConsequenceTraversalCatalogFromGtl,
  materializeGraphFunction,
  type AllowedConsequenceTraversalActionKind,
  type AllowedConsequenceTraversalFamily,
  type GraphFunction,
  type Module
} from "@abiogenesis/typescript-tenant";
import { parseNonEmptyString } from "../shared/validation.js";
import { sha256Text } from "../shared/digest.js";
import {
  FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
  FG_DERIVE_UAT_TEST_SOURCE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  FG_PREPARE_TEST_EXECUTION_SURFACE,
  OPERATIONAL_FUNCTION_CATALOG,
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
  FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
  type SdlcGraphFunctionCatalog
} from "./catalog.js";
import {
  FG_CONFORM_PROJECT
} from "./library.js";
import {
  sdlcGraphFunctionBoundaryRef,
  sdlcGraphVectorBoundaryRef
} from "./boundary_refs.js";
import {
  assertSdlcEdgeGainClosureMatrix,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
} from "./edge_gain_closure_contracts.js";
import {
  normalizeSdlcTraversalOverlayRef,
  sdlcTraversalOverlayRefForStrategy,
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  SDLC_DEFAULT_TRAVERSAL_OVERLAY_REF,
  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  SDLC_PROFILE_OVERLAY_STRATEGY_VALUES,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF,
  SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
  type SdlcTraversalOverlayRef
} from "../shared/overlay_strategy.js";

export type SdlcOverlayBindingRef = `overlay-binding://odd-sdlc/${string}`;
export type SdlcOverlayPolicyRef = `policy://odd-sdlc/overlay/${string}`;
export type SdlcGraphCatalogDigestRef = `graph-catalog-digest://odd-sdlc/${string}`;
export type SdlcOverlayComputeRegime = "f_p" | "f_d" | "f_h";
export type SdlcOverlayStopDisposition =
  | "overlay_segment_complete"
  | "product_converged"
  | "blocked";
export type SdlcOverlayAssetBindingMode = "material" | "planned_from_template";
export type SdlcOverlayReentryDisposition = "retry" | "repair" | "re-enter";

export {
  SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  SDLC_DEFAULT_TRAVERSAL_OVERLAY_REF,
  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  SDLC_PROFILE_OVERLAY_STRATEGY_VALUES,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF,
  SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
  sdlcTraversalOverlayRefForStrategy
} from "../shared/overlay_strategy.js";
export type { SdlcTraversalOverlayRef } from "../shared/overlay_strategy.js";

function isSdlcOverlayPolicyRef(value: string): value is SdlcOverlayPolicyRef {
  return value.startsWith("policy://odd-sdlc/overlay/") &&
    value.length > "policy://odd-sdlc/overlay/".length;
}

function isSdlcOverlayBindingRef(value: string): value is SdlcOverlayBindingRef {
  return value.startsWith("overlay-binding://odd-sdlc/") &&
    value.length > "overlay-binding://odd-sdlc/".length;
}

function admitSdlcOverlayPolicyRef(
  value: string,
  label: string
): SdlcOverlayPolicyRef {
  if (!isSdlcOverlayPolicyRef(value)) {
    throw new TypeError(`${label}: expected policy://odd-sdlc/overlay/... ref`);
  }
  return value;
}

function admitSdlcOverlayBindingRef(
  value: string,
  label: string
): SdlcOverlayBindingRef {
  if (!isSdlcOverlayBindingRef(value)) {
    throw new TypeError(`${label}: expected overlay-binding://odd-sdlc/... ref`);
  }
  return value;
}

function isSdlcOverlayReentryDisposition(
  value: string
): value is SdlcOverlayReentryDisposition {
  return value === "retry" || value === "repair" || value === "re-enter";
}

export interface SdlcTraversalOverlayTermination {
  readonly policyRef: SdlcOverlayPolicyRef;
  readonly terminalAssetTypes: readonly string[];
  readonly terminalGraphFunctionRefs: readonly string[];
  readonly lawfulStopDispositions: readonly SdlcOverlayStopDisposition[];
  readonly requiresEvalAdmission: boolean;
  readonly remainingGraphPressureRefs: readonly string[];
  readonly remainingRequirementPressureRefs: readonly string[];
  readonly remainingAssetPressureRefs: readonly string[];
  readonly nextEligibleOverlayRefs: readonly SdlcTraversalOverlayRef[];
}

export interface SdlcOverlayAssetTemplate {
  readonly kind: "sdlc_overlay_asset_template";
  readonly assetType: string;
  readonly defaultPath: string;
  readonly producerGraphFunctionRef: string;
  readonly terminalRole: "terminal_asset" | "supporting_asset";
  readonly templateRef: string;
}

export interface SdlcOverlayAssetBinding {
  readonly kind: "sdlc_overlay_asset_binding";
  readonly bindingRef: string;
  readonly assetType: string;
  readonly mode: SdlcOverlayAssetBindingMode;
  readonly assetRef: string;
  readonly relativePath: string;
  readonly producerGraphFunctionRef: string;
  readonly terminalRole: "terminal_asset" | "supporting_asset";
  readonly templateRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcOverlayLedgerRequirement {
  readonly edgeRef: string;
  readonly computeRegime: SdlcOverlayComputeRegime;
  readonly requiredLedgerKinds: readonly string[];
  readonly closureRequiresLedger: boolean;
}

export interface SdlcOverlayReentryRoute {
  readonly kind: "sdlc_overlay_reentry_route";
  readonly routeRef: string;
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly terminalGraphFunctionRef: string;
  readonly sourceGraphVectorName: string;
  readonly sourceGraphVectorRef: string;
  readonly targetGraphVectorName: string;
  readonly targetGraphVectorRef: string;
  readonly targetNodeRef: string;
  readonly closureDispositions: readonly SdlcOverlayReentryDisposition[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcOverlayAllowedConsequenceTraversalDeclaration {
  readonly kind: "sdlc_overlay_allowed_consequence_traversal_declaration";
  readonly declarationRef: string;
  readonly rowRef: string;
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly traversalFamily: AllowedConsequenceTraversalFamily;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly edgeRef: string;
  readonly allowedActionKinds: readonly AllowedConsequenceTraversalActionKind[];
  readonly allowedGraphFunctionRefs: readonly string[];
  readonly allowedTraversalTargetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
  readonly declarationSourceRefs: readonly string[];
}

export interface SdlcTraversalOverlay {
  readonly kind: "sdlc_traversal_overlay";
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly aliases: readonly SdlcTraversalOverlayRef[];
  readonly name: string;
  readonly intent: string;
  readonly graphFunctionRefs: readonly string[];
  readonly graphVectorRefs: readonly string[];
  readonly graphCatalogDigestRef: SdlcGraphCatalogDigestRef;
  readonly publicStartTargets: readonly string[];
  readonly defaultStartTarget: string;
  readonly policies: {
    readonly workspaceObservationPolicyRef: SdlcOverlayPolicyRef;
    readonly evalPolicyRef: SdlcOverlayPolicyRef;
    readonly refinementPolicyRef: SdlcOverlayPolicyRef;
    readonly traversalStrategyPlanRef: SdlcOverlayPolicyRef | null;
  };
  readonly termination: SdlcTraversalOverlayTermination;
  readonly assetTemplates: readonly SdlcOverlayAssetTemplate[];
  readonly requiredLedgersByEdge: readonly SdlcOverlayLedgerRequirement[];
  readonly reentryRoutes: readonly SdlcOverlayReentryRoute[];
  readonly allowedConsequenceTraversalDeclarations:
    readonly SdlcOverlayAllowedConsequenceTraversalDeclaration[];
  readonly predecessorOverlayRefs: readonly SdlcTraversalOverlayRef[];
  readonly annotations: readonly SdlcTraversalOverlayAnnotation[];
}

export interface SdlcTraversalOverlayCatalog {
  readonly kind: "sdlc_traversal_overlay_catalog";
  readonly catalogRef: "overlay-catalog://odd-sdlc/ts-v1";
  readonly catalogDigestRef: SdlcGraphCatalogDigestRef;
  readonly graphCatalogDigestRef: SdlcGraphCatalogDigestRef;
  readonly overlays: readonly SdlcTraversalOverlay[];
}

export interface SdlcTraversalOverlayGraphContinuation {
  readonly kind: "sdlc_traversal_overlay_graph_continuation";
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly terminalGraphFunctionRef: string;
  readonly completedGraphFunctionRef: string;
  readonly completedGraphVectorRef: string;
  readonly nextGraphFunctionRef: string;
  readonly nextGraphVectorRef: string;
  readonly targetNodeRef: string;
  readonly sequenceIndex: number;
}

export interface SdlcOverlayBinding {
  readonly kind: "sdlc_overlay_binding";
  readonly bindingRef: SdlcOverlayBindingRef;
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly graphCatalogDigestRef: SdlcGraphCatalogDigestRef;
  readonly workspaceBasis: {
    readonly workspaceRootUri: string;
    readonly workspaceIdentityRef: string;
    readonly preActionWorkspaceObservationRef: string;
    readonly preActionWorkspaceFingerprintRef: string;
    readonly postActionWorkspaceObservationRef: string | null;
    readonly postActionWorkspaceFingerprintRef: string | null;
    readonly workspaceDeltaRef: string | null;
  };
  readonly selection: {
    readonly selectedGraphFunctionRef: string;
    readonly selectedGraphVectorRef: string | null;
    readonly selectedStartTargetRef: string;
    readonly requestedBy: "public_start" | "archive_replay" | "operator_resume";
  };
  readonly assetBindings: readonly SdlcOverlayAssetBinding[];
  readonly annotationRefs: readonly string[];
  readonly zoomGraphFunctionRefs: readonly string[];
  readonly zoomTargetGraphFunctionRefs: readonly string[];
  readonly priorLedgerRefs: readonly string[];
  readonly priorEventRefs: readonly string[];
  readonly remainingGraphPressureRefs: readonly string[];
  readonly remainingRequirementPressureRefs: readonly string[];
  readonly remainingAssetPressureRefs: readonly string[];
  readonly nextEligibleOverlayRefs: readonly SdlcTraversalOverlayRef[];
  readonly freshnessPolicyRef: SdlcOverlayPolicyRef;
  readonly predecessorRefs: readonly string[];
}

export interface SdlcOverlayStartTarget {
  readonly name: string;
  readonly graphFunctionRef: string;
  readonly jobName: string;
  readonly overlayRefs: readonly SdlcTraversalOverlayRef[];
  readonly defaultForOverlayRefs: readonly SdlcTraversalOverlayRef[];
}

interface OverlayDefinition {
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly aliases?: readonly SdlcTraversalOverlayRef[];
  readonly name: string;
  readonly intent: string;
  readonly graphFunctionNames: readonly string[];
  readonly publicStartTargets: readonly string[];
  readonly defaultStartTarget: string;
  readonly terminalAssetTypes: readonly string[];
  readonly terminalGraphFunctionNames: readonly string[];
  readonly lawfulStopDispositions: readonly SdlcOverlayStopDisposition[];
  readonly assetTemplates: readonly {
    readonly assetType: string;
    readonly defaultPath: string;
    readonly producerGraphFunctionName: string;
    readonly terminalRole: "terminal_asset" | "supporting_asset";
  }[];
  readonly reentryRoutes?: readonly {
    readonly terminalGraphFunctionName: string;
    readonly sourceGraphVectorName: string;
    readonly targetGraphVectorName: string;
    readonly closureDispositions: readonly SdlcOverlayReentryDisposition[];
    readonly reasonRefs: readonly string[];
  }[];
  readonly predecessorOverlayRefs?: readonly SdlcTraversalOverlayRef[];
  readonly nextEligibleOverlayRefs?: readonly SdlcTraversalOverlayRef[];
  readonly annotations?: readonly SdlcTraversalOverlayAnnotationDefinition[];
}

export interface SdlcTraversalOverlayAnnotation {
  readonly kind: "sdlc_traversal_overlay_annotation";
  readonly annotationRef: string;
  readonly annotationKind:
    | "baseline_full_sdlc_traversal"
    | "deep_sdlc_traversal_candidate"
    | "ticket_workflow_fd_fp_composition";
  readonly parentOverlayRef: SdlcTraversalOverlayRef | null;
  readonly depthTraversalEligible: boolean;
  readonly decompositionTraceRequired: boolean;
  readonly abgRuntimeAuthorityOnly: true;
  readonly zoomGraphFunctionRef: string | null;
  readonly zoomTargetGraphFunctionRefs: readonly string[];
  readonly proofRefs: readonly string[];
}

interface SdlcTraversalOverlayAnnotationDefinition {
  readonly annotationKind: SdlcTraversalOverlayAnnotation["annotationKind"];
  readonly parentOverlayRef?: SdlcTraversalOverlayRef | null;
  readonly depthTraversalEligible: boolean;
  readonly decompositionTraceRequired: boolean;
  readonly zoomGraphFunctionRef?: string | null;
  readonly zoomTargetGraphFunctionRefs?: readonly string[];
  readonly proofRefs: readonly string[];
}

function graphFunctionByName(module: Module): ReadonlyMap<string, GraphFunction> {
  return new Map(
    module.graphFunctions.map((graphFunction) => [graphFunction.name, graphFunction])
  );
}

function graphCatalogDigestRef(module: Module): SdlcGraphCatalogDigestRef {
  const digest = sha256Text(
    JSON.stringify(
      module.graphFunctions
        .map((graphFunction) => {
          const graph = materializeGraphFunction(graphFunction);
          return {
            name: graphFunction.name,
            vectors: graph.vectors.map((vector) => ({
              name: vector.name,
              source: vector.source.map((node) => node.name),
              target: vector.target.name
            }))
          };
        })
        .sort((left, right) => left.name.localeCompare(right.name))
    )
  );
  return `graph-catalog-digest://odd-sdlc/${digest.slice("sha256:".length)}`;
}

function publishedGraphVectorRefs(module: Module): readonly string[] {
  const refs = new Set<string>();
  for (const graphFunction of module.graphFunctions) {
    const graph = materializeGraphFunction(graphFunction);
    for (const vector of graph.vectors) {
      refs.add(sdlcGraphVectorBoundaryRef(vector));
    }
  }
  return Object.freeze([...refs]);
}

function policyRef(overlayRef: SdlcTraversalOverlayRef, policy: string): SdlcOverlayPolicyRef {
  return admitSdlcOverlayPolicyRef(
    `${overlayRef.replace("overlay://odd-sdlc/", "policy://odd-sdlc/overlay/")}/${policy}`,
    "overlay.policyRef"
  );
}

function pressureRef(overlayRef: SdlcTraversalOverlayRef, pressure: string): string {
  return `${overlayRef}/remaining-pressure/${pressure}`;
}

function templateRef(input: {
  readonly overlayRef: SdlcTraversalOverlayRef;
  readonly assetType: string;
}): string {
  return `${input.overlayRef}/asset-template/${encodeURIComponent(input.assetType)}`;
}

function catalogFunctionNames(
  entries: readonly { readonly name: string }[]
): readonly string[] {
  return Object.freeze(entries.map((entry) => entry.name));
}

function uniqueNames(names: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      unique.push(name);
    }
  }
  return Object.freeze(unique);
}

const DEEP_SDLC_CODE_TEST_ZOOM_TARGETS = Object.freeze([
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "derive_test_design_surface",
  "derive_component_test_surface",
  FG_DERIVE_UAT_TEST_SOURCE_SURFACE,
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface"
] as const);

function overlayDefinitions(): readonly OverlayDefinition[] {
  const currentFullGraphFunctionNames = uniqueNames([
    FG_CONFORM_PROJECT,
    "bootstrap_release_self_test",
    "release_operational_cycle",
    ...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
    ...catalogFunctionNames(OPERATIONAL_FUNCTION_CATALOG)
  ]);
  const liteGraphFunctionNames = Object.freeze([
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
    FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
    FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
    FG_PREPARE_TEST_EXECUTION_SURFACE,
    FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
  ]);
  const frameworkSmokeMinFpGraphFunctionNames = Object.freeze([
    FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
    FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
    FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
    FG_PREPARE_TEST_EXECUTION_SURFACE,
    FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
  ]);
  return [
    {
      overlayRef: SDLC_TICKET_WORKFLOW_OVERLAY_REF,
      aliases: Object.freeze([
        "overlay://odd-sdlc/tickets",
        "overlay://odd-sdlc/governed-ticket-workflow"
      ] as const),
      name: "ticket_workflow",
      intent: "Governed ticket workflow overlay: validate ticket authority, route the admitted work item, and return control to ABG public-start/runtime continuation.",
      graphFunctionNames: Object.freeze(["route_ticket_work_item"]),
      publicStartTargets: Object.freeze(["route_ticket_work_item"]),
      defaultStartTarget: "route_ticket_work_item",
      terminalAssetTypes: Object.freeze(["ticket_work_item_route_surface"]),
      terminalGraphFunctionNames: Object.freeze(["route_ticket_work_item"]),
      lawfulStopDispositions: Object.freeze(["overlay_segment_complete", "blocked"]),
      annotations: Object.freeze([
        {
          annotationKind: "ticket_workflow_fd_fp_composition",
          parentOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
          depthTraversalEligible: false,
          decompositionTraceRequired: false,
          zoomGraphFunctionRef: null,
          zoomTargetGraphFunctionRefs: Object.freeze([]),
          proofRefs: Object.freeze([
            "proof://odd-sdlc/t162/ticket-workflow-overlay",
            "proof://odd-sdlc/t162/fd-ticket-admission-before-fp-route"
          ])
        }
      ]),
      assetTemplates: Object.freeze([
        {
          assetType: "ticket_work_item_route_surface",
          defaultPath: "design/ticket_work_item_route_surface.md",
          producerGraphFunctionName: "route_ticket_work_item",
          terminalRole: "terminal_asset"
        }
      ])
    },
    {
      overlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
      aliases: Object.freeze([
        "overlay://odd-sdlc/bootstrap-heavy",
        "overlay://odd-sdlc/operational-cycle"
      ] as const),
      name: "current_full_traversal",
      intent: "Current full traversal over the consolidated SDLC graph spine.",
      graphFunctionNames: currentFullGraphFunctionNames,
      publicStartTargets: Object.freeze([
        "derive_intent_surface",
        "bootstrap_release_self_test",
        "release_operational_cycle"
      ]),
      defaultStartTarget: "derive_intent_surface",
      terminalAssetTypes: Object.freeze(["release_surface", "retrofit_plan_surface"]),
      terminalGraphFunctionNames: Object.freeze([
        "bootstrap_release_self_test",
        "release_operational_cycle"
      ]),
      lawfulStopDispositions: Object.freeze(["product_converged", "blocked"]),
      annotations: Object.freeze([
        {
          annotationKind: "baseline_full_sdlc_traversal",
          parentOverlayRef: null,
          depthTraversalEligible: false,
          decompositionTraceRequired: false,
          zoomGraphFunctionRef: null,
          zoomTargetGraphFunctionRefs: Object.freeze([]),
          proofRefs: Object.freeze([
            "proof://odd-sdlc/current-full-traversal/baseline"
          ])
        }
      ]),
      assetTemplates: Object.freeze([
        {
          assetType: "release_surface",
          defaultPath: "release/release_surface.md",
          producerGraphFunctionName: "bootstrap_release_self_test",
          terminalRole: "terminal_asset"
        },
        {
          assetType: "retrofit_plan_surface",
          defaultPath: "runtime/retrofit_plan_surface.md",
          producerGraphFunctionName: "release_operational_cycle",
          terminalRole: "terminal_asset"
        }
      ])
    },
    {
      overlayRef: SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
      aliases: Object.freeze([
        "overlay://odd-sdlc/deep-sdlc",
        "overlay://odd-sdlc/depth-traversal"
      ] as const),
      name: "deep_sdlc_traversal",
      intent: "Annotated duplicate of current full traversal for T-200 depth/decomposition work; it preserves the full SDLC graph sequence while carrying explicit depth-traversal pressure.",
      graphFunctionNames: currentFullGraphFunctionNames,
      publicStartTargets: Object.freeze([
        "derive_intent_surface",
        "bootstrap_release_self_test",
        "release_operational_cycle"
      ]),
      defaultStartTarget: "derive_intent_surface",
      terminalAssetTypes: Object.freeze(["release_surface", "retrofit_plan_surface"]),
      terminalGraphFunctionNames: Object.freeze([
        "bootstrap_release_self_test",
        "release_operational_cycle"
      ]),
      lawfulStopDispositions: Object.freeze(["product_converged", "blocked"]),
      annotations: Object.freeze([
        {
          annotationKind: "deep_sdlc_traversal_candidate",
          parentOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
          depthTraversalEligible: true,
          decompositionTraceRequired: true,
          zoomGraphFunctionRef: FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
          zoomTargetGraphFunctionRefs: DEEP_SDLC_CODE_TEST_ZOOM_TARGETS,
          proofRefs: Object.freeze([
            "proof://odd-sdlc/t200/depth-traversal-overlay",
            "proof://odd-sdlc/t200/decomposition-trace-required"
          ])
        }
      ]),
      assetTemplates: Object.freeze([
        {
          assetType: "release_surface",
          defaultPath: "release/release_surface.md",
          producerGraphFunctionName: "bootstrap_release_self_test",
          terminalRole: "terminal_asset"
        },
        {
          assetType: "retrofit_plan_surface",
          defaultPath: "runtime/retrofit_plan_surface.md",
          producerGraphFunctionName: "release_operational_cycle",
          terminalRole: "terminal_asset"
        }
      ])
    },
    {
      overlayRef: SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
      aliases: Object.freeze([
        "overlay://odd-sdlc/min-fp",
        "overlay://odd-sdlc/framework-smoke"
      ] as const),
      name: "framework_smoke_min_fp",
      intent: "Complexity-admitted Min(F_P) traversal for framework-smoke products whose pressure is proportional and proven by test execution.",
      graphFunctionNames: frameworkSmokeMinFpGraphFunctionNames,
      publicStartTargets: Object.freeze([FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE]),
      defaultStartTarget: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
      terminalAssetTypes: Object.freeze(["test_execution_result_surface"]),
      terminalGraphFunctionNames: Object.freeze([
        FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
      ]),
      lawfulStopDispositions: Object.freeze(["product_converged", "blocked"]),
      assetTemplates: Object.freeze([
        {
          assetType: "component_code_surface",
          defaultPath: "design/component_code_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "implementation_design_surface",
          defaultPath: "design/adrs/ADR-002-implementation-design-surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_design_surface",
          defaultPath: "design/adrs/ADR-003-test-design-surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "component_test_surface",
          defaultPath: "design/component_test_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "uat_test_source_surface",
          defaultPath: "design/uat_test_source_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_execution_surface",
          defaultPath: "design/test_execution_surface.md",
          producerGraphFunctionName: FG_PREPARE_TEST_EXECUTION_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_execution_result_surface",
          defaultPath: "design/test_execution_result_surface.md",
          producerGraphFunctionName: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
          terminalRole: "terminal_asset"
        }
      ]),
      reentryRoutes: Object.freeze([
        {
          terminalGraphFunctionName: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
          sourceGraphVectorName: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
          targetGraphVectorName: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
          closureDispositions: Object.freeze([
            "repair"
          ] satisfies readonly SdlcOverlayReentryDisposition[]),
          reasonRefs: Object.freeze([
            "overlay-reentry://odd-sdlc/framework-smoke-min-fp/test-execution-failed/component-code"
          ])
        }
      ])
    },
    {
      overlayRef: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
      name: "lite_design_module_implementation",
      intent: "Small software-change traversal from composite implementation design to product materialization and test execution proof.",
      graphFunctionNames: liteGraphFunctionNames,
      publicStartTargets: Object.freeze([
        FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
      ]),
      defaultStartTarget: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
      terminalAssetTypes: Object.freeze(["test_execution_result_surface"]),
      terminalGraphFunctionNames: Object.freeze([
        FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
      ]),
      lawfulStopDispositions: Object.freeze(["overlay_segment_complete", "blocked"]),
      assetTemplates: Object.freeze([
        {
          assetType: "component_code_surface",
          defaultPath: "design/component_code_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "implementation_design_surface",
          defaultPath: "design/adrs/ADR-002-implementation-design-surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_design_surface",
          defaultPath: "design/adrs/ADR-003-test-design-surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "component_test_surface",
          defaultPath: "design/component_test_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "uat_test_source_surface",
          defaultPath: "design/uat_test_source_surface.md",
          producerGraphFunctionName: FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_execution_surface",
          defaultPath: "design/test_execution_surface.md",
          producerGraphFunctionName: FG_PREPARE_TEST_EXECUTION_SURFACE,
          terminalRole: "supporting_asset"
        },
        {
          assetType: "test_execution_result_surface",
          defaultPath: "design/test_execution_result_surface.md",
          producerGraphFunctionName: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
          terminalRole: "terminal_asset"
        }
      ]),
      reentryRoutes: Object.freeze([
        {
          terminalGraphFunctionName: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
          sourceGraphVectorName: FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
          targetGraphVectorName: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
          closureDispositions: Object.freeze([
            "repair"
          ] satisfies readonly SdlcOverlayReentryDisposition[]),
          reasonRefs: Object.freeze([
            "overlay-reentry://odd-sdlc/lite-design-module-implementation/test-execution-failed/component-code"
          ])
        }
      ]),
      predecessorOverlayRefs: Object.freeze([
        SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
        SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF
      ]),
      nextEligibleOverlayRefs: Object.freeze([SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF])
    },
    {
      overlayRef: SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
      name: "solution_architecture",
      intent: "Requirements-to-detailed-design traversal that stops before implementation materialization.",
      graphFunctionNames: Object.freeze([FG_SOLUTION_ARCHITECTURE_EXECUTIVE]),
      publicStartTargets: Object.freeze([FG_SOLUTION_ARCHITECTURE_EXECUTIVE]),
      defaultStartTarget: FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
      terminalAssetTypes: Object.freeze(["implementation_design_surface"]),
      terminalGraphFunctionNames: Object.freeze([FG_SOLUTION_ARCHITECTURE_EXECUTIVE]),
      lawfulStopDispositions: Object.freeze(["overlay_segment_complete", "blocked"]),
      assetTemplates: Object.freeze([
        {
          assetType: "implementation_design_surface",
          defaultPath: "design/implementation_design_surface.md",
          producerGraphFunctionName: FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
          terminalRole: "terminal_asset"
        }
      ]),
      predecessorOverlayRefs: Object.freeze([SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF]),
      nextEligibleOverlayRefs: Object.freeze([
        SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
        SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
      ])
    },
    {
      overlayRef: SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
      name: "bootstrap_requirements",
      intent: "Bootstrap traversal from initial unstructured input to admitted requirements authority.",
      graphFunctionNames: Object.freeze([
        FG_CONFORM_PROJECT,
        FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE
      ]),
      publicStartTargets: Object.freeze([FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE]),
      defaultStartTarget: FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
      terminalAssetTypes: Object.freeze(["requirement_surface"]),
      terminalGraphFunctionNames: Object.freeze([FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE]),
      lawfulStopDispositions: Object.freeze(["overlay_segment_complete", "blocked"]),
      assetTemplates: Object.freeze([
        {
          assetType: "requirement_surface",
          defaultPath: "specification/requirements/",
          producerGraphFunctionName: FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
          terminalRole: "terminal_asset"
        }
      ]),
      nextEligibleOverlayRefs: Object.freeze([
        SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF,
        SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
      ])
    }
  ] as const satisfies readonly OverlayDefinition[];
}

function graphFunctionRefsFor(input: {
  readonly byName: ReadonlyMap<string, GraphFunction>;
  readonly names: readonly string[];
  readonly overlayRef: SdlcTraversalOverlayRef;
}): readonly string[] {
  return Object.freeze(
    input.names.map((name) => {
      const graphFunction = input.byName.get(name);
      if (graphFunction === undefined) {
        throw new TypeError(`${input.overlayRef}: unpublished graph function ${name}`);
      }
      return sdlcGraphFunctionBoundaryRef(graphFunction);
    })
  );
}

function graphVectorRefsFor(input: {
  readonly byName: ReadonlyMap<string, GraphFunction>;
  readonly names: readonly string[];
  readonly overlayRef: SdlcTraversalOverlayRef;
}): readonly string[] {
  return Object.freeze(
    input.names.flatMap((name) => {
      const graphFunction = input.byName.get(name);
      if (graphFunction === undefined) {
        throw new TypeError(`${input.overlayRef}: unpublished graph function ${name}`);
      }
      return materializeGraphFunction(graphFunction).vectors.map((vector) =>
        sdlcGraphVectorBoundaryRef(vector)
      );
    })
  );
}

function allowedConsequenceTraversalDeclarationsForOverlay(input: {
  readonly byName: ReadonlyMap<string, GraphFunction>;
  readonly names: readonly string[];
  readonly overlayRef: SdlcTraversalOverlayRef;
}): readonly SdlcOverlayAllowedConsequenceTraversalDeclaration[] {
  const overlaySegment = `/${encodeURIComponent(input.overlayRef)}/`;
  const declarations: SdlcOverlayAllowedConsequenceTraversalDeclaration[] = [];
  for (const name of input.names) {
    const graphFunction = input.byName.get(name);
    if (graphFunction === undefined) {
      throw new TypeError(`${input.overlayRef}: unpublished graph function ${name}`);
    }
    const graph = materializeGraphFunction(graphFunction);
    for (const [vectorIndex, vector] of graph.vectors.entries()) {
      const catalog = deriveAllowedConsequenceTraversalCatalogFromGtl({
        graphFunction,
        graphVector: vector,
        vectorIndex,
        edgeRef: vector.name
      });
      for (const row of catalog.rows) {
        if (!row.rowRef.includes(overlaySegment)) {
          continue;
        }
        declarations.push(Object.freeze({
          kind: "sdlc_overlay_allowed_consequence_traversal_declaration" as const,
          declarationRef: [
            input.overlayRef,
            "allowed-consequence-traversal",
            encodeURIComponent(row.graphFunctionRef),
            encodeURIComponent(row.graphVectorRef),
            row.traversalFamily
          ].join("/"),
          rowRef: row.rowRef,
          overlayRef: input.overlayRef,
          traversalFamily: row.traversalFamily,
          graphFunctionRef: row.graphFunctionRef,
          graphVectorRef: row.graphVectorRef,
          edgeRef: row.edgeRef,
          allowedActionKinds: row.allowedActionKinds,
          allowedGraphFunctionRefs: row.allowedGraphFunctionRefs,
          allowedTraversalTargetRefs: row.allowedTraversalTargetRefs,
          requiredAuthorityRefs: row.requiredAuthorityRefs,
          proportionalityBasisRefs: row.proportionalityBasisRefs,
          declarationSourceRefs: row.declarationSourceRefs
        }));
      }
    }
  }
  const byRef = new Map(
    declarations.map((declaration) => [declaration.declarationRef, declaration])
  );
  return Object.freeze([...byRef.values()]);
}

function overlayFromDefinition(input: {
  readonly definition: OverlayDefinition;
  readonly byName: ReadonlyMap<string, GraphFunction>;
  readonly digestRef: SdlcGraphCatalogDigestRef;
}): SdlcTraversalOverlay {
  const graphFunctionRefs = graphFunctionRefsFor({
    byName: input.byName,
    names: input.definition.graphFunctionNames,
    overlayRef: input.definition.overlayRef
  });
  const terminalGraphFunctionRefs = graphFunctionRefsFor({
    byName: input.byName,
    names: input.definition.terminalGraphFunctionNames,
    overlayRef: input.definition.overlayRef
  });
  const graphVectorRefs = graphVectorRefsFor({
    byName: input.byName,
    names: input.definition.graphFunctionNames,
    overlayRef: input.definition.overlayRef
  });
  const allowedConsequenceTraversalDeclarations =
    allowedConsequenceTraversalDeclarationsForOverlay({
      byName: input.byName,
      names: input.definition.graphFunctionNames,
      overlayRef: input.definition.overlayRef
    });
  const assetTemplates = Object.freeze(
    input.definition.assetTemplates.map((template) => {
      const producer = input.byName.get(template.producerGraphFunctionName);
      if (producer === undefined) {
        throw new TypeError(
          `${input.definition.overlayRef}: unpublished asset template producer ${template.producerGraphFunctionName}`
        );
      }
      return Object.freeze({
        kind: "sdlc_overlay_asset_template" as const,
        assetType: template.assetType,
        defaultPath: template.defaultPath,
        producerGraphFunctionRef: sdlcGraphFunctionBoundaryRef(producer),
        terminalRole: template.terminalRole,
        templateRef: templateRef({
          overlayRef: input.definition.overlayRef,
          assetType: template.assetType
        })
      });
    })
  );
  const reentryRoutes = Object.freeze(
    (input.definition.reentryRoutes ?? Object.freeze([])).map((route) => {
      const terminalGraphFunction = input.byName.get(route.terminalGraphFunctionName);
      if (terminalGraphFunction === undefined) {
        throw new TypeError(
          `${input.definition.overlayRef}: unpublished reentry route terminal ${route.terminalGraphFunctionName}`
        );
      }
      const vectors = materializeGraphFunction(terminalGraphFunction).vectors;
      const sourceVector = vectors.find(
        (vector) =>
          vector.name === route.sourceGraphVectorName ||
          sdlcGraphVectorBoundaryRef(vector) === route.sourceGraphVectorName
      );
      if (sourceVector === undefined) {
        throw new TypeError(
          `${input.definition.overlayRef}: reentry source vector ${route.sourceGraphVectorName} is not in ${route.terminalGraphFunctionName}`
        );
      }
      const targetVector = vectors.find(
        (vector) =>
          vector.name === route.targetGraphVectorName ||
          sdlcGraphVectorBoundaryRef(vector) === route.targetGraphVectorName
      );
      if (targetVector === undefined) {
        throw new TypeError(
          `${input.definition.overlayRef}: reentry target vector ${route.targetGraphVectorName} is not in ${route.terminalGraphFunctionName}`
        );
      }
      const sourceGraphVectorRef = sdlcGraphVectorBoundaryRef(sourceVector);
      const targetGraphVectorRef = sdlcGraphVectorBoundaryRef(targetVector);
      return Object.freeze({
        kind: "sdlc_overlay_reentry_route" as const,
        routeRef: [
          "overlay-reentry-route://odd-sdlc",
          encodeURIComponent(input.definition.overlayRef),
          encodeURIComponent(sourceGraphVectorRef),
          encodeURIComponent(targetGraphVectorRef)
        ].join("/"),
        overlayRef: input.definition.overlayRef,
        terminalGraphFunctionRef: sdlcGraphFunctionBoundaryRef(terminalGraphFunction),
        sourceGraphVectorName: sourceVector.name,
        sourceGraphVectorRef,
        targetGraphVectorName: targetVector.name,
        targetGraphVectorRef,
        targetNodeRef: targetVector.target.id,
        closureDispositions: Object.freeze([...route.closureDispositions]),
        reasonRefs: Object.freeze([...route.reasonRefs])
      });
    })
  );
  return Object.freeze({
    kind: "sdlc_traversal_overlay" as const,
    overlayRef: input.definition.overlayRef,
    aliases: Object.freeze([...(input.definition.aliases ?? [])]),
    name: input.definition.name,
    intent: input.definition.intent,
    graphFunctionRefs,
    graphVectorRefs,
    graphCatalogDigestRef: input.digestRef,
    publicStartTargets: Object.freeze([...input.definition.publicStartTargets]),
    defaultStartTarget: input.definition.defaultStartTarget,
    policies: Object.freeze({
      workspaceObservationPolicyRef: policyRef(input.definition.overlayRef, "workspace-observation"),
      evalPolicyRef: policyRef(input.definition.overlayRef, "eval"),
      refinementPolicyRef: policyRef(input.definition.overlayRef, "refinement"),
      traversalStrategyPlanRef: policyRef(input.definition.overlayRef, "traversal-strategy")
    }),
    termination: Object.freeze({
      policyRef: policyRef(input.definition.overlayRef, "termination"),
      terminalAssetTypes: Object.freeze([...input.definition.terminalAssetTypes]),
      terminalGraphFunctionRefs,
      lawfulStopDispositions: Object.freeze([
        ...input.definition.lawfulStopDispositions
      ]),
      requiresEvalAdmission: true,
      remainingGraphPressureRefs: Object.freeze([
        pressureRef(input.definition.overlayRef, "graph")
      ]),
      remainingRequirementPressureRefs: Object.freeze([
        pressureRef(input.definition.overlayRef, "requirements")
      ]),
      remainingAssetPressureRefs: Object.freeze([
        pressureRef(input.definition.overlayRef, "assets")
      ]),
      nextEligibleOverlayRefs: Object.freeze([
        ...(input.definition.nextEligibleOverlayRefs ?? [])
      ])
    }),
    assetTemplates,
    requiredLedgersByEdge: Object.freeze(
      graphVectorRefs.map((edgeRef) =>
        Object.freeze({
          edgeRef,
          computeRegime: "f_p" as const,
          requiredLedgerKinds: Object.freeze([
            "sdlc_edge_fulfillment_ledger",
            "sdlc_edge_closure_decision"
          ]),
          closureRequiresLedger: true
        })
      )
    ),
    reentryRoutes,
    allowedConsequenceTraversalDeclarations,
    predecessorOverlayRefs: Object.freeze([
      ...(input.definition.predecessorOverlayRefs ?? [])
    ]),
    annotations: Object.freeze([
      ...(input.definition.annotations ?? []).map((annotation) =>
        Object.freeze({
          kind: "sdlc_traversal_overlay_annotation" as const,
          annotationRef: [
            input.definition.overlayRef,
            "annotation",
            annotation.annotationKind
          ].join("/"),
          annotationKind: annotation.annotationKind,
          parentOverlayRef: annotation.parentOverlayRef ?? null,
          depthTraversalEligible: annotation.depthTraversalEligible,
          decompositionTraceRequired: annotation.decompositionTraceRequired,
          abgRuntimeAuthorityOnly: true as const,
          zoomGraphFunctionRef: annotation.zoomGraphFunctionRef ?? null,
          zoomTargetGraphFunctionRefs: Object.freeze([
            ...(annotation.zoomTargetGraphFunctionRefs ?? [])
          ]),
          proofRefs: Object.freeze([...annotation.proofRefs])
        })
      )
    ])
  });
}

export function constructSdlcTraversalOverlayCatalog(input: {
  readonly module: Module;
  readonly graphCatalog?: SdlcGraphFunctionCatalog;
}): SdlcTraversalOverlayCatalog {
  void input.graphCatalog;
  const byName = graphFunctionByName(input.module);
  const digestRef = graphCatalogDigestRef(input.module);
  const overlays = Object.freeze(
    overlayDefinitions().map((definition) =>
      overlayFromDefinition({ definition, byName, digestRef })
    )
  );
  assertSdlcEdgeGainClosureMatrix({
    overlays,
    publishedGraphVectorRefs: publishedGraphVectorRefs(input.module),
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });
  return Object.freeze({
    kind: "sdlc_traversal_overlay_catalog" as const,
    catalogRef: "overlay-catalog://odd-sdlc/ts-v1" as const,
    catalogDigestRef: digestRef,
    graphCatalogDigestRef: digestRef,
    overlays
  });
}

function normalizeOverlayRef(value: string): SdlcTraversalOverlayRef {
  const raw = parseNonEmptyString(value, "overlayRef");
  const strategy = SDLC_PROFILE_OVERLAY_STRATEGY_VALUES.find(
    (candidate) => candidate === raw
  );
  if (strategy !== undefined) {
    return sdlcTraversalOverlayRefForStrategy(strategy);
  }
  return normalizeSdlcTraversalOverlayRef(raw, "overlayRef");
}

export function resolveSdlcTraversalOverlay(input: {
  readonly catalog: SdlcTraversalOverlayCatalog;
  readonly overlayRef: string;
}): SdlcTraversalOverlay | null {
  const overlayRef = normalizeOverlayRef(input.overlayRef);
  return input.catalog.overlays.find(
    (overlay) =>
      overlay.overlayRef === overlayRef || overlay.aliases.includes(overlayRef)
  ) ?? null;
}

export function sdlcTraversalOverlayForGraphFunction(input: {
  readonly catalog: SdlcTraversalOverlayCatalog;
  readonly graphFunctionRef: string;
}): SdlcTraversalOverlay {
  const overlay = input.catalog.overlays.find((candidate) =>
    candidate.graphFunctionRefs.includes(input.graphFunctionRef)
  ) ?? input.catalog.overlays.find(
    (candidate) => candidate.overlayRef === SDLC_DEFAULT_TRAVERSAL_OVERLAY_REF
  ) ?? input.catalog.overlays[0];
  if (overlay === undefined) {
    throw new TypeError("SdlcTraversalOverlayCatalog requires at least one overlay");
  }
  return overlay;
}

export function sdlcTraversalOverlayAllowsProductConvergence(input: {
  readonly overlay: SdlcTraversalOverlay;
  readonly completedGraphFunctionRef: string;
  readonly module?: Module | undefined;
}): boolean {
  if (
    !input.overlay.termination.lawfulStopDispositions.includes(
      "product_converged"
    ) ||
    input.overlay.termination.nextEligibleOverlayRefs.length !== 0
  ) {
    return false;
  }
  if (
    input.overlay.termination.terminalGraphFunctionRefs.includes(
      input.completedGraphFunctionRef
    )
  ) {
    return true;
  }
  if (input.module === undefined) {
    return false;
  }
  const byName = graphFunctionByName(input.module);
  for (const terminalGraphFunctionRef of
    input.overlay.termination.terminalGraphFunctionRefs) {
    const graphFunction = byName.get(terminalGraphFunctionRef);
    if (graphFunction === undefined) {
      continue;
    }
    const vectors = materializeGraphFunction(graphFunction).vectors;
    const terminalVector = vectors[vectors.length - 1];
    if (
      terminalVector !== undefined &&
      sdlcGraphVectorBoundaryRef(terminalVector) === input.completedGraphFunctionRef
    ) {
      return true;
    }
  }
  return false;
}

export function sdlcTraversalOverlayNextGraphContinuation(input: {
  readonly module: Module;
  readonly overlay: SdlcTraversalOverlay;
  readonly completedGraphFunctionRef: string;
}): SdlcTraversalOverlayGraphContinuation | null {
  const byName = graphFunctionByName(input.module);
  for (const terminalGraphFunctionRef of
    input.overlay.termination.terminalGraphFunctionRefs) {
    const graphFunction = byName.get(terminalGraphFunctionRef);
    if (graphFunction === undefined) {
      continue;
    }
    const vectors = materializeGraphFunction(graphFunction).vectors;
    const completedIndex = vectors.findIndex(
      (vector) =>
        vector.name === input.completedGraphFunctionRef ||
        sdlcGraphVectorBoundaryRef(vector) === input.completedGraphFunctionRef
    );
    if (completedIndex < 0) {
      continue;
    }
    const completedVector = vectors[completedIndex];
    const nextVector = vectors[completedIndex + 1];
    if (completedVector === undefined || nextVector === undefined) {
      return null;
    }
    const nextGraphFunction = byName.get(nextVector.name);
    if (nextGraphFunction === undefined) {
      return null;
    }
    const nextGraphFunctionRef = sdlcGraphFunctionBoundaryRef(nextGraphFunction);
    const nextGraph = materializeGraphFunction(nextGraphFunction);
    const nextGraphVector =
      nextGraph.vectors.find(
        (vector) => sdlcGraphVectorBoundaryRef(vector) === nextVector.name
      ) ?? nextGraph.vectors[0];
    if (nextGraphVector === undefined) {
      return null;
    }
    return Object.freeze({
      kind: "sdlc_traversal_overlay_graph_continuation" as const,
      overlayRef: input.overlay.overlayRef,
      terminalGraphFunctionRef,
      completedGraphFunctionRef: input.completedGraphFunctionRef,
      completedGraphVectorRef: sdlcGraphVectorBoundaryRef(completedVector),
      nextGraphFunctionRef,
      nextGraphVectorRef: sdlcGraphVectorBoundaryRef(nextGraphVector),
      targetNodeRef: nextGraphVector.target.id,
      sequenceIndex: completedIndex + 1
    });
  }
  return null;
}

export function sdlcTraversalOverlayFailureReentryRoute(input: {
  readonly overlay: SdlcTraversalOverlay;
  readonly completedGraphVectorRef: string;
  readonly closureDisposition: string;
}): SdlcOverlayReentryRoute | null {
  const completedGraphVectorRef = parseNonEmptyString(
    input.completedGraphVectorRef,
    "completedGraphVectorRef"
  );
  if (!isSdlcOverlayReentryDisposition(input.closureDisposition)) {
    return null;
  }
  for (const route of input.overlay.reentryRoutes) {
    if (
      route.closureDispositions.includes(input.closureDisposition) &&
      (route.sourceGraphVectorName === completedGraphVectorRef ||
        route.sourceGraphVectorRef === completedGraphVectorRef)
    ) {
      return route;
    }
  }
  return null;
}

export function publicSdlcOverlayStartTargets(input: {
  readonly module: Module;
  readonly catalog: SdlcTraversalOverlayCatalog;
  readonly projectConformanceStatus?: string | null;
}): readonly SdlcOverlayStartTarget[] {
  const byName = graphFunctionByName(input.module);
  const rows = new Map<string, SdlcOverlayStartTarget>();
  for (const overlay of input.catalog.overlays) {
    for (const target of overlay.publicStartTargets) {
      const graphFunction = byName.get(target);
      if (graphFunction === undefined) {
        throw new TypeError(`${overlay.overlayRef}: unpublished start target ${target}`);
      }
      const existing = rows.get(target);
      const row = Object.freeze({
        name: target,
        graphFunctionRef: sdlcGraphFunctionBoundaryRef(graphFunction),
        jobName: `${target}_job`,
        overlayRefs: Object.freeze([
          ...(existing?.overlayRefs ?? []),
          overlay.overlayRef
        ]),
        defaultForOverlayRefs: Object.freeze([
          ...(existing?.defaultForOverlayRefs ?? []),
          ...(overlay.defaultStartTarget === target ? [overlay.overlayRef] : [])
        ])
      });
      rows.set(target, row);
    }
  }
  if (input.projectConformanceStatus === "blocked") {
    const conform = byName.get(FG_CONFORM_PROJECT);
    if (conform === undefined) {
      return Object.freeze([]);
    }
    const conformRef = sdlcGraphFunctionBoundaryRef(conform);
    const conformanceOverlayRefs = Object.freeze(
      input.catalog.overlays
        .filter((overlay) => overlay.graphFunctionRefs.includes(conformRef))
        .map((overlay) => overlay.overlayRef)
    );
    const overlayRefs = conformanceOverlayRefs.length > 0
      ? conformanceOverlayRefs
      : Object.freeze([SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF]);
    return Object.freeze([
      {
        name: FG_CONFORM_PROJECT,
        graphFunctionRef: conformRef,
        jobName: `${FG_CONFORM_PROJECT}_job`,
        overlayRefs,
        defaultForOverlayRefs: overlayRefs
      }
    ]);
  }
  return Object.freeze([...rows.values()]);
}

export function constructSdlcOverlayBinding(input: {
  readonly catalog: SdlcTraversalOverlayCatalog;
  readonly overlay: SdlcTraversalOverlay;
  readonly workspaceRootUri: string;
  readonly workspaceIdentityRef: string;
  readonly preActionWorkspaceObservationRef: string;
  readonly preActionWorkspaceFingerprintRef: string;
  readonly selectedGraphFunctionRef: string;
  readonly selectedGraphVectorRef?: string | null;
  readonly selectedStartTargetRef: string;
  readonly requestedBy: SdlcOverlayBinding["selection"]["requestedBy"];
  readonly materialAssetRefs?: readonly {
    readonly assetType: string;
    readonly assetRef: string;
    readonly relativePath: string;
    readonly evidenceRefs?: readonly string[];
  }[];
  readonly priorLedgerRefs?: readonly string[];
  readonly priorEventRefs?: readonly string[];
}): SdlcOverlayBinding {
  const basis = [
    input.overlay.overlayRef,
    input.workspaceRootUri,
    input.workspaceIdentityRef,
    input.preActionWorkspaceObservationRef,
    input.selectedGraphFunctionRef,
    input.selectedStartTargetRef,
    input.catalog.graphCatalogDigestRef
  ].map(encodeURIComponent).join("/");
  const priorLedgerRefs = Object.freeze([...(input.priorLedgerRefs ?? [])]);
  const priorEventRefs = Object.freeze([...(input.priorEventRefs ?? [])]);
  const templateTypes = new Set(input.overlay.assetTemplates.map((template) => template.assetType));
  for (const asset of input.materialAssetRefs ?? []) {
    if (!templateTypes.has(asset.assetType)) {
      throw new TypeError(
        `${input.overlay.overlayRef}: material asset ${asset.assetType} is not declared by the selected overlay template`
      );
    }
  }
  const materialByType = new Map(
    (input.materialAssetRefs ?? []).map((asset) => [asset.assetType, asset])
  );
  const assetBindings = Object.freeze(
    input.overlay.assetTemplates.map((template) => {
      const material = materialByType.get(template.assetType) ?? null;
      const mode =
        material === null ? "planned_from_template" as const : "material" as const;
      const relativePath =
        material === null
          ? template.defaultPath
          : parseNonEmptyString(material.relativePath, `${template.assetType}.relativePath`);
      const assetRef =
        material === null
          ? `${input.overlay.overlayRef}/planned-asset/${encodeURIComponent(template.assetType)}`
          : parseNonEmptyString(material.assetRef, `${template.assetType}.assetRef`);
      return Object.freeze({
        kind: "sdlc_overlay_asset_binding" as const,
        bindingRef: `${input.overlay.overlayRef}/asset-binding/${encodeURIComponent(template.assetType)}`,
        assetType: template.assetType,
        mode,
        assetRef,
        relativePath,
        producerGraphFunctionRef: template.producerGraphFunctionRef,
        terminalRole: template.terminalRole,
        templateRef: mode === "planned_from_template" ? template.templateRef : null,
        evidenceRefs: Object.freeze([...(material?.evidenceRefs ?? [])])
      });
    })
  );
  const annotationRefs = Object.freeze(
    input.overlay.annotations.map((annotation) => annotation.annotationRef)
  );
  const zoomGraphFunctionRefs = uniqueOverlayBindingRefs(
    input.overlay.annotations.flatMap((annotation) =>
      annotation.zoomGraphFunctionRef === null
        ? []
        : [annotation.zoomGraphFunctionRef]
    )
  );
  const zoomTargetGraphFunctionRefs = uniqueOverlayBindingRefs(
    input.overlay.annotations.flatMap((annotation) => [
      ...annotation.zoomTargetGraphFunctionRefs
    ])
  );
  return Object.freeze({
    kind: "sdlc_overlay_binding" as const,
    bindingRef: admitSdlcOverlayBindingRef(
      `overlay-binding://odd-sdlc/${basis}`,
      "overlayBinding.bindingRef"
    ),
    overlayRef: input.overlay.overlayRef,
    graphCatalogDigestRef: input.catalog.graphCatalogDigestRef,
    workspaceBasis: Object.freeze({
      workspaceRootUri: parseNonEmptyString(input.workspaceRootUri, "workspaceRootUri"),
      workspaceIdentityRef: parseNonEmptyString(input.workspaceIdentityRef, "workspaceIdentityRef"),
      preActionWorkspaceObservationRef: parseNonEmptyString(
        input.preActionWorkspaceObservationRef,
        "preActionWorkspaceObservationRef"
      ),
      preActionWorkspaceFingerprintRef: parseNonEmptyString(
        input.preActionWorkspaceFingerprintRef,
        "preActionWorkspaceFingerprintRef"
      ),
      postActionWorkspaceObservationRef: null,
      postActionWorkspaceFingerprintRef: null,
      workspaceDeltaRef: null
    }),
    selection: Object.freeze({
      selectedGraphFunctionRef: parseNonEmptyString(
        input.selectedGraphFunctionRef,
        "selectedGraphFunctionRef"
      ),
      selectedGraphVectorRef: input.selectedGraphVectorRef ?? null,
      selectedStartTargetRef: parseNonEmptyString(
        input.selectedStartTargetRef,
        "selectedStartTargetRef"
      ),
      requestedBy: input.requestedBy
    }),
    assetBindings,
    annotationRefs,
    zoomGraphFunctionRefs,
    zoomTargetGraphFunctionRefs,
    priorLedgerRefs,
    priorEventRefs,
    remainingGraphPressureRefs: input.overlay.termination.remainingGraphPressureRefs,
    remainingRequirementPressureRefs:
      input.overlay.termination.remainingRequirementPressureRefs,
    remainingAssetPressureRefs: input.overlay.termination.remainingAssetPressureRefs,
    nextEligibleOverlayRefs: input.overlay.termination.nextEligibleOverlayRefs,
    freshnessPolicyRef: input.overlay.policies.workspaceObservationPolicyRef,
    predecessorRefs: Object.freeze([
      input.overlay.overlayRef,
      input.catalog.catalogDigestRef,
      input.catalog.graphCatalogDigestRef,
      input.workspaceIdentityRef,
      input.preActionWorkspaceObservationRef,
      input.preActionWorkspaceFingerprintRef,
      input.selectedGraphFunctionRef,
      input.selectedStartTargetRef,
      ...assetBindings.map((binding) => binding.bindingRef),
      ...annotationRefs,
      ...zoomGraphFunctionRefs,
      ...zoomTargetGraphFunctionRefs,
      ...priorLedgerRefs,
      ...priorEventRefs
    ])
  });
}

function uniqueOverlayBindingRefs(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

export function withSdlcOverlayBindingPostActionEvidence(input: {
  readonly binding: SdlcOverlayBinding;
  readonly postActionWorkspaceObservationRef: string;
  readonly postActionWorkspaceFingerprintRef: string;
  readonly workspaceDeltaRef: string;
}): SdlcOverlayBinding {
  const postActionWorkspaceObservationRef = parseNonEmptyString(
    input.postActionWorkspaceObservationRef,
    "postActionWorkspaceObservationRef"
  );
  const postActionWorkspaceFingerprintRef = parseNonEmptyString(
    input.postActionWorkspaceFingerprintRef,
    "postActionWorkspaceFingerprintRef"
  );
  const workspaceDeltaRef = parseNonEmptyString(
    input.workspaceDeltaRef,
    "workspaceDeltaRef"
  );
  return Object.freeze({
    ...input.binding,
    workspaceBasis: Object.freeze({
      ...input.binding.workspaceBasis,
      postActionWorkspaceObservationRef,
      postActionWorkspaceFingerprintRef,
      workspaceDeltaRef
    }),
    predecessorRefs: uniqueOverlayBindingRefs([
      ...input.binding.predecessorRefs,
      postActionWorkspaceObservationRef,
      postActionWorkspaceFingerprintRef,
      workspaceDeltaRef
    ])
  });
}
