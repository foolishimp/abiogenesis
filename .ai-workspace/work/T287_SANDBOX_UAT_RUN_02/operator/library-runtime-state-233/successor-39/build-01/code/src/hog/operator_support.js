import { projectOwnedRuntimeTruthAtDurablePrefix } from "../abg/replay.js";
import { projectOwnedRuntimeEventPrefixAtDurablePrefix, selectRuntimeEventPrefixFromAuthority } from "../abg/event_prefix.js";
import { sampleNativeEventTime } from "../abg/native_event_time.js";
import { projectRuntimeTruthAtDurablePrefix, projectRuntimePrefixesAtDurablePrefix, } from "../abg/index.js";
import { sha256Canonical } from "../shared/digests.js";
export function sameCanonical(left, right) {
    try {
        return sha256Canonical(left) ===
            sha256Canonical(right);
    }
    catch {
        return false;
    }
}
export function canonicalDigest(value) {
    try {
        return sha256Canonical(value);
    }
    catch {
        return null;
    }
}
export function runtimePrefixAtDurable(prefix, runId) {
    return projectRuntimePrefixesAtDurablePrefix(prefix, runId).runtimePrefix;
}
export function replayAtDurable(prefix, runId) {
    return projectRuntimeTruthAtDurablePrefix(prefix, runId).replayState;
}
export function admissionBasis(clock, stage) {
    return {
        eventTime: sampleNativeEventTime(),
        correlationId: `${clock.correlationId}/${stage}`,
        causationEventRefs: [],
    };
}
export function isExactLocusStep(stop, term) {
    if (stop.kind === "traversal_cursor")
        return term.kind === "c_workflow";
    if (term.kind !== "c_of" ||
        term.fibre !== stop.computeRegime ||
        term.programLocusRef !== stop.programLocusRef ||
        term.armId !== stop.armId ||
        term.compositionRef !== stop.compositionRef)
        return false;
    if (stop.stopClass === "executable") {
        return term.requirement.kind === "executable_leaf_requirement" &&
            term.inputCarrierRef === stop.inputContractRef &&
            term.outputCarrierRef === stop.outputContractRef &&
            term.requirement.implementationBindingRef ===
                stop.implementationBindingRef &&
            term.requirement.inputContractRef === stop.inputContractRef &&
            term.requirement.outputContractRef === stop.outputContractRef &&
            term.requirement.evidenceContractRef === stop.evidenceContractRef &&
            term.requirement.failureContractRef === stop.failureContractRef &&
            term.requirement.refusalContractRef === stop.refusalContractRef &&
            term.requirement.judgmentContractRef === stop.judgmentContractRef;
    }
    return term.requirement.kind === "interaction_leaf_requirement" &&
        term.inputCarrierRef === stop.requestContractRef &&
        term.requirement.interactionKind === stop.interactionKind &&
        term.requirement.actorCapabilityRef === stop.actorCapabilityRef &&
        term.requirement.requestContractRef === stop.requestContractRef &&
        term.requirement.responseContractRef === stop.responseContractRef &&
        term.requirement.continuationContractRef ===
            stop.continuationContractRef;
}
export function materializedInputAtCursor(graph, cursor) {
    if (cursor === null)
        return null;
    for (const materialization of graph.fanOutMaterializations) {
        const member = materialization.members.find((candidate) => candidate.ordinal === cursor.taskOrdinal &&
            candidate.memberRef === cursor.inputRef &&
            candidate.memberDigest === cursor.inputDigest);
        if (member !== undefined) {
            return {
                inputContractRef: materialization.inputMemberContractRef,
                value: member.value,
            };
        }
    }
    return null;
}
export function traversalBasis(input) {
    return {
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
    };
}
/** @internal Same selected authority without requesting complete public arrays. */
export function ownedRuntimePrefixAtDurable(prefix, runId) {
    return selectRuntimeEventPrefixFromAuthority(projectOwnedRuntimeEventPrefixAtDurablePrefix(prefix), { runId });
}
/** @internal */
export function ownedReplayAtDurable(prefix, runId) {
    return projectOwnedRuntimeTruthAtDurablePrefix(prefix, runId).replayState;
}
