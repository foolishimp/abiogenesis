import type { GraphFunction, GtlGraph, RecurseApplication } from "../gtl/contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type OpenedTraversalScope } from "./open_call.js";
import { type ReplayRouteState } from "./replay.js";
import { type AdmittedCCallJudgment, type AdmittedCCallResult, type CCall, type ChildFoldbackAdmission, type ChildFoldbackRefusal, type ChildPreparationRefusalAdmission, type ChildPreparationRefusalCandidate, type ChildPreparationRefusalRefusal } from "./c_call.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
export interface ApplicationChildFoldbackAdmission {
    readonly kind: "application_child_foldback_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly foldbackRef: string;
    readonly foldbackDigest: Sha256Digest;
    readonly applicationRef: string;
    readonly applicationFoldbackRef: string;
    readonly parentCCallRef: string;
    readonly parentJudgmentRef: string;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: Sha256Digest;
    readonly childExecutionBasisRef: string;
    readonly childExecutionBasisDigest: Sha256Digest;
    readonly childGraphCallId: string;
    readonly childFrameId: string;
    readonly childDisposition: "blocked" | "closed";
    readonly childResultRef: string;
    readonly childResultDigest: Sha256Digest;
    readonly childJudgmentRef: string;
    readonly childClosureRef: string | null;
    readonly childReasonRef: string | null;
    readonly childTerminalEventRef: string;
    readonly outputDigest: Sha256Digest;
    readonly admissionEventRef: string;
}
export interface ApplicationChildFoldbackRefusal {
    readonly kind: "application_child_foldback_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "application_mismatch" | "child_truth_mismatch" | "parent_truth_mismatch";
    readonly message: string;
}
export type ApplicationChildFoldbackResult = ApplicationChildFoldbackReceipt | ApplicationChildFoldbackRefusal;
export interface ApplicationChildFoldbackReceipt {
    readonly kind: "application_child_foldback_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly admission: ApplicationChildFoldbackAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ApplicationChildPreparationRefusalAdmission {
    readonly kind: "application_child_preparation_refusal_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly refusalRef: string;
    readonly refusalDigest: Sha256Digest;
    readonly applicationRef: string;
    readonly parentCCallRef: string;
    readonly parentJudgmentRef: string;
    readonly sourceCursorRef: string;
    readonly childGraphFunctionRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly stage: "basis_admission" | "graph_materialization" | "graph_validation" | "membership" | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
    readonly admissionEventRef: string;
}
export interface ApplicationChildPreparationRefusalRefusal {
    readonly kind: "application_child_preparation_refusal_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "application_mismatch" | "candidate_mismatch";
    readonly message: string;
}
export type ApplicationChildPreparationRefusalResult = ApplicationChildPreparationRefusalReceipt | ApplicationChildPreparationRefusalRefusal;
export interface ApplicationChildPreparationRefusalReceipt {
    readonly kind: "application_child_preparation_refusal_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly admission: ApplicationChildPreparationRefusalAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type ChildPreparationRefusalInput = Readonly<{
    relationClass: "workflow";
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    graph: Readonly<GtlGraph>;
    graphFunction: Readonly<GraphFunction>;
    cursor: TraversalCursorCandidate;
    parentCCall: CCall;
    candidate: ChildPreparationRefusalCandidate;
    basis: RuntimeAdmissionBasis;
}> | Readonly<{
    relationClass: "recursive_application";
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    executionBasis: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    application: Readonly<RecurseApplication>;
    parentCCall: CCall;
    parentResult: AdmittedCCallResult;
    parentJudgment: AdmittedCCallJudgment;
    sourceCursor: TraversalCursorCandidate;
    candidate: ChildPreparationRefusalCandidate;
    basis: RuntimeAdmissionBasis;
}>;
export type ChildPreparationRefusalResult = ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal | ApplicationChildPreparationRefusalReceipt | ApplicationChildPreparationRefusalRefusal;
export type ChildFoldbackInput = Readonly<{
    relationClass: "workflow";
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    graph: Readonly<GtlGraph>;
    graphFunction: Readonly<GraphFunction>;
    cursor: TraversalCursorCandidate;
    parentCCall: CCall;
    childExecutionBasis: ExecutionBasis;
    childScope: OpenedTraversalScope;
    child: Readonly<{
        childResultRef: string;
        childJudgmentRef: string;
        childClosureRef: string | null;
    }>;
    basis: RuntimeAdmissionBasis;
}> | Readonly<{
    relationClass: "recursive_application";
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    parentExecutionBasis: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    application: Readonly<RecurseApplication>;
    parentCCall: CCall;
    parentJudgmentRef: string;
    sourceCursor: TraversalCursorCandidate;
    childExecutionBasis: ExecutionBasis;
    childScope: OpenedTraversalScope;
    child: Readonly<{
        resultRef: string;
        judgmentRef: string;
        closureRef: string | null;
    }>;
    basis: RuntimeAdmissionBasis;
}>;
export type ChildFoldbackResult = ChildFoldbackAdmission | ChildFoldbackRefusal | ApplicationChildFoldbackReceipt | ApplicationChildFoldbackRefusal;
export declare function isAdmittedApplicationChildFoldback(store: AbgEventStore, value: ApplicationChildFoldbackAdmission): value is ApplicationChildFoldbackAdmission;
export declare function isAdmittedApplicationChildFoldbackAtPrefix(prefix: ValidatedRuntimeEventPrefix, value: ApplicationChildFoldbackAdmission): value is ApplicationChildFoldbackAdmission;
export declare function isAdmittedApplicationChildPreparationRefusal(store: AbgEventStore, value: ApplicationChildPreparationRefusalAdmission): value is ApplicationChildPreparationRefusalAdmission;
export declare function isAdmittedApplicationChildPreparationRefusalAtPrefix(prefix: ValidatedRuntimeEventPrefix, value: ApplicationChildPreparationRefusalAdmission): value is ApplicationChildPreparationRefusalAdmission;
export declare function projectCurrentApplicationChildPreparationRefusal(store: AbgEventStore, coordinates: Readonly<{
    runId: string;
    refusalRef: string;
}>): ApplicationChildPreparationRefusalAdmission | null;
export declare function projectApplicationChildPreparationRefusalAtPrefix(prefix: ValidatedRuntimeEventPrefix, coordinates: Readonly<{
    runId: string;
    refusalRef: string;
}>): ApplicationChildPreparationRefusalAdmission | null;
export declare function projectCurrentApplicationChildFoldback(store: AbgEventStore, coordinates: Readonly<{
    runId: string;
    foldbackRef: string;
}>): ApplicationChildFoldbackAdmission | null;
export declare function projectApplicationChildFoldbackAtPrefix(prefix: ValidatedRuntimeEventPrefix, coordinates: Readonly<{
    runId: string;
    foldbackRef: string;
}>): ApplicationChildFoldbackAdmission | null;
export declare function projectCurrentApplicationChildRoute(store: AbgEventStore, coordinates: Readonly<{
    runId: string;
    graphCallId: string;
    frameId: string;
    cCallRef: string;
    judgmentRef: string;
}>): ReplayRouteState | null;
export declare function projectApplicationChildRouteAtPrefix(prefix: ValidatedRuntimeEventPrefix, authorityPrefix: ValidatedRuntimeEventPrefix, coordinates: Readonly<{
    runId: string;
    graphCallId: string;
    frameId: string;
    cCallRef: string;
    judgmentRef: string;
}>): ReplayRouteState | null;
export declare function admitChildPreparationRefusal(input: Extract<ChildPreparationRefusalInput, Readonly<{
    relationClass: "workflow";
}>>): ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal;
export declare function admitChildPreparationRefusal(input: Extract<ChildPreparationRefusalInput, Readonly<{
    relationClass: "recursive_application";
}>>): ApplicationChildPreparationRefusalResult;
export declare function admitChildFoldback(input: Extract<ChildFoldbackInput, Readonly<{
    relationClass: "workflow";
}>>): ChildFoldbackAdmission | ChildFoldbackRefusal;
export declare function admitChildFoldback(input: Extract<ChildFoldbackInput, Readonly<{
    relationClass: "recursive_application";
}>>): ApplicationChildFoldbackResult;
