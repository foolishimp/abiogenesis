// Unified ABG lever registry — the single governance + visibility source of
// truth for every product-affecting runtime default ("lever").
//
// This module is a LEAF: it imports only `shared/validation`. It declares each
// lever's dotted key, current value, classification, and where it is consumed.
//
// It is NOT the runtime value provider for most levers. Mirror-by-default: the
// registry declares the value; the consumption site keeps its own literal. A
// drift-guard test pins `registry.value === the live constant` so the two can
// never diverge. Only admission-time `tunable`/`live` levers (currently the M04
// request defaults) actually read through an override resolver.
//
// `tunable` = operator-overridable via config (by dotted key). `fixed` = an
// internal/structural constant, surfaced for visibility but with NO override
// path (a config keyed to a fixed lever fails closed at load).
// `wiring: "live"` = override + provenance wired now; `wiring: "deferred"` =
// surfaced only, override/event wiring deferred (e.g. live-lane families whose
// behavior is verifiable only under the live actor/PTY harness).

import {
  FH_MODE_VALUES,
  UNTIL_VALUES
} from "../validation/governed_enums.js";

export type LeverValue = string | number | boolean | readonly string[];
export type LeverClass = "tunable" | "fixed";
export type LeverWiring = "live" | "deferred";
export type LeverValueKind =
  | "ms"
  | "count"
  | "enum"
  | "string"
  | "flag"
  | "string_list";

export interface LeverEntry {
  readonly dottedKey: string;
  readonly value: LeverValue;
  readonly leverClass: LeverClass;
  readonly valueKind: LeverValueKind;
  readonly wiring: LeverWiring;
  readonly reason: string;
  readonly consumedAt: string;
  readonly enumValues?: readonly string[];
}

const LEVERS: readonly LeverEntry[] = Object.freeze([
  // ── tunable / live (M04 request defaults — override + provenance wired now)
  {
    dottedKey: "abg.m04.until",
    value: "converged",
    leverClass: "tunable",
    valueKind: "enum",
    wiring: "live",
    reason:
      "M04 callable-start convergence target default; operator-overridable.",
    consumedAt: "app/m04/max_autonomy/admission.ts:43",
    enumValues: UNTIL_VALUES
  },
  {
    dottedKey: "abg.m04.fh_mode",
    value: "direct",
    leverClass: "tunable",
    valueKind: "enum",
    wiring: "live",
    reason:
      "M04 callable-start F_H proxy mode default; operator-overridable.",
    consumedAt: "app/m04/max_autonomy/admission.ts:44",
    enumValues: FH_MODE_VALUES
  },

  // ── tunable / deferred (live-lane: actor + PTY + traversal behavior)
  {
    dottedKey: "abg.transport.actor.timeout_ms",
    value: 1_800_000,
    leverClass: "tunable",
    valueKind: "ms",
    wiring: "deferred",
    reason:
      "Process actor wall-clock timeout; behavior verifiable only under the live actor harness.",
    consumedAt: "abg/m03/transport/process_actor.ts:82"
  },
  {
    dottedKey: "abg.transport.actor.termination_grace_ms",
    value: 10_000,
    leverClass: "tunable",
    valueKind: "ms",
    wiring: "deferred",
    reason: "Actor termination grace; live-lane.",
    consumedAt: "abg/m03/transport/process_actor.ts:83"
  },
  {
    dottedKey: "abg.transport.actor.heartbeat_ms",
    value: 30_000,
    leverClass: "tunable",
    valueKind: "ms",
    wiring: "deferred",
    reason: "Actor heartbeat interval; live-lane.",
    consumedAt: "abg/m03/transport/process_actor.ts:84"
  },
  {
    dottedKey: "abg.runner.retry.max_attempts",
    value: 3,
    leverClass: "tunable",
    valueKind: "count",
    wiring: "deferred",
    reason:
      "Attached F_P worker retry budget; gates live retry behavior.",
    consumedAt: "abg/m03/runner/attached_fp_worker.ts:43"
  },
  {
    dottedKey: "abg.transport.executor.profile",
    value: "local-spawn",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason: "Transport executor profile default; live-lane.",
    consumedAt: "shared/traced_process/index.ts:710"
  },
  {
    dottedKey: "abg.transport.process.parser",
    value: "generic-text",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason: "Process output parser default; live-lane.",
    consumedAt: "shared/traced_process/index.ts:708"
  },
  {
    dottedKey: "abg.transport.pty.terminal_lost_grace_ms",
    value: 5_000,
    leverClass: "tunable",
    valueKind: "ms",
    wiring: "deferred",
    reason: "PTY terminal-lost grace; live PTY harness.",
    consumedAt: "shared/traced_process/index.ts:424"
  },
  {
    dottedKey: "abg.transport.pty.supervisor_decision_grace_ms",
    value: 5_000,
    leverClass: "tunable",
    valueKind: "ms",
    wiring: "deferred",
    reason: "PTY supervisor decision grace; live PTY harness.",
    consumedAt: "shared/traced_process/index.ts:425"
  },
  {
    dottedKey: "abg.transport.pty.screen_command",
    value: "screen",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason: "PTY screen executor command; live PTY harness.",
    consumedAt: "shared/traced_process/index.ts:987"
  },
  {
    dottedKey: "abg.transport.pty.term",
    value: "xterm-256color",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason: "PTY TERM env default; live PTY harness.",
    consumedAt: "shared/traced_process/index.ts:1090"
  },
  {
    dottedKey: "abg.traversal.modulation.same_edge_until",
    value: "foldback_closed",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason:
      "Traversal same-edge continuation policy default; traversal behavior.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:738"
  },
  {
    dottedKey: "abg.traversal.modulation.max_attempts_without_new_signal",
    value: 1,
    leverClass: "tunable",
    valueKind: "count",
    wiring: "deferred",
    reason: "Traversal no-new-signal attempt budget; traversal behavior.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:745"
  },
  {
    dottedKey: "abg.traversal.modulation.max_total_attempts",
    value: 3,
    leverClass: "tunable",
    valueKind: "count",
    wiring: "deferred",
    reason: "Traversal total attempt budget; traversal behavior.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:746"
  },
  {
    dottedKey: "abg.traversal.modulation.no_progress_class",
    value: "runtime_non_progress",
    leverClass: "tunable",
    valueKind: "string",
    wiring: "deferred",
    reason:
      "Traversal no-progress classification default; traversal behavior.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:765"
  },
  {
    dottedKey: "abg.traversal.modulation.progress_artifact_required",
    value: false,
    leverClass: "tunable",
    valueKind: "flag",
    wiring: "deferred",
    reason:
      "Traversal progress-artifact requirement default; traversal behavior.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:770"
  },

  // ── fixed (structural / derived; surfaced for visibility, no override path)
  {
    dottedKey: "abg.traversal.strategy.default_attr_keys",
    value: Object.freeze(["abg.default_traversal_strategy"]),
    leverClass: "fixed",
    valueKind: "string_list",
    wiring: "deferred",
    reason:
      "Structural attr-key binding for the default traversal strategy; not an operator knob.",
    consumedAt: "abg/m03/contracts/traversal_modulation.ts:55"
  },
  {
    dottedKey: "abg.graph.vector.index_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural vector-index seed (0 = start position), not a tunable.",
    consumedAt: "abg/m03/transport/constructors.ts:30"
  },
  {
    dottedKey: "abg.graph.span.generation_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural reentry-generation seed.",
    consumedAt: "abg/m03/contracts/graph_span_reentry.ts:595"
  },
  {
    dottedKey: "abg.construction.intent.value_score_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural intent value-score seed.",
    consumedAt: "abg/m03/contracts/construction_intent.ts:138"
  },
  {
    dottedKey: "abg.construction.intent.priority_score_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural intent priority-score seed.",
    consumedAt: "abg/m03/contracts/construction_intent.ts:139"
  },
  {
    dottedKey: "abg.construction.priority.boost_weight_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural priority boost-weight seed.",
    consumedAt: "abg/m03/contracts/construction_priority.ts:494"
  },
  {
    dottedKey: "abg.construction.priority.attenuation_weight_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural priority attenuation-weight seed.",
    consumedAt: "abg/m03/contracts/construction_priority.ts:495"
  },
  {
    dottedKey: "abg.construction.observation.severity_seed",
    value: 1,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural observation severity seed (1 = lowest).",
    consumedAt: "abg/m03/contracts/construction_observation.ts:172"
  },
  {
    dottedKey: "abg.saga.frontier.declared_priority_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural saga declared-priority seed.",
    consumedAt: "abg/m03/contracts/saga_frontier.ts:990"
  },
  {
    dottedKey: "abg.saga.frontier.critical_path_cost_seed",
    value: 0,
    leverClass: "fixed",
    valueKind: "count",
    wiring: "deferred",
    reason: "Structural saga critical-path-cost seed.",
    consumedAt: "abg/m03/contracts/saga_frontier.ts:991"
  },
  {
    dottedKey: "abg.saga.frontier.lease_start_ms",
    value: 0,
    leverClass: "fixed",
    valueKind: "ms",
    wiring: "deferred",
    reason: "Structural saga lease-start offset.",
    consumedAt: "abg/m03/runner/saga_frontier_runner.ts:870"
  },
  {
    dottedKey: "abg.saga.frontier.release_start_ms",
    value: 500,
    leverClass: "fixed",
    valueKind: "ms",
    wiring: "deferred",
    reason: "Structural saga release-start offset.",
    consumedAt: "abg/m03/runner/saga_frontier_runner.ts:871"
  },
  {
    dottedKey: "abg.runner.regime.default",
    value: "F_D",
    leverClass: "fixed",
    valueKind: "enum",
    wiring: "deferred",
    reason:
      "Default evaluator regime when a plugin declares none; F_D = deterministic. Not tunable — changing it would reclassify proof authority.",
    consumedAt: "abg/m03/runner/engine_runner.ts:2595"
  },
  {
    dottedKey: "abg.m04.root_mode.when_converged",
    value: "supervised",
    leverClass: "fixed",
    valueKind: "enum",
    wiring: "deferred",
    reason:
      "Derived root_mode rule: converged starts default to supervised. Kept per user; conflicts with REQ-P-POLICY-013 ('direct' default) — flagged, behavior preserved.",
    consumedAt: "app/m04/max_autonomy/admission.ts:55"
  },
  {
    dottedKey: "abg.m04.root_mode.otherwise",
    value: "direct",
    leverClass: "fixed",
    valueKind: "enum",
    wiring: "deferred",
    reason: "Derived root_mode rule: non-converged starts default to direct.",
    consumedAt: "app/m04/max_autonomy/admission.ts:56"
  }
]);

export const LEVER_REGISTRY: ReadonlyMap<string, LeverEntry> = new Map(
  LEVERS.map((entry) => [entry.dottedKey, entry])
);

export function leverEntries(): readonly LeverEntry[] {
  return [...LEVERS].sort((a, b) => a.dottedKey.localeCompare(b.dottedKey));
}

export function getLever(dottedKey: string): LeverEntry | undefined {
  return LEVER_REGISTRY.get(dottedKey);
}

export function tunableKeys(): ReadonlySet<string> {
  return new Set(
    LEVERS.filter((entry) => entry.leverClass === "tunable").map(
      (entry) => entry.dottedKey
    )
  );
}

export function isTunableLever(dottedKey: string): boolean {
  return LEVER_REGISTRY.get(dottedKey)?.leverClass === "tunable";
}
