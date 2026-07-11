// Implements: REQ-P-INSTALL-043 through REQ-P-INSTALL-045
// Implements: REQ-P-POLICY-049
// Implements: REQ-P-PUBLIC-CONTRACTS-001 through REQ-P-PUBLIC-CONTRACTS-004

import { createHash } from "node:crypto";
import { satisfies, validRange } from "semver";

import {
  digest,
  relativePath
} from "../public_sdk/admission_primitives.js";
import {
  admitProductToolchainManifest,
  admitPublicContractCatalog
} from "../public_sdk/carrier_admission.js";
import {
  admitIJsonText,
  canonicalizeIJson,
  digestCanonicalIJson
} from "../public_sdk/canonical.js";
import { admitCatalogVerifyRequest } from "../public_sdk/operation_admission.js";
import type {
  CatalogContributionManifest,
  CatalogProductDescriptor,
  CatalogVerifyRefusal,
  CatalogVerifyRequest,
  CatalogVerifyResult,
  ProductIntakeContext,
  ProductContentInventoryRow,
  ProductToolchainManifest,
  ProductVerificationCheck,
  PublicContractCatalog,
  ResolvedProductLock,
  Sha256Digest,
  SuppliedProductArtifact,
  SuppliedProductArtifactEntry,
  VerifiedProductArtifact
} from "../public_sdk/carriers.js";
import { accepted, refused } from "./outcomes.js";
import {
  assertResolvedProductLockCoherence,
  descriptorDigest
} from "./resolve.js";

const PRODUCT_MANIFEST_PATH = "product-toolchain-manifest.json";
const ABG_PRODUCT_ID = "abiogenesis";
const ABG_PACKAGE_NAME = "@abiogenesis/typescript-tenant";

export const DS1_NATIVE_CONTRACT_IDS = Object.freeze([
  "abg.contract.gtl.m01",
  "abg.contract.gtl.m02",
  "abg.contract.gtl.requirements",
  "abg.contract.abg.requirements",
  "abg.contract.abg.executive",
  "abg.contract.abg.m03",
  "abg.contract.abg.transport",
  "abg.contract.app.m04",
  "abg.contract.qualification.m05"
]);

export const DS1_SCHEMA_CONTRACT_IDS = Object.freeze([
  "abg.schema.product-toolchain-manifest",
  "abg.schema.public-contract-catalog",
  "abg.schema.public-operation-contract",
  "abg.schema.native-contract-inventory",
  "abg.schema.capability-contract",
  "abg.schema.closed-vocabulary",
  "abg.schema.gtl-graph-function",
  "abg.schema.gtl-module",
  "abg.schema.catalog-product-descriptor",
  "abg.schema.catalog-contribution-manifest",
  "abg.schema.resolved-product-lock",
  "abg.schema.workspace-manifest",
  "abg.schema.workspace-binding",
  "abg.schema.install-manifest",
  "abg.schema.installer-manifest",
  "abg.schema.catalog-admission",
  "abg.schema.public-catalog-row",
  "abg.schema.public-catalog-description",
  "abg.schema.public-session-catalog-view",
  "abg.schema.public-operation-invocation",
  "abg.schema.host-invocation",
  "abg.schema.runtime-event",
  "abg.schema.runtime-result",
  "abg.schema.runtime-replay"
]);

export const DS1_OPERATION_IDS = Object.freeze([
  "abg.operation.workspace.create",
  "abg.operation.workspace.open",
  "abg.operation.catalog.resolve",
  "abg.operation.catalog.verify",
  "abg.operation.install.install",
  "abg.operation.catalog.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.list",
  "abg.operation.catalog.describe",
  "abg.operation.catalog.allow",
  "abg.operation.catalog.invoke",
  "abg.operation.read.result",
  "abg.operation.read.replay"
]);

export const DS1_CAPABILITY_IDS = Object.freeze([
  "abg.capability.gtl.declare@5",
  "abg.capability.gtl.admit@5",
  "abg.capability.gtl.serialize@5",
  "abg.capability.module.publish@5",
  "abg.capability.catalog.contribute@5",
  "abg.capability.catalog.invoke-graph-function@5",
  "abg.capability.install.bind-products@5"
]);

export const DS1_VOCABULARY_IDS = Object.freeze([
  "abg.vocabulary.runtime-event-kind"
]);

const DS1_NATIVE_EXPORTS: Readonly<Record<string, string>> = Object.freeze({
  "abg.contract.gtl.m01": "@abiogenesis/typescript-tenant/gtl/m01",
  "abg.contract.gtl.m02": "@abiogenesis/typescript-tenant/gtl/m02",
  "abg.contract.gtl.requirements": "@abiogenesis/typescript-tenant/gtl/requirements",
  "abg.contract.abg.requirements": "@abiogenesis/typescript-tenant/abg/requirements",
  "abg.contract.abg.executive": "@abiogenesis/typescript-tenant/abg/executive",
  "abg.contract.abg.m03": "@abiogenesis/typescript-tenant/abg/m03",
  "abg.contract.abg.transport": "@abiogenesis/typescript-tenant/abg/m03/transport",
  "abg.contract.app.m04": "@abiogenesis/typescript-tenant/app/m04",
  "abg.contract.qualification.m05": "@abiogenesis/typescript-tenant/qualification/m05"
});

const DS1_REQUIRED_NATIVE_SYMBOLS: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    "abg.contract.gtl.m01": Object.freeze([
      "admitGraphFunction",
      "serializeGraphFunction",
      "admitCProgramSyntax",
      "serializeCProgramCanonical"
    ]),
    "abg.contract.gtl.m02": Object.freeze(["admitModule", "serializeModule"]),
    "abg.contract.abg.m03": Object.freeze([
      "RuntimeEvent",
      "CanonicalRuntimeEvent",
      "RUNTIME_EVENT_KIND_VALUES",
      "GtlProgramDiagnosticId",
      "GTL_PROGRAM_DIAGNOSTIC_ID_VALUES",
      "GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES",
      "GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS",
      "admitGtlProgramConformanceInput",
      "typecheckGtlProgram"
    ])
  });

const DS1_OPERATION_NATIVE_SYMBOLS: Readonly<
  Record<string, readonly string[]>
> = Object.freeze({
  "abg.operation.workspace.create": Object.freeze([
    "workspaceCreate", "WorkspaceCreateRequest", "WorkspaceCreateResult",
    "WorkspaceCreateRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.workspace.open": Object.freeze([
    "workspaceOpen", "WorkspaceOpenRequest", "WorkspaceOpenResult",
    "WorkspaceOpenRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.resolve": Object.freeze([
    "catalogResolve", "CatalogResolveRequest", "CatalogResolveResult",
    "CatalogResolveRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.verify": Object.freeze([
    "catalogVerify", "CatalogVerifyRequest", "CatalogVerifyResult",
    "CatalogVerifyRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.install.install": Object.freeze([
    "installProduct", "InstallProductRequest", "InstallProductResult",
    "InstallProductRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.bind": Object.freeze([
    "catalogBind", "CatalogBindRequest", "CatalogBindResult",
    "CatalogBindRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.admit": Object.freeze([
    "catalogAdmit", "CatalogAdmitRequest", "CatalogAdmitResult",
    "CatalogAdmitRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.list": Object.freeze([
    "catalogList", "CatalogListRequest", "CatalogListResult",
    "CatalogListRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.describe": Object.freeze([
    "catalogDescribe", "CatalogDescribeRequest", "CatalogDescribeResult",
    "CatalogDescribeRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.allow": Object.freeze([
    "catalogAllow", "CatalogAllowRequest", "CatalogAllowResult",
    "CatalogAllowRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.catalog.invoke": Object.freeze([
    "catalogInvoke", "CatalogInvokeRequest", "CatalogInvokeResult",
    "CatalogInvokeRefusal", "HostInvocationDescriptor"
  ]),
  "abg.operation.read.result": Object.freeze([
    "readResult", "ReadResultRequest", "ReadResultResult",
    "ReadResultRefusal", "PublicOperationInvocationEnvelope"
  ]),
  "abg.operation.read.replay": Object.freeze([
    "readReplay", "ReadReplayRequest", "ReadReplayResult",
    "ReadReplayRefusal", "PublicOperationInvocationEnvelope"
  ])
});

const DS1_CAPABILITY_REQUIRED_ROWS: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    "abg.capability.gtl.declare@5": Object.freeze([
      "abg.contract.gtl.m01", "abg.schema.gtl-graph-function"
    ]),
    "abg.capability.gtl.admit@5": Object.freeze([
      "abg.contract.gtl.m01", "abg.schema.gtl-graph-function"
    ]),
    "abg.capability.gtl.serialize@5": Object.freeze([
      "abg.contract.gtl.m01", "abg.schema.gtl-graph-function"
    ]),
    "abg.capability.module.publish@5": Object.freeze([
      "abg.contract.gtl.m02", "abg.schema.gtl-module"
    ]),
    "abg.capability.catalog.contribute@5": Object.freeze([
      "abg.schema.catalog-product-descriptor",
      "abg.schema.catalog-contribution-manifest",
      "abg.schema.catalog-admission",
      "abg.operation.catalog.admit",
      "abg.operation.catalog.list",
      "abg.operation.catalog.describe"
    ]),
    "abg.capability.catalog.invoke-graph-function@5": Object.freeze([
      "abg.operation.catalog.allow",
      "abg.operation.catalog.invoke",
      "abg.schema.host-invocation",
      "abg.contract.abg.m03"
    ]),
    "abg.capability.install.bind-products@5": Object.freeze([
      "abg.operation.catalog.resolve",
      "abg.operation.catalog.verify",
      "abg.operation.install.install",
      "abg.operation.catalog.bind",
      "abg.schema.resolved-product-lock",
      "abg.schema.install-manifest",
      "abg.schema.workspace-binding"
    ])
  });

type VerificationFailureCode = CatalogVerifyRefusal["code"];

class VerificationFailure extends Error {
  public readonly code: VerificationFailureCode;
  public readonly residualRefs: readonly string[];

  public constructor(
    code: VerificationFailureCode,
    message: string,
    residualRefs: readonly string[] = []
  ) {
    super(message);
    this.name = "VerificationFailure";
    this.code = code;
    this.residualRefs = Object.freeze([...residualRefs]);
  }
}

interface NormalizedArtifact {
  readonly entries: ReadonlyMap<string, Uint8Array>;
  readonly contentInventory: readonly ProductContentInventoryRow[];
  readonly inventoryDigest: Sha256Digest;
}

function sha256Bytes(bytes: Uint8Array): Sha256Digest {
  return digest(
    `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    "sha256 bytes"
  );
}

export function contributionDigestBasis(
  contribution: CatalogContributionManifest
): Omit<CatalogContributionManifest, "contributionDigest" | "descriptorDigest"> {
  const { contributionDigest, descriptorDigest: backReferenceDigest, ...basis } = contribution;
  void contributionDigest;
  void backReferenceDigest;
  return basis;
}

export function contributionManifestDigest(
  contribution: CatalogContributionManifest
): Sha256Digest {
  return digest(
    digestCanonicalIJson(contributionDigestBasis(contribution)),
    "CatalogContributionManifest.contributionDigest"
  );
}

function catalogDigestBasis(
  catalog: PublicContractCatalog
): Omit<PublicContractCatalog, "catalogDigest"> {
  const { catalogDigest, ...basis } = catalog;
  void catalogDigest;
  return basis;
}

export function publicContractCatalogDigest(
  catalog: PublicContractCatalog
): Sha256Digest {
  return digest(
    digestCanonicalIJson(catalogDigestBasis(catalog)),
    "PublicContractCatalog.catalogDigest"
  );
}

function runtimeProfileDigest(
  profile: NonNullable<ProductToolchainManifest["runtimeSystemProfile"]>
): Sha256Digest {
  const { profileDigest, ...basis } = profile;
  void profileDigest;
  return digest(
    digestCanonicalIJson(basis),
    "AbgRuntimeSystemProfile.profileDigest"
  );
}

export function productManifestDigest(
  manifest: ProductToolchainManifest
): Sha256Digest {
  return digest(
    digestCanonicalIJson(manifest),
    "ProductToolchainManifest digest"
  );
}

function archiveRelativePath(
  artifact: SuppliedProductArtifact,
  rawPath: string
): string {
  if (
    rawPath.length === 0 ||
    rawPath.includes("\\") ||
    rawPath.includes("\0") ||
    rawPath.startsWith("/") ||
    rawPath.endsWith("/")
  ) {
    throw new VerificationFailure(
      "unsafe_archive",
      `archive entry has an unsafe path: ${JSON.stringify(rawPath)}`,
      [rawPath]
    );
  }
  const segments = rawPath.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    throw new VerificationFailure(
      "unsafe_archive",
      `archive entry escapes the product root: ${JSON.stringify(rawPath)}`,
      [rawPath]
    );
  }
  const normalized = segments.join("/");
  if (normalized !== rawPath) {
    throw new VerificationFailure(
      "unsafe_archive",
      `archive entry is not a canonical product-relative path: ${JSON.stringify(rawPath)}`,
      [rawPath]
    );
  }
  if (artifact.format === "npm_package_tgz") {
    if (segments[0] !== "package" || segments.length < 2) {
      throw new VerificationFailure(
        "unsafe_archive",
        `npm package entry is outside the package root: ${JSON.stringify(rawPath)}`,
        [rawPath]
      );
    }
    return segments.slice(1).join("/");
  }
  return normalized;
}

function normalizeArtifact(
  artifact: SuppliedProductArtifact,
  suppliedEntries: readonly SuppliedProductArtifactEntry[]
): NormalizedArtifact {
  if (suppliedEntries.length === 0) {
    throw new VerificationFailure("content_mismatch", "supplied artifact is empty");
  }
  const entries = new Map<string, Uint8Array>();
  for (const entry of suppliedEntries) {
    if (!(entry.bytes instanceof Uint8Array)) {
      throw new VerificationFailure(
        "unsafe_archive",
        `archive entry ${entry.relativePath} does not carry byte content`,
        [entry.relativePath]
      );
    }
    const relativePath = archiveRelativePath(artifact, entry.relativePath);
    if (entries.has(relativePath)) {
      throw new VerificationFailure(
        "unsafe_archive",
        `archive contains duplicate product path ${relativePath}`,
        [relativePath]
      );
    }
    entries.set(relativePath, entry.bytes);
  }
  const contentInventory: ProductContentInventoryRow[] = [...entries.entries()]
    .filter(([relativePath]) => relativePath !== PRODUCT_MANIFEST_PATH)
    .map(([relativePath, bytes]) =>
      Object.freeze({ relativePath, digest: sha256Bytes(bytes) })
    )
    .sort((left, right) =>
      left.relativePath < right.relativePath
        ? -1
        : left.relativePath > right.relativePath
          ? 1
          : 0
    );
  return Object.freeze({
    entries,
    contentInventory: Object.freeze(contentInventory),
    inventoryDigest: digest(
      digestCanonicalIJson(
        contentInventory.map((row) => [row.relativePath, row.digest])
      ),
      "product content inventory digest"
    )
  });
}

function requiredEntry(
  artifact: NormalizedArtifact,
  relativePath: string,
  code: VerificationFailureCode
): Uint8Array {
  const bytes = artifact.entries.get(relativePath);
  if (bytes === undefined) {
    throw new VerificationFailure(
      code,
      `artifact is missing required product path ${relativePath}`,
      [relativePath]
    );
  }
  return bytes;
}

function parseManifest(
  artifact: NormalizedArtifact
): ProductToolchainManifest {
  const bytes = requiredEntry(
    artifact,
    PRODUCT_MANIFEST_PATH,
    "unsupported_contract"
  );
  try {
    return admitProductToolchainManifest(
      admitIJsonText(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
        "product-toolchain-manifest.json"
      )
    );
  } catch (error) {
    throw new VerificationFailure(
      "unsupported_contract",
      error instanceof Error ? error.message : "product manifest admission failed",
      [PRODUCT_MANIFEST_PATH]
    );
  }
}

function assertEqual(input: {
  readonly field: string;
  readonly expected: string;
  readonly actual: string;
  readonly code: VerificationFailureCode;
  readonly checks: ProductVerificationCheck[];
}): void {
  if (input.expected !== input.actual) {
    throw new VerificationFailure(
      input.code,
      `${input.field} mismatch: expected ${input.expected}, received ${input.actual}`,
      [input.field]
    );
  }
  input.checks.push(
    Object.freeze({
      field: input.field,
      accepted: true,
      expected: input.expected,
      actual: input.actual
    })
  );
}

function assertDescriptorAndContribution(input: {
  readonly request: CatalogVerifyRequest;
  readonly checks: ProductVerificationCheck[];
}): void {
  const { descriptor, contributionManifest } = input.request;
  assertEqual({
    field: "descriptor.descriptorDigest",
    expected: descriptor.descriptorDigest,
    actual: descriptorDigest(descriptor),
    code: "descriptor_mismatch",
    checks: input.checks
  });
  assertEqual({
    field: "contributionManifest.contributionDigest",
    expected: contributionManifest.contributionDigest,
    actual: contributionManifestDigest(contributionManifest),
    code: "contribution_mismatch",
    checks: input.checks
  });
  assertEqual({
    field: "descriptor.contributionManifestId",
    expected: descriptor.contributionManifestId,
    actual: contributionManifest.contributionId,
    code: "contribution_mismatch",
    checks: input.checks
  });
  assertEqual({
    field: "descriptor.contributionManifestDigest",
    expected: descriptor.contributionManifestDigest,
    actual: contributionManifest.contributionDigest,
    code: "contribution_mismatch",
    checks: input.checks
  });
  assertEqual({
    field: "contributionManifest.descriptorId",
    expected: descriptor.descriptorId,
    actual: contributionManifest.descriptorId,
    code: "contribution_mismatch",
    checks: input.checks
  });
  assertEqual({
    field: "contributionManifest.descriptorDigest",
    expected: descriptor.descriptorDigest,
    actual: contributionManifest.descriptorDigest,
    code: "contribution_mismatch",
    checks: input.checks
  });
}

function selectedAbgVersion(lock: ResolvedProductLock): string {
  const matches = lock.products.filter(
    (product) => product.productId === ABG_PRODUCT_ID
  );
  if (matches.length !== 1) {
    throw new VerificationFailure(
      "lock_mismatch",
      "resolved lock does not identify exactly one ABIogenesis runtime product",
      [ABG_PRODUCT_ID]
    );
  }
  const selected = matches[0];
  if (selected === undefined) {
    throw new VerificationFailure("lock_mismatch", "resolved ABG selection is absent");
  }
  return selected.version;
}

function assertLock(input: {
  readonly descriptor: CatalogProductDescriptor;
  readonly lock: ResolvedProductLock;
  readonly checks: ProductVerificationCheck[];
}): string {
  try {
    assertResolvedProductLockCoherence(input.lock);
  } catch (error) {
    throw new VerificationFailure(
      "lock_mismatch",
      error instanceof Error ? error.message : "resolved lock admission failed",
      [input.lock.lockId]
    );
  }
  const selected = input.lock.products.find(
    (product) => product.productId === input.descriptor.productId
  );
  if (selected === undefined) {
    throw new VerificationFailure(
      "lock_mismatch",
      `resolved lock does not select ${input.descriptor.productId}`,
      [input.lock.lockId, input.descriptor.productId]
    );
  }
  const selectedIdentity = canonicalizeIJson(selected);
  const descriptorIdentity = canonicalizeIJson({
    publisher: input.descriptor.publisher,
    productId: input.descriptor.productId,
    version: input.descriptor.version,
    descriptorId: input.descriptor.descriptorId,
    descriptorDigest: input.descriptor.descriptorDigest,
    contributionId: input.descriptor.contributionManifestId,
    contributionDigest: input.descriptor.contributionManifestDigest,
    artifactDigest: input.descriptor.distributionArtifactDigest,
    productContentDigest: input.descriptor.productContentDigest
  });
  assertEqual({
    field: "resolvedLock.productSelection",
    expected: descriptorIdentity,
    actual: selectedIdentity,
    code: "lock_mismatch",
    checks: input.checks
  });
  for (const dependency of input.descriptor.dependencies) {
    const matchingEdges = input.lock.dependencyEdges.filter(
      (edge) =>
        edge.sourceProductId === input.descriptor.productId &&
        edge.targetProductId === dependency.productId &&
        canonicalizeIJson(edge.requirement) === canonicalizeIJson(dependency)
    );
    if (matchingEdges.length !== 1) {
      throw new VerificationFailure(
        "lock_mismatch",
        `resolved lock does not preserve the exact dependency from ${input.descriptor.productId} to ${dependency.productId}`,
        [input.lock.lockId, input.descriptor.productId, dependency.productId]
      );
    }
  }
  const unexpectedEdges = input.lock.dependencyEdges.filter(
    (edge) =>
      edge.sourceProductId === input.descriptor.productId &&
      !input.descriptor.dependencies.some(
        (dependency) =>
          edge.targetProductId === dependency.productId &&
          canonicalizeIJson(edge.requirement) === canonicalizeIJson(dependency)
      )
  );
  if (unexpectedEdges.length > 0) {
    throw new VerificationFailure(
      "lock_mismatch",
      `resolved lock adds undeclared dependencies for ${input.descriptor.productId}`,
      unexpectedEdges.map((edge) => edge.targetProductId)
    );
  }
  const compatibility = input.lock.compatibility.find(
    (row) => row.productId === input.descriptor.productId
  );
  if (compatibility === undefined || !compatibility.compatible) {
    throw new VerificationFailure(
      "incompatible",
      `resolved lock does not carry compatible truth for ${input.descriptor.productId}`,
      [input.lock.lockId, input.descriptor.productId]
    );
  }
  const abgVersion = selectedAbgVersion(input.lock);
  if (
    validRange(input.descriptor.abgCompatibility) === null ||
    !satisfies(abgVersion, input.descriptor.abgCompatibility)
  ) {
    throw new VerificationFailure(
      "incompatible",
      `${input.descriptor.productId} rejects ABIogenesis ${abgVersion}`,
      [input.descriptor.productId, ABG_PRODUCT_ID]
    );
  }
  input.checks.push(
    Object.freeze({
      field: "descriptor.abgCompatibility",
      accepted: true,
      expected: input.descriptor.abgCompatibility,
      actual: abgVersion
    })
  );
  return abgVersion;
}

function assertManifestIdentity(input: {
  readonly descriptor: CatalogProductDescriptor;
  readonly contribution: CatalogContributionManifest;
  readonly manifest: ProductToolchainManifest;
  readonly artifact: SuppliedProductArtifact;
  readonly inventoryDigest: Sha256Digest;
  readonly checks: ProductVerificationCheck[];
}): void {
  const comparisons = [
    ["artifact.expectedArtifactDigest", input.descriptor.distributionArtifactDigest, input.artifact.expectedArtifactDigest, "content_mismatch"],
    ["artifact.expectedProductContentDigest", input.descriptor.productContentDigest, input.artifact.expectedProductContentDigest, "content_mismatch"],
    ["manifest.publisher", input.descriptor.publisher, input.manifest.publisher, "identity_mismatch"],
    ["manifest.productId", input.descriptor.productId, input.manifest.productId, "identity_mismatch"],
    ["manifest.packageName", input.descriptor.packageName, input.manifest.packageName, "identity_mismatch"],
    ["manifest.packageVersion", input.descriptor.version, input.manifest.packageVersion, "identity_mismatch"],
    ["manifest.productContentDigest", input.descriptor.productContentDigest, input.manifest.productContentDigest, "content_mismatch"],
    ["contentInventory.digest", input.descriptor.productContentDigest, input.inventoryDigest, "content_mismatch"],
    ["contribution.productId", input.descriptor.productId, input.contribution.productId, "contribution_mismatch"],
    ["contribution.productVersion", input.descriptor.version, input.contribution.productVersion, "contribution_mismatch"],
    ["contribution.artifactDigest", input.descriptor.distributionArtifactDigest, input.contribution.artifactDigest, "contribution_mismatch"]
  ] as const;
  for (const [field, expected, actual, code] of comparisons) {
    assertEqual({ field, expected, actual, code, checks: input.checks });
  }
}

function assertCatalogContracts(input: {
  readonly artifact: NormalizedArtifact;
  readonly manifest: ProductToolchainManifest;
  readonly descriptor: CatalogProductDescriptor;
  readonly checks: ProductVerificationCheck[];
}): void {
  const catalog = input.manifest.publicContractCatalog;
  assertEqual({
    field: "publicContractCatalog.catalogDigest",
    expected: catalog.catalogDigest,
    actual: publicContractCatalogDigest(catalog),
    code: "unsupported_contract",
    checks: input.checks
  });
  const serializedCatalog = requiredEntry(
    input.artifact,
    input.manifest.publicContractCatalogPath,
    "unsupported_contract"
  );
  let locatedCatalog: PublicContractCatalog;
  try {
    locatedCatalog = admitPublicContractCatalog(
      admitIJsonText(
        new TextDecoder("utf-8", { fatal: true }).decode(serializedCatalog),
        input.manifest.publicContractCatalogPath
      )
    );
  } catch (error) {
    throw new VerificationFailure(
      "unsupported_contract",
      error instanceof Error ? error.message : "public contract catalog admission failed",
      [input.manifest.publicContractCatalogPath]
    );
  }
  assertEqual({
    field: "publicContractCatalog.locatedContent",
    expected: canonicalizeIJson(catalog),
    actual: canonicalizeIJson(locatedCatalog),
    code: "unsupported_contract",
    checks: input.checks
  });
  const catalogSchemaBytes = requiredEntry(
    input.artifact,
    catalog.catalogSchemaPath,
    "unsupported_contract"
  );
  assertEqual({
    field: "publicContractCatalog.schemaDigest",
    expected: catalog.catalogSchemaDigest,
    actual: sha256Bytes(catalogSchemaBytes),
    code: "unsupported_contract",
    checks: input.checks
  });
  try {
    admitIJsonText(
      new TextDecoder("utf-8", { fatal: true }).decode(catalogSchemaBytes),
      catalog.catalogSchemaPath
    );
  } catch (error) {
    throw new VerificationFailure(
      "unsupported_contract",
      error instanceof Error
        ? error.message
        : "public contract catalog schema admission failed",
      [catalog.catalogSchemaPath]
    );
  }

  const availableContracts = new Set(catalog.rows.map((row) => row.contractId));
  const availableCapabilities = new Set(
    catalog.rows.flatMap((row) => [
      ...(row.contractKind === "capability" ? [row.contractId] : []),
      ...row.capabilityRefs
    ])
  );
  for (const row of catalog.rows) {
    if (row.owningProductId !== input.manifest.productId) {
      throw new VerificationFailure(
        "unsupported_contract",
        `contract ${row.contractId} claims a different owning product`,
        [row.contractId]
      );
    }
    if (
      (row.contractKind === "native_contract" || row.contractKind === "operation") &&
      (row.nativeLocator === null || row.assetLocator === null)
    ) {
      throw new VerificationFailure(
        "unsupported_contract",
        `${row.contractKind} ${row.contractId} requires both native and canonical asset locators`,
        [row.contractId]
      );
    }
    if (
      row.nativeLocator !== null &&
      row.nativeLocator.packageName !== input.manifest.packageName
    ) {
      throw new VerificationFailure(
        "unsupported_contract",
        `native contract ${row.contractId} locates a different package`,
        [row.contractId, row.nativeLocator.packageName]
      );
    }
    if (row.assetLocator !== null) {
      const assetBytes = requiredEntry(
        input.artifact,
        row.assetLocator.relativePath,
        "unsupported_contract"
      );
      const actual = sha256Bytes(assetBytes);
      assertEqual({
        field: `contract.${row.contractId}.assetDigest`,
        expected: row.assetLocator.digest,
        actual,
        code: "unsupported_contract",
        checks: input.checks
      });
      assertEqual({
        field: `contract.${row.contractId}.contractDigest`,
        expected: row.digest,
        actual,
        code: "unsupported_contract",
        checks: input.checks
      });
      if (row.assetLocator.mediaType.includes("json")) {
        try {
          admitIJsonText(
            new TextDecoder("utf-8", { fatal: true }).decode(assetBytes),
            `contract asset ${row.contractId}`
          );
        } catch (error) {
          throw new VerificationFailure(
            "unsupported_contract",
            error instanceof Error
              ? error.message
              : `contract asset ${row.contractId} is not admitted I-JSON`,
            [row.contractId, row.assetLocator.relativePath]
          );
        }
      }
      if (row.contractKind === "native_contract") {
        if (
          row.nativeLocator === null ||
          row.assetLocator.schemaId !== "abg.schema.native-contract-inventory" ||
          row.assetLocator.mediaType !== "application/json"
        ) {
          throw new VerificationFailure(
            "unsupported_contract",
            `native contract ${row.contractId} requires its canonical declaration inventory`,
            [row.contractId]
          );
        }
        let inventory: unknown;
        try {
          inventory = admitIJsonText(
            new TextDecoder("utf-8", { fatal: true }).decode(assetBytes),
            `native inventory ${row.contractId}`
          );
        } catch (error) {
          throw new VerificationFailure(
            "unsupported_contract",
            error instanceof Error
              ? error.message
              : `native inventory ${row.contractId} is malformed`,
            [row.contractId, row.assetLocator.relativePath]
          );
        }
        if (!Array.isArray(inventory) || inventory.length === 0) {
          throw new VerificationFailure(
            "unsupported_contract",
            `native inventory ${row.contractId} must contain declaration tuples`,
            [row.contractId, row.assetLocator.relativePath]
          );
        }
        const tupleKeys = new Set<string>();
        for (const [index, tuple] of inventory.entries()) {
          if (
            !Array.isArray(tuple) ||
            tuple.length !== 3 ||
            typeof tuple[0] !== "string" ||
            typeof tuple[1] !== "string" ||
            typeof tuple[2] !== "string"
          ) {
            throw new VerificationFailure(
              "unsupported_contract",
              `native inventory ${row.contractId} has a malformed tuple`,
              [row.contractId, String(index)]
            );
          }
          const packageExport = tuple[0];
          let declarationPath: string;
          let declarationDigest: Sha256Digest;
          try {
            declarationPath = relativePath(
              tuple[1],
              `native inventory ${row.contractId}[${String(index)}].declarationPath`
            );
            declarationDigest = digest(
              tuple[2],
              `native inventory ${row.contractId}[${String(index)}].declarationDigest`
            );
          } catch (error) {
            throw new VerificationFailure(
              "unsupported_contract",
              error instanceof Error ? error.message : "native inventory tuple admission failed",
              [row.contractId, String(index)]
            );
          }
          if (packageExport !== row.nativeLocator.packageExport) {
            throw new VerificationFailure(
              "unsupported_contract",
              `native inventory ${row.contractId} has a mismatched package export`,
              [row.contractId, packageExport]
            );
          }
          const tupleKey = `${packageExport}\u0000${declarationPath}`;
          if (tupleKeys.has(tupleKey)) {
            throw new VerificationFailure(
              "unsupported_contract",
              `native inventory ${row.contractId} contains a duplicate declaration tuple`,
              [row.contractId, declarationPath]
            );
          }
          tupleKeys.add(tupleKey);
          assertEqual({
            field: `contract.${row.contractId}.declaration.${declarationPath}`,
            expected: declarationDigest,
            actual: sha256Bytes(
              requiredEntry(input.artifact, declarationPath, "unsupported_contract")
            ),
            code: "unsupported_contract",
            checks: input.checks
          });
        }
      }
    }
  }
  for (const ref of input.descriptor.contractRefs) {
    if (!availableContracts.has(ref)) {
      throw new VerificationFailure(
        "unsupported_contract",
        `descriptor contract ${ref} is absent from the product contract catalog`,
        [ref]
      );
    }
  }
  for (const ref of input.descriptor.capabilityRefs) {
    if (!availableCapabilities.has(ref)) {
      throw new VerificationFailure(
        "unsupported_contract",
        `descriptor capability ${ref} is absent from the product contract catalog`,
        [ref]
      );
    }
  }
  const catalogContractSummary = catalog.rows
    .filter((row) => row.contractKind !== "capability")
    .map((row) => row.contractId)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  const descriptorContractSummary = [...input.descriptor.contractRefs].sort(
    (left, right) => (left < right ? -1 : left > right ? 1 : 0)
  );
  const catalogCapabilitySummary = catalog.rows
    .filter((row) => row.contractKind === "capability")
    .map((row) => row.contractId)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  const descriptorCapabilitySummary = [...input.descriptor.capabilityRefs].sort(
    (left, right) => (left < right ? -1 : left > right ? 1 : 0)
  );
  if (
    canonicalizeIJson(catalogContractSummary) !==
      canonicalizeIJson(descriptorContractSummary) ||
    canonicalizeIJson(catalogCapabilitySummary) !==
      canonicalizeIJson(descriptorCapabilitySummary)
  ) {
    throw new VerificationFailure(
      "descriptor_mismatch",
      "descriptor contract/capability summary does not equal its public contract catalog",
      [input.descriptor.descriptorId]
    );
  }
  for (const locator of input.manifest.productRelativeLocators) {
    requiredEntry(input.artifact, locator, "unsupported_contract");
  }
  if (input.manifest.runtimeSystemProfile !== null) {
    assertEqual({
      field: "runtimeSystemProfile.profileDigest",
      expected: input.manifest.runtimeSystemProfile.profileDigest,
      actual: runtimeProfileDigest(input.manifest.runtimeSystemProfile),
      code: "unsupported_contract",
      checks: input.checks
    });
  }
  assertProductProfileMatrix(input.manifest);
}

export function assertProductProfileMatrix(
  manifest: ProductToolchainManifest
): ProductToolchainManifest {
  const isAbgProduct = manifest.productId === ABG_PRODUCT_ID;
  const isAbgPackage = manifest.packageName === ABG_PACKAGE_NAME;
  if (isAbgProduct !== isAbgPackage) {
    throw new VerificationFailure(
      "identity_mismatch",
      "product manifest has an incoherent ABIogenesis product/package identity",
      [manifest.productId, manifest.packageName]
    );
  }
  if (isAbgProduct && manifest.runtimeSystemProfile === null) {
    throw new VerificationFailure(
      "unsupported_contract",
      "ABIogenesis product manifest requires a runtime system profile",
      [manifest.productId]
    );
  }
  if (isAbgProduct) {
    assertDs1ContractRoster(manifest.publicContractCatalog);
  } else if (
    manifest.runtimeSystemProfile !== null ||
    manifest.publicContractCatalog.profile !== "catalog-product-v1"
  ) {
    throw new VerificationFailure(
      "unsupported_contract",
      "catalog products require catalog-product-v1 and cannot publish runtime system authority",
      [manifest.productId, manifest.publicContractCatalog.profile]
    );
  } else {
    const reservedRows = manifest.publicContractCatalog.rows.filter(
      (row) =>
        DS1_NATIVE_CONTRACT_IDS.includes(row.contractId) ||
        DS1_OPERATION_IDS.includes(row.contractId)
    );
    if (reservedRows.length > 0) {
      throw new VerificationFailure(
        "unsupported_contract",
        "catalog-product-v1 cannot claim the ABIogenesis native or operation roster",
        reservedRows.map((row) => row.contractId)
      );
    }
  }
  return manifest;
}

function assertExactRoster(input: {
  readonly catalog: PublicContractCatalog;
  readonly kind:
    | "native_contract"
    | "schema_asset"
    | "vocabulary_asset"
    | "operation"
    | "capability";
  readonly requiredIds: readonly string[];
  readonly exact: boolean;
}): void {
  const rows = input.catalog.rows.filter(
    (row) => row.contractKind === input.kind
  );
  const identities = new Set(rows.map((row) => row.contractId));
  const missing = input.requiredIds.filter((identity) => !identities.has(identity));
  const unexpected = input.exact
    ? rows
        .map((row) => row.contractId)
        .filter((identity) => !input.requiredIds.includes(identity))
    : [];
  if (
    missing.length > 0 ||
    unexpected.length > 0 ||
    (input.exact && rows.length !== input.requiredIds.length)
  ) {
    throw new VerificationFailure(
      "unsupported_contract",
      `ABIogenesis DS-1 ${input.kind} roster mismatch`,
      [...missing, ...unexpected]
    );
  }
}

function assertDs1NativeAndCapabilityMap(catalog: PublicContractCatalog): void {
  for (const contractId of DS1_NATIVE_CONTRACT_IDS) {
    const row = catalog.rows.find((candidate) => candidate.contractId === contractId);
    const expectedExport = DS1_NATIVE_EXPORTS[contractId];
    if (
      row?.nativeLocator === null ||
      row?.nativeLocator === undefined ||
      expectedExport === undefined ||
      row.nativeLocator.packageName !== ABG_PACKAGE_NAME ||
      row.nativeLocator.packageExport !== expectedExport
    ) {
      throw new VerificationFailure(
        "unsupported_contract",
        `ABIogenesis native contract ${contractId} has no exact package export locator`,
        [contractId]
      );
    }
    const missingSymbols = (DS1_REQUIRED_NATIVE_SYMBOLS[contractId] ?? []).filter(
      (symbol) => !row.nativeLocator?.symbols.includes(symbol)
    );
    if (missingSymbols.length > 0) {
      throw new VerificationFailure(
        "unsupported_contract",
        `ABIogenesis native contract ${contractId} omits required symbols`,
        [contractId, ...missingSymbols]
      );
    }
  }

  for (const operationId of DS1_OPERATION_IDS) {
    const row = catalog.rows.find((candidate) => candidate.contractId === operationId);
    const expectedSymbols = DS1_OPERATION_NATIVE_SYMBOLS[operationId];
    if (
      row?.nativeLocator === null ||
      row?.nativeLocator === undefined ||
      expectedSymbols === undefined ||
      row.nativeLocator.packageName !== ABG_PACKAGE_NAME ||
      row.nativeLocator.packageExport !== `${ABG_PACKAGE_NAME}/app/m04` ||
      expectedSymbols.some((symbol) => !row.nativeLocator?.symbols.includes(symbol))
    ) {
      throw new VerificationFailure(
        "unsupported_contract",
        `ABIogenesis operation ${operationId} has no exact native symbol locator`,
        [operationId]
      );
    }
  }

  for (const capabilityId of DS1_CAPABILITY_IDS) {
    const requiredRows = DS1_CAPABILITY_REQUIRED_ROWS[capabilityId];
    if (requiredRows === undefined) {
      throw new VerificationFailure(
        "unsupported_contract",
        `ABIogenesis capability ${capabilityId} has no contract map`,
        [capabilityId]
      );
    }
    const missingRows = requiredRows.filter((contractId) => {
      const row = catalog.rows.find((candidate) => candidate.contractId === contractId);
      return row === undefined || !row.capabilityRefs.includes(capabilityId);
    });
    if (missingRows.length > 0) {
      throw new VerificationFailure(
        "unsupported_contract",
        `ABIogenesis capability ${capabilityId} is not bound to its required contracts`,
        [capabilityId, ...missingRows]
      );
    }
  }
}

export function assertDs1ContractRoster(
  catalog: PublicContractCatalog
): PublicContractCatalog {
  if (catalog.profile !== "abg-5-ds1") {
    throw new VerificationFailure(
      "unsupported_contract",
      "T-223 requires the abg-5-ds1 contract profile",
      [catalog.catalogId]
    );
  }
  const corpusRows = catalog.rows.filter(
    (row) => row.contractKind === "corpus_asset"
  );
  if (corpusRows.length > 0) {
    throw new VerificationFailure(
      "unsupported_contract",
      "T-223 DS-1 cannot claim a deferred conformance corpus",
      corpusRows.map((row) => row.contractId)
    );
  }
  assertExactRoster({
    catalog,
    kind: "native_contract",
    requiredIds: DS1_NATIVE_CONTRACT_IDS,
    exact: true
  });
  assertExactRoster({
    catalog,
    kind: "schema_asset",
    requiredIds: DS1_SCHEMA_CONTRACT_IDS,
    exact: true
  });
  assertExactRoster({
    catalog,
    kind: "vocabulary_asset",
    requiredIds: DS1_VOCABULARY_IDS,
    exact: true
  });
  assertExactRoster({
    catalog,
    kind: "operation",
    requiredIds: DS1_OPERATION_IDS,
    exact: true
  });
  assertExactRoster({
    catalog,
    kind: "capability",
    requiredIds: DS1_CAPABILITY_IDS,
    exact: true
  });
  assertDs1NativeAndCapabilityMap(catalog);
  return catalog;
}

function assertContributionRows(input: {
  readonly artifact: NormalizedArtifact;
  readonly contribution: CatalogContributionManifest;
  readonly descriptor: CatalogProductDescriptor;
  readonly catalog: PublicContractCatalog;
  readonly lock: ResolvedProductLock;
  readonly abgVersion: string;
  readonly checks: ProductVerificationCheck[];
}): void {
  const selectedProducts = new Set(input.lock.products.map((row) => row.productId));
  const outgoingRequirements = input.lock.dependencyEdges
    .filter((edge) => edge.sourceProductId === input.contribution.productId)
    .map((edge) => edge.requirement);
  const declaredContractRefs = new Set(
    [
      ...input.descriptor.contractRefs,
      ...outgoingRequirements.flatMap(
        (requirement) => requirement.requiredContractRefs
      )
    ]
  );
  const declaredCapabilityRefs = new Set(
    [
      ...input.descriptor.capabilityRefs,
      ...outgoingRequirements.flatMap(
        (requirement) => requirement.requiredCapabilityRefs
      )
    ]
  );
  const currentSelection = input.lock.products.find(
    (selection) => selection.productId === input.contribution.productId
  );
  if (currentSelection === undefined) {
    throw new VerificationFailure(
      "lock_mismatch",
      "contribution owner is absent from the resolved lock",
      [input.contribution.productId]
    );
  }
  for (const row of input.contribution.rows) {
    if (
      row.ownerProductId !== input.contribution.productId ||
      row.ownerVersion !== input.contribution.productVersion
    ) {
      throw new VerificationFailure(
        "contribution_mismatch",
        `contribution row ${row.canonicalHandle} has a mismatched owner`,
        [row.canonicalHandle]
      );
    }
    if (
      validRange(row.compatibility.abgVersionRange) === null ||
      !satisfies(input.abgVersion, row.compatibility.abgVersionRange)
    ) {
      throw new VerificationFailure(
        "incompatible",
        `contribution row ${row.canonicalHandle} rejects ABIogenesis ${input.abgVersion}`,
        [row.canonicalHandle]
      );
    }
    for (const productRef of row.compatibility.requiredProductRefs) {
      if (!selectedProducts.has(productRef)) {
        throw new VerificationFailure(
          "lock_mismatch",
          `contribution row ${row.canonicalHandle} requires unselected product ${productRef}`,
          [row.canonicalHandle, productRef]
        );
      }
    }
    if (!declaredContractRefs.has(row.contractRef)) {
      throw new VerificationFailure(
        "unsupported_contract",
        `contribution row ${row.canonicalHandle} uses undeclared contract ${row.contractRef}`,
        [row.canonicalHandle, row.contractRef]
      );
    }
    for (const contractRef of row.compatibility.requiredContractRefs) {
      if (!declaredContractRefs.has(contractRef)) {
        throw new VerificationFailure(
          "unsupported_contract",
          `contribution row ${row.canonicalHandle} requires undeclared contract ${contractRef}`,
          [row.canonicalHandle, contractRef]
        );
      }
    }
    for (const capabilityRef of [
      ...row.capabilityRefs,
      ...row.compatibility.requiredCapabilityRefs
    ]) {
      if (!declaredCapabilityRefs.has(capabilityRef)) {
        throw new VerificationFailure(
          "incompatible",
          `contribution row ${row.canonicalHandle} requires undeclared capability ${capabilityRef}`,
          [row.canonicalHandle, capabilityRef]
        );
      }
    }
    if (row.locator.kind === "module_declaration") {
      assertEqual({
        field: `contribution.${row.canonicalHandle}.moduleDigest`,
        expected: row.locator.moduleDigest,
        actual: sha256Bytes(
          requiredEntry(input.artifact, row.locator.modulePath, "contribution_mismatch")
        ),
        code: "contribution_mismatch",
        checks: input.checks
      });
      assertEqual({
        field: `contribution.${row.canonicalHandle}.declarationRef`,
        expected: row.declarationRef,
        actual: row.locator.declarationRef,
        code: "contribution_mismatch",
        checks: input.checks
      });
    } else {
      const overlayLocator = row.locator;
      assertEqual({
        field: `contribution.${row.canonicalHandle}.assetDigest`,
        expected: overlayLocator.assetDigest,
        actual: sha256Bytes(
          requiredEntry(input.artifact, overlayLocator.assetPath, "contribution_mismatch")
        ),
        code: "contribution_mismatch",
        checks: input.checks
      });
      const schemaRows = input.catalog.rows.filter((catalogRow) => {
        const assetLocator = catalogRow.assetLocator;
        return (
          assetLocator !== null &&
          assetLocator.schemaId === overlayLocator.schemaId &&
          assetLocator.digest === overlayLocator.schemaDigest
        );
      });
      if (schemaRows.length !== 1) {
        throw new VerificationFailure(
          "unsupported_contract",
          `overlay ${row.canonicalHandle} does not resolve one exact schema asset`,
          [row.canonicalHandle, overlayLocator.schemaId]
        );
      }
    }
  }
}

async function verifyArtifact(input: {
  readonly request: CatalogVerifyRequest;
  readonly context: ProductIntakeContext;
}): Promise<VerifiedProductArtifact> {
  const checks: ProductVerificationCheck[] = [];
  const artifactBytes = await input.context.effects.readArtifactBytes(
    input.request.artifact.artifactPath
  );
  assertEqual({
    field: "artifact.distributionArtifactDigest",
    expected: input.request.artifact.expectedArtifactDigest,
    actual: sha256Bytes(artifactBytes),
    code: "content_mismatch",
    checks
  });
  const artifact = normalizeArtifact(
    input.request.artifact,
    await input.context.effects.inspectArtifact(input.request.artifact)
  );
  const manifest = parseManifest(artifact);
  assertDescriptorAndContribution({ request: input.request, checks });
  const abgVersion = assertLock({
    descriptor: input.request.descriptor,
    lock: input.request.resolvedLock,
    checks
  });
  assertManifestIdentity({
    descriptor: input.request.descriptor,
    contribution: input.request.contributionManifest,
    manifest,
    artifact: input.request.artifact,
    inventoryDigest: artifact.inventoryDigest,
    checks
  });
  assertCatalogContracts({
    artifact,
    manifest,
    descriptor: input.request.descriptor,
    checks
  });
  assertContributionRows({
    artifact,
    contribution: input.request.contributionManifest,
    descriptor: input.request.descriptor,
    catalog: manifest.publicContractCatalog,
    lock: input.request.resolvedLock,
    abgVersion,
    checks
  });
  return Object.freeze({
    kind: "verified_product_artifact",
    artifact: input.request.artifact,
    descriptor: input.request.descriptor,
    contributionManifest: input.request.contributionManifest,
    productManifest: manifest,
    resolvedLock: input.request.resolvedLock,
    productContentInventory: artifact.contentInventory,
    verificationChecks: Object.freeze(checks),
    verifiedAt: new Date().toISOString()
  });
}

export async function catalogVerify(
  requestInput: CatalogVerifyRequest,
  context: ProductIntakeContext
): Promise<CatalogVerifyResult | CatalogVerifyRefusal> {
  if (context.kind !== "product_intake") {
    return refused({
      operationId: "abg.operation.catalog.verify",
      code: "unsupported_contract",
      message: "catalog.verify requires product_intake context"
    });
  }
  try {
    const request = admitCatalogVerifyRequest(requestInput);
    const verified = await verifyArtifact({ request, context });
    return accepted({
      operationId: "abg.operation.catalog.verify",
      disposition: "verified",
      value: verified,
      provenanceRefs: [
        ...verified.descriptor.provenanceRefs,
        verified.descriptor.descriptorId,
        verified.contributionManifest.contributionId,
        verified.resolvedLock.lockId
      ]
    });
  } catch (error) {
    if (error instanceof VerificationFailure) {
      return refused({
        operationId: "abg.operation.catalog.verify",
        code: error.code,
        message: error.message,
        residualRefs: error.residualRefs
      });
    }
    return refused({
      operationId: "abg.operation.catalog.verify",
      code: "unsafe_archive",
      message: error instanceof Error ? error.message : "artifact inspection failed"
    });
  }
}
