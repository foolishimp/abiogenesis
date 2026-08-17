import { toJsonSchema, type JsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

import { canonicalJson, type JsonValue } from "./canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";
import type {
  AdmittedPublicInvocation,
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
} from "./public_invocation.js";

export const PUBLIC_FUNCTION_VERSION = "5.0.0" as const;

// Runtime schema implementations are deliberately structural here. Valibot
// supplies the current parser mechanics, but it is not part of the public
// Product contract ABI.
export interface RuntimeContractSchema<
  TInput = unknown,
  TOutput = TInput,
> {
  readonly "~types"?: Readonly<{
    readonly input: TInput;
    readonly output: TOutput;
  }> | undefined;
}

export type RuntimeContractInput<TSchema extends RuntimeContractSchema> =
  NonNullable<TSchema["~types"]>["input"];
export type RuntimeContractOutput<TSchema extends RuntimeContractSchema> =
  NonNullable<TSchema["~types"]>["output"];

export type PublicJsonSchema = Readonly<Record<string, JsonValue>>;
export type PublicAuthorityClass = "pure" | "read" | "write" | "attestation";
export type PublicEventAdmission =
  | "none"
  | "owning_semantic_authority"
  | "immutable_artifact_boundary";
export type PublicAdapterProfile = "terminal_only" | "runtime_nonterminal";
export interface PublicAdapterExitMap {
  readonly acceptedTerminal: 0;
  readonly refused: 1;
  readonly invalidInvocation: 2;
  readonly acceptedNonTerminal: 3 | null;
  readonly adapterFailure: 70;
}

export const TERMINAL_ONLY_ADAPTER_EXIT_MAP = Object.freeze({
  acceptedTerminal: 0,
  refused: 1,
  invalidInvocation: 2,
  acceptedNonTerminal: null,
  adapterFailure: 70,
} as const satisfies PublicAdapterExitMap);

export const RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP = Object.freeze({
  acceptedTerminal: 0,
  refused: 1,
  invalidInvocation: 2,
  acceptedNonTerminal: 3,
  adapterFailure: 70,
} as const satisfies PublicAdapterExitMap);
export type PublicAuthoritySlot =
  | "workspace_binding"
  | "product_set"
  | "dependency_lock"
  | "catalog_scope"
  | "execution_program"
  | "graph_function"
  | "input_contract"
  | "session_policy"
  | "capability_grants"
  | "actor"
  | "transport_steering"
  | "verification_references"
  | "execution_basis";

export const PUBLIC_AUTHORITY_SLOTS = Object.freeze([
  "workspace_binding",
  "product_set",
  "dependency_lock",
  "catalog_scope",
  "execution_program",
  "graph_function",
  "input_contract",
  "session_policy",
  "capability_grants",
  "actor",
  "transport_steering",
  "verification_references",
  "execution_basis",
] as const satisfies readonly PublicAuthoritySlot[]);

export type PublicAuthoritySlotRequirement =
  | PublicAuthoritySlot
  | Readonly<{
    readonly slot: PublicAuthoritySlot;
    readonly requiredWhen: Readonly<{
      readonly requestPath: readonly string[];
      readonly equalsAny: readonly JsonValue[];
    }>;
  }>;

export function requestDependentAuthoritySlot(
  slot: PublicAuthoritySlot,
  requestPath: readonly string[],
  equalsAny: readonly JsonValue[],
): PublicAuthoritySlotRequirement {
  return Object.freeze({
    slot,
    requiredWhen: Object.freeze({
      requestPath: Object.freeze([...requestPath]),
      equalsAny: Object.freeze([...equalsAny]),
    }),
  });
}

export function ownerAuthorityDigest(authorityRef: string): Sha256Digest {
  return sha256Canonical({ authorityRef });
}

/** @internal */
export const nonblankSchema = v.pipe(
  v.string(),
  v.regex(/\S/, "nonblank_string"),
);

/** @internal */
export const jsonPointerSchema = v.pipe(
  v.string(),
  v.regex(/^(?:\/(?:[^~/]|~[01])*)*$/, "json_pointer"),
);

/** @internal */
export const jsonPointerFragmentSchema = v.pipe(
  v.string(),
  v.regex(/^#(?:\/(?:[^~/]|~[01])*)*$/, "json_pointer_fragment"),
);

/** @internal */
export const digestSchema = v.pipe(
  v.string(),
  v.regex(/^sha256:[0-9a-f]{64}$/, "sha256_digest"),
) as v.GenericSchema<Sha256Digest, Sha256Digest>;

/** @internal */
export const absolutePathSchema = v.pipe(
  v.string(),
  v.regex(/^(?:\/|[A-Za-z]:[\\/])/, "absolute_path"),
);

/** @internal */
export const rfc3339Schema = v.pipe(
  v.string(),
  v.isoTimestamp("rfc3339_instant"),
);

/** @internal */
export const safeNonNegativeIntegerSchema = v.pipe(
  v.number(),
  v.safeInteger(),
  v.minValue(0),
);

/** @internal */
export const safePositiveIntegerSchema = v.pipe(
  v.number(),
  v.safeInteger(),
  v.minValue(1),
);

/** @internal */
export const jsonValueSchema: v.GenericSchema<JsonValue, JsonValue> = v.lazy(() =>
  v.union([
    v.null(),
    v.boolean(),
    v.pipe(v.number(), v.finite()),
    v.string(),
    v.array(jsonValueSchema),
    v.record(v.string(), jsonValueSchema),
  ])
);

function canonicalIdentity(value: unknown): string {
  return canonicalJson(value as JsonValue);
}

/** @internal */
export function uniqueArray<
  const TSchema extends v.GenericSchema,
>(item: TSchema) {
  return v.pipe(
    v.array(item),
    v.check(
      (values) =>
        new Set(values.map((value) => canonicalIdentity(value))).size ===
          values.length,
      "unique_items",
    ),
  );
}

/** @internal */
export function nonemptyUniqueArray<
  const TSchema extends v.GenericSchema,
>(item: TSchema) {
  return v.pipe(uniqueArray(item), v.minLength(1));
}

/** @internal */
export const refDigestSchema = v.strictObject({
  ref: nonblankSchema,
  digest: digestSchema,
});

/** @internal */
export const refSetSchema = uniqueArray(nonblankSchema);
/** @internal */
export const refDigestSetSchema =
  uniqueArray(refDigestSchema);
/** @internal */
export const nonemptyRefDigestSetSchema =
  nonemptyUniqueArray(refDigestSchema);

/** @internal */
export const noResidualsSchema = v.pipe(
  v.array(v.never()),
  v.length(0),
);

/** @internal */
export const contractBoundValueSchema = v.strictObject({
  contract: refDigestSchema,
  valueRef: nonblankSchema,
  valueDigest: digestSchema,
  value: jsonValueSchema,
});

/** @internal */
export const typedResidualSchema = v.strictObject({
  kind: v.literal("typed_residual"),
  code: nonblankSchema,
  subjectRef: nonblankSchema,
  message: nonblankSchema,
});

/** @internal */
export const typedResidualSetSchema = uniqueArray(typedResidualSchema);
/** @internal */
export const nonemptyTypedResidualSetSchema =
  nonemptyUniqueArray(typedResidualSchema);

const externalRelationOriginSchema = v.union([
  v.strictObject({
    kind: v.literal("import_declaration"),
    clause: v.picklist(["side_effect", "default", "named", "namespace"]),
    declarationTypeOnly: v.boolean(),
    specifierTypeOnly: v.boolean(),
  }),
  v.strictObject({
    kind: v.literal("export_declaration"),
    clause: v.picklist(["named", "star", "namespace"]),
    declarationTypeOnly: v.boolean(),
    specifierTypeOnly: v.boolean(),
  }),
  v.strictObject({
    kind: v.literal("import_type_expression"),
    operator: v.picklist(["type", "typeof"]),
  }),
  v.strictObject({ kind: v.literal("import_equals_declaration") }),
  v.strictObject({ kind: v.literal("type_reference_directive") }),
  v.strictObject({ kind: v.literal("module_augmentation") }),
]);

const externalSelectionSchema = v.union([
  v.strictObject({ kind: v.literal("module") }),
  v.strictObject({
    kind: v.literal("name"),
    targetName: nonblankSchema,
    exposedName: nonblankSchema,
  }),
  v.strictObject({ kind: v.literal("namespace"), exposedName: nonblankSchema }),
  v.strictObject({ kind: v.literal("all") }),
]);

/** @internal */
export const contractIndexedPendingExternalSelectorSchema = v.strictObject({
  selectorRef: digestSchema,
  sourceProductContentDigest: digestSchema,
  sourceContractRef: nonblankSchema,
  sourceContractDigest: digestSchema,
  sourcePackageExportPath: nonblankSchema,
  sourceNamedSymbol: nonblankSchema,
  physicalRelationRef: nonblankSchema,
  externalPackageName: nonblankSchema,
  externalModuleSpecifier: nonblankSchema,
  origin: externalRelationOriginSchema,
  selection: externalSelectionSchema,
  localAccessPath: v.pipe(v.array(nonblankSchema), v.minLength(1)),
});

/** @internal */
export const publicDefinitionKeySchema = v.strictObject({
  operationId: nonblankSchema,
  memberKey: nonblankSchema,
});

/** @internal */
export const publicContractCatalogCoordinateSchema =
  v.strictObject({
    productId: nonblankSchema,
    productContentDigest: digestSchema,
    catalogId: nonblankSchema,
    catalogVersion: v.literal(PUBLIC_FUNCTION_VERSION),
    catalogDigest: digestSchema,
  });

/** @internal */
export const publicContractCoordinateSchema =
  v.strictObject({
    contractCatalog: publicContractCatalogCoordinateSchema,
    flatRow: v.strictObject({
      contractId: nonblankSchema,
      contractVersion: v.literal(PUBLIC_FUNCTION_VERSION),
      contractDigest: digestSchema,
    }),
    nestedSelector: v.union([
      v.strictObject({
        selectorKind: v.literal("flat_contract"),
        definitionKey: v.null(),
        slot: v.null(),
        definitionRef: v.null(),
      }),
      v.strictObject({
        selectorKind: v.literal("operation_definition_slot"),
        definitionKey: publicDefinitionKeySchema,
        slot: v.picklist(["request", "result", "refusal", "non_terminal"]),
        definitionRef: jsonPointerFragmentSchema,
      }),
      v.strictObject({
        selectorKind: v.literal("schema_definition"),
        definitionKey: v.null(),
        slot: v.null(),
        definitionRef: jsonPointerFragmentSchema,
      }),
    ]),
  });

/** @internal */
export const definitionContractCoordinateSetSchema =
  v.strictObject({
    request: publicContractCoordinateSchema,
    result: publicContractCoordinateSchema,
    refusal: publicContractCoordinateSchema,
    nonTerminal: v.nullable(publicContractCoordinateSchema),
  });

/** @internal */
export const definitionContractCoordinateMemberSchema = v.strictObject({
  memberKey: nonblankSchema,
  slots: definitionContractCoordinateSetSchema,
});

/** @internal */
export const definitionContractCoordinateOperationSchema = v.strictObject({
  operationId: nonblankSchema,
  members: nonemptyUniqueArray(definitionContractCoordinateMemberSchema),
});

// This carrier is nested by operation then member. It has no string-indexed
// escape hatch. Exact family completeness is established by the Product-owned
// relation below because the declared artifact family, rather than this shared
// structural schema or a caller-supplied expected set, owns the member set.
/** @internal */
export const completeDefinitionContractCoordinateMapSchema = v.strictObject({
  operations: nonemptyUniqueArray(definitionContractCoordinateOperationSchema),
});

/** @internal */
export const sourceBasisSchema = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({
    kind: v.literal("admitted_source_result"),
    projectionAuthority: refDigestSchema,
    sourceResult: refDigestSchema,
  }),
]);

/** @internal */
export const replayPageSchema = v.strictObject({
  kind: v.literal("ordinal_page"),
  fromOrdinal: safeNonNegativeIntegerSchema,
  limit: safePositiveIntegerSchema,
});

/** @internal */
export function refusalSchema<const TCodes extends readonly [
  string,
  ...string[],
]>(codes: TCodes) {
  return v.strictObject({
    code: v.picklist(codes),
    issuePaths: uniqueArray(jsonPointerSchema),
    evidenceRefs: refSetSchema,
  });
}

/** @internal */
export function resultWithEvidence<
  const TEntries extends Readonly<Record<string, v.GenericSchema>>,
>(entries: TEntries) {
  return v.strictObject({
    ...entries,
    evidence: refDigestSetSchema,
  });
}

export interface OwnerContractSourceDeclaration<
  TDefinitionKey extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
  TRequestSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TResultSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TRefusalSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TNonTerminalSchema extends RuntimeContractSchema | null =
    RuntimeContractSchema | null,
> {
  readonly definitionKey: TDefinitionKey;
  readonly requestSchema: TRequestSchema;
  readonly resultSchema: TResultSchema;
  readonly refusalSchema: TRefusalSchema;
  readonly nonTerminalSchema: TNonTerminalSchema;
  readonly owner: Readonly<{
    abstractModule: string;
    exportName: string;
    memberPath: readonly string[];
    authorityRef: string;
    authorityDigest: `sha256:${string}`;
  }>;
  readonly contractIds: Readonly<{
    request: string;
    result: string;
    refusal: string;
    nonTerminal: string | null;
  }>;
  readonly metadata: Readonly<{
    authorityClass: PublicAuthorityClass;
    effectClass: string;
    eventAdmission: PublicEventAdmission;
    actorRequirement: "forbidden" | "required";
    workspaceBindingRequirement: "forbidden" | "exactly_one";
    authoritySlotRequirements: readonly PublicAuthoritySlotRequirement[];
    capabilityRefs: readonly string[];
    defaults: Readonly<Record<string, JsonValue>>;
    closedDomains: Readonly<Record<string, readonly JsonValue[]>>;
    sdkCoordinate: string;
    cliCoordinate: string;
    adapterExitMap: PublicAdapterExitMap;
  }>;
}

export interface CompleteDefinitionContractCoordinateMap {
  readonly operations: readonly Readonly<{
    readonly operationId: string;
    readonly members: readonly Readonly<{
      readonly memberKey: string;
      readonly slots: Readonly<{
        readonly request: PublicContractCoordinate;
        readonly result: PublicContractCoordinate;
        readonly refusal: PublicContractCoordinate;
        readonly nonTerminal: PublicContractCoordinate | null;
      }>;
    }>[];
  }>[];
}

export type OwnerDefinitionMetadata = OwnerContractSourceDeclaration["metadata"] &
  Readonly<{
    readonly ownerAuthorityRef: string;
    readonly ownerAuthorityDigest: `sha256:${string}`;
  }>;

export interface OwnerContractSchemas<
  TRequestSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TResultSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TRefusalSchema extends RuntimeContractSchema = RuntimeContractSchema,
  TNonTerminalSchema extends RuntimeContractSchema | null =
    RuntimeContractSchema | null,
> {
  readonly request: TRequestSchema;
  readonly result: TResultSchema;
  readonly refusal: TRefusalSchema;
  readonly nonTerminal: TNonTerminalSchema;
}

export type OwnerRequestOf<TPacket extends OwnerContractSourceDeclaration> =
  RuntimeContractOutput<TPacket["requestSchema"]>;
export type OwnerResultOf<TPacket extends OwnerContractSourceDeclaration> =
  RuntimeContractOutput<TPacket["resultSchema"]>;
export type OwnerRefusalOf<TPacket extends OwnerContractSourceDeclaration> =
  RuntimeContractOutput<TPacket["refusalSchema"]>;
export type OwnerNonTerminalOf<TPacket extends OwnerContractSourceDeclaration> =
  TPacket["nonTerminalSchema"] extends RuntimeContractSchema
    ? RuntimeContractOutput<TPacket["nonTerminalSchema"]>
    : never;

export type OwnerSemanticOutput<TPacket extends OwnerContractSourceDeclaration> =
  | Readonly<{
    outcomeKind: "result";
    value: OwnerResultOf<TPacket>;
  }>
  | Readonly<{
    outcomeKind: "refusal";
    value: OwnerRefusalOf<TPacket>;
  }>
  | (OwnerNonTerminalOf<TPacket> extends never ? never
    : Readonly<{
      outcomeKind: "nonterminal";
      value: OwnerNonTerminalOf<TPacket>;
    }>);

export type ExactOwnerOperationPort<TPacket extends OwnerContractSourceDeclaration> = (
  invocation: AdmittedPublicInvocation<
    TPacket["definitionKey"],
    OwnerRequestOf<TPacket> & Readonly<Record<string, JsonValue>>
  >,
) => OwnerSemanticOutput<TPacket> | Promise<OwnerSemanticOutput<TPacket>>;

function requirementSlot(
  requirement: PublicAuthoritySlotRequirement,
): PublicAuthoritySlot {
  return typeof requirement === "string" ? requirement : requirement.slot;
}

function assertMetadata(
  metadata: OwnerContractSourceDeclaration["metadata"],
): void {
  const slots = metadata.authoritySlotRequirements.map(requirementSlot);
  if (
    slots.length !== new Set(slots).size ||
    !slots.includes("capability_grants") ||
    metadata.capabilityRefs.length === 0 ||
    metadata.capabilityRefs.length !== new Set(metadata.capabilityRefs).size ||
    metadata.sdkCoordinate.trim().length === 0 ||
    metadata.cliCoordinate.trim().length === 0 ||
    (metadata.actorRequirement === "required") !== slots.includes("actor") ||
    (metadata.workspaceBindingRequirement === "exactly_one") !==
      slots.includes("workspace_binding")
  ) {
    throw new TypeError("owner metadata authority requirements are incoherent");
  }
}

export function ownerContractPacket<
  const TDefinitionKey extends PublicDefinitionKeyLike,
  const TRequestSchema extends RuntimeContractSchema,
  const TResultSchema extends RuntimeContractSchema,
  const TRefusalSchema extends RuntimeContractSchema,
  const TNonTerminalSchema extends RuntimeContractSchema | null,
>(
  definitionKey: TDefinitionKey,
  requestSchema: TRequestSchema,
  resultSchema: TResultSchema,
  refusal: TRefusalSchema,
  nonTerminalSchema: TNonTerminalSchema,
  owner: OwnerContractSourceDeclaration["owner"],
  metadata: OwnerContractSourceDeclaration["metadata"],
): OwnerContractSourceDeclaration<
  TDefinitionKey,
  RuntimeContractSchema<
    RuntimeContractInput<TRequestSchema>,
    RuntimeContractOutput<TRequestSchema>
  >,
  RuntimeContractSchema<
    RuntimeContractInput<TResultSchema>,
    RuntimeContractOutput<TResultSchema>
  >,
  RuntimeContractSchema<
    RuntimeContractInput<TRefusalSchema>,
    RuntimeContractOutput<TRefusalSchema>
  >,
  TNonTerminalSchema extends RuntimeContractSchema
    ? RuntimeContractSchema<
      RuntimeContractInput<TNonTerminalSchema>,
      RuntimeContractOutput<TNonTerminalSchema>
    >
    : null
> {
  assertMetadata(metadata);
  const namespace = owner.abstractModule
    .replaceAll(".", "/")
    .replaceAll("_", "-")
    .toLowerCase();
  const member = owner.memberPath
    .map((part) => part.replaceAll("_", "-"))
    .join("/");
  const contractBase = `contract://abiogenesis/${namespace}/${member}`;
  return Object.freeze({
    definitionKey: Object.freeze({ ...definitionKey }),
    requestSchema,
    resultSchema,
    refusalSchema: refusal,
    nonTerminalSchema,
    owner: Object.freeze({ ...owner }),
    contractIds: Object.freeze({
      request: `${contractBase}/request@5`,
      result: `${contractBase}/result@5`,
      refusal: `${contractBase}/refusal@5`,
      nonTerminal: nonTerminalSchema === null
        ? null
        : `${contractBase}/non-terminal@5`,
    }),
    metadata: ownerMetadata(metadata),
  }) as unknown as OwnerContractSourceDeclaration<
    TDefinitionKey,
    RuntimeContractSchema<
      RuntimeContractInput<TRequestSchema>,
      RuntimeContractOutput<TRequestSchema>
    >,
    RuntimeContractSchema<
      RuntimeContractInput<TResultSchema>,
      RuntimeContractOutput<TResultSchema>
    >,
    RuntimeContractSchema<
      RuntimeContractInput<TRefusalSchema>,
      RuntimeContractOutput<TRefusalSchema>
    >,
    TNonTerminalSchema extends RuntimeContractSchema
      ? RuntimeContractSchema<
        RuntimeContractInput<TNonTerminalSchema>,
        RuntimeContractOutput<TNonTerminalSchema>
      >
      : null
  >;
}

export function ownerMetadata(
  input: OwnerContractSourceDeclaration["metadata"],
): OwnerContractSourceDeclaration["metadata"] {
  assertMetadata(input);
  return Object.freeze({
    ...input,
    authoritySlotRequirements: Object.freeze(
      input.authoritySlotRequirements.map((requirement) =>
        typeof requirement === "string"
          ? requirement
          : requestDependentAuthoritySlot(
            requirement.slot,
            requirement.requiredWhen.requestPath,
            requirement.requiredWhen.equalsAny,
          )
      ),
    ),
    capabilityRefs: Object.freeze([...input.capabilityRefs]),
    defaults: Object.freeze({ ...input.defaults }),
    closedDomains: Object.freeze(Object.fromEntries(
      Object.entries(input.closedDomains).map(([key, values]) => [
        key,
        Object.freeze([...values]),
      ]),
    )),
    adapterExitMap: Object.freeze({ ...input.adapterExitMap }),
  });
}

export function contractSchemaEntries(
  schema: RuntimeContractSchema,
): Readonly<Record<string, RuntimeContractSchema>> {
  const entries = (
    schema as RuntimeContractSchema & Readonly<{
      readonly entries?: Readonly<Record<string, RuntimeContractSchema>>;
    }>
  ).entries;
  if (entries === undefined) {
    throw new TypeError("runtime contract schema has no object entries");
  }
  return entries;
}

export type RuntimeContractAdmission =
  | Readonly<{ disposition: "admitted"; value: unknown }>
  | Readonly<{ disposition: "refused"; issuePaths: readonly string[] }>;

export function admitRuntimeContract(
  schema: RuntimeContractSchema,
  candidate: unknown,
): RuntimeContractAdmission {
  const result = v.safeParse(schema as v.GenericSchema, candidate, {
    abortPipeEarly: true,
  });
  if (result.success) {
    return Object.freeze({ disposition: "admitted" as const, value: result.output });
  }
  return Object.freeze({
    disposition: "refused" as const,
    issuePaths: Object.freeze([...new Set(result.issues.map((issue) => {
      const path = issue.path?.map((entry) => String(entry.key)) ?? [];
      return `/${path.join("/")}`;
    }))].sort()),
  });
}

export function projectStrictJsonSchema(
  schema: RuntimeContractSchema,
): PublicJsonSchema {
  const projected = toJsonSchema(schema as v.GenericSchema, {
    target: "draft-2020-12",
    overrideAction: ({ valibotAction, jsonSchema }) => {
      // I-JSON excludes non-finite numbers at the native admission boundary;
      // JSON Schema numbers are already limited to JSON-representable values.
      if (valibotAction.type === "finite") return jsonSchema;
      const message = (
        valibotAction as Readonly<{ readonly message?: unknown }>
      ).message;
      if (
        valibotAction.type === "check" &&
        (message === "unique_items" || message === "rfc3339_instant")
      ) {
        return message === "unique_items"
          ? { ...jsonSchema, uniqueItems: true }
          : { ...jsonSchema, format: "date-time" };
      }
      return undefined;
    },
  }) as PublicJsonSchema;
  return normalizeGeneratedDefinitionRefs(projected);
}

function normalizeGeneratedDefinitionRefs(
  schema: PublicJsonSchema,
): PublicJsonSchema {
  const definitions = schema.$defs;
  if (
    typeof definitions !== "object" ||
    definitions === null ||
    Array.isArray(definitions)
  ) return schema;
  const sourceDefinitions = definitions as Readonly<Record<string, JsonValue>>;
  const assigned = new Map<string, string>();
  const pending: string[] = [];
  const assign = (sourceKey: string): void => {
    if (!Object.hasOwn(sourceDefinitions, sourceKey) || assigned.has(sourceKey)) {
      return;
    }
    assigned.set(sourceKey, `d${assigned.size}`);
    pending.push(sourceKey);
  };
  const visit = (value: JsonValue): void => {
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    if (typeof value !== "object" || value === null) return;
    const record = value as Readonly<Record<string, JsonValue>>;
    const reference = record.$ref;
    if (typeof reference === "string") {
      const match = /^#\/\$defs\/([^/]+)$/u.exec(reference);
      if (match !== null) assign(match[1]!);
    }
    for (const key of Object.keys(record).sort()) {
      if (key !== "$defs") visit(record[key]!);
    }
  };
  const rootWithoutDefinitions = Object.fromEntries(
    Object.entries(schema).filter(([key]) => key !== "$defs"),
  ) as JsonValue;
  visit(rootWithoutDefinitions);
  for (let index = 0; index < pending.length; index += 1) {
    visit(sourceDefinitions[pending[index]!]!);
  }
  const neutral = (value: JsonValue): JsonValue => {
    if (Array.isArray(value)) return value.map(neutral);
    if (typeof value !== "object" || value === null) return value;
    const record = value as Readonly<Record<string, JsonValue>>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [
      key,
      key === "$ref" &&
          typeof record[key] === "string" &&
          /^#\/\$defs\/[^/]+$/u.test(record[key])
        ? "#/$defs/_"
        : neutral(record[key]!),
    ])) as JsonValue;
  };
  const remaining = Object.keys(sourceDefinitions)
    .filter((key) => !assigned.has(key))
    .sort((left, right) => {
      const leftProjection = canonicalJson(neutral(sourceDefinitions[left]!));
      const rightProjection = canonicalJson(neutral(sourceDefinitions[right]!));
      return leftProjection < rightProjection
        ? -1
        : leftProjection > rightProjection
        ? 1
        : 0;
    });
  for (const key of remaining) assign(key);

  const rewrite = (value: JsonValue): JsonValue => {
    if (Array.isArray(value)) return value.map(rewrite);
    if (typeof value !== "object" || value === null) return value;
    const record = value as Readonly<Record<string, JsonValue>>;
    return Object.fromEntries(Object.entries(record).map(([key, child]) => {
      if (key === "$ref" && typeof child === "string") {
        const match = /^#\/\$defs\/([^/]+)$/u.exec(child);
        const replacement = match === null ? undefined : assigned.get(match[1]!);
        if (replacement !== undefined) return [key, `#/$defs/${replacement}`];
      }
      return [key, rewrite(child)];
    })) as JsonValue;
  };
  const normalizedDefinitions = Object.fromEntries(
    [...assigned.entries()].map(([sourceKey, targetKey]) => [
      targetKey,
      rewrite(sourceDefinitions[sourceKey]!),
    ]),
  );
  return {
    ...(rewrite(rootWithoutDefinitions) as PublicJsonSchema),
    $defs: normalizedDefinitions,
  };
}
