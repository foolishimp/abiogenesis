export type SdlcTraversalOverlayRef = `overlay://odd-sdlc/${string}`;

export const SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF =
  "overlay://odd-sdlc/current-full-traversal" as const;
export const SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF =
  "overlay://odd-sdlc/deep-sdlc-traversal" as const;
export const SDLC_TICKET_WORKFLOW_OVERLAY_REF =
  "overlay://odd-sdlc/ticket-workflow" as const;
export const SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF =
  "overlay://odd-sdlc/framework-smoke-min-fp" as const;
export const SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF =
  "overlay://odd-sdlc/lite-design-module-implementation" as const;
export const SDLC_SOLUTION_ARCHITECTURE_OVERLAY_REF =
  "overlay://odd-sdlc/solution-architecture" as const;
export const SDLC_BOOTSTRAP_REQUIREMENTS_OVERLAY_REF =
  "overlay://odd-sdlc/bootstrap-requirements" as const;

export const SDLC_DEFAULT_TRAVERSAL_OVERLAY_REF =
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF;

export const SDLC_PROFILE_OVERLAY_STRATEGY_VALUES = Object.freeze([
  "min_fp",
  "thread",
  "breadth",
  "full_lifecycle"
] as const);

export type SdlcProfileOverlayStrategy =
  (typeof SDLC_PROFILE_OVERLAY_STRATEGY_VALUES)[number];

export function isSdlcTraversalOverlayRef(
  value: string
): value is SdlcTraversalOverlayRef {
  return value.startsWith("overlay://odd-sdlc/") &&
    value.length > "overlay://odd-sdlc/".length;
}

export function admitSdlcTraversalOverlayRef(
  value: string,
  label: string
): SdlcTraversalOverlayRef {
  if (!isSdlcTraversalOverlayRef(value)) {
    throw new TypeError(`${label}: expected overlay://odd-sdlc/... ref`);
  }
  return value;
}

export function normalizeSdlcTraversalOverlayRef(
  value: string,
  label = "overlayRef"
): SdlcTraversalOverlayRef {
  const raw = value.trim();
  if (raw.length === 0) {
    throw new TypeError(`${label}: expected non-empty overlay ref`);
  }
  return admitSdlcTraversalOverlayRef(
    raw.startsWith("overlay://odd-sdlc/") ? raw : `overlay://odd-sdlc/${raw}`,
    label
  );
}

export function admitSdlcProfileOverlayStrategy(
  value: string,
  label: string
): SdlcProfileOverlayStrategy {
  const normalized = value.trim();
  if (
    normalized === "min_fp" ||
    normalized === "thread" ||
    normalized === "breadth" ||
    normalized === "full_lifecycle"
  ) {
    return normalized;
  }
  throw new TypeError(
    `${label}: expected ${SDLC_PROFILE_OVERLAY_STRATEGY_VALUES.join(" | ")}`
  );
}

export function sdlcTraversalOverlayRefForStrategy(
  strategy: SdlcProfileOverlayStrategy
): SdlcTraversalOverlayRef {
  if (strategy === "min_fp") {
    return SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF;
  }
  if (strategy === "thread") {
    return SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF;
  }
  return SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF;
}
