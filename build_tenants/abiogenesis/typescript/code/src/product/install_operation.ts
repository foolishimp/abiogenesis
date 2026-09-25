import type {
  InstallProductRequest,
  ProductInstallResult,
} from "./contracts.js";
import { installProduct, installProductInResolvedLock } from "./install_product.js";

export interface ProductInstallPacket {
  readonly kind: "product_install_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "install";
  readonly request: InstallProductRequest;
}

export async function materializeProductInstall(
  packet: ProductInstallPacket,
): Promise<ProductInstallResult> {
  return installProduct(packet.request);
}

export const ProductInstallPort = Object.freeze({
  install: materializeProductInstall,
  /** @internal The enclosing Definition resource owner has admitted artifact and lock. */
  installInResolvedLock: (packet: ProductInstallPacket): Promise<ProductInstallResult> =>
    installProductInResolvedLock(packet.request),
});

export const PRODUCT_INSTALL_CONTRACTS = Object.freeze({
  install: ProductInstallPort.install,
});
