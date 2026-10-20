import { type WorksiteObservation } from "../product/worksite_effect.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { RootEventKind, RuntimeEvent } from "./event_store.js";
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
export type RetryFluentName = "retry_attempt_active" | "retry_progress_available";
export interface RetryFluentIdentityCoordinates {
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly retryBoundaryRef: string;
    readonly authorityRef: string;
}
export declare function constructRetryFluentIdentity(name: RetryFluentName, coordinates: RetryFluentIdentityCoordinates): string;
export declare function constructScopedRetryFluent(name: RetryFluentName, coordinates: RetryFluentIdentityCoordinates): RuntimeFluent;
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
export declare const ROOT_EVENT_CALCULUS: Readonly<{
    readonly public_operation_artifact_admitted: {
        readonly initiates: readonly ["public_operation_artifact_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly public_operation_admitted: {
        readonly initiates: readonly ["public_operation_ingress_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly invocation_admitted: {
        readonly initiates: readonly ["invocation_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly invocation_refused: {
        readonly initiates: readonly ["invocation_refused"];
        readonly terminates: readonly ["invocation_admitted"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly implementation_admitted: {
        readonly initiates: readonly ["implementation_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly basis_admitted: {
        readonly initiates: readonly ["basis_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly declaration_reprice_admitted: {
        readonly initiates: readonly ["declaration_reprice_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly replay_log_attested: {
        readonly initiates: readonly ["replay_log_attested"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly workspace_hygiene_stamped: {
        readonly initiates: readonly ["workspace_hygiene_stamped"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly defect_intake_admitted: {
        readonly initiates: readonly ["defect_intake_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly run_resumed: {
        readonly initiates: readonly ["run_active"];
        readonly terminates: readonly ["operator_run_stopped"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly run_segment_opened: {
        readonly initiates: readonly ["run_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly graph_call_opened: {
        readonly initiates: readonly ["graph_call_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly frame_opened: {
        readonly initiates: readonly ["frame_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly traversal_cursor_entered: {
        readonly initiates: readonly ["locus_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly c_call_opened: {
        readonly initiates: readonly ["c_call_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly c_call_fibre_selected: {
        readonly initiates: readonly ["c_call_fibre_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_transport_binding_admitted: {
        readonly initiates: readonly ["actor_transport_binding_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_invocation_started: {
        readonly initiates: readonly ["actor_invocation_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_started: {
        readonly initiates: readonly ["actor_process_active", "actor_process_live"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_spawn_failed: {
        readonly initiates: readonly ["actor_process_spawn_failed"];
        readonly terminates: readonly ["actor_process_active", "actor_process_live"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_stdout_observed: {
        readonly initiates: readonly ["actor_process_live", "actor_stdout_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_stderr_observed: {
        readonly initiates: readonly ["actor_process_live", "actor_stderr_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_timeout_observed: {
        readonly initiates: readonly ["actor_process_timed_out"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly runtime_activity_probe_observed: {
        readonly initiates: readonly ["runtime_activity_recent", "runtime_invocation_active"];
        readonly terminates: readonly ["runtime_invocation_active"];
        readonly clips: readonly ["runtime_inactivity_asserted"];
        readonly declips: readonly [];
    };
    readonly runtime_external_interruption_observed: {
        readonly initiates: readonly ["runtime_externally_interrupted", "runtime_invocation_blocked"];
        readonly terminates: readonly ["runtime_invocation_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_signal_requested: {
        readonly initiates: readonly ["actor_process_signal_requested"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_exited: {
        readonly initiates: readonly ["actor_process_exited"];
        readonly terminates: readonly ["actor_process_active", "actor_process_live"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_process_termination_unconfirmed: {
        readonly initiates: readonly ["actor_process_termination_unconfirmed", "actor_cleanup_live", "actor_cleanup_pending"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_result_artifact_observed: {
        readonly initiates: readonly ["actor_result_artifact_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_invocation_closed: {
        readonly initiates: readonly ["actor_invocation_closed"];
        readonly terminates: readonly ["actor_invocation_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly actor_invocation_failed: {
        readonly initiates: readonly ["actor_invocation_failed"];
        readonly terminates: readonly ["actor_invocation_active", "actor_process_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly c_call_evidenced: {
        readonly initiates: readonly ["c_call_evidence_available"];
        readonly terminates: readonly ["c_call_fibre_admitted"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly c_call_result_admitted: {
        readonly initiates: readonly ["c_call_result_available"];
        readonly terminates: readonly ["c_call_evidence_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly c_call_judged: {
        readonly initiates: readonly ["c_call_judgment_available"];
        readonly terminates: readonly ["c_call_active", "c_call_result_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly assessed: {
        readonly initiates: readonly ["result_assessment_admitted"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly retry_attempt_opened: {
        readonly initiates: readonly ["retry_attempt_active"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly retry_progress_recorded: {
        readonly initiates: readonly ["retry_progress_available"];
        readonly terminates: readonly ["retry_attempt_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly child_foldback_admitted: {
        readonly initiates: readonly ["child_foldback_available"];
        readonly terminates: readonly ["parent_waiting_on_child"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly child_preparation_refused: {
        readonly initiates: readonly ["child_preparation_refused"];
        readonly terminates: readonly ["parent_waiting_on_child"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly fan_out_completion_admitted: {
        readonly initiates: readonly ["fan_out_completion_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly traversal_route_admitted: {
        readonly initiates: readonly [];
        readonly terminates: readonly ["locus_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly construction_continuation_opened: {
        readonly initiates: readonly ["continuation_open"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly construction_intent_selected: {
        readonly initiates: readonly ["construction_intent_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly construction_delta_observed: {
        readonly initiates: readonly [];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly fh_interaction_opened: {
        readonly initiates: readonly ["continuation_open", "interaction_pending", "frame_held"];
        readonly terminates: readonly ["hold_route_admitted"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly fh_interaction_responded: {
        readonly initiates: readonly ["continuation_response_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly fh_interaction_resume_admitted: {
        readonly initiates: readonly ["continuation_terminated", "frame_active", "locus_active"];
        readonly terminates: readonly ["continuation_open", "interaction_pending", "continuation_response_available", "frame_held"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly continuation_abandoned: {
        readonly initiates: readonly ["continuation_abandoned"];
        readonly terminates: readonly ["continuation_open", "interaction_pending", "continuation_response_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly continuation_superseded: {
        readonly initiates: readonly ["continuation_superseded"];
        readonly terminates: readonly ["continuation_open", "interaction_pending", "continuation_response_available", "construction_intent_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly continuation_reentry_link_admitted: {
        readonly initiates: readonly ["continuation_reentry_link_available"];
        readonly terminates: readonly [];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly runtime_failure_observed: {
        readonly initiates: readonly ["runtime_failure"];
        readonly terminates: readonly ["locus_active", "frame_active", "runtime_invocation_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly run_stopped: {
        readonly initiates: readonly ["run_terminal"];
        readonly terminates: readonly ["locus_active", "frame_active", "frame_blocked", "frame_failed", "graph_call_active", "run_active", "retry_attempt_active", "retry_progress_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly terminal_reached: {
        readonly initiates: readonly ["terminal_admitted"];
        readonly terminates: readonly ["terminal_route_available"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly frame_closed: {
        readonly initiates: readonly ["frame_closed"];
        readonly terminates: readonly ["frame_active", "runtime_invocation_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly graph_call_closed: {
        readonly initiates: readonly ["graph_call_closed"];
        readonly terminates: readonly ["graph_call_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
    readonly run_closed: {
        readonly initiates: readonly ["run_closed"];
        readonly terminates: readonly ["locus_active", "run_active"];
        readonly clips: readonly [];
        readonly declips: readonly [];
    };
}>;
/** The C0 mutable-worksite currentness fluent has one observation identity. */
export declare function constructWorksiteObservationCurrentFluent(observationRef: string): RuntimeFluent;
export declare function projectWorksiteTransitionForResult(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[]): Readonly<{
    before: string;
    after: string | null;
    successorObservation: WorksiteObservation | null;
}> | null;
/** Known native changes retire exact paths; unknown after-state retires the
 * declared writable scope. Neither case manufactures C0 provenance or successors. */
export declare function projectNativeWorkRetiredObservations(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[]): readonly string[];
export declare function declaredRuntimeEventCalculusTerminationNames(event: Pick<RuntimeEvent, "kind" | "payload">): readonly string[];
export declare function constructRuntimeFluent(input: RuntimeFluentInput): RuntimeFluent;
export declare function constructRuntimeFluentPattern(input: RuntimeFluentPatternInput): RuntimeFluentPattern;
export declare function runtimeFluentKey(fluent: RuntimeFluent): string;
export declare function runtimeFluentPatternKey(pattern: RuntimeFluentPattern): string;
export declare function runtimeFluentMatchesPattern(fluent: RuntimeFluent, pattern: RuntimeFluentPattern): boolean;
export declare function validateRuntimeEventCalculusEffectForModuleTest(effect: EventCalculusEffect): EventCalculusEffect;
export declare function validateRuntimeEventCalculusAxiomKindsForModuleTest(eventKinds: readonly RootEventKind[]): void;
export declare function eventCalculusEffect(eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">, priorEvents?: readonly RuntimeEvent[]): EventCalculusEffect;
export declare function constructRunActiveFluent(runId: string): RuntimeFluent;
export declare function constructRunClosedFluent(runId: string): RuntimeFluent;
export declare function constructRunTerminalFluent(runId: string): RuntimeFluent;
export declare function deriveRuntimeEventCalculusProjection(prefix: ValidatedRuntimeEventPrefix): RuntimeEventCalculusProjection;
/** Select the required owner effects without materializing every effect row. */
export declare function runtimeEventCalculusEffectsByKind(prefix: ValidatedRuntimeEventPrefix, kind: RuntimeEvent["kind"]): readonly RuntimeEventCalculusEffectRow[];
/** Exact historical availability without manufacturing a historical projection. */
export declare function runtimeFluentHoldsAtPrefix(prefix: ValidatedRuntimeEventPrefix, fluent: RuntimeFluent, ordinal?: number): boolean;
export declare function holdsAt(projection: RuntimeEventCalculusProjection, fluent: RuntimeFluent): boolean;
