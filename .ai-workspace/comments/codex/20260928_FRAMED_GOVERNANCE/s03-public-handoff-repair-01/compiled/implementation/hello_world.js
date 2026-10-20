import { HELLO_WORLD_IDS } from "../gtl/hello_world.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const descriptorBody = {
    implementationRef: HELLO_WORLD_IDS.implementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/hello_world.js",
    namedSymbol: "realizeHelloWorld",
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
};
export const HELLO_WORLD_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(descriptorBody),
    ...descriptorBody,
});
export function realizeHelloWorld(input) {
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
                implementationRef: HELLO_WORLD_IDS.implementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
