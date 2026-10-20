import { indexedRuntimeEvents } from "./event_prefix.js";
import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { sampleNativeEventTime } from "./native_event_time.js";
import { observeNativeFrameLiveness, retainNativeFrameClock, captureNativeFrameBoundary } from "./runtime_liveness.js";
import { rehydrateExecutionBasisAtPrefix, } from "./execution_basis.js";
import { projectCurrentChildParentCCallAtPrefix } from "./c_call.js";
import { constructRunActiveFluent, constructRunClosedFluent, constructRunTerminalFluent, constructRuntimeFluent, deriveRuntimeHeldFluentProjection, holdsAt, } from "./event_calculus.js";
import { AbgEventStore, admitRuntimeEvent, admitRuntimeEventTransactionAtExpectedPrefix, readHeldRuntimeEventsAtDurablePrefix, readRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventPrefixDigest, runtimeEventBodiesAtPrefix, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
const openedScopes = new WeakSet();
export function isOpenedTraversalScope(value) {
    return openedScopes.has(value);
}
function sameCanonicalValue(left, right) {
    try {
        return sha256Canonical(left) ===
            sha256Canonical(right);
    }
    catch {
        return false;
    }
}
function projectRunPhaseAtPrefix(prefix, input) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    const openEvents = indexedRuntimeEvents(prefix, "related:" + input.runId).filter((event) => event.kind === "run_segment_opened" && event.aggregateId === input.runId);
    const failureEvents = indexedRuntimeEvents(prefix, "kind:" + "runtime_failure_observed").filter((event) => event.kind === "runtime_failure_observed" && event.runId === input.runId);
    const stoppedEvents = indexedRuntimeEvents(prefix, "kind:" + "run_stopped").filter((event) => event.kind === "run_stopped" && event.runId === input.runId);
    const closedEvents = indexedRuntimeEvents(prefix, "kind:" + "run_closed").filter((event) => event.kind === "run_closed" && event.runId === input.runId);
    if (openEvents.length === 0) {
        return failureEvents.length === 0 &&
            stoppedEvents.length === 0 &&
            closedEvents.length === 0
            ? "not_open"
            : null;
    }
    const openEvent = openEvents[0];
    if (openEvents.length !== 1 ||
        openEvent.aggregateType !== "run" ||
        openEvent.basisId !== input.executionBasisRef ||
        !isRecord(openEvent.payload) ||
        openEvent.payload.runId !== input.runId ||
        openEvent.payload.runDigest !== input.runDigest ||
        failureEvents.length > 1 ||
        stoppedEvents.length > 1 ||
        closedEvents.length > 1 ||
        [failureEvents, stoppedEvents, closedEvents]
            .filter((rows) => rows.length === 1).length > 1)
        return null;
    const calculus = deriveRuntimeHeldFluentProjection(prefix);
    if (failureEvents.length === 1)
        return "failed";
    if (stoppedEvents.length === 1 &&
        holdsAt(calculus, constructRunTerminalFluent(input.runId)))
        return "stopped";
    if (closedEvents.length === 1 &&
        holdsAt(calculus, constructRunClosedFluent(input.runId)))
        return "closed";
    return holdsAt(calculus, constructRunActiveFluent(input.runId))
        ? "active"
        : null;
}
function projectGraphCallPhaseAtPrefix(prefix, input) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    const openEvents = indexedRuntimeEvents(prefix, "related:" + input.graphCallId).filter((event) => event.kind === "graph_call_opened" &&
        event.aggregateId === input.graphCallId);
    const closedEvents = indexedRuntimeEvents(prefix, "graph-call:" + input.graphCallId).filter((event) => event.kind === "graph_call_closed" &&
        event.graphCallId === input.graphCallId);
    if (openEvents.length === 0) {
        return closedEvents.length === 0 ? "not_open" : null;
    }
    const openEvent = openEvents[0];
    if (openEvents.length !== 1 ||
        closedEvents.length > 1 ||
        openEvent.aggregateType !== "graph_call" ||
        openEvent.basisId !== input.executionBasisRef ||
        !isRecord(openEvent.payload) ||
        openEvent.payload.graphCallId !== input.graphCallId ||
        openEvent.payload.graphCallDigest !== input.graphCallDigest)
        return null;
    const calculus = deriveRuntimeHeldFluentProjection(prefix);
    if (closedEvents.length === 1) {
        return holdsAt(calculus, constructRuntimeFluent({
            name: "graph_call_closed",
            identity: input.graphCallId,
        }))
            ? "closed"
            : null;
    }
    return holdsAt(calculus, constructRuntimeFluent({
        name: "graph_call_active",
        identity: input.graphCallId,
    }))
        ? "active"
        : "inactive";
}
export function hasOpenedTraversalScopeAtPrefix(prefix, scope) {
    if (!isOpenedTraversalScope(scope))
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, scopeRef: _scopeRef, scopeDigest: _scopeDigest, ...body } = scope;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const runEvent = indexedRuntimeEvents(prefix, "id:" + scope.runOpenEventRef).find((event) => event.eventId === scope.runOpenEventRef);
    const graphCallEvent = indexedRuntimeEvents(prefix, "id:" + scope.graphCallOpenEventRef).find((event) => event.eventId === scope.graphCallOpenEventRef);
    const frameEvent = indexedRuntimeEvents(prefix, "id:" + scope.frameOpenEventRef).find((event) => event.eventId === scope.frameOpenEventRef);
    return (sha256Canonical(body) === scope.scopeDigest &&
        scope.scopeRef === `traversal-scope://abiogenesis/${scope.scopeDigest.slice("sha256:".length)}` &&
        runEvent?.kind === "run_segment_opened" &&
        runEvent.aggregateType === "run" &&
        runEvent.aggregateId === scope.runId &&
        isRecord(runEvent.payload) &&
        runEvent.payload.runDigest === scope.runDigest &&
        graphCallEvent?.kind === "graph_call_opened" &&
        graphCallEvent.aggregateType === "graph_call" &&
        graphCallEvent.aggregateId === scope.graphCallId &&
        graphCallEvent.causationEventRefs.includes(scope.runOpenEventRef) &&
        isRecord(graphCallEvent.payload) &&
        graphCallEvent.payload.graphCallDigest === scope.graphCallDigest &&
        frameEvent?.kind === "frame_opened" &&
        frameEvent.aggregateType === "frame" &&
        frameEvent.aggregateId === scope.frameId &&
        frameEvent.causationEventRefs.includes(scope.graphCallOpenEventRef) &&
        isRecord(frameEvent.payload) &&
        frameEvent.payload.frameDigest === scope.frameDigest);
}
export function projectOpenedTraversalScopeClassAtPrefix(prefix, scope) {
    if (!hasOpenedTraversalScopeAtPrefix(prefix, scope))
        return null;
    const basis = rehydrateExecutionBasisAtPrefix(prefix, scope.executionBasisRef);
    const events = runtimeEventBodiesAtPrefix(prefix);
    const graphCallOpen = indexedRuntimeEvents(prefix, "id:" + scope.graphCallOpenEventRef).find((event) => event.kind === "graph_call_opened" &&
        event.eventId === scope.graphCallOpenEventRef &&
        event.aggregateId === scope.graphCallId &&
        event.basisId === scope.executionBasisRef &&
        event.runId === scope.runId);
    const frameOpen = indexedRuntimeEvents(prefix, "id:" + scope.frameOpenEventRef).find((event) => event.kind === "frame_opened" &&
        event.eventId === scope.frameOpenEventRef &&
        event.aggregateId === scope.frameId &&
        event.graphCallId === scope.graphCallId &&
        event.basisId === scope.executionBasisRef &&
        event.runId === scope.runId);
    if (basis === null ||
        graphCallOpen === undefined ||
        frameOpen === undefined ||
        !isRecord(graphCallOpen.payload) ||
        !isRecord(frameOpen.payload))
        return null;
    const graphParentFrameId = typeof graphCallOpen.payload.parentFrameId ===
        "string"
        ? graphCallOpen.payload.parentFrameId
        : null;
    const frameParentFrameId = typeof frameOpen.payload.parentFrameId ===
        "string"
        ? frameOpen.payload.parentFrameId
        : frameOpen.payload.parentFrameId === null
            ? null
            : undefined;
    if (basis.basisClass === "root" &&
        basis.parentExecutionBasisRef === null &&
        basis.parentTraversalScopeRef === null &&
        basis.parentCCallRef === null &&
        graphParentFrameId === null &&
        frameParentFrameId === null)
        return "root";
    if (basis.basisClass === "child" &&
        basis.parentExecutionBasisRef !== null &&
        basis.parentTraversalScopeRef !== null &&
        basis.parentCCallRef !== null &&
        graphParentFrameId !== null &&
        frameParentFrameId === graphParentFrameId &&
        graphCallOpen.causationEventRefs.includes(basis.admissionEventRef) &&
        graphCallOpen.causationEventRefs.some((eventRef) => indexedRuntimeEvents(prefix, "id:" + eventRef).some((event) => event.eventId === eventRef &&
            event.kind === "frame_opened" &&
            event.aggregateId === graphParentFrameId &&
            event.basisId === basis.parentExecutionBasisRef)))
        return "child";
    return null;
}
export function projectOpenedTraversalScopeClassAtDurablePrefix(predecessorPrefix, scope) {
    return projectOpenedTraversalScopeClassAtPrefix(selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(predecessorPrefix)), scope);
}
export function rehydrateOpenedTraversalScope(store, value) {
    return rehydrateOpenedTraversalScopeAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), value);
}
export function rehydrateOpenedTraversalScopeAtPrefix(prefix, value) {
    const scope = deepFreeze({
        kind: "opened_traversal_scope",
        schemaVersion: "5.0.0",
        ...value,
    });
    openedScopes.add(scope);
    return hasOpenedTraversalScopeAtPrefix(prefix, scope) ? scope : null;
}
function scopeOpenRefusal(code, message) {
    return deepFreeze({
        kind: "traversal_scope_open_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
/**
 * Opens one root or child traversal scope through the single ABG lifecycle
 * algebra. Root adds Run.open; both variants share the exact GraphCall,
 * Frame, scope identity, and expected-prefix commit relations.
 */
export function openTraversalScope(store, predecessorPrefix, subject, basis) {
    let snapshot;
    try {
        snapshot = readHeldRuntimeEventsAtDurablePrefix(store, predecessorPrefix);
    }
    catch {
        return scopeOpenRefusal(subject.kind === "root"
            ? "execution_basis_not_admitted"
            : "child_basis_not_admitted", "scope opening requires one exact durable predecessor prefix");
    }
    let authorityPrefix;
    try {
        authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
    }
    catch {
        return scopeOpenRefusal(subject.kind === "root"
            ? "execution_basis_not_admitted"
            : "child_basis_not_admitted", "scope opening requires one valid ABG event prefix");
    }
    const expectedStorePrefixDigest = runtimeEventPrefixDigest(authorityPrefix);
    if (store.digest() !== expectedStorePrefixDigest) {
        return scopeOpenRefusal(subject.kind === "root"
            ? "execution_basis_not_admitted"
            : "child_basis_not_admitted", "scope opening requires the held store at its exact durable prefix");
    }
    let context;
    if (subject.kind === "root") {
        const exactBasis = rehydrateExecutionBasisAtPrefix(authorityPrefix, subject.executionBasis.basisRef);
        if (exactBasis === null || exactBasis.basisClass !== "root" ||
            !sameCanonicalValue(exactBasis, subject.executionBasis)) {
            return scopeOpenRefusal("execution_basis_not_admitted", "root scope opening requires one exact admitted root ExecutionBasis");
        }
        const runBody = {
            executionBasisRef: exactBasis.basisRef,
            executionBasisDigest: exactBasis.basisDigest,
            invocationAdmissionRef: exactBasis.invocationAdmissionRef,
            invocationRef: exactBasis.invocationRef,
            workspaceBindingId: exactBasis.workspaceBindingId,
            programRef: exactBasis.programRef,
            graphFunctionRef: exactBasis.graphFunctionRef,
            graphRef: exactBasis.graphRef,
            graphDigest: exactBasis.graphDigest,
        };
        const runDigest = sha256Canonical(runBody);
        const runId = `run://abiogenesis/${runDigest.slice("sha256:".length)}`;
        if (projectRunPhaseAtPrefix(authorityPrefix, {
            runId,
            runDigest,
            executionBasisRef: exactBasis.basisRef,
        }) !== "not_open") {
            return scopeOpenRefusal("execution_basis_already_opened", "one root ExecutionBasis cannot open a second Run");
        }
        context = deepFreeze({
            kind: "root",
            expectedStorePrefixDigest,
            exactBasis,
            runId,
            runDigest,
            runBody: runBody,
        });
    }
    else {
        const runPrefix = selectValidatedRuntimeEventPrefix(runtimeEventBodiesAtPrefix(authorityPrefix), { runId: subject.parentScope.runId });
        const exactBasis = rehydrateExecutionBasisAtPrefix(authorityPrefix, subject.executionBasis.basisRef);
        const exactParentScope = rehydrateOpenedTraversalScopeAtPrefix(runPrefix, subject.parentScope);
        if (exactBasis === null || exactBasis.basisClass !== "child" ||
            exactParentScope === null || exactBasis.parentCCallRef === null ||
            exactBasis.parentExecutionBasisRef === null ||
            !sameCanonicalValue(exactBasis, subject.executionBasis) ||
            !sameCanonicalValue(exactParentScope, subject.parentScope)) {
            return scopeOpenRefusal("child_basis_not_admitted", "child scope opening requires one exact admitted child ExecutionBasis");
        }
        if (exactBasis.parentExecutionBasisRef !==
            exactParentScope.executionBasisRef ||
            exactBasis.parentTraversalScopeRef !== exactParentScope.scopeRef ||
            exactBasis.invocationAdmissionRef !==
                exactParentScope.invocationAdmissionRef ||
            exactBasis.programRef !== exactParentScope.programRef) {
            return scopeOpenRefusal("parent_scope_mismatch", "child ExecutionBasis does not descend from the exact parent scope");
        }
        const parentCCall = projectCurrentChildParentCCallAtPrefix(runPrefix, {
            parentCCallRef: exactBasis.parentCCallRef,
            parentExecutionBasisRef: exactBasis.parentExecutionBasisRef,
            runId: exactParentScope.runId,
            graphCallId: exactParentScope.graphCallId,
            frameId: exactParentScope.frameId,
            childGraphFunctionRef: exactBasis.graphFunctionRef,
            admittedInputRef: exactBasis.rawInputAdmissionRef,
            admittedInputDigest: exactBasis.rawInputDigest,
        });
        if (parentCCall === null) {
            return scopeOpenRefusal("child_basis_not_admitted", "child scope opening requires its exact current parent CCall");
        }
        const graphCallBody = {
            runId: exactParentScope.runId,
            executionBasisRef: exactBasis.basisRef,
            invocationRef: exactBasis.invocationRef,
            graphFunctionRef: exactBasis.graphFunctionRef,
            graphFunctionDigest: exactBasis.graphFunctionDigest,
            graphRef: exactBasis.graphRef,
            graphDigest: exactBasis.graphDigest,
            parentFrameId: exactParentScope.frameId,
        };
        const graphCallDigest = sha256Canonical(graphCallBody);
        const graphCallId = `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
        if (projectGraphCallPhaseAtPrefix(runPrefix, {
            graphCallId,
            graphCallDigest,
            executionBasisRef: exactBasis.basisRef,
        }) !== "not_open") {
            return scopeOpenRefusal("child_basis_already_opened", "one child ExecutionBasis cannot open a second GraphCall");
        }
        context = deepFreeze({
            kind: "child",
            expectedStorePrefixDigest,
            exactBasis,
            parentScope: exactParentScope,
            parentCCallCausationEventRef: parentCCall.causationEventRef,
        });
    }
    let frameClock = null;
    const committed = admitRuntimeEventTransactionAtExpectedPrefix(store, context.expectedStorePrefixDigest, () => {
        const executionBasis = context.exactBasis;
        const openedRun = context.kind === "root"
            ? (() => {
                const runEvent = admitRuntimeEvent(store, {
                    kind: "run_segment_opened",
                    eventTime: sampleNativeEventTime(),
                    aggregateType: "run",
                    aggregateId: context.runId,
                    parentAggregateId: executionBasis.workspaceBindingId,
                    causationEventRefs: [
                        executionBasis.admissionEventRef,
                        ...basis.causationEventRefs,
                    ],
                    correlationId: basis.correlationId,
                    workflowVersion: "5.0.0",
                    scopeClass: "run",
                    basisId: executionBasis.basisRef,
                    runId: context.runId,
                    graphFunctionRef: executionBasis.graphFunctionRef,
                    materializationRef: executionBasis.graphRef,
                    payload: {
                        runId: context.runId,
                        runDigest: context.runDigest,
                        ...context.runBody,
                    },
                });
                return deepFreeze({
                    runId: context.runId,
                    runDigest: context.runDigest,
                    ...context.runBody,
                    openEventRef: runEvent.eventId,
                });
            })()
            : null;
        const runId = context.kind === "root"
            ? context.runId
            : context.parentScope.runId;
        const runDigest = context.kind === "root"
            ? context.runDigest
            : context.parentScope.runDigest;
        const runOpenEventRef = context.kind === "root"
            ? openedRun.openEventRef
            : context.parentScope.runOpenEventRef;
        const parentFrameId = context.kind === "child"
            ? context.parentScope.frameId
            : null;
        const graphCallBody = {
            runId,
            executionBasisRef: executionBasis.basisRef,
            invocationRef: executionBasis.invocationRef,
            graphFunctionRef: executionBasis.graphFunctionRef,
            graphFunctionDigest: executionBasis.graphFunctionDigest,
            graphRef: executionBasis.graphRef,
            graphDigest: executionBasis.graphDigest,
            ...(parentFrameId === null ? {} : { parentFrameId }),
        };
        const graphCallDigest = sha256Canonical(graphCallBody);
        const graphCallId = `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
        const graphCallEvent = admitRuntimeEvent(store, {
            kind: "graph_call_opened",
            eventTime: sampleNativeEventTime(),
            aggregateType: "graph_call",
            aggregateId: graphCallId,
            parentAggregateId: runId,
            causationEventRefs: context.kind === "root"
                ? [runOpenEventRef]
                : [
                    context.parentCCallCausationEventRef,
                    context.parentScope.runOpenEventRef,
                    context.parentScope.frameOpenEventRef,
                    executionBasis.admissionEventRef,
                    ...basis.causationEventRefs,
                ],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: executionBasis.basisRef,
            runId,
            graphFunctionRef: executionBasis.graphFunctionRef,
            materializationRef: executionBasis.graphRef,
            graphCallId,
            payload: { graphCallId, graphCallDigest, ...graphCallBody },
        });
        const graphCall = deepFreeze({
            graphCallId,
            graphCallDigest,
            ...graphCallBody,
            openEventRef: graphCallEvent.eventId,
        });
        const frameLineageBody = {
            runId,
            graphCallId,
            invocationRef: executionBasis.invocationRef,
            ...(parentFrameId === null ? {} : { parentFrameId }),
        };
        const frameLineageDigest = sha256Canonical(frameLineageBody);
        const frameLineageId = `frame-lineage://abiogenesis/${frameLineageDigest.slice("sha256:".length)}`;
        const frameBody = {
            frameLineageId,
            attempt: 1,
            parentFrameId,
            runId,
            graphCallId,
            executionBasisRef: executionBasis.basisRef,
            invocationRef: executionBasis.invocationRef,
            admittedInputRef: executionBasis.rawInputAdmissionRef,
            admittedInputDigest: executionBasis.rawInputDigest,
        };
        const frameDigest = sha256Canonical(frameBody);
        const frameId = `frame://abiogenesis/${frameDigest.slice("sha256:".length)}`;
        const frameStartedAt = captureNativeFrameBoundary(store);
        const frameEvent = admitRuntimeEvent(store, {
            kind: "frame_opened",
            eventTime: sampleNativeEventTime(),
            aggregateType: "frame",
            aggregateId: frameId,
            parentAggregateId: graphCallId,
            causationEventRefs: [graphCallEvent.eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: executionBasis.basisRef,
            runId,
            graphFunctionRef: executionBasis.graphFunctionRef,
            materializationRef: executionBasis.graphRef,
            graphCallId,
            frameId,
            frameLineageId,
            payload: { frameId, frameDigest, ...frameBody },
        });
        observeNativeFrameLiveness(store, frameEvent, frameStartedAt, frameStartedAt);
        frameClock = { opening: frameEvent, startedAt: frameStartedAt };
        const frame = deepFreeze({
            frameId,
            frameDigest,
            ...frameBody,
            openEventRef: frameEvent.eventId,
        });
        const scopeBody = {
            executionBasisRef: executionBasis.basisRef,
            executionBasisDigest: executionBasis.basisDigest,
            invocationAdmissionRef: executionBasis.invocationAdmissionRef,
            invocationRef: executionBasis.invocationRef,
            programRef: executionBasis.programRef,
            graphFunctionRef: executionBasis.graphFunctionRef,
            graphRef: executionBasis.graphRef,
            runId,
            runDigest,
            runOpenEventRef,
            graphCallId,
            graphCallDigest,
            graphCallOpenEventRef: graphCallEvent.eventId,
            frameId,
            frameDigest,
            frameLineageId,
            frameOpenEventRef: frameEvent.eventId,
        };
        const scopeDigest = sha256Canonical(scopeBody);
        const scope = deepFreeze({
            kind: "opened_traversal_scope",
            schemaVersion: "5.0.0",
            scopeRef: `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
            scopeDigest,
            ...scopeBody,
        });
        openedScopes.add(scope);
        return deepFreeze({
            kind: "traversal_scope_open_admission",
            schemaVersion: "5.0.0",
            disposition: "opened",
            scopeClass: context.kind,
            run: openedRun,
            graphCall,
            frame,
            scope,
        });
    });
    if (committed.successorPrefix === null) {
        throw new TypeError("scope opening produced no durable successor prefix");
    }
    if (frameClock !== null) {
        const clock = frameClock;
        retainNativeFrameClock(store, clock.opening, clock.startedAt);
    }
    return deepFreeze({
        ...committed.value,
        successorPrefix: committed.successorPrefix,
    });
}
export function projectOpenedTraversalScopeForFrameAtPrefix(prefix, frameId) {
    const rows = runtimeEventBodiesAtPrefix(prefix);
    const frames = indexedRuntimeEvents(prefix, "related:" + frameId).filter(e => e.kind === "frame_opened" && e.aggregateId === frameId);
    const frame = frames.length === 1 ? frames[0] : undefined;
    if (frame === undefined || !isRecord(frame.payload) || typeof frame.graphCallId !== "string" || typeof frame.runId !== "string")
        return null;
    const graphRows = indexedRuntimeEvents(prefix, "related:" + frame.graphCallId).filter(e => e.kind === "graph_call_opened" && e.aggregateId === frame.graphCallId);
    const runRows = indexedRuntimeEvents(prefix, "related:" + frame.runId).filter(e => e.kind === "run_segment_opened" && e.aggregateId === frame.runId);
    const graph = graphRows.length === 1 ? graphRows[0] : undefined;
    const run = runRows.length === 1 ? runRows[0] : undefined;
    const execution = rehydrateExecutionBasisAtPrefix(prefix, frame.basisId);
    if (execution === null || graph === undefined || run === undefined || !isRecord(graph.payload) || !isRecord(run.payload) ||
        typeof graph.payload.graphCallDigest !== "string" || typeof run.payload.runDigest !== "string" ||
        typeof frame.payload.frameDigest !== "string" || typeof frame.frameLineageId !== "string")
        return null;
    const body = { executionBasisRef: execution.basisRef, executionBasisDigest: execution.basisDigest,
        invocationAdmissionRef: execution.invocationAdmissionRef, invocationRef: execution.invocationRef,
        programRef: execution.programRef, graphFunctionRef: execution.graphFunctionRef, graphRef: execution.graphRef,
        runId: frame.runId, runDigest: run.payload.runDigest, runOpenEventRef: run.eventId,
        graphCallId: frame.graphCallId, graphCallDigest: graph.payload.graphCallDigest, graphCallOpenEventRef: graph.eventId,
        frameId, frameDigest: frame.payload.frameDigest, frameLineageId: frame.frameLineageId, frameOpenEventRef: frame.eventId };
    const scopeDigest = sha256Canonical(body);
    return rehydrateOpenedTraversalScopeAtPrefix(prefix, { ...body, scopeDigest,
        scopeRef: `traversal-scope://abiogenesis/${scopeDigest.slice(7)}` });
}
