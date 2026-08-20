import { readFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { PublicDefinitionKeyLike } from "../shared/public_invocation.js";
import type { ExactPrefixArtifactTruthProjection } from
  "../abg/artifact_truth.js";
import { hasAdmittedProductInstall } from
  "../abg/environment_admission.js";
import type {
  ExactOwnerCallableCoordinate,
  ExecutionBindingSpecification,
} from "../shared/owner_contract_source_set.js";
import type {
  IntrinsicPublicOperationContractProjection,
  IntrinsicProjectedDefinitionSlot,
} from "../shared/public_function_family.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import {
  isProductInstall,
  isResolvedProductLock,
  verifiedArtifactMatchesResolvedLock,
  type ProductInstall,
  type ResolvedProductLock,
} from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";
import {
  isVerifiedProductArtifact,
  parseOperationProjection,
  parseProductManifest,
  parseProductPublicContract,
} from "./verify_product.js";

export type InstalledModuleLoadResult =
  | Readonly<{
      kind: "loaded";
      module: Readonly<Record<string, unknown>>;
    }>
  | Readonly<{
      kind: "refused";
      code: "content_mismatch" | "load_failed" | "path_escape";
    }>;

export type InstalledDefinitionBindingLoadRefusalCode =
  | "dependency_lock_mismatch"
  | "installed_product_mismatch"
  | "manifest_mismatch"
  | "definition_absent"
  | "callable_contract_mismatch"
  | "package_export_absent"
  | "export_digest_mismatch"
  | "member_absent"
  | "load_failed";

export interface InstalledDefinitionBindingLoadRefusal {
  readonly kind: "installed_definition_binding_load_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly code: InstalledDefinitionBindingLoadRefusalCode;
  readonly message: string;
}

export interface VerifiedInstalledDefinitionBinding {
  readonly kind: "verified_installed_definition_binding";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "loaded";
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly definitionRef: string;
  readonly definitionDigest: Sha256Digest;
  readonly installId: string;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly executionBindingSpecification: ExecutionBindingSpecification;
  readonly executionBindingSpecificationDigest: Sha256Digest;
  readonly callable: ExactOwnerCallableCoordinate;
  readonly resolvedModulePath: string;
  readonly resolvedExportDigest: Sha256Digest;
  readonly invoke: (...args: unknown[]) => unknown;
}

export type InstalledDefinitionBindingLoadResult =
  | VerifiedInstalledDefinitionBinding
  | InstalledDefinitionBindingLoadRefusal;

export interface InstalledDefinitionBindingLoadBasis {
  readonly install: ProductInstall;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly verifiedProduct: VerifiedProductArtifact;
  readonly resolvedLock: ResolvedProductLock;
  readonly definitionKey: PublicDefinitionKeyLike;
}

function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeMemberPath(value: unknown): value is readonly string[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.every((part) =>
      nonblank(part) &&
      part !== "__proto__" &&
      part !== "prototype" &&
      part !== "constructor"
    );
}

function loadRefusal(
  definitionKey: PublicDefinitionKeyLike,
  code: InstalledDefinitionBindingLoadRefusalCode,
  message: string,
): InstalledDefinitionBindingLoadRefusal {
  return deepFreeze({
    kind: "installed_definition_binding_load_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    definitionKey,
    code,
    message,
  });
}

function exactContainedPath(root: string, path: string): string | null {
  const exactPath = resolve(root, path);
  const relation = relative(root, exactPath);
  return relation.length === 0 ||
      relation === ".." ||
      relation.startsWith(`..${sep}`) ||
      isAbsolute(relation)
    ? null
    : exactPath;
}

function packageExportTarget(
  packageJson: Readonly<Record<string, unknown>>,
  packageExportPath: string,
): string | null {
  if (!isRecord(packageJson.exports)) return null;
  const declared = packageJson.exports[packageExportPath];
  if (typeof declared === "string") return declared;
  return isRecord(declared) && typeof declared.import === "string"
    ? declared.import
    : null;
}

function schemaRef(slot: IntrinsicProjectedDefinitionSlot | null): string | null {
  return slot === null
    ? null
    : nonblank(slot.identity?.nativeSchemaIdentity?.schemaRef)
    ? slot.identity.nativeSchemaIdentity.schemaRef
    : null;
}

function exactCallableContract(
  definition: IntrinsicPublicOperationContractProjection["definitions"][number],
): ExactOwnerCallableCoordinate | null {
  const specification = definition.executionBindingSpecification;
  const callable = specification?.callable;
  const requestSchemaRef = schemaRef(definition.requestContract);
  const resultSchemaRef = schemaRef(definition.resultContract);
  const refusalSchemaRef = schemaRef(definition.refusalContract);
  const nonTerminalSchemaRef = schemaRef(definition.nonTerminalContract);
  if (
    !isRecord(specification) ||
    !isRecord(callable) ||
    !sameJson(specification.definitionKey, definition.definitionKey) ||
    !nonblank(specification.semanticOwnerRef) ||
    callable.ownerAuthorityRef !== specification.semanticOwnerRef ||
    !nonblank(callable.packageName) ||
    !nonblank(callable.packageExportPath) ||
    !nonblank(callable.namedExport) ||
    !safeMemberPath(callable.memberPath) ||
    !isSha256Digest(callable.callableContractDigest) ||
    requestSchemaRef === null ||
    resultSchemaRef === null ||
    refusalSchemaRef === null ||
    callable.callableContractDigest !== sha256Canonical({
      kind: "exact_definition_host_callable",
      schemaVersion: "5.0.0",
      definitionKey: definition.definitionKey,
      requestSchemaRef,
      resultSchemaRef,
      refusalSchemaRef,
      nonTerminalSchemaRef,
      resourceRelation: "owner_indexed_sibling_assertion_and_receipt",
    } as unknown as JsonValue)
  ) {
    return null;
  }
  return callable as unknown as ExactOwnerCallableCoordinate;
}

function selectOwnMember(
  module: Readonly<Record<string, unknown>>,
  namedExport: string,
  memberPath: readonly string[],
): unknown {
  if (!Object.hasOwn(module, namedExport)) return undefined;
  let selected: unknown = module[namedExport];
  for (const part of memberPath) {
    if (!isRecord(selected) || !Object.hasOwn(selected, part)) return undefined;
    selected = selected[part];
  }
  return selected;
}

export async function loadVerifiedInstalledModule(
  install: ProductInstall,
  modulePath: string,
): Promise<InstalledModuleLoadResult> {
  if (!(await installedProductContentMatches(install))) {
    return Object.freeze({
      kind: "refused",
      code: "content_mismatch",
    });
  }
  const exactPath = resolve(install.installedRoot, modulePath);
  const relation = relative(install.installedRoot, exactPath);
  if (
    relation.length === 0 ||
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation)
  ) {
    return Object.freeze({
      kind: "refused",
      code: "path_escape",
    });
  }
  try {
    const loaded = await import(pathToFileURL(exactPath).href) as Record<
      string,
      unknown
    >;
    return Object.freeze({
      kind: "loaded",
      module: loaded,
    });
  } catch {
    return Object.freeze({
      kind: "refused",
      code: "load_failed",
    });
  }
}

/**
 * Resolves one definition binding only from an admitted install, its exact
 * verified Product/lock relation, and the content-verified installed manifest.
 * No target module is evaluated until the complete static coordinate below has
 * been admitted.
 */
export async function loadVerifiedInstalledDefinitionBinding(
  basis: InstalledDefinitionBindingLoadBasis,
): Promise<InstalledDefinitionBindingLoadResult> {
  const { definitionKey, install, verifiedProduct, resolvedLock } = basis;
  if (
    !isResolvedProductLock(resolvedLock) ||
    !isVerifiedProductArtifact(verifiedProduct) ||
    !verifiedArtifactMatchesResolvedLock(verifiedProduct, resolvedLock)
  ) {
    return loadRefusal(
      definitionKey,
      "dependency_lock_mismatch",
      "definition binding requires one exact verified Product in the resolved lock",
    );
  }
  if (
    !isProductInstall(install, resolvedLock) ||
    !hasAdmittedProductInstall(basis.artifactTruth, install) ||
    install.productId !== verifiedProduct.productId ||
    install.packageName !== verifiedProduct.packageName ||
    install.packageVersion !== verifiedProduct.packageVersion ||
    install.artifactDigest !== verifiedProduct.artifactDigest ||
    install.productContentDigest !== verifiedProduct.productContentDigest ||
    install.manifestDigest !== verifiedProduct.manifestDigest ||
    install.catalogId !== verifiedProduct.catalogId ||
    install.catalogDigest !== verifiedProduct.catalogDigest ||
    !sameJson(install.publicContracts, verifiedProduct.publicContracts)
  ) {
    return loadRefusal(
      definitionKey,
      "installed_product_mismatch",
      "definition binding requires the exact admitted install of the verified Product",
    );
  }

  let manifestUnknown: unknown;
  let packageJsonUnknown: unknown;
  try {
    [manifestUnknown, packageJsonUnknown] = await Promise.all([
      readFile(join(install.installedRoot, "product-toolchain-manifest.json"), "utf8")
        .then((text) => JSON.parse(text) as unknown),
      readFile(join(install.installedRoot, "package.json"), "utf8")
        .then((text) => JSON.parse(text) as unknown),
    ]);
  } catch {
    return loadRefusal(
      definitionKey,
      "manifest_mismatch",
      "installed manifest or package metadata is unreadable",
    );
  }
  const manifest = parseProductManifest(manifestUnknown);
  if (
    manifest === null ||
    !isRecord(packageJsonUnknown) ||
    sha256Canonical(manifest as unknown as JsonValue) !== install.manifestDigest ||
    manifest.productId !== install.productId ||
    manifest.packageName !== install.packageName ||
    manifest.packageVersion !== install.packageVersion ||
    manifest.productContentDigest !== install.productContentDigest ||
    manifest.publicContractCatalog.catalogId !== install.catalogId ||
    manifest.publicContractCatalog.catalogDigest !== install.catalogDigest ||
    packageJsonUnknown.name !== install.packageName ||
    packageJsonUnknown.version !== install.packageVersion ||
    !sameJson(manifest.publicContractCatalog.rows, verifiedProduct.publicContracts)
  ) {
    return loadRefusal(
      definitionKey,
      "manifest_mismatch",
      "installed manifest, package, verified Product, and admitted install disagree",
    );
  }
  const manifestRows = manifest.publicContractCatalog.rows.filter((candidate) =>
    candidate.contractId === definitionKey.operationId
  );
  const verifiedRows = verifiedProduct.publicContracts.filter((candidate) =>
    candidate.contractId === definitionKey.operationId
  );
  if (
    manifestRows.length !== 1 ||
    verifiedRows.length !== 1 ||
    parseProductPublicContract(manifestRows[0], manifest.productId) === null ||
    !sameJson(manifestRows[0], verifiedRows[0])
  ) {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "definition operation lacks one exact verified manifest catalog row",
    );
  }
  const manifestRow = manifestRows[0]!;
  const assetLocator = manifestRow.assetLocator;
  if (
    !isRecord(assetLocator) ||
    !nonblank(assetLocator.path) ||
    !isSha256Digest(assetLocator.contentDigest) ||
    manifestRow.contractDigest !== assetLocator.contentDigest
  ) {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "definition operation lacks one digest-bound serialized contract asset",
    );
  }
  const contractPath = exactContainedPath(install.installedRoot, assetLocator.path);
  let contractBytes: Uint8Array;
  if (contractPath === null) {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "definition contract asset escapes the admitted install",
    );
  }
  try {
    contractBytes = await readFile(contractPath);
  } catch {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "definition contract asset is unreadable from the admitted install",
    );
  }
  const operation = parseOperationProjection(contractBytes);
  if (
    sha256Bytes(contractBytes) !== assetLocator.contentDigest ||
    operation === null ||
    operation.operationId !== definitionKey.operationId
  ) {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "definition contract bytes differ from the verified manifest catalog",
    );
  }
  const definitions = operation.definitions.filter((candidate) =>
    candidate.definitionKey.operationId === definitionKey.operationId &&
    candidate.definitionKey.memberKey === definitionKey.memberKey
  );
  if (definitions.length !== 1) {
    return loadRefusal(
      definitionKey,
      "definition_absent",
      "serialized operation does not declare one exact definition member",
    );
  }
  const definition = definitions[0]!;
  const callable = exactCallableContract(definition);
  if (
    callable === null ||
    callable.packageName !== install.packageName ||
    !sameJson(callable.memberPath, definition.executionBindingSpecification.callable.memberPath)
  ) {
    return loadRefusal(
      definitionKey,
      "callable_contract_mismatch",
      "serialized definition callable coordinate or contract digest is invalid",
    );
  }
  const definitionCoordinates = verifiedProduct.definitionContractCoordinates;
  const coordinateOperations = definitionCoordinates?.operations.filter((candidate) =>
    candidate.operationId === definitionKey.operationId
  ) ?? [];
  const coordinateMembers = coordinateOperations.length === 1
    ? coordinateOperations[0]!.members.filter((candidate) =>
        candidate.memberKey === definitionKey.memberKey
      )
    : [];
  const catalogCoordinate = {
    productId: manifest.productId,
    productContentDigest: manifest.productContentDigest,
    catalogId: manifest.publicContractCatalog.catalogId,
    catalogVersion: manifest.publicContractCatalog.catalogVersion,
    catalogDigest: manifest.publicContractCatalog.catalogDigest,
  };
  if (
    coordinateMembers.length !== 1 ||
    [
      coordinateMembers[0]!.slots.request,
      coordinateMembers[0]!.slots.result,
      coordinateMembers[0]!.slots.refusal,
      coordinateMembers[0]!.slots.nonTerminal,
    ].some((coordinate) =>
      coordinate !== null && !sameJson(coordinate.contractCatalog, catalogCoordinate)
    )
  ) {
    return loadRefusal(
      definitionKey,
      "callable_contract_mismatch",
      "verified definition coordinates do not bind the exact installed manifest catalog",
    );
  }

  const target = packageExportTarget(
    packageJsonUnknown,
    callable.packageExportPath,
  );
  const resolvedModulePath = target === null
    ? null
    : exactContainedPath(install.installedRoot, target);
  const targetRelation = resolvedModulePath === null
    ? null
    : relative(install.installedRoot, resolvedModulePath).split(sep).join("/");
  if (
    target === null ||
    resolvedModulePath === null ||
    targetRelation === null ||
    !manifest.productRelativeLocators.includes(targetRelation)
  ) {
    return loadRefusal(
      definitionKey,
      "package_export_absent",
      "declared definition package export does not resolve inside the admitted install",
    );
  }

  // This full content check and the target digest are deliberately completed
  // before loadVerifiedInstalledModule performs the sole target import.
  if (!(await installedProductContentMatches(install))) {
    return loadRefusal(
      definitionKey,
      "export_digest_mismatch",
      "installed export bytes differ from the admitted Product content digest",
    );
  }
  let resolvedExportDigest: Sha256Digest;
  try {
    resolvedExportDigest = sha256Bytes(await readFile(resolvedModulePath));
  } catch {
    return loadRefusal(
      definitionKey,
      "export_digest_mismatch",
      "content-verified installed export is unreadable",
    );
  }

  const moduleResult = await loadVerifiedInstalledModule(
    install,
    targetRelation,
  );
  if (moduleResult.kind === "refused") {
    return loadRefusal(
      definitionKey,
      "load_failed",
      "content-verified installed export could not be loaded",
    );
  }
  const selected = selectOwnMember(
    moduleResult.module,
    callable.namedExport,
    callable.memberPath,
  );
  if (typeof selected !== "function") {
    return loadRefusal(
      definitionKey,
      "member_absent",
      "content-verified installed export lacks the declared callable member",
    );
  }
  return deepFreeze({
    kind: "verified_installed_definition_binding" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "loaded" as const,
    definitionKey,
    definitionRef: definition.definitionRef,
    definitionDigest: definition.definitionDigest,
    installId: install.installId,
    lockId: resolvedLock.lockId,
    lockDigest: resolvedLock.lockDigest,
    manifestDigest: install.manifestDigest,
    productContentDigest: install.productContentDigest,
    executionBindingSpecification: definition.executionBindingSpecification,
    executionBindingSpecificationDigest: sha256Canonical(
      definition.executionBindingSpecification as unknown as JsonValue,
    ),
    callable,
    resolvedModulePath,
    resolvedExportDigest,
    invoke: selected as (...args: unknown[]) => unknown,
  });
}
