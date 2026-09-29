import { admittedNativeTask } from "./native_worksite_execution.js";
import { projectSameRunNativeWorkCommandSourceAtPrefix } from "./native_worksite_execution.js";
import { isRecord } from "../shared/admission_predicates.js";
import { retainedGovernanceWorkInput, isGovernanceWorkState, isFramedSynthesisResult, governanceRef, governanceContract } from "../product/default_library.js";
import { GOVERNANCE_FULFILLMENT_PROFILE } from "../product/default_library_fulfillment.js";
import { NATIVE_WORKSPACE_WORK_IDS } from "../product/native_workspace_work_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution_identity.js";
import { projectSameRunWorksiteCommandSourceAtPrefix } from "./worksite_input_provenance.js";
import { worksiteRevisionEntryBindingDisposition } from "./worksite_revision.js";
import { worksiteCommandForwardEntryDisposition } from "./worksite_command_forward.js";
import { resolveProgramStart } from "../gtl/public_start.js";
import { sampleNativeEventTime } from "./native_event_time.js";
import { resolveCProgramTermAtSourcePath, rootCTraversalCoordinate, } from "../gtl/source_path.js";
import { DIRECT_INVOKE_CAPABILITY, isProductExecutionResolution, RUN_OPERATION_CONTRACTS, } from "../product/index.js";
import { applyCatalogDeclaration, lookupGraphFunction, lookupGraphFunctionDefinition, } from "../product/catalog.js";
import { isCapabilityGrant, isInvocationAuthority, isInvocationPolicyBasis, isPublicInvocationCandidate, validateCapabilityGrantForProductBasis, } from "../product/invocation.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isProgramValidation, } from "../validator/validation.js";
import { isRawAdmittedValue, } from "../validator/raw_admission.js";
import { projectEffectfulPublicInvocationTruthAtPrefix, } from "./effectful_invocation_truth.js";
import { projectExactPrefixWorkspaceEnvironment, validatePublicOperationBasis, } from "./environment_admission.js";
import { AbgEventStore, admitNonEmptyRuntimeEventTransactionAtDurablePrefix, admitRuntimeEvent, assertHeldEventStoreAtDurablePrefix, readRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { hasExactInvocationAdmissionAtPrefix, hasExactInvocationRunBindingAtPrefix, projectExactInvocationAdmissionAtPrefix, } from "./invocation_execution_truth.js";
import { replayValidatedRuntimeEventPrefix } from "./replay.js";
import { runEnvironmentEvidenceMatchesInvocation } from "./stdo_environment.js";
function refusal(code, message) {
    return {
        kind: "invocation_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function duplicateInvocationRefusal(priorAdmission) {
    return deepFreeze({
        kind: "invocation_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: "duplicate_invocation",
        message: "the exact invocation admission already exists at the current durable prefix",
        priorAdmission,
    });
}
function catalogViewRef(view) {
    return `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`;
}
export function isInvocationSourceResultBasis(value) {
    try {
        if (!isRecord(value))
            return false;
        const expectedKeys = [
            "basisDigest",
            "basisRef",
            "kind",
            "publicAuthorityDigest",
            "schemaVersion",
            "sourceCCallRef",
            "sourceGraphCallId",
            "sourceGraphFunctionRef",
            "sourceInvocationAdmissionRef",
            "sourceInvocationRef",
            "sourceReplayDigest",
            "sourceReplayRef",
            "sourceResultAdmissionEventRef",
            "sourceResultContractRef",
            "sourceResultDigest",
            "sourceResultJudgmentEventRef",
            "sourceResultRef",
            "sourceResultValue",
            "sourceResultValueDigest",
            "sourceRunId",
            "sourceWorkspaceId",
            "workspaceBindingDigest",
            "workspaceBindingId",
        ];
        if (Object.keys(value).sort().join("\0") !== expectedKeys.join("\0")) {
            return false;
        }
        const digestFields = [
            "basisDigest",
            "publicAuthorityDigest",
            "sourceReplayDigest",
            "sourceResultDigest",
            "sourceResultValueDigest",
            "workspaceBindingDigest",
        ];
        const refFields = [
            "basisRef",
            "sourceCCallRef",
            "sourceGraphCallId",
            "sourceGraphFunctionRef",
            "sourceInvocationAdmissionRef",
            "sourceInvocationRef",
            "sourceReplayRef",
            "sourceResultAdmissionEventRef",
            "sourceResultContractRef",
            "sourceResultJudgmentEventRef",
            "sourceResultRef",
            "sourceRunId",
            "sourceWorkspaceId",
            "workspaceBindingId",
        ];
        if (value.kind !== "invocation_source_result_basis" ||
            value.schemaVersion !== "5.0.0" ||
            digestFields.some((field) => typeof value[field] !== "string" ||
                !/^sha256:[a-f0-9]{64}$/u.test(value[field])) ||
            refFields.some((field) => typeof value[field] !== "string" ||
                value[field].length === 0) ||
            value.sourceResultValueDigest !==
                sha256Canonical(value.sourceResultValue))
            return false;
        const { kind: _kind, schemaVersion: _schemaVersion, basisRef: _basisRef, basisDigest: _basisDigest, ...body } = value;
        const basisDigest = sha256Canonical(body);
        return value.basisDigest === basisDigest &&
            value.basisRef ===
                `invocation-source-result://abiogenesis/${basisDigest.slice("sha256:".length)}`;
    }
    catch {
        return false;
    }
}
function deriveSourceResultBasisAtPrefix(prefix, input, requireClosedRun) {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const runPrefix = selectValidatedRuntimeEventPrefix(events, {
        runId: input.runId,
    });
    const runEvents = runtimeEventsFromValidatedPrefix(runPrefix);
    const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(prefix, input.invocationAdmissionRef);
    const sourceReplay = replayValidatedRuntimeEventPrefix(runPrefix, prefix);
    const sourceCall = sourceReplay.cCalls.find((row) => row.resultRef === input.resultRef);
    const resultEvent = sourceCall === undefined
        ? undefined
        : runEvents.find((event) => event.kind === "c_call_result_admitted" &&
            event.aggregateId === sourceCall.cCallRef &&
            isRecord(event.payload) &&
            event.payload.resultRef === input.resultRef);
    const judgmentEvent = sourceCall === undefined
        ? undefined
        : runEvents.find((event) => event.kind === "c_call_judged" &&
            event.aggregateId === sourceCall.cCallRef &&
            isRecord(event.payload) &&
            event.payload.judgmentRef === sourceCall.judgmentRef);
    const sourceResultValueDigest = resultEvent !== undefined &&
        isRecord(resultEvent.payload) &&
        typeof resultEvent.payload.valueDigest === "string"
        ? resultEvent.payload.valueDigest
        : null;
    const sourceResultAdmissionDigest = resultEvent !== undefined &&
        isRecord(resultEvent.payload) &&
        typeof resultEvent.payload.resultDigest === "string"
        ? resultEvent.payload.resultDigest
        : null;
    const sourceJudgmentMatches = judgmentEvent !== undefined &&
        isRecord(judgmentEvent.payload) &&
        judgmentEvent.graphCallId === resultEvent?.graphCallId &&
        judgmentEvent.payload.resultRef === sourceCall?.resultRef &&
        judgmentEvent.payload.resultDigest === sourceCall?.resultDigest &&
        judgmentEvent.payload.judgment === "advance" &&
        (resultEvent === undefined ||
            judgmentEvent.causationEventRefs.includes(resultEvent.eventId));
    const sourceRunMatchesInvocation = sourceInvocation !== null &&
        hasInvocationRunBindingAtPrefix(prefix, sourceInvocation, input.runId);
    // This is cold source acquisition, shared by Public admission and replay.
    // A stopped Run is not success; only this exact successful library state can
    // supply a new, separately authorized invocation. Never infer applicability
    // from a choice/state-shaped payload alone.
    const retainedState = sourceCall?.resultContractRef === governanceContract("state") &&
        sourceCall.resultClass === "success" ? retainedGovernanceWorkInput(sourceCall.resultValue) : null;
    const selectedOwner = retainedState === null ? null : runEvents.find(e => e.kind === "c_call_fibre_selected" && e.aggregateId === sourceCall?.cCallRef && isRecord(e.payload) &&
        e.payload.regime === "F_D" && [governanceRef("implementation", "fold"), governanceRef("implementation", "evaluate-parent")]
        .includes(e.payload.implementationRef));
    const applicableRetainedWork = retainedState === null || selectedOwner === undefined || selectedOwner === null ? false : (() => {
        const sourceImplementations = new Map(events.flatMap(e => e.kind === "c_call_fibre_selected" && isRecord(e.payload)
            ? [[e.aggregateId, e.payload.implementationRef]] : []));
        // All later admitted work in this task/workspace relation matters, including
        // another bounded Run. History is evidence; selecting it never restores W.
        const relatedInvocations = new Set(events.flatMap(e => e.kind === "basis_admitted" && isRecord(e.payload) &&
            e.payload.basisClass === "root" && e.payload.workspaceBindingId === sourceInvocation?.workspaceBindingId &&
            e.payload.workspaceBindingDigest === sourceInvocation?.workspaceBindingDigest && isGovernanceWorkState(e.payload.rawInputValue) &&
            e.payload.rawInputValue.original.taskRef === retainedState?.original.taskRef ? [e.payload.invocationAdmissionRef] : []));
        const relatedBases = new Set(events.flatMap(e => e.kind === "basis_admitted" && isRecord(e.payload) &&
            relatedInvocations.has(e.payload.invocationAdmissionRef) ? [e.payload.basisRef] : []));
        return sourceReplay.actorProcesses.every(actor => actor.status !== "active" && actor.terminationConfirmed) &&
            !events.some(e => {
                if (resultEvent === undefined || e.admissionOrdinal <= resultEvent.admissionOrdinal ||
                    !relatedBases.has(e.basisId) || e.kind !== "c_call_result_admitted" || !isRecord(e.payload) || e.payload.resultClass !== "success")
                    return false;
                const value = e.payload.value;
                const implementation = sourceImplementations.get(e.aggregateId);
                // A later state/addition or completed child cannot disappear by selecting
                // an older snapshot. Read-only preparation and a new selection without
                // additions do not manufacture another completed work result.
                if ([governanceRef("implementation", "fold"), governanceRef("implementation", "evaluate-parent")].includes(implementation) &&
                    isGovernanceWorkState(value))
                    return canonicalJson(value) !== canonicalJson(retainedState);
                if (implementation === governanceRef("implementation", "select") && isFramedSynthesisResult(value))
                    return (canonicalJson(value.state) !== canonicalJson(retainedState) ||
                        (value.judgment.requirementProposals?.length ?? 0) !== 0);
                if (implementation === governanceRef("implementation", "project-choice") && isRecord(value) && value.kind === "registered_graph_choice" && value.disposition === "selected" &&
                    isRecord(value.input) && isGovernanceWorkState(value.input.value)) {
                    const next = value.input.value;
                    return canonicalJson({ ...next, synthesis: retainedState.synthesis }) !==
                        canonicalJson(retainedState);
                }
                return implementation === NATIVE_WORKSPACE_WORK_IDS.implementationRef && e.payload.contractRef === NATIVE_WORKSPACE_WORK_IDS.observationContractRef ||
                    implementation === WORKSITE_COMMAND_EXECUTION_IDS.implementationRef && e.payload.contractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef;
            });
    })();
    const inactiveRetainedWork = applicableRetainedWork &&
        (sourceReplay.runtimeFailureEventRef !== null || sourceReplay.runStoppedEventRef !== null) &&
        ["failed", "stopped", "gap_stopped", "blocked"].includes(sourceReplay.runtimeStatus);
    if (sourceInvocation === null ||
        !sourceRunMatchesInvocation ||
        sourceInvocation.invocationRef !== input.runtimeInvocationRef ||
        sourceReplay.runId !== input.runId ||
        (requireClosedRun && sourceCall?.resultContractRef === governanceContract("state") && !applicableRetainedWork) ||
        (requireClosedRun && (sourceReplay.runtimeStatus !== "closed" || sourceReplay.runClosedEventRef === null) && !inactiveRetainedWork) ||
        sourceCall === undefined ||
        sourceCall.status !== "judged" ||
        sourceCall.judgment !== "advance" ||
        sourceCall.resultRef === null ||
        sourceCall.resultDigest === null ||
        sourceCall.resultContractRef === null ||
        sourceCall.resultValue === null ||
        resultEvent === undefined ||
        resultEvent.graphCallId === null ||
        sourceResultValueDigest !==
            sha256Canonical(sourceCall.resultValue) ||
        sourceResultAdmissionDigest !== sourceCall.resultDigest ||
        !sourceJudgmentMatches) {
        return null;
    }
    const body = {
        publicAuthorityDigest: input.publicAuthorityDigest,
        sourceInvocationAdmissionRef: input.invocationAdmissionRef,
        sourceInvocationRef: sourceInvocation.invocationRef,
        sourceRunId: input.runId,
        sourceGraphCallId: resultEvent.graphCallId,
        sourceGraphFunctionRef: resultEvent.graphFunctionRef,
        sourceCCallRef: sourceCall.cCallRef,
        sourceResultAdmissionEventRef: resultEvent.eventId,
        sourceResultJudgmentEventRef: judgmentEvent.eventId,
        sourceResultRef: sourceCall.resultRef,
        sourceResultDigest: sourceCall.resultDigest,
        sourceResultValueDigest: sourceResultValueDigest,
        sourceResultContractRef: sourceCall.resultContractRef,
        sourceResultValue: sourceCall.resultValue,
        sourceReplayRef: sourceReplay.replayRef,
        sourceReplayDigest: sourceReplay.replayDigest,
        sourceWorkspaceId: sourceInvocation.workspaceId,
        workspaceBindingId: sourceInvocation.workspaceBindingId,
        workspaceBindingDigest: sourceInvocation.workspaceBindingDigest,
    };
    const basisDigest = sha256Canonical(body);
    const basis = deepFreeze({
        kind: "invocation_source_result_basis",
        schemaVersion: "5.0.0",
        basisRef: `invocation-source-result://abiogenesis/${basisDigest.slice("sha256:".length)}`,
        basisDigest,
        ...body,
    });
    return basis;
}
export function deriveInvocationSourceResultBasisAtPrefix(prefix, input) {
    return deriveSourceResultBasisAtPrefix(prefix, input, true);
}
/** @internal A current preparation route proves either a same-Run source or
 * explicit reacquisition of a historical closed child. Public closed-Run law is unchanged. */
export function deriveSameRunWorksiteCommandSourceBasisAtPrefix(prefix, input, currentOwnerPrefix) {
    const nativeTask = admittedNativeTask(prefix, input.task);
    const source = nativeTask !== null
        ? projectSameRunNativeWorkCommandSourceAtPrefix(prefix, { ...input, task: nativeTask }, currentOwnerPrefix)
        : projectSameRunWorksiteCommandSourceAtPrefix(prefix, input);
    const reacquired = nativeTask !== null && nativeTask.sourceReacquisition !== undefined;
    const invocation = rehydrateInvocationAdmissionAtPrefix(prefix, reacquired && source !== null
        ? source.sourceBasis.invocationAdmissionRef : input.parentBasis.invocationAdmissionRef);
    if (source === null || invocation === null || !isRecord(source.sourceResult.payload) ||
        typeof source.sourceResult.payload.resultRef !== "string")
        return null;
    const result = deriveSourceResultBasisAtPrefix(prefix, {
        publicAuthorityDigest: invocation.publicRequestDigest,
        invocationAdmissionRef: invocation.invocationAdmissionRef,
        runtimeInvocationRef: invocation.invocationRef,
        runId: reacquired ? source.sourceResult.runId : input.runId, resultRef: source.sourceResult.payload.resultRef,
    }, false);
    return result !== null && result.sourceResultAdmissionEventRef === source.sourceResult.eventId &&
        result.sourceResultJudgmentEventRef === source.sourceJudgment.eventId &&
        result.sourceGraphCallId === source.sourceResult.graphCallId ? result : null;
}
/** Reopens no authority: it reidentifies one asserted source basis in-place. */
export function rehydrateInvocationSourceResultBasisAtDurablePrefix(prefix, asserted) {
    if (!isInvocationSourceResultBasis(asserted))
        return null;
    let validatedPrefix;
    try {
        validatedPrefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(prefix));
    }
    catch {
        return null;
    }
    const projected = deriveInvocationSourceResultBasisAtPrefix(validatedPrefix, {
        publicAuthorityDigest: asserted.publicAuthorityDigest,
        runtimeInvocationRef: asserted.sourceInvocationRef,
        invocationAdmissionRef: asserted.sourceInvocationAdmissionRef,
        runId: asserted.sourceRunId,
        resultRef: asserted.sourceResultRef,
    });
    return projected !== null &&
        canonicalJson(projected) ===
            canonicalJson(asserted)
        ? projected
        : null;
}
function validatedComputeRegimes(validation) {
    const declared = new Set([
        ...validation.executableLeafRows.map((row) => row.fibre),
        ...validation.interactionLeafRows.map((row) => row.fibre),
    ]);
    return ["F_D", "F_P", "F_H"].filter((regime) => declared.has(regime));
}
function validatedInteractionCapabilities(validation) {
    return validation.interactionLeafRows
        .map((row) => ({
        requirementKey: row.requirementKey,
        requirementKeyDigest: row.requirementKeyDigest,
        actorCapabilityRef: row.requirement.actorCapabilityRef,
    }))
        .sort((left, right) => compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
}
export function validateInvocationCapabilityBasis(input) {
    const exactComputeRegimes = validatedComputeRegimes(input.programValidation);
    const exactInteractionCapabilities = validatedInteractionCapabilities(input.programValidation);
    const exactCatalogApplications = [...(input.catalogApplications ?? [])]
        .sort((left, right) => compareUnicodeCodeUnits(left.applicationRef, right.applicationRef));
    const fixedPacket = RUN_OPERATION_CONTRACTS.invoke[input.memberKey];
    if (!isInvocationPolicyBasis(input.policy) ||
        input.policy.authorityMode !== "trusted_developer" ||
        input.policy.authorityBasisId !== input.workspaceBinding.authorityBasisId ||
        input.policy.authorityBasisDigest !==
            input.workspaceBinding.authorityBasisDigest ||
        input.policy.authorizedActorRef !==
            input.workspaceBinding.authorizedActorRef ||
        input.actorRef !== input.workspaceBinding.authorizedActorRef ||
        input.policy.workspaceBindingId !== input.workspaceBinding.bindingId ||
        input.policy.workspaceBindingDigest !== input.workspaceBinding.bindingDigest ||
        input.policy.programRef !== input.program.programRef ||
        input.policy.programDigest !==
            sha256Canonical(input.program) ||
        input.policy.allowedComputeRegimes.join("\0") !== exactComputeRegimes.join("\0") ||
        sha256Canonical(input.policy.interactionCapabilities) !== sha256Canonical(exactInteractionCapabilities) ||
        input.policy.catalogApplicationRefs.join("\0") !==
            exactCatalogApplications.map((application) => application.applicationRef).join("\0") ||
        input.policy.catalogApplicationDigests.join("\0") !==
            exactCatalogApplications.map((application) => application.applicationDigest).join("\0") ||
        input.policy.graphMaterialization !== "after_invocation_admission") {
        return refusal("capability_mismatch", "root invocation policy differs from the admitted workspace, Program, compute fibres, or interaction requirements");
    }
    if (input.capabilityGrants.length !== 1 ||
        new Set(input.capabilityGrants.map((grant) => grant.grantRef)).size !==
            input.capabilityGrants.length ||
        input.capabilityGrants.some((grant) => !validateCapabilityGrantForProductBasis(grant, input.policy, input.actorRef, DIRECT_INVOKE_CAPABILITY, {
            admittedInstalls: input.productInstalls,
            workspaceBinding: input.workspaceBinding,
            fixedPacket,
        }))) {
        return refusal("capability_mismatch", "invocation capability grants are absent, surplus, reordered, or inconsistent with the exact Program requirements");
    }
    return null;
}
export function hasAdmittedInvocation(store, admission) {
    return hasAdmittedInvocationAtPrefix(selectValidatedRuntimeEventPrefix(store.readAll()), admission);
}
export function hasAdmittedInvocationAtPrefix(prefix, admission) {
    return hasExactInvocationAdmissionAtPrefix(prefix, admission);
}
export function hasInvocationRunBindingAtPrefix(prefix, admission, runId) {
    return hasExactInvocationRunBindingAtPrefix(prefix, admission, runId);
}
export function rehydrateInvocationAdmissionAtPrefix(prefix, invocationAdmissionRef) {
    return projectExactInvocationAdmissionAtPrefix(prefix, invocationAdmissionRef);
}
function admitInvocationWithRequest(store, input, basis, requestBasis) {
    const catalogApplications = input.catalogApplications ?? [];
    const expectedMemberKey = input.invocation.variant === "direct"
        ? "invoke"
        : input.invocation.variant;
    const invalidBasis = validatePublicOperationBasis(basis, "abg.operation.run.invoke", expectedMemberKey);
    if (invalidBasis !== null)
        return invalidBasis;
    if (!isPublicInvocationCandidate(input.invocation)) {
        return refusal("invocation_not_constructed", "invocation was not constructed by the Product boundary");
    }
    if (basis.invocationRef !== input.invocation.publicRequestInvocationRef ||
        basis.authorityScopeRef !== input.workspaceBinding.bindingId ||
        basis.authorityScopeDigest !== input.workspaceBinding.bindingDigest) {
        return refusal("authority_mismatch", "public operation basis differs from invocation or workspace authority");
    }
    const environment = projectExactPrefixWorkspaceEnvironment(input.artifactTruth.prefix, {
        ref: input.workspaceBinding.bindingId,
        digest: input.workspaceBinding.bindingDigest,
    });
    if (environment.kind !== "exact_prefix_workspace_environment" ||
        canonicalJson(environment.artifactTruth) !==
            canonicalJson(input.artifactTruth) ||
        canonicalJson(environment.workspaceBinding) !==
            canonicalJson(input.workspaceBinding)) {
        return refusal("workspace_not_admitted", "invocation workspace and artifact truth differ from the exact ABG-owned prefix environment");
    }
    let predecessorPrefix;
    try {
        assertHeldEventStoreAtDurablePrefix(store, input.artifactTruth.prefix);
        predecessorPrefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(input.artifactTruth.prefix));
    }
    catch {
        return refusal("authority_mismatch", "invocation admission requires the exact held artifact-truth predecessor prefix");
    }
    const invocationTruth = projectEffectfulPublicInvocationTruthAtPrefix(input.artifactTruth.prefix, basis.invocationRef);
    if (invocationTruth.disposition === "invalid_history") {
        return invocationTruth;
    }
    if (invocationTruth.disposition === "duplicate") {
        return duplicateInvocationRefusal(invocationTruth.priorAdmission);
    }
    const applicationResources = input.catalogApplicationResources ?? [];
    const exactCatalogApplications = catalogApplications.map((application, index) => {
        try {
            const resources = applicationResources[index];
            if (resources === undefined || resources.construction.programRef !== input.program.programRef ||
                canonicalJson(resources.catalogView) !== canonicalJson(input.catalogView))
                return false;
            const reconstructed = reconstructCatalogApplication(resources, input.artifactTruth.prefix);
            return canonicalJson(reconstructed) === canonicalJson(application);
        }
        catch {
            return false;
        }
    });
    if (applicationResources.length !== catalogApplications.length ||
        new Set(catalogApplications.map((row) => row.applicationRef)).size !==
            catalogApplications.length ||
        exactCatalogApplications.some((exact) => !exact) ||
        catalogApplications.some((application) => application.viewDigest !== input.catalogView.viewDigest ||
            application.catalogBasisDigest !== input.catalogView.catalogBasisDigest)) {
        return refusal("catalog_view_not_admitted", "invocation catalog applications must be unique exact Product reconstructions under the supplied CatalogView");
    }
    if (input.invocation.variant === "direct" &&
        input.program.policies["abg.root_mode"] === "supervised") {
        return refusal("selection_mismatch", "a supervised Program cannot be admitted through direct invocation");
    }
    if (!isProgramValidation(input.programValidation) ||
        input.programValidation.programRef !== input.program.programRef ||
        input.programValidation.programDigest !== input.invocation.programDigest ||
        input.programValidation.publicationDigest !== sha256Canonical(input.programPublication) ||
        !input.programValidation.graphFunctionDigests.includes(input.invocation.graphFunctionDigest)) {
        return refusal("validation_mismatch", "Invocation requires the exact non-lowering ProgramValidation");
    }
    const executionResolution = input.executionResolution;
    if (!isProductExecutionResolution(executionResolution)) {
        return refusal("contract_mismatch", "invocation requires one exact Product execution resolution");
    }
    const inputContract = executionResolution.inputContract;
    const outputContract = executionResolution.outputContract;
    const inputOwnerMatches = executionResolution.declarationOwners.filter((owner) => canonicalJson(owner) === canonicalJson(executionResolution.inputContractOwner));
    const outputOwnerMatches = executionResolution.declarationOwners.filter((owner) => canonicalJson(owner) === canonicalJson(executionResolution.outputContractOwner));
    if (executionResolution.catalogBasisDigest !==
        input.invocation.catalogBasisDigest ||
        executionResolution.catalogViewDigest !== input.catalogView.viewDigest ||
        executionResolution.programRef !== input.program.programRef ||
        executionResolution.programDigest !== input.invocation.programDigest ||
        executionResolution.graphFunctionRef !== input.graphFunction.name ||
        executionResolution.graphFunctionDigest !==
            input.invocation.graphFunctionDigest ||
        executionResolution.programValidationRef !==
            input.programValidation.validationRef ||
        executionResolution.inputContractOwner.declarationKind !== "contract" ||
        executionResolution.inputContractOwner.declarationRef !==
            input.invocation.inputContractRef ||
        executionResolution.outputContractOwner.declarationKind !== "contract" ||
        executionResolution.outputContractOwner.declarationRef !==
            input.invocation.outputContractRef ||
        inputOwnerMatches.length !== 1 ||
        outputOwnerMatches.length !== 1 ||
        executionResolution.inputContractDigest !== sha256Canonical(inputContract) ||
        executionResolution.outputContractDigest !== sha256Canonical(outputContract) ||
        input.graphFunction.inputs.length !== 1 ||
        input.graphFunction.inputs[0] !== inputContract.contractRef ||
        input.graphFunction.outputs.length !== 1 ||
        input.graphFunction.outputs[0] !== outputContract.contractRef ||
        !isRawAdmittedValue(input.rawInput) ||
        input.rawInput.subjectKind !== "invocation_input" ||
        input.rawInput.admissionRef !== input.invocation.rawInputAdmissionRef ||
        input.rawInput.subjectDigest !== input.invocation.rawInputDigest ||
        input.rawInput.contractRef !== input.invocation.inputContractRef ||
        inputContract?.contractKind !== "input" ||
        // A published value may be another callable's input without changing its
        // contract identity. The exact GraphFunction outputs relation owns this role.
        (outputContract?.contractKind !== "output" && outputContract?.contractKind !== "input") ||
        !isRecord(input.rawInput.value) ||
        input.rawInput.value.kind !== inputContract.valueKind) {
        return refusal("contract_mismatch", "raw input or declared input/output contract differs from invocation");
    }
    const request = requestBasis.family === "legacy_root_public"
        ? requestBasis.rawRequest.value
        : requestBasis.publicInvocation.request;
    const requestPayload = requestBasis.family === "legacy_root_public" &&
        isRecord(request) && isRecord(request.payload)
        ? request.payload
        : null;
    const exactRequest = requestBasis.family === "exact_public_definition"
        ? requestBasis.publicInvocation.request
        : null;
    const suppliedReentryAuthority = requestPayload !== null && isRecord(requestPayload.reentryAuthority)
        ? requestPayload.reentryAuthority
        : null;
    const suppliedSourceProjectionAuthority = requestPayload !== null &&
        isRecord(requestPayload.sourceProjectionAuthority)
        ? requestPayload.sourceProjectionAuthority
        : exactRequest !== null && isRecord(exactRequest.sourceBasis) &&
            exactRequest.sourceBasis.kind === "admitted_source_result" &&
            isRecord(exactRequest.sourceBasis.projectionAuthority) &&
            typeof exactRequest.sourceBasis.projectionAuthority.digest === "string"
            ? { authorityDigest: exactRequest.sourceBasis.projectionAuthority.digest }
            : null;
    const suppliedSourceResultRef = requestPayload !== null &&
        typeof requestPayload.sourceResultRef === "string"
        ? requestPayload.sourceResultRef
        : exactRequest !== null && isRecord(exactRequest.sourceBasis) &&
            exactRequest.sourceBasis.kind === "admitted_source_result" &&
            isRecord(exactRequest.sourceBasis.sourceResult) &&
            typeof exactRequest.sourceBasis.sourceResult.ref === "string"
            ? exactRequest.sourceBasis.sourceResult.ref
            : null;
    const exactStartTarget = input.invocation.variant === "start" &&
        exactRequest !== null && isRecord(exactRequest.target)
        ? exactRequest.target.kind === "next"
            ? { target: "next" }
            : exactRequest.target.kind === "graph_function" &&
                typeof exactRequest.target.handle === "string"
                ? {
                    target: "graph_function",
                    graphFunctionHandle: exactRequest.target.handle,
                }
                : exactRequest.target.kind === "asset" &&
                    typeof exactRequest.target.handle === "string"
                    ? { target: `asset:${exactRequest.target.handle}` }
                    : exactRequest.target.kind === "declared_start" &&
                        isRecord(exactRequest.target.start) &&
                        typeof exactRequest.target.start.ref === "string"
                        ? {
                            target: exactRequest.target.start.ref,
                            startRef: exactRequest.target.start.ref,
                        }
                        : null
        : null;
    const resolvedPublicStart = input.invocation.variant === "start" &&
        exactRequest !== null &&
        exactStartTarget !== null &&
        !("graphFunctionHandle" in exactStartTarget) &&
        exactRequest.scope === "program" &&
        exactRequest.until === "converged" &&
        (exactRequest.rootMode === "direct" ||
            exactRequest.rootMode === "supervised")
        ? resolveProgramStart(input.program, {
            scope: "program",
            target: exactStartTarget.target,
            until: "converged",
            rootMode: exactRequest.rootMode,
            ...("startRef" in exactStartTarget
                ? { startRef: exactStartTarget.startRef }
                : {}),
        })
        : input.invocation.variant === "start" &&
            requestPayload !== null &&
            typeof requestPayload.scope === "string" &&
            typeof requestPayload.target === "string" &&
            typeof requestPayload.until === "string" &&
            typeof requestPayload.rootMode === "string"
            ? resolveProgramStart(input.program, {
                scope: requestPayload.scope,
                target: requestPayload.target,
                until: requestPayload.until,
                rootMode: requestPayload.rootMode,
                ...(typeof requestPayload.startRef === "string"
                    ? { startRef: requestPayload.startRef }
                    : {}),
            })
            : null;
    const directCatalogHandle = input.invocation.variant === "direct" &&
        exactRequest !== null &&
        typeof exactRequest.catalogHandle === "string"
        ? exactRequest.catalogHandle
        : input.invocation.variant === "direct" &&
            requestPayload !== null &&
            typeof requestPayload.catalogHandle === "string"
            ? requestPayload.catalogHandle
            : null;
    const definitionLookup = input.invocation.variant === "start" &&
        resolvedPublicStart?.kind === "resolved_program_start"
        ? lookupGraphFunctionDefinition(input.catalogView, resolvedPublicStart.start.graphFunctionRef, input.program.programRef)
        : null;
    const graphFunctionStartRow = input.invocation.variant === "start" &&
        exactStartTarget !== null &&
        "graphFunctionHandle" in exactStartTarget
        ? lookupGraphFunction(input.catalogView, exactStartTarget.graphFunctionHandle)
        : null;
    const selectedRow = input.invocation.variant === "direct"
        ? directCatalogHandle === null
            ? null
            : lookupGraphFunction(input.catalogView, directCatalogHandle)
        : graphFunctionStartRow ??
            (definitionLookup?.kind === "graph_function_definition_lookup_exact"
                ? definitionLookup.entry
                : null);
    if (input.invocation.variant === "start" &&
        graphFunctionStartRow === null &&
        definitionLookup?.kind !== "graph_function_definition_lookup_exact") {
        return refusal("selection_mismatch", definitionLookup?.kind ===
            "graph_function_definition_lookup_ambiguous"
            ? "Product start revalidation found ambiguous catalog definitions"
            : "Product start revalidation found no catalog definition");
    }
    if (input.invocation.programRef !== input.program.programRef ||
        input.invocation.programDigest !==
            sha256Canonical(input.program) ||
        input.invocation.graphFunctionRef !== input.graphFunction.name ||
        input.invocation.graphFunctionDigest !==
            sha256Canonical(input.graphFunction) ||
        input.invocation.catalogHandle !== selectedRow?.handle ||
        input.invocation.selectedDefinitionRef !== selectedRow?.definitionRef ||
        input.invocation.selectedDefinitionDigest !== selectedRow?.definitionDigest ||
        !input.program.callableMembership.includes(input.graphFunction.name) ||
        selectedRow?.kind !== "graph_function_catalog_entry" ||
        selectedRow.definitionRef !== input.graphFunction.name ||
        selectedRow.definitionDigest !== input.invocation.graphFunctionDigest ||
        !selectedRow.programMembershipRefs.includes(input.program.programRef)) {
        return refusal("selection_mismatch", "selected catalog handle, definition, and Program lack exact admitted membership");
    }
    const gtlEntryCoordinate = rootCTraversalCoordinate(input.graphFunction.template.startNodeRef);
    const gtlEntryTerm = resolveCProgramTermAtSourcePath(input.graphFunction.template, gtlEntryCoordinate.nodeRef, gtlEntryCoordinate.termPath);
    if (gtlEntryTerm.kind === "c_source_path_refusal") {
        return refusal("selection_mismatch", "selected GraphFunction lacks one exact HoG root C entry");
    }
    const requestProgramRef = exactRequest !== null &&
        isRecord(exactRequest.program) &&
        typeof exactRequest.program.ref === "string"
        ? exactRequest.program.ref
        : requestPayload !== null && typeof requestPayload.programRef === "string"
            ? requestPayload.programRef
            : null;
    const requestTargetMatches = requestProgramRef === input.invocation.programRef &&
        ((input.invocation.variant === "direct" &&
            directCatalogHandle === selectedRow.handle) ||
            (input.invocation.variant === "start" &&
                ((graphFunctionStartRow !== null &&
                    graphFunctionStartRow.definitionRef ===
                        input.invocation.graphFunctionRef) ||
                    (resolvedPublicStart?.kind === "resolved_program_start" &&
                        resolvedPublicStart.start.graphFunctionRef ===
                            input.invocation.graphFunctionRef))));
    if ((requestBasis.family === "legacy_root_public"
        ? !isRawAdmittedValue(requestBasis.rawRequest) ||
            requestBasis.rawRequest.subjectKind !== "public_operation_request" ||
            requestBasis.rawRequest.contractRef !==
                "contract://abiogenesis/public/run-invoke-request@5" ||
            requestBasis.rawRequest.admissionRef !==
                input.invocation.publicRequestAdmissionRef ||
            requestBasis.rawRequest.subjectDigest !==
                input.invocation.publicRequestDigest ||
            !isRecord(request) ||
            request.operationId !== "abg.operation.run.invoke" ||
            request.variant !== input.invocation.variant ||
            request.invocationRef !== input.invocation.publicRequestInvocationRef
        : requestBasis.publicInvocation.kind !== "public_invocation" ||
            requestBasis.publicInvocation.schemaVersion !== "5.0.0" ||
            requestBasis.publicInvocation.definitionKey.operationId !==
                "abg.operation.run.invoke" ||
            requestBasis.publicInvocation.definitionKey.memberKey !==
                (input.invocation.variant === "direct" ? "invoke" : "start") ||
            requestBasis.publicInvocation.requestRef !==
                input.invocation.publicRequestAdmissionRef ||
            requestBasis.publicInvocation.requestDigest !==
                input.invocation.publicRequestDigest ||
            requestBasis.publicInvocation.invocationRef !==
                input.invocation.publicRequestInvocationRef ||
            requestBasis.publicInvocation.requestDigest !==
                sha256Canonical(request) ||
            basis.definitionDigest !==
                requestBasis.publicInvocation.definitionDigest ||
            basis.invocationPayloadDigest !==
                requestBasis.publicInvocation.requestDigest) ||
        !requestTargetMatches) {
        return refusal("authority_mismatch", "invocation target lacks exact caller-request admission");
    }
    if (worksiteRevisionEntryBindingDisposition(predecessorPrefix, input.graphFunction, input.rawInput.value, environment.workspaceBinding) === "basis_fork_detected") {
        return refusal("basis_fork_detected", "selected D2 ancestry lacks exact native binding correspondence");
    }
    if (worksiteCommandForwardEntryDisposition(input.artifactTruth.prefix, input.graphFunction, input.rawInput.value, environment.workspaceBinding, input.capabilityGrants, input.sourceResultBasis) === "basis_fork_detected") {
        return refusal("basis_fork_detected", "forward C2 requires exact unconsumed historical owners and current binding cover");
    }
    const priorGap = isRecord(input.rawInput.value) &&
        isRecord(input.rawInput.value.priorGap)
        ? input.rawInput.value.priorGap
        : null;
    const publicStart = input.invocation.variant === "start" &&
        exactRequest !== null &&
        exactStartTarget !== null &&
        "graphFunctionHandle" in exactStartTarget &&
        exactRequest.scope === "program" &&
        exactRequest.until === "converged" &&
        (exactRequest.rootMode === "direct" ||
            exactRequest.rootMode === "supervised") &&
        graphFunctionStartRow !== null
        ? {
            kind: "public_start_identity",
            schemaVersion: "5.0.0",
            programRef: input.program.programRef,
            graphFunctionRef: input.graphFunction.name,
            startRef: graphFunctionStartRow.definitionRef,
            scope: "program",
            target: `graph_function:${exactStartTarget.graphFunctionHandle}`,
            until: "converged",
            rootMode: exactRequest.rootMode,
        }
        : input.invocation.variant === "start" &&
            exactRequest !== null &&
            exactStartTarget !== null &&
            !("graphFunctionHandle" in exactStartTarget) &&
            exactRequest.scope === "program" &&
            exactRequest.until === "converged" &&
            (exactRequest.rootMode === "direct" ||
                exactRequest.rootMode === "supervised") &&
            resolvedPublicStart?.kind === "resolved_program_start"
            ? {
                kind: "public_start_identity",
                schemaVersion: "5.0.0",
                programRef: input.program.programRef,
                graphFunctionRef: input.graphFunction.name,
                startRef: resolvedPublicStart.start.startRef,
                scope: "program",
                target: exactStartTarget.target,
                until: "converged",
                rootMode: exactRequest.rootMode,
            }
            : input.invocation.variant === "start" &&
                requestPayload !== null &&
                typeof requestPayload.programRef === "string" &&
                typeof requestPayload.scope === "string" &&
                typeof requestPayload.target === "string" &&
                typeof requestPayload.until === "string" &&
                typeof requestPayload.rootMode === "string" &&
                resolvedPublicStart?.kind === "resolved_program_start"
                ? {
                    kind: "public_start_identity",
                    schemaVersion: "5.0.0",
                    programRef: requestPayload.programRef,
                    graphFunctionRef: input.graphFunction.name,
                    startRef: resolvedPublicStart.start.startRef,
                    scope: requestPayload.scope,
                    target: requestPayload.target,
                    until: requestPayload.until,
                    rootMode: requestPayload.rootMode,
                }
                : null;
    if (input.reentryBasis === undefined) {
        if (suppliedReentryAuthority !== null || priorGap !== null) {
            return refusal("authority_mismatch", "re-entry authority and prior gap must be admitted together");
        }
    }
    else {
        const reentry = input.reentryBasis;
        const predecessorEvents = runtimeEventsFromValidatedPrefix(predecessorPrefix);
        const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(predecessorPrefix, reentry.sourceInvocationAdmissionRef);
        const sourceReplay = (() => {
            try {
                return replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(predecessorEvents, {
                    runId: reentry.sourceRunId,
                }), predecessorPrefix);
            }
            catch {
                return null;
            }
        })();
        const sourceRoute = sourceReplay?.routes.find((route) => route.admissionEventRef === reentry.sourceRouteEventRef);
        const sourceProjection = sourceRoute?.nextActionProjection ?? null;
        const sourceAlreadyConsumed = predecessorEvents.some((event) => event.kind === "invocation_admitted" &&
            isRecord(event.payload) &&
            isRecord(event.payload.reentryBasis) &&
            event.payload.reentryBasis.sourceInvocationAdmissionRef ===
                reentry.sourceInvocationAdmissionRef &&
            event.payload.reentryBasis.sourceRunId === reentry.sourceRunId &&
            event.payload.reentryBasis.sourceRouteRef === reentry.sourceRouteRef &&
            event.payload.reentryBasis.sourceRouteDigest ===
                reentry.sourceRouteDigest &&
            event.payload.reentryBasis.sourceRunStoppedEventRef ===
                reentry.sourceRunStoppedEventRef &&
            event.payload.reentryBasis.gapRef === reentry.gapRef &&
            event.payload.reentryBasis.nextActionProjectionRef ===
                reentry.nextActionProjectionRef &&
            event.payload.reentryBasis.nextActionProjectionDigest ===
                reentry.nextActionProjectionDigest);
        if (input.invocation.variant !== "start" ||
            publicStart === null ||
            reentry.kind !== "invocation_reentry_basis" ||
            reentry.schemaVersion !== "5.0.0" ||
            suppliedReentryAuthority?.authorityDigest !==
                reentry.publicAuthorityDigest ||
            sourceInvocation === null ||
            sourceInvocation.invocationVariant !== "start" ||
            sourceInvocation.publicStart === null ||
            sha256Canonical(sourceInvocation.publicStart) !== sha256Canonical(reentry.sourceStart) ||
            sha256Canonical(publicStart) !==
                sha256Canonical(reentry.sourceStart) ||
            sourceInvocation.workspaceBindingId !==
                input.workspaceBinding.bindingId ||
            sourceInvocation.workspaceBindingDigest !==
                input.workspaceBinding.bindingDigest ||
            sourceInvocation.catalogViewId !== catalogViewRef(input.catalogView) ||
            sourceInvocation.catalogViewDigest !== input.catalogView.viewDigest ||
            sourceInvocation.programRef !== input.program.programRef ||
            sourceInvocation.graphFunctionRef !== input.graphFunction.name ||
            reentry.productSetId !== input.workspaceBinding.productSetId ||
            reentry.productSetDigest !==
                input.workspaceBinding.productSetDigest ||
            reentry.lockId !== input.workspaceBinding.lockId ||
            reentry.lockDigest !== input.workspaceBinding.lockDigest ||
            sourceAlreadyConsumed ||
            sourceReplay?.runId !== reentry.sourceRunId ||
            sourceRoute?.routeKind !== "gap_stop" ||
            sourceRoute.routeRef !== reentry.sourceRouteRef ||
            sourceRoute.routeDigest !== reentry.sourceRouteDigest ||
            sourceRoute.nextActionProjectionRef !==
                reentry.nextActionProjectionRef ||
            sourceRoute.nextActionProjectionDigest !==
                reentry.nextActionProjectionDigest ||
            sourceProjection?.gapRef !== reentry.gapRef ||
            sourceReplay.runStoppedEventRef !==
                reentry.sourceRunStoppedEventRef ||
            sourceReplay.runStoppedDisposition !== "gap_stop" ||
            sourceReplay.runtimeStatus !== "gap_stopped" ||
            priorGap?.sourceRunId !== reentry.sourceRunId ||
            priorGap.sourceRouteRef !== reentry.sourceRouteRef ||
            priorGap.gapRef !== reentry.gapRef ||
            priorGap.nextActionProjectionRef !==
                reentry.nextActionProjectionRef ||
            priorGap.nextActionProjectionDigest !==
                reentry.nextActionProjectionDigest) {
            return refusal("authority_mismatch", "re-entry requires the exact durable gap stop, Product observation, and installed invocation basis");
        }
    }
    if (input.sourceResultBasis === undefined) {
        if (suppliedSourceProjectionAuthority !== null ||
            suppliedSourceResultRef !== null) {
            return refusal("authority_mismatch", "source result authority and its ABG-derived basis must be admitted together");
        }
    }
    else {
        const suppliedBasis = input.sourceResultBasis;
        const exactBasis = isInvocationSourceResultBasis(suppliedBasis)
            ? deriveInvocationSourceResultBasisAtPrefix(predecessorPrefix, {
                publicAuthorityDigest: suppliedBasis.publicAuthorityDigest,
                runtimeInvocationRef: suppliedBasis.sourceInvocationRef,
                invocationAdmissionRef: suppliedBasis.sourceInvocationAdmissionRef,
                runId: suppliedBasis.sourceRunId,
                resultRef: suppliedBasis.sourceResultRef,
            })
            : null;
        if (suppliedSourceProjectionAuthority === null ||
            suppliedSourceResultRef === null ||
            exactBasis === null ||
            canonicalJson(exactBasis) !==
                canonicalJson(suppliedBasis) ||
            suppliedSourceProjectionAuthority.authorityDigest !==
                suppliedBasis.publicAuthorityDigest ||
            suppliedSourceResultRef !== suppliedBasis.sourceResultRef) {
            return refusal("authority_mismatch", "source result basis differs from its exact predecessor events, durable public authority, or selected result");
        }
        if (suppliedBasis.sourceResultContractRef === governanceContract("state")) {
            const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(predecessorPrefix, suppliedBasis.sourceInvocationAdmissionRef);
            const retained = retainedGovernanceWorkInput(suppliedBasis.sourceResultValue);
            if (retained === null || sourceInvocation === null ||
                input.graphFunction.declarations["abg.supported_fulfillment_profile"] !== GOVERNANCE_FULFILLMENT_PROFILE ||
                input.rawInput.contractRef !== governanceContract("state") ||
                canonicalJson(input.rawInput.value) !== canonicalJson(retained) ||
                sourceInvocation.programRef !== input.program.programRef || sourceInvocation.programDigest !== sha256Canonical(input.program) ||
                sourceInvocation.catalogViewId !== catalogViewRef(input.catalogView) || sourceInvocation.catalogViewDigest !== input.catalogView.viewDigest ||
                sourceInvocation.workspaceBindingId !== environment.workspaceBinding.bindingId ||
                sourceInvocation.workspaceBindingDigest !== environment.workspaceBinding.bindingDigest) {
                return refusal("authority_mismatch", "retained library work requires its exact current input, declared entry, Program and workspace authority");
            }
        }
    }
    const capabilityRefusal = validateInvocationCapabilityBasis({
        actorRef: input.invocation.actorAttributionRef,
        capabilityGrants: input.capabilityGrants,
        catalogApplications,
        memberKey: expectedMemberKey,
        policy: input.policy,
        productInstalls: environment.productInstalls,
        program: input.program,
        programValidation: input.programValidation,
        workspaceBinding: input.workspaceBinding,
    });
    if (capabilityRefusal !== null ||
        input.policy.policyRef !== input.invocation.sessionPolicyRef ||
        input.policy.policyDigest !== input.invocation.sessionPolicyDigest ||
        input.invocation.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0") ||
        input.invocation.capabilityGrantDigests.join("\0") !== input.capabilityGrants.map((grant) => grant.grantDigest).join("\0")) {
        return capabilityRefusal ?? refusal("capability_mismatch", "invocation candidate differs from its exact admitted policy or grants");
    }
    if (!isInvocationAuthority(input.authority) ||
        input.authority.actorRef.length === 0 ||
        input.authority.authorityRef !== input.invocation.invocationAuthorityRef ||
        input.authority.authorityDigest !== input.invocation.invocationAuthorityDigest ||
        input.authority.actorRef !== input.invocation.actorAttributionRef ||
        input.authority.workspaceBindingId !== input.workspaceBinding.bindingId ||
        input.authority.workspaceBindingDigest !==
            input.workspaceBinding.bindingDigest ||
        input.authority.catalogBasisDigest !== input.catalogView.catalogBasisDigest ||
        input.authority.catalogViewDigest !== input.catalogView.viewDigest ||
        input.authority.catalogViewDigest !== input.catalogView.viewDigest ||
        input.authority.programRef !== input.program.programRef ||
        input.authority.catalogHandle !== selectedRow.handle ||
        input.authority.selectedDefinitionRef !== selectedRow.definitionRef ||
        input.authority.selectedDefinitionDigest !== selectedRow.definitionDigest ||
        input.authority.graphFunctionRef !== input.graphFunction.name ||
        input.authority.policyRef !== input.policy.policyRef ||
        input.authority.policyDigest !== input.policy.policyDigest ||
        input.authority.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0")) {
        return refusal("authority_mismatch", "invocation authority does not cover the exact actor, environment, and target");
    }
    if (!runEnvironmentEvidenceMatchesInvocation(input.runEnvironment, input.programPublication, input.program, { authorityRef: input.authority.authorityRef, authorityDigest: input.authority.authorityDigest, actorRef: input.authority.actorRef })) {
        return refusal("capability_mismatch", "required exact STDO environment access is not admitted for this invocation");
    }
    const programValidationDigest = sha256Canonical(input.programValidation);
    const admissionBody = {
        invocationRef: input.invocation.invocationRef,
        invocationDigest: input.invocation.invocationDigest,
        invocationVariant: input.invocation.variant,
        rawInputAdmissionRef: input.rawInput.admissionRef,
        rawInputDigest: input.rawInput.subjectDigest,
        publicRequestAdmissionRef: requestBasis.family === "legacy_root_public"
            ? requestBasis.rawRequest.admissionRef
            : requestBasis.publicInvocation.requestRef,
        publicRequestDigest: requestBasis.family === "legacy_root_public"
            ? requestBasis.rawRequest.subjectDigest
            : requestBasis.publicInvocation.requestDigest,
        publicRequestInvocationRef: input.invocation.publicRequestInvocationRef,
        workspaceId: input.workspaceBinding.workspaceId,
        workspaceBindingId: input.workspaceBinding.bindingId,
        workspaceBindingDigest: input.workspaceBinding.bindingDigest,
        catalogBasisRef: `graph-function-catalog://abiogenesis/${input.catalogView.catalogBasisDigest.slice("sha256:".length)}`,
        catalogBasisDigest: input.catalogView.catalogBasisDigest,
        catalogViewId: catalogViewRef(input.catalogView),
        catalogViewDigest: input.catalogView.viewDigest,
        catalogApplicationRefs: [...catalogApplications]
            .sort((left, right) => compareUnicodeCodeUnits(left.applicationRef, right.applicationRef))
            .map((application) => application.applicationRef),
        catalogApplicationDigests: [...catalogApplications]
            .sort((left, right) => compareUnicodeCodeUnits(left.applicationRef, right.applicationRef))
            .map((application) => application.applicationDigest),
        programRef: input.program.programRef,
        programDigest: input.invocation.programDigest,
        catalogHandle: selectedRow.handle,
        graphFunctionRef: input.graphFunction.name,
        graphFunctionDigest: input.invocation.graphFunctionDigest,
        selectedDefinitionRef: selectedRow.definitionRef,
        selectedDefinitionDigest: selectedRow.definitionDigest,
        gtlEntryCoordinate,
        gtlEntryTerm,
        inputContractRef: input.invocation.inputContractRef,
        inputContractDigest: executionResolution.inputContractDigest,
        inputContractOwner: executionResolution.inputContractOwner,
        outputContractRef: input.invocation.outputContractRef,
        outputContractDigest: executionResolution.outputContractDigest,
        outputContractOwner: executionResolution.outputContractOwner,
        productExecutionResolutionRef: executionResolution.resolutionRef,
        productExecutionResolutionDigest: executionResolution.resolutionDigest,
        programValidationRef: input.programValidation.validationRef,
        programValidationDigest,
        policyRef: input.policy.policyRef,
        policyDigest: input.policy.policyDigest,
        capabilityGrants: input.capabilityGrants,
        capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
        authorityRef: input.authority.authorityRef,
        authorityDigest: input.authority.authorityDigest,
        actorRef: input.authority.actorRef,
        publicStart,
        reentryBasis: input.reentryBasis ?? null,
        sourceResultBasis: input.sourceResultBasis ?? null,
        ...(input.runEnvironment === undefined ? {} : { runEnvironment: input.runEnvironment }),
    };
    const invocationAdmissionDigest = sha256Canonical(admissionBody);
    const invocationAdmissionRef = `invocation-admission://abiogenesis/${invocationAdmissionDigest.slice("sha256:".length)}`;
    // These two events encode one admission and must retain one native sample.
    const invocationAdmissionEventTime = sampleNativeEventTime();
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, input.artifactTruth.prefix, () => {
        const publicOperationEvent = admitRuntimeEvent(store, {
            kind: "public_operation_admitted",
            eventTime: invocationAdmissionEventTime,
            aggregateType: "workspace",
            aggregateId: input.workspaceBinding.bindingId,
            parentAggregateId: input.invocation.invocationRef,
            causationEventRefs: [...basis.causationEventRefs],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "workspace",
            basisId: input.authority.authorityRef,
            payload: {
                operationId: "abg.operation.run.invoke",
                memberKey: basis.memberKey,
                definitionDigest: basis.definitionDigest,
                variant: input.invocation.variant,
                invocationRef: input.invocation.invocationRef,
                invocationDigest: input.invocation.invocationDigest,
                actorRef: input.authority.actorRef,
                authorityRef: input.authority.authorityRef,
                authorityDigest: input.authority.authorityDigest,
                capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
                catalogApplicationRefs: admissionBody.catalogApplicationRefs,
                catalogApplicationDigests: admissionBody.catalogApplicationDigests,
                policyRef: input.policy.policyRef,
                policyDigest: input.policy.policyDigest,
                workspaceBindingId: input.workspaceBinding.bindingId,
                catalogBasisRef: admissionBody.catalogBasisRef,
                catalogBasisDigest: admissionBody.catalogBasisDigest,
                catalogViewId: catalogViewRef(input.catalogView),
                programRef: input.program.programRef,
                catalogHandle: admissionBody.catalogHandle,
                graphFunctionRef: input.graphFunction.name,
                selectedDefinitionRef: admissionBody.selectedDefinitionRef,
                selectedDefinitionDigest: admissionBody.selectedDefinitionDigest,
                programValidationRef: admissionBody.programValidationRef,
                programValidationDigest: admissionBody.programValidationDigest,
                gtlEntryCoordinate: admissionBody.gtlEntryCoordinate,
                gtlEntryTerm: admissionBody.gtlEntryTerm,
            },
        });
        const admissionEvent = admitRuntimeEvent(store, {
            kind: "invocation_admitted",
            eventTime: invocationAdmissionEventTime,
            aggregateType: "workspace",
            aggregateId: input.workspaceBinding.bindingId,
            parentAggregateId: input.invocation.invocationRef,
            causationEventRefs: [publicOperationEvent.eventId],
            correlationId: basis.correlationId,
            workflowVersion: "5.0.0",
            scopeClass: "workspace",
            basisId: invocationAdmissionRef,
            payload: {
                invocationAdmissionRef,
                invocationAdmissionDigest,
                ...admissionBody,
            },
        });
        return { publicOperationEvent, admissionEvent };
    });
    const { publicOperationEvent, admissionEvent } = committed.value;
    const admission = deepFreeze({
        kind: "invocation_admission",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        invocationAdmissionRef,
        invocationAdmissionDigest,
        ...admissionBody,
        publicOperationEventRef: publicOperationEvent.eventId,
        admissionEventRef: admissionEvent.eventId,
    });
    return deepFreeze({
        kind: "invocation_admission_receipt",
        schemaVersion: "5.0.0",
        admission,
        successorPrefix: committed.successorPrefix,
    });
}
export function admitInvocation(store, input, basis) {
    const { rawRequest, ...ownerInput } = input;
    return admitInvocationWithRequest(store, ownerInput, basis, { family: "legacy_root_public", rawRequest });
}
/**
 * ABG admission for the exact Public family. It consumes the admitted
 * invocation directly; no old Public request is synthesized or parsed.
 */
export function admitExactInvocation(store, input, basis) {
    const { publicInvocation, ...ownerInput } = input;
    return admitInvocationWithRequest(store, ownerInput, basis, { family: "exact_public_definition", publicInvocation });
}
import { reconstructCatalogApplication } from "../product/declaration_application.js";
