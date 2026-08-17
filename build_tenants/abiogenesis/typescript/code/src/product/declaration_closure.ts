import {
  projectCProgramNodeDeclarationReferences,
  projectGraphFunctionApplicationDeclarationReferences,
} from "../gtl/declaration_references.js";
import type {
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RuleDeclaration,
} from "../gtl/contracts.js";
import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from
  "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  lookupGraphFunctionDefinition,
  type GraphFunctionCatalogEntry,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { modulePublicationSemanticDigest } from "./publication.js";

export type ExecutionDeclarationKind =
  | "closure_contract"
  | "contract"
  | "evaluator"
  | "graph_function"
  | "implementation_binding"
  | "rule"
  | "semantics";

export interface ExecutionDeclarationOwnerCoordinate {
  readonly declarationKind: ExecutionDeclarationKind;
  readonly declarationRef: string;
  readonly productId: string;
  readonly installId: string;
  readonly moduleRef: string;
  readonly publicationDigest: Sha256Digest;
}

interface ResolvedDeclarationClosureBase {
  readonly schemaVersion: "5.0.0";
  readonly closureRef: string;
  readonly closureDigest: Sha256Digest;
  readonly closureScope: "execution" | "program";
  readonly catalogBasisDigest: Sha256Digest;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly rootGraphFunctionRefs: readonly string[];
  readonly selectedGraphFunctionRef: string | null;
  readonly programPublication: Readonly<ModulePublication>;
  readonly programPublicationDigest: Sha256Digest;
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly publicationDigests: readonly Sha256Digest[];
  readonly graphFunctionOwners: readonly ExecutionDeclarationOwnerCoordinate[];
  readonly contractOwners: readonly ExecutionDeclarationOwnerCoordinate[];
  readonly evaluatorOwners: readonly ExecutionDeclarationOwnerCoordinate[];
  readonly ruleOwners: readonly ExecutionDeclarationOwnerCoordinate[];
  readonly implementationBindingOwners:
    readonly ExecutionDeclarationOwnerCoordinate[];
  readonly closureContractOwners: readonly ExecutionDeclarationOwnerCoordinate[];
  readonly semanticsOwner: ExecutionDeclarationOwnerCoordinate;
}

export interface ResolvedExecutionDeclarationClosure extends
  ResolvedDeclarationClosureBase {
  readonly kind: "resolved_execution_declaration_closure";
  readonly closureScope: "execution";
  readonly rootGraphFunctionRefs: readonly [string];
  readonly selectedGraphFunctionRef: string;
}

export interface ResolvedProgramDeclarationClosure extends
  ResolvedDeclarationClosureBase {
  readonly kind: "resolved_program_declaration_closure";
  readonly closureScope: "program";
  readonly selectedGraphFunctionRef: null;
}

export type ResolvedDeclarationClosure =
  | ResolvedExecutionDeclarationClosure
  | ResolvedProgramDeclarationClosure;

export interface ExecutionDeclarationClosureRefusal {
  readonly kind: "execution_declaration_closure_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "absent"
    | "ambiguous"
    | "catalog_mismatch"
    | "missing_dependency"
    | "wrong_owner";
  readonly message: string;
}

export type ExecutionDeclarationClosureResult =
  | ResolvedExecutionDeclarationClosure
  | ExecutionDeclarationClosureRefusal;

export type ProgramDeclarationClosureResult =
  | ResolvedProgramDeclarationClosure
  | ExecutionDeclarationClosureRefusal;

interface LocatedDeclaration<T> {
  readonly publication: Readonly<ModulePublication>;
  readonly value: Readonly<T>;
}

type LocatedResult<T> =
  | Readonly<{ readonly kind: "one"; readonly located: LocatedDeclaration<T> }>
  | Readonly<{
      readonly kind: "absent" | "ambiguous" | "missing_dependency";
    }>;

export function isResolvedExecutionDeclarationClosure(
  value: object,
): value is ResolvedExecutionDeclarationClosure {
  return isResolvedDeclarationClosure(value) &&
    value.kind === "resolved_execution_declaration_closure" &&
    value.closureScope === "execution" &&
    value.rootGraphFunctionRefs.length === 1 &&
    value.selectedGraphFunctionRef === value.rootGraphFunctionRefs[0];
}

export function isResolvedProgramDeclarationClosure(
  value: object,
): value is ResolvedProgramDeclarationClosure {
  return isResolvedDeclarationClosure(value) &&
    value.kind === "resolved_program_declaration_closure" &&
    value.closureScope === "program" &&
    value.selectedGraphFunctionRef === null;
}

function isResolvedDeclarationClosure(
  value: object,
): value is ResolvedDeclarationClosure {
  try {
    const candidate = value as Partial<ResolvedDeclarationClosure>;
    if (
      (candidate.kind !== "resolved_execution_declaration_closure" &&
        candidate.kind !== "resolved_program_declaration_closure") ||
      candidate.schemaVersion !== "5.0.0" ||
      (candidate.closureScope !== "execution" &&
        candidate.closureScope !== "program") ||
      typeof candidate.closureDigest !== "string" ||
      !Array.isArray(candidate.rootGraphFunctionRefs) ||
      candidate.rootGraphFunctionRefs.length === 0 ||
      !Array.isArray(candidate.publications) ||
      candidate.publications.length === 0 ||
      !Array.isArray(candidate.publicationDigests) ||
      !Array.isArray(candidate.graphFunctionOwners) ||
      !Array.isArray(candidate.contractOwners) ||
      !Array.isArray(candidate.evaluatorOwners) ||
      !Array.isArray(candidate.ruleOwners) ||
      !Array.isArray(candidate.implementationBindingOwners) ||
      !Array.isArray(candidate.closureContractOwners) ||
      candidate.programPublication === undefined ||
      candidate.semanticsOwner === undefined
    ) return false;
    const body = {
      closureScope: candidate.closureScope,
      catalogBasisDigest: candidate.catalogBasisDigest,
      catalogViewDigest: candidate.catalogViewDigest,
      programRef: candidate.programRef,
      rootGraphFunctionRefs: candidate.rootGraphFunctionRefs,
      selectedGraphFunctionRef: candidate.selectedGraphFunctionRef,
      programPublicationDigest: candidate.programPublicationDigest,
      publicationDigests: candidate.publicationDigests,
      graphFunctionOwners: candidate.graphFunctionOwners,
      contractOwners: candidate.contractOwners,
      evaluatorOwners: candidate.evaluatorOwners,
      ruleOwners: candidate.ruleOwners,
      implementationBindingOwners: candidate.implementationBindingOwners,
      closureContractOwners: candidate.closureContractOwners,
      semanticsOwner: candidate.semanticsOwner,
    };
    return candidate.closureDigest ===
        sha256Canonical(body as unknown as JsonValue) &&
      candidate.closureRef ===
        `execution-declaration-closure://abiogenesis/${candidate.closureDigest.slice("sha256:".length)}` &&
      candidate.programPublicationDigest ===
        modulePublicationSemanticDigest(candidate.programPublication) &&
      canonicalJson(candidate.publicationDigests as unknown as JsonValue) ===
        canonicalJson(candidate.publications.map((publication) =>
          modulePublicationSemanticDigest(publication)
        ) as unknown as JsonValue);
  } catch {
    return false;
  }
}

export function validateResolvedExecutionDeclarationClosure(
  value: ResolvedExecutionDeclarationClosure,
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
): boolean {
  if (!isResolvedExecutionDeclarationClosure(value)) return false;
  const reconstructed = resolveExecutionDeclarationClosure(
    catalog,
    catalogView,
    value.programRef,
    value.selectedGraphFunctionRef,
  );
  return reconstructed.kind === "resolved_execution_declaration_closure" &&
    canonicalJson(reconstructed as unknown as JsonValue) ===
      canonicalJson(value as unknown as JsonValue);
}

export function validateResolvedProgramDeclarationClosure(
  value: ResolvedProgramDeclarationClosure,
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
): boolean {
  if (!isResolvedProgramDeclarationClosure(value)) return false;
  const reconstructed = resolveProgramDeclarationClosure(
    catalog,
    catalogView,
    value.programRef,
  );
  return reconstructed.kind === "resolved_program_declaration_closure" &&
    canonicalJson(reconstructed as unknown as JsonValue) ===
      canonicalJson(value as unknown as JsonValue);
}

function refusal(
  code: ExecutionDeclarationClosureRefusal["code"],
  message: string,
): ExecutionDeclarationClosureRefusal {
  return deepFreeze({
    kind: "execution_declaration_closure_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function reachableProductIds(
  catalog: ReadyGraphFunctionCatalog,
  rootProductId: string,
): ReadonlySet<string> {
  const reachable = new Set([rootProductId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of catalog.readinessBasis.resolvedLock.dependencyEdges) {
      if (
        reachable.has(edge.fromProductId) &&
        edge.compatibilityDisposition === "compatible" &&
        !reachable.has(edge.toProductId)
      ) {
        reachable.add(edge.toProductId);
        changed = true;
      }
    }
  }
  return reachable;
}

function locateRequired<T>(
  publications: readonly Readonly<ModulePublication>[],
  reachable: ReadonlySet<string>,
  rows: (publication: Readonly<ModulePublication>) => readonly T[],
  predicate: (row: T) => boolean,
): LocatedResult<T> {
  const all = publications.flatMap((publication) =>
    rows(publication).filter(predicate).map((value) => ({ publication, value })),
  );
  const eligible = all.filter(({ publication }) =>
    reachable.has(publication.owningProductId)
  );
  if (eligible.length === 1) {
    return { kind: "one", located: eligible[0]! };
  }
  if (eligible.length > 1) return { kind: "ambiguous" };
  return { kind: all.length === 0 ? "absent" : "missing_dependency" };
}

function exactOwnerCoordinate(
  catalog: ReadyGraphFunctionCatalog,
  publication: Readonly<ModulePublication>,
  declarationKind: ExecutionDeclarationKind,
  declarationRef: string,
): ExecutionDeclarationOwnerCoordinate | null {
  const installs = catalog.readinessBasis.installedProducts.filter(
    (install) =>
      install.productId === publication.owningProductId &&
      install.productContentDigest === publication.productContentDigest &&
      install.manifestDigest === publication.productManifestDigest,
  );
  return installs.length === 1
    ? deepFreeze({
        declarationKind,
        declarationRef,
        productId: publication.owningProductId,
        installId: installs[0]!.installId,
        moduleRef: publication.moduleRef,
        publicationDigest: modulePublicationSemanticDigest(publication),
      })
    : null;
}

function locatedRefusal(
  result: Exclude<LocatedResult<unknown>, { readonly kind: "one" }>,
  label: string,
): ExecutionDeclarationClosureRefusal {
  return refusal(
    result.kind,
    `${label} does not resolve to one exact compatible publication owner`,
  );
}

function orderedOwnerCoordinates(
  values: readonly ExecutionDeclarationOwnerCoordinate[],
): readonly ExecutionDeclarationOwnerCoordinate[] {
  return Object.freeze([...values].sort((left, right) =>
    compareUnicodeCodeUnits(left.declarationRef, right.declarationRef) ||
    compareUnicodeCodeUnits(left.productId, right.productId) ||
    compareUnicodeCodeUnits(left.moduleRef, right.moduleRef)
  ));
}

function resolveDeclarationClosure(
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
  programRef: string,
  closureScope: "execution" | "program",
  requestedGraphFunctionRef: string | null,
): ResolvedDeclarationClosure | ExecutionDeclarationClosureRefusal {
  if (
    catalog.kind !== "graph_function_catalog" ||
    catalogView.kind !== "graph_function_catalog_view" ||
    catalogView.catalogBasisDigest !== catalog.basisDigest ||
    catalogView.entries.some((entry) =>
      catalog.entries.filter((candidate) =>
        candidate.entryDigest === entry.entryDigest
      ).length !== 1
    )
  ) {
    return refusal(
      "catalog_mismatch",
      "declaration closure requires one exact ready Catalog/View",
    );
  }

  const allPublications = catalog.boundPublications;
  const programMatches = allPublications.flatMap((publication) =>
    publication.programs.filter((program) => program.programRef === programRef)
      .map((value) => ({ publication, value })),
  );
  if (programMatches.length !== 1) {
    return refusal(
      programMatches.length === 0 ? "absent" : "ambiguous",
      "Program does not resolve to one exact publication",
    );
  }
  const programPublication = programMatches[0]!.publication;
  const program = programMatches[0]!.value;
  if (
    closureScope === "execution" &&
    (
      requestedGraphFunctionRef === null ||
      !program.callableMembership.includes(requestedGraphFunctionRef)
    )
  ) {
    return refusal(
      "wrong_owner",
      "selected GraphFunction is outside the exact Program membership",
    );
  }

  const reachable = reachableProductIds(
    catalog,
    programPublication.owningProductId,
  );
  const rootGraphFunctionRefs = closureScope === "program"
    ? Object.freeze([...program.callableMembership])
    : Object.freeze([requestedGraphFunctionRef as string]) as readonly [string];
  const graphFunctionRefs = new Set(rootGraphFunctionRefs);
  const contractRefs = new Set<string>();
  const evaluatorRefs = new Set<string>();
  const ruleRefs = new Set<string>();
  const bindingRefs = new Set<string>();
  const closureContractRefs = new Set([program.closureContractRef]);
  const graphLocations = new Map<string, LocatedDeclaration<GraphFunction>>();

  const graphQueue = [...graphFunctionRefs];
  for (let index = 0; index < graphQueue.length; index += 1) {
    const graphFunctionRef = graphQueue[index]!;
    if (graphLocations.has(graphFunctionRef)) continue;
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.graphFunctions,
      (graphFunction) => graphFunction.name === graphFunctionRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `GraphFunction ${graphFunctionRef}`);
    }
    const { publication, value: graphFunction } = located.located;
    const publicationDigest = modulePublicationSemanticDigest(publication);
    const callerSelectedRoot =
      closureScope === "execution" &&
      graphFunctionRef === requestedGraphFunctionRef;
    const programCallableRoot =
      closureScope === "program" &&
      rootGraphFunctionRefs.includes(graphFunctionRef);
    const selectedLookup = callerSelectedRoot
      ? lookupGraphFunctionDefinition(catalogView, graphFunctionRef, programRef)
      : programCallableRoot
      ? lookupGraphFunctionDefinition(catalog, graphFunctionRef, programRef)
      : null;
    if (
      selectedLookup !== null &&
      selectedLookup.kind !== "graph_function_definition_lookup_exact"
    ) {
      return refusal(
        selectedLookup.kind === "graph_function_definition_lookup_absent"
          ? "absent"
          : "ambiguous",
        `GraphFunction ${graphFunctionRef} lacks one exact Program-aware ${callerSelectedRoot ? "CatalogView" : "Catalog"} row`,
      );
    }
    const candidateCatalogRows: readonly GraphFunctionCatalogEntry[] =
      selectedLookup?.kind === "graph_function_definition_lookup_exact"
        ? [selectedLookup.entry]
        : catalog.entries;
    const catalogRows = candidateCatalogRows.filter((entry) =>
      entry.definitionRef === graphFunctionRef &&
      entry.owningProductId === publication.owningProductId &&
      entry.publicationDigest === publicationDigest &&
      entry.definitionDigest ===
        sha256Canonical(graphFunction as unknown as JsonValue) &&
      canonicalJson(entry.definition as unknown as JsonValue) ===
        canonicalJson(graphFunction as unknown as JsonValue)
    );
    if (
      (selectedLookup !== null && catalogRows.length !== 1) ||
      (selectedLookup === null && catalogRows.length === 0)
    ) {
      return refusal(
        catalogRows.length === 0 ? "absent" : "ambiguous",
        `GraphFunction ${graphFunctionRef} lacks one exact Catalog/View owner row`,
      );
    }
    graphLocations.set(graphFunctionRef, located.located);
    graphFunction.inputs.forEach((ref) => contractRefs.add(ref));
    graphFunction.outputs.forEach((ref) => contractRefs.add(ref));
    for (const key of [
      "abg.closure_contract",
      "abg.child_closure_contract",
    ]) {
      const ref = graphFunction.declarations[key];
      if (ref !== undefined) closureContractRefs.add(ref);
    }
    for (const key of [
      "abg.evidence_contract",
      "abg.judgment_contract",
      "abg.transition_contract",
    ]) {
      const ref = graphFunction.declarations[key];
      if (ref !== undefined) contractRefs.add(ref);
    }
    for (const node of graphFunction.template.nodes) {
      const references = projectCProgramNodeDeclarationReferences(node.term);
      for (const ref of references.graphFunctionRefs) {
        if (!graphFunctionRefs.has(ref)) {
          graphFunctionRefs.add(ref);
          graphQueue.push(ref);
        }
      }
      references.contractRefs.forEach((ref) => contractRefs.add(ref));
      references.implementationBindingRefs.forEach((ref) =>
        bindingRefs.add(ref)
      );
    }
    for (const application of graphFunction.template.applications) {
      const references =
        projectGraphFunctionApplicationDeclarationReferences(application);
      for (const ref of references.graphFunctionRefs) {
        if (!graphFunctionRefs.has(ref)) {
          graphFunctionRefs.add(ref);
          graphQueue.push(ref);
        }
      }
      references.contractRefs.forEach((ref) => contractRefs.add(ref));
      references.evaluatorRefs.forEach((ref) => evaluatorRefs.add(ref));
      references.ruleRefs.forEach((ref) => ruleRefs.add(ref));
    }
  }

  const bindingLocations: LocatedDeclaration<ImplementationBinding>[] = [];
  for (const bindingRef of bindingRefs) {
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.implementationBindings,
      (binding) => binding.bindingRef === bindingRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `ImplementationBinding ${bindingRef}`);
    }
    bindingLocations.push(located.located);
    contractRefs.add(located.located.value.inputContractRef);
    contractRefs.add(located.located.value.outputContractRef);
    contractRefs.add(located.located.value.failureContractRef);
    contractRefs.add(located.located.value.refusalContractRef);
  }

  const closureLocations: LocatedDeclaration<ClosureContract>[] = [];
  for (const closureContractRef of closureContractRefs) {
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.closureContracts,
      (contract) => contract.closureContractRef === closureContractRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `ClosureContract ${closureContractRef}`);
    }
    closureLocations.push(located.located);
    const closure = located.located.value;
    contractRefs.add(closure.evidenceContractRef);
    contractRefs.add(closure.resultContractRef);
    contractRefs.add(closure.refusalContractRef);
    contractRefs.add(closure.judgmentContractRef);
    contractRefs.add(closure.rejectionContractRef);
    contractRefs.add(closure.transitionContractRef);
  }

  const contractLocations: LocatedDeclaration<ContractDeclaration>[] = [];
  for (const contractRef of contractRefs) {
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.contracts,
      (contract) => contract.contractRef === contractRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `Contract ${contractRef}`);
    }
    contractLocations.push(located.located);
  }

  const evaluatorLocations: LocatedDeclaration<EvaluatorDeclaration>[] = [];
  for (const evaluatorRef of evaluatorRefs) {
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.evaluators,
      (evaluator) => evaluator.name === evaluatorRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `Evaluator ${evaluatorRef}`);
    }
    evaluatorLocations.push(located.located);
  }

  const ruleLocations: LocatedDeclaration<RuleDeclaration>[] = [];
  for (const ruleRef of ruleRefs) {
    const located = locateRequired(
      allPublications,
      reachable,
      (publication) => publication.rules,
      (rule) => rule.name === ruleRef,
    );
    if (located.kind !== "one") {
      return locatedRefusal(located, `Rule ${ruleRef}`);
    }
    ruleLocations.push(located.located);
  }

  const semanticsBinding = programPublication.productSemanticsBinding;
  const semanticsMatches = allPublications.filter((publication) => {
    if (!reachable.has(publication.owningProductId)) return false;
    const installs = catalog.readinessBasis.installedProducts.filter(
      (install) =>
        install.productId === publication.owningProductId &&
        install.productContentDigest === publication.productContentDigest &&
        install.manifestDigest === publication.productManifestDigest &&
        install.packageName === semanticsBinding.packageName &&
        install.packageVersion === semanticsBinding.packageVersion,
    );
    return installs.length === 1 &&
      canonicalJson(publication.productSemanticsBinding as unknown as JsonValue) ===
        canonicalJson(semanticsBinding as unknown as JsonValue);
  });
  if (semanticsMatches.length !== 1) {
    return refusal(
      semanticsMatches.length === 0 ? "wrong_owner" : "ambiguous",
      "Product semantics binding does not resolve to one exact compatible publication owner",
    );
  }

  const ownerCoordinates = <T>(
    values: readonly LocatedDeclaration<T>[],
    kind: ExecutionDeclarationKind,
    identity: (value: Readonly<T>) => string,
  ): readonly ExecutionDeclarationOwnerCoordinate[] | null => {
    const coordinates = values.map(({ publication, value }) =>
      exactOwnerCoordinate(catalog, publication, kind, identity(value))
    );
    return coordinates.some((coordinate) => coordinate === null)
      ? null
      : orderedOwnerCoordinates(
          coordinates as ExecutionDeclarationOwnerCoordinate[],
        );
  };
  const graphFunctionOwners = ownerCoordinates(
    [...graphLocations.values()],
    "graph_function",
    (value) => value.name,
  );
  const contractOwners = ownerCoordinates(
    contractLocations,
    "contract",
    (value) => value.contractRef,
  );
  const evaluatorOwners = ownerCoordinates(
    evaluatorLocations,
    "evaluator",
    (value) => value.name,
  );
  const ruleOwners = ownerCoordinates(
    ruleLocations,
    "rule",
    (value) => value.name,
  );
  const implementationBindingOwners = ownerCoordinates(
    bindingLocations,
    "implementation_binding",
    (value) => value.bindingRef,
  );
  const closureContractOwners = ownerCoordinates(
    closureLocations,
    "closure_contract",
    (value) => value.closureContractRef,
  );
  const semanticsOwner = exactOwnerCoordinate(
    catalog,
    semanticsMatches[0]!,
    "semantics",
    semanticsBinding.bindingRef,
  );
  if (
    graphFunctionOwners === null ||
    contractOwners === null ||
    evaluatorOwners === null ||
    ruleOwners === null ||
    implementationBindingOwners === null ||
    closureContractOwners === null ||
    semanticsOwner === null
  ) {
    return refusal(
      "wrong_owner",
      "one required declaration lacks one exact installed publication owner",
    );
  }

  const selectedPublicationMap = new Map<string, Readonly<ModulePublication>>();
  const includePublication = (publication: Readonly<ModulePublication>): void => {
    selectedPublicationMap.set(
      `${publication.moduleRef}\0${modulePublicationSemanticDigest(publication)}`,
      publication,
    );
  };
  includePublication(programPublication);
  includePublication(semanticsMatches[0]!);
  [
    ...graphLocations.values(),
    ...bindingLocations,
    ...closureLocations,
    ...contractLocations,
    ...evaluatorLocations,
    ...ruleLocations,
  ].forEach(({ publication }) => includePublication(publication));
  const publications = Object.freeze(
    [...selectedPublicationMap.values()].sort((left, right) =>
      compareUnicodeCodeUnits(left.moduleRef, right.moduleRef) ||
      compareUnicodeCodeUnits(
        modulePublicationSemanticDigest(left),
        modulePublicationSemanticDigest(right),
      )
    ),
  );
  const publicationDigests = Object.freeze(
    publications.map(modulePublicationSemanticDigest),
  );
  const body = deepFreeze({
    closureScope,
    catalogBasisDigest: catalog.basisDigest,
    catalogViewDigest: catalogView.viewDigest,
    programRef,
    rootGraphFunctionRefs,
    selectedGraphFunctionRef: closureScope === "execution"
      ? requestedGraphFunctionRef
      : null,
    programPublicationDigest: modulePublicationSemanticDigest(programPublication),
    publicationDigests,
    graphFunctionOwners,
    contractOwners,
    evaluatorOwners,
    ruleOwners,
    implementationBindingOwners,
    closureContractOwners,
    semanticsOwner,
  });
  const closureDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: closureScope === "execution"
      ? "resolved_execution_declaration_closure" as const
      : "resolved_program_declaration_closure" as const,
    schemaVersion: "5.0.0" as const,
    closureRef:
      `execution-declaration-closure://abiogenesis/${closureDigest.slice("sha256:".length)}`,
    closureDigest,
    ...body,
    programPublication,
    publications,
  }) as ResolvedDeclarationClosure;
}

export function resolveExecutionDeclarationClosure(
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
  programRef: string,
  selectedGraphFunctionRef: string,
): ExecutionDeclarationClosureResult {
  return resolveDeclarationClosure(
    catalog,
    catalogView,
    programRef,
    "execution",
    selectedGraphFunctionRef,
  ) as ExecutionDeclarationClosureResult;
}

export function resolveProgramDeclarationClosure(
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
  programRef: string,
): ProgramDeclarationClosureResult {
  return resolveDeclarationClosure(
    catalog,
    catalogView,
    programRef,
    "program",
    null,
  ) as ProgramDeclarationClosureResult;
}
