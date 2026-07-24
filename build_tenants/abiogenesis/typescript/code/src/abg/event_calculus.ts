import type { JsonValue } from "../shared/canonical_json.js";
import type { RootEventKind, RuntimeEvent } from "./event_store.js";

export interface EventCalculusEffect {
  readonly initiates: readonly string[];
  readonly terminates: readonly string[];
  readonly clips: readonly string[];
  readonly declips: readonly string[];
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
  registry_entry_admitted: {
    initiates: ["catalog_entry_available"],
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
    terminates: ["actor_process_live"], clips: [], declips: [],
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
    terminates: ["actor_process_live"], clips: [], declips: [],
  },
  actor_result_artifact_observed: {
    initiates: ["actor_result_artifact_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_invocation_closed: {
    initiates: ["actor_invocation_closed"],
    terminates: ["actor_invocation_active"], clips: [], declips: [],
  },
  actor_invocation_failed: {
    initiates: ["actor_invocation_failed"],
    terminates: ["actor_invocation_active", "actor_process_active", "actor_process_live"], clips: [], declips: [],
  },
  c_call_evidenced: {
    initiates: ["c_call_evidence_available"],
    terminates: [], clips: [], declips: [],
  },
  c_call_result_admitted: {
    initiates: ["c_call_result_available"],
    terminates: [], clips: [], declips: [],
  },
  c_call_judged: {
    initiates: ["c_call_judgment_available"],
    terminates: ["c_call_active", "retry_attempt_active"], clips: [], declips: [],
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
  runtime_failure_observed: {
    initiates: ["runtime_failure"],
    terminates: ["locus_active", "frame_active", "graph_call_active", "run_active"], clips: [], declips: [],
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
} as const satisfies Readonly<Record<RootEventKind, EventCalculusEffect>>);

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

export function eventCalculusEffect(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
): EventCalculusEffect {
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
    case "c_call_evidenced": {
      const evidenceRef = stringField(event, "evidenceRef");
      return {
        initiates: evidenceRef === null
          ? []
          : [fluent("c_call_evidence_available", evidenceRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "c_call_result_admitted": {
      const resultRef = stringField(event, "resultRef");
      return {
        initiates: resultRef === null
          ? []
          : [fluent("c_call_result_available", resultRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "c_call_judged": {
      const judgmentRef = stringField(event, "judgmentRef");
      return {
        initiates: judgmentRef === null
          ? []
          : [fluent("c_call_judgment_available", judgmentRef)],
        terminates: [fluent("c_call_active", event.aggregateId)],
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
