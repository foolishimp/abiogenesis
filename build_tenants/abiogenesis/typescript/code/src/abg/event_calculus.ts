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
    terminates: ["c_call_active"], clips: [], declips: [],
  },
  traversal_route_admitted: {
    initiates: [],
    terminates: ["locus_active"], clips: [], declips: [],
  },
  runtime_failure_observed: {
    initiates: ["runtime_failure"],
    terminates: ["locus_active", "frame_active", "graph_call_active", "run_active"], clips: [], declips: [],
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
    case "retry":
      return {
        initiates: ["locus_active"],
        terminates: ["locus_active"],
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
        terminates: ["locus_active", "frame_active"],
        clips: [],
        declips: [],
      };
    case "failed":
      return {
        initiates: ["frame_failed"],
        terminates: ["locus_active", "frame_active"],
        clips: [],
        declips: [],
      };
    default:
      throw new TypeError("traversal route event carries an unknown route kind");
  }
}
