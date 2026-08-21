import type {
  CatalogContribution,
  GraphFunction,
  ModulePublication,
} from "../gtl/contracts.js";
import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductInstall, ResolvedProductLock, WorkspaceBindingCandidate } from "./environment.js";
import { constructProductSet, isResolvedProductLock } from "./environment.js";
import type { ProductInstallCandidate, VerifiedProductArtifact } from "./contracts.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { isVerifiedProductArtifact } from "./verify_product.js";

export interface GraphFunctionCatalogEntry {
  readonly kind: "graph_function_catalog_entry";
  readonly handle: string;
  readonly definitionRef: string;
  readonly definitionDigest: Sha256Digest;
  readonly definition: Readonly<GraphFunction>;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly publicationDigest: Sha256Digest;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly entryDigest: Sha256Digest;
}

export interface DeclarationCatalogEntry {
  readonly kind: "declaration_catalog_entry";
  readonly handle: string;
  readonly declarationKind: "node_type" | "overlay";
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly publicationDigest: Sha256Digest;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly entryDigest: Sha256Digest;
}

export interface GraphFunctionCatalog {
  readonly kind: "graph_function_catalog";
  readonly schemaVersion: "5.0.0";
  readonly basisDigest: Sha256Digest;
  readonly publicationDigests: readonly Sha256Digest[];
  readonly entries: readonly GraphFunctionCatalogEntry[];
  readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
  readonly declarationEntries: readonly DeclarationCatalogEntry[];
  readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
}

export interface CatalogReadinessBasis {
  readonly workspaceBinding: WorkspaceBindingCandidate;
  readonly resolvedLock: ResolvedProductLock;
  readonly verifiedProducts: readonly VerifiedProductArtifact[];
  readonly installedProducts: readonly ProductInstallCandidate[];
  readonly publications: readonly Readonly<ModulePublication>[];
}

export interface CatalogReadinessRowDisposition {
  readonly handle: string;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly disposition:
    | "admitted"
    | "rejected"
    | "incompatible"
    | "conflicting"
    | "unready"
    | "unresolved";
  readonly readiness: "ready" | "not_ready";
  readonly reason: string | null;
  readonly readinessPrerequisiteRefs: readonly string[];
  readonly rowDigest: Sha256Digest;
}

export interface ReadyGraphFunctionCatalog extends GraphFunctionCatalog {
  readonly readinessBasisDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly productSetId: string;
  readonly productSetDigest: Sha256Digest;
  readonly readinessBasis: CatalogReadinessBasis;
  readonly boundPublications: readonly Readonly<ModulePublication>[];
  readonly rowDispositions: readonly CatalogReadinessRowDisposition[];
}

export interface GraphFunctionCatalogView {
  readonly kind: "graph_function_catalog_view";
  readonly catalogBasisDigest: Sha256Digest;
  readonly allowlist: readonly string[];
  readonly entries: readonly GraphFunctionCatalogEntry[];
  readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
  readonly declarationEntries: readonly DeclarationCatalogEntry[];
  readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
  readonly viewDigest: Sha256Digest;
}

export interface GraphFunctionDefinitionLookupExact {
  readonly kind: "graph_function_definition_lookup_exact";
  readonly definitionRef: string;
  readonly programRef: string;
  readonly entry: GraphFunctionCatalogEntry;
}

export interface GraphFunctionDefinitionLookupAbsent {
  readonly kind: "graph_function_definition_lookup_absent";
  readonly definitionRef: string;
  readonly programRef: string;
}

export interface GraphFunctionDefinitionLookupAmbiguous {
  readonly kind: "graph_function_definition_lookup_ambiguous";
  readonly definitionRef: string;
  readonly programRef: string;
  readonly entries: readonly GraphFunctionCatalogEntry[];
}

export type GraphFunctionDefinitionLookupResult =
  | GraphFunctionDefinitionLookupExact
  | GraphFunctionDefinitionLookupAbsent
  | GraphFunctionDefinitionLookupAmbiguous;

export interface CatalogConstructionRefusal {
  readonly kind: "catalog_construction_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "canonical_handle_collision"
    | "duplicate_contribution_reference"
    | "duplicate_allowlist_entry"
    | "graph_function_definition_missing"
    | "invalid_program_membership"
    | "binding_lock_mismatch"
    | "verified_product_mismatch"
    | "installed_product_mismatch"
    | "publication_not_bound"
    | "unresolved_readiness_prerequisite"
    | "publication_identity_collision"
    | "publication_owner_mismatch"
    | "unknown_allowlist_entry";
  readonly message: string;
}

export type GraphFunctionCatalogResult =
  | GraphFunctionCatalog
  | CatalogConstructionRefusal;
export type ReadyGraphFunctionCatalogResult =
  | ReadyGraphFunctionCatalog
  | CatalogConstructionRefusal;
export type GraphFunctionCatalogViewResult =
  | GraphFunctionCatalogView
  | CatalogConstructionRefusal;

export interface DeclarationApplicationInput {
  readonly applicationKind: "node_type" | "overlay";
  readonly handle: string;
  readonly targetRef: string;
  readonly targetDigest: Sha256Digest;
  readonly appliedValueRef: string;
  readonly appliedValueDigest: Sha256Digest;
}

export interface DeclarationApplication {
  readonly kind: "declaration_application";
  readonly catalogBasisDigest: Sha256Digest;
  readonly viewDigest: Sha256Digest;
  readonly declaration: DeclarationCatalogEntry;
  readonly targetRef: string;
  readonly targetDigest: Sha256Digest;
  readonly appliedValueRef: string;
  readonly appliedValueDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly applicationDigest: Sha256Digest;
}

export interface DeclarationApplicationRefusal {
  readonly kind: "declaration_application_refusal";
  readonly code: "kind_mismatch" | "outside_view";
  readonly message: string;
}

export type DeclarationApplicationResult =
  | DeclarationApplication
  | DeclarationApplicationRefusal;

function refusal(
  code: CatalogConstructionRefusal["code"],
  message: string,
): CatalogConstructionRefusal {
  return deepFreeze({
    kind: "catalog_construction_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  }) as CatalogConstructionRefusal;
}

function orderedUniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze(
    [...new Set(values)].sort(compareUnicodeCodeUnits),
  );
}

function orderedStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values].sort(compareUnicodeCodeUnits));
}

function frozenCanonicalStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

const CONTRIBUTION_INVENTORY_FIELDS = [
  "programMembershipRefs",
  "readinessPrerequisiteRefs",
  "compatibilityRefs",
  "provenanceRefs",
] as const;

type ContributionInventoryField =
  (typeof CONTRIBUTION_INVENTORY_FIELDS)[number];

function duplicateContributionReference(
  publications: readonly Readonly<ModulePublication>[],
): Readonly<{
  readonly moduleRef: string;
  readonly handle: string;
  readonly field: ContributionInventoryField;
  readonly value: string;
}> | null {
  for (const publication of publications) {
    for (const contribution of publication.contributions) {
      for (const field of CONTRIBUTION_INVENTORY_FIELDS) {
        const seen = new Set<string>();
        for (const value of contribution[field]) {
          if (seen.has(value)) {
            return {
              moduleRef: publication.moduleRef,
              handle: contribution.handle,
              field,
              value,
            };
          }
          seen.add(value);
        }
      }
    }
  }
  return null;
}

function duplicateContributionRefusal(
  duplicate: NonNullable<ReturnType<typeof duplicateContributionReference>>,
): CatalogConstructionRefusal {
  return refusal(
    "duplicate_contribution_reference",
    `module ${duplicate.moduleRef} catalog handle ${duplicate.handle} has duplicate ${duplicate.field} value ${duplicate.value}`,
  );
}

function frozenIndex<T extends Readonly<{ readonly handle: string }>>(
  entries: readonly T[],
): Readonly<Record<string, T>> {
  return deepFreeze(Object.fromEntries(
    entries.map((entry) => [entry.handle, entry]),
  )) as Readonly<Record<string, T>>;
}

function exactDefinition(
  publication: Readonly<ModulePublication>,
  contribution: Readonly<CatalogContribution>,
): Readonly<GraphFunction> | null {
  const matches = publication.graphFunctions.filter(
    (definition) => definition.name === contribution.declarationOrContractRef,
  );
  return matches.length === 1 ? matches[0]! : null;
}

function graphFunctionEntry(
  publication: Readonly<ModulePublication>,
  publicationDigest: Sha256Digest,
  contribution: Readonly<CatalogContribution>,
  definition: Readonly<GraphFunction>,
): GraphFunctionCatalogEntry {
  const body = {
    handle: contribution.handle,
    definitionRef: contribution.declarationOrContractRef,
    definitionDigest: sha256Canonical(definition as unknown as JsonValue),
    definition,
    owningProductId: contribution.owningProductId,
    moduleRef: publication.moduleRef,
    publicationDigest,
    programMembershipRefs: frozenCanonicalStrings(
      contribution.programMembershipRefs,
    ),
    compatibilityRefs: frozenCanonicalStrings(contribution.compatibilityRefs),
    provenanceRefs: frozenCanonicalStrings(contribution.provenanceRefs),
  };
  return deepFreeze({
    kind: "graph_function_catalog_entry" as const,
    ...body,
    entryDigest: sha256Canonical(body as unknown as JsonValue),
  }) as GraphFunctionCatalogEntry;
}

function declarationEntry(
  publication: Readonly<ModulePublication>,
  publicationDigest: Sha256Digest,
  contribution: Readonly<CatalogContribution> & Readonly<{
    readonly kind: "node_type" | "overlay";
  }>,
): DeclarationCatalogEntry {
  const body = {
    handle: contribution.handle,
    declarationKind: contribution.kind,
    declarationOrContractRef: contribution.declarationOrContractRef,
    owningProductId: contribution.owningProductId,
    moduleRef: publication.moduleRef,
    publicationDigest,
    programMembershipRefs: frozenCanonicalStrings(
      contribution.programMembershipRefs,
    ),
    compatibilityRefs: frozenCanonicalStrings(contribution.compatibilityRefs),
    provenanceRefs: frozenCanonicalStrings(contribution.provenanceRefs),
  };
  return deepFreeze({
    kind: "declaration_catalog_entry" as const,
    ...body,
    entryDigest: sha256Canonical(body as unknown as JsonValue),
  }) as DeclarationCatalogEntry;
}

function lockComparableProduct(
  value: VerifiedProductArtifact | ProductInstallCandidate,
): JsonValue {
  return {
    productId: value.productId,
    packageName: value.packageName,
    packageVersion: value.packageVersion,
    artifactDigest: value.artifactDigest,
    productContentDigest: value.productContentDigest,
    manifestDigest: value.manifestDigest,
    descriptorRef: value.descriptorRef,
    publisherNamespace: value.publisherNamespace,
    catalogId: value.catalogId,
    catalogDigest: value.catalogDigest,
    contributionManifestRef: value.contributionManifestRef,
    contributionManifestDigest: value.contributionManifestDigest,
    contributionManifest: value.contributionManifest,
    compatibilityRefs: value.compatibilityRefs,
    declaredDependencies: value.declaredDependencies,
    provenanceRef: value.provenanceRef,
    declaredCapabilityRefs: value.declaredCapabilityRefs,
    capabilityDefinitionGraph: value.capabilityDefinitionGraph,
    capabilityDefinitionGraphAsset: value.capabilityDefinitionGraphAsset,
    publicContracts: value.publicContracts,
    publicContractRefs: value.publicContractRefs,
    publicCapabilityRefs: value.publicCapabilityRefs,
  } as unknown as JsonValue;
}

export function directSatisfiedDependencyRefs(
  lock: ResolvedProductLock,
  publishingProductId: string,
): ReadonlySet<string> {
  const satisfied = new Set<string>();
  for (const edge of lock.dependencyEdges) {
    if (edge.fromProductId !== publishingProductId) continue;
    const targets = lock.rows.filter((row) => row.productId === edge.toProductId);
    if (targets.length !== 1) continue;
    const target = targets[0]!;
    if (
      target.packageVersion !== edge.packageVersion ||
      !target.compatibilityRefs.includes(edge.compatibilityRef) ||
      edge.requiredContractRefs.some(
        (contractRef) => !target.publicContractRefs.includes(contractRef),
      ) ||
      edge.requiredCapabilityRefs.some(
        (capabilityRef) => !target.publicCapabilityRefs.includes(capabilityRef),
      )
    ) continue;
    edge.requiredContractRefs.forEach((ref) => satisfied.add(ref));
    edge.requiredCapabilityRefs.forEach((ref) => satisfied.add(ref));
  }
  return satisfied;
}

export function admitGraphFunctionCatalog(
  basis: CatalogReadinessBasis,
): ReadyGraphFunctionCatalogResult {
  const canonicalBasis: CatalogReadinessBasis = {
    workspaceBinding: basis.workspaceBinding,
    resolvedLock: basis.resolvedLock,
    verifiedProducts: [...basis.verifiedProducts].sort((left, right) =>
      compareUnicodeCodeUnits(left.productId, right.productId)),
    installedProducts: [...basis.installedProducts].sort((left, right) =>
      compareUnicodeCodeUnits(left.productId, right.productId)),
    publications: basis.publications
      .map((publication) =>
        canonicalizeAuthoredGtlCarrier(publication, "module_publication")
      )
      .sort((left, right) =>
        compareUnicodeCodeUnits(
          modulePublicationSemanticDigest(left),
          modulePublicationSemanticDigest(right),
        )),
  };
  const { workspaceBinding, resolvedLock, verifiedProducts, installedProducts, publications } = canonicalBasis;
  const workspaceBindingBody = {
    workspaceId: workspaceBinding.workspaceId,
    authorityBasisId: workspaceBinding.authorityBasisId,
    authorityBasisDigest: workspaceBinding.authorityBasisDigest,
    authorizedActorRef: workspaceBinding.authorizedActorRef,
    productSetId: workspaceBinding.productSetId,
    productSetDigest: workspaceBinding.productSetDigest,
    lockId: workspaceBinding.lockId,
    lockDigest: workspaceBinding.lockDigest,
    roots: workspaceBinding.roots,
  };
  const expectedWorkspaceBindingDigest = sha256Canonical(
    workspaceBindingBody as unknown as JsonValue,
  );
  if (
    !isResolvedProductLock(resolvedLock) ||
    workspaceBinding.kind !== "workspace_binding_candidate" ||
    workspaceBinding.schemaVersion !== "5.0.0" ||
    workspaceBinding.bindingDigest !== expectedWorkspaceBindingDigest ||
    workspaceBinding.bindingId !==
      `workspace-binding://abiogenesis/${expectedWorkspaceBindingDigest.slice("sha256:".length)}` ||
    workspaceBinding.lockId !== resolvedLock.lockId ||
    workspaceBinding.lockDigest !== resolvedLock.lockDigest
  ) {
    return refusal(
      "binding_lock_mismatch",
      "catalog readiness workspace binding and resolved lock disagree",
    );
  }
  if (
    verifiedProducts.length !== resolvedLock.rows.length ||
    verifiedProducts.some((verified) => {
      if (!isVerifiedProductArtifact(verified)) return true;
      const rows = resolvedLock.rows.filter((row) => row.productId === verified.productId);
      return rows.length !== 1 || canonicalJson(
        lockComparableProduct(verified),
      ) !== canonicalJson(rows[0] as unknown as JsonValue);
    })
  ) {
    return refusal(
      "verified_product_mismatch",
      "catalog readiness verified Products differ from the exact resolved lock",
    );
  }
  if (
    installedProducts.length !== verifiedProducts.length ||
    installedProducts.some((install) => {
      const verified = verifiedProducts.filter(
        (candidate) => candidate.productId === install.productId,
      );
      return install.kind !== "product_install_candidate" ||
        install.disposition !== "materialized" ||
        install.resolvedLockId !== resolvedLock.lockId ||
        install.resolvedLockDigest !== resolvedLock.lockDigest ||
        verified.length !== 1 ||
        canonicalJson(lockComparableProduct(install)) !==
          canonicalJson(lockComparableProduct(verified[0]!));
    })
  ) {
    return refusal(
      "installed_product_mismatch",
      "catalog readiness installed Products differ from verified Product truth",
    );
  }
  const productSet = constructProductSet(
    installedProducts as unknown as readonly ProductInstall[],
    resolvedLock,
  );
  if (
    productSet.kind !== "product_set" ||
    workspaceBinding.productSetId !== productSet.productSetId ||
    workspaceBinding.productSetDigest !== productSet.productSetDigest
  ) {
    return refusal(
      "binding_lock_mismatch",
      "catalog readiness workspace is unrelated to the exact installed Product set",
    );
  }
  const duplicateContribution = duplicateContributionReference(publications);
  if (duplicateContribution !== null) {
    return duplicateContributionRefusal(duplicateContribution);
  }
  const rowDispositions: CatalogReadinessRowDisposition[] = [];
  const admittedPublications: ModulePublication[] = [];
  const boundPublications: ModulePublication[] = [];
  const submittedContributions = publications.flatMap((publication) =>
    publication.contributions.map((contribution) => ({ publication, contribution }))
  );
  const pushDisposition = (
    publication: Readonly<ModulePublication>,
    contribution: CatalogContribution,
    disposition: CatalogReadinessRowDisposition["disposition"],
    reason: string | null,
  ): void => {
    const rowBody = {
      handle: contribution.handle,
      owningProductId: contribution.owningProductId,
      moduleRef: publication.moduleRef,
      disposition,
      readiness: disposition === "admitted" ? "ready" as const : "not_ready" as const,
      reason,
      readinessPrerequisiteRefs: [...contribution.readinessPrerequisiteRefs],
    };
    rowDispositions.push({
      ...rowBody,
      rowDigest: sha256Canonical(rowBody as unknown as JsonValue),
    });
  };
  for (const publication of publications) {
    const lockRows = resolvedLock.rows.filter(
      (row) => row.productId === publication.owningProductId,
    );
    if (lockRows.length !== 1) {
      publication.contributions.forEach((contribution) =>
        pushDisposition(publication, contribution, "unresolved", "publication_owner_unresolved"));
      continue;
    }
    const lockRow = lockRows[0]!;
    const publicationBindings = lockRow.contributionManifest.publicationBindings.filter(
      (binding) => binding.moduleRef === publication.moduleRef,
    );
    const declaredRows = lockRow.contributionManifest.rows.filter(
      (row) => row.moduleRef === publication.moduleRef,
    );
    const publicationIdentityMismatch =
      publication.artifactDigest !== lockRow.artifactDigest ||
      publication.productContentDigest !== lockRow.productContentDigest ||
      publication.productManifestDigest !== lockRow.manifestDigest ||
      publication.descriptorRef !== lockRow.descriptorRef ||
      publication.contributionManifestRef !== lockRow.contributionManifestRef ||
      publicationBindings.length !== 1 ||
      publicationBindings[0]?.publicationDigest !==
        modulePublicationSemanticDigest(publication);
    const admittedReadinessRefs = new Set([
      publication.moduleRef,
      lockRow.artifactDigest,
      lockRow.productContentDigest,
      lockRow.manifestDigest,
      lockRow.descriptorRef,
      lockRow.contributionManifestRef,
      lockRow.contributionManifestDigest,
      lockRow.provenanceRef,
      ...lockRow.compatibilityRefs,
      ...lockRow.publicContractRefs,
      ...lockRow.publicCapabilityRefs,
      ...publication.programs.map((program) => program.programRef),
      ...directSatisfiedDependencyRefs(resolvedLock, publication.owningProductId),
    ]);
    const admittedContributions: CatalogContribution[] = [];
    for (const contribution of publication.contributions) {
      if (publicationIdentityMismatch) {
        pushDisposition(publication, contribution, "rejected", "publication_identity_mismatch");
        continue;
      }
      const collisions = submittedContributions.filter(
        (candidate) => candidate.contribution.handle === contribution.handle,
      );
      if (
        collisions.length > 1 &&
        new Set(collisions.map((candidate) => canonicalJson(candidate.contribution as unknown as JsonValue))).size > 1
      ) {
        pushDisposition(publication, contribution, "conflicting", "canonical_handle_conflict");
        continue;
      }
      const matches = declaredRows.filter((row) => row.handle === contribution.handle);
      if (matches.length !== 1) {
        pushDisposition(
          publication,
          contribution,
          matches.length === 0 ? "rejected" : "conflicting",
          matches.length === 0 ? "manifest_row_absent" : "manifest_row_ambiguous",
        );
        continue;
      }
      const declared = matches[0]!;
      if (
        declared.kind !== contribution.kind ||
        declared.declarationOrContractRef !== contribution.declarationOrContractRef ||
        declared.owningProductId !== contribution.owningProductId ||
        declared.provenanceRef !== lockRow.provenanceRef ||
        canonicalJson(orderedStrings(
          declared.programMembershipRefs,
        ) as unknown as JsonValue) !==
          canonicalJson(
            contribution.programMembershipRefs as unknown as JsonValue,
          ) ||
        canonicalJson(contribution.provenanceRefs as unknown as JsonValue) !==
          canonicalJson(orderedStrings([
            lockRow.artifactDigest,
            lockRow.manifestDigest,
          ]) as unknown as JsonValue)
      ) {
        pushDisposition(publication, contribution, "rejected", "manifest_or_provenance_mismatch");
        continue;
      }
      if (
        canonicalJson(orderedStrings(
          declared.compatibilityRefs,
        ) as unknown as JsonValue) !==
          canonicalJson(
            contribution.compatibilityRefs as unknown as JsonValue,
          ) ||
        declared.compatibilityRefs.some((ref) => !lockRow.compatibilityRefs.includes(ref))
      ) {
        pushDisposition(publication, contribution, "incompatible", "compatibility_mismatch");
        continue;
      }
      if (
        canonicalJson(orderedStrings(
          declared.readinessPrerequisiteRefs,
        ) as unknown as JsonValue) !==
          canonicalJson(
            contribution.readinessPrerequisiteRefs as unknown as JsonValue,
          )
      ) {
        pushDisposition(publication, contribution, "unready", "readiness_declaration_mismatch");
        continue;
      }
      const unresolved = contribution.readinessPrerequisiteRefs.find(
        (ref) => !admittedReadinessRefs.has(ref),
      );
      if (unresolved !== undefined) {
        pushDisposition(publication, contribution, "unready", `missing_readiness_prerequisite:${unresolved}`);
        continue;
      }
      pushDisposition(publication, contribution, "admitted", null);
      admittedContributions.push(contribution);
    }
    if (!publicationIdentityMismatch) {
      boundPublications.push(publication);
      admittedPublications.push({ ...publication, contributions: admittedContributions });
    }
  }
  const catalog = buildGraphFunctionCatalog(admittedPublications);
  if (catalog.kind !== "graph_function_catalog") return catalog;
  const readinessBasisDigest = sha256Canonical(canonicalBasis as unknown as JsonValue);
  return deepFreeze({
    ...catalog,
    basisDigest: readinessBasisDigest,
    readinessBasisDigest,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    lockId: resolvedLock.lockId,
    lockDigest: resolvedLock.lockDigest,
    productSetId: productSet.productSetId,
    productSetDigest: productSet.productSetDigest,
    readinessBasis: canonicalBasis,
    boundPublications,
    rowDispositions: rowDispositions.sort((left, right) =>
      compareUnicodeCodeUnits(left.handle, right.handle) ||
      compareUnicodeCodeUnits(left.rowDigest, right.rowDigest)),
  }) as ReadyGraphFunctionCatalog;
}

export function buildGraphFunctionCatalog(
  exactPublications: readonly Readonly<ModulePublication>[],
): GraphFunctionCatalogResult {
  const publications = exactPublications.map((authoredPublication) => {
    const publication = canonicalizeAuthoredGtlCarrier(
      authoredPublication,
      "module_publication",
    );
    return {
      publication,
      digest: modulePublicationSemanticDigest(publication),
    };
  }).sort((left, right) =>
    compareUnicodeCodeUnits(left.publication.moduleRef, right.publication.moduleRef) ||
    compareUnicodeCodeUnits(left.digest, right.digest)
  );
  const duplicateContribution = duplicateContributionReference(
    publications.map((row) => row.publication),
  );
  if (duplicateContribution !== null) {
    return duplicateContributionRefusal(duplicateContribution);
  }
  const publicationByModule = new Map<string, Sha256Digest>();
  const callableByHandle = new Map<string, GraphFunctionCatalogEntry>();
  const declarationByHandle = new Map<string, DeclarationCatalogEntry>();

  for (const { publication, digest } of publications) {
    const priorDigest = publicationByModule.get(publication.moduleRef);
    if (priorDigest !== undefined) {
      if (priorDigest === digest) continue;
      return refusal(
        "publication_identity_collision",
        `module ${publication.moduleRef} has unequal exact publications`,
      );
    }
    publicationByModule.set(publication.moduleRef, digest);

    for (const contribution of publication.contributions) {
      if (contribution.owningProductId !== publication.owningProductId) {
        return refusal(
          "publication_owner_mismatch",
          `catalog handle ${contribution.handle} differs from its publication owner`,
        );
      }
      if (contribution.kind === "graph_function") {
        const definition = exactDefinition(publication, contribution);
        if (definition === null) {
          return refusal(
            "graph_function_definition_missing",
            `catalog handle ${contribution.handle} has no exact published GraphFunction`,
          );
        }
        const membershipIsExact = contribution.programMembershipRefs.every(
          (programRef) => publication.programs.some((program) =>
            program.programRef === programRef &&
            program.callableMembership.includes(definition.name)
          ),
        );
        if (!membershipIsExact) {
          return refusal(
            "invalid_program_membership",
            `catalog handle ${contribution.handle} claims absent Program membership`,
          );
        }
        const entry = graphFunctionEntry(
          publication,
          digest,
          contribution,
          definition,
        );
        if (declarationByHandle.has(entry.handle)) {
          return refusal(
            "canonical_handle_collision",
            `catalog handle ${entry.handle} names callable and non-callable declarations`,
          );
        }
        const prior = callableByHandle.get(entry.handle);
        if (prior !== undefined && prior.entryDigest !== entry.entryDigest) {
          return refusal(
            "canonical_handle_collision",
            `catalog handle ${entry.handle} names unequal GraphFunctions`,
          );
        }
        callableByHandle.set(entry.handle, prior ?? entry);
        continue;
      }

      const entry = declarationEntry(
        publication,
        digest,
        contribution as Readonly<CatalogContribution> & Readonly<{
          readonly kind: "node_type" | "overlay";
        }>,
      );
      if (callableByHandle.has(entry.handle)) {
        return refusal(
          "canonical_handle_collision",
          `catalog handle ${entry.handle} names callable and non-callable declarations`,
        );
      }
      const prior = declarationByHandle.get(entry.handle);
      if (prior !== undefined && prior.entryDigest !== entry.entryDigest) {
        return refusal(
          "canonical_handle_collision",
          `catalog handle ${entry.handle} names unequal declarations`,
        );
      }
      declarationByHandle.set(entry.handle, prior ?? entry);
    }
  }

  const entries = [...callableByHandle.values()].sort((left, right) =>
    compareUnicodeCodeUnits(left.handle, right.handle)
  );
  const declarationEntries = [...declarationByHandle.values()].sort(
    (left, right) => compareUnicodeCodeUnits(left.handle, right.handle),
  );
  const publicationDigests = orderedUniqueStrings(
    [...publicationByModule.entries()].map(([moduleRef, digest]) =>
      `${moduleRef}\u0000${digest}`
    ),
  ).map((row) => row.slice(row.indexOf("\u0000") + 1) as Sha256Digest);
  const basisDigest = sha256Canonical({
    publicationDigests,
    entries: entries.map((entry) => entry.entryDigest),
    declarationEntries: declarationEntries.map((entry) => entry.entryDigest),
  });
  return deepFreeze({
    kind: "graph_function_catalog" as const,
    schemaVersion: "5.0.0" as const,
    basisDigest,
    publicationDigests,
    entries,
    byHandle: frozenIndex(entries),
    declarationEntries,
    declarationsByHandle: frozenIndex(declarationEntries),
  }) as GraphFunctionCatalog;
}

export function refreshGraphFunctionCatalog(
  exactPublications: readonly Readonly<ModulePublication>[],
): GraphFunctionCatalogResult {
  return buildGraphFunctionCatalog(exactPublications);
}

export function lookupGraphFunction(
  catalog: GraphFunctionCatalog | GraphFunctionCatalogView,
  handle: string,
): GraphFunctionCatalogEntry | null {
  return Object.hasOwn(catalog.byHandle, handle)
    ? catalog.byHandle[handle] ?? null
    : null;
}

export function lookupGraphFunctionDefinition(
  catalog: GraphFunctionCatalog | GraphFunctionCatalogView,
  definitionRef: string,
  programRef: string,
): GraphFunctionDefinitionLookupResult {
  const matches = catalog.entries.filter(
    (entry) =>
      entry.definitionRef === definitionRef &&
      entry.programMembershipRefs.includes(programRef),
  );
  if (matches.length === 0) {
    return deepFreeze({
      kind: "graph_function_definition_lookup_absent" as const,
      definitionRef,
      programRef,
    });
  }
  if (matches.length === 1) {
    return deepFreeze({
      kind: "graph_function_definition_lookup_exact" as const,
      definitionRef,
      programRef,
      entry: matches[0]!,
    });
  }
  return deepFreeze({
    kind: "graph_function_definition_lookup_ambiguous" as const,
    definitionRef,
    programRef,
    entries: matches,
  });
}

export function narrowGraphFunctionCatalog(
  catalog: GraphFunctionCatalog,
  allowlist: readonly string[],
): GraphFunctionCatalogViewResult {
  if (new Set(allowlist).size !== allowlist.length) {
    return refusal(
      "duplicate_allowlist_entry",
      "catalog allowlist cannot contain duplicate handles",
    );
  }
  const orderedAllowlist = [...allowlist].sort(compareUnicodeCodeUnits);
  const unknown = orderedAllowlist.find((handle) =>
    !Object.hasOwn(catalog.byHandle, handle) &&
    !Object.hasOwn(catalog.declarationsByHandle, handle)
  );
  if (unknown !== undefined) {
    return refusal(
      "unknown_allowlist_entry",
      `unknown catalog allowlist handle ${unknown}`,
    );
  }
  const entries = orderedAllowlist.flatMap((handle) => {
    const entry = catalog.byHandle[handle];
    return entry === undefined ? [] : [entry];
  });
  const declarationEntries = orderedAllowlist.flatMap((handle) => {
    const entry = catalog.declarationsByHandle[handle];
    return entry === undefined ? [] : [entry];
  });
  const body = {
    catalogBasisDigest: catalog.basisDigest,
    allowlist: orderedAllowlist,
    entries: entries.map((entry) => entry.entryDigest),
    declarationEntries: declarationEntries.map((entry) => entry.entryDigest),
  };
  return deepFreeze({
    kind: "graph_function_catalog_view" as const,
    catalogBasisDigest: catalog.basisDigest,
    allowlist: orderedAllowlist,
    entries,
    byHandle: frozenIndex(entries),
    declarationEntries,
    declarationsByHandle: frozenIndex(declarationEntries),
    viewDigest: sha256Canonical(body as unknown as JsonValue),
  }) as GraphFunctionCatalogView;
}

export function applyCatalogDeclaration(
  view: GraphFunctionCatalogView,
  input: DeclarationApplicationInput,
): DeclarationApplicationResult {
  const declaration = view.declarationsByHandle[input.handle];
  if (declaration === undefined) {
    return deepFreeze({
      kind: "declaration_application_refusal" as const,
      code: "outside_view" as const,
      message: `declaration ${input.handle} is absent from the catalog view`,
    });
  }
  if (declaration.declarationKind !== input.applicationKind) {
    return deepFreeze({
      kind: "declaration_application_refusal" as const,
      code: "kind_mismatch" as const,
      message: `declaration ${input.handle} is not ${input.applicationKind}`,
    });
  }
  const body = {
    catalogBasisDigest: view.catalogBasisDigest,
    viewDigest: view.viewDigest,
    declarationDigest: declaration.entryDigest,
    targetRef: input.targetRef,
    targetDigest: input.targetDigest,
    appliedValueRef: input.appliedValueRef,
    appliedValueDigest: input.appliedValueDigest,
  };
  const applicationDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "declaration_application" as const,
    catalogBasisDigest: view.catalogBasisDigest,
    viewDigest: view.viewDigest,
    declaration,
    targetRef: input.targetRef,
    targetDigest: input.targetDigest,
    appliedValueRef: input.appliedValueRef,
    appliedValueDigest: input.appliedValueDigest,
    applicationRef:
      `catalog-application://abiogenesis/${applicationDigest.slice("sha256:".length)}`,
    applicationDigest,
  }) as DeclarationApplication;
}

export function graphFunctionCatalogCanonicalSnapshot(
  catalog: GraphFunctionCatalog,
): string {
  return canonicalJson({
    kind: catalog.kind,
    schemaVersion: catalog.schemaVersion,
    basisDigest: catalog.basisDigest,
    publicationDigests: catalog.publicationDigests,
    entries: catalog.entries,
    declarationEntries: catalog.declarationEntries,
  } as unknown as JsonValue);
}
