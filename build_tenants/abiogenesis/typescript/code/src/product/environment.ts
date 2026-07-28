import { isAbsolute } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type {
  ProductContributionManifest,
  ProductDeclaredDependency,
  ProductInstallCandidate,
  ProductPublicContract,
  VerifiedProductArtifact,
} from "./contracts.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import {
  isProductContributionManifest,
  parseProductPublicContract,
} from "./verify_product.js";

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
  readonly workspaceId: string;
  readonly canonicalRoot: string;
  readonly authorityMode: "trusted_developer";
  readonly authorizedActorRef: string;
  readonly authorityManifestRef: string;
  readonly authorityManifestDigest: Sha256Digest;
}

export interface WorkspaceAuthorityBasis extends WorkspaceAuthorityBasisInput {
  readonly kind: "workspace_authority_basis";
  readonly schemaVersion: "5.0.0";
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
      : { nativeTypedLocator: { ...contract.nativeTypedLocator } }),
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
      if (targets.length !== 1) {
        return refusal(
          "invalid_dependency",
          `declared dependency ${dependency.productId} must resolve exactly once`,
        );
      }
      const target = targets[0]!;
      if (
        target.packageVersion !== dependency.packageVersion ||
        !target.compatibilityRefs.includes(dependency.compatibilityRef) ||
        dependency.requiredContractRefs.some(
          (contractRef) => !target.publicContractRefs.includes(contractRef),
        ) ||
        dependency.requiredCapabilityRefs.some(
          (capabilityRef) =>
            !target.publicCapabilityRefs.includes(capabilityRef),
        )
      ) {
        return refusal(
          "invalid_dependency",
          `declared dependency ${dependency.productId} is incompatible or incomplete`,
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
      (artifact) =>
        artifact.kind !== "verified_product_artifact" ||
        artifact.disposition !== "verified",
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
      "invalid_dependency",
      "a resolved lock cannot contain ambiguous Product identities",
    );
  }
  const dependencyEdges = deriveDeclaredDependencyEdges(rows);
  if (!Array.isArray(dependencyEdges)) return dependencyEdges;
  const productIdSet = new Set(productIds);
  if (hasProductDependencyCycle(productIdSet, dependencyEdges)) {
    return refusal("invalid_dependency", "resolved Product dependencies must be acyclic");
  }
  const lockDigest = sha256Canonical({
    rows,
    dependencyEdges,
  } as unknown as JsonValue);
  return {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId: identity("product-lock://abiogenesis", lockDigest),
    lockDigest,
    rows,
    dependencyEdges,
  };
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
      "rows",
      "schemaVersion",
    ]) ||
    value.kind !== "resolved_product_lock" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
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
          )].sort().join("\0"),
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
  } as unknown as JsonValue);
  return value.lockDigest === expectedDigest &&
    value.lockId === identity("product-lock://abiogenesis", expectedDigest);
}

export function verifiedArtifactMatchesResolvedLock(
  artifact: VerifiedProductArtifact,
  lock: ResolvedProductLock,
): boolean {
  if (!isResolvedProductLock(lock)) return false;
  const matches = lock.rows.filter((row) => row.productId === artifact.productId);
  return matches.length === 1 &&
    canonicalJson(matches[0] as unknown as JsonValue) ===
      canonicalJson(lockRowFor(artifact) as unknown as JsonValue);
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
  if (
    input.workspaceId.length === 0 ||
    !isAbsolute(input.canonicalRoot) ||
    input.authorizedActorRef.length === 0 ||
    input.authorityManifestRef.length === 0
  ) {
    return refusal("invalid_workspace_authority", "workspace authority fields must be explicit");
  }
  const authorityBasisDigest = sha256Canonical(input as unknown as JsonValue);
  return {
    kind: "workspace_authority_basis",
    schemaVersion: "5.0.0",
    ...input,
    authorityBasisId: identity("workspace-authority://abiogenesis", authorityBasisDigest),
    authorityBasisDigest,
  };
}

export function constructWorkspaceBinding(
  authority: WorkspaceAuthorityBasis,
  productSet: ProductSet,
  lock: ResolvedProductLock,
  roots: WorkspaceDeclaredRoots,
): EnvironmentRefusal | WorkspaceBindingCandidate {
  if (
    Object.values(roots).some((root) => !isAbsolute(root))
  ) {
    return refusal("invalid_declared_root", "every workspace root must be an explicit absolute path");
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
