// Implements: T-255; REQ-M-GTL3-CAPABILITY-001..015;
// REQ-P-PUBLIC-CONTRACTS.

export const TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID =
  "abg.schema.tenant-conformance-manifest" as const;

export const TENANT_CONFORMANCE_MANIFEST_SCHEMA_VERSION = "1.0.0" as const;

export const TENANT_CAPABILITY_SUPPORT_DISPOSITIONS = Object.freeze([
  "supported",
  "unsupported"
] as const);

export type TenantCapabilitySupportDisposition =
  (typeof TENANT_CAPABILITY_SUPPORT_DISPOSITIONS)[number];

export const TENANT_CONFORMANCE_CARRIER_CLASSIFICATIONS = Object.freeze([
  "root",
  "declaration",
  "causal",
  "derived",
  "transition",
  "closure_bearing"
] as const);

export type TenantConformanceCarrierClassification =
  (typeof TENANT_CONFORMANCE_CARRIER_CLASSIFICATIONS)[number];

export type TenantConformanceDigest = `sha256:${string}`;

export interface TenantPublicContractCatalogBasis {
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: TenantConformanceDigest;
}

export interface TenantPublicContractClaim {
  readonly claimRef: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly contractDigest: TenantConformanceDigest;
}

export interface TenantCapabilityClaim {
  readonly capabilityId: string;
  readonly owningContractClaimRef: string;
  readonly supportedDisposition: TenantCapabilitySupportDisposition;
  readonly dependentCapabilityIds: readonly string[];
}

export interface TenantEffectCapabilityBinding {
  readonly effectRef: string;
  readonly capabilityId: string;
}

export interface TenantConformanceEnforcementClaim {
  readonly contractClaimRef: string;
  readonly carrierClassification: TenantConformanceCarrierClassification;
  readonly applicableRuleIds: readonly string[];
  readonly causalPredecessorClaimRefs: readonly string[];
  readonly boundedProofRefs: readonly string[];
}

export interface TenantConformanceManifest {
  readonly kind: "abg_tenant_conformance_manifest";
  readonly schemaId: typeof TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID;
  readonly schemaVersion: typeof TENANT_CONFORMANCE_MANIFEST_SCHEMA_VERSION;
  readonly manifestId: string;
  readonly manifestVersion: string;
  readonly manifestDigest: TenantConformanceDigest;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly publicContractCatalog: TenantPublicContractCatalogBasis;
  readonly publicContractClaims: readonly TenantPublicContractClaim[];
  readonly capabilityClaims: readonly TenantCapabilityClaim[];
  readonly effectBindings: readonly TenantEffectCapabilityBinding[];
  readonly enforcementClaims: readonly TenantConformanceEnforcementClaim[];
}

export interface ResolvedTenantPublicContractClaim
  extends TenantPublicContractClaim {
  readonly catalogCapabilityRefs: readonly string[];
}

export interface ResolvedTenantCapabilityClaim extends TenantCapabilityClaim {
  readonly owningContract: ResolvedTenantPublicContractClaim;
}

export interface AdmittedTenantConformanceManifest {
  readonly kind: "admitted_tenant_conformance_manifest";
  readonly admissionRef: string;
  readonly admissionDigest: TenantConformanceDigest;
  readonly manifest: TenantConformanceManifest;
  readonly catalogBasis: TenantPublicContractCatalogBasis;
  readonly resolvedPublicContractClaims:
    readonly ResolvedTenantPublicContractClaim[];
  readonly resolvedCapabilityClaims: readonly ResolvedTenantCapabilityClaim[];
}
