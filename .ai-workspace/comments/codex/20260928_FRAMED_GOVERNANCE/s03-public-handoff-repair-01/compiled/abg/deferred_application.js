import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "./event_calculus.js";
import { readRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { replayValidatedRuntimeEventPrefix, } from "./replay.js";
export function projectDeferredApplicationAtPrefix(predecessorPrefix, coordinates) {
    const snapshot = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
    const fullPrefix = selectValidatedRuntimeEventPrefix(snapshot);
    const currentPrefix = selectValidatedRuntimeEventPrefix(snapshot, {
        runId: coordinates.runId,
    });
    const events = runtimeEventsFromValidatedPrefix(currentPrefix);
    const judgmentEvent = events.find((event) => event.kind === "c_call_judged" &&
        event.aggregateId === coordinates.cCallRef &&
        isRecord(event.payload) &&
        event.payload.cCallRef === coordinates.cCallRef &&
        event.payload.resultRef === coordinates.resultRef &&
        event.payload.judgmentRef === coordinates.judgmentRef &&
        event.payload.judgment === "advance");
    if (judgmentEvent === undefined)
        return null;
    const resultEvent = events.find((event) => event.admissionOrdinal < judgmentEvent.admissionOrdinal &&
        event.kind === "c_call_result_admitted" &&
        event.aggregateId === coordinates.cCallRef &&
        isRecord(event.payload) &&
        event.payload.cCallRef === coordinates.cCallRef &&
        event.payload.resultRef === coordinates.resultRef);
    if (resultEvent === undefined || !isRecord(resultEvent.payload))
        return null;
    const eventCalculus = deriveRuntimeEventCalculusProjection(currentPrefix);
    if (![
        constructRuntimeFluent({ name: "run_active", identity: coordinates.runId }),
        constructRuntimeFluent({ name: "frame_active", identity: coordinates.frameId }),
        constructRuntimeFluent({
            name: "locus_active",
            identity: coordinates.sourceCursorRef,
        }),
        constructRuntimeFluent({
            name: "c_call_judgment_available",
            identity: coordinates.judgmentRef,
        }),
    ].every((fluent) => holdsAt(eventCalculus, fluent))) {
        return null;
    }
    return deepFreeze({
        kind: "deferred_application_projection",
        schemaVersion: "5.0.0",
        disposition: "application_ready",
        runId: coordinates.runId,
        cCallRef: coordinates.cCallRef,
        resultRef: coordinates.resultRef,
        judgmentRef: coordinates.judgmentRef,
        judgmentEventRef: judgmentEvent.eventId,
        judgmentAdmissionOrdinal: judgmentEvent.admissionOrdinal,
        resultValue: resultEvent.payload.value ?? null,
        // The producer remains the original judgment, while restoration must bind
        // the exact supplied completion prefix, including later probe facts. The
        // live Run/frame/locus/judgment checks above still govern that prefix.
        replayState: replayValidatedRuntimeEventPrefix(currentPrefix, fullPrefix),
    });
}
