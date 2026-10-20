import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { graphFunctionApplicationRef, } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { sha256Canonical, } from "../shared/digests.js";
import { hasAdmittedExecutionBasisAtPrefix, } from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent, admitRuntimeEventTransactionAtDurablePrefix, assertHeldEventStoreAtDurablePrefix, readRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventPrefixDigest, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { projectExactFanOutCompletion, } from "./fan_out_projection.js";
import { replayValidatedRuntimeEventPrefix, } from "./replay.js";
import { hasAdmittedTraversalCursorAtPrefix, } from "./traversal_cursor.js";
function refusal(code, message) {
    return {
        kind: "fan_out_completion_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
class FanOutCompletionProjectionError extends TypeError {
}
export function admitFanOutCompletion(input) {
    try {
        assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    }
    catch {
        return refusal("replay_mismatch", "fan-out completion requires its exact durable predecessor");
    }
    const predecessorEvents = readRuntimeEventsAtDurablePrefix(input.predecessorPrefix);
    const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
    if (!hasAdmittedExecutionBasisAtPrefix(authorityPrefix, input.executionBasis) ||
        !isMaterializedGtlGraph(input.graph) ||
        input.executionBasis.graphRef !== input.graph.materializationRef ||
        input.graph.template.applications.find((candidate) => candidate.applicationRef === input.application.applicationRef) !== input.application ||
        input.application.relationKind !== "fan_out" ||
        input.application.applicationRef !== graphFunctionApplicationRef(input.application) ||
        !hasAdmittedTraversalCursorAtPrefix(authorityPrefix, input.sourceCursor) ||
        input.sourceCursor.executionBasisRef !== input.executionBasis.basisRef ||
        input.sourceCursor.frameId.length === 0) {
        return refusal("application_mismatch", "fan-out completion requires the exact admitted application, materialization, basis, and source cursor");
    }
    const authority = {
        graph: input.graph,
        application: input.application,
        basisId: input.executionBasis.basisRef,
        runId: input.sourceCursor.runId,
        graphCallId: input.sourceCursor.graphCallId,
        frameId: input.sourceCursor.frameId,
    };
    const expectedPrefixDigest = runtimeEventPrefixDigest(authorityPrefix);
    try {
        const committed = admitRuntimeEventTransactionAtDurablePrefix(input.store, input.predecessorPrefix, () => {
            const snapshot = input.store.readAll();
            const prefix = selectValidatedRuntimeEventPrefix(snapshot);
            const currentReplay = replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(snapshot, {
                runId: input.sourceCursor.runId,
            }), selectValidatedRuntimeEventPrefix(snapshot));
            if (currentReplay.replayDigest !== input.replayState.replayDigest) {
                return refusal("replay_mismatch", "fan-out completion is not based on current replay truth");
            }
            if (currentReplay.activeFluents.includes(`fan_out_vector_available(${input.application.applicationRef})`) ||
                currentReplay.activeFluents.includes(`fan_out_partial_stop_available(${input.application.applicationRef})`) ||
                snapshot.some((event) => event.kind === "fan_out_completion_admitted" &&
                    event.frameId === input.sourceCursor.frameId &&
                    isRecord(event.payload) &&
                    event.payload.applicationRef === input.application.applicationRef)) {
                return refusal("completion_already_admitted", "one fan-out application can admit only one completion variant per frame");
            }
            const candidate = projectExactFanOutCompletion(prefix, {
                mode: "candidate",
                expectedPrefixDigest,
                authority,
                completionKind: input.completionKind,
                validateOutputVector: input.validateOutputVector,
            });
            if (candidate === null ||
                candidate.kind !== "fan_out_completion_candidate_projection") {
                return refusal("task_census_mismatch", "fan-out completion requires one exact graph-bound task census and output partition");
            }
            const event = admitProjectedFanOutCompletion(input, candidate);
            const postPrefix = selectValidatedRuntimeEventPrefix(input.store.readAll());
            const projected = projectExactFanOutCompletion(postPrefix, {
                mode: "graph_bound",
                admissionEventRef: event.eventId,
                authority,
            });
            if (projected === null ||
                projected.kind !== "fan_out_completion_admission" ||
                projected.completionRef !== candidate.completionRef ||
                projected.completionDigest !== candidate.completionDigest) {
                throw new FanOutCompletionProjectionError("admitted fan-out completion did not reproject under its exact graph authority");
            }
            return projected;
        });
        if (committed.value.kind !== "fan_out_completion_admission") {
            return committed.value;
        }
        if (committed.successorPrefix === null) {
            return refusal("replay_mismatch", "fan-out completion produced no durable successor");
        }
        return Object.freeze({
            kind: "fan_out_completion_receipt",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            admission: committed.value,
            successorPrefix: committed.successorPrefix,
        });
    }
    catch (error) {
        if (error instanceof FanOutCompletionProjectionError ||
            (error instanceof TypeError && error.message ===
                "runtime event transaction requires the exact durable event predecessor")) {
            return refusal("replay_mismatch", "fan-out completion authority changed or failed exact post-append reprojection");
        }
        throw error;
    }
}
function admitProjectedFanOutCompletion(input, projection) {
    return admitRuntimeEvent(input.store, {
        kind: "fan_out_completion_admitted",
        eventTime: input.basis.eventTime,
        aggregateType: "frame",
        aggregateId: input.sourceCursor.frameId,
        parentAggregateId: input.sourceCursor.graphCallId,
        causationEventRefs: [...new Set([
                ...projection.requiredCausationEventRefs,
                ...input.basis.causationEventRefs,
            ])],
        correlationId: input.basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: input.executionBasis.basisRef,
        runId: input.sourceCursor.runId,
        graphFunctionRef: input.executionBasis.graphFunctionRef,
        materializationRef: input.graph.materializationRef,
        graphCallId: input.sourceCursor.graphCallId,
        frameId: input.sourceCursor.frameId,
        payload: {
            completionRef: projection.completionRef,
            completionDigest: projection.completionDigest,
            ...projection.completionBody,
        },
    });
}
