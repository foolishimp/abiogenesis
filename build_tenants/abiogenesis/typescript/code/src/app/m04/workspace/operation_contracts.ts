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
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerNativeDefinitionContractSource,
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
const WORKSPACE_STATUS_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/abg/REQ-R-ABG3-PROJECTION.md#REQ-R-ABG3-PROJECTION-023",
  digest:
    "sha256:ea67216190dc59dd14eac9797ab544ee79d9798673a82925d2d8bcddb2a2dfb5"
} as const);
const WORKSPACE_SOURCE_PRIMITIVES = freezeNativeValue({
  owner: WORKSPACE_OWNER,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME,
  namedChecks: {
    kind: "family_registry" as const,
    exportName: "WORKSPACE_NATIVE_CHECK_REGISTRY",
    memberPath: [] as const
  }
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1, "expected at least one residual reference"),
  v.readonly()
);
const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);
const refDigestListSchema = v.pipe(
  uniqueByNativeIdentityArray(refDigestSchema),
  v.readonly()
);

const workspaceStatusProjectionCarrierSchema = v.strictObject({
  kind: v.literal("workspace_status_projection"),
  projection: refDigestSchema,
  workspace: refDigestSchema,
  workspaceAuthority: refDigestSchema,
  binding: refDigestSchema,
  authorityMode: v.picklist([
    "clean_no_project_authority",
    "imported"
  ]),
  readiness: v.picklist(["ready", "stale", "malformed", "incompatible"]),
  boundProductRefs: v.pipe(
    uniqueByNativeIdentityArray(refSchema),
    v.minLength(1),
    v.readonly()
  ),
  configurations: refDigestListSchema,
  catalog: v.nullable(refDigestSchema),
  residualRefs: refListSchema,
  provenanceRefs: refListSchema
});

const WORKSPACE_STATUS_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof workspaceStatusProjectionCarrierSchema
    >) =>
      (projection.readiness === "ready") ===
      (projection.residualRefs.length === 0),
    "workspace readiness must match its residual truth"
  )
);

const workspaceStatusProjectionSchema = v.pipe(
  workspaceStatusProjectionCarrierSchema,
  WORKSPACE_STATUS_RELATION_ACTION,
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
  configurationRefs: refListSchema,
  configurationDigests: v.pipe(
    v.array(sha256DigestSchema),
    v.readonly()
  )
} as const);

const openObservedStateFields = freezeNativeValue({
  ...openReadyStateFields,
  readiness: v.picklist(["stale", "malformed", "incompatible"]),
  residualRefs: nonEmptyRefListSchema
} as const);

const openResultUnionSchema = v.union([
  v.strictObject({
    ...openReadyStateFields,
    readiness: v.literal("ready"),
    selectedBindingRef: refSchema,
    selectedBindingDigest: sha256DigestSchema,
    residualRefs: v.tuple([])
  }),
  v.strictObject({
    ...openReadyStateFields,
    readiness: v.literal("unbound"),
    selectedBindingRef: v.null(),
    selectedBindingDigest: v.null(),
    residualRefs: refListSchema
  }),
  v.strictObject({
    ...openObservedStateFields,
    observedBindingRef: refSchema,
    observedBindingDigest: sha256DigestSchema
  }),
  v.strictObject({
    ...openObservedStateFields,
    observedBindingRef: v.null(),
    observedBindingDigest: v.null()
  })
]);

const MATCHING_CONFIGURATION_DIGESTS_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof openResultUnionSchema>) =>
    value.configurationRefs.length === value.configurationDigests.length,
  "configuration refs and digests must have matching cardinality"
));

export const WORKSPACE_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/operation/workspace@5",
  checks: [
    {
      checkId: "matching-configuration-digests",
      action: MATCHING_CONFIGURATION_DIGESTS_ACTION,
      relationRef: "relation://abg/workspace/matching-configuration-digests"
    },
    {
      checkId: "workspace-status-relation",
      action: WORKSPACE_STATUS_RELATION_ACTION,
      relationRef: "REQ-R-ABG3-PROJECTION-023"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const workspaceStatusResult = ownerNativeDefinitionContractSource({
  owner: WORKSPACE_OWNER,
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "workspace_status"
  },
  slot: "result",
  semanticOwnerBasis: WORKSPACE_STATUS_SEMANTIC_OWNER_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME,
  memberPath: ["project_read", "workspace_status", "result"],
  namedChecks: WORKSPACE_SOURCE_PRIMITIVES.namedChecks,
  schema: workspaceStatusProjectionSchema
});

const openResult = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "result",
  semanticOwnerBasis: OPEN_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_open", "open", "result"],
  schema: v.pipe(
    openResultUnionSchema,
    MATCHING_CONFIGURATION_DIGESTS_ACTION
  )
});

const openRefusal = ownerNativeOperationContractSource({
  ...WORKSPACE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.workspace.open",
  variant: "open",
  slot: "refusal",
  semanticOwnerBasis: OPEN_SEMANTIC_OWNER_BASIS,
  memberPath: ["workspace_open", "open", "refusal"],
  schema: refusal([
    "invalid_target",
    "workspace_missing",
    "authority_basis_mismatch"
  ])
});

export const WORKSPACE_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    workspace_status: { result: workspaceStatusResult }
  },
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
