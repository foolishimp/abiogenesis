import { REQUIREMENT_HANDOFF_IDS as ids } from "../gtl/requirement_handoff.js";
import { projectRequirementHandoffCandidate } from "../abg/requirement_handoff.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, ABI5_PRODUCT_ID } from "../product/contracts.js";
import { semanticStageImplementationBindings } from "../gtl/semantic_stage_publication.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectSemanticJobIntake } from "../abg/semantic_job.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
const placeholder = `sha256:${"0".repeat(64)}` as const;
const { kind: _jobKind, bindingRef: _jobBindingRef, ...jobDescriptor } = semanticStageImplementationBindings({
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION, productId: ABI5_PRODUCT_ID,
  artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder,
}).find(binding => binding.implementationRef === SEMANTIC_STAGE_IDS.jobIntakeImplementationRef)!;
export const SEMANTIC_JOB_INTAKE_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor> = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...jobDescriptor,
  descriptorDigest: sha256Canonical(jobDescriptor as unknown as JsonValue),
});
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
export function realizeSemanticJobIntake(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  const value = occurrence.semanticStageBasis === undefined ? null : projectSemanticJobIntake(occurrence.semanticStageBasis, input);
  if (value === null) throw new TypeError("native job intake requires exact installed declaration and root input ancestry");
  const output = value as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", resultCandidate: output,
    evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: SEMANTIC_STAGE_IDS.jobIntakeImplementationRef,
      inputDigest: sha256Canonical(input), outputDigest: sha256Canonical(output) }] });
}
