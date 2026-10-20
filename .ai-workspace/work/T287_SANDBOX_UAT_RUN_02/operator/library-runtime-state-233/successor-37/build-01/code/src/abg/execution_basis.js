import { selectRuntimeEventPrefixFromStore, projectOwnedRuntimeEventPrefixAtDurablePrefix, selectRuntimeEventPrefixFromAuthority } from "./event_prefix.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { projectObservedWorksiteCommandChildAtPrefix } from "./worksite_input_provenance.js";
import { admittedNativeTask } from "./native_worksite_execution.js";
import { isC2WorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { projectNativeWorkCommandSourceAtPrefix, worksiteCommandSourcesInvalidatedAfter } from "./native_worksite_execution.js";
import { types } from "node:util";
import { hasOwnedDeclarationLookups } from "../implementation/leaf_invocation_port.js";
import { rehydrateConstructionIntentForCursorAtPrefix } from "./traversal_route.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { projectOwnedPrefixArtifactTruth, runtimePrefixFromOwnedArtifactTruth } from "./artifact_truth.js";
import { WORKSITE_REVISION_IDS, isWorksiteExecutionTask, worksiteExecutionImplementationRef } from "../product/worksite_revision.js";
import { runtimeEventPrefixDigest, validatedRuntimeEventPrefixBeforeEvent } from "./event_prefix.js";
import { worksiteExecutionSourcesCurrent, worksiteRevisionEntryBindingDisposition } from "./worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS as forwardIds } from "../product/worksite_command_forward_identity.js";
import { isWorksiteCommandForwardRequest, isWorksiteCommandForwardTask } from "../product/worksite_command_forward.js";
import { worksiteCommandForwardChildSourceAtPrefix } from "./worksite_command_forward.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { revisionPreparationHasNativeBridgeSourceAtPrefix, readDependencyPreparationHasNativeBridgeSourceAtPrefix } from "./worksite_input_provenance.js";
import { deriveRuntimeEventCalculusProjection, holdsAt, constructWorksiteObservationCurrentFluent } from "./event_calculus.js";
import { isWorksitePreparationInput, preparationConstructionTasks } from "../product/worksite_preparation.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { isProductExecutionResolution } from "../product/execution_resolution.js";
import { rootCTraversalCoordinate } from "../gtl/source_path.js";
import { sampleNativeEventTime } from "./native_event_time.js";
import { isNativeWorkspaceWorkTask } from "../product/native_workspace_work.js";
import {} from "../product/index.js";
import { isImplementationResolutionCandidate, isImplementationResolutionSetCandidate, } from "../product/implementation_resolution.js";
import { isWorksiteFileReplaceRequest } from "../product/worksite_effect.js";
import { isWorksiteFileReplaceVector, isWorksiteConstructionResult, isWorksiteConstructionTask, WORKSITE_CONSTRUCTION_IDS, } from "../product/worksite_construction.js";
import { isWorksiteCommandExecutionTask, WORKSITE_COMMAND_EXECUTION_IDS, } from "../product/worksite_command_execution.js";
import { isWorksiteBranchConstructionTask, isWorksiteBranchConstructionVector, WORKSITE_BRANCH_CONSTRUCTION_IDS, } from "../product/worksite_branch_construction.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isGraphValidation, } from "../validator/graph.js";
import { isImplementationResolutionValidation, isImplementationResolutionSetValidation, } from "../validator/implementation_resolution.js";
import { isProgramValidation, } from "../validator/validation.js";
import { hasAdmittedInvocationAtPrefix, rehydrateInvocationAdmissionAtPrefix, deriveSameRunWorksiteCommandSourceBasisAtPrefix, rehydrateInvocationSourceResultBasisAtDurablePrefix, } from "./invocation_admission.js";
import { projectExactPrefixWorkspaceEnvironment, projectWorkspaceEnvironmentFromArtifactTruth, } from "./environment_admission.js";
import { projectCurrentChildParentCCallAtPrefix, projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix } from "./c_call.js";
import { materializeGraph } from "../gtl/materialize.js";
import { hasAdmittedTraversalCursorAtPrefix, projectTraversalInputAtPrefix } from "./traversal_cursor.js";
import { AbgEventStore, admitNonEmptyRuntimeEventTransactionAtDurablePrefix, admitRuntimeEventTransactionAtDurablePrefix, admitRuntimeEventBatch, admitRuntimeEventTransactionAtExpectedPrefix, isRuntimeEventTransactionActive, admitRuntimeEvent, readHeldRuntimeEventsAtDurablePrefix, projectHeldRuntimeEventsAtDurablePrefix, assertHeldEventStoreAtDurablePrefix, compareAndAppendExpectedPrefix, captureDurablePrefixCoordinate, durableRuntimeEventPrefixThroughEvent, readRuntimeEventsAtDurablePrefix, selectHeldEventStoreDurablePrefix, validateDurablePrefixCoordinate, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, runtimeEventBodiesAtPrefix, runtimeEventAtPrefix, isOwnedRuntimeEventPrefix, selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent, } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix } from "./invocation_execution_truth.js";
import { rehydrateOpenedTraversalScopeAtPrefix, } from "./open_call.js";
/** Shared by semantic and worksite assembly; specialized owners add their
 * own source/lifecycle/task law after this one exact authentication relation. */
function deriveOwnedNativeInstructionAssemblyBasis(basis) {
    try {
        const hash = (value) => sha256Canonical(value);
        const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
        const artifactTruth = projectOwnedPrefixArtifactTruth(basis.predecessorPrefix);
        if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection")
            return null;
        const prefix = runtimePrefixFromOwnedArtifactTruth(artifactTruth);
        if (prefix === null)
            return null;
        const execution = rehydrateExecutionBasisAtPrefix(prefix, basis.executionBasis.basisRef);
        if (execution === null || hash(execution) !== hash(basis.executionBasis))
            return null;
        const program = basis.publication.programs.find(p => p.programRef === execution.programRef);
        const functions = basis.declarationGraphFunctions.filter(g => g.name === execution.graphFunctionRef &&
            hash(g) === execution.graphFunctionDigest);
        if (program === undefined || hash(program) !== execution.programDigest || functions.length !== 1 ||
            hash(functions[0]) !== hash(basis.graphFunction))
            return null;
        const graph = materializeGraph(functions[0], { invocationAdmissionRef: execution.invocationAdmissionRef,
            admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest,
            admittedInput: execution.rawInputValue });
        if (graph.materializationRef !== execution.graphRef || graph.materializationDigest !== execution.graphDigest ||
            hash(graph) !== hash(basis.graph))
            return null;
        const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCall.cCallRef);
        const opened = call === null ? undefined : runtimeEventAtPrefix(prefix, call.openedEventRef);
        if (call === null || hash(call) !== hash(basis.cCall) || call.callClass !== "leaf" ||
            !hasAdmittedTraversalCursorAtPrefix(prefix, basis.cursor) || !isRecord(opened?.payload) ||
            opened.payload.cursorRef !== basis.cursor.cursorRef || opened.payload.cursorDigest !== basis.cursor.cursorDigest ||
            basis.cursor.executionBasisRef !== execution.basisRef || basis.cursor.graphCallId !== call.graphCallId ||
            basis.cursor.frameId !== call.frameId || basis.cursor.graphRef !== graph.materializationRef ||
            projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence")
            return null;
        const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.implementationSetRef);
        const rootSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
        if (set === null || rootSet === null || set.implementationSetDigest !== execution.implementationSetDigest ||
            rootSet.implementationSetDigest !== execution.rootImplementationSetDigest ||
            rootSet.publicationDigest !== hash(basis.publication))
            return null;
        const resolutions = set.rows.filter(row => row.graphFunctionRef === call.graphFunctionRef &&
            row.programLocusRef === call.programLocusRef && row.implementationRef === call.implementationRef &&
            row.implementationBindingRef === call.implementationBindingRef && row.inputContractRef === call.inputContractRef &&
            row.outputContractRef === call.outputContractRef && row.computeRegime === call.regime);
        if (resolutions.length !== 1)
            return null;
        const inputRef = basis.cursor.inputRef, inputDigest = basis.cursor.inputDigest;
        const input = projectTraversalInputAtPrefix(prefix, graph, execution, basis.cursor);
        if (input === null)
            return null;
        if (input.retained && (input.event === null || !isRecord(input.event.payload) ||
            !isRecord(input.event.payload.boundInput) || input.event.payload.boundInput.contractRef !== call.inputContractRef))
            return null;
        const inputValue = input.value;
        const environment = projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest });
        return { prefix, execution, graph, call, resolution: resolutions[0], program,
            environment, inputRef, inputDigest, inputValue, inputOrigin: input };
    }
    catch {
        return null;
    }
}
const NATIVE_ASSEMBLY_DERIVATION = Symbol("native_assembly_basis_derivation");
class NativeAssemblyBasisDerivation {
    #basis;
    #value;
    constructor(basis, value) {
        this.#basis = basis;
        this.#value = deepFreeze(value);
        Object.freeze(this);
    }
    static value(basis) {
        const proof = Object.getOwnPropertyDescriptor(basis, NATIVE_ASSEMBLY_DERIVATION)?.value;
        return typeof proof === "object" && proof !== null && #basis in proof && proof.#basis === basis ? proof.#value : undefined;
    }
}
/** Pure helpers consume the constructed immutable basis. Raw/copy inputs retain
 * fresh durable acquisition; this value never grants an effect or current worksite. */
export function authenticateNativeInstructionAssemblyBasis(basis) {
    const owner = authenticateOwnedNativeInstructionAssemblyBasis(basis);
    if (owner === null || owner.prefix.kind === "runtime_validation_event_prefix")
        return null;
    const events = isOwnedRuntimeEventPrefix(owner.prefix) ? owner.prefix.selection.materialize() :
        runtimeEventsFromValidatedPrefix(owner.prefix);
    return { ...owner, events, prefix: isOwnedRuntimeEventPrefix(owner.prefix)
            ? selectValidatedRuntimeEventPrefix(events) : owner.prefix };
}
/** @internal Ordinary consumers borrow the same authenticated facts without a full-history output. */
export function authenticateOwnedNativeInstructionAssemblyBasis(basis) {
    try {
        return NativeAssemblyBasisDerivation.value(basis) ?? deriveOwnedNativeInstructionAssemblyBasis(basis);
    }
    catch {
        return null;
    }
}
export function constructNativeInstructionAssemblyBasis(basis) {
    try {
        if (NativeAssemblyBasisDerivation.value(basis) !== undefined)
            return basis;
        const captured = { ...admitIJsonValue(basis),
            predecessorPrefix: captureDurablePrefixCoordinate(basis.predecessorPrefix) };
        const value = deriveOwnedNativeInstructionAssemblyBasis(captured);
        if (value === null)
            return null;
        Object.defineProperty(captured, NATIVE_ASSEMBLY_DERIVATION, { value: new NativeAssemblyBasisDerivation(captured, value) });
        return deepFreeze(captured);
    }
    catch {
        return null;
    }
}
function sameCanonical(left, right) {
    return canonicalJson(left) === canonicalJson(right);
}
function worksiteAuthorityCarrier(value) {
    if (isWorksitePreparationInput(value)) {
        const task = preparationConstructionTasks(value)[0];
        return task === undefined ? null : worksiteAuthorityCarrier(task);
    }
    if (isWorksiteFileReplaceRequest(value)) {
        return {
            workspaceAuthorityBasis: value.workspaceAuthorityBasis,
            workspaceBinding: null,
            workspaceBindingId: value.workspaceBindingIdentity,
            workspaceBindingDigest: value.workspaceBindingDigest,
        };
    }
    if (isNativeWorkspaceWorkTask(value) || isWorksiteCommandForwardRequest(value) || isWorksiteCommandForwardTask(value) || isWorksiteConstructionTask(value) ||
        isWorksiteExecutionTask(value)) {
        return {
            workspaceAuthorityBasis: value.workspaceAuthorityBasis,
            workspaceBinding: value.workspaceBinding,
            workspaceBindingId: value.workspaceBinding.bindingId,
            workspaceBindingDigest: value.workspaceBinding.bindingDigest,
        };
    }
    if (isWorksiteBranchConstructionTask(value)) {
        const authority = value.branches[0]?.constructionTask.workspaceAuthorityBasis;
        if (authority === undefined)
            return null;
        return {
            workspaceAuthorityBasis: authority,
            workspaceBinding: value.workspaceBinding,
            workspaceBindingId: value.workspaceBinding.bindingId,
            workspaceBindingDigest: value.workspaceBinding.bindingDigest,
        };
    }
    if (isWorksiteFileReplaceVector(value)) {
        const request = value.members[0]?.value;
        if (request === undefined)
            return null;
        return {
            workspaceAuthorityBasis: request.workspaceAuthorityBasis,
            workspaceBinding: null,
            workspaceBindingId: request.workspaceBindingIdentity,
            workspaceBindingDigest: request.workspaceBindingDigest,
        };
    }
    if (isWorksiteBranchConstructionVector(value)) {
        const task = value.members[0]?.value;
        if (task === undefined)
            return null;
        return {
            workspaceAuthorityBasis: task.workspaceAuthorityBasis,
            workspaceBinding: task.workspaceBinding,
            workspaceBindingId: task.workspaceBinding.bindingId,
            workspaceBindingDigest: task.workspaceBinding.bindingDigest,
        };
    }
    return null;
}
function exactWorksiteEnvironmentAtPrefix(prefix, carrier) {
    const environment = projectExactPrefixWorkspaceEnvironment(prefix, {
        ref: carrier.workspaceBindingId,
        digest: carrier.workspaceBindingDigest,
    });
    if (environment.kind !== "exact_prefix_workspace_environment" ||
        !sameCanonical(environment.workspaceAuthorityBasis, carrier.workspaceAuthorityBasis) ||
        carrier.workspaceBinding !== null && !sameCanonical(environment.workspaceBinding, carrier.workspaceBinding) ||
        carrier.workspaceAuthorityBasis.workspaceId !==
            environment.workspaceBinding.workspaceId ||
        carrier.workspaceAuthorityBasis.authorityBasisId !==
            environment.workspaceBinding.authorityBasisId ||
        carrier.workspaceAuthorityBasis.authorityBasisDigest !==
            environment.workspaceBinding.authorityBasisDigest ||
        carrier.workspaceAuthorityBasis.authorizedActorRef !==
            environment.workspaceBinding.authorizedActorRef)
        return null;
    return environment;
}
// Module-local proof seam; this pure relation does not admit an owner or invocation.
export function exactProgramOwnerInstall(environment, rows, graphFunctionRef, moduleRef, programRef, programPublicationDigest, programDigest, programPublication) {
    if (rows.some((row) => row.publicationDigest !== programPublicationDigest))
        return null;
    // Validator binds the full raw publication. Installed contribution bindings
    // use its semantic projection, which must be derived from those exact bytes.
    if (programPublication === undefined ||
        sha256Canonical(programPublication) !== programPublicationDigest ||
        programPublication.moduleRef !== moduleRef ||
        programPublication.programs.filter((program) => program.programRef === programRef &&
            sha256Canonical(program) === programDigest).length !== 1)
        return null;
    const semanticPublicationDigest = modulePublicationSemanticDigest(programPublication);
    const installs = environment.productInstalls.filter((install) => install.installedRoot === environment.workspaceBinding.roots.productRoot &&
        install.productId === programPublication.owningProductId &&
        install.productContentDigest === programPublication.productContentDigest &&
        install.manifestDigest === programPublication.productManifestDigest &&
        install.artifactDigest === programPublication.artifactDigest &&
        install.contributionManifest.productId === install.productId &&
        install.contributionManifest.productVersion === install.packageVersion &&
        install.contributionManifest.rows.filter((row) => row.kind === "graph_function" &&
            row.moduleRef === moduleRef && row.declarationOrContractRef === graphFunctionRef &&
            row.owningProductId === install.productId && row.programMembershipRefs.filter((ref) => ref === programRef).length === 1).length === 1 &&
        install.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === moduleRef &&
            binding.publicationDigest === semanticPublicationDigest).length === 1);
    // Whole-Program validation owns consumer membership. Each leaf keeps its independently
    // resolved GraphFunction and implementation publication/install coordinates.
    return installs.length === 1 && rows.every((row) => exactLeafOwnerInstallations(environment, row)) ? installs[0] : null;
}
function exactLeafOwnerInstallations(environment, row) {
    const graphOwners = environment.productInstalls.filter((install) => install.productId === row.graphFunctionOwnerProductId &&
        install.contributionManifest.rows.filter((entry) => entry.kind === "graph_function" &&
            entry.declarationOrContractRef === row.graphFunctionRef && entry.owningProductId === install.productId &&
            install.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === entry.moduleRef &&
                binding.publicationDigest === row.graphFunctionPublicationDigest).length === 1).length === 1);
    const implementations = environment.productInstalls.filter((install) => install.productId === row.implementationOwnerProductId &&
        install.packageName === row.packageName && install.packageVersion === row.packageVersion &&
        install.contributionManifest.publicationBindings.filter((binding) => binding.publicationDigest === row.implementationPublicationDigest).length === 1);
    return graphOwners.length === 1 && implementations.length === 1;
}
function exactChildOwnerInstallations(ownerInstall, environment, localRows, rows, graphFunctionRef, graphFunctionDigest, programModuleRef, programRef, programValidationRef, programGraphFunctionDigests, programPublicationDigest) {
    if (localRows.length !== rows.length ||
        programGraphFunctionDigests.filter((digest) => digest === graphFunctionDigest).length !== 1 ||
        rows.some((row, index) => {
            const local = localRows[index];
            return local === undefined ||
                row.requirementKey !== local.requirementKey ||
                row.requirementKeyDigest !== local.requirementKeyDigest ||
                row.programValidationRef !== programValidationRef ||
                row.graphFunctionRef !== local.graphFunctionRef ||
                row.graphFunctionDigest !== graphFunctionDigest ||
                row.graphFunctionDigest !== local.graphFunctionDigest ||
                row.nodeRef !== local.nodeRef ||
                row.programLocusRef !== local.programLocusRef ||
                row.computeRegime !== local.fibre ||
                row.implementationBindingRef !==
                    local.requirement.implementationBindingRef ||
                row.inputContractRef !== local.requirement.inputContractRef ||
                row.outputContractRef !== local.requirement.outputContractRef ||
                row.failureContractRef !== local.requirement.failureContractRef ||
                row.refusalContractRef !== local.requirement.refusalContractRef;
        }) || rows.some((row) => row.graphFunctionRef !== graphFunctionRef ||
        row.publicationDigest !== programPublicationDigest ||
        !exactLeafOwnerInstallations(environment, row)))
        return false;
    if (ownerInstall.installedRoot !== environment.workspaceBinding.roots.productRoot)
        return false;
    const graphOwners = environment.productInstalls.flatMap((install) => install.contributionManifest.rows.filter((row) => row.kind === "graph_function" && row.declarationOrContractRef === graphFunctionRef && row.owningProductId === install.productId &&
        install.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === row.moduleRef &&
            (rows.length === 0 || rows.every((leaf) => leaf.graphFunctionOwnerProductId === install.productId &&
                leaf.graphFunctionPublicationDigest === binding.publicationDigest))).length === 1));
    return graphOwners.length === 1;
}
function exactC2SourceEnvironment(durablePrefix, authorityPrefix, invocation, task) {
    if (task === null)
        return true;
    if (isObservedWorksiteCommandExecutionTask(task)) {
        const admitted = indexedRuntimeEvents(authorityPrefix, "id:" + invocation.admissionEventRef).find(event => event.eventId === invocation.admissionEventRef);
        return invocation.sourceResultBasis === null && invocation.programRef === WORKSITE_COMMAND_EXECUTION_IDS.programRef &&
            invocation.graphFunctionRef === WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef &&
            invocation.inputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
            invocation.rawInputDigest === sha256Canonical(task) &&
            invocation.workspaceBindingId === task.workspaceBinding.bindingId && invocation.workspaceBindingDigest === task.workspaceBinding.bindingDigest &&
            admitted?.kind === "invocation_admitted" && isJsonRecord(admitted.payload) &&
            admitted.payload.invocationAdmissionRef === invocation.invocationAdmissionRef && admitted.payload.rawInputDigest === invocation.rawInputDigest &&
            !worksiteCommandSourcesInvalidatedAfter(authorityPrefix, admitted.admissionOrdinal, task.workspaceAuthorityBasis.canonicalRoot, task.protectedObservations.map(row => row.subject.relativePath));
    }
    const nativeTask = admittedNativeTask(authorityPrefix, task);
    if (nativeTask !== null) {
        const basis = invocation.sourceResultBasis;
        const source = projectNativeWorkCommandSourceAtPrefix(authorityPrefix, nativeTask);
        if (basis === null || source === null || !sameCanonical(basis.sourceResultValue, nativeTask.sourceNativeWork) ||
            basis.sourceResultAdmissionEventRef !== source.sourceResult.eventId ||
            basis.sourceResultJudgmentEventRef !== source.sourceJudgment.eventId ||
            basis.sourceCCallRef !== nativeTask.sourceNativeWork.provenance.cCallRef)
            return false;
        const rehydrated = rehydrateInvocationSourceResultBasisAtDurablePrefix(durablePrefix, basis);
        return rehydrated !== null && sameCanonical(rehydrated, basis);
    }
    if (task.kind === "worksite_revision_command_execution_task")
        return false; // D2 is an authenticated child arm only.
    if (task.readDependencyBasis !== undefined)
        return false; // Initial-job reads require their same-invocation native bridge.
    const basis = invocation.sourceResultBasis;
    const sourceKind = basis?.sourceGraphFunctionRef ===
        WORKSITE_CONSTRUCTION_IDS.graphFunctionRef
        ? "c1"
        : basis?.sourceGraphFunctionRef ===
            WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef
            ? "c3"
            : null;
    const sourceProgramRef = sourceKind === "c1"
        ? WORKSITE_CONSTRUCTION_IDS.programRef
        : WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef;
    const sourceRootGraphFunctionRef = sourceKind === "c1"
        ? WORKSITE_CONSTRUCTION_IDS.graphFunctionRef
        : WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef;
    const sourceTaskContractRef = sourceKind === "c1"
        ? WORKSITE_CONSTRUCTION_IDS.taskContractRef
        : WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef;
    if (basis === null ||
        sourceKind === null ||
        basis.sourceResultContractRef !== WORKSITE_CONSTRUCTION_IDS.resultContractRef ||
        basis.sourceResultValueDigest !== sha256Canonical(task.sourceConstructionResult) ||
        !sameCanonical(basis.sourceResultValue, task.sourceConstructionResult)) {
        return false;
    }
    const sourceRunClosures = indexedRuntimeEvents(authorityPrefix, "run:" + basis.sourceRunId)
        .filter((event) => event.kind === "run_closed" && event.runId === basis.sourceRunId);
    if (sourceRunClosures.length !== 1)
        return false;
    let sourcePrefix;
    let sourceDurablePrefix;
    try {
        sourcePrefix = validatedRuntimeEventPrefixThroughEvent(authorityPrefix, sourceRunClosures[0].eventId);
        const sourceEvents = runtimeEventBodiesAtPrefix(sourcePrefix);
        sourceDurablePrefix = durableRuntimeEventPrefixThroughEvent(durablePrefix, sourceRunClosures[0].eventId);
        if (!validateDurablePrefixCoordinate(sourceDurablePrefix) ||
            !sameCanonical(readRuntimeEventsAtDurablePrefix(sourceDurablePrefix), sourceEvents))
            return false;
    }
    catch {
        return false;
    }
    const sourceBasis = rehydrateInvocationSourceResultBasisAtDurablePrefix(sourceDurablePrefix, basis);
    if (sourceBasis === null || !sameCanonical(sourceBasis, basis))
        return false;
    const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(sourcePrefix, basis.sourceInvocationAdmissionRef);
    if (sourceInvocation === null ||
        sourceInvocation.invocationRef !== basis.sourceInvocationRef ||
        sourceInvocation.workspaceBindingId !== basis.workspaceBindingId ||
        sourceInvocation.workspaceBindingDigest !== basis.workspaceBindingDigest) {
        return false;
    }
    const basisEvents = indexedRuntimeEvents(sourcePrefix, "payload:invocationAdmissionRef:" + basis.sourceInvocationAdmissionRef).filter((event) => event.kind === "basis_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.basisClass === "root" &&
        event.payload.invocationAdmissionRef === basis.sourceInvocationAdmissionRef);
    if (basisEvents.length !== 1 || !isJsonRecord(basisEvents[0].payload) ||
        typeof basisEvents[0].payload.basisRef !== "string")
        return false;
    const sourceExecutionBasis = rehydrateExecutionBasisAtPrefix(sourcePrefix, basisEvents[0].payload.basisRef);
    if (sourceExecutionBasis === null ||
        sourceExecutionBasis.basisClass !== "root" ||
        sourceExecutionBasis.invocationAdmissionRef !==
            sourceInvocation.invocationAdmissionRef ||
        sourceExecutionBasis.invocationRef !== sourceInvocation.invocationRef ||
        sourceExecutionBasis.invocationDigest !== sourceInvocation.invocationDigest ||
        sourceExecutionBasis.rawInputAdmissionRef !==
            sourceInvocation.rawInputAdmissionRef ||
        sourceExecutionBasis.rawInputDigest !== sourceInvocation.rawInputDigest ||
        sourceExecutionBasis.workspaceBindingId !== basis.workspaceBindingId ||
        sourceExecutionBasis.workspaceBindingDigest !==
            basis.workspaceBindingDigest ||
        sourceExecutionBasis.programRef !== sourceProgramRef ||
        sourceInvocation.programRef !== sourceProgramRef ||
        sourceExecutionBasis.programDigest !== sourceInvocation.programDigest ||
        sourceExecutionBasis.graphFunctionRef !== sourceRootGraphFunctionRef ||
        sourceInvocation.graphFunctionRef !== sourceRootGraphFunctionRef ||
        sourceExecutionBasis.graphFunctionDigest !==
            sourceInvocation.graphFunctionDigest ||
        sourceExecutionBasis.actorRef !== sourceInvocation.actorRef ||
        sourceExecutionBasis.catalogBasisRef !== sourceInvocation.catalogBasisRef ||
        sourceExecutionBasis.catalogBasisDigest !==
            sourceInvocation.catalogBasisDigest ||
        sourceExecutionBasis.catalogViewId !== sourceInvocation.catalogViewId ||
        sourceExecutionBasis.catalogViewDigest !== sourceInvocation.catalogViewDigest ||
        sourceExecutionBasis.parentExecutionBasisRef !== null ||
        sourceExecutionBasis.parentTraversalScopeRef !== null ||
        sourceExecutionBasis.parentCCallRef !== null ||
        sourceInvocation.inputContractRef !== sourceTaskContractRef ||
        sourceExecutionBasis.resultContractRef !==
            WORKSITE_CONSTRUCTION_IDS.resultContractRef ||
        sourceInvocation.outputContractRef !== basis.sourceResultContractRef) {
        return false;
    }
    const sourceTask = sourceExecutionBasis.rawInputValue;
    let targets;
    if (sourceKind === "c1" && isWorksiteConstructionTask(sourceTask)) {
        targets = sourceTask.targets;
    }
    else if (sourceKind === "c3" &&
        isWorksiteBranchConstructionTask(sourceTask)) {
        targets = sourceTask.branches.flatMap((branch) => branch.constructionTask.targets);
    }
    else {
        return false;
    }
    const sourceCarrier = worksiteAuthorityCarrier(sourceTask);
    if (sourceCarrier === null || sourceCarrier.workspaceBinding === null ||
        sourceCarrier.workspaceBindingId !== basis.workspaceBindingId ||
        sourceCarrier.workspaceBindingDigest !== basis.workspaceBindingDigest ||
        sourceInvocation.workspaceId !== basis.sourceWorkspaceId ||
        sourceInvocation.actorRef !==
            sourceCarrier.workspaceAuthorityBasis.authorizedActorRef ||
        sourceCarrier.workspaceAuthorityBasis.workspaceId !==
            basis.sourceWorkspaceId)
        return false;
    const sourceResult = task.sourceConstructionResult;
    if (!isWorksiteConstructionResult(sourceResult) ||
        sourceResult.resultRef !== task.sourceConstructionResultRef ||
        sourceResult.resultDigest !== task.sourceConstructionResultDigest) {
        return false;
    }
    if (targets.length !== sourceResult.members.length ||
        sourceResult.members.some((member, ordinal) => {
            const target = targets[ordinal];
            return target === undefined || member.inputMemberRef !== target.targetRef ||
                member.successorObservation.workspaceBindingIdentity !==
                    sourceCarrier.workspaceBindingId ||
                member.successorObservation.subjectRef !== target.subject.subjectRef ||
                member.successorObservation.subjectDigest !== target.subject.subjectDigest;
        }))
        return false;
    const sourceEnvironment = projectExactPrefixWorkspaceEnvironment(sourceDurablePrefix, {
        ref: sourceInvocation.workspaceBindingId,
        digest: sourceInvocation.workspaceBindingDigest,
    });
    return sourceEnvironment.kind === "exact_prefix_workspace_environment" &&
        sameCanonical(sourceEnvironment.workspaceAuthorityBasis, sourceCarrier.workspaceAuthorityBasis) &&
        sameCanonical(sourceEnvironment.workspaceBinding, sourceCarrier.workspaceBinding) &&
        sameCanonical(sourceEnvironment.workspaceAuthorityBasis, task.workspaceAuthorityBasis) &&
        sameCanonical(sourceEnvironment.workspaceBinding, task.workspaceBinding);
}
function worksiteCommandTask(value) {
    return isWorksiteExecutionTask(value) ? value : null;
}
const executionBases = new WeakSet();
const implementationResolutions = new WeakSet();
const implementationSets = new WeakSet();
const interactionSets = new WeakSet();
function isJsonRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function canonicalRecordDigest(value) {
    if (!isJsonRecord(value))
        return null;
    try {
        return sha256Canonical(value);
    }
    catch {
        return null;
    }
}
function detachJsonRecord(value) {
    if (!isJsonRecord(value))
        return null;
    try {
        const detached = structuredClone(value);
        return isJsonRecord(detached) ? deepFreeze(detached) : null;
    }
    catch {
        return null;
    }
}
/** Re-enters the current physical prefix before C2 creates any launch or observation artifact. */
export function hasExactWorksiteCommandLeafSourceAtDurablePrefix(predecessor, cCallRef, value) {
    if (!isJsonRecord(value))
        return false;
    try {
        const events = readRuntimeEventsAtDurablePrefix(predecessor, { requireCurrent: true });
        const prefix = selectValidatedRuntimeEventPrefix(events);
        const nativeTask = admittedNativeTask(prefix, value);
        if (nativeTask === null && !isWorksiteExecutionTask(value))
            return false;
        const task = (nativeTask ?? value);
        const opens = events.filter((event) => event.kind === "c_call_opened" && event.aggregateId === cCallRef &&
            event.graphFunctionRef === (value.kind === "worksite_command_execution_task" ? WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef : WORKSITE_REVISION_IDS.graphFunctionRef) && isJsonRecord(event.payload));
        if (opens.length !== 1 || opens[0].basisId === null)
            return false;
        const opened = opens[0];
        const execution = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
        const fibres = events.filter((event) => event.kind === "c_call_fibre_selected" && event.aggregateId === cCallRef &&
            event.basisId === opened.basisId && event.runId === opened.runId && isJsonRecord(event.payload) &&
            event.payload.implementationRef === worksiteExecutionImplementationRef(task) &&
            event.payload.implementationBindingRef === (value.kind === "worksite_command_execution_task" ? WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef : WORKSITE_REVISION_IDS.implementationBindingRef) && event.payload.regime === "F_P");
        if (execution === null || fibres.length !== 1 || !sameCanonical(execution.rawInputValue, value) ||
            events.some((event) => event.aggregateId === cCallRef && (event.kind === "c_call_evidenced" || event.kind === "c_call_result_admitted")) ||
            exactWorksiteEnvironmentAtPrefix(predecessor, worksiteAuthorityCarrier(task)) === null)
            return false;
        // The native source branch below conjoins provenance and currentness once.
        if (nativeTask === null && !isObservedWorksiteCommandExecutionTask(value) && !worksiteExecutionSourcesCurrent(prefix, task))
            return false;
        const invocation = rehydrateInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
        if (invocation === null || invocation.capabilityGrants.length !== 1 || !sameCanonical(invocation.capabilityGrants[0], value.capabilityGrant))
            return false;
        if (execution.basisClass === "root")
            return exactC2SourceEnvironment(predecessor, prefix, invocation, task);
        if (execution.parentExecutionBasisRef === null || execution.parentCCallRef === null || typeof opened.runId !== "string")
            return false;
        const parent = rehydrateExecutionBasisAtPrefix(prefix, execution.parentExecutionBasisRef);
        const basisEvent = events.find((event) => event.eventId === execution.admissionEventRef);
        if (parent === null || basisEvent === undefined)
            return false;
        if (isObservedWorksiteCommandExecutionTask(value))
            return projectObservedWorksiteCommandChildAtPrefix(prefix, {
                parentBasis: parent, parentCCallRef: execution.parentCCallRef, runId: opened.runId, task: value
            }) !== null;
        // Native provenance and currentness must include later admitted mutations
        // through the held pre-effect prefix. C1/revision preparation retains its
        // historical child-admission cut and separate latest-currentness check.
        const sourcePrefix = nativeTask !== null ? prefix
            : validatedRuntimeEventPrefixBeforeEvent(prefix, basisEvent.eventId);
        return deriveSameRunWorksiteCommandSourceBasisAtPrefix(sourcePrefix, {
            parentBasis: parent, parentCCallRef: execution.parentCCallRef, runId: opened.runId, task,
        }, predecessor) !== null;
    }
    catch {
        return false;
    }
}
export function hasExactInvocationObservationBasis(value, workspaceBindingId, workspaceBindingDigest, program) {
    if (value.kind !== "observation_snapshot")
        return true;
    if (value.schemaVersion !== "5.0.0" ||
        typeof value.snapshotRef !== "string" ||
        typeof value.snapshotDigest !== "string" ||
        !isJsonRecord(value.workspaceBinding) ||
        value.workspaceBinding.workspaceBindingId !== workspaceBindingId ||
        value.workspaceBinding.workspaceBindingDigest !==
            workspaceBindingDigest ||
        !isJsonRecord(value.actionCatalog) ||
        program.actionCatalog === undefined ||
        sha256Canonical(value.actionCatalog) !==
            sha256Canonical(program.actionCatalog)) {
        return false;
    }
    const { snapshotRef, snapshotDigest, ...body } = value;
    const expectedDigest = sha256Canonical(body);
    return snapshotDigest === expectedDigest &&
        snapshotRef ===
            `observation-snapshot://product/${expectedDigest.slice("sha256:".length)}`;
}
export function isExecutionBasis(value) {
    return executionBases.has(value);
}
export function isAdmittedImplementationResolution(value) {
    return implementationResolutions.has(value);
}
export function isAdmittedImplementationSet(value) {
    return implementationSets.has(value);
}
export function isAdmittedInteractionSet(value) {
    return interactionSets.has(value);
}
export function admittedConstructionComposition(basis) {
    const composition = basis.constructionComposition;
    if (composition === null)
        return null;
    const { compositionDigest, ...body } = composition;
    return (basis.constructionCompositionRef === composition.compositionRef &&
        basis.constructionCompositionDigest === compositionDigest &&
        compositionDigest === sha256Canonical(body) &&
        composition.graphFunctionRef === basis.graphFunctionRef)
        ? composition
        : null;
}
export function selectAdmittedConstructionAuthority(basis, semanticAuthority) {
    const composition = admittedConstructionComposition(basis);
    const matches = composition?.authorities.filter((binding) => binding.semanticAuthority === semanticAuthority) ?? [];
    return matches.length === 1 ? matches[0] : null;
}
export function isAdmittedConstructionInteractionLocus(basis, programLocusRef, compositionRef) {
    const composition = admittedConstructionComposition(basis);
    return composition !== null &&
        composition.compositionRef === compositionRef &&
        composition.interactionProgramLocusRef === programLocusRef;
}
export function hasAdmittedImplementationSet(store, set) {
    return hasAdmittedImplementationSetAtPrefix(selectRuntimeEventPrefixFromStore(store), set);
}
export function hasAdmittedImplementationSetAtPrefix(prefix, set) {
    if (!isAdmittedImplementationSet(set))
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, implementationSetRef: _implementationSetRef, implementationSetDigest: _implementationSetDigest, admissionEventRef: _admissionEventRef, ...body } = set;
    const event = indexedRuntimeEvents(prefix, "id:" + set.admissionEventRef).find((candidate) => candidate.eventId === set.admissionEventRef);
    return (sha256Canonical(body) === set.implementationSetDigest &&
        set.implementationSetRef ===
            `implementation-set://abiogenesis/${set.implementationSetDigest.slice("sha256:".length)}` &&
        event?.kind === "implementation_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.implementationSetRef === set.implementationSetRef &&
        event.payload.implementationSetDigest === set.implementationSetDigest &&
        event.payload.implementationSet !== undefined &&
        isJsonRecord(event.payload.implementationSet) &&
        sha256Canonical(event.payload.implementationSet) === sha256Canonical({
            implementationSetRef: set.implementationSetRef,
            implementationSetDigest: set.implementationSetDigest,
            ...body,
        }));
}
export function selectAdmittedImplementationResolution(set, selection) {
    if (!isAdmittedImplementationSet(set))
        return null;
    const matches = set.rows.filter((row) => row.graphFunctionRef === selection.graphFunctionRef &&
        row.nodeRef === selection.nodeRef &&
        row.programLocusRef === selection.programLocusRef &&
        row.implementationBindingRef === selection.implementationBindingRef);
    return matches.length === 1 ? matches[0] ?? null : null;
}
export function selectAdmittedInteractionContract(set, selection) {
    if (!isAdmittedInteractionSet(set))
        return null;
    const matches = set.rows.filter((row) => row.graphFunctionRef === selection.graphFunctionRef &&
        row.nodeRef === selection.nodeRef &&
        row.programLocusRef === selection.programLocusRef &&
        row.requirement.interactionKind === selection.interactionKind &&
        row.requirement.actorCapabilityRef === selection.actorCapabilityRef &&
        row.requirement.requestContractRef === selection.requestContractRef &&
        row.requirement.responseContractRef === selection.responseContractRef &&
        row.requirement.continuationContractRef ===
            selection.continuationContractRef);
    return matches.length === 1 ? matches[0] ?? null : null;
}
export function hasAdmittedInteractionSetAtPrefix(prefix, set) {
    if (!isAdmittedInteractionSet(set))
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, interactionSetRef: _interactionSetRef, interactionSetDigest: _interactionSetDigest, admissionEventRef: _admissionEventRef, ...body } = set;
    const event = indexedRuntimeEvents(prefix, "id:" + set.admissionEventRef).find((candidate) => candidate.eventId === set.admissionEventRef);
    return (sha256Canonical(body) === set.interactionSetDigest &&
        set.interactionSetRef ===
            `interaction-set://abiogenesis/${set.interactionSetDigest.slice("sha256:".length)}` &&
        event?.kind === "implementation_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.interactionSetRef === set.interactionSetRef &&
        event.payload.interactionSetDigest === set.interactionSetDigest &&
        event.payload.interactionSet !== undefined &&
        isJsonRecord(event.payload.interactionSet) &&
        sha256Canonical(event.payload.interactionSet) === sha256Canonical({
            interactionSetRef: set.interactionSetRef,
            interactionSetDigest: set.interactionSetDigest,
            ...body,
        }));
}
export function rehydrateAdmittedImplementationSet(store, implementationSetRef) {
    return rehydrateAdmittedImplementationSetAtPrefix(selectRuntimeEventPrefixFromStore(store), implementationSetRef);
}
export function rehydrateAdmittedImplementationSetAtPrefix(prefix, implementationSetRef) {
    const matches = indexedRuntimeEvents(prefix, "payload:implementationSetRef:" + implementationSetRef).filter((event) => event.kind === "implementation_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.implementationSetRef === implementationSetRef &&
        event.payload.implementationSet !== undefined &&
        isJsonRecord(event.payload.implementationSet));
    if (matches.length !== 1)
        return null;
    const event = matches[0];
    if (!isJsonRecord(event.payload) ||
        event.payload.implementationSet === undefined ||
        !isJsonRecord(event.payload.implementationSet)) {
        return null;
    }
    const set = deepFreeze({
        kind: "admitted_implementation_set",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        ...event.payload.implementationSet,
        admissionEventRef: event.eventId,
    });
    implementationSets.add(set);
    return hasAdmittedImplementationSetAtPrefix(prefix, set) ? set : null;
}
export function rehydrateAdmittedInteractionSet(store, interactionSetRef) {
    return rehydrateAdmittedInteractionSetAtPrefix(selectRuntimeEventPrefixFromStore(store), interactionSetRef);
}
export function rehydrateAdmittedInteractionSetAtPrefix(prefix, interactionSetRef) {
    const matches = indexedRuntimeEvents(prefix, "payload:interactionSetRef:" + interactionSetRef).filter((event) => event.kind === "implementation_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.interactionSetRef === interactionSetRef &&
        event.payload.interactionSet !== undefined &&
        isJsonRecord(event.payload.interactionSet));
    if (matches.length !== 1)
        return null;
    const event = matches[0];
    if (!isJsonRecord(event.payload) ||
        event.payload.interactionSet === undefined ||
        !isJsonRecord(event.payload.interactionSet)) {
        return null;
    }
    const set = deepFreeze({
        kind: "admitted_interaction_set",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        ...event.payload.interactionSet,
        admissionEventRef: event.eventId,
    });
    interactionSets.add(set);
    return hasAdmittedInteractionSetAtPrefix(prefix, set) ? set : null;
}
export function hasAdmittedImplementationResolution(store, resolution) {
    if (!isAdmittedImplementationResolution(resolution))
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, resolutionRef: _resolutionRef, resolutionDigest: _resolutionDigest, admissionEventRef: _admissionEventRef, ...body } = resolution;
    const event = runtimeEventAtPrefix(selectRuntimeEventPrefixFromStore(store), resolution.admissionEventRef);
    return (sha256Canonical(body) === resolution.resolutionDigest &&
        resolution.resolutionRef ===
            `implementation-resolution://abiogenesis/${resolution.resolutionDigest.slice("sha256:".length)}` &&
        event?.kind === "implementation_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.resolutionRef === resolution.resolutionRef &&
        event.payload.resolutionDigest === resolution.resolutionDigest &&
        event.payload.resolutionValidationRef === resolution.resolutionValidationRef);
}
export function hasAdmittedExecutionBasisAtPrefix(prefix, basis) {
    if (!isExecutionBasis(basis))
        return false;
    const projected = projectExactExecutionBasisAtPrefix(prefix, basis.basisRef);
    return projected !== null &&
        sha256Canonical(projected) ===
            sha256Canonical(basis);
}
export function rehydrateExecutionBasis(store, basisRef) {
    return rehydrateExecutionBasisAtPrefix(selectRuntimeEventPrefixFromStore(store), basisRef);
}
export function rehydrateExecutionBasisAtPrefix(prefix, basisRef) {
    const basis = projectExactExecutionBasisAtPrefix(prefix, basisRef);
    if (basis === null)
        return null;
    executionBases.add(basis);
    return basis;
}
export function admitInvocationRefusal(store, predecessorPrefix, invocationAdmission, stage, subjectDigest, contractOrDiagnosticRefs, basis) {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    const authorityPrefix = selectRuntimeEventPrefixFromStore(store);
    if (!hasAdmittedInvocationAtPrefix(authorityPrefix, invocationAdmission)) {
        throw new TypeError("invocation refusal requires one exact admitted InvocationAdmission");
    }
    if (contractOrDiagnosticRefs.length === 0) {
        throw new TypeError("invocation refusal requires at least one contract or diagnostic reference");
    }
    const body = {
        invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
        stage,
        subjectDigest,
        contractOrDiagnosticRefs,
    };
    const refusalDigest = sha256Canonical(body);
    const refusalRef = `invocation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => admitRuntimeEvent(store, {
        kind: "invocation_refused",
        eventTime: sampleNativeEventTime(),
        aggregateType: "workspace",
        aggregateId: invocationAdmission.workspaceBindingId,
        parentAggregateId: invocationAdmission.invocationRef,
        causationEventRefs: [
            invocationAdmission.admissionEventRef,
            ...basis.causationEventRefs,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: invocationAdmission.invocationAdmissionRef,
        payload: { refusalRef, refusalDigest, ...body },
    }));
    const admission = deepFreeze({
        kind: "invocation_refusal_admission",
        schemaVersion: "5.0.0",
        disposition: "refused",
        refusalRef,
        refusalDigest,
        ...body,
        admissionEventRef: committed.value.eventId,
    });
    return deepFreeze({
        kind: "invocation_refusal_admission_receipt",
        schemaVersion: "5.0.0",
        admission,
        successorPrefix: committed.successorPrefix,
    });
}
export function admitExecutionBasis(store, predecessorPrefix, input, basis) {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    const authorityPrefix = selectRuntimeEventPrefixFromStore(store);
    const reject = (subjectDigest, diagnosticRef) => admitInvocationRefusal(store, predecessorPrefix, input.invocationAdmission, "execution_basis", subjectDigest, [diagnosticRef], basis);
    if (!hasAdmittedInvocationAtPrefix(authorityPrefix, input.invocationAdmission)) {
        throw new TypeError("ExecutionBasis requires one exact admitted invocation");
    }
    const rawInputValue = detachJsonRecord(input.rawInputValue);
    if (rawInputValue === null ||
        canonicalRecordDigest(rawInputValue) !==
            input.invocationAdmission.rawInputDigest ||
        input.graph.admittedInputRef !==
            input.invocationAdmission.rawInputAdmissionRef ||
        input.graph.admittedInputDigest !==
            input.invocationAdmission.rawInputDigest ||
        input.graphValidation.admittedInputRef !==
            input.invocationAdmission.rawInputAdmissionRef ||
        input.graphValidation.admittedInputDigest !==
            input.invocationAdmission.rawInputDigest) {
        return reject(input.graph.materializationDigest, "diagnostic://abiogenesis/execution-basis/raw-input-mismatch@5");
    }
    if (input.invocationAdmission.programRef ===
        "program://abiogenesis/worksite/file-replace@5" &&
        !isWorksiteFileReplaceRequest(rawInputValue) ||
        input.invocationAdmission.programRef === WORKSITE_CONSTRUCTION_IDS.programRef &&
            !isWorksiteConstructionTask(rawInputValue) ||
        input.invocationAdmission.programRef ===
            WORKSITE_COMMAND_EXECUTION_IDS.programRef &&
            !isC2WorksiteCommandExecutionTask(rawInputValue) ||
        input.invocationAdmission.programRef ===
            WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef &&
            !isWorksiteBranchConstructionTask(rawInputValue)) {
        return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-input-contract-mismatch@5");
    }
    if (rawInputValue.kind === "worksite_revision_command_preparation_input" || rawInputValue.kind === "worksite_revision_command_execution_task") {
        return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/revision-child-source-required@5");
    }
    if ((rawInputValue.kind === "worksite_command_preparation_input" || rawInputValue.kind === "worksite_command_execution_task") &&
        Object.hasOwn(rawInputValue, "readDependencyBasis")) {
        return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/read-dependency-child-source-required@5");
    }
    if (isWorksiteFileReplaceRequest(rawInputValue)) {
        const admittedGrant = input.invocationAdmission.capabilityGrants[0];
        if (input.invocationAdmission.capabilityGrants.length !== 1 ||
            input.invocationAdmission.capabilityGrantRefs.length !== 1 ||
            admittedGrant === undefined ||
            input.invocationAdmission.capabilityGrantRefs[0] !==
                rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantRef !== rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantDigest !== rawInputValue.capabilityGrant.grantDigest ||
            sha256Canonical(admittedGrant) !==
                sha256Canonical(rawInputValue.capabilityGrant) ||
            rawInputValue.capabilityGrant.actorRef !==
                input.invocationAdmission.actorRef ||
            rawInputValue.workspaceBindingIdentity !==
                input.invocationAdmission.workspaceBindingId ||
            rawInputValue.workspaceBindingDigest !==
                input.invocationAdmission.workspaceBindingDigest ||
            input.invocationAdmission.programRef !==
                "program://abiogenesis/worksite/file-replace@5" ||
            input.invocationAdmission.graphFunctionRef !==
                "graph-function://abiogenesis/worksite/file-replace@5" ||
            input.invocationAdmission.inputContractRef !==
                "contract://abiogenesis/worksite/file-replace-input@5") {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-request-authority-mismatch@5");
        }
    }
    if (isWorksiteConstructionTask(rawInputValue)) {
        const admittedGrant = input.invocationAdmission.capabilityGrants[0];
        if (input.invocationAdmission.capabilityGrants.length !== 1 ||
            input.invocationAdmission.capabilityGrantRefs.length !== 1 ||
            admittedGrant === undefined ||
            input.invocationAdmission.capabilityGrantRefs[0] !==
                rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantRef !== rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantDigest !== rawInputValue.capabilityGrant.grantDigest ||
            sha256Canonical(admittedGrant) !==
                sha256Canonical(rawInputValue.capabilityGrant) ||
            rawInputValue.workspaceBinding.bindingId !==
                input.invocationAdmission.workspaceBindingId ||
            rawInputValue.workspaceBinding.bindingDigest !==
                input.invocationAdmission.workspaceBindingDigest ||
            rawInputValue.workspaceBinding.authorizedActorRef !==
                input.invocationAdmission.actorRef ||
            rawInputValue.capabilityGrant.actorRef !==
                input.invocationAdmission.actorRef ||
            input.invocationAdmission.programRef !==
                WORKSITE_CONSTRUCTION_IDS.programRef ||
            input.invocationAdmission.graphFunctionRef !==
                WORKSITE_CONSTRUCTION_IDS.graphFunctionRef ||
            input.invocationAdmission.inputContractRef !==
                WORKSITE_CONSTRUCTION_IDS.taskContractRef) {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-construction-task-authority-mismatch@5");
        }
    }
    if (isC2WorksiteCommandExecutionTask(rawInputValue)) {
        const admittedGrant = input.invocationAdmission.capabilityGrants[0];
        if (input.invocationAdmission.capabilityGrants.length !== 1 ||
            input.invocationAdmission.capabilityGrantRefs.length !== 1 ||
            admittedGrant === undefined ||
            input.invocationAdmission.capabilityGrantRefs[0] !==
                rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantRef !== rawInputValue.capabilityGrant.grantRef ||
            admittedGrant.grantDigest !== rawInputValue.capabilityGrant.grantDigest ||
            sha256Canonical(admittedGrant) !==
                sha256Canonical(rawInputValue.capabilityGrant) ||
            rawInputValue.workspaceBinding.bindingId !==
                input.invocationAdmission.workspaceBindingId ||
            rawInputValue.workspaceBinding.bindingDigest !==
                input.invocationAdmission.workspaceBindingDigest ||
            rawInputValue.workspaceBinding.authorizedActorRef !==
                input.invocationAdmission.actorRef ||
            rawInputValue.capabilityGrant.actorRef !==
                input.invocationAdmission.actorRef ||
            input.invocationAdmission.programRef !==
                WORKSITE_COMMAND_EXECUTION_IDS.programRef ||
            input.invocationAdmission.graphFunctionRef !==
                WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef ||
            input.invocationAdmission.inputContractRef !==
                WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef) {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-command-execution-task-authority-mismatch@5");
        }
    }
    if (isWorksiteBranchConstructionTask(rawInputValue)) {
        const admittedGrant = input.invocationAdmission.capabilityGrants[0];
        if (input.invocationAdmission.capabilityGrants.length !== 1 ||
            input.invocationAdmission.capabilityGrantRefs.length !== 1 ||
            admittedGrant === undefined ||
            input.invocationAdmission.capabilityGrantRefs[0] !==
                rawInputValue.capabilityGrant.grantRef ||
            !sameCanonical(admittedGrant, rawInputValue.capabilityGrant) ||
            rawInputValue.workspaceBinding.bindingId !==
                input.invocationAdmission.workspaceBindingId ||
            rawInputValue.workspaceBinding.bindingDigest !==
                input.invocationAdmission.workspaceBindingDigest ||
            rawInputValue.workspaceBinding.authorizedActorRef !==
                input.invocationAdmission.actorRef ||
            rawInputValue.capabilityGrant.actorRef !==
                input.invocationAdmission.actorRef ||
            input.invocationAdmission.programRef !==
                WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef ||
            input.invocationAdmission.graphFunctionRef !==
                WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef ||
            input.invocationAdmission.inputContractRef !==
                WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef) {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-branch-construction-task-authority-mismatch@5");
        }
    }
    if (!isGraphValidation(input.graphValidation) ||
        input.graphValidation.graphRef !== input.graph.materializationRef ||
        input.graphValidation.graphDigest !== input.graph.materializationDigest ||
        input.graphValidation.graphFunctionRef !==
            input.invocationAdmission.graphFunctionRef ||
        input.graphValidation.graphFunctionDigest !==
            input.invocationAdmission.graphFunctionDigest ||
        input.graph.graphFunctionRef !== input.invocationAdmission.graphFunctionRef ||
        input.graph.graphFunctionDigest !==
            input.invocationAdmission.graphFunctionDigest ||
        input.graphValidation.invocationAdmissionRef !== input.invocationAdmission.invocationAdmissionRef ||
        input.graphValidation.programValidationRef !== input.invocationAdmission.programValidationRef) {
        return reject(input.graph.materializationDigest, "diagnostic://abiogenesis/execution-basis/graph-mismatch@5");
    }
    const gtlEntryCoordinate = rootCTraversalCoordinate(input.graph.template.startNodeRef);
    if (sha256Canonical(input.invocationAdmission.gtlEntryCoordinate) !== sha256Canonical(gtlEntryCoordinate)) {
        return reject(input.graph.materializationDigest, "diagnostic://abiogenesis/execution-basis/hog-entry-mismatch@5");
    }
    if (!isProgramValidation(input.programValidation) ||
        input.programValidation.validationRef !== input.invocationAdmission.programValidationRef ||
        input.programValidation.programRef !== input.invocationAdmission.programRef ||
        !isProductExecutionResolution(input.executionResolution) ||
        input.executionResolution.resolutionRef !== input.invocationAdmission.productExecutionResolutionRef ||
        input.executionResolution.resolutionDigest !== input.invocationAdmission.productExecutionResolutionDigest ||
        input.executionResolution.programRef !== input.invocationAdmission.programRef ||
        input.executionResolution.graphFunctionRef !== input.invocationAdmission.graphFunctionRef ||
        input.executionResolution.catalogBasisDigest !== input.invocationAdmission.catalogBasisDigest ||
        input.executionResolution.catalogViewDigest !== input.invocationAdmission.catalogViewDigest ||
        input.executionResolution.programValidationRef !== input.programValidation.validationRef ||
        input.executionResolution.programValidationDigest !== input.programValidation.sourceDigest ||
        !isImplementationResolutionSetCandidate(input.resolutionSetCandidate) ||
        !isImplementationResolutionSetValidation(input.resolutionSetValidation) ||
        input.executionResolution.implementationSetCandidateRef !== input.resolutionSetCandidate.setCandidateRef ||
        input.executionResolution.implementationSetCandidateDigest !== input.resolutionSetCandidate.setCandidateDigest ||
        input.executionResolution.implementationSetValidationRef !== input.resolutionSetValidation.validationRef ||
        input.executionResolution.implementationSetValidationDigest !== input.resolutionSetValidation.validationDigest ||
        input.resolutionSetCandidate.programValidationRef !== input.programValidation.validationRef ||
        input.resolutionSetCandidate.publicationDigest !== input.programValidation.publicationDigest ||
        input.resolutionSetCandidate.catalogBasisDigest !== input.invocationAdmission.catalogBasisDigest ||
        input.resolutionSetCandidate.catalogViewDigest !== input.invocationAdmission.catalogViewDigest ||
        input.resolutionSetValidation.setCandidateRef !== input.resolutionSetCandidate.setCandidateRef ||
        input.resolutionSetValidation.setCandidateDigest !== input.resolutionSetCandidate.setCandidateDigest ||
        input.resolutionSetValidation.programValidationRef !== input.programValidation.validationRef) {
        return reject(input.resolutionSetCandidate.setCandidateDigest, "diagnostic://abiogenesis/execution-basis/resolution-set-mismatch@5");
    }
    // Whole-Program validation covers every start. Implementation resolution owns
    // the exact transitive declaration closure of this admitted selection.
    const selectedGraphFunctionRefs = new Set(input.executionResolution.declarationOwners
        .filter((owner) => owner.declarationKind === "graph_function")
        .map((owner) => owner.declarationRef));
    const selectedExecutableRows = input.programValidation.executableLeafRows.filter((row) => selectedGraphFunctionRefs.has(row.graphFunctionRef));
    const selectedInteractionRows = input.programValidation.interactionLeafRows.filter((row) => selectedGraphFunctionRefs.has(row.graphFunctionRef));
    const selectedExecutableLeafKeys = selectedExecutableRows.map((row) => row.requirementKey);
    const selectedInteractionLeafKeys = selectedInteractionRows.map((row) => row.requirementKey);
    if (sha256Canonical(input.resolutionSetCandidate.executableLeafKeys) !==
        sha256Canonical(selectedExecutableLeafKeys) ||
        sha256Canonical(input.resolutionSetValidation.executableLeafKeys) !==
            sha256Canonical(selectedExecutableLeafKeys) ||
        input.resolutionSetCandidate.rows.length !== selectedExecutableRows.length ||
        input.resolutionSetCandidate.rows.some((row, index) => row.requirementKey !== selectedExecutableRows[index].requirementKey ||
            row.graphFunctionRef !== selectedExecutableRows[index].graphFunctionRef ||
            row.graphFunctionDigest !== selectedExecutableRows[index].graphFunctionDigest) ||
        new Set([
            ...selectedExecutableLeafKeys,
            ...selectedInteractionLeafKeys,
        ]).size !==
            selectedExecutableLeafKeys.length + selectedInteractionLeafKeys.length) {
        return reject(input.resolutionSetCandidate.setCandidateDigest, "diagnostic://abiogenesis/execution-basis/resolution-set-mismatch@5");
    }
    const legacyCandidate = input.resolutionCandidate;
    const legacyValidation = input.resolutionValidation;
    if ((legacyCandidate === undefined) !== (legacyValidation === undefined)) {
        return reject(input.resolutionSetCandidate.setCandidateDigest, "diagnostic://abiogenesis/execution-basis/legacy-projection-incomplete@5");
    }
    if (legacyCandidate !== undefined &&
        legacyValidation !== undefined &&
        (!isImplementationResolutionCandidate(legacyCandidate) ||
            !isImplementationResolutionValidation(legacyValidation) ||
            legacyValidation.resolutionCandidateRef !== legacyCandidate.resolutionCandidateRef ||
            legacyValidation.resolutionCandidateDigest !== legacyCandidate.resolutionCandidateDigest ||
            legacyValidation.graphValidationRef !== input.graphValidation.validationRef ||
            legacyCandidate.graphValidationRef !== input.graphValidation.validationRef ||
            legacyCandidate.graphValidationDigest !== input.graphValidation.validationDigest ||
            legacyCandidate.graphFunctionRef !== input.invocationAdmission.graphFunctionRef ||
            legacyCandidate.catalogBasisDigest !== input.invocationAdmission.catalogBasisDigest ||
            legacyCandidate.inputContractRef !== input.invocationAdmission.inputContractRef ||
            legacyCandidate.outputContractRef !== input.invocationAdmission.outputContractRef ||
            input.resolutionSetCandidate.rows.filter((row) => row.graphFunctionRef === legacyCandidate.graphFunctionRef &&
                row.nodeRef === legacyCandidate.nodeRef &&
                row.implementationBindingRef === legacyCandidate.implementationBindingRef &&
                row.implementationDescriptorDigest === legacyCandidate.implementationDescriptorDigest).length !== 1)) {
        return reject(legacyCandidate.resolutionCandidateDigest, "diagnostic://abiogenesis/execution-basis/resolution-mismatch@5");
    }
    if (isWorksitePreparationInput(rawInputValue)) {
        const tasks = preparationConstructionTasks(rawInputValue);
        const grants = input.invocationAdmission.capabilityGrants;
        if (grants.length !== 1 || tasks.some((task) => !sameCanonical(task.capabilityGrant, grants[0]) ||
            task.capabilityGrant.definitionKey.memberKey !== (input.invocationAdmission.invocationVariant === "direct" ? "invoke" : input.invocationAdmission.invocationVariant) ||
            task.workspaceBinding.bindingId !== input.invocationAdmission.workspaceBindingId ||
            task.workspaceBinding.bindingDigest !== input.invocationAdmission.workspaceBindingDigest ||
            task.capabilityGrant.actorRef !== input.invocationAdmission.actorRef)) {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/preparation-root-grant-mismatch@5");
        }
    }
    const worksiteCarrier = worksiteAuthorityCarrier(rawInputValue);
    if (worksiteCarrier !== null) {
        const environment = exactWorksiteEnvironmentAtPrefix(predecessorPrefix, worksiteCarrier);
        if (environment === null ||
            !exactProgramOwnerInstall(environment, input.resolutionSetCandidate.rows, input.invocationAdmission.graphFunctionRef, input.program.moduleRef, input.program.programRef, input.programValidation.publicationDigest, input.invocationAdmission.programDigest, input.programPublication) ||
            !exactC2SourceEnvironment(predecessorPrefix, authorityPrefix, input.invocationAdmission, worksiteCommandTask(rawInputValue))) {
            return reject(input.invocationAdmission.rawInputDigest, "diagnostic://abiogenesis/execution-basis/worksite-environment-authority-mismatch@5");
        }
    }
    if (input.program.programRef !== input.invocationAdmission.programRef ||
        sha256Canonical(input.program) !== input.invocationAdmission.programDigest ||
        input.program.closureContractRef !== input.closureContract.closureContractRef ||
        input.closureContract.resultContractRef !== input.invocationAdmission.outputContractRef) {
        return reject(sha256Canonical(input.closureContract), "diagnostic://abiogenesis/execution-basis/closure-mismatch@5");
    }
    const implementationRows = input.resolutionSetCandidate.rows.map((row) => {
        const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, ...body } = row;
        return deepFreeze({
            kind: "admitted_implementation_resolution_row",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            ...body,
        });
    });
    const implementationSetBody = {
        invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
        invocationRef: input.invocationAdmission.invocationRef,
        resolutionSetCandidateRef: input.resolutionSetCandidate.setCandidateRef,
        resolutionSetCandidateDigest: input.resolutionSetCandidate.setCandidateDigest,
        resolutionSetValidationRef: input.resolutionSetValidation.validationRef,
        resolutionSetValidationDigest: input.resolutionSetValidation.validationDigest,
        catalogViewId: input.invocationAdmission.catalogViewId,
        catalogViewDigest: input.resolutionSetCandidate.catalogViewDigest,
        publicationDigest: input.resolutionSetCandidate.publicationDigest,
        programValidationRef: input.programValidation.validationRef,
        executableLeafKeys: selectedExecutableLeafKeys,
        rows: implementationRows,
    };
    const implementationSetDigest = sha256Canonical(implementationSetBody);
    const implementationSetRef = `implementation-set://abiogenesis/${implementationSetDigest.slice("sha256:".length)}`;
    const interactionRows = selectedInteractionRows.map((row) => {
        const { kind: _kind, ...body } = row;
        return deepFreeze({
            kind: "admitted_interaction_contract_row",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            ...body,
        });
    });
    const interactionSetBody = {
        invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
        invocationRef: input.invocationAdmission.invocationRef,
        programValidationRef: input.programValidation.validationRef,
        programValidationSourceDigest: input.programValidation.sourceDigest,
        interactionLeafKeys: selectedInteractionLeafKeys,
        rows: interactionRows,
    };
    const interactionSetDigest = sha256Canonical(interactionSetBody);
    const interactionSetRef = `interaction-set://abiogenesis/${interactionSetDigest.slice("sha256:".length)}`;
    const resolutionBody = legacyCandidate === undefined || legacyValidation === undefined
        ? null
        : {
            resolutionCandidateRef: legacyCandidate.resolutionCandidateRef,
            resolutionCandidateDigest: legacyCandidate.resolutionCandidateDigest,
            resolutionValidationRef: legacyValidation.validationRef,
            resolutionValidationDigest: legacyValidation.validationDigest,
            catalogViewId: input.invocationAdmission.catalogViewId,
            catalogViewDigest: legacyCandidate.catalogViewDigest,
            publicationDigest: legacyCandidate.publicationDigest,
            programValidationRef: legacyCandidate.programValidationRef,
            graphValidationRef: legacyCandidate.graphValidationRef,
            graphValidationDigest: legacyCandidate.graphValidationDigest,
            graphFunctionRef: legacyCandidate.graphFunctionRef,
            graphFunctionDigest: legacyCandidate.graphFunctionDigest,
            nodeRef: legacyCandidate.nodeRef,
            implementationBindingRef: legacyCandidate.implementationBindingRef,
            implementationRef: legacyCandidate.implementationRef,
            implementationBindingDigest: legacyCandidate.implementationBindingDigest,
            implementationDescriptorDigest: legacyCandidate.implementationDescriptorDigest,
            packageName: legacyCandidate.packageName,
            packageVersion: legacyCandidate.packageVersion,
            modulePath: legacyCandidate.modulePath,
            namedSymbol: legacyCandidate.namedSymbol,
            computeRegime: legacyCandidate.computeRegime,
            inputContractRef: legacyCandidate.inputContractRef,
            outputContractRef: legacyCandidate.outputContractRef,
            failureContractRef: legacyCandidate.failureContractRef,
            refusalContractRef: legacyCandidate.refusalContractRef,
        };
    const resolutionDigest = resolutionBody === null
        ? null
        : sha256Canonical(resolutionBody);
    const resolutionRef = resolutionDigest === null
        ? null
        : `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`;
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
        const setEvent = admitRuntimeEvent(store, {
            kind: "implementation_admitted",
            eventTime: sampleNativeEventTime(),
            aggregateType: "workspace",
            aggregateId: input.invocationAdmission.workspaceBindingId,
            parentAggregateId: input.invocationAdmission.invocationRef,
            causationEventRefs: [input.invocationAdmission.admissionEventRef, ...basis.causationEventRefs],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "workspace",
            basisId: input.invocationAdmission.invocationAdmissionRef,
            payload: {
                implementationSetRef,
                implementationSetDigest,
                interactionSetRef,
                interactionSetDigest,
                implementationSet: {
                    implementationSetRef,
                    implementationSetDigest,
                    ...implementationSetBody,
                },
                interactionSet: {
                    interactionSetRef,
                    interactionSetDigest,
                    ...interactionSetBody,
                },
                ...(resolutionBody === null ? {} : { resolutionRef, resolutionDigest, ...resolutionBody }),
            },
        });
        const implementationSet = deepFreeze({
            kind: "admitted_implementation_set",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            implementationSetRef,
            implementationSetDigest,
            ...implementationSetBody,
            admissionEventRef: setEvent.eventId,
        });
        const interactionSet = deepFreeze({
            kind: "admitted_interaction_set",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            interactionSetRef,
            interactionSetDigest,
            ...interactionSetBody,
            admissionEventRef: setEvent.eventId,
        });
        const implementationResolution = resolutionBody === null || resolutionRef === null || resolutionDigest === null
            ? null
            : deepFreeze({
                kind: "admitted_implementation_resolution",
                schemaVersion: "5.0.0",
                disposition: "admitted",
                resolutionRef,
                resolutionDigest,
                ...resolutionBody,
                admissionEventRef: setEvent.eventId,
            });
        const closureContractDigest = sha256Canonical(input.closureContract);
        const localImplementationSubsetDigest = sha256Canonical({
            rootImplementationSetRef: implementationSet.implementationSetRef,
            rootImplementationSetDigest: implementationSet.implementationSetDigest,
            executableLeafKeys: implementationSet.executableLeafKeys,
            rows: implementationSet.rows,
        });
        const localInteractionSubsetDigest = sha256Canonical({
            rootInteractionSetRef: interactionSet.interactionSetRef,
            rootInteractionSetDigest: interactionSet.interactionSetDigest,
            interactionLeafKeys: interactionSet.interactionLeafKeys,
            rows: interactionSet.rows,
        });
        const executionBody = {
            ...(input.executionResolution.registeredSelectionDefinitionDigests === undefined ? {} : { registeredSelectionDefinitionDigests: input.executionResolution.registeredSelectionDefinitionDigests }),
            basisClass: "root",
            invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
            invocationRef: input.invocationAdmission.invocationRef,
            invocationDigest: input.invocationAdmission.invocationDigest,
            rawInputAdmissionRef: input.invocationAdmission.rawInputAdmissionRef,
            rawInputDigest: input.invocationAdmission.rawInputDigest,
            rawInputValue,
            workspaceBindingId: input.invocationAdmission.workspaceBindingId,
            workspaceBindingDigest: input.invocationAdmission.workspaceBindingDigest,
            catalogBasisRef: input.invocationAdmission.catalogBasisRef,
            catalogBasisDigest: input.invocationAdmission.catalogBasisDigest,
            catalogViewId: input.invocationAdmission.catalogViewId,
            catalogViewDigest: input.invocationAdmission.catalogViewDigest,
            actionCatalogRef: input.program.actionCatalog?.catalogRef ?? null,
            actionCatalogDigest: input.program.actionCatalog?.catalogDigest ?? null,
            actionCatalogRows: input.program.actionCatalog?.rows ?? [],
            constructionCompositionRef: input.program.constructionComposition?.compositionRef ?? null,
            constructionCompositionDigest: input.program.constructionComposition?.compositionDigest ?? null,
            constructionComposition: input.program.constructionComposition ?? null,
            programRef: input.invocationAdmission.programRef,
            programDigest: input.invocationAdmission.programDigest,
            graphFunctionRef: input.invocationAdmission.graphFunctionRef,
            graphFunctionDigest: input.invocationAdmission.graphFunctionDigest,
            actorRef: input.invocationAdmission.actorRef,
            parentExecutionBasisRef: null,
            parentTraversalScopeRef: null,
            parentCCallRef: null,
            entryRef: input.invocationAdmission.publicStart === null
                ? gtlEntryCoordinate.nodeRef
                : input.invocationAdmission.publicStart.startRef,
            programValidationRef: input.invocationAdmission.programValidationRef,
            graphValidationRef: input.graphValidation.validationRef,
            graphRef: input.graph.materializationRef,
            graphDigest: input.graph.materializationDigest,
            implementationSetRef: implementationSet.implementationSetRef,
            implementationSetDigest: implementationSet.implementationSetDigest,
            interactionSetRef: interactionSet.interactionSetRef,
            interactionSetDigest: interactionSet.interactionSetDigest,
            rootImplementationSetRef: implementationSet.implementationSetRef,
            rootImplementationSetDigest: implementationSet.implementationSetDigest,
            rootInteractionSetRef: interactionSet.interactionSetRef,
            rootInteractionSetDigest: interactionSet.interactionSetDigest,
            localExecutableLeafKeys: implementationSet.executableLeafKeys,
            localImplementationSubsetDigest,
            localInteractionLeafKeys: interactionSet.interactionLeafKeys,
            localInteractionSubsetDigest,
            implementationResolutionRef: implementationResolution?.resolutionRef ?? null,
            closureContractRef: input.closureContract.closureContractRef,
            closureContractDigest,
            terminalPredicateRef: input.closureContract.predicateRef,
            evidenceContractRef: input.closureContract.evidenceContractRef,
            resultContractRef: input.closureContract.resultContractRef,
            refusalContractRef: input.closureContract.refusalContractRef,
            refusalValueKind: input.closureContract.refusalValueKind,
            judgmentContractRef: input.closureContract.judgmentContractRef,
            rejectionContractRef: input.closureContract.rejectionContractRef,
            transitionContractRef: input.closureContract.transitionContractRef,
            replayProjectionRef: input.closureContract.replayProjectionRef,
            terminalKind: input.closureContract.terminalKind,
        };
        const basisDigest = sha256Canonical(executionBody);
        const basisRef = `execution-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`;
        const basisEvent = admitRuntimeEvent(store, {
            kind: "basis_admitted",
            eventTime: sampleNativeEventTime(),
            aggregateType: "workspace",
            aggregateId: input.invocationAdmission.workspaceBindingId,
            parentAggregateId: input.invocationAdmission.invocationRef,
            causationEventRefs: [setEvent.eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "workspace",
            basisId: basisRef,
            payload: {
                basisRef,
                basisDigest,
                ...executionBody,
            },
        });
        const executionBasis = deepFreeze({
            kind: "execution_basis",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            basisRef,
            basisDigest,
            ...executionBody,
            admissionEventRef: basisEvent.eventId,
        });
        return deepFreeze({
            kind: "execution_basis_admission",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            implementationSet,
            interactionSet,
            implementationResolution,
            executionBasis,
        });
    });
    const admission = deepFreeze({
        ...committed.value,
        successorPrefix: committed.successorPrefix,
    });
    implementationSets.add(admission.implementationSet);
    interactionSets.add(admission.interactionSet);
    if (admission.implementationResolution !== null) {
        implementationResolutions.add(admission.implementationResolution);
    }
    executionBases.add(admission.executionBasis);
    return admission;
}
function childRefusal(code, message) {
    return {
        kind: "child_execution_basis_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function sameOrderedValues(left, right) {
    return left.join("\0") === right.join("\0");
}
export function admitChildExecutionBasis(store, predecessorPrefix, input, basis) {
    return admitChildExecutionBasisUsing(() => { assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix); return selectRuntimeEventPrefixFromStore(store); }, store, predecessorPrefix, input, basis);
}
/** One workflow preparation owns the first raw acquisition and its intent.
 * Only the native owner's exact immutable lookup pair permits pure staging. */
export function prepareWorkflowChildExecutionBasis(store, predecessorPrefix, cursor, lookups) {
    const prefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(predecessorPrefix);
    const intent = rehydrateConstructionIntentForCursorAtPrefix(prefix, cursor);
    const proxyLookups = types.isProxy(lookups);
    const graphLookup = proxyLookups ? undefined : Object.getOwnPropertyDescriptor(lookups, "graphFunctionByRef");
    const closureLookup = proxyLookups ? undefined : Object.getOwnPropertyDescriptor(lookups, "closureContractByRef");
    const fixedLookups = !proxyLookups && Object.isFrozen(lookups) &&
        graphLookup !== undefined && "value" in graphLookup &&
        closureLookup !== undefined && "value" in closureLookup &&
        hasOwnedDeclarationLookups(graphLookup.value, closureLookup.value);
    return Object.freeze({ intent, admit(input, basis) {
            if (!fixedLookups) {
                return admitChildExecutionBasis(store, predecessorPrefix, input, basis);
            }
            let result;
            try {
                result = admitChildExecutionBasisUsing(() => { assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix); return selectRuntimeEventPrefixFromStore(store); }, store, predecessorPrefix, input, basis);
            }
            catch (error) {
                // Preserve the first cause while still authenticating an error return.
                try {
                    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
                }
                catch { }
                throw error;
            }
            if (result.kind !== "child_execution_basis_admission") {
                try {
                    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
                }
                catch {
                    return childRefusal("parent_basis_mismatch", "child traversal requires one exact current workflow or deferred-application parent");
                }
            }
            return result;
        } });
}
function admitChildExecutionBasisUsing(readCurrent, store, predecessorPrefix, input, basis) {
    const rawInputValue = detachJsonRecord(input.rawInputValue);
    const current = (() => {
        try {
            const authorityPrefix = readCurrent();
            const expectedStorePrefixDigest = runtimeEventPrefixDigest(authorityPrefix);
            if (store.digest() !== expectedStorePrefixDigest)
                return null;
            const runPrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, { runId: input.parentTraversalScope.runId });
            const parent = rehydrateExecutionBasisAtPrefix(authorityPrefix, input.parentExecutionBasis.basisRef);
            const parentScope = rehydrateOpenedTraversalScopeAtPrefix(runPrefix, input.parentTraversalScope);
            const rootImplementationSet = rehydrateAdmittedImplementationSetAtPrefix(authorityPrefix, input.rootImplementationSet.implementationSetRef);
            const rootInteractionSet = rehydrateAdmittedInteractionSetAtPrefix(authorityPrefix, input.rootInteractionSet.interactionSetRef);
            if (parent === null ||
                parentScope === null ||
                rootImplementationSet === null ||
                rootInteractionSet === null ||
                sha256Canonical(parent) !==
                    sha256Canonical(input.parentExecutionBasis) ||
                sha256Canonical(parentScope) !==
                    sha256Canonical(input.parentTraversalScope) ||
                sha256Canonical(rootImplementationSet) !==
                    sha256Canonical(input.rootImplementationSet) ||
                sha256Canonical(rootInteractionSet) !==
                    sha256Canonical(input.rootInteractionSet))
                return null;
            const parentCCall = projectCurrentChildParentCCallAtPrefix(runPrefix, {
                parentCCallRef: input.parentCCallRef,
                parentExecutionBasisRef: parent.basisRef,
                runId: parentScope.runId,
                graphCallId: parentScope.graphCallId,
                frameId: parentScope.frameId,
                childGraphFunctionRef: input.graphFunction.name,
                admittedInputRef: input.admittedInputRef,
                admittedInputDigest: input.admittedInputDigest,
            });
            return parentCCall === null ? null : {
                expectedStorePrefixDigest,
                authorityPrefix,
                runPrefix,
                parent,
                parentScope,
                rootImplementationSet,
                rootInteractionSet,
                parentCCall,
            };
        }
        catch {
            return null;
        }
    })();
    if (current === null) {
        return childRefusal("parent_basis_mismatch", "child traversal requires one exact current workflow or deferred-application parent");
    }
    const { authorityPrefix, parent, parentScope, rootImplementationSet, rootInteractionSet, } = current;
    if (parentScope.executionBasisRef !== parent.basisRef ||
        parentScope.scopeRef.length === 0 ||
        parentScope.runId.length === 0 ||
        rootImplementationSet.implementationSetRef !== parent.rootImplementationSetRef ||
        rootImplementationSet.implementationSetDigest !== parent.rootImplementationSetDigest ||
        rootInteractionSet.interactionSetRef !== parent.rootInteractionSetRef ||
        rootInteractionSet.interactionSetDigest !== parent.rootInteractionSetDigest) {
        return childRefusal("parent_basis_mismatch", "child traversal requires the exact admitted parent scope and root sets");
    }
    const graphFunctionDigest = sha256Canonical(input.graphFunction);
    if (!isProgramValidation(input.programValidation) ||
        input.programValidation.validationRef !== parent.programValidationRef ||
        input.program.programRef !== parent.programRef ||
        sha256Canonical(input.program) !== parent.programDigest ||
        !input.program.callableMembership.includes(input.graphFunction.name)) {
        return childRefusal("child_membership_mismatch", "child GraphFunction is not a member of the exact admitted Program root");
    }
    if (!isGraphValidation(input.graphValidation) ||
        input.graphValidation.graphRef !== input.graph.materializationRef ||
        input.graphValidation.graphDigest !== input.graph.materializationDigest ||
        input.graphValidation.graphFunctionRef !== input.graphFunction.name ||
        input.graphValidation.graphFunctionDigest !== graphFunctionDigest ||
        input.graphValidation.programValidationRef !== input.programValidation.validationRef ||
        input.graph.graphFunctionRef !== input.graphFunction.name ||
        input.graph.graphFunctionDigest !== graphFunctionDigest) {
        return childRefusal("child_graph_mismatch", "child Graph and validation do not preserve the declared GraphFunction");
    }
    if (input.admittedInputRef.length === 0 ||
        rawInputValue === null ||
        canonicalRecordDigest(rawInputValue) !==
            input.admittedInputDigest ||
        input.graph.admittedInputRef !== input.admittedInputRef ||
        input.graph.admittedInputDigest !== input.admittedInputDigest ||
        input.graphValidation.admittedInputRef !== input.admittedInputRef ||
        input.graphValidation.admittedInputDigest !== input.admittedInputDigest ||
        input.graph.invocationAdmissionRef !== parent.invocationAdmissionRef ||
        input.graphValidation.invocationAdmissionRef !== parent.invocationAdmissionRef) {
        return childRefusal("child_input_mismatch", "child materialization requires the exact admitted parent output binding");
    }
    if (input.graphFunction.declarations["abg.semantic_revision_history"] === SEMANTIC_REVISION_IDS.historicalOwnerDependencyRef) {
        const currentEnvironment = projectExactPrefixWorkspaceEnvironment(predecessorPrefix, { ref: parent.workspaceBindingId, digest: parent.workspaceBindingDigest });
        if (currentEnvironment.kind !== "exact_prefix_workspace_environment" ||
            worksiteRevisionEntryBindingDisposition(authorityPrefix, input.graphFunction, rawInputValue, currentEnvironment.workspaceBinding, input) === "basis_fork_detected") {
            return childRefusal("basis_fork_detected", "selected D2 child lacks exact native binding correspondence");
        }
    }
    if ((input.graphFunction.name === forwardIds.childGraphFunctionRef || isWorksiteCommandForwardTask(rawInputValue)) &&
        !worksiteCommandForwardChildSourceAtPrefix(authorityPrefix, predecessorPrefix, parent.basisRef, input.parentCCallRef, rawInputValue)) {
        return childRefusal("basis_fork_detected", "forward child requires the actual admitted preparation producer and retained vector");
    }
    const worksiteCarrier = rawInputValue === null
        ? null
        : worksiteAuthorityCarrier(rawInputValue);
    let worksiteOwnerInstall = null;
    let childWorksiteEnvironment = null;
    const worksiteProgram = parent.programRef === WORKSITE_CONSTRUCTION_IDS.programRef ||
        parent.programRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef ||
        parent.programRef === WORKSITE_COMMAND_EXECUTION_IDS.programRef;
    if (worksiteCarrier !== null || worksiteProgram) {
        const projectedEnvironment = projectExactPrefixWorkspaceEnvironment(predecessorPrefix, {
            ref: parent.workspaceBindingId,
            digest: parent.workspaceBindingDigest,
        });
        const carrierEnvironment = worksiteCarrier === null
            ? null
            : exactWorksiteEnvironmentAtPrefix(predecessorPrefix, worksiteCarrier);
        if (projectedEnvironment.kind !== "exact_prefix_workspace_environment" ||
            (worksiteCarrier !== null && carrierEnvironment === null) ||
            (worksiteCarrier !== null && (worksiteCarrier.workspaceBindingId !== parent.workspaceBindingId ||
                worksiteCarrier.workspaceBindingDigest !== parent.workspaceBindingDigest))) {
            return childRefusal("child_input_mismatch", "child worksite input differs from the exact-prefix authority or workspace");
        }
        const worksiteEnvironment = carrierEnvironment ?? projectedEnvironment;
        childWorksiteEnvironment = worksiteEnvironment;
        const rootInvocation = rehydrateInvocationAdmissionAtPrefix(authorityPrefix, rootImplementationSet.invocationAdmissionRef);
        const programValidationDigest = sha256Canonical(input.programValidation);
        if (rootInvocation === null ||
            rootInvocation.invocationAdmissionRef !==
                rootImplementationSet.invocationAdmissionRef ||
            rootInvocation.invocationRef !== rootImplementationSet.invocationRef ||
            rootInvocation.invocationAdmissionRef !== parent.invocationAdmissionRef ||
            rootInvocation.invocationRef !== parent.invocationRef ||
            rootInvocation.invocationDigest !== parent.invocationDigest ||
            rootInvocation.workspaceId !== worksiteEnvironment.workspaceBinding.workspaceId ||
            rootInvocation.workspaceBindingId !== parent.workspaceBindingId ||
            rootInvocation.workspaceBindingDigest !== parent.workspaceBindingDigest ||
            rootInvocation.catalogBasisRef !== parent.catalogBasisRef ||
            rootInvocation.catalogBasisDigest !== parent.catalogBasisDigest ||
            rootInvocation.catalogViewId !== parent.catalogViewId ||
            rootInvocation.catalogViewDigest !== parent.catalogViewDigest ||
            rootInvocation.programRef !== parent.programRef ||
            rootInvocation.programDigest !== parent.programDigest ||
            rootInvocation.actorRef !== parent.actorRef ||
            rootInvocation.programValidationRef !==
                input.programValidation.validationRef ||
            rootInvocation.programValidationDigest !== programValidationDigest ||
            rootImplementationSet.programValidationRef !==
                input.programValidation.validationRef ||
            rootImplementationSet.publicationDigest !==
                input.programValidation.publicationDigest ||
            rootImplementationSet.catalogViewId !== rootInvocation.catalogViewId ||
            rootImplementationSet.catalogViewDigest !==
                rootInvocation.catalogViewDigest) {
            return childRefusal("child_subset_mismatch", "child owner derivation requires the exact root invocation, Program validation, and implementation set");
        }
        worksiteOwnerInstall = exactProgramOwnerInstall(worksiteEnvironment, rootImplementationSet.rows, rootInvocation.graphFunctionRef, input.program.moduleRef, input.program.programRef, input.programValidation.publicationDigest, rootInvocation.programDigest, input.programPublication);
        if (worksiteOwnerInstall === null) {
            return childRefusal("child_subset_mismatch", "child owner derivation requires one exact installed root Program owner");
        }
    }
    if (rawInputValue.kind === "worksite_revision_command_preparation_input" &&
        !revisionPreparationHasNativeBridgeSourceAtPrefix(authorityPrefix, { parentBasis: parent,
            parentCCallRef: current.parentCCall.cCallRef, entry: rawInputValue })) {
        return childRefusal("child_input_mismatch", "revision preparation requires its actual admitted D2 bridge edge");
    }
    if (rawInputValue.kind === "worksite_command_preparation_input" && Object.hasOwn(rawInputValue, "readDependencyBasis") &&
        !readDependencyPreparationHasNativeBridgeSourceAtPrefix(authorityPrefix, { parentBasis: parent,
            parentCCallRef: current.parentCCall.cCallRef, entry: rawInputValue })) {
        return childRefusal("child_input_mismatch", "initial read dependencies require the actual admitted same-job bridge edge");
    }
    const commandTask = worksiteCommandTask(rawInputValue);
    if (commandTask !== null && (input.graphFunction.name !== (commandTask.kind === "worksite_command_execution_task" ? WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef : WORKSITE_REVISION_IDS.graphFunctionRef) ||
        (isObservedWorksiteCommandExecutionTask(commandTask)
            ? projectObservedWorksiteCommandChildAtPrefix(authorityPrefix, { parentBasis: parent, parentCCallRef: current.parentCCall.cCallRef, runId: parentScope.runId, task: commandTask })
            : deriveSameRunWorksiteCommandSourceBasisAtPrefix(authorityPrefix, {
                parentBasis: parent, parentCCallRef: current.parentCCall.cCallRef,
                runId: parentScope.runId, task: commandTask,
            }, predecessorPrefix)) === null)) {
        return childRefusal("child_input_mismatch", "C2 child requires the exact completed source and admitted preparation route in this Run");
    }
    if (input.graphFunction.declarations["abg.child_closure_contract"] !==
        input.closureContract.closureContractRef ||
        input.closureContract.closureScope !== "graph_call" ||
        input.closureContract.resultContractRef !== input.graphFunction.outputs[0]) {
        return childRefusal("child_membership_mismatch", "child entry or closure contract is absent from admitted GTL");
    }
    const localExecutableRows = input.programValidation.executableLeafRows
        .filter((row) => row.graphFunctionRef === input.graphFunction.name)
        .sort((left, right) => compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
    const localExecutableLeafKeys = localExecutableRows
        .map((row) => row.requirementKey)
        .sort(compareUnicodeCodeUnits);
    const admittedExecutableRows = rootImplementationSet.rows
        .filter((row) => row.graphFunctionRef === input.graphFunction.name)
        .sort((left, right) => compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
    const admittedExecutableKeys = admittedExecutableRows.map((row) => row.requirementKey);
    const localInteractionRows = input.programValidation.interactionLeafRows
        .filter((row) => row.graphFunctionRef === input.graphFunction.name);
    const localInteractionLeafKeys = localInteractionRows
        .map((row) => row.requirementKey)
        .sort(compareUnicodeCodeUnits);
    const admittedInteractionRows = rootInteractionSet.rows
        .filter((row) => row.graphFunctionRef === input.graphFunction.name)
        .sort((left, right) => compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
    const admittedInteractionKeys = admittedInteractionRows.map((row) => row.requirementKey);
    if (!sameOrderedValues(localExecutableLeafKeys, admittedExecutableKeys) ||
        !sameOrderedValues(localInteractionLeafKeys, admittedInteractionKeys)) {
        return childRefusal("child_subset_mismatch", "child executable and interaction rows must equal exact subsets of the admitted root sets");
    }
    if (worksiteOwnerInstall !== null && !exactChildOwnerInstallations(worksiteOwnerInstall, childWorksiteEnvironment, localExecutableRows, admittedExecutableRows, input.graphFunction.name, graphFunctionDigest, input.program.moduleRef, input.program.programRef, input.programValidation.validationRef, input.programValidation.graphFunctionDigests, input.programValidation.publicationDigest)) {
        return childRefusal("child_subset_mismatch", "child GraphFunction and local implementation rows require exact installed publication owners");
    }
    const localImplementationSubsetDigest = sha256Canonical({
        rootImplementationSetRef: rootImplementationSet.implementationSetRef,
        rootImplementationSetDigest: rootImplementationSet.implementationSetDigest,
        executableLeafKeys: localExecutableLeafKeys,
        rows: admittedExecutableRows,
    });
    const localInteractionSubsetDigest = sha256Canonical({
        rootInteractionSetRef: rootInteractionSet.interactionSetRef,
        rootInteractionSetDigest: rootInteractionSet.interactionSetDigest,
        interactionLeafKeys: localInteractionLeafKeys,
        rows: admittedInteractionRows,
    });
    const closureContractDigest = sha256Canonical(input.closureContract);
    const entryDigest = sha256Canonical({
        parentTraversalScopeRef: parentScope.scopeRef,
        parentCCallRef: current.parentCCall.cCallRef,
        graphFunctionRef: input.graphFunction.name,
        graphRef: input.graph.materializationRef,
        admittedInputRef: input.admittedInputRef,
        admittedInputDigest: input.admittedInputDigest,
    });
    const entryRef = `child-entry://abiogenesis/${entryDigest.slice("sha256:".length)}`;
    const executionBody = {
        basisClass: "child",
        invocationAdmissionRef: parent.invocationAdmissionRef,
        invocationRef: parent.invocationRef,
        invocationDigest: parent.invocationDigest,
        rawInputAdmissionRef: input.admittedInputRef,
        rawInputDigest: input.admittedInputDigest,
        rawInputValue,
        workspaceBindingId: parent.workspaceBindingId,
        workspaceBindingDigest: parent.workspaceBindingDigest,
        catalogBasisRef: parent.catalogBasisRef,
        catalogBasisDigest: parent.catalogBasisDigest,
        catalogViewId: parent.catalogViewId,
        catalogViewDigest: parent.catalogViewDigest,
        ...(parent.registeredSelectionDefinitionDigests === undefined ? {} : { registeredSelectionDefinitionDigests: parent.registeredSelectionDefinitionDigests }),
        actionCatalogRef: parent.actionCatalogRef,
        actionCatalogDigest: parent.actionCatalogDigest,
        actionCatalogRows: parent.actionCatalogRows,
        constructionCompositionRef: parent.constructionCompositionRef,
        constructionCompositionDigest: parent.constructionCompositionDigest,
        constructionComposition: parent.constructionComposition,
        programRef: parent.programRef,
        programDigest: parent.programDigest,
        graphFunctionRef: input.graphFunction.name,
        graphFunctionDigest,
        actorRef: parent.actorRef,
        parentExecutionBasisRef: parent.basisRef,
        parentTraversalScopeRef: parentScope.scopeRef,
        parentCCallRef: current.parentCCall.cCallRef,
        entryRef,
        programValidationRef: input.programValidation.validationRef,
        graphValidationRef: input.graphValidation.validationRef,
        graphRef: input.graph.materializationRef,
        graphDigest: input.graph.materializationDigest,
        implementationSetRef: rootImplementationSet.implementationSetRef,
        implementationSetDigest: rootImplementationSet.implementationSetDigest,
        interactionSetRef: rootInteractionSet.interactionSetRef,
        interactionSetDigest: rootInteractionSet.interactionSetDigest,
        rootImplementationSetRef: rootImplementationSet.implementationSetRef,
        rootImplementationSetDigest: rootImplementationSet.implementationSetDigest,
        rootInteractionSetRef: rootInteractionSet.interactionSetRef,
        rootInteractionSetDigest: rootInteractionSet.interactionSetDigest,
        localExecutableLeafKeys,
        localImplementationSubsetDigest,
        localInteractionLeafKeys,
        localInteractionSubsetDigest,
        implementationResolutionRef: null,
        closureContractRef: input.closureContract.closureContractRef,
        closureContractDigest,
        terminalPredicateRef: input.closureContract.predicateRef,
        evidenceContractRef: input.closureContract.evidenceContractRef,
        resultContractRef: input.closureContract.resultContractRef,
        refusalContractRef: input.closureContract.refusalContractRef,
        refusalValueKind: input.closureContract.refusalValueKind,
        judgmentContractRef: input.closureContract.judgmentContractRef,
        rejectionContractRef: input.closureContract.rejectionContractRef,
        transitionContractRef: input.closureContract.transitionContractRef,
        replayProjectionRef: input.closureContract.replayProjectionRef,
        terminalKind: input.closureContract.terminalKind,
    };
    const basisDigest = sha256Canonical(executionBody);
    const basisRef = `execution-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`;
    if (rehydrateExecutionBasisAtPrefix(current.authorityPrefix, basisRef) !== null) {
        return childRefusal("child_basis_already_admitted", "one deterministic child entry cannot admit a second ExecutionBasis");
    }
    const factories = [() => ({
            kind: "basis_admitted",
            eventTime: sampleNativeEventTime(),
            aggregateType: "frame",
            aggregateId: parentScope.frameId,
            parentAggregateId: parentScope.graphCallId,
            causationEventRefs: [
                current.parentCCall.causationEventRef,
                parentScope.frameOpenEventRef,
                ...basis.causationEventRefs,
            ],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "run",
            basisId: basisRef,
            runId: parentScope.runId,
            graphFunctionRef: input.graphFunction.name,
            materializationRef: input.graph.materializationRef,
            graphCallId: parentScope.graphCallId,
            frameId: parentScope.frameId,
            frameLineageId: parentScope.frameLineageId,
            payload: {
                basisRef,
                basisDigest,
                ...executionBody,
            },
        })];
    // A normal child admission returns the coordinate already authenticated by
    // its one durable publication. Preserve the existing staged nested path:
    // its caller still owns the outer transaction and the current durable cut.
    const committed = isRuntimeEventTransactionActive(store)
        ? {
            value: compareAndAppendExpectedPrefix(store, current.expectedStorePrefixDigest, factories)[0],
            successorPrefix: selectHeldEventStoreDurablePrefix(store),
        }
        : admitRuntimeEventTransactionAtExpectedPrefix(store, current.expectedStorePrefixDigest, () => admitRuntimeEventBatch(store, factories)[0]);
    if (committed.successorPrefix === null) {
        throw new TypeError("child basis admission requires its durable successor");
    }
    const executionBasis = deepFreeze({
        kind: "execution_basis",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        basisRef,
        basisDigest,
        ...executionBody,
        admissionEventRef: committed.value.eventId,
    });
    executionBases.add(executionBasis);
    return deepFreeze({
        kind: "child_execution_basis_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        executionBasis,
        successorPrefix: committed.successorPrefix,
    });
}
/** A new Run-local basis uses the same admitted invocation/work authority.
 * The continuation owner supplies the separately admitted operation and exact
 * pending-source relation; no invocation or ConstructionIntent is reminted. */
import { isPreparedConstructionContinuationOperation } from "./construction_continuation.js";
export function admitConstructionContinuationExecutionBasis(store, predecessorPrefix, plan, basis) {
    const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(predecessorPrefix));
    if (!isPreparedConstructionContinuationOperation(plan) || runtimeEventPrefixDigest(prefix) !== plan.predecessorDigest ||
        !hasAdmittedExecutionBasisAtPrefix(prefix, plan.prepared.root))
        throw new TypeError("continued basis requires its exact prepared operation and durable predecessor");
    const source = plan.prepared.root;
    const selected = plan.prepared.continuation;
    const admitted = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
        const operation = admitRuntimeEvent(store, plan.candidate);
        const use = {
            continuationRef: selected.continuationRef, continuationDigest: selected.continuationDigest,
            sourceRunId: selected.runId, sourceExecutionBasisRef: source.basisRef,
            pendingExecutionBasisRef: selected.executionBasisRef, pendingCursorRef: selected.heldCursorRef,
            pendingCursorDigest: selected.heldCursorDigest, constructionIntentRef: selected.constructionIntentRef,
            constructionIntentDigest: selected.constructionIntentDigest, operationAdmissionEventRef: operation.eventId,
        };
        const { kind: _kind, schemaVersion: _version, disposition: _disposition, basisRef: _ref, basisDigest: _digest, admissionEventRef: _event, ...sourceBody } = source;
        const body = { ...sourceBody, constructionContinuationUse: use };
        const basisDigest = sha256Canonical(body);
        const basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
        const event = admitRuntimeEvent(store, {
            kind: "basis_admitted", eventTime: basis.eventTime, aggregateType: "workspace", aggregateId: source.workspaceBindingId,
            parentAggregateId: source.invocationRef, causationEventRefs: [operation.eventId, source.admissionEventRef],
            correlationId: basis.correlationId, workflowVersion: "5.0.0", scopeClass: "workspace", basisId: basisRef,
            payload: { basisRef, basisDigest, ...body },
        });
        const executionBasis = deepFreeze({ kind: "execution_basis", schemaVersion: "5.0.0",
            disposition: "admitted", basisRef, basisDigest, ...body, admissionEventRef: event.eventId });
        return { executionBasis, operation };
    });
    executionBases.add(admitted.value.executionBasis);
    return Object.freeze({ ...admitted.value, successorPrefix: admitted.successorPrefix });
}
