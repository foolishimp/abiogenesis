import { admitRuntimeFailure, } from "../abg/index.js";
import { deepFreeze } from "../shared/immutable.js";
export function isGraphTraversalEntryRefusal(value) {
    return typeof value === "object" && value !== null &&
        value.kind ===
            "graph_traversal_entry_refusal";
}
export function refuseTraversalEntry(input) {
    return deepFreeze({
        kind: "graph_traversal_entry_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: input.code,
        message: input.message,
        diagnosticRef: input.diagnosticRef,
        candidate: input.candidate,
        priorAdmission: input.priorAdmission ?? null,
    });
}
export function projectGraphTraversalFailure(failure) {
    return deepFreeze({
        kind: "graph_traversal_failure_result",
        schemaVersion: "5.0.0",
        disposition: "failed",
        code: "owner_refusal",
        message: failure.message,
        diagnosticRef: failure.diagnosticRef,
        successorPrefix: failure.receipt.successorPrefix,
        receipt: failure.receipt,
    });
}
export class GraphTraversalFailure extends TypeError {
    diagnosticRef;
    receipt;
    kind = "graph_traversal_failure";
    schemaVersion = "5.0.0";
    constructor(diagnosticRef, receipt) {
        super(diagnosticRef);
        this.diagnosticRef = diagnosticRef;
        this.receipt = receipt;
    }
}
export function failTraversal(input) {
    const receipt = admitRuntimeFailure({
        store: input.store,
        predecessorPrefix: input.predecessorPrefix,
        executionBasis: input.executionBasis,
        scope: input.openedTraversalScope,
        stage: "hog_traversal",
        subject: { stage: input.stage, candidate: input.candidate },
        diagnosticRef: input.diagnosticRef,
        basis: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/${input.stage}`,
            causationEventRefs: [],
        },
    });
    throw new GraphTraversalFailure(input.diagnosticRef, receipt);
}
