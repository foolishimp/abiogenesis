import { type AbgEventStore, type ExecutionBasis, type OpenedTraversalScope } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type TraversalCursor } from "./traversal.js";
export type StructuralTerm = Exclude<Readonly<CProgramNode>, Readonly<{
    kind: "c_of" | "c_workflow";
}>>;
export interface StructuralTransitionInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly leafPort: LeafInvocationPort;
    readonly cursor: TraversalCursor;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly term: StructuralTerm;
    readonly ordinal: number;
    readonly structuralOrdinal: number;
    readonly eventTime: string;
    readonly correlationId: string;
}
export interface StructuralTransitionAdvance {
    readonly kind: "structural_advance";
    readonly cursor: TraversalCursor;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export declare function advanceStructuralTransition(input: StructuralTransitionInput): StructuralTransitionAdvance;
