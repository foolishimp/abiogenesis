import type {
  AdmittedImplementationSet,
  AdmittedInteractionSet,
  ExecutionBasis,
  OpenedTraversalScope,
} from "../abg/index.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";

export interface ChildTraversalPreparationRequest {
  readonly parentExecutionBasis: ExecutionBasis;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentCCallRef: string;
  readonly childGraphFunctionRef: string;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface PreparedChildTraversal {
  readonly kind: "prepared_child_traversal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "prepared";
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly closureContract: Readonly<ClosureContract>;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly input: Readonly<Record<string, JsonValue>>;
}

export interface ChildTraversalPreparationRefusal {
  readonly kind: "child_traversal_preparation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly stage:
    | "basis_admission"
    | "graph_materialization"
    | "graph_validation"
    | "membership"
    | "scope_open";
  readonly diagnosticRef: string;
  readonly message: string;
}

export type ChildTraversalPreparationResult =
  | ChildTraversalPreparationRefusal
  | PreparedChildTraversal;

export interface ChildTraversalPreparationPort {
  readonly kind: "child_traversal_preparation_port";
  readonly schemaVersion: "5.0.0";
  readonly prepare: (
    request: ChildTraversalPreparationRequest,
  ) => ChildTraversalPreparationResult | Promise<ChildTraversalPreparationResult>;
}

export function constructChildTraversalPreparationPort(
  prepare: ChildTraversalPreparationPort["prepare"],
): ChildTraversalPreparationPort {
  const port = deepFreeze({
    kind: "child_traversal_preparation_port" as const,
    schemaVersion: "5.0.0" as const,
    prepare,
  }) as ChildTraversalPreparationPort;
  return port;
}

export function isChildTraversalPreparationPort(
  value: object,
): value is ChildTraversalPreparationPort {
  const candidate = value as Partial<ChildTraversalPreparationPort>;
  return candidate.kind === "child_traversal_preparation_port" &&
    candidate.schemaVersion === "5.0.0" &&
    typeof candidate.prepare === "function";
}
