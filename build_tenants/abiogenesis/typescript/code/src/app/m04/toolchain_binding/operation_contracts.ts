// Owner-native payload contracts for the accepted T-281 workspace binding.

import * as v from "valibot";

import {
  absolutePosixPathSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  ownerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/toolchain_binding/operation_contracts.js";
const EXPORT_NAME = "TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES";
const TOOLCHAIN_BINDING_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "toolchain_binding"
} as const);
const SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-049..055",
  digest:
    "sha256:72b09080ed9b47643a73e762a8a43622b798f5b0c7d55d31906947432b783e74"
} as const);
const SOURCE_PRIMITIVES = freezeNativeValue({
  owner: TOOLCHAIN_BINDING_OWNER,
  contractShapeBasis: OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const installedProductRefSchema = v.strictObject({
  ref: refSchema,
  digest: sha256DigestSchema
});

const installedSetSchema = v.pipe(
  uniqueByNativeIdentityArray(installedProductRefSchema),
  v.minLength(1, "expected at least one installed product"),
  v.readonly()
);

const declaredRootsSchema = v.pipe(
  uniqueByNativeIdentityArray(absolutePosixPathSchema),
  v.minLength(1, "expected at least one declared root"),
  v.readonly()
);

const request = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.bind",
  variant: "bind",
  slot: "request",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_bind", "bind", "request"],
  schema: v.strictObject({
  workspaceAuthorityRef: refSchema,
  workspaceAuthorityDigest: sha256DigestSchema,
  installedSet: installedSetSchema,
  resolvedLockRef: refSchema,
  resolvedLockDigest: sha256DigestSchema,
  declaredRoots: declaredRootsSchema
  })
});

const result = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.bind",
  variant: "bind",
  slot: "result",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_bind", "bind", "result"],
  schema: v.strictObject({
    workspaceBindingRef: refSchema,
    workspaceBindingDigest: sha256DigestSchema,
    bindingManifestRef: refSchema,
    bindingManifestDigest: sha256DigestSchema
  })
});

const refusal = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.bind",
  variant: "bind",
  slot: "refusal",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_bind", "bind", "refusal"],
  schema: v.strictObject({
    code: v.picklist([
      "workspace_not_ready",
      "product_not_installed",
      "lock_mismatch",
      "root_invalid",
      "binding_conflict",
      "incompatible"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  })
});

export const TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  workspace_bind: {
    bind: { request, result, refusal }
  }
});
