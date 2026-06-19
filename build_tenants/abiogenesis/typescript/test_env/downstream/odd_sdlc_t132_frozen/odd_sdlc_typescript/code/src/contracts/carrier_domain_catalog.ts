// Implements: T-175

export const SDLC_TRAVERSAL_OUTCOME_CLASSES = Object.freeze([
  "domain_product",
  "framework_smoke",
  "tutorial_example"
] as const);

export type SdlcTraversalOutcomeClass =
  (typeof SDLC_TRAVERSAL_OUTCOME_CLASSES)[number];

export const SDLC_MIN_FP_PERMITTED_OUTCOME_CLASSES = Object.freeze([
  "framework_smoke",
  "tutorial_example"
] as const satisfies readonly SdlcTraversalOutcomeClass[]);

export const SDLC_TRAVERSAL_HOP_CLASSES = Object.freeze([
  "single_hop",
  "dual_hop",
  "staged",
  "zoom_required",
  "blocked"
] as const);

export type SdlcTraversalHopClass =
  (typeof SDLC_TRAVERSAL_HOP_CLASSES)[number];

export const SDLC_ZOOM_ADMISSION_DISPOSITIONS = Object.freeze([
  "continue",
  "zoom_required",
  "blocked"
] as const);

export type SdlcZoomAdmissionDisposition =
  (typeof SDLC_ZOOM_ADMISSION_DISPOSITIONS)[number];

export const SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS = Object.freeze([
  "none",
  "typed_template",
  "replay_visible_projection",
  "bundled_fp_output",
  "outcome_class_graph_variant"
] as const);

export type SdlcMinFpPressurePreservationMechanism =
  (typeof SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS)[number];

export const SDLC_DEPENDENCY_TRAVERSAL_METHODS = Object.freeze([
  "steel_thread",
  "parallel",
  "serial",
  "blocked"
] as const);

export type SdlcDependencyTraversalMethod =
  (typeof SDLC_DEPENDENCY_TRAVERSAL_METHODS)[number];

export const SDLC_FEATURE_DEPENDENCY_DAG_NODE_KINDS = Object.freeze([
  "module_implementation",
  "test_materialization",
  "uat_test_materialization",
  "fan_in"
] as const);

export type SdlcFeatureDependencyDagNodeKind =
  (typeof SDLC_FEATURE_DEPENDENCY_DAG_NODE_KINDS)[number];

function valueSet<T extends string>(values: readonly T[]): ReadonlySet<string> {
  return new Set<string>(values);
}

const TRAVERSAL_OUTCOME_CLASS_SET = valueSet(SDLC_TRAVERSAL_OUTCOME_CLASSES);

export function isSdlcTraversalOutcomeClass(
  value: unknown
): value is SdlcTraversalOutcomeClass {
  return typeof value === "string" && TRAVERSAL_OUTCOME_CLASS_SET.has(value);
}

export interface SdlcTraversalOutcomeClassResolution {
  readonly kind: "sdlc_traversal_outcome_class_resolution";
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly source: "explicit" | "trivial_product_capability" | "default";
  readonly explicitValue: string | null;
  readonly trivialProduct: boolean;
  readonly defaultOutcomeClass: SdlcTraversalOutcomeClass;
  readonly blockingReasons: readonly string[];
}

export function resolveSdlcTraversalOutcomeClass(input: {
  readonly explicitValue?: string | null | undefined;
  readonly trivialProduct?: boolean | undefined;
  readonly defaultOutcomeClass?: SdlcTraversalOutcomeClass | undefined;
}): SdlcTraversalOutcomeClassResolution {
  const explicitValue = input.explicitValue?.trim() ?? null;
  const defaultOutcomeClass = input.defaultOutcomeClass ?? "domain_product";
  if (isSdlcTraversalOutcomeClass(explicitValue)) {
    return Object.freeze({
      kind: "sdlc_traversal_outcome_class_resolution" as const,
      outcomeClass: explicitValue,
      source: "explicit" as const,
      explicitValue,
      trivialProduct: input.trivialProduct ?? false,
      defaultOutcomeClass,
      blockingReasons: Object.freeze([])
    });
  }
  const trivialProduct = input.trivialProduct ?? false;
  return Object.freeze({
    kind: "sdlc_traversal_outcome_class_resolution" as const,
    outcomeClass: trivialProduct ? "framework_smoke" : defaultOutcomeClass,
    source: trivialProduct ? "trivial_product_capability" as const : "default" as const,
    explicitValue,
    trivialProduct,
    defaultOutcomeClass,
    blockingReasons: Object.freeze(
      explicitValue === null ? [] : [`invalid_traversal_outcome_class:${explicitValue}`]
    )
  });
}
