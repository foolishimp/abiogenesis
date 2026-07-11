// Implements: REQ-P-CATALOG-010 through REQ-P-CATALOG-013
// Implements: REQ-P-POLICY-050

import {
  satisfies,
  valid,
  validRange
} from "semver";

import { digest } from "../public_sdk/admission_primitives.js";
import {
  admitCatalogProductDescriptor,
  admitResolvedProductLock
} from "../public_sdk/carrier_admission.js";
import { digestCanonicalIJson } from "../public_sdk/canonical.js";
import { admitCatalogResolveRequest } from "../public_sdk/operation_admission.js";
import type {
  CatalogProductDescriptor,
  CatalogResolveRefusal,
  CatalogResolveRequest,
  CatalogResolveResult,
  ProductCompatibilityResult,
  ProductIntakeContext,
  ProductRequirement,
  ResolvedDependencyEdge,
  ResolvedProductLock,
  ResolvedProductSelection,
  Sha256Digest
} from "../public_sdk/carriers.js";
import { accepted, refused } from "./outcomes.js";

const ABG_PRODUCT_ID = "abiogenesis";
const ABG_PACKAGE_NAME = "@abiogenesis/typescript-tenant";

type ResolveFailureCode = CatalogResolveRefusal["code"];

class ResolveFailure extends Error {
  public readonly code: ResolveFailureCode;
  public readonly residualRefs: readonly string[];

  public constructor(
    code: ResolveFailureCode,
    message: string,
    residualRefs: readonly string[] = []
  ) {
    super(message);
    this.name = "ResolveFailure";
    this.code = code;
    this.residualRefs = Object.freeze([...residualRefs]);
  }
}

function canonicalVersion(input: string): boolean {
  return valid(input) === input;
}

function admittedRange(input: string): boolean {
  return validRange(input) !== null;
}

export function descriptorDigestBasis(
  descriptor: CatalogProductDescriptor
): Omit<CatalogProductDescriptor, "descriptorDigest"> {
  const { descriptorDigest, ...basis } = descriptor;
  void descriptorDigest;
  return basis;
}

export function descriptorDigest(
  descriptor: CatalogProductDescriptor
): Sha256Digest {
  return digest(
    digestCanonicalIJson(descriptorDigestBasis(descriptor)),
    "CatalogProductDescriptor.descriptorDigest"
  );
}

function requirementMatches(
  descriptor: CatalogProductDescriptor,
  requirement: ProductRequirement
): boolean {
  return (
    descriptor.productId === requirement.productId &&
    satisfies(descriptor.version, requirement.versionConstraint) &&
    requirement.requiredContractRefs.every((ref) =>
      descriptor.contractRefs.includes(ref)
    ) &&
    requirement.requiredCapabilityRefs.every((ref) =>
      descriptor.capabilityRefs.includes(ref)
    )
  );
}

function compareProductIdentity(
  left: { readonly productId: string; readonly version: string },
  right: { readonly productId: string; readonly version: string }
): number {
  if (left.productId === ABG_PRODUCT_ID && right.productId !== ABG_PRODUCT_ID) {
    return -1;
  }
  if (right.productId === ABG_PRODUCT_ID && left.productId !== ABG_PRODUCT_ID) {
    return 1;
  }
  const productOrder = compareCanonicalStrings(left.productId, right.productId);
  return productOrder === 0
    ? compareCanonicalStrings(left.version, right.version)
    : productOrder;
}

export function compareCanonicalStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareEdges(
  left: ResolvedDependencyEdge,
  right: ResolvedDependencyEdge
): number {
  const sourceOrder = compareCanonicalStrings(
    left.sourceProductId,
    right.sourceProductId
  );
  if (sourceOrder !== 0) {
    return sourceOrder;
  }
  const targetOrder = compareCanonicalStrings(
    left.targetProductId,
    right.targetProductId
  );
  return targetOrder === 0
    ? compareCanonicalStrings(
        digestCanonicalIJson(left.requirement),
        digestCanonicalIJson(right.requirement)
      )
    : targetOrder;
}

function selectedAbg(
  descriptors: readonly CatalogProductDescriptor[]
): CatalogProductDescriptor | null {
  const selected = descriptors.filter(
    (descriptor) => descriptor.productId === ABG_PRODUCT_ID
  );
  if (selected.length !== 1) {
    return null;
  }
  return selected[0] ?? null;
}

function assertCandidateWellFormed(descriptor: CatalogProductDescriptor): void {
  admitCatalogProductDescriptor(descriptor);
  if (
    (descriptor.productId === ABG_PRODUCT_ID) !==
    (descriptor.packageName === ABG_PACKAGE_NAME)
  ) {
    throw new ResolveFailure(
      "malformed_candidate",
      `candidate ${descriptor.descriptorId} has an incoherent ABIogenesis product/package identity`,
      [descriptor.descriptorId, descriptor.productId, descriptor.packageName]
    );
  }
  if (!canonicalVersion(descriptor.version)) {
    throw new ResolveFailure(
      "malformed_candidate",
      `candidate ${descriptor.descriptorId} has a non-canonical SemVer version`,
      [descriptor.descriptorId]
    );
  }
  if (!admittedRange(descriptor.abgCompatibility)) {
    throw new ResolveFailure(
      "malformed_candidate",
      `candidate ${descriptor.descriptorId} has an invalid ABG compatibility range`,
      [descriptor.descriptorId]
    );
  }
  const dependencyIds = new Set(
    descriptor.dependencies.map((dependency) => dependency.productId)
  );
  if (dependencyIds.size !== descriptor.dependencies.length) {
    throw new ResolveFailure(
      "malformed_candidate",
      `candidate ${descriptor.descriptorId} declares duplicate product dependencies`,
      [descriptor.descriptorId]
    );
  }
  for (const dependency of descriptor.dependencies) {
    if (!admittedRange(dependency.versionConstraint)) {
      throw new ResolveFailure(
        "malformed_candidate",
        `candidate ${descriptor.descriptorId} has an invalid dependency range for ${dependency.productId}`,
        [descriptor.descriptorId, dependency.productId]
      );
    }
  }
  if (descriptor.descriptorDigest !== descriptorDigest(descriptor)) {
    throw new ResolveFailure(
      "malformed_candidate",
      `candidate ${descriptor.descriptorId} has a descriptor digest mismatch`,
      [descriptor.descriptorId]
    );
  }
}

function selectionFromDescriptor(
  descriptor: CatalogProductDescriptor
): ResolvedProductSelection {
  return Object.freeze({
    publisher: descriptor.publisher,
    productId: descriptor.productId,
    version: descriptor.version,
    descriptorId: descriptor.descriptorId,
    descriptorDigest: descriptor.descriptorDigest,
    contributionId: descriptor.contributionManifestId,
    contributionDigest: descriptor.contributionManifestDigest,
    artifactDigest: descriptor.distributionArtifactDigest,
    productContentDigest: descriptor.productContentDigest
  });
}

function lockDigestBasis(
  lock: ResolvedProductLock
): Omit<ResolvedProductLock, "lockDigest"> {
  const { lockDigest, ...basis } = lock;
  void lockDigest;
  return basis;
}

interface ResolvedProductLockIdentityBasis {
  readonly requirements: readonly ProductRequirement[];
  readonly products: readonly ResolvedProductSelection[];
  readonly dependencyEdges: readonly ResolvedDependencyEdge[];
  readonly compatibility: readonly ProductCompatibilityResult[];
}

function lockIdentityBasis(
  lock: ResolvedProductLockIdentityBasis
): ResolvedProductLockIdentityBasis {
  return Object.freeze({
    requirements: lock.requirements,
    products: lock.products,
    dependencyEdges: lock.dependencyEdges,
    compatibility: lock.compatibility
  });
}

export function resolvedProductLockId(
  lock: ResolvedProductLockIdentityBasis
): string {
  const identityDigest = digest(
    digestCanonicalIJson(lockIdentityBasis(lock)),
    "ResolvedProductLock identity"
  );
  return `lock:${identityDigest.slice("sha256:".length)}`;
}

export function resolvedProductLockDigest(
  lock: ResolvedProductLock
): Sha256Digest {
  return digest(
    digestCanonicalIJson(lockDigestBasis(lock)),
    "ResolvedProductLock.lockDigest"
  );
}

export function assertResolvedProductLockCoherence(
  input: ResolvedProductLock
): ResolvedProductLock {
  const lock = admitResolvedProductLock(input);
  if (lock.lockDigest !== resolvedProductLockDigest(lock)) {
    throw new TypeError("ResolvedProductLock.lockDigest: digest mismatch");
  }
  if (lock.lockId !== resolvedProductLockId(lock)) {
    throw new TypeError("ResolvedProductLock.lockId: identity mismatch");
  }
  const productIds = new Set(lock.products.map((product) => product.productId));
  const requirementIds = new Set(
    lock.requirements.map((requirement) => requirement.productId)
  );
  if (requirementIds.size !== lock.requirements.length) {
    throw new TypeError("ResolvedProductLock.requirements: duplicate product identity");
  }
  const canonicalRequirements = [...lock.requirements].sort((left, right) =>
    compareCanonicalStrings(left.productId, right.productId)
  );
  const canonicalProducts = [...lock.products].sort(compareProductIdentity);
  const canonicalEdges = [...lock.dependencyEdges].sort(compareEdges);
  const canonicalCompatibility = [...lock.compatibility].sort((left, right) =>
    compareCanonicalStrings(left.productId, right.productId)
  );
  if (
    digestCanonicalIJson(lock.requirements) !==
      digestCanonicalIJson(canonicalRequirements) ||
    digestCanonicalIJson(lock.products) !== digestCanonicalIJson(canonicalProducts) ||
    digestCanonicalIJson(lock.dependencyEdges) !==
      digestCanonicalIJson(canonicalEdges) ||
    digestCanonicalIJson(lock.compatibility) !==
      digestCanonicalIJson(canonicalCompatibility)
  ) {
    throw new TypeError("ResolvedProductLock: members are not in canonical order");
  }
  const edgeIdentities = new Set(
    lock.dependencyEdges.map((edge) => digestCanonicalIJson(edge))
  );
  if (edgeIdentities.size !== lock.dependencyEdges.length) {
    throw new TypeError("ResolvedProductLock.dependencyEdges: duplicate edge");
  }
  for (const edge of lock.dependencyEdges) {
    if (
      !productIds.has(edge.sourceProductId) ||
      !productIds.has(edge.targetProductId) ||
      edge.requirement.productId !== edge.targetProductId
    ) {
      throw new TypeError("ResolvedProductLock.dependencyEdges: incomplete product reference");
    }
    const target = lock.products.find(
      (product) => product.productId === edge.targetProductId
    );
    if (
      target === undefined ||
      !satisfies(target.version, edge.requirement.versionConstraint)
    ) {
      throw new TypeError("ResolvedProductLock.dependencyEdges: target version mismatch");
    }
  }
  for (const requirement of lock.requirements) {
    const target = lock.products.find(
      (product) => product.productId === requirement.productId
    );
    if (target === undefined || !satisfies(target.version, requirement.versionConstraint)) {
      throw new TypeError("ResolvedProductLock.requirements: unresolved root requirement");
    }
  }
  const outgoing = new Map<string, readonly string[]>();
  for (const productId of productIds) {
    outgoing.set(
      productId,
      lock.dependencyEdges
        .filter((edge) => edge.sourceProductId === productId)
        .map((edge) => edge.targetProductId)
    );
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (productId: string): void => {
    if (visiting.has(productId)) {
      throw new TypeError("ResolvedProductLock.dependencyEdges: dependency cycle");
    }
    if (visited.has(productId)) {
      return;
    }
    visiting.add(productId);
    for (const target of outgoing.get(productId) ?? []) {
      visit(target);
    }
    visiting.delete(productId);
    visited.add(productId);
  };
  for (const productId of productIds) {
    visit(productId);
  }
  const compatibilityIds = new Set(
    lock.compatibility.map((row) => row.productId)
  );
  if (
    lock.compatibility.length !== lock.products.length ||
    compatibilityIds.size !== productIds.size ||
    lock.compatibility.some(
      (row) => !productIds.has(row.productId) || !row.compatible
    ) ||
    [...productIds].some((productId) => !compatibilityIds.has(productId))
  ) {
    throw new TypeError("ResolvedProductLock.compatibility: incomplete or incompatible selection");
  }
  return lock;
}

function constructResolvedProductLock(input: {
  readonly requirements: readonly ProductRequirement[];
  readonly descriptors: readonly CatalogProductDescriptor[];
  readonly edges: readonly ResolvedDependencyEdge[];
  readonly compatibility: readonly ProductCompatibilityResult[];
}): ResolvedProductLock {
  const requirements = Object.freeze(
    [...input.requirements].sort((left, right) =>
      compareCanonicalStrings(left.productId, right.productId)
    )
  );
  const products = Object.freeze(
    input.descriptors.map(selectionFromDescriptor).sort(compareProductIdentity)
  );
  const dependencyEdges = Object.freeze([...input.edges].sort(compareEdges));
  const compatibility = Object.freeze(
    [...input.compatibility].sort((left, right) =>
      compareCanonicalStrings(left.productId, right.productId)
    )
  );
  const identityBasis: ResolvedProductLockIdentityBasis = Object.freeze({
    requirements,
    products,
    dependencyEdges,
    compatibility
  });
  const withoutDigest: Omit<ResolvedProductLock, "lockDigest"> = Object.freeze({
    kind: "resolved_product_lock",
    schemaVersion: 1,
    lockId: resolvedProductLockId(identityBasis),
    requirements,
    products,
    dependencyEdges,
    compatibility
  });
  const lock: ResolvedProductLock = Object.freeze({
    ...withoutDigest,
    lockDigest: digest(
      digestCanonicalIJson(withoutDigest),
      "ResolvedProductLock.lockDigest"
    )
  });
  return assertResolvedProductLockCoherence(lock);
}

function resolveExactSet(
  request: CatalogResolveRequest
): ResolvedProductLock {
  for (const requirement of request.requirements) {
    if (!admittedRange(requirement.versionConstraint)) {
      throw new ResolveFailure(
        "malformed_candidate",
        `requirement for ${requirement.productId} has an invalid SemVer constraint`,
        [requirement.productId]
      );
    }
  }
  for (const descriptor of request.candidateDescriptors) {
    assertCandidateWellFormed(descriptor);
  }

  const candidatesByProduct = new Map<string, CatalogProductDescriptor[]>();
  for (const descriptor of request.candidateDescriptors) {
    const candidates = candidatesByProduct.get(descriptor.productId) ?? [];
    candidates.push(descriptor);
    candidatesByProduct.set(descriptor.productId, candidates);
  }

  const selected = new Map<string, CatalogProductDescriptor>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const edges: ResolvedDependencyEdge[] = [];

  const selectRequirement = (
    requirement: ProductRequirement,
    sourceProductId: string | null
  ): CatalogProductDescriptor => {
    const existing = selected.get(requirement.productId);
    if (existing !== undefined) {
      if (!requirementMatches(existing, requirement)) {
        throw new ResolveFailure(
          "incompatible",
          `selected ${existing.productId}@${existing.version} does not satisfy every declared constraint`,
          [existing.descriptorId, requirement.productId]
        );
      }
      return existing;
    }
    const candidates = candidatesByProduct.get(requirement.productId) ?? [];
    const matches = candidates.filter((candidate) =>
      requirementMatches(candidate, requirement)
    );
    if (matches.length === 0) {
      throw new ResolveFailure(
        candidates.length === 0 ? "unresolved" : "incompatible",
        `no supplied candidate uniquely satisfies ${requirement.productId}@${requirement.versionConstraint}`,
        [requirement.productId]
      );
    }
    if (matches.length !== 1) {
      throw new ResolveFailure(
        "ambiguous",
        `multiple supplied candidates satisfy ${requirement.productId}@${requirement.versionConstraint}`,
        matches.map((candidate) => candidate.descriptorId)
      );
    }
    const chosen = matches[0];
    if (chosen === undefined) {
      throw new ResolveFailure("unresolved", "candidate selection was empty");
    }
    selected.set(chosen.productId, chosen);
    if (sourceProductId !== null) {
      edges.push(
        Object.freeze({
          sourceProductId,
          targetProductId: chosen.productId,
          requirement
        })
      );
    }
    return chosen;
  };

  const visit = (descriptor: CatalogProductDescriptor): void => {
    if (visiting.has(descriptor.productId)) {
      throw new ResolveFailure(
        "dependency_cycle",
        `dependency cycle reaches ${descriptor.productId}`,
        [descriptor.productId]
      );
    }
    if (visited.has(descriptor.productId)) {
      return;
    }
    visiting.add(descriptor.productId);
    for (const dependency of descriptor.dependencies) {
      const target = selectRequirement(dependency, descriptor.productId);
      if (
        !edges.some(
          (edge) =>
            edge.sourceProductId === descriptor.productId &&
            edge.targetProductId === target.productId &&
            edge.requirement.versionConstraint === dependency.versionConstraint
        )
      ) {
        edges.push(
          Object.freeze({
            sourceProductId: descriptor.productId,
            targetProductId: target.productId,
            requirement: dependency
          })
        );
      }
      visit(target);
    }
    visiting.delete(descriptor.productId);
    visited.add(descriptor.productId);
  };

  for (const requirement of request.requirements) {
    visit(selectRequirement(requirement, null));
  }

  const descriptors = Object.freeze([...selected.values()].sort(compareProductIdentity));
  const abg = selectedAbg(descriptors);
  if (abg === null) {
    throw new ResolveFailure(
      "unresolved",
      "the resolved set must contain exactly one ABIogenesis runtime product",
      [ABG_PRODUCT_ID]
    );
  }
  const compatibility = descriptors.map((descriptor) => {
    const compatible = satisfies(abg.version, descriptor.abgCompatibility);
    return Object.freeze({
      productId: descriptor.productId,
      compatible,
      reason: compatible
        ? null
        : `${descriptor.productId}@${descriptor.version} rejects ABIogenesis ${abg.version}`
    });
  });
  const incompatible = compatibility.find((row) => !row.compatible);
  if (incompatible !== undefined) {
    throw new ResolveFailure(
      "incompatible",
      incompatible.reason ?? `${incompatible.productId} is incompatible`,
      [incompatible.productId, abg.productId]
    );
  }
  return constructResolvedProductLock({
    requirements: request.requirements,
    descriptors,
    edges,
    compatibility
  });
}

export function catalogResolve(
  requestInput: CatalogResolveRequest,
  context: ProductIntakeContext
): CatalogResolveResult | CatalogResolveRefusal {
  if (context.kind !== "product_intake") {
    return refused({
      operationId: "abg.operation.catalog.resolve",
      code: "malformed_candidate",
      message: "catalog.resolve requires product_intake context"
    });
  }
  try {
    const request = admitCatalogResolveRequest(requestInput);
    const lock = resolveExactSet(request);
    return accepted({
      operationId: "abg.operation.catalog.resolve",
      disposition: "resolved",
      value: lock,
      provenanceRefs: lock.products.flatMap((product) => [product.descriptorId])
    });
  } catch (error) {
    if (error instanceof ResolveFailure) {
      return refused({
        operationId: "abg.operation.catalog.resolve",
        code: error.code,
        message: error.message,
        residualRefs: error.residualRefs
      });
    }
    return refused({
      operationId: "abg.operation.catalog.resolve",
      code: "malformed_candidate",
      message: error instanceof Error ? error.message : "catalog candidate admission failed"
    });
  }
}
