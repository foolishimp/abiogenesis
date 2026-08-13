import * as v from "valibot";

import {
  absolutePathSchema,
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
} from "../shared/public_function_contracts.js";

const WORKSPACE_CAPABILITY =
  "abg.capability.operator.public-contract@5";
const WORKSPACE_AUTHORITY =
  "authority://abiogenesis/product/workspace-operations@5";

const workspaceCreateRefusalSchema = refusalSchema([
  "invalid_target",
  "workspace_exists",
  "workspace_identity_conflict",
  "invalid_scaffold",
  "invalid_import_authority",
  "preservation_failure",
  "filesystem_failure",
]);

function workspaceCreateMetadata(createPolicy: "clean" | "imported") {
  return ownerMetadata({
    authorityClass: "write",
    effectClass: "workspace_filesystem",
    eventAdmission: "immutable_artifact_boundary",
    actorRequirement: "required",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: ["capability_grants", "actor"],
    capabilityRefs: [WORKSPACE_CAPABILITY],
    defaults: {},
    closedDomains: { createPolicy: [createPolicy] },
    sdkCoordinate: "sdk.workspace.create",
    cliCoordinate: "workspace create --policy <clean|imported>",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  });
}

function workspaceCreateResultSchema(
  createPolicy: "clean" | "imported",
) {
  return v.strictObject({
    createPolicy: v.literal(createPolicy),
    workspace: refDigestSchema,
    authorityMode: v.literal(createPolicy),
    scaffoldState: v.picklist(["none", "root_layout", "preserved"]),
    creationManifest: refDigestSchema,
    provenance: nonemptyRefDigestSetSchema,
  });
}

const clean = ownerContractPacket(
  { operationId: "abg.operation.workspace.create", memberKey: "clean" },
  v.strictObject({
    targetRoot: absolutePathSchema,
    createPolicy: v.literal("clean"),
    scaffoldPolicy: v.picklist(["none", "root_layout"]),
  }),
  workspaceCreateResultSchema("clean"),
  workspaceCreateRefusalSchema,
  null,
  {
    abstractModule: "Product.WorkspaceOperations",
    exportName: "WORKSPACE_OPERATION_CONTRACTS",
    memberPath: ["create", "clean"],
    port: "WorkspaceOperationPort.create",
    authorityRef: WORKSPACE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(WORKSPACE_AUTHORITY),
  },
  workspaceCreateMetadata("clean"),
);

const imported = ownerContractPacket(
  { operationId: "abg.operation.workspace.create", memberKey: "imported" },
  v.strictObject({
    targetRoot: absolutePathSchema,
    createPolicy: v.literal("imported"),
    importAuthority: refDigestSchema,
    preservationPolicy: v.picklist([
      "preserve_project_owned_roots",
      "preserve_all_existing",
    ]),
  }),
  workspaceCreateResultSchema("imported"),
  workspaceCreateRefusalSchema,
  null,
  {
    abstractModule: "Product.WorkspaceOperations",
    exportName: "WORKSPACE_OPERATION_CONTRACTS",
    memberPath: ["create", "imported"],
    port: "WorkspaceOperationPort.create",
    authorityRef: WORKSPACE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(WORKSPACE_AUTHORITY),
  },
  workspaceCreateMetadata("imported"),
);

const open = ownerContractPacket(
  { operationId: "abg.operation.workspace.open", memberKey: "open" },
  v.strictObject({
    targetRoot: absolutePathSchema,
    expectedAuthority: refDigestSchema,
  }),
  v.strictObject({
    disposition: v.picklist([
      "ready",
      "unbound",
      "stale",
      "malformed",
      "incompatible",
    ]),
    workspace: refDigestSchema,
    authority: refDigestSchema,
    binding: v.nullable(refDigestSchema),
    residuals: refSetSchema,
  }),
  refusalSchema(["invalid_target", "missing_workspace", "authority_mismatch"]),
  null,
  {
    abstractModule: "Product.WorkspaceOperations",
    exportName: "WORKSPACE_OPERATION_CONTRACTS",
    memberPath: ["open", "open"],
    port: "WorkspaceOperationPort.open",
    authorityRef: WORKSPACE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(WORKSPACE_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "read",
    effectClass: "workspace_admission",
    eventAdmission: "none",
    actorRequirement: "forbidden",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: ["capability_grants"],
    capabilityRefs: [WORKSPACE_CAPABILITY],
    defaults: {},
    closedDomains: {
      disposition: ["ready", "unbound", "stale", "malformed", "incompatible"],
    },
    sdkCoordinate: "sdk.workspace.open",
    cliCoordinate: "workspace open",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const WORKSPACE_OPERATION_CONTRACTS = Object.freeze({
  create: Object.freeze({ clean, imported }),
  open: Object.freeze({ open }),
});

export interface WorkspaceOperationPort {
  readonly create: ExactOwnerOperationPort<typeof clean | typeof imported>;
  readonly open: ExactOwnerOperationPort<typeof open>;
}
