import { RUNTIME_FAILURE_CLASS_VALUES } from "./carriers.js";
import type {
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeFailureClass
} from "./carriers.js";

export function freezeNumberArray(values: readonly number[]): readonly number[] {
  return Object.freeze([...values]);
}

export function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

export function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
}

export function assertRuntimeFailureClass(value: RuntimeFailureClass): void {
  for (const allowed of RUNTIME_FAILURE_CLASS_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`Unsupported runtime failure class ${JSON.stringify(value)}`);
}

export function freezePlainPayload(
  value: Readonly<Record<string, unknown>>,
  label: string
): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  return Object.freeze({ ...value });
}

export function vectorEdge(basis: ExecutionBasis, vectorIndex: number): string {
  const vector = basis.graph.vectors[vectorIndex];
  if (vector === undefined) {
    throw new TypeError(
      `ExecutionBasis(${JSON.stringify(basis.id)}) has no vector at index ${vectorIndex}`
    );
  }
  return vector.name;
}

export function graphCallIdForBasis(basis: ExecutionBasis): string {
  return `graph-call:${basis.id}`;
}

export function frameIdForBasis(basis: ExecutionBasis): string {
  return basis.frameId ?? `frame:${basis.id}:root`;
}

export function graphCallIdForParentProjection(
  projection: RuntimeAggregateProjection,
  label: string
): string {
  if (projection.graphCallId === null) {
    throw new TypeError(`${label} requires parent graphCallId in projection`);
  }
  return projection.graphCallId;
}

export function frameIdForParentProjection(
  projection: RuntimeAggregateProjection,
  label: string
): string {
  if (projection.frameId === null) {
    throw new TypeError(`${label} requires parent frameId in projection`);
  }
  return projection.frameId;
}

export function assertVectorIndexInRange(
  basis: ExecutionBasis,
  vectorIndex: number
): void {
  if (
    !Number.isInteger(vectorIndex) ||
    vectorIndex < 0 ||
    vectorIndex >= basis.graph.vectors.length
  ) {
    throw new TypeError(
      `Runtime event vectorIndex ${JSON.stringify(vectorIndex)} is outside graph vector range`
    );
  }
}

export function assertBasisEvent(
  basis: ExecutionBasis,
  event: RuntimeEvent
): void {
  // campaign #17: runtime_failure_observed lawfully carries basisId
  // null (P0-4 CLI-error-as-event fires before/outside a basis) — an
  // observability event in the shared log must not poison every
  // subsequent projection over the workspace.
  if (
    event.kind === "runtime_failure_observed" &&
    "basisId" in event &&
    event.basisId === null
  ) {
    return;
  }
  if ("basisId" in event && event.basisId !== basis.id) {
    throw new TypeError(
      `Runtime event ${event.kind} belongs to ${JSON.stringify(event.basisId)}, not ${JSON.stringify(basis.id)}`
    );
  }
}

export function runtimeEventBasisId(event: RuntimeEvent): string | null {
  if ("basisId" in event) {
    return event.basisId;
  }
  return null;
}

// T-217 S2.4 (C-1) — REQ-R-ABG3-EVENTS-025 realized: every runtime event
// kind either carries basis scope or is DECLARED here with its named
// scope class. The basis filter consumes THIS declaration; an event with
// no basis scope whose kind is undeclared is a carrier defect and fails
// closed instead of silently blending across runs in a shared store.
export const RUN_INDEPENDENT_EVENT_SCOPE_CLASSES = Object.freeze({
  // workspace-scoped truth: publication/selection/installation facts the
  // whole store shares by design (the governing-set fold and the
  // basis-fork scan lean on this deliberately)
  registry_entry_admitted: "workspace",
  registry_entry_rejected: "workspace",
  registry_plugin_advice_admitted: "workspace",
  registry_plugin_advice_rejected: "workspace",
  graph_function_selected: "workspace",
  graph_function_selection_rejected: "workspace",
  node_type_satisfaction_projected: "workspace",
  workspace_installation_admitted: "workspace",
  lever_resolution_admitted: "workspace",
  // run-scoped operator/F_H acts: they carry runId/workKey, never basisId
  approved: "run",
  revoked: "run",
  reset: "run",
  assessed: "run",
  // perimeter failures may occur before any basis exists (nullable basisId)
  runtime_failure_observed: "perimeter"
} as const) satisfies Readonly<Partial<Record<RuntimeEvent["kind"], string>>>;

export function runtimeEventsForBasis(
  basis: { readonly id: string },
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze(
    events.filter((event) => {
      const basisId = runtimeEventBasisId(event);
      if (basisId !== null) {
        return basisId === basis.id;
      }
      if (event.kind in RUN_INDEPENDENT_EVENT_SCOPE_CLASSES) {
        return true;
      }
      throw new TypeError(
        `Runtime event kind ${JSON.stringify(event.kind)} carries no basis scope and is not declared run-independent (EVENTS-025 carrier defect)`
      );
    })
  );
}

export function assertProjectionBasis(
  basis: ExecutionBasis,
  projection: RuntimeAggregateProjection,
  label: string
): void {
  if (projection.basisId !== basis.id) {
    throw new TypeError(`${label} requires a projection for the same basis`);
  }
  if (projection.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError(
      `${label} requires a projection for the same graph function`
    );
  }
}

export function sortedNumbers(values: Iterable<number>): readonly number[] {
  return Object.freeze([...values].sort((left, right) => left - right));
}

// T-195 C6: string-keyed fallback-ID minters — transport defaults derive
// from these instead of re-spelling the formats.
export function graphCallIdForBasisId(basisId: string): string {
  return `graph-call:${basisId}`;
}

export function rootFrameIdForBasisId(basisId: string): string {
  return `frame:${basisId}:root`;
}
