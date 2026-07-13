// Implements: REQ-P-PUBLIC-CONTRACTS-008 through REQ-P-PUBLIC-CONTRACTS-010

import { admitPublicContractRow } from "../public_sdk/carrier_admission.js";
import { canonicalizeIJson } from "../public_sdk/canonical.js";
import type { IJsonValue } from "../public_sdk/canonical.js";
import type {
  PublicContractRow,
  PublicOperationAuthorityClass,
  PublicOperationContractMetadata,
  PublicOperationDefault,
  PublicOperationEffectClass,
  PublicOperationEventAdmission,
  PublicOperationId,
  PublicOperationValueDomain,
  PublicOperationValueDomainKind
} from "../public_sdk/carriers.js";
import {
  admitDs1StaticContractAsset,
  publicContractAssetDigest,
  type Ds1StaticContractAssetDefinition,
  type PublishedContractAsset
} from "./foundation.js";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const PRODUCT_ID = "abiogenesis";
const CONTRACT_VERSION = "1.0.0";
const OPERATION_DEFINITION_SCHEMA_ID = "abg.schema.public-operation-contract";

interface Ds1OperationDefinition {
  readonly operationId: PublicOperationId;
  readonly handlerSymbol: string;
  readonly requestSymbol: string;
  readonly resultSymbol: string;
  readonly refusalSymbol: string;
  readonly capabilityRefs: readonly string[];
  readonly defaults: readonly PublicOperationDefault[];
  readonly closedDomains: readonly PublicOperationValueDomain[];
  readonly actorPolicy: "required" | "forbidden";
  readonly authorityClass: PublicOperationAuthorityClass;
  readonly effectClass: PublicOperationEffectClass;
  readonly eventAdmission: PublicOperationEventAdmission;
  readonly terminalDispositions: readonly string[];
  readonly nonTerminalDispositions: readonly string[];
}

export interface Ds1OperationPublication {
  readonly rows: readonly PublicContractRow[];
  readonly generatedAssets: readonly PublishedContractAsset[];
}

export interface PublicOperationDefinitionAsset
  extends Omit<PublicOperationContractMetadata, "operationDigest"> {
  readonly kind: "abg_public_operation_contract";
  readonly schemaVersion: 1;
}

function literalDefault(
  fieldPath: string,
  value: IJsonValue
): PublicOperationDefault {
  return Object.freeze({ fieldPath, kind: "literal", value });
}

function derivedDefault(
  fieldPath: string,
  derivation:
    | "full_workspace_catalog"
    | "toolchain_resolution_precedence"
    | "workspace_mutable_roots"
    | "canonical_handle"
): PublicOperationDefault {
  return Object.freeze({ fieldPath, kind: "derived", derivation });
}

function domain(input: {
  readonly fieldPath: string;
  readonly kind: PublicOperationValueDomainKind;
  readonly required: boolean;
  readonly nullable?: boolean;
  readonly values?: readonly IJsonValue[];
  readonly minimum?: number | null;
  readonly maximum?: number | null;
}): PublicOperationValueDomain {
  return Object.freeze({
    fieldPath: input.fieldPath,
    kind: input.kind,
    required: input.required,
    nullable: input.nullable ?? false,
    values: Object.freeze([...(input.values ?? [])]),
    minimum: input.minimum ?? null,
    maximum: input.maximum ?? null
  });
}

function closedRequest(): PublicOperationValueDomain {
  return domain({
    fieldPath: "request",
    kind: "closed_carrier",
    required: true
  });
}

function operation(input: Ds1OperationDefinition): Ds1OperationDefinition {
  return Object.freeze(input);
}

type FhResponseOperationId =
  | "abg.operation.fh.select"
  | "abg.operation.fh.approve"
  | "abg.operation.fh.reject"
  | "abg.operation.fh.assess"
  | "abg.operation.fh.answer-escalation";

function fhResponseOperation(input: {
  readonly operationId: FhResponseOperationId;
  readonly handlerSymbol: string;
  readonly requestSymbol: string;
  readonly resultSymbol: string;
  readonly refusalSymbol: string;
}): Ds1OperationDefinition {
  return operation({
    ...input,
    capabilityRefs: Object.freeze(["abg.capability.fh.interact@5"]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.interactionRef", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.interactionBasisDigest",
        kind: "sha256_digest",
        required: true
      }),
      domain({
        fieldPath: "request.responseContractRef",
        kind: "non_empty_string",
        required: true
      }),
      domain({
        fieldPath: "request.choiceRef",
        kind: "non_empty_string",
        required: true,
        nullable: true
      }),
      domain({ fieldPath: "request.value", kind: "i_json", required: true }),
      domain({
        fieldPath: "request.evidenceRefs",
        kind: "non_empty_unique_array",
        required: true
      }),
      domain({
        fieldPath: "request.capabilityRefs",
        kind: "unique_string_array",
        required: true
      }),
      domain({
        fieldPath: "request.capabilityProvenanceRefs",
        kind: "unique_string_array",
        required: true
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "runtime_fh_response_admission",
    eventAdmission: "runtime_interaction_events",
    terminalDispositions: Object.freeze([]),
    nonTerminalDispositions: Object.freeze(["responded", "held"])
  });
}

const DS1_OPERATIONS = Object.freeze([
  operation({
    operationId: "abg.operation.workspace.create",
    handlerSymbol: "workspaceCreate",
    requestSymbol: "WorkspaceCreateRequest",
    resultSymbol: "WorkspaceCreateResult",
    refusalSymbol: "WorkspaceCreateRefusal",
    capabilityRefs: Object.freeze([]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.targetRoot", kind: "absolute_path", required: true }),
      domain({
        fieldPath: "request.authorityMode",
        kind: "enum",
        required: true,
        values: ["clean_no_project_authority", "imported"]
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "workspace_manifest_write",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["created"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.workspace.open",
    handlerSymbol: "workspaceOpen",
    requestSymbol: "WorkspaceOpenRequest",
    resultSymbol: "WorkspaceOpenResult",
    refusalSymbol: "WorkspaceOpenRefusal",
    capabilityRefs: Object.freeze([]),
    defaults: Object.freeze([
      literalDefault("request.expectedWorkspaceSchemaVersion", 1)
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.targetRoot", kind: "absolute_path", required: true }),
      domain({
        fieldPath: "request.expectedWorkspaceSchemaVersion",
        kind: "positive_integer",
        required: false,
        minimum: 1
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "none",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["ready", "unbound"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.resolve",
    handlerSymbol: "catalogResolve",
    requestSymbol: "CatalogResolveRequest",
    resultSymbol: "CatalogResolveResult",
    refusalSymbol: "CatalogResolveRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.install.bind-products@5"
    ]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({
        fieldPath: "request.requirements",
        kind: "non_empty_unique_array",
        required: true
      }),
      domain({
        fieldPath: "request.candidateDescriptors",
        kind: "non_empty_unique_array",
        required: true
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "pure",
    effectClass: "product_resolution",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["resolved"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.verify",
    handlerSymbol: "catalogVerify",
    requestSymbol: "CatalogVerifyRequest",
    resultSymbol: "CatalogVerifyResult",
    refusalSymbol: "CatalogVerifyRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.install.bind-products@5"
    ]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.artifact", kind: "closed_carrier", required: true }),
      domain({ fieldPath: "request.descriptor", kind: "closed_carrier", required: true }),
      domain({
        fieldPath: "request.contributionManifest",
        kind: "closed_carrier",
        required: true
      }),
      domain({ fieldPath: "request.resolvedLock", kind: "closed_carrier", required: true })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "temporary_artifact_read",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["verified"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.install.install",
    handlerSymbol: "installProduct",
    requestSymbol: "InstallProductRequest",
    resultSymbol: "InstallProductResult",
    refusalSymbol: "InstallProductRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.install.bind-products@5"
    ]),
    defaults: Object.freeze([
      derivedDefault("request.toolchainRoot", "toolchain_resolution_precedence"),
      literalDefault("request.workspaceBindingRef", null)
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({
        fieldPath: "request.verifiedArtifact",
        kind: "closed_carrier",
        required: true
      }),
      domain({
        fieldPath: "request.toolchainRoot",
        kind: "absolute_path",
        required: false,
        nullable: true
      }),
      domain({
        fieldPath: "request.workspaceBindingRef",
        kind: "non_empty_string",
        required: false,
        nullable: true
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "immutable_product_install",
    eventAdmission: "none",
    terminalDispositions: Object.freeze([
      "installed",
      "already_installed_exact"
    ]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.bind",
    handlerSymbol: "catalogBind",
    requestSymbol: "CatalogBindRequest",
    resultSymbol: "CatalogBindResult",
    refusalSymbol: "CatalogBindRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.install.bind-products@5"
    ]),
    defaults: Object.freeze([
      derivedDefault("request.mutableStateRoots", "workspace_mutable_roots")
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.workspaceManifestDigest",
        kind: "sha256_digest",
        required: true
      }),
      domain({ fieldPath: "request.resolvedLock", kind: "closed_carrier", required: true }),
      domain({
        fieldPath: "request.installedProductRecords",
        kind: "non_empty_unique_array",
        required: true
      }),
      domain({
        fieldPath: "request.mutableStateRoots",
        kind: "closed_carrier",
        required: false,
        nullable: true
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "workspace_binding_write",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["bound", "already_bound_exact"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.admit",
    handlerSymbol: "catalogAdmit",
    requestSymbol: "CatalogAdmitRequest",
    resultSymbol: "CatalogAdmitResult",
    refusalSymbol: "CatalogAdmitRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.contribute@5"
    ]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.bindingId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.resolvedLockId",
        kind: "non_empty_string",
        required: true
      }),
      domain({
        fieldPath: "request.productSetDigest",
        kind: "sha256_digest",
        required: true
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "runtime_catalog_admission",
    eventAdmission: "catalog_admission_events",
    terminalDispositions: Object.freeze(["admitted"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.list",
    handlerSymbol: "catalogList",
    requestSymbol: "CatalogListRequest",
    resultSymbol: "CatalogListResult",
    refusalSymbol: "CatalogListRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.contribute@5"
    ]),
    defaults: Object.freeze([
      literalDefault("request.kinds", ["graph_function", "node_type", "overlay"]),
      derivedDefault("request.allowedHandles", "full_workspace_catalog"),
      literalDefault("request.sessionView", null)
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.catalogId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.kinds",
        kind: "unique_string_array",
        required: false,
        values: ["graph_function", "node_type", "overlay"]
      }),
      domain({
        fieldPath: "request.allowedHandles|request.sessionView",
        kind: "exclusive_field_union",
        required: false,
        values: [[], ["allowedHandles"], ["sessionView"]]
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "runtime_catalog_projection",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["listed"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.describe",
    handlerSymbol: "catalogDescribe",
    requestSymbol: "CatalogDescribeRequest",
    resultSymbol: "CatalogDescribeResult",
    refusalSymbol: "CatalogDescribeRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.contribute@5"
    ]),
    defaults: Object.freeze([
      derivedDefault("request.allowedHandles", "full_workspace_catalog"),
      literalDefault("request.sessionView", null)
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.catalogId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.handle", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.allowedHandles|request.sessionView",
        kind: "exclusive_field_union",
        required: false,
        values: [[], ["allowedHandles"], ["sessionView"]]
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "runtime_catalog_projection",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["described"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.allow",
    handlerSymbol: "catalogAllow",
    requestSymbol: "CatalogAllowRequest",
    resultSymbol: "CatalogAllowResult",
    refusalSymbol: "CatalogAllowRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.invoke-graph-function@5"
    ]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.catalogId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.handles",
        kind: "unique_string_array",
        required: true
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "runtime_session_projection",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["allowed"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.catalog.invoke",
    handlerSymbol: "catalogInvoke",
    requestSymbol: "CatalogInvokeRequest",
    resultSymbol: "CatalogInvokeResult",
    refusalSymbol: "CatalogInvokeRefusal",
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.invoke-graph-function@5"
    ]),
    defaults: Object.freeze([
      derivedDefault("request.allowedHandles", "full_workspace_catalog"),
      literalDefault("request.sessionView", null),
      literalDefault("request.transportSteering", null),
      literalDefault("hostDescriptor.mode", "invoke"),
      literalDefault("hostDescriptor.scope", "graph_function"),
      derivedDefault("hostDescriptor.target", "canonical_handle"),
      literalDefault("hostDescriptor.until", "converged")
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.bindingId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.resolvedLockId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.catalogId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.catalogVersion", kind: "semver", required: true }),
      domain({ fieldPath: "request.catalogDigest", kind: "sha256_digest", required: true }),
      domain({
        fieldPath: "request.allowedHandles|request.sessionView",
        kind: "exclusive_field_union",
        required: false,
        values: [[], ["allowedHandles"], ["sessionView"]]
      }),
      domain({
        fieldPath: "request.graphFunctionHandle",
        kind: "non_empty_string",
        required: true
      }),
      domain({ fieldPath: "request.interfaceRef", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.inputId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.inputSchemaId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.inputSchemaVersion",
        kind: "non_empty_string",
        required: true
      }),
      domain({
        fieldPath: "request.inputSchemaDigest",
        kind: "sha256_digest",
        required: true
      }),
      domain({
        fieldPath: "request.input|request.inputRef",
        kind: "exclusive_field_union",
        required: true,
        values: [["input"], ["inputRef"]]
      }),
      domain({
        fieldPath: "request.requiredCapabilityRefs",
        kind: "unique_string_array",
        required: true
      }),
      domain({ fieldPath: "request.actorRef", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.transportSteering",
        kind: "closed_carrier",
        required: false,
        nullable: true
      }),
      domain({
        fieldPath: "hostDescriptor.mode",
        kind: "enum",
        required: true,
        values: ["invoke"]
      }),
      domain({
        fieldPath: "hostDescriptor.scope",
        kind: "enum",
        required: true,
        values: ["graph_function"]
      }),
      domain({
        fieldPath: "hostDescriptor.until",
        kind: "enum",
        required: true,
        values: ["first_traversal", "blocked", "converged"]
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "runtime_graph_function_invoke",
    eventAdmission: "runtime_execution_events",
    terminalDispositions: Object.freeze(["converged"]),
    nonTerminalDispositions: Object.freeze([
      "stopped",
      "yielded",
      "blocked",
      "human_gate_required"
    ])
  }),
  fhResponseOperation({
    operationId: "abg.operation.fh.select",
    handlerSymbol: "fhSelect",
    requestSymbol: "FhSelectRequest",
    resultSymbol: "FhSelectResult",
    refusalSymbol: "FhSelectRefusal"
  }),
  fhResponseOperation({
    operationId: "abg.operation.fh.approve",
    handlerSymbol: "fhApprove",
    requestSymbol: "FhApproveRequest",
    resultSymbol: "FhApproveResult",
    refusalSymbol: "FhApproveRefusal"
  }),
  fhResponseOperation({
    operationId: "abg.operation.fh.reject",
    handlerSymbol: "fhReject",
    requestSymbol: "FhRejectRequest",
    resultSymbol: "FhRejectResult",
    refusalSymbol: "FhRejectRefusal"
  }),
  fhResponseOperation({
    operationId: "abg.operation.fh.assess",
    handlerSymbol: "fhAssess",
    requestSymbol: "FhAssessRequest",
    resultSymbol: "FhAssessResult",
    refusalSymbol: "FhAssessRefusal"
  }),
  fhResponseOperation({
    operationId: "abg.operation.fh.answer-escalation",
    handlerSymbol: "fhAnswerEscalation",
    requestSymbol: "FhAnswerEscalationRequest",
    resultSymbol: "FhAnswerEscalationResult",
    refusalSymbol: "FhAnswerEscalationRefusal"
  }),
  operation({
    operationId: "abg.operation.run.resume",
    handlerSymbol: "runResume",
    requestSymbol: "RunResumeRequest",
    resultSymbol: "RunResumeResult",
    refusalSymbol: "RunResumeRefusal",
    capabilityRefs: Object.freeze(["abg.capability.fh.interact@5"]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.interactionRef", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.interactionBasisDigest",
        kind: "sha256_digest",
        required: true
      }),
      domain({ fieldPath: "request.responseRef", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.continuationRef",
        kind: "non_empty_string",
        required: true
      })
    ]),
    actorPolicy: "required",
    authorityClass: "write",
    effectClass: "runtime_resume_admission",
    eventAdmission: "runtime_interaction_events",
    terminalDispositions: Object.freeze([]),
    nonTerminalDispositions: Object.freeze(["resume_admitted"])
  }),
  operation({
    operationId: "abg.operation.read.result",
    handlerSymbol: "readResult",
    requestSymbol: "ReadResultRequest",
    resultSymbol: "ReadResultResult",
    refusalSymbol: "ReadResultRefusal",
    capabilityRefs: Object.freeze([]),
    defaults: Object.freeze([]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({
        fieldPath: "request.resultId|request.graphCallId",
        kind: "exclusive_field_union",
        required: true,
        values: [["resultId"], ["graphCallId"]]
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "runtime_result_projection",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["projected"]),
    nonTerminalDispositions: Object.freeze([])
  }),
  operation({
    operationId: "abg.operation.read.replay",
    handlerSymbol: "readReplay",
    requestSymbol: "ReadReplayRequest",
    resultSymbol: "ReadReplayResult",
    refusalSymbol: "ReadReplayRefusal",
    capabilityRefs: Object.freeze([]),
    defaults: Object.freeze([
      literalDefault("request.fromOrdinal", 0),
      literalDefault("request.limit", 1000)
    ]),
    closedDomains: Object.freeze([
      closedRequest(),
      domain({ fieldPath: "request.workspaceId", kind: "non_empty_string", required: true }),
      domain({ fieldPath: "request.subject", kind: "closed_carrier", required: true }),
      domain({
        fieldPath: "request.fromOrdinal",
        kind: "bounded_integer",
        required: false,
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER
      }),
      domain({
        fieldPath: "request.limit",
        kind: "bounded_integer",
        required: false,
        minimum: 1,
        maximum: 10_000
      })
    ]),
    actorPolicy: "forbidden",
    authorityClass: "read",
    effectClass: "runtime_replay_projection",
    eventAdmission: "none",
    terminalDispositions: Object.freeze(["projected"]),
    nonTerminalDispositions: Object.freeze([])
  })
] satisfies readonly Ds1OperationDefinition[]);

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assetMap(
  assets: readonly Ds1StaticContractAssetDefinition[]
): ReadonlyMap<string, Ds1StaticContractAssetDefinition> {
  const byId = new Map<string, Ds1StaticContractAssetDefinition>();
  for (const rawAsset of assets) {
    const asset = admitDs1StaticContractAsset(rawAsset);
    if (byId.has(asset.contractId)) {
      throw new TypeError(`operation schema assets: duplicate ${asset.contractId}`);
    }
    byId.set(asset.contractId, asset);
  }
  return byId;
}

function requiredSchemaAsset(input: {
  readonly assets: ReadonlyMap<string, Ds1StaticContractAssetDefinition>;
  readonly schemaId: string;
  readonly schemaPath: string;
}): Ds1StaticContractAssetDefinition {
  const asset = input.assets.get(input.schemaId);
  if (asset === undefined) {
    throw new TypeError(`operation schema assets: missing ${input.schemaId}`);
  }
  if (
    asset.relativePath !== input.schemaPath ||
    asset.mediaType !== "application/schema+json"
  ) {
    throw new TypeError(`operation schema assets: locator mismatch for ${input.schemaId}`);
  }
  return asset;
}

function operationMetadataBasis(input: {
  readonly definition: Ds1OperationDefinition;
  readonly assets: ReadonlyMap<string, Ds1StaticContractAssetDefinition>;
}): Omit<PublicOperationContractMetadata, "operationDigest"> {
  const slug = input.definition.operationId.slice("abg.operation.".length);
  const requestSchemaId = `abg.schema.operation.${slug}.request`;
  const resultSchemaId = `abg.schema.operation.${slug}.result`;
  const refusalSchemaId = `abg.schema.operation.${slug}.refusal`;
  const requestSchemaPath =
    `contracts/schemas/operations/${slug}/request.schema.json`;
  const resultSchemaPath =
    `contracts/schemas/operations/${slug}/result.schema.json`;
  const refusalSchemaPath =
    `contracts/schemas/operations/${slug}/refusal.schema.json`;
  const invocationSchemaId = "abg.schema.public-operation-invocation";
  const invocationSchemaPath =
    "contracts/schemas/public-operation-invocation.schema.json";
  const requestAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: requestSchemaId,
    schemaPath: requestSchemaPath
  });
  const resultAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: resultSchemaId,
    schemaPath: resultSchemaPath
  });
  const refusalAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: refusalSchemaId,
    schemaPath: refusalSchemaPath
  });
  const invocationAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: invocationSchemaId,
    schemaPath: invocationSchemaPath
  });
  return Object.freeze({
    operationId: input.definition.operationId,
    operationVersion: CONTRACT_VERSION,
    requestSchemaId,
    requestSchemaVersion: CONTRACT_VERSION,
    requestSchemaDigest: publicContractAssetDigest(requestAsset.bytes),
    requestSchemaPath,
    resultSchemaId,
    resultSchemaVersion: CONTRACT_VERSION,
    resultSchemaDigest: publicContractAssetDigest(resultAsset.bytes),
    resultSchemaPath,
    refusalSchemaId,
    refusalSchemaVersion: CONTRACT_VERSION,
    refusalSchemaDigest: publicContractAssetDigest(refusalAsset.bytes),
    refusalSchemaPath,
    invocationSchemaId,
    invocationSchemaVersion: CONTRACT_VERSION,
    invocationSchemaDigest: publicContractAssetDigest(invocationAsset.bytes),
    invocationSchemaPath,
    defaults: input.definition.defaults,
    closedDomains: input.definition.closedDomains,
    actorPolicy: input.definition.actorPolicy,
    authorityClass: input.definition.authorityClass,
    effectClass: input.definition.effectClass,
    eventAdmission: input.definition.eventAdmission,
    terminalDispositions: input.definition.terminalDispositions,
    nonTerminalDispositions: input.definition.nonTerminalDispositions,
    adapterExitMap: Object.freeze({
      acceptedTerminal: 0,
      refused: 1,
      invalidInvocation: 2,
      acceptedNonTerminal:
        input.definition.nonTerminalDispositions.length === 0 ? null : 3,
      adapterFailure: 70
    })
  });
}

function operationAsset(input: {
  readonly operationId: PublicOperationId;
  readonly metadata: Omit<PublicOperationContractMetadata, "operationDigest">;
}): PublishedContractAsset {
  const slug = input.operationId.slice("abg.operation.".length);
  const definition: PublicOperationDefinitionAsset = Object.freeze({
    kind: "abg_public_operation_contract",
    schemaVersion: 1,
    ...input.metadata
  });
  const bytes = new TextEncoder().encode(
    canonicalizeIJson(definition)
  );
  return Object.freeze({
    relativePath: `contracts/operations/${slug}.json`,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

function operationRow(input: {
  readonly definition: Ds1OperationDefinition;
  readonly metadata: Omit<PublicOperationContractMetadata, "operationDigest">;
  readonly asset: PublishedContractAsset;
}): PublicContractRow {
  const invocationSymbols =
    input.definition.operationId === "abg.operation.catalog.invoke"
      ? ["PublicOperationInvocationEnvelope", "HostInvocationDescriptor"]
      : ["PublicOperationInvocationEnvelope"];
  return admitPublicContractRow({
    contractId: input.definition.operationId,
    contractKind: "operation",
    owningProductId: PRODUCT_ID,
    version: CONTRACT_VERSION,
    digest: input.asset.digest,
    authorityRefs: [
      "specification/requirements/product/REQ-P-POLICY.md",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md",
      "build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md"
    ],
    capabilityRefs: input.definition.capabilityRefs,
    nativeLocator: {
      kind: "native",
      packageName: PACKAGE_NAME,
      packageExport: `${PACKAGE_NAME}/app/m04`,
      symbols: [
        input.definition.handlerSymbol,
        input.definition.requestSymbol,
        input.definition.resultSymbol,
        input.definition.refusalSymbol,
        ...invocationSymbols
      ]
    },
    assetLocator: {
      kind: "asset",
      relativePath: input.asset.relativePath,
      schemaId: OPERATION_DEFINITION_SCHEMA_ID,
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/json",
      digest: input.asset.digest
    },
    operationContract: {
      ...input.metadata,
      operationDigest: input.asset.digest
    }
  });
}

export const DS1_PUBLIC_OPERATION_DEFINITION_REGISTER = DS1_OPERATIONS;

export function buildDs1OperationPublication(input: {
  readonly schemaAssets: readonly Ds1StaticContractAssetDefinition[];
}): Ds1OperationPublication {
  const assets = assetMap(input.schemaAssets);
  requiredSchemaAsset({
    assets,
    schemaId: OPERATION_DEFINITION_SCHEMA_ID,
    schemaPath: "contracts/schemas/public-operation-contract.schema.json"
  });
  const rows: PublicContractRow[] = [];
  const generatedAssets: PublishedContractAsset[] = [];
  for (const definition of DS1_OPERATIONS) {
    const metadata = operationMetadataBasis({ definition, assets });
    const asset = operationAsset({
      operationId: definition.operationId,
      metadata
    });
    generatedAssets.push(asset);
    rows.push(operationRow({ definition, metadata, asset }));
  }
  rows.sort((left, right) => compareText(left.contractId, right.contractId));
  generatedAssets.sort((left, right) =>
    compareText(left.relativePath, right.relativePath)
  );
  return Object.freeze({
    rows: Object.freeze(rows),
    generatedAssets: Object.freeze(generatedAssets)
  });
}
