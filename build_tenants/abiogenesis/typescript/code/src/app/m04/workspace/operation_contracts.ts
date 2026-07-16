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
import {
  OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  ownerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH = "code/src/app/m04/workspace/operation_contracts.js";
const EXPORT_NAME = "WORKSPACE_NATIVE_CONTRACT_SOURCES";
const WORKSPACE_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "workspace"
} as const);
const CREATE_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-059",
  digest:
    "sha256:72b09080ed9b47643a73e762a8a43622b798f5b0c7d55d31906947432b783e74"
} as const);
const OPEN_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-060",
  digest:
    "sha256:72b09080ed9b47643a73e762a8a43622b798f5b0c7d55d31906947432b783e74"
} as const);
const WORKSPACE_SOURCE_PRIMITIVES = freezeNativeValue({
  owner: WORKSPACE_OWNER,
  contractShapeBasis: OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const refusal = <const Codes extends readonly [string, ...string[]]>(
  codes: Codes
) => v.strictObject({
  code: v.picklist(codes),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
});

const cleanRequest = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "request",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "clean", "request"],
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    createPolicy: v.literal("clean")
  })
});

const cleanResult = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "result",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "clean", "result"],
  schema: v.strictObject({
    workspaceRef: refSchema,
    creationManifestRef: refSchema,
    provenanceRefs: refListSchema
  })
});

const cleanRefusal = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "clean",
  slot: "refusal",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "clean", "refusal"],
  schema: refusal([
    "invalid_target",
    "workspace_exists",
    "workspace_identity_conflict",
    "filesystem_failure"
  ])
});

const importedRequest = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "request",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "imported", "request"],
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    createPolicy: v.literal("clean"),
    importAuthorityRef: refSchema,
    importAuthorityDigest: sha256DigestSchema
  })
});

const importedResult = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "result",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "imported", "result"],
  schema: v.strictObject({
    workspaceRef: refSchema,
    creationManifestRef: refSchema,
    importAuthorityRef: refSchema,
    importAuthorityDigest: sha256DigestSchema,
    provenanceRefs: refListSchema
  })
});

const importedRefusal = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.create",
  variant: "imported",
  slot: "refusal",
  semanticOwnerBasis: CREATE_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_create", "imported", "refusal"],
  schema: refusal([
    "invalid_target",
    "workspace_exists",
    "workspace_identity_conflict",
    "filesystem_failure",
    "import_authority_invalid"
  ])
});

const openRequest = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "request",
  semanticOwnerBasis: OPEN_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_open", "open", "request"],
  schema: v.strictObject({
    targetRoot: absolutePosixPathSchema,
    expectedWorkspaceAuthorityRef: refSchema,
    expectedWorkspaceAuthorityDigest: sha256DigestSchema
  })
});

const openReadyStateFields = freezeNativeValue({
  workspaceRef: refSchema,
  workspaceAuthorityBasisRef: refSchema,
  workspaceAuthorityBasisDigest: sha256DigestSchema,
  authorityMode: v.picklist([
    "clean_no_project_authority",
    "imported"
  ]),
  readiness: v.literal("ready"),
  configurationRefs: refListSchema,
  manifestRef: refSchema,
  manifestDigest: sha256DigestSchema,
  residualRefs: refListSchema
} as const);

const openResult = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "result",
  semanticOwnerBasis: OPEN_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_open", "open", "result"],
  schema: v.union([
    v.strictObject({
      ...openReadyStateFields,
      bindingDisposition: v.literal("bound"),
      bindingRef: refSchema
    }),
    v.strictObject({
      ...openReadyStateFields,
      bindingDisposition: v.literal("unbound"),
      bindingRef: v.null()
    })
  ])
});

const openRefusal = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "refusal",
  semanticOwnerBasis: OPEN_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_open", "open", "refusal"],
  schema: refusal(["missing", "malformed", "stale", "incompatible"])
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
