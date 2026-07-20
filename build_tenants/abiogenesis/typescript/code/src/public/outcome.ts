import type { PersistedEventLog, ReplayState } from "../abg/index.js";
import {
  sha256Canonical,
  type JsonValue,
} from "../product/index.js";
import { deepFreeze } from "../product/immutable.js";
import type {
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";

function diagnosticFromValue(value: JsonValue | null): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const diagnosticRef = (value as Readonly<Record<string, JsonValue>>).diagnosticRef;
  return typeof diagnosticRef === "string" ? diagnosticRef : null;
}

function diagnosticFromEvent(
  eventLog: PersistedEventLog,
  eventRef: string | null,
): string | null {
  const event = eventLog.events.find((row) => row.eventId === eventRef);
  if (event === undefined || typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) {
    return null;
  }
  const payload = event.payload as Readonly<Record<string, JsonValue>>;
  if (typeof payload.diagnosticRef === "string") return payload.diagnosticRef;
  const refs = payload.contractOrDiagnosticRefs;
  return Array.isArray(refs) && typeof refs[0] === "string" ? refs[0] : null;
}

export function projectOutcome(
  invocation: RootPublicInvocation,
  firstReplay: ReplayState,
  secondReplay: ReplayState,
  outputContractRef: string,
  runtimeInvocationRef: string,
  eventLog: PersistedEventLog,
): PublicOutcome {
  const latestCall = firstReplay.cCalls.at(-1);
  const replayAgreement =
    firstReplay.replayDigest === secondReplay.replayDigest &&
    firstReplay.eventStoreDigest === secondReplay.eventStoreDigest;
  const closed =
    replayAgreement &&
    firstReplay.cCalls.length === 1 &&
    firstReplay.runtimeStatus === "closed" &&
    latestCall?.judgment === "advance" &&
    latestCall.resultContractRef === outputContractRef &&
    latestCall.resultRef !== null &&
    latestCall.judgmentRef !== null &&
    firstReplay.terminalReachedEventRef !== null &&
    firstReplay.frameClosedEventRef !== null &&
    firstReplay.graphCallClosedEventRef !== null &&
    firstReplay.runClosedEventRef !== null &&
    eventLog.eventCount === firstReplay.eventCount &&
    sha256Canonical(eventLog.events as unknown as JsonValue) ===
      firstReplay.eventStoreDigest;
  const disposition = closed
    ? "succeeded" as const
    : firstReplay.runtimeStatus === "blocked"
      ? "blocked" as const
      : firstReplay.runtimeStatus === "failed"
        ? "failed" as const
        : "refused" as const;
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef,
    disposition,
    result: latestCall?.resultValue ?? null,
    diagnosticRef: closed
      ? null
      : diagnosticFromEvent(eventLog, firstReplay.runtimeFailureEventRef) ??
        diagnosticFromEvent(eventLog, firstReplay.invocationRefusalEventRef) ??
        diagnosticFromValue(latestCall?.resultValue ?? null) ??
        "diagnostic://abiogenesis/public/non-terminal-replay@5",
    runId: firstReplay.runId,
    graphCallId: firstReplay.graphCallId,
    frameId: firstReplay.frameId,
    cCallRef: latestCall?.cCallRef ?? null,
    resultRef: latestCall?.resultRef ?? null,
    judgmentRef: latestCall?.judgmentRef ?? null,
    outputContractRef,
    admittedResultContractRef: latestCall?.resultContractRef ?? null,
    replayRef: firstReplay.replayRef,
    replayDigest: firstReplay.replayDigest,
    replayAgreement,
    eventLogPath: eventLog.eventLogPath,
    eventLogDigest: eventLog.eventLogDigest,
    eventLogByteLength: eventLog.durableByteLength,
    durableEventCount: eventLog.durableEventCount,
  };
  const outcomeDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest,
    ...body,
  }) as PublicOutcome;
}
