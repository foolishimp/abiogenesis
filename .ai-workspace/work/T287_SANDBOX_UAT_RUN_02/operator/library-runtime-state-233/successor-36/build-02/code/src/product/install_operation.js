import { installProduct, installProductInResolvedLock } from "./install_product.js";
export async function materializeProductInstall(packet) {
    return installProduct(packet.request);
}
export const ProductInstallPort = Object.freeze({
    install: materializeProductInstall,
    /** @internal The enclosing Definition resource owner has admitted artifact and lock. */
    installInResolvedLock: (packet) => installProductInResolvedLock(packet.request),
});
export const PRODUCT_INSTALL_CONTRACTS = Object.freeze({
    install: ProductInstallPort.install,
});
