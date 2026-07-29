import {
  ROOT_PUBLIC_OPERATION_DEFINITIONS,
  ROOT_PUBLIC_OPERATION_IDS,
} from "./contracts.js";

const refSchema = {
  type: "string",
  pattern: "\\S",
} as const;

const nullableRefSchema = {
  oneOf: [refSchema, { type: "null" }],
} as const;

const digestSchema = {
  type: "string",
  pattern: "^sha256:[0-9a-f]{64}$",
} as const;

const nullableDigestSchema = {
  oneOf: [
    digestSchema,
    { type: "null" },
  ],
} as const;

type PayloadFieldDefinition =
  | Readonly<{ readonly kind: "digest" }>
  | Readonly<{ readonly kind: "enum"; readonly values: readonly string[] }>
  | Readonly<{ readonly kind: "nonblank_string" }>
  | Readonly<{ readonly kind: "record" }>
  | Readonly<{
    readonly kind: "string_array";
    readonly minItems: number;
    readonly uniqueItems: boolean;
  }>;

type PayloadDefinition = Readonly<{
  readonly fields: Readonly<Record<string, PayloadFieldDefinition>>;
  readonly required: readonly string[];
  readonly allOrNone?: readonly (readonly string[])[];
  readonly exactlyOne?: readonly (readonly string[])[];
  readonly successfulResultSchemaRef?: string;
}>;

function payloadFieldSchema(
  definition: PayloadFieldDefinition,
): Readonly<Record<string, unknown>> {
  switch (definition.kind) {
    case "digest":
      return digestSchema;
    case "enum":
      return { enum: [...definition.values] };
    case "nonblank_string":
      return refSchema;
    case "record":
      return { type: "object" };
    case "string_array":
      return {
        type: "array",
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        items: refSchema,
      };
  }
}

function absentGroupSchema(
  group: readonly string[],
): Readonly<Record<string, unknown>> {
  return {
    not: {
      anyOf: group.map((key) => ({ required: [key] })),
    },
  };
}

function payloadDefinitionSchema(
  definition: PayloadDefinition,
): Readonly<Record<string, unknown>> {
  const constraints: Readonly<Record<string, unknown>>[] = [];
  for (const group of definition.allOrNone ?? []) {
    constraints.push({
      oneOf: [
        { required: [...group] },
        absentGroupSchema(group),
      ],
    });
  }
  if (definition.exactlyOne !== undefined) {
    constraints.push({
      oneOf: definition.exactlyOne.map((selected, selectedIndex) => ({
        allOf: [
          { required: [...selected] },
          ...definition.exactlyOne!
            .filter((_, index) => index !== selectedIndex)
            .map(absentGroupSchema),
        ],
      })),
    });
  }
  return {
    type: "object",
    additionalProperties: false,
    required: [...definition.required],
    properties: Object.fromEntries(
      Object.entries(definition.fields).map(([key, field]) => [
        key,
        payloadFieldSchema(field),
      ]),
    ),
    ...(constraints.length === 0 ? {} : { allOf: constraints }),
  };
}

const publicInvocationSchemas = Object.entries(
  ROOT_PUBLIC_OPERATION_DEFINITIONS,
).flatMap(([operationId, variants]) =>
  Object.entries(variants).map(([variant, definition]) => ({
    type: "object",
    additionalProperties: false,
    required: [
      "kind",
      "schemaVersion",
      "operationId",
      "variant",
      "invocationRef",
      "eventTime",
      "correlationId",
      "payload",
    ],
    properties: {
      kind: { const: "public_invocation" },
      schemaVersion: { const: "5.0.0" },
      operationId: { const: operationId },
      variant: { const: variant },
      invocationRef: refSchema,
      eventTime: { type: "string", format: "date-time" },
      correlationId: refSchema,
      payload: payloadDefinitionSchema(definition),
    },
  }))
);

const publicOutcomePairSchemas = Object.entries(
  ROOT_PUBLIC_OPERATION_DEFINITIONS,
).flatMap(([operationId, variants]) =>
  Object.keys(variants).map((variant) => ({
    required: ["operationId", "variant"],
    properties: {
      operationId: { const: operationId },
      variant: { const: variant },
    },
  }))
);

const successfulResultSchemas = Object.entries(
  ROOT_PUBLIC_OPERATION_DEFINITIONS,
).flatMap(([operationId, variants]) =>
  Object.entries(variants).flatMap(([variant, definition]) => {
    const resultSchemaRef = (
      definition as PayloadDefinition
    ).successfulResultSchemaRef;
    return resultSchemaRef === undefined
      ? []
      : [{
        if: {
          required: ["operationId", "variant", "disposition"],
          properties: {
            operationId: { const: operationId },
            variant: { const: variant },
            disposition: { const: "succeeded" },
          },
        },
        then: {
          properties: {
            result: { $ref: resultSchemaRef },
          },
        },
      }];
  })
);

export const PUBLIC_OPERATION_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "abg.schema.public-operation-contract",
  title: "ABIogenesis Public Operation Contract",
  oneOf: [
    { $ref: "#/$defs/RootPublicInvocation" },
    { $ref: "#/$defs/PublicOutcome" },
    { $ref: "#/$defs/PublicInvocationRefusal" },
  ],
  $defs: {
    RootPublicInvocation: {
      oneOf: publicInvocationSchemas,
    },
    PublicOutcome: {
      type: "object",
      additionalProperties: false,
      allOf: [
        { oneOf: publicOutcomePairSchemas },
        ...successfulResultSchemas,
      ],
      required: [
        "kind",
        "schemaVersion",
        "operationId",
        "variant",
        "invocationRef",
        "runtimeInvocationRef",
        "disposition",
        "outcomeDigest",
        "result",
        "diagnosticRef",
        "runId",
        "graphCallId",
        "frameId",
        "cCallRef",
        "resultRef",
        "judgmentRef",
        "outputContractRef",
        "admittedResultContractRef",
        "replayRef",
        "replayDigest",
        "replayAgreement",
        "eventLogPath",
        "eventLogDigest",
        "eventLogByteLength",
        "durableEventCount",
        "continuationRef",
        "continuationStatus",
      ],
      properties: {
        kind: { const: "public_outcome" },
        schemaVersion: { const: "5.0.0" },
        operationId: { enum: [...ROOT_PUBLIC_OPERATION_IDS] },
        variant: refSchema,
        invocationRef: refSchema,
        runtimeInvocationRef: nullableRefSchema,
        disposition: {
          enum: [
            "blocked",
            "failed",
            "gap_stop",
            "held",
            "inspect_runtime_archive",
            "repair",
            "reprice",
            "reprice_required",
            "escalate",
            "refused",
            "succeeded",
          ],
        },
        outcomeDigest: {
          ...digestSchema,
        },
        result: {},
        diagnosticRef: nullableRefSchema,
        runId: nullableRefSchema,
        graphCallId: nullableRefSchema,
        frameId: nullableRefSchema,
        cCallRef: nullableRefSchema,
        resultRef: nullableRefSchema,
        judgmentRef: nullableRefSchema,
        outputContractRef: nullableRefSchema,
        admittedResultContractRef: nullableRefSchema,
        replayRef: nullableRefSchema,
        replayDigest: nullableDigestSchema,
        replayAgreement: {
          oneOf: [{ type: "boolean" }, { type: "null" }],
        },
        eventLogPath: nullableRefSchema,
        eventLogDigest: nullableDigestSchema,
        eventLogByteLength: {
          oneOf: [
            { type: "integer", minimum: 0 },
            { type: "null" },
          ],
        },
        durableEventCount: {
          oneOf: [
            { type: "integer", minimum: 0 },
            { type: "null" },
          ],
        },
        continuationRef: nullableRefSchema,
        continuationStatus: {
          oneOf: [
            { enum: ["open", "responded", "resolved"] },
            { type: "null" },
          ],
        },
        continuationAuthority: {},
        projectionAuthority: {},
      },
    },
    ProductDependencyEdgeProjection: {
      type: "object",
      additionalProperties: false,
      required: [
        "kind",
        "fromProductId",
        "toProductId",
        "packageVersion",
        "compatibilityRef",
        "compatibilityDisposition",
        "requiredContractRefs",
        "requiredCapabilityRefs",
      ],
      properties: {
        kind: { const: "requires" },
        fromProductId: refSchema,
        toProductId: refSchema,
        packageVersion: refSchema,
        compatibilityRef: refSchema,
        compatibilityDisposition: { const: "compatible" },
        requiredContractRefs: {
          type: "array",
          uniqueItems: true,
          items: refSchema,
        },
        requiredCapabilityRefs: {
          type: "array",
          uniqueItems: true,
          items: refSchema,
        },
      },
    },
    ResolvedProductLockProjection: {
      type: "object",
      additionalProperties: false,
      required: [
        "kind",
        "lockId",
        "lockDigest",
        "nativeContractClosureDigest",
        "productIds",
        "dependencyEdges",
      ],
      properties: {
        kind: { const: "resolved_product_lock" },
        lockId: refSchema,
        lockDigest: digestSchema,
        nativeContractClosureDigest: digestSchema,
        productIds: {
          type: "array",
          minItems: 1,
          uniqueItems: true,
          items: refSchema,
        },
        dependencyEdges: {
          type: "array",
          items: { $ref: "#/$defs/ProductDependencyEdgeProjection" },
        },
      },
    },
    PublicInvocationRefusal: {
      type: "object",
      additionalProperties: false,
      required: [
        "kind",
        "schemaVersion",
        "disposition",
        "code",
        "message",
      ],
      properties: {
        kind: { const: "public_invocation_refusal" },
        schemaVersion: { const: "5.0.0" },
        disposition: { const: "refused" },
        code: {
          enum: [
            "duplicate_invocation",
            "invalid_request",
            "missing_prerequisite",
            "owner_refusal",
            "target_mismatch",
          ],
        },
        message: refSchema,
      },
    },
  },
} as const;
