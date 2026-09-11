import { SELF_CONFORMANCE_IDS as ids } from "../gtl/self_conformance.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafRealizationCandidate, LeafExecutionOccurrence } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isSelfConformanceInput } from "../validator/self_conformance_contracts.js";
import { evaluateSelfConformance } from "../validator/self_conformance.js";
import { resolveSelfConformanceOwner } from "../validator/self_conformance_basis.js";
const descriptor = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION, modulePath: "build/code/src/implementation/self_conformance.js",
  namedSymbol: "realizeSelfConformance", computeRegime: "F_D" as const,
  inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
  failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
export const SELF_CONFORMANCE_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor> = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...descriptor, descriptorDigest: sha256Canonical(descriptor),
});
/** A successfully evaluated non-green gate is an ordinary native result, never a qualification verdict. */
export function realizeSelfConformance(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  if (!isSelfConformanceInput(input)) throw new TypeError("self-conformance input was not admitted");
  const owner = occurrence.qualificationOwnerBasis === undefined ? null : resolveSelfConformanceOwner(occurrence.qualificationOwnerBasis, input, true);
  if (owner === null || owner.nativeBasis.cCallRef !== occurrence.cCallRef) throw new TypeError("self-conformance requires current admitted owner basis");
  const resultCandidate = evaluateSelfConformance(input, owner) as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate, evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
      implementationRef: ids.implementationRef, inputDigest: sha256Canonical(input as unknown as JsonValue), outputDigest: sha256Canonical(resultCandidate) }] });
}
