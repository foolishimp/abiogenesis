// Implements: REQ-P-PUBLIC-CONTRACTS-008 through REQ-P-PUBLIC-CONTRACTS-010

import type { IJsonValue } from "../public_sdk/canonical.js";
import type {
  PublicOperationAuthorityClass,
  PublicOperationDefault,
  PublicOperationEffectClass,
  PublicOperationEventAdmission,
  PublicOperationId,
  PublicOperationValueDomain,
  PublicOperationValueDomainKind
} from "../public_sdk/carriers.js";

export interface PublicOperationCliCoordinate {
  readonly command: string;
  readonly subcommand: string | null;
  readonly workspacePolicy: "required" | "forbidden";
}

export interface Ds1OperationDefinition {
  readonly operationId: PublicOperationId;
  readonly cli: PublicOperationCliCoordinate;
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

function cli(
  command: string,
  subcommand: string | null,
  workspacePolicy: "required" | "forbidden"
): PublicOperationCliCoordinate {
  if (
    command.trim() === "" ||
    (subcommand !== null && subcommand.trim() === "")
  ) {
    throw new TypeError("public operation CLI coordinates must be non-empty");
  }
  return Object.freeze({ command, subcommand, workspacePolicy });
}

function operation<const T extends Ds1OperationDefinition>(input: T): T {
  return Object.freeze(input);
}

type FhResponseOperationId =
  | "abg.operation.fh.select"
  | "abg.operation.fh.approve"
  | "abg.operation.fh.reject"
  | "abg.operation.fh.assess"
  | "abg.operation.fh.answer-escalation";

function fhResponseOperation<const T extends {
  readonly operationId: FhResponseOperationId;
  readonly handlerSymbol: string;
  readonly requestSymbol: string;
  readonly resultSymbol: string;
  readonly refusalSymbol: string;
}>(input: T) {
  return operation({
    ...input,
    cli: cli(
      "fh",
      input.operationId.slice("abg.operation.fh.".length),
      "required"
    ),
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
      domain({
        fieldPath: "request.value",
        kind: "i_json",
        required: true,
        nullable: true
      }),
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
    cli: cli("workspace", "create", "required"),
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
    cli: cli("workspace", "open", "required"),
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
    cli: cli("catalog", "resolve", "forbidden"),
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
    cli: cli("catalog", "verify", "forbidden"),
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
    cli: cli("install", null, "forbidden"),
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
    cli: cli("catalog", "bind", "required"),
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
    cli: cli("catalog", "admit", "required"),
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
    cli: cli("catalog", "list", "required"),
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
    cli: cli("catalog", "describe", "required"),
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
    cli: cli("catalog", "allow", "required"),
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
    cli: cli("catalog", "invoke", "required"),
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
    cli: cli("resume", null, "required"),
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
    cli: cli("result", null, "required"),
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
    cli: cli("replay", null, "required"),
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

export const DS1_PUBLIC_OPERATION_DEFINITION_REGISTER = DS1_OPERATIONS;
export const DS1_PUBLIC_OPERATION_IDS: readonly PublicOperationId[] =
  Object.freeze(DS1_OPERATIONS.map((definition) => definition.operationId));

type RegisteredPublicOperationId =
  (typeof DS1_OPERATIONS)[number]["operationId"];
type ExactPublicOperationRegister =
  Exclude<PublicOperationId, RegisteredPublicOperationId> extends never
    ? Exclude<RegisteredPublicOperationId, PublicOperationId> extends never
      ? true
      : never
    : never;
const EXACT_PUBLIC_OPERATION_REGISTER: ExactPublicOperationRegister = true;
void EXACT_PUBLIC_OPERATION_REGISTER;

const DS1_PUBLIC_OPERATION_DEFINITIONS_BY_ID = new Map<
  PublicOperationId,
  Ds1OperationDefinition
>();
const DS1_PUBLIC_OPERATION_DEFINITIONS_BY_CLI = new Map<
  string,
  Ds1OperationDefinition
>();

function cliCoordinateKey(
  command: string,
  subcommand: string | null
): string {
  return JSON.stringify([command, subcommand]);
}

for (const definition of DS1_OPERATIONS) {
  if (DS1_PUBLIC_OPERATION_DEFINITIONS_BY_ID.has(definition.operationId)) {
    throw new TypeError(`duplicate public operation ${definition.operationId}`);
  }
  const cliKey = cliCoordinateKey(
    definition.cli.command,
    definition.cli.subcommand
  );
  if (DS1_PUBLIC_OPERATION_DEFINITIONS_BY_CLI.has(cliKey)) {
    throw new TypeError(
      `duplicate public operation CLI coordinate ${definition.cli.command} ${definition.cli.subcommand ?? ""}`
    );
  }
  DS1_PUBLIC_OPERATION_DEFINITIONS_BY_ID.set(
    definition.operationId,
    definition
  );
  DS1_PUBLIC_OPERATION_DEFINITIONS_BY_CLI.set(cliKey, definition);
}

export function resolveDs1PublicOperationDefinition(
  operationId: PublicOperationId
): Ds1OperationDefinition {
  const definition = DS1_PUBLIC_OPERATION_DEFINITIONS_BY_ID.get(operationId);
  if (definition === undefined) {
    throw new TypeError(`unknown public operation ${operationId}`);
  }
  return definition;
}

export function resolveDs1PublicOperationCliDefinition(
  command: string,
  subcommand: string | null
): Ds1OperationDefinition | null {
  return DS1_PUBLIC_OPERATION_DEFINITIONS_BY_CLI.get(
    cliCoordinateKey(command, subcommand)
  ) ?? null;
}

export function publicOperationSlug(operationId: PublicOperationId): string {
  return operationId.slice("abg.operation.".length);
}
