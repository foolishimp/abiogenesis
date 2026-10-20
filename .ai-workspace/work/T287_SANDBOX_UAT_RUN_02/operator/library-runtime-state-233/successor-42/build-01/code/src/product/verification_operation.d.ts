import type { ProductVerificationOperationResult, VerifiedProductArtifact, VerifyProductRequest } from "./contracts.js";
import type { ProductInstall } from "./environment.js";
interface ProductVerificationPacketBase {
    readonly kind: "product_verification_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "verify";
    readonly request: VerifyProductRequest;
    readonly verifiedArtifact?: VerifiedProductArtifact;
}
export type ProductVerificationPacket = Readonly<ProductVerificationPacketBase & {
    readonly targetKind: "packed_artifact";
}> | Readonly<ProductVerificationPacketBase & {
    readonly targetKind: "installed_artifact";
    readonly installedProduct: ProductInstall;
}>;
export declare function verifyProductArtifact(packet: ProductVerificationPacket): Promise<ProductVerificationOperationResult>;
export declare const ProductVerificationPort: Readonly<{
    verify: typeof verifyProductArtifact;
}>;
export declare const PRODUCT_VERIFICATION_CONTRACTS: Readonly<{
    verify: typeof verifyProductArtifact;
}>;
export {};
