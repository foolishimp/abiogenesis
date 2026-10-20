import { RECURSION_HELLO_IDS, isBoundedRecursionState, } from "../gtl/recursion.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(implementationRef, namedSymbol, inputContractRef) {
    const body = {
        implementationRef,
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
        modulePath: "build/code/src/implementation/recursion.js",
        namedSymbol,
        computeRegime: "F_D",
        inputContractRef,
        outputContractRef: RECURSION_HELLO_IDS.outputContractRef,
        failureContractRef: RECURSION_HELLO_IDS.failureContractRef,
        refusalContractRef: RECURSION_HELLO_IDS.refusalContractRef,
    };
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body),
        ...body,
    });
}
export const RECURSION_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor(RECURSION_HELLO_IDS.evaluatorImplementationRef, "evaluateBoundedRecursion", RECURSION_HELLO_IDS.inputContractRef);
export const RECURSION_STEP_IMPLEMENTATION_DESCRIPTOR = descriptor(RECURSION_HELLO_IDS.childImplementationRef, "stepBoundedRecursion", RECURSION_HELLO_IDS.inputContractRef);
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
export function evaluateBoundedRecursion(input) {
    if (!isBoundedRecursionState(input)) {
        throw new TypeError("bounded recursion evaluator requires its exact state");
    }
    const resultCandidate = deepFreeze({
        ...input,
        blockedChildRemaining: input.blockedChildRemaining,
        terminal: input.remaining === 0,
        trace: [...input.trace],
    });
    return success(RECURSION_HELLO_IDS.evaluatorImplementationRef, input, resultCandidate);
}
export function stepBoundedRecursion(input) {
    if (!isBoundedRecursionState(input) || input.remaining < 1) {
        throw new TypeError("bounded recursion step requires remaining work");
    }
    const remaining = input.remaining - 1;
    const resultCandidate = deepFreeze({
        kind: "bounded_recursion_state",
        schemaVersion: "5.0.0",
        blockedChildRemaining: input.blockedChildRemaining,
        remaining,
        terminal: false,
        trace: [...input.trace, remaining],
    });
    return success(RECURSION_HELLO_IDS.childImplementationRef, input, resultCandidate);
}
