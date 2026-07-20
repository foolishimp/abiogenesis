import type { Sha256Digest } from "./digests.js";

export const ABI5_PRODUCT_ID = "product://abiogenesis/typescript-tenant@5.0.0-dev.286";
export const ABI5_PACKAGE_NAME = "@abiogenesis/typescript-tenant";
export const ABI5_PACKAGE_VERSION = "5.0.0-dev.286";

export interface VerifyProductRequest {
  readonly artifactPath: string;
  readonly artifactRef: string;
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
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly checkedPayloadFiles: number;
}

export const PRODUCT_VERIFICATION_REFUSAL_CODES = [
  "artifact_unreadable",
  "manifest_unreadable",
  "manifest_malformed",
  "identity_mismatch",
  "unsafe_locator",
  "payload_inventory_mismatch",
  "payload_unreadable",
  "product_content_mismatch",
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
