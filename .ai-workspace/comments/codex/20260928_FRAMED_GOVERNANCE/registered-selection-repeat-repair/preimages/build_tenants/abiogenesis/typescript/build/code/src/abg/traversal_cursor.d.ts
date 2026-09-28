import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type GraphValidation } from "../validator/graph.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type OpenedTraversalScope } from "./open_call.js";
import type { RuntimeEvent } from "./event_store.js";
export interface TraversalCursorCandidate {
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
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly currentNodeRef: string;
    readonly position: "at_compute_locus" | "at_term";
    readonly termPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
}
export type TraversalCursorBody = Omit<TraversalCursorCandidate, "kind" | "schemaVersion" | "cursorRef" | "cursorDigest">;
export interface TraversalCursorAdmission {
    readonly kind: "traversal_cursor_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly cursorRef: string;
    readonly cursorDigest: Sha256Digest;
    readonly traversalScopeRef: string;
    readonly executionBasisRef: string;
    readonly admissionEventRef: string;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface TraversalCursorAdmissionRefusal {
    readonly kind: "traversal_cursor_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_mismatch" | "cursor_mismatch" | "cursor_not_initial" | "cursor_repeated" | "graph_mismatch" | "scope_mismatch";
    readonly message: string;
}
export type TraversalCursorAdmissionResult = TraversalCursorAdmission | TraversalCursorAdmissionRefusal;
export declare function constructTraversalCursorCandidate(body: TraversalCursorBody): TraversalCursorCandidate;
/** The three existing cursor origins share one identity and scope relation.
 * A route carries its target identity, not a duplicate cursor/input body. */
export declare function traversalCursorAdmissionEventsAtPrefix(prefix: ValidatedRuntimeEventPrefix, cursor: Readonly<{
    cursorRef: string;
    runId: string;
    graphCallId: string;
    frameId: string;
    executionBasisRef: string;
}>): readonly RuntimeEvent[];
export declare function traversalCursorAdmissionDigest(event: RuntimeEvent): JsonValue | undefined;
export declare function traversalCursorAdmissionEventRefAtPrefix(prefix: ValidatedRuntimeEventPrefix, cursor: TraversalCursorCandidate): string | null;
export declare function isTraversalCursorCandidate(cursor: TraversalCursorCandidate): boolean;
export declare function hasAdmittedTraversalCursorAtPrefix(prefix: ValidatedRuntimeEventPrefix, cursor: TraversalCursorCandidate): boolean;
interface TraversalInputOrigin {
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly value: JsonValue;
    readonly event: RuntimeEvent | null;
    readonly retained?: true;
}
/** A current input is one admitted cursor's exact reference, value and origin.
 * Both execution and historical recovery consume this read-only relation. */
export declare function projectTraversalInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, execution: ExecutionBasis, cursor: TraversalCursorCandidate): TraversalInputOrigin | null;
/** Historical calls retain their opened cursor even after failure/closure. */
export declare function projectOpenedCCallTraversalInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, cCallRef: string): {
    cursor: TraversalCursorCandidate;
    input: TraversalInputOrigin;
    execution: ExecutionBasis;
} | null;
/** Select the actual enclosing batch entry on this cursor's admitted ancestry.
 * No invocation-entry fallback, new state ledger or stored cursor copy. */
export declare function deriveAdmittedCContinuationTarget(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, source: TraversalCursorCandidate, completed: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>): import("../gtl/source_path.js").CSourcePathRefusal | import("../gtl/source_path.js").CContinuationTarget;
/** Identity completion has the same batch-entry transfer as a completed leaf. */
export declare function deriveAdmittedCStructuralTarget(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, source: TraversalCursorCandidate, routeKind: "advance" | "retry"): import("../gtl/source_path.js").CSourcePathRefusal | import("../gtl/source_path.js").CTraversalTarget | null;
export declare function isInteractionResumeCursorSuccessorAtPrefix(prefix: ValidatedRuntimeEventPrefix, heldCursor: TraversalCursorCandidate, successorInput: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>, successorCursor: TraversalCursorCandidate): boolean;
export declare function isTraversalCursorAdmission(value: object): boolean;
export declare function admitInitialTraversalCursor(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, executionBasis: ExecutionBasis, scope: OpenedTraversalScope, graph: Readonly<GtlGraph>, graphValidation: GraphValidation, cursor: TraversalCursorCandidate, basis: RuntimeAdmissionBasis): TraversalCursorAdmissionResult;
export {};
