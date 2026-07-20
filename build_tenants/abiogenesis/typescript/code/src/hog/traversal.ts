import { isExecutionBasis, type ExecutionBasis } from "../abg/execution_basis.js";
import {
  isOpenedTraversalScope,
  type OpenedTraversalScope,
} from "../abg/open_call.js";
import type { ComputeRegime, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue, Sha256Digest } from "../product/index.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import { isGraphValidation, type GraphValidation } from "../validator/graph.js";

export interface TraversalCursor {
  readonly kind: "traversal_cursor";
  readonly schemaVersion: "5.0.0";
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly programRef: string;
  readonly executionBasisRef: string;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphRef: string;
  readonly currentNodeRef: string;
  readonly position: "at_compute_locus";
}

export interface TraversalStopRef {
  readonly kind: "traversal_stop_ref";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "at_compute_locus";
  readonly stopRef: string;
  readonly stopDigest: Sha256Digest;
  readonly stopKind: "compute_locus";
  readonly cursor: TraversalCursor;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly nodeRef: string;
  readonly computeRegime: ComputeRegime;
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}

export interface TraversalRefusal {
  readonly kind: "traversal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "execution_basis_mismatch"
    | "graph_mismatch"
    | "locus_missing"
    | "program_mismatch"
    | "scope_not_admitted";
  readonly message: string;
}

export interface TraverseInput {
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
}

export type TraverseResult = TraversalStopRef | TraversalRefusal;

function refusal(
  code: TraversalRefusal["code"],
  message: string,
): TraversalRefusal {
  return {
    kind: "traversal_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function traverse(input: TraverseInput): TraverseResult {
  if (!isExecutionBasis(input.executionBasis)) {
    return refusal("execution_basis_mismatch", "HoG requires the exact ABG-constructed ExecutionBasis");
  }
  if (!isOpenedTraversalScope(input.openedTraversalScope)) {
    return refusal("scope_not_admitted", "HoG requires the exact explicit OpenedTraversalScope");
  }
  if (
    input.openedTraversalScope.executionBasisRef !== input.executionBasis.basisRef ||
    input.openedTraversalScope.executionBasisDigest !== input.executionBasis.basisDigest ||
    input.openedTraversalScope.invocationAdmissionRef !== input.executionBasis.invocationAdmissionRef ||
    input.openedTraversalScope.programRef !== input.executionBasis.programRef ||
    input.openedTraversalScope.graphFunctionRef !== input.executionBasis.graphFunctionRef ||
    input.openedTraversalScope.graphRef !== input.executionBasis.graphRef
  ) {
    return refusal("scope_not_admitted", "OpenedTraversalScope does not carry this execution basis and graph lineage");
  }
  if (
    input.program.programRef !== input.executionBasis.programRef ||
    sha256Canonical(input.program as unknown as JsonValue) !== input.executionBasis.programDigest ||
    !input.program.callableMembership.includes(input.executionBasis.graphFunctionRef)
  ) {
    return refusal("program_mismatch", "HoG Program differs from the admitted execution basis");
  }
  if (
    !isMaterializedGtlGraph(input.graph) ||
    !isGraphValidation(input.graphValidation) ||
    input.graph.materializationRef !== input.executionBasis.graphRef ||
    input.graph.materializationDigest !== input.executionBasis.graphDigest ||
    input.graph.graphFunctionRef !== input.executionBasis.graphFunctionRef ||
    input.graph.graphFunctionDigest !== input.executionBasis.graphFunctionDigest ||
    input.graph.invocationAdmissionRef !== input.executionBasis.invocationAdmissionRef ||
    input.graph.admittedInputRef !== input.executionBasis.rawInputAdmissionRef ||
    input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
    input.graphValidation.validationRef !== input.executionBasis.graphValidationRef ||
    input.graphValidation.graphRef !== input.graph.materializationRef ||
    input.graphValidation.graphDigest !== input.graph.materializationDigest
  ) {
    return refusal("graph_mismatch", "HoG Graph or GraphValidation differs from the admitted execution basis");
  }

  const node = input.graph.template.nodes.find(
    (candidate) => candidate.nodeRef === input.graph.template.startNodeRef,
  );
  if (node === undefined) {
    return refusal("locus_missing", "admitted GTL start node does not resolve to a compute locus");
  }
  const cursorBody = {
    programRef: input.program.programRef,
    executionBasisRef: input.executionBasis.basisRef,
    traversalScopeRef: input.openedTraversalScope.scopeRef,
    runId: input.openedTraversalScope.runId,
    graphCallId: input.openedTraversalScope.graphCallId,
    frameId: input.openedTraversalScope.frameId,
    graphRef: input.graph.materializationRef,
    currentNodeRef: node.nodeRef,
    position: "at_compute_locus" as const,
  };
  const cursorDigest = sha256Canonical(cursorBody as unknown as JsonValue);
  const cursor = deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef: `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...cursorBody,
  }) as TraversalCursor;
  const stopBody = {
    stopKind: "compute_locus" as const,
    cursor,
    traversalScopeRef: input.openedTraversalScope.scopeRef,
    runId: input.openedTraversalScope.runId,
    graphCallId: input.openedTraversalScope.graphCallId,
    frameId: input.openedTraversalScope.frameId,
    nodeRef: node.nodeRef,
    computeRegime: node.computeRegime,
    implementationBindingRef: node.implementationBindingRef,
    inputContractRef: node.inputContractRef,
    outputContractRef: node.outputContractRef,
  };
  const stopDigest = sha256Canonical(stopBody as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_stop_ref" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "at_compute_locus" as const,
    stopRef: `traversal-stop://abiogenesis/${stopDigest.slice("sha256:".length)}`,
    stopDigest,
    ...stopBody,
  }) as TraversalStopRef;
}
