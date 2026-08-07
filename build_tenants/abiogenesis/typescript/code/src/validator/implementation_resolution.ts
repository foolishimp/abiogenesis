import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import { isExecutableCLeaf } from "../gtl/c_algebra.js";
import {
  isImplementationResolutionCandidate,
  isImplementationResolutionSetCandidate,
  isLeafImplementationResolutionCandidate,
  isPackagedLeafImplementationDescriptor,
  type ImplementationResolutionCandidate,
  type ImplementationResolutionSetCandidate,
  type LeafImplementationResolutionCandidate,
  type PackagedLeafImplementationDescriptor,
} from "../product/implementation_resolution.js";
import type { GraphFunctionCatalogView } from "../product/catalog.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
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

export interface ImplementationResolutionSetValidation {
  readonly kind: "implementation_resolution_set_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly validationRef: string;
  readonly validationDigest: Sha256Digest;
  readonly setCandidateRef: string;
  readonly setCandidateDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly executableLeafKeys: readonly string[];
  readonly leafResolutionCandidateDigests: readonly Sha256Digest[];
  readonly diagnostics: readonly [];
}

export type ImplementationResolutionSetValidationResult =
  | ImplementationResolutionSetValidation
  | StaticValidationRefusal;

const validations = new WeakSet<object>();
const setValidations = new WeakSet<object>();

export function isImplementationResolutionValidation(value: object): boolean {
  return validations.has(value);
}

export function isImplementationResolutionSetValidation(value: object): boolean {
  return setValidations.has(value);
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
  const term = node?.term;
  const candidateBody = {
    catalogBasisDigest: candidate.catalogBasisDigest,
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
    candidate.graphFunctionRef !== graphFunction.id ||
    candidate.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue) ||
    graphValidation.graphFunctionRef !== graphFunction.id ||
    graphValidation.graphFunctionDigest !== candidate.graphFunctionDigest ||
    binding === undefined ||
    term === undefined ||
    !isExecutableCLeaf(term) ||
    term.requirement.implementationBindingRef !== binding.bindingRef ||
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
    graphFunctionRef: graphFunction.id,
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

function leafCandidateBody(candidate: LeafImplementationResolutionCandidate): Readonly<Record<string, unknown>> {
  return {
    requirementKey: candidate.requirementKey,
    requirementKeyDigest: candidate.requirementKeyDigest,
    catalogBasisDigest: candidate.catalogBasisDigest,
    catalogViewDigest: candidate.catalogViewDigest,
    publicationDigest: candidate.publicationDigest,
    programValidationRef: candidate.programValidationRef,
    graphFunctionRef: candidate.graphFunctionRef,
    graphFunctionDigest: candidate.graphFunctionDigest,
    nodeRef: candidate.nodeRef,
    programLocusRef: candidate.programLocusRef,
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
}

export function validateImplementationResolutionSet(
  candidate: ImplementationResolutionSetCandidate,
  catalogView: GraphFunctionCatalogView,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  descriptors: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): ImplementationResolutionSetValidationResult {
  const subjectDigest = candidate.setCandidateDigest;
  if (
    !isImplementationResolutionSetCandidate(candidate) ||
    candidate.rows.some((row) => !isLeafImplementationResolutionCandidate(row))
  ) {
    return invalid(subjectDigest, {
      code: "raw_subject_mismatch",
      path: "$",
      message: "resolution set was not constructed by the Product boundary",
    });
  }
  const setBody = {
    catalogBasisDigest: candidate.catalogBasisDigest,
    catalogViewDigest: candidate.catalogViewDigest,
    publicationDigest: candidate.publicationDigest,
    programValidationRef: candidate.programValidationRef,
    executableLeafKeys: candidate.executableLeafKeys,
    rows: candidate.rows,
  };
  const catalogViewDigest = sha256Canonical({
    catalogBasisDigest: catalogView.catalogBasisDigest,
    allowlist: catalogView.allowlist,
    entries: catalogView.entries.map((entry) => entry.entryDigest),
    declarationEntries: catalogView.declarationEntries.map(
      (entry) => entry.entryDigest,
    ),
  } as unknown as JsonValue);
  if (
    !isProgramValidation(programValidation) ||
    candidate.setCandidateDigest !== sha256Canonical(setBody as unknown as JsonValue) ||
    candidate.publicationDigest !== sha256Canonical(publication as unknown as JsonValue) ||
    candidate.publicationDigest !== programValidation.publicationDigest ||
    candidate.programValidationRef !== programValidation.validationRef ||
    candidate.catalogBasisDigest !== catalogView.catalogBasisDigest ||
    candidate.catalogViewDigest !== catalogView.viewDigest ||
    catalogViewDigest !== catalogView.viewDigest ||
    canonicalJson(candidate.executableLeafKeys as unknown as JsonValue) !==
      canonicalJson(programValidation.transitiveReachableExecutableLeafKeys as unknown as JsonValue) ||
    candidate.rows.length !== programValidation.executableLeafRows.length
  ) {
    return invalid(subjectDigest, {
      code: "invalid_reference",
      path: "$",
      message: "resolution set does not preserve the exact catalog, publication, Program, and executable-key basis",
    });
  }

  const contractRefs = new Set(publication.contracts.map((contract) => contract.contractRef));
  for (const [index, row] of candidate.rows.entries()) {
    const declaration = programValidation.executableLeafRows[index];
    const graphFunction = publication.graphFunctions.find(
      (value) => value.id === row.graphFunctionRef,
    );
    const bindings = publication.implementationBindings.filter(
      (value) => value.bindingRef === row.implementationBindingRef,
    );
    const binding = bindings[0];
    const matchingDescriptors = descriptors.filter((descriptor) =>
      isPackagedLeafImplementationDescriptor(descriptor) &&
      descriptor.descriptorDigest === row.implementationDescriptorDigest &&
      descriptor.implementationRef === row.implementationRef &&
      descriptor.packageName === row.packageName &&
      descriptor.packageVersion === row.packageVersion &&
      descriptor.modulePath === row.modulePath &&
      descriptor.namedSymbol === row.namedSymbol &&
      descriptor.computeRegime === row.computeRegime &&
      descriptor.inputContractRef === row.inputContractRef &&
      descriptor.outputContractRef === row.outputContractRef &&
      descriptor.failureContractRef === row.failureContractRef &&
      descriptor.refusalContractRef === row.refusalContractRef);
    if (
      declaration === undefined ||
      row.requirementKey !== candidate.executableLeafKeys[index] ||
      row.requirementKey !== declaration.requirementKey ||
      row.requirementKeyDigest !== declaration.requirementKeyDigest ||
      row.programValidationRef !== programValidation.validationRef ||
      row.catalogBasisDigest !== catalogView.catalogBasisDigest ||
      row.catalogViewDigest !== catalogView.viewDigest ||
      row.publicationDigest !== candidate.publicationDigest ||
      row.leafResolutionCandidateDigest !==
        sha256Canonical(leafCandidateBody(row) as unknown as JsonValue) ||
      graphFunction === undefined ||
      row.graphFunctionRef !== declaration.graphFunctionRef ||
      row.graphFunctionDigest !== declaration.graphFunctionDigest ||
      row.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue) ||
      row.nodeRef !== declaration.nodeRef ||
      row.programLocusRef !== declaration.programLocusRef ||
      bindings.length !== 1 ||
      binding === undefined ||
      row.implementationBindingDigest !== sha256Canonical(binding as unknown as JsonValue) ||
      binding.bindingRef !== declaration.requirement.implementationBindingRef ||
      binding.implementationRef !== row.implementationRef ||
      binding.packageName !== row.packageName ||
      binding.packageVersion !== row.packageVersion ||
      binding.modulePath !== row.modulePath ||
      binding.namedSymbol !== row.namedSymbol ||
      binding.computeRegime !== declaration.fibre ||
      binding.computeRegime !== row.computeRegime ||
      binding.inputContractRef !== declaration.requirement.inputContractRef ||
      binding.inputContractRef !== row.inputContractRef ||
      binding.outputContractRef !== declaration.requirement.outputContractRef ||
      binding.outputContractRef !== row.outputContractRef ||
      binding.failureContractRef !== declaration.requirement.failureContractRef ||
      binding.failureContractRef !== row.failureContractRef ||
      binding.refusalContractRef !== declaration.requirement.refusalContractRef ||
      binding.refusalContractRef !== row.refusalContractRef ||
      matchingDescriptors.length !== 1 ||
      [
        declaration.requirement.inputContractRef,
        declaration.requirement.outputContractRef,
        declaration.requirement.evidenceContractRef,
        declaration.requirement.failureContractRef,
        declaration.requirement.refusalContractRef,
        declaration.requirement.judgmentContractRef,
      ].some((contractRef) => !contractRefs.has(contractRef)) ||
      catalogView.entries.filter((selected) =>
        selected.kind === "graph_function_catalog_entry" &&
        selected.definitionRef === declaration.graphFunctionRef &&
        selected.programMembershipRefs.includes(programValidation.programRef)).length !== 1
    ) {
      return invalid(subjectDigest, {
        code: "invalid_reference",
        path: `$.rows[${index}]`,
        message: "resolution row does not preserve one exact executable declaration, binding, package descriptor, and catalog selection",
      });
    }
  }

  const body = {
    setCandidateRef: candidate.setCandidateRef,
    setCandidateDigest: candidate.setCandidateDigest,
    programValidationRef: programValidation.validationRef,
    executableLeafKeys: candidate.executableLeafKeys,
    leafResolutionCandidateDigests: candidate.rows.map(
      (row) => row.leafResolutionCandidateDigest,
    ),
  };
  const validationDigest = sha256Canonical(body as unknown as JsonValue);
  const validation = deepFreeze({
    kind: "implementation_resolution_set_validation" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "valid" as const,
    validationRef: `implementation-resolution-set-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
    validationDigest,
    ...body,
    diagnostics: [] as const,
  }) as ImplementationResolutionSetValidation;
  setValidations.add(validation);
  return validation;
}
