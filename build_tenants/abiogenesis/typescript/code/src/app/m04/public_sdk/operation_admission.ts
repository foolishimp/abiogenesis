// Implements: REQ-P-POLICY
// Implements: REQ-P-PUBLIC-CONTRACTS

import {
  absolutePath,
  arrayOf,
  exactSemVer,
  closedObject,
  digest,
  equalStringArrays,
  iJson,
  integerInRange,
  literal,
  nonEmptyString,
  oneOf,
  optionalField,
  requiredField,
  uniqueStrings,
  type RawObject
} from "./admission_primitives.js";
import {
  admitCatalogContributionManifest,
  admitCatalogProductDescriptor,
  admitInstalledProductRecord,
  admitProductRequirement,
  admitPublicContractRow,
  admitPublicSessionCatalogView,
  admitResolvedProductLock,
  admitSuppliedProductArtifact,
  admitToolchainMutableStateRootsV3,
  admitVerifiedProductArtifact,
  ResolvedPublicOperationContract
} from "./carrier_admission.js";
import {
  admitIJsonText,
  canonicalizeIJson,
  type IJsonValue
} from "./canonical.js";
import { DS1_PUBLIC_OPERATION_IDS } from "./carriers.js";
import {
  canonicalStringList,
  deriveRegistrySessionViewRef
} from "../../../shared/runtime_identity.js";
import type {
  AdapterIdentity,
  AnyDs1OperationRequest,
  AnyPublicOperationInvocationEnvelope,
  CatalogAdmitRequest,
  CatalogAllowRequest,
  CatalogBindRequest,
  CatalogDescribeRequest,
  CatalogInvokeRequest,
  CatalogListRequest,
  CatalogResolveRequest,
  CatalogVerifyRequest,
  Ds1PublicOperationContractMap,
  HostInvocationDescriptor,
  InstallProductRequest,
  InvocationInput,
  PublicCatalogKind,
  PublicContractRow,
  PublicOperationId,
  PublicOperationInvocationEnvelope,
  ReadReplayRequest,
  ReadResultRequest,
  ReplaySubject,
  SessionSelectionInput,
  TransportSteering,
  WorkspaceCreateRequest,
  WorkspaceOpenRequest
} from "./carriers.js";

const CATALOG_KINDS = Object.freeze([
  "graph_function",
  "node_type",
  "overlay"
] as const satisfies readonly PublicCatalogKind[]);

const ENVELOPE_KEYS = Object.freeze([
  "schemaVersion",
  "invocationSchemaId",
  "invocationSchemaVersion",
  "invocationSchemaDigest",
  "invocationId",
  "operationId",
  "operationContractVersion",
  "operationContractDigest",
  "requestId",
  "requestSchemaId",
  "requestSchemaVersion",
  "requestSchemaDigest",
  "resultSchemaId",
  "resultSchemaVersion",
  "resultSchemaDigest",
  "refusalSchemaId",
  "refusalSchemaVersion",
  "refusalSchemaDigest",
  "request",
  "actorRef",
  "provenanceRefs",
  "adapter",
  "correlationId"
]);

const OPERATION_SLUGS: Readonly<Record<PublicOperationId, string>> = Object.freeze({
  "abg.operation.workspace.create": "workspace.create",
  "abg.operation.workspace.open": "workspace.open",
  "abg.operation.catalog.resolve": "catalog.resolve",
  "abg.operation.catalog.verify": "catalog.verify",
  "abg.operation.install.install": "install.install",
  "abg.operation.catalog.bind": "catalog.bind",
  "abg.operation.catalog.admit": "catalog.admit",
  "abg.operation.catalog.list": "catalog.list",
  "abg.operation.catalog.describe": "catalog.describe",
  "abg.operation.catalog.allow": "catalog.allow",
  "abg.operation.catalog.invoke": "catalog.invoke",
  "abg.operation.read.result": "read.result",
  "abg.operation.read.replay": "read.replay"
});

function operationId(input: unknown, label: string): PublicOperationId {
  return oneOf(input, DS1_PUBLIC_OPERATION_IDS, label);
}

function admitAdapterIdentity(input: unknown, label: string): AdapterIdentity {
  const value = closedObject(input, ["kind", "ref"], label);
  return Object.freeze({
    kind: oneOf(
      requiredField(value, "kind", label),
      ["native_sdk", "abg_cli", "host_adapter"] as const,
      `${label}.kind`
    ),
    ref: nonEmptyString(requiredField(value, "ref", label), `${label}.ref`)
  });
}

export function admitTransportSteering(
  input: unknown,
  label = "TransportSteering"
): TransportSteering {
  const value = closedObject(input, ["agent", "model", "profile", "timeoutMs"], label);
  const modelInput = requiredField(value, "model", label);
  return Object.freeze({
    agent: oneOf(
      requiredField(value, "agent", label),
      ["claude", "codex", "gemini", "generic"] as const,
      `${label}.agent`
    ),
    model:
      modelInput === null ? null : nonEmptyString(modelInput, `${label}.model`),
    profile: oneOf(
      requiredField(value, "profile", label),
      ["local-spawn", "pty-terminal"] as const,
      `${label}.profile`
    ),
    timeoutMs: integerInRange(
      requiredField(value, "timeoutMs", label),
      1,
      999_999_999,
      `${label}.timeoutMs`
    )
  });
}

function sessionSelection(
  value: RawObject,
  label: string
): SessionSelectionInput {
  const allowedInput = optionalField(value, "allowedHandles");
  const viewInput = optionalField(value, "sessionView");
  if (
    allowedInput !== undefined &&
    allowedInput !== null &&
    viewInput !== undefined &&
    viewInput !== null
  ) {
    throw new TypeError(`${label}: allowedHandles and sessionView are mutually exclusive`);
  }
  const allowedHandles =
    allowedInput === undefined || allowedInput === null
      ? null
      : canonicalStringList(
          uniqueStrings(allowedInput, `${label}.allowedHandles`)
        );
  const sessionView =
    viewInput === undefined || viewInput === null
      ? null
      : admitPublicSessionCatalogView(viewInput, `${label}.sessionView`);
  if (
    allowedHandles !== null &&
    sessionView !== null &&
    !equalStringArrays(allowedHandles, sessionView.allowedHandles)
  ) {
    throw new TypeError(`${label}: allowlist and session view disagree`);
  }
  return Object.freeze({ allowedHandles, sessionView });
}

export function admitWorkspaceCreateRequest(
  input: unknown,
  label = "WorkspaceCreateRequest"
): WorkspaceCreateRequest {
  const value = closedObject(input, ["targetRoot", "authorityMode"], label);
  return Object.freeze({
    targetRoot: absolutePath(
      requiredField(value, "targetRoot", label),
      `${label}.targetRoot`
    ),
    authorityMode: oneOf(
      requiredField(value, "authorityMode", label),
      ["clean_no_project_authority", "imported"] as const,
      `${label}.authorityMode`
    )
  });
}

export function admitWorkspaceOpenRequest(
  input: unknown,
  label = "WorkspaceOpenRequest"
): WorkspaceOpenRequest {
  const value = closedObject(
    input,
    ["targetRoot", "expectedWorkspaceSchemaVersion"],
    label
  );
  const versionInput = optionalField(value, "expectedWorkspaceSchemaVersion");
  return Object.freeze({
    targetRoot: absolutePath(
      requiredField(value, "targetRoot", label),
      `${label}.targetRoot`
    ),
    expectedWorkspaceSchemaVersion:
      versionInput === undefined
        ? 1
        : integerInRange(versionInput, 1, 2_147_483_647, `${label}.expectedWorkspaceSchemaVersion`)
  });
}

export function admitCatalogResolveRequest(
  input: unknown,
  label = "CatalogResolveRequest"
): CatalogResolveRequest {
  const value = closedObject(input, ["requirements", "candidateDescriptors"], label);
  const requirements = arrayOf(
    requiredField(value, "requirements", label),
    `${label}.requirements`,
    admitProductRequirement
  );
  const candidateDescriptors = arrayOf(
    requiredField(value, "candidateDescriptors", label),
    `${label}.candidateDescriptors`,
    admitCatalogProductDescriptor
  );
  if (requirements.length === 0 || candidateDescriptors.length === 0) {
    throw new TypeError(`${label}: requirements and candidateDescriptors must be non-empty`);
  }
  const requirementIds = new Set(requirements.map((row) => row.productId));
  if (requirementIds.size !== requirements.length) {
    throw new TypeError(`${label}.requirements: duplicate product identity`);
  }
  const descriptorIds = new Set(candidateDescriptors.map((row) => row.descriptorId));
  if (descriptorIds.size !== candidateDescriptors.length) {
    throw new TypeError(`${label}.candidateDescriptors: duplicate descriptor identity`);
  }
  return Object.freeze({ requirements, candidateDescriptors });
}

export function admitCatalogVerifyRequest(
  input: unknown,
  label = "CatalogVerifyRequest"
): CatalogVerifyRequest {
  const value = closedObject(
    input,
    ["artifact", "descriptor", "contributionManifest", "resolvedLock"],
    label
  );
  return Object.freeze({
    artifact: admitSuppliedProductArtifact(
      requiredField(value, "artifact", label),
      `${label}.artifact`
    ),
    descriptor: admitCatalogProductDescriptor(
      requiredField(value, "descriptor", label),
      `${label}.descriptor`
    ),
    contributionManifest: admitCatalogContributionManifest(
      requiredField(value, "contributionManifest", label),
      `${label}.contributionManifest`
    ),
    resolvedLock: admitResolvedProductLock(
      requiredField(value, "resolvedLock", label),
      `${label}.resolvedLock`
    )
  });
}

export function admitInstallProductRequest(
  input: unknown,
  label = "InstallProductRequest"
): InstallProductRequest {
  const value = closedObject(
    input,
    ["verifiedArtifact", "toolchainRoot", "workspaceBindingRef"],
    label
  );
  const toolchainInput = optionalField(value, "toolchainRoot");
  const bindingInput = optionalField(value, "workspaceBindingRef");
  return Object.freeze({
    verifiedArtifact: admitVerifiedProductArtifact(
      requiredField(value, "verifiedArtifact", label),
      `${label}.verifiedArtifact`
    ),
    toolchainRoot:
      toolchainInput === undefined || toolchainInput === null
        ? null
        : absolutePath(toolchainInput, `${label}.toolchainRoot`),
    workspaceBindingRef:
      bindingInput === undefined || bindingInput === null
        ? null
        : nonEmptyString(bindingInput, `${label}.workspaceBindingRef`)
  });
}

export function admitCatalogBindRequest(
  input: unknown,
  label = "CatalogBindRequest"
): CatalogBindRequest {
  const value = closedObject(
    input,
    [
      "workspaceId",
      "workspaceManifestDigest",
      "resolvedLock",
      "installedProductRecords",
      "mutableStateRoots"
    ],
    label
  );
  const rootsInput = optionalField(value, "mutableStateRoots");
  const installedProductRecords = arrayOf(
    requiredField(value, "installedProductRecords", label),
    `${label}.installedProductRecords`,
    admitInstalledProductRecord
  );
  if (installedProductRecords.length === 0) {
    throw new TypeError(`${label}.installedProductRecords: expected a non-empty array`);
  }
  return Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    workspaceManifestDigest: digest(
      requiredField(value, "workspaceManifestDigest", label),
      `${label}.workspaceManifestDigest`
    ),
    resolvedLock: admitResolvedProductLock(
      requiredField(value, "resolvedLock", label),
      `${label}.resolvedLock`
    ),
    installedProductRecords,
    mutableStateRoots:
      rootsInput === undefined || rootsInput === null
        ? null
        : admitToolchainMutableStateRootsV3(rootsInput, `${label}.mutableStateRoots`)
  });
}

export function admitCatalogAdmitRequest(
  input: unknown,
  label = "CatalogAdmitRequest"
): CatalogAdmitRequest {
  const value = closedObject(
    input,
    ["workspaceId", "bindingId", "resolvedLockId", "productSetDigest"],
    label
  );
  return Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    bindingId: nonEmptyString(
      requiredField(value, "bindingId", label),
      `${label}.bindingId`
    ),
    resolvedLockId: nonEmptyString(
      requiredField(value, "resolvedLockId", label),
      `${label}.resolvedLockId`
    ),
    productSetDigest: digest(
      requiredField(value, "productSetDigest", label),
      `${label}.productSetDigest`
    )
  });
}

export function admitCatalogListRequest(
  input: unknown,
  label = "CatalogListRequest"
): CatalogListRequest {
  const value = closedObject(
    input,
    ["workspaceId", "catalogId", "kinds", "allowedHandles", "sessionView"],
    label
  );
  const kindsInput = optionalField(value, "kinds");
  const kinds =
    kindsInput === undefined
      ? CATALOG_KINDS
      : arrayOf(kindsInput, `${label}.kinds`, (entry, entryLabel) =>
          oneOf(entry, CATALOG_KINDS, entryLabel)
        );
  if (new Set(kinds).size !== kinds.length) {
    throw new TypeError(`${label}.kinds: duplicate kind`);
  }
  const workspaceId = nonEmptyString(
    requiredField(value, "workspaceId", label),
    `${label}.workspaceId`
  );
  const catalogId = nonEmptyString(
    requiredField(value, "catalogId", label),
    `${label}.catalogId`
  );
  const selection = sessionSelection(value, label);
  if (
    selection.sessionView !== null &&
    (selection.sessionView.workspaceId !== workspaceId ||
      selection.sessionView.catalogId !== catalogId)
  ) {
    throw new TypeError(`${label}.sessionView: workspace or catalog mismatch`);
  }
  return Object.freeze({
    workspaceId,
    catalogId,
    kinds: Object.freeze([...kinds]),
    ...selection
  });
}

export function admitCatalogDescribeRequest(
  input: unknown,
  label = "CatalogDescribeRequest"
): CatalogDescribeRequest {
  const value = closedObject(
    input,
    ["workspaceId", "catalogId", "handle", "allowedHandles", "sessionView"],
    label
  );
  const workspaceId = nonEmptyString(
    requiredField(value, "workspaceId", label),
    `${label}.workspaceId`
  );
  const catalogId = nonEmptyString(
    requiredField(value, "catalogId", label),
    `${label}.catalogId`
  );
  const selection = sessionSelection(value, label);
  if (
    selection.sessionView !== null &&
    (selection.sessionView.workspaceId !== workspaceId ||
      selection.sessionView.catalogId !== catalogId)
  ) {
    throw new TypeError(`${label}.sessionView: workspace or catalog mismatch`);
  }
  return Object.freeze({
    workspaceId,
    catalogId,
    handle: nonEmptyString(requiredField(value, "handle", label), `${label}.handle`),
    ...selection
  });
}

export function admitCatalogAllowRequest(
  input: unknown,
  label = "CatalogAllowRequest"
): CatalogAllowRequest {
  const value = closedObject(input, ["workspaceId", "catalogId", "handles"], label);
  return Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    catalogId: nonEmptyString(
      requiredField(value, "catalogId", label),
      `${label}.catalogId`
    ),
    handles: canonicalStringList(
      uniqueStrings(
        requiredField(value, "handles", label),
        `${label}.handles`
      )
    )
  });
}

function admitInvocationInput(value: RawObject, label: string): InvocationInput {
  const hasInput = Object.hasOwn(value, "input");
  const hasInputRef = Object.hasOwn(value, "inputRef");
  if (hasInput === hasInputRef) {
    throw new TypeError(`${label}: exactly one of input or inputRef is required`);
  }
  if (hasInput) {
    return Object.freeze({
      input: iJson(requiredField(value, "input", label), `${label}.input`)
    });
  }
  return Object.freeze({
    inputRef: nonEmptyString(
      requiredField(value, "inputRef", label),
      `${label}.inputRef`
    )
  });
}

export function admitCatalogInvokeRequest(
  input: unknown,
  label = "CatalogInvokeRequest"
): CatalogInvokeRequest {
  const value = closedObject(
    input,
    [
      "workspaceId",
      "bindingId",
      "resolvedLockId",
      "catalogId",
      "catalogVersion",
      "catalogDigest",
      "allowedHandles",
      "sessionView",
      "graphFunctionHandle",
      "interfaceRef",
      "inputId",
      "inputSchemaId",
      "inputSchemaVersion",
      "inputSchemaDigest",
      "input",
      "inputRef",
      "requiredCapabilityRefs",
      "actorRef",
      "transportSteering"
    ],
    label
  );
  const steeringInput = optionalField(value, "transportSteering");
  const base = Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    bindingId: nonEmptyString(
      requiredField(value, "bindingId", label),
      `${label}.bindingId`
    ),
    resolvedLockId: nonEmptyString(
      requiredField(value, "resolvedLockId", label),
      `${label}.resolvedLockId`
    ),
    catalogId: nonEmptyString(
      requiredField(value, "catalogId", label),
      `${label}.catalogId`
    ),
    catalogVersion: exactSemVer(
      requiredField(value, "catalogVersion", label),
      `${label}.catalogVersion`
    ),
    catalogDigest: digest(
      requiredField(value, "catalogDigest", label),
      `${label}.catalogDigest`
    ),
    graphFunctionHandle: nonEmptyString(
      requiredField(value, "graphFunctionHandle", label),
      `${label}.graphFunctionHandle`
    ),
    interfaceRef: nonEmptyString(
      requiredField(value, "interfaceRef", label),
      `${label}.interfaceRef`
    ),
    inputId: nonEmptyString(requiredField(value, "inputId", label), `${label}.inputId`),
    inputSchemaId: nonEmptyString(
      requiredField(value, "inputSchemaId", label),
      `${label}.inputSchemaId`
    ),
    inputSchemaVersion: nonEmptyString(
      requiredField(value, "inputSchemaVersion", label),
      `${label}.inputSchemaVersion`
    ),
    inputSchemaDigest: digest(
      requiredField(value, "inputSchemaDigest", label),
      `${label}.inputSchemaDigest`
    ),
    requiredCapabilityRefs: uniqueStrings(
      requiredField(value, "requiredCapabilityRefs", label),
      `${label}.requiredCapabilityRefs`
    ),
    actorRef: nonEmptyString(
      requiredField(value, "actorRef", label),
      `${label}.actorRef`
    ),
    transportSteering:
      steeringInput === undefined || steeringInput === null
        ? null
        : admitTransportSteering(steeringInput, `${label}.transportSteering`),
    ...sessionSelection(value, label)
  });
  const invocationInput = admitInvocationInput(value, label);
  if (
    base.sessionView !== null &&
    (base.sessionView.workspaceId !== base.workspaceId ||
      base.sessionView.catalogId !== base.catalogId ||
      base.sessionView.catalogVersion !== base.catalogVersion ||
      base.sessionView.catalogDigest !== base.catalogDigest)
  ) {
    throw new TypeError(`${label}.sessionView: invocation catalog basis mismatch`);
  }
  if ("input" in invocationInput) {
    return Object.freeze({ ...base, input: invocationInput.input });
  }
  return Object.freeze({ ...base, inputRef: invocationInput.inputRef });
}

export function admitReadResultRequest(
  input: unknown,
  label = "ReadResultRequest"
): ReadResultRequest {
  const value = closedObject(input, ["workspaceId", "resultId", "graphCallId"], label);
  const workspaceId = nonEmptyString(
    requiredField(value, "workspaceId", label),
    `${label}.workspaceId`
  );
  const hasResultId = Object.hasOwn(value, "resultId");
  const hasGraphCallId = Object.hasOwn(value, "graphCallId");
  if (hasResultId === hasGraphCallId) {
    throw new TypeError(`${label}: exactly one of resultId or graphCallId is required`);
  }
  if (hasResultId) {
    return Object.freeze({
      workspaceId,
      resultId: nonEmptyString(
        requiredField(value, "resultId", label),
        `${label}.resultId`
      )
    });
  }
  return Object.freeze({
    workspaceId,
    graphCallId: nonEmptyString(
      requiredField(value, "graphCallId", label),
      `${label}.graphCallId`
    )
  });
}

function admitReplaySubject(input: unknown, label: string): ReplaySubject {
  const value = closedObject(
    input,
    ["kind", "workspaceId", "runId", "graphCallId", "subjectId"],
    label
  );
  const kind = oneOf(
    requiredField(value, "kind", label),
    ["workspace", "run", "graph_call", "subordinate"] as const,
    `${label}.kind`
  );
  const fieldByKind = {
    workspace: "workspaceId",
    run: "runId",
    graph_call: "graphCallId",
    subordinate: "subjectId"
  } as const;
  const admittedField = fieldByKind[kind];
  for (const field of ["workspaceId", "runId", "graphCallId", "subjectId"] as const) {
    if (field !== admittedField && Object.hasOwn(value, field)) {
      throw new TypeError(`${label}.${field}: forbidden for ${kind} subject`);
    }
  }
  if (kind === "workspace") {
    return Object.freeze({
      kind,
      workspaceId: nonEmptyString(
        requiredField(value, "workspaceId", label),
        `${label}.workspaceId`
      )
    });
  }
  if (kind === "run") {
    return Object.freeze({
      kind,
      runId: nonEmptyString(requiredField(value, "runId", label), `${label}.runId`)
    });
  }
  if (kind === "graph_call") {
    return Object.freeze({
      kind,
      graphCallId: nonEmptyString(
        requiredField(value, "graphCallId", label),
        `${label}.graphCallId`
      )
    });
  }
  return Object.freeze({
    kind,
    subjectId: nonEmptyString(
      requiredField(value, "subjectId", label),
      `${label}.subjectId`
    )
  });
}

export function admitReadReplayRequest(
  input: unknown,
  label = "ReadReplayRequest"
): ReadReplayRequest {
  const value = closedObject(
    input,
    ["workspaceId", "subject", "fromOrdinal", "limit"],
    label
  );
  const ordinalInput = optionalField(value, "fromOrdinal");
  const limitInput = optionalField(value, "limit");
  return Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    subject: admitReplaySubject(requiredField(value, "subject", label), `${label}.subject`),
    fromOrdinal:
      ordinalInput === undefined
        ? 0
        : integerInRange(ordinalInput, 0, Number.MAX_SAFE_INTEGER, `${label}.fromOrdinal`),
    limit:
      limitInput === undefined
        ? 1000
        : integerInRange(limitInput, 1, 10_000, `${label}.limit`)
  });
}

export function admitDs1OperationRequest(
  id: PublicOperationId,
  input: unknown,
  label = "Ds1OperationRequest"
): AnyDs1OperationRequest {
  switch (id) {
    case "abg.operation.workspace.create":
      return admitWorkspaceCreateRequest(input, label);
    case "abg.operation.workspace.open":
      return admitWorkspaceOpenRequest(input, label);
    case "abg.operation.catalog.resolve":
      return admitCatalogResolveRequest(input, label);
    case "abg.operation.catalog.verify":
      return admitCatalogVerifyRequest(input, label);
    case "abg.operation.install.install":
      return admitInstallProductRequest(input, label);
    case "abg.operation.catalog.bind":
      return admitCatalogBindRequest(input, label);
    case "abg.operation.catalog.admit":
      return admitCatalogAdmitRequest(input, label);
    case "abg.operation.catalog.list":
      return admitCatalogListRequest(input, label);
    case "abg.operation.catalog.describe":
      return admitCatalogDescribeRequest(input, label);
    case "abg.operation.catalog.allow":
      return admitCatalogAllowRequest(input, label);
    case "abg.operation.catalog.invoke":
      return admitCatalogInvokeRequest(input, label);
    case "abg.operation.read.result":
      return admitReadResultRequest(input, label);
    case "abg.operation.read.replay":
      return admitReadReplayRequest(input, label);
  }
}

interface AdmittedEnvelopeCommon {
  readonly schemaVersion: 1;
  readonly invocationSchemaId: string;
  readonly invocationSchemaVersion: "1.0.0";
  readonly invocationSchemaDigest: `sha256:${string}`;
  readonly invocationId: string;
  readonly operationContractVersion: "1.0.0";
  readonly operationContractDigest: `sha256:${string}`;
  readonly requestId: string;
  readonly requestSchemaId: string;
  readonly requestSchemaVersion: "1.0.0";
  readonly requestSchemaDigest: `sha256:${string}`;
  readonly resultSchemaId: string;
  readonly resultSchemaVersion: "1.0.0";
  readonly resultSchemaDigest: `sha256:${string}`;
  readonly refusalSchemaId: string;
  readonly refusalSchemaVersion: "1.0.0";
  readonly refusalSchemaDigest: `sha256:${string}`;
  readonly actorRef: string | null;
  readonly provenanceRefs: readonly string[];
  readonly adapter: AdapterIdentity;
  readonly correlationId: string;
}

function admitEnvelopeCommon(
  value: RawObject,
  id: PublicOperationId,
  label: string
): AdmittedEnvelopeCommon {
  const slug = OPERATION_SLUGS[id];
  const expectedRequestSchemaId = `abg.schema.operation.${slug}.request`;
  const expectedResultSchemaId = `abg.schema.operation.${slug}.result`;
  const expectedRefusalSchemaId = `abg.schema.operation.${slug}.refusal`;
  const invocationId = nonEmptyString(
    requiredField(value, "invocationId", label),
    `${label}.invocationId`
  );
  const requestSchemaId = nonEmptyString(
    requiredField(value, "requestSchemaId", label),
    `${label}.requestSchemaId`
  );
  const resultSchemaId = nonEmptyString(
    requiredField(value, "resultSchemaId", label),
    `${label}.resultSchemaId`
  );
  const refusalSchemaId = nonEmptyString(
    requiredField(value, "refusalSchemaId", label),
    `${label}.refusalSchemaId`
  );
  if (
    requestSchemaId !== expectedRequestSchemaId ||
    resultSchemaId !== expectedResultSchemaId ||
    refusalSchemaId !== expectedRefusalSchemaId
  ) {
    throw new TypeError(`${label}: operation schema identity does not match ${id}`);
  }
  const actorInput = requiredField(value, "actorRef", label);
  return Object.freeze({
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    invocationSchemaId: nonEmptyString(
      requiredField(value, "invocationSchemaId", label),
      `${label}.invocationSchemaId`
    ),
    invocationSchemaVersion: literal(
      requiredField(value, "invocationSchemaVersion", label),
      "1.0.0",
      `${label}.invocationSchemaVersion`
    ),
    invocationSchemaDigest: digest(
      requiredField(value, "invocationSchemaDigest", label),
      `${label}.invocationSchemaDigest`
    ),
    invocationId,
    operationContractVersion: literal(
      requiredField(value, "operationContractVersion", label),
      "1.0.0",
      `${label}.operationContractVersion`
    ),
    operationContractDigest: digest(
      requiredField(value, "operationContractDigest", label),
      `${label}.operationContractDigest`
    ),
    requestId: nonEmptyString(
      requiredField(value, "requestId", label),
      `${label}.requestId`
    ),
    requestSchemaId,
    requestSchemaVersion: literal(
      requiredField(value, "requestSchemaVersion", label),
      "1.0.0",
      `${label}.requestSchemaVersion`
    ),
    requestSchemaDigest: digest(
      requiredField(value, "requestSchemaDigest", label),
      `${label}.requestSchemaDigest`
    ),
    resultSchemaId,
    resultSchemaVersion: literal(
      requiredField(value, "resultSchemaVersion", label),
      "1.0.0",
      `${label}.resultSchemaVersion`
    ),
    resultSchemaDigest: digest(
      requiredField(value, "resultSchemaDigest", label),
      `${label}.resultSchemaDigest`
    ),
    refusalSchemaId,
    refusalSchemaVersion: literal(
      requiredField(value, "refusalSchemaVersion", label),
      "1.0.0",
      `${label}.refusalSchemaVersion`
    ),
    refusalSchemaDigest: digest(
      requiredField(value, "refusalSchemaDigest", label),
      `${label}.refusalSchemaDigest`
    ),
    actorRef: actorInput === null ? null : nonEmptyString(actorInput, `${label}.actorRef`),
    provenanceRefs: uniqueStrings(
      optionalField(value, "provenanceRefs") ?? [],
      `${label}.provenanceRefs`
    ),
    adapter: admitAdapterIdentity(
      requiredField(value, "adapter", label),
      `${label}.adapter`
    ),
    correlationId:
      optionalField(value, "correlationId") === undefined
        ? invocationId
        : nonEmptyString(optionalField(value, "correlationId"), `${label}.correlationId`)
  });
}

function operationRequiresActor(id: PublicOperationId): boolean {
  return (
    id === "abg.operation.workspace.create" ||
    id === "abg.operation.install.install" ||
    id === "abg.operation.catalog.bind" ||
    id === "abg.operation.catalog.admit" ||
    id === "abg.operation.catalog.invoke"
  );
}

function constructEnvelope<K extends PublicOperationId>(
  common: AdmittedEnvelopeCommon,
  id: K,
  request: Ds1PublicOperationContractMap[K]["request"]
): PublicOperationInvocationEnvelope<K> {
  if (operationRequiresActor(id) !== (common.actorRef !== null)) {
    throw new TypeError(
      `PublicOperationInvocationEnvelope.actorRef: actor rule mismatch for ${id}`
    );
  }
  return Object.freeze({ ...common, operationId: id, request });
}

function admitEnvelopeObject(
  value: RawObject,
  label: string
): AnyPublicOperationInvocationEnvelope {
  const id = operationId(
    requiredField(value, "operationId", label),
    `${label}.operationId`
  );
  const common = admitEnvelopeCommon(value, id, label);
  const requestInput = requiredField(value, "request", label);
  switch (id) {
    case "abg.operation.workspace.create":
      return constructEnvelope(common, id, admitWorkspaceCreateRequest(requestInput, `${label}.request`));
    case "abg.operation.workspace.open":
      return constructEnvelope(common, id, admitWorkspaceOpenRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.resolve":
      return constructEnvelope(common, id, admitCatalogResolveRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.verify":
      return constructEnvelope(common, id, admitCatalogVerifyRequest(requestInput, `${label}.request`));
    case "abg.operation.install.install":
      return constructEnvelope(common, id, admitInstallProductRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.bind":
      return constructEnvelope(common, id, admitCatalogBindRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.admit":
      return constructEnvelope(common, id, admitCatalogAdmitRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.list":
      return constructEnvelope(common, id, admitCatalogListRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.describe":
      return constructEnvelope(common, id, admitCatalogDescribeRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.allow":
      return constructEnvelope(common, id, admitCatalogAllowRequest(requestInput, `${label}.request`));
    case "abg.operation.catalog.invoke": {
      const request = admitCatalogInvokeRequest(requestInput, `${label}.request`);
      if (common.actorRef !== request.actorRef) {
        throw new TypeError(`${label}.actorRef: must equal request.actorRef`);
      }
      return constructEnvelope(common, id, request);
    }
    case "abg.operation.read.result":
      return constructEnvelope(common, id, admitReadResultRequest(requestInput, `${label}.request`));
    case "abg.operation.read.replay":
      return constructEnvelope(common, id, admitReadReplayRequest(requestInput, `${label}.request`));
  }
}

export function parsePublicOperationInvocationEnvelope(
  input: unknown,
  label = "PublicOperationInvocationEnvelope"
): AnyPublicOperationInvocationEnvelope {
  const value = closedObject(input, ENVELOPE_KEYS, label);
  return admitEnvelopeObject(value, label);
}

export function parsePublicOperationInvocationText(
  input: string,
  label = "PublicOperationInvocationEnvelope"
): AnyPublicOperationInvocationEnvelope {
  return parsePublicOperationInvocationEnvelope(admitIJsonText(input, label), label);
}

function assertBoundOperationContract(
  envelope: AnyPublicOperationInvocationEnvelope,
  resolvedOperation: ResolvedPublicOperationContract,
  expectedInvocationSchemaId:
    | "abg.schema.public-operation-invocation"
    | "abg.schema.host-invocation",
  label: string
): void {
  if (!ResolvedPublicOperationContract.isResolved(resolvedOperation)) {
    throw new TypeError(`${label}: operation contract must be resolved from a catalog`);
  }
  const row = admitPublicContractRow(
    resolvedOperation.row,
    `${label}.resolvedOperationRow`
  );
  nonEmptyString(resolvedOperation.catalogId, `${label}.resolvedOperation.catalogId`);
  exactSemVer(
    resolvedOperation.catalogVersion,
    `${label}.resolvedOperation.catalogVersion`
  );
  digest(
    resolvedOperation.catalogDigest,
    `${label}.resolvedOperation.catalogDigest`
  );
  const operation = row.operationContract;
  if (
    row.contractKind !== "operation" ||
    operation === null ||
    row.owningProductId !== "abiogenesis" ||
    row.nativeLocator?.packageName !== "@abiogenesis/typescript-tenant" ||
    row.contractId !== envelope.operationId ||
    operation.operationId !== envelope.operationId ||
    operation.operationVersion !== envelope.operationContractVersion ||
    operation.operationDigest !== envelope.operationContractDigest ||
    operation.requestSchemaId !== envelope.requestSchemaId ||
    operation.requestSchemaVersion !== envelope.requestSchemaVersion ||
    operation.requestSchemaDigest !== envelope.requestSchemaDigest ||
    operation.resultSchemaId !== envelope.resultSchemaId ||
    operation.resultSchemaVersion !== envelope.resultSchemaVersion ||
    operation.resultSchemaDigest !== envelope.resultSchemaDigest ||
    operation.refusalSchemaId !== envelope.refusalSchemaId ||
    operation.refusalSchemaVersion !== envelope.refusalSchemaVersion ||
    operation.refusalSchemaDigest !== envelope.refusalSchemaDigest ||
    operation.invocationSchemaId !== expectedInvocationSchemaId ||
    operation.invocationSchemaId !== envelope.invocationSchemaId ||
    operation.invocationSchemaVersion !== envelope.invocationSchemaVersion ||
    operation.invocationSchemaDigest !== envelope.invocationSchemaDigest
  ) {
    throw new TypeError(`${label}: invocation is not bound to the resolved operation row`);
  }
  if (
    "contractCatalogVersion" in envelope &&
    "contractCatalogDigest" in envelope &&
    (envelope.contractCatalogVersion !== resolvedOperation.catalogVersion ||
      envelope.contractCatalogDigest !== resolvedOperation.catalogDigest)
  ) {
    throw new TypeError(`${label}: host contract catalog basis mismatch`);
  }
}

export function admitPublicOperationInvocationEnvelope(
  input: unknown,
  resolvedOperation: ResolvedPublicOperationContract,
  label = "PublicOperationInvocationEnvelope"
): AnyPublicOperationInvocationEnvelope {
  const envelope = parsePublicOperationInvocationEnvelope(input, label);
  assertBoundOperationContract(
    envelope,
    resolvedOperation,
    "abg.schema.public-operation-invocation",
    label
  );
  return envelope;
}

export function admitPublicOperationInvocationText(
  input: string,
  resolvedOperation: ResolvedPublicOperationContract,
  label = "PublicOperationInvocationEnvelope"
): AnyPublicOperationInvocationEnvelope {
  return admitPublicOperationInvocationEnvelope(
    admitIJsonText(input, label),
    resolvedOperation,
    label
  );
}

function sameIJson(left: IJsonValue, right: IJsonValue): boolean {
  return canonicalizeIJson(left) === canonicalizeIJson(right);
}

function sameSteering(
  left: TransportSteering | null,
  right: TransportSteering | null
): boolean {
  return canonicalizeIJson(left) === canonicalizeIJson(right);
}

function assertRequestIdentity(
  request: CatalogInvokeRequest,
  input: {
    readonly workspaceId: string;
    readonly bindingId: string;
    readonly resolvedLockId: string;
    readonly catalogId: string;
    readonly catalogVersion: string;
    readonly catalogDigest: string;
    readonly graphFunctionHandle: string;
    readonly interfaceRef: string;
    readonly inputId: string;
    readonly inputSchemaId: string;
    readonly inputSchemaVersion: string;
    readonly inputSchemaDigest: string;
    readonly requiredCapabilityRefs: readonly string[];
    readonly transportSteering: TransportSteering | null;
  },
  label: string
): void {
  if (
    request.workspaceId !== input.workspaceId ||
    request.bindingId !== input.bindingId ||
    request.resolvedLockId !== input.resolvedLockId ||
    request.catalogId !== input.catalogId ||
    request.catalogVersion !== input.catalogVersion ||
    request.catalogDigest !== input.catalogDigest ||
    request.graphFunctionHandle !== input.graphFunctionHandle ||
    request.interfaceRef !== input.interfaceRef ||
    request.inputId !== input.inputId ||
    request.inputSchemaId !== input.inputSchemaId ||
    request.inputSchemaVersion !== input.inputSchemaVersion ||
    request.inputSchemaDigest !== input.inputSchemaDigest ||
    !equalStringArrays(request.requiredCapabilityRefs, input.requiredCapabilityRefs) ||
    !sameSteering(request.transportSteering, input.transportSteering)
  ) {
    throw new TypeError(`${label}: host fields must equal the admitted invoke request`);
  }
}

export function parseHostInvocationDescriptor(
  input: unknown,
  label = "HostInvocationDescriptor"
): HostInvocationDescriptor {
  const hostKeys = [
    ...ENVELOPE_KEYS,
    "contractCatalogVersion",
    "contractCatalogDigest",
    "workspaceId",
    "workspaceManifestDigest",
    "productSetDigest",
    "productBindingRefs",
    "bindingId",
    "resolvedLockId",
    "catalogId",
    "catalogVersion",
    "catalogDigest",
    "runtimeCatalogProjectionRef",
    "effectiveSessionViewId",
    "allowedHandles",
    "allowedEntryRefs",
    "graphFunctionHandle",
    "interfaceRef",
    "inputId",
    "inputSchemaId",
    "inputSchemaVersion",
    "inputSchemaDigest",
    "input",
    "inputRef",
    "requiredCapabilityRefs",
    "transportSteering",
    "mode",
    "scope",
    "target",
    "until"
  ];
  const value = closedObject(input, hostKeys, label);
  const envelope = admitEnvelopeObject(value, label);
  if (envelope.operationId !== "abg.operation.catalog.invoke") {
    throw new TypeError(`${label}.operationId: expected catalog.invoke`);
  }
  if (envelope.actorRef === null) {
    throw new TypeError(`${label}.actorRef: required`);
  }
  const allowedHandles = canonicalStringList(
    uniqueStrings(
      requiredField(value, "allowedHandles", label),
      `${label}.allowedHandles`
    )
  );
  const allowedEntryRefs = canonicalStringList(
    uniqueStrings(
      requiredField(value, "allowedEntryRefs", label),
      `${label}.allowedEntryRefs`
    )
  );
  const runtimeCatalogProjectionRef = nonEmptyString(
    requiredField(value, "runtimeCatalogProjectionRef", label),
    `${label}.runtimeCatalogProjectionRef`
  );
  const effectiveSessionViewId = nonEmptyString(
    requiredField(value, "effectiveSessionViewId", label),
    `${label}.effectiveSessionViewId`
  );
  if (allowedHandles.length !== allowedEntryRefs.length) {
    throw new TypeError(`${label}: public handles and runtime entry refs must align`);
  }
  const hostInput = admitInvocationInput(value, label);
  const request = envelope.request;
  if (request.sessionView !== null) {
    if (
      request.sessionView.effectiveSessionViewId !==
        effectiveSessionViewId ||
      request.sessionView.runtimeCatalogProjectionRef !==
        runtimeCatalogProjectionRef ||
      !equalStringArrays(request.sessionView.allowedEntryRefs, allowedEntryRefs) ||
      !equalStringArrays(request.sessionView.allowedHandles, allowedHandles)
    ) {
      throw new TypeError(`${label}: effective session view mismatch`);
    }
  }
  if (
    request.allowedHandles !== null &&
    !equalStringArrays(request.allowedHandles, allowedHandles)
  ) {
    throw new TypeError(`${label}.allowedHandles: request mismatch`);
  }
  if ("input" in hostInput) {
    if (!("input" in request) || !sameIJson(hostInput.input, request.input)) {
      throw new TypeError(`${label}.input: request mismatch`);
    }
  } else if (!("inputRef" in request) || hostInput.inputRef !== request.inputRef) {
    throw new TypeError(`${label}.inputRef: request mismatch`);
  }

  const identity = Object.freeze({
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    bindingId: nonEmptyString(
      requiredField(value, "bindingId", label),
      `${label}.bindingId`
    ),
    resolvedLockId: nonEmptyString(
      requiredField(value, "resolvedLockId", label),
      `${label}.resolvedLockId`
    ),
    catalogId: nonEmptyString(
      requiredField(value, "catalogId", label),
      `${label}.catalogId`
    ),
    catalogVersion: exactSemVer(
      requiredField(value, "catalogVersion", label),
      `${label}.catalogVersion`
    ),
    catalogDigest: digest(
      requiredField(value, "catalogDigest", label),
      `${label}.catalogDigest`
    ),
    graphFunctionHandle: nonEmptyString(
      requiredField(value, "graphFunctionHandle", label),
      `${label}.graphFunctionHandle`
    ),
    interfaceRef: nonEmptyString(
      requiredField(value, "interfaceRef", label),
      `${label}.interfaceRef`
    ),
    inputId: nonEmptyString(requiredField(value, "inputId", label), `${label}.inputId`),
    inputSchemaId: nonEmptyString(
      requiredField(value, "inputSchemaId", label),
      `${label}.inputSchemaId`
    ),
    inputSchemaVersion: nonEmptyString(
      requiredField(value, "inputSchemaVersion", label),
      `${label}.inputSchemaVersion`
    ),
    inputSchemaDigest: digest(
      requiredField(value, "inputSchemaDigest", label),
      `${label}.inputSchemaDigest`
    ),
    requiredCapabilityRefs: uniqueStrings(
      requiredField(value, "requiredCapabilityRefs", label),
      `${label}.requiredCapabilityRefs`
    ),
    transportSteering:
      requiredField(value, "transportSteering", label) === null
        ? null
        : admitTransportSteering(
            requiredField(value, "transportSteering", label),
            `${label}.transportSteering`
          )
  });
  assertRequestIdentity(request, identity, label);
  if (!allowedHandles.includes(identity.graphFunctionHandle)) {
    throw new TypeError(`${label}.graphFunctionHandle: absent from effective session view`);
  }
  const derivedSessionViewId = deriveRegistrySessionViewRef({
    catalogId: identity.catalogId,
    catalogProjectionRef: runtimeCatalogProjectionRef,
    allowedEntryRefs
  });
  if (effectiveSessionViewId !== derivedSessionViewId) {
    throw new TypeError(`${label}.effectiveSessionViewId: derived identity mismatch`);
  }
  const target = nonEmptyString(requiredField(value, "target", label), `${label}.target`);
  if (target !== identity.graphFunctionHandle) {
    throw new TypeError(`${label}.target: must equal graphFunctionHandle`);
  }
  const base = Object.freeze({
    ...envelope,
    contractCatalogVersion: exactSemVer(
      requiredField(value, "contractCatalogVersion", label),
      `${label}.contractCatalogVersion`
    ),
    contractCatalogDigest: digest(
      requiredField(value, "contractCatalogDigest", label),
      `${label}.contractCatalogDigest`
    ),
    workspaceId: identity.workspaceId,
    workspaceManifestDigest: digest(
      requiredField(value, "workspaceManifestDigest", label),
      `${label}.workspaceManifestDigest`
    ),
    productSetDigest: digest(
      requiredField(value, "productSetDigest", label),
      `${label}.productSetDigest`
    ),
    productBindingRefs: uniqueStrings(
      requiredField(value, "productBindingRefs", label),
      `${label}.productBindingRefs`,
      false
    ),
    bindingId: identity.bindingId,
    resolvedLockId: identity.resolvedLockId,
    catalogId: identity.catalogId,
    catalogVersion: identity.catalogVersion,
    catalogDigest: identity.catalogDigest,
    runtimeCatalogProjectionRef,
    effectiveSessionViewId,
    allowedHandles,
    allowedEntryRefs,
    graphFunctionHandle: identity.graphFunctionHandle,
    interfaceRef: identity.interfaceRef,
    inputId: identity.inputId,
    inputSchemaId: identity.inputSchemaId,
    inputSchemaVersion: identity.inputSchemaVersion,
    inputSchemaDigest: identity.inputSchemaDigest,
    requiredCapabilityRefs: identity.requiredCapabilityRefs,
    transportSteering: identity.transportSteering,
    mode: literal(requiredField(value, "mode", label), "invoke", `${label}.mode`),
    scope: literal(
      requiredField(value, "scope", label),
      "graph_function",
      `${label}.scope`
    ),
    target,
    until: oneOf(
      requiredField(value, "until", label),
      ["first_traversal", "blocked", "converged"] as const,
      `${label}.until`
    ),
    actorRef: envelope.actorRef
  });
  if ("input" in hostInput) {
    return Object.freeze({ ...base, input: hostInput.input });
  }
  return Object.freeze({ ...base, inputRef: hostInput.inputRef });
}

export function parseHostInvocationDescriptorText(
  input: string,
  label = "HostInvocationDescriptor"
): HostInvocationDescriptor {
  return parseHostInvocationDescriptor(admitIJsonText(input, label), label);
}

export function admitHostInvocationDescriptor(
  input: unknown,
  resolvedOperation: ResolvedPublicOperationContract,
  hostSchemaInput: PublicContractRow,
  label = "HostInvocationDescriptor"
): HostInvocationDescriptor {
  const descriptor = parseHostInvocationDescriptor(input, label);
  assertBoundOperationContract(
    descriptor,
    resolvedOperation,
    "abg.schema.public-operation-invocation",
    label
  );
  const hostSchema = admitPublicContractRow(
    hostSchemaInput,
    `${label}.hostSchemaContract`
  );
  if (
    hostSchema.contractId !== "abg.schema.host-invocation" ||
    hostSchema.contractKind !== "schema_asset" ||
    hostSchema.version !== "1.0.0" ||
    hostSchema.assetLocator === null ||
    hostSchema.assetLocator.schemaId !== "abg.schema.host-invocation" ||
    hostSchema.assetLocator.schemaVersion !== "1.0.0" ||
    hostSchema.assetLocator.digest !== hostSchema.digest
  ) {
    throw new TypeError(
      `${label}: host specialization is not bound to the exact host-invocation schema row`
    );
  }
  return descriptor;
}

export function admitHostInvocationDescriptorText(
  input: string,
  resolvedOperation: ResolvedPublicOperationContract,
  hostSchema: PublicContractRow,
  label = "HostInvocationDescriptor"
): HostInvocationDescriptor {
  return admitHostInvocationDescriptor(
    admitIJsonText(input, label),
    resolvedOperation,
    hostSchema,
    label
  );
}
