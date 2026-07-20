import { HELLO_WORLD_IMPLEMENTATION_DESCRIPTOR } from "../implementation/hello_world.js";
import type { PackagedLeafImplementationDescriptor } from "../implementation/contracts.js";
import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import {
  isProgramValidation,
  type ProgramValidation,
} from "../validator/validation.js";
import type { JsonValue } from "./canonical_json.js";
import { catalogViewContentDigest, type CatalogView } from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";
import { deepFreeze } from "./immutable.js";

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

function packagedImplementations(): readonly PackagedLeafImplementationDescriptor[] {
  return [HELLO_WORLD_IMPLEMENTATION_DESCRIPTOR];
}

export function resolveImplementation(
  catalogView: CatalogView,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  graphFunctionRef: string,
  nodeRef: string,
): ImplementationResolutionResult {
  if (
    !isProgramValidation(programValidation) ||
    programValidation.publicationDigest !== sha256Canonical(publication as unknown as JsonValue)
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
  const binding = publication.implementationBindings.find(
    (value) => value.bindingRef === node?.implementationBindingRef,
  );
  if (node === undefined || binding === undefined) {
    return refusal("implementation_absent", "declared graph node lacks one ImplementationBinding");
  }
  const matches = packagedImplementations().filter((descriptor) =>
    descriptor.implementationRef === binding.implementationRef &&
    descriptor.packageName === binding.packageName &&
    descriptor.packageVersion === binding.packageVersion &&
    descriptor.modulePath === binding.modulePath &&
    descriptor.namedSymbol === binding.namedSymbol);
  if (matches.length === 0) {
    return refusal("implementation_absent", "no packaged LeafImplementation matches the declared binding");
  }
  if (matches.length !== 1) {
    return refusal("ambiguous_implementation", "more than one packaged LeafImplementation matches the declared binding");
  }
  const descriptor = matches[0]!;
  const {
    kind: _descriptorKind,
    schemaVersion: _descriptorSchemaVersion,
    descriptorDigest: _descriptorDigest,
    ...descriptorBody
  } = descriptor;
  const contractRefs = new Set(publication.contracts.map((contract) => contract.contractRef));
  if (
    descriptor.descriptorDigest !== sha256Canonical(descriptorBody as unknown as JsonValue) ||
    descriptor.computeRegime !== binding.computeRegime ||
    descriptor.inputContractRef !== binding.inputContractRef ||
    descriptor.outputContractRef !== binding.outputContractRef ||
    descriptor.failureContractRef !== binding.failureContractRef ||
    descriptor.refusalContractRef !== binding.refusalContractRef ||
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
    graphFunctionRef,
    graphFunctionDigest: sha256Canonical(graphFunction as unknown as JsonValue),
    nodeRef,
    implementationBindingRef: binding.bindingRef,
    implementationRef: descriptor.implementationRef,
    packageName: descriptor.packageName,
    packageVersion: descriptor.packageVersion,
    modulePath: descriptor.modulePath,
    namedSymbol: descriptor.namedSymbol,
    computeRegime: descriptor.computeRegime,
    inputContractRef: descriptor.inputContractRef,
    outputContractRef: descriptor.outputContractRef,
    failureContractRef: descriptor.failureContractRef,
    refusalContractRef: descriptor.refusalContractRef,
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

export function rootPackagedImplementationDescriptor(): PackagedLeafImplementationDescriptor {
  return HELLO_WORLD_IMPLEMENTATION_DESCRIPTOR;
}
