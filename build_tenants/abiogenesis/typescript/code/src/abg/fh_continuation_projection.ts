import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectPendingInteractionCarrier } from "./c_call.js";
import {
  constructRuntimeFluent,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { RuntimeEvent } from "./event_store.js";
import {
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface ReplayContinuationState {
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly continuationKind: "fh_interaction";
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly heldCursorRef: string;
  readonly heldCursorDigest: Sha256Digest;
  readonly constructionIntentRef: string | null;
  readonly constructionIntentDigest: Sha256Digest | null;
  readonly responseRef: string | null;
  readonly responseDigest: Sha256Digest | null;
  readonly responseValue: JsonValue | null;
  readonly successorInputRef: string | null;
  readonly successorInputDigest: Sha256Digest | null;
  readonly successorInputValue: JsonValue | null;
  readonly successorCursorRef: string | null;
  readonly successorCursorDigest: Sha256Digest | null;
  readonly openedEventRef: string;
  readonly respondedEventRef: string | null;
  readonly resumedEventRef: string | null;
  readonly terminalEventRef: string | null;
  readonly status: "abandoned" | "open" | "responded" | "resolved" | "superseded";
}

function isRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(event: RuntimeEvent, key: string): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function digestField(event: RuntimeEvent, key: string): Sha256Digest | null {
  const value = stringField(event, key);
  return value?.startsWith("sha256:") ? value as Sha256Digest : null;
}

function exactPublicOperation(
  events: readonly RuntimeEvent[],
  continuationRef: string,
  operationEventRef: JsonValue | undefined,
  operationId:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue",
  actorRef: JsonValue | undefined,
  capabilityRef: JsonValue | undefined,
  predecessor: RuntimeEvent,
  successor: RuntimeEvent,
): RuntimeEvent | null {
  if (typeof operationEventRef !== "string") return null;
  const event = events.find((candidate) =>
    candidate.eventId === operationEventRef &&
    candidate.kind === "public_operation_admitted"
  );
  if (event === undefined || !isRecord(event.payload)) return null;
  const grants = event.payload.capabilityGrantRefs;
  return event.payload.operationId === operationId &&
      event.payload.continuationRef === continuationRef &&
      event.payload.actorRef === actorRef &&
      event.payload.capabilityRef === capabilityRef &&
      Array.isArray(grants) && grants.length === 1 &&
      typeof grants[0] === "string" && grants[0].length > 0 &&
      event.admissionOrdinal > predecessor.admissionOrdinal &&
      event.admissionOrdinal < successor.admissionOrdinal &&
      successor.causationEventRefs.includes(event.eventId)
    ? event
    : null;
}

function exactOpenedBasis(
  prefix: ValidatedRuntimeEventPrefix,
  opened: RuntimeEvent,
  continuationRef: string,
): Readonly<{
  cCallRef: string;
  requestRef: string;
  requestDigest: Sha256Digest;
    judgmentRef: string;
    continuationDigest: Sha256Digest;
    constructionIntentRef: string | null;
    constructionIntentDigest: Sha256Digest | null;
}> | null {
  if (
    !isRecord(opened.payload) || !isRecord(opened.payload.cCall) ||
    !isRecord(opened.payload.pendingResult) ||
    !isRecord(opened.payload.pendingJudgment) ||
    !isRecord(opened.payload.heldCursor) ||
    !isRecord(opened.payload.openedTraversalScope)
  ) return null;
  const openedPayload = opened.payload;
  const pending = projectPendingInteractionCarrier(
    prefix,
    openedPayload.cCall as Readonly<Record<string, JsonValue>>,
    openedPayload.pendingResult as Readonly<Record<string, JsonValue>>,
    openedPayload.pendingJudgment as Readonly<Record<string, JsonValue>>,
  );
  if (pending === null) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const holdRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    isRecord(event.payload) &&
    event.payload.routeRef === openedPayload.holdRouteRef
  );
  const holdRoute = holdRoutes[0];
  const heldCursor = openedPayload.heldCursor as unknown as TraversalCursorCandidate;
  const openedScope = openedPayload.openedTraversalScope as Readonly<
    Record<string, JsonValue>
  >;
  const constructionIntentRef = stringField(opened, "constructionIntentRef");
  const constructionIntentDigest = digestField(
    opened,
    "constructionIntentDigest",
  );
  const identity = {
    continuationKind: "fh_interaction" as const,
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    cCallRef: pending.cCall.cCallRef,
    heldCursorRef: heldCursor.cursorRef,
    heldCursorDigest: heldCursor.cursorDigest,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    actorCapabilityRef: pending.cCall.actorCapabilityRef,
    responseContractRef: pending.cCall.responseContractRef,
    executionBasisRef: openedPayload.executionBasisRef,
    constructionIntentRef,
  };
  const continuationDigest = sha256Canonical(
    identity as unknown as JsonValue,
  );
  const exactContinuationRef =
    `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`;
  if (
    holdRoutes.length !== 1 || holdRoute === undefined ||
    !isRecord(holdRoute.payload) ||
    opened.aggregateType !== "continuation" ||
    opened.workflowVersion !== "5.0.0" || opened.scopeClass !== "run" ||
    opened.runId === undefined || opened.graphCallId === undefined ||
    opened.frameId === undefined || opened.parentAggregateId !== opened.frameId ||
    opened.aggregateId !== continuationRef ||
    openedPayload.continuationRef !== opened.aggregateId ||
    openedPayload.continuationKind !== "fh_interaction" ||
    openedPayload.continuationDigest !== continuationDigest ||
    continuationRef !== exactContinuationRef ||
    opened.basisId !== openedPayload.executionBasisRef ||
    opened.graphFunctionRef !== openedPayload.graphFunctionRef ||
    opened.materializationRef !== openedPayload.graphRef ||
    openedPayload.graphRef !== heldCursor.graphRef ||
    openedPayload.graphDigest === undefined ||
    openedPayload.executionBasisRef !== heldCursor.executionBasisRef ||
    openedPayload.scopeRef !== heldCursor.traversalScopeRef ||
    openedScope.scopeRef !== openedPayload.scopeRef ||
    openedScope.scopeDigest !== openedPayload.scopeDigest ||
    openedScope.executionBasisRef !== openedPayload.executionBasisRef ||
    openedScope.runId !== opened.runId ||
    openedScope.graphCallId !== opened.graphCallId ||
    openedScope.frameId !== opened.frameId ||
    !isTraversalCursorCandidate(heldCursor) ||
    heldCursor.runId !== opened.runId ||
    heldCursor.graphCallId !== opened.graphCallId ||
    heldCursor.frameId !== opened.frameId ||
    pending.cCall.basisId !== opened.basisId ||
    pending.cCall.runId !== opened.runId ||
    pending.cCall.graphCallId !== opened.graphCallId ||
    pending.cCall.frameId !== opened.frameId ||
    pending.cCall.graphFunctionRef !== opened.graphFunctionRef ||
    openedPayload.cCallRef !== pending.cCall.cCallRef ||
    openedPayload.requestContractRef !== pending.cCall.inputContractRef ||
    openedPayload.requestRef !== pending.requestRef ||
    openedPayload.requestDigest !== pending.requestDigest ||
    openedPayload.actorCapabilityRef !== pending.cCall.actorCapabilityRef ||
    openedPayload.responseContractRef !== pending.cCall.responseContractRef ||
    openedPayload.causedByEventRef !== pending.judgment.admissionEventRef ||
    openedPayload.heldCursorRef !== heldCursor.cursorRef ||
    openedPayload.heldCursorDigest !== heldCursor.cursorDigest ||
    openedPayload.inputRef !== heldCursor.inputRef ||
    openedPayload.inputDigest !== heldCursor.inputDigest ||
    !isRecord(openedPayload.inputValue) ||
    sha256Canonical(openedPayload.inputValue) !== openedPayload.inputDigest ||
    (constructionIntentRef === null) !== (constructionIntentDigest === null) ||
    holdRoute.workflowVersion !== "5.0.0" ||
    holdRoute.scopeClass !== "run" ||
    holdRoute.aggregateType !== "frame" ||
    holdRoute.aggregateId !== opened.frameId ||
    holdRoute.parentAggregateId !== opened.graphCallId ||
    holdRoute.basisId !== opened.basisId ||
    holdRoute.runId !== opened.runId ||
    holdRoute.graphFunctionRef !== opened.graphFunctionRef ||
    holdRoute.materializationRef !== opened.materializationRef ||
    holdRoute.graphCallId !== opened.graphCallId ||
    holdRoute.frameId !== opened.frameId ||
    holdRoute.admissionOrdinal >= opened.admissionOrdinal ||
    holdRoute.payload.routeKind !== "hold" ||
    holdRoute.payload.sourceCursorRef !== openedPayload.heldCursorRef ||
    holdRoute.payload.sourceCursorDigest !== openedPayload.heldCursorDigest ||
    holdRoute.payload.cCallRef !== pending.cCall.cCallRef ||
    holdRoute.payload.judgmentRef !== pending.judgment.judgmentRef ||
    !Array.isArray(holdRoute.payload.consumedAvailabilityRefs) ||
    holdRoute.payload.consumedAvailabilityRefs.length !== 1 ||
    holdRoute.payload.consumedAvailabilityRefs[0] !==
      pending.judgment.judgmentRef ||
    !holdRoute.causationEventRefs.includes(pending.judgment.admissionEventRef) ||
    opened.causationEventRefs[0] !== holdRoute.eventId
  ) return null;
  return {
    cCallRef: pending.cCall.cCallRef,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    judgmentRef: pending.judgment.judgmentRef,
    continuationDigest,
    constructionIntentRef,
    constructionIntentDigest,
  };
}

function exactLifecycleEnvelope(
  event: RuntimeEvent,
  opened: RuntimeEvent,
  basisId: string,
): boolean {
  return event.aggregateType === "continuation" &&
    event.aggregateId === opened.aggregateId &&
    event.parentAggregateId === opened.frameId &&
    event.workflowVersion === "5.0.0" && event.scopeClass === "run" &&
    event.basisId === basisId && event.runId === opened.runId &&
    event.graphCallId === opened.graphCallId && event.frameId === opened.frameId;
}

export function projectFhContinuations(
  prefix: ValidatedRuntimeEventPrefix,
  eventCalculus: RuntimeEventCalculusProjection,
): readonly ReplayContinuationState[] {
  const allEvents = runtimeEventsFromValidatedPrefix(prefix);
  const events = allEvents.filter((event) =>
    event.aggregateType === "continuation"
  );
  const refs = [...new Set(events.map((event) => event.aggregateId))];
  return refs.map((continuationRef) => {
    const rows = events.filter((event) => event.aggregateId === continuationRef);
    const openedRows = rows.filter((event) => event.kind === "fh_interaction_opened");
    const respondedRows = rows.filter((event) =>
      event.kind === "fh_interaction_responded"
    );
    const resumedRows = rows.filter((event) =>
      event.kind === "fh_interaction_resume_admitted"
    );
    const opened = openedRows[0];
    const responded = respondedRows[0];
    const resumed = resumedRows[0];
    const abandoned = rows.find((event) => event.kind === "continuation_abandoned");
    const superseded = rows.find((event) => event.kind === "continuation_superseded");
    const dispositionRows = rows.filter((event) =>
      event.kind === "continuation_abandoned" ||
      event.kind === "continuation_superseded"
    );
    if (
      opened === undefined || openedRows.length !== 1 ||
      respondedRows.length > 1 || resumedRows.length > 1 ||
      dispositionRows.length > 1 ||
      (resumed !== undefined && dispositionRows.length !== 0) ||
      (resumed !== undefined && responded === undefined) ||
      (responded !== undefined &&
        responded.admissionOrdinal <= opened.admissionOrdinal) ||
      (resumed !== undefined &&
        resumed.admissionOrdinal <= (responded?.admissionOrdinal ?? 0))
    ) throw new TypeError(`continuation ${continuationRef} has an invalid event lifecycle`);
    const openedBasis = exactOpenedBasis(prefix, opened, continuationRef);
    const continuationDigest = openedBasis?.continuationDigest ?? null;
    const actorCapabilityRef = stringField(opened, "actorCapabilityRef");
    const requestContractRef = stringField(opened, "requestContractRef");
    const responseContractRef = stringField(opened, "responseContractRef");
    const heldCursorRef = stringField(opened, "heldCursorRef");
    const heldCursorDigest = digestField(opened, "heldCursorDigest");
    if (
      openedBasis === null || continuationDigest === null ||
      opened.runId === undefined || opened.graphCallId === undefined ||
      opened.frameId === undefined || actorCapabilityRef === null ||
      requestContractRef === null || responseContractRef === null ||
      heldCursorRef === null || heldCursorDigest === null
    ) throw new TypeError(`continuation ${continuationRef} has incomplete opening truth`);
    const respondedPayload = responded !== undefined && isRecord(responded.payload)
      ? responded.payload
      : null;
    const resumedPayload = resumed !== undefined && isRecord(resumed.payload)
      ? resumed.payload
      : null;
    if (responded !== undefined && (
      respondedPayload === null ||
      !exactLifecycleEnvelope(responded, opened, continuationRef) ||
      respondedPayload.continuationRef !== continuationRef ||
      respondedPayload.actorRef === undefined ||
      respondedPayload.capabilityRef !== actorCapabilityRef ||
      respondedPayload.responseContractRef !== responseContractRef ||
      !isRecord(respondedPayload.responseValue) ||
      sha256Canonical(respondedPayload.responseValue) !==
        respondedPayload.responseDigest ||
      respondedPayload.responseRef !==
        `interaction-response://abiogenesis/${
          String(respondedPayload.responseDigest).slice("sha256:".length)
        }` ||
      responded.causationEventRefs[0] !== opened.eventId ||
      exactPublicOperation(
        allEvents,
        continuationRef,
        respondedPayload.publicOperationEventRef,
        "abg.operation.interaction.respond",
        respondedPayload.actorRef,
        respondedPayload.capabilityRef,
        opened,
        responded,
      ) === null
    )) throw new TypeError(`continuation ${continuationRef} has invalid response truth`);
    if (resumed !== undefined && (
      resumedPayload === null || responded === undefined ||
      respondedPayload === null ||
      !exactLifecycleEnvelope(resumed, opened, continuationRef) ||
      resumedPayload.continuationRef !== continuationRef ||
      resumedPayload.actorRef === undefined ||
      resumedPayload.capabilityRef !== actorCapabilityRef ||
      resumedPayload.openedEventRef !== opened.eventId ||
      resumedPayload.respondedEventRef !== responded.eventId ||
      resumedPayload.responseRef !== respondedPayload.responseRef ||
      resumedPayload.responseDigest !== respondedPayload.responseDigest ||
      !isRecord(resumedPayload.responseValue) ||
      sha256Canonical(resumedPayload.responseValue) !==
        resumedPayload.responseDigest ||
      !isRecord(resumedPayload.successorInputValue) ||
      sha256Canonical(resumedPayload.successorInputValue) !==
        resumedPayload.successorInputDigest ||
      typeof resumedPayload.successorInputRef !== "string" ||
      typeof resumedPayload.successorCursorRef !== "string" ||
      typeof resumedPayload.successorCursorDigest !== "string" ||
      typeof resumedPayload.durablePrefixDigest !== "string" ||
      !resumedPayload.durablePrefixDigest.startsWith("sha256:") ||
      resumed.causationEventRefs[0] !== responded.eventId ||
      exactPublicOperation(
        allEvents,
        continuationRef,
        resumedPayload.publicOperationEventRef,
        "abg.operation.run.continue",
        resumedPayload.actorRef,
        resumedPayload.capabilityRef,
        responded,
        resumed,
      ) === null
    )) throw new TypeError(`continuation ${continuationRef} has invalid resume truth`);
    const disposition = dispositionRows[0];
    const dispositionPayload = disposition !== undefined &&
        isRecord(disposition.payload)
      ? disposition.payload
      : null;
    const dispositionPredecessor = responded ?? opened;
    if (disposition !== undefined && (
      dispositionPayload === null ||
      !exactLifecycleEnvelope(
        disposition,
        opened,
        dispositionPredecessor.basisId,
      ) ||
      disposition.graphFunctionRef !== dispositionPredecessor.graphFunctionRef ||
      disposition.materializationRef !==
        dispositionPredecessor.materializationRef ||
      dispositionPayload.continuationRef !== continuationRef ||
      dispositionPayload.continuationDigest !== continuationDigest ||
      dispositionPayload.continuationKind !== "fh_interaction" ||
      dispositionPayload.terminalDisposition !==
        (disposition.kind === "continuation_abandoned"
          ? "abandoned"
          : "superseded") ||
      dispositionPayload.causedByEventRef !== dispositionPredecessor.eventId ||
      disposition.causationEventRefs.length !== 1 ||
      disposition.causationEventRefs[0] !== dispositionPredecessor.eventId ||
      disposition.admissionOrdinal <= dispositionPredecessor.admissionOrdinal
    )) throw new TypeError(
      `continuation ${continuationRef} has invalid terminal disposition truth`,
    );
    const open = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_open",
      identity: continuationRef,
    }));
    const responseAvailable = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_response_available",
      identity: continuationRef,
    }));
    const terminated = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_terminated",
      identity: continuationRef,
    }));
    const disposed = abandoned !== undefined || superseded !== undefined;
    if (
      (terminated && (open || responseAvailable || resumed === undefined)) ||
      (disposed && (open || responseAvailable)) ||
      (!terminated && !disposed && responded !== undefined &&
        (!open || !responseAvailable || resumed !== undefined)) ||
      (!terminated && !disposed && responded === undefined &&
        (!open || responseAvailable))
    ) throw new TypeError(
      `continuation ${continuationRef} differs from Event Calculus lifecycle truth`,
    );
    return deepFreeze({
      continuationRef,
      continuationDigest,
      continuationKind: "fh_interaction" as const,
      runId: opened.runId,
      graphCallId: opened.graphCallId,
      frameId: opened.frameId,
      cCallRef: openedBasis.cCallRef,
      actorCapabilityRef,
      requestContractRef,
      responseContractRef,
      requestRef: openedBasis.requestRef,
      requestDigest: openedBasis.requestDigest,
      heldCursorRef,
      heldCursorDigest,
      constructionIntentRef: openedBasis.constructionIntentRef,
      constructionIntentDigest: openedBasis.constructionIntentDigest,
      responseRef: responded === undefined
        ? null
        : stringField(responded, "responseRef"),
      responseDigest: responded === undefined
        ? null
        : digestField(responded, "responseDigest"),
      responseValue: respondedPayload?.responseValue ?? null,
      successorInputRef: resumed === undefined
        ? null
        : stringField(resumed, "successorInputRef"),
      successorInputDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorInputDigest"),
      successorInputValue: resumedPayload?.successorInputValue ?? null,
      successorCursorRef: resumed === undefined
        ? null
        : stringField(resumed, "successorCursorRef"),
      successorCursorDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorCursorDigest"),
      openedEventRef: opened.eventId,
      respondedEventRef: responded?.eventId ?? null,
      resumedEventRef: resumed?.eventId ?? null,
      terminalEventRef: dispositionRows[0]?.eventId ?? resumed?.eventId ?? null,
      status: abandoned !== undefined
        ? "abandoned" as const
        : superseded !== undefined
          ? "superseded" as const
          : terminated
            ? "resolved" as const
            : responseAvailable
              ? "responded" as const
              : "open" as const,
    });
  });
}
