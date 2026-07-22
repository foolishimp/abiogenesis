import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import {
  isImplementationResolutionCandidate,
  isPackagedLeafImplementationDescriptor,
  type ImplementationResolutionCandidate,
  type PackagedLeafImplementationDescriptor,
} from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isGraphValidation,
  type GraphValidation,
} from "./graph.js";
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
  readonly graphValidationRef: string;
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
  graphValidation: GraphValidation,
  graphFunction: Readonly<GraphFunction>,
  descriptor: Readonly<PackagedLeafImplementationDescriptor>,
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
    graphValidationRef: candidate.graphValidationRef,
    graphValidationDigest: candidate.graphValidationDigest,
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
    implementationBindingDigest: candidate.implementationBindingDigest,
    implementationDescriptorDigest: candidate.implementationDescriptorDigest,
  };
  if (
    !isProgramValidation(programValidation) ||
    !isGraphValidation(graphValidation) ||
    !isPackagedLeafImplementationDescriptor(descriptor) ||
    candidate.resolutionCandidateDigest !== sha256Canonical(candidateBody as unknown as JsonValue) ||
    candidate.publicationDigest !== sha256Canonical(publication as unknown as JsonValue) ||
    candidate.programValidationRef !== programValidation.validationRef ||
    candidate.graphValidationRef !== graphValidation.validationRef ||
    candidate.graphValidationDigest !== graphValidation.validationDigest ||
    candidate.graphFunctionRef !== graphFunction.name ||
    candidate.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue) ||
    graphValidation.graphFunctionRef !== graphFunction.name ||
    graphValidation.graphFunctionDigest !== candidate.graphFunctionDigest ||
    binding === undefined ||
    node?.implementationBindingRef !== binding.bindingRef ||
    binding.implementationRef !== candidate.implementationRef ||
    candidate.implementationBindingDigest !== sha256Canonical(binding as unknown as JsonValue) ||
    binding.implementationRef !== candidate.implementationRef ||
    binding.packageName !== candidate.packageName ||
    binding.packageVersion !== candidate.packageVersion ||
    binding.modulePath !== candidate.modulePath ||
    binding.namedSymbol !== candidate.namedSymbol ||
    binding.computeRegime !== candidate.computeRegime ||
    binding.inputContractRef !== candidate.inputContractRef ||
    binding.outputContractRef !== candidate.outputContractRef ||
    binding.failureContractRef !== candidate.failureContractRef ||
    binding.refusalContractRef !== candidate.refusalContractRef ||
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
    descriptor.refusalContractRef !== candidate.refusalContractRef
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
    graphValidationRef: graphValidation.validationRef,
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
