import * as v from "valibot";

import {
  absolutePathSchema,
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
} from "../shared/public_function_contracts.js";

const INSTALL_CAPABILITY = "abg.capability.install.bind-products@5";
const INSTALL_AUTHORITY =
  "authority://abiogenesis/product/installation@5";

const install = ownerContractPacket(
  { operationId: "abg.operation.product.install", memberKey: "install" },
  v.strictObject({
    verifiedArtifact: refDigestSchema,
    descriptor: refDigestSchema,
    contributionManifest: refDigestSchema,
    resolvedLock: refDigestSchema,
    targetRoot: absolutePathSchema,
    installPolicy: v.picklist(["clean", "idempotent"]),
  }),
  v.strictObject({
    disposition: v.picklist(["materialized", "idempotent"]),
    installedProduct: refDigestSchema,
    installManifest: refDigestSchema,
    installerManifest: refDigestSchema,
    resolvedLock: refDigestSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
  refusalSchema([
    "verification_failure",
    "target_failure",
    "identity_mismatch",
    "content_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "lock_mismatch",
    "contract_mismatch",
    "filesystem_failure",
  ]),
  null,
  {
    abstractModule: "Product.Installation",
    exportName: "PRODUCT_INSTALL_CONTRACTS",
    memberPath: ["install"],
    port: "ProductInstallPort.install",
    authorityRef: INSTALL_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(INSTALL_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "write",
    effectClass: "immutable_product_filesystem",
    eventAdmission: "immutable_artifact_boundary",
    actorRequirement: "required",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: [
      "capability_grants",
      "dependency_lock",
      "verification_references",
      "actor",
    ],
    capabilityRefs: [INSTALL_CAPABILITY],
    defaults: {},
    closedDomains: {
      installPolicy: ["clean", "idempotent"],
      disposition: ["materialized", "idempotent"],
    },
    sdkCoordinate: "sdk.product.install",
    cliCoordinate: "product install",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const PRODUCT_INSTALL_CONTRACTS = Object.freeze({ install });

export interface ProductInstallPort {
  readonly install: ExactOwnerOperationPort<typeof install>;
}
