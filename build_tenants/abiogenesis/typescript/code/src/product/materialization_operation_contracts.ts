import * as v from "valibot";

import {
  type ExactOwnerOperationPort,
  jsonValueSchema,
  nonemptyRefDigestSetSchema,
  nonemptyUniqueArray,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
} from "../shared/public_function_contracts.js";

const MATERIALIZATION_AUTHORITY =
  "authority://abiogenesis/product/materialization@5";

const declaredContextInputSchema = v.strictObject({
  name: nonblankSchema,
  contract: refDigestSchema,
  value: jsonValueSchema,
});

const materializationRowSchema = v.strictObject({
  disposition: v.picklist(["created", "refreshed", "preserved"]),
  content: refDigestSchema,
});

const materializationRefusalSchema = refusalSchema([
  "workspace_mismatch",
  "binding_mismatch",
  "input_mismatch",
  "authority_mismatch",
  "contract_mismatch",
  "mutable_default",
  "filesystem_failure",
]);

function materializationMetadata(
  materializationKind: "context_bootstrap" | "configuration",
) {
  return ownerMetadata({
    authorityClass: "write",
    effectClass: "product_filesystem",
    eventAdmission: "immutable_artifact_boundary",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: ["abg.capability.install.bind-products@5"],
    defaults: {},
    closedDomains: { materializationKind: [materializationKind] },
    sdkCoordinate: "sdk.product.materialize",
    cliCoordinate: `product materialize ${materializationKind}`,
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  });
}

function materializationResult(
  materializationKind: "context_bootstrap" | "configuration",
) {
  return v.strictObject({
    materializationKind: v.literal(materializationKind),
    subject: refDigestSchema,
    content: refDigestSchema,
    manifest: refDigestSchema,
    rows: nonemptyUniqueArray(materializationRowSchema),
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  });
}

const contextBootstrap = ownerContractPacket(
  {
    operationId: "abg.operation.product.materialize",
    memberKey: "context_bootstrap",
  } as const,
  v.strictObject({
    workspace: refDigestSchema,
    binding: refDigestSchema,
    contextInputs: nonemptyUniqueArray(declaredContextInputSchema),
  }),
  materializationResult("context_bootstrap"),
  materializationRefusalSchema,
  null,
  {
    abstractModule: "Product.Materialization",
    exportName: "MATERIALIZATION_OPERATION_CONTRACTS",
    memberPath: ["context_bootstrap"],
    port: "ProductMaterializationPort.context_bootstrap",
    authorityRef: MATERIALIZATION_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(MATERIALIZATION_AUTHORITY),
  },
  materializationMetadata("context_bootstrap"),
);

const configuration = ownerContractPacket(
  {
    operationId: "abg.operation.product.materialize",
    memberKey: "configuration",
  } as const,
  v.strictObject({
    configurationContract: refDigestSchema,
    binding: refDigestSchema,
    inputs: jsonValueSchema,
  }),
  materializationResult("configuration"),
  materializationRefusalSchema,
  null,
  {
    abstractModule: "Product.Materialization",
    exportName: "MATERIALIZATION_OPERATION_CONTRACTS",
    memberPath: ["configuration"],
    port: "ProductMaterializationPort.configuration",
    authorityRef: MATERIALIZATION_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(MATERIALIZATION_AUTHORITY),
  },
  materializationMetadata("configuration"),
);

export const MATERIALIZATION_OPERATION_CONTRACTS = Object.freeze({
  context_bootstrap: contextBootstrap,
  configuration,
});

export interface ProductMaterializationPort {
  readonly context_bootstrap: ExactOwnerOperationPort<typeof contextBootstrap>;
  readonly configuration: ExactOwnerOperationPort<typeof configuration>;
}
