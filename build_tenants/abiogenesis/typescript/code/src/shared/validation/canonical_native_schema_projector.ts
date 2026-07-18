import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  toJsonSchema,
  type JsonSchema,
  type OverrideActionContext,
  type OverrideSchemaContext
} from "@valibot/to-json-schema";
import * as v from "valibot";

import {
  sha256DigestForBytes,
  stableJsonEquals,
  stableSha256Digest
} from "../runtime_identity.js";
import { freezeNativeValue } from "./immutable_native_value.js";
import {
  ABSOLUTE_POSIX_PATH_ACTION,
  CANONICAL_IJSON_ACTION,
  MINIMUM_ONE_ACTION,
  POSITIVE_INTEGER_ACTION,
  SAFE_INTEGER_ACTION,
  SEMANTIC_VERSION_ACTION,
  SEMANTIC_VERSION_PATTERN,
  canonicalIJsonSchema,
  contractIdSchema,
  hasUniqueNativeIdentity,
  semanticVersionSchema
} from "./native_contract_primitives.js";
import {
  admitNativeNamedCheckRegistry,
  type NativeNamedCheckRegistry,
  type NativeNamedCheckResolver
} from "./native_named_check_registry.js";
import type {
  OwnerNativeAuthorityBasis,
  OwnerProjectionRelationResult,
  OwnerProjectionRelationSource
} from "./owner_native_operation_contract_source.js";

export type CanonicalNativeSchema = v.GenericSchema;

const NATIVE_SYMBOL_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const PRIVATE_MODULE_PATH_PATTERN =
  /^code\/src\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.js$/u;
const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const NAMED_CHECK_REF_PATTERN = /^(?=\S+$)[^#\u0000-\u0020\u007f]+#[a-z][a-z0-9._-]*$/u;

export const nativeExportNameSchema = v.pipe(
  v.string(),
  v.regex(NATIVE_SYMBOL_PATTERN)
);

export const privateNativeSchemaSourceLocatorSchema = v.strictObject({
  kind: v.literal("private_source_module"),
  sourceRoot: v.literal("semantic_build"),
  modulePath: v.pipe(v.string(), v.regex(PRIVATE_MODULE_PATH_PATTERN)),
  exportName: nativeExportNameSchema,
  memberPath: v.pipe(v.array(nativeExportNameSchema), v.readonly())
});

export type PrivateNativeSchemaSourceLocator = v.InferOutput<
  typeof privateNativeSchemaSourceLocatorSchema
>;

export const ownerNativeNamedCheckCoordinateSchema = v.variant("kind", [
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({
    kind: v.literal("family_registry"),
    exportName: nativeExportNameSchema,
    memberPath: v.pipe(v.array(nativeExportNameSchema), v.readonly())
  })
]);

export type OwnerNativeNamedCheckCoordinate = v.InferOutput<
  typeof ownerNativeNamedCheckCoordinateSchema
>;

/**
 * A build-private source resolution. The carrier is intentionally opaque:
 * only resolveSemanticBuildNativeSchemaSource can mint one, and its schema is
 * retained in module-private state so callers cannot pair a locator with a
 * separately supplied value.
 */
declare const RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_TYPE: unique symbol;
const RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_STATE_READER: unique symbol = Symbol(
  "resolved_owner_native_contract_source_state_reader"
);

export interface OwnerNativeContractSourceRow<
  S extends CanonicalNativeSchema = CanonicalNativeSchema
> {
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly namedChecks: OwnerNativeNamedCheckCoordinate;
  readonly schema: S;
}

export interface ResolvedOwnerNativeContractSource<
  S extends CanonicalNativeSchema = CanonicalNativeSchema
> {
  readonly kind: "resolved_owner_native_contract_source";
  readonly [RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_TYPE]?: (schema: S) => S;
  readonly [RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_STATE_READER]: () =>
    ResolvedOwnerNativeContractSourceState<S>;
}

interface ResolvedOwnerNativeContractSourceState<
  S extends CanonicalNativeSchema = CanonicalNativeSchema
> {
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly sourceModuleDigest: `sha256:${string}`;
  readonly sourceBasisDigest: `sha256:${string}`;
  readonly schema: S;
  readonly namedCheckSource: OwnerNativeNamedCheckCoordinate;
  readonly namedCheckResolver: NativeNamedCheckResolver;
}

const RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_AUTHORITY =
  new WeakMap<object, true>();
const RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_MODULE =
  new WeakMap<object, object>();
const RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_ROW =
  new WeakMap<object, OwnerNativeContractSourceRow>();
const RESOLVED_SEMANTIC_BUILD_MODULE_DIGESTS = new Map<
  string,
  `sha256:${string}`
>();

const SEMANTIC_BUILD_SOURCE_ROOT = new URL("../../../../", import.meta.url);

function isCanonicalNativeSchema(
  input: unknown
): input is CanonicalNativeSchema {
  return (
    typeof input === "object" &&
    input !== null &&
    Reflect.get(input, "kind") === "schema" &&
    typeof Reflect.get(input, "type") === "string" &&
    typeof Reflect.get(input, "reference") === "function" &&
    typeof Reflect.get(input, "~run") === "function"
  );
}

function isRecursivelyFrozen(input: unknown, seen = new Set<object>()): boolean {
  if (typeof input !== "object" || input === null || seen.has(input)) {
    return true;
  }
  if (!Object.isFrozen(input)) {
    return false;
  }
  seen.add(input);
  try {
    for (const key of Reflect.ownKeys(input)) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (
        descriptor !== undefined &&
        "value" in descriptor &&
        !isRecursivelyFrozen(descriptor.value, seen)
      ) {
        return false;
      }
    }
    return true;
  } finally {
    seen.delete(input);
  }
}

function ownDataProperty(input: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  if (descriptor === undefined || !("value" in descriptor)) {
    throw new TypeError(
      `native contract source: own data member not found ${key}`
    );
  }
  return descriptor.value;
}

function isUnknownArray(input: unknown): input is unknown[] {
  return Array.isArray(input);
}

function assertExactOwnDataKeys(
  input: object,
  expected: readonly string[],
  label: string
): void {
  const actual = Reflect.ownKeys(input);
  if (
    actual.length !== expected.length ||
    !expected.every((key) => actual.includes(key))
  ) {
    throw new TypeError(`${label}: expected exact keys ${expected.join(",")}`);
  }
  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (
      descriptor === undefined ||
      !("value" in descriptor) ||
      descriptor.enumerable !== true
    ) {
      throw new TypeError(`${label}: expected enumerable data field ${key}`);
    }
  }
}

function resolvedOwnerNativeContractSourceState<
  S extends CanonicalNativeSchema
>(
  source: ResolvedOwnerNativeContractSource<S>
): ResolvedOwnerNativeContractSourceState<S> {
  if (!RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_AUTHORITY.has(source)) {
    throw new TypeError(
      "native contract source: unresolved or forged source carrier"
    );
  }
  return source[RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_STATE_READER]();
}

/** @internal */
export function assertResolvedOwnerNativeContractSourceOriginatesFrom(
  source: object,
  expectedSourceRow: OwnerNativeContractSourceRow
): void {
  if (!RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_AUTHORITY.has(source)) {
    throw new TypeError(
      "native contract source: unresolved or forged source carrier"
    );
  }
  if (
    RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_ROW.get(source) !== expectedSourceRow
  ) {
    throw new TypeError(
      "native contract source: originating owner source row differs"
    );
  }
}

function resolveOwnDataPath(
  sourceModule: object,
  exportName: string,
  memberPath: readonly string[],
  label: string
): unknown {
  let resolved: unknown = ownDataProperty(sourceModule, exportName);
  for (const member of memberPath) {
    if (typeof resolved !== "object" || resolved === null) {
      throw new TypeError(`native contract source: ${label} member not found ${member}`);
    }
    resolved = ownDataProperty(resolved, member);
  }
  return resolved;
}

export async function resolveSemanticBuildNativeSchemaSource<
  const S extends CanonicalNativeSchema
>(
  input: OwnerNativeContractSourceRow<S>
): Promise<ResolvedOwnerNativeContractSource<S>> {
  if (!isRecursivelyFrozen(input)) {
    throw new TypeError(
      "native contract source: owner source row is not recursively frozen"
    );
  }
  const expectedSchema = ownDataProperty(input, "schema");
  if (!isCanonicalNativeSchema(expectedSchema)) {
    throw new TypeError(
      "native contract source: owner source row lacks a native schema"
    );
  }
  const typedExpectedSchema = input.schema;
  const sourceLocator = freezeNativeValue(
    v.parse(
      privateNativeSchemaSourceLocatorSchema,
      ownDataProperty(input, "sourceLocator")
    )
  );
  const namedCheckSource = freezeNativeValue(
    v.parse(
      ownerNativeNamedCheckCoordinateSchema,
      ownDataProperty(input, "namedChecks")
    )
  );
  const moduleUrl = new URL(
    sourceLocator.modulePath,
    SEMANTIC_BUILD_SOURCE_ROOT
  );
  if (!moduleUrl.href.startsWith(SEMANTIC_BUILD_SOURCE_ROOT.href)) {
    throw new TypeError(
      "native contract source: module escapes semantic_build"
    );
  }

  let sourceModuleBytes: Uint8Array;
  try {
    sourceModuleBytes = await readFile(fileURLToPath(moduleUrl.href));
  } catch (error: unknown) {
    throw new TypeError(
      `native contract source: module bytes unavailable ${sourceLocator.modulePath}`,
      { cause: error }
    );
  }
  const sourceModuleDigest = sha256DigestForBytes(sourceModuleBytes);
  const priorModuleDigest = RESOLVED_SEMANTIC_BUILD_MODULE_DIGESTS.get(
    moduleUrl.href
  );
  if (
    priorModuleDigest !== undefined &&
    priorModuleDigest !== sourceModuleDigest
  ) {
    throw new TypeError(
      "native contract source: module bytes changed after first resolution"
    );
  }
  // Claim the process-local basis before import() yields so overlapping
  // resolutions cannot bind cached module values to different file bytes.
  RESOLVED_SEMANTIC_BUILD_MODULE_DIGESTS.set(
    moduleUrl.href,
    sourceModuleDigest
  );

  let sourceModule: object;
  try {
    const importedModule: unknown = await import(moduleUrl.href);
    if (typeof importedModule !== "object" || importedModule === null) {
      throw new TypeError("resolved module is not an object");
    }
    sourceModule = importedModule;
  } catch (error: unknown) {
    throw new TypeError(
      `native contract source: module resolution failed ${sourceLocator.modulePath}`,
      { cause: error }
    );
  }

  const postImportModuleDigest = sha256DigestForBytes(
    await readFile(fileURLToPath(moduleUrl.href))
  );
  if (postImportModuleDigest !== sourceModuleDigest) {
    throw new TypeError(
      "native contract source: module changed during resolution"
    );
  }
  const resolved = resolveOwnDataPath(
    sourceModule,
    sourceLocator.exportName,
    sourceLocator.memberPath,
    "schema"
  );
  if (!isCanonicalNativeSchema(resolved)) {
    throw new TypeError(
      "native contract source: locator does not resolve to a native schema"
    );
  }
  if (!isRecursivelyFrozen(resolved)) {
    throw new TypeError(
      "native contract source: resolved native schema is not recursively frozen"
    );
  }
  if (resolved !== typedExpectedSchema) {
    throw new TypeError(
      "native contract source: resolved schema identity differs from owner source row"
    );
  }

  const namedCheckResolver =
    namedCheckSource.kind === "none"
      ? admitNativeNamedCheckRegistry(undefined)
      : (() => {
          const registry = resolveOwnDataPath(
            sourceModule,
            namedCheckSource.exportName,
            namedCheckSource.memberPath,
            "named-check registry"
          );
          if (!isRecursivelyFrozen(registry)) {
            throw new TypeError(
              "native contract source: resolved named-check registry is not recursively frozen"
            );
          }
          return admitNativeNamedCheckRegistry(registry);
        })();

  const sourceBasisDigest = stableSha256Digest({
    kind: "semantic_build_native_schema_source_basis",
    sourceRoot: sourceLocator.sourceRoot,
    modulePath: sourceLocator.modulePath,
    sourceModuleDigest
  });

  const state: ResolvedOwnerNativeContractSourceState<S> = freezeNativeValue({
    sourceLocator,
    sourceModuleDigest,
    sourceBasisDigest,
    schema: typedExpectedSchema,
    namedCheckSource,
    namedCheckResolver
  });
  const carrier: ResolvedOwnerNativeContractSource<S> = Object.freeze({
    kind: "resolved_owner_native_contract_source",
    [RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_STATE_READER]: () => state
  });
  RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_AUTHORITY.set(carrier, true);
  RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_MODULE.set(carrier, sourceModule);
  RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_ROW.set(carrier, input);
  return carrier;
}

export interface OwnerProjectionRelationWitness<K = unknown> {
  readonly kind: "owner_projection_relation_witness";
  readonly relationIdentity: string;
  readonly definitionKey: K;
  readonly semanticOwnerBasisRef: string;
  readonly semanticOwnerBasisDigest: `sha256:${string}`;
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly sourceModuleDigest: `sha256:${string}`;
  readonly relationMemberIdentity: string;
  readonly relationWitnessDigest: `sha256:${string}`;
}

interface ResolvedOwnerProjectionRelationState<K, Request, Projection> {
  readonly definitionKey: K;
  readonly relation: OwnerProjectionRelationSource<
    K,
    Request,
    Projection
  >["relation"];
  readonly witness: OwnerProjectionRelationWitness<K>;
}

declare const RESOLVED_OWNER_PROJECTION_RELATION_TYPE: unique symbol;
const RESOLVED_OWNER_PROJECTION_RELATION_STATE_READER: unique symbol = Symbol(
  "resolved_owner_projection_relation_state_reader"
);
const RESOLVED_OWNER_PROJECTION_RELATION_AUTHORITY = new WeakMap<object, true>();

export interface ResolvedOwnerProjectionRelation<K, Request, Projection> {
  readonly kind: "resolved_owner_projection_relation";
  readonly witness: OwnerProjectionRelationWitness<K>;
  readonly [RESOLVED_OWNER_PROJECTION_RELATION_TYPE]?: (
    key: K,
    request: Request,
    projection: Projection
  ) => readonly [K, Request, Projection];
  readonly [RESOLVED_OWNER_PROJECTION_RELATION_STATE_READER]: () =>
    ResolvedOwnerProjectionRelationState<K, Request, Projection>;
}

function resolvedOwnerProjectionRelationState<K, Request, Projection>(
  relation: ResolvedOwnerProjectionRelation<K, Request, Projection>
): ResolvedOwnerProjectionRelationState<K, Request, Projection> {
  if (!RESOLVED_OWNER_PROJECTION_RELATION_AUTHORITY.has(relation)) {
    throw new TypeError("owner projection relation: unresolved or forged carrier");
  }
  return relation[RESOLVED_OWNER_PROJECTION_RELATION_STATE_READER]();
}

function exactStructuralKeyEquals(left: unknown, right: unknown): boolean {
  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null
  ) {
    return false;
  }
  const leftKeys = Reflect.ownKeys(left);
  const rightKeys = Reflect.ownKeys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => rightKeys.includes(key)) &&
    stableJsonEquals(left, right)
  );
}

/** @internal */
export function isResolvedOwnerProjectionRelationCarrier(
  input: unknown
): boolean {
  return typeof input === "object" &&
    input !== null &&
    RESOLVED_OWNER_PROJECTION_RELATION_AUTHORITY.has(input);
}

function admitOwnerProjectionRelationResult(
  input: unknown
): OwnerProjectionRelationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("owner projection relation: invalid relation result");
  }
  const kind = ownDataProperty(input, "kind");
  if (kind === "projection_related") {
    assertExactOwnDataKeys(input, ["kind"], "owner projection relation result");
    return freezeNativeValue({ kind });
  }
  if (kind !== "projection_relation_mismatch") {
    throw new TypeError("owner projection relation: invalid relation result kind");
  }
  assertExactOwnDataKeys(
    input,
    ["kind", "issuePaths"],
    "owner projection relation result"
  );
  const rawIssuePaths: unknown = ownDataProperty(input, "issuePaths");
  if (
    !isUnknownArray(rawIssuePaths) ||
    rawIssuePaths.length === 0
  ) {
    throw new TypeError("owner projection relation: invalid mismatch paths");
  }
  const issuePaths: string[] = [];
  for (const path of rawIssuePaths) {
    if (typeof path !== "string" || path.length === 0) {
      throw new TypeError("owner projection relation: invalid mismatch paths");
    }
    issuePaths.push(path);
  }
  if (new Set(issuePaths).size !== issuePaths.length) {
    throw new TypeError("owner projection relation: invalid mismatch paths");
  }
  issuePaths.sort();
  const [firstIssuePath, ...remainingIssuePaths] = issuePaths;
  if (firstIssuePath === undefined) {
    throw new TypeError("owner projection relation: invalid mismatch paths");
  }
  return freezeNativeValue({
    kind,
    issuePaths: [firstIssuePath, ...remainingIssuePaths]
  });
}

export function resolveSemanticBuildOwnerProjectionRelation<
  const K,
  Request,
  Projection,
  S extends CanonicalNativeSchema
>(input: {
  readonly source: OwnerProjectionRelationSource<K, Request, Projection>;
  readonly projectionSource: ResolvedOwnerNativeContractSource<S>;
  readonly expectedDefinitionKey: K;
  readonly expectedSemanticOwnerBasis: OwnerNativeAuthorityBasis;
}): ResolvedOwnerProjectionRelation<K, Request, Projection> {
  assertExactOwnDataKeys(
    input,
    [
      "source",
      "projectionSource",
      "expectedDefinitionKey",
      "expectedSemanticOwnerBasis"
    ],
    "owner projection relation resolution"
  );
  if (!isRecursivelyFrozen(input.source)) {
    throw new TypeError("owner projection relation: source is not recursively frozen");
  }
  assertExactOwnDataKeys(
    input.source,
    [
      "kind",
      "relationIdentity",
      "definitionKey",
      "semanticOwnerBasis",
      "sourceLocator",
      "relation"
    ],
    "owner projection relation source"
  );
  if (input.source.kind !== "owner_projection_relation_source") {
    throw new TypeError("owner projection relation: invalid source kind");
  }
  if (
    !exactStructuralKeyEquals(
      input.source.definitionKey,
      input.expectedDefinitionKey
    )
  ) {
    throw new TypeError("owner projection relation: definition key mismatch");
  }
  if (
    !stableJsonEquals(
      input.source.semanticOwnerBasis,
      input.expectedSemanticOwnerBasis
    )
  ) {
    throw new TypeError("owner projection relation: semantic owner mismatch");
  }
  const sourceLocator = freezeNativeValue(
    v.parse(privateNativeSchemaSourceLocatorSchema, input.source.sourceLocator)
  );
  const schemaState = resolvedOwnerNativeContractSourceState(
    input.projectionSource
  );
  if (sourceLocator.modulePath !== schemaState.sourceLocator.modulePath) {
    throw new TypeError("owner projection relation: projection module mismatch");
  }
  const sourceModule = RESOLVED_OWNER_NATIVE_CONTRACT_SOURCE_MODULE.get(
    input.projectionSource
  );
  if (sourceModule === undefined) {
    throw new TypeError("owner projection relation: source module unavailable");
  }
  const resolvedRelation = resolveOwnDataPath(
    sourceModule,
    sourceLocator.exportName,
    sourceLocator.memberPath,
    "projection relation"
  );
  if (
    typeof resolvedRelation !== "function" ||
    resolvedRelation !== input.source.relation
  ) {
    throw new TypeError("owner projection relation: relation identity mismatch");
  }
  const relationMemberIdentity = `relation-member:${stableSha256Digest({
    relationIdentity: input.source.relationIdentity,
    sourceLocator,
    sourceModuleDigest: schemaState.sourceModuleDigest
  })}`;
  const witnessBasis = freezeNativeValue({
    kind: "owner_projection_relation_witness" as const,
    relationIdentity: input.source.relationIdentity,
    definitionKey: input.expectedDefinitionKey,
    semanticOwnerBasisRef: input.expectedSemanticOwnerBasis.ref,
    semanticOwnerBasisDigest: input.expectedSemanticOwnerBasis.digest,
    sourceLocator,
    sourceModuleDigest: schemaState.sourceModuleDigest,
    relationMemberIdentity
  });
  const witness = freezeNativeValue({
    ...witnessBasis,
    relationWitnessDigest: stableSha256Digest(witnessBasis)
  });
  const state: ResolvedOwnerProjectionRelationState<K, Request, Projection> =
    freezeNativeValue({
      definitionKey: input.expectedDefinitionKey,
      relation: input.source.relation,
      witness
    });
  const carrier: ResolvedOwnerProjectionRelation<K, Request, Projection> =
    Object.freeze({
      kind: "resolved_owner_projection_relation",
      witness,
      [RESOLVED_OWNER_PROJECTION_RELATION_STATE_READER]: () => state
    });
  RESOLVED_OWNER_PROJECTION_RELATION_AUTHORITY.set(carrier, true);
  return carrier;
}

export function applyResolvedOwnerProjectionRelation<K, Request, Projection>(
  input: {
    readonly relation: ResolvedOwnerProjectionRelation<K, Request, Projection>;
    readonly definitionKey: K;
    readonly admittedRequest: Request;
    readonly candidateProjection: Projection;
  }
): OwnerProjectionRelationResult {
  assertExactOwnDataKeys(
    input,
    ["relation", "definitionKey", "admittedRequest", "candidateProjection"],
    "owner projection relation application"
  );
  const state = resolvedOwnerProjectionRelationState(input.relation);
  if (!exactStructuralKeyEquals(state.definitionKey, input.definitionKey)) {
    throw new TypeError("owner projection relation: application key mismatch");
  }
  return admitOwnerProjectionRelationResult(
    state.relation({
      definitionKey: input.definitionKey,
      admittedRequest: input.admittedRequest,
      candidateProjection: input.candidateProjection
    })
  );
}

export interface NativeSchemaProjectionNamedCheck {
  readonly checkRef: string;
  readonly registrationDigest: `sha256:${string}`;
  readonly relationRef: string | null;
}

export interface NativeSchemaProjectionWitness {
  readonly kind: "native_schema_projection_witness";
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly sourceModuleDigest: `sha256:${string}`;
  readonly sourceBasisDigest: `sha256:${string}`;
  readonly namedCheckSource: OwnerNativeNamedCheckCoordinate;
  readonly schemaRef: string;
  readonly schemaVersion: string;
  readonly projectorRef: string;
  readonly projectorVersion: string;
  readonly projectorBasisDigest: `sha256:${string}`;
  readonly projectionDigest: `sha256:${string}`;
  readonly namedChecks: readonly NativeSchemaProjectionNamedCheck[];
  readonly witnessDigest: `sha256:${string}`;
}

export interface CanonicalNativeSchemaProjection<
  S extends CanonicalNativeSchema = CanonicalNativeSchema
> {
  readonly schema: S;
  readonly projectedSchema: JsonSchema;
  readonly witness: NativeSchemaProjectionWitness;
}

export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_REF =
  "projector://abg/native-schema/valibot-json-schema";
export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_VERSION = "1.2.0";
export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS =
  Object.freeze({
    valibot: "1.3.1",
    valibotJsonSchema: "1.6.0"
  });

const ALLOWED_SCHEMA_TYPES = Object.freeze([
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
const ALLOWED_SCHEMA_TYPE_SET = new Set(ALLOWED_SCHEMA_TYPES);

function expectedSchemaReference(type: string): unknown {
  switch (type) {
    case "array":
      return v.array;
    case "boolean":
      return v.boolean;
    case "literal":
      return v.literal;
    case "null":
      return v.null_;
    case "nullable":
      return v.nullable;
    case "number":
      return v.number;
    case "picklist":
      return v.picklist;
    case "strict_object":
      return v.strictObject;
    case "string":
      return v.string;
    case "tuple":
      return v.tuple;
    case "union":
      return v.union;
    case "unknown":
      return v.unknown;
    default:
      return undefined;
  }
}

const CANONICAL_NATIVE_SCHEMA_PROJECTOR_BASIS = freezeNativeValue({
  projectorRef: CANONICAL_NATIVE_SCHEMA_PROJECTOR_REF,
  projectorVersion: CANONICAL_NATIVE_SCHEMA_PROJECTOR_VERSION,
  jsonSchemaDialect: "https://json-schema.org/draft/2020-12/schema",
  valibotVersion:
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibot,
  valibotJsonSchemaVersion:
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibotJsonSchema,
  unsupportedSchemaPolicy: "throw",
  unsupportedActionPolicy: "throw",
  nativeReferencePolicy: "exact-pinned-constructor-reference-v1",
  namedCheckPolicy: "exact-action-same-owner-module-registry-v2",
  allowedSchemaTypes: ALLOWED_SCHEMA_TYPES,
  standardActionTypes: Object.freeze([
    "brand",
    "regex:u",
    "absolute_posix_path",
    "semantic_version",
    "canonical_ijson",
    "unique_by_identity",
    "integer",
    "safe_integer",
    "min_value:finite",
    "min_length:non_negative_safe_integer",
    "readonly",
    "family_owned_check"
  ])
});

export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_BASIS_DIGEST =
  stableSha256Digest(CANONICAL_NATIVE_SCHEMA_PROJECTOR_BASIS);

interface AbgJsonSchema extends JsonSchema {
  readonly "x-abg-native-brand"?: string;
  readonly "x-abg-native-regex-flags"?: string;
  readonly "x-abg-native-check"?: string;
  readonly "x-abg-native-check-registration-digest"?: string;
  readonly "x-abg-native-relation-ref"?: string;
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
  if (!ALLOWED_SCHEMA_TYPE_SET.has(context.valibotSchema.type)) {
    throw new TypeError(
      `native contract projector: unsupported schema ${context.valibotSchema.type}`
    );
  }
  const expectedReference = expectedSchemaReference(context.valibotSchema.type);
  if (Reflect.get(context.valibotSchema, "reference") !== expectedReference) {
    throw new TypeError(
      `native contract projector: unsupported schema ${context.valibotSchema.type} reference`
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

function projectActionOverride(
  namedChecks: NativeNamedCheckResolver,
  context: OverrideActionContext
): AbgJsonSchema {
  const action = context.valibotAction;
  if (action.type === "brand") {
    if (Reflect.get(action, "reference") !== v.brand) {
      throw new TypeError(
        "native contract projector: unsupported action brand reference"
      );
    }
    const name: unknown = Reflect.get(action, "name");
    if (typeof name !== "string" || name.length === 0) {
      throw new TypeError("native contract projector: invalid type_brand");
    }
    return withExtension(context.jsonSchema, { "x-abg-native-brand": name });
  }
  if (action.type === "regex") {
    if (Reflect.get(action, "reference") !== v.regex) {
      throw new TypeError(
        "native contract projector: unsupported action regex reference"
      );
    }
    const requirement: unknown = Reflect.get(action, "requirement");
    if (!(requirement instanceof RegExp) || requirement.flags !== "u") {
      throw new TypeError(
        "native contract projector: unicode_regex requires the sole flag u"
      );
    }
    return withExtension(context.jsonSchema, {
      "x-abg-native-regex-flags": "u"
    });
  }
  if (action === ABSOLUTE_POSIX_PATH_ACTION) {
    return withExtension(context.jsonSchema, {
      "x-abg-native-check": "absolute_posix_path"
    });
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
    Reflect.get(action, "reference") === v.check &&
    Reflect.get(action, "requirement") === hasUniqueNativeIdentity
  ) {
    return {
      ...context.jsonSchema,
      "x-abg-native-check": "unique_by_identity"
    };
  }
  if (action === POSITIVE_INTEGER_ACTION || action === SAFE_INTEGER_ACTION) {
    return context.jsonSchema;
  }
  if (action === MINIMUM_ONE_ACTION) {
    return withExtension(context.jsonSchema, {
      "x-abg-native-check": "safe_positive_integer"
    });
  }
  if (
    action.type === "integer" &&
    Reflect.get(action, "reference") === v.integer
  ) {
    return context.jsonSchema;
  }
  if (
    action.type === "min_value" &&
    Reflect.get(action, "reference") === v.minValue
  ) {
    const requirement: unknown = Reflect.get(action, "requirement");
    if (typeof requirement !== "number" || !Number.isFinite(requirement)) {
      throw new TypeError(
        "native contract projector: min_value requires a finite number"
      );
    }
    return context.jsonSchema;
  }
  if (
    action.type === "min_length" &&
    Reflect.get(action, "reference") === v.minLength
  ) {
    const requirement: unknown = Reflect.get(action, "requirement");
    if (
      typeof requirement !== "number" ||
      !Number.isSafeInteger(requirement) ||
      requirement < 0
    ) {
      throw new TypeError(
        "native contract projector: min_length requires a non-negative safe integer"
      );
    }
    return context.jsonSchema;
  }
  if (
    action.type === "readonly" &&
    Reflect.get(action, "reference") === v.readonly
  ) {
    return context.jsonSchema;
  }
  if (action.type === "check") {
    const resolved = namedChecks.resolve(action);
    if (resolved !== null) {
      return {
        ...context.jsonSchema,
        "x-abg-native-check": resolved.checkRef,
        "x-abg-native-check-registration-digest":
          resolved.registrationDigest,
        ...(resolved.relationRef === null
          ? {}
          : { "x-abg-native-relation-ref": resolved.relationRef })
      };
    }
  }
  throw new TypeError(
    `native contract projector: unsupported action ${action.type}`
  );
}

function projectCanonicalNativeJsonSchemaWithResolver<
  S extends CanonicalNativeSchema
>(
  schema: S,
  namedChecks: NativeNamedCheckResolver
): JsonSchema {
  return freezeNativeValue(
    hoistIJsonDefinition(
      toJsonSchema(schema, {
        target: "draft-2020-12",
        typeMode: "ignore",
        errorMode: "throw",
        overrideSchema: projectSchemaOverride,
        overrideAction: (context) => projectActionOverride(namedChecks, context)
      })
    )
  );
}

export function projectCanonicalNativeJsonSchema<
  S extends CanonicalNativeSchema
>(
  schema: S,
  options: {
    readonly namedCheckRegistry?: NativeNamedCheckRegistry | undefined;
  } = {}
): JsonSchema {
  return projectCanonicalNativeJsonSchemaWithResolver(
    schema,
    admitNativeNamedCheckRegistry(options.namedCheckRegistry)
  );
}

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isSha256Digest(input: unknown): input is `sha256:${string}` {
  return typeof input === "string" && SHA256_DIGEST_PATTERN.test(input);
}

function collectNamedCheckBasis(
  input: unknown
): readonly NativeSchemaProjectionNamedCheck[] {
  const rows = new Map<string, NativeSchemaProjectionNamedCheck>();

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const member of value) {
        visit(member);
      }
      return;
    }
    if (typeof value !== "object" || value === null) {
      return;
    }
    const checkRef: unknown = Reflect.get(value, "x-abg-native-check");
    const registrationDigest: unknown = Reflect.get(
      value,
      "x-abg-native-check-registration-digest"
    );
    const rawRelationRef: unknown = Reflect.get(
      value,
      "x-abg-native-relation-ref"
    );
    const isNamedCheck =
      typeof checkRef === "string" && checkRef.includes("#");
    if (!isNamedCheck) {
      if (registrationDigest !== undefined || rawRelationRef !== undefined) {
        throw new TypeError(
          "native contract projector: named-check metadata lacks a check identity"
        );
      }
    } else {
      if (!NAMED_CHECK_REF_PATTERN.test(checkRef)) {
        throw new TypeError(
          "native contract projector: invalid named-check identity"
        );
      }
      if (!isSha256Digest(registrationDigest)) {
        throw new TypeError(
          "native contract projector: invalid named-check registration digest"
        );
      }
      const relationRef = rawRelationRef ?? null;
      if (
        relationRef !== null &&
        (typeof relationRef !== "string" ||
          relationRef.length === 0 ||
          /[\u0000-\u0020\u007f]/u.test(relationRef))
      ) {
        throw new TypeError(
          "native contract projector: invalid named-check relation ref"
        );
      }
      const row = freezeNativeValue({
        checkRef,
        registrationDigest,
        relationRef
      });
      const existing = rows.get(checkRef);
      if (existing !== undefined && !stableJsonEquals(existing, row)) {
        throw new TypeError(
          `native contract projector: conflicting named-check identity ${checkRef}`
        );
      }
      rows.set(checkRef, row);
    }
    for (const member of Object.values(value)) {
      visit(member);
    }
  }

  visit(input);
  return freezeNativeValue(
    [...rows.values()].sort((left, right) =>
      compareCodePoints(left.checkRef, right.checkRef)
    )
  );
}

export function deriveCanonicalNativeSchemaProjection<
  S extends CanonicalNativeSchema
>(input: {
  readonly source: ResolvedOwnerNativeContractSource<S>;
  readonly schemaRef: string;
  readonly schemaVersion: string;
}): CanonicalNativeSchemaProjection<S> {
  const unexpectedProjectionKey = Reflect.ownKeys(input).find(
    (key) =>
      key !== "source" && key !== "schemaRef" && key !== "schemaVersion"
  );
  if (unexpectedProjectionKey !== undefined) {
    throw new TypeError(
      `native contract projector: unexpected projection input ${String(unexpectedProjectionKey)}`
    );
  }
  assertExactOwnDataKeys(
    input,
    ["source", "schemaRef", "schemaVersion"],
    "native contract projection input"
  );
  const {
    schema,
    sourceLocator,
    sourceModuleDigest,
    sourceBasisDigest,
    namedCheckSource,
    namedCheckResolver
  } = resolvedOwnerNativeContractSourceState(input.source);
  const schemaRef = v.parse(contractIdSchema, input.schemaRef);
  const schemaVersion = v.parse(semanticVersionSchema, input.schemaVersion);
  const rawProjection = projectCanonicalNativeJsonSchemaWithResolver(
    schema,
    namedCheckResolver
  );
  const projectedSchema = freezeNativeValue({
    ...rawProjection,
    $id: schemaRef,
    "x-abg-native-projector-ref": CANONICAL_NATIVE_SCHEMA_PROJECTOR_REF,
    "x-abg-native-projector-version":
      CANONICAL_NATIVE_SCHEMA_PROJECTOR_VERSION,
    "x-abg-native-projector-basis-digest":
      CANONICAL_NATIVE_SCHEMA_PROJECTOR_BASIS_DIGEST
  });
  const projectionDigest = stableSha256Digest(projectedSchema);
  const witnessBasis = freezeNativeValue({
    kind: "native_schema_projection_witness" as const,
    sourceLocator,
    sourceModuleDigest,
    sourceBasisDigest,
    namedCheckSource,
    schemaRef,
    schemaVersion,
    projectorRef: CANONICAL_NATIVE_SCHEMA_PROJECTOR_REF,
    projectorVersion: CANONICAL_NATIVE_SCHEMA_PROJECTOR_VERSION,
    projectorBasisDigest: CANONICAL_NATIVE_SCHEMA_PROJECTOR_BASIS_DIGEST,
    projectionDigest,
    namedChecks: collectNamedCheckBasis(rawProjection)
  });
  const witness = freezeNativeValue({
    ...witnessBasis,
    witnessDigest: stableSha256Digest(witnessBasis)
  });
  return freezeNativeValue({ schema, projectedSchema, witness });
}
