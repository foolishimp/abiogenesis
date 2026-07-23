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
  traversal_route_admitted: {
    initiates: [],
    terminates: ["locus_active"], clips: [], declips: [],
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

export function eventCalculusEffect(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
): EventCalculusEffect {
  if (typeof eventOrKind === "string") return ROOT_EVENT_CALCULUS[eventOrKind];
  if (eventOrKind.kind !== "traversal_route_admitted") {
    return ROOT_EVENT_CALCULUS[eventOrKind.kind];
  }
  if (!isRecord(eventOrKind.payload)) {
    throw new TypeError("traversal route event requires a closed payload");
  }
  switch (eventOrKind.payload.routeKind) {
    case "advance":
      return {
        initiates: ["locus_active"],
        terminates: ["locus_active"],
        clips: [],
        declips: [],
      };
    case "retry":
      return {
        initiates: ["locus_active"],
        terminates: ["locus_active", "retry_progress_available"],
        clips: [],
        declips: [],
      };
    case "terminal":
      return {
        initiates: ["terminal_route_available"],
        terminates: ["locus_active", "c_call_judgment_available"],
        clips: [],
        declips: [],
      };
    case "hold":
      return {
        initiates: ["hold_route_admitted"],
        terminates: ["locus_active", "frame_active"],
        clips: [],
        declips: [],
      };
    case "blocked":
      return {
        initiates: ["frame_blocked"],
        terminates: [
          "locus_active",
          "frame_active",
          "retry_attempt_active",
          "retry_progress_available",
        ],
        clips: [],
        declips: [],
      };
    case "failed":
      return {
        initiates: ["frame_failed"],
        terminates: [
          "locus_active",
          "frame_active",
          "retry_attempt_active",
          "retry_progress_available",
        ],
        clips: [],
        declips: [],
      };
    default:
      throw new TypeError("traversal route event carries an unknown route kind");
  }
}
