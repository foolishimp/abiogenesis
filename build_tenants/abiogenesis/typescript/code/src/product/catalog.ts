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
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import type { ProductInstall, ResolvedProductLock, WorkspaceBindingCandidate } from "./environment.js";
import { constructProductSet, isResolvedProductLock, isWorkspaceBindingCandidateInResolvedLock } from "./environment.js";
import type { ProductInstallCandidate, VerifiedProductArtifact } from "./contracts.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { isVerifiedProductArtifact } from "./verify_product.js";
import { canonicalEquals } from "../shared/value/index.js";

export type GraphFunctionCatalogEntry = {
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
};

export type DeclarationCatalogEntry = {
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
};

export type GraphFunctionCatalog = {
  readonly kind: "graph_function_catalog";
  readonly schemaVersion: "5.0.0";
  readonly basisDigest: Sha256Digest;
  readonly publicationDigests: readonly Sha256Digest[];
  readonly entries: readonly GraphFunctionCatalogEntry[];
  readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
  readonly declarationEntries: readonly DeclarationCatalogEntry[];
  readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
};

export type CatalogReadinessBasis = {
  readonly workspaceBinding: WorkspaceBindingCandidate;
  readonly resolvedLock: ResolvedProductLock;
  readonly verifiedProducts: readonly VerifiedProductArtifact[];
  readonly installedProducts: readonly ProductInstallCandidate[];
  readonly publications: readonly Readonly<ModulePublication>[];
};

export type CatalogReadinessRowDisposition = {
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
};

export type ReadyGraphFunctionCatalog = GraphFunctionCatalog & {
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
};

export type GraphFunctionCatalogView = {
  readonly kind: "graph_function_catalog_view";
  readonly catalogBasisDigest: Sha256Digest;
  readonly allowlist: readonly string[];
  readonly entries: readonly GraphFunctionCatalogEntry[];
  readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
  readonly declarationEntries: readonly DeclarationCatalogEntry[];
  readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
  readonly viewDigest: Sha256Digest;
};

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

export type DeclarationApplication = {
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
};

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
    definitionDigest: sha256Canonical(definition),
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
    entryDigest: sha256Canonical(body),
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
    entryDigest: sha256Canonical(body),
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
  };
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

const readyCatalogs = new WeakMap<object, ReadyGraphFunctionCatalog>();
const ownedCatalogs = new WeakSet<object>();
const canonicalPublications = new WeakMap<object, Readonly<ModulePublication>>();
const catalogViews = new WeakMap<object, Readonly<{
  allowlist: string;
  view: GraphFunctionCatalogView;
}>>();
// §10.11 X5: the views this owner constructed over an admitted ready Catalog,
// deeply frozen at construction.
const admittedCatalogViews = new WeakSet<object>();

/**
 * @internal §10.11 X4/X5 owner fact: the exact ready Catalog this owner
 * admitted and established deeply frozen. Membership is read first, so no
 * code of any other value runs.
 */
export function isAdmittedReadyGraphFunctionCatalog(value: unknown): value is ReadyGraphFunctionCatalog {
  return typeof value === "object" && value !== null && ownedCatalogs.has(value) &&
    readyCatalogs.get((value as ReadyGraphFunctionCatalog).readinessBasis) === value;
}

/** @internal §10.11 X4/X5 owner fact: a view this owner constructed over an
 * admitted ready Catalog and established deeply frozen. */
export function isAdmittedGraphFunctionCatalogView(value: unknown): value is GraphFunctionCatalogView {
  return typeof value === "object" && value !== null && admittedCatalogViews.has(value);
}

function canonicalPublication(publication: Readonly<ModulePublication>): Readonly<ModulePublication> {
  const retained = canonicalPublications.get(publication);
  if (retained !== undefined) return retained;
  const canonical = canonicalizeAuthoredGtlCarrier(publication, "module_publication");
  canonicalPublications.set(canonical, canonical);
  if (isDeeplyFrozen(publication)) canonicalPublications.set(publication, canonical);
  return canonical;
}

/** Observation-only §10.11 counts: full Catalog admissions on a
 * `readyCatalogs` miss and view constructions on a view miss. They select,
 * cache and change nothing, and `product/index` does not export them. */
const catalogWork = { fullAdmissions: 0, viewConstructions: 0 };

/** @internal A frozen snapshot of the observation-only counts. */
export function observeCatalogWork(): Readonly<typeof catalogWork> {
  return Object.freeze({ ...catalogWork });
}

export function admitGraphFunctionCatalog(
  basis: CatalogReadinessBasis,
): ReadyGraphFunctionCatalogResult {
  const retained = readyCatalogs.get(basis);
  if (retained !== undefined) return retained;
  catalogWork.fullAdmissions++;
  const canonicalBasis: CatalogReadinessBasis = {
    workspaceBinding: basis.workspaceBinding,
    resolvedLock: basis.resolvedLock,
    verifiedProducts: [...basis.verifiedProducts].sort((left, right) =>
      compareUnicodeCodeUnits(left.productId, right.productId)),
    // ProductSet order belongs to the selected lock, not catalog row ordering.
    installedProducts: [...basis.installedProducts],
    publications: basis.publications
      .map(canonicalPublication)
      .sort((left, right) =>
        compareUnicodeCodeUnits(
          modulePublicationSemanticDigest(left),
          modulePublicationSemanticDigest(right),
        )),
  };
  const { workspaceBinding, resolvedLock, verifiedProducts, installedProducts, publications } = canonicalBasis;
  if (
    !isResolvedProductLock(resolvedLock) ||
    !isWorkspaceBindingCandidateInResolvedLock(workspaceBinding, resolvedLock)
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
      return rows.length !== 1 || !canonicalEquals(
        lockComparableProduct(verified),
        rows[0] ?? null,
      );
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
        !canonicalEquals(
          lockComparableProduct(install),
          lockComparableProduct(verified[0]!),
        );
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
      rowDigest: sha256Canonical(rowBody),
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
        new Set(collisions.map((candidate) => canonicalJson(candidate.contribution))).size > 1
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
        !canonicalEquals(
          orderedStrings(
            declared.programMembershipRefs,
          ),
          contribution.programMembershipRefs,
        ) ||
        !canonicalEquals(
          contribution.provenanceRefs,
          orderedStrings([
            lockRow.artifactDigest,
            lockRow.manifestDigest,
          ]),
        )
      ) {
        pushDisposition(publication, contribution, "rejected", "manifest_or_provenance_mismatch");
        continue;
      }
      if (
        !canonicalEquals(
          orderedStrings(
            declared.compatibilityRefs,
          ),
          contribution.compatibilityRefs,
        ) ||
        declared.compatibilityRefs.some((ref) => !lockRow.compatibilityRefs.includes(ref))
      ) {
        pushDisposition(publication, contribution, "incompatible", "compatibility_mismatch");
        continue;
      }
      if (
        !canonicalEquals(
          orderedStrings(
            declared.readinessPrerequisiteRefs,
          ),
          contribution.readinessPrerequisiteRefs,
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
  const readinessBasisDigest = sha256Canonical(canonicalBasis);
  const ready = deepFreeze({
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
  if (isDeeplyFrozen(ready)) {
    readyCatalogs.set(canonicalBasis, ready);
    if (isDeeplyFrozen(basis)) readyCatalogs.set(basis, ready);
    ownedCatalogs.add(ready);
  }
  return ready;
}

export function buildGraphFunctionCatalog(
  exactPublications: readonly Readonly<ModulePublication>[],
): GraphFunctionCatalogResult {
  const publications = exactPublications.map((authoredPublication) => {
    const publication = canonicalPublication(authoredPublication);
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
  const catalog = deepFreeze({
    kind: "graph_function_catalog" as const,
    schemaVersion: "5.0.0" as const,
    basisDigest,
    publicationDigests,
    entries,
    byHandle: frozenIndex(entries),
    declarationEntries,
    declarationsByHandle: frozenIndex(declarationEntries),
  }) as GraphFunctionCatalog;
  ownedCatalogs.add(catalog);
  return catalog;
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
  const allowlistKey = canonicalJson(orderedAllowlist);
  const retained = ownedCatalogs.has(catalog) ? catalogViews.get(catalog) : undefined;
  if (retained?.allowlist === allowlistKey) return retained.view;
  catalogWork.viewConstructions++;
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
  const view = deepFreeze({
    kind: "graph_function_catalog_view" as const,
    catalogBasisDigest: catalog.basisDigest,
    allowlist: orderedAllowlist,
    entries,
    byHandle: frozenIndex(entries),
    declarationEntries,
    declarationsByHandle: frozenIndex(declarationEntries),
    viewDigest: sha256Canonical(body),
  }) as GraphFunctionCatalogView;
  if (ownedCatalogs.has(catalog)) catalogViews.set(catalog, { allowlist: allowlistKey, view });
  if (isAdmittedReadyGraphFunctionCatalog(catalog) && isDeeplyFrozen(view)) admittedCatalogViews.add(view);
  return view;
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
  });
}
