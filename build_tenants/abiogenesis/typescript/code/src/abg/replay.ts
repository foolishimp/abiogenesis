import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { eventCalculusEffect } from "./event_calculus.js";
import type {
  AbgEventStore,
  RootEventKind,
  RuntimeEvent,
  RuntimeEventScope,
} from "./event_store.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
import type { TraversalRouteKind } from "./traversal_route.js";

export interface ReplayCCallState {
  readonly cCallRef: string;
  readonly batchRef: string | null;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly programLocusRef: string;
  readonly retryPath: readonly number[];
  readonly eventKinds: readonly RootEventKind[];
  readonly evidenceRefs: readonly string[];
  readonly resultRef: string | null;
  readonly resultDigest: Sha256Digest | null;
  readonly resultClass: string | null;
  readonly resultContractRef: string | null;
  readonly resultValueKind: string | null;
  readonly resultValue: JsonValue | null;
  readonly judgmentRef: string | null;
  readonly judgment: string | null;
  readonly status: "fibre_selected" | "judged" | "opened" | "result_admitted";
}

export interface ReplayRouteState {
  readonly routeRef: string;
  readonly routeDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly admissionEventRef: string;
}

export interface ReplayActorProcessState {
  readonly actorInvocationRef: string;
  readonly actorRef: string | null;
  readonly transportBindingRef: string | null;
  readonly transportBindingDigest: Sha256Digest | null;
  readonly processRef: string | null;
  readonly streamEventRefs: readonly string[];
  readonly timedOut: boolean;
  readonly signalSequence: readonly string[];
  readonly exitStatus: number | null;
  readonly exitSignal: string | null;
  readonly terminationConfirmed: boolean;
  readonly transportDigest: Sha256Digest | null;
  readonly status: "active" | "closed" | "failed";
}

export interface ReplayState {
  readonly kind: "replay_state";
  readonly schemaVersion: "5.0.0";
  readonly replayRef: string;
  readonly replayDigest: Sha256Digest;
  readonly eventStoreDigest: Sha256Digest;
  readonly eventCount: number;
  readonly lastAdmissionOrdinal: number;
  readonly runId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly traversalCursorRef: string | null;
  readonly traversalCursorDigest: Sha256Digest | null;
  readonly traversalCursorEventRef: string | null;
  readonly cCalls: readonly ReplayCCallState[];
  readonly routes: readonly ReplayRouteState[];
  readonly fanOutCompletions: readonly FanOutCompletionAdmission[];
  readonly actorProcesses: readonly ReplayActorProcessState[];
  readonly activeFluents: readonly string[];
  readonly terminalReachedEventRef: string | null;
  readonly frameClosedEventRef: string | null;
  readonly graphCallClosedEventRef: string | null;
  readonly runClosedEventRef: string | null;
  readonly runStoppedEventRef: string | null;
  readonly invocationRefusalEventRef: string | null;
  readonly runtimeFailureEventRef: string | null;
  readonly runtimeStatus:
    | "active"
    | "blocked"
    | "closed"
    | "failed"
    | "refused"
    | "workspace";
}

function isRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(event: RuntimeEvent, name: string): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return typeof value === "string" ? value : null;
}

function nonNegativeIntegerField(event: RuntimeEvent, name: string): number | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return Number.isSafeInteger(value) && (value as number) >= 0
    ? value as number
    : null;
}

function positiveIntegerField(event: RuntimeEvent, name: string): number | null {
  const value = nonNegativeIntegerField(event, name);
  return value !== null && value > 0 ? value : null;
}

function positiveIntegerArrayField(
  event: RuntimeEvent,
  name: string,
): readonly number[] | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return Array.isArray(value) &&
      value.every((row) => Number.isSafeInteger(row) && (row as number) > 0)
    ? value as readonly number[]
    : null;
}

function hasExactKeys(
  value: Readonly<Record<string, JsonValue>>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  return keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]);
}

function isNonNegativeInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function hasNonEmptyStringFields(
  value: Readonly<Record<string, JsonValue>>,
  fields: readonly string[],
): boolean {
  return fields.every(
    (field) => typeof value[field] === "string" && value[field].length > 0,
  );
}

function isFanOutCompletedTaskRow(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "cCallRef",
      "foldbackEventRef",
      "foldbackRef",
      "inputMemberDigest",
      "inputMemberRef",
      "judgmentRef",
      "ordinal",
      "outputMemberDigest",
      "outputMemberRef",
      "resultDigest",
      "resultRef",
      "value",
    ]) &&
    isNonNegativeInteger(value.ordinal) &&
    hasNonEmptyStringFields(value, [
      "cCallRef",
      "foldbackEventRef",
      "foldbackRef",
      "inputMemberDigest",
      "inputMemberRef",
      "judgmentRef",
      "outputMemberDigest",
      "outputMemberRef",
      "resultDigest",
      "resultRef",
    ]) &&
    value.value !== null;
}

function isFanOutStoppingTaskRow(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "cCallRef",
      "disposition",
      "foldbackEventRef",
      "foldbackRef",
      "inputMemberDigest",
      "inputMemberRef",
      "judgmentRef",
      "ordinal",
      "resultDigest",
      "resultRef",
      "stoppingEventRef",
    ]) &&
    isNonNegativeInteger(value.ordinal) &&
    value.disposition === "blocked" &&
    hasNonEmptyStringFields(value, [
      "cCallRef",
      "foldbackEventRef",
      "foldbackRef",
      "inputMemberDigest",
      "inputMemberRef",
      "judgmentRef",
      "resultDigest",
      "resultRef",
      "stoppingEventRef",
    ]);
}

function isFanOutUnstartedTaskRow(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "inputMemberDigest",
      "inputMemberRef",
      "ordinal",
    ]) &&
    isNonNegativeInteger(value.ordinal) &&
    hasNonEmptyStringFields(value, [
      "inputMemberDigest",
      "inputMemberRef",
    ]);
}

function fanOutCompletionFromEvent(
  event: RuntimeEvent,
): FanOutCompletionAdmission {
  if (
    event.kind !== "fan_out_completion_admitted" ||
    !isRecord(event.payload)
  ) {
    throw new TypeError(`invalid fan-out completion event at ${event.eventId}`);
  }
  const payload = event.payload;
  const completionRef = stringField(event, "completionRef");
  const completionDigest = stringField(event, "completionDigest");
  const applicationRef = stringField(event, "applicationRef");
  const batchRef = stringField(event, "batchRef");
  const inputVectorRef = stringField(event, "inputVectorRef");
  const outputVectorContractRef = stringField(
    event,
    "outputVectorContractRef",
  );
  const inputMemberContractRef = stringField(
    event,
    "inputMemberContractRef",
  );
  const outputMemberContractRef = stringField(
    event,
    "outputMemberContractRef",
  );
  const completionKind = payload.completionKind;
  if (
    completionRef === null ||
    completionDigest === null ||
    applicationRef === null ||
    batchRef === null ||
    inputVectorRef === null ||
    outputVectorContractRef === null ||
    inputMemberContractRef === null ||
    outputMemberContractRef === null ||
    (
      completionKind !== "complete_vector" &&
      completionKind !== "partial_stop"
    )
  ) {
    throw new TypeError(
      `incomplete fan-out completion identity at ${event.eventId}`,
    );
  }
  const common = {
    applicationRef,
    batchRef,
    inputVectorRef,
    outputVectorContractRef,
    inputMemberContractRef,
    outputMemberContractRef,
  };
  let body: Readonly<Record<string, JsonValue>>;
  if (completionKind === "complete_vector") {
    const taskRows = payload.taskRows;
    const outputVectorRef = payload.outputVectorRef;
    const outputVectorDigest = payload.outputVectorDigest;
    const outputVector = payload.outputVector;
    if (
      !hasExactKeys(payload, [
        "applicationRef",
        "batchRef",
        "completionDigest",
        "completionKind",
        "completionRef",
        "inputMemberContractRef",
        "inputVectorRef",
        "outputMemberContractRef",
        "outputVector",
        "outputVectorContractRef",
        "outputVectorDigest",
        "outputVectorRef",
        "taskRows",
      ]) ||
      !Array.isArray(taskRows) ||
      taskRows.length === 0 ||
      !taskRows.every(isFanOutCompletedTaskRow) ||
      typeof outputVectorRef !== "string" ||
      outputVectorRef.length === 0 ||
      typeof outputVectorDigest !== "string" ||
      outputVectorDigest.length === 0 ||
      !isRecord(outputVector) ||
      sha256Canonical(outputVector) !== outputVectorDigest
    ) {
      throw new TypeError(
        `invalid complete fan-out projection at ${event.eventId}`,
      );
    }
    body = {
      ...common,
      completionKind,
      taskRows,
      outputVectorRef,
      outputVectorDigest,
      outputVector,
    };
  } else {
    const completedRows = payload.completedRows;
    const stoppingRow = payload.stoppingRow;
    const unstartedRows = payload.unstartedRows;
    if (
      !hasExactKeys(payload, [
        "applicationRef",
        "batchRef",
        "completedRows",
        "completionDigest",
        "completionKind",
        "completionRef",
        "inputMemberContractRef",
        "inputVectorRef",
        "outputMemberContractRef",
        "outputVectorContractRef",
        "stoppingRow",
        "unstartedRows",
      ]) ||
      !Array.isArray(completedRows) ||
      !completedRows.every(isFanOutCompletedTaskRow) ||
      !isFanOutStoppingTaskRow(stoppingRow) ||
      !Array.isArray(unstartedRows) ||
      !unstartedRows.every(isFanOutUnstartedTaskRow)
    ) {
      throw new TypeError(
        `invalid partial fan-out projection at ${event.eventId}`,
      );
    }
    body = {
      ...common,
      completionKind,
      completedRows,
      stoppingRow,
      unstartedRows,
    };
  }
  if (
    sha256Canonical(body as JsonValue) !== completionDigest ||
    completionRef !==
      `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}`
  ) {
    throw new TypeError(
      `fan-out completion identity mismatch at ${event.eventId}`,
    );
  }
  return deepFreeze({
    kind: "fan_out_completion_admission",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    completionRef,
    completionDigest: completionDigest as Sha256Digest,
    ...body,
    admissionEventRef: event.eventId,
  }) as FanOutCompletionAdmission;
}

function validateCCallOrder(events: readonly RuntimeEvent[]): void {
  const ranks: Readonly<Record<string, number>> = {
    c_call_opened: 0,
    c_call_fibre_selected: 1,
    c_call_evidenced: 2,
    c_call_result_admitted: 3,
    c_call_judged: 4,
  };
  let previous = -1;
  for (const event of events) {
    const rank = ranks[event.kind];
    if (rank === undefined || rank < previous || (rank === previous && event.kind !== "c_call_evidenced")) {
      throw new TypeError(`invalid CCall replay order at ${event.eventId}`);
    }
    previous = rank;
  }
}

export function replay(store: AbgEventStore, scope?: RuntimeEventScope): ReplayState {
  const admittedEvents = store.readAll();
  for (const [index, event] of admittedEvents.entries()) {
    if (event.admissionOrdinal !== index + 1) {
      throw new TypeError("ABG replay requires a total, gap-free admission-ordinal order");
    }
  }
  const events = scope === undefined ? admittedEvents : store.readScope(scope);

  const activeFluents = new Set<string>();
  for (const event of events) {
    const effect = eventCalculusEffect(event);
    for (const fluent of effect.terminates) activeFluents.delete(fluent);
    for (const fluent of effect.initiates) activeFluents.add(fluent);
  }

  const cCallIds = [...new Set(
    events
      .filter((event) => event.aggregateType === "c_call")
      .map((event) => event.aggregateId),
  )];
  const cCalls = cCallIds.map((cCallRef): ReplayCCallState => {
    const rows = events.filter(
      (event) => event.aggregateType === "c_call" && event.aggregateId === cCallRef,
    );
    validateCCallOrder(rows);
    const evidenceRows = rows.filter((event) => event.kind === "c_call_evidenced");
    const openedEvent = rows.find((event) => event.kind === "c_call_opened");
    const resultEvent = rows.find((event) => event.kind === "c_call_result_admitted");
    const judgmentEvent = rows.find((event) => event.kind === "c_call_judged");
    const attempt = openedEvent === undefined
      ? null
      : positiveIntegerField(openedEvent, "attempt");
    const openedPayload = openedEvent === undefined || !isRecord(openedEvent.payload)
      ? null
      : openedEvent.payload;
    const batchRef = openedPayload?.batchRef;
    const taskOrdinal = openedPayload?.taskOrdinal;
    const programLocusRef = openedEvent === undefined
      ? null
      : stringField(openedEvent, "programLocusRef");
    const retryPath = openedEvent === undefined
      ? null
      : positiveIntegerArrayField(openedEvent, "retryPath");
    if (
      openedEvent === undefined ||
      openedPayload === null ||
      !Object.hasOwn(openedPayload, "batchRef") ||
      !Object.hasOwn(openedPayload, "taskOrdinal") ||
      (batchRef !== null && typeof batchRef !== "string") ||
      (taskOrdinal !== null &&
        (!Number.isSafeInteger(taskOrdinal) || (taskOrdinal as number) < 0)) ||
      attempt === null ||
      programLocusRef === null ||
      retryPath === null
    ) {
      throw new TypeError(`incomplete CCall identity payload at ${cCallRef}`);
    }
    let status: ReplayCCallState["status"] = "opened";
    if (rows.some((event) => event.kind === "c_call_fibre_selected")) status = "fibre_selected";
    if (resultEvent !== undefined) status = "result_admitted";
    if (judgmentEvent !== undefined) status = "judged";
    return {
      cCallRef,
      batchRef: batchRef as string | null,
      taskOrdinal: taskOrdinal as number | null,
      attempt,
      programLocusRef,
      retryPath,
      eventKinds: rows.map((event) => event.kind),
      evidenceRefs: evidenceRows
        .map((event) => stringField(event, "evidenceRef"))
        .filter((value): value is string => value !== null),
      resultRef: resultEvent === undefined ? null : stringField(resultEvent, "resultRef"),
      resultDigest: resultEvent === undefined
        ? null
        : stringField(resultEvent, "resultDigest") as Sha256Digest | null,
      resultClass: resultEvent === undefined ? null : stringField(resultEvent, "resultClass"),
      resultContractRef: resultEvent === undefined ? null : stringField(resultEvent, "contractRef"),
      resultValueKind: resultEvent === undefined ? null : stringField(resultEvent, "valueKind"),
      resultValue: resultEvent !== undefined && isRecord(resultEvent.payload)
        ? (resultEvent.payload.value ?? null)
        : null,
      judgmentRef: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgmentRef"),
      judgment: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgment"),
      status,
    };
  });

  const routes = events
    .filter((event) => event.kind === "traversal_route_admitted")
    .map((event): ReplayRouteState => {
      const routeKind = stringField(event, "routeKind");
      if (
        routeKind !== "advance" &&
        routeKind !== "retry" &&
        routeKind !== "hold" &&
        routeKind !== "blocked" &&
        routeKind !== "failed" &&
        routeKind !== "terminal"
      ) {
        throw new TypeError(`invalid traversal route kind at ${event.eventId}`);
      }
      const routeRef = stringField(event, "routeRef");
      const routeDigest = stringField(event, "routeDigest");
      const declarationRef = stringField(event, "declarationRef");
      const declarationDigest = stringField(event, "declarationDigest");
      const sourceCursorRef = stringField(event, "sourceCursorRef");
      const sourceCursorDigest = stringField(event, "sourceCursorDigest");
      if (
        routeRef === null ||
        routeDigest === null ||
        declarationRef === null ||
        declarationDigest === null ||
        sourceCursorRef === null ||
        sourceCursorDigest === null
      ) {
        throw new TypeError(`incomplete traversal route payload at ${event.eventId}`);
      }
      return {
        routeRef,
        routeDigest: routeDigest as Sha256Digest,
        routeKind,
        declarationRef,
        declarationDigest: declarationDigest as Sha256Digest,
        sourceCursorRef,
        sourceCursorDigest: sourceCursorDigest as Sha256Digest,
        targetCursorRef: stringField(event, "targetCursorRef"),
        targetCursorDigest: stringField(event, "targetCursorDigest") as Sha256Digest | null,
        cCallRef: stringField(event, "cCallRef"),
        judgmentRef: stringField(event, "judgmentRef"),
        admissionEventRef: event.eventId,
      };
    });

  const fanOutCompletions = events
    .filter((event) => event.kind === "fan_out_completion_admitted")
    .map(fanOutCompletionFromEvent);

  const actorInvocationIds = [...new Set(
    events
      .filter((event) => event.aggregateType === "actor_invocation")
      .map((event) => event.aggregateId),
  )];
  const actorProcesses = actorInvocationIds.map(
    (actorInvocationRef): ReplayActorProcessState => {
      const actorRows = events.filter(
        (event) => event.aggregateId === actorInvocationRef ||
          event.parentAggregateId === actorInvocationRef,
      );
      const opened = actorRows.find((event) => event.kind === "actor_invocation_started");
      const processStarted = actorRows.find((event) => event.kind === "actor_process_started");
      const processExited = actorRows.find((event) => event.kind === "actor_process_exited");
      const artifact = actorRows.find(
        (event) => event.kind === "actor_result_artifact_observed",
      );
      const closed = actorRows.find((event) => event.kind === "actor_invocation_closed");
      const failed = actorRows.find((event) => event.kind === "actor_invocation_failed");
      const exitStatus = processExited === undefined || !isRecord(processExited.payload)
        ? null
        : processExited.payload.status;
      return {
        actorInvocationRef,
        actorRef: opened === undefined ? null : stringField(opened, "actorRef"),
        transportBindingRef: opened === undefined
          ? null
          : stringField(opened, "transportBindingRef"),
        transportBindingDigest: opened === undefined
          ? null
          : stringField(opened, "transportBindingDigest") as Sha256Digest | null,
        processRef: processStarted === undefined
          ? actorRows.find((event) => event.aggregateType === "process")?.aggregateId ?? null
          : stringField(processStarted, "processRef"),
        streamEventRefs: actorRows
          .filter((event) =>
            event.kind === "actor_process_stdout_observed" ||
            event.kind === "actor_process_stderr_observed")
          .map((event) => event.eventId),
        timedOut: actorRows.some((event) => event.kind === "actor_process_timeout_observed"),
        signalSequence: actorRows
          .filter((event) => event.kind === "actor_process_signal_requested")
          .map((event) => stringField(event, "signal"))
          .filter((value): value is string => value !== null),
        exitStatus: Number.isSafeInteger(exitStatus) ? exitStatus as number : null,
        exitSignal: processExited === undefined ? null : stringField(processExited, "signal"),
        terminationConfirmed:
          processExited !== undefined &&
          !actorRows.some(
            (event) => event.kind === "actor_process_termination_unconfirmed",
          ),
        transportDigest: artifact === undefined
          ? null
          : stringField(artifact, "transportDigest") as Sha256Digest | null,
        status: failed !== undefined
          ? "failed"
          : closed !== undefined
            ? "closed"
            : "active",
      };
    },
  );

  const runOpen = events.find((event) => event.kind === "run_segment_opened");
  const graphCallOpen = events.find(
    (event) =>
      event.kind === "graph_call_opened" &&
      stringField(event, "parentFrameId") === null,
  );
  const frameOpen = graphCallOpen === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "frame_opened" &&
          event.graphCallId === graphCallOpen.graphCallId,
      );
  const traversalCursor = events.find(
    (event) => event.kind === "traversal_cursor_entered",
  );
  const terminal = frameOpen === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "terminal_reached" &&
          event.frameId === frameOpen.frameId,
      );
  const frameClosed = frameOpen === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "frame_closed" &&
          event.frameId === frameOpen.frameId,
      );
  const graphCallClosed = graphCallOpen === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "graph_call_closed" &&
          event.graphCallId === graphCallOpen.graphCallId,
      );
  const runClosed = events.find((event) => event.kind === "run_closed");
  const runStopped = events.find((event) => event.kind === "run_stopped");
  const invocationRefused = events.find((event) => event.kind === "invocation_refused");
  const runtimeFailure = events.find((event) => event.kind === "runtime_failure_observed");
  const eventStoreDigest = store.digest(scope);
  const body = {
    eventStoreDigest,
    eventCount: events.length,
    lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
    runId: runOpen?.runId ?? null,
    graphCallId: graphCallOpen?.graphCallId ?? null,
    frameId: frameOpen?.frameId ?? null,
    traversalCursorRef: traversalCursor === undefined
      ? null
      : stringField(traversalCursor, "cursorRef"),
    traversalCursorDigest: traversalCursor === undefined
      ? null
      : stringField(traversalCursor, "cursorDigest") as Sha256Digest | null,
    traversalCursorEventRef: traversalCursor?.eventId ?? null,
    cCalls,
    routes,
    fanOutCompletions,
    actorProcesses,
    activeFluents: [...activeFluents].sort(),
    terminalReachedEventRef: terminal?.eventId ?? null,
    frameClosedEventRef: frameClosed?.eventId ?? null,
    graphCallClosedEventRef: graphCallClosed?.eventId ?? null,
    runClosedEventRef: runClosed?.eventId ?? null,
    runStoppedEventRef: runStopped?.eventId ?? null,
    invocationRefusalEventRef: invocationRefused?.eventId ?? null,
    runtimeFailureEventRef: runtimeFailure?.eventId ?? null,
    runtimeStatus: runtimeFailure !== undefined
      ? "failed" as const
      : runClosed !== undefined
        ? "closed" as const
        : runStopped !== undefined
          ? "blocked" as const
          : invocationRefused !== undefined
            ? "refused" as const
            : runOpen !== undefined
              ? "active" as const
              : "workspace" as const,
  };
  const replayDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "replay_state" as const,
    schemaVersion: "5.0.0" as const,
    replayRef: `replay://abiogenesis/${replayDigest.slice("sha256:".length)}`,
    replayDigest,
    ...body,
  }) as ReplayState;
}
