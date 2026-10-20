import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
export interface OpenedRun {
    readonly runId: string;
    readonly runDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly workspaceBindingId: string;
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly graphRef: string;
    readonly graphDigest: Sha256Digest;
    readonly openEventRef: string;
}
export interface OpenedGraphCall {
    readonly graphCallId: string;
    readonly graphCallDigest: Sha256Digest;
    readonly runId: string;
    readonly executionBasisRef: string;
    readonly invocationRef: string;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly graphRef: string;
    readonly graphDigest: Sha256Digest;
    readonly parentFrameId?: string;
    readonly openEventRef: string;
}
export interface OpenedFrame {
    readonly frameId: string;
    readonly frameDigest: Sha256Digest;
    readonly frameLineageId: string;
    readonly attempt: number;
    readonly parentFrameId: string | null;
    readonly runId: string;
    readonly graphCallId: string;
    readonly executionBasisRef: string;
    readonly invocationRef: string;
    readonly admittedInputRef: string;
    readonly admittedInputDigest: Sha256Digest;
    readonly openEventRef: string;
}
export interface OpenedTraversalScope {
    readonly kind: "opened_traversal_scope";
    readonly schemaVersion: "5.0.0";
    readonly scopeRef: string;
    readonly scopeDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly graphRef: string;
    readonly runId: string;
    readonly runDigest: Sha256Digest;
    readonly runOpenEventRef: string;
    readonly graphCallId: string;
    readonly graphCallDigest: Sha256Digest;
    readonly graphCallOpenEventRef: string;
    readonly frameId: string;
    readonly frameDigest: Sha256Digest;
    readonly frameLineageId: string;
    readonly frameOpenEventRef: string;
}
export interface OpenTraversalScopeAdmission {
    readonly kind: "traversal_scope_open_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "opened";
    readonly scopeClass: "root" | "child";
    readonly run: OpenedRun | null;
    readonly graphCall: OpenedGraphCall;
    readonly frame: OpenedFrame;
    readonly scope: OpenedTraversalScope;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface OpenTraversalScopeRefusal {
    readonly kind: "traversal_scope_open_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "execution_basis_already_opened" | "execution_basis_not_admitted" | "child_basis_already_opened" | "child_basis_not_admitted" | "parent_scope_mismatch";
    readonly message: string;
}
export type TraversalScopeOpenSubject = Readonly<{
    kind: "root";
    executionBasis: ExecutionBasis;
}> | Readonly<{
    kind: "child";
    executionBasis: ExecutionBasis;
    parentScope: OpenedTraversalScope;
}>;
export type OpenTraversalScopeResult = OpenTraversalScopeAdmission | OpenTraversalScopeRefusal;
export declare function isOpenedTraversalScope(value: object): boolean;
export declare function hasOpenedTraversalScopeAtPrefix(prefix: ValidatedRuntimeEventPrefix, scope: OpenedTraversalScope): boolean;
/**
 * Projects root/child class only from the exact admitted scope lineage.
 * Callers cannot select closure scope with an imperative mode flag.
 */
export declare function projectOpenedTraversalScopeClassAtPrefix(prefix: ValidatedRuntimeEventPrefix, scope: OpenedTraversalScope): "root" | "child" | null;
export declare function projectOpenedTraversalScopeClassAtDurablePrefix(predecessorPrefix: DurablePrefixCoordinate, scope: OpenedTraversalScope): "root" | "child" | null;
export declare function rehydrateOpenedTraversalScope(store: AbgEventStore, value: Readonly<Record<string, JsonValue>>): OpenedTraversalScope | null;
export declare function rehydrateOpenedTraversalScopeAtPrefix(prefix: ValidatedRuntimeEventPrefix, value: Readonly<Record<string, JsonValue>>): OpenedTraversalScope | null;
/**
 * Opens one root or child traversal scope through the single ABG lifecycle
 * algebra. Root adds Run.open; both variants share the exact GraphCall,
 * Frame, scope identity, and expected-prefix commit relations.
 */
export declare function openTraversalScope(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, subject: TraversalScopeOpenSubject, basis: RuntimeAdmissionBasis): OpenTraversalScopeResult;
/** Cold selection by an admitted frame, sharing the existing scope validator.
 * The events remain the carrier; no persisted parent stack is reconstructed. */
export declare function projectOpenedTraversalScopeForFrameAtPrefix(prefix: ValidatedRuntimeEventPrefix, frameId: string): OpenedTraversalScope | null;
