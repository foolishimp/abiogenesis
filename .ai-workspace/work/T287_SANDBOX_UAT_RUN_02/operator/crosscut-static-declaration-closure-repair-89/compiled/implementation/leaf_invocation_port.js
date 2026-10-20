import { isQualificationAssessmentInput, prepareQualificationAssessment } from "../validator/qualification.js";
import { graphFunctionSemanticsOwner } from "../product/execution_resolution.js";
import { projectHistoricalGraphCallSourceAtDurablePrefix } from "../abg/project_read_ports.js";
import { authenticateNativeWorkReacquisition, nativeWorkReacquisitionResultMatches } from "../abg/native_work_reacquisition.js";
import { QUALIFICATION_IDS as qualificationIds } from "../gtl/self_conformance.js";
import { NATIVE_WORK_REACQUISITION_IDS as reacquireIds } from "../product/worksite_command_execution.js";
import { resolveNativeWorkspaceAssessmentSchema, parseNativeWorkspaceAssessmentResult } from "../product/native_workspace_assessment.js";
import { types } from "node:util";
import { rehydrateInvocationAdmissionAtPrefix } from "../abg/invocation_admission.js";
import { isNativeWorkspaceWorkTask, nativeWorkspaceWorkAuthorityMatches, nativeWorkspaceWorkGraphFunctionRef, NATIVE_WORKSPACE_WORK_IDS as nativeIds } from "../product/native_workspace_work.js";
import { isRecord } from "../shared/admission_predicates.js";
import { SELF_CONFORMANCE_IDS } from "../gtl/self_conformance.js";
import { QUALIFICATION_IMPLEMENTATION_REFS, projectQualificationConsumer, projectNativeRuntimeAssessment, projectExactCandidateQualification } from "../abg/qualification_proof.js";
import { qualificationResultRelation } from "../validator/self_conformance_semantics.js";
import { evaluateSelfConformance } from "../validator/self_conformance.js";
import { resolveSelfConformanceOwner } from "../validator/self_conformance_basis.js";
import { isSelfConformanceInput, isSelfConformanceResult } from "../validator/self_conformance_contracts.js";
import { SEMANTIC_IMPLEMENTATION_REFS } from "../gtl/semantic_stage_identity.js";
import { WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS } from "../product/worksite_construction_recovery.js";
import { authenticateWorksitePreservedResultBasis } from "../abg/worksite_construction_recovery.js";
import { authenticateSemanticStageBasis } from "../abg/semantic_stage.js";
import { authenticateSemanticJobBasis, validateWorksiteFileParentsPlanAtPrefix } from "../abg/semantic_job.js";
import { isWorksiteFileParentsRequest, constructWorksiteFileParentsAuthorization, WORKSITE_FILE_PARENTS_EFFECT_URI, WORKSITE_FILE_PARENTS_HANDLER_REF, WORKSITE_FILE_PARENTS_HANDLER_DIGEST } from "../product/worksite_effect.js";
import { REQUIREMENT_HANDOFF_IDS } from "../gtl/requirement_handoff.js";
import { projectRequirementHandoffCandidate } from "../abg/requirement_handoff.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { WORKSITE_REVISION_IDS } from "../product/worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS as forwardIds } from "../product/worksite_command_forward_identity.js";
import { authenticateWorksiteCommandForwardBasis } from "../abg/worksite_command_forward.js";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hasAdmittedProductInstall } from "../abg/environment_admission.js";
import { projectCCallCarrierPhaseAtPrefix } from "../abg/c_call.js";
import { constructWorksiteObservationCurrentFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "../abg/event_calculus.js";
import { authenticateNativeInstructionAssemblyBasis, hasAdmittedExecutionBasisAtPrefix, hasExactWorksiteCommandLeafSourceAtDurablePrefix, hasAdmittedImplementationSetAtPrefix, } from "../abg/execution_basis.js";
import { selectValidatedRuntimeEventPrefix, } from "../abg/event_prefix.js";
import { readRuntimeEventsAtDurablePrefix, reidentifyHistoricalDurablePrefixCoordinate, } from "../abg/event_store.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { inspectProductLeafSemanticsProjection, loadInstalledProductSemantics, projectInstalledLeafSemantics, } from "../product/semantics.js";
import { constructWorksiteEffectAuthorization, isWorksiteFileReplaceRequest, WORKSITE_FILE_REPLACE_EFFECT_URI, WORKSITE_FILE_REPLACE_HANDLER_DIGEST, WORKSITE_FILE_REPLACE_HANDLER_REF, } from "../product/worksite_effect.js";
import { sha256Canonical } from "../shared/digests.js";
import { sanitizeUndispatchedOwnerError, undispatchedOwnerDiagnosticRef } from "../abg/event_contract_profiles.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { validateActorProcessCarrierPair, prepareActorProcessInvocation, } from "../abg/actor_process.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import { constructLeafExecutionAuthority, isLeafExecutionAuthority, } from "./leaf_execution_authority.js";
export { constructLeafExecutionAuthority, isLeafExecutionAuthority, };
export function isClosedProbabilisticLeafInvocation(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }
    const receipt = value;
    const exchange = receipt.actorProcessExchange;
    const receiptKeys = Reflect.ownKeys(value);
    const exchangeKeys = typeof exchange === "object" && exchange !== null
        ? Reflect.ownKeys(exchange)
        : [];
    if (receiptKeys.length !== 5 ||
        !["actorProcessExchange", "candidate", "computeRegime", "kind", "schemaVersion"]
            .every((key) => receiptKeys.includes(key)) ||
        exchangeKeys.length !== 5 ||
        !["disposition", "kind", "observation", "request", "schemaVersion"]
            .every((key) => exchangeKeys.includes(key)) ||
        !isDeeplyFrozen(value))
        return false;
    const validated = validateActorProcessCarrierPair(exchange?.request, exchange?.observation);
    return receipt.kind === "leaf_invocation_receipt" &&
        receipt.schemaVersion === "5.0.0" &&
        receipt.computeRegime === "F_P" &&
        Object.hasOwn(receipt, "candidate") &&
        typeof exchange === "object" && exchange !== null &&
        exchange.kind === "actor_process_carrier_validation" &&
        exchange.schemaVersion === "5.0.0" &&
        exchange.disposition === "valid" &&
        validated.kind === "actor_process_carrier_validation" &&
        sha256Canonical(validated) ===
            sha256Canonical(exchange);
}
function hasExactDataFields(value, fields) {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string"))
        return false;
    const actual = keys.sort();
    const expected = [...fields].sort();
    return actual.length === expected.length &&
        actual.every((key, index) => key === expected[index]) &&
        actual.every((key) => {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            return descriptor !== undefined &&
                Object.hasOwn(descriptor, "value") &&
                descriptor.enumerable === true;
        });
}
function isDeterministicEvidenceCandidate(value) {
    return isRecord(value) &&
        hasExactDataFields(value, [
            "implementationRef",
            "inputDigest",
            "kind",
            "outputDigest",
            "schemaVersion",
        ]) &&
        value.kind === "deterministic_evidence_candidate" &&
        value.schemaVersion === "5.0.0" &&
        typeof value.implementationRef === "string" &&
        typeof value.inputDigest === "string" &&
        /^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) &&
        typeof value.outputDigest === "string" &&
        /^sha256:[a-f0-9]{64}$/u.test(value.outputDigest);
}
function isLeafRealizationCandidate(value, regime, validateSuccess, failureValueKind) {
    if (!isRecord(value) || !Array.isArray(value.evidenceCandidates))
        return false;
    if (!hasExactDataFields(value, value.disposition === "failure"
        ? [
            "diagnosticRef",
            "disposition",
            "evidenceCandidates",
            "kind",
            "resultCandidate",
            "schemaVersion",
        ]
        : [
            "disposition",
            "evidenceCandidates",
            "kind",
            "resultCandidate",
            "schemaVersion",
        ]))
        return false;
    const evidence = Array.from(value.evidenceCandidates);
    return value.kind === "leaf_realization_candidate" &&
        value.schemaVersion === "5.0.0" &&
        (value.disposition === "success" || value.disposition === "failure") &&
        (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
        evidence.every(isDeterministicEvidenceCandidate) &&
        isRecord(value.resultCandidate) &&
        value.resultCandidate.schemaVersion === "5.0.0" &&
        (value.disposition === "success"
            ? regime === "F_P" || validateSuccess(value.resultCandidate)
            : value.resultCandidate.kind === failureValueKind &&
                typeof value.diagnosticRef === "string" &&
                value.resultCandidate.diagnosticRef === value.diagnosticRef);
}
export function totalizeLeafImplementationFailure(input) {
    const { resolution, inputDigest, failureValueKind, failureClass } = input;
    const diagnosticRef = `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
    const resultCandidate = deepFreeze({
        kind: failureValueKind,
        schemaVersion: "5.0.0",
        failureClass,
        diagnosticRef,
    });
    const evidenceCandidates = resolution.computeRegime === "F_D"
        ? [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: resolution.implementationRef,
                inputDigest,
                outputDigest: sha256Canonical(resultCandidate),
            }]
        : [];
    const candidate = deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "failure",
        evidenceCandidates,
        resultCandidate,
        diagnosticRef,
    });
    if (!isLeafRealizationCandidate(candidate, resolution.computeRegime, () => false, failureValueKind)) {
        throw new TypeError("leaf implementation failure totalization violated its regime contract");
    }
    return candidate;
}
function closedInvocationReceipt(regime, candidate, exchange) {
    return regime === "F_P"
        ? deepFreeze({
            kind: "leaf_invocation_receipt",
            schemaVersion: "5.0.0",
            computeRegime: "F_P",
            candidate,
            actorProcessExchange: exchange,
        })
        : deepFreeze({
            kind: "leaf_invocation_receipt",
            schemaVersion: "5.0.0",
            computeRegime: "F_D",
            candidate,
            actorProcessExchange: null,
        });
}
function closedDeterministicOwnerReceipt(candidate, invoked) {
    return deepFreeze({
        kind: "closed_leaf_owner_receipt",
        schemaVersion: "5.0.0",
        computeRegime: "F_D",
        candidate,
        receipt: invoked ? closedInvocationReceipt("F_D", candidate, null) : null,
        workerContracts: null,
    });
}
function closedUndispatchedProbabilisticOwnerReceipt(candidate, ownerObservation) {
    return deepFreeze({
        kind: "closed_leaf_owner_receipt",
        schemaVersion: "5.0.0",
        computeRegime: "F_P",
        effectDisposition: "not_dispatched",
        ownerObservation,
        candidate,
        receipt: null,
        workerContracts: null,
    });
}
function closedProbabilisticOwnerReceipt(candidate, workerContracts, exchange) {
    return deepFreeze({
        kind: "closed_leaf_owner_receipt",
        schemaVersion: "5.0.0",
        computeRegime: "F_P",
        effectDisposition: "completed",
        candidate,
        receipt: closedInvocationReceipt("F_P", candidate, exchange),
        workerContracts,
    });
}
function ownerRefusal(code) {
    return deepFreeze({
        kind: "leaf_invocation_owner_refusal",
        schemaVersion: "5.0.0",
        code,
        diagnosticRef: `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
    });
}
const PROBABILISTIC_WORKER_REQUEST_FIELDS = Object.freeze([
    "actorRef",
    "implementationRef",
    "inputDigest",
    "instructionContractRef",
    "materializationPlanRef",
    "prompt",
    "rendererRef",
    "responseJsonSchema",
    "resultContractRef",
    "transportLane",
    "workerBindingRef",
]);
function isPreparedProbabilisticLeafInvocation(value) {
    return isRecord(value) &&
        hasExactDataFields(value, ["complete", "kind", "schemaVersion", "workerRequest"]) &&
        value.kind === "prepared_probabilistic_leaf_invocation" &&
        value.schemaVersion === "5.0.0" &&
        typeof value.complete === "function" &&
        isRecord(value.workerRequest) &&
        hasExactDataFields(value.workerRequest, Object.hasOwn(value.workerRequest, "responsePresentation")
            ? [...PROBABILISTIC_WORKER_REQUEST_FIELDS, "responsePresentation"] : PROBABILISTIC_WORKER_REQUEST_FIELDS) &&
        (!Object.hasOwn(value.workerRequest, "responsePresentation") || value.workerRequest.responsePresentation === "result_text") &&
        isDeeplyFrozen(value);
}
function preimageRefusal(code) {
    return deepFreeze({
        kind: "probabilistic_result_contract_preimage_refusal",
        schemaVersion: "5.0.0",
        code,
        diagnosticRef: `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
    });
}
// These closures stay at the invoking owner. Installed modules execute their
// declared realization/relation without acquiring a second copy of its history.
function nativeLeafProofOperations(implementationRef, value, occurrence, historicalSource, resources, preparation) {
    const exact = (input, supplied) => {
        if (input !== value || supplied !== occurrence)
            throw new TypeError("native proof operation differs from its exact admitted input/occurrence");
    };
    const basis = occurrence.qualificationOwnerBasis, native = occurrence.nativeWorkReacquisitionBasis;
    return Object.freeze({
        ...(implementationRef === qualificationIds.assessImplementation && preparation !== undefined ? { qualificationPreparation: (input, supplied) => { exact(input, supplied); return preparation; } } : {}),
        ...(implementationRef === SELF_CONFORMANCE_IDS.implementationRef && basis?.cCallRef === occurrence.cCallRef
            ? { qualificationSelfConformance: (input, supplied) => {
                    exact(input, supplied);
                    if (!isSelfConformanceInput(value))
                        return null;
                    const owner = resolveSelfConformanceOwner(basis, value, true, resources);
                    return owner === null ? null : evaluateSelfConformance(value, owner, resources);
                } } : {}),
        ...(implementationRef === qualificationIds.verdictImplementation && basis?.cCallRef === occurrence.cCallRef
            ? { qualificationVerdict: (input, supplied) => {
                    exact(input, supplied);
                    return projectExactCandidateQualification(basis, value, true, resources);
                } } : {}),
        ...(implementationRef === qualificationIds.runtimeAssessImplementation && basis?.cCallRef === occurrence.cCallRef
            ? { qualificationAssessment: (input, supplied) => {
                    exact(input, supplied);
                    return projectNativeRuntimeAssessment(basis, value, true, resources);
                } } : {}),
        ...(implementationRef === reacquireIds.implementationRef && native?.cCallRef === occurrence.cCallRef
            ? { nativeWorkReacquisition: (input, supplied) => {
                    exact(input, supplied);
                    return authenticateNativeWorkReacquisition(native, value, true, historicalSource);
                } } : {}),
    });
}
function nativeOccurrenceVerifier(occurrence) {
    return (supplied) => {
        if (supplied !== occurrence)
            return false;
        const basis = occurrence.nativeInstructionAssemblyBasis;
        const owner = basis === undefined ? null : authenticateNativeInstructionAssemblyBasis(basis);
        return owner !== null && ["cCallRef", "runId", "graphCallId", "frameId", "programLocusRef", "taskOrdinal", "attempt"]
            .every(key => owner.call[key] === occurrence[key]);
    };
}
function nativeJudgmentProofOperations(predicateRef, input, output, currentOwnerPrefix, historicalSource, resources, preparation) {
    const historical = historicalSource === undefined ? {} : { historicalGraphCallSource: () => currentOwnerPrefix === undefined ? null : projectHistoricalGraphCallSourceAtDurablePrefix(currentOwnerPrefix, historicalSource) };
    if (predicateRef === qualificationIds.assessPredicate)
        return Object.freeze({ ...historical,
            qualificationJudgment: () => preparation !== undefined && sha256Canonical(input) === preparation.request.inputDigest && preparation.matches(preparation.input, output),
            qualificationRequest: () => preparation !== undefined && sha256Canonical(input) === preparation.request.inputDigest && preparation.matches(preparation.input, output) ? preparation.request : null,
        });
    if (predicateRef === SELF_CONFORMANCE_IDS.judgmentPredicateRef)
        return Object.freeze({ ...historical,
            qualificationSelfConformance: () => {
                if (!isSelfConformanceInput(input) || !isSelfConformanceResult(output))
                    return null;
                const owner = resolveSelfConformanceOwner(output.owner.nativeBasis, input, false, resources);
                return owner === null ? null : evaluateSelfConformance(input, owner, resources);
            },
        });
    if (predicateRef === reacquireIds.predicateRef)
        return Object.freeze({ ...historical,
            nativeWorkReacquisition: () => nativeWorkReacquisitionResultMatches(input, output, currentOwnerPrefix, historicalSource),
        });
    if (predicateRef === qualificationIds.verdictPredicate)
        return Object.freeze({ ...historical,
            qualificationVerdict: () => {
                if (!isRecord(output) || !isRecord(output.nativeBasis))
                    return null;
                const original = output.nativeBasis;
                const basis = currentOwnerPrefix === undefined ? original : { ...original,
                    predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix) };
                return projectExactCandidateQualification(basis, input, false, resources);
            },
        });
    if (predicateRef !== qualificationIds.runtimeAssessPredicate)
        return Object.freeze(historical);
    return Object.freeze({ ...historical,
        qualificationAssessment: () => {
            if (!isRecord(output) || !isRecord(output.nativeBasis))
                return null;
            const original = output.nativeBasis;
            const basis = currentOwnerPrefix === undefined ? original : { ...original,
                predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix) };
            const selected = currentOwnerPrefix === undefined || !isRecord(input) || !isRecord(input.proof) ? input : { ...input,
                proof: { ...input.proof, prefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, input.proof.prefix) } };
            return projectNativeRuntimeAssessment(basis, selected, false, resources);
        },
    });
}
export async function invokeLeafOwnerBoundary(input) {
    const { resolution, inputDigest, failureValueKind } = input;
    const totalizedFailure = (failureClass) => totalizeLeafImplementationFailure({
        resolution,
        inputDigest,
        failureValueKind,
        failureClass,
    });
    const undispatched = (failureClass, stage, reason, error) => {
        const diagnosticRef = undispatchedOwnerDiagnosticRef(stage, reason, error);
        const original = totalizedFailure(failureClass);
        const candidate = deepFreeze({ ...original, diagnosticRef,
            resultCandidate: { ...original.resultCandidate, diagnosticRef } });
        const o = input.occurrence;
        const ownerObservation = deepFreeze({
            kind: "undispatched_owner_observation", schemaVersion: "5.0.0",
            cCallRef: o.cCallRef, runId: o.runId, graphCallId: o.graphCallId, frameId: o.frameId,
            programLocusRef: o.programLocusRef, taskOrdinal: o.taskOrdinal, attempt: o.attempt,
            implementationRef: resolution.implementationRef, inputContractRef: resolution.inputContractRef,
            outputContractRef: resolution.outputContractRef, inputDigest, stage, reason,
            ...sanitizeUndispatchedOwnerError(reason === "thrown" ? error : null), diagnosticRef,
        });
        return closedUndispatchedProbabilisticOwnerReceipt(candidate, ownerObservation);
    };
    const carriesWorksiteAuthority = resolution.implementationRef === nativeIds.implementationRef ||
        isWorksiteFileReplaceRequest(input.value) || isWorksiteFileParentsRequest(input.value) ||
        input.occurrence.executionAuthority !== null;
    let authorityValid = false;
    let authorityThrew = false;
    let authorityError;
    try {
        authorityValid = await input.verifyAuthority() &&
            sha256Canonical(input.value) === inputDigest &&
            (![forwardIds.prepareImplementationRef, forwardIds.implementationRef].includes(resolution.implementationRef) ||
                (input.occurrence.worksiteCommandForwardBasis !== undefined &&
                    input.occurrence.worksiteCommandForwardBasis.cCall.cCallRef === input.occurrence.cCallRef &&
                    authenticateWorksiteCommandForwardBasis(input.occurrence.worksiteCommandForwardBasis, true) !== null)) &&
            (resolution.implementationRef !== REQUIREMENT_HANDOFF_IDS.implementationRef ||
                (input.occurrence.requirementHandoffBasis !== undefined &&
                    input.occurrence.requirementHandoffBasis.cCall.cCallRef === input.occurrence.cCallRef &&
                    projectRequirementHandoffCandidate(input.occurrence.requirementHandoffBasis, input.value) !== null)) &&
            (!SEMANTIC_IMPLEMENTATION_REFS.includes(resolution.implementationRef) ||
                (input.occurrence.semanticStageBasis !== undefined &&
                    ((input.occurrence.semanticStageBasis.lifecyclePublication ?? input.occurrence.semanticStageBasis.publication).semanticJobLifecycle !== undefined
                        ? authenticateSemanticJobBasis(input.occurrence.semanticStageBasis) : authenticateSemanticStageBasis(input.occurrence.semanticStageBasis)) !== null)) &&
            (!WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS.includes(resolution.implementationRef) ||
                (input.occurrence.worksitePreservedResultBasis !== undefined &&
                    input.occurrence.worksitePreservedResultBasis.cCall.cCallRef === input.occurrence.cCallRef &&
                    authenticateWorksitePreservedResultBasis(input.occurrence.worksitePreservedResultBasis) !== null)) &&
            (!carriesWorksiteAuthority ||
                isLeafExecutionAuthority(input.occurrence.executionAuthority));
    }
    catch (error) {
        authorityValid = false;
        authorityThrew = true;
        authorityError = error;
    }
    if (!authorityValid) {
        return resolution.computeRegime === "F_D"
            ? closedDeterministicOwnerReceipt(totalizedFailure("implementation_exception"), false)
            : undispatched("implementation_exception", "authority_verification", authorityThrew ? "thrown" : "refused", authorityError);
    }
    if (resolution.computeRegime === "F_D") {
        let implementation;
        try {
            implementation = await input.loadImplementation();
        }
        catch {
            implementation = null;
        }
        if (typeof implementation !== "function") {
            return closedDeterministicOwnerReceipt(totalizedFailure("implementation_exception"), false);
        }
        let implementationOutput;
        try {
            implementationOutput = await implementation(input.value, input.occurrence, resolution, inputDigest, nativeLeafProofOperations(resolution.implementationRef, input.value, input.occurrence, input.historicalSource, input.qualificationResources, input.qualificationPreparation));
        }
        catch {
            return closedDeterministicOwnerReceipt(totalizedFailure("implementation_exception"), false);
        }
        let admittedCandidate;
        try {
            admittedCandidate = admitIJsonValue(implementationOutput, "deterministic leaf owner output");
        }
        catch {
            admittedCandidate = null;
        }
        let valid = false;
        try {
            valid = isLeafRealizationCandidate(admittedCandidate, "F_D", input.validateSuccess, failureValueKind);
        }
        catch {
            valid = false;
        }
        return closedDeterministicOwnerReceipt(valid
            ? admittedCandidate
            : totalizedFailure("malformed_return"), true);
    }
    let workerContracts;
    try {
        workerContracts = input.resolveWorkerContracts(resolution, input.value);
    }
    catch (error) {
        return undispatched("implementation_exception", "worker_contract_resolution", "thrown", error);
    }
    if (workerContracts === null) {
        return undispatched("implementation_exception", "worker_contract_resolution", "missing_contracts");
    }
    let implementation;
    try {
        implementation = await input.loadImplementation();
    }
    catch (error) {
        return undispatched("implementation_exception", "implementation_load", "thrown", error);
    }
    if (typeof implementation !== "function") {
        return undispatched("implementation_exception", "implementation_load", "missing_export");
    }
    const actorPreparation = prepareActorProcessInvocation(input.value, input.occurrence, input.contractByRef);
    let preparedOutput;
    try {
        preparedOutput = await implementation(input.value, input.occurrence, actorPreparation.prepareInstructionAssembly, [WORKSITE_COMMAND_EXECUTION_IDS.implementationRef, WORKSITE_REVISION_IDS.implementationRef].includes(resolution.implementationRef)
            ? nativeOccurrenceVerifier(input.occurrence) : undefined, nativeLeafProofOperations(resolution.implementationRef, input.value, input.occurrence, input.historicalSource, input.qualificationResources, input.qualificationPreparation));
    }
    catch (error) {
        return undispatched("implementation_exception", "preparation", "thrown", error);
    }
    if (!isPreparedProbabilisticLeafInvocation(preparedOutput)) {
        return undispatched("malformed_return", "preparation", "malformed_preparation");
    }
    const prepared = preparedOutput;
    return deepFreeze({
        kind: "prepared_probabilistic_leaf_owner_invocation",
        invokeActorProcess: actorPreparation.invokeActorProcess,
        schemaVersion: "5.0.0",
        workerRequest: prepared.workerRequest,
        workerContracts,
        complete(exchange) {
            let completedOutput;
            try {
                completedOutput = prepared.complete(exchange);
            }
            catch {
                return closedProbabilisticOwnerReceipt(totalizedFailure("implementation_exception"), workerContracts, exchange);
            }
            const finalize = (candidateOutput) => {
                try {
                    const admittedCandidate = admitIJsonValue(candidateOutput, "probabilistic leaf completion output");
                    const valid = isLeafRealizationCandidate(admittedCandidate, "F_P", input.validateSuccess, failureValueKind);
                    return closedProbabilisticOwnerReceipt(valid
                        ? admittedCandidate
                        : totalizedFailure("malformed_return"), workerContracts, exchange);
                }
                catch {
                    return closedProbabilisticOwnerReceipt(totalizedFailure("malformed_return"), workerContracts, exchange);
                }
            };
            if (completedOutput instanceof Promise) {
                return completedOutput.then(finalize, () => closedProbabilisticOwnerReceipt(totalizedFailure("implementation_exception"), workerContracts, exchange));
            }
            return finalize(completedOutput);
        },
    });
}
export function isAdmittedLeafInvocationPort(value) {
    const candidate = value;
    let exactLoadedCapability = false;
    try {
        exactLoadedCapability =
            typeof candidate.isExactLoadedCapability === "function" &&
                candidate.isExactLoadedCapability.call(value) === true;
    }
    catch {
        exactLoadedCapability = false;
    }
    return exactLoadedCapability &&
        candidate.kind === "admitted_leaf_invocation_port" &&
        Array.isArray(candidate.ownerInstallIds) &&
        candidate.ownerInstallIds.length > 0 &&
        candidate.ownerInstallIds.every((installId) => typeof installId === "string" && installId.length > 0) &&
        typeof candidate.implementationSetRef === "string" &&
        candidate.implementationSetRef.length > 0 &&
        typeof candidate.implementationSetDigest === "string" &&
        candidate.implementationSetDigest.startsWith("sha256:") &&
        Array.isArray(candidate.publicationDigests) &&
        candidate.publicationDigests.length > 0 &&
        candidate.publicationDigests.every((digest) => typeof digest === "string" && digest.startsWith("sha256:")) &&
        typeof candidate.hasOwnerCapability === "function" &&
        typeof candidate.isAdmittedResolution === "function" &&
        typeof candidate.forGraphFunction === "function" &&
        typeof candidate.graphFunctionByRef === "function" &&
        typeof candidate.closureContractByRef === "function" &&
        typeof candidate.contractValueKindByRef === "function" &&
        typeof candidate.validateContractValueByRef === "function" &&
        typeof candidate.contractValueKind === "function" &&
        typeof candidate.validateContractValue === "function" &&
        typeof candidate.resolveJudgmentRelation === "function" &&
        typeof candidate.validateResultEvidenceLineage === "function" &&
        typeof candidate.verifyProbabilisticResultContractPreimage === "function" &&
        typeof candidate.invoke === "function";
}
export function isAdmittedLeafInvocationResolution(port, resolution) {
    if (!isAdmittedLeafInvocationPort(port))
        return false;
    const candidate = port;
    return candidate.isAdmittedResolution(resolution);
}
function exactOwnerPublication(resolution, coordinate) {
    const matches = resolution.declarationPublications.filter((publication) => publication.owningProductId === coordinate.productId &&
        publication.moduleRef === coordinate.moduleRef &&
        modulePublicationSemanticDigest(publication) ===
            coordinate.publicationDigest);
    return matches.length === 1 ? matches[0] : null;
}
function exactOwnerInstall(resolution, coordinate) {
    const matches = resolution.ownerInstalls.filter((install) => install.installId === coordinate.installId &&
        install.productId === coordinate.productId);
    return matches.length === 1 ? matches[0] : null;
}
function exactOwnerBinding(resolution, coordinate) {
    const install = exactOwnerInstall(resolution, coordinate);
    const publication = exactOwnerPublication(resolution, coordinate);
    return install !== null && publication !== null &&
        install.productContentDigest === publication.productContentDigest &&
        install.manifestDigest === publication.productManifestDigest
        ? { install, publication }
        : null;
}
// Optional identity evidence for these two immutable declaration lookups only.
// Foreign/raw callbacks always retain a fresh physical acquisition.
function isFixedDeclarationData(value, seen = new Set()) {
    if (typeof value === "function")
        return false;
    if (typeof value !== "object" || value === null)
        return true;
    if (types.isProxy(value) || !Object.isFrozen(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null)
        return false;
    if (seen.has(value))
        return true;
    seen.add(value);
    return Reflect.ownKeys(value).every(key => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return "value" in descriptor && isFixedDeclarationData(descriptor.value, seen);
    });
}
const declarationLookupPairs = new WeakMap();
export function hasOwnedDeclarationLookups(graphFunctionByRef, closureContractByRef) {
    return declarationLookupPairs.get(graphFunctionByRef) === closureContractByRef;
}
export async function constructAdmittedLeafInvocationPort(authority) {
    const inspected = inspectProductLeafSemanticsProjection(authority.semanticsProjection);
    const selectedGraphFunctionRef = authority.graphFunctionRef ??
        authority.executionResolution.declarationClosure.selectedGraphFunctionRef;
    const semanticsOwner = graphFunctionSemanticsOwner(authority.executionResolution.declarationClosure, selectedGraphFunctionRef, coordinate => exactOwnerBinding(authority.executionResolution, coordinate));
    if (semanticsOwner === null)
        throw new TypeError("leaf semantics lacks its declared GraphFunction owner");
    const semanticsBinding = exactOwnerBinding(authority.executionResolution, semanticsOwner);
    const everyOwnerIsAdmitted = authority.executionResolution.ownerInstalls
        .every((install) => hasAdmittedProductInstall(authority.artifactTruth, install));
    if (inspected === null ||
        semanticsBinding === null ||
        !everyOwnerIsAdmitted ||
        !hasAdmittedImplementationSetAtPrefix(authority.prefix, authority.implementationSet) ||
        inspected.projection.installId !== semanticsBinding.install.installId ||
        inspected.projection.productContentDigest !==
            semanticsBinding.install.productContentDigest ||
        inspected.projection.manifestDigest !==
            semanticsBinding.install.manifestDigest ||
        inspected.projection.publicationDigest !==
            semanticsOwner.publicationDigest ||
        inspected.projection.bindingRef !== semanticsOwner.declarationRef ||
        inspected.projection.packageName !==
            semanticsBinding.install.packageName ||
        inspected.projection.packageVersion !==
            semanticsBinding.install.packageVersion ||
        !(await inspected.runtime.verifyInstalledContent())) {
        throw new TypeError("leaf invocation port requires the exact owner-selected admitted execution closure");
    }
    const semantics = inspected.runtime;
    const modules = new Map();
    function uniqueContractByRef(contractRef) {
        const ownerMatches = authority.executionResolution.declarationClosure
            .contractOwners.filter((owner) => owner.declarationRef === contractRef);
        if (ownerMatches.length !== 1)
            return null;
        const owner = exactOwnerBinding(authority.executionResolution, ownerMatches[0]);
        if (owner === null)
            return null;
        const matches = owner.publication.contracts.filter((contract) => contract.contractRef === contractRef);
        const contract = matches.length === 1 ? matches[0] : undefined;
        return contract !== undefined && contract.valueKind.length > 0
            ? contract
            : null;
    }
    function contractForLeafSlot(contractRef, contractKind) {
        const contract = uniqueContractByRef(contractRef);
        if (contract === null)
            return null;
        // C<A,B> binds its output carrier by exact admitted reference. Its original
        // declaration may also serve as another stage's input; failure stays distinct.
        return contractKind === "output"
            ? authority.implementationSet.rows.some((row) => row.outputContractRef === contractRef)
                ? contract
                : null
            : contract.contractKind === "failure" ? contract : null;
    }
    function graphFunctionByRef(graphFunctionRef) {
        const ownerMatches = authority.executionResolution.declarationClosure
            .graphFunctionOwners.filter((owner) => owner.declarationRef === graphFunctionRef);
        if (ownerMatches.length !== 1)
            return null;
        const owner = exactOwnerBinding(authority.executionResolution, ownerMatches[0]);
        if (owner === null)
            return null;
        const matches = owner.publication.graphFunctions.filter((candidate) => candidate.name === graphFunctionRef);
        return matches.length === 1 ? matches[0] : null;
    }
    function closureContractByRef(closureContractRef) {
        const ownerMatches = authority.executionResolution.declarationClosure
            .closureContractOwners.filter((owner) => owner.declarationRef === closureContractRef);
        if (ownerMatches.length !== 1)
            return null;
        const owner = exactOwnerBinding(authority.executionResolution, ownerMatches[0]);
        if (owner === null)
            return null;
        const matches = owner.publication.closureContracts.filter((candidate) => candidate.closureContractRef === closureContractRef);
        return matches.length === 1 ? matches[0] : null;
    }
    function implementationOwner(resolution) {
        const coordinates = authority.executionResolution.declarationClosure
            .implementationBindingOwners.filter((coordinate) => coordinate.declarationRef === resolution.implementationBindingRef &&
            coordinate.productId === resolution.implementationOwnerProductId &&
            coordinate.publicationDigest ===
                resolution.implementationPublicationDigest);
        if (coordinates.length !== 1)
            return null;
        const binding = exactOwnerBinding(authority.executionResolution, coordinates[0]);
        if (binding === null)
            return null;
        const publishedBindings = binding.publication.implementationBindings.filter((candidate) => candidate.bindingRef === resolution.implementationBindingRef &&
            candidate.implementationRef === resolution.implementationRef &&
            candidate.packageName === resolution.packageName &&
            candidate.packageVersion === resolution.packageVersion &&
            candidate.modulePath === resolution.modulePath &&
            candidate.namedSymbol === resolution.namedSymbol);
        return publishedBindings.length === 1 &&
            binding.install.packageName === resolution.packageName &&
            binding.install.packageVersion === resolution.packageVersion
            ? { coordinate: coordinates[0], ...binding }
            : null;
    }
    async function loadModule(resolution) {
        const owner = implementationOwner(resolution);
        if (owner === null) {
            throw new TypeError("leaf implementation lacks its selected owner");
        }
        const exactPath = resolve(owner.install.installedRoot, resolution.modulePath);
        const relation = relative(owner.install.installedRoot, exactPath);
        if (relation.length === 0 || relation.startsWith("..") || isAbsolute(relation)) {
            throw new TypeError("leaf implementation module escapes the admitted Product install");
        }
        let loaded = modules.get(exactPath);
        if (loaded === undefined) {
            loaded = import(pathToFileURL(exactPath).href);
            modules.set(exactPath, loaded);
        }
        return loaded;
    }
    function exactAdmittedResolution(resolution) {
        const resolutionDigest = sha256Canonical(resolution);
        const matches = authority.implementationSet.rows.filter((row) => sha256Canonical(row) === resolutionDigest);
        return matches.length === 1 ? matches[0] : null;
    }
    function hasExactWorksiteLeafExecutionAuthority(call, resolution) {
        const executionAuthority = call.occurrence.executionAuthority;
        const parents = isWorksiteFileParentsRequest(call.input);
        const native = isNativeWorkspaceWorkTask(call.input);
        const effectUri = parents ? WORKSITE_FILE_PARENTS_EFFECT_URI : WORKSITE_FILE_REPLACE_EFFECT_URI;
        if ((!native && !parents && !isWorksiteFileReplaceRequest(call.input)) ||
            !isLeafExecutionAuthority(executionAuthority)) {
            return false;
        }
        const owner = implementationOwner(resolution);
        const graphFunction = graphFunctionByRef(resolution.graphFunctionRef);
        if (owner === null || graphFunction === null)
            return false;
        let authorityPrefix;
        let runtimePrefix;
        try {
            const events = readRuntimeEventsAtDurablePrefix(executionAuthority.predecessorPrefix, { requireCurrent: true });
            authorityPrefix = selectValidatedRuntimeEventPrefix(events);
            runtimePrefix = selectValidatedRuntimeEventPrefix(events, {
                runId: executionAuthority.cCall.runId,
            });
        }
        catch {
            return false;
        }
        if (native) {
            const invocation = rehydrateInvocationAdmissionAtPrefix(authorityPrefix, executionAuthority.executionBasis.invocationAdmissionRef);
            return invocation !== null && invocation.capabilityGrants.some(grant => sha256Canonical(grant) === sha256Canonical(call.input.capabilityGrant)) &&
                nativeWorkspaceWorkAuthorityMatches(call.input, executionAuthority) &&
                graphFunction.name === nativeWorkspaceWorkGraphFunctionRef(call.input) && graphFunction.effects.includes(nativeIds.effectUri) &&
                projectCCallCarrierPhaseAtPrefix(runtimePrefix, executionAuthority.cCall)?.phase === "selected_no_evidence" &&
                hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionAuthority.executionBasis) &&
                hasAdmittedImplementationSetAtPrefix(authorityPrefix, executionAuthority.implementationSet) &&
                sha256Canonical(resolution) === executionAuthority.implementationResolutionDigest &&
                call.occurrence.cCallRef === executionAuthority.cCallRef &&
                call.occurrence.runId === executionAuthority.cCall.runId &&
                call.occurrence.graphCallId === executionAuthority.cCall.graphCallId &&
                call.occurrence.frameId === executionAuthority.cCall.frameId &&
                call.occurrence.programLocusRef === executionAuthority.cCall.programLocusRef &&
                call.occurrence.taskOrdinal === executionAuthority.cCall.taskOrdinal &&
                call.occurrence.attempt === executionAuthority.cCall.attempt;
        }
        const resolutionDigest = sha256Canonical(resolution);
        const requestDigest = sha256Canonical(call.input);
        const carrierResolutionDigest = sha256Canonical(executionAuthority.implementationResolution);
        const authorization = parents ? constructWorksiteFileParentsAuthorization({
            workspaceBinding: executionAuthority.workspaceBinding,
            request: call.input,
            executionBasis: executionAuthority.executionBasis,
            cCall: executionAuthority.cCall,
            implementationSet: executionAuthority.implementationSet,
        }) : constructWorksiteEffectAuthorization({
            workspaceBinding: executionAuthority.workspaceBinding,
            request: call.input,
            executionBasis: executionAuthority.executionBasis,
            cCall: executionAuthority.cCall,
            implementationSet: executionAuthority.implementationSet,
        });
        const phase = projectCCallCarrierPhaseAtPrefix(runtimePrefix, executionAuthority.cCall);
        const observationCurrent = parents
            ? validateWorksiteFileParentsPlanAtPrefix(authorityPrefix, call.input, executionAuthority.programPublication)
            : holdsAt(deriveRuntimeEventCalculusProjection(runtimePrefix), constructWorksiteObservationCurrentFluent(call.input.predecessorObservation.observationRef));
        return authorization.kind === (parents ? "worksite_file_parents_authorization" : "worksite_effect_authorization") &&
            phase?.phase === "selected_no_evidence" &&
            observationCurrent &&
            hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionAuthority.executionBasis) &&
            hasAdmittedImplementationSetAtPrefix(authorityPrefix, executionAuthority.implementationSet) &&
            requestDigest === call.inputDigest &&
            requestDigest === executionAuthority.executionBasis.rawInputDigest &&
            sha256Canonical(executionAuthority.executionBasis.rawInputValue) === requestDigest &&
            executionAuthority.actorRef ===
                executionAuthority.workspaceBinding.authorizedActorRef &&
            executionAuthority.actorRef === executionAuthority.executionBasis.actorRef &&
            executionAuthority.workspaceBindingIdentity ===
                executionAuthority.executionBasis.workspaceBindingId &&
            executionAuthority.workspaceBindingDigest ===
                executionAuthority.executionBasis.workspaceBindingDigest &&
            executionAuthority.programRef === executionAuthority.executionBasis.programRef &&
            executionAuthority.programDigest ===
                executionAuthority.executionBasis.programDigest &&
            executionAuthority.graphFunctionRef ===
                executionAuthority.executionBasis.graphFunctionRef &&
            executionAuthority.graphFunctionDigest ===
                executionAuthority.executionBasis.graphFunctionDigest &&
            graphFunction.name === executionAuthority.graphFunctionRef &&
            sha256Canonical(graphFunction) ===
                executionAuthority.graphFunctionDigest &&
            graphFunction.effects.includes(effectUri) &&
            call.input.workspaceBindingIdentity ===
                executionAuthority.workspaceBindingIdentity &&
            call.input.workspaceBindingDigest ===
                executionAuthority.workspaceBindingDigest &&
            call.input.capabilityGrant.actorRef === executionAuthority.actorRef &&
            call.input.capabilityGrant.grantRef ===
                executionAuthority.capabilityGrantRef &&
            call.input.capabilityGrant.grantDigest ===
                executionAuthority.capabilityGrantDigest &&
            call.input.capabilityGrant.scopeRef ===
                executionAuthority.workspaceBindingIdentity &&
            call.input.capabilityGrant.scopeDigest ===
                executionAuthority.workspaceBindingDigest &&
            call.occurrence.cCallRef === executionAuthority.cCallRef &&
            call.occurrence.runId === executionAuthority.cCall.runId &&
            call.occurrence.graphCallId === executionAuthority.cCall.graphCallId &&
            call.occurrence.frameId === executionAuthority.cCall.frameId &&
            call.occurrence.programLocusRef ===
                executionAuthority.cCall.programLocusRef &&
            call.occurrence.taskOrdinal === executionAuthority.cCall.taskOrdinal &&
            call.occurrence.attempt === executionAuthority.cCall.attempt &&
            executionAuthority.cCall.callClass === "leaf" &&
            executionAuthority.cCall.regime === "F_D" &&
            executionAuthority.cCall.basisId === executionAuthority.executionBasisRef &&
            executionAuthority.cCall.graphFunctionRef ===
                executionAuthority.graphFunctionRef &&
            executionAuthority.cCall.implementationSetRef ===
                executionAuthority.implementationSetRef &&
            executionAuthority.cCall.implementationRequirementKey ===
                resolution.requirementKey &&
            executionAuthority.cCall.implementationBindingRef ===
                resolution.implementationBindingRef &&
            executionAuthority.cCall.implementationRef === resolution.implementationRef &&
            executionAuthority.cCall.inputContractRef === resolution.inputContractRef &&
            executionAuthority.cCall.outputContractRef === resolution.outputContractRef &&
            executionAuthority.cCall.failureContractRef === resolution.failureContractRef &&
            executionAuthority.cCall.refusalContractRef === resolution.refusalContractRef &&
            executionAuthority.implementationSetRef ===
                authority.implementationSet.implementationSetRef &&
            executionAuthority.implementationSetDigest ===
                authority.implementationSet.implementationSetDigest &&
            sha256Canonical(executionAuthority.implementationSet) === sha256Canonical(authority.implementationSet) &&
            carrierResolutionDigest === resolutionDigest &&
            executionAuthority.implementationResolutionDigest === resolutionDigest &&
            executionAuthority.implementationResolutionRef ===
                `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}` &&
            executionAuthority.leafResolutionCandidateRef ===
                resolution.leafResolutionCandidateRef &&
            executionAuthority.leafResolutionCandidateDigest ===
                resolution.leafResolutionCandidateDigest &&
            executionAuthority.implementationBindingRef ===
                resolution.implementationBindingRef &&
            executionAuthority.implementationBindingDigest ===
                resolution.implementationBindingDigest &&
            executionAuthority.implementationRef === resolution.implementationRef &&
            executionAuthority.implementationOwnerRef ===
                resolution.implementationOwnerProductId &&
            executionAuthority.implementationOwnerRef === owner.coordinate.productId &&
            resolution.implementationPublicationDigest ===
                owner.coordinate.publicationDigest &&
            resolution.packageName === owner.install.packageName &&
            resolution.packageVersion === owner.install.packageVersion &&
            owner.coordinate.declarationKind === "implementation_binding" &&
            owner.coordinate.declarationRef === resolution.implementationBindingRef &&
            executionAuthority.effectUri === effectUri &&
            executionAuthority.handlerRef === (parents ? WORKSITE_FILE_PARENTS_HANDLER_REF : WORKSITE_FILE_REPLACE_HANDLER_REF) &&
            executionAuthority.handlerDigest === (parents ? WORKSITE_FILE_PARENTS_HANDLER_DIGEST : WORKSITE_FILE_REPLACE_HANDLER_DIGEST);
    }
    function resolveWorkerContracts(resolution, input) {
        const admittedResolution = exactAdmittedResolution(resolution);
        if (admittedResolution === null)
            return null;
        return semantics.resolveProbabilisticWorkerContracts({
            inputContractRef: admittedResolution.inputContractRef,
            outputContractRef: admittedResolution.outputContractRef,
            input,
        });
    }
    function verifyContractPreimage(receiver, input, verified) {
        try {
            const admittedResolution = exactAdmittedResolution(input.resolution);
            if (receiver !== port ||
                !isAdmittedLeafInvocationPort(port) ||
                input.resolution.computeRegime !== "F_P" ||
                !everyOwnerIsAdmitted ||
                !hasAdmittedImplementationSetAtPrefix(authority.prefix, authority.implementationSet) ||
                admittedResolution === null) {
                return preimageRefusal("unadmitted_resolution");
            }
            if (sha256Canonical(input.input) !==
                input.inputDigest ||
                !port.validateContractValueByRef(input.resolution.inputContractRef, input.input)) {
                return preimageRefusal("input_contract_refused");
            }
            const workerContracts = resolveWorkerContracts(input.resolution, input.input);
            if (workerContracts === null ||
                workerContracts.instructionContractRef !==
                    input.instructionContractRef ||
                workerContracts.resultContractRef !== input.rawResultContractRef) {
                return preimageRefusal("contract_identity_mismatch");
            }
            const assessment = admittedResolution.implementationRef === nativeIds.implementationRef && isNativeWorkspaceWorkTask(input.input)
                ? input.input.assessment : undefined;
            const assessmentOwner = assessment === undefined ? null : uniqueContractByRef(workerContracts.resultContractRef);
            const assessmentSchema = assessment === undefined || assessmentOwner === null ? null : resolveNativeWorkspaceAssessmentSchema(assessment, authority.executionResolution.declarationPublications, authority.executionResolution.ownerInstalls);
            const rawValid = assessment === undefined
                ? verified !== null || port.validateContractValueByRef(workerContracts.resultContractRef, input.rawResult)
                : admittedResolution.implementationRef === nativeIds.implementationRef && assessmentSchema !== null &&
                    (verified !== null || parseNativeWorkspaceAssessmentResult(assessmentSchema, JSON.stringify(input.rawResult)) !== null);
            if (!rawValid) {
                return preimageRefusal("result_contract_refused");
            }
            const owner = implementationOwner(admittedResolution);
            if (owner === null) {
                return preimageRefusal("unadmitted_resolution");
            }
            const body = deepFreeze({
                contractCapabilityBasis: {
                    installId: owner.install.installId,
                    implementationSetRef: port.implementationSetRef,
                    implementationSetDigest: port.implementationSetDigest,
                    publicationDigest: owner.coordinate.publicationDigest,
                },
                implementationResolutionDigest: sha256Canonical(admittedResolution),
                implementationRef: admittedResolution.implementationRef,
                inputContractRef: admittedResolution.inputContractRef,
                targetOutputContractRef: admittedResolution.outputContractRef,
                instructionContractRef: workerContracts.instructionContractRef,
                rawResultContractRef: workerContracts.resultContractRef,
                inputDigest: input.inputDigest,
                rawResultDigest: sha256Canonical(input.rawResult),
            });
            const verificationDigest = sha256Canonical(body);
            const result = deepFreeze({
                kind: "verified_probabilistic_result_contract_preimage",
                schemaVersion: "5.0.0",
                verificationRef: `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice("sha256:".length)}`,
                verificationDigest,
                ...body,
            });
            return verified === null || sha256Canonical(verified) === sha256Canonical(result)
                ? result : preimageRefusal("contract_identity_mismatch");
        }
        catch {
            return preimageRefusal("owner_boundary_exception");
        }
    }
    const qualificationPreparations = new Map();
    const preparationOf = (value) => isRecord(value) && isRecord(value.source) && typeof value.source.cCallRef === "string" ? qualificationPreparations.get(value.source.cCallRef) : undefined;
    const port = Object.freeze({
        kind: "admitted_leaf_invocation_port",
        isExactLoadedCapability() {
            return this === port;
        },
        ownerInstallIds: Object.freeze(authority.executionResolution.ownerInstalls.map((install) => install.installId)),
        implementationSetRef: authority.implementationSet.implementationSetRef,
        implementationSetDigest: authority.implementationSet.implementationSetDigest,
        publicationDigests: Object.freeze(authority.executionResolution.declarationPublications.map(modulePublicationSemanticDigest)),
        hasOwnerCapability(installId, publicationDigest) {
            return authority.executionResolution.declarationClosure.publications.some((publication) => modulePublicationSemanticDigest(publication) === publicationDigest &&
                authority.executionResolution.ownerInstalls.some((install) => install.installId === installId &&
                    install.productId === publication.owningProductId &&
                    install.productContentDigest === publication.productContentDigest &&
                    install.manifestDigest === publication.productManifestDigest &&
                    hasAdmittedProductInstall(authority.artifactTruth, install)));
        },
        isAdmittedResolution(resolution) {
            return exactAdmittedResolution(resolution) !== null;
        },
        async forGraphFunction(graphFunctionRef) {
            if (this !== port)
                return null;
            if (graphFunctionRef === selectedGraphFunctionRef)
                return port;
            const selectedOwner = graphFunctionSemanticsOwner(authority.executionResolution.declarationClosure, graphFunctionRef, coordinate => exactOwnerBinding(authority.executionResolution, coordinate));
            const selected = selectedOwner === null ? null : exactOwnerBinding(authority.executionResolution, selectedOwner);
            if (selected === null)
                return null;
            try {
                const provider = await loadInstalledProductSemantics({
                    install: selected.install, publicationDigest: selectedOwner.publicationDigest,
                    productSemanticsBinding: selected.publication.productSemanticsBinding,
                    verifyInstallAdmission: install => hasAdmittedProductInstall(authority.artifactTruth, install),
                });
                return await constructAdmittedLeafInvocationPort({ ...authority, graphFunctionRef,
                    semanticsProjection: projectInstalledLeafSemantics(provider) });
            }
            catch {
                return null;
            }
        },
        sourcePublicationByDeclarationRef(declarationRef) {
            const matches = authority.executionResolution.declarationClosure.publications.filter(p => p.requirementHandoffs?.some(d => d.declarationRef === declarationRef));
            if (matches.length !== 1)
                return null;
            const publication = matches[0];
            const source = publication.requirementHandoffs.find(d => d.declarationRef === declarationRef);
            const coordinates = authority.executionResolution.declarationClosure.graphFunctionOwners.filter(c => c.declarationRef === source.graphFunctionRef && c.moduleRef === publication.moduleRef);
            if (coordinates.length !== 1)
                return null;
            const bound = exactOwnerBinding(authority.executionResolution, coordinates[0]);
            return bound !== null && sha256Canonical(bound.publication) === sha256Canonical(publication) ? bound.publication : null;
        },
        semanticPublicationByDeclarationRef(declarationRef) {
            const matches = authority.executionResolution.declarationClosure.publications.filter(p => (p.semanticLifecycle ?? p.semanticJobLifecycle)?.declarationRef === declarationRef);
            if (matches.length !== 1)
                return null;
            const publication = matches[0];
            const lifecycle = publication.semanticLifecycle ?? publication.semanticJobLifecycle;
            const functionRefs = [...lifecycle.stages.map(stage => stage.graphFunctionRef),
                ...(publication.semanticJobLifecycle === undefined ? [] : [publication.semanticJobLifecycle.intakeGraphFunctionRef])];
            for (const graphFunctionRef of functionRefs) {
                const coordinates = authority.executionResolution.declarationClosure.graphFunctionOwners.filter(c => c.declarationRef === graphFunctionRef && c.moduleRef === publication.moduleRef);
                if (coordinates.length !== 1)
                    return null;
                const bound = exactOwnerBinding(authority.executionResolution, coordinates[0]);
                if (bound === null || sha256Canonical(bound.publication) !== sha256Canonical(publication))
                    return null;
            }
            return publication;
        },
        contractByRef: uniqueContractByRef,
        contractPublicationByRef(contractRef) {
            const rows = authority.executionResolution.declarationClosure.contractOwners.filter(owner => owner.declarationRef === contractRef);
            return rows.length === 1 ? exactOwnerBinding(authority.executionResolution, rows[0])?.publication ?? null : null;
        },
        declarationGraphFunctions() {
            return Object.freeze(authority.executionResolution.declarationClosure.graphFunctionOwners.map(owner => graphFunctionByRef(owner.declarationRef))
                .filter((g) => g !== null));
        },
        graphFunctionByRef,
        closureContractByRef,
        contractValueKindByRef(contractRef) {
            return uniqueContractByRef(contractRef)?.valueKind ?? null;
        },
        validateContractValueByRef(contractRef, value) {
            const contract = uniqueContractByRef(contractRef);
            return contract !== null &&
                semantics.validateContractValue(contract.valueKind, value);
        },
        contractValueKind(contractRef, contractKind) {
            return contractForLeafSlot(contractRef, contractKind)?.valueKind ?? null;
        },
        validateContractValue(contractRef, contractKind, value) {
            const valueKind = contractForLeafSlot(contractRef, contractKind)?.valueKind;
            return valueKind !== undefined &&
                semantics.validateContractValue(valueKind, value);
        },
        resolveJudgmentRelation(predicateRef) {
            const relation = semantics.resolveJudgmentRelation(predicateRef);
            if (relation === null)
                return null;
            return Object.freeze({ ...relation,
                evaluate: (input, output, currentOwnerPrefix) => relation.evaluate(input, output, currentOwnerPrefix, nativeJudgmentProofOperations(predicateRef, input, output, currentOwnerPrefix, authority.historicalSource, authority.qualificationResources, preparationOf(output))),
            });
        },
        validateResultEvidenceLineage(outputContractRef, value, admittedEvidence) {
            return semantics.validateResultEvidenceLineage({
                outputContractRef,
                value,
                admittedEvidence,
                nativeProof: nativeJudgmentProofOperations(qualificationIds.assessPredicate, preparationOf(value)?.input, value, undefined, authority.historicalSource, authority.qualificationResources, preparationOf(value)),
            });
        },
        verifyProbabilisticResultContractPreimage(input) {
            return verifyContractPreimage(this, input, null);
        },
        revalidateProbabilisticResultContractPreimage(input, verified) {
            return verifyContractPreimage(this, input, verified);
        },
        async invoke(call) {
            try {
                if (this !== port)
                    return ownerRefusal("owner_boundary_exception");
                const admittedResolution = exactAdmittedResolution(call.resolution);
                if (admittedResolution === null ||
                    call.failureContractRef !== admittedResolution.failureContractRef) {
                    return ownerRefusal("owner_boundary_exception");
                }
                const failureValueKind = port.contractValueKind(admittedResolution.failureContractRef, "failure");
                if (failureValueKind === null) {
                    return ownerRefusal("failure_contract_absent");
                }
                const isSelfQualification = admittedResolution.implementationRef === SELF_CONFORMANCE_IDS.implementationRef;
                const isQualification = QUALIFICATION_IMPLEMENTATION_REFS.includes(admittedResolution.implementationRef);
                const qualificationOwnerBasis = isQualification && call.predecessorPrefix !== undefined
                    ? { predecessorPrefix: call.predecessorPrefix, cCallRef: call.occurrence.cCallRef } : null;
                const qualificationOwner = qualificationOwnerBasis === null ? null : isSelfQualification
                    ? resolveSelfConformanceOwner(qualificationOwnerBasis, call.input, true, authority.qualificationResources)
                    : projectQualificationConsumer(qualificationOwnerBasis, call.input, true, authority.qualificationResources);
                if (isQualification && qualificationOwner === null)
                    return ownerRefusal("owner_boundary_exception");
                const qualificationPreparation = admittedResolution.implementationRef === qualificationIds.assessImplementation && isQualificationAssessmentInput(call.input)
                    ? prepareQualificationAssessment(call.input, authority.qualificationResources) : undefined;
                if (qualificationPreparation !== undefined)
                    qualificationPreparations.set(call.occurrence.cCallRef, qualificationPreparation);
                const qualifiedOccurrence = qualificationOwnerBasis === null ? call.occurrence : deepFreeze({ ...call.occurrence, qualificationOwnerBasis });
                const occurrence = admittedResolution.implementationRef !== reacquireIds.implementationRef || call.predecessorPrefix === undefined ? qualifiedOccurrence
                    : deepFreeze({ ...qualifiedOccurrence, nativeWorkReacquisitionBasis: { predecessorPrefix: call.predecessorPrefix, cCallRef: call.occurrence.cCallRef } });
                // A native task may also be ordinary data for a pure consumer leaf.
                const requiresWorksiteAuthority = admittedResolution.implementationRef === nativeIds.implementationRef || isWorksiteFileReplaceRequest(call.input) || isWorksiteFileParentsRequest(call.input) ||
                    call.occurrence.executionAuthority !== null;
                return invokeLeafOwnerBoundary({
                    ...(authority.historicalSource === undefined ? {} : { historicalSource: authority.historicalSource }),
                    ...(authority.qualificationResources === undefined ? {} : { qualificationResources: authority.qualificationResources }),
                    ...(qualificationPreparation === undefined ? {} : { qualificationPreparation }),
                    resolution: admittedResolution,
                    value: call.input,
                    inputDigest: call.inputDigest,
                    failureValueKind,
                    verifyAuthority: async () => {
                        const installedContentValid = await semantics.verifyInstalledContent();
                        return isAdmittedLeafInvocationPort(port) &&
                            implementationOwner(admittedResolution) !== null &&
                            hasAdmittedImplementationSetAtPrefix(authority.prefix, authority.implementationSet) &&
                            installedContentValid &&
                            (![WORKSITE_COMMAND_EXECUTION_IDS.implementationRef, WORKSITE_REVISION_IDS.implementationRef].includes(admittedResolution.implementationRef) ||
                                call.predecessorPrefix !== undefined && hasExactWorksiteCommandLeafSourceAtDurablePrefix(call.predecessorPrefix, call.occurrence.cCallRef, call.input)) &&
                            (!requiresWorksiteAuthority ||
                                hasExactWorksiteLeafExecutionAuthority(call, admittedResolution));
                    },
                    validateSuccess: (value) => (!isQualification || (isSelfQualification ? isSelfConformanceResult(value) &&
                        sha256Canonical(value.owner) === sha256Canonical(qualificationOwner)
                        : qualificationOwner !== null && qualificationResultRelation(qualificationOwner.call.judgmentPredicateRef, call.input, value, call.predecessorPrefix, nativeJudgmentProofOperations(qualificationOwner.call.judgmentPredicateRef, call.input, value, call.predecessorPrefix, authority.historicalSource, authority.qualificationResources, qualificationPreparation)))) && port.validateContractValue(admittedResolution.outputContractRef, "output", value),
                    contractByRef: uniqueContractByRef,
                    resolveWorkerContracts: (_resolution, value) => resolveWorkerContracts(admittedResolution, value),
                    occurrence,
                    loadImplementation: async () => {
                        const module = await loadModule(admittedResolution);
                        return module[admittedResolution.namedSymbol];
                    },
                });
            }
            catch {
                return ownerRefusal("owner_boundary_exception");
            }
        },
    });
    // Certify the closure's actual immutable data, not just its callable shape.
    const resolutionDescriptor = types.isProxy(authority)
        ? undefined : Object.getOwnPropertyDescriptor(authority, "executionResolution");
    const resolution = resolutionDescriptor?.value;
    if (resolution !== undefined && !types.isProxy(resolution) &&
        Object.isFrozen(authority) && Object.isFrozen(resolution) &&
        ["declarationClosure", "declarationPublications", "ownerInstalls"].every(key => {
            const descriptor = Object.getOwnPropertyDescriptor(resolution, key);
            return descriptor !== undefined && "value" in descriptor && isFixedDeclarationData(descriptor.value);
        }))
        declarationLookupPairs.set(graphFunctionByRef, closureContractByRef);
    return port;
}
