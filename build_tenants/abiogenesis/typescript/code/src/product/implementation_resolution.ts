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
import {
  lookupGraphFunctionDefinition,
  type GraphFunctionCatalogView,
} from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductInstall } from "./environment.js";
import { resolveExactMatch } from "./exact_match.js";
import { installedProductContentMatches } from "./install_product.js";
import { loadVerifiedInstalledModule } from "./installed_module.js";
import {
  isResolvedExecutionDeclarationClosure,
  type ResolvedExecutionDeclarationClosure,
} from "./declaration_closure.js";
import { modulePublicationSemanticDigest } from "./publication.js";

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
  readonly catalogBasisDigest: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphValidationDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly graphFunctionOwnerProductId: string;
  readonly graphFunctionPublicationDigest: Sha256Digest;
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
  readonly implementationOwnerProductId: string;
  readonly implementationPublicationDigest: Sha256Digest;
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
  readonly catalogBasisDigest: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly graphFunctionOwnerProductId: string;
  readonly graphFunctionPublicationDigest: Sha256Digest;
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
  readonly implementationOwnerProductId: string;
  readonly implementationPublicationDigest: Sha256Digest;
}

export interface ImplementationResolutionSetCandidate {
  readonly kind: "implementation_resolution_set_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly setCandidateRef: string;
  readonly setCandidateDigest: Sha256Digest;
  readonly catalogBasisDigest: string;
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
    )
  ) {
    return setRefusal(
      "implementation_absent",
      null,
      "published implementation bindings are not carried by the exact admitted Product install",
    );
  }
  const descriptors: PackagedLeafImplementationDescriptor[] = [];
  const modulePaths = [...new Set(
    publication.implementationBindings.map((binding) => binding.modulePath),
  )];
  if (
    modulePaths.length === 0 &&
    !(await installedProductContentMatches(install))
  ) {
    return setRefusal(
      "implementation_absent",
      null,
      "published implementation bindings are not carried by the exact admitted Product install",
    );
  }
  for (const modulePath of modulePaths) {
    const moduleResult = await loadVerifiedInstalledModule(install, modulePath);
    if (moduleResult.kind === "refused") {
      return setRefusal(
        "implementation_absent",
        null,
        moduleResult.code === "path_escape"
          ? "published implementation module escapes the admitted Product install"
          : moduleResult.code === "content_mismatch"
          ? "published implementation module differs from the admitted Product install"
          : "published implementation module cannot be loaded from the admitted Product install",
      );
    }
    descriptors.push(
      ...Object.values(moduleResult.module).filter(
        isPackagedLeafImplementationDescriptor,
      ),
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
  catalogView: GraphFunctionCatalogView,
  declarationClosure: ResolvedExecutionDeclarationClosure,
  programValidation: ProgramValidation,
  declaration: ValidatedExecutableLeaf,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): LeafImplementationResolutionCandidate | ImplementationResolutionSetRefusal {
  const publications = declarationClosure.publications;
  const requiresCallerSelection = declaration.graphFunctionRef ===
    declarationClosure.selectedGraphFunctionRef;
  const selectedRowLookup = requiresCallerSelection
    ? lookupGraphFunctionDefinition(
        catalogView,
        declaration.graphFunctionRef,
        programValidation.programRef,
      )
    : null;
  const selectedRow = selectedRowLookup?.kind ===
      "graph_function_definition_lookup_exact"
    ? selectedRowLookup.entry
    : null;
  const graphFunctionMatch = resolveExactMatch(
    publications.flatMap((publication) => publication.graphFunctions),
    (value) => value.name === declaration.graphFunctionRef,
  );
  if (
    (requiresCallerSelection && selectedRow === null) ||
    graphFunctionMatch.kind !== "one" ||
    (selectedRow !== null &&
      (selectedRow.kind !== "graph_function_catalog_entry" ||
        selectedRow.definitionRef !== declaration.graphFunctionRef)) ||
    sha256Canonical(graphFunctionMatch.value as unknown as JsonValue) !==
      declaration.graphFunctionDigest
  ) {
    return setRefusal(
      "selection_mismatch",
      declaration.requirementKey,
      "validated executable leaf is not selected under the exact catalog and Program basis",
    );
  }
  const graphFunctionOwnerMatches = publications.filter((publication) =>
    publication.graphFunctions.some((value) =>
      value.name === declaration.graphFunctionRef &&
      sha256Canonical(value as unknown as JsonValue) ===
        declaration.graphFunctionDigest
    )
  );
  if (
    graphFunctionOwnerMatches.length !== 1 ||
    (selectedRow !== null &&
      (selectedRow.owningProductId !==
          graphFunctionOwnerMatches[0]!.owningProductId ||
        selectedRow.publicationDigest !==
          modulePublicationSemanticDigest(graphFunctionOwnerMatches[0]!))) ||
    declarationClosure.graphFunctionOwners.filter((owner) =>
      owner.declarationRef === declaration.graphFunctionRef &&
      owner.productId === graphFunctionOwnerMatches[0]!.owningProductId &&
      owner.moduleRef === graphFunctionOwnerMatches[0]!.moduleRef &&
      owner.publicationDigest ===
        modulePublicationSemanticDigest(graphFunctionOwnerMatches[0]!)
    ).length !== 1
  ) {
    return setRefusal(
      "selection_mismatch",
      declaration.requirementKey,
      "catalog selection and GraphFunction publication owner disagree",
    );
  }
  const matchingBindings = publications.flatMap((publication) =>
    publication.implementationBindings,
  ).filter(
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
  const implementationOwnerMatches = publications.filter((publication) =>
    publication.implementationBindings.some((candidate) =>
      candidate.bindingRef === binding.bindingRef &&
      sha256Canonical(candidate as unknown as JsonValue) ===
        sha256Canonical(binding as unknown as JsonValue)
    )
  );
  if (implementationOwnerMatches.length !== 1) {
    return setRefusal(
      "ambiguous_implementation",
      declaration.requirementKey,
      "ImplementationBinding does not resolve to one exact publication owner",
    );
  }
  const graphFunctionOwner = graphFunctionOwnerMatches[0]!;
  const implementationOwner = implementationOwnerMatches[0]!;
  if (
    declarationClosure.implementationBindingOwners.filter((owner) =>
      owner.declarationRef === binding.bindingRef &&
      owner.productId === implementationOwner.owningProductId &&
      owner.moduleRef === implementationOwner.moduleRef &&
      owner.publicationDigest ===
        modulePublicationSemanticDigest(implementationOwner)
    ).length !== 1 ||
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
  const allContracts = publications.flatMap((publication) =>
    publication.contracts.filter((contract) =>
      declarationClosure.contractOwners.some((owner) =>
        owner.declarationRef === contract.contractRef &&
        owner.productId === publication.owningProductId &&
        owner.moduleRef === publication.moduleRef &&
        owner.publicationDigest ===
          modulePublicationSemanticDigest(publication)
      )
    )
  );
  if ([
    declaration.requirement.inputContractRef,
    declaration.requirement.outputContractRef,
    declaration.requirement.evidenceContractRef,
    declaration.requirement.failureContractRef,
    declaration.requirement.refusalContractRef,
    declaration.requirement.judgmentContractRef,
  ].some((contractRef) =>
    allContracts.filter((contract) => contract.contractRef === contractRef)
      .length !== 1
  )) {
    return setRefusal(
      "contract_mismatch",
      declaration.requirementKey,
      "validated executable requirement references an unpublished contract",
    );
  }
  const body = {
    requirementKey: declaration.requirementKey,
    requirementKeyDigest: declaration.requirementKeyDigest,
    catalogBasisDigest: catalogView.catalogBasisDigest,
    catalogViewDigest: catalogView.viewDigest,
    publicationDigest: programValidation.publicationDigest,
    programValidationRef: programValidation.validationRef,
    graphFunctionRef: declaration.graphFunctionRef,
    graphFunctionDigest: declaration.graphFunctionDigest,
    graphFunctionOwnerProductId: graphFunctionOwner.owningProductId,
    graphFunctionPublicationDigest:
      modulePublicationSemanticDigest(graphFunctionOwner),
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
    implementationOwnerProductId: implementationOwner.owningProductId,
    implementationPublicationDigest:
      modulePublicationSemanticDigest(implementationOwner),
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
  catalogView: GraphFunctionCatalogView,
  declarationClosure: ResolvedExecutionDeclarationClosure,
  programValidation: ProgramValidation,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): ImplementationResolutionSetResult {
  const publications = declarationClosure.publications;
  const rootPublicationMatches = publications.filter((publication) =>
    sha256Canonical(publication as unknown as JsonValue) ===
      programValidation.publicationDigest
  );
  const selectedGraphFunctionRefs = new Set(
    declarationClosure.graphFunctionOwners.map((owner) => owner.declarationRef),
  );
  const selectedExecutableRows = programValidation.executableLeafRows.filter(
    (row) => selectedGraphFunctionRefs.has(row.graphFunctionRef),
  );
  if (
    !isProgramValidation(programValidation) ||
    !isResolvedExecutionDeclarationClosure(declarationClosure) ||
    declarationClosure.catalogViewDigest !== catalogView.viewDigest ||
    declarationClosure.programRef !== programValidation.programRef ||
    rootPublicationMatches.length !== 1
  ) {
    return setRefusal(
      "invalid_program_validation",
      null,
      "implementation-set resolution requires exact ProgramValidation and publication",
    );
  }
  const rows: LeafImplementationResolutionCandidate[] = [];
  for (const declaration of selectedExecutableRows) {
    const resolved = resolveValidatedLeaf(
      catalogView,
      declarationClosure,
      programValidation,
      declaration,
      packagedImplementations,
    );
    if (resolved.kind === "implementation_resolution_set_refusal") return resolved;
    rows.push(resolved);
  }
  const body = {
    catalogBasisDigest: catalogView.catalogBasisDigest,
    catalogViewDigest: catalogView.viewDigest,
    publicationDigest: programValidation.publicationDigest,
    programValidationRef: programValidation.validationRef,
    executableLeafKeys: selectedExecutableRows.map((row) => row.requirementKey),
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
  catalogView: GraphFunctionCatalogView,
  declarationClosure: ResolvedExecutionDeclarationClosure,
  programValidation: ProgramValidation,
  graphValidation: GraphValidation,
  graphFunctionRef: string,
  nodeRef: string,
  packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[],
): ImplementationResolutionResult {
  const publications = declarationClosure.publications;
  if (
    !isProgramValidation(programValidation) ||
    !isResolvedExecutionDeclarationClosure(declarationClosure) ||
    declarationClosure.catalogViewDigest !== catalogView.viewDigest ||
    publications.filter((publication) =>
      programValidation.publicationDigest ===
        sha256Canonical(publication as unknown as JsonValue)
    ).length !== 1 ||
    !isGraphValidation(graphValidation) ||
    graphValidation.programValidationRef !== programValidation.validationRef ||
    graphValidation.graphFunctionRef !== graphFunctionRef
  ) {
    return refusal("invalid_program_validation", "implementation resolution requires exact ProgramValidation");
  }
  const graphFunctionMatch = resolveExactMatch(
    publications.flatMap((publication) => publication.graphFunctions),
    (value) => value.name === graphFunctionRef,
  );
  if (
    graphFunctionMatch.kind !== "one" ||
    graphValidation.graphFunctionDigest !==
      sha256Canonical(graphFunctionMatch.value as unknown as JsonValue)
  ) {
    return refusal("invalid_program_validation", "GraphValidation does not bind the exact GraphFunction");
  }
  const set = resolveImplementationSet(
    catalogView,
    declarationClosure,
    programValidation,
    packagedImplementations,
  );
  if (set.kind === "implementation_resolution_set_refusal") {
    return refusal(
      set.code === "set_mismatch" ? "invalid_program_validation" : set.code,
      set.message,
    );
  }
  const match = resolveExactMatch(
    set.rows,
    (row) => row.graphFunctionRef === graphFunctionRef && row.nodeRef === nodeRef,
  );
  if (match.kind === "absent") {
    return refusal("implementation_absent", "declared graph node has no executable resolution row");
  }
  if (match.kind === "many") {
    return refusal("ambiguous_implementation", "declared graph node has more than one executable resolution row");
  }
  const leaf = match.value;
  const body = {
    catalogBasisDigest: leaf.catalogBasisDigest,
    catalogViewDigest: leaf.catalogViewDigest,
    publicationDigest: leaf.publicationDigest,
    programValidationRef: leaf.programValidationRef,
    graphValidationRef: graphValidation.validationRef,
    graphValidationDigest: graphValidation.validationDigest,
    graphFunctionRef: leaf.graphFunctionRef,
    graphFunctionDigest: leaf.graphFunctionDigest,
    graphFunctionOwnerProductId: leaf.graphFunctionOwnerProductId,
    graphFunctionPublicationDigest: leaf.graphFunctionPublicationDigest,
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
    implementationOwnerProductId: leaf.implementationOwnerProductId,
    implementationPublicationDigest: leaf.implementationPublicationDigest,
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
