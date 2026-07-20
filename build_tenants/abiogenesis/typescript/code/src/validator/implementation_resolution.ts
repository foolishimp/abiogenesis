import type { PackagedLeafImplementationDescriptor } from "../implementation/contracts.js";
import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import {
  isImplementationResolutionCandidate,
  type ImplementationResolutionCandidate,
} from "../product/implementation_resolution.js";
import type { JsonValue } from "../product/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import {
  isProgramValidation,
  type ProgramValidation,
  type StaticDiagnostic,
  type StaticValidationRefusal,
} from "./validation.js";

export interface ImplementationResolutionValidation {
  readonly kind: "implementation_resolution_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly validationRef: string;
  readonly validationDigest: Sha256Digest;
  readonly resolutionCandidateRef: string;
  readonly resolutionCandidateDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphFunctionRef: string;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
  readonly diagnostics: readonly [];
}

export type ImplementationResolutionValidationResult =
  | ImplementationResolutionValidation
  | StaticValidationRefusal;

const validations = new WeakSet<object>();

export function isImplementationResolutionValidation(value: object): boolean {
  return validations.has(value);
}

function invalid(
  subjectDigest: Sha256Digest,
  diagnostic: StaticDiagnostic,
): StaticValidationRefusal {
  return {
    kind: "static_validation_refusal",
    schemaVersion: "5.0.0",
    disposition: "invalid",
    stage: "implementation_resolution",
    subjectDigest,
    diagnostics: [diagnostic],
  };
}

export function validateImplementationResolution(
  candidate: ImplementationResolutionCandidate,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  graphFunction: Readonly<GraphFunction>,
  descriptor: PackagedLeafImplementationDescriptor,
): ImplementationResolutionValidationResult {
  if (!isImplementationResolutionCandidate(candidate)) {
    return invalid(candidate.resolutionCandidateDigest, {
      code: "raw_subject_mismatch",
      path: "$",
      message: "resolution candidate was not constructed by the Product boundary",
    });
  }
  const binding = publication.implementationBindings.find(
    (value) => value.bindingRef === candidate.implementationBindingRef,
  );
  const node = graphFunction.template.nodes.find((value) => value.nodeRef === candidate.nodeRef);
  const candidateBody = {
    catalogViewId: candidate.catalogViewId,
    catalogViewDigest: candidate.catalogViewDigest,
    publicationDigest: candidate.publicationDigest,
    programValidationRef: candidate.programValidationRef,
    graphFunctionRef: candidate.graphFunctionRef,
    graphFunctionDigest: candidate.graphFunctionDigest,
    nodeRef: candidate.nodeRef,
    implementationBindingRef: candidate.implementationBindingRef,
    implementationRef: candidate.implementationRef,
    packageName: candidate.packageName,
    packageVersion: candidate.packageVersion,
    modulePath: candidate.modulePath,
    namedSymbol: candidate.namedSymbol,
    computeRegime: candidate.computeRegime,
    inputContractRef: candidate.inputContractRef,
    outputContractRef: candidate.outputContractRef,
    failureContractRef: candidate.failureContractRef,
    refusalContractRef: candidate.refusalContractRef,
    implementationDescriptorDigest: candidate.implementationDescriptorDigest,
  };
  if (
    !isProgramValidation(programValidation) ||
    candidate.resolutionCandidateDigest !== sha256Canonical(candidateBody as unknown as JsonValue) ||
    candidate.publicationDigest !== sha256Canonical(publication as unknown as JsonValue) ||
    candidate.programValidationRef !== programValidation.validationRef ||
    candidate.graphFunctionRef !== graphFunction.name ||
    candidate.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue) ||
    binding === undefined ||
    node?.implementationBindingRef !== binding.bindingRef ||
    binding.implementationRef !== candidate.implementationRef ||
    descriptor.descriptorDigest !== candidate.implementationDescriptorDigest ||
    descriptor.implementationRef !== candidate.implementationRef ||
    descriptor.packageName !== candidate.packageName ||
    descriptor.packageVersion !== candidate.packageVersion ||
    descriptor.modulePath !== candidate.modulePath ||
    descriptor.namedSymbol !== candidate.namedSymbol ||
    descriptor.computeRegime !== candidate.computeRegime ||
    descriptor.inputContractRef !== candidate.inputContractRef ||
    descriptor.outputContractRef !== candidate.outputContractRef ||
    descriptor.failureContractRef !== candidate.failureContractRef ||
    descriptor.refusalContractRef !== candidate.refusalContractRef ||
    binding.computeRegime !== candidate.computeRegime ||
    binding.inputContractRef !== candidate.inputContractRef ||
    binding.outputContractRef !== candidate.outputContractRef ||
    binding.failureContractRef !== candidate.failureContractRef ||
    binding.refusalContractRef !== candidate.refusalContractRef
  ) {
    return invalid(candidate.resolutionCandidateDigest, {
      code: "invalid_reference",
      path: "$",
      message: "implementation resolution does not preserve exact declaration, package, and contract identity",
    });
  }
  const body = {
    resolutionCandidateRef: candidate.resolutionCandidateRef,
    resolutionCandidateDigest: candidate.resolutionCandidateDigest,
    programValidationRef: programValidation.validationRef,
    graphFunctionRef: graphFunction.name,
    implementationBindingRef: candidate.implementationBindingRef,
    implementationRef: candidate.implementationRef,
  };
  const validationDigest = sha256Canonical(body as unknown as JsonValue);
  const validation = deepFreeze({
    kind: "implementation_resolution_validation" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "valid" as const,
    validationRef: `implementation-resolution-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
    validationDigest,
    ...body,
    diagnostics: [] as const,
  }) as ImplementationResolutionValidation;
  validations.add(validation);
  return validation;
}
