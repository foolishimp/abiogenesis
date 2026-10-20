import { isJsonRecordShape as isRecord } from "../shared/admission_predicates.js";
import { isInteractionCLeaf } from "../gtl/c_algebra.js";
import { resolveEnclosingCBatchRef, resolveCProgramTermAtSourcePath, } from "../gtl/source_path.js";
import { isCapabilityGrantValue, } from "../product/invocation.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { replayValidatedRuntimeEventPrefix } from "./replay.js";
import { isAdmittedCCallJudgment, isAdmittedCCallResult, admitPlannedPendingInteraction, projectPendingInteractionCarrier, rehydratePendingInteraction, } from "./c_call.js";
function graphFunctionCatalogViewRef(view) {
    return `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`;
}
import { admittedConstructionComposition, hasAdmittedExecutionBasisAtPrefix, hasAdmittedInteractionSetAtPrefix, isAdmittedConstructionInteractionLocus, rehydrateExecutionBasis, rehydrateExecutionBasisAtPrefix, } from "./execution_basis.js";
import { hasAdmittedProductInstall, hasAdmittedWorkspaceBinding, validatePublicOperationBasis, } from "./environment_admission.js";
import { projectEffectfulPublicInvocationTruthAtPrefix, } from "./effectful_invocation_truth.js";
import { AbgEventStore, admitNonEmptyRuntimeEventTransactionAtDurablePrefix, assertHeldEventStoreAtDurablePrefix, admitRuntimeEvent, admitRuntimeEventTransactionAtExpectedPrefix, readHeldRuntimeEventsAtDurablePrefix, compareAndAppendExpectedPrefix, projectRuntimeEventFromValidatedHistory, } from "./event_store.js";
export function admitContinuationTerminal(store, continuationRef, disposition, candidateRef, candidateDigest, basis) {
    const snapshot = store.readAll();
    const prefix = selectValidatedRuntimeEventPrefix(snapshot);
    const calculus = deriveRuntimeEventCalculusProjection(prefix);
    const current = projectFhContinuations(prefix, calculus).find((row) => row.continuationRef === continuationRef);
    if (current === undefined ||
        (current.status !== "open" && current.status !== "responded")) {
        throw new TypeError("continuation terminal admission requires one exact current continuation");
    }
    const predecessorRef = current.respondedEventRef ?? current.openedEventRef;
    const predecessor = snapshot.find((event) => event.eventId === predecessorRef);
    if (predecessor === undefined) {
        throw new TypeError("continuation terminal admission requires its exact predecessor event");
    }
    const admitted = compareAndAppendExpectedPrefix(store, store.digest(), [() => ({
            kind: disposition === "abandoned"
                ? "continuation_abandoned"
                : "continuation_superseded",
            eventTime: basis.eventTime,
            aggregateType: "continuation",
            aggregateId: continuationRef,
            parentAggregateId: current.frameId,
            causationEventRefs: [predecessor.eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: predecessor.basisId,
            runId: current.runId,
            ...(predecessor.graphFunctionRef === undefined
                ? {}
                : { graphFunctionRef: predecessor.graphFunctionRef }),
            ...(predecessor.materializationRef === undefined
                ? {}
                : { materializationRef: predecessor.materializationRef }),
            graphCallId: current.graphCallId,
            frameId: current.frameId,
            payload: {
                continuationRef,
                continuationDigest: current.continuationDigest,
                continuationKind: current.continuationKind,
                terminalDisposition: disposition,
                candidateRef,
                candidateDigest,
                causedByEventRef: predecessor.eventId,
            },
        })]);
    return admitted[0];
}
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "./event_calculus.js";
import { runtimeEventPrefixDigest, runtimeEventsFromValidatedPrefix, selectRuntimeEventPrefixFromAuthority, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { hasAdmittedInvocation, hasAdmittedInvocationAtPrefix, rehydrateInvocationAdmissionAtPrefix, } from "./invocation_admission.js";
import { hasOpenedTraversalScopeAtPrefix, rehydrateOpenedTraversalScope, rehydrateOpenedTraversalScopeAtPrefix, } from "./open_call.js";
import { isAdmittedRoute, admitTraversalTransitionInActiveTransaction, rehydrateConstructionIntentForCursorAtPrefix, } from "./traversal_route.js";
import { hasAdmittedTraversalCursorAtPrefix, isInteractionResumeCursorSuccessorAtPrefix, isTraversalCursorCandidate, traversalCursorAdmissionEventRefAtPrefix, } from "./traversal_cursor.js";
import { projectFhContinuations, validateExactFhResumeOwnerRelationAtPrefix, } from "./fh_continuation_projection.js";
import { deriveFhResumeSuccessorInputAtPrefix as deriveOwnerFhResumeSuccessorInputAtPrefix, } from "./fh_resume_relation.js";
export { projectFhContinuations, } from "./fh_continuation_projection.js";
function executionBasisDescendsFromRootInvocation(store, leafBasis, rootInvocation) {
    return executionBasisDescendsFromRootInvocationAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), leafBasis, rootInvocation);
}
function executionBasisDescendsFromRootInvocationAtPrefix(prefix, leafBasis, rootInvocation) {
    const seen = new Set();
    let current = leafBasis;
    while (current !== null) {
        if (seen.has(current.basisRef) ||
            current.invocationAdmissionRef !==
                rootInvocation.invocationAdmissionRef ||
            current.invocationRef !== rootInvocation.invocationRef ||
            current.programRef !== rootInvocation.programRef) {
            return false;
        }
        seen.add(current.basisRef);
        if (current.parentExecutionBasisRef === null) {
            return current.basisClass === "root" &&
                current.parentTraversalScopeRef === null &&
                current.graphFunctionRef === rootInvocation.graphFunctionRef;
        }
        if (current.basisClass !== "child" ||
            current.parentTraversalScopeRef === null) {
            return false;
        }
        current = rehydrateExecutionBasisAtPrefix(prefix, current.parentExecutionBasisRef);
    }
    return false;
}
/**
 * Reconstructs the exact pending F_H CCall carrier from one immutable ABG
 * prefix and the admitted owner surfaces that declared its interaction locus.
 */
export function projectHeldInteractionCCallOutcomeAtPrefix(prefix, input) {
    const basis = input.executionBasis;
    const scope = input.openedTraversalScope;
    const graph = input.graph;
    const cursor = input.cursor;
    const interactionSet = input.interactionSet;
    const term = resolveCProgramTermAtSourcePath(graph.template, cursor.currentNodeRef, cursor.termPath);
    const batchRef = resolveEnclosingCBatchRef(graph.template, cursor.currentNodeRef, cursor.termPath);
    if (!hasAdmittedExecutionBasisAtPrefix(prefix, basis) ||
        !hasOpenedTraversalScopeAtPrefix(prefix, scope) ||
        !hasAdmittedInteractionSetAtPrefix(prefix, interactionSet) ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
        scope.executionBasisRef !== basis.basisRef ||
        scope.graphFunctionRef !== basis.graphFunctionRef ||
        scope.runId !== cursor.runId ||
        scope.graphCallId !== cursor.graphCallId ||
        scope.frameId !== cursor.frameId ||
        cursor.executionBasisRef !== basis.basisRef ||
        cursor.traversalScopeRef !== scope.scopeRef ||
        cursor.graphRef !== graph.materializationRef ||
        graph.materializationRef !== basis.graphRef ||
        graph.materializationDigest !== basis.graphDigest ||
        graph.graphFunctionRef !== basis.graphFunctionRef ||
        input.program.programRef !== basis.programRef ||
        sha256Canonical(input.program) !==
            basis.programDigest ||
        !input.program.callableMembership.includes(basis.graphFunctionRef) ||
        interactionSet.interactionSetRef !== basis.interactionSetRef ||
        interactionSet.interactionSetDigest !== basis.interactionSetDigest ||
        term.kind === "c_source_path_refusal" ||
        !isInteractionCLeaf(term) ||
        term.fibre !== "F_H" ||
        (batchRef !== null && typeof batchRef !== "string")) {
        return null;
    }
    const interactionRows = interactionSet.rows.filter((row) => row.graphFunctionRef === basis.graphFunctionRef &&
        row.nodeRef === cursor.currentNodeRef &&
        row.programLocusRef === term.programLocusRef &&
        row.fibre === "F_H" &&
        row.requirement.interactionKind === term.requirement.interactionKind &&
        row.requirement.actorCapabilityRef ===
            term.requirement.actorCapabilityRef &&
        row.requirement.requestContractRef ===
            term.requirement.requestContractRef &&
        row.requirement.responseContractRef ===
            term.requirement.responseContractRef &&
        row.requirement.continuationContractRef ===
            term.requirement.continuationContractRef);
    if (interactionRows.length !== 1) {
        return null;
    }
    const interaction = interactionRows[0];
    const identity = {
        basisId: basis.basisRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        vectorIndex: term.vectorIndex,
        stageRole: term.stageRole,
        taskOrdinal: cursor.taskOrdinal,
        attempt: cursor.attempt,
        programLocusRef: term.programLocusRef,
        retryPath: cursor.retryPath,
    };
    const cCallDigest = sha256Canonical(identity);
    const cCallRef = `c-call:${cCallDigest}`;
    const cCallEvents = runtimeEventsFromValidatedPrefix(prefix).filter((event) => event.aggregateType === "c_call" && event.aggregateId === cCallRef);
    const openedRows = cCallEvents.filter((event) => event.kind === "c_call_opened");
    const fibreRows = cCallEvents.filter((event) => event.kind === "c_call_fibre_selected");
    const evidenceRows = cCallEvents.filter((event) => event.kind === "c_call_evidenced");
    const resultRows = cCallEvents.filter((event) => event.kind === "c_call_result_admitted");
    const judgmentRows = cCallEvents.filter((event) => event.kind === "c_call_judged");
    if (cCallEvents.length !== 5 || openedRows.length !== 1 ||
        fibreRows.length !== 1 || evidenceRows.length !== 1 ||
        resultRows.length !== 1 || judgmentRows.length !== 1) {
        return null;
    }
    const openedEvent = openedRows[0];
    const fibreEvent = fibreRows[0];
    const evidenceEvent = evidenceRows[0];
    const resultEvent = resultRows[0];
    const judgmentEvent = judgmentRows[0];
    const cursorEventRef = traversalCursorAdmissionEventRefAtPrefix(prefix, cursor);
    const locusBody = {
        cCallRef,
        cCallDigest,
        callClass: "leaf",
        basisId: basis.basisRef,
        graphFunctionRef: basis.graphFunctionRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        edgeRef: basis.entryRef,
        vectorIndex: term.vectorIndex,
        stageRole: term.stageRole,
        batchRef,
        taskOrdinal: cursor.taskOrdinal,
        attempt: cursor.attempt,
        programLocusRef: term.programLocusRef,
        retryPath: cursor.retryPath,
        cursorRef: cursor.cursorRef,
        cursorDigest: cursor.cursorDigest,
    };
    const fibreBody = {
        cCallRef,
        callClass: "leaf",
        regime: "F_H",
        armId: term.armId,
        compositionRef: term.compositionRef,
        implementationSetRef: basis.rootImplementationSetRef,
        implementationRequirementKey: null,
        implementationBindingRef: null,
        implementationRef: null,
        interactionSetRef: interactionSet.interactionSetRef,
        interactionRequirementKey: interaction.requirementKey,
        interactionKind: term.requirement.interactionKind,
        actorCapabilityRef: term.requirement.actorCapabilityRef,
        requestContractRef: term.requirement.requestContractRef,
        responseContractRef: term.requirement.responseContractRef,
        continuationContractRef: term.requirement.continuationContractRef,
    };
    const requestDigest = cursor.inputDigest;
    const requestRef = `interaction-request://abiogenesis/${requestDigest.slice("sha256:".length)}`;
    const pendingValue = deepFreeze({
        kind: "fh_pending_result",
        schemaVersion: "5.0.0",
        interactionKind: term.requirement.interactionKind,
        requestRef,
        requestDigest,
        responseContractRef: term.requirement.responseContractRef,
        continuationContractRef: term.requirement.continuationContractRef,
    });
    const pendingValueDigest = sha256Canonical(pendingValue);
    const evidenceBody = {
        cCallRef,
        evidenceClass: "interaction_request",
        contractRef: term.requirement.requestContractRef,
        implementationRef: null,
        inputDigest: requestDigest,
        outputDigest: pendingValueDigest,
        requestRef,
        requestDigest,
    };
    const evidenceDigest = sha256Canonical(evidenceBody);
    const evidenceRef = `evidence://abiogenesis/${evidenceDigest.slice("sha256:".length)}`;
    const resultBody = {
        cCallRef,
        resultClass: "pending",
        contractRef: term.requirement.continuationContractRef,
        valueKind: "fh_pending_result",
        valueDigest: pendingValueDigest,
        value: pendingValue,
        evidenceRefs: [evidenceRef],
    };
    const resultDigest = sha256Canonical(resultBody);
    const resultRef = `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
    const exactPayload = (event, payload) => isRecord(event.payload) &&
        sha256Canonical(event.payload) ===
            sha256Canonical(payload);
    const exactEnvelope = (event) => event.parentAggregateId === scope.frameId &&
        event.basisId === basis.basisRef && event.runId === scope.runId &&
        event.graphFunctionRef === basis.graphFunctionRef &&
        event.graphCallId === scope.graphCallId && event.frameId === scope.frameId;
    if (cursorEventRef === null || !exactEnvelope(openedEvent) ||
        openedEvent.materializationRef !== basis.graphRef ||
        openedEvent.frameLineageId !== scope.frameLineageId ||
        openedEvent.causationEventRefs.length !== 1 ||
        openedEvent.causationEventRefs[0] !== cursorEventRef ||
        !exactPayload(openedEvent, locusBody) || !exactEnvelope(fibreEvent) ||
        fibreEvent.materializationRef !== basis.graphRef ||
        fibreEvent.frameLineageId !== scope.frameLineageId ||
        fibreEvent.causationEventRefs.length !== 1 ||
        fibreEvent.causationEventRefs[0] !== openedEvent.eventId ||
        !exactPayload(fibreEvent, fibreBody) || !exactEnvelope(evidenceEvent) ||
        evidenceEvent.causationEventRefs.length !== 1 ||
        evidenceEvent.causationEventRefs[0] !== fibreEvent.eventId ||
        !exactPayload(evidenceEvent, {
            evidenceRef,
            evidenceDigest,
            ...evidenceBody,
        }) ||
        !exactEnvelope(resultEvent) || resultEvent.causationEventRefs.length !== 1 ||
        resultEvent.causationEventRefs[0] !== evidenceEvent.eventId ||
        !exactPayload(resultEvent, { resultRef, resultDigest, ...resultBody }) ||
        !exactEnvelope(judgmentEvent) ||
        judgmentEvent.causationEventRefs.length !== 1 ||
        judgmentEvent.causationEventRefs[0] !== resultEvent.eventId ||
        !isRecord(judgmentEvent.payload) ||
        judgmentEvent.payload.cCallRef !== cCallRef ||
        judgmentEvent.payload.resultRef !== resultRef ||
        judgmentEvent.payload.resultDigest !== resultDigest ||
        judgmentEvent.payload.judgment !== "pending" ||
        judgmentEvent.payload.reasonRef !==
            `reason://abiogenesis/fh/${term.requirement.interactionKind}/pending@5` ||
        judgmentEvent.payload.contractRef !==
            term.requirement.continuationContractRef ||
        judgmentEvent.payload.predicateRef !== term.judgmentPredicateRef) {
        return null;
    }
    const cCall = deepFreeze({
        kind: "c_call",
        schemaVersion: "5.0.0",
        cCallRef,
        cCallDigest,
        callClass: "leaf",
        basisId: basis.basisRef,
        runId: scope.runId,
        graphFunctionRef: basis.graphFunctionRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        edgeRef: basis.entryRef,
        vectorIndex: term.vectorIndex,
        stageRole: term.stageRole,
        batchRef,
        taskOrdinal: cursor.taskOrdinal,
        attempt: cursor.attempt,
        programLocusRef: term.programLocusRef,
        retryPath: cursor.retryPath,
        regime: "F_H",
        armId: term.armId,
        compositionRef: term.compositionRef,
        implementationSetRef: basis.rootImplementationSetRef,
        implementationRequirementKey: null,
        implementationBindingRef: null,
        implementationRef: null,
        interactionSetRef: interactionSet.interactionSetRef,
        interactionRequirementKey: interaction.requirementKey,
        interactionKind: term.requirement.interactionKind,
        actorCapabilityRef: term.requirement.actorCapabilityRef,
        responseContractRef: term.requirement.responseContractRef,
        continuationContractRef: term.requirement.continuationContractRef,
        childGraphFunctionRef: null,
        inputContractRef: term.requirement.requestContractRef,
        outputContractRef: term.requirement.responseContractRef,
        failureContractRef: basis.refusalContractRef,
        refusalContractRef: basis.refusalContractRef,
        refusalValueKind: basis.refusalValueKind,
        evidenceContractRef: term.requirement.requestContractRef,
        judgmentContractRef: term.requirement.continuationContractRef,
        rejectionContractRef: basis.rejectionContractRef,
        transitionContractRef: basis.transitionContractRef,
        closureContractRef: basis.closureContractRef,
        closureContractDigest: basis.closureContractDigest,
        judgmentPredicateRef: term.judgmentPredicateRef,
        terminalPredicateRef: basis.terminalPredicateRef,
        replayProjectionRef: basis.replayProjectionRef,
        terminalKind: basis.terminalKind,
        openedEventRef: openedEvent.eventId,
        fibreSelectedEventRef: fibreEvent.eventId,
    });
    const result = deepFreeze({
        ...resultEvent.payload,
        kind: "admitted_c_call_result",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        admissionEventRef: resultEvent.eventId,
    });
    const judgment = deepFreeze({
        ...judgmentEvent.payload,
        kind: "admitted_c_call_judgment",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        admissionEventRef: judgmentEvent.eventId,
    });
    const projected = projectPendingInteractionCarrier(prefix, cCall, result, judgment);
    return projected !== null && projected.requestRef === requestRef &&
        projected.requestDigest === requestDigest
        ? deepFreeze({
            cCall: projected.cCall,
            result: projected.result,
            judgment: projected.judgment,
        })
        : null;
}
function stringField(event, key) {
    if (!isRecord(event.payload))
        return null;
    const value = event.payload[key];
    return typeof value === "string" && value.length > 0 ? value : null;
}
function digestField(event, key) {
    const value = stringField(event, key);
    return value?.startsWith("sha256:") ? value : null;
}
function runtimeEventCandidate(event) {
    const { eventId: _eventId, admissionOrdinal: _admissionOrdinal, payloadDigest: _payloadDigest, ...candidate } = event;
    return candidate;
}
function resolveCurrentContinuationOperationCoordinate(store, continuationRef, operation, predecessor) {
    return resolveCurrentContinuationOperationCoordinateAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), continuationRef, operation, predecessor);
}
function resolveCurrentContinuationOperationCoordinateAtPrefix(prefix, continuationRef, operation, predecessor) {
    if (predecessor.eventRef === null)
        return null;
    const applicable = runtimeEventsFromValidatedPrefix(prefix).filter((event) => (event.aggregateType === "continuation" &&
        event.aggregateId === continuationRef) ||
        (event.kind === "public_operation_admitted" &&
            isRecord(event.payload) &&
            event.payload.continuationRef === continuationRef &&
            event.payload.operationId === operation.operationId));
    const operationEvent = applicable.at(-1);
    const predecessorEvent = [...applicable].reverse().find((event) => event.aggregateType === "continuation");
    const operationPayload = operationEvent !== undefined && isRecord(operationEvent.payload)
        ? operationEvent.payload
        : null;
    const capabilityGrantRefs = operationPayload !== null &&
        Array.isArray(operationPayload.capabilityGrantRefs)
        ? operationPayload.capabilityGrantRefs
        : null;
    if (operation.kind !== "continuation_public_operation_admission" ||
        operation.schemaVersion !== "5.0.0" ||
        operation.disposition !== "admitted" ||
        operation.continuationRef !== continuationRef ||
        operationEvent?.eventId !== operation.admissionEventRef ||
        operationEvent.kind !== "public_operation_admitted" ||
        operationEvent.parentAggregateId !== operation.invocationRef ||
        operationPayload === null ||
        operationPayload.operationId !== operation.operationId ||
        operationPayload.continuationRef !== continuationRef ||
        operationPayload.invocationRef !== operation.invocationRef ||
        operationPayload.actorRef !== operation.actorRef ||
        operationPayload.capabilityRef !== operation.capabilityRef ||
        capabilityGrantRefs === null ||
        capabilityGrantRefs.length !== 1 ||
        capabilityGrantRefs[0] !== operation.capabilityGrantRef ||
        predecessorEvent?.eventId !== predecessor.eventRef ||
        predecessorEvent.kind !== predecessor.kind ||
        predecessorEvent.aggregateType !== "continuation" ||
        predecessorEvent.aggregateId !== continuationRef ||
        predecessorEvent.admissionOrdinal >= operationEvent.admissionOrdinal) {
        return null;
    }
    return { event: operationEvent, payload: operationPayload };
}
function resolvePreparedContinuationOperationCoordinateAtPrefix(prefix, continuationRef, prepared, predecessor) {
    if (prepared.kind !== "prepared_continuation_public_operation" ||
        prepared.schemaVersion !== "5.0.0") {
        return null;
    }
    const coordinate = resolveCurrentContinuationOperationCoordinateAtPrefix(prefix, continuationRef, prepared.operation, predecessor);
    return coordinate !== null &&
        sha256Canonical(prepared.event) ===
            sha256Canonical(coordinate.event)
        ? coordinate
        : null;
}
export function projectFhInteractionSemanticBasis(store, continuation) {
    return projectFhInteractionSemanticBasisAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), continuation);
}
export function projectFhInteractionSemanticBasisAtPrefix(prefix, continuation) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const continuationRef = continuation.continuationRef;
    const opened = events.find((event) => event.eventId === continuation.openedEventRef);
    if (continuation.status !== "open" ||
        opened?.kind !== "fh_interaction_opened" ||
        opened.aggregateType !== "continuation" ||
        opened.aggregateId !== continuationRef) {
        return null;
    }
    if (!isRecord(opened.payload) || !isRecord(opened.payload.inputValue)) {
        return null;
    }
    const requestValue = opened.payload.inputValue;
    if (sha256Canonical(requestValue) !== continuation.requestDigest) {
        return null;
    }
    if (continuation.constructionIntentRef === null) {
        return deepFreeze({
            requestContractRef: continuation.requestContractRef,
            responseContractRef: continuation.responseContractRef,
            requestValue,
            constructionIntent: null,
            nextActionBasis: null,
        });
    }
    const intentRows = events.filter((event) => event.kind === "construction_intent_selected" &&
        event.runId === continuation.runId &&
        event.graphCallId === continuation.graphCallId &&
        event.frameId === continuation.frameId &&
        event.admissionOrdinal < opened.admissionOrdinal &&
        isRecord(event.payload) &&
        event.payload.constructionIntentRef ===
            continuation.constructionIntentRef);
    if (intentRows.length !== 1) {
        return null;
    }
    const intentEvent = intentRows[0];
    const intentPayload = intentEvent.payload;
    if (!isRecord(intentPayload))
        return null;
    const constructionIntent = intentPayload.constructionIntent;
    const nextActionBasis = intentPayload.nextActionBasis;
    if (!isRecord(constructionIntent) || !isRecord(nextActionBasis)) {
        return null;
    }
    const { constructionIntentRef, constructionIntentDigest, ...intentBody } = constructionIntent;
    const { basisRef, basisDigest, ...basisBody } = nextActionBasis;
    const { projectionRef, projectionDigest, ...projectionBody } = requestValue;
    if (typeof constructionIntentRef !== "string" ||
        typeof constructionIntentDigest !== "string" ||
        typeof basisRef !== "string" ||
        typeof basisDigest !== "string" ||
        typeof projectionRef !== "string" ||
        typeof projectionDigest !== "string" ||
        sha256Canonical(intentBody) !== constructionIntentDigest ||
        sha256Canonical(basisBody) !== basisDigest ||
        sha256Canonical(projectionBody) !== projectionDigest ||
        constructionIntentRef !== continuation.constructionIntentRef ||
        constructionIntentDigest !== continuation.constructionIntentDigest ||
        constructionIntent.nextActionProjectionRef !== projectionRef ||
        constructionIntent.nextActionProjectionDigest !==
            projectionDigest ||
        constructionIntent.nextActionBasisRef !== basisRef ||
        constructionIntent.nextActionBasisDigest !== basisDigest ||
        constructionIntent.targetCursorRef !== continuation.heldCursorRef ||
        requestValue.nextActionBasisRef !== basisRef ||
        requestValue.nextActionBasisDigest !== basisDigest ||
        intentPayload.nextActionBasisRef !== basisRef ||
        intentPayload.nextActionBasisDigest !== basisDigest) {
        return null;
    }
    return deepFreeze({
        requestContractRef: continuation.requestContractRef,
        responseContractRef: continuation.responseContractRef,
        requestValue,
        constructionIntent,
        nextActionBasis,
    });
}
export function rehydrateFhContinuation(store, continuation, expected, operation) {
    return rehydrateFhContinuationAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), continuation, expected, operation);
}
export function rehydrateFhContinuationAtPrefix(prefix, continuation, expected, operation) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const continuationRef = continuation.continuationRef;
    const operationCoordinate = resolveCurrentContinuationOperationCoordinateAtPrefix(prefix, continuationRef, operation, {
        eventRef: continuation.respondedEventRef,
        kind: "fh_interaction_responded",
    });
    const opened = events.find((event) => event.eventId === continuation.openedEventRef);
    if (continuation.status !== "responded" ||
        opened?.kind !== "fh_interaction_opened" ||
        opened.aggregateType !== "continuation" ||
        opened.aggregateId !== continuationRef) {
        return null;
    }
    if (!isRecord(opened.payload))
        return null;
    const executionBasisRef = stringField(opened, "executionBasisRef");
    if (executionBasisRef === null)
        return null;
    const executionBasis = rehydrateExecutionBasisAtPrefix(prefix, executionBasisRef);
    if (executionBasis === null)
        return null;
    const rootInvocation = rehydrateInvocationAdmissionAtPrefix(prefix, executionBasis.invocationAdmissionRef);
    const scopeValue = opened.payload.openedTraversalScope;
    const cursorValue = opened.payload.heldCursor;
    const cCallValue = opened.payload.cCall;
    const resultValue = opened.payload.pendingResult;
    const judgmentValue = opened.payload.pendingJudgment;
    if (rootInvocation === null ||
        !isRecord(scopeValue) ||
        !isRecord(cursorValue) ||
        !isRecord(cCallValue) ||
        !isRecord(resultValue) ||
        !isRecord(judgmentValue)) {
        return null;
    }
    const openedTraversalScope = rehydrateOpenedTraversalScopeAtPrefix(prefix, scopeValue);
    const cursor = deepFreeze(cursorValue);
    const pending = projectPendingInteractionCarrier(prefix, cCallValue, resultValue, judgmentValue);
    if (pending === null)
        return null;
    const constructionIntent = isTraversalCursorCandidate(cursor)
        ? rehydrateConstructionIntentForCursorAtPrefix(prefix, cursor)
        : null;
    const requiresConstructionIntent = isAdmittedConstructionInteractionLocus(executionBasis, pending.cCall.programLocusRef, pending.cCall.compositionRef);
    const closureContractDigest = sha256Canonical(expected.closureContract);
    const operationEvent = operationCoordinate?.event;
    const operationPayload = operationCoordinate?.payload ?? null;
    const operationCapabilityRefs = operationPayload !== null &&
        Array.isArray(operationPayload.capabilityGrantRefs)
        ? operationPayload.capabilityGrantRefs
        : null;
    if (openedTraversalScope === null ||
        !isTraversalCursorCandidate(cursor) ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
        stringField(opened, "continuationRef") !== continuationRef ||
        digestField(opened, "continuationDigest") !==
            continuation.continuationDigest ||
        stringField(opened, "productId") !== expected.install.productId ||
        digestField(opened, "productContentDigest") !==
            expected.install.productContentDigest ||
        digestField(opened, "manifestDigest") !== expected.install.manifestDigest ||
        stringField(opened, "installId") !== expected.install.installId ||
        stringField(opened, "workspaceBindingId") !==
            expected.workspaceBinding.bindingId ||
        digestField(opened, "workspaceBindingDigest") !==
            expected.workspaceBinding.bindingDigest ||
        stringField(opened, "catalogViewId") !== graphFunctionCatalogViewRef(expected.catalogView) ||
        digestField(opened, "catalogViewDigest") !== expected.catalogView.viewDigest ||
        stringField(opened, "programRef") !== expected.program.programRef ||
        digestField(opened, "programDigest") !==
            sha256Canonical(expected.program) ||
        stringField(opened, "graphRef") !== expected.graph.materializationRef ||
        digestField(opened, "graphDigest") !== expected.graph.materializationDigest ||
        stringField(opened, "graphFunctionRef") !==
            expected.graph.graphFunctionRef ||
        stringField(opened, "programValidationRef") !==
            executionBasis.programValidationRef ||
        stringField(opened, "graphValidationRef") !==
            executionBasis.graphValidationRef ||
        stringField(opened, "implementationSetRef") !==
            executionBasis.implementationSetRef ||
        digestField(opened, "implementationSetDigest") !==
            executionBasis.implementationSetDigest ||
        stringField(opened, "interactionSetRef") !==
            executionBasis.interactionSetRef ||
        digestField(opened, "interactionSetDigest") !==
            executionBasis.interactionSetDigest ||
        digestField(opened, "executionBasisDigest") !== executionBasis.basisDigest ||
        executionBasis.workspaceBindingId !== expected.workspaceBinding.bindingId ||
        executionBasis.workspaceBindingDigest !==
            expected.workspaceBinding.bindingDigest ||
        executionBasis.catalogViewId !== graphFunctionCatalogViewRef(expected.catalogView) ||
        executionBasis.catalogViewDigest !== expected.catalogView.viewDigest ||
        executionBasis.programRef !== expected.program.programRef ||
        executionBasis.programDigest !==
            sha256Canonical(expected.program) ||
        executionBasis.graphRef !== expected.graph.materializationRef ||
        executionBasis.graphDigest !== expected.graph.materializationDigest ||
        executionBasis.closureContractRef !==
            expected.closureContract.closureContractRef ||
        executionBasis.closureContractDigest !== closureContractDigest ||
        rootInvocation.workspaceBindingId !== expected.workspaceBinding.bindingId ||
        rootInvocation.catalogViewId !== graphFunctionCatalogViewRef(expected.catalogView) ||
        rootInvocation.programRef !== expected.program.programRef ||
        !executionBasisDescendsFromRootInvocationAtPrefix(prefix, executionBasis, rootInvocation) ||
        openedTraversalScope.executionBasisRef !== executionBasis.basisRef ||
        openedTraversalScope.scopeRef !== stringField(opened, "scopeRef") ||
        openedTraversalScope.scopeDigest !== digestField(opened, "scopeDigest") ||
        openedTraversalScope.runId !== continuation.runId ||
        openedTraversalScope.graphCallId !== continuation.graphCallId ||
        openedTraversalScope.frameId !== continuation.frameId ||
        pending.cCall.cCallRef !== continuation.cCallRef ||
        pending.cCall.basisId !== executionBasis.basisRef ||
        pending.cCall.runId !== continuation.runId ||
        pending.cCall.graphCallId !== continuation.graphCallId ||
        pending.cCall.frameId !== continuation.frameId ||
        pending.cCall.responseContractRef !== continuation.responseContractRef ||
        (requiresConstructionIntent &&
            (constructionIntent === null ||
                continuation.constructionIntentRef !==
                    constructionIntent.constructionIntentRef ||
                continuation.constructionIntentDigest !==
                    constructionIntent.constructionIntentDigest)) ||
        pending.requestRef !== continuation.requestRef ||
        pending.requestDigest !== continuation.requestDigest ||
        cursor.cursorRef !== continuation.heldCursorRef ||
        cursor.cursorDigest !== continuation.heldCursorDigest ||
        cursor.executionBasisRef !== executionBasis.basisRef ||
        cursor.traversalScopeRef !== openedTraversalScope.scopeRef ||
        cursor.runId !== continuation.runId ||
        cursor.graphCallId !== continuation.graphCallId ||
        cursor.frameId !== continuation.frameId ||
        operation.operationId !== "abg.operation.run.continue" ||
        operation.continuationRef !== continuationRef ||
        operation.capabilityRef !== continuation.actorCapabilityRef ||
        operationPayload?.capabilityRef !== operation.capabilityRef ||
        operationEvent?.kind !== "public_operation_admitted" ||
        operationPayload === null ||
        operationPayload.continuationRef !== continuationRef ||
        operationPayload.actorRef !== operation.actorRef ||
        operationCapabilityRefs?.[0] !== operation.capabilityGrantRef) {
        return null;
    }
    const inputValue = opened.payload.inputValue;
    if (!isRecord(inputValue) ||
        sha256Canonical(inputValue) !== cursor.inputDigest ||
        stringField(opened, "inputRef") !== cursor.inputRef ||
        digestField(opened, "inputDigest") !== cursor.inputDigest) {
        return null;
    }
    return deepFreeze({
        continuation,
        rootInvocation,
        executionBasis,
        openedTraversalScope,
        heldInteraction: {
            cCall: pending.cCall,
            result: pending.result,
            judgment: pending.judgment,
            cursor,
        },
    });
}
export function prepareContinuationPublicOperation(prefix, rootInvocation, operation, continuation, variant, actorRef, capabilityRef, basis) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const runPrefix = selectValidatedRuntimeEventPrefix(events, {
        runId: continuation.runId,
    });
    const reconstructedContinuation = projectFhContinuations(runPrefix, deriveRuntimeEventCalculusProjection(runPrefix), prefix).find((candidate) => candidate.continuationRef === continuation.continuationRef);
    const invocationTruth = projectEffectfulPublicInvocationTruthAtPrefix(prefix, basis.invocationRef);
    if (invocationTruth.disposition !== "available")
        return invocationTruth;
    if (reconstructedContinuation === undefined ||
        sha256Canonical(reconstructedContinuation) !==
            sha256Canonical(continuation)) {
        throw new TypeError("continuation public operation requires the exact current durable continuation lifecycle");
    }
    const continuationRef = reconstructedContinuation.continuationRef;
    const grant = resolveContinuationPublicOperationGrant({
        rootInvocation,
        continuation: reconstructedContinuation,
        operation,
        variant,
        actorRef,
        capabilityRef,
        basis,
    });
    if (grant === null ||
        !hasAdmittedInvocationAtPrefix(prefix, rootInvocation)) {
        throw new TypeError("continuation public operation requires the exact admitted run authority");
    }
    const candidate = {
        kind: "public_operation_admitted",
        eventTime: basis.eventTime,
        aggregateType: "workspace",
        aggregateId: rootInvocation.workspaceBindingId,
        parentAggregateId: basis.invocationRef,
        causationEventRefs: basis.causationEventRefs,
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: rootInvocation.authorityRef,
        payload: {
            operationId: operation,
            continuationRef,
            memberKey: basis.memberKey,
            definitionDigest: basis.definitionDigest,
            variant,
            invocationRef: basis.invocationRef,
            invocationPayloadDigest: basis.invocationPayloadDigest,
            invocationDigest: basis.invocationDigest,
            actorRef,
            authorityRef: rootInvocation.authorityRef,
            authorityDigest: rootInvocation.authorityDigest,
            capabilityGrantRefs: [grant.grantRef],
            capabilityRef,
            policyRef: rootInvocation.policyRef,
            policyDigest: rootInvocation.policyDigest,
            workspaceBindingId: rootInvocation.workspaceBindingId,
            workspaceBindingDigest: rootInvocation.workspaceBindingDigest,
            catalogBasisRef: rootInvocation.catalogBasisRef,
            catalogBasisDigest: rootInvocation.catalogBasisDigest,
            catalogViewId: rootInvocation.catalogViewId,
            catalogViewDigest: rootInvocation.catalogViewDigest,
            programRef: rootInvocation.programRef,
            programDigest: rootInvocation.programDigest,
            graphFunctionRef: rootInvocation.graphFunctionRef,
            graphFunctionDigest: rootInvocation.graphFunctionDigest,
        },
    };
    const event = projectRuntimeEventFromValidatedHistory(events, candidate);
    const projectedPrefix = selectValidatedRuntimeEventPrefix(Object.freeze([...events, event]));
    const admitted = deepFreeze({
        kind: "continuation_public_operation_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        operationId: operation,
        continuationRef,
        invocationRef: basis.invocationRef,
        actorRef,
        capabilityRef,
        capabilityGrantRef: grant.grantRef,
        admissionEventRef: event.eventId,
    });
    return deepFreeze({
        kind: "prepared_continuation_public_operation",
        schemaVersion: "5.0.0",
        operation: admitted,
        event,
        projectedPrefix,
    });
}
export function resolveContinuationPublicOperationGrant(input) {
    const invalidBasis = validatePublicOperationBasis(input.basis, input.operation, input.variant);
    const requiredStatus = input.operation === "abg.operation.interaction.respond"
        ? "open"
        : "responded";
    const validVariant = input.operation === "abg.operation.interaction.respond"
        ? input.variant === "select" || input.variant === "approve" ||
            input.variant === "reject" || input.variant === "assess" ||
            input.variant === "answer_escalation"
        : input.variant === "current_intent" ||
            input.variant === "selected_action";
    const grant = input.rootInvocation.capabilityGrants.find((candidate) => isCapabilityGrantValue(candidate) &&
        candidate.grantRef !== "" &&
        candidate.actorRef === input.actorRef &&
        candidate.operationId === input.operation &&
        candidate.capabilityRef === input.capabilityRef);
    if (invalidBasis !== null ||
        input.continuation.continuationRef.length === 0 ||
        input.continuation.status !== requiredStatus ||
        input.basis.authorityScopeRef !==
            input.rootInvocation.workspaceBindingId ||
        input.basis.authorityScopeDigest !==
            input.rootInvocation.workspaceBindingDigest ||
        input.actorRef !== input.rootInvocation.actorRef ||
        grant === undefined ||
        !input.rootInvocation.capabilityGrantRefs.includes(grant.grantRef) ||
        !validVariant) {
        return null;
    }
    return grant;
}
export function admitFhInteractionOpen(store, executionBasis, scope, program, graph, interactionSet, cursor, pending, route, productBasis, inputValue, basis) {
    const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
    const cCall = pending.cCall;
    const constructionIntent = rehydrateConstructionIntentForCursorAtPrefix(prefix, cursor);
    const requiresConstructionIntent = isAdmittedConstructionInteractionLocus(executionBasis, cCall.programLocusRef, cCall.compositionRef);
    if (!hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
        !hasOpenedTraversalScopeAtPrefix(prefix, scope) ||
        !hasAdmittedInteractionSetAtPrefix(prefix, interactionSet) ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
        !isAdmittedCCallResult(pending.result) ||
        !isAdmittedCCallJudgment(pending.judgment) ||
        !isAdmittedRoute(selectRuntimeEventPrefixFromAuthority(prefix, { runId: scope.runId }), route, prefix) ||
        !hasAdmittedProductInstall(productBasis.artifactTruth, productBasis.install) ||
        !hasAdmittedWorkspaceBinding(productBasis.artifactTruth, productBasis.workspaceBinding) ||
        productBasis.catalogView.kind !== "graph_function_catalog_view" ||
        cCall.regime !== "F_H" ||
        cCall.actorCapabilityRef === null ||
        cCall.responseContractRef === null ||
        route.routeKind !== "hold" ||
        route.cCallRef !== cCall.cCallRef ||
        route.judgmentRef !== pending.judgment.judgmentRef ||
        route.sourceCursorRef !== cursor.cursorRef ||
        executionBasis.basisRef !== cCall.basisId ||
        scope.scopeRef !== cursor.traversalScopeRef ||
        graph.materializationRef !== executionBasis.graphRef ||
        program.programRef !== executionBasis.programRef ||
        sha256Canonical(inputValue) !== cursor.inputDigest ||
        productBasis.workspaceBinding.bindingId !== executionBasis.workspaceBindingId ||
        productBasis.workspaceBinding.bindingDigest !==
            executionBasis.workspaceBindingDigest ||
        graphFunctionCatalogViewRef(productBasis.catalogView) !== executionBasis.catalogViewId ||
        productBasis.catalogView.viewDigest !== executionBasis.catalogViewDigest ||
        productBasis.programValidation.validationRef !==
            executionBasis.programValidationRef ||
        productBasis.graphValidation.validationRef !==
            executionBasis.graphValidationRef ||
        (requiresConstructionIntent &&
            (constructionIntent === null ||
                constructionIntent.executionBasisRef !== executionBasis.basisRef ||
                constructionIntent.executionBasisDigest !== executionBasis.basisDigest ||
                constructionIntent.programRef !== executionBasis.programRef ||
                constructionIntent.graphFunctionRef !== executionBasis.graphFunctionRef ||
                constructionIntent.workspaceBindingId !==
                    executionBasis.workspaceBindingId ||
                constructionIntent.workspaceBindingDigest !==
                    executionBasis.workspaceBindingDigest ||
                constructionIntent.runId !== scope.runId ||
                constructionIntent.graphCallId !== scope.graphCallId ||
                constructionIntent.frameId !== scope.frameId ||
                constructionIntent.targetCursorRef !== cursor.cursorRef ||
                constructionIntent.targetCursorDigest !== cursor.cursorDigest ||
                constructionIntent.targetProgramLocusRef !== cCall.programLocusRef))) {
        throw new TypeError("F_H continuation requires one exact admitted pending interaction basis");
    }
    const identity = {
        continuationKind: "fh_interaction",
        runId: scope.runId,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        cCallRef: cCall.cCallRef,
        heldCursorRef: cursor.cursorRef,
        heldCursorDigest: cursor.cursorDigest,
        requestRef: pending.requestRef,
        requestDigest: pending.requestDigest,
        actorCapabilityRef: cCall.actorCapabilityRef,
        responseContractRef: cCall.responseContractRef,
        executionBasisRef: executionBasis.basisRef,
        constructionIntentRef: constructionIntent?.constructionIntentRef ?? null,
    };
    const continuationDigest = sha256Canonical(identity);
    const continuationRef = `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`;
    const event = admitRuntimeEvent(store, {
        kind: "fh_interaction_opened",
        eventTime: basis.eventTime,
        aggregateType: "continuation",
        aggregateId: continuationRef,
        parentAggregateId: scope.frameId,
        causationEventRefs: [
            route.admissionEventRef,
            ...(constructionIntent === null
                ? []
                : [constructionIntent.admissionEventRef]),
            ...basis.causationEventRefs,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: executionBasis.basisRef,
        runId: scope.runId,
        graphFunctionRef: executionBasis.graphFunctionRef,
        materializationRef: graph.materializationRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        payload: {
            continuationRef,
            continuationDigest,
            continuationKind: "fh_interaction",
            causedByEventRef: pending.judgment.admissionEventRef,
            holdRouteRef: route.routeRef,
            cCallRef: cCall.cCallRef,
            requestContractRef: cCall.inputContractRef,
            requestRef: pending.requestRef,
            requestDigest: pending.requestDigest,
            responseContractRef: cCall.responseContractRef,
            actorCapabilityRef: cCall.actorCapabilityRef,
            heldCursorRef: cursor.cursorRef,
            heldCursorDigest: cursor.cursorDigest,
            inputRef: cursor.inputRef,
            inputDigest: cursor.inputDigest,
            inputValue,
            implementationSetRef: executionBasis.implementationSetRef,
            implementationSetDigest: executionBasis.implementationSetDigest,
            interactionSetRef: interactionSet.interactionSetRef,
            interactionSetDigest: interactionSet.interactionSetDigest,
            executionBasisRef: executionBasis.basisRef,
            executionBasisDigest: executionBasis.basisDigest,
            scopeRef: scope.scopeRef,
            scopeDigest: scope.scopeDigest,
            programRef: program.programRef,
            programDigest: executionBasis.programDigest,
            graphFunctionRef: executionBasis.graphFunctionRef,
            graphFunctionDigest: executionBasis.graphFunctionDigest,
            graphRef: graph.materializationRef,
            graphDigest: graph.materializationDigest,
            programValidationRef: productBasis.programValidation.validationRef,
            graphValidationRef: productBasis.graphValidation.validationRef,
            openedTraversalScope: scope,
            heldCursor: cursor,
            cCall: cCall,
            pendingResult: pending.result,
            pendingJudgment: pending.judgment,
            productId: productBasis.install.productId,
            productContentDigest: productBasis.install.productContentDigest,
            manifestDigest: productBasis.install.manifestDigest,
            installId: productBasis.install.installId,
            workspaceBindingId: productBasis.workspaceBinding.bindingId,
            workspaceBindingDigest: productBasis.workspaceBinding.bindingDigest,
            catalogViewId: graphFunctionCatalogViewRef(productBasis.catalogView),
            catalogViewDigest: productBasis.catalogView.viewDigest,
            ...(constructionIntent === null
                ? {}
                : {
                    constructionIntentRef: constructionIntent.constructionIntentRef,
                    constructionIntentDigest: constructionIntent.constructionIntentDigest,
                }),
        },
    });
    return deepFreeze({
        kind: "fh_interaction_continuation",
        schemaVersion: "5.0.0",
        disposition: "open",
        continuationRef,
        continuationDigest,
        runId: scope.runId,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        cCallRef: cCall.cCallRef,
        actorCapabilityRef: cCall.actorCapabilityRef,
        requestContractRef: cCall.inputContractRef,
        responseContractRef: cCall.responseContractRef,
        requestRef: pending.requestRef,
        requestDigest: pending.requestDigest,
        heldCursorRef: cursor.cursorRef,
        heldCursorDigest: cursor.cursorDigest,
        constructionIntentRef: constructionIntent?.constructionIntentRef ?? null,
        constructionIntentDigest: constructionIntent?.constructionIntentDigest ?? null,
        openedEventRef: event.eventId,
    });
}
/**
 * Owns the complete pending-result, hold-route, continuation-open transaction.
 * HoG supplies the selected route candidate; ABG revalidates every event owner
 * relation and commits the conjunction at one exact durable predecessor.
 */
export function admitFhInteractionHold(input) {
    const predecessorEvents = readHeldRuntimeEventsAtDurablePrefix(input.store, input.predecessorPrefix);
    const cCall = input.pendingPlan.pending.cCall;
    const evidence = input.routeCandidate.transitionClass === "route"
        ? input.routeCandidate.evidence
        : null;
    if (input.pendingPlan.expectedPrefixDigest !==
        runtimeEventPrefixDigest(selectValidatedRuntimeEventPrefix(predecessorEvents)) ||
        evidence?.evidenceClass !== "hold" ||
        evidence.cCall.cCallRef !== cCall.cCallRef ||
        sha256Canonical(evidence.result) !==
            sha256Canonical(input.pendingPlan.pending.result) ||
        sha256Canonical(evidence.judgment) !==
            sha256Canonical(input.pendingPlan.pending.judgment)) {
        throw new TypeError("F_H hold candidate differs from its exact pending interaction plan");
    }
    assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(input.store, input.predecessorPrefix, () => {
        const pending = admitPlannedPendingInteraction(input.store, input.graph, input.graphFunction, input.cursor, cCall, input.request, input.expectedInputDigest, input.pendingPlan, input.pendingBasis);
        const stagedPrefix = selectValidatedRuntimeEventPrefix(input.store.readAll());
        const routeCandidate = input.selectRouteCandidate?.(replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(input.store.readAll(), { runId: input.cursor.runId }), stagedPrefix)) ?? input.routeCandidate;
        if (routeCandidate.transitionClass !== "route" ||
            sha256Canonical(routeCandidate.evidence) !==
                sha256Canonical(input.routeCandidate.evidence)) {
            throw new TypeError("F_H staged selection changed its planned owner evidence");
        }
        const transition = admitTraversalTransitionInActiveTransaction({
            durablePredecessorPrefix: input.predecessorPrefix,
            stagedPrefix,
            store: input.store,
            executionBasis: input.executionBasis,
            graph: input.graph,
            graphFunction: input.graphFunction,
            source: input.cursor,
            target: null,
            candidate: routeCandidate,
            basis: input.routeBasis,
        });
        if (transition.kind !== "staged_route_transition_admission") {
            throw new TypeError(`F_H hold route refused: ${transition.code}`);
        }
        const continuation = admitFhInteractionOpen(input.store, input.executionBasis, input.scope, input.program, input.graph, input.interactionSet, input.cursor, pending, transition.route, input.productBasis, input.inputValue, input.continuationBasis);
        return deepFreeze({
            kind: "fh_interaction_hold_admission",
            schemaVersion: "5.0.0",
            pending,
            route: transition.route,
            continuation,
        });
    });
    return deepFreeze({
        ...committed.value,
        successorPrefix: committed.successorPrefix,
    });
}
function admitFhInteractionResponse(store, continuation, operation, responseContractRef, responseValue, basis) {
    const continuationRef = continuation.continuationRef;
    const operationCoordinate = resolveCurrentContinuationOperationCoordinate(store, continuationRef, operation, {
        eventRef: continuation.openedEventRef,
        kind: "fh_interaction_opened",
    });
    const publicEvent = operationCoordinate?.event;
    const publicPayload = operationCoordinate?.payload ?? null;
    if (continuation.status !== "open" ||
        operation.operationId !== "abg.operation.interaction.respond" ||
        operation.capabilityRef !== continuation.actorCapabilityRef ||
        responseContractRef !== continuation.responseContractRef ||
        (continuation.constructionIntentRef !== null &&
            responseValue.constructionIntentRef !==
                continuation.constructionIntentRef) ||
        publicEvent?.kind !== "public_operation_admitted" ||
        publicPayload?.capabilityRef !== operation.capabilityRef ||
        !Array.isArray(publicPayload.capabilityGrantRefs) ||
        publicPayload.capabilityGrantRefs[0] !== operation.capabilityGrantRef ||
        basis.eventTime !== publicEvent.eventTime ||
        basis.correlationId !== publicEvent.correlationId) {
        throw new TypeError("F_H response requires one exact open continuation and admitted response operation");
    }
    const responseDigest = sha256Canonical(responseValue);
    const responseRef = `interaction-response://abiogenesis/${responseDigest.slice("sha256:".length)}`;
    const event = admitRuntimeEvent(store, {
        kind: "fh_interaction_responded",
        eventTime: basis.eventTime,
        aggregateType: "continuation",
        aggregateId: continuationRef,
        parentAggregateId: continuation.frameId,
        causationEventRefs: [
            continuation.openedEventRef,
            operation.admissionEventRef,
            ...basis.causationEventRefs,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: continuation.continuationRef,
        runId: continuation.runId,
        graphCallId: continuation.graphCallId,
        frameId: continuation.frameId,
        payload: {
            continuationRef,
            actorRef: operation.actorRef,
            capabilityRef: operation.capabilityRef,
            responseContractRef,
            responseRef,
            responseDigest,
            responseValue,
            publicOperationEventRef: operation.admissionEventRef,
        },
    });
    return deepFreeze({
        kind: "fh_interaction_response_admission",
        schemaVersion: "5.0.0",
        disposition: "responded",
        continuationRef,
        actorRef: operation.actorRef,
        capabilityRef: operation.capabilityRef,
        responseContractRef,
        responseRef,
        responseDigest,
        responseValue,
        admissionEventRef: event.eventId,
    });
}
export function prepareFhInteractionResponse(publicOperation, continuation, responseContractRef, responseValue, basis) {
    const operation = publicOperation.operation;
    const prefix = publicOperation.projectedPrefix;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const operationCoordinate = resolvePreparedContinuationOperationCoordinateAtPrefix(prefix, continuation.continuationRef, publicOperation, {
        eventRef: continuation.openedEventRef,
        kind: "fh_interaction_opened",
    });
    if (continuation.status !== "open" ||
        operation.operationId !== "abg.operation.interaction.respond" ||
        operation.capabilityRef !== continuation.actorCapabilityRef ||
        responseContractRef !== continuation.responseContractRef ||
        (continuation.constructionIntentRef !== null &&
            responseValue.constructionIntentRef !==
                continuation.constructionIntentRef) ||
        operationCoordinate === null ||
        basis.eventTime !== operationCoordinate.event.eventTime ||
        basis.correlationId !== operationCoordinate.event.correlationId ||
        basis.causationEventRefs.length !== 0) {
        throw new TypeError("F_H response preparation requires one exact prefix-projected operation and open continuation");
    }
    const responseDigest = sha256Canonical(responseValue);
    const responseRef = `interaction-response://abiogenesis/${responseDigest.slice("sha256:".length)}`;
    const candidate = {
        kind: "fh_interaction_responded",
        eventTime: basis.eventTime,
        aggregateType: "continuation",
        aggregateId: continuation.continuationRef,
        parentAggregateId: continuation.frameId,
        causationEventRefs: [
            continuation.openedEventRef,
            operation.admissionEventRef,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: continuation.continuationRef,
        runId: continuation.runId,
        graphCallId: continuation.graphCallId,
        frameId: continuation.frameId,
        payload: {
            continuationRef: continuation.continuationRef,
            actorRef: operation.actorRef,
            capabilityRef: operation.capabilityRef,
            responseContractRef,
            responseRef,
            responseDigest,
            responseValue,
            publicOperationEventRef: operation.admissionEventRef,
        },
    };
    const event = projectRuntimeEventFromValidatedHistory(events, candidate);
    const projectedPrefix = selectValidatedRuntimeEventPrefix(Object.freeze([...events, event]));
    const response = deepFreeze({
        kind: "fh_interaction_response_admission",
        schemaVersion: "5.0.0",
        disposition: "responded",
        continuationRef: continuation.continuationRef,
        actorRef: operation.actorRef,
        capabilityRef: operation.capabilityRef,
        responseContractRef,
        responseRef,
        responseDigest,
        responseValue,
        admissionEventRef: event.eventId,
    });
    return deepFreeze({
        kind: "prepared_fh_interaction_response",
        schemaVersion: "5.0.0",
        publicOperation,
        response,
        event,
        projectedPrefix,
    });
}
export function commitFhInteractionResponseAtExpectedPrefix(store, predecessorPrefix, rootInvocation, continuation, variant, actorRef, capabilityRef, operationBasis, responseContractRef, responseValue, responseBasis) {
    const prefix = selectValidatedRuntimeEventPrefix(readHeldRuntimeEventsAtDurablePrefix(store, predecessorPrefix));
    const preparedOperation = prepareContinuationPublicOperation(prefix, rootInvocation, "abg.operation.interaction.respond", continuation, variant, actorRef, capabilityRef, operationBasis);
    if (preparedOperation.kind !== "prepared_continuation_public_operation") {
        return preparedOperation;
    }
    const prepared = prepareFhInteractionResponse(preparedOperation, continuation, responseContractRef, responseValue, responseBasis);
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
        const operationEvent = admitRuntimeEvent(store, runtimeEventCandidate(prepared.publicOperation.event));
        const responseEvent = admitRuntimeEvent(store, runtimeEventCandidate(prepared.event));
        if (sha256Canonical(operationEvent) !==
            sha256Canonical(prepared.publicOperation.event) ||
            sha256Canonical(responseEvent) !==
                sha256Canonical(prepared.event)) {
            throw new TypeError("F_H response append differs from its exact prefix plan");
        }
        return deepFreeze({
            operation: prepared.publicOperation.operation,
            response: prepared.response,
        });
    });
    return deepFreeze({
        ...committed.value,
        successorPrefix: committed.successorPrefix,
    });
}
export function deriveFhResumeSuccessorInput(store, continuation, operation, executionBasis, closureContract, successorCarrier) {
    return deriveFhResumeSuccessorInputAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), continuation, operation, executionBasis, closureContract, successorCarrier);
}
export function deriveFhResumeSuccessorInputAtPrefix(prefix, continuation, operation, executionBasis, closureContract, successorCarrier) {
    return deriveOwnerFhResumeSuccessorInputAtPrefix(prefix, continuation, operation, executionBasis, closureContract, successorCarrier);
}
export function prepareFhInteractionResume(publicOperation, continuation, executionBasis, closureContract, successorInput, successorCursor, durablePrefixDigest, basis) {
    const operation = publicOperation.operation;
    const prefix = publicOperation.projectedPrefix;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const operationCoordinate = resolvePreparedContinuationOperationCoordinateAtPrefix(prefix, continuation.continuationRef, publicOperation, {
        eventRef: continuation.respondedEventRef,
        kind: "fh_interaction_responded",
    });
    const expectedSuccessorInput = deriveFhResumeSuccessorInputAtPrefix(prefix, continuation, operation, executionBasis, closureContract, {
        inputContractRef: successorInput.inputContractRef,
        inputValueKind: successorInput.inputValueKind,
    });
    const opened = events.find((event) => event.eventId === continuation.openedEventRef);
    const heldCursorValue = opened !== undefined && isRecord(opened.payload) &&
        isRecord(opened.payload.heldCursor)
        ? opened.payload.heldCursor
        : null;
    const heldCursor = heldCursorValue !== null &&
        isTraversalCursorCandidate(heldCursorValue)
        ? heldCursorValue
        : null;
    if (continuation.status !== "responded" ||
        continuation.responseRef === null ||
        continuation.responseDigest === null ||
        !isRecord(continuation.responseValue) ||
        operation.operationId !== "abg.operation.run.continue" ||
        operation.capabilityRef !== continuation.actorCapabilityRef ||
        operationCoordinate === null ||
        basis.eventTime !== operationCoordinate.event.eventTime ||
        basis.correlationId !== operationCoordinate.event.correlationId ||
        successorInput.kind !== "fh_resume_successor_input" ||
        successorInput.disposition !== "admitted" ||
        successorInput.inputRef !== expectedSuccessorInput.inputRef ||
        successorInput.inputDigest !== expectedSuccessorInput.inputDigest ||
        successorInput.inputContractRef !==
            expectedSuccessorInput.inputContractRef ||
        successorInput.inputValueKind !== expectedSuccessorInput.inputValueKind ||
        sha256Canonical(successorInput.inputValue) !==
            expectedSuccessorInput.inputDigest ||
        !isTraversalCursorCandidate(successorCursor) ||
        successorCursor.runId !== continuation.runId ||
        successorCursor.graphCallId !== continuation.graphCallId ||
        successorCursor.frameId !== continuation.frameId ||
        successorCursor.inputRef !== successorInput.inputRef ||
        successorCursor.inputDigest !== successorInput.inputDigest ||
        heldCursor === null ||
        basis.causationEventRefs.length !== 0 ||
        !isInteractionResumeCursorSuccessorAtPrefix(prefix, heldCursor, expectedSuccessorInput, successorCursor)) {
        throw new TypeError("F_H resume preparation requires one exact prefix-projected operation, responded continuation, and successor cursor");
    }
    const candidate = {
        kind: "fh_interaction_resume_admitted",
        eventTime: basis.eventTime,
        aggregateType: "continuation",
        aggregateId: continuation.continuationRef,
        parentAggregateId: continuation.frameId,
        causationEventRefs: [
            continuation.respondedEventRef,
            operation.admissionEventRef,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: continuation.continuationRef,
        runId: continuation.runId,
        graphCallId: continuation.graphCallId,
        frameId: continuation.frameId,
        payload: {
            continuationRef: continuation.continuationRef,
            openedEventRef: continuation.openedEventRef,
            respondedEventRef: continuation.respondedEventRef,
            publicOperationEventRef: operation.admissionEventRef,
            actorRef: operation.actorRef,
            capabilityRef: operation.capabilityRef,
            closureContract: closureContract,
            durablePrefixDigest,
            responseRef: continuation.responseRef,
            responseDigest: continuation.responseDigest,
            responseValue: continuation.responseValue,
            successorInputRef: successorInput.inputRef,
            successorInputDigest: successorInput.inputDigest,
            successorInputValue: successorInput.inputValue,
            successorInputContractRef: successorInput.inputContractRef,
            successorInputValueKind: successorInput.inputValueKind,
            successorCursor: successorCursor,
            successorCursorRef: successorCursor.cursorRef,
            successorCursorDigest: successorCursor.cursorDigest,
        },
    };
    const event = projectRuntimeEventFromValidatedHistory(events, candidate);
    const projectedPrefix = selectValidatedRuntimeEventPrefix(Object.freeze([...events, event]));
    if (!validateExactFhResumeOwnerRelationAtPrefix(projectedPrefix, event)) {
        throw new TypeError("F_H resume preparation differs from the exact owner reconstruction relation");
    }
    const resume = deepFreeze({
        kind: "fh_interaction_resume_admission",
        schemaVersion: "5.0.0",
        disposition: "resolved",
        continuationRef: continuation.continuationRef,
        actorRef: operation.actorRef,
        capabilityRef: operation.capabilityRef,
        responseRef: continuation.responseRef,
        responseDigest: continuation.responseDigest,
        responseValue: continuation.responseValue,
        successorInputRef: successorInput.inputRef,
        successorInputDigest: successorInput.inputDigest,
        successorInputValue: successorInput.inputValue,
        successorInputContractRef: successorInput.inputContractRef,
        successorInputValueKind: successorInput.inputValueKind,
        successorCursorRef: successorCursor.cursorRef,
        successorCursorDigest: successorCursor.cursorDigest,
        admissionEventRef: event.eventId,
    });
    return deepFreeze({
        kind: "prepared_fh_interaction_resume",
        schemaVersion: "5.0.0",
        publicOperation,
        resume,
        event,
        projectedPrefix,
    });
}
export function commitFhInteractionResumeAtExpectedPrefix(store, predecessorPrefix, rootInvocation, continuation, variant, actorRef, capabilityRef, operationBasis, executionBasis, closureContract, successorInput, successorCursor, resumeBasis) {
    const prefix = selectValidatedRuntimeEventPrefix(readHeldRuntimeEventsAtDurablePrefix(store, predecessorPrefix));
    const preparedOperation = prepareContinuationPublicOperation(prefix, rootInvocation, "abg.operation.run.continue", continuation, variant, actorRef, capabilityRef, operationBasis);
    if (preparedOperation.kind !== "prepared_continuation_public_operation") {
        return preparedOperation;
    }
    const prepared = prepareFhInteractionResume(preparedOperation, continuation, executionBasis, closureContract, successorInput, successorCursor, predecessorPrefix.prefixDigest, resumeBasis);
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
        const operationEvent = admitRuntimeEvent(store, runtimeEventCandidate(prepared.publicOperation.event));
        const resumeEvent = admitRuntimeEvent(store, runtimeEventCandidate(prepared.event));
        if (sha256Canonical(operationEvent) !==
            sha256Canonical(prepared.publicOperation.event) ||
            sha256Canonical(resumeEvent) !==
                sha256Canonical(prepared.event)) {
            throw new TypeError("F_H resume append differs from its exact prefix plan");
        }
        return deepFreeze({
            operation: prepared.publicOperation.operation,
            resume: prepared.resume,
        });
    });
    return deepFreeze({
        ...committed.value,
        successorPrefix: committed.successorPrefix,
    });
}
