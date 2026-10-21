import * as v from "valibot";

import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";

import {
  completeDefinitionContractCoordinateMapSchema,
  contractIndexedPendingExternalSelectorSchema,
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  requestDependentAuthoritySlot,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
  uniqueArray,
} from "../shared/public_function_contracts.js";

const VERIFY_AUTHORITY =
  "authority://abiogenesis/product/verification@5";

const dependencyRequirementSchema = v.strictObject({
  kind: v.literal("requires"),
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  requiredContractRefs: refSetSchema,
  requiredCapabilityRefs: refSetSchema,
});

const compatibilityRequirementSchema = v.strictObject({
  compatibilityRef: nonblankSchema,
  subjectRef: nonblankSchema,
});

const commonRequest = {
  artifact: refDigestSchema,
  productContent: refDigestSchema,
  descriptor: refDigestSchema,
  contributionManifest: refDigestSchema,
  declaredDependencies: uniqueArray(dependencyRequirementSchema),
  compatibilityInputs: uniqueArray(compatibilityRequirementSchema),
} as const;

const requestSchema = v.union([
  v.strictObject({
    targetKind: v.literal("packed_artifact"),
    ...commonRequest,
  }),
  v.strictObject({
    targetKind: v.literal("installed_artifact"),
    ...commonRequest,
    resolvedLock: refDigestSchema,
    installedProduct: refDigestSchema,
    installManifest: refDigestSchema,
  }),
]);

const resultSchema = v.union([
  v.strictObject({
    targetKind: v.literal("packed_artifact"),
    disposition: v.literal("locally_verified"),
    verifiedArtifact: refDigestSchema,
    localNativeEvidence: refDigestSchema,
    pendingExternalSelectors: uniqueArray(
      contractIndexedPendingExternalSelectorSchema,
    ),
    definitionContractCoordinates: v.nullable(
      completeDefinitionContractCoordinateMapSchema,
    ),
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
  v.strictObject({
    targetKind: v.literal("installed_artifact"),
    disposition: v.literal("installed_verified"),
    verifiedArtifact: refDigestSchema,
    resolvedLock: refDigestSchema,
    installedProduct: refDigestSchema,
    definitionContractCoordinates: v.nullable(
      completeDefinitionContractCoordinateMapSchema,
    ),
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
]);

const verify = ownerContractPacket(
  { operationId: "abg.operation.product.verify", memberKey: "verify" },
  requestSchema,
  resultSchema,
  refusalSchema([
    "artifact_mismatch",
    "content_mismatch",
    "identity_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "invalid_declared_dependency",
    "unsupported_contract",
    "lock_mismatch",
    "stale_installed_state",
  ]),
  null,
  {
    abstractModule: "Product.Verification",
    exportName: "PRODUCT_VERIFICATION_CONTRACTS",
    memberPath: ["verify"],
    authorityRef: VERIFY_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(VERIFY_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "attestation",
    effectClass: "deterministic_product_attestation",
    eventAdmission: "none",
    actorRequirement: "forbidden",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: [
      "capability_grants",
      requestDependentAuthoritySlot(
        "dependency_lock",
        ["targetKind"],
        ["installed_artifact"],
      ),
    ],
    capabilityRefs: capabilityRefsForDefinition({ operationId: "abg.operation.product.verify", memberKey: "verify" }),
    defaults: {},
    closedDomains: {
      targetKind: ["packed_artifact", "installed_artifact"],
      disposition: ["locally_verified", "installed_verified"],
    },
    sdkCoordinate: "sdk.product.verify",
    cliCoordinate: "product verify",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const PRODUCT_VERIFICATION_CONTRACTS = Object.freeze({ verify });

export interface ProductVerificationPort {
  readonly verify: ExactOwnerOperationPort<typeof verify>;
}
