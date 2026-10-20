import type { ExecutionBasis } from "../abg/execution_basis.js";
import type { FhInteractionResumeAdmission } from "../abg/continuation.js";
import type { AbgEventStore, DurablePrefixCoordinate } from "../abg/event_store.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type { ClosureContract, GraphFunction, GtlGraph } from "../gtl/contracts.js";
import { type TraversalCursor } from "./traversal.js";
import { type ExecutableTraversalCompletion, type HeldInteractionTraversal } from "./traversal_completion.js";
export interface CompleteInteractionResumeInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly heldInteraction: HeldInteractionTraversal;
    readonly successorCursor: TraversalCursor;
    readonly resume: FhInteractionResumeAdmission;
    readonly closureContract: Readonly<ClosureContract>;
    readonly clock: Readonly<{
        eventTime: string;
        correlationId: string;
    }>;
}
export declare function completeInteractionResume(input: CompleteInteractionResumeInput): ExecutableTraversalCompletion;
