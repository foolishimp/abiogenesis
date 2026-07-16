// Owner-native payload contracts for the accepted T-281 workspace definitions.

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

type WorkspaceOperationId =
  | "abg.operation.workspace.create"
  | "abg.operation.workspace.open";
type WorkspaceVariant = "clean" | "imported" | "open";
type WorkspaceSlot = "request" | "result" | "refusal";

const MODULE_PATH = "code/src/app/m04/workspace/operation_contracts.js";
const EXPORT_NAME = "WORKSPACE_NATIVE_CONTRACT_SOURCES";
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

const refListSchema = uniqueByNativeIdentityArray(refSchema);

function familyKey(operationId: WorkspaceOperationId):
  | "workspace_create"
  | "workspace_open" {
  return operationId === "abg.operation.workspace.create"
    ? "workspace_create"
    : "workspace_open";
}

function source<
  const OperationId extends WorkspaceOperationId,
  const Variant extends WorkspaceVariant,
  const Slot extends WorkspaceSlot,
  const S extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly slot: Slot;
  readonly schema: S;
}) {
  const suffix = `${input.operationId.slice("abg.operation.".length)}.${input.variant}.${input.slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "app.m04",
        family: "workspace"
      },
      subject: {
        operationId: input.operationId,
        variant: input.variant,
        slot: input.slot
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
      memberPath: [
        familyKey(input.operationId),
        input.variant,
        input.slot,
        "schema"
      ]
    },
    schema: input.schema
  });
}

const refusal = <const Codes extends readonly [string, ...string[]]>(
  codes: Codes
) => v.strictObject({
  code: v.picklist(codes),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
});

const cleanRequest = source({
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "request",
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    createPolicy: v.literal("clean")
  })
});

const cleanResult = source({
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "result",
  schema: v.strictObject({
    workspaceRef: refSchema,
    creationManifestRef: refSchema,
    provenanceRefs: refListSchema
  })
});

const cleanRefusal = source({
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "refusal",
  schema: refusal([
    "invalid_target",
    "workspace_exists",
    "workspace_identity_conflict",
    "filesystem_failure"
  ])
});

const importedRequest = source({
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "request",
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    createPolicy: v.literal("clean"),
    importAuthorityRef: refSchema,
    importAuthorityDigest: sha256DigestSchema
  })
});

const importedResult = source({
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "result",
  schema: v.strictObject({
    workspaceRef: refSchema,
    creationManifestRef: refSchema,
    importAuthorityRef: refSchema,
    importAuthorityDigest: sha256DigestSchema,
    provenanceRefs: refListSchema
  })
});

const importedRefusal = source({
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "refusal",
  schema: refusal([
    "invalid_target",
    "workspace_exists",
    "workspace_identity_conflict",
    "filesystem_failure",
    "import_authority_invalid"
  ])
});

const openRequest = source({
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "request",
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    expectedWorkspaceAuthorityRef: refSchema,
    expectedWorkspaceAuthorityDigest: sha256DigestSchema
  })
});

const openResult = source({
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "result",
  schema: v.strictObject({
    workspaceRef: refSchema,
    workspaceAuthorityBasisRef: refSchema,
    workspaceAuthorityBasisDigest: sha256DigestSchema,
    readiness: v.picklist(["ready", "unbound"]),
    manifestRef: refSchema,
    manifestDigest: sha256DigestSchema,
    residualRefs: refListSchema
  })
});

const openRefusal = source({
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "refusal",
  schema: refusal([
    "invalid_target",
    "workspace_missing",
    "authority_basis_mismatch",
    "manifest_invalid"
  ])
});

export const WORKSPACE_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  workspace_create: {
    clean: {
      request: cleanRequest,
      result: cleanResult,
      refusal: cleanRefusal
    },
    imported: {
      request: importedRequest,
      result: importedResult,
      refusal: importedRefusal
    }
  },
  workspace_open: {
    open: {
      request: openRequest,
      result: openResult,
      refusal: openRefusal
    }
  }
});
