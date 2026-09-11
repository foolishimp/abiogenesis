import { REQUIREMENT_HANDOFF_IDS as ids } from "../gtl/requirement_handoff.js";
import { projectRequirementHandoffCandidate } from "../abg/requirement_handoff.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const descriptor = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION, modulePath: "build/code/src/implementation/requirement_handoff.js",
  namedSymbol: "realizeRequirementHandoff", computeRegime: "F_D" as const,
  inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
  failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
export const REQUIREMENT_HANDOFF_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor> = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...descriptor,
  descriptorDigest: sha256Canonical(descriptor),
});
export function realizeRequirementHandoff(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.requirementHandoffBasis;
  if (basis === undefined || basis.cCall.cCallRef !== occurrence.cCallRef) throw new TypeError("requirement handoff requires native declaration basis");
  const result = projectRequirementHandoffCandidate(basis, input);
  if (result === null) throw new TypeError("requirement handoff fixed input refused");
  const resultCandidate = result as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate, evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
      implementationRef: ids.implementationRef, inputDigest: sha256Canonical(input), outputDigest: sha256Canonical(resultCandidate) }] });
}
