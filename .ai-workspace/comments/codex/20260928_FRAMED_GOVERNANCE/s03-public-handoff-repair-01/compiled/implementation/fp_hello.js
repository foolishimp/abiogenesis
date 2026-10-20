import { FIBRE_SUBSTITUTION_HELLO_IDS, FP_HELLO_IDS, FP_FD_COMPOSED_HELLO_IDS, isFpHelloInstruction, isFpHelloOutput, evaluateFpHelloResult, } from "../gtl/hello_world.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const descriptorBody = {
    implementationRef: FP_HELLO_IDS.implementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/fp_hello.js",
    namedSymbol: "realizeFpHello",
    computeRegime: "F_P",
    inputContractRef: FP_HELLO_IDS.inputContractRef,
    outputContractRef: FP_HELLO_IDS.outputContractRef,
    failureContractRef: FP_HELLO_IDS.failureContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
};
export const FP_HELLO_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(descriptorBody),
    ...descriptorBody,
});
const deterministicDescriptorBody = {
    implementationRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/fp_hello.js",
    namedSymbol: "realizeDeterministicFpHello",
    computeRegime: "F_D",
    inputContractRef: FP_HELLO_IDS.inputContractRef,
    outputContractRef: FP_HELLO_IDS.outputContractRef,
    failureContractRef: FP_HELLO_IDS.failureContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
};
export const DETERMINISTIC_FP_HELLO_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(deterministicDescriptorBody),
    ...deterministicDescriptorBody,
});
const fpFdPassDescriptorBody = {
    implementationRef: FP_FD_COMPOSED_HELLO_IDS.passImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/fp_hello.js",
    namedSymbol: "realizeFpOutputPass",
    computeRegime: "F_D",
    inputContractRef: FP_HELLO_IDS.outputContractRef,
    outputContractRef: FP_HELLO_IDS.outputContractRef,
    failureContractRef: FP_HELLO_IDS.failureContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
};
export const FP_FD_OUTPUT_PASS_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(fpFdPassDescriptorBody),
    ...fpFdPassDescriptorBody,
});
function renderInstruction(input) {
    return [
        "Execute the declared ABIogenesis F_P conformance instruction.",
        `Instruction contract: ${input.instructionContractRef}`,
        `Result contract: ${input.resultContractRef}`,
        `Attributed actor: ${input.workerActorRef}`,
        `Subject: ${JSON.stringify(input.subject)}`,
        `Instruction: ${input.instruction}`,
        `The message field must equal exactly ${JSON.stringify(`Hello ${input.subject}`)}.`,
        "Return only the declared JSON result. Do not call tools.",
    ].join("\n");
}
function responseSchema(input) {
    return {
        type: "object",
        additionalProperties: false,
        required: ["kind", "schemaVersion", "resultContractRef", "actorRef", "message"],
        properties: {
            kind: { const: "fp_hello_output" },
            schemaVersion: { const: "5.0.0" },
            resultContractRef: { const: FP_HELLO_IDS.outputContractRef },
            actorRef: { const: FP_HELLO_IDS.workerActorRef },
            message: { const: `Hello ${input.subject}` },
        },
    };
}
// Internal owner relation for the exact response schema declared above.
// The published structural value kind remains reusable; this boundary also
// conserves the request-bound greeting before native contract admission.
export function validateFpHelloResponse(input, output) {
    return isFpHelloInstruction(input) && isFpHelloOutput(output) &&
        evaluateFpHelloResult(input, output);
}
function parseCandidate(output) {
    try {
        const value = JSON.parse(output);
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            return value;
        }
    }
    catch {
        // The raw output remains preserved in the transport artifacts and evidence digest.
    }
    return deepFreeze({
        kind: "malformed_fp_output",
        schemaVersion: "5.0.0",
        rawOutputDigest: sha256Canonical(output),
    });
}
export function realizeFpHello(input, _occurrence) {
    if (!isFpHelloInstruction(input)) {
        throw new TypeError("F_P Hello implementation requires the exact admitted instruction envelope");
    }
    const prompt = renderInstruction(input);
    const inputDigest = sha256Canonical(input);
    const workerRequest = deepFreeze({
        actorRef: input.workerActorRef,
        workerBindingRef: input.workerBindingRef,
        implementationRef: FP_HELLO_IDS.implementationRef,
        inputDigest,
        materializationPlanRef: input.materializationPlanRef,
        rendererRef: input.rendererRef,
        instructionContractRef: input.instructionContractRef,
        resultContractRef: input.resultContractRef,
        transportLane: input.transportLane,
        prompt,
        responseJsonSchema: responseSchema(input),
    });
    return deepFreeze({
        kind: "prepared_probabilistic_leaf_invocation",
        schemaVersion: "5.0.0",
        workerRequest,
        complete(actorProcessExchange) {
            const transport = actorProcessExchange.observation;
            const parsedCandidate = parseCandidate(transport.finalOutput);
            const salvaged = transport.disposition === "failure" &&
                transport.failureClass === "transport_failure" &&
                isFpHelloOutput(parsedCandidate);
            const disposition = transport.disposition === "success" || salvaged
                ? "success"
                : "failure";
            const diagnosticRef = disposition === "success" || transport.failureClass === null
                ? null
                : `diagnostic://abiogenesis/transport/${transport.failureClass.replaceAll("_", "-")}@5`;
            const resultCandidate = disposition === "success"
                ? parsedCandidate
                : deepFreeze({
                    kind: "fp_hello_failure",
                    schemaVersion: "5.0.0",
                    failureClass: transport.failureClass ?? "transport_failure",
                    diagnosticRef: diagnosticRef ?? "diagnostic://abiogenesis/transport/failure@5",
                });
            return deepFreeze({
                kind: "leaf_realization_candidate",
                schemaVersion: "5.0.0",
                disposition,
                evidenceCandidates: [],
                resultCandidate,
                ...(diagnosticRef === null ? {} : { diagnosticRef }),
            });
        },
    });
}
export function realizeDeterministicFpHello(input) {
    if (!isFpHelloInstruction(input)) {
        throw new TypeError("deterministic fibre-substitution implementation requires the exact instruction envelope");
    }
    const resultCandidate = deepFreeze({
        kind: "fp_hello_output",
        schemaVersion: "5.0.0",
        resultContractRef: input.resultContractRef,
        actorRef: input.workerActorRef,
        message: `Hello ${input.subject}`,
    });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
export function realizeFpOutputPass(input) {
    if (!isFpHelloOutput(input)) {
        throw new TypeError("F_P-to-F_D output pass requires one exact admitted F_P result");
    }
    const resultCandidate = deepFreeze({ ...input });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: FP_FD_COMPOSED_HELLO_IDS.passImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
