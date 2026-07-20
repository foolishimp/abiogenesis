import { isAbsolute } from "node:path";

import { canonicalJson, type JsonValue } from "./canonical_json.js";
import type { ProductInstallCandidate } from "./contracts.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";

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
  readonly installId: string;
}

export interface ResolvedProductLock {
  readonly kind: "resolved_product_lock";
  readonly schemaVersion: "5.0.0";
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly rows: readonly ResolvedProductLockRow[];
  readonly dependencyEdges: readonly [];
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
  readonly authorityBasisId: string;
  readonly authorityBasisDigest: Sha256Digest;
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

function lockRowsFor(installs: readonly ProductInstall[]): readonly ResolvedProductLockRow[] {
  return installs.map((install) => ({
    productId: install.productId,
    packageName: install.packageName,
    packageVersion: install.packageVersion,
    artifactDigest: install.artifactDigest,
    productContentDigest: install.productContentDigest,
    manifestDigest: install.manifestDigest,
    installId: install.installId,
  }));
}

export function constructResolvedProductLock(
  installs: readonly ProductInstall[],
): EnvironmentRefusal | ResolvedProductLock {
  if (installs.length === 0) {
    return refusal("empty_product_set", "a resolved lock requires at least one admitted install");
  }
  if (installs.some((install) => install.kind !== "product_install" || install.disposition !== "admitted")) {
    return refusal("lock_mismatch", "a resolved lock accepts admitted ProductInstall values only");
  }
  const installIds = installs.map((install) => install.installId);
  if (new Set(installIds).size !== installIds.length) {
    return refusal("duplicate_install", "a resolved lock cannot contain duplicate install identities");
  }
  const rows = lockRowsFor(installs);
  const lockDigest = sha256Canonical({ rows, dependencyEdges: [] } as unknown as JsonValue);
  return {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId: identity("product-lock://abiogenesis", lockDigest),
    lockDigest,
    rows,
    dependencyEdges: [],
  };
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
  if (canonicalJson(lockRowsFor(installs) as unknown as JsonValue) !== canonicalJson(lock.rows as unknown as JsonValue)) {
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

export function constructWorkspaceAuthorityBasis(
  input: WorkspaceAuthorityBasisInput,
): EnvironmentRefusal | WorkspaceAuthorityBasis {
  if (
    input.workspaceId.length === 0 ||
    !isAbsolute(input.canonicalRoot) ||
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
    authorityBasisId: authority.authorityBasisId,
    authorityBasisDigest: authority.authorityBasisDigest,
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
