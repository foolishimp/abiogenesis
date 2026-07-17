// Owner-native payload contracts and explicit gaps for T-281 materialization.

import * as v from "valibot";

import {
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
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
const SOURCE_PRIMITIVES = freezeNativeValue({
  owner: INSTALL_BOOTSTRAP_OWNER,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const declaredInputSchema = v.strictObject({
  contractRef: refSchema,
  contractDigest: sha256DigestSchema,
  value: canonicalIJsonSchema
});

const contextManifestRowSchema = v.strictObject({
  surfaceRef: refSchema,
  surfaceDigest: sha256DigestSchema,
  disposition: v.picklist(["created", "refreshed", "preserved", "refused"]),
  evidenceRefs: refListSchema
});

const UNIQUE_CONTEXT_SURFACE_ACTION = Object.freeze(v.check(
  (rows: v.InferOutput<typeof contextManifestRowSchema>[]) =>
    new Set(rows.map((row) => row.surfaceRef)).size === rows.length,
  "expected one context materialization row per surface"
));

export const INSTALL_BOOTSTRAP_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/operation/install-bootstrap@5",
  checks: [
    {
      checkId: "unique-context-surface",
      action: UNIQUE_CONTEXT_SURFACE_ACTION,
      relationRef: "relation://abg/install-bootstrap/unique-context-surface"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const contextManifestRowsSchema = v.pipe(
  v.array(contextManifestRowSchema),
  v.minLength(1, "expected at least one context materialization row"),
  UNIQUE_CONTEXT_SURFACE_ACTION,
  v.readonly()
);

const contextRequest = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "context_bootstrap",
  slot: "request",
  semanticOwnerBasis: CONTEXT_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "context_bootstrap", "request"],
  schema: v.strictObject({
    targetWorkspaceRef: refSchema,
    targetWorkspaceDigest: sha256DigestSchema,
    selectedBindingRef: refSchema,
    selectedBindingDigest: sha256DigestSchema,
    declaredContextInputs: declaredInputSchema
  })
});

const contextResult = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "context_bootstrap",
  slot: "result",
  semanticOwnerBasis: CONTEXT_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "context_bootstrap", "result"],
  schema: v.strictObject({
    affectedWorkspaceRef: refSchema,
    affectedWorkspaceDigest: sha256DigestSchema,
    bootstrapAssetRef: refSchema,
    bootstrapAssetDigest: sha256DigestSchema,
    materializationManifestRef: refSchema,
    materializationManifestDigest: sha256DigestSchema,
    rows: contextManifestRowsSchema,
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
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

const configurationRequest = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "configuration",
  slot: "request",
  semanticOwnerBasis: CONFIGURATION_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "configuration", "request"],
  schema: v.strictObject({
    configurationContractRef: refSchema,
    configurationContractDigest: sha256DigestSchema,
    selectedBindingRef: refSchema,
    selectedBindingDigest: sha256DigestSchema,
    declaredInputs: declaredInputSchema
  })
});

const configurationResult = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.materialize",
  variant: "configuration",
  slot: "result",
  semanticOwnerBasis: CONFIGURATION_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_materialize", "configuration", "result"],
  schema: v.strictObject({
    affectedWorkspaceRef: refSchema,
    affectedWorkspaceDigest: sha256DigestSchema,
    configurationSubjectRef: refSchema,
    configurationSubjectDigest: sha256DigestSchema,
    configurationContentRef: refSchema,
    configurationContentDigest: sha256DigestSchema,
    materializationManifestRef: refSchema,
    materializationManifestDigest: sha256DigestSchema,
    validationDisposition: v.literal("validated"),
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
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
      request: contextRequest,
      result: contextResult,
      refusal: contextRefusal
    },
    configuration: {
      request: configurationRequest,
      result: configurationResult,
      refusal: configurationRefusal
    }
  }
});
