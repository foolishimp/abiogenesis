import {
  verifyProduct,
} from "./verify_product.js";
import type {
  ProductVerificationResult,
  VerifyProductRequest,
} from "./contracts.js";

export interface ProductVerificationPacket {
  readonly kind: "product_verification_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "verify";
  readonly request: VerifyProductRequest;
}

export async function verifyProductArtifact(
  packet: ProductVerificationPacket,
): Promise<ProductVerificationResult> {
  return verifyProduct(packet.request);
}

export const ProductVerificationPort = Object.freeze({
  verify: verifyProductArtifact,
});

export const PRODUCT_VERIFICATION_CONTRACTS = Object.freeze({
  verify: ProductVerificationPort.verify,
});
