import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { WORKSITE_BRANCH_CONSTRUCTION_IDS, constructWorksiteBranchConstructionVector, isWorksiteBranchConstructionOutputVector, isWorksiteBranchConstructionTask, reduceWorksiteBranchConstructionResults, } from "../product/worksite_branch_construction.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(input) {
    const body = {
        ...input,
        computeRegime: "F_D",
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
        modulePath: "build/code/src/implementation/worksite_branch_construction.js",
        failureContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.failureContractRef,
        refusalContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.refusalContractRef,
    };
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body),
        ...body,
    });
}
export const WORKSITE_BRANCH_CONSTRUCTION_PLAN_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.planImplementationRef,
    namedSymbol: "realizeWorksiteBranchConstructionPlan",
    inputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
});
export const WORKSITE_BRANCH_CONSTRUCTION_REDUCER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerImplementationRef,
    namedSymbol: "realizeWorksiteBranchConstructionReduction",
    inputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
    outputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
});
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
/** Product-authored DAG/readiness admission projected as one exact branch vector. */
export function realizeWorksiteBranchConstructionPlan(input) {
    if (!isWorksiteBranchConstructionTask(input)) {
        throw new TypeError("branch construction planning requires one exact admitted aggregate task");
    }
    const result = constructWorksiteBranchConstructionVector(input);
    return deterministicSuccess(WORKSITE_BRANCH_CONSTRUCTION_IDS.planImplementationRef, input, result);
}
/** Row-major flattening over only a complete admitted C3 fan-out result. */
export function realizeWorksiteBranchConstructionReduction(input) {
    if (!isWorksiteBranchConstructionOutputVector(input)) {
        throw new TypeError("branch construction reduction requires one complete admitted C1 output vector");
    }
    const result = reduceWorksiteBranchConstructionResults(input);
    return deterministicSuccess(WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerImplementationRef, input, result);
}
