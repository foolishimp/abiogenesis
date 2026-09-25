import { isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { projectNativeWorkCommandSourceAtPrefix } from "./native_worksite_execution.js";
import { projectWorksiteInputLeafResultAtPrefix } from "./worksite_input_provenance.js";
import { isSemanticJobEnvelope } from "../product/semantic_job.js";
import { isSemanticJobRevisionEnvelope, deriveSemanticJobRevision } from "../product/semantic_revision.js";
import { semanticJobConstructionSourceAtPrefix, semanticJobReadDependenciesAtPrefix } from "./semantic_job.js";
import { isWorksiteFileParentsSuccess } from "../product/worksite_effect.js";
/** D2's single prefix-owned observation projection. No caller grants or ledger. */
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { constructWorksiteObservation, isWorksiteObservation } from "../product/worksite_effect.js";
import { isSemanticStageEnvelope, projectSemanticWorksiteCoordinates } from "../product/semantic_stage.js";
import { isSemanticRevisionEnvelope, isSemanticRevisionRequest, isSemanticRevisionSelectionInput, isSemanticRevisionSelection, deriveSemanticRevision, semanticRevisionSelectionInputMatchesRequest } from "../product/semantic_revision.js";
import { WORKSITE_REVISION_IDS, worksiteExecutionSources } from "../product/worksite_revision.js";
import { isWorksiteRevisionCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { isWorksitePreparationInput } from "../product/worksite_preparation.js";
import { WORKSITE_C0_IDS } from "../gtl/worksite_c0.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import { projectAdmittedCCallStateAtPrefix } from "./c_call.js";
import { projectArtifactTruth } from "./artifact_truth.js";
import { validatePublicOperationBasis } from "./environment_admission.js";
import { WITNESS_CONTENT_CONTRACTS } from "./witness_admission_operation.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { constructWorksiteSubject } from "../product/worksite_effect.js";
import { projectRuntimeEventFromValidatedHistory } from "./event_store.js";
import { projectWorksiteTransitionForResult, deriveRuntimeEventCalculusProjection, holdsAt, constructWorksiteObservationCurrentFluent } from "./event_calculus.js";
import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const record = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isRevisionEnvelope = (value) => isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value);
function sameSemanticSubject(a, b) {
    if (isSemanticJobEnvelope(a) && isSemanticJobEnvelope(b))
        return same(a.job, b.job) && same(a.basis, b.basis) && same(a.declaration, b.declaration);
    return isSemanticStageEnvelope(a) && isSemanticStageEnvelope(b) && same(a.lifecycle, b.lifecycle) && same(a.sourceHandoff, b.sourceHandoff);
}
const hash = (v) => sha256Canonical(v);
const one = (rows, accepts) => {
    const selected = rows.filter(accepts);
    return selected.length === 1 ? selected[0] : null;
};
const sameScope = (a, b) => a.basisId === b.basisId && a.runId === b.runId &&
    a.graphCallId === b.graphCallId && a.frameId === b.frameId;
/** Reconstruct the recorded native leaf carrier, then reuse CCall's outcome
 * validator. No GraphFunction is synthesized and no value-equivalent wrapper
 * is admitted as its producer. The installed resolution row owns the locus. */
export function projectWorksiteRevisionNativeResult(prefix, coordinate) {
    try {
        const events = runtimeEventsFromValidatedPrefix(prefix);
        const opened = one(events, e => e.kind === "c_call_opened" && e.aggregateId === coordinate.cCallRef);
        const fibre = one(events, e => e.kind === "c_call_fibre_selected" && e.aggregateId === coordinate.cCallRef);
        const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === coordinate.cCallRef);
        const judgment = one(events, e => e.kind === "c_call_judged" && e.aggregateId === coordinate.cCallRef);
        if (opened === null || fibre === null || result === null || judgment === null || !record(opened.payload) ||
            !record(fibre.payload) || !record(result.payload) || !record(judgment.payload) || opened.payload.callClass !== "leaf" ||
            fibre.payload.callClass !== "leaf" || typeof opened.basisId !== "string" ||
            ![fibre, result, judgment].every(e => sameScope(e, opened)) ||
            result.eventId !== coordinate.resultAdmissionEventRef || judgment.eventId !== coordinate.judgmentEventRef ||
            result.payload.resultRef !== coordinate.resultRef || result.payload.resultDigest !== coordinate.resultDigest ||
            !fibre.causationEventRefs.includes(opened.eventId))
            return null;
        const openedPayload = opened.payload, fibrePayload = fibre.payload;
        const basis = projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
        const set = basis === null ? null : rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
        const row = set === null ? null : one(set.rows, r => r.graphFunctionRef === basis.graphFunctionRef &&
            r.programLocusRef === openedPayload.programLocusRef && r.implementationRef === fibrePayload.implementationRef &&
            r.implementationBindingRef === fibrePayload.implementationBindingRef && r.requirementKey === fibrePayload.implementationRequirementKey);
        if (basis === null || set === null || row === null || set.implementationSetDigest !== basis.implementationSetDigest ||
            fibre.payload.implementationSetRef !== set.implementationSetRef || row.computeRegime !== fibre.payload.regime ||
            opened.graphFunctionRef !== basis.graphFunctionRef || opened.payload.graphFunctionRef !== basis.graphFunctionRef ||
            result.payload.contractRef !== (result.payload.resultClass === "success" ? row.outputContractRef : row.failureContractRef) ||
            judgment.payload.contractRef !== basis.judgmentContractRef)
            return null;
        const call = { ...opened.payload, ...fibre.payload, kind: "c_call", schemaVersion: "5.0.0", runId: opened.runId,
            inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef, failureContractRef: row.failureContractRef,
            refusalContractRef: row.refusalContractRef, refusalValueKind: basis.refusalValueKind,
            evidenceContractRef: basis.evidenceContractRef, judgmentContractRef: basis.judgmentContractRef,
            rejectionContractRef: row.refusalContractRef, transitionContractRef: basis.transitionContractRef,
            closureContractRef: basis.closureContractRef, closureContractDigest: basis.closureContractDigest,
            judgmentPredicateRef: judgment.payload.predicateRef, terminalPredicateRef: basis.terminalPredicateRef,
            replayProjectionRef: basis.replayProjectionRef, terminalKind: basis.terminalKind, childGraphFunctionRef: null,
            interactionSetRef: basis.interactionSetRef, interactionRequirementKey: null, interactionKind: null,
            actorCapabilityRef: null, responseContractRef: null, continuationContractRef: null,
            openedEventRef: opened.eventId, fibreSelectedEventRef: fibre.eventId };
        return projectAdmittedCCallStateAtPrefix(prefix, call, { kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", ...result.payload, admissionEventRef: result.eventId }, { kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", ...judgment.payload, admissionEventRef: judgment.eventId });
    }
    catch {
        return null;
    }
}
/** Artifact truth already reconstructs and validates the causal installs,
 * lock, ProductSet, A and W. This is an exact coordinate selection of it. */
function nativeBinding(prefix, binding) {
    const row = one(projectArtifactTruth(prefix).artifacts, r => r.operationId === "abg.operation.workspace.bind" &&
        r.authorityScopeRef === binding.bindingId && r.authorityScopeDigest === binding.bindingDigest &&
        r.admissionEventRef === binding.admissionEventRef);
    if (row === null || !record(row.artifact) || !record(row.workspaceAuthorityBasis))
        return null;
    const { kind: _kind, ...body } = row.artifact;
    return same({ kind: "workspace_binding", ...body, admissionEventRef: row.admissionEventRef }, binding)
        ? { row, binding, authority: row.workspaceAuthorityBasis } : null;
}
function bindingAtCoordinate(prefix, ref, digest) {
    const row = one(projectArtifactTruth(prefix).artifacts, r => r.operationId === "abg.operation.workspace.bind" &&
        r.authorityScopeRef === ref && r.authorityScopeDigest === digest);
    if (row === null || !record(row.artifact))
        return null;
    const { kind: _kind, ...body } = row.artifact;
    return { kind: "workspace_binding", ...body, admissionEventRef: row.admissionEventRef };
}
/** All exact covering witness occurrences, not a latest/first chosen token. */
export function projectWorksiteRevisionBindingCover(prefix, before, after, historicalBases) {
    try {
        if (same(before, after))
            return [];
        const old = nativeBinding(prefix, before), current = nativeBinding(prefix, after);
        if (old === null || current === null || !same(old.authority, current.authority) || before.workspaceId !== after.workspaceId ||
            before.authorizedActorRef !== after.authorizedActorRef)
            return null;
        const events = runtimeEventsFromValidatedPrefix(prefix);
        const bases = historicalBases.flatMap((b, index) => {
            const actual = projectExactExecutionBasisAtPrefix(prefix, b.basisRef);
            return actual !== null && same(actual, b) && historicalBases.findIndex(row => row.basisRef === b.basisRef) === index &&
                b.workspaceBindingId === before.bindingId && b.workspaceBindingDigest === before.bindingDigest ? [b] : [];
        });
        if (bases.length === 0)
            return null;
        const covers = events.filter(event => {
            const p = event.payload;
            if (event.kind !== "declaration_reprice_admitted" || !record(p) || p.act !== "reprice" ||
                event.aggregateId !== after.bindingId || p.declarationRef !== before.bindingId || p.beforeDigest !== before.bindingDigest ||
                p.afterDigest !== after.bindingDigest || p.subjectKind !== "authority_basis" || !record(p.context) || p.context.kind !== "basis" ||
                !record(p.context.basis) || !same(p.context.basis, { ref: p.subjectRef, digest: p.subjectDigest }) ||
                p.contentKind !== "typed_payload" || p.contentContractRef !== WITNESS_CONTENT_CONTRACTS.reprice.ref || p.contentContractDigest !== WITNESS_CONTENT_CONTRACTS.reprice.digest ||
                !record(p.contentValue) || !same(p.contentValue, { declarationRef: p.declarationRef, beforeDigest: p.beforeDigest, afterDigest: p.afterDigest,
                changeClass: p.changeClass, owningTicketRef: p.owningTicketRef, reason: p.reason }) ||
                !Array.isArray(p.evidence))
                return false;
            const evidence = p.evidence;
            if (![before, after].every(w => evidence.filter(c => record(c) && c.ref === w.bindingId && c.digest === w.bindingDigest).length === 1))
                return false;
            const historical = one(bases, b => b.basisRef === p.subjectRef && b.basisDigest === p.subjectDigest);
            const admitted = historical === null ? null : events.find(e => e.eventId === historical.admissionEventRef);
            const operation = one(events, e => e.kind === "public_operation_admitted" && event.causationEventRefs.includes(e.eventId) &&
                record(e.payload) && e.payload.operationId === "abg.operation.witness.admit" && e.payload.memberKey === "reprice");
            if (admitted === null || admitted === undefined || operation === null || !record(operation.payload) ||
                [old.row.admissionOrdinal, current.row.admissionOrdinal, admitted.admissionOrdinal, operation.admissionOrdinal].some(o => o >= event.admissionOrdinal) ||
                event.basisId !== historical.basisRef || event.parentAggregateId !== operation.parentAggregateId ||
                event.correlationId !== operation.correlationId || event.eventTime !== operation.eventTime ||
                operation.aggregateId !== after.bindingId || operation.basisId !== after.bindingId ||
                operation.payload.authorityScopeRef !== after.bindingId || operation.payload.authorityScopeDigest !== after.bindingDigest ||
                operation.payload.workspaceBindingRef !== after.bindingId || operation.payload.workspaceBindingDigest !== after.bindingDigest ||
                operation.payload.productSetRef !== after.productSetId || operation.payload.productSetDigest !== after.productSetDigest ||
                operation.payload.dependencyLockRef !== after.lockId || operation.payload.dependencyLockDigest !== after.lockDigest ||
                operation.payload.actorRef !== p.actorRef || operation.payload.actorDigest !== p.actorDigest || p.operatorActorRef !== p.actorRef ||
                p.actorRef !== after.authorizedActorRef)
                return false;
            const { eventId: _eventId, admissionOrdinal: _ordinal, payloadDigest: _payloadDigest, eventContractDigest: _eventContractDigest, ...candidate } = event;
            if (!same(projectRuntimeEventFromValidatedHistory(events.filter(e => e.admissionOrdinal < event.admissionOrdinal), candidate), event))
                return false;
            return validatePublicOperationBasis({ ...operation.payload,
                eventTime: operation.eventTime, correlationId: operation.correlationId, causationEventRefs: operation.causationEventRefs }, "abg.operation.witness.admit", "reprice") === null;
        });
        return covers.length === 0 ? null : covers.map(e => e.eventId);
    }
    catch {
        return null;
    }
}
function inputWorksite(basis, prefix) {
    const input = basis.rawInputValue;
    if (isRevisionEnvelope(input))
        return input.current.worksite;
    if (isSemanticStageEnvelope(input) || isSemanticJobEnvelope(input))
        return input.worksite;
    if (prefix !== undefined && isWorksiteFileParentsSuccess(input)) {
        const source = runtimeEventsFromValidatedPrefix(prefix).find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === input.request.sourceEnvelopeRef);
        const value = record(source?.payload) ? source.payload.value : null;
        const original = isSemanticJobEnvelope(value) ? semanticJobConstructionSourceAtPrefix(prefix, value) : null;
        return original?.seed.basisRef === basis.basisRef ? original.worksite : null;
    }
    return null;
}
/** Binding coordinates may change; domain meaning and effect bounds may not. */
export function worksiteRevisionMeaningMatches(prior, current) {
    return same(prior.workspaceAuthorityBasis, current.workspaceAuthorityBasis) &&
        prior.workspaceBinding.workspaceId === current.workspaceBinding.workspaceId && prior.targets.length === current.targets.length &&
        prior.capabilityGrant.actorRef === current.capabilityGrant.actorRef && prior.capabilityGrant.capabilityRef === current.capabilityGrant.capabilityRef &&
        prior.capabilityGrant.operationId === current.capabilityGrant.operationId && same(prior.capabilityGrant.definitionKey, current.capabilityGrant.definitionKey) &&
        prior.capabilityGrant.authorityBasisRef === current.capabilityGrant.authorityBasisRef && prior.capabilityGrant.authorityBasisDigest === current.capabilityGrant.authorityBasisDigest &&
        same(prior.commands, current.commands) && same(prior.outcomePredicates, current.outcomePredicates) && same(prior.allowedWriteTerritories, current.allowedWriteTerritories);
}
function coordinateFor(events, result) {
    if (!record(result.payload) || typeof result.payload.resultRef !== "string" || typeof result.payload.resultDigest !== "string")
        return null;
    const judged = one(events, e => e.kind === "c_call_judged" && e.aggregateId === result.aggregateId);
    return judged === null ? null : { cCallRef: result.aggregateId, resultRef: result.payload.resultRef,
        resultDigest: result.payload.resultDigest, resultAdmissionEventRef: result.eventId, judgmentEventRef: judged.eventId };
}
function nativeHistory(prefix, parentRef, causeRefs) {
    const events = runtimeEventsFromValidatedPrefix(prefix), bases = [], eligible = new Set();
    const parent = projectWorksiteRevisionNativeResult(prefix, parentRef);
    const first = parent === null ? null : isRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
    if (parent === null || parent.result.resultClass !== "success" || parent.judgment.judgment !== "advance" ||
        (!isSemanticStageEnvelope(first) && !isSemanticJobEnvelope(first)))
        return null;
    function addBasis(ref) {
        const b = projectExactExecutionBasisAtPrefix(prefix, ref);
        if (b === null)
            return null;
        if (!bases.some(r => r.basisRef === b.basisRef))
            bases.push(b);
        eligible.add(b.invocationAdmissionRef);
        return b;
    }
    const jobSource = isSemanticJobEnvelope(first) ? semanticJobConstructionSourceAtPrefix(prefix, first) : null;
    const firstWorksite = first.worksite ?? jobSource?.worksite ?? null;
    if (firstWorksite === null)
        return null;
    const firstBasis = addBasis(parent.cCall.basisId);
    if (firstBasis === null || firstBasis.workspaceBindingId !== firstWorksite.workspaceBinding.bindingId ||
        firstBasis.workspaceBindingDigest !== firstWorksite.workspaceBinding.bindingDigest)
        return null;
    const heads = [firstBasis];
    for (const ref of causeRefs) {
        const cause = projectWorksiteRevisionNativeResult(prefix, ref), b = cause === null ? null : addBasis(cause.cCall.basisId);
        const invocation = b === null ? null : projectExactInvocationAdmissionAtPrefix(prefix, b.invocationAdmissionRef);
        if (cause === null || b === null || cause.cCall.cCallRef === parent.cCall.cCallRef ||
            (b.invocationAdmissionRef !== firstBasis.invocationAdmissionRef && invocation?.sourceResultBasis?.sourceResultRef !== parent.result.resultRef))
            return null;
        heads.push(b);
        let ancestor = b;
        const seen = new Set();
        while (ancestor.parentExecutionBasisRef !== null) {
            if (seen.has(ancestor.basisRef))
                return null;
            seen.add(ancestor.basisRef);
            const next = addBasis(ancestor.parentExecutionBasisRef);
            if (next === null || next.invocationAdmissionRef !== b.invocationAdmissionRef)
                return null;
            ancestor = next;
        }
    }
    let ancestor = parent, seed = firstBasis;
    const visited = new Set();
    while (isRevisionEnvelope(ancestor.result.value)) {
        const envelope = ancestor.result.value;
        if (visited.has(envelope.revisionBasis.basisRef) || !sameSemanticSubject(envelope.current, first))
            return null;
        visited.add(envelope.revisionBasis.basisRef);
        const ordinal = events.find(e => e.eventId === ancestor.result.admissionEventRef).admissionOrdinal;
        for (const coordinate of [envelope.revisionBasis.request.parent, ...envelope.revisionBasis.request.causes]) {
            const source = projectWorksiteRevisionNativeResult(prefix, coordinate), b = source === null ? null : addBasis(source.cCall.basisId);
            const judged = events.find(e => e.eventId === coordinate.judgmentEventRef);
            if (source === null || b === null || judged === undefined || judged.admissionOrdinal >= ordinal)
                return null;
        }
        const source = projectWorksiteRevisionNativeResult(prefix, envelope.revisionBasis.request.parent);
        if (source === null || source.result.resultClass !== "success" || source.judgment.judgment !== "advance")
            return null;
        const b = addBasis(source.cCall.basisId);
        if (b === null)
            return null;
        ancestor = source;
        seed = b;
    }
    if (isSemanticJobEnvelope(ancestor.result.value)) {
        const source = semanticJobConstructionSourceAtPrefix(prefix, ancestor.result.value);
        if (source === null || !sameSemanticSubject(ancestor.result.value, first))
            return null;
        seed = source.seed;
        addBasis(seed.basisRef);
    }
    else {
        const initial = seed.rawInputValue;
        if (!isSemanticStageEnvelope(ancestor.result.value) || !isSemanticStageEnvelope(initial) || initial.worksite === null ||
            !same(initial.worksite, ancestor.result.value.worksite) || !sameSemanticSubject(initial, first))
            return null;
    }
    return { seed, prior: firstWorksite, bases, eligible: [...eligible], heads };
}
const session = () => ({ cache: new Map(), active: new Set() });
const originKey = (origin) => canonicalJson(origin);
function observationPhysicalEqual(a, b) {
    return a.state === b.state && (a.state === "absent" || (b.state === "file" && a.fileIdentity === b.fileIdentity && a.fileDigest === b.fileDigest && a.byteLength === b.byteLength));
}
function samePhysicalSubject(prefix, a, b) {
    if (a.relativePath !== b.relativePath || a.subjectUri !== b.subjectUri)
        return false;
    if (a.workspaceBindingIdentity === b.workspaceBindingIdentity && a.workspaceBindingDigest === b.workspaceBindingDigest)
        return true;
    const truth = projectArtifactTruth(prefix).artifacts;
    const authority = (subject) => one(truth, r => r.operationId === "abg.operation.workspace.bind" &&
        r.authorityScopeRef === subject.workspaceBindingIdentity && r.authorityScopeDigest === subject.workspaceBindingDigest)?.workspaceAuthorityBasis;
    const left = authority(a), right = authority(b);
    return left !== undefined && right !== undefined && same(left, right);
}
/** A known native write under any W for this physical subject invalidates an
 * older alias. It never provides a replacement from an unrelated invocation. */
function invalidatedAcrossBindings(prefix, subject, ordinal, work) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    return events.some(e => {
        if (e.kind !== "c_call_result_admitted" || e.admissionOrdinal <= ordinal || typeof e.basisId !== "string")
            return false;
        const transition = work === undefined ? projectWorksiteTransitionForResult(e, events.filter(p => p.admissionOrdinal < e.admissionOrdinal)) : retainedTransition(work, e);
        if (transition === null)
            return false;
        const basis = projectExactExecutionBasisAtPrefix(prefix, e.basisId);
        return basis !== null && record(basis.rawInputValue.subject) && samePhysicalSubject(prefix, basis.rawInputValue.subject, subject);
    });
}
function projectionFacts(prefix, result, work) {
    if (work.cache.has(result.eventId))
        return work.cache.get(result.eventId);
    if (work.active.has(result.eventId))
        return null;
    work.active.add(result.eventId);
    let answer = null;
    try {
        const events = runtimeEventsFromValidatedPrefix(prefix), coordinate = coordinateFor(events, result);
        const state = coordinate === null ? null : projectWorksiteRevisionNativeResult(prefix, coordinate);
        const basis = state === null ? null : projectExactExecutionBasisAtPrefix(prefix, state.cCall.basisId);
        if (state === null || basis === null || state.cCall.implementationRef !== SEMANTIC_REVISION_IDS.projectionImplementationRef ||
            state.cCall.implementationBindingRef !== SEMANTIC_REVISION_IDS.projectionBindingRef || state.cCall.regime !== "F_D" ||
            state.result.resultClass !== "success" || state.judgment.judgment !== "advance" || state.judgment.predicateRef !== SEMANTIC_REVISION_IDS.projectionPredicateRef ||
            !isRevisionEnvelope(state.result.value) || !isSemanticRevisionRequest(basis.rawInputValue))
            return null;
        const request = basis.rawInputValue, envelope = state.result.value;
        if (!same(envelope.revisionBasis.request, request) || envelope.current.worksite === null)
            return null;
        const before = selectValidatedRuntimeEventPrefix(Object.freeze(events.filter(e => e.admissionOrdinal < result.admissionOrdinal)));
        const history = nativeHistory(before, request.parent, request.causes);
        const parent = projectWorksiteRevisionNativeResult(before, request.parent), selection = projectWorksiteRevisionNativeResult(before, request.selection);
        if (history === null || parent === null || selection === null || (!isSemanticStageEnvelope(parent.result.value) && !isSemanticJobEnvelope(parent.result.value) && !isRevisionEnvelope(parent.result.value)) || !isSemanticRevisionSelection(selection.result.value) ||
            selection.result.resultClass !== "success" || selection.judgment.judgment !== "advance" ||
            !["F_P", "F_H"].includes(selection.cCall.regime) || selection.cCall.outputContractRef !== SEMANTIC_REVISION_IDS.selectionContractRef ||
            !same(isSemanticJobRevisionEnvelope(envelope) && (isSemanticJobEnvelope(parent.result.value) || isSemanticJobRevisionEnvelope(parent.result.value))
                ? deriveSemanticJobRevision(parent.result.value, request, selection.result.value, request.currentWorksite, history.prior)
                : deriveSemanticRevision(parent.result.value, request, selection.result.value), envelope))
            return null;
        const selectionBasis = projectExactExecutionBasisAtPrefix(before, selection.cCall.basisId);
        if (selectionBasis === null || !semanticRevisionSelectionInputMatchesRequest(selectionBasis.rawInputValue, request))
            return null;
        const current = envelope.current.worksite, environment = nativeBinding(before, current.workspaceBinding);
        const invocation = projectExactInvocationAdmissionAtPrefix(before, basis.invocationAdmissionRef);
        if (environment === null || !same(environment.authority, current.workspaceAuthorityBasis) ||
            current.workspaceBinding.bindingId !== basis.workspaceBindingId || current.workspaceBinding.bindingDigest !== basis.workspaceBindingDigest ||
            invocation?.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], current.capabilityGrant))
            return null;
        const evidence = one(events, e => e.kind === "c_call_evidenced" && e.aggregateId === result.aggregateId);
        if (evidence === null || !record(evidence.payload) || !sameScope(evidence, result) || evidence.payload.evidenceClass !== "deterministic" ||
            evidence.payload.cCallRef !== state.cCall.cCallRef || evidence.payload.contractRef !== state.cCall.evidenceContractRef ||
            evidence.payload.implementationRef !== SEMANTIC_REVISION_IDS.projectionImplementationRef || evidence.payload.inputDigest !== hash(request) ||
            evidence.payload.outputDigest !== hash(envelope) || !state.result.evidenceRefs.includes(String(evidence.payload.evidenceRef)) ||
            !result.causationEventRefs.includes(evidence.eventId) || evidence.admissionOrdinal >= result.admissionOrdinal)
            return null;
        const { evidenceRef, evidenceDigest, ...evidenceBody } = evidence.payload;
        if (evidenceDigest !== hash(evidenceBody) || evidenceRef !== `evidence://abiogenesis/${String(evidenceDigest).slice(7)}`)
            return null;
        const origins = deriveCurrentOrigins(before, history.seed, history.prior, current, history.eligible, history.bases, work);
        if (origins === null)
            return null;
        answer = { state, basis, envelope, origins, ordinal: result.admissionOrdinal, history };
        return answer;
    }
    catch {
        return null;
    }
    finally {
        work.active.delete(result.eventId);
        work.cache.set(result.eventId, answer);
    }
}
function deriveCurrentOrigins(prefix, seedBasis, historical, current, eligible, bases, work) {
    const seed = inputWorksite(seedBasis, prefix), events = runtimeEventsFromValidatedPrefix(prefix);
    if (seed === null || !worksiteRevisionMeaningMatches(historical, current) || !same(seed.workspaceAuthorityBasis, current.workspaceAuthorityBasis))
        return null;
    const results = [];
    for (const [ordinal, row] of current.targets.entries()) {
        const prior = historical.targets[ordinal];
        if (prior === undefined || prior.role !== row.role || prior.target.subject.subjectUri !== row.target.subject.subjectUri ||
            prior.target.subject.relativePath !== row.target.subject.relativePath || prior.target.territory.territoryUri !== row.target.territory.territoryUri ||
            prior.target.territory.relativeRoot !== row.target.territory.relativeRoot || !same(prior.target.territory.operations, row.target.territory.operations))
            return null;
        const candidates = [];
        const original = seed.targets.find(t => samePhysicalSubject(prefix, t.target.subject, row.target.subject) && t.role === row.role);
        const seedEvent = events.find(e => e.eventId === seedBasis.admissionEventRef);
        if (original !== undefined && seedEvent !== undefined && !invalidatedAcrossBindings(prefix, original.target.subject, seedEvent.admissionOrdinal))
            candidates.push({
                origin: { kind: "admitted_input", basisAdmissionEventRef: seedBasis.admissionEventRef, inputAdmissionRef: seedBasis.rawInputAdmissionRef, inputDigest: seedBasis.rawInputDigest },
                basis: seedBasis, worksite: seed, row: original, ordinal: seedEvent.admissionOrdinal, ancestors: []
            });
        for (const event of events) {
            if (event.kind !== "c_call_result_admitted" || !record(event.payload) || event.payload.resultClass !== "success")
                continue;
            const transition = projectWorksiteTransitionForResult(event, events.filter(p => p.admissionOrdinal < event.admissionOrdinal));
            if (transition?.successorObservation !== null && transition !== null) {
                const replacement = currentReplacement(prefix, transition.successorObservation), b = replacement?.basis;
                if (replacement === null || b === undefined || !eligible.includes(b.invocationAdmissionRef) || !record(b.rawInputValue.subject) ||
                    !samePhysicalSubject(prefix, b.rawInputValue.subject, row.target.subject) ||
                    invalidatedAcrossBindings(prefix, row.target.subject, event.admissionOrdinal))
                    continue;
                const request = b.rawInputValue;
                const sourceBinding = bindingAtCoordinate(prefix, b.workspaceBindingId, b.workspaceBindingDigest);
                if (sourceBinding === null || !same(request.workspaceAuthorityBasis, current.workspaceAuthorityBasis))
                    continue;
                const source = { ...historical, workspaceAuthorityBasis: request.workspaceAuthorityBasis, workspaceBinding: sourceBinding,
                    capabilityGrant: request.capabilityGrant };
                const target = { ...prior.target, subject: request.subject, territory: request.territory, predecessorObservation: transition.successorObservation };
                candidates.push({ origin: { kind: "admitted_replacement", resultAdmissionEventRef: replacement.event.eventId, evidenceEventRef: replacement.evidence.eventId },
                    basis: b, worksite: source, row: { role: row.role, target, base64: String(request.replacementBytes) }, ordinal: event.admissionOrdinal, ancestors: [] });
            }
            else if (isRevisionEnvelope(event.payload.value)) {
                const b = typeof event.basisId === "string" ? projectExactExecutionBasisAtPrefix(prefix, event.basisId) : null;
                if (b === null || !eligible.includes(b.invocationAdmissionRef))
                    continue;
                const projection = projectionFacts(prefix, event, work);
                if (projection === null || projection.history.seed.basisRef !== seedBasis.basisRef || !same(projection.envelope.current.worksite.workspaceAuthorityBasis, current.workspaceAuthorityBasis))
                    continue;
                const source = projection.envelope.current.worksite, sourceRow = source.targets.find(t => samePhysicalSubject(prefix, t.target.subject, row.target.subject) && t.role === row.role);
                if (sourceRow === undefined || invalidatedAcrossBindings(prefix, sourceRow.target.subject, event.admissionOrdinal))
                    continue;
                const sourceProof = projection.origins[source.targets.indexOf(sourceRow)];
                if (sourceProof === undefined)
                    continue;
                candidates.push({ origin: { kind: "admitted_binding_projection", resultAdmissionEventRef: event.eventId, judgmentEventRef: projection.state.judgment.admissionEventRef },
                    basis: projection.basis, worksite: source, row: sourceRow, ordinal: event.admissionOrdinal, ancestors: [originKey(sourceProof.origin), ...sourceProof.ancestors] });
            }
        }
        const matching = candidates.filter(candidate => {
            if (!observationPhysicalEqual(candidate.row.target.predecessorObservation, row.target.predecessorObservation) || candidate.row.base64 !== row.base64)
                return false;
            const projected = projectSemanticWorksiteCoordinates({ ...candidate.worksite, targets: [candidate.row] }, current);
            if (projected === null || !same(projected.targets[0]?.target, row.target))
                return false;
            return projectWorksiteRevisionBindingCover(prefix, candidate.worksite.workspaceBinding, current.workspaceBinding, [...bases, candidate.basis]) !== null;
        });
        const survivors = matching.filter(c => !matching.some(other => other !== c && other.ancestors.includes(originKey(c.origin))));
        if (survivors.length !== 1)
            return null;
        results.push(survivors[0]);
    }
    return results;
}
/** One selected native D2 admission gate, shared by new actions, child bases
 * and later assembly. Raw kind strings cannot select an owner or grant. */
export function worksiteRevisionEntryBindingDisposition(prefix, graphFunction, input, currentBinding, admittedInput) {
    if (graphFunction.declarations["abg.semantic_revision_history"] !== SEMANTIC_REVISION_IDS.historicalOwnerDependencyRef)
        return "not_applicable";
    try {
        const nativeRequest = isSemanticJobRevisionEnvelope(input) ? input.revisionBasis.request : input;
        if ((isSemanticRevisionSelectionInput(nativeRequest) || isSemanticRevisionRequest(nativeRequest)) && nativeRequest.nativeWorksite !== undefined) {
            const native = nativeRequest.nativeWorksite;
            if (!same(native.workspaceBinding, currentBinding))
                return "basis_fork_detected";
            const { acquisition: _acquisition, ...retained } = native;
            const prepared = { kind: "semantic_revision_selection_input", schemaVersion: "5.0.0", parent: nativeRequest.parent, causes: nativeRequest.causes, currentWorksite: null, nativeWorksite: retained };
            const events = runtimeEventsFromValidatedPrefix(prefix);
            const inputSource = admittedInput === undefined ? null : projectWorksiteInputLeafResultAtPrefix(prefix, admittedInput.admittedInputRef, admittedInput.admittedInputDigest);
            const candidates = admittedInput === undefined ? events : inputSource === null ? [] : [inputSource];
            const sources = native.acquisition === undefined ? candidates.flatMap(event => {
                if (event.kind !== "c_call_result_admitted" || !record(event.payload) || !same(event.payload.value, prepared))
                    return [];
                const c = coordinateFor(events, event), state = c === null ? null : projectWorksiteRevisionNativeResult(prefix, c);
                return state === null ? [] : [state];
            }) : [projectWorksiteRevisionNativeResult(prefix, native.acquisition)];
            return sources.length === 1 && sources[0]?.cCall.implementationRef === SEMANTIC_REVISION_IDS.nativeIntakeImplementationRef &&
                sources[0].result.resultClass === "success" && sources[0].judgment.judgment === "advance" && same(sources[0].result.value, prepared) ? "covered" : "basis_fork_detected";
        }
        if (isWorksiteRevisionCommandExecutionObservation(input)) {
            // Evidence-input consumes the actual C2 producer, not a request. Resolve
            // its earlier preparation revision; the existing evidence owner still
            // performs the complete C1/bridge/command/evidence join after this gate.
            if (!same(input.task.workspaceBinding, currentBinding))
                return "basis_fork_detected";
            const observed = input, events = runtimeEventsFromValidatedPrefix(prefix);
            const sources = events.flatMap(e => {
                if (e.kind !== "c_call_result_admitted" || !record(e.payload) || !same(e.payload.value, observed))
                    return [];
                const coordinate = coordinateFor(events, e), state = coordinate === null ? null : projectWorksiteRevisionNativeResult(prefix, coordinate);
                return state !== null && state.cCall.graphFunctionRef === WORKSITE_REVISION_IDS.graphFunctionRef && state.cCall.regime === "F_P" &&
                    state.cCall.implementationRef === WORKSITE_REVISION_IDS.implementationRef && state.cCall.implementationBindingRef === WORKSITE_REVISION_IDS.implementationBindingRef &&
                    state.cCall.outputContractRef === WORKSITE_REVISION_IDS.observationContractRef && state.result.resultClass === "success" &&
                    state.judgment.judgment === "advance" && state.judgment.predicateRef === WORKSITE_REVISION_IDS.judgmentPredicateRef ? [state] : [];
            });
            if (sources.length !== 1)
                return "basis_fork_detected";
            const sourceOrdinal = events.find(e => e.eventId === sources[0].result.admissionEventRef).admissionOrdinal, work = session();
            const projections = events.flatMap(e => {
                if (e.kind !== "c_call_result_admitted" || e.admissionOrdinal >= sourceOrdinal || !record(e.payload) || !isRevisionEnvelope(e.payload.value) ||
                    e.payload.value.revisionBasis.basisRef !== observed.task.revisionBasisRef || e.payload.value.revisionBasis.basisDigest !== observed.task.revisionBasisDigest)
                    return [];
                const p = projectionFacts(prefix, e, work);
                return p !== null && same(p.envelope.current.worksite.workspaceBinding, currentBinding) &&
                    same(p.envelope.current.worksite.workspaceAuthorityBasis, observed.task.workspaceAuthorityBasis) ? [p.envelope] : [];
            });
            if (projections.length !== 1)
                return "basis_fork_detected";
            input = projections[0];
        }
        const request = isRevisionEnvelope(input) ? input.revisionBasis.request : input;
        if (!isSemanticRevisionSelectionInput(request) && !isSemanticRevisionRequest(request))
            return "basis_fork_detected";
        const carried = isRevisionEnvelope(input) ? input.current.worksite : isSemanticRevisionRequest(input) ? input.currentWorksite : null;
        if (carried !== null && !same(carried.workspaceBinding, currentBinding))
            return "basis_fork_detected";
        const history = nativeHistory(prefix, request.parent, request.causes);
        if (history === null)
            return "basis_fork_detected";
        // Preserve the exact old same-W admission path; no foreign origin is minted.
        if (history.bases.every(b => b.workspaceBindingId === currentBinding.bindingId && b.workspaceBindingDigest === currentBinding.bindingDigest))
            return "covered";
        if (nativeBinding(prefix, currentBinding) === null)
            return "basis_fork_detected";
        const events = runtimeEventsFromValidatedPrefix(prefix), work = session();
        const projections = events.flatMap(e => {
            if (e.kind !== "c_call_result_admitted" || typeof e.basisId !== "string")
                return [];
            const b = projectExactExecutionBasisAtPrefix(prefix, e.basisId);
            if (b === null || !history.eligible.includes(b.invocationAdmissionRef))
                return [];
            const p = projectionFacts(prefix, e, work);
            return p !== null && p.history.seed.basisRef === history.seed.basisRef ? [p] : [];
        });
        const bindings = [...history.heads.map(b => ({ basis: b, binding: bindingAtCoordinate(prefix, b.workspaceBindingId, b.workspaceBindingDigest), projection: null })),
            ...projections.map(p => ({ basis: p.basis, binding: p.envelope.current.worksite.workspaceBinding, projection: p }))];
        // A projection's actual history, not time or byte equality, covers its
        // earlier binding aliases. Every surviving branch must be covered.
        const frontier = bindings.filter(candidate => !projections.some(p => p.history.bases.some(b => b.basisRef === candidate.basis.basisRef)));
        const frontierProjections = new Set(frontier.flatMap(row => row.projection === null ? [] : [row.projection.state.result.admissionEventRef]));
        return frontier.length > 0 && frontierProjections.size <= 1 && frontier.every(row => row.binding !== null &&
            projectWorksiteRevisionBindingCover(prefix, row.binding, currentBinding, [...history.bases, row.basis]) !== null) ? "covered" : "basis_fork_detected";
    }
    catch {
        return "basis_fork_detected";
    }
}
/** Actual already admitted projection, selected by its revision identity.
 * This is used only when serializing a pending correspondence into E_D. */
export function projectWorksiteRevisionBindingOrigin(prefix, envelope) {
    const events = runtimeEventsFromValidatedPrefix(prefix), work = session();
    const matches = events.flatMap(e => {
        if (e.kind !== "c_call_result_admitted" || !record(e.payload) || !isRevisionEnvelope(e.payload.value) ||
            e.payload.value.revisionBasis.basisRef !== envelope.revisionBasis.basisRef || e.payload.value.revisionBasis.basisDigest !== envelope.revisionBasis.basisDigest)
            return [];
        const p = projectionFacts(prefix, e, work);
        return p !== null && same(p.envelope.current.worksite, envelope.current.worksite) ? [p] : [];
    });
    return matches.length === 1 ? { kind: "admitted_binding_projection", resultAdmissionEventRef: matches[0].state.result.admissionEventRef,
        judgmentEventRef: matches[0].state.judgment.admissionEventRef } : null;
}
/** The root seed is an exact earlier input, never the current revision request. */
export function worksiteRevisionSeedMatches(seedBasis, ancestor, current) {
    const input = seedBasis.rawInputValue;
    if (isSemanticJobEnvelope(ancestor))
        return isWorksiteFileParentsSuccess(input) && input.request.jobRef === ancestor.basis.jobRef && input.request.jobDigest === ancestor.basis.jobDigest && same(input.request.workspaceAuthorityBasis, current.workspaceAuthorityBasis) && input.request.workspaceBindingIdentity === current.workspaceBinding.bindingId && input.request.workspaceBindingDigest === current.workspaceBinding.bindingDigest;
    return isSemanticStageEnvelope(input) && isSemanticStageEnvelope(ancestor) && input.worksite !== null &&
        same(input.sourceHandoff, ancestor.sourceHandoff) && same(input.lifecycle, ancestor.lifecycle) &&
        same(input.worksite, ancestor.worksite) &&
        same(input.worksite.workspaceAuthorityBasis, current.workspaceAuthorityBasis) &&
        same(input.worksite.workspaceBinding, current.workspaceBinding);
}
function retainedTransition(work, event) {
    if (!work.transitions.has(event.eventId))
        work.transitions.set(event.eventId, projectWorksiteTransitionForResult(event, work.events.filter(row => row.admissionOrdinal < event.admissionOrdinal)));
    return work.transitions.get(event.eventId);
}
function currentReplacement(prefix, observation, work) {
    if (work !== undefined && work.prefix !== prefix)
        return null;
    const events = work?.events ?? runtimeEventsFromValidatedPrefix(prefix);
    const calculus = work?.calculus ?? deriveRuntimeEventCalculusProjection(prefix);
    if (!holdsAt(calculus, constructWorksiteObservationCurrentFluent(observation.observationRef)))
        return null;
    const candidates = events.flatMap(event => {
        if (event.kind !== "c_call_result_admitted" || !record(event.payload) || event.payload.resultClass !== "success")
            return [];
        const transition = work === undefined ? projectWorksiteTransitionForResult(event, events.filter(row => row.admissionOrdinal < event.admissionOrdinal)) : retainedTransition(work, event);
        if (transition?.successorObservation === null || transition === null || !same(transition.successorObservation, observation))
            return [];
        const basis = typeof event.basisId === "string" ? projectExactExecutionBasisAtPrefix(prefix, event.basisId) : null;
        const opened = events.filter(row => row.kind === "c_call_fibre_selected" && row.aggregateId === event.aggregateId && row.basisId === event.basisId);
        const evidenceRefs = event.payload.evidenceRefs;
        const evidence = events.filter(row => row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId && record(row.payload) &&
            row.payload.evidenceClass === "worksite_file_replace" && Array.isArray(evidenceRefs) &&
            evidenceRefs.includes(row.payload.evidenceRef) && event.causationEventRefs.includes(row.eventId));
        if (basis === null || basis.graphFunctionRef !== WORKSITE_C0_IDS.graphFunctionRef || opened.length !== 1 ||
            !record(opened[0].payload) || opened[0].payload.implementationRef !== "implementation://abiogenesis/worksite/file-replace-fd@5" || evidence.length !== 1 ||
            basis.workspaceBindingId !== observation.workspaceBindingIdentity)
            return [];
        return [{ basis, event, evidence: evidence[0] }];
    });
    return candidates.at(-1) ?? null;
}
/** Closed construction seed, separate from D2's semantic-stage seed. Reuses
 * the same native C0 currentness, physical-alias invalidation and cover owners. */
export function projectClosedConstructionRetainedVector(prefix, task, request, bases) {
    try {
        const current = nativeBinding(prefix, request.workspaceBinding);
        if (current === null || !same(current.authority, request.workspaceAuthorityBasis) ||
            !same(task.workspaceAuthorityBasis, request.workspaceAuthorityBasis) ||
            task.workspaceBinding.workspaceId !== request.workspaceBinding.workspaceId ||
            task.protectedObservations.length !== request.protectedObservations.length ||
            task.sourceConstructionResult.members.length !== task.protectedObservations.length)
            return null;
        const events = runtimeEventsFromValidatedPrefix(prefix), sources = [], sourceBases = [...bases];
        // One invocation-local immutable-prefix session, never a filesystem or
        // cross-prefix cache. Shared C0 proof queries are not multiplied by N.
        const work = { prefix, events, calculus: deriveRuntimeEventCalculusProjection(prefix), transitions: new Map() };
        for (const [ordinal, old] of task.protectedObservations.entries()) {
            const member = task.sourceConstructionResult.members[ordinal], asserted = request.protectedObservations[ordinal];
            if (member === undefined || asserted === undefined || member.inputMemberRef !== old.sourceMemberRef ||
                !same(member.successorObservation, old.observation))
                return null;
            const producer = currentReplacement(prefix, old.observation, work);
            if (producer === null || !bases.some(b => b.invocationAdmissionRef === producer.basis.invocationAdmissionRef) ||
                !record(producer.event.payload) || !record(producer.event.payload.value) ||
                !same(producer.event.payload.value.receipt, member.receipt) ||
                invalidatedAcrossBindings(prefix, old.subject, producer.event.admissionOrdinal, work))
                return null;
            // The C0 transition owner excludes workflow aliases; genuine producer
            // multiplicity is still a refusal even when the observed bytes agree.
            const producers = events.filter(e => e.kind === "c_call_result_admitted" &&
                same(retainedTransition(work, e)?.successorObservation ?? null, old.observation));
            if (producers.length !== 1 || producers[0].eventId !== producer.event.eventId)
                return null;
            const subject = constructWorksiteSubject({ workspaceAuthorityBasis: request.workspaceAuthorityBasis, workspaceBinding: request.workspaceBinding,
                subjectUri: old.subject.subjectUri, relativePath: old.subject.relativePath });
            if (subject.kind !== "worksite_subject")
                return null;
            const observation = constructWorksiteObservation({ subject, state: "file", fileIdentity: old.observation.fileIdentity,
                fileDigest: old.observation.fileDigest, byteLength: old.observation.byteLength });
            if (!same({ subject, observation }, asserted))
                return null;
            sourceBases.push(producer.basis);
            sources.push({ sourceMemberRef: old.sourceMemberRef, subject, observation: observation,
                source: { kind: "retained_construction", resultAdmissionEventRef: producer.event.eventId, evidenceEventRef: producer.evidence.eventId, bindingCoverEventRefs: [] } });
        }
        const covers = projectWorksiteRevisionBindingCover(prefix, task.workspaceBinding, request.workspaceBinding, sourceBases);
        if (covers === null || covers.length === 0)
            return null;
        return { snapshotSources: sources.map(row => ({ ...row, source: { ...row.source, bindingCoverEventRefs: covers } })),
            bindingCoverEventRefs: covers };
    }
    catch {
        return null;
    }
}
/** Rehydrates the exact recorded origin and rejects all native supersession. */
export function worksiteRevisionOriginSurvives(prefix, row) {
    const events = runtimeEventsFromValidatedPrefix(prefix), origin = row.origin;
    if (origin.kind === "admitted_initial_job_bridge") {
        const event = one(events, e => e.kind === "c_call_result_admitted" && e.eventId === origin.resultAdmissionEventRef);
        const coordinate = event === null ? null : coordinateFor(events, event);
        const result = coordinate === null ? null : projectWorksiteRevisionNativeResult(prefix, coordinate);
        const value = result?.result.value;
        if (result === null || result.cCall.implementationRef !== SEMANTIC_STAGE_IDS.jobBridgeImplementationRef ||
            result.result.resultClass !== "success" || result.judgment.judgment !== "advance" ||
            result.judgment.admissionEventRef !== origin.judgmentEventRef || !isWorksitePreparationInput(value) ||
            value.kind !== "worksite_command_preparation_input" || value.readDependencyBasis === undefined)
            return false;
        const source = semanticJobReadDependenciesAtPrefix(prefix, value.readDependencyBasis);
        const member = value.readDependencyBasis.members.find(member => member.sourceMemberRef === row.designTargetRef);
        return source !== null && source.result.resultRef === result.result.resultRef && member !== undefined &&
            same(member.subject, row.subject) && same(member.observation, row.observation) &&
            !invalidatedAcrossBindings(prefix, row.subject, source.contextEvent.admissionOrdinal);
    }
    if (origin.kind === "admitted_binding_projection") {
        const result = one(events, e => e.kind === "c_call_result_admitted" && e.eventId === origin.resultAdmissionEventRef);
        const p = result === null ? null : projectionFacts(prefix, result, session());
        return p !== null && p.state.judgment.admissionEventRef === origin.judgmentEventRef &&
            p.envelope.current.worksite.targets.filter(t => same(t.target.subject, row.subject) && same(t.target.predecessorObservation, row.observation)).length === 1 &&
            !invalidatedAcrossBindings(prefix, row.subject, p.ordinal);
    }
    const replacement = currentReplacement(prefix, row.observation);
    if (origin.kind === "admitted_replacement")
        return replacement !== null &&
            replacement.event.eventId === origin.resultAdmissionEventRef && replacement.evidence.eventId === origin.evidenceEventRef &&
            !invalidatedAcrossBindings(prefix, row.subject, replacement.event.admissionOrdinal);
    // Once there is a native successor, the old input is not an alternative origin.
    if (replacement !== null)
        return false;
    const event = events.find(e => e.eventId === origin.basisAdmissionEventRef && e.kind === "basis_admitted");
    const basis = event?.basisId === undefined ? null : projectExactExecutionBasisAtPrefix(prefix, event.basisId);
    const worksite = basis === null ? null : inputWorksite(basis, prefix);
    if (basis === null || worksite === null || basis.rawInputAdmissionRef !== origin.inputAdmissionRef || basis.rawInputDigest !== origin.inputDigest ||
        !worksite.targets.some(t => same(t.target.subject, row.subject) && same(t.target.predecessorObservation, row.observation)))
        return false;
    // Failure after publication terminates O0 but creates no successful O1.
    return !invalidatedAcrossBindings(prefix, row.subject, event.admissionOrdinal) && !events.some(e => e.kind === "c_call_result_admitted" &&
        projectWorksiteTransitionForResult(e, events.filter(p => p.admissionOrdinal < e.admissionOrdinal))?.before === row.observation.observationRef);
}
export function projectWorksiteRevisionOrigins(prefix, seedBasis, historical, current, eligibleInvocationRefs) {
    const seed = inputWorksite(seedBasis, prefix);
    if (seed === null || current.targets.length !== historical.targets.length)
        return null;
    const prefixEvents = runtimeEventsFromValidatedPrefix(prefix);
    const crossedHistory = prefixEvents.some(e => {
        if (e.kind !== "basis_admitted" || typeof e.basisId !== "string")
            return false;
        const b = projectExactExecutionBasisAtPrefix(prefix, e.basisId);
        return b !== null && eligibleInvocationRefs.includes(b.invocationAdmissionRef) &&
            (b.workspaceBindingId !== current.workspaceBinding.bindingId || b.workspaceBindingDigest !== current.workspaceBinding.bindingDigest);
    });
    if (!same(seed.workspaceBinding, current.workspaceBinding) || crossedHistory) {
        const events = runtimeEventsFromValidatedPrefix(prefix), bases = events.flatMap(e => {
            const b = e.kind === "basis_admitted" && typeof e.basisId === "string" ? projectExactExecutionBasisAtPrefix(prefix, e.basisId) : null;
            return b !== null && eligibleInvocationRefs.includes(b.invocationAdmissionRef) ? [b] : [];
        });
        const origins = deriveCurrentOrigins(prefix, seedBasis, historical, current, eligibleInvocationRefs, bases, session());
        return origins === null ? null : origins.map(origin => same(origin.worksite.workspaceBinding, current.workspaceBinding) ? origin.origin :
            { kind: "pending_binding_correspondence", source: origin.origin });
    }
    const origins = [];
    for (const [ordinal, row] of current.targets.entries()) {
        const prior = historical.targets[ordinal];
        if (prior === undefined || row.role !== prior.role || row.target.subject.relativePath !== prior.target.subject.relativePath ||
            !same(row.target.territory.operations, prior.target.territory.operations) || row.target.territory.relativeRoot !== prior.target.territory.relativeRoot)
            return null;
        const observation = row.target.predecessorObservation;
        const replacement = currentReplacement(prefix, observation);
        let origin;
        if (replacement !== null) {
            if (!eligibleInvocationRefs.includes(replacement.basis.invocationAdmissionRef) ||
                !record(replacement.basis.rawInputValue.subject) || !same(replacement.basis.rawInputValue.subject, row.target.subject))
                return null;
            origin = { kind: "admitted_replacement", resultAdmissionEventRef: replacement.event.eventId, evidenceEventRef: replacement.evidence.eventId };
            if (invalidatedAcrossBindings(prefix, row.target.subject, replacement.event.admissionOrdinal))
                return null;
        }
        else {
            if (!seed.targets.some(t => same(t.target.subject, row.target.subject) && same(t.target.predecessorObservation, observation) && t.base64 === row.base64))
                return null;
            origin = { kind: "admitted_input", basisAdmissionEventRef: seedBasis.admissionEventRef,
                inputAdmissionRef: seedBasis.rawInputAdmissionRef, inputDigest: seedBasis.rawInputDigest };
            // The initial file/absence seed is allowed only while no native transition invalidates it.
            const events = runtimeEventsFromValidatedPrefix(prefix);
            const initial = events.find(e => e.eventId === seedBasis.admissionEventRef);
            if (initial === undefined || invalidatedAcrossBindings(prefix, row.target.subject, initial.admissionOrdinal) || events.some(e => e.kind === "c_call_result_admitted" &&
                projectWorksiteTransitionForResult(e, events.filter(p => p.admissionOrdinal < e.admissionOrdinal))?.before === observation.observationRef))
                return null;
        }
        if (observation.state === "file" && (sha256Bytes(Buffer.from(row.base64, "base64")) !== observation.fileDigest ||
            Buffer.from(row.base64, "base64").length !== observation.byteLength))
            return null;
        origins.push(origin);
    }
    return origins;
}
/** Exact physical observation is a check, never a replacement origin. */
export function worksiteRevisionPhysicalMatches(current) {
    try {
        const root = current.workspaceAuthorityBasis.canonicalRoot;
        if (resolve(root) !== root || realpathSync(root) !== root)
            return false;
        return current.targets.every(row => {
            const path = resolve(root, row.target.subject.relativePath), rel = relative(root, path);
            if (!rel || rel.startsWith("..") || isAbsolute(rel))
                return false;
            let cursor = root;
            for (const part of row.target.subject.relativePath.split("/").slice(0, -1)) {
                cursor = resolve(cursor, part);
                if (realpathSync(cursor) !== cursor || !lstatSync(cursor).isDirectory() || lstatSync(cursor).isSymbolicLink())
                    return false;
            }
            let observed;
            try {
                const stat = lstatSync(path), bytes = readFileSync(path);
                if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || realpathSync(path) !== path || bytes.toString("base64") !== row.base64)
                    return false;
                observed = constructWorksiteObservation({ subject: row.target.subject, state: "file", fileIdentity: `${stat.dev}:${stat.ino}`,
                    fileDigest: sha256Bytes(bytes), byteLength: bytes.length });
            }
            catch (error) {
                if (error.code !== "ENOENT" || row.base64 !== "")
                    return false;
                observed = constructWorksiteObservation({ subject: row.target.subject, state: "absent" });
            }
            return isWorksiteObservation(observed) && same(observed, row.target.predecessorObservation);
        });
    }
    catch {
        return false;
    }
}
/** Read-only, non-minting currentness check for a receipt-backed retained vector. */
export function retainedWorksitePhysicalMatches(authority, rows) {
    try {
        const root = authority.canonicalRoot;
        if (resolve(root) !== root || realpathSync(root) !== root)
            return false;
        return rows.every(row => {
            const target = resolve(root, row.subject.relativePath), rel = relative(root, target);
            if (!rel || rel.startsWith("..") || isAbsolute(rel) || row.observation.state !== "file")
                return false;
            let cursor = root;
            for (const part of row.subject.relativePath.split("/").slice(0, -1)) {
                cursor = resolve(cursor, part);
                const stat = lstatSync(cursor);
                if (!stat.isDirectory() || stat.isSymbolicLink() || realpathSync(cursor) !== cursor)
                    return false;
            }
            const stat = lstatSync(target), bytes = readFileSync(target);
            return stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1 && realpathSync(target) === target &&
                same(constructWorksiteObservation({ subject: row.subject, state: "file", fileIdentity: `${stat.dev}:${stat.ino}`,
                    fileDigest: sha256Bytes(bytes), byteLength: bytes.length }), row.observation);
        });
    }
    catch {
        return false;
    }
}
export function worksiteExecutionSourcesCurrent(prefix, task) {
    // Observed source currentness is relative to its exact root input admission,
    // authenticated by execution_basis; this ancestor-only projection grants none.
    if (isObservedWorksiteCommandExecutionTask(task))
        return false;
    if (isNativeWorksiteCommandExecutionTask(task))
        return projectNativeWorkCommandSourceAtPrefix(prefix, task) !== null;
    const calculus = deriveRuntimeEventCalculusProjection(prefix);
    const readBasis = task.kind === "worksite_command_execution_task" ? task.readDependencyBasis : undefined;
    const readSource = readBasis === undefined ? null : semanticJobReadDependenciesAtPrefix(prefix, readBasis);
    if (readBasis !== undefined && readSource === null)
        return false;
    return worksiteExecutionSources(task).every(row => {
        if (readBasis?.members.some(member => member.sourceMemberRef === ("sourceMemberRef" in row ? row.sourceMemberRef : null))) {
            const member = readBasis.members.find(member => member.subject.subjectRef === row.subject.subjectRef);
            return member !== undefined && same(member.observation, row.observation) &&
                !invalidatedAcrossBindings(prefix, row.subject, readSource.contextEvent.admissionOrdinal);
        }
        if ("source" in row && row.source.kind === "retained_dependency")
            return worksiteRevisionOriginSurvives(prefix, { designTargetRef: row.designTargetRef, subject: row.subject, observation: row.observation, origin: row.source.origin });
        if (!holdsAt(calculus, constructWorksiteObservationCurrentFluent(row.observation.observationRef)))
            return false;
        const replacement = currentReplacement(prefix, row.observation);
        // The unchanged closed C1/C3 source gate authenticates these producers.
        // Conjoin cross-W invalidation; an old binding alias is not current merely
        // because its W-qualified Event Calculus fluent was not the later O0.
        return replacement === null || !invalidatedAcrossBindings(prefix, row.subject, replacement.event.admissionOrdinal);
    });
}
