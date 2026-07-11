// Implements: REQ-P-INSTALL-046 through REQ-P-INSTALL-048
// Implements: REQ-P-INSTALL-052
// Implements: REQ-P-INSTALL-056

import { createHash } from "node:crypto";
import { dirname, isAbsolute, join, resolve } from "node:path";

import { digest } from "../public_sdk/admission_primitives.js";
import {
  admitInstalledProductRecord,
  admitProductVerificationRecord,
  admitProductToolchainManifest,
  admitVerifiedProductArtifact
} from "../public_sdk/carrier_admission.js";
import {
  admitIJsonValue,
  canonicalizeIJson,
  digestCanonicalIJson
} from "../public_sdk/canonical.js";
import { admitInstallProductRequest } from "../public_sdk/operation_admission.js";
import type {
  InstallProductRefusal,
  InstallProductRequest,
  InstallProductResult,
  InstalledProductRecord,
  ProductCompatibilityResult,
  ProductVerificationRecord,
  ProductIntakeContext,
  ProductToolchainManifest,
  Sha256Digest,
  VerifiedProductArtifact
} from "../public_sdk/carriers.js";
import { accepted, refused } from "./outcomes.js";
import { assertResolvedProductLockCoherence } from "./resolve.js";
import { productManifestDigest } from "./verify.js";

const PRODUCT_MANIFEST_FILENAME = "product-toolchain-manifest.json";
const VERIFICATION_RESULT_FILENAME = "verification-result.json";

type InstallFailureCode = InstallProductRefusal["code"];

class InstallFailure extends Error {
  public readonly code: InstallFailureCode;
  public readonly residualRefs: readonly string[];

  public constructor(
    code: InstallFailureCode,
    message: string,
    residualRefs: readonly string[] = []
  ) {
    super(message);
    this.name = "InstallFailure";
    this.code = code;
    this.residualRefs = Object.freeze([...residualRefs]);
  }
}

export interface InstallProductAttribution {
  readonly actorRef: string;
  readonly provenanceRefs?: readonly string[];
}

interface InstallLayout {
  readonly toolchainRoot: string;
  readonly productRoot: string;
  readonly packageRoot: string;
  readonly manifestPath: string;
  readonly recordRoot: string;
  readonly descriptorRecordPath: string;
  readonly contributionRecordPath: string;
  readonly lockRecordPath: string;
  readonly verificationRecordPath: string;
}

function sha256Bytes(bytes: Uint8Array): Sha256Digest {
  return digest(
    `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    "installed artifact digest"
  );
}

function safePathSegment(value: string, label: string): string {
  if (!/^[A-Za-z0-9@._+:-]+$/u.test(value) || value === "." || value === "..") {
    throw new InstallFailure(
      "unverified",
      `${label} cannot be used as an immutable product path segment`,
      [value]
    );
  }
  return value;
}

function installLayout(
  toolchainRoot: string,
  artifact: VerifiedProductArtifact
): InstallLayout {
  const publisher = safePathSegment(artifact.descriptor.publisher, "publisher");
  const productId = safePathSegment(artifact.descriptor.productId, "productId");
  const version = safePathSegment(artifact.descriptor.version, "version");
  const artifactDigest = safePathSegment(
    artifact.artifact.expectedArtifactDigest.slice("sha256:".length),
    "artifactDigest"
  );
  const productRoot = join(toolchainRoot, "products", productId, version);
  // Verification normalizes every supplied format to product-root-relative
  // paths. Installation preserves that same root so manifest locators remain
  // valid after materialization; packageRoot names the importable payload root.
  const packageRoot = productRoot;
  const recordRoot = join(
    toolchainRoot,
    "records",
    publisher,
    productId,
    version,
    artifactDigest
  );
  return Object.freeze({
    toolchainRoot,
    productRoot,
    packageRoot,
    manifestPath: join(productRoot, PRODUCT_MANIFEST_FILENAME),
    recordRoot,
    descriptorRecordPath: join(recordRoot, "product-descriptor.json"),
    contributionRecordPath: join(recordRoot, "contribution-manifest.json"),
    lockRecordPath: join(recordRoot, "resolved-product-lock.json"),
    verificationRecordPath: join(recordRoot, VERIFICATION_RESULT_FILENAME)
  });
}

async function resolveToolchainRoot(input: {
  readonly request: InstallProductRequest;
  readonly context: ProductIntakeContext;
}): Promise<string> {
  if (input.request.toolchainRoot !== null) {
    return resolve(input.request.toolchainRoot);
  }
  if (input.request.workspaceBindingRef !== null) {
    const binding = await input.context.effects.readWorkspaceBinding(
      input.request.workspaceBindingRef
    );
    if (binding === null || !isAbsolute(binding.toolchainRoot)) {
      throw new InstallFailure(
        "toolchain_unresolved",
        `workspace binding ${input.request.workspaceBindingRef} is missing or has no absolute toolchain root`,
        [input.request.workspaceBindingRef]
      );
    }
    return resolve(binding.toolchainRoot);
  }
  const environmentRoot = input.context.effects.readEnvironment("ABG_TOOLCHAIN_ROOT");
  if (environmentRoot !== null && isAbsolute(environmentRoot)) {
    return resolve(environmentRoot);
  }
  throw new InstallFailure(
    "toolchain_unresolved",
    "no explicit, workspace-bound, or ABG_TOOLCHAIN_ROOT toolchain root is available"
  );
}

function selectedCompatibility(
  artifact: VerifiedProductArtifact
): ProductCompatibilityResult {
  const rows = artifact.resolvedLock.compatibility.filter(
    (row) => row.productId === artifact.descriptor.productId
  );
  if (rows.length !== 1 || !rows[0]?.compatible) {
    throw new InstallFailure(
      "unverified",
      `verified artifact lock has no unique compatible row for ${artifact.descriptor.productId}`,
      [artifact.resolvedLock.lockId, artifact.descriptor.productId]
    );
  }
  return rows[0];
}

function installedProductIdentity(input: {
  readonly artifact: VerifiedProductArtifact;
  readonly manifestDigest: Sha256Digest;
}): string {
  const identity = digest(
    digestCanonicalIJson({
      publisher: input.artifact.descriptor.publisher,
      productId: input.artifact.descriptor.productId,
      version: input.artifact.descriptor.version,
      artifactDigest: input.artifact.artifact.expectedArtifactDigest,
      productContentDigest: input.artifact.artifact.expectedProductContentDigest,
      manifestDigest: input.manifestDigest,
      descriptorDigest: input.artifact.descriptor.descriptorDigest,
      contributionDigest: input.artifact.contributionManifest.contributionDigest,
      resolvedLockId: input.artifact.resolvedLock.lockId,
      resolvedLockDigest: input.artifact.resolvedLock.lockDigest
    }),
    "installed product identity"
  );
  return `installed:${identity.slice("sha256:".length)}`;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function commandRefs(manifest: ProductToolchainManifest): readonly string[] {
  return Object.freeze(
    manifest.publicContractCatalog.rows
      .filter((row) => row.contractKind === "operation")
      .map((row) => row.contractId)
      .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
  );
}

function constructInstalledProductRecord(input: {
  readonly artifact: VerifiedProductArtifact;
  readonly layout: InstallLayout;
  readonly attribution: InstallProductAttribution;
}): InstalledProductRecord {
  const manifestDigest = productManifestDigest(input.artifact.productManifest);
  const compatibility = selectedCompatibility(input.artifact);
  return admitInstalledProductRecord(
    Object.freeze({
      kind: "installed_product_record",
      schemaVersion: 1,
      installedProductId: installedProductIdentity({
        artifact: input.artifact,
        manifestDigest
      }),
      publisher: input.artifact.descriptor.publisher,
      productId: input.artifact.descriptor.productId,
      packageName: input.artifact.descriptor.packageName,
      version: input.artifact.descriptor.version,
      artifactDigest: input.artifact.artifact.expectedArtifactDigest,
      productContentDigest: input.artifact.artifact.expectedProductContentDigest,
      installedRoot: input.layout.productRoot,
      productRoot: input.layout.productRoot,
      packageRoot: input.layout.packageRoot,
      manifestPath: input.layout.manifestPath,
      manifestDigest,
      descriptorId: input.artifact.descriptor.descriptorId,
      descriptorDigest: input.artifact.descriptor.descriptorDigest,
      contributionId: input.artifact.contributionManifest.contributionId,
      contributionDigest: input.artifact.contributionManifest.contributionDigest,
      compatibilityRange: input.artifact.descriptor.abgCompatibility,
      compatibility,
      commandRefs: commandRefs(input.artifact.productManifest),
      publicContractCatalogId:
        input.artifact.productManifest.publicContractCatalog.catalogId,
      publicContractCatalogVersion:
        input.artifact.productManifest.publicContractCatalog.catalogVersion,
      publicContractCatalogDigest:
        input.artifact.productManifest.publicContractCatalog.catalogDigest,
      descriptorRecordPath: input.layout.descriptorRecordPath,
      contributionRecordPath: input.layout.contributionRecordPath,
      lockRecordPath: input.layout.lockRecordPath,
      provenanceRefs: uniqueStrings([
        input.attribution.actorRef,
        ...(input.attribution.provenanceRefs ?? []),
        ...input.artifact.descriptor.provenanceRefs,
        input.artifact.descriptor.descriptorId,
        input.artifact.contributionManifest.contributionId,
        input.artifact.resolvedLock.lockId,
        `verified-at:${input.artifact.verifiedAt}`
      ])
    })
  );
}

function sameInstalledIdentity(
  left: InstalledProductRecord,
  right: InstalledProductRecord
): boolean {
  const leftWithoutProvenance = {
    ...left,
    provenanceRefs: []
  };
  const rightWithoutProvenance = {
    ...right,
    provenanceRefs: []
  };
  return (
    canonicalizeIJson(leftWithoutProvenance) ===
    canonicalizeIJson(rightWithoutProvenance)
  );
}

async function readExistingRecord(input: {
  readonly context: ProductIntakeContext;
  readonly layout: InstallLayout;
}): Promise<ProductVerificationRecord | null> {
  const value = await input.context.effects.readRecord(
    input.layout.verificationRecordPath
  );
  if (value === null) {
    return null;
  }
  try {
    return admitProductVerificationRecord(value);
  } catch (error) {
    throw new InstallFailure(
      "installed_identity_conflict",
      error instanceof Error
        ? `existing verification record is incompatible: ${error.message}`
        : "existing verification record is incompatible",
      [input.layout.verificationRecordPath]
    );
  }
}

function sameVerifiedIdentity(
  left: VerifiedProductArtifact,
  right: VerifiedProductArtifact
): boolean {
  return canonicalizeIJson({
    artifactDigest: left.artifact.expectedArtifactDigest,
    productContentDigest: left.artifact.expectedProductContentDigest,
    descriptor: left.descriptor,
    contributionManifest: left.contributionManifest,
    productManifest: left.productManifest,
    resolvedLock: left.resolvedLock,
    productContentInventory: left.productContentInventory,
    verificationChecks: left.verificationChecks
  }) === canonicalizeIJson({
    artifactDigest: right.artifact.expectedArtifactDigest,
    productContentDigest: right.artifact.expectedProductContentDigest,
    descriptor: right.descriptor,
    contributionManifest: right.contributionManifest,
    productManifest: right.productManifest,
    resolvedLock: right.resolvedLock,
    productContentInventory: right.productContentInventory,
    verificationChecks: right.verificationChecks
  });
}

type InstalledPayloadState = "absent" | "partial" | "exact";

async function installedPayloadState(input: {
  readonly context: ProductIntakeContext;
  readonly layout: InstallLayout;
  readonly artifact: VerifiedProductArtifact;
}): Promise<InstalledPayloadState> {
  let present = 0;
  for (const row of input.artifact.productContentInventory) {
    const absolutePath = join(input.layout.productRoot, row.relativePath);
    const bytes = await input.context.effects.readInstalledBytes(absolutePath);
    if (bytes === null) {
      continue;
    }
    present += 1;
    if (sha256Bytes(bytes) !== row.digest) {
      throw new InstallFailure(
        "installed_identity_conflict",
        `installed payload differs at ${row.relativePath}`,
        [absolutePath]
      );
    }
  }
  if (present === 0) {
    return "absent";
  }
  return present === input.artifact.productContentInventory.length
    ? "exact"
    : "partial";
}

async function assertDetachedRecord(input: {
  readonly context: ProductIntakeContext;
  readonly absolutePath: string;
  readonly expected: unknown;
}): Promise<boolean> {
  const value = await input.context.effects.readRecord(input.absolutePath);
  if (value === null) {
    return false;
  }
  if (canonicalizeIJson(value) !== canonicalizeIJson(input.expected)) {
    throw new InstallFailure(
      "installed_identity_conflict",
      `detached verification record differs at ${input.absolutePath}`,
      [input.absolutePath]
    );
  }
  return true;
}

type DetachedRecordState = "absent" | "partial" | "exact";

async function detachedRecordState(input: {
  readonly context: ProductIntakeContext;
  readonly artifact: VerifiedProductArtifact;
  readonly layout: InstallLayout;
}): Promise<DetachedRecordState> {
  const results = await Promise.all([
    assertDetachedRecord({
      context: input.context,
      absolutePath: input.layout.descriptorRecordPath,
      expected: input.artifact.descriptor
    }),
    assertDetachedRecord({
      context: input.context,
      absolutePath: input.layout.contributionRecordPath,
      expected: input.artifact.contributionManifest
    }),
    assertDetachedRecord({
      context: input.context,
      absolutePath: input.layout.lockRecordPath,
      expected: input.artifact.resolvedLock
    })
  ]);
  const present = results.filter(Boolean).length;
  if (present === 0) {
    return "absent";
  }
  return present === results.length ? "exact" : "partial";
}

async function assertInstalledManifest(input: {
  readonly context: ProductIntakeContext;
  readonly layout: InstallLayout;
  readonly expected: ProductToolchainManifest;
}): Promise<boolean> {
  const value = await input.context.effects.readRecord(input.layout.manifestPath);
  if (value === null) {
    return false;
  }
  let manifest: ProductToolchainManifest;
  try {
    manifest = admitProductToolchainManifest(value);
  } catch (error) {
    throw new InstallFailure(
      "installed_identity_conflict",
      error instanceof Error
        ? `existing product manifest is incompatible: ${error.message}`
        : "existing product manifest is incompatible",
      [input.layout.manifestPath]
    );
  }
  if (canonicalizeIJson(manifest) !== canonicalizeIJson(input.expected)) {
    throw new InstallFailure(
      "installed_identity_conflict",
      "existing product/version location carries different product content",
      [input.layout.productRoot]
    );
  }
  return true;
}

async function writeDetachedRecords(input: {
  readonly context: ProductIntakeContext;
  readonly artifact: VerifiedProductArtifact;
  readonly record: InstalledProductRecord;
}): Promise<void> {
  await input.context.effects.writeRecord(
    input.record.descriptorRecordPath,
    admitIJsonValue(input.artifact.descriptor)
  );
  await input.context.effects.writeRecord(
    input.record.contributionRecordPath,
    admitIJsonValue(input.artifact.contributionManifest)
  );
  await input.context.effects.writeRecord(
    input.record.lockRecordPath,
    admitIJsonValue(input.artifact.resolvedLock)
  );
  const verificationRecordPath = join(
    dirname(input.record.descriptorRecordPath),
    VERIFICATION_RESULT_FILENAME
  );
  await input.context.effects.writeRecord(
    verificationRecordPath,
    admitIJsonValue(
      admitProductVerificationRecord({
        kind: "product_verification_record",
        schemaVersion: 1,
        disposition: "verified",
        verifiedArtifact: input.artifact,
        installedProductRecord: input.record
      })
    )
  );
}

async function installExact(input: {
  readonly request: InstallProductRequest;
  readonly context: ProductIntakeContext;
  readonly attribution: InstallProductAttribution;
}): Promise<InstallProductResult> {
  const artifact = admitVerifiedProductArtifact(input.request.verifiedArtifact);
  try {
    assertResolvedProductLockCoherence(artifact.resolvedLock);
  } catch (error) {
    throw new InstallFailure(
      "unverified",
      error instanceof Error ? error.message : "verified lock coherence failed",
      [artifact.resolvedLock.lockId]
    );
  }
  let reopenedArtifactBytes: Uint8Array;
  try {
    reopenedArtifactBytes = await input.context.effects.readArtifactBytes(
      artifact.artifact.artifactPath
    );
  } catch (error) {
    throw new InstallFailure(
      "unverified",
      error instanceof Error
        ? `verified artifact cannot be reopened: ${error.message}`
        : "verified artifact cannot be reopened",
      [artifact.artifact.artifactPath]
    );
  }
  const reopenedArtifactDigest = sha256Bytes(reopenedArtifactBytes);
  if (reopenedArtifactDigest !== artifact.artifact.expectedArtifactDigest) {
    throw new InstallFailure(
      "unverified",
      "supplied artifact bytes changed after verification",
      [artifact.artifact.artifactPath]
    );
  }
  const toolchainRoot = await resolveToolchainRoot({
    request: input.request,
    context: input.context
  });
  const layout = installLayout(toolchainRoot, artifact);
  const expectedRecord = constructInstalledProductRecord({
    artifact,
    layout,
    attribution: input.attribution
  });
  const existingManifest = await assertInstalledManifest({
    context: input.context,
    layout,
    expected: artifact.productManifest
  });
  const existingVerification = await readExistingRecord({
    context: input.context,
    layout
  });
  const existingPayload = await installedPayloadState({
    context: input.context,
    layout,
    artifact
  });
  const existingDetachedRecords = await detachedRecordState({
    context: input.context,
    artifact,
    layout
  });
  if (
    existingManifest ||
    existingVerification !== null ||
    existingPayload !== "absent" ||
    existingDetachedRecords !== "absent"
  ) {
    if (
      !existingManifest ||
      existingVerification === null ||
      existingPayload !== "exact" ||
      existingDetachedRecords !== "exact" ||
      !sameInstalledIdentity(
        existingVerification.installedProductRecord,
        expectedRecord
      ) ||
      !sameVerifiedIdentity(existingVerification.verifiedArtifact, artifact)
    ) {
      throw new InstallFailure(
        "installed_identity_conflict",
        "existing immutable product state is incomplete or differs from the verified artifact",
        [layout.productRoot, layout.verificationRecordPath]
      );
    }
    return accepted({
      operationId: "abg.operation.install.install",
      disposition: "already_installed_exact",
      value: existingVerification.installedProductRecord,
      provenanceRefs: existingVerification.installedProductRecord.provenanceRefs
    });
  }

  await input.context.effects.materializeVerifiedArtifact(artifact, layout.productRoot);
  if (
    !(await assertInstalledManifest({
      context: input.context,
      layout,
      expected: artifact.productManifest
    }))
  ) {
    throw new InstallFailure(
      "materialization_failure",
      "materializer did not publish the verified product manifest",
      [layout.manifestPath]
    );
  }
  const materializedPayload = await installedPayloadState({
    context: input.context,
    layout,
    artifact
  });
  if (materializedPayload !== "exact") {
    throw new InstallFailure(
      "materialization_failure",
      "materializer did not publish the complete verified product inventory",
      [layout.productRoot]
    );
  }
  await writeDetachedRecords({
    context: input.context,
    artifact,
    record: expectedRecord
  });
  const persistedVerification = await readExistingRecord({
    context: input.context,
    layout
  });
  if (
    persistedVerification === null ||
    !sameInstalledIdentity(
      persistedVerification.installedProductRecord,
      expectedRecord
    ) ||
    !sameVerifiedIdentity(persistedVerification.verifiedArtifact, artifact) ||
    (await detachedRecordState({ context: input.context, artifact, layout })) !==
      "exact"
  ) {
    throw new InstallFailure(
      "materialization_failure",
      "installer did not persist the complete verification record set",
      [layout.verificationRecordPath]
    );
  }
  return accepted({
    operationId: "abg.operation.install.install",
    disposition: "installed",
    value: expectedRecord,
    provenanceRefs: expectedRecord.provenanceRefs
  });
}

export async function installProduct(
  requestInput: InstallProductRequest,
  context: ProductIntakeContext,
  attribution: InstallProductAttribution
): Promise<InstallProductResult | InstallProductRefusal> {
  if (attribution.actorRef.trim().length === 0) {
    return refused({
      operationId: "abg.operation.install.install",
      code: "unverified",
      message: "install.install requires a non-empty actorRef"
    });
  }
  if (context.kind !== "product_intake") {
    return refused({
      operationId: "abg.operation.install.install",
      code: "unverified",
      message: "install.install requires product_intake context"
    });
  }
  try {
    const request = admitInstallProductRequest(requestInput);
    return await installExact({ request, context, attribution });
  } catch (error) {
    if (error instanceof InstallFailure) {
      return refused({
        operationId: "abg.operation.install.install",
        code: error.code,
        message: error.message,
        residualRefs: error.residualRefs,
        provenanceRefs: [attribution.actorRef]
      });
    }
    return refused({
      operationId: "abg.operation.install.install",
      code: "materialization_failure",
      message: error instanceof Error ? error.message : "product installation failed",
      provenanceRefs: [attribution.actorRef]
    });
  }
}
