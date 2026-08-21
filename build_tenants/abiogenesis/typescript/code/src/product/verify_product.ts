import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isAbsolute, posix } from "node:path";
import { safeParse } from "valibot";

import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
  CAPABILITY_DEFINITION_GRAPH_ID,
  CAPABILITY_DEFINITION_GRAPH_VERSION,
  capabilityDefinitionGraphAssetBytes,
  capabilityRefsForContract,
  constructCapabilityDefinitionGraph,
  isCapabilityDefinitionGraph,
  type CapabilityDefinitionGraph,
  type CapabilityDefinitionGraphCoordinate,
} from "../shared/capability_contracts.js";
import {
  completeDefinitionContractCoordinateMapSchema,
  type CompleteDefinitionContractCoordinateMap,
} from "../shared/public_function_contracts.js";
import type {
  IntrinsicPublicFunctionFamilyCoordinate,
  IntrinsicPublicOperationContractProjection,
} from "../shared/public_function_family.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
  type PublicCliGrammarProjection,
  type PublicDocumentationInventoryRow,
  type PublicSdkMemberProjection,
} from "../shared/public_function_projections.js";
import type {
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
} from "../shared/public_invocation.js";
import {
  contractIndexedPendingSelectors,
  resolveNativeDeclarationClosures,
  type NativeProductDeclarationEvidence,
} from "./declaration_exports.js";
import type {
  ProductAssetLocator,
  ProductContributionManifest,
  ProductContributionManifestRow,
  ProductDeclaredDependency,
  ProductModulePublicationBinding,
  ProductNativeDeclarationInventoryRow,
  ProductNativeTypedLocator,
  ProductPublicContract,
  ProductPublicContractCatalog,
  ProductPublicContractKind,
  ProductCapabilityDefinitionGraphManifestCoordinate,
  ProductVerificationCoordinates,
  ProductVerificationRefusal,
  ProductVerificationRefusalCode,
  ProductVerificationResult,
  VerifiedProductArtifact,
  VerifyProductRequest,
} from "./contracts.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PRODUCT_ID,
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
  readonly capabilityDefinitionGraph:
    ProductCapabilityDefinitionGraphManifestCoordinate;
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
  readonly packageType: "commonjs" | "module";
  readonly exports: Readonly<Record<string, unknown>>;
}

const TAR_MAX_BUFFER = 64 * 1024 * 1024;
export function nativeDeclarationEvidenceForVerifiedArtifact(
  artifact: VerifiedProductArtifact,
): NativeProductDeclarationEvidence | null {
  return isVerifiedProductArtifact(artifact)
    ? artifact.nativeDeclarationEvidence
    : null;
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

function isCapabilityDefinitionGraphCoordinate(
  value: unknown,
): value is CapabilityDefinitionGraphCoordinate {
  return isRecord(value) &&
    hasExactKeys(value, ["graphDigest", "graphId", "graphVersion"]) &&
    value.graphId === CAPABILITY_DEFINITION_GRAPH_ID &&
    value.graphVersion === CAPABILITY_DEFINITION_GRAPH_VERSION &&
    isSha256Digest(value.graphDigest);
}

function isProductAssetLocator(value: unknown): value is ProductAssetLocator {
  return isRecord(value) &&
    hasExactKeys(value, ["contentDigest", "mediaType", "path", "schemaVersion"]) &&
    isNonblankString(value.path) &&
    isNonblankString(value.mediaType) &&
    isNonblankString(value.schemaVersion) &&
    isSha256Digest(value.contentDigest);
}

function isCapabilityDefinitionGraphManifestCoordinate(
  value: unknown,
): value is ProductCapabilityDefinitionGraphManifestCoordinate {
  return isRecord(value) &&
    hasExactKeys(value, [
      "assetLocator",
      "graphDigest",
      "graphId",
      "graphVersion",
    ]) &&
    value.graphId === CAPABILITY_DEFINITION_GRAPH_ID &&
    value.graphVersion === CAPABILITY_DEFINITION_GRAPH_VERSION &&
    isSha256Digest(value.graphDigest) &&
    isProductAssetLocator(value.assetLocator) &&
    value.assetLocator.path === CAPABILITY_DEFINITION_GRAPH_ASSET_PATH &&
    value.assetLocator.mediaType === "application/json" &&
    value.assetLocator.schemaVersion === "5.0.0";
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

function verificationBody(
  value: Omit<VerifiedProductArtifact, "verificationDigest" | "verificationRef">,
): JsonValue {
  return value as unknown as JsonValue;
}

function coordinateRef(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

export function productVerificationCoordinates(
  artifact: VerifiedProductArtifact,
): ProductVerificationCoordinates {
  const descriptorBody = {
    kind: "product_descriptor_relation",
    schemaVersion: "5.0.0",
    descriptorRef: artifact.descriptorRef,
    productId: artifact.productId,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    publisherNamespace: artifact.publisherNamespace,
    productContentDigest: artifact.productContentDigest,
    manifestDigest: artifact.manifestDigest,
    contributionManifestRef: artifact.contributionManifestRef,
    contributionManifestDigest: artifact.contributionManifestDigest,
    compatibilityRefs: artifact.compatibilityRefs,
    declaredDependencies: artifact.declaredDependencies,
    provenanceRef: artifact.provenanceRef,
    declaredCapabilityRefs: artifact.declaredCapabilityRefs,
    catalogId: artifact.catalogId,
    catalogDigest: artifact.catalogDigest,
    capabilityDefinitionGraph: {
      graphId: artifact.capabilityDefinitionGraph.graphId,
      graphVersion: artifact.capabilityDefinitionGraph.graphVersion,
      graphDigest: artifact.capabilityDefinitionGraph.graphDigest,
    },
    publicContractRefs: artifact.publicContractRefs,
    publicCapabilityRefs: artifact.publicCapabilityRefs,
  } as const;
  const descriptorDigest = sha256Canonical(
    descriptorBody as unknown as JsonValue,
  );

  const localNativeEvidenceBody = {
    kind: "local_native_contract_evidence",
    schemaVersion: "5.0.0",
    verificationRef: artifact.verificationRef,
    verificationDigest: artifact.verificationDigest,
    productId: artifact.productId,
    productContentDigest: artifact.productContentDigest,
    packageName: artifact.packageName,
    nativeDeclarationEvidence: artifact.nativeDeclarationEvidence,
  } as const;
  const localNativeEvidenceDigest = sha256Canonical(
    localNativeEvidenceBody as unknown as JsonValue,
  );

  const provenanceBody = {
    kind: "product_verification_provenance",
    schemaVersion: "5.0.0",
    disposition: artifact.disposition,
    verificationRef: artifact.verificationRef,
    verificationDigest: artifact.verificationDigest,
    artifactRef: artifact.artifactRef,
    artifactDigest: artifact.artifactDigest,
    productId: artifact.productId,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    productContentDigest: artifact.productContentDigest,
    manifestDigest: artifact.manifestDigest,
    descriptorRef: artifact.descriptorRef,
    contributionManifestRef: artifact.contributionManifestRef,
    contributionManifestDigest: artifact.contributionManifestDigest,
    capabilityDefinitionGraph: {
      graphId: artifact.capabilityDefinitionGraph.graphId,
      graphVersion: artifact.capabilityDefinitionGraph.graphVersion,
      graphDigest: artifact.capabilityDefinitionGraph.graphDigest,
      asset: artifact.capabilityDefinitionGraphAsset,
    },
    sourceProvenanceRef: artifact.provenanceRef,
    checkedPayloadFiles: artifact.checkedPayloadFiles,
  } as const;
  const provenanceDigest = sha256Canonical(
    provenanceBody as unknown as JsonValue,
  );

  return deepFreeze({
    verifiedArtifact: {
      ref: artifact.verificationRef,
      digest: artifact.verificationDigest,
    },
    descriptor: {
      ref: artifact.descriptorRef,
      digest: descriptorDigest,
    },
    localNativeEvidence: {
      ref: coordinateRef(
        "local-native-evidence://abiogenesis/product-verification",
        localNativeEvidenceDigest,
      ),
      digest: localNativeEvidenceDigest,
    },
    provenance: {
      ref: coordinateRef(
        "provenance://abiogenesis/product-verification",
        provenanceDigest,
      ),
      digest: provenanceDigest,
    },
  });
}

function isNativeDeclarationEvidence(
  value: unknown,
  artifact: Readonly<{
    productId: string;
    productContentDigest: Sha256Digest;
    packageName: string;
  }>,
): value is NativeProductDeclarationEvidence {
  const isSafeOffset = (candidate: unknown): candidate is number =>
    typeof candidate === "number" &&
    Number.isSafeInteger(candidate) &&
    candidate >= 0;
  const isOrigin = (candidate: unknown): boolean => {
    if (!isRecord(candidate) || !isNonblankString(candidate.kind)) return false;
    if (candidate.kind === "import_declaration") {
      return hasExactKeys(candidate, [
        "clause",
        "declarationTypeOnly",
        "kind",
        "specifierTypeOnly",
      ]) &&
        (
          candidate.clause === "side_effect" ||
          candidate.clause === "default" ||
          candidate.clause === "named" ||
          candidate.clause === "namespace"
        ) &&
        typeof candidate.declarationTypeOnly === "boolean" &&
        typeof candidate.specifierTypeOnly === "boolean";
    }
    if (candidate.kind === "export_declaration") {
      return hasExactKeys(candidate, [
        "clause",
        "declarationTypeOnly",
        "kind",
        "specifierTypeOnly",
      ]) &&
        (
          candidate.clause === "named" ||
          candidate.clause === "star" ||
          candidate.clause === "namespace"
        ) &&
        typeof candidate.declarationTypeOnly === "boolean" &&
        typeof candidate.specifierTypeOnly === "boolean";
    }
    if (candidate.kind === "import_type_expression") {
      return hasExactKeys(candidate, ["kind", "operator"]) &&
        (candidate.operator === "type" || candidate.operator === "typeof");
    }
    return (
      candidate.kind === "import_equals_declaration" ||
      candidate.kind === "type_reference_directive" ||
      candidate.kind === "module_augmentation"
    ) && hasExactKeys(candidate, ["kind"]);
  };
  const isSelection = (candidate: unknown): boolean => {
    if (!isRecord(candidate) || !isNonblankString(candidate.kind)) return false;
    if (candidate.kind === "module" || candidate.kind === "all") {
      return hasExactKeys(candidate, ["kind"]);
    }
    if (candidate.kind === "name") {
      return hasExactKeys(candidate, [
        "exposedName",
        "kind",
        "targetName",
      ]) &&
        isNonblankString(candidate.targetName) &&
        isNonblankString(candidate.exposedName);
    }
    return candidate.kind === "namespace" &&
      hasExactKeys(candidate, ["exposedName", "kind"]) &&
      isNonblankString(candidate.exposedName);
  };
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "closures",
      "contracts",
      "packageName",
      "packageType",
      "productContentDigest",
      "productId",
      "sources",
    ]) ||
    value.productId !== artifact.productId ||
    value.productContentDigest !== artifact.productContentDigest ||
    value.packageName !== artifact.packageName ||
    (value.packageType !== "commonjs" && value.packageType !== "module") ||
    !Array.isArray(value.sources) ||
    !Array.isArray(value.closures) ||
    !Array.isArray(value.contracts)
  ) {
    return false;
  }

  const sources = value.sources as readonly unknown[];
  if (
    sources.some((source) =>
      !isRecord(source) ||
      !hasExactKeys(source, [
        "declarationDigest",
        "declarationPath",
        "sourceText",
      ]) ||
      !isNonblankString(source.declarationPath) ||
      !isSha256Digest(source.declarationDigest) ||
      typeof source.sourceText !== "string" ||
      sha256Bytes(new TextEncoder().encode(source.sourceText)) !==
        source.declarationDigest
    ) ||
    new Set(sources.map((source) =>
      (source as Readonly<Record<string, unknown>>).declarationPath
    )).size !== sources.length
  ) {
    return false;
  }
  const sourceDigests = new Map(
    sources.map((source) => {
      const row = source as Readonly<Record<string, unknown>>;
      return [row.declarationPath as string, row.declarationDigest];
    }),
  );

  const closureByExport = new Map<string, Readonly<Record<string, unknown>>>();
  for (const candidate of value.closures as readonly unknown[]) {
    if (
      !isRecord(candidate) ||
      !hasExactKeys(candidate, [
        "contributesGlobals",
        "declarationInventory",
        "declarationPath",
        "exportedSymbolPhysicalRelationRefs",
        "exportedSymbols",
        "moduleAugmentations",
        "packageExportPath",
        "physicalRelations",
      ]) ||
      !isNonblankString(candidate.packageExportPath) ||
      !isNonblankString(candidate.declarationPath) ||
      typeof candidate.contributesGlobals !== "boolean" ||
      !isUniqueStringArray(candidate.exportedSymbols) ||
      !isRecord(candidate.exportedSymbolPhysicalRelationRefs) ||
      !Array.isArray(candidate.declarationInventory) ||
      !Array.isArray(candidate.physicalRelations) ||
      !Array.isArray(candidate.moduleAugmentations) ||
      closureByExport.has(candidate.packageExportPath)
    ) {
      return false;
    }
    const inventory = candidate.declarationInventory as readonly unknown[];
    if (
      inventory.some((entry) =>
        !isRecord(entry) ||
        !hasExactKeys(entry, [
          "declarationDigest",
          "declarationPath",
          "packageExportPath",
        ]) ||
        entry.packageExportPath !== candidate.packageExportPath ||
        !isNonblankString(entry.declarationPath) ||
        !isSha256Digest(entry.declarationDigest) ||
        sourceDigests.get(entry.declarationPath) !== entry.declarationDigest
      ) ||
      new Set(inventory.map((entry) =>
        (entry as Readonly<Record<string, unknown>>).declarationPath
      )).size !== inventory.length
    ) {
      return false;
    }

    const physicalRelations = new Map<string, Readonly<Record<string, unknown>>>();
    for (const relationCandidate of candidate.physicalRelations) {
      if (
        !isRecord(relationCandidate) ||
        !hasExactKeys(relationCandidate, [
          "declarationDigest",
          "declarationPath",
          "moduleSpecifier",
          "origin",
          "physicalRelationDigest",
          "physicalRelationRef",
          "selection",
          "sourceEnd",
          "sourceProductContentDigest",
          "sourceStart",
        ]) ||
        relationCandidate.sourceProductContentDigest !==
          artifact.productContentDigest ||
        !isNonblankString(relationCandidate.declarationPath) ||
        sourceDigests.get(relationCandidate.declarationPath) !==
          relationCandidate.declarationDigest ||
        !isSha256Digest(relationCandidate.declarationDigest) ||
        !isSafeOffset(relationCandidate.sourceStart) ||
        !isSafeOffset(relationCandidate.sourceEnd) ||
        relationCandidate.sourceEnd < relationCandidate.sourceStart ||
        !isNonblankString(relationCandidate.moduleSpecifier) ||
        !isOrigin(relationCandidate.origin) ||
        !isSelection(relationCandidate.selection) ||
        !isSha256Digest(relationCandidate.physicalRelationDigest) ||
        !isNonblankString(relationCandidate.physicalRelationRef) ||
        physicalRelations.has(relationCandidate.physicalRelationRef)
      ) {
        return false;
      }
      const physicalBody = {
        sourceProductContentDigest: relationCandidate.sourceProductContentDigest,
        declarationPath: relationCandidate.declarationPath,
        declarationDigest: relationCandidate.declarationDigest,
        sourceStart: relationCandidate.sourceStart,
        sourceEnd: relationCandidate.sourceEnd,
        moduleSpecifier: relationCandidate.moduleSpecifier,
        origin: relationCandidate.origin,
        selection: relationCandidate.selection,
      };
      const expectedDigest = sha256Canonical(
        physicalBody as unknown as JsonValue,
      );
      if (
        relationCandidate.physicalRelationDigest !== expectedDigest ||
        relationCandidate.physicalRelationRef !==
          `ts-relation://${expectedDigest.slice("sha256:".length)}`
      ) {
        return false;
      }
      physicalRelations.set(
        relationCandidate.physicalRelationRef,
        relationCandidate,
      );
    }

    const exportedRefs = candidate.exportedSymbolPhysicalRelationRefs;
    if (
      canonicalJson(Object.keys(exportedRefs).sort()) !==
        canonicalJson([...(candidate.exportedSymbols as readonly string[])].sort()) ||
      Object.values(exportedRefs).some((refs) =>
        !isUniqueStringArray(refs) ||
        refs.some((ref) => !physicalRelations.has(ref))
      )
    ) {
      return false;
    }
    if (
      candidate.moduleAugmentations.some((augmentation) =>
        !isRecord(augmentation) ||
        !hasExactKeys(augmentation, [
          "declarationPath",
          "moduleSpecifier",
          "packageExportPath",
          "sourceEnd",
          "sourceOffset",
        ]) ||
        augmentation.packageExportPath !== candidate.packageExportPath ||
        !isNonblankString(augmentation.declarationPath) ||
        !sourceDigests.has(augmentation.declarationPath) ||
        !isSafeOffset(augmentation.sourceOffset) ||
        !isSafeOffset(augmentation.sourceEnd) ||
        augmentation.sourceEnd < augmentation.sourceOffset ||
        !isNonblankString(augmentation.moduleSpecifier)
      )
    ) {
      return false;
    }
    closureByExport.set(candidate.packageExportPath, candidate);
  }

  const contractIds = new Set<string>();
  for (const contractCandidate of value.contracts as readonly unknown[]) {
    if (
      !isRecord(contractCandidate) ||
      !hasExactKeys(contractCandidate, [
        "contractDigest",
        "contractId",
        "localDisposition",
        "namedSymbol",
        "packageExportPath",
        "pendingSelectors",
      ]) ||
      !isNonblankString(contractCandidate.contractId) ||
      !isSha256Digest(contractCandidate.contractDigest) ||
      !isNonblankString(contractCandidate.packageExportPath) ||
      !isNonblankString(contractCandidate.namedSymbol) ||
      (
        contractCandidate.localDisposition !== "local" &&
        contractCandidate.localDisposition !== "pending_external"
      ) ||
      !Array.isArray(contractCandidate.pendingSelectors) ||
      contractIds.has(contractCandidate.contractId)
    ) {
      return false;
    }
    const closure = closureByExport.get(contractCandidate.packageExportPath);
    if (closure === undefined) return false;
    const physicalRelations = new Map(
      (closure.physicalRelations as readonly Readonly<Record<string, unknown>>[])
        .map((relation) => [relation.physicalRelationRef as string, relation]),
    );
    const selectorRefs = new Set<string>();
    for (const selectorCandidate of contractCandidate.pendingSelectors) {
      if (
        !isRecord(selectorCandidate) ||
        !hasExactKeys(selectorCandidate, [
          "externalModuleSpecifier",
          "externalPackageName",
          "localAccessPath",
          "origin",
          "physicalRelationRef",
          "selection",
          "selectorRef",
          "sourceContractDigest",
          "sourceContractRef",
          "sourceNamedSymbol",
          "sourcePackageExportPath",
          "sourceProductContentDigest",
        ]) ||
        !isSha256Digest(selectorCandidate.selectorRef) ||
        selectorCandidate.sourceProductContentDigest !==
          artifact.productContentDigest ||
        selectorCandidate.sourceContractRef !== contractCandidate.contractId ||
        selectorCandidate.sourceContractDigest !==
          contractCandidate.contractDigest ||
        selectorCandidate.sourcePackageExportPath !==
          contractCandidate.packageExportPath ||
        selectorCandidate.sourceNamedSymbol !== contractCandidate.namedSymbol ||
        !isNonblankString(selectorCandidate.physicalRelationRef) ||
        !isNonblankString(selectorCandidate.externalPackageName) ||
        !isNonblankString(selectorCandidate.externalModuleSpecifier) ||
        !isOrigin(selectorCandidate.origin) ||
        !isSelection(selectorCandidate.selection) ||
        !Array.isArray(selectorCandidate.localAccessPath) ||
        selectorCandidate.localAccessPath.length === 0 ||
        !selectorCandidate.localAccessPath.every(isNonblankString) ||
        selectorRefs.has(selectorCandidate.selectorRef)
      ) {
        return false;
      }
      const relation = physicalRelations.get(
        selectorCandidate.physicalRelationRef,
      );
      if (
        relation === undefined ||
        selectorCandidate.externalModuleSpecifier !== relation.moduleSpecifier ||
        canonicalJson(selectorCandidate.origin as JsonValue) !==
          canonicalJson(relation.origin as JsonValue) ||
        canonicalJson(selectorCandidate.selection as JsonValue) !==
          canonicalJson(relation.selection as JsonValue)
      ) {
        return false;
      }
      const selectorBody = {
        sourceProductContentDigest: selectorCandidate.sourceProductContentDigest,
        sourceContractRef: selectorCandidate.sourceContractRef,
        sourceContractDigest: selectorCandidate.sourceContractDigest,
        sourcePackageExportPath: selectorCandidate.sourcePackageExportPath,
        sourceNamedSymbol: selectorCandidate.sourceNamedSymbol,
        physicalRelationRef: selectorCandidate.physicalRelationRef,
        externalPackageName: selectorCandidate.externalPackageName,
        externalModuleSpecifier: selectorCandidate.externalModuleSpecifier,
        origin: selectorCandidate.origin,
        selection: selectorCandidate.selection,
        localAccessPath: selectorCandidate.localAccessPath,
      };
      if (
        selectorCandidate.selectorRef !==
          sha256Canonical(selectorBody as unknown as JsonValue)
      ) {
        return false;
      }
      selectorRefs.add(selectorCandidate.selectorRef);
    }
    if (
      (contractCandidate.localDisposition === "local" &&
        contractCandidate.pendingSelectors.length !== 0) ||
      (contractCandidate.localDisposition === "pending_external" &&
        contractCandidate.pendingSelectors.length === 0)
    ) {
      return false;
    }
    contractIds.add(contractCandidate.contractId);
  }
  return true;
}
export function isVerifiedProductArtifact(
  value: unknown,
): value is VerifiedProductArtifact {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "artifactByteLength",
      "artifactDigest",
      "artifactRef",
      "catalogDigest",
      "catalogId",
      "capabilityDefinitionGraph",
      "capabilityDefinitionGraphAsset",
      "checkedPayloadFiles",
      "compatibilityRefs",
      "contributionManifest",
      "contributionManifestDigest",
      "contributionManifestRef",
      "declaredCapabilityRefs",
      "declaredDependencies",
      "definitionContractCoordinates",
      "descriptorRef",
      "disposition",
      "kind",
      "manifestDigest",
      "nativeDeclarationEvidence",
      "packageName",
      "packageVersion",
      "productContentDigest",
      "productId",
      "provenanceRef",
      "publicCapabilityRefs",
      "publicContractRefs",
      "publicContracts",
      "publisherNamespace",
      "schemaVersion",
      "verificationDigest",
      "verificationRef",
    ]) ||
    value.kind !== "verified_product_artifact" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "verified" ||
    !isNonblankString(value.verificationRef) ||
    !isSha256Digest(value.verificationDigest) ||
    !isNonblankString(value.artifactRef) ||
    !isSha256Digest(value.artifactDigest) ||
    !Number.isSafeInteger(value.artifactByteLength) ||
    (value.artifactByteLength as number) <= 0 ||
    !isNonblankString(value.productId) ||
    !isNonblankString(value.packageName) ||
    !isNonblankString(value.packageVersion) ||
    !isSha256Digest(value.productContentDigest) ||
    !isSha256Digest(value.manifestDigest) ||
    !isNonblankString(value.descriptorRef) ||
    !isNonblankString(value.publisherNamespace) ||
    !isNonblankString(value.contributionManifestRef) ||
    !isSha256Digest(value.contributionManifestDigest) ||
    !isProductContributionManifest(value.contributionManifest) ||
    sha256Canonical(value.contributionManifest as unknown as JsonValue) !==
      value.contributionManifestDigest ||
    !isUniqueStringArray(value.compatibilityRefs) ||
    !Array.isArray(value.declaredDependencies) ||
    !value.declaredDependencies.every(isDeclaredDependency) ||
    !isNonblankString(value.provenanceRef) ||
    !isUniqueStringArray(value.declaredCapabilityRefs) ||
    !isNonblankString(value.catalogId) ||
    !isSha256Digest(value.catalogDigest) ||
    !isCapabilityDefinitionGraph(value.capabilityDefinitionGraph) ||
    !isProductAssetLocator(value.capabilityDefinitionGraphAsset) ||
    value.capabilityDefinitionGraphAsset.path !==
      CAPABILITY_DEFINITION_GRAPH_ASSET_PATH ||
    !Array.isArray(value.publicContracts) ||
    !value.publicContracts.every((contract) =>
      parseProductPublicContract(contract, value.productId as string) !== null
    ) ||
    !isUniqueStringArray(value.publicContractRefs) ||
    !isUniqueStringArray(value.publicCapabilityRefs) ||
    !(
      value.definitionContractCoordinates === null ||
      safeParse(
        completeDefinitionContractCoordinateMapSchema,
        value.definitionContractCoordinates,
      ).success
    ) ||
    !Number.isSafeInteger(value.checkedPayloadFiles) ||
    (value.checkedPayloadFiles as number) <= 0 ||
    !isNativeDeclarationEvidence(value.nativeDeclarationEvidence, {
      productId: value.productId,
      productContentDigest: value.productContentDigest,
      packageName: value.packageName,
    })
  ) {
    return false;
  }
  const { verificationDigest, verificationRef, ...body } =
    value as unknown as VerifiedProductArtifact;
  const artifact = value as unknown as VerifiedProductArtifact;
  const graphIds = artifact.capabilityDefinitionGraph.rows.map(
    ({ capabilityId }) => capabilityId,
  );
  const catalogCoordinate: PublicContractCatalogCoordinate = {
    productId: artifact.productId,
    productContentDigest: artifact.productContentDigest,
    catalogId: artifact.catalogId,
    catalogVersion: "5.0.0",
    catalogDigest: artifact.catalogDigest,
  };
  const graphBasis: PublicContractCoordinate[] = artifact.publicContracts.map(
    (contract) => ({
      contractCatalog: catalogCoordinate,
      flatRow: {
        contractId: contract.contractId,
        contractVersion: contract.contractVersion,
        contractDigest: contract.contractDigest,
      },
      nestedSelector: {
        selectorKind: "flat_contract",
        definitionKey: null,
        slot: null,
        definitionRef: null,
      },
    }),
  );
  if (artifact.definitionContractCoordinates !== null) {
    for (const operation of artifact.definitionContractCoordinates.operations) {
      for (const member of operation.members) {
        graphBasis.push(
          member.slots.request,
          member.slots.result,
          member.slots.refusal,
          ...(member.slots.nonTerminal === null
            ? []
            : [member.slots.nonTerminal]),
        );
      }
    }
  }
  let expectedGraph: CapabilityDefinitionGraph;
  try {
    expectedGraph = constructCapabilityDefinitionGraph(graphBasis);
  } catch {
    return false;
  }
  if (
    canonicalJson(expectedGraph as unknown as JsonValue) !==
      canonicalJson(artifact.capabilityDefinitionGraph as unknown as JsonValue) ||
    artifact.capabilityDefinitionGraphAsset.mediaType !== "application/json" ||
    artifact.capabilityDefinitionGraphAsset.schemaVersion !== "5.0.0" ||
    artifact.capabilityDefinitionGraphAsset.contentDigest !== sha256Bytes(
      capabilityDefinitionGraphAssetBytes(artifact.capabilityDefinitionGraph),
    ) ||
    canonicalJson(
      artifact.contributionManifest.capabilityDefinitionGraph as unknown as JsonValue,
    ) !== canonicalJson({
      graphId: artifact.capabilityDefinitionGraph.graphId,
      graphVersion: artifact.capabilityDefinitionGraph.graphVersion,
      graphDigest: artifact.capabilityDefinitionGraph.graphDigest,
    } as unknown as JsonValue) ||
    canonicalJson(graphIds as unknown as JsonValue) !==
      canonicalJson(artifact.declaredCapabilityRefs as unknown as JsonValue) ||
    canonicalJson(graphIds as unknown as JsonValue) !==
      canonicalJson(artifact.publicCapabilityRefs as unknown as JsonValue) ||
    artifact.publicContracts.some((contract) =>
      canonicalJson(contract.capabilityIdentities as unknown as JsonValue) !==
        canonicalJson(
          capabilityRefsForContract(contract.contractId) as unknown as JsonValue,
        )
    )
  ) {
    return false;
  }
  const expectedDigest = sha256Canonical(
    verificationBody(body),
  );
  return verificationDigest === expectedDigest &&
    verificationRef ===
      `product-verification://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
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
      "capabilityDefinitionGraph",
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
    !isCapabilityDefinitionGraphCoordinate(value.capabilityDefinitionGraph) ||
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
    !isCapabilityDefinitionGraphManifestCoordinate(
      value.capabilityDefinitionGraph,
    ) ||
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
    canonicalJson(
      contributionManifest.capabilityDefinitionGraph as unknown as JsonValue,
    ) !== canonicalJson({
      graphId: value.capabilityDefinitionGraph.graphId,
      graphVersion: value.capabilityDefinitionGraph.graphVersion,
      graphDigest: value.capabilityDefinitionGraph.graphDigest,
    }) ||
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
    (
      value.type !== undefined &&
      value.type !== "commonjs" &&
      value.type !== "module"
    ) ||
    !isRecord(value.exports)
  ) {
    return null;
  }
  return {
    name: value.name,
    version: value.version,
    packageType: value.type === "module" ? "module" : "commonjs",
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
      "declarationInventory",
      "declarationPath",
      "namedSymbol",
      "packageExportPath",
      "packageName",
    ]) ||
    !isNonblankString(locator.packageName) ||
    !isNonblankString(locator.packageExportPath) ||
    !isNonblankString(locator.namedSymbol) ||
    !isNonblankString(locator.declarationPath) ||
    !Array.isArray(locator.declarationInventory) ||
    locator.declarationInventory.length === 0 ||
    !locator.declarationInventory.every(
      (entry): entry is ProductNativeDeclarationInventoryRow =>
        isRecord(entry) &&
        hasExactKeys(entry, [
          "declarationDigest",
          "declarationPath",
          "packageExportPath",
        ]) &&
        isNonblankString(entry.packageExportPath) &&
        isNonblankString(entry.declarationPath) &&
        isSha256Digest(entry.declarationDigest),
    )
  ) {
    return null;
  }
  const declarationInventory =
    locator.declarationInventory as unknown as
      ProductNativeDeclarationInventoryRow[];
  const inventoryPaths = declarationInventory.map(
    (entry) => entry.declarationPath,
  );
  if (
    declarationInventory.some(
      (entry) =>
        entry.packageExportPath !== locator.packageExportPath ||
        !isSafeProductPath(entry.declarationPath),
    ) ||
    new Set(inventoryPaths).size !== inventoryPaths.length ||
    [...inventoryPaths].sort().join("\0") !== inventoryPaths.join("\0") ||
    !inventoryPaths.includes(locator.declarationPath)
  ) {
    return null;
  }
  return {
    packageName: locator.packageName,
    packageExportPath: locator.packageExportPath,
    namedSymbol: locator.namedSymbol,
    declarationPath: locator.declarationPath,
    declarationInventory: declarationInventory.map((entry) => ({
      ...entry,
    })),
  };
}

type ContractLocatorLaw = Readonly<{
  asset: "required" | "optional" | "forbidden";
  digest: "asset" | "native";
  native: "required" | "optional" | "forbidden";
}>;

function contractLocatorLaw(
  contractKind: string,
): ContractLocatorLaw | null {
  switch (contractKind) {
    case "native_typed_group":
      return { asset: "optional", digest: "native", native: "required" };
    case "schema_asset":
    case "vocabulary_asset":
      return { asset: "required", digest: "asset", native: "forbidden" };
    case "serialized_native_contract":
      return { asset: "required", digest: "asset", native: "required" };
    default:
      return null;
  }
}

export function parseProductPublicContract(
  value: unknown,
  productId: string,
): ProductPublicContract | null {
  if (!isRecord(value)) return null;
  const row = value as JsonRecord;
  if (
    !isNonblankString(row.contractId) ||
    row.contractVersion !== "5.0.0" ||
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
  const locatorLaw = contractLocatorLaw(row.contractKind);
  if (locatorLaw === null) return null;
  const hasNativeLocator = Object.hasOwn(row, "nativeTypedLocator");
  const hasAssetLocator = Object.hasOwn(row, "assetLocator");
  const nativeTypedLocator = readNativeLocator(row);
  const assetLocator = readAssetLocator(row);
  if (
    hasNativeLocator !== (nativeTypedLocator !== null) ||
    hasAssetLocator !== (assetLocator !== null) ||
    (locatorLaw.native === "required" && nativeTypedLocator === null) ||
    (locatorLaw.native === "forbidden" && nativeTypedLocator !== null) ||
    (locatorLaw.asset === "required" && assetLocator === null) ||
    (locatorLaw.asset === "forbidden" && assetLocator !== null)
  ) {
    return null;
  }
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
    contractKind: row.contractKind as ProductPublicContractKind,
    owningProduct: productId,
    requirementAuthorityRefs: [...row.requirementAuthorityRefs],
    capabilityIdentities: [...row.capabilityIdentities],
    ...(nativeTypedLocator === null ? {} : { nativeTypedLocator }),
    ...(assetLocator === null ? {} : { assetLocator }),
  };
}

interface ArtifactPublicAdapterProjection {
  readonly kind: "public_adapter_projection";
  readonly schemaVersion: "5.0.0";
  readonly family: IntrinsicPublicFunctionFamilyCoordinate;
  readonly sdkMembers: readonly PublicSdkMemberProjection[];
  readonly cliGrammar: readonly PublicCliGrammarProjection[];
  readonly documentationInventory: readonly PublicDocumentationInventoryRow[];
}

interface DefinitionContractBindingFailure {
  readonly message: string;
}

type DefinitionContractBindingResult =
  | CompleteDefinitionContractCoordinateMap
  | DefinitionContractBindingFailure
  | null;

const PUBLIC_OPERATOR_CAPABILITY =
  "abg.capability.operator.public-contract@5";
const PUBLIC_ADAPTER_PROJECTION_PATH =
  "contracts/public-functions/adapter-projection.json";
const PUBLIC_OPERATION_PROJECTION_PATH =
  /^contracts\/public-operations\/.+\/operation-contract\.json$/u;

function bindingFailure(message: string): DefinitionContractBindingFailure {
  return { message };
}

function sameCanonical(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function parseCanonicalPayload(bytes: Uint8Array): unknown | null {
  let value: unknown;
  const sourceText = new TextDecoder().decode(bytes);
  try {
    value = JSON.parse(sourceText);
  } catch {
    return null;
  }
  return isRecord(value) && `${canonicalJson(value as JsonValue)}\n` === sourceText
    ? value
    : null;
}

function definitionKeyToken(key: PublicDefinitionKeyLike): string {
  return `${key.operationId}\0${key.memberKey}`;
}

function readDefinitionKey(value: unknown): PublicDefinitionKeyLike | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["memberKey", "operationId"]) ||
    !isNonblankString(value.operationId) ||
    !isNonblankString(value.memberKey)
  ) {
    return null;
  }
  return { operationId: value.operationId, memberKey: value.memberKey };
}

function resolveJsonFragment(root: unknown, fragment: string): unknown {
  if (!fragment.startsWith("#")) return undefined;
  const pointer = fragment.slice(1);
  if (pointer.length === 0) return root;
  if (!pointer.startsWith("/")) return undefined;
  let current = root;
  for (const encodedSegment of pointer.slice(1).split("/")) {
    if (/~(?:[^01]|$)/u.test(encodedSegment)) return undefined;
    const segment = encodedSegment.replace(/~1/gu, "/").replace(/~0/gu, "~");
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(segment)) return undefined;
      const index = Number(segment);
      if (!Number.isSafeInteger(index) || !Object.hasOwn(current, index)) {
        return undefined;
      }
      current = current[index];
      continue;
    }
    if (!isRecord(current) || !Object.hasOwn(current, segment)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function projectionRowDigest(
  projection: IntrinsicPublicOperationContractProjection,
): Sha256Digest {
  const { rowRef: _rowRef, rowDigest: _rowDigest, ...body } = projection;
  return sha256Canonical(body as unknown as JsonValue);
}

function parseOperationProjection(
  bytes: Uint8Array,
): IntrinsicPublicOperationContractProjection | null {
  const value = parseCanonicalPayload(bytes);
  if (
    !isRecord(value) ||
    value.rowKind !== "public_operation_contract" ||
    value.operationVersion !== "5.0.0" ||
    !isNonblankString(value.operationId) ||
    !isSha256Digest(value.rowDigest) ||
    !isNonblankString(value.rowRef) ||
    !Array.isArray(value.definitions)
  ) {
    return null;
  }
  const projection = value as unknown as IntrinsicPublicOperationContractProjection;
  return projection.rowDigest === projectionRowDigest(projection)
    ? projection
    : null;
}

function parseAdapterProjection(
  bytes: Uint8Array,
): ArtifactPublicAdapterProjection | null {
  const value = parseCanonicalPayload(bytes);
  if (
    !isRecord(value) ||
    value.kind !== "public_adapter_projection" ||
    value.schemaVersion !== "5.0.0" ||
    !isRecord(value.family) ||
    !Array.isArray(value.sdkMembers) ||
    !Array.isArray(value.cliGrammar) ||
    !Array.isArray(value.documentationInventory)
  ) {
    return null;
  }
  return value as unknown as ArtifactPublicAdapterProjection;
}

function operationProjectionClaims(
  manifest: ProductManifestView,
  publicContracts: readonly ProductPublicContract[],
  payloadFiles: ReadonlyMap<string, Uint8Array>,
): boolean {
  return (
    manifest.productId === ABI5_PRODUCT_ID &&
    manifest.packageName === ABI5_PACKAGE_NAME
  ) ||
    manifest.declaredCapabilityRefs.includes(PUBLIC_OPERATOR_CAPABILITY) ||
    payloadFiles.has(PUBLIC_ADAPTER_PROJECTION_PATH) ||
    [...payloadFiles.keys()].some((path) =>
      PUBLIC_OPERATION_PROJECTION_PATH.test(path)
    ) ||
    publicContracts.some(({ contractId }) =>
      contractId.startsWith("abg.operation.")
    );
}

/**
 * PFC-F08A is deliberately private to Product verification. Its only family,
 * catalog, and operation inputs are the bytes and rows already admitted above.
 */
function bindDefinitionContractCoordinates(
  manifest: ProductManifestView,
  publicContracts: readonly ProductPublicContract[],
  payloadFiles: ReadonlyMap<string, Uint8Array>,
  productContentDigest: Sha256Digest,
): DefinitionContractBindingResult {
  if (!operationProjectionClaims(manifest, publicContracts, payloadFiles)) {
    return null;
  }
  if (
    manifest.productId !== ABI5_PRODUCT_ID ||
    manifest.packageName !== ABI5_PACKAGE_NAME
  ) {
    return bindingFailure(
      "public-function projections are not selected for this Product identity",
    );
  }
  const manifestCatalog = manifest.publicContractCatalog;
  if (
    manifestCatalog.schemaVersion !== "5.0.0" ||
    manifestCatalog.catalogVersion !== "5.0.0" ||
    !sameCanonical(manifestCatalog.rows, publicContracts)
  ) {
    return bindingFailure(
      "the verified public catalog is not the selected 5.0 Product catalog",
    );
  }
  const catalog: ProductPublicContractCatalog = {
    schemaVersion: "5.0.0",
    catalogId: manifestCatalog.catalogId,
    catalogVersion: "5.0.0",
    catalogSchemaPath: manifestCatalog.catalogSchemaPath,
    catalogSchemaDigest: manifestCatalog.catalogSchemaDigest,
    rows: publicContracts,
    catalogDigest: manifestCatalog.catalogDigest,
  };
  const { catalogDigest: _catalogDigest, ...catalogBody } = catalog;
  if (
    sha256Canonical(catalogBody as unknown as JsonValue) !==
      catalog.catalogDigest
  ) {
    return bindingFailure("the verified public catalog identity diverged");
  }

  const adapterBytes = payloadFiles.get(PUBLIC_ADAPTER_PROJECTION_PATH);
  const adapter = adapterBytes === undefined
    ? null
    : parseAdapterProjection(adapterBytes);
  if (adapter === null) {
    return bindingFailure(
      "the content-verified public-function adapter projection is absent or malformed",
    );
  }

  const hostAdapter = PUBLIC_PROJECTION_PAYLOADS.adapterAsset.content;
  if (!sameCanonical(adapter, hostAdapter)) {
    return bindingFailure(
      "the artifact does not declare the selected exact 18/56 public-function family",
    );
  }

  const declaredKeys = new Map<string, PublicDocumentationInventoryRow>();
  for (const row of adapter.documentationInventory) {
    const key = readDefinitionKey(row.definitionKey);
    if (key === null) {
      return bindingFailure("the declared public-function family key is malformed");
    }
    const token = definitionKeyToken(key);
    if (declaredKeys.has(token)) {
      return bindingFailure("the declared public-function family contains a duplicate key");
    }
    declaredKeys.set(token, row);
  }
  const declaredSdkKeys = adapter.sdkMembers.map(({ definitionKey }) =>
    definitionKeyToken(definitionKey)
  );
  const declaredCliKeys = adapter.cliGrammar.map(({ definitionKey }) =>
    definitionKeyToken(definitionKey)
  );
  if (
    declaredKeys.size !== 56 ||
    new Set(declaredSdkKeys).size !== 56 ||
    new Set(declaredCliKeys).size !== 56 ||
    [...declaredKeys.keys()].some((key) =>
      !declaredSdkKeys.includes(key) || !declaredCliKeys.includes(key)
    )
  ) {
    return bindingFailure(
      "the content-verified adapter projection does not close all 56 definitions",
    );
  }
  const declaredOperationIds = new Set(
    [...declaredKeys.values()].map(({ definitionKey }) =>
      definitionKey.operationId
    ),
  );
  if (declaredOperationIds.size !== 18) {
    return bindingFailure(
      "the content-verified adapter projection does not close all 18 operations",
    );
  }

  const operationRows = catalog.rows.filter((row) =>
    row.contractId.startsWith("abg.operation.") ||
    (
      row.assetLocator !== undefined &&
      PUBLIC_OPERATION_PROJECTION_PATH.test(row.assetLocator.path)
    )
  );
  const operationAssetPaths = [...payloadFiles.keys()].filter((path) =>
    PUBLIC_OPERATION_PROJECTION_PATH.test(path)
  );
  if (
    operationRows.length !== declaredOperationIds.size ||
    operationAssetPaths.length !== declaredOperationIds.size ||
    new Set(operationRows.map(({ contractId }) => contractId)).size !==
      operationRows.length ||
    new Set(operationAssetPaths).size !== operationAssetPaths.length ||
    [...declaredOperationIds].some((operationId) =>
      !operationRows.some(({ contractId }) => contractId === operationId)
    ) ||
    operationRows.some(({ assetLocator }) =>
      assetLocator === undefined ||
      !operationAssetPaths.includes(assetLocator.path)
    ) ||
    operationAssetPaths.some((path) =>
      !operationRows.some(({ assetLocator }) => assetLocator?.path === path)
    )
  ) {
    return bindingFailure(
      "the verified catalog and operation-projection payload set are not exact",
    );
  }

  const hostProjectionByOperation = new Map(
    PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.map((asset) => [
      asset.operationId!,
      asset.content as unknown as IntrinsicPublicOperationContractProjection,
    ]),
  );
  const catalogCoordinate: PublicContractCatalogCoordinate = {
    productId: manifest.productId,
    productContentDigest,
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest,
  };
  const operations: CompleteDefinitionContractCoordinateMap["operations"][number][] = [];
  for (const operationId of [...declaredOperationIds].sort(compareUnicodeCodeUnits)) {
    const row = operationRows.find(({ contractId }) => contractId === operationId)!;
    const locator = row.assetLocator;
    if (
      row.contractVersion !== "5.0.0" ||
      row.contractKind !== "serialized_native_contract" ||
      row.owningProduct !== manifest.productId ||
      row.nativeTypedLocator === undefined ||
      locator === undefined ||
      locator.definitionRef !== undefined ||
      locator.schemaVersion !== "5.0.0"
    ) {
      return bindingFailure(
        `the verified catalog operation row is invalid: ${operationId}`,
      );
    }
    const bytes = payloadFiles.get(locator.path)!;
    const payloadDigest = sha256Bytes(bytes);
    if (
      payloadDigest !== row.contractDigest ||
      payloadDigest !== locator.contentDigest
    ) {
      return bindingFailure(
        `the verified operation projection digest diverged: ${operationId}`,
      );
    }
    const projection = parseOperationProjection(bytes);
    const hostProjection = hostProjectionByOperation.get(operationId);
    if (
      projection === null ||
      projection.operationId !== operationId ||
      !sameCanonical(projection.family, adapter.family) ||
      hostProjection === undefined
    ) {
      return bindingFailure(
        `the content-verified operation projection is not selected: ${operationId}`,
      );
    }

    const projectedMembers = new Map<string, typeof projection.definitions[number]>();
    for (const definition of projection.definitions) {
      const key = readDefinitionKey(definition.definitionKey);
      if (
        key === null ||
        key.operationId !== operationId ||
        projectedMembers.has(key.memberKey)
      ) {
        return bindingFailure(
          `the operation projection contains an invalid definition key: ${operationId}`,
        );
      }
      const declared = declaredKeys.get(definitionKeyToken(key));
      if (
        declared === undefined ||
        definition.definitionRef !== declared.definitionRef ||
        definition.definitionDigest !== declared.definitionDigest
      ) {
        return bindingFailure(
          `the operation projection diverges from the adapter family: ${operationId}/${key.memberKey}`,
        );
      }
      projectedMembers.set(key.memberKey, definition);
    }
    const declaredMemberKeys = [...declaredKeys.values()]
      .filter(({ definitionKey }) => definitionKey.operationId === operationId)
      .map(({ definitionKey }) => definitionKey.memberKey);
    if (
      projectedMembers.size !== declaredMemberKeys.length ||
      declaredMemberKeys.some((memberKey) => !projectedMembers.has(memberKey))
    ) {
      return bindingFailure(
        `the operation projection is partial or extra: ${operationId}`,
      );
    }

    const members: CompleteDefinitionContractCoordinateMap["operations"][number]["members"][number][] = [];
    for (const memberKey of [...projectedMembers.keys()].sort(compareUnicodeCodeUnits)) {
      const definition = projectedMembers.get(memberKey)!;
      const definitionKey = definition.definitionKey;
      const seenPointers = new Set<string>();
      const makeCoordinate = (
        slot: "request" | "result" | "refusal" | "non_terminal",
        selected: typeof definition.requestContract,
      ): PublicContractCoordinate | null => {
        if (
          selected.identity.slot !== slot ||
          !sameCanonical(selected.identity.definitionKey, definitionKey) ||
          seenPointers.has(selected.definitionRef) ||
          !sameCanonical(
            resolveJsonFragment(projection, selected.definitionRef),
            selected.identity,
          )
        ) {
          return null;
        }
        seenPointers.add(selected.definitionRef);
        return {
          contractCatalog: catalogCoordinate,
          flatRow: {
            contractId: row.contractId,
            contractVersion: row.contractVersion,
            contractDigest: row.contractDigest,
          },
          nestedSelector: {
            selectorKind: "operation_definition_slot",
            definitionKey,
            slot,
            definitionRef: selected.definitionRef,
          },
        };
      };
      const request = makeCoordinate("request", definition.requestContract);
      const result = makeCoordinate("result", definition.resultContract);
      const refusalCoordinate = makeCoordinate(
        "refusal",
        definition.refusalContract,
      );
      const nonTerminal = definition.nonTerminalContract === null
        ? null
        : makeCoordinate("non_terminal", definition.nonTerminalContract);
      if (
        request === null ||
        result === null ||
        refusalCoordinate === null ||
        (
          definition.nonTerminalContract !== null &&
          nonTerminal === null
        )
      ) {
        return bindingFailure(
          `the operation projection contains a cross-slot pointer: ${operationId}/${memberKey}`,
        );
      }
      members.push({
        memberKey,
        slots: {
          request,
          result,
          refusal: refusalCoordinate,
          nonTerminal,
        },
      });
    }
    if (!sameCanonical(projection, hostProjection)) {
      return bindingFailure(
        `the content-verified operation projection is not selected: ${operationId}`,
      );
    }
    operations.push({ operationId, members });
  }

  const admitted = safeParse(
    completeDefinitionContractCoordinateMapSchema,
    { operations },
  );
  return admitted.success
    ? deepFreeze(admitted.output)
    : bindingFailure("the complete definition-contract coordinate map is malformed");
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

function isJsonSchemaValue(value: unknown): boolean {
  return typeof value === "boolean" || isRecord(value);
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
  if (pointer.length === 0) return isJsonSchemaValue(current);
  if (!pointer.startsWith("/")) return false;
  for (const encodedSegment of pointer.slice(1).split("/")) {
    if (/~(?:[^01]|$)/u.test(encodedSegment)) return false;
    const segment = encodedSegment.replace(/~1/gu, "/").replace(/~0/gu, "~");
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(segment)) return false;
      const index = Number(segment);
      if (
        !Number.isSafeInteger(index) ||
        index >= current.length ||
        !Object.hasOwn(current, index)
      ) {
        return false;
      }
      current = current[index];
      continue;
    }
    if (
      typeof current !== "object" ||
      current === null ||
      !Object.hasOwn(current, segment)
    ) {
      return false;
    }
    current = (current as Readonly<Record<string, unknown>>)[segment];
  }
  return isJsonSchemaValue(current);
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
    locators.includes(CAPABILITY_DEFINITION_GRAPH_ASSET_PATH) ||
    new Set(locators).size !== locators.length
  ) {
    return refusal(request, "unsafe_locator", "payload inventory contains an unsafe or duplicate path");
  }

  const expectedArchiveEntries = [
    "package/product-toolchain-manifest.json",
    `package/${CAPABILITY_DEFINITION_GRAPH_ASSET_PATH}`,
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
  const payloadFiles = new Map<string, Uint8Array>();
  try {
    for (const locator of [...locators].sort()) {
      const bytes = await readArchiveEntry(
        request.artifactPath,
        `package/${locator}`,
      );
      payloadFiles.set(locator, bytes);
      inventory.push({
        path: locator,
        sha256: sha256Bytes(bytes),
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
  const declarationSources = [...payloadFiles.entries()]
    .filter(([path]) => /\.d\.(?:c|m)?ts$/u.test(path))
    .map(([path, bytes]) => ({ path, bytes }));
  let verifiedNativeEvidence: NativeProductDeclarationEvidence | null = null;
  try {
    const schemaBytes = payloadFiles.get(
      manifest.publicContractCatalog.catalogSchemaPath,
    );
    if (schemaBytes === undefined) {
      throw new Error("catalog schema is absent from the product payload");
    }
    if (sha256Bytes(schemaBytes) !== manifest.publicContractCatalog.catalogSchemaDigest) {
      return refusal(request, "catalog_mismatch", "catalog schema digest is invalid");
    }

    const assetDigestByContract = new Map<string, Sha256Digest>();
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
        const assetBytes = payloadFiles.get(assetLocator.path);
        if (assetBytes === undefined) {
          throw new Error(`contract asset is absent: ${assetLocator.path}`);
        }
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
        assetDigestByContract.set(contract.contractId, assetDigest);
      }
    }

    const nativeContracts = publicContracts.filter(
      (contract) => contract.nativeTypedLocator !== undefined,
    );
    const nativeContractByCoordinate = new Map<string, ProductPublicContract>();
    const nativeDigestByContract = new Map<string, Sha256Digest>();
    if (nativeContracts.length > 0) {
      const declarationClosures = await resolveNativeDeclarationClosures({
        packageName: packageJson.name,
        packageType: packageJson.packageType,
        packageExports: packageJson.exports,
        declarationSources,
        sourceProductContentDigest: productContentDigest,
      });
      if (declarationClosures === null) {
        return refusal(
          request,
          "catalog_mismatch",
          "native declaration closure does not form a valid TypeScript program",
        );
      }
      const declarationClosureByExport = new Map(
        declarationClosures.map((closure) => [
          closure.packageExportPath,
          closure,
        ]),
      );
      const evidenceContracts: NativeProductDeclarationEvidence["contracts"][number][] =
        [];
      const selectedExportPaths = new Set<string>();
      for (const contract of nativeContracts) {
        const nativeLocator = contract.nativeTypedLocator!;
        const nativeCoordinate =
          `${nativeLocator.packageExportPath}\0${nativeLocator.namedSymbol}`;
        const existingNativeContract = nativeContractByCoordinate.get(
          nativeCoordinate,
        );
        if (
          existingNativeContract !== undefined &&
          (
            existingNativeContract.contractKind !==
              "serialized_native_contract" ||
            contract.contractKind !== "serialized_native_contract"
          )
        ) {
          return refusal(
            request,
            "catalog_mismatch",
            "one Product cannot assign one native symbol to multiple contracts",
          );
        }
        nativeContractByCoordinate.set(nativeCoordinate, contract);
        const declarationClosure = declarationClosureByExport.get(
          nativeLocator.packageExportPath,
        ) ?? null;
        if (
          !isSafeProductPath(nativeLocator.declarationPath) ||
          nativeLocator.packageName !== manifest.packageName ||
          declarationClosure === null ||
          declarationClosure.declarationPath !== nativeLocator.declarationPath ||
          canonicalJson(
            declarationClosure.declarationInventory as unknown as JsonValue,
          ) !== canonicalJson(
            nativeLocator.declarationInventory as unknown as JsonValue,
          )
        ) {
          return refusal(request, "catalog_mismatch", "native typed locator is invalid");
        }
        const exportedSymbols = new Set(declarationClosure.exportedSymbols);
        const pendingSelectors = contractIndexedPendingSelectors(
          productContentDigest,
          contract,
          declarationClosure,
        );
        if (pendingSelectors === null) {
          return refusal(
            request,
            "catalog_mismatch",
            "native contract pending-selector projection is invalid",
          );
        }
        const mayBeExternallyProjected = pendingSelectors.length > 0;
        if (
          !exportedSymbols.has(nativeLocator.namedSymbol) &&
          !mayBeExternallyProjected
        ) {
          return refusal(
            request,
            "catalog_mismatch",
            "native typed locator names an undeclared export",
          );
        }
        nativeDigestByContract.set(
          contract.contractId,
          sha256Canonical(
            declarationClosure.declarationInventory as unknown as JsonValue,
          ),
        );
        selectedExportPaths.add(nativeLocator.packageExportPath);
        evidenceContracts.push({
          contractId: contract.contractId,
          contractDigest: contract.contractDigest,
          packageExportPath: nativeLocator.packageExportPath,
          namedSymbol: nativeLocator.namedSymbol,
          localDisposition:
            pendingSelectors.length === 0 &&
              exportedSymbols.has(nativeLocator.namedSymbol)
              ? "local"
              : "pending_external",
          pendingSelectors,
        });
      }
      const selectedPaths = new Set(
        declarationClosures
          .filter((closure) =>
            selectedExportPaths.has(closure.packageExportPath)
          )
          .flatMap((closure) =>
          closure.declarationInventory.map((entry) => entry.declarationPath)
          ),
      );
      const selectedClosures = declarationClosures.filter((closure) =>
        selectedExportPaths.has(closure.packageExportPath) ||
        selectedPaths.has(closure.declarationPath)
      );
      verifiedNativeEvidence = deepFreeze({
        productId: manifest.productId,
        productContentDigest,
        packageName: manifest.packageName,
        packageType: packageJson.packageType,
        sources: declarationSources
          .filter((source) => selectedPaths.has(source.path))
          .map((source) => ({
            declarationPath: source.path,
            declarationDigest: sha256Bytes(source.bytes),
            sourceText: new TextDecoder().decode(source.bytes),
          }))
          .sort((left, right) =>
            compareUnicodeCodeUnits(
              left.declarationPath,
              right.declarationPath,
            )
          ),
        closures: selectedClosures,
        contracts: evidenceContracts.sort((left, right) =>
          compareUnicodeCodeUnits(left.contractId, right.contractId)
        ),
      });
    } else {
      verifiedNativeEvidence = deepFreeze({
        productId: manifest.productId,
        productContentDigest,
        packageName: manifest.packageName,
        packageType: packageJson.packageType,
        sources: [],
        closures: [],
        contracts: [],
      });
    }

    for (const contract of publicContracts) {
      const expectedContractDigest =
        contractLocatorLaw(contract.contractKind)!.digest === "native"
          ? nativeDigestByContract.get(contract.contractId) ?? null
          : assetDigestByContract.get(contract.contractId) ?? null;
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

  if (verifiedNativeEvidence === null) {
    return refusal(
      request,
      "contract_asset_mismatch",
      "native declaration evidence was not established",
    );
  }
  const coordinateBinding = bindDefinitionContractCoordinates(
    manifest,
    publicContracts,
    payloadFiles,
    productContentDigest,
  );
  if (coordinateBinding !== null && "message" in coordinateBinding) {
    return refusal(request, "catalog_mismatch", coordinateBinding.message);
  }
  const definitionContractCoordinates = coordinateBinding;

  let verifiedCapabilityDefinitionGraph: CapabilityDefinitionGraph;
  const graphAssetLocator = manifest.capabilityDefinitionGraph.assetLocator;
  try {
    if (!isSafeProductPath(graphAssetLocator.path)) {
      return refusal(request, "unsafe_locator", "capability graph path is unsafe");
    }
    const graphBytes = await readArchiveEntry(
      request.artifactPath,
      `package/${graphAssetLocator.path}`,
    );
    if (
      sha256Bytes(graphBytes) !== graphAssetLocator.contentDigest
    ) {
      return refusal(
        request,
        "contract_asset_mismatch",
        "capability graph asset digest is invalid",
      );
    }
    const decodedGraph = new TextDecoder("utf-8", { fatal: true }).decode(
      graphBytes,
    );
    const graphUnknown = JSON.parse(decodedGraph) as unknown;
    if (
      !isCapabilityDefinitionGraph(graphUnknown) ||
      canonicalJson(graphUnknown as unknown as JsonValue) !== decodedGraph
    ) {
      return refusal(
        request,
        "catalog_mismatch",
        "capability graph is not canonical admitted graph truth",
      );
    }
    const graph = graphUnknown;
    if (
      graph.graphId !== manifest.capabilityDefinitionGraph.graphId ||
      graph.graphVersion !== manifest.capabilityDefinitionGraph.graphVersion ||
      graph.graphDigest !== manifest.capabilityDefinitionGraph.graphDigest
    ) {
      return refusal(
        request,
        "catalog_mismatch",
        "capability graph coordinate differs from the Product manifest",
      );
    }
    const catalogCoordinate: PublicContractCatalogCoordinate = {
      productId: manifest.productId,
      productContentDigest,
      catalogId: manifest.publicContractCatalog.catalogId,
      catalogVersion: "5.0.0",
      catalogDigest: manifest.publicContractCatalog.catalogDigest,
    };
    const flatCoordinates: PublicContractCoordinate[] = publicContracts.map(
      (contract) => ({
        contractCatalog: catalogCoordinate,
        flatRow: {
          contractId: contract.contractId,
          contractVersion: contract.contractVersion,
          contractDigest: contract.contractDigest,
        },
        nestedSelector: {
          selectorKind: "flat_contract",
          definitionKey: null,
          slot: null,
          definitionRef: null,
        },
      }),
    );
    const definitionCoordinates = definitionContractCoordinates === null
      ? []
      : definitionContractCoordinates.operations.flatMap((operation) =>
        operation.members.flatMap((member) => [
          member.slots.request,
          member.slots.result,
          member.slots.refusal,
          ...(member.slots.nonTerminal === null
            ? []
            : [member.slots.nonTerminal]),
        ])
      );
    const expectedGraph = constructCapabilityDefinitionGraph([
      ...flatCoordinates,
      ...definitionCoordinates,
    ]);
    if (
      canonicalJson(expectedGraph as unknown as JsonValue) !==
        canonicalJson(graph as unknown as JsonValue) ||
      publicContracts.some((contract) =>
        canonicalJson(contract.capabilityIdentities as unknown as JsonValue) !==
          canonicalJson(
            capabilityRefsForContract(contract.contractId) as unknown as JsonValue,
          )
      )
    ) {
      return refusal(
        request,
        "catalog_mismatch",
        "capability graph ownership or catalog projection is crossed",
      );
    }
    const graphCapabilityIds = graph.rows.map(({ capabilityId }) => capabilityId);
    if (
      canonicalJson(graphCapabilityIds as unknown as JsonValue) !==
        canonicalJson(manifest.declaredCapabilityRefs as unknown as JsonValue) ||
      canonicalJson(graphCapabilityIds as unknown as JsonValue) !==
        canonicalJson([...publicCapabilityRefs].sort() as unknown as JsonValue)
    ) {
      return refusal(
        request,
        "catalog_mismatch",
        "capability graph, manifest, and catalog capability rosters differ",
      );
    }
    verifiedCapabilityDefinitionGraph = graph;
  } catch (error) {
    return refusal(request, "catalog_mismatch", String(error));
  }

  const verifiedBody = {
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
    capabilityDefinitionGraph: verifiedCapabilityDefinitionGraph,
    capabilityDefinitionGraphAsset: { ...graphAssetLocator },
    publicContracts,
    publicContractRefs: [...contractIds].sort(),
    publicCapabilityRefs: [...publicCapabilityRefs].sort(),
    definitionContractCoordinates,
    checkedPayloadFiles: inventory.length,
    nativeDeclarationEvidence: verifiedNativeEvidence,
  } as const satisfies Omit<
    VerifiedProductArtifact,
    "verificationDigest" | "verificationRef"
  >;
  const verificationDigest = sha256Canonical(
    verificationBody(verifiedBody),
  );
  return deepFreeze({
    ...verifiedBody,
    verificationRef:
      `product-verification://abiogenesis/${verificationDigest.slice("sha256:".length)}`,
    verificationDigest,
  });
}
