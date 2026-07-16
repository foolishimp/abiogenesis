// Owner-native payload contracts and explicit gaps for T-281 materialization.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  ownerNativeOperationContractGap,
  ownerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/install_bootstrap/operation_contracts.js";
const EXPORT_NAME = "INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES";
const INSTALL_BOOTSTRAP_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "install_bootstrap"
} as const);
const CONTEXT_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-056",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const CONFIGURATION_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-058",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const OWNER_DESIGN_REF =
  "build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_DERIVATION.md";
const SOURCE_PRIMITIVES = freezeNativeValue({
  owner: INSTALL_BOOTSTRAP_OWNER,
  contractShapeBasis: OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const contextRequestGap = ownerNativeOperationContractGap({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_materialize_context_request_not_realized",
  coordinate: {
    definitionKey: {
      operationId: "abg.operation.product.materialize",
      memberKind: "variant",
      variant: "context_bootstrap"
    },
    slot: "request"
  },
  ownerAuthorityRef: CONTEXT_SEMANTIC_OWNER_BASIS.ref,
  ownerAuthorityDigest: CONTEXT_SEMANTIC_OWNER_BASIS.digest,
  ownerTicket: null,
  ownerDesignRef: OWNER_DESIGN_REF,
  evidenceRefs: [
    "code/src/app/m04/install_bootstrap/typescript_installer.ts",
    "code/src/app/m04/install_bootstrap/carriers.ts"
  ]
});

const contextResultGap = ownerNativeOperationContractGap({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_materialize_context_result_not_realized",
  coordinate: {
    definitionKey: {
      operationId: "abg.operation.product.materialize",
      memberKind: "variant",
      variant: "context_bootstrap"
    },
    slot: "result"
  },
  ownerAuthorityRef: CONTEXT_SEMANTIC_OWNER_BASIS.ref,
  ownerAuthorityDigest: CONTEXT_SEMANTIC_OWNER_BASIS.digest,
  ownerTicket: null,
  ownerDesignRef: OWNER_DESIGN_REF,
  evidenceRefs: [
    "code/src/app/m04/install_bootstrap/typescript_installer.ts",
    "code/src/app/m04/install_bootstrap/carriers.ts"
  ]
});

const contextRefusal = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "context_bootstrap",
  slot: "refusal",
  semanticOwnerBasis: CONTEXT_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "context_bootstrap", "refusal"],
  schema: v.strictObject({
    code: v.picklist([
      "workspace_not_ready",
      "binding_mismatch",
      "input_invalid",
      "authority_overwrite_forbidden",
      "filesystem_failure"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  })
});

const configurationRequestGap = ownerNativeOperationContractGap({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_materialize_configuration_request_not_realized",
  coordinate: {
    definitionKey: {
      operationId: "abg.operation.product.materialize",
      memberKind: "variant",
      variant: "configuration"
    },
    slot: "request"
  },
  ownerAuthorityRef: CONFIGURATION_SEMANTIC_OWNER_BASIS.ref,
  ownerAuthorityDigest: CONFIGURATION_SEMANTIC_OWNER_BASIS.digest,
  ownerTicket: null,
  ownerDesignRef: OWNER_DESIGN_REF,
  evidenceRefs: [
    "code/src/app/m04/install_bootstrap/typescript_installer.ts",
    "code/src/app/m04/install_bootstrap/carriers.ts"
  ]
});

const configurationResultGap = ownerNativeOperationContractGap({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_materialize_configuration_result_not_realized",
  coordinate: {
    definitionKey: {
      operationId: "abg.operation.product.materialize",
      memberKind: "variant",
      variant: "configuration"
    },
    slot: "result"
  },
  ownerAuthorityRef: CONFIGURATION_SEMANTIC_OWNER_BASIS.ref,
  ownerAuthorityDigest: CONFIGURATION_SEMANTIC_OWNER_BASIS.digest,
  ownerTicket: null,
  ownerDesignRef: OWNER_DESIGN_REF,
  evidenceRefs: [
    "code/src/app/m04/install_bootstrap/typescript_installer.ts",
    "code/src/app/m04/install_bootstrap/carriers.ts"
  ]
});

const configurationRefusal = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "configuration",
  slot: "refusal",
  semanticOwnerBasis: CONFIGURATION_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "configuration", "refusal"],
  schema: v.strictObject({
    code: v.picklist([
      "contract_invalid",
      "binding_mismatch",
      "input_invalid",
      "mutable_default_forbidden",
      "filesystem_failure"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  })
});

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
