import type { JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, type Sha256Digest } from "../shared/digests.js";
import {
  compareAndAppendExpectedPrefix,
  selectHeldEventStoreDurablePrefix,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
  type RuntimeEventCandidate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import { hasExactPartialFanOutStopRouteBridge } from "./fan_out_projection.js";
import type { OpenedTraversalScope } from "./open_call.js";
import {
  hasExactCompletedRetryProgressBridge,
  hasExactStoppedRetryProgressBridge,
} from "./retry_lifecycle.js";

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface ChildFoldbackTruth {
  readonly childDisposition: "blocked" | "closed" | "failed";
  readonly childResultDigest: Sha256Digest;
  readonly childReasonRef: string | null;
  readonly childTerminalEventRef: string;
  readonly outputDigest: Sha256Digest;
  readonly routeEventRef: string;
}

export function projectChildFoldbackTruth(input: Readonly<{
  prefix: ValidatedRuntimeEventPrefix;
  childScope: OpenedTraversalScope;
  childResultRef: string;
  childJudgmentRef: string;
  childClosureRef: string | null;
  selectedRouteEventRef: string | null;
  allowedDispositions: readonly ChildFoldbackTruth["childDisposition"][];
  directCausation: "includes" | "terminal_first";
  allowRetryBridges: boolean;
}>): ChildFoldbackTruth | null {
  const events = runtimeEventsFromValidatedPrefix(input.prefix);
  const resultEvent = events.find(
    (event) => event.kind === "c_call_result_admitted" &&
      event.runId === input.childScope.runId &&
      event.frameId === input.childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.resultRef === input.childResultRef,
  );
  const judgmentEvent = events.find(
    (event) => event.kind === "c_call_judged" &&
      event.runId === input.childScope.runId &&
      event.frameId === input.childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === input.childJudgmentRef &&
      event.payload.resultRef === input.childResultRef,
  );
  const routeEvent = events.slice().reverse().find(
    (event) => event.kind === "traversal_route_admitted" &&
      event.runId === input.childScope.runId &&
      event.frameId === input.childScope.frameId &&
      (input.selectedRouteEventRef === null ||
        event.eventId === input.selectedRouteEventRef) &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === input.childJudgmentRef,
  );
  const resultPayload = resultEvent !== undefined && isRecord(resultEvent.payload)
    ? resultEvent.payload
    : null;
  const judgmentPayload = judgmentEvent !== undefined &&
      isRecord(judgmentEvent.payload)
    ? judgmentEvent.payload
    : null;
  const routePayload = routeEvent !== undefined && isRecord(routeEvent.payload)
    ? routeEvent.payload
    : null;
  const routeKind = routePayload?.routeKind;
  const childDisposition = routeKind === "terminal"
    ? "closed" as const
    : routeKind === "blocked"
      ? "blocked" as const
      : routeKind === "failed"
        ? "failed" as const
        : null;
  const terminalReachedEvent = childDisposition === "closed"
    ? events.find(
        (event) => event.kind === "terminal_reached" &&
          event.runId === input.childScope.runId &&
          event.frameId === input.childScope.frameId &&
          event.causationEventRefs.includes(routeEvent?.eventId ?? "") &&
          isRecord(event.payload) &&
          event.payload.closureRef === input.childClosureRef,
      )
    : undefined;
  const frameClosedEvent = terminalReachedEvent === undefined
    ? undefined
    : events.find(
        (event) => event.kind === "frame_closed" &&
          event.runId === input.childScope.runId &&
          event.frameId === input.childScope.frameId &&
          event.causationEventRefs.includes(terminalReachedEvent.eventId),
      );
  const graphCallClosedEvent = frameClosedEvent === undefined
    ? undefined
    : events.find(
        (event) => event.kind === "graph_call_closed" &&
          event.runId === input.childScope.runId &&
          event.graphCallId === input.childScope.graphCallId &&
          event.causationEventRefs.includes(frameClosedEvent.eventId),
      );
  const childLifecycleEvent = childDisposition === "closed"
    ? graphCallClosedEvent
    : routeEvent;
  const directJudgmentCausation = routeEvent !== undefined &&
      judgmentEvent !== undefined &&
      (input.directCausation === "terminal_first" &&
          childDisposition === "closed"
        ? routeEvent.causationEventRefs[0] === judgmentEvent.eventId
        : routeEvent.causationEventRefs.includes(judgmentEvent.eventId));
  const cCallRef = typeof resultPayload?.cCallRef === "string" &&
      resultPayload.cCallRef === judgmentPayload?.cCallRef
    ? resultPayload.cCallRef
    : null;
  const completedRetryBridge = input.allowRetryBridges &&
      childDisposition === "closed" && routeEvent !== undefined &&
      judgmentEvent !== undefined && routePayload !== null && cCallRef !== null &&
      typeof routePayload.sourceCursorRef === "string" &&
      typeof routePayload.sourceCursorDigest === "string" &&
      (routePayload.targetCursorRef === null ||
        typeof routePayload.targetCursorRef === "string") &&
      (routePayload.targetCursorDigest === null ||
        typeof routePayload.targetCursorDigest === "string")
    ? hasExactCompletedRetryProgressBridge(
        events,
        routeEvent,
        judgmentEvent,
        {
          runId: input.childScope.runId,
          graphCallId: input.childScope.graphCallId,
          frameId: input.childScope.frameId,
          cCallRef,
          resultRef: input.childResultRef,
          judgmentRef: input.childJudgmentRef,
          sourceCursorRef: routePayload.sourceCursorRef,
          sourceCursorDigest: routePayload.sourceCursorDigest,
          targetCursorRef: routePayload.targetCursorRef,
          targetCursorDigest: routePayload.targetCursorDigest,
        },
      )
    : false;
  const stoppedRetryBridge = input.allowRetryBridges &&
      childDisposition === "blocked" && routeEvent !== undefined &&
      judgmentEvent !== undefined && routePayload !== null && cCallRef !== null &&
      typeof routePayload.sourceCursorRef === "string" &&
      typeof routePayload.sourceCursorDigest === "string"
    ? hasExactStoppedRetryProgressBridge(
        events,
        routeEvent,
        judgmentEvent,
        {
          runId: input.childScope.runId,
          graphCallId: input.childScope.graphCallId,
          frameId: input.childScope.frameId,
          cCallRef,
          resultRef: input.childResultRef,
          judgmentRef: input.childJudgmentRef,
          sourceCursorRef: routePayload.sourceCursorRef,
          sourceCursorDigest: routePayload.sourceCursorDigest,
        },
      )
    : false;
  const partialFanOutStopBridge = childDisposition === "blocked" &&
      routeEvent !== undefined && cCallRef !== null
    ? hasExactPartialFanOutStopRouteBridge(
        input.prefix,
        routeEvent.eventId,
        {
          runId: input.childScope.runId,
          graphCallId: input.childScope.graphCallId,
          frameId: input.childScope.frameId,
          cCallRef,
          resultRef: input.childResultRef,
          judgmentRef: input.childJudgmentRef,
        },
      )
    : false;
  const childResultDigest = resultPayload?.resultDigest;
  const outputDigest = resultPayload?.valueDigest;
  const childReasonRef = typeof judgmentPayload?.reasonRef === "string"
    ? judgmentPayload.reasonRef
    : null;
  return resultEvent === undefined || judgmentEvent === undefined ||
      routeEvent === undefined || childDisposition === null ||
      !input.allowedDispositions.includes(childDisposition) ||
      childLifecycleEvent === undefined ||
      !judgmentEvent.causationEventRefs.includes(resultEvent.eventId) ||
      (!directJudgmentCausation && !completedRetryBridge &&
        !stoppedRetryBridge && !partialFanOutStopBridge) ||
      !isSha256Digest(childResultDigest) || !isSha256Digest(outputDigest) ||
      (childDisposition === "closed" &&
        (input.childClosureRef === null || terminalReachedEvent === undefined ||
          frameClosedEvent === undefined || graphCallClosedEvent === undefined)) ||
      (childDisposition !== "closed" &&
        (input.childClosureRef !== null || childReasonRef === null))
    ? null
    : Object.freeze({
        childDisposition,
        childResultDigest,
        childReasonRef,
        childTerminalEventRef: childLifecycleEvent.eventId,
        outputDigest,
        routeEventRef: routeEvent.eventId,
      });
}

export function admitChildLifecycleEvent(input: Readonly<{
  store: AbgEventStore;
  expectedPrefixDigest: Sha256Digest;
  event: RuntimeEventCandidate;
}>): Readonly<{
  event: RuntimeEvent;
  successorPrefix: DurablePrefixCoordinate;
}> {
  const event = compareAndAppendExpectedPrefix(
    input.store,
    input.expectedPrefixDigest,
    [() => input.event],
  )[0]!;
  return Object.freeze({
    event,
    successorPrefix: selectHeldEventStoreDurablePrefix(input.store),
  });
}
