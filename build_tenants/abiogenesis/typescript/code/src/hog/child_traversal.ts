import {
  admitChildExecutionBasis,
  openTraversalScope,
  type AbgEventStore,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import {
  materializeGraph,
  type ClosureContract,
  type GraphFunction,
  type GtlGraph,
  type GtlProgram,
} from "../gtl/index.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  validateGraph,
  type GraphValidation,
  type ProgramValidation,
} from "../validator/index.js";

export interface ChildTraversalBasis {
  readonly kind: "child_traversal_basis";
  readonly schemaVersion: "5.0.0";
  readonly graphFunctionByRef: LeafInvocationPort["graphFunctionByRef"];
  readonly closureContractByRef: LeafInvocationPort["closureContractByRef"];
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly rootImplementationSet: AdmittedImplementationSet;
  readonly rootInteractionSet: AdmittedInteractionSet;
}

export function constructChildTraversalBasis(input: Readonly<{
  graphFunctionByRef: LeafInvocationPort["graphFunctionByRef"];
  closureContractByRef: LeafInvocationPort["closureContractByRef"];
  program: Readonly<GtlProgram>;
  programValidation: ProgramValidation;
  rootImplementationSet: AdmittedImplementationSet;
  rootInteractionSet: AdmittedInteractionSet;
}>): ChildTraversalBasis {
  return deepFreeze({
    kind: "child_traversal_basis" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  });
}

export interface ChildTraversalPreparationRequest {
  readonly predecessorPrefix: DurablePrefixCoordinate;
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
  readonly successorPrefix: DurablePrefixCoordinate;
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
  readonly successorPrefix: DurablePrefixCoordinate;
}

export type ChildTraversalPreparationResult =
  | ChildTraversalPreparationRefusal
  | PreparedChildTraversal;

function refusal(
  stage: ChildTraversalPreparationRefusal["stage"],
  diagnosticRef: string,
  message: string,
  successorPrefix: DurablePrefixCoordinate,
): ChildTraversalPreparationRefusal {
  return deepFreeze({
    kind: "child_traversal_preparation_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    stage,
    diagnosticRef,
    message,
    successorPrefix,
  });
}

/**
 * Exact synchronous owner composition for one child traversal. The immutable
 * basis supplies installed definition data; GTL, Validator, and ABG retain
 * their existing semantic and admission authority.
 */
export function prepareChildTraversal(
  store: AbgEventStore,
  basis: ChildTraversalBasis,
  request: ChildTraversalPreparationRequest,
): ChildTraversalPreparationResult {
  if (
    basis.kind !== "child_traversal_basis" ||
    basis.schemaVersion !== "5.0.0" ||
    request.parentExecutionBasis.programRef !== basis.program.programRef ||
    request.parentExecutionBasis.programValidationRef !==
      basis.programValidation.validationRef ||
    request.parentTraversalScope.executionBasisRef !==
      request.parentExecutionBasis.basisRef ||
    !basis.program.callableMembership.includes(request.childGraphFunctionRef)
  ) {
    return refusal(
      "membership",
      "diagnostic://abiogenesis/child-traversal/program-membership-mismatch@5",
      "child traversal request differs from the installed admitted Program root",
      request.predecessorPrefix,
    );
  }
  const graphFunction = basis.graphFunctionByRef(
    request.childGraphFunctionRef,
  );
  if (graphFunction === null) {
    return refusal(
      "membership",
      "diagnostic://abiogenesis/child-traversal/graph-function-absent@5",
      "declared child GraphFunction is absent from the installed publication",
      request.predecessorPrefix,
    );
  }
  const closureContractRef =
    graphFunction.declarations["abg.child_closure_contract"];
  const closureContract = closureContractRef === undefined
    ? null
    : basis.closureContractByRef(closureContractRef);
  if (closureContract === null) {
    return refusal(
      "membership",
      "diagnostic://abiogenesis/child-traversal/closure-contract-absent@5",
      "declared child closure contract is absent from the installed publication",
      request.predecessorPrefix,
    );
  }
  const graph = materializeGraph(graphFunction, {
    invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
    admittedInputRef: request.inputRef,
    admittedInputDigest: request.inputDigest,
    admittedInput: request.input,
  });
  const graphValidation = validateGraph(
    graph,
    basis.programValidation,
    graphFunction,
    {
      invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
      admittedInputRef: request.inputRef,
      admittedInputDigest: request.inputDigest,
      admittedInput: request.input,
    },
  );
  if (graphValidation.kind !== "graph_validation") {
    return refusal(
      "graph_validation",
      `diagnostic://abiogenesis/child-traversal/${graphValidation.diagnostics[0]?.code ?? "invalid-graph"}@5`,
      "child Graph failed exact non-lowering validation",
      request.predecessorPrefix,
    );
  }
  const childBasis = admitChildExecutionBasis(
    store,
    request.predecessorPrefix,
    {
      parentExecutionBasis: request.parentExecutionBasis,
      parentTraversalScope: request.parentTraversalScope,
      parentCCallRef: request.parentCCallRef,
      program: basis.program,
      programValidation: basis.programValidation,
      graphFunction,
      graph,
      graphValidation,
      rootImplementationSet: basis.rootImplementationSet,
      rootInteractionSet: basis.rootInteractionSet,
      closureContract,
      admittedInputRef: request.inputRef,
      admittedInputDigest: request.inputDigest,
      rawInputValue: request.input,
    },
    {
      eventTime: request.eventTime,
      correlationId: `${request.correlationId}/basis`,
      causationEventRefs: [],
    },
  );
  if (childBasis.kind !== "child_execution_basis_admission") {
    return refusal(
      "basis_admission",
      `diagnostic://abiogenesis/child-traversal/${childBasis.code}@5`,
      childBasis.message,
      request.predecessorPrefix,
    );
  }
  const opened = openTraversalScope(
    store,
    childBasis.successorPrefix,
    {
      kind: "child",
      executionBasis: childBasis.executionBasis,
      parentScope: request.parentTraversalScope,
    },
    {
      eventTime: request.eventTime,
      correlationId: `${request.correlationId}/open`,
      causationEventRefs: [],
    },
  );
  if (opened.kind !== "traversal_scope_open_admission") {
    return refusal(
      "scope_open",
      `diagnostic://abiogenesis/child-traversal/${opened.code}@5`,
      opened.message,
      childBasis.successorPrefix,
    );
  }
  return deepFreeze({
    kind: "prepared_child_traversal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "prepared" as const,
    program: basis.program,
    programValidation: basis.programValidation,
    graphFunction,
    graph,
    graphValidation,
    executionBasis: childBasis.executionBasis,
    openedTraversalScope: opened.scope,
    implementationSet: basis.rootImplementationSet,
    interactionSet: basis.rootInteractionSet,
    closureContract,
    inputRef: request.inputRef,
    inputDigest: request.inputDigest,
    input: request.input,
    successorPrefix: opened.successorPrefix,
  });
}
