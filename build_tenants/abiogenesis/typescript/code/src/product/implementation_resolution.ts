import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ComputeRegime, ModulePublication } from "../gtl/contracts.js";
import {
  isGraphValidation,
  type GraphValidation,
} from "../validator/graph.js";
import {
  isProgramValidation,
  type ProgramValidation,
  type ValidatedExecutableLeaf,
} from "../validator/validation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { catalogViewContentDigest, type CatalogView } from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductInstall } from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";

export interface PackagedLeafImplementationDescriptor {
  readonly kind: "packaged_leaf_implementation_descriptor";
  readonly schemaVersion: "5.0.0";
  readonly descriptorDigest: Sha256Digest;
  readonly implementationRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: Exclude<ComputeRegime, "F_H">;
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
  readonly computeRegime: "F_D" | "F_P";
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

export interface LeafImplementationResolutionCandidate {
  readonly kind: "leaf_implementation_resolution_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly leafResolutionCandidateRef: string;
  readonly leafResolutionCandidateDigest: Sha256Digest;
  readonly requirementKey: string;
  readonly requirementKeyDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly nodeRef: string;
  readonly programLocusRef: string;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: "F_D" | "F_P";
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly implementationBindingDigest: Sha256Digest;
  readonly implementationDescriptorDigest: Sha256Digest;
}

export interface ImplementationResolutionSetCandidate {
  readonly kind: "implementation_resolution_set_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly setCandidateRef: string;
  readonly setCandidateDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly executableLeafKeys: readonly string[];
  readonly rows: readonly LeafImplementationResolutionCandidate[];
}

export interface ImplementationResolutionSetRefusal {
  readonly kind: "implementation_resolution_set_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ImplementationResolutionRefusal["code"] | "set_mismatch";
  readonly requirementKey: string | null;
  readonly message: string;
}

export type ImplementationResolutionSetResult =
  | ImplementationResolutionSetCandidate
  | ImplementationResolutionSetRefusal;

export type ImplementationResolutionResult =
  | ImplementationResolutionCandidate
  | ImplementationResolutionRefusal;

export async function loadInstalledImplementationDescriptors(
  install: ProductInstall,
  publication: Readonly<ModulePublication>,
): Promise<
  | readonly Readonly<PackagedLeafImplementationDescriptor>[]
  | ImplementationResolutionSetRefusal
> {
  if (
    publication.implementationBindings.some(
      (binding) =>
        binding.packageName !== install.packageName ||
        binding.packageVersion !== install.packageVersion,
    ) ||
    !(await installedProductContentMatches(install))
  ) {
    return setRefusal(
      "implementation_absent",
      null,
      "published implementation bindings are not carried by the exact admitted Product install",
    );
  }
  const descriptors: PackagedLeafImplementationDescriptor[] = [];
  for (const modulePath of new Set(
    publication.implementationBindings.map((binding) => binding.modulePath),
  )) {
    const exactPath = resolve(install.installedRoot, modulePath);
    const relation = relative(install.installedRoot, exactPath);
    if (relation.length === 0 || relation.startsWith("..") || isAbsolute(relation)) {
      return setRefusal(
        "implementation_absent",
        null,
        "published implementation module escapes the admitted Product install",
      );
    }
    let loaded: Record<string, unknown>;
    try {
      loaded = await import(pathToFileURL(exactPath).href) as Record<string, unknown>;
    } catch {
      return setRefusal(
        "implementation_absent",
        null,
        "published implementation module cannot be loaded from the admitted Product install",
      );
    }
    descriptors.push(
      ...Object.values(loaded).filter(isPackagedLeafImplementationDescriptor),
    );
  }
  return Object.freeze(descriptors);
}

const candidates = new WeakSet<object>();
const setCandidates = new WeakSet<object>();
const leafCandidates = new WeakSet<object>();

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
    (value.computeRegime === "F_D" || value.computeRegime === "F_P") &&
    value.descriptorDigest === sha256Canonical(body as unknown as JsonValue);
}

export function isImplementationResolutionCandidate(value: object): boolean {
  return candidates.has(value);
}

export function isImplementationResolutionSetCandidate(value: object): boolean {
  return setCandidates.has(value);
}

export function isLeafImplementationResolutionCandidate(value: object): boolean {
  return leafCandidates.has(value);
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

function setRefusal(
  code: ImplementationResolutionSetRefusal["code"],
  requirementKey: string | null,
  message: string,
): ImplementationResolutionSetRefusal {
  return {
    kind: "implementation_resolution_set_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    requirementKey,
    message,
  };
}

function resolveValidatedLeaf(
  catalogView: CatalogView,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  declaration: ValidatedExecutableLeaf,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): LeafImplementationResolutionCandidate | ImplementationResolutionSetRefusal {
  const selectedRow = catalogView.selectedRows.find(
    (row) =>
      row.handle === declaration.graphFunctionRef ||
      row.declarationOrContractRef === declaration.graphFunctionRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (value) => value.name === declaration.graphFunctionRef,
  );
  if (
    selectedRow?.kind !== "graph_function" ||
    selectedRow.disposition !== "admitted" ||
    selectedRow.declarationOrContractRef !== declaration.graphFunctionRef ||
    !selectedRow.programMembershipRefs.includes(programValidation.programRef) ||
    graphFunction === undefined ||
    sha256Canonical(graphFunction as unknown as JsonValue) !== declaration.graphFunctionDigest
  ) {
    return setRefusal(
      "selection_mismatch",
      declaration.requirementKey,
      "validated executable leaf is not selected under the exact catalog and Program basis",
    );
  }
  const matchingBindings = publication.implementationBindings.filter(
    (binding) => binding.bindingRef === declaration.requirement.implementationBindingRef,
  );
  if (matchingBindings.length === 0) {
    return setRefusal(
      "implementation_absent",
      declaration.requirementKey,
      "validated executable leaf lacks one published ImplementationBinding",
    );
  }
  if (matchingBindings.length !== 1) {
    return setRefusal(
      "ambiguous_implementation",
      declaration.requirementKey,
      "validated executable leaf resolves more than one published ImplementationBinding",
    );
  }
  const binding = matchingBindings[0]!;
  if (
    binding.computeRegime !== declaration.fibre ||
    binding.inputContractRef !== declaration.requirement.inputContractRef ||
    binding.outputContractRef !== declaration.requirement.outputContractRef ||
    binding.failureContractRef !== declaration.requirement.failureContractRef ||
    binding.refusalContractRef !== declaration.requirement.refusalContractRef
  ) {
    return setRefusal(
      "contract_mismatch",
      declaration.requirementKey,
      "validated executable leaf and ImplementationBinding contracts disagree",
    );
  }
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
    return setRefusal(
      "implementation_absent",
      declaration.requirementKey,
      "no packaged LeafImplementation matches the validated executable requirement",
    );
  }
  if (descriptors.length !== 1) {
    return setRefusal(
      "ambiguous_implementation",
      declaration.requirementKey,
      "more than one packaged LeafImplementation matches the validated executable requirement",
    );
  }
  const descriptor = descriptors[0]!;
  const contractRefs = new Set(publication.contracts.map((contract) => contract.contractRef));
  if ([
    declaration.requirement.inputContractRef,
    declaration.requirement.outputContractRef,
    declaration.requirement.evidenceContractRef,
    declaration.requirement.failureContractRef,
    declaration.requirement.refusalContractRef,
    declaration.requirement.judgmentContractRef,
  ].some((contractRef) => !contractRefs.has(contractRef))) {
    return setRefusal(
      "contract_mismatch",
      declaration.requirementKey,
      "validated executable requirement references an unpublished contract",
    );
  }
  const body = {
    requirementKey: declaration.requirementKey,
    requirementKeyDigest: declaration.requirementKeyDigest,
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    publicationDigest: programValidation.publicationDigest,
    programValidationRef: programValidation.validationRef,
    graphFunctionRef: declaration.graphFunctionRef,
    graphFunctionDigest: declaration.graphFunctionDigest,
    nodeRef: declaration.nodeRef,
    programLocusRef: declaration.programLocusRef,
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
    implementationBindingDigest: sha256Canonical(binding as unknown as JsonValue),
    implementationDescriptorDigest: descriptor.descriptorDigest,
  };
  const leafResolutionCandidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "leaf_implementation_resolution_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "candidate" as const,
    leafResolutionCandidateRef: `leaf-resolution-candidate://abiogenesis/${leafResolutionCandidateDigest.slice("sha256:".length)}`,
    leafResolutionCandidateDigest,
    ...body,
  }) as LeafImplementationResolutionCandidate;
  leafCandidates.add(candidate);
  return candidate;
}

export function resolveImplementationSet(
  catalogView: CatalogView,
  publication: Readonly<ModulePublication>,
  programValidation: ProgramValidation,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): ImplementationResolutionSetResult {
  if (
    !isProgramValidation(programValidation) ||
    programValidation.publicationDigest !== sha256Canonical(publication as unknown as JsonValue)
  ) {
    return setRefusal(
      "invalid_program_validation",
      null,
      "implementation-set resolution requires exact ProgramValidation and publication",
    );
  }
  if (catalogViewContentDigest(catalogView) !== catalogView.viewDigest) {
    return setRefusal(
      "selection_mismatch",
      null,
      "implementation-set resolution requires the exact admitted CatalogView",
    );
  }
  if (
    programValidation.executableLeafRows.length !==
      programValidation.transitiveReachableExecutableLeafKeys.length ||
    programValidation.executableLeafRows.some((row, index) =>
      row.requirementKey !== programValidation.transitiveReachableExecutableLeafKeys[index])
  ) {
    return setRefusal(
      "set_mismatch",
      null,
      "validated executable rows differ from the complete reachable key set",
    );
  }
  const rows: LeafImplementationResolutionCandidate[] = [];
  for (const declaration of programValidation.executableLeafRows) {
    const resolved = resolveValidatedLeaf(
      catalogView,
      publication,
      programValidation,
      declaration,
      packagedImplementations,
    );
    if (resolved.kind === "implementation_resolution_set_refusal") return resolved;
    rows.push(resolved);
  }
  const body = {
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    publicationDigest: programValidation.publicationDigest,
    programValidationRef: programValidation.validationRef,
    executableLeafKeys: programValidation.transitiveReachableExecutableLeafKeys,
    rows,
  };
  const setCandidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "implementation_resolution_set_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "candidate" as const,
    setCandidateRef: `implementation-resolution-set-candidate://abiogenesis/${setCandidateDigest.slice("sha256:".length)}`,
    setCandidateDigest,
    ...body,
  }) as ImplementationResolutionSetCandidate;
  setCandidates.add(candidate);
  return candidate;
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
  const graphFunction = publication.graphFunctions.find((value) => value.name === graphFunctionRef);
  if (
    graphFunction === undefined ||
    graphValidation.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue)
  ) {
    return refusal("invalid_program_validation", "GraphValidation does not bind the exact GraphFunction");
  }
  const set = resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  if (set.kind === "implementation_resolution_set_refusal") {
    return refusal(
      set.code === "set_mismatch" ? "invalid_program_validation" : set.code,
      set.message,
    );
  }
  const matches = set.rows.filter(
    (row) => row.graphFunctionRef === graphFunctionRef && row.nodeRef === nodeRef,
  );
  if (matches.length === 0) {
    return refusal("implementation_absent", "declared graph node has no executable resolution row");
  }
  if (matches.length !== 1) {
    return refusal("ambiguous_implementation", "declared graph node has more than one executable resolution row");
  }
  const leaf = matches[0]!;
  const body = {
    catalogViewId: leaf.catalogViewId,
    catalogViewDigest: leaf.catalogViewDigest,
    publicationDigest: leaf.publicationDigest,
    programValidationRef: leaf.programValidationRef,
    graphValidationRef: graphValidation.validationRef,
    graphValidationDigest: graphValidation.validationDigest,
    graphFunctionRef: leaf.graphFunctionRef,
    graphFunctionDigest: leaf.graphFunctionDigest,
    nodeRef: leaf.nodeRef,
    implementationBindingRef: leaf.implementationBindingRef,
    implementationRef: leaf.implementationRef,
    packageName: leaf.packageName,
    packageVersion: leaf.packageVersion,
    modulePath: leaf.modulePath,
    namedSymbol: leaf.namedSymbol,
    computeRegime: leaf.computeRegime,
    inputContractRef: leaf.inputContractRef,
    outputContractRef: leaf.outputContractRef,
    failureContractRef: leaf.failureContractRef,
    refusalContractRef: leaf.refusalContractRef,
    implementationBindingDigest: leaf.implementationBindingDigest,
    implementationDescriptorDigest: leaf.implementationDescriptorDigest,
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
