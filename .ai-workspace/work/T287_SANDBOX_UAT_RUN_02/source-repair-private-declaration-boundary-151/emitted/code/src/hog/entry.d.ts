import { type AbgEventStore, type ActorRuntimeBinding, type ExecutionBasis, type OpenedTraversalScope } from "../abg/index.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { ExecuteGraphTraversalInput, InitialOrNonRetryExecuteGraphTraversalInput, GraphTraversalEntryRefusal, InteractionResumeTraversalEntryInput } from "./traversal_contract.js";
import type { MachineEvaluationFrame } from "./evaluation_frame.js";
export declare function prepareInteractionResumeTraversalEntry(input: InteractionResumeTraversalEntryInput): InitialOrNonRetryExecuteGraphTraversalInput | GraphTraversalEntryRefusal;
export declare function enterTraversal(input: ExecuteGraphTraversalInput): MachineEvaluationFrame;
import type { PreparedConstructionContinuationOperation } from "../abg/construction_continuation.js";
import type { HeldWorkflowSuspension } from "./traversal_completion.js";
/** Recreate only current owned scopes around the conserved original position.
 * All children still enter through the ordinary fixed-workflow owner. */
export declare function prepareConstructionContinuationTraversal(input: Readonly<{
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    operation: PreparedConstructionContinuationOperation;
    leafPort: LeafInvocationPort;
    continuationProductBasis: InteractionResumeTraversalEntryInput["continuationProductBasis"];
    actorRuntimeBinding: ActorRuntimeBinding;
    eventTime: string;
    correlationId: string;
}>): Readonly<{
    current: InitialOrNonRetryExecuteGraphTraversalInput;
    parentSuspensions: readonly HeldWorkflowSuspension[];
    constructionResume: true;
    rootScope: OpenedTraversalScope;
    rootBasis: ExecutionBasis;
    continuation: Readonly<{
        continuationRef: string;
        continuationDigest: `sha256:${string}`;
        openedEventRef: string;
        terminalEventRef: null;
        status: "open";
        predecessorContinuationRef: string;
        runId: string;
        graphCallId: string;
        frameId: string;
        executionBasisRef: string;
        executionBasisDigest: `sha256:${string}`;
        parentExecutionBasisRef: string;
        parentCCallRef: string;
        heldCursorRef: string;
        heldCursorDigest: `sha256:${string}`;
        causedByEventRef: string;
        continuationKind: "construction_intent";
        cCallRef: string;
        constructionIntentRef: string;
        constructionIntentDigest: import("../shared/digests.js").Sha256Digest;
        intentAdmissionEventRef: string;
        preparationEvidenceEventRef: string;
        preparationResultRef: string;
        preparationJudgmentRef: string;
    }>;
}>;
