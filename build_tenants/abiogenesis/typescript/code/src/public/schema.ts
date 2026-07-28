import { ROOT_PUBLIC_OPERATION_IDS } from "./contracts.js";

const refSchema = {
  type: "string",
  pattern: "\\S",
} as const;

const nullableRefSchema = {
  oneOf: [refSchema, { type: "null" }],
} as const;

const nullableDigestSchema = {
  oneOf: [
    {
      type: "string",
      pattern: "^sha256:[0-9a-f]{64}$",
    },
    { type: "null" },
  ],
} as const;

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
        operationId: { enum: [...ROOT_PUBLIC_OPERATION_IDS] },
        variant: refSchema,
        invocationRef: refSchema,
        eventTime: { type: "string", format: "date-time" },
        correlationId: refSchema,
        payload: { type: "object" },
      },
    },
    PublicOutcome: {
      type: "object",
      additionalProperties: false,
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
          type: "string",
          pattern: "^sha256:[0-9a-f]{64}$",
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
