import { createHash } from "node:crypto";
import { writeCanonicalJson, compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { isJsonRecordShape as isRecord, isNonEmptyJsonString as nonEmptyString } from "../shared/admission_predicates.js";
import { isExecutableCLeaf, } from "../gtl/c_algebra.js";
import { deriveCEnclosingRetryTopology, deriveCSourceContinuation, resolveEnclosingCRetryContexts, resolveCProgramTermAtSourcePath, } from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectRuntimeLivenessAtPrefix, captureNativeFrameBoundary, observeNativeFrameLiveness, createRuntimeLivenessEventValidator } from "./runtime_liveness.js";
import { deriveCanonicalRootedTopologyPartition, } from "../shared/rooted_topology_partition.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import { admitPlannedCCallRuntimeFailureClose, isCCallRuntimeFailureCloseError, projectAdmittedCCallOutcomeAtPrefix, projectAdmittedCCallResultAtPrefix, planCCallRuntimeFailureClose, projectCCallCarrierPhaseAtPrefix, projectCCallPhase, projectCCallRuntimeFailureSignal, projectOpenedCCallCarrierAtPrefix, } from "./c_call.js";
import { hasAdmittedExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix, rehydrateExecutionBasis, rehydrateExecutionBasisAtPrefix, } from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent, admitRuntimeEventTransactionAtExpectedPrefix, assertRuntimeEventTransactionActive, compareAndAppendExpectedPrefix, projectRuntimeEventFromValidatedHistory, readRuntimeEventsAtDurablePrefix, projectRuntimeEventsAtDurablePrefix, readActiveRuntimeTransactionAtDurablePrefix, selectActiveRuntimeTransactionHistoryAtDurablePrefix, ROOT_EVENT_CONTRACT_DIGEST, validateDurablePrefixCoordinate, } from "./event_store.js";
import { constructRuntimeFluent, constructScopedRetryFluent, deriveRuntimeHeldFluentProjection, holdsAt, } from "./event_calculus.js";
import { projectFhContinuations } from "./fh_continuation_projection.js";
import { runtimeEventPrefixDigest, projectOwnedRuntimeEventPrefixAtDurablePrefix, selectOwnedRuntimeEventPrefix, extendRuntimeEventPlanPrefixForValidation, writeRuntimeEventPrefixValue, runtimeEventPrefixesHaveSameOwnedCut, runtimeEventBodiesAtPrefix, selectRuntimeEventPrefixFromAuthority, selectValidatedRuntimeEventPrefix, unscopedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent, } from "./event_prefix.js";
import { projectRuntimeReplayGuard, writeRuntimeReplayGuardValue, runtimeReplayGuardsHaveSameOwnedCut, replayValidatedRuntimeEventPrefix, } from "./replay.js";
import { constructTraversalCursorCandidate, deriveAdmittedCContinuationTarget, hasAdmittedTraversalCursorAtPrefix, isInteractionResumeCursorSuccessorAtPrefix, isTraversalCursorCandidate, traversalCursorAdmissionEventRefAtPrefix, } from "./traversal_cursor.js";
import { rehydrateOpenedTraversalScopeAtPrefix, } from "./open_call.js";
import { deriveRetainedCCallInputAtPrefix, projectDeclaredStructuralAdvanceAtPrefix, projectAdmittedRouteAtPrefix, projectHistoricalTraversalRoutesAtPrefix, } from "./traversal_route.js";
import { WORKER_TRANSPORT_FAILURE_CLASS_VALUES, } from "./transport_contracts.js";
export { WORKER_TRANSPORT_FAILURE_CLASS_VALUES as RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES, } from "./transport_contracts.js";
function refusal(code, message) {
    return deepFreeze({
        kind: "retry_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
function isExpectedPrefixMismatch(error) {
    return error instanceof TypeError &&
        error.message ===
            "runtime event append requires the exact expected immutable prefix";
}
const PROJECTED_RETRY_RESUME_KEYS = Object.freeze([
    "disposition",
    "executableRetryInputDigest",
    "executableRetryInputRef",
    "inputContractRef",
    "inputDigest",
    "inputRef",
    "inputValue",
    "kind",
    "nextAttempt",
    "nextCursor",
    "progressEventRef",
    "retryAttemptAdmissionEventRef",
    "retryAttemptDigest",
    "retryAttemptRef",
    "retryFrontierDigest",
    "retryFrontierRef",
    "routeAdmissionEventRef",
    "routeDigest",
    "routeRef",
    "schemaVersion",
    "selectedFrontierRowRef",
    "successorPrefix",
].sort());
export function isProjectedRetryResumeCarrier(value) {
    try {
        if (!isRecord(value))
            return false;
        const keys = Object.keys(value).sort();
        const nextCursor = value.nextCursor;
        return keys.length === PROJECTED_RETRY_RESUME_KEYS.length &&
            keys.every((key, index) => key === PROJECTED_RETRY_RESUME_KEYS[index]) &&
            value.kind === "projected_retry_resume" &&
            value.schemaVersion === "5.0.0" &&
            value.disposition === "resumed" &&
            isSha256Digest(value.executableRetryInputDigest) &&
            value.executableRetryInputRef ===
                `executable-retry-input://abiogenesis/${value.executableRetryInputDigest.slice("sha256:".length)}` &&
            isSha256Digest(value.retryFrontierDigest) &&
            value.retryFrontierRef ===
                `retry-attempt-frontier://abiogenesis/${value.retryFrontierDigest.slice("sha256:".length)}` &&
            typeof value.selectedFrontierRowRef === "string" &&
            value.selectedFrontierRowRef.length > 0 &&
            typeof value.progressEventRef === "string" &&
            value.progressEventRef.length > 0 &&
            typeof value.routeAdmissionEventRef === "string" &&
            value.routeAdmissionEventRef.length > 0 &&
            isSha256Digest(value.routeDigest) &&
            value.routeRef ===
                `traversal-route://abiogenesis/${value.routeDigest.slice("sha256:".length)}` &&
            typeof value.retryAttemptAdmissionEventRef === "string" &&
            value.retryAttemptAdmissionEventRef.length > 0 &&
            isSha256Digest(value.retryAttemptDigest) &&
            value.retryAttemptRef ===
                `retry-attempt://abiogenesis/${value.retryAttemptDigest.slice("sha256:".length)}` &&
            Number.isSafeInteger(value.nextAttempt) && Number(value.nextAttempt) >= 2 &&
            typeof value.inputContractRef === "string" &&
            value.inputContractRef.length > 0 &&
            typeof value.inputRef === "string" && value.inputRef.length > 0 &&
            isSha256Digest(value.inputDigest) &&
            isRecord(value.inputValue) &&
            sha256Canonical(value.inputValue) === value.inputDigest &&
            isTraversalCursorCandidate(nextCursor) &&
            nextCursor.attempt === value.nextAttempt &&
            nextCursor.retryPath.at(-1) === value.nextAttempt &&
            nextCursor.inputRef === value.inputRef &&
            nextCursor.inputDigest === value.inputDigest &&
            validateDurablePrefixCoordinate(value.successorPrefix);
    }
    catch {
        return false;
    }
}
function sameCanonicalRetryValue(left, right) {
    try {
        return sha256Canonical(left) ===
            sha256Canonical(right);
    }
    catch {
        return false;
    }
}
export function projectRetryResumeAtDurablePrefix(carrier, expectedExecutionBasis, graph, graphFunction) {
    try {
        if (!isProjectedRetryResumeCarrier(carrier))
            return null;
        const durableEvents = readRuntimeEventsAtDurablePrefix(carrier.successorPrefix);
        const attemptEvent = durableEvents.at(-1);
        const routeEvents = durableEvents.filter((event) => event.eventId === carrier.routeAdmissionEventRef);
        const routeEvent = routeEvents.length === 1 ? routeEvents[0] : undefined;
        if (routeEvent?.kind !== "traversal_route_admitted" ||
            attemptEvent?.kind !== "retry_attempt_opened" ||
            attemptEvent.eventId !== carrier.retryAttemptAdmissionEventRef ||
            routeEvent.admissionOrdinal >= attemptEvent.admissionOrdinal ||
            !sameCanonicalRetryValue(attemptEvent.causationEventRefs, [routeEvent.eventId]))
            return null;
        const authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
        // The route owner observes its frame progress before opening the dependent
        // attempt in the same transaction. Preserve that exact producer relation;
        // arbitrary observations or semantic transitions are not transparent.
        const validateObservation = createRuntimeLivenessEventValidator(authorityPrefix);
        for (const event of durableEvents) {
            if (event.admissionOrdinal <= routeEvent.admissionOrdinal ||
                event.admissionOrdinal >= attemptEvent.admissionOrdinal)
                continue;
            if (event.kind !== "runtime_activity_probe_observed" ||
                !isRecord(event.payload) || !isRecord(event.payload.probeContract) ||
                !isRecord(event.payload.observation) ||
                event.payload.probeContract.source !== "frame_progress" ||
                event.payload.observation.underlyingEventRef !== routeEvent.eventId ||
                event.payload.observation.sourceDigest !== routeEvent.payloadDigest ||
                event.runId !== routeEvent.runId || event.graphCallId !== routeEvent.graphCallId ||
                event.frameId !== routeEvent.frameId || event.basisId !== routeEvent.basisId ||
                event.graphFunctionRef !== routeEvent.graphFunctionRef ||
                !validateObservation(event))
                return null;
        }
        const runPrefix = selectValidatedRuntimeEventPrefix(durableEvents, {
            runId: carrier.nextCursor.runId,
        });
        const executionBasis = rehydrateExecutionBasisAtPrefix(authorityPrefix, carrier.nextCursor.executionBasisRef);
        if (executionBasis === null ||
            !sameCanonicalRetryValue(executionBasis, expectedExecutionBasis) ||
            executionBasis.graphRef !== graph.materializationRef ||
            executionBasis.graphDigest !== graph.materializationDigest ||
            executionBasis.rawInputAdmissionRef !== graph.admittedInputRef ||
            executionBasis.rawInputDigest !== graph.admittedInputDigest ||
            sha256Canonical(executionBasis.rawInputValue) !==
                executionBasis.rawInputDigest)
            return null;
        const frontier = projectDeclaredCRetryFrontier(runPrefix, graph, carrier.nextCursor, graphFunction, carrier.nextCursor.retryPath.length, authorityPrefix);
        const active = frontier?.state === "attempt_active"
            ? frontier.active
            : null;
        const prior = frontier?.rows.at(-2);
        if (active === null ||
            prior?.kind !== "declared_c_retry_retry_progress" ||
            prior.consumption.kind !== "progress_consumed_by_retry")
            return null;
        const progress = prior.progress;
        const route = projectAdmittedRouteAtPrefix(runPrefix, prior.consumption.route.admissionEventRef, authorityPrefix);
        const sourceCursor = prior.failureCCall.sourceCursor;
        if (route?.routeKind !== "retry" ||
            !isTraversalCursorCandidate(sourceCursor) ||
            !hasAdmittedTraversalCursorAtPrefix(runPrefix, sourceCursor) ||
            !hasAdmittedTraversalCursorAtPrefix(runPrefix, carrier.nextCursor) ||
            route.admissionEventRef !== carrier.routeAdmissionEventRef ||
            route.routeRef !== carrier.routeRef ||
            route.routeDigest !== carrier.routeDigest ||
            route.sourceCursorRef !== sourceCursor.cursorRef ||
            route.sourceCursorDigest !== sourceCursor.cursorDigest ||
            route.targetCursorRef !== carrier.nextCursor.cursorRef ||
            route.targetCursorDigest !== carrier.nextCursor.cursorDigest ||
            route.cCallRef !== progress.cCallRef ||
            route.judgmentRef !== progress.judgmentRef ||
            !sameCanonicalRetryValue(route.consumedAvailabilityRefs, [
                progress.judgmentRef,
                progress.progressRef,
            ]))
            return null;
        const attempt = active.attempt;
        if (attempt.admissionEventRef !== carrier.retryAttemptAdmissionEventRef ||
            attempt.attemptRef !== carrier.retryAttemptRef ||
            attempt.attemptDigest !== carrier.retryAttemptDigest ||
            attempt.attempt !== carrier.nextAttempt ||
            attempt.retryBoundaryRef !== progress.retryBoundaryRef ||
            attempt.priorJudgmentRef !== progress.judgmentRef ||
            attempt.priorRouteRef !== route.routeRef ||
            attempt.inputContractRef !== carrier.inputContractRef ||
            attempt.inputRef !== carrier.inputRef ||
            attempt.inputDigest !== carrier.inputDigest ||
            !sameCanonicalRetryValue(attempt.inputValue, carrier.inputValue) ||
            !sameCanonicalRetryValue(attempt.retryPath, carrier.nextCursor.retryPath) ||
            !sameCanonicalRetryValue(active.cursor, carrier.nextCursor) ||
            !sameCanonicalRetryValue(active.currentCursor, carrier.nextCursor) ||
            progress.admissionEventRef !== carrier.progressEventRef)
            return null;
        return deepFreeze({ cursor: carrier.nextCursor, executionBasis });
    }
    catch {
        return null;
    }
}
function sameStrings(left, right) {
    return left.length === right.length &&
        left.every((value, index) => value === right[index]);
}
function sameNumbers(left, right) {
    return left.length === right.length &&
        left.every((value, index) => value === right[index]);
}
function contextForCursor(graph, cursor) {
    const contexts = resolveEnclosingCRetryContexts(graph.template, cursor.currentNodeRef, cursor.termPath);
    if ("kind" in contexts) {
        return refusal("retry_not_declared", contexts.message);
    }
    const context = contexts.at(-1);
    if (context === undefined)
        return null;
    if (context.retryDepth !== cursor.retryPath.length ||
        cursor.attempt !== cursor.retryPath.at(-1)) {
        return refusal("cursor_mismatch", "retry cursor coordinates differ from the exact enclosing GTL retry path");
    }
    return context;
}
function retryBoundaryRef(graph, cursor, context) {
    const digest = sha256Canonical({
        graphRef: graph.materializationRef,
        frameId: cursor.frameId,
        nodeRef: cursor.currentNodeRef,
        retryTermPath: context.retryTermPath,
        taskOrdinal: context.taskOrdinal,
    });
    return `retry-boundary://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function deriveRetryAttemptManifestRef(input) {
    const digest = sha256Canonical(input);
    return `retry-attempt-manifest://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function projectDeclaredRetryAttemptCoordinates(graph, cursor) {
    const context = contextForCursor(graph, cursor);
    if (context === null ||
        (typeof context === "object" && "kind" in context))
        return null;
    return deepFreeze({
        retryBoundaryRef: retryBoundaryRef(graph, cursor, context),
        retryTermPath: context.retryTermPath,
        wrappedTermPath: context.wrappedTermPath,
        taskOrdinal: context.taskOrdinal,
        retryDepth: context.retryDepth,
        budget: context.budget,
        inputCarrierRef: context.inputCarrierRef,
    });
}
function deriveRetryAttemptCursorCarrier(events, event) {
    if (event.kind !== "retry_attempt_opened" ||
        event.aggregateType !== "frame" ||
        event.runId === undefined || event.graphCallId === undefined ||
        event.frameId === undefined || event.basisId === undefined ||
        event.materializationRef === undefined || !isRecord(event.payload))
        return null;
    const payload = event.payload;
    const wrappedTermPath = stringValues(payload.wrappedTermPath);
    const retryPath = positiveIntegerValues(payload.retryPath);
    if (wrappedTermPath === null || wrappedTermPath[0] !== "node" ||
        !nonEmptyString(wrappedTermPath[1]) || retryPath === null ||
        !positiveInteger(payload.attempt) ||
        payload.attempt !== retryPath.at(-1) ||
        !nonEmptyString(payload.inputRef) || !digestValue(payload.inputDigest) ||
        (payload.taskOrdinal !== null && !nonNegativeInteger(payload.taskOrdinal)))
        return null;
    const initialRows = events.filter((candidate) => candidate.kind === "traversal_cursor_entered" &&
        candidate.admissionOrdinal < event.admissionOrdinal &&
        candidate.runId === event.runId &&
        candidate.graphCallId === event.graphCallId &&
        candidate.frameId === event.frameId &&
        candidate.basisId === event.basisId && isRecord(candidate.payload) &&
        nonEmptyString(candidate.payload.programRef) &&
        nonEmptyString(candidate.payload.traversalScopeRef));
    if (initialRows.length !== 1)
        return null;
    const initial = initialRows[0].payload;
    const body = {
        programRef: initial.programRef,
        executionBasisRef: event.basisId,
        traversalScopeRef: initial.traversalScopeRef,
        runId: event.runId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        graphRef: event.materializationRef,
        inputRef: payload.inputRef,
        inputDigest: payload.inputDigest,
        currentNodeRef: wrappedTermPath[1],
        position: "at_term",
        termPath: wrappedTermPath,
        taskOrdinal: payload.taskOrdinal,
        attempt: Number(payload.attempt),
        retryPath,
    };
    const cursor = constructTraversalCursorCandidate(body);
    return isTraversalCursorCandidate(cursor) ? cursor : null;
}
function deriveRetryAttemptCursor(prefix, graph, event) {
    if (event.materializationRef !== graph.materializationRef ||
        event.graphFunctionRef !== graph.graphFunctionRef ||
        event.causationEventRefs.length !== 1 || !isRecord(event.payload))
        return null;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const payload = event.payload;
    const cursor = deriveRetryAttemptCursorCarrier(events, event);
    if (cursor === null)
        return null;
    const routeRows = indexedRuntimeEvents(prefix, "id:" + event.causationEventRefs[0]).filter((candidate) => candidate.eventId === event.causationEventRefs[0] &&
        candidate.kind === "traversal_route_admitted" &&
        candidate.admissionOrdinal < event.admissionOrdinal &&
        candidate.runId === event.runId &&
        candidate.graphCallId === event.graphCallId &&
        candidate.frameId === event.frameId &&
        candidate.materializationRef === graph.materializationRef &&
        isRecord(candidate.payload) &&
        candidate.payload.routeKind === "retry" &&
        candidate.payload.routeRef === payload.priorRouteRef &&
        candidate.payload.judgmentRef === payload.priorJudgmentRef);
    const route = routeRows.length === 1 ? routeRows[0] : null;
    return route !== null && isRecord(route.payload) &&
        route.payload.targetCursorRef === cursor.cursorRef &&
        route.payload.targetCursorDigest === cursor.cursorDigest
        ? cursor
        : null;
}
export function projectRetryAttempt(prefix, graph, admissionEventRef) {
    if (!isMaterializedGtlGraph(graph) || admissionEventRef.length === 0) {
        return null;
    }
    const events = runtimeEventBodiesAtPrefix(prefix);
    const matches = indexedRuntimeEvents(prefix, "id:" + admissionEventRef).filter((event) => event.kind === "retry_attempt_opened" && isRecord(event.payload) &&
        event.eventId === admissionEventRef);
    if (matches.length !== 1)
        return null;
    const event = matches[0];
    const cursor = deriveRetryAttemptCursor(prefix, graph, event);
    if (cursor === null || !isRecord(event.payload))
        return null;
    const context = contextForCursor(graph, cursor);
    if (context === null || (typeof context === "object" && "kind" in context)) {
        return null;
    }
    const payload = event.payload;
    const retryTermPath = stringValues(payload.retryTermPath);
    const wrappedTermPath = stringValues(payload.wrappedTermPath);
    const retryable = stringValues(payload.retryableFailureClasses);
    if (event.aggregateId !== cursor.frameId ||
        event.parentAggregateId !== cursor.graphCallId ||
        event.basisId !== cursor.executionBasisRef ||
        !nonEmptyString(payload.attemptRef) || !digestValue(payload.attemptDigest) ||
        !nonEmptyString(payload.attemptManifestRef) ||
        payload.retryBoundaryRef !== retryBoundaryRef(graph, cursor, context) ||
        payload.attempt !== cursor.attempt ||
        payload.taskOrdinal !== cursor.taskOrdinal || payload.budget !== context.budget ||
        retryTermPath === null || !sameStrings(retryTermPath, context.retryTermPath) ||
        wrappedTermPath === null || !sameStrings(wrappedTermPath, context.wrappedTermPath) ||
        retryable === null ||
        !sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) ||
        !nonEmptyString(payload.priorRouteRef) ||
        (payload.priorJudgmentRef !== null && !nonEmptyString(payload.priorJudgmentRef)) ||
        payload.inputRef !== cursor.inputRef || payload.inputDigest !== cursor.inputDigest ||
        payload.inputContractRef !== context.inputCarrierRef ||
        !isRecord(payload.inputValue) ||
        sha256Canonical(payload.inputValue) !== payload.inputDigest)
        return null;
    const expectedAttemptManifestRef = deriveRetryAttemptManifestRef({
        retryBoundaryRef: payload.retryBoundaryRef,
        executionBasisRef: cursor.executionBasisRef,
        inputContractRef: context.inputCarrierRef,
        inputRef: cursor.inputRef,
        inputDigest: cursor.inputDigest,
        attempt: cursor.attempt,
        retryPath: cursor.retryPath,
    });
    if (payload.attemptManifestRef !== expectedAttemptManifestRef)
        return null;
    const { attemptRef: _attemptRef, attemptDigest: _attemptDigest, ...attemptBody } = payload;
    const computedAttemptDigest = sha256Canonical(attemptBody);
    if (payload.attemptDigest !== computedAttemptDigest ||
        payload.attemptRef !==
            `retry-attempt://abiogenesis/${computedAttemptDigest.slice("sha256:".length)}`)
        return null;
    if (cursor.attempt > 1) {
        const priorRetryPath = [
            ...cursor.retryPath.slice(0, -1),
            cursor.attempt - 1,
        ];
        const priorEvents = indexedRuntimeEvents(prefix, "graph-call:" + event.graphCallId).filter((candidate) => candidate.kind === "retry_attempt_opened" &&
            candidate.admissionOrdinal < event.admissionOrdinal &&
            candidate.runId === event.runId &&
            candidate.graphCallId === event.graphCallId &&
            candidate.frameId === event.frameId &&
            isRecord(candidate.payload) &&
            candidate.payload.retryBoundaryRef === payload.retryBoundaryRef &&
            candidate.payload.taskOrdinal === payload.taskOrdinal &&
            candidate.payload.attempt === cursor.attempt - 1 &&
            sameNumbers(positiveIntegerValues(candidate.payload.retryPath) ?? [], priorRetryPath));
        if (priorEvents.length !== 1 ||
            projectRetryAttempt(prefix, graph, priorEvents[0].eventId) === null)
            return null;
    }
    const { attemptRef, attemptDigest, ...body } = payload;
    return deepFreeze({
        kind: "retry_attempt_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        attemptRef,
        attemptDigest,
        ...body,
        admissionEventRef: event.eventId,
    });
}
function positiveNumberArray(value) {
    return Array.isArray(value) &&
        value.every((row) => Number.isSafeInteger(row) && Number(row) > 0)
        ? value.map(Number)
        : [];
}
const RETRY_CONTINUATION_PROGRESS_KEYS = Object.freeze([
    "attempt", "attemptRef", "budget", "cCallRef", "completedAttempts",
    "failureClass", "failureSignalRef", "inputContractRef", "inputDigest",
    "inputRef", "judgmentRef", "progressClass", "progressDigest", "progressRef",
    "remainingBudget", "resultRef", "retryBoundaryRef", "retryPath",
].sort());
const RETRY_STOPPED_PROGRESS_KEYS = Object.freeze([
    ...RETRY_CONTINUATION_PROGRESS_KEYS,
    "predecessorProgressRef", "stopReason",
].sort());
const COMPLETED_PROGRESS_TERMINAL_KEYS = Object.freeze([
    "attempt", "attemptRef", "cCallRef", "completedRetryDepth",
    "completionClass", "completionWitnessEventRef", "judgmentRef",
    "predecessorProgressRef", "progressClass", "progressDigest", "progressRef",
    "resultRef", "retryBoundaryRef", "retryPath", "sourceCursorDigest",
    "sourceCursorRef",
].sort());
const COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
    ...COMPLETED_PROGRESS_TERMINAL_KEYS, "targetCursorDigest", "targetCursorRef",
].sort());
const STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
    "attempt", "attemptRef", "completedRetryDepth", "completionClass",
    "completionWitnessEventRef", "predecessorProgressRef", "progressClass",
    "progressDigest", "progressRef", "retryBoundaryRef", "retryPath",
    "sourceCursorDigest", "sourceCursorRef", "targetCursorDigest",
    "targetCursorRef",
].sort());
function exactPayloadKeys(payload, expected) {
    return sameStrings(Object.keys(payload).sort(), expected);
}
function progressBody(payload) {
    if (payload.progressClass === "retry") {
        if (!exactPayloadKeys(payload, RETRY_CONTINUATION_PROGRESS_KEYS))
            return null;
        const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
        return body;
    }
    if (payload.progressClass === "stopped") {
        if (!exactPayloadKeys(payload, RETRY_STOPPED_PROGRESS_KEYS))
            return null;
        const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
        return body;
    }
    if (payload.progressClass !== "completed")
        return null;
    if (payload.completionClass === "structural_identity_success") {
        if (!exactPayloadKeys(payload, STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS)) {
            return null;
        }
        const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
        return body;
    }
    if (payload.completionClass !== "judged_success" &&
        payload.completionClass !== "fan_out_success" &&
        payload.completionClass !== "fh_resume_success")
        return null;
    const terminal = !Object.hasOwn(payload, "targetCursorRef") &&
        !Object.hasOwn(payload, "targetCursorDigest");
    if (!exactPayloadKeys(payload, terminal ? COMPLETED_PROGRESS_TERMINAL_KEYS : COMPLETED_PROGRESS_ADVANCE_KEYS))
        return null;
    const { progressRef: _ref, progressDigest: _digest, ...storedBody } = payload;
    return terminal
        ? { ...storedBody, targetCursorRef: null, targetCursorDigest: null }
        : storedBody;
}
function digestValue(value) {
    return typeof value === "string" && value.startsWith("sha256:");
}
function positiveInteger(value) {
    return Number.isSafeInteger(value) && Number(value) > 0;
}
function nonNegativeInteger(value) {
    return Number.isSafeInteger(value) && Number(value) >= 0;
}
function positiveIntegerValues(value) {
    return Array.isArray(value) && value.length > 0 && value.every(positiveInteger)
        ? value.map(Number)
        : null;
}
function stringValues(value) {
    return Array.isArray(value) && value.every(nonEmptyString)
        ? value
        : null;
}
function sharesProgressScope(candidate, progress) {
    return candidate.workflowVersion === "5.0.0" &&
        candidate.scopeClass === "run" &&
        candidate.basisId === progress.basisId &&
        candidate.runId === progress.runId &&
        candidate.graphFunctionRef === progress.graphFunctionRef &&
        candidate.graphCallId === progress.graphCallId &&
        candidate.frameId === progress.frameId;
}
function exactAttemptEvent(prior, progress, body) {
    const rows = prior.filter((candidate) => candidate.kind === "retry_attempt_opened" &&
        isRecord(candidate.payload) &&
        candidate.payload.attemptRef === body.attemptRef);
    if (rows.length !== 1)
        return null;
    const event = rows[0];
    const payload = event.payload;
    const { attemptRef: _ref, attemptDigest: _digest, ...attemptBody } = payload;
    const retryPath = positiveIntegerValues(payload.retryPath);
    const retryTermPath = stringValues(payload.retryTermPath);
    const wrappedTermPath = stringValues(payload.wrappedTermPath);
    const retryable = stringValues(payload.retryableFailureClasses);
    const attemptDigest = sha256Canonical(attemptBody);
    const routeRows = prior.filter((candidate) => candidate.kind === "traversal_route_admitted" &&
        sharesProgressScope(candidate, progress) &&
        isRecord(candidate.payload) &&
        candidate.payload.routeKind === "retry" &&
        candidate.payload.routeRef === payload.priorRouteRef &&
        event.causationEventRefs.includes(candidate.eventId));
    return sharesProgressScope(event, progress) &&
        event.aggregateType === "frame" &&
        event.aggregateId === progress.frameId &&
        event.parentAggregateId === progress.graphCallId &&
        event.materializationRef === progress.materializationRef &&
        nonEmptyString(payload.attemptRef) &&
        digestValue(payload.attemptDigest) &&
        payload.attemptDigest === attemptDigest &&
        payload.attemptRef ===
            `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}` &&
        payload.retryBoundaryRef === body.retryBoundaryRef &&
        payload.attempt === body.attempt &&
        retryPath !== null && sameNumbers(retryPath, body.retryPath) &&
        positiveInteger(payload.budget) &&
        Number(payload.attempt) <= Number(payload.budget) &&
        retryTermPath !== null && retryTermPath.length >= 3 &&
        wrappedTermPath !== null &&
        sameStrings(wrappedTermPath, [...retryTermPath, "term"]) &&
        retryable !== null &&
        sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) &&
        (payload.taskOrdinal === null || nonNegativeInteger(payload.taskOrdinal)) &&
        (payload.priorJudgmentRef === null || nonEmptyString(payload.priorJudgmentRef)) &&
        nonEmptyString(payload.priorRouteRef) &&
        event.causationEventRefs.length === 1 && routeRows.length === 1 &&
        event.causationEventRefs[0] === routeRows[0].eventId &&
        nonEmptyString(payload.inputRef) && digestValue(payload.inputDigest) &&
        nonEmptyString(payload.inputContractRef) &&
        isRecord(payload.inputValue) &&
        sha256Canonical(payload.inputValue) === payload.inputDigest
        ? event
        : null;
}
function hasHistoricalAttemptCCallDescent(events, attemptEvent, openedEvent) {
    if (!isRecord(attemptEvent.payload) || !isRecord(openedEvent.payload) ||
        openedEvent.kind !== "c_call_opened" ||
        openedEvent.payload.attempt !== attemptEvent.payload.attempt ||
        !nonEmptyString(openedEvent.payload.programLocusRef) ||
        !sameNumbers(positiveIntegerValues(openedEvent.payload.retryPath) ?? [], positiveIntegerValues(attemptEvent.payload.retryPath) ?? []))
        return false;
    const attemptPayload = attemptEvent.payload;
    const openedPayload = openedEvent.payload;
    const immediateRoutes = events.filter((event) => event.kind === "traversal_route_admitted" &&
        openedEvent.causationEventRefs.includes(event.eventId) &&
        event.runId === openedEvent.runId &&
        event.graphCallId === openedEvent.graphCallId &&
        event.frameId === openedEvent.frameId &&
        isRecord(event.payload) &&
        event.payload.targetCursorRef === openedPayload.cursorRef &&
        event.payload.targetCursorDigest === openedPayload.cursorDigest);
    const originRoutes = events.filter((event) => event.kind === "traversal_route_admitted" &&
        attemptEvent.causationEventRefs.includes(event.eventId) &&
        event.runId === attemptEvent.runId &&
        event.graphCallId === attemptEvent.graphCallId &&
        event.frameId === attemptEvent.frameId &&
        isRecord(event.payload) && event.payload.routeKind === "retry" &&
        event.payload.routeRef === attemptPayload.priorRouteRef);
    if (immediateRoutes.length !== 1 || originRoutes.length !== 1)
        return false;
    const origin = originRoutes[0];
    const pending = [immediateRoutes[0].eventId];
    const visited = new Set();
    const byId = new Map(events.map((event) => [event.eventId, event]));
    while (pending.length !== 0) {
        const eventRef = pending.pop();
        if (eventRef === origin.eventId)
            return true;
        if (visited.has(eventRef))
            continue;
        visited.add(eventRef);
        const event = byId.get(eventRef);
        if (event !== undefined)
            pending.push(...event.causationEventRefs);
    }
    return false;
}
function exactCCallPhaseEvents(prefix, events, progress, cCallRef, resultRef, judgmentRef) {
    let phase;
    try {
        phase = projectCCallPhase(prefix, cCallRef);
    }
    catch {
        return null;
    }
    if (phase.phase !== "judged" || phase.fibreEventRef === null ||
        phase.resultEventRef === null ||
        phase.judgmentEventRef === null)
        return null;
    const opened = events.find((candidate) => candidate.eventId === phase.openedEventRef && candidate.kind === "c_call_opened");
    const fibre = events.find((candidate) => candidate.eventId === phase.fibreEventRef &&
        candidate.kind === "c_call_fibre_selected");
    const result = events.find((candidate) => candidate.eventId === phase.resultEventRef &&
        candidate.kind === "c_call_result_admitted");
    const judgment = events.find((candidate) => candidate.eventId === phase.judgmentEventRef && candidate.kind === "c_call_judged");
    if (opened === undefined || fibre === undefined || result === undefined ||
        judgment === undefined || !isRecord(opened.payload) ||
        !isRecord(fibre.payload) || !isRecord(result.payload) ||
        !isRecord(judgment.payload))
        return null;
    const resultPayload = result.payload;
    const judgmentPayload = judgment.payload;
    if (!sharesProgressScope(opened, progress) ||
        !sharesProgressScope(fibre, progress) ||
        !sharesProgressScope(result, progress) ||
        !sharesProgressScope(judgment, progress) ||
        opened.aggregateType !== "c_call" || opened.aggregateId !== cCallRef ||
        opened.materializationRef !== progress.materializationRef ||
        opened.payload.cCallRef !== cCallRef ||
        fibre.aggregateType !== "c_call" || fibre.aggregateId !== cCallRef ||
        fibre.parentAggregateId !== opened.parentAggregateId ||
        fibre.materializationRef !== progress.materializationRef ||
        fibre.payload.cCallRef !== cCallRef ||
        fibre.causationEventRefs.length !== 1 ||
        fibre.causationEventRefs[0] !== opened.eventId ||
        result.aggregateType !== "c_call" || result.aggregateId !== cCallRef ||
        resultPayload.cCallRef !== cCallRef || resultPayload.resultRef !== resultRef ||
        judgment.aggregateType !== "c_call" || judgment.aggregateId !== cCallRef ||
        judgmentPayload.cCallRef !== cCallRef ||
        judgmentPayload.judgmentRef !== judgmentRef ||
        judgmentPayload.resultRef !== resultRef ||
        judgmentPayload.resultDigest !== resultPayload.resultDigest ||
        !judgment.causationEventRefs.includes(result.eventId))
        return null;
    return Object.freeze({ opened, fibre, result, judgment });
}
function hasExactRetryFailureProvenance(prefix, _events, result, judgment, failureClass, failureSignalRef) {
    if (!WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(failureClass) ||
        !nonEmptyString(failureSignalRef) ||
        !isRecord(result.payload) || !isRecord(judgment.payload) ||
        result.payload.resultClass !== "failure" ||
        judgment.payload.reasonRef !== failureSignalRef ||
        typeof result.payload.resultRef !== "string" ||
        typeof judgment.payload.judgmentRef !== "string")
        return false;
    const signal = projectCCallRuntimeFailureSignal(prefix, result.aggregateId, result.payload.resultRef, judgment.payload.judgmentRef);
    return signal !== null && signal.failureClass === failureClass &&
        signal.failureSignalRef === failureSignalRef;
}
function exactSourceCursorEvent(prior, cCallEvent, sourceCursorRef, sourceCursorDigest) {
    if (!nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
        !isRecord(cCallEvent.payload) ||
        cCallEvent.payload.cursorRef !== sourceCursorRef ||
        cCallEvent.payload.cursorDigest !== sourceCursorDigest)
        return null;
    const rows = prior.filter((candidate) => {
        if (!isRecord(candidate.payload))
            return false;
        return (candidate.kind === "traversal_cursor_entered" &&
            candidate.payload.cursorRef === sourceCursorRef &&
            candidate.payload.cursorDigest === sourceCursorDigest) ||
            (candidate.kind === "traversal_route_admitted" &&
                candidate.payload.targetCursorRef === sourceCursorRef &&
                candidate.payload.targetCursorDigest === sourceCursorDigest) ||
            (candidate.kind === "fh_interaction_resume_admitted" &&
                candidate.payload.successorCursorRef === sourceCursorRef &&
                candidate.payload.successorCursorDigest === sourceCursorDigest);
    });
    return rows.length === 1 && rows[0].admissionOrdinal < cCallEvent.admissionOrdinal
        ? rows[0]
        : null;
}
function exactCursorCarrierEvent(prior, progress, sourceCursorRef, sourceCursorDigest, witnessEventRef) {
    if (!nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
        !nonEmptyString(witnessEventRef))
        return null;
    const candidate = prior.find((event) => event.eventId === witnessEventRef);
    if (candidate === undefined || !isRecord(candidate.payload))
        return null;
    const candidatePayload = candidate.payload;
    const materializationRef = candidate.kind === "fh_interaction_resume_admitted"
        ? prior.find((event) => event.kind === "fh_interaction_opened" &&
            event.aggregateId === candidate.aggregateId &&
            event.eventId === candidatePayload.openedEventRef)?.materializationRef
        : candidate.materializationRef;
    if (candidate.workflowVersion !== "5.0.0" ||
        candidate.scopeClass !== "run" || candidate.runId !== progress.runId ||
        candidate.graphCallId !== progress.graphCallId ||
        candidate.frameId !== progress.frameId ||
        materializationRef !== progress.materializationRef)
        return null;
    const matches = (candidate.kind === "traversal_cursor_entered" &&
        candidate.payload.cursorRef === sourceCursorRef &&
        candidate.payload.cursorDigest === sourceCursorDigest) ||
        (candidate.kind === "traversal_route_admitted" &&
            candidate.payload.targetCursorRef === sourceCursorRef &&
            candidate.payload.targetCursorDigest === sourceCursorDigest) ||
        (candidate.kind === "fh_interaction_resume_admitted" &&
            candidate.payload.successorCursorRef === sourceCursorRef &&
            candidate.payload.successorCursorDigest === sourceCursorDigest);
    return matches ? candidate : null;
}
function exactFanOutCompletionWitness(prefix, prior, progress, body, cCallEvent, resultEvent, judgmentEvent) {
    const witness = prior.find((candidate) => candidate.eventId === body.completionWitnessEventRef &&
        candidate.kind === "fan_out_completion_admitted");
    const projected = typeof body.completionWitnessEventRef === "string"
        ? projectExactFanOutCompletion(prefix, {
            mode: "event_canonical",
            admissionEventRef: body.completionWitnessEventRef,
        })
        : null;
    if (witness === undefined || !sharesProgressScope(witness, progress) ||
        !isRecord(witness.payload) || !isRecord(cCallEvent.payload) ||
        !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
        projected?.kind !== "fan_out_completion_admission" ||
        projected.completionKind !== "complete_vector" ||
        projected.taskRows.length === 0)
        return null;
    const lastRow = projected.taskRows.at(-1);
    return lastRow.cCallRef === body.cCallRef &&
        lastRow.resultRef === body.resultRef &&
        lastRow.judgmentRef === body.judgmentRef &&
        cCallEvent.payload.batchRef === projected.batchRef &&
        resultEvent.payload.resultClass === "success" &&
        judgmentEvent.payload.judgment === "advance" &&
        witness.causationEventRefs.includes(judgmentEvent.eventId)
        ? witness
        : null;
}
function exactFhResumeCompletionWitness(prefix, calculus, authorityPrefix, body, cCallEvent, fibreEvent, resultEvent, judgmentEvent) {
    if (!isRecord(cCallEvent.payload) || !isRecord(fibreEvent.payload) ||
        !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
        fibreEvent.payload.cCallRef !== body.cCallRef ||
        fibreEvent.payload.callClass !== "leaf" ||
        fibreEvent.payload.regime !== "F_H" ||
        resultEvent.payload.resultClass !== "pending" ||
        judgmentEvent.payload.judgment !== "pending")
        return null;
    const continuation = projectFhContinuations(prefix, calculus, authorityPrefix).find((row) => row.status === "resolved" &&
        row.cCallRef === body.cCallRef &&
        row.resumedEventRef === body.completionWitnessEventRef &&
        row.successorCursorRef === body.sourceCursorRef &&
        row.successorCursorDigest === body.sourceCursorDigest);
    if (continuation === undefined || continuation.resumedEventRef === null) {
        return null;
    }
    return indexedRuntimeEvents(prefix, "id:" + continuation.resumedEventRef).find((event) => event.kind === "fh_interaction_resume_admitted" &&
        event.eventId === continuation.resumedEventRef) ?? null;
}
function projectRetryProgressAt(prefix, events, eventIndex, visiting, authorityPrefix) {
    const event = events.at(eventIndex);
    if (event?.kind !== "retry_progress_recorded" ||
        event.runId === undefined || event.graphCallId === undefined ||
        event.frameId === undefined || event.graphFunctionRef === undefined ||
        event.materializationRef === undefined || !isRecord(event.payload) ||
        event.workflowVersion !== "5.0.0" || event.scopeClass !== "run" ||
        event.aggregateType !== "frame" || event.aggregateId !== event.frameId ||
        event.parentAggregateId !== event.graphCallId ||
        visiting.has(event.eventId))
        return null;
    const body = progressBody(event.payload);
    if (body === null ||
        typeof event.payload.progressDigest !== "string" ||
        typeof event.payload.progressRef !== "string")
        return null;
    const digest = sha256Canonical(body);
    const progressRef = `retry-progress://abiogenesis/${digest.slice("sha256:".length)}`;
    if (event.payload.progressDigest !== digest || event.payload.progressRef !== progressRef) {
        return null;
    }
    const attemptRef = body.attemptRef;
    const structuralCompletion = body.completionClass === "structural_identity_success";
    const cCallRef = nonEmptyString(body.cCallRef) ? body.cCallRef : null;
    const resultRef = nonEmptyString(body.resultRef) ? body.resultRef : null;
    const judgmentRef = nonEmptyString(body.judgmentRef)
        ? body.judgmentRef
        : null;
    const retryPath = positiveIntegerValues(body.retryPath);
    if (!nonEmptyString(attemptRef) ||
        (!structuralCompletion &&
            (cCallRef === null || resultRef === null || judgmentRef === null)) ||
        !nonEmptyString(body.retryBoundaryRef) ||
        !positiveInteger(body.attempt) ||
        retryPath === null || body.attempt !== retryPath.at(-1) || eventIndex === 0)
        return null;
    const prior = events.slice(0, eventIndex);
    const priorPrefix = validatedRuntimeEventPrefixThroughEvent(prefix, events.at(eventIndex - 1).eventId);
    let priorAuthorityPrefix;
    try {
        priorAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(authorityPrefix, events.at(eventIndex - 1).eventId);
    }
    catch {
        return null;
    }
    const priorCalculus = deriveRuntimeHeldFluentProjection(priorPrefix);
    const attemptEvent = exactAttemptEvent(prior, event, body);
    const phase = structuralCompletion || cCallRef === null ||
        resultRef === null || judgmentRef === null
        ? null
        : exactCCallPhaseEvents(priorPrefix, prior, event, cCallRef, resultRef, judgmentRef);
    const cCallEvent = phase?.opened ?? null;
    const fibreEvent = phase?.fibre ?? null;
    const resultEvent = phase?.result ?? null;
    const judgmentEvent = phase?.judgment ?? null;
    const cCallPayload = cCallEvent !== null && isRecord(cCallEvent.payload)
        ? cCallEvent.payload
        : null;
    const resultPayload = resultEvent !== null && isRecord(resultEvent.payload)
        ? resultEvent.payload
        : null;
    const judgmentPayload = judgmentEvent !== null && isRecord(judgmentEvent.payload)
        ? judgmentEvent.payload
        : null;
    if (attemptEvent === null ||
        event.causationEventRefs.length !== 2 ||
        event.causationEventRefs[0] !== attemptEvent.eventId ||
        (!structuralCompletion && (cCallEvent === null || fibreEvent === null || resultEvent === null ||
            judgmentEvent === null || cCallPayload === null || resultPayload === null ||
            judgmentPayload === null ||
            cCallPayload.cCallRef !== cCallRef ||
            resultPayload.resultRef !== resultRef ||
            judgmentPayload.judgmentRef !== judgmentRef)) ||
        !holdsAt(priorCalculus, constructScopedRetryFluent("retry_attempt_active", {
            runId: event.runId,
            graphCallId: event.graphCallId,
            frameId: event.frameId,
            retryBoundaryRef: body.retryBoundaryRef,
            authorityRef: attemptRef,
        })))
        return null;
    const failureProgress = event.payload.progressClass === "retry" ||
        event.payload.progressClass === "stopped";
    const propagatedStop = event.payload.progressClass === "stopped" &&
        body.stopReason === "propagated_inner_stop";
    const directCCallOwnership = !propagatedStop &&
        !structuralCompletion &&
        (failureProgress || body.predecessorProgressRef === null);
    const callRetryPath = cCallPayload === null
        ? null
        : positiveIntegerValues(cCallPayload.retryPath);
    if (directCCallOwnership) {
        if (cCallPayload === null || cCallRef === null)
            return null;
        if (callRetryPath === null ||
            (cCallPayload.taskOrdinal !== null &&
                !nonNegativeInteger(cCallPayload.taskOrdinal)) ||
            !positiveInteger(cCallPayload.attempt) ||
            !nonEmptyString(cCallPayload.programLocusRef) ||
            cCallPayload.attempt !== body.attempt ||
            !sameNumbers(callRetryPath, retryPath) ||
            cCallEvent === null ||
            !hasHistoricalAttemptCCallDescent(prior, attemptEvent, cCallEvent))
            return null;
    }
    if (failureProgress) {
        if (cCallPayload === null || resultPayload === null ||
            judgmentPayload === null || cCallRef === null ||
            resultRef === null || judgmentRef === null ||
            resultEvent === null || judgmentEvent === null)
            return null;
        const completedAttempts = positiveIntegerValues(body.completedAttempts);
        const expectedAttempts = Array.from({ length: Number(body.attempt) }, (_, index) => index + 1);
        const priorFailureProgresses = prior.flatMap((candidate, index) => {
            if (candidate.kind !== "retry_progress_recorded" ||
                !isRecord(candidate.payload) ||
                candidate.payload.retryBoundaryRef !== body.retryBoundaryRef ||
                candidate.payload.progressClass !== "retry")
                return [];
            const projected = projectRetryProgressAt(prefix, events, index, new Set([...visiting, event.eventId]), authorityPrefix);
            return projected?.progressClass === "retry" ? [projected] : [];
        });
        const immediatelyPrecedingFailure = priorFailureProgresses.at(-1);
        const stationary = immediatelyPrecedingFailure?.failureSignalRef ===
            body.failureSignalRef;
        const budgetExhausted = Number(body.attempt) >= Number(body.budget);
        const stopped = event.payload.progressClass === "stopped";
        if (!positiveInteger(body.budget) ||
            completedAttempts === null ||
            !sameNumbers(completedAttempts, expectedAttempts) ||
            !nonNegativeInteger(body.remainingBudget) ||
            body.remainingBudget !==
                Math.max(0, Number(body.budget) - Number(body.attempt)) ||
            !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(body.failureClass) ||
            !nonEmptyString(body.failureSignalRef) ||
            !nonEmptyString(body.inputRef) || !digestValue(body.inputDigest) ||
            !nonEmptyString(body.inputContractRef) ||
            !isRecord(attemptEvent.payload) ||
            attemptEvent.payload.budget !== body.budget ||
            attemptEvent.payload.inputRef !== body.inputRef ||
            attemptEvent.payload.inputDigest !== body.inputDigest ||
            attemptEvent.payload.inputContractRef !== body.inputContractRef ||
            !hasExactRetryFailureProvenance(priorPrefix, prior, resultEvent, judgmentEvent, body.failureClass, body.failureSignalRef) ||
            callRetryPath === null ||
            (stopped
                ? body.stopReason !== "boundary_terminal" &&
                    body.stopReason !== "propagated_inner_stop"
                : Object.hasOwn(body, "stopReason") ||
                    Object.hasOwn(body, "predecessorProgressRef")))
            return null;
        if (!propagatedStop) {
            if (judgmentPayload.judgment !== (stopped ? "blocked" : "retry") ||
                judgmentPayload.retryAttemptRef !== attemptRef ||
                event.causationEventRefs[1] !== judgmentEvent.eventId ||
                (stopped
                    ? body.stopReason !== "boundary_terminal" ||
                        body.predecessorProgressRef !== null ||
                        (!budgetExhausted && !stationary)
                    : budgetExhausted || stationary))
                return null;
        }
        else {
            const predecessorIndex = prior.findIndex((candidate) => candidate.eventId === event.causationEventRefs[1]);
            const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(prefix, events, predecessorIndex, new Set([...visiting, event.eventId]), authorityPrefix);
            if (judgmentPayload.judgment !== "blocked" ||
                !nonEmptyString(body.predecessorProgressRef) ||
                predecessorIndex !== eventIndex - 1 ||
                predecessor?.progressClass !== "stopped" ||
                predecessor.progressRef !== body.predecessorProgressRef ||
                predecessor.retryBoundaryRef === body.retryBoundaryRef ||
                predecessor.cCallRef !== cCallRef ||
                predecessor.resultRef !== resultRef ||
                predecessor.judgmentRef !== judgmentRef ||
                predecessor.failureClass !== body.failureClass ||
                predecessor.failureSignalRef !== body.failureSignalRef ||
                !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath) ||
                !sameNumbers(callRetryPath.slice(0, retryPath.length), retryPath) ||
                callRetryPath.length <= retryPath.length)
                return null;
        }
    }
    else {
        const completionClass = body.completionClass;
        if (completionClass !== "judged_success" &&
            completionClass !== "fan_out_success" &&
            completionClass !== "fh_resume_success" &&
            completionClass !== "structural_identity_success")
            return null;
        let sourceCursorEvent = null;
        let completionWitness = null;
        if (completionClass === "structural_identity_success") {
            sourceCursorEvent = exactCursorCarrierEvent(prior, event, body.sourceCursorRef, body.sourceCursorDigest, body.completionWitnessEventRef);
            completionWitness = sourceCursorEvent;
        }
        else {
            if (cCallEvent === null || fibreEvent === null || resultEvent === null ||
                judgmentEvent === null || cCallPayload === null || resultPayload === null ||
                judgmentPayload === null || cCallRef === null || resultRef === null ||
                judgmentRef === null)
                return null;
            if (completionClass === "fh_resume_success") {
                completionWitness = exactFhResumeCompletionWitness(priorPrefix, priorCalculus, priorAuthorityPrefix, body, cCallEvent, fibreEvent, resultEvent, judgmentEvent);
                sourceCursorEvent = completionWitness;
            }
            else {
                sourceCursorEvent = exactSourceCursorEvent(prior, cCallEvent, body.sourceCursorRef, body.sourceCursorDigest);
                completionWitness = completionClass === "fan_out_success"
                    ? exactFanOutCompletionWitness(priorPrefix, prior, event, body, cCallEvent, resultEvent, judgmentEvent)
                    : body.completionWitnessEventRef === judgmentEvent.eventId &&
                        resultPayload.resultClass === "success" &&
                        judgmentPayload.judgment === "advance"
                        ? judgmentEvent
                        : null;
            }
        }
        const targetPairValid = (body.targetCursorRef === null && body.targetCursorDigest === null) ||
            (nonEmptyString(body.targetCursorRef) && digestValue(body.targetCursorDigest));
        if (!positiveInteger(body.completedRetryDepth) ||
            body.completedRetryDepth !== retryPath.length ||
            sourceCursorEvent === null || completionWitness === null ||
            !targetPairValid ||
            (completionClass === "structural_identity_success" &&
                (body.targetCursorRef === null || body.targetCursorDigest === null)) ||
            !holdsAt(priorCalculus, constructRuntimeFluent({
                name: "locus_active",
                identity: body.sourceCursorRef,
            })) ||
            (body.predecessorProgressRef !== null &&
                !nonEmptyString(body.predecessorProgressRef)))
            return null;
        if (body.predecessorProgressRef === null) {
            if ((completionClass !== "structural_identity_success" &&
                judgmentPayload?.retryAttemptRef !== attemptRef) ||
                event.causationEventRefs[1] !== completionWitness.eventId)
                return null;
        }
        else {
            const predecessorIndex = prior.findIndex((candidate) => candidate.eventId === event.causationEventRefs[1]);
            const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(prefix, events, predecessorIndex, new Set([...visiting, event.eventId]), authorityPrefix);
            if (predecessorIndex !== eventIndex - 1 ||
                predecessor?.progressClass !== "completed" ||
                predecessor.progressRef !== body.predecessorProgressRef ||
                predecessor.completedRetryDepth !== Number(body.completedRetryDepth) + 1 ||
                predecessor.retryBoundaryRef === body.retryBoundaryRef ||
                predecessor.completionClass !== completionClass ||
                predecessor.completionWitnessEventRef !==
                    body.completionWitnessEventRef ||
                (completionClass === "structural_identity_success"
                    ? "cCallRef" in predecessor
                    : !("cCallRef" in predecessor) ||
                        predecessor.cCallRef !== cCallRef ||
                        predecessor.resultRef !== resultRef ||
                        predecessor.judgmentRef !== judgmentRef) ||
                predecessor.sourceCursorRef !== body.sourceCursorRef ||
                predecessor.sourceCursorDigest !== body.sourceCursorDigest ||
                predecessor.targetCursorRef !== body.targetCursorRef ||
                predecessor.targetCursorDigest !== body.targetCursorDigest ||
                !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath))
                return null;
        }
    }
    return deepFreeze({
        kind: "retry_progress_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        progressRef,
        progressDigest: digest,
        ...body,
        admissionEventRef: event.eventId,
    });
}
function projectAdmittedRetryProgress(prefix, admissionEventRef, authorityPrefix = prefix) {
    try {
        const historicalPrefix = validatedRuntimeEventPrefixThroughEvent(prefix, admissionEventRef);
        const historicalAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(authorityPrefix, admissionEventRef);
        const events = runtimeEventBodiesAtPrefix(historicalPrefix);
        const eventIndex = events.findIndex((event) => event.eventId === admissionEventRef);
        return eventIndex < 0
            ? null
            : projectRetryProgressAt(historicalPrefix, events, eventIndex, new Set(), historicalAuthorityPrefix);
    }
    catch {
        return null;
    }
}
export function hasStructuralIdentityCompletedRouteCausation(prefix, route, source) {
    const payload = route.payload;
    if (route.kind !== "traversal_route_admitted" || !isRecord(payload) ||
        payload.routeKind !== "advance" || payload.cCallRef !== null ||
        payload.judgmentRef !== null || payload.contractRef !== null ||
        !Array.isArray(payload.consumedAvailabilityRefs) ||
        payload.consumedAvailabilityRefs.length === 0)
        return false;
    const events = runtimeEventBodiesAtPrefix(prefix);
    let previous = null;
    const progressEvents = [];
    for (const ref of payload.consumedAvailabilityRefs) {
        const matches = indexedRuntimeEvents(prefix, "payload:progressRef:" + ref).filter(event => event.kind === "retry_progress_recorded" &&
            isRecord(event.payload) && event.payload.progressRef === ref &&
            event.admissionOrdinal < route.admissionOrdinal);
        if (matches.length !== 1)
            return false;
        const event = matches[0];
        const progress = projectAdmittedRetryProgress(prefix, event.eventId);
        if (progress?.progressClass !== "completed" ||
            progress.completionClass !== "structural_identity_success" ||
            "cCallRef" in progress ||
            progress.completionWitnessEventRef !== source.eventId ||
            progress.sourceCursorRef !== payload.sourceCursorRef ||
            progress.sourceCursorDigest !== payload.sourceCursorDigest ||
            progress.targetCursorRef !== payload.targetCursorRef ||
            progress.targetCursorDigest !== payload.targetCursorDigest ||
            progress.predecessorProgressRef !== (previous?.progressRef ?? null) ||
            previous !== null && progress.completedRetryDepth !== previous.completedRetryDepth - 1 ||
            event.runId !== route.runId || event.graphCallId !== route.graphCallId ||
            event.frameId !== route.frameId || event.basisId !== route.basisId ||
            event.graphFunctionRef !== route.graphFunctionRef ||
            event.materializationRef !== route.materializationRef)
            return false;
        previous = progress;
        progressEvents.push(event);
    }
    // The existing route owner uses last progress first, then the earlier chain
    // in reverse order. Any separately authorized additional causes stay intact.
    return progressEvents.reverse().every((event, index) => route.causationEventRefs[index] === event.eventId);
}
export function hasJudgedTerminalRouteCausation(prefix, route, judgment, authorityPrefix = prefix) {
    const payload = route.payload, source = judgment.payload;
    if (route.kind !== "traversal_route_admitted" || !isRecord(payload) ||
        payload.routeKind !== "terminal" || judgment.kind !== "c_call_judged" ||
        !isRecord(source) || source.judgment !== "advance" ||
        payload.cCallRef !== judgment.aggregateId || payload.judgmentRef !== source.judgmentRef ||
        !Array.isArray(payload.consumedAvailabilityRefs) || payload.consumedAvailabilityRefs[0] !== source.judgmentRef ||
        judgment.runId !== route.runId || judgment.graphCallId !== route.graphCallId ||
        judgment.frameId !== route.frameId || judgment.basisId !== route.basisId)
        return false;
    const refs = payload.consumedAvailabilityRefs.slice(1);
    if (refs.length === 0)
        return route.causationEventRefs.includes(judgment.eventId);
    const events = runtimeEventBodiesAtPrefix(prefix);
    let previous = null;
    const progressEvents = [];
    for (const ref of refs) {
        const matches = indexedRuntimeEvents(prefix, "payload:progressRef:" + ref).filter(event => event.kind === "retry_progress_recorded" &&
            isRecord(event.payload) && event.payload.progressRef === ref && event.admissionOrdinal < route.admissionOrdinal);
        if (matches.length !== 1)
            return false;
        const event = matches[0], progress = projectAdmittedRetryProgress(prefix, event.eventId, authorityPrefix);
        if (progress?.progressClass !== "completed" || progress.completionClass !== "judged_success" ||
            progress.cCallRef !== payload.cCallRef || progress.judgmentRef !== source.judgmentRef ||
            progress.resultRef !== source.resultRef || progress.completionWitnessEventRef !== judgment.eventId ||
            progress.sourceCursorRef !== payload.sourceCursorRef || progress.sourceCursorDigest !== payload.sourceCursorDigest ||
            progress.targetCursorRef !== payload.targetCursorRef || progress.targetCursorDigest !== payload.targetCursorDigest ||
            progress.predecessorProgressRef !== (previous?.progressRef ?? null) ||
            previous !== null && progress.completedRetryDepth !== previous.completedRetryDepth - 1 ||
            event.runId !== route.runId || event.graphCallId !== route.graphCallId || event.frameId !== route.frameId ||
            event.basisId !== route.basisId || event.graphFunctionRef !== route.graphFunctionRef ||
            event.materializationRef !== route.materializationRef)
            return false;
        previous = progress;
        progressEvents.push(event);
    }
    return progressEvents.reverse().every((event, index) => route.causationEventRefs[index] === event.eventId);
}
function routeConsumesRetryProgress(route, progressEvent, progress) {
    return route.admissionOrdinal > progressEvent.admissionOrdinal &&
        route.runId === progressEvent.runId &&
        route.graphCallId === progressEvent.graphCallId &&
        route.frameId === progressEvent.frameId &&
        route.materializationRef === progressEvent.materializationRef &&
        route.consumedAvailabilityRefs.includes(progress.progressRef) &&
        route.causationEventRefs.includes(progressEvent.eventId);
}
function isDeclaredCRetryAttemptOrigin(route) {
    return route.routeKind === "retry" &&
        route.targetCursorRef !== null && route.targetCursorDigest !== null &&
        (route.cCallRef === null) === (route.judgmentRef === null) &&
        (route.cCallRef === null
            ? route.consumedAvailabilityRefs.length === 0
            : route.consumedAvailabilityRefs.length === 2);
}
function isDeclaredCRetryRetryConsumption(route) {
    return route.routeKind === "retry" &&
        route.targetCursorRef !== null && route.targetCursorDigest !== null &&
        route.cCallRef !== null && route.judgmentRef !== null &&
        route.contractRef !== null && route.consumedAvailabilityRefs.length === 2;
}
function isDeclaredCRetryExitConsumption(route) {
    return route.routeKind === "advance" || route.routeKind === "terminal" ||
        route.routeKind === "blocked" || route.routeKind === "failed";
}
function firstProspectiveTerm(term, nodeRef, termPath, taskOrdinal, attempt, retryPath) {
    switch (term.kind) {
        case "c_of":
        case "c_workflow":
        case "c_identity":
            return { term, nodeRef, termPath, taskOrdinal, attempt, retryPath };
        case "c_compose":
            return term.terms[0] === undefined ? null : firstProspectiveTerm(term.terms[0], nodeRef, [...termPath, "terms", "0"], taskOrdinal, attempt, retryPath);
        case "c_edge":
            return firstProspectiveTerm(term.transform, nodeRef, [...termPath, "transform"], taskOrdinal, attempt, retryPath);
        case "c_batch":
            return term.tasks[0] === undefined ? null : firstProspectiveTerm(term.tasks[0], nodeRef, [...termPath, "tasks", "0"], 0, attempt, retryPath);
        case "c_retry":
            return firstProspectiveTerm(term.term, nodeRef, [...termPath, "term"], taskOrdinal, 1, [...retryPath, 1]);
    }
}
function deriveProspectiveCCall(prefix, graph, cursor) {
    const declared = resolveCProgramTermAtSourcePath(graph.template, cursor.currentNodeRef, cursor.termPath);
    if (declared.kind === "c_source_path_refusal")
        return null;
    const prospective = firstProspectiveTerm(declared, cursor.currentNodeRef, cursor.termPath, cursor.taskOrdinal, cursor.attempt, cursor.retryPath);
    if (prospective === null)
        return null;
    const cursorBody = {
        programRef: cursor.programRef,
        executionBasisRef: cursor.executionBasisRef,
        traversalScopeRef: cursor.traversalScopeRef,
        runId: cursor.runId,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        graphRef: cursor.graphRef,
        inputRef: cursor.inputRef,
        inputDigest: cursor.inputDigest,
        currentNodeRef: prospective.nodeRef,
        position: "at_term",
        termPath: prospective.termPath,
        taskOrdinal: prospective.taskOrdinal,
        attempt: prospective.attempt,
        retryPath: prospective.retryPath,
    };
    const prospectiveCursor = constructTraversalCursorCandidate(cursorBody);
    const { cursorRef, cursorDigest } = prospectiveCursor;
    if (prospective.term.kind === "c_identity") {
        return deepFreeze({
            kind: "declared_c_retry_prospective_structural_identity",
            schemaVersion: "5.0.0",
            nodeRef: prospective.nodeRef,
            termPath: prospective.termPath,
            taskOrdinal: prospective.taskOrdinal,
            attempt: prospective.attempt,
            retryPath: prospective.retryPath,
            cursorRef,
            cursorDigest,
        });
    }
    const basis = rehydrateExecutionBasisAtPrefix(prefix, cursor.executionBasisRef);
    if (basis === null)
        return null;
    const commonIdentity = {
        basisId: basis.basisRef,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        vectorIndex: prospective.term.kind === "c_of"
            ? prospective.term.vectorIndex
            : 0,
        stageRole: prospective.term.kind === "c_of"
            ? prospective.term.stageRole
            : "workflow",
        taskOrdinal: prospective.taskOrdinal,
        attempt: prospective.attempt,
        retryPath: prospective.retryPath,
    };
    let programLocusRef;
    let identity;
    if (prospective.term.kind === "c_of") {
        programLocusRef = prospective.term.programLocusRef;
        identity = { ...commonIdentity, programLocusRef };
    }
    else if (prospective.term.kind === "c_workflow") {
        const childGraphFunctionRef = prospective.term.graphFunctionRef;
        const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.rootImplementationSetRef);
        const failureContracts = implementationSet === null ? [] : [
            ...new Set(implementationSet.rows.filter((row) => row.graphFunctionRef === childGraphFunctionRef).map((row) => row.failureContractRef)),
        ];
        if (failureContracts.length !== 1)
            return null;
        const locusDigest = sha256Canonical({
            graphFunctionRef: basis.graphFunctionRef,
            nodeRef: prospective.nodeRef,
            termPath: prospective.termPath,
            childGraphFunctionRef,
        });
        programLocusRef =
            `workflow-locus://abiogenesis/${locusDigest.slice("sha256:".length)}`;
        identity = {
            ...commonIdentity,
            programLocusRef,
            childGraphFunctionRef,
            failureContractRef: failureContracts[0],
        };
    }
    else
        return null;
    const cCallDigest = sha256Canonical(identity);
    return deepFreeze({
        kind: "declared_c_retry_prospective_c_call",
        schemaVersion: "5.0.0",
        callClass: prospective.term.kind === "c_of" ? "leaf" : "workflow",
        cCallRef: `c-call:${cCallDigest}`,
        cCallDigest,
        programLocusRef,
        nodeRef: prospective.nodeRef,
        termPath: prospective.termPath,
        taskOrdinal: prospective.taskOrdinal,
        attempt: prospective.attempt,
        retryPath: prospective.retryPath,
        cursorRef,
        cursorDigest,
    });
}
function typedCCallPhase(prefix, events, graph, graphFunction, cCallRef, sourceCursors) {
    const opened = events.find((event) => event.kind === "c_call_opened" && event.aggregateId === cCallRef &&
        isRecord(event.payload));
    if (opened === undefined || !isRecord(opened.payload))
        return null;
    const openedPayload = opened.payload;
    const sourceCursor = sourceCursors.find((cursor) => cursor.cursorRef === openedPayload.cursorRef &&
        cursor.cursorDigest === openedPayload.cursorDigest);
    if (sourceCursor === undefined)
        return null;
    const cCall = projectOpenedCCallCarrierAtPrefix(prefix, graph, cCallRef, sourceCursor, graphFunction);
    if (cCall === null)
        return null;
    const phaseProjection = projectCCallCarrierPhaseAtPrefix(prefix, cCall);
    if (phaseProjection === null || phaseProjection.phase === "not_open")
        return null;
    if (phaseProjection.phase === "selected_no_evidence" ||
        phaseProjection.phase === "evidencing")
        return deepFreeze({
            kind: "declared_c_retry_c_call_phase",
            schemaVersion: "5.0.0",
            phase: phaseProjection.phase,
            sourceCursor,
            cCall,
            phaseProjection,
            result: null,
            judgment: null,
        });
    const resultEvent = phaseProjection.resultEventRef === null ? undefined :
        events.find((event) => event.eventId === phaseProjection.resultEventRef);
    if (resultEvent?.kind !== "c_call_result_admitted" ||
        !isRecord(resultEvent.payload))
        return null;
    const result = deepFreeze({
        ...resultEvent.payload,
        kind: "admitted_c_call_result",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        admissionEventRef: resultEvent.eventId,
    });
    if (projectAdmittedCCallResultAtPrefix(prefix, cCall, result) === null) {
        return null;
    }
    if (phaseProjection.phase === "result_admitted")
        return deepFreeze({
            kind: "declared_c_retry_c_call_phase",
            schemaVersion: "5.0.0",
            phase: "result_admitted",
            sourceCursor,
            cCall,
            phaseProjection,
            result,
            judgment: null,
        });
    const judgmentEvent = phaseProjection.judgmentEventRef === null ? undefined :
        events.find((event) => event.eventId === phaseProjection.judgmentEventRef);
    if (judgmentEvent?.kind !== "c_call_judged" ||
        !isRecord(judgmentEvent.payload))
        return null;
    const judgment = deepFreeze({
        ...judgmentEvent.payload,
        kind: "admitted_c_call_judgment",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        admissionEventRef: judgmentEvent.eventId,
    });
    if (projectAdmittedCCallOutcomeAtPrefix(prefix, cCall, result, judgment) === null)
        return null;
    return deepFreeze({
        kind: "declared_c_retry_c_call_phase",
        schemaVersion: "5.0.0",
        phase: "judged",
        sourceCursor,
        cCall,
        phaseProjection,
        result,
        judgment,
    });
}
function deriveHistoricalContinuationCursor(prefix, graph, source, completedInput, target) {
    const continuation = deriveAdmittedCContinuationTarget(prefix, graph, source, completedInput);
    if (continuation.kind === "c_source_path_refusal" ||
        continuation.disposition !== "advance" ||
        continuation.nodeRef === null || continuation.termPath === null ||
        continuation.inputRef === null || continuation.inputDigest === null ||
        continuation.attempt === null)
        return null;
    const cursorBody = {
        programRef: source.programRef,
        executionBasisRef: source.executionBasisRef,
        traversalScopeRef: source.traversalScopeRef,
        runId: source.runId,
        graphCallId: source.graphCallId,
        frameId: source.frameId,
        graphRef: source.graphRef,
        inputRef: continuation.inputRef,
        inputDigest: continuation.inputDigest,
        currentNodeRef: continuation.nodeRef,
        position: "at_term",
        termPath: continuation.termPath,
        taskOrdinal: continuation.taskOrdinal,
        attempt: continuation.attempt,
        retryPath: continuation.retryPath,
    };
    const candidate = constructTraversalCursorCandidate(cursorBody);
    return candidate.cursorRef === target.cursorRef &&
        candidate.cursorDigest === target.cursorDigest &&
        hasAdmittedTraversalCursorAtPrefix(prefix, candidate)
        ? candidate
        : null;
}
function projectUniqueStructuralAdvanceLineage(prefix, authorityPrefix, graph, graphFunction, routeEvents, sourceCursor, target, afterAdmissionOrdinal, beforeAdmissionOrdinal) {
    const isTarget = (candidate) => candidate.cursorRef === target.cursorRef &&
        candidate.cursorDigest === target.cursorDigest;
    if (isTarget(sourceCursor))
        return deepFreeze({
            currentCursor: sourceCursor,
            lineage: Object.freeze([]),
        });
    const lineage = [];
    const seen = new Set([
        `${sourceCursor.cursorRef}\0${sourceCursor.cursorDigest}`,
    ]);
    let current = sourceCursor;
    let priorOrdinal = afterAdmissionOrdinal;
    for (let step = 0; step <= routeEvents.length; step += 1) {
        const outgoing = routeEvents.filter((route) => route.admissionOrdinal > afterAdmissionOrdinal &&
            route.admissionOrdinal < beforeAdmissionOrdinal &&
            route.admissionOrdinal > priorOrdinal &&
            route.sourceCursorRef === current.cursorRef &&
            route.sourceCursorDigest === current.cursorDigest);
        if (outgoing.length !== 1)
            return null;
        const route = outgoing[0];
        if (route.routeKind !== "advance" ||
            route.cCallRef !== null || route.judgmentRef !== null ||
            route.contractRef !== null ||
            route.consumedAvailabilityRefs.length !== 0)
            return null;
        const projection = projectDeclaredStructuralAdvanceAtPrefix(prefix, graph, graphFunction, current, route.admissionEventRef, authorityPrefix);
        if (projection === null)
            return null;
        const targetIdentity = `${projection.targetCursor.cursorRef}\0${projection.targetCursor.cursorDigest}`;
        if (seen.has(targetIdentity))
            return null;
        lineage.push(projection);
        seen.add(targetIdentity);
        current = projection.targetCursor;
        priorOrdinal = route.admissionOrdinal;
        if (isTarget(current))
            return deepFreeze({
                currentCursor: current,
                lineage: Object.freeze([...lineage]),
            });
    }
    return null;
}
function projectExactInteractionResumeSuccessorAtPrefix(prefix, heldCursor) {
    if (!isTraversalCursorCandidate(heldCursor))
        return null;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const projections = events.flatMap((resumeEvent) => {
        if (resumeEvent.kind !== "fh_interaction_resume_admitted" ||
            resumeEvent.runId !== heldCursor.runId ||
            resumeEvent.graphCallId !== heldCursor.graphCallId ||
            resumeEvent.frameId !== heldCursor.frameId ||
            !isRecord(resumeEvent.payload) ||
            !nonEmptyString(resumeEvent.payload.openedEventRef) ||
            !nonEmptyString(resumeEvent.payload.continuationRef) ||
            resumeEvent.payload.continuationRef !== resumeEvent.aggregateId ||
            !nonEmptyString(resumeEvent.payload.successorInputRef) ||
            !digestValue(resumeEvent.payload.successorInputDigest) ||
            !nonEmptyString(resumeEvent.payload.successorCursorRef) ||
            !digestValue(resumeEvent.payload.successorCursorDigest))
            return [];
        const resumePayload = resumeEvent.payload;
        const successorInputRef = resumePayload.successorInputRef;
        const successorInputDigest = resumePayload.successorInputDigest;
        const successorCursorRef = resumePayload.successorCursorRef;
        const successorCursorDigest = resumePayload.successorCursorDigest;
        const opened = indexedRuntimeEvents(prefix, "id:" + resumePayload.openedEventRef).filter((event) => event.kind === "fh_interaction_opened" &&
            event.eventId === resumePayload.openedEventRef &&
            event.aggregateId === resumeEvent.aggregateId &&
            event.runId === heldCursor.runId &&
            event.graphCallId === heldCursor.graphCallId &&
            event.frameId === heldCursor.frameId &&
            event.admissionOrdinal < resumeEvent.admissionOrdinal &&
            isRecord(event.payload) &&
            event.payload.continuationRef === event.aggregateId &&
            event.payload.heldCursorRef === heldCursor.cursorRef &&
            event.payload.heldCursorDigest === heldCursor.cursorDigest &&
            sha256Canonical(event.payload.heldCursor) ===
                sha256Canonical(heldCursor));
        if (opened.length !== 1)
            return [];
        const body = {
            programRef: heldCursor.programRef,
            executionBasisRef: heldCursor.executionBasisRef,
            traversalScopeRef: heldCursor.traversalScopeRef,
            runId: heldCursor.runId,
            graphCallId: heldCursor.graphCallId,
            frameId: heldCursor.frameId,
            graphRef: heldCursor.graphRef,
            inputRef: successorInputRef,
            inputDigest: successorInputDigest,
            currentNodeRef: heldCursor.currentNodeRef,
            position: heldCursor.position,
            termPath: heldCursor.termPath,
            taskOrdinal: heldCursor.taskOrdinal,
            attempt: heldCursor.attempt,
            retryPath: heldCursor.retryPath,
        };
        const cursor = constructTraversalCursorCandidate(body);
        return cursor.cursorRef !== heldCursor.cursorRef &&
            cursor.cursorDigest !== heldCursor.cursorDigest &&
            cursor.cursorRef === successorCursorRef &&
            cursor.cursorDigest === successorCursorDigest &&
            isInteractionResumeCursorSuccessorAtPrefix(prefix, heldCursor, {
                inputRef: successorInputRef,
                inputDigest: successorInputDigest,
            }, cursor) &&
            hasAdmittedTraversalCursorAtPrefix(prefix, cursor)
            ? [deepFreeze({ cursor, resumeEventRef: resumeEvent.eventId })]
            : [];
    });
    return projections.length === 1 ? projections[0] : null;
}
export function projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, retryDepth = cursor.retryPath.length, authorityPrefix = prefix) {
    if (!isMaterializedGtlGraph(graph) ||
        !isTraversalCursorCandidate(cursor) ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
        cursor.graphRef !== graph.materializationRef ||
        graphFunction.name !== graph.graphFunctionRef ||
        sha256Canonical(graphFunction) !==
            graph.graphFunctionDigest ||
        !Number.isSafeInteger(retryDepth) || retryDepth < 1 ||
        retryDepth > cursor.retryPath.length)
        return null;
    const contexts = resolveEnclosingCRetryContexts(graph.template, cursor.currentNodeRef, cursor.termPath);
    if ("kind" in contexts)
        return null;
    const context = contexts.find((candidate) => candidate.retryDepth === retryDepth);
    if (context === undefined)
        return null;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const calculus = deriveRuntimeHeldFluentProjection(prefix);
    const boundaryRef = retryBoundaryRef(graph, cursor, context);
    const sameBoundaryEvent = (event) => event.runId === cursor.runId &&
        event.graphCallId === cursor.graphCallId &&
        event.frameId === cursor.frameId &&
        event.aggregateType === "frame" &&
        event.aggregateId === cursor.frameId &&
        event.parentAggregateId === cursor.graphCallId &&
        event.basisId === cursor.executionBasisRef &&
        event.materializationRef === graph.materializationRef &&
        isRecord(event.payload) &&
        event.payload.retryBoundaryRef === boundaryRef;
    const runActive = holdsAt(calculus, constructRuntimeFluent({
        name: "run_active",
        identity: cursor.runId,
    }));
    const attemptEvents = indexedRuntimeEvents(prefix, "kind:" + "retry_attempt_opened").filter((event) => event.kind === "retry_attempt_opened" && sameBoundaryEvent(event));
    const projectedAttempts = attemptEvents.map((event) => ({
        event,
        attempt: projectRetryAttempt(prefix, graph, event.eventId),
        derivedCursor: deriveRetryAttemptCursor(prefix, graph, event),
    })).sort((left, right) => {
        const leftAttempt = left.attempt?.attempt ?? Number.MAX_SAFE_INTEGER;
        const rightAttempt = right.attempt?.attempt ?? Number.MAX_SAFE_INTEGER;
        return leftAttempt - rightAttempt ||
            left.event.admissionOrdinal - right.event.admissionOrdinal;
    });
    const retryPathPrefix = cursor.retryPath.slice(0, retryDepth - 1);
    if (attemptEvents.length > context.budget ||
        projectedAttempts.some(({ attempt, derivedCursor }, index) => attempt === null || derivedCursor === null ||
            attempt.attempt !== index + 1 ||
            attempt.retryBoundaryRef !== boundaryRef ||
            attempt.budget !== context.budget ||
            attempt.retryTermPath.length !== context.retryTermPath.length ||
            !sameStrings(attempt.retryTermPath, context.retryTermPath) ||
            !sameStrings(attempt.wrappedTermPath, context.wrappedTermPath) ||
            attempt.taskOrdinal !== context.taskOrdinal ||
            attempt.inputContractRef !== context.inputCarrierRef ||
            !sameNumbers(attempt.retryPath, [...retryPathPrefix, index + 1]) ||
            derivedCursor.runId !== cursor.runId ||
            derivedCursor.graphCallId !== cursor.graphCallId ||
            derivedCursor.frameId !== cursor.frameId) ||
        new Set(projectedAttempts.map(({ attempt }) => attempt?.attemptManifestRef)).size !== projectedAttempts.length)
        return null;
    const progressEvents = indexedRuntimeEvents(prefix, "kind:" + "retry_progress_recorded").filter((event) => event.kind === "retry_progress_recorded" && sameBoundaryEvent(event));
    const projectedProgresses = progressEvents.map((event) => ({
        event,
        progress: projectAdmittedRetryProgress(prefix, event.eventId, authorityPrefix),
    }));
    if (projectedProgresses.some(({ progress }) => progress === null) ||
        projectedProgresses.length > projectedAttempts.length)
        return null;
    const allRouteProjections = projectHistoricalTraversalRoutesAtPrefix(
    // Route replay is Run-scoped; admission authority may span many Runs.
    selectRuntimeEventPrefixFromAuthority(unscopedRuntimeEventPrefix(prefix), {
        runId: cursor.runId,
    }), authorityPrefix);
    if (allRouteProjections === null)
        return null;
    const routeEvents = allRouteProjections.filter((route) => route.runId === cursor.runId &&
        route.graphCallId === cursor.graphCallId &&
        route.frameId === cursor.frameId &&
        route.executionBasisRef === cursor.executionBasisRef &&
        route.materializationRef === graph.materializationRef);
    if (projectedAttempts.length === 0) {
        const entryRoutes = routeEvents.filter((route) => isDeclaredCRetryAttemptOrigin(route) &&
            route.targetCursorRef === cursor.cursorRef &&
            route.targetCursorDigest === cursor.cursorDigest);
        const entryRouteCandidate = entryRoutes.length === 1
            ? entryRoutes[0]
            : null;
        const entryRoute = entryRouteCandidate !== null &&
            isDeclaredCRetryAttemptOrigin(entryRouteCandidate)
            ? entryRouteCandidate
            : null;
        if (entryRoute === null || progressEvents.length !== 0 ||
            entryRoute.cCallRef !== null || entryRoute.judgmentRef !== null ||
            entryRoute.consumedAvailabilityRefs.length !== 0 ||
            !runActive ||
            !holdsAt(calculus, constructRuntimeFluent({
                name: "locus_active",
                identity: cursor.cursorRef,
            })))
            return null;
        const body = {
            kind: "declared_c_retry_eligible_frontier",
            schemaVersion: "5.0.0",
            disposition: "projected",
            selectedPrefixDigest: runtimeEventPrefixDigest(prefix),
            lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
            runId: cursor.runId,
            graphCallId: cursor.graphCallId,
            frameId: cursor.frameId,
            graphRef: graph.materializationRef,
            retryBoundaryRef: boundaryRef,
            retryTermPath: context.retryTermPath,
            wrappedTermPath: context.wrappedTermPath,
            taskOrdinal: context.taskOrdinal,
            retryDepth,
            budget: context.budget,
            inputCarrierRef: context.inputCarrierRef,
            state: "eligible",
            attemptCoverage: Object.freeze([]),
            progressCoverage: Object.freeze([]),
            rows: Object.freeze([]),
            remainingBudget: context.budget,
            nextAttempt: 1,
            currentCursor: cursor,
            eligibilityRoute: entryRoute,
            latestFailure: null,
            stationarity: deepFreeze({ kind: "not_stationary" }),
        };
        const projectionDigest = sha256Canonical(body);
        return deepFreeze({
            ...body,
            projectionRef: `declared-c-retry-frontier://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
            projectionDigest,
        });
    }
    const rows = [];
    for (const [index, projectedAttempt] of projectedAttempts.entries()) {
        const attempt = projectedAttempt.attempt;
        const attemptEvent = projectedAttempt.event;
        const originRoutes = routeEvents.filter((route) => isDeclaredCRetryAttemptOrigin(route) &&
            attemptEvent.causationEventRefs.length === 1 &&
            attemptEvent.causationEventRefs[0] === route.admissionEventRef &&
            route.admissionOrdinal < attemptEvent.admissionOrdinal &&
            route.routeRef === attempt.priorRouteRef &&
            route.targetCursorRef === projectedAttempt.derivedCursor.cursorRef &&
            route.targetCursorDigest === projectedAttempt.derivedCursor.cursorDigest);
        if (originRoutes.length !== 1)
            return null;
        const originRouteCandidate = originRoutes[0];
        if (!isDeclaredCRetryAttemptOrigin(originRouteCandidate))
            return null;
        const originRoute = originRouteCandidate;
        const progressRows = projectedProgresses.filter(({ progress }) => progress.attempt === attempt.attempt);
        if (progressRows.length > 1 || (index < projectedAttempts.length - 1 &&
            progressRows.length !== 1))
            return null;
        const progressRow = progressRows[0] ?? null;
        const progress = progressRow?.progress ?? null;
        const progressEvent = progressRow?.event ?? null;
        if (progress !== null && (progress.retryBoundaryRef !== boundaryRef ||
            progress.attemptRef !== attempt.attemptRef ||
            !sameNumbers(progress.retryPath, attempt.retryPath) ||
            progressEvent === null ||
            progressEvent.admissionOrdinal <= attemptEvent.admissionOrdinal))
            return null;
        const nextAttemptOrdinal = projectedAttempts[index + 1]?.event
            .admissionOrdinal ?? Number.MAX_SAFE_INTEGER;
        const progressOrdinal = progressEvent?.admissionOrdinal ??
            Number.MAX_SAFE_INTEGER;
        const intervalEnd = Math.min(nextAttemptOrdinal, progressOrdinal);
        const openedEvents = indexedRuntimeEvents(prefix, "basis:" + cursor.executionBasisRef).filter((event) => event.kind === "c_call_opened" &&
            event.runId === cursor.runId &&
            event.graphCallId === cursor.graphCallId &&
            event.frameId === cursor.frameId &&
            event.basisId === cursor.executionBasisRef &&
            event.materializationRef === graph.materializationRef &&
            event.admissionOrdinal > attemptEvent.admissionOrdinal &&
            event.admissionOrdinal < intervalEnd && isRecord(event.payload) &&
            event.payload.attempt === attempt.attempt &&
            sameNumbers(positiveIntegerValues(event.payload.retryPath) ?? [], attempt.retryPath));
        const sourceCursors = [
            projectedAttempt.derivedCursor,
        ];
        const exactCCalls = [];
        const structuralAdvanceLineage = [];
        let foldCursor = projectedAttempt.derivedCursor;
        let foldAdmissionOrdinal = attemptEvent.admissionOrdinal;
        let latestContinuationRoute = null;
        for (const [openedIndex, opened] of openedEvents.entries()) {
            if (!isRecord(opened.payload))
                return null;
            const openedPayload = opened.payload;
            if (typeof openedPayload.cursorRef !== "string" ||
                !digestValue(openedPayload.cursorDigest))
                return null;
            const sourceLineage = projectUniqueStructuralAdvanceLineage(prefix, authorityPrefix, graph, graphFunction, routeEvents, foldCursor, {
                cursorRef: openedPayload.cursorRef,
                cursorDigest: openedPayload.cursorDigest,
            }, foldAdmissionOrdinal, opened.admissionOrdinal);
            if (sourceLineage === null)
                return null;
            structuralAdvanceLineage.push(...sourceLineage.lineage);
            const sourceCursor = sourceLineage.currentCursor;
            if (!sourceCursors.some((candidate) => candidate.cursorRef === sourceCursor.cursorRef &&
                candidate.cursorDigest === sourceCursor.cursorDigest))
                sourceCursors.push(sourceCursor);
            const phase = typedCCallPhase(prefix, events, graph, graphFunction, opened.aggregateId, [sourceCursor]);
            if (phase === null)
                return null;
            exactCCalls.push(phase);
            foldCursor = sourceCursor;
            foldAdmissionOrdinal = opened.admissionOrdinal;
            latestContinuationRoute = null;
            if (phase.phase !== "judged")
                continue;
            const judgmentEvent = indexedRuntimeEvents(prefix, "id:" + phase.judgment.admissionEventRef).find((event) => event.eventId === phase.judgment.admissionEventRef);
            if (judgmentEvent === undefined)
                return null;
            const nextOpenedOrdinal = openedEvents[openedIndex + 1]
                ?.admissionOrdinal ?? intervalEnd;
            const continuationRoutes = routeEvents.filter((route) => route.admissionOrdinal > judgmentEvent.admissionOrdinal &&
                route.admissionOrdinal < nextOpenedOrdinal &&
                route.sourceCursorRef === sourceCursor.cursorRef &&
                route.sourceCursorDigest === sourceCursor.cursorDigest &&
                route.cCallRef === phase.cCall.cCallRef &&
                route.judgmentRef === phase.judgment.judgmentRef);
            if (continuationRoutes.length > 1)
                return null;
            const continuationRoute = continuationRoutes[0] ?? null;
            latestContinuationRoute = continuationRoute;
            if (continuationRoute?.routeKind === "advance" &&
                continuationRoute.targetCursorRef !== null &&
                continuationRoute.targetCursorDigest !== null) {
                const targetCursor = deriveHistoricalContinuationCursor(prefix, graph, sourceCursor, {
                    inputRef: phase.result.resultRef,
                    inputDigest: phase.result.valueDigest,
                }, {
                    cursorRef: continuationRoute.targetCursorRef,
                    cursorDigest: continuationRoute.targetCursorDigest,
                });
                if (targetCursor === null)
                    return null;
                sourceCursors.push(targetCursor);
                foldCursor = targetCursor;
                foldAdmissionOrdinal = continuationRoute.admissionOrdinal;
            }
            else {
                foldAdmissionOrdinal = judgmentEvent.admissionOrdinal;
            }
        }
        if (new Set(exactCCalls.map((phase) => phase.cCall.cCallRef)).size !==
            exactCCalls.length ||
            new Set(structuralAdvanceLineage.map((edge) => edge.route.admissionEventRef)).size !== structuralAdvanceLineage.length)
            return null;
        const attemptActive = holdsAt(calculus, constructScopedRetryFluent("retry_attempt_active", {
            runId: cursor.runId,
            graphCallId: cursor.graphCallId,
            frameId: cursor.frameId,
            retryBoundaryRef: boundaryRef,
            authorityRef: attempt.attemptRef,
        }));
        if ((progress === null) !== attemptActive)
            return null;
        const progressAvailable = progress === null ? false : holdsAt(calculus, constructScopedRetryFluent("retry_progress_available", {
            runId: cursor.runId,
            graphCallId: cursor.graphCallId,
            frameId: cursor.frameId,
            retryBoundaryRef: boundaryRef,
            authorityRef: progress.progressRef,
        }));
        const citingRoutes = progress === null || progressEvent === null
            ? []
            : routeEvents.filter((route) => route.admissionOrdinal > progressEvent.admissionOrdinal &&
                route.consumedAvailabilityRefs.includes(progress.progressRef));
        const consumingRoutes = progress === null || progressEvent === null
            ? []
            : citingRoutes.filter((route) => routeConsumesRetryProgress(route, progressEvent, progress));
        if (citingRoutes.length !== consumingRoutes.length ||
            consumingRoutes.length > 1 ||
            (progress !== null && progressAvailable !== (consumingRoutes.length === 0)))
            return null;
        const consumingRoute = consumingRoutes[0] ?? null;
        if (index === 0) {
            if (attempt.priorJudgmentRef !== null ||
                originRoute.cCallRef !== null || originRoute.judgmentRef !== null ||
                originRoute.consumedAvailabilityRefs.length !== 0)
                return null;
        }
        else {
            const prior = rows[index - 1];
            if (prior.progress === null || prior.progress.progressClass !== "retry" ||
                prior.consumption.kind !== "progress_consumed_by_retry" ||
                prior.consumption.route.admissionEventRef !==
                    originRoute.admissionEventRef ||
                attempt.priorJudgmentRef !== prior.progress.judgmentRef ||
                originRoute.cCallRef !== prior.progress.cCallRef ||
                originRoute.judgmentRef !== prior.progress.judgmentRef ||
                !sameStrings(originRoute.consumedAvailabilityRefs, [prior.progress.judgmentRef, prior.progress.progressRef]) ||
                originRoute.causationEventRefs[0] !== prior.progressEventRef)
                return null;
        }
        if (progress !== null && index < projectedAttempts.length - 1 &&
            progress.progressClass !== "retry")
            return null;
        const rowBase = {
            schemaVersion: "5.0.0",
            attempt,
            attemptEventRef: attemptEvent.eventId,
            attemptAdmissionOrdinal: attemptEvent.admissionOrdinal,
            attemptManifestRef: attempt.attemptManifestRef,
            originRoute,
            cursor: projectedAttempt.derivedCursor,
        };
        if (progress === null) {
            if (index !== projectedAttempts.length - 1)
                return null;
            const unfinished = exactCCalls.filter((phase) => phase.phase !== "judged");
            if (unfinished.length > 1 ||
                (unfinished.length === 1 && unfinished[0] !== exactCCalls.at(-1))) {
                return null;
            }
            const latestCall = exactCCalls.at(-1) ?? null;
            const latestAdvanced = latestCall?.phase === "judged" &&
                latestContinuationRoute?.routeKind === "advance" &&
                latestContinuationRoute.targetCursorRef === foldCursor.cursorRef &&
                latestContinuationRoute.targetCursorDigest === foldCursor.cursorDigest;
            const isAtDirectFrontier = exactCCalls.length === 0 || latestAdvanced;
            const historicalCalls = isAtDirectFrontier
                ? exactCCalls
                : exactCCalls.slice(0, -1);
            for (const historical of historicalCalls) {
                if (historical.phase !== "judged")
                    return null;
                const historicalJudgmentEvent = indexedRuntimeEvents(prefix, "id:" + historical.judgment.admissionEventRef).find((event) => event.eventId === historical.judgment.admissionEventRef);
                if (historicalJudgmentEvent === undefined)
                    return null;
                const consumers = routeEvents.filter((route) => route.admissionOrdinal > historicalJudgmentEvent.admissionOrdinal &&
                    route.causationEventRefs.includes(historicalJudgmentEvent.eventId) &&
                    route.cCallRef === historical.cCall.cCallRef &&
                    route.judgmentRef === historical.judgment.judgmentRef &&
                    route.consumedAvailabilityRefs.includes(historical.judgment.judgmentRef));
                if (consumers.length !== 1)
                    return null;
            }
            if (isAtDirectFrontier && cursor.retryPath.length === retryDepth) {
                if (!sameNumbers(cursor.retryPath, attempt.retryPath))
                    return null;
                const finalLineage = projectUniqueStructuralAdvanceLineage(prefix, authorityPrefix, graph, graphFunction, routeEvents, foldCursor, cursor, foldAdmissionOrdinal, intervalEnd);
                if (finalLineage === null)
                    return null;
                structuralAdvanceLineage.push(...finalLineage.lineage);
                if (new Set(structuralAdvanceLineage.map((edge) => edge.route.admissionEventRef)).size !==
                    structuralAdvanceLineage.length)
                    return null;
                const ownedCursors = [
                    projectedAttempt.derivedCursor,
                    ...sourceCursors,
                    ...structuralAdvanceLineage.map((edge) => edge.targetCursor),
                ].filter((candidate, candidateIndex, candidates) => candidates.findIndex((prior) => prior.cursorRef === candidate.cursorRef &&
                    prior.cursorDigest === candidate.cursorDigest) === candidateIndex);
                const activeCursors = ownedCursors.filter((candidate) => holdsAt(calculus, constructRuntimeFluent({
                    name: "locus_active",
                    identity: candidate.cursorRef,
                })));
                if (activeCursors.length !== 1 ||
                    activeCursors[0].cursorRef !== cursor.cursorRef ||
                    activeCursors[0].cursorDigest !== cursor.cursorDigest)
                    return null;
                const prospective = deriveProspectiveCCall(prefix, graph, cursor);
                if (prospective === null)
                    return null;
                rows.push(deepFreeze({
                    ...rowBase,
                    kind: "declared_c_retry_pre_c_call_attempt",
                    currentCursor: cursor,
                    cCallState: deepFreeze({
                        kind: "not_open",
                        cursorRef: cursor.cursorRef,
                        cursorDigest: cursor.cursorDigest,
                        prospective,
                    }),
                    cCalls: Object.freeze([...exactCCalls]),
                    structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                    progress: null,
                    consumption: deepFreeze({ kind: "attempt_active" }),
                }));
                continue;
            }
            if (isAtDirectFrontier && cursor.retryPath.length > retryDepth &&
                sameNumbers(cursor.retryPath.slice(0, retryDepth), attempt.retryPath)) {
                const inner = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, retryDepth + 1, authorityPrefix);
                const innerEntry = inner?.rows[0] ?? null;
                if (inner?.state !== "attempt_active" ||
                    inner.retryDepth !== retryDepth + 1 ||
                    inner.active.currentCursor.cursorRef !== cursor.cursorRef ||
                    inner.active.currentCursor.cursorDigest !== cursor.cursorDigest ||
                    !sameNumbers(inner.active.attempt.retryPath.slice(0, retryDepth), attempt.retryPath) ||
                    innerEntry === null)
                    return null;
                const lineageToInnerSource = projectUniqueStructuralAdvanceLineage(prefix, authorityPrefix, graph, graphFunction, routeEvents, foldCursor, {
                    cursorRef: innerEntry.originRoute.sourceCursorRef,
                    cursorDigest: innerEntry.originRoute.sourceCursorDigest,
                }, foldAdmissionOrdinal, innerEntry.originRoute.admissionOrdinal);
                if (lineageToInnerSource === null)
                    return null;
                structuralAdvanceLineage.push(...lineageToInnerSource.lineage);
                if (new Set(structuralAdvanceLineage.map((edge) => edge.route.admissionEventRef)).size !==
                    structuralAdvanceLineage.length)
                    return null;
                rows.push(deepFreeze({
                    ...rowBase,
                    kind: "declared_c_retry_nested_active_attempt",
                    currentCursor: cursor,
                    cCalls: Object.freeze([...exactCCalls]),
                    structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                    inner,
                    progress: null,
                    consumption: deepFreeze({ kind: "attempt_active" }),
                }));
                continue;
            }
            if (latestCall === null)
                return null;
            const pending = latestCall.phase === "judged" &&
                latestCall.judgment.judgment === "pending"
                ? latestCall.cCall.regime === "F_H"
                    ? "fh_pending"
                    : "workflow_pending"
                : latestCall.cCall.callClass === "workflow" &&
                    latestCall.phase !== "judged"
                    ? "workflow_pending"
                    : "attempt_active";
            const resumed = pending === "fh_pending"
                ? projectExactInteractionResumeSuccessorAtPrefix(prefix, latestCall.sourceCursor)
                : null;
            if (resumed !== null && (resumed.cursor.cursorRef !== cursor.cursorRef ||
                resumed.cursor.cursorDigest !== cursor.cursorDigest))
                return null;
            rows.push(deepFreeze({
                ...rowBase,
                kind: "declared_c_retry_active_c_call_attempt",
                currentCursor: resumed?.cursor ?? latestCall.sourceCursor,
                cCalls: Object.freeze([...exactCCalls]),
                structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                progress: null,
                consumption: deepFreeze({ kind: pending }),
            }));
            continue;
        }
        if (progressEvent === null)
            return null;
        if (consumingRoute !== null &&
            (progress.progressClass === "retry"
                ? !isDeclaredCRetryRetryConsumption(consumingRoute)
                : !isDeclaredCRetryExitConsumption(consumingRoute)))
            return null;
        const consumption = progressAvailable
            ? deepFreeze({ kind: "progress_available" })
            : progress.progressClass === "retry"
                ? consumingRoute !== null &&
                    isDeclaredCRetryRetryConsumption(consumingRoute)
                    ? deepFreeze({
                        kind: "progress_consumed_by_retry",
                        route: consumingRoute,
                    })
                    : null
                : consumingRoute === null
                    ? null
                    : isDeclaredCRetryExitConsumption(consumingRoute)
                        ? deepFreeze({
                            kind: "progress_consumed_by_exit",
                            route: consumingRoute,
                        })
                        : null;
        if (consumption === null)
            return null;
        const exactTerminalCall = "cCallRef" in progress
            ? typedCCallPhase(prefix, events, graph, graphFunction, progress.cCallRef, sourceCursors)
            : null;
        if (progress.progressClass === "retry") {
            if (exactTerminalCall?.phase !== "judged" ||
                exactTerminalCall.result.resultRef !== progress.resultRef ||
                exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
                exactTerminalCall.judgment.judgment !== "retry" ||
                exactTerminalCall.judgment.retryAttemptRef !== attempt.attemptRef)
                return null;
            const signal = projectCCallRuntimeFailureSignal(prefix, progress.cCallRef, progress.resultRef, progress.judgmentRef);
            if (signal?.failureClass !== progress.failureClass ||
                signal.failureSignalRef !== progress.failureSignalRef)
                return null;
            rows.push(deepFreeze({
                ...rowBase,
                kind: "declared_c_retry_retry_progress",
                cCalls: Object.freeze([...exactCCalls]),
                structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                progress,
                progressEventRef: progressEvent.eventId,
                failureCCall: exactTerminalCall,
                consumption: consumption,
            }));
            continue;
        }
        if (progress.progressClass === "stopped") {
            if (progress.stopReason === "boundary_terminal") {
                if (progress.predecessorProgressRef !== null ||
                    exactTerminalCall?.phase !== "judged" ||
                    exactTerminalCall.result.resultRef !== progress.resultRef ||
                    exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
                    exactTerminalCall.judgment.judgment !== "blocked")
                    return null;
                rows.push(deepFreeze({
                    ...rowBase,
                    kind: "declared_c_retry_boundary_stopped_progress",
                    cCalls: Object.freeze([...exactCCalls]),
                    structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                    progress: progress,
                    progressEventRef: progressEvent.eventId,
                    failureCCall: exactTerminalCall,
                    consumption: consumption,
                }));
                continue;
            }
            if (progress.stopReason !== "propagated_inner_stop" ||
                progress.predecessorProgressRef === null || exactCCalls.length !== 0 ||
                retryDepth >= cursor.retryPath.length)
                return null;
            const inner = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, retryDepth + 1, authorityPrefix);
            const predecessor = inner?.rows.find((candidate) => (candidate.kind === "declared_c_retry_boundary_stopped_progress" ||
                candidate.kind === "declared_c_retry_propagated_stopped_progress") &&
                candidate.progress.progressRef === progress.predecessorProgressRef);
            if (predecessor === undefined ||
                progressEvent.causationEventRefs[1] !== predecessor.progressEventRef)
                return null;
            rows.push(deepFreeze({
                ...rowBase,
                kind: "declared_c_retry_propagated_stopped_progress",
                cCalls: Object.freeze([]),
                progress: progress,
                progressEventRef: progressEvent.eventId,
                predecessor,
                consumption: consumption,
            }));
            continue;
        }
        if (progress.predecessorProgressRef !== null) {
            if (exactCCalls.length !== 0 ||
                retryDepth >= cursor.retryPath.length)
                return null;
            const inner = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, retryDepth + 1, authorityPrefix);
            const predecessor = inner?.rows.find((candidate) => (candidate.kind === "declared_c_retry_c_call_completed_progress" ||
                candidate.kind ===
                    "declared_c_retry_structural_completed_progress" ||
                candidate.kind ===
                    "declared_c_retry_propagated_completed_progress") &&
                candidate.progress.progressRef === progress.predecessorProgressRef);
            if (inner === null || inner.retryDepth !== retryDepth + 1 ||
                predecessor === undefined ||
                predecessor.progress.completedRetryDepth !== retryDepth + 1 ||
                !sameNumbers(predecessor.attempt.retryPath.slice(0, retryDepth), attempt.retryPath) ||
                progressEvent.causationEventRefs[1] !== predecessor.progressEventRef)
                return null;
            rows.push(deepFreeze({
                ...rowBase,
                kind: "declared_c_retry_propagated_completed_progress",
                cCalls: Object.freeze([]),
                progress: progress,
                progressEventRef: progressEvent.eventId,
                predecessor,
                consumption: consumption,
            }));
            continue;
        }
        if (progress.completionClass === "structural_identity_success") {
            const witness = indexedRuntimeEvents(prefix, "id:" + progress.completionWitnessEventRef).find((event) => event.eventId === progress.completionWitnessEventRef);
            const completionLineage = projectUniqueStructuralAdvanceLineage(prefix, authorityPrefix, graph, graphFunction, routeEvents, foldCursor, {
                cursorRef: progress.sourceCursorRef,
                cursorDigest: progress.sourceCursorDigest,
            }, foldAdmissionOrdinal, progressEvent.admissionOrdinal);
            if (witness === undefined || completionLineage === null ||
                exactCCalls.length !== 0 ||
                progress.predecessorProgressRef !== null ||
                progressEvent.causationEventRefs[1] !== witness.eventId)
                return null;
            structuralAdvanceLineage.push(...completionLineage.lineage);
            if (new Set(structuralAdvanceLineage.map((edge) => edge.route.admissionEventRef)).size !==
                structuralAdvanceLineage.length)
                return null;
            rows.push(deepFreeze({
                ...rowBase,
                kind: "declared_c_retry_structural_completed_progress",
                cCalls: Object.freeze([]),
                structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
                progress,
                progressEventRef: progressEvent.eventId,
                completionWitnessEventRef: witness.eventId,
                consumption: consumption,
            }));
            continue;
        }
        if (progress.predecessorProgressRef !== null ||
            exactTerminalCall?.phase !== "judged" ||
            exactTerminalCall.result.resultRef !== progress.resultRef ||
            exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
            (progress.completionClass === "fh_resume_success"
                ? exactTerminalCall.judgment.judgment !== "pending"
                : exactTerminalCall.judgment.judgment !== "advance"))
            return null;
        rows.push(deepFreeze({
            ...rowBase,
            kind: "declared_c_retry_c_call_completed_progress",
            cCalls: Object.freeze([...exactCCalls]),
            structuralAdvanceLineage: Object.freeze([...structuralAdvanceLineage]),
            progress,
            progressEventRef: progressEvent.eventId,
            completionCCall: exactTerminalCall,
            consumption: consumption,
        }));
    }
    const latest = rows.at(-1) ?? null;
    if (latest === null)
        return null;
    const retryFailureProgresses = rows.flatMap(({ progress }) => progress?.progressClass === "retry" ? [progress] : []);
    const latestFailure = retryFailureProgresses.at(-1) ?? null;
    const priorFailure = retryFailureProgresses.at(-2) ?? null;
    const common = {
        schemaVersion: "5.0.0",
        disposition: "projected",
        selectedPrefixDigest: runtimeEventPrefixDigest(prefix),
        lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
        runId: cursor.runId,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        graphRef: graph.materializationRef,
        retryBoundaryRef: boundaryRef,
        retryTermPath: context.retryTermPath,
        wrappedTermPath: context.wrappedTermPath,
        taskOrdinal: context.taskOrdinal,
        retryDepth,
        budget: context.budget,
        inputCarrierRef: context.inputCarrierRef,
        attemptCoverage: rows.map((row) => row.attempt.attempt),
        progressCoverage: rows.flatMap((row) => row.progress === null ? [] : [row.progress.attempt]),
        rows,
        remainingBudget: Math.max(0, context.budget - rows.length),
    };
    let body;
    if (latest.progress === null) {
        if (!runActive)
            return null;
        body = {
            ...common,
            kind: "declared_c_retry_active_frontier",
            state: "attempt_active",
            active: latest,
        };
    }
    else if (latest.consumption.kind === "progress_available") {
        if (!runActive)
            return null;
        body = {
            ...common,
            kind: "declared_c_retry_available_progress_frontier",
            state: "progress_available",
            available: latest,
        };
    }
    else if (latest.progress.progressClass === "retry" &&
        latest.consumption.kind === "progress_consumed_by_retry") {
        if (!runActive ||
            rows.length >= context.budget ||
            latest.consumption.route.targetCursorRef !== cursor.cursorRef ||
            latest.consumption.route.targetCursorDigest !== cursor.cursorDigest ||
            !holdsAt(calculus, constructRuntimeFluent({
                name: "locus_active",
                identity: cursor.cursorRef,
            })))
            return null;
        const stationary = priorFailure !== null && latestFailure !== null &&
            priorFailure.failureSignalRef === latestFailure.failureSignalRef
            ? deepFreeze({
                kind: "stationary",
                failureSignalRef: latestFailure.failureSignalRef,
                priorProgressRef: priorFailure.progressRef,
                currentProgressRef: latestFailure.progressRef,
            })
            : deepFreeze({ kind: "not_stationary" });
        body = {
            ...common,
            kind: "declared_c_retry_eligible_frontier",
            state: "eligible",
            nextAttempt: rows.length + 1,
            currentCursor: cursor,
            eligibilityRoute: latest.consumption.route,
            latestFailure,
            stationarity: stationary,
        };
    }
    else {
        if (latest.consumption.kind !== "progress_consumed_by_exit" ||
            latest.progress.progressClass === "retry" ||
            latest.kind === "declared_c_retry_retry_progress")
            return null;
        body = {
            ...common,
            kind: "declared_c_retry_consumed_frontier",
            state: "progress_consumed",
            consumed: latest,
        };
    }
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `declared-c-retry-frontier://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
export function projectDeclaredCRetryExitProgress(prefix, graph, graphFunction, sourceCursor, targetCursor, authorityPrefix = prefix) {
    const sourceTopology = deriveCEnclosingRetryTopology(graph, {
        nodeRef: sourceCursor.currentNodeRef,
        termPath: sourceCursor.termPath,
    });
    const targetTopology = deriveCEnclosingRetryTopology(graph, targetCursor === null
        ? null
        : {
            nodeRef: targetCursor.currentNodeRef,
            termPath: targetCursor.termPath,
        });
    if (sourceTopology.kind === "c_source_path_refusal" ||
        targetTopology.kind === "c_source_path_refusal")
        return null;
    const partition = deriveCanonicalRootedTopologyPartition(sourceTopology.witness, targetTopology.witness);
    if (partition.kind === "canonical_rooted_topology_partition_refusal" ||
        partition.entered.length !== 0 ||
        partition.preserved.length !== targetTopology.entries.length)
        return null;
    const contextBySegmentRef = new Map(sourceTopology.entries.map((entry) => [
        entry.segmentRef,
        entry.context,
    ]));
    const exited = partition.exited.map((segmentRef) => contextBySegmentRef.get(segmentRef));
    if (exited.some((context) => context === undefined))
        return null;
    const exitedRetryDepths = exited.map((context) => context.retryDepth);
    const progresses = exitedRetryDepths.map((retryDepth) => {
        const frontier = projectDeclaredCRetryFrontier(prefix, graph, sourceCursor, graphFunction, retryDepth, authorityPrefix);
        return frontier?.state === "progress_available"
            ? frontier.available.progress
            : null;
    });
    if (progresses.every((progress) => progress === null)) {
        return deepFreeze({
            kind: "declared_c_retry_exit_progress",
            schemaVersion: "5.0.0",
            progressClass: "none",
            exitedRetryDepths,
            progresses: Object.freeze([]),
        });
    }
    if (progresses.some((progress) => progress === null))
        return null;
    const exact = progresses;
    if (exact.every((progress) => progress.progressClass === "completed")) {
        if (exact.some((progress, index) => progress.predecessorProgressRef !==
            (index === 0 ? null : exact[index - 1].progressRef)))
            return null;
        return deepFreeze({
            kind: "declared_c_retry_exit_progress",
            schemaVersion: "5.0.0",
            progressClass: "completed",
            exitedRetryDepths,
            progresses: exact,
        });
    }
    if (exact.every((progress) => progress.progressClass === "stopped")) {
        if (exact.some((progress, index) => progress.predecessorProgressRef !==
            (index === 0 ? null : exact[index - 1].progressRef) ||
            (index === 0
                ? progress.stopReason !== "boundary_terminal"
                : progress.stopReason !== "propagated_inner_stop")))
            return null;
        return deepFreeze({
            kind: "declared_c_retry_exit_progress",
            schemaVersion: "5.0.0",
            progressClass: "stopped",
            exitedRetryDepths,
            progresses: exact,
        });
    }
    return null;
}
export function projectDeclaredCRetryCCallWriteAtPrefix(prefix, authorityPrefix, graph, graphFunction, cursor, candidate, phase) {
    const frontier = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, cursor.retryPath.length, authorityPrefix);
    if (frontier?.state !== "attempt_active" ||
        frontier.active.currentCursor.cursorRef !== cursor.cursorRef ||
        frontier.active.currentCursor.cursorDigest !== cursor.cursorDigest)
        return null;
    if (phase === "not_open") {
        return candidate.kind === "declared_c_retry_prospective_c_call_candidate" &&
            frontier.active.kind === "declared_c_retry_pre_c_call_attempt" &&
            frontier.active.cCallState.prospective.kind ===
                "declared_c_retry_prospective_c_call" &&
            frontier.active.cCallState.prospective.cCallRef === candidate.cCallRef &&
            frontier.active.cCallState.prospective.cCallDigest ===
                candidate.cCallDigest &&
            frontier.active.cCallState.cursorRef === cursor.cursorRef &&
            frontier.active.cCallState.cursorDigest === cursor.cursorDigest
            ? frontier
            : null;
    }
    if (candidate.kind !== "c_call" ||
        candidate.retryPath.length === 0 ||
        candidate.runId !== cursor.runId ||
        candidate.graphCallId !== cursor.graphCallId ||
        candidate.frameId !== cursor.frameId ||
        candidate.basisId !== cursor.executionBasisRef ||
        candidate.graphFunctionRef !== graphFunction.name ||
        candidate.attempt !== cursor.attempt ||
        !sameNumbers(candidate.retryPath, cursor.retryPath) ||
        frontier.active.kind !== "declared_c_retry_active_c_call_attempt")
        return null;
    const matches = frontier.active.cCalls.filter((exact) => exact.phase === phase &&
        exact.sourceCursor.cursorRef === cursor.cursorRef &&
        exact.sourceCursor.cursorDigest === cursor.cursorDigest &&
        sha256Canonical(exact.cCall) ===
            sha256Canonical(candidate));
    return matches.length === 1 && matches[0] === frontier.active.cCalls.at(-1)
        ? frontier
        : null;
}
const RETRY_FRONTIER_SOURCE_KINDS = Object.freeze([
    "retry_attempt_opened",
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "retry_progress_recorded",
]);
function executableRetryInputRefusal(request, code, message, citedSourceEventRefs = []) {
    const prefixDigest = typeof request.prefix?.prefixDigest === "string" &&
        request.prefix.prefixDigest.startsWith("sha256:")
        ? request.prefix.prefixDigest
        : null;
    return deepFreeze({
        kind: "executable_retry_input_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
        selector: request.selector,
        suppliedPrefixDigest: prefixDigest,
        citedSourceEventRefs: [...citedSourceEventRefs],
    });
}
function isRetryFrontierSelector(value) {
    return value.kind === "retry_frontier_selector" &&
        value.schemaVersion === "5.0.0" &&
        Object.keys(value).length === 7 &&
        nonEmptyString(value.runId) &&
        nonEmptyString(value.graphCallId) &&
        nonEmptyString(value.frameId) &&
        nonEmptyString(value.retryBoundaryRef) &&
        nonEmptyString(value.retryProgressRef);
}
function retryFrontierSource(event, ownerSurface) {
    if (!RETRY_FRONTIER_SOURCE_KINDS.includes(event.kind))
        return null;
    return deepFreeze({
        eventRef: event.eventId,
        admissionOrdinal: event.admissionOrdinal,
        payloadDigest: event.payloadDigest,
        eventKind: event.kind,
        ownerSurface,
    });
}
function retryFrontierRowBody(row) {
    const { rowRef: _rowRef, rowDigest: _rowDigest, ...body } = row;
    return body;
}
function retryFrontierBody(frontier) {
    const { frontierRef: _frontierRef, frontierDigest: _frontierDigest, ...body } = frontier;
    return body;
}
function sortedUnique(values) {
    return [...new Set(values)].sort();
}
function structurallyFullRetryAttemptFrontier(frontier) {
    if (frontier.kind !== "retry_attempt_frontier" ||
        frontier.schemaVersion !== "5.0.0" ||
        frontier.isFullFrontier !== true ||
        frontier.rows.length === 0 ||
        !nonEmptyString(frontier.declaredFrontierRef) ||
        !digestValue(frontier.declaredFrontierDigest) ||
        !nonEmptyString(frontier.retryBoundaryRef) ||
        !nonEmptyString(frontier.runId) ||
        !nonEmptyString(frontier.graphCallId) ||
        !nonEmptyString(frontier.frameId))
        return false;
    for (const [index, row] of frontier.rows.entries()) {
        const sources = row.sources;
        const sourceVector = [
            sources.attempt,
            sources.cCallOpened,
            sources.fibreSelected,
            ...(sources.evidence === null ? [] : [sources.evidence]),
            sources.result,
            sources.judgment,
            sources.progress,
        ];
        const expectedDigest = sha256Canonical(retryFrontierRowBody(row));
        if (row.kind !== "retry_attempt_frontier_row" ||
            row.schemaVersion !== "5.0.0" ||
            row.retryBoundaryRef !== frontier.retryBoundaryRef ||
            row.attempt !== index + 1 ||
            row.retryPath.at(-1) !== row.attempt ||
            row.rowDigest !== expectedDigest ||
            row.rowRef !==
                `retry-attempt-frontier-row://abiogenesis/${expectedDigest.slice("sha256:".length)}` ||
            sources.attempt.eventKind !== "retry_attempt_opened" ||
            sources.attempt.ownerSurface !== "abg_retry" ||
            sources.cCallOpened.eventKind !== "c_call_opened" ||
            sources.cCallOpened.ownerSurface !== "abg_c_call" ||
            sources.fibreSelected.eventKind !== "c_call_fibre_selected" ||
            sources.fibreSelected.ownerSurface !== "abg_c_call" ||
            (sources.evidence !== null &&
                (sources.evidence.eventKind !== "c_call_evidenced" ||
                    sources.evidence.ownerSurface !== "abg_c_call")) ||
            sources.result.eventKind !== "c_call_result_admitted" ||
            sources.result.ownerSurface !== "abg_c_call" ||
            sources.judgment.eventKind !== "c_call_judged" ||
            sources.judgment.ownerSurface !== "abg_c_call" ||
            sources.progress.eventKind !== "retry_progress_recorded" ||
            sources.progress.ownerSurface !== "abg_retry" ||
            sourceVector.some((source) => !nonEmptyString(source.eventRef) ||
                !Number.isSafeInteger(source.admissionOrdinal) ||
                source.admissionOrdinal < 0 ||
                !digestValue(source.payloadDigest)))
            return false;
    }
    const expectedCoverage = frontier.rows.map((row) => row.attempt);
    const expectedReasons = sortedUnique(frontier.rows.map((row) => row.reasonClass));
    const allSources = frontier.rows.flatMap((row) => [
        row.sources.attempt,
        row.sources.cCallOpened,
        row.sources.fibreSelected,
        ...(row.sources.evidence === null ? [] : [row.sources.evidence]),
        row.sources.result,
        row.sources.judgment,
        row.sources.progress,
    ]);
    const expectedOwners = sortedUnique(allSources.map((source) => source.ownerSurface));
    const expectedKinds = sortedUnique(allSources.map((source) => source.eventKind));
    const expectedDigest = sha256Canonical(retryFrontierBody(frontier));
    return sameNumbers(frontier.attemptCoverage, expectedCoverage) &&
        sameStrings(frontier.reasonClasses, expectedReasons) &&
        sameStrings(frontier.ownerSurfaces, expectedOwners) &&
        sameStrings(frontier.sourceEventKinds, expectedKinds) &&
        frontier.frontierDigest === expectedDigest &&
        frontier.frontierRef ===
            `retry-attempt-frontier://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
}
export function assertFullRetryAttemptFrontier(frontier) {
    if (!structurallyFullRetryAttemptFrontier(frontier)) {
        throw new TypeError("retry attempt frontier is not structurally full");
    }
}
function constructRetryAttemptFrontierRow(input) {
    const sources = {
        attempt: retryFrontierSource(input.attemptEvent, "abg_retry"),
        cCallOpened: retryFrontierSource(input.openedEvent, "abg_c_call"),
        fibreSelected: retryFrontierSource(input.fibreEvent, "abg_c_call"),
        evidence: input.evidenceEvent === null
            ? null
            : retryFrontierSource(input.evidenceEvent, "abg_c_call"),
        result: retryFrontierSource(input.resultEvent, "abg_c_call"),
        judgment: retryFrontierSource(input.judgmentEvent, "abg_c_call"),
        progress: retryFrontierSource(input.progressEvent, "abg_retry"),
    };
    if (sources.attempt === null || sources.cCallOpened === null ||
        sources.fibreSelected === null || sources.result === null ||
        sources.judgment === null || sources.progress === null ||
        (input.evidenceEvent !== null && sources.evidence === null))
        return null;
    const body = {
        kind: "retry_attempt_frontier_row",
        schemaVersion: "5.0.0",
        retryBoundaryRef: input.retryBoundaryRef,
        attempt: input.attempt.attempt,
        retryPath: input.attempt.retryPath,
        attemptRef: input.attempt.attemptRef,
        attemptDigest: input.attempt.attemptDigest,
        cCallRef: input.cCall.cCallRef,
        cCallDigest: input.cCall.cCallDigest,
        progressRef: input.progress.progressRef,
        progressDigest: input.progress.progressDigest,
        reasonClass: input.progress.failureClass,
        failureSignalRef: input.progress.failureSignalRef,
        inputContractRef: input.attempt.inputContractRef,
        inputRef: input.attempt.inputRef,
        inputDigest: input.attempt.inputDigest,
        sources: deepFreeze(sources),
    };
    const rowDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        rowRef: `retry-attempt-frontier-row://abiogenesis/${rowDigest.slice("sha256:".length)}`,
        rowDigest,
    });
}
function rehydrateRetryTraversalScope(prefix, events, executionBasis, cursor) {
    const graphCallRows = events.filter((event) => event.kind === "graph_call_opened" &&
        event.aggregateId === cursor.graphCallId &&
        event.runId === cursor.runId &&
        event.basisId === executionBasis.basisRef &&
        isRecord(event.payload) && digestValue(event.payload.graphCallDigest));
    const runRows = events.filter((event) => event.kind === "run_segment_opened" &&
        event.aggregateId === cursor.runId &&
        graphCallRows.some((graphCall) => graphCall.causationEventRefs.includes(event.eventId)) &&
        isRecord(event.payload) && digestValue(event.payload.runDigest));
    const frameRows = events.filter((event) => event.kind === "frame_opened" &&
        event.aggregateId === cursor.frameId &&
        event.runId === cursor.runId &&
        event.graphCallId === cursor.graphCallId &&
        event.basisId === executionBasis.basisRef &&
        isRecord(event.payload) && digestValue(event.payload.frameDigest) &&
        nonEmptyString(event.payload.frameLineageId));
    if (runRows.length !== 1 || graphCallRows.length !== 1 || frameRows.length !== 1)
        return null;
    const run = runRows[0];
    const graphCall = graphCallRows[0];
    const frame = frameRows[0];
    const scopeBody = {
        executionBasisRef: executionBasis.basisRef,
        executionBasisDigest: executionBasis.basisDigest,
        invocationAdmissionRef: executionBasis.invocationAdmissionRef,
        invocationRef: executionBasis.invocationRef,
        programRef: executionBasis.programRef,
        graphFunctionRef: executionBasis.graphFunctionRef,
        graphRef: executionBasis.graphRef,
        runId: cursor.runId,
        runDigest: run.payload
            .runDigest,
        runOpenEventRef: run.eventId,
        graphCallId: cursor.graphCallId,
        graphCallDigest: graphCall.payload
            .graphCallDigest,
        graphCallOpenEventRef: graphCall.eventId,
        frameId: cursor.frameId,
        frameDigest: frame.payload
            .frameDigest,
        frameLineageId: frame.payload
            .frameLineageId,
        frameOpenEventRef: frame.eventId,
    };
    const scopeDigest = sha256Canonical(scopeBody);
    const scopeRef = `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`;
    if (scopeRef !== cursor.traversalScopeRef)
        return null;
    return rehydrateOpenedTraversalScopeAtPrefix(prefix, {
        scopeRef,
        scopeDigest,
        ...scopeBody,
    });
}
export function projectExecutableRetryInput(request) {
    if (!isRetryFrontierSelector(request.selector)) {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "retry frontier selector is not one exact closed selector");
    }
    let prefix;
    let authorityPrefix;
    let events;
    let lastAdmissionOrdinal;
    try {
        const durableEvents = readRuntimeEventsAtDurablePrefix(request.prefix);
        lastAdmissionOrdinal = durableEvents.at(-1)?.admissionOrdinal ?? -1;
        authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
        prefix = selectValidatedRuntimeEventPrefix(runtimeEventBodiesAtPrefix(authorityPrefix), { runId: request.selector.runId });
        events = runtimeEventBodiesAtPrefix(prefix);
    }
    catch {
        return executableRetryInputRefusal(request, "prefix_mismatch", "retry input projection requires one exact durable event prefix");
    }
    const selector = request.selector;
    const selectedProgressEvents = events.filter((event) => event.kind === "retry_progress_recorded" &&
        event.runId === selector.runId &&
        event.graphCallId === selector.graphCallId &&
        event.frameId === selector.frameId &&
        isRecord(event.payload) &&
        event.payload.retryBoundaryRef === selector.retryBoundaryRef &&
        event.payload.progressRef === selector.retryProgressRef);
    if (selectedProgressEvents.length !== 1) {
        return executableRetryInputRefusal(request, selectedProgressEvents.length === 0
            ? "frontier_absent"
            : "frontier_ambiguous", "retry frontier selector must identify exactly one admitted progress event", selectedProgressEvents.map((event) => event.eventId));
    }
    const selectedProgressEvent = selectedProgressEvents[0];
    const selectorProgress = projectAdmittedRetryProgress(prefix, selectedProgressEvent.eventId, authorityPrefix);
    if (selectorProgress === null || selectorProgress.progressClass !== "retry" ||
        selectedProgressEvent.causationEventRefs.length !== 2) {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "selected retry progress is not one exact executable retry continuation", [selectedProgressEvent.eventId]);
    }
    const citedAttemptEventRef = selectedProgressEvent.causationEventRefs[0];
    const citedAttemptEvents = events.filter((event) => event.kind === "retry_attempt_opened" &&
        event.eventId === citedAttemptEventRef &&
        isRecord(event.payload) &&
        event.payload.attemptRef === selectorProgress.attemptRef);
    if (citedAttemptEvents.length !== 1) {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "selected retry progress must cite exactly one matching attempt event", [selectedProgressEvent.eventId, citedAttemptEventRef]);
    }
    const selectedAttemptEvent = citedAttemptEvents[0];
    const sourceCursor = deriveRetryAttemptCursor(prefix, request.graph, selectedAttemptEvent);
    if (sourceCursor === null) {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "selected retry attempt does not derive one exact admitted source cursor", [selectedProgressEvent.eventId, selectedAttemptEvent.eventId]);
    }
    const executionBasis = rehydrateExecutionBasisAtPrefix(prefix, sourceCursor.executionBasisRef);
    const programDigest = sha256Canonical(request.program);
    const graphFunctionDigest = sha256Canonical(request.graphFunction);
    if (executionBasis === null ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
        !isMaterializedGtlGraph(request.graph) ||
        request.program.kind !== "gtl_program" ||
        request.graphFunction.kind !== "graph_function" ||
        sourceCursor.executionBasisRef !== executionBasis.basisRef ||
        sourceCursor.programRef !== executionBasis.programRef ||
        sourceCursor.graphRef !== executionBasis.graphRef ||
        request.program.programRef !== executionBasis.programRef ||
        programDigest !== executionBasis.programDigest ||
        request.graphFunction.name !== executionBasis.graphFunctionRef ||
        graphFunctionDigest !== executionBasis.graphFunctionDigest ||
        request.graph.materializationRef !== executionBasis.graphRef ||
        request.graph.materializationDigest !== executionBasis.graphDigest ||
        request.graph.graphFunctionRef !== executionBasis.graphFunctionRef ||
        request.graph.graphFunctionDigest !== executionBasis.graphFunctionDigest ||
        !request.program.callableMembership.includes(executionBasis.graphFunctionRef) ||
        sourceCursor.runId !== selector.runId ||
        sourceCursor.graphCallId !== selector.graphCallId ||
        sourceCursor.frameId !== selector.frameId) {
        return executableRetryInputRefusal(request, "basis_mismatch", "retry frontier declarations differ from their admitted execution basis");
    }
    const historicalRoutes = projectHistoricalTraversalRoutesAtPrefix(selectRuntimeEventPrefixFromAuthority(unscopedRuntimeEventPrefix(prefix), {
        runId: sourceCursor.runId,
    }), authorityPrefix);
    if (historicalRoutes === null) {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "retry input projection requires exact historical route truth");
    }
    const spentSourceRoutes = historicalRoutes.filter((route) => route.runId === sourceCursor.runId &&
        route.graphCallId === sourceCursor.graphCallId &&
        route.frameId === sourceCursor.frameId &&
        route.executionBasisRef === sourceCursor.executionBasisRef &&
        route.materializationRef === request.graph.materializationRef &&
        route.sourceCursorRef === sourceCursor.cursorRef &&
        route.sourceCursorDigest === sourceCursor.cursorDigest);
    if (spentSourceRoutes.length > 0) {
        return executableRetryInputRefusal(request, "frontier_stale", "selected retry source cursor already has an admitted outgoing route", spentSourceRoutes.map((route) => route.admissionEventRef));
    }
    const owner = projectDeclaredCRetryFrontier(prefix, request.graph, sourceCursor, request.graphFunction, sourceCursor.retryPath.length, authorityPrefix);
    if (owner === null || owner.state !== "progress_available" ||
        owner.retryBoundaryRef !== selector.retryBoundaryRef ||
        owner.runId !== selector.runId || owner.graphCallId !== selector.graphCallId ||
        owner.frameId !== selector.frameId ||
        owner.available.kind !== "declared_c_retry_retry_progress" ||
        owner.available.progress.progressRef !== selector.retryProgressRef) {
        return executableRetryInputRefusal(request, owner === null ? "frontier_absent" : "frontier_stale", "selected retry progress is not the exact declared C.retry frontier");
    }
    const ownerRows = owner.rows.filter((row) => row.kind === "declared_c_retry_retry_progress");
    if (ownerRows.length !== owner.rows.length ||
        !sameNumbers(owner.attemptCoverage, ownerRows.map((row) => row.attempt.attempt)) ||
        !sameNumbers(owner.progressCoverage, owner.attemptCoverage))
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "D17 requires every owner row through the selected retry progress", owner.rows.flatMap((row) => [row.attemptEventRef]));
    const rows = [];
    const cited = new Set();
    for (const ownerRow of ownerRows) {
        const phase = ownerRow.failureCCall.phaseProjection;
        const attemptEvent = events.find((event) => event.eventId === ownerRow.attemptEventRef);
        const progressEvent = events.find((event) => event.eventId === ownerRow.progressEventRef);
        const openedEvent = events.find((event) => event.eventId === phase.openedEventRef);
        const fibreEvent = phase.fibreEventRef === null ? undefined : events.find((event) => event.eventId === phase.fibreEventRef);
        const resultEvent = phase.resultEventRef === null ? undefined : events.find((event) => event.eventId === phase.resultEventRef);
        const judgmentEvent = phase.judgmentEventRef === null
            ? undefined
            : events.find((event) => event.eventId === phase.judgmentEventRef);
        const resultEvidenceEvents = resultEvent === undefined
            ? []
            : phase.evidenceEventRefs
                .map((eventRef) => events.find((event) => event.eventId === eventRef))
                .filter((event) => event !== undefined &&
                resultEvent.causationEventRefs.includes(event.eventId));
        const evidenceEvent = resultEvidenceEvents.length === 0
            ? null
            : resultEvidenceEvents[0];
        if (attemptEvent === undefined || progressEvent === undefined ||
            openedEvent === undefined || fibreEvent === undefined ||
            resultEvent === undefined || judgmentEvent === undefined ||
            resultEvidenceEvents.length > 1 ||
            (phase.evidenceEventRefs.length > 0 && evidenceEvent === null)) {
            return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "owner-specialized retry frontier cites a missing source event", [...cited, ownerRow.attemptEventRef, ownerRow.progressEventRef]);
        }
        const row = constructRetryAttemptFrontierRow({
            retryBoundaryRef: selector.retryBoundaryRef,
            attempt: ownerRow.attempt,
            cCall: ownerRow.failureCCall.cCall,
            progress: ownerRow.progress,
            attemptEvent,
            openedEvent,
            fibreEvent,
            evidenceEvent,
            resultEvent,
            judgmentEvent,
            progressEvent,
        });
        if (row === null) {
            return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "retry frontier source kinds do not match their owning slots", [...cited, attemptEvent.eventId, progressEvent.eventId]);
        }
        for (const source of [
            row.sources.attempt,
            row.sources.cCallOpened,
            row.sources.fibreSelected,
            ...(row.sources.evidence === null ? [] : [row.sources.evidence]),
            row.sources.result,
            row.sources.judgment,
            row.sources.progress,
        ])
            cited.add(source.eventRef);
        rows.push(row);
    }
    const frontierBody = {
        kind: "retry_attempt_frontier",
        schemaVersion: "5.0.0",
        isFullFrontier: true,
        retryBoundaryRef: selector.retryBoundaryRef,
        runId: selector.runId,
        graphCallId: selector.graphCallId,
        frameId: selector.frameId,
        declaredFrontierRef: owner.projectionRef,
        declaredFrontierDigest: owner.projectionDigest,
        rows,
        attemptCoverage: rows.map((row) => row.attempt),
        reasonClasses: sortedUnique(rows.map((row) => row.reasonClass)),
        ownerSurfaces: sortedUnique(rows.flatMap((row) => [
            row.sources.attempt.ownerSurface,
            row.sources.cCallOpened.ownerSurface,
            row.sources.progress.ownerSurface,
        ])),
        sourceEventKinds: sortedUnique(rows.flatMap((row) => [
            row.sources.attempt.eventKind,
            row.sources.cCallOpened.eventKind,
            row.sources.fibreSelected.eventKind,
            ...(row.sources.evidence === null ? [] : [row.sources.evidence.eventKind]),
            row.sources.result.eventKind,
            row.sources.judgment.eventKind,
            row.sources.progress.eventKind,
        ])),
    };
    const frontierDigest = sha256Canonical(frontierBody);
    const retryFrontier = deepFreeze({
        ...frontierBody,
        frontierRef: `retry-attempt-frontier://abiogenesis/${frontierDigest.slice("sha256:".length)}`,
        frontierDigest,
    });
    try {
        assertFullRetryAttemptFrontier(retryFrontier);
    }
    catch {
        return executableRetryInputRefusal(request, "frontier_lineage_mismatch", "retry frontier failed its complete structural assertion", [...cited]);
    }
    const selected = owner.available;
    const selectedProgress = selected.progress;
    const sourceAttempt = selected.attempt;
    const ownerSourceCursor = selected.failureCCall.sourceCursor;
    const selectedCCall = selected.failureCCall.cCall;
    const scope = rehydrateRetryTraversalScope(prefix, events, executionBasis, sourceCursor);
    const declaration = projectDeclaredRetryAttemptCoordinates(request.graph, sourceCursor);
    if (scope === null || declaration === null ||
        ownerSourceCursor.cursorRef !== sourceCursor.cursorRef ||
        ownerSourceCursor.cursorDigest !== sourceCursor.cursorDigest ||
        selected.progressEventRef !== selectedProgressEvent.eventId ||
        selected.attemptEventRef !== selectedAttemptEvent.eventId ||
        selectedProgress.progressRef !== selectorProgress.progressRef ||
        selectedProgress.progressDigest !== selectorProgress.progressDigest ||
        declaration.retryBoundaryRef !== selector.retryBoundaryRef ||
        declaration.budget !== sourceAttempt.budget ||
        declaration.inputCarrierRef !== sourceAttempt.inputContractRef ||
        scope.scopeRef !== sourceCursor.traversalScopeRef ||
        scope.executionBasisRef !== executionBasis.basisRef ||
        selectedProgress.progressRef !== selector.retryProgressRef ||
        selectedProgress.attemptRef !== sourceAttempt.attemptRef) {
        return executableRetryInputRefusal(request, "retry_declaration_mismatch", "selected retry frontier differs from its exact declared runtime lineage", [...cited]);
    }
    if (!isRecord(sourceAttempt.inputValue)) {
        return executableRetryInputRefusal(request, "preimage_absent", "selected retry attempt has no canonical executable input preimage", [...cited]);
    }
    if (sha256Canonical(sourceAttempt.inputValue) !== sourceAttempt.inputDigest) {
        return executableRetryInputRefusal(request, "preimage_digest_mismatch", "selected retry input preimage differs from its admitted digest", [...cited]);
    }
    if (sourceAttempt.inputContractRef !== declaration.inputCarrierRef ||
        sourceAttempt.inputRef !== selectedProgress.inputRef ||
        sourceAttempt.inputDigest !== selectedProgress.inputDigest) {
        return executableRetryInputRefusal(request, "preimage_contract_mismatch", "selected retry input differs from its declared contract coordinate", [...cited]);
    }
    const nextAttempt = sourceAttempt.attempt + 1;
    if (nextAttempt > sourceAttempt.budget ||
        selectedProgress.remainingBudget < 1) {
        return executableRetryInputRefusal(request, "retry_not_permitted", "selected retry frontier has no remaining declared attempt", [...cited]);
    }
    const body = {
        kind: "executable_retry_input",
        schemaVersion: "5.0.0",
        disposition: "projected",
        durablePrefixDigest: request.prefix.prefixDigest,
        lastAdmissionOrdinal,
        selector,
        executionBasisRef: executionBasis.basisRef,
        executionBasisDigest: executionBasis.basisDigest,
        traversalScopeRef: scope.scopeRef,
        traversalScopeDigest: scope.scopeDigest,
        programRef: executionBasis.programRef,
        programDigest: executionBasis.programDigest,
        graphFunctionRef: executionBasis.graphFunctionRef,
        graphFunctionDigest: executionBasis.graphFunctionDigest,
        graphRef: executionBasis.graphRef,
        graphDigest: executionBasis.graphDigest,
        retryFrontier,
        selectedFrontierRowRef: retryFrontier.rows.at(-1).rowRef,
        progressEventRef: selectedProgressEvent.eventId,
        progress: selectedProgress,
        sourceAttemptEventRef: selected.attemptEventRef,
        sourceAttempt,
        sourceCursor,
        cCall: selectedCCall,
        inputContractRef: sourceAttempt.inputContractRef,
        inputRef: sourceAttempt.inputRef,
        inputDigest: sourceAttempt.inputDigest,
        inputValue: sourceAttempt.inputValue,
        nextAttempt,
        nextRetryPath: [
            ...sourceAttempt.retryPath.slice(0, -1),
            nextAttempt,
        ],
    };
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `executable-retry-input://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
export function admitRetryAttempt(store, prefix, executionBasis, graph, graphFunction, cursor, inputValue, routeAdmissionEventRef, basis) {
    if (!hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
        executionBasis.graphRef !== graph.materializationRef ||
        executionBasis.basisRef !== cursor.executionBasisRef) {
        return refusal("basis_mismatch", "retry attempt requires the exact admitted execution basis and GTL Graph");
    }
    if (!hasAdmittedTraversalCursorAtPrefix(prefix, cursor)) {
        return refusal("cursor_mismatch", "retry attempt requires the admitted target cursor of one retry route");
    }
    if (!isRecord(inputValue) || sha256Canonical(inputValue) !== cursor.inputDigest) {
        return refusal("cursor_mismatch", "retry attempt input value differs from the admitted cursor input digest");
    }
    const context = contextForCursor(graph, cursor);
    if (context === null || (typeof context === "object" && "kind" in context)) {
        return context ??
            refusal("retry_not_declared", "cursor has no enclosing declared C.retry term");
    }
    const snapshot = runtimeEventBodiesAtPrefix(prefix);
    const frontier = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction);
    if (frontier?.state !== "eligible" ||
        frontier.nextAttempt !== cursor.attempt ||
        frontier.currentCursor.cursorRef !== cursor.cursorRef ||
        frontier.currentCursor.cursorDigest !== cursor.cursorDigest ||
        frontier.eligibilityRoute.admissionEventRef !== routeAdmissionEventRef ||
        frontier.eligibilityRoute.targetCursorRef !== cursor.cursorRef ||
        frontier.eligibilityRoute.targetCursorDigest !== cursor.cursorDigest) {
        return refusal("route_mismatch", "retry attempt must extend the exact admitted retry route");
    }
    if (cursor.attempt < 1 ||
        cursor.attempt > context.budget ||
        context.retryDepth !== cursor.retryPath.length) {
        return refusal("attempt_mismatch", "retry attempt is outside the declared positive budget");
    }
    // An already selected retry route does not waive native supervision. This
    // reads the previous attempt's admitted as-of projection; it samples no clock.
    if (frontier.latestFailure !== null) {
        const actors = indexedRuntimeEvents(prefix, "basis:" + executionBasis.basisRef).filter(event => event.kind === "actor_invocation_started" &&
            event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST && isRecord(event.payload) &&
            event.payload.cCallRef === frontier.latestFailure.cCallRef && event.basisId === executionBasis.basisRef &&
            event.runId === cursor.runId && event.graphCallId === cursor.graphCallId && event.frameId === cursor.frameId);
        for (const actor of actors) {
            const liveness = projectRuntimeLivenessAtPrefix(prefix, actor.aggregateId);
            if (liveness?.disposition.disposition !== "retry")
                return refusal("attempt_mismatch", "retry dispatch lacks its admitted native liveness disposition");
        }
    }
    const boundaryRef = frontier.retryBoundaryRef;
    const attemptManifestRef = deriveRetryAttemptManifestRef({
        retryBoundaryRef: boundaryRef,
        executionBasisRef: cursor.executionBasisRef,
        inputContractRef: context.inputCarrierRef,
        inputRef: cursor.inputRef,
        inputDigest: cursor.inputDigest,
        attempt: cursor.attempt,
        retryPath: cursor.retryPath,
    });
    const body = {
        attemptManifestRef,
        retryBoundaryRef: boundaryRef,
        retryTermPath: context.retryTermPath,
        wrappedTermPath: context.wrappedTermPath,
        taskOrdinal: context.taskOrdinal,
        attempt: cursor.attempt,
        retryPath: cursor.retryPath,
        budget: context.budget,
        retryableFailureClasses: WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
        priorJudgmentRef: frontier.eligibilityRoute.judgmentRef,
        priorRouteRef: frontier.eligibilityRoute.routeRef,
        inputRef: cursor.inputRef,
        inputDigest: cursor.inputDigest,
        inputContractRef: context.inputCarrierRef,
        inputValue: deepFreeze(inputValue),
    };
    const attemptDigest = sha256Canonical(body);
    const attemptRef = `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
    let event;
    try {
        event = compareAndAppendExpectedPrefix(store, runtimeEventPrefixDigest(prefix), [() => ({
                kind: "retry_attempt_opened",
                eventTime: basis.eventTime,
                aggregateType: "frame",
                aggregateId: cursor.frameId,
                parentAggregateId: cursor.graphCallId,
                causationEventRefs: [routeAdmissionEventRef],
                correlationId: basis.correlationId,
                workflowVersion: "5.0.0",
                scopeClass: "run",
                basisId: executionBasis.basisRef,
                runId: cursor.runId,
                graphFunctionRef: executionBasis.graphFunctionRef,
                materializationRef: graph.materializationRef,
                graphCallId: cursor.graphCallId,
                frameId: cursor.frameId,
                payload: { attemptRef, attemptDigest, ...body },
            })])[0];
    }
    catch (error) {
        if (isExpectedPrefixMismatch(error)) {
            return refusal("attempt_mismatch", "retry attempt authority changed after immutable-prefix validation");
        }
        throw error;
    }
    const admission = deepFreeze({
        kind: "retry_attempt_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        attemptRef,
        attemptDigest,
        ...body,
        admissionEventRef: event.eventId,
    });
    return admission;
}
export function projectRetryEligibility(prefix, graph, graphFunction, cursor, failureClass, failureSignalRef) {
    const context = contextForCursor(graph, cursor);
    if (context === null ||
        (typeof context === "object" && "kind" in context)) {
        return deepFreeze({
            kind: "retry_eligibility",
            schemaVersion: "5.0.0",
            disposition: "not_in_retry",
            retryBoundaryRef: null,
            retryTermPath: [],
            wrappedTermPath: [],
            attempt: cursor.attempt,
            budget: 0,
            remainingBudget: 0,
            failureClass,
            failureSignalRef,
            completedAttempts: [],
            priorProgressRefs: [],
        });
    }
    const boundaryRef = retryBoundaryRef(graph, cursor, context);
    const frontier = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction);
    const priorProgresses = frontier === null ? [] : frontier.rows.flatMap((row) => row.progress === null ? [] : [row.progress]);
    const immediatelyPrecedingFailure = priorProgresses
        .filter((progress) => progress.progressClass === "retry")
        .at(-1);
    const stationary = immediatelyPrecedingFailure?.progressClass === "retry" &&
        immediatelyPrecedingFailure.failureSignalRef === failureSignalRef;
    const retryable = WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(failureClass);
    const expectedAttemptCoverage = Array.from({ length: cursor.attempt }, (_, index) => index + 1);
    const currentAttemptIsActive = frontier?.state === "attempt_active" &&
        frontier.retryBoundaryRef === boundaryRef &&
        frontier.active.attempt.attempt === cursor.attempt &&
        sameNumbers(frontier.active.attempt.retryPath, cursor.retryPath) &&
        frontier.active.currentCursor.cursorRef === cursor.cursorRef &&
        frontier.active.currentCursor.cursorDigest === cursor.cursorDigest;
    const disposition = frontier === null ||
        !sameNumbers(frontier.attemptCoverage, expectedAttemptCoverage) ||
        !sameNumbers(frontier.progressCoverage, expectedAttemptCoverage.slice(0, -1)) ||
        !currentAttemptIsActive
        ? "replay_gap"
        : !retryable
            ? "not_retryable"
            : stationary
                ? "stationary"
                : cursor.attempt >= context.budget
                    ? "budget_exhausted"
                    : "retry";
    return deepFreeze({
        kind: "retry_eligibility",
        schemaVersion: "5.0.0",
        disposition,
        retryBoundaryRef: boundaryRef,
        retryTermPath: context.retryTermPath,
        wrappedTermPath: context.wrappedTermPath,
        attempt: cursor.attempt,
        budget: context.budget,
        remainingBudget: Math.max(0, context.budget - cursor.attempt),
        failureClass,
        failureSignalRef,
        completedAttempts: expectedAttemptCoverage,
        priorProgressRefs: priorProgresses.map((progress) => progress.progressRef),
    });
}
export function projectRuntimeRetryBudgetFacts(prefix, scope) {
    const absent = { remaining: null, retryEligible: false, continuationRef: null, terminalPolicy: "block" };
    const events = runtimeEventBodiesAtPrefix(prefix);
    const opened = indexedRuntimeEvents(prefix, "related:" + scope.cCallRef).find(event => event.kind === "c_call_opened" && event.aggregateId === scope.cCallRef &&
        event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId && event.frameId === scope.frameId);
    if (opened === undefined || !isRecord(opened.payload) || !Array.isArray(opened.payload.retryPath) || opened.payload.retryPath.length === 0)
        return absent;
    const retryPath = opened.payload.retryPath;
    const rows = indexedRuntimeEvents(prefix, "basis:" + scope.basisRef).filter(event => event.kind === "retry_attempt_opened" && isRecord(event.payload) &&
        event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId &&
        event.frameId === scope.frameId && event.admissionOrdinal < opened.admissionOrdinal &&
        event.payload.attempt === scope.attempt && event.payload.taskOrdinal === scope.taskOrdinal && Array.isArray(event.payload.retryPath) &&
        sha256Canonical(event.payload.retryPath) === sha256Canonical(retryPath));
    if (rows.length !== 1 || !isRecord(rows[0].payload))
        return absent;
    const { attemptRef, attemptDigest, ...body } = rows[0].payload;
    if (sha256Canonical(body) !== attemptDigest || attemptRef !== `retry-attempt://abiogenesis/${String(attemptDigest).slice(7)}` ||
        !Number.isSafeInteger(body.budget) || Number(body.budget) < scope.attempt)
        return absent;
    const remaining = Number(body.budget) - scope.attempt;
    const progresses = indexedRuntimeEvents(prefix, "basis:" + scope.basisRef).filter(event => event.kind === "retry_progress_recorded" && isRecord(event.payload) &&
        event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId && event.frameId === scope.frameId &&
        event.payload.attemptRef === attemptRef && event.payload.cCallRef === scope.cCallRef);
    let retryEligible = false;
    let resultRejectionRef = null;
    if (progresses.length === 1 && isRecord(progresses[0].payload)) {
        const { progressRef, progressDigest, ...progress } = progresses[0].payload;
        const exactProgress = progress.remainingBudget === remaining &&
            progress.budget === body.budget && progress.retryBoundaryRef === body.retryBoundaryRef &&
            sha256Canonical(progress) === progressDigest && progressRef === `retry-progress://abiogenesis/${String(progressDigest).slice(7)}`;
        retryEligible = exactProgress && remaining > 0 && progress.progressClass === "retry";
        if (exactProgress && progress.failureClass === "contract_failure" && typeof progress.failureSignalRef === "string")
            resultRejectionRef = progress.failureSignalRef;
    }
    return deepFreeze({ remaining, retryEligible, continuationRef: null, terminalPolicy: "block", resultRejectionRef });
}
function retryRuntimeFailureTransitionError(message) {
    return new TypeError(`retry runtime failure transition refusal: ${message}`);
}
export function planRetryRuntimeFailureTransition(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis) {
    const expectedPrefixDigest = runtimeEventPrefixDigest(prefix);
    if (store.digest() !== expectedPrefixDigest) {
        return refusal("progress_mismatch", "runtime failure transition requires its exact immutable entry prefix");
    }
    const projectedBasis = rehydrateExecutionBasisAtPrefix(prefix, executionBasis.basisRef);
    const frontier = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction);
    const activeRow = frontier?.state === "attempt_active"
        ? frontier.active
        : null;
    const activeCCall = activeRow?.cCalls.find((phase) => phase.cCall.cCallRef === cCall.cCallRef) ?? null;
    const declaredTerm = resolveCProgramTermAtSourcePath(graph.template, cursor.currentNodeRef, cursor.termPath);
    if (!isMaterializedGtlGraph(graph) ||
        projectedBasis === null ||
        sha256Canonical(projectedBasis) !==
            sha256Canonical(executionBasis) ||
        activeRow === null || activeCCall === null ||
        activeRow.currentCursor.cursorRef !== cursor.cursorRef ||
        activeRow.currentCursor.cursorDigest !== cursor.cursorDigest ||
        activeCCall !== activeRow.cCalls.at(-1) ||
        sha256Canonical(activeCCall.cCall) !==
            sha256Canonical(cCall) ||
        declaredTerm.kind === "c_source_path_refusal" ||
        !isExecutableCLeaf(declaredTerm) ||
        executionBasis.basisRef !== cursor.executionBasisRef ||
        executionBasis.basisRef !== cCall.basisId ||
        executionBasis.graphRef !== graph.materializationRef ||
        executionBasis.graphDigest !== graph.materializationDigest ||
        cursor.graphRef !== graph.materializationRef ||
        cCall.graphFunctionRef !== executionBasis.graphFunctionRef ||
        cCall.programLocusRef !== declaredTerm.programLocusRef ||
        cCall.stageRole !== declaredTerm.stageRole ||
        cCall.regime !== declaredTerm.fibre ||
        cCall.armId !== declaredTerm.armId ||
        cCall.compositionRef !== declaredTerm.compositionRef ||
        cCall.vectorIndex !== declaredTerm.vectorIndex ||
        cCall.implementationBindingRef !==
            declaredTerm.requirement.implementationBindingRef ||
        cCall.inputContractRef !== declaredTerm.requirement.inputContractRef ||
        cCall.outputContractRef !== declaredTerm.requirement.outputContractRef ||
        cCall.evidenceContractRef !== declaredTerm.requirement.evidenceContractRef ||
        cCall.failureContractRef !== declaredTerm.requirement.failureContractRef ||
        cCall.refusalContractRef !== declaredTerm.requirement.refusalContractRef ||
        cCall.judgmentContractRef !== declaredTerm.requirement.judgmentContractRef ||
        cCall.judgmentPredicateRef !== declaredTerm.judgmentPredicateRef) {
        return refusal("basis_mismatch", "runtime failure transition requires the exact admitted basis, graph, and cursor");
    }
    let closePlan = planCCallRuntimeFailureClose(store, prefix, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, "retry", basis);
    if (closePlan.kind !== "c_call_runtime_failure_close_plan") {
        return refusal("judgment_mismatch", closePlan.message);
    }
    const eligibility = projectRetryEligibility(prefix, graph, graphFunction, cursor, closePlan.signal.failureClass, closePlan.signal.failureSignalRef);
    let disposition = eligibility.disposition === "retry"
        ? "retry"
        : eligibility.disposition === "stationary" ||
            eligibility.disposition === "budget_exhausted"
            ? "blocked"
            : null;
    if (disposition === null || eligibility.retryBoundaryRef === null) {
        return refusal("progress_mismatch", "runtime failure transition requires one exact bounded retry eligibility");
    }
    const currentActors = indexedRuntimeEvents(prefix, "basis:" + executionBasis.basisRef).filter(event => event.kind === "actor_invocation_started" &&
        event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST && isRecord(event.payload) && event.payload.cCallRef === cCall.cCallRef &&
        event.basisId === executionBasis.basisRef && event.runId === cursor.runId && event.graphCallId === cursor.graphCallId && event.frameId === cursor.frameId);
    for (const actor of currentActors) {
        // Exact native frontier facts are established above, independently of the
        // observer; liveness must not recursively compute retry eligibility.
        const liveness = projectRuntimeLivenessAtPrefix(prefix, actor.aggregateId, {
            remaining: eligibility.remainingBudget, retryEligible: eligibility.disposition === "retry",
            continuationRef: null, terminalPolicy: "block",
            resultRejectionRef: source.kind === "c_call_admission_rejection" ? closePlan.signal.failureSignalRef : null,
        });
        if (liveness?.disposition.disposition === "block")
            disposition = "blocked";
        else if (liveness?.disposition.disposition !== "retry")
            return refusal("progress_mismatch", "runtime failure awaits its native liveness or artifact disposition");
    }
    if (disposition === "blocked") {
        closePlan = planCCallRuntimeFailureClose(store, prefix, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, disposition, basis);
        if (closePlan.kind !== "c_call_runtime_failure_close_plan") {
            return refusal("judgment_mismatch", closePlan.message);
        }
    }
    if (cCall.frameId !== cursor.frameId ||
        cCall.graphCallId !== cursor.graphCallId ||
        cCall.attempt !== cursor.attempt ||
        !sameNumbers(cCall.retryPath, cursor.retryPath)) {
        return refusal("attempt_mismatch", "runtime failure CCall differs from the current retry coordinate");
    }
    const projectedAttempt = activeRow.attempt;
    if (projectedAttempt.attempt !== cursor.attempt ||
        !sameNumbers(projectedAttempt.retryPath, cursor.retryPath) ||
        sha256Canonical(projectedAttempt.inputValue) !==
            projectedAttempt.inputDigest) {
        return refusal("attempt_mismatch", "runtime failure transition requires the exact active retry attempt");
    }
    const enclosingTopology = deriveCEnclosingRetryTopology(graph, {
        nodeRef: cursor.currentNodeRef,
        termPath: cursor.termPath,
    });
    if (enclosingTopology.kind === "c_source_path_refusal") {
        return refusal("attempt_mismatch", enclosingTopology.message);
    }
    const enclosingContexts = enclosingTopology.entries.map((entry) => entry.context);
    let stoppedPartition = null;
    let stoppedExitContexts = [];
    if (disposition === "blocked") {
        const targetTopology = deriveCEnclosingRetryTopology(graph, null);
        if (targetTopology.kind === "c_source_path_refusal") {
            return refusal("attempt_mismatch", targetTopology.message);
        }
        const partition = deriveCanonicalRootedTopologyPartition(enclosingTopology.witness, targetTopology.witness);
        if (partition.kind === "canonical_rooted_topology_partition_refusal") {
            return refusal(partition.code === "basis_mismatch"
                ? "basis_mismatch"
                : "attempt_mismatch", partition.message);
        }
        const contextBySegmentRef = new Map(enclosingTopology.entries.map((entry) => [
            entry.segmentRef,
            entry.context,
        ]));
        const exitedContexts = partition.exited.map((segmentRef) => contextBySegmentRef.get(segmentRef));
        if (partition.preserved.length !== 0 ||
            partition.entered.length !== 0 ||
            exitedContexts.length !== enclosingTopology.entries.length ||
            exitedContexts.some((context) => context === undefined)) {
            return refusal("attempt_mismatch", "blocked retry transition requires one exact rooted topology exit");
        }
        stoppedPartition = partition;
        stoppedExitContexts = exitedContexts;
    }
    const stoppedCascadeAttempts = disposition === "blocked"
        ? stoppedExitContexts.slice(1).map((context) => {
            const path = cursor.retryPath.slice(0, context.retryDepth);
            const outer = projectDeclaredCRetryFrontier(prefix, graph, cursor, graphFunction, context.retryDepth);
            return outer?.state === "attempt_active" &&
                outer.active.attempt.attempt === path.at(-1) &&
                sameNumbers(outer.active.attempt.retryPath, path)
                ? { context, row: outer.active, path }
                : null;
        })
        : [];
    if (stoppedCascadeAttempts.some((value) => value === null)) {
        return refusal("attempt_mismatch", "blocked retry transition requires every exited enclosing retry attempt");
    }
    const body = {
        progressClass: disposition === "retry"
            ? "retry"
            : "stopped",
        ...(disposition === "blocked"
            ? {
                stopReason: "boundary_terminal",
                predecessorProgressRef: null,
            }
            : {}),
        retryBoundaryRef: eligibility.retryBoundaryRef,
        attemptRef: projectedAttempt.attemptRef,
        attempt: cursor.attempt,
        retryPath: cursor.retryPath,
        budget: eligibility.budget,
        failureClass: closePlan.signal.failureClass,
        failureSignalRef: closePlan.signal.failureSignalRef,
        completedAttempts: eligibility.completedAttempts,
        remainingBudget: eligibility.remainingBudget,
        cCallRef: cCall.cCallRef,
        inputRef: projectedAttempt.inputRef,
        inputDigest: projectedAttempt.inputDigest,
        inputContractRef: projectedAttempt.inputContractRef,
    };
    const close = closePlan.close;
    const eventCandidates = [...closePlan.eventCandidates];
    const projectedEvents = [...closePlan.projectedEvents];
    const projectedHistory = [
        ...runtimeEventBodiesAtPrefix(prefix),
        ...projectedEvents,
    ];
    const project = (candidate) => {
        const event = projectRuntimeEventFromValidatedHistory(projectedHistory, candidate);
        eventCandidates.push(deepFreeze(candidate));
        projectedEvents.push(event);
        projectedHistory.push(event);
        return event;
    };
    const progressBody = {
        ...body,
        resultRef: close.result.resultRef,
        judgmentRef: close.judgment.judgmentRef,
    };
    const progressDigest = sha256Canonical(progressBody);
    const progressRef = `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
    const progressEvent = project({
        kind: "retry_progress_recorded",
        eventTime: basis.eventTime,
        aggregateType: "frame",
        aggregateId: cursor.frameId,
        parentAggregateId: cursor.graphCallId,
        causationEventRefs: [
            activeRow.attemptEventRef,
            close.judgment.admissionEventRef,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: cCall.basisId,
        runId: cCall.runId,
        graphFunctionRef: cCall.graphFunctionRef,
        materializationRef: graph.materializationRef,
        graphCallId: cCall.graphCallId,
        frameId: cCall.frameId,
        payload: { progressRef, progressDigest, ...progressBody },
    });
    const progress = deepFreeze({
        kind: "retry_progress_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        progressRef,
        progressDigest,
        ...progressBody,
        admissionEventRef: progressEvent.eventId,
    });
    const stoppedProgresses = [];
    if (disposition === "blocked") {
        stoppedProgresses.push(progress);
        let predecessorEvent = progressEvent;
        for (const cascade of stoppedCascadeAttempts) {
            if (cascade === null) {
                throw retryRuntimeFailureTransitionError("stopped cascade attempt disappeared");
            }
            const attempt = cascade.path.at(-1);
            const cascadeBody = {
                progressClass: "stopped",
                stopReason: "propagated_inner_stop",
                predecessorProgressRef: stoppedProgresses.at(-1).progressRef,
                retryBoundaryRef: retryBoundaryRef(graph, cursor, cascade.context),
                attemptRef: cascade.row.attempt.attemptRef,
                attempt,
                retryPath: cascade.path,
                budget: cascade.context.budget,
                failureClass: closePlan.signal.failureClass,
                failureSignalRef: closePlan.signal.failureSignalRef,
                completedAttempts: Array.from({ length: attempt }, (_, index) => index + 1),
                remainingBudget: Math.max(0, cascade.context.budget - attempt),
                cCallRef: cCall.cCallRef,
                inputRef: cascade.row.attempt.inputRef,
                inputDigest: cascade.row.attempt.inputDigest,
                inputContractRef: cascade.row.attempt.inputContractRef,
                resultRef: close.result.resultRef,
                judgmentRef: close.judgment.judgmentRef,
            };
            const cascadeDigest = sha256Canonical(cascadeBody);
            const cascadeRef = `retry-progress://abiogenesis/${cascadeDigest.slice("sha256:".length)}`;
            const cascadeEvent = project({
                kind: "retry_progress_recorded",
                eventTime: basis.eventTime,
                aggregateType: "frame",
                aggregateId: cursor.frameId,
                parentAggregateId: cursor.graphCallId,
                causationEventRefs: [
                    cascade.row.attemptEventRef,
                    predecessorEvent.eventId,
                ],
                correlationId: basis.correlationId,
                workflowVersion: "5.0.0",
                scopeClass: "run",
                basisId: cCall.basisId,
                runId: cCall.runId,
                graphFunctionRef: cCall.graphFunctionRef,
                materializationRef: graph.materializationRef,
                graphCallId: cCall.graphCallId,
                frameId: cCall.frameId,
                payload: {
                    progressRef: cascadeRef,
                    progressDigest: cascadeDigest,
                    ...cascadeBody,
                },
            });
            stoppedProgresses.push(deepFreeze({
                kind: "retry_progress_admission",
                schemaVersion: "5.0.0",
                disposition: "admitted",
                progressRef: cascadeRef,
                progressDigest: cascadeDigest,
                ...cascadeBody,
                admissionEventRef: cascadeEvent.eventId,
            }));
            predecessorEvent = cascadeEvent;
        }
    }
    const admittedPrefix = selectValidatedRuntimeEventPrefix(Object.freeze([...projectedHistory]));
    const projectedSignal = projectCCallRuntimeFailureSignal(admittedPrefix, cCall.cCallRef, close.result.resultRef, close.judgment.judgmentRef);
    const projectedFrontiers = enclosingContexts.map((context) => projectDeclaredCRetryFrontier(admittedPrefix, graph, cursor, graphFunction, context.retryDepth));
    const projectedProgress = projectedFrontiers.find((candidate) => candidate?.retryBoundaryRef === progress.retryBoundaryRef);
    if (projectedSignal?.failureSignalRef !== closePlan.signal.failureSignalRef ||
        projectedSignal.failureClass !== closePlan.signal.failureClass ||
        projectedProgress?.state !== "progress_available" ||
        sha256Canonical(projectedProgress.available.progress) !==
            sha256Canonical(progress) ||
        stoppedProgresses.some((stopped) => {
            const projected = projectedFrontiers.find((candidate) => candidate?.retryBoundaryRef === stopped.retryBoundaryRef);
            return projected?.state !== "progress_available" ||
                projected.available.progress.progressClass !== "stopped" ||
                sha256Canonical(projected.available.progress) !== sha256Canonical(stopped);
        }) ||
        (disposition === "retry" && stoppedProgresses.length !== 0) ||
        (disposition === "blocked" &&
            stoppedProgresses.length !== stoppedPartition.exited.length) ||
        (disposition === "blocked" && stoppedProgresses[0] !== progress))
        throw retryRuntimeFailureTransitionError("atomic close or progress does not reproject exactly");
    const transition = deepFreeze({
        kind: "retry_runtime_failure_transition_admission",
        schemaVersion: "5.0.0",
        disposition,
        close,
        progress,
        stoppedProgresses,
        eligibility,
    });
    const runPrefix = selectValidatedRuntimeEventPrefix(Object.freeze([...projectedHistory]), { runId: cursor.runId });
    return deepFreeze({
        kind: "retry_runtime_failure_transition_plan",
        schemaVersion: "5.0.0",
        predecessorEventDigest: expectedPrefixDigest,
        eventCandidates,
        projectedEvents,
        transition,
        projectedPrefix: admittedPrefix,
        replayState: replayValidatedRuntimeEventPrefix(runPrefix, admittedPrefix),
    });
}
export function admitPlannedRetryRuntimeFailureTransitionInActiveTransaction(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis, plan) {
    assertRuntimeEventTransactionActive(store);
    const predecessorEvents = runtimeEventBodiesAtPrefix(prefix);
    if (plan.kind !== "retry_runtime_failure_transition_plan" ||
        plan.schemaVersion !== "5.0.0" ||
        plan.predecessorEventDigest !==
            runtimeEventPrefixDigest(prefix) ||
        store.digest() !== plan.predecessorEventDigest ||
        plan.eventCandidates.length !== plan.projectedEvents.length) {
        return refusal("progress_mismatch", "runtime failure plan differs from the active transaction predecessor");
    }
    const exact = planRetryRuntimeFailureTransition(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis);
    if (exact.kind !== "retry_runtime_failure_transition_plan" ||
        sha256Canonical(exact) !==
            sha256Canonical(plan)) {
        return refusal("progress_mismatch", "runtime failure plan differs from its exact ABG owner relation");
    }
    const projectedHistory = [...predecessorEvents];
    for (const [index, candidate] of plan.eventCandidates.entries()) {
        const projected = projectRuntimeEventFromValidatedHistory(projectedHistory, candidate);
        if (sha256Canonical(projected) !==
            sha256Canonical(plan.projectedEvents[index])) {
            return refusal("progress_mismatch", "runtime failure plan no longer projects its exact event sequence");
        }
        projectedHistory.push(projected);
    }
    const sampledEvents = plan.eventCandidates.map((candidate) => {
        const sample = captureNativeFrameBoundary(store);
        return { event: admitRuntimeEvent(store, candidate), sample };
    });
    const admittedEvents = sampledEvents.map(({ event }) => event);
    if (admittedEvents.some((event, index) => sha256Canonical(event) !==
        sha256Canonical(plan.projectedEvents[index]))) {
        throw retryRuntimeFailureTransitionError("admission differs from its pre-effect plan");
    }
    for (const { event, sample } of sampledEvents)
        observeNativeFrameLiveness(store, event, sample);
    return plan.transition;
}
export function admitRetryRuntimeFailureTransition(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis) {
    const expectedPrefixDigest = runtimeEventPrefixDigest(prefix);
    const plan = planRetryRuntimeFailureTransition(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis);
    if (plan.kind !== "retry_runtime_failure_transition_plan")
        return plan;
    if (plan.transition.disposition !== "retry") {
        return refusal("progress_mismatch", "blocked disposition requires the atomic ABG route admission");
    }
    try {
        const transaction = admitRuntimeEventTransactionAtExpectedPrefix(store, expectedPrefixDigest, () => {
            return admitPlannedRetryRuntimeFailureTransitionInActiveTransaction(store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis, plan);
        });
        if (transaction.value.kind !== "retry_runtime_failure_transition_admission") {
            return transaction.value;
        }
        if (transaction.value.disposition !== "retry" ||
            transaction.value.progress.progressClass !== "retry" ||
            transaction.value.stoppedProgresses.length !== 0) {
            throw retryRuntimeFailureTransitionError("standalone admission produced a non-retry transition");
        }
        if (transaction.successorPrefix === null) {
            throw retryRuntimeFailureTransitionError("durable runtime failure transition produced no successor prefix");
        }
        return deepFreeze({
            kind: transaction.value.kind,
            schemaVersion: transaction.value.schemaVersion,
            disposition: "retry",
            close: transaction.value.close,
            progress: transaction.value.progress,
            stoppedProgresses: Object.freeze([]),
            eligibility: transaction.value.eligibility,
            successorPrefix: transaction.successorPrefix,
        });
    }
    catch (error) {
        if (isExpectedPrefixMismatch(error) ||
            isCCallRuntimeFailureCloseError(error) ||
            (error instanceof TypeError && error.message.startsWith("retry runtime failure transition refusal: "))) {
            return refusal("progress_mismatch", "standalone runtime failure transition rolled back without one admitted retry disposition");
        }
        throw error;
    }
}
/** Topology alone can discharge the absence of completed retry progress.
 * Route admission still owns the source, outcome, target and current cut. */
export function hasNoCompletedRetryExit(graph, source, target) {
    if (!isMaterializedGtlGraph(graph))
        return false;
    const sourceTopology = deriveCEnclosingRetryTopology(graph, {
        nodeRef: source.currentNodeRef, termPath: source.termPath,
    });
    const targetTopology = deriveCEnclosingRetryTopology(graph, target === null ? null : {
        nodeRef: target.currentNodeRef, termPath: target.termPath,
    });
    if (sourceTopology.kind === "c_source_path_refusal" || targetTopology.kind === "c_source_path_refusal" ||
        sourceTopology.entries.length !== source.retryPath.length ||
        targetTopology.entries.length !== (target?.retryPath.length ?? 0))
        return false;
    const partition = deriveCanonicalRootedTopologyPartition(sourceTopology.witness, targetTopology.witness);
    return partition.kind === "canonical_rooted_topology_partition" &&
        partition.exited.length === 0 && partition.entered.length === 0;
}
export function planCompletedRetryProgress(predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis) {
    let snapshot;
    try {
        snapshot = projectRuntimeEventsAtDurablePrefix(predecessorPrefix);
    }
    catch {
        return refusal("progress_mismatch", "completed retry progress requires its exact durable predecessor");
    }
    return planCompletedRetryProgressFromHistory(snapshot, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis);
}
/** @internal Normal HoG planning borrows its actual predecessor and finite suffix. */
export function planOwnedCompletedRetryProgress(predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis) {
    let prefix;
    try {
        prefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(predecessorPrefix);
    }
    catch {
        return refusal("progress_mismatch", "completed retry progress requires its exact durable predecessor");
    }
    return planCompletedRetryProgressFromHistory(runtimeEventBodiesAtPrefix(prefix), predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis);
}
function planCompletedRetryProgressFromHistory(snapshot, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis) {
    const prefix = selectValidatedRuntimeEventPrefix(snapshot);
    const expectedPrefixDigest = runtimeEventPrefixDigest(prefix);
    const cCall = "cCall" in completion ? completion.cCall : null;
    const result = "result" in completion ? completion.result : null;
    const judgment = "judgment" in completion ? completion.judgment : null;
    const completionWitnessEventRef = completion.completionClass ===
        "structural_identity_success"
        ? completion.completionWitnessEventRef
        : completion.completionClass === "fan_out_success"
            ? completion.completion.admissionEventRef
            : completion.completionClass === "fh_resume_success"
                ? completion.resume.admissionEventRef
                : completion.judgment.admissionEventRef;
    let retained = null;
    if (completion.completionClass === "judged_success") {
        try {
            retained = deriveRetainedCCallInputAtPrefix(prefix, sourceCursor.executionBasisRef, graph, sourceCursor, completion.cCall, completion.result, completion.judgment);
        }
        catch (error) {
            if (!(error instanceof TypeError))
                throw error;
            return error.message === "retention lacks the exact admitted ExecutionBasis"
                ? refusal("basis_mismatch", "completed retry progress requires its exact admitted ExecutionBasis")
                : refusal("attempt_mismatch", error.message);
        }
    }
    const completedInput = completion.completionClass === "fan_out_success"
        ? {
            inputRef: completion.completion.outputVectorRef,
            inputDigest: completion.completion.outputVectorDigest,
        }
        : completion.completionClass === "fh_resume_success"
            ? {
                inputRef: completion.resume.successorInputRef,
                inputDigest: completion.resume.successorInputDigest,
            }
            : completion.completionClass === "structural_identity_success"
                ? {
                    inputRef: sourceCursor.inputRef,
                    inputDigest: sourceCursor.inputDigest,
                }
                : {
                    inputRef: retained?.input.admissionRef ?? completion.result.resultRef,
                    inputDigest: retained?.input.subjectDigest ?? completion.result.valueDigest,
                };
    const continuation = deriveAdmittedCContinuationTarget(prefix, graph, sourceCursor, completedInput);
    const sourceTopology = deriveCEnclosingRetryTopology(graph, {
        nodeRef: sourceCursor.currentNodeRef,
        termPath: sourceCursor.termPath,
    });
    const targetTopology = deriveCEnclosingRetryTopology(graph, targetCursor === null
        ? null
        : {
            nodeRef: targetCursor.currentNodeRef,
            termPath: targetCursor.termPath,
        });
    const sourceTerm = resolveCProgramTermAtSourcePath(graph.template, sourceCursor.currentNodeRef, sourceCursor.termPath);
    const sourceContextCount = sourceTopology.kind === "c_source_path_refusal"
        ? null
        : sourceTopology.entries.length;
    const targetSemanticsMatch = continuation.kind === "c_source_path_refusal"
        ? false
        : continuation.disposition === "terminal"
            ? targetCursor === null && continuation.termPath === null
            : targetCursor !== null && continuation.termPath !== null &&
                isTraversalCursorCandidate(targetCursor) &&
                !hasAdmittedTraversalCursorAtPrefix(prefix, targetCursor) &&
                targetCursor.programRef === sourceCursor.programRef &&
                targetCursor.executionBasisRef === sourceCursor.executionBasisRef &&
                targetCursor.traversalScopeRef === sourceCursor.traversalScopeRef &&
                targetCursor.runId === sourceCursor.runId &&
                targetCursor.graphCallId === sourceCursor.graphCallId &&
                targetCursor.frameId === sourceCursor.frameId &&
                targetCursor.graphRef === sourceCursor.graphRef &&
                targetCursor.inputRef === continuation.inputRef &&
                targetCursor.inputDigest === continuation.inputDigest &&
                targetCursor.position === "at_term" &&
                targetCursor.currentNodeRef === continuation.nodeRef &&
                sameStrings(targetCursor.termPath, continuation.termPath) &&
                targetCursor.taskOrdinal === continuation.taskOrdinal &&
                targetCursor.attempt === continuation.attempt &&
                sameNumbers(targetCursor.retryPath, continuation.retryPath);
    const sourceLocusMatches = completion.completionClass ===
        "structural_identity_success"
        ? sourceTerm.kind === "c_identity"
        : cCall !== null && (sourceTerm.kind === "c_of"
            ? cCall.callClass === "leaf" &&
                cCall.programLocusRef === sourceTerm.programLocusRef
            : sourceTerm.kind === "c_workflow" &&
                cCall.callClass === "workflow" &&
                cCall.childGraphFunctionRef === sourceTerm.graphFunctionRef);
    const cCallCompletionMatches = cCall === null || result === null ||
        judgment === null
        ? completion.completionClass === "structural_identity_success"
        : cCall.cCallRef === result.cCallRef &&
            cCall.cCallRef === judgment.cCallRef &&
            cCall.runId === sourceCursor.runId &&
            cCall.graphCallId === sourceCursor.graphCallId &&
            cCall.frameId === sourceCursor.frameId &&
            cCall.taskOrdinal === sourceCursor.taskOrdinal &&
            cCall.attempt === sourceCursor.attempt &&
            sameNumbers(cCall.retryPath, sourceCursor.retryPath) &&
            sourceContextCount !== null &&
            cCall.retryPath.length === sourceContextCount &&
            (completion.completionClass === "fh_resume_success"
                ? cCall.regime === "F_H" && result.resultClass === "pending" &&
                    judgment.judgment === "pending"
                : result.resultClass === "success" && judgment.judgment === "advance");
    const fanOutApplication = completion.completionClass === "fan_out_success"
        ? graph.template.applications.find((application) => application.relationKind === "fan_out" &&
            application.applicationRef === completion.completion.applicationRef) ?? null
        : null;
    const projectedFanOutCompletion = completion.completionClass ===
        "fan_out_success" && fanOutApplication !== null
        ? projectExactFanOutCompletion(prefix, {
            mode: "graph_bound",
            admissionEventRef: completion.completion.admissionEventRef,
            authority: {
                graph,
                application: fanOutApplication,
                basisId: sourceCursor.executionBasisRef,
                runId: sourceCursor.runId,
                graphCallId: sourceCursor.graphCallId,
                frameId: sourceCursor.frameId,
            },
        })
        : null;
    const completionVariantMatches = completion.completionClass ===
        "fan_out_success"
        ? projectedFanOutCompletion?.kind === "fan_out_completion_admission" &&
            projectedFanOutCompletion.completionKind === "complete_vector" &&
            sha256Canonical(projectedFanOutCompletion) ===
                sha256Canonical(completion.completion) &&
            projectedFanOutCompletion.taskRows.at(-1)?.cCallRef === cCall?.cCallRef &&
            projectedFanOutCompletion.taskRows.at(-1)?.resultRef === result?.resultRef &&
            projectedFanOutCompletion.taskRows.at(-1)?.judgmentRef === judgment?.judgmentRef
        : completion.completionClass === "fh_resume_success"
            ? completion.resume.successorCursorRef === sourceCursor.cursorRef &&
                completion.resume.successorCursorDigest === sourceCursor.cursorDigest
            : completion.completionClass === "structural_identity_success"
                ? traversalCursorAdmissionEventRefAtPrefix(prefix, sourceCursor) ===
                    completionWitnessEventRef
                : completionWitnessEventRef === judgment?.admissionEventRef;
    if (sourceTopology.kind === "c_source_path_refusal" ||
        targetTopology.kind === "c_source_path_refusal" ||
        !isMaterializedGtlGraph(graph) ||
        !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
        sourceCursor.graphRef !== graph.materializationRef ||
        !targetSemanticsMatch ||
        !sourceLocusMatches ||
        !cCallCompletionMatches || !completionVariantMatches)
        return refusal("attempt_mismatch", "completed retry progress requires one exact GTL continuation");
    const topologyPartition = deriveCanonicalRootedTopologyPartition(sourceTopology.witness, targetTopology.witness);
    if (topologyPartition.kind ===
        "canonical_rooted_topology_partition_refusal") {
        return refusal(topologyPartition.code === "basis_mismatch"
            ? "basis_mismatch"
            : "attempt_mismatch", topologyPartition.message);
    }
    if (topologyPartition.exited.length === 0) {
        const runPrefix = selectValidatedRuntimeEventPrefix(snapshot, {
            runId: sourceCursor.runId,
        });
        return deepFreeze({
            kind: "completed_retry_progress_plan",
            schemaVersion: "5.0.0",
            predecessorEventDigest: expectedPrefixDigest,
            eventCandidates: Object.freeze([]),
            projectedEvents: Object.freeze([]),
            progresses: Object.freeze([]),
            projectedPrefix: prefix,
            replayState: replayValidatedRuntimeEventPrefix(runPrefix, prefix),
        });
    }
    const contextBySegmentRef = new Map(sourceTopology.entries.map((entry) => [
        entry.segmentRef,
        entry.context,
    ]));
    const exited = topologyPartition.exited.map((segmentRef) => contextBySegmentRef.get(segmentRef));
    if (topologyPartition.entered.length !== 0 ||
        topologyPartition.preserved.length !== targetTopology.entries.length ||
        exited.some((context) => context === undefined)) {
        return refusal("attempt_mismatch", "completed retry progress requires one exact ancestor topology exit");
    }
    const events = runtimeEventBodiesAtPrefix(prefix);
    const executionBasisRef = cCall?.basisId ?? sourceCursor.executionBasisRef;
    const basisEvents = indexedRuntimeEvents(prefix, "payload:basisRef:" + executionBasisRef).filter((event) => event.kind === "basis_admitted" && event.basisId === executionBasisRef &&
        isRecord(event.payload) && event.payload.basisRef === executionBasisRef);
    const basisEvent = basisEvents.length === 1 ? basisEvents[0] : undefined;
    if (basisEvent === undefined || !isRecord(basisEvent.payload) ||
        basisEvent.payload.graphRef !== graph.materializationRef ||
        basisEvent.payload.graphDigest !== graph.materializationDigest)
        return refusal("basis_mismatch", "completed retry progress requires the exact materialized execution-basis Graph");
    const progressGraphFunctionRef = cCall?.graphFunctionRef ??
        (typeof basisEvent.payload.graphFunctionRef === "string"
            ? basisEvent.payload.graphFunctionRef
            : null);
    if (progressGraphFunctionRef === null ||
        progressGraphFunctionRef !== graphFunction.name) {
        return refusal("basis_mismatch", "completed retry progress requires one exact graph-function basis");
    }
    const completionWitnessEvent = indexedRuntimeEvents(prefix, "id:" + completionWitnessEventRef).find((event) => event.eventId === completionWitnessEventRef);
    const plannedAttempts = [];
    for (const [index, contextValue] of exited.entries()) {
        const context = contextValue;
        const retryPath = sourceCursor.retryPath.slice(0, context.retryDepth);
        const owner = projectDeclaredCRetryFrontier(prefix, graph, sourceCursor, graphFunction, context.retryDepth);
        const row = owner?.state === "attempt_active" ? owner.active : null;
        if (owner === null || row === null || completionWitnessEvent === undefined ||
            owner.retryBoundaryRef !== retryBoundaryRef(graph, sourceCursor, context) ||
            row.attempt.attempt !== retryPath.at(-1) ||
            !sameNumbers(row.attempt.retryPath, retryPath) ||
            (index > 0 && (exited[index - 1].retryDepth !== context.retryDepth + 1 ||
                !sameNumbers(plannedAttempts[index - 1].retryPath.slice(0, -1), retryPath))))
            return refusal("attempt_mismatch", "completed retry progress requires one exact active owner chain");
        plannedAttempts.push({
            context,
            retryPath,
            boundaryRef: owner.retryBoundaryRef,
            attemptEventRef: row.attemptEventRef,
            attemptRef: row.attempt.attemptRef,
            row,
        });
    }
    const directRow = plannedAttempts[0]?.row ?? null;
    const directPhase = directRow?.kind ===
        "declared_c_retry_active_c_call_attempt"
        ? directRow.cCalls.at(-1) ?? null
        : null;
    const directCursorMatches = directRow !== null &&
        directRow.currentCursor.cursorRef === sourceCursor.cursorRef &&
        directRow.currentCursor.cursorDigest === sourceCursor.cursorDigest;
    const directResume = directPhase === null
        ? null
        : projectExactInteractionResumeSuccessorAtPrefix(prefix, directPhase.sourceCursor);
    const directPhaseSourceMatches = directPhase !== null && ((directPhase.sourceCursor.cursorRef === sourceCursor.cursorRef &&
        directPhase.sourceCursor.cursorDigest === sourceCursor.cursorDigest) || (completion.completionClass === "fh_resume_success" &&
        directResume?.resumeEventRef === completion.resume.admissionEventRef &&
        directResume.cursor.cursorRef === sourceCursor.cursorRef &&
        directResume.cursor.cursorDigest === sourceCursor.cursorDigest));
    const directCompletionOwned = completion.completionClass ===
        "structural_identity_success"
        ? directRow?.kind === "declared_c_retry_pre_c_call_attempt" &&
            directCursorMatches &&
            directRow.cCallState.prospective.kind ===
                "declared_c_retry_prospective_structural_identity"
        : directRow?.kind === "declared_c_retry_active_c_call_attempt" &&
            directCursorMatches && directPhase?.phase === "judged" &&
            directPhase === directRow.cCalls.at(-1) &&
            directPhaseSourceMatches &&
            cCall !== null && result !== null && judgment !== null &&
            sha256Canonical(directPhase.cCall) ===
                sha256Canonical(cCall) &&
            sha256Canonical(directPhase.result) ===
                sha256Canonical(result) &&
            sha256Canonical(directPhase.judgment) ===
                sha256Canonical(judgment);
    if (!directCompletionOwned)
        return refusal("attempt_mismatch", "completed retry progress requires the exact active owner phase");
    const planned = plannedAttempts.map((attempt, index) => {
        const common = {
            progressClass: "completed",
            retryBoundaryRef: attempt.boundaryRef,
            attemptRef: attempt.attemptRef,
            attempt: attempt.retryPath.at(-1),
            retryPath: attempt.retryPath,
            completedRetryDepth: attempt.context.retryDepth,
            completionClass: completion.completionClass,
            completionWitnessEventRef,
            sourceCursorRef: sourceCursor.cursorRef,
            sourceCursorDigest: sourceCursor.cursorDigest,
            targetCursorRef: targetCursor?.cursorRef ?? null,
            targetCursorDigest: targetCursor?.cursorDigest ?? null,
            predecessorProgressRef: index === 0 ? null : "",
        };
        return completion.completionClass === "structural_identity_success"
            ? common
            : {
                ...common,
                completionClass: completion.completionClass,
                cCallRef: completion.cCall.cCallRef,
                resultRef: completion.result.resultRef,
                judgmentRef: completion.judgment.judgmentRef,
            };
    });
    for (let index = 1; index < planned.length; index += 1) {
        const predecessorDigest = sha256Canonical(planned[index - 1]);
        planned[index] = {
            ...planned[index],
            predecessorProgressRef: `retry-progress://abiogenesis/${predecessorDigest.slice("sha256:".length)}`,
        };
    }
    const identities = planned.map((body) => {
        const progressDigest = sha256Canonical(body);
        const progressRef = `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
        return { body, progressDigest, progressRef };
    });
    let projectedPrefix = prefix;
    const eventCandidates = [];
    const projectedEvents = [];
    for (const [index, identity] of identities.entries()) {
        const { targetCursorRef, targetCursorDigest, ...commonBody } = identity.body;
        const candidate = {
            kind: "retry_progress_recorded",
            eventTime: basis.eventTime,
            aggregateType: "frame",
            aggregateId: sourceCursor.frameId,
            parentAggregateId: sourceCursor.graphCallId,
            causationEventRefs: [
                plannedAttempts[index].attemptEventRef,
                index === 0
                    ? completionWitnessEventRef
                    : projectedEvents[index - 1].eventId,
            ],
            correlationId: `${basis.correlationId}/completed-${identity.body.completedRetryDepth}`,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: executionBasisRef,
            runId: sourceCursor.runId,
            graphFunctionRef: progressGraphFunctionRef,
            materializationRef: graph.materializationRef,
            graphCallId: sourceCursor.graphCallId,
            frameId: sourceCursor.frameId,
            payload: targetCursorRef === null
                ? {
                    progressRef: identity.progressRef,
                    progressDigest: identity.progressDigest,
                    ...commonBody,
                }
                : {
                    progressRef: identity.progressRef,
                    progressDigest: identity.progressDigest,
                    ...commonBody,
                    targetCursorRef,
                    targetCursorDigest,
                },
        };
        const projected = projectRuntimeEventFromValidatedHistory(runtimeEventBodiesAtPrefix(projectedPrefix), candidate);
        eventCandidates.push(deepFreeze(candidate));
        projectedEvents.push(projected);
        projectedPrefix = extendRuntimeEventPlanPrefixForValidation(projectedPrefix, projected);
    }
    const progresses = identities.map((identity, index) => deepFreeze({
        kind: "retry_progress_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        progressRef: identity.progressRef,
        progressDigest: identity.progressDigest,
        ...identity.body,
        admissionEventRef: projectedEvents[index].eventId,
    }));
    const ownerMismatch = plannedAttempts.some((attempt, index) => {
        const owner = projectDeclaredCRetryFrontier(projectedPrefix, graph, sourceCursor, graphFunction, attempt.context.retryDepth);
        const available = owner?.state === "progress_available"
            ? owner.available
            : null;
        return available === null ||
            available.progressEventRef !== projectedEvents[index].eventId ||
            available.progress.progressRef !== progresses[index].progressRef ||
            sha256Canonical(available.progress) !==
                sha256Canonical(progresses[index]);
    });
    if (ownerMismatch) {
        return refusal("progress_mismatch", "planned completed retry progress does not reproject through every declared owner");
    }
    const projectedRunPrefix = selectRuntimeEventPrefixFromAuthority(projectedPrefix, { runId: sourceCursor.runId });
    return deepFreeze({
        kind: "completed_retry_progress_plan",
        schemaVersion: "5.0.0",
        predecessorEventDigest: expectedPrefixDigest,
        eventCandidates,
        projectedEvents,
        progresses,
        projectedPrefix,
        replayState: projectedPrefix.kind === "validated_runtime_event_prefix" &&
            projectedRunPrefix.kind === "validated_runtime_event_prefix"
            ? replayValidatedRuntimeEventPrefix(projectedRunPrefix, projectedPrefix)
            : projectRuntimeReplayGuard(projectedRunPrefix, projectedPrefix),
    });
}
/**
 * Admits exactly one pre-effect completed-retry plan inside the ABG transaction
 * that also admits its consuming HoG route. The plan is reprojected from the
 * durable predecessor before any event is staged.
 */
export function admitPlannedCompletedRetryProgressInActiveTransaction(store, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis, plan) {
    assertRuntimeEventTransactionActive(store);
    let predecessorEvents;
    try {
        predecessorEvents = readActiveRuntimeTransactionAtDurablePrefix(store, predecessorPrefix, { durableOnly: true });
    }
    catch {
        return refusal("progress_mismatch", "completed retry progress admission requires its exact durable predecessor");
    }
    return admitPlannedCompletedRetryProgressFromHistory(store, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis, plan, predecessorEvents);
}
/** @internal Same pre-effect reprojection and admission against the owned predecessor. */
export function admitOwnedPlannedCompletedRetryProgressInActiveTransaction(store, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis, plan) {
    assertRuntimeEventTransactionActive(store);
    let predecessor;
    try {
        predecessor = selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(store, predecessorPrefix, { durableOnly: true }));
    }
    catch {
        return refusal("progress_mismatch", "completed retry progress admission requires its exact durable predecessor");
    }
    return admitPlannedCompletedRetryProgressFromHistory(store, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis, plan, runtimeEventBodiesAtPrefix(predecessor));
}
function completedRetryProgressPlanDigest(plan) {
    const digest = createHash("sha256");
    const write = (part) => { digest.update(part, "utf8"); };
    write("{");
    let comma = false;
    for (const key of Object.keys(plan).sort(compareUnicodeCodeUnits)) {
        if (comma)
            write(",");
        comma = true;
        writeCanonicalJson(key, write);
        write(":");
        if (key === "projectedPrefix")
            writeRuntimeEventPrefixValue(plan.projectedPrefix, write);
        else if (key === "replayState")
            writeRuntimeReplayGuardValue(plan.replayState, write);
        else
            writeCanonicalJson(plan[key], write);
    }
    write("}");
    return `sha256:${digest.digest("hex")}`;
}
function ownedCompletedRetryProgressPlansCorrespond(left, right) {
    const { projectedPrefix: aPrefix, replayState: aReplay, ...aFinite } = left;
    const { projectedPrefix: bPrefix, replayState: bReplay, ...bFinite } = right;
    return runtimeEventPrefixesHaveSameOwnedCut(aPrefix, bPrefix) && runtimeReplayGuardsHaveSameOwnedCut(aReplay, bReplay) &&
        sha256Canonical(aFinite) === sha256Canonical(bFinite);
}
function admitPlannedCompletedRetryProgressFromHistory(store, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis, plan, predecessorEvents) {
    if (plan.kind !== "completed_retry_progress_plan" ||
        plan.schemaVersion !== "5.0.0" ||
        plan.predecessorEventDigest !== runtimeEventPrefixDigest(selectValidatedRuntimeEventPrefix(predecessorEvents)) ||
        store.digest() !== plan.predecessorEventDigest ||
        plan.eventCandidates.length !== plan.projectedEvents.length ||
        plan.projectedEvents.length !== plan.progresses.length) {
        return refusal("progress_mismatch", "completed retry progress plan differs from the active transaction prefix");
    }
    const exactPlan = planCompletedRetryProgressFromHistory(predecessorEvents, predecessorPrefix, graph, graphFunction, sourceCursor, targetCursor, completion, basis);
    if (exactPlan.kind !== "completed_retry_progress_plan" ||
        (Array.isArray(predecessorEvents)
            ? completedRetryProgressPlanDigest(exactPlan) !== completedRetryProgressPlanDigest(plan)
            : !ownedCompletedRetryProgressPlansCorrespond(exactPlan, plan))) {
        return refusal("progress_mismatch", "completed retry progress plan differs from its exact owner relation");
    }
    let projectedPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
    for (const [index, candidate] of plan.eventCandidates.entries()) {
        const projected = projectRuntimeEventFromValidatedHistory(runtimeEventBodiesAtPrefix(projectedPrefix), candidate);
        if (sha256Canonical(projected) !==
            sha256Canonical(plan.projectedEvents[index]) ||
            plan.progresses[index]?.admissionEventRef !== projected.eventId) {
            return refusal("progress_mismatch", "completed retry progress plan no longer projects its exact events");
        }
        projectedPrefix = extendRuntimeEventPlanPrefixForValidation(projectedPrefix, projected);
    }
    const admittedEvents = plan.eventCandidates.map((candidate) => admitRuntimeEvent(store, candidate));
    if (admittedEvents.some((event, index) => sha256Canonical(event) !==
        sha256Canonical(plan.projectedEvents[index]))) {
        throw new TypeError("completed retry progress admission differs from its pre-effect plan");
    }
    return plan.progresses;
}
