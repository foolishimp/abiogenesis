import { requireWorksiteNativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { projectWorksitePreservedResultArtifact, projectWorksitePreservedCandidateBundle } from "../abg/worksite_construction_recovery.js";
import { WORKSITE_PRESERVED_RESULT_IDS as recoveryIds } from "../product/worksite_construction_recovery.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { WORKSITE_CONSTRUCTION_IDS, constructWorksiteCandidateBundle, constructWorksiteConstructionWorkerResult, constructWorksiteFileReplaceVector, isWorksiteCandidateBundle, isWorksiteConstructionTask, isWorksiteFileReplaceOutputVector, reduceWorksiteFileReplaceResults, worksiteConstructionWorkerResultSchema, } from "../product/worksite_construction.js";
import { canonicalJson, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(input) {
    const body = {
        ...input,
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
        modulePath: "build/code/src/implementation/worksite_construction.js",
        failureContractRef: WORKSITE_CONSTRUCTION_IDS.failureContractRef,
        refusalContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
    };
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body),
        ...body,
    });
}
export const WORKSITE_CONSTRUCTION_CANDIDATE_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef,
    namedSymbol: "realizeWorksiteConstructionCandidate",
    computeRegime: "F_P",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
});
export const WORKSITE_CONSTRUCTION_JOIN_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: WORKSITE_CONSTRUCTION_IDS.joinImplementationRef,
    namedSymbol: "realizeWorksiteFileReplaceVector",
    computeRegime: "F_D",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
});
export const WORKSITE_PRESERVED_RESULT_AUTHENTICATE_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: recoveryIds.authenticateImplementationRef, namedSymbol: "authenticateWorksitePreservedResult", computeRegime: "F_D",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef, outputContractRef: recoveryIds.artifactContractRef,
});
export const WORKSITE_PRESERVED_RESULT_DERIVE_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: recoveryIds.deriveImplementationRef, namedSymbol: "deriveWorksitePreservedCandidate", computeRegime: "F_D",
    inputContractRef: recoveryIds.artifactContractRef, outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
});
export function authenticateWorksitePreservedResult(input, occurrence) {
    const value = occurrence.worksitePreservedResultBasis === undefined ? null : projectWorksitePreservedResultArtifact(occurrence.worksitePreservedResultBasis, input);
    return value === null ? failure("preserved_source_invalid") : deterministicSuccess(recoveryIds.authenticateImplementationRef, input, value);
}
export function deriveWorksitePreservedCandidate(input, occurrence) {
    const value = occurrence.worksitePreservedResultBasis === undefined ? null : projectWorksitePreservedCandidateBundle(occurrence.worksitePreservedResultBasis, input);
    return value === null ? failure("preserved_candidate_invalid") : deterministicSuccess(recoveryIds.deriveImplementationRef, input, value);
}
export const WORKSITE_CONSTRUCTION_REDUCER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef,
    namedSymbol: "reduceWorksiteConstructionResults",
    computeRegime: "F_D",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
});
function failure(failureClass) {
    const diagnosticRef = `diagnostic://abiogenesis/worksite/construction/${failureClass.replaceAll("_", "-")}@5`;
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "failure",
        evidenceCandidates: [],
        resultCandidate: {
            kind: "worksite_construction_failure",
            schemaVersion: "5.0.0",
            failureClass,
            diagnosticRef,
        },
        diagnosticRef,
    });
}
function deterministicSuccess(implementationRef, input, resultCandidate) {
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
function exactActorExchange(task, inputDigest, expectedRequest, exchange) {
    const observation = exchange.observation;
    return canonicalJson(exchange.request) ===
        canonicalJson(expectedRequest) &&
        observation.actorRef === WORKSITE_CONSTRUCTION_IDS.workerActorRef &&
        observation.workerBindingRef ===
            WORKSITE_CONSTRUCTION_IDS.workerBindingRef &&
        observation.implementationRef ===
            WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef &&
        observation.inputDigest === inputDigest &&
        observation.materializationPlanRef === expectedRequest.materializationPlanRef &&
        observation.rendererRef === expectedRequest.rendererRef &&
        observation.instructionContractRef ===
            WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
        observation.resultContractRef ===
            WORKSITE_CONSTRUCTION_IDS.workerResultContractRef &&
        observation.transportLane === "closed_prompt_proof" &&
        typeof expectedRequest.prompt === "string" &&
        observation.promptDigest === sha256Canonical(expectedRequest.prompt) &&
        observation.toolCallCount === 0;
}
/** One governed F_P dispatch. Native assembly preserves original task text as
 * an exact section while the exchange binds the complete assembled prompt. */
export function realizeWorksiteConstructionCandidate(input, occurrence, prepareAssembly) {
    if (!isWorksiteConstructionTask(input)) {
        throw new TypeError("worksite candidate construction requires one exact admitted task");
    }
    const inputDigest = sha256Canonical(input);
    const workerRequest = occurrence.nativeInstructionAssemblyBasis === undefined ? deepFreeze({
        actorRef: WORKSITE_CONSTRUCTION_IDS.workerActorRef,
        workerBindingRef: WORKSITE_CONSTRUCTION_IDS.workerBindingRef,
        implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef,
        inputDigest,
        materializationPlanRef: WORKSITE_CONSTRUCTION_IDS.materializationPlanRef,
        rendererRef: WORKSITE_CONSTRUCTION_IDS.rendererRef,
        instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
        resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
        transportLane: WORKSITE_CONSTRUCTION_IDS.transportLane,
        prompt: input.prompt,
        responseJsonSchema: worksiteConstructionWorkerResultSchema(input),
    }) : (prepareAssembly === undefined ? requireWorksiteNativeInstructionAssembly(occurrence.nativeInstructionAssemblyBasis, input) : prepareAssembly()).request;
    return deepFreeze({
        kind: "prepared_probabilistic_leaf_invocation",
        schemaVersion: "5.0.0",
        workerRequest,
        complete(exchange) {
            if (!exactActorExchange(input, inputDigest, workerRequest, exchange))
                return failure("transport_identity_mismatch");
            let rawValue;
            try {
                rawValue = JSON.parse(exchange.observation.finalOutput);
            }
            catch {
                return failure("result_contract_failure");
            }
            let bundle;
            try {
                const workerResult = constructWorksiteConstructionWorkerResult(input, rawValue);
                bundle = constructWorksiteCandidateBundle(input, workerResult);
            }
            catch {
                return failure("result_contract_failure");
            }
            const salvage = exchange.observation.disposition === "failure" &&
                exchange.observation.failureClass === "transport_failure";
            if (exchange.observation.disposition !== "success" && !salvage) {
                return failure(exchange.observation.failureClass ?? "transport_failure");
            }
            return deepFreeze({
                kind: "leaf_realization_candidate",
                schemaVersion: "5.0.0",
                disposition: "success",
                evidenceCandidates: [],
                resultCandidate: bundle,
            });
        },
    });
}
/** Deterministic authority join; candidate bytes supply no request authority. */
export function realizeWorksiteFileReplaceVector(input) {
    if (!isWorksiteCandidateBundle(input)) {
        throw new TypeError("worksite authority join requires one exact admitted candidate bundle");
    }
    const result = constructWorksiteFileReplaceVector(input);
    return deterministicSuccess(WORKSITE_CONSTRUCTION_IDS.joinImplementationRef, input, result);
}
/** Deterministic reduction over only the complete admitted C0 output vector. */
export function reduceWorksiteConstructionResults(input) {
    if (!isWorksiteFileReplaceOutputVector(input)) {
        throw new TypeError("worksite construction reduction requires one complete admitted C0 output vector");
    }
    const result = reduceWorksiteFileReplaceResults(input);
    return deterministicSuccess(WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef, input, result);
}
