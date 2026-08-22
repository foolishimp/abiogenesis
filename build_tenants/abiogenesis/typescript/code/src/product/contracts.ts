import type { Sha256Digest } from "../shared/digests.js";
import type {
  CapabilityDefinitionGraph,
  CapabilityDefinitionGraphCoordinate,
} from "../shared/capability_contracts.js";
import type { CompleteDefinitionContractCoordinateMap } from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type { ProductInstall, ResolvedProductLock } from "./environment.js";
import type { ProductVerificationEvidence } from "./verification_evidence.js";

export const ABI5_PRODUCT_ID = "product://abiogenesis/typescript-tenant@5.0.0-dev.286";
export const ABI5_PACKAGE_NAME = "@abiogenesis/typescript-tenant";
export const ABI5_PACKAGE_VERSION = "5.0.0-dev.286";

export interface ProductDeclaredDependency {
  readonly kind: "requires";
  readonly productId: string;
  readonly packageVersion: string;
  readonly compatibilityRef: string;
  readonly requiredContractRefs: readonly string[];
  readonly requiredCapabilityRefs: readonly string[];
}

export type ProductContributionKind =
  | "graph_function"
  | "node_type"
  | "overlay";

export interface ProductContributionManifestRow {
  readonly moduleRef: string;
  readonly handle: string;
  readonly kind: ProductContributionKind;
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRef: string;
  readonly readinessPrerequisiteRefs: readonly string[];
}

export interface ProductModulePublicationBinding {
  readonly moduleRef: string;
  readonly publicationDigest: Sha256Digest;
}

export interface ProductContributionManifest {
  readonly kind: "product_contribution_manifest";
  readonly schemaVersion: "5.0.0";
  readonly contributionManifestRef: string;
  readonly productId: string;
  readonly productVersion: string;
  readonly descriptorRef: string;
  readonly productContentDigest: Sha256Digest;
  readonly publicContractCatalogId: string;
  readonly publicContractCatalogDigest: Sha256Digest;
  readonly capabilityDefinitionGraph: CapabilityDefinitionGraphCoordinate;
  readonly publicationBindings: readonly ProductModulePublicationBinding[];
  readonly rows: readonly ProductContributionManifestRow[];
}

export interface ProductNativeDeclarationInventoryRow {
  readonly packageExportPath: string;
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
}

export interface ProductNativeTypedLocator {
  readonly packageName: string;
  readonly packageExportPath: string;
  readonly namedSymbol: string;
  readonly declarationPath: string;
  readonly declarationInventory:
    readonly ProductNativeDeclarationInventoryRow[];
}

export interface ProductAssetLocator {
  readonly path: string;
  readonly mediaType: string;
  readonly schemaVersion: string;
  readonly contentDigest: Sha256Digest;
  readonly definitionRef?: string;
}

export interface ProductCapabilityDefinitionGraphManifestCoordinate
  extends CapabilityDefinitionGraphCoordinate {
  readonly assetLocator: ProductAssetLocator;
}

export type ProductPublicContractKind =
  | "native_typed_group"
  | "schema_asset"
  | "serialized_native_contract"
  | "vocabulary_asset";

export interface ProductPublicContract {
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly contractDigest: Sha256Digest;
  readonly contractKind: ProductPublicContractKind;
  readonly owningProduct: string;
  readonly requirementAuthorityRefs: readonly string[];
  readonly capabilityIdentities: readonly string[];
  readonly nativeTypedLocator?: ProductNativeTypedLocator;
  readonly assetLocator?: ProductAssetLocator;
}

/** The one flat public-contract catalog embedded in the Product manifest. */
export interface ProductPublicContractCatalog {
  readonly schemaVersion: "5.0.0";
  readonly catalogId: string;
  readonly catalogVersion: "5.0.0";
  readonly catalogSchemaPath: string;
  readonly catalogSchemaDigest: Sha256Digest;
  readonly rows: readonly ProductPublicContract[];
  readonly catalogDigest: Sha256Digest;
}

export interface VerifyProductRequest {
  readonly artifactPath: string;
  readonly artifactRef: string;
  readonly expectedArtifactDigest: Sha256Digest;
  readonly expectedProductContentDigest: Sha256Digest;
  readonly expectedManifestDigest: Sha256Digest;
  readonly expectedProductId: string;
  readonly expectedPackageName: string;
  readonly expectedPackageVersion: string;
}

export interface VerifiedProductArtifact {
  readonly kind: "verified_product_artifact";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "verified";
  readonly verificationRef: string;
  readonly verificationDigest: Sha256Digest;
  readonly artifactRef: string;
  readonly artifactDigest: Sha256Digest;
  readonly artifactByteLength: number;
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly productContentDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly descriptorRef: string;
  readonly publisherNamespace: string;
  readonly contributionManifestRef: string;
  readonly contributionManifestDigest: Sha256Digest;
  readonly contributionManifest: ProductContributionManifest;
  readonly compatibilityRefs: readonly string[];
  readonly declaredDependencies: readonly ProductDeclaredDependency[];
  readonly provenanceRef: string;
  readonly declaredCapabilityRefs: readonly string[];
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly capabilityDefinitionGraph: CapabilityDefinitionGraph;
  readonly capabilityDefinitionGraphAsset: ProductAssetLocator;
  readonly publicContracts: readonly ProductPublicContract[];
  readonly publicContractRefs: readonly string[];
  readonly publicCapabilityRefs: readonly string[];
  readonly definitionContractCoordinates:
    CompleteDefinitionContractCoordinateMap | null;
  readonly checkedPayloadFiles: number;
  readonly nativeDeclarationEvidence:
    import("./declaration_exports.js").NativeProductDeclarationEvidence;
}

export const PRODUCT_VERIFICATION_REFUSAL_CODES = [
  "artifact_unreadable",
  "artifact_digest_mismatch",
  "manifest_unreadable",
  "manifest_malformed",
  "manifest_digest_mismatch",
  "identity_mismatch",
  "unsafe_locator",
  "payload_inventory_mismatch",
  "payload_unreadable",
  "product_content_mismatch",
  "contribution_mismatch",
  "catalog_mismatch",
  "contract_asset_mismatch",
] as const;

export type ProductVerificationRefusalCode =
  (typeof PRODUCT_VERIFICATION_REFUSAL_CODES)[number];

export interface ProductVerificationRefusal {
  readonly kind: "product_verification_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProductVerificationRefusalCode;
  readonly message: string;
  readonly artifactRef: string;
}

export type ProductVerificationResult =
  | ProductVerificationRefusal
  | VerifiedProductArtifact;

export interface ProductVerificationCoordinate<T = unknown> {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface ProductVerificationCoordinates {
  readonly verifiedArtifact:
    ProductVerificationCoordinate<"VerifiedProductArtifact">;
  readonly descriptor: ProductVerificationCoordinate<"ProductDescriptor">;
  readonly localNativeEvidence:
    ProductVerificationCoordinate<"LocalNativeContractEvidence">;
  readonly provenance:
    ProductVerificationCoordinate<"ProductVerificationProvenance">;
}

export interface ProductVerificationSuccess {
  readonly kind: "product_verification_success";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "verified";
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly coordinates: ProductVerificationCoordinates;
  readonly pendingExternalSelectors: readonly import("./declaration_exports.js").ContractIndexedPendingExternalSelector[];
  readonly definitionContractCoordinates:
    CompleteDefinitionContractCoordinateMap | null;
}

export interface ProductVerificationInstalledStateRefusal {
  readonly kind: "product_verification_installed_state_refusal";
  readonly schemaVersion: "5.0.0";
  readonly targetKind: "installed_artifact";
  readonly disposition: "refused";
  readonly code: "stale_installed_state";
  readonly message: string;
  readonly installedProductRef: string;
}

export type ProductVerificationOperationResult =
  | ProductVerificationRefusal
  | ProductVerificationInstalledStateRefusal
  | ProductVerificationSuccess;

export interface ProductVerificationArtifactResource {
  readonly kind: "product_verification_artifact_resource";
  readonly schemaVersion: "5.0.0";
  readonly artifactPath: string;
  readonly artifact: ReferenceDigest<"PackedProductArtifact">;
  readonly productContent: ReferenceDigest<"ProductContent">;
  readonly descriptor: ReferenceDigest<"ProductDescriptor">;
  readonly contributionManifest: ReferenceDigest<"ContributionManifest">;
  readonly manifestDigest: Sha256Digest;
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
}

export interface ProductVerificationInstallManifestResource {
  readonly kind: "product_verification_install_manifest_resource";
  readonly schemaVersion: "5.0.0";
  readonly manifestPath: string;
  readonly manifest: ReferenceDigest<"InstallManifest">;
}

export interface PackedProductVerificationResources {
  readonly kind: "product_verification_resources";
  readonly schemaVersion: "5.0.0";
  readonly targetKind: "packed_artifact";
  readonly packedArtifact: ProductVerificationArtifactResource;
}

export interface InstalledProductVerificationResources {
  readonly kind: "product_verification_resources";
  readonly schemaVersion: "5.0.0";
  readonly targetKind: "installed_artifact";
  readonly installedArtifact: ProductVerificationArtifactResource;
  readonly resolvedLock: ResolvedProductLock;
  readonly installedProduct: ProductInstall;
  readonly installManifest: ProductVerificationInstallManifestResource;
}

export type ProductVerificationResources =
  | PackedProductVerificationResources
  | InstalledProductVerificationResources;

export type ProductVerificationResourceDisposition =
  | Readonly<{
      kind: "product_verification_resource_disposition";
      schemaVersion: "5.0.0";
      targetKind: "packed_artifact";
      disposition: "read_only_unchanged";
      packedArtifact: ReferenceDigest<"PackedProductArtifact">;
    }>
  | Readonly<{
      kind: "product_verification_resource_disposition";
      schemaVersion: "5.0.0";
      targetKind: "installed_artifact";
      disposition: "read_only_unchanged";
      installedArtifact: ReferenceDigest<"PackedProductArtifact">;
      resolvedLock: ReferenceDigest<"ResolvedProductLock">;
      installedProduct: ReferenceDigest<"InstalledProduct">;
      installManifest: ReferenceDigest<"InstallManifest">;
    }>;

/**
 * The verify owner returns its immutable read disposition on every completion.
 * Only a complete verification success carries the Product-owned evidence.
 */
export interface ProductVerificationResourceReceipt {
  readonly kind: "product_verification_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "read_only_unchanged";
  readonly resourceDisposition: ProductVerificationResourceDisposition;
  readonly evidence: ProductVerificationEvidence | null;
}

export interface InstallProductRequest {
  readonly artifactPath: string;
  readonly targetRoot: string;
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly resolvedLock: ResolvedProductLock;
}

export interface ProductInstallCandidate {
  readonly kind: "product_install_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "materialized";
  readonly installId: string;
  readonly installedRoot: string;
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly descriptorRef: string;
  readonly publisherNamespace: string;
  readonly contributionManifestRef: string;
  readonly contributionManifestDigest: Sha256Digest;
  readonly contributionManifest: ProductContributionManifest;
  readonly compatibilityRefs: readonly string[];
  readonly declaredDependencies: readonly ProductDeclaredDependency[];
  readonly provenanceRef: string;
  readonly declaredCapabilityRefs: readonly string[];
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly capabilityDefinitionGraph: CapabilityDefinitionGraph;
  readonly capabilityDefinitionGraphAsset: ProductAssetLocator;
  readonly publicContracts: readonly ProductPublicContract[];
  readonly publicContractRefs: readonly string[];
  readonly publicCapabilityRefs: readonly string[];
  readonly resolvedLockId: string;
  readonly resolvedLockDigest: Sha256Digest;
}

export const PRODUCT_INSTALL_REFUSAL_CODES = [
  "target_not_empty",
  "artifact_mismatch",
  "dependency_lock_mismatch",
  "install_failed",
  "installed_identity_mismatch",
  "installed_manifest_mismatch",
  "unexpected_source_surface",
] as const;

export type ProductInstallRefusalCode =
  (typeof PRODUCT_INSTALL_REFUSAL_CODES)[number];

export interface ProductInstallRefusal {
  readonly kind: "product_install_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProductInstallRefusalCode;
  readonly message: string;
}

export type ProductInstallResult = ProductInstallCandidate | ProductInstallRefusal;
