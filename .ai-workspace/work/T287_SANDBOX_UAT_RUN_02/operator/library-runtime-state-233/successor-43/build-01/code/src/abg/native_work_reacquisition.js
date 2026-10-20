import { projectOwnedRuntimeEventPrefixAtDurablePrefix, readOwnedRuntimeEventPrefixAtDurablePrefix } from "./event_prefix.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { isDeepStrictEqual } from "node:util";
/** Deterministic preparation of an existing closed native child, not new authorship. */
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { materializeGraph } from "../gtl/materialize.js";
import { defaultGovernanceGraphFunctions } from "../gtl/default_library.js";
import { isGovernanceWorkState, governanceTestingConfiguration, governanceRef } from "../product/default_library.js";
import { constructNativeWorksiteCommandReacquisitionRequest, constructWorksiteCommandConfiguration, worksiteCommandConfigurationMatches } from "../product/worksite_command_execution.js";
import { constructWorksiteSubject } from "../product/worksite_effect.js";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { nativeWorkReacquisitionGraphFunction } from "../gtl/worksite_command_execution.js";
import { NATIVE_WORK_REACQUISITION_IDS as ids, constructNativeWorksiteCommandExecutionTask, isNativeWorksiteCommandReacquisitionRequest } from "../product/worksite_command_execution.js";
import { observeWorksiteContext } from "../product/worksite_operations.js";
import { readRuntimeEventsAtDurablePrefix, authenticateRuntimePrefixAncestry, reidentifyHistoricalDurablePrefixCoordinate, runtimeEventPhysicalPrefix } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, runtimeEventBodiesAtPrefix, runtimePrefixComputation, unscopedRuntimeEventPrefix, isImmutableRuntimeValue, validatedRuntimeEventPrefixThroughEvent } from "./event_prefix.js";
import { projectClosedGraphCallTerminalAtDurablePrefix } from "./project_read_ports.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix, hasAdmittedGovernanceSourceUse, hasAdmittedGovernanceCoveredSourceUse, governanceHistoricalDeclarationReferenceAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { projectWorksiteRevisionBindingCover } from "./worksite_revision.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix } from "./c_call.js";
import { rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import { projectNativeWorkCommandSourceAtPrefix, projectNativeWorkspaceWorkSourceAtPrefix } from "./native_worksite_execution.js";
import { authenticateNativeInstructionAssemblyBasis } from "./execution_basis.js";
import { NATIVE_WORKSPACE_WORK_IDS as native, isNativeWorkspaceWorkObservation } from "../product/native_workspace_work.js";
import { constructAbgHistoricalDeclarationReference, hasUniqueHistoricalDeclarationDependencies } from "./terminal_result_contracts.js";
const same = (a, b) => a === b || isDeepStrictEqual(a, b) || canonicalJson(a) === canonicalJson(b);
const hash = (a) => sha256Canonical(a);
const record = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const one = (rows, predicate) => { const selected = rows.filter(predicate); return selected.length === 1 ? selected[0] : null; };
function refused(refusal, stage, relation, selectors = {}, error) {
    refusal?.(stage, relation, selectors, error);
    return null;
}
/** Resolve untrusted preimages before consulting retained establishment facts.
 * A prior successful preparation cannot supply a missing or different resource. */
function declarationProofFor(request, resource) {
    if (request.source.declarationReference === undefined)
        return request.source.declarationProof;
    if (resource === undefined || !hasUniqueHistoricalDeclarationDependencies(resource))
        return null;
    return one([resource.declarationProof, ...(resource.declarationDependencies ?? [])], proof => same(constructAbgHistoricalDeclarationReference(proof), request.source.declarationReference));
}
/** Local facts from one already admitted request and exact current prefix.
 * The historical terminal and latest source checks retain their own owners. */
function deriveNativeWorkReacquisitionTask(current, prefix, request, nativeBasis, declarationProof, refusal) {
    let stage = "native_source_ancestry";
    try {
        if (!authenticateRuntimePrefixAncestry(request.source.prefix, current))
            return refused(refusal, stage, "prefix_ancestry");
        stage = "native_closed_source";
        const historical = reidentifyHistoricalDurablePrefixCoordinate(current, request.source.prefix);
        const terminal = projectClosedGraphCallTerminalAtDurablePrefix(historical, request.source.graphCallRef, declarationProof);
        if (terminal === null)
            return refused(refusal, stage, "terminal_projection", { graphCallRef: request.source.graphCallRef });
        if (terminal.producer.graphFunction.ref !== native.graphFunctionRef || !same(terminal.value, request.sourceNativeWork) ||
            terminal.producer.cCallRef !== request.sourceNativeWork.provenance.cCallRef)
            return refused(refusal, stage, "producer_value", { cCallRef: terminal.producer.cCallRef });
        stage = "native_current_environment";
        const sourceBasis = projectExactExecutionBasisAtPrefix(prefix, terminal.producer.executionBasis.ref);
        const environment = projectExactPrefixWorkspaceEnvironment(current, { ref: request.workspaceBinding.bindingId, digest: request.workspaceBinding.bindingDigest });
        if (sourceBasis === null || environment.kind !== "exact_prefix_workspace_environment" ||
            !same(environment.workspaceAuthorityBasis, request.workspaceAuthorityBasis) || !same(environment.workspaceBinding, request.workspaceBinding))
            return refused(refusal, stage, "source_basis_binding", { sourceBasisRef: terminal.producer.executionBasis.ref });
        stage = "native_binding_cover";
        const covers = projectWorksiteRevisionBindingCover(prefix, request.sourceNativeWork.task.workspaceBinding, request.workspaceBinding, [sourceBasis]);
        if (covers === null)
            return refused(refusal, stage, "binding_cover", { workspaceBindingRef: request.workspaceBinding.bindingId });
        stage = "native_task_construction";
        const task = constructNativeWorksiteCommandExecutionTask({ ...request,
            sourceReacquisition: { request, nativeBasis, bindingCoverEventRefs: covers } });
        stage = "native_current_source";
        const source = projectNativeWorkCommandSourceAtPrefix(prefix, task);
        if (source === null)
            return refused(refusal, stage, "command_source");
        if (source.sourceResult.eventId !== terminal.producer.resultAdmissionEventRef ||
            source.sourceJudgment.eventId !== terminal.producer.judgmentAdmissionEventRef)
            return refused(refusal, stage, "result_judgment_identity", { resultAdmissionEventRef: source.sourceResult.eventId, judgmentAdmissionEventRef: source.sourceJudgment.eventId });
        return { task, source };
    }
    catch (error) {
        if (refusal === undefined)
            throw error;
        return refused(refusal, stage, "caught", {}, error);
    }
}
/** The source selector is evidence. R10 owns terminal scope; the binding-cover
 * owner and current native source projection own its present applicability. */
export function projectNativeWorkReacquisitionTask(current, request, nativeBasis, historicalSource) {
    try {
        if (!isNativeWorksiteCommandReacquisitionRequest(request))
            return null;
        const declarationProof = declarationProofFor(request, historicalSource);
        if (declarationProof === null)
            return null;
        const prefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(current);
        return deriveNativeWorkReacquisitionTask(current, prefix, request, nativeBasis, declarationProof)?.task ?? null;
    }
    catch {
        return null;
    }
}
/** Immutable preparation facts survive ordinary Result copying only inside
 * the existing authenticated prefix lineage. Current C2 invalidators remain
 * in projectNativeWorkCommandSourceAtPrefix and its same-Run join. */
export function authenticateNativeWorkReacquisition(basis, input, requireCurrent = false, historicalSource) {
    const owner = authenticateOwnedNativeWorkReacquisition(basis, input, requireCurrent, historicalSource);
    return owner === null ? null : { ...owner,
        prefix: selectValidatedRuntimeEventPrefix(Object.freeze([...runtimeEventBodiesAtPrefix(owner.prefix)])) };
}
/** @internal The ordinary consumer borrows selected bodies rather than requesting a complete Public prefix. */
export function authenticateOwnedNativeWorkReacquisition(basis, input, requireCurrent = false, historicalSource) {
    try {
        if (!isNativeWorksiteCommandReacquisitionRequest(input))
            return null;
        const declarationProof = declarationProofFor(input, historicalSource);
        if (declarationProof === null)
            return null;
        const prefix = requireCurrent ? readOwnedRuntimeEventPrefixAtDurablePrefix(basis.predecessorPrefix, { requireCurrent: true }) :
            projectOwnedRuntimeEventPrefixAtDurablePrefix(basis.predecessorPrefix);
        const owner = deriveAuthenticatedNativeWorkReacquisition(basis, input, prefix, declarationProof);
        return owner;
    }
    catch {
        return null;
    }
}
/** Current ordinary CCall owner. A supplied prefix or output never grants this occurrence. */
function projectNativeWorkReacquisitionOccurrence(basis, input, prefix, refusal) {
    let stage = "native_occurrence_input";
    try {
        if (!isNativeWorksiteCommandReacquisitionRequest(input))
            return refused(refusal, stage, "request_shape");
        stage = "native_occurrence_basis";
        const events = runtimeEventBodiesAtPrefix(prefix);
        const opened = one(indexedRuntimeEvents(prefix, "related:" + basis.cCallRef), e => e.kind === "c_call_opened" && e.aggregateId === basis.cCallRef);
        const execution = opened?.basisId == null ? null : projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
        const library = execution?.graphFunctionRef === governanceRef("graph-function", "testing");
        const gf = library ? defaultGovernanceGraphFunctions().find(g => g.name === execution.graphFunctionRef) : nativeWorkReacquisitionGraphFunction();
        const implementationRef = library ? governanceRef("implementation", "prepare-testing") : ids.implementationRef;
        const implementationBindingRef = library ? governanceRef("binding", "prepare-testing") : ids.implementationBindingRef;
        const predicateRef = library ? governanceRef("predicate", "prepare-testing") : ids.predicateRef;
        if (execution === null || execution.graphFunctionRef !== gf.name || execution.graphFunctionDigest !== hash(gf) ||
            (library ? !governanceReacquisitionRequestMatches(prefix, execution, input, refusal) : !same(execution.rawInputValue, input)) ||
            execution.workspaceBindingId !== input.workspaceBinding.bindingId || execution.workspaceBindingDigest !== input.workspaceBinding.bindingDigest)
            return refused(refusal, stage, "definition_input_binding", { cCallRef: basis.cCallRef });
        stage = "native_occurrence_materialization";
        const graph = materializeGraph(gf, { invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
            admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
        const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCallRef);
        const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
        const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
        if (graph.materializationDigest !== execution.graphDigest || graph.materializationRef !== execution.graphRef || call === null ||
            call.basisId !== execution.basisRef || call.callClass !== "leaf" || call.regime !== "F_D" || call.implementationRef !== implementationRef ||
            call.implementationBindingRef !== implementationBindingRef || call.judgmentPredicateRef !== predicateRef ||
            set === null || set.implementationSetDigest !== execution.rootImplementationSetDigest ||
            set.rows.filter(r => r.graphFunctionRef === call.graphFunctionRef && r.programLocusRef === call.programLocusRef &&
                r.implementationRef === implementationRef && r.implementationBindingRef === implementationBindingRef &&
                r.inputContractRef === call.inputContractRef && r.outputContractRef === call.outputContractRef).length !== 1 ||
            invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.capabilityGrant))
            return refused(refusal, stage, "call_set_grant", { cCallRef: basis.cCallRef, basisRef: execution.basisRef, implementationSetRef: execution.rootImplementationSetRef });
        return { call, execution, prefix };
    }
    catch (error) {
        return refused(refusal, stage, "caught", { cCallRef: basis.cCallRef }, error);
    }
}
/** Exact library input -> existing reacquisition request relation. This proves
 * no producer by itself: occurrence, native Result/J/closure and binding cover
 * remain mandatory in preparation and later admitted C2 consumption. */
function governanceReacquisitionRequestMatches(prefix, execution, request, refusal) {
    const state = execution.rawInputValue;
    if (!isGovernanceWorkState(state) || state.terminal || state.synthesis?.judgment.nextGraphFunctionRef !== governanceRef("graph-function", "testing") ||
        !same(state.original.readRoots, request.currentContext.readRoots) || state.original.maxContextFiles !== request.currentContext.maxFiles ||
        state.original.maxContextBytes !== request.currentContext.maxBytes) {
        refused(refusal, "native_occurrence_state", "selection_context", { basisRef: execution.basisRef });
        return false;
    }
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
    const source = projectNativeWorkspaceWorkSourceAtPrefix(prefix, request.sourceNativeWork);
    const payload = source?.sourceResult.payload;
    if (invocation === null || source === null) {
        refused(refusal, "native_occurrence_source", "invocation_source", { basisRef: execution.basisRef });
        return false;
    }
    if (!hasAdmittedGovernanceSourceUse(invocation, source.sourceResult)) {
        refused(refusal, "native_occurrence_source", "source_use", { sourceResultEventRef: source.sourceResult.eventId });
        return false;
    }
    if (!hasAdmittedGovernanceCoveredSourceUse(prefix, invocation, source.sourceBasis)) {
        refused(refusal, "native_occurrence_source", "covered_current_use", { sourceBasisRef: source.sourceBasis.basisRef });
        return false;
    }
    if (!record(payload) ||
        payload.resultRef !== state.synthesis.judgment.subjectEvidenceRef ||
        state.observations.filter(o => o.resultRef === payload.resultRef && o.resultDigest === payload.resultDigest &&
            o.cCallRef === source.sourceResult.aggregateId && o.actorInvocationRef === request.sourceNativeWork.provenance.actorInvocationRef).length !== 1 ||
        request.source.graphCallRef !== source.sourceResult.graphCallId || request.source.declarationReference === undefined ||
        !same(request.source.declarationReference, governanceHistoricalDeclarationReferenceAtPrefix(prefix, invocation, source.sourceBasis))) {
        refused(refusal, "native_occurrence_source", "selected_producer_declaration", { sourceResultEventRef: source.sourceResult.eventId });
        return false;
    }
    const subjects = request.selectedSources.map(s => constructWorksiteSubject({ ...request, ...s }));
    if (subjects.some(s => s.kind !== "worksite_subject")) {
        refused(refusal, "native_occurrence_subjects", "subject_construction");
        return false;
    }
    const matches = same(state.original.testing.selectedPaths, request.selectedSources.map(s => s.relativePath)) &&
        request.selectedSources.every(s => s.subjectUri === pathToFileURL(resolve(request.workspaceAuthorityBasis.canonicalRoot, s.relativePath)).href) &&
        worksiteCommandConfigurationMatches({ ...governanceTestingConfiguration(state), workspaceAuthorityBasis: request.workspaceAuthorityBasis,
            workspaceBinding: request.workspaceBinding, protectedSubjects: subjects.filter(s => s.kind === "worksite_subject") }, constructWorksiteCommandConfiguration({ ...request, protectedSubjects: subjects.filter(s => s.kind === "worksite_subject"),
            outcomePredicates: request.outcomePredicates ?? [] }));
    if (!matches)
        refused(refusal, "native_occurrence_subjects", "paths_command_configuration");
    return matches;
}
export function prepareGovernanceNativeWorkReacquisition(basis, input, context, historicalSource, refusal) {
    let stage = "native_preparation_owner";
    try {
        const owned = authenticateNativeInstructionAssemblyBasis(basis);
        if (owned === null || !same(owned.inputValue, input) || !isGovernanceWorkState(input) ||
            owned.call.implementationRef !== governanceRef("implementation", "prepare-testing"))
            return refused(refusal, stage, "assembly_input_implementation");
        stage = "native_historical_declaration";
        if (historicalSource === undefined)
            return refused(refusal, stage, "resource_absent");
        if (!hasUniqueHistoricalDeclarationDependencies(historicalSource))
            return refused(refusal, stage, "dependency_population");
        stage = "native_selected_result";
        const selected = input.synthesis?.judgment.subjectEvidenceRef;
        const rows = indexedRuntimeEvents(owned.prefix, "payload:resultRef:" + selected).filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
            e.payload.resultRef === selected && e.payload.resultClass === "success");
        if (rows.length !== 1 || !record(rows[0].payload))
            return refused(refusal, stage, "successful_result_population", { resultRef: selected ?? null });
        const value = rows[0].payload.value;
        if (!isNativeWorkspaceWorkObservation(value) || value.task.assessment !== undefined)
            return refused(refusal, stage, "native_work_value", { resultRef: selected ?? null });
        stage = "native_preparation_source";
        const source = projectNativeWorkspaceWorkSourceAtPrefix(owned.prefix, value);
        const invocation = projectExactInvocationAdmissionAtPrefix(owned.prefix, owned.execution.invocationAdmissionRef);
        if (source === null || invocation === null || invocation.capabilityGrants.length !== 1 || owned.environment.kind !== "exact_prefix_workspace_environment")
            return refused(refusal, stage, "source_invocation_environment", { resultRef: selected ?? null });
        const environment = owned.environment;
        stage = "native_historical_declaration";
        const reference = governanceHistoricalDeclarationReferenceAtPrefix(owned.prefix, invocation, source.sourceBasis);
        if (reference === null)
            return refused(refusal, stage, "reference_projection", { sourceBasisRef: source.sourceBasis.basisRef });
        stage = "native_request_construction";
        const request = constructNativeWorksiteCommandReacquisitionRequest({
            workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding,
            capabilityGrant: invocation.capabilityGrants[0], sourceNativeWork: value, currentContext: context,
            source: { prefix: basis.predecessorPrefix, graphCallRef: source.sourceResult.graphCallId, declarationReference: reference },
            selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath,
                subjectUri: pathToFileURL(resolve(environment.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
            ...governanceTestingConfiguration(input)
        });
        const nativeBasis = { predecessorPrefix: basis.predecessorPrefix, cCallRef: owned.call.cCallRef };
        stage = "native_historical_declaration";
        const declaration = declarationProofFor(request, historicalSource);
        if (declaration === null)
            return refused(refusal, stage, "exact_reference_resolution", { sourceBasisRef: source.sourceBasis.basisRef });
        stage = "native_task_derivation";
        return deriveAuthenticatedNativeWorkReacquisition(nativeBasis, request, owned.prefix, declaration, refusal)?.task ?? null;
    }
    catch (error) {
        return refused(refusal, stage, "caught", {}, error);
    }
}
/** Admission matching borrows already authenticated declarations through the
 * admitted covered-use fact, not a copied resource or self-certified task. */
export function governanceNativeWorkReacquisitionResultMatches(basis, input, value) {
    try {
        const owned = authenticateNativeInstructionAssemblyBasis(basis);
        if (owned === null || !same(owned.inputValue, input) || !record(value) || !record(value.sourceReacquisition))
            return false;
        const task = value, proof = task.sourceReacquisition;
        if (proof === undefined || !same(proof.nativeBasis, { predecessorPrefix: basis.predecessorPrefix, cCallRef: owned.call.cCallRef }) ||
            !isNativeWorksiteCommandReacquisitionRequest(proof.request) || !same(constructNativeWorksiteCommandExecutionTask({ ...proof.request, sourceReacquisition: proof }), task))
            return false;
        const occurrence = projectNativeWorkReacquisitionOccurrence(proof.nativeBasis, proof.request, owned.prefix);
        if (occurrence === null || occurrence.call.implementationRef !== governanceRef("implementation", "prepare-testing") ||
            projectCCallCarrierPhaseAtPrefix(owned.prefix, occurrence.call)?.phase !== "selected_no_evidence")
            return false;
        const source = projectNativeWorkCommandSourceAtPrefix(owned.prefix, task);
        if (source === null)
            return false;
        const covers = projectWorksiteRevisionBindingCover(owned.prefix, task.sourceNativeWork.task.workspaceBinding, task.workspaceBinding, [source.sourceBasis]);
        return covers !== null && same(covers, proof.bindingCoverEventRefs);
    }
    catch {
        return false;
    }
}
function deriveAuthenticatedNativeWorkReacquisition(basis, input, prefix, declarationProof, refusal) {
    const occurrence = projectNativeWorkReacquisitionOccurrence(basis, input, prefix, refusal);
    if (occurrence === null)
        return null;
    if (projectCCallCarrierPhaseAtPrefix(prefix, occurrence.call)?.phase !== "selected_no_evidence")
        return refused(refusal, "native_occurrence_phase", "selected_no_evidence", { cCallRef: occurrence.call.cCallRef });
    const derived = deriveNativeWorkReacquisitionTask(basis.predecessorPrefix, prefix, input, basis, declarationProof, refusal);
    if (derived === null)
        return null;
    if (derived.source.sourceResult.runId === occurrence.call.runId)
        return refused(refusal, "native_source_run", "historical_run", { sourceResultEventRef: derived.source.sourceResult.eventId });
    return { ...occurrence, task: derived.task };
}
/** Read-only existing physical observation owner; all read-scope files, not just C2 sources. */
export async function nativeWorkReacquisitionContextCurrent(request) {
    const { readRoots, maxFiles, maxBytes } = request.currentContext;
    return same(await observeWorksiteContext({ workspaceAuthorityBasis: request.workspaceAuthorityBasis,
        workspaceBinding: request.workspaceBinding, readRoots, maxFiles, maxBytes }), request.currentContext);
}
/** The optional owner coordinate only reidentifies an already authenticated
 * historical preparation cut; it confers no current-source or effect authority. */
export function nativeWorkReacquisitionResultMatches(input, value, currentOwnerPrefix, historicalSource) {
    if (!record(value) || !record(value.sourceReacquisition) || !record(value.sourceReacquisition.nativeBasis) ||
        !same(input, value.sourceReacquisition.request))
        return false;
    try {
        const original = value.sourceReacquisition.nativeBasis;
        const basis = currentOwnerPrefix === undefined ? original : { ...original,
            predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix) };
        const owner = authenticateOwnedNativeWorkReacquisition(basis, input, false, historicalSource);
        return owner !== null && same(owner.task, value);
    }
    catch {
        return false;
    }
}
/** Authenticated current-Run preparation carries historical child provenance.
 * The original F_P result remains in its own Run and invocation. */
function sameEventResource(a, b) {
    return a.eventLogRef === b.eventLogRef && a.storeIdentity.device === b.storeIdentity.device && a.storeIdentity.inode === b.storeIdentity.inode;
}
/** Recover an exact recorded cut from already decoded physical coordinates.
 * No declaration resource or second journal read enters admitted consumption. */
function preparationCut(prefix, coordinate) {
    const authority = unscopedRuntimeEventPrefix(prefix), events = runtimeEventBodiesAtPrefix(authority);
    let low = 1, high = events.length;
    while (low <= high) {
        const count = (low + high) >>> 1, physical = runtimeEventPhysicalPrefix(events.slice(0, count));
        if (physical.byteLength < coordinate.prefixLength)
            low = count + 1;
        else if (physical.byteLength > coordinate.prefixLength)
            high = count - 1;
        else
            return physical.digest === coordinate.prefixDigest
                ? validatedRuntimeEventPrefixThroughEvent(authority, events.at(count - 1).eventId) : null;
    }
    return null;
}
export function projectReacquiredNativeWorkCommandSourceAtPrefix(prefix, input, currentOwnerPrefix) {
    try {
        const proof = input.task.sourceReacquisition;
        if (proof === undefined || !isNativeWorksiteCommandReacquisitionRequest(proof.request) ||
            !same(constructNativeWorksiteCommandExecutionTask({ ...proof.request, sourceReacquisition: proof }), input.task) ||
            !sameEventResource(proof.request.source.prefix, proof.nativeBasis.predecessorPrefix) ||
            (currentOwnerPrefix !== undefined && (!sameEventResource(proof.nativeBasis.predecessorPrefix, currentOwnerPrefix) ||
                proof.nativeBasis.predecessorPrefix.prefixLength > currentOwnerPrefix.prefixLength)))
            return null;
        const preparedPrefix = preparationCut(prefix, proof.nativeBasis.predecessorPrefix);
        if (preparedPrefix === null)
            return null;
        const occurrence = projectNativeWorkReacquisitionOccurrence(proof.nativeBasis, proof.request, preparedPrefix);
        if (occurrence === null || projectCCallCarrierPhaseAtPrefix(preparedPrefix, occurrence.call)?.phase !== "selected_no_evidence")
            return null;
        const { execution: basis, call } = occurrence;
        const historicalPrefix = preparationCut(preparedPrefix, proof.request.source.prefix);
        const original = historicalPrefix === null ? null : projectNativeWorkCommandSourceAtPrefix(historicalPrefix, input.task);
        if (original === null || original.sourceResult.graphCallId !== proof.request.source.graphCallRef ||
            original.sourceResult.runId === call.runId)
            return null;
        const recordedCover = projectWorksiteRevisionBindingCover(preparedPrefix, input.task.sourceNativeWork.task.workspaceBinding, input.task.workspaceBinding, [original.sourceBasis]);
        if (recordedCover === null || !same(recordedCover, proof.bindingCoverEventRefs))
            return null;
        const events = runtimeEventBodiesAtPrefix(prefix);
        const result = one(indexedRuntimeEvents(prefix, "related:" + proof.nativeBasis.cCallRef), e => e.kind === "c_call_result_admitted" && e.aggregateId === proof.nativeBasis.cCallRef);
        const judgment = one(indexedRuntimeEvents(prefix, "related:" + proof.nativeBasis.cCallRef), e => e.kind === "c_call_judged" && e.aggregateId === proof.nativeBasis.cCallRef);
        const parentCall = one(indexedRuntimeEvents(prefix, "related:" + input.parentCCallRef), e => e.kind === "c_call_opened" && e.aggregateId === input.parentCCallRef && e.basisId === input.parentBasis.basisRef);
        const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
        if (basis.invocationAdmissionRef !== input.parentBasis.invocationAdmissionRef || basis.invocationRef !== input.parentBasis.invocationRef ||
            basis.rootImplementationSetRef !== input.parentBasis.rootImplementationSetRef || basis.rootImplementationSetDigest !== input.parentBasis.rootImplementationSetDigest ||
            result === null || judgment === null || result.runId !== input.runId || result.runId !== call.runId ||
            result.graphCallId !== call.graphCallId || result.basisId !== basis.basisRef || !record(result.payload) ||
            result.payload.resultClass !== "success" || !same(result.payload.value, input.task) || result.payload.valueDigest !== hash(input.task) ||
            result.payload.contractRef !== call.outputContractRef || !Array.isArray(result.payload.evidenceRefs) || result.payload.evidenceRefs.length !== 1 ||
            judgment.runId !== call.runId || judgment.graphCallId !== call.graphCallId || judgment.basisId !== basis.basisRef ||
            !record(judgment.payload) || judgment.payload.predicateRef !== call.judgmentPredicateRef || judgment.payload.contractRef !== call.judgmentContractRef ||
            judgment.payload.judgment !== "advance" || judgment.payload.resultRef !== result.payload.resultRef ||
            judgment.payload.resultDigest !== result.payload.resultDigest || !judgment.causationEventRefs.includes(result.eventId) ||
            parentCall === null || parentCall.runId !== input.runId || parentCall.admissionOrdinal <= judgment.admissionOrdinal ||
            !record(parentCall.payload) || parentCall.payload.callClass !== "workflow" ||
            parentCall.payload.childGraphFunctionRef !== "graph-function://abiogenesis/worksite/command-execution@5" ||
            invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.task.capabilityGrant))
            return null;
        const evidenceRefs = result.payload.evidenceRefs;
        const evidence = one(indexedRuntimeEvents(prefix, "related:" + call.cCallRef), e => e.kind === "c_call_evidenced" && e.aggregateId === call.cCallRef &&
            e.basisId === basis.basisRef && e.runId === call.runId && e.graphCallId === call.graphCallId && record(e.payload) &&
            evidenceRefs.includes(e.payload.evidenceRef));
        if (evidence === null || !record(evidence.payload) || evidence.payload.evidenceClass !== "deterministic" ||
            evidence.payload.contractRef !== call.evidenceContractRef || evidence.payload.implementationRef !== call.implementationRef ||
            evidence.payload.inputDigest !== basis.rawInputDigest || evidence.payload.outputDigest !== result.payload.valueDigest ||
            projectAdmittedCCallStateAtPrefix(prefix, call, { ...result.payload, kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: result.eventId }, { ...judgment.payload, kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: judgment.eventId }) === null)
            return null;
        const source = projectNativeWorkCommandSourceAtPrefix(prefix, input.task);
        if (source === null)
            return null;
        const covers = projectWorksiteRevisionBindingCover(prefix, input.task.sourceNativeWork.task.workspaceBinding, input.task.workspaceBinding, [source.sourceBasis]);
        return covers !== null && proof.bindingCoverEventRefs.every(ref => covers.includes(ref)) ? source : null;
    }
    catch {
        return null;
    }
}
