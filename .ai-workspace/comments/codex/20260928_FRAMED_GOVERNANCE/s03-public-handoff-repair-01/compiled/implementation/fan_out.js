import { FAN_OUT_HELLO_IDS, isFanOutHelloMemberInput, isFanOutHelloVectorOutput, } from "../gtl/fan_out.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(implementationRef, namedSymbol, inputContractRef, outputContractRef) {
    const body = {
        implementationRef,
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
        modulePath: "build/code/src/implementation/fan_out.js",
        namedSymbol,
        computeRegime: "F_D",
        inputContractRef,
        outputContractRef,
        failureContractRef: FAN_OUT_HELLO_IDS.failureContractRef,
        refusalContractRef: FAN_OUT_HELLO_IDS.refusalContractRef,
    };
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body),
        ...body,
    });
}
export const FAN_OUT_ELEMENT_IMPLEMENTATION_DESCRIPTOR = descriptor(FAN_OUT_HELLO_IDS.elementImplementationRef, "realizeFanOutHelloMember", FAN_OUT_HELLO_IDS.inputMemberContractRef, FAN_OUT_HELLO_IDS.outputMemberContractRef);
export const FAN_IN_REDUCER_IMPLEMENTATION_DESCRIPTOR = descriptor(FAN_OUT_HELLO_IDS.reducerImplementationRef, "reduceFanOutHelloVector", FAN_OUT_HELLO_IDS.outputVectorRef, FAN_OUT_HELLO_IDS.summaryContractRef);
function success(implementationRef, input, resultCandidate) {
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
export function realizeFanOutHelloMember(input) {
    if (!isFanOutHelloMemberInput(input)) {
        throw new TypeError("fan-out element requires one exact admitted member");
    }
    if (input.block) {
        throw new TypeError("declared fan-out member stop");
    }
    const output = deepFreeze({
        kind: "fan_out_hello_member_output",
        schemaVersion: "5.0.0",
        message: `Hello ${input.subject}`,
        subject: input.subject,
    });
    return success(FAN_OUT_HELLO_IDS.elementImplementationRef, input, output);
}
export function reduceFanOutHelloVector(input) {
    if (!isFanOutHelloVectorOutput(input)) {
        throw new TypeError("fan-in reducer requires one complete admitted vector");
    }
    const output = deepFreeze({
        kind: "fan_out_hello_summary",
        schemaVersion: "5.0.0",
        count: input.members.length,
        messages: input.members.map((member) => member.value.message),
    });
    return success(FAN_OUT_HELLO_IDS.reducerImplementationRef, input, output);
}
