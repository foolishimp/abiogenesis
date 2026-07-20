import type { RootEventKind } from "./event_store.js";

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
  fd_advance_ready: {
    initiates: ["terminal_locus_eligible"],
    terminates: ["prior_locus_active"], clips: [], declips: [],
  },
  runtime_failure_observed: {
    initiates: ["runtime_failure"],
    terminates: ["frame_active"], clips: [], declips: [],
  },
  terminal_reached: {
    initiates: ["terminal_admitted"],
    terminates: [], clips: [], declips: [],
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
    terminates: ["run_active"], clips: [], declips: [],
  },
} as const satisfies Readonly<Record<RootEventKind, EventCalculusEffect>>);

export function eventCalculusEffect(kind: RootEventKind): EventCalculusEffect {
  return ROOT_EVENT_CALCULUS[kind];
}
