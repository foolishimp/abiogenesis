import type { ComputeRegime, GraphFunction, ModulePublication } from "../gtl/contracts.js";
import {
  isGraphValidation,
  type GraphValidation,
} from "../validator/graph.js";
import {
  isProgramValidation,
  type ProgramValidation,
} from "../validator/validation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { catalogViewContentDigest, type CatalogView } from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export interface PackagedLeafImplementationDescriptor {
  readonly kind: "packaged_leaf_implementation_descriptor";
  readonly schemaVersion: "5.0.0";
  readonly descriptorDigest: Sha256Digest;
  readonly implementationRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: ComputeRegime;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
}

export interface ImplementationResolutionCandidate {
  readonly kind: "implementation_resolution_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly resolutionCandidateRef: string;
  readonly resolutionCandidateDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphValidationDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly nodeRef: string;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: "F_D" | "F_H" | "F_P";
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly implementationBindingDigest: Sha256Digest;
  readonly implementationDescriptorDigest: Sha256Digest;
}

export interface ImplementationResolutionRefusal {
  readonly kind: "implementation_resolution_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "ambiguous_implementation"
    | "contract_mismatch"
    | "implementation_absent"
    | "invalid_program_validation"
    | "selection_mismatch";
  readonly message: string;
}

export type ImplementationResolutionResult =
  | ImplementationResolutionCandidate
  | ImplementationResolutionRefusal;

const candidates = new WeakSet<object>();

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPackagedLeafImplementationDescriptor(
  value: unknown,
): value is Readonly<PackagedLeafImplementationDescriptor> {
  if (!isRecord(value)) return false;
  const body = {
    implementationRef: value.implementationRef,
    packageName: value.packageName,
    packageVersion: value.packageVersion,
    modulePath: value.modulePath,
    namedSymbol: value.namedSymbol,
    computeRegime: value.computeRegime,
    inputContractRef: value.inputContractRef,
    outputContractRef: value.outputContractRef,
    failureContractRef: value.failureContractRef,
    refusalContractRef: value.refusalContractRef,
  };
  return value.kind === "packaged_leaf_implementation_descriptor" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.descriptorDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.descriptorDigest) &&
    Object.values(body).every((field) => typeof field === "string" && field.length > 0) &&
    (value.computeRegime === "F_D" || value.computeRegime === "F_H" || value.computeRegime === "F_P") &&
    value.descriptorDigest === sha256Canonical(body as unknown as JsonValue);
}

export function isImplementationResolutionCandidate(value: object): boolean {
  return candidates.has(value);
}

function refusal(
  code: ImplementationResolutionRefusal["code"],
  message: string,
): ImplementationResolutionRefusal {
  return {
    kind: "implementation_resolution_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function resolveImplementation(
  catalogView: CatalogView,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  graphValidation: GraphValidation,
  graphFunctionRef: string,
  nodeRef: string,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): ImplementationResolutionResult {
  if (
    !isProgramValidation(programValidation) ||
    programValidation.publicationDigest !== sha256Canonical(publication as unknown as JsonValue) ||
    !isGraphValidation(graphValidation) ||
    graphValidation.programValidationRef !== programValidation.validationRef ||
    graphValidation.graphFunctionRef !== graphFunctionRef
  ) {
    return refusal("invalid_program_validation", "implementation resolution requires exact ProgramValidation");
  }
  const selectedRow = catalogView.selectedRows.find((row) => row.handle === graphFunctionRef);
  const graphFunction = publication.graphFunctions.find((value) => value.name === graphFunctionRef);
  if (
    catalogViewContentDigest(catalogView) !== catalogView.viewDigest ||
    selectedRow?.kind !== "graph_function" ||
    selectedRow.disposition !== "admitted" ||
    selectedRow.declarationOrContractRef !== graphFunctionRef ||
    !selectedRow.programMembershipRefs.includes(programValidation.programRef) ||
    graphFunction === undefined ||
    !programValidation.graphFunctionDigests.includes(sha256Canonical(graphFunction as unknown as JsonValue))
  ) {
    return refusal("selection_mismatch", "GraphFunction is not selected under the exact validated catalog basis");
  }
  const node = graphFunction.template.nodes.find((value) => value.nodeRef === nodeRef);
  const bindings = publication.implementationBindings.filter(
    (value) => value.bindingRef === node?.implementationBindingRef,
  );
  if (node === undefined || bindings.length === 0) {
    return refusal("implementation_absent", "declared graph node lacks one ImplementationBinding");
  }
  if (bindings.length !== 1) {
    return refusal("ambiguous_implementation", "more than one published ImplementationBinding matches the graph node");
  }
  const binding = bindings[0]!;
  const descriptors = packagedImplementations.filter((descriptor) =>
    isPackagedLeafImplementationDescriptor(descriptor) &&
    descriptor.implementationRef === binding.implementationRef &&
    descriptor.packageName === binding.packageName &&
    descriptor.packageVersion === binding.packageVersion &&
    descriptor.modulePath === binding.modulePath &&
    descriptor.namedSymbol === binding.namedSymbol &&
    descriptor.computeRegime === binding.computeRegime &&
    descriptor.inputContractRef === binding.inputContractRef &&
    descriptor.outputContractRef === binding.outputContractRef &&
    descriptor.failureContractRef === binding.failureContractRef &&
    descriptor.refusalContractRef === binding.refusalContractRef);
  if (descriptors.length === 0) {
    return refusal("implementation_absent", "no packaged LeafImplementation matches the declared binding");
  }
  if (descriptors.length !== 1) {
    return refusal("ambiguous_implementation", "more than one packaged LeafImplementation matches the declared binding");
  }
  const descriptor = descriptors[0]!;
  const implementationBindingDigest = sha256Canonical(binding as unknown as JsonValue);
  const contractRefs = new Set(publication.contracts.map((contract) => contract.contractRef));
  if (
    node.inputContractRef !== binding.inputContractRef ||
    node.outputContractRef !== binding.outputContractRef ||
    [
      binding.inputContractRef,
      binding.outputContractRef,
      binding.failureContractRef,
      binding.refusalContractRef,
    ].some((contractRef) => !contractRefs.has(contractRef))
  ) {
    return refusal("contract_mismatch", "leaf descriptor, binding, node, and published contracts disagree");
  }
  const body = {
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    publicationDigest: programValidation.publicationDigest,
    programValidationRef: programValidation.validationRef,
    graphValidationRef: graphValidation.validationRef,
    graphValidationDigest: graphValidation.validationDigest,
    graphFunctionRef,
    graphFunctionDigest: sha256Canonical(graphFunction as unknown as JsonValue),
    nodeRef,
    implementationBindingRef: binding.bindingRef,
    implementationRef: binding.implementationRef,
    packageName: binding.packageName,
    packageVersion: binding.packageVersion,
    modulePath: binding.modulePath,
    namedSymbol: binding.namedSymbol,
    computeRegime: binding.computeRegime,
    inputContractRef: binding.inputContractRef,
    outputContractRef: binding.outputContractRef,
    failureContractRef: binding.failureContractRef,
    refusalContractRef: binding.refusalContractRef,
    implementationBindingDigest,
    implementationDescriptorDigest: descriptor.descriptorDigest,
  };
  const resolutionCandidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "implementation_resolution_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "candidate" as const,
    resolutionCandidateRef: `implementation-resolution-candidate://abiogenesis/${resolutionCandidateDigest.slice("sha256:".length)}`,
    resolutionCandidateDigest,
    ...body,
  }) as ImplementationResolutionCandidate;
  candidates.add(candidate);
  return candidate;
}
