import {
  toJsonSchema,
  type JsonSchema,
  type OverrideActionContext,
  type OverrideSchemaContext
} from "@valibot/to-json-schema";
import * as v from "valibot";

import {
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

export interface NativeSchemaProjectionNamedCheck {
  readonly checkRef: string;
  readonly registrationDigest: `sha256:${string}`;
  readonly relationRef: string | null;
}

export interface NativeSchemaProjectionWitness {
  readonly kind: "native_schema_projection_witness";
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly schemaRef: string;
  readonly schemaVersion: string;
  readonly projectorRef: string;
  readonly projectorVersion: string;
  readonly projectorBasisDigest: `sha256:${string}`;
  readonly projectionDigest: `sha256:${string}`;
  readonly namedChecks: readonly NativeSchemaProjectionNamedCheck[];
  readonly witnessDigest: `sha256:${string}`;
}

export interface CanonicalNativeSchemaProjection {
  readonly projectedSchema: JsonSchema;
  readonly witness: NativeSchemaProjectionWitness;
}

export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_REF =
  "projector://abg/native-schema/valibot-json-schema";
export const CANONICAL_NATIVE_SCHEMA_PROJECTOR_VERSION = "1.1.0";
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
    case "array": return v.array;
    case "boolean": return v.boolean;
    case "literal": return v.literal;
    case "null": return v.null_;
    case "nullable": return v.nullable;
    case "number": return v.number;
    case "picklist": return v.picklist;
    case "strict_object": return v.strictObject;
    case "string": return v.string;
    case "tuple": return v.tuple;
    case "union": return v.union;
    case "unknown": return v.unknown;
    default: return undefined;
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
  namedCheckPolicy: "exact-action-invocation-local-registry-v1",
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

export function projectCanonicalNativeJsonSchema<
  S extends CanonicalNativeSchema
>(
  schema: S,
  options: {
    readonly namedCheckRegistry?: NativeNamedCheckRegistry | undefined;
  } = {}
): JsonSchema {
  const namedChecks = admitNativeNamedCheckRegistry(options.namedCheckRegistry);
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
  readonly schema: S;
  readonly schemaRef: string;
  readonly schemaVersion: string;
  readonly sourceLocator: PrivateNativeSchemaSourceLocator;
  readonly namedCheckRegistry?: NativeNamedCheckRegistry | undefined;
}): CanonicalNativeSchemaProjection {
  const sourceLocator = freezeNativeValue(
    v.parse(privateNativeSchemaSourceLocatorSchema, input.sourceLocator)
  );
  const schemaRef = v.parse(contractIdSchema, input.schemaRef);
  const schemaVersion = v.parse(semanticVersionSchema, input.schemaVersion);
  const rawProjection = projectCanonicalNativeJsonSchema(input.schema, {
    namedCheckRegistry: input.namedCheckRegistry
  });
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
  return freezeNativeValue({ projectedSchema, witness });
}
