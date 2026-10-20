import type { InstallProductRequest, ProductInstallResult } from "./contracts.js";
export interface ProductInstallPacket {
    readonly kind: "product_install_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "install";
    readonly request: InstallProductRequest;
}
export declare function materializeProductInstall(packet: ProductInstallPacket): Promise<ProductInstallResult>;
export declare const ProductInstallPort: Readonly<{
    install: typeof materializeProductInstall;
    /** @internal The enclosing Definition resource owner has admitted artifact and lock. */
    installInResolvedLock: (packet: ProductInstallPacket) => Promise<ProductInstallResult>;
}>;
export declare const PRODUCT_INSTALL_CONTRACTS: Readonly<{
    install: typeof materializeProductInstall;
}>;
