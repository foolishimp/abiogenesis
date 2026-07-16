// Owner-native payload contracts and explicit gaps for T-281 materialization.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import { ownerNativeOperationContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

type MaterializeVariant = "context_bootstrap" | "configuration";
type MaterializeGapSlot = "request" | "result";
type MaterializeGapCode =
  | "p1_contract_materialize_context_request_not_realized"
  | "p1_contract_materialize_context_result_not_realized"
  | "p1_contract_materialize_configuration_request_not_realized"
  | "p1_contract_materialize_configuration_result_not_realized";

export interface MaterializeOperationContractGap<
  Variant extends MaterializeVariant = MaterializeVariant,
  Slot extends MaterializeGapSlot = MaterializeGapSlot
> {
  readonly kind: "semantic_not_realized";
  readonly gapCode: MaterializeGapCode;
  readonly definitionKey: {
    readonly operationId: "abg.operation.product.materialize";
    readonly memberKind: "variant";
    readonly variant: Variant;
  };
  readonly slot: Slot;
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: `sha256:${string}`;
  readonly ownerDesignRef: string;
  readonly evidenceRefs: readonly [string, ...string[]];
}

const MODULE_PATH =
  "code/src/app/m04/install_bootstrap/operation_contracts.js";
const EXPORT_NAME = "INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES";
const DESIGN_REF =
  "design://abg/m04/public-operation-definition-family";
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

function source<
  const Variant extends MaterializeVariant,
  const S extends v.GenericSchema
>(variant: Variant, schema: S) {
  const suffix = `product.materialize.${variant}.refusal`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "app.m04",
        family: "install_bootstrap"
      },
      subject: {
        operationId: "abg.operation.product.materialize",
        variant,
        slot: "refusal"
      },
      carrierRevision: "5.0.0",
      lawBasis: { ref: DESIGN_REF, digest: DESIGN_DIGEST }
    },
    identity: {
      contractId: `abg.contract.operation.${suffix}`,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.operation.${suffix}`,
      schemaVersion: "5.0.0"
    },
    sourceLocator: {
      kind: "private_source_module",
      sourceRoot: "semantic_build",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: ["product_materialize", variant, "refusal", "schema"]
    },
    schema
  });
}

function gap<
  const Variant extends MaterializeVariant,
  const Slot extends MaterializeGapSlot
>(input: {
  readonly variant: Variant;
  readonly slot: Slot;
  readonly gapCode: MaterializeGapCode;
}): MaterializeOperationContractGap<Variant, Slot> {
  return freezeNativeValue({
    kind: "semantic_not_realized",
    gapCode: input.gapCode,
    definitionKey: {
      operationId: "abg.operation.product.materialize",
      memberKind: "variant",
      variant: input.variant
    },
    slot: input.slot,
    ownerAuthorityRef: DESIGN_REF,
    ownerAuthorityDigest: DESIGN_DIGEST,
    ownerDesignRef:
      "build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md#closed-payload-semantics",
    evidenceRefs: [
      "code/src/app/m04/install_bootstrap/typescript_installer.ts",
      "code/src/app/m04/install_bootstrap/carriers.ts"
    ]
  });
}

const contextRequestGap = gap({
  variant: "context_bootstrap",
  slot: "request",
  gapCode: "p1_contract_materialize_context_request_not_realized"
});

const contextResultGap = gap({
  variant: "context_bootstrap",
  slot: "result",
  gapCode: "p1_contract_materialize_context_result_not_realized"
});

const contextRefusal = source("context_bootstrap", v.strictObject({
  code: v.picklist([
    "workspace_not_ready",
    "binding_mismatch",
    "input_invalid",
    "authority_overwrite_forbidden",
    "filesystem_failure"
  ]),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
}));

const configurationRequestGap = gap({
  variant: "configuration",
  slot: "request",
  gapCode: "p1_contract_materialize_configuration_request_not_realized"
});

const configurationResultGap = gap({
  variant: "configuration",
  slot: "result",
  gapCode: "p1_contract_materialize_configuration_result_not_realized"
});

const configurationRefusal = source("configuration", v.strictObject({
  code: v.picklist([
    "contract_invalid",
    "binding_mismatch",
    "input_invalid",
    "mutable_default_forbidden",
    "filesystem_failure"
  ]),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
}));

export const INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  product_materialize: {
    context_bootstrap: {
      request: contextRequestGap,
      result: contextResultGap,
      refusal: contextRefusal
    },
    configuration: {
      request: configurationRequestGap,
      result: configurationResultGap,
      refusal: configurationRefusal
    }
  }
});
