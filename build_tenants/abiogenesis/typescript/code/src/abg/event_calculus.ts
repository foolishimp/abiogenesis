import {
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { RootEventKind, RuntimeEvent } from "./event_store.js";

interface EventCalculusEffectRefs {
  readonly initiates: readonly string[];
  readonly terminates: readonly string[];
  readonly clips: readonly string[];
  readonly declips: readonly string[];
}

export interface RuntimeFluent {
  readonly kind: "runtime_fluent";
  readonly name: string;
  readonly identity: string | null;
  readonly fluentRef: string;
}

export interface RuntimeFluentPattern {
  readonly kind: "runtime_fluent_pattern";
  readonly name: string | null;
  readonly identity: string | null;
}

export interface RuntimeFluentInput {
  readonly name: string;
  readonly identity?: string | null;
}

export interface RuntimeFluentPatternInput {
  readonly name?: string | null;
  readonly identity?: string | null;
}

export interface EventCalculusEffect {
  readonly initiates: readonly RuntimeFluent[];
  readonly terminates: readonly RuntimeFluent[];
  readonly clips: readonly RuntimeFluentPattern[];
  readonly declips: readonly RuntimeFluentPattern[];
}

export interface RuntimeEventCalculusEffectRow extends EventCalculusEffect {
  readonly kind: "event_calculus_effect_row";
  readonly eventKind: RootEventKind;
  readonly sourceEvent: RuntimeEvent;
}

export interface RuntimeEventCalculusProjection {
  readonly kind: "event_calculus_projection";
  readonly holds: readonly RuntimeFluent[];
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
}

export const ROOT_EVENT_CALCULUS = Object.freeze({
  public_operation_artifact_admitted: {
    initiates: ["public_operation_artifact_available"],
    terminates: [], clips: [], declips: [],
  },
  public_operation_admitted: {
    initiates: ["public_operation_ingress_admitted"],
    terminates: [], clips: [], declips: [],
  },
  invocation_admitted: {
    initiates: ["invocation_admitted"],
    terminates: [], clips: [], declips: [],
  },
  invocation_refused: {
    initiates: ["invocation_refused"],
    terminates: ["invocation_admitted"], clips: [], declips: [],
  },
  implementation_admitted: {
    initiates: ["implementation_admitted"],
    terminates: [], clips: [], declips: [],
  },
  basis_admitted: {
    initiates: ["basis_admitted"],
    terminates: [], clips: [], declips: [],
  },
  run_segment_opened: {
    initiates: ["run_active"],
    terminates: [], clips: [], declips: [],
  },
  graph_call_opened: {
    initiates: ["graph_call_active"],
    terminates: [], clips: [], declips: [],
  },
  frame_opened: {
    initiates: ["frame_active"],
    terminates: [], clips: [], declips: [],
  },
  traversal_cursor_entered: {
    initiates: ["locus_active"],
    terminates: [], clips: [], declips: [],
  },
  c_call_opened: {
    initiates: ["c_call_active"],
    terminates: [], clips: [], declips: [],
  },
  c_call_fibre_selected: {
    initiates: ["c_call_fibre_admitted"],
    terminates: [], clips: [], declips: [],
  },
  actor_transport_binding_admitted: {
    initiates: ["actor_transport_binding_admitted"],
    terminates: [], clips: [], declips: [],
  },
  actor_invocation_started: {
    initiates: ["actor_invocation_active"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_started: {
    initiates: ["actor_process_active", "actor_process_live"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_spawn_failed: {
    initiates: ["actor_process_spawn_failed"],
    terminates: ["actor_process_active", "actor_process_live"], clips: [], declips: [],
  },
  actor_process_stdout_observed: {
    initiates: ["actor_process_live", "actor_stdout_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_stderr_observed: {
    initiates: ["actor_process_live", "actor_stderr_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_timeout_observed: {
    initiates: ["actor_process_timed_out"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_signal_requested: {
    initiates: ["actor_process_signal_requested"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_exited: {
    initiates: ["actor_process_exited"],
    terminates: ["actor_process_active", "actor_process_live"], clips: [], declips: [],
  },
  actor_process_termination_unconfirmed: {
    initiates: ["actor_process_termination_unconfirmed"],
    terminates: [], clips: [], declips: [],
  },
  actor_result_artifact_observed: {
    initiates: ["actor_result_artifact_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_invocation_closed: {
    initiates: ["actor_invocation_closed"],
    terminates: ["actor_invocation_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"], clips: [], declips: [],
  },
  actor_invocation_failed: {
    initiates: ["actor_invocation_failed"],
    terminates: ["actor_invocation_active", "actor_process_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"], clips: [], declips: [],
  },
  c_call_evidenced: {
    initiates: ["c_call_evidence_available"],
    terminates: ["c_call_fibre_admitted"], clips: [], declips: [],
  },
  c_call_result_admitted: {
    initiates: ["c_call_result_available"],
    terminates: ["c_call_evidence_available"], clips: [], declips: [],
  },
  c_call_judged: {
    initiates: ["c_call_judgment_available"],
    terminates: ["c_call_active", "c_call_result_available", "retry_attempt_active"], clips: [], declips: [],
  },
  retry_attempt_opened: {
    initiates: ["retry_attempt_active"],
    terminates: [], clips: [], declips: [],
  },
  retry_progress_recorded: {
    initiates: ["retry_progress_available"],
    terminates: ["retry_attempt_active"], clips: [], declips: [],
  },
  child_foldback_admitted: {
    initiates: ["child_foldback_available"],
    terminates: ["parent_waiting_on_child"], clips: [], declips: [],
  },
  child_preparation_refused: {
    initiates: ["child_preparation_refused"],
    terminates: ["parent_waiting_on_child"], clips: [], declips: [],
  },
  fan_out_completion_admitted: {
    initiates: ["fan_out_completion_available"],
    terminates: [], clips: [], declips: [],
  },
  traversal_route_admitted: {
    initiates: [],
    terminates: ["locus_active"], clips: [], declips: [],
  },
  construction_intent_selected: {
    initiates: ["construction_intent_available"],
    terminates: [], clips: [], declips: [],
  },
  construction_delta_observed: {
    initiates: [],
    terminates: [], clips: [], declips: [],
  },
  fh_interaction_opened: {
    initiates: ["continuation_open", "interaction_pending", "frame_held"],
    terminates: ["hold_route_admitted"], clips: [], declips: [],
  },
  fh_interaction_responded: {
    initiates: ["continuation_response_available"],
    terminates: [], clips: [], declips: [],
  },
  fh_interaction_resume_admitted: {
    initiates: ["continuation_terminated", "frame_active", "locus_active"],
    terminates: [
      "continuation_open",
      "interaction_pending",
      "continuation_response_available",
      "frame_held",
    ], clips: [], declips: [],
  },
  continuation_abandoned: {
    initiates: ["continuation_abandoned"],
    terminates: ["continuation_open", "interaction_pending", "continuation_response_available"], clips: [], declips: [],
  },
  continuation_superseded: {
    initiates: ["continuation_superseded"],
    terminates: ["continuation_open", "interaction_pending", "continuation_response_available"], clips: [], declips: [],
  },
  continuation_reentry_link_admitted: {
    initiates: ["continuation_reentry_link_available"],
    terminates: [], clips: [], declips: [],
  },
  runtime_failure_observed: {
    initiates: ["runtime_failure"],
    terminates: ["locus_active", "frame_active"], clips: [], declips: [],
  },
  run_stopped: {
    initiates: ["run_terminal"],
    terminates: [
      "locus_active",
      "frame_active",
      "frame_blocked",
      "frame_failed",
      "graph_call_active",
      "run_active",
      "retry_attempt_active",
      "retry_progress_available",
    ], clips: [], declips: [],
  },
  terminal_reached: {
    initiates: ["terminal_admitted"],
    terminates: ["terminal_route_available"], clips: [], declips: [],
  },
  frame_closed: {
    initiates: ["frame_closed"],
    terminates: ["frame_active"], clips: [], declips: [],
  },
  graph_call_closed: {
    initiates: ["graph_call_closed"],
    terminates: ["graph_call_active"], clips: [], declips: [],
  },
  run_closed: {
    initiates: ["run_closed"],
    terminates: ["locus_active", "run_active"], clips: [], declips: [],
  },
} as const satisfies Readonly<Record<RootEventKind, EventCalculusEffectRefs>>);

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(
  event: Pick<RuntimeEvent, "payload">,
  name: string,
): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return typeof value === "string" ? value : null;
}

function stringArrayField(
  event: Pick<RuntimeEvent, "payload">,
  name: string,
): readonly string[] {
  if (!isRecord(event.payload)) return [];
  const value = event.payload[name];
  return Array.isArray(value) &&
      value.every((entry) => typeof entry === "string")
    ? value as readonly string[]
    : [];
}

function fluent(name: string, identity: string): string {
  return `${name}(${identity})`;
}

function consumedAvailabilityFluents(ref: string): readonly string[] {
  if (ref.startsWith("judgment://")) {
    return [fluent("c_call_judgment_available", ref)];
  }
  if (ref.startsWith("child-foldback://")) {
    return [fluent("child_foldback_available", ref)];
  }
  if (ref.startsWith("child-preparation-refusal://")) {
    return [fluent("child_preparation_refused", ref)];
  }
  if (ref.startsWith("retry-progress://")) {
    return [fluent("retry_progress_available", ref)];
  }
  if (ref.startsWith("graph-function-application://")) {
    return [
      fluent("fan_out_vector_available", ref),
      fluent("fan_out_partial_stop_available", ref),
    ];
  }
  return [];
}

function eventCalculusEffectRefs(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
): EventCalculusEffectRefs {
  if (typeof eventOrKind === "string") return ROOT_EVENT_CALCULUS[eventOrKind];
  const event = eventOrKind as RuntimeEvent;
  switch (event.kind) {
    case "run_segment_opened":
      return {
        initiates: [fluent("run_active", event.runId ?? event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "graph_call_opened": {
      const graphCallId = event.graphCallId ?? event.aggregateId;
      const parentFrameId = stringField(event, "parentFrameId");
      return {
        initiates: [
          fluent("graph_call_active", graphCallId),
          ...(parentFrameId === null
            ? []
            : [fluent("parent_waiting_on_child", graphCallId)]),
        ],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "frame_opened":
      return {
        initiates: [
          fluent("frame_active", event.frameId ?? event.aggregateId),
        ],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "traversal_cursor_entered": {
      const cursorRef = stringField(event, "cursorRef");
      return {
        initiates: cursorRef === null
          ? []
          : [fluent("locus_active", cursorRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "c_call_opened":
      return {
        initiates: [fluent("c_call_active", event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "c_call_fibre_selected":
      return {
        initiates: [fluent("c_call_fibre_admitted", event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "actor_transport_binding_admitted":
      return {
        initiates: [fluent("actor_transport_binding_admitted", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_result_artifact_observed":
      return {
        initiates: [fluent("actor_result_artifact_available", event.eventId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_invocation_started":
      return {
        initiates: [fluent("actor_invocation_active", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_started":
      return {
        initiates: [
          fluent("actor_process_active", event.aggregateId),
          fluent("actor_process_live", event.aggregateId),
        ],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_stdout_observed":
    case "actor_process_stderr_observed":
      return {
        initiates: [fluent(
          event.kind === "actor_process_stdout_observed"
            ? "actor_stdout_available"
            : "actor_stderr_available",
          event.eventId,
        )],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_timeout_observed":
      return {
        initiates: [fluent("actor_process_timed_out", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_signal_requested":
      return {
        initiates: [fluent("actor_process_signal_requested", event.eventId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_termination_unconfirmed":
      return {
        initiates: [fluent(
          "actor_process_termination_unconfirmed",
          event.aggregateId,
        )],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_spawn_failed":
    case "actor_process_exited":
      return {
        initiates: [fluent(
          event.kind === "actor_process_exited"
            ? "actor_process_exited"
            : "actor_process_spawn_failed",
          event.aggregateId,
        )],
        terminates: [
          fluent("actor_process_active", event.aggregateId),
          fluent("actor_process_live", event.aggregateId),
        ],
        clips: [], declips: [],
      };
    case "actor_invocation_closed":
    case "actor_invocation_failed":
      {
      const transportBindingRef = stringField(event, "consumedTransportBindingRef");
      const stdoutEventRefs = stringArrayField(event, "consumedStdoutEventRefs");
      const stderrEventRefs = stringArrayField(event, "consumedStderrEventRefs");
      const artifactEventRef = stringField(event, "consumedArtifactEventRef");
      return {
        initiates: [fluent(
          event.kind === "actor_invocation_closed"
            ? "actor_invocation_closed"
            : "actor_invocation_failed",
          event.aggregateId,
        )],
        terminates: [
          fluent("actor_invocation_active", event.aggregateId),
          ...(transportBindingRef === null
            ? []
            : [fluent("actor_transport_binding_admitted", transportBindingRef)]),
          ...stdoutEventRefs.map((ref) => fluent("actor_stdout_available", ref)),
          ...stderrEventRefs.map((ref) => fluent("actor_stderr_available", ref)),
          ...(artifactEventRef === null
            ? []
            : [fluent("actor_result_artifact_available", artifactEventRef)]),
        ],
        clips: [], declips: [],
      };
      }
    case "c_call_evidenced": {
      const evidenceRef = stringField(event, "evidenceRef");
      return {
        initiates: evidenceRef === null
          ? []
          : [fluent("c_call_evidence_available", evidenceRef)],
        terminates: [fluent("c_call_fibre_admitted", event.aggregateId)],
        clips: [],
        declips: [],
      };
    }
    case "c_call_result_admitted": {
      const resultRef = stringField(event, "resultRef");
      const evidenceRefs = stringArrayField(event, "evidenceRefs");
      return {
        initiates: resultRef === null
          ? []
          : [fluent("c_call_result_available", resultRef)],
        terminates: evidenceRefs.map((evidenceRef) =>
          fluent("c_call_evidence_available", evidenceRef)
        ),
        clips: [],
        declips: [],
      };
    }
    case "c_call_judged": {
      const judgmentRef = stringField(event, "judgmentRef");
      const resultRef = stringField(event, "resultRef");
      return {
        initiates: judgmentRef === null
          ? []
          : [fluent("c_call_judgment_available", judgmentRef)],
        terminates: [
          fluent("c_call_active", event.aggregateId),
          ...(resultRef === null
            ? []
            : [fluent("c_call_result_available", resultRef)]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "retry_attempt_opened": {
      const attemptRef = stringField(event, "attemptRef");
      return {
        initiates: attemptRef === null
          ? []
          : [fluent("retry_attempt_active", attemptRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "retry_progress_recorded": {
      const attemptRef = stringField(event, "attemptRef");
      const progressRef = stringField(event, "progressRef");
      return {
        initiates: progressRef === null
          ? []
          : [fluent("retry_progress_available", progressRef)],
        terminates: attemptRef === null
          ? []
          : [fluent("retry_attempt_active", attemptRef)],
        clips: [],
        declips: [],
      };
    }
    case "child_foldback_admitted": {
      const foldbackRef = stringField(event, "foldbackRef");
      const childGraphCallId = stringField(event, "childGraphCallId");
      const childFrameId = stringField(event, "childFrameId");
      const childDisposition = stringField(event, "childDisposition");
      const applicationRef = stringField(event, "applicationRef");
      const childStopped =
        childDisposition === "blocked" || childDisposition === "failed";
      return {
        initiates:
          applicationRef !== null && foldbackRef !== null
            ? [fluent("child_foldback_available", foldbackRef)]
            : [],
        terminates: [
          ...(childGraphCallId === null
            ? []
            : [fluent("parent_waiting_on_child", childGraphCallId)]),
          ...(childStopped && childFrameId !== null
            ? [
              fluent("frame_active", childFrameId),
              fluent("frame_blocked", childFrameId),
              fluent("frame_failed", childFrameId),
            ]
            : []),
          ...(childStopped && childGraphCallId !== null
            ? [fluent("graph_call_active", childGraphCallId)]
            : []),
        ],
        clips: [],
        declips: [],
      };
    }
    case "child_preparation_refused": {
      const refusalRef = stringField(event, "refusalRef");
      return {
        initiates: refusalRef === null
          ? []
          : [fluent("child_preparation_refused", refusalRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fan_out_completion_admitted": {
      const applicationRef = stringField(event, "applicationRef");
      const completionKind = stringField(event, "completionKind");
      return {
        initiates: applicationRef === null
          ? []
          : completionKind === "complete_vector"
            ? [fluent("fan_out_vector_available", applicationRef)]
            : completionKind === "partial_stop"
              ? [fluent("fan_out_partial_stop_available", applicationRef)]
              : [],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_opened": {
      const continuationRef = stringField(event, "continuationRef");
      const holdRouteRef = stringField(event, "holdRouteRef");
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: continuationRef === null
          ? []
          : [
              fluent("continuation_open", continuationRef),
              fluent("interaction_pending", continuationRef),
              fluent("frame_held", event.frameId ?? ""),
            ],
        terminates: [
          ...(holdRouteRef === null
            ? []
            : [fluent("hold_route_admitted", holdRouteRef)]),
          ...(constructionIntentRef === null
            ? []
            : [
                fluent(
                  "construction_intent_available",
                  constructionIntentRef,
                ),
              ]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "construction_intent_selected": {
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: constructionIntentRef === null
          ? []
          : [
              fluent(
                "construction_intent_available",
                constructionIntentRef,
              ),
            ],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "construction_delta_observed": {
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: [],
        terminates: constructionIntentRef === null
          ? []
          : [
              fluent(
                "construction_intent_available",
                constructionIntentRef,
              ),
            ],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_responded": {
      const continuationRef = stringField(event, "continuationRef");
      return {
        initiates: continuationRef === null
          ? []
          : [fluent("continuation_response_available", continuationRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_resume_admitted": {
      const continuationRef = stringField(event, "continuationRef");
      const successorCursorRef = stringField(event, "successorCursorRef");
      return {
        initiates: [
          ...(continuationRef === null
            ? []
            : [fluent("continuation_terminated", continuationRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...(successorCursorRef === null
            ? []
            : [fluent("locus_active", successorCursorRef)]),
        ],
        terminates: [
          ...(continuationRef === null
            ? []
            : [
                fluent("continuation_open", continuationRef),
                fluent("interaction_pending", continuationRef),
                fluent("continuation_response_available", continuationRef),
              ]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_held", event.frameId)]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "continuation_abandoned":
    case "continuation_superseded": {
      const continuationRef = stringField(event, "continuationRef");
      return {
        initiates: continuationRef === null
          ? []
          : [fluent(
              event.kind === "continuation_abandoned"
                ? "continuation_abandoned"
                : "continuation_superseded",
              continuationRef,
            )],
        terminates: continuationRef === null
          ? []
          : [
              fluent("continuation_open", continuationRef),
              fluent("interaction_pending", continuationRef),
              fluent("continuation_response_available", continuationRef),
            ],
        clips: [], declips: [],
      };
    }
    case "continuation_reentry_link_admitted": {
      const linkRef = stringField(event, "linkRef");
      return {
        initiates: linkRef === null
          ? []
          : [fluent("continuation_reentry_link_available", linkRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "traversal_route_admitted":
      break;
    case "runtime_failure_observed":
      return {
        initiates: [fluent("runtime_failure", event.eventId)],
        terminates: [
          ...(event.frameId === undefined
            ? []
            : [
                fluent("frame_active", event.frameId),
              ]),
          ...(event.aggregateType !== "run" || event.graphCallId === undefined
            ? []
            : [fluent("graph_call_active", event.graphCallId)]),
          ...(event.aggregateType !== "run" || event.runId === undefined
            ? []
            : [fluent("run_active", event.runId)]),
        ],
        clips: [],
        declips: [],
      };
    case "run_stopped":
      return {
        initiates: event.runId === undefined
          ? []
          : [fluent("run_terminal", event.runId)],
        terminates: [
          ...(event.frameId === undefined
            ? []
            : [
                fluent("frame_active", event.frameId),
                fluent("frame_blocked", event.frameId),
                fluent("frame_failed", event.frameId),
              ]),
          ...(event.graphCallId === undefined
            ? []
            : [fluent("graph_call_active", event.graphCallId)]),
          ...(event.runId === undefined
            ? []
            : [fluent("run_active", event.runId)]),
        ],
        clips: [],
        declips: [],
      };
    case "terminal_reached": {
      const routeRef = stringField(event, "routeRef");
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("terminal_admitted", event.frameId)],
        terminates: routeRef === null
          ? []
          : [fluent("terminal_route_available", routeRef)],
        clips: [],
        declips: [],
      };
    }
    case "frame_closed":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_closed", event.frameId)],
        terminates: event.frameId === undefined
          ? []
          : [fluent("frame_active", event.frameId)],
        clips: [],
        declips: [],
      };
    case "graph_call_closed":
      return {
        initiates: event.graphCallId === undefined
          ? []
          : [fluent("graph_call_closed", event.graphCallId)],
        terminates: event.graphCallId === undefined
          ? []
          : [fluent("graph_call_active", event.graphCallId)],
        clips: [],
        declips: [],
      };
    case "run_closed":
      return {
        initiates: event.runId === undefined
          ? []
          : [fluent("run_closed", event.runId)],
        terminates: event.runId === undefined
          ? []
          : [fluent("run_active", event.runId)],
        clips: [],
        declips: [],
      };
    default:
      return ROOT_EVENT_CALCULUS[event.kind];
  }
  if (!isRecord(eventOrKind.payload)) {
    throw new TypeError("traversal route event requires a closed payload");
  }
  const sourceCursorRef = stringField(event, "sourceCursorRef");
  const targetCursorRef = stringField(event, "targetCursorRef");
  const routeRef = stringField(event, "routeRef");
  const judgmentRef = stringField(event, "judgmentRef");
  const constructionIntentRef = stringField(
    event,
    "constructionIntentRef",
  );
  const consumedFluents = stringArrayField(
    event,
    "consumedAvailabilityRefs",
  ).flatMap((ref) => consumedAvailabilityFluents(ref));
  switch (eventOrKind.payload.routeKind) {
    case "advance":
    case "re_enter":
      return {
        initiates: [
          ...(targetCursorRef === null
            ? []
            : [fluent("locus_active", targetCursorRef)]),
          ...(constructionIntentRef === null
            ? []
            : [
                fluent(
                  "construction_intent_available",
                  constructionIntentRef,
                ),
              ]),
        ],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "retry":
      return {
        initiates: targetCursorRef === null
          ? []
          : [fluent("locus_active", targetCursorRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "terminal":
      return {
        initiates: routeRef === null
          ? []
          : [fluent("terminal_route_available", routeRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(judgmentRef === null
            ? []
            : [fluent("c_call_judgment_available", judgmentRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "hold":
      return {
        initiates: routeRef === null
          ? []
          : [fluent("hold_route_admitted", routeRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "gap_stop":
      return {
        initiates: [],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...(judgmentRef === null
            ? []
            : [fluent("c_call_judgment_available", judgmentRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "blocked":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_blocked", event.frameId)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "failed":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_failed", event.frameId)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    default:
      throw new TypeError("traversal route event carries an unknown route kind");
  }
}

function assertFluentName(name: string): void {
  if (name.length === 0 || name.includes("(") || name.includes(")")) {
    throw new TypeError("Runtime fluent name must be non-empty and cannot contain parentheses");
  }
}

export function constructRuntimeFluent(
  input: RuntimeFluentInput,
): RuntimeFluent {
  assertFluentName(input.name);
  const identity = input.identity ?? null;
  if (identity !== null && identity.length === 0) {
    throw new TypeError("Runtime fluent identity must be non-empty when present");
  }
  return deepFreeze({
    kind: "runtime_fluent" as const,
    name: input.name,
    identity,
    fluentRef: identity === null ? input.name : `${input.name}(${identity})`,
  }) as RuntimeFluent;
}

export function constructRuntimeFluentPattern(
  input: RuntimeFluentPatternInput,
): RuntimeFluentPattern {
  const name = input.name ?? null;
  const identity = input.identity ?? null;
  if (name !== null) assertFluentName(name);
  if (identity !== null && identity.length === 0) {
    throw new TypeError("Runtime fluent-pattern identity must be non-empty when present");
  }
  if (name === null && identity === null) {
    throw new TypeError("Runtime fluent pattern must constrain name or identity");
  }
  return deepFreeze({
    kind: "runtime_fluent_pattern" as const,
    name,
    identity,
  }) as RuntimeFluentPattern;
}

function validateRuntimeFluent(fluent: RuntimeFluent): void {
  if (fluent.kind !== "runtime_fluent") {
    throw new TypeError("Runtime fluent must carry runtime_fluent kind");
  }
  const constructed = constructRuntimeFluent({
    name: fluent.name,
    identity: fluent.identity,
  });
  if (constructed.fluentRef !== fluent.fluentRef) {
    throw new TypeError("Runtime fluent reference is not canonical");
  }
}

function validateRuntimeFluentPattern(pattern: RuntimeFluentPattern): void {
  if (pattern.kind !== "runtime_fluent_pattern") {
    throw new TypeError("Runtime fluent pattern must carry runtime_fluent_pattern kind");
  }
  constructRuntimeFluentPattern({
    name: pattern.name,
    identity: pattern.identity,
  });
}

export function runtimeFluentKey(fluent: RuntimeFluent): string {
  validateRuntimeFluent(fluent);
  return fluent.fluentRef;
}

export function runtimeFluentPatternKey(
  pattern: RuntimeFluentPattern,
): string {
  validateRuntimeFluentPattern(pattern);
  return JSON.stringify([pattern.name, pattern.identity]);
}

export function runtimeFluentMatchesPattern(
  fluent: RuntimeFluent,
  pattern: RuntimeFluentPattern,
): boolean {
  validateRuntimeFluent(fluent);
  validateRuntimeFluentPattern(pattern);
  return (pattern.name === null || pattern.name === fluent.name) &&
    (pattern.identity === null || pattern.identity === fluent.identity);
}

function runtimeFluentFromRef(fluentRef: string): RuntimeFluent {
  const separator = fluentRef.indexOf("(");
  if (separator === -1) {
    return constructRuntimeFluent({ name: fluentRef });
  }
  if (!fluentRef.endsWith(")")) {
    throw new TypeError("Runtime fluent reference is malformed");
  }
  return constructRuntimeFluent({
    name: fluentRef.slice(0, separator),
    identity: fluentRef.slice(separator + 1, -1),
  });
}

function runtimeFluentPatternFromRef(
  fluentRef: string,
): RuntimeFluentPattern {
  const fluent = runtimeFluentFromRef(fluentRef);
  return constructRuntimeFluentPattern({
    name: fluent.name,
    identity: fluent.identity,
  });
}

function completeEffect(effect: EventCalculusEffect): EventCalculusEffect {
  for (const fluent of [...effect.initiates, ...effect.terminates]) {
    validateRuntimeFluent(fluent);
  }
  for (const pattern of [...effect.clips, ...effect.declips]) {
    validateRuntimeFluentPattern(pattern);
  }
  const initiated = new Map(
    effect.initiates.map((fluent) => [runtimeFluentKey(fluent), fluent]),
  );
  const terminated = new Map(
    effect.terminates.map((fluent) => [runtimeFluentKey(fluent), fluent]),
  );
  if ([...initiated.keys()].some((key) => terminated.has(key))) {
    throw new TypeError("Event Calculus effect cannot both initiate and terminate one fluent");
  }
  return deepFreeze({
    initiates: [...initiated.values()],
    terminates: [...terminated.values()],
    clips: [...effect.clips],
    declips: [...effect.declips],
  }) as EventCalculusEffect;
}

export function validateRuntimeEventCalculusEffectForModuleTest(
  effect: EventCalculusEffect,
): EventCalculusEffect {
  return completeEffect(effect);
}

export function validateRuntimeEventCalculusAxiomKindsForModuleTest(
  eventKinds: readonly RootEventKind[],
): void {
  const unique = new Set<RootEventKind>();
  for (const eventKind of eventKinds) {
    if (!Object.hasOwn(ROOT_EVENT_CALCULUS, eventKind)) {
      throw new TypeError(`Unknown Event Calculus event kind ${String(eventKind)}`);
    }
    if (unique.has(eventKind)) {
      throw new TypeError(`Duplicate Event Calculus axiom for ${eventKind}`);
    }
    unique.add(eventKind);
  }
  const missing = (Object.keys(ROOT_EVENT_CALCULUS) as RootEventKind[])
    .filter((eventKind) => !unique.has(eventKind));
  if (missing.length !== 0) {
    throw new TypeError(`Missing Event Calculus axiom for ${missing.join(",")}`);
  }
}

validateRuntimeEventCalculusAxiomKindsForModuleTest(
  Object.freeze(Object.keys(ROOT_EVENT_CALCULUS) as RootEventKind[]),
);

export function eventCalculusEffect(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
): EventCalculusEffect {
  const effect = eventCalculusEffectRefs(eventOrKind);
  return completeEffect({
    initiates: effect.initiates.map(runtimeFluentFromRef),
    terminates: effect.terminates.map(runtimeFluentFromRef),
    clips: effect.clips.map(runtimeFluentPatternFromRef),
    declips: effect.declips.map(runtimeFluentPatternFromRef),
  });
}

export function constructRunActiveFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_active", identity: runId });
}

export function constructRunClosedFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_closed", identity: runId });
}

export function constructRunTerminalFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_terminal", identity: runId });
}

export function deriveRuntimeEventCalculusProjection(
  prefix: ValidatedRuntimeEventPrefix,
): RuntimeEventCalculusProjection {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const holds = new Map<string, RuntimeFluent>();
  const effectRows: RuntimeEventCalculusEffectRow[] = [];
  const clippedFluentRefs: string[] = [];
  const declippedPatternRefs: string[] = [];
  const contextualFluentRunIds = new Map<string, string>();
  for (const event of events) {
    const baseEffect = eventCalculusEffect(event);
    const terminalLocusEvent =
      event.kind === "runtime_failure_observed" ||
      event.kind === "run_stopped" ||
      event.kind === "run_closed";
    const cleanupTerminalEvent = event.kind === "run_stopped" ||
      (event.kind === "runtime_failure_observed" &&
        event.aggregateType === "run");
    const processRef = stringField(event, "processRef");
    const liveProcesses = cleanupTerminalEvent
      ? [...holds.values()].filter((candidate) =>
          candidate.name === "actor_process_live" && candidate.identity !== null
        )
      : [];
    const effect = terminalLocusEvent
      ? completeEffect({
          ...baseEffect,
          initiates: [
            ...baseEffect.initiates,
            ...liveProcesses.flatMap((candidate) => [
              constructRuntimeFluent({
                name: "actor_cleanup_live",
                identity: candidate.identity!,
              }),
              constructRuntimeFluent({
                name: "actor_cleanup_pending",
                identity: candidate.identity!,
              }),
            ]),
          ],
          terminates: [
            ...baseEffect.terminates,
            ...[...holds.values()].filter((candidate) =>
              (
                (
                  cleanupTerminalEvent &&
                  (
                    candidate.name === "actor_invocation_active" ||
                    candidate.name === "actor_process_active" ||
                    candidate.name === "c_call_active" ||
                    candidate.name === "continuation_open" ||
                    candidate.name === "continuation_response_available" ||
                    candidate.name === "frame_held" ||
                    candidate.name === "interaction_pending" ||
                    candidate.name === "parent_waiting_on_child" ||
                    candidate.name === "retry_attempt_active" ||
                    candidate.name === "retry_progress_available"
                  )
                ) || candidate.name === "locus_active"
              ) &&
              contextualFluentRunIds.get(runtimeFluentKey(candidate)) ===
                event.runId
            ),
          ],
        })
      : processRef !== null &&
          (event.kind === "actor_process_exited" ||
            event.kind === "actor_process_spawn_failed" ||
            event.kind === "actor_invocation_closed" ||
            event.kind === "actor_invocation_failed")
        ? completeEffect({
            ...baseEffect,
            terminates: [
              ...baseEffect.terminates,
              ...(event.kind === "actor_process_exited" ||
                  event.kind === "actor_process_spawn_failed"
                ? [constructRuntimeFluent({
                    name: "actor_cleanup_live",
                    identity: processRef,
                  })]
                : [constructRuntimeFluent({
                    name: "actor_cleanup_pending",
                    identity: processRef,
                  })]),
            ],
          })
        : baseEffect;
    for (const fluent of effect.terminates) {
      holds.delete(runtimeFluentKey(fluent));
      contextualFluentRunIds.delete(runtimeFluentKey(fluent));
    }
    for (const pattern of effect.clips) {
      for (const [key, fluent] of [...holds.entries()]) {
        if (runtimeFluentMatchesPattern(fluent, pattern)) {
          holds.delete(key);
          clippedFluentRefs.push(key);
        }
      }
    }
    for (const pattern of effect.declips) {
      declippedPatternRefs.push(runtimeFluentPatternKey(pattern));
    }
    for (const fluent of effect.initiates) {
      holds.set(runtimeFluentKey(fluent), fluent);
      if (event.runId !== undefined) {
        contextualFluentRunIds.set(runtimeFluentKey(fluent), event.runId);
      }
    }
    effectRows.push(deepFreeze({
      kind: "event_calculus_effect_row" as const,
      eventKind: event.kind,
      sourceEvent: event,
      ...effect,
    }) as RuntimeEventCalculusEffectRow);
  }
  return deepFreeze({
    kind: "event_calculus_projection" as const,
    holds: [...holds.values()].sort((left, right) => compareUnicodeCodeUnits(
      runtimeFluentKey(left),
      runtimeFluentKey(right),
    )),
    effectRows,
    clippedFluentRefs,
    declippedPatternRefs,
  }) as RuntimeEventCalculusProjection;
}

export function holdsAt(
  projection: RuntimeEventCalculusProjection,
  fluent: RuntimeFluent,
): boolean {
  const key = runtimeFluentKey(fluent);
  return projection.holds.some((candidate) => runtimeFluentKey(candidate) === key);
}
