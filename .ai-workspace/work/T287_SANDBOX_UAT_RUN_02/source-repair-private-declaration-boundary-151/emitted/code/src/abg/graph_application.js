import { isJsonRecord as isRecord, isNonEmptyJsonString as isNonEmptyString, hasJsonNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { graphFunctionApplicationRef, } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { hasAdmittedExecutionBasisAtPrefix, } from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEventTransactionAtDurablePrefix, readActiveRuntimeTransactionAtDurablePrefix, admitRuntimeEvent, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "./event_calculus.js";
import { hasExactPartialFanOutStopRouteBridge } from "./fan_out_projection.js";
import { hasOpenedTraversalScopeAtPrefix, } from "./open_call.js";
import { replayValidatedRuntimeEventPrefix, } from "./replay.js";
import { admitWorkflowChildFoldback, admitWorkflowChildPreparationRefusal, isCCall, projectAdmittedCCallOutcomeAtPrefix, } from "./c_call.js";
import { hasAdmittedTraversalCursorAtPrefix, } from "./traversal_cursor.js";
const APPLICATION_CHILD_FOLDBACK_BODY_KEYS = Object.freeze([
    "applicationRef",
    "applicationFoldbackRef",
    "parentCCallRef",
    "parentJudgmentRef",
    "sourceCursorRef",
    "sourceCursorDigest",
    "childExecutionBasisRef",
    "childExecutionBasisDigest",
    "childGraphCallId",
    "childFrameId",
    "childDisposition",
    "childResultRef",
    "childResultDigest",
    "childJudgmentRef",
    "childClosureRef",
    "childReasonRef",
    "childTerminalEventRef",
    "outputDigest",
]);
function isSha256Digest(value) {
    return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}
function isApplicationChildFoldbackBody(value) {
    return hasExactKeys(value, APPLICATION_CHILD_FOLDBACK_BODY_KEYS) &&
        isNonEmptyString(value.applicationRef) &&
        isNonEmptyString(value.applicationFoldbackRef) &&
        isNonEmptyString(value.parentCCallRef) &&
        isNonEmptyString(value.parentJudgmentRef) &&
        isNonEmptyString(value.sourceCursorRef) &&
        isSha256Digest(value.sourceCursorDigest) &&
        isNonEmptyString(value.childExecutionBasisRef) &&
        isSha256Digest(value.childExecutionBasisDigest) &&
        isNonEmptyString(value.childGraphCallId) &&
        isNonEmptyString(value.childFrameId) &&
        (value.childDisposition === "blocked" || value.childDisposition === "closed") &&
        isNonEmptyString(value.childResultRef) &&
        isSha256Digest(value.childResultDigest) &&
        isNonEmptyString(value.childJudgmentRef) &&
        isNonEmptyString(value.childTerminalEventRef) &&
        isSha256Digest(value.outputDigest) &&
        (value.childDisposition === "closed"
            ? isNonEmptyString(value.childClosureRef) &&
                (value.childReasonRef === null || isNonEmptyString(value.childReasonRef))
            : value.childClosureRef === null && isNonEmptyString(value.childReasonRef));
}
function refusal(code, message) {
    return {
        kind: "application_child_foldback_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
export function isAdmittedApplicationChildFoldback(store, value) {
    return isAdmittedApplicationChildFoldbackAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), value);
}
export function isAdmittedApplicationChildFoldbackAtPrefix(prefix, value) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const projected = projectApplicationChildFoldbackAtPrefix(prefix, {
        runId: events.find((event) => event.eventId === value.admissionEventRef)?.runId ?? "",
        foldbackRef: value.foldbackRef,
    });
    return projected !== null &&
        sha256Canonical(projected) ===
            sha256Canonical(value);
}
export function isAdmittedApplicationChildPreparationRefusal(store, value) {
    return isAdmittedApplicationChildPreparationRefusalAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), value);
}
export function isAdmittedApplicationChildPreparationRefusalAtPrefix(prefix, value) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const projected = projectApplicationChildPreparationRefusalAtPrefix(prefix, {
        runId: events.find((event) => event.eventId === value.admissionEventRef)?.runId ?? "",
        refusalRef: value.refusalRef,
    });
    return projected !== null &&
        sha256Canonical(projected) ===
            sha256Canonical(value);
}
export function projectCurrentApplicationChildPreparationRefusal(store, coordinates) {
    return projectApplicationChildPreparationRefusalAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll(), {
        runId: coordinates.runId,
    }), coordinates);
}
export function projectApplicationChildPreparationRefusalAtPrefix(prefix, coordinates) {
    if (coordinates.runId.length === 0 || coordinates.refusalRef.length === 0) {
        return null;
    }
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const event = events.find((candidate) => candidate.kind === "child_preparation_refused" &&
        isRecord(candidate.payload) &&
        candidate.payload.refusalRef === coordinates.refusalRef &&
        typeof candidate.payload.applicationRef === "string");
    if (event === undefined || !isRecord(event.payload))
        return null;
    const { refusalRef, refusalDigest, ...body } = event.payload;
    if (typeof refusalRef !== "string" ||
        typeof refusalDigest !== "string" ||
        refusalRef !== coordinates.refusalRef ||
        refusalDigest !== sha256Canonical(body) ||
        refusalRef !==
            `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}` ||
        typeof body.applicationRef !== "string" ||
        typeof body.parentCCallRef !== "string" ||
        typeof body.parentJudgmentRef !== "string" ||
        typeof body.sourceCursorRef !== "string" ||
        typeof body.childGraphFunctionRef !== "string" ||
        typeof body.inputRef !== "string" ||
        typeof body.inputDigest !== "string" ||
        !body.inputDigest.startsWith("sha256:") ||
        ![
            "basis_admission",
            "graph_materialization",
            "graph_validation",
            "membership",
            "scope_open",
        ].includes(body.stage) ||
        typeof body.diagnosticRef !== "string" ||
        typeof body.message !== "string" ||
        body.message.length === 0 ||
        !holdsAt(deriveRuntimeEventCalculusProjection(prefix), constructRuntimeFluent({
            name: "child_preparation_refused",
            identity: refusalRef,
        }))) {
        return null;
    }
    return deepFreeze({
        kind: "application_child_preparation_refusal_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        refusalRef,
        refusalDigest,
        ...body,
        admissionEventRef: event.eventId,
    });
}
export function projectCurrentApplicationChildFoldback(store, coordinates) {
    return projectApplicationChildFoldbackAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll(), {
        runId: coordinates.runId,
    }), coordinates);
}
export function projectApplicationChildFoldbackAtPrefix(prefix, coordinates) {
    if (coordinates.runId.length === 0 || coordinates.foldbackRef.length === 0) {
        return null;
    }
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const event = events.find((candidate) => candidate.kind === "child_foldback_admitted" &&
        isRecord(candidate.payload) &&
        candidate.payload.foldbackRef === coordinates.foldbackRef);
    if (event === undefined || !isRecord(event.payload))
        return null;
    const { foldbackRef, foldbackDigest, ...body } = event.payload;
    if (typeof foldbackRef !== "string" ||
        !isSha256Digest(foldbackDigest) ||
        foldbackRef !== coordinates.foldbackRef ||
        !isApplicationChildFoldbackBody(body) ||
        foldbackDigest !== sha256Canonical(body) ||
        foldbackRef !==
            `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}` ||
        !holdsAt(deriveRuntimeEventCalculusProjection(prefix), constructRuntimeFluent({
            name: "child_foldback_available",
            identity: foldbackRef,
        }))) {
        return null;
    }
    return deepFreeze({
        kind: "application_child_foldback_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        foldbackRef,
        foldbackDigest,
        ...body,
        admissionEventRef: event.eventId,
    });
}
export function projectCurrentApplicationChildRoute(store, coordinates) {
    const snapshot = store.readAll();
    const fullPrefix = selectValidatedRuntimeEventPrefix(snapshot);
    return projectApplicationChildRouteAtPrefix(selectValidatedRuntimeEventPrefix(snapshot, {
        runId: coordinates.runId,
    }), fullPrefix, coordinates);
}
export function projectApplicationChildRouteAtPrefix(prefix, authorityPrefix, coordinates) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
    const route = replayValidatedRuntimeEventPrefix(prefix, authorityPrefix).routes.find((candidate) => candidate.cCallRef === coordinates.cCallRef &&
        candidate.judgmentRef === coordinates.judgmentRef &&
        (candidate.routeKind === "terminal" || candidate.routeKind === "blocked"));
    if (route === undefined)
        return null;
    const routeEvent = events.find((event) => event.eventId === route.admissionEventRef &&
        event.kind === "traversal_route_admitted" &&
        event.runId === coordinates.runId &&
        event.graphCallId === coordinates.graphCallId &&
        event.frameId === coordinates.frameId);
    const matchingRunStopped = routeEvent === undefined
        ? undefined
        : events.find((event) => event.kind === "run_stopped" &&
            event.runId === coordinates.runId &&
            event.graphCallId === coordinates.graphCallId &&
            event.frameId === coordinates.frameId &&
            event.causationEventRefs.includes(routeEvent.eventId) &&
            isRecord(event.payload) &&
            event.payload.routeRef === route.routeRef);
    const lifecycleCurrent = route.routeKind === "terminal"
        ? holdsAt(eventCalculus, constructRuntimeFluent({
            name: "graph_call_closed",
            identity: coordinates.graphCallId,
        }))
        : matchingRunStopped === undefined
            ? holdsAt(eventCalculus, constructRuntimeFluent({
                name: "frame_blocked",
                identity: coordinates.frameId,
            }))
            : holdsAt(eventCalculus, constructRuntimeFluent({
                name: "run_terminal",
                identity: coordinates.runId,
            })) &&
                !holdsAt(eventCalculus, constructRuntimeFluent({
                    name: "run_active",
                    identity: coordinates.runId,
                }));
    return routeEvent === undefined || !lifecycleCurrent ? null : route;
}
function admitRecursiveApplicationChildPreparationRefusal(store, predecessorPrefix, executionBasis, graph, application, parentCCall, parentResult, parentJudgment, sourceCursor, candidate, basis) {
    let entered = false;
    try {
        const committed = admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
            entered = true;
            const predecessorEvents = readActiveRuntimeTransactionAtDurablePrefix(store, predecessorPrefix, { durableOnly: true });
            const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
            const ownerPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents, {
                runId: parentCCall.runId,
            });
            if (!hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionBasis) ||
                !isMaterializedGtlGraph(graph) ||
                graph.materializationRef !== executionBasis.graphRef ||
                graph.template.applications.find((row) => row.applicationRef === application.applicationRef) !== application ||
                application.relationKind !== "recurse" ||
                application.applicationRef !== graphFunctionApplicationRef(application) ||
                projectAdmittedCCallOutcomeAtPrefix(ownerPrefix, parentCCall, parentResult, parentJudgment) === null ||
                !hasAdmittedTraversalCursorAtPrefix(ownerPrefix, sourceCursor) ||
                parentCCall.basisId !== executionBasis.basisRef ||
                parentCCall.frameId !== sourceCursor.frameId ||
                parentCCall.compositionRef !== application.applicationRef ||
                parentResult.cCallRef !== parentCCall.cCallRef ||
                parentJudgment.cCallRef !== parentCCall.cCallRef ||
                parentJudgment.resultRef !== parentResult.resultRef ||
                parentJudgment.judgment !== "advance") {
                return {
                    kind: "application_child_preparation_refusal_refusal",
                    schemaVersion: "5.0.0",
                    disposition: "refused",
                    code: "application_mismatch",
                    message: "application child preparation refusal requires exact admitted parent evaluation truth",
                };
            }
            if (candidate.childGraphFunctionRef !== application.graphFunctionRef ||
                candidate.inputRef !== parentResult.resultRef ||
                candidate.inputDigest !== parentResult.valueDigest ||
                ![
                    "basis_admission",
                    "graph_materialization",
                    "graph_validation",
                    "membership",
                    "scope_open",
                ].includes(candidate.stage) ||
                !candidate.diagnosticRef.startsWith("diagnostic://abiogenesis/") ||
                candidate.message.length === 0) {
                return {
                    kind: "application_child_preparation_refusal_refusal",
                    schemaVersion: "5.0.0",
                    disposition: "refused",
                    code: "candidate_mismatch",
                    message: "application child preparation refusal differs from the declared child and parent output",
                };
            }
            const body = {
                applicationRef: application.applicationRef,
                parentCCallRef: parentCCall.cCallRef,
                parentJudgmentRef: parentJudgment.judgmentRef,
                sourceCursorRef: sourceCursor.cursorRef,
                ...candidate,
            };
            const refusalDigest = sha256Canonical(body);
            const refusalRef = `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
            const event = admitRuntimeEvent(store, {
                kind: "child_preparation_refused",
                eventTime: basis.eventTime,
                aggregateType: "frame",
                aggregateId: sourceCursor.frameId,
                parentAggregateId: sourceCursor.graphCallId,
                causationEventRefs: [
                    parentJudgment.admissionEventRef,
                    ...basis.causationEventRefs,
                ],
                correlationId: basis.correlationId,
                workflowVersion: "5.0.0",
                scopeClass: "run",
                basisId: executionBasis.basisRef,
                runId: sourceCursor.runId,
                graphFunctionRef: executionBasis.graphFunctionRef,
                materializationRef: graph.materializationRef,
                graphCallId: sourceCursor.graphCallId,
                frameId: sourceCursor.frameId,
                payload: { refusalRef, refusalDigest, ...body },
            });
            const admitted = deepFreeze({
                kind: "application_child_preparation_refusal_admission",
                schemaVersion: "5.0.0",
                disposition: "admitted",
                refusalRef,
                refusalDigest,
                ...body,
                admissionEventRef: event.eventId,
            });
            const projected = projectApplicationChildPreparationRefusalAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll(), {
                runId: sourceCursor.runId,
            }), { runId: sourceCursor.runId, refusalRef });
            if (projected === null ||
                sha256Canonical(projected) !==
                    sha256Canonical(admitted)) {
                throw new TypeError("application child preparation refusal admission must equal its validated Event Calculus projection");
            }
            return projected;
        });
        if (committed.value.disposition === "refused")
            return committed.value;
        if (committed.successorPrefix === null)
            throw new TypeError("child admission has no durable successor");
        return deepFreeze({
            kind: "application_child_preparation_refusal_receipt",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            admission: committed.value,
            successorPrefix: committed.successorPrefix,
        });
    }
    catch (error) {
        if (entered)
            throw error;
        return {
            kind: "application_child_preparation_refusal_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            code: "application_mismatch",
            message: "application child preparation refusal requires its exact predecessor",
        };
    }
}
function admitRecursiveApplicationChildFoldback(store, predecessorPrefix, parentExecutionBasis, graph, application, parentCCall, parentJudgmentRef, sourceCursor, childExecutionBasis, childScope, child, basis) {
    let entered = false;
    try {
        const committed = admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
            entered = true;
            const predecessorEvents = readActiveRuntimeTransactionAtDurablePrefix(store, predecessorPrefix, { durableOnly: true });
            const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
            const prefix = selectValidatedRuntimeEventPrefix(predecessorEvents, {
                runId: sourceCursor.runId,
            });
            if (!hasAdmittedExecutionBasisAtPrefix(authorityPrefix, parentExecutionBasis) ||
                !isMaterializedGtlGraph(graph) ||
                graph.materializationRef !== parentExecutionBasis.graphRef ||
                graph.template.applications.find((candidate) => candidate.applicationRef === application.applicationRef) !== application ||
                application.relationKind !== "recurse" ||
                application.applicationRef !== graphFunctionApplicationRef(application)) {
                return refusal("application_mismatch", "child foldback requires one exact admitted recurse application");
            }
            if (!isCCall(parentCCall) ||
                parentCCall.callClass !== "leaf" ||
                parentCCall.basisId !== parentExecutionBasis.basisRef ||
                parentCCall.frameId !== sourceCursor.frameId ||
                parentCCall.graphCallId !== sourceCursor.graphCallId ||
                parentCCall.compositionRef !== application.applicationRef ||
                parentCCall.attempt !== sourceCursor.attempt ||
                !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor)) {
                return refusal("parent_truth_mismatch", "application foldback requires the exact evaluated parent cursor and CCall");
            }
            const events = runtimeEventsFromValidatedPrefix(prefix);
            const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
            const parentJudgmentEvent = events.find((event) => event.kind === "c_call_judged" &&
                event.aggregateId === parentCCall.cCallRef &&
                isRecord(event.payload) &&
                event.payload.judgmentRef === parentJudgmentRef &&
                event.payload.judgment === "advance");
            if (parentJudgmentEvent === undefined ||
                !holdsAt(eventCalculus, constructRuntimeFluent({
                    name: "c_call_judgment_available",
                    identity: parentJudgmentRef,
                }))) {
                return refusal("parent_truth_mismatch", "application foldback requires admitted parent re-evaluation truth");
            }
            if (!hasAdmittedExecutionBasisAtPrefix(authorityPrefix, childExecutionBasis) ||
                childExecutionBasis.basisClass !== "child" ||
                childExecutionBasis.parentExecutionBasisRef !== parentExecutionBasis.basisRef ||
                childExecutionBasis.graphFunctionRef !== application.graphFunctionRef ||
                !hasOpenedTraversalScopeAtPrefix(prefix, childScope) ||
                childScope.executionBasisRef !== childExecutionBasis.basisRef ||
                childScope.runId !== sourceCursor.runId) {
                return refusal("child_truth_mismatch", "application foldback requires one exact admitted child basis and scope");
            }
            const childGraphCallEvent = events.find((event) => event.kind === "graph_call_opened" &&
                event.aggregateId === childScope.graphCallId &&
                isRecord(event.payload) &&
                event.payload.parentFrameId === sourceCursor.frameId);
            const resultEvent = events.find((event) => event.kind === "c_call_result_admitted" &&
                event.runId === childScope.runId &&
                event.frameId === childScope.frameId &&
                isRecord(event.payload) &&
                event.payload.resultRef === child.resultRef);
            const judgmentEvent = events.find((event) => event.kind === "c_call_judged" &&
                event.runId === childScope.runId &&
                event.frameId === childScope.frameId &&
                isRecord(event.payload) &&
                event.payload.judgmentRef === child.judgmentRef &&
                event.payload.resultRef === child.resultRef);
            const childCCallRef = resultEvent !== undefined && isRecord(resultEvent.payload) &&
                typeof resultEvent.payload.cCallRef === "string"
                ? resultEvent.payload.cCallRef
                : null;
            const routeProjection = childCCallRef === null
                ? undefined
                : projectApplicationChildRouteAtPrefix(prefix, authorityPrefix, {
                    runId: childScope.runId,
                    graphCallId: childScope.graphCallId,
                    frameId: childScope.frameId,
                    cCallRef: childCCallRef,
                    judgmentRef: child.judgmentRef,
                }) ?? undefined;
            const routeEvent = routeProjection === undefined
                ? undefined
                : events.find((event) => event.eventId === routeProjection.admissionEventRef &&
                    event.kind === "traversal_route_admitted" &&
                    event.runId === childScope.runId &&
                    event.frameId === childScope.frameId);
            const routeKind = routeProjection?.routeKind ?? null;
            const terminalReachedEvent = routeKind === "terminal"
                ? events.find((event) => event.kind === "terminal_reached" &&
                    event.runId === childScope.runId &&
                    event.frameId === childScope.frameId &&
                    event.causationEventRefs.includes(routeEvent.eventId) &&
                    isRecord(event.payload) &&
                    event.payload.closureRef === child.closureRef)
                : undefined;
            const frameClosedEvent = terminalReachedEvent === undefined
                ? undefined
                : events.find((event) => event.kind === "frame_closed" &&
                    event.runId === childScope.runId &&
                    event.frameId === childScope.frameId &&
                    event.causationEventRefs.includes(terminalReachedEvent.eventId));
            const graphCallClosedEvent = frameClosedEvent === undefined
                ? undefined
                : events.find((event) => event.kind === "graph_call_closed" &&
                    event.runId === childScope.runId &&
                    event.graphCallId === childScope.graphCallId &&
                    event.causationEventRefs.includes(frameClosedEvent.eventId));
            const resultDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
                ? resultEvent.payload.resultDigest
                : null;
            const outputDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
                ? resultEvent.payload.valueDigest
                : null;
            const childReasonRef = judgmentEvent !== undefined && isRecord(judgmentEvent.payload) &&
                typeof judgmentEvent.payload.reasonRef === "string"
                ? judgmentEvent.payload.reasonRef
                : null;
            const childLifecycleEvent = routeKind === "terminal"
                ? graphCallClosedEvent
                : routeEvent;
            const partialFanOutStopBridge = routeKind === "blocked" &&
                routeEvent !== undefined && childCCallRef !== null
                ? hasExactPartialFanOutStopRouteBridge(prefix, routeEvent.eventId, {
                    runId: childScope.runId,
                    graphCallId: childScope.graphCallId,
                    frameId: childScope.frameId,
                    cCallRef: childCCallRef,
                    resultRef: child.resultRef,
                    judgmentRef: child.judgmentRef,
                })
                : false;
            if (childGraphCallEvent === undefined ||
                resultEvent === undefined ||
                judgmentEvent === undefined ||
                routeEvent === undefined ||
                childLifecycleEvent === undefined ||
                !judgmentEvent.causationEventRefs.includes(resultEvent.eventId) ||
                (!routeEvent.causationEventRefs.includes(judgmentEvent.eventId) &&
                    !partialFanOutStopBridge) ||
                typeof resultDigest !== "string" ||
                !/^sha256:[a-f0-9]{64}$/u.test(resultDigest) ||
                typeof outputDigest !== "string" ||
                !/^sha256:[a-f0-9]{64}$/u.test(outputDigest) ||
                (routeKind !== "terminal" && routeKind !== "blocked") ||
                (routeKind === "terminal" &&
                    (child.closureRef === null ||
                        terminalReachedEvent === undefined ||
                        frameClosedEvent === undefined ||
                        graphCallClosedEvent === undefined)) ||
                (routeKind === "blocked" &&
                    (child.closureRef !== null || childReasonRef === null))) {
                return refusal("child_truth_mismatch", "application foldback references incomplete or non-causal child truth");
            }
            const body = {
                applicationRef: application.applicationRef,
                applicationFoldbackRef: application.foldbackRef,
                parentCCallRef: parentCCall.cCallRef,
                parentJudgmentRef,
                sourceCursorRef: sourceCursor.cursorRef,
                sourceCursorDigest: sourceCursor.cursorDigest,
                childExecutionBasisRef: childExecutionBasis.basisRef,
                childExecutionBasisDigest: childExecutionBasis.basisDigest,
                childGraphCallId: childScope.graphCallId,
                childFrameId: childScope.frameId,
                childDisposition: routeKind === "terminal" ? "closed" : "blocked",
                childResultRef: child.resultRef,
                childResultDigest: resultDigest,
                childJudgmentRef: child.judgmentRef,
                childClosureRef: child.closureRef,
                childReasonRef,
                childTerminalEventRef: childLifecycleEvent.eventId,
                outputDigest: outputDigest,
            };
            const foldbackDigest = sha256Canonical(body);
            const foldbackRef = `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
            const event = admitRuntimeEvent(store, {
                kind: "child_foldback_admitted",
                eventTime: basis.eventTime,
                aggregateType: "frame",
                aggregateId: sourceCursor.frameId,
                parentAggregateId: sourceCursor.graphCallId,
                causationEventRefs: [
                    childLifecycleEvent.eventId,
                    parentJudgmentEvent.eventId,
                    ...basis.causationEventRefs,
                ],
                correlationId: basis.correlationId,
                workflowVersion: "5.0.0",
                scopeClass: "run",
                basisId: parentExecutionBasis.basisRef,
                runId: sourceCursor.runId,
                graphFunctionRef: parentExecutionBasis.graphFunctionRef,
                materializationRef: graph.materializationRef,
                graphCallId: sourceCursor.graphCallId,
                frameId: sourceCursor.frameId,
                payload: { foldbackRef, foldbackDigest, ...body },
            });
            const admitted = deepFreeze({
                kind: "application_child_foldback_admission",
                schemaVersion: "5.0.0",
                disposition: "admitted",
                foldbackRef,
                foldbackDigest,
                ...body,
                admissionEventRef: event.eventId,
            });
            const projected = projectApplicationChildFoldbackAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll(), {
                runId: sourceCursor.runId,
            }), { runId: sourceCursor.runId, foldbackRef });
            if (projected === null ||
                sha256Canonical(projected) !==
                    sha256Canonical(admitted)) {
                throw new TypeError("application child foldback admission must equal its exact Event Calculus projection");
            }
            return projected;
        });
        if (committed.value.disposition === "refused")
            return committed.value;
        if (committed.successorPrefix === null)
            throw new TypeError("child admission has no durable successor");
        return deepFreeze({
            kind: "application_child_foldback_receipt",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            admission: committed.value,
            successorPrefix: committed.successorPrefix,
        });
    }
    catch (error) {
        if (entered)
            throw error;
        return refusal("application_mismatch", "child foldback requires its exact durable predecessor");
    }
}
export function admitChildPreparationRefusal(input) {
    if (input.relationClass === "workflow") {
        return admitWorkflowChildPreparationRefusal(input.store, input.predecessorPrefix, input.graph, input.graphFunction, input.cursor, input.parentCCall, input.candidate, input.basis);
    }
    return admitRecursiveApplicationChildPreparationRefusal(input.store, input.predecessorPrefix, input.executionBasis, input.graph, input.application, input.parentCCall, input.parentResult, input.parentJudgment, input.sourceCursor, input.candidate, input.basis);
}
export function admitChildFoldback(input) {
    if (input.relationClass === "workflow") {
        return admitWorkflowChildFoldback(input.store, input.predecessorPrefix, input.graph, input.graphFunction, input.cursor, input.parentCCall, input.childExecutionBasis, input.childScope, input.child, input.basis);
    }
    return admitRecursiveApplicationChildFoldback(input.store, input.predecessorPrefix, input.parentExecutionBasis, input.graph, input.application, input.parentCCall, input.parentJudgmentRef, input.sourceCursor, input.childExecutionBasis, input.childScope, input.child, input.basis);
}
