import { isAbsolute } from "node:path";

import {
  reconstructWorkspaceManifest,
  type WorkspaceManifest,
} from "./workspace_operations.js";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  capabilityDefinitionGraphAssetBytes,
  capabilityRefsForContract,
  constructCapabilityDefinitionGraph,
  isCapabilityDefinitionGraph,
  type CapabilityDefinitionGraph,
} from "../shared/capability_contracts.js";
import type {
  ProductContributionManifest,
  ProductDeclaredDependency,
  ProductInstallCandidate,
  ProductPublicContract,
  VerifiedProductArtifact,
} from "./contracts.js";
import { ABI5_PRODUCT_ID } from "./contracts.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  isVerifiedProductArtifact,
  isProductContributionManifest,
  nativeDeclarationEvidenceForVerifiedArtifact,
  parseProductPublicContract,
} from "./verify_product.js";
import {
  linkNativeContractSet,
  type NativeLinkProduct,
} from "./declaration_exports.js";

export interface ProductInstall extends Omit<ProductInstallCandidate, "kind" | "disposition"> {
  readonly kind: "product_install";
  readonly disposition: "admitted";
  readonly admissionEventRef: string;
}

export interface ResolvedProductLockRow {
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly descriptorRef: string;
  readonly publisherNamespace: string;
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly capabilityDefinitionGraph: CapabilityDefinitionGraph;
  readonly capabilityDefinitionGraphAsset: import("./contracts.js").ProductAssetLocator;
  readonly contributionManifestRef: string;
  readonly contributionManifestDigest: Sha256Digest;
  readonly contributionManifest: ProductContributionManifest;
  readonly compatibilityRefs: readonly string[];
  readonly declaredDependencies: readonly ProductDeclaredDependency[];
  readonly provenanceRef: string;
  readonly declaredCapabilityRefs: readonly string[];
  readonly publicContracts: readonly ProductPublicContract[];
  readonly publicContractRefs: readonly string[];
  readonly publicCapabilityRefs: readonly string[];
}

export interface ProductDependencyEdge {
  readonly kind: "requires";
  readonly fromProductId: string;
  readonly toProductId: string;
  readonly packageVersion: string;
  readonly compatibilityRef: string;
  readonly compatibilityDisposition: "compatible";
  readonly requiredContractRefs: readonly string[];
  readonly requiredCapabilityRefs: readonly string[];
}

export interface ResolvedProductLock {
  readonly kind: "resolved_product_lock";
  readonly schemaVersion: "5.0.0";
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly nativeContractClosureDigest: Sha256Digest;
  readonly rows: readonly ResolvedProductLockRow[];
  readonly dependencyEdges: readonly ProductDependencyEdge[];
}

export interface ProductSet {
  readonly kind: "product_set";
  readonly schemaVersion: "5.0.0";
  readonly productSetId: string;
  readonly productSetDigest: Sha256Digest;
  readonly orderedInstallRefs: readonly string[];
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
}

export interface WorkspaceAuthorityBasisInput {
  /** S2 target authority derives only from this actor-bearing manifest. */
  readonly workspaceManifest?: WorkspaceManifest;
  /** Legacy transport-shaped fields remain type-only compatibility input. */
  readonly workspaceId?: string;
  readonly canonicalRoot?: string;
  readonly authorityMode?: "trusted_developer";
  readonly authorizedActorRef?: string;
  readonly authorityManifestRef?: string;
  readonly authorityManifestDigest?: Sha256Digest;
}

export interface WorkspaceAuthorityBasis {
  readonly kind: "workspace_authority_basis";
  readonly schemaVersion: "5.0.0";
  readonly workspaceId: string;
  readonly canonicalRoot: string;
  readonly authorityMode: "trusted_developer";
  readonly authorizedActorRef: string;
  readonly actorAttributionRef: string;
  readonly actorAttributionDigest: Sha256Digest;
  readonly authorityManifestRef: string;
  readonly authorityManifestDigest: Sha256Digest;
  readonly authorityBasisId: string;
  readonly authorityBasisDigest: Sha256Digest;
}

export interface WorkspaceDeclaredRoots {
  readonly toolchainRoot: string;
  readonly productRoot: string;
  readonly eventLogRoot: string;
  readonly runtimeStateRoot: string;
  readonly projectionRoot: string;
  readonly archiveRoot: string;
}

export interface WorkspaceBindingCandidate {
  readonly kind: "workspace_binding_candidate";
  readonly schemaVersion: "5.0.0";
  readonly bindingId: string;
  readonly bindingDigest: Sha256Digest;
  readonly workspaceId: string;
  readonly authorityBasisId: string;
  readonly authorityBasisDigest: Sha256Digest;
  readonly authorizedActorRef: string;
  readonly productSetId: string;
  readonly productSetDigest: Sha256Digest;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly roots: WorkspaceDeclaredRoots;
}

export interface WorkspaceBinding extends Omit<WorkspaceBindingCandidate, "kind"> {
  readonly kind: "workspace_binding";
  readonly admissionEventRef: string;
}

export const ENVIRONMENT_REFUSAL_CODES = [
  "empty_product_set",
  "invalid_dependency",
  "unresolved_dependency",
  "incompatible_dependency",
  "ambiguous_dependency",
  "cyclic_dependency",
  "duplicate_install",
  "lock_mismatch",
  "invalid_workspace_authority",
  "invalid_declared_root",
] as const;

export type EnvironmentRefusalCode = (typeof ENVIRONMENT_REFUSAL_CODES)[number];

export interface EnvironmentRefusal {
  readonly kind: "environment_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: EnvironmentRefusalCode;
  readonly message: string;
}

function refusal(code: EnvironmentRefusalCode, message: string): EnvironmentRefusal {
  return {
    kind: "environment_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUniqueStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) &&
    value.every(nonEmptyString) &&
    new Set(value).size === value.length;
}

function isDeclaredDependency(value: unknown): value is ProductDeclaredDependency {
  return isRecord(value) &&
    hasExactKeys(value, [
      "compatibilityRef",
      "kind",
      "packageVersion",
      "productId",
      "requiredCapabilityRefs",
      "requiredContractRefs",
    ]) &&
    value.kind === "requires" &&
    nonEmptyString(value.productId) &&
    nonEmptyString(value.packageVersion) &&
    nonEmptyString(value.compatibilityRef) &&
    isUniqueStringArray(value.requiredContractRefs) &&
    isUniqueStringArray(value.requiredCapabilityRefs);
}

function copyDependency(
  dependency: ProductDeclaredDependency,
): ProductDeclaredDependency {
  return {
    ...dependency,
    requiredContractRefs: [...dependency.requiredContractRefs],
    requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
  };
}

function copyContributionManifest(
  manifest: ProductContributionManifest,
): ProductContributionManifest {
  return {
    ...manifest,
    publicationBindings: manifest.publicationBindings.map((binding) => ({
      ...binding,
    })),
    rows: manifest.rows.map((row) => ({
      ...row,
      programMembershipRefs: [...row.programMembershipRefs],
      compatibilityRefs: [...row.compatibilityRefs],
      readinessPrerequisiteRefs: [...row.readinessPrerequisiteRefs],
    })),
  };
}

function copyPublicContract(
  contract: ProductPublicContract,
): ProductPublicContract {
  return {
    ...contract,
    requirementAuthorityRefs: [...contract.requirementAuthorityRefs],
    capabilityIdentities: [...contract.capabilityIdentities],
    ...(contract.nativeTypedLocator === undefined
      ? {}
      : {
        nativeTypedLocator: {
          ...contract.nativeTypedLocator,
          declarationInventory:
            contract.nativeTypedLocator.declarationInventory.map((entry) => ({
              ...entry,
            })),
        },
      }),
    ...(contract.assetLocator === undefined
      ? {}
      : { assetLocator: { ...contract.assetLocator } }),
  };
}

function lockRowFor(
  artifact: VerifiedProductArtifact | ProductInstall,
): ResolvedProductLockRow {
  return {
    productId: artifact.productId,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    manifestDigest: artifact.manifestDigest,
    descriptorRef: artifact.descriptorRef,
    publisherNamespace: artifact.publisherNamespace,
    catalogId: artifact.catalogId,
    catalogDigest: artifact.catalogDigest,
    capabilityDefinitionGraph: artifact.capabilityDefinitionGraph,
    capabilityDefinitionGraphAsset: { ...artifact.capabilityDefinitionGraphAsset },
    contributionManifestRef: artifact.contributionManifestRef,
    contributionManifestDigest: artifact.contributionManifestDigest,
    contributionManifest: copyContributionManifest(
      artifact.contributionManifest,
    ),
    compatibilityRefs: [...artifact.compatibilityRefs],
    declaredDependencies: artifact.declaredDependencies.map(copyDependency),
    provenanceRef: artifact.provenanceRef,
    declaredCapabilityRefs: [...artifact.declaredCapabilityRefs],
    publicContracts: artifact.publicContracts.map(copyPublicContract),
    publicContractRefs: [...artifact.publicContractRefs],
    publicCapabilityRefs: [...artifact.publicCapabilityRefs],
  };
}

function lockRowsFor(
  artifacts: readonly VerifiedProductArtifact[],
): readonly ResolvedProductLockRow[] {
  return artifacts.map(lockRowFor);
}

function deriveDeclaredDependencyEdges(
  rows: readonly ResolvedProductLockRow[],
): EnvironmentRefusal | ProductDependencyEdge[] {
  const edges: ProductDependencyEdge[] = [];
  for (const source of rows) {
    if (
      source.declaredDependencies.some(
        (dependency) => !isDeclaredDependency(dependency),
      ) ||
      new Set(
        source.declaredDependencies.map((dependency) => dependency.productId),
      ).size !== source.declaredDependencies.length
    ) {
      return refusal(
        "invalid_dependency",
        "Product descriptors must carry unique, well-formed dependencies",
      );
    }
    for (const dependency of source.declaredDependencies) {
      const targets = rows.filter(
        (candidate) => candidate.productId === dependency.productId,
      );
      if (targets.length === 0) {
        return refusal(
          "unresolved_dependency",
          `declared dependency ${dependency.productId} is unresolved`,
        );
      }
      if (targets.length > 1) {
        return refusal(
          "ambiguous_dependency",
          `declared dependency ${dependency.productId} is ambiguous`,
        );
      }
      const target = targets[0]!;
      if (
        target.packageVersion !== dependency.packageVersion ||
        !target.compatibilityRefs.includes(dependency.compatibilityRef)
      ) {
        return refusal(
          "incompatible_dependency",
          `declared dependency ${dependency.productId} is incompatible`,
        );
      }
      if (
        dependency.requiredContractRefs.some(
          (contractRef) => !target.publicContractRefs.includes(contractRef),
        ) ||
        dependency.requiredCapabilityRefs.some(
          (capabilityRef) =>
            !target.publicCapabilityRefs.includes(capabilityRef),
        )
      ) {
        return refusal(
          "unresolved_dependency",
          `declared dependency ${dependency.productId} lacks a required public contract or capability`,
        );
      }
      edges.push({
        kind: "requires",
        fromProductId: source.productId,
        toProductId: target.productId,
        packageVersion: dependency.packageVersion,
        compatibilityRef: dependency.compatibilityRef,
        compatibilityDisposition: "compatible",
        requiredContractRefs: [...dependency.requiredContractRefs],
        requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
      });
    }
  }
  return edges.sort((left, right) => {
    const leftKey = `${left.fromProductId}\0${left.toProductId}`;
    const rightKey = `${right.fromProductId}\0${right.toProductId}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
}

function hasProductDependencyCycle(
  productIds: ReadonlySet<string>,
  dependencyEdges: readonly Readonly<{
    fromProductId: string;
    toProductId: string;
  }>[],
): boolean {
  const outgoing = new Map<string, string[]>();
  for (const edge of dependencyEdges) {
    const targets = outgoing.get(edge.fromProductId) ?? [];
    targets.push(edge.toProductId);
    outgoing.set(edge.fromProductId, targets);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (productId: string): boolean => {
    if (visiting.has(productId)) return true;
    if (visited.has(productId)) return false;
    visiting.add(productId);
    if ((outgoing.get(productId) ?? []).some(visit)) return true;
    visiting.delete(productId);
    visited.add(productId);
    return false;
  };
  return [...productIds].some(visit);
}

export function constructResolvedProductLock(
  artifacts: readonly VerifiedProductArtifact[],
): EnvironmentRefusal | ResolvedProductLock {
  if (artifacts.length === 0) {
    return refusal(
      "empty_product_set",
      "a resolved lock requires at least one verified Product artifact",
    );
  }
  if (
    artifacts.some(
      (artifact) => !isVerifiedProductArtifact(artifact),
    )
  ) {
    return refusal(
      "lock_mismatch",
      "a resolved lock accepts verified Product artifacts only",
    );
  }
  const artifactDigests = artifacts.map((artifact) => artifact.artifactDigest);
  if (new Set(artifactDigests).size !== artifactDigests.length) {
    return refusal(
      "duplicate_install",
      "a resolved lock cannot contain duplicate artifact identities",
    );
  }
  const rows = lockRowsFor(artifacts);
  const productIds = rows.map((row) => row.productId);
  if (new Set(productIds).size !== productIds.length) {
    return refusal(
      "ambiguous_dependency",
      "a resolved lock cannot contain ambiguous Product identities",
    );
  }
  const dependencyEdges = deriveDeclaredDependencyEdges(rows);
  if (!Array.isArray(dependencyEdges)) return dependencyEdges;
  const productIdSet = new Set(productIds);
  if (hasProductDependencyCycle(productIdSet, dependencyEdges)) {
    return refusal(
      "cyclic_dependency",
      "resolved Product dependencies must be acyclic",
    );
  }
  const toolchainArtifacts = artifacts.filter(
    (artifact) => artifact.productId === ABI5_PRODUCT_ID,
  );
  if (toolchainArtifacts.length !== 1) {
    return refusal(
      toolchainArtifacts.length === 0
        ? "unresolved_dependency"
        : "ambiguous_dependency",
      "resolved native meaning requires one exact ABIogenesis toolchain Product",
    );
  }
  const linkProducts: NativeLinkProduct[] = [];
  for (const artifact of artifacts) {
    const evidence = nativeDeclarationEvidenceForVerifiedArtifact(artifact);
    if (evidence === null) {
      return refusal(
        "lock_mismatch",
        `verified native declaration evidence is absent for ${artifact.productId}`,
      );
    }
    linkProducts.push({
      productId: artifact.productId,
      productContentDigest: artifact.productContentDigest,
      packageName: artifact.packageName,
      declaredDependencies: artifact.declaredDependencies,
      publicContracts: artifact.publicContracts,
      evidence,
    });
  }
  const linked = linkNativeContractSet(
    linkProducts,
    toolchainArtifacts[0]!.productContentDigest,
  );
  if (linked.kind === "refused") {
    return refusal(linked.code, linked.message);
  }
  const nativeContractClosureDigest = linked.nativeContractClosureDigest;
  const lockDigest = sha256Canonical({
    rows,
    dependencyEdges,
    nativeContractClosureDigest,
  } as unknown as JsonValue);
  const lock: ResolvedProductLock = deepFreeze({
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId: identity("product-lock://abiogenesis", lockDigest),
    lockDigest,
    nativeContractClosureDigest,
    rows,
    dependencyEdges,
  });
  return lock;
}

export function isResolvedProductLock(
  value: unknown,
): value is ResolvedProductLock {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "dependencyEdges",
      "kind",
      "lockDigest",
      "lockId",
      "nativeContractClosureDigest",
      "rows",
      "schemaVersion",
    ]) ||
    value.kind !== "resolved_product_lock" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
    !isSha256Digest(value.nativeContractClosureDigest) ||
    !Array.isArray(value.rows) ||
    value.rows.length === 0 ||
    !Array.isArray(value.dependencyEdges)
  ) {
    return false;
  }
  const rows = value.rows;
  if (
    rows.some(
      (row) =>
        !isRecord(row) ||
        !hasExactKeys(row, [
          "artifactDigest",
          "catalogDigest",
          "catalogId",
          "capabilityDefinitionGraph",
          "capabilityDefinitionGraphAsset",
          "compatibilityRefs",
          "contributionManifest",
          "contributionManifestDigest",
          "contributionManifestRef",
          "declaredCapabilityRefs",
          "declaredDependencies",
          "descriptorRef",
          "manifestDigest",
          "packageName",
          "packageVersion",
          "provenanceRef",
          "productContentDigest",
          "productId",
          "publicCapabilityRefs",
          "publicContracts",
          "publicContractRefs",
          "publisherNamespace",
        ]) ||
        !nonEmptyString(row.productId) ||
        !nonEmptyString(row.packageName) ||
        !nonEmptyString(row.packageVersion) ||
        !isSha256Digest(row.artifactDigest) ||
        !isSha256Digest(row.productContentDigest) ||
        !isSha256Digest(row.manifestDigest) ||
        !nonEmptyString(row.descriptorRef) ||
        !nonEmptyString(row.publisherNamespace) ||
        !nonEmptyString(row.catalogId) ||
        !isSha256Digest(row.catalogDigest) ||
        !isCapabilityDefinitionGraph(row.capabilityDefinitionGraph) ||
        !isRecord(row.capabilityDefinitionGraphAsset) ||
        !nonEmptyString(row.capabilityDefinitionGraphAsset.path) ||
        !nonEmptyString(row.capabilityDefinitionGraphAsset.mediaType) ||
        row.capabilityDefinitionGraphAsset.schemaVersion !== "5.0.0" ||
        !isSha256Digest(row.capabilityDefinitionGraphAsset.contentDigest) ||
        !nonEmptyString(row.contributionManifestRef) ||
        !isSha256Digest(row.contributionManifestDigest) ||
        !isProductContributionManifest(row.contributionManifest) ||
        sha256Canonical(row.contributionManifest as unknown as JsonValue) !==
          row.contributionManifestDigest ||
        row.contributionManifest.contributionManifestRef !==
          row.contributionManifestRef ||
        row.contributionManifest.productId !== row.productId ||
        row.contributionManifest.productVersion !== row.packageVersion ||
        row.contributionManifest.descriptorRef !== row.descriptorRef ||
        row.contributionManifest.productContentDigest !==
          row.productContentDigest ||
        row.contributionManifest.publicContractCatalogId !== row.catalogId ||
        row.contributionManifest.publicContractCatalogDigest !==
          row.catalogDigest ||
        canonicalJson(
          row.contributionManifest.capabilityDefinitionGraph as unknown as JsonValue,
        ) !== canonicalJson({
          graphId: row.capabilityDefinitionGraph.graphId,
          graphVersion: row.capabilityDefinitionGraph.graphVersion,
          graphDigest: row.capabilityDefinitionGraph.graphDigest,
        } as unknown as JsonValue) ||
        row.capabilityDefinitionGraphAsset.path !==
          "contracts/capabilities/capability-definition-graph.json" ||
        row.capabilityDefinitionGraphAsset.mediaType !== "application/json" ||
        row.capabilityDefinitionGraphAsset.contentDigest !== sha256Bytes(
          capabilityDefinitionGraphAssetBytes(row.capabilityDefinitionGraph),
        ) ||
        !isUniqueStringArray(row.compatibilityRefs) ||
        !Array.isArray(row.declaredDependencies) ||
        !row.declaredDependencies.every(isDeclaredDependency) ||
        !nonEmptyString(row.provenanceRef) ||
        !isUniqueStringArray(row.declaredCapabilityRefs) ||
        !Array.isArray(row.publicContracts) ||
        !row.publicContracts.every(
          (contract) =>
            parseProductPublicContract(contract, row.productId as string) !==
            null,
        ) ||
        !isUniqueStringArray(row.publicContractRefs) ||
        !isUniqueStringArray(row.publicCapabilityRefs) ||
        row.publicContractRefs.join("\0") !==
          (row.publicContracts as readonly ProductPublicContract[])
            .map((contract) => contract.contractId)
            .sort()
            .join("\0") ||
        row.publicCapabilityRefs.join("\0") !==
          [...new Set(
            (row.publicContracts as readonly ProductPublicContract[])
              .flatMap((contract) => contract.capabilityIdentities),
          )].sort().join("\0") ||
        row.declaredCapabilityRefs.join("\0") !==
          row.capabilityDefinitionGraph.rows
            .map(({ capabilityId }) => capabilityId)
            .join("\0") ||
        (row.publicContracts as readonly ProductPublicContract[]).some(
          (contract) =>
            contract.capabilityIdentities.join("\0") !==
              capabilityRefsForContract(contract.contractId).join("\0"),
        ) ||
        !lockRowGraphMatchesCatalog(
          row as unknown as ResolvedProductLockRow,
        ),
    )
  ) {
    return false;
  }
  const productIds = rows.map((row) => row.productId as string);
  if (new Set(productIds).size !== productIds.length) {
    return false;
  }
  const productIdSet = new Set(productIds);
  const edges = value.dependencyEdges;
  if (
    edges.some(
      (edge) =>
        !isRecord(edge) ||
        !hasExactKeys(edge, [
          "compatibilityRef",
          "compatibilityDisposition",
          "fromProductId",
          "kind",
          "packageVersion",
          "requiredCapabilityRefs",
          "requiredContractRefs",
          "toProductId",
        ]) ||
        edge.kind !== "requires" ||
        !nonEmptyString(edge.fromProductId) ||
        !nonEmptyString(edge.toProductId) ||
        !nonEmptyString(edge.packageVersion) ||
        !nonEmptyString(edge.compatibilityRef) ||
        edge.compatibilityDisposition !== "compatible" ||
        !isUniqueStringArray(edge.requiredContractRefs) ||
        !isUniqueStringArray(edge.requiredCapabilityRefs) ||
        edge.fromProductId === edge.toProductId ||
        !productIdSet.has(edge.fromProductId) ||
        !productIdSet.has(edge.toProductId),
    )
  ) {
    return false;
  }
  const edgeKeys = edges.map(
    (edge) =>
      `${(edge as Readonly<Record<string, unknown>>).fromProductId}\0${(edge as Readonly<Record<string, unknown>>).toProductId}`,
  );
  if (
    new Set(edgeKeys).size !== edgeKeys.length ||
    [...edgeKeys].sort().join("\0") !== edgeKeys.join("\0")
  ) {
    return false;
  }
  const expectedEdges = deriveDeclaredDependencyEdges(
    rows as unknown as readonly ResolvedProductLockRow[],
  );
  if (
    !Array.isArray(expectedEdges) ||
    canonicalJson(expectedEdges as unknown as JsonValue) !==
      canonicalJson(edges as unknown as JsonValue)
  ) {
    return false;
  }
  if (
    hasProductDependencyCycle(
      productIdSet,
      edges as readonly ProductDependencyEdge[],
    )
  ) {
    return false;
  }
  const expectedDigest = sha256Canonical({
    rows,
    dependencyEdges: edges,
    nativeContractClosureDigest: value.nativeContractClosureDigest,
  } as unknown as JsonValue);
  return value.lockDigest === expectedDigest &&
    value.lockId === identity("product-lock://abiogenesis", expectedDigest);
}

function lockRowGraphMatchesCatalog(row: ResolvedProductLockRow): boolean {
  try {
    const contractCatalog = {
      productId: row.productId,
      productContentDigest: row.productContentDigest,
      catalogId: row.catalogId,
      catalogVersion: "5.0.0" as const,
      catalogDigest: row.catalogDigest,
    };
    const flatCoordinates = row.publicContracts.map((contract) => ({
        contractCatalog,
        flatRow: {
          contractId: contract.contractId,
          contractVersion: contract.contractVersion,
          contractDigest: contract.contractDigest,
        },
        nestedSelector: {
          selectorKind: "flat_contract" as const,
          definitionKey: null,
          slot: null,
          definitionRef: null,
        },
      }));
    const nestedCoordinates = [...new Map(
      row.capabilityDefinitionGraph.rows
        .flatMap(({ owningPublicContracts }) => owningPublicContracts)
        .filter(({ nestedSelector }) =>
          nestedSelector.selectorKind === "operation_definition_slot"
        )
        .map((coordinate) => [
          canonicalJson(coordinate as unknown as JsonValue),
          coordinate,
        ]),
    ).values()];
    const expected = constructCapabilityDefinitionGraph([
      ...flatCoordinates,
      ...nestedCoordinates,
    ]);
    return canonicalJson(expected as unknown as JsonValue) ===
      canonicalJson(row.capabilityDefinitionGraph as unknown as JsonValue);
  } catch {
    return false;
  }
}

export function verifiedArtifactMatchesResolvedLock(
  artifact: VerifiedProductArtifact,
  lock: ResolvedProductLock,
): boolean {
  if (!isVerifiedProductArtifact(artifact) || !isResolvedProductLock(lock)) {
    return false;
  }
  const matches = lock.rows.filter((row) => row.productId === artifact.productId);
  return matches.length === 1 &&
    canonicalJson(matches[0] as unknown as JsonValue) ===
      canonicalJson(lockRowFor(artifact) as unknown as JsonValue);
}

export function isProductInstallCandidate(
  value: unknown,
  lock: ResolvedProductLock,
): value is ProductInstallCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "artifactDigest",
      "catalogDigest",
      "catalogId",
      "capabilityDefinitionGraph",
      "capabilityDefinitionGraphAsset",
      "compatibilityRefs",
      "contributionManifest",
      "contributionManifestDigest",
      "contributionManifestRef",
      "declaredCapabilityRefs",
      "declaredDependencies",
      "descriptorRef",
      "disposition",
      "installId",
      "installedRoot",
      "kind",
      "manifestDigest",
      "packageName",
      "packageVersion",
      "productContentDigest",
      "productId",
      "provenanceRef",
      "publicCapabilityRefs",
      "publicContractRefs",
      "publicContracts",
      "publisherNamespace",
      "resolvedLockDigest",
      "resolvedLockId",
      "schemaVersion",
    ]) ||
    value.kind !== "product_install_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "materialized" ||
    !nonEmptyString(value.installId) ||
    !nonEmptyString(value.installedRoot) ||
    !isAbsolute(value.installedRoot) ||
    !isResolvedProductLock(lock) ||
    value.resolvedLockId !== lock.lockId ||
    value.resolvedLockDigest !== lock.lockDigest
  ) {
    return false;
  }
  const rows = lock.rows.filter((row) => row.productId === value.productId);
  if (rows.length !== 1) return false;
  const candidate = value as unknown as ProductInstallCandidate;
  const expectedInstallId =
    `product-install://${candidate.packageName}/${candidate.packageVersion}/${candidate.productContentDigest.slice("sha256:".length)}/${lock.lockDigest.slice("sha256:".length)}`;
  return candidate.installId === expectedInstallId &&
    canonicalJson(
      lockRowFor(candidate as unknown as ProductInstall) as unknown as JsonValue,
    ) === canonicalJson(rows[0] as unknown as JsonValue);
}

function productInstallCandidateProjection(
  install: ProductInstall,
): ProductInstallCandidate {
  const {
    admissionEventRef: _admissionEventRef,
    kind: _kind,
    disposition: _disposition,
    ...body
  } = install;
  return {
    ...body,
    kind: "product_install_candidate",
    disposition: "materialized",
  };
}

/** Structural carrier guard only; ABG admission/currentness is not inferred. */
export function isProductInstall(
  value: unknown,
  lock: ResolvedProductLock,
): value is ProductInstall {
  if (
    !isRecord(value) ||
    value.kind !== "product_install" ||
    value.disposition !== "admitted" ||
    !nonEmptyString(value.admissionEventRef)
  ) {
    return false;
  }
  return isProductInstallCandidate(
    productInstallCandidateProjection(value as unknown as ProductInstall),
    lock,
  );
}

export function productInstallCoordinate(
  install: ProductInstall,
): ReferenceDigest<"InstalledProduct"> {
  const candidate = productInstallCandidateProjection(install);
  return deepFreeze({
    ref: install.installId,
    digest: sha256Canonical(candidate as unknown as JsonValue),
  });
}

export function constructProductSet(
  installs: readonly ProductInstall[],
  lock: ResolvedProductLock,
): EnvironmentRefusal | ProductSet {
  if (installs.length === 0) {
    return refusal("empty_product_set", "a ProductSet requires at least one admitted install");
  }
  const orderedInstallRefs = installs.map((install) => install.installId);
  if (new Set(orderedInstallRefs).size !== orderedInstallRefs.length) {
    return refusal("duplicate_install", "a ProductSet cannot contain duplicate install identities");
  }
  if (
    installs.some(
      (install) =>
        install.resolvedLockId !== lock.lockId ||
        install.resolvedLockDigest !== lock.lockDigest,
    ) ||
    canonicalJson(
      installs.map(lockRowFor) as unknown as JsonValue,
    ) !== canonicalJson(lock.rows as unknown as JsonValue)
  ) {
    return refusal("lock_mismatch", "ProductSet installs and resolved lock rows disagree");
  }
  const productSetDigest = sha256Canonical({
    orderedInstallRefs,
    lockId: lock.lockId,
    lockDigest: lock.lockDigest,
  });
  return {
    kind: "product_set",
    schemaVersion: "5.0.0",
    productSetId: identity("product-set://abiogenesis", productSetDigest),
    productSetDigest,
    orderedInstallRefs,
    lockId: lock.lockId,
    lockDigest: lock.lockDigest,
  };
}

export function isProductSet(
  value: unknown,
  lock: ResolvedProductLock,
): value is ProductSet {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "lockDigest",
      "lockId",
      "orderedInstallRefs",
      "productSetDigest",
      "productSetId",
      "schemaVersion",
    ]) ||
    value.kind !== "product_set" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.productSetId) ||
    !isSha256Digest(value.productSetDigest) ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
    !Array.isArray(value.orderedInstallRefs) ||
    value.orderedInstallRefs.length === 0 ||
    value.orderedInstallRefs.some((entry) => !nonEmptyString(entry)) ||
    new Set(value.orderedInstallRefs).size !== value.orderedInstallRefs.length ||
    !isResolvedProductLock(lock) ||
    value.lockId !== lock.lockId ||
    value.lockDigest !== lock.lockDigest ||
    value.orderedInstallRefs.length !== lock.rows.length
  ) {
    return false;
  }
  const expectedDigest = sha256Canonical({
    orderedInstallRefs: value.orderedInstallRefs,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
  } as unknown as JsonValue);
  return value.productSetDigest === expectedDigest &&
    value.productSetId ===
      identity("product-set://abiogenesis", expectedDigest);
}

export function constructWorkspaceAuthorityBasis(
  input: WorkspaceAuthorityBasisInput,
): EnvironmentRefusal | WorkspaceAuthorityBasis {
  const manifest = input.workspaceManifest === undefined
    ? null
    : reconstructWorkspaceManifest(input.workspaceManifest);
  if (manifest === null || manifest.actor === null || manifest.actorAttribution === null) {
    return refusal(
      "invalid_workspace_authority",
      "target workspace authority requires one exact actor-bearing clean workspace manifest",
    );
  }
  const authorityManifest = {
    workspaceId: manifest.workspaceRef,
    canonicalRoot: manifest.canonicalRoot,
    authorityMode: "trusted_developer" as const,
    authorizedActorRef: manifest.actor.ref,
    actorAttributionRef: manifest.actorAttribution.ref,
    actorAttributionDigest: manifest.actorAttribution.digest,
    authorityManifestRef: manifest.workspaceRef,
    authorityManifestDigest: manifest.workspaceDigest,
  };
  if (
    !isAbsolute(manifest.canonicalRoot) ||
    manifest.actor.ref.length === 0 ||
    !isSha256Digest(manifest.actorAttribution.digest)
  ) {
    return refusal("invalid_workspace_authority", "workspace authority fields must be explicit");
  }
  const authorityBasisDigest = sha256Canonical(authorityManifest as unknown as JsonValue);
  return {
    kind: "workspace_authority_basis",
    schemaVersion: "5.0.0",
    ...authorityManifest,
    authorityBasisId: identity("workspace-authority://abiogenesis", authorityBasisDigest),
    authorityBasisDigest,
  };
}

export function isWorkspaceAuthorityBasis(
  value: unknown,
): value is WorkspaceAuthorityBasis {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "authorityBasisDigest",
      "authorityBasisId",
      "authorityManifestDigest",
      "authorityManifestRef",
      "actorAttributionDigest",
      "actorAttributionRef",
      "authorityMode",
      "authorizedActorRef",
      "canonicalRoot",
      "kind",
      "schemaVersion",
      "workspaceId",
    ]) ||
    value.kind !== "workspace_authority_basis" ||
    value.schemaVersion !== "5.0.0" ||
    value.authorityMode !== "trusted_developer" ||
    !nonEmptyString(value.workspaceId) ||
    !nonEmptyString(value.canonicalRoot) ||
    !isAbsolute(value.canonicalRoot) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.actorAttributionRef) ||
    !isSha256Digest(value.actorAttributionDigest) ||
    !nonEmptyString(value.authorityManifestRef) ||
    !isSha256Digest(value.authorityManifestDigest) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest)
  ) return false;
  const body = {
    workspaceId: value.workspaceId as string,
    canonicalRoot: value.canonicalRoot as string,
    authorityMode: value.authorityMode,
    authorizedActorRef: value.authorizedActorRef as string,
    actorAttributionRef: value.actorAttributionRef as string,
    actorAttributionDigest: value.actorAttributionDigest as Sha256Digest,
    authorityManifestRef: value.authorityManifestRef as string,
    authorityManifestDigest: value.authorityManifestDigest as Sha256Digest,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.authorityBasisDigest === digest &&
    value.authorityBasisId === identity("workspace-authority://abiogenesis", digest);
}

export function constructWorkspaceBinding(
  authority: WorkspaceAuthorityBasis,
  productSet: ProductSet,
  lock: ResolvedProductLock,
  roots: WorkspaceDeclaredRoots,
): EnvironmentRefusal | WorkspaceBindingCandidate {
  if (
    !isWorkspaceAuthorityBasis(authority) ||
    !isProductSet(productSet, lock) ||
    !isRecord(roots) ||
    !hasExactKeys(roots, [
      "archiveRoot",
      "eventLogRoot",
      "productRoot",
      "projectionRoot",
      "runtimeStateRoot",
      "toolchainRoot",
    ]) ||
    Object.values(roots).some(
      (root) => typeof root !== "string" || !isAbsolute(root),
    )
  ) {
    return refusal(
      "invalid_declared_root",
      "workspace authority, ProductSet, and every declared root must be exact",
    );
  }
  if (productSet.lockId !== lock.lockId || productSet.lockDigest !== lock.lockDigest) {
    return refusal("lock_mismatch", "workspace ProductSet and lock disagree");
  }
  const bindingBody = {
    workspaceId: authority.workspaceId,
    authorityBasisId: authority.authorityBasisId,
    authorityBasisDigest: authority.authorityBasisDigest,
    authorizedActorRef: authority.authorizedActorRef,
    productSetId: productSet.productSetId,
    productSetDigest: productSet.productSetDigest,
    lockId: lock.lockId,
    lockDigest: lock.lockDigest,
    roots,
  };
  const bindingDigest = sha256Canonical(bindingBody as unknown as JsonValue);
  return {
    kind: "workspace_binding_candidate",
    schemaVersion: "5.0.0",
    bindingId: identity("workspace-binding://abiogenesis", bindingDigest),
    bindingDigest,
    ...bindingBody,
  };
}

export function isWorkspaceBindingCandidate(
  value: unknown,
  lock: ResolvedProductLock,
  productSet?: ProductSet,
  authority?: WorkspaceAuthorityBasis,
): value is WorkspaceBindingCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "authorityBasisDigest",
      "authorityBasisId",
      "authorizedActorRef",
      "bindingDigest",
      "bindingId",
      "kind",
      "lockDigest",
      "lockId",
      "productSetDigest",
      "productSetId",
      "roots",
      "schemaVersion",
      "workspaceId",
    ]) ||
    value.kind !== "workspace_binding_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.bindingId) ||
    !isSha256Digest(value.bindingDigest) ||
    !nonEmptyString(value.workspaceId) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.productSetId) ||
    !isSha256Digest(value.productSetDigest) ||
    !isResolvedProductLock(lock) ||
    value.lockId !== lock.lockId ||
    value.lockDigest !== lock.lockDigest ||
    !isRecord(value.roots) ||
    !hasExactKeys(value.roots, [
      "archiveRoot",
      "eventLogRoot",
      "productRoot",
      "projectionRoot",
      "runtimeStateRoot",
      "toolchainRoot",
    ]) ||
    Object.values(value.roots).some(
      (root) => !nonEmptyString(root) || !isAbsolute(root),
    ) ||
    (
      productSet !== undefined &&
      (
        !isProductSet(productSet, lock) ||
        value.productSetId !== productSet.productSetId ||
        value.productSetDigest !== productSet.productSetDigest
      )
    ) ||
    (
      authority !== undefined &&
      (
        !isWorkspaceAuthorityBasis(authority) ||
        value.workspaceId !== authority.workspaceId ||
        value.authorityBasisId !== authority.authorityBasisId ||
        value.authorityBasisDigest !== authority.authorityBasisDigest ||
        value.authorizedActorRef !== authority.authorizedActorRef
      )
    )
  ) {
    return false;
  }
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  if (
    value.bindingDigest !== digest ||
    value.bindingId !== identity("workspace-binding://abiogenesis", digest)
  ) return false;
  if (authority === undefined || productSet === undefined) return true;
  const reconstructed = constructWorkspaceBinding(
    authority,
    productSet,
    lock,
    value.roots as unknown as WorkspaceDeclaredRoots,
  );
  return reconstructed.kind === "workspace_binding_candidate" &&
    canonicalJson(reconstructed as unknown as JsonValue) ===
      canonicalJson(value as JsonValue);
}
