import type { Sha256Digest } from "../shared/digests.js";
import type { ResolvedProductLock } from "./environment.js";

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
  readonly publicationBindings: readonly ProductModulePublicationBinding[];
  readonly rows: readonly ProductContributionManifestRow[];
}

export interface ProductNativeTypedLocator {
  readonly packageName: string;
  readonly packageExportPath: string;
  readonly namedSymbol: string;
  readonly exportedSymbols: readonly string[];
  readonly declarationPath: string;
}

export interface ProductAssetLocator {
  readonly path: string;
  readonly mediaType: string;
  readonly schemaVersion: string;
  readonly contentDigest: Sha256Digest;
  readonly definitionRef?: string;
}

export type ProductPublicContractKind =
  | "native_typed_group"
  | "schema_asset"
  | "serialized_native_contract"
  | "vocabulary_asset";

export interface ProductPublicContract {
  readonly contractId: string;
  readonly contractVersion: string;
  readonly contractDigest: Sha256Digest;
  readonly contractKind: ProductPublicContractKind;
  readonly owningProduct: string;
  readonly requirementAuthorityRefs: readonly string[];
  readonly capabilityIdentities: readonly string[];
  readonly nativeTypedLocator?: ProductNativeTypedLocator;
  readonly assetLocator?: ProductAssetLocator;
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
  readonly publicContracts: readonly ProductPublicContract[];
  readonly publicContractRefs: readonly string[];
  readonly publicCapabilityRefs: readonly string[];
  readonly checkedPayloadFiles: number;
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
