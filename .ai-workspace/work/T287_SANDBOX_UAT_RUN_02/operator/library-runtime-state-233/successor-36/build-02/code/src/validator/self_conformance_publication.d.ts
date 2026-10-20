import type { ProductPublicContract, ProductNativeTypedLocator } from "../product/contracts.js";
/** Closed AF-22 subordinate asset rows; S06's operation publisher remains closed and unchanged. */
export declare function constructSelfConformanceAssetRows(input: {
    readonly productId: string;
    readonly schemaBytes: Uint8Array;
    readonly catalogBytes: Uint8Array;
    readonly nativeLocator: ProductNativeTypedLocator;
}): readonly ProductPublicContract[];
