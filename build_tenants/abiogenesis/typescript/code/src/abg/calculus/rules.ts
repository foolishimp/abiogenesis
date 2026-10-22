// The rule table: every contextual Event Calculus effect. Each derive reads
// the fold state before the event and the event; none reads its dependencies.
// The table is a module constant; no caller supplies a rule.
import { isRecord } from "../../shared/admit/index.js";
import type { RuntimeEventPrefix } from "../event_prefix.js";
import { ROOT_EVENT_CONTRACT_DIGEST, type RuntimeEvent } from "../event_store.js";
import { createRuntimeLivenessEventValidator } from "../runtime_liveness.js";
import {
  constructRuntimeFluent,
  stringField,
  type EventCalculusEffect,
  type RuntimeFluent,
} from "./axioms.js";
import type { FoldState } from "./fold.js";

export interface DerivedEffectRule {
  readonly ruleRef: string;
  readonly appliesTo: readonly RuntimeEvent["kind"][];
  readonly derive: (state: FoldState, event: RuntimeEvent, dependencies: readonly RuntimeEvent[]) => EventCalculusEffect;
}

const NO_EFFECT: EventCalculusEffect = Object.freeze({
  initiates: Object.freeze([]), terminates: Object.freeze([]), clips: Object.freeze([]), declips: Object.freeze([]),
});

function effect(initiates: readonly RuntimeFluent[], terminates: readonly RuntimeFluent[]): EventCalculusEffect {
  return { initiates, terminates, clips: [], declips: [] };
}

function processFluent(name: string, processRef: string): RuntimeFluent {
  return constructRuntimeFluent({ name, identity: processRef });
}

function held(state: FoldState, name: string, identity: string): boolean {
  return state.holds.has(processFluent(name, identity).fluentRef);
}

/** R: the Run terminal that starts process cleanup for its Run. */
function isRunCleanupTerminal(event: RuntimeEvent): boolean {
  return event.kind === "run_stopped" ||
    (event.kind === "runtime_failure_observed" && event.aggregateType === "run");
}

/** The terminal Run census: cleanup liveness for every live process and the
 * end of the Run-scoped active fluents. A preserving operator stop ends Run
 * activity, not its unresolved F_H obligation. */
function deriveTerminalRunCensus(state: FoldState, event: RuntimeEvent): EventCalculusEffect {
  const cleanupTerminalEvent = isRunCleanupTerminal(event);
  const preservesHeldObligation = event.kind === "run_stopped" &&
    (stringField(event, "reasonKind") === "operator_stop" ||
      stringField(event, "reasonKind") === "external_interruption");
  const holding = [...state.holds.values()];
  return effect(
    cleanupTerminalEvent
      ? holding.filter((candidate) => candidate.name === "actor_process_live" && candidate.identity !== null)
        .map((candidate) => processFluent("actor_cleanup_live", candidate.identity!))
      : [],
    holding.filter((candidate) =>
      (
        (
          cleanupTerminalEvent &&
          (
            candidate.name === "actor_invocation_active" ||
            candidate.name === "runtime_invocation_active" ||
            candidate.name === "actor_process_active" ||
            candidate.name === "c_call_active" ||
            (!preservesHeldObligation && (
              candidate.name === "continuation_open" ||
              candidate.name === "continuation_response_available" ||
              candidate.name === "frame_held" ||
              candidate.name === "interaction_pending"
            )) ||
            candidate.name === "parent_waiting_on_child" ||
            candidate.name === "retry_attempt_active" ||
            candidate.name === "retry_progress_available"
          )
        ) || candidate.name === "locus_active"
      ) &&
      state.contextualFluentRunIds.get(candidate.fluentRef) === event.runId
    ),
  );
}

/** Per-process cleanup: a process terminal or an actor terminal ends cleanup
 * liveness; an actor terminal ends the actor's probe-scoped activity. */
function deriveProcessCleanup(state: FoldState, event: RuntimeEvent): EventCalculusEffect {
  const processRef = stringField(event, "processRef");
  if (processRef === null) return NO_EFFECT;
  const actorTerminal = event.kind === "actor_invocation_closed" || event.kind === "actor_invocation_failed";
  return effect([], [
    ...(event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST && actorTerminal
      ? [...state.holds.values()].filter((fluent) => fluent.name === "runtime_invocation_active" &&
          (state.actorProbeScopes.get(event.aggregateId)?.has(fluent.identity ?? "") ?? false))
      : []),
    processFluent("actor_cleanup_live", processRef),
  ]);
}

const LIVENESS_VALIDATORS = new WeakMap<RuntimeEventPrefix, (event: RuntimeEvent) => boolean>();

/** Liveness: a native probe, interruption or timeout has its exact admitted
 * source and threshold relation. It derives no fluent; a missing relation is
 * a defect. */
function deriveLiveness(state: FoldState, event: RuntimeEvent): EventCalculusEffect {
  if (event.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return NO_EFFECT;
  const source = state.source;
  let validate = source === null ? undefined : LIVENESS_VALIDATORS.get(source);
  if (source !== null && validate === undefined) {
    validate = createRuntimeLivenessEventValidator(source);
    LIVENESS_VALIDATORS.set(source, validate);
  }
  if (validate === undefined || !validate(event)) {
    throw new TypeError("native liveness effect has no exact admitted source/threshold relation");
  }
  return NO_EFFECT;
}

/** The Actor, Process and Run lifecycle of one process, from admitted events:
 *   processLive            = S and not T
 *   terminationUnconfirmed = not T and U
 *   cleanupPending         = not A and (T or U or (R and formerlyActiveActor))
 * S actor_process_started; T actor_process_exited or actor_process_spawn_failed;
 * U actor_process_termination_unconfirmed; G actor_process_signal_requested;
 * O actor_process_timeout_observed; A actor_invocation_closed or
 * actor_invocation_failed; R the matching Run's terminal. A process is in R's
 * census when actor_process_live or actor_process_active held for it in that
 * Run when R was admitted. actor_process_terminated(processRef) holds from an
 * actor_process_exited preceded by the process start.
 * G and O carry the facts of later derivations; they
 * derive no fluent here. The copied terminationConfirmed is a checked input
 * (D5, checkTerminationConfirmedCopy). Every input is read from the state
 * before the event. */
function deriveActorProcessLifecycle(state: FoldState, event: RuntimeEvent): EventCalculusEffect {
  const processTerminal = (processRef: string) =>
    held(state, "actor_process_exited", processRef) || held(state, "actor_process_spawn_failed", processRef);
  const actorTerminal = () => {
    const actorRef = stringField(event, "actorInvocationRef") ?? event.parentAggregateId ?? null;
    return actorRef !== null &&
      (held(state, "actor_invocation_closed", actorRef) || held(state, "actor_invocation_failed", actorRef));
  };
  switch (event.kind) {
    case "actor_process_started":
      return processTerminal(event.aggregateId) ? NO_EFFECT
        : effect([processFluent("actor_process_live", event.aggregateId)], []);
    case "actor_process_exited":
    case "actor_process_spawn_failed": {
      const processRef = event.aggregateId;
      const started = held(state, "actor_process_live", processRef);
      const unconfirmed = held(state, "actor_process_termination_unconfirmed", processRef);
      return effect([
        ...(event.kind === "actor_process_exited" && started
          ? [processFluent("actor_process_terminated", processRef)] : []),
        ...(actorTerminal() ? [] : [processFluent("actor_cleanup_pending", processRef)]),
      ], [
        processFluent("actor_process_live", processRef),
        ...(unconfirmed ? [processFluent("actor_process_termination_unconfirmed", processRef)] : []),
      ]);
    }
    case "actor_process_termination_unconfirmed": {
      const processRef = event.aggregateId;
      return effect([
        ...(processTerminal(processRef) ? [] : [processFluent("actor_process_termination_unconfirmed", processRef)]),
        ...(actorTerminal() ? [] : [processFluent("actor_cleanup_pending", processRef)]),
      ], []);
    }
    case "actor_invocation_closed":
    case "actor_invocation_failed": {
      const processRef = stringField(event, "processRef");
      return processRef === null ? NO_EFFECT : effect([], [processFluent("actor_cleanup_pending", processRef)]);
    }
    case "actor_result_artifact_observed":
    case "c_call_evidenced":
      return checkTerminationConfirmedCopy(state, event);
    case "run_stopped":
    case "runtime_failure_observed": {
      if (!isRunCleanupTerminal(event) || event.runId === undefined) return NO_EFFECT;
      const census = new Set<string>();
      for (const fluent of state.holds.values()) {
        if ((fluent.name === "actor_process_live" || fluent.name === "actor_process_active") &&
            fluent.identity !== null && state.contextualFluentRunIds.get(fluent.fluentRef) === event.runId) {
          census.add(fluent.identity);
        }
      }
      return effect([...census].map((processRef) => processFluent("actor_cleanup_pending", processRef)), []);
    }
    default:
      return NO_EFFECT;
  }
}

/** D5: the copied terminationConfirmed in actor_result_artifact_observed and
 * in probabilistic_transport c_call_evidenced is checked against
 * actor_process_terminated(processRef) at the cut before the copy's event.
 * The fluent wins: a disagreement initiates the diagnostic fluent
 * terminationConfirmed_copy_disagrees(processRef), and no prefix is refused.
 * An event without the copy or its process reference derives nothing. */
function checkTerminationConfirmedCopy(state: FoldState, event: RuntimeEvent): EventCalculusEffect {
  if (!isRecord(event.payload)) return NO_EFFECT;
  if (event.kind === "c_call_evidenced" && event.payload.evidenceClass !== "probabilistic_transport") return NO_EFFECT;
  const processRef = stringField(event, "processRef");
  const copy = event.payload.terminationConfirmed;
  if (processRef === null || processRef.length === 0 || typeof copy !== "boolean") return NO_EFFECT;
  return copy === held(state, "actor_process_terminated", processRef) ? NO_EFFECT
    : effect([processFluent("terminationConfirmed_copy_disagrees", processRef)], []);
}

export const ROOT_DERIVED_RULES: readonly DerivedEffectRule[] = Object.freeze([
  Object.freeze({
    ruleRef: "terminal_run_census",
    appliesTo: Object.freeze(["runtime_failure_observed", "run_stopped", "run_closed"] as const),
    derive: deriveTerminalRunCensus,
  }),
  Object.freeze({
    ruleRef: "process_cleanup",
    appliesTo: Object.freeze(["actor_process_exited", "actor_process_spawn_failed",
      "actor_invocation_closed", "actor_invocation_failed"] as const),
    derive: deriveProcessCleanup,
  }),
  Object.freeze({
    ruleRef: "liveness",
    appliesTo: Object.freeze(["runtime_activity_probe_observed", "runtime_external_interruption_observed",
      "actor_process_timeout_observed"] as const),
    derive: deriveLiveness,
  }),
  Object.freeze({
    ruleRef: "actor_process_lifecycle",
    appliesTo: Object.freeze(["actor_process_started", "actor_process_exited", "actor_process_spawn_failed",
      "actor_process_termination_unconfirmed", "actor_process_signal_requested", "actor_process_timeout_observed",
      "actor_invocation_closed", "actor_invocation_failed", "run_stopped", "runtime_failure_observed",
      "actor_result_artifact_observed", "c_call_evidenced"] as const),
    derive: deriveActorProcessLifecycle,
  }),
]);
