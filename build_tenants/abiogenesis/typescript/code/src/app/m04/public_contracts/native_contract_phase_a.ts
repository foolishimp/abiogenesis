// Implements the private T-281 Phase A native-contract proof boundary.

import { isAbsolute, resolve } from "node:path";

import {
  toJsonSchema,
  type JsonSchema,
  type OverrideActionContext,
  type OverrideSchemaContext
} from "@valibot/to-json-schema";
import { valid as validSemVer } from "semver";
import * as v from "valibot";

import {
  admitIJsonValue,
  stableJson,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";

type NativeSchema = v.GenericSchema;

/** @internal */
export type NativeType<S extends NativeSchema> = v.InferOutput<S>;

const SEMANTIC_VERSION_PATTERN =
  /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const NON_EMPTY_TEXT_PATTERN = /^(?=\s*\S)[\s\S]+$/u;
const REF_PATTERN = /^(?=\S+$)[^\u0000-\u0020\u007f]+$/u;
const CONTRACT_ID_PATTERN = /^[a-z][a-z0-9._-]+$/u;
const CAPABILITY_ID_PATTERN = /^[a-z][a-z0-9._-]+@[1-9][0-9]*$/u;
const NATIVE_SYMBOL_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function isAbsoluteNormalizedPosixPath(input: string): boolean {
  return (
    isAbsolute(input) &&
    !input.includes("\\") &&
    resolve(input) === input
  );
}

function isCanonicalSemanticVersion(input: string): boolean {
  return validSemVer(input) === input;
}

function hasCanonicalIJsonHostShape(
  input: unknown,
  ancestors: Set<object>
): boolean {
  if (
    input === null ||
    typeof input === "boolean" ||
    typeof input === "string"
  ) {
    return true;
  }
  if (typeof input === "number") {
    return Number.isFinite(input) && !Object.is(input, -0);
  }
  if (typeof input !== "object") {
    return false;
  }
  if (ancestors.has(input)) {
    return false;
  }
  ancestors.add(input);
  try {
    if (Array.isArray(input)) {
      const lengthDescriptor = Object.getOwnPropertyDescriptor(input, "length");
      if (
        lengthDescriptor === undefined ||
        !("value" in lengthDescriptor) ||
        typeof lengthDescriptor.value !== "number"
      ) {
        return false;
      }
      const keys = Reflect.ownKeys(input);
      if (keys.length !== lengthDescriptor.value + 1) {
        return false;
      }
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
        if (
          descriptor === undefined ||
          !("value" in descriptor) ||
          descriptor.enumerable !== true ||
          !hasCanonicalIJsonHostShape(descriptor.value, ancestors)
        ) {
          return false;
        }
      }
      return keys.every(
        (key) =>
          typeof key === "string" &&
          (key === "length" ||
            (/^(?:0|[1-9][0-9]*)$/u.test(key) &&
              Number(key) < lengthDescriptor.value))
      );
    }
    const prototype: unknown = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return false;
    }
    for (const key of Reflect.ownKeys(input)) {
      if (typeof key !== "string") {
        return false;
      }
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true ||
        !hasCanonicalIJsonHostShape(descriptor.value, ancestors)
      ) {
        return false;
      }
    }
    return true;
  } finally {
    ancestors.delete(input);
  }
}

function isCanonicalIJson(input: unknown): boolean {
  if (!hasCanonicalIJsonHostShape(input, new Set<object>())) {
    return false;
  }
  try {
    admitIJsonValue(input);
    return true;
  } catch {
    return false;
  }
}

function identityOf(input: unknown): string | null {
  if (typeof input === "string") {
    return input;
  }
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  for (const field of ["grantRef", "ref", "identity"] as const) {
    const value: unknown = Reflect.get(input, field);
    if (typeof value === "string") {
      return value;
    }
  }
  return null;
}

function hasUniqueIdentity(input: unknown): boolean {
  if (!Array.isArray(input)) {
    return false;
  }
  const identities = input.map(identityOf);
  return (
    identities.every((identity) => identity !== null) &&
    new Set(identities).size === identities.length
  );
}

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const ABSOLUTE_POSIX_PATH_ACTION = v.check(
  isAbsoluteNormalizedPosixPath,
  "expected an absolute normalized POSIX path"
);
const SEMANTIC_VERSION_ACTION = v.check(
  isCanonicalSemanticVersion,
  "expected a canonical semantic version"
);
const CANONICAL_IJSON_ACTION = v.check(
  isCanonicalIJson,
  "expected a canonical I-JSON value"
);
const POSITIVE_INTEGER_ACTION = v.integer("expected an integer");
const SAFE_INTEGER_ACTION = v.safeInteger("expected a safe integer");
const MINIMUM_ONE_ACTION = v.minValue<
  number,
  1,
  "expected a positive integer"
>(1, "expected a positive integer");

function unicodeText(pattern: RegExp) {
  return v.pipe(v.string(), v.regex(pattern));
}

function brandedText<const Name extends v.BrandName>(
  pattern: RegExp,
  name: Name
) {
  return v.pipe(unicodeText(pattern), v.brand(name));
}

/** @internal */
export const nonEmptyTextSchema = unicodeText(NON_EMPTY_TEXT_PATTERN);
/** @internal */
export const refSchema = brandedText(REF_PATTERN, "Ref");
/** @internal */
export const contractIdSchema = brandedText(CONTRACT_ID_PATTERN, "ContractId");
/** @internal */
export const capabilityIdSchema = brandedText(
  CAPABILITY_ID_PATTERN,
  "CapabilityId"
);
/** @internal */
export const sha256DigestSchema = brandedText(SHA256_PATTERN, "Sha256Digest");
/** @internal */
export const semanticVersionSchema = v.pipe(
  v.string(),
  SEMANTIC_VERSION_ACTION,
  v.brand("SemanticVersion")
);
/** @internal */
export const absolutePosixPathSchema = v.pipe(
  v.string(),
  ABSOLUTE_POSIX_PATH_ACTION,
  v.brand("AbsolutePosixPath")
);
/** @internal */
export const safePositiveIntegerSchema = v.pipe(
  v.number(),
  POSITIVE_INTEGER_ACTION,
  SAFE_INTEGER_ACTION,
  MINIMUM_ONE_ACTION
);
/** @internal */
export const canonicalIJsonSchema = v.pipe(
  v.unknown(),
  CANONICAL_IJSON_ACTION
);

/** @internal */
export function uniqueByIdentityArray<const S extends NativeSchema>(schema: S) {
  return v.pipe(
    v.array(schema),
    v.check<
      v.InferOutput<S>[],
      "duplicate or missing stable identity"
    >(
      hasUniqueIdentity,
      "duplicate or missing stable identity"
    )
  );
}

const ALLOWED_SCHEMA_TYPES = new Set([
  "array",
  "boolean",
  "literal",
  "null",
  "nullable",
  "number",
  "picklist",
  "strict_object",
  "string",
  "tuple",
  "union",
  "unknown"
]);

interface AbgJsonSchema extends JsonSchema {
  readonly "x-abg-native-brand"?: string;
  readonly "x-abg-native-regex-flags"?: string;
  readonly "x-abg-native-check"?: string;
}

const IJSON_VALUE_DEFINITION: JsonSchema = {
  anyOf: [
    { type: "null" },
    { type: "boolean" },
    { type: "number" },
    { type: "string" },
    { type: "array", items: { $ref: "#/$defs/IJsonValue" } },
    {
      type: "object",
      additionalProperties: { $ref: "#/$defs/IJsonValue" }
    }
  ]
};

function iJsonProjection(): AbgJsonSchema {
  return {
    $ref: "#/$defs/IJsonValue",
    $defs: { IJsonValue: IJSON_VALUE_DEFINITION },
    "x-abg-native-check": "canonical_ijson"
  };
}

function hoistIJsonDefinition(schema: JsonSchema): JsonSchema {
  const projected = structuredClone(schema);
  let foundCanonicalIJson = false;

  function visit(input: unknown): void {
    if (Array.isArray(input)) {
      for (const value of input) {
        visit(value);
      }
      return;
    }
    if (typeof input !== "object" || input === null) {
      return;
    }
    if (Reflect.get(input, "x-abg-native-check") === "canonical_ijson") {
      const definitions: unknown = Reflect.get(input, "$defs");
      if (
        typeof definitions !== "object" ||
        definitions === null ||
        !stableJsonEquals(
          Reflect.get(definitions, "IJsonValue"),
          IJSON_VALUE_DEFINITION
        )
      ) {
        throw new TypeError(
          "native contract projector: canonical_ijson definition mismatch"
        );
      }
      Reflect.deleteProperty(input, "$defs");
      foundCanonicalIJson = true;
    }
    for (const value of Object.values(input)) {
      visit(value);
    }
  }

  visit(projected);
  if (!foundCanonicalIJson) {
    return projected;
  }
  const currentDefinitions: unknown = Reflect.get(projected, "$defs");
  if (
    currentDefinitions !== undefined &&
    (typeof currentDefinitions !== "object" || currentDefinitions === null)
  ) {
    throw new TypeError("native contract projector: malformed global definitions");
  }
  const existingIJson: unknown =
    currentDefinitions === undefined
      ? undefined
      : Reflect.get(currentDefinitions, "IJsonValue");
  if (
    existingIJson !== undefined &&
    !stableJsonEquals(existingIJson, IJSON_VALUE_DEFINITION)
  ) {
    throw new TypeError(
      "native contract projector: conflicting IJsonValue definition"
    );
  }
  Reflect.set(projected, "$defs", {
    ...(currentDefinitions ?? {}),
    IJsonValue: IJSON_VALUE_DEFINITION
  });
  return projected;
}

function projectSchemaOverride(context: OverrideSchemaContext): undefined {
  if (!ALLOWED_SCHEMA_TYPES.has(context.valibotSchema.type)) {
    throw new TypeError(
      `native contract projector: unsupported schema ${context.valibotSchema.type}`
    );
  }
  if (
    context.valibotSchema.type === "unknown" &&
    context.valibotSchema !== canonicalIJsonSchema.pipe[0]
  ) {
    throw new TypeError(
      "native contract projector: unknown is reserved for canonical_ijson"
    );
  }
  return undefined;
}

function withExtension(
  schema: JsonSchema,
  extension: Pick<
    AbgJsonSchema,
    | "x-abg-native-brand"
    | "x-abg-native-check"
    | "x-abg-native-regex-flags"
  >
): AbgJsonSchema {
  return Object.freeze({ ...schema, ...extension });
}

function projectActionOverride(context: OverrideActionContext): AbgJsonSchema {
  const action = context.valibotAction;
  if (action.type === "brand") {
    const name: unknown = Reflect.get(action, "name");
    if (typeof name !== "string" || name.length === 0) {
      throw new TypeError("native contract projector: invalid type_brand");
    }
    return withExtension(
      context.jsonSchema,
      { "x-abg-native-brand": name }
    );
  }
  if (action.type === "regex") {
    const requirement: unknown = Reflect.get(action, "requirement");
    if (!(requirement instanceof RegExp) || requirement.flags !== "u") {
      throw new TypeError(
        "native contract projector: unicode_regex requires the sole flag u"
      );
    }
    return withExtension(
      context.jsonSchema,
      { "x-abg-native-regex-flags": "u" }
    );
  }
  if (action === ABSOLUTE_POSIX_PATH_ACTION) {
    return withExtension(
      context.jsonSchema,
      { "x-abg-native-check": "absolute_posix_path" }
    );
  }
  if (action === SEMANTIC_VERSION_ACTION) {
    return {
      ...context.jsonSchema,
      pattern: SEMANTIC_VERSION_PATTERN.source,
      "x-abg-native-check": "semantic_version"
    };
  }
  if (action === CANONICAL_IJSON_ACTION) {
    return iJsonProjection();
  }
  if (
    action.type === "check" &&
    Reflect.get(action, "requirement") === hasUniqueIdentity
  ) {
    return {
      ...context.jsonSchema,
      "x-abg-native-check": "unique_by_identity"
    };
  }
  if (
    action === POSITIVE_INTEGER_ACTION ||
    action === SAFE_INTEGER_ACTION
  ) {
    return context.jsonSchema;
  }
  if (action === MINIMUM_ONE_ACTION) {
    return withExtension(
      context.jsonSchema,
      { "x-abg-native-check": "safe_positive_integer" }
    );
  }
  throw new TypeError(
    `native contract projector: unsupported action ${action.type}`
  );
}

function deepFreeze<T>(input: T): T {
  if (typeof input !== "object" || input === null || Object.isFrozen(input)) {
    return input;
  }
  for (const key of Reflect.ownKeys(input)) {
    deepFreeze(Reflect.get(input, key));
  }
  Object.freeze(input);
  return input;
}

/** @internal */
export function projectNativeJsonSchema<S extends NativeSchema>(
  schema: S
): JsonSchema {
  return deepFreeze(
    hoistIJsonDefinition(
      toJsonSchema(schema, {
        target: "draft-2020-12",
        typeMode: "ignore",
        errorMode: "throw",
        overrideSchema: projectSchemaOverride,
        overrideAction: projectActionOverride
      })
    )
  );
}

/** @internal */
export function admitNative<S extends NativeSchema>(
  schema: S,
  input: unknown
): NativeType<S> {
  return deepFreeze(v.parse(schema, input));
}

const nativeLocatorSchema = v.strictObject({
  packageName: unicodeText(REF_PATTERN),
  packageExport: unicodeText(REF_PATTERN),
  symbol: unicodeText(NATIVE_SYMBOL_PATTERN)
});

/** @internal */
export const publicContractCoordinateSchema = v.strictObject({
  contractId: contractIdSchema,
  contractVersion: semanticVersionSchema,
  contractDigest: sha256DigestSchema,
  schemaId: contractIdSchema,
  schemaVersion: semanticVersionSchema,
  schemaDigest: sha256DigestSchema,
  nativeLocator: nativeLocatorSchema
});

/** @internal */
export const publicContractCatalogCoordinateSchema = v.strictObject({
  kind: v.literal("public_contract_catalog_coordinate"),
  catalogId: contractIdSchema,
  catalogVersion: semanticVersionSchema,
  catalogDigest: sha256DigestSchema
});

const publicContractCatalogBasisSchema = v.strictObject({
  kind: v.literal("public_contract_catalog"),
  catalogId: contractIdSchema,
  catalogVersion: semanticVersionSchema,
  rows: v.array(publicContractCoordinateSchema)
});

/** @internal */
export const publicContractCatalogSchema = v.strictObject({
  ...publicContractCatalogBasisSchema.entries,
  catalogDigest: sha256DigestSchema
});

/** @internal */
export type PublicContractCoordinate = v.InferOutput<
  typeof publicContractCoordinateSchema
>;
/** @internal */
export type PublicContractCatalogCoordinate = v.InferOutput<
  typeof publicContractCatalogCoordinateSchema
>;
/** @internal */
export type NativePublicContractCatalogPacket = v.InferOutput<
  typeof publicContractCatalogSchema
>;

/** @internal */
export function admitPublicContractCoordinate(
  input: unknown
): PublicContractCoordinate {
  const coordinate = admitNative(publicContractCoordinateSchema, input);
  if (coordinate.contractDigest !== coordinate.schemaDigest) {
    throw new TypeError("public contract coordinate: asset digest mismatch");
  }
  return coordinate;
}

function contractCoordinateIdentity(row: PublicContractCoordinate): string {
  return `${row.contractId}@${row.contractVersion}`;
}

function assertCatalogRows(
  rows: readonly PublicContractCoordinate[]
): void {
  const identities = rows.map(contractCoordinateIdentity);
  if (new Set(identities).size !== identities.length) {
    throw new TypeError("public contract catalog: duplicate contract identity");
  }
  const canonicalOrder = [...identities].sort(compareCodePoints);
  if (!stableJsonEquals(identities, canonicalOrder)) {
    throw new TypeError("public contract catalog: noncanonical row order");
  }
}

/** @internal */
export function admitPublicContractCatalog(
  input: unknown
): NativePublicContractCatalogPacket {
  const catalog = admitNative(publicContractCatalogSchema, input);
  for (const row of catalog.rows) {
    admitPublicContractCoordinate(row);
  }
  assertCatalogRows(catalog.rows);
  const basis = admitNative(publicContractCatalogBasisSchema, {
    kind: catalog.kind,
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    rows: catalog.rows
  });
  if (catalog.catalogDigest !== stableSha256Digest(basis)) {
    throw new TypeError("public contract catalog: digest mismatch");
  }
  return catalog;
}

/** @internal */
export function constructPublicContractCatalog(input: {
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly rows: readonly unknown[];
}): NativePublicContractCatalogPacket {
  const rows = input.rows
    .map(admitPublicContractCoordinate)
    .sort((left, right) =>
      compareCodePoints(
        contractCoordinateIdentity(left),
        contractCoordinateIdentity(right)
      )
    );
  assertCatalogRows(rows);
  const basis = admitNative(publicContractCatalogBasisSchema, {
    kind: "public_contract_catalog",
    catalogId: input.catalogId,
    catalogVersion: input.catalogVersion,
    rows
  });
  return admitPublicContractCatalog({
    ...basis,
    catalogDigest: stableSha256Digest(basis)
  });
}

/** @internal */
export function publicContractCatalogCoordinate(
  input: unknown
): PublicContractCatalogCoordinate {
  const catalog = admitPublicContractCatalog(input);
  return admitNative(publicContractCatalogCoordinateSchema, {
    kind: "public_contract_catalog_coordinate",
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest
  });
}

/** @internal */
export interface NativeContractDefinition<S extends NativeSchema> {
  readonly nativeSymbol: string;
  readonly schemaCoordinate: PublicContractCoordinate;
  readonly schema: S;
  readonly projectedSchema: JsonSchema;
}

const nativeContractIdentitySchema = v.strictObject({
  contractId: contractIdSchema,
  contractVersion: semanticVersionSchema,
  schemaId: contractIdSchema,
  schemaVersion: semanticVersionSchema,
  nativeLocator: nativeLocatorSchema
});

/** @internal */
export function defineNativeContract<S extends NativeSchema>(input: {
  readonly identity: v.InferInput<typeof nativeContractIdentitySchema>;
  readonly schema: S;
}): NativeContractDefinition<S> {
  const identity = admitNative(nativeContractIdentitySchema, input.identity);
  if (identity.nativeLocator.symbol.length === 0) {
    throw new TypeError("native contract: symbol is required");
  }
  const projectedSchema = deepFreeze({
    ...projectNativeJsonSchema(input.schema),
    $id: identity.schemaId
  });
  if (
    projectedSchema.$schema !==
    "https://json-schema.org/draft/2020-12/schema"
  ) {
    throw new TypeError("native contract: unsupported JSON Schema dialect");
  }
  const schemaDigest = stableSha256Digest(projectedSchema);
  const schemaCoordinate = admitPublicContractCoordinate({
    ...identity,
    contractDigest: schemaDigest,
    schemaDigest
  });
  return deepFreeze({
    nativeSymbol: identity.nativeLocator.symbol,
    schemaCoordinate,
    schema: input.schema,
    projectedSchema
  });
}

const defaultPolicySchema = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({ kind: v.literal("literal"), value: v.unknown() })
]);

/** @internal */
export type NativeDefaultPolicy = v.InferOutput<typeof defaultPolicySchema>;

function rawObject(input: unknown, label: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  return Object.fromEntries(
    Object.keys(input).map((key) => [key, Reflect.get(input, key)])
  );
}

function schemaEntry(
  entries: v.ObjectEntries,
  field: string
): NativeSchema {
  const entry: unknown = Reflect.get(entries, field);
  if (!isNativeSchema(entry)) {
    throw new TypeError(`native defaults.${field}: unknown request field`);
  }
  return entry;
}

function isNativeSchema(input: unknown): input is NativeSchema {
  return (
    typeof input === "object" &&
    input !== null &&
    Reflect.get(input, "kind") === "schema" &&
    typeof Reflect.get(input, "type") === "string" &&
    typeof Reflect.get(input, "reference") === "function" &&
    typeof Reflect.get(input, "~run") === "function"
  );
}

/** @internal */
export function admitStrictRequestWithDefaults<
  const Entries extends v.ObjectEntries,
  const Message extends v.ErrorMessage<v.StrictObjectIssue> | undefined
>(input: {
  readonly schema: v.StrictObjectSchema<Entries, Message>;
  readonly raw: unknown;
  readonly defaults: readonly {
    readonly field: string;
    readonly policy: unknown;
  }[];
}): v.InferOutput<typeof input.schema> {
  const candidate = rawObject(input.raw, "native request");
  const allowed = new Set(Object.keys(input.schema.entries));
  for (const field of Object.keys(candidate)) {
    if (!allowed.has(field)) {
      throw new TypeError(`native request.${field}: unknown field`);
    }
  }
  const defaulted = new Set<string>();
  for (const row of input.defaults) {
    if (defaulted.has(row.field)) {
      throw new TypeError(`native defaults.${row.field}: duplicate row`);
    }
    defaulted.add(row.field);
    const policy = admitNative(defaultPolicySchema, row.policy);
    const fieldSchema = schemaEntry(input.schema.entries, row.field);
    if (Object.hasOwn(candidate, row.field)) {
      admitNative(fieldSchema, candidate[row.field]);
      continue;
    }
    if (policy.kind === "literal") {
      candidate[row.field] = admitNative(fieldSchema, policy.value);
    }
  }
  return admitNative(input.schema, candidate);
}

const capabilityGrantBasisEntries = {
  capabilityId: capabilityIdSchema,
  capabilityDefinitionRef: refSchema,
  capabilityDefinitionDigest: sha256DigestSchema,
  actorRef: refSchema,
  approvalRef: refSchema,
  policyRef: refSchema,
  scopeRef: refSchema,
  scopeDigest: sha256DigestSchema,
  authorityBasisRef: refSchema,
  authorityBasisDigest: sha256DigestSchema
} as const satisfies v.ObjectEntries;

const capabilityGrantBasisSchema = v.strictObject(capabilityGrantBasisEntries);
/** @internal */
export const capabilityGrantCoordinateSchema = v.strictObject({
  kind: v.literal("capability_grant"),
  grantRef: refSchema,
  grantDigest: sha256DigestSchema,
  ...capabilityGrantBasisEntries
});

/** @internal */
export type CapabilityGrantCoordinate = v.InferOutput<
  typeof capabilityGrantCoordinateSchema
>;

/** @internal */
export function constructCapabilityGrant(
  input: v.InferInput<typeof capabilityGrantBasisSchema>
): CapabilityGrantCoordinate {
  const basis = admitNative(capabilityGrantBasisSchema, input);
  const grantDigest = stableSha256Digest(basis);
  return admitCapabilityGrant({
    kind: "capability_grant",
    grantRef: `capability-grant:${grantDigest}`,
    grantDigest,
    ...basis
  });
}

/** @internal */
export function admitCapabilityGrant(input: unknown): CapabilityGrantCoordinate {
  const grant = admitNative(capabilityGrantCoordinateSchema, input);
  const basis = {
    capabilityId: grant.capabilityId,
    capabilityDefinitionRef: grant.capabilityDefinitionRef,
    capabilityDefinitionDigest: grant.capabilityDefinitionDigest,
    actorRef: grant.actorRef,
    approvalRef: grant.approvalRef,
    policyRef: grant.policyRef,
    scopeRef: grant.scopeRef,
    scopeDigest: grant.scopeDigest,
    authorityBasisRef: grant.authorityBasisRef,
    authorityBasisDigest: grant.authorityBasisDigest
  };
  const expectedDigest = stableSha256Digest(basis);
  if (
    grant.grantDigest !== expectedDigest ||
    grant.grantRef !== `capability-grant:${expectedDigest}`
  ) {
    throw new TypeError("capability grant: digest-derived identity mismatch");
  }
  return grant;
}

const forbiddenSlotSchema = v.strictObject({ state: v.literal("forbidden") });
const actorSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_actor"),
    actorRef: refSchema,
    attributionRef: refSchema,
    attributionDigest: sha256DigestSchema
  })
]);
const workspaceSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_workspace"),
    bindingRef: refSchema,
    bindingDigest: sha256DigestSchema
  })
]);
const productSetSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_product_set"),
    productSetRef: refSchema,
    productSetDigest: sha256DigestSchema
  })
]);
const dependencyLockSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_dependency_lock"),
    lockRef: refSchema,
    lockDigest: sha256DigestSchema
  })
]);
const catalogScopeSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_catalog_scope"),
    viewRef: refSchema,
    viewDigest: sha256DigestSchema,
    allowlistRef: refSchema,
    allowlistDigest: sha256DigestSchema
  })
]);
const executionProgramSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_execution_program"),
    admittedGtlProgramRef: refSchema,
    admittedGtlProgramDigest: sha256DigestSchema,
    graphFunctionRef: refSchema,
    graphFunctionDigest: sha256DigestSchema,
    inputContract: publicContractCoordinateSchema,
    inputPayloadRef: refSchema,
    inputPayloadDigest: sha256DigestSchema
  })
]);
const invocationPolicySlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_invocation_policy"),
    policyRef: refSchema,
    policyDigest: sha256DigestSchema,
    sessionPolicyRef: refSchema,
    sessionPolicyDigest: sha256DigestSchema
  })
]);
const transportSteeringSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("declared_transport_steering"),
    steeringRef: refSchema,
    steeringDigest: sha256DigestSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  })
]);

const authorityBasisEntries = {
  authorityBasisRef: refSchema,
  authorityBasisDigest: sha256DigestSchema,
  definitionDigest: sha256DigestSchema,
  contractCatalog: publicContractCatalogCoordinateSchema,
  capabilityGrants: uniqueByIdentityArray(capabilityGrantCoordinateSchema),
  actor: actorSlotSchema,
  workspace: workspaceSlotSchema,
  productSet: productSetSlotSchema,
  dependencyLock: dependencyLockSlotSchema,
  catalogScope: catalogScopeSlotSchema,
  executionProgram: executionProgramSlotSchema,
  invocationPolicy: invocationPolicySlotSchema,
  transportSteering: transportSteeringSlotSchema
} as const satisfies v.ObjectEntries;

function invocationAuthorityBasisSchema<K extends NativeSchema>(keySchema: K) {
  return v.strictObject({
    operationKey: keySchema,
    ...authorityBasisEntries,
    definitionKey: keySchema
  });
}

/** @internal */
export function invocationAuthoritySchema<K extends NativeSchema>(keySchema: K) {
  return v.strictObject({
    kind: v.literal("invocation_authority"),
    operationKey: keySchema,
    authoritySetRef: refSchema,
    authoritySetDigest: sha256DigestSchema,
    ...authorityBasisEntries,
    definitionKey: keySchema
  });
}

/** @internal */
export interface InvocationAuthorityExpectation<K extends string> {
  readonly operationKey: K;
  readonly definitionDigest: string;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requiredGrantCapabilityIds: readonly string[];
  readonly slotStates: {
    readonly actor: "forbidden" | "admitted_actor";
    readonly workspace: "forbidden" | "admitted_workspace";
    readonly productSet: "forbidden" | "admitted_product_set";
    readonly dependencyLock: "forbidden" | "admitted_dependency_lock";
    readonly catalogScope: "forbidden" | "admitted_catalog_scope";
    readonly executionProgram: "forbidden" | "admitted_execution_program";
    readonly invocationPolicy: "forbidden" | "admitted_invocation_policy";
    readonly transportSteering: "forbidden" | "declared_transport_steering";
  };
}

function assertSameValue(left: unknown, right: unknown, label: string): void {
  if (!stableJsonEquals(left, right)) {
    throw new TypeError(`${label}: exact value mismatch`);
  }
}

function assertAuthorityExpectation<K extends string>(input: {
  readonly authority: v.InferOutput<
    ReturnType<typeof invocationAuthoritySchema<v.LiteralSchema<K, undefined>>>
  >;
  readonly expected: InvocationAuthorityExpectation<K>;
}): void {
  const authority = input.authority;
  if (
    authority.operationKey !== input.expected.operationKey ||
    authority.definitionKey !== input.expected.operationKey ||
    authority.definitionDigest !== input.expected.definitionDigest
  ) {
    throw new TypeError("invocation authority: definition mismatch");
  }
  assertSameValue(
    authority.contractCatalog,
    input.expected.contractCatalog,
    "invocation authority catalog"
  );
  for (const slot of Object.keys(input.expected.slotStates)) {
    const actual: unknown = Reflect.get(authority, slot);
    const expectedState: unknown = Reflect.get(input.expected.slotStates, slot);
    if (
      typeof actual !== "object" ||
      actual === null ||
      Reflect.get(actual, "state") !== expectedState
    ) {
      throw new TypeError(`invocation authority.${slot}: state mismatch`);
    }
  }
  const capabilityIds = authority.capabilityGrants.map(
    (grant) => grant.capabilityId
  );
  assertSameValue(
    [...capabilityIds].sort(),
    [...input.expected.requiredGrantCapabilityIds].sort(),
    "invocation authority capabilities"
  );
  const attributedActorRef =
    authority.actor.state === "admitted_actor"
      ? authority.actor.actorRef
      : null;
  for (const grant of authority.capabilityGrants) {
    admitCapabilityGrant(grant);
    if (
      (attributedActorRef !== null && grant.actorRef !== attributedActorRef) ||
      grant.authorityBasisRef !== authority.authorityBasisRef ||
      grant.authorityBasisDigest !== authority.authorityBasisDigest
    ) {
      throw new TypeError("invocation authority: grant basis mismatch");
    }
  }
  const sortedGrantRefs = authority.capabilityGrants
    .map((grant) => grant.grantRef)
    .slice()
    .sort(compareCodePoints);
  assertSameValue(
    authority.capabilityGrants.map((grant) => grant.grantRef),
    sortedGrantRefs,
    "invocation authority grant order"
  );
}

/** @internal */
export function admitInvocationAuthority<const K extends string>(input: {
  readonly operationKey: K;
  readonly raw: unknown;
  readonly expected: InvocationAuthorityExpectation<K>;
}) {
  const keySchema = v.literal(input.operationKey);
  const authority = admitNative(invocationAuthoritySchema(keySchema), input.raw);
  if (authority.executionProgram.state === "admitted_execution_program") {
    admitPublicContractCoordinate(authority.executionProgram.inputContract);
  }
  assertAuthorityExpectation({ authority, expected: input.expected });
  const basis = admitNative(invocationAuthorityBasisSchema(keySchema), {
    operationKey: authority.operationKey,
    authorityBasisRef: authority.authorityBasisRef,
    authorityBasisDigest: authority.authorityBasisDigest,
    definitionDigest: authority.definitionDigest,
    contractCatalog: authority.contractCatalog,
    capabilityGrants: authority.capabilityGrants,
    actor: authority.actor,
    workspace: authority.workspace,
    productSet: authority.productSet,
    dependencyLock: authority.dependencyLock,
    catalogScope: authority.catalogScope,
    executionProgram: authority.executionProgram,
    invocationPolicy: authority.invocationPolicy,
    transportSteering: authority.transportSteering,
    definitionKey: authority.definitionKey
  });
  const expectedDigest = stableSha256Digest(basis);
  if (
    authority.authoritySetDigest !== expectedDigest ||
    authority.authoritySetRef !== `invocation-authority:${expectedDigest}`
  ) {
    throw new TypeError("invocation authority: digest-derived identity mismatch");
  }
  return authority;
}

/** @internal */
export function constructInvocationAuthority<const K extends string>(input: {
  readonly operationKey: K;
  readonly basis: v.InferInput<
    ReturnType<typeof invocationAuthorityBasisSchema<v.LiteralSchema<K, undefined>>>
  >;
  readonly expected: InvocationAuthorityExpectation<K>;
}) {
  const keySchema = v.literal(input.operationKey);
  const parsed = admitNative(invocationAuthorityBasisSchema(keySchema), input.basis);
  const sortedGrants = Object.freeze(
    [...parsed.capabilityGrants]
      .map(admitCapabilityGrant)
      .sort((left, right) => compareCodePoints(left.grantRef, right.grantRef))
  );
  const basis = admitNative(invocationAuthorityBasisSchema(keySchema), {
    ...parsed,
    capabilityGrants: sortedGrants
  });
  const authoritySetDigest = stableSha256Digest(basis);
  return admitInvocationAuthority({
    operationKey: input.operationKey,
    expected: input.expected,
    raw: {
      kind: "invocation_authority",
      authoritySetRef: `invocation-authority:${authoritySetDigest}`,
      authoritySetDigest,
      ...basis
    }
  });
}

function publicInvocationBasisSchema<
  K extends NativeSchema,
  Request extends NativeSchema
>(keySchema: K, requestSchema: Request) {
  return v.strictObject({
    kind: v.literal("public_invocation"),
    invocationRef: refSchema,
    definitionKey: keySchema,
    definitionDigest: sha256DigestSchema,
    contractCatalog: publicContractCatalogCoordinateSchema,
    authority: invocationAuthoritySchema(keySchema),
    requestContract: publicContractCoordinateSchema,
    requestRef: refSchema,
    requestDigest: sha256DigestSchema,
    request: requestSchema,
    expectedResultContract: publicContractCoordinateSchema,
    expectedRefusalContract: publicContractCoordinateSchema,
    expectedNonTerminalContract: v.nullable(publicContractCoordinateSchema),
    correlationRef: refSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  });
}

/** @internal */
export function publicInvocationSchema<
  K extends NativeSchema,
  Request extends NativeSchema
>(keySchema: K, requestSchema: Request) {
  const basis = publicInvocationBasisSchema(keySchema, requestSchema);
  return v.strictObject({
    ...basis.entries,
    invocationDigest: sha256DigestSchema
  });
}

/** @internal */
export interface PublicInvocationExpectation<K extends string> {
  readonly operationKey: K;
  readonly definitionDigest: string;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requestContract: PublicContractCoordinate;
  readonly resultContract: PublicContractCoordinate;
  readonly refusalContract: PublicContractCoordinate;
  readonly nonTerminalContract: PublicContractCoordinate | null;
  readonly authority: InvocationAuthorityExpectation<K>;
}

/** @internal */
export function admitPublicInvocation<
  const K extends string,
  Request extends NativeSchema
>(input: {
  readonly operationKey: K;
  readonly requestSchema: Request;
  readonly raw: unknown;
  readonly expected: PublicInvocationExpectation<K>;
}) {
  const keySchema = v.literal(input.operationKey);
  const invocation = admitNative(
    publicInvocationSchema(keySchema, input.requestSchema),
    input.raw
  );
  for (const coordinate of [
    invocation.requestContract,
    invocation.expectedResultContract,
    invocation.expectedRefusalContract,
    invocation.expectedNonTerminalContract
  ]) {
    if (coordinate !== null) {
      admitPublicContractCoordinate(coordinate);
    }
  }
  const authority = invocation.authority;
  if (authority === undefined) {
    throw new TypeError("public invocation: authority is required");
  }
  admitInvocationAuthority({
    operationKey: input.operationKey,
    raw: authority,
    expected: input.expected.authority
  });
  if (
    invocation.definitionKey !== input.expected.operationKey ||
    invocation.definitionDigest !== input.expected.definitionDigest
  ) {
    throw new TypeError("public invocation: definition mismatch");
  }
  for (const [label, actual, expected] of [
    ["catalog", invocation.contractCatalog, input.expected.contractCatalog],
    ["authority catalog", authority.contractCatalog, input.expected.contractCatalog],
    ["request contract", invocation.requestContract, input.expected.requestContract],
    ["result contract", invocation.expectedResultContract, input.expected.resultContract],
    ["refusal contract", invocation.expectedRefusalContract, input.expected.refusalContract],
    ["nonterminal contract", invocation.expectedNonTerminalContract, input.expected.nonTerminalContract]
  ] as const) {
    assertSameValue(actual, expected, `public invocation ${label}`);
  }
  if (invocation.requestDigest !== stableSha256Digest(invocation.request)) {
    throw new TypeError("public invocation: request digest mismatch");
  }
  const basis = admitNative(publicInvocationBasisSchema(keySchema, input.requestSchema), {
    kind: invocation.kind,
    invocationRef: invocation.invocationRef,
    definitionKey: invocation.definitionKey,
    definitionDigest: invocation.definitionDigest,
    contractCatalog: invocation.contractCatalog,
    authority: invocation.authority,
    requestContract: invocation.requestContract,
    requestRef: invocation.requestRef,
    requestDigest: invocation.requestDigest,
    request: invocation.request,
    expectedResultContract: invocation.expectedResultContract,
    expectedRefusalContract: invocation.expectedRefusalContract,
    expectedNonTerminalContract: invocation.expectedNonTerminalContract,
    correlationRef: invocation.correlationRef,
    provenanceRefs: invocation.provenanceRefs
  });
  if (invocation.invocationDigest !== stableSha256Digest(basis)) {
    throw new TypeError("public invocation: invocation digest mismatch");
  }
  return invocation;
}

/** @internal */
export function constructPublicInvocation<
  const K extends string,
  Request extends NativeSchema
>(input: {
  readonly operationKey: K;
  readonly requestSchema: Request;
  readonly basis: v.InferInput<
    ReturnType<
      typeof publicInvocationBasisSchema<
        v.LiteralSchema<K, undefined>,
        Request
      >
    >
  >;
  readonly expected: PublicInvocationExpectation<K>;
}) {
  const keySchema = v.literal(input.operationKey);
  const basis = admitNative(
    publicInvocationBasisSchema(keySchema, input.requestSchema),
    input.basis
  );
  return admitPublicInvocation({
    operationKey: input.operationKey,
    requestSchema: input.requestSchema,
    expected: input.expected,
    raw: { ...basis, invocationDigest: stableSha256Digest(basis) }
  });
}

function outcomeCommonEntries<K extends NativeSchema>(keySchema: K) {
  return {
    kind: v.literal("public_outcome"),
    outcomeRef: refSchema,
    outcomeDigest: sha256DigestSchema,
    invocationRef: refSchema,
    invocationDigest: sha256DigestSchema,
    definitionKey: keySchema,
    definitionDigest: sha256DigestSchema,
    payloadRef: refSchema,
    payloadDigest: sha256DigestSchema,
    evidenceRefs: uniqueByIdentityArray(refSchema),
    correlationRef: refSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  } as const satisfies v.ObjectEntries;
}

function outcomeSchema<
  K extends NativeSchema,
  Result extends NativeSchema,
  Refusal extends NativeSchema,
  NonTerminal extends NativeSchema | null
>(input: {
  readonly keySchema: K;
  readonly resultSchema: Result;
  readonly refusalSchema: Refusal;
  readonly nonTerminalSchema: NonTerminal;
}) {
  const common = outcomeCommonEntries(input.keySchema);
  const result = v.strictObject({
    ...common,
    outcomeKind: v.literal("result"),
    payloadContract: publicContractCoordinateSchema,
    value: input.resultSchema
  });
  const refusal = v.strictObject({
    ...common,
    outcomeKind: v.literal("refusal"),
    payloadContract: publicContractCoordinateSchema,
    value: input.refusalSchema
  });
  if (input.nonTerminalSchema === null) {
    return v.union([result, refusal]);
  }
  return v.union([
    result,
    refusal,
    v.strictObject({
      ...common,
      outcomeKind: v.literal("nonterminal"),
      payloadContract: publicContractCoordinateSchema,
      value: input.nonTerminalSchema
    })
  ]);
}

/** @internal */
export const OUTCOME_ADMISSION_FAILURE_CLASS_VALUES = Object.freeze([
  "malformed",
  "cross_operation",
  "wrong_contract",
  "digest_mismatch",
  "unexpected_nonterminal"
] as const);

const outcomeAdmissionFailureSchema = v.strictObject({
  kind: v.literal("outcome_admission_failure"),
  failureClass: v.picklist(OUTCOME_ADMISSION_FAILURE_CLASS_VALUES),
  issuePaths: uniqueByIdentityArray(nonEmptyTextSchema),
  invocationRef: refSchema,
  definitionKey: nonEmptyTextSchema,
  candidateDigest: sha256DigestSchema
});

/** @internal */
export type OutcomeAdmissionFailure = v.InferOutput<
  typeof outcomeAdmissionFailureSchema
>;

function candidateDigest(input: unknown): `sha256:${string}` {
  try {
    return stableSha256Digest(admitIJsonValue(input));
  } catch {
    return stableSha256Digest({
      kind: "non_ijson_candidate",
      candidateType: input === null ? "null" : typeof input
    });
  }
}

function outcomeFailure(input: {
  readonly failureClass: OutcomeAdmissionFailure["failureClass"];
  readonly issuePaths: readonly string[];
  readonly invocationRef: string;
  readonly definitionKey: string;
  readonly candidate: unknown;
}): OutcomeAdmissionFailure {
  return admitNative(outcomeAdmissionFailureSchema, {
    kind: "outcome_admission_failure",
    failureClass: input.failureClass,
    issuePaths: [...new Set(input.issuePaths)].sort(),
    invocationRef: input.invocationRef,
    definitionKey: input.definitionKey,
    candidateDigest: candidateDigest(input.candidate)
  });
}

/** @internal */
export function admitPublicOutcome<
  const K extends string,
  Result extends NativeSchema,
  Refusal extends NativeSchema,
  NonTerminal extends NativeSchema | null
>(input: {
  readonly operationKey: K;
  readonly resultSchema: Result;
  readonly refusalSchema: Refusal;
  readonly nonTerminalSchema: NonTerminal;
  readonly invocation: {
    readonly invocationRef: string;
    readonly invocationDigest: string;
    readonly definitionKey: K;
    readonly definitionDigest: string;
    readonly correlationRef: string;
  };
  readonly contracts: {
    readonly result: PublicContractCoordinate;
    readonly refusal: PublicContractCoordinate;
    readonly nonTerminal: PublicContractCoordinate | null;
  };
  readonly raw: unknown;
}) {
  if (typeof input.raw === "object" && input.raw !== null) {
    const candidateDefinitionKey: unknown = Reflect.get(
      input.raw,
      "definitionKey"
    );
    if (
      typeof candidateDefinitionKey === "string" &&
      candidateDefinitionKey !== input.operationKey
    ) {
      return outcomeFailure({
        failureClass: "cross_operation",
        issuePaths: ["definitionKey"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: input.operationKey,
        candidate: input.raw
      });
    }
    if (
      Reflect.get(input.raw, "outcomeKind") === "nonterminal" &&
      input.nonTerminalSchema === null
    ) {
      return outcomeFailure({
        failureClass: "unexpected_nonterminal",
        issuePaths: ["outcomeKind"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: input.operationKey,
        candidate: input.raw
      });
    }
  }
  const schema = outcomeSchema({
    keySchema: v.literal(input.operationKey),
    resultSchema: input.resultSchema,
    refusalSchema: input.refusalSchema,
    nonTerminalSchema: input.nonTerminalSchema
  });
  const parsed = v.safeParse(schema, input.raw);
  if (!parsed.success) {
    return outcomeFailure({
      failureClass: "malformed",
      issuePaths: parsed.issues.map((issue) => v.getDotPath(issue) ?? "candidate"),
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  const outcome = deepFreeze(parsed.output);
  try {
    admitPublicContractCoordinate(outcome.payloadContract);
  } catch {
    return outcomeFailure({
      failureClass: "digest_mismatch",
      issuePaths: ["payloadContract.contractDigest", "payloadContract.schemaDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  if (outcome.definitionKey !== input.operationKey) {
    return outcomeFailure({
      failureClass: "cross_operation",
      issuePaths: ["definitionKey"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  if (
    outcome.invocationRef !== input.invocation.invocationRef ||
    outcome.invocationDigest !== input.invocation.invocationDigest ||
    outcome.definitionDigest !== input.invocation.definitionDigest ||
    outcome.correlationRef !== input.invocation.correlationRef
  ) {
    return outcomeFailure({
      failureClass: "digest_mismatch",
      issuePaths: ["invocationDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  const expectedContract =
    outcome.outcomeKind === "result"
      ? input.contracts.result
      : outcome.outcomeKind === "refusal"
        ? input.contracts.refusal
        : input.contracts.nonTerminal;
  if (expectedContract === null) {
    return outcomeFailure({
      failureClass: "unexpected_nonterminal",
      issuePaths: ["outcomeKind"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  if (!stableJsonEquals(outcome.payloadContract, expectedContract)) {
    return outcomeFailure({
      failureClass: "wrong_contract",
      issuePaths: ["payloadContract"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  if (outcome.payloadDigest !== stableSha256Digest(outcome.value)) {
    return outcomeFailure({
      failureClass: "digest_mismatch",
      issuePaths: ["payloadDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  const outcomeBasis = {
    kind: outcome.kind,
    outcomeRef: outcome.outcomeRef,
    invocationRef: outcome.invocationRef,
    invocationDigest: outcome.invocationDigest,
    definitionKey: outcome.definitionKey,
    definitionDigest: outcome.definitionDigest,
    payloadRef: outcome.payloadRef,
    payloadDigest: outcome.payloadDigest,
    evidenceRefs: outcome.evidenceRefs,
    correlationRef: outcome.correlationRef,
    provenanceRefs: outcome.provenanceRefs,
    outcomeKind: outcome.outcomeKind,
    payloadContract: outcome.payloadContract,
    value: outcome.value
  };
  if (outcome.outcomeDigest !== stableSha256Digest(outcomeBasis)) {
    return outcomeFailure({
      failureClass: "digest_mismatch",
      issuePaths: ["outcomeDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: input.operationKey,
      candidate: input.raw
    });
  }
  return outcome;
}

/** @internal */
export function constructPublicOutcome(input: {
  readonly outcomeKind: "result" | "refusal" | "nonterminal";
  readonly outcomeRef: string;
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly definitionKey: string;
  readonly definitionDigest: string;
  readonly payloadRef: string;
  readonly payloadContract: PublicContractCoordinate;
  readonly value: IJsonValue;
  readonly evidenceRefs: readonly string[];
  readonly correlationRef: string;
  readonly provenanceRefs: readonly string[];
}): Record<string, unknown> {
  const basis = deepFreeze({
    kind: "public_outcome" as const,
    outcomeRef: input.outcomeRef,
    invocationRef: input.invocationRef,
    invocationDigest: input.invocationDigest,
    definitionKey: input.definitionKey,
    definitionDigest: input.definitionDigest,
    payloadRef: input.payloadRef,
    payloadDigest: stableSha256Digest(input.value),
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    correlationRef: input.correlationRef,
    provenanceRefs: Object.freeze([...input.provenanceRefs]),
    outcomeKind: input.outcomeKind,
    payloadContract: input.payloadContract,
    value: admitIJsonValue(input.value)
  });
  return deepFreeze({ ...basis, outcomeDigest: stableSha256Digest(basis) });
}

/** @internal */
export function resolvePublicContractCoordinate(input: {
  readonly admittedCatalog: unknown;
  readonly requestedCatalog: PublicContractCatalogCoordinate;
  readonly requested: PublicContractCoordinate;
}): PublicContractCoordinate {
  const catalog = admitPublicContractCatalog(input.admittedCatalog);
  const requested = admitPublicContractCoordinate(input.requested);
  assertSameValue(
    publicContractCatalogCoordinate(catalog),
    input.requestedCatalog,
    "public contract catalog coordinate"
  );
  const matches = catalog.rows.filter(
    (row) =>
      row.contractId === requested.contractId &&
      row.contractVersion === requested.contractVersion
  );
  const match = matches[0];
  if (matches.length !== 1 || match === undefined) {
    throw new TypeError("public contract catalog: unknown contract coordinate");
  }
  assertSameValue(match, requested, "public contract coordinate");
  return match;
}

/** @internal */
export function canonicalNativeSchemaBytes(schema: JsonSchema): Uint8Array {
  return new TextEncoder().encode(stableJson(schema));
}
