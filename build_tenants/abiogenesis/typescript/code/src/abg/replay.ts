import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  constructRunActiveFluent,
  constructRunClosedFluent,
  constructRunTerminalFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  runtimeFluentKey,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type {
  AbgEventStore,
  RootEventKind,
  RuntimeEvent,
  RuntimeEventScope,
} from "./event_store.js";
import { ROOT_EVENT_CONTRACT_DIGEST } from "./event_store.js";
import { projectCCallPhase } from "./c_call.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import {
  projectFhContinuations,
  type ReplayContinuationState,
} from "./continuation.js";
import type {
  ConstructionIntent,
  GraphSpanReentryProjection,
  NextActionProjection,
  TraversalRouteKind,
} from "./traversal_route.js";

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
  readonly consumedAvailabilityRefs: readonly string[] | null;
  readonly contractRef: string | null;
  readonly replayStateDigest: Sha256Digest | null;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: NextActionProjection;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
  readonly constructionIntentRef?: string;
  readonly constructionIntentDigest?: Sha256Digest;
  readonly constructionIntent?: ConstructionIntent;
  readonly constructionIntentAdmissionEventRef?: string;
  readonly admissionEventRef: string;
}

export interface ReplayConstructionDeltaState {
  readonly deltaRef: string;
  readonly deltaDigest: Sha256Digest;
  readonly actionEvaluationAdmissionRef: string;
  readonly actionEvaluationAdmissionDigest: Sha256Digest;
  readonly actionEvaluationAdmission: Readonly<Record<string, JsonValue>>;
  readonly actionEvaluation: Readonly<Record<string, JsonValue>>;
  readonly constructionCompositionRef: string;
  readonly constructionCompositionDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly constructionIntentDigest: Sha256Digest;
  readonly targetOutcomeRef: string;
  readonly edgeFulfillmentLedgerRef: string;
  readonly edgeFulfillmentLedgerDigest: Sha256Digest;
  readonly edgeClosureDecisionRef: string;
  readonly edgeClosureDecisionDigest: Sha256Digest;
  readonly edgeClosureDecision: Readonly<Record<string, JsonValue>>;
  readonly semanticEvidenceAssetRefs: readonly string[];
  readonly runtimeEvidenceEventRefs: readonly string[];
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

export interface RunQuiescenceProjection {
  readonly kind: "run_quiescence_projection";
  readonly runId: string;
  readonly prefixDigest: Sha256Digest;
  readonly rootGraphCallId: string | null;
  readonly rootFrameId: string | null;
  readonly terminalRouteRef: string | null;
  readonly terminalCCallRef: string | null;
  readonly disposition: "active" | "invalid" | "non_quiescent" | "quiescent_for_close";
  readonly blockingFluents: readonly string[];
}

const RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS = new Set([
  "actor_cleanup_live",
  "actor_cleanup_pending",
  "actor_invocation_active",
  "actor_result_artifact_available",
  "actor_stderr_available",
  "actor_stdout_available",
  "actor_transport_binding_admitted",
  "actor_process_active",
  "actor_process_live",
  "c_call_active",
  "continuation_open",
  "continuation_response_available",
  "frame_active",
  "frame_held",
  "graph_call_active",
  "interaction_pending",
  "locus_active",
  "parent_waiting_on_child",
  "retry_attempt_active",
  "retry_progress_available",
]);

const RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS = new Set([
  "actor_invocation_closed",
  "actor_invocation_failed",
  "actor_process_exited",
  "actor_process_signal_requested",
  "actor_process_spawn_failed",
  "actor_process_termination_unconfirmed",
  "actor_process_timed_out",
  "continuation_terminated",
  "frame_blocked",
  "frame_closed",
  "frame_failed",
  "graph_call_closed",
  "run_closed",
  "run_terminal",
  "runtime_failure",
  "terminal_admitted",
]);

const RUN_QUIESCENCE_RUN_INDEPENDENT_FLUENTS = new Set([
  "basis_admitted",
  "continuation_reentry_link_available",
  "implementation_admitted",
  "invocation_admitted",
  "invocation_refused",
  "public_operation_artifact_available",
  "public_operation_ingress_admitted",
]);

export function projectRunQuiescence(
  prefix: ValidatedRuntimeEventPrefix,
): RunQuiescenceProjection {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const runIds = [...new Set(events.flatMap((event) =>
    event.runId === undefined ? [] : [event.runId]
  ))];
  if (runIds.length !== 1) {
    throw new TypeError("Run quiescence requires one exact Run-scoped prefix");
  }
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  const runId = runIds[0]!;
  const activeRun = projection.holds.filter((fluent) =>
    fluent.name === "run_active" && fluent.identity === runId
  );
  const activeGraphCalls = projection.holds.filter((fluent) =>
    fluent.name === "graph_call_active"
  );
  const activeFrames = projection.holds.filter((fluent) =>
    fluent.name === "frame_active"
  );
  const terminalRoutes = projection.holds.filter((fluent) =>
    fluent.name === "terminal_route_available"
  );
  const rootGraphCallId = activeGraphCalls.length === 1
    ? activeGraphCalls[0]!.identity
    : null;
  const rootFrameId = activeFrames.length === 1
    ? activeFrames[0]!.identity
    : null;
  const terminalRouteRef = terminalRoutes.length === 1
    ? terminalRoutes[0]!.identity
    : null;
  const terminalRouteEvent = terminalRouteRef === null
    ? undefined
    : events.find((event) =>
      event.kind === "traversal_route_admitted" &&
      isRecord(event.payload) && event.payload.routeRef === terminalRouteRef
    );
  const terminalCCallRef = terminalRouteEvent !== undefined &&
      isRecord(terminalRouteEvent.payload) &&
      typeof terminalRouteEvent.payload.cCallRef === "string"
    ? terminalRouteEvent.payload.cCallRef
    : null;
  const closureSpineKeys = new Set([
    ...(activeRun.length === 1 ? [runtimeFluentKey(activeRun[0]!)] : []),
    ...(rootGraphCallId === null ? [] : [runtimeFluentKey(activeGraphCalls[0]!)]),
    ...(rootFrameId === null ? [] : [runtimeFluentKey(activeFrames[0]!)]),
    ...(terminalRouteRef === null ? [] : [runtimeFluentKey(terminalRoutes[0]!)]),
  ]);
  const unknownFluents = projection.holds.filter((fluent) =>
    !closureSpineKeys.has(runtimeFluentKey(fluent)) &&
    !RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS.has(fluent.name) &&
    !RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS.has(fluent.name) &&
    !RUN_QUIESCENCE_RUN_INDEPENDENT_FLUENTS.has(fluent.name)
  );
  const blockingFluents = projection.holds
    .filter((fluent) =>
      (!closureSpineKeys.has(runtimeFluentKey(fluent)) &&
        RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS.has(fluent.name)) ||
      unknownFluents.includes(fluent)
    )
    .map(runtimeFluentKey)
    .sort();
  const terminal = holdsAt(projection, constructRunTerminalFluent(runId)) ||
    holdsAt(projection, constructRunClosedFluent(runId));
  const active = holdsAt(projection, constructRunActiveFluent(runId));
  return deepFreeze({
    kind: "run_quiescence_projection" as const,
    runId,
    prefixDigest: sha256Canonical(events as unknown as JsonValue),
    rootGraphCallId,
    rootFrameId,
    terminalRouteRef,
    terminalCCallRef,
    disposition: terminal
      ? blockingFluents.length === 0
        ? "quiescent_for_close" as const
        : "non_quiescent" as const
      : active && activeRun.length === 1 && activeGraphCalls.length === 1 &&
          activeFrames.length === 1 && terminalRoutes.length === 1
        ? blockingFluents.length === 0
          ? "quiescent_for_close" as const
          : "non_quiescent" as const
        : active
          ? "active" as const
        : "invalid" as const,
    blockingFluents: Object.freeze(blockingFluents),
  });
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
  readonly constructionDeltas: readonly ReplayConstructionDeltaState[];
  readonly fanOutCompletions: readonly FanOutCompletionAdmission[];
  readonly continuations: readonly ReplayContinuationState[];
  readonly actorProcesses: readonly ReplayActorProcessState[];
  readonly activeFluents: readonly string[];
  readonly terminalReachedEventRef: string | null;
  readonly frameClosedEventRef: string | null;
  readonly graphCallClosedEventRef: string | null;
  readonly runClosedEventRef: string | null;
  readonly runStoppedEventRef: string | null;
  readonly runStoppedDisposition: string | null;
  readonly invocationRefusalEventRef: string | null;
  readonly runtimeFailureEventRef: string | null;
  readonly runtimeStatus:
    | "active"
    | "blocked"
    | "closed"
    | "failed"
    | "gap_stopped"
    | "held"
    | "refused"
    | "stopped"
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

function stringArrayField(
  event: RuntimeEvent,
  name: string,
): readonly string[] | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return Array.isArray(value) &&
      value.every((entry) => typeof entry === "string" && entry.length > 0)
    ? value as readonly string[]
    : null;
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

export function replay(store: AbgEventStore, scope?: RuntimeEventScope): ReplayState {
  const events = store.readAll();
  const fullPrefix = selectValidatedRuntimeEventPrefix(events);
  const prefix = scope === undefined
    ? fullPrefix
    : selectValidatedRuntimeEventPrefix(events, scope);
  return replayValidatedRuntimeEventPrefix(prefix, fullPrefix);
}

export function replayValidatedRuntimeEventPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  authorityPrefix: ValidatedRuntimeEventPrefix = prefix,
): ReplayState {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);

  const cCallIds = [...new Set(
    events
      .filter((event) => event.aggregateType === "c_call")
      .map((event) => event.aggregateId),
  )];
  const cCalls = cCallIds.map((cCallRef): ReplayCCallState => {
    const rows = events.filter(
      (event) => event.aggregateType === "c_call" && event.aggregateId === cCallRef,
    );
    const phase = projectCCallPhase(prefix, cCallRef);
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
    const status: ReplayCCallState["status"] = phase.phase === "judged"
      ? "judged"
      : phase.phase === "result_admitted"
        ? "result_admitted"
        : "fibre_selected";
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
        routeKind !== "re_enter" &&
        routeKind !== "retry" &&
        routeKind !== "hold" &&
        routeKind !== "gap_stop" &&
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
      const consumedAvailabilityRefs = stringArrayField(
        event,
        "consumedAvailabilityRefs",
      );
      const replayStateDigest = stringField(event, "replayStateDigest");
      const intentEvent = events.find(
        (candidate) =>
          candidate.kind === "construction_intent_selected" &&
          stringField(candidate, "routeRef") === routeRef,
      );
      const nextActionProjectionRef = stringField(
        intentEvent ?? event,
        "nextActionProjectionRef",
      );
      const nextActionProjectionDigest = stringField(
        intentEvent ?? event,
        "nextActionProjectionDigest",
      );
      const constructionIntentRef = stringField(
        intentEvent ?? event,
        "constructionIntentRef",
      );
      const constructionIntentDigest = stringField(
        intentEvent ?? event,
        "constructionIntentDigest",
      );
      const nextActionProjection =
        intentEvent !== undefined &&
            isRecord(intentEvent.payload) &&
            isRecord(intentEvent.payload.nextActionProjection)
          ? intentEvent.payload.nextActionProjection
          : isRecord(event.payload) &&
              isRecord(event.payload.nextActionProjection)
            ? event.payload.nextActionProjection
            : null;
      const constructionIntent =
        intentEvent !== undefined &&
          isRecord(intentEvent.payload) &&
          isRecord(intentEvent.payload.constructionIntent)
          ? intentEvent.payload.constructionIntent
          : null;
      const graphSpanReentryProjectionRef = stringField(
        event,
        "graphSpanReentryProjectionRef",
      );
      const graphSpanReentryProjectionDigest = stringField(
        event,
        "graphSpanReentryProjectionDigest",
      );
      const graphSpanReentryProjection =
        isRecord(event.payload) &&
          isRecord(event.payload.graphSpanReentryProjection)
          ? event.payload.graphSpanReentryProjection
          : null;
      const graphSpanReentryValues = [
        graphSpanReentryProjectionRef,
        graphSpanReentryProjectionDigest,
        graphSpanReentryProjection,
      ];
      if (
        routeRef === null ||
        routeDigest === null ||
        declarationRef === null ||
        declarationDigest === null ||
        sourceCursorRef === null ||
        sourceCursorDigest === null ||
        (
          routeKind === "re_enter" &&
          (
            graphSpanReentryValues.some((value) => value === null) ||
            nextActionProjectionRef !== null ||
            nextActionProjectionDigest !== null ||
            nextActionProjection !== null ||
            constructionIntentRef !== null ||
            constructionIntentDigest !== null ||
            constructionIntent !== null
          )
        ) ||
        (
          routeKind !== "re_enter" &&
          graphSpanReentryValues.some((value) => value !== null)
        ) ||
        (
          routeKind !== "gap_stop" &&
          [
            nextActionProjectionRef,
            nextActionProjectionDigest,
            nextActionProjection,
            constructionIntentRef,
            constructionIntentDigest,
            constructionIntent,
          ].filter((value) => value !== null).length !== 0 &&
          [
            nextActionProjectionRef,
            nextActionProjectionDigest,
            nextActionProjection,
            constructionIntentRef,
            constructionIntentDigest,
            constructionIntent,
          ].some((value) => value === null)
        ) ||
        (
          routeKind === "gap_stop" &&
          (
            nextActionProjectionRef === null ||
            nextActionProjectionDigest === null ||
            nextActionProjection === null ||
            constructionIntentRef !== null ||
            constructionIntentDigest !== null ||
            constructionIntent !== null
          )
        )
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
        consumedAvailabilityRefs,
        contractRef: stringField(event, "contractRef"),
        replayStateDigest: replayStateDigest as Sha256Digest | null,
        ...(nextActionProjectionRef === null
          ? {}
          : {
              nextActionProjectionRef,
              nextActionProjectionDigest:
                nextActionProjectionDigest as Sha256Digest,
              nextActionProjection:
                nextActionProjection as unknown as NextActionProjection,
              ...(intentEvent === undefined
                ? {}
                : {
                    constructionIntentRef:
                      constructionIntentRef as string,
                    constructionIntentDigest:
                      constructionIntentDigest as Sha256Digest,
                    constructionIntent:
                      constructionIntent as unknown as ConstructionIntent,
                    constructionIntentAdmissionEventRef:
                      intentEvent.eventId,
                  }),
            }),
        ...(graphSpanReentryProjectionRef === null
          ? {}
          : {
              graphSpanReentryProjectionRef,
              graphSpanReentryProjectionDigest:
                graphSpanReentryProjectionDigest as Sha256Digest,
              graphSpanReentryProjection:
                graphSpanReentryProjection as unknown as
                  GraphSpanReentryProjection,
            }),
        admissionEventRef: event.eventId,
      };
    });

  const fanOutCompletions = events
    .filter((event) => event.kind === "fan_out_completion_admitted")
    .map((event): FanOutCompletionAdmission => {
      const projected = projectExactFanOutCompletion(prefix, {
        mode: "event_canonical",
        admissionEventRef: event.eventId,
      });
      if (
        projected === null ||
        projected.kind !== "fan_out_completion_admission"
      ) {
        throw new TypeError(
          `invalid fan-out completion truth at ${event.eventId}`,
        );
      }
      return projected;
    });
  const constructionDeltas = events
    .filter((event) => event.kind === "construction_delta_observed")
    .map((event): ReplayConstructionDeltaState => {
      const required = [
        "deltaRef",
        "deltaDigest",
        "actionEvaluationAdmissionRef",
        "actionEvaluationAdmissionDigest",
        "constructionCompositionRef",
        "constructionCompositionDigest",
        "constructionIntentRef",
        "constructionIntentDigest",
        "targetOutcomeRef",
        "edgeFulfillmentLedgerRef",
        "edgeFulfillmentLedgerDigest",
        "edgeClosureDecisionRef",
        "edgeClosureDecisionDigest",
      ] as const;
      const values = Object.fromEntries(
        required.map((key) => [key, stringField(event, key)]),
      );
      const semanticEvidenceAssetRefs = stringArrayField(
        event,
        "semanticEvidenceAssetRefs",
      );
      const runtimeEvidenceEventRefs = stringArrayField(
        event,
        "runtimeEvidenceEventRefs",
      );
      const actionEvaluationAdmission = isRecord(event.payload)
        ? event.payload.actionEvaluationAdmission
        : undefined;
      const actionEvaluation = isRecord(event.payload)
        ? event.payload.actionEvaluation
        : undefined;
      const edgeClosureDecision = isRecord(event.payload)
        ? event.payload.edgeClosureDecision
        : undefined;
      if (
        Object.values(values).some((value) => value === null) ||
        semanticEvidenceAssetRefs === null ||
        runtimeEvidenceEventRefs === null ||
        !isRecord(actionEvaluationAdmission) ||
        !isRecord(actionEvaluation) ||
        !isRecord(edgeClosureDecision)
      ) {
        throw new TypeError(
          `incomplete construction delta payload at ${event.eventId}`,
        );
      }
      const {
        kind,
        schemaVersion,
        actionEvaluationAdmissionRef,
        actionEvaluationAdmissionDigest,
        ...actionEvaluationAdmissionBody
      } = actionEvaluationAdmission;
      if (
        kind !== "admitted_action_evaluation" ||
        schemaVersion !== "5.0.0" ||
        actionEvaluationAdmissionRef !==
          values.actionEvaluationAdmissionRef ||
        actionEvaluationAdmissionDigest !==
          values.actionEvaluationAdmissionDigest ||
        sha256Canonical(actionEvaluationAdmissionBody as JsonValue) !==
          values.actionEvaluationAdmissionDigest ||
        actionEvaluationAdmissionBody.constructionCompositionRef !==
          values.constructionCompositionRef ||
        actionEvaluationAdmissionBody.constructionCompositionDigest !==
          values.constructionCompositionDigest ||
        actionEvaluationAdmissionBody.constructionIntentRef !==
          values.constructionIntentRef ||
        actionEvaluationAdmissionBody.constructionIntentDigest !==
          values.constructionIntentDigest ||
        actionEvaluationAdmissionBody.edgeFulfillmentLedgerRef !==
          values.edgeFulfillmentLedgerRef ||
        actionEvaluationAdmissionBody.edgeFulfillmentLedgerDigest !==
          values.edgeFulfillmentLedgerDigest ||
        actionEvaluationAdmissionBody.edgeClosureDecisionRef !==
          values.edgeClosureDecisionRef ||
        actionEvaluationAdmissionBody.edgeClosureDecisionDigest !==
          values.edgeClosureDecisionDigest ||
        actionEvaluationAdmissionBody.workspaceBindingId !==
          stringField(event, "workspaceBindingId") ||
        actionEvaluationAdmissionBody.workspaceBindingDigest !==
          stringField(event, "workspaceBindingDigest") ||
        JSON.stringify(actionEvaluationAdmissionBody.semanticEvidenceAssetRefs) !==
          JSON.stringify(semanticEvidenceAssetRefs) ||
        JSON.stringify(actionEvaluationAdmissionBody.runtimeEvidenceEventRefs) !==
          JSON.stringify(runtimeEvidenceEventRefs) ||
        actionEvaluation.actionEvaluationRef !==
          actionEvaluationAdmissionBody.actionEvaluationRef ||
        actionEvaluation.actionEvaluationDigest !==
          actionEvaluationAdmissionBody.actionEvaluationDigest ||
        edgeClosureDecision.decisionRef !==
          values.edgeClosureDecisionRef ||
        edgeClosureDecision.decisionDigest !==
          values.edgeClosureDecisionDigest
      ) {
        throw new TypeError(
          `invalid action-evaluation admission at ${event.eventId}`,
        );
      }
      return {
        deltaRef: values.deltaRef!,
        deltaDigest: values.deltaDigest! as Sha256Digest,
        actionEvaluationAdmissionRef:
          values.actionEvaluationAdmissionRef!,
        actionEvaluationAdmissionDigest:
          values.actionEvaluationAdmissionDigest! as Sha256Digest,
        actionEvaluationAdmission,
        actionEvaluation,
        constructionCompositionRef:
          values.constructionCompositionRef!,
        constructionCompositionDigest:
          values.constructionCompositionDigest! as Sha256Digest,
        constructionIntentRef: values.constructionIntentRef!,
        constructionIntentDigest:
          values.constructionIntentDigest! as Sha256Digest,
        targetOutcomeRef: values.targetOutcomeRef!,
        edgeFulfillmentLedgerRef: values.edgeFulfillmentLedgerRef!,
        edgeFulfillmentLedgerDigest:
          values.edgeFulfillmentLedgerDigest! as Sha256Digest,
        edgeClosureDecisionRef: values.edgeClosureDecisionRef!,
        edgeClosureDecisionDigest:
          values.edgeClosureDecisionDigest! as Sha256Digest,
        edgeClosureDecision,
        semanticEvidenceAssetRefs,
        runtimeEvidenceEventRefs,
        admissionEventRef: event.eventId,
      };
    });

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
  const continuations = projectFhContinuations(
    prefix,
    eventCalculus,
    authorityPrefix,
  );
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
  const runStoppedRows = events.filter(
    (event) =>
      event.kind === "run_stopped" &&
      stringField(event, "disposition") !== null,
  );
  const invocationRefused = events.find((event) => event.kind === "invocation_refused");
  const runtimeFailure = events.find((event) => event.kind === "runtime_failure_observed");
  if (runStoppedRows.length > 1) {
    throw new TypeError("replay requires zero or one exact run_stopped event");
  }
  const runStopped = runStoppedRows[0];
  const runId = runOpen?.runId ?? null;
  const runTerminalHeld = runId !== null && holdsAt(
    eventCalculus,
    constructRunTerminalFluent(runId),
  );
  if ((runStopped === undefined) !== !runTerminalHeld) {
    throw new TypeError(
      "replay run_stopped event and run_terminal HoldsAt truth disagree",
    );
  }
  if (
    runStopped !== undefined &&
    (
      runId === null ||
      runStopped.runId !== runId ||
      runStopped.aggregateId !== runId
    )
  ) {
    throw new TypeError("replay run_stopped event differs from the selected Run");
  }
  const runStoppedDisposition = runStopped === undefined
    ? null
    : stringField(runStopped, "disposition");
  const operatorRunStoppedHeld = runId !== null && holdsAt(
    eventCalculus,
    constructRuntimeFluent({ name: "operator_run_stopped", identity: runId }),
  );
  const operatorRunStopped = !operatorRunStoppedHeld
    ? undefined
    : [...events].reverse().find(
        (event) =>
          event.kind === "run_stopped" &&
          event.runId === runId &&
          stringField(event, "reasonKind") !== null,
      );
  const projectedRunStoppedEvent = runStopped ?? operatorRunStopped;
  const projectedRunStoppedDisposition = runStoppedDisposition ??
    (operatorRunStopped === undefined
      ? null
      : stringField(operatorRunStopped, "reasonKind"));
  const runStoppedRouteRef = runStopped === undefined
    ? null
    : stringField(runStopped, "routeRef");
  const runStoppedRoutes = runStoppedRouteRef === null
    ? []
    : routes.filter((route) => route.routeRef === runStoppedRouteRef);
  if (
    runStopped !== undefined &&
    (
      runStoppedDisposition === null ||
      runStoppedRoutes.length !== 1 ||
      !runStopped.causationEventRefs.includes(
        runStoppedRoutes[0]!.admissionEventRef,
      ) ||
      runClosed !== undefined ||
      runtimeFailure !== undefined ||
      holdsAt(eventCalculus, constructRunClosedFluent(runId!))
    )
  ) {
    throw new TypeError(
      "replay run_stopped history has contradictory route, causation, disposition, or terminal truth",
    );
  }
  const eventStoreDigest = sha256Canonical(events as unknown as JsonValue);
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
    constructionDeltas,
    fanOutCompletions,
    continuations,
    actorProcesses,
    activeFluents: eventCalculus.holds.map(runtimeFluentKey),
    terminalReachedEventRef: terminal?.eventId ?? null,
    frameClosedEventRef: frameClosed?.eventId ?? null,
    graphCallClosedEventRef: graphCallClosed?.eventId ?? null,
    runClosedEventRef: runClosed?.eventId ?? null,
    runStoppedEventRef: projectedRunStoppedEvent?.eventId ?? null,
    runStoppedDisposition: projectedRunStoppedDisposition,
    invocationRefusalEventRef: invocationRefused?.eventId ?? null,
    runtimeFailureEventRef: runtimeFailure?.eventId ?? null,
    runtimeStatus: runtimeFailure !== undefined
      ? "failed" as const
      : runClosed !== undefined
        ? "closed" as const
        : runTerminalHeld
          ? runStoppedDisposition === "gap_stop"
            ? "gap_stopped" as const
            : runStoppedDisposition === "blocked"
              ? "blocked" as const
              : runStoppedDisposition === "failed"
                ? "failed" as const
              : "stopped" as const
          : operatorRunStoppedHeld
            ? "stopped" as const
          : invocationRefused !== undefined
            ? "refused" as const
            : continuations.some(
                (continuation) =>
                  continuation.status === "open" ||
                  continuation.status === "responded",
              )
              ? "held" as const
            : runOpen?.runId !== undefined && holdsAt(
                eventCalculus,
                constructRunActiveFluent(runOpen.runId),
              )
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

export interface RunSemanticReplayPhysicalEventCoordinate {
  readonly eventRef: string;
  readonly eventId: string;
  readonly admissionOrdinal: number;
  readonly payloadDigest: Sha256Digest;
}

export interface RunSemanticReplayPhysicalCoordinates {
  readonly kind: "run_semantic_replay_physical_coordinates";
  readonly fullEventHistoryDigest: Sha256Digest;
  readonly scopedEventStoreDigest: Sha256Digest;
  readonly scopedReplayRef: string;
  readonly scopedReplayDigest: Sha256Digest;
  readonly events: readonly RunSemanticReplayPhysicalEventCoordinate[];
}

export interface RunSemanticEventAtom {
  readonly atomRef: string;
  readonly eventKind: RootEventKind;
  readonly semanticPayloadDigest: Sha256Digest;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly workflowVersion: RuntimeEvent["workflowVersion"];
  readonly aggregateType: RuntimeEvent["aggregateType"];
  readonly aggregateId: string;
  readonly parentAggregateId: string | null;
  readonly scopeClass: RuntimeEvent["scopeClass"];
  readonly basisId: string | null;
  readonly runId: string | null;
  readonly graphFunctionRef: string | null;
  readonly materializationRef: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
}

export interface RunSemanticRelationEdge {
  readonly sourceAtom: string;
  readonly relation: string;
  readonly targetAtom: string;
}

export interface RunSemanticRelationView {
  readonly kind: "run_semantic_relation_view";
  readonly schemaVersion: "5.0.0";
  readonly viewRef: string;
  readonly viewDigest: Sha256Digest;
  readonly eventContractDigest: Sha256Digest;
  readonly runId: string;
  readonly eventCount: number;
  readonly eventKinds: readonly RootEventKind[];
  readonly eventAtoms: readonly RunSemanticEventAtom[];
  readonly relations: readonly RunSemanticRelationEdge[];
  readonly ownerFacts: readonly Readonly<Record<string, JsonValue>>[];
  readonly lifecycle: Readonly<Record<string, JsonValue>>;
  readonly outcome: Readonly<Record<string, JsonValue>>;
  readonly holdsAt: readonly JsonValue[];
  readonly runtimeStatus: ReplayState["runtimeStatus"];
  readonly physicalCoordinates: RunSemanticReplayPhysicalCoordinates;
}

export type RunSemanticReplayProjection = RunSemanticRelationView;

type ClosedPathSegment = string | "*";

interface ClosedTypedReferencePath {
  readonly path: readonly ClosedPathSegment[];
  readonly optional?: boolean;
  readonly nullable?: boolean;
}

const EVENT_TYPED_REFERENCE_PATHS: Partial<
  Readonly<Record<RootEventKind, readonly ClosedTypedReferencePath[]>>
> = Object.freeze({
  public_operation_artifact_admitted: [{
    path: ["payload", "causationEventRefs", "*"],
    optional: true,
  }],
  invocation_admitted: [
    { path: ["payload", "reentryBasis", "sourceRouteEventRef"], optional: true },
    { path: ["payload", "reentryBasis", "sourceRunStoppedEventRef"], optional: true },
    { path: ["payload", "sourceResultBasis", "sourceResultAdmissionEventRef"], optional: true },
    { path: ["payload", "sourceResultBasis", "sourceResultJudgmentEventRef"], optional: true },
  ],
  actor_invocation_closed: [
    { path: ["payload", "consumedArtifactEventRef"], optional: true, nullable: true },
    { path: ["payload", "consumedStdoutEventRefs", "*"], optional: true },
    { path: ["payload", "consumedStderrEventRefs", "*"], optional: true },
  ],
  actor_invocation_failed: [
    { path: ["payload", "consumedArtifactEventRef"], optional: true, nullable: true },
    { path: ["payload", "consumedStdoutEventRefs", "*"], optional: true },
    { path: ["payload", "consumedStderrEventRefs", "*"], optional: true },
  ],
  c_call_evidenced: [
    { path: ["payload", "foldbackEventRef"], optional: true },
    { path: ["payload", "childTerminalEventRef"], optional: true },
  ],
  retry_progress_recorded: [{
    path: ["payload", "completionWitnessEventRef"],
    optional: true,
  }],
  fan_out_completion_admitted: [
    { path: ["payload", "taskRows", "*", "foldbackEventRef"], optional: true },
    { path: ["payload", "completedRows", "*", "foldbackEventRef"], optional: true },
    { path: ["payload", "stoppingRow", "foldbackEventRef"], optional: true },
    { path: ["payload", "stoppingRow", "stoppingEventRef"], optional: true },
  ],
  child_foldback_admitted: [{
    path: ["payload", "childTerminalEventRef"],
  }],
  construction_delta_observed: [
    { path: ["payload", "runtimeEvidenceEventRefs", "*"] },
    { path: ["payload", "actionEvaluationAdmission", "runtimeEvidenceEventRefs", "*"] },
    { path: ["payload", "actionEvaluation", "runtimeArchiveInspection", "runtimeEvidenceEventRefs", "*"], optional: true },
  ],
  fh_interaction_opened: [
    { path: ["payload", "causedByEventRef"] },
    { path: ["payload", "cCall", "openedEventRef"] },
    { path: ["payload", "cCall", "fibreSelectedEventRef"] },
    { path: ["payload", "openedTraversalScope", "runOpenEventRef"] },
    { path: ["payload", "openedTraversalScope", "graphCallOpenEventRef"] },
    { path: ["payload", "openedTraversalScope", "frameOpenEventRef"] },
    { path: ["payload", "pendingResult", "admissionEventRef"] },
    { path: ["payload", "pendingJudgment", "admissionEventRef"] },
  ],
  fh_interaction_responded: [{
    path: ["payload", "publicOperationEventRef"],
  }],
  fh_interaction_resume_admitted: [
    { path: ["payload", "openedEventRef"] },
    { path: ["payload", "respondedEventRef"] },
    { path: ["payload", "publicOperationEventRef"] },
  ],
  continuation_abandoned: [{ path: ["payload", "causedByEventRef"] }],
  continuation_superseded: [{ path: ["payload", "causedByEventRef"] }],
  frame_closed: [{ path: ["payload", "terminalReachedEventRef"] }],
  graph_call_closed: [{ path: ["payload", "frameClosedEventRef"] }],
  run_closed: [{ path: ["payload", "graphCallClosedEventRef"] }],
});

interface LocatedReference {
  readonly relation: string;
  readonly value: JsonValue;
}

function isSemanticRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ACTION_EVALUATION_BASIS_REFERENCE_PATHS = Object.freeze([
  ["constructionIntent", "admissionEventRef"],
  ["admittedEvidence", "*", "admissionEventRef"],
  ["runtimeEvidenceEventRefs", "*"],
] as const);

function typedReferencePathsForEvent(
  event: RuntimeEvent,
): readonly ClosedTypedReferencePath[] {
  const fixed = EVENT_TYPED_REFERENCE_PATHS[event.kind] ?? [];
  if (!isSemanticRecord(event.payload)) return fixed;
  const valueField = event.kind === "fh_interaction_resume_admitted" &&
      event.payload.successorInputValueKind === "action_evaluation_basis"
    ? "successorInputValue"
    : null;
  return valueField === null
    ? fixed
    : Object.freeze([
        ...fixed,
        ...ACTION_EVALUATION_BASIS_REFERENCE_PATHS.map((path) => ({
          path: ["payload", valueField, ...path],
        })),
      ]);
}

function locateClosedTypedReferences(
  value: JsonValue,
  spec: ClosedTypedReferencePath,
): readonly LocatedReference[] {
  const walk = (
    current: JsonValue | undefined,
    depth: number,
    relation: string,
  ): readonly LocatedReference[] => {
    if (depth === spec.path.length) {
      return current === undefined ? [] : [{ relation, value: current }];
    }
    const segment = spec.path[depth]!;
    if (segment === "*") {
      if ((current === undefined || current === null) && spec.optional) return [];
      if (!Array.isArray(current)) {
        throw new TypeError(
          `run semantic relation requires one typed array at ${relation}`,
        );
      }
      return current.flatMap((entry, index) =>
        walk(entry, depth + 1, `${relation}[${index}]`)
      );
    }
    if ((current === undefined || current === null) && spec.optional) return [];
    if (!isSemanticRecord(current)) {
      throw new TypeError(
        `run semantic relation requires one typed carrier at ${relation || segment}`,
      );
    }
    if (!Object.hasOwn(current, segment)) {
      if (spec.optional) return [];
      throw new TypeError(
        `run semantic relation is missing typed path ${relation}.${segment}`,
      );
    }
    return walk(
      current[segment],
      depth + 1,
      relation.length === 0 ? segment : `${relation}.${segment}`,
    );
  };
  return walk(value, 0, "");
}

function relationEdges(
  events: readonly RuntimeEvent[],
  correspondence: ReadonlyMap<string, string>,
  fullEventIds: ReadonlySet<string>,
): readonly RunSemanticRelationEdge[] {
  const edges: RunSemanticRelationEdge[] = [];
  for (const event of events) {
    const sourceAtom = correspondence.get(event.eventId)!;
    const specs: readonly ClosedTypedReferencePath[] = [
      { path: ["causationEventRefs", "*"] },
      ...typedReferencePathsForEvent(event),
    ];
    for (const spec of specs) {
      const located = locateClosedTypedReferences(
        event as unknown as JsonValue,
        spec,
      );
      for (const reference of located) {
        if (reference.value === null && spec.nullable) continue;
        if (typeof reference.value !== "string") {
          throw new TypeError(
            `run semantic relation requires one string event reference at ${reference.relation}`,
          );
        }
        const targetAtom = correspondence.get(reference.value);
        if (targetAtom === undefined) {
          throw new TypeError(
            fullEventIds.has(reference.value)
              ? `run semantic relation encountered an out-of-scope event reference at ${reference.relation}`
              : `run semantic relation requires one admitted Run event identity at ${reference.relation}`,
          );
        }
        edges.push({ sourceAtom, relation: reference.relation, targetAtom });
      }
    }
  }
  return Object.freeze(edges);
}

function replaceClosedTypedReferences(
  current: JsonValue | undefined,
  spec: ClosedTypedReferencePath,
  path: readonly ClosedPathSegment[],
  correspondence: ReadonlyMap<string, string>,
  fullEventIds: ReadonlySet<string>,
  depth = 0,
  relation = "payload",
): JsonValue | undefined {
  if (depth === path.length) {
    if (current === null && spec.nullable) return null;
    if (typeof current !== "string") {
      throw new TypeError(
        `run semantic relation requires one string event reference at ${relation}`,
      );
    }
    const atom = correspondence.get(current);
    if (atom === undefined) {
      throw new TypeError(
        fullEventIds.has(current)
          ? `run semantic relation encountered an out-of-scope event reference at ${relation}`
          : `run semantic relation requires one admitted Run event identity at ${relation}`,
      );
    }
    return atom;
  }
  const segment = path[depth]!;
  if (segment === "*") {
    if ((current === undefined || current === null) && spec.optional) {
      return current;
    }
    if (!Array.isArray(current)) {
      throw new TypeError(
        `run semantic relation requires one typed array at ${relation}`,
      );
    }
    return current.map((entry, index) =>
      replaceClosedTypedReferences(
        entry,
        spec,
        path,
        correspondence,
        fullEventIds,
        depth + 1,
        `${relation}[${index}]`,
      )!
    );
  }
  if ((current === undefined || current === null) && spec.optional) {
    return current;
  }
  if (!isSemanticRecord(current)) {
    throw new TypeError(
      `run semantic relation requires one typed carrier at ${relation}`,
    );
  }
  if (!Object.hasOwn(current, segment)) {
    if (spec.optional) return current;
    throw new TypeError(
      `run semantic relation is missing typed path ${relation}.${segment}`,
    );
  }
  return {
    ...current,
    [segment]: replaceClosedTypedReferences(
      current[segment],
      spec,
      path,
      correspondence,
      fullEventIds,
      depth + 1,
      `${relation}.${segment}`,
    )!,
  };
}

function semanticPayloadDigest(
  event: RuntimeEvent,
  correspondence: ReadonlyMap<string, string>,
  fullEventIds: ReadonlySet<string>,
): Sha256Digest {
  let payload = event.payload as JsonValue;
  if (event.kind === "fh_interaction_resume_admitted") {
    if (!isSemanticRecord(payload)) {
      throw new TypeError(
        "run semantic relation requires one F_H resume payload",
      );
    }
    const { durablePrefixDigest: _physicalPrefixDigest, ...semanticPayload } =
      payload;
    payload = semanticPayload;
  }
  for (const spec of typedReferencePathsForEvent(event)) {
    if (spec.path[0] !== "payload") {
      throw new TypeError("run semantic relation requires one payload-rooted path");
    }
    payload = replaceClosedTypedReferences(
      payload,
      spec,
      spec.path.slice(1),
      correspondence,
      fullEventIds,
    )!;
  }
  return sha256Canonical(payload);
}

function requiredAtom(
  eventRef: string,
  correspondence: ReadonlyMap<string, string>,
  path: string,
): string {
  const atom = correspondence.get(eventRef);
  if (atom === undefined) {
    throw new TypeError(`run semantic relation lacks owner atom at ${path}`);
  }
  return atom;
}

function projectOwnerFacts(
  prefix: ValidatedRuntimeEventPrefix,
  replayState: ReplayState,
  continuations: readonly ReplayContinuationState[],
  correspondence: ReadonlyMap<string, string>,
): readonly Readonly<Record<string, JsonValue>>[] {
  const cCalls = replayState.cCalls.map((cCall) => {
    const phase = projectCCallPhase(prefix, cCall.cCallRef);
    if (phase.openedEventRef === null) {
      throw new TypeError("replayed CCall lacks its atomic opening pair");
    }
    return {
      owner: "c_call",
      ownerAtom: requiredAtom(phase.openedEventRef, correspondence, "c_call"),
      cCallRef: cCall.cCallRef,
      phase: phase.phase,
    } as Readonly<Record<string, JsonValue>>;
  });
  const routes = replayState.routes.map((route) => ({
    owner: "route",
    ownerAtom: requiredAtom(route.admissionEventRef, correspondence, "route"),
    routeKind: route.routeKind,
    declarationRef: route.declarationRef,
    cCallRef: route.cCallRef,
    contractRef: route.contractRef,
  } as Readonly<Record<string, JsonValue>>));
  const continuationFacts = continuations.map((continuation) => ({
    owner: "fh_continuation",
    ownerAtom: requiredAtom(
      continuation.openedEventRef,
      correspondence,
      "continuation",
    ),
    continuationRef: continuation.continuationRef,
    cCallRef: continuation.cCallRef,
    requestContractRef: continuation.requestContractRef,
    responseContractRef: continuation.responseContractRef,
    constructionIntentRef: continuation.constructionIntentRef,
    status: continuation.status,
  } as Readonly<Record<string, JsonValue>>));
  const fanOut = replayState.fanOutCompletions.map((completion) => ({
    owner: "fan_out_completion",
    ownerAtom: requiredAtom(
      completion.admissionEventRef,
      correspondence,
      "fan_out_completion",
    ),
    applicationRef: completion.applicationRef,
    batchRef: completion.batchRef,
    completionKind: completion.completionKind,
    taskOrdinals: completion.completionKind === "complete_vector"
      ? completion.taskRows.map((row) => row.ordinal)
      : [
          ...completion.completedRows.map((row) => row.ordinal),
          completion.stoppingRow.ordinal,
        ],
  } as Readonly<Record<string, JsonValue>>));
  const deltas = replayState.constructionDeltas.map((delta) => ({
    owner: "construction_delta",
    ownerAtom: requiredAtom(
      delta.admissionEventRef,
      correspondence,
      "construction_delta",
    ),
    constructionIntentRef: delta.constructionIntentRef,
    targetOutcomeRef: delta.targetOutcomeRef,
    semanticEvidenceAssetRefs: delta.semanticEvidenceAssetRefs,
  } as Readonly<Record<string, JsonValue>>));
  return Object.freeze([
    ...cCalls,
    ...routes,
    ...continuationFacts,
    ...fanOut,
    ...deltas,
  ]);
}

const EVENT_IDENTITY_FLUENT_NAMES = Object.freeze([
  "actor_process_signal_requested",
  "actor_result_artifact_available",
  "actor_stderr_available",
  "actor_stdout_available",
  "runtime_failure",
] as const);

function semanticHoldsAt(
  fluentRef: string,
  correspondence: ReadonlyMap<string, string>,
  fullEventIds: ReadonlySet<string>,
): JsonValue {
  for (const name of EVENT_IDENTITY_FLUENT_NAMES) {
    const prefix = `${name}(`;
    if (!fluentRef.startsWith(prefix) || !fluentRef.endsWith(")")) continue;
    const eventRef = fluentRef.slice(prefix.length, -1);
    const identityAtom = correspondence.get(eventRef);
    if (identityAtom === undefined) {
      throw new TypeError(
        fullEventIds.has(eventRef)
          ? `run semantic relation encountered out-of-scope HoldsAt identity ${name}`
          : `run semantic relation requires admitted HoldsAt identity ${name}`,
      );
    }
    return { name, identityAtom };
  }
  return fluentRef;
}

/**
 * Projects one Run as a single replay-owned semantic relation view. Runtime
 * carriers remain immutable physical truth; only closed typed event-reference
 * paths become positional relation edges. Product-owned JSON is never walked.
 */
export function projectRunSemanticReplayProjection(
  fullPrefix: ValidatedRuntimeEventPrefix,
  runId: string,
): RunSemanticRelationView {
  if (runId.length === 0) {
    throw new TypeError("run semantic relation requires one non-empty Run id");
  }
  const fullEvents = runtimeEventsFromValidatedPrefix(fullPrefix);
  const runPrefix = selectValidatedRuntimeEventPrefix(fullEvents, { runId });
  const events = runtimeEventsFromValidatedPrefix(runPrefix);
  if (
    events.length === 0 ||
    !events.some((event) => event.runId === runId) ||
    events.some((event) => event.runId !== undefined && event.runId !== runId)
  ) {
    throw new TypeError(
      "run semantic relation requires one exact causally closed Run prefix",
    );
  }
  const correspondence = new Map(
    events.map((event, index) => [event.eventId, `r${index + 1}`]),
  );
  if (correspondence.size !== events.length) {
    throw new TypeError("run semantic relation requires unique event identities");
  }
  const fullEventIds = new Set(fullEvents.map((event) => event.eventId));
  const replayState = replayValidatedRuntimeEventPrefix(runPrefix, fullPrefix);
  if (replayState.runId !== runId) {
    throw new TypeError("run semantic relation differs from its selected Run");
  }
  const continuations = projectFhContinuations(
    runPrefix,
    deriveRuntimeEventCalculusProjection(runPrefix),
    fullPrefix,
  );
  const eventAtoms = events.map((event): RunSemanticEventAtom => ({
    atomRef: correspondence.get(event.eventId)!,
    eventKind: event.kind,
    semanticPayloadDigest: semanticPayloadDigest(
      event,
      correspondence,
      fullEventIds,
    ),
    eventTime: event.eventTime,
    correlationId: event.correlationId,
    workflowVersion: event.workflowVersion,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    parentAggregateId: event.parentAggregateId,
    scopeClass: event.scopeClass,
    basisId: event.basisId ?? null,
    runId: event.runId ?? null,
    graphFunctionRef: event.graphFunctionRef ?? null,
    materializationRef: event.materializationRef ?? null,
    graphCallId: event.graphCallId ?? null,
    frameId: event.frameId ?? null,
  }));
  const lifecycle = {
    traversalCursorPresent: replayState.traversalCursorEventRef !== null,
    terminalReached: replayState.terminalReachedEventRef !== null,
    frameClosed: replayState.frameClosedEventRef !== null,
    graphCallClosed: replayState.graphCallClosedEventRef !== null,
    runClosed: replayState.runClosedEventRef !== null,
    runStopped: replayState.runStoppedEventRef !== null,
    runStoppedDisposition: replayState.runStoppedDisposition,
    invocationRefused: replayState.invocationRefusalEventRef !== null,
    runtimeFailed: replayState.runtimeFailureEventRef !== null,
  };
  const outcome = {
    routeKinds: replayState.routes.map((route) => route.routeKind),
    cCallStatuses: replayState.cCalls.map((cCall) => cCall.status),
    continuationStatuses: replayState.continuations.map((row) => row.status),
    fanOutCompletionKinds: replayState.fanOutCompletions.map((row) =>
      row.completionKind
    ),
  };
  const semanticBody = {
    eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
    runId,
    eventCount: events.length,
    eventKinds: events.map((event) => event.kind),
    eventAtoms,
    relations: relationEdges(
      events,
      correspondence,
      fullEventIds,
    ),
    ownerFacts: projectOwnerFacts(
      runPrefix,
      replayState,
      continuations,
      correspondence,
    ),
    lifecycle,
    outcome,
    holdsAt: replayState.activeFluents.map((fluent) =>
      semanticHoldsAt(fluent, correspondence, fullEventIds)
    ),
    runtimeStatus: replayState.runtimeStatus,
  };
  const viewDigest = sha256Canonical(semanticBody as unknown as JsonValue);
  const physicalCoordinates = {
    kind: "run_semantic_replay_physical_coordinates" as const,
    fullEventHistoryDigest: sha256Canonical(fullEvents as unknown as JsonValue),
    scopedEventStoreDigest: replayState.eventStoreDigest,
    scopedReplayRef: replayState.replayRef,
    scopedReplayDigest: replayState.replayDigest,
    events: events.map((event, index) => ({
        eventRef: `r${index + 1}`,
        eventId: event.eventId,
        admissionOrdinal: event.admissionOrdinal,
        payloadDigest: event.payloadDigest,
      })),
  };
  return deepFreeze({
    kind: "run_semantic_relation_view" as const,
    schemaVersion: "5.0.0" as const,
    viewRef:
      `run-semantic-relation://abiogenesis/${viewDigest.slice("sha256:".length)}`,
    viewDigest,
    ...semanticBody,
    physicalCoordinates,
  }) as RunSemanticRelationView;
}
