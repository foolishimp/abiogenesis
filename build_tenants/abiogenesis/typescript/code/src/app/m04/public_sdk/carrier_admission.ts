// Implements: REQ-P-CATALOG
// Implements: REQ-P-INSTALL
// Implements: REQ-P-PUBLIC-CONTRACTS

import {
  absolutePath,
  arrayOf,
  booleanValue,
  canonicalSemVerRange,
  closedObject,
  digest,
  exactSemVer,
  iJson,
  integerInRange,
  literal,
  nonEmptyString,
  nullableString,
  oneOf,
  relativePath,
  requiredField,
  utcTimestamp,
  uniqueStrings
} from "./admission_primitives.js";
import {
  DS1_PUBLIC_OPERATION_IDS,
  publicOperationSlug
} from "../public_contracts/operations.js";
import {
  canonicalStringList,
  deriveRegistrySessionViewRef
} from "../../../shared/runtime_identity.js";
import {
  admitIJsonValue,
  digestCanonicalIJson,
  type IJsonObject,
  type IJsonValue
} from "./canonical.js";
import type {
  AbgResolvedPolicyIdentity,
  AbgRuntimeIdentity,
  AbgRuntimeSystemProfile,
  CanonicalAssetLocator,
  CatalogCompatibilityRequirement,
  CatalogContributionManifest,
  CatalogContributionRow,
  CatalogDeclarationLocator,
  CatalogProductDescriptor,
  InstalledProductRecord,
  ModuleDeclarationLocator,
  NativeContractLocator,
  OpaqueOverlayAssetLocator,
  ProductCompatibilityResult,
  ProductContentInventoryRow,
  ProductRequirement,
  ProductToolchainManifest,
  ProductVerificationCheck,
  ProductVerificationRecord,
  PublicCatalogDescription,
  PublicCatalogKind,
  PublicCatalogRow,
  PublicContractCatalog,
  PublicContractKind,
  PublicContractRow,
  LegacyPublicContractRow,
  LegacyPublicOperationContractMetadata,
  PublishedPublicOperationAuthorityRequirements,
  PublishedPublicOperationContractMetadata,
  PublishedPublicOperationDefault,
  PublishedPublicOperationDefinitionKey,
  PublishedPublicOperationDefinitionMember,
  PublishedPublicOperationSchemaCoordinate,
  PublicOperationContractMetadata,
  PublicOperationDefault,
  PublicOperationEffectClass,
  PublicOperationEventAdmission,
  PublicOperationId,
  PublicOperationValueDomain,
  PublicOperationValueDomainKind,
  PublicSessionCatalogView,
  ResolvedDependencyEdge,
  ResolvedProductLock,
  ResolvedProductSelection,
  SuppliedProductArtifact,
  SuppliedProductArtifactFormat,
  ToolchainMutableStateRootsV3,
  ToolchainProductBindingV3,
  ToolchainWorkspaceBindingV3,
  VerifiedProductArtifact,
  WorkspaceAuthorityMode,
  WorkspaceManifest
} from "./carriers.js";

const PUBLIC_CONTRACT_KINDS = Object.freeze([
  "native_contract",
  "schema_asset",
  "vocabulary_asset",
  "corpus_asset",
  "operation",
  "capability"
] as const satisfies readonly PublicContractKind[]);

const PUBLIC_CATALOG_KINDS = Object.freeze([
  "graph_function",
  "node_type",
  "overlay"
] as const satisfies readonly PublicCatalogKind[]);

const ABG_PRODUCT_ID = "abiogenesis";
const ABG_PACKAGE_NAME = "@abiogenesis/typescript-tenant";

function publicCatalogKind(input: unknown, label: string): PublicCatalogKind {
  return oneOf(input, PUBLIC_CATALOG_KINDS, label);
}

function authorityMode(input: unknown, label: string): WorkspaceAuthorityMode {
  return oneOf(
    input,
    ["clean_no_project_authority", "imported"] as const,
    label
  );
}

function admitNativeContractLocator(
  input: unknown,
  label: string
): NativeContractLocator {
  const value = closedObject(
    input,
    ["kind", "packageName", "packageExport", "symbols"],
    label
  );
  return Object.freeze({
    kind: literal(requiredField(value, "kind", label), "native", `${label}.kind`),
    packageName: nonEmptyString(
      requiredField(value, "packageName", label),
      `${label}.packageName`
    ),
    packageExport: nonEmptyString(
      requiredField(value, "packageExport", label),
      `${label}.packageExport`
    ),
    symbols: uniqueStrings(
      requiredField(value, "symbols", label),
      `${label}.symbols`,
      false
    )
  });
}

function admitPublicOperationDefault(
  input: unknown,
  label: string
): PublicOperationDefault {
  const value = closedObject(
    input,
    ["fieldPath", "kind", "value", "sourceFieldPath", "derivation"],
    label
  );
  const fieldPath = nonEmptyString(
    requiredField(value, "fieldPath", label),
    `${label}.fieldPath`
  );
  const kind = oneOf(
    requiredField(value, "kind", label),
    ["literal", "copy_field", "derived"] as const,
    `${label}.kind`
  );
  if (kind === "literal") {
    const literalValue = closedObject(input, ["fieldPath", "kind", "value"], label);
    return Object.freeze({
      fieldPath,
      kind,
      value: iJson(requiredField(literalValue, "value", label), `${label}.value`)
    });
  }
  if (kind === "copy_field") {
    const copyValue = closedObject(
      input,
      ["fieldPath", "kind", "sourceFieldPath"],
      label
    );
    return Object.freeze({
      fieldPath,
      kind,
      sourceFieldPath: nonEmptyString(
        requiredField(copyValue, "sourceFieldPath", label),
        `${label}.sourceFieldPath`
      )
    });
  }
  const derivedValue = closedObject(
    input,
    ["fieldPath", "kind", "derivation"],
    label
  );
  return Object.freeze({
    fieldPath,
    kind,
    derivation: oneOf(
      requiredField(derivedValue, "derivation", label),
      [
        "full_workspace_catalog",
        "toolchain_resolution_precedence",
        "workspace_mutable_roots",
        "canonical_handle"
      ] as const,
      `${label}.derivation`
    )
  });
}

function nullableDomainInteger(input: unknown, label: string): number | null {
  return input === null
    ? null
    : integerInRange(
        input,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        label
      );
}

function admitPublicOperationValueDomain(
  input: unknown,
  label: string
): PublicOperationValueDomain {
  const value = closedObject(
    input,
    ["fieldPath", "kind", "required", "nullable", "values", "minimum", "maximum"],
    label
  );
  const kind: PublicOperationValueDomainKind = oneOf(
    requiredField(value, "kind", label),
    [
      "absolute_path",
      "positive_integer",
      "bounded_integer",
      "enum",
      "non_empty_string",
      "sha256_digest",
      "semver",
      "semver_range",
      "i_json",
      "closed_carrier",
      "unique_string_array",
      "non_empty_unique_array",
      "exclusive_field_union"
    ] as const,
    `${label}.kind`
  );
  const values = arrayOf(
    requiredField(value, "values", label),
    `${label}.values`,
    iJson
  );
  const minimum = nullableDomainInteger(
    requiredField(value, "minimum", label),
    `${label}.minimum`
  );
  const maximum = nullableDomainInteger(
    requiredField(value, "maximum", label),
    `${label}.maximum`
  );
  if (kind === "enum" && values.length === 0) {
    throw new TypeError(`${label}.values: enum requires a non-empty domain`);
  }
  if (
    kind === "bounded_integer" &&
    (minimum === null || maximum === null || minimum > maximum)
  ) {
    throw new TypeError(`${label}: bounded_integer requires an ordered range`);
  }
  if (kind === "positive_integer" && minimum !== 1) {
    throw new TypeError(`${label}.minimum: positive_integer requires literal 1`);
  }
  return Object.freeze({
    fieldPath: nonEmptyString(
      requiredField(value, "fieldPath", label),
      `${label}.fieldPath`
    ),
    kind,
    required: booleanValue(
      requiredField(value, "required", label),
      `${label}.required`
    ),
    nullable: booleanValue(
      requiredField(value, "nullable", label),
      `${label}.nullable`
    ),
    values,
    minimum,
    maximum
  });
}

function admitLegacyPublicOperationContractMetadata(
  input: unknown,
  label: string
): LegacyPublicOperationContractMetadata {
  const value = closedObject(
    input,
    [
      "operationId",
      "operationVersion",
      "operationDigest",
      "requestSchemaId",
      "requestSchemaVersion",
      "requestSchemaDigest",
      "requestSchemaPath",
      "resultSchemaId",
      "resultSchemaVersion",
      "resultSchemaDigest",
      "resultSchemaPath",
      "refusalSchemaId",
      "refusalSchemaVersion",
      "refusalSchemaDigest",
      "refusalSchemaPath",
      "invocationSchemaId",
      "invocationSchemaVersion",
      "invocationSchemaDigest",
      "invocationSchemaPath",
      "defaults",
      "closedDomains",
      "actorPolicy",
      "authorityClass",
      "effectClass",
      "eventAdmission",
      "terminalDispositions",
      "nonTerminalDispositions",
      "adapterExitMap"
    ],
    label
  );
  const operationId = oneOf(
    requiredField(value, "operationId", label),
    DS1_PUBLIC_OPERATION_IDS,
    `${label}.operationId`
  );
  const slug = publicOperationSlug(operationId);
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
  const invocationSchemaId = nonEmptyString(
    requiredField(value, "invocationSchemaId", label),
    `${label}.invocationSchemaId`
  );
  const expectedInvocationSchemaId = "abg.schema.public-operation-invocation";
  const requestSchemaPath = relativePath(
    requiredField(value, "requestSchemaPath", label),
    `${label}.requestSchemaPath`
  );
  const resultSchemaPath = relativePath(
    requiredField(value, "resultSchemaPath", label),
    `${label}.resultSchemaPath`
  );
  const refusalSchemaPath = relativePath(
    requiredField(value, "refusalSchemaPath", label),
    `${label}.refusalSchemaPath`
  );
  const invocationSchemaPath = relativePath(
    requiredField(value, "invocationSchemaPath", label),
    `${label}.invocationSchemaPath`
  );
  const expectedInvocationSchemaPath =
    "contracts/schemas/public-operation-invocation.schema.json";
  if (
    requestSchemaId !== `abg.schema.operation.${slug}.request` ||
    resultSchemaId !== `abg.schema.operation.${slug}.result` ||
    refusalSchemaId !== `abg.schema.operation.${slug}.refusal` ||
    invocationSchemaId !== expectedInvocationSchemaId ||
    requestSchemaPath !==
      `contracts/schemas/operations/${slug}/request.schema.json` ||
    resultSchemaPath !==
      `contracts/schemas/operations/${slug}/result.schema.json` ||
    refusalSchemaPath !==
      `contracts/schemas/operations/${slug}/refusal.schema.json` ||
    invocationSchemaPath !== expectedInvocationSchemaPath
  ) {
    throw new TypeError(`${label}: schema identity does not match ${operationId}`);
  }
  const defaults = arrayOf(
    requiredField(value, "defaults", label),
    `${label}.defaults`,
    admitPublicOperationDefault
  );
  const closedDomains = arrayOf(
    requiredField(value, "closedDomains", label),
    `${label}.closedDomains`,
    admitPublicOperationValueDomain
  );
  if (closedDomains.length === 0) {
    throw new TypeError(`${label}.closedDomains: expected a non-empty array`);
  }
  if (
    new Set(defaults.map((row) => row.fieldPath)).size !== defaults.length ||
    new Set(closedDomains.map((row) => row.fieldPath)).size !== closedDomains.length
  ) {
    throw new TypeError(`${label}: duplicate default or domain field path`);
  }
  const actorPolicy = oneOf(
    requiredField(value, "actorPolicy", label),
    ["required", "forbidden"] as const,
    `${label}.actorPolicy`
  );
  const actorRequired =
    operationId === "abg.operation.workspace.create" ||
    operationId === "abg.operation.install.install" ||
    operationId === "abg.operation.catalog.bind" ||
    operationId === "abg.operation.catalog.admit" ||
    operationId === "abg.operation.catalog.invoke" ||
    operationId === "abg.operation.fh.select" ||
    operationId === "abg.operation.fh.approve" ||
    operationId === "abg.operation.fh.reject" ||
    operationId === "abg.operation.fh.assess" ||
    operationId === "abg.operation.fh.answer-escalation" ||
    operationId === "abg.operation.run.resume";
  if ((actorPolicy === "required") !== actorRequired) {
    throw new TypeError(`${label}.actorPolicy: operation actor rule mismatch`);
  }
  const authorityClass = oneOf(
    requiredField(value, "authorityClass", label),
    ["pure", "read", "write", "attestation"] as const,
    `${label}.authorityClass`
  );
  const effectClass: PublicOperationEffectClass = oneOf(
    requiredField(value, "effectClass", label),
    [
      "none",
      "workspace_manifest_write",
      "product_resolution",
      "temporary_artifact_read",
      "immutable_product_install",
      "workspace_binding_write",
      "runtime_catalog_admission",
      "runtime_catalog_projection",
      "runtime_session_projection",
      "runtime_graph_function_invoke",
      "runtime_fh_response_admission",
      "runtime_resume_admission",
      "runtime_result_projection",
      "runtime_replay_projection"
    ] as const,
    `${label}.effectClass`
  );
  const eventAdmission: PublicOperationEventAdmission = oneOf(
    requiredField(value, "eventAdmission", label),
    [
      "none",
      "catalog_admission_events",
      "runtime_execution_events",
      "runtime_interaction_events"
    ] as const,
    `${label}.eventAdmission`
  );
  const expectedEventAdmission =
    operationId === "abg.operation.catalog.admit"
      ? "catalog_admission_events"
      : operationId === "abg.operation.catalog.invoke"
        ? "runtime_execution_events"
        : operationId === "abg.operation.fh.select" ||
            operationId === "abg.operation.fh.approve" ||
            operationId === "abg.operation.fh.reject" ||
            operationId === "abg.operation.fh.assess" ||
            operationId === "abg.operation.fh.answer-escalation" ||
            operationId === "abg.operation.run.resume"
          ? "runtime_interaction_events"
        : "none";
  if (eventAdmission !== expectedEventAdmission) {
    throw new TypeError(`${label}.eventAdmission: operation event rule mismatch`);
  }
  const terminalDispositions = uniqueStrings(
    requiredField(value, "terminalDispositions", label),
    `${label}.terminalDispositions`
  );
  const nonTerminalDispositions = uniqueStrings(
    requiredField(value, "nonTerminalDispositions", label),
    `${label}.nonTerminalDispositions`
  );
  if (terminalDispositions.length === 0 && nonTerminalDispositions.length === 0) {
    throw new TypeError(`${label}: at least one disposition is required`);
  }
  if (
    terminalDispositions.some((disposition) =>
      nonTerminalDispositions.includes(disposition)
    )
  ) {
    throw new TypeError(`${label}: terminal and non-terminal dispositions overlap`);
  }
  const exitInput = closedObject(
    requiredField(value, "adapterExitMap", label),
    [
      "acceptedTerminal",
      "refused",
      "invalidInvocation",
      "acceptedNonTerminal",
      "adapterFailure"
    ],
    `${label}.adapterExitMap`
  );
  const acceptedNonTerminalInput = requiredField(
    exitInput,
    "acceptedNonTerminal",
    `${label}.adapterExitMap`
  );
  const acceptedNonTerminal =
    acceptedNonTerminalInput === null
      ? null
      : literal(
          acceptedNonTerminalInput,
          3,
          `${label}.adapterExitMap.acceptedNonTerminal`
        );
  if ((nonTerminalDispositions.length > 0) !== (acceptedNonTerminal === 3)) {
    throw new TypeError(`${label}.adapterExitMap: non-terminal exit rule mismatch`);
  }
  const adapterExitMap = Object.freeze({
    acceptedTerminal: literal(
      requiredField(exitInput, "acceptedTerminal", `${label}.adapterExitMap`),
      0,
      `${label}.adapterExitMap.acceptedTerminal`
    ),
    refused: literal(
      requiredField(exitInput, "refused", `${label}.adapterExitMap`),
      1,
      `${label}.adapterExitMap.refused`
    ),
    invalidInvocation: literal(
      requiredField(exitInput, "invalidInvocation", `${label}.adapterExitMap`),
      2,
      `${label}.adapterExitMap.invalidInvocation`
    ),
    acceptedNonTerminal,
    adapterFailure: literal(
      requiredField(exitInput, "adapterFailure", `${label}.adapterExitMap`),
      70,
      `${label}.adapterExitMap.adapterFailure`
    )
  });
  return Object.freeze({
    operationId,
    operationVersion: literal(
      requiredField(value, "operationVersion", label),
      "1.0.0",
      `${label}.operationVersion`
    ),
    operationDigest: digest(
      requiredField(value, "operationDigest", label),
      `${label}.operationDigest`
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
    requestSchemaPath,
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
    resultSchemaPath,
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
    refusalSchemaPath,
    invocationSchemaId,
    invocationSchemaVersion: literal(
      requiredField(value, "invocationSchemaVersion", label),
      "1.0.0",
      `${label}.invocationSchemaVersion`
    ),
    invocationSchemaDigest: digest(
      requiredField(value, "invocationSchemaDigest", label),
      `${label}.invocationSchemaDigest`
    ),
    invocationSchemaPath,
    defaults,
    closedDomains,
    actorPolicy,
    authorityClass,
    effectClass,
    eventAdmission,
    terminalDispositions,
    nonTerminalDispositions,
    adapterExitMap
  });
}

function admitCanonicalAssetLocator(
  input: unknown,
  label: string
): CanonicalAssetLocator {
  const value = closedObject(
    input,
    ["kind", "relativePath", "schemaId", "schemaVersion", "mediaType", "digest"],
    label
  );
  return Object.freeze({
    kind: literal(requiredField(value, "kind", label), "asset", `${label}.kind`),
    relativePath: relativePath(
      requiredField(value, "relativePath", label),
      `${label}.relativePath`
    ),
    schemaId: nonEmptyString(
      requiredField(value, "schemaId", label),
      `${label}.schemaId`
    ),
    schemaVersion: nonEmptyString(
      requiredField(value, "schemaVersion", label),
      `${label}.schemaVersion`
    ),
    mediaType: nonEmptyString(
      requiredField(value, "mediaType", label),
      `${label}.mediaType`
    ),
    digest: digest(requiredField(value, "digest", label), `${label}.digest`)
  });
}

function isIJsonObject(input: unknown): input is IJsonObject {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function hasExactKeys(input: IJsonObject, keys: readonly string[]): boolean {
  const actual = Object.keys(input);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(input, key));
}

function isNonEmptyText(input: unknown): input is string {
  return typeof input === "string" && input.trim().length > 0;
}

function isDigestText(input: unknown): input is `sha256:${string}` {
  return typeof input === "string" && /^sha256:[0-9a-f]{64}$/u.test(input);
}

function isStringList(input: unknown): input is readonly string[] {
  return Array.isArray(input) && input.every((entry) => typeof entry === "string");
}

function isPublishedDefinitionKey(
  input: unknown
): input is PublishedPublicOperationDefinitionKey {
  if (!isIJsonObject(input) || !isNonEmptyText(input["operationId"])) {
    return false;
  }
  return input["memberKind"] === "variant"
    ? hasExactKeys(input, ["operationId", "memberKind", "variant"]) &&
        isNonEmptyText(input["variant"])
    : input["memberKind"] === "project_read_case" &&
        input["operationId"] === "abg.operation.project.read" &&
        hasExactKeys(input, ["operationId", "memberKind", "caseKey"]) &&
        isNonEmptyText(input["caseKey"]);
}

function isPublishedSchemaCoordinate(
  input: unknown
): input is PublishedPublicOperationSchemaCoordinate {
  if (
    !isIJsonObject(input) ||
    !hasExactKeys(input, [
      "contractId", "contractVersion", "contractDigest", "schemaId",
      "schemaVersion", "schemaDigest", "assetLocator"
    ]) ||
    !isNonEmptyText(input["contractId"]) ||
    input["contractVersion"] !== "5.0.0" ||
    !isDigestText(input["contractDigest"]) ||
    !isNonEmptyText(input["schemaId"]) ||
    input["schemaVersion"] !== "5.0.0" ||
    !isDigestText(input["schemaDigest"]) ||
    !isIJsonObject(input["assetLocator"])
  ) {
    return false;
  }
  const locator = input["assetLocator"];
  return hasExactKeys(locator, [
    "kind", "relativePath", "schemaId", "schemaVersion", "mediaType", "digest"
  ]) && locator["kind"] === "asset" &&
    isNonEmptyText(locator["relativePath"]) &&
    locator["schemaId"] === input["schemaId"] &&
    locator["schemaVersion"] === "5.0.0" &&
    locator["mediaType"] === "application/schema+json" &&
    locator["digest"] === input["schemaDigest"] &&
    input["contractDigest"] === input["schemaDigest"];
}

function isPublishedAuthorityRequirements(
  input: unknown
): input is PublishedPublicOperationAuthorityRequirements {
  if (!isIJsonObject(input) || !hasExactKeys(input, [
    "actor", "workspace", "productSet", "dependencyLock", "catalogScope",
    "executionProgram", "invocationPolicy", "transportSteering"
  ])) {
    return false;
  }
  const presence = (value: IJsonValue | undefined) =>
    value === "forbidden" || value === "exactly_one";
  const scope = input["catalogScope"];
  const validScope = isIJsonObject(scope) && (
    (hasExactKeys(scope, ["kind", "requirement"]) && scope["kind"] === "fixed" &&
      presence(scope["requirement"])) ||
    (hasExactKeys(scope, ["kind", "workspace_catalog", "session_view"]) &&
      scope["kind"] === "by_visibility_basis" &&
      scope["workspace_catalog"] === "forbidden" &&
      scope["session_view"] === "exactly_one_matching_selector")
  );
  return (input["actor"] === "forbidden" || input["actor"] === "required") &&
    presence(input["workspace"]) && presence(input["productSet"]) &&
    presence(input["dependencyLock"]) && validScope &&
    presence(input["executionProgram"]) && presence(input["invocationPolicy"]) &&
    presence(input["transportSteering"]);
}

function isPublishedDefault(input: unknown): input is PublishedPublicOperationDefault {
  if (!isIJsonObject(input) || !hasExactKeys(input, ["field", "policy"]) ||
      !isNonEmptyText(input["field"]) || !isIJsonObject(input["policy"])) {
    return false;
  }
  const policy = input["policy"];
  return hasExactKeys(policy, ["kind", "value"]) && policy["kind"] === "literal" &&
    isNonEmptyText(policy["value"]);
}

export function publishedPublicOperationDefinitionDigest(
  basis: unknown
): `sha256:${string}` {
  const value = admitIJsonValue(
    basis,
    "PublishedPublicOperationDefinitionMember digest basis"
  );
  if (!isIJsonObject(value)) {
    throw new TypeError(
      "PublishedPublicOperationDefinitionMember digest basis: expected object"
    );
  }
  const projection: Record<string, IJsonValue> = {};
  for (const key of Object.keys(value)) {
    if (key !== "definitionDigest") {
      const member = value[key];
      if (member !== undefined) {
        projection[key] = member;
      }
    }
  }
  return digestCanonicalIJson(projection);
}

export interface PublishedPublicOperationFamilyDigestRow {
  readonly operationId: string;
  readonly definitions: readonly PublishedPublicOperationDefinitionMember[];
}

function publishedDefinitionMemberIdentity(
  definition: PublishedPublicOperationDefinitionMember
): string {
  return definition.definitionKey.memberKind === "variant"
    ? definition.definitionKey.variant
    : definition.definitionKey.caseKey;
}

export function publishedPublicOperationFamilyDigest(
  rows: readonly PublishedPublicOperationFamilyDigestRow[]
): `sha256:${string}` {
  const projection: Record<string, Record<string, string>> = {};
  for (const row of [...rows].sort((left, right) =>
    left.operationId < right.operationId ? -1 : left.operationId > right.operationId ? 1 : 0
  )) {
    if (Object.hasOwn(projection, row.operationId)) {
      throw new TypeError(
        `public operation family digest: duplicate operation ${row.operationId}`
      );
    }
    const members: Record<string, string> = {};
    projection[row.operationId] = members;
    for (const definition of row.definitions) {
      if (definition.definitionKey.operationId !== row.operationId) {
        throw new TypeError(
          `public operation family digest: definition escapes ${row.operationId}`
        );
      }
      const member = publishedDefinitionMemberIdentity(definition);
      if (Object.hasOwn(members, member)) {
        throw new TypeError(
          `public operation family digest: duplicate member ${row.operationId}.${member}`
        );
      }
      members[member] = definition.definitionDigest;
    }
  }
  return digestCanonicalIJson(projection);
}

function isPublishedDefinitionMember(
  input: unknown
): input is PublishedPublicOperationDefinitionMember {
  if (!isIJsonObject(input) || !hasExactKeys(input, [
    "definitionKey", "definitionDigest", "version", "semanticAuthorityRef",
    "semanticAuthorityDigest", "authorityClass", "effectClass", "eventAdmission",
    "authoritySlotRequirements", "capabilityRefs", "workspaceBindingRequirement",
    "defaults", "schemaCoordinates", "sdkCoordinate", "cliCoordinate", "adapterExitMap"
  ])) {
    return false;
  }
  const schemas = input["schemaCoordinates"];
  const exits = input["adapterExitMap"];
  const nonterminal = isIJsonObject(schemas) ? schemas["nonterminal"] : undefined;
  const effectClasses: readonly PublishedPublicOperationDefinitionMember["effectClass"][] = [
    "workspace_filesystem", "workspace_read_admission", "pure_projection",
    "deterministic_evaluation", "immutable_install_filesystem",
    "workspace_binding_persistence", "catalog_event_admission",
    "deterministic_narrowing", "declaration_application_admission", "abg_traversal",
    "abg_continuation", "fh_response_admission", "result_assessment_admission",
    "witnessed_act_admission", "tuning_lifecycle_admission",
    "conformance_evaluation_admission", "product_filesystem",
    "immutable_release_publication"
  ];
  return isPublishedDefinitionKey(input["definitionKey"]) &&
    isDigestText(input["definitionDigest"]) && input["version"] === "5.0.0" &&
    isNonEmptyText(input["semanticAuthorityRef"]) &&
    isDigestText(input["semanticAuthorityDigest"]) &&
    ["pure", "read", "write", "attestation"].includes(String(input["authorityClass"])) &&
    effectClasses.some((effectClass) => effectClass === input["effectClass"]) &&
    ["none", "owning_semantic_authority", "immutable_artifact_boundary"].includes(
      String(input["eventAdmission"])
    ) && isPublishedAuthorityRequirements(input["authoritySlotRequirements"]) &&
    isStringList(input["capabilityRefs"]) &&
    new Set(input["capabilityRefs"]).size === input["capabilityRefs"].length &&
    (input["workspaceBindingRequirement"] === "forbidden" ||
      input["workspaceBindingRequirement"] === "exactly_one") &&
    Array.isArray(input["defaults"]) && input["defaults"].every(isPublishedDefault) &&
    isIJsonObject(schemas) && hasExactKeys(schemas, [
      "request", "result", "refusal", "nonterminal"
    ]) && isPublishedSchemaCoordinate(schemas["request"]) &&
    isPublishedSchemaCoordinate(schemas["result"]) &&
    isPublishedSchemaCoordinate(schemas["refusal"]) &&
    (nonterminal === null || isPublishedSchemaCoordinate(nonterminal)) &&
    isNonEmptyText(input["sdkCoordinate"]) && isNonEmptyText(input["cliCoordinate"]) &&
    isIJsonObject(exits) && hasExactKeys(exits, [
      "acceptedTerminal", "refused", "invalidInvocation", "acceptedNonTerminal",
      "adapterFailure"
    ]) && exits["acceptedTerminal"] === 0 && exits["refused"] === 1 &&
    exits["invalidInvocation"] === 2 && exits["adapterFailure"] === 70 &&
    (exits["acceptedNonTerminal"] === null || exits["acceptedNonTerminal"] === 3) &&
    ((nonterminal === null) === (exits["acceptedNonTerminal"] === null));
}

export function admitPublishedPublicOperationDefinitionMember(
  input: unknown,
  label: string
): PublishedPublicOperationDefinitionMember {
  const value = iJson(input, label);
  if (!isPublishedDefinitionMember(value)) {
    throw new TypeError(`${label}: malformed published operation definition`);
  }
  const definition = value;
  if (
    definition.definitionDigest !==
      publishedPublicOperationDefinitionDigest(definition)
  ) {
    throw new TypeError(`${label}.definitionDigest: semantic projection differs`);
  }
  return definition;
}

function admitPublishedPublicOperationContractMetadata(
  input: unknown,
  label: string
): PublishedPublicOperationContractMetadata {
  const value = closedObject(
    input,
    [
      "kind",
      "operationId",
      "operationVersion",
      "operationDigest",
      "familyDigest",
      "definitions"
    ],
    label
  );
  const operationId = nonEmptyString(
    requiredField(value, "operationId", label),
    `${label}.operationId`
  );
  const definitions = arrayOf(
    requiredField(value, "definitions", label),
    `${label}.definitions`,
    admitPublishedPublicOperationDefinitionMember
  );
  const [firstDefinition, ...remainingDefinitions] = definitions;
  if (firstDefinition === undefined) {
    throw new TypeError(`${label}.definitions: expected non-empty family`);
  }
  const nonEmptyDefinitions: PublishedPublicOperationContractMetadata["definitions"] =
    Object.freeze([firstDefinition, ...remainingDefinitions]);
  const memberIds = definitions.map((definition) =>
    definition.definitionKey.memberKind === "variant"
      ? `variant:${definition.definitionKey.variant}`
      : `project_read_case:${definition.definitionKey.caseKey}`
  );
  if (
    definitions.some((definition) => definition.definitionKey.operationId !== operationId) ||
    new Set(memberIds).size !== memberIds.length
  ) {
    throw new TypeError(`${label}.definitions: operation containment mismatch`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_public_operation_definition_family",
      `${label}.kind`
    ),
    operationId,
    operationVersion: literal(
      requiredField(value, "operationVersion", label),
      "5.0.0",
      `${label}.operationVersion`
    ),
    operationDigest: digest(
      requiredField(value, "operationDigest", label),
      `${label}.operationDigest`
    ),
    familyDigest: digest(
      requiredField(value, "familyDigest", label),
      `${label}.familyDigest`
    ),
    definitions: nonEmptyDefinitions
  });
}

function admitPublicOperationContractMetadata(
  input: unknown,
  label: string
): PublicOperationContractMetadata {
  const kind = isIJsonObject(input)
    ? input["kind"]
    : undefined;
  return kind === "abg_public_operation_definition_family"
    ? admitPublishedPublicOperationContractMetadata(input, label)
    : admitLegacyPublicOperationContractMetadata(input, label);
}

export function admitPublicContractRow(
  input: unknown,
  label = "PublicContractRow"
): PublicContractRow {
  const value = closedObject(
    input,
    [
      "contractId",
      "contractKind",
      "owningProductId",
      "version",
      "digest",
      "authorityRefs",
      "capabilityRefs",
      "nativeLocator",
      "assetLocator",
      "operationContract"
    ],
    label
  );
  const nativeInput = requiredField(value, "nativeLocator", label);
  const assetInput = requiredField(value, "assetLocator", label);
  const nativeLocator =
    nativeInput === null
      ? null
      : admitNativeContractLocator(nativeInput, `${label}.nativeLocator`);
  const assetLocator =
    assetInput === null
      ? null
      : admitCanonicalAssetLocator(assetInput, `${label}.assetLocator`);
  const operationInput = requiredField(value, "operationContract", label);
  const operationContract =
    operationInput === null
      ? null
      : admitPublicOperationContractMetadata(
          operationInput,
          `${label}.operationContract`
        );
  if (nativeLocator === null && assetLocator === null) {
    throw new TypeError(`${label}: at least one exact locator is required`);
  }
  const contractId = nonEmptyString(
      requiredField(value, "contractId", label),
      `${label}.contractId`
    );
  const contractKind = oneOf(
      requiredField(value, "contractKind", label),
      PUBLIC_CONTRACT_KINDS,
      `${label}.contractKind`
    );
  const version = exactSemVer(
    requiredField(value, "version", label),
    `${label}.version`
  );
  const rowDigest = digest(requiredField(value, "digest", label), `${label}.digest`);
  if (contractKind === "operation") {
    const operationSlug = operationContract?.operationId.slice(
      "abg.operation.".length
    );
    if (
      operationContract === null ||
      nativeLocator === null ||
      assetLocator === null ||
      contractId !== operationContract.operationId ||
      version !== operationContract.operationVersion ||
      rowDigest !== operationContract.operationDigest ||
      assetLocator.relativePath !==
        `contracts/operations/${operationSlug ?? ""}.json` ||
      assetLocator.schemaId !== "abg.schema.public-operation-contract" ||
      assetLocator.schemaVersion !== "1.0.0" ||
      assetLocator.mediaType !== "application/json" ||
      assetLocator.digest !== rowDigest
    ) {
      throw new TypeError(`${label}: operation row metadata is incomplete or incoherent`);
    }
  } else if (operationContract !== null) {
    throw new TypeError(`${label}.operationContract: forbidden for ${contractKind}`);
  }
  return Object.freeze({
    contractId,
    contractKind,
    owningProductId: nonEmptyString(
      requiredField(value, "owningProductId", label),
      `${label}.owningProductId`
    ),
    version,
    digest: rowDigest,
    authorityRefs: uniqueStrings(
      requiredField(value, "authorityRefs", label),
      `${label}.authorityRefs`
    ),
    capabilityRefs: uniqueStrings(
      requiredField(value, "capabilityRefs", label),
      `${label}.capabilityRefs`
    ),
    nativeLocator,
    assetLocator,
    operationContract
  });
}

function assertPublishedOperationFamilyCatalog(
  rows: readonly PublicContractRow[],
  label: string
): void {
  const operationRows = rows.filter((row) => row.contractKind === "operation");
  if (operationRows.length !== 19) {
    throw new TypeError(`${label}.rows: expected exact 19-operation family`);
  }
  const metadata = operationRows.map((row) => row.operationContract);
  const isPublishedFamily = (
    entry: PublicOperationContractMetadata | null
  ): entry is PublishedPublicOperationContractMetadata =>
    entry?.kind === "abg_public_operation_definition_family";
  if (!metadata.every(isPublishedFamily)) {
    throw new TypeError(`${label}.rows: legacy or partial operation metadata is forbidden`);
  }
  const familyRows = metadata;
  const operationIds = familyRows.map((row) => row.operationId);
  if (new Set(operationIds).size !== 19) {
    throw new TypeError(`${label}.rows: duplicate operation identity`);
  }
  const familyDigests = new Set(familyRows.map((row) => row.familyDigest));
  if (familyDigests.size !== 1) {
    throw new TypeError(`${label}.rows: operation family digest differs`);
  }
  let definitionCount = 0;
  let schemaCount = 0;
  let absentNonterminalCount = 0;
  const schemaIdentities = new Set<string>();
  for (const row of [...familyRows].sort((left, right) =>
    left.operationId < right.operationId ? -1 : left.operationId > right.operationId ? 1 : 0
  )) {
    const expectedCapabilities = new Set<string>();
    for (const definition of row.definitions) {
      definitionCount += 1;
      for (const capabilityRef of definition.capabilityRefs) {
        expectedCapabilities.add(capabilityRef);
      }
      for (const coordinate of [
        definition.schemaCoordinates.request,
        definition.schemaCoordinates.result,
        definition.schemaCoordinates.refusal,
        definition.schemaCoordinates.nonterminal
      ]) {
        if (coordinate === null) {
          absentNonterminalCount += 1;
          continue;
        }
        schemaCount += 1;
        const identity = `${coordinate.schemaId}@${coordinate.schemaVersion}`;
        if (schemaIdentities.has(identity)) {
          throw new TypeError(`${label}.rows: duplicate operation schema ${identity}`);
        }
        schemaIdentities.add(identity);
      }
    }
    const sourceRow = operationRows.find(
      (candidate) => candidate.contractId === row.operationId
    );
    if (
      sourceRow === undefined ||
      [...expectedCapabilities].sort().join("\u0000") !==
        [...sourceRow.capabilityRefs].sort().join("\u0000")
    ) {
      throw new TypeError(
        `${label}.rows: operation capability projection differs for ${row.operationId}`
      );
    }
  }
  if (
    definitionCount !== 62 ||
    schemaCount !== 196 ||
    absentNonterminalCount !== 52
  ) {
    throw new TypeError(
      `${label}.rows: expected 62 definitions, 196 schemas, and 52 absent nonterminals`
    );
  }
  const familyDigest = familyRows[0]?.familyDigest;
  if (
    familyDigest === undefined ||
    familyDigest !== publishedPublicOperationFamilyDigest(familyRows)
  ) {
    throw new TypeError(`${label}.rows: family digest does not match definitions`);
  }
}

export function publicContractCatalogDigest(
  catalog: PublicContractCatalog
): `sha256:${string}` {
  const { catalogDigest, ...basis } = catalog;
  void catalogDigest;
  return digestCanonicalIJson(basis);
}

export function publicContractCatalogAddressableContractRefs(
  catalog: PublicContractCatalog
): readonly string[] {
  const refs = catalog.rows.flatMap((row) => {
    if (row.contractKind === "capability") {
      return [];
    }
    const operationContractRefs =
      row.operationContract === null ||
        row.operationContract.kind !== "abg_public_operation_definition_family"
      ? []
      : row.operationContract.definitions.flatMap((definition) =>
          Object.values(definition.schemaCoordinates)
            .flatMap((coordinate) =>
              coordinate === null ? [] : [coordinate.contractId]
            )
        );
    return [row.contractId, ...operationContractRefs];
  });
  return Object.freeze([...new Set(refs)].sort());
}

export function admitPublicContractCatalog(
  input: unknown,
  label = "PublicContractCatalog"
): PublicContractCatalog {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "catalogId",
      "catalogVersion",
      "catalogDigest",
      "catalogSchemaPath",
      "catalogSchemaDigest",
      "profile",
      "rows"
    ],
    label
  );
  const rows = arrayOf(
    requiredField(value, "rows", label),
    `${label}.rows`,
    admitPublicContractRow
  );
  if (rows.length === 0) {
    throw new TypeError(`${label}.rows: expected a non-empty array`);
  }
  const identities = new Set<string>();
  for (const row of rows) {
    const identity = `${row.contractId}@${row.version}`;
    if (identities.has(identity)) {
      throw new TypeError(`${label}.rows: duplicate contract identity ${identity}`);
    }
    identities.add(identity);
  }
  const profile = oneOf(
    requiredField(value, "profile", label),
    ["abg-5-ds1", "abg-5-release", "catalog-product-v1"] as const,
    `${label}.profile`
  );
  if (profile === "catalog-product-v1") {
    if (
      rows.some(
        (row) =>
          row.contractKind === "operation" ||
          row.owningProductId === ABG_PRODUCT_ID ||
          row.contractId.startsWith("abg.operation.")
      )
    ) {
      throw new TypeError(
        `${label}.rows: catalog-product-v1 cannot publish ABG or operation authority`
      );
    }
    const owners = new Set(rows.map((row) => row.owningProductId));
    if (owners.size !== 1) {
      throw new TypeError(`${label}.rows: catalog-product-v1 requires one owning product`);
    }
  } else if (
    rows.some(
      (row) =>
        row.owningProductId !== ABG_PRODUCT_ID ||
        (row.nativeLocator !== null &&
          row.nativeLocator.packageName !== ABG_PACKAGE_NAME)
    )
  ) {
    throw new TypeError(`${label}.rows: ABG profile rows require exact ABG ownership`);
  }
  if (profile === "abg-5-release") {
    assertPublishedOperationFamilyCatalog(rows, label);
  }
  const catalog = Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_public_contract_catalog",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
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
    catalogSchemaPath: relativePath(
      requiredField(value, "catalogSchemaPath", label),
      `${label}.catalogSchemaPath`
    ),
    catalogSchemaDigest: digest(
      requiredField(value, "catalogSchemaDigest", label),
      `${label}.catalogSchemaDigest`
    ),
    profile,
    rows
  });
  if (catalog.catalogDigest !== publicContractCatalogDigest(catalog)) {
    throw new TypeError(`${label}.catalogDigest: canonical catalog projection differs`);
  }
  return catalog;
}

export class ResolvedPublicOperationContract {
  private readonly __resolvedPublicOperationContractBrand: true;

  private constructor(input: {
    readonly catalogId: string;
    readonly catalogVersion: string;
    readonly catalogDigest: PublicContractCatalog["catalogDigest"];
    readonly row: LegacyPublicContractRow;
  }) {
    this.__resolvedPublicOperationContractBrand = true;
    this.catalogId = input.catalogId;
    this.catalogVersion = input.catalogVersion;
    this.catalogDigest = input.catalogDigest;
    this.row = input.row;
    Object.freeze(this);
  }

  public readonly catalogId: string;
  public readonly catalogVersion: string;
  public readonly catalogDigest: PublicContractCatalog["catalogDigest"];
  public readonly row: LegacyPublicContractRow;

  public static isResolved(input: unknown): input is ResolvedPublicOperationContract {
    return (
      input instanceof ResolvedPublicOperationContract &&
      input.__resolvedPublicOperationContractBrand
    );
  }

  public static resolve(
    catalogInput: PublicContractCatalog,
    operationId: PublicOperationId,
    label = "ResolvedPublicOperationContract"
  ): ResolvedPublicOperationContract {
    const catalog = admitPublicContractCatalog(catalogInput, `${label}.catalog`);
    if (catalog.profile === "catalog-product-v1") {
      throw new TypeError(`${label}: operation contracts require an ABG catalog profile`);
    }
    const rows = catalog.rows.filter(
      (row): row is LegacyPublicContractRow =>
        row.contractKind === "operation" &&
        row.operationContract !== null &&
        row.operationContract.kind !== "abg_public_operation_definition_family" &&
        row.operationContract.operationId === operationId
    );
    const row = rows[0];
    if (row === undefined || rows.length !== 1) {
      throw new TypeError(`${label}: operation row is missing or ambiguous`);
    }
    return new ResolvedPublicOperationContract({
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest,
      row
    });
  }
}

export function resolvePublicOperationContract(
  catalogInput: PublicContractCatalog,
  operationId: PublicOperationId,
  label = "ResolvedPublicOperationContract"
): ResolvedPublicOperationContract {
  return ResolvedPublicOperationContract.resolve(catalogInput, operationId, label);
}

function admitAbgRuntimeIdentity(
  input: unknown,
  label: string
): AbgRuntimeIdentity {
  const value = closedObject(
    input,
    ["workerId", "backendId", "buildId", "resolvedRuntimeRef"],
    label
  );
  return Object.freeze({
    workerId: nonEmptyString(requiredField(value, "workerId", label), `${label}.workerId`),
    backendId: nonEmptyString(
      requiredField(value, "backendId", label),
      `${label}.backendId`
    ),
    buildId: nonEmptyString(requiredField(value, "buildId", label), `${label}.buildId`),
    resolvedRuntimeRef: nonEmptyString(
      requiredField(value, "resolvedRuntimeRef", label),
      `${label}.resolvedRuntimeRef`
    )
  });
}

function admitResolvedPolicyIdentity(
  input: unknown,
  label: string
): AbgResolvedPolicyIdentity {
  const value = closedObject(
    input,
    ["resolvedPolicyBundleRef", "defaultRegime", "dispatchRef", "approvalSubjectRef"],
    label
  );
  const defaultRegime = oneOf(
    requiredField(value, "defaultRegime", label),
    ["F_D", "F_P", "F_H"] as const,
    `${label}.defaultRegime`
  );
  const dispatchRef = nullableString(
    requiredField(value, "dispatchRef", label),
    `${label}.dispatchRef`
  );
  const approvalSubjectRef = nullableString(
    requiredField(value, "approvalSubjectRef", label),
    `${label}.approvalSubjectRef`
  );
  if (defaultRegime === "F_P" && dispatchRef === null) {
    throw new TypeError(`${label}.dispatchRef: required for F_P`);
  }
  if (defaultRegime === "F_H" && approvalSubjectRef === null) {
    throw new TypeError(`${label}.approvalSubjectRef: required for F_H`);
  }
  return Object.freeze({
    resolvedPolicyBundleRef: nonEmptyString(
      requiredField(value, "resolvedPolicyBundleRef", label),
      `${label}.resolvedPolicyBundleRef`
    ),
    defaultRegime,
    dispatchRef,
    approvalSubjectRef
  });
}

export function admitAbgRuntimeSystemProfile(
  input: unknown,
  label = "AbgRuntimeSystemProfile"
): AbgRuntimeSystemProfile {
  const value = closedObject(
    input,
    ["kind", "runtimeIdentity", "resolvedPolicy", "standardPluginRefs", "profileDigest"],
    label
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_runtime_system_profile",
      `${label}.kind`
    ),
    runtimeIdentity: admitAbgRuntimeIdentity(
      requiredField(value, "runtimeIdentity", label),
      `${label}.runtimeIdentity`
    ),
    resolvedPolicy: admitResolvedPolicyIdentity(
      requiredField(value, "resolvedPolicy", label),
      `${label}.resolvedPolicy`
    ),
    standardPluginRefs: uniqueStrings(
      requiredField(value, "standardPluginRefs", label),
      `${label}.standardPluginRefs`
    ),
    profileDigest: digest(
      requiredField(value, "profileDigest", label),
      `${label}.profileDigest`
    )
  });
}

export function admitProductToolchainManifest(
  input: unknown,
  label = "ProductToolchainManifest"
): ProductToolchainManifest {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "publisher",
      "productId",
      "packageName",
      "packageVersion",
      "productContentDigest",
      "publicContractCatalogPath",
      "publicContractCatalogDigest",
      "publicContractCatalog",
      "runtimeSystemProfile",
      "productRelativeLocators"
    ],
    label
  );
  const publicContractCatalog = admitPublicContractCatalog(
    requiredField(value, "publicContractCatalog", label),
    `${label}.publicContractCatalog`
  );
  const publicContractCatalogDigest = digest(
    requiredField(value, "publicContractCatalogDigest", label),
    `${label}.publicContractCatalogDigest`
  );
  if (publicContractCatalog.catalogDigest !== publicContractCatalogDigest) {
    throw new TypeError(`${label}: embedded public contract catalog digest mismatch`);
  }
  const profileInput = requiredField(value, "runtimeSystemProfile", label);
  const runtimeSystemProfile =
    profileInput === null
      ? null
      : admitAbgRuntimeSystemProfile(profileInput, `${label}.runtimeSystemProfile`);
  const publisher = nonEmptyString(
    requiredField(value, "publisher", label),
    `${label}.publisher`
  );
  const productId = nonEmptyString(
    requiredField(value, "productId", label),
    `${label}.productId`
  );
  const packageName = nonEmptyString(
    requiredField(value, "packageName", label),
    `${label}.packageName`
  );
  const isAbgProduct = productId === ABG_PRODUCT_ID;
  const isAbgPackage = packageName === ABG_PACKAGE_NAME;
  const isAbgProfile = publicContractCatalog.profile !== "catalog-product-v1";
  if (isAbgProduct !== isAbgPackage) {
    throw new TypeError(`${label}: incoherent ABG product and package identity`);
  }
  if (isAbgProfile) {
    if (!isAbgProduct || runtimeSystemProfile === null) {
      throw new TypeError(`${label}: ABG profile requires exact ABG identity and runtime`);
    }
  } else {
    if (isAbgProduct || runtimeSystemProfile !== null) {
      throw new TypeError(`${label}: catalog-product-v1 cannot publish ABG runtime authority`);
    }
    if (
      publicContractCatalog.rows.some(
        (row) =>
          row.owningProductId !== productId ||
          (row.nativeLocator !== null &&
            row.nativeLocator.packageName !== packageName)
      )
    ) {
      throw new TypeError(`${label}: catalog-product-v1 rows must be publisher-owned`);
    }
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_product_toolchain_manifest",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    publisher,
    productId,
    packageName,
    packageVersion: exactSemVer(
      requiredField(value, "packageVersion", label),
      `${label}.packageVersion`
    ),
    productContentDigest: digest(
      requiredField(value, "productContentDigest", label),
      `${label}.productContentDigest`
    ),
    publicContractCatalogPath: relativePath(
      requiredField(value, "publicContractCatalogPath", label),
      `${label}.publicContractCatalogPath`
    ),
    publicContractCatalogDigest,
    publicContractCatalog,
    runtimeSystemProfile,
    productRelativeLocators: uniqueStrings(
      requiredField(value, "productRelativeLocators", label),
      `${label}.productRelativeLocators`
    ).map((path, index) =>
      relativePath(path, `${label}.productRelativeLocators[${String(index)}]`)
    )
  });
}

export function admitPublicSdkWorkspaceManifest(
  input: unknown,
  label = "WorkspaceManifest"
): WorkspaceManifest {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "workspaceId",
      "root",
      "authorityMode",
      "scaffoldState",
      "bindingRef",
      "configurationRefs",
      "createdAt",
      "actorRef",
      "provenanceRefs"
    ],
    label
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_workspace_manifest",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    root: absolutePath(requiredField(value, "root", label), `${label}.root`),
    authorityMode: authorityMode(
      requiredField(value, "authorityMode", label),
      `${label}.authorityMode`
    ),
    scaffoldState: literal(
      requiredField(value, "scaffoldState", label),
      "none",
      `${label}.scaffoldState`
    ),
    bindingRef: nullableString(
      requiredField(value, "bindingRef", label),
      `${label}.bindingRef`
    ),
    configurationRefs: uniqueStrings(
      requiredField(value, "configurationRefs", label),
      `${label}.configurationRefs`
    ),
    createdAt: utcTimestamp(
      requiredField(value, "createdAt", label),
      `${label}.createdAt`
    ),
    actorRef: nonEmptyString(
      requiredField(value, "actorRef", label),
      `${label}.actorRef`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    )
  });
}

export function admitProductRequirement(
  input: unknown,
  label = "ProductRequirement"
): ProductRequirement {
  const value = closedObject(
    input,
    ["productId", "versionConstraint", "requiredContractRefs", "requiredCapabilityRefs"],
    label
  );
  return Object.freeze({
    productId: nonEmptyString(
      requiredField(value, "productId", label),
      `${label}.productId`
    ),
    versionConstraint: canonicalSemVerRange(
      requiredField(value, "versionConstraint", label),
      `${label}.versionConstraint`
    ),
    requiredContractRefs: uniqueStrings(
      requiredField(value, "requiredContractRefs", label),
      `${label}.requiredContractRefs`
    ),
    requiredCapabilityRefs: uniqueStrings(
      requiredField(value, "requiredCapabilityRefs", label),
      `${label}.requiredCapabilityRefs`
    )
  });
}

export function admitCatalogProductDescriptor(
  input: unknown,
  label = "CatalogProductDescriptor"
): CatalogProductDescriptor {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "descriptorId",
      "descriptorDigest",
      "publisher",
      "productId",
      "packageName",
      "version",
      "distributionArtifactDigest",
      "productContentDigest",
      "contributionManifestId",
      "contributionManifestDigest",
      "dependencies",
      "abgCompatibility",
      "contractRefs",
      "capabilityRefs",
      "provenanceRefs"
    ],
    label
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "catalog_product_descriptor",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    descriptorDigest: digest(
      requiredField(value, "descriptorDigest", label),
      `${label}.descriptorDigest`
    ),
    publisher: nonEmptyString(
      requiredField(value, "publisher", label),
      `${label}.publisher`
    ),
    productId: nonEmptyString(
      requiredField(value, "productId", label),
      `${label}.productId`
    ),
    packageName: nonEmptyString(
      requiredField(value, "packageName", label),
      `${label}.packageName`
    ),
    version: exactSemVer(requiredField(value, "version", label), `${label}.version`),
    distributionArtifactDigest: digest(
      requiredField(value, "distributionArtifactDigest", label),
      `${label}.distributionArtifactDigest`
    ),
    productContentDigest: digest(
      requiredField(value, "productContentDigest", label),
      `${label}.productContentDigest`
    ),
    contributionManifestId: nonEmptyString(
      requiredField(value, "contributionManifestId", label),
      `${label}.contributionManifestId`
    ),
    contributionManifestDigest: digest(
      requiredField(value, "contributionManifestDigest", label),
      `${label}.contributionManifestDigest`
    ),
    dependencies: arrayOf(
      requiredField(value, "dependencies", label),
      `${label}.dependencies`,
      admitProductRequirement
    ),
    abgCompatibility: canonicalSemVerRange(
      requiredField(value, "abgCompatibility", label),
      `${label}.abgCompatibility`
    ),
    contractRefs: uniqueStrings(
      requiredField(value, "contractRefs", label),
      `${label}.contractRefs`
    ),
    capabilityRefs: uniqueStrings(
      requiredField(value, "capabilityRefs", label),
      `${label}.capabilityRefs`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    )
  });
}

function admitModuleDeclarationLocator(
  input: unknown,
  label: string
): ModuleDeclarationLocator {
  const value = closedObject(
    input,
    ["kind", "modulePath", "moduleDigest", "declarationRef"],
    label
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "module_declaration",
      `${label}.kind`
    ),
    modulePath: relativePath(
      requiredField(value, "modulePath", label),
      `${label}.modulePath`
    ),
    moduleDigest: digest(
      requiredField(value, "moduleDigest", label),
      `${label}.moduleDigest`
    ),
    declarationRef: nonEmptyString(
      requiredField(value, "declarationRef", label),
      `${label}.declarationRef`
    )
  });
}

function admitOpaqueOverlayAssetLocator(
  input: unknown,
  label: string
): OpaqueOverlayAssetLocator {
  const value = closedObject(
    input,
    ["kind", "assetPath", "schemaId", "schemaVersion", "schemaDigest", "assetDigest"],
    label
  );
  const schemaId = literal(
    requiredField(value, "schemaId", label),
    "abg.schema.catalog-overlay-declaration",
    `${label}.schemaId`
  );
  const schemaVersion = literal(
    requiredField(value, "schemaVersion", label),
    "1.0.0",
    `${label}.schemaVersion`
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "opaque_overlay_asset",
      `${label}.kind`
    ),
    assetPath: relativePath(
      requiredField(value, "assetPath", label),
      `${label}.assetPath`
    ),
    schemaId,
    schemaVersion,
    schemaDigest: digest(
      requiredField(value, "schemaDigest", label),
      `${label}.schemaDigest`
    ),
    assetDigest: digest(
      requiredField(value, "assetDigest", label),
      `${label}.assetDigest`
    )
  });
}

function admitCatalogDeclarationLocator(
  input: unknown,
  label: string
): CatalogDeclarationLocator {
  const value = closedObject(
    input,
    [
      "kind",
      "modulePath",
      "moduleDigest",
      "declarationRef",
      "assetPath",
      "schemaId",
      "schemaVersion",
      "schemaDigest",
      "assetDigest"
    ],
    label
  );
  const kind = nonEmptyString(requiredField(value, "kind", label), `${label}.kind`);
  if (kind === "module_declaration") {
    return admitModuleDeclarationLocator(input, label);
  }
  if (kind === "opaque_overlay_asset") {
    return admitOpaqueOverlayAssetLocator(input, label);
  }
  throw new TypeError(`${label}.kind: unsupported declaration locator ${JSON.stringify(kind)}`);
}

function admitCatalogCompatibilityRequirement(
  input: unknown,
  label: string
): CatalogCompatibilityRequirement {
  const value = closedObject(
    input,
    [
      "abgVersionRange",
      "requiredProductRefs",
      "requiredContractRefs",
      "requiredCapabilityRefs"
    ],
    label
  );
  return Object.freeze({
    abgVersionRange: canonicalSemVerRange(
      requiredField(value, "abgVersionRange", label),
      `${label}.abgVersionRange`
    ),
    requiredProductRefs: uniqueStrings(
      requiredField(value, "requiredProductRefs", label),
      `${label}.requiredProductRefs`
    ),
    requiredContractRefs: uniqueStrings(
      requiredField(value, "requiredContractRefs", label),
      `${label}.requiredContractRefs`
    ),
    requiredCapabilityRefs: uniqueStrings(
      requiredField(value, "requiredCapabilityRefs", label),
      `${label}.requiredCapabilityRefs`
    )
  });
}

export function admitCatalogContributionRow(
  input: unknown,
  label = "CatalogContributionRow"
): CatalogContributionRow {
  const value = closedObject(
    input,
    [
      "canonicalHandle",
      "publicKind",
      "ownerProductId",
      "ownerVersion",
      "declarationRef",
      "contractRef",
      "interfaceRef",
      "locator",
      "compatibility",
      "readinessRefs",
      "proofRefs",
      "policyRefs",
      "capabilityRefs",
      "provenanceRefs",
      "refinementOfHandle",
      "overrideOfHandle"
    ],
    label
  );
  const publicKind = publicCatalogKind(
    requiredField(value, "publicKind", label),
    `${label}.publicKind`
  );
  const locator = admitCatalogDeclarationLocator(
    requiredField(value, "locator", label),
    `${label}.locator`
  );
  const declarationRef = nonEmptyString(
    requiredField(value, "declarationRef", label),
    `${label}.declarationRef`
  );
  if (publicKind === "overlay" && locator.kind !== "opaque_overlay_asset") {
    throw new TypeError(`${label}.locator: overlay requires opaque_overlay_asset`);
  }
  if (publicKind !== "overlay" && locator.kind !== "module_declaration") {
    throw new TypeError(`${label}.locator: ${publicKind} requires module_declaration`);
  }
  if (
    locator.kind === "module_declaration" &&
    locator.declarationRef !== declarationRef
  ) {
    throw new TypeError(`${label}.locator.declarationRef: row identity mismatch`);
  }
  const interfaceRef = nullableString(
    requiredField(value, "interfaceRef", label),
    `${label}.interfaceRef`
  );
  if (publicKind === "graph_function" && interfaceRef === null) {
    throw new TypeError(`${label}.interfaceRef: graph_function requires an interface`);
  }
  if (publicKind === "overlay" && interfaceRef !== null) {
    throw new TypeError(`${label}.interfaceRef: overlay cannot claim an interface`);
  }
  return Object.freeze({
    canonicalHandle: nonEmptyString(
      requiredField(value, "canonicalHandle", label),
      `${label}.canonicalHandle`
    ),
    publicKind,
    ownerProductId: nonEmptyString(
      requiredField(value, "ownerProductId", label),
      `${label}.ownerProductId`
    ),
    ownerVersion: exactSemVer(
      requiredField(value, "ownerVersion", label),
      `${label}.ownerVersion`
    ),
    declarationRef,
    contractRef: nonEmptyString(
      requiredField(value, "contractRef", label),
      `${label}.contractRef`
    ),
    interfaceRef,
    locator,
    compatibility: admitCatalogCompatibilityRequirement(
      requiredField(value, "compatibility", label),
      `${label}.compatibility`
    ),
    readinessRefs: uniqueStrings(
      requiredField(value, "readinessRefs", label),
      `${label}.readinessRefs`
    ),
    proofRefs: uniqueStrings(
      requiredField(value, "proofRefs", label),
      `${label}.proofRefs`
    ),
    policyRefs: uniqueStrings(
      requiredField(value, "policyRefs", label),
      `${label}.policyRefs`
    ),
    capabilityRefs: uniqueStrings(
      requiredField(value, "capabilityRefs", label),
      `${label}.capabilityRefs`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    ),
    refinementOfHandle: nullableString(
      requiredField(value, "refinementOfHandle", label),
      `${label}.refinementOfHandle`
    ),
    overrideOfHandle: nullableString(
      requiredField(value, "overrideOfHandle", label),
      `${label}.overrideOfHandle`
    )
  });
}

export function admitCatalogContributionManifest(
  input: unknown,
  label = "CatalogContributionManifest"
): CatalogContributionManifest {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "contributionId",
      "contributionDigest",
      "descriptorId",
      "descriptorDigest",
      "productId",
      "productVersion",
      "artifactDigest",
      "rows"
    ],
    label
  );
  const productId = nonEmptyString(
    requiredField(value, "productId", label),
    `${label}.productId`
  );
  const productVersion = exactSemVer(
    requiredField(value, "productVersion", label),
    `${label}.productVersion`
  );
  const rows = arrayOf(
    requiredField(value, "rows", label),
    `${label}.rows`,
    admitCatalogContributionRow
  );
  const handles = new Set<string>();
  for (const row of rows) {
    if (row.ownerProductId !== productId || row.ownerVersion !== productVersion) {
      throw new TypeError(`${label}.rows: owner identity does not match manifest`);
    }
    if (handles.has(row.canonicalHandle)) {
      throw new TypeError(
        `${label}.rows: duplicate canonical handle ${JSON.stringify(row.canonicalHandle)}`
      );
    }
    handles.add(row.canonicalHandle);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "catalog_contribution_manifest",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    contributionId: nonEmptyString(
      requiredField(value, "contributionId", label),
      `${label}.contributionId`
    ),
    contributionDigest: digest(
      requiredField(value, "contributionDigest", label),
      `${label}.contributionDigest`
    ),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    descriptorDigest: digest(
      requiredField(value, "descriptorDigest", label),
      `${label}.descriptorDigest`
    ),
    productId,
    productVersion,
    artifactDigest: digest(
      requiredField(value, "artifactDigest", label),
      `${label}.artifactDigest`
    ),
    rows
  });
}

function admitResolvedDependencyEdge(
  input: unknown,
  label: string
): ResolvedDependencyEdge {
  const value = closedObject(
    input,
    ["sourceProductId", "targetProductId", "requirement"],
    label
  );
  return Object.freeze({
    sourceProductId: nonEmptyString(
      requiredField(value, "sourceProductId", label),
      `${label}.sourceProductId`
    ),
    targetProductId: nonEmptyString(
      requiredField(value, "targetProductId", label),
      `${label}.targetProductId`
    ),
    requirement: admitProductRequirement(
      requiredField(value, "requirement", label),
      `${label}.requirement`
    )
  });
}

export function admitProductCompatibilityResult(
  input: unknown,
  label = "ProductCompatibilityResult"
): ProductCompatibilityResult {
  const value = closedObject(input, ["productId", "compatible", "reason"], label);
  return Object.freeze({
    productId: nonEmptyString(
      requiredField(value, "productId", label),
      `${label}.productId`
    ),
    compatible: booleanValue(
      requiredField(value, "compatible", label),
      `${label}.compatible`
    ),
    reason: nullableString(requiredField(value, "reason", label), `${label}.reason`)
  });
}

function admitResolvedProductSelection(
  input: unknown,
  label: string
): ResolvedProductSelection {
  const value = closedObject(
    input,
    [
      "publisher",
      "productId",
      "version",
      "descriptorId",
      "descriptorDigest",
      "contributionId",
      "contributionDigest",
      "artifactDigest",
      "productContentDigest"
    ],
    label
  );
  return Object.freeze({
    publisher: nonEmptyString(requiredField(value, "publisher", label), `${label}.publisher`),
    productId: nonEmptyString(requiredField(value, "productId", label), `${label}.productId`),
    version: exactSemVer(requiredField(value, "version", label), `${label}.version`),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    descriptorDigest: digest(
      requiredField(value, "descriptorDigest", label),
      `${label}.descriptorDigest`
    ),
    contributionId: nonEmptyString(
      requiredField(value, "contributionId", label),
      `${label}.contributionId`
    ),
    contributionDigest: digest(
      requiredField(value, "contributionDigest", label),
      `${label}.contributionDigest`
    ),
    artifactDigest: digest(
      requiredField(value, "artifactDigest", label),
      `${label}.artifactDigest`
    ),
    productContentDigest: digest(
      requiredField(value, "productContentDigest", label),
      `${label}.productContentDigest`
    )
  });
}

export function admitResolvedProductLock(
  input: unknown,
  label = "ResolvedProductLock"
): ResolvedProductLock {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "lockId",
      "lockDigest",
      "requirements",
      "products",
      "dependencyEdges",
      "compatibility"
    ],
    label
  );
  const requirements = arrayOf(
    requiredField(value, "requirements", label),
    `${label}.requirements`,
    admitProductRequirement
  );
  const products = arrayOf(
    requiredField(value, "products", label),
    `${label}.products`,
    admitResolvedProductSelection
  );
  if (requirements.length === 0 || products.length === 0) {
    throw new TypeError(`${label}: requirements and products must be non-empty`);
  }
  const productIds = new Set<string>();
  for (const product of products) {
    if (productIds.has(product.productId)) {
      throw new TypeError(`${label}.products: duplicate product ${product.productId}`);
    }
    productIds.add(product.productId);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "resolved_product_lock",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    lockId: nonEmptyString(requiredField(value, "lockId", label), `${label}.lockId`),
    lockDigest: digest(
      requiredField(value, "lockDigest", label),
      `${label}.lockDigest`
    ),
    requirements,
    products,
    dependencyEdges: arrayOf(
      requiredField(value, "dependencyEdges", label),
      `${label}.dependencyEdges`,
      admitResolvedDependencyEdge
    ),
    compatibility: arrayOf(
      requiredField(value, "compatibility", label),
      `${label}.compatibility`,
      admitProductCompatibilityResult
    )
  });
}

export function admitSuppliedProductArtifact(
  input: unknown,
  label = "SuppliedProductArtifact"
): SuppliedProductArtifact {
  const value = closedObject(
    input,
    ["format", "artifactPath", "expectedArtifactDigest", "expectedProductContentDigest"],
    label
  );
  const format: SuppliedProductArtifactFormat = oneOf(
    requiredField(value, "format", label),
    ["abg_product_tar_v1", "npm_package_tgz"] as const,
    `${label}.format`
  );
  return Object.freeze({
    format,
    artifactPath: absolutePath(
      requiredField(value, "artifactPath", label),
      `${label}.artifactPath`
    ),
    expectedArtifactDigest: digest(
      requiredField(value, "expectedArtifactDigest", label),
      `${label}.expectedArtifactDigest`
    ),
    expectedProductContentDigest: digest(
      requiredField(value, "expectedProductContentDigest", label),
      `${label}.expectedProductContentDigest`
    )
  });
}

function admitProductVerificationCheck(
  input: unknown,
  label: string
): ProductVerificationCheck {
  const value = closedObject(input, ["field", "accepted", "expected", "actual"], label);
  return Object.freeze({
    field: nonEmptyString(requiredField(value, "field", label), `${label}.field`),
    accepted: booleanValue(
      requiredField(value, "accepted", label),
      `${label}.accepted`
    ),
    expected: nonEmptyString(
      requiredField(value, "expected", label),
      `${label}.expected`
    ),
    actual: nonEmptyString(requiredField(value, "actual", label), `${label}.actual`)
  });
}

function admitProductContentInventoryRow(
  input: unknown,
  label: string
): ProductContentInventoryRow {
  const value = closedObject(input, ["relativePath", "digest"], label);
  const admittedPath = relativePath(
    requiredField(value, "relativePath", label),
    `${label}.relativePath`
  );
  if (admittedPath === "product-toolchain-manifest.json") {
    throw new TypeError(`${label}.relativePath: product manifest is outside content basis`);
  }
  return Object.freeze({
    relativePath: admittedPath,
    digest: digest(requiredField(value, "digest", label), `${label}.digest`)
  });
}

export function admitVerifiedProductArtifact(
  input: unknown,
  label = "VerifiedProductArtifact"
): VerifiedProductArtifact {
  const value = closedObject(
    input,
    [
      "kind",
      "artifact",
      "descriptor",
      "contributionManifest",
      "productManifest",
      "resolvedLock",
      "productContentInventory",
      "verificationChecks",
      "verifiedAt"
    ],
    label
  );
  const artifact = admitSuppliedProductArtifact(
    requiredField(value, "artifact", label),
    `${label}.artifact`
  );
  const descriptor = admitCatalogProductDescriptor(
    requiredField(value, "descriptor", label),
    `${label}.descriptor`
  );
  const contributionManifest = admitCatalogContributionManifest(
    requiredField(value, "contributionManifest", label),
    `${label}.contributionManifest`
  );
  const productManifest = admitProductToolchainManifest(
    requiredField(value, "productManifest", label),
    `${label}.productManifest`
  );
  const resolvedLock = admitResolvedProductLock(
    requiredField(value, "resolvedLock", label),
    `${label}.resolvedLock`
  );
  const productContentInventory = [
    ...arrayOf(
      requiredField(value, "productContentInventory", label),
      `${label}.productContentInventory`,
      admitProductContentInventoryRow
    )
  ].sort((left, right) =>
    left.relativePath < right.relativePath
      ? -1
      : left.relativePath > right.relativePath
        ? 1
        : 0
  );
  if (productContentInventory.length === 0) {
    throw new TypeError(`${label}.productContentInventory: expected a non-empty array`);
  }
  const inventoryPaths = new Set<string>();
  for (const row of productContentInventory) {
    if (inventoryPaths.has(row.relativePath)) {
      throw new TypeError(
        `${label}.productContentInventory: duplicate path ${row.relativePath}`
      );
    }
    inventoryPaths.add(row.relativePath);
  }
  if (
    productManifest.productRelativeLocators.some(
      (locator) => !inventoryPaths.has(locator)
    )
  ) {
    throw new TypeError(`${label}.productContentInventory: required locator absent`);
  }
  const inventoryDigest = digestCanonicalIJson(
    productContentInventory.map((row) => [row.relativePath, row.digest])
  );
  const verificationChecks = arrayOf(
    requiredField(value, "verificationChecks", label),
    `${label}.verificationChecks`,
    admitProductVerificationCheck
  );
  if (verificationChecks.length === 0 || verificationChecks.some((check) => !check.accepted)) {
    throw new TypeError(`${label}.verificationChecks: every required check must pass`);
  }
  if (
    artifact.expectedArtifactDigest !== descriptor.distributionArtifactDigest ||
    artifact.expectedProductContentDigest !== descriptor.productContentDigest ||
    descriptor.contributionManifestId !== contributionManifest.contributionId ||
    descriptor.contributionManifestDigest !== contributionManifest.contributionDigest ||
    descriptor.productId !== contributionManifest.productId ||
    descriptor.version !== contributionManifest.productVersion ||
    descriptor.productId !== productManifest.productId ||
    descriptor.version !== productManifest.packageVersion ||
    descriptor.productContentDigest !== productManifest.productContentDigest ||
    descriptor.productContentDigest !== inventoryDigest ||
    !resolvedLock.products.some(
      (selection) =>
        selection.productId === descriptor.productId &&
        selection.version === descriptor.version &&
        selection.descriptorId === descriptor.descriptorId &&
        selection.descriptorDigest === descriptor.descriptorDigest &&
        selection.contributionId === contributionManifest.contributionId &&
        selection.contributionDigest === contributionManifest.contributionDigest &&
        selection.artifactDigest === artifact.expectedArtifactDigest &&
        selection.productContentDigest === artifact.expectedProductContentDigest
    )
  ) {
    throw new TypeError(`${label}: artifact, descriptor, contribution, or manifest identity mismatch`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "verified_product_artifact",
      `${label}.kind`
    ),
    artifact,
    descriptor,
    contributionManifest,
    productManifest,
    resolvedLock,
    productContentInventory: Object.freeze(productContentInventory),
    verificationChecks,
    verifiedAt: utcTimestamp(
      requiredField(value, "verifiedAt", label),
      `${label}.verifiedAt`
    )
  });
}

export function admitInstalledProductRecord(
  input: unknown,
  label = "InstalledProductRecord"
): InstalledProductRecord {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "installedProductId",
      "publisher",
      "productId",
      "packageName",
      "version",
      "artifactDigest",
      "productContentDigest",
      "installedRoot",
      "productRoot",
      "packageRoot",
      "manifestPath",
      "manifestDigest",
      "descriptorId",
      "descriptorDigest",
      "contributionId",
      "contributionDigest",
      "compatibilityRange",
      "compatibility",
      "commandRefs",
      "publicContractCatalogId",
      "publicContractCatalogVersion",
      "publicContractCatalogDigest",
      "descriptorRecordPath",
      "contributionRecordPath",
      "lockRecordPath",
      "provenanceRefs"
    ],
    label
  );
  const productId = nonEmptyString(
    requiredField(value, "productId", label),
    `${label}.productId`
  );
  const compatibility = admitProductCompatibilityResult(
    requiredField(value, "compatibility", label),
    `${label}.compatibility`
  );
  if (compatibility.productId !== productId) {
    throw new TypeError(`${label}.compatibility.productId: product mismatch`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "installed_product_record",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    installedProductId: nonEmptyString(
      requiredField(value, "installedProductId", label),
      `${label}.installedProductId`
    ),
    publisher: nonEmptyString(requiredField(value, "publisher", label), `${label}.publisher`),
    productId,
    packageName: nonEmptyString(
      requiredField(value, "packageName", label),
      `${label}.packageName`
    ),
    version: exactSemVer(requiredField(value, "version", label), `${label}.version`),
    artifactDigest: digest(
      requiredField(value, "artifactDigest", label),
      `${label}.artifactDigest`
    ),
    productContentDigest: digest(
      requiredField(value, "productContentDigest", label),
      `${label}.productContentDigest`
    ),
    installedRoot: absolutePath(
      requiredField(value, "installedRoot", label),
      `${label}.installedRoot`
    ),
    productRoot: absolutePath(
      requiredField(value, "productRoot", label),
      `${label}.productRoot`
    ),
    packageRoot: absolutePath(
      requiredField(value, "packageRoot", label),
      `${label}.packageRoot`
    ),
    manifestPath: absolutePath(
      requiredField(value, "manifestPath", label),
      `${label}.manifestPath`
    ),
    manifestDigest: digest(
      requiredField(value, "manifestDigest", label),
      `${label}.manifestDigest`
    ),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    descriptorDigest: digest(
      requiredField(value, "descriptorDigest", label),
      `${label}.descriptorDigest`
    ),
    contributionId: nonEmptyString(
      requiredField(value, "contributionId", label),
      `${label}.contributionId`
    ),
    contributionDigest: digest(
      requiredField(value, "contributionDigest", label),
      `${label}.contributionDigest`
    ),
    compatibilityRange: canonicalSemVerRange(
      requiredField(value, "compatibilityRange", label),
      `${label}.compatibilityRange`
    ),
    compatibility,
    commandRefs: uniqueStrings(
      requiredField(value, "commandRefs", label),
      `${label}.commandRefs`
    ),
    publicContractCatalogId: nonEmptyString(
      requiredField(value, "publicContractCatalogId", label),
      `${label}.publicContractCatalogId`
    ),
    publicContractCatalogVersion: exactSemVer(
      requiredField(value, "publicContractCatalogVersion", label),
      `${label}.publicContractCatalogVersion`
    ),
    publicContractCatalogDigest: digest(
      requiredField(value, "publicContractCatalogDigest", label),
      `${label}.publicContractCatalogDigest`
    ),
    descriptorRecordPath: absolutePath(
      requiredField(value, "descriptorRecordPath", label),
      `${label}.descriptorRecordPath`
    ),
    contributionRecordPath: absolutePath(
      requiredField(value, "contributionRecordPath", label),
      `${label}.contributionRecordPath`
    ),
    lockRecordPath: absolutePath(
      requiredField(value, "lockRecordPath", label),
      `${label}.lockRecordPath`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    )
  });
}

export function admitProductVerificationRecord(
  input: unknown,
  label = "ProductVerificationRecord"
): ProductVerificationRecord {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "disposition",
      "verifiedArtifact",
      "installedProductRecord"
    ],
    label
  );
  const verifiedArtifact = admitVerifiedProductArtifact(
    requiredField(value, "verifiedArtifact", label),
    `${label}.verifiedArtifact`
  );
  const installedProductRecord = admitInstalledProductRecord(
    requiredField(value, "installedProductRecord", label),
    `${label}.installedProductRecord`
  );
  if (
    installedProductRecord.publisher !== verifiedArtifact.descriptor.publisher ||
    installedProductRecord.productId !== verifiedArtifact.descriptor.productId ||
    installedProductRecord.packageName !== verifiedArtifact.descriptor.packageName ||
    installedProductRecord.version !== verifiedArtifact.descriptor.version ||
    installedProductRecord.artifactDigest !==
      verifiedArtifact.artifact.expectedArtifactDigest ||
    installedProductRecord.productContentDigest !==
      verifiedArtifact.artifact.expectedProductContentDigest ||
    installedProductRecord.descriptorId !== verifiedArtifact.descriptor.descriptorId ||
    installedProductRecord.descriptorDigest !==
      verifiedArtifact.descriptor.descriptorDigest ||
    installedProductRecord.contributionId !==
      verifiedArtifact.contributionManifest.contributionId ||
    installedProductRecord.contributionDigest !==
      verifiedArtifact.contributionManifest.contributionDigest ||
    installedProductRecord.manifestDigest !==
      digestCanonicalIJson(verifiedArtifact.productManifest) ||
    installedProductRecord.publicContractCatalogId !==
      verifiedArtifact.productManifest.publicContractCatalog.catalogId ||
    installedProductRecord.publicContractCatalogVersion !==
      verifiedArtifact.productManifest.publicContractCatalog.catalogVersion ||
    installedProductRecord.publicContractCatalogDigest !==
      verifiedArtifact.productManifest.publicContractCatalog.catalogDigest
  ) {
    throw new TypeError(`${label}: verified artifact and installed record mismatch`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "product_verification_record",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      1,
      `${label}.schemaVersion`
    ),
    disposition: literal(
      requiredField(value, "disposition", label),
      "verified",
      `${label}.disposition`
    ),
    verifiedArtifact,
    installedProductRecord
  });
}

export function admitToolchainMutableStateRootsV3(
  input: unknown,
  label = "ToolchainMutableStateRootsV3"
): ToolchainMutableStateRootsV3 {
  const value = closedObject(
    input,
    [
      "observedWorkspaceRoot",
      "observerStateRoot",
      "executorStateRoot",
      "eventRoot",
      "eventLogPath",
      "runtimeRoot",
      "projectionRoot",
      "archiveRoot"
    ],
    label
  );
  return Object.freeze({
    observedWorkspaceRoot: absolutePath(
      requiredField(value, "observedWorkspaceRoot", label),
      `${label}.observedWorkspaceRoot`
    ),
    observerStateRoot: absolutePath(
      requiredField(value, "observerStateRoot", label),
      `${label}.observerStateRoot`
    ),
    executorStateRoot: absolutePath(
      requiredField(value, "executorStateRoot", label),
      `${label}.executorStateRoot`
    ),
    eventRoot: absolutePath(requiredField(value, "eventRoot", label), `${label}.eventRoot`),
    eventLogPath: absolutePath(
      requiredField(value, "eventLogPath", label),
      `${label}.eventLogPath`
    ),
    runtimeRoot: absolutePath(
      requiredField(value, "runtimeRoot", label),
      `${label}.runtimeRoot`
    ),
    projectionRoot: absolutePath(
      requiredField(value, "projectionRoot", label),
      `${label}.projectionRoot`
    ),
    archiveRoot: absolutePath(
      requiredField(value, "archiveRoot", label),
      `${label}.archiveRoot`
    )
  });
}

export function admitToolchainProductBindingV3(
  input: unknown,
  label = "ToolchainProductBindingV3"
): ToolchainProductBindingV3 {
  const value = closedObject(
    input,
    [
      "installedProductId",
      "publisher",
      "productId",
      "packageName",
      "version",
      "productContentDigest",
      "descriptorId",
      "descriptorDigest",
      "contributionId",
      "contributionDigest",
      "artifactDigest",
      "installedRoot",
      "productRoot",
      "packageRoot",
      "manifestPath",
      "manifestDigest",
      "compatibilityRange",
      "compatibility",
      "commandRefs",
      "publicContractCatalogId",
      "publicContractCatalogVersion",
      "publicContractCatalogDigest"
    ],
    label
  );
  const productId = nonEmptyString(
    requiredField(value, "productId", label),
    `${label}.productId`
  );
  const compatibility = admitProductCompatibilityResult(
    requiredField(value, "compatibility", label),
    `${label}.compatibility`
  );
  if (compatibility.productId !== productId) {
    throw new TypeError(`${label}.compatibility.productId: product mismatch`);
  }
  return Object.freeze({
    installedProductId: nonEmptyString(
      requiredField(value, "installedProductId", label),
      `${label}.installedProductId`
    ),
    publisher: nonEmptyString(requiredField(value, "publisher", label), `${label}.publisher`),
    productId,
    packageName: nonEmptyString(
      requiredField(value, "packageName", label),
      `${label}.packageName`
    ),
    version: exactSemVer(requiredField(value, "version", label), `${label}.version`),
    productContentDigest: digest(
      requiredField(value, "productContentDigest", label),
      `${label}.productContentDigest`
    ),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    descriptorDigest: digest(
      requiredField(value, "descriptorDigest", label),
      `${label}.descriptorDigest`
    ),
    contributionId: nonEmptyString(
      requiredField(value, "contributionId", label),
      `${label}.contributionId`
    ),
    contributionDigest: digest(
      requiredField(value, "contributionDigest", label),
      `${label}.contributionDigest`
    ),
    artifactDigest: digest(
      requiredField(value, "artifactDigest", label),
      `${label}.artifactDigest`
    ),
    installedRoot: absolutePath(
      requiredField(value, "installedRoot", label),
      `${label}.installedRoot`
    ),
    productRoot: absolutePath(
      requiredField(value, "productRoot", label),
      `${label}.productRoot`
    ),
    packageRoot: absolutePath(
      requiredField(value, "packageRoot", label),
      `${label}.packageRoot`
    ),
    manifestPath: absolutePath(
      requiredField(value, "manifestPath", label),
      `${label}.manifestPath`
    ),
    manifestDigest: digest(
      requiredField(value, "manifestDigest", label),
      `${label}.manifestDigest`
    ),
    compatibilityRange: canonicalSemVerRange(
      requiredField(value, "compatibilityRange", label),
      `${label}.compatibilityRange`
    ),
    compatibility,
    commandRefs: uniqueStrings(
      requiredField(value, "commandRefs", label),
      `${label}.commandRefs`
    ),
    publicContractCatalogId: nonEmptyString(
      requiredField(value, "publicContractCatalogId", label),
      `${label}.publicContractCatalogId`
    ),
    publicContractCatalogVersion: exactSemVer(
      requiredField(value, "publicContractCatalogVersion", label),
      `${label}.publicContractCatalogVersion`
    ),
    publicContractCatalogDigest: digest(
      requiredField(value, "publicContractCatalogDigest", label),
      `${label}.publicContractCatalogDigest`
    )
  });
}

export function admitToolchainWorkspaceBindingV3(
  input: unknown,
  label = "ToolchainWorkspaceBindingV3"
): ToolchainWorkspaceBindingV3 {
  const value = closedObject(
    input,
    [
      "kind",
      "schemaVersion",
      "bindingId",
      "bindingDigest",
      "workspaceId",
      "workspaceManifestDigest",
      "targetRoot",
      "toolchainRoot",
      "resolvedLockId",
      "resolvedLockDigest",
      "productSetDigest",
      "productBindingRefs",
      "products",
      "mutableStateRoots",
      "provenanceRefs"
    ],
    label
  );
  const products = arrayOf(
    requiredField(value, "products", label),
    `${label}.products`,
    admitToolchainProductBindingV3
  );
  const productBindingRefs = uniqueStrings(
    requiredField(value, "productBindingRefs", label),
    `${label}.productBindingRefs`,
    false
  );
  if (products.length === 0 || productBindingRefs.length !== products.length) {
    throw new TypeError(`${label}: product refs and products must be non-empty and aligned`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_toolchain_workspace_binding",
      `${label}.kind`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      "3",
      `${label}.schemaVersion`
    ),
    bindingId: nonEmptyString(
      requiredField(value, "bindingId", label),
      `${label}.bindingId`
    ),
    bindingDigest: digest(
      requiredField(value, "bindingDigest", label),
      `${label}.bindingDigest`
    ),
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    workspaceManifestDigest: digest(
      requiredField(value, "workspaceManifestDigest", label),
      `${label}.workspaceManifestDigest`
    ),
    targetRoot: absolutePath(
      requiredField(value, "targetRoot", label),
      `${label}.targetRoot`
    ),
    toolchainRoot: absolutePath(
      requiredField(value, "toolchainRoot", label),
      `${label}.toolchainRoot`
    ),
    resolvedLockId: nonEmptyString(
      requiredField(value, "resolvedLockId", label),
      `${label}.resolvedLockId`
    ),
    resolvedLockDigest: digest(
      requiredField(value, "resolvedLockDigest", label),
      `${label}.resolvedLockDigest`
    ),
    productSetDigest: digest(
      requiredField(value, "productSetDigest", label),
      `${label}.productSetDigest`
    ),
    productBindingRefs,
    products,
    mutableStateRoots: admitToolchainMutableStateRootsV3(
      requiredField(value, "mutableStateRoots", label),
      `${label}.mutableStateRoots`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    )
  });
}

export function admitPublicCatalogRow(
  input: unknown,
  label = "PublicCatalogRow"
): PublicCatalogRow {
  const value = closedObject(
    input,
    [
      "canonicalHandle",
      "runtimeEntryRef",
      "kind",
      "ownerProductId",
      "ownerVersion",
      "descriptorId",
      "contributionId",
      "artifactDigest",
      "resolvedLockId",
      "compatible",
      "ready",
      "readinessBlockers",
      "eligible",
      "callable",
      "sessionVisible",
      "contractRef",
      "schemaRefs",
      "provenanceRefs"
    ],
    label
  );
  const kind = publicCatalogKind(requiredField(value, "kind", label), `${label}.kind`);
  const callable = booleanValue(
    requiredField(value, "callable", label),
    `${label}.callable`
  );
  const compatible = booleanValue(
    requiredField(value, "compatible", label),
    `${label}.compatible`
  );
  const ready = booleanValue(requiredField(value, "ready", label), `${label}.ready`);
  const eligible = booleanValue(
    requiredField(value, "eligible", label),
    `${label}.eligible`
  );
  const sessionVisible = booleanValue(
    requiredField(value, "sessionVisible", label),
    `${label}.sessionVisible`
  );
  const readinessBlockers = uniqueStrings(
    requiredField(value, "readinessBlockers", label),
    `${label}.readinessBlockers`
  );
  if (ready === (readinessBlockers.length > 0)) {
    throw new TypeError(`${label}: readiness and blockers are incoherent`);
  }
  if (ready && !compatible) {
    throw new TypeError(`${label}.ready: requires compatibility`);
  }
  if (sessionVisible && !ready) {
    throw new TypeError(`${label}.sessionVisible: requires readiness`);
  }
  if (eligible && !sessionVisible) {
    throw new TypeError(`${label}.eligible: requires session visibility`);
  }
  if (callable && kind !== "graph_function") {
    throw new TypeError(`${label}.callable: only graph_function may be callable`);
  }
  if (callable && (!compatible || !ready || !eligible)) {
    throw new TypeError(`${label}.callable: callable rows must be compatible, ready, and eligible`);
  }
  return Object.freeze({
    canonicalHandle: nonEmptyString(
      requiredField(value, "canonicalHandle", label),
      `${label}.canonicalHandle`
    ),
    runtimeEntryRef: nonEmptyString(
      requiredField(value, "runtimeEntryRef", label),
      `${label}.runtimeEntryRef`
    ),
    kind,
    ownerProductId: nonEmptyString(
      requiredField(value, "ownerProductId", label),
      `${label}.ownerProductId`
    ),
    ownerVersion: exactSemVer(
      requiredField(value, "ownerVersion", label),
      `${label}.ownerVersion`
    ),
    descriptorId: nonEmptyString(
      requiredField(value, "descriptorId", label),
      `${label}.descriptorId`
    ),
    contributionId: nonEmptyString(
      requiredField(value, "contributionId", label),
      `${label}.contributionId`
    ),
    artifactDigest: digest(
      requiredField(value, "artifactDigest", label),
      `${label}.artifactDigest`
    ),
    resolvedLockId: nonEmptyString(
      requiredField(value, "resolvedLockId", label),
      `${label}.resolvedLockId`
    ),
    compatible,
    ready,
    readinessBlockers,
    eligible,
    callable,
    sessionVisible,
    contractRef: nonEmptyString(
      requiredField(value, "contractRef", label),
      `${label}.contractRef`
    ),
    schemaRefs: uniqueStrings(
      requiredField(value, "schemaRefs", label),
      `${label}.schemaRefs`
    ),
    provenanceRefs: uniqueStrings(
      requiredField(value, "provenanceRefs", label),
      `${label}.provenanceRefs`
    )
  });
}

export function admitPublicCatalogDescription(
  input: unknown,
  label = "PublicCatalogDescription"
): PublicCatalogDescription {
  const value = closedObject(
    input,
    [
      "canonicalHandle",
      "runtimeEntryRef",
      "kind",
      "ownerProductId",
      "ownerVersion",
      "descriptorId",
      "contributionId",
      "artifactDigest",
      "resolvedLockId",
      "compatible",
      "ready",
      "readinessBlockers",
      "eligible",
      "callable",
      "sessionVisible",
      "contractRef",
      "schemaRefs",
      "provenanceRefs",
      "declarationRef",
      "interfaceRef",
      "dependencyRefs",
      "policyRefs",
      "capabilityRefs",
      "proofRefs"
    ],
    label
  );
  const row = admitPublicCatalogRow(
    {
      canonicalHandle: value["canonicalHandle"],
      runtimeEntryRef: value["runtimeEntryRef"],
      kind: value["kind"],
      ownerProductId: value["ownerProductId"],
      ownerVersion: value["ownerVersion"],
      descriptorId: value["descriptorId"],
      contributionId: value["contributionId"],
      artifactDigest: value["artifactDigest"],
      resolvedLockId: value["resolvedLockId"],
      compatible: value["compatible"],
      ready: value["ready"],
      readinessBlockers: value["readinessBlockers"],
      eligible: value["eligible"],
      callable: value["callable"],
      sessionVisible: value["sessionVisible"],
      contractRef: value["contractRef"],
      schemaRefs: value["schemaRefs"],
      provenanceRefs: value["provenanceRefs"]
    },
    label
  );
  return Object.freeze({
    ...row,
    declarationRef: nonEmptyString(
      requiredField(value, "declarationRef", label),
      `${label}.declarationRef`
    ),
    interfaceRef: nullableString(
      requiredField(value, "interfaceRef", label),
      `${label}.interfaceRef`
    ),
    dependencyRefs: uniqueStrings(
      requiredField(value, "dependencyRefs", label),
      `${label}.dependencyRefs`
    ),
    policyRefs: uniqueStrings(
      requiredField(value, "policyRefs", label),
      `${label}.policyRefs`
    ),
    capabilityRefs: uniqueStrings(
      requiredField(value, "capabilityRefs", label),
      `${label}.capabilityRefs`
    ),
    proofRefs: uniqueStrings(
      requiredField(value, "proofRefs", label),
      `${label}.proofRefs`
    )
  });
}

export function admitPublicSessionCatalogView(
  input: unknown,
  label = "PublicSessionCatalogView"
): PublicSessionCatalogView {
  const value = closedObject(
    input,
    [
      "kind",
      "workspaceId",
      "catalogId",
      "catalogVersion",
      "catalogDigest",
      "runtimeCatalogProjectionRef",
      "effectiveSessionViewId",
      "allowedHandles",
      "allowedEntryRefs",
      "rows"
    ],
    label
  );
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
  const rows = arrayOf(
    requiredField(value, "rows", label),
    `${label}.rows`,
    admitPublicCatalogRow
  );
  const allowed = new Set(allowedHandles);
  const allowedEntries = new Set(allowedEntryRefs);
  const rowHandles = new Set<string>();
  const rowEntryRefs = new Set<string>();
  for (const row of rows) {
    if (rowHandles.has(row.canonicalHandle)) {
      throw new TypeError(`${label}.rows: duplicate canonical handle ${row.canonicalHandle}`);
    }
    rowHandles.add(row.canonicalHandle);
    if (rowEntryRefs.has(row.runtimeEntryRef)) {
      throw new TypeError(`${label}.rows: duplicate runtime entry ${row.runtimeEntryRef}`);
    }
    rowEntryRefs.add(row.runtimeEntryRef);
  }
  if (allowedHandles.some((handle) => !rowHandles.has(handle))) {
    throw new TypeError(`${label}.allowedHandles: handle absent from rows`);
  }
  if (allowedEntryRefs.some((entryRef) => !rowEntryRefs.has(entryRef))) {
    throw new TypeError(`${label}.allowedEntryRefs: entry absent from rows`);
  }
  if (allowedHandles.length !== allowedEntryRefs.length) {
    throw new TypeError(`${label}: public handles and runtime entry refs must align`);
  }
  if (
    rows.some(
      (row) =>
        row.sessionVisible !==
          (allowed.has(row.canonicalHandle) &&
            allowedEntries.has(row.runtimeEntryRef)) ||
        allowed.has(row.canonicalHandle) !==
          allowedEntries.has(row.runtimeEntryRef)
    )
  ) {
    throw new TypeError(`${label}.rows: session handle/ref visibility mismatch`);
  }
  const catalogId = nonEmptyString(
    requiredField(value, "catalogId", label),
    `${label}.catalogId`
  );
  const runtimeCatalogProjectionRef = nonEmptyString(
    requiredField(value, "runtimeCatalogProjectionRef", label),
    `${label}.runtimeCatalogProjectionRef`
  );
  const effectiveSessionViewId = nonEmptyString(
    requiredField(value, "effectiveSessionViewId", label),
    `${label}.effectiveSessionViewId`
  );
  const derivedSessionViewId = deriveRegistrySessionViewRef({
    catalogId,
    catalogProjectionRef: runtimeCatalogProjectionRef,
    allowedEntryRefs
  });
  if (effectiveSessionViewId !== derivedSessionViewId) {
    throw new TypeError(`${label}.effectiveSessionViewId: derived identity mismatch`);
  }
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "public_session_catalog_view",
      `${label}.kind`
    ),
    workspaceId: nonEmptyString(
      requiredField(value, "workspaceId", label),
      `${label}.workspaceId`
    ),
    catalogId,
    catalogVersion: exactSemVer(
      requiredField(value, "catalogVersion", label),
      `${label}.catalogVersion`
    ),
    catalogDigest: digest(
      requiredField(value, "catalogDigest", label),
      `${label}.catalogDigest`
    ),
    runtimeCatalogProjectionRef,
    effectiveSessionViewId,
    allowedHandles,
    allowedEntryRefs,
    rows
  });
}
