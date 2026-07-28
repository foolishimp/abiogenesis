import type { JsonValue, Sha256Digest } from "../product/index.js";

export const ROOT_PUBLIC_OPERATION_IDS = [
  "abg.operation.product.verify",
  "abg.operation.product.resolve",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.apply",
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
  readonly disposition:
    | "blocked"
    | "failed"
    | "gap_stop"
    | "held"
    | "inspect_runtime_archive"
    | "repair"
    | "reprice"
    | "reprice_required"
    | "escalate"
    | "refused"
    | "succeeded";
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
  readonly continuationAuthority?: JsonValue;
  readonly projectionAuthority?: JsonValue;
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

export type PublicInvocationResult = PublicOutcome | PublicInvocationRefusal;

const RFC3339_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/u;

function isRfc3339DateTime(value: string): boolean {
  const match = RFC3339_DATE_TIME.exec(value);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[7] === undefined ? 0 : Number(match[7]);
  const offsetMinute = match[8] === undefined ? 0 : Number(match[8]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    hour > 23 ||
    minute > 59 ||
    second > 60 ||
    offsetHour > 23 ||
    offsetMinute > 59
  ) {
    return false;
  }
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1]!;
  return day <= daysInMonth;
}

function isJsonValue(value: unknown, seen = new WeakSet<object>()): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    const valid = value.every((entry) => isJsonValue(entry, seen));
    seen.delete(value);
    return valid;
  }
  const prototype = Object.getPrototypeOf(value);
  const valid = (
    (prototype === Object.prototype || prototype === null) &&
    Object.values(value).every((entry) => isJsonValue(entry, seen))
  );
  seen.delete(value);
  return valid;
}

function isRecord(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    isJsonValue(value)
  );
}

function hasExactInvocationKeys(
  value: Readonly<Record<string, JsonValue>>,
): boolean {
  return Object.keys(value).sort().join("\0") === [
    "correlationId",
    "eventTime",
    "invocationRef",
    "kind",
    "operationId",
    "payload",
    "schemaVersion",
    "variant",
  ].join("\0");
}

export function parseRootPublicInvocation(
  value: unknown,
): RootPublicInvocation | PublicInvocationRefusal {
  if (
    !isRecord(value) ||
    !hasExactInvocationKeys(value) ||
    value.kind !== "public_invocation" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.operationId !== "string" ||
    !ROOT_PUBLIC_OPERATION_IDS.includes(value.operationId as RootPublicOperationId) ||
    typeof value.variant !== "string" ||
    value.variant.trim().length === 0 ||
    typeof value.invocationRef !== "string" ||
    value.invocationRef.trim().length === 0 ||
    typeof value.eventTime !== "string" ||
    !isRfc3339DateTime(value.eventTime) ||
    typeof value.correlationId !== "string" ||
    value.correlationId.trim().length === 0 ||
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
