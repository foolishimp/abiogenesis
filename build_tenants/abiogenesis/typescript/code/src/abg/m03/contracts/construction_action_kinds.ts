// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

export const CONSTRUCTION_ACTION_KIND_VALUES = Object.freeze([
  "invoke_graph_function",
  "continue_graph_call",
  "repair_same_edge",
  "reenter_graph_span",
  "invoke_prior_vector",
  "invoke_later_vector",
  "open_fh_gate",
  "create_ticket",
  "propose_reprice",
  "yield_progress",
  "close_episode",
  "block_episode"
] as const);

export type ConstructionActionKind =
  (typeof CONSTRUCTION_ACTION_KIND_VALUES)[number];

export const CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES = Object.freeze([
  "invoke_graph_function",
  "continue_graph_call",
  "repair_same_edge",
  "reenter_graph_span",
  "invoke_prior_vector",
  "invoke_later_vector"
] as const);

export type ConstructiveConstructionActionKind =
  (typeof CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES)[number];

export function isConstructiveConstructionActionKind(
  kind: ConstructionActionKind
): kind is ConstructiveConstructionActionKind {
  return CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES.some(
    (candidate) => candidate === kind
  );
}
