import { type JsonValue } from "../shared/canonical_json.js";
import type { PublicContractCoordinate } from "../shared/public_invocation.js";
import { type NativeProductDeclarationEvidence } from "./declaration_exports.js";
import type { ProductContributionManifest, ProductDeclaredDependency, ProductPublicContract, ProductCapabilityDefinitionGraphManifestCoordinate, ProductVerificationCoordinates, ProductVerificationResult, VerifiedProductArtifact, VerifyProductRequest } from "./contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
type JsonRecord = {
    readonly [key: string]: JsonValue;
};
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
    readonly capabilityDefinitionGraph: ProductCapabilityDefinitionGraphManifestCoordinate;
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
export declare function selectOwnedProductVerification(request: unknown, artifact: unknown): VerifiedProductArtifact | null;
export declare function nativeDeclarationEvidenceForVerifiedArtifact(artifact: VerifiedProductArtifact): NativeProductDeclarationEvidence | null;
export declare function productVerificationCoordinates(artifact: VerifiedProductArtifact): ProductVerificationCoordinates;
export declare function isVerifiedProductArtifact(value: unknown): value is VerifiedProductArtifact;
export declare function isProductContributionManifest(value: unknown): value is ProductContributionManifest;
export declare function parseProductManifest(value: unknown): ProductManifestView | null;
/** Project one exact operation from the already selected immutable Product
 * manifest. This validates metadata identity, not package payloads or authority. */
export declare function projectProductManifestOperationCoordinate(value: unknown, operationId: string): PublicContractCoordinate | null;
export declare function parseProductPublicContract(value: unknown, productId: string): ProductPublicContract | null;
export declare function verifyProduct(request: VerifyProductRequest): Promise<ProductVerificationResult>;
export {};
