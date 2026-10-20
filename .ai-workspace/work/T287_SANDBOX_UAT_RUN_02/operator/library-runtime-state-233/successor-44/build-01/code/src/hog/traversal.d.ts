import { type ExecutionBasis } from "../abg/execution_basis.js";
import { type CCallLocusCandidate } from "../abg/c_call.js";
import { type OpenedTraversalScope } from "../abg/open_call.js";
import { type AdmittedRoute } from "../abg/traversal_route.js";
import { type TraversalCursorCandidate } from "../abg/traversal_cursor.js";
import type { ValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { GraphFunction, GtlGraph, GtlProgram, ReenterApplication, RecurseApplication } from "../gtl/contracts.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type GraphValidation } from "../validator/graph.js";
export type TraversalCursor = TraversalCursorCandidate;
export interface TraversalRefusal {
    readonly kind: "traversal_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "execution_basis_mismatch" | "graph_mismatch" | "locus_missing" | "program_mismatch" | "route_mismatch" | "scope_not_admitted" | "traversal_cursor_mismatch";
    readonly message: string;
}
export interface TraverseInput {
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphValidation: GraphValidation;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
}
export type TraverseResult = TraversalCursor | CCallLocusCandidate | TraversalRefusal;
export interface TraversalInputBasis {
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
}
export declare function rehydrateHeldInteractionCursor(prefix: ValidatedRuntimeEventPrefix, candidate: TraversalCursorCandidate): TraversalCursor | null;
export declare function resolveTraversalTerm(graph: Readonly<GtlGraph>, cursor: TraversalCursor): CProgramNode | TraversalRefusal;
export declare function deriveStructuralTargetCursor(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, term: Readonly<CProgramNode>, prefix?: ValidatedRuntimeEventPrefix): TraversalCursor | TraversalRefusal | null;
export declare function deriveCompletedTraversalCursor(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, completedInput: TraversalInputBasis, prefix?: ValidatedRuntimeEventPrefix): TraversalCursor | TraversalRefusal | null;
export declare function deriveRetryTraversalCursor(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, retryInput: TraversalInputBasis): TraversalCursor | TraversalRefusal;
export declare function deriveInteractionSuccessorInputCarrierRef(graph: Readonly<GtlGraph>, heldCursor: TraversalCursor): string | null;
export declare function deriveGraphSpanReentryCursor(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, application: Readonly<ReenterApplication>, targetInput: TraversalInputBasis): TraversalCursor | TraversalRefusal;
export declare function deriveInteractionResumeCursor(heldCursor: TraversalCursor, responseInput: TraversalInputBasis): TraversalCursor | TraversalRefusal;
export declare function deriveRecursionReentryCursor(graph: Readonly<GtlGraph>, application: Readonly<RecurseApplication>, sourceCursor: TraversalCursor, foldedInput: TraversalInputBasis): TraversalCursor | TraversalRefusal;
export declare function applyRecursionRoute(prefix: ValidatedRuntimeEventPrefix, sourceCursor: TraversalCursor, targetCursor: TraversalCursor, route: AdmittedRoute): TraversalCursor | TraversalRefusal;
export declare function traverseFromCursor(input: TraverseInput, cursor: TraversalCursor, term?: Readonly<CProgramNode>): TraverseResult;
export declare function applyAdmittedRoute(prefix: ValidatedRuntimeEventPrefix, sourceCursor: TraversalCursor, targetCursor: TraversalCursor, expectedKind: "advance" | "re_enter" | "retry", route: AdmittedRoute, authorityPrefix?: ValidatedRuntimeEventPrefix): TraversalCursor | TraversalRefusal;
export declare function traverse(input: TraverseInput): TraverseResult;
