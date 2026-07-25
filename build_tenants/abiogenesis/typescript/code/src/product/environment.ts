import { isAbsolute } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type { ProductInstallCandidate } from "./contracts.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";

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

export interface ProductDependencyEdge {
  readonly kind: "requires";
  readonly fromProductId: string;
  readonly toProductId: string;
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
  return typeof value === "string" && value.length > 0;
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
  dependencyEdges: readonly ProductDependencyEdge[] = [],
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
  const productIds = new Set(rows.map((row) => row.productId));
  const edgeKeys = dependencyEdges.map(
    (edge) => `${edge.fromProductId}\0${edge.toProductId}`,
  );
  if (
    dependencyEdges.some(
      (edge) =>
        edge.kind !== "requires" ||
        edge.fromProductId === edge.toProductId ||
        !productIds.has(edge.fromProductId) ||
        !productIds.has(edge.toProductId),
    ) ||
    new Set(edgeKeys).size !== edgeKeys.length
  ) {
    return refusal(
      "invalid_dependency",
      "dependency edges must be unique, non-reflexive, and bind Products in the exact lock",
    );
  }
  const outgoing = new Map<string, string[]>();
  for (const edge of dependencyEdges) {
    const targets = outgoing.get(edge.fromProductId) ?? [];
    targets.push(edge.toProductId);
    outgoing.set(edge.fromProductId, targets);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (productId: string): boolean => {
    if (visiting.has(productId)) return true;
    if (visited.has(productId)) return false;
    visiting.add(productId);
    if ((outgoing.get(productId) ?? []).some(hasCycle)) return true;
    visiting.delete(productId);
    visited.add(productId);
    return false;
  };
  if ([...productIds].some(hasCycle)) {
    return refusal("invalid_dependency", "resolved Product dependencies must be acyclic");
  }
  const orderedEdges = [...dependencyEdges].sort((left, right) => {
    const leftKey = `${left.fromProductId}\0${left.toProductId}`;
    const rightKey = `${right.fromProductId}\0${right.toProductId}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
  const lockDigest = sha256Canonical({
    rows,
    dependencyEdges: orderedEdges,
  } as unknown as JsonValue);
  return {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId: identity("product-lock://abiogenesis", lockDigest),
    lockDigest,
    rows,
    dependencyEdges: orderedEdges,
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
          "installId",
          "manifestDigest",
          "packageName",
          "packageVersion",
          "productContentDigest",
          "productId",
        ]) ||
        !nonEmptyString(row.productId) ||
        !nonEmptyString(row.packageName) ||
        !nonEmptyString(row.packageVersion) ||
        !isSha256Digest(row.artifactDigest) ||
        !isSha256Digest(row.productContentDigest) ||
        !isSha256Digest(row.manifestDigest) ||
        !nonEmptyString(row.installId),
    )
  ) {
    return false;
  }
  const productIds = rows.map((row) => row.productId as string);
  const installIds = rows.map((row) => row.installId as string);
  if (new Set(installIds).size !== installIds.length) {
    return false;
  }
  const productIdSet = new Set(productIds);
  const edges = value.dependencyEdges;
  if (
    edges.some(
      (edge) =>
        !isRecord(edge) ||
        !hasExactKeys(edge, [
          "fromProductId",
          "kind",
          "toProductId",
        ]) ||
        edge.kind !== "requires" ||
        !nonEmptyString(edge.fromProductId) ||
        !nonEmptyString(edge.toProductId) ||
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
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    const fromProductId = edge.fromProductId as string;
    const targets = outgoing.get(fromProductId) ?? [];
    targets.push(edge.toProductId as string);
    outgoing.set(fromProductId, targets);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (productId: string): boolean => {
    if (visiting.has(productId)) return true;
    if (visited.has(productId)) return false;
    visiting.add(productId);
    if ((outgoing.get(productId) ?? []).some(hasCycle)) return true;
    visiting.delete(productId);
    visited.add(productId);
    return false;
  };
  if ([...productIdSet].some(hasCycle)) return false;
  const expectedDigest = sha256Canonical({
    rows,
    dependencyEdges: edges,
  } as unknown as JsonValue);
  return value.lockDigest === expectedDigest &&
    value.lockId === identity("product-lock://abiogenesis", expectedDigest);
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
    value.orderedInstallRefs.join("\0") !==
      lock.rows.map((row) => row.installId).join("\0")
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
