import { prepareInstalledProductModules, type InstalledProductModulePreparation } from "./installed_module.js";
import { isNativeSemanticRevisionGraphFunction } from "../gtl/semantic_revision_publication.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { isNativeSemanticGraphFunction } from "../gtl/semantic_stage_publication.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { RETAINED_GRAPH_INPUT_CONTRACT, isGraphInputRetentionContractRelation } from "./worksite_preparation_contracts.js";
import { isWorksiteRetentionContractRelation, WORKSITE_PREPARATION_IDS } from "./worksite_preparation_contracts.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution.js";
import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction.js";
import { ABI5_PRODUCT_ID, ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "./contracts.js";
import type {
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import {
  resolveProgramStart,
  type ProgramStartRequest,
  type ResolvedProgramStart,
} from "../gtl/public_start.js";
import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from
  "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  validateImplementationResolutionSet,
  validateProgram,
  type ImplementationResolutionSetValidation,
  type ProgramValidation,
} from "../validator/index.js";
import {
  admitGraphFunctionCatalog,
  lookupGraphFunction,
  lookupGraphFunctionDefinition,
  narrowGraphFunctionCatalog,
  type GraphFunctionCatalogEntry,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { constructCatalogProgramValidationInput } from
  "./catalog_operations.js";
import type { ProductInstallCandidate } from "./contracts.js";
import {
  resolveExecutionDeclarationClosure,
  resolveProgramDeclarationClosure,
  selectExactClosureContract,
  type ExecutionDeclarationOwnerCoordinate,
  type ResolvedExecutionDeclarationClosure,
  type ResolvedProgramDeclarationClosure,
} from "./declaration_closure.js";
import type { ProductInstall } from "./environment.js";
import {
  implementationDescriptorsFromProduct,
  resolveImplementationSet,
  type ImplementationResolutionSetCandidate,
  type PackagedLeafImplementationDescriptor,
} from "./implementation_resolution.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import {
  productSemanticsFromModules,
  type ProductSemanticsProvider,
} from "./semantics.js";

export type ProductExecutionResolutionRefusalCode =
  | "absent"
  | "ambiguous"
  | "missing_dependency"
  | "incompatible_or_unproven"
  | "wrong_owner";

export interface ProductExecutionResolutionRefusal {
  readonly kind: "product_execution_resolution_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProductExecutionResolutionRefusalCode;
  readonly stage:
    | "catalog"
    | "declaration_closure"
    | "dependency"
    | "implementation"
    | "semantics";
  readonly message: string;
}

export interface ProductExecutionOwnerCoordinate {
  readonly productId: string;
  readonly installId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly moduleRef: string;
  readonly publicationDigest: Sha256Digest;
}

export interface ProgramGraphFunctionMembership {
  readonly programRef: string;
  readonly graphFunctionRef: string;
}

export interface ProductExecutionResolution {
  readonly kind: "product_execution_resolution";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "resolved";
  readonly resolutionRef: string;
  readonly resolutionDigest: Sha256Digest;
  readonly catalogBasisDigest: Sha256Digest;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly programOwner: ProductExecutionOwnerCoordinate;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly graphFunctionOwner: ProductExecutionOwnerCoordinate;
  readonly programGraphFunctionMembership:
    ReferenceDigest<ProgramGraphFunctionMembership>;
  readonly inputContract: Readonly<ContractDeclaration>;
  readonly inputContractDigest: Sha256Digest;
  readonly inputContractOwner: ExecutionDeclarationOwnerCoordinate;
  readonly outputContract: Readonly<ContractDeclaration>;
  readonly outputContractDigest: Sha256Digest;
  readonly outputContractOwner: ExecutionDeclarationOwnerCoordinate;
  readonly declarationClosureRef: string;
  readonly declarationClosureDigest: Sha256Digest;
  readonly declarationOwners:
    readonly ExecutionDeclarationOwnerCoordinate[];
  readonly programValidationRef: string;
  readonly programValidationDigest: Sha256Digest;
  readonly implementationSetCandidateRef: string;
  readonly implementationSetCandidateDigest: Sha256Digest;
  readonly implementationSetValidationRef: string;
  readonly implementationSetValidationDigest: Sha256Digest;
  readonly closureContractRef: string;
  readonly closureContractDigest: Sha256Digest;
}

export interface LoadedProductExecutionResolution {
  readonly kind: "loaded_product_execution_resolution";
  readonly schemaVersion: "5.0.0";
  readonly resolution: ProductExecutionResolution;
  readonly declarationClosure: ResolvedExecutionDeclarationClosure;
  readonly programDeclarationClosure: ResolvedProgramDeclarationClosure;
  readonly programValidation: ProgramValidation;
  readonly implementationSetCandidate: ImplementationResolutionSetCandidate;
  readonly implementationSetValidation: ImplementationResolutionSetValidation;
  readonly closureContract: Readonly<ClosureContract>;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly selectedCatalogEntry: GraphFunctionCatalogEntry;
  readonly resolvedProgramStart: ResolvedProgramStart | null;
  readonly programInstall: ProductInstall;
  readonly programPublication: Readonly<ModulePublication>;
  readonly declarationPublications: readonly Readonly<ModulePublication>[];
  readonly ownerInstalls: readonly ProductInstall[];
  readonly packagedImplementations:
    readonly Readonly<PackagedLeafImplementationDescriptor>[];
  readonly productSemantics: ProductSemanticsProvider;
}

export type ProductExecutionResolutionResult =
  | LoadedProductExecutionResolution
  | ProductExecutionResolutionRefusal;

export function isProductExecutionResolution(
  value: object,
): value is ProductExecutionResolution {
  try {
    const candidate = value as Partial<ProductExecutionResolution>;
    if (
      candidate.kind !== "product_execution_resolution" ||
      candidate.schemaVersion !== "5.0.0" ||
      candidate.disposition !== "resolved" ||
      typeof candidate.resolutionRef !== "string" ||
      typeof candidate.resolutionDigest !== "string" ||
      typeof candidate.programRef !== "string" ||
      typeof candidate.graphFunctionRef !== "string" ||
      typeof candidate.programGraphFunctionMembership !== "object" ||
      candidate.programGraphFunctionMembership === null ||
      Array.isArray(candidate.programGraphFunctionMembership) ||
      Object.keys(candidate.programGraphFunctionMembership).sort().join("\0") !==
        "digest\0ref" ||
      candidate.inputContract === undefined ||
      candidate.inputContractOwner === undefined ||
      candidate.outputContract === undefined ||
      candidate.outputContractOwner === undefined
    ) return false;
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      disposition: _disposition,
      resolutionRef: _resolutionRef,
      resolutionDigest: _resolutionDigest,
      ...body
    } = candidate;
    const membershipDigest = sha256Canonical({
      programRef: candidate.programRef,
      graphFunctionRef: candidate.graphFunctionRef,
    });
    const membershipRef =
      `program-graph-function-membership://abiogenesis/${membershipDigest.slice("sha256:".length)}`;
    return candidate.programGraphFunctionMembership.digest ===
        membershipDigest &&
      candidate.programGraphFunctionMembership.ref === membershipRef &&
      candidate.inputContractDigest === sha256Canonical(
      candidate.inputContract as unknown as JsonValue,
    ) && candidate.outputContractDigest === sha256Canonical(
      candidate.outputContract as unknown as JsonValue,
    ) && candidate.resolutionDigest === sha256Canonical(
      body as unknown as JsonValue,
    ) && candidate.resolutionRef ===
      `product-execution-resolution://abiogenesis/${candidate.resolutionDigest.slice("sha256:".length)}`;
  } catch {
    return false;
  }
}

export interface ProductExecutionResolutionInput {
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
  readonly programRef: string;
  readonly selection: ProductExecutionSelection;
}

export interface ProductExecutionDirectSelection {
  readonly kind: "direct";
  readonly catalogHandle: string;
}

export interface ProductExecutionProgramStartSelection extends ProgramStartRequest {
  readonly kind: "start";
}

export interface ProductExecutionGraphFunctionStartSelection {
  readonly kind: "start";
  readonly scope: "program";
  readonly target: "graph_function";
  readonly graphFunctionHandle: string;
  readonly until: "converged";
  readonly rootMode: "direct" | "supervised";
}

export type ProductExecutionStartSelection =
  | ProductExecutionProgramStartSelection
  | ProductExecutionGraphFunctionStartSelection;

export interface ProductExecutionAdmittedSelection {
  readonly kind: "admitted";
  readonly graphFunctionRef: string;
}

export type ProductExecutionSelection =
  | ProductExecutionDirectSelection
  | ProductExecutionStartSelection
  | ProductExecutionAdmittedSelection;

function refusal(
  code: ProductExecutionResolutionRefusalCode,
  stage: ProductExecutionResolutionRefusal["stage"],
  message: string,
): ProductExecutionResolutionRefusal {
  return deepFreeze({
    kind: "product_execution_resolution_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    stage,
    message,
  });
}

function exact<T>(values: readonly T[], predicate: (value: T) => boolean):
  | Readonly<{ kind: "one"; value: T }>
  | Readonly<{ kind: "absent" | "ambiguous" }> {
  const matches = values.filter(predicate);
  return matches.length === 1
    ? { kind: "one", value: matches[0]! }
    : { kind: matches.length === 0 ? "absent" : "ambiguous" };
}

function candidateFromInstall(
  install: ProductInstall,
): ProductInstallCandidate {
  const {
    kind: _kind,
    disposition: _disposition,
    admissionEventRef: _admissionEventRef,
    ...body
  } = install;
  return {
    kind: "product_install_candidate",
    disposition: "materialized",
    ...body,
  };
}

function installMatchesPublication(
  install: ProductInstall,
  publication: Readonly<ModulePublication>,
): boolean {
  return install.productId === publication.owningProductId &&
    install.productContentDigest === publication.productContentDigest &&
    install.manifestDigest === publication.productManifestDigest;
}

function exactInstallForCoordinate(
  installs: readonly ProductInstall[],
  coordinate: Pick<
    ExecutionDeclarationOwnerCoordinate,
    "installId" | "productId"
  >,
): ReturnType<typeof exact<ProductInstall>> {
  return exact(installs, (install) =>
    install.installId === coordinate.installId &&
    install.productId === coordinate.productId
  );
}

function exactInstallForPublication(
  installs: readonly ProductInstall[],
  publication: Readonly<ModulePublication>,
): ReturnType<typeof exact<ProductInstall>> {
  return exact(installs, (install) =>
    installMatchesPublication(install, publication)
  );
}

function publicationForCoordinate(
  publications: readonly Readonly<ModulePublication>[],
  coordinate: ExecutionDeclarationOwnerCoordinate,
): ReturnType<typeof exact<Readonly<ModulePublication>>> {
  return exact(publications, (publication) =>
    publication.moduleRef === coordinate.moduleRef &&
    publication.owningProductId === coordinate.productId &&
    modulePublicationSemanticDigest(publication) ===
      coordinate.publicationDigest
  );
}

function ownerCoordinate(
  install: ProductInstall,
  publication: Readonly<ModulePublication>,
): ProductExecutionOwnerCoordinate {
  return deepFreeze({
    productId: publication.owningProductId,
    installId: install.installId,
    packageName: install.packageName,
    packageVersion: install.packageVersion,
    moduleRef: publication.moduleRef,
    publicationDigest: modulePublicationSemanticDigest(publication),
  });
}

function closureRefusal(
  result: Exclude<
    ReturnType<typeof resolveExecutionDeclarationClosure>,
    ResolvedExecutionDeclarationClosure
  >,
): ProductExecutionResolutionRefusal {
  return refusal(
    result.code === "absent"
      ? "absent"
      : result.code === "ambiguous"
      ? "ambiguous"
      : result.code === "missing_dependency"
      ? "missing_dependency"
      : result.code === "wrong_owner"
      ? "wrong_owner"
      : "incompatible_or_unproven",
    "declaration_closure",
    result.message,
  );
}

async function resolveProductExecution(
  input: ProductExecutionResolutionInput,
): Promise<ProductExecutionResolutionResult> {
  const reconstructedCatalog = (() => {
    try {
      return admitGraphFunctionCatalog(input.catalog.readinessBasis);
    } catch {
      return null;
    }
  })();
  if (
    reconstructedCatalog === null ||
    reconstructedCatalog.kind !== "graph_function_catalog" ||
    canonicalJson(reconstructedCatalog as unknown as JsonValue) !==
      canonicalJson(input.catalog as unknown as JsonValue)
  ) {
    return refusal(
      "incompatible_or_unproven",
      "catalog",
      "execution resolution requires the exact reconstructed ready Catalog",
    );
  }
  const reconstructedView = (() => {
    try {
      return narrowGraphFunctionCatalog(
        reconstructedCatalog,
        input.catalogView.allowlist,
      );
    } catch {
      return null;
    }
  })();
  if (
    reconstructedView === null ||
    reconstructedView.kind !== "graph_function_catalog_view" ||
    canonicalJson(reconstructedView as unknown as JsonValue) !==
      canonicalJson(input.catalogView as unknown as JsonValue)
  ) {
    return refusal(
      "incompatible_or_unproven",
      "catalog",
      "execution resolution requires the exact reconstructed CatalogView",
    );
  }
  if (
    input.admittedInstalls.length !==
      reconstructedCatalog.readinessBasis.installedProducts.length ||
    new Set(input.admittedInstalls.map((install) => install.installId)).size !==
      input.admittedInstalls.length ||
    new Set(input.admittedInstalls.map((install) =>
      install.admissionEventRef
    )).size !== input.admittedInstalls.length ||
    input.admittedInstalls.some((install) =>
      !input.verifyInstallAdmission(install) ||
      reconstructedCatalog.readinessBasis.installedProducts.filter(
        (candidate) =>
          canonicalJson(candidate as unknown as JsonValue) ===
            canonicalJson(
              candidateFromInstall(install) as unknown as JsonValue,
            ),
      ).length !== 1
    ) ||
    reconstructedCatalog.readinessBasis.installedProducts.some((candidate) =>
      input.admittedInstalls.filter((install) =>
        canonicalJson(
          candidateFromInstall(install) as unknown as JsonValue,
        ) === canonicalJson(candidate as unknown as JsonValue)
      ).length !== 1
    )
  ) {
    return refusal(
      "incompatible_or_unproven",
      "dependency",
      "execution resolution requires one ABG-admitted install per exact Catalog readiness candidate",
    );
  }

  const programDeclarationClosure = resolveProgramDeclarationClosure(
    reconstructedCatalog,
    reconstructedView,
    input.programRef,
  );
  if (programDeclarationClosure.kind !== "resolved_program_declaration_closure") {
    return closureRefusal(programDeclarationClosure);
  }
  const programPublication = programDeclarationClosure.programPublication;
  const programMatches = programPublication.programs.filter((candidate) =>
    candidate.programRef === programDeclarationClosure.programRef
  );
  if (programMatches.length !== 1) {
    return refusal(
      programMatches.length === 0 ? "absent" : "ambiguous",
      "declaration_closure",
      "selected Program does not reproduce from its exact publication owner",
    );
  }
  const program = programMatches[0]!;
  let selectedCatalogEntry: GraphFunctionCatalogEntry;
  let resolvedProgramStart: ResolvedProgramStart | null = null;
  if (input.selection.kind === "direct") {
    const selected = lookupGraphFunction(
      reconstructedView,
      input.selection.catalogHandle,
    );
    if (selected === null) {
      return refusal(
        "absent",
        "catalog",
        "direct execution selection requires one exact canonical CatalogView handle",
      );
    }
    selectedCatalogEntry = selected;
  } else if (
    input.selection.kind === "start" &&
    "graphFunctionHandle" in input.selection
  ) {
    const selected = lookupGraphFunction(
      reconstructedView,
      input.selection.graphFunctionHandle,
    );
    if (selected === null) {
      return refusal(
        "absent",
        "catalog",
        "GraphFunction start requires one exact CatalogView handle",
      );
    }
    selectedCatalogEntry = selected;
  } else if (input.selection.kind === "start") {
    const resolved = resolveProgramStart(program, {
      scope: input.selection.scope,
      target: input.selection.target,
      until: input.selection.until,
      rootMode: input.selection.rootMode,
      ...(input.selection.startRef === undefined
        ? {}
        : { startRef: input.selection.startRef }),
    });
    if (resolved.kind !== "resolved_program_start") {
      return refusal(
        resolved.code === "ambiguous_target"
          ? "ambiguous"
          : resolved.code === "missing_target"
          ? "absent"
          : "incompatible_or_unproven",
        "catalog",
        resolved.message,
      );
    }
    const selected = lookupGraphFunctionDefinition(
      reconstructedView,
      resolved.start.graphFunctionRef,
      input.programRef,
    );
    if (selected.kind !== "graph_function_definition_lookup_exact") {
      return refusal(
        selected.kind === "graph_function_definition_lookup_ambiguous"
          ? "ambiguous"
          : "absent",
        "catalog",
        "Program start does not select one exact Program-aware CatalogView definition",
      );
    }
    resolvedProgramStart = resolved;
    selectedCatalogEntry = selected.entry;
  } else if (input.selection.kind === "admitted") {
    const selected = lookupGraphFunctionDefinition(
      reconstructedView,
      input.selection.graphFunctionRef,
      input.programRef,
    );
    if (selected.kind !== "graph_function_definition_lookup_exact") {
      return refusal(
        selected.kind === "graph_function_definition_lookup_ambiguous"
          ? "ambiguous"
          : "absent",
        "catalog",
        "admitted GraphFunction coordinate does not reproduce one exact Program-aware CatalogView definition",
      );
    }
    selectedCatalogEntry = selected.entry;
  } else {
    return refusal(
      "incompatible_or_unproven",
      "catalog",
      "execution selection is outside the closed direct, start, or admitted family",
    );
  }
  if (
    !selectedCatalogEntry.programMembershipRefs.includes(input.programRef) ||
    !program.callableMembership.includes(selectedCatalogEntry.definitionRef)
  ) {
    return refusal(
      "wrong_owner",
      "catalog",
      "selected CatalogView definition is outside the exact Program callable membership",
    );
  }

  const declarationClosure = resolveExecutionDeclarationClosure(
    reconstructedCatalog,
    reconstructedView,
    input.programRef,
    selectedCatalogEntry.definitionRef,
  );
  if (declarationClosure.kind !== "resolved_execution_declaration_closure") {
    return closureRefusal(declarationClosure);
  }
  const publications = declarationClosure.publications;
  const graphFunctionOwner = declarationClosure.graphFunctionOwners.find(
    (owner) => owner.declarationRef === selectedCatalogEntry.definitionRef,
  );
  if (graphFunctionOwner === undefined) {
    return refusal(
      "wrong_owner",
      "declaration_closure",
      "selected GraphFunction lacks one exact declaration owner",
    );
  }
  const graphFunctionPublicationMatch = publicationForCoordinate(
    publications,
    graphFunctionOwner,
  );
  const graphFunctionMatches = graphFunctionPublicationMatch.kind === "one"
    ? graphFunctionPublicationMatch.value.graphFunctions.filter(
        (candidate) => candidate.name === graphFunctionOwner.declarationRef,
      )
    : [];
  if (graphFunctionPublicationMatch.kind !== "one" || graphFunctionMatches.length !== 1) {
    return refusal(
      graphFunctionPublicationMatch.kind === "ambiguous" ||
          graphFunctionMatches.length > 1
        ? "ambiguous"
        : "wrong_owner",
      "declaration_closure",
      "selected GraphFunction does not reproduce from its exact declaration owner",
    );
  }
  const graphFunctionPublication = graphFunctionPublicationMatch.value;
  const graphFunction = graphFunctionMatches[0]!;
  if (
    selectedCatalogEntry.definitionRef !== graphFunctionOwner.declarationRef ||
    selectedCatalogEntry.definitionDigest !==
      sha256Canonical(graphFunction as unknown as JsonValue) ||
    selectedCatalogEntry.owningProductId !== graphFunctionOwner.productId ||
    selectedCatalogEntry.moduleRef !== graphFunctionOwner.moduleRef ||
    selectedCatalogEntry.publicationDigest !==
      graphFunctionOwner.publicationDigest ||
    canonicalJson(selectedCatalogEntry.definition as unknown as JsonValue) !==
      canonicalJson(graphFunction as unknown as JsonValue)
  ) {
    return refusal(
      "wrong_owner",
      "catalog",
      "Program-aware GraphFunction selection disagrees with its declaration owner",
    );
  }
  if (
    graphFunction.inputs.length !== 1 ||
    graphFunction.outputs.length !== 1
  ) {
    return refusal(
      "incompatible_or_unproven",
      "declaration_closure",
      "execution resolution requires one exact input and output contract",
    );
  }
  const inputContract = selectExactClosureContract(declarationClosure, graphFunction.inputs[0]!);
  const outputContract = selectExactClosureContract(declarationClosure, graphFunction.outputs[0]!);
  if (inputContract === null || outputContract === null) {
    return refusal(
      "wrong_owner",
      "declaration_closure",
      "selected GraphFunction contracts lack exact resolved owners",
    );
  }
  const programInstallMatch = exactInstallForPublication(
    input.admittedInstalls,
    programPublication,
  );
  const graphFunctionInstallMatch = exactInstallForCoordinate(
    input.admittedInstalls,
    graphFunctionOwner,
  );
  if (
    programInstallMatch.kind !== "one" ||
    graphFunctionInstallMatch.kind !== "one"
  ) {
    return refusal(
      programInstallMatch.kind === "ambiguous" ||
          graphFunctionInstallMatch.kind === "ambiguous"
        ? "ambiguous"
        : "wrong_owner",
      "dependency",
      "Program or selected GraphFunction lacks one exact admitted owner install",
    );
  }

  const validationInput = constructCatalogProgramValidationInput(
    reconstructedCatalog,
    reconstructedView,
    programDeclarationClosure,
    program,
  );
  if (
    "kind" in validationInput &&
    validationInput.kind === "raw_admission_refusal"
  ) {
    return refusal(
      "incompatible_or_unproven",
      "declaration_closure",
      validationInput.message,
    );
  }
  const programValidation = validateProgram(
    validationInput as import("../validator/index.js").ProgramValidationInput,
  );
  if (programValidation.kind !== "program_validation") {
    return refusal(
      programValidation.diagnostics.some((diagnostic) =>
          diagnostic.code === "duplicate_identity"
        )
        ? "ambiguous"
        : "incompatible_or_unproven",
      "declaration_closure",
      "whole-Program declaration inventory failed static validation",
    );
  }

  // Static shape proof and installed declaration authority are separate gates.
  const retentionGraphs = programDeclarationClosure.publications.flatMap((publication) =>
    publication.graphFunctions.filter((candidate) => program.callableMembership.includes(candidate.name)));
  for (const graph of retentionGraphs) for (const edge of graph.template.edges) {
    const binding = edge.inputBinding;
    if (binding === undefined) continue;
    const contracts = programDeclarationClosure.publications.flatMap((publication) => publication.contracts);
    const exactAbiOwner = (owner: ExecutionDeclarationOwnerCoordinate | undefined, moduleRef: string): boolean => {
      if (owner === undefined || owner.productId !== ABI5_PRODUCT_ID || owner.moduleRef !== moduleRef) return false;
      const publication = publicationForCoordinate(programDeclarationClosure.publications, owner);
      const installs = input.admittedInstalls.filter((install) => install.installId === owner.installId &&
        install.packageName === ABI5_PACKAGE_NAME && install.packageVersion === ABI5_PACKAGE_VERSION &&
        install.productId === ABI5_PRODUCT_ID && install.contributionManifest.publicationBindings.some((row) =>
          row.moduleRef === moduleRef && row.publicationDigest === owner.publicationDigest));
      return publication.kind === "one" && installs.length === 1;
    };
    if (binding.targetContractRef === RETAINED_GRAPH_INPUT_CONTRACT.contractRef) {
      const exactOwner = (owners: readonly ExecutionDeclarationOwnerCoordinate[], ref: string) => {
        const matches = owners.filter(owner => owner.declarationRef === ref);
        if (matches.length !== 1) return null;
        const owner = matches[0]!;
        const publication = publicationForCoordinate(programDeclarationClosure.publications, owner);
        const installs = input.admittedInstalls.filter(install => install.installId === owner.installId && install.productId === owner.productId &&
          install.contributionManifest.publicationBindings.some(row => row.moduleRef === owner.moduleRef && row.publicationDigest === owner.publicationDigest));
        return publication.kind === "one" && installs.length === 1 ? owner : null;
      };
      const entry = exactOwner(programDeclarationClosure.contractOwners, binding.entryContractRef);
      const target = exactOwner(programDeclarationClosure.contractOwners, binding.targetContractRef);
      const source = exactOwner(programDeclarationClosure.contractOwners, binding.sourceContractRef);
      const sameOwner = (a: ExecutionDeclarationOwnerCoordinate | null, b: ExecutionDeclarationOwnerCoordinate | null) =>
        a !== null && b !== null && a.productId === b.productId && a.installId === b.installId &&
        a.moduleRef === b.moduleRef && a.publicationDigest === b.publicationDigest;
      const graphOwner = exactOwner(programDeclarationClosure.graphFunctionOwners, graph.name);
      const targetTerm = graph.template.nodes.find(node => node.nodeRef === edge.toNodeRef)?.term;
      const targetOwner = targetTerm?.kind === "c_workflow"
        ? exactOwner(programDeclarationClosure.graphFunctionOwners, targetTerm.graphFunctionRef)
        : targetTerm?.kind === "c_of" && targetTerm.requirement.kind === "executable_leaf_requirement"
          ? exactOwner(programDeclarationClosure.implementationBindingOwners, targetTerm.requirement.implementationBindingRef) : null;
      const declaredGraphOwner = graphOwner === null ? null : publicationForCoordinate(programDeclarationClosure.publications, graphOwner);
      const nativeSemantic = declaredGraphOwner?.kind === "one" && entry !== null && [SEMANTIC_STAGE_IDS.moduleRef,SEMANTIC_REVISION_IDS.moduleRef].some(ref=>exactAbiOwner(entry,ref)) &&
        nativeSemanticRetentionOwnersMatch(declaredGraphOwner.value, graph, graphOwner, entry, targetOwner, programDeclarationClosure.semanticsOwner);
      if (!isGraphInputRetentionContractRelation(binding, contracts) || source === null ||
        target === null || !exactAbiOwner(target, WORKSITE_COMMAND_EXECUTION_IDS.moduleRef) ||
        (!sameOwner(entry, graphOwner) && !nativeSemantic) || !sameOwner(entry, targetOwner) ||
        (!sameOwner(entry, programDeclarationClosure.semanticsOwner) && !nativeSemantic)) {
        return refusal("wrong_owner", "declaration_closure", "retained input requires the fixed ABI pair and exact entry, source and consumer semantics owners");
      }
      continue;
    }
    const relationOwned = isWorksiteRetentionContractRelation(binding, contracts) &&
      [binding.entryContractRef, binding.sourceContractRef, binding.targetContractRef].every((ref) => {
        const owners = programDeclarationClosure.contractOwners.filter((owner) => owner.declarationRef === ref);
        return owners.length === 1 && exactAbiOwner(owners[0], ref === binding.sourceContractRef
          ? WORKSITE_CONSTRUCTION_IDS.moduleRef : WORKSITE_COMMAND_EXECUTION_IDS.moduleRef);
      });
    const branch = binding.entryContractRef === WORKSITE_PREPARATION_IDS.branchInputContractRef;
    const bindings = binding.entryContractRef === WORKSITE_REVISION_IDS.inputContractRef
      ? [WORKSITE_REVISION_IDS.selectBindingRef, WORKSITE_REVISION_IDS.prepareBindingRef] : branch
      ? [WORKSITE_PREPARATION_IDS.selectBranchBindingRef, WORKSITE_PREPARATION_IDS.prepareBranchBindingRef]
      : [WORKSITE_PREPARATION_IDS.selectBindingRef, WORKSITE_PREPARATION_IDS.prepareBindingRef];
    const preparationOwned = bindings.every((ref) => {
      const owners = programDeclarationClosure.implementationBindingOwners.filter((owner) => owner.declarationRef === ref);
      return owners.length === 1 && exactAbiOwner(owners[0], WORKSITE_COMMAND_EXECUTION_IDS.moduleRef);
    });
    const semantics = programDeclarationClosure.semanticsOwner;
    const semanticsInstall = input.admittedInstalls.filter((install) => install.installId === semantics.installId &&
      install.productId === ABI5_PRODUCT_ID && install.packageName === ABI5_PACKAGE_NAME &&
      install.packageVersion === ABI5_PACKAGE_VERSION);
    if (!relationOwned || !preparationOwned || semantics.productId !== ABI5_PRODUCT_ID || semanticsInstall.length !== 1) {
      return refusal("wrong_owner", "declaration_closure", "retained worksite input requires exact ABI preparation, result and semantics owners");
    }
  }

  const implementationOwnerCoordinates =
    declarationClosure.implementationBindingOwners;
  const implementationPublicationMap = new Map<
    string,
    Readonly<ModulePublication>
  >();
  for (const coordinate of implementationOwnerCoordinates) {
    const publicationMatch = publicationForCoordinate(publications, coordinate);
    if (publicationMatch.kind !== "one") {
      return refusal(
        publicationMatch.kind,
        "implementation",
        "ImplementationBinding owner does not resolve to one exact publication",
      );
    }
    implementationPublicationMap.set(
      `${coordinate.moduleRef}\0${coordinate.publicationDigest}`,
      publicationMatch.value,
    );
  }
  // Each resolution owns fresh physical acquisition. Reuse only these actual
  // results for its selected modules; nothing survives into another resolution.
  const preparedProducts = new Map<ProductInstall, InstalledProductModulePreparation>();
  const modulesFor = async (install: ProductInstall): Promise<InstalledProductModulePreparation> => {
    const existing = preparedProducts.get(install);
    if (existing !== undefined) return existing;
    const prepared = await prepareInstalledProductModules(install);
    preparedProducts.set(install, prepared);
    return prepared;
  };
  const packagedImplementations: Readonly<PackagedLeafImplementationDescriptor>[] = [];
  for (const ownerPublication of implementationPublicationMap.values()) {
    const ownerCoordinateValue = implementationOwnerCoordinates.find(
      (coordinate) =>
        coordinate.moduleRef === ownerPublication.moduleRef &&
        coordinate.publicationDigest ===
          modulePublicationSemanticDigest(ownerPublication),
    )!;
    const installMatch = exactInstallForCoordinate(
      input.admittedInstalls,
      ownerCoordinateValue,
    );
    if (installMatch.kind !== "one") {
      return refusal(
        installMatch.kind,
        "implementation",
        "ImplementationBinding publication lacks one exact admitted owner install",
      );
    }
    const descriptors = await implementationDescriptorsFromProduct(
      installMatch.value,
      ownerPublication,
      await modulesFor(installMatch.value),
    );
    if ("kind" in descriptors) {
      return refusal(
        descriptors.code === "ambiguous_implementation"
          ? "ambiguous"
          : "wrong_owner",
        "implementation",
        descriptors.message,
      );
    }
    packagedImplementations.push(...descriptors);
  }
  const implementationSetCandidate = resolveImplementationSet(
    reconstructedView,
    declarationClosure,
    programValidation,
    packagedImplementations,
  );
  if (
    implementationSetCandidate.kind !==
      "implementation_resolution_set_candidate"
  ) {
    return refusal(
      implementationSetCandidate.code === "ambiguous_implementation"
        ? "ambiguous"
        : implementationSetCandidate.code === "implementation_absent"
        ? "absent"
        : "incompatible_or_unproven",
      "implementation",
      implementationSetCandidate.message,
    );
  }
  const implementationSetValidation = validateImplementationResolutionSet(
    implementationSetCandidate,
    reconstructedView,
    declarationClosure,
    programValidation,
    packagedImplementations,
  );
  if (
    implementationSetValidation.kind !==
      "implementation_resolution_set_validation"
  ) {
    return refusal(
      "incompatible_or_unproven",
      "implementation",
      "resolved implementation closure failed independent validation",
    );
  }

  const closureOwner = declarationClosure.closureContractOwners.find(
    (owner) => owner.declarationRef === program.closureContractRef,
  );
  if (closureOwner === undefined) {
    return refusal(
      "absent",
      "declaration_closure",
      "Program closure contract lacks one selected declaration owner",
    );
  }
  const closurePublicationMatch = publicationForCoordinate(
    publications,
    closureOwner,
  );
  const closureContractMatches = closurePublicationMatch.kind === "one"
    ? closurePublicationMatch.value.closureContracts.filter((contract) =>
        contract.closureContractRef === closureOwner.declarationRef
      )
    : [];
  if (
    closurePublicationMatch.kind !== "one" ||
    closureContractMatches.length !== 1
  ) {
    return refusal(
      closurePublicationMatch.kind === "ambiguous" ||
          closureContractMatches.length > 1
        ? "ambiguous"
        : "absent",
      "declaration_closure",
      "Program closure contract does not resolve exactly",
    );
  }
  const closureContract = closureContractMatches[0]!;

  const semanticsPublicationMatch = publicationForCoordinate(
    publications,
    declarationClosure.semanticsOwner,
  );
  const semanticsInstallMatch = exactInstallForCoordinate(
    input.admittedInstalls,
    declarationClosure.semanticsOwner,
  );
  if (
    semanticsPublicationMatch.kind !== "one" ||
    semanticsInstallMatch.kind !== "one"
  ) {
    return refusal(
      semanticsPublicationMatch.kind === "ambiguous" ||
          semanticsInstallMatch.kind === "ambiguous"
        ? "ambiguous"
        : "wrong_owner",
      "semantics",
      "Product semantics lacks one exact publication and admitted owner install",
    );
  }
  let productSemantics: ProductSemanticsProvider;
  try {
    productSemantics = await productSemanticsFromModules({
      install: semanticsInstallMatch.value,
      publicationDigest:
        declarationClosure.semanticsOwner.publicationDigest,
      productSemanticsBinding: programPublication.productSemanticsBinding,
      verifyInstallAdmission: input.verifyInstallAdmission,
    }, await modulesFor(semanticsInstallMatch.value));
  } catch {
    return refusal(
      "wrong_owner",
      "semantics",
      "Product semantics callable is not carried by its resolved admitted owner install",
    );
  }

  const declarationOwners = Object.freeze([
    ...declarationClosure.graphFunctionOwners,
    ...declarationClosure.contractOwners,
    ...declarationClosure.evaluatorOwners,
    ...declarationClosure.ruleOwners,
    ...declarationClosure.implementationBindingOwners,
    ...declarationClosure.closureContractOwners,
    declarationClosure.semanticsOwner,
  ].sort((left, right) =>
    compareUnicodeCodeUnits(left.declarationKind, right.declarationKind) ||
    compareUnicodeCodeUnits(left.declarationRef, right.declarationRef) ||
    compareUnicodeCodeUnits(left.productId, right.productId) ||
    compareUnicodeCodeUnits(left.moduleRef, right.moduleRef)
  ));
  const membershipDigest = sha256Canonical({
    programRef: program.programRef,
    graphFunctionRef: selectedCatalogEntry.definitionRef,
  });
  const programGraphFunctionMembership = deepFreeze({
    ref:
      `program-graph-function-membership://abiogenesis/${membershipDigest.slice("sha256:".length)}`,
    digest: membershipDigest,
  }) as ReferenceDigest<ProgramGraphFunctionMembership>;
  const body = deepFreeze({
    catalogBasisDigest: reconstructedCatalog.basisDigest,
    catalogViewDigest: reconstructedView.viewDigest,
    programRef: program.programRef,
    programDigest: sha256Canonical(program as unknown as JsonValue),
    programOwner: ownerCoordinate(programInstallMatch.value, programPublication),
    graphFunctionRef: selectedCatalogEntry.definitionRef,
    graphFunctionDigest: selectedCatalogEntry.definitionDigest,
    graphFunctionOwner: ownerCoordinate(
      graphFunctionInstallMatch.value,
      graphFunctionPublication,
    ),
    programGraphFunctionMembership,
    inputContract: inputContract.contract,
    inputContractDigest: sha256Canonical(
      inputContract.contract as unknown as JsonValue,
    ),
    inputContractOwner: inputContract.owner,
    outputContract: outputContract.contract,
    outputContractDigest: sha256Canonical(
      outputContract.contract as unknown as JsonValue,
    ),
    outputContractOwner: outputContract.owner,
    declarationClosureRef: declarationClosure.closureRef,
    declarationClosureDigest: declarationClosure.closureDigest,
    declarationOwners,
    programValidationRef: programValidation.validationRef,
    programValidationDigest: programValidation.sourceDigest,
    implementationSetCandidateRef:
      implementationSetCandidate.setCandidateRef,
    implementationSetCandidateDigest:
      implementationSetCandidate.setCandidateDigest,
    implementationSetValidationRef:
      implementationSetValidation.validationRef,
    implementationSetValidationDigest:
      implementationSetValidation.validationDigest,
    closureContractRef: closureContract.closureContractRef,
    closureContractDigest: sha256Canonical(
      closureContract as unknown as JsonValue,
    ),
  });
  const resolutionDigest = sha256Canonical(body as unknown as JsonValue);
  const resolution = deepFreeze({
    kind: "product_execution_resolution" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "resolved" as const,
    resolutionRef:
      `product-execution-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`,
    resolutionDigest,
    ...body,
  }) as ProductExecutionResolution;
  const selectedInstallIds = new Set(
    declarationOwners.map((owner) => owner.installId),
  );
  selectedInstallIds.add(programInstallMatch.value.installId);
  return Object.freeze({
    kind: "loaded_product_execution_resolution" as const,
    schemaVersion: "5.0.0" as const,
    resolution,
    declarationClosure,
    programDeclarationClosure,
    programValidation,
    implementationSetCandidate,
    implementationSetValidation,
    closureContract,
    program,
    graphFunction,
    selectedCatalogEntry,
    resolvedProgramStart,
    programInstall: programInstallMatch.value,
    programPublication,
    declarationPublications: publications,
    ownerInstalls: Object.freeze(input.admittedInstalls.filter((install) =>
      selectedInstallIds.has(install.installId)
    )),
    packagedImplementations: Object.freeze([...packagedImplementations]),
    productSemantics,
  });
}

export const ProductExecutionResolutionPort = Object.freeze({
  resolve: resolveProductExecution,
});

/** @internal Declaration relation only. The calling resolution owner first
 * authenticates each coordinate against its exact installed publication. */
export function nativeSemanticRetentionOwnersMatch(publication: Readonly<ModulePublication>, graph: Readonly<GraphFunction>,
  graphOwner: ExecutionDeclarationOwnerCoordinate | null, entry: ExecutionDeclarationOwnerCoordinate | null,
  target: ExecutionDeclarationOwnerCoordinate | null, semantics: ExecutionDeclarationOwnerCoordinate | null): boolean {
  const same = (a: ExecutionDeclarationOwnerCoordinate | null, b: ExecutionDeclarationOwnerCoordinate | null) => a !== null && b !== null &&
    a.productId === b.productId && a.installId === b.installId && a.moduleRef === b.moduleRef && a.publicationDigest === b.publicationDigest;
  return graphOwner !== null && graphOwner.productId === publication.owningProductId && graphOwner.moduleRef === publication.moduleRef &&
    graphOwner.publicationDigest === modulePublicationSemanticDigest(publication) &&
    entry !== null && entry.productId === ABI5_PRODUCT_ID && same(entry,target) &&
    (entry.moduleRef === SEMANTIC_STAGE_IDS.moduleRef ? same(entry,semantics) && isNativeSemanticGraphFunction(publication,graph) :
      entry.moduleRef === SEMANTIC_REVISION_IDS.moduleRef && semantics !== null && semantics.productId === entry.productId && semantics.installId === entry.installId &&
      [SEMANTIC_STAGE_IDS.moduleRef,SEMANTIC_REVISION_IDS.moduleRef].some(ref=>ref===semantics.moduleRef) && isNativeSemanticRevisionGraphFunction(publication,graph));
}
