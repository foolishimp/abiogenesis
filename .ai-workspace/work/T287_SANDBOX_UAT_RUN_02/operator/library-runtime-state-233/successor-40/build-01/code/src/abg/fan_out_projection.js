import { isOptionalJsonRecord as isRecord, isNonEmptyJsonString as isNonEmptyString, hasExactJsonKeys as exactKeys } from "../shared/admission_predicates.js";
import { graphFunctionApplicationRef } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { runtimeEventPrefixDigest, validatedRuntimeEventPrefixThroughEvent, runtimeEventBodiesAtPrefix, runtimePrefixComputation, indexedRuntimeEvents, } from "./event_prefix.js";
import { constructScopedRetryFluent, runtimeFluentHoldsAtPrefix, holdsAt, } from "./event_calculus.js";
function isDigest(value) {
    return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}
function isOrdinal(value) {
    return Number.isSafeInteger(value) && Number(value) >= 0;
}
function sameStrings(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}
function uniqueEvent(events, predicate) {
    const matches = events.filter(predicate);
    return matches.length === 1 ? matches[0] : null;
}
function isCausallyReachable(events, ancestorEventRef, descendant) {
    const byRef = new Map(events.map((event) => [event.eventId, event]));
    const pending = [...descendant.causationEventRefs];
    const visited = new Set();
    while (pending.length > 0) {
        const eventRef = pending.pop();
        if (eventRef === ancestorEventRef)
            return true;
        if (visited.has(eventRef))
            continue;
        visited.add(eventRef);
        const event = byRef.get(eventRef);
        if (event !== undefined)
            pending.push(...event.causationEventRefs);
    }
    return false;
}
function exactHashedPayload(event, refKey, digestKey, refPrefix) {
    if (!isRecord(event.payload))
        return null;
    const ref = event.payload[refKey];
    const digest = event.payload[digestKey];
    if (!isNonEmptyString(ref) || !isDigest(digest))
        return null;
    const body = Object.fromEntries(Object.entries(event.payload).filter(([key]) => key !== refKey && key !== digestKey));
    return digest === sha256Canonical(body) &&
        ref === `${refPrefix}${digest.slice("sha256:".length)}`
        ? body
        : null;
}
function sameEnvelope(event, expected) {
    return event.workflowVersion === "5.0.0" &&
        event.scopeClass === "run" &&
        event.basisId === expected.basisId &&
        event.runId === expected.runId &&
        event.graphCallId === expected.graphCallId &&
        event.frameId === expected.frameId &&
        (expected.materializationRef === undefined ||
            event.materializationRef === expected.materializationRef);
}
function materializationFor(authority) {
    const { graph, application } = authority;
    if (!isMaterializedGtlGraph(graph) ||
        graph.template.applications.find((candidate) => candidate.applicationRef === application.applicationRef) !== application ||
        application.relationKind !== "fan_out" ||
        application.applicationRef !== graphFunctionApplicationRef(application))
        return null;
    const matches = graph.fanOutMaterializations.filter((candidate) => candidate.applicationRef === application.applicationRef &&
        candidate.batchRef === application.batchRef);
    const materialization = matches.length === 1 ? matches[0] : null;
    return materialization !== null &&
        materialization.inputVectorRef === application.inputVectorRef &&
        materialization.outputVectorRef === application.outputVectorRef &&
        materialization.inputMemberContractRef ===
            application.inputMemberContractRef &&
        materialization.outputMemberContractRef ===
            application.outputMemberContractRef
        ? materialization
        : null;
}
function collectFanOutWorkflowLoci(term, nodeRef, path, batchRef, enclosingTaskOrdinal, rows) {
    switch (term.kind) {
        case "c_workflow":
            if (enclosingTaskOrdinal !== null) {
                rows.push({
                    nodeRef,
                    termPath: Object.freeze([...path]),
                    term,
                    taskOrdinal: enclosingTaskOrdinal,
                });
            }
            return;
        case "c_compose":
            term.terms.forEach((child, ordinal) => collectFanOutWorkflowLoci(child, nodeRef, [...path, "terms", String(ordinal)], batchRef, enclosingTaskOrdinal, rows));
            return;
        case "c_edge":
            collectFanOutWorkflowLoci(term.transform, nodeRef, [...path, "transform"], batchRef, enclosingTaskOrdinal, rows);
            collectFanOutWorkflowLoci(term.evaluate, nodeRef, [...path, "evaluate"], batchRef, enclosingTaskOrdinal, rows);
            collectFanOutWorkflowLoci(term.consequence, nodeRef, [...path, "consequence"], batchRef, enclosingTaskOrdinal, rows);
            return;
        case "c_batch":
            term.tasks.forEach((child, ordinal) => collectFanOutWorkflowLoci(child, nodeRef, [...path, "tasks", String(ordinal)], batchRef, term.batchRef === batchRef ? ordinal : enclosingTaskOrdinal, rows));
            return;
        case "c_retry":
            collectFanOutWorkflowLoci(term.term, nodeRef, [...path, "term"], batchRef, enclosingTaskOrdinal, rows);
            return;
        case "c_identity":
        case "c_of":
            return;
    }
}
function exactDeclaredFanOutWorkflowLocus(authority, opened) {
    if (!isRecord(opened.payload) || !isOrdinal(opened.payload.taskOrdinal)) {
        return null;
    }
    const openedPayload = opened.payload;
    const taskOrdinal = openedPayload.taskOrdinal;
    const rows = [];
    for (const node of authority.graph.template.nodes) {
        collectFanOutWorkflowLoci(node.term, node.nodeRef, ["node", node.nodeRef, "c"], authority.application.batchRef, null, rows);
    }
    const matches = rows.filter((row) => {
        if (row.taskOrdinal !== taskOrdinal ||
            row.term.graphFunctionRef !==
                authority.application.elementGraphFunctionRef ||
            row.term.inputCarrierRef !==
                authority.application.inputMemberContractRef ||
            row.term.outputCarrierRef !==
                authority.application.outputMemberContractRef)
            return false;
        const locusDigest = sha256Canonical({
            graphFunctionRef: authority.graph.graphFunctionRef,
            nodeRef: row.nodeRef,
            termPath: row.termPath,
            childGraphFunctionRef: row.term.graphFunctionRef,
        });
        return openedPayload.programLocusRef ===
            `workflow-locus://abiogenesis/${locusDigest.slice("sha256:".length)}`;
    });
    return matches.length === 1 ? matches[0] : null;
}
function exactChildFoldbackBody(events, opened, fibre, foldback, boundaryOrdinal) {
    const body = exactHashedPayload(foldback, "foldbackRef", "foldbackDigest", "child-foldback://abiogenesis/");
    if (body === null ||
        body.parentCCallRef !== opened.aggregateId ||
        !isNonEmptyString(body.childExecutionBasisRef) ||
        !isDigest(body.childExecutionBasisDigest) ||
        !isNonEmptyString(body.childGraphCallId) ||
        !isNonEmptyString(body.childFrameId) ||
        !["blocked", "closed", "failed"].includes(String(body.childDisposition)) ||
        !isNonEmptyString(body.childResultRef) ||
        !isDigest(body.childResultDigest) ||
        !isNonEmptyString(body.childJudgmentRef) ||
        !isDigest(body.outputDigest) ||
        !isNonEmptyString(body.childTerminalEventRef) ||
        foldback.causationEventRefs[1] !== fibre.eventId)
        return null;
    const prior = events.filter((event) => event.admissionOrdinal < foldback.admissionOrdinal &&
        event.admissionOrdinal < boundaryOrdinal);
    const childBasis = uniqueEvent(prior, (event) => event.kind === "basis_admitted" &&
        isRecord(event.payload) &&
        event.payload.basisRef === body.childExecutionBasisRef &&
        event.payload.basisDigest === body.childExecutionBasisDigest);
    const childResult = uniqueEvent(prior, (event) => event.kind === "c_call_result_admitted" &&
        event.runId === opened.runId &&
        event.graphCallId === body.childGraphCallId &&
        event.frameId === body.childFrameId &&
        isRecord(event.payload) &&
        event.payload.resultRef === body.childResultRef &&
        event.payload.resultDigest === body.childResultDigest);
    const childJudgment = uniqueEvent(prior, (event) => event.kind === "c_call_judged" &&
        event.runId === opened.runId &&
        event.graphCallId === body.childGraphCallId &&
        event.frameId === body.childFrameId &&
        isRecord(event.payload) &&
        event.payload.judgmentRef === body.childJudgmentRef &&
        event.payload.resultRef === body.childResultRef);
    if (childBasis === null || childResult === null || childJudgment === null ||
        childResult.aggregateType !== "c_call" ||
        childJudgment.aggregateType !== "c_call" ||
        childResult.aggregateId !== childJudgment.aggregateId ||
        childResult.parentAggregateId !== body.childFrameId ||
        childJudgment.parentAggregateId !== body.childFrameId ||
        childResult.basisId !== body.childExecutionBasisRef ||
        childJudgment.basisId !== body.childExecutionBasisRef ||
        childJudgment.causationEventRefs[0] !== childResult.eventId)
        return null;
    const childResultBody = exactHashedPayload(childResult, "resultRef", "resultDigest", "result://abiogenesis/");
    const childJudgmentBody = exactHashedPayload(childJudgment, "judgmentRef", "judgmentDigest", "judgment://abiogenesis/");
    if (childResultBody === null || childJudgmentBody === null ||
        childResultBody.cCallRef !== childResult.aggregateId ||
        childResultBody.valueDigest !== body.outputDigest ||
        childJudgmentBody.cCallRef !== childResult.aggregateId ||
        childJudgmentBody.resultRef !== body.childResultRef ||
        childJudgmentBody.resultDigest !== body.childResultDigest ||
        childJudgmentBody.reasonRef !== body.childReasonRef)
        return null;
    const expectedRouteKind = body.childDisposition === "closed"
        ? "terminal"
        : body.childDisposition;
    const childRoute = uniqueEvent(prior, (event) => event.kind === "traversal_route_admitted" &&
        event.runId === opened.runId &&
        event.graphCallId === body.childGraphCallId &&
        event.frameId === body.childFrameId &&
        isRecord(event.payload) &&
        event.payload.routeKind === expectedRouteKind &&
        event.payload.cCallRef === childResult.aggregateId &&
        event.payload.judgmentRef === body.childJudgmentRef);
    const childRoutePayload = childRoute === null || !isRecord(childRoute.payload)
        ? null
        : childRoute.payload;
    if (childRoute === null || childRoutePayload === null ||
        childRoute.aggregateType !== "frame" ||
        childRoute.aggregateId !== body.childFrameId ||
        childRoute.parentAggregateId !== body.childGraphCallId ||
        childRoute.basisId !== body.childExecutionBasisRef ||
        !isCausallyReachable(prior, childJudgment.eventId, childRoute) ||
        exactHashedPayload(childRoute, "routeRef", "routeDigest", "traversal-route://abiogenesis/") === null)
        return null;
    let childTerminal = childRoute;
    if (body.childDisposition === "closed") {
        const terminalReached = uniqueEvent(prior, (event) => event.kind === "terminal_reached" &&
            event.runId === opened.runId &&
            event.graphCallId === body.childGraphCallId &&
            event.frameId === body.childFrameId &&
            event.causationEventRefs[0] === childRoute.eventId &&
            isRecord(event.payload) &&
            event.payload.closureRef === body.childClosureRef &&
            event.payload.cCallRef === childResult.aggregateId &&
            event.payload.resultRef === body.childResultRef &&
            event.payload.judgmentRef === body.childJudgmentRef &&
            event.payload.routeRef === childRoutePayload.routeRef);
        const frameClosed = terminalReached === null
            ? null
            : uniqueEvent(prior, (event) => event.kind === "frame_closed" &&
                event.runId === opened.runId &&
                event.graphCallId === body.childGraphCallId &&
                event.frameId === body.childFrameId &&
                event.causationEventRefs[0] === terminalReached.eventId);
        const graphCallClosed = frameClosed === null
            ? null
            : uniqueEvent(prior, (event) => event.kind === "graph_call_closed" &&
                event.runId === opened.runId &&
                event.graphCallId === body.childGraphCallId &&
                event.causationEventRefs[0] === frameClosed.eventId);
        if (terminalReached === null || frameClosed === null ||
            graphCallClosed === null || body.childClosureRef === null)
            return null;
        childTerminal = graphCallClosed;
    }
    else if (body.childClosureRef !== null) {
        return null;
    }
    return childTerminal.eventId === body.childTerminalEventRef &&
        foldback.causationEventRefs[0] === childTerminal.eventId
        ? body
        : null;
}
function exactTaskTruth(events, opened, boundaryOrdinal, authority, batchRef) {
    if (opened.kind !== "c_call_opened" ||
        opened.admissionOrdinal >= boundaryOrdinal ||
        opened.aggregateType !== "c_call" ||
        opened.parentAggregateId !== opened.frameId ||
        !isRecord(opened.payload) ||
        opened.payload.callClass !== "workflow" ||
        opened.payload.batchRef !== batchRef ||
        opened.payload.cCallRef !== opened.aggregateId ||
        !isNonEmptyString(opened.payload.cCallRef) ||
        !isDigest(opened.payload.cCallDigest) ||
        !isOrdinal(opened.payload.taskOrdinal) ||
        !isNonEmptyString(opened.payload.childGraphFunctionRef) ||
        !isNonEmptyString(opened.payload.failureContractRef) ||
        !isNonEmptyString(opened.payload.basisId) ||
        !isNonEmptyString(opened.payload.graphCallId) ||
        !isNonEmptyString(opened.payload.frameId) ||
        !isNonEmptyString(opened.payload.programLocusRef) ||
        !Number.isSafeInteger(opened.payload.vectorIndex) ||
        !Number.isSafeInteger(opened.payload.attempt) ||
        !Array.isArray(opened.payload.retryPath) ||
        !opened.payload.retryPath.every((value) => Number.isSafeInteger(value) && Number(value) > 0))
        return null;
    const cCallIdentity = {
        basisId: opened.payload.basisId,
        graphCallId: opened.payload.graphCallId,
        frameId: opened.payload.frameId,
        vectorIndex: opened.payload.vectorIndex,
        stageRole: opened.payload.stageRole,
        taskOrdinal: opened.payload.taskOrdinal,
        attempt: opened.payload.attempt,
        programLocusRef: opened.payload.programLocusRef,
        retryPath: opened.payload.retryPath,
        childGraphFunctionRef: opened.payload.childGraphFunctionRef,
        failureContractRef: opened.payload.failureContractRef,
    };
    const cCallDigest = sha256Canonical(cCallIdentity);
    if (opened.payload.cCallDigest !== cCallDigest ||
        opened.aggregateId !== `c-call:${cCallDigest}` ||
        opened.payload.graphCallId !== opened.graphCallId ||
        opened.payload.frameId !== opened.frameId ||
        opened.payload.basisId !== opened.basisId ||
        (authority !== null &&
            (!sameEnvelope(opened, {
                ...authority,
                materializationRef: authority.graph.materializationRef,
            }) ||
                opened.graphFunctionRef !== authority.graph.graphFunctionRef ||
                opened.payload.childGraphFunctionRef !==
                    authority.application.elementGraphFunctionRef ||
                exactDeclaredFanOutWorkflowLocus(authority, opened) === null)))
        return null;
    const cCallRows = events.filter((event) => event.aggregateType === "c_call" &&
        event.aggregateId === opened.aggregateId &&
        event.admissionOrdinal < boundaryOrdinal);
    const fibre = uniqueEvent(cCallRows, (event) => event.kind === "c_call_fibre_selected");
    const result = uniqueEvent(cCallRows, (event) => event.kind === "c_call_result_admitted");
    const judgment = uniqueEvent(cCallRows, (event) => event.kind === "c_call_judged");
    const evidenceRows = cCallRows.filter((event) => event.kind === "c_call_evidenced");
    const evidence = evidenceRows.length === 1 ? evidenceRows[0] : null;
    const foldback = uniqueEvent(events, (event) => event.kind === "child_foldback_admitted" &&
        event.admissionOrdinal < boundaryOrdinal &&
        event.frameId === opened.frameId &&
        isRecord(event.payload) &&
        event.payload.parentCCallRef === opened.aggregateId);
    if (fibre === null || result === null || judgment === null ||
        evidence === null || foldback === null ||
        !isRecord(fibre.payload) ||
        fibre.payload.cCallRef !== opened.aggregateId ||
        fibre.payload.callClass !== "workflow" ||
        fibre.payload.childGraphFunctionRef !== opened.payload.childGraphFunctionRef ||
        fibre.parentAggregateId !== opened.frameId ||
        !sameEnvelope(fibre, {
            basisId: opened.basisId,
            runId: opened.runId,
            graphCallId: opened.graphCallId,
            frameId: opened.frameId,
            materializationRef: opened.materializationRef,
        }) ||
        fibre.causationEventRefs[0] !== opened.eventId ||
        !(opened.admissionOrdinal < fibre.admissionOrdinal &&
            fibre.admissionOrdinal < foldback.admissionOrdinal &&
            foldback.admissionOrdinal < evidence.admissionOrdinal &&
            evidence.admissionOrdinal < result.admissionOrdinal &&
            result.admissionOrdinal < judgment.admissionOrdinal))
        return null;
    const foldbackBody = exactChildFoldbackBody(events, opened, fibre, foldback, boundaryOrdinal);
    const evidenceBody = exactHashedPayload(evidence, "evidenceRef", "evidenceDigest", "evidence://abiogenesis/");
    const resultBody = exactHashedPayload(result, "resultRef", "resultDigest", "result://abiogenesis/");
    const judgmentBody = exactHashedPayload(judgment, "judgmentRef", "judgmentDigest", "judgment://abiogenesis/");
    if (foldbackBody === null || evidenceBody === null ||
        resultBody === null || judgmentBody === null ||
        !isRecord(foldback.payload) || !isRecord(evidence.payload) ||
        !isRecord(result.payload) || !isRecord(judgment.payload) ||
        foldback.aggregateType !== "frame" ||
        foldback.aggregateId !== opened.frameId ||
        foldback.parentAggregateId !== opened.graphCallId ||
        !sameEnvelope(foldback, {
            basisId: opened.basisId,
            runId: opened.runId,
            graphCallId: opened.graphCallId,
            frameId: opened.frameId,
        }) ||
        foldbackBody.parentCCallRef !== opened.aggregateId ||
        !isNonEmptyString(foldbackBody.childResultRef) ||
        !isDigest(foldbackBody.childResultDigest) ||
        !isNonEmptyString(foldbackBody.childJudgmentRef) ||
        !isDigest(foldbackBody.outputDigest) ||
        !["blocked", "closed", "failed"].includes(String(foldbackBody.childDisposition)) ||
        evidenceBody.cCallRef !== opened.aggregateId ||
        evidenceBody.evidenceClass !== "sub_traversal" ||
        evidenceBody.foldbackRef !== foldback.payload.foldbackRef ||
        evidenceBody.foldbackDigest !== foldback.payload.foldbackDigest ||
        evidenceBody.foldbackEventRef !== foldback.eventId ||
        evidenceBody.childExecutionBasisRef !==
            foldbackBody.childExecutionBasisRef ||
        evidenceBody.childExecutionBasisDigest !==
            foldbackBody.childExecutionBasisDigest ||
        evidenceBody.childGraphCallId !== foldbackBody.childGraphCallId ||
        evidenceBody.childFrameId !== foldbackBody.childFrameId ||
        evidenceBody.childDisposition !== foldbackBody.childDisposition ||
        evidenceBody.childResultRef !== foldbackBody.childResultRef ||
        evidenceBody.childResultDigest !== foldbackBody.childResultDigest ||
        evidenceBody.childOutputDigest !== foldbackBody.outputDigest ||
        evidenceBody.childJudgmentRef !== foldbackBody.childJudgmentRef ||
        evidenceBody.childClosureRef !== foldbackBody.childClosureRef ||
        evidenceBody.childReasonRef !== foldbackBody.childReasonRef ||
        evidenceBody.childTerminalEventRef !== foldbackBody.childTerminalEventRef ||
        evidence.aggregateType !== "c_call" ||
        evidence.aggregateId !== opened.aggregateId ||
        evidence.parentAggregateId !== opened.frameId ||
        !sameEnvelope(evidence, {
            basisId: opened.basisId,
            runId: opened.runId,
            graphCallId: opened.graphCallId,
            frameId: opened.frameId,
        }) ||
        evidence.causationEventRefs[0] !== fibre.eventId ||
        evidence.causationEventRefs[1] !== foldback.eventId ||
        resultBody.cCallRef !== opened.aggregateId ||
        !isNonEmptyString(resultBody.resultClass) ||
        !isNonEmptyString(resultBody.contractRef) ||
        !isDigest(resultBody.valueDigest) ||
        !isRecord(resultBody.value) ||
        sha256Canonical(resultBody.value) !== resultBody.valueDigest ||
        !Array.isArray(resultBody.evidenceRefs) ||
        !sameStrings(resultBody.evidenceRefs.filter((value) => typeof value === "string"), [String(evidence.payload.evidenceRef)]) ||
        result.aggregateType !== "c_call" ||
        result.aggregateId !== opened.aggregateId ||
        result.parentAggregateId !== opened.frameId ||
        !sameEnvelope(result, {
            basisId: opened.basisId,
            runId: opened.runId,
            graphCallId: opened.graphCallId,
            frameId: opened.frameId,
        }) ||
        result.causationEventRefs[0] !== evidence.eventId ||
        judgmentBody.cCallRef !== opened.aggregateId ||
        judgmentBody.resultRef !== result.payload.resultRef ||
        judgmentBody.resultDigest !== result.payload.resultDigest ||
        !isNonEmptyString(judgmentBody.judgment) ||
        judgment.aggregateType !== "c_call" ||
        judgment.aggregateId !== opened.aggregateId ||
        judgment.parentAggregateId !== opened.frameId ||
        !sameEnvelope(judgment, {
            basisId: opened.basisId,
            runId: opened.runId,
            graphCallId: opened.graphCallId,
            frameId: opened.frameId,
        }) ||
        judgment.causationEventRefs[0] !== result.eventId)
        return null;
    return {
        ordinal: opened.payload.taskOrdinal,
        cCallRef: opened.aggregateId,
        retryPath: Object.freeze(opened.payload.retryPath.map(Number)),
        opened,
        foldback,
        evidence,
        result,
        judgment,
        resultRef: result.payload.resultRef,
        resultDigest: result.payload.resultDigest,
        resultClass: resultBody.resultClass,
        resultContractRef: resultBody.contractRef,
        resultValue: resultBody.value,
        resultValueDigest: resultBody.valueDigest,
        judgmentRef: judgment.payload.judgmentRef,
        judgmentDisposition: judgmentBody.judgment,
        foldbackRef: foldback.payload.foldbackRef,
        retryAttemptRef: typeof judgmentBody.retryAttemptRef === "string"
            ? judgmentBody.retryAttemptRef
            : null,
    };
}
function exactTaskCensus(prefix, boundaryOrdinal, envelope, batchRef, authority) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    if (Number.isFinite(boundaryOrdinal) && !events.some(event => event.admissionOrdinal === boundaryOrdinal - 1))
        return null;
    const openedRows = indexedRuntimeEvents(prefix, "graph-call:" + envelope.graphCallId).filter((event) => event.kind === "c_call_opened" &&
        event.admissionOrdinal < boundaryOrdinal &&
        event.runId === envelope.runId &&
        event.graphCallId === envelope.graphCallId &&
        event.frameId === envelope.frameId &&
        isRecord(event.payload) &&
        event.payload.callClass === "workflow" &&
        event.payload.batchRef === batchRef);
    if (openedRows.length === 0 ||
        new Set(openedRows.map((event) => event.aggregateId)).size !==
            openedRows.length)
        return null;
    const truths = openedRows.map((opened) => exactTaskTruth(events, opened, boundaryOrdinal, authority, batchRef));
    if (truths.some((truth) => truth === null))
        return null;
    const current = truths.filter((truth) => {
        if (truth.retryPath.length === 0)
            return truth.retryAttemptRef === null;
        if (truth.retryAttemptRef === null)
            return false;
        const attemptRows = indexedRuntimeEvents(prefix, "graph-call:" + envelope.graphCallId).filter((event) => event.kind === "retry_attempt_opened" &&
            event.runId === envelope.runId &&
            event.graphCallId === envelope.graphCallId &&
            event.frameId === envelope.frameId &&
            isRecord(event.payload) &&
            event.payload.attemptRef === truth.retryAttemptRef &&
            isNonEmptyString(event.payload.retryBoundaryRef));
        if (attemptRows.length !== 1)
            return false;
        const attemptPayload = attemptRows[0].payload;
        if (!isRecord(attemptPayload) ||
            !isNonEmptyString(attemptPayload.retryBoundaryRef))
            return false;
        return runtimeFluentHoldsAtPrefix(prefix, constructScopedRetryFluent("retry_attempt_active", {
            runId: envelope.runId,
            graphCallId: envelope.graphCallId,
            frameId: envelope.frameId,
            retryBoundaryRef: attemptPayload.retryBoundaryRef,
            authorityRef: truth.retryAttemptRef,
        }), Number.isFinite(boundaryOrdinal) ? boundaryOrdinal - 1 : undefined);
    });
    const historicalByOrdinal = new Map();
    for (const truth of truths) {
        const rows = historicalByOrdinal.get(truth.ordinal) ?? [];
        rows.push(truth);
        historicalByOrdinal.set(truth.ordinal, rows);
    }
    if (current.some((truth) => (historicalByOrdinal.get(truth.ordinal) ?? []).some((prior) => prior !== truth && prior.retryAttemptRef === truth.retryAttemptRef)) ||
        new Set(current.map((truth) => truth.ordinal)).size !== current.length)
        return null;
    const ordered = current.sort((left, right) => left.ordinal - right.ordinal);
    return ordered.every((truth, ordinal) => truth.ordinal === ordinal)
        ? Object.freeze(ordered)
        : null;
}
function completedRow(truth, member, outputMemberContractRef) {
    if (truth.ordinal !== member.ordinal ||
        truth.resultClass !== "success" ||
        truth.resultContractRef !== outputMemberContractRef ||
        truth.judgmentDisposition !== "advance")
        return null;
    const outputMemberDigest = sha256Canonical({
        applicationInputMemberRef: member.memberRef,
        ordinal: member.ordinal,
        resultRef: truth.resultRef,
        resultDigest: truth.resultDigest,
        value: truth.resultValue,
    });
    return {
        ordinal: member.ordinal,
        inputMemberRef: member.memberRef,
        inputMemberDigest: member.memberDigest,
        cCallRef: truth.cCallRef,
        foldbackRef: truth.foldbackRef,
        foldbackEventRef: truth.foldback.eventId,
        resultRef: truth.resultRef,
        resultDigest: truth.resultDigest,
        judgmentRef: truth.judgmentRef,
        outputMemberRef: `fan-out-output-member://abiogenesis/${outputMemberDigest.slice("sha256:".length)}`,
        outputMemberDigest,
        value: truth.resultValue,
    };
}
function completedRowFromPayload(value, truth) {
    if (!isRecord(value) || !exactKeys(value, [
        "cCallRef",
        "foldbackEventRef",
        "foldbackRef",
        "inputMemberDigest",
        "inputMemberRef",
        "judgmentRef",
        "ordinal",
        "outputMemberDigest",
        "outputMemberRef",
        "resultDigest",
        "resultRef",
        "value",
    ]) || !isOrdinal(value.ordinal) || !isNonEmptyString(value.inputMemberRef) ||
        !isDigest(value.inputMemberDigest) || !isRecord(value.value))
        return null;
    const member = {
        ordinal: value.ordinal,
        memberRef: value.inputMemberRef,
        memberDigest: value.inputMemberDigest,
    };
    const expected = completedRow(truth, member, truth.resultContractRef);
    return expected !== null &&
        sha256Canonical(expected) ===
            sha256Canonical(value)
        ? expected
        : null;
}
function stoppingRow(truth, member) {
    return truth.ordinal === member.ordinal &&
        truth.judgmentDisposition === "blocked"
        ? {
            ordinal: member.ordinal,
            inputMemberRef: member.memberRef,
            inputMemberDigest: member.memberDigest,
            cCallRef: truth.cCallRef,
            foldbackRef: truth.foldbackRef,
            foldbackEventRef: truth.foldback.eventId,
            resultRef: truth.resultRef,
            resultDigest: truth.resultDigest,
            judgmentRef: truth.judgmentRef,
            disposition: "blocked",
            stoppingEventRef: truth.judgment.eventId,
        }
        : null;
}
function completionCommon(applicationRef, batchRef, materialization) {
    return {
        applicationRef,
        batchRef,
        inputVectorRef: materialization.inputVectorRef,
        outputVectorContractRef: materialization.outputVectorRef,
        inputMemberContractRef: materialization.inputMemberContractRef,
        outputMemberContractRef: materialization.outputMemberContractRef,
    };
}
function candidateProjection(prefix, request) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    if (runtimeEventPrefixDigest(prefix) !==
        request.expectedPrefixDigest)
        return null;
    const materialization = materializationFor(request.authority);
    if (materialization === null)
        return null;
    const truths = exactTaskCensus(prefix, Number.POSITIVE_INFINITY, request.authority, request.authority.application.batchRef, request.authority);
    if (truths === null || truths.length > materialization.members.length)
        return null;
    const completedRows = [];
    for (const [ordinal, truth] of truths.entries()) {
        const member = materialization.members[ordinal];
        if (member === undefined)
            return null;
        const row = completedRow(truth, member, materialization.outputMemberContractRef);
        if (row === null)
            break;
        completedRows.push(row);
    }
    const common = completionCommon(request.authority.application.applicationRef, request.authority.application.batchRef, materialization);
    let variant;
    if (request.completionKind === "complete_vector") {
        if (truths.length !== materialization.members.length ||
            completedRows.length !== materialization.members.length)
            return null;
        const outputVector = deepFreeze({
            kind: "gtl_fan_out_vector",
            schemaVersion: "5.0.0",
            applicationRef: request.authority.application.applicationRef,
            members: completedRows.map((row) => ({
                ordinal: row.ordinal,
                inputMemberRef: row.inputMemberRef,
                outputMemberRef: row.outputMemberRef,
                value: row.value,
            })),
        });
        if (!request.validateOutputVector(outputVector))
            return null;
        const outputVectorDigest = sha256Canonical(outputVector);
        variant = {
            completionKind: "complete_vector",
            taskRows: completedRows,
            outputVectorRef: `graph-vector-value://abiogenesis/${outputVectorDigest.slice("sha256:".length)}`,
            outputVectorDigest,
            outputVector,
        };
    }
    else {
        const truth = truths[completedRows.length];
        const member = materialization.members[completedRows.length];
        const stopped = truth === undefined || member === undefined
            ? null
            : stoppingRow(truth, member);
        if (stopped === null || truths.length !== completedRows.length + 1)
            return null;
        variant = {
            completionKind: "partial_stop",
            completedRows: completedRows,
            stoppingRow: stopped,
            unstartedRows: materialization.members.slice(completedRows.length + 1)
                .map((unstarted) => ({
                ordinal: unstarted.ordinal,
                inputMemberRef: unstarted.memberRef,
                inputMemberDigest: unstarted.memberDigest,
            })),
        };
    }
    const completionBody = deepFreeze({
        ...common,
        ...variant,
    });
    const completionDigest = sha256Canonical(completionBody);
    const completionRef = `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}`;
    return deepFreeze({
        kind: "fan_out_completion_candidate_projection",
        schemaVersion: "5.0.0",
        completionBody,
        completionRef,
        completionDigest,
        requiredCausationEventRefs: [...new Set(truths.flatMap((truth) => [
                truth.foldback.eventId,
                truth.judgment.eventId,
            ]))],
    });
}
const CANONICAL_COMPLETION_FACTS = Symbol("canonical_completion_facts");
function canonicalAdmission(prefix, request) {
    if (request.mode !== "event_canonical" || prefix.kind !== "validated_runtime_event_prefix")
        return deriveCanonicalAdmission(prefix, request);
    const matches = indexedRuntimeEvents(prefix, "kind:fan_out_completion_admitted").filter(e => e.eventId === request.admissionEventRef);
    if (matches.length !== 1)
        return null;
    const event = matches[0];
    // All task/result/foldback inputs are bounded before this immutable admission.
    // The existing retry uniqueness check also observes later declarations.
    const retryEnd = indexedRuntimeEvents(prefix, "kind:retry_attempt_opened").filter(e => e.runId === event.runId && e.graphCallId === event.graphCallId && e.frameId === event.frameId).at(-1);
    const facts = runtimePrefixComputation(prefix, CANONICAL_COMPLETION_FACTS, () => new Map());
    const previous = facts.get(event.eventId);
    if (previous !== undefined && previous.retryEnd === retryEnd)
        return previous.value;
    const value = deriveCanonicalAdmission(prefix, request);
    facts.set(event.eventId, { retryEnd, value });
    return value;
}
function deriveCanonicalAdmission(prefix, request) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    const completionEvent = uniqueEvent(indexedRuntimeEvents(prefix, "id:" + request.admissionEventRef), (event) => event.eventId === request.admissionEventRef &&
        event.kind === "fan_out_completion_admitted");
    if (completionEvent === null ||
        completionEvent.aggregateType !== "frame" ||
        completionEvent.aggregateId !== completionEvent.frameId ||
        completionEvent.parentAggregateId !== completionEvent.graphCallId ||
        completionEvent.workflowVersion !== "5.0.0" ||
        completionEvent.scopeClass !== "run" ||
        !isNonEmptyString(completionEvent.basisId) ||
        !isNonEmptyString(completionEvent.runId) ||
        !isNonEmptyString(completionEvent.graphCallId) ||
        !isNonEmptyString(completionEvent.frameId) ||
        !isRecord(completionEvent.payload))
        return null;
    const payload = completionEvent.payload;
    const completionRef = payload.completionRef;
    const completionDigest = payload.completionDigest;
    const applicationRef = payload.applicationRef;
    const batchRef = payload.batchRef;
    const inputVectorRef = payload.inputVectorRef;
    const outputVectorContractRef = payload.outputVectorContractRef;
    const inputMemberContractRef = payload.inputMemberContractRef;
    const outputMemberContractRef = payload.outputMemberContractRef;
    const completionKind = payload.completionKind;
    if (!isNonEmptyString(completionRef) || !isDigest(completionDigest) ||
        !isNonEmptyString(applicationRef) || !isNonEmptyString(batchRef) ||
        !isNonEmptyString(inputVectorRef) ||
        !isNonEmptyString(outputVectorContractRef) ||
        !isNonEmptyString(inputMemberContractRef) ||
        !isNonEmptyString(outputMemberContractRef) ||
        (completionKind !== "complete_vector" && completionKind !== "partial_stop"))
        return null;
    const authority = request.mode === "graph_bound" ? request.authority : null;
    const materialization = authority === null ? null : materializationFor(authority);
    if (authority !== null &&
        (materialization === null ||
            !sameEnvelope(completionEvent, {
                ...authority,
                materializationRef: authority.graph.materializationRef,
            }) ||
            completionEvent.graphFunctionRef !== authority.graph.graphFunctionRef ||
            applicationRef !== authority.application.applicationRef ||
            batchRef !== authority.application.batchRef ||
            inputVectorRef !== materialization.inputVectorRef ||
            outputVectorContractRef !== materialization.outputVectorRef ||
            inputMemberContractRef !== materialization.inputMemberContractRef ||
            outputMemberContractRef !== materialization.outputMemberContractRef))
        return null;
    const truths = exactTaskCensus(prefix, completionEvent.admissionOrdinal, {
        runId: completionEvent.runId,
        graphCallId: completionEvent.graphCallId,
        frameId: completionEvent.frameId,
    }, batchRef, authority);
    if (truths === null)
        return null;
    const common = {
        applicationRef,
        batchRef,
        inputVectorRef,
        outputVectorContractRef,
        inputMemberContractRef,
        outputMemberContractRef,
    };
    let body;
    if (completionKind === "complete_vector") {
        if (!exactKeys(payload, [
            "applicationRef",
            "batchRef",
            "completionDigest",
            "completionKind",
            "completionRef",
            "inputMemberContractRef",
            "inputVectorRef",
            "outputMemberContractRef",
            "outputVector",
            "outputVectorContractRef",
            "outputVectorDigest",
            "outputVectorRef",
            "taskRows",
        ]) || !Array.isArray(payload.taskRows) ||
            payload.taskRows.length !== truths.length ||
            !isRecord(payload.outputVector) ||
            !isDigest(payload.outputVectorDigest) ||
            !isNonEmptyString(payload.outputVectorRef))
            return null;
        const rows = payload.taskRows.map((value, ordinal) => {
            const truth = truths[ordinal];
            if (truth === undefined)
                return null;
            const row = completedRowFromPayload(value, truth);
            if (row === null ||
                (materialization !== null &&
                    (materialization.members[ordinal]?.ordinal !== row.ordinal ||
                        materialization.members[ordinal]?.memberRef !== row.inputMemberRef ||
                        materialization.members[ordinal]?.memberDigest !==
                            row.inputMemberDigest ||
                        truth.resultContractRef !== materialization.outputMemberContractRef)))
                return null;
            return row;
        });
        if (rows.some((row) => row === null) ||
            (materialization !== null && rows.length !== materialization.members.length))
            return null;
        const taskRows = rows;
        const outputVector = {
            kind: "gtl_fan_out_vector",
            schemaVersion: "5.0.0",
            applicationRef,
            members: taskRows.map((row) => ({
                ordinal: row.ordinal,
                inputMemberRef: row.inputMemberRef,
                outputMemberRef: row.outputMemberRef,
                value: row.value,
            })),
        };
        const outputVectorDigest = sha256Canonical(outputVector);
        if (sha256Canonical(payload.outputVector) !== outputVectorDigest ||
            sha256Canonical(payload.outputVector) !==
                sha256Canonical(outputVector) ||
            payload.outputVectorDigest !== outputVectorDigest ||
            payload.outputVectorRef !==
                `graph-vector-value://abiogenesis/${outputVectorDigest.slice("sha256:".length)}`)
            return null;
        body = {
            ...common,
            completionKind,
            taskRows: taskRows,
            outputVectorRef: payload.outputVectorRef,
            outputVectorDigest,
            outputVector: payload.outputVector,
        };
    }
    else {
        if (!exactKeys(payload, [
            "applicationRef",
            "batchRef",
            "completedRows",
            "completionDigest",
            "completionKind",
            "completionRef",
            "inputMemberContractRef",
            "inputVectorRef",
            "outputMemberContractRef",
            "outputVectorContractRef",
            "stoppingRow",
            "unstartedRows",
        ]) || !Array.isArray(payload.completedRows) ||
            !Array.isArray(payload.unstartedRows) || !isRecord(payload.stoppingRow) ||
            truths.length !== payload.completedRows.length + 1)
            return null;
        const completedRows = payload.completedRows.map((value, ordinal) => {
            const truth = truths[ordinal];
            return truth === undefined ? null : completedRowFromPayload(value, truth);
        });
        if (completedRows.some((row) => row === null))
            return null;
        const stoppingTruth = truths[payload.completedRows.length];
        const stoppingValue = payload.stoppingRow;
        if (!exactKeys(stoppingValue, [
            "cCallRef",
            "disposition",
            "foldbackEventRef",
            "foldbackRef",
            "inputMemberDigest",
            "inputMemberRef",
            "judgmentRef",
            "ordinal",
            "resultDigest",
            "resultRef",
            "stoppingEventRef",
        ]) || !isOrdinal(stoppingValue.ordinal) ||
            !isNonEmptyString(stoppingValue.inputMemberRef) ||
            !isDigest(stoppingValue.inputMemberDigest))
            return null;
        const stoppingOrdinal = stoppingValue.ordinal;
        const expectedStopping = stoppingRow(stoppingTruth, {
            ordinal: stoppingValue.ordinal,
            memberRef: stoppingValue.inputMemberRef,
            memberDigest: stoppingValue.inputMemberDigest,
        });
        if (expectedStopping === null ||
            sha256Canonical(expectedStopping) !==
                sha256Canonical(stoppingValue) ||
            (materialization !== null &&
                (materialization.members[stoppingOrdinal]?.memberRef !==
                    stoppingValue.inputMemberRef ||
                    materialization.members[stoppingOrdinal]?.memberDigest !==
                        stoppingValue.inputMemberDigest)))
            return null;
        const unstartedRows = payload.unstartedRows.map((value, offset) => {
            if (!isRecord(value) || !exactKeys(value, [
                "inputMemberDigest",
                "inputMemberRef",
                "ordinal",
            ]) || !isOrdinal(value.ordinal) || !isNonEmptyString(value.inputMemberRef) ||
                !isDigest(value.inputMemberDigest) ||
                value.ordinal !== stoppingOrdinal + offset + 1)
                return null;
            return value;
        });
        if (unstartedRows.some((row) => row === null) ||
            (materialization !== null &&
                (materialization.members.length !==
                    payload.completedRows.length + 1 + unstartedRows.length ||
                    unstartedRows.some((row) => {
                        if (row === null)
                            return true;
                        const member = materialization.members[row.ordinal];
                        return member === undefined ||
                            member.memberRef !== row.inputMemberRef ||
                            member.memberDigest !== row.inputMemberDigest;
                    }))))
            return null;
        body = {
            ...common,
            completionKind,
            completedRows: completedRows,
            stoppingRow: expectedStopping,
            unstartedRows: unstartedRows,
        };
    }
    if (completionDigest !== sha256Canonical(body) ||
        completionRef !==
            `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}` ||
        truths.some((truth) => !completionEvent.causationEventRefs.includes(truth.foldback.eventId) ||
            !completionEvent.causationEventRefs.includes(truth.judgment.eventId)))
        return null;
    return deepFreeze({
        kind: "fan_out_completion_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        completionRef,
        completionDigest,
        ...body,
        admissionEventRef: completionEvent.eventId,
    });
}
export function projectExactFanOutCompletion(prefix, request) {
    return request.mode === "candidate"
        ? candidateProjection(prefix, request)
        : canonicalAdmission(prefix, request);
}
const PARTIAL_FAN_OUT_STOP_ROUTE_BODY_KEYS = Object.freeze([
    "cCallRef",
    "consumedAvailabilityRefs",
    "contractRef",
    "declarationDigest",
    "declarationRef",
    "judgmentRef",
    "replayStateDigest",
    "routeKind",
    "sourceCursorDigest",
    "sourceCursorRef",
    "targetCursorDigest",
    "targetCursorRef",
]);
export function hasExactPartialFanOutStopRouteBridge(prefix, routeAdmissionEventRef, coordinates) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    const route = uniqueEvent(events, (event) => event.eventId === routeAdmissionEventRef &&
        event.kind === "traversal_route_admitted");
    if (route === null ||
        route.aggregateType !== "frame" ||
        route.aggregateId !== coordinates.frameId ||
        route.parentAggregateId !== coordinates.graphCallId ||
        route.runId !== coordinates.runId ||
        route.graphCallId !== coordinates.graphCallId ||
        route.frameId !== coordinates.frameId ||
        route.causationEventRefs.length !== 1 ||
        !isNonEmptyString(route.basisId) ||
        !isNonEmptyString(route.materializationRef))
        return false;
    const routeBody = exactHashedPayload(route, "routeRef", "routeDigest", "traversal-route://abiogenesis/");
    if (routeBody === null ||
        !exactKeys(routeBody, PARTIAL_FAN_OUT_STOP_ROUTE_BODY_KEYS) ||
        routeBody.routeKind !== "blocked" ||
        routeBody.declarationRef !== route.materializationRef ||
        !isDigest(routeBody.declarationDigest) ||
        !isNonEmptyString(routeBody.sourceCursorRef) ||
        !isDigest(routeBody.sourceCursorDigest) ||
        routeBody.targetCursorRef !== null ||
        routeBody.targetCursorDigest !== null ||
        routeBody.cCallRef !== coordinates.cCallRef ||
        routeBody.judgmentRef !== coordinates.judgmentRef ||
        !isNonEmptyString(routeBody.contractRef) ||
        !isDigest(routeBody.replayStateDigest) ||
        !Array.isArray(routeBody.consumedAvailabilityRefs) ||
        !routeBody.consumedAvailabilityRefs.every((value) => typeof value === "string"))
        return false;
    const completionEvent = uniqueEvent(indexedRuntimeEvents(prefix, "id:" + route.causationEventRefs[0]), (event) => event.eventId === route.causationEventRefs[0] &&
        event.kind === "fan_out_completion_admitted");
    if (completionEvent === null ||
        !isNonEmptyString(completionEvent.basisId) ||
        !isNonEmptyString(completionEvent.runId) ||
        !isNonEmptyString(completionEvent.graphCallId) ||
        !isNonEmptyString(completionEvent.frameId) ||
        !isNonEmptyString(completionEvent.materializationRef) ||
        !sameEnvelope(route, {
            basisId: completionEvent.basisId,
            runId: completionEvent.runId,
            graphCallId: completionEvent.graphCallId,
            frameId: completionEvent.frameId,
            materializationRef: completionEvent.materializationRef,
        }) ||
        route.graphFunctionRef !== completionEvent.graphFunctionRef ||
        completionEvent.admissionOrdinal >= route.admissionOrdinal)
        return false;
    const completion = canonicalAdmission(prefix, {
        mode: "event_canonical",
        admissionEventRef: completionEvent.eventId,
    });
    if (completion === null ||
        completion.completionKind !== "partial_stop" ||
        completion.stoppingRow.cCallRef !== coordinates.cCallRef ||
        completion.stoppingRow.resultRef !== coordinates.resultRef ||
        completion.stoppingRow.judgmentRef !== coordinates.judgmentRef ||
        completion.stoppingRow.stoppingEventRef.length === 0 ||
        !sameStrings(routeBody.consumedAvailabilityRefs, [coordinates.judgmentRef, completion.applicationRef]))
        return false;
    const result = uniqueEvent(events, (event) => event.kind === "c_call_result_admitted" &&
        event.aggregateType === "c_call" &&
        event.aggregateId === coordinates.cCallRef &&
        event.runId === coordinates.runId &&
        event.graphCallId === coordinates.graphCallId &&
        event.frameId === coordinates.frameId &&
        event.admissionOrdinal < completionEvent.admissionOrdinal &&
        isRecord(event.payload) &&
        event.payload.resultRef === coordinates.resultRef);
    const judgment = uniqueEvent(events, (event) => event.eventId === completion.stoppingRow.stoppingEventRef &&
        event.kind === "c_call_judged" &&
        event.aggregateType === "c_call" &&
        event.aggregateId === coordinates.cCallRef &&
        event.runId === coordinates.runId &&
        event.graphCallId === coordinates.graphCallId &&
        event.frameId === coordinates.frameId &&
        event.admissionOrdinal < completionEvent.admissionOrdinal &&
        isRecord(event.payload) &&
        event.payload.resultRef === coordinates.resultRef &&
        event.payload.judgmentRef === coordinates.judgmentRef);
    return result !== null && isRecord(result.payload) &&
        result.payload.resultDigest === completion.stoppingRow.resultDigest &&
        judgment !== null && isRecord(judgment.payload) &&
        judgment.payload.judgment === "blocked" &&
        judgment.causationEventRefs[0] === result.eventId;
}
