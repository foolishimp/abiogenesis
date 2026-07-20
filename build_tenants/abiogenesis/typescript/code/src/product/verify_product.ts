import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isAbsolute, posix } from "node:path";

import { canonicalJson, type JsonValue } from "./canonical_json.js";
import type {
  ProductVerificationRefusal,
  ProductVerificationRefusalCode,
  ProductVerificationResult,
  VerifyProductRequest,
} from "./contracts.js";
import {
  isSha256Digest,
  payloadInventoryDigest,
  sha256Bytes,
  sha256Canonical,
  type PayloadInventoryRow,
  type Sha256Digest,
} from "./digests.js";

type JsonRecord = { readonly [key: string]: JsonValue };

export interface ProductManifestView {
  readonly kind: "abg_product_toolchain_manifest";
  readonly schemaVersion: "5.0.0";
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly productContentDigest: Sha256Digest;
  readonly productRelativeLocators: readonly string[];
  readonly publicContractCatalog: JsonRecord & {
    readonly schemaVersion: string;
    readonly catalogId: string;
    readonly catalogVersion: string;
    readonly catalogDigest: Sha256Digest;
    readonly catalogSchemaPath: string;
    readonly catalogSchemaDigest: Sha256Digest;
    readonly rows: readonly JsonRecord[];
  };
}

interface PackageJsonView {
  readonly name: string;
  readonly version: string;
  readonly exports: Readonly<Record<string, unknown>>;
}

const TAR_MAX_BUFFER = 64 * 1024 * 1024;

function refusal(
  request: VerifyProductRequest,
  code: ProductVerificationRefusalCode,
  message: string,
): ProductVerificationRefusal {
  return {
    kind: "product_verification_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
    artifactRef: request.artifactRef,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeProductPath(value: string): boolean {
  if (value.length === 0 || isAbsolute(value) || value.includes("\\")) {
    return false;
  }
  const normalized = posix.normalize(value);
  return normalized === value && normalized !== ".." && !normalized.startsWith("../");
}

export function parseProductManifest(value: unknown): ProductManifestView | null {
  if (!isRecord(value) || !isRecord(value.publicContractCatalog)) {
    return null;
  }
  const catalog = value.publicContractCatalog;
  if (
    value.kind !== "abg_product_toolchain_manifest" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.productId !== "string" ||
    typeof value.packageName !== "string" ||
    typeof value.packageVersion !== "string" ||
    !isSha256Digest(value.productContentDigest) ||
    !Array.isArray(value.productRelativeLocators) ||
    !value.productRelativeLocators.every((entry) => typeof entry === "string") ||
    typeof catalog.schemaVersion !== "string" ||
    typeof catalog.catalogId !== "string" ||
    typeof catalog.catalogVersion !== "string" ||
    !isSha256Digest(catalog.catalogDigest) ||
    typeof catalog.catalogSchemaPath !== "string" ||
    !isSha256Digest(catalog.catalogSchemaDigest) ||
    !Array.isArray(catalog.rows) ||
    !catalog.rows.every(isRecord)
  ) {
    return null;
  }
  return value as unknown as ProductManifestView;
}

function parsePackageJson(value: unknown): PackageJsonView | null {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.version !== "string" ||
    !isRecord(value.exports)
  ) {
    return null;
  }
  return {
    name: value.name,
    version: value.version,
    exports: value.exports,
  };
}

function catalogWithoutDigest(catalog: ProductManifestView["publicContractCatalog"]): JsonRecord {
  const { catalogDigest: _catalogDigest, ...withoutDigest } = catalog;
  return withoutDigest;
}

function readAssetLocator(row: JsonRecord): { readonly path: string; readonly digest: Sha256Digest } | null {
  const locator = row.assetLocator;
  if (!isRecord(locator)) {
    return null;
  }
  if (typeof locator.path !== "string" || !isSha256Digest(locator.contentDigest)) {
    return null;
  }
  return { path: locator.path, digest: locator.contentDigest };
}

function readNativeLocator(
  row: JsonRecord,
): { readonly packageExportPath: string; readonly declarationPath: string } | null {
  const locator = row.nativeTypedLocator;
  if (!isRecord(locator)) {
    return null;
  }
  if (
    typeof locator.packageExportPath !== "string" ||
    typeof locator.declarationPath !== "string"
  ) {
    return null;
  }
  return {
    packageExportPath: locator.packageExportPath,
    declarationPath: locator.declarationPath,
  };
}

function listArchiveEntries(artifactPath: string): Promise<readonly string[]> {
  return new Promise((resolve, reject) => {
    execFile(
      "tar",
      ["-tzf", artifactPath],
      { encoding: "utf8", maxBuffer: TAR_MAX_BUFFER },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout.split("\n").filter((entry) => entry.length > 0));
      },
    );
  });
}

function readArchiveEntry(artifactPath: string, entry: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    execFile(
      "tar",
      ["-xOzf", artifactPath, entry],
      { encoding: "buffer", maxBuffer: TAR_MAX_BUFFER },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(new Error(Buffer.isBuffer(stderr) ? stderr.toString("utf8") : error.message));
          return;
        }
        resolve(Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout));
      },
    );
  });
}

function parseJsonBytes(bytes: Uint8Array): unknown {
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function verifyProduct(
  request: VerifyProductRequest,
): Promise<ProductVerificationResult> {
  let artifactBytes: Uint8Array;
  let archiveEntries: readonly string[];
  try {
    artifactBytes = await readFile(request.artifactPath);
    archiveEntries = await listArchiveEntries(request.artifactPath);
  } catch (error) {
    return refusal(request, "artifact_unreadable", String(error));
  }
  const artifactDigest = sha256Bytes(artifactBytes);
  if (
    !isSha256Digest(request.expectedArtifactDigest) ||
    artifactDigest !== request.expectedArtifactDigest
  ) {
    return refusal(
      request,
      "artifact_digest_mismatch",
      "artifact bytes differ from the externally expected artifact identity",
    );
  }

  if (
    archiveEntries.length === 0 ||
    archiveEntries.some(
      (entry) =>
        !entry.startsWith("package/") ||
        entry.includes("\\") ||
        entry.split("/").includes(".."),
    )
  ) {
    return refusal(request, "unsafe_locator", "archive contains a non-file or path outside package/");
  }

  let manifestUnknown: unknown;
  try {
    manifestUnknown = parseJsonBytes(
      await readArchiveEntry(request.artifactPath, "package/product-toolchain-manifest.json"),
    );
  } catch (error) {
    return refusal(request, "manifest_unreadable", String(error));
  }

  const manifest = parseProductManifest(manifestUnknown);
  if (manifest === null) {
    return refusal(request, "manifest_malformed", "product manifest shape is invalid");
  }
  const manifestDigest = sha256Canonical(manifest as unknown as JsonValue);
  if (
    !isSha256Digest(request.expectedManifestDigest) ||
    manifestDigest !== request.expectedManifestDigest
  ) {
    return refusal(
      request,
      "manifest_digest_mismatch",
      "product manifest differs from the externally expected manifest identity",
    );
  }

  if (
    manifest.productId !== request.expectedProductId ||
    manifest.packageName !== request.expectedPackageName ||
    manifest.packageVersion !== request.expectedPackageVersion
  ) {
    return refusal(request, "identity_mismatch", "product or package identity does not match the request");
  }

  const locators = [...manifest.productRelativeLocators];
  if (
    locators.some((locator) => !isSafeProductPath(locator)) ||
    new Set(locators).size !== locators.length
  ) {
    return refusal(request, "unsafe_locator", "payload inventory contains an unsafe or duplicate path");
  }

  const expectedArchiveEntries = [
    "package/product-toolchain-manifest.json",
    ...locators.map((locator) => `package/${locator}`),
  ].sort();
  const archiveFileEntries = archiveEntries.filter((entry) => !entry.endsWith("/")).sort();
  if (canonicalJson(archiveFileEntries) !== canonicalJson(expectedArchiveEntries)) {
    return refusal(request, "payload_inventory_mismatch", "archive file set differs from the manifest");
  }

  let packageJson: PackageJsonView | null;
  try {
    packageJson = parsePackageJson(
      parseJsonBytes(await readArchiveEntry(request.artifactPath, "package/package.json")),
    );
  } catch (error) {
    return refusal(request, "manifest_malformed", String(error));
  }
  if (
    packageJson === null ||
    packageJson.name !== manifest.packageName ||
    packageJson.version !== manifest.packageVersion
  ) {
    return refusal(request, "identity_mismatch", "package metadata and product manifest disagree");
  }

  const inventory: PayloadInventoryRow[] = [];
  try {
    for (const locator of [...locators].sort()) {
      inventory.push({
        path: locator,
        sha256: sha256Bytes(await readArchiveEntry(request.artifactPath, `package/${locator}`)),
      });
    }
  } catch (error) {
    return refusal(request, "payload_unreadable", String(error));
  }
  const productContentDigest = payloadInventoryDigest(inventory);
  if (
    !isSha256Digest(request.expectedProductContentDigest) ||
    manifest.productContentDigest !== request.expectedProductContentDigest ||
    productContentDigest !== request.expectedProductContentDigest
  ) {
    return refusal(request, "product_content_mismatch", "packed payload digest differs from the manifest");
  }

  if (!isSafeProductPath(manifest.publicContractCatalog.catalogSchemaPath)) {
    return refusal(request, "unsafe_locator", "catalog schema path is unsafe");
  }
  if (
    sha256Canonical(catalogWithoutDigest(manifest.publicContractCatalog)) !==
    manifest.publicContractCatalog.catalogDigest
  ) {
    return refusal(request, "catalog_mismatch", "public contract catalog digest is invalid");
  }

  const contractIds = new Set<string>();
  try {
    const schemaBytes = await readArchiveEntry(
      request.artifactPath,
      `package/${manifest.publicContractCatalog.catalogSchemaPath}`,
    );
    if (sha256Bytes(schemaBytes) !== manifest.publicContractCatalog.catalogSchemaDigest) {
      return refusal(request, "catalog_mismatch", "catalog schema digest is invalid");
    }

    for (const row of manifest.publicContractCatalog.rows) {
      if (
        typeof row.contractId !== "string" ||
        contractIds.has(row.contractId) ||
        !isSha256Digest(row.contractDigest)
      ) {
        return refusal(request, "catalog_mismatch", "catalog row identity or digest is invalid");
      }
      contractIds.add(row.contractId);

      const assetLocator = readAssetLocator(row);
      if (assetLocator !== null) {
        if (!isSafeProductPath(assetLocator.path)) {
          return refusal(request, "unsafe_locator", "contract asset path is unsafe");
        }
        const assetDigest = sha256Bytes(
          await readArchiveEntry(request.artifactPath, `package/${assetLocator.path}`),
        );
        if (assetDigest !== assetLocator.digest || assetDigest !== row.contractDigest) {
          return refusal(
            request,
            "contract_asset_mismatch",
            `contract asset digest is invalid: ${assetLocator.path}`,
          );
        }
      }

      const nativeLocator = readNativeLocator(row);
      if (nativeLocator !== null) {
        if (
          !isSafeProductPath(nativeLocator.declarationPath) ||
          !(nativeLocator.packageExportPath in packageJson.exports)
        ) {
          return refusal(request, "catalog_mismatch", "native typed locator is invalid");
        }
        const declarationDigest = sha256Bytes(
          await readArchiveEntry(request.artifactPath, `package/${nativeLocator.declarationPath}`),
        );
        const nativeDigest = sha256Canonical([
          {
            packageExportPath: nativeLocator.packageExportPath,
            declarationPath: nativeLocator.declarationPath,
            declarationDigest,
          },
        ]);
        if (nativeDigest !== row.contractDigest) {
          return refusal(request, "catalog_mismatch", "native typed contract digest is invalid");
        }
      }

      if (assetLocator === null && nativeLocator === null) {
        return refusal(request, "catalog_mismatch", "catalog row has no contract locator");
      }
    }
  } catch (error) {
    return refusal(request, "contract_asset_mismatch", String(error));
  }

  return {
    kind: "verified_product_artifact",
    schemaVersion: "5.0.0",
    disposition: "verified",
    artifactRef: request.artifactRef,
    artifactDigest,
    artifactByteLength: artifactBytes.byteLength,
    productId: manifest.productId,
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
    productContentDigest,
    manifestDigest,
    catalogId: manifest.publicContractCatalog.catalogId,
    catalogDigest: manifest.publicContractCatalog.catalogDigest,
    checkedPayloadFiles: inventory.length,
  };
}
