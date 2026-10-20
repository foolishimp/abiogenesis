import { createHash } from "node:crypto";
import { writeCanonicalJson, compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { isOwnedRuntimeEventPrefix } from "./event_prefix.js";
import { projectConstructionIntentContinuations, projectSelectedActionContinuations } from "./construction_continuation.js";
import { projectObservedWorksiteCommandChildAtPrefix } from "./worksite_input_provenance.js";
import { isObservedWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { projectRegisteredSelectionInputAtPrefix, registeredSelectionInputRelationVersion, registeredSelectionInputDependencyKeys } from "./registered_selection_provenance.js";
import { isRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { isOptionalJsonRecord as isRecord, hasExactJsonKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { projectExactExecutionBasisAtPrefix } from "./invocation_execution_truth.js";
import { projectNativeLivenessRead, projectFrameLivenessContext, projectRuntimeLivenessAtPrefix } from "./runtime_liveness.js";
import { isWorksiteExecutionTask } from "../product/worksite_revision.js";
import { projectRetainedWorksiteInputAtPrefix, retainedWorksiteInputRelationVersion, retainedWorksiteInputDependencyKeys } from "./worksite_input_provenance.js";
import { isWorksitePreparationBoundInput } from "../product/worksite_preparation.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isWorksiteFileReplaceRequest, } from "../product/worksite_effect.js";
import { constructRuntimeFluent, constructRunActiveFluent, constructRunClosedFluent, constructRunTerminalFluent, deriveRuntimeHeldFluentProjection, deriveRuntimeEventCalculusProjection, holdsAt, projectWorksiteTransitionForResult, runtimeFluentKey, eventCalculusDependencies, } from "./event_calculus.js";
import { runtimeEventBodiesAtPrefix, projectOwnedRuntimeEventPrefixAtDurablePrefix, selectOwnedRuntimeEventPrefix, runtimeEventAtPrefix, runtimeEventPrefixLastEnvelope, runtimeEventEnvelopesAtPrefix, indexedRuntimeEventEnvelopes, runtimeEventSelectorExtent, runtimeEventPrefixExtent, runtimePrefixComputation, runtimeEventPrefixDigest, indexedRuntimeEvents, runtimeEventProfileSourceFromValidatedPrefix, selectValidatedRuntimeEventPrefix, selectRuntimeEventPrefixFromAuthority, validatedRuntimeEventPrefixThroughEvent, validatedRuntimeEventPrefixBeforeEvent, runtimeEventProfileScheduleFromValidatedPrefix, } from "./event_prefix.js";
import { deriveInvocationSourceResultBasisAtPrefix, deriveSameRunWorksiteCommandSourceBasisAtPrefix, isInvocationSourceResultBasis, rehydrateInvocationAdmissionAtPrefix, } from "./invocation_admission.js";
import { readActiveRuntimeTransactionAtDurablePrefix, selectActiveRuntimeTransactionHistoryAtDurablePrefix, projectRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { ROOT_EVENT_CONTRACT_DIGEST } from "./event_store.js";
import { projectCCallPhase } from "./c_call.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import { projectFhContinuations, } from "./continuation.js";
/** Prefix selection does not manufacture a discarded complete replay. */
export function projectRuntimePrefixesAtDurablePrefix(predecessorPrefix, runId) {
    const events = projectRuntimeEventsAtDurablePrefix(predecessorPrefix);
    const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
    return Object.freeze({
        authorityPrefix,
        runtimePrefix: selectRuntimeEventPrefixFromAuthority(authorityPrefix, { runId }),
    });
}
export function projectRuntimeTruthAtDurablePrefix(predecessorPrefix, runId, priorDerivation) {
    const { authorityPrefix, runtimePrefix } = projectRuntimePrefixesAtDurablePrefix(predecessorPrefix, runId);
    return deepFreeze({
        authorityPrefix,
        runtimePrefix,
        replayState: replayValidatedRuntimeEventPrefix(runtimePrefix, authorityPrefix, priorDerivation),
    });
}
/** Projects staged transaction truth without exposing raw mutable store reads. */
export function projectActiveRuntimeTransaction(store, durablePredecessor, runId, priorDerivation) {
    const events = readActiveRuntimeTransactionAtDurablePrefix(store, durablePredecessor);
    const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
    const runtimePrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, { runId });
    return deepFreeze({
        authorityPrefix,
        runtimePrefix,
        replayState: replayValidatedRuntimeEventPrefix(runtimePrefix, authorityPrefix, priorDerivation),
    });
}
const REPLAY_GUARD_PREFIXES = new WeakMap();
/** @internal Full logical digest remains the existing replay owner's meaning.
 * Historical values stream through its canonical writer without a full vector. */
export function projectRuntimeReplayGuard(prefix, authority = prefix) {
    const value = deriveReplayPrefixFacts(prefix, authority, undefined, undefined, true);
    REPLAY_GUARD_PREFIXES.set(value, { prefix, authority });
    return value;
}
/** @internal Explicit complete-output boundary, with exact prefix/digest proof. */
export function materializeRuntimeReplayGuard(guard) {
    const receipt = REPLAY_GUARD_PREFIXES.get(guard);
    if (receipt === undefined) {
        if ("kind" in guard && guard.kind === "replay_state")
            return guard;
        throw new TypeError("complete replay output requires its original owner receipt");
    }
    const full = replayValidatedRuntimeEventPrefix(receipt.prefix, receipt.authority);
    if (full.replayDigest !== guard.replayDigest)
        throw new TypeError("replay guard differs from its complete owner output");
    return full;
}
/** @internal Canonical complete output for the existing pure plan digest. The
 * original owner receipt selects values transiently, without a replay vector. */
export function writeRuntimeReplayGuardValue(guard, write) {
    const receipt = REPLAY_GUARD_PREFIXES.get(guard);
    if (receipt === undefined) {
        if ("kind" in guard && guard.kind === "replay_state") {
            writeCanonicalJson(guard, write);
            return;
        }
        throw new TypeError("replay canonical output requires its original owner receipt");
    }
    deriveReplayPrefixFacts(receipt.prefix, receipt.authority, undefined, undefined, true, { guard, write });
}
/** @internal */
export function projectOwnedRuntimeTruthAtDurablePrefix(predecessor, runId) {
    const authorityPrefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(predecessor);
    const runtimePrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, { runId });
    return Object.freeze({ authorityPrefix, runtimePrefix, replayState: projectRuntimeReplayGuard(runtimePrefix, authorityPrefix) });
}
/** @internal Same transaction correspondence, no complete retained body vector. */
export function projectOwnedActiveRuntimeTransaction(store, predecessor, runId) {
    const authorityPrefix = selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(store, predecessor));
    const runtimePrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, { runId });
    return Object.freeze({ authorityPrefix, runtimePrefix, replayState: projectRuntimeReplayGuard(runtimePrefix, authorityPrefix) });
}
const RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS = new Set([
    "actor_cleanup_live",
    "actor_cleanup_pending",
    "actor_invocation_active",
    "actor_result_artifact_available",
    "actor_stderr_available",
    "actor_stdout_available",
    "actor_transport_binding_admitted",
    "actor_process_active",
    "actor_process_live",
    "c_call_active",
    "continuation_open",
    "continuation_response_available",
    "frame_active",
    "frame_held",
    "graph_call_active",
    "interaction_pending",
    "locus_active",
    "parent_waiting_on_child",
    "retry_attempt_active",
    "retry_progress_available",
]);
const RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS = new Set([
    "actor_invocation_closed",
    "actor_invocation_failed",
    "actor_process_exited",
    "actor_process_signal_requested",
    "actor_process_spawn_failed",
    "actor_process_termination_unconfirmed",
    "actor_process_timed_out",
    "continuation_terminated",
    "frame_blocked",
    "frame_closed",
    "frame_failed",
    "graph_call_closed",
    "run_closed",
    "run_terminal",
    "runtime_activity_recent",
    "runtime_failure",
    "terminal_admitted",
]);
const RUN_QUIESCENCE_RUN_INDEPENDENT_FLUENTS = new Set([
    "basis_admitted",
    "continuation_reentry_link_available",
    "implementation_admitted",
    "invocation_admitted",
    "invocation_refused",
    "public_operation_artifact_available",
    "public_operation_ingress_admitted",
    "worksite_observation_current",
]);
export function projectRunQuiescence(prefix) {
    const runIds = [...new Set(Array.from(runtimeEventEnvelopesAtPrefix(prefix), event => event.runId)
            .filter((runId) => runId !== undefined))];
    if (runIds.length !== 1) {
        throw new TypeError("Run quiescence requires one exact Run-scoped prefix");
    }
    const projection = deriveRuntimeHeldFluentProjection(prefix);
    const runId = runIds[0];
    const activeRun = projection.holds.filter((fluent) => fluent.name === "run_active" && fluent.identity === runId);
    const activeGraphCalls = projection.holds.filter((fluent) => fluent.name === "graph_call_active");
    const activeFrames = projection.holds.filter((fluent) => fluent.name === "frame_active");
    const terminalRoutes = projection.holds.filter((fluent) => fluent.name === "terminal_route_available");
    const rootGraphCallId = activeGraphCalls.length === 1
        ? activeGraphCalls[0].identity
        : null;
    const rootFrameId = activeFrames.length === 1
        ? activeFrames[0].identity
        : null;
    const terminalRouteRef = terminalRoutes.length === 1
        ? terminalRoutes[0].identity
        : null;
    const terminalRouteEvent = terminalRouteRef === null
        ? undefined
        : indexedRuntimeEvents(prefix, "payload:routeRef:" + terminalRouteRef).find((event) => event.kind === "traversal_route_admitted" &&
            isRecord(event.payload) && event.payload.routeRef === terminalRouteRef);
    const terminalCCallRef = terminalRouteEvent !== undefined &&
        isRecord(terminalRouteEvent.payload) &&
        typeof terminalRouteEvent.payload.cCallRef === "string"
        ? terminalRouteEvent.payload.cCallRef
        : null;
    const closureSpineKeys = new Set([
        ...(activeRun.length === 1 ? [runtimeFluentKey(activeRun[0])] : []),
        ...(rootGraphCallId === null ? [] : [runtimeFluentKey(activeGraphCalls[0])]),
        ...(rootFrameId === null ? [] : [runtimeFluentKey(activeFrames[0])]),
        ...(terminalRouteRef === null ? [] : [runtimeFluentKey(terminalRoutes[0])]),
    ]);
    // Only the authenticated observation of this exact terminal frame belongs
    // to its closure spine. Other runtime activity remains blocking.
    if (rootFrameId !== null && terminalRouteEvent?.frameId === rootFrameId &&
        terminalRouteEvent.graphCallId === rootGraphCallId && terminalRouteEvent.runId === runId) {
        const context = projectFrameLivenessContext(prefix, rootFrameId);
        const liveness = projectRuntimeLivenessAtPrefix(prefix, rootFrameId);
        if (context !== null && liveness !== null && !liveness.externallyInterrupted &&
            context.scope.basisRef === terminalRouteEvent.basisId && context.scope.graphFunctionRef === terminalRouteEvent.graphFunctionRef &&
            context.scope.graphCallId === rootGraphCallId && context.scope.runId === runId &&
            liveness.activeSystems.includes(context.probes[0].sourceRef)) {
            closureSpineKeys.add(runtimeFluentKey(constructRuntimeFluent({ name: "runtime_invocation_active",
                identity: sha256Canonical(context.scope) })));
        }
    }
    const unknownFluents = projection.holds.filter((fluent) => !closureSpineKeys.has(runtimeFluentKey(fluent)) &&
        !RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS.has(fluent.name) &&
        !RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS.has(fluent.name) &&
        !RUN_QUIESCENCE_RUN_INDEPENDENT_FLUENTS.has(fluent.name));
    const blockingFluents = projection.holds
        .filter((fluent) => (!closureSpineKeys.has(runtimeFluentKey(fluent)) &&
        RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS.has(fluent.name)) ||
        unknownFluents.includes(fluent))
        .map(runtimeFluentKey)
        .sort();
    const terminal = holdsAt(projection, constructRunTerminalFluent(runId)) ||
        holdsAt(projection, constructRunClosedFluent(runId));
    const active = holdsAt(projection, constructRunActiveFluent(runId));
    return deepFreeze({
        kind: "run_quiescence_projection",
        runId,
        prefixDigest: runtimeEventPrefixDigest(prefix),
        rootGraphCallId,
        rootFrameId,
        terminalRouteRef,
        terminalCCallRef,
        disposition: terminal
            ? blockingFluents.length === 0
                ? "quiescent_for_close"
                : "non_quiescent"
            : active && activeRun.length === 1 && activeGraphCalls.length === 1 &&
                activeFrames.length === 1 && terminalRoutes.length === 1
                ? blockingFluents.length === 0
                    ? "quiescent_for_close"
                    : "non_quiescent"
                : active
                    ? "active"
                    : "invalid",
        blockingFluents: Object.freeze(blockingFluents),
    });
}
function stringField(event, name) {
    if (!isRecord(event.payload))
        return null;
    const value = event.payload[name];
    return typeof value === "string" ? value : null;
}
function stringArrayField(event, name) {
    if (!isRecord(event.payload))
        return null;
    const value = event.payload[name];
    return Array.isArray(value) &&
        value.every((entry) => typeof entry === "string" && entry.length > 0)
        ? value
        : null;
}
function nonNegativeIntegerField(event, name) {
    if (!isRecord(event.payload))
        return null;
    const value = event.payload[name];
    return Number.isSafeInteger(value) && value >= 0
        ? value
        : null;
}
function positiveIntegerField(event, name) {
    const value = nonNegativeIntegerField(event, name);
    return value !== null && value > 0 ? value : null;
}
function positiveIntegerArrayField(event, name) {
    if (!isRecord(event.payload))
        return null;
    const value = event.payload[name];
    return Array.isArray(value) &&
        value.every((row) => Number.isSafeInteger(row) && row > 0)
        ? value
        : null;
}
function isNonNegativeInteger(value) {
    return Number.isSafeInteger(value) && value >= 0;
}
export function replay(store, scope) {
    const events = store.readAll();
    const fullPrefix = selectValidatedRuntimeEventPrefix(events);
    const prefix = scope === undefined
        ? fullPrefix
        : selectRuntimeEventPrefixFromAuthority(fullPrefix, scope);
    return replayValidatedRuntimeEventPrefix(prefix, fullPrefix);
}
const REPLAY_DERIVATION = Symbol("owner_runtime_replay_derivation");
const REPLAY_DERIVATION_KEY = Symbol("owner_runtime_replay_derivation_construction");
/** A value-bound derivation proof carried with its immutable result. It is
 * disposable: deserialized results take the same cold owner path. No registry,
 * caller digest, or process-local object is required to reconstruct truth. */
class ReplayDerivation {
    #state;
    #runtimeDigest;
    #authorityDigest;
    #runtimeProfile;
    #authorityProfile;
    constructor(key, state, prefix, authorityPrefix) {
        if (key !== REPLAY_DERIVATION_KEY)
            throw new TypeError("replay derivation is owner constructed");
        this.#state = state;
        this.#runtimeDigest = runtimeEventPrefixDigest(prefix);
        this.#authorityDigest = runtimeEventPrefixDigest(authorityPrefix);
        this.#runtimeProfile = sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(prefix));
        this.#authorityProfile = sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(authorityPrefix));
        Object.freeze(this);
    }
    static matches(state, prefix, authorityPrefix) {
        const proof = Object.getOwnPropertyDescriptor(state, REPLAY_DERIVATION)?.value;
        if (typeof proof !== "object" || proof === null || !(#state in proof) || proof.#state !== state)
            return false;
        return proof.#runtimeDigest === runtimeEventPrefixDigest(prefix) &&
            proof.#authorityDigest === runtimeEventPrefixDigest(authorityPrefix) &&
            proof.#runtimeProfile === sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(prefix)) &&
            proof.#authorityProfile === sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(authorityPrefix));
    }
}
export function projectReplayRouteAtPrefix(prefix, event, authorityPrefix = prefix) {
    const routeKind = stringField(event, "routeKind");
    if (routeKind !== "advance" &&
        routeKind !== "re_enter" &&
        routeKind !== "retry" &&
        routeKind !== "hold" &&
        routeKind !== "gap_stop" &&
        routeKind !== "blocked" &&
        routeKind !== "failed" &&
        routeKind !== "terminal") {
        throw new TypeError(`invalid traversal route kind at ${event.eventId}`);
    }
    const routeRef = stringField(event, "routeRef");
    const routeDigest = stringField(event, "routeDigest");
    const declarationRef = stringField(event, "declarationRef");
    const declarationDigest = stringField(event, "declarationDigest");
    const sourceCursorRef = stringField(event, "sourceCursorRef");
    const sourceCursorDigest = stringField(event, "sourceCursorDigest");
    const consumedAvailabilityRefs = stringArrayField(event, "consumedAvailabilityRefs");
    const replayStateDigest = stringField(event, "replayStateDigest");
    const intentEvent = indexedRuntimeEvents(prefix, "kind:construction_intent_selected").find(candidate => stringField(candidate, "routeRef") === routeRef);
    const nextActionProjectionRef = stringField(intentEvent ?? event, "nextActionProjectionRef");
    const nextActionProjectionDigest = stringField(intentEvent ?? event, "nextActionProjectionDigest");
    const constructionIntentRef = stringField(intentEvent ?? event, "constructionIntentRef");
    const constructionIntentDigest = stringField(intentEvent ?? event, "constructionIntentDigest");
    const nextActionProjection = intentEvent !== undefined &&
        isRecord(intentEvent.payload) &&
        isRecord(intentEvent.payload.nextActionProjection)
        ? intentEvent.payload.nextActionProjection
        : isRecord(event.payload) &&
            isRecord(event.payload.nextActionProjection)
            ? event.payload.nextActionProjection
            : null;
    const constructionIntent = intentEvent !== undefined &&
        isRecord(intentEvent.payload) &&
        isRecord(intentEvent.payload.constructionIntent)
        ? intentEvent.payload.constructionIntent
        : null;
    const graphSpanReentryProjectionRef = stringField(event, "graphSpanReentryProjectionRef");
    const graphSpanReentryProjectionDigest = stringField(event, "graphSpanReentryProjectionDigest");
    const graphSpanReentryProjection = isRecord(event.payload) &&
        isRecord(event.payload.graphSpanReentryProjection)
        ? event.payload.graphSpanReentryProjection
        : null;
    const graphSpanReentryValues = [
        graphSpanReentryProjectionRef,
        graphSpanReentryProjectionDigest,
        graphSpanReentryProjection,
    ];
    if (routeRef === null ||
        routeDigest === null ||
        declarationRef === null ||
        declarationDigest === null ||
        sourceCursorRef === null ||
        sourceCursorDigest === null ||
        (routeKind === "re_enter" &&
            (graphSpanReentryValues.some((value) => value === null) ||
                nextActionProjectionRef !== null ||
                nextActionProjectionDigest !== null ||
                nextActionProjection !== null ||
                constructionIntentRef !== null ||
                constructionIntentDigest !== null ||
                constructionIntent !== null)) ||
        (routeKind !== "re_enter" &&
            graphSpanReentryValues.some((value) => value !== null)) ||
        (routeKind !== "gap_stop" &&
            [
                nextActionProjectionRef,
                nextActionProjectionDigest,
                nextActionProjection,
                constructionIntentRef,
                constructionIntentDigest,
                constructionIntent,
            ].filter((value) => value !== null).length !== 0 &&
            [
                nextActionProjectionRef,
                nextActionProjectionDigest,
                nextActionProjection,
                constructionIntentRef,
                constructionIntentDigest,
                constructionIntent,
            ].some((value) => value === null)) ||
        (routeKind === "gap_stop" &&
            (nextActionProjectionRef === null ||
                nextActionProjectionDigest === null ||
                nextActionProjection === null ||
                constructionIntentRef !== null ||
                constructionIntentDigest !== null ||
                constructionIntent !== null))) {
        throw new TypeError(`incomplete traversal route payload at ${event.eventId}`);
    }
    const assertedBoundInput = isRecord(event.payload) ? event.payload.boundInput : undefined;
    let boundInput;
    const registeredSelectionApplicationRef = stringField(event, "registeredSelectionApplicationRef");
    if (isRecord(event.payload) && Object.hasOwn(event.payload, "registeredSelectionApplicationRef") && registeredSelectionApplicationRef === null)
        throw new TypeError(`invalid registered selection application at ${event.eventId}`);
    if (registeredSelectionApplicationRef !== null) {
        const selected = projectRegisteredSelectionInputAtPrefix(authorityPrefix, event);
        if (selected === null)
            throw new TypeError(`invalid registered selection binding at ${event.eventId}`);
        boundInput = selected;
    }
    else if (assertedBoundInput !== undefined) {
        if (!isRecord(assertedBoundInput) || typeof assertedBoundInput.contractRef !== "string" ||
            (!isWorksitePreparationBoundInput(assertedBoundInput.value) && !isRetainedGraphInput(assertedBoundInput.value)) || routeKind !== "advance") {
            throw new TypeError(`invalid retained input at ${event.eventId}`);
        }
        const retained = projectRetainedWorksiteInputAtPrefix(authorityPrefix, event);
        if (retained === null) {
            throw new TypeError("replay retained input has no exact entry/source/foldback provenance");
        }
        // Provenance reconstructs and raw-admits the exact entry/source join,
        // including equality with the complete asserted admission carrier.
        boundInput = retained.input;
    }
    return {
        ...(boundInput === undefined ? {} : { boundInput }),
        ...(registeredSelectionApplicationRef === null ? {} : { registeredSelectionApplicationRef }),
        routeRef,
        routeDigest: routeDigest,
        routeKind,
        declarationRef,
        declarationDigest: declarationDigest,
        sourceCursorRef,
        sourceCursorDigest: sourceCursorDigest,
        targetCursorRef: stringField(event, "targetCursorRef"),
        targetCursorDigest: stringField(event, "targetCursorDigest"),
        cCallRef: stringField(event, "cCallRef"),
        judgmentRef: stringField(event, "judgmentRef"),
        consumedAvailabilityRefs,
        contractRef: stringField(event, "contractRef"),
        replayStateDigest: replayStateDigest,
        ...(nextActionProjectionRef === null
            ? {}
            : {
                nextActionProjectionRef,
                nextActionProjectionDigest: nextActionProjectionDigest,
                nextActionProjection: nextActionProjection,
                ...(intentEvent === undefined
                    ? {}
                    : {
                        constructionIntentRef: constructionIntentRef,
                        constructionIntentDigest: constructionIntentDigest,
                        constructionIntent: constructionIntent,
                        constructionIntentAdmissionEventRef: intentEvent.eventId,
                    }),
            }),
        ...(graphSpanReentryProjectionRef === null
            ? {}
            : {
                graphSpanReentryProjectionRef,
                graphSpanReentryProjectionDigest: graphSpanReentryProjectionDigest,
                graphSpanReentryProjection: graphSpanReentryProjection,
            }),
        admissionEventRef: event.eventId,
    };
}
const REPLAY_FACTS = Symbol("runtime_replay_facts");
const AUTHORITY_ID = Symbol("runtime_replay_authority");
class RuntimeReplayFacts {
    retain;
    constructor(retain = true) {
        this.retain = retain;
    }
    facts = new Map();
    routes = new Map();
    last;
    lastGuard;
    lastRouteValidation;
    fact(key, version, project, context, needValue = true) {
        const previous = this.facts.get(key);
        if (previous?.version === version && previous.context === context) {
            if (this.retain)
                return previous.value;
            if (!needValue)
                return undefined;
        }
        const value = deepFreeze(project());
        this.facts.set(key, { version, context, value: this.retain ? value : undefined });
        return value;
    }
    /** Only scalar current facts and admitted identifiers use this retained path. */
    scalarFact(key, version, project) {
        const previous = this.facts.get(key);
        if (previous?.version === version)
            return previous.value;
        const value = deepFreeze(project());
        this.facts.set(key, { version, context: undefined, value });
        return value;
    }
}
function sameReplaySelection(current, checked) {
    // The actual ordered owner relation checks generation and membership, not
    // merely the number or last identifier of caller-supplied rows.
    return current.through === checked.through && current.length === checked.length && current.extends(checked);
}
function replayDependencyVersion(prefix, keys, wholePrefix = false) {
    return keys.map(key => {
        const extent = runtimeEventSelectorExtent(prefix, key);
        return key + ":" + extent.count + ":" + extent.lastOrdinal;
    }).join("|") + (wholePrefix ? ";all:" + runtimeEventPrefixExtent(prefix).lastOrdinal : "");
}
export function replayValidatedRuntimeEventPrefix(prefix, authorityPrefix = prefix, priorDerivation) {
    return deriveReplayPrefixFacts(prefix, authorityPrefix, priorDerivation);
}
export function projectValidatedReplayRouteAtPrefix(prefix, admissionEventRef, authorityPrefix = prefix) {
    return deriveReplayPrefixFacts(prefix, authorityPrefix, undefined, admissionEventRef);
}
function deriveReplayPrefixFacts(prefix, authorityPrefix, priorDerivation, routeOnly, guardOnly = false, output) {
    if (!guardOnly && priorDerivation !== undefined && ReplayDerivation.matches(priorDerivation, prefix, authorityPrefix))
        return priorDerivation;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const owned = prefix.kind !== "validated_runtime_event_prefix";
    const facts = runtimePrefixComputation(prefix, REPLAY_FACTS, () => new RuntimeReplayFacts(!owned));
    const authority = runtimePrefixComputation(authorityPrefix, AUTHORITY_ID, () => ({}));
    const authorityEnd = runtimeEventPrefixLastEnvelope(authorityPrefix);
    const profileEnd = sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(prefix));
    const ownedRouteCut = routeOnly !== undefined && isOwnedRuntimeEventPrefix(prefix) && isOwnedRuntimeEventPrefix(authorityPrefix)
        ? { runtime: prefix.selection, authoritySelection: authorityPrefix.selection,
            runtimeEnd: runtimeEventPrefixLastEnvelope(prefix)?.eventId, authorityEnd: authorityEnd?.eventId,
            profileEnd, authorityProfileEnd: sha256Canonical(runtimeEventProfileScheduleFromValidatedPrefix(authorityPrefix)), authority }
        : undefined;
    const checkedRouteCut = facts.lastRouteValidation;
    if (ownedRouteCut !== undefined && checkedRouteCut !== undefined &&
        ownedRouteCut.authority === checkedRouteCut.authority &&
        ownedRouteCut.runtimeEnd === checkedRouteCut.runtimeEnd && ownedRouteCut.authorityEnd === checkedRouteCut.authorityEnd &&
        ownedRouteCut.profileEnd === checkedRouteCut.profileEnd && ownedRouteCut.authorityProfileEnd === checkedRouteCut.authorityProfileEnd &&
        sameReplaySelection(ownedRouteCut.runtime, checkedRouteCut.runtime) &&
        sameReplaySelection(ownedRouteCut.authoritySelection, checkedRouteCut.authoritySelection)) {
        const event = runtimeEventAtPrefix(prefix, routeOnly);
        return event?.kind === "traversal_route_admitted" ? projectReplayRouteAtPrefix(prefix, event, authorityPrefix) : undefined;
    }
    if (guardOnly && output === undefined && facts.lastGuard !== undefined &&
        facts.lastGuard.runtimeEnd === runtimeEventPrefixLastEnvelope(prefix) &&
        facts.lastGuard.authority === authority && facts.lastGuard.authorityEnd === authorityEnd &&
        facts.lastGuard.profileEnd === profileEnd)
        return facts.lastGuard.value;
    if (!guardOnly && !owned && facts.last !== undefined && facts.last.runtimeEnd === runtimeEventPrefixLastEnvelope(prefix) && facts.last.authority === authority && facts.last.authorityEnd === authorityEnd && facts.last.profileEnd === profileEnd)
        return routeOnly === undefined ? facts.last.state : facts.last.state.routes.find(route => route.admissionEventRef === routeOnly);
    const eventCalculus = deriveRuntimeHeldFluentProjection(prefix);
    const runStoppedRows = indexedRuntimeEvents(prefix, "kind:run_stopped").filter(event => stringField(event, "disposition") !== null);
    const runStoppedRouteRefs = new Set(runStoppedRows.map(event => stringField(event, "routeRef")));
    function projectReplayFanOut(envelope) {
        const projected = projectExactFanOutCompletion(prefix, {
            mode: "event_canonical",
            admissionEventRef: envelope.eventId,
        });
        if (projected === null ||
            projected.kind !== "fan_out_completion_admission") {
            throw new TypeError(`invalid fan-out completion truth at ${envelope.eventId}`);
        }
        return projected;
    }
    function projectReplayDelta(envelope) {
        const event = runtimeEventAtPrefix(prefix, envelope.eventId);
        const required = [
            "deltaRef",
            "deltaDigest",
            "actionEvaluationAdmissionRef",
            "actionEvaluationAdmissionDigest",
            "constructionCompositionRef",
            "constructionCompositionDigest",
            "constructionIntentRef",
            "constructionIntentDigest",
            "targetOutcomeRef",
            "edgeFulfillmentLedgerRef",
            "edgeFulfillmentLedgerDigest",
            "edgeClosureDecisionRef",
            "edgeClosureDecisionDigest",
        ];
        const values = Object.fromEntries(required.map((key) => [key, stringField(event, key)]));
        const semanticEvidenceAssetRefs = stringArrayField(event, "semanticEvidenceAssetRefs");
        const runtimeEvidenceEventRefs = stringArrayField(event, "runtimeEvidenceEventRefs");
        const actionEvaluationAdmission = isRecord(event.payload)
            ? event.payload.actionEvaluationAdmission
            : undefined;
        const actionEvaluation = isRecord(event.payload)
            ? event.payload.actionEvaluation
            : undefined;
        const edgeClosureDecision = isRecord(event.payload)
            ? event.payload.edgeClosureDecision
            : undefined;
        if (Object.values(values).some((value) => value === null) ||
            semanticEvidenceAssetRefs === null ||
            runtimeEvidenceEventRefs === null ||
            !isRecord(actionEvaluationAdmission) ||
            !isRecord(actionEvaluation) ||
            !isRecord(edgeClosureDecision)) {
            throw new TypeError(`incomplete construction delta payload at ${event.eventId}`);
        }
        const { kind, schemaVersion, actionEvaluationAdmissionRef, actionEvaluationAdmissionDigest, ...actionEvaluationAdmissionBody } = actionEvaluationAdmission;
        if (kind !== "admitted_action_evaluation" ||
            schemaVersion !== "5.0.0" ||
            actionEvaluationAdmissionRef !==
                values.actionEvaluationAdmissionRef ||
            actionEvaluationAdmissionDigest !==
                values.actionEvaluationAdmissionDigest ||
            sha256Canonical(actionEvaluationAdmissionBody) !==
                values.actionEvaluationAdmissionDigest ||
            actionEvaluationAdmissionBody.constructionCompositionRef !==
                values.constructionCompositionRef ||
            actionEvaluationAdmissionBody.constructionCompositionDigest !==
                values.constructionCompositionDigest ||
            actionEvaluationAdmissionBody.constructionIntentRef !==
                values.constructionIntentRef ||
            actionEvaluationAdmissionBody.constructionIntentDigest !==
                values.constructionIntentDigest ||
            actionEvaluationAdmissionBody.edgeFulfillmentLedgerRef !==
                values.edgeFulfillmentLedgerRef ||
            actionEvaluationAdmissionBody.edgeFulfillmentLedgerDigest !==
                values.edgeFulfillmentLedgerDigest ||
            actionEvaluationAdmissionBody.edgeClosureDecisionRef !==
                values.edgeClosureDecisionRef ||
            actionEvaluationAdmissionBody.edgeClosureDecisionDigest !==
                values.edgeClosureDecisionDigest ||
            actionEvaluationAdmissionBody.workspaceBindingId !==
                stringField(event, "workspaceBindingId") ||
            actionEvaluationAdmissionBody.workspaceBindingDigest !==
                stringField(event, "workspaceBindingDigest") ||
            JSON.stringify(actionEvaluationAdmissionBody.semanticEvidenceAssetRefs) !==
                JSON.stringify(semanticEvidenceAssetRefs) ||
            JSON.stringify(actionEvaluationAdmissionBody.runtimeEvidenceEventRefs) !==
                JSON.stringify(runtimeEvidenceEventRefs) ||
            actionEvaluation.actionEvaluationRef !==
                actionEvaluationAdmissionBody.actionEvaluationRef ||
            actionEvaluation.actionEvaluationDigest !==
                actionEvaluationAdmissionBody.actionEvaluationDigest ||
            edgeClosureDecision.decisionRef !==
                values.edgeClosureDecisionRef ||
            edgeClosureDecision.decisionDigest !==
                values.edgeClosureDecisionDigest) {
            throw new TypeError(`invalid action-evaluation admission at ${event.eventId}`);
        }
        return {
            deltaRef: values.deltaRef,
            deltaDigest: values.deltaDigest,
            actionEvaluationAdmissionRef: values.actionEvaluationAdmissionRef,
            actionEvaluationAdmissionDigest: values.actionEvaluationAdmissionDigest,
            actionEvaluationAdmission,
            actionEvaluation,
            constructionCompositionRef: values.constructionCompositionRef,
            constructionCompositionDigest: values.constructionCompositionDigest,
            constructionIntentRef: values.constructionIntentRef,
            constructionIntentDigest: values.constructionIntentDigest,
            targetOutcomeRef: values.targetOutcomeRef,
            edgeFulfillmentLedgerRef: values.edgeFulfillmentLedgerRef,
            edgeFulfillmentLedgerDigest: values.edgeFulfillmentLedgerDigest,
            edgeClosureDecisionRef: values.edgeClosureDecisionRef,
            edgeClosureDecisionDigest: values.edgeClosureDecisionDigest,
            edgeClosureDecision,
            semanticEvidenceAssetRefs,
            runtimeEvidenceEventRefs,
            admissionEventRef: event.eventId,
        };
    }
    const cCallIds = new Set();
    for (const event of indexedRuntimeEventEnvelopes(prefix, "type:c_call"))
        cCallIds.add(event.aggregateId);
    const cCalls = [];
    for (const cCallRef of cCallIds) {
        const key = "aggregate:c_call:" + cCallRef;
        const projected = projectReplayCCallGuardAtPrefix(prefix, cCallRef);
        if (!guardOnly && routeOnly === undefined) {
            const { resultEventRef, ...fields } = projected;
            const result = resultEventRef === null ? undefined : runtimeEventAtPrefix(prefix, resultEventRef);
            cCalls.push({ ...fields, resultValue: result !== undefined && isRecord(result.payload) ? result.payload.value ?? null : null });
        }
    }
    const routes = [];
    let selectedRoute;
    const stoppedRouteEvents = new Set();
    for (const ref of runStoppedRouteRefs)
        if (ref !== null)
            for (const row of indexedRuntimeEventEnvelopes(prefix, "payload:routeRef:" + ref))
                if (row.kind === "traversal_route_admitted")
                    stoppedRouteEvents.add(row.eventId);
    for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:traversal_route_admitted")) {
        const needValue = (!guardOnly && routeOnly === undefined) || envelope.eventId === routeOnly || stoppedRouteEvents.has(envelope.eventId);
        let projected;
        if (!owned) {
            const event = runtimeEventAtPrefix(prefix, envelope.eventId);
            projected = facts.fact("route:" + event.eventId, String(indexedRuntimeEvents(prefix, "payload:routeRef:" + stringField(event, "routeRef")).filter(candidate => candidate.kind === "construction_intent_selected").at(-1)?.admissionOrdinal ?? 0) + ":" +
                (isRecord(event.payload) && event.payload.boundInput !== undefined ? retainedWorksiteInputRelationVersion(authorityPrefix, event) + registeredSelectionInputRelationVersion(authorityPrefix, event) : ""), () => projectReplayRouteAtPrefix(prefix, event, authorityPrefix), isRecord(event.payload) && event.payload.boundInput !== undefined ? authority : undefined);
        }
        else {
            let dependencies = facts.routes.get(envelope.eventId);
            let event;
            if (dependencies === undefined) {
                event = runtimeEventAtPrefix(prefix, envelope.eventId);
                const retained = isRecord(event.payload) && event.payload.boundInput !== undefined
                    ? retainedWorksiteInputDependencyKeys(authorityPrefix, event) : { keys: [], wholePrefix: false };
                dependencies = { keys: [...new Set(["id:" + event.eventId, "payload:routeRef:" + stringField(event, "routeRef"),
                            ...retained.keys, ...registeredSelectionInputDependencyKeys(event)])], wholePrefix: retained.wholePrefix };
                facts.routes.set(envelope.eventId, dependencies);
            }
            const version = replayDependencyVersion(authorityPrefix, dependencies.keys, dependencies.wholePrefix);
            // A changed named population reopens all canonical route/provenance
            // checks. The retained stamp owns neither the body nor admission truth.
            projected = facts.fact("route:" + envelope.eventId, version, () => {
                event ??= runtimeEventAtPrefix(prefix, envelope.eventId);
                const retained = isRecord(event.payload) && event.payload.boundInput !== undefined
                    ? retainedWorksiteInputDependencyKeys(authorityPrefix, event) : { keys: [], wholePrefix: false };
                facts.routes.set(envelope.eventId, { keys: [...new Set(["id:" + event.eventId, "payload:routeRef:" + stringField(event, "routeRef"),
                            ...retained.keys, ...registeredSelectionInputDependencyKeys(event)])], wholePrefix: retained.wholePrefix });
                return projectReplayRouteAtPrefix(prefix, event, authorityPrefix);
            }, authority, needValue);
        }
        if (projected !== undefined) {
            if ((!guardOnly && routeOnly === undefined) || runStoppedRouteRefs.has(projected.routeRef))
                routes.push(projected);
            if (selectedRoute === undefined && projected.admissionEventRef === routeOnly)
                selectedRoute = projected;
        }
    }
    const fanOutCompletions = [];
    for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:fan_out_completion_admitted")) {
        const projected = facts.fact("fan-out:" + envelope.eventId, String(envelope.admissionOrdinal), () => projectReplayFanOut(envelope), undefined, !guardOnly && routeOnly === undefined);
        if (!guardOnly && routeOnly === undefined && projected !== undefined)
            fanOutCompletions.push(projected);
    }
    const constructionDeltas = [];
    for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:construction_delta_observed")) {
        const projected = facts.fact("delta:" + envelope.eventId, envelope.eventId, () => projectReplayDelta(envelope), undefined, !guardOnly && routeOnly === undefined);
        if (!guardOnly && routeOnly === undefined && projected !== undefined)
            constructionDeltas.push(projected);
    }
    const actorFacts = projectRuntimeActorProcessFactsAtPrefix(prefix);
    const actorProcesses = routeOnly === undefined ? actorFacts : [];
    const worksiteObservationCandidates = [];
    for (const envelope of [...indexedRuntimeEventEnvelopes(prefix, "kind:basis_admitted"), ...indexedRuntimeEventEnvelopes(prefix, "kind:c_call_result_admitted")]
        .sort((a, b) => a.admissionOrdinal - b.admissionOrdinal)) {
        const project = () => {
            const event = runtimeEventAtPrefix(prefix, envelope.eventId);
            const payload = event.payload;
            if (!isRecord(payload))
                return [];
            if (event.kind === "basis_admitted") {
                const request = payload.rawInputValue;
                return isWorksiteFileReplaceRequest(request)
                    ? [{
                            observation: request.predecessorObservation,
                            sourceEventRef: event.eventId,
                        }]
                    : [];
            }
            if (event.kind !== "c_call_result_admitted")
                return [];
            // This is the same Event Calculus dependency relation, including C0's
            // exact failure basis/authority and native currentness observations.
            const priorRows = owned ? eventCalculusDependencies(prefix, event, []) : events;
            const transition = projectWorksiteTransitionForResult(event, priorRows.filter(candidate => candidate.admissionOrdinal < event.admissionOrdinal));
            return transition === null || transition.successorObservation === null
                ? []
                : [{
                        observation: transition.successorObservation,
                        sourceEventRef: event.eventId,
                    }];
        };
        const references = owned ? facts.scalarFact("worksite-refs:" + envelope.eventId, envelope.eventId, () => project().map(row => ({ observationRef: row.observation.observationRef, sourceEventRef: row.sourceEventRef }))) : null;
        const needed = references?.some(row => holdsAt(eventCalculus, constructRuntimeFluent({
            name: "worksite_observation_current", identity: row.observationRef,
        }))) ?? true;
        const projected = owned
            ? routeOnly === undefined && needed ? project() : undefined
            : facts.fact("worksite:" + envelope.eventId, envelope.eventId, project, undefined, routeOnly === undefined);
        if (routeOnly === undefined && projected !== undefined)
            worksiteObservationCandidates.push(...projected);
    }
    const currentWorksiteObservations = routeOnly === undefined ? [...new Map(worksiteObservationCandidates
            .filter(({ observation }) => holdsAt(eventCalculus, constructRuntimeFluent({
            name: "worksite_observation_current",
            identity: observation.observationRef,
        })))
            .map((row) => [row.observation.observationRef, row])).values()] : [];
    const runOpen = indexedRuntimeEvents(prefix, "kind:run_segment_opened")[0];
    const fhContinuations = projectFhContinuations(prefix, eventCalculus, authorityPrefix);
    const intentContinuations = projectConstructionIntentContinuations(authorityPrefix, runOpen?.runId ?? "");
    const selectedContinuations = projectSelectedActionContinuations(authorityPrefix, runOpen?.runId ?? "");
    const continuations = routeOnly === undefined
        ? [...fhContinuations, ...intentContinuations, ...selectedContinuations] : [];
    const graphCallOpen = indexedRuntimeEvents(prefix, "kind:graph_call_opened").find((event) => event.kind === "graph_call_opened" &&
        stringField(event, "parentFrameId") === null);
    const frameOpen = graphCallOpen === undefined
        ? undefined
        : indexedRuntimeEvents(prefix, "kind:frame_opened").find((event) => event.kind === "frame_opened" &&
            event.graphCallId === graphCallOpen.graphCallId);
    const traversalCursor = indexedRuntimeEvents(prefix, "kind:traversal_cursor_entered")[0];
    const terminal = frameOpen === undefined
        ? undefined
        : indexedRuntimeEvents(prefix, "kind:terminal_reached").find((event) => event.kind === "terminal_reached" &&
            event.frameId === frameOpen.frameId);
    const frameClosed = frameOpen === undefined
        ? undefined
        : indexedRuntimeEvents(prefix, "kind:frame_closed").find((event) => event.kind === "frame_closed" &&
            event.frameId === frameOpen.frameId);
    const graphCallClosed = graphCallOpen === undefined
        ? undefined
        : indexedRuntimeEvents(prefix, "kind:graph_call_closed").find((event) => event.kind === "graph_call_closed" &&
            event.graphCallId === graphCallOpen.graphCallId);
    const runClosed = indexedRuntimeEvents(prefix, "kind:run_closed")[0];
    const invocationRefused = indexedRuntimeEvents(prefix, "kind:invocation_refused")[0];
    const runtimeFailure = indexedRuntimeEvents(prefix, "kind:runtime_failure_observed")[0];
    if (runStoppedRows.length > 1) {
        throw new TypeError("replay requires zero or one exact run_stopped event");
    }
    const runStopped = runStoppedRows[0];
    const runId = runOpen?.runId ?? null;
    const runTerminalHeld = runId !== null && holdsAt(eventCalculus, constructRunTerminalFluent(runId));
    if ((runStopped === undefined) !== !runTerminalHeld) {
        throw new TypeError("replay run_stopped event and run_terminal HoldsAt truth disagree");
    }
    if (runStopped !== undefined &&
        (runId === null ||
            runStopped.runId !== runId ||
            runStopped.aggregateId !== runId)) {
        throw new TypeError("replay run_stopped event differs from the selected Run");
    }
    const runStoppedDisposition = runStopped === undefined
        ? null
        : stringField(runStopped, "disposition");
    const operatorRunStoppedHeld = runId !== null && holdsAt(eventCalculus, constructRuntimeFluent({ name: "operator_run_stopped", identity: runId }));
    const operatorRunStopped = !operatorRunStoppedHeld
        ? undefined
        : [...indexedRuntimeEvents(prefix, "kind:run_stopped")].reverse().find((event) => event.kind === "run_stopped" &&
            event.runId === runId &&
            stringField(event, "reasonKind") !== null);
    const projectedRunStoppedEvent = runStopped ?? operatorRunStopped;
    const projectedRunStoppedDisposition = runStoppedDisposition ??
        (operatorRunStopped === undefined
            ? null
            : stringField(operatorRunStopped, "reasonKind"));
    const runStoppedRouteRef = runStopped === undefined
        ? null
        : stringField(runStopped, "routeRef");
    const runStoppedRoutes = runStoppedRouteRef === null
        ? []
        : routes.filter((route) => route.routeRef === runStoppedRouteRef);
    if (runStopped !== undefined &&
        (runStoppedDisposition === null ||
            runStoppedRoutes.length !== 1 ||
            !runStopped.causationEventRefs.includes(runStoppedRoutes[0].admissionEventRef) ||
            runClosed !== undefined ||
            runtimeFailure !== undefined ||
            holdsAt(eventCalculus, constructRunClosedFluent(runId)))) {
        throw new TypeError("replay run_stopped history has contradictory route, causation, disposition, or terminal truth");
    }
    if (routeOnly !== undefined) {
        // Only a completed global validation lends unchanged-cut reuse. Failed or
        // prospective reads never stamp an admitted-history cut.
        if (ownedRouteCut !== undefined)
            facts.lastRouteValidation = ownedRouteCut;
        return selectedRoute;
    }
    const eventStoreDigest = runtimeEventPrefixDigest(prefix);
    const nativeLiveness = projectNativeLivenessRead(prefix, runOpen?.runId ?? null, graphCallOpen?.graphCallId);
    const body = {
        ...(nativeLiveness === null ? {} : { nativeLiveness }),
        eventStoreDigest,
        eventCount: events.length,
        lastAdmissionOrdinal: runtimeEventPrefixLastEnvelope(prefix)?.admissionOrdinal ?? 0,
        runId: runOpen?.runId ?? null,
        graphCallId: graphCallOpen?.graphCallId ?? null,
        frameId: frameOpen?.frameId ?? null,
        traversalCursorRef: traversalCursor === undefined
            ? null
            : stringField(traversalCursor, "cursorRef"),
        traversalCursorDigest: traversalCursor === undefined
            ? null
            : stringField(traversalCursor, "cursorDigest"),
        traversalCursorEventRef: traversalCursor?.eventId ?? null,
        cCalls,
        routes,
        constructionDeltas,
        fanOutCompletions,
        continuations,
        actorProcesses,
        currentWorksiteObservations,
        activeFluents: eventCalculus.holds.map(runtimeFluentKey),
        terminalReachedEventRef: terminal?.eventId ?? null,
        frameClosedEventRef: frameClosed?.eventId ?? null,
        graphCallClosedEventRef: graphCallClosed?.eventId ?? null,
        runClosedEventRef: runClosed?.eventId ?? null,
        runStoppedEventRef: projectedRunStoppedEvent?.eventId ?? null,
        runStoppedDisposition: projectedRunStoppedDisposition,
        invocationRefusalEventRef: invocationRefused?.eventId ?? null,
        runtimeFailureEventRef: runtimeFailure?.eventId ?? null,
        runtimeStatus: runtimeFailure !== undefined
            ? "failed"
            : runClosed !== undefined
                ? "closed"
                : runTerminalHeld
                    ? runStoppedDisposition === "gap_stop"
                        ? "gap_stopped"
                        : runStoppedDisposition === "blocked"
                            ? "blocked"
                            : runStoppedDisposition === "failed"
                                ? "failed"
                                : "stopped"
                    : operatorRunStoppedHeld
                        ? "stopped"
                        : invocationRefused !== undefined
                            ? "refused"
                            : continuations.some((continuation) => continuation.status === "open" ||
                                continuation.status === "responded")
                                ? "held"
                                : runOpen?.runId !== undefined && holdsAt(eventCalculus, constructRunActiveFluent(runOpen.runId))
                                    ? "active"
                                    : "workspace",
    };
    const selected = !guardOnly ? undefined : {
        cCalls: function* () {
            for (const cCallRef of cCallIds) {
                const key = "aggregate:c_call:" + cCallRef;
                const projected = projectReplayCCallGuardAtPrefix(prefix, cCallRef);
                const { resultEventRef, ...fields } = projected;
                const result = resultEventRef === null ? undefined : runtimeEventAtPrefix(prefix, resultEventRef);
                yield { ...fields, resultValue: result !== undefined && isRecord(result.payload) ? result.payload.value ?? null : null };
            }
        },
        routes: function* () {
            for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:traversal_route_admitted"))
                yield projectReplayRouteAtPrefix(prefix, runtimeEventAtPrefix(prefix, envelope.eventId), authorityPrefix);
        },
        fanOutCompletions: function* () {
            for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:fan_out_completion_admitted"))
                yield projectReplayFanOut(envelope);
        },
        constructionDeltas: function* () {
            for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:construction_delta_observed"))
                yield projectReplayDelta(envelope);
        },
    };
    const replayDigest = output?.guard.replayDigest ?? digestReplayBody(body, selected);
    if (output !== undefined)
        writeReplayBody({ kind: "replay_state", schemaVersion: "5.0.0",
            replayRef: output.guard.replayRef, replayDigest, ...body }, selected, output.write);
    if (guardOnly) {
        const { cCalls: _calls, routes: _routes, constructionDeltas: _deltas, fanOutCompletions: _fanout, continuations: _continuations, actorProcesses: _actors, currentWorksiteObservations: _worksite, nativeLiveness: _liveness, ...current } = body;
        const value = deepFreeze({ replayRef: `replay://abiogenesis/${replayDigest.slice("sha256:".length)}`, replayDigest, ...current });
        facts.lastGuard = { runtimeEnd: runtimeEventPrefixLastEnvelope(prefix), authorityEnd, profileEnd, authority, value };
        return value;
    }
    const state = {
        kind: "replay_state",
        schemaVersion: "5.0.0",
        replayRef: `replay://abiogenesis/${replayDigest.slice("sha256:".length)}`,
        replayDigest,
        ...body,
    };
    Object.defineProperty(state, REPLAY_DERIVATION, { value: new ReplayDerivation(REPLAY_DERIVATION_KEY, state, prefix, authorityPrefix) });
    const frozen = deepFreeze(state);
    if (!owned)
        facts.last = { runtimeEnd: runtimeEventPrefixLastEnvelope(prefix), authorityEnd, profileEnd, authority, state: frozen };
    return frozen;
}
const EVENT_TYPED_REFERENCE_PATHS = Object.freeze({
    public_operation_artifact_admitted: [{
            path: ["payload", "causationEventRefs", "*"],
            optional: true,
        }],
    invocation_admitted: [
        { path: ["payload", "reentryBasis", "sourceRouteEventRef"], optional: true },
        { path: ["payload", "reentryBasis", "sourceRunStoppedEventRef"], optional: true },
    ],
    actor_invocation_closed: [
        { path: ["payload", "consumedArtifactEventRef"], optional: true, nullable: true },
        { path: ["payload", "consumedStdoutEventRefs", "*"], optional: true },
        { path: ["payload", "consumedStderrEventRefs", "*"], optional: true },
    ],
    actor_invocation_failed: [
        { path: ["payload", "consumedArtifactEventRef"], optional: true, nullable: true },
        { path: ["payload", "consumedStdoutEventRefs", "*"], optional: true },
        { path: ["payload", "consumedStderrEventRefs", "*"], optional: true },
    ],
    c_call_evidenced: [
        { path: ["payload", "foldbackEventRef"], optional: true },
        { path: ["payload", "childTerminalEventRef"], optional: true },
    ],
    retry_progress_recorded: [{
            path: ["payload", "completionWitnessEventRef"],
            optional: true,
        }],
    fan_out_completion_admitted: [
        { path: ["payload", "taskRows", "*", "foldbackEventRef"], optional: true },
        { path: ["payload", "completedRows", "*", "foldbackEventRef"], optional: true },
        { path: ["payload", "stoppingRow", "foldbackEventRef"], optional: true },
        { path: ["payload", "stoppingRow", "stoppingEventRef"], optional: true },
    ],
    child_foldback_admitted: [{
            path: ["payload", "childTerminalEventRef"],
        }],
    construction_delta_observed: [
        { path: ["payload", "runtimeEvidenceEventRefs", "*"] },
        { path: ["payload", "actionEvaluationAdmission", "runtimeEvidenceEventRefs", "*"] },
        { path: ["payload", "actionEvaluation", "runtimeArchiveInspection", "runtimeEvidenceEventRefs", "*"], optional: true },
    ],
    fh_interaction_opened: [
        { path: ["payload", "causedByEventRef"] },
        { path: ["payload", "cCall", "openedEventRef"] },
        { path: ["payload", "cCall", "fibreSelectedEventRef"] },
        { path: ["payload", "openedTraversalScope", "runOpenEventRef"] },
        { path: ["payload", "openedTraversalScope", "graphCallOpenEventRef"] },
        { path: ["payload", "openedTraversalScope", "frameOpenEventRef"] },
        { path: ["payload", "pendingResult", "admissionEventRef"] },
        { path: ["payload", "pendingJudgment", "admissionEventRef"] },
    ],
    fh_interaction_responded: [{
            path: ["payload", "publicOperationEventRef"],
        }],
    fh_interaction_resume_admitted: [
        { path: ["payload", "openedEventRef"] },
        { path: ["payload", "respondedEventRef"] },
        { path: ["payload", "publicOperationEventRef"] },
    ],
    continuation_abandoned: [{ path: ["payload", "causedByEventRef"] }],
    continuation_superseded: [{ path: ["payload", "causedByEventRef"] }],
    frame_closed: [{ path: ["payload", "terminalReachedEventRef"] }],
    graph_call_closed: [{ path: ["payload", "frameClosedEventRef"] }],
    run_closed: [{ path: ["payload", "graphCallClosedEventRef"] }],
});
function isSemanticRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
const ACTION_EVALUATION_BASIS_REFERENCE_PATHS = Object.freeze([
    ["constructionIntent", "admissionEventRef"],
    ["admittedEvidence", "*", "admissionEventRef"],
    ["runtimeEvidenceEventRefs", "*"],
]);
function typedReferencePathsForEvent(event) {
    const fixed = EVENT_TYPED_REFERENCE_PATHS[event.kind] ?? [];
    if (!isSemanticRecord(event.payload))
        return fixed;
    const valueField = event.kind === "fh_interaction_resume_admitted" &&
        event.payload.successorInputValueKind === "action_evaluation_basis"
        ? "successorInputValue"
        : null;
    return valueField === null
        ? fixed
        : Object.freeze([
            ...fixed,
            ...ACTION_EVALUATION_BASIS_REFERENCE_PATHS.map((path) => ({
                path: ["payload", valueField, ...path],
            })),
        ]);
}
function locateClosedTypedReferences(value, spec) {
    const walk = (current, depth, relation) => {
        if (depth === spec.path.length) {
            return current === undefined ? [] : [{ relation, value: current }];
        }
        const segment = spec.path[depth];
        if (segment === "*") {
            if ((current === undefined || current === null) && spec.optional)
                return [];
            if (!Array.isArray(current)) {
                throw new TypeError(`run semantic relation requires one typed array at ${relation}`);
            }
            return current.flatMap((entry, index) => walk(entry, depth + 1, `${relation}[${index}]`));
        }
        if ((current === undefined || current === null) && spec.optional)
            return [];
        if (!isSemanticRecord(current)) {
            throw new TypeError(`run semantic relation requires one typed carrier at ${relation || segment}`);
        }
        if (!Object.hasOwn(current, segment)) {
            if (spec.optional)
                return [];
            throw new TypeError(`run semantic relation is missing typed path ${relation}.${segment}`);
        }
        return walk(current[segment], depth + 1, relation.length === 0 ? segment : `${relation}.${segment}`);
    };
    return walk(value, 0, "");
}
function relationEdges(events, correspondence, fullEventIds, continuations) {
    const edges = [];
    for (const event of events) {
        const sourceAtom = correspondence.get(event.eventId);
        const specs = [
            { path: ["causationEventRefs", "*"] },
            ...typedReferencePathsForEvent(event),
        ];
        for (const spec of specs) {
            const located = locateClosedTypedReferences(event, spec);
            for (const reference of located) {
                if (reference.value === null && spec.nullable)
                    continue;
                if (typeof reference.value !== "string") {
                    throw new TypeError(`run semantic relation requires one string event reference at ${reference.relation}`);
                }
                // This exact historical intent is an admitted owner fact, not a
                // current-Run event atom or a permitted cross-Run envelope cause.
                if (spec.path[0] === "payload" && reference.value ===
                    continuedIntentReference(event, continuations))
                    continue;
                const targetAtom = correspondence.get(reference.value);
                if (targetAtom === undefined) {
                    throw new TypeError(fullEventIds.has(reference.value)
                        ? `run semantic relation encountered an out-of-scope event reference at ${reference.relation}`
                        : `run semantic relation requires one admitted Run event identity at ${reference.relation}`);
                }
                edges.push({ sourceAtom, relation: reference.relation, targetAtom });
            }
        }
    }
    return Object.freeze(edges);
}
function replaceClosedTypedReferences(current, spec, path, correspondence, fullEventIds, externalIntentRef, depth = 0, relation = "payload") {
    if (depth === path.length) {
        if (current === null && spec.nullable)
            return null;
        if (typeof current !== "string") {
            throw new TypeError(`run semantic relation requires one string event reference at ${relation}`);
        }
        if (current === externalIntentRef)
            return current;
        const atom = correspondence.get(current);
        if (atom === undefined) {
            throw new TypeError(fullEventIds.has(current)
                ? `run semantic relation encountered an out-of-scope event reference at ${relation}`
                : `run semantic relation requires one admitted Run event identity at ${relation}`);
        }
        return atom;
    }
    const segment = path[depth];
    if (segment === "*") {
        if ((current === undefined || current === null) && spec.optional) {
            return current;
        }
        if (!Array.isArray(current)) {
            throw new TypeError(`run semantic relation requires one typed array at ${relation}`);
        }
        return current.map((entry, index) => replaceClosedTypedReferences(entry, spec, path, correspondence, fullEventIds, externalIntentRef, depth + 1, `${relation}[${index}]`));
    }
    if ((current === undefined || current === null) && spec.optional) {
        return current;
    }
    if (!isSemanticRecord(current)) {
        throw new TypeError(`run semantic relation requires one typed carrier at ${relation}`);
    }
    if (!Object.hasOwn(current, segment)) {
        if (spec.optional)
            return current;
        throw new TypeError(`run semantic relation is missing typed path ${relation}.${segment}`);
    }
    return {
        ...current,
        [segment]: replaceClosedTypedReferences(current[segment], spec, path, correspondence, fullEventIds, externalIntentRef, depth + 1, `${relation}.${segment}`),
    };
}
/** Reuse the continuation owner's already-validated original-intent/current
 * parent relation. No other old Run reference becomes local replay evidence. */
function continuedIntentReference(event, continuations) {
    if (event.kind !== "construction_delta_observed" || !isSemanticRecord(event.payload))
        return undefined;
    const payload = event.payload;
    const continuation = continuations.find(row => row.continuationKind === "construction_intent" &&
        row.predecessorContinuationRef !== undefined && row.runId === event.runId &&
        row.parentExecutionBasisRef === event.basisId && row.continuationRef === payload.continuationRef &&
        row.constructionIntentRef === payload.constructionIntentRef && row.terminalEventRef === event.eventId);
    return continuation?.continuationKind === "construction_intent" ? continuation.intentAdmissionEventRef : undefined;
}
function semanticPayloadDigest(event, correspondence, fullEventIds, externalIntentRef) {
    let payload = event.payload;
    if (event.kind === "fh_interaction_resume_admitted") {
        if (!isSemanticRecord(payload)) {
            throw new TypeError("run semantic relation requires one F_H resume payload");
        }
        const { durablePrefixDigest: _physicalPrefixDigest, ...semanticPayload } = payload;
        payload = semanticPayload;
    }
    for (const spec of typedReferencePathsForEvent(event)) {
        if (spec.path[0] !== "payload") {
            throw new TypeError("run semantic relation requires one payload-rooted path");
        }
        payload = replaceClosedTypedReferences(payload, spec, spec.path.slice(1), correspondence, fullEventIds, externalIntentRef);
    }
    return sha256Canonical(payload);
}
export function projectRunIdentityAtPrefix(prefix, runId) {
    const openings = indexedRuntimeEvents(prefix, `aggregate:run:${runId}`)
        .filter(event => event.kind === "run_segment_opened" && event.runId === runId);
    if (openings.length !== 1)
        return null;
    const opening = openings[0], payload = opening.payload;
    if (!isRecord(payload) || payload.runId !== runId || !isSha256Digest(payload.runDigest) ||
        typeof payload.executionBasisRef !== "string" || !isSha256Digest(payload.executionBasisDigest) ||
        opening.basisId !== payload.executionBasisRef || typedReferencePathsForEvent(opening).length !== 0)
        return null;
    const bases = opening.causationEventRefs.flatMap(ref => indexedRuntimeEvents(prefix, `id:${ref}`))
        .filter(event => event.kind === "basis_admitted" && event.basisId === payload.executionBasisRef &&
        isRecord(event.payload) && event.payload.basisRef === payload.executionBasisRef &&
        event.payload.basisDigest === payload.executionBasisDigest && event.payload.basisClass === "root");
    if (bases.length !== 1)
        return null;
    const basis = bases[0].payload;
    if (!isRecord(basis) || opening.parentAggregateId !== basis.workspaceBindingId ||
        ["invocationAdmissionRef", "invocationRef", "workspaceBindingId", "programRef", "graphFunctionRef", "graphRef", "graphDigest"]
            .some(key => typeof payload[key] !== "string" || payload[key] !== basis[key]))
        return null;
    return deepFreeze({
        run: { ref: runId, digest: semanticPayloadDigest(opening, new Map(), new Set()) },
        nativeRun: { ref: runId, digest: payload.runDigest },
        executionBasis: { ref: payload.executionBasisRef, digest: payload.executionBasisDigest },
        runOpenEventRef: opening.eventId,
    });
}
function requiredAtom(eventRef, correspondence, path) {
    const atom = correspondence.get(eventRef);
    if (atom === undefined) {
        throw new TypeError(`run semantic relation lacks owner atom at ${path}`);
    }
    return atom;
}
function projectOwnerFacts(prefix, authorityPrefix, replayState, continuations, correspondence, currentOwnerPrefix) {
    // A source-result basis belongs to an earlier Run. Rehydrate the exact
    // admitted relation as an owner fact; it is not a local causal edge and does
    // not import the source Run's events, fluents, or lifecycle into this Run.
    const sourceResults = runtimeEventBodiesAtPrefix(prefix).flatMap((event) => {
        if (event.kind !== "invocation_admitted" || !isSemanticRecord(event.payload) ||
            event.payload.sourceResultBasis === null ||
            event.payload.sourceResultBasis === undefined)
            return [];
        const asserted = event.payload.sourceResultBasis;
        const invocation = typeof event.payload.invocationAdmissionRef === "string"
            ? rehydrateInvocationAdmissionAtPrefix(validatedRuntimeEventPrefixThroughEvent(authorityPrefix, event.eventId), event.payload.invocationAdmissionRef)
            : null;
        // The public-operation and invocation events are one atomic admission.
        // Its source was checked at entry, before either event. A liveness read
        // inside that pair identifies a different observation prefix.
        const predecessor = invocation === null ? null : validatedRuntimeEventPrefixBeforeEvent(authorityPrefix, invocation.publicOperationEventRef);
        const derived = predecessor !== null && isSemanticRecord(asserted) && isInvocationSourceResultBasis(asserted)
            ? deriveInvocationSourceResultBasisAtPrefix(predecessor, {
                publicAuthorityDigest: asserted.publicAuthorityDigest,
                runtimeInvocationRef: asserted.sourceInvocationRef,
                invocationAdmissionRef: asserted.sourceInvocationAdmissionRef,
                runId: asserted.sourceRunId,
                resultRef: asserted.sourceResultRef,
            })
            : null;
        if (invocation === null || invocation.admissionEventRef !== event.eventId ||
            derived === null || sha256Canonical(derived) !==
            sha256Canonical(asserted)) {
            throw new TypeError("run semantic relation requires one exact admitted external source-result basis");
        }
        return [{
                owner: "invocation_source_result",
                ownerAtom: requiredAtom(event.eventId, correspondence, "source_result"),
                sourceResultBasis: derived,
            }];
    });
    const runEnvironments = runtimeEventBodiesAtPrefix(prefix).flatMap((event) => {
        if (event.kind !== "invocation_admitted" || !isSemanticRecord(event.payload) || event.payload.runEnvironment === undefined)
            return [];
        const invocation = typeof event.payload.invocationAdmissionRef === "string"
            ? rehydrateInvocationAdmissionAtPrefix(validatedRuntimeEventPrefixThroughEvent(authorityPrefix, event.eventId), event.payload.invocationAdmissionRef) : null;
        if (invocation?.runEnvironment === undefined)
            throw new TypeError("STDO environment lacks its exact invocation admission");
        return [{ owner: "invocation_run_environment", ownerAtom: requiredAtom(event.eventId, correspondence, "stdo_environment"),
                invocationAdmissionRef: invocation.invocationAdmissionRef, runEnvironment: invocation.runEnvironment }];
    });
    const runEnvironmentAssemblies = runtimeEventBodiesAtPrefix(prefix).flatMap((event) => {
        if (event.kind !== "actor_transport_binding_admitted" || !isSemanticRecord(event.payload) ||
            !isSemanticRecord(event.payload.instructionAssembly) || !isSemanticRecord(event.payload.instructionAssembly.manifest) ||
            !isSemanticRecord(event.payload.instructionAssembly.manifest.runEnvironment))
            return [];
        const identity = event.payload.instructionAssembly.manifest.runEnvironment;
        const invocation = typeof identity.invocationAdmissionRef === "string" ? rehydrateInvocationAdmissionAtPrefix(authorityPrefix, identity.invocationAdmissionRef) : null;
        if (invocation === null || invocation.runEnvironment === undefined || invocation.runEnvironment.evidenceDigest !== identity.evidenceDigest ||
            invocation.runEnvironment.environmentDigest !== identity.environmentDigest)
            throw new TypeError("STDO assembly lacks its exact environment evidence");
        return [{ owner: "run_environment_instruction_assembly", ownerAtom: requiredAtom(event.eventId, correspondence, "stdo_assembly"),
                instructionAssembly: event.payload.instructionAssembly }];
    });
    const sameRunSources = runtimeEventBodiesAtPrefix(prefix).flatMap((event) => {
        if (event.kind !== "basis_admitted" || !isSemanticRecord(event.payload) || event.payload.basisClass !== "child" ||
            !isWorksiteExecutionTask(event.payload.rawInputValue))
            return [];
        const basis = typeof event.basisId === "string" ? projectExactExecutionBasisAtPrefix(authorityPrefix, event.basisId) : null;
        const parent = basis?.parentExecutionBasisRef ? projectExactExecutionBasisAtPrefix(authorityPrefix, basis.parentExecutionBasisRef) : null;
        const cut = validatedRuntimeEventPrefixBeforeEvent(authorityPrefix, event.eventId);
        if (isObservedWorksiteCommandExecutionTask(event.payload.rawInputValue)) {
            const observed = parent === null || basis?.parentCCallRef == null || typeof event.runId !== "string" ? null
                : projectObservedWorksiteCommandChildAtPrefix(cut, { parentBasis: parent, parentCCallRef: basis.parentCCallRef, runId: event.runId, task: event.payload.rawInputValue });
            if (observed === null)
                throw new TypeError("observed C2 child preparation does not reproduce at admission cut");
            return [{ owner: "same_run_observed_input", ownerAtom: requiredAtom(event.eventId, correspondence, "child_observed_input"),
                    preparationResultRef: observed.preparationResult.payload.resultRef,
                    acquisitionEventRef: observed.acquisitionEvent.eventId, inputRef: observed.inputRef,
                    sourceObservedInput: observed.sourceObservedInput, protectedObservations: observed.protectedObservations }];
        }
        const source = parent === null || basis?.parentCCallRef == null || typeof event.runId !== "string" ? null
            : deriveSameRunWorksiteCommandSourceBasisAtPrefix(cut, { parentBasis: parent, parentCCallRef: basis.parentCCallRef,
                runId: event.runId, task: event.payload.rawInputValue }, currentOwnerPrefix);
        if (source === null)
            throw new TypeError("child C2 source does not reproduce at its admitted preparation cut");
        return [{ owner: "same_run_source_result", ownerAtom: requiredAtom(event.eventId, correspondence, "child_source_result"),
                sourceResultBasis: source }];
    });
    const cCalls = replayState.cCalls.map((cCall) => {
        const phase = projectCCallPhase(prefix, cCall.cCallRef);
        if (phase.openedEventRef === null) {
            throw new TypeError("replayed CCall lacks its atomic opening pair");
        }
        return {
            owner: "c_call",
            ownerAtom: requiredAtom(phase.openedEventRef, correspondence, "c_call"),
            cCallRef: cCall.cCallRef,
            phase: phase.phase,
        };
    });
    const routes = replayState.routes.map((route) => ({
        owner: "route",
        ownerAtom: requiredAtom(route.admissionEventRef, correspondence, "route"),
        routeKind: route.routeKind,
        declarationRef: route.declarationRef,
        cCallRef: route.cCallRef,
        contractRef: route.contractRef,
        ...(route.boundInput === undefined ? {} : { retainedInput: {
                ownerAtom: requiredAtom(route.admissionEventRef, correspondence, "route_bound_input"),
                referenceBinding: { ref: route.boundInput.admissionRef, atom: `${requiredAtom(route.admissionEventRef, correspondence, "route_bound_input")}/raw_input` },
                contractRef: route.boundInput.contractRef,
                subjectDigest: route.boundInput.subjectDigest, value: route.boundInput.value,
            } }),
    }));
    const continuationFacts = continuations.map((continuation) => ({
        owner: continuation.continuationKind === "fh_interaction" ? "fh_continuation" : "construction_continuation",
        ownerAtom: requiredAtom(continuation.openedEventRef, correspondence, "continuation"),
        continuationRef: continuation.continuationRef,
        cCallRef: continuation.cCallRef,
        ...(continuation.continuationKind === "fh_interaction" ? { requestContractRef: continuation.requestContractRef,
            responseContractRef: continuation.responseContractRef } : {
            causedByEventRef: continuation.causedByEventRef,
            intentAdmissionEventRef: continuation.intentAdmissionEventRef,
        }),
        constructionIntentRef: continuation.constructionIntentRef,
        status: continuation.status,
    }));
    const fanOut = replayState.fanOutCompletions.map((completion) => ({
        owner: "fan_out_completion",
        ownerAtom: requiredAtom(completion.admissionEventRef, correspondence, "fan_out_completion"),
        applicationRef: completion.applicationRef,
        batchRef: completion.batchRef,
        completionKind: completion.completionKind,
        taskOrdinals: completion.completionKind === "complete_vector"
            ? completion.taskRows.map((row) => row.ordinal)
            : [
                ...completion.completedRows.map((row) => row.ordinal),
                completion.stoppingRow.ordinal,
            ],
    }));
    const deltas = replayState.constructionDeltas.map((delta) => ({
        owner: "construction_delta",
        ownerAtom: requiredAtom(delta.admissionEventRef, correspondence, "construction_delta"),
        constructionIntentRef: delta.constructionIntentRef,
        targetOutcomeRef: delta.targetOutcomeRef,
        semanticEvidenceAssetRefs: delta.semanticEvidenceAssetRefs,
    }));
    return Object.freeze([
        ...sourceResults,
        ...runEnvironments,
        ...runEnvironmentAssemblies,
        ...sameRunSources,
        ...cCalls,
        ...routes,
        ...continuationFacts,
        ...fanOut,
        ...deltas,
    ]);
}
const EVENT_IDENTITY_FLUENT_NAMES = Object.freeze([
    "actor_process_signal_requested",
    "actor_result_artifact_available",
    "actor_stderr_available",
    "actor_stdout_available",
    "runtime_failure",
]);
function semanticHoldsAt(fluentRef, correspondence, fullEventIds) {
    for (const name of EVENT_IDENTITY_FLUENT_NAMES) {
        const prefix = `${name}(`;
        if (!fluentRef.startsWith(prefix) || !fluentRef.endsWith(")"))
            continue;
        const eventRef = fluentRef.slice(prefix.length, -1);
        const identityAtom = correspondence.get(eventRef);
        if (identityAtom === undefined) {
            throw new TypeError(fullEventIds.has(eventRef)
                ? `run semantic relation encountered out-of-scope HoldsAt identity ${name}`
                : `run semantic relation requires admitted HoldsAt identity ${name}`);
        }
        return { name, identityAtom };
    }
    return fluentRef;
}
export function projectRunSemanticReplayProjection(fullPrefix, runId, currentOwnerPrefix) {
    return projectRunSemanticReplay(fullPrefix, runId, undefined, currentOwnerPrefix);
}
/** One replay-owned derivation for the read owner's joined projections. */
export function projectRunReplayContext(fullPrefix, runId, currentOwnerPrefix) {
    const prefix = selectRuntimeEventPrefixFromAuthority(fullPrefix, { runId });
    const replay = replayValidatedRuntimeEventPrefix(prefix, fullPrefix);
    if (replay.runId !== runId)
        return null;
    const context = { prefix, replay, calculus: deriveRuntimeEventCalculusProjection(prefix) };
    return deepFreeze({ ...context, semanticReplay: projectRunSemanticReplay(fullPrefix, runId, context, currentOwnerPrefix) });
}
/** @internal Explicit joined historical output for the read owner; its private prefix is not a Public array. */
export function projectOwnedRunReplayContext(fullPrefix, runId, currentOwnerPrefix) {
    const prefix = selectRuntimeEventPrefixFromAuthority(fullPrefix, { runId });
    const replay = replayValidatedRuntimeEventPrefix(prefix, fullPrefix);
    if (replay.runId !== runId)
        return null;
    const context = { prefix, replay, calculus: deriveRuntimeHeldFluentProjection(prefix) };
    return deepFreeze({ ...context, semanticReplay: projectRunSemanticReplay(fullPrefix, runId, context, currentOwnerPrefix) });
}
function projectRunSemanticReplay(fullPrefix, runId, context, currentOwnerPrefix) {
    if (runId.length === 0) {
        throw new TypeError("run semantic relation requires one non-empty Run id");
    }
    const fullEvents = runtimeEventBodiesAtPrefix(fullPrefix);
    const runPrefix = context?.prefix ?? selectValidatedRuntimeEventPrefix(fullEvents, { runId });
    const events = runtimeEventBodiesAtPrefix(runPrefix);
    if (events.length === 0 ||
        !indexedRuntimeEvents(runPrefix, "run:" + runId).some((event) => event.runId === runId) ||
        events.some((event) => event.runId !== undefined && event.runId !== runId)) {
        throw new TypeError("run semantic relation requires one exact causally closed Run prefix");
    }
    const correspondence = new Map(events.map((event, index) => [event.eventId, `r${index + 1}`]));
    if (correspondence.size !== events.length) {
        throw new TypeError("run semantic relation requires unique event identities");
    }
    const fullEventIds = new Set(fullEvents.map((event) => event.eventId));
    const replayState = context?.replay ?? replayValidatedRuntimeEventPrefix(runPrefix, fullPrefix);
    if (replayState.runId !== runId) {
        throw new TypeError("run semantic relation differs from its selected Run");
    }
    const continuations = replayState.continuations;
    const eventAtoms = events.map((event) => ({
        atomRef: correspondence.get(event.eventId),
        eventKind: event.kind,
        semanticPayloadDigest: semanticPayloadDigest(event, correspondence, fullEventIds, continuedIntentReference(event, continuations)),
        eventTime: event.eventTime,
        correlationId: event.correlationId,
        workflowVersion: event.workflowVersion,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        parentAggregateId: event.parentAggregateId,
        scopeClass: event.scopeClass,
        basisId: event.basisId ?? null,
        runId: event.runId ?? null,
        graphFunctionRef: event.graphFunctionRef ?? null,
        materializationRef: event.materializationRef ?? null,
        graphCallId: event.graphCallId ?? null,
        frameId: event.frameId ?? null,
    }));
    const lifecycle = {
        traversalCursorPresent: replayState.traversalCursorEventRef !== null,
        terminalReached: replayState.terminalReachedEventRef !== null,
        frameClosed: replayState.frameClosedEventRef !== null,
        graphCallClosed: replayState.graphCallClosedEventRef !== null,
        runClosed: replayState.runClosedEventRef !== null,
        runStopped: replayState.runStoppedEventRef !== null,
        runStoppedDisposition: replayState.runStoppedDisposition,
        invocationRefused: replayState.invocationRefusalEventRef !== null,
        runtimeFailed: replayState.runtimeFailureEventRef !== null,
    };
    const outcome = {
        routeKinds: replayState.routes.map((route) => route.routeKind),
        cCallStatuses: replayState.cCalls.map((cCall) => cCall.status),
        continuationStatuses: replayState.continuations.map((row) => row.status),
        fanOutCompletionKinds: replayState.fanOutCompletions.map((row) => row.completionKind),
    };
    const semanticBody = {
        eventContractDigest: runtimeEventProfileScheduleFromValidatedPrefix(runPrefix).currentEventContractDigest,
        ...(replayState.nativeLiveness === undefined ? {} : { nativeLiveness: replayState.nativeLiveness }),
        runId,
        eventCount: events.length,
        eventKinds: events.map((event) => event.kind),
        eventAtoms,
        relations: relationEdges(events, correspondence, fullEventIds, continuations),
        ownerFacts: projectOwnerFacts(runPrefix, fullPrefix, replayState, continuations, correspondence, currentOwnerPrefix),
        lifecycle,
        outcome,
        holdsAt: replayState.activeFluents.map((fluent) => semanticHoldsAt(fluent, correspondence, fullEventIds)),
        runtimeStatus: replayState.runtimeStatus,
    };
    const viewDigest = sha256Canonical(semanticBody);
    const physicalCoordinates = {
        kind: "run_semantic_replay_physical_coordinates",
        fullEventHistoryDigest: runtimeEventPrefixDigest(fullPrefix),
        scopedEventStoreDigest: replayState.eventStoreDigest,
        scopedReplayRef: replayState.replayRef,
        scopedReplayDigest: replayState.replayDigest,
        events: events.map((event, index) => ({
            eventRef: `r${index + 1}`,
            eventId: event.eventId,
            admissionOrdinal: event.admissionOrdinal,
            payloadDigest: event.payloadDigest,
        })),
    };
    return deepFreeze({
        kind: "run_semantic_relation_view",
        schemaVersion: "5.0.0",
        viewRef: `run-semantic-relation://abiogenesis/${viewDigest.slice("sha256:".length)}`,
        viewDigest,
        ...semanticBody,
        physicalCoordinates,
    });
}
function digestReplayBody(body, selected) {
    const hash = createHash("sha256");
    const write = (part) => { hash.update(part); };
    writeReplayBody(body, selected, write);
    return `sha256:${hash.digest("hex")}`;
}
function writeReplayBody(body, selected, write) {
    write("{");
    let comma = false;
    for (const key of Object.keys(body).sort(compareUnicodeCodeUnits)) {
        if (comma)
            write(",");
        comma = true;
        writeCanonicalJson(key, write);
        write(":");
        const rows = selected?.[key];
        if (rows === undefined)
            writeCanonicalJson(body[key], write);
        else {
            write("[");
            let rowComma = false;
            for (const row of rows()) {
                if (rowComma)
                    write(",");
                rowComma = true;
                writeCanonicalJson(row, write);
            }
            write("]");
        }
    }
    write("}");
}
/** @internal The same canonical selected C_Call fields without its historical value. */
export function projectReplayCCallGuardAtPrefix(prefix, cCallRef) {
    const key = "aggregate:c_call:" + cCallRef;
    const facts = runtimePrefixComputation(prefix, REPLAY_FACTS, () => new RuntimeReplayFacts(prefix.kind === "validated_runtime_event_prefix"));
    return facts.scalarFact("c_call:" + cCallRef, replayDependencyVersion(prefix, [key]), () => projectReplayCCallFieldsAtPrefix(prefix, cCallRef));
}
function projectReplayCCallFieldsAtPrefix(prefix, cCallRef) {
    const key = "aggregate:c_call:" + cCallRef;
    const rows = indexedRuntimeEvents(prefix, key);
    const phase = projectCCallPhase(prefix, cCallRef);
    const evidenceRows = rows.filter((event) => event.kind === "c_call_evidenced");
    const openedEvent = rows.find((event) => event.kind === "c_call_opened");
    const resultEvent = rows.find((event) => event.kind === "c_call_result_admitted");
    const judgmentEvent = rows.find((event) => event.kind === "c_call_judged");
    const attempt = openedEvent === undefined
        ? null
        : positiveIntegerField(openedEvent, "attempt");
    const openedPayload = openedEvent === undefined || !isRecord(openedEvent.payload)
        ? null
        : openedEvent.payload;
    const batchRef = openedPayload?.batchRef;
    const taskOrdinal = openedPayload?.taskOrdinal;
    const programLocusRef = openedEvent === undefined
        ? null
        : stringField(openedEvent, "programLocusRef");
    const retryPath = openedEvent === undefined
        ? null
        : positiveIntegerArrayField(openedEvent, "retryPath");
    if (openedEvent === undefined ||
        openedPayload === null ||
        !Object.hasOwn(openedPayload, "batchRef") ||
        !Object.hasOwn(openedPayload, "taskOrdinal") ||
        (batchRef !== null && typeof batchRef !== "string") ||
        (taskOrdinal !== null &&
            (!Number.isSafeInteger(taskOrdinal) || taskOrdinal < 0)) ||
        attempt === null ||
        programLocusRef === null ||
        retryPath === null) {
        throw new TypeError(`incomplete CCall identity payload at ${cCallRef}`);
    }
    const status = phase.phase === "judged"
        ? "judged"
        : phase.phase === "result_admitted"
            ? "result_admitted"
            : "fibre_selected";
    return {
        cCallRef,
        batchRef: batchRef,
        taskOrdinal: taskOrdinal,
        attempt,
        programLocusRef,
        retryPath,
        eventKinds: rows.map((event) => event.kind),
        evidenceRefs: evidenceRows
            .map((event) => stringField(event, "evidenceRef"))
            .filter((value) => value !== null),
        resultRef: resultEvent === undefined ? null : stringField(resultEvent, "resultRef"),
        resultDigest: resultEvent === undefined
            ? null
            : stringField(resultEvent, "resultDigest"),
        resultClass: resultEvent === undefined ? null : stringField(resultEvent, "resultClass"),
        resultContractRef: resultEvent === undefined ? null : stringField(resultEvent, "contractRef"),
        resultValueKind: resultEvent === undefined ? null : stringField(resultEvent, "valueKind"),
        resultEventRef: resultEvent?.eventId ?? null,
        judgmentRef: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgmentRef"),
        judgment: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgment"),
        status,
    };
}
/** @internal Same canonical process fold, without transport/body retention. */
export function projectRuntimeActorProcessFactsAtPrefix(prefix) {
    const facts = runtimePrefixComputation(prefix, REPLAY_FACTS, () => new RuntimeReplayFacts(prefix.kind === "validated_runtime_event_prefix"));
    const ids = new Set(indexedRuntimeEventEnvelopes(prefix, "type:actor_invocation").map(event => event.aggregateId));
    return Object.freeze(Array.from(ids, actorInvocationRef => facts.scalarFact("actor:" + actorInvocationRef, replayDependencyVersion(prefix, ["related:" + actorInvocationRef]), () => projectRuntimeActorProcessFields(prefix, actorInvocationRef))));
}
function projectRuntimeActorProcessFields(prefix, actorInvocationRef) {
    const actorRows = indexedRuntimeEventEnvelopes(prefix, "related:" + actorInvocationRef);
    const body = (event) => event === undefined ? undefined : runtimeEventAtPrefix(prefix, event.eventId);
    const opened = body(actorRows.find((event) => event.kind === "actor_invocation_started"));
    const processStarted = body(actorRows.find((event) => event.kind === "actor_process_started"));
    const processExited = body(actorRows.find((event) => event.kind === "actor_process_exited"));
    const artifact = body(actorRows.find((event) => event.kind === "actor_result_artifact_observed"));
    const timeout = body(actorRows.find((event) => event.kind === "actor_process_timeout_observed"));
    const closed = actorRows.find((event) => event.kind === "actor_invocation_closed");
    const failed = actorRows.find((event) => event.kind === "actor_invocation_failed");
    const exitStatus = processExited === undefined || !isRecord(processExited.payload)
        ? null
        : processExited.payload.status;
    return {
        actorInvocationRef,
        actorRef: opened === undefined ? null : stringField(opened, "actorRef"),
        transportBindingRef: opened === undefined
            ? null
            : stringField(opened, "transportBindingRef"),
        transportBindingDigest: opened === undefined
            ? null
            : stringField(opened, "transportBindingDigest"),
        processRef: processStarted === undefined
            ? actorRows.find((event) => event.aggregateType === "process")?.aggregateId ?? null
            : stringField(processStarted, "processRef"),
        streamEventRefs: actorRows
            .filter((event) => event.kind === "actor_process_stdout_observed" ||
            event.kind === "actor_process_stderr_observed")
            .map((event) => event.eventId),
        timeoutClass: timeout === undefined
            ? null
            : stringField(timeout, "timeoutClass"),
        timedOut: timeout !== undefined,
        signalSequence: actorRows
            .filter((event) => event.kind === "actor_process_signal_requested")
            .map((event) => stringField(body(event), "signal"))
            .filter((value) => value !== null),
        exitStatus: Number.isSafeInteger(exitStatus) ? exitStatus : null,
        exitSignal: processExited === undefined ? null : stringField(processExited, "signal"),
        terminationConfirmed: processExited !== undefined &&
            !actorRows.some((event) => event.kind === "actor_process_termination_unconfirmed"),
        transportDigest: artifact === undefined
            ? null
            : stringField(artifact, "transportDigest"),
        status: failed !== undefined
            ? "failed"
            : closed !== undefined
                ? "closed"
                : "active",
    };
}
