import type { ProductPublicContract, ProductNativeTypedLocator } from "../product/contracts.js";
import { capabilityRefsForContract } from "../shared/capability_contracts.js";
import { sha256Bytes } from "../shared/digests.js";
import { SELF_CONFORMANCE_CATALOG_ASSET_PATH, SELF_CONFORMANCE_CATALOG_CONTRACT_ID } from "./self_conformance.js";
/** Closed AF-22 subordinate asset rows; S06's operation publisher remains closed and unchanged. */
export function constructSelfConformanceAssetRows(input: {
  readonly productId: string; readonly schemaBytes: Uint8Array; readonly catalogBytes: Uint8Array;
  readonly nativeLocator: ProductNativeTypedLocator;
}): readonly ProductPublicContract[] {
  const schemaPath = "contracts/schemas/self-conformance.schema.json";
  const rows: ProductPublicContract[] = [
    ...[["abg.schema.self-conformance-result", "SelfConformanceResult"],
      ["abg.schema.exact-candidate-qualification", "ExactCandidateQualification"],
      ["abg.schema.tenant-conformance-manifest", "TenantConformanceManifest"],
      ["abg.schema.qualification-law-basis", "QualificationLawBasis"],
      ["abg.schema.self-conformance-input", "SelfConformanceInput"]].map(([contractId, definitionName]) => ({
        contractId: contractId!, contractVersion: "5.0.0" as const, contractDigest: sha256Bytes(input.schemaBytes),
        contractKind: "schema_asset" as const, owningProduct: input.productId,
        requirementAuthorityRefs: ["specification/requirements/product/REQ-P-SELF-CONFORMANCE.md", "specification/requirements/product/REQ-P-QUAL.md#REQ-P-QUAL-057"],
        capabilityIdentities: capabilityRefsForContract(contractId!),
        assetLocator: { path: schemaPath, mediaType: "application/schema+json", schemaVersion: "5.0.0", contentDigest: sha256Bytes(input.schemaBytes), definitionRef: `#/$defs/${definitionName}` },
      })),
    { contractId: SELF_CONFORMANCE_CATALOG_CONTRACT_ID, contractVersion: "5.0.0", contractDigest: sha256Bytes(input.catalogBytes),
      contractKind: "serialized_native_contract", owningProduct: input.productId,
      requirementAuthorityRefs: ["specification/requirements/product/REQ-P-SELF-CONFORMANCE.md#REQ-P-SELF-CONFORMANCE-004"],
      capabilityIdentities: capabilityRefsForContract(SELF_CONFORMANCE_CATALOG_CONTRACT_ID),
      nativeTypedLocator: input.nativeLocator,
      assetLocator: { path: SELF_CONFORMANCE_CATALOG_ASSET_PATH, mediaType: "application/json", schemaVersion: "5.0.0", contentDigest: sha256Bytes(input.catalogBytes) } },
  ];
  return Object.freeze(rows);
}
