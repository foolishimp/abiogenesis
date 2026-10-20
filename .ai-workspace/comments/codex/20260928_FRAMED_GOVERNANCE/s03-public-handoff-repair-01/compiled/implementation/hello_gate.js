import { GATE_HELLO_IDS, } from "../gtl/index.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(input) {
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(input),
        ...input,
    });
}
export const HELLO_GATE_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: GATE_HELLO_IDS.evaluatorImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_gate.js",
    namedSymbol: "evaluateHelloGate",
    computeRegime: "F_D",
    inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
    outputContractRef: GATE_HELLO_IDS.admittedInputContractRef,
    failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
    refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});
export const HELLO_GATE_TARGET_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: GATE_HELLO_IDS.targetImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_gate.js",
    namedSymbol: "realizeGatedHello",
    computeRegime: "F_D",
    inputContractRef: GATE_HELLO_IDS.admittedInputContractRef,
    outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
    failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
    refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});
export function evaluateHelloGate(input) {
    const resultCandidate = deepFreeze({ ...input });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: GATE_HELLO_IDS.evaluatorImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
export function realizeGatedHello(input) {
    const resultCandidate = deepFreeze({
        kind: "hello_world_output",
        schemaVersion: "5.0.0",
        message: `Hello ${input.subject}`,
    });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: GATE_HELLO_IDS.targetImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
