import { NATIVE_WORK_REACQUISITION_IDS as ids, WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { authenticateNativeWorkReacquisition, nativeWorkReacquisitionContextCurrent } from "../abg/native_work_reacquisition.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, NativeLeafProofOperations } from "./contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
const body = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/native_work_reacquisition.js", namedSymbol: "prepareNativeWorksiteCommandReacquisition",
  computeRegime: "F_D" as const, inputContractRef: ids.requestContractRef, outputContractRef: c2.taskContractRef,
  failureContractRef: c2.failureContractRef, refusalContractRef: c2.refusalContractRef };
export const NATIVE_WORK_REACQUISITION_DESCRIPTOR: PackagedLeafImplementationDescriptor = deepFreeze({ kind: "packaged_leaf_implementation_descriptor",
  schemaVersion: "5.0.0", descriptorDigest: sha256Canonical(body), ...body });
export async function prepareNativeWorksiteCommandReacquisition(input: unknown, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Promise<Readonly<LeafRealizationCandidate>> {
  const basis = occurrence.nativeWorkReacquisitionBasis, owner = nativeProof?.nativeWorkReacquisition !== undefined
    ? nativeProof.nativeWorkReacquisition(input, occurrence)
    : basis === undefined ? null : authenticateNativeWorkReacquisition(basis, input, true);
  if (owner === null || owner.call.cCallRef !== occurrence.cCallRef || !await nativeWorkReacquisitionContextCurrent(owner.task.sourceReacquisition!.request))
    throw new TypeError("native reacquisition requires its current admitted owner, preserved child and complete current context");
  const resultCandidate = owner.task as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: ids.implementationRef,
      inputDigest: sha256Canonical(input as JsonValue), outputDigest: sha256Canonical(resultCandidate) }], resultCandidate });
}
