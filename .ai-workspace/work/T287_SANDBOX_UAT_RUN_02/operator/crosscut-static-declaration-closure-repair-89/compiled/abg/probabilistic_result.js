import { validateActorProcessCarrierPair, } from "./actor_process.js";
import { isSha256Digest, sha256Bytes, sha256Canonical, } from "../shared/digests.js";
import { admitIJsonText, admitIJsonValue, IJsonAdmissionError, } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";
import { projectAdmittedWorkspaceProductInstall } from "./environment_admission.js";
import { hasAdmittedExecutionBasisAtPrefix, hasAdmittedImplementationSetAtPrefix, } from "./execution_basis.js";
function refusal(code, message) {
    return deepFreeze({
        kind: "probabilistic_result_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
function exactRef(value) {
    return isNonBlankRef(value) && value.trim() === value;
}
function hasExactDataFields(value, fields) {
    try {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            return false;
        }
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null)
            return false;
        const keys = Reflect.ownKeys(value);
        if (keys.some((key) => typeof key !== "string"))
            return false;
        const actual = keys.sort();
        const expected = [...fields].sort();
        if (actual.length !== expected.length ||
            actual.some((field, index) => field !== expected[index]))
            return false;
        return actual.every((field) => {
            const descriptor = Object.getOwnPropertyDescriptor(value, field);
            return descriptor !== undefined &&
                Object.hasOwn(descriptor, "value") &&
                !Object.hasOwn(descriptor, "get") &&
                !Object.hasOwn(descriptor, "set") &&
                descriptor.enumerable === true;
        });
    }
    catch {
        return false;
    }
}
const ADMISSION_INPUT_FIELDS = Object.freeze([
    "artifactTruth",
    "executionBasis",
    "input",
    "implementationSet",
    "leafPort",
    "observation",
    "occurrence",
    "prefix",
    "request",
    "resolution",
]);
const OCCURRENCE_FIELDS = Object.freeze([
    "attempt",
    "cCallRef",
    "executionAuthority",
    "frameId",
    "graphCallId",
    "programLocusRef",
    "runId",
    "taskOrdinal",
]);
const VERIFIED_PREIMAGE_FIELDS = Object.freeze([
    "contractCapabilityBasis",
    "implementationRef",
    "implementationResolutionDigest",
    "inputContractRef",
    "inputDigest",
    "instructionContractRef",
    "kind",
    "rawResultContractRef",
    "rawResultDigest",
    "schemaVersion",
    "targetOutputContractRef",
    "verificationDigest",
    "verificationRef",
]);
const CONTRACT_CAPABILITY_BASIS_FIELDS = Object.freeze([
    "implementationSetDigest",
    "implementationSetRef",
    "installId",
    "publicationDigest",
]);
function exactOccurrence(value) {
    return exactRef(value.cCallRef) &&
        exactRef(value.runId) &&
        exactRef(value.graphCallId) &&
        exactRef(value.frameId) &&
        exactRef(value.programLocusRef) &&
        value.executionAuthority === null &&
        Number.isSafeInteger(value.attempt) &&
        value.attempt >= 1 &&
        (value.taskOrdinal === null ||
            (Number.isSafeInteger(value.taskOrdinal) && value.taskOrdinal >= 0));
}
function exactVerifiedContractPreimage(value) {
    if (typeof value !== "object" ||
        value === null ||
        !hasExactDataFields(value, VERIFIED_PREIMAGE_FIELDS))
        return false;
    const candidate = value;
    const capability = candidate.contractCapabilityBasis;
    if (candidate.kind !== "verified_probabilistic_result_contract_preimage" ||
        candidate.schemaVersion !== "5.0.0" ||
        !exactRef(candidate.verificationRef) ||
        !isSha256Digest(candidate.verificationDigest) ||
        typeof capability !== "object" ||
        capability === null ||
        !hasExactDataFields(capability, CONTRACT_CAPABILITY_BASIS_FIELDS) ||
        !exactRef(capability.installId) ||
        !exactRef(capability.implementationSetRef) ||
        !isSha256Digest(capability.implementationSetDigest) ||
        !isSha256Digest(capability.publicationDigest) ||
        !isSha256Digest(candidate.implementationResolutionDigest) ||
        !exactRef(candidate.implementationRef) ||
        !exactRef(candidate.inputContractRef) ||
        !exactRef(candidate.targetOutputContractRef) ||
        !exactRef(candidate.instructionContractRef) ||
        !exactRef(candidate.rawResultContractRef) ||
        !isSha256Digest(candidate.inputDigest) ||
        !isSha256Digest(candidate.rawResultDigest))
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, verificationRef: _verificationRef, verificationDigest: _verificationDigest, ...body } = candidate;
    const digest = sha256Canonical(body);
    return candidate.verificationDigest === digest &&
        candidate.verificationRef ===
            `probabilistic-result-contract-preimage://abiogenesis/${digest.slice("sha256:".length)}`;
}
function asIJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value)
        ? value
        : null;
}
function canonicalObject(value) {
    try {
        return asIJsonObject(admitIJsonValue(value));
    }
    catch {
        return null;
    }
}
function transportBasisMatches(request, observation) {
    return observation.transportLane === request.transportLane &&
        observation.promptDigest === sha256Canonical(request.prompt) &&
        observation.artifactDigests.prompt === sha256Bytes(request.prompt) &&
        observation.artifactDigests.output === sha256Bytes(observation.finalOutput) &&
        observation.artifactDigests.transport === observation.transportDigest;
}
export function admitProbabilisticResultCandidate(supplied) {
    return admitResultCandidate(supplied);
}
/** Internal CCall composition; the callback obtains actual owner facts at the
 * selected prefix, never a supplied serialized preimage. */
export function admitProbabilisticResultFromActorTransport(supplied, actorTransport) {
    return admitResultCandidate(supplied, actorTransport);
}
function admitResultCandidate(supplied, actorTransport) {
    if (typeof supplied !== "object" ||
        supplied === null ||
        !hasExactDataFields(supplied, ADMISSION_INPUT_FIELDS)) {
        return refusal("request_basis_mismatch", "probabilistic result admission requires one exact input basis");
    }
    if (typeof supplied.executionBasis !== "object" ||
        supplied.executionBasis === null ||
        typeof supplied.implementationSet !== "object" ||
        supplied.implementationSet === null ||
        typeof supplied.leafPort !== "object" ||
        supplied.leafPort === null ||
        typeof supplied.resolution !== "object" ||
        supplied.resolution === null ||
        supplied.leafPort.kind !== "admitted_leaf_invocation_port" ||
        typeof supplied.leafPort.verifyProbabilisticResultContractPreimage !==
            "function") {
        return refusal("unadmitted_contract_capability", "probabilistic result admission requires one admitted installed leaf port and resolution row");
    }
    let implementationResolutionDigest;
    try {
        implementationResolutionDigest = sha256Canonical(supplied.resolution);
    }
    catch {
        return refusal("unadmitted_contract_capability", "probabilistic result admission requires one canonical implementation resolution");
    }
    const resolutionMatches = supplied.implementationSet.rows.filter((row) => sha256Canonical(row) ===
        implementationResolutionDigest);
    const admittedResolution = resolutionMatches.length === 1
        ? resolutionMatches[0]
        : null;
    if (admittedResolution === null ||
        !hasAdmittedImplementationSetAtPrefix(supplied.prefix, supplied.implementationSet) ||
        !hasAdmittedExecutionBasisAtPrefix(supplied.prefix, supplied.executionBasis) ||
        supplied.executionBasis.implementationSetRef !==
            supplied.implementationSet.implementationSetRef ||
        supplied.executionBasis.implementationSetDigest !==
            supplied.implementationSet.implementationSetDigest ||
        supplied.executionBasis.invocationAdmissionRef !==
            supplied.implementationSet.invocationAdmissionRef ||
        supplied.executionBasis.invocationRef !==
            supplied.implementationSet.invocationRef ||
        supplied.executionBasis.graphFunctionRef !==
            admittedResolution.graphFunctionRef) {
        return refusal("unadmitted_contract_capability", "probabilistic result admission requires one exact event-admitted execution, implementation set, and resolution join");
    }
    const carrierValidation = validateActorProcessCarrierPair(supplied.request, supplied.observation);
    if (carrierValidation.kind !== "actor_process_carrier_validation") {
        return carrierValidation.code === "invalid_actor_process_request"
            ? refusal("request_basis_mismatch", carrierValidation.message)
            : refusal("transport_basis_mismatch", carrierValidation.message);
    }
    const request = carrierValidation.request;
    const observation = carrierValidation.observation;
    const admittedInput = canonicalObject(supplied.input);
    if (admittedInput === null) {
        return refusal("input_identity_mismatch", "probabilistic result input is not one exact I-JSON object");
    }
    const admittedOccurrence = canonicalObject(supplied.occurrence);
    const occurrence = admittedOccurrence;
    if (admittedOccurrence === null ||
        !hasExactDataFields(admittedOccurrence, OCCURRENCE_FIELDS) ||
        !exactOccurrence(occurrence)) {
        return refusal("request_basis_mismatch", "probabilistic result request requires one exact execution occurrence");
    }
    if (admittedResolution.computeRegime !== "F_P") {
        return refusal("request_basis_mismatch", "probabilistic result request differs from one exact F_P implementation resolution");
    }
    if (occurrence.programLocusRef !==
        admittedResolution.programLocusRef) {
        return refusal("request_basis_mismatch", "execution occurrence locus differs from the admitted implementation resolution");
    }
    if (request.resultContractRef !== observation.resultContractRef ||
        request.instructionContractRef !== observation.instructionContractRef) {
        return refusal("contract_identity_mismatch", "request, observation, and installed Product contract identities differ");
    }
    const inputDigest = sha256Canonical(admittedInput);
    if (request.inputDigest !== inputDigest ||
        observation.inputDigest !== inputDigest) {
        return refusal("input_identity_mismatch", "request or observation input digest differs from the exact input");
    }
    if (observation.actorRef !== request.actorRef) {
        return refusal("actor_identity_mismatch", "actor observation differs from the requested actor");
    }
    if (observation.workerBindingRef !== request.workerBindingRef) {
        return refusal("worker_identity_mismatch", "actor observation differs from the requested worker binding");
    }
    if (request.implementationRef !== admittedResolution.implementationRef ||
        observation.implementationRef !== request.implementationRef ||
        observation.materializationPlanRef !== request.materializationPlanRef ||
        observation.rendererRef !== request.rendererRef) {
        return refusal("request_basis_mismatch", "actor observation differs from the exact implementation request");
    }
    if (!transportBasisMatches(request, observation)) {
        return refusal("transport_basis_mismatch", "actor observation contains an incomplete or contradictory transport basis");
    }
    let parsed;
    try {
        parsed = admitIJsonText(observation.finalOutput, "probabilistic raw result");
    }
    catch (error) {
        return error instanceof IJsonAdmissionError
            ? refusal(error.code, error.message)
            : refusal("malformed_json", "probabilistic raw result is not exact I-JSON");
    }
    const value = asIJsonObject(parsed);
    if (value === null) {
        return refusal("non_object_result", "probabilistic raw result must be one I-JSON object");
    }
    const valueDigest = sha256Canonical(value);
    if (observation.observedOutputDigest !== valueDigest) {
        return refusal("transport_basis_mismatch", "observed output digest differs from the exact admitted raw object");
    }
    let contractPreimage;
    try {
        const contractInput = {
            resolution: admittedResolution,
            input: admittedInput,
            inputDigest,
            instructionContractRef: request.instructionContractRef,
            rawResultContractRef: request.resultContractRef,
            rawResult: value,
        };
        const assessment = observation.nativeResultAssessment?.disposition === "admitted"
            ? actorTransport?.()?.nativeResultAssessment : undefined;
        contractPreimage = assessment?.disposition === "admitted" && assessment.verification !== null
            ? supplied.leafPort.revalidateProbabilisticResultContractPreimage(contractInput, assessment.verification)
            : supplied.leafPort.verifyProbabilisticResultContractPreimage(contractInput);
    }
    catch {
        return refusal("unadmitted_contract_capability", "installed implementation owner contract verification raised an exception");
    }
    if (contractPreimage.kind ===
        "probabilistic_result_contract_preimage_refusal") {
        switch (contractPreimage.code) {
            case "contract_identity_mismatch":
                return refusal("contract_identity_mismatch", "request and observation contracts differ from the exact installed Product relation");
            case "input_contract_refused":
                return refusal("input_identity_mismatch", "installed Product input contract refused the exact request input");
            case "result_contract_refused":
                return refusal("declared_contract_refused", "installed Product result contract refused the raw object");
            case "owner_boundary_exception":
            case "unadmitted_resolution":
                return refusal("unadmitted_contract_capability", "probabilistic result admission requires one exact admitted implementation-owner preimage");
        }
    }
    const requestDigest = sha256Canonical(request);
    const observationDigest = sha256Canonical(observation);
    if (!exactVerifiedContractPreimage(contractPreimage) ||
        contractPreimage.implementationResolutionDigest !==
            implementationResolutionDigest ||
        contractPreimage.implementationRef !== admittedResolution.implementationRef ||
        contractPreimage.inputContractRef !== admittedResolution.inputContractRef ||
        contractPreimage.targetOutputContractRef !==
            admittedResolution.outputContractRef ||
        contractPreimage.instructionContractRef !==
            request.instructionContractRef ||
        contractPreimage.rawResultContractRef !== request.resultContractRef ||
        contractPreimage.inputDigest !== inputDigest ||
        contractPreimage.rawResultDigest !== valueDigest) {
        return refusal("unadmitted_contract_capability", "implementation-owner preimage differs from the exact admission basis");
    }
    const capability = contractPreimage.contractCapabilityBasis;
    const installed = projectAdmittedWorkspaceProductInstall(supplied.artifactTruth, supplied.executionBasis.workspaceBindingId, capability.installId);
    if (installed === null ||
        installed.install.packageName !== admittedResolution.packageName ||
        installed.install.packageVersion !== admittedResolution.packageVersion ||
        capability.publicationDigest !==
            admittedResolution.implementationPublicationDigest ||
        !supplied.leafPort.hasOwnerCapability(capability.installId, capability.publicationDigest) ||
        capability.implementationSetRef !==
            supplied.implementationSet.implementationSetRef ||
        capability.implementationSetDigest !==
            supplied.implementationSet.implementationSetDigest ||
        supplied.leafPort.implementationSetRef !==
            supplied.implementationSet.implementationSetRef ||
        supplied.leafPort.implementationSetDigest !==
            supplied.implementationSet.implementationSetDigest) {
        return refusal("unadmitted_contract_capability", "implementation-owner preimage does not join one admitted workspace install, publication, implementation set, and resolution");
    }
    const body = deepFreeze({
        contractCapabilityBasis: contractPreimage.contractCapabilityBasis,
        occurrence,
        requestRef: `probabilistic-request://abiogenesis/${requestDigest.slice("sha256:".length)}`,
        requestDigest,
        actorInvocationRef: observation.actorInvocationRef,
        actorRef: request.actorRef,
        workerBindingRef: request.workerBindingRef,
        implementationRef: request.implementationRef,
        implementationResolutionRef: `implementation-resolution-row://abiogenesis/${implementationResolutionDigest.slice("sha256:".length)}`,
        implementationResolutionDigest,
        inputDigest,
        instructionContractRef: contractPreimage.instructionContractRef,
        rawResultContractRef: contractPreimage.rawResultContractRef,
        targetOutputContractRef: contractPreimage.targetOutputContractRef,
        processRef: observation.processRef,
        transportBindingRef: observation.transportBindingRef,
        transportBindingDigest: observation.transportBindingDigest,
        transportDigest: observation.transportDigest,
        transportDisposition: observation.disposition,
        transportFailureClass: observation.failureClass,
        observationDigest,
        rawOutputDigest: sha256Bytes(observation.finalOutput),
        valueDigest,
        value,
    });
    const candidateDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "contract_admitted_probabilistic_result_candidate",
        schemaVersion: "5.0.0",
        candidateRef: `probabilistic-result-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
        candidateDigest,
        ...body,
    });
}
