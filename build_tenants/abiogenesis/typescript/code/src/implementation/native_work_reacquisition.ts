import { NATIVE_WORK_REACQUISITION_IDS as ids, WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { authenticateOwnedNativeWorkReacquisition, nativeWorkReacquisitionContextCurrent } from "../abg/native_work_reacquisition.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, NativeLeafProofOperations } from "./contracts.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { admitJson } from "../shared/admit/index.js";
import { deepFreeze } from "../shared/immutable.js";
import type { AbgHistoricalGraphCallSourceResource } from "../abg/terminal_result_contracts.js";
const body = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/native_work_reacquisition.js", namedSymbol: "prepareNativeWorksiteCommandReacquisition",
  computeRegime: "F_D" as const, inputContractRef: ids.requestContractRef, outputContractRef: c2.taskContractRef,
  failureContractRef: c2.failureContractRef, refusalContractRef: c2.refusalContractRef };
export const NATIVE_WORK_REACQUISITION_DESCRIPTOR: PackagedLeafImplementationDescriptor = deepFreeze({ kind: "packaged_leaf_implementation_descriptor",
  schemaVersion: "5.0.0", descriptorDigest: sha256Canonical(body), ...body });
/** `inputDigest` is the F_D port's checked digest of this exact input; a caller
 * outside that port computes it. */
export async function prepareNativeWorksiteCommandReacquisition(input: unknown, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest, nativeProof?: NativeLeafProofOperations,
  historicalSource?: AbgHistoricalGraphCallSourceResource): Promise<Readonly<LeafRealizationCandidate>> {
  const basis = occurrence.nativeWorkReacquisitionBasis, owner = nativeProof?.nativeOwnedWorkReacquisition !== undefined
    ? nativeProof.nativeOwnedWorkReacquisition(input, occurrence)
    : basis === undefined ? null : authenticateOwnedNativeWorkReacquisition(basis, input, true, historicalSource);
  if (owner === null || owner.call.cCallRef !== occurrence.cCallRef || !await nativeWorkReacquisitionContextCurrent(owner.task.sourceReacquisition!.request))
    throw new TypeError("native reacquisition requires its current admitted owner, preserved child and complete current context");
  const resultCandidate = owner.task;
  const admittedInput = admitJson(input);
  if (admittedInput.kind !== "ok") throw new TypeError("native reacquisition requires one admitted JSON input");
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: ids.implementationRef,
      inputDigest: inputDigest ?? sha256Canonical(admittedInput.value), outputDigest: sha256Canonical(resultCandidate) }], resultCandidate });
}
