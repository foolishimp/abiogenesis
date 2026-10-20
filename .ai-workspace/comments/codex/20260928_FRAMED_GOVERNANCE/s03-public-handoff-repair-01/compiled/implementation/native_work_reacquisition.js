import { NATIVE_WORK_REACQUISITION_IDS as ids, WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { authenticateNativeWorkReacquisition, nativeWorkReacquisitionContextCurrent } from "../abg/native_work_reacquisition.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const body = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/native_work_reacquisition.js", namedSymbol: "prepareNativeWorksiteCommandReacquisition",
    computeRegime: "F_D", inputContractRef: ids.requestContractRef, outputContractRef: c2.taskContractRef,
    failureContractRef: c2.failureContractRef, refusalContractRef: c2.refusalContractRef };
export const NATIVE_WORK_REACQUISITION_DESCRIPTOR = deepFreeze({ kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0", descriptorDigest: sha256Canonical(body), ...body });
export async function prepareNativeWorksiteCommandReacquisition(input, occurrence, _resolution, _inputDigest, nativeProof, historicalSource) {
    const basis = occurrence.nativeWorkReacquisitionBasis, owner = nativeProof?.nativeWorkReacquisition !== undefined
        ? nativeProof.nativeWorkReacquisition(input, occurrence)
        : basis === undefined ? null : authenticateNativeWorkReacquisition(basis, input, true, historicalSource);
    if (owner === null || owner.call.cCallRef !== occurrence.cCallRef || !await nativeWorkReacquisitionContextCurrent(owner.task.sourceReacquisition.request))
        throw new TypeError("native reacquisition requires its current admitted owner, preserved child and complete current context");
    const resultCandidate = owner.task;
    return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
        evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: ids.implementationRef,
                inputDigest: sha256Canonical(input), outputDigest: sha256Canonical(resultCandidate) }], resultCandidate });
}
