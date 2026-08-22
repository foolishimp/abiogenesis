import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "./canonical_json.js";
import {
  projectStrictJsonSchema,
  type RuntimeContractSchema,
} from "./public_function_contracts.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
  type IntrinsicPublicFunctionDefinition,
  type IntrinsicPublicFunctionFamilyCoordinate,
} from "./public_function_family.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "./digests.js";
import { deepFreeze } from "./immutable.js";

export const S06_COMMON_PUBLIC_CONTRACT_IDS = Object.freeze([
  "abg.schema.public-operation-contract",
  "abg.schema.public-operation-invocation",
  "abg.schema.public-operation-outcome",
] as const);

const PUBLIC_SCHEMA_PATH = "contracts/schemas/public-operation.schema.json";
const PUBLIC_ADAPTER_PATH =
  "contracts/public-functions/adapter-projection.json";

const AUTHORITY_SLOTS = Object.freeze([
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
] as const);

type PublicOperationSchemaSlots = Readonly<{
  readonly request: RuntimeContractSchema;
  readonly result: RuntimeContractSchema;
  readonly refusal: RuntimeContractSchema;
  readonly nonTerminal: RuntimeContractSchema | null;
}>;

export type PublicOperationSchemaMap = Readonly<Record<
  string,
  Readonly<Record<string, PublicOperationSchemaSlots>>
>>;

export interface PublicProjectionAsset {
  readonly assetKind:
    | "common_public_schema"
    | "operation_slot_schema"
    | "operation_contract_projection"
    | "adapter_projection";
  readonly path: string;
  readonly mediaType: "application/json" | "application/schema+json";
  readonly schemaVersion: "5.0.0";
  readonly content: JsonValue;
  readonly bytes: string;
  readonly contentDigest: Sha256Digest;
  readonly operationId: string | null;
  readonly slot: "request" | "result" | "refusal" | "non_terminal" | null;
}

export interface PublicSdkMemberProjection {
  readonly definitionKey: Readonly<{ operationId: string; memberKey: string }>;
  readonly definitionRef: string;
  readonly sdkCoordinate: string;
  readonly requestSchemaCoordinate: string;
  readonly resultSchemaCoordinate: string;
  readonly refusalSchemaCoordinate: string;
  readonly nonTerminalSchemaCoordinate: string | null;
}

export interface PublicCliGrammarProjection {
  readonly definitionKey: Readonly<{ operationId: string; memberKey: string }>;
  readonly cliCoordinate: string;
  readonly adapterExitMap: IntrinsicPublicFunctionDefinition["adapterExitMap"];
}

export interface PublicDocumentationInventoryRow {
  readonly definitionKey: Readonly<{ operationId: string; memberKey: string }>;
  readonly definitionRef: string;
  readonly definitionDigest: Sha256Digest;
  readonly semanticAuthorityRef: string;
  readonly capabilityRefs: readonly string[];
  readonly successorDevelopmentPrebindingAuthority?: "eligible";
  readonly sdkCoordinate: string;
  readonly cliCoordinate: string;
}

export interface PublicProjectionPayloads {
  readonly family: IntrinsicPublicFunctionFamilyCoordinate;
  readonly nativeSchemas: PublicOperationSchemaMap;
  readonly commonSchemaAsset: PublicProjectionAsset;
  readonly operationSchemaAssets: readonly PublicProjectionAsset[];
  readonly operationContractAssets: readonly PublicProjectionAsset[];
  readonly adapterAsset: PublicProjectionAsset;
  readonly assets: readonly PublicProjectionAsset[];
  readonly sdkMembers: readonly PublicSdkMemberProjection[];
  readonly cliGrammar: readonly PublicCliGrammarProjection[];
  readonly documentationInventory: readonly PublicDocumentationInventoryRow[];
  readonly projectionDigest: Sha256Digest;
}

function exactObject(
  properties: Readonly<Record<string, JsonValue>>,
  required: readonly string[] = Object.keys(properties),
): JsonValue {
  return {
    type: "object",
    additionalProperties: false,
    required: [...required],
    properties,
  };
}

const nonblankSchema = Object.freeze({ type: "string", pattern: "\\S" });
const digestSchema = Object.freeze({
  type: "string",
  pattern: "^sha256:[0-9a-f]{64}$",
});
const jsonPointerSchema = Object.freeze({
  type: "string",
  pattern: "^#(?:/(?:[^~/]|~[01])*)*$",
});
const referenceDigestSchema = exactObject({
  ref: nonblankSchema,
  digest: digestSchema,
});
const publicDefinitionKeySchema = exactObject({
  operationId: nonblankSchema,
  memberKey: nonblankSchema,
});
const publicCatalogCoordinateSchema = exactObject({
  productId: nonblankSchema,
  productContentDigest: digestSchema,
  catalogId: nonblankSchema,
  catalogVersion: { const: "5.0.0" },
  catalogDigest: digestSchema,
});
const publicContractCoordinateSchema = exactObject({
  contractCatalog: publicCatalogCoordinateSchema,
  flatRow: exactObject({
    contractId: nonblankSchema,
    contractVersion: { const: "5.0.0" },
    contractDigest: digestSchema,
  }),
  nestedSelector: {
    oneOf: [
      exactObject({
        selectorKind: { const: "flat_contract" },
        definitionKey: { type: "null" },
        slot: { type: "null" },
        definitionRef: { type: "null" },
      }),
      exactObject({
        selectorKind: { const: "operation_definition_slot" },
        definitionKey: publicDefinitionKeySchema,
        slot: { enum: ["request", "result", "refusal", "non_terminal"] },
        definitionRef: jsonPointerSchema,
      }),
      exactObject({
        selectorKind: { const: "schema_definition" },
        definitionKey: { type: "null" },
        slot: { type: "null" },
        definitionRef: jsonPointerSchema,
      }),
    ],
  },
});
const exactOwnerMemberCoordinateSchema = exactObject({
  abstractModule: nonblankSchema,
  exportName: nonblankSchema,
  memberPath: {
    type: "array",
    minItems: 1,
    items: nonblankSchema,
  },
  sourceModuleDigest: digestSchema,
  memberDigest: digestSchema,
});

function definitionKeySchema(
  definition: IntrinsicPublicFunctionDefinition,
): JsonValue {
  return exactObject({
    operationId: { const: definition.definitionKey.operationId },
    memberKey: { const: definition.definitionKey.memberKey },
  });
}

function authorityValueSchema(
  slot: (typeof AUTHORITY_SLOTS)[number],
  definition: IntrinsicPublicFunctionDefinition,
): JsonValue {
  switch (slot) {
    case "product_set":
      return { type: "array", minItems: 1, uniqueItems: true, items: referenceDigestSchema };
    case "catalog_scope":
      return {
        oneOf: [
          referenceDigestSchema,
          exactObject({
            catalog: referenceDigestSchema,
            view: referenceDigestSchema,
            allowlist: { type: "array", uniqueItems: true, items: nonblankSchema },
          }),
        ],
      };
    case "graph_function":
      return exactObject({
        graphFunction: referenceDigestSchema,
        membership: referenceDigestSchema,
      });
    case "input_contract":
      return exactObject({
        contract: referenceDigestSchema,
        valueRef: nonblankSchema,
        valueDigest: digestSchema,
        value: {},
      });
    case "capability_grants":
      return exactObject({
        requiredCapabilityRefs: { const: definition.capabilityRefs },
        grants: {
          type: "array",
          minItems: 1,
          uniqueItems: true,
          items: referenceDigestSchema,
        },
      });
    case "actor":
      return exactObject({
        actor: referenceDigestSchema,
        attribution: referenceDigestSchema,
      });
    case "verification_references":
      return {
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: exactObject({
          invocation: referenceDigestSchema,
          outcome: referenceDigestSchema,
        }),
      };
    default:
      return referenceDigestSchema;
  }
}

function requestCondition(path: readonly string[], equalsAny: readonly JsonValue[]): JsonValue {
  const [head, ...tail] = path;
  if (head === undefined) return { enum: [...equalsAny] };
  return {
    type: "object",
    required: [head],
    properties: {
      [head]: tail.length === 0
        ? { enum: [...equalsAny] }
        : requestCondition(tail, equalsAny),
    },
  };
}

function invocationAuthoritySchema(
  definition: IntrinsicPublicFunctionDefinition,
): Readonly<{ schema: JsonValue; conditionals: readonly JsonValue[] }> {
  const required = new Set<string>(["capability_grants"]);
  if (definition.actorRequirement === "required") required.add("actor");
  if (definition.workspaceBindingRequirement === "exactly_one") {
    required.add("workspace_binding");
  }
  const conditionals = definition.authoritySlotRequirements.filter(
    (requirement) => typeof requirement !== "string",
  );
  for (const requirement of definition.authoritySlotRequirements) {
    if (typeof requirement === "string") required.add(requirement);
  }
  const conditionalSlots = new Set(conditionals.map(({ slot }) => slot));
  const slotProperties = Object.fromEntries(AUTHORITY_SLOTS.map((slot) => [
    slot,
    required.has(slot)
      ? authorityValueSchema(slot, definition)
      : conditionalSlots.has(slot)
      ? { oneOf: [authorityValueSchema(slot, definition), { type: "null" }] }
      : { type: "null" },
  ])) as Readonly<Record<string, JsonValue>>;
  const conditionalSchemas = conditionals.map((requirement) => ({
    if: {
      properties: {
        request: requestCondition(
          requirement.requiredWhen.requestPath,
          requirement.requiredWhen.equalsAny,
        ),
      },
      required: ["request"],
    },
    then: {
      properties: {
        invocationAuthority: {
          properties: {
            slots: {
              properties: {
                [requirement.slot]: authorityValueSchema(
                  requirement.slot,
                  definition,
                ),
              },
            },
          },
        },
      },
    },
    else: {
      properties: {
        invocationAuthority: {
          properties: {
            slots: {
              properties: { [requirement.slot]: { type: "null" } },
            },
          },
        },
      },
    },
  } as JsonValue));
  return {
    schema: exactObject({
      kind: { const: "invocation_authority" },
      definitionKey: definitionKeySchema(definition),
      authorityDigest: digestSchema,
      slots: exactObject(slotProperties, AUTHORITY_SLOTS),
    }),
    conditionals: conditionalSchemas,
  };
}

function admissionFailureClasses(
  definition: IntrinsicPublicFunctionDefinition,
): readonly string[] {
  const values = new Set([
    "invalid_request",
    "contract_catalog_mismatch",
    "authority_mismatch",
    definition.workspaceBindingRequirement === "exactly_one"
      ? "binding_missing"
      : "binding_forbidden",
  ]);
  if (definition.workspaceBindingRequirement === "exactly_one") {
    values.add("binding_mismatch");
  }
  if (definition.actorRequirement === "required") values.add("actor_missing");
  if (definition.capabilityRefs.length > 0) values.add("capability_missing");
  if (definition.authoritySlotRequirements.some((requirement) =>
    typeof requirement === "string"
      ? requirement === "catalog_scope"
      : requirement.slot === "catalog_scope"
  )) values.add("catalog_scope_mismatch");
  return [...values].sort(compareUnicodeCodeUnits);
}

function invocationEnvelopeBranch(
  definition: IntrinsicPublicFunctionDefinition,
): JsonValue {
  return exactObject({
    kind: { const: "public_invocation_candidate" },
    schemaVersion: { const: "5.0.0" },
    envelopeContract: publicContractCoordinateSchema,
    operationIdentity: { const: definition.definitionKey.operationId },
    memberIdentity: { const: definition.definitionKey.memberKey },
    correlationRef: nonblankSchema,
    eventTime: { type: "string", format: "date-time" },
    requestCandidate: projectStrictJsonSchema(definition.requestContract.schema),
  });
}

function admittedInvocationBranch(
  definition: IntrinsicPublicFunctionDefinition,
): JsonValue {
  const authority = invocationAuthoritySchema(definition);
  const schema = exactObject({
    kind: { const: "public_invocation" },
    schemaVersion: { const: "5.0.0" },
    invocationContract: publicContractCoordinateSchema,
    invocationRef: nonblankSchema,
    invocationDigest: digestSchema,
    definitionRef: { const: definition.definitionRef },
    definitionVersion: { const: "5.0.0" },
    definitionDigest: { const: definition.definitionDigest },
    definitionKey: definitionKeySchema(definition),
    contractCatalog: publicCatalogCoordinateSchema,
    invocationAuthority: authority.schema,
    requestContract: publicContractCoordinateSchema,
    requestRef: nonblankSchema,
    requestDigest: digestSchema,
    request: projectStrictJsonSchema(definition.requestContract.schema),
    expectedResultContract: publicContractCoordinateSchema,
    expectedRefusalContract: publicContractCoordinateSchema,
    expectedNonTerminalContract: definition.nonTerminalContract === null
      ? { type: "null" }
      : publicContractCoordinateSchema,
    correlationRef: nonblankSchema,
    eventTime: { type: "string", format: "date-time" },
    provenanceRefs: {
      type: "array",
      uniqueItems: true,
      items: nonblankSchema,
    },
  }) as Readonly<Record<string, JsonValue>>;
  return authority.conditionals.length === 0
    ? schema
    : { ...schema, allOf: authority.conditionals } as JsonValue;
}

function indexedRefusalBranch(
  definition: IntrinsicPublicFunctionDefinition,
): JsonValue {
  return exactObject({
    kind: { const: "indexed_invocation_admission_refusal" },
    schemaVersion: { const: "5.0.0" },
    admissionRefusalContract: publicContractCoordinateSchema,
    refusalRef: nonblankSchema,
    refusalDigest: digestSchema,
    attemptRef: nonblankSchema,
    attemptDigest: digestSchema,
    candidateDigest: digestSchema,
    definitionRef: { const: definition.definitionRef },
    definitionVersion: { const: "5.0.0" },
    definitionDigest: { const: definition.definitionDigest },
    definitionKey: definitionKeySchema(definition),
    contractCatalog: publicCatalogCoordinateSchema,
    correlationRef: nonblankSchema,
    failureClass: { enum: admissionFailureClasses(definition) },
    issuePaths: { type: "array", uniqueItems: true, items: jsonPointerSchema },
    evidenceRefs: { type: "array", uniqueItems: true, items: nonblankSchema },
  });
}

function publicInvocationDefinitions(): Readonly<Record<string, JsonValue>> {
  const envelopeRefusal = exactObject({
    kind: { const: "public_envelope_admission_refusal" },
    schemaVersion: { const: "5.0.0" },
    refusalContract: publicContractCoordinateSchema,
    nativeContractSource: exactOwnerMemberCoordinateSchema,
    candidateDigest: { oneOf: [digestSchema, { type: "null" }] },
    correlationRef: { oneOf: [nonblankSchema, { type: "null" }] },
    failureClass: {
      enum: [
        "invalid_utf8",
        "invalid_json_text",
        "not_i_json_object",
        "missing_common_field",
        "unexpected_common_field",
        "invalid_kind",
        "invalid_schema_version",
        "invalid_operation_identity",
        "invalid_member_identity",
        "invalid_correlation_ref",
        "invalid_event_time",
        "invalid_request_candidate",
      ],
    },
    issuePaths: { type: "array", minItems: 1, uniqueItems: true, items: jsonPointerSchema },
  });
  const lookupRefusal = exactObject({
    kind: { const: "public_family_lookup_refusal" },
    schemaVersion: { const: "5.0.0" },
    invocationContract: publicContractCoordinateSchema,
    failureClass: { enum: ["unknown_definition", "unknown_variant"] },
    suppliedOperationIdentity: nonblankSchema,
    suppliedMemberIdentity: nonblankSchema,
    familyRef: { const: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyRef },
    familyDigest: { const: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest },
    catalogDigest: digestSchema,
    issuePaths: { type: "array", uniqueItems: true, items: jsonPointerSchema },
  });
  return {
    PublicInvocationEnvelope: {
      oneOf: PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
        invocationEnvelopeBranch,
      ),
    },
    PublicEnvelopeAdmissionRefusal: envelopeRefusal,
    PublicFamilyLookupRefusal: lookupRefusal,
    IndexedInvocationAdmissionRefusal: {
      oneOf: PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
        indexedRefusalBranch,
      ),
    },
    PublicInvocation: {
      oneOf: PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
        admittedInvocationBranch,
      ),
    },
  };
}

const projectionRefusalValueSchema = exactObject({
  failureClass: {
    enum: [
      "malformed_owner_output",
      "cross_definition",
      "wrong_contract",
      "digest_mismatch",
      "unexpected_nonterminal",
      "relation_mismatch",
    ],
  },
  issuePaths: { type: "array", uniqueItems: true, items: jsonPointerSchema },
  candidateDigest: digestSchema,
  evidenceRefs: { type: "array", uniqueItems: true, items: nonblankSchema },
});

function outcomeBranch(
  definition: IntrinsicPublicFunctionDefinition,
  outcomeKind: "result" | "refusal" | "nonterminal" | "projection_refusal",
): JsonValue {
  const binding = outcomeKind === "result"
    ? definition.resultContract
    : outcomeKind === "refusal"
    ? definition.refusalContract
    : outcomeKind === "nonterminal"
    ? definition.nonTerminalContract
    : null;
  const valueSchema = outcomeKind === "projection_refusal"
    ? { $ref: "#/$defs/OutcomeProjectionRefusal" }
    : projectStrictJsonSchema(binding!.schema);
  return exactObject({
    kind: { const: "public_outcome" },
    schemaVersion: { const: "5.0.0" },
    outcomeContract: publicContractCoordinateSchema,
    outcomeRef: nonblankSchema,
    outcomeDigest: digestSchema,
    invocationRef: nonblankSchema,
    invocationDigest: digestSchema,
    definitionKey: definitionKeySchema(definition),
    definitionVersion: { const: "5.0.0" },
    definitionDigest: { const: definition.definitionDigest },
    contractCatalog: publicCatalogCoordinateSchema,
    correlationRef: nonblankSchema,
    provenanceRefs: { type: "array", uniqueItems: true, items: nonblankSchema },
    outcomeKind: { const: outcomeKind },
    payloadContract: publicContractCoordinateSchema,
    payloadRef: nonblankSchema,
    payloadDigest: digestSchema,
    value: valueSchema,
  });
}

function publicOutcomeDefinitions(): Readonly<Record<string, JsonValue>> {
  return {
    OutcomeProjectionRefusal: projectionRefusalValueSchema,
    PublicOutcome: {
      oneOf: PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.flatMap(
        (definition) => [
          outcomeBranch(definition, "result"),
          outcomeBranch(definition, "refusal"),
          ...(definition.nonTerminalContract === null
            ? []
            : [outcomeBranch(definition, "nonterminal")]),
          outcomeBranch(definition, "projection_refusal"),
        ],
      ),
    },
  };
}

function commonPublicSchema(): JsonValue {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "abg.schema.public-operation@5",
    title: "ABIogenesis exact public operation family",
    oneOf: [
      { $ref: "#/$defs/PublicOperationContractProjection" },
      { $ref: "#/$defs/PublicInvocation" },
      { $ref: "#/$defs/PublicOutcome" },
    ],
    $defs: {
      PublicOperationContractProjection: {
        oneOf: PUBLIC_OPERATION_CONTRACT_PROJECTIONS.map(
          (projection) => ({ const: projection }),
        ),
      },
      ...publicInvocationDefinitions(),
      ...publicOutcomeDefinitions(),
    },
  } as unknown as JsonValue;
}

function operationSuffix(operationId: string): string {
  return operationId.replace(/^abg\.operation\./u, "");
}

function operationPath(operationId: string): string {
  return operationSuffix(operationId).replaceAll(".", "/");
}

function pointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function projectionAsset(
  input: Omit<PublicProjectionAsset, "bytes" | "contentDigest">,
): PublicProjectionAsset {
  const bytes = `${canonicalJson(input.content)}\n`;
  return deepFreeze({
    ...input,
    bytes,
    contentDigest: sha256Bytes(bytes),
  });
}

function constructNativeSchemas(): PublicOperationSchemaMap {
  const operations: Record<string, Record<string, PublicOperationSchemaSlots>> = {};
  for (const definition of PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions) {
    const { operationId, memberKey } = definition.definitionKey;
    operations[operationId] ??= {};
    operations[operationId]![memberKey] = deepFreeze({
      request: definition.requestContract.schema,
      result: definition.resultContract.schema,
      refusal: definition.refusalContract.schema,
      nonTerminal: definition.nonTerminalContract?.schema ?? null,
    });
  }
  return deepFreeze(operations);
}

export const PUBLIC_OPERATION_SCHEMAS = constructNativeSchemas();

function slotAsset(
  operationId: string,
  slot: "request" | "result" | "refusal" | "non_terminal",
): PublicProjectionAsset | null {
  const definitions = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) => definition.definitionKey.operationId === operationId,
  );
  const selected = definitions.flatMap((definition) => {
    const binding = slot === "request"
      ? definition.requestContract
      : slot === "result"
      ? definition.resultContract
      : slot === "refusal"
      ? definition.refusalContract
      : definition.nonTerminalContract;
    return binding === null ? [] : [{ definition, binding }];
  });
  if (selected.length === 0) return null;
  const schemaSlot = slot === "non_terminal" ? "non-terminal" : slot;
  const definitionsByMember = Object.fromEntries(selected.map(({ definition, binding }) => [
    definition.definitionKey.memberKey,
    projectStrictJsonSchema(binding.schema),
  ]));
  const content = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `abg.schema.operation.${operationSuffix(operationId)}.${schemaSlot}@5`,
    title: `${operationId} ${schemaSlot}`,
    oneOf: selected.map(({ definition }) => ({
      $ref: `#/$defs/${pointerSegment(definition.definitionKey.memberKey)}`,
    })),
    $defs: definitionsByMember,
  } as JsonValue;
  return projectionAsset({
    assetKind: "operation_slot_schema",
    path: `contracts/schemas/operations/${operationPath(operationId)}/${schemaSlot}.schema.json`,
    mediaType: "application/schema+json",
    schemaVersion: "5.0.0",
    content,
    operationId,
    slot,
  });
}

function constructPayloads(): PublicProjectionPayloads {
  const family = deepFreeze({
    requirementAuthorityRefs:
      PUBLIC_FUNCTION_DEFINITION_FAMILY.requirementAuthorityRefs,
    familyRef: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyRef,
    familyVersion: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyVersion,
    familyDigest: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest,
  });
  const commonSchemaAsset = projectionAsset({
    assetKind: "common_public_schema",
    path: PUBLIC_SCHEMA_PATH,
    mediaType: "application/schema+json",
    schemaVersion: "5.0.0",
    content: commonPublicSchema(),
    operationId: null,
    slot: null,
  });
  const operationIds = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.map(
    ({ operationId }) => operationId,
  );
  const operationSchemaAssets = operationIds.flatMap((operationId) =>
    (["request", "result", "refusal", "non_terminal"] as const).flatMap(
      (slot) => {
        const asset = slotAsset(operationId, slot);
        return asset === null ? [] : [asset];
      },
    )
  );
  const operationContractAssets = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.map(
    (projection) => projectionAsset({
      assetKind: "operation_contract_projection",
      path:
        `contracts/public-operations/${operationPath(projection.operationId)}/` +
        "operation-contract.json",
      mediaType: "application/json",
      schemaVersion: "5.0.0",
      content: projection as unknown as JsonValue,
      operationId: projection.operationId,
      slot: null,
    }),
  );
  const sdkMembers = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
    (definition) => deepFreeze({
      definitionKey: definition.definitionKey,
      definitionRef: definition.definitionRef,
      sdkCoordinate: definition.sdkCoordinate,
      requestSchemaCoordinate: definition.schemaCoordinates.request.schemaId,
      resultSchemaCoordinate: definition.schemaCoordinates.result.schemaId,
      refusalSchemaCoordinate: definition.schemaCoordinates.refusal.schemaId,
      nonTerminalSchemaCoordinate:
        definition.schemaCoordinates.nonTerminal?.schemaId ?? null,
    }),
  );
  const cliGrammar = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
    (definition) => deepFreeze({
      definitionKey: definition.definitionKey,
      cliCoordinate: definition.cliCoordinate,
      adapterExitMap: definition.adapterExitMap,
    }),
  );
  const documentationInventory = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
    (definition) => deepFreeze({
      definitionKey: definition.definitionKey,
      definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest,
      semanticAuthorityRef: definition.semanticAuthorityRef,
      capabilityRefs: definition.capabilityRefs,
      ...(definition.successorDevelopmentPrebindingAuthority === undefined
        ? {}
        : {
          successorDevelopmentPrebindingAuthority:
            definition.successorDevelopmentPrebindingAuthority,
        }),
      sdkCoordinate: definition.sdkCoordinate,
      cliCoordinate: definition.cliCoordinate,
    }),
  );
  const adapterAsset = projectionAsset({
    assetKind: "adapter_projection",
    path: PUBLIC_ADAPTER_PATH,
    mediaType: "application/json",
    schemaVersion: "5.0.0",
    content: {
      kind: "public_adapter_projection",
      schemaVersion: "5.0.0",
      family,
      sdkMembers,
      cliGrammar,
      documentationInventory,
    } as unknown as JsonValue,
    operationId: null,
    slot: null,
  });
  const assets = deepFreeze([
    commonSchemaAsset,
    ...operationSchemaAssets,
    ...operationContractAssets,
    adapterAsset,
  ].sort((left, right) => compareUnicodeCodeUnits(left.path, right.path)));
  const projectionDigest = sha256Canonical({
    family,
    assets: assets.map(({ path, contentDigest }) => ({ path, contentDigest })),
    sdkMembers,
    cliGrammar,
    documentationInventory,
  } as unknown as JsonValue);
  return deepFreeze({
    family,
    nativeSchemas: PUBLIC_OPERATION_SCHEMAS,
    commonSchemaAsset,
    operationSchemaAssets,
    operationContractAssets,
    adapterAsset,
    assets,
    sdkMembers,
    cliGrammar,
    documentationInventory,
    projectionDigest,
  });
}

/** PFC-F07 payload projection. Its sole semantic input is the closed family. */
export const PUBLIC_PROJECTION_PAYLOADS = constructPayloads();
