import { type AbgEventStore, type ExecutionBasis, type OpenedTraversalScope, type RuntimeFailureAdmissionReceipt } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphTraversalEntryRefusal, GraphTraversalFailureResult } from "./traversal_contract.js";
export declare function isGraphTraversalEntryRefusal(value: unknown): value is GraphTraversalEntryRefusal;
export declare function refuseTraversalEntry(input: Readonly<{
    code: GraphTraversalEntryRefusal["code"];
    message: string;
    diagnosticRef: string;
    candidate: JsonValue;
    priorAdmission?: GraphTraversalEntryRefusal["priorAdmission"];
}>): GraphTraversalEntryRefusal;
export declare function projectGraphTraversalFailure(failure: GraphTraversalFailure): GraphTraversalFailureResult;
export declare class GraphTraversalFailure extends TypeError {
    readonly diagnosticRef: string;
    readonly receipt: RuntimeFailureAdmissionReceipt;
    readonly kind: "graph_traversal_failure";
    readonly schemaVersion: "5.0.0";
    constructor(diagnosticRef: string, receipt: RuntimeFailureAdmissionReceipt);
}
export declare function failTraversal(input: Readonly<{
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    executionBasis: ExecutionBasis;
    openedTraversalScope: OpenedTraversalScope;
    eventTime: string;
    correlationId: string;
    stage: string;
    diagnosticRef: string;
    candidate: JsonValue;
}>): never;
