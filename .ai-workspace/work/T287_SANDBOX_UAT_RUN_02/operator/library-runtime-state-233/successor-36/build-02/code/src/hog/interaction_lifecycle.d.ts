import type { AbgEventStore, AdmittedInteractionSet, ContinuationProductBasis, ExecutionBasis, InteractionCCallLocusCandidate, OpenedTraversalScope } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ClosureContract, GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type ExecutableTraversalCompletion } from "./traversal_completion.js";
export interface InteractionHoldInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly interactionSet: AdmittedInteractionSet;
    readonly continuationProductBasis?: ContinuationProductBasis;
    readonly closureContract: Readonly<ClosureContract>;
    readonly stop: InteractionCCallLocusCandidate;
    readonly value: Readonly<Record<string, JsonValue>>;
    readonly ordinal: number;
    readonly eventTime: string;
    readonly correlationId: string;
}
export interface InteractionHoldEvaluation {
    readonly completion: ExecutableTraversalCompletion;
    readonly outputValueKind: null;
    readonly outputContractRef: null;
}
export declare function holdInteraction(input: InteractionHoldInput): InteractionHoldEvaluation;
