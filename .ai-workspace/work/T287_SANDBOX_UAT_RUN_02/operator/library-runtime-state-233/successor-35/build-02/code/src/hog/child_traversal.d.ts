import type { TraversalCursorCandidate } from "../abg/traversal_cursor.js";
import { type AbgEventStore, type AdmittedImplementationSet, type AdmittedInteractionSet, type ExecutionBasis, type OpenedTraversalScope } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import { type ClosureContract, type GraphFunction, type GtlGraph, type GtlProgram, type ModulePublication } from "../gtl/index.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type GraphValidation, type ProgramValidation } from "../validator/index.js";
export interface ChildTraversalBasis {
    readonly kind: "child_traversal_basis";
    readonly schemaVersion: "5.0.0";
    readonly graphFunctionByRef: LeafInvocationPort["graphFunctionByRef"];
    readonly closureContractByRef: LeafInvocationPort["closureContractByRef"];
    readonly program: Readonly<GtlProgram>;
    readonly programPublication?: Readonly<ModulePublication>;
    readonly programValidation: ProgramValidation;
    readonly rootImplementationSet: AdmittedImplementationSet;
    readonly rootInteractionSet: AdmittedInteractionSet;
}
export declare function constructChildTraversalBasis(input: Readonly<{
    graphFunctionByRef: LeafInvocationPort["graphFunctionByRef"];
    closureContractByRef: LeafInvocationPort["closureContractByRef"];
    program: Readonly<GtlProgram>;
    programPublication?: Readonly<ModulePublication>;
    programValidation: ProgramValidation;
    rootImplementationSet: AdmittedImplementationSet;
    rootInteractionSet: AdmittedInteractionSet;
}>): ChildTraversalBasis;
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
    readonly stage: "basis_admission" | "graph_materialization" | "graph_validation" | "membership" | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type ChildTraversalPreparationResult = ChildTraversalPreparationRefusal | PreparedChildTraversal;
/**
 * Exact synchronous owner composition for one child traversal. The immutable
 * basis supplies installed definition data; GTL, Validator, and ABG retain
 * their existing semantic and admission authority.
 */
export declare function prepareChildTraversal(store: AbgEventStore, basis: ChildTraversalBasis, request: ChildTraversalPreparationRequest): ChildTraversalPreparationResult;
export declare function prepareWorkflowChildTraversalAtCursor(store: AbgEventStore, basis: ChildTraversalBasis, predecessorPrefix: DurablePrefixCoordinate, cursor: TraversalCursorCandidate): Readonly<{
    intent: import("../abg/traversal_route.js").ConstructionIntentAdmission | null;
    prepare(request: ChildTraversalPreparationRequest): ChildTraversalPreparationResult;
}>;
