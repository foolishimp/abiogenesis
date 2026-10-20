import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { sampleNativeEventTime } from "./native_event_time.js";
import { observeNativeFrameLiveness, discardNativeFrameClock, captureNativeFrameBoundary } from "./runtime_liveness.js";
import { projectAdmittedCCallStateAtPrefix, } from "./c_call.js";
import { assertHeldEventStoreAtDurablePrefix, admitRuntimeEvent, admitRuntimeEventTransactionAtExpectedPrefix, isRuntimeEventTransactionActive, readHeldRuntimeEventsAtDurablePrefix, readActiveRuntimeTransactionAtDurablePrefix, } from "./event_store.js";
import { runtimeEventPrefixDigest, runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, selectRuntimeEventPrefixFromAuthority, } from "./event_prefix.js";
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "./event_calculus.js";
import { projectOpenedTraversalScopeClassAtPrefix, rehydrateOpenedTraversalScopeAtPrefix, } from "./open_call.js";
import { projectRunQuiescence, replay, replayValidatedRuntimeEventPrefix, } from "./replay.js";
import {} from "./traversal_route.js";
import { projectTraversalRouteBody } from "./traversal_transition.js";
function refuseClosureWithoutEffects(code, message) {
    return deepFreeze({
        kind: "scope_closure_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
        failureEventRef: null,
    });
}
function selectExactClosurePrefix(store, predecessorPrefix, runId) {
    try {
        const events = isRuntimeEventTransactionActive(store)
            ? readActiveRuntimeTransactionAtDurablePrefix(store, predecessorPrefix)
            : readHeldRuntimeEventsAtDurablePrefix(store, predecessorPrefix);
        const fullPrefix = selectValidatedRuntimeEventPrefix(events);
        const runPrefix = selectRuntimeEventPrefixFromAuthority(fullPrefix, { runId });
        return deepFreeze({
            fullPrefix,
            runPrefix,
            expectedStorePrefixDigest: runtimeEventPrefixDigest(fullPrefix),
        });
    }
    catch {
        return null;
    }
}
function projectExactPreClosureQuiescence(prefix) {
    return deepFreeze({
        ...projectRunQuiescence(prefix),
    });
}
function appendClosureBatchAtExpectedPrefix(store, predecessorPrefix, expectedStorePrefixDigest, factories) {
    try {
        if (isRuntimeEventTransactionActive(store)) {
            readActiveRuntimeTransactionAtDurablePrefix(store, predecessorPrefix, { durableOnly: true });
        }
        else {
            assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
        }
    }
    catch {
        return null;
    }
    try {
        const action = () => {
            const events = [];
            for (const factory of factories) {
                const candidate = factory(events);
                const capturedAt = captureNativeFrameBoundary(store);
                const event = admitRuntimeEvent(store, candidate);
                events.push(event);
                observeNativeFrameLiveness(store, event, capturedAt);
            }
            return Object.freeze(events);
        };
        if (store.digest() !== expectedStorePrefixDigest)
            return null;
        return isRuntimeEventTransactionActive(store) ? action() :
            admitRuntimeEventTransactionAtExpectedPrefix(store, expectedStorePrefixDigest, action).value;
    }
    catch (error) {
        try {
            assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
        }
        catch {
            return null;
        }
        if (store.digest() !== expectedStorePrefixDigest)
            return null;
        throw error;
    }
}
function isExactPreClosureQuiescence(quiescence, cCall, route) {
    return quiescence.disposition === "quiescent_for_close" &&
        quiescence.runId === cCall.runId &&
        quiescence.rootGraphCallId === cCall.graphCallId &&
        quiescence.rootFrameId === cCall.frameId &&
        quiescence.terminalRouteRef === route.routeRef &&
        quiescence.terminalCCallRef === cCall.cCallRef;
}
function exactAdmissionPayload(event, eventKind, admission) {
    const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, admissionEventRef, ...payload } = admission;
    return event?.kind === eventKind &&
        event.eventId === admissionEventRef &&
        isRecord(event.payload) &&
        sha256Canonical(event.payload) ===
            sha256Canonical(payload);
}
function projectCurrentClosureTruth(prefix, authorityPrefix, cCall, result, judgment, route, resume = null) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const currentReplay = replayValidatedRuntimeEventPrefix(prefix, authorityPrefix);
    const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
    const cCallTruth = currentReplay.cCalls.find((candidate) => candidate.cCallRef === cCall.cCallRef);
    const currentRoute = currentReplay.routes.find((candidate) => candidate.routeRef === route.routeRef &&
        candidate.cCallRef === cCall.cCallRef &&
        candidate.judgmentRef === judgment.judgmentRef &&
        candidate.sourceCursorRef === route.sourceCursorRef);
    const resultEvent = events.find((event) => event.eventId === result.admissionEventRef);
    const judgmentEvent = events.find((event) => event.eventId === judgment.admissionEventRef);
    const routeEvent = events.find((event) => event.eventId === route.admissionEventRef);
    const resultBody = {
        cCallRef: result.cCallRef,
        resultClass: result.resultClass,
        contractRef: result.contractRef,
        valueKind: result.valueKind,
        valueDigest: result.valueDigest,
        value: result.value,
        evidenceRefs: result.evidenceRefs,
    };
    const judgmentBody = {
        cCallRef: judgment.cCallRef,
        resultRef: judgment.resultRef,
        resultDigest: judgment.resultDigest,
        judgment: judgment.judgment,
        reasonRef: judgment.reasonRef,
        contractRef: judgment.contractRef,
        predicateRef: judgment.predicateRef,
        replayStateDigest: judgment.replayStateDigest,
        retryAttemptRef: judgment.retryAttemptRef,
    };
    const exactRouteBody = projectTraversalRouteBody(route);
    if (exactRouteBody === null)
        return null;
    const resumeTruth = resume === null
        ? null
        : currentReplay.continuations.find((candidate) => candidate.continuationRef === resume.continuationRef &&
            candidate.continuationKind === "fh_interaction" && candidate.status === "resolved" &&
            candidate.resumedEventRef === resume.admissionEventRef &&
            candidate.responseRef === resume.responseRef &&
            candidate.responseDigest === resume.responseDigest &&
            candidate.successorCursorRef === resume.successorCursorRef &&
            candidate.successorCursorDigest === resume.successorCursorDigest);
    if (cCallTruth?.status !== "judged" ||
        cCallTruth.resultRef !== result.resultRef ||
        cCallTruth.resultDigest !== result.resultDigest ||
        cCallTruth.judgmentRef !== judgment.judgmentRef ||
        cCallTruth.judgment !== judgment.judgment ||
        result.resultDigest !== sha256Canonical(resultBody) ||
        result.resultRef !==
            `result://abiogenesis/${result.resultDigest.slice("sha256:".length)}` ||
        result.valueDigest !== sha256Canonical(result.value) ||
        judgment.judgmentDigest !==
            sha256Canonical(judgmentBody) ||
        judgment.judgmentRef !==
            `judgment://abiogenesis/${judgment.judgmentDigest.slice("sha256:".length)}` ||
        !exactAdmissionPayload(resultEvent, "c_call_result_admitted", result) ||
        !exactAdmissionPayload(judgmentEvent, "c_call_judged", judgment) ||
        route.routeDigest !== sha256Canonical(exactRouteBody) ||
        route.routeRef !==
            `traversal-route://abiogenesis/${route.routeDigest.slice("sha256:".length)}` ||
        routeEvent?.kind !== "traversal_route_admitted" ||
        routeEvent.runId !== cCall.runId ||
        routeEvent.graphCallId !== cCall.graphCallId ||
        routeEvent.frameId !== cCall.frameId ||
        !isRecord(routeEvent.payload) ||
        sha256Canonical(routeEvent.payload) !== sha256Canonical({
            routeRef: route.routeRef,
            routeDigest: route.routeDigest,
            ...exactRouteBody,
        }) ||
        currentRoute?.routeRef !== route.routeRef ||
        currentRoute.routeDigest !== route.routeDigest ||
        currentRoute.admissionEventRef !== route.admissionEventRef ||
        currentRoute.routeKind !== route.routeKind ||
        currentRoute.declarationRef !== route.declarationRef ||
        currentRoute.declarationDigest !== route.declarationDigest ||
        currentRoute.sourceCursorRef !== route.sourceCursorRef ||
        currentRoute.sourceCursorDigest !== route.sourceCursorDigest ||
        currentRoute.targetCursorRef !== route.targetCursorRef ||
        currentRoute.targetCursorDigest !== route.targetCursorDigest ||
        currentRoute.cCallRef !== route.cCallRef ||
        currentRoute.judgmentRef !== route.judgmentRef ||
        !holdsAt(eventCalculus, constructRuntimeFluent({
            name: "terminal_route_available",
            identity: route.routeRef,
        })) ||
        (resume !== null && resumeTruth === null))
        return null;
    return { events, replay: currentReplay };
}
export function admitScopeClosure(store, predecessorPrefix, subject, route, closureContract, basis) {
    const sourceCCall = subject.cCall;
    const sourceResult = subject.kind === "interaction"
        ? subject.pendingResult
        : subject.result;
    const sourceJudgment = subject.kind === "interaction"
        ? subject.pendingJudgment
        : subject.judgment;
    const exactPrefix = selectExactClosurePrefix(store, predecessorPrefix, sourceCCall.runId);
    if (exactPrefix === null) {
        return refuseClosureWithoutEffects("stale_prefix", "scope closure requires the exact held durable predecessor prefix");
    }
    const projectedCCall = projectAdmittedCCallStateAtPrefix(exactPrefix.runPrefix, sourceCCall, sourceResult, sourceJudgment);
    const exactScope = rehydrateOpenedTraversalScopeAtPrefix(exactPrefix.runPrefix, subject.scope);
    const scopeClass = exactScope === null
        ? null
        : projectOpenedTraversalScopeClassAtPrefix(exactPrefix.runPrefix, exactScope);
    if (projectedCCall === null ||
        exactScope === null ||
        scopeClass === null) {
        return refuseClosureWithoutEffects("runtime_basis_mismatch", "scope closure requires its exact prefix-admitted scope and CCall outcome");
    }
    const cCall = projectedCCall.cCall;
    const result = projectedCCall.result;
    const judgment = projectedCCall.judgment;
    const resume = subject.kind === "interaction" ? subject.resume : null;
    const childScope = scopeClass === "child" ? exactScope : null;
    const resultRef = resume?.responseRef ?? result.resultRef;
    const closureContractDigest = sha256Canonical(closureContract);
    const commonOutcomeIsExact = result.cCallRef === cCall.cCallRef &&
        judgment.cCallRef === cCall.cCallRef &&
        route.cCallRef === cCall.cCallRef &&
        judgment.resultRef === result.resultRef &&
        route.judgmentRef === judgment.judgmentRef &&
        route.routeKind === "terminal";
    const subjectOutcomeIsExact = subject.kind === "interaction"
        ? cCall.regime === "F_H" &&
            cCall.responseContractRef !== null &&
            cCall.continuationContractRef !== null &&
            result.resultClass === "pending" &&
            judgment.judgment === "pending" &&
            resume !== null &&
            resume.responseDigest === sha256Canonical(resume.responseValue) &&
            route.sourceCursorRef === resume.successorCursorRef &&
            route.sourceCursorDigest === resume.successorCursorDigest
        : judgment.judgment === "advance";
    if (!commonOutcomeIsExact || !subjectOutcomeIsExact) {
        return refuseClosureWithoutEffects("runtime_basis_mismatch", "scope closure requires one exact terminal route over its current CCall outcome");
    }
    if (cCall.runId !== exactScope.runId ||
        cCall.graphCallId !== exactScope.graphCallId ||
        cCall.frameId !== exactScope.frameId ||
        cCall.basisId !== exactScope.executionBasisRef) {
        return refuseClosureWithoutEffects("runtime_basis_mismatch", "scope closure CCall differs from its exact admitted traversal scope");
    }
    let childParentFrameId = null;
    if (childScope !== null) {
        const childGraphCallOpen = runtimeEventsFromValidatedPrefix(exactPrefix.runPrefix).find((event) => event.kind === "graph_call_opened" &&
            event.eventId === childScope.graphCallOpenEventRef &&
            event.graphCallId === childScope.graphCallId);
        const childGraphCallPayload = childGraphCallOpen !== undefined &&
            isRecord(childGraphCallOpen.payload)
            ? childGraphCallOpen.payload
            : null;
        childParentFrameId =
            typeof childGraphCallPayload?.parentFrameId === "string"
                ? childGraphCallPayload.parentFrameId
                : null;
        if (childParentFrameId === null ||
            cCall.runId !== childScope.runId ||
            cCall.graphCallId !== childScope.graphCallId ||
            cCall.frameId !== childScope.frameId) {
            return refuseClosureWithoutEffects("runtime_basis_mismatch", "child closure requires one exact active child GraphCall and Frame");
        }
    }
    const currentTruth = projectCurrentClosureTruth(exactPrefix.runPrefix, exactPrefix.fullPrefix, cCall, result, judgment, route, resume);
    if (currentTruth === null) {
        return refuseClosureWithoutEffects("replay_mismatch", "scope closure basis is not current replay and Event Calculus truth");
    }
    const expectedResultContractRef = subject.kind === "interaction"
        ? cCall.responseContractRef
        : result.contractRef;
    const expectedJudgmentContractRef = subject.kind === "interaction"
        ? cCall.continuationContractRef
        : judgment.contractRef;
    const expectedScope = scopeClass === "child" ? "graph_call" : "run";
    const expectedEventKinds = scopeClass === "child"
        ? ["terminal_reached", "frame_closed", "graph_call_closed"]
        : [
            "terminal_reached",
            "frame_closed",
            "graph_call_closed",
            "run_closed",
        ];
    const alreadyClosed = scopeClass === "child"
        ? [
            `terminal_admitted(${cCall.frameId})`,
            `frame_closed(${cCall.frameId})`,
            `graph_call_closed(${cCall.graphCallId})`,
        ].some((fluent) => currentTruth.replay.activeFluents.includes(fluent))
        : currentTruth.replay.activeFluents.includes(`terminal_admitted(${cCall.frameId})`);
    if (closureContract.closureContractRef !== cCall.closureContractRef ||
        closureContractDigest !== cCall.closureContractDigest ||
        closureContract.predicateRef !== cCall.terminalPredicateRef ||
        closureContract.replayProjectionRef !== cCall.replayProjectionRef ||
        closureContract.terminalKind !== cCall.terminalKind ||
        closureContract.terminalKind !== "completed" ||
        closureContract.evidenceContractRef !== cCall.evidenceContractRef ||
        closureContract.resultContractRef !== expectedResultContractRef ||
        closureContract.refusalContractRef !== cCall.refusalContractRef ||
        closureContract.judgmentContractRef !== expectedJudgmentContractRef ||
        closureContract.transitionContractRef !== route.contractRef ||
        closureContract.closureScope !== expectedScope ||
        closureContract.eventKindRefs.join("\0") !== expectedEventKinds.join("\0") ||
        alreadyClosed) {
        return refuseClosureWithoutEffects("closure_contract_mismatch", "scope closure contract or lifecycle uniqueness check failed");
    }
    if (scopeClass === "root") {
        const quiescence = projectExactPreClosureQuiescence(exactPrefix.runPrefix);
        if (!isExactPreClosureQuiescence(quiescence, cCall, route)) {
            return refuseClosureWithoutEffects("runtime_basis_mismatch", `run closure requires the exact quiescent prefix: ${quiescence.disposition}; ${quiescence.blockingFluents.join(",")}`);
        }
    }
    const closureBody = {
        cCallRef: cCall.cCallRef,
        resultRef,
        judgmentRef: judgment.judgmentRef,
        routeRef: route.routeRef,
        closureContractRef: closureContract.closureContractRef,
        closureContractDigest,
        ...(childScope === null
            ? {}
            : {
                childGraphCallId: childScope.graphCallId,
                childFrameId: childScope.frameId,
            }),
        terminalKind: closureContract.terminalKind,
    };
    const closureDigest = sha256Canonical(closureBody);
    const closureRef = `closure://abiogenesis/${closureDigest.slice("sha256:".length)}`;
    const graphCallId = childScope?.graphCallId ?? cCall.graphCallId;
    const frameId = childScope?.frameId ?? cCall.frameId;
    const runId = childScope?.runId ?? cCall.runId;
    const factories = [
        () => ({
            kind: "terminal_reached",
            eventTime: sampleNativeEventTime(),
            aggregateType: "frame",
            aggregateId: frameId,
            parentAggregateId: graphCallId,
            causationEventRefs: [
                route.admissionEventRef,
                ...basis.causationEventRefs,
            ],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: cCall.basisId,
            runId,
            graphFunctionRef: cCall.graphFunctionRef,
            graphCallId,
            frameId,
            payload: { closureRef, closureDigest, ...closureBody },
        }),
        (batch) => ({
            kind: "frame_closed",
            eventTime: sampleNativeEventTime(),
            aggregateType: "frame",
            aggregateId: frameId,
            parentAggregateId: graphCallId,
            causationEventRefs: [batch[0].eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: cCall.basisId,
            runId,
            graphFunctionRef: cCall.graphFunctionRef,
            graphCallId,
            frameId,
            payload: {
                frameId,
                terminalReachedEventRef: batch[0].eventId,
                closureContractRef: closureContract.closureContractRef,
            },
        }),
        (batch) => ({
            kind: "graph_call_closed",
            eventTime: sampleNativeEventTime(),
            aggregateType: "graph_call",
            aggregateId: graphCallId,
            parentAggregateId: runId,
            causationEventRefs: [batch[1].eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: cCall.basisId,
            runId,
            graphFunctionRef: cCall.graphFunctionRef,
            graphCallId,
            ...(childScope === null ? {} : { frameId }),
            payload: {
                graphCallId,
                frameClosedEventRef: batch[1].eventId,
                closureContractRef: closureContract.closureContractRef,
            },
        }),
    ];
    if (scopeClass === "root") {
        factories.push((batch) => ({
            kind: "run_closed",
            eventTime: sampleNativeEventTime(),
            aggregateType: "run",
            aggregateId: runId,
            parentAggregateId: null,
            causationEventRefs: [batch[2].eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: cCall.basisId,
            runId,
            graphFunctionRef: cCall.graphFunctionRef,
            graphCallId,
            payload: {
                runId,
                graphCallClosedEventRef: batch[2].eventId,
                closureContractRef: closureContract.closureContractRef,
            },
        }));
    }
    const events = appendClosureBatchAtExpectedPrefix(store, predecessorPrefix, exactPrefix.expectedStorePrefixDigest, factories);
    if (events === null) {
        return refuseClosureWithoutEffects("stale_prefix", "scope closure predecessor became stale before its atomic append");
    }
    if (!isRuntimeEventTransactionActive(store))
        discardNativeFrameClock(store, frameId);
    return deepFreeze({
        kind: "scope_closure_admission",
        schemaVersion: "5.0.0",
        disposition: "closed",
        scopeClass: expectedScope,
        closureRef,
        closureDigest,
        cCallRef: cCall.cCallRef,
        resultRef,
        judgmentRef: judgment.judgmentRef,
        routeRef: route.routeRef,
        closureContractRef: closureContract.closureContractRef,
        terminalReachedEventRef: events[0].eventId,
        frameClosedEventRef: events[1].eventId,
        graphCallClosedEventRef: events[2].eventId,
        runClosedEventRef: events[3]?.eventId ?? null,
        childGraphCallId: childScope?.graphCallId ?? null,
        childFrameId: childScope?.frameId ?? null,
        replayState: replay(store, { runId }),
    });
}
