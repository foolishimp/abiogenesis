import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
export { LEGACY_ROOT_EVENT_CONTRACT_DIGEST } from "./event_contract_profiles.js";
export declare const LEGACY_ROOT_EVENT_KIND_VALUES: readonly ["public_operation_artifact_admitted", "public_operation_admitted", "invocation_admitted", "invocation_refused", "implementation_admitted", "basis_admitted", "declaration_reprice_admitted", "replay_log_attested", "workspace_hygiene_stamped", "defect_intake_admitted", "run_resumed", "run_segment_opened", "graph_call_opened", "frame_opened", "traversal_cursor_entered", "c_call_opened", "c_call_fibre_selected", "actor_transport_binding_admitted", "actor_invocation_started", "actor_process_started", "actor_process_spawn_failed", "actor_process_stdout_observed", "actor_process_stderr_observed", "actor_process_timeout_observed", "actor_process_signal_requested", "actor_process_exited", "actor_process_termination_unconfirmed", "actor_result_artifact_observed", "actor_invocation_closed", "actor_invocation_failed", "c_call_evidenced", "c_call_result_admitted", "c_call_judged", "assessed", "retry_attempt_opened", "retry_progress_recorded", "child_foldback_admitted", "child_preparation_refused", "fan_out_completion_admitted", "traversal_route_admitted", "construction_intent_selected", "construction_delta_observed", "fh_interaction_opened", "fh_interaction_responded", "fh_interaction_resume_admitted", "continuation_abandoned", "continuation_superseded", "continuation_reentry_link_admitted", "runtime_failure_observed", "run_stopped", "terminal_reached", "frame_closed", "graph_call_closed", "run_closed"];
export declare const ROOT_EVENT_KIND_VALUES: readonly ["public_operation_artifact_admitted", "public_operation_admitted", "invocation_admitted", "invocation_refused", "implementation_admitted", "basis_admitted", "declaration_reprice_admitted", "replay_log_attested", "workspace_hygiene_stamped", "defect_intake_admitted", "run_resumed", "run_segment_opened", "graph_call_opened", "frame_opened", "traversal_cursor_entered", "c_call_opened", "c_call_fibre_selected", "actor_transport_binding_admitted", "actor_invocation_started", "actor_process_started", "actor_process_spawn_failed", "actor_process_stdout_observed", "actor_process_stderr_observed", "actor_process_timeout_observed", "actor_process_signal_requested", "actor_process_exited", "actor_process_termination_unconfirmed", "actor_result_artifact_observed", "actor_invocation_closed", "actor_invocation_failed", "c_call_evidenced", "c_call_result_admitted", "c_call_judged", "assessed", "retry_attempt_opened", "retry_progress_recorded", "child_foldback_admitted", "child_preparation_refused", "fan_out_completion_admitted", "traversal_route_admitted", "construction_intent_selected", "construction_delta_observed", "fh_interaction_opened", "fh_interaction_responded", "fh_interaction_resume_admitted", "continuation_abandoned", "continuation_superseded", "continuation_reentry_link_admitted", "runtime_failure_observed", "run_stopped", "terminal_reached", "frame_closed", "graph_call_closed", "run_closed", "construction_continuation_opened", "runtime_activity_probe_observed", "runtime_external_interruption_observed"];
export type RootEventKind = (typeof ROOT_EVENT_KIND_VALUES)[number];
declare const ROOT_EVENT_AGGREGATE_TYPE_VALUES: readonly ["actor_invocation", "c_call", "continuation", "frame", "graph_call", "process", "run", "transport_binding", "workspace"];
type RootEventAggregateType = (typeof ROOT_EVENT_AGGREGATE_TYPE_VALUES)[number];
type RootEventEnvelopeIdentity = "frameId" | "frameLineageId" | "graphCallId" | "graphFunctionRef" | "materializationRef" | "runId";
interface RootEventContractVariant {
    readonly aggregateType: RootEventAggregateType;
    readonly scopeClass: "run" | "workspace";
    readonly requiredEnvelopeIdentities: readonly RootEventEnvelopeIdentity[];
    readonly payloadVariantIndexes?: readonly number[];
}
interface RootEventPayloadVariant {
    readonly requiredPayloadKeys: readonly string[];
    readonly allowedPayloadKeys: readonly string[];
    readonly expectedPayload?: Readonly<Record<string, string>>;
    readonly nullablePayloadKeys?: readonly string[];
}
interface RootEventContract {
    readonly variants: readonly RootEventContractVariant[];
    readonly payloadVariants: readonly RootEventPayloadVariant[];
}
export declare const LEGACY_ROOT_EVENT_CONTRACTS: Readonly<{
    readonly public_operation_artifact_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly public_operation_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly invocation_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly invocation_refused: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly implementation_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly basis_admitted: {
        readonly variants: readonly [RootEventContractVariant, RootEventContractVariant];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly declaration_reprice_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>, Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly replay_log_attested: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>, Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly workspace_hygiene_stamped: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly defect_intake_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly run_resumed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly run_segment_opened: {
        readonly variants: readonly [Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly graph_call_opened: {
        readonly variants: readonly [RootEventContractVariant];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly frame_opened: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly traversal_cursor_entered: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly c_call_opened: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly c_call_fibre_selected: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly actor_transport_binding_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "transport_binding";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly actor_invocation_started: {
        readonly variants: readonly [Readonly<{
            aggregateType: "actor_invocation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_started: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_spawn_failed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_stdout_observed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_stderr_observed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_timeout_observed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly actor_process_signal_requested: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_exited: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_process_termination_unconfirmed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "process";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_result_artifact_observed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "actor_invocation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_invocation_closed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "actor_invocation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly actor_invocation_failed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "actor_invocation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly c_call_evidenced: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly c_call_result_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly c_call_judged: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly assessed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "c_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly retry_attempt_opened: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly retry_progress_recorded: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly child_foldback_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly child_preparation_refused: {
        readonly variants: readonly [RootEventContractVariant, RootEventContractVariant];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly fan_out_completion_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly traversal_route_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly construction_intent_selected: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly construction_delta_observed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly fh_interaction_opened: {
        readonly variants: readonly [Readonly<{
            aggregateType: "continuation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly fh_interaction_responded: {
        readonly variants: readonly [Readonly<{
            aggregateType: "continuation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly fh_interaction_resume_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "continuation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly continuation_abandoned: {
        readonly variants: readonly [Readonly<{
            aggregateType: "continuation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly continuation_superseded: {
        readonly variants: readonly [Readonly<{
            aggregateType: "continuation";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly continuation_reentry_link_admitted: {
        readonly variants: readonly [Readonly<{
            aggregateType: "workspace";
            scopeClass: "workspace";
            requiredEnvelopeIdentities: readonly never[];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly runtime_failure_observed: {
        readonly variants: readonly [RootEventContractVariant, RootEventContractVariant];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly run_stopped: {
        readonly variants: readonly [Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly terminal_reached: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant, RootEventPayloadVariant];
    };
    readonly frame_closed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "frame";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId", "frameId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly graph_call_closed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "graph_call";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId", "graphCallId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
    readonly run_closed: {
        readonly variants: readonly [Readonly<{
            aggregateType: "run";
            scopeClass: "run";
            requiredEnvelopeIdentities: readonly ["runId"];
        }>];
        readonly payloadVariants: readonly [RootEventPayloadVariant];
    };
}>;
export declare const ROOT_EVENT_CONTRACTS: Readonly<Record<RootEventKind, RootEventContract>>;
export declare const ROOT_EVENT_CONTRACT_DESCRIPTOR: JsonValue;
export declare const ROOT_EVENT_CONTRACT_DIGEST: `sha256:${string}`;
export declare function isKnownRootEventContractDigest(value: unknown): value is Sha256Digest;
export interface RuntimeEventCandidate {
    readonly kind: RootEventKind;
    readonly eventTime: string;
    readonly aggregateType: RootEventAggregateType;
    readonly aggregateId: string;
    readonly parentAggregateId: string | null;
    readonly causationEventRefs: readonly string[];
    readonly correlationId: string;
    readonly workflowVersion: "5.0.0";
    readonly scopeClass: "run" | "workspace";
    readonly basisId: string;
    readonly runId?: string;
    readonly graphFunctionRef?: string;
    readonly materializationRef?: string;
    readonly graphCallId?: string;
    readonly frameId?: string;
    readonly frameLineageId?: string;
    readonly payload: JsonValue;
}
export interface RuntimeEvent extends RuntimeEventCandidate {
    /** Absent under exact L; assigned by the native store under P. */
    readonly eventContractDigest?: Sha256Digest;
    readonly eventId: string;
    readonly admissionOrdinal: number;
    readonly payloadDigest: Sha256Digest;
}
export interface EventStoreAppendRefusal {
    readonly kind: "event_store_append_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "prefix_mismatch" | "sink_unavailable";
    readonly message: string;
}
export type CheckedArtifactAppendResult = EventStoreAppendRefusal | Readonly<{
    event: RuntimeEvent;
    successorPrefix: DurablePrefixCoordinate;
}>;
export interface RuntimeEventScope {
    readonly invocationRef?: string;
    readonly runId?: string;
}
export type RuntimeEventCandidateFactory = (admittedInBatch: readonly RuntimeEvent[]) => RuntimeEventCandidate;
export interface EventStoreReopenAuthority {
    readonly kind: "event_store_reopen_authority";
    readonly schemaVersion: "5.0.0";
    readonly eventLogPath: string;
    readonly device: number;
    readonly inode: number;
    readonly eventLogDigest: Sha256Digest;
    readonly durableByteLength: number;
    readonly eventContractDigest: Sha256Digest;
    readonly authorityDigest: Sha256Digest;
}
export interface DurablePrefixCoordinate {
    readonly kind: "durable_prefix_coordinate";
    readonly schemaVersion: "5.0.0";
    readonly eventLogRef: string;
    readonly prefixLength: number;
    readonly prefixDigest: Sha256Digest;
    readonly storeIdentity: {
        readonly device: number;
        readonly inode: number;
        readonly eventContractDigest: Sha256Digest;
    };
    readonly coordinateDigest: Sha256Digest;
}
export type DurablePrefixReadFailureCode = "file_identity_mismatch" | "prefix_length_mismatch" | "prefix_digest_mismatch" | "event_contract_digest_mismatch" | "event_envelope_invalid" | "admission_ordinal_invalid";
export declare class DurablePrefixReadError extends TypeError {
    readonly code: DurablePrefixReadFailureCode;
    constructor(code: DurablePrefixReadFailureCode, message: string);
}
export interface NewEmptyAppendSinkRequest {
    readonly kind: "new_empty_append_sink_request";
    readonly schemaVersion: "5.0.0";
    readonly eventLogPath: string;
}
export interface EventStoreAcquisitionRefusal {
    readonly kind: "event_store_acquisition_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_mismatch" | "sink_exists" | "sink_unavailable";
    readonly message: string;
}
export interface NewEmptyAppendSinkContext {
    readonly store: AbgEventStore;
    readonly prefix: DurablePrefixCoordinate;
}
export type NewEmptyAppendSinkResult = EventStoreAcquisitionRefusal | NewEmptyAppendSinkContext;
export interface EventStoreCloseHandoff {
    readonly prefix: DurablePrefixCoordinate;
    readonly reopenAuthority: EventStoreReopenAuthority;
}
export interface ReopenedEventStoreContext {
    readonly kind: "reopened_event_store_context";
    readonly schemaVersion: "5.0.0";
    readonly eventLogPath: string;
    readonly eventLogDigest: Sha256Digest;
    readonly eventContractDigest: Sha256Digest;
    readonly historicalEventCount: number;
    readonly maxAdmissionOrdinal: number;
    readonly nextAdmissionOrdinal: number;
    readonly store: AbgEventStore;
    readonly prefix: DurablePrefixCoordinate;
}
export interface EventStoreReopenRefusal {
    readonly kind: "event_store_reopen_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_mismatch" | "contract_mismatch" | "durable_log_mismatch" | "invalid_event_history" | "sink_unavailable";
    readonly message: string;
}
export type EventStoreReopenResult = EventStoreReopenRefusal | ReopenedEventStoreContext;
/** Internal physical-coordinate relation. Pure in-memory histories retain their
 * existing all-inline representation; mixed/unrelated physical provenance refuses. */
export declare function runtimeEventPhysicalPrefix(events: readonly RuntimeEvent[]): Readonly<{
    byteLength: number;
    digest: Sha256Digest;
}>;
export declare function selectRuntimeEvents(events: readonly RuntimeEvent[], scope?: RuntimeEventScope): readonly RuntimeEvent[];
/** Capture caller data; only the exact immutable owner coordinate keeps its
 * disposable derivation. Copies/getters are ordinary cold coordinates. */
export declare function captureDurablePrefixCoordinate(prefix: DurablePrefixCoordinate): DurablePrefixCoordinate;
/** Reidentify a serialized historical cut only through a coordinate previously
 * authenticated by this owner's exact history. Ordinals alone confer nothing.
 * The active owner supplies known cuts; unbound/closed reads reconstruct cold. */
export declare function reidentifyHistoricalDurablePrefixCoordinate(current: DurablePrefixCoordinate, historical: DurablePrefixCoordinate): DurablePrefixCoordinate;
/** Derive a historical coordinate from this resource's decoded physical rows.
 * A logical serialization is never substituted for compressed physical bytes. */
export declare function durableRuntimeEventPrefixThroughEvent(current: DurablePrefixCoordinate, eventRef: string): DurablePrefixCoordinate;
export declare function validateDurablePrefixCoordinate(value: unknown): value is DurablePrefixCoordinate;
export declare function validateEventStoreReopenAuthority(value: unknown): value is EventStoreReopenAuthority;
export declare function validateEventStoreCloseHandoff(value: unknown): value is EventStoreCloseHandoff;
/** Active ownership preserves the admitted byte correspondence. Outside that
 * session, reacquire the physical resource before relying on its coordinate. */
export declare function assertDurableRuntimePrefixBytes(prefix: DurablePrefixCoordinate): void;
/** Currentness of an already authenticated source, not byte/event admission.
 * The caller must retain its actual acquisition. Under the trusted-desktop
 * boundary, unchanged prior bytes are not rehashed to detect hostile mutation. */
export declare function assertDurableRuntimePrefixCurrent(prefix: DurablePrefixCoordinate): void;
/** Pure derivation of the already authenticated immutable owner value. A copied
 * coordinate has no receipt and performs the ordinary cold physical read.
 * Acquisition, held mutation and explicit freshness use the readers below. */
export declare function projectRuntimeEventsAtDurablePrefix(prefix: DurablePrefixCoordinate): readonly RuntimeEvent[];
export declare function readRuntimeEventsAtDurablePrefix(prefix: DurablePrefixCoordinate, options?: Readonly<{
    requireCurrent?: boolean;
}>): readonly RuntimeEvent[];
/** Digest of the expanded all-inline serialization, not compressed physical provenance. */
export declare function durableRuntimeEventPrefixDigest(events: readonly RuntimeEvent[]): Sha256Digest;
export declare function assertHeldEventStoreAtDurablePrefix(store: AbgEventStore, prefix: DurablePrefixCoordinate): void;
export declare function projectHeldRuntimeEventsAtDurablePrefix(store: AbgEventStore, prefix: DurablePrefixCoordinate): readonly RuntimeEvent[];
export declare function readHeldRuntimeEventsAtDurablePrefix(store: AbgEventStore, prefix: DurablePrefixCoordinate): readonly RuntimeEvent[];
export declare function selectHeldEventStoreDurablePrefix(store: AbgEventStore): DurablePrefixCoordinate;
export declare function projectRuntimeEventFromValidatedHistory(events: readonly RuntimeEvent[], candidate: RuntimeEventCandidate): RuntimeEvent;
declare const EVENT_STORE_CONSTRUCTION_AUTHORITY: unique symbol;
export declare class AbgEventStore {
    constructor(authority: typeof EVENT_STORE_CONSTRUCTION_AUTHORITY);
    readAll(): readonly RuntimeEvent[];
    readScope(scope: RuntimeEventScope): readonly RuntimeEvent[];
    digest(scope?: RuntimeEventScope): Sha256Digest;
    configuredDurableLogPath(): string | null;
    closeDurableLog(): void;
    projectReopenAuthorityAndClose(): EventStoreCloseHandoff;
}
/** Bind the owner's committed history to its unchanged reopen carrier, then
 * release ownership. A later reopen independently validates persisted bytes. */
export declare function closeHeldEventStoreAtDurablePrefix(store: AbgEventStore, expectedPrefix: DurablePrefixCoordinate): EventStoreCloseHandoff;
export declare function createNewEmptyAppendSink(request: NewEmptyAppendSinkRequest): NewEmptyAppendSinkResult;
export declare function isEventStoreAdmissionOpen(store: AbgEventStore): boolean;
export declare function validateHistoricalEvents(bytes: Uint8Array, expectedProfileDigest?: Sha256Digest): readonly RuntimeEvent[];
export interface RootEventProfileSchedule {
    readonly kind: "root_event_profile_schedule";
    readonly schemaVersion: "5.0.0";
    readonly spans: readonly Readonly<{
        eventContractDigest: Sha256Digest;
        firstOrdinal: number;
        lastOrdinal: number;
    }>[];
    readonly boundaryEventRef: string | null;
    readonly currentEventContractDigest: Sha256Digest;
}
/** Existing witnessed-reprice owner ingress; no generic append of a profile marker. */
export declare function admitRootEventProfileUpgrade(store: AbgEventStore, entryPrefix: DurablePrefixCoordinate, publicCandidate: RuntimeEventCandidate, repriceCandidate: RuntimeEventCandidate): NonEmptyRuntimeEventTransactionResult<Readonly<{
    publicOperationEvent: RuntimeEvent;
    admittedEvent: RuntimeEvent;
}>>;
/** Complete history only; a scoped view retains this schedule through its nominal prefix. */
export declare function projectRootEventProfileSchedule(events: readonly RuntimeEvent[], emptyProfileDigest?: Sha256Digest): RootEventProfileSchedule;
/** Owner-local continuation of a profile projection already bound to this
 * immutable source. Raw acquisition always starts at ordinal zero above. */
export declare function extendRootEventProfileProjection(events: readonly RuntimeEvent[], start: number, prior: RootEventProfileSchedule): RootEventProfileSchedule;
/** Read-only ancestry, never append authority. Active ownership supplies known cuts; otherwise reconstruct cold. */
export declare function authenticateRuntimePrefixAncestry(historical: DurablePrefixCoordinate, current: DurablePrefixCoordinate): boolean;
export type InterruptedEventStoreSelection = Readonly<{
    expectedCurrent: Readonly<{
        byteLength: number;
        digest: Sha256Digest;
    }>;
    ownerPid: number;
}> & (Readonly<{
    lastCloseHandoff: EventStoreCloseHandoff;
}> | Readonly<{
    initialOrigin: Readonly<{
        newResourceRequest: NewEmptyAppendSinkRequest;
        device: number;
        inode: number;
    }>;
}>) & (Readonly<{
    abandonedLock: Readonly<{
        path: string;
        device: number;
        inode: number;
        bytesBase64: string;
        digest: Sha256Digest;
    }>;
}> | Readonly<{
    recoveryCase: "lock_absent";
    lockPath: string;
}>);
export type InterruptedEventStoreRecovery = Readonly<{
    kind: "recovered";
    closeHandoff: EventStoreCloseHandoff;
    validatedEventCount: number;
}> | Readonly<{
    kind: "refused_no_recovery";
    code: string;
    message: string;
    cleanupErrors: readonly string[];
}> | Readonly<{
    kind: "recovery_fault";
    code: "close_failed" | "cleanup_failed";
    message: string;
    residue: Readonly<{
        logDescriptor: "open" | "closed" | "unknown";
        lockDescriptor: "open" | "closed" | "unknown";
        lockPath: "selected_lock_retained" | "absent" | "other_or_unknown";
        cleanupErrors: readonly string[];
    }>;
}>;
/** Native physical maintenance only. The resource owner validates external approval first.
 * One trusted operator excludes competing writers/recovery; the abandoned lock stays present
 * until ordinary close releases its exact identity. No event or lifecycle act is admitted. */
export declare function recoverInterruptedEventStore(selection: InterruptedEventStoreSelection): InterruptedEventStoreRecovery;
export declare function reopenEventStore(authority: unknown): EventStoreReopenResult;
export declare function admitRuntimeEvent(store: AbgEventStore, candidate: RuntimeEventCandidate): RuntimeEvent;
/** Fixed native probe/threshold ingress, not an arbitrary validator hook. */
export declare function admitNativeRuntimeLivenessEvent(store: AbgEventStore, candidate: RuntimeEventCandidate): RuntimeEvent;
export declare function appendCheckedArtifactEvent(store: AbgEventStore, expectedPredecessor: DurablePrefixCoordinate, initiatedEvent: RuntimeEventCandidate & Readonly<{
    kind: "public_operation_artifact_admitted";
}>): CheckedArtifactAppendResult;
export declare function admitRuntimeEventBatch(store: AbgEventStore, factories: readonly RuntimeEventCandidateFactory[]): readonly RuntimeEvent[];
export interface RuntimeEventTransactionResult<T> {
    readonly value: T;
    readonly successorPrefix: DurablePrefixCoordinate | null;
}
export interface NonEmptyRuntimeEventTransactionResult<T> {
    readonly value: T;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export declare function admitRuntimeEventTransaction<T>(store: AbgEventStore, action: () => T): T;
export declare function admitRuntimeEventTransactionAtExpectedPrefix<T>(store: AbgEventStore, expectedPrefixDigest: Sha256Digest, action: () => T): RuntimeEventTransactionResult<T>;
/**
 * The only cross-owner transaction ingress. The durable coordinate is the
 * caller's authority; ABG alone translates it to the in-memory event digest
 * used by its transaction guard.
 */
export declare function admitRuntimeEventTransactionAtDurablePrefix<T>(store: AbgEventStore, expectedPredecessor: DurablePrefixCoordinate, action: () => T): RuntimeEventTransactionResult<T>;
/**
 * Admits at least one event at an exact durable predecessor. Receipt validation
 * belongs inside `action`; once this returns, the successor is non-null by
 * construction and callers may only attach it to the completed receipt body.
 */
export declare function admitNonEmptyRuntimeEventTransactionAtDurablePrefix<T>(store: AbgEventStore, expectedPredecessor: DurablePrefixCoordinate, action: () => T): NonEmptyRuntimeEventTransactionResult<T>;
/** Pure staged projection preserves its checked durable predecessor. Only
 * successful owned publication advances the committed history. */
export declare function readActiveRuntimeTransactionAtDurablePrefix(store: AbgEventStore, prefix: DurablePrefixCoordinate, options?: Readonly<{
    durableOnly?: boolean;
}>): readonly RuntimeEvent[];
export declare function assertRuntimeEventTransactionActive(store: AbgEventStore): void;
export declare function isRuntimeEventTransactionActive(store: AbgEventStore): boolean;
export declare function compareAndAppendExpectedPrefix(store: AbgEventStore, expectedPrefixDigest: Sha256Digest, factories: readonly RuntimeEventCandidateFactory[]): readonly RuntimeEvent[];
