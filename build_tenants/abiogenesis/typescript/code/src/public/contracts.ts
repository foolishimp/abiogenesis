import type { JsonValue, Sha256Digest } from "../product/index.js";

export const ROOT_PUBLIC_OPERATION_IDS = [
  "abg.operation.product.verify",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.view",
  "abg.operation.project.read",
  "abg.operation.interaction.respond",
  "abg.operation.run.continue",
  "abg.operation.run.invoke",
] as const;

export type RootPublicOperationId = (typeof ROOT_PUBLIC_OPERATION_IDS)[number];

export interface RootPublicInvocation {
  readonly kind: "public_invocation";
  readonly schemaVersion: "5.0.0";
  readonly operationId: RootPublicOperationId;
  readonly variant: string;
  readonly invocationRef: string;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly payload: Readonly<Record<string, JsonValue>>;
}

export interface PublicOutcome {
  readonly kind: "public_outcome";
  readonly schemaVersion: "5.0.0";
  readonly operationId: RootPublicOperationId;
  readonly variant: string;
  readonly invocationRef: string;
  readonly runtimeInvocationRef: string | null;
  readonly disposition: "blocked" | "failed" | "held" | "refused" | "succeeded";
  readonly outcomeDigest: Sha256Digest;
  readonly result: JsonValue;
  readonly diagnosticRef: string | null;
  readonly runId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly outputContractRef: string | null;
  readonly admittedResultContractRef: string | null;
  readonly replayRef: string | null;
  readonly replayDigest: Sha256Digest | null;
  readonly replayAgreement: boolean | null;
  readonly eventLogPath: string | null;
  readonly eventLogDigest: Sha256Digest | null;
  readonly eventLogByteLength: number | null;
  readonly durableEventCount: number | null;
  readonly continuationRef: string | null;
  readonly continuationStatus: "open" | "responded" | "resolved" | null;
}

export interface PublicInvocationRefusal {
  readonly kind: "public_invocation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "duplicate_invocation"
    | "invalid_request"
    | "missing_prerequisite"
    | "owner_refusal"
    | "target_mismatch";
  readonly message: string;
}

function isRecord(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRootPublicInvocation(
  value: unknown,
): RootPublicInvocation | PublicInvocationRefusal {
  if (
    !isRecord(value) ||
    value.kind !== "public_invocation" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.operationId !== "string" ||
    !ROOT_PUBLIC_OPERATION_IDS.includes(value.operationId as RootPublicOperationId) ||
    typeof value.variant !== "string" ||
    value.variant.length === 0 ||
    typeof value.invocationRef !== "string" ||
    value.invocationRef.length === 0 ||
    typeof value.eventTime !== "string" ||
    Number.isNaN(Date.parse(value.eventTime)) ||
    typeof value.correlationId !== "string" ||
    value.correlationId.length === 0 ||
    !isRecord(value.payload)
  ) {
    return {
      kind: "public_invocation_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_request",
      message: "public invocation requires exact operation, identity, time, correlation, and payload fields",
    };
  }
  return value as unknown as RootPublicInvocation;
}
