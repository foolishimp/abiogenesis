import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
/** A projection of an actual selected but undispatched consumer. It grants no
 * execution. Declaration, support, input and current-operation admission remain
 * required before any replacement scope can be opened. */
export interface ConstructionIntentContinuation {
    readonly continuationKind: "construction_intent";
    readonly continuationRef: string;
    readonly continuationDigest: Sha256Digest;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly heldCursorRef: string;
    readonly heldCursorDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly parentExecutionBasisRef: string;
    readonly parentCCallRef: string;
    readonly constructionIntentRef: string;
    readonly constructionIntentDigest: Sha256Digest;
    readonly intentAdmissionEventRef: string;
    readonly preparationEvidenceEventRef: string;
    readonly preparationResultRef: string;
    readonly preparationJudgmentRef: string;
    readonly causedByEventRef: string;
    readonly openedEventRef: string;
    readonly terminalEventRef: string | null;
    readonly status: "open" | "superseded" | "resolved";
    readonly predecessorContinuationRef?: string;
}
/** The existing failure is the cause; this event admits unresolved obligation,
 * not a retry decision. It can be opened after Run activity has terminated. */
export declare function admitPendingConstructionIntentContinuation(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, runId: string, eventTime: string, correlationId: string): DurablePrefixCoordinate;
export declare function projectConstructionIntentContinuations(prefix: ValidatedRuntimeEventPrefix, runId: string): readonly ConstructionIntentContinuation[];
import type { LoadedProductExecutionResolution } from "../product/execution_resolution.js";
/** Exact declaration/application preflight. Only immutable pure producer
 * support is selected here; mutable/opaque dependency claims need their owning
 * validity relation and are outside this bounded entry. */
export declare function prepareConstructionIntentContinuation(prefix: ValidatedRuntimeEventPrefix, selected: ConstructionIntentContinuation, resolution: LoadedProductExecutionResolution): Readonly<{
    continuation: ConstructionIntentContinuation;
    root: ExecutionBasis;
    child: ExecutionBasis;
    rootGraph: Readonly<import("../index.js").GtlGraph>;
    childGraph: Readonly<import("../index.js").GtlGraph>;
    rootValidation: import("../validator/graph.js").GraphValidation;
    childValidation: import("../validator/graph.js").GraphValidation;
    childFunction: import("../index.js").GraphFunction;
    rootScope: OpenedTraversalScope;
    childScope: OpenedTraversalScope;
    parent: {
        cursor: TraversalCursorCandidate;
        input: import("./traversal_cursor.js").TraversalInputOrigin;
        execution: ExecutionBasis;
    };
    pending: {
        cursor: TraversalCursorCandidate;
        input: import("./traversal_cursor.js").TraversalInputOrigin;
        execution: ExecutionBasis;
    };
    parentTerm: import("../index.js").CWorkflowNode;
    pendingTerm: import("../index.js").COfNode;
    failedCall: CCall;
    producerCall: CCall;
    producer: RuntimeEvent;
    intent: import("./traversal_route.js").ConstructionIntentAdmission;
    invocation: import("./invocation_admission.js").InvocationAdmission;
    implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
    interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
    resolution: LoadedProductExecutionResolution;
    parentCall: CCall;
    parentInput: {
        readonly [key: string]: JsonValue;
    };
    pendingInput: {
        readonly [key: string]: JsonValue;
    };
}> | null;
export type PreparedConstructionIntentContinuation = NonNullable<ReturnType<typeof prepareConstructionIntentContinuation>>;
import { type CapabilityGrant } from "../product/invocation.js";
import { type PublicOperationAdmissionBasis } from "./environment_admission.js";
import type { RuntimeEventCandidate } from "./event_store.js";
/** The shared cold envelope join consumes the already reconstructed work grant.
 * Variant owners separately authenticate their exact pending source/use facts. */
export declare function continuationOperationWorkspaceCorresponds(operation: RuntimeEvent, invocation: NonNullable<ReturnType<typeof projectExactInvocationAdmissionAtPrefix>>): boolean;
export declare function prepareConstructionContinuationOperation(prefix: ValidatedRuntimeEventPrefix, prepared: PreparedConstructionIntentContinuation, grant: CapabilityGrant, basis: PublicOperationAdmissionBasis): Readonly<{
    kind: "effectful_public_invocation_truth";
    schemaVersion: "5.0.0";
    disposition: "duplicate";
    invocationRef: string;
    prefix: ValidatedRuntimeEventPrefix | DurablePrefixCoordinate;
    priorAdmission: import("./effectful_invocation_truth.js").EffectfulPublicInvocationPriorAdmission;
}> | Readonly<{
    kind: "effectful_public_invocation_truth_invalid_history";
    schemaVersion: "5.0.0";
    disposition: "invalid_history";
    code: "artifact_truth_invalid" | "duplicate_outer_invocation" | "invocation_pair_invalid" | "prefix_invalid";
    invocationRef: string;
    prefix: ValidatedRuntimeEventPrefix | DurablePrefixCoordinate;
    eventRefs: readonly string[];
    artifactTruthCode: import("./artifact_truth.js").ExactPrefixArtifactTruthProjectionRefusalCode | null;
}> | Readonly<{
    kind: "prepared_construction_continuation_operation";
    prepared: Readonly<{
        continuation: ConstructionIntentContinuation;
        root: ExecutionBasis;
        child: ExecutionBasis;
        rootGraph: Readonly<import("../index.js").GtlGraph>;
        childGraph: Readonly<import("../index.js").GtlGraph>;
        rootValidation: import("../validator/graph.js").GraphValidation;
        childValidation: import("../validator/graph.js").GraphValidation;
        childFunction: import("../index.js").GraphFunction;
        rootScope: OpenedTraversalScope;
        childScope: OpenedTraversalScope;
        parent: {
            cursor: TraversalCursorCandidate;
            input: import("./traversal_cursor.js").TraversalInputOrigin;
            execution: ExecutionBasis;
        };
        pending: {
            cursor: TraversalCursorCandidate;
            input: import("./traversal_cursor.js").TraversalInputOrigin;
            execution: ExecutionBasis;
        };
        parentTerm: import("../index.js").CWorkflowNode;
        pendingTerm: import("../index.js").COfNode;
        failedCall: CCall;
        producerCall: CCall;
        producer: RuntimeEvent;
        intent: import("./traversal_route.js").ConstructionIntentAdmission;
        invocation: import("./invocation_admission.js").InvocationAdmission;
        implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
        interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
        resolution: LoadedProductExecutionResolution;
        parentCall: CCall;
        parentInput: {
            readonly [key: string]: JsonValue;
        };
        pendingInput: {
            readonly [key: string]: JsonValue;
        };
    }>;
    candidate: RuntimeEventCandidate;
    predecessorDigest: `sha256:${string}`;
}>;
export type PreparedConstructionContinuationOperation = Extract<ReturnType<typeof prepareConstructionContinuationOperation>, {
    kind: "prepared_construction_continuation_operation";
}>;
export declare function isPreparedConstructionContinuationOperation(value: object): value is PreparedConstructionContinuationOperation;
import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import type { CCall } from "./c_call.js";
export declare function admitConstructionContinuationReentry(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, operation: PreparedConstructionContinuationOperation, root: ExecutionBasis, rootScope: OpenedTraversalScope, child: ExecutionBasis, childScope: OpenedTraversalScope, parentCall: CCall, cursor: TraversalCursorCandidate, basis: RuntimeAdmissionBasis): Readonly<{
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
        constructionIntentDigest: Sha256Digest;
        intentAdmissionEventRef: string;
        preparationEvidenceEventRef: string;
        preparationResultRef: string;
        preparationJudgmentRef: string;
    }>;
    successorPrefix: DurablePrefixCoordinate;
}>;
/** A selected route is the occurrence. This projection neither opens another
 * intent nor grants permission to run it. */
export interface SelectedActionContinuation {
    readonly continuationKind: "selected_action";
    readonly continuationRef: string;
    readonly continuationDigest: Sha256Digest;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly heldCursorRef: string;
    readonly heldCursorDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly constructionIntentRef: string;
    readonly constructionIntentDigest: Sha256Digest;
    readonly selectedActionRef: string;
    readonly selectedActionDigest: Sha256Digest;
    readonly intentAdmissionEventRef: string;
    readonly causedByEventRef: string;
    readonly openedEventRef: string;
    readonly terminalEventRef: string | null;
    readonly status: "open" | "consumed" | "resolved" | "superseded" | "abandoned";
}
export declare function projectSelectedActionContinuations(prefix: ValidatedRuntimeEventPrefix, runId: string): readonly SelectedActionContinuation[];
type SelectedCoordinate = Readonly<{
    ref: string;
    digest: string;
}>;
export type SelectedActionUseRequest = Readonly<{
    run: SelectedCoordinate;
    continuation: SelectedCoordinate;
    selectedAction: SelectedCoordinate;
    basisRelation: Readonly<{
        kind: "same_basis";
    }> | Readonly<{
        kind: "authority_changed";
        coveringReprice: SelectedCoordinate;
    }>;
}>;
/** Same owner predicate for new admission and cold operation correspondence. A
 * covering witness never substitutes for a fresh current semantic selection. */
export declare function selectPendingActionUse(prefix: ValidatedRuntimeEventPrefix, request: SelectedActionUseRequest): Readonly<{
    kind: "selected_action_use";
    source: SelectedActionContinuation;
    current: SelectedActionContinuation;
    sourceBasis: ExecutionBasis;
    currentBasis: ExecutionBasis;
    invocation: import("./invocation_admission.js").InvocationAdmission;
    coveringEventRef: string | null;
    request: Readonly<{
        run: SelectedCoordinate;
        continuation: SelectedCoordinate;
        selectedAction: SelectedCoordinate;
        basisRelation: Readonly<{
            kind: "same_basis";
        }> | Readonly<{
            kind: "authority_changed";
            coveringReprice: SelectedCoordinate;
        }>;
    }>;
}> | {
    kind: "refused";
    code: "missing_continuation";
} | {
    kind: "refused";
    code: "resolved_continuation";
} | {
    kind: "refused";
    code: "basis_mismatch";
} | {
    kind: "refused";
    code: "stale_action";
} | {
    kind: "refused";
    code: "action_mismatch";
} | {
    kind: "refused";
    code: "reprice_mismatch";
};
export declare function prepareSelectedActionContinuation(prefix: ValidatedRuntimeEventPrefix, use: Extract<ReturnType<typeof selectPendingActionUse>, {
    kind: "selected_action_use";
}>, resolution: LoadedProductExecutionResolution): Readonly<{
    use: Readonly<{
        kind: "selected_action_use";
        source: SelectedActionContinuation;
        current: SelectedActionContinuation;
        sourceBasis: ExecutionBasis;
        currentBasis: ExecutionBasis;
        invocation: import("./invocation_admission.js").InvocationAdmission;
        coveringEventRef: string | null;
        request: Readonly<{
            run: SelectedCoordinate;
            continuation: SelectedCoordinate;
            selectedAction: SelectedCoordinate;
            basisRelation: Readonly<{
                kind: "same_basis";
            }> | Readonly<{
                kind: "authority_changed";
                coveringReprice: SelectedCoordinate;
            }>;
        }>;
    }>;
    root: ExecutionBasis;
    graph: Readonly<import("../index.js").GtlGraph>;
    graphValidation: import("../validator/graph.js").GraphValidation;
    cursor: TraversalCursorCandidate;
    input: import("./traversal_cursor.js").TraversalInputOrigin;
    inputValue: {
        readonly [key: string]: JsonValue;
    };
    intent: import("./traversal_route.js").ConstructionIntentAdmission;
    term: import("../index.js").CWorkflowNode;
    scope: OpenedTraversalScope;
    implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
    interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
    resolution: LoadedProductExecutionResolution;
    predecessorDigest: `sha256:${string}`;
}> | null;
export type PreparedSelectedActionContinuation = NonNullable<ReturnType<typeof prepareSelectedActionContinuation>>;
export declare function admitSelectedActionContinuationOperation(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, prepared: PreparedSelectedActionContinuation, grant: CapabilityGrant, basis: PublicOperationAdmissionBasis): import("./event_store.js").RuntimeEventTransactionResult<RuntimeEvent>;
/** Cold validation consumes the same admission relation at its actual predecessor. */
export declare function projectSelectedActionOperation(prefix: ValidatedRuntimeEventPrefix, operation: RuntimeEvent): {
    operationId: "abg.operation.run.continue";
    publicInvocationRef: string;
    ownerInvocationRef: string;
    ownerInvocationDigest: Sha256Digest;
    publicOperationEventRef: string;
    admissionEventRef: string;
} | null;
export {};
