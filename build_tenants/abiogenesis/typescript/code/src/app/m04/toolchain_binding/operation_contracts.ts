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
import { ownerNativeOperationContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/toolchain_binding/operation_contracts.js";
const EXPORT_NAME = "TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES";
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

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

function source<
  const Slot extends "request" | "result" | "refusal",
  const S extends v.GenericSchema
>(slot: Slot, schema: S) {
  const suffix = `workspace.bind.bind.${slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "app.m04",
        family: "toolchain_binding"
      },
      subject: {
        operationId: "abg.operation.workspace.bind",
        variant: "bind",
        slot
      },
      carrierRevision: "5.0.0",
      lawBasis: {
        ref: "design://abg/m04/public-operation-definition-family",
        digest: DESIGN_DIGEST
      }
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
      memberPath: ["workspace_bind", "bind", slot, "schema"]
    },
    schema
  });
}

const request = source("request", v.strictObject({
  workspaceAuthorityRef: refSchema,
  workspaceAuthorityDigest: sha256DigestSchema,
  installedSet: installedSetSchema,
  resolvedLockRef: refSchema,
  resolvedLockDigest: sha256DigestSchema,
  declaredRoots: declaredRootsSchema
}));

const result = source("result", v.strictObject({
  workspaceBindingRef: refSchema,
  workspaceBindingDigest: sha256DigestSchema,
  bindingManifestRef: refSchema,
  bindingManifestDigest: sha256DigestSchema
}));

const refusal = source("refusal", v.strictObject({
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
}));

export const TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  workspace_bind: {
    bind: { request, result, refusal }
  }
});
