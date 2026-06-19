import { parseNonEmptyString } from "../shared/validation.js";

const LEGACY_GRAPH_FUNCTION_ID_PREFIX = "graph-function:";
const LEGACY_GRAPH_VECTOR_ID_PREFIXES = Object.freeze([
  "graph-vector:",
  "vector:"
] as const);

export type SdlcGraphBoundaryRefDiagnosticCode =
  | "legacy_graph_function_boundary_ref"
  | "unknown_graph_function_boundary_ref"
  | "legacy_graph_vector_boundary_ref"
  | "unknown_graph_vector_boundary_ref";

export class SdlcGraphBoundaryRefError extends TypeError {
  readonly code: SdlcGraphBoundaryRefDiagnosticCode;

  constructor(input: {
    readonly code: SdlcGraphBoundaryRefDiagnosticCode;
    readonly message: string;
  }) {
    super(`${input.code}: ${input.message}`);
    this.name = "SdlcGraphBoundaryRefError";
    this.code = input.code;
  }
}

export interface SdlcPublishedGraphFunctionIdentity {
  readonly name: string;
}

export function sdlcGraphFunctionBoundaryRef(
  graphFunction: SdlcPublishedGraphFunctionIdentity
): string {
  return parseNonEmptyString(graphFunction.name, "graphFunction.name");
}

export interface SdlcPublishedGraphVectorIdentity {
  readonly name: string;
}

export function sdlcGraphVectorBoundaryRef(
  graphVector: SdlcPublishedGraphVectorIdentity
): string {
  return parseNonEmptyString(graphVector.name, "graphVector.name");
}

export function admitSdlcGraphFunctionBoundaryRef(input: {
  readonly value: unknown;
  readonly publishedGraphFunctionRefs: readonly string[];
  readonly label: string;
}): string {
  const value = parseNonEmptyString(input.value, input.label);
  if (value.startsWith(LEGACY_GRAPH_FUNCTION_ID_PREFIX)) {
    throw new SdlcGraphBoundaryRefError({
      code: "legacy_graph_function_boundary_ref",
      message: `${input.label} must use published graph-function name`
    });
  }
  if (!input.publishedGraphFunctionRefs.includes(value)) {
    throw new SdlcGraphBoundaryRefError({
      code: "unknown_graph_function_boundary_ref",
      message: `${input.label} is not a published graph-function boundary ref`
    });
  }
  return value;
}

export function admitSdlcGraphVectorBoundaryRef(input: {
  readonly value: unknown;
  readonly publishedGraphVectorRefs: readonly string[];
  readonly label: string;
}): string {
  const value = parseNonEmptyString(input.value, input.label);
  if (LEGACY_GRAPH_VECTOR_ID_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    throw new SdlcGraphBoundaryRefError({
      code: "legacy_graph_vector_boundary_ref",
      message: `${input.label} must use published graph-vector name`
    });
  }
  if (!input.publishedGraphVectorRefs.includes(value)) {
    throw new SdlcGraphBoundaryRefError({
      code: "unknown_graph_vector_boundary_ref",
      message: `${input.label} is not a published graph-vector boundary ref`
    });
  }
  return value;
}

export function sdlcPublishedActionRef(input: {
  readonly graphFunctionRef: string;
}): string {
  return `published-action://odd-sdlc/graph-function/${parseNonEmptyString(input.graphFunctionRef, "graphFunctionRef")}`;
}

export function sdlcPublishedTraversalTargetRef(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
}): string {
  return [
    "published-traversal-target://odd-sdlc",
    parseNonEmptyString(input.graphFunctionRef, "graphFunctionRef"),
    parseNonEmptyString(input.graphVectorRef, "graphVectorRef")
  ].join("/");
}

export function sdlcTargetOutcomeRef(input: {
  readonly graphFunctionRef: string;
  readonly targetNodeRef: string;
}): string {
  return [
    "outcome://odd-sdlc",
    parseNonEmptyString(input.graphFunctionRef, "graphFunctionRef"),
    parseNonEmptyString(input.targetNodeRef, "targetNodeRef")
  ].join("/");
}
