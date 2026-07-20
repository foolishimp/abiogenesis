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
      : firstReplay.runtimeFailureEventRef ??
        firstReplay.invocationRefusalEventRef ??
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
  };
  const outcomeDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest,
    ...body,
  }) as PublicOutcome;
}
