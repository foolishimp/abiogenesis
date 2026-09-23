import { semanticLifecycleRefForProgram, validSemanticProgramOwners } from "../gtl/semantic_stage.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
import { validRequirementHandoffPublication } from "../gtl/requirement_handoff.js";
import { worksitePreservedResultSourceOfGraphFunction, WORKSITE_PRESERVED_RESULT_IDS } from "../gtl/worksite_construction_recovery.js";
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
  admitGraphFunctionCatalog,
  narrowGraphFunctionCatalog,
  lookupGraphFunctionDefinition,
  type CatalogReadinessBasis,
  type GraphFunctionCatalogEntry,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { isWorksiteCommandForwardGraphFunction } from "../gtl/worksite_command_forward.js";
import { WORKSITE_COMMAND_FORWARD_IDS as forwardIds } from "./worksite_command_forward_identity.js";

/** Supplied declarations are reconstructed against facts supplied by the native
 * environment owner. This pure relation is shared by conformance and replay;
 * it neither admits installs nor confers authority on a supplied Catalog. */
export function reconstructHistoricalDeclarationCatalog(
  supplied: Readonly<{ catalog: ReadyGraphFunctionCatalog; catalogView: GraphFunctionCatalogView }>,
  environment: Readonly<{
    workspaceBinding: CatalogReadinessBasis["workspaceBinding"];
    resolvedLock: CatalogReadinessBasis["resolvedLock"];
    installedProducts: CatalogReadinessBasis["installedProducts"];
  }>,
): Readonly<{ catalog: ReadyGraphFunctionCatalog; catalogView: GraphFunctionCatalogView }> {
  const same = (left: unknown, right: unknown) =>
    canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  const catalog = admitGraphFunctionCatalog(supplied.catalog.readinessBasis);
  if (catalog.kind !== "graph_function_catalog" || !same(catalog, supplied.catalog) ||
      !same(catalog.readinessBasis.workspaceBinding, environment.workspaceBinding) ||
      !same(catalog.readinessBasis.resolvedLock, environment.resolvedLock) ||
      catalog.readinessBasis.installedProducts.length !== environment.installedProducts.length ||
      new Set(environment.installedProducts.map((row) => canonicalJson(row as unknown as JsonValue))).size !==
        environment.installedProducts.length ||
      catalog.readinessBasis.installedProducts.some((candidate) =>
        environment.installedProducts.filter((install) => same(install, candidate)).length !== 1)) {
    throw new TypeError("declaration Catalog differs from its exact admitted workspace, installs or lock");
  }
  const catalogView = narrowGraphFunctionCatalog(catalog, supplied.catalogView.allowlist);
  if (catalogView.kind !== "graph_function_catalog_view" || !same(catalogView, supplied.catalogView)) {
    throw new TypeError("declaration Catalog View differs from exact narrowing");
  }
  return deepFreeze({ catalog, catalogView });
}

/** Select one declaration and its owner inside an already resolved closure. */
export function selectExactClosureContract(
  closure: ResolvedDeclarationClosure,
  contractRef: string,
): Readonly<{ contract: Readonly<ContractDeclaration>; owner: ExecutionDeclarationOwnerCoordinate }> | null {
  const owners = closure.contractOwners.filter((owner) => owner.declarationRef === contractRef);
  if (owners.length !== 1) return null;
  const owner = owners[0]!;
  const publications = closure.publications.filter((publication) =>
    publication.moduleRef === owner.moduleRef && publication.owningProductId === owner.productId &&
    modulePublicationSemanticDigest(publication) === owner.publicationDigest);
  if (publications.length !== 1) return null;
  const contracts = publications[0]!.contracts.filter((contract) => contract.contractRef === contractRef);
  return contracts.length === 1 ? deepFreeze({ contract: contracts[0]!, owner }) : null;
}

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

  // The declared source relation borrows its existing owner/GF/contracts; it
  // grants no additional callable membership or runtime operation.
  const lifecycleRef = semanticLifecycleRefForProgram(programPublication, program);
  let lifecyclePublication: Readonly<ModulePublication> | undefined;
  if (lifecycleRef !== undefined) {
    const lifecycle = locateRequired(allPublications, reachable,
      p => [...(p.semanticLifecycle === undefined ? [] : [p.semanticLifecycle]), ...(p.semanticJobLifecycle === undefined ? [] : [p.semanticJobLifecycle])], d => d.declarationRef === lifecycleRef);
    if (lifecycle.kind !== "one") return locatedRefusal(lifecycle, `Semantic lifecycle ${lifecycleRef}`);
    lifecyclePublication = lifecycle.located.publication;
    // Historical stages are exact declared dependencies, not new start/call rights.
    for (const stage of lifecycle.located.value.stages) graphFunctionRefs.add(stage.graphFunctionRef);
    if (lifecyclePublication.semanticJobLifecycle !== undefined) {
      if (!validSemanticProgramOwners(programPublication, program, lifecyclePublication, lifecyclePublication))
        return refusal("wrong_owner", "generic semantic job requires its exact installed declaration owner");
      graphFunctionRefs.add(lifecyclePublication.semanticJobLifecycle.intakeGraphFunctionRef);
      for (const template of lifecyclePublication.semanticJobLifecycle.proofTemplates) {
        contractRefs.add(template.realizationContractRef);
        contractRefs.add(template.proofContractRef);
      }
    }
  }
  const sourceRef = lifecyclePublication?.semanticLifecycle?.sourceDeclarationRef;
  if (sourceRef !== undefined) {
    const source = locateRequired(allPublications, reachable, p => p.requirementHandoffs ?? [], d => d.declarationRef === sourceRef);
    if (source.kind !== "one") return locatedRefusal(source, `Semantic source ${sourceRef}`);
    if (!validRequirementHandoffPublication(source.located.publication) ||
      !validSemanticProgramOwners(programPublication, program, lifecyclePublication!, source.located.publication)) {
      return refusal("wrong_owner", "semantic source does not retain its exact declaration and paired role owners");
    }
    graphFunctionRefs.add(source.located.value.graphFunctionRef);
    for (const binding of source.located.value.fulfillmentBindings) {
      if (binding.realizationContractRef !== null) contractRefs.add(binding.realizationContractRef);
      if (binding.proofContractRef !== null) contractRefs.add(binding.proofContractRef);
    }
  }
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
    const locallyPublishedProgramRoot = programCallableRoot &&
      programPublication.graphFunctions.some((definition) =>
        definition.name === graphFunctionRef
      );
    // The Program owns its explicit callable membership. A borrowed member's
    // contributor row retains that contributor's Program metadata; its exact
    // reachable publication and owner row below establish dependency closure.
    // Locally published Program roots use their reciprocal Catalog membership;
    // only the actual caller-selected root requires the Program-aware View.
    const selectedLookup = callerSelectedRoot
      ? lookupGraphFunctionDefinition(catalogView, graphFunctionRef, programRef)
      : locallyPublishedProgramRoot
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
      ((selectedLookup !== null || programCallableRoot) && catalogRows.length !== 1) ||
      (selectedLookup === null && catalogRows.length === 0)
    ) {
      return refusal(
        catalogRows.length === 0 ? "absent" : "ambiguous",
        `GraphFunction ${graphFunctionRef} lacks one exact Catalog/View owner row`,
      );
    }
    const forwardClaim = graphFunction.declarations["abg.worksite_command_forward"] !== undefined ||
      ([forwardIds.graphFunctionRef,forwardIds.childGraphFunctionRef] as readonly string[]).includes(graphFunctionRef) ||
      graphFunction.template.nodes.some(node=>projectCProgramNodeDeclarationReferences(node.term).implementationBindingRefs.some(ref=>
        ref===forwardIds.prepareBindingRef||ref===forwardIds.implementationBindingRef));
    if(forwardClaim && (!isWorksiteCommandForwardGraphFunction(graphFunction) ||
      program.programRef!==forwardIds.programRef || program.callableMembership.length!==2 ||
      ![forwardIds.graphFunctionRef,forwardIds.childGraphFunctionRef].every(ref=>program.callableMembership.includes(ref)))) {
      return refusal("wrong_owner","forward C2 must retain its exact finite no-construction Program and historical-proof marker");
    }
    const recoveryClaim = graphFunction.declarations["abg.preserved_result_source"] !== undefined ||
      graphFunction.template.nodes.some(node => projectCProgramNodeDeclarationReferences(node.term).implementationBindingRefs.some(ref =>
        ref === WORKSITE_PRESERVED_RESULT_IDS.authenticateBindingRef || ref === WORKSITE_PRESERVED_RESULT_IDS.deriveBindingRef));
    if (recoveryClaim && worksitePreservedResultSourceOfGraphFunction(graphFunction) === null) {
      return refusal("wrong_owner", `GraphFunction ${graphFunctionRef} changes the native preserved-result selector or composition`);
    }
    graphLocations.set(graphFunctionRef, located.located);
    const historyDependency = graphFunction.declarations["abg.semantic_revision_history"];
    if (historyDependency !== undefined) {
      const revisionBindings: readonly string[] = [
        SEMANTIC_REVISION_IDS.selectionBindingRef, SEMANTIC_REVISION_IDS.projectionBindingRef,
        SEMANTIC_REVISION_IDS.authorBindingRef, SEMANTIC_REVISION_IDS.assessorBindingRef,
        SEMANTIC_REVISION_IDS.bridgeBindingRef, SEMANTIC_REVISION_IDS.evidenceInputBindingRef,
        SEMANTIC_REVISION_IDS.terminalBindingRef,
      ];
      const boundRoles = (definition: Readonly<GraphFunction>) => definition.template.nodes
        .flatMap(node => projectCProgramNodeDeclarationReferences(node.term).implementationBindingRefs);
      if (historyDependency !== SEMANTIC_REVISION_IDS.historicalOwnerDependencyRef ||
        !boundRoles(graphFunction).some(ref => revisionBindings.includes(ref))) {
        return refusal("wrong_owner", "revision history dependency requires its exact declared revision role");
      }
      const declaredSelection = graphFunction.declarations["abg.semantic_revision_selection"];
      const declaredStage = graphFunction.declarations["abg.semantic_revision_stage"];
      if ((declaredSelection !== undefined && declaredSelection !== lifecycleRef) ||
        (declaredStage !== undefined &&
          !(lifecyclePublication?.semanticLifecycle ?? lifecyclePublication?.semanticJobLifecycle)?.stages.some(stage => stage.declarationRef === declaredStage))) {
        return refusal("wrong_owner", "revision history dependency crosses the declared lifecycle");
      }
      // This closed Product dependency belongs to the declared D2 role, not to
      // callable membership. Historical definitions authenticate observations;
      // neither their inclusion nor their implementations grant a call/start.
      const historicalRefs = new Set<string>([
        WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
        WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
        WORKSITE_REVISION_IDS.graphFunctionRef,
      ]);
      const semanticBindings = new Set<string>([
        ...revisionBindings, SEMANTIC_STAGE_IDS.authorBindingRef,
        SEMANTIC_STAGE_IDS.assessorBindingRef, SEMANTIC_STAGE_IDS.bridgeBindingRef,
        SEMANTIC_STAGE_IDS.evidenceInputBindingRef, SEMANTIC_STAGE_IDS.terminalBindingRef,
        SEMANTIC_STAGE_IDS.jobIntakeBindingRef, SEMANTIC_STAGE_IDS.jobContextBindingRef,
        SEMANTIC_STAGE_IDS.jobPlanBindingRef, SEMANTIC_STAGE_IDS.jobBridgeBindingRef,
      ]);
      // Only the exact current and borrowed lifecycle publications contribute
      // local semantic history. Do not enumerate ambient Catalog functions.
      const historyPublications = lifecyclePublication === undefined ||
          lifecyclePublication === programPublication
        ? [programPublication] : [programPublication, lifecyclePublication];
      for (const owner of historyPublications) {
        for (const definition of owner.graphFunctions) {
          const selectionRef = definition.declarations["abg.semantic_revision_selection"];
          const stageRef = definition.declarations["abg.semantic_revision_stage"];
          if ((selectionRef !== undefined && selectionRef !== lifecycleRef) ||
            (stageRef !== undefined &&
              !(lifecyclePublication?.semanticLifecycle ?? lifecyclePublication?.semanticJobLifecycle)?.stages.some(stage => stage.declarationRef === stageRef))) continue;
          if (boundRoles(definition).some(ref => semanticBindings.has(ref))) historicalRefs.add(definition.name);
        }
      }
      for (const ref of historicalRefs) {
        if (!graphFunctionRefs.has(ref)) {
          graphFunctionRefs.add(ref);
          graphQueue.push(ref);
        }
      }
    }
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
      "abg.failure_contract",
      "abg.judgment_contract",
      "abg.raw_result_contract",
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

  const selectedPublicationMap = new Map<string, Readonly<ModulePublication>>();
  const includePublication = (publication: Readonly<ModulePublication>): void => {
    selectedPublicationMap.set(
      `${publication.moduleRef}\0${modulePublicationSemanticDigest(publication)}`,
      publication,
    );
  };
  includePublication(programPublication);
  [
    ...graphLocations.values(),
    ...bindingLocations,
    ...closureLocations,
    ...contractLocations,
    ...evaluatorLocations,
    ...ruleLocations,
  ].forEach(({ publication }) => includePublication(publication));
  const semanticsBinding = programPublication.productSemanticsBinding;
  const semanticsInstalls = catalog.readinessBasis.installedProducts.filter(
    (install) =>
      install.productId === programPublication.owningProductId &&
      install.productContentDigest === programPublication.productContentDigest &&
      install.manifestDigest === programPublication.productManifestDigest &&
      install.packageName === semanticsBinding.packageName &&
      install.packageVersion === semanticsBinding.packageVersion,
  );
  let semanticsPublication = programPublication;
  if (semanticsInstalls.length !== 1) {
    if (semanticsInstalls.length > 1) {
      return refusal("ambiguous", "Product semantics has multiple exact Program owner installs");
    }
    // Required declaration witnesses, not unrelated sibling publications, own
    // an external provider. Distinct publications remain distinct witnesses.
    const externalOwners = [...selectedPublicationMap.values()].flatMap((publication) => {
      if (!reachable.has(publication.owningProductId) ||
          canonicalJson(publication.productSemanticsBinding as unknown as JsonValue) !==
            canonicalJson(semanticsBinding as unknown as JsonValue)) return [];
      return catalog.readinessBasis.installedProducts.filter((install) =>
        install.productId === publication.owningProductId &&
        install.productContentDigest === publication.productContentDigest &&
        install.manifestDigest === publication.productManifestDigest &&
        install.packageName === semanticsBinding.packageName &&
        install.packageVersion === semanticsBinding.packageVersion,
      ).map((install) => ({ publication, install }));
    });
    if (externalOwners.length !== 1) {
      return refusal(externalOwners.length === 0 ? "wrong_owner" : "ambiguous",
        "Product semantics lacks one exact compatible required declaration owner");
    }
    semanticsPublication = externalOwners[0]!.publication;
  }
  includePublication(semanticsPublication);

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
    semanticsPublication,
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
