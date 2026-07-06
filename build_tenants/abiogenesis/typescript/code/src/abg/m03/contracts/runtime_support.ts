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

export function runtimeEventsForBasis(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze(
    events.filter((event) => {
      const basisId = runtimeEventBasisId(event);
      return basisId === null || basisId === basis.id;
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
