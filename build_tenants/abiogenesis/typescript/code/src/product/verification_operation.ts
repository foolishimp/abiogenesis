import {
  productVerificationCoordinates,
  verifyProduct,
} from "./verify_product.js";
import { installedProductContentMatches } from "./install_product.js";
import type {
  ProductVerificationOperationResult,
  VerifyProductRequest,
} from "./contracts.js";
import type { ProductInstall } from "./environment.js";
import { deepFreeze } from "../shared/immutable.js";

interface ProductVerificationPacketBase {
  readonly kind: "product_verification_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "verify";
  readonly request: VerifyProductRequest;
}

export type ProductVerificationPacket =
  | Readonly<ProductVerificationPacketBase & {
      readonly targetKind: "packed_artifact";
    }>
  | Readonly<ProductVerificationPacketBase & {
      readonly targetKind: "installed_artifact";
      readonly installedProduct: ProductInstall;
    }>;

export async function verifyProductArtifact(
  packet: ProductVerificationPacket,
): Promise<ProductVerificationOperationResult> {
  const result = await verifyProduct(packet.request);
  if (result.kind === "product_verification_refusal") return result;
  if (
    packet.targetKind === "installed_artifact" &&
    !(await installedProductContentMatches(packet.installedProduct))
  ) {
    return deepFreeze({
      kind: "product_verification_installed_state_refusal" as const,
      schemaVersion: "5.0.0" as const,
      targetKind: "installed_artifact" as const,
      disposition: "refused" as const,
      code: "stale_installed_state" as const,
      message: "the installed Product tree differs from its admitted content",
      installedProductRef: packet.installedProduct.installId,
    });
  }

  return deepFreeze({
    kind: "product_verification_success" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "verified" as const,
    verifiedArtifact: result,
    coordinates: productVerificationCoordinates(result),
    pendingExternalSelectors: result.nativeDeclarationEvidence.contracts.flatMap(
      (contract) => contract.pendingSelectors.map((selector) => ({
        ...selector,
        localAccessPath: [...selector.localAccessPath],
      })),
    ),
    definitionContractCoordinates: result.definitionContractCoordinates,
  });
}

export const ProductVerificationPort = Object.freeze({
  verify: verifyProductArtifact,
});

export const PRODUCT_VERIFICATION_CONTRACTS = Object.freeze({
  verify: ProductVerificationPort.verify,
});
