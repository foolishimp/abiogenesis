import { COMPOSED_HELLO_IDS, } from "../gtl/index.js";
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
export const NORMALIZE_HELLO_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "normalizeHelloInput",
    computeRegime: "F_D",
    inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
    refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});
export const RENDER_NORMALIZED_HELLO_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "renderNormalizedHello",
    computeRegime: "F_D",
    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
    failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
    refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});
export const PASS_NORMALIZED_HELLO_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: COMPOSED_HELLO_IDS.passNormalizedImplementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "passNormalizedHello",
    computeRegime: "F_D",
    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
    refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});
export function normalizeHelloInput(input) {
    const resultCandidate = deepFreeze({
        kind: "normalized_hello_input",
        schemaVersion: "5.0.0",
        subject: input.subject.trim(),
    });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
export function renderNormalizedHello(input) {
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
                implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
export function passNormalizedHello(input) {
    const resultCandidate = deepFreeze({ ...input });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef: COMPOSED_HELLO_IDS.passNormalizedImplementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
