import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isAbsolute, posix } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type {
  ProductAssetLocator,
  ProductContributionManifest,
  ProductContributionManifestRow,
  ProductDeclaredDependency,
  ProductModulePublicationBinding,
  ProductNativeTypedLocator,
  ProductPublicContract,
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
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

type JsonRecord = { readonly [key: string]: JsonValue };

export interface ProductManifestView {
  readonly kind: "abg_product_toolchain_manifest";
  readonly schemaVersion: "5.0.0";
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly productContentDigest: Sha256Digest;
  readonly productRelativeLocators: readonly string[];
  readonly descriptorRef: string;
  readonly publisherNamespace: string;
  readonly contributionManifestRef: string;
  readonly contributionManifestDigest: Sha256Digest;
  readonly contributionManifest: ProductContributionManifest;
  readonly compatibilityRefs: readonly string[];
  readonly declaredDependencies: readonly ProductDeclaredDependency[];
  readonly provenanceRef: string;
  readonly declaredCapabilityRefs: readonly string[];
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

function packageExportDeclarationPath(value: unknown): string | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }
  const types = (value as Readonly<Record<string, unknown>>).types;
  if (typeof types !== "string" || !types.startsWith("./")) return null;
  return posix.normalize(types.slice(2));
}

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

function isNonblankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUniqueStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) &&
    value.every(isNonblankString) &&
    new Set(value).size === value.length;
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
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
    isNonblankString(value.productId) &&
    isNonblankString(value.packageVersion) &&
    isNonblankString(value.compatibilityRef) &&
    isUniqueStringArray(value.requiredContractRefs) &&
    isUniqueStringArray(value.requiredCapabilityRefs);
}

function isContributionManifestRow(
  value: unknown,
): value is ProductContributionManifestRow {
  return isRecord(value) &&
    hasExactKeys(value, [
      "compatibilityRefs",
      "declarationOrContractRef",
      "handle",
      "kind",
      "moduleRef",
      "owningProductId",
      "programMembershipRefs",
      "provenanceRef",
      "readinessPrerequisiteRefs",
    ]) &&
    isNonblankString(value.moduleRef) &&
    isNonblankString(value.handle) &&
    (
      value.kind === "graph_function" ||
      value.kind === "node_type" ||
      value.kind === "overlay"
    ) &&
    isNonblankString(value.declarationOrContractRef) &&
    isNonblankString(value.owningProductId) &&
    isUniqueStringArray(value.programMembershipRefs) &&
    isUniqueStringArray(value.compatibilityRefs) &&
    isNonblankString(value.provenanceRef) &&
    isUniqueStringArray(value.readinessPrerequisiteRefs);
}

function isPublicationBinding(
  value: unknown,
): value is ProductModulePublicationBinding {
  return isRecord(value) &&
    hasExactKeys(value, ["moduleRef", "publicationDigest"]) &&
    isNonblankString(value.moduleRef) &&
    isSha256Digest(value.publicationDigest);
}

export function isProductContributionManifest(
  value: unknown,
): value is ProductContributionManifest {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "contributionManifestRef",
      "descriptorRef",
      "kind",
      "productContentDigest",
      "productId",
      "productVersion",
      "publicationBindings",
      "publicContractCatalogDigest",
      "publicContractCatalogId",
      "rows",
      "schemaVersion",
    ]) ||
    value.kind !== "product_contribution_manifest" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonblankString(value.contributionManifestRef) ||
    !isNonblankString(value.productId) ||
    !isNonblankString(value.productVersion) ||
    !isNonblankString(value.descriptorRef) ||
    !isSha256Digest(value.productContentDigest) ||
    !isNonblankString(value.publicContractCatalogId) ||
    !isSha256Digest(value.publicContractCatalogDigest) ||
    !Array.isArray(value.publicationBindings) ||
    !value.publicationBindings.every(isPublicationBinding) ||
    !Array.isArray(value.rows) ||
    !value.rows.every(isContributionManifestRow)
  ) {
    return false;
  }
  const rowKeys = value.rows.map((row) => `${row.moduleRef}\0${row.handle}`);
  const publicationModuleRefs = value.publicationBindings.map(
    (binding) => binding.moduleRef,
  );
  const rowModuleRefs = [...new Set(value.rows.map((row) => row.moduleRef))];
  return new Set(rowKeys).size === rowKeys.length &&
    new Set(publicationModuleRefs).size === publicationModuleRefs.length &&
    publicationModuleRefs.length === rowModuleRefs.length &&
    publicationModuleRefs.every((moduleRef) => rowModuleRefs.includes(moduleRef));
}

function isSafeProductPath(value: string): boolean {
  if (value.length === 0 || isAbsolute(value) || value.includes("\\")) {
    return false;
  }
  const normalized = posix.normalize(value);
  return normalized === value && normalized !== ".." && !normalized.startsWith("../");
}

export function parseProductManifest(value: unknown): ProductManifestView | null {
  if (
    !isRecord(value) ||
    !isRecord(value.publicContractCatalog) ||
    !isProductContributionManifest(value.contributionManifest)
  ) {
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
    !isNonblankString(value.descriptorRef) ||
    !isNonblankString(value.publisherNamespace) ||
    !isNonblankString(value.contributionManifestRef) ||
    !isSha256Digest(value.contributionManifestDigest) ||
    !isUniqueStringArray(value.compatibilityRefs) ||
    !Array.isArray(value.declaredDependencies) ||
    !value.declaredDependencies.every(isDeclaredDependency) ||
    !isNonblankString(value.provenanceRef) ||
    !isUniqueStringArray(value.declaredCapabilityRefs) ||
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
  const dependencies = value.declaredDependencies as readonly ProductDeclaredDependency[];
  const contributionManifest = value.contributionManifest;
  if (
    dependencies.some((dependency) => dependency.productId === value.productId) ||
    new Set(dependencies.map((dependency) => dependency.productId)).size !==
      dependencies.length ||
    contributionManifest.contributionManifestRef !==
      value.contributionManifestRef ||
    contributionManifest.productId !== value.productId ||
    contributionManifest.productVersion !== value.packageVersion ||
    contributionManifest.descriptorRef !== value.descriptorRef ||
    contributionManifest.productContentDigest !== value.productContentDigest ||
    contributionManifest.publicContractCatalogId !== catalog.catalogId ||
    contributionManifest.publicContractCatalogDigest !== catalog.catalogDigest ||
    contributionManifest.rows.some(
      (row) => row.owningProductId !== value.productId,
    )
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

function readAssetLocator(row: JsonRecord): ProductAssetLocator | null {
  const locator = row.assetLocator;
  if (!isRecord(locator)) {
    return null;
  }
  const allowedKeys = locator.definitionRef === undefined
    ? ["contentDigest", "mediaType", "path", "schemaVersion"]
    : ["contentDigest", "definitionRef", "mediaType", "path", "schemaVersion"];
  if (
    !hasExactKeys(locator, allowedKeys) ||
    !isNonblankString(locator.path) ||
    !isNonblankString(locator.mediaType) ||
    !isNonblankString(locator.schemaVersion) ||
    !isSha256Digest(locator.contentDigest) ||
    (
      locator.definitionRef !== undefined &&
      !isNonblankString(locator.definitionRef)
    )
  ) {
    return null;
  }
  return {
    path: locator.path,
    mediaType: locator.mediaType,
    schemaVersion: locator.schemaVersion,
    contentDigest: locator.contentDigest,
    ...(locator.definitionRef === undefined
      ? {}
      : { definitionRef: locator.definitionRef }),
  };
}

function readNativeLocator(
  row: JsonRecord,
): ProductNativeTypedLocator | null {
  const locator = row.nativeTypedLocator;
  if (!isRecord(locator)) {
    return null;
  }
  if (
    !hasExactKeys(locator, [
      "declarationPath",
      "exportedSymbols",
      "namedSymbol",
      "packageExportPath",
      "packageName",
    ]) ||
    !isNonblankString(locator.packageName) ||
    !isNonblankString(locator.packageExportPath) ||
    !isNonblankString(locator.namedSymbol) ||
    !isUniqueStringArray(locator.exportedSymbols) ||
    !locator.exportedSymbols.includes(locator.namedSymbol) ||
    !isNonblankString(locator.declarationPath)
  ) {
    return null;
  }
  return {
    packageName: locator.packageName,
    packageExportPath: locator.packageExportPath,
    namedSymbol: locator.namedSymbol,
    exportedSymbols: [...locator.exportedSymbols],
    declarationPath: locator.declarationPath,
  };
}

export function parseProductPublicContract(
  value: unknown,
  productId: string,
): ProductPublicContract | null {
  if (!isRecord(value)) return null;
  const row = value as JsonRecord;
  if (
    !isNonblankString(row.contractId) ||
    !isNonblankString(row.contractVersion) ||
    !isSha256Digest(row.contractDigest) ||
    !isNonblankString(row.contractKind) ||
    row.owningProduct !== productId ||
    !isUniqueStringArray(row.requirementAuthorityRefs) ||
    row.requirementAuthorityRefs.length === 0 ||
    !isUniqueStringArray(row.capabilityIdentities) ||
    row.capabilityIdentities.length === 0
  ) {
    return null;
  }
  const nativeTypedLocator = readNativeLocator(row);
  const assetLocator = readAssetLocator(row);
  if (nativeTypedLocator === null && assetLocator === null) return null;
  const allowedKeys = [
    "capabilityIdentities",
    "contractDigest",
    "contractId",
    "contractKind",
    "contractVersion",
    "owningProduct",
    "requirementAuthorityRefs",
    ...(nativeTypedLocator === null ? [] : ["nativeTypedLocator"]),
    ...(assetLocator === null ? [] : ["assetLocator"]),
  ];
  if (!hasExactKeys(row, allowedKeys)) return null;
  return {
    contractId: row.contractId,
    contractVersion: row.contractVersion,
    contractDigest: row.contractDigest,
    contractKind: row.contractKind,
    owningProduct: productId,
    requirementAuthorityRefs: [...row.requirementAuthorityRefs],
    capabilityIdentities: [...row.capabilityIdentities],
    ...(nativeTypedLocator === null ? {} : { nativeTypedLocator }),
    ...(assetLocator === null ? {} : { assetLocator }),
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

function stripDeclarationComments(source: string): string {
  let result = "";
  let quote: "'" | "\"" | "`" | null = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!;
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n" || character === "\r") {
        lineComment = false;
        result += character;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      } else if (character === "\n" || character === "\r") {
        result += character;
      }
      continue;
    }
    if (quote !== null) {
      result += character;
      if (character === "\\") {
        if (next !== undefined) {
          result += next;
          index += 1;
        }
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === "'" || character === "\"" || character === "`") {
      quote = character;
      result += character;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    result += character;
  }
  return result;
}

function declarationExportSymbols(bytes: Uint8Array): ReadonlySet<string> {
  const source = stripDeclarationComments(new TextDecoder().decode(bytes));
  const symbols = new Set<string>();
  for (const match of source.matchAll(
    /\bexport\s+(?:type\s+)?\{([^}]*)\}/gu,
  )) {
    for (const rawEntry of match[1]!.split(",")) {
      const entry = rawEntry.trim().replace(/^type\s+/u, "");
      const parts = entry.split(/\s+as\s+/u);
      const symbol = (parts[1] ?? parts[0])?.trim() ?? "";
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(symbol)) {
        symbols.add(symbol);
      }
    }
  }
  for (const match of source.matchAll(
    /\bexport\s+(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum|namespace)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gu,
  )) {
    symbols.add(match[1]!);
  }
  return symbols;
}

function assetDefinitionExists(
  bytes: Uint8Array,
  definitionRef: string,
): boolean {
  if (!definitionRef.startsWith("#")) return false;
  let current: unknown;
  let pointer: string;
  try {
    current = parseJsonBytes(bytes);
    pointer = decodeURIComponent(definitionRef.slice(1));
  } catch {
    return false;
  }
  if (pointer.length === 0) return true;
  if (!pointer.startsWith("/")) return false;
  for (const encodedSegment of pointer.slice(1).split("/")) {
    const segment = encodedSegment.replace(/~1/gu, "/").replace(/~0/gu, "~");
    if (
      typeof current !== "object" ||
      current === null ||
      Array.isArray(current) ||
      !Object.hasOwn(current, segment)
    ) {
      return false;
    }
    current = (current as Readonly<Record<string, unknown>>)[segment];
  }
  return true;
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
    sha256Canonical(manifest.contributionManifest as unknown as JsonValue) !==
      manifest.contributionManifestDigest
  ) {
    return refusal(
      request,
      "contribution_mismatch",
      "Product contribution manifest digest is invalid",
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
  const publicCapabilityRefs = new Set<string>();
  const publicContracts: ProductPublicContract[] = [];
  try {
    const schemaBytes = await readArchiveEntry(
      request.artifactPath,
      `package/${manifest.publicContractCatalog.catalogSchemaPath}`,
    );
    if (sha256Bytes(schemaBytes) !== manifest.publicContractCatalog.catalogSchemaDigest) {
      return refusal(request, "catalog_mismatch", "catalog schema digest is invalid");
    }

    for (const row of manifest.publicContractCatalog.rows) {
      const contract = parseProductPublicContract(row, manifest.productId);
      if (
        contract === null ||
        contractIds.has(contract.contractId)
      ) {
        return refusal(
          request,
          "catalog_mismatch",
          "catalog row authority, identity, or locator is incomplete",
        );
      }
      contractIds.add(contract.contractId);
      publicContracts.push(contract);
      for (const capabilityRef of contract.capabilityIdentities) {
        publicCapabilityRefs.add(capabilityRef);
      }

      let assetDigest: Sha256Digest | null = null;
      const assetLocator = contract.assetLocator ?? null;
      if (assetLocator !== null) {
        if (!isSafeProductPath(assetLocator.path)) {
          return refusal(request, "unsafe_locator", "contract asset path is unsafe");
        }
        const assetBytes = await readArchiveEntry(
          request.artifactPath,
          `package/${assetLocator.path}`,
        );
        assetDigest = sha256Bytes(assetBytes);
        if (assetDigest !== assetLocator.contentDigest) {
          return refusal(
            request,
            "contract_asset_mismatch",
            `contract asset digest is invalid: ${assetLocator.path}`,
          );
        }
        if (
          assetLocator.definitionRef !== undefined &&
          !assetDefinitionExists(assetBytes, assetLocator.definitionRef)
        ) {
          return refusal(
            request,
            "contract_asset_mismatch",
            `contract asset definition is absent: ${assetLocator.definitionRef}`,
          );
        }
      }

      let nativeDigest: Sha256Digest | null = null;
      const nativeLocator = contract.nativeTypedLocator ?? null;
      if (nativeLocator !== null) {
        if (
          !isSafeProductPath(nativeLocator.declarationPath) ||
          nativeLocator.packageName !== manifest.packageName ||
          !(nativeLocator.packageExportPath in packageJson.exports) ||
          packageExportDeclarationPath(
            packageJson.exports[nativeLocator.packageExportPath],
          ) !== nativeLocator.declarationPath
        ) {
          return refusal(request, "catalog_mismatch", "native typed locator is invalid");
        }
        const declarationBytes = await readArchiveEntry(
          request.artifactPath,
          `package/${nativeLocator.declarationPath}`,
        );
        const declarationDigest = sha256Bytes(declarationBytes);
        const exportedSymbols = declarationExportSymbols(declarationBytes);
        if (
          !exportedSymbols.has(nativeLocator.namedSymbol) ||
          nativeLocator.exportedSymbols.some(
            (symbol) => !exportedSymbols.has(symbol),
          )
        ) {
          return refusal(
            request,
            "catalog_mismatch",
            "native typed locator names an undeclared export",
          );
        }
        nativeDigest = sha256Canonical([
          {
            packageExportPath: nativeLocator.packageExportPath,
            declarationPath: nativeLocator.declarationPath,
            declarationDigest,
          },
        ]);
      }

      const expectedContractDigest = assetDigest ?? nativeDigest;
      if (expectedContractDigest !== contract.contractDigest) {
        return refusal(
          request,
          "catalog_mismatch",
          "public contract locator digest is invalid",
        );
      }
    }
  } catch (error) {
    return refusal(request, "contract_asset_mismatch", String(error));
  }

  return deepFreeze({
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
    descriptorRef: manifest.descriptorRef,
    publisherNamespace: manifest.publisherNamespace,
    contributionManifestRef: manifest.contributionManifestRef,
    contributionManifestDigest: manifest.contributionManifestDigest,
    contributionManifest: {
      ...manifest.contributionManifest,
      publicationBindings:
        manifest.contributionManifest.publicationBindings.map((binding) => ({
          ...binding,
        })),
      rows: manifest.contributionManifest.rows.map((row) => ({
        ...row,
        programMembershipRefs: [...row.programMembershipRefs],
        compatibilityRefs: [...row.compatibilityRefs],
        readinessPrerequisiteRefs: [...row.readinessPrerequisiteRefs],
      })),
    },
    compatibilityRefs: [...manifest.compatibilityRefs],
    declaredDependencies: manifest.declaredDependencies.map((dependency) => ({
      ...dependency,
      requiredContractRefs: [...dependency.requiredContractRefs],
      requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
    })),
    provenanceRef: manifest.provenanceRef,
    declaredCapabilityRefs: [...manifest.declaredCapabilityRefs],
    catalogId: manifest.publicContractCatalog.catalogId,
    catalogDigest: manifest.publicContractCatalog.catalogDigest,
    publicContracts,
    publicContractRefs: [...contractIds].sort(),
    publicCapabilityRefs: [...publicCapabilityRefs].sort(),
    checkedPayloadFiles: inventory.length,
  });
}
